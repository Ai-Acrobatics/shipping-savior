import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { encode } from 'next-auth/jwt';
import { db } from '@/lib/db';
import { users, orgMembers } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { writeAuditLog } from '@/lib/auth/audit';
import { sessionCookieName, MOBILE_SESSION_MAX_AGE } from '@/lib/auth/mobile';

const SESSION_MAX_AGE = MOBILE_SESSION_MAX_AGE;

// ── Rate limiting (same in-memory pattern as /api/ai/chat) ──────────────────
// 10 attempts per IP per 5 minutes — generous for real users, hostile to
// credential stuffing. Serverless instances each hold their own map, which is
// fine: the goal is slowing bulk attempts, not perfect global accounting.
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 5 * 60_000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count++;
  return true;
}

// POST /api/mobile/auth/login — credentials login for the native mobile app.
// Returns a NextAuth-compatible session JWT that the client must send on every
// request as `Cookie: <cookieName>=<token>`. Mirrors the Credentials provider
// in src/lib/auth/config.ts (same checks, same audit trail, same JWT claims).
export async function POST(request: Request) {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: 'Server auth is not configured' },
      { status: 500 }
    );
  }

  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: 'Too many login attempts. Try again in a few minutes.' },
      { status: 429 }
    );
  }

  let email: string | undefined;
  let password: string | undefined;
  try {
    const body = await request.json();
    email = typeof body.email === 'string' ? body.email : undefined;
    password = typeof body.password === 'string' ? body.password : undefined;
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!email || !password) {
    return NextResponse.json(
      { error: 'Email and password are required' },
      { status: 400 }
    );
  }

  const normalizedEmail = email.toLowerCase().trim();

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, normalizedEmail))
    .limit(1);

  if (!user) {
    writeAuditLog({
      action: 'failed_login',
      metadata: { email: normalizedEmail, reason: 'user_not_found', channel: 'mobile' },
    });
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
  }

  if (!user.passwordHash || user.passwordHash === 'OAUTH_USER') {
    writeAuditLog({
      userId: user.id,
      action: 'failed_login',
      metadata: { email: normalizedEmail, reason: 'oauth_only_account', channel: 'mobile' },
    });
    return NextResponse.json(
      { error: 'This account uses Google/GitHub sign-in. Log in on the web to set a password.' },
      { status: 401 }
    );
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    writeAuditLog({
      userId: user.id,
      action: 'failed_login',
      metadata: { email: normalizedEmail, reason: 'invalid_password', channel: 'mobile' },
    });
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
  }

  const [membership] = await db
    .select({ orgId: orgMembers.orgId, role: orgMembers.role })
    .from(orgMembers)
    .where(eq(orgMembers.userId, user.id))
    .limit(1);

  writeAuditLog({
    userId: user.id,
    orgId: membership?.orgId,
    action: 'login',
    metadata: { channel: 'mobile' },
  });

  const cookieName = sessionCookieName();
  const token = await encode({
    token: {
      sub: user.id,
      email: user.email,
      name: user.name,
      userId: user.id,
      orgId: membership?.orgId ?? '',
      role: membership?.role ?? 'member',
      emailVerified: !!user.emailVerifiedAt,
    },
    secret,
    salt: cookieName,
    maxAge: SESSION_MAX_AGE,
  });

  return NextResponse.json({
    token,
    cookieName,
    expiresAt: new Date(Date.now() + SESSION_MAX_AGE * 1000).toISOString(),
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      orgId: membership?.orgId ?? null,
      role: membership?.role ?? 'member',
      emailVerified: !!user.emailVerifiedAt,
    },
  });
}

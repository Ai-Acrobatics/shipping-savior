import { NextResponse } from 'next/server';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { users, passwordResetTokens } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import {
  sendEmail,
  renderPasswordResetEmail,
  getAppBaseUrl,
} from '@/lib/auth/email';
import { writeAuditLog } from '@/lib/auth/audit';

const TOKEN_TTL_MINUTES = 60;

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const email =
      typeof body?.email === 'string' ? body.email.toLowerCase().trim() : '';

    // Validate shape but ALWAYS respond 200 to prevent email enumeration.
    if (!email || !email.includes('@')) {
      return NextResponse.json({ ok: true });
    }

    const [user] = await db
      .select({ id: users.id, email: users.email, name: users.name })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      // Same generic 200 — never confirm or deny existence.
      return NextResponse.json({ ok: true });
    }

    // Generate a 64-char hex token (32 random bytes hex-encoded).
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = await bcrypt.hash(rawToken, 10);
    const expiresAt = new Date(Date.now() + TOKEN_TTL_MINUTES * 60 * 1000);

    await db.insert(passwordResetTokens).values({
      userId: user.id,
      tokenHash,
      expiresAt,
    });

    const resetUrl = `${getAppBaseUrl()}/reset-password?token=${rawToken}`;
    const tpl = renderPasswordResetEmail({
      resetUrl,
      expiresInMinutes: TOKEN_TTL_MINUTES,
    });

    const send = await sendEmail({
      to: user.email,
      subject: tpl.subject,
      html: tpl.html,
      text: tpl.text,
    });

    writeAuditLog({
      userId: user.id,
      action: 'register', // closest existing enum value; treat reset-request as registration-adjacent
      metadata: {
        kind: 'password_reset_requested',
        email,
        emailSent: send.ok,
        emailSkipped: send.skipped ?? false,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[forgot-password] failed:', err);
    // Still return 200 to avoid leaking whether the address exists.
    return NextResponse.json({ ok: true });
  }
}

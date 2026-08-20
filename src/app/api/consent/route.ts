import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { cookieConsents } from '@/lib/db/schema';
import {
  CONSENT_COOKIE,
  CONSENT_MAX_AGE_SECONDS,
  CONSENT_POLICY_VERSION,
  VISITOR_COOKIE,
  isConsentChoice,
} from '@/lib/legal/consent';

/**
 * POST /api/consent — record a cookie-consent choice (AI-8780).
 *
 * Does two things the localStorage-only banner could not:
 *   1. Sets the server-readable `cookie_consent` cookie, so server components
 *      and edge middleware can decide whether to emit analytics tags at all.
 *   2. Writes an auditable row proving consent was given, when, for which
 *      policy version, and from which address.
 *
 * Anonymous visitors are supported — `visitorId` is an opaque browser-generated
 * id, never a fingerprint, and is stored in a first-party cookie. The audit
 * write is best-effort: if the database is unreachable we still set the cookie
 * so the visitor's choice is honored rather than re-prompting them forever.
 */
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const choice = (body as { choice?: unknown } | null)?.choice;
  if (!isConsentChoice(choice)) {
    return NextResponse.json(
      { error: "Invalid choice — expected 'all' or 'essential'" },
      { status: 400 }
    );
  }

  // Prefer the id the browser already carries; mint one if this is a first visit.
  const existingVisitorId = request.cookies.get(VISITOR_COOKIE)?.value;
  const visitorId =
    existingVisitorId && existingVisitorId.length <= 64
      ? existingVisitorId
      : crypto.randomUUID();

  const session = await auth().catch(() => null);

  // x-forwarded-for is a comma-separated chain; the client is the first entry.
  const forwarded = request.headers.get('x-forwarded-for');
  const ipAddress =
    forwarded?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    null;

  try {
    await db.insert(cookieConsents).values({
      visitorId,
      userId: session?.user?.id ?? null,
      orgId: session?.user?.orgId ?? null,
      choice,
      policyVersion: CONSENT_POLICY_VERSION,
      ipAddress: ipAddress ? ipAddress.slice(0, 45) : null,
      userAgent: request.headers.get('user-agent'),
    });
  } catch (error) {
    // Never block the visitor on an audit-write failure — the cookie below is
    // what actually gates analytics.
    console.error('Failed to record cookie consent:', error);
  }

  const response = NextResponse.json({
    ok: true,
    choice,
    policyVersion: CONSENT_POLICY_VERSION,
  });

  const cookieOptions = {
    httpOnly: false, // the banner reads it to decide whether to re-prompt
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: CONSENT_MAX_AGE_SECONDS,
  };

  response.cookies.set(CONSENT_COOKIE, choice, cookieOptions);
  response.cookies.set(VISITOR_COOKIE, visitorId, cookieOptions);

  return response;
}

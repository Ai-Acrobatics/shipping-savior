import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { emailVerifications } from '@/lib/db/schema';
import {
  sendEmail,
  renderEmailVerificationEmail,
  getAppBaseUrl,
} from './email';

export const VERIFICATION_TTL_HOURS = 24;

export async function issueVerificationToken(args: {
  userId: string;
  email: string;
}): Promise<{ ok: boolean; emailSent: boolean; emailSkipped: boolean }> {
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = await bcrypt.hash(rawToken, 10);
  const expiresAt = new Date(
    Date.now() + VERIFICATION_TTL_HOURS * 60 * 60 * 1000
  );

  await db.insert(emailVerifications).values({
    userId: args.userId,
    tokenHash,
    expiresAt,
  });

  const verifyUrl = `${getAppBaseUrl()}/api/auth/verify-email?token=${rawToken}`;
  const tpl = renderEmailVerificationEmail({
    verifyUrl,
    expiresInHours: VERIFICATION_TTL_HOURS,
  });

  const send = await sendEmail({
    to: args.email,
    subject: tpl.subject,
    html: tpl.html,
    text: tpl.text,
  });

  return {
    ok: send.ok || (send.skipped ?? false),
    emailSent: send.ok,
    emailSkipped: send.skipped ?? false,
  };
}

export function isEmailVerificationRequired(): boolean {
  return (process.env.REQUIRE_EMAIL_VERIFICATION || 'false').toLowerCase() === 'true';
}

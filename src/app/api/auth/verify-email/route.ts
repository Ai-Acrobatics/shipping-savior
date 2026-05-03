import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { users, emailVerifications } from '@/lib/db/schema';
import { and, desc, eq, gt, isNull } from 'drizzle-orm';
import { writeAuditLog } from '@/lib/auth/audit';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = (url.searchParams.get('token') || '').trim();

  if (!token) {
    return NextResponse.redirect(
      new URL('/verify-email?error=missing_token', url.origin)
    );
  }

  try {
    const now = new Date();
    const candidates = await db
      .select()
      .from(emailVerifications)
      .where(
        and(
          gt(emailVerifications.expiresAt, now),
          isNull(emailVerifications.verifiedAt)
        )
      )
      .orderBy(desc(emailVerifications.createdAt))
      .limit(50);

    let matched: (typeof candidates)[number] | null = null;
    for (const row of candidates) {
      // eslint-disable-next-line no-await-in-loop
      const ok = await bcrypt.compare(token, row.tokenHash);
      if (ok) {
        matched = row;
        break;
      }
    }

    if (!matched) {
      return NextResponse.redirect(
        new URL('/verify-email?error=invalid_or_expired', url.origin)
      );
    }

    await db.transaction(async (tx) => {
      const verifiedAt = new Date();
      await tx
        .update(users)
        .set({ emailVerifiedAt: verifiedAt, updatedAt: verifiedAt })
        .where(eq(users.id, matched!.userId));

      await tx
        .update(emailVerifications)
        .set({ verifiedAt })
        .where(eq(emailVerifications.id, matched!.id));
    });

    writeAuditLog({
      userId: matched.userId,
      action: 'register',
      metadata: { kind: 'email_verified' },
    });

    return NextResponse.redirect(new URL('/login?verified=1', url.origin));
  } catch (err) {
    console.error('[verify-email] failed:', err);
    return NextResponse.redirect(
      new URL('/verify-email?error=server_error', url.origin)
    );
  }
}

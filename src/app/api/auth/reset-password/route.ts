import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { users, passwordResetTokens } from '@/lib/db/schema';
import { and, eq, gt, isNull, desc } from 'drizzle-orm';
import { writeAuditLog } from '@/lib/auth/audit';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const token = typeof body?.token === 'string' ? body.token.trim() : '';
    const newPassword =
      typeof body?.new_password === 'string' ? body.new_password : '';

    if (!token) {
      return NextResponse.json(
        { error: 'Reset token is required' },
        { status: 400 }
      );
    }

    if (!newPassword || newPassword.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    // Pull every unused, unexpired token and bcrypt-compare against the
    // submitted token. This is O(n) on outstanding tokens for a given window
    // but the active set is tiny (1-hour TTL, single-use).
    const now = new Date();
    const candidates = await db
      .select()
      .from(passwordResetTokens)
      .where(
        and(
          gt(passwordResetTokens.expiresAt, now),
          isNull(passwordResetTokens.usedAt)
        )
      )
      .orderBy(desc(passwordResetTokens.createdAt))
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
      return NextResponse.json(
        { error: 'This reset link is invalid or has expired.' },
        { status: 400 }
      );
    }

    const newHash = await bcrypt.hash(newPassword, 12);

    await db.transaction(async (tx) => {
      await tx
        .update(users)
        .set({ passwordHash: newHash, updatedAt: new Date() })
        .where(eq(users.id, matched!.userId));

      await tx
        .update(passwordResetTokens)
        .set({ usedAt: new Date() })
        .where(eq(passwordResetTokens.id, matched!.id));
    });

    writeAuditLog({
      userId: matched.userId,
      action: 'register', // closest existing enum value
      metadata: { kind: 'password_reset_completed' },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[reset-password] failed:', err);
    return NextResponse.json(
      { error: 'Reset failed. Please request a new link.' },
      { status: 500 }
    );
  }
}

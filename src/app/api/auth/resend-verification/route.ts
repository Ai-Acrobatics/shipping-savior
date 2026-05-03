import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { issueVerificationToken } from '@/lib/auth/verification';

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    // Always 200 with neutral payload to prevent enumeration / probing.
    return NextResponse.json({ ok: true });
  }

  try {
    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        emailVerifiedAt: users.emailVerifiedAt,
      })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!user) {
      return NextResponse.json({ ok: true });
    }
    if (user.emailVerifiedAt) {
      return NextResponse.json({ ok: true, alreadyVerified: true });
    }

    await issueVerificationToken({ userId: user.id, email: user.email });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[resend-verification] failed:', err);
    return NextResponse.json({ ok: true });
  }
}

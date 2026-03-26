import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { writeAuditLog } from '@/lib/auth/audit';
import { getInviteByToken, getOrgMembership, getOrgById } from '@/lib/db/queries/org';
import { db } from '@/lib/db';
import { orgMembers, invites } from '@/lib/db/schema';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    // 1. Verify session
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'You must be logged in to accept an invite' }, { status: 401 });
    }

    const userId = session.user.id;

    // 2. Fetch invite
    const invite = await getInviteByToken(token);
    if (!invite) {
      return NextResponse.json({ error: 'Invalid invite link' }, { status: 404 });
    }

    // 3. Check expiry
    if (new Date() > invite.expiresAt) {
      return NextResponse.json({ error: 'This invite has expired' }, { status: 410 });
    }

    // 4. Check if already accepted
    if (invite.acceptedAt) {
      return NextResponse.json({ error: 'This invite has already been accepted' }, { status: 409 });
    }

    // 5. Get the accepting user's email and verify it matches the invite
    const [user] = await db
      .select({ email: users.email })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    if (user.email.toLowerCase() !== invite.email.toLowerCase()) {
      return NextResponse.json(
        { error: 'This invite was sent to a different email address' },
        { status: 403 }
      );
    }

    // 6. Check user is not already a member
    const existingMembership = await getOrgMembership(invite.orgId, userId);
    if (existingMembership) {
      return NextResponse.json(
        { error: 'You are already a member of this organization' },
        { status: 409 }
      );
    }

    // 7. Transaction: add member + mark invite accepted
    await db.transaction(async (tx) => {
      await tx.insert(orgMembers).values({
        orgId: invite.orgId,
        userId,
        role: invite.role,
        invitedBy: invite.invitedBy,
      });

      await tx
        .update(invites)
        .set({ acceptedAt: new Date() })
        .where(eq(invites.id, invite.id));
    });

    // 8. Audit log
    writeAuditLog({
      userId,
      orgId: invite.orgId,
      action: 'invite_accepted',
      metadata: { inviteId: invite.id, role: invite.role },
      ipAddress: request.headers.get('x-forwarded-for') ?? undefined,
    });

    // 9. Get org name for response
    const org = await getOrgById(invite.orgId);

    return NextResponse.json(
      {
        orgId: invite.orgId,
        role: invite.role,
        orgName: org?.name ?? 'Organization',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[invite:accept] Failed to accept invite:', error);
    return NextResponse.json({ error: 'Failed to accept invite' }, { status: 500 });
  }
}

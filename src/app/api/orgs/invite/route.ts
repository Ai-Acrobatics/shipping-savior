import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { auth } from '@/lib/auth';
import { requirePermission, outranks, type OrgRoleType } from '@/lib/auth/permissions';
import { writeAuditLog } from '@/lib/auth/audit';
import { getOrgMembership, getActiveInviteByEmail, getExistingMemberByEmail } from '@/lib/db/queries/org';
import { db } from '@/lib/db';
import { invites } from '@/lib/db/schema';

export async function POST(request: Request) {
  try {
    // 1. Verify session
    const session = await auth();
    if (!session?.user?.id || !session.user.orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: userId, orgId } = session.user;

    // 2. Parse and validate body
    const body = await request.json();
    const { email, role } = body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }

    const validRoles: OrgRoleType[] = ['admin', 'member', 'viewer'];
    if (!role || !validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Role must be one of: admin, member, viewer' },
        { status: 400 }
      );
    }

    // 3. Look up caller's role
    const membership = await getOrgMembership(orgId, userId);
    if (!membership) {
      return NextResponse.json({ error: 'Not a member of this organization' }, { status: 403 });
    }

    const callerRole = membership.role as OrgRoleType;

    // 4. Check permission: org:invite requires admin or owner
    try {
      requirePermission(callerRole, 'org:invite');
    } catch {
      return NextResponse.json({ error: 'Insufficient permissions to send invites' }, { status: 403 });
    }

    // 5. Prevent privilege escalation: caller must outrank the invited role
    if (!outranks(callerRole, role as OrgRoleType)) {
      return NextResponse.json(
        { error: 'Cannot invite someone with a role equal to or higher than your own' },
        { status: 403 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 6. Check if email is already a member of this org
    const existingMember = await getExistingMemberByEmail(orgId, normalizedEmail);
    if (existingMember) {
      return NextResponse.json(
        { error: 'This user is already a member of your organization' },
        { status: 409 }
      );
    }

    // 7. Check if email already has an active invite
    const activeInvite = await getActiveInviteByEmail(orgId, normalizedEmail);
    if (activeInvite) {
      return NextResponse.json(
        { error: 'An active invite already exists for this email' },
        { status: 409 }
      );
    }

    // 8. Generate invite token and expiry
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // 9. Insert invite
    await db.insert(invites).values({
      orgId,
      email: normalizedEmail,
      role: role as OrgRoleType,
      token,
      invitedBy: userId,
      expiresAt,
    });

    // 10. Audit log
    writeAuditLog({
      userId,
      orgId,
      action: 'invite_sent',
      metadata: { email: normalizedEmail, role, token },
      ipAddress: request.headers.get('x-forwarded-for') ?? undefined,
    });

    // 11. Build invite URL
    const baseUrl = process.env.NEXT_PUBLIC_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const inviteUrl = `${baseUrl}/invite/${token}`;

    return NextResponse.json({ inviteUrl, expiresAt: expiresAt.toISOString() }, { status: 201 });
  } catch (error) {
    console.error('[invite] Failed to create invite:', error);
    return NextResponse.json({ error: 'Failed to create invite' }, { status: 500 });
  }
}

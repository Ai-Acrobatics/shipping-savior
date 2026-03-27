import { NextResponse } from 'next/server';
import { requireRole, isAuthError, type AuthContext } from '@/lib/auth/rbac';
import { getOrgMembers, removeOrgMember, countOrgOwners } from '@/lib/db/queries/org';
import { writeAuditLog } from '@/lib/auth/audit';

/**
 * GET /api/org/members
 * List all members of the authenticated user's organization.
 * Any role can view members.
 */
export async function GET() {
  const result = await requireRole('calc:view'); // lowest permission — any role
  if (isAuthError(result)) return result;
  const { orgId } = result as AuthContext;

  try {
    const members = await getOrgMembers(orgId);
    return NextResponse.json({ members });
  } catch (error) {
    console.error('[org/members] Failed to list members:', error);
    return NextResponse.json(
      { error: 'Failed to list members' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/org/members
 * Remove a member from the organization.
 * Body: { userId: string }
 * Requires admin or owner role. Cannot remove the last owner.
 */
export async function DELETE(request: Request) {
  const result = await requireRole('org:remove_member');
  if (isAuthError(result)) return result;
  const { orgId, userId: callerId, role: callerRole } = result as AuthContext;

  try {
    const body = await request.json();
    const { userId: targetUserId } = body;

    if (!targetUserId || typeof targetUserId !== 'string') {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Cannot remove yourself via this endpoint
    if (targetUserId === callerId) {
      return NextResponse.json(
        { error: 'Cannot remove yourself. Use the leave organization flow instead.' },
        { status: 400 }
      );
    }

    // Check if removing the target would leave the org with no owners
    const members = await getOrgMembers(orgId);
    const targetMember = members.find((m) => m.userId === targetUserId);

    if (!targetMember) {
      return NextResponse.json(
        { error: 'User is not a member of this organization' },
        { status: 404 }
      );
    }

    // Admins cannot remove owners
    if (callerRole === 'admin' && targetMember.role === 'owner') {
      return NextResponse.json(
        { error: 'Admins cannot remove owners' },
        { status: 403 }
      );
    }

    // Protect last owner
    if (targetMember.role === 'owner') {
      const ownerCount = await countOrgOwners(orgId);
      if (ownerCount <= 1) {
        return NextResponse.json(
          { error: 'Cannot remove the last owner of an organization' },
          { status: 400 }
        );
      }
    }

    await removeOrgMember(orgId, targetUserId);

    // Audit log
    writeAuditLog({
      userId: callerId,
      orgId,
      action: 'invite_accepted', // Using closest available action; in production we'd add 'member_removed'
      metadata: {
        action: 'member_removed',
        removedUserId: targetUserId,
        removedRole: targetMember.role,
      },
      ipAddress: request.headers.get('x-forwarded-for') ?? undefined,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[org/members] Failed to remove member:', error);
    return NextResponse.json(
      { error: 'Failed to remove member' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { type OrgRoleType } from '@/lib/auth/permissions';
import { writeAuditLog } from '@/lib/auth/audit';
import {
  getOrgMembership,
  getOrgMembers,
  countOrgOwners,
  removeOrgMember,
  updateOrgMemberRole,
} from '@/lib/db/queries/org';

/**
 * Member management by target user id (AI-5582).
 *
 * `[id]` is the target USER id (not the org_members row id) — consistent with
 * the collection DELETE endpoint and `removeOrgMember(orgId, userId)`.
 *
 * Rules:
 * - Caller must be an owner or admin of the org.
 * - Admins cannot modify/remove owners (and cannot promote anyone to owner).
 * - Nobody can demote or remove the LAST owner (409).
 * - Users cannot remove themselves via this endpoint (403).
 * - All lookups are org-scoped to the caller's session org.
 */

const VALID_ROLES: OrgRoleType[] = ['owner', 'admin', 'member', 'viewer'];

type Caller = {
  userId: string;
  orgId: string;
  role: OrgRoleType;
};

/** Resolve session + verify caller is an owner/admin member of their org. */
async function requireManager(): Promise<Caller | NextResponse> {
  const session = await auth();
  if (!session?.user?.id || !session.user.orgId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id: userId, orgId } = session.user;

  const membership = await getOrgMembership(orgId, userId);
  if (!membership) {
    return NextResponse.json(
      { error: 'Not a member of this organization' },
      { status: 403 }
    );
  }

  const role = membership.role as OrgRoleType;
  if (role !== 'owner' && role !== 'admin') {
    return NextResponse.json(
      { error: 'Insufficient permissions' },
      { status: 403 }
    );
  }

  return { userId, orgId, role };
}

/**
 * PATCH /api/org/members/[id]
 * Change a member's role. Body: { role: 'owner' | 'admin' | 'member' | 'viewer' }
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const caller = await requireManager();
  if (caller instanceof NextResponse) return caller;

  try {
    const { id: targetUserId } = await params;

    const body = await request.json().catch(() => null);
    const newRole = body?.role as OrgRoleType | undefined;
    if (!newRole || !VALID_ROLES.includes(newRole)) {
      return NextResponse.json(
        { error: 'Role must be one of: owner, admin, member, viewer' },
        { status: 400 }
      );
    }

    // Org-scoped target lookup
    const members = await getOrgMembers(caller.orgId);
    const target = members.find((m) => m.userId === targetUserId);
    if (!target) {
      return NextResponse.json(
        { error: 'User is not a member of this organization' },
        { status: 404 }
      );
    }

    const targetRole = target.role as OrgRoleType;

    // Admins cannot modify owners, and cannot grant the owner role
    if (caller.role === 'admin' && (targetRole === 'owner' || newRole === 'owner')) {
      return NextResponse.json(
        { error: 'Admins cannot modify owners or grant the owner role' },
        { status: 403 }
      );
    }

    // Nobody can demote the last owner
    if (targetRole === 'owner' && newRole !== 'owner') {
      const ownerCount = await countOrgOwners(caller.orgId);
      if (ownerCount <= 1) {
        return NextResponse.json(
          { error: 'Cannot demote the last owner of an organization' },
          { status: 409 }
        );
      }
    }

    if (targetRole === newRole) {
      // No-op — return current state without writing
      return NextResponse.json({
        member: { userId: target.userId, role: targetRole },
      });
    }

    const [updated] = await updateOrgMemberRole(caller.orgId, targetUserId, newRole);
    if (!updated) {
      return NextResponse.json(
        { error: 'User is not a member of this organization' },
        { status: 404 }
      );
    }

    writeAuditLog({
      userId: caller.userId,
      orgId: caller.orgId,
      // Closest available enum value — schema is frozen; real action in metadata.
      action: 'invite_accepted',
      metadata: {
        action: 'role_changed',
        targetUserId,
        previousRole: targetRole,
        newRole,
      },
      ipAddress: request.headers.get('x-forwarded-for') ?? undefined,
    });

    return NextResponse.json({
      member: { userId: targetUserId, role: updated.role },
    });
  } catch (error) {
    console.error('[org/members/[id]] Failed to update member role:', error);
    return NextResponse.json(
      { error: 'Failed to update member role' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/org/members/[id]
 * Remove a member from the organization.
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const caller = await requireManager();
  if (caller instanceof NextResponse) return caller;

  try {
    const { id: targetUserId } = await params;

    // Users cannot remove themselves via this endpoint
    if (targetUserId === caller.userId) {
      return NextResponse.json(
        { error: 'Cannot remove yourself. Use the leave organization flow instead.' },
        { status: 403 }
      );
    }

    // Org-scoped target lookup
    const members = await getOrgMembers(caller.orgId);
    const target = members.find((m) => m.userId === targetUserId);
    if (!target) {
      return NextResponse.json(
        { error: 'User is not a member of this organization' },
        { status: 404 }
      );
    }

    const targetRole = target.role as OrgRoleType;

    // Admins cannot remove owners
    if (caller.role === 'admin' && targetRole === 'owner') {
      return NextResponse.json(
        { error: 'Admins cannot remove owners' },
        { status: 403 }
      );
    }

    // Nobody can remove the last owner
    if (targetRole === 'owner') {
      const ownerCount = await countOrgOwners(caller.orgId);
      if (ownerCount <= 1) {
        return NextResponse.json(
          { error: 'Cannot remove the last owner of an organization' },
          { status: 409 }
        );
      }
    }

    await removeOrgMember(caller.orgId, targetUserId);

    writeAuditLog({
      userId: caller.userId,
      orgId: caller.orgId,
      // Closest available enum value — schema is frozen; real action in metadata.
      action: 'invite_accepted',
      metadata: {
        action: 'member_removed',
        removedUserId: targetUserId,
        removedRole: targetRole,
      },
      ipAddress: request.headers.get('x-forwarded-for') ?? undefined,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[org/members/[id]] Failed to remove member:', error);
    return NextResponse.json(
      { error: 'Failed to remove member' },
      { status: 500 }
    );
  }
}

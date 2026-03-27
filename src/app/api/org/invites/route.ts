import { NextResponse } from 'next/server';
import { requireRole, isAuthError, type AuthContext } from '@/lib/auth/rbac';
import { getPendingInvites, revokeInvite } from '@/lib/db/queries/org';

/**
 * GET /api/org/invites
 * List pending invites for the authenticated user's organization.
 * Requires admin or owner role.
 */
export async function GET() {
  const result = await requireRole('org:invite');
  if (isAuthError(result)) return result;
  const { orgId } = result as AuthContext;

  try {
    const invites = await getPendingInvites(orgId);
    return NextResponse.json({ invites });
  } catch (error) {
    console.error('[org/invites] Failed to list invites:', error);
    return NextResponse.json(
      { error: 'Failed to list invites' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/org/invites
 * Revoke a pending invite.
 * Body: { inviteId: string }
 * Requires admin or owner role.
 */
export async function DELETE(request: Request) {
  const result = await requireRole('org:invite');
  if (isAuthError(result)) return result;
  const { orgId } = result as AuthContext;

  try {
    const body = await request.json();
    const { inviteId } = body;

    if (!inviteId || typeof inviteId !== 'string') {
      return NextResponse.json(
        { error: 'inviteId is required' },
        { status: 400 }
      );
    }

    const revoked = await revokeInvite(inviteId, orgId);
    if (revoked.length === 0) {
      return NextResponse.json(
        { error: 'Invite not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[org/invites] Failed to revoke invite:', error);
    return NextResponse.json(
      { error: 'Failed to revoke invite' },
      { status: 500 }
    );
  }
}

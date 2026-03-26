import {
  hasPermission,
  requirePermission,
  outranks,
  type OrgRoleType,
  type Permission,
} from './permissions';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getOrgMembership } from '@/lib/db/queries/org';

// ── Role hierarchy (re-exported for convenience) ──────────────────────────────

export const ROLE_LEVELS: Record<OrgRoleType, number> = {
  owner: 40,
  admin: 30,
  member: 20,
  viewer: 10,
};

// ── Convenience role checks ───────────────────────────────────────────────────

/** Can this role send invites? (owner / admin) */
export function canInvite(role: OrgRoleType): boolean {
  return hasPermission(role, 'org:invite');
}

/** Can this role manage members (remove, etc.)? (owner / admin) */
export function canManageMembers(role: OrgRoleType): boolean {
  return hasPermission(role, 'org:remove_member');
}

/** Can this role create/edit/delete calculations? (owner / admin / member) */
export function canEditCalculations(role: OrgRoleType): boolean {
  return hasPermission(role, 'calc:create');
}

/** Can this role view calculations? (all roles) */
export function canViewCalculations(role: OrgRoleType): boolean {
  return hasPermission(role, 'calc:view');
}

/** Can this role manage org settings? (owner only) */
export function canManageOrg(role: OrgRoleType): boolean {
  return hasPermission(role, 'org:manage');
}

/** Can this role view audit logs? (owner / admin) */
export function canViewAuditLogs(role: OrgRoleType): boolean {
  return hasPermission(role, 'audit:view');
}

// ── API Route Middleware Helpers ───────────────────────────────────────────────

export type AuthContext = {
  userId: string;
  orgId: string;
  role: OrgRoleType;
};

/**
 * Verify session + org membership + minimum role in one call.
 * Returns AuthContext on success or a NextResponse error on failure.
 */
export async function requireRole(
  minPermission: Permission
): Promise<AuthContext | NextResponse> {
  const session = await auth();
  if (!session?.user?.id || !session.user.orgId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: userId, orgId } = session.user;

  // Verify actual membership in DB (JWT role could be stale)
  const membership = await getOrgMembership(orgId, userId);
  if (!membership) {
    return NextResponse.json(
      { error: 'Not a member of this organization' },
      { status: 403 }
    );
  }

  const role = membership.role as OrgRoleType;

  try {
    requirePermission(role, minPermission);
  } catch {
    return NextResponse.json(
      { error: 'Insufficient permissions' },
      { status: 403 }
    );
  }

  return { userId, orgId, role };
}

/**
 * Type guard: check if requireRole() returned an error response.
 */
export function isAuthError(
  result: AuthContext | NextResponse
): result is NextResponse {
  return result instanceof NextResponse;
}

// Re-export core utilities for convenience
export { hasPermission, requirePermission, outranks, type OrgRoleType, type Permission };

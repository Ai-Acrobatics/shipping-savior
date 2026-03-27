export const OrgRole = {
  OWNER: 'owner',
  ADMIN: 'admin',
  MEMBER: 'member',
  VIEWER: 'viewer',
} as const;

export type OrgRoleType = (typeof OrgRole)[keyof typeof OrgRole];

/**
 * Permission definitions.
 * Each permission maps to the minimum role required.
 * Role hierarchy: owner(40) > admin(30) > member(20) > viewer(10)
 */
const ROLE_HIERARCHY: Record<OrgRoleType, number> = {
  owner: 40,
  admin: 30,
  member: 20,
  viewer: 10,
};

export type Permission =
  | 'org:manage' // Update org settings, delete org
  | 'org:invite' // Send invites
  | 'org:remove_member' // Remove members from org
  | 'org:change_role' // Change member roles
  | 'calc:create' // Create/save calculations
  | 'calc:edit' // Edit own calculations
  | 'calc:delete' // Delete own calculations
  | 'calc:view' // View calculations in org
  | 'audit:view'; // View audit logs

const PERMISSION_MIN_ROLE: Record<Permission, OrgRoleType> = {
  'org:manage': 'owner',
  'org:invite': 'admin',
  'org:remove_member': 'admin',
  'org:change_role': 'owner',
  'calc:create': 'member',
  'calc:edit': 'member',
  'calc:delete': 'member',
  'calc:view': 'viewer',
  'audit:view': 'admin',
};

/**
 * Check if a role has a specific permission.
 */
export function hasPermission(role: OrgRoleType, permission: Permission): boolean {
  const roleLevel = ROLE_HIERARCHY[role];
  const requiredLevel = ROLE_HIERARCHY[PERMISSION_MIN_ROLE[permission]];
  return roleLevel >= requiredLevel;
}

/**
 * Assert a role has permission — throws if not.
 * Use in API routes for guard checks.
 */
export function requirePermission(role: OrgRoleType, permission: Permission): void {
  if (!hasPermission(role, permission)) {
    throw new Error(`Forbidden: role '${role}' lacks permission '${permission}'`);
  }
}

/**
 * Check if roleA outranks roleB in the hierarchy.
 * Used to prevent privilege escalation (e.g. admin can't invite as owner).
 */
export function outranks(roleA: OrgRoleType, roleB: OrgRoleType): boolean {
  return ROLE_HIERARCHY[roleA] > ROLE_HIERARCHY[roleB];
}

import { eq, and, isNull, gt } from 'drizzle-orm';
import { db } from '../index';
import { organizations, orgMembers, users, invites } from '../schema';

/** Get org by ID */
export async function getOrgById(orgId: string) {
  const [org] = await db
    .select()
    .from(organizations)
    .where(eq(organizations.id, orgId))
    .limit(1);
  return org ?? null;
}

/** Get all members of an org with user details */
export async function getOrgMembers(orgId: string) {
  return db
    .select({
      memberId: orgMembers.id,
      userId: users.id,
      email: users.email,
      name: users.name,
      role: orgMembers.role,
      joinedAt: orgMembers.joinedAt,
    })
    .from(orgMembers)
    .innerJoin(users, eq(orgMembers.userId, users.id))
    .where(eq(orgMembers.orgId, orgId));
}

/** Get a user's membership in an org (returns membership row or null) */
export async function getOrgMembership(orgId: string, userId: string) {
  const [membership] = await db
    .select()
    .from(orgMembers)
    .where(
      and(eq(orgMembers.orgId, orgId), eq(orgMembers.userId, userId))
    )
    .limit(1);
  return membership ?? null;
}

/** Get pending (non-expired, non-accepted) invites for an org */
export async function getPendingInvites(orgId: string) {
  return db
    .select()
    .from(invites)
    .where(
      and(
        eq(invites.orgId, orgId),
        isNull(invites.acceptedAt),
        gt(invites.expiresAt, new Date())
      )
    );
}

/** Get invite by token (for accept flow) */
export async function getInviteByToken(token: string) {
  const [invite] = await db
    .select()
    .from(invites)
    .where(eq(invites.token, token))
    .limit(1);
  return invite ?? null;
}

/** Get invite by email and org (for duplicate check) */
export async function getActiveInviteByEmail(orgId: string, email: string) {
  const [invite] = await db
    .select()
    .from(invites)
    .where(
      and(
        eq(invites.orgId, orgId),
        eq(invites.email, email),
        isNull(invites.acceptedAt),
        gt(invites.expiresAt, new Date())
      )
    )
    .limit(1);
  return invite ?? null;
}

/** Check if a user is already a member of an org by email */
export async function getExistingMemberByEmail(orgId: string, email: string) {
  const [result] = await db
    .select({ userId: users.id })
    .from(users)
    .innerJoin(orgMembers, eq(users.id, orgMembers.userId))
    .where(
      and(eq(orgMembers.orgId, orgId), eq(users.email, email))
    )
    .limit(1);
  return result ?? null;
}

/** Remove a member from an org */
export async function removeOrgMember(orgId: string, userId: string) {
  return db
    .delete(orgMembers)
    .where(
      and(eq(orgMembers.orgId, orgId), eq(orgMembers.userId, userId))
    )
    .returning();
}

/** Count how many owners an org has */
export async function countOrgOwners(orgId: string) {
  const owners = await db
    .select({ id: orgMembers.id })
    .from(orgMembers)
    .where(
      and(eq(orgMembers.orgId, orgId), eq(orgMembers.role, 'owner'))
    );
  return owners.length;
}

/** Update organization details */
export async function updateOrganization(
  orgId: string,
  data: { name?: string; slug?: string }
) {
  const [updated] = await db
    .update(organizations)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(organizations.id, orgId))
    .returning();
  return updated ?? null;
}

/** Revoke (delete) a pending invite */
export async function revokeInvite(inviteId: string, orgId: string) {
  return db
    .delete(invites)
    .where(
      and(eq(invites.id, inviteId), eq(invites.orgId, orgId))
    )
    .returning();
}

import { eq, desc } from 'drizzle-orm';
import { db } from './index';
import {
  organizations,
  users,
  orgMembers,
  calculations,
  auditLogs,
} from './schema';

// ─── Organizations ───────────────────────────────────────────────────────────

export async function createOrganization(name: string, slug: string) {
  const [org] = await db
    .insert(organizations)
    .values({ name, slug })
    .returning();
  return org;
}

export async function getOrganizationBySlug(slug: string) {
  return db.query.organizations.findFirst({
    where: eq(organizations.slug, slug),
  });
}

export async function getOrganizationById(id: string) {
  return db.query.organizations.findFirst({
    where: eq(organizations.id, id),
  });
}

// ─── Users ───────────────────────────────────────────────────────────────────

export async function createUser(
  email: string,
  passwordHash: string,
  name: string
) {
  const [user] = await db
    .insert(users)
    .values({ email, passwordHash, name })
    .returning();
  return user;
}

export async function getUserByEmail(email: string) {
  return db.query.users.findFirst({
    where: eq(users.email, email),
  });
}

export async function getUserById(id: string) {
  return db.query.users.findFirst({
    where: eq(users.id, id),
  });
}

// ─── Org Members ─────────────────────────────────────────────────────────────

export async function addOrgMember(
  orgId: string,
  userId: string,
  role: 'owner' | 'admin' | 'member' | 'viewer'
) {
  const [member] = await db
    .insert(orgMembers)
    .values({ orgId, userId, role })
    .returning();
  return member;
}

export async function getOrgMembers(orgId: string) {
  return db.query.orgMembers.findMany({
    where: eq(orgMembers.orgId, orgId),
    with: { user: true },
  });
}

export async function getUserOrgs(userId: string) {
  return db.query.orgMembers.findMany({
    where: eq(orgMembers.userId, userId),
    with: { organization: true },
  });
}

// ─── Calculations ────────────────────────────────────────────────────────────

export async function saveCalculation(
  orgId: string,
  userId: string,
  calculatorType: 'landed_cost' | 'unit_economics' | 'ftz_savings' | 'pf_npf_comparison' | 'container_utilization' | 'tariff_scenario',
  name: string,
  inputs: Record<string, unknown>,
  outputs: Record<string, unknown>
) {
  const [calc] = await db
    .insert(calculations)
    .values({ orgId, userId, calculatorType, name, inputs, outputs })
    .returning();
  return calc;
}

export async function getCalculationsByOrg(orgId: string) {
  return db.query.calculations.findMany({
    where: eq(calculations.orgId, orgId),
    orderBy: desc(calculations.createdAt),
    with: { user: true },
  });
}

export async function getCalculationById(id: string) {
  return db.query.calculations.findFirst({
    where: eq(calculations.id, id),
    with: { user: true },
  });
}

export async function deleteCalculation(id: string) {
  return db.delete(calculations).where(eq(calculations.id, id)).returning();
}

// ─── Audit Logs ──────────────────────────────────────────────────────────────

export async function writeAuditLog(
  orgId: string | null,
  userId: string | null,
  eventType: string,
  metadata?: Record<string, unknown> | null,
  ipAddress?: string | null
) {
  const [log] = await db
    .insert(auditLogs)
    .values({
      orgId,
      userId,
      eventType,
      metadata: metadata ?? null,
      ipAddress: ipAddress ?? null,
    })
    .returning();
  return log;
}

export async function getAuditLogs(orgId: string, limit = 50) {
  return db.query.auditLogs.findMany({
    where: eq(auditLogs.orgId, orgId),
    orderBy: desc(auditLogs.createdAt),
    limit,
    with: { user: true },
  });
}

/**
 * Tier-based usage limits + enforcement helpers (AI-8777).
 *
 * Single source of truth for "what does a Plan get?" — used by the billing UI
 * (to display caps) and by API routes (to enforce them).
 *
 * Wiring into the calculations + BOL upload + contract upload routes is W7's
 * job; this file just exports the helpers so W7 can drop them in without
 * shape changes.
 */
import { db } from '@/lib/db';
import { calculations, bolDocuments, contracts, organizations, orgMembers } from '@/lib/db/schema';
import { eq, and, gte, count } from 'drizzle-orm';
import type { Plan } from '@/lib/db/schema';

export type LimitedResource = 'users' | 'calculations' | 'bolUploads' | 'contractUploads';

/**
 * Per-plan caps.
 *
 * `Infinity` denotes "unlimited" — callers should treat it as no cap.
 */
export interface OrgLimits {
  users: number;            // total active members in the org
  calculations: number;     // calculations created per calendar month
  bolUploads: number;       // BOL OCR uploads per calendar month
  contractUploads: number;  // contract uploads per calendar month
}

const LIMITS: Record<Plan, OrgLimits> = {
  free: {
    users: 1,
    calculations: 10,
    bolUploads: 5,
    contractUploads: 0,
  },
  premium: {
    users: 8,
    calculations: Infinity,
    bolUploads: 100,
    contractUploads: 25,
  },
  enterprise: {
    users: 20,
    calculations: Infinity,
    bolUploads: Infinity,
    contractUploads: Infinity,
  },
};

/**
 * Returns the static cap table for a given plan. Pure function — safe to call
 * from server components or API routes.
 */
export function getOrgLimits(plan: Plan | null | undefined): OrgLimits {
  return LIMITS[plan ?? 'free'];
}

/**
 * Returns the org's current Plan tier, falling back to 'free' if the row is
 * missing or the column is null.
 */
export async function getOrgPlan(orgId: string): Promise<Plan> {
  const [row] = await db
    .select({ planTier: organizations.planTier })
    .from(organizations)
    .where(eq(organizations.id, orgId))
    .limit(1);

  return (row?.planTier as Plan | undefined) ?? 'free';
}

/**
 * Counts the current usage for a single (org, resource) pair against the
 * monthly window (calendar month, UTC). Returns the integer count.
 */
export async function getCurrentUsage(orgId: string, resource: LimitedResource): Promise<number> {
  const monthStart = startOfCurrentMonthUtc();

  switch (resource) {
    case 'users': {
      const [{ value }] = await db
        .select({ value: count() })
        .from(orgMembers)
        .where(eq(orgMembers.orgId, orgId));
      return Number(value ?? 0);
    }
    case 'calculations': {
      const [{ value }] = await db
        .select({ value: count() })
        .from(calculations)
        .where(and(eq(calculations.orgId, orgId), gte(calculations.createdAt, monthStart)));
      return Number(value ?? 0);
    }
    case 'bolUploads': {
      const [{ value }] = await db
        .select({ value: count() })
        .from(bolDocuments)
        .where(and(eq(bolDocuments.orgId, orgId), gte(bolDocuments.createdAt, monthStart)));
      return Number(value ?? 0);
    }
    case 'contractUploads': {
      const [{ value }] = await db
        .select({ value: count() })
        .from(contracts)
        .where(and(eq(contracts.orgId, orgId), gte(contracts.createdAt, monthStart)));
      return Number(value ?? 0);
    }
    default:
      return 0;
  }
}

export class LimitExceededError extends Error {
  readonly code = 'LIMIT_EXCEEDED';
  constructor(
    public readonly resource: LimitedResource,
    public readonly limit: number,
    public readonly used: number,
    public readonly plan: Plan
  ) {
    super(
      `Plan limit exceeded: ${used}/${limit} ${resource} used on ${plan}. Upgrade to continue.`
    );
    this.name = 'LimitExceededError';
  }
}

/**
 * Throws `LimitExceededError` if the org has hit (or exceeded) its cap for the
 * given resource. Use as a wrapper at the start of any API mutation that
 * creates one of the metered resources.
 *
 * Example:
 *   await enforceLimit(orgId, 'calculations');
 *   await db.insert(calculations).values(...);
 */
export async function enforceLimit(orgId: string, resource: LimitedResource): Promise<void> {
  const plan = await getOrgPlan(orgId);
  const limits = getOrgLimits(plan);
  const limit = limits[resource];

  // Unlimited tiers — short-circuit without a usage count to save a query.
  if (limit === Infinity) return;

  const used = await getCurrentUsage(orgId, resource);
  if (used >= limit) {
    throw new LimitExceededError(resource, limit, used, plan);
  }
}

/* ─────────── Internals ─────────── */

function startOfCurrentMonthUtc(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}

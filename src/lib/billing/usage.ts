/**
 * Usage helpers for tier enforcement (AI-8778).
 *
 * Wraps `getCurrentUsage` from `./limits` with a stable monthly-window contract
 * and adds `getMonthlyUsage` as the canonical read path used by both the
 * /platform/billing usage display and the API enforcement layer.
 *
 * Re-exports `getOrgPlan` and `getOrgLimits` for ergonomic single-import access
 * from server components and API routes.
 */
import {
  getCurrentUsage,
  getOrgLimits,
  getOrgPlan,
  type LimitedResource,
  type OrgLimits,
} from './limits';
import type { Plan } from '@/lib/db/schema';

export type { LimitedResource, OrgLimits };

/**
 * Returns the org's current monthly usage for a single resource.
 *
 * Thin alias around `getCurrentUsage` — exported here so callers can import
 * usage and limits from the same module without reaching into `./limits`.
 */
export async function getMonthlyUsage(
  orgId: string,
  resource: LimitedResource
): Promise<number> {
  return getCurrentUsage(orgId, resource);
}

export interface ResourceUsage {
  resource: LimitedResource;
  used: number;
  limit: number;          // Infinity if unlimited
  unlimited: boolean;
  pctUsed: number;        // 0–100, capped at 100; 0 if unlimited
}

const ALL_RESOURCES: LimitedResource[] = [
  'users',
  'calculations',
  'bolUploads',
  'contractUploads',
];

/**
 * Returns usage stats for every limited resource at once. Used by the billing
 * page's "This month's usage" section.
 */
export async function getAllUsage(orgId: string): Promise<{
  plan: Plan;
  limits: OrgLimits;
  usage: ResourceUsage[];
}> {
  const plan = await getOrgPlan(orgId);
  const limits = getOrgLimits(plan);

  const usage = await Promise.all(
    ALL_RESOURCES.map(async (resource): Promise<ResourceUsage> => {
      const limit = limits[resource];
      const used = await getMonthlyUsage(orgId, resource);
      const unlimited = limit === Infinity;
      const pctUsed = unlimited
        ? 0
        : limit === 0
          ? used > 0 ? 100 : 0
          : Math.min(100, Math.round((used / limit) * 100));
      return { resource, used, limit, unlimited, pctUsed };
    })
  );

  return { plan, limits, usage };
}

/**
 * Human-readable label for a resource, used in UI copy.
 */
export function resourceLabel(resource: LimitedResource): string {
  switch (resource) {
    case 'users':
      return 'team members';
    case 'calculations':
      return 'calculations';
    case 'bolUploads':
      return 'BOL uploads';
    case 'contractUploads':
      return 'contract uploads';
  }
}

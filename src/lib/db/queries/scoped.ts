import { eq, and, SQL } from 'drizzle-orm';
import { calculations, auditLogs } from '../schema';

/**
 * Adds org_id filter to a where clause.
 * Usage: db.select().from(calculations).where(withOrgScope(calculations.orgId, orgId))
 */
export function withOrgScope(
  orgIdColumn: typeof calculations.orgId | typeof auditLogs.orgId,
  orgId: string
): SQL {
  return eq(orgIdColumn, orgId);
}

/**
 * Combine org scope with additional conditions.
 * Usage: db.select().from(calculations).where(scopedWhere(calculations.orgId, orgId, eq(calculations.id, calcId)))
 */
export function scopedWhere(
  orgIdColumn: typeof calculations.orgId | typeof auditLogs.orgId,
  orgId: string,
  ...conditions: SQL[]
): SQL {
  return and(eq(orgIdColumn, orgId), ...conditions)!;
}

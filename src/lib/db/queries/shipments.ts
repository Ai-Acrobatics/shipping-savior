import { eq, desc } from 'drizzle-orm';
import { db } from '../index';
import { shipments, organizations } from '../schema';
import type { NewShipment, Shipment } from '../schema';

/**
 * Fetch all shipments for an org, newest first.
 * Returns [] if no shipments exist.
 */
export async function getShipmentsByOrg(orgId: string): Promise<Shipment[]> {
  if (!orgId) return [];
  return db
    .select()
    .from(shipments)
    .where(eq(shipments.orgId, orgId))
    .orderBy(desc(shipments.createdAt));
}

/**
 * Insert a single shipment scoped to an org.
 * Returns the created row.
 */
export async function createShipment(data: NewShipment): Promise<Shipment> {
  const [row] = await db.insert(shipments).values(data).returning();
  return row;
}

/**
 * Bulk insert shipment rows. All rows MUST be pre-validated and pre-scoped
 * to the same orgId by the caller. Returns the inserted rows.
 */
export async function bulkInsertShipments(rows: NewShipment[]): Promise<Shipment[]> {
  if (rows.length === 0) return [];
  return db.insert(shipments).values(rows).returning();
}

/**
 * Lookup an org's demo flag. Returns null if not found.
 */
export async function getOrgDemoFlag(orgId: string): Promise<{ id: string; isDemo: boolean } | null> {
  if (!orgId) return null;
  const [row] = await db
    .select({ id: organizations.id, isDemo: organizations.isDemo })
    .from(organizations)
    .where(eq(organizations.id, orgId))
    .limit(1);
  return row ?? null;
}

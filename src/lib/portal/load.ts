/**
 * Portal data access (AI-12022).
 *
 * One loader shared by the public page (server component) and the public API
 * route, so there is exactly one place that decides what a token can see. A
 * second implementation is how the page and the API drift apart and one of
 * them starts leaking.
 */

import { db } from '@/lib/db';
import { customerPortals, organizations, shipments } from '@/lib/db/schema';
import { and, eq, sql } from 'drizzle-orm';
import {
  sortForCustomer,
  summarize,
  toCustomerShipment,
  type CustomerShipment,
  type PortalSourceShipment,
  type PortalSummary,
} from './customer-portal';

/** Cap a single portal view. Well past any real customer's live book. */
const MAX_SHIPMENTS = 500;

export interface CustomerPortalView {
  /** The NVOCC, for white-label branding. */
  brandName: string;
  /** What this customer is called on their portal. */
  customerLabel: string;
  shipments: CustomerShipment[];
  summary: PortalSummary;
  generatedAt: string;
}

/**
 * Resolve a share token to its view.
 *
 * Returns null for unknown AND disabled tokens alike — a revoked link must be
 * indistinguishable from one that never existed, or the 403 itself confirms
 * the customer relationship to anyone holding an old URL.
 */
export async function loadPortalView(
  token: string,
  now: Date = new Date()
): Promise<CustomerPortalView | null> {
  if (!token || token.length < 32) return null;

  const [portal] = await db
    .select({
      id: customerPortals.id,
      orgId: customerPortals.orgId,
      customerCode: customerPortals.customerCode,
      label: customerPortals.label,
      enabled: customerPortals.enabled,
      brandName: organizations.name,
    })
    .from(customerPortals)
    .innerJoin(organizations, eq(customerPortals.orgId, organizations.id))
    .where(eq(customerPortals.token, token))
    .limit(1);

  if (!portal || !portal.enabled) return null;

  const rows = (await db
    .select({
      id: shipments.id,
      reference: shipments.reference,
      containerNumber: shipments.containerNumber,
      containerType: shipments.containerType,
      vesselName: shipments.vesselName,
      voyageNumber: shipments.voyageNumber,
      carrier: shipments.carrier,
      pol: shipments.pol,
      pod: shipments.pod,
      originPort: shipments.originPort,
      destPort: shipments.destPort,
      etd: shipments.etd,
      eta: shipments.eta,
      status: shipments.status,
      currentLocation: shipments.currentLocation,
      goodsDescription: shipments.goodsDescription,
      cargoType: shipments.cargoType,
      quantity: shipments.quantity,
      weightKg: shipments.weightKg,
      updatedAt: shipments.updatedAt,
      importMeta: shipments.importMeta,
    })
    .from(shipments)
    .where(
      and(
        eq(shipments.orgId, portal.orgId),
        // Case-insensitive match: codes are normalized upper-case on write,
        // but rows imported before this feature carry whatever Blake typed.
        sql`upper(trim(${shipments.importMeta} ->> 'customerCode')) = ${portal.customerCode}`
      )
    )
    .limit(MAX_SHIPMENTS)) as PortalSourceShipment[];

  const projected = sortForCustomer(rows.map((row) => toCustomerShipment(row, now)));

  return {
    brandName: portal.brandName,
    customerLabel: portal.label,
    shipments: projected,
    summary: summarize(projected, now),
    generatedAt: now.toISOString(),
  };
}

/**
 * Best-effort view accounting. Deliberately not awaited by callers on the
 * render path and swallowed on failure — a customer must still see their
 * boxes if the counter write fails.
 */
export async function recordPortalView(token: string): Promise<void> {
  try {
    await db
      .update(customerPortals)
      .set({
        viewCount: sql`${customerPortals.viewCount} + 1`,
        lastViewedAt: new Date(),
      })
      .where(eq(customerPortals.token, token));
  } catch (error) {
    console.error('[customer-portal] failed to record view:', error);
  }
}

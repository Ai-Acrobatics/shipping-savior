/**
 * NVOCC white-label customer portal (AI-12022).
 *
 * An NVOCC's customer gets a read-only view of their own boxes without a seat
 * in the NVOCC's account: one share link scoped to one customer code on
 * Blake's board (`importMeta.customerCode`).
 *
 * This module is the trust boundary. Everything served to an unauthenticated
 * viewer goes through `toCustomerShipment`, which builds a NEW object from an
 * explicit field allowlist. That direction matters: a blocklist silently leaks
 * every column added after it was written, and this table already carries
 * `valueUsd`, margin fields and the whole `importMeta` blob — internal cost
 * data an NVOCC must never show its customer.
 *
 * Pure: no db, no React, injectable `now`, so the rules are unit-testable and
 * identical in the page and the API route.
 */

import crypto from 'crypto';
import { deriveShipmentTimeline, type ShipmentTimeline } from '@/lib/shipments/timeline';

/** Row shape as read off the shipments table. Deliberately wider than output. */
export interface PortalSourceShipment {
  id: string;
  reference?: string | null;
  containerNumber?: string | null;
  containerType?: string | null;
  vesselName?: string | null;
  voyageNumber?: string | null;
  carrier?: string | null;
  pol?: string | null;
  pod?: string | null;
  originPort?: string | null;
  destPort?: string | null;
  etd?: string | Date | null;
  eta?: string | Date | null;
  status?: string | null;
  currentLocation?: string | null;
  goodsDescription?: string | null;
  cargoType?: string | null;
  quantity?: number | null;
  weightKg?: number | null;
  updatedAt?: string | Date | null;
  importMeta?: Record<string, unknown> | null;
}

/** Exactly what an unauthenticated customer may see. Nothing else. */
export interface CustomerShipment {
  id: string;
  reference: string | null;
  containerNumber: string | null;
  containerType: string | null;
  vesselName: string | null;
  voyageNumber: string | null;
  carrier: string | null;
  origin: string | null;
  destination: string | null;
  etd: string | null;
  eta: string | null;
  status: string;
  statusLabel: string;
  currentLocation: string | null;
  description: string | null;
  quantity: number | null;
  weightKg: number | null;
  /** Customer-facing reference numbers off the board — their own PO, not ours. */
  poNumber: string | null;
  lastUpdated: string | null;
  timeline: ShipmentTimeline;
}

/**
 * Fields that must never cross the boundary, asserted by a test.
 *
 * Keeping the list explicit means adding `valueUsd` to a portal response is a
 * test failure rather than a quiet disclosure of what the NVOCC paid.
 */
export const NEVER_EXPOSED_FIELDS = [
  'valueUsd',
  'freightCostUsd',
  'importMeta',
  'orgId',
  'userId',
  'bolDocumentId',
  'shipper',
  'consignee',
  'notifyParty',
  'source',
] as const;

const STATUS_LABELS: Record<string, string> = {
  booked: 'Booked',
  pending: 'Booked',
  in_transit: 'In Transit',
  at_port: 'At Port',
  customs: 'In Customs',
  arrived: 'Arrived',
  delivered: 'Delivered',
  delayed: 'Delayed',
};

export function customerStatusLabel(status: string | null | undefined): string {
  if (!status) return 'Booked';
  return STATUS_LABELS[status] ?? status.replace(/_/g, ' ');
}

function iso(value: string | Date | null | undefined): string | null {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

function str(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length ? value.trim() : null;
}

/**
 * Project a shipment down to the customer-safe view.
 *
 * Built by construction, not by deletion — the returned object literal IS the
 * contract. `importMeta` is read for exactly one field (the customer's own PO
 * number) and never passed through.
 */
export function toCustomerShipment(
  row: PortalSourceShipment,
  now: Date = new Date()
): CustomerShipment {
  const status = row.status ?? 'booked';
  const meta = row.importMeta ?? {};

  return {
    id: row.id,
    reference: str(row.reference),
    containerNumber: str(row.containerNumber),
    containerType: str(row.containerType),
    vesselName: str(row.vesselName),
    voyageNumber: str(row.voyageNumber),
    carrier: str(row.carrier),
    origin: str(row.pol) ?? str(row.originPort),
    destination: str(row.pod) ?? str(row.destPort),
    etd: iso(row.etd),
    eta: iso(row.eta),
    status,
    statusLabel: customerStatusLabel(status),
    currentLocation: str(row.currentLocation),
    description: str(row.goodsDescription) ?? str(row.cargoType),
    quantity: typeof row.quantity === 'number' ? row.quantity : null,
    weightKg: typeof row.weightKg === 'number' ? row.weightKg : null,
    poNumber: str(meta.poNumber),
    lastUpdated: iso(row.updatedAt),
    timeline: deriveShipmentTimeline(row, now),
  };
}

export interface PortalSummary {
  total: number;
  inTransit: number;
  arrived: number;
  delayed: number;
  /** Soonest upcoming ETA, ISO. Null when nothing is still on the water. */
  nextArrival: string | null;
}

const ARRIVED_STATUSES = new Set(['arrived', 'delivered']);

export function summarize(
  shipments: CustomerShipment[],
  now: Date = new Date()
): PortalSummary {
  const upcoming = shipments
    .filter((s) => s.eta && !ARRIVED_STATUSES.has(s.status))
    .map((s) => s.eta as string)
    .filter((eta) => new Date(eta).getTime() >= now.getTime())
    .sort();

  return {
    total: shipments.length,
    inTransit: shipments.filter((s) => !ARRIVED_STATUSES.has(s.status)).length,
    arrived: shipments.filter((s) => ARRIVED_STATUSES.has(s.status)).length,
    delayed: shipments.filter((s) => s.timeline.delayed).length,
    nextArrival: upcoming[0] ?? null,
  };
}

/**
 * Sort for the customer's eye: what is still moving, soonest arrival first;
 * delivered boxes drop to the bottom, most recent first. Undated rows sort
 * last within their group rather than jumping to the top on an empty date.
 */
export function sortForCustomer(shipments: CustomerShipment[]): CustomerShipment[] {
  const rank = (s: CustomerShipment) => (ARRIVED_STATUSES.has(s.status) ? 1 : 0);
  return [...shipments].sort((a, b) => {
    const byGroup = rank(a) - rank(b);
    if (byGroup !== 0) return byGroup;

    const ta = a.eta ? new Date(a.eta).getTime() : null;
    const tb = b.eta ? new Date(b.eta).getTime() : null;
    if (ta === null && tb === null) return (a.reference ?? '').localeCompare(b.reference ?? '');
    if (ta === null) return 1;
    if (tb === null) return -1;
    // Active: soonest first. Completed: most recent first.
    return rank(a) === 1 ? tb - ta : ta - tb;
  });
}

/**
 * 32 bytes of CSPRNG, hex-encoded. The token is the entire credential — there
 * is no second factor and no account behind it — so it is sized to be
 * unguessable rather than pretty, matching the invite/reset-token precedent
 * elsewhere in this codebase.
 */
export function generatePortalToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Customer codes on Blake's board are single letters and short codes ("C",
 * "KING"). Normalize on write so "c" and " C " resolve to the same portal —
 * otherwise one customer silently ends up with two links and revoking one
 * leaves the other live.
 */
export function normalizeCustomerCode(raw: string): string {
  return raw.trim().toUpperCase();
}

export function isValidCustomerCode(raw: unknown): raw is string {
  return typeof raw === 'string' && raw.trim().length > 0 && raw.trim().length <= 50;
}

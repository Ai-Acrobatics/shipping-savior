/**
 * Terminal49 & DCSA Tracking — Database Queries
 *
 * AI-12010: Queries for storage and retrieval of DCSA-normalized tracking
 * events, raw Terminal49 webhooks, and ETA change alerts.
 */

import { eq, desc, and, isNull, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  terminal49Webhooks,
  shipmentEvents,
  etaChangeAlerts,
  shipments,
  type NewTerminal49Webhook,
  type Terminal49Webhook,
  type NewShipmentEvent,
  type ShipmentEvent,
  type NewEtaChangeAlert,
  type EtaChangeAlert,
} from "@/lib/db/schema";

// ── Terminal49 Webhooks ───────────────────────────────

export async function insertTerminal49Webhook(
  data: NewTerminal49Webhook,
): Promise<Terminal49Webhook> {
  const [row] = await db.insert(terminal49Webhooks).values(data).returning();
  return row;
}

export async function markWebhookProcessed(
  id: string,
  errorMessage?: string,
): Promise<void> {
  await db
    .update(terminal49Webhooks)
    .set({
      processed: true,
      processedAt: new Date(),
      errorMessage: errorMessage ?? null,
    })
    .where(eq(terminal49Webhooks.id, id));
}

export async function getUnprocessedWebhooks(): Promise<Terminal49Webhook[]> {
  return db
    .select()
    .from(terminal49Webhooks)
    .where(eq(terminal49Webhooks.processed, false))
    .orderBy(desc(terminal49Webhooks.createdAt))
    .limit(50);
}

// ── Shipment Events ───────────────────────────────────

export async function insertShipmentEvent(
  data: NewShipmentEvent,
): Promise<ShipmentEvent> {
  const [row] = await db.insert(shipmentEvents).values(data).returning();
  return row;
}

export async function bulkInsertShipmentEvents(
  events: NewShipmentEvent[],
): Promise<ShipmentEvent[]> {
  if (events.length === 0) return [];
  return db.insert(shipmentEvents).values(events).returning();
}

export async function getShipmentEventsByShipment(
  shipmentId: string,
): Promise<ShipmentEvent[]> {
  return db
    .select()
    .from(shipmentEvents)
    .where(eq(shipmentEvents.shipmentId, shipmentId))
    .orderBy(desc(shipmentEvents.eventTime));
}

export async function getShipmentEventsByContainer(
  containerNumber: string,
): Promise<ShipmentEvent[]> {
  return db
    .select()
    .from(shipmentEvents)
    .where(eq(shipmentEvents.containerNumber, containerNumber))
    .orderBy(desc(shipmentEvents.eventTime));
}

export async function getLatestEventForContainer(
  containerNumber: string,
): Promise<ShipmentEvent | null> {
  const [row] = await db
    .select()
    .from(shipmentEvents)
    .where(eq(shipmentEvents.containerNumber, containerNumber))
    .orderBy(desc(shipmentEvents.eventTime))
    .limit(1);
  return row ?? null;
}

/**
 * Link events to a shipment once the shipment is identified (by container number).
 */
export async function linkEventsToShipment(
  containerNumber: string,
  shipmentId: string,
): Promise<void> {
  await db
    .update(shipmentEvents)
    .set({ shipmentId })
    .where(
      and(
        eq(shipmentEvents.containerNumber, containerNumber),
        isNull(shipmentEvents.shipmentId),
      ),
    );
}

// ── ETA Change Alerts ─────────────────────────────────

export async function insertEtaChangeAlert(
  data: NewEtaChangeAlert,
): Promise<EtaChangeAlert> {
  const [row] = await db.insert(etaChangeAlerts).values(data).returning();
  return row;
}

export async function getEtaChangeAlertsByShipment(
  shipmentId: string,
): Promise<EtaChangeAlert[]> {
  return db
    .select()
    .from(etaChangeAlerts)
    .where(eq(etaChangeAlerts.shipmentId, shipmentId))
    .orderBy(desc(etaChangeAlerts.createdAt));
}

export async function getUnacknowledgedEtaAlerts(
  orgId: string,
): Promise<(EtaChangeAlert & { shipmentReference?: string | null })[]> {
  const rows = await db
    .select({
      alert: etaChangeAlerts,
      reference: shipments.reference,
    })
    .from(etaChangeAlerts)
    .innerJoin(shipments, eq(etaChangeAlerts.shipmentId, shipments.id))
    .where(
      and(
        eq(etaChangeAlerts.acknowledged, false),
        eq(shipments.orgId, orgId),
      ),
    )
    .orderBy(desc(etaChangeAlerts.createdAt))
    .limit(20);

  return rows.map((r) => ({
    ...r.alert,
    shipmentReference: r.reference,
  }));
}

export async function acknowledgeEtaAlert(id: string): Promise<void> {
  await db
    .update(etaChangeAlerts)
    .set({ acknowledged: true, acknowledgedAt: new Date() })
    .where(eq(etaChangeAlerts.id, id));
}

export async function markEtaAlertNotified(id: string): Promise<void> {
  await db
    .update(etaChangeAlerts)
    .set({ notified: true, notifiedAt: new Date() })
    .where(eq(etaChangeAlerts.id, id));
}

export { terminal49Webhooks, shipmentEvents, etaChangeAlerts, shipments };

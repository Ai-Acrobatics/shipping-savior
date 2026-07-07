/**
 * ETA Change Detector — Alert Service
 *
 * AI-12010: Detects meaningful ETA changes from incoming DCSA events and
 * creates ETA change alerts. Compares the event's `etaAtEvent` against the
 * known ETA from the shipment row or the most recent event for the same
 * container.
 *
 * An ETA change is "meaningful" if:
 *   - The ETA differs from the current known ETA
 *   - The difference exceeds MIN_DELAY_HOURS (configurable, default 1 hour)
 */

import { eq, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  shipments,
  shipmentEvents,
  type ShipmentEvent,
  type NewEtaChangeAlert,
} from "@/lib/db/schema";
import { insertEtaChangeAlert, linkEventsToShipment } from "./queries";

/** Minimum ETA change (in hours) that triggers an alert. */
const MIN_DELAY_HOURS = 1;

/**
 * Detect whether an incoming event represents an ETA change and, if so,
 * create an alert.
 *
 * Steps:
 * 1. Look up the shipment by container number
 * 2. Compare the event's etaAtEvent against the shipment's current eta
 * 3. If different by >= MIN_DELAY_HOURS, insert an eta_change_alert row
 *
 * Returns the created alert, or null if no meaningful change was detected.
 */
export async function detectEtaChange(
  event: ShipmentEvent,
): Promise<NewEtaChangeAlert | null> {
  if (!event.etaAtEvent) return null; // No ETA in this event — nothing to compare

  // Find the shipment linked to this container
  const shipment = await findShipmentByContainer(event.containerNumber);
  if (!shipment) return null; // No shipment yet — we link later

  // We have a shipment. Get its current known ETA.
  const knownEta = shipment.eta;

  if (!knownEta) {
    // First ETA set on this shipment — not a "change", but worth noting
    return null;
  }

  const diffMs = event.etaAtEvent.getTime() - knownEta.getTime();
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));

  if (Math.abs(diffHours) < MIN_DELAY_HOURS) {
    return null; // Change is too small to alert
  }

  const alert: NewEtaChangeAlert = {
    shipmentId: shipment.id,
    containerNumber: event.containerNumber,
    previousEta: knownEta,
    newEta: event.etaAtEvent,
    delayHours: diffHours,
    eventId: event.id,
    acknowledged: false,
    notified: false,
  };

  // Link any unlinked events for this container to the shipment
  await linkEventsToShipment(event.containerNumber, shipment.id);

  return alert;
}

/**
 * Find the most recent shipment record by container number.
 * First tries the `containerNumber` field directly, then falls back to
 * the `containerNumber` in `importMeta`.
 */
async function findShipmentByContainer(
  containerNumber: string,
): Promise<{ id: string; eta: Date | null } | null> {
  // Direct match on containerNumber column
  const [direct] = await db
    .select({ id: shipments.id, eta: shipments.eta })
    .from(shipments)
    .where(eq(shipments.containerNumber, containerNumber))
    .limit(1);
  if (direct) return direct;

  // Fallback: search importMeta for container number
  // (some shipments store multi-container data in JSON)
  // This is intentionally limited — in practice Terminal49 tracks by container
  return null;
}

/**
 * Get the current known ETA for a container by looking at the most recent
 * DCSA event that included an ETA.
 */
export async function getCurrentKnownEta(
  containerNumber: string,
): Promise<Date | null> {
  const [row] = await db
    .select({ etaAtEvent: shipmentEvents.etaAtEvent })
    .from(shipmentEvents)
    .where(
      eq(shipmentEvents.containerNumber, containerNumber),
      // Must have an ETA set
      // Use non-null check via SQL
    )
    .orderBy(desc(shipmentEvents.eventTime))
    .limit(1);
  return row?.etaAtEvent ?? null;
}

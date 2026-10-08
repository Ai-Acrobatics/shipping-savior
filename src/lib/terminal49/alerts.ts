/**
 * ETA Change Detector — Alert Service
 *
 * AI-12010: Detects meaningful ETA changes from incoming DCSA events and
 * creates ETA change alerts. Compares the event's `etaAtEvent` against the
 * shipment's current ETA, then moves the shipment's ETA forward so the same
 * change does not alert twice.
 *
 * An ETA change is "meaningful" if it differs from the shipment's current ETA
 * by at least MIN_DELAY_HOURS (see ./eta).
 */

import { and, desc, eq, isNotNull } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  shipments,
  shipmentEvents,
  type ShipmentEvent,
  type NewEtaChangeAlert,
} from "@/lib/db/schema";
import { linkEventsToShipment } from "./queries";
import { etaDelayHours } from "./eta";

/**
 * Detect whether an incoming event represents an ETA change.
 *
 * - No ETA on the event, or no shipment for the container → null
 * - Shipment has no ETA yet → adopt the event's ETA, no alert
 * - ETA moved by >= MIN_DELAY_HOURS → update the shipment and return an alert
 *
 * Returns the alert to insert, or null.
 */
export async function detectEtaChange(
  event: ShipmentEvent,
): Promise<NewEtaChangeAlert | null> {
  if (!event.etaAtEvent) return null;

  const shipment = await findShipmentByContainer(event.containerNumber);
  if (!shipment) return null;

  const knownEta = shipment.eta;
  if (!knownEta) {
    await updateShipmentEta(shipment.id, event.etaAtEvent);
    return null;
  }

  const delayHours = etaDelayHours(knownEta, event.etaAtEvent);
  if (delayHours === null) return null;

  await updateShipmentEta(shipment.id, event.etaAtEvent);

  return {
    shipmentId: shipment.id,
    containerNumber: event.containerNumber,
    previousEta: knownEta,
    newEta: event.etaAtEvent,
    delayHours,
    eventId: event.id,
    acknowledged: false,
    notified: false,
  };
}

/**
 * Resolve the shipment for a container and attach any unlinked events to it.
 * Returns the shipment id, or null when no shipment tracks this container.
 */
export async function linkContainerToShipment(
  containerNumber: string,
): Promise<string | null> {
  const shipment = await findShipmentByContainer(containerNumber);
  if (!shipment) return null;
  await linkEventsToShipment(containerNumber, shipment.id);
  return shipment.id;
}

async function findShipmentByContainer(
  containerNumber: string,
): Promise<{ id: string; eta: Date | null } | null> {
  const [row] = await db
    .select({ id: shipments.id, eta: shipments.eta })
    .from(shipments)
    .where(eq(shipments.containerNumber, containerNumber))
    .orderBy(desc(shipments.createdAt))
    .limit(1);
  return row ?? null;
}

async function updateShipmentEta(shipmentId: string, eta: Date): Promise<void> {
  await db
    .update(shipments)
    .set({ eta, updatedAt: new Date() })
    .where(eq(shipments.id, shipmentId));
}

/**
 * Get the current known ETA for a container from the most recent DCSA event
 * that carried one.
 */
export async function getCurrentKnownEta(
  containerNumber: string,
): Promise<Date | null> {
  const [row] = await db
    .select({ etaAtEvent: shipmentEvents.etaAtEvent })
    .from(shipmentEvents)
    .where(
      and(
        eq(shipmentEvents.containerNumber, containerNumber),
        isNotNull(shipmentEvents.etaAtEvent),
      ),
    )
    .orderBy(desc(shipmentEvents.eventTime))
    .limit(1);
  return row?.etaAtEvent ?? null;
}

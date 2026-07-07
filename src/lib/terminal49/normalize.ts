/**
 * DCSA Event Normalizer — Terminal49 → DCSA format.
 *
 * AI-12010: Translates Terminal49 webhook payloads to DCSA (Digital Container
 * Shipping Association) standardized event types, suitable for ingestion into
 * the `shipment_events` table.
 *
 * Terminal49 webhook payloads contain a `data` object with container tracking
 * updates. The `event_type` field in Terminal49 maps to DCSA event types via
 * the mapping below.
 *
 * Reference:
 *   - Terminal49 webhook docs: https://docs.terminal49.com/webhooks
 *   - DCSA event model: https://dcsa.org/standards/event-model/
 */

import type { DcsaEventType, NewShipmentEvent } from "@/lib/db/schema";

// ── Terminal49 event type → DCSA event type mapping ────────────────
//
// Terminal49 sends events like: 'vessel_departed', 'vessel_arrived',
// 'gate_out', 'gate_in', 'customs_hold', 'customs_release', 'delivery',
// 'estimated_arrival', 'estimated_departure', etc.
// Also 'tracking.created' (new container tracked) and 'tracking.updated'.
//
// We map known Terminal49 event types to DCSA equivalents. Unknown types
// fall through to 'OTHER'.

const T49_TO_DCSA: Record<string, DcsaEventType> = {
  vessel_departed: "DEPARTURE",
  vessel_arrived: "ARRIVAL",
  vessel_loaded: "LOAD",
  vessel_discharged: "DISCHARGE",
  gate_out: "GATE_OUT",
  gate_in: "GATE_IN",
  customs_hold: "CUSTOMS_HOLD",
  customs_release: "CUSTOMS_RELEASE",
  inspection: "INSPECTION",
  pickup: "PICKUP",
  delivery: "DELIVERY",
  estimated_arrival: "ESTIMATED_ARRIVAL",
  estimated_departure: "ESTIMATED_DEPARTURE",
};

// Terminal49 payload shape (simplified — actual fields vary by event type)
interface Terminal49EventPayload {
  event_type?: string;
  container_number?: string;
  estimated_arrival?: string;   // ISO 8601
  estimated_departure?: string; // ISO 8601
  event_time?: string;          // ISO 8601
  location?: string;
  location_code?: string;
  vessel_name?: string;
  voyage_number?: string;
  facility_name?: string;
  carrier?: string;
  // Free-form metadata Terminal49 attaches
  metadata?: Record<string, unknown>;
}

/**
 * Maps a Terminal49 webhook event type string to a DCSA event type.
 * Returns 'OTHER' for unrecognized event types.
 */
export function mapT49EventType(t49Type: string): DcsaEventType {
  return T49_TO_DCSA[t49Type] ?? "OTHER";
}

/**
 * Extracts the ETA from a Terminal49 event payload. Checks both the
 * `estimated_arrival` field on the event itself, and any nested metadata.
 */
function extractEta(payload: Terminal49EventPayload): Date | undefined {
  const raw =
    payload.estimated_arrival ??
    (payload.metadata as Record<string, string> | undefined)?.["estimated_arrival"];
  if (!raw) return undefined;
  const d = new Date(raw);
  return isNaN(d.getTime()) ? undefined : d;
}

/**
 * Extracts the event time from a Terminal49 payload.
 * Falls back to current time if unspecified.
 */
function extractEventTime(payload: Terminal49EventPayload): Date | undefined {
  if (!payload.event_time) return undefined;
  const d = new Date(payload.event_time);
  return isNaN(d.getTime()) ? undefined : d;
}

/**
 * Normalize a single Terminal49 event payload into a NewShipmentEvent (DCSA format).
 *
 * @param t49Type  The Terminal49 event type string (e.g. 'vessel_departed')
 * @param payload  The event payload from Terminal49
 * @returns        A NewShipmentEvent ready for DB insert, or null if the payload
 *                 is missing required fields
 */
export function normalizeT49Event(
  t49Type: string,
  payload: Terminal49EventPayload,
): Omit<NewShipmentEvent, "id" | "createdAt"> | null {
  const containerNumber = payload.container_number;
  if (!containerNumber) {
    return null; // Can't track without a container number
  }

  const eventType = mapT49EventType(t49Type);
  const eventTime = extractEventTime(payload);
  const etaAtEvent = extractEta(payload);

  // Build metadata bag with any additional carrier/vessel info
  const metadata: Record<string, unknown> = {};
  if (payload.vessel_name) metadata.vessel_name = payload.vessel_name;
  if (payload.voyage_number) metadata.voyage_number = payload.voyage_number;
  if (payload.facility_name) metadata.facility_name = payload.facility_name;
  if (payload.carrier) metadata.carrier = payload.carrier;
  if (payload.metadata) {
    // Merge, with explicit fields taking precedence
    for (const [k, v] of Object.entries(payload.metadata)) {
      if (!(k in metadata)) {
        metadata[k] = v;
      }
    }
  }

  return {
    containerNumber,
    eventType,
    source: "terminal49",
    sourceEventId: `${t49Type}_${containerNumber}_${eventTime?.toISOString() ?? Date.now()}`,
    eventTime,
    location: payload.location ?? null,
    locationCode: payload.location_code ?? null,
    etaAtEvent: etaAtEvent ?? null,
    metadata: Object.keys(metadata).length > 0 ? metadata : null,
    description: null,
    shipmentId: null,
    webhookId: null,
  };
}

/**
 * Extracts all DCSA events from a Terminal49 webhook payload.
 *
 * Terminal49 webhooks can contain:
 *   - A single event with container data
 *   - A list of events in the payload
 *
 * Returns an array of normalized events (may be empty if no valid events found).
 */
export function extractEventsFromWebhook(
  t49EventType: string,
  rawPayload: Record<string, unknown>,
): Omit<NewShipmentEvent, "id" | "createdAt">[] {
  const events: Omit<NewShipmentEvent, "id" | "createdAt">[] = [];

  // Pattern 1: Single event with data nested at top level
  const data = rawPayload.data as Terminal49EventPayload | undefined;
  if (data?.container_number) {
    const event = normalizeT49Event(t49EventType, data);
    if (event) events.push(event);
  }

  // Pattern 2: data.events array (batch webhook)
  const dataEvents = (rawPayload.data as Record<string, unknown> | undefined)
    ?.events as Terminal49EventPayload[] | undefined;
  if (dataEvents) {
    for (const ev of dataEvents) {
      const event = normalizeT49Event(ev.event_type ?? t49EventType, ev);
      if (event) events.push(event);
    }
  }

  return events;
}

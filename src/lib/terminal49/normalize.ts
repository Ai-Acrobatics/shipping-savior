/**
 * DCSA Event Normalizer — Terminal49 → DCSA format.
 *
 * AI-12010: Translates Terminal49 webhook notifications to DCSA (Digital
 * Container Shipping Association) event types, suitable for ingestion into the
 * `shipment_events` table.
 *
 * Terminal49 delivers webhooks as JSON:API documents:
 *
 *   {
 *     "data": {
 *       "id": "<notification id — idempotency key>",
 *       "type": "webhook_notification",
 *       "attributes": { "event": "container.transport.vessel_departed", ... },
 *       "relationships": { "reference_object": { "data": { "id", "type" } } }
 *     },
 *     "included": [ transport_event | estimated_event | container | shipment | port | vessel | ... ]
 *   }
 *
 * The reference object (a `transport_event` or `estimated_event`) carries the
 * milestone; the container number, vessel, port and shipment ETA are resolved
 * through its relationships into `included`.
 *
 * A flat legacy shape (`data.container_number`, `data.events[]`) is still
 * accepted so manual/test posts keep working.
 *
 * Reference:
 *   - https://terminal49.com/docs/api-docs/webhooks/payloads
 *   - https://terminal49.com/docs/api-docs/webhooks/event-catalog
 *   - DCSA event model: https://dcsa.org/standards/event-model/
 */

import type { DcsaEventType, NewShipmentEvent } from "@/lib/db/schema";

export type NormalizedEvent = Omit<NewShipmentEvent, "id" | "createdAt">;

// ── Terminal49 event name → DCSA event type ────────────────────────
//
// Keys are Terminal49 event names with the `container.transport.` prefix
// stripped (see `mapT49EventType`). Legacy flat names are kept as aliases.

const T49_TO_DCSA: Record<string, DcsaEventType> = {
  // Origin
  empty_out: "GATE_OUT",
  full_in: "GATE_IN",
  vessel_loaded: "LOAD",
  vessel_departed: "DEPARTURE",
  // Transshipment / feeder
  transshipment_arrived: "ARRIVAL",
  transshipment_discharged: "DISCHARGE",
  transshipment_loaded: "LOAD",
  transshipment_departed: "DEPARTURE",
  feeder_arrived: "ARRIVAL",
  feeder_discharged: "DISCHARGE",
  feeder_loaded: "LOAD",
  feeder_departed: "DEPARTURE",
  // Destination
  vessel_arrived: "ARRIVAL",
  vessel_berthed: "ARRIVAL",
  vessel_discharged: "DISCHARGE",
  full_out: "GATE_OUT",
  delivered: "DELIVERY",
  empty_in: "GATE_IN",
  // Rail / inland
  rail_loaded: "LOAD",
  rail_departed: "DEPARTURE",
  rail_arrived: "ARRIVAL",
  rail_unloaded: "DISCHARGE",
  arrived_at_inland_destination: "ARRIVAL",
  // Estimates
  "estimated.vessel_departed": "ESTIMATED_DEPARTURE",
  "estimated.vessel_arrived": "ESTIMATED_ARRIVAL",
  "estimated.arrived_at_inland_destination": "ESTIMATED_ARRIVAL",
  "shipment.estimated.arrival": "ESTIMATED_ARRIVAL",
  // Legacy flat names
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

/**
 * Maps a Terminal49 event name (with or without the `container.transport.`
 * prefix) to a DCSA event type. Returns 'OTHER' for unrecognized names.
 */
export function mapT49EventType(t49Type: string): DcsaEventType {
  const key = t49Type.replace(/^container\.transport\./, "");
  return T49_TO_DCSA[key] ?? "OTHER";
}

/** True for event names that describe a container milestone or estimate. */
export function isTrackingEvent(t49Type: string): boolean {
  return (
    t49Type.startsWith("container.transport.") ||
    t49Type === "shipment.estimated.arrival"
  );
}

// ── JSON:API helpers ───────────────────────────────────────────────

interface ResourceRef {
  id: string;
  type: string;
}

interface Resource extends ResourceRef {
  attributes?: Record<string, unknown>;
  relationships?: Record<string, { data?: ResourceRef | ResourceRef[] | null }>;
}

function asRecord(v: unknown): Record<string, unknown> | undefined {
  return v && typeof v === "object" && !Array.isArray(v)
    ? (v as Record<string, unknown>)
    : undefined;
}

function str(v: unknown): string | undefined {
  return typeof v === "string" && v.length > 0 ? v : undefined;
}

function toDate(v: unknown): Date | undefined {
  if (typeof v !== "string") return undefined;
  const d = new Date(v);
  return isNaN(d.getTime()) ? undefined : d;
}

function refs(resource: Resource | undefined, rel: string): ResourceRef[] {
  const data = resource?.relationships?.[rel]?.data;
  if (!data) return [];
  return Array.isArray(data) ? data : [data];
}

class IncludedIndex {
  private byKey = new Map<string, Resource>();

  constructor(included: unknown) {
    if (!Array.isArray(included)) return;
    for (const item of included) {
      const r = asRecord(item);
      if (r && typeof r.id === "string" && typeof r.type === "string") {
        this.byKey.set(`${r.type}:${r.id}`, r as unknown as Resource);
      }
    }
  }

  get(ref: ResourceRef | undefined): Resource | undefined {
    return ref ? this.byKey.get(`${ref.type}:${ref.id}`) : undefined;
  }

  first(resource: Resource | undefined, rel: string): Resource | undefined {
    return this.get(refs(resource, rel)[0]);
  }

  all(resource: Resource | undefined, rel: string): Resource[] {
    return refs(resource, rel)
      .map((r) => this.get(r))
      .filter((r): r is Resource => !!r);
  }

  ofType(type: string): Resource[] {
    return [...this.byKey.values()].filter((r) => r.type === type);
  }
}

// ── Envelope ───────────────────────────────────────────────────────

export interface T49Envelope {
  /** `data.id` — Terminal49's idempotency key for the notification. */
  notificationId?: string;
  /** `data.attributes.event`, e.g. `container.transport.vessel_departed`. */
  event: string;
}

/**
 * Read the notification id and event name from a webhook body. Falls back to
 * the legacy top-level `event_id` / `event_type` keys.
 */
export function parseT49Envelope(body: Record<string, unknown>): T49Envelope {
  const data = asRecord(body.data);
  const attrs = asRecord(data?.attributes);
  const isNotification = data?.type === "webhook_notification";
  return {
    notificationId: isNotification ? str(data?.id) : str(body.event_id),
    event: str(attrs?.event) ?? str(body.event_type) ?? "tracking.updated",
  };
}

// ── JSON:API normalization ─────────────────────────────────────────

function normalizeJsonApi(body: Record<string, unknown>): NormalizedEvent[] {
  const data = asRecord(body.data) as Resource | undefined;
  if (!data || data.type !== "webhook_notification") return [];

  const notifEvent = str(data.attributes?.event) ?? "";
  if (!isTrackingEvent(notifEvent)) return [];

  const idx = new IncludedIndex(body.included);
  const reference = idx.first(data, "reference_object");
  const refAttrs = reference?.attributes ?? {};
  const t49Event = str(refAttrs.event) ?? notifEvent;
  const eventType = mapT49EventType(t49Event);
  const isEstimate = eventType === "ESTIMATED_ARRIVAL" || eventType === "ESTIMATED_DEPARTURE";

  const shipment = idx.first(reference, "shipment") ?? idx.ofType("shipment")[0];
  const shipAttrs = shipment?.attributes ?? {};

  // Containers: the reference's own container, else every container on the
  // shipment (estimated events are shipment-level), else any included container.
  let containers = idx.all(reference, "container");
  if (containers.length === 0) containers = idx.all(shipment, "containers");
  if (containers.length === 0) containers = idx.ofType("container");

  const vessel = idx.first(reference, "vessel");
  const location = idx.first(reference, "location") ?? idx.first(reference, "port");
  const terminal = idx.first(reference, "terminal");

  const estimatedAt = toDate(refAttrs.estimated_timestamp) ?? toDate(refAttrs.timestamp);
  const eventTime = isEstimate
    ? toDate(refAttrs.created_at) ?? toDate(data.attributes?.created_at)
    : toDate(refAttrs.timestamp) ?? toDate(data.attributes?.created_at);

  // ETA at POD as known when this event fired. An arrival estimate *is* the
  // new ETA; for everything else use the shipment's current POD ETA.
  const etaAtEvent =
    eventType === "ESTIMATED_ARRIVAL" && estimatedAt
      ? estimatedAt
      : toDate(shipAttrs.pod_eta_at);

  const metadata: Record<string, unknown> = { t49_event: t49Event };
  const voyage = str(refAttrs.voyage_number);
  if (voyage) metadata.voyage_number = voyage;
  const vesselName = str(vessel?.attributes?.name);
  if (vesselName) metadata.vessel_name = vesselName;
  const imo = str(vessel?.attributes?.imo);
  if (imo) metadata.vessel_imo = imo;
  const terminalName = str(terminal?.attributes?.name);
  if (terminalName) metadata.facility_name = terminalName;
  const bol = str(shipAttrs.bill_of_lading_number);
  if (bol) metadata.bill_of_lading_number = bol;
  if (isEstimate && estimatedAt) metadata.estimated_timestamp = estimatedAt.toISOString();

  const locationCode =
    str(refAttrs.location_locode) ?? str(location?.attributes?.code) ?? null;
  const locationName = str(location?.attributes?.name) ?? null;

  const events: NormalizedEvent[] = [];
  for (const container of containers) {
    const containerNumber = str(container.attributes?.number);
    if (!containerNumber) continue;
    events.push({
      containerNumber,
      eventType,
      source: "terminal49",
      sourceEventId: `t49:${reference?.id ?? data.id}:${containerNumber}`,
      eventTime: eventTime ?? null,
      location: locationName,
      locationCode: locationCode?.slice(0, 10) ?? null,
      etaAtEvent: etaAtEvent ?? null,
      metadata,
      description: t49Event,
      shipmentId: null,
      webhookId: null,
    });
  }
  return events;
}

// ── Legacy flat normalization ──────────────────────────────────────

interface LegacyEventPayload {
  event_type?: string;
  container_number?: string;
  estimated_arrival?: string;
  event_time?: string;
  location?: string;
  location_code?: string;
  vessel_name?: string;
  voyage_number?: string;
  facility_name?: string;
  carrier?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Normalize a single flat event payload into a DCSA event. Returns null when
 * the payload has no container number.
 */
export function normalizeT49Event(
  t49Type: string,
  payload: LegacyEventPayload,
): NormalizedEvent | null {
  const containerNumber = payload.container_number;
  if (!containerNumber) return null;

  const eventTime = toDate(payload.event_time);
  const etaAtEvent =
    toDate(payload.estimated_arrival) ?? toDate(payload.metadata?.estimated_arrival);

  const metadata: Record<string, unknown> = { ...(payload.metadata ?? {}) };
  if (payload.vessel_name) metadata.vessel_name = payload.vessel_name;
  if (payload.voyage_number) metadata.voyage_number = payload.voyage_number;
  if (payload.facility_name) metadata.facility_name = payload.facility_name;
  if (payload.carrier) metadata.carrier = payload.carrier;

  return {
    containerNumber,
    eventType: mapT49EventType(t49Type),
    source: "terminal49",
    // Without an event time there is no stable dedup key; leave it null
    // rather than minting a random one that defeats the unique index.
    sourceEventId: eventTime ? `${t49Type}_${containerNumber}_${eventTime.toISOString()}` : null,
    eventTime: eventTime ?? null,
    location: payload.location ?? null,
    locationCode: payload.location_code ?? null,
    etaAtEvent: etaAtEvent ?? null,
    metadata: Object.keys(metadata).length > 0 ? metadata : null,
    description: null,
    shipmentId: null,
    webhookId: null,
  };
}

function normalizeLegacy(
  t49EventType: string,
  body: Record<string, unknown>,
): NormalizedEvent[] {
  const data = asRecord(body.data) as (LegacyEventPayload & { events?: unknown }) | undefined;
  if (!data) return [];
  const events: NormalizedEvent[] = [];

  if (data.container_number) {
    const ev = normalizeT49Event(data.event_type ?? t49EventType, data);
    if (ev) events.push(ev);
  }
  if (Array.isArray(data.events)) {
    for (const raw of data.events as LegacyEventPayload[]) {
      const ev = normalizeT49Event(raw.event_type ?? t49EventType, raw);
      if (ev) events.push(ev);
    }
  }
  return events;
}

/**
 * Extract all DCSA events from a Terminal49 webhook body. Returns an empty
 * array for notifications that carry no container milestone (e.g.
 * `tracking_request.succeeded`, `container.updated`).
 */
export function extractEventsFromWebhook(
  t49EventType: string,
  rawPayload: Record<string, unknown>,
): NormalizedEvent[] {
  const data = asRecord(rawPayload.data);
  if (data?.type === "webhook_notification") return normalizeJsonApi(rawPayload);
  return normalizeLegacy(t49EventType, rawPayload);
}

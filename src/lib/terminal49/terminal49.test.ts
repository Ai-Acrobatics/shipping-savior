import { describe, it, expect, vi } from "vitest";

// handler.ts pulls in the DB-backed query/alert modules; the functions under
// test here are pure, so stub those out.
vi.mock("./queries", () => ({}));
vi.mock("./alerts", () => ({}));

import {
  extractEventsFromWebhook,
  mapT49EventType,
  parseT49Envelope,
} from "./normalize";
import { computeSignature, validateRequest } from "./handler";
import { etaDelayHours } from "./eta";

// Shape follows https://terminal49.com/docs/api-docs/webhooks/payloads
function transportNotification(event = "container.transport.vessel_departed") {
  return {
    data: {
      id: "notif-1",
      type: "webhook_notification",
      attributes: { event, delivery_status: "pending", created_at: "2026-10-01T10:00:00Z" },
      relationships: {
        reference_object: { data: { id: "te-1", type: "transport_event" } },
      },
    },
    included: [
      {
        id: "te-1",
        type: "transport_event",
        attributes: {
          event,
          timestamp: "2026-10-01T08:30:00Z",
          voyage_number: "045W",
          location_locode: "CNSHA",
        },
        relationships: {
          container: { data: { id: "c-1", type: "container" } },
          shipment: { data: { id: "s-1", type: "shipment" } },
          vessel: { data: { id: "v-1", type: "vessel" } },
          location: { data: { id: "p-1", type: "port" } },
        },
      },
      { id: "c-1", type: "container", attributes: { number: "MSCU1234567" } },
      {
        id: "s-1",
        type: "shipment",
        attributes: { bill_of_lading_number: "MEDUXX123", pod_eta_at: "2026-10-28T00:00:00Z" },
        relationships: { containers: { data: [{ id: "c-1", type: "container" }] } },
      },
      { id: "v-1", type: "vessel", attributes: { name: "MSC GULSUN", imo: "9839430" } },
      { id: "p-1", type: "port", attributes: { name: "Shanghai", code: "CNSHA" } },
    ],
  };
}

describe("mapT49EventType", () => {
  it("maps Terminal49 catalog events to DCSA types", () => {
    expect(mapT49EventType("container.transport.vessel_loaded")).toBe("LOAD");
    expect(mapT49EventType("container.transport.vessel_departed")).toBe("DEPARTURE");
    expect(mapT49EventType("container.transport.vessel_berthed")).toBe("ARRIVAL");
    expect(mapT49EventType("container.transport.rail_unloaded")).toBe("DISCHARGE");
    expect(mapT49EventType("container.transport.full_out")).toBe("GATE_OUT");
    expect(mapT49EventType("container.transport.empty_in")).toBe("GATE_IN");
    expect(mapT49EventType("container.transport.delivered")).toBe("DELIVERY");
    expect(mapT49EventType("container.transport.estimated.vessel_arrived")).toBe("ESTIMATED_ARRIVAL");
    expect(mapT49EventType("shipment.estimated.arrival")).toBe("ESTIMATED_ARRIVAL");
  });

  it("falls back to OTHER", () => {
    expect(mapT49EventType("container.transport.available")).toBe("OTHER");
    expect(mapT49EventType("something.new")).toBe("OTHER");
  });
});

describe("parseT49Envelope", () => {
  it("reads the notification id and event from a JSON:API body", () => {
    expect(parseT49Envelope(transportNotification())).toEqual({
      notificationId: "notif-1",
      event: "container.transport.vessel_departed",
    });
  });

  it("accepts the legacy flat shape", () => {
    expect(parseT49Envelope({ event_id: "e1", event_type: "vessel_arrived" })).toEqual({
      notificationId: "e1",
      event: "vessel_arrived",
    });
  });
});

describe("extractEventsFromWebhook", () => {
  it("normalizes a transport_event notification", () => {
    const [ev, ...rest] = extractEventsFromWebhook(
      "container.transport.vessel_departed",
      transportNotification(),
    );
    expect(rest).toHaveLength(0);
    expect(ev).toMatchObject({
      containerNumber: "MSCU1234567",
      eventType: "DEPARTURE",
      source: "terminal49",
      sourceEventId: "t49:te-1:MSCU1234567",
      location: "Shanghai",
      locationCode: "CNSHA",
      description: "container.transport.vessel_departed",
    });
    expect(ev.eventTime?.toISOString()).toBe("2026-10-01T08:30:00.000Z");
    expect(ev.etaAtEvent?.toISOString()).toBe("2026-10-28T00:00:00.000Z");
    expect(ev.metadata).toMatchObject({
      vessel_name: "MSC GULSUN",
      voyage_number: "045W",
      bill_of_lading_number: "MEDUXX123",
    });
  });

  it("uses the estimate as the new ETA for an estimated arrival, per container", () => {
    const body = {
      data: {
        id: "notif-2",
        type: "webhook_notification",
        attributes: { event: "shipment.estimated.arrival", created_at: "2026-10-02T00:00:00Z" },
        relationships: { reference_object: { data: { id: "ee-1", type: "estimated_event" } } },
      },
      included: [
        {
          id: "ee-1",
          type: "estimated_event",
          attributes: { event: "shipment.estimated.arrival", estimated_timestamp: "2026-11-02T06:00:00Z" },
          relationships: { shipment: { data: { id: "s-1", type: "shipment" } } },
        },
        {
          id: "s-1",
          type: "shipment",
          attributes: { pod_eta_at: "2026-10-28T00:00:00Z" },
          relationships: {
            containers: { data: [{ id: "c-1", type: "container" }, { id: "c-2", type: "container" }] },
          },
        },
        { id: "c-1", type: "container", attributes: { number: "MSCU1234567" } },
        { id: "c-2", type: "container", attributes: { number: "MSCU7654321" } },
      ],
    };
    const events = extractEventsFromWebhook("shipment.estimated.arrival", body);
    expect(events.map((e) => e.containerNumber)).toEqual(["MSCU1234567", "MSCU7654321"]);
    for (const ev of events) {
      expect(ev.eventType).toBe("ESTIMATED_ARRIVAL");
      expect(ev.etaAtEvent?.toISOString()).toBe("2026-11-02T06:00:00.000Z");
      expect(ev.eventTime?.toISOString()).toBe("2026-10-02T00:00:00.000Z");
    }
    expect(new Set(events.map((e) => e.sourceEventId)).size).toBe(2);
  });

  it("ignores notifications without a container milestone", () => {
    const body = transportNotification();
    body.data.attributes.event = "tracking_request.succeeded";
    expect(extractEventsFromWebhook("tracking_request.succeeded", body)).toEqual([]);
  });

  it("produces the same dedup key on redelivery", () => {
    const a = extractEventsFromWebhook("x", transportNotification());
    const b = extractEventsFromWebhook("x", transportNotification());
    expect(a[0].sourceEventId).toBe(b[0].sourceEventId);
  });

  it("still handles the legacy flat payload", () => {
    const events = extractEventsFromWebhook("vessel_arrived", {
      data: {
        container_number: "TGHU0000001",
        event_time: "2026-10-03T00:00:00Z",
        estimated_arrival: "2026-10-03T00:00:00Z",
        events: [{ event_type: "gate_out", container_number: "TGHU0000001" }],
      },
    });
    expect(events.map((e) => e.eventType)).toEqual(["ARRIVAL", "GATE_OUT"]);
    // No event time → no fabricated dedup key
    expect(events[1].sourceEventId).toBeNull();
  });
});

describe("validateRequest", () => {
  const body = JSON.stringify(transportNotification());
  const headers = (extra: Record<string, string> = {}) =>
    new Headers({ "content-type": "application/json", ...extra });

  it("accepts a valid X-T49-Webhook-Signature", () => {
    const sig = computeSignature(body, "s3cret");
    expect(
      validateRequest(headers({ "x-t49-webhook-signature": sig }), body, { secret: "s3cret", nodeEnv: "production" }),
    ).toEqual({ valid: true });
  });

  it("rejects a bad or missing signature", () => {
    const bad = validateRequest(headers({ "x-t49-webhook-signature": "00" }), body, { secret: "s3cret" });
    expect(bad).toMatchObject({ valid: false, status: 401 });
    const missing = validateRequest(headers(), body, { secret: "s3cret" });
    expect(missing).toMatchObject({ valid: false, status: 401 });
  });

  it("rejects a signature over a different body", () => {
    const sig = computeSignature(body + " ", "s3cret");
    expect(
      validateRequest(headers({ "x-t49-webhook-signature": sig }), body, { secret: "s3cret" }),
    ).toMatchObject({ valid: false, status: 401 });
  });

  it("fails closed in production when the secret is unset", () => {
    expect(validateRequest(headers(), body, { secret: null, nodeEnv: "production" })).toMatchObject({
      valid: false,
      status: 503,
    });
  });

  it("skips verification outside production when the secret is unset", () => {
    expect(validateRequest(headers(), body, { secret: null, nodeEnv: "development" })).toEqual({ valid: true });
  });

  it("requires JSON content type", () => {
    expect(validateRequest(new Headers({ "content-type": "text/plain" }), body, { secret: null })).toMatchObject({
      status: 415,
    });
  });
});

describe("etaDelayHours", () => {
  const base = new Date("2026-10-28T00:00:00Z");
  it("ignores sub-hour changes", () => {
    expect(etaDelayHours(base, new Date("2026-10-28T00:20:00Z"))).toBeNull();
  });
  it("returns signed hours for delays and early arrivals", () => {
    expect(etaDelayHours(base, new Date("2026-10-30T00:00:00Z"))).toBe(48);
    expect(etaDelayHours(base, new Date("2026-10-27T21:00:00Z"))).toBe(-3);
  });
});

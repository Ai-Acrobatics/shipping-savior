import { describe, it, expect } from "vitest";
import { deriveShipmentTimeline, type ShipmentLike } from "./timeline";

const NOW = new Date("2026-05-10T00:00:00.000Z");

function base(overrides: Partial<ShipmentLike> = {}): ShipmentLike {
  return {
    status: "in_transit",
    pol: "Rotterdam, NL",
    pod: "Long Beach, US",
    carrier: "Maersk",
    vesselName: "Maersk Edinburgh",
    etd: "2026-05-01T00:00:00.000Z",
    eta: "2026-05-20T00:00:00.000Z",
    currentLocation: "Panama Canal",
    createdAt: "2026-04-28T00:00:00.000Z",
    ...overrides,
  };
}

describe("deriveShipmentTimeline", () => {
  it("always produces the five canonical milestones in order", () => {
    const t = deriveShipmentTimeline(base(), NOW);
    expect(t.steps.map((s) => s.key)).toEqual([
      "booked",
      "departed",
      "in_transit",
      "arrived",
      "delivered",
    ]);
  });

  it("marks in_transit shipment correctly (booked+departed complete, sailing current)", () => {
    const t = deriveShipmentTimeline(base({ status: "in_transit" }), NOW);
    expect(t.steps[0].state).toBe("complete"); // booked
    expect(t.steps[1].state).toBe("complete"); // departed
    expect(t.steps[2].state).toBe("current"); // in_transit
    expect(t.steps[3].state).toBe("upcoming"); // arrived
    expect(t.steps[4].state).toBe("upcoming"); // delivered
    expect(t.currentStepKey).toBe("in_transit");
    expect(t.delayed).toBe(false);
  });

  it("pending shipment: only booked complete, departure is current", () => {
    const t = deriveShipmentTimeline(base({ status: "pending" }), NOW);
    expect(t.steps[0].state).toBe("complete");
    expect(t.steps[1].state).toBe("current");
    expect(t.currentStepKey).toBe("departed");
  });

  it("arrived shipment: everything through arrival complete, delivery current", () => {
    const t = deriveShipmentTimeline(base({ status: "arrived" }), NOW);
    expect(t.steps.slice(0, 4).every((s) => s.state === "complete")).toBe(true);
    expect(t.steps[4].state).toBe("current");
    expect(t.currentStepKey).toBe("delivered");
    expect(t.delayed).toBe(false);
  });

  it("flags explicit delayed status on the current step", () => {
    const t = deriveShipmentTimeline(base({ status: "delayed" }), NOW);
    expect(t.delayed).toBe(true);
    const current = t.steps.find((s) => s.state === "current");
    expect(current?.delayed).toBe(true);
  });

  it("derives delay when ETA is in the past and not yet arrived", () => {
    const t = deriveShipmentTimeline(
      base({ status: "in_transit", eta: "2026-05-01T00:00:00.000Z" }),
      NOW
    );
    expect(t.delayed).toBe(true);
  });

  it("does NOT flag delay when arrived even if ETA is in the past", () => {
    const t = deriveShipmentTimeline(
      base({ status: "arrived", eta: "2026-05-01T00:00:00.000Z" }),
      NOW
    );
    expect(t.delayed).toBe(false);
  });

  it("uses persisted progress column when present and valid", () => {
    const t = deriveShipmentTimeline(base({ progress: 73 }), NOW);
    expect(t.progressPercent).toBe(73);
  });

  it("derives progress from milestones when no persisted value", () => {
    expect(deriveShipmentTimeline(base({ status: "pending" }), NOW).progressPercent).toBe(20);
    expect(deriveShipmentTimeline(base({ status: "in_transit" }), NOW).progressPercent).toBe(40);
    expect(deriveShipmentTimeline(base({ status: "arrived" }), NOW).progressPercent).toBe(80);
  });

  it("ignores out-of-range persisted progress and falls back to derived", () => {
    const t = deriveShipmentTimeline(base({ status: "in_transit", progress: 250 }), NOW);
    expect(t.progressPercent).toBe(40);
  });

  it("falls back to originPort/destPort when pol/pod absent", () => {
    const t = deriveShipmentTimeline(
      base({ pol: null, pod: null, originPort: "Shanghai", destPort: "Oakland" }),
      NOW
    );
    expect(t.steps[1].label).toContain("Shanghai");
    expect(t.steps[3].label).toContain("Oakland");
  });

  it("uses sensible labels when ports are missing entirely", () => {
    const t = deriveShipmentTimeline(
      { status: "in_transit", pol: null, pod: null },
      NOW
    );
    expect(t.steps[1].label).toBe("Departed Origin port");
    expect(t.steps[3].label).toBe("Arrived Destination port");
  });

  it("surfaces current location in the in-transit description", () => {
    const t = deriveShipmentTimeline(base({ currentLocation: "Suez Canal" }), NOW);
    expect(t.steps[2].description).toContain("Suez Canal");
  });

  it("converts Date and string dates to ISO, leaves spans null", () => {
    const t = deriveShipmentTimeline(
      base({ createdAt: new Date("2026-04-28T00:00:00.000Z") }),
      NOW
    );
    expect(t.steps[0].date).toBe("2026-04-28T00:00:00.000Z");
    expect(t.steps[2].date).toBeNull(); // in transit is a span
  });

  it("handles invalid/empty input without throwing", () => {
    const t = deriveShipmentTimeline({}, NOW);
    expect(t.steps).toHaveLength(5);
    expect(t.currentStepKey).toBe("departed"); // defaults to pending behaviour
    expect(t.steps[1].date).toBeNull();
  });
});

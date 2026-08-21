import { describe, it, expect } from "vitest";
import {
  buildLanes,
  laneProgress,
  mergeAisPositions,
  normalizeVesselName,
  vesselQueries,
  type LaneShipment,
} from "./lanes";
import { buildPortIndex, resolvePort, type PortRecord } from "./ports";
import type { AisPosition } from "@/lib/ais/types";

const PORTS: PortRecord[] = [
  { locode: "CNSHA", name: "Shanghai", country: "China", country_code: "CN", lat: 31.2304, lng: 121.4737 },
  { locode: "USLGB", name: "Long Beach", country: "United States", country_code: "US", lat: 33.7542, lng: -118.2165 },
  { locode: "NLRTM", name: "Rotterdam", country: "Netherlands", country_code: "NL", lat: 51.9244, lng: 4.4777 },
  { locode: "USNYC", name: "New York", country: "United States", country_code: "US", lat: 40.6892, lng: -74.0445 },
];

const index = buildPortIndex(PORTS);
const resolve = (raw: string | null | undefined) => resolvePort(index, raw);

const NOW = Date.parse("2026-06-15T00:00:00.000Z");

let seq = 0;
function ship(overrides: Partial<LaneShipment> = {}): LaneShipment {
  seq += 1;
  return {
    id: `ship-${seq}`,
    reference: `REF-${seq}`,
    containerNumber: `MSCU000000${seq}`,
    vesselName: "MSC OSCAR",
    voyageNumber: "24W",
    carrier: "MSC",
    pol: "CNSHA",
    pod: "USLGB",
    etd: "2026-06-01T00:00:00.000Z",
    eta: "2026-06-21T00:00:00.000Z",
    status: "in_transit",
    progress: null,
    ...overrides,
  };
}

describe("laneProgress", () => {
  it("interpolates the ETD→ETA schedule", () => {
    // 14 of 20 days elapsed at NOW.
    expect(laneProgress(ship(), NOW)).toBeCloseTo(0.7, 6);
  });

  it("prefers an explicit progress percentage", () => {
    expect(laneProgress(ship({ progress: 25 }), NOW)).toBeCloseTo(0.25, 6);
  });

  it("clamps out-of-range progress", () => {
    expect(laneProgress(ship({ progress: 250 }), NOW)).toBe(1);
    expect(laneProgress(ship({ progress: -10 }), NOW)).toBe(0);
  });

  it("pins arrived shipments to the destination", () => {
    expect(laneProgress(ship({ status: "arrived", progress: 10 }), NOW)).toBe(1);
  });

  it("clamps before ETD and after ETA", () => {
    expect(laneProgress(ship(), Date.parse("2026-05-01T00:00:00.000Z"))).toBe(0);
    expect(laneProgress(ship(), Date.parse("2026-12-01T00:00:00.000Z"))).toBe(1);
  });

  it("falls back to 0 with no usable dates", () => {
    expect(laneProgress(ship({ etd: null, eta: null }), NOW)).toBe(0);
    expect(laneProgress(ship({ etd: "not-a-date", eta: "also-bad" }), NOW)).toBe(0);
  });

  it("falls back to 0 when ETA precedes ETD", () => {
    expect(
      laneProgress(ship({ etd: "2026-06-21T00:00:00.000Z", eta: "2026-06-01T00:00:00.000Z" }), NOW)
    ).toBe(0);
  });
});

describe("buildLanes", () => {
  it("builds an arc between two resolvable ports", () => {
    const { lanes, unresolved } = buildLanes([ship()], resolve, NOW);
    expect(unresolved).toHaveLength(0);
    expect(lanes).toHaveLength(1);

    const lane = lanes[0];
    expect(lane.origin.locode).toBe("CNSHA");
    expect(lane.destination.locode).toBe("USLGB");
    expect(lane.path.length).toBeGreaterThan(50);
    expect(lane.distanceKm).toBeGreaterThan(9000);
    expect(lane.progress).toBeCloseTo(0.7, 6);
  });

  it("falls back to originPort/destPort when pol/pod are absent", () => {
    const { lanes } = buildLanes(
      [ship({ pol: null, pod: null, originPort: "Rotterdam", destPort: "New York" })],
      resolve,
      NOW
    );
    expect(lanes[0].origin.locode).toBe("NLRTM");
    expect(lanes[0].destination.locode).toBe("USNYC");
  });

  it("places the estimated vessel marker along the arc, not at the origin", () => {
    const lane = buildLanes([ship()], resolve, NOW).lanes[0];
    expect(lane.vessel.live).toBe(false);
    expect(lane.vessel.positionSource).toBe("schedule");
    expect(lane.vessel.lat).not.toBeCloseTo(lane.origin.lat, 2);
    // 70% of a trans-Pacific crossing puts the ship in the eastern Pacific.
    expect(lane.vessel.lat).toBeGreaterThan(30);
    expect(Number.isFinite(lane.vessel.headingDegrees)).toBe(true);
  });

  it("reports shipments with no ports instead of dropping them silently", () => {
    const { lanes, unresolved } = buildLanes([ship({ pol: null, pod: null })], resolve, NOW);
    expect(lanes).toHaveLength(0);
    expect(unresolved[0].reason).toBe("missing_ports");
  });

  it("distinguishes an unknown origin from an unknown destination", () => {
    const { unresolved } = buildLanes(
      [ship({ pol: "Atlantis" }), ship({ pod: "El Dorado" })],
      resolve,
      NOW
    );
    expect(unresolved.map((u) => u.reason)).toEqual(["unknown_origin", "unknown_destination"]);
  });

  it("normalizes an unexpected status to in_transit", () => {
    const lane = buildLanes([ship({ status: "who-knows" })], resolve, NOW).lanes[0];
    expect(lane.status).toBe("in_transit");
  });

  it("accepts Date instances as well as ISO strings", () => {
    const lane = buildLanes(
      [ship({ etd: new Date("2026-06-01T00:00:00.000Z"), eta: new Date("2026-06-21T00:00:00.000Z") })],
      resolve,
      NOW
    ).lanes[0];
    expect(lane.etd).toBe("2026-06-01T00:00:00.000Z");
    expect(lane.progress).toBeCloseTo(0.7, 6);
  });

  it("keeps every path vertex finite and continuous", () => {
    const lane = buildLanes([ship()], resolve, NOW).lanes[0];
    for (let i = 0; i < lane.path.length; i += 1) {
      const [lng, lat] = lane.path[i];
      expect(Number.isFinite(lng)).toBe(true);
      expect(Number.isFinite(lat)).toBe(true);
      if (i > 0) expect(Math.abs(lng - lane.path[i - 1][0])).toBeLessThan(30);
    }
  });
});

describe("normalizeVesselName", () => {
  it("folds punctuation, case, and AIS padding", () => {
    expect(normalizeVesselName("  msc  oscar ")).toBe("MSC OSCAR");
    expect(normalizeVesselName("EVER-GIVEN")).toBe("EVER GIVEN");
  });

  it("returns empty for missing names", () => {
    expect(normalizeVesselName(null)).toBe("");
    expect(normalizeVesselName(undefined)).toBe("");
  });
});

describe("mergeAisPositions", () => {
  const fix = (overrides: Partial<AisPosition> = {}): AisPosition => ({
    name: "MSC OSCAR",
    lat: 40,
    lng: -160,
    sogKnots: 18.2,
    cogDegrees: 95,
    headingDegrees: 97,
    timestamp: "2026-06-15T00:00:00.000Z",
    source: "aishub",
    ...overrides,
  });

  it("overlays a matching fix and flags it live", () => {
    const lanes = buildLanes([ship()], resolve, NOW).lanes;
    const merged = mergeAisPositions(lanes, [fix()]);
    expect(merged[0].vessel.live).toBe(true);
    expect(merged[0].vessel.lat).toBe(40);
    expect(merged[0].vessel.lng).toBe(-160);
    expect(merged[0].vessel.sogKnots).toBe(18.2);
    expect(merged[0].vessel.headingDegrees).toBe(97);
    expect(merged[0].vessel.positionSource).toBe("aishub");
  });

  it("matches names that differ only by case or punctuation", () => {
    const lanes = buildLanes([ship({ vesselName: "Ever Given" })], resolve, NOW).lanes;
    const merged = mergeAisPositions(lanes, [fix({ name: "EVER-GIVEN" })]);
    expect(merged[0].vessel.live).toBe(true);
  });

  it("leaves unmatched lanes on their schedule estimate", () => {
    const lanes = buildLanes([ship()], resolve, NOW).lanes;
    const merged = mergeAisPositions(lanes, [fix({ name: "SOME OTHER SHIP" })]);
    expect(merged[0].vessel.live).toBe(false);
    expect(merged[0].vessel.lat).toBeCloseTo(lanes[0].vessel.lat, 6);
  });

  it("keeps the freshest fix when a vessel reports twice", () => {
    const lanes = buildLanes([ship()], resolve, NOW).lanes;
    const merged = mergeAisPositions(lanes, [
      fix({ lat: 10, timestamp: "2026-06-14T00:00:00.000Z" }),
      fix({ lat: 42, timestamp: "2026-06-15T06:00:00.000Z" }),
    ]);
    expect(merged[0].vessel.lat).toBe(42);
  });

  it("falls back to COG then lane bearing when heading is absent", () => {
    const lanes = buildLanes([ship()], resolve, NOW).lanes;
    const cogOnly = mergeAisPositions(lanes, [fix({ headingDegrees: null })]);
    expect(cogOnly[0].vessel.headingDegrees).toBe(95);

    const neither = mergeAisPositions(lanes, [fix({ headingDegrees: null, cogDegrees: null })]);
    expect(Number.isFinite(neither[0].vessel.headingDegrees)).toBe(true);
  });

  it("returns the input untouched with no positions", () => {
    const lanes = buildLanes([ship()], resolve, NOW).lanes;
    expect(mergeAisPositions(lanes, [])).toBe(lanes);
  });

  it("does not mutate the input lanes", () => {
    const lanes = buildLanes([ship()], resolve, NOW).lanes;
    const before = lanes[0].vessel.lat;
    mergeAisPositions(lanes, [fix()]);
    expect(lanes[0].vessel.lat).toBe(before);
  });
});

describe("vesselQueries", () => {
  it("dedupes vessels across lanes and skips unnamed ones", () => {
    const lanes = buildLanes(
      [ship(), ship({ vesselName: "msc oscar" }), ship({ vesselName: null }), ship({ vesselName: "EVER GIVEN" })],
      resolve,
      NOW
    ).lanes;
    expect(vesselQueries(lanes).map((v) => v.name)).toEqual(["MSC OSCAR", "EVER GIVEN"]);
  });
});

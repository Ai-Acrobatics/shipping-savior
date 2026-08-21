import { describe, it, expect } from "vitest";
import {
  decodeCoordinate,
  extractAisRecords,
  normalizeAisPayload,
  normalizeAisRecord,
  normalizeTimestamp,
} from "./normalize";

describe("decodeCoordinate", () => {
  it("passes through in-range decimals", () => {
    expect(decodeCoordinate(31.2304, "lat")).toBeCloseTo(31.2304, 6);
    expect(decodeCoordinate(-118.2165, "lng")).toBeCloseTo(-118.2165, 6);
  });

  it("rescales AIS 1/10000-minute integers", () => {
    // 31.2304° × 600000 ≈ 18738240
    expect(decodeCoordinate(18738240, "lat")).toBeCloseTo(31.2304, 4);
    expect(decodeCoordinate(-70929900, "lng")).toBeCloseTo(-118.2165, 4);
  });

  it("rejects values that are out of range even after rescaling", () => {
    expect(decodeCoordinate(1e12, "lat")).toBeNull();
  });
});

describe("normalizeTimestamp", () => {
  it("accepts epoch seconds and millis", () => {
    expect(normalizeTimestamp(1780000000)).toBe(new Date(1780000000000).toISOString());
    expect(normalizeTimestamp(1780000000000)).toBe(new Date(1780000000000).toISOString());
  });

  it("treats AISHub's zone-less timestamps as UTC", () => {
    expect(normalizeTimestamp("2026-08-20 14:03:11")).toBe("2026-08-20T14:03:11.000Z");
  });

  it("passes ISO strings through", () => {
    expect(normalizeTimestamp("2026-08-20T14:03:11.000Z")).toBe("2026-08-20T14:03:11.000Z");
  });

  it("returns null for junk", () => {
    expect(normalizeTimestamp("not a date")).toBeNull();
    expect(normalizeTimestamp(null)).toBeNull();
    expect(normalizeTimestamp("")).toBeNull();
  });
});

describe("normalizeAisRecord", () => {
  it("normalizes an AISHub-style SCREAMING_CASE record", () => {
    const position = normalizeAisRecord(
      {
        MMSI: 636019825,
        IMO: 9703291,
        NAME: "MSC OSCAR",
        LATITUDE: 18738240,
        LONGITUDE: -70929900,
        SOG: 18.4,
        COG: 92.1,
        HEADING: 93,
        TIME: "2026-08-20 14:03:11",
      },
      "aishub"
    );
    expect(position).not.toBeNull();
    expect(position!.name).toBe("MSC OSCAR");
    expect(position!.mmsi).toBe("636019825");
    expect(position!.imo).toBe("9703291");
    expect(position!.lat).toBeCloseTo(31.2304, 3);
    expect(position!.lng).toBeCloseTo(-118.2165, 3);
    expect(position!.sogKnots).toBe(18.4);
    expect(position!.headingDegrees).toBe(93);
    expect(position!.timestamp).toBe("2026-08-20T14:03:11.000Z");
    expect(position!.source).toBe("aishub");
  });

  it("normalizes a camelCase REST record", () => {
    const position = normalizeAisRecord(
      {
        vesselName: "ever given",
        lat: 30.02,
        lon: 32.55,
        speed: 12,
        course: 180,
        lastPositionUtc: "2026-08-20T10:00:00Z",
      },
      "http"
    );
    expect(position!.name).toBe("EVER GIVEN");
    expect(position!.lat).toBe(30.02);
    expect(position!.lng).toBe(32.55);
    expect(position!.cogDegrees).toBe(180);
  });

  it("uses COG when heading is the AIS 511 'unavailable' sentinel", () => {
    const position = normalizeAisRecord(
      { name: "X", lat: 1, lng: 2, heading: 511, cog: 87 },
      "http"
    );
    expect(position!.headingDegrees).toBe(87);
  });

  it("drops records with no position", () => {
    expect(normalizeAisRecord({ name: "GHOST SHIP" }, "http")).toBeNull();
    expect(normalizeAisRecord({ name: "GHOST", lat: 10 }, "http")).toBeNull();
  });

  it("drops records with no identity", () => {
    expect(normalizeAisRecord({ lat: 10, lng: 20 }, "http")).toBeNull();
  });

  it("drops non-objects", () => {
    expect(normalizeAisRecord(null as never, "http")).toBeNull();
  });

  it("falls back to MMSI when the name is missing", () => {
    const position = normalizeAisRecord({ mmsi: "636019825", lat: 1, lng: 2 }, "http");
    expect(position!.name).toBe("636019825");
  });
});

describe("extractAisRecords", () => {
  it("unwraps the AISHub [meta, vessels] envelope", () => {
    const records = extractAisRecords([{ ERROR: false }, [{ MMSI: 1 }, { MMSI: 2 }]]);
    expect(records).toHaveLength(2);
  });

  it("unwraps { data: [...] } and friends", () => {
    expect(extractAisRecords({ data: [{ a: 1 }] })).toHaveLength(1);
    expect(extractAisRecords({ vessels: [{ a: 1 }, { b: 2 }] })).toHaveLength(2);
  });

  it("accepts a bare array", () => {
    expect(extractAisRecords([{ a: 1 }])).toHaveLength(1);
  });

  it("returns empty for unrecognized shapes", () => {
    expect(extractAisRecords({ nope: true })).toEqual([]);
    expect(extractAisRecords("string")).toEqual([]);
    expect(extractAisRecords(null)).toEqual([]);
  });
});

describe("normalizeAisPayload", () => {
  it("normalizes usable records and skips the rest", () => {
    const positions = normalizeAisPayload(
      {
        data: [
          { name: "A", lat: 1, lng: 2 },
          { name: "B" },
          { lat: 5, lng: 6 },
          { name: "C", lat: 7, lng: 8 },
        ],
      },
      "http"
    );
    expect(positions.map((p) => p.name)).toEqual(["A", "C"]);
  });
});

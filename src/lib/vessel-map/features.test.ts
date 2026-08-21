import { describe, it, expect } from "vitest";
import {
  LANE_COLORS,
  escapeHtml,
  laneFeatures,
  popupHtml,
  portFeatures,
  vesselFeatures,
} from "./features";
import { buildLanes, type VesselLane } from "./lanes";
import { buildPortIndex, resolvePort, type PortRecord } from "./ports";

const PORTS: PortRecord[] = [
  { locode: "CNSHA", name: "Shanghai", country: "China", country_code: "CN", lat: 31.2304, lng: 121.4737 },
  { locode: "USLGB", name: "Long Beach", country: "United States", country_code: "US", lat: 33.7542, lng: -118.2165 },
  { locode: "NLRTM", name: "Rotterdam", country: "Netherlands", country_code: "NL", lat: 51.9244, lng: 4.4777 },
];
const index = buildPortIndex(PORTS);
const resolve = (raw: string | null | undefined) => resolvePort(index, raw);
const NOW = Date.parse("2026-06-15T00:00:00.000Z");

function lanes(): VesselLane[] {
  return buildLanes(
    [
      {
        id: "s1",
        reference: "PO-1",
        vesselName: "MSC OSCAR",
        carrier: "MSC",
        containerNumber: "MSCU1",
        pol: "CNSHA",
        pod: "USLGB",
        etd: "2026-06-01T00:00:00.000Z",
        eta: "2026-06-21T00:00:00.000Z",
        status: "in_transit",
      },
      {
        id: "s2",
        reference: "PO-2",
        vesselName: "EVER GIVEN",
        pol: "NLRTM",
        pod: "USLGB",
        etd: "2026-06-01T00:00:00.000Z",
        eta: "2026-06-30T00:00:00.000Z",
        status: "delayed",
      },
    ],
    resolve,
    NOW
  ).lanes;
}

describe("laneFeatures", () => {
  it("emits one LineString per lane carrying the status colour", () => {
    const fc = laneFeatures(lanes());
    expect(fc.type).toBe("FeatureCollection");
    expect(fc.features).toHaveLength(2);
    expect(fc.features[0].geometry.type).toBe("LineString");
    expect(fc.features[0].properties?.color).toBe(LANE_COLORS.in_transit);
    expect(fc.features[1].properties?.color).toBe(LANE_COLORS.delayed);
  });

  it("keeps coordinates in GeoJSON [lng, lat] order", () => {
    const [first] = laneFeatures(lanes()).features;
    const coords = (first.geometry as GeoJSON.LineString).coordinates;
    expect(coords[0][0]).toBeCloseTo(121.4737, 3); // lng first
    expect(coords[0][1]).toBeCloseTo(31.2304, 3);
  });

  it("returns an empty collection for no lanes", () => {
    expect(laneFeatures([]).features).toEqual([]);
  });
});

describe("portFeatures", () => {
  it("dedupes ports shared by multiple lanes", () => {
    // Both lanes discharge at USLGB — it must appear once.
    const fc = portFeatures(lanes());
    const locodes = fc.features.map((f) => f.properties?.locode);
    expect(locodes.filter((l) => l === "USLGB")).toHaveLength(1);
    expect(new Set(locodes)).toEqual(new Set(["CNSHA", "NLRTM", "USLGB"]));
  });

  it("tags origin vs destination role", () => {
    const roles = Object.fromEntries(
      portFeatures(lanes()).features.map((f) => [f.properties?.locode, f.properties?.role])
    );
    expect(roles.CNSHA).toBe("origin");
    expect(roles.USLGB).toBe("destination");
  });

  it("emits Point geometry in [lng, lat] order", () => {
    const feature = portFeatures(lanes()).features.find((f) => f.properties?.locode === "CNSHA")!;
    expect(feature.geometry.type).toBe("Point");
    expect((feature.geometry as GeoJSON.Point).coordinates).toEqual([121.4737, 31.2304]);
  });
});

describe("vesselFeatures", () => {
  it("emits one point per lane with the map's styling inputs", () => {
    const fc = vesselFeatures(lanes());
    expect(fc.features).toHaveLength(2);
    const props = fc.features[0].properties!;
    expect(props.vesselName).toBe("MSC OSCAR");
    expect(props.live).toBe(false);
    expect(props.color).toBe(LANE_COLORS.in_transit);
    expect(typeof props.heading).toBe("number");
    expect(props.progressPct).toBe(70);
  });

  it("labels an unnamed vessel rather than emitting an empty string", () => {
    const withoutName = lanes().map((lane) => ({
      ...lane,
      vessel: { ...lane.vessel, vesselName: null },
    }));
    expect(vesselFeatures(withoutName).features[0].properties?.vesselName).toBe("Unknown vessel");
  });

  it("formats origin and destination for the popup", () => {
    const props = vesselFeatures(lanes()).features[0].properties!;
    expect(props.origin).toBe("Shanghai (CNSHA)");
    expect(props.destination).toBe("Long Beach (USLGB)");
  });
});

describe("escapeHtml", () => {
  it("neutralizes markup from shipment data", () => {
    expect(escapeHtml('<img src=x onerror="alert(1)">')).toBe(
      "&lt;img src=x onerror=&quot;alert(1)&quot;&gt;"
    );
  });

  it("escapes ampersands", () => {
    expect(escapeHtml("Maersk & Co")).toBe("Maersk &amp; Co");
  });

  it("renders null/undefined as empty", () => {
    expect(escapeHtml(null)).toBe("");
    expect(escapeHtml(undefined)).toBe("");
  });
});

describe("popupHtml", () => {
  const props = () => ({
    vesselName: "MSC OSCAR",
    reference: "PO-1",
    containerNumber: "MSCU1",
    carrier: "MSC",
    voyageNumber: "24W",
    origin: "Shanghai (CNSHA)",
    destination: "Long Beach (USLGB)",
    eta: "2026-06-21T00:00:00.000Z",
    progressPct: 70,
    live: true,
    positionSource: "aishub",
    sogKnots: 18.4,
  });

  it("labels a live fix with its provider", () => {
    const html = popupHtml(props());
    expect(html).toContain("Live AIS");
    expect(html).toContain("aishub");
    expect(html).toContain("18.4 kn");
  });

  it("labels an estimate when no AIS fix matched", () => {
    const html = popupHtml({ ...props(), live: false, sogKnots: "" });
    expect(html).toContain("Estimated from schedule");
    expect(html).not.toContain("kn</td>");
  });

  it("escapes untrusted shipment fields", () => {
    const html = popupHtml({ ...props(), vesselName: '<script>alert(1)</script>' });
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });

  it("renders em-dash placeholders for missing fields", () => {
    const html = popupHtml({ ...props(), reference: "", carrier: "", eta: "" });
    expect(html).toContain("—");
  });
});

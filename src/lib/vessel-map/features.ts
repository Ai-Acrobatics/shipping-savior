// ── GeoJSON + popup builders for the vessel map (AI-12012) ───────────
//
// Split out of VesselMap.tsx so the map's data shaping is testable without a
// WebGL context: MapLibre cannot mount in jsdom, but these are pure functions.

import type { VesselLane } from "@/lib/vessel-map/lanes";

export const LANE_COLORS: Record<string, string> = {
  in_transit: "#38bdf8",
  delayed: "#f87171",
  arrived: "#34d399",
  pending: "#fbbf24",
};

type Feature = GeoJSON.Feature<GeoJSON.Geometry, Record<string, unknown>>;

export function laneFeatures(lanes: VesselLane[]): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: lanes.map<Feature>((lane) => ({
      type: "Feature",
      geometry: { type: "LineString", coordinates: lane.path },
      properties: {
        shipmentId: lane.shipmentId,
        status: lane.status,
        color: LANE_COLORS[lane.status] ?? LANE_COLORS.in_transit,
        vesselName: lane.vesselName ?? "",
        reference: lane.reference ?? "",
      },
    })),
  };
}

export function portFeatures(lanes: VesselLane[]): GeoJSON.FeatureCollection {
  const seen = new Map<string, Feature>();
  for (const lane of lanes) {
    for (const [port, role] of [
      [lane.origin, "origin"],
      [lane.destination, "destination"],
    ] as const) {
      const key = `${port.locode}:${role}`;
      if (seen.has(key)) continue;
      seen.set(key, {
        type: "Feature",
        geometry: { type: "Point", coordinates: [port.lng, port.lat] },
        properties: {
          role,
          locode: port.locode,
          name: port.name,
          country: port.country,
        },
      });
    }
  }
  return { type: "FeatureCollection", features: [...seen.values()] };
}

export function vesselFeatures(lanes: VesselLane[]): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: lanes.map<Feature>((lane) => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: [lane.vessel.lng, lane.vessel.lat] },
      properties: {
        shipmentId: lane.shipmentId,
        vesselName: lane.vessel.vesselName ?? "Unknown vessel",
        reference: lane.reference ?? "",
        containerNumber: lane.containerNumber ?? "",
        carrier: lane.carrier ?? "",
        voyageNumber: lane.voyageNumber ?? "",
        status: lane.status,
        heading: lane.vessel.headingDegrees,
        live: lane.vessel.live,
        sogKnots: lane.vessel.sogKnots ?? "",
        positionSource: lane.vessel.positionSource,
        positionTimestamp: lane.vessel.positionTimestamp ?? "",
        origin: `${lane.origin.name} (${lane.origin.locode})`,
        destination: `${lane.destination.name} (${lane.destination.locode})`,
        eta: lane.eta ?? "",
        progressPct: Math.round(lane.progress * 100),
        color: LANE_COLORS[lane.status] ?? LANE_COLORS.in_transit,
      },
    })),
  };
}

export function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function popupHtml(props: Record<string, unknown>): string {
  const live = props.live === true || props.live === "true";
  const eta = props.eta ? new Date(String(props.eta)).toLocaleDateString() : "—";
  const sog = props.sogKnots === "" || props.sogKnots === null ? null : Number(props.sogKnots);
  const rows: [string, string][] = [
    ["Reference", String(props.reference || "—")],
    ["Container", String(props.containerNumber || "—")],
    ["Carrier", String(props.carrier || "—")],
    ["Voyage", String(props.voyageNumber || "—")],
    ["From", String(props.origin || "—")],
    ["To", String(props.destination || "—")],
    ["ETA", eta],
    ["Progress", `${props.progressPct ?? 0}%`],
  ];
  if (sog !== null && Number.isFinite(sog)) rows.push(["Speed", `${sog.toFixed(1)} kn`]);

  return `
    <div style="font-family:system-ui,sans-serif;min-width:220px">
      <div style="font-weight:700;font-size:13px;margin-bottom:2px">${escapeHtml(props.vesselName)}</div>
      <div style="font-size:11px;margin-bottom:8px;color:${live ? "#059669" : "#b45309"}">
        ${live ? `Live AIS - ${escapeHtml(props.positionSource)}` : "Estimated from schedule"}
      </div>
      <table style="font-size:11px;border-collapse:collapse">
        ${rows
          .map(
            ([label, value]) =>
              `<tr><td style="padding:1px 8px 1px 0;color:#64748b">${escapeHtml(
                label
              )}</td><td style="padding:1px 0;color:#0f172a">${escapeHtml(value)}</td></tr>`
          )
          .join("")}
      </table>
    </div>
  `;
}

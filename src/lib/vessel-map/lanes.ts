// ── Lane + vessel-position modelling for the vessel map (AI-12012) ────
//
// Turns the org's shipments into drawable lanes (great-circle arcs between the
// resolved load/discharge ports) and one marker per vessel. A marker is `live`
// when an AIS fix matched the vessel, otherwise `estimated` from the ETD→ETA
// schedule so the map is still useful without a paid AIS feed.

import { greatCirclePath, initialBearing, interpolateGreatCircle, greatCircleDistanceKm } from "./geo";
import type { PortRecord } from "./ports";
import type { AisPosition } from "@/lib/ais/types";

export type LaneStatus = "in_transit" | "arrived" | "delayed" | "pending";

/** The shipment fields the map needs — a structural subset of `shipments`. */
export interface LaneShipment {
  id: string;
  reference?: string | null;
  containerNumber?: string | null;
  vesselName?: string | null;
  voyageNumber?: string | null;
  carrier?: string | null;
  /** Preferred port fields; `originPort`/`destPort` are the CSV-import aliases. */
  pol?: string | null;
  pod?: string | null;
  originPort?: string | null;
  destPort?: string | null;
  etd?: string | Date | null;
  eta?: string | Date | null;
  status?: LaneStatus | string | null;
  /** 0–100 progress written by the tracking pipeline, when present. */
  progress?: number | null;
}

export interface LanePort {
  locode: string;
  name: string;
  country: string;
  lat: number;
  lng: number;
}

export interface VesselMarker {
  shipmentId: string;
  vesselName: string | null;
  lat: number;
  lng: number;
  /** Degrees true; falls back to the lane bearing for estimated markers. */
  headingDegrees: number;
  sogKnots: number | null;
  /** true = real AIS fix, false = interpolated from the schedule. */
  live: boolean;
  positionSource: string;
  positionTimestamp: string | null;
}

export interface VesselLane {
  shipmentId: string;
  reference: string | null;
  containerNumber: string | null;
  vesselName: string | null;
  voyageNumber: string | null;
  carrier: string | null;
  status: LaneStatus;
  origin: LanePort;
  destination: LanePort;
  /** GeoJSON `[lng, lat]` pairs with continuous longitudes. */
  path: [number, number][];
  distanceKm: number;
  etd: string | null;
  eta: string | null;
  /** 0–1 along the arc. */
  progress: number;
  vessel: VesselMarker;
}

export interface UnresolvedLane {
  shipmentId: string;
  reference: string | null;
  vesselName: string | null;
  origin: string | null;
  destination: string | null;
  reason: "missing_ports" | "unknown_origin" | "unknown_destination";
}

export interface BuildLanesResult {
  lanes: VesselLane[];
  unresolved: UnresolvedLane[];
}

const VALID_STATUSES: LaneStatus[] = ["in_transit", "arrived", "delayed", "pending"];
const ARC_STEPS = 96;

function toIso(value: string | Date | null | undefined): string | null {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

function toLanePort(port: PortRecord): LanePort {
  return {
    locode: port.locode,
    name: port.name,
    country: port.country_code || port.country,
    lat: port.lat,
    lng: port.lng,
  };
}

/** Comparison key for vessel names: AIS pads and punctuates inconsistently. */
export function normalizeVesselName(raw: string | null | undefined): string {
  if (!raw) return "";
  return String(raw)
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Fraction of the voyage elapsed. Prefers an explicit `progress` (0–100) from
 * the tracking pipeline, else interpolates ETD→ETA against `now`, else 0.
 */
export function laneProgress(shipment: LaneShipment, now: number = Date.now()): number {
  if (shipment.status === "arrived") return 1;

  if (typeof shipment.progress === "number" && Number.isFinite(shipment.progress)) {
    return Math.min(1, Math.max(0, shipment.progress / 100));
  }

  const etd = toIso(shipment.etd);
  const eta = toIso(shipment.eta);
  if (!etd || !eta) return 0;

  const start = Date.parse(etd);
  const end = Date.parse(eta);
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return 0;

  return Math.min(1, Math.max(0, (now - start) / (end - start)));
}

type PortResolver = (raw: string | null | undefined) => PortRecord | null;

/**
 * Build one lane per shipment that has two resolvable ports. Shipments whose
 * ports can't be resolved are returned in `unresolved` so the UI can say how
 * many lanes are hidden and why, rather than silently dropping them.
 */
export function buildLanes(
  shipments: LaneShipment[],
  resolvePortFn: PortResolver,
  now: number = Date.now()
): BuildLanesResult {
  const lanes: VesselLane[] = [];
  const unresolved: UnresolvedLane[] = [];

  for (const shipment of shipments) {
    const originRaw = shipment.pol ?? shipment.originPort ?? null;
    const destRaw = shipment.pod ?? shipment.destPort ?? null;
    const reference = shipment.reference ?? null;

    if (!originRaw || !destRaw) {
      unresolved.push({
        shipmentId: shipment.id,
        reference,
        vesselName: shipment.vesselName ?? null,
        origin: originRaw,
        destination: destRaw,
        reason: "missing_ports",
      });
      continue;
    }

    const origin = resolvePortFn(originRaw);
    const destination = resolvePortFn(destRaw);
    if (!origin || !destination) {
      unresolved.push({
        shipmentId: shipment.id,
        reference,
        vesselName: shipment.vesselName ?? null,
        origin: originRaw,
        destination: destRaw,
        reason: !origin ? "unknown_origin" : "unknown_destination",
      });
      continue;
    }

    const originPort = toLanePort(origin);
    const destPort = toLanePort(destination);
    const path = greatCirclePath(originPort, destPort, ARC_STEPS);
    const progress = laneProgress(shipment, now);
    const position = interpolateGreatCircle(originPort, destPort, progress);
    const status = (VALID_STATUSES as string[]).includes(String(shipment.status))
      ? (shipment.status as LaneStatus)
      : "in_transit";

    lanes.push({
      shipmentId: shipment.id,
      reference,
      containerNumber: shipment.containerNumber ?? null,
      vesselName: shipment.vesselName ?? null,
      voyageNumber: shipment.voyageNumber ?? null,
      carrier: shipment.carrier ?? null,
      status,
      origin: originPort,
      destination: destPort,
      path,
      distanceKm: Math.round(greatCircleDistanceKm(originPort, destPort)),
      etd: toIso(shipment.etd),
      eta: toIso(shipment.eta),
      progress,
      vessel: {
        shipmentId: shipment.id,
        vesselName: shipment.vesselName ?? null,
        lat: position.lat,
        lng: position.lng,
        headingDegrees: initialBearing(position, destPort),
        sogKnots: null,
        live: false,
        positionSource: "schedule",
        positionTimestamp: null,
      },
    });
  }

  return { lanes, unresolved };
}

/**
 * Overlay live AIS fixes onto lanes, matched by vessel name. Lanes with no
 * matching fix keep their schedule estimate. Returns a new array — inputs are
 * not mutated.
 */
export function mergeAisPositions(lanes: VesselLane[], positions: AisPosition[]): VesselLane[] {
  if (positions.length === 0) return lanes;

  const byName = new Map<string, AisPosition>();
  for (const position of positions) {
    const key = normalizeVesselName(position.name);
    if (!key) continue;
    const existing = byName.get(key);
    // Keep the freshest fix when a vessel reports more than once.
    if (
      !existing ||
      (position.timestamp ?? "") > (existing.timestamp ?? "")
    ) {
      byName.set(key, position);
    }
  }

  return lanes.map((lane) => {
    const key = normalizeVesselName(lane.vesselName);
    const fix = key ? byName.get(key) : undefined;
    if (!fix) return lane;

    return {
      ...lane,
      vessel: {
        ...lane.vessel,
        lat: fix.lat,
        lng: fix.lng,
        headingDegrees:
          fix.headingDegrees ??
          fix.cogDegrees ??
          initialBearing({ lat: fix.lat, lng: fix.lng }, lane.destination),
        sogKnots: fix.sogKnots ?? null,
        live: true,
        positionSource: fix.source,
        positionTimestamp: fix.timestamp,
      },
    };
  });
}

/** Unique vessel identities to ask the AIS provider about. */
export function vesselQueries(lanes: VesselLane[]): { name: string }[] {
  const seen = new Set<string>();
  const out: { name: string }[] = [];
  for (const lane of lanes) {
    const key = normalizeVesselName(lane.vesselName);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push({ name: lane.vesselName as string });
  }
  return out;
}

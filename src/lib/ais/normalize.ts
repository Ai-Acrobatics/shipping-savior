// ── AIS payload normalization (AI-12012) ──────────────────────────────
//
// AIS aggregators disagree on nearly everything: AISHub returns SCREAMING_CASE
// keys with lat/lon scaled by 600000 (1/10000 minute), most REST vendors return
// camelCase decimals, and a few return snake_case. One normalizer keeps the
// provider-specific code down to a URL and an auth header.

import type { AisPosition } from "./types";

type RawRecord = Record<string, unknown>;

function pick(raw: RawRecord, keys: string[]): unknown {
  for (const key of keys) {
    for (const actual of Object.keys(raw)) {
      if (actual.toLowerCase() === key.toLowerCase()) {
        const value = raw[actual];
        if (value !== undefined && value !== null && value !== "") return value;
      }
    }
  }
  return undefined;
}

function num(value: unknown): number | null {
  if (value === undefined || value === null || value === "") return null;
  const n = typeof value === "number" ? value : Number(String(value).trim());
  return Number.isFinite(n) ? n : null;
}

function str(value: unknown): string | null {
  if (value === undefined || value === null) return null;
  const s = String(value).trim();
  return s === "" ? null : s;
}

/**
 * AIS transmits lat/lon as integers in 1/10000 of a minute (÷600000) and some
 * feeds pass that through raw. Anything out of geographic range is rescaled.
 */
export function decodeCoordinate(value: number, kind: "lat" | "lng"): number | null {
  const limit = kind === "lat" ? 90 : 180;
  if (Math.abs(value) <= limit) return value;
  const scaled = value / 600000;
  if (Math.abs(scaled) <= limit) return scaled;
  return null;
}

/** ISO-8601 from epoch seconds/millis or an already-formatted timestamp. */
export function normalizeTimestamp(value: unknown): string | null {
  const s = str(value);
  if (!s) return null;

  if (/^\d+$/.test(s)) {
    const epoch = Number(s);
    // 10-digit values are seconds; 13-digit are millis.
    const ms = s.length <= 10 ? epoch * 1000 : epoch;
    const d = new Date(ms);
    return Number.isNaN(d.getTime()) ? null : d.toISOString();
  }

  // AISHub emits "2026-08-20 14:03:11" (UTC, no zone designator).
  const candidate = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(s) ? `${s}Z` : s;
  const d = new Date(candidate);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

/**
 * Normalize one provider record. Returns null when the record has no usable
 * position or no vessel identity — a dropped record is better than a marker
 * drawn in the Gulf of Guinea at (0, 0).
 */
export function normalizeAisRecord(raw: RawRecord, source: string): AisPosition | null {
  if (!raw || typeof raw !== "object") return null;

  const rawLat = num(pick(raw, ["latitude", "lat"]));
  const rawLng = num(pick(raw, ["longitude", "lon", "lng", "long"]));
  if (rawLat === null || rawLng === null) return null;

  const lat = decodeCoordinate(rawLat, "lat");
  const lng = decodeCoordinate(rawLng, "lng");
  if (lat === null || lng === null) return null;

  const name = str(pick(raw, ["name", "shipname", "ship_name", "vessel_name", "vesselName"]));
  const mmsi = str(pick(raw, ["mmsi", "userid", "user_id"]));
  const imo = str(pick(raw, ["imo", "imo_number", "imoNumber"]));
  if (!name && !mmsi && !imo) return null;

  const cog = num(pick(raw, ["cog", "course", "course_over_ground"]));
  const heading = num(pick(raw, ["heading", "true_heading", "trueHeading", "hdg"]));

  return {
    name: (name ?? mmsi ?? imo ?? "").toUpperCase().trim(),
    mmsi,
    imo,
    lat,
    lng,
    sogKnots: num(pick(raw, ["sog", "speed", "speed_over_ground"])),
    cogDegrees: cog,
    // 511 is the AIS "heading unavailable" sentinel.
    headingDegrees: heading === null || heading >= 360 ? cog : heading,
    timestamp: normalizeTimestamp(pick(raw, ["timestamp", "time", "last_position_utc", "lastPositionUtc", "received"])),
    source,
  };
}

/** Pull the record array out of the several envelope shapes vendors use. */
export function extractAisRecords(payload: unknown): RawRecord[] {
  if (Array.isArray(payload)) {
    // AISHub answers `[{ERROR:false,...}, [ ...vessels ]]`.
    const nested = payload.find((entry) => Array.isArray(entry));
    if (nested) return (nested as RawRecord[]).filter((r) => r && typeof r === "object");
    return (payload as RawRecord[]).filter((r) => r && typeof r === "object");
  }
  if (payload && typeof payload === "object") {
    const obj = payload as RawRecord;
    for (const key of ["data", "vessels", "positions", "results", "items"]) {
      const value = obj[key];
      if (Array.isArray(value)) {
        return (value as RawRecord[]).filter((r) => r && typeof r === "object");
      }
    }
  }
  return [];
}

export function normalizeAisPayload(payload: unknown, source: string): AisPosition[] {
  const out: AisPosition[] = [];
  for (const record of extractAisRecords(payload)) {
    const position = normalizeAisRecord(record, source);
    if (position) out.push(position);
  }
  return out;
}

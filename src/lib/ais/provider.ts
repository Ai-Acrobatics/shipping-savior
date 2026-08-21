// ── AIS provider selection (AI-12012) ─────────────────────────────────
//
// Live AIS is a paid feed, so the map must be useful before anyone buys one.
// `AIS_PROVIDER=none` (the default) returns no fixes and the map falls back to
// schedule-interpolated positions clearly labelled "estimated". Setting a real
// provider upgrades those markers to live fixes with no UI change.

import { normalizeAisPayload } from "./normalize";
import type { AisPosition, AisProvider, AisVesselQuery } from "./types";

const DEFAULT_TIMEOUT_MS = 8000;
/** Positions older than this are treated as stale and dropped. */
export const MAX_POSITION_AGE_MS = 12 * 60 * 60 * 1000;

async function fetchJson(url: string, headers: Record<string, string>): Promise<unknown | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      headers,
      signal: controller.signal,
      cache: "no-store",
    });
    if (!res.ok) {
      console.error(`[ais] provider responded ${res.status} for ${new URL(url).host}`);
      return null;
    }
    return await res.json();
  } catch (error) {
    console.error("[ais] provider request failed:", error);
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/** Environment slice the provider factory reads. */
export type AisEnv = Record<string, string | undefined>;

/** No configured feed — every vessel renders as a schedule estimate. */
export class NullAisProvider implements AisProvider {
  readonly id = "none";
  async fetchPositions(_vessels: AisVesselQuery[] = []): Promise<AisPosition[]> {
    return [];
  }
}

/**
 * AISHub (https://www.aishub.net) — returns the caller's whole visible fleet in
 * one call, so we fetch once and filter locally rather than per vessel.
 */
export class AisHubProvider implements AisProvider {
  readonly id = "aishub";
  constructor(private readonly username: string) {}

  // AISHub returns the caller's whole fleet, so the vessel list is unused.
  async fetchPositions(_vessels: AisVesselQuery[] = []): Promise<AisPosition[]> {
    const url = `https://data.aishub.net/ws.php?username=${encodeURIComponent(
      this.username
    )}&format=1&output=json&compress=0`;
    const payload = await fetchJson(url, { Accept: "application/json" });
    return payload ? normalizeAisPayload(payload, this.id) : [];
  }
}

/**
 * Generic REST feed. `AIS_API_URL` may contain `{vessels}` / `{mmsi}` /
 * `{imo}` placeholders; without any placeholder the URL is called once and the
 * response filtered locally.
 */
export class HttpAisProvider implements AisProvider {
  readonly id = "http";
  constructor(
    private readonly urlTemplate: string,
    private readonly apiKey: string | null,
    private readonly headerName: string
  ) {}

  async fetchPositions(vessels: AisVesselQuery[]): Promise<AisPosition[]> {
    const headers: Record<string, string> = { Accept: "application/json" };
    if (this.apiKey) {
      headers[this.headerName] =
        this.headerName.toLowerCase() === "authorization" ? `Bearer ${this.apiKey}` : this.apiKey;
    }

    const url = this.urlTemplate
      .replace("{vessels}", encodeURIComponent(vessels.map((v) => v.name).join(",")))
      .replace("{mmsi}", encodeURIComponent(vessels.map((v) => v.mmsi).filter(Boolean).join(",")))
      .replace("{imo}", encodeURIComponent(vessels.map((v) => v.imo).filter(Boolean).join(",")));

    const payload = await fetchJson(url, headers);
    return payload ? normalizeAisPayload(payload, this.id) : [];
  }
}

/** Resolve the provider from env. Unknown/misconfigured values fail to `none`. */
export function getAisProvider(env: AisEnv = process.env): AisProvider {
  const configured = (env.AIS_PROVIDER ?? "none").trim().toLowerCase();

  if (configured === "aishub") {
    const username = env.AISHUB_USERNAME?.trim();
    if (!username) {
      console.warn("[ais] AIS_PROVIDER=aishub but AISHUB_USERNAME is unset — falling back to none");
      return new NullAisProvider();
    }
    return new AisHubProvider(username);
  }

  if (configured === "http") {
    const url = env.AIS_API_URL?.trim();
    if (!url) {
      console.warn("[ais] AIS_PROVIDER=http but AIS_API_URL is unset — falling back to none");
      return new NullAisProvider();
    }
    return new HttpAisProvider(
      url,
      env.AIS_API_KEY?.trim() || null,
      env.AIS_API_KEY_HEADER?.trim() || "Authorization"
    );
  }

  return new NullAisProvider();
}

/** Drop fixes older than `maxAgeMs` so the map never shows a week-old position. */
export function dropStalePositions(
  positions: AisPosition[],
  now: number = Date.now(),
  maxAgeMs: number = MAX_POSITION_AGE_MS
): AisPosition[] {
  return positions.filter((p) => {
    if (!p.timestamp) return true;
    const t = Date.parse(p.timestamp);
    if (Number.isNaN(t)) return true;
    return now - t <= maxAgeMs;
  });
}

// ============================================================
// Lane resolution + FEU normalization (AI-12020)
//
// Turns a raw quote (ports, container type) into a `LaneBenchmark`: the
// right FBX lane, re-expressed in the quoted container type, with a market
// percentile curve and a trend read.
// ============================================================

import {
  COUNTRY_TO_REGION,
  EUROPE_PORT_REGION,
  FBX_LANES,
  REGION_LABELS,
  US_PORT_COAST,
  type FbxLane,
  type TradeRegion,
} from "@/lib/data/fbx-benchmarks";
import type {
  LaneBenchmark,
  MarketTrend,
  NegotiableContainerType,
  PercentileCurve,
} from "./types";

/**
 * FEU-relative cost ratios. FBX quotes a 40ft dry box (1.0). A 20ft is NOT
 * half the price — slot cost, handling and documentation barely move — so the
 * industry rule of thumb is ~60-65% of the 40ft rate. Reefers carry a large
 * premium for the plug, genset and power monitoring.
 */
export const CONTAINER_FEU_RATIO: Record<NegotiableContainerType, number> = {
  "20GP": 0.62,
  "40GP": 1.0,
  "40HC": 1.05,
  "20RF": 1.35,
  "40RF": 2.15,
};

export class LaneResolutionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LaneResolutionError";
  }
}

/**
 * Map a UN/LOCODE or bare ISO country code to a trade region.
 * Accepts "CNSHA", "cnsha", "CN" and "  USLAX ".
 */
export function resolveRegion(portOrCountry: string): TradeRegion {
  const raw = (portOrCountry ?? "").trim().toUpperCase();
  if (raw.length < 2) {
    throw new LaneResolutionError(
      `"${portOrCountry}" is not a usable port or country code. Use a UN/LOCODE like "CNSHA" or an ISO country code like "CN".`
    );
  }

  // Full UN/LOCODE hits first — a US locode tells us the coast, which the
  // bare country code cannot.
  if (US_PORT_COAST[raw]) return US_PORT_COAST[raw];
  if (EUROPE_PORT_REGION[raw]) return EUROPE_PORT_REGION[raw];

  const country = raw.slice(0, 2);
  const region = COUNTRY_TO_REGION[country];
  if (region) return region;

  if (country === "US") {
    throw new LaneResolutionError(
      `"${portOrCountry}" is a US port we do not have a coast mapping for. Use a full UN/LOCODE such as USLAX (West Coast) or USNYC (East Coast).`
    );
  }

  throw new LaneResolutionError(
    `No FBX benchmark region covers "${portOrCountry}". Supported origins: East Asia, Southeast Asia, South Asia, North Europe, Mediterranean. Supported destinations: US West Coast, US East Coast, North Europe, Mediterranean, East Asia.`
  );
}

/** Find the lane for an origin/dest region pair, if one exists. */
function findLane(origin: TradeRegion, dest: TradeRegion): FbxLane | undefined {
  return FBX_LANES.find((l) => l.originRegion === origin && l.destRegion === dest);
}

/**
 * Build the market percentile curve for a lane, USD per FEU.
 *
 * FBX publishes a spot index, not a distribution. What a shipper actually
 * pays spreads around it: large contracted volume prices below the index,
 * small ad-hoc spot bookings price above it. The spread below the median is
 * tighter than the spread above it — carriers have a floor (slot cost) but no
 * ceiling when a shipper is uninformed. That asymmetry is the whole reason
 * this tool exists, so it is modeled explicitly:
 *
 *   p50 = 4-week average (the honest "market rate" for the lane)
 *   p25 = p50 x 0.88   — what a well-negotiated contract lands at
 *   p10 = p50 x 0.79   — top-decile: big volume, long contract, flexible
 *   p75 = p50 x 1.15   — paying over market
 *   p90 = p50 x 1.34   — badly overpaying
 *
 * The band is widened when the lane is volatile (a wide 52-week range means
 * more dispersion in what shippers pay at any moment), and clamped so the
 * curve can never invert.
 */
export function buildPercentileCurve(lane: FbxLane): PercentileCurve {
  const p50 = lane.spot.avg4Week;

  // Volatility factor: how wide the 52-week range is relative to its average.
  // A range of 0 gives 0 spread widening; a range equal to the average gives
  // the full 0.5 widening step.
  const range = Math.max(lane.spot.high52Week - lane.spot.low52Week, 0);
  const avg = Math.max(lane.spot.avg52Week, 1);
  const volatility = Math.min(range / avg, 2); // cap so extreme years don't explode the curve
  const widen = 1 + volatility * 0.15;

  const below = (base: number) => 1 - (1 - base) * widen;
  const above = (base: number) => 1 + (base - 1) * widen;

  const curve = {
    p10: Math.round(p50 * below(0.79)),
    p25: Math.round(p50 * below(0.88)),
    p50: Math.round(p50),
    p75: Math.round(p50 * above(1.15)),
    p90: Math.round(p50 * above(1.34)),
  };

  // A carrier cannot sell below its slot cost forever. Never let the modeled
  // p10 dive under the observed 52-week low.
  curve.p10 = Math.max(curve.p10, Math.round(lane.spot.low52Week * 0.95));
  curve.p25 = Math.max(curve.p25, curve.p10 + 1);
  curve.p50 = Math.max(curve.p50, curve.p25 + 1);
  curve.p75 = Math.max(curve.p75, curve.p50 + 1);
  curve.p90 = Math.max(curve.p90, curve.p75 + 1);

  return curve;
}

/** Current vs 4-week and 52-week averages, turned into a negotiating read. */
export function computeTrend(lane: FbxLane): MarketTrend {
  const vs4WeekPct = pctDelta(lane.spot.current, lane.spot.avg4Week);
  const vs52WeekPct = pctDelta(lane.spot.current, lane.spot.avg52Week);

  // 2% is inside the noise band for a weekly index — don't call that a trend.
  const direction: MarketTrend["direction"] =
    vs4WeekPct <= -2 ? "falling" : vs4WeekPct >= 2 ? "rising" : "flat";

  let summary: string;
  if (direction === "falling") {
    summary = `Spot is ${Math.abs(vs4WeekPct).toFixed(1)}% below the 4-week average — the market is softening, which is a buyer's window.`;
  } else if (direction === "rising") {
    summary = `Spot is ${vs4WeekPct.toFixed(1)}% above the 4-week average — rates are firming, so lock in length rather than chasing the bottom.`;
  } else {
    summary = "Spot is holding flat against the 4-week average — a stable lane with no urgency either way.";
  }

  if (vs52WeekPct <= -10) {
    summary += ` Against the 52-week average it is ${Math.abs(vs52WeekPct).toFixed(0)}% cheaper, so any "rates are up" framing from the carrier is not supported by the index.`;
  } else if (vs52WeekPct >= 10) {
    summary += ` It also sits ${vs52WeekPct.toFixed(0)}% above the 52-week average, so a long fixed contract at today's number is expensive.`;
  }

  return { direction, vs4WeekPct, vs52WeekPct, summary };
}

function pctDelta(actual: number, reference: number): number {
  if (reference <= 0) return 0;
  return round2(((actual - reference) / reference) * 100);
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Resolve a lane benchmark for a quote.
 *
 * Falls back, in order:
 *   1. Exact origin→dest lane.
 *   2. The reciprocal (backhaul) lane, flagged `fallback` — better than
 *      nothing, but priced very differently, so the caller must warn.
 * Anything else throws, because silently benchmarking against the wrong lane
 * is worse than telling the user we can't price it.
 */
export function resolveLaneBenchmark(params: {
  originPort: string;
  destPort: string;
  containerType: NegotiableContainerType;
}): LaneBenchmark {
  const { originPort, destPort, containerType } = params;

  const originRegion = resolveRegion(originPort);
  const destRegion = resolveRegion(destPort);

  if (originRegion === destRegion) {
    throw new LaneResolutionError(
      `Origin and destination both resolve to ${REGION_LABELS[originRegion]}. Intra-regional lanes are not covered by FBX benchmarks.`
    );
  }

  let lane = findLane(originRegion, destRegion);
  let matchQuality: LaneBenchmark["matchQuality"] = "exact";
  let matchNote = `Matched ${lane?.code} — ${lane?.label}.`;

  if (!lane) {
    const reciprocal = findLane(destRegion, originRegion);
    if (!reciprocal) {
      throw new LaneResolutionError(
        `No FBX benchmark covers ${REGION_LABELS[originRegion]} → ${REGION_LABELS[destRegion]}. Benchmark this lane manually or pick a covered lane.`
      );
    }
    lane = reciprocal;
    matchQuality = "fallback";
    matchNote =
      `No published benchmark for ${REGION_LABELS[originRegion]} → ${REGION_LABELS[destRegion]}. ` +
      `Using the backhaul lane ${reciprocal.code} (${reciprocal.label}) as a floor reference. ` +
      `Headhaul rates typically run well above backhaul, so treat this score as indicative only.`;
  } else if (lane.source === "derived") {
    matchQuality = "derived";
    matchNote =
      `${lane.code} is modeled from ${lane.derivedFrom} (x${lane.derivedMultiplier}). ` +
      (lane.derivationNote ?? "");
  }

  const ratio = CONTAINER_FEU_RATIO[containerType];
  if (!ratio) {
    throw new LaneResolutionError(
      `Container type "${containerType}" cannot be benchmarked. Supported: ${Object.keys(CONTAINER_FEU_RATIO).join(", ")}.`
    );
  }

  const feuCurve = buildPercentileCurve(lane);
  const scale = (n: number) => Math.round(n * ratio);

  return {
    lane,
    originRegion,
    destRegion,
    matchQuality,
    matchNote: matchNote.trim(),
    containerType,
    containerRatio: ratio,
    percentiles: {
      p10: scale(feuCurve.p10),
      p25: scale(feuCurve.p25),
      p50: scale(feuCurve.p50),
      p75: scale(feuCurve.p75),
      p90: scale(feuCurve.p90),
    },
    spotPerContainer: {
      current: scale(lane.spot.current),
      avg4Week: scale(lane.spot.avg4Week),
      avg52Week: scale(lane.spot.avg52Week),
      low52Week: scale(lane.spot.low52Week),
      high52Week: scale(lane.spot.high52Week),
    },
    trend: computeTrend(lane),
  };
}

// ============================================================
// Multi-modal route markers (AI-12015) — derivations
//
// Everything a quote needs is computed from the leg sequence rather than
// stored. Two consequences worth stating:
//
//   * Transit and door-to-door are different numbers. Transit is time moving;
//     door-to-door adds the days the box sits at each interchange. Quoting the
//     first as the second is how an intermodal booking misses its date.
//   * Reliability compounds. A 94% ocean leg behind a 90% rail leg behind a
//     97% drayage leg is 82%, not 94%. Reporting the weakest link, or the
//     ocean leg alone, overstates every through-routing on the page.
// ============================================================

import { getNode } from "./nodes";
import type {
  IntermodalRoute,
  LegCostLine,
  RouteLeg,
  RouteTotals,
  RouteValidationIssue,
  TransportMode,
} from "./types";

export const MODE_LABELS: Record<TransportMode, string> = {
  "ocean-fcl": "Ocean FCL",
  "ocean-lcl": "Ocean LCL",
  air: "Air",
  rail: "Rail",
  drayage: "Drayage",
  barge: "Barge",
};

/** Short label used on markers and chips where space is tight. */
export const MODE_SHORT: Record<TransportMode, string> = {
  "ocean-fcl": "Ocean",
  "ocean-lcl": "Ocean",
  air: "Air",
  rail: "Rail",
  drayage: "Drayage",
  barge: "Barge",
};

/** Node kinds each mode can legitimately start or end at. A rail leg that
 *  claims to end at a foreign seaport is a data error, not a routing. */
const MODE_ENDPOINTS: Record<TransportMode, Array<"seaport" | "rail_ramp" | "airport" | "inland_point">> = {
  "ocean-fcl": ["seaport"],
  "ocean-lcl": ["seaport"],
  barge: ["seaport", "inland_point"],
  air: ["airport"],
  rail: ["seaport", "rail_ramp", "inland_point"],
  drayage: ["seaport", "rail_ramp", "airport", "inland_point"],
};

/**
 * Countries a surface leg can move between. Rail and truck cross the US
 * borders with Canada and Mexico every day; they do not cross an ocean. A leg
 * outside this set is a data error dressed up as a routing.
 */
const SURFACE_CONTIGUOUS = new Set(["US", "CA", "MX"]);
const SURFACE_MODES: TransportMode[] = ["rail", "drayage"];

export function legTransit(leg: RouteLeg): { min: number; max: number } {
  return { min: leg.transitDays.min, max: leg.transitDays.max };
}

/**
 * Days the container sits between legs. Charged against the node the previous
 * leg dropped it at — the origin of the whole route has no interchange (it is
 * where the booking starts) and the final destination has none either (it is
 * the door).
 */
export function interchangeDwellDays(legs: RouteLeg[]): number {
  let total = 0;
  for (let i = 0; i < legs.length - 1; i++) {
    total += getNode(legs[i].toCode)?.interchangeDwellDays ?? 0;
  }
  return total;
}

/**
 * Storage exposure if the box overstays free time at every interchange. This
 * is the worst case, not a forecast: it is the number to put next to a cheap
 * rail routing so the saving can be compared against what a missed free-time
 * window costs.
 */
export function worstCaseStorage(legs: RouteLeg[]): number {
  let total = 0;
  for (let i = 0; i < legs.length - 1; i++) {
    const node = getNode(legs[i].toCode);
    if (!node) continue;
    const chargeableDays = Math.max(0, node.interchangeDwellDays - node.freeDays);
    total += chargeableDays * node.storagePerDayUsd;
  }
  return total;
}

export function modeSequence(legs: RouteLeg[]): string {
  const sequence: string[] = [];
  for (const leg of legs) {
    const label = MODE_SHORT[leg.mode];
    if (sequence[sequence.length - 1] !== label) sequence.push(label);
  }
  return sequence.join(" → ");
}

export function routeTotals(route: IntermodalRoute): RouteTotals {
  const legs = route.legs;

  const transitDays = legs.reduce(
    (acc, leg) => ({ min: acc.min + leg.transitDays.min, max: acc.max + leg.transitDays.max }),
    { min: 0, max: 0 }
  );

  const dwellDays = interchangeDwellDays(legs);
  const freightCostUsd = legs.reduce((total, leg) => total + leg.costUsd, 0);
  const worstCaseStorageUsd = worstCaseStorage(legs);

  const costByMode: Record<string, number> = {};
  const costLines: LegCostLine[] = [];
  for (const leg of legs) {
    costByMode[leg.mode] = (costByMode[leg.mode] ?? 0) + leg.costUsd;
    costLines.push({ legId: leg.id, mode: leg.mode, carrier: leg.carrier, costUsd: leg.costUsd });
  }

  // Compounded, not averaged: every leg has to hit for the box to be on time.
  const reliability = legs.length
    ? legs.reduce((product, leg) => product * (leg.reliability / 100), 1) * 100
    : 0;

  // CO2 is only reported when every leg carries a figure. A partial sum
  // silently understates the footprint of exactly the routings that add a
  // 2,000-mile rail leg.
  const co2Kg = legs.every((leg) => typeof leg.co2Kg === "number")
    ? legs.reduce((total, leg) => total + (leg.co2Kg ?? 0), 0)
    : null;

  const modes = [...new Set(legs.map((leg) => leg.mode))];

  return {
    transitDays,
    dwellDays,
    doorToDoorDays: { min: transitDays.min + dwellDays, max: transitDays.max + dwellDays },
    freightCostUsd,
    worstCaseStorageUsd,
    totalCostUsd: freightCostUsd + worstCaseStorageUsd,
    costByMode,
    costLines,
    reliability: Math.round(reliability * 10) / 10,
    co2Kg,
    modes,
    modeSequence: modeSequence(legs),
    legCount: legs.length,
  };
}

/**
 * Structural checks on a route. These catch data errors, not user input — a
 * broken chain here would silently produce a total that skips a leg, and a
 * quote that is short by a rail move is worse than no quote.
 */
export function validateRoute(route: IntermodalRoute): RouteValidationIssue[] {
  const issues: RouteValidationIssue[] = [];

  if (!route.legs.length) {
    issues.push({ code: "route.no_legs", message: "The route has no legs." });
    return issues;
  }

  for (const leg of route.legs) {
    for (const [role, code] of [["origin", leg.fromCode], ["destination", leg.toCode]] as const) {
      const node = getNode(code);
      if (!node) {
        issues.push({
          code: "leg.unknown_node",
          message: `Leg ${leg.id} references unknown ${role} node "${code}".`,
          legId: leg.id,
        });
        continue;
      }
      if (!MODE_ENDPOINTS[leg.mode].includes(node.kind)) {
        issues.push({
          code: "leg.mode_endpoint_mismatch",
          message: `Leg ${leg.id} is ${MODE_LABELS[leg.mode]} but its ${role} "${code}" is a ${node.kind}.`,
          legId: leg.id,
        });
      }
    }
    const fromNode = getNode(leg.fromCode);
    const toNode = getNode(leg.toCode);
    if (
      SURFACE_MODES.includes(leg.mode) &&
      fromNode &&
      toNode &&
      fromNode.country !== toNode.country &&
      !(SURFACE_CONTIGUOUS.has(fromNode.country) && SURFACE_CONTIGUOUS.has(toNode.country))
    ) {
      issues.push({
        code: "leg.surface_crosses_ocean",
        message: `Leg ${leg.id} is ${MODE_LABELS[leg.mode]} between ${fromNode.country} and ${toNode.country}, which no road or rail connects.`,
        legId: leg.id,
      });
    }

    if (leg.fromCode === leg.toCode) {
      issues.push({
        code: "leg.self_loop",
        message: `Leg ${leg.id} starts and ends at "${leg.fromCode}".`,
        legId: leg.id,
      });
    }
    if (leg.transitDays.min > leg.transitDays.max) {
      issues.push({
        code: "leg.inverted_transit",
        message: `Leg ${leg.id} has a minimum transit longer than its maximum.`,
        legId: leg.id,
      });
    }
  }

  for (let i = 0; i < route.legs.length - 1; i++) {
    const current = route.legs[i];
    const next = route.legs[i + 1];
    if (current.toCode !== next.fromCode) {
      issues.push({
        code: "route.broken_chain",
        message: `Leg ${current.id} ends at "${current.toCode}" but leg ${next.id} starts at "${next.fromCode}".`,
        legId: next.id,
      });
    }
  }

  return issues;
}

export function routeOrigin(route: IntermodalRoute): string {
  return route.legs[0]?.fromCode ?? "";
}

export function routeDestination(route: IntermodalRoute): string {
  return route.legs[route.legs.length - 1]?.toCode ?? "";
}

/** Every node the box touches, in order — the markers a map draws. */
export function routeNodeCodes(route: IntermodalRoute): string[] {
  if (!route.legs.length) return [];
  return [route.legs[0].fromCode, ...route.legs.map((leg) => leg.toCode)];
}

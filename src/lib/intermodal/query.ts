// ============================================================
// Multi-modal route markers (AI-12015) — filtering and ranking
//
// Pure query layer over the intermodal dataset. The API route and the UI both
// call this, so a filter behaves the same whether it came from a query string
// or a dropdown.
//
// Matching is deliberately loose at the destination end: someone searching
// "USSLC" means Salt Lake City and does not care whether the routing terminates
// at the ramp or at the door, so a ramp code matches its own `-DOOR` variant
// and vice versa. Requiring the exact terminal code would hide the all-truck
// option — which is precisely the routing that never touches the ramp.
// ============================================================

import { getNode } from "./nodes";
import { INTERMODAL_ROUTES } from "./routes";
import { routeDestination, routeOrigin, routeTotals } from "./totals";
import type { IntermodalRoute, RouteTotals, TransportMode } from "./types";

export type SortKey = "door_to_door" | "cost" | "reliability" | "co2";

export interface IntermodalQuery {
  origin?: string;
  destination?: string;
  carrier?: string;
  /** Only routes whose leg set includes every listed mode. */
  modes?: TransportMode[];
  /** Only routes sold on a single through bill of lading. */
  throughBillOnly?: boolean;
  maxDoorToDoorDays?: number;
  maxCostUsd?: number;
  sort?: SortKey;
}

export interface RankedRoute {
  route: IntermodalRoute;
  totals: RouteTotals;
  /** Days slower than the fastest route in the result set. */
  transitPremiumDays: number;
  /** Dollars above the cheapest route in the result set. */
  costPremiumUsd: number;
}

/** "USSLC" and "USSLC-DOOR" are the same place to someone searching. */
function sameMarket(a: string, b: string): boolean {
  const strip = (code: string) => code.replace(/-DOOR$/i, "").toUpperCase();
  return strip(a) === strip(b);
}

function matchesLocation(routeCode: string, wanted: string): boolean {
  const upper = wanted.trim().toUpperCase();
  if (!upper) return true;
  if (sameMarket(routeCode, upper)) return true;
  // Fall back to the city name so "Salt Lake City" works as well as "USSLC".
  const node = getNode(routeCode);
  return !!node && node.city.toUpperCase() === upper;
}

export function filterIntermodalRoutes(
  query: IntermodalQuery,
  source: IntermodalRoute[] = INTERMODAL_ROUTES
): IntermodalRoute[] {
  return source.filter((route) => {
    if (query.origin && !matchesLocation(routeOrigin(route), query.origin)) return false;
    if (query.destination && !matchesLocation(routeDestination(route), query.destination)) {
      return false;
    }
    if (query.throughBillOnly && !route.throughBillOfLading) return false;

    if (query.carrier) {
      const needle = query.carrier.trim().toLowerCase();
      const matched =
        route.sellingCarrier.toLowerCase().includes(needle) ||
        route.legs.some((leg) => leg.carrier.toLowerCase().includes(needle));
      if (!matched) return false;
    }

    if (query.modes?.length) {
      const present = new Set(route.legs.map((leg) => leg.mode));
      if (!query.modes.every((mode) => present.has(mode))) return false;
    }

    if (query.maxDoorToDoorDays !== undefined || query.maxCostUsd !== undefined) {
      const totals = routeTotals(route);
      // Compare on the worst case: a routing that only fits the deadline when
      // nothing goes wrong does not fit the deadline.
      if (
        query.maxDoorToDoorDays !== undefined &&
        totals.doorToDoorDays.max > query.maxDoorToDoorDays
      ) {
        return false;
      }
      if (query.maxCostUsd !== undefined && totals.totalCostUsd > query.maxCostUsd) return false;
    }

    return true;
  });
}

function sortValue(totals: RouteTotals, sort: SortKey): number {
  switch (sort) {
    case "cost":
      return totals.totalCostUsd;
    case "reliability":
      // Descending — higher is better.
      return -totals.reliability;
    case "co2":
      // Routes with no complete CO2 figure sort last rather than first.
      return totals.co2Kg ?? Number.POSITIVE_INFINITY;
    case "door_to_door":
    default:
      return totals.doorToDoorDays.max;
  }
}

export function rankIntermodalRoutes(
  query: IntermodalQuery = {},
  source: IntermodalRoute[] = INTERMODAL_ROUTES
): RankedRoute[] {
  const matched = filterIntermodalRoutes(query, source);
  const withTotals = matched.map((route) => ({ route, totals: routeTotals(route) }));
  if (!withTotals.length) return [];

  const fastest = Math.min(...withTotals.map((r) => r.totals.doorToDoorDays.max));
  const cheapest = Math.min(...withTotals.map((r) => r.totals.totalCostUsd));
  const sort = query.sort ?? "door_to_door";

  return withTotals
    .map((entry) => ({
      ...entry,
      transitPremiumDays: entry.totals.doorToDoorDays.max - fastest,
      costPremiumUsd: entry.totals.totalCostUsd - cheapest,
    }))
    .sort((a, b) => sortValue(a.totals, sort) - sortValue(b.totals, sort));
}

/** Distinct destination markets in the dataset, for a picker. */
export function intermodalDestinations(
  source: IntermodalRoute[] = INTERMODAL_ROUTES
): Array<{ code: string; label: string }> {
  const seen = new Map<string, { code: string; label: string }>();
  for (const route of source) {
    const code = routeDestination(route);
    const node = getNode(code);
    if (!node) continue;
    const key = code.replace(/-DOOR$/i, "");
    if (!seen.has(key)) {
      seen.set(key, { code: key, label: `${node.city}, ${node.region ?? node.country}` });
    }
  }
  return [...seen.values()].sort((a, b) => a.label.localeCompare(b.label));
}

/** Distinct origins in the dataset, for a picker. */
export function intermodalOrigins(
  source: IntermodalRoute[] = INTERMODAL_ROUTES
): Array<{ code: string; label: string }> {
  const seen = new Map<string, { code: string; label: string }>();
  for (const route of source) {
    const code = routeOrigin(route);
    const node = getNode(code);
    if (!node || seen.has(code)) continue;
    seen.set(code, { code, label: `${node.city}, ${node.country}` });
  }
  return [...seen.values()].sort((a, b) => a.label.localeCompare(b.label));
}

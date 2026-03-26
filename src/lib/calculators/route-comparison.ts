// ============================================================
// Route Comparison Calculator
// Sprint 3: Compare shipping routes between two ports
//
// Ranks routes by: cheapest, fastest, most reliable
// Factors in backhaul availability (reduces cost 10-30%)
// ============================================================

import Decimal from "decimal.js";
import { ROUTES, type RouteSegment } from "@/lib/data/routes";
import { PORTS } from "@/lib/data/ports";
import type { Port } from "@/lib/types";

Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

// ─── Types ───────────────────────────────────────────────

export interface RouteCompareInput {
  originPort: string;
  destPort: string;
  cargoType: "general" | "cold-chain" | "hazmat" | "oversized";
  unitsPerContainer?: number;
}

export interface RouteOption {
  route: RouteSegment;
  originPort: Port | undefined;
  destPort: Port | undefined;
  transshipmentPort: Port | undefined;

  // Cost analysis
  baseCostPerTEU: number;
  backhaulAdjustedCost: number;
  costPerUnit: number;

  // Time analysis
  transitDaysMin: number;
  transitDaysMax: number;
  avgTransitDays: number;

  // Reliability
  reliabilityPct: number;
  onTimeScore: number; // 0-100

  // Rankings
  cheapestRank: number;
  fastestRank: number;
  reliabilityRank: number;
  overallRank: number;

  // Flags
  isDirect: boolean;
  hasTransshipment: boolean;
  carrierName: string;
  serviceRoute: string;
}

export interface RouteCompareResult {
  originPort: Port | undefined;
  destPort: Port | undefined;
  routeCount: number;
  routes: RouteOption[];
  cheapest: RouteOption | null;
  fastest: RouteOption | null;
  mostReliable: RouteOption | null;
  recommended: RouteOption | null;
}

/**
 * Compare all available routes between two ports
 */
export function compareRoutes(input: RouteCompareInput): RouteCompareResult {
  const { originPort: originCode, destPort: destCode, unitsPerContainer = 5000 } = input;

  const originPort = PORTS.find((p) => p.unlocode === originCode);
  const destPort = PORTS.find((p) => p.unlocode === destCode);

  // Find matching routes
  const matchingRoutes = ROUTES.filter(
    (r) => r.originCode === originCode && r.destCode === destCode
  );

  if (matchingRoutes.length === 0) {
    return {
      originPort,
      destPort,
      routeCount: 0,
      routes: [],
      cheapest: null,
      fastest: null,
      mostReliable: null,
      recommended: null,
    };
  }

  // Calculate metrics for each route
  const routeOptions: RouteOption[] = matchingRoutes.map((route) => {
    const baseCost = new Decimal(route.costPerTEU);
    const backhaulDiscount = new Decimal(route.backhaulDiscount).div(100);
    const backhaulAdjusted = baseCost.mul(new Decimal(1).sub(backhaulDiscount));

    const units = new Decimal(unitsPerContainer);
    const costPerUnit = units.gt(0)
      ? backhaulAdjusted.div(units)
      : new Decimal(0);

    const avgTransit = new Decimal(route.transitDays.min + route.transitDays.max).div(2);

    const transPort = route.transshipmentCode
      ? PORTS.find((p) => p.unlocode === route.transshipmentCode)
      : undefined;

    return {
      route,
      originPort,
      destPort,
      transshipmentPort: transPort,
      baseCostPerTEU: baseCost.toNumber(),
      backhaulAdjustedCost: backhaulAdjusted.toNumber(),
      costPerUnit: costPerUnit.toNumber(),
      transitDaysMin: route.transitDays.min,
      transitDaysMax: route.transitDays.max,
      avgTransitDays: avgTransit.toNumber(),
      reliabilityPct: route.reliability,
      onTimeScore: route.reliability,
      cheapestRank: 0,
      fastestRank: 0,
      reliabilityRank: 0,
      overallRank: 0,
      isDirect: route.direct,
      hasTransshipment: !route.direct,
      carrierName: route.carrier,
      serviceRoute: route.serviceRoute,
    };
  });

  // Rank by cost (cheapest first)
  const byCost = [...routeOptions].sort(
    (a, b) => a.backhaulAdjustedCost - b.backhaulAdjustedCost
  );
  byCost.forEach((r, i) => {
    r.cheapestRank = i + 1;
  });

  // Rank by speed (fastest first)
  const bySpeed = [...routeOptions].sort(
    (a, b) => a.avgTransitDays - b.avgTransitDays
  );
  bySpeed.forEach((r, i) => {
    r.fastestRank = i + 1;
  });

  // Rank by reliability (highest first)
  const byReliability = [...routeOptions].sort(
    (a, b) => b.reliabilityPct - a.reliabilityPct
  );
  byReliability.forEach((r, i) => {
    r.reliabilityRank = i + 1;
  });

  // Overall rank: weighted composite (cost 40%, speed 30%, reliability 30%)
  routeOptions.forEach((r) => {
    r.overallRank =
      r.cheapestRank * 0.4 + r.fastestRank * 0.3 + r.reliabilityRank * 0.3;
  });

  const byOverall = [...routeOptions].sort(
    (a, b) => a.overallRank - b.overallRank
  );

  return {
    originPort,
    destPort,
    routeCount: routeOptions.length,
    routes: byOverall,
    cheapest: byCost[0] ?? null,
    fastest: bySpeed[0] ?? null,
    mostReliable: byReliability[0] ?? null,
    recommended: byOverall[0] ?? null,
  };
}

/**
 * Get all available destination ports from a given origin
 */
export function getAvailableDestinations(originCode: string): string[] {
  return [...new Set(ROUTES.filter((r) => r.originCode === originCode).map((r) => r.destCode))];
}

/**
 * Get all available origin ports for a given destination
 */
export function getAvailableOrigins(destCode: string): string[] {
  return [...new Set(ROUTES.filter((r) => r.destCode === destCode).map((r) => r.originCode))];
}

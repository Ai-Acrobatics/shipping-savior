// ============================================================
// AI-Powered Route Optimizer
// Sprint 4: AI Agent Layer
//
// Recommends optimal shipping routes based on cost, speed,
// reliability preferences. Uses Claude for natural language
// reasoning and backhaul opportunity analysis.
// ============================================================

import { getAnthropicClient, getCached, setCache, makeCacheKey, trackUsage } from "./client";
import { ROUTES, type RouteSegment } from "@/lib/data/routes";
import { PORTS } from "@/lib/data/ports";
import type { Port } from "@/lib/types";

// ─── Types ───────────────────────────────────────────────────

export interface RouteOptimizationInput {
  originPort: string;
  destPort: string;
  cargoType: "general" | "cold-chain";
  prioritize: "cost" | "speed" | "reliability";
  containerType: "20ft" | "40ft" | "40HC" | "reefer";
  flexibleDates: boolean;
}

export interface RouteOption {
  routeId: string;
  carrier: string;
  originPort: string;
  originPortName: string;
  destPort: string;
  destPortName: string;
  transitDays: { min: number; max: number };
  estimatedCost: number;
  reliability: number;
  direct: boolean;
  transshipmentPort?: string;
  backhaulDiscount: number;
  serviceRoute: string;
}

export interface RouteRecommendation {
  recommended: RouteOption;
  alternatives: RouteOption[];
  reasoning: string;
  savings: {
    vsBestAlternative: number;
    vsMarketAverage: number;
  };
  processingTimeMs: number;
}

// ─── Container Type Mapping ──────────────────────────────────

const CONTAINER_COST_MULTIPLIER: Record<string, number> = {
  "20ft": 0.6,
  "40ft": 1.0,
  "40HC": 1.05,
  reefer: 1.8,
};

// ─── Route Optimization ──────────────────────────────────────

export async function optimizeRoute(
  input: RouteOptimizationInput
): Promise<RouteRecommendation> {
  const startTime = Date.now();

  // Check cache
  const cacheKey = makeCacheKey("route", input as unknown as Record<string, unknown>);
  const cached = getCached<RouteRecommendation>(cacheKey);
  if (cached) return cached;

  // Find matching routes
  const matchingRoutes = findMatchingRoutes(input);

  if (matchingRoutes.length === 0) {
    throw new Error(
      `No routes found from ${input.originPort} to ${input.destPort}. Available origins: ${[...new Set(ROUTES.map((r) => r.originCode))].join(", ")}`
    );
  }

  // Score and rank routes
  const scoredRoutes = scoreRoutes(matchingRoutes, input);

  // Build route options
  const routeOptions = scoredRoutes.map((sr) => buildRouteOption(sr.route, input));

  // Use Claude for reasoning
  const reasoning = await generateRouteReasoning(input, routeOptions);

  const recommended = routeOptions[0]!;
  const alternatives = routeOptions.slice(1);

  // Calculate savings
  const altCosts = alternatives.map((a) => a.estimatedCost);
  const avgMarketCost =
    routeOptions.reduce((s, r) => s + r.estimatedCost, 0) / routeOptions.length;

  const result: RouteRecommendation = {
    recommended,
    alternatives,
    reasoning,
    savings: {
      vsBestAlternative:
        altCosts.length > 0
          ? Math.round(Math.min(...altCosts) - recommended.estimatedCost)
          : 0,
      vsMarketAverage: Math.round(avgMarketCost - recommended.estimatedCost),
    },
    processingTimeMs: Date.now() - startTime,
  };

  setCache(cacheKey, result);
  return result;
}

// ─── Find Matching Routes ────────────────────────────────────

function findMatchingRoutes(input: RouteOptimizationInput): RouteSegment[] {
  let matches = ROUTES.filter(
    (r) => r.originCode === input.originPort && r.destCode === input.destPort
  );

  // If no direct match, try finding routes to nearby ports
  if (matches.length === 0) {
    const destPort = PORTS.find((p) => p.unlocode === input.destPort);
    if (destPort) {
      // Try all US destination ports
      const usDests = PORTS.filter(
        (p) => p.country === "US" && p.type === "seaport"
      ).map((p) => p.unlocode);

      matches = ROUTES.filter(
        (r) =>
          r.originCode === input.originPort && usDests.includes(r.destCode)
      );
    }
  }

  // Filter cold chain if needed
  if (input.cargoType === "cold-chain") {
    const coldCapablePorts = new Set(
      PORTS.filter((p) => p.coldChainCapable).map((p) => p.unlocode)
    );
    matches = matches.filter(
      (r) =>
        coldCapablePorts.has(r.originCode) && coldCapablePorts.has(r.destCode)
    );
  }

  return matches;
}

// ─── Score Routes ────────────────────────────────────────────

function scoreRoutes(
  routes: RouteSegment[],
  input: RouteOptimizationInput
): Array<{ route: RouteSegment; score: number }> {
  const weights = {
    cost: input.prioritize === "cost" ? 0.6 : 0.2,
    speed: input.prioritize === "speed" ? 0.6 : 0.2,
    reliability: input.prioritize === "reliability" ? 0.6 : 0.2,
  };

  const maxCost = Math.max(...routes.map((r) => r.costPerTEU));
  const minCost = Math.min(...routes.map((r) => r.costPerTEU));
  const maxTransit = Math.max(...routes.map((r) => r.transitDays.max));
  const minTransit = Math.min(...routes.map((r) => r.transitDays.min));

  return routes
    .map((route) => {
      // Normalize scores (0-1, higher is better)
      const costScore =
        maxCost !== minCost
          ? 1 - (route.costPerTEU - minCost) / (maxCost - minCost)
          : 1;
      const speedScore =
        maxTransit !== minTransit
          ? 1 -
            (route.transitDays.min - minTransit) / (maxTransit - minTransit)
          : 1;
      const reliabilityScore = route.reliability / 100;

      // Backhaul bonus
      const backhaulBonus = route.backhaulDiscount > 10 ? 0.1 : 0;

      // Direct route bonus
      const directBonus = route.direct ? 0.05 : 0;

      const score =
        costScore * weights.cost +
        speedScore * weights.speed +
        reliabilityScore * weights.reliability +
        backhaulBonus +
        directBonus;

      return { route, score };
    })
    .sort((a, b) => b.score - a.score);
}

// ─── Build Route Option ──────────────────────────────────────

function buildRouteOption(
  route: RouteSegment,
  input: RouteOptimizationInput
): RouteOption {
  const containerMultiplier = CONTAINER_COST_MULTIPLIER[input.containerType] ?? 1.0;
  const backhaulSavings = route.costPerTEU * (route.backhaulDiscount / 100);
  const estimatedCost = Math.round(
    (route.costPerTEU - backhaulSavings) * containerMultiplier
  );

  const originPort = PORTS.find((p) => p.unlocode === route.originCode);
  const destPort = PORTS.find((p) => p.unlocode === route.destCode);

  return {
    routeId: route.id,
    carrier: route.carrier,
    originPort: route.originCode,
    originPortName: originPort?.name ?? route.originCode,
    destPort: route.destCode,
    destPortName: destPort?.name ?? route.destCode,
    transitDays: route.transitDays,
    estimatedCost,
    reliability: route.reliability,
    direct: route.direct,
    transshipmentPort: route.transshipmentCode,
    backhaulDiscount: route.backhaulDiscount,
    serviceRoute: route.serviceRoute,
  };
}

// ─── AI Reasoning Generation ─────────────────────────────────

async function generateRouteReasoning(
  input: RouteOptimizationInput,
  options: RouteOption[]
): Promise<string> {
  try {
    const client = getAnthropicClient();

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 500,
      system:
        "You are a freight logistics expert. Provide a concise 2-3 sentence recommendation explaining why the top route is the best choice. Mention specific advantages like backhaul discounts, reliability, or transit time. Be specific with numbers. Do NOT use markdown formatting.",
      messages: [
        {
          role: "user",
          content: `Route optimization request:
Origin: ${input.originPort}
Destination: ${input.destPort}
Cargo: ${input.cargoType}
Priority: ${input.prioritize}
Container: ${input.containerType}
Flexible dates: ${input.flexibleDates}

Top options:
${options
  .map(
    (o, i) =>
      `${i + 1}. ${o.carrier} (${o.serviceRoute}): $${o.estimatedCost}, ${o.transitDays.min}-${o.transitDays.max} days, ${o.reliability}% on-time, ${o.direct ? "direct" : "via " + o.transshipmentPort}, ${o.backhaulDiscount}% backhaul discount`
  )
  .join("\n")}`,
        },
      ],
    });

    trackUsage(
      "system",
      "route-optimize",
      response.usage?.input_tokens ?? 0,
      response.usage?.output_tokens ?? 0
    );

    const textBlock = response.content.find((b) => b.type === "text");
    return textBlock && textBlock.type === "text"
      ? textBlock.text
      : "Route recommendation based on scoring algorithm.";
  } catch {
    // Fallback to algorithmic reasoning
    const top = options[0];
    if (!top) return "No routes available for analysis.";
    return `${top.carrier} via ${top.serviceRoute} is recommended for ${input.prioritize}-optimized routing. Estimated cost: $${top.estimatedCost} with ${top.transitDays.min}-${top.transitDays.max} day transit and ${top.reliability}% on-time reliability.${top.backhaulDiscount > 10 ? ` A ${top.backhaulDiscount}% backhaul discount makes this route particularly cost-effective.` : ""}`;
  }
}

/**
 * Multi-modal route options — AI-12015
 *
 * GET /api/routes/intermodal?origin=&destination=&carrier=&modes=&sort=
 *
 * Sibling of /api/routes/compare, which answers "which vessel service crosses
 * this ocean". This one answers the question a shipper going to Salt Lake City
 * actually has: which combination of ocean, rail and truck gets the box to the
 * door, what does the whole chain cost, and how long does it really take once
 * the ramp dwell is counted.
 *
 * Public and read-only — it serves a static, non-customer dataset, the same as
 * /api/routes/compare, /api/ports and /api/schedules/search. Nothing here is
 * scoped to an organization.
 *
 * All filtering and ranking lives in lib/intermodal so the UI and the API
 * cannot disagree about what "fits in 25 days" means.
 */

import { NextRequest, NextResponse } from "next/server";
import {
  MODE_LABELS,
  getNode,
  intermodalDestinations,
  intermodalOrigins,
  rankIntermodalRoutes,
  routeNodeCodes,
  validateRoute,
  type IntermodalQuery,
  type SortKey,
  type TransportMode,
} from "@/lib/intermodal";

const SORT_KEYS: SortKey[] = ["door_to_door", "cost", "reliability", "co2"];
const MODES = Object.keys(MODE_LABELS) as TransportMode[];

function parsePositiveInt(raw: string | null): number | undefined {
  if (raw === null || raw.trim() === "") return undefined;
  const value = Number(raw);
  return Number.isFinite(value) && value > 0 ? value : undefined;
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;

  const rawSort = params.get("sort");
  if (rawSort && !SORT_KEYS.includes(rawSort as SortKey)) {
    return NextResponse.json(
      { error: `Unknown sort "${rawSort}". Use one of: ${SORT_KEYS.join(", ")}.` },
      { status: 400 }
    );
  }

  const rawModes = (params.get("modes") ?? "")
    .split(",")
    .map((m) => m.trim())
    .filter(Boolean);
  const unknownMode = rawModes.find((m) => !MODES.includes(m as TransportMode));
  if (unknownMode) {
    return NextResponse.json(
      { error: `Unknown mode "${unknownMode}". Use one of: ${MODES.join(", ")}.` },
      { status: 400 }
    );
  }

  const query: IntermodalQuery = {
    origin: params.get("origin") ?? undefined,
    destination: params.get("destination") ?? undefined,
    carrier: params.get("carrier") ?? undefined,
    modes: rawModes.length ? (rawModes as TransportMode[]) : undefined,
    throughBillOnly: params.get("throughBillOnly") === "1",
    maxDoorToDoorDays: parsePositiveInt(params.get("maxDays")),
    maxCostUsd: parsePositiveInt(params.get("maxCost")),
    sort: (rawSort as SortKey | null) ?? undefined,
  };

  const ranked = rankIntermodalRoutes(query);

  const results = ranked.map(({ route, totals, transitPremiumDays, costPremiumUsd }) => ({
    id: route.id,
    label: route.label,
    sellingCarrier: route.sellingCarrier,
    throughBillOfLading: route.throughBillOfLading,
    notes: route.notes ?? null,
    modeSequence: totals.modeSequence,
    modes: totals.modes,
    doorToDoorDays: totals.doorToDoorDays,
    transitDays: totals.transitDays,
    dwellDays: totals.dwellDays,
    freightCostUsd: totals.freightCostUsd,
    worstCaseStorageUsd: totals.worstCaseStorageUsd,
    totalCostUsd: totals.totalCostUsd,
    costByMode: totals.costByMode,
    reliability: totals.reliability,
    co2Kg: totals.co2Kg,
    transitPremiumDays,
    costPremiumUsd,
    // The markers a map draws — every place the box touches, in order.
    markers: routeNodeCodes(route).map((code) => {
      const node = getNode(code);
      return {
        code,
        name: node?.name ?? code,
        city: node?.city ?? null,
        kind: node?.kind ?? null,
        lat: node?.lat ?? null,
        lng: node?.lng ?? null,
        interchangeDwellDays: node?.interchangeDwellDays ?? 0,
        freeDays: node?.freeDays ?? 0,
      };
    }),
    legs: route.legs.map((leg) => ({
      id: leg.id,
      mode: leg.mode,
      modeLabel: MODE_LABELS[leg.mode],
      from: leg.fromCode,
      to: leg.toCode,
      carrier: leg.carrier,
      service: leg.service ?? null,
      transitDays: leg.transitDays,
      costUsd: leg.costUsd,
      frequency: leg.frequency,
      reliability: leg.reliability,
      co2Kg: leg.co2Kg ?? null,
      notes: leg.notes ?? null,
    })),
    // Surfaced rather than swallowed: a route with a structural problem should
    // be visible as broken, not quietly dropped from the comparison.
    issues: validateRoute(route),
  }));

  const summary = ranked.length
    ? {
        fastestDoorToDoorDays: Math.min(...ranked.map((r) => r.totals.doorToDoorDays.max)),
        cheapestTotalUsd: Math.min(...ranked.map((r) => r.totals.totalCostUsd)),
        bestReliability: Math.max(...ranked.map((r) => r.totals.reliability)),
        carriers: [...new Set(ranked.map((r) => r.route.sellingCarrier))],
        modes: [...new Set(ranked.flatMap((r) => r.totals.modes))],
      }
    : null;

  return NextResponse.json({
    query: {
      origin: query.origin ?? "any",
      destination: query.destination ?? "any",
      carrier: query.carrier ?? "all",
      modes: query.modes ?? "any",
      sort: query.sort ?? "door_to_door",
    },
    count: results.length,
    summary,
    origins: intermodalOrigins(),
    destinations: intermodalDestinations(),
    results,
  });
}

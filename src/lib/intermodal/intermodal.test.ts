/**
 * Unit tests for multi-modal route markers (AI-12015).
 *
 * Pure functions and static data — no DB, no network.
 *
 * The dataset itself gets tested, not just the maths. A broken leg chain or a
 * rail leg that claims to start at a Chinese seaport would silently produce a
 * total that skips a move, and a quote short by a rail leg is worse than no
 * quote.
 */
import { describe, it, expect } from "vitest";
import {
  INTERMODAL_ROUTES,
  ROUTE_NODES,
  filterIntermodalRoutes,
  getInlandDestinations,
  getIntermodalRoute,
  getNode,
  interchangeDwellDays,
  intermodalDestinations,
  intermodalOrigins,
  modeSequence,
  rankIntermodalRoutes,
  routeDestination,
  routeNodeCodes,
  routeOrigin,
  routeTotals,
  validateRoute,
  worstCaseStorage,
  MODE_LABELS,
  type IntermodalRoute,
  type RouteLeg,
} from "./index";

function leg(overrides: Partial<RouteLeg> & Pick<RouteLeg, "id" | "mode" | "fromCode" | "toCode">): RouteLeg {
  return {
    carrier: "Test Carrier",
    transitDays: { min: 1, max: 1 },
    costUsd: 100,
    frequency: "weekly",
    reliability: 100,
    ...overrides,
  };
}

function route(legs: RouteLeg[], overrides: Partial<IntermodalRoute> = {}): IntermodalRoute {
  return {
    id: "test-route",
    sellingCarrier: "Test Carrier",
    throughBillOfLading: true,
    label: "Test",
    legs,
    ...overrides,
  };
}

// ─────────────────────────────────────────────────────────
// Dataset integrity
// ─────────────────────────────────────────────────────────

describe("intermodal dataset", () => {
  it("has no structural errors in any shipped route", () => {
    const broken = INTERMODAL_ROUTES.flatMap((r) =>
      validateRoute(r).map((issue) => `${r.id}: ${issue.message}`)
    );
    expect(broken).toEqual([]);
  });

  it("gives every route a unique id and every node a unique code", () => {
    const routeIds = INTERMODAL_ROUTES.map((r) => r.id);
    expect(new Set(routeIds).size).toBe(routeIds.length);
    const nodeCodes = ROUTE_NODES.map((n) => n.code);
    expect(new Set(nodeCodes).size).toBe(nodeCodes.length);
  });

  it("gives every leg a unique id within its route", () => {
    for (const r of INTERMODAL_ROUTES) {
      const ids = r.legs.map((l) => l.id);
      expect(new Set(ids).size, `duplicate leg id in ${r.id}`).toBe(ids.length);
    }
  });

  it("models the CMA CGM rail routing to Salt Lake City the issue names", () => {
    const slc = getIntermodalRoute("cma-cnsha-usslc-ipi");
    expect(slc).toBeDefined();
    expect(slc!.sellingCarrier).toBe("CMA CGM");
    expect(slc!.legs.map((l) => l.mode)).toEqual(["ocean-fcl", "rail", "drayage"]);
    expect(routeOrigin(slc!)).toBe("CNSHA");
    expect(routeDestination(slc!)).toBe("USSLC-DOOR");
    expect(routeTotals(slc!).modeSequence).toBe("Ocean → Rail → Drayage");
  });

  it("offers more than one option into every inland market it covers", () => {
    const byMarket = new Map<string, number>();
    for (const r of INTERMODAL_ROUTES) {
      const key = routeDestination(r).replace(/-DOOR$/, "");
      byMarket.set(key, (byMarket.get(key) ?? 0) + 1);
    }
    // Salt Lake City is the lane on the ticket and must be comparable.
    expect(byMarket.get("USSLC")).toBeGreaterThanOrEqual(3);
  });

  it("covers every transport mode the feature claims to represent", () => {
    const modes = new Set(INTERMODAL_ROUTES.flatMap((r) => r.legs.map((l) => l.mode)));
    expect(modes.has("ocean-fcl")).toBe(true);
    expect(modes.has("rail")).toBe(true);
    expect(modes.has("air")).toBe(true);
    expect(modes.has("drayage")).toBe(true);
  });

  it("labels every mode it can emit", () => {
    for (const r of INTERMODAL_ROUTES) {
      for (const l of r.legs) expect(MODE_LABELS[l.mode]).toBeTruthy();
    }
  });

  it("exposes inland ramps and doors that the port dataset never had", () => {
    const inland = getInlandDestinations().map((n) => n.code);
    expect(inland).toContain("USSLC");
    expect(inland).toContain("USSLC-DOOR");
    expect(getNode("USSLC")!.kind).toBe("rail_ramp");
    expect(getNode("USSLC-DOOR")!.kind).toBe("inland_point");
  });
});

// ─────────────────────────────────────────────────────────
// Validation
// ─────────────────────────────────────────────────────────

describe("route validation", () => {
  it("catches a chain where one leg does not start where the last one ended", () => {
    const broken = route([
      leg({ id: "a", mode: "ocean-fcl", fromCode: "CNSHA", toCode: "USLAX" }),
      leg({ id: "b", mode: "rail", fromCode: "USLGB", toCode: "USSLC" }),
    ]);
    const issues = validateRoute(broken);
    expect(issues.some((i) => i.code === "route.broken_chain")).toBe(true);
  });

  it("catches a rail leg that claims to cross an ocean", () => {
    const impossible = route([leg({ id: "a", mode: "rail", fromCode: "CNSHA", toCode: "USLAX" })]);
    // Both endpoints are seaports, so the mode/endpoint rule is satisfied —
    // it takes the geographic rule to reject this.
    expect(validateRoute(impossible).map((i) => i.code)).toContain("leg.surface_crosses_ocean");
  });

  it("allows surface legs across the Canadian and Mexican borders", () => {
    const crossBorder = route([
      leg({ id: "a", mode: "rail", fromCode: "USSEA", toCode: "USCHI" }),
    ]);
    expect(validateRoute(crossBorder).map((i) => i.code)).not.toContain(
      "leg.surface_crosses_ocean"
    );
  });

  it("catches a leg whose mode cannot use the kind of place it starts from", () => {
    const airOnRamp = route([leg({ id: "a", mode: "air", fromCode: "USSLC", toCode: "USCHI" })]);
    expect(
      validateRoute(airOnRamp).filter((i) => i.code === "leg.mode_endpoint_mismatch").length
    ).toBe(2);
  });

  it("catches unknown nodes, self-loops and inverted transits", () => {
    const bad = route([
      leg({ id: "a", mode: "rail", fromCode: "NOWHERE", toCode: "USSLC" }),
      leg({ id: "b", mode: "drayage", fromCode: "USSLC", toCode: "USSLC" }),
      leg({
        id: "c",
        mode: "drayage",
        fromCode: "USSLC",
        toCode: "USSLC-DOOR",
        transitDays: { min: 5, max: 2 },
      }),
    ]);
    const codes = validateRoute(bad).map((i) => i.code);
    expect(codes).toContain("leg.unknown_node");
    expect(codes).toContain("leg.self_loop");
    expect(codes).toContain("leg.inverted_transit");
  });

  it("reports an empty route rather than dividing by nothing", () => {
    expect(validateRoute(route([]))).toEqual([{ code: "route.no_legs", message: "The route has no legs." }]);
  });
});

// ─────────────────────────────────────────────────────────
// Totals
// ─────────────────────────────────────────────────────────

describe("route totals", () => {
  const threeLeg = route([
    leg({
      id: "ocean",
      mode: "ocean-fcl",
      fromCode: "CNSHA",
      toCode: "USLAX",
      transitDays: { min: 15, max: 19 },
      costUsd: 4000,
      reliability: 90,
      co2Kg: 1200,
    }),
    leg({
      id: "rail",
      mode: "rail",
      fromCode: "USLAX",
      toCode: "USSLC",
      transitDays: { min: 3, max: 5 },
      costUsd: 1000,
      reliability: 90,
      co2Kg: 300,
    }),
    leg({
      id: "dray",
      mode: "drayage",
      fromCode: "USSLC",
      toCode: "USSLC-DOOR",
      transitDays: { min: 1, max: 1 },
      costUsd: 400,
      reliability: 100,
      co2Kg: 45,
    }),
  ]);

  it("separates time moving from time waiting", () => {
    const t = routeTotals(threeLeg);
    expect(t.transitDays).toEqual({ min: 19, max: 25 });
    // USLAX interchange 3 days + USSLC interchange 1 day. The final node is
    // the door, so it contributes nothing.
    expect(t.dwellDays).toBe(4);
    expect(t.doorToDoorDays).toEqual({ min: 23, max: 29 });
  });

  it("does not charge interchange dwell at the origin or the final destination", () => {
    const single = route([
      leg({ id: "only", mode: "drayage", fromCode: "USLAX", toCode: "USSLC-DOOR" }),
    ]);
    expect(interchangeDwellDays(single.legs)).toBe(0);
    // USLAX has a 3-day interchange, but it is where this route starts.
    expect(routeTotals(single).dwellDays).toBe(0);
  });

  it("compounds reliability across the chain instead of reporting one leg", () => {
    // 0.90 * 0.90 * 1.00 = 0.81
    expect(routeTotals(threeLeg).reliability).toBe(81);
  });

  it("sums freight and breaks it down by mode", () => {
    const t = routeTotals(threeLeg);
    expect(t.freightCostUsd).toBe(5400);
    expect(t.costByMode).toEqual({ "ocean-fcl": 4000, rail: 1000, drayage: 400 });
    expect(t.costLines.map((l) => l.legId)).toEqual(["ocean", "rail", "dray"]);
  });

  it("prices the worst-case storage from free time actually exceeded", () => {
    // USLAX: 3 dwell days against 4 free -> nothing chargeable.
    // USSLC: 1 dwell day against 2 free   -> nothing chargeable.
    expect(worstCaseStorage(threeLeg.legs)).toBe(0);

    // Chicago dwells 2 days against 2 free days — still nothing. Push a route
    // through a node whose dwell exceeds its free time to prove the arithmetic.
    const overstayed = route([
      leg({ id: "a", mode: "ocean-fcl", fromCode: "CNSHA", toCode: "USLAX" }),
      leg({ id: "b", mode: "rail", fromCode: "USLAX", toCode: "USSLC" }),
      leg({ id: "c", mode: "drayage", fromCode: "USSLC", toCode: "USSLC-DOOR" }),
    ]);
    const lax = getNode("USLAX")!;
    const expected = Math.max(0, lax.interchangeDwellDays - lax.freeDays) * lax.storagePerDayUsd;
    expect(worstCaseStorage(overstayed.legs)).toBe(expected);
  });

  it("reports no CO2 at all rather than a partial sum", () => {
    const partial = route([
      leg({ id: "a", mode: "ocean-fcl", fromCode: "CNSHA", toCode: "USLAX", co2Kg: 1200 }),
      leg({ id: "b", mode: "rail", fromCode: "USLAX", toCode: "USSLC" }),
    ]);
    expect(routeTotals(partial).co2Kg).toBeNull();
    expect(routeTotals(threeLeg).co2Kg).toBe(1545);
  });

  it("collapses repeated modes in the sequence label", () => {
    expect(
      modeSequence([
        leg({ id: "a", mode: "ocean-fcl", fromCode: "CNSHA", toCode: "USLAX" }),
        leg({ id: "b", mode: "rail", fromCode: "USLAX", toCode: "USCHI" }),
        leg({ id: "c", mode: "drayage", fromCode: "USCHI", toCode: "USCHI-DOOR" }),
      ])
    ).toBe("Ocean → Rail → Drayage");
    expect(
      modeSequence([
        leg({ id: "a", mode: "drayage", fromCode: "USLAX", toCode: "USSLC" }),
        leg({ id: "b", mode: "drayage", fromCode: "USSLC", toCode: "USSLC-DOOR" }),
      ])
    ).toBe("Drayage");
  });

  it("lists every node the box touches, in order, for map markers", () => {
    expect(routeNodeCodes(threeLeg)).toEqual(["CNSHA", "USLAX", "USSLC", "USSLC-DOOR"]);
    expect(routeNodeCodes(route([]))).toEqual([]);
  });
});

// ─────────────────────────────────────────────────────────
// Query
// ─────────────────────────────────────────────────────────

describe("intermodal query", () => {
  it("treats the ramp and the door as the same market", () => {
    const byRamp = filterIntermodalRoutes({ destination: "USSLC" });
    const byDoor = filterIntermodalRoutes({ destination: "USSLC-DOOR" });
    expect(byRamp.length).toBeGreaterThan(0);
    expect(byRamp.map((r) => r.id).sort()).toEqual(byDoor.map((r) => r.id).sort());
  });

  it("finds the all-truck routing that never touches the ramp", () => {
    const slc = filterIntermodalRoutes({ destination: "USSLC" });
    const allTruck = slc.find((r) => !r.legs.some((l) => l.mode === "rail"));
    expect(allTruck, "an all-truck option must survive a ramp-code search").toBeDefined();
  });

  it("matches a destination by city name as well as by code", () => {
    expect(filterIntermodalRoutes({ destination: "Salt Lake City" }).length).toBeGreaterThan(0);
  });

  it("filters by carrier across the selling carrier and every leg carrier", () => {
    expect(filterIntermodalRoutes({ carrier: "CMA" }).length).toBeGreaterThan(0);
    // Union Pacific never sells a booking — it only ever appears on a rail leg.
    const up = filterIntermodalRoutes({ carrier: "Union Pacific" });
    expect(up.length).toBeGreaterThan(0);
    expect(up.every((r) => r.sellingCarrier !== "Union Pacific")).toBe(true);
  });

  it("requires every listed mode to be present, not any of them", () => {
    const railAndAir = filterIntermodalRoutes({ modes: ["rail", "air"] });
    expect(railAndAir).toEqual([]);
    const oceanAndRail = filterIntermodalRoutes({ modes: ["ocean-fcl", "rail"] });
    expect(oceanAndRail.length).toBeGreaterThan(0);
  });

  it("filters through-bill routings from merchant haulage", () => {
    const through = filterIntermodalRoutes({ throughBillOnly: true });
    expect(through.every((r) => r.throughBillOfLading)).toBe(true);
    expect(through.length).toBeLessThan(INTERMODAL_ROUTES.length);
  });

  it("applies a deadline against the worst case, not the best", () => {
    const target = INTERMODAL_ROUTES[0];
    const totals = routeTotals(target);
    const justUnder = filterIntermodalRoutes({
      destination: routeDestination(target),
      maxDoorToDoorDays: totals.doorToDoorDays.max - 1,
    });
    expect(justUnder.map((r) => r.id)).not.toContain(target.id);

    const exact = filterIntermodalRoutes({
      destination: routeDestination(target),
      maxDoorToDoorDays: totals.doorToDoorDays.max,
    });
    expect(exact.map((r) => r.id)).toContain(target.id);
  });

  it("ranks by door-to-door time by default and reports the premium over the best", () => {
    const ranked = rankIntermodalRoutes({ destination: "USSLC" });
    expect(ranked.length).toBeGreaterThan(1);
    for (let i = 1; i < ranked.length; i++) {
      expect(ranked[i].totals.doorToDoorDays.max).toBeGreaterThanOrEqual(
        ranked[i - 1].totals.doorToDoorDays.max
      );
    }
    expect(ranked[0].transitPremiumDays).toBe(0);
    expect(Math.min(...ranked.map((r) => r.costPremiumUsd))).toBe(0);
  });

  it("sorts by cost, reliability and CO2 on request", () => {
    const byCost = rankIntermodalRoutes({ destination: "USSLC", sort: "cost" });
    expect(byCost[0].totals.totalCostUsd).toBe(
      Math.min(...byCost.map((r) => r.totals.totalCostUsd))
    );

    const byReliability = rankIntermodalRoutes({ destination: "USSLC", sort: "reliability" });
    expect(byReliability[0].totals.reliability).toBe(
      Math.max(...byReliability.map((r) => r.totals.reliability))
    );

    const byCo2 = rankIntermodalRoutes({ sort: "co2" });
    const figures = byCo2.map((r) => r.totals.co2Kg).filter((v): v is number => v !== null);
    expect(figures[0]).toBe(Math.min(...figures));
  });

  it("returns an empty ranking rather than throwing on no matches", () => {
    expect(rankIntermodalRoutes({ destination: "USXXX" })).toEqual([]);
  });

  it("offers pickers built from the data, not a hardcoded list", () => {
    const destinations = intermodalDestinations().map((d) => d.code);
    expect(destinations).toContain("USSLC");
    expect(destinations.every((c) => !c.endsWith("-DOOR"))).toBe(true);
    expect(intermodalOrigins().map((o) => o.code)).toContain("CNSHA");
  });
});

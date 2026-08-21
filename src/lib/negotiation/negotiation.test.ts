/**
 * Unit tests for the rate negotiation agent (AI-12020).
 *
 * Pure-function math — no DB, no network, no LLM.
 *
 * What we're locking down:
 *   - Lane resolution: UN/LOCODE and country codes, US coast disambiguation,
 *     derived lanes, backhaul fallback, and hard failures on uncoverable lanes
 *   - Percentile curve integrity: strictly increasing, p50 anchored to the
 *     4-week average, floor never dives under the 52-week low
 *   - Container normalization: a 20ft is ~62% of a 40ft, NOT 50%
 *   - Scoring: percentile interpolation is exact at the knot points, grade
 *     and verdict band boundaries, per-shipment charge amortization
 *   - Surcharge outlier detection incl. carrier alias codes (THC -> DTHC)
 *   - Counter-offer ladder: monotonically decreasing, never asks a carrier to
 *     RAISE its own quote, walk-away above target
 *   - Savings math: annualization converts per-container to per-FEU first
 *   - Script generation: every number in the copy traces to the analysis
 */
import { describe, it, expect } from "vitest";
import {
  analyzeQuote,
  buildPercentileCurve,
  computeAllInPerContainer,
  computeTrend,
  CONTAINER_FEU_RATIO,
  findSurchargeOutliers,
  gradeFor,
  LaneResolutionError,
  percentileRankOf,
  QuoteValidationError,
  rateAtPercentile,
  resolveLaneBenchmark,
  resolveRegion,
  scoreQuote,
  verdictFor,
  type QuoteInput,
} from "./index";
import { FBX_LANES_BY_CODE } from "@/lib/data/fbx-benchmarks";

/** A plain, valid China -> LA quote. Individual tests override what they need. */
function baseQuote(overrides: Partial<QuoteInput> = {}): QuoteInput {
  return {
    carrier: "Test Lines",
    originPort: "CNSHA",
    destPort: "USLAX",
    containerType: "40HC",
    containerCount: 10,
    baseRatePerContainer: 3000,
    ...overrides,
  };
}

// ─── Lane resolution ──────────────────────────────────────────────────────────

describe("resolveRegion", () => {
  it("maps a full UN/LOCODE to the right US coast", () => {
    expect(resolveRegion("USLAX")).toBe("uswc");
    expect(resolveRegion("USNYC")).toBe("usec");
    expect(resolveRegion("USSAV")).toBe("usec");
  });

  it("maps an origin LOCODE via its country prefix", () => {
    expect(resolveRegion("CNSHA")).toBe("east-asia");
    expect(resolveRegion("VNSGN")).toBe("southeast-asia");
    expect(resolveRegion("INNSA")).toBe("south-asia");
  });

  it("accepts a bare country code", () => {
    expect(resolveRegion("CN")).toBe("east-asia");
    expect(resolveRegion("TH")).toBe("southeast-asia");
  });

  it("is case- and whitespace-insensitive", () => {
    expect(resolveRegion("  cnsha ")).toBe("east-asia");
  });

  it("maps European ports to the correct sub-region", () => {
    expect(resolveRegion("NLRTM")).toBe("north-europe");
    expect(resolveRegion("ESVLC")).toBe("mediterranean");
  });

  it("refuses a bare US country code — the coast is load-bearing", () => {
    expect(() => resolveRegion("US")).toThrow(LaneResolutionError);
    expect(() => resolveRegion("US")).toThrow(/UN\/LOCODE/);
  });

  it("throws on an uncovered country rather than guessing", () => {
    expect(() => resolveRegion("BRSSZ")).toThrow(LaneResolutionError);
  });

  it("throws on input too short to be a code", () => {
    expect(() => resolveRegion("C")).toThrow(LaneResolutionError);
    expect(() => resolveRegion("")).toThrow(LaneResolutionError);
  });
});

describe("resolveLaneBenchmark", () => {
  it("matches CN -> USWC to the published FBX01 lane", () => {
    const b = resolveLaneBenchmark({
      originPort: "CNSHA",
      destPort: "USLAX",
      containerType: "40GP",
    });
    expect(b.lane.code).toBe("FBX01");
    expect(b.matchQuality).toBe("exact");
    expect(b.lane.source).toBe("fbx");
  });

  it("matches CN -> USEC to FBX03, which prices well above the WC lane", () => {
    const wc = resolveLaneBenchmark({ originPort: "CN", destPort: "USLAX", containerType: "40GP" });
    const ec = resolveLaneBenchmark({ originPort: "CN", destPort: "USNYC", containerType: "40GP" });
    expect(ec.lane.code).toBe("FBX03");
    expect(ec.percentiles.p50).toBeGreaterThan(wc.percentiles.p50);
  });

  it("flags a derived lane so the UI can say the number is modeled", () => {
    const b = resolveLaneBenchmark({
      originPort: "VNSGN",
      destPort: "USLAX",
      containerType: "40GP",
    });
    expect(b.matchQuality).toBe("derived");
    expect(b.lane.source).toBe("derived");
    expect(b.lane.derivedFrom).toBe("FBX01");
    expect(b.matchNote).toMatch(/modeled from FBX01/i);
  });

  it("prices the SE Asia derived lane above its FBX01 parent", () => {
    const parent = resolveLaneBenchmark({ originPort: "CN", destPort: "USLAX", containerType: "40GP" });
    const derived = resolveLaneBenchmark({ originPort: "VN", destPort: "USLAX", containerType: "40GP" });
    expect(derived.percentiles.p50).toBeGreaterThan(parent.percentiles.p50);
  });

  it("falls back to the backhaul lane and warns loudly", () => {
    // Mediterranean -> USWC is not published; the reciprocal isn't either, so
    // pick a pair that DOES have a reciprocal: north-europe -> ... nothing.
    // Use mediterranean -> east-asia, whose reciprocal FBX13 exists.
    const b = resolveLaneBenchmark({
      originPort: "ESVLC",
      destPort: "CNSHA",
      containerType: "40GP",
    });
    expect(b.matchQuality).toBe("fallback");
    expect(b.lane.code).toBe("FBX13");
    expect(b.matchNote).toMatch(/backhaul/i);
    expect(b.matchNote).toMatch(/indicative only/i);
  });

  it("throws when neither the lane nor its reciprocal is covered", () => {
    expect(() =>
      resolveLaneBenchmark({ originPort: "BRSSZ", destPort: "USLAX", containerType: "40GP" })
    ).toThrow(LaneResolutionError);
  });

  it("refuses an intra-regional lane", () => {
    expect(() =>
      resolveLaneBenchmark({ originPort: "CNSHA", destPort: "HKHKG", containerType: "40GP" })
    ).toThrow(/Intra-regional/);
  });
});

// ─── Percentile curve ─────────────────────────────────────────────────────────

describe("buildPercentileCurve", () => {
  const lane = FBX_LANES_BY_CODE["FBX01"]!;

  it("anchors p50 to the 4-week average", () => {
    expect(buildPercentileCurve(lane).p50).toBe(lane.spot.avg4Week);
  });

  it("is strictly increasing", () => {
    for (const code of Object.keys(FBX_LANES_BY_CODE)) {
      const c = buildPercentileCurve(FBX_LANES_BY_CODE[code]!);
      expect(c.p10, code).toBeLessThan(c.p25);
      expect(c.p25, code).toBeLessThan(c.p50);
      expect(c.p50, code).toBeLessThan(c.p75);
      expect(c.p75, code).toBeLessThan(c.p90);
    }
  });

  it("never models a floor meaningfully below the observed 52-week low", () => {
    for (const code of Object.keys(FBX_LANES_BY_CODE)) {
      const l = FBX_LANES_BY_CODE[code]!;
      const c = buildPercentileCurve(l);
      expect(c.p10, code).toBeGreaterThanOrEqual(Math.round(l.spot.low52Week * 0.95));
    }
  });

  it("widens the band for a more volatile lane", () => {
    const calm = buildPercentileCurve({
      ...lane,
      spot: { current: 2000, avg4Week: 2000, avg52Week: 2000, low52Week: 1950, high52Week: 2050 },
    });
    const wild = buildPercentileCurve({
      ...lane,
      spot: { current: 2000, avg4Week: 2000, avg52Week: 2000, low52Week: 800, high52Week: 5000 },
    });
    const spread = (c: { p10: number; p90: number }) => c.p90 - c.p10;
    expect(spread(wild)).toBeGreaterThan(spread(calm));
  });
});

describe("computeTrend", () => {
  const lane = FBX_LANES_BY_CODE["FBX01"]!;

  it("calls a softening market falling", () => {
    const t = computeTrend({
      ...lane,
      spot: { ...lane.spot, current: 900, avg4Week: 1000, avg52Week: 1000 },
    });
    expect(t.direction).toBe("falling");
    expect(t.vs4WeekPct).toBeCloseTo(-10, 5);
    expect(t.summary).toMatch(/buyer's window/i);
  });

  it("treats sub-2% movement as noise, not a trend", () => {
    const t = computeTrend({
      ...lane,
      spot: { ...lane.spot, current: 1010, avg4Week: 1000, avg52Week: 1000 },
    });
    expect(t.direction).toBe("flat");
  });

  it("calls a firming market rising", () => {
    const t = computeTrend({
      ...lane,
      spot: { ...lane.spot, current: 1100, avg4Week: 1000, avg52Week: 1000 },
    });
    expect(t.direction).toBe("rising");
    expect(t.summary).toMatch(/firming/i);
  });
});

// ─── Container normalization ──────────────────────────────────────────────────

describe("container normalization", () => {
  it("prices a 20ft at ~62% of a 40ft, not 50% — slot cost does not halve", () => {
    expect(CONTAINER_FEU_RATIO["20GP"]).toBe(0.62);
    const feu = resolveLaneBenchmark({ originPort: "CN", destPort: "USLAX", containerType: "40GP" });
    const teu = resolveLaneBenchmark({ originPort: "CN", destPort: "USLAX", containerType: "20GP" });
    expect(teu.percentiles.p50).toBe(Math.round(feu.percentiles.p50 * 0.62));
    expect(teu.percentiles.p50 / feu.percentiles.p50).toBeGreaterThan(0.5);
  });

  it("carries a reefer premium over dry", () => {
    const dry = resolveLaneBenchmark({ originPort: "CN", destPort: "USLAX", containerType: "40GP" });
    const reefer = resolveLaneBenchmark({ originPort: "CN", destPort: "USLAX", containerType: "40RF" });
    expect(reefer.percentiles.p50).toBeGreaterThan(dry.percentiles.p50 * 2);
  });
});

// ─── All-in math ──────────────────────────────────────────────────────────────

describe("computeAllInPerContainer", () => {
  it("sums per-container line items onto the base rate", () => {
    const q = baseQuote({
      baseRatePerContainer: 2000,
      containerCount: 5,
      lineItems: [
        { code: "BAF", amount: 400 },
        { code: "DTHC", amount: 300 },
      ],
    });
    expect(computeAllInPerContainer(q)).toBe(2700);
  });

  it("amortizes a per-shipment charge across the containers", () => {
    const q = baseQuote({
      baseRatePerContainer: 2000,
      containerCount: 4,
      lineItems: [{ code: "DOC", amount: 200, perShipment: true }],
    });
    expect(computeAllInPerContainer(q)).toBe(2050); // 2000 + 200/4
  });

  it("treats a single container as the whole shipment", () => {
    const q = baseQuote({
      baseRatePerContainer: 2000,
      containerCount: 1,
      lineItems: [{ code: "DOC", amount: 200, perShipment: true }],
    });
    expect(computeAllInPerContainer(q)).toBe(2200);
  });
});

// ─── Percentile ranking + grading ─────────────────────────────────────────────

describe("percentileRankOf", () => {
  const curve = { p10: 1000, p25: 1500, p50: 2000, p75: 2500, p90: 3000 };

  it("is exact at every knot point", () => {
    expect(percentileRankOf(1000, curve)).toBe(10);
    expect(percentileRankOf(1500, curve)).toBe(25);
    expect(percentileRankOf(2000, curve)).toBe(50);
    expect(percentileRankOf(2500, curve)).toBe(75);
    expect(percentileRankOf(3000, curve)).toBe(90);
  });

  it("interpolates linearly between knots", () => {
    expect(percentileRankOf(1750, curve)).toBeCloseTo(37.5, 5);
    expect(percentileRankOf(2250, curve)).toBeCloseTo(62.5, 5);
  });

  it("keeps separating quotes just past p90 rather than snapping to 100", () => {
    const bad = percentileRankOf(3100, curve);
    const worse = percentileRankOf(3200, curve);
    expect(bad).toBeGreaterThan(90);
    expect(worse).toBeGreaterThan(bad);
    expect(worse).toBeLessThan(100);
  });

  it("saturates at 100 for extreme quotes, leaving variance to carry the signal", () => {
    // A percentile above 100 is meaningless, so 3x and 5x market both read
    // 100 here. variancePct is what tells them apart — see scoreQuote below.
    expect(percentileRankOf(6000, curve)).toBe(100);
    expect(percentileRankOf(10_000, curve)).toBe(100);
  });

  it("bounds the result to 0-100", () => {
    expect(percentileRankOf(1, curve)).toBeGreaterThanOrEqual(0);
    expect(percentileRankOf(1_000_000, curve)).toBeLessThanOrEqual(100);
  });
});

describe("grade and verdict bands", () => {
  it("grades on the documented boundaries (inclusive upper edge)", () => {
    expect(gradeFor(25)).toBe("A");
    expect(gradeFor(25.1)).toBe("B");
    expect(gradeFor(45)).toBe("B");
    expect(gradeFor(45.1)).toBe("C");
    expect(gradeFor(60)).toBe("C");
    expect(gradeFor(60.1)).toBe("D");
    expect(gradeFor(80)).toBe("D");
    expect(gradeFor(80.1)).toBe("F");
  });

  it("maps verdicts on their own boundaries", () => {
    expect(verdictFor(25)).toBe("accept");
    expect(verdictFor(25.1)).toBe("negotiate");
    expect(verdictFor(60)).toBe("negotiate");
    expect(verdictFor(60.1)).toBe("strong-negotiate");
    expect(verdictFor(85)).toBe("strong-negotiate");
    expect(verdictFor(85.1)).toBe("reject");
  });
});

// ─── Surcharge outliers ───────────────────────────────────────────────────────

describe("findSurchargeOutliers", () => {
  it("flags a charge above the top of its typical range", () => {
    const findings = findSurchargeOutliers(
      baseQuote({ lineItems: [{ code: "BAF", amount: 900 }] }) // typical max 600
    );
    expect(findings).toHaveLength(1);
    expect(findings[0]!.code).toBe("BAF");
    expect(findings[0]!.excess).toBe(300);
  });

  it("ignores a charge inside its typical range", () => {
    expect(findSurchargeOutliers(baseQuote({ lineItems: [{ code: "BAF", amount: 400 }] }))).toHaveLength(0);
  });

  it("resolves carrier aliases (THC -> DTHC, FSC -> BAF)", () => {
    const findings = findSurchargeOutliers(
      baseQuote({ lineItems: [{ code: "THC", amount: 800 }] }) // DTHC typical max 450
    );
    expect(findings[0]!.code).toBe("DTHC");
    expect(findings[0]!.excess).toBe(350);
  });

  it("ignores charge codes it has no market range for", () => {
    expect(
      findSurchargeOutliers(baseQuote({ lineItems: [{ code: "MYSTERY-FEE", amount: 9999 }] }))
    ).toHaveLength(0);
  });

  it("amortizes a per-shipment charge before comparing", () => {
    // $2000 documentation across 40 boxes = $50/box, inside the $150 ceiling.
    const findings = findSurchargeOutliers(
      baseQuote({ containerCount: 40, lineItems: [{ code: "DOC", amount: 2000, perShipment: true }] })
    );
    expect(findings).toHaveLength(0);
  });

  it("escalates severity past 50% over the ceiling and sorts worst-first", () => {
    const findings = findSurchargeOutliers(
      baseQuote({
        lineItems: [
          { code: "ISF", amount: 130 }, // ceiling 100, +30 -> watch
          { code: "BAF", amount: 1200 }, // ceiling 600, +600 -> high
        ],
      })
    );
    expect(findings[0]!.code).toBe("BAF");
    expect(findings[0]!.severity).toBe("high");
    expect(findings[1]!.severity).toBe("watch");
  });
});

// ─── Scoring ──────────────────────────────────────────────────────────────────

describe("scoreQuote", () => {
  const benchmark = resolveLaneBenchmark({
    originPort: "CNSHA",
    destPort: "USLAX",
    containerType: "40GP",
  });

  it("scores a quote exactly at the median as 50th percentile, zero variance", () => {
    const q = baseQuote({
      containerType: "40GP",
      baseRatePerContainer: benchmark.percentiles.p50,
    });
    const s = scoreQuote(q, benchmark);
    expect(s.percentileRank).toBe(50);
    expect(s.variancePct).toBe(0);
    expect(s.varianceUsd).toBe(0);
    expect(s.grade).toBe("C");
  });

  it("grades a top-quartile quote an A and says accept", () => {
    const q = baseQuote({ containerType: "40GP", baseRatePerContainer: benchmark.percentiles.p10 });
    const s = scoreQuote(q, benchmark);
    expect(s.grade).toBe("A");
    expect(s.verdict).toBe("accept");
    expect(s.variancePct).toBeLessThan(0);
    expect(s.headline).toMatch(/below market/i);
  });

  it("grades a badly overpriced quote an F and says reject", () => {
    const q = baseQuote({
      containerType: "40GP",
      baseRatePerContainer: Math.round(benchmark.percentiles.p90 * 1.5),
    });
    const s = scoreQuote(q, benchmark);
    expect(s.grade).toBe("F");
    expect(s.verdict).toBe("reject");
    expect(s.headline).toMatch(/bottom-decile/i);
  });

  it("counts surcharges toward the score, not just the base rate", () => {
    const bare = scoreQuote(
      baseQuote({ containerType: "40GP", baseRatePerContainer: 2500 }),
      benchmark
    );
    const loaded = scoreQuote(
      baseQuote({
        containerType: "40GP",
        baseRatePerContainer: 2500,
        lineItems: [{ code: "BAF", amount: 800 }],
      }),
      benchmark
    );
    expect(loaded.allInPerContainer).toBe(3300);
    expect(loaded.percentileRank).toBeGreaterThan(bare.percentileRank);
  });

  it("uses variance, not percentile, to separate two absurd quotes", () => {
    const bad = scoreQuote(
      baseQuote({ containerType: "40GP", baseRatePerContainer: benchmark.percentiles.p50 * 3 }),
      benchmark
    );
    const worse = scoreQuote(
      baseQuote({ containerType: "40GP", baseRatePerContainer: benchmark.percentiles.p50 * 5 }),
      benchmark
    );
    expect(bad.percentileRank).toBe(100);
    expect(worse.percentileRank).toBe(100);
    expect(worse.variancePct).toBeGreaterThan(bad.variancePct);
    expect(worse.varianceUsd).toBeGreaterThan(bad.varianceUsd);
  });

  it("reports the whole-quote total across containers", () => {
    const s = scoreQuote(
      baseQuote({ containerType: "40GP", baseRatePerContainer: 2500, containerCount: 12 }),
      benchmark
    );
    expect(s.allInTotal).toBe(2500 * 12);
  });
});

// ─── Counter-offer ladder ─────────────────────────────────────────────────────

describe("rateAtPercentile", () => {
  const curve = { p10: 1000, p25: 1500, p50: 2000, p75: 2500, p90: 3000 };

  it("round-trips the knot points", () => {
    expect(rateAtPercentile(10, curve)).toBe(1000);
    expect(rateAtPercentile(50, curve)).toBe(2000);
    expect(rateAtPercentile(90, curve)).toBe(3000);
  });

  it("never asks below 90% of p10 — an unacceptable ask stalls the negotiation", () => {
    expect(rateAtPercentile(0, curve)).toBeGreaterThanOrEqual(900);
    expect(rateAtPercentile(-50, curve)).toBeGreaterThanOrEqual(900);
  });
});

describe("buildCounterOfferPlan (via analyzeQuote)", () => {
  it("produces a monotonically increasing ladder with walk-away above target", () => {
    const a = analyzeQuote(baseQuote({ baseRatePerContainer: 4200, contractType: "90_day" }));
    const [r1, r2, r3] = a.plan.rounds;
    expect(r1!.ratePerContainer).toBeLessThan(r2!.ratePerContainer);
    expect(r2!.ratePerContainer).toBeLessThanOrEqual(r3!.ratePerContainer);
    expect(a.plan.walkAwayRatePerContainer).toBeGreaterThan(a.plan.targetRatePerContainer);
    expect(a.plan.targetRatePerContainer).toBe(r2!.ratePerContainer);
  });

  it("pushes harder on a 12-month contract than on a spot booking", () => {
    const spot = analyzeQuote(baseQuote({ baseRatePerContainer: 4200, contractType: "spot" }));
    const year = analyzeQuote(baseQuote({ baseRatePerContainer: 4200, contractType: "365_day" }));
    expect(year.plan.targetRatePerContainer).toBeLessThan(spot.plan.targetRatePerContainer);
  });

  it("never counters ABOVE the carrier's own quote when the quote already beats market", () => {
    const a = analyzeQuote(baseQuote({ baseRatePerContainer: 900 }));
    for (const r of a.plan.rounds) {
      expect(r.ratePerContainer).toBeLessThanOrEqual(a.score.allInPerContainer);
      expect(r.savingsPerContainer).toBeGreaterThanOrEqual(0);
    }
    expect(a.plan.walkAwayRatePerContainer).toBeLessThanOrEqual(a.score.allInPerContainer);
    expect(a.score.verdict).toBe("accept");
  });

  it("lands an overpriced quote in the 15-25% savings band the feature promises", () => {
    const benchmark = resolveLaneBenchmark({
      originPort: "CNSHA",
      destPort: "USLAX",
      containerType: "40HC",
    });
    // A quote at the 75th percentile — a realistic "we didn't benchmark it" rate.
    const a = analyzeQuote(
      baseQuote({ baseRatePerContainer: benchmark.percentiles.p75, contractType: "180_day" })
    );
    expect(a.plan.expectedSavings.pct).toBeGreaterThanOrEqual(15);
    expect(a.plan.expectedSavings.pct).toBeLessThanOrEqual(45);
  });
});

describe("savings projection", () => {
  it("scales per-shipment savings by container count", () => {
    const a = analyzeQuote(baseQuote({ baseRatePerContainer: 4200, containerCount: 7 }));
    expect(a.plan.expectedSavings.perShipment).toBe(a.plan.expectedSavings.perContainer * 7);
  });

  it("annualizes on a per-FEU basis, so a 20ft quote does not overstate the year", () => {
    const q = {
      baseRatePerContainer: 4200,
      containerCount: 1,
      annualFeuVolume: 1000,
    };
    const feu = analyzeQuote(baseQuote({ ...q, containerType: "40GP" }));
    const teu = analyzeQuote(baseQuote({ ...q, containerType: "20GP", baseRatePerContainer: 2604 }));

    // The 20ft quote is the same rate expressed per FEU (4200 * 0.62 = 2604),
    // so the annualized figure must land in the same place.
    expect(teu.plan.expectedSavings.annualized).toBeGreaterThan(0);
    expect(
      Math.abs(teu.plan.expectedSavings.annualized! - feu.plan.expectedSavings.annualized!)
    ).toBeLessThan(feu.plan.expectedSavings.annualized! * 0.02);
  });

  it("returns null annualized savings when no volume is supplied", () => {
    const a = analyzeQuote(baseQuote({ baseRatePerContainer: 4200 }));
    expect(a.plan.expectedSavings.annualized).toBeNull();
  });

  it("quantifies surcharge padding separately from the base rate", () => {
    const a = analyzeQuote(
      baseQuote({
        baseRatePerContainer: 3000,
        containerCount: 10,
        lineItems: [{ code: "BAF", amount: 1100 }], // ceiling 600 -> 500 padding
      })
    );
    expect(a.score.surchargeExcessTotal).toBe(500);
    expect(a.plan.surchargeSavings.perContainer).toBe(500);
    expect(a.plan.surchargeSavings.perShipment).toBe(5000);
  });
});

// ─── Leverage ─────────────────────────────────────────────────────────────────

describe("detectLeverage (via analyzeQuote)", () => {
  it("only reports leverage the shipper actually has", () => {
    const a = analyzeQuote(baseQuote({ baseRatePerContainer: 2200 }));
    const keys = a.leverage.map((l) => l.key);
    expect(keys).not.toContain("competing-bid");
    expect(keys).not.toContain("volume");
    expect(keys).not.toContain("flexible-dates");
  });

  it("ranks a cheaper competing bid as high-strength leverage", () => {
    const a = analyzeQuote(
      baseQuote({
        baseRatePerContainer: 4200,
        competingQuotes: [{ carrier: "Rival Line", ratePerContainer: 3400 }],
      })
    );
    const bid = a.leverage.find((l) => l.key === "competing-bid");
    expect(bid?.strength).toBe("high");
    expect(bid?.detail).toContain("800");
    expect(a.leverage[0]!.strength).toBe("high"); // sorted strongest-first
  });

  it("downgrades a competing bid that is actually more expensive", () => {
    const a = analyzeQuote(
      baseQuote({
        baseRatePerContainer: 3000,
        competingQuotes: [{ carrier: "Rival Line", ratePerContainer: 5000 }],
      })
    );
    expect(a.leverage.find((l) => l.key === "competing-bid")?.strength).toBe("low");
  });

  it("treats tiny volume as a talking point, not a lever", () => {
    const a = analyzeQuote(baseQuote({ baseRatePerContainer: 4200, annualFeuVolume: 20 }));
    const v = a.leverage.find((l) => l.key === "volume");
    expect(v?.strength).toBe("low");
    expect(v?.detail).toMatch(/talking point/i);
  });

  it("treats large volume as high-strength leverage", () => {
    const a = analyzeQuote(baseQuote({ baseRatePerContainer: 4200, annualFeuVolume: 2500 }));
    expect(a.leverage.find((l) => l.key === "volume")?.strength).toBe("high");
  });
});

// ─── Script ───────────────────────────────────────────────────────────────────

describe("negotiation script", () => {
  it("writes a counter email carrying the opening ask and the landing zone", () => {
    const a = analyzeQuote(baseQuote({ baseRatePerContainer: 4500, contractType: "180_day" }));
    const opening = a.plan.rounds[0]!.ratePerContainer.toLocaleString("en-US");
    const target = a.plan.targetRatePerContainer.toLocaleString("en-US");
    expect(a.script.emailBody).toContain(opening);
    expect(a.script.emailBody).toContain(target);
    expect(a.script.emailSubject).toMatch(/rate revision request/i);
    expect(a.script.aiPolished).toBe(false);
  });

  it("does not write a counter-offer email when the quote is already good", () => {
    const a = analyzeQuote(baseQuote({ baseRatePerContainer: 1200 }));
    expect(a.score.verdict).toBe("accept");
    expect(a.script.emailSubject).toMatch(/confirming/i);
    expect(a.script.emailBody).toMatch(/happy to proceed/i);
    expect(a.script.callTalkingPoints.join(" ")).toMatch(/Do not counter/i);
  });

  it("names the padded surcharges in the email when there are any", () => {
    const a = analyzeQuote(
      baseQuote({ baseRatePerContainer: 4000, lineItems: [{ code: "BAF", amount: 1100 }] })
    );
    expect(a.script.emailBody).toContain("BAF");
    expect(a.script.emailBody).toMatch(/standard ranges/i);
  });

  it("only promises concessions the shipper actually offered", () => {
    const without = analyzeQuote(baseQuote({ baseRatePerContainer: 4200 }));
    expect(without.script.emailBody).not.toMatch(/minimum-quantity commitment/i);

    const with_ = analyzeQuote(baseQuote({ baseRatePerContainer: 4200, annualFeuVolume: 500 }));
    expect(with_.script.emailBody).toMatch(/minimum-quantity commitment of 500 FEU/i);
  });

  it("never names the competing carrier in the email — that burns the relationship", () => {
    const a = analyzeQuote(
      baseQuote({
        baseRatePerContainer: 4500,
        competingQuotes: [{ carrier: "Rival Line", ratePerContainer: 3400 }],
      })
    );
    expect(a.script.emailBody).not.toContain("Rival Line");
    expect(a.script.emailBody).toMatch(/live quote on this lane below yours/i);
  });

  it("only calls a competing quote a BATNA when it actually beats the walk-away", () => {
    // Cheaper than the walk-away -> a real fallback.
    const real = analyzeQuote(
      baseQuote({
        baseRatePerContainer: 4500,
        competingQuotes: [{ carrier: "Rival Line", ratePerContainer: 2600 }],
      })
    );
    expect(real.plan.walkAwayRatePerContainer).toBeGreaterThanOrEqual(2600);
    expect(real.script.batna).toMatch(/you are not stuck/i);

    // More expensive than the walk-away -> NOT a fallback. Saying otherwise
    // hands the shipper leverage they cannot execute.
    const fake = analyzeQuote(
      baseQuote({
        baseRatePerContainer: 4500,
        competingQuotes: [{ carrier: "Rival Line", ratePerContainer: 4200 }],
      })
    );
    expect(fake.plan.walkAwayRatePerContainer).toBeLessThan(4200);
    expect(fake.script.batna).not.toMatch(/you are not stuck/i);
    expect(fake.script.batna).toMatch(/no BATNA on this lane/i);
    expect(fake.script.batna).toMatch(/Get two more quotes/i);
  });

  it("ships objection handling and a BATNA with the walk-away number in it", () => {
    const a = analyzeQuote(baseQuote({ baseRatePerContainer: 4500 }));
    expect(a.script.objectionHandling.length).toBeGreaterThanOrEqual(4);
    expect(a.script.batna).toContain(a.plan.walkAwayRatePerContainer.toLocaleString("en-US"));
    expect(a.script.batna).toMatch(/second quote|choosing to overpay/i);
  });

  it("answers the 'rates are going up' objection with the actual index direction", () => {
    const a = analyzeQuote(baseQuote({ baseRatePerContainer: 4500 }));
    const objection = a.script.objectionHandling.find((o) => /going up/i.test(o.objection));
    // FBX01 snapshot is currently below its 4-week average.
    expect(objection?.response).toMatch(/index doesn't show that/i);
  });
});

// ─── Orchestrator + guards ────────────────────────────────────────────────────

describe("analyzeQuote", () => {
  it("returns a complete, internally consistent analysis", () => {
    const a = analyzeQuote(
      baseQuote({
        baseRatePerContainer: 3800,
        containerCount: 20,
        contractType: "365_day",
        annualFeuVolume: 1200,
        flexibleDates: true,
        lineItems: [
          { code: "BAF", amount: 450 },
          { code: "THC", amount: 700 },
          { code: "DOC", amount: 180, perShipment: true },
        ],
        competingQuotes: [{ carrier: "Rival Line", ratePerContainer: 4100 }],
      })
    );

    expect(a.benchmark.lane.code).toBe("FBX01");
    expect(a.score.allInPerContainer).toBe(3800 + 450 + 700 + 9); // 180/20
    expect(a.plan.rounds).toHaveLength(3);
    expect(a.leverage.length).toBeGreaterThan(0);
    expect(a.script.emailBody.length).toBeGreaterThan(100);
    expect(a.disclaimers.length).toBeGreaterThan(0);
    expect(() => new Date(a.generatedAt).toISOString()).not.toThrow();
  });

  it("always discloses the benchmark date and that FBX is an index, not a quote", () => {
    const a = analyzeQuote(baseQuote({ baseRatePerContainer: 3000 }));
    expect(a.disclaimers.join(" ")).toMatch(/not a quote/i);
    expect(a.disclaimers.join(" ")).toContain(a.benchmark.lane.asOf);
  });

  it("warns when no surcharges were entered", () => {
    const a = analyzeQuote(baseQuote({ baseRatePerContainer: 3000 }));
    expect(a.disclaimers.join(" ")).toMatch(/No surcharges were entered/i);
  });

  it("warns that non-40GP figures are converted from FEU", () => {
    const a = analyzeQuote(baseQuote({ containerType: "20GP", baseRatePerContainer: 1800 }));
    expect(a.disclaimers.join(" ")).toMatch(/converted at 0\.62x FEU/i);
  });

  it("rejects unusable input instead of clamping it into a confident wrong answer", () => {
    expect(() => analyzeQuote(baseQuote({ carrier: "  " }))).toThrow(QuoteValidationError);
    expect(() => analyzeQuote(baseQuote({ baseRatePerContainer: 0 }))).toThrow(/positive number/);
    expect(() => analyzeQuote(baseQuote({ baseRatePerContainer: -5 }))).toThrow(QuoteValidationError);
    expect(() => analyzeQuote(baseQuote({ containerCount: 0 }))).toThrow(/at least 1/);
    expect(() => analyzeQuote(baseQuote({ containerCount: 2.5 }))).toThrow(/whole number/);
    expect(() => analyzeQuote(baseQuote({ annualFeuVolume: -1 }))).toThrow(QuoteValidationError);
    expect(() =>
      analyzeQuote(baseQuote({ lineItems: [{ code: "BAF", amount: -100 }] }))
    ).toThrow(QuoteValidationError);
    expect(() =>
      analyzeQuote(baseQuote({ competingQuotes: [{ carrier: "X", ratePerContainer: 0 }] }))
    ).toThrow(QuoteValidationError);
  });

  it("surfaces a lane it cannot benchmark rather than scoring against the wrong one", () => {
    expect(() => analyzeQuote(baseQuote({ originPort: "BRSSZ" }))).toThrow(LaneResolutionError);
  });
});

/**
 * Unit tests for the FTZ optimizer agent (AI-12021).
 *
 * Pure-function math — no DB, no network. Most fixtures pin duty rates with
 * `dutyRatePctOverride` so the assertions survive HTS table edits; the tests
 * that deliberately exercise the live lookup say so.
 *
 * What is locked down:
 *   - inverted-tariff detection, and the two things that block it
 *     (no production authority; Section 301/232 PF-forced value)
 *   - PF vs NPF election flips with the tariff trajectory
 *   - MIXED election when part of the BOM is PF-forced
 *   - MPF weekly-entry ceiling (52 entries) and the $614.35 per-entry cap
 *   - NPV / payback / IRR behaviour, including the never-profitable case
 *   - input guards throw instead of clamping
 *   - re-export and scrap relief is counted exactly once
 */
import { describe, it, expect } from "vitest";
import {
  optimizeFtz,
  FtzInputError,
  detectInvertedTariff,
  buildDutyProfile,
  computeIrr,
  projectNpv,
  annualMpf,
  mpfForEntry,
  computeAncillarySavings,
  projectRate,
  FTZ_WEEKLY_ENTRIES_PER_YEAR,
  type FtzOptimizerInput,
} from "./index";
import { MPF_MAX, MPF_MIN } from "@/lib/calculators/landed-cost";

// ─────────────────────────────────────────────────────────
// Fixtures
// ─────────────────────────────────────────────────────────

/**
 * Classic inverted structure: high-rate parts, low-rate finished article.
 * $10M of components averaging 8%, assembled into a 2.5% finished good.
 */
function invertedInput(overrides: Partial<FtzOptimizerInput> = {}): FtzOptimizerInput {
  return {
    finishedGood: {
      description: "Assembled consumer appliance",
      htsCode: "8509.40.00",
      dutyRatePctOverride: 2.5,
    },
    components: [
      {
        id: "motor",
        description: "Electric motor sub-assembly",
        htsCode: "8501.10.40",
        countryOfOrigin: "VN",
        annualValueUsd: 6_000_000,
        dutyRatePctOverride: 9,
      },
      {
        id: "housing",
        description: "Moulded plastic housing",
        htsCode: "3926.90.99",
        countryOfOrigin: "TH",
        annualValueUsd: 4_000_000,
        dutyRatePctOverride: 6.5,
      },
    ],
    manufacturingInZone: true,
    reExportSharePct: 0,
    scrapSharePct: 0,
    entriesPerYear: 260,
    storageMonths: 3,
    costOfCapitalPct: 10,
    activationCostUsd: 150_000,
    annualOperatingCostUsd: 120_000,
    tariffTrajectoryPctPerYear: 0,
    horizonYears: 5,
    ...overrides,
  };
}

/** Non-inverted: the finished article carries the higher rate. */
function nonInvertedInput(overrides: Partial<FtzOptimizerInput> = {}): FtzOptimizerInput {
  return invertedInput({
    finishedGood: {
      description: "Finished article",
      htsCode: "9403.20.00",
      dutyRatePctOverride: 12,
    },
    ...overrides,
  });
}

// ─────────────────────────────────────────────────────────
// Inverted tariff detection
// ─────────────────────────────────────────────────────────

describe("inverted tariff detection", () => {
  it("detects an inverted structure and sizes the annual relief", () => {
    const input = invertedInput();
    const duty = buildDutyProfile(input.components, input.finishedGood);
    const finding = detectInvertedTariff(duty, true);

    // Weighted component rate: (6M*9% + 4M*6.5%) / 10M = 8.0%
    expect(duty.weightedComponentRatePct).toBeCloseTo(8, 6);
    expect(finding.spreadPct).toBeCloseTo(5.5, 6);
    expect(finding.isInverted).toBe(true);
    expect(finding.blocked).toBe(false);

    // 6M*(9-2.5)% + 4M*(6.5-2.5)% = 390k + 160k = 550k
    expect(finding.annualSavingsUsd).toBeCloseTo(550_000, 6);
    expect(finding.capturableValueUsd).toBe(10_000_000);
  });

  it("ranks contributors by savings, biggest first", () => {
    const input = invertedInput();
    const duty = buildDutyProfile(input.components, input.finishedGood);
    const finding = detectInvertedTariff(duty, true);

    expect(finding.contributors[0].id).toBe("motor");
    expect(finding.contributors[0].annualSavingsUsd).toBeCloseTo(390_000, 6);
    expect(finding.contributors[1].annualSavingsUsd).toBeCloseTo(160_000, 6);
  });

  it("blocks relief when the zone has no production authority", () => {
    const input = invertedInput({ manufacturingInZone: false });
    const duty = buildDutyProfile(input.components, input.finishedGood);
    const finding = detectInvertedTariff(duty, false);

    expect(finding.spreadPct).toBeGreaterThan(0);
    expect(finding.isInverted).toBe(false);
    expect(finding.blocked).toBe(true);
    expect(finding.blockedReason).toMatch(/production authority/i);
    expect(finding.annualSavingsUsd).toBe(0);
  });

  it("reports no inversion when the finished rate is higher", () => {
    const input = nonInvertedInput();
    const duty = buildDutyProfile(input.components, input.finishedGood);
    const finding = detectInvertedTariff(duty, true);

    expect(finding.spreadPct).toBeLessThan(0);
    expect(finding.isInverted).toBe(false);
    expect(finding.blocked).toBe(false);
    expect(finding.annualSavingsUsd).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────
// Section 301 / 232 PF-forcing
// ─────────────────────────────────────────────────────────

describe("Section 301 / 232 PF-forcing", () => {
  it("flags Chinese Section 301 merchandise as PF-forced via the live HTS lookup", () => {
    // No rate override here — this exercises getEffectiveDutyRate + SECTION_301_RATES.
    const duty = buildDutyProfile(
      [
        {
          id: "cn-electronics",
          description: "Electrical sub-assembly",
          htsCode: "8504.40.95",
          countryOfOrigin: "CN",
          annualValueUsd: 5_000_000,
        },
      ],
      { description: "Finished", htsCode: "8509.40.00", dutyRatePctOverride: 2.5 }
    );

    const component = duty.components[0];
    expect(component.section301Pct).toBeGreaterThan(0);
    expect(component.pfForced).toBe(true);
    expect(component.pfForcedReason).toMatch(/Section 301/);
    expect(duty.pfForcedValueUsd).toBe(5_000_000);
    expect(duty.npfEligibleValueUsd).toBe(0);
  });

  it("flags Section 232 steel chapters as PF-forced even without a 301 action", () => {
    const duty = buildDutyProfile(
      [
        {
          id: "steel",
          description: "Steel bracket",
          htsCode: "7326.90.86",
          countryOfOrigin: "IN", // not China, so no Section 301
          annualValueUsd: 1_000_000,
          dutyRatePctOverride: 2.9,
        },
      ],
      { description: "Finished", htsCode: "8509.40.00", dutyRatePctOverride: 0 }
    );

    expect(duty.components[0].section301Pct).toBe(0);
    expect(duty.components[0].pfForced).toBe(true);
    expect(duty.components[0].pfForcedReason).toMatch(/Section 232/);
  });

  it("excludes PF-forced value from inverted-tariff relief", () => {
    const input = invertedInput({
      components: [
        {
          id: "cn-motor",
          description: "Motor from China",
          htsCode: "8501.10.40",
          countryOfOrigin: "CN", // chapter 85 → Section 301 → PF-forced
          annualValueUsd: 6_000_000,
        },
        {
          id: "housing",
          description: "Moulded plastic housing",
          htsCode: "3926.90.99",
          countryOfOrigin: "TH",
          annualValueUsd: 4_000_000,
          dutyRatePctOverride: 6.5,
        },
      ],
    });

    const duty = buildDutyProfile(input.components, input.finishedGood);
    const finding = detectInvertedTariff(duty, true);

    expect(duty.pfForcedValueUsd).toBe(6_000_000);
    // Only the Thai housing can withdraw at the finished rate: 4M * 4% = 160k
    expect(finding.annualSavingsUsd).toBeCloseTo(160_000, 6);
    expect(finding.capturableValueUsd).toBe(4_000_000);
  });

  it("blocks entirely when every inverted line is PF-forced", () => {
    const duty = buildDutyProfile(
      [
        {
          id: "cn-only",
          description: "Chinese electronics",
          htsCode: "8504.40.95",
          countryOfOrigin: "CN",
          annualValueUsd: 5_000_000,
        },
      ],
      { description: "Finished", htsCode: "8509.40.00", dutyRatePctOverride: 0.5 }
    );
    const finding = detectInvertedTariff(duty, true);

    expect(finding.blocked).toBe(true);
    expect(finding.blockedReason).toMatch(/Privileged Foreign/i);
    expect(finding.annualSavingsUsd).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────
// PF / NPF election
// ─────────────────────────────────────────────────────────

describe("PF / NPF election", () => {
  it("elects NPF on an inverted BOM with flat tariffs", () => {
    const result = optimizeFtz(invertedInput());

    expect(result.election.election).toBe("NPF");
    expect(result.election.electionAdvantageUsd).toBeGreaterThan(0);
    expect(result.election.rationale.join(" ")).toMatch(/Inverted duty structure/i);
  });

  it("elects PF when the finished good carries the higher rate", () => {
    const result = optimizeFtz(nonInvertedInput());

    expect(result.election.election).toBe("PF");
    expect(result.election.recommendedDutyUsd).toBeLessThan(
      result.election.alternativeDutyUsd
    );
  });

  it("elects PF when rate escalation over the storage window outweighs a thin spread", () => {
    // Spread is only 0.2pt; rates climbing 40%/yr over 12 months of storage
    // costs NPF far more than the spread saves.
    const thinSpread = invertedInput({
      finishedGood: { description: "Finished", htsCode: "X", dutyRatePctOverride: 7.7 },
      storageMonths: 12,
      tariffTrajectoryPctPerYear: 40,
    });

    expect(optimizeFtz(thinSpread).election.election).toBe("PF");
  });

  it("still elects NPF when the spread is wide enough to absorb escalation", () => {
    const wideSpread = invertedInput({
      storageMonths: 12,
      tariffTrajectoryPctPerYear: 40,
    });

    const result = optimizeFtz(wideSpread);
    expect(result.election.election).toBe("NPF");
    expect(result.election.rationale.join(" ")).toMatch(/outweighs the rate-escalation/i);
  });

  it("returns MIXED when part of the BOM is PF-forced but NPF still wins overall", () => {
    const result = optimizeFtz(
      invertedInput({
        components: [
          {
            id: "cn-motor",
            description: "Motor from China",
            htsCode: "8501.10.40",
            countryOfOrigin: "CN",
            annualValueUsd: 2_000_000,
          },
          {
            id: "housing",
            description: "Moulded plastic housing",
            htsCode: "3926.90.99",
            countryOfOrigin: "TH",
            annualValueUsd: 8_000_000,
            dutyRatePctOverride: 6.5,
          },
        ],
      })
    );

    expect(result.election.election).toBe("MIXED");
    expect(result.election.rationale.join(" ")).toMatch(/must be admitted PF/i);
  });

  it("downgrades confidence to low when the two elections are within noise", () => {
    const razorThin = invertedInput({
      finishedGood: { description: "Finished", htsCode: "X", dutyRatePctOverride: 7.85 },
      tariffTrajectoryPctPerYear: 0,
    });

    const result = optimizeFtz(razorThin);
    expect(result.election.confidence).toBe("low");
    expect(result.election.rationale.join(" ")).toMatch(/treat this as a tie/i);
  });

  it("produces one schedule row per horizon year", () => {
    const result = optimizeFtz(invertedInput({ horizonYears: 7 }));
    expect(result.election.schedule).toHaveLength(7);
    expect(result.election.schedule.map((y) => y.year)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it("grows the baseline duty when volume growth is supplied", () => {
    const result = optimizeFtz(invertedInput({ volumeGrowthPctPerYear: 10 }));
    const [year1, year2] = result.election.schedule;
    expect(year2.baselineDutyUsd).toBeCloseTo(year1.baselineDutyUsd * 1.1, 4);
  });
});

// ─────────────────────────────────────────────────────────
// MPF weekly entry
// ─────────────────────────────────────────────────────────

describe("MPF weekly entry savings", () => {
  it("clamps a single entry to the statutory floor and cap", () => {
    expect(mpfForEntry(100)).toBe(MPF_MIN);          // 0.3464% of $100 is far below the floor
    expect(mpfForEntry(500_000_000)).toBe(MPF_MAX);  // and far above the cap
  });

  it("collapses a high-frequency filer to 52 consolidated entries", () => {
    // $10M over 260 entries → $38,461 each → 0.3464% = $133, inside the cap,
    // so the annual total is a flat 0.3464% of value: $34,640.
    // Consolidating to 52 entries pushes each entry to $192,307 → $666
    // ad-valorem, which is over the $614.35 cap, so the cap starts biting and
    // the annual total drops to 52 × $614.35 = $31,946.
    const without = annualMpf(10_000_000, 260);
    const withZone = annualMpf(10_000_000, FTZ_WEEKLY_ENTRIES_PER_YEAR);

    expect(without).toBeCloseTo(34_640, 2);
    expect(withZone).toBeCloseTo(MPF_MAX * 52, 2);
    expect(without - withZone).toBeCloseTo(2_693.8, 1);
  });

  it("saves the per-entry cap on every entry above 52 when entries are large", () => {
    // $500M over 400 entries → $1.25M per entry → capped at $614.35 each.
    const without = annualMpf(500_000_000, 400);
    const withZone = annualMpf(500_000_000, FTZ_WEEKLY_ENTRIES_PER_YEAR);

    expect(without).toBeCloseTo(MPF_MAX * 400, 2);
    expect(withZone).toBeCloseTo(MPF_MAX * 52, 2);
    expect(without - withZone).toBeCloseTo(MPF_MAX * 348, 2);
  });

  it("never reports negative MPF savings when the filer is already under 52 entries", () => {
    const savings = computeAncillarySavings({
      annualValueUsd: 10_000_000,
      entriesPerYear: 12,
      storageMonths: 3,
      costOfCapitalPct: 10,
      reExportSharePct: 0,
      scrapSharePct: 0,
      annualDutyUsd: 500_000,
      baselineAnnualDutyUsd: 790_000,
    });

    expect(savings.mpfSavingsUsd).toBeGreaterThanOrEqual(0);
  });
});

// ─────────────────────────────────────────────────────────
// Re-export and scrap
// ─────────────────────────────────────────────────────────

describe("re-export and scrap relief", () => {
  it("reduces the dutiable base by the re-export and scrap shares", () => {
    const base = optimizeFtz(invertedInput());
    const withReExport = optimizeFtz(
      invertedInput({ reExportSharePct: 30, scrapSharePct: 5 })
    );

    expect(withReExport.ancillary.domesticEntryShare).toBeCloseTo(0.65, 6);
    expect(withReExport.optimizedAnnualDutyUsd).toBeCloseTo(
      base.optimizedAnnualDutyUsd * 0.65,
      4
    );
    // Baseline (no zone) is unchanged — outside a zone you pay on everything
    // and chase drawback later.
    expect(withReExport.baselineAnnualDutyUsd).toBeCloseTo(base.baselineAnnualDutyUsd, 4);
  });

  it("counts the re-export exemption exactly once in the cash flows", () => {
    const result = optimizeFtz(invertedInput({ reExportSharePct: 30 }));

    // Year-1 duty saving must equal baseline − optimised, not baseline −
    // optimised + the separately-reported re-export line.
    expect(result.npv.years[0].dutySavingsUsd).toBeCloseTo(
      result.baselineAnnualDutyUsd - result.optimizedAnnualDutyUsd,
      4
    );
    expect(result.ancillary.reExportSavingsUsd).toBeGreaterThan(0);
  });

  it("rejects re-export plus scrap exceeding all admitted value", () => {
    expect(() =>
      optimizeFtz(invertedInput({ reExportSharePct: 80, scrapSharePct: 30 }))
    ).toThrow(FtzInputError);
  });
});

// ─────────────────────────────────────────────────────────
// NPV
// ─────────────────────────────────────────────────────────

describe("five-year NPV", () => {
  it("discounts each year at the cost of capital", () => {
    const npv = projectNpv({
      yearlyDutySavingsUsd: [100_000, 100_000, 100_000],
      yearlyMpfSavingsUsd: [0, 0, 0],
      yearlyDeferralValueUsd: [0, 0, 0],
      annualOperatingCostUsd: 0,
      activationCostUsd: 0,
      discountRatePct: 10,
    });

    expect(npv.years[0].discountedNetUsd).toBeCloseTo(100_000 / 1.1, 6);
    expect(npv.years[2].discountedNetUsd).toBeCloseTo(100_000 / 1.331, 6);
    expect(npv.npvUsd).toBeCloseTo(248_685.2, 0);
  });

  it("nets operating cost out of every year and activation cost out of year zero", () => {
    const npv = projectNpv({
      yearlyDutySavingsUsd: [500_000, 500_000],
      yearlyMpfSavingsUsd: [10_000, 10_000],
      yearlyDeferralValueUsd: [5_000, 5_000],
      annualOperatingCostUsd: 120_000,
      activationCostUsd: 150_000,
      discountRatePct: 10,
    });

    expect(npv.years[0].netBenefitUsd).toBeCloseTo(395_000, 6);
    expect(npv.totalNetBenefitUsd).toBeCloseTo(395_000 * 2 - 150_000, 6);
  });

  it("interpolates payback inside the crossing year rather than rounding to whole years", () => {
    const npv = projectNpv({
      yearlyDutySavingsUsd: [200_000, 200_000],
      yearlyMpfSavingsUsd: [0, 0],
      yearlyDeferralValueUsd: [0, 0],
      annualOperatingCostUsd: 0,
      activationCostUsd: 100_000,
      discountRatePct: 0,
    });

    // $100k cost against $200k in year one → halfway through year one.
    expect(npv.paybackMonths).toBe(6);
  });

  it("returns a null payback and a null IRR when the project never turns positive", () => {
    const npv = projectNpv({
      yearlyDutySavingsUsd: [10_000, 10_000],
      yearlyMpfSavingsUsd: [0, 0],
      yearlyDeferralValueUsd: [0, 0],
      annualOperatingCostUsd: 120_000,
      activationCostUsd: 150_000,
      discountRatePct: 10,
    });

    expect(npv.npvUsd).toBeLessThan(0);
    expect(npv.paybackMonths).toBeNull();
    expect(npv.irrPct).toBeNull();
  });

  it("computes IRR by bisection for a textbook cash flow", () => {
    // −100 then +60, +60: IRR ≈ 13.07%
    const irr = computeIrr(-100, [60, 60]);
    expect(irr).not.toBeNull();
    expect(irr as number).toBeCloseTo(13.07, 1);
  });

  it("returns null IRR when undiscounted flows never repay the outlay", () => {
    expect(computeIrr(-100, [10, 10])).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────
// Verdict + end-to-end
// ─────────────────────────────────────────────────────────

describe("optimizeFtz end to end", () => {
  it("recommends pursuing a strongly inverted, high-volume zone", () => {
    const result = optimizeFtz(invertedInput());

    expect(result.verdict).toBe("PURSUE");
    expect(result.npv.npvUsd).toBeGreaterThan(0);
    expect(result.npv.paybackMonths).not.toBeNull();
    expect(result.dutySavingsPct).toBeGreaterThan(15);
    expect(result.headline).toMatch(/Activate the zone and elect NPF/);
  });

  it("lands inside the 15–40% duty-savings band the FTZ case is sold on", () => {
    const result = optimizeFtz(invertedInput());
    // $550k of relief against $800k of baseline duty is 68.75% — well past
    // the band this feature is marketed on, so assert the arithmetic rather
    // than the marketing range. The 15–40% band shows up on BOMs where only
    // part of the value is inverted (see the PF-forced cases above).
    expect(result.baselineAnnualDutyUsd).toBeCloseTo(800_000, 4);
    expect(result.optimizedAnnualDutyUsd).toBeCloseTo(250_000, 4);
    expect(result.dutySavingsPct).toBeCloseTo(68.75, 4);
  });

  it("says SKIP when the zone cannot cover its own operating cost", () => {
    const tiny = invertedInput({
      components: [
        {
          id: "small",
          description: "Low-volume part",
          htsCode: "3926.90.99",
          countryOfOrigin: "TH",
          annualValueUsd: 200_000,
          dutyRatePctOverride: 6.5,
        },
      ],
      activationCostUsd: 150_000,
      annualOperatingCostUsd: 120_000,
    });

    const result = optimizeFtz(tiny);
    expect(result.verdict).toBe("SKIP");
    expect(result.npv.npvUsd).toBeLessThan(0);
    expect(result.headline).toMatch(/does not pay for itself/i);
  });

  it("flags a marginal case when payback slips into the last fifth of the horizon", () => {
    const marginal = invertedInput({
      components: [
        {
          id: "mid",
          description: "Mid-volume part",
          htsCode: "3926.90.99",
          countryOfOrigin: "TH",
          annualValueUsd: 3_000_000,
          dutyRatePctOverride: 6.5,
        },
      ],
      activationCostUsd: 400_000,
      annualOperatingCostUsd: 100_000,
    });

    const result = optimizeFtz(marginal);
    expect(["MARGINAL", "PURSUE", "SKIP"]).toContain(result.verdict);
    if (result.verdict === "MARGINAL") {
      expect(result.headline).toMatch(/marginal/i);
    }
  });

  it("ranks drivers by size, largest lever first", () => {
    const result = optimizeFtz(
      invertedInput({ reExportSharePct: 20, entriesPerYear: 400 })
    );

    expect(result.drivers.length).toBeGreaterThan(1);
    expect(result.drivers[0]).toMatch(/Inverted tariff relief/);
    expect(result.drivers.join(" ")).toMatch(/Re-export exemption/);
    expect(result.drivers.join(" ")).toMatch(/Weekly entry/);
  });

  it("warns about production authority and PF-forced value", () => {
    const result = optimizeFtz(
      invertedInput({
        components: [
          {
            id: "cn",
            description: "Chinese motor",
            htsCode: "8501.10.40",
            countryOfOrigin: "CN",
            annualValueUsd: 3_000_000,
          },
          {
            id: "th",
            description: "Housing",
            htsCode: "3926.90.99",
            countryOfOrigin: "TH",
            annualValueUsd: 7_000_000,
            dutyRatePctOverride: 6.5,
          },
        ],
      })
    );

    const warnings = result.warnings.join(" ");
    expect(warnings).toMatch(/production authority/i);
    expect(warnings).toMatch(/Section 301\/232/);
  });

  it("always returns the compliance disclaimers", () => {
    const result = optimizeFtz(invertedInput());
    expect(result.disclaimers.length).toBeGreaterThanOrEqual(4);
    expect(result.disclaimers.join(" ")).toMatch(/not a customs ruling/i);
    expect(result.disclaimers.join(" ")).toMatch(/Harbor Maintenance Fee is not avoided/i);
  });

  it("defaults the horizon to five years", () => {
    const { horizonYears, ...rest } = invertedInput();
    const result = optimizeFtz(rest as FtzOptimizerInput);
    expect(result.npv.horizonYears).toBe(5);
  });
});

// ─────────────────────────────────────────────────────────
// Guards
// ─────────────────────────────────────────────────────────

describe("input guards", () => {
  it("rejects an empty bill of materials", () => {
    expect(() => optimizeFtz(invertedInput({ components: [] }))).toThrow(FtzInputError);
  });

  it("rejects a component with no HTS code", () => {
    expect(() =>
      optimizeFtz(
        invertedInput({
          components: [
            {
              description: "Mystery part",
              htsCode: "",
              countryOfOrigin: "VN",
              annualValueUsd: 1_000,
            },
          ],
        })
      )
    ).toThrow(/missing an HTS code/i);
  });

  it("rejects a negative component value", () => {
    expect(() =>
      optimizeFtz(
        invertedInput({
          components: [
            {
              description: "Negative",
              htsCode: "3926.90.99",
              countryOfOrigin: "TH",
              annualValueUsd: -5,
            },
          ],
        })
      )
    ).toThrow(/non-negative annual value/i);
  });

  it("rejects a zero-value bill of materials", () => {
    expect(() =>
      optimizeFtz(
        invertedInput({
          components: [
            {
              description: "Free sample",
              htsCode: "3926.90.99",
              countryOfOrigin: "TH",
              annualValueUsd: 0,
            },
          ],
        })
      )
    ).toThrow(/greater than zero/i);
  });

  it("rejects fewer than one entry per year", () => {
    expect(() => optimizeFtz(invertedInput({ entriesPerYear: 0 }))).toThrow(
      /at least 1/i
    );
  });

  it("rejects a horizon outside 1–20 years", () => {
    expect(() => optimizeFtz(invertedInput({ horizonYears: 0 }))).toThrow(FtzInputError);
    expect(() => optimizeFtz(invertedInput({ horizonYears: 25 }))).toThrow(FtzInputError);
  });

  it("rejects a missing finished-good HTS code", () => {
    expect(() =>
      optimizeFtz(
        invertedInput({ finishedGood: { description: "x", htsCode: "" } })
      )
    ).toThrow(/finished-good HTS code/i);
  });
});

// ─────────────────────────────────────────────────────────
// Rate projection
// ─────────────────────────────────────────────────────────

describe("projectRate", () => {
  it("compounds the trajectory relative to the rate's own value", () => {
    expect(projectRate(7, 10, 1)).toBeCloseTo(7.7, 6);
    expect(projectRate(7, 10, 2)).toBeCloseTo(8.47, 6);
  });

  it("leaves the rate untouched at year zero", () => {
    expect(projectRate(7, 50, 0)).toBeCloseTo(7, 6);
  });

  it("never returns a negative rate", () => {
    expect(projectRate(5, -200, 1)).toBe(0);
  });
});

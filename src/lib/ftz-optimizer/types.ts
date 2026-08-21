// ============================================================
// FTZ Optimizer Agent — types (AI-12021)
//
// The optimizer turns the read-only FTZ savings calculator into a
// recommendation engine. Given a bill of materials, a finished-good
// classification and the economics of running a zone, it answers three
// questions a trade compliance manager actually has to decide:
//
//   1. Is our duty structure inverted? (component rate > finished rate)
//   2. Do we elect Privileged Foreign or Non-Privileged Foreign status?
//   3. Does the zone pay for itself over a five-year horizon?
//
// Every number here is a customs *value* figure in USD and every rate is a
// percentage (7.5 means 7.5%), matching the convention already used by
// lib/data/hts-tariffs.ts and lib/calculators/landed-cost.ts.
// ============================================================

import type { CountryCode } from "@/lib/types";

// ─── Input ────────────────────────────────────────────────

/** One line of the bill of materials admitted into the zone. */
export interface FtzComponentInput {
  /** Stable id for UI row tracking. Optional — generated when absent. */
  id?: string;
  description: string;
  htsCode: string;
  countryOfOrigin: CountryCode;
  /** Customs value of this component admitted per year, USD. */
  annualValueUsd: number;
  /**
   * Manual override for the effective duty rate (%). When omitted the rate is
   * resolved from the HTS table plus any Section 301 action for the origin.
   */
  dutyRatePctOverride?: number;
}

export interface FtzFinishedGoodInput {
  description: string;
  htsCode: string;
  /** Manual override for the finished-article duty rate (%). */
  dutyRatePctOverride?: number;
  /**
   * Origin used to resolve the finished-good rate. An article manufactured in
   * a US zone is normally entered under the US rate column, so this defaults
   * to "US" — but a shipper substantially transforming in-zone from a single
   * origin may want to model otherwise.
   */
  countryOfOrigin?: CountryCode;
}

export interface FtzOptimizerInput {
  finishedGood: FtzFinishedGoodInput;
  components: FtzComponentInput[];

  /**
   * Does the zone hold CBP production authority? Inverted-tariff relief is
   * only available when the article is manufactured or substantially
   * transformed inside the zone, so this gates the NPF election.
   */
  manufacturingInZone: boolean;

  /** Share of admitted merchandise re-exported (0–100). Duty-free in a zone. */
  reExportSharePct: number;
  /** Yield loss / scrap share (0–100). Treated as duty-exempt in-zone. */
  scrapSharePct: number;

  /** Customs entries filed per year today, without a zone. Drives MPF savings. */
  entriesPerYear: number;
  /** Average months merchandise sits in the zone before withdrawal. */
  storageMonths: number;

  /** Cost of capital (%/yr). Values the duty deferral float and discounts the NPV. */
  costOfCapitalPct: number;

  /** One-time activation cost: application, bond, WMS, consultants. */
  activationCostUsd: number;
  /** Recurring annual operating cost: staff, software, audits, bond premium. */
  annualOperatingCostUsd: number;

  /**
   * Expected relative change in duty rates per year (%). 10 means rates climb
   * 10% of their own value each year (a 7% rate becomes 7.7%). Negative models
   * de-escalation. This is the single biggest driver of the PF/NPF election.
   */
  tariffTrajectoryPctPerYear: number;

  /** Annual import volume growth (%). Default 0. */
  volumeGrowthPctPerYear?: number;

  /** Projection horizon in years. Default 5. */
  horizonYears?: number;
}

// ─── Duty resolution ──────────────────────────────────────

export interface RatedComponent {
  id: string;
  description: string;
  htsCode: string;
  countryOfOrigin: CountryCode;
  annualValueUsd: number;
  /** Ordinary MFN / column-1 portion of the rate (%). */
  baseRatePct: number;
  /** Section 301 additional duty (%), zero when not applicable. */
  section301Pct: number;
  /** baseRatePct + section301Pct, or the caller's override. */
  effectiveRatePct: number;
  /** True when the rate came from dutyRatePctOverride rather than the HTS table. */
  rateOverridden: boolean;
  /**
   * True when CBP requires this merchandise be admitted in Privileged Foreign
   * status — Section 301 and Section 232 goods. Such value can never receive
   * inverted-tariff relief.
   */
  pfForced: boolean;
  /** Why it is PF-forced, for the UI. Empty when it is not. */
  pfForcedReason: string;
  /** Advisory notes surfaced by the HTS lookup (GSP, FTA, §301 list). */
  notes: string[];
}

export interface DutyProfile {
  components: RatedComponent[];
  finishedGoodRatePct: number;
  finishedRateOverridden: boolean;
  totalAnnualValueUsd: number;
  /** Value-weighted component duty rate (%). */
  weightedComponentRatePct: number;
  /** Value eligible for inverted-tariff relief (not PF-forced). */
  npfEligibleValueUsd: number;
  /** Value CBP forces into PF status (Section 301 / 232). */
  pfForcedValueUsd: number;
  /** Weighted rate across the PF-forced slice only (%). */
  pfForcedWeightedRatePct: number;
  /** Weighted rate across the NPF-eligible slice only (%). */
  npfEligibleWeightedRatePct: number;
}

// ─── Inverted tariff ──────────────────────────────────────

export interface InvertedTariffFinding {
  /** weightedComponentRatePct − finishedGoodRatePct. Positive = inverted. */
  spreadPct: number;
  /** Spread is positive AND the zone can actually capture it. */
  isInverted: boolean;
  /** Spread is positive but something blocks capture (no production authority, all §301). */
  blocked: boolean;
  blockedReason: string | null;
  /** Value that can actually claim the finished-good rate. */
  capturableValueUsd: number;
  /** Year-1 duty saved by paying the finished rate on the capturable value. */
  annualSavingsUsd: number;
  /** Per-component contribution, sorted by savings descending. */
  contributors: Array<{
    id: string;
    description: string;
    htsCode: string;
    componentRatePct: number;
    spreadPct: number;
    annualValueUsd: number;
    annualSavingsUsd: number;
    pfForced: boolean;
  }>;
}

// ─── Election ─────────────────────────────────────────────

export type FtzElection = "PF" | "NPF" | "MIXED";

export interface ElectionYear {
  year: number;
  /** Duty owed with no zone at all — component rates, floating with the trajectory. */
  baselineDutyUsd: number;
  /** Duty owed under a pure PF election — component rates frozen at admission. */
  pfDutyUsd: number;
  /**
   * Duty owed under an NPF election. PF-forced value stays on its frozen
   * component rate; everything else pays the finished rate then in effect.
   */
  npfDutyUsd: number;
}

export interface ElectionRecommendation {
  election: FtzElection;
  /** Duty under the recommended election, summed across the horizon. */
  recommendedDutyUsd: number;
  /** Duty under the losing election, summed across the horizon. */
  alternativeDutyUsd: number;
  /** alternativeDutyUsd − recommendedDutyUsd. Always ≥ 0. */
  electionAdvantageUsd: number;
  confidence: "high" | "medium" | "low";
  rationale: string[];
  /** Per-year duty under each option, for the UI table. */
  schedule: ElectionYear[];
}

// ─── Non-duty savings ─────────────────────────────────────

export interface AncillarySavings {
  /** MPF paid per year today, across entriesPerYear entries. */
  mpfWithoutFtzUsd: number;
  /** MPF paid per year under weekly entry (at most 52 entries). */
  mpfWithFtzUsd: number;
  mpfSavingsUsd: number;
  /** Working-capital value of deferring duty for storageMonths. */
  dutyDeferralValueUsd: number;
  /** Duty never owed because the merchandise is re-exported from the zone. */
  reExportSavingsUsd: number;
  /** Duty never owed on yield loss / scrap consumed in-zone. */
  scrapSavingsUsd: number;
  /** Share of admitted value that is actually withdrawn into US commerce (0–1). */
  domesticEntryShare: number;
}

// ─── NPV ──────────────────────────────────────────────────

export interface CashFlowYear {
  year: number;
  dutySavingsUsd: number;
  mpfSavingsUsd: number;
  deferralValueUsd: number;
  operatingCostUsd: number;
  netBenefitUsd: number;
  discountFactor: number;
  discountedNetUsd: number;
  cumulativeDiscountedUsd: number;
}

export interface NpvProjection {
  horizonYears: number;
  discountRatePct: number;
  activationCostUsd: number;
  /** Sum of discounted net benefits minus the activation cost. */
  npvUsd: number;
  /** Undiscounted total net benefit across the horizon, net of activation. */
  totalNetBenefitUsd: number;
  /** Months until cumulative discounted cash flow crosses zero. Null if never. */
  paybackMonths: number | null;
  /** Internal rate of return (%). Null when the cash flows never turn positive. */
  irrPct: number | null;
  years: CashFlowYear[];
}

// ─── Result ───────────────────────────────────────────────

export type FtzVerdict = "PURSUE" | "MARGINAL" | "SKIP";

export interface FtzOptimization {
  verdict: FtzVerdict;
  headline: string;
  duty: DutyProfile;
  inversion: InvertedTariffFinding;
  election: ElectionRecommendation;
  ancillary: AncillarySavings;
  npv: NpvProjection;
  /** Year-1 duty owed with no zone. */
  baselineAnnualDutyUsd: number;
  /** Year-1 duty owed under the recommended election. */
  optimizedAnnualDutyUsd: number;
  /** Year-1 duty saved, as a share of the baseline duty (%). */
  dutySavingsPct: number;
  /** Ranked levers driving the recommendation. */
  drivers: string[];
  /** Things that would invalidate the number if left unchecked. */
  warnings: string[];
  /** Compliance caveats the UI is required to display. */
  disclaimers: string[];
}

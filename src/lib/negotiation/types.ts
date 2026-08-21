// ============================================================
// Rate Negotiation Agent — shared types (AI-12020)
// ============================================================

import type { FbxLane, TradeRegion } from "@/lib/data/fbx-benchmarks";

/** Container types the agent can benchmark. LCL is priced per CBM and is out of scope. */
export type NegotiableContainerType = "20GP" | "40GP" | "40HC" | "20RF" | "40RF";

/** A single charge line on a carrier quote. */
export interface QuoteLineItem {
  /** Surcharge code where known (BAF, THC, ISF, ...). Free text is fine. */
  code: string;
  label?: string;
  /** USD, per container unless `perShipment` is true. */
  amount: number;
  /** True when the charge is levied once per shipment, not per container. */
  perShipment?: boolean;
}

export interface QuoteInput {
  carrier: string;
  /** UN/LOCODE (e.g. "CNSHA") or a bare ISO country code (e.g. "CN"). */
  originPort: string;
  /** UN/LOCODE (e.g. "USLAX") or a bare ISO country code. */
  destPort: string;
  containerType: NegotiableContainerType;
  /** Containers on this quote. Must be >= 1. */
  containerCount: number;
  /** Base ocean freight, USD PER CONTAINER, excluding the line items below. */
  baseRatePerContainer: number;
  /** Surcharges / accessorials quoted alongside the base rate. */
  lineItems?: QuoteLineItem[];
  /** Contract length being negotiated. Drives leverage and target aggression. */
  contractType?: "spot" | "90_day" | "180_day" | "365_day";
  /** Annual FEU-equivalent volume the shipper can commit. Powers annualized savings. */
  annualFeuVolume?: number;
  /**
   * Competing quotes on the same lane, all-in USD per container. Enter them
   * all-in (base + surcharges) — they are compared against this quote's
   * all-in figure, so a base-only competing rate would look artificially
   * cheap and overstate the shipper's leverage.
   */
  competingQuotes?: Array<{ carrier: string; ratePerContainer: number }>;
  /** Shipper can flex sailing dates — a real, cheap concession to trade. */
  flexibleDates?: boolean;
  /** Free-text notes carried into the generated script. */
  notes?: string;
}

/** A resolved lane benchmark, normalized to the quoted container type. */
export interface LaneBenchmark {
  lane: FbxLane;
  originRegion: TradeRegion;
  destRegion: TradeRegion;
  /** Whether the lane was matched exactly or fell back to a reciprocal/nearest lane. */
  matchQuality: "exact" | "derived" | "fallback";
  matchNote: string;
  containerType: NegotiableContainerType;
  /** Multiplier applied to FEU figures to reach this container type. */
  containerRatio: number;
  /** Market percentile curve for the quoted container type, USD per container. */
  percentiles: PercentileCurve;
  /** Spot figures re-expressed in the quoted container type, USD per container. */
  spotPerContainer: {
    current: number;
    avg4Week: number;
    avg52Week: number;
    low52Week: number;
    high52Week: number;
  };
  /** Market direction derived from current vs 4-week and 52-week averages. */
  trend: MarketTrend;
}

export interface PercentileCurve {
  p10: number;
  p25: number;
  p50: number;
  p75: number;
  p90: number;
}

export interface MarketTrend {
  direction: "falling" | "flat" | "rising";
  /** Current vs 4-week average, percent. Negative = softening market. */
  vs4WeekPct: number;
  /** Current vs 52-week average, percent. */
  vs52WeekPct: number;
  /** Plain-English read used in the negotiation script. */
  summary: string;
}

export type QuoteGrade = "A" | "B" | "C" | "D" | "F";
export type QuoteVerdict = "accept" | "negotiate" | "strong-negotiate" | "reject";

export interface SurchargeFinding {
  code: string;
  label: string;
  quoted: number;
  /** Upper bound of the typical market range for this charge. */
  typicalMax: number;
  /** How far above typicalMax the quote sits, USD. */
  excess: number;
  severity: "watch" | "high";
}

export interface QuoteScore {
  /** All-in cost per container, USD (base + per-container line items + amortized per-shipment items). */
  allInPerContainer: number;
  /** All-in cost for the whole quote, USD. */
  allInTotal: number;
  /** All-in per container expressed against the benchmark's container type. */
  benchmarkPerContainer: number;
  /** Where the quote sits on the market curve, 0-100. Lower is better for the shipper. */
  percentileRank: number;
  /** All-in vs benchmark p50, percent. Positive = above market. */
  variancePct: number;
  /** USD per container above (or below) market median. */
  varianceUsd: number;
  grade: QuoteGrade;
  verdict: QuoteVerdict;
  headline: string;
  surchargeFindings: SurchargeFinding[];
  /** Total USD per container sitting above typical surcharge ranges. */
  surchargeExcessTotal: number;
}

export interface CounterOfferRound {
  round: 1 | 2 | 3;
  label: string;
  /** Target all-in rate per container, USD. */
  ratePerContainer: number;
  /** Savings vs the carrier's quote, USD per container. */
  savingsPerContainer: number;
  savingsPct: number;
  /** What the shipper concedes at this step to make the ask credible. */
  concession: string;
  rationale: string;
}

export interface SavingsProjection {
  perContainer: number;
  perShipment: number;
  /** Null when the shipper did not supply an annual volume. */
  annualized: number | null;
  /** Savings percent against the quoted all-in. */
  pct: number;
}

export interface CounterOfferPlan {
  /** The realistic landing zone — what a competent negotiator should close at. */
  targetRatePerContainer: number;
  /** Above this, walk: the market has better options. */
  walkAwayRatePerContainer: number;
  rounds: CounterOfferRound[];
  /** Savings if the target lands. */
  expectedSavings: SavingsProjection;
  /** Savings if the opening ask lands outright (best case). */
  bestCaseSavings: SavingsProjection;
  /** Surcharge-only savings — usually the easiest yes. */
  surchargeSavings: SavingsProjection;
}

export interface LeveragePoint {
  /** Machine key so the UI can group/sort. */
  key: string;
  title: string;
  detail: string;
  strength: "high" | "medium" | "low";
}

export interface NegotiationScript {
  /** Subject line for the counter-offer email. */
  emailSubject: string;
  emailBody: string;
  /** Ordered talking points for a live call. */
  callTalkingPoints: string[];
  /** Anticipated carrier pushback and the response. */
  objectionHandling: Array<{ objection: string; response: string }>;
  /** The shipper's walk-away position, stated plainly. */
  batna: string;
  /** True when an LLM rewrote the email body; false = deterministic template. */
  aiPolished: boolean;
}

export interface NegotiationAnalysis {
  quote: QuoteInput;
  benchmark: LaneBenchmark;
  score: QuoteScore;
  plan: CounterOfferPlan;
  leverage: LeveragePoint[];
  script: NegotiationScript;
  /** Caveats the UI must show (stale benchmark, derived lane, missing data...). */
  disclaimers: string[];
  generatedAt: string;
}

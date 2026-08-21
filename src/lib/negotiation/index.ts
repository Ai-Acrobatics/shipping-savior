// ============================================================
// Rate Negotiation Agent — orchestrator (AI-12020)
//
// analyzeQuote() is the single entry point. Pure and synchronous: no DB, no
// network, no LLM. That keeps it fully testable and means the API route can
// stay a thin validation + auth wrapper.
// ============================================================

import { resolveLaneBenchmark, LaneResolutionError } from "./benchmarks";
import { scoreQuote } from "./scoring";
import { buildCounterOfferPlan, detectLeverage } from "./counter-offer";
import { buildScript } from "./script";
import type { NegotiationAnalysis, QuoteInput } from "./types";

export * from "./types";
export {
  resolveLaneBenchmark,
  resolveRegion,
  buildPercentileCurve,
  computeTrend,
  LaneResolutionError,
  CONTAINER_FEU_RATIO,
} from "./benchmarks";
export {
  scoreQuote,
  computeAllInPerContainer,
  percentileRankOf,
  gradeFor,
  verdictFor,
  findSurchargeOutliers,
} from "./scoring";
export { buildCounterOfferPlan, detectLeverage, rateAtPercentile } from "./counter-offer";
export { buildScript } from "./script";

export class QuoteValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "QuoteValidationError";
  }
}

/**
 * Guard policy: throw on unusable input rather than clamping. A silently
 * clamped container count produces a confident, wrong savings number — which
 * is worse than an error, because someone will take it into a negotiation.
 */
function validate(quote: QuoteInput): void {
  if (!quote.carrier?.trim()) {
    throw new QuoteValidationError("Carrier name is required.");
  }
  if (!Number.isFinite(quote.baseRatePerContainer) || quote.baseRatePerContainer <= 0) {
    throw new QuoteValidationError("Base rate per container must be a positive number.");
  }
  if (!Number.isInteger(quote.containerCount) || quote.containerCount < 1) {
    throw new QuoteValidationError("Container count must be a whole number of at least 1.");
  }
  if (quote.annualFeuVolume !== undefined && quote.annualFeuVolume !== null) {
    if (!Number.isFinite(quote.annualFeuVolume) || quote.annualFeuVolume < 0) {
      throw new QuoteValidationError("Annual FEU volume must be zero or a positive number.");
    }
  }
  for (const item of quote.lineItems ?? []) {
    if (!Number.isFinite(item.amount) || item.amount < 0) {
      throw new QuoteValidationError(
        `Line item "${item.code || "(unnamed)"}" must have a non-negative amount.`
      );
    }
  }
  for (const c of quote.competingQuotes ?? []) {
    if (!Number.isFinite(c.ratePerContainer) || c.ratePerContainer <= 0) {
      throw new QuoteValidationError(
        `Competing quote from "${c.carrier || "(unnamed)"}" must have a positive rate.`
      );
    }
  }
}

/** Caveats the UI is required to show alongside the numbers. */
function buildDisclaimers(analysis: {
  benchmark: NegotiationAnalysis["benchmark"];
  quote: QuoteInput;
}): string[] {
  const { benchmark, quote } = analysis;
  const out: string[] = [];

  out.push(
    `Benchmarked against ${benchmark.lane.code} as of ${benchmark.lane.asOf}. FBX is a spot index — it is a market reference, not a quote, and it moves weekly.`
  );

  if (benchmark.matchQuality !== "exact") {
    out.push(benchmark.matchNote);
  }

  if (benchmark.containerType !== "40GP") {
    out.push(
      `FBX publishes per 40ft (FEU). ${benchmark.containerType} figures are converted at ${benchmark.containerRatio}x FEU, an industry rule of thumb rather than a published rate.`
    );
  }

  if (!quote.lineItems || quote.lineItems.length === 0) {
    out.push(
      "No surcharges were entered, so the score compares base rate against an all-in market benchmark. Add BAF, THC, ISF and documentation charges for an accurate read — surcharges are frequently where the padding is."
    );
  }

  if (!quote.annualFeuVolume) {
    out.push("Add your annual FEU volume to see annualized savings and strengthen the volume lever.");
  }

  return out;
}

/**
 * Score a carrier quote against the market and produce a full negotiation package.
 *
 * @throws {QuoteValidationError} when the quote itself is unusable
 * @throws {LaneResolutionError} when no benchmark covers the lane
 */
export function analyzeQuote(quote: QuoteInput): NegotiationAnalysis {
  validate(quote);

  const benchmark = resolveLaneBenchmark({
    originPort: quote.originPort,
    destPort: quote.destPort,
    containerType: quote.containerType,
  });

  const score = scoreQuote(quote, benchmark);
  const plan = buildCounterOfferPlan(quote, benchmark, score);
  const leverage = detectLeverage(quote, benchmark, score);
  const script = buildScript(quote, benchmark, score, plan, leverage);

  return {
    quote,
    benchmark,
    score,
    plan,
    leverage,
    script,
    disclaimers: buildDisclaimers({ benchmark, quote }),
    generatedAt: new Date().toISOString(),
  };
}

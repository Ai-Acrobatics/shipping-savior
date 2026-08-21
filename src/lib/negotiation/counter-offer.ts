// ============================================================
// Counter-offer ladder + leverage detection (AI-12020)
//
// Turns "you're 22% over market" into "open at $2,180, land at $2,410,
// walk above $2,900 — and here is what you trade to get there."
// ============================================================

import type {
  CounterOfferPlan,
  CounterOfferRound,
  LaneBenchmark,
  LeveragePoint,
  QuoteInput,
  QuoteScore,
  SavingsProjection,
} from "./types";

/**
 * How hard to push, by contract length. Longer commitments earn deeper
 * discounts — a carrier will trade rate for a guaranteed 12-month slot
 * allocation, but not for a one-off spot booking.
 *
 * `target` is the percentile we aim to land on; `opening` is where the first
 * counter goes in (deliberately below target, so conceding to target still
 * feels like a win to the carrier).
 */
const AGGRESSION_BY_CONTRACT: Record<
  NonNullable<QuoteInput["contractType"]>,
  { openingPercentile: number; targetPercentile: number; label: string }
> = {
  spot: { openingPercentile: 20, targetPercentile: 35, label: "spot booking" },
  "90_day": { openingPercentile: 15, targetPercentile: 30, label: "90-day contract" },
  "180_day": { openingPercentile: 12, targetPercentile: 25, label: "180-day contract" },
  "365_day": { openingPercentile: 10, targetPercentile: 22, label: "12-month contract" },
};

const DEFAULT_AGGRESSION = AGGRESSION_BY_CONTRACT["90_day"];

/** Invert the percentile curve: given a percentile, what's the rate? */
export function rateAtPercentile(
  percentile: number,
  curve: LaneBenchmark["percentiles"]
): number {
  const points: Array<[number, number]> = [
    [10, curve.p10],
    [25, curve.p25],
    [50, curve.p50],
    [75, curve.p75],
    [90, curve.p90],
  ];

  const p = Math.min(Math.max(percentile, 0), 100);

  if (p <= points[0]![0]) {
    // Below p10 the curve flattens into the carrier's slot-cost floor. Extend
    // the p10→p25 slope but never go below 90% of p10 — asking for a rate no
    // carrier can accept destroys credibility and stalls the negotiation.
    const [y0, x0] = points[0]!;
    const [y1, x1] = points[1]!;
    const slope = (x1 - x0) / (y1 - y0);
    return Math.max(Math.round(x0 - (y0 - p) * slope), Math.round(curve.p10 * 0.9));
  }

  for (let i = 0; i < points.length - 1; i++) {
    const [y0, x0] = points[i]!;
    const [y1, x1] = points[i + 1]!;
    if (p <= y1) {
      return Math.round(x0 + ((p - y0) / (y1 - y0)) * (x1 - x0));
    }
  }

  return curve.p90;
}

function projectSavings(
  quotedPerContainer: number,
  targetPerContainer: number,
  quote: QuoteInput,
  benchmark: LaneBenchmark
): SavingsProjection {
  const perContainer = Math.round(quotedPerContainer - targetPerContainer);
  const count = Math.max(quote.containerCount, 1);
  const perShipment = perContainer * count;

  // Annual volume is given in FEU. Convert the per-container saving to a
  // per-FEU saving before scaling, or a 20ft quote would overstate the year.
  let annualized: number | null = null;
  if (quote.annualFeuVolume && quote.annualFeuVolume > 0) {
    const perFeu = perContainer / Math.max(benchmark.containerRatio, 0.01);
    annualized = Math.round(perFeu * quote.annualFeuVolume);
  }

  const pct =
    quotedPerContainer > 0
      ? Math.round((perContainer / quotedPerContainer) * 1000) / 10
      : 0;

  return { perContainer, perShipment, annualized, pct };
}

/**
 * Build the three-round counter ladder.
 *
 * Round 1 opens below target with the market data as justification.
 * Round 2 is the realistic landing zone — the number to actually close at.
 * Round 3 is the last concession before walking, only used if the carrier
 * refuses to move past round 2.
 */
export function buildCounterOfferPlan(
  quote: QuoteInput,
  benchmark: LaneBenchmark,
  score: QuoteScore
): CounterOfferPlan {
  const aggression = quote.contractType
    ? AGGRESSION_BY_CONTRACT[quote.contractType] ?? DEFAULT_AGGRESSION
    : DEFAULT_AGGRESSION;

  const quoted = score.allInPerContainer;

  const openingRaw = rateAtPercentile(aggression.openingPercentile, benchmark.percentiles);
  const targetRaw = rateAtPercentile(aggression.targetPercentile, benchmark.percentiles);
  // Walk-away sits just above the median: past that point the market itself
  // is the better option, so re-bidding beats conceding.
  const walkAwayRaw = rateAtPercentile(58, benchmark.percentiles);

  // If the quote is already better than our ask, don't invent a counter that
  // asks the carrier to raise its own rate. Cap every rung at the quote.
  const opening = Math.min(openingRaw, quoted);
  const target = Math.min(targetRaw, quoted);
  const walkAway = Math.min(walkAwayRaw, quoted);

  // Round 3 splits the difference between target and walk-away.
  const finalRung = Math.min(Math.round((target + walkAway) / 2), quoted);

  const surchargeConcession =
    score.surchargeFindings.length > 0
      ? `Ask them to bring ${score.surchargeFindings
          .slice(0, 2)
          .map((f) => f.code)
          .join(" and ")} back inside the standard range before touching the base rate.`
      : "Ask for the base rate to move; leave the surcharges alone since they already price at market.";

  const volumeConcession = quote.annualFeuVolume
    ? `Commit the ${quote.annualFeuVolume.toLocaleString("en-US")} FEU/year in writing in exchange for the rate.`
    : "Offer a minimum-quantity commitment (MQC) in exchange for the rate — carriers price allocation, not goodwill.";

  const dateConcession = quote.flexibleDates
    ? "Give them sailing-date flexibility (+/- 7 days) so they can fill a soft vessel — this costs you nothing and is worth real money to them."
    : "Offer sailing-date flexibility if your cargo can take it — it is the cheapest concession you own.";

  const rounds: CounterOfferRound[] = [
    {
      round: 1,
      label: "Opening counter",
      ratePerContainer: opening,
      savingsPerContainer: Math.round(quoted - opening),
      savingsPct: pctOf(quoted - opening, quoted),
      concession: volumeConcession,
      rationale:
        `Anchors at the ${aggression.openingPercentile}th percentile of the ${benchmark.lane.code} market. ` +
        `Below the landing zone on purpose, so conceding to the target still reads as a win for them.`,
    },
    {
      round: 2,
      label: "Landing zone (target)",
      ratePerContainer: target,
      savingsPerContainer: Math.round(quoted - target),
      savingsPct: pctOf(quoted - target, quoted),
      concession: surchargeConcession,
      rationale:
        `The ${aggression.targetPercentile}th percentile — top-quartile pricing that a well-run ${aggression.label} ` +
        `should close at. Justifiable with the index, so the carrier can defend it internally.`,
    },
    {
      round: 3,
      label: "Final concession",
      ratePerContainer: finalRung,
      savingsPerContainer: Math.round(quoted - finalRung),
      savingsPct: pctOf(quoted - finalRung, quoted),
      concession: dateConcession,
      rationale:
        "Only use this if they will not reach the landing zone. Above the walk-away it stops being worth signing.",
    },
  ];

  const surchargeTargetRate = quoted - score.surchargeExcessTotal;

  return {
    targetRatePerContainer: target,
    walkAwayRatePerContainer: walkAway,
    rounds,
    expectedSavings: projectSavings(quoted, target, quote, benchmark),
    bestCaseSavings: projectSavings(quoted, opening, quote, benchmark),
    surchargeSavings: projectSavings(quoted, surchargeTargetRate, quote, benchmark),
  };
}

function pctOf(part: number, whole: number): number {
  if (whole <= 0) return 0;
  return Math.round((part / whole) * 1000) / 10;
}

/**
 * Everything the shipper can actually put on the table, ranked by how much it
 * moves a carrier. Only facts present in the input produce a leverage point —
 * we never invent leverage the shipper doesn't have.
 */
export function detectLeverage(
  quote: QuoteInput,
  benchmark: LaneBenchmark,
  score: QuoteScore
): LeveragePoint[] {
  const points: LeveragePoint[] = [];

  // Competing quotes are the single strongest lever in freight.
  const competing = quote.competingQuotes ?? [];
  if (competing.length > 0) {
    const best = competing.reduce((a, b) =>
      a.ratePerContainer <= b.ratePerContainer ? a : b
    );
    const delta = Math.round(score.allInPerContainer - best.ratePerContainer);
    points.push({
      key: "competing-bid",
      title: `${competing.length} competing quote${competing.length > 1 ? "s" : ""} on the same lane`,
      detail:
        delta > 0
          ? `${best.carrier} is $${delta.toLocaleString("en-US")}/container cheaper. Name the gap, not the competitor's rate card — "we have a live quote $${delta.toLocaleString("en-US")} under yours" is enough.`
          : `Your best alternative is $${Math.abs(delta).toLocaleString("en-US")}/container more expensive, so use the market index rather than the competing bid as your anchor.`,
      strength: delta > 0 ? "high" : "low",
    });
  }

  if (score.percentileRank > 60) {
    points.push({
      key: "above-market",
      title: `Quote sits in the ${Math.round(score.percentileRank)}th percentile of the market`,
      detail:
        `${benchmark.lane.code} 4-week average is $${benchmark.percentiles.p50.toLocaleString("en-US")}/container ` +
        `for a ${benchmark.containerType}. You are being asked for $${score.allInPerContainer.toLocaleString("en-US")}. ` +
        `Quote the index — carriers negotiate differently once they know you track it.`,
      strength: "high",
    });
  }

  if (score.surchargeFindings.length > 0) {
    const top = score.surchargeFindings[0]!;
    points.push({
      key: "surcharge-padding",
      title: `${score.surchargeFindings.length} surcharge${score.surchargeFindings.length > 1 ? "s" : ""} above the typical range`,
      detail:
        `${top.code} is quoted at $${top.quoted.toLocaleString("en-US")} against a typical ceiling of $${top.typicalMax.toLocaleString("en-US")}. ` +
        `Total padding: $${score.surchargeExcessTotal.toLocaleString("en-US")}/container. Surcharges are easier to win than base rate — carriers can adjust them without touching the contracted rate their pricing desk defends.`,
      strength: score.surchargeExcessTotal > score.allInPerContainer * 0.05 ? "high" : "medium",
    });
  }

  if (benchmark.trend.direction === "falling") {
    points.push({
      key: "falling-market",
      title: "Market is softening",
      detail: benchmark.trend.summary,
      strength: "medium",
    });
  } else if (benchmark.trend.direction === "rising") {
    points.push({
      key: "rising-market",
      title: "Market is firming — buy length, not price",
      detail: `${benchmark.trend.summary} Push for a longer fixed term rather than the last $50 of rate.`,
      strength: "low",
    });
  }

  if (quote.annualFeuVolume && quote.annualFeuVolume > 0) {
    const strength: LeveragePoint["strength"] =
      quote.annualFeuVolume >= 1000 ? "high" : quote.annualFeuVolume >= 200 ? "medium" : "low";
    points.push({
      key: "volume",
      title: `${quote.annualFeuVolume.toLocaleString("en-US")} FEU/year of committed volume`,
      detail:
        strength === "low"
          ? "Volume at this level is a talking point rather than a lever. Pair it with a longer term or date flexibility to make it matter."
          : "Put the commitment in writing as an MQC. Carriers price guaranteed allocation; vague volume promises get ignored.",
      strength,
    });
  }

  if (quote.flexibleDates) {
    points.push({
      key: "flexible-dates",
      title: "Flexible sailing dates",
      detail:
        "A +/- 7 day window lets the carrier put you on an under-booked vessel. It costs you nothing and is one of the few concessions a pricing desk can act on same-day.",
      strength: "medium",
    });
  }

  if (quote.contractType === "365_day" || quote.contractType === "180_day") {
    points.push({
      key: "contract-length",
      title: `Willing to commit to a ${quote.contractType === "365_day" ? "12-month" : "180-day"} term`,
      detail:
        "Length is what a carrier's pricing desk is actually rewarded for. Trade term for rate explicitly rather than letting it be assumed.",
      strength: "medium",
    });
  }

  const strengthRank = { high: 0, medium: 1, low: 2 };
  return points.sort((a, b) => strengthRank[a.strength] - strengthRank[b.strength]);
}

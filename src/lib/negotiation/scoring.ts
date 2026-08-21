// ============================================================
// Quote scoring vs market benchmark (AI-12020)
//
// Answers one question: is this quote good, and by how much is it off?
// Everything downstream (counter-offers, scripts) is built on this output.
// ============================================================

import { OCEAN_SURCHARGES } from "@/lib/calculators/freight-rates";
import type {
  LaneBenchmark,
  PercentileCurve,
  QuoteGrade,
  QuoteInput,
  QuoteScore,
  QuoteVerdict,
  SurchargeFinding,
} from "./types";

/**
 * Charges we can sanity-check against a published typical range. Keyed by the
 * code a carrier would put on the quote. Built from the surcharge table the
 * freight-rate calculator already uses so the two never drift apart.
 */
const SURCHARGE_RANGES: Record<string, { label: string; max: number }> = Object.fromEntries(
  Object.values(OCEAN_SURCHARGES).map((s) => [s.code, { label: s.name, max: s.typical.max }])
);

// Common aliases carriers use for the same charge.
const SURCHARGE_ALIASES: Record<string, string> = {
  THC: "DTHC",
  TCH: "DTHC",
  ODHC: "OTHC",
  OTH: "OTHC",
  DOCS: "DOC",
  BL: "DOC",
  FUEL: "BAF",
  FSC: "BAF",
  BUC: "BAF",
  SECURITY: "ISPS",
};

function canonicalCode(code: string): string {
  const upper = (code ?? "").trim().toUpperCase();
  return SURCHARGE_ALIASES[upper] ?? upper;
}

/**
 * All-in cost per container. Per-shipment charges are amortized across the
 * containers on the quote so the number is comparable to a per-box benchmark.
 */
export function computeAllInPerContainer(quote: QuoteInput): number {
  const count = Math.max(quote.containerCount, 1);
  const items = quote.lineItems ?? [];

  const perContainerItems = items
    .filter((i) => !i.perShipment)
    .reduce((sum, i) => sum + i.amount, 0);

  const perShipmentItems = items
    .filter((i) => i.perShipment)
    .reduce((sum, i) => sum + i.amount, 0);

  return quote.baseRatePerContainer + perContainerItems + perShipmentItems / count;
}

/**
 * Where a rate falls on the market curve, 0-100.
 *
 * Linear interpolation between the known percentile points. Outside p10/p90
 * we keep extrapolating on the adjacent segment's slope rather than snapping
 * straight to 0/100, so quotes just past the edges still separate from each
 * other. The result is then bounded to [0, 100] — a percentile outside that
 * is meaningless.
 *
 * That bound means truly extreme quotes DO saturate at 100: a quote at 3x
 * market and one at 5x market both read as 100th percentile. That is fine
 * and intentional — past a point the only useful statement is "far outside
 * the market". `QuoteScore.variancePct` is unbounded and is what separates
 * the merely-bad from the absurd.
 */
export function percentileRankOf(rate: number, curve: PercentileCurve): number {
  const points: Array<[number, number]> = [
    [curve.p10, 10],
    [curve.p25, 25],
    [curve.p50, 50],
    [curve.p75, 75],
    [curve.p90, 90],
  ];

  if (rate <= points[0]![0]) {
    const [x0, y0] = points[0]!;
    const [x1, y1] = points[1]!;
    const slope = (y1 - y0) / Math.max(x1 - x0, 1);
    return clamp(y0 - (x0 - rate) * slope, 0, 100);
  }

  for (let i = 0; i < points.length - 1; i++) {
    const [x0, y0] = points[i]!;
    const [x1, y1] = points[i + 1]!;
    if (rate <= x1) {
      const span = Math.max(x1 - x0, 1);
      return clamp(y0 + ((rate - x0) / span) * (y1 - y0), 0, 100);
    }
  }

  const [x0, y0] = points[points.length - 2]!;
  const [x1, y1] = points[points.length - 1]!;
  const slope = (y1 - y0) / Math.max(x1 - x0, 1);
  return clamp(y1 + (rate - x1) * slope, 0, 100);
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(Math.max(n, lo), hi);
}

/** Grade bands, keyed off percentile rank. Lower percentile = better deal. */
export function gradeFor(percentile: number): QuoteGrade {
  if (percentile <= 25) return "A";
  if (percentile <= 45) return "B";
  if (percentile <= 60) return "C";
  if (percentile <= 80) return "D";
  return "F";
}

export function verdictFor(percentile: number): QuoteVerdict {
  if (percentile <= 25) return "accept";
  if (percentile <= 60) return "negotiate";
  if (percentile <= 85) return "strong-negotiate";
  return "reject";
}

/**
 * Flag surcharges quoted above the top of their typical market range.
 * Base-rate negotiations stall; surcharge negotiations often don't, because
 * the carrier's own tariff shows the charge is padded.
 */
export function findSurchargeOutliers(quote: QuoteInput): SurchargeFinding[] {
  const count = Math.max(quote.containerCount, 1);

  return (quote.lineItems ?? [])
    .map((item) => {
      const code = canonicalCode(item.code);
      const range = SURCHARGE_RANGES[code];
      if (!range) return null;

      // Compare like with like: amortize per-shipment charges to per-container.
      const perContainer = item.perShipment ? item.amount / count : item.amount;
      const excess = perContainer - range.max;
      if (excess <= 0) return null;

      return {
        code,
        label: item.label ?? range.label,
        quoted: Math.round(perContainer),
        typicalMax: range.max,
        excess: Math.round(excess),
        // 50% over the top of the range is not a rounding difference.
        severity: excess > range.max * 0.5 ? ("high" as const) : ("watch" as const),
      };
    })
    .filter((f): f is SurchargeFinding => f !== null)
    .sort((a, b) => b.excess - a.excess);
}

function headlineFor(
  verdict: QuoteVerdict,
  variancePct: number,
  varianceUsd: number,
  carrier: string
): string {
  const abs = Math.abs(Math.round(variancePct));
  const absUsd = Math.abs(varianceUsd).toLocaleString("en-US");

  switch (verdict) {
    case "accept":
      return `${carrier}'s quote is ${abs}% below market median ($${absUsd}/container under). This is a strong rate — close it.`;
    case "negotiate":
      return variancePct >= 0
        ? `${carrier}'s quote is ${abs}% above market median ($${absUsd}/container over). There is room to counter.`
        : `${carrier}'s quote is ${abs}% below market median but not yet at top-quartile pricing. One counter is still worth making.`;
    case "strong-negotiate":
      return `${carrier}'s quote is ${abs}% above market median ($${absUsd}/container over). Counter hard and put the lane out to bid.`;
    case "reject":
      return `${carrier}'s quote is ${abs}% above market median ($${absUsd}/container over) — bottom-decile pricing. Re-bid the lane before you negotiate.`;
  }
}

export function scoreQuote(quote: QuoteInput, benchmark: LaneBenchmark): QuoteScore {
  const allInPerContainer = computeAllInPerContainer(quote);
  const count = Math.max(quote.containerCount, 1);
  const allInTotal = allInPerContainer * count;

  const percentileRank = Math.round(percentileRankOf(allInPerContainer, benchmark.percentiles) * 10) / 10;
  const varianceUsd = Math.round(allInPerContainer - benchmark.percentiles.p50);
  const variancePct =
    Math.round(((allInPerContainer - benchmark.percentiles.p50) / benchmark.percentiles.p50) * 1000) / 10;

  const grade = gradeFor(percentileRank);
  const verdict = verdictFor(percentileRank);
  const surchargeFindings = findSurchargeOutliers(quote);
  const surchargeExcessTotal = surchargeFindings.reduce((s, f) => s + f.excess, 0);

  return {
    allInPerContainer: Math.round(allInPerContainer),
    allInTotal: Math.round(allInTotal),
    benchmarkPerContainer: benchmark.percentiles.p50,
    percentileRank,
    variancePct,
    varianceUsd,
    grade,
    verdict,
    headline: headlineFor(verdict, variancePct, varianceUsd, quote.carrier),
    surchargeFindings,
    surchargeExcessTotal,
  };
}

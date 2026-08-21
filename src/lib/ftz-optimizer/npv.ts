// ============================================================
// FTZ Optimizer — five-year NPV (AI-12021)
//
// Zone activation is a capital decision, not a duty calculation: an
// application, a bond, a WMS integration and a compliance headcount are paid
// up front against savings that arrive over years. A raw "you'd save $X a
// year" number is what talks importers into zones that never pay back.
//
// So the projection discounts every year at the shipper's cost of capital,
// nets out operating cost, and reports payback in months plus an IRR.
// ============================================================

import type { CashFlowYear, NpvProjection } from "./types";

export interface NpvInput {
  /** Net *benefit* lines per year, before operating cost. Index 0 = year 1. */
  yearlyDutySavingsUsd: number[];
  yearlyMpfSavingsUsd: number[];
  yearlyDeferralValueUsd: number[];
  annualOperatingCostUsd: number;
  activationCostUsd: number;
  discountRatePct: number;
}

export function projectNpv(input: NpvInput): NpvProjection {
  const horizonYears = input.yearlyDutySavingsUsd.length;
  const rate = input.discountRatePct / 100;

  const years: CashFlowYear[] = [];
  let cumulativeDiscounted = -input.activationCostUsd;
  let paybackMonths: number | null = null;

  for (let i = 0; i < horizonYears; i++) {
    const year = i + 1;
    const dutySavingsUsd = input.yearlyDutySavingsUsd[i] ?? 0;
    const mpfSavingsUsd = input.yearlyMpfSavingsUsd[i] ?? 0;
    const deferralValueUsd = input.yearlyDeferralValueUsd[i] ?? 0;
    const netBenefitUsd =
      dutySavingsUsd + mpfSavingsUsd + deferralValueUsd - input.annualOperatingCostUsd;

    const discountFactor = 1 / Math.pow(1 + rate, year);
    const discountedNetUsd = netBenefitUsd * discountFactor;
    const previousCumulative = cumulativeDiscounted;
    cumulativeDiscounted += discountedNetUsd;

    // Straight-line interpolation inside the crossing year. Cash actually
    // arrives monthly, so quoting whole years overstates the wait.
    if (paybackMonths === null && previousCumulative < 0 && cumulativeDiscounted >= 0) {
      const fractionOfYear =
        discountedNetUsd !== 0 ? -previousCumulative / discountedNetUsd : 0;
      paybackMonths = Math.round((i + Math.min(1, Math.max(0, fractionOfYear))) * 12);
    }

    years.push({
      year,
      dutySavingsUsd,
      mpfSavingsUsd,
      deferralValueUsd,
      operatingCostUsd: input.annualOperatingCostUsd,
      netBenefitUsd,
      discountFactor,
      discountedNetUsd,
      cumulativeDiscountedUsd: cumulativeDiscounted,
    });
  }

  const undiscountedNet = years.reduce((sum, y) => sum + y.netBenefitUsd, 0);

  return {
    horizonYears,
    discountRatePct: input.discountRatePct,
    activationCostUsd: input.activationCostUsd,
    npvUsd: cumulativeDiscounted,
    totalNetBenefitUsd: undiscountedNet - input.activationCostUsd,
    paybackMonths,
    irrPct: computeIrr(
      -input.activationCostUsd,
      years.map((y) => y.netBenefitUsd)
    ),
    years,
  };
}

/**
 * IRR by bisection over 0–200%. Returns null when the project never turns
 * positive (no sign change means no root, and a made-up IRR is worse than
 * none). Bisection over a fixed bracket rather than Newton: no derivative, no
 * divergence, and the bracket covers every rate a shipper would act on.
 */
export function computeIrr(
  initialFlow: number,
  subsequentFlows: number[],
  maxIterations = 100
): number | null {
  const npvAt = (rate: number): number =>
    initialFlow +
    subsequentFlows.reduce(
      (sum, flow, index) => sum + flow / Math.pow(1 + rate, index + 1),
      0
    );

  let low = 0;
  let high = 2; // 200%

  const npvLow = npvAt(low);
  const npvHigh = npvAt(high);
  if (npvLow < 0) return null; // never profitable, even undiscounted
  if (npvHigh > 0) return high * 100; // saturates the bracket

  for (let i = 0; i < maxIterations; i++) {
    const mid = (low + high) / 2;
    const value = npvAt(mid);
    if (Math.abs(value) < 0.01) return mid * 100;
    if (value > 0) {
      low = mid;
    } else {
      high = mid;
    }
  }

  return ((low + high) / 2) * 100;
}

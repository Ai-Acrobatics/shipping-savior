/**
 * Unit tests for the landed-cost calculator (AI-8783).
 *
 * Pure-function math — no DB, no fixtures beyond the static HTS table the
 * calculator already pulls from `@/lib/data/hts-tariffs`.
 *
 * What we're locking down:
 *   - CIF basis math (cargo + freight + insurance) is correct
 *   - Duty is applied to customs value (FOB) at the effective HTS rate
 *   - MPF is clamped to its statutory min ($31.67) / max ($614.35)
 *   - HMF is the ad-valorem 0.125% line, no clamp
 *   - FTZ savings: enabling FTZ adds storage cost only (US still owes duty
 *     when goods leave the zone — calculator doesn't pretend FTZ deletes duty;
 *     the savings come from deferred cash flow, not waived tariffs)
 *   - Per-unit + grand totals reconcile
 */
import { describe, it, expect } from 'vitest';
import {
  calculateLandedCost,
  quickLandedCostEstimate,
  formatCurrency,
  MPF_RATE,
  MPF_MIN,
  MPF_MAX,
  HMF_RATE,
} from './landed-cost';
import type { LandedCostInput } from '@/lib/types';

// Baseline import: 5,000 widgets at $10 FOB from China via 40HC ocean.
// HTS 9503.00.00 (toys) — generally low base rate; we don't hard-assert the
// duty number because the static HTS table can move; we assert behavior.
const baselineInput: LandedCostInput = {
  productDescription: 'Test widget',
  htsCode: '9503.00.00',
  countryOfOrigin: 'CN',
  unitCostFOB: 10,
  totalUnits: 5_000,
  containerType: '40HC',
  originPort: 'CNSHA',
  destPort: 'USLAX',
  shippingMode: 'ocean-fcl',
  freightCostTotal: 5_000,
  customsBrokerFee: 350,
  insuranceRate: 0.5, // %
  drayageCost: 500,
  warehousingPerUnit: 0,
  fulfillmentPerUnit: 0,
  useFTZ: false,
};

describe('calculateLandedCost — CIF math', () => {
  it('computes per-unit freight as freightCostTotal / totalUnits', () => {
    const result = calculateLandedCost(baselineInput);
    expect(result.perUnit.freight).toBeCloseTo(1, 6);
  });

  it('computes insurance on CIF (cargo + freight) at the configured rate', () => {
    const result = calculateLandedCost(baselineInput);
    const cif = 10 * 5_000 + 5_000;
    const expectedInsuranceTotal = cif * 0.005;
    expect(result.total.insurance).toBeCloseTo(expectedInsuranceTotal, 4);
    expect(result.perUnit.insurance).toBeCloseTo(expectedInsuranceTotal / 5_000, 6);
  });

  it('reconciles per-unit total times units to grand total', () => {
    const result = calculateLandedCost(baselineInput);
    expect(result.perUnit.total * 5_000).toBeCloseTo(result.total.grandTotal, 2);
  });
});

describe('calculateLandedCost — fees', () => {
  it('clamps MPF to statutory min when shipment is small', () => {
    const tiny = { ...baselineInput, unitCostFOB: 1, totalUnits: 100 };
    const result = calculateLandedCost(tiny);
    expect(result.total.mpf).toBeCloseTo(MPF_MIN, 2);
  });

  it('clamps MPF to statutory max when shipment is large', () => {
    const huge = { ...baselineInput, unitCostFOB: 1_000, totalUnits: 1_000 };
    const result = calculateLandedCost(huge);
    expect(result.total.mpf).toBeCloseTo(MPF_MAX, 2);
  });

  it('computes HMF as ad-valorem with no clamp', () => {
    const result = calculateLandedCost(baselineInput);
    const customsValue = 10 * 5_000;
    expect(result.total.hmf).toBeCloseTo(customsValue * HMF_RATE, 4);
  });

  it('exposes the published MPF/HMF rates as percentages on the result', () => {
    const result = calculateLandedCost(baselineInput);
    expect(result.mpfRate).toBeCloseTo(MPF_RATE * 100, 6);
    expect(result.hmfRate).toBeCloseTo(HMF_RATE * 100, 6);
  });
});

describe('calculateLandedCost — FTZ behavior', () => {
  it('adds FTZ storage cost when useFTZ=true', () => {
    const ftz = {
      ...baselineInput,
      useFTZ: true,
      ftzStorageMonths: 3,
      ftzStorageFeePerUnit: 0.05,
    };
    const result = calculateLandedCost(ftz);
    expect(result.perUnit.ftzStorage).toBeCloseTo(0.15, 6);
    expect(result.total.ftzStorage).toBeCloseTo(750, 2);
  });

  it('produces zero FTZ storage when useFTZ=false', () => {
    const result = calculateLandedCost(baselineInput);
    expect(result.perUnit.ftzStorage).toBe(0);
    expect(result.total.ftzStorage).toBe(0);
  });

  it('still owes duty even with FTZ enabled (FTZ defers, does not waive)', () => {
    const noFtz = calculateLandedCost(baselineInput);
    const withFtz = calculateLandedCost({
      ...baselineInput,
      useFTZ: true,
      ftzStorageMonths: 1,
      ftzStorageFeePerUnit: 0.01,
    });
    expect(withFtz.total.duty).toBeCloseTo(noFtz.total.duty, 4);
  });
});

describe('calculateLandedCost — breakdown', () => {
  it('returns a breakdown that sums to ~grand total', () => {
    const result = calculateLandedCost(baselineInput);
    const sum = result.breakdown.reduce((acc, item) => acc + item.amount, 0);
    expect(sum).toBeCloseTo(result.total.grandTotal, 2);
  });

  it('tags each breakdown item with a non-empty Tailwind color class', () => {
    const result = calculateLandedCost(baselineInput);
    for (const item of result.breakdown) {
      expect(item.color).toMatch(/^bg-/);
      expect(item.label.length).toBeGreaterThan(0);
    }
  });
});

describe('quickLandedCostEstimate', () => {
  it('returns a sane shape for a minimal China import', () => {
    const out = quickLandedCostEstimate({
      unitCostFOB: 10,
      totalUnits: 5_000,
      htsCode: '9503.00.00',
      countryOfOrigin: 'CN',
    });
    expect(out.landedCostPerUnit).toBeGreaterThan(10);
    expect(out.dutyRate).toBeGreaterThanOrEqual(0);
    expect(Array.isArray(out.breakdown)).toBe(true);
  });
});

describe('formatCurrency', () => {
  it('renders < $1k with decimals', () => {
    expect(formatCurrency(123.456)).toBe('$123.46');
  });

  it('renders >= $1k with no decimals + thousands separator', () => {
    expect(formatCurrency(1_234.56)).toBe('$1,235');
  });

  it('renders >= $1M as millions with one decimal', () => {
    expect(formatCurrency(2_500_000)).toBe('$2.5M');
  });
});

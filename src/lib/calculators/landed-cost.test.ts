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

// ─── AI-12014: Jones Act / domestic-lane customs suppression ───
//
// A mainland -> Hawaii move is not an import. Charging it duty, MPF, HMF
// and a broker fee is the exact bug Blake asked us to close: it makes a
// Jones Act rate look like international freight.

const jonesActInput: LandedCostInput = {
  ...baselineInput,
  countryOfOrigin: 'US',
  originPort: 'USLAX',
  destPort: 'USHNL',
  carrier: 'Matson',
};

describe('calculateLandedCost — Jones Act domestic lanes (AI-12014)', () => {
  it('classifies LA -> Honolulu as Jones Act with no customs entry', () => {
    const result = calculateLandedCost(jonesActInput);

    expect(result.customsEntryRequired).toBe(false);
    expect(result.lane.isJonesActLane).toBe(true);
    expect(result.lane.trade).toBe('hawaii');
    expect(result.lane.carrierIsJonesActQualified).toBe(true);
  });

  it('zeroes duty, MPF, HMF and the broker fee on a domestic lane', () => {
    const result = calculateLandedCost(jonesActInput);

    expect(result.total.duty).toBe(0);
    expect(result.total.mpf).toBe(0);
    expect(result.total.hmf).toBe(0);
    expect(result.total.customsBroker).toBe(0);
    expect(result.perUnit.dutyMPF).toBe(0);
    expect(result.perUnit.customsBroker).toBe(0);
    expect(result.effectiveDutyRate).toBe(0);
  });

  it('drops the duty and broker lines from the breakdown entirely', () => {
    const labels = calculateLandedCost(jonesActInput).breakdown.map((b) => b.label);

    expect(labels).not.toContain('Duty');
    expect(labels).not.toContain('MPF + HMF');
    expect(labels).not.toContain('Customs Broker');
    expect(labels).toContain('Ocean Freight');
  });

  it('lands cheaper than the same shipment treated as an import', () => {
    const domestic = calculateLandedCost(jonesActInput);
    const asImport = calculateLandedCost({ ...jonesActInput, destPort: 'USLAX', originPort: 'CNSHA' });

    expect(domestic.perUnit.total).toBeLessThan(asImport.perUnit.total);
  });

  it('still reconciles per-unit total against the grand total', () => {
    const result = calculateLandedCost(jonesActInput);
    expect(result.total.grandTotal).toBeCloseTo(result.perUnit.total * jonesActInput.totalUnits, 4);
  });

  it('keeps freight, insurance and drayage — only customs costs are removed', () => {
    const result = calculateLandedCost(jonesActInput);

    expect(result.total.freight).toBe(jonesActInput.freightCostTotal);
    expect(result.total.drayage).toBe(jonesActInput.drayageCost);
    expect(result.total.insurance).toBeGreaterThan(0);
  });

  it('warns when a foreign-flag carrier is quoted on a Jones Act lane', () => {
    const result = calculateLandedCost({ ...jonesActInput, carrier: 'Maersk' });

    expect(result.lane.carrierIsJonesActQualified).toBe(false);
    expect(result.lane.warnings.join(' ')).toMatch(/not a Jones Act qualified carrier/i);
  });

  it('still charges duty on a Guam lane — US soil, outside the customs territory', () => {
    const result = calculateLandedCost({
      ...jonesActInput,
      originPort: 'GUDTM',
      destPort: 'USLAX',
    });

    expect(result.lane.isJonesActLane).toBe(true);
    expect(result.customsEntryRequired).toBe(true);
    expect(result.total.mpf).toBeGreaterThan(0);
    expect(result.total.customsBroker).toBe(jonesActInput.customsBrokerFee);
  });

  it('leaves an ordinary import untouched', () => {
    const result = calculateLandedCost(baselineInput);

    expect(result.customsEntryRequired).toBe(true);
    expect(result.lane.isJonesActLane).toBe(false);
    expect(result.total.mpf).toBeGreaterThan(0);
    expect(result.total.customsBroker).toBe(baselineInput.customsBrokerFee);
  });

  it('honours domesticLaneOverride in both directions', () => {
    const forcedDomestic = calculateLandedCost({ ...baselineInput, domesticLaneOverride: true });
    expect(forcedDomestic.customsEntryRequired).toBe(false);
    expect(forcedDomestic.total.duty).toBe(0);

    const forcedImport = calculateLandedCost({ ...jonesActInput, domesticLaneOverride: false });
    expect(forcedImport.customsEntryRequired).toBe(true);
    expect(forcedImport.total.mpf).toBeGreaterThan(0);
  });
});

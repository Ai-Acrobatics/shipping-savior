/**
 * Unit tests for the realized-margin engine (AI-8869).
 *
 * The behaviours worth protecting, because getting any of them wrong makes
 * the profitability page confidently wrong rather than obviously broken:
 *   - COGS is charged on units SOLD, not units imported (partial sales)
 *   - unsold units stay on the balance sheet as inventory value
 *   - period rollups attribute revenue to the SALE date, not the arrival date
 *   - landed-cost allocation is value-weighted, and degrades to an even split
 *     rather than dividing by zero
 *   - margin % is null (not NaN, not 0) when nothing has sold
 */
import { describe, it, expect } from 'vitest';
import {
  allocateShipmentCost,
  computeLineMargins,
  findMarginAlerts,
  formatMarginPct,
  rollUpMargin,
  summarizeMargins,
  type MarginLineInput,
  type MarginSaleInput,
} from './margin';

// 1,000 units at $10 goods cost + $2,000 of freight/duty allocated to the line
// => fully-loaded unit cost of $12.
const line: MarginLineInput = {
  lineItemId: 'line-1',
  shipmentId: 'ship-1',
  sku: 'BANANA-40LB',
  description: 'Cavendish, 40lb carton',
  quantity: 1_000,
  unitCostUsd: 10,
  allocatedLandedCostUsd: 2_000,
  lane: 'ECGYE → USPHL',
};

describe('computeLineMargins', () => {
  it('derives a fully-loaded unit cost from goods + allocated cost + overhead', () => {
    const [margin] = computeLineMargins(
      [{ ...line, allocatedOverheadUsd: 1_000 }],
      []
    );
    expect(margin.unitLandedCostUsd).toBeCloseTo(13, 6);
  });

  it('charges COGS on units sold, not units imported', () => {
    const sales: MarginSaleInput[] = [
      { lineItemId: 'line-1', quantitySold: 400, unitSalePriceUsd: 18, saleDate: '2026-05-10' },
    ];
    const [margin] = computeLineMargins([line], sales);

    expect(margin.quantitySold).toBe(400);
    expect(margin.revenueUsd).toBeCloseTo(7_200, 2);
    // 400 units × $12 fully-loaded — NOT the full $12,000 of container cost.
    expect(margin.cogsUsd).toBeCloseTo(4_800, 2);
    expect(margin.grossMarginUsd).toBeCloseTo(2_400, 2);
    expect(margin.marginPct).toBeCloseTo(2_400 / 7_200, 6);
  });

  it('leaves the unsold remainder on the balance sheet', () => {
    const [margin] = computeLineMargins(
      [line],
      [{ lineItemId: 'line-1', quantitySold: 400, unitSalePriceUsd: 18, saleDate: '2026-05-10' }]
    );
    expect(margin.quantityOnHand).toBe(600);
    expect(margin.inventoryValueUsd).toBeCloseTo(7_200, 2);
  });

  it('aggregates multiple partial sales at different prices', () => {
    const sales: MarginSaleInput[] = [
      { lineItemId: 'line-1', quantitySold: 300, unitSalePriceUsd: 20, saleDate: '2026-05-01' },
      { lineItemId: 'line-1', quantitySold: 200, unitSalePriceUsd: 15, saleDate: '2026-06-01' },
    ];
    const [margin] = computeLineMargins([line], sales);
    expect(margin.quantitySold).toBe(500);
    expect(margin.revenueUsd).toBeCloseTo(300 * 20 + 200 * 15, 2);
    expect(margin.cogsUsd).toBeCloseTo(500 * 12, 2);
    expect(margin.firstSaleDate?.toISOString().slice(0, 10)).toBe('2026-05-01');
    expect(margin.lastSaleDate?.toISOString().slice(0, 10)).toBe('2026-06-01');
  });

  it('reports margin % as null rather than NaN when nothing has sold', () => {
    const [margin] = computeLineMargins([line], []);
    expect(margin.marginPct).toBeNull();
    expect(margin.revenueUsd).toBe(0);
    expect(margin.inventoryValueUsd).toBeCloseTo(12_000, 2);
  });

  it('survives a zero-quantity line without dividing by zero', () => {
    const [margin] = computeLineMargins([{ ...line, quantity: 0 }], []);
    expect(margin.unitLandedCostUsd).toBe(0);
    expect(Number.isNaN(margin.unitLandedCostUsd)).toBe(false);
  });

  it('reports a negative margin when the sale price is under landed cost', () => {
    const [margin] = computeLineMargins(
      [line],
      [{ lineItemId: 'line-1', quantitySold: 100, unitSalePriceUsd: 9, saleDate: '2026-05-10' }]
    );
    expect(margin.grossMarginUsd).toBeCloseTo(100 * 9 - 100 * 12, 2);
    expect(margin.grossMarginUsd).toBeLessThan(0);
  });

  it('ignores sales pointing at a line item that is not in the input set', () => {
    const [margin] = computeLineMargins(
      [line],
      [{ lineItemId: 'other-line', quantitySold: 999, unitSalePriceUsd: 50, saleDate: '2026-05-10' }]
    );
    expect(margin.quantitySold).toBe(0);
  });
});

describe('rollUpMargin — period dimensions', () => {
  const lines: MarginLineInput[] = [
    line,
    { ...line, lineItemId: 'line-2', sku: 'MANGO-20LB', lane: 'PECLL → USLAX', unitCostUsd: 8, allocatedLandedCostUsd: 4_000 },
  ];
  const sales: MarginSaleInput[] = [
    { lineItemId: 'line-1', quantitySold: 200, unitSalePriceUsd: 20, saleDate: '2026-03-15' },
    { lineItemId: 'line-1', quantitySold: 300, unitSalePriceUsd: 14, saleDate: '2026-05-02' },
    { lineItemId: 'line-2', quantitySold: 100, unitSalePriceUsd: 25, saleDate: '2026-05-20' },
  ];
  const margins = computeLineMargins(lines, sales);

  it('attributes revenue to the sale month, not the arrival month', () => {
    const buckets = rollUpMargin(margins, 'month', sales);
    expect(buckets.map((b) => b.key)).toEqual(['2026-03', '2026-05']);
    expect(buckets[0].revenueUsd).toBeCloseTo(200 * 20, 2);
    expect(buckets[1].revenueUsd).toBeCloseTo(300 * 14 + 100 * 25, 2);
  });

  it('shows margin compressing across months as the sale price drops', () => {
    const buckets = rollUpMargin(margins, 'month', sales);
    // March sold at $20 against a $12 cost; May at $14 against the same cost.
    expect(buckets[0].marginPct!).toBeGreaterThan(buckets[1].marginPct!);
  });

  it('buckets by quarter as well as by month', () => {
    const buckets = rollUpMargin(margins, 'quarter', sales);
    expect(buckets.map((b) => b.key)).toEqual(['2026-Q1', '2026-Q2']);
  });

  it('returns no period buckets when nothing has sold', () => {
    expect(rollUpMargin(computeLineMargins(lines, []), 'month', [])).toEqual([]);
  });
});

describe('rollUpMargin — categorical dimensions', () => {
  const lines: MarginLineInput[] = [
    line,
    { ...line, lineItemId: 'line-2', sku: 'MANGO-20LB', lane: 'PECLL → USLAX' },
    { ...line, lineItemId: 'line-3', sku: null, lane: null },
  ];
  const sales: MarginSaleInput[] = [
    { lineItemId: 'line-1', quantitySold: 500, unitSalePriceUsd: 20, saleDate: '2026-05-01' },
    { lineItemId: 'line-2', quantitySold: 100, unitSalePriceUsd: 13, saleDate: '2026-05-01' },
  ];
  const margins = computeLineMargins(lines, sales);

  it('keeps unsold lines visible instead of dropping them', () => {
    const buckets = rollUpMargin(margins, 'sku', sales);
    const keys = buckets.map((b) => b.key);
    expect(keys).toContain('BANANA-40LB');
    expect(keys).toContain('MANGO-20LB');
    expect(keys).toContain('(unassigned)');
  });

  it('sorts categorical buckets biggest-contributor first', () => {
    const buckets = rollUpMargin(margins, 'sku', sales);
    for (let i = 1; i < buckets.length; i++) {
      expect(buckets[i - 1].grossMarginUsd).toBeGreaterThanOrEqual(buckets[i].grossMarginUsd);
    }
  });

  it('rolls up by lane', () => {
    const buckets = rollUpMargin(margins, 'lane', sales);
    expect(buckets.find((b) => b.key === 'ECGYE → USPHL')?.unitsSold).toBe(500);
  });
});

describe('summarizeMargins', () => {
  it('totals revenue, COGS and inventory across every line', () => {
    const margins = computeLineMargins(
      [line, { ...line, lineItemId: 'line-2' }],
      [{ lineItemId: 'line-1', quantitySold: 500, unitSalePriceUsd: 20, saleDate: '2026-05-01' }]
    );
    const totals = summarizeMargins(margins);
    expect(totals.revenueUsd).toBeCloseTo(10_000, 2);
    expect(totals.cogsUsd).toBeCloseTo(6_000, 2);
    expect(totals.grossMarginUsd).toBeCloseTo(4_000, 2);
    expect(totals.linesTracked).toBe(2);
    expect(totals.linesWithSales).toBe(1);
    // 500 unsold on line-1 + all 1,000 on line-2, at $12 each.
    expect(totals.inventoryValueUsd).toBeCloseTo(500 * 12 + 1_000 * 12, 2);
  });
});

describe('findMarginAlerts', () => {
  const margins = computeLineMargins(
    [line, { ...line, lineItemId: 'line-2', sku: 'MANGO-20LB' }],
    [
      { lineItemId: 'line-1', quantitySold: 100, unitSalePriceUsd: 20, saleDate: '2026-05-01' },
      { lineItemId: 'line-2', quantitySold: 100, unitSalePriceUsd: 12.5, saleDate: '2026-05-01' },
    ]
  );

  it('flags only the buckets under the threshold', () => {
    const buckets = rollUpMargin(margins, 'sku', []);
    const alerts = findMarginAlerts(buckets, 'sku', 0.2);
    expect(alerts.map((a) => a.key)).toEqual(['MANGO-20LB']);
    expect(alerts[0].marginPct).toBeLessThan(0.2);
  });

  it('does not fire on unsold inventory — zero revenue is not a margin problem', () => {
    const unsold = computeLineMargins([line], []);
    const buckets = rollUpMargin(unsold, 'sku', []);
    expect(findMarginAlerts(buckets, 'sku', 0.9)).toEqual([]);
  });
});

describe('allocateShipmentCost', () => {
  it('spreads cost by goods value, not evenly', () => {
    const allocation = allocateShipmentCost(
      [
        { lineItemId: 'a', quantity: 100, unitCostUsd: 30 }, // $3,000 — 75%
        { lineItemId: 'b', quantity: 100, unitCostUsd: 10 }, // $1,000 — 25%
      ],
      4_000
    );
    expect(allocation.a).toBeCloseTo(3_000, 2);
    expect(allocation.b).toBeCloseTo(1_000, 2);
  });

  it('conserves the total being allocated', () => {
    const allocation = allocateShipmentCost(
      [
        { lineItemId: 'a', quantity: 7, unitCostUsd: 13.37 },
        { lineItemId: 'b', quantity: 11, unitCostUsd: 4.21 },
        { lineItemId: 'c', quantity: 3, unitCostUsd: 99.99 },
      ],
      1_234.56
    );
    const sum = Object.values(allocation).reduce((s, v) => s + v, 0);
    // Rounded to cents per line, so allow a couple of cents of drift.
    expect(sum).toBeCloseTo(1_234.56, 1);
  });

  it('falls back to an even split when every line has zero goods value', () => {
    const allocation = allocateShipmentCost(
      [
        { lineItemId: 'a', quantity: 0, unitCostUsd: 0 },
        { lineItemId: 'b', quantity: 10, unitCostUsd: 0 },
      ],
      1_000
    );
    expect(allocation.a).toBeCloseTo(500, 2);
    expect(allocation.b).toBeCloseTo(500, 2);
  });

  it('returns an empty allocation for a shipment with no lines', () => {
    expect(allocateShipmentCost([], 5_000)).toEqual({});
  });
});

describe('formatMarginPct', () => {
  it('renders an em dash for null rather than "NaN%"', () => {
    expect(formatMarginPct(null)).toBe('—');
    expect(formatMarginPct(0.3333)).toBe('33.3%');
    expect(formatMarginPct(-0.05)).toBe('-5.0%');
  });
});

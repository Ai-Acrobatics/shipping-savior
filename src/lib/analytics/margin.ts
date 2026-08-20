// ============================================================
// Realized-margin engine
// AI-8869 (Blake feature ask, sub-feature C)
//
// Turns line items + landed cost + sale records into realized margin, then
// rolls it up by month / SKU / lane so a customer can answer the question
// Blake's banana company never could: "are these bookings still profitable?"
//
// Pure functions over plain rows — the API layer does the DB work and hands
// the shapes below in, which keeps the maths unit-testable and lets the same
// code run client-side for what-if scenarios.
// ============================================================

/** Cost-side row: one SKU on one shipment. */
export interface MarginLineInput {
  lineItemId: string;
  shipmentId: string | null;
  sku: string | null;
  description: string | null;
  htsCode?: string | null;
  /** Units imported on this line. */
  quantity: number;
  /** Ex-works / FOB unit cost of the goods. */
  unitCostUsd: number;
  /**
   * Share of the shipment's non-goods landed cost allocated to this line
   * (freight, duty, fees, drayage...). Total for the line, not per unit.
   */
  allocatedLandedCostUsd?: number;
  /** Overhead allocated to this line, total. */
  allocatedOverheadUsd?: number;
  /** Lane label, e.g. "CNSHA → USLAX". */
  lane?: string | null;
  /** Date the margin should be attributed to when no sales exist. */
  arrivedAt?: Date | string | null;
}

/** Revenue-side row: one sale against a line item. */
export interface MarginSaleInput {
  lineItemId: string;
  quantitySold: number;
  unitSalePriceUsd: number;
  saleDate: Date | string;
}

export interface LineMargin {
  lineItemId: string;
  shipmentId: string | null;
  sku: string | null;
  description: string | null;
  lane: string | null;
  quantity: number;
  quantitySold: number;
  /** quantity - quantitySold, floored at 0. */
  quantityOnHand: number;
  /** Fully-loaded cost per unit: goods + allocated landed cost + overhead. */
  unitLandedCostUsd: number;
  /** Revenue actually booked on this line. */
  revenueUsd: number;
  /** Cost of the units actually sold (COGS), at the fully-loaded unit cost. */
  cogsUsd: number;
  /** revenue - cogs. */
  grossMarginUsd: number;
  /** grossMargin / revenue, or null when nothing has been sold yet. */
  marginPct: number | null;
  /** Capital still sitting in unsold inventory at fully-loaded cost. */
  inventoryValueUsd: number;
  /** Earliest sale date, used for period bucketing. */
  firstSaleDate: Date | null;
  lastSaleDate: Date | null;
}

const toDate = (value: Date | string | null | undefined): Date | null => {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

const round2 = (n: number) => Math.round(n * 100) / 100;

/**
 * Compute realized margin per line item.
 *
 * COGS is charged at the fully-loaded unit cost against *units sold*, not
 * units imported — selling half a container does not let you book the whole
 * container's freight against it. The unsold remainder stays on the balance
 * sheet as `inventoryValueUsd`.
 */
export function computeLineMargins(
  lines: MarginLineInput[],
  sales: MarginSaleInput[]
): LineMargin[] {
  const salesByLine = new Map<string, MarginSaleInput[]>();
  for (const sale of sales) {
    const bucket = salesByLine.get(sale.lineItemId);
    if (bucket) bucket.push(sale);
    else salesByLine.set(sale.lineItemId, [sale]);
  }

  return lines.map((line) => {
    const lineSales = salesByLine.get(line.lineItemId) ?? [];
    const quantity = Math.max(line.quantity, 0);

    const totalGoodsCost = line.unitCostUsd * quantity;
    const totalCost =
      totalGoodsCost + (line.allocatedLandedCostUsd ?? 0) + (line.allocatedOverheadUsd ?? 0);
    // Guard the divide: a zero-quantity line has no per-unit cost to speak of.
    const unitLandedCostUsd = quantity > 0 ? totalCost / quantity : 0;

    const quantitySold = lineSales.reduce((sum, s) => sum + Math.max(s.quantitySold, 0), 0);
    const revenueUsd = lineSales.reduce(
      (sum, s) => sum + Math.max(s.quantitySold, 0) * s.unitSalePriceUsd,
      0
    );
    const cogsUsd = quantitySold * unitLandedCostUsd;
    const grossMarginUsd = revenueUsd - cogsUsd;
    const quantityOnHand = Math.max(quantity - quantitySold, 0);

    const saleDates = lineSales
      .map((s) => toDate(s.saleDate))
      .filter((d): d is Date => d !== null)
      .sort((a, b) => a.getTime() - b.getTime());

    return {
      lineItemId: line.lineItemId,
      shipmentId: line.shipmentId,
      sku: line.sku,
      description: line.description,
      lane: line.lane ?? null,
      quantity,
      quantitySold,
      quantityOnHand,
      unitLandedCostUsd: round2(unitLandedCostUsd),
      revenueUsd: round2(revenueUsd),
      cogsUsd: round2(cogsUsd),
      grossMarginUsd: round2(grossMarginUsd),
      marginPct: revenueUsd > 0 ? grossMarginUsd / revenueUsd : null,
      inventoryValueUsd: round2(quantityOnHand * unitLandedCostUsd),
      firstSaleDate: saleDates[0] ?? null,
      lastSaleDate: saleDates[saleDates.length - 1] ?? null,
    };
  });
}

export type RollupDimension = 'month' | 'quarter' | 'sku' | 'lane';

export interface MarginBucket {
  key: string;
  label: string;
  revenueUsd: number;
  cogsUsd: number;
  grossMarginUsd: number;
  marginPct: number | null;
  unitsSold: number;
  lineCount: number;
}

const monthKey = (d: Date) => `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
const quarterKey = (d: Date) => `${d.getUTCFullYear()}-Q${Math.floor(d.getUTCMonth() / 3) + 1}`;

/**
 * Roll realized margin up along one dimension.
 *
 * Period rollups (`month`/`quarter`) attribute revenue to the *sale* date, so
 * a container that lands in March and sells in May shows up in May — which is
 * the only attribution that answers "is this lane still profitable now".
 * Lines with no sales are excluded from period buckets (nothing realized yet)
 * but still appear in `sku`/`lane` buckets with zero revenue so unsold
 * inventory is visible rather than silently dropped.
 */
export function rollUpMargin(
  margins: LineMargin[],
  dimension: RollupDimension,
  sales: MarginSaleInput[] = []
): MarginBucket[] {
  const buckets = new Map<string, MarginBucket & { lines: Set<string> }>();

  const ensure = (key: string, label: string) => {
    let bucket = buckets.get(key);
    if (!bucket) {
      bucket = {
        key,
        label,
        revenueUsd: 0,
        cogsUsd: 0,
        grossMarginUsd: 0,
        marginPct: null,
        unitsSold: 0,
        lineCount: 0,
        lines: new Set<string>(),
      };
      buckets.set(key, bucket);
    }
    return bucket;
  };

  if (dimension === 'month' || dimension === 'quarter') {
    const keyFor = dimension === 'month' ? monthKey : quarterKey;
    const marginById = new Map(margins.map((m) => [m.lineItemId, m]));

    for (const sale of sales) {
      const margin = marginById.get(sale.lineItemId);
      const date = toDate(sale.saleDate);
      if (!margin || !date) continue;

      const key = keyFor(date);
      const bucket = ensure(key, key);
      const units = Math.max(sale.quantitySold, 0);
      const revenue = units * sale.unitSalePriceUsd;
      const cogs = units * margin.unitLandedCostUsd;

      bucket.revenueUsd += revenue;
      bucket.cogsUsd += cogs;
      bucket.unitsSold += units;
      bucket.lines.add(margin.lineItemId);
    }
  } else {
    for (const margin of margins) {
      const raw = dimension === 'sku' ? margin.sku : margin.lane;
      const key = raw && raw.trim() ? raw.trim() : '(unassigned)';
      const bucket = ensure(key, key);

      bucket.revenueUsd += margin.revenueUsd;
      bucket.cogsUsd += margin.cogsUsd;
      bucket.unitsSold += margin.quantitySold;
      bucket.lines.add(margin.lineItemId);
    }
  }

  const result = Array.from(buckets.values()).map((b) => {
    const grossMarginUsd = b.revenueUsd - b.cogsUsd;
    return {
      key: b.key,
      label: b.label,
      revenueUsd: round2(b.revenueUsd),
      cogsUsd: round2(b.cogsUsd),
      grossMarginUsd: round2(grossMarginUsd),
      marginPct: b.revenueUsd > 0 ? grossMarginUsd / b.revenueUsd : null,
      unitsSold: b.unitsSold,
      lineCount: b.lines.size,
    };
  });

  // Period buckets read left-to-right in time; categorical buckets read
  // biggest-contributor first.
  return dimension === 'month' || dimension === 'quarter'
    ? result.sort((a, b) => a.key.localeCompare(b.key))
    : result.sort((a, b) => b.grossMarginUsd - a.grossMarginUsd);
}

export interface MarginTotals {
  revenueUsd: number;
  cogsUsd: number;
  grossMarginUsd: number;
  marginPct: number | null;
  unitsSold: number;
  inventoryValueUsd: number;
  linesTracked: number;
  linesWithSales: number;
}

export function summarizeMargins(margins: LineMargin[]): MarginTotals {
  const revenueUsd = margins.reduce((s, m) => s + m.revenueUsd, 0);
  const cogsUsd = margins.reduce((s, m) => s + m.cogsUsd, 0);
  const grossMarginUsd = revenueUsd - cogsUsd;
  return {
    revenueUsd: round2(revenueUsd),
    cogsUsd: round2(cogsUsd),
    grossMarginUsd: round2(grossMarginUsd),
    marginPct: revenueUsd > 0 ? grossMarginUsd / revenueUsd : null,
    unitsSold: margins.reduce((s, m) => s + m.quantitySold, 0),
    inventoryValueUsd: round2(margins.reduce((s, m) => s + m.inventoryValueUsd, 0)),
    linesTracked: margins.length,
    linesWithSales: margins.filter((m) => m.quantitySold > 0).length,
  };
}

export interface MarginAlert {
  key: string;
  label: string;
  dimension: RollupDimension;
  marginPct: number;
  thresholdPct: number;
  revenueUsd: number;
  grossMarginUsd: number;
}

/**
 * Flag buckets whose realized margin has fallen below `thresholdPct` (0–1).
 * Buckets with no revenue are skipped — an unsold SKU is not a margin problem
 * yet, and firing on it would bury the real signal.
 */
export function findMarginAlerts(
  buckets: MarginBucket[],
  dimension: RollupDimension,
  thresholdPct: number
): MarginAlert[] {
  return buckets
    .filter((b) => b.revenueUsd > 0 && b.marginPct !== null && b.marginPct < thresholdPct)
    .map((b) => ({
      key: b.key,
      label: b.label,
      dimension,
      marginPct: b.marginPct as number,
      thresholdPct,
      revenueUsd: b.revenueUsd,
      grossMarginUsd: b.grossMarginUsd,
    }))
    .sort((a, b) => a.marginPct - b.marginPct);
}

/**
 * Spread a shipment's non-goods landed cost across its line items by goods
 * value. Value-weighted rather than per-unit because freight and duty scale
 * with what the cargo is worth far more than with how many pieces there are —
 * and duty literally is ad valorem.
 *
 * Falls back to an even split when every line has zero goods value, so a
 * mis-keyed cost sheet degrades to "roughly right" instead of dividing by zero.
 */
export function allocateShipmentCost(
  lines: Array<{ lineItemId: string; quantity: number; unitCostUsd: number }>,
  shipmentNonGoodsCostUsd: number
): Record<string, number> {
  if (lines.length === 0) return {};
  const values = lines.map((l) => Math.max(l.quantity, 0) * Math.max(l.unitCostUsd, 0));
  const totalValue = values.reduce((s, v) => s + v, 0);

  const allocation: Record<string, number> = {};
  lines.forEach((line, i) => {
    const share = totalValue > 0 ? values[i] / totalValue : 1 / lines.length;
    allocation[line.lineItemId] = round2(shipmentNonGoodsCostUsd * share);
  });
  return allocation;
}

export function formatMarginPct(pct: number | null): string {
  if (pct === null) return '—';
  return `${(pct * 100).toFixed(1)}%`;
}

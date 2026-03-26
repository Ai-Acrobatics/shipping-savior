// ============================================================
// Landed Cost Calculator
// Phase 2: Core Calculators
//
// Computes complete landed cost per unit:
//   FOB + freight + insurance + duty + MPF + HMF
//   + customs broker + drayage + warehousing + fulfillment
//   + optional FTZ storage
// ============================================================

import type {
  LandedCostInput,
  LandedCostResult,
  CostBreakdownItem,
} from "@/lib/types";
import { getEffectiveDutyRate } from "@/lib/data/hts-tariffs";

// ─── US CBP Fee Constants (current as of 2024) ────────────
export const MPF_RATE = 0.003464;    // Merchandise Processing Fee: 0.3464%
export const MPF_MIN = 31.67;        // Min MPF per entry (USD)
export const MPF_MAX = 614.35;       // Max MPF per entry (USD)
export const HMF_RATE = 0.00125;     // Harbor Maintenance Fee: 0.125%

// Colors for cost breakdown chart
const COST_COLORS: Record<string, string> = {
  "FOB Unit Cost":    "bg-ocean-600",
  "Ocean Freight":    "bg-ocean-500",
  "Insurance":        "bg-ocean-400",
  "Duty":             "bg-cargo-600",
  "MPF + HMF":        "bg-cargo-500",
  "Customs Broker":   "bg-cargo-400",
  "Drayage":          "bg-purple-600",
  "Warehousing":      "bg-purple-500",
  "Fulfillment":      "bg-purple-400",
  "FTZ Storage":      "bg-green-600",
};

/**
 * Calculate complete landed cost for an import shipment
 */
export function calculateLandedCost(input: LandedCostInput): LandedCostResult {
  const {
    unitCostFOB,
    totalUnits,
    htsCode,
    countryOfOrigin,
    freightCostTotal,
    customsBrokerFee,
    insuranceRate,
    drayageCost,
    warehousingPerUnit = 0,
    fulfillmentPerUnit = 0,
    useFTZ,
    ftzStorageMonths = 0,
    ftzStorageFeePerUnit = 0,
  } = input;

  // ─── Cargo Value (CIF basis for insurance) ─────────────
  const cargoValueTotal = unitCostFOB * totalUnits;
  const freightPerUnit = freightCostTotal / totalUnits;

  // ─── Insurance ─────────────────────────────────────────
  // Calculated on CIF (cargo + insurance + freight) value
  const cifValue = cargoValueTotal + freightCostTotal;
  const insuranceTotal = cifValue * (insuranceRate / 100);
  const insurancePerUnit = insuranceTotal / totalUnits;

  // ─── Duty ──────────────────────────────────────────────
  // Duty is assessed on the declared customs value (usually CIF in US)
  const customsValue = cargoValueTotal; // US uses FOB value for most HTS
  const { effective: effectiveDutyRate } = getEffectiveDutyRate(htsCode, countryOfOrigin);
  const dutyTotal = customsValue * (effectiveDutyRate / 100);
  const dutyPerUnit = dutyTotal / totalUnits;

  // ─── MPF & HMF ─────────────────────────────────────────
  let mpfTotal = customsValue * MPF_RATE;
  mpfTotal = Math.max(MPF_MIN, Math.min(MPF_MAX, mpfTotal));
  const hmfTotal = customsValue * HMF_RATE;
  const mpfPerUnit = mpfTotal / totalUnits;
  const hmfPerUnit = hmfTotal / totalUnits;

  // ─── Customs Broker ────────────────────────────────────
  const customsBrokerPerUnit = customsBrokerFee / totalUnits;

  // ─── Drayage ───────────────────────────────────────────
  const drayagePerUnit = drayageCost / totalUnits;

  // ─── FTZ Storage ───────────────────────────────────────
  const ftzStoragePerUnit = useFTZ
    ? ftzStorageFeePerUnit * ftzStorageMonths
    : 0;
  const ftzStorageTotal = ftzStoragePerUnit * totalUnits;

  // ─── Total Per Unit ────────────────────────────────────
  const totalPerUnit =
    unitCostFOB +
    freightPerUnit +
    insurancePerUnit +
    dutyPerUnit +
    mpfPerUnit +
    hmfPerUnit +
    customsBrokerPerUnit +
    drayagePerUnit +
    warehousingPerUnit +
    fulfillmentPerUnit +
    ftzStoragePerUnit;

  // ─── Grand Total ───────────────────────────────────────
  const grandTotal = totalPerUnit * totalUnits;

  // ─── Breakdown Items ────────────────────────────────────
  const totalCostForPct = grandTotal;

  const breakdownItems: Array<{ label: string; amount: number; perUnit: number }> = [
    { label: "FOB Unit Cost",    amount: cargoValueTotal,          perUnit: unitCostFOB },
    { label: "Ocean Freight",    amount: freightCostTotal,          perUnit: freightPerUnit },
    { label: "Insurance",        amount: insuranceTotal,            perUnit: insurancePerUnit },
    { label: "Duty",             amount: dutyTotal,                 perUnit: dutyPerUnit },
    { label: "MPF + HMF",        amount: mpfTotal + hmfTotal,       perUnit: mpfPerUnit + hmfPerUnit },
    { label: "Customs Broker",   amount: customsBrokerFee,          perUnit: customsBrokerPerUnit },
    { label: "Drayage",          amount: drayageCost,               perUnit: drayagePerUnit },
    { label: "Warehousing",      amount: warehousingPerUnit * totalUnits, perUnit: warehousingPerUnit },
    { label: "Fulfillment",      amount: fulfillmentPerUnit * totalUnits, perUnit: fulfillmentPerUnit },
    ...(useFTZ ? [{ label: "FTZ Storage", amount: ftzStorageTotal, perUnit: ftzStoragePerUnit }] : []),
  ].filter((item) => item.amount > 0);

  const breakdown: CostBreakdownItem[] = breakdownItems.map((item) => ({
    ...item,
    pct: (item.amount / totalCostForPct) * 100,
    color: COST_COLORS[item.label] ?? "bg-navy-500",
  }));

  return {
    perUnit: {
      fob: unitCostFOB,
      freight: freightPerUnit,
      insurance: insurancePerUnit,
      dutyMPF: dutyPerUnit + mpfPerUnit + hmfPerUnit,
      customsBroker: customsBrokerPerUnit,
      drayage: drayagePerUnit,
      warehousing: warehousingPerUnit,
      fulfillment: fulfillmentPerUnit,
      ftzStorage: ftzStoragePerUnit,
      total: totalPerUnit,
    },
    total: {
      cargoValue: cargoValueTotal,
      freight: freightCostTotal,
      insurance: insuranceTotal,
      duty: dutyTotal,
      mpf: mpfTotal,
      hmf: hmfTotal,
      customsBroker: customsBrokerFee,
      drayage: drayageCost,
      warehousing: warehousingPerUnit * totalUnits,
      fulfillment: fulfillmentPerUnit * totalUnits,
      ftzStorage: ftzStorageTotal,
      grandTotal,
    },
    effectiveDutyRate: (dutyTotal / cargoValueTotal) * 100,
    dutyRate: effectiveDutyRate,
    mpfRate: MPF_RATE * 100,
    hmfRate: HMF_RATE * 100,
    breakdown,
  };
}

/**
 * Quick landed cost estimate from minimal inputs
 * Uses typical market defaults for missing values
 */
export function quickLandedCostEstimate(params: {
  unitCostFOB: number;
  totalUnits: number;
  htsCode: string;
  countryOfOrigin: import("@/lib/types").CountryCode;
  containerCostTotal?: number;
}): { landedCostPerUnit: number; dutyRate: number; breakdown: CostBreakdownItem[] } {
  const {
    unitCostFOB,
    totalUnits,
    htsCode,
    countryOfOrigin,
    containerCostTotal = 5000,
  } = params;

  const result = calculateLandedCost({
    productDescription: "Quick estimate",
    htsCode,
    countryOfOrigin,
    unitCostFOB,
    totalUnits,
    containerType: "40HC",
    originPort: "CNSHA",
    destPort: "USLAX",
    shippingMode: "ocean-fcl",
    freightCostTotal: containerCostTotal,
    customsBrokerFee: 350,
    insuranceRate: 0.5,
    drayageCost: 500,
    warehousingPerUnit: 0,
    fulfillmentPerUnit: 0,
    useFTZ: false,
  });

  return {
    landedCostPerUnit: result.perUnit.total,
    dutyRate: result.dutyRate,
    breakdown: result.breakdown,
  };
}

/**
 * Format a currency value for display
 */
export function formatCurrency(value: number, decimals = 2): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `$${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  }
  return `$${value.toFixed(decimals)}`;
}

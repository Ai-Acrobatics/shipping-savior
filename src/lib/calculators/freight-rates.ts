// ============================================================
// Freight Rate Calculators
// Phase 2: Core Calculators
//
// Ocean freight, air freight, and ground freight rate estimation.
// Uses market benchmark rates (not live API — live rates in Phase 6).
// ============================================================

import type {
  ContainerType,
  OceanFreightInput,
  AirFreightInput,
  GroundFreightInput,
} from "@/lib/types";
import { REFERENCE_FREIGHT_RATES } from "@/lib/data/containers";

// ─── Ocean Freight Surcharge Constants ────────────────────

export const OCEAN_SURCHARGES = {
  BAF: {
    code: "BAF",
    name: "Bunker Adjustment Factor",
    description: "Fuel cost surcharge",
    typical: { min: 150, max: 600 },
  },
  CAF: {
    code: "CAF",
    name: "Currency Adjustment Factor",
    description: "Exchange rate adjustment",
    typical: { min: 50, max: 250 },
  },
  ISPS: {
    code: "ISPS",
    name: "International Ship & Port Security",
    description: "Security fee mandated by IMO",
    typical: { min: 15, max: 45 },
  },
  DOC: {
    code: "DOC",
    name: "Documentation Fee",
    description: "B/L issuance and processing",
    typical: { min: 50, max: 150 },
  },
  AMS: {
    code: "AMS",
    name: "Automated Manifest System",
    description: "US Customs filing fee",
    typical: { min: 25, max: 75 },
  },
  ISF: {
    code: "ISF",
    name: "Importer Security Filing",
    description: "10+2 filing fee (required for US imports)",
    typical: { min: 35, max: 100 },
  },
  DTHC: {
    code: "DTHC",
    name: "Destination Terminal Handling",
    description: "Port handling charges at destination",
    typical: { min: 200, max: 450 },
  },
  OTHC: {
    code: "OTHC",
    name: "Origin Terminal Handling",
    description: "Port handling charges at origin",
    typical: { min: 150, max: 300 },
  },
};

// ─── Trade Lane Multipliers ───────────────────────────────
// Multiplier vs base Asia-USWC rate

export const TRADE_LANE_MULTIPLIERS: Record<string, {
  label: string;
  transitDays: { min: number; max: number };
  multiplier: number;
}> = {
  "CN-USWC": {
    label: "China → US West Coast",
    transitDays: { min: 14, max: 21 },
    multiplier: 1.0,
  },
  "CN-USEC": {
    label: "China → US East Coast",
    transitDays: { min: 28, max: 35 },
    multiplier: 1.85,
  },
  "VN-USWC": {
    label: "Vietnam → US West Coast",
    transitDays: { min: 16, max: 23 },
    multiplier: 1.1,
  },
  "VN-USEC": {
    label: "Vietnam → US East Coast",
    transitDays: { min: 28, max: 38 },
    multiplier: 1.95,
  },
  "TH-USWC": {
    label: "Thailand → US West Coast",
    transitDays: { min: 18, max: 25 },
    multiplier: 1.15,
  },
  "ID-USWC": {
    label: "Indonesia → US West Coast",
    transitDays: { min: 18, max: 26 },
    multiplier: 1.2,
  },
  "KH-USWC": {
    label: "Cambodia → US West Coast",
    transitDays: { min: 20, max: 30 },
    multiplier: 1.25,
  },
  "CN-EUR": {
    label: "China → North Europe",
    transitDays: { min: 25, max: 35 },
    multiplier: 1.7,
  },
};

export interface OceanFreightResult {
  baseRate: number;
  surcharges: Array<{ name: string; code: string; amount: number }>;
  totalFreight: number;
  perTEU: number;
  transitDays: { min: number; max: number };
  tradeLane: string;
  notes: string[];
}

/**
 * Estimate ocean freight cost for a given container and route
 */
export function estimateOceanFreight(
  originCountry: string,
  destRegion: "USWC" | "USEC",
  containerType: ContainerType,
  options: {
    includeBAF?: boolean;
    includeCAF?: boolean;
    includeISPS?: boolean;
    includeDocFee?: boolean;
    includeDTHC?: boolean;
    includeOTHC?: boolean;
    includeISF?: boolean;
    includeAMS?: boolean;
  } = {}
): OceanFreightResult {
  const {
    includeBAF = true,
    includeCAF = false,
    includeISPS = true,
    includeDocFee = true,
    includeDTHC = true,
    includeOTHC = false,
    includeISF = true,
    includeAMS = true,
  } = options;

  // Base rate
  const baseRates = REFERENCE_FREIGHT_RATES[containerType];
  const tradeLaneKey = `${originCountry}-${destRegion}`;
  const tradeLane = TRADE_LANE_MULTIPLIERS[tradeLaneKey] ??
    TRADE_LANE_MULTIPLIERS["CN-USWC"]!;

  const baseRate =
    destRegion === "USEC"
      ? baseRates.asiaUsEastCoast * (tradeLane.multiplier / 1.85)
      : baseRates.asiaUsWestCoast * tradeLane.multiplier;

  const surcharges: Array<{ name: string; code: string; amount: number }> = [];
  const notes: string[] = [];

  // Add surcharges at midpoint of typical range
  if (includeBAF) {
    const amt = Math.round((OCEAN_SURCHARGES.BAF.typical.min + OCEAN_SURCHARGES.BAF.typical.max) / 2);
    surcharges.push({ name: OCEAN_SURCHARGES.BAF.name, code: "BAF", amount: amt });
  }
  if (includeCAF) {
    const amt = Math.round((OCEAN_SURCHARGES.CAF.typical.min + OCEAN_SURCHARGES.CAF.typical.max) / 2);
    surcharges.push({ name: OCEAN_SURCHARGES.CAF.name, code: "CAF", amount: amt });
  }
  if (includeISPS) {
    const amt = Math.round((OCEAN_SURCHARGES.ISPS.typical.min + OCEAN_SURCHARGES.ISPS.typical.max) / 2);
    surcharges.push({ name: OCEAN_SURCHARGES.ISPS.name, code: "ISPS", amount: amt });
  }
  if (includeDocFee) {
    const amt = Math.round((OCEAN_SURCHARGES.DOC.typical.min + OCEAN_SURCHARGES.DOC.typical.max) / 2);
    surcharges.push({ name: OCEAN_SURCHARGES.DOC.name, code: "DOC", amount: amt });
  }
  if (includeDTHC) {
    const amt = Math.round((OCEAN_SURCHARGES.DTHC.typical.min + OCEAN_SURCHARGES.DTHC.typical.max) / 2);
    surcharges.push({ name: OCEAN_SURCHARGES.DTHC.name, code: "DTHC", amount: amt });
  }
  if (includeOTHC) {
    const amt = Math.round((OCEAN_SURCHARGES.OTHC.typical.min + OCEAN_SURCHARGES.OTHC.typical.max) / 2);
    surcharges.push({ name: OCEAN_SURCHARGES.OTHC.name, code: "OTHC", amount: amt });
  }
  if (includeISF) {
    const amt = Math.round((OCEAN_SURCHARGES.ISF.typical.min + OCEAN_SURCHARGES.ISF.typical.max) / 2);
    surcharges.push({ name: OCEAN_SURCHARGES.ISF.name, code: "ISF", amount: amt });
  }
  if (includeAMS) {
    const amt = Math.round((OCEAN_SURCHARGES.AMS.typical.min + OCEAN_SURCHARGES.AMS.typical.max) / 2);
    surcharges.push({ name: OCEAN_SURCHARGES.AMS.name, code: "AMS", amount: amt });
  }

  const surchargeTotal = surcharges.reduce((s, item) => s + item.amount, 0);
  const totalFreight = Math.round(baseRate + surchargeTotal);

  notes.push("Rates are market benchmarks — actual spot rates vary. Get quotes from carriers.");
  if (originCountry === "CN") {
    notes.push("China rates subject to tariff surcharges on origin port side.");
  }

  // TEU cost
  const specs = { "20GP": 1, "40GP": 2, "40HC": 2, "20RF": 1, "40RF": 2, LCL: 0 };
  const teus = specs[containerType] ?? 1;
  const perTEU = teus > 0 ? totalFreight / teus : totalFreight;

  return {
    baseRate: Math.round(baseRate),
    surcharges,
    totalFreight,
    perTEU: Math.round(perTEU),
    transitDays: tradeLane.transitDays,
    tradeLane: tradeLane.label,
    notes,
  };
}

// ─── Air Freight ──────────────────────────────────────────

export interface AirFreightResult {
  chargeableWeightKg: number;    // greater of actual vs volumetric
  actualWeightKg: number;
  volumetricWeightKg: number;
  ratePerKg: number;
  baseFreight: number;
  surcharges: Array<{ name: string; amount: number }>;
  totalFreight: number;
  transitDays: { min: number; max: number };
  notes: string[];
}

// Air freight volumetric divisor: IATA standard = 6000 cm³/kg
const AIR_VOLUMETRIC_DIVISOR = 6000;

// Reference air freight rates per kg (USD) — Asia to US
const AIR_RATES: Record<string, Record<string, number>> = {
  standard: {
    "CN-US": 5.5,
    "VN-US": 6.2,
    "TH-US": 6.0,
    "ID-US": 6.5,
    "KH-US": 7.0,
  },
  express: {
    "CN-US": 9.0,
    "VN-US": 10.5,
    "TH-US": 10.0,
    "ID-US": 11.0,
    "KH-US": 12.0,
  },
  economy: {
    "CN-US": 3.8,
    "VN-US": 4.5,
    "TH-US": 4.3,
    "ID-US": 4.8,
    "KH-US": 5.2,
  },
};

const AIR_TRANSIT_DAYS: Record<string, { min: number; max: number }> = {
  standard: { min: 3, max: 5 },
  express: { min: 1, max: 2 },
  economy: { min: 7, max: 14 },
};

export function estimateAirFreight(input: AirFreightInput): AirFreightResult {
  const { weightKg, volumeCBM, service, cargoType } = input;

  // Volumetric weight
  const volumetricWeightKg = (volumeCBM * 1_000_000) / AIR_VOLUMETRIC_DIVISOR;
  const chargeableWeightKg = Math.max(weightKg, volumetricWeightKg);

  // Route key
  const originPrefix = input.originAirport.substring(0, 2).toUpperCase();
  const routeKey = `${originPrefix}-US`;

  const rateTable = AIR_RATES[service] ?? AIR_RATES.standard!;
  const ratePerKg = rateTable[routeKey] ?? rateTable["CN-US"] ?? 5.5;

  // Cargo type premium
  let cargoMultiplier = 1.0;
  if (cargoType === "perishable") cargoMultiplier = 1.4;
  if (cargoType === "dangerous") cargoMultiplier = 1.8;
  if (cargoType === "valuable") cargoMultiplier = 1.3;

  const baseFreight = chargeableWeightKg * ratePerKg * cargoMultiplier;

  // Standard air surcharges
  const fuelSurcharge = baseFreight * 0.25;    // ~25% FSC
  const securityFee = chargeableWeightKg * 0.15;
  const awbFee = 50;
  const customsFee = 75;

  const surcharges = [
    { name: "Fuel Surcharge (FSC)", amount: Math.round(fuelSurcharge) },
    { name: "Security Fee", amount: Math.round(securityFee) },
    { name: "Air Waybill Fee", amount: awbFee },
    { name: "Customs Entry Fee", amount: customsFee },
  ];

  const surchargeTotal = surcharges.reduce((s, item) => s + item.amount, 0);
  const totalFreight = Math.round(baseFreight + surchargeTotal);

  const notes = [
    "Air rates are 5-10x ocean on a per-kg basis.",
    "Only use air for time-sensitive, high-value, or low-weight/high-value goods.",
  ];

  if (volumetricWeightKg > weightKg) {
    notes.push(
      `Volumetric weight (${volumetricWeightKg.toFixed(1)} kg) exceeds actual weight — you're paying for space.`
    );
  }

  return {
    chargeableWeightKg: Math.round(chargeableWeightKg * 10) / 10,
    actualWeightKg: weightKg,
    volumetricWeightKg: Math.round(volumetricWeightKg * 10) / 10,
    ratePerKg: ratePerKg * cargoMultiplier,
    baseFreight: Math.round(baseFreight),
    surcharges,
    totalFreight,
    transitDays: AIR_TRANSIT_DAYS[service] ?? { min: 3, max: 5 },
    notes,
  };
}

// ─── Ground Freight ───────────────────────────────────────

export interface GroundFreightResult {
  mode: string;
  transitDays: { min: number; max: number };
  baseFreight: number;
  accessorials: Array<{ name: string; amount: number }>;
  totalFreight: number;
  costPerPallet: number;
  costPerLb: number;
  notes: string[];
}

// Reference LTL rates by weight bracket (USD/cwt = per 100 lbs)
const LTL_RATES_PER_CWT: Record<string, number> = {
  "under-500": 32.00,
  "500-1000": 26.00,
  "1000-2000": 22.00,
  "2000-5000": 18.00,
  "5000-10000": 15.00,
  "over-10000": 12.00,
};

function getLTLRatePerCWT(weightLbs: number): number {
  if (weightLbs < 500) return LTL_RATES_PER_CWT["under-500"]!;
  if (weightLbs < 1000) return LTL_RATES_PER_CWT["500-1000"]!;
  if (weightLbs < 2000) return LTL_RATES_PER_CWT["1000-2000"]!;
  if (weightLbs < 5000) return LTL_RATES_PER_CWT["2000-5000"]!;
  if (weightLbs < 10000) return LTL_RATES_PER_CWT["5000-10000"]!;
  return LTL_RATES_PER_CWT["over-10000"]!;
}

export function estimateGroundFreight(input: GroundFreightInput): GroundFreightResult {
  const { weightLbs, pallets, service, liftgateOrigin, liftgateDest, insideDelivery } = input;

  // Determine if FTL or LTL
  const isFTL = pallets >= 14 || weightLbs >= 40000;
  const mode = isFTL ? "FTL (Full Truckload)" : "LTL (Less-Than-Truckload)";

  let baseFreight: number;
  let transitDays: { min: number; max: number };

  if (isFTL) {
    // FTL: flat rate by distance (estimate ~$3.50/mile average, assume 1500 mile avg)
    // Real rate depends on zip codes — this is illustrative
    const estimatedMiles = 1500; // placeholder
    baseFreight = estimatedMiles * 3.5;
    transitDays = { min: 2, max: 5 };
    if (service === "expedited") {
      baseFreight *= 1.4;
      transitDays = { min: 1, max: 3 };
    }
  } else {
    // LTL: rate per CWT
    const ratePerCWT = getLTLRatePerCWT(weightLbs);
    baseFreight = (weightLbs / 100) * ratePerCWT;
    transitDays = { min: 3, max: 7 };
    if (service === "expedited") {
      baseFreight *= 1.3;
      transitDays = { min: 2, max: 4 };
    }
  }

  // Accessorial charges
  const accessorials: Array<{ name: string; amount: number }> = [];

  if (liftgateOrigin) {
    accessorials.push({ name: "Liftgate Pickup", amount: 75 });
  }
  if (liftgateDest) {
    accessorials.push({ name: "Liftgate Delivery", amount: 75 });
  }
  if (insideDelivery) {
    accessorials.push({ name: "Inside Delivery", amount: 125 });
  }
  if (service === "white-glove") {
    accessorials.push({ name: "White Glove Service", amount: 350 });
    baseFreight *= 1.5;
    transitDays = { min: 2, max: 5 };
  }

  // Fuel surcharge (standard ~28% of base)
  const fuelSurcharge = Math.round(baseFreight * 0.28);
  accessorials.push({ name: "Fuel Surcharge", amount: fuelSurcharge });

  const accessorialTotal = accessorials.reduce((s, a) => s + a.amount, 0);
  const totalFreight = Math.round(baseFreight + accessorialTotal);

  const notes = [
    "Ground freight rates vary significantly by carrier and lane.",
    "Get actual quotes from carriers: XPO, Old Dominion, FedEx Freight.",
    isFTL
      ? "FTL: You're paying for the whole truck regardless of fill."
      : "LTL: Rates are weight-bracket based. Density affects freight class.",
  ];

  return {
    mode,
    transitDays,
    baseFreight: Math.round(baseFreight),
    accessorials,
    totalFreight,
    costPerPallet: pallets > 0 ? Math.round(totalFreight / pallets) : 0,
    costPerLb: weightLbs > 0 ? Math.round((totalFreight / weightLbs) * 100) / 100 : 0,
    notes,
  };
}

// ─── Mode Comparison ──────────────────────────────────────

export interface ModeCostComparison {
  mode: string;
  transitDays: string;
  totalCost: number;
  costPerKg: number;
  recommended: boolean;
  reason: string;
}

/**
 * Compare shipping modes for a given shipment
 */
export function compareShippingModes(params: {
  weightKg: number;
  volumeCBM: number;
  originCountry: string;
  urgency: "low" | "medium" | "high";
  cargoValue: number;
}): ModeCostComparison[] {
  const { weightKg, volumeCBM, originCountry, urgency, cargoValue } = params;

  const comparisons: ModeCostComparison[] = [];

  // Ocean FCL (40HC)
  const oceanResult = estimateOceanFreight(originCountry, "USWC", "40HC");
  const oceanCostPerKg = oceanResult.totalFreight / Math.max(weightKg, 1);

  comparisons.push({
    mode: "Ocean FCL (40HC)",
    transitDays: `${oceanResult.transitDays.min}-${oceanResult.transitDays.max} days`,
    totalCost: oceanResult.totalFreight,
    costPerKg: Math.round(oceanCostPerKg * 100) / 100,
    recommended: urgency === "low" && volumeCBM > 10,
    reason:
      volumeCBM > 10
        ? "Best cost/unit for high-volume shipments"
        : "May not be full — consider LCL",
  });

  // Ocean LCL
  const lclRate = 45; // $/CBM
  const lclCost = Math.max(volumeCBM, 1) * lclRate + 300; // + handling
  comparisons.push({
    mode: "Ocean LCL",
    transitDays: "18-30 days (incl. consolidation)",
    totalCost: Math.round(lclCost),
    costPerKg: Math.round((lclCost / Math.max(weightKg, 1)) * 100) / 100,
    recommended: urgency === "low" && volumeCBM <= 10,
    reason:
      volumeCBM <= 10
        ? "Cost-effective for partial container loads"
        : "At this volume, FCL is likely cheaper",
  });

  // Air Standard
  const airInput: AirFreightInput = {
    originAirport: `${originCountry.substring(0, 2)}SHA`,
    destAirport: "USLAX",
    weightKg,
    volumeCBM,
    service: "standard",
    cargoType: "general",
  };
  const airResult = estimateAirFreight(airInput);
  const valuePerKg = cargoValue / Math.max(weightKg, 1);

  comparisons.push({
    mode: "Air (Standard)",
    transitDays: `${airResult.transitDays.min}-${airResult.transitDays.max} days`,
    totalCost: airResult.totalFreight,
    costPerKg: Math.round((airResult.totalFreight / Math.max(weightKg, 1)) * 100) / 100,
    recommended: urgency === "high" || valuePerKg > 500,
    reason:
      valuePerKg > 500
        ? "High value-to-weight ratio justifies air freight"
        : urgency === "high"
        ? "Required for urgent delivery"
        : "Significantly more expensive than ocean — use only when necessary",
  });

  // Air Express
  const airExpressInput: AirFreightInput = {
    ...airInput,
    service: "express",
  };
  const airExpressResult = estimateAirFreight(airExpressInput);

  comparisons.push({
    mode: "Air Express (DHL/FedEx)",
    transitDays: `${airExpressResult.transitDays.min}-${airExpressResult.transitDays.max} days`,
    totalCost: airExpressResult.totalFreight,
    costPerKg:
      Math.round((airExpressResult.totalFreight / Math.max(weightKg, 1)) * 100) / 100,
    recommended: urgency === "high" && weightKg < 100,
    reason:
      weightKg < 100
        ? "Door-to-door express viable for small/urgent shipments"
        : "Cost-prohibitive at this weight",
  });

  return comparisons;
}

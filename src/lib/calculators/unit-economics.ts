// ============================================================
// Unit Economics Calculator (Decimal.js precision)
// Sprint 3: Full value chain analysis
//
// Origin -> Landed -> Wholesale -> Retail
// With margins at every stage
// ============================================================

import Decimal from "decimal.js";

Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

// ─── Types ───────────────────────────────────────────────

export interface UnitEconomicsInput {
  // Product costs
  unitCostOrigin: number;
  unitsPerContainer: number;

  // Shipping & logistics
  containerShippingCost: number;
  dutyRate: number; // %
  insuranceRate: number; // % (default 0.5)
  customsBrokerFee: number;
  drayageCost: number;

  // Last-mile
  fulfillmentCostPerUnit: number;
  returnsRate: number; // % of units returned (cost absorbed)
  customerAcquisitionCost: number; // per unit

  // Pricing
  wholesaleMarkup: number; // %
  retailMarkup: number; // %
  targetRetailPrice: number;

  // Fees
  paymentProcessingRate: number; // % (e.g. 2.9 for Stripe)
  marketplaceFeeRate: number; // % (e.g. 15 for Amazon)
}

export interface UnitEconomicsStage {
  label: string;
  value: number;
  cumulativeCost: number;
  marginFromPrevious: number;
}

export interface UnitEconomicsResult {
  // Per-unit costs
  originCost: number;
  shippingPerUnit: number;
  dutyPerUnit: number;
  insurancePerUnit: number;
  brokeragePerUnit: number;
  drayagePerUnit: number;
  fulfillmentPerUnit: number;
  returnsCostPerUnit: number;
  cacPerUnit: number;
  paymentFeePerUnit: number;
  marketplaceFeePerUnit: number;

  // Key metrics
  landedCostPerUnit: number;
  totalCostPerUnit: number;
  wholesalePrice: number;
  retailPrice: number;

  // Margins
  grossMargin: number; // (wholesale - landed) / wholesale
  wholesaleMarginPct: number;
  retailMarginPct: number;
  netMarginPct: number; // after ALL costs

  // Profit
  profitPerUnit: number;
  containerProfit: number;
  roi: number; // profit / total cost

  // Value chain stages
  stages: UnitEconomicsStage[];

  // Sensitivity
  breakEvenRetailPrice: number;
  breakEvenUnitsPerMonth: number; // to cover container cost
}

/**
 * Calculate full value chain unit economics with Decimal.js precision
 */
export function calculateUnitEconomics(
  input: UnitEconomicsInput
): UnitEconomicsResult {
  const unitCost = new Decimal(input.unitCostOrigin);
  const units = new Decimal(input.unitsPerContainer);
  const containerCost = new Decimal(input.containerShippingCost);
  const dutyRatePct = new Decimal(input.dutyRate).div(100);
  const insuranceRatePct = new Decimal(input.insuranceRate || 0.5).div(100);
  const brokerFee = new Decimal(input.customsBrokerFee || 250);
  const drayage = new Decimal(input.drayageCost || 500);
  const fulfillment = new Decimal(input.fulfillmentCostPerUnit);
  const returnsRate = new Decimal(input.returnsRate || 0).div(100);
  const cac = new Decimal(input.customerAcquisitionCost || 0);
  const paymentRate = new Decimal(input.paymentProcessingRate || 0).div(100);
  const marketplaceRate = new Decimal(input.marketplaceFeeRate || 0).div(100);
  const wholesaleMarkup = new Decimal(input.wholesaleMarkup).div(100);
  const targetRetail = new Decimal(input.targetRetailPrice);

  // ─── Per-Unit Calculations ────────────────────────────

  const shippingPerUnit = units.gt(0) ? containerCost.div(units) : new Decimal(0);
  const dutyPerUnit = unitCost.mul(dutyRatePct);

  // Insurance on CIF value
  const cargoValue = unitCost.mul(units);
  const cifValue = cargoValue.add(containerCost);
  const insuranceTotal = cifValue.mul(insuranceRatePct);
  const insurancePerUnit = units.gt(0) ? insuranceTotal.div(units) : new Decimal(0);

  const brokeragePerUnit = units.gt(0) ? brokerFee.div(units) : new Decimal(0);
  const drayagePerUnit = units.gt(0) ? drayage.div(units) : new Decimal(0);

  // Landed cost = product + shipping + duty + insurance + brokerage + drayage
  const landedCost = unitCost
    .add(shippingPerUnit)
    .add(dutyPerUnit)
    .add(insurancePerUnit)
    .add(brokeragePerUnit)
    .add(drayagePerUnit);

  // Wholesale price
  const wholesalePrice = landedCost.mul(new Decimal(1).add(wholesaleMarkup));

  // Payment processing fee (on retail price)
  const paymentFee = targetRetail.mul(paymentRate);

  // Marketplace fee (on retail price)
  const marketplaceFee = targetRetail.mul(marketplaceRate);

  // Returns cost: percentage of units returned, each costs the landed cost
  const returnsCostPerUnit = landedCost.mul(returnsRate);

  // Total cost per unit (all-in)
  const totalCostPerUnit = landedCost
    .add(fulfillment)
    .add(returnsCostPerUnit)
    .add(cac)
    .add(paymentFee)
    .add(marketplaceFee);

  // ─── Margins ──────────────────────────────────────────

  const grossMargin = wholesalePrice.gt(0)
    ? wholesalePrice.sub(landedCost).div(wholesalePrice).mul(100)
    : new Decimal(0);

  const wholesaleMarginPct = grossMargin;

  const retailMarginPct = targetRetail.gt(0)
    ? targetRetail.sub(wholesalePrice).div(targetRetail).mul(100)
    : new Decimal(0);

  const profitPerUnit = targetRetail.sub(totalCostPerUnit);

  const netMarginPct = targetRetail.gt(0)
    ? profitPerUnit.div(targetRetail).mul(100)
    : new Decimal(0);

  const containerProfit = profitPerUnit.mul(units);

  const roi = totalCostPerUnit.gt(0)
    ? profitPerUnit.div(totalCostPerUnit).mul(100)
    : new Decimal(0);

  // ─── Break-Even Analysis ──────────────────────────────

  const breakEvenRetailPrice = totalCostPerUnit; // sell at cost = break even

  // Break-even units per month: container cost / profit per unit
  const monthlyFixedCost = containerCost; // simplified
  const breakEvenUnits = profitPerUnit.gt(0)
    ? monthlyFixedCost.div(profitPerUnit).ceil()
    : new Decimal(0);

  // ─── Value Chain Stages ───────────────────────────────

  const stages: UnitEconomicsStage[] = [];
  let cumulative = new Decimal(0);

  const addStage = (label: string, value: Decimal) => {
    const prev = cumulative;
    cumulative = cumulative.add(value);
    stages.push({
      label,
      value: value.toNumber(),
      cumulativeCost: cumulative.toNumber(),
      marginFromPrevious: prev.gt(0)
        ? value.div(prev).mul(100).toNumber()
        : 0,
    });
  };

  addStage("Origin (FOB)", unitCost);
  addStage("Shipping", shippingPerUnit);
  addStage("Duty & Tariff", dutyPerUnit);
  addStage("Insurance", insurancePerUnit);
  addStage("Brokerage + Drayage", brokeragePerUnit.add(drayagePerUnit));
  addStage("Fulfillment", fulfillment);
  if (returnsCostPerUnit.gt(0)) addStage("Returns Reserve", returnsCostPerUnit);
  if (cac.gt(0)) addStage("Customer Acquisition", cac);
  if (paymentFee.gt(0)) addStage("Payment Processing", paymentFee);
  if (marketplaceFee.gt(0)) addStage("Marketplace Fee", marketplaceFee);

  return {
    originCost: unitCost.toNumber(),
    shippingPerUnit: shippingPerUnit.toNumber(),
    dutyPerUnit: dutyPerUnit.toNumber(),
    insurancePerUnit: insurancePerUnit.toNumber(),
    brokeragePerUnit: brokeragePerUnit.toNumber(),
    drayagePerUnit: drayagePerUnit.toNumber(),
    fulfillmentPerUnit: fulfillment.toNumber(),
    returnsCostPerUnit: returnsCostPerUnit.toNumber(),
    cacPerUnit: cac.toNumber(),
    paymentFeePerUnit: paymentFee.toNumber(),
    marketplaceFeePerUnit: marketplaceFee.toNumber(),
    landedCostPerUnit: landedCost.toNumber(),
    totalCostPerUnit: totalCostPerUnit.toNumber(),
    wholesalePrice: wholesalePrice.toNumber(),
    retailPrice: targetRetail.toNumber(),
    grossMargin: grossMargin.toNumber(),
    wholesaleMarginPct: wholesaleMarginPct.toNumber(),
    retailMarginPct: retailMarginPct.toNumber(),
    netMarginPct: netMarginPct.toNumber(),
    profitPerUnit: profitPerUnit.toNumber(),
    containerProfit: containerProfit.toNumber(),
    roi: roi.toNumber(),
    stages,
    breakEvenRetailPrice: breakEvenRetailPrice.toNumber(),
    breakEvenUnitsPerMonth: breakEvenUnits.toNumber(),
  };
}

/**
 * Create default unit economics input
 */
export function createDefaultUnitEconomicsInput(): UnitEconomicsInput {
  return {
    unitCostOrigin: 2.5,
    unitsPerContainer: 10000,
    containerShippingCost: 4400,
    dutyRate: 6.5,
    insuranceRate: 0.5,
    customsBrokerFee: 250,
    drayageCost: 500,
    fulfillmentCostPerUnit: 0.5,
    returnsRate: 3,
    customerAcquisitionCost: 0.25,
    wholesaleMarkup: 40,
    retailMarkup: 100,
    targetRetailPrice: 9.99,
    paymentProcessingRate: 2.9,
    marketplaceFeeRate: 0,
  };
}

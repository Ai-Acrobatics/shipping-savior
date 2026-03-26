// ============================================================
// Landed Cost Calculator Engine (Decimal.js precision)
// Sprint 3: Real calculation engine with ALL hidden costs
//
// Key insight: hidden costs (MPF, HMF, bond, exam risk,
// demurrage, detention, chassis) add 15-25% beyond freight + duty.
// ============================================================

import Decimal from "decimal.js";

// Configure Decimal.js for financial precision
Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

// ─── US CBP Fee Constants ────────────────────────────────
export const MPF_RATE = new Decimal("0.003464"); // 0.3464%
export const MPF_MIN = new Decimal("31.67");
export const MPF_MAX = new Decimal("614.35");
export const HMF_RATE = new Decimal("0.00125"); // 0.125%

// ─── Types ───────────────────────────────────────────────

export interface LandedCostInput {
  unitCostOrigin: number;
  unitsPerContainer: number;
  containerShippingCost: number;
  incoterm: "FOB" | "CIF" | "DDP";
  dutyRate: number;
  insuranceRate: number;
  customsBrokerFee: number;
  isfFilingFee: number;
  mpfRate: number;
  hmfRate: number;
  bondCost: number;
  examProbability: number;
  examCost: number;
  demurrageRisk: number;
  detentionRisk: number;
  chassisFee: number;
  drayageCost: number;
  fulfillmentCostPerUnit: number;
  wholesaleMarkup: number;
  targetRetailPrice: number;
}

export interface LandedCostPerUnit {
  product: number;
  shipping: number;
  duty: number;
  insurance: number;
  mpf: number;
  hmf: number;
  brokerage: number;
  isf: number;
  bond: number;
  examRisk: number;
  demurrageRisk: number;
  detentionRisk: number;
  chassis: number;
  drayage: number;
  fulfillment: number;
  totalLanded: number;
}

export interface MarginAnalysis {
  wholesalePrice: number;
  retailPrice: number;
  wholesaleMargin: number;
  retailMargin: number;
  profitPerUnit: number;
  containerProfit: number;
  roi: number;
}

export interface LandedCostResult {
  perUnit: LandedCostPerUnit;
  containerTotal: number;
  marginAnalysis: MarginAnalysis;
  hiddenCostsTotal: number;
  hiddenCostsPercent: number;
}

/**
 * Calculate complete landed cost with ALL hidden costs using Decimal.js precision
 */
export function calculateLandedCostEngine(
  input: LandedCostInput
): LandedCostResult {
  const units = new Decimal(input.unitsPerContainer);
  const unitCost = new Decimal(input.unitCostOrigin);
  const containerShipping = new Decimal(input.containerShippingCost);

  // ─── Per-unit product cost ────────────────────────────
  const product = unitCost;

  // ─── Shipping per unit ────────────────────────────────
  const shipping = containerShipping.div(units);

  // ─── Cargo value (FOB basis) ──────────────────────────
  const cargoValue = unitCost.mul(units);

  // ─── Insurance ────────────────────────────────────────
  // Insurance on CIF value (cargo + freight)
  const insurableValue = cargoValue.add(containerShipping);
  const insuranceRate = new Decimal(input.insuranceRate).div(100);
  const insuranceTotal = insurableValue.mul(insuranceRate);
  const insurance = insuranceTotal.div(units);

  // ─── Duty ─────────────────────────────────────────────
  // US Customs uses FOB value for duty assessment
  const dutyRate = new Decimal(input.dutyRate).div(100);
  const dutyTotal = cargoValue.mul(dutyRate);
  const duty = dutyTotal.div(units);

  // ─── MPF (Merchandise Processing Fee) ─────────────────
  const mpfRateInput = new Decimal(input.mpfRate).div(100);
  let mpfTotal = cargoValue.mul(mpfRateInput);
  mpfTotal = Decimal.max(MPF_MIN, Decimal.min(MPF_MAX, mpfTotal));
  const mpf = mpfTotal.div(units);

  // ─── HMF (Harbor Maintenance Fee) ─────────────────────
  const hmfRateInput = new Decimal(input.hmfRate).div(100);
  const hmfTotal = cargoValue.mul(hmfRateInput);
  const hmf = hmfTotal.div(units);

  // ─── Customs Broker Fee ───────────────────────────────
  const brokerageTotal = new Decimal(input.customsBrokerFee);
  const brokerage = brokerageTotal.div(units);

  // ─── ISF Filing Fee ───────────────────────────────────
  const isfTotal = new Decimal(input.isfFilingFee);
  const isf = isfTotal.div(units);

  // ─── Bond Cost ────────────────────────────────────────
  const bondTotal = new Decimal(input.bondCost);
  const bond = bondTotal.div(units);

  // ─── CBP Exam Risk (expected value) ───────────────────
  const examProb = new Decimal(input.examProbability);
  const examCostVal = new Decimal(input.examCost);
  const examRiskTotal = examProb.mul(examCostVal);
  const examRisk = examRiskTotal.div(units);

  // ─── Demurrage Risk ───────────────────────────────────
  const demurrageTotal = new Decimal(input.demurrageRisk);
  const demurrageRisk = demurrageTotal.div(units);

  // ─── Detention Risk ───────────────────────────────────
  const detentionTotal = new Decimal(input.detentionRisk);
  const detentionRisk = detentionTotal.div(units);

  // ─── Chassis Fee ──────────────────────────────────────
  const chassisTotal = new Decimal(input.chassisFee);
  const chassis = chassisTotal.div(units);

  // ─── Drayage ──────────────────────────────────────────
  const drayageTotal = new Decimal(input.drayageCost);
  const drayage = drayageTotal.div(units);

  // ─── Fulfillment ──────────────────────────────────────
  const fulfillment = new Decimal(input.fulfillmentCostPerUnit);

  // ─── Total Landed Cost Per Unit ───────────────────────
  const totalLanded = product
    .add(shipping)
    .add(duty)
    .add(insurance)
    .add(mpf)
    .add(hmf)
    .add(brokerage)
    .add(isf)
    .add(bond)
    .add(examRisk)
    .add(demurrageRisk)
    .add(detentionRisk)
    .add(chassis)
    .add(drayage)
    .add(fulfillment);

  // ─── Container Total ──────────────────────────────────
  const containerTotal = totalLanded.mul(units);

  // ─── Hidden Costs (everything beyond product + freight + duty) ─
  const visibleCosts = product.add(shipping).add(duty);
  const hiddenCostsPerUnit = totalLanded.sub(visibleCosts);
  const hiddenCostsTotal = hiddenCostsPerUnit.mul(units);
  const hiddenCostsPercent = totalLanded.gt(0)
    ? hiddenCostsPerUnit.div(totalLanded).mul(100)
    : new Decimal(0);

  // ─── Margin Analysis ──────────────────────────────────
  const wholesaleMarkup = new Decimal(input.wholesaleMarkup).div(100);
  const wholesalePrice = totalLanded.mul(new Decimal(1).add(wholesaleMarkup));
  const retailPrice = new Decimal(input.targetRetailPrice);

  const wholesaleMargin = wholesalePrice.gt(0)
    ? wholesalePrice.sub(totalLanded).div(wholesalePrice).mul(100)
    : new Decimal(0);

  const retailMargin = retailPrice.gt(0)
    ? retailPrice.sub(wholesalePrice).div(retailPrice).mul(100)
    : new Decimal(0);

  const profitPerUnit = wholesalePrice.sub(totalLanded);
  const containerProfit = profitPerUnit.mul(units);
  const roi = totalLanded.gt(0)
    ? profitPerUnit.div(totalLanded).mul(100)
    : new Decimal(0);

  // ─── Convert to numbers for output ────────────────────
  return {
    perUnit: {
      product: product.toNumber(),
      shipping: shipping.toNumber(),
      duty: duty.toNumber(),
      insurance: insurance.toNumber(),
      mpf: mpf.toNumber(),
      hmf: hmf.toNumber(),
      brokerage: brokerage.toNumber(),
      isf: isf.toNumber(),
      bond: bond.toNumber(),
      examRisk: examRisk.toNumber(),
      demurrageRisk: demurrageRisk.toNumber(),
      detentionRisk: detentionRisk.toNumber(),
      chassis: chassis.toNumber(),
      drayage: drayage.toNumber(),
      fulfillment: fulfillment.toNumber(),
      totalLanded: totalLanded.toNumber(),
    },
    containerTotal: containerTotal.toNumber(),
    marginAnalysis: {
      wholesalePrice: wholesalePrice.toNumber(),
      retailPrice: retailPrice.toNumber(),
      wholesaleMargin: wholesaleMargin.toNumber(),
      retailMargin: retailMargin.toNumber(),
      profitPerUnit: profitPerUnit.toNumber(),
      containerProfit: containerProfit.toNumber(),
      roi: roi.toNumber(),
    },
    hiddenCostsTotal: hiddenCostsTotal.toNumber(),
    hiddenCostsPercent: hiddenCostsPercent.toNumber(),
  };
}

/**
 * Create a LandedCostInput with sensible defaults
 */
export function createDefaultLandedCostInput(): LandedCostInput {
  return {
    unitCostOrigin: 2.5,
    unitsPerContainer: 10000,
    containerShippingCost: 4400,
    incoterm: "FOB",
    dutyRate: 6.5,
    insuranceRate: 0.5,
    customsBrokerFee: 250,
    isfFilingFee: 75,
    mpfRate: 0.3464,
    hmfRate: 0.125,
    bondCost: 50,
    examProbability: 0.05,
    examCost: 1500,
    demurrageRisk: 150,
    detentionRisk: 100,
    chassisFee: 120,
    drayageCost: 750,
    fulfillmentCostPerUnit: 0.5,
    wholesaleMarkup: 40,
    targetRetailPrice: 9.99,
  };
}

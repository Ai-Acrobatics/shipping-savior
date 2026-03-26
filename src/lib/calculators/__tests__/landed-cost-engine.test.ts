import { describe, it, expect } from "vitest";
import {
  calculateLandedCostEngine,
  createDefaultLandedCostInput,
  type LandedCostInput,
} from "../landed-cost-engine";

describe("Landed Cost Engine", () => {
  it("calculates per-unit product cost correctly", () => {
    const input = createDefaultLandedCostInput();
    input.unitCostOrigin = 5.0;
    const result = calculateLandedCostEngine(input);
    expect(result.perUnit.product).toBe(5.0);
  });

  it("calculates shipping per unit as container cost / units", () => {
    const input = createDefaultLandedCostInput();
    input.containerShippingCost = 4400;
    input.unitsPerContainer = 10000;
    const result = calculateLandedCostEngine(input);
    expect(result.perUnit.shipping).toBeCloseTo(0.44, 4);
  });

  it("calculates duty correctly", () => {
    const input = createDefaultLandedCostInput();
    input.unitCostOrigin = 10;
    input.unitsPerContainer = 1000;
    input.dutyRate = 25;
    const result = calculateLandedCostEngine(input);
    expect(result.perUnit.duty).toBeCloseTo(2.5, 4);
  });

  it("applies MPF min/max caps", () => {
    const input = createDefaultLandedCostInput();
    input.unitCostOrigin = 0.01;
    input.unitsPerContainer = 100;
    input.mpfRate = 0.3464;
    const result = calculateLandedCostEngine(input);
    expect(result.perUnit.mpf).toBeCloseTo(31.67 / 100, 4);
  });

  it("includes all hidden costs in total", () => {
    const input = createDefaultLandedCostInput();
    const result = calculateLandedCostEngine(input);

    const manualTotal =
      result.perUnit.product +
      result.perUnit.shipping +
      result.perUnit.duty +
      result.perUnit.insurance +
      result.perUnit.mpf +
      result.perUnit.hmf +
      result.perUnit.brokerage +
      result.perUnit.isf +
      result.perUnit.bond +
      result.perUnit.examRisk +
      result.perUnit.demurrageRisk +
      result.perUnit.detentionRisk +
      result.perUnit.chassis +
      result.perUnit.drayage +
      result.perUnit.fulfillment;

    expect(result.perUnit.totalLanded).toBeCloseTo(manualTotal, 6);
  });

  it("container total equals per-unit * units", () => {
    const input = createDefaultLandedCostInput();
    input.unitsPerContainer = 5000;
    const result = calculateLandedCostEngine(input);
    expect(result.containerTotal).toBeCloseTo(
      result.perUnit.totalLanded * 5000,
      2
    );
  });

  it("hidden costs are meaningful percentage for typical imports", () => {
    const input = createDefaultLandedCostInput();
    const result = calculateLandedCostEngine(input);
    expect(result.hiddenCostsPercent).toBeGreaterThan(5);
    expect(result.hiddenCostsPercent).toBeLessThan(50);
  });

  it("calculates wholesale margin correctly", () => {
    const input = createDefaultLandedCostInput();
    input.wholesaleMarkup = 40;
    const result = calculateLandedCostEngine(input);
    expect(result.marginAnalysis.wholesaleMargin).toBeCloseTo(28.57, 1);
  });

  it("calculates ROI as profit / landed cost", () => {
    const input: LandedCostInput = {
      ...createDefaultLandedCostInput(),
      unitCostOrigin: 1.0,
      unitsPerContainer: 1000,
      containerShippingCost: 0,
      dutyRate: 0,
      insuranceRate: 0,
      customsBrokerFee: 0,
      isfFilingFee: 0,
      mpfRate: 0,
      hmfRate: 0,
      bondCost: 0,
      examProbability: 0,
      examCost: 0,
      demurrageRisk: 0,
      detentionRisk: 0,
      chassisFee: 0,
      drayageCost: 0,
      fulfillmentCostPerUnit: 0,
      wholesaleMarkup: 100,
      targetRetailPrice: 10,
    };
    const result = calculateLandedCostEngine(input);
    expect(result.marginAnalysis.roi).toBeCloseTo(100, 1);
  });

  it("handles exam risk as expected value", () => {
    const input = createDefaultLandedCostInput();
    input.examProbability = 0.1;
    input.examCost = 2000;
    input.unitsPerContainer = 1000;
    const result = calculateLandedCostEngine(input);
    expect(result.perUnit.examRisk).toBeCloseTo(0.2, 4);
  });
});

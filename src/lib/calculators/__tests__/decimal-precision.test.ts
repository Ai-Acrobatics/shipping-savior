import { describe, it, expect } from "vitest";
import Decimal from "decimal.js";
import { calculateLandedCostEngine, createDefaultLandedCostInput } from "../landed-cost-engine";
import { calculateUnitEconomics, createDefaultUnitEconomicsInput } from "../unit-economics";

describe("Decimal.js Precision", () => {
  it("0.1 + 0.2 equals 0.3 with Decimal.js", () => {
    const a = new Decimal("0.1");
    const b = new Decimal("0.2");
    const sum = a.add(b);
    expect(sum.toNumber()).toBe(0.3);
    // Native JS would fail this:
    // expect(0.1 + 0.2).toBe(0.3) // false in JS!
  });

  it("landed cost engine produces consistent totals", () => {
    const input = createDefaultLandedCostInput();
    const result1 = calculateLandedCostEngine(input);
    const result2 = calculateLandedCostEngine(input);
    // Same inputs should produce identical outputs
    expect(result1.perUnit.totalLanded).toBe(result2.perUnit.totalLanded);
    expect(result1.containerTotal).toBe(result2.containerTotal);
  });

  it("unit economics avoids floating point drift", () => {
    const input = createDefaultUnitEconomicsInput();
    input.unitCostOrigin = 0.1;
    input.containerShippingCost = 0.2;
    input.unitsPerContainer = 1;
    const result = calculateUnitEconomics(input);
    // Shipping per unit should be exactly 0.2, not 0.19999999...
    expect(result.shippingPerUnit).toBe(0.2);
  });

  it("large numbers maintain precision", () => {
    const input = createDefaultLandedCostInput();
    input.unitCostOrigin = 0.001;
    input.unitsPerContainer = 10000000; // 10 million
    const result = calculateLandedCostEngine(input);
    // Should not produce NaN or Infinity
    expect(isFinite(result.perUnit.totalLanded)).toBe(true);
    expect(isFinite(result.containerTotal)).toBe(true);
    expect(result.containerTotal).toBeGreaterThan(0);
  });
});

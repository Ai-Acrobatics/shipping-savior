import { describe, it, expect } from "vitest";
import {
  calculateContainerUtilizationEngine,
  compareAllContainers,
} from "../container-utilization-engine";

describe("Container Utilization Engine", () => {
  it("hits weight limit before volume for dense goods", () => {
    // Dense product: small but heavy (e.g., lead weights, steel parts)
    const result = calculateContainerUtilizationEngine({
      productLengthCm: 10,
      productWidthCm: 10,
      productHeightCm: 10,
      productWeightKg: 20, // 20kg per 1L cube = extremely dense (lead/steel)
      containerType: "40HC",
    });
    expect(result.limitingFactor).toBe("weight");
    // Volume should be well under 100%
    expect(result.volumeUtilizationPct).toBeLessThan(100);
  });

  it("hits volume limit before weight for light goods", () => {
    // Light product: large but light (e.g., pillows, foam)
    const result = calculateContainerUtilizationEngine({
      productLengthCm: 60,
      productWidthCm: 40,
      productHeightCm: 40,
      productWeightKg: 0.5,
      containerType: "40HC",
    });
    expect(result.limitingFactor).toBe("volume");
  });

  it("optimal units is MIN of volume and weight units", () => {
    const result = calculateContainerUtilizationEngine({
      productLengthCm: 30,
      productWidthCm: 20,
      productHeightCm: 15,
      productWeightKg: 2,
      containerType: "40HC",
    });
    expect(result.optimalUnits).toBe(
      Math.min(result.unitsByVolume, result.unitsByWeight)
    );
  });

  it("calculates cost per unit from reference rate", () => {
    const result = calculateContainerUtilizationEngine({
      productLengthCm: 30,
      productWidthCm: 20,
      productHeightCm: 15,
      productWeightKg: 1,
      containerType: "40HC",
    });
    if (result.optimalUnits > 0) {
      expect(result.costPerUnit).toBeCloseTo(
        4400 / result.optimalUnits,
        2
      );
    }
  });

  it("compares all container types", () => {
    const results = compareAllContainers({
      productLengthCm: 30,
      productWidthCm: 20,
      productHeightCm: 15,
      productWeightKg: 1,
    });
    // Should have 5 FCL types
    expect(results.length).toBe(5);
    // 40HC should generally have more units than 20GP
    const hc = results.find((r) => r.containerType === "40HC");
    const gp20 = results.find((r) => r.containerType === "20GP");
    if (hc && gp20) {
      expect(hc.optimalUnits).toBeGreaterThan(gp20.optimalUnits);
    }
  });

  it("handles zero dimensions gracefully", () => {
    const result = calculateContainerUtilizationEngine({
      productLengthCm: 0,
      productWidthCm: 10,
      productHeightCm: 10,
      productWeightKg: 1,
      containerType: "40HC",
    });
    expect(result.unitsByVolume).toBe(0);
    expect(result.optimalUnits).toBe(0);
  });

  it("applies packing efficiency", () => {
    const result100 = calculateContainerUtilizationEngine({
      productLengthCm: 30,
      productWidthCm: 20,
      productHeightCm: 15,
      productWeightKg: 0.5,
      containerType: "40HC",
      packingEfficiency: 1.0,
    });
    const result85 = calculateContainerUtilizationEngine({
      productLengthCm: 30,
      productWidthCm: 20,
      productHeightCm: 15,
      productWeightKg: 0.5,
      containerType: "40HC",
      packingEfficiency: 0.85,
    });
    // 100% packing should allow more units by volume
    expect(result100.unitsByVolume).toBeGreaterThanOrEqual(
      result85.unitsByVolume
    );
  });
});

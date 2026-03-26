import { describe, it, expect } from "vitest";
import { calculateFTZSavings, createDefaultFTZInput, type FTZInput } from "../ftz-savings";

describe("FTZ Savings Calculator", () => {
  it("calculates duty savings when current rate > locked rate", () => {
    const input: FTZInput = {
      unitValue: 10,
      totalUnits: 10000,
      lockedDutyRate: 6.5,
      currentDutyRate: 12.0,
      statusElection: "NPF",
      monthsInFTZ: 6,
      withdrawalFrequency: 2,
      storageCostPerUnit: 0,
      handlingFee: 0,
    };
    const result = calculateFTZSavings(input);
    // Without FTZ: 10 * 10000 * 0.12 = $12,000
    // With FTZ (NPF, min(6.5%, 12%) = 6.5%): 10 * 10000 * 0.065 = $6,500
    // Savings: $5,500
    expect(result.dutyWithoutFTZ).toBeCloseTo(12000, 0);
    expect(result.dutyWithFTZ).toBeCloseTo(6500, 0);
    expect(result.totalSavings).toBeCloseTo(5500, 0);
  });

  it("NPF uses MIN(locked, current) rate", () => {
    const input: FTZInput = {
      unitValue: 5,
      totalUnits: 1000,
      lockedDutyRate: 10,
      currentDutyRate: 6,
      statusElection: "NPF",
      monthsInFTZ: 3,
      withdrawalFrequency: 1,
      storageCostPerUnit: 0,
      handlingFee: 0,
    };
    const result = calculateFTZSavings(input);
    // NPF: MIN(10%, 6%) = 6% (current is lower)
    expect(result.effectiveRate).toBe(6);
    // Duty with FTZ = 5 * 1000 * 0.06 = $300
    expect(result.dutyWithFTZ).toBeCloseTo(300, 0);
  });

  it("PF always uses locked rate", () => {
    const input: FTZInput = {
      unitValue: 5,
      totalUnits: 1000,
      lockedDutyRate: 10,
      currentDutyRate: 6,
      statusElection: "PF",
      monthsInFTZ: 3,
      withdrawalFrequency: 1,
      storageCostPerUnit: 0,
      handlingFee: 0,
    };
    const result = calculateFTZSavings(input);
    // PF: always locked = 10%
    expect(result.effectiveRate).toBe(10);
    // Duty with FTZ = 5 * 1000 * 0.10 = $500
    expect(result.dutyWithFTZ).toBeCloseTo(500, 0);
  });

  it("accounts for storage costs in net savings", () => {
    const input = createDefaultFTZInput();
    input.storageCostPerUnit = 0.05;
    input.handlingFee = 200;
    const result = calculateFTZSavings(input);
    // Net savings should be less than total duty savings
    expect(result.netSavings).toBeLessThan(result.totalSavings);
  });

  it("generates withdrawal schedule for each month", () => {
    const input = createDefaultFTZInput();
    input.monthsInFTZ = 4;
    const result = calculateFTZSavings(input);
    expect(result.withdrawalSchedule.length).toBeLessThanOrEqual(4);
    expect(result.withdrawalSchedule.length).toBeGreaterThan(0);
  });

  it("savings percent is correct", () => {
    const input: FTZInput = {
      unitValue: 10,
      totalUnits: 100,
      lockedDutyRate: 5,
      currentDutyRate: 10,
      statusElection: "NPF",
      monthsInFTZ: 1,
      withdrawalFrequency: 1,
      storageCostPerUnit: 0,
      handlingFee: 0,
    };
    const result = calculateFTZSavings(input);
    // Without FTZ: $100, With FTZ: $50, Savings: $50, Percent: 50%
    expect(result.savingsPercent).toBeCloseTo(50, 0);
  });
});

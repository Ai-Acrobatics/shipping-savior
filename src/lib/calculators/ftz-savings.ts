// ============================================================
// FTZ Savings Calculator (Decimal.js precision)
// Sprint 3: Real calculation engine
//
// Key business rule:
//   PF (Privileged Foreign): duty = locked rate (always)
//   NPF (Non-Privileged Foreign): duty = MIN(locked, current)
//   NPF advantage: when rates DROP after entry, you pay the lower rate
// ============================================================

import Decimal from "decimal.js";

Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

// ─── Types ───────────────────────────────────────────────

export interface FTZInput {
  unitValue: number;
  totalUnits: number;
  lockedDutyRate: number;
  currentDutyRate: number;
  statusElection: "PF" | "NPF";
  monthsInFTZ: number;
  withdrawalFrequency: number;
  storageCostPerUnit: number;
  handlingFee: number;
}

export interface WithdrawalScheduleEntry {
  month: number;
  units: number;
  dutyRate: number;
  dutyCost: number;
  storageCost: number;
  cumulativeSavings: number;
}

export interface FTZResult {
  dutyWithoutFTZ: number;
  dutyWithFTZ: number;
  totalSavings: number;
  savingsPercent: number;
  effectiveRate: number;
  storageCost: number;
  netSavings: number;
  breakEvenMonths: number;
  withdrawalSchedule: WithdrawalScheduleEntry[];
}

/**
 * Calculate FTZ savings with PF/NPF election and withdrawal schedule
 */
export function calculateFTZSavings(input: FTZInput): FTZResult {
  const unitValue = new Decimal(input.unitValue);
  const totalUnits = new Decimal(input.totalUnits);
  const lockedRate = new Decimal(input.lockedDutyRate).div(100);
  const currentRate = new Decimal(input.currentDutyRate).div(100);
  const months = input.monthsInFTZ;
  const withdrawalsPerMonth = input.withdrawalFrequency;
  const storageCostPerUnit = new Decimal(input.storageCostPerUnit);
  const handlingFee = new Decimal(input.handlingFee);

  // ─── Effective Rate Based on Status Election ──────────
  // PF: always the locked rate (rate at time of entry)
  // NPF: MIN(locked, current) -- advantage when rates drop
  const effectiveRate =
    input.statusElection === "PF"
      ? lockedRate
      : Decimal.min(lockedRate, currentRate);

  // ─── Duty Calculations ────────────────────────────────
  const totalValue = unitValue.mul(totalUnits);
  const dutyWithoutFTZ = totalValue.mul(currentRate);
  const dutyWithFTZ = totalValue.mul(effectiveRate);
  const totalSavings = dutyWithoutFTZ.sub(dutyWithFTZ);

  const savingsPercent = dutyWithoutFTZ.gt(0)
    ? totalSavings.div(dutyWithoutFTZ).mul(100)
    : new Decimal(0);

  // ─── Storage Costs ────────────────────────────────────
  // Units are stored for decreasing durations as they're withdrawn
  // Average storage duration: months / 2 (linear withdrawal)
  const totalStorageCost = storageCostPerUnit
    .mul(totalUnits)
    .mul(new Decimal(months).div(2));

  // Total handling fees: one per withdrawal
  const totalWithdrawals = new Decimal(months).mul(withdrawalsPerMonth);
  const totalHandlingCost = handlingFee.mul(totalWithdrawals);

  const totalFTZCosts = totalStorageCost.add(totalHandlingCost);
  const netSavings = totalSavings.sub(totalFTZCosts);

  // ─── Break-Even Analysis ──────────────────────────────
  // Monthly savings rate vs monthly FTZ cost
  const monthlySavings = months > 0 ? totalSavings.div(months) : new Decimal(0);
  const monthlyFTZCost = months > 0 ? totalFTZCosts.div(months) : new Decimal(0);
  const netMonthlySavings = monthlySavings.sub(monthlyFTZCost);

  // Break-even: months where cumulative FTZ costs exceed cumulative savings
  // If FTZ costs exceed savings, break-even is when cumulative costs > cumulative savings
  let breakEvenMonths = 0;
  if (netMonthlySavings.lte(0)) {
    // FTZ never pays off
    breakEvenMonths = -1;
  } else {
    // Simple model: savings grow linearly, costs grow linearly
    // Break-even is when costs first exceed the per-month savings margin
    // In practice, with diminishing returns as storage accumulates:
    // We calculate it in the withdrawal schedule
    breakEvenMonths = 0; // Will be set during schedule generation
  }

  // ─── Withdrawal Schedule ──────────────────────────────
  const schedule: WithdrawalScheduleEntry[] = [];
  let remainingUnits = totalUnits;
  let cumulativeSavings = new Decimal(0);
  let cumulativeCosts = new Decimal(0);
  let foundBreakEven = false;

  const totalWithdrawalEvents = months * withdrawalsPerMonth;
  const unitsPerWithdrawal =
    totalWithdrawalEvents > 0
      ? totalUnits.div(totalWithdrawalEvents).ceil()
      : totalUnits;

  for (let m = 1; m <= months; m++) {
    let monthUnits = new Decimal(0);
    let monthDuty = new Decimal(0);

    for (let w = 0; w < withdrawalsPerMonth; w++) {
      const withdrawalUnits = Decimal.min(unitsPerWithdrawal, remainingUnits);
      if (withdrawalUnits.lte(0)) break;

      remainingUnits = remainingUnits.sub(withdrawalUnits);
      monthUnits = monthUnits.add(withdrawalUnits);

      const duty = withdrawalUnits.mul(unitValue).mul(effectiveRate);
      monthDuty = monthDuty.add(duty);

      const wouldHavePaid = withdrawalUnits.mul(unitValue).mul(currentRate);
      cumulativeSavings = cumulativeSavings.add(wouldHavePaid.sub(duty));
    }

    // Storage cost: remaining units this month
    const monthStorageCost = remainingUnits.add(monthUnits).mul(storageCostPerUnit);
    const monthHandlingCost = handlingFee.mul(
      Math.min(withdrawalsPerMonth, monthUnits.gt(0) ? withdrawalsPerMonth : 0)
    );
    cumulativeCosts = cumulativeCosts.add(monthStorageCost).add(monthHandlingCost);

    const netCumulativeSavings = cumulativeSavings.sub(cumulativeCosts);

    // Check break-even (when net savings turn negative)
    if (!foundBreakEven && netCumulativeSavings.lt(0)) {
      breakEvenMonths = m;
      foundBreakEven = true;
    }

    if (monthUnits.gt(0)) {
      schedule.push({
        month: m,
        units: monthUnits.toNumber(),
        dutyRate: effectiveRate.mul(100).toNumber(),
        dutyCost: monthDuty.toNumber(),
        storageCost: monthStorageCost.toNumber(),
        cumulativeSavings: netCumulativeSavings.toNumber(),
      });
    }
  }

  // If never went negative, FTZ is profitable the entire time
  if (!foundBreakEven) {
    breakEvenMonths = 0; // 0 means always profitable
  }

  return {
    dutyWithoutFTZ: dutyWithoutFTZ.toNumber(),
    dutyWithFTZ: dutyWithFTZ.toNumber(),
    totalSavings: totalSavings.toNumber(),
    savingsPercent: savingsPercent.toNumber(),
    effectiveRate: effectiveRate.mul(100).toNumber(),
    storageCost: totalStorageCost.toNumber(),
    netSavings: netSavings.toNumber(),
    breakEvenMonths,
    withdrawalSchedule: schedule,
  };
}

/**
 * Create default FTZ input values
 */
export function createDefaultFTZInput(): FTZInput {
  return {
    unitValue: 2.5,
    totalUnits: 50000,
    lockedDutyRate: 6.5,
    currentDutyRate: 12.0,
    statusElection: "NPF",
    monthsInFTZ: 8,
    withdrawalFrequency: 2,
    storageCostPerUnit: 0.02,
    handlingFee: 150,
  };
}

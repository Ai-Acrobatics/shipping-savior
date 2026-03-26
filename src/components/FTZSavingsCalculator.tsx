"use client";

import { useState } from "react";
import { Shield, TrendingDown, Calendar, Warehouse } from "lucide-react";

interface FTZResult {
  totalUnits: number;
  dutyWithoutFTZ: number;
  dutyWithFTZ: number;
  savings: number;
  savingsPercent: number;
  monthlyWithdrawals: Array<{
    month: number;
    units: number;
    dutyRate: number;
    dutyCost: number;
    cumulativeSavings: number;
  }>;
}

function calculateFTZ(
  unitValue: number,
  totalUnits: number,
  lockedDutyRate: number,
  currentDutyRate: number,
  monthsInFTZ: number,
  withdrawalsPerMonth: number
): FTZResult {
  const unitsPerWithdrawal = Math.ceil(totalUnits / (monthsInFTZ * withdrawalsPerMonth));
  const dutyWithoutFTZ = unitValue * (currentDutyRate / 100) * totalUnits;
  const dutyWithFTZ = unitValue * (lockedDutyRate / 100) * totalUnits;
  const savings = dutyWithoutFTZ - dutyWithFTZ;

  const monthlyWithdrawals = [];
  let cumulativeSavings = 0;
  let remainingUnits = totalUnits;

  for (let m = 1; m <= monthsInFTZ; m++) {
    const units = Math.min(unitsPerWithdrawal * withdrawalsPerMonth, remainingUnits);
    if (units <= 0) break;
    remainingUnits -= units;

    const dutyCost = unitValue * (lockedDutyRate / 100) * units;
    const wouldHavePaid = unitValue * (currentDutyRate / 100) * units;
    cumulativeSavings += wouldHavePaid - dutyCost;

    monthlyWithdrawals.push({
      month: m,
      units,
      dutyRate: lockedDutyRate,
      dutyCost,
      cumulativeSavings,
    });
  }

  return {
    totalUnits,
    dutyWithoutFTZ,
    dutyWithFTZ,
    savings,
    savingsPercent: dutyWithoutFTZ > 0 ? (savings / dutyWithoutFTZ) * 100 : 0,
    monthlyWithdrawals,
  };
}

export default function FTZSavingsCalculator() {
  const [unitValue, setUnitValue] = useState(0.5);
  const [totalUnits, setTotalUnits] = useState(500000);
  const [lockedRate, setLockedRate] = useState(6.5);
  const [currentRate, setCurrentRate] = useState(12.0);
  const [months, setMonths] = useState(8);

  const result = calculateFTZ(unitValue, totalUnits, lockedRate, currentRate, months, 2);

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Inputs */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-navy-100 flex items-center gap-2">
          <Warehouse className="w-5 h-5 text-ocean-400" />
          FTZ Parameters
        </h3>

        <div className="glass rounded-xl p-4 border-ocean-500/20 mb-4">
          <p className="text-xs text-navy-300 leading-relaxed">
            <strong className="text-ocean-300">Foreign Trade Zones</strong> lock your duty rate
            on the date goods enter the zone. If tariffs increase after entry, you still pay the
            original rate. Withdraw incrementally to spread costs over time.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-navy-300 block mb-1">Unit Value (FOB)</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-navy-400 text-sm">$</span>
              <input
                type="number"
                step="0.01"
                value={unitValue}
                onChange={(e) => setUnitValue(parseFloat(e.target.value) || 0)}
                className="w-full glass rounded-lg px-7 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ocean-500 bg-navy-900/50"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-navy-300 block mb-1">Total Units</label>
            <input
              type="number"
              value={totalUnits}
              onChange={(e) => setTotalUnits(parseInt(e.target.value) || 0)}
              className="w-full glass rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ocean-500 bg-navy-900/50"
            />
          </div>

          <div>
            <label className="text-xs text-navy-300 block mb-1">
              <span className="text-green-400">Locked</span> Duty Rate (%)
            </label>
            <input
              type="number"
              step="0.1"
              value={lockedRate}
              onChange={(e) => setLockedRate(parseFloat(e.target.value) || 0)}
              className="w-full glass rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 bg-navy-900/50 border-green-500/30"
            />
          </div>

          <div>
            <label className="text-xs text-navy-300 block mb-1">
              <span className="text-red-400">Current</span> Duty Rate (%)
            </label>
            <input
              type="number"
              step="0.1"
              value={currentRate}
              onChange={(e) => setCurrentRate(parseFloat(e.target.value) || 0)}
              className="w-full glass rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-500 bg-navy-900/50 border-red-500/30"
            />
          </div>
        </div>

        <div>
          <label className="text-xs text-navy-300 block mb-1">
            <Calendar className="w-3 h-3 inline mr-1" />
            Months in FTZ
          </label>
          <input
            type="range"
            min="1"
            max="24"
            value={months}
            onChange={(e) => setMonths(parseInt(e.target.value))}
            className="w-full accent-ocean-500"
          />
          <div className="text-xs text-navy-400 mt-1">{months} months</div>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-navy-100 flex items-center gap-2">
          <Shield className="w-5 h-5 text-green-400" />
          FTZ Savings Analysis
        </h3>

        {/* Savings headline */}
        <div className="glass rounded-xl p-6 border-green-500/30 bg-green-500/5">
          <div className="text-center">
            <div className="text-xs text-navy-400 mb-1">Total Duty Savings with FTZ</div>
            <div className="text-4xl font-bold text-green-400">
              ${result.savings.toLocaleString("en-US", { maximumFractionDigits: 0 })}
            </div>
            <div className="text-sm text-green-300 mt-1">
              {result.savingsPercent.toFixed(1)}% reduction in duty costs
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-white/10">
            <div className="text-center">
              <div className="text-xs text-red-300">Without FTZ</div>
              <div className="text-lg font-semibold text-red-400">
                ${result.dutyWithoutFTZ.toLocaleString("en-US", { maximumFractionDigits: 0 })}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-green-300">With FTZ</div>
              <div className="text-lg font-semibold text-green-400">
                ${result.dutyWithFTZ.toLocaleString("en-US", { maximumFractionDigits: 0 })}
              </div>
            </div>
          </div>
        </div>

        {/* Withdrawal timeline */}
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingDown className="w-4 h-4 text-ocean-400" />
            <span className="text-sm font-medium">Incremental Withdrawal Schedule</span>
          </div>

          <div className="space-y-1 max-h-48 overflow-y-auto">
            {result.monthlyWithdrawals.map((w) => (
              <div
                key={w.month}
                className="flex items-center justify-between text-xs py-1.5 border-b border-white/5"
              >
                <span className="text-navy-400">Month {w.month}</span>
                <span className="text-navy-300">
                  {w.units.toLocaleString()} units
                </span>
                <span className="text-navy-300">
                  ${w.dutyCost.toLocaleString("en-US", { maximumFractionDigits: 0 })} duty
                </span>
                <span className="text-green-400 font-medium">
                  +${w.cumulativeSavings.toLocaleString("en-US", { maximumFractionDigits: 0 })} saved
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

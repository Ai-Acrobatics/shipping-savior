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
    <div className="grid lg:grid-cols-2 gap-10">
      {/* Inputs */}
      <div className="space-y-5">
        <h3 className="text-lg font-semibold text-navy-900 flex items-center gap-2">
          <Warehouse className="w-5 h-5 text-ocean-500" />
          FTZ Parameters
        </h3>

        <div className="bg-ocean-50 border border-ocean-100 rounded-xl p-4 mb-4">
          <p className="text-xs text-navy-600 leading-relaxed">
            <strong className="text-ocean-700">Foreign Trade Zones</strong> lock your duty rate
            on the date goods enter the zone. If tariffs increase after entry, you still pay the
            original rate. Withdraw incrementally to spread costs over time.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-navy-500 block mb-1.5">Unit Value (FOB)</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-navy-400 text-sm">$</span>
              <input
                type="number"
                step="0.01"
                value={unitValue}
                onChange={(e) => setUnitValue(parseFloat(e.target.value) || 0)}
                className="input-light pl-7"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-navy-500 block mb-1.5">Total Units</label>
            <input
              type="number"
              value={totalUnits}
              onChange={(e) => setTotalUnits(parseInt(e.target.value) || 0)}
              className="input-light"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-navy-500 block mb-1.5">
              <span className="text-emerald-600">Locked</span> Duty Rate (%)
            </label>
            <input
              type="number"
              step="0.1"
              value={lockedRate}
              onChange={(e) => setLockedRate(parseFloat(e.target.value) || 0)}
              className="input-light focus:ring-emerald-500/30 focus:border-emerald-500 border-emerald-200"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-navy-500 block mb-1.5">
              <span className="text-red-500">Current</span> Duty Rate (%)
            </label>
            <input
              type="number"
              step="0.1"
              value={currentRate}
              onChange={(e) => setCurrentRate(parseFloat(e.target.value) || 0)}
              className="input-light focus:ring-red-500/30 focus:border-red-500 border-red-200"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-navy-500 block mb-1.5">
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
          <div className="text-xs text-navy-400 mt-1 font-medium">{months} months</div>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-navy-900 flex items-center gap-2">
          <Shield className="w-5 h-5 text-emerald-600" />
          FTZ Savings Analysis
        </h3>

        {/* Savings headline */}
        <div className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 rounded-xl p-6">
          <div className="text-center">
            <div className="text-xs font-medium text-navy-500 mb-1">Total Duty Savings with FTZ</div>
            <div className="text-4xl font-bold text-emerald-600">
              ${result.savings.toLocaleString("en-US", { maximumFractionDigits: 0 })}
            </div>
            <div className="text-sm text-emerald-700 mt-1 font-medium">
              {result.savingsPercent.toFixed(1)}% reduction in duty costs
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-emerald-200">
            <div className="text-center">
              <div className="text-xs text-red-500 font-medium">Without FTZ</div>
              <div className="text-lg font-semibold text-red-600">
                ${result.dutyWithoutFTZ.toLocaleString("en-US", { maximumFractionDigits: 0 })}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-emerald-600 font-medium">With FTZ</div>
              <div className="text-lg font-semibold text-emerald-600">
                ${result.dutyWithFTZ.toLocaleString("en-US", { maximumFractionDigits: 0 })}
              </div>
            </div>
          </div>
        </div>

        {/* Withdrawal timeline */}
        <div className="bg-white border border-navy-100 rounded-xl p-5 shadow-soft">
          <div className="flex items-center gap-2 mb-3">
            <TrendingDown className="w-4 h-4 text-ocean-500" />
            <span className="text-sm font-semibold text-navy-800">Incremental Withdrawal Schedule</span>
          </div>

          <div className="space-y-1 max-h-48 overflow-y-auto">
            {result.monthlyWithdrawals.map((w) => (
              <div
                key={w.month}
                className="flex items-center justify-between text-xs py-2 border-b border-navy-100 last:border-0"
              >
                <span className="text-navy-500 font-medium">Month {w.month}</span>
                <span className="text-navy-600">
                  {w.units.toLocaleString()} units
                </span>
                <span className="text-navy-600">
                  ${w.dutyCost.toLocaleString("en-US", { maximumFractionDigits: 0 })} duty
                </span>
                <span className="text-emerald-600 font-semibold">
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

"use client";

import { useState, useMemo } from "react";
import { Shield, TrendingDown, Calendar, Warehouse } from "lucide-react";
import {
  calculateFTZSavings,
  createDefaultFTZInput,
  type FTZInput,
} from "@/lib/calculators/ftz-savings";

export default function FTZSavingsCalculator() {
  const [input, setInput] = useState<FTZInput>(createDefaultFTZInput());

  const result = useMemo(() => calculateFTZSavings(input), [input]);

  const update = (field: keyof FTZInput, value: number | string) => {
    setInput((prev) => ({ ...prev, [field]: value }));
  };

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

        {/* PF/NPF Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => update("statusElection", "PF")}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition border ${
              input.statusElection === "PF"
                ? "bg-ocean-500 text-white border-ocean-600"
                : "bg-white text-navy-500 border-navy-200"
            }`}
          >
            PF (Privileged)
          </button>
          <button
            onClick={() => update("statusElection", "NPF")}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition border ${
              input.statusElection === "NPF"
                ? "bg-emerald-500 text-white border-emerald-600"
                : "bg-white text-navy-500 border-navy-200"
            }`}
          >
            NPF (Non-Privileged)
          </button>
        </div>
        <div className="text-[10px] text-navy-400">
          {input.statusElection === "NPF"
            ? "NPF: pays MIN(locked, current) rate -- advantageous when rates drop"
            : "PF: always pays the locked rate -- advantageous when rates increase"}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-navy-500 block mb-1.5">Unit Value (FOB)</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-navy-400 text-sm">$</span>
              <input
                type="number"
                step="0.01"
                value={input.unitValue}
                onChange={(e) => update("unitValue", parseFloat(e.target.value) || 0)}
                className="input-light pl-7"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-navy-500 block mb-1.5">Total Units</label>
            <input
              type="number"
              value={input.totalUnits}
              onChange={(e) => update("totalUnits", parseInt(e.target.value) || 0)}
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
              value={input.lockedDutyRate}
              onChange={(e) => update("lockedDutyRate", parseFloat(e.target.value) || 0)}
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
              value={input.currentDutyRate}
              onChange={(e) => update("currentDutyRate", parseFloat(e.target.value) || 0)}
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
            value={input.monthsInFTZ}
            onChange={(e) => update("monthsInFTZ", parseInt(e.target.value))}
            className="w-full accent-ocean-500"
          />
          <div className="text-xs text-navy-400 mt-1 font-medium">{input.monthsInFTZ} months</div>
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
            <div className="text-xs font-medium text-navy-500 mb-1">Net FTZ Savings</div>
            <div className={`text-4xl font-bold ${result.netSavings > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
              ${result.netSavings.toLocaleString("en-US", { maximumFractionDigits: 0 })}
            </div>
            <div className="text-sm text-emerald-700 mt-1 font-medium">
              {result.savingsPercent.toFixed(1)}% reduction in duty costs
              {result.effectiveRate !== input.currentDutyRate && (
                <span className="text-navy-500"> (effective rate: {result.effectiveRate.toFixed(2)}%)</span>
              )}
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
            {result.withdrawalSchedule.map((w) => (
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
                <span className={`font-semibold ${w.cumulativeSavings >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                  {w.cumulativeSavings >= 0 ? '+' : ''}${w.cumulativeSavings.toLocaleString("en-US", { maximumFractionDigits: 0 })} net
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useMemo } from "react";
import {
  Shield,
  TrendingDown,
  Calendar,
  Warehouse,
  ToggleLeft,
  ToggleRight,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import {
  calculateFTZSavings,
  createDefaultFTZInput,
  type FTZInput,
} from "@/lib/calculators/ftz-savings";

function formatUSD(value: number, decimals = 0): string {
  return `$${value.toLocaleString("en-US", {
    maximumFractionDigits: decimals,
  })}`;
}

export default function FTZCalculatorPage() {
  const [input, setInput] = useState<FTZInput>(createDefaultFTZInput());

  const result = useMemo(() => calculateFTZSavings(input), [input]);

  const update = (field: keyof FTZInput, value: number | string) => {
    setInput((prev) => ({ ...prev, [field]: value }));
  };

  const isPF = input.statusElection === "PF";

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-50 to-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-navy-500 hover:text-ocean-600 mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>

        <h1 className="text-3xl font-bold text-navy-900 mb-2">
          FTZ Savings Calculator
        </h1>
        <p className="text-navy-500 mb-8">
          Model Foreign Trade Zone savings with PF/NPF status election and
          withdrawal schedules
        </p>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Inputs */}
          <div className="space-y-6">
            {/* PF/NPF Toggle */}
            <div className="bg-white rounded-xl border border-navy-100 p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-navy-800 mb-4 flex items-center gap-2">
                <Warehouse className="w-4 h-4 text-ocean-500" /> Status Election
              </h3>

              <div className="flex items-center gap-4 mb-4">
                <button
                  onClick={() => update("statusElection", "PF")}
                  className={`flex-1 py-3 rounded-lg text-sm font-semibold transition border ${
                    isPF
                      ? "bg-ocean-500 text-white border-ocean-600"
                      : "bg-white text-navy-600 border-navy-200 hover:border-ocean-300"
                  }`}
                >
                  {isPF ? (
                    <ToggleRight className="w-4 h-4 inline mr-1" />
                  ) : (
                    <ToggleLeft className="w-4 h-4 inline mr-1" />
                  )}
                  Privileged Foreign (PF)
                </button>
                <button
                  onClick={() => update("statusElection", "NPF")}
                  className={`flex-1 py-3 rounded-lg text-sm font-semibold transition border ${
                    !isPF
                      ? "bg-emerald-500 text-white border-emerald-600"
                      : "bg-white text-navy-600 border-navy-200 hover:border-emerald-300"
                  }`}
                >
                  {!isPF ? (
                    <ToggleRight className="w-4 h-4 inline mr-1" />
                  ) : (
                    <ToggleLeft className="w-4 h-4 inline mr-1" />
                  )}
                  Non-Privileged (NPF)
                </button>
              </div>

              <div
                className={`rounded-lg p-3 text-xs leading-relaxed ${
                  isPF
                    ? "bg-ocean-50 border border-ocean-100 text-ocean-700"
                    : "bg-emerald-50 border border-emerald-100 text-emerald-700"
                }`}
              >
                {isPF ? (
                  <>
                    <strong>PF Status:</strong> Duty is always at the locked
                    rate (rate when goods entered FTZ). Best when you expect
                    rates to increase.
                  </>
                ) : (
                  <>
                    <strong>NPF Status:</strong> Duty is MIN(locked, current).
                    If rates drop after entry, you pay the lower rate. Best when
                    rates are volatile.
                  </>
                )}
              </div>
            </div>

            {/* Values */}
            <div className="bg-white rounded-xl border border-navy-100 p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-navy-800 mb-4">
                Cargo & Duty Rates
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-navy-500 block mb-1">
                    Unit Value (FOB)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-navy-400 text-sm">
                      $
                    </span>
                    <input
                      type="number"
                      step={0.01}
                      value={input.unitValue}
                      onChange={(e) =>
                        update("unitValue", parseFloat(e.target.value) || 0)
                      }
                      className="input-light pl-7"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-navy-500 block mb-1">
                    Total Units
                  </label>
                  <input
                    type="number"
                    value={input.totalUnits}
                    onChange={(e) =>
                      update("totalUnits", parseInt(e.target.value) || 0)
                    }
                    className="input-light"
                  />
                </div>
                <div>
                  <label className="text-xs text-navy-500 block mb-1">
                    <span className="text-emerald-600">Locked</span> Duty Rate
                    (%)
                  </label>
                  <input
                    type="number"
                    step={0.1}
                    value={input.lockedDutyRate}
                    onChange={(e) =>
                      update(
                        "lockedDutyRate",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className="input-light border-emerald-200 focus:ring-emerald-500/30 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-navy-500 block mb-1">
                    <span className="text-red-500">Current</span> Duty Rate (%)
                  </label>
                  <input
                    type="number"
                    step={0.1}
                    value={input.currentDutyRate}
                    onChange={(e) =>
                      update(
                        "currentDutyRate",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className="input-light border-red-200 focus:ring-red-500/30 focus:border-red-500"
                  />
                </div>
              </div>
            </div>

            {/* FTZ Costs */}
            <div className="bg-white rounded-xl border border-navy-100 p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-navy-800 mb-4">
                FTZ Storage & Withdrawal
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-navy-500 block mb-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Months in FTZ
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={24}
                    value={input.monthsInFTZ}
                    onChange={(e) =>
                      update("monthsInFTZ", parseInt(e.target.value))
                    }
                    className="w-full accent-ocean-500"
                  />
                  <div className="text-xs text-navy-400 mt-1 font-medium">
                    {input.monthsInFTZ} months
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-navy-500 block mb-1">
                      Withdrawals / Month
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={30}
                      value={input.withdrawalFrequency}
                      onChange={(e) =>
                        update(
                          "withdrawalFrequency",
                          parseInt(e.target.value) || 1
                        )
                      }
                      className="input-light"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-navy-500 block mb-1">
                      Handling Fee / Withdrawal
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-navy-400 text-sm">
                        $
                      </span>
                      <input
                        type="number"
                        value={input.handlingFee}
                        onChange={(e) =>
                          update(
                            "handlingFee",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="input-light pl-7"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-navy-500 block mb-1">
                    Storage Cost / Unit / Month
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-navy-400 text-sm">
                      $
                    </span>
                    <input
                      type="number"
                      step={0.001}
                      value={input.storageCostPerUnit}
                      onChange={(e) =>
                        update(
                          "storageCostPerUnit",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="input-light pl-7"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="space-y-6">
            {/* Headline Savings */}
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 rounded-xl p-6">
              <div className="text-center">
                <div className="text-xs font-medium text-navy-500 mb-1">
                  Net FTZ Savings
                </div>
                <div
                  className={`text-4xl font-bold ${
                    result.netSavings > 0 ? "text-emerald-600" : "text-red-500"
                  }`}
                >
                  {formatUSD(result.netSavings)}
                </div>
                <div className="text-sm text-emerald-700 mt-1 font-medium">
                  {result.savingsPercent.toFixed(1)}% duty reduction
                  {result.storageCost > 0 && (
                    <span className="text-navy-500">
                      {" "}
                      (after {formatUSD(result.storageCost)} storage)
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-emerald-200">
                <div className="text-center">
                  <div className="text-xs text-red-500 font-medium">
                    Without FTZ
                  </div>
                  <div className="text-lg font-semibold text-red-600">
                    {formatUSD(result.dutyWithoutFTZ)}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-emerald-600 font-medium">
                    With FTZ
                  </div>
                  <div className="text-lg font-semibold text-emerald-600">
                    {formatUSD(result.dutyWithFTZ)}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-navy-500 font-medium">
                    Effective Rate
                  </div>
                  <div className="text-lg font-semibold text-navy-800">
                    {result.effectiveRate.toFixed(2)}%
                  </div>
                </div>
              </div>
            </div>

            {/* Break-even */}
            {result.breakEvenMonths !== 0 && (
              <div
                className={`rounded-xl p-4 border ${
                  result.breakEvenMonths === -1
                    ? "bg-red-50 border-red-200"
                    : "bg-amber-50 border-amber-200"
                }`}
              >
                <div className="text-sm font-semibold text-navy-800">
                  {result.breakEvenMonths === -1
                    ? "FTZ costs exceed savings -- not recommended"
                    : `Break-even at month ${result.breakEvenMonths}: FTZ costs begin exceeding savings`}
                </div>
              </div>
            )}

            {/* Withdrawal Schedule */}
            <div className="bg-white border border-navy-100 rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <TrendingDown className="w-4 h-4 text-ocean-500" />
                <span className="text-sm font-semibold text-navy-800">
                  Withdrawal Schedule
                </span>
              </div>

              <div className="space-y-1 max-h-72 overflow-y-auto">
                {result.withdrawalSchedule.map((w) => (
                  <div
                    key={w.month}
                    className="flex items-center justify-between text-xs py-2.5 border-b border-navy-100 last:border-0"
                  >
                    <span className="text-navy-500 font-medium w-16">
                      Month {w.month}
                    </span>
                    <span className="text-navy-600">
                      {w.units.toLocaleString()} units
                    </span>
                    <span className="text-navy-600">
                      {w.dutyRate.toFixed(2)}%
                    </span>
                    <span className="text-navy-600">
                      {formatUSD(w.dutyCost)} duty
                    </span>
                    <span className="text-navy-400">
                      {formatUSD(w.storageCost)} storage
                    </span>
                    <span
                      className={`font-semibold ${
                        w.cumulativeSavings >= 0
                          ? "text-emerald-600"
                          : "text-red-500"
                      }`}
                    >
                      {w.cumulativeSavings >= 0 ? "+" : ""}
                      {formatUSD(w.cumulativeSavings)} net
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* PF vs NPF Comparison */}
            <div className="bg-white border border-navy-100 rounded-xl p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-navy-800 mb-3">
                PF vs NPF Comparison
              </h3>
              <div className="text-xs text-navy-600 space-y-2">
                <div className="flex justify-between py-1 border-b border-navy-50">
                  <span>Locked Rate:</span>
                  <span className="font-mono">
                    {input.lockedDutyRate.toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-navy-50">
                  <span>Current Rate:</span>
                  <span className="font-mono">
                    {input.currentDutyRate.toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-navy-50">
                  <span>PF Rate (always locked):</span>
                  <span className="font-mono font-semibold text-ocean-600">
                    {input.lockedDutyRate.toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span>NPF Rate (min of both):</span>
                  <span className="font-mono font-semibold text-emerald-600">
                    {Math.min(
                      input.lockedDutyRate,
                      input.currentDutyRate
                    ).toFixed(2)}
                    %
                  </span>
                </div>
              </div>
              <div className="mt-3 text-xs text-navy-400">
                {input.currentDutyRate < input.lockedDutyRate
                  ? "Current rate is LOWER than locked rate -- NPF is advantageous."
                  : input.currentDutyRate > input.lockedDutyRate
                  ? "Current rate is HIGHER than locked rate -- both PF and NPF give the locked rate."
                  : "Rates are equal -- no difference between PF and NPF."}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

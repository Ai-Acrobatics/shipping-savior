"use client";

import { useState } from "react";
import {
  GitCompare,
  Plus,
  Trash2,
  TrendingUp,
  TrendingDown,
  Globe,
  DollarSign,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

interface TariffScenario {
  id: string;
  name: string;
  country: string;
  baseDutyRate: number;
  section301Rate: number;
  unitValue: number;
  annualUnits: number;
  color: string;
}

interface ScenarioResult {
  id: string;
  name: string;
  country: string;
  color: string;
  totalDutyRate: number;
  annualDutyCost: number;
  dutyPerUnit: number;
  landedCostIncrease: number;
  riskLevel: "low" | "medium" | "high";
}

const COUNTRY_FLAGS: Record<string, string> = {
  VN: "🇻🇳",
  TH: "🇹🇭",
  ID: "🇮🇩",
  KH: "🇰🇭",
  CN: "🇨🇳",
  IN: "🇮🇳",
  MX: "🇲🇽",
  BD: "🇧🇩",
};

const SCENARIO_COLORS = [
  "ocean",
  "cargo",
  "green",
  "purple",
  "red",
  "blue",
] as const;

const COLOR_CLASSES: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  ocean: {
    bg: "bg-ocean-50",
    border: "border-ocean-200",
    text: "text-ocean-600",
    badge: "bg-ocean-500",
  },
  cargo: {
    bg: "bg-amber-50",
    border: "border-cargo-500/40",
    text: "text-cargo-600",
    badge: "bg-cargo-500",
  },
  green: {
    bg: "bg-emerald-50",
    border: "border-green-500/40",
    text: "text-emerald-600",
    badge: "bg-green-500",
  },
  purple: {
    bg: "bg-purple-50",
    border: "border-purple-500/40",
    text: "text-purple-600",
    badge: "bg-purple-500",
  },
  red: {
    bg: "bg-red-50",
    border: "border-red-500/40",
    text: "text-red-600",
    badge: "bg-red-500",
  },
  blue: {
    bg: "bg-blue-50",
    border: "border-blue-500/40",
    text: "text-blue-600",
    badge: "bg-blue-500",
  },
};

function calculateScenario(s: TariffScenario): ScenarioResult {
  const totalDutyRate = s.baseDutyRate + s.section301Rate;
  const dutyPerUnit = s.unitValue * (totalDutyRate / 100);
  const annualDutyCost = dutyPerUnit * s.annualUnits;
  const landedCostIncrease = (dutyPerUnit / s.unitValue) * 100;

  const riskLevel =
    totalDutyRate >= 25
      ? "high"
      : totalDutyRate >= 10
      ? "medium"
      : "low";

  return {
    id: s.id,
    name: s.name,
    country: s.country,
    color: s.color,
    totalDutyRate,
    annualDutyCost,
    dutyPerUnit,
    landedCostIncrease,
    riskLevel,
  };
}

const DEFAULT_SCENARIOS: TariffScenario[] = [
  {
    id: "1",
    name: "Vietnam Base Case",
    country: "VN",
    baseDutyRate: 6.5,
    section301Rate: 0,
    unitValue: 0.5,
    annualUnits: 2000000,
    color: "ocean",
  },
  {
    id: "2",
    name: "China + Section 301",
    country: "CN",
    baseDutyRate: 6.5,
    section301Rate: 25,
    unitValue: 0.5,
    annualUnits: 2000000,
    color: "red",
  },
  {
    id: "3",
    name: "Vietnam + Tariff Hike",
    country: "VN",
    baseDutyRate: 6.5,
    section301Rate: 10,
    unitValue: 0.5,
    annualUnits: 2000000,
    color: "cargo",
  },
];

interface Props {
  onSelectScenario?: (rate: number, country: string) => void;
}

export default function TariffScenarioBuilder({ onSelectScenario }: Props) {
  const [scenarios, setScenarios] = useState<TariffScenario[]>(DEFAULT_SCENARIOS);
  const [activeTab, setActiveTab] = useState<"edit" | "compare">("compare");

  const results = scenarios.map(calculateScenario);
  const maxCost = Math.max(...results.map((r) => r.annualDutyCost));
  const bestScenario = results.reduce((best, r) =>
    r.annualDutyCost < best.annualDutyCost ? r : best
  );
  const worstScenario = results.reduce((worst, r) =>
    r.annualDutyCost > worst.annualDutyCost ? r : worst
  );

  const addScenario = () => {
    if (scenarios.length >= 6) return;
    const colorIndex = scenarios.length % SCENARIO_COLORS.length;
    const newScenario: TariffScenario = {
      id: Date.now().toString(),
      name: `Scenario ${scenarios.length + 1}`,
      country: "VN",
      baseDutyRate: 6.5,
      section301Rate: 0,
      unitValue: 0.5,
      annualUnits: 1000000,
      color: SCENARIO_COLORS[colorIndex],
    };
    setScenarios([...scenarios, newScenario]);
  };

  const removeScenario = (id: string) => {
    if (scenarios.length <= 1) return;
    setScenarios(scenarios.filter((s) => s.id !== id));
  };

  const updateScenario = (id: string, updates: Partial<TariffScenario>) => {
    setScenarios(scenarios.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const getRiskIcon = (level: string) => {
    if (level === "high") return <AlertTriangle className="w-4 h-4 text-red-600" />;
    if (level === "medium") return <TrendingUp className="w-4 h-4 text-cargo-400" />;
    return <CheckCircle className="w-4 h-4 text-emerald-600" />;
  };

  return (
    <div className="space-y-6">
      {/* Tab header */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1 bg-white border border-navy-100 shadow-soft rounded-xl p-1">
          {(["compare", "edit"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab
                  ? "bg-ocean-600 text-navy-900"
                  : "text-navy-500 hover:text-navy-900"
              }`}
            >
              {tab === "compare" ? "Compare Scenarios" : "Edit Scenarios"}
            </button>
          ))}
        </div>

        <button
          onClick={addScenario}
          disabled={scenarios.length >= 6}
          className="flex items-center gap-2 text-sm px-3 py-2 rounded-xl bg-white border border-navy-100 hover:shadow-card hover:border-navy-200 transition-all text-navy-400 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          Add Scenario
        </button>
      </div>

      {/* COMPARE VIEW */}
      {activeTab === "compare" && (
        <div className="space-y-6">
          {/* Summary bar */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white border border-navy-100 shadow-soft rounded-xl p-4 border-emerald-200">
              <div className="text-xs text-navy-400 mb-1">Best Case</div>
              <div className="text-sm font-semibold text-emerald-600">{bestScenario.name}</div>
              <div className="text-lg font-bold text-emerald-600">
                ${bestScenario.annualDutyCost.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                /yr
              </div>
            </div>
            <div className="bg-white border border-navy-100 shadow-soft rounded-xl p-4 border-red-200">
              <div className="text-xs text-navy-400 mb-1">Worst Case</div>
              <div className="text-sm font-semibold text-red-600">{worstScenario.name}</div>
              <div className="text-lg font-bold text-red-600">
                ${worstScenario.annualDutyCost.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                /yr
              </div>
            </div>
            <div className="bg-white border border-navy-100 shadow-soft rounded-xl p-4 border-amber-200">
              <div className="text-xs text-navy-400 mb-1">Range / Exposure</div>
              <div className="text-sm font-semibold text-cargo-600">Delta</div>
              <div className="text-lg font-bold text-cargo-600">
                $
                {(worstScenario.annualDutyCost - bestScenario.annualDutyCost).toLocaleString(
                  "en-US",
                  { maximumFractionDigits: 0 }
                )}
                /yr
              </div>
            </div>
          </div>

          {/* Horizontal bar chart */}
          <div className="bg-white border border-navy-100 shadow-soft rounded-xl p-6">
            <div className="text-sm font-medium text-navy-400 mb-4 flex items-center gap-2">
              <GitCompare className="w-4 h-4 text-ocean-400" />
              Annual Duty Cost Comparison
            </div>
            <div className="space-y-3">
              {results.map((r) => {
                const colors = COLOR_CLASSES[r.color] ?? COLOR_CLASSES.ocean;
                const barWidth = maxCost > 0 ? (r.annualDutyCost / maxCost) * 100 : 0;
                return (
                  <div key={r.id}>
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${colors.badge}`} />
                        <span className="text-sm text-navy-400">{r.name}</span>
                        <span className="text-xs text-navy-500">
                          {COUNTRY_FLAGS[r.country]} {r.country}
                        </span>
                        {getRiskIcon(r.riskLevel)}
                      </div>
                      <div className="text-right">
                        <span className={`text-sm font-semibold ${colors.text}`}>
                          ${r.annualDutyCost.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                        </span>
                        <span className="text-xs text-navy-500 ml-2">
                          {r.totalDutyRate.toFixed(1)}% total rate
                        </span>
                      </div>
                    </div>
                    <div className="h-3 bg-white border border-navy-100 shadow-soft rounded-full overflow-hidden">
                      <div
                        className={`h-full ${colors.badge} opacity-80 transition-all duration-700 rounded-full`}
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detailed comparison table */}
          <div className="bg-white border border-navy-100 shadow-soft rounded-xl overflow-hidden">
            <div className="text-sm font-medium text-navy-400 p-4 border-b border-navy-100">
              Per-Unit Impact Analysis
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-navy-100">
                    <th className="text-left px-4 py-3 text-xs text-navy-400 font-medium">Scenario</th>
                    <th className="text-right px-4 py-3 text-xs text-navy-400 font-medium">Base Rate</th>
                    <th className="text-right px-4 py-3 text-xs text-navy-400 font-medium">Add&apos;l Tariff</th>
                    <th className="text-right px-4 py-3 text-xs text-navy-400 font-medium">Total Rate</th>
                    <th className="text-right px-4 py-3 text-xs text-navy-400 font-medium">Duty/Unit</th>
                    <th className="text-right px-4 py-3 text-xs text-navy-400 font-medium">Annual Cost</th>
                    <th className="text-right px-4 py-3 text-xs text-navy-400 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r, i) => {
                    const s = scenarios[i];
                    const colors = COLOR_CLASSES[r.color] ?? COLOR_CLASSES.ocean;
                    return (
                      <tr key={r.id} className="border-b border-navy-100 hover:bg-white/3">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${colors.badge}`} />
                            <span className="text-navy-400">{r.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right text-navy-500">
                          {s.baseDutyRate.toFixed(1)}%
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span
                            className={s.section301Rate > 0 ? "text-red-600 font-medium" : "text-navy-500"}
                          >
                            {s.section301Rate > 0 ? `+${s.section301Rate}%` : "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span
                            className={
                              r.totalDutyRate >= 25
                                ? "text-red-600 font-bold"
                                : r.totalDutyRate >= 10
                                ? "text-cargo-600 font-semibold"
                                : "text-emerald-600"
                            }
                          >
                            {r.totalDutyRate.toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-navy-500">
                          ${r.dutyPerUnit.toFixed(4)}
                        </td>
                        <td className={`px-4 py-3 text-right font-semibold ${colors.text}`}>
                          ${r.annualDutyCost.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {onSelectScenario && (
                            <button
                              onClick={() => onSelectScenario(r.totalDutyRate, r.country)}
                              className="text-xs px-2 py-1 rounded-lg bg-ocean-600/30 hover:bg-ocean-600/50 text-ocean-600 transition-colors"
                            >
                              Use
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* What-if insight */}
          <div className="bg-white border border-navy-100 shadow-soft rounded-xl p-5 border-amber-200">
            <div className="flex items-start gap-3">
              <TrendingDown className="w-5 h-5 text-cargo-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-semibold text-cargo-600 mb-1">What-If Insight</div>
                <p className="text-xs text-navy-500 leading-relaxed">
                  The delta between{" "}
                  <strong className="text-navy-900">{bestScenario.name}</strong> and{" "}
                  <strong className="text-navy-900">{worstScenario.name}</strong> is{" "}
                  <strong className="text-cargo-600">
                    $
                    {(
                      worstScenario.annualDutyCost - bestScenario.annualDutyCost
                    ).toLocaleString("en-US", { maximumFractionDigits: 0 })}
                    /year
                  </strong>
                  . Sourcing from {COUNTRY_FLAGS[bestScenario.country]} {bestScenario.country} vs.{" "}
                  {COUNTRY_FLAGS[worstScenario.country]} {worstScenario.country} saves{" "}
                  <strong className="text-emerald-600">
                    {(
                      ((worstScenario.annualDutyCost - bestScenario.annualDutyCost) /
                        worstScenario.annualDutyCost) *
                      100
                    ).toFixed(0)}
                    %
                  </strong>{" "}
                  on duty costs alone — before FTZ rate-locking benefits.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT VIEW */}
      {activeTab === "edit" && (
        <div className="space-y-4">
          {scenarios.map((s, i) => {
            const colors = COLOR_CLASSES[s.color] ?? COLOR_CLASSES.ocean;
            return (
              <div key={s.id} className={`glass rounded-xl p-5 border ${colors.border}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${colors.badge}`} />
                    <input
                      type="text"
                      value={s.name}
                      onChange={(e) => updateScenario(s.id, { name: e.target.value })}
                      className="bg-transparent text-sm font-semibold text-navy-900 focus:outline-none focus:border-b focus:border-ocean-500"
                    />
                  </div>
                  <button
                    onClick={() => removeScenario(s.id)}
                    disabled={scenarios.length <= 1}
                    className="text-navy-500 hover:text-red-600 transition-colors disabled:opacity-20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-navy-400 block mb-1">Country of Origin</label>
                    <select
                      value={s.country}
                      onChange={(e) => updateScenario(s.id, { country: e.target.value })}
                      className="w-full bg-white border border-navy-100 shadow-soft rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ocean-500/30 focus:border-ocean-500 bg-navy-50"
                    >
                      {Object.entries(COUNTRY_FLAGS).map(([code, flag]) => (
                        <option key={code} value={code}>
                          {flag} {code}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-navy-400 block mb-1">Base Duty Rate (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={s.baseDutyRate}
                      onChange={(e) =>
                        updateScenario(s.id, { baseDutyRate: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full bg-white border border-navy-100 shadow-soft rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ocean-500/30 focus:border-ocean-500 bg-navy-50"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-navy-400 block mb-1">
                      Sec. 301 / Additional (%)
                    </label>
                    <input
                      type="number"
                      step="1"
                      value={s.section301Rate}
                      onChange={(e) =>
                        updateScenario(s.id, { section301Rate: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full bg-white border border-navy-100 shadow-soft rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-500 bg-navy-50 border-red-200"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-navy-400 block mb-1">Unit Value (FOB $)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-navy-400 text-sm">$</span>
                      <input
                        type="number"
                        step="0.01"
                        value={s.unitValue}
                        onChange={(e) =>
                          updateScenario(s.id, { unitValue: parseFloat(e.target.value) || 0 })
                        }
                        className="w-full bg-white border border-navy-100 shadow-soft rounded-lg pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ocean-500/30 focus:border-ocean-500 bg-navy-50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-navy-400 block mb-1">Annual Units</label>
                    <input
                      type="number"
                      step="100000"
                      value={s.annualUnits}
                      onChange={(e) =>
                        updateScenario(s.id, { annualUnits: parseInt(e.target.value) || 0 })
                      }
                      className="w-full bg-white border border-navy-100 shadow-soft rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ocean-500/30 focus:border-ocean-500 bg-navy-50"
                    />
                  </div>

                  <div className="flex items-end">
                    <div className={`w-full bg-white border border-navy-100 shadow-soft rounded-xl p-3 ${colors.bg} ${colors.border} border`}>
                      <div className="text-xs text-navy-400">Annual Duty</div>
                      <div className={`text-lg font-bold ${colors.text}`}>
                        $
                        {calculateScenario(s).annualDutyCost.toLocaleString("en-US", {
                          maximumFractionDigits: 0,
                        })}
                      </div>
                      <div className="text-xs text-navy-500">
                        {calculateScenario(s).totalDutyRate.toFixed(1)}% effective rate
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {scenarios.length < 6 && (
            <button
              onClick={addScenario}
              className="w-full bg-white border border-navy-100 hover:shadow-card hover:border-navy-200 transition-all rounded-xl p-4 border-dashed border-navy-200 text-sm text-navy-400 hover:text-navy-400 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Another Scenario (max 6)
            </button>
          )}
        </div>
      )}
    </div>
  );
}

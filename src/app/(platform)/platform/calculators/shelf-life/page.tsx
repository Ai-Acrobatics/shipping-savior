"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, Snowflake, TrendingUp, Ship } from "lucide-react";
import Link from "next/link";
import {
  calculateShelfLife,
  compareRoutes,
  COMMODITY_PRESETS,
  type CommodityKey,
  type ShelfLifeInput,
  type ShelfLifeResult,
  type RiskLevel,
} from "@/lib/calculators/shelf-life";

const riskBadge: Record<RiskLevel, string> = {
  low: "bg-green-50 border-green-200 text-green-700",
  moderate: "bg-amber-50 border-amber-200 text-amber-700",
  high: "bg-orange-50 border-orange-200 text-orange-700",
  critical: "bg-red-50 border-red-200 text-red-700",
};

const riskLabel: Record<RiskLevel, string> = {
  low: "Low Risk",
  moderate: "Moderate Risk",
  high: "High Risk",
  critical: "Critical Risk",
};

function RouteResultCard({ name, transitDays, result }: { name: string; transitDays: number; result: ShelfLifeResult }) {
  return (
    <div className="bg-white border border-navy-100 rounded-xl p-4 flex-1">
      <div className="text-xs text-navy-400 font-medium">{name}</div>
      <div className="text-sm text-navy-600 mb-2">{transitDays}d transit</div>
      <div className="text-2xl font-bold text-ocean-600">
        {result.remainingShelfLifeDays.toFixed(1)}d
      </div>
      <div className="text-xs text-navy-500 mb-2">
        remaining ({result.remainingPct.toFixed(0)}% of baseline)
      </div>
      <span className={`inline-block text-xs font-medium border rounded-full px-2 py-0.5 ${riskBadge[result.riskLevel]}`}>
        {riskLabel[result.riskLevel]}
      </span>
    </div>
  );
}

export default function ShelfLifePage() {
  const [commodity, setCommodity] = useState<CommodityKey | "custom">("table_grapes");
  const [customBaselineDays, setCustomBaselineDays] = useState(30);
  const [customOptimalTempC, setCustomOptimalTempC] = useState(0);
  const [daysAlreadyElapsed, setDaysAlreadyElapsed] = useState(5);
  const [transitDays, setTransitDays] = useState(14);
  const [tempDeviationC, setTempDeviationC] = useState(0);
  const [deviationHours, setDeviationHours] = useState(0);
  const [targetShelfDaysAtDestination, setTargetShelfDaysAtDestination] = useState(21);
  const [routeATransitDays, setRouteATransitDays] = useState(14);
  const [routeBTransitDays, setRouteBTransitDays] = useState(17);

  const baseInputs: Omit<ShelfLifeInput, "transitDays"> = useMemo(
    () => ({
      ...(commodity === "custom"
        ? { custom: { baselineDays: customBaselineDays, optimalTempC: customOptimalTempC } }
        : { commodity }),
      daysAlreadyElapsed,
      tempDeviationC,
      deviationHours,
      targetShelfDaysAtDestination,
    }),
    [
      commodity, customBaselineDays, customOptimalTempC, daysAlreadyElapsed,
      tempDeviationC, deviationHours, targetShelfDaysAtDestination,
    ]
  );

  const result = useMemo(() => {
    try {
      return calculateShelfLife({ ...baseInputs, transitDays });
    } catch {
      return null;
    }
  }, [baseInputs, transitDays]);

  const comparison = useMemo(() => {
    try {
      return compareRoutes(baseInputs, routeATransitDays, routeBTransitDays);
    } catch {
      return null;
    }
  }, [baseInputs, routeATransitDays, routeBTransitDays]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/platform/calculators"
          className="p-2 text-navy-400 hover:text-navy-600 hover:bg-navy-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Cold-Chain Shelf-Life Calculator</h1>
          <p className="text-navy-500 text-sm mt-0.5">
            Model remaining shelf life at destination for refrigerated produce and compare carrier transit times.
          </p>
        </div>
      </div>

      <div className="bg-white border border-navy-200 rounded-xl p-6">
        <div className="grid lg:grid-cols-2 gap-10">
          {/* Inputs */}
          <div className="space-y-5">
            <h3 className="text-lg font-semibold text-navy-900 flex items-center gap-2">
              <Snowflake className="w-5 h-5 text-ocean-500" />
              Shipment Parameters
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-navy-500 block mb-1.5">Commodity</label>
                <select
                  value={commodity}
                  onChange={(e) => setCommodity(e.target.value as CommodityKey | "custom")}
                  className="input-light w-full"
                >
                  {(Object.keys(COMMODITY_PRESETS) as CommodityKey[]).map((key) => (
                    <option key={key} value={key}>
                      {COMMODITY_PRESETS[key].label} ({COMMODITY_PRESETS[key].baselineDays}d @ {COMMODITY_PRESETS[key].optimalTempC}°C)
                    </option>
                  ))}
                  <option value="custom">Custom commodity…</option>
                </select>
              </div>

              {commodity === "custom" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-navy-500 block mb-1.5">Baseline Shelf Life (days)</label>
                    <input
                      type="number"
                      min="1"
                      value={customBaselineDays}
                      onChange={(e) => setCustomBaselineDays(parseFloat(e.target.value) || 0)}
                      className="input-light"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-navy-500 block mb-1.5">Optimal Temp (°C)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={customOptimalTempC}
                      onChange={(e) => setCustomOptimalTempC(parseFloat(e.target.value) || 0)}
                      className="input-light"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-navy-500 block mb-1.5">Days Elapsed Pre-Loading</label>
                  <input
                    type="number"
                    min="0"
                    value={daysAlreadyElapsed}
                    onChange={(e) => setDaysAlreadyElapsed(parseFloat(e.target.value) || 0)}
                    className="input-light"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-navy-500 block mb-1.5">Transit Days</label>
                  <input
                    type="number"
                    min="0"
                    value={transitDays}
                    onChange={(e) => setTransitDays(parseFloat(e.target.value) || 0)}
                    className="input-light"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-navy-500 block mb-1.5">Temp Deviation (°C above optimal)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={tempDeviationC}
                    onChange={(e) => setTempDeviationC(parseFloat(e.target.value) || 0)}
                    className="input-light"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-navy-500 block mb-1.5">Deviation Duration (hours)</label>
                  <input
                    type="number"
                    min="0"
                    value={deviationHours}
                    onChange={(e) => setDeviationHours(parseFloat(e.target.value) || 0)}
                    className="input-light"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-navy-500 block mb-1.5">Target Shelf Days at Destination</label>
                <input
                  type="number"
                  min="0"
                  value={targetShelfDaysAtDestination}
                  onChange={(e) => setTargetShelfDaysAtDestination(parseFloat(e.target.value) || 0)}
                  className="input-light"
                />
              </div>

              <div className="pt-4 border-t border-navy-100 space-y-4">
                <h4 className="text-sm font-semibold text-navy-900 flex items-center gap-2">
                  <Ship className="w-4 h-4 text-ocean-500" />
                  Compare Two Routes
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-navy-500 block mb-1.5">Route A Transit Days</label>
                    <input
                      type="number"
                      min="0"
                      value={routeATransitDays}
                      onChange={(e) => setRouteATransitDays(parseFloat(e.target.value) || 0)}
                      className="input-light"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-navy-500 block mb-1.5">Route B Transit Days</label>
                    <input
                      type="number"
                      min="0"
                      value={routeBTransitDays}
                      onChange={(e) => setRouteBTransitDays(parseFloat(e.target.value) || 0)}
                      className="input-light"
                    />
                  </div>
                </div>
                <p className="text-xs text-navy-400">
                  e.g. Matson 14d vs Pasha 17d ex Port Hueneme. Both routes share the shipment parameters above.
                </p>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
            <h3 className="text-lg font-semibold text-navy-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-cargo-500" />
              Shelf-Life Outlook
            </h3>

            {result ? (
              <div className="bg-navy-50 border border-navy-100 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-center flex-1">
                    <div className="text-xs text-navy-400 font-medium">Remaining at Destination</div>
                    <div className="text-3xl font-bold text-ocean-600">
                      {result.remainingShelfLifeDays.toFixed(1)}d
                    </div>
                  </div>
                  <div className="text-center flex-1">
                    <div className="text-xs text-navy-400 font-medium">Of Baseline Life</div>
                    <div className="text-3xl font-bold text-cargo-600">
                      {result.remainingPct.toFixed(0)}%
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 pt-4 border-t border-navy-200">
                  <div className="text-center">
                    <div className="text-xs text-navy-400">Risk Level</div>
                    <span className={`inline-block mt-1 text-xs font-medium border rounded-full px-2 py-0.5 ${riskBadge[result.riskLevel]}`}>
                      {riskLabel[result.riskLevel]}
                    </span>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-navy-400">Meets Target</div>
                    <div className={`text-lg font-semibold ${result.meetsTarget ? "text-green-600" : "text-red-600"}`}>
                      {result.meetsTarget ? "Yes" : "No"}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-navy-400">Buffer</div>
                    <div className={`text-lg font-semibold ${result.bufferDays >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {result.bufferDays >= 0 ? "+" : ""}{result.bufferDays.toFixed(1)}d
                    </div>
                  </div>
                </div>

                {result.extraDaysConsumed > 0 && (
                  <div className="mt-4 pt-4 border-t border-navy-200 text-xs text-navy-500 text-center">
                    Temperature excursions consumed an extra{" "}
                    <span className="font-semibold text-cargo-600">{result.extraDaysConsumed.toFixed(1)} days</span>{" "}
                    of shelf life (Q10 = 2 model).
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-sm text-amber-700">
                Enter valid parameters to see the shelf-life outlook.
              </div>
            )}

            {/* Route comparison */}
            <div className="bg-white border border-navy-100 rounded-xl p-5 shadow-soft">
              <div className="text-sm font-medium text-navy-400 mb-3 flex items-center gap-2">
                <Ship className="w-4 h-4 text-ocean-400" />
                Route Comparison
              </div>

              {comparison ? (
                <>
                  <div className="flex gap-3">
                    <RouteResultCard name="Route A" transitDays={routeATransitDays} result={comparison.routeA} />
                    <RouteResultCard name="Route B" transitDays={routeBTransitDays} result={comparison.routeB} />
                  </div>

                  {comparison.faster !== "tie" && comparison.shelfLifeLiftPct !== null && comparison.shelfLifeLiftPct > 0 && (
                    <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold text-green-700">
                        {comparison.shelfLifeLiftPct.toFixed(0)}% shelf-life lift
                      </div>
                      <div className="text-xs text-green-700 mt-1">
                        Route {comparison.faster} ({Math.min(routeATransitDays, routeBTransitDays)}d) delivers{" "}
                        {comparison.shelfLifeLiftPct.toFixed(1)}% more remaining shelf life at destination than the slower option.
                      </div>
                    </div>
                  )}

                  {comparison.shelfLifeLiftPct === null && (
                    <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4 text-xs text-red-700 text-center">
                      The slower route arrives with zero remaining shelf life — lift is undefined.
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700">
                  Enter valid route transit days to compare.
                </div>
              )}
            </div>

            {/* TODO(AI-10777): add shelf_life to calculatorTypeEnum + wire save */}
          </div>
        </div>
      </div>
    </div>
  );
}

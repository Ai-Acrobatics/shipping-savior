"use client";

import { useState, useMemo } from "react";
import { Box, Scale, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import {
  calculateContainerUtilizationEngine,
  compareAllContainers,
  type ContainerCalcInput,
} from "@/lib/calculators/container-utilization-engine";
import type { ContainerType } from "@/lib/types";

export default function ContainerCalculatorPage() {
  const [length, setLength] = useState(40);
  const [width, setWidth] = useState(30);
  const [height, setHeight] = useState(25);
  const [weight, setWeight] = useState(2.5);
  const [selectedContainer, setSelectedContainer] =
    useState<ContainerType>("40HC");

  const input: ContainerCalcInput = {
    productLengthCm: length,
    productWidthCm: width,
    productHeightCm: height,
    productWeightKg: weight,
    containerType: selectedContainer,
  };

  const result = useMemo(
    () => calculateContainerUtilizationEngine(input),
    [length, width, height, weight, selectedContainer]
  );

  const allResults = useMemo(
    () =>
      compareAllContainers({
        productLengthCm: length,
        productWidthCm: width,
        productHeightCm: height,
        productWeightKg: weight,
      }),
    [length, width, height, weight]
  );

  const isWeightLimited = result.limitingFactor === "weight";

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
          Container Utilization Calculator
        </h1>
        <p className="text-navy-500 mb-8">
          Dual volume + weight analysis. Dense goods hit weight limits at 40%
          volume fill.
        </p>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Inputs */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-navy-100 p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-navy-800 mb-4 flex items-center gap-2">
                <Box className="w-4 h-4 text-ocean-500" /> Product Dimensions
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-navy-500 block mb-1">
                    Length (cm)
                  </label>
                  <input
                    type="number"
                    value={length}
                    onChange={(e) => setLength(parseFloat(e.target.value) || 0)}
                    className="input-light"
                  />
                </div>
                <div>
                  <label className="text-xs text-navy-500 block mb-1">
                    Width (cm)
                  </label>
                  <input
                    type="number"
                    value={width}
                    onChange={(e) => setWidth(parseFloat(e.target.value) || 0)}
                    className="input-light"
                  />
                </div>
                <div>
                  <label className="text-xs text-navy-500 block mb-1">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(parseFloat(e.target.value) || 0)}
                    className="input-light"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="text-xs text-navy-500 block mb-1 flex items-center gap-1">
                  <Scale className="w-3 h-3" /> Weight per Unit (kg)
                </label>
                <input
                  type="number"
                  step={0.1}
                  value={weight}
                  onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
                  className="input-light"
                />
              </div>

              <div className="mt-4">
                <label className="text-xs text-navy-500 block mb-1">
                  Container Type
                </label>
                <select
                  value={selectedContainer}
                  onChange={(e) =>
                    setSelectedContainer(e.target.value as ContainerType)
                  }
                  className="input-light"
                >
                  <option value="20GP">20&apos; General Purpose</option>
                  <option value="40GP">40&apos; General Purpose</option>
                  <option value="40HC">40&apos; High Cube</option>
                  <option value="20RF">20&apos; Reefer</option>
                  <option value="40RF">40&apos; Reefer</option>
                </select>
              </div>

              <div className="mt-4 bg-navy-50 rounded-lg p-3 text-xs text-navy-600">
                <strong>Unit Volume:</strong>{" "}
                {result.unitVolumeCBM.toFixed(6)} CBM (
                {(result.unitVolumeCBM * 1000000).toFixed(0)} cm&sup3;)
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="space-y-6">
            {/* Limiting Factor Alert */}
            {isWeightLimited && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-semibold text-amber-800">
                    Weight-Limited Container
                  </div>
                  <p className="text-xs text-amber-700 mt-1">
                    Your product is dense enough that you hit the weight limit at{" "}
                    {result.volumeUtilizationPct.toFixed(0)}% volume fill. You
                    can only load {result.optimalUnits.toLocaleString()} units
                    despite having{" "}
                    {result.wastedVolumeCBM.toFixed(1)} CBM of unused space.
                  </p>
                </div>
              </div>
            )}

            {/* Dual Utilization */}
            <div className="bg-white rounded-xl border border-navy-100 p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-navy-800 mb-4">
                Dual Utilization Analysis
              </h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="text-xs text-navy-500 mb-2">
                    Volume Utilization
                  </div>
                  <div className="h-4 bg-navy-100 rounded-full overflow-hidden mb-2">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        result.limitingFactor === "volume"
                          ? "bg-ocean-500"
                          : "bg-navy-300"
                      }`}
                      style={{
                        width: `${Math.min(result.volumeUtilizationPct, 100)}%`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-navy-600">
                    <span>
                      {result.volumeUsedCBM.toFixed(1)} /{" "}
                      {result.volumeCapacityCBM} CBM
                    </span>
                    <span className="font-semibold">
                      {result.volumeUtilizationPct.toFixed(1)}%
                    </span>
                  </div>
                  <div className="text-xs text-navy-400 mt-1">
                    {result.unitsByVolume.toLocaleString()} units by volume
                  </div>
                </div>
                <div>
                  <div className="text-xs text-navy-500 mb-2">
                    Weight Utilization
                  </div>
                  <div className="h-4 bg-navy-100 rounded-full overflow-hidden mb-2">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        result.limitingFactor === "weight"
                          ? "bg-amber-500"
                          : "bg-navy-300"
                      }`}
                      style={{
                        width: `${Math.min(result.weightUtilizationPct, 100)}%`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-navy-600">
                    <span>
                      {result.weightUsedKg.toLocaleString()} /{" "}
                      {result.weightCapacityKg.toLocaleString()} kg
                    </span>
                    <span className="font-semibold">
                      {result.weightUtilizationPct.toFixed(1)}%
                    </span>
                  </div>
                  <div className="text-xs text-navy-400 mt-1">
                    {result.unitsByWeight.toLocaleString()} units by weight
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-navy-100 grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-xs text-navy-400">Optimal Units</div>
                  <div className="text-2xl font-bold text-navy-800">
                    {result.optimalUnits.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-navy-400">Limiting Factor</div>
                  <div
                    className={`text-lg font-bold ${
                      isWeightLimited ? "text-amber-600" : "text-ocean-600"
                    }`}
                  >
                    {result.limitingFactor.toUpperCase()}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-navy-400">Freight/Unit</div>
                  <div className="text-lg font-bold text-navy-800">
                    ${result.costPerUnit.toFixed(4)}
                  </div>
                </div>
              </div>
            </div>

            {/* Container Comparison Table */}
            <div className="bg-white rounded-xl border border-navy-100 p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-navy-800 mb-4">
                Container Comparison
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-navy-100">
                      <th className="text-left py-2 text-navy-500">Type</th>
                      <th className="text-right py-2 text-navy-500">Units</th>
                      <th className="text-right py-2 text-navy-500">Vol %</th>
                      <th className="text-right py-2 text-navy-500">Wt %</th>
                      <th className="text-right py-2 text-navy-500">Limit</th>
                      <th className="text-right py-2 text-navy-500">$/Unit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allResults.map((r) => (
                      <tr
                        key={r.containerType}
                        className={`border-b border-navy-50 ${
                          r.containerType === selectedContainer
                            ? "bg-ocean-50"
                            : ""
                        }`}
                      >
                        <td className="py-2 font-medium">{r.containerLabel}</td>
                        <td className="text-right py-2">
                          {r.optimalUnits.toLocaleString()}
                        </td>
                        <td className="text-right py-2">
                          {r.volumeUtilizationPct.toFixed(0)}%
                        </td>
                        <td className="text-right py-2">
                          {r.weightUtilizationPct.toFixed(0)}%
                        </td>
                        <td
                          className={`text-right py-2 font-medium ${
                            r.limitingFactor === "weight"
                              ? "text-amber-600"
                              : "text-ocean-600"
                          }`}
                        >
                          {r.limitingFactor}
                        </td>
                        <td className="text-right py-2 font-mono">
                          ${r.costPerUnit.toFixed(4)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

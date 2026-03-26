"use client";

import { useState, useMemo, useEffect } from "react";
import { Box, Weight, Ruler, AlertTriangle } from "lucide-react";
import { calculateContainerUtilization } from "@/lib/calculators/container-utilization";
import SaveCalculationButton from "@/components/platform/SaveCalculationButton";
import { useLoadCalculation } from "@/lib/hooks/useLoadCalculation";
import type { ContainerType, ContainerUtilizationInput } from "@/lib/types";

interface ContainerUtilizationCalculatorProps {
  showSaveButton?: boolean;
}

const CONTAINER_OPTIONS: { value: ContainerType; label: string }[] = [
  { value: "20GP", label: "20' General Purpose" },
  { value: "40GP", label: "40' General Purpose" },
  { value: "40HC", label: "40' High Cube" },
  { value: "20RF", label: "20' Reefer" },
  { value: "40RF", label: "40' Reefer" },
];

export default function ContainerUtilizationCalculator({ showSaveButton }: ContainerUtilizationCalculatorProps) {
  const [containerType, setContainerType] = useState<ContainerType>("40HC");
  const [unitLengthCm, setUnitLengthCm] = useState(30);
  const [unitWidthCm, setUnitWidthCm] = useState(20);
  const [unitHeightCm, setUnitHeightCm] = useState(15);
  const [unitWeightKg, setUnitWeightKg] = useState(0.5);
  const [useMasterCase, setUseMasterCase] = useState(false);
  const [masterCasePcs, setMasterCasePcs] = useState(24);
  const [masterCaseLengthCm, setMasterCaseLengthCm] = useState(60);
  const [masterCaseWidthCm, setMasterCaseWidthCm] = useState(40);
  const [masterCaseHeightCm, setMasterCaseHeightCm] = useState(45);
  const [masterCaseWeightKg, setMasterCaseWeightKg] = useState(14);

  const { loadedInputs } = useLoadCalculation("container_utilization");

  useEffect(() => {
    if (loadedInputs) {
      setContainerType(loadedInputs.containerType as ContainerType ?? "40HC");
      setUnitLengthCm(loadedInputs.unitLengthCm as number ?? 30);
      setUnitWidthCm(loadedInputs.unitWidthCm as number ?? 20);
      setUnitHeightCm(loadedInputs.unitHeightCm as number ?? 15);
      setUnitWeightKg(loadedInputs.unitWeightKg as number ?? 0.5);
      if (loadedInputs.masterCasePcs) {
        setUseMasterCase(true);
        setMasterCasePcs(loadedInputs.masterCasePcs as number ?? 24);
        setMasterCaseLengthCm(loadedInputs.masterCaseLengthCm as number ?? 60);
        setMasterCaseWidthCm(loadedInputs.masterCaseWidthCm as number ?? 40);
        setMasterCaseHeightCm(loadedInputs.masterCaseHeightCm as number ?? 45);
        setMasterCaseWeightKg(loadedInputs.masterCaseWeightKg as number ?? 14);
      }
    }
  }, [loadedInputs]);

  const input: ContainerUtilizationInput = useMemo(() => ({
    containerType,
    unitLengthCm,
    unitWidthCm,
    unitHeightCm,
    unitWeightKg,
    ...(useMasterCase ? {
      masterCasePcs,
      masterCaseLengthCm,
      masterCaseWidthCm,
      masterCaseHeightCm,
      masterCaseWeightKg,
    } : {}),
  }), [containerType, unitLengthCm, unitWidthCm, unitHeightCm, unitWeightKg, useMasterCase, masterCasePcs, masterCaseLengthCm, masterCaseWidthCm, masterCaseHeightCm, masterCaseWeightKg]);

  const result = useMemo(() => {
    try {
      return calculateContainerUtilization(input);
    } catch {
      return null;
    }
  }, [input]);

  const fmtNum = (n: number, decimals = 0) =>
    new Intl.NumberFormat("en-US", { maximumFractionDigits: decimals }).format(n);

  return (
    <div className="grid lg:grid-cols-2 gap-10">
      {/* Inputs */}
      <div className="space-y-5">
        <h3 className="text-lg font-semibold text-navy-900 flex items-center gap-2">
          <Ruler className="w-5 h-5 text-ocean-500" />
          Unit Dimensions
        </h3>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-navy-500 block mb-1.5">Container Type</label>
            <select
              value={containerType}
              onChange={(e) => setContainerType(e.target.value as ContainerType)}
              className="input-light w-full"
            >
              {CONTAINER_OPTIONS.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-navy-500 block mb-1.5">Length (cm)</label>
              <input type="number" step="0.1" value={unitLengthCm} onChange={(e) => setUnitLengthCm(Number(e.target.value))} className="input-light" />
            </div>
            <div>
              <label className="text-xs font-medium text-navy-500 block mb-1.5">Width (cm)</label>
              <input type="number" step="0.1" value={unitWidthCm} onChange={(e) => setUnitWidthCm(Number(e.target.value))} className="input-light" />
            </div>
            <div>
              <label className="text-xs font-medium text-navy-500 block mb-1.5">Height (cm)</label>
              <input type="number" step="0.1" value={unitHeightCm} onChange={(e) => setUnitHeightCm(Number(e.target.value))} className="input-light" />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-navy-500 block mb-1.5">Unit Weight (kg)</label>
            <input type="number" step="0.01" value={unitWeightKg} onChange={(e) => setUnitWeightKg(Number(e.target.value))} className="input-light w-full" />
          </div>

          {/* Master Case Toggle */}
          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={useMasterCase}
                onChange={(e) => setUseMasterCase(e.target.checked)}
                className="rounded border-navy-300 text-ocean-600 focus:ring-ocean-500"
              />
              <span className="text-xs font-medium text-navy-500">Use Master Carton Packing</span>
            </label>
          </div>

          {useMasterCase && (
            <div className="space-y-3 pl-4 border-l-2 border-ocean-200">
              <div>
                <label className="text-xs font-medium text-navy-500 block mb-1.5">Units per Carton</label>
                <input type="number" value={masterCasePcs} onChange={(e) => setMasterCasePcs(Number(e.target.value))} className="input-light w-full" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium text-navy-500 block mb-1.5">L (cm)</label>
                  <input type="number" step="0.1" value={masterCaseLengthCm} onChange={(e) => setMasterCaseLengthCm(Number(e.target.value))} className="input-light" />
                </div>
                <div>
                  <label className="text-xs font-medium text-navy-500 block mb-1.5">W (cm)</label>
                  <input type="number" step="0.1" value={masterCaseWidthCm} onChange={(e) => setMasterCaseWidthCm(Number(e.target.value))} className="input-light" />
                </div>
                <div>
                  <label className="text-xs font-medium text-navy-500 block mb-1.5">H (cm)</label>
                  <input type="number" step="0.1" value={masterCaseHeightCm} onChange={(e) => setMasterCaseHeightCm(Number(e.target.value))} className="input-light" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-navy-500 block mb-1.5">Carton Weight (kg)</label>
                <input type="number" step="0.1" value={masterCaseWeightKg} onChange={(e) => setMasterCaseWeightKg(Number(e.target.value))} className="input-light w-full" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-navy-900 flex items-center gap-2">
          <Box className="w-5 h-5 text-cargo-500" />
          Utilization Results
        </h3>

        {result ? (
          <>
            {/* Optimal units */}
            <div className="bg-navy-50 border border-navy-100 rounded-xl p-5 text-center">
              <div className="text-xs text-navy-400 font-medium mb-1">Optimal Units per Container</div>
              <div className="text-4xl font-bold text-ocean-600">{fmtNum(result.optimalUnits)}</div>
              <div className="text-xs text-navy-500 mt-1">
                {result.container.label}
              </div>

              {/* Binding constraint badge */}
              <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span className="text-xs font-medium text-amber-700">
                  Binding constraint: {result.bindingConstraint === "volume" ? "Volume" : "Weight"}
                </span>
              </div>
            </div>

            {/* Volume vs Weight cards */}
            <div className="grid grid-cols-2 gap-4">
              {/* Volume */}
              <div className={`rounded-xl p-4 border ${result.bindingConstraint === "volume" ? "bg-ocean-50 border-ocean-200" : "bg-white border-navy-100"}`}>
                <div className="flex items-center gap-2 mb-3">
                  <Box className="w-4 h-4 text-ocean-600" />
                  <span className="text-sm font-semibold text-navy-800">By Volume</span>
                </div>
                <div className="space-y-2 text-xs text-navy-600">
                  <div className="flex justify-between">
                    <span>Units fit</span>
                    <span className="font-medium text-navy-800">{fmtNum(result.byVolume.unitsPerContainer)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Volume used</span>
                    <span className="font-medium">{fmtNum(result.byVolume.volumeUsedCBM, 1)} CBM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Capacity</span>
                    <span className="font-medium">{fmtNum(result.byVolume.volumeCapacityCBM, 1)} CBM</span>
                  </div>
                  {/* Progress bar */}
                  <div className="pt-1">
                    <div className="w-full bg-navy-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-ocean-500 rounded-full transition-all"
                        style={{ width: `${Math.min(result.byVolume.utilizationPct, 100)}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-navy-400">{fmtNum(result.byVolume.utilizationPct, 1)}% utilized</span>
                  </div>
                </div>
              </div>

              {/* Weight */}
              <div className={`rounded-xl p-4 border ${result.bindingConstraint === "weight" ? "bg-cargo-50 border-cargo-200" : "bg-white border-navy-100"}`}>
                <div className="flex items-center gap-2 mb-3">
                  <Weight className="w-4 h-4 text-cargo-600" />
                  <span className="text-sm font-semibold text-navy-800">By Weight</span>
                </div>
                <div className="space-y-2 text-xs text-navy-600">
                  <div className="flex justify-between">
                    <span>Units fit</span>
                    <span className="font-medium text-navy-800">{fmtNum(result.byWeight.unitsPerContainer)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Weight used</span>
                    <span className="font-medium">{fmtNum(result.byWeight.weightUsedKg, 0)} kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Capacity</span>
                    <span className="font-medium">{fmtNum(result.byWeight.weightCapacityKg, 0)} kg</span>
                  </div>
                  {/* Progress bar */}
                  <div className="pt-1">
                    <div className="w-full bg-navy-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-cargo-500 rounded-full transition-all"
                        style={{ width: `${Math.min(result.byWeight.utilizationPct, 100)}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-navy-400">{fmtNum(result.byWeight.utilizationPct, 1)}% utilized</span>
                  </div>
                </div>
              </div>
            </div>

            {showSaveButton && (
              <div className="flex justify-end pt-2">
                <SaveCalculationButton
                  calculatorType="container_utilization"
                  getInputs={() => input as unknown as Record<string, unknown>}
                  getOutputs={() => result as unknown as Record<string, unknown>}
                  defaultName={`Container Util - ${result.container.label}`}
                />
              </div>
            )}
          </>
        ) : (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-sm text-amber-700">
            Enter valid dimensions to see utilization results.
          </div>
        )}
      </div>
    </div>
  );
}

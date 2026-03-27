"use client";

import { useState, useMemo, useEffect } from "react";
import { Box, Package, TrendingUp } from "lucide-react";
import { calculateContainerUtilization } from "@/lib/calculators/container-utilization";
import type { ContainerUtilizationInput, ContainerType } from "@/lib/types";
import { FCL_CONTAINER_TYPES } from "@/lib/data/containers";
import SaveCalculationButton from "@/components/platform/SaveCalculationButton";
import { useLoadCalculation } from "@/lib/hooks/useLoadCalculation";

interface ContainerUtilCalculatorProps {
  showSaveButton?: boolean;
}

export default function ContainerUtilCalculator({ showSaveButton }: ContainerUtilCalculatorProps) {
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

  const input: ContainerUtilizationInput = {
    containerType,
    unitLengthCm,
    unitWidthCm,
    unitHeightCm,
    unitWeightKg,
    ...(useMasterCase && {
      masterCasePcs,
      masterCaseLengthCm,
      masterCaseWidthCm,
      masterCaseHeightCm,
      masterCaseWeightKg,
    }),
  };

  const result = useMemo(() => {
    try {
      return calculateContainerUtilization(input);
    } catch {
      return null;
    }
  }, [
    containerType, unitLengthCm, unitWidthCm, unitHeightCm, unitWeightKg,
    useMasterCase, masterCasePcs, masterCaseLengthCm, masterCaseWidthCm,
    masterCaseHeightCm, masterCaseWeightKg,
  ]);

  return (
    <div className="grid lg:grid-cols-2 gap-10">
      {/* Inputs */}
      <div className="space-y-5">
        <h3 className="text-lg font-semibold text-navy-900 flex items-center gap-2">
          <Box className="w-5 h-5 text-ocean-500" />
          Container &amp; Unit Dimensions
        </h3>

        <div>
          <label className="text-xs font-medium text-navy-500 block mb-1.5">Container Type</label>
          <select
            value={containerType}
            onChange={(e) => setContainerType(e.target.value as ContainerType)}
            className="input-light w-full"
          >
            {FCL_CONTAINER_TYPES.map((ct) => (
              <option key={ct} value={ct}>{ct}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-navy-500 block mb-1.5">Unit Length (cm)</label>
            <input
              type="number"
              value={unitLengthCm}
              onChange={(e) => setUnitLengthCm(parseFloat(e.target.value) || 0)}
              className="input-light"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-navy-500 block mb-1.5">Unit Width (cm)</label>
            <input
              type="number"
              value={unitWidthCm}
              onChange={(e) => setUnitWidthCm(parseFloat(e.target.value) || 0)}
              className="input-light"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-navy-500 block mb-1.5">Unit Height (cm)</label>
            <input
              type="number"
              value={unitHeightCm}
              onChange={(e) => setUnitHeightCm(parseFloat(e.target.value) || 0)}
              className="input-light"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-navy-500 block mb-1.5">Unit Weight (kg)</label>
            <input
              type="number"
              step="0.1"
              value={unitWeightKg}
              onChange={(e) => setUnitWeightKg(parseFloat(e.target.value) || 0)}
              className="input-light"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={useMasterCase}
              onChange={(e) => setUseMasterCase(e.target.checked)}
              className="rounded border-navy-300 text-ocean-600 focus:ring-ocean-500"
            />
            <span className="text-xs font-medium text-navy-500">Use Master Case Packing</span>
          </label>
        </div>

        {useMasterCase && (
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <label className="text-xs font-medium text-navy-500 block mb-1.5">Pcs per Case</label>
              <input
                type="number"
                value={masterCasePcs}
                onChange={(e) => setMasterCasePcs(parseInt(e.target.value) || 0)}
                className="input-light"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-navy-500 block mb-1.5">Case Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                value={masterCaseWeightKg}
                onChange={(e) => setMasterCaseWeightKg(parseFloat(e.target.value) || 0)}
                className="input-light"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-navy-500 block mb-1.5">Case Length (cm)</label>
              <input
                type="number"
                value={masterCaseLengthCm}
                onChange={(e) => setMasterCaseLengthCm(parseFloat(e.target.value) || 0)}
                className="input-light"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-navy-500 block mb-1.5">Case Width (cm)</label>
              <input
                type="number"
                value={masterCaseWidthCm}
                onChange={(e) => setMasterCaseWidthCm(parseFloat(e.target.value) || 0)}
                className="input-light"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-navy-500 block mb-1.5">Case Height (cm)</label>
              <input
                type="number"
                value={masterCaseHeightCm}
                onChange={(e) => setMasterCaseHeightCm(parseFloat(e.target.value) || 0)}
                className="input-light"
              />
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-navy-900 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-cargo-500" />
          Utilization Results
        </h3>

        {result ? (
          <>
            <div className="bg-navy-50 border border-navy-100 rounded-xl p-5">
              <div className="text-center mb-4">
                <div className="text-xs text-navy-400 font-medium mb-1">Optimal Units per Container</div>
                <div className="text-4xl font-bold text-ocean-600">
                  {result.optimalUnits.toLocaleString()}
                </div>
                <div className="text-sm text-navy-500 mt-1">
                  Binding constraint:{" "}
                  <span className={result.bindingConstraint === "weight" ? "text-cargo-600 font-semibold" : "text-ocean-600 font-semibold"}>
                    {result.bindingConstraint === "weight" ? "Weight" : "Volume"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-navy-200">
                <div className="text-center">
                  <div className="text-xs text-navy-400 font-medium">By Volume</div>
                  <div className="text-lg font-semibold text-ocean-600">
                    {result.byVolume.unitsPerContainer.toLocaleString()} units
                  </div>
                  <div className="text-xs text-navy-500">
                    {result.byVolume.utilizationPct.toFixed(1)}% utilized
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-navy-400 font-medium">By Weight</div>
                  <div className="text-lg font-semibold text-cargo-600">
                    {result.byWeight.unitsPerContainer.toLocaleString()} units
                  </div>
                  <div className="text-xs text-navy-500">
                    {result.byWeight.utilizationPct.toFixed(1)}% utilized
                  </div>
                </div>
              </div>
            </div>

            {/* Utilization bars */}
            <div className="bg-white border border-navy-100 rounded-xl p-5 shadow-soft space-y-4">
              <div>
                <div className="flex justify-between text-xs text-navy-500 mb-1">
                  <span>Volume Utilization</span>
                  <span>{result.byVolume.utilizationPct.toFixed(1)}%</span>
                </div>
                <div className="h-3 bg-navy-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-ocean-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, result.byVolume.utilizationPct)}%` }}
                  />
                </div>
                <div className="text-xs text-navy-400 mt-1">
                  {result.byVolume.volumeUsedCBM.toFixed(2)} / {result.byVolume.volumeCapacityCBM.toFixed(2)} CBM
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-navy-500 mb-1">
                  <span>Weight Utilization</span>
                  <span>{result.byWeight.utilizationPct.toFixed(1)}%</span>
                </div>
                <div className="h-3 bg-navy-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cargo-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, result.byWeight.utilizationPct)}%` }}
                  />
                </div>
                <div className="text-xs text-navy-400 mt-1">
                  {result.byWeight.weightUsedKg.toLocaleString()} / {result.byWeight.weightCapacityKg.toLocaleString()} kg
                </div>
              </div>
            </div>

            {showSaveButton && (
              <div className="flex justify-end pt-2">
                <SaveCalculationButton
                  calculatorType="container_utilization"
                  getInputs={() => input as unknown as Record<string, unknown>}
                  getOutputs={() => {
                    const { container, ...rest } = result;
                    return { ...rest, containerType: container.type } as unknown as Record<string, unknown>;
                  }}
                  defaultName={`Container Util - ${containerType}`}
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

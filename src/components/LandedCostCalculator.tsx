"use client";

import { useState, useMemo, useEffect } from "react";
import { DollarSign, Package, TrendingUp } from "lucide-react";
import { calculateLandedCost } from "@/lib/calculators/landed-cost";
import type { LandedCostInput } from "@/lib/types";
import SaveCalculationButton from "@/components/platform/SaveCalculationButton";
import { useLoadCalculation } from "@/lib/hooks/useLoadCalculation";

interface LandedCostCalculatorProps {
  showSaveButton?: boolean;
}

export default function LandedCostCalculator({ showSaveButton }: LandedCostCalculatorProps) {
  const [productDescription, setProductDescription] = useState("Consumer goods");
  const [htsCode, setHtsCode] = useState("4202.92.30");
  const [countryOfOrigin, setCountryOfOrigin] = useState<string>("VN");
  const [unitCostFOB, setUnitCostFOB] = useState(0.5);
  const [totalUnits, setTotalUnits] = useState(500000);
  const [containerType, setContainerType] = useState<string>("40HC");
  const [originPort, setOriginPort] = useState("VNSGN");
  const [destPort, setDestPort] = useState("USLAX");
  const [shippingMode, setShippingMode] = useState<string>("ocean-fcl");
  const [freightCostTotal, setFreightCostTotal] = useState(5000);
  const [customsBrokerFee, setCustomsBrokerFee] = useState(250);
  const [insuranceRate, setInsuranceRate] = useState(0.5);
  const [drayageCost, setDrayageCost] = useState(800);
  const [warehousingPerUnit, setWarehousingPerUnit] = useState(0.02);
  const [fulfillmentPerUnit, setFulfillmentPerUnit] = useState(0.15);
  const [useFTZ, setUseFTZ] = useState(false);
  const [ftzStorageMonths, setFtzStorageMonths] = useState(3);
  const [ftzStorageFeePerUnit, setFtzStorageFeePerUnit] = useState(0.005);

  const { loadedInputs } = useLoadCalculation("landed_cost");

  useEffect(() => {
    if (loadedInputs) {
      setProductDescription(loadedInputs.productDescription as string ?? "Consumer goods");
      setHtsCode(loadedInputs.htsCode as string ?? "4202.92.30");
      setCountryOfOrigin(loadedInputs.countryOfOrigin as string ?? "VN");
      setUnitCostFOB(loadedInputs.unitCostFOB as number ?? 0.5);
      setTotalUnits(loadedInputs.totalUnits as number ?? 500000);
      setContainerType(loadedInputs.containerType as string ?? "40HC");
      setOriginPort(loadedInputs.originPort as string ?? "VNSGN");
      setDestPort(loadedInputs.destPort as string ?? "USLAX");
      setShippingMode(loadedInputs.shippingMode as string ?? "ocean-fcl");
      setFreightCostTotal(loadedInputs.freightCostTotal as number ?? 5000);
      setCustomsBrokerFee(loadedInputs.customsBrokerFee as number ?? 250);
      setInsuranceRate(loadedInputs.insuranceRate as number ?? 0.5);
      setDrayageCost(loadedInputs.drayageCost as number ?? 800);
      setWarehousingPerUnit(loadedInputs.warehousingPerUnit as number ?? 0.02);
      setFulfillmentPerUnit(loadedInputs.fulfillmentPerUnit as number ?? 0.15);
      setUseFTZ(loadedInputs.useFTZ as boolean ?? false);
      setFtzStorageMonths(loadedInputs.ftzStorageMonths as number ?? 3);
      setFtzStorageFeePerUnit(loadedInputs.ftzStorageFeePerUnit as number ?? 0.005);
    }
  }, [loadedInputs]);

  const input: LandedCostInput = {
    productDescription,
    htsCode,
    countryOfOrigin: countryOfOrigin as LandedCostInput["countryOfOrigin"],
    unitCostFOB,
    totalUnits,
    containerType: containerType as LandedCostInput["containerType"],
    originPort,
    destPort,
    shippingMode: shippingMode as LandedCostInput["shippingMode"],
    freightCostTotal,
    customsBrokerFee,
    insuranceRate,
    drayageCost,
    warehousingPerUnit,
    fulfillmentPerUnit,
    useFTZ,
    ftzStorageMonths,
    ftzStorageFeePerUnit,
  };

  const result = useMemo(() => {
    try {
      return calculateLandedCost(input);
    } catch {
      return null;
    }
  }, [
    productDescription, htsCode, countryOfOrigin, unitCostFOB, totalUnits,
    containerType, originPort, destPort, shippingMode, freightCostTotal,
    customsBrokerFee, insuranceRate, drayageCost, warehousingPerUnit,
    fulfillmentPerUnit, useFTZ, ftzStorageMonths, ftzStorageFeePerUnit,
  ]);

  return (
    <div className="grid lg:grid-cols-2 gap-10">
      {/* Inputs */}
      <div className="space-y-5">
        <h3 className="text-lg font-semibold text-navy-900 flex items-center gap-2">
          <Package className="w-5 h-5 text-ocean-500" />
          Import Parameters
        </h3>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-navy-500 block mb-1.5">Product Description</label>
            <input
              type="text"
              value={productDescription}
              onChange={(e) => setProductDescription(e.target.value)}
              className="input-light w-full"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-navy-500 block mb-1.5">HTS Code</label>
              <input
                type="text"
                value={htsCode}
                onChange={(e) => setHtsCode(e.target.value)}
                className="input-light"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-navy-500 block mb-1.5">Country of Origin</label>
              <select
                value={countryOfOrigin}
                onChange={(e) => setCountryOfOrigin(e.target.value)}
                className="input-light"
              >
                <option value="CN">China</option>
                <option value="VN">Vietnam</option>
                <option value="TH">Thailand</option>
                <option value="ID">Indonesia</option>
                <option value="KH">Cambodia</option>
                <option value="IN">India</option>
                <option value="BD">Bangladesh</option>
                <option value="MX">Mexico</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-navy-500 block mb-1.5">Unit Cost FOB</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-navy-400 text-sm">$</span>
                <input
                  type="number"
                  step="0.01"
                  value={unitCostFOB}
                  onChange={(e) => setUnitCostFOB(parseFloat(e.target.value) || 0)}
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-navy-500 block mb-1.5">Freight Cost (total)</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-navy-400 text-sm">$</span>
                <input
                  type="number"
                  value={freightCostTotal}
                  onChange={(e) => setFreightCostTotal(parseFloat(e.target.value) || 0)}
                  className="input-light pl-7"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-navy-500 block mb-1.5">Insurance Rate (%)</label>
              <input
                type="number"
                step="0.1"
                value={insuranceRate}
                onChange={(e) => setInsuranceRate(parseFloat(e.target.value) || 0)}
                className="input-light"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-navy-500 block mb-1.5">Customs Broker Fee</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-navy-400 text-sm">$</span>
                <input
                  type="number"
                  value={customsBrokerFee}
                  onChange={(e) => setCustomsBrokerFee(parseFloat(e.target.value) || 0)}
                  className="input-light pl-7"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-navy-500 block mb-1.5">Drayage Cost</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-navy-400 text-sm">$</span>
                <input
                  type="number"
                  value={drayageCost}
                  onChange={(e) => setDrayageCost(parseFloat(e.target.value) || 0)}
                  className="input-light pl-7"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-navy-500 block mb-1.5">Warehousing/Unit</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-navy-400 text-sm">$</span>
                <input
                  type="number"
                  step="0.01"
                  value={warehousingPerUnit}
                  onChange={(e) => setWarehousingPerUnit(parseFloat(e.target.value) || 0)}
                  className="input-light pl-7"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-navy-500 block mb-1.5">Fulfillment/Unit</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-navy-400 text-sm">$</span>
                <input
                  type="number"
                  step="0.01"
                  value={fulfillmentPerUnit}
                  onChange={(e) => setFulfillmentPerUnit(parseFloat(e.target.value) || 0)}
                  className="input-light pl-7"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={useFTZ}
                onChange={(e) => setUseFTZ(e.target.checked)}
                className="rounded border-navy-300 text-ocean-600 focus:ring-ocean-500"
              />
              <span className="text-xs font-medium text-navy-500">Use FTZ</span>
            </label>
          </div>

          {useFTZ && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-navy-500 block mb-1.5">FTZ Storage Months</label>
                <input
                  type="number"
                  value={ftzStorageMonths}
                  onChange={(e) => setFtzStorageMonths(parseInt(e.target.value) || 0)}
                  className="input-light"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-navy-500 block mb-1.5">Storage Fee/Unit/Mo</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-navy-400 text-sm">$</span>
                  <input
                    type="number"
                    step="0.001"
                    value={ftzStorageFeePerUnit}
                    onChange={(e) => setFtzStorageFeePerUnit(parseFloat(e.target.value) || 0)}
                    className="input-light pl-7"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-navy-900 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-cargo-500" />
          Landed Cost Breakdown
        </h3>

        {result ? (
          <>
            {/* Cost breakdown */}
            <div className="bg-navy-50 border border-navy-100 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="text-center flex-1">
                  <div className="text-xs text-navy-400 font-medium">Per Unit Landed Cost</div>
                  <div className="text-3xl font-bold text-ocean-600">
                    ${result.perUnit.total.toFixed(4)}
                  </div>
                </div>
                <div className="text-center flex-1">
                  <div className="text-xs text-navy-400 font-medium">Grand Total</div>
                  <div className="text-3xl font-bold text-cargo-600">
                    ${result.total.grandTotal.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-navy-200">
                <div className="text-center">
                  <div className="text-xs text-navy-400">Effective Duty Rate</div>
                  <div className="text-lg font-semibold text-cargo-600">
                    {result.effectiveDutyRate.toFixed(1)}%
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-navy-400">Duty Total</div>
                  <div className="text-lg font-semibold text-cargo-600">
                    ${result.total.duty.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                  </div>
                </div>
              </div>
            </div>

            {/* Breakdown list */}
            <div className="bg-white border border-navy-100 rounded-xl p-5 shadow-soft">
              <div className="text-sm font-medium text-navy-400 mb-3 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-ocean-400" />
                Per-Unit Breakdown
              </div>
              <div className="space-y-2">
                {result.breakdown.map((item) => (
                  <div key={item.label} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                      <span className="text-navy-600">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-navy-500">${item.perUnit.toFixed(4)}/unit</span>
                      <span className="text-navy-400 w-12 text-right">{item.pct.toFixed(1)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {showSaveButton && (
              <div className="flex justify-end pt-2">
                <SaveCalculationButton
                  calculatorType="landed_cost"
                  getInputs={() => input as unknown as Record<string, unknown>}
                  getOutputs={() => result as unknown as Record<string, unknown>}
                  defaultName={`Landed Cost - ${productDescription || htsCode}`}
                />
              </div>
            )}
          </>
        ) : (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-sm text-amber-700">
            Enter valid parameters to see the landed cost breakdown.
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { DollarSign, TrendingUp, Package, Truck } from "lucide-react";
import SaveCalculationButton from "@/components/platform/SaveCalculationButton";
import { useLoadCalculation } from "@/lib/hooks/useLoadCalculation";

interface EconomicsResult {
  originCost: number;
  shippingPerUnit: number;
  dutyPerUnit: number;
  fulfillmentPerUnit: number;
  landedCost: number;
  wholesalePrice: number;
  retailPrice: number;
  wholesaleMargin: number;
  retailMargin: number;
  profitPerUnit: number;
  containerProfit: number;
}

function calculate(
  unitCost: number,
  unitsPerContainer: number,
  containerCost: number,
  dutyRate: number,
  fulfillmentCost: number,
  wholesaleMarkup: number,
  retailPrice: number
): EconomicsResult {
  const shippingPerUnit = containerCost / unitsPerContainer;
  const dutyPerUnit = unitCost * (dutyRate / 100);
  const landedCost = unitCost + shippingPerUnit + dutyPerUnit + fulfillmentCost;
  const wholesalePrice = landedCost * (1 + wholesaleMarkup / 100);
  const wholesaleMargin = ((wholesalePrice - landedCost) / wholesalePrice) * 100;
  const retailMargin = ((retailPrice - wholesalePrice) / retailPrice) * 100;
  const profitPerUnit = wholesalePrice - landedCost;
  const containerProfit = profitPerUnit * unitsPerContainer;

  return {
    originCost: unitCost,
    shippingPerUnit,
    dutyPerUnit,
    fulfillmentPerUnit: fulfillmentCost,
    landedCost,
    wholesalePrice,
    retailPrice,
    wholesaleMargin,
    retailMargin,
    profitPerUnit,
    containerProfit,
  };
}

interface UnitEconomicsCalculatorProps {
  showSaveButton?: boolean;
}

export default function UnitEconomicsCalculator({ showSaveButton }: UnitEconomicsCalculatorProps) {
  const [unitCost, setUnitCost] = useState(0.1);
  const [unitsPerContainer, setUnitsPerContainer] = useState(500000);
  const [containerCost, setContainerCost] = useState(5000);
  const [dutyRate, setDutyRate] = useState(6.5);
  const [fulfillmentCost, setFulfillmentCost] = useState(0.15);
  const [wholesaleMarkup, setWholesaleMarkup] = useState(300);
  const [retailPrice, setRetailPrice] = useState(5.0);

  const { loadedInputs } = useLoadCalculation("unit_economics");

  useEffect(() => {
    if (loadedInputs) {
      setUnitCost(loadedInputs.unitCost as number ?? 0.1);
      setUnitsPerContainer(loadedInputs.unitsPerContainer as number ?? 500000);
      setContainerCost(loadedInputs.containerCost as number ?? 5000);
      setDutyRate(loadedInputs.dutyRate as number ?? 6.5);
      setFulfillmentCost(loadedInputs.fulfillmentCost as number ?? 0.15);
      setWholesaleMarkup(loadedInputs.wholesaleMarkup as number ?? 300);
      setRetailPrice(loadedInputs.retailPrice as number ?? 5.0);
    }
  }, [loadedInputs]);

  const result = calculate(
    unitCost,
    unitsPerContainer,
    containerCost,
    dutyRate,
    fulfillmentCost,
    wholesaleMarkup,
    retailPrice
  );

  const costBreakdown = [
    { label: "Origin Cost", value: result.originCost, color: "bg-ocean-500" },
    { label: "Shipping", value: result.shippingPerUnit, color: "bg-ocean-400" },
    { label: "Duty/Tariff", value: result.dutyPerUnit, color: "bg-cargo-500" },
    { label: "Fulfillment", value: result.fulfillmentPerUnit, color: "bg-cargo-400" },
  ];

  const totalCost = costBreakdown.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="grid lg:grid-cols-2 gap-10">
      {/* Inputs */}
      <div className="space-y-5">
        <h3 className="text-lg font-semibold text-navy-900 flex items-center gap-2">
          <Package className="w-5 h-5 text-ocean-500" />
          Import Parameters
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-navy-500 block mb-1.5">
              Unit Cost at Origin
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-navy-400 text-sm">$</span>
              <input
                type="number"
                step="0.01"
                value={unitCost}
                onChange={(e) => setUnitCost(parseFloat(e.target.value) || 0)}
                className="input-light pl-7"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-navy-500 block mb-1.5">
              Units per Container
            </label>
            <input
              type="number"
              value={unitsPerContainer}
              onChange={(e) => setUnitsPerContainer(parseInt(e.target.value) || 0)}
              className="input-light"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-navy-500 block mb-1.5">
              Container Shipping Cost
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-navy-400 text-sm">$</span>
              <input
                type="number"
                value={containerCost}
                onChange={(e) => setContainerCost(parseFloat(e.target.value) || 0)}
                className="input-light pl-7"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-navy-500 block mb-1.5">
              Duty Rate (%)
            </label>
            <input
              type="number"
              step="0.1"
              value={dutyRate}
              onChange={(e) => setDutyRate(parseFloat(e.target.value) || 0)}
              className="input-light"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-navy-500 block mb-1.5">
              Fulfillment Cost/Unit
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-navy-400 text-sm">$</span>
              <input
                type="number"
                step="0.01"
                value={fulfillmentCost}
                onChange={(e) => setFulfillmentCost(parseFloat(e.target.value) || 0)}
                className="input-light pl-7"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-navy-500 block mb-1.5">
              Wholesale Markup (%)
            </label>
            <input
              type="number"
              value={wholesaleMarkup}
              onChange={(e) => setWholesaleMarkup(parseFloat(e.target.value) || 0)}
              className="input-light"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-navy-500 block mb-1.5">
            Target Retail Price
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-navy-400 text-sm">$</span>
            <input
              type="number"
              step="0.01"
              value={retailPrice}
              onChange={(e) => setRetailPrice(parseFloat(e.target.value) || 0)}
              className="input-light pl-7"
            />
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-navy-900 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-cargo-500" />
          Unit Economics
        </h3>

        {/* Cost breakdown bar */}
        <div>
          <div className="flex rounded-lg overflow-hidden h-8 mb-3 shadow-inner-soft">
            {costBreakdown.map((item) => (
              <div
                key={item.label}
                className={`${item.color} flex items-center justify-center text-[10px] font-medium text-white transition-all duration-500`}
                style={{ width: `${(item.value / totalCost) * 100}%` }}
              >
                {((item.value / totalCost) * 100).toFixed(0)}%
              </div>
            ))}
          </div>
          <div className="flex gap-4 flex-wrap">
            {costBreakdown.map((item) => (
              <div key={item.label} className="flex items-center gap-1.5 text-xs text-navy-600">
                <div className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                {item.label}: ${item.value.toFixed(4)}
              </div>
            ))}
          </div>
        </div>

        {/* Value chain */}
        <div className="bg-navy-50 border border-navy-100 rounded-xl p-5">
          <div className="flex items-center justify-between text-sm mb-6">
            <div className="text-center">
              <div className="text-navy-400 text-xs font-medium">Origin</div>
              <div className="text-xl font-bold text-ocean-600">
                ${result.originCost.toFixed(2)}
              </div>
            </div>
            <div className="text-navy-300 text-lg">&rarr;</div>
            <div className="text-center">
              <div className="text-navy-400 text-xs font-medium">Landed</div>
              <div className="text-xl font-bold text-ocean-700">
                ${result.landedCost.toFixed(2)}
              </div>
            </div>
            <div className="text-navy-300 text-lg">&rarr;</div>
            <div className="text-center">
              <div className="text-navy-400 text-xs font-medium">Wholesale</div>
              <div className="text-xl font-bold text-cargo-600">
                ${result.wholesalePrice.toFixed(2)}
              </div>
            </div>
            <div className="text-navy-300 text-lg">&rarr;</div>
            <div className="text-center">
              <div className="text-navy-400 text-xs font-medium">Retail</div>
              <div className="text-xl font-bold text-cargo-700">
                ${result.retailPrice.toFixed(2)}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-navy-200">
            <div className="text-center">
              <div className="text-xs text-navy-400 font-medium">Profit/Unit</div>
              <div className="text-lg font-bold text-emerald-600">
                ${result.profitPerUnit.toFixed(2)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-navy-400 font-medium">Wholesale Margin</div>
              <div className="text-lg font-bold text-emerald-600">
                {result.wholesaleMargin.toFixed(1)}%
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-navy-400 font-medium">Container Profit</div>
              <div className="text-lg font-bold text-emerald-600">
                ${result.containerProfit.toLocaleString("en-US", { maximumFractionDigits: 0 })}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-amber-600" />
            <span className="text-sm font-semibold text-amber-700">ROI Highlight</span>
          </div>
          <p className="text-sm text-navy-600">
            At <strong className="text-navy-900">${result.originCost.toFixed(2)}/unit</strong> origin cost
            with <strong className="text-navy-900">{unitsPerContainer.toLocaleString()}</strong> units per container,
            you generate <strong className="text-emerald-600">${result.containerProfit.toLocaleString("en-US", { maximumFractionDigits: 0 })}</strong> profit
            per container after all costs. That&apos;s a{" "}
            <strong className="text-emerald-600">
              {((result.profitPerUnit / result.landedCost) * 100).toFixed(0)}%
            </strong>{" "}
            return on landed cost.
          </p>
        </div>

        {showSaveButton && (
          <div className="flex justify-end pt-2">
            <SaveCalculationButton
              calculatorType="unit_economics"
              getInputs={() => ({
                unitCost,
                unitsPerContainer,
                containerCost,
                dutyRate,
                fulfillmentCost,
                wholesaleMarkup,
                retailPrice,
              })}
              getOutputs={() => result as unknown as Record<string, unknown>}
              defaultName={`Unit Economics - $${unitCost}/unit`}
            />
          </div>
        )}
      </div>
    </div>
  );
}

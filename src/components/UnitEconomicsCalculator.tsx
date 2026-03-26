"use client";

import { useState, useMemo } from "react";
import { DollarSign, TrendingUp, Package } from "lucide-react";
import {
  calculateUnitEconomics,
  createDefaultUnitEconomicsInput,
  type UnitEconomicsInput,
} from "@/lib/calculators/unit-economics";

export default function UnitEconomicsCalculator() {
  const [input, setInput] = useState<UnitEconomicsInput>(
    createDefaultUnitEconomicsInput()
  );

  const result = useMemo(() => calculateUnitEconomics(input), [input]);

  const update = (field: keyof UnitEconomicsInput, value: number) => {
    setInput((prev) => ({ ...prev, [field]: value }));
  };

  const costBreakdown = [
    { label: "Origin Cost", value: result.originCost, color: "bg-ocean-500" },
    { label: "Shipping", value: result.shippingPerUnit, color: "bg-ocean-400" },
    { label: "Duty/Tariff", value: result.dutyPerUnit, color: "bg-cargo-500" },
    { label: "Insurance", value: result.insurancePerUnit, color: "bg-cargo-400" },
    { label: "Fulfillment", value: result.fulfillmentPerUnit, color: "bg-purple-500" },
    ...(result.returnsCostPerUnit > 0
      ? [{ label: "Returns", value: result.returnsCostPerUnit, color: "bg-red-400" }]
      : []),
    ...(result.paymentFeePerUnit > 0
      ? [{ label: "Payment Fee", value: result.paymentFeePerUnit, color: "bg-amber-400" }]
      : []),
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
                value={input.unitCostOrigin}
                onChange={(e) => update("unitCostOrigin", parseFloat(e.target.value) || 0)}
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
              value={input.unitsPerContainer}
              onChange={(e) => update("unitsPerContainer", parseInt(e.target.value) || 0)}
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
                value={input.containerShippingCost}
                onChange={(e) => update("containerShippingCost", parseFloat(e.target.value) || 0)}
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
              value={input.dutyRate}
              onChange={(e) => update("dutyRate", parseFloat(e.target.value) || 0)}
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
                value={input.fulfillmentCostPerUnit}
                onChange={(e) => update("fulfillmentCostPerUnit", parseFloat(e.target.value) || 0)}
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
              value={input.wholesaleMarkup}
              onChange={(e) => update("wholesaleMarkup", parseFloat(e.target.value) || 0)}
              className="input-light"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-navy-500 block mb-1.5">
              Target Retail Price
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-navy-400 text-sm">$</span>
              <input
                type="number"
                step="0.01"
                value={input.targetRetailPrice}
                onChange={(e) => update("targetRetailPrice", parseFloat(e.target.value) || 0)}
                className="input-light pl-7"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-navy-500 block mb-1.5">
              Returns Rate (%)
            </label>
            <input
              type="number"
              step="0.1"
              value={input.returnsRate}
              onChange={(e) => update("returnsRate", parseFloat(e.target.value) || 0)}
              className="input-light"
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
                style={{ width: `${Math.max((item.value / totalCost) * 100, 1)}%` }}
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
                ${result.landedCostPerUnit.toFixed(2)}
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
              <div className={`text-lg font-bold ${result.profitPerUnit > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                ${result.profitPerUnit.toFixed(2)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-navy-400 font-medium">Net Margin</div>
              <div className={`text-lg font-bold ${result.netMarginPct > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                {result.netMarginPct.toFixed(1)}%
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-navy-400 font-medium">Container Profit</div>
              <div className={`text-lg font-bold ${result.containerProfit > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
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
            with <strong className="text-navy-900">{input.unitsPerContainer.toLocaleString()}</strong> units per container,
            you generate <strong className={result.containerProfit > 0 ? "text-emerald-600" : "text-red-500"}>
              ${result.containerProfit.toLocaleString("en-US", { maximumFractionDigits: 0 })}
            </strong> profit
            per container after all costs. That&apos;s a{" "}
            <strong className={result.roi > 0 ? "text-emerald-600" : "text-red-500"}>
              {result.roi.toFixed(0)}%
            </strong>{" "}
            return on total cost.
          </p>
        </div>
      </div>
    </div>
  );
}

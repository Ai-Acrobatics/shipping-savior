"use client";

import { useState } from "react";
import { DollarSign, TrendingUp, Package, Truck } from "lucide-react";

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

export default function UnitEconomicsCalculator() {
  const [unitCost, setUnitCost] = useState(0.1);
  const [unitsPerContainer, setUnitsPerContainer] = useState(500000);
  const [containerCost, setContainerCost] = useState(5000);
  const [dutyRate, setDutyRate] = useState(6.5);
  const [fulfillmentCost, setFulfillmentCost] = useState(0.15);
  const [wholesaleMarkup, setWholesaleMarkup] = useState(300);
  const [retailPrice, setRetailPrice] = useState(5.0);

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
    { label: "Origin Cost", value: result.originCost, color: "bg-ocean-600" },
    { label: "Shipping", value: result.shippingPerUnit, color: "bg-ocean-500" },
    { label: "Duty/Tariff", value: result.dutyPerUnit, color: "bg-cargo-600" },
    { label: "Fulfillment", value: result.fulfillmentPerUnit, color: "bg-cargo-500" },
  ];

  const totalCost = costBreakdown.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Inputs */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-navy-100 flex items-center gap-2">
          <Package className="w-5 h-5 text-ocean-400" />
          Import Parameters
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-navy-300 block mb-1">
              Unit Cost at Origin
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-navy-400 text-sm">$</span>
              <input
                type="number"
                step="0.01"
                value={unitCost}
                onChange={(e) => setUnitCost(parseFloat(e.target.value) || 0)}
                className="w-full glass rounded-lg px-7 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ocean-500 bg-navy-900/50"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-navy-300 block mb-1">
              Units per Container
            </label>
            <input
              type="number"
              value={unitsPerContainer}
              onChange={(e) => setUnitsPerContainer(parseInt(e.target.value) || 0)}
              className="w-full glass rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ocean-500 bg-navy-900/50"
            />
          </div>

          <div>
            <label className="text-xs text-navy-300 block mb-1">
              Container Shipping Cost
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-navy-400 text-sm">$</span>
              <input
                type="number"
                value={containerCost}
                onChange={(e) => setContainerCost(parseFloat(e.target.value) || 0)}
                className="w-full glass rounded-lg px-7 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ocean-500 bg-navy-900/50"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-navy-300 block mb-1">
              Duty Rate (%)
            </label>
            <input
              type="number"
              step="0.1"
              value={dutyRate}
              onChange={(e) => setDutyRate(parseFloat(e.target.value) || 0)}
              className="w-full glass rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ocean-500 bg-navy-900/50"
            />
          </div>

          <div>
            <label className="text-xs text-navy-300 block mb-1">
              Fulfillment Cost/Unit
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-navy-400 text-sm">$</span>
              <input
                type="number"
                step="0.01"
                value={fulfillmentCost}
                onChange={(e) => setFulfillmentCost(parseFloat(e.target.value) || 0)}
                className="w-full glass rounded-lg px-7 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ocean-500 bg-navy-900/50"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-navy-300 block mb-1">
              Wholesale Markup (%)
            </label>
            <input
              type="number"
              value={wholesaleMarkup}
              onChange={(e) => setWholesaleMarkup(parseFloat(e.target.value) || 0)}
              className="w-full glass rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ocean-500 bg-navy-900/50"
            />
          </div>
        </div>

        <div>
          <label className="text-xs text-navy-300 block mb-1">
            Target Retail Price
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-navy-400 text-sm">$</span>
            <input
              type="number"
              step="0.01"
              value={retailPrice}
              onChange={(e) => setRetailPrice(parseFloat(e.target.value) || 0)}
              className="w-full glass rounded-lg px-7 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ocean-500 bg-navy-900/50"
            />
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-navy-100 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-cargo-400" />
          Unit Economics
        </h3>

        {/* Cost breakdown bar */}
        <div>
          <div className="flex rounded-lg overflow-hidden h-8 mb-2">
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
              <div key={item.label} className="flex items-center gap-1.5 text-xs text-navy-300">
                <div className={`w-2 h-2 rounded-full ${item.color}`} />
                {item.label}: ${item.value.toFixed(4)}
              </div>
            ))}
          </div>
        </div>

        {/* Value chain */}
        <div className="glass rounded-xl p-4">
          <div className="flex items-center justify-between text-sm mb-6">
            <div className="text-center">
              <div className="text-navy-400 text-xs">Origin</div>
              <div className="text-xl font-bold text-ocean-300">
                ${result.originCost.toFixed(2)}
              </div>
            </div>
            <div className="text-navy-600">→</div>
            <div className="text-center">
              <div className="text-navy-400 text-xs">Landed</div>
              <div className="text-xl font-bold text-ocean-400">
                ${result.landedCost.toFixed(2)}
              </div>
            </div>
            <div className="text-navy-600">→</div>
            <div className="text-center">
              <div className="text-navy-400 text-xs">Wholesale</div>
              <div className="text-xl font-bold text-cargo-400">
                ${result.wholesalePrice.toFixed(2)}
              </div>
            </div>
            <div className="text-navy-600">→</div>
            <div className="text-center">
              <div className="text-navy-400 text-xs">Retail</div>
              <div className="text-xl font-bold text-cargo-300">
                ${result.retailPrice.toFixed(2)}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
            <div className="text-center">
              <div className="text-xs text-navy-400">Profit/Unit</div>
              <div className="text-lg font-bold text-green-400">
                ${result.profitPerUnit.toFixed(2)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-navy-400">Wholesale Margin</div>
              <div className="text-lg font-bold text-green-400">
                {result.wholesaleMargin.toFixed(1)}%
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-navy-400">Container Profit</div>
              <div className="text-lg font-bold text-green-400">
                ${result.containerProfit.toLocaleString("en-US", { maximumFractionDigits: 0 })}
              </div>
            </div>
          </div>
        </div>

        <div className="glass rounded-xl p-4 border-cargo-500/30">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-cargo-400" />
            <span className="text-sm font-medium text-cargo-300">ROI Highlight</span>
          </div>
          <p className="text-sm text-navy-300">
            At <strong className="text-white">${result.originCost.toFixed(2)}/unit</strong> origin cost
            with <strong className="text-white">{unitsPerContainer.toLocaleString()}</strong> units per container,
            you generate <strong className="text-green-400">${result.containerProfit.toLocaleString("en-US", { maximumFractionDigits: 0 })}</strong> profit
            per container after all costs. That&apos;s a{" "}
            <strong className="text-green-400">
              {((result.profitPerUnit / result.landedCost) * 100).toFixed(0)}%
            </strong>{" "}
            return on landed cost.
          </p>
        </div>
      </div>
    </div>
  );
}

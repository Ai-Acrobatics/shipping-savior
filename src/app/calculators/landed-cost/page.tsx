"use client";

import { useState, useMemo } from "react";
import {
  DollarSign,
  AlertTriangle,
  TrendingUp,
  Eye,
  EyeOff,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import {
  calculateLandedCostEngine,
  createDefaultLandedCostInput,
  type LandedCostInput,
} from "@/lib/calculators/landed-cost-engine";

function formatUSD(value: number, decimals = 2): string {
  return `$${value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

export default function LandedCostCalculatorPage() {
  const [input, setInput] = useState<LandedCostInput>(
    createDefaultLandedCostInput()
  );
  const [showHidden, setShowHidden] = useState(true);

  const result = useMemo(() => calculateLandedCostEngine(input), [input]);

  const update = (field: keyof LandedCostInput, value: number | string) => {
    setInput((prev) => ({ ...prev, [field]: value }));
  };

  const costItems = [
    { label: "Product (FOB)", value: result.perUnit.product, color: "bg-blue-500" },
    { label: "Shipping", value: result.perUnit.shipping, color: "bg-blue-400" },
    { label: "Duty", value: result.perUnit.duty, color: "bg-amber-500" },
    { label: "Insurance", value: result.perUnit.insurance, color: "bg-amber-400", hidden: true },
    { label: "MPF", value: result.perUnit.mpf, color: "bg-orange-500", hidden: true },
    { label: "HMF", value: result.perUnit.hmf, color: "bg-orange-400", hidden: true },
    { label: "Brokerage", value: result.perUnit.brokerage, color: "bg-red-400", hidden: true },
    { label: "ISF Filing", value: result.perUnit.isf, color: "bg-red-300", hidden: true },
    { label: "Bond", value: result.perUnit.bond, color: "bg-purple-500", hidden: true },
    { label: "Exam Risk", value: result.perUnit.examRisk, color: "bg-purple-400", hidden: true },
    { label: "Demurrage", value: result.perUnit.demurrageRisk, color: "bg-pink-500", hidden: true },
    { label: "Detention", value: result.perUnit.detentionRisk, color: "bg-pink-400", hidden: true },
    { label: "Chassis", value: result.perUnit.chassis, color: "bg-slate-500", hidden: true },
    { label: "Drayage", value: result.perUnit.drayage, color: "bg-slate-400" },
    { label: "Fulfillment", value: result.perUnit.fulfillment, color: "bg-emerald-500" },
  ].filter((item) => showHidden || !item.hidden);

  const totalVisible = costItems.reduce((s, i) => s + i.value, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-50 to-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-navy-500 hover:text-ocean-600 mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-navy-900">
              Landed Cost Calculator
            </h1>
            <p className="text-navy-500 mt-1">
              Complete import cost analysis with ALL hidden costs
            </p>
          </div>
          <button
            onClick={() => setShowHidden(!showHidden)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-sm font-medium hover:bg-amber-100 transition"
          >
            {showHidden ? (
              <Eye className="w-4 h-4" />
            ) : (
              <EyeOff className="w-4 h-4" />
            )}
            {showHidden ? "Showing" : "Hidden"} Costs
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Inputs Column */}
          <div className="lg:col-span-1 space-y-6">
            {/* Product */}
            <div className="bg-white rounded-xl border border-navy-100 p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-navy-800 mb-4">
                Product & Container
              </h3>
              <div className="space-y-3">
                <InputField
                  label="Unit Cost (FOB)"
                  value={input.unitCostOrigin}
                  onChange={(v) => update("unitCostOrigin", v)}
                  prefix="$"
                  step={0.01}
                />
                <InputField
                  label="Units per Container"
                  value={input.unitsPerContainer}
                  onChange={(v) => update("unitsPerContainer", v)}
                  step={100}
                />
                <InputField
                  label="Container Shipping Cost"
                  value={input.containerShippingCost}
                  onChange={(v) => update("containerShippingCost", v)}
                  prefix="$"
                />
                <div>
                  <label className="text-xs font-medium text-navy-500 block mb-1">
                    Incoterm
                  </label>
                  <select
                    value={input.incoterm}
                    onChange={(e) =>
                      update("incoterm", e.target.value)
                    }
                    className="input-light text-sm"
                  >
                    <option value="FOB">FOB</option>
                    <option value="CIF">CIF</option>
                    <option value="DDP">DDP</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Duty & Government Fees */}
            <div className="bg-white rounded-xl border border-navy-100 p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-navy-800 mb-4">
                Duty & Government Fees
              </h3>
              <div className="space-y-3">
                <InputField
                  label="Duty Rate"
                  value={input.dutyRate}
                  onChange={(v) => update("dutyRate", v)}
                  suffix="%"
                  step={0.1}
                />
                <InputField
                  label="Insurance Rate"
                  value={input.insuranceRate}
                  onChange={(v) => update("insuranceRate", v)}
                  suffix="%"
                  step={0.1}
                />
                <InputField
                  label="MPF Rate"
                  value={input.mpfRate}
                  onChange={(v) => update("mpfRate", v)}
                  suffix="%"
                  step={0.0001}
                />
                <InputField
                  label="HMF Rate"
                  value={input.hmfRate}
                  onChange={(v) => update("hmfRate", v)}
                  suffix="%"
                  step={0.001}
                />
              </div>
            </div>

            {/* Service Fees */}
            <div className="bg-white rounded-xl border border-navy-100 p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-navy-800 mb-4">
                Service Fees & Logistics
              </h3>
              <div className="space-y-3">
                <InputField
                  label="Customs Broker Fee"
                  value={input.customsBrokerFee}
                  onChange={(v) => update("customsBrokerFee", v)}
                  prefix="$"
                />
                <InputField
                  label="ISF Filing Fee"
                  value={input.isfFilingFee}
                  onChange={(v) => update("isfFilingFee", v)}
                  prefix="$"
                />
                <InputField
                  label="Bond Cost (per shipment)"
                  value={input.bondCost}
                  onChange={(v) => update("bondCost", v)}
                  prefix="$"
                />
                <InputField
                  label="Drayage Cost"
                  value={input.drayageCost}
                  onChange={(v) => update("drayageCost", v)}
                  prefix="$"
                />
                <InputField
                  label="Chassis Fee"
                  value={input.chassisFee}
                  onChange={(v) => update("chassisFee", v)}
                  prefix="$"
                />
                <InputField
                  label="Fulfillment Cost/Unit"
                  value={input.fulfillmentCostPerUnit}
                  onChange={(v) => update("fulfillmentCostPerUnit", v)}
                  prefix="$"
                  step={0.01}
                />
              </div>
            </div>

            {/* Risk Costs */}
            <div className="bg-white rounded-xl border border-amber-200 p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-amber-700 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> Risk-Based Costs
              </h3>
              <div className="space-y-3">
                <InputField
                  label="CBP Exam Probability"
                  value={input.examProbability}
                  onChange={(v) => update("examProbability", v)}
                  step={0.01}
                  hint="0-1 (e.g. 0.05 = 5%)"
                />
                <InputField
                  label="Exam Cost (if examined)"
                  value={input.examCost}
                  onChange={(v) => update("examCost", v)}
                  prefix="$"
                />
                <InputField
                  label="Demurrage Risk"
                  value={input.demurrageRisk}
                  onChange={(v) => update("demurrageRisk", v)}
                  prefix="$"
                  hint="Expected demurrage cost"
                />
                <InputField
                  label="Detention Risk"
                  value={input.detentionRisk}
                  onChange={(v) => update("detentionRisk", v)}
                  prefix="$"
                  hint="Expected detention cost"
                />
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-white rounded-xl border border-emerald-200 p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-emerald-700 mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" /> Pricing
              </h3>
              <div className="space-y-3">
                <InputField
                  label="Wholesale Markup"
                  value={input.wholesaleMarkup}
                  onChange={(v) => update("wholesaleMarkup", v)}
                  suffix="%"
                />
                <InputField
                  label="Target Retail Price"
                  value={input.targetRetailPrice}
                  onChange={(v) => update("targetRetailPrice", v)}
                  prefix="$"
                  step={0.01}
                />
              </div>
            </div>
          </div>

          {/* Results Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Headline Numbers */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-xl border border-navy-100 p-5 shadow-sm text-center">
                <div className="text-xs text-navy-500 font-medium">
                  Landed Cost / Unit
                </div>
                <div className="text-3xl font-bold text-ocean-600 mt-1">
                  {formatUSD(result.perUnit.totalLanded, 4)}
                </div>
              </div>
              <div className="bg-white rounded-xl border border-navy-100 p-5 shadow-sm text-center">
                <div className="text-xs text-navy-500 font-medium">
                  Container Total
                </div>
                <div className="text-3xl font-bold text-navy-800 mt-1">
                  {formatUSD(result.containerTotal, 0)}
                </div>
              </div>
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200 p-5 shadow-sm text-center">
                <div className="text-xs text-amber-700 font-medium">
                  Hidden Costs
                </div>
                <div className="text-3xl font-bold text-amber-600 mt-1">
                  {result.hiddenCostsPercent.toFixed(1)}%
                </div>
                <div className="text-xs text-amber-600 mt-1">
                  {formatUSD(result.hiddenCostsTotal, 0)} total
                </div>
              </div>
            </div>

            {/* Cost Breakdown Bar */}
            <div className="bg-white rounded-xl border border-navy-100 p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-navy-800 mb-4">
                Cost Breakdown per Unit
              </h3>
              <div className="flex rounded-lg overflow-hidden h-10 mb-4">
                {costItems
                  .filter((i) => i.value > 0)
                  .map((item) => (
                    <div
                      key={item.label}
                      className={`${item.color} flex items-center justify-center text-[9px] font-medium text-white transition-all duration-500`}
                      style={{
                        width: `${(item.value / totalVisible) * 100}%`,
                        minWidth: item.value / totalVisible > 0.03 ? "auto" : "2px",
                      }}
                      title={`${item.label}: ${formatUSD(item.value, 4)}`}
                    >
                      {item.value / totalVisible > 0.05
                        ? `${((item.value / totalVisible) * 100).toFixed(0)}%`
                        : ""}
                    </div>
                  ))}
              </div>
              <div className="grid grid-cols-3 gap-2">
                {costItems
                  .filter((i) => i.value > 0)
                  .map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center gap-1.5 text-xs text-navy-600"
                    >
                      <div
                        className={`w-2.5 h-2.5 rounded-full ${item.color} flex-shrink-0`}
                      />
                      <span className="truncate">{item.label}</span>
                      <span className="ml-auto font-mono text-navy-800">
                        {formatUSD(item.value, 4)}
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Margin Analysis */}
            <div className="bg-white rounded-xl border border-navy-100 p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-navy-800 mb-4">
                Margin Analysis
              </h3>
              <div className="flex items-center justify-between text-center mb-6">
                <div>
                  <div className="text-xs text-navy-400 font-medium">
                    Landed
                  </div>
                  <div className="text-xl font-bold text-ocean-600">
                    {formatUSD(result.perUnit.totalLanded, 2)}
                  </div>
                </div>
                <div className="text-navy-300 text-lg">&rarr;</div>
                <div>
                  <div className="text-xs text-navy-400 font-medium">
                    Wholesale
                  </div>
                  <div className="text-xl font-bold text-cargo-600">
                    {formatUSD(result.marginAnalysis.wholesalePrice, 2)}
                  </div>
                </div>
                <div className="text-navy-300 text-lg">&rarr;</div>
                <div>
                  <div className="text-xs text-navy-400 font-medium">
                    Retail
                  </div>
                  <div className="text-xl font-bold text-navy-800">
                    {formatUSD(result.marginAnalysis.retailPrice, 2)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 pt-4 border-t border-navy-100">
                <div className="text-center">
                  <div className="text-xs text-navy-400">Wholesale Margin</div>
                  <div className="text-lg font-bold text-emerald-600">
                    {result.marginAnalysis.wholesaleMargin.toFixed(1)}%
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-navy-400">Retail Margin</div>
                  <div
                    className={`text-lg font-bold ${
                      result.marginAnalysis.retailMargin > 0
                        ? "text-emerald-600"
                        : "text-red-500"
                    }`}
                  >
                    {result.marginAnalysis.retailMargin.toFixed(1)}%
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-navy-400">Profit/Unit</div>
                  <div
                    className={`text-lg font-bold ${
                      result.marginAnalysis.profitPerUnit > 0
                        ? "text-emerald-600"
                        : "text-red-500"
                    }`}
                  >
                    {formatUSD(result.marginAnalysis.profitPerUnit, 2)}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-navy-400">ROI</div>
                  <div
                    className={`text-lg font-bold ${
                      result.marginAnalysis.roi > 0
                        ? "text-emerald-600"
                        : "text-red-500"
                    }`}
                  >
                    {result.marginAnalysis.roi.toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>

            {/* Container Profit */}
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl border border-emerald-200 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-emerald-600" />
                <span className="text-sm font-semibold text-emerald-800">
                  Container Profit
                </span>
              </div>
              <div className="text-4xl font-bold text-emerald-600">
                {formatUSD(result.marginAnalysis.containerProfit, 0)}
              </div>
              <p className="text-sm text-emerald-700 mt-2">
                At {formatUSD(result.perUnit.totalLanded, 4)}/unit landed cost
                with {input.unitsPerContainer.toLocaleString()} units, hidden
                costs add{" "}
                <strong>{result.hiddenCostsPercent.toFixed(1)}%</strong> beyond
                product + freight + duty.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  prefix,
  suffix,
  step = 1,
  hint,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  prefix?: string;
  suffix?: string;
  step?: number;
  hint?: string;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-navy-500 block mb-1">
        {label}
      </label>
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-2.5 text-navy-400 text-sm">
            {prefix}
          </span>
        )}
        <input
          type="number"
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className={`input-light ${prefix ? "pl-7" : ""} ${
            suffix ? "pr-8" : ""
          }`}
        />
        {suffix && (
          <span className="absolute right-3 top-2.5 text-navy-400 text-sm">
            {suffix}
          </span>
        )}
      </div>
      {hint && <div className="text-[10px] text-navy-400 mt-0.5">{hint}</div>}
    </div>
  );
}

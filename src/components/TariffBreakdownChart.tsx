"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Globe, FileText } from "lucide-react";

interface TariffScenario {
  country: string;
  flag: string;
  baseRate: number;
  section301: number;
  antidumping: number;
  total: number;
  note: string;
}

const tariffData: TariffScenario[] = [
  {
    country: "Vietnam",
    flag: "🇻🇳",
    baseRate: 6.5,
    section301: 0,
    antidumping: 2.1,
    total: 8.6,
    note: "Low base rate, some AD on specific products",
  },
  {
    country: "China",
    flag: "🇨🇳",
    baseRate: 6.5,
    section301: 25,
    antidumping: 5.5,
    total: 37.0,
    note: "Section 301 tariffs apply — most impactful",
  },
  {
    country: "Thailand",
    flag: "🇹🇭",
    baseRate: 7.0,
    section301: 0,
    antidumping: 1.8,
    total: 8.8,
    note: "Competitive with Vietnam for most goods",
  },
  {
    country: "Indonesia",
    flag: "🇮🇩",
    baseRate: 7.5,
    section301: 0,
    antidumping: 3.2,
    total: 10.7,
    note: "Higher AD exposure on textiles/footwear",
  },
  {
    country: "Cambodia",
    flag: "🇰🇭",
    baseRate: 12.0,
    section301: 0,
    antidumping: 0,
    total: 12.0,
    note: "Higher base, no Section 301 or AD",
  },
];

// Landed cost breakdown for a sample product
const landedCostData = [
  { name: "FOB Price", value: 45, color: "#00bcd4" },
  { name: "Ocean Freight", value: 12, color: "#1adbff" },
  { name: "Base Duty", value: 5.5, color: "#ffc81a" },
  { name: "Section 301", value: 0, color: "#ef4444" },
  { name: "MPF + HMF", value: 2.1, color: "#e6a800" },
  { name: "Drayage", value: 3, color: "#a855f7" },
  { name: "Fulfillment", value: 8, color: "#22c55e" },
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}

function BarTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-navy-100 shadow-soft rounded-lg p-3 border border-navy-200 text-xs min-w-[160px]">
      <div className="font-semibold text-navy-900 mb-2">{label}</div>
      {payload.map((p) => (
        <div key={p.name} className="flex justify-between gap-4" style={{ color: p.color }}>
          <span>{p.name}</span>
          <span>{p.value}%</span>
        </div>
      ))}
    </div>
  );
}

function PieTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  return (
    <div className="bg-white border border-navy-100 shadow-soft rounded-lg p-3 border border-navy-200 text-xs">
      <div style={{ color: p.color }} className="font-semibold">{p.name}</div>
      <div className="text-navy-900">${p.value}/unit</div>
    </div>
  );
}

export default function TariffBreakdownChart() {
  const [view, setView] = useState<"comparison" | "breakdown">("comparison");
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  const selected = selectedCountry
    ? tariffData.find((t) => t.country === selectedCountry)
    : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h3 className="text-lg font-semibold text-navy-700 flex items-center gap-2">
          <Globe className="w-5 h-5 text-ocean-400" />
          Tariff Analysis by Country of Origin
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setView("comparison")}
            className={`text-xs px-3 py-1.5 rounded-full transition-all ${
              view === "comparison"
                ? "bg-ocean-600 text-navy-900"
                : "bg-white border border-navy-100 shadow-soft text-navy-500 hover:text-navy-900"
            }`}
          >
            Country Comparison
          </button>
          <button
            onClick={() => setView("breakdown")}
            className={`text-xs px-3 py-1.5 rounded-full transition-all ${
              view === "breakdown"
                ? "bg-cargo-600 text-navy-900"
                : "bg-white border border-navy-100 shadow-soft text-navy-500 hover:text-navy-900"
            }`}
          >
            Landed Cost Breakdown
          </button>
        </div>
      </div>

      {view === "comparison" && (
        <>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tariffData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis
                  dataKey="country"
                  tick={{ fill: "#90b3ff", fontSize: 11 }}
                  axisLine={{ stroke: "#ffffff15" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#90b3ff", fontSize: 11 }}
                  axisLine={{ stroke: "#ffffff15" }}
                  tickLine={false}
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip content={<BarTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: 11, color: "#90b3ff" }}
                />
                <Bar dataKey="baseRate" name="Base Rate" stackId="a" fill="#00bcd4" radius={[0, 0, 0, 0]} />
                <Bar dataKey="antidumping" name="Anti-Dumping" stackId="a" fill="#ffc81a" />
                <Bar dataKey="section301" name="Section 301" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {tariffData.map((t) => (
              <button
                key={t.country}
                onClick={() =>
                  setSelectedCountry(
                    selectedCountry === t.country ? null : t.country
                  )
                }
                className={`glass rounded-xl p-3 text-left transition-all ${
                  selectedCountry === t.country
                    ? "border-ocean-500/60 bg-ocean-50"
                    : "glass-hover"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-navy-900">
                    {t.flag} {t.country}
                  </span>
                  <span
                    className={`text-sm font-bold ${
                      t.total > 20 ? "text-red-600" : t.total > 12 ? "text-yellow-400" : "text-emerald-600"
                    }`}
                  >
                    {t.total}%
                  </span>
                </div>
                <div className="text-xs text-navy-400 leading-relaxed">{t.note}</div>
                {selectedCountry === t.country && (
                  <div className="mt-2 pt-2 border-t border-navy-200 grid grid-cols-3 gap-1 text-xs">
                    <div className="text-center">
                      <div className="text-navy-400">Base</div>
                      <div className="text-ocean-600">{t.baseRate}%</div>
                    </div>
                    <div className="text-center">
                      <div className="text-navy-400">Sec.301</div>
                      <div className="text-red-600">{t.section301}%</div>
                    </div>
                    <div className="text-center">
                      <div className="text-navy-400">A/D</div>
                      <div className="text-yellow-400">{t.antidumping}%</div>
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </>
      )}

      {view === "breakdown" && (
        <div className="grid md:grid-cols-2 gap-6 items-center">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={landedCostData}
                  cx="50%"
                  cy="50%"
                  innerRadius="40%"
                  outerRadius="70%"
                  paddingAngle={2}
                  dataKey="value"
                >
                  {landedCostData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-ocean-400" />
              <span className="text-sm font-medium text-navy-400">
                Sample: Plastic goods from Vietnam
              </span>
            </div>
            {landedCostData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ background: item.color }}
                  />
                  <span className="text-navy-500">{item.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div
                    className="h-1.5 rounded-full"
                    style={{
                      width: `${(item.value / 75) * 80}px`,
                      background: item.color,
                      opacity: 0.6,
                    }}
                  />
                  <span className="text-navy-900 font-medium w-12 text-right">
                    ${item.value.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
            <div className="pt-2 mt-2 border-t border-navy-200 flex justify-between text-sm">
              <span className="text-navy-500">Total Landed Cost</span>
              <span className="text-navy-900 font-bold">
                ${landedCostData.reduce((s, i) => s + i.value, 0).toFixed(2)}/unit
              </span>
            </div>
          </div>
        </div>
      )}

      <p className="text-xs text-navy-500 text-center">
        HTS Chapter 39 (Plastics) illustrative rates. Verify at hts.usitc.gov for your specific HTS code.
      </p>
    </div>
  );
}

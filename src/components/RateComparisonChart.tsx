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
  Legend,
  Cell,
} from "recharts";
import { TrendingUp, BarChart3 } from "lucide-react";

const carrierData = [
  {
    carrier: "Evergreen",
    transitDays: 24,
    costPerTEU: 2850,
    reliability: 87,
    backhaulDiscount: 12,
    route: "SGN→LAX",
  },
  {
    carrier: "MSC",
    transitDays: 22,
    costPerTEU: 3100,
    reliability: 91,
    backhaulDiscount: 8,
    route: "SGN→LAX",
  },
  {
    carrier: "COSCO",
    transitDays: 26,
    costPerTEU: 2600,
    reliability: 83,
    backhaulDiscount: 18,
    route: "SGN→LAX",
  },
  {
    carrier: "Maersk",
    transitDays: 21,
    costPerTEU: 3400,
    reliability: 94,
    backhaulDiscount: 5,
    route: "SGN→LAX",
  },
  {
    carrier: "ONE",
    transitDays: 23,
    costPerTEU: 2950,
    reliability: 89,
    backhaulDiscount: 14,
    route: "SGN→LAX",
  },
  {
    carrier: "Yang Ming",
    transitDays: 25,
    costPerTEU: 2700,
    reliability: 85,
    backhaulDiscount: 16,
    route: "SGN→LAX",
  },
];

type Metric = "costPerTEU" | "transitDays" | "reliability" | "backhaulDiscount";

const metricConfig: Record<Metric, { label: string; unit: string; color: string; lower?: boolean }> = {
  costPerTEU: { label: "Cost per TEU", unit: "$", color: "#00bcd4", lower: true },
  transitDays: { label: "Transit Days", unit: " days", color: "#ffc81a", lower: true },
  reliability: { label: "On-Time Reliability", unit: "%", color: "#22c55e", lower: false },
  backhaulDiscount: { label: "Backhaul Discount", unit: "%", color: "#a855f7", lower: false },
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; name: string }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const metric = payload[0].name as Metric;
  const cfg = metricConfig[metric] || metricConfig.costPerTEU;
  const value = payload[0].value;
  return (
    <div className="glass rounded-lg p-3 border border-white/20 text-xs">
      <div className="font-semibold text-white mb-1">{label}</div>
      <div style={{ color: cfg.color }}>
        {cfg.unit === "$" ? `$${value.toLocaleString()}` : `${value}${cfg.unit}`}
      </div>
    </div>
  );
}

export default function RateComparisonChart() {
  const [metric, setMetric] = useState<Metric>("costPerTEU");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const cfg = metricConfig[metric];

  const sortedData = [...carrierData].sort((a, b) => {
    const diff = a[metric] - b[metric];
    return sortOrder === "asc" ? diff : -diff;
  });

  const best = sortedData[0];
  const worst = sortedData[sortedData.length - 1];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h3 className="text-lg font-semibold text-navy-100 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-ocean-400" />
          Carrier Rate Comparison
        </h3>
        <div className="flex gap-2 flex-wrap">
          {(Object.keys(metricConfig) as Metric[]).map((m) => (
            <button
              key={m}
              onClick={() => {
                setMetric(m);
                setSortOrder(metricConfig[m].lower ? "asc" : "desc");
              }}
              className={`text-xs px-3 py-1.5 rounded-full transition-all ${
                metric === m
                  ? "text-white"
                  : "glass text-navy-300 hover:text-white"
              }`}
              style={
                metric === m
                  ? { backgroundColor: metricConfig[m].color + "30", border: `1px solid ${metricConfig[m].color}` }
                  : {}
              }
            >
              {metricConfig[m].label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={sortedData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
            <XAxis
              dataKey="carrier"
              tick={{ fill: "#90b3ff", fontSize: 11 }}
              axisLine={{ stroke: "#ffffff15" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#90b3ff", fontSize: 11 }}
              axisLine={{ stroke: "#ffffff15" }}
              tickLine={false}
              tickFormatter={(v) =>
                cfg.unit === "$" ? `$${(v / 1000).toFixed(1)}k` : `${v}${cfg.unit}`
              }
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey={metric} name={metric} radius={[4, 4, 0, 0]}>
              {sortedData.map((entry, index) => (
                <Cell
                  key={entry.carrier}
                  fill={
                    index === 0
                      ? cfg.color
                      : index === sortedData.length - 1
                      ? "#ef4444"
                      : cfg.color + "80"
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Best/worst callouts */}
      <div className="grid grid-cols-2 gap-4">
        <div className="glass rounded-xl p-4 border-green-500/20">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-xs text-green-300 font-medium">Best Option</span>
          </div>
          <div className="text-lg font-bold text-white">{best.carrier}</div>
          <div className="text-sm" style={{ color: cfg.color }}>
            {cfg.unit === "$"
              ? `$${best[metric].toLocaleString()}`
              : `${best[metric]}${cfg.unit}`}
          </div>
        </div>
        <div className="glass rounded-xl p-4 border-red-500/20">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-red-400 rotate-180" />
            <span className="text-xs text-red-300 font-medium">Most Expensive</span>
          </div>
          <div className="text-lg font-bold text-white">{worst.carrier}</div>
          <div className="text-sm text-red-400">
            {cfg.unit === "$"
              ? `$${worst[metric].toLocaleString()}`
              : `${worst[metric]}${cfg.unit}`}
          </div>
        </div>
      </div>

      <p className="text-xs text-navy-500 text-center">
        Route: Vietnam (SGN) → Los Angeles (LAX). Rates indicative — spot market fluctuates weekly.
        Backhaul discounts apply to return-leg empty repositioning.
      </p>
    </div>
  );
}

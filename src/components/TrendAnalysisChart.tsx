"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Area,
  AreaChart,
} from "recharts";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";
import { COST_TRENDS, type CostTrend } from "@/lib/data/routes";

type Mode = "ocean-fcl" | "ocean-lcl" | "air" | "all";

const modeConfig: Record<
  Exclude<Mode, "all">,
  { label: string; color: string; unit: string; yFormat: (v: number) => string }
> = {
  "ocean-fcl": {
    label: "Ocean FCL ($/TEU)",
    color: "#00bcd4",
    unit: "$/TEU",
    yFormat: (v) => `$${(v / 1000).toFixed(1)}k`,
  },
  "ocean-lcl": {
    label: "Ocean LCL ($/CBM)",
    color: "#ffc81a",
    unit: "$/CBM",
    yFormat: (v) => `$${v}`,
  },
  air: {
    label: "Air Freight ($/kg)",
    color: "#a855f7",
    unit: "$/kg",
    yFormat: (v) => `$${v.toFixed(2)}`,
  },
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string; dataKey: string }>;
  label?: string;
}

function ChartTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-lg p-3 border border-white/20 text-xs min-w-[160px]">
      <div className="font-semibold text-white mb-2">{label}</div>
      {payload.map((p) => {
        const cfg = modeConfig[p.dataKey as Exclude<Mode, "all">];
        return (
          <div
            key={p.dataKey}
            className="flex justify-between gap-4 mb-0.5"
            style={{ color: p.color }}
          >
            <span>{cfg?.label || p.name}</span>
            <span>{cfg ? cfg.yFormat(p.value) : p.value}</span>
          </div>
        );
      })}
    </div>
  );
}

interface Props {
  className?: string;
}

export default function TrendAnalysisChart({ className = "" }: Props) {
  const [mode, setMode] = useState<Mode>("all");

  // Calculate trend direction for each metric
  const latest = COST_TRENDS[COST_TRENDS.length - 1];
  const prev = COST_TRENDS[COST_TRENDS.length - 2];
  const threeMonthAgo = COST_TRENDS[COST_TRENDS.length - 4];

  const trends = {
    "ocean-fcl": {
      current: latest.oceanFCL,
      change: ((latest.oceanFCL - prev.oceanFCL) / prev.oceanFCL) * 100,
      threeMonth:
        ((latest.oceanFCL - threeMonthAgo.oceanFCL) / threeMonthAgo.oceanFCL) *
        100,
    },
    "ocean-lcl": {
      current: latest.oceanLCL,
      change: ((latest.oceanLCL - prev.oceanLCL) / prev.oceanLCL) * 100,
      threeMonth:
        ((latest.oceanLCL - threeMonthAgo.oceanLCL) / threeMonthAgo.oceanLCL) *
        100,
    },
    air: {
      current: latest.air,
      change: ((latest.air - prev.air) / prev.air) * 100,
      threeMonth:
        ((latest.air - threeMonthAgo.air) / threeMonthAgo.air) * 100,
    },
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h3 className="text-lg font-semibold text-navy-100 flex items-center gap-2">
          <Activity className="w-5 h-5 text-ocean-400" />
          Freight Rate Trends (12 Months)
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setMode("all")}
            className={`text-xs px-3 py-1.5 rounded-full transition-all ${
              mode === "all"
                ? "bg-ocean-600 text-white"
                : "glass text-navy-300 hover:text-white"
            }`}
          >
            All Modes
          </button>
          {(Object.keys(modeConfig) as Exclude<Mode, "all">[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`text-xs px-3 py-1.5 rounded-full transition-all ${
                mode === m
                  ? "text-white"
                  : "glass text-navy-300 hover:text-white"
              }`}
              style={
                mode === m
                  ? {
                      backgroundColor: modeConfig[m].color + "30",
                      border: `1px solid ${modeConfig[m].color}`,
                    }
                  : {}
              }
            >
              {modeConfig[m].label.split(" (")[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Trend cards */}
      <div className="grid grid-cols-3 gap-3">
        {(Object.keys(modeConfig) as Exclude<Mode, "all">[]).map((m) => {
          const t = trends[m];
          const cfg = modeConfig[m];
          return (
            <div key={m} className="glass rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ background: cfg.color }}
                />
                <span className="text-xs text-navy-300">
                  {cfg.label.split(" (")[0]}
                </span>
              </div>
              <div className="text-xl font-bold text-white">
                {cfg.yFormat(t.current)}
              </div>
              <div className="flex items-center gap-3 mt-1">
                <div
                  className={`flex items-center gap-0.5 text-xs ${
                    t.change <= 0 ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {t.change <= 0 ? (
                    <TrendingDown className="w-3 h-3" />
                  ) : (
                    <TrendingUp className="w-3 h-3" />
                  )}
                  {Math.abs(t.change).toFixed(1)}% MoM
                </div>
                <div
                  className={`text-xs ${
                    t.threeMonth <= 0 ? "text-green-300" : "text-red-300"
                  }`}
                >
                  {t.threeMonth > 0 ? "+" : ""}
                  {t.threeMonth.toFixed(1)}% 3mo
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Chart */}
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          {mode === "all" ? (
            <LineChart
              data={COST_TRENDS}
              margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis
                dataKey="month"
                tick={{ fill: "#90b3ff", fontSize: 10 }}
                axisLine={{ stroke: "#ffffff15" }}
                tickLine={false}
              />
              <YAxis
                yAxisId="left"
                tick={{ fill: "#90b3ff", fontSize: 10 }}
                axisLine={{ stroke: "#ffffff15" }}
                tickLine={false}
                tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fill: "#90b3ff", fontSize: 10 }}
                axisLine={{ stroke: "#ffffff15" }}
                tickLine={false}
                tickFormatter={(v) => `$${v}`}
              />
              <Tooltip content={<ChartTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: 11, color: "#90b3ff" }}
                formatter={(value: string) => {
                  const cfg =
                    modeConfig[value as Exclude<Mode, "all">];
                  return cfg?.label || value;
                }}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="oceanFCL"
                stroke={modeConfig["ocean-fcl"].color}
                strokeWidth={2}
                dot={{ r: 3, fill: modeConfig["ocean-fcl"].color }}
                activeDot={{ r: 5 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="oceanLCL"
                stroke={modeConfig["ocean-lcl"].color}
                strokeWidth={2}
                dot={{ r: 3, fill: modeConfig["ocean-lcl"].color }}
                activeDot={{ r: 5 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="air"
                stroke={modeConfig.air.color}
                strokeWidth={2}
                dot={{ r: 3, fill: modeConfig.air.color }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          ) : (
            <AreaChart
              data={COST_TRENDS}
              margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
            >
              <defs>
                <linearGradient
                  id={`gradient-${mode}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor={modeConfig[mode].color}
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor={modeConfig[mode].color}
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis
                dataKey="month"
                tick={{ fill: "#90b3ff", fontSize: 10 }}
                axisLine={{ stroke: "#ffffff15" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#90b3ff", fontSize: 10 }}
                axisLine={{ stroke: "#ffffff15" }}
                tickLine={false}
                tickFormatter={modeConfig[mode].yFormat}
              />
              <Tooltip content={<ChartTooltip />} />
              <Area
                type="monotone"
                dataKey={
                  mode === "ocean-fcl"
                    ? "oceanFCL"
                    : mode === "ocean-lcl"
                    ? "oceanLCL"
                    : "air"
                }
                stroke={modeConfig[mode].color}
                strokeWidth={2}
                fill={`url(#gradient-${mode})`}
                dot={{ r: 3, fill: modeConfig[mode].color }}
                activeDot={{ r: 5 }}
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>

      <p className="text-xs text-navy-500 text-center">
        SE Asia → US West Coast average rates. FCL = Full Container Load
        ($/TEU), LCL = Less-than-Container Load ($/CBM). Data sourced from
        industry indices.
      </p>
    </div>
  );
}

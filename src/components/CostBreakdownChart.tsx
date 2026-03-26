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
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { DollarSign, PieChart as PieIcon, BarChart3 } from "lucide-react";
import { MONTHLY_COSTS, type MonthlyCostBreakdown } from "@/lib/data/routes";

const COLORS = {
  freight: "#00bcd4",
  duties: "#ffc81a",
  drayage: "#a855f7",
  storage: "#3b82f6",
  insurance: "#22c55e",
  fees: "#ef4444",
};

const LABELS: Record<string, string> = {
  freight: "Ocean Freight",
  duties: "Duties & Tariffs",
  drayage: "Drayage & Port",
  storage: "Warehousing",
  insurance: "Insurance",
  fees: "Fees & Surcharges",
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}

function BarTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const total = payload.reduce((s, p) => s + p.value, 0);
  return (
    <div className="glass rounded-lg p-3 border border-white/20 text-xs min-w-[180px]">
      <div className="font-semibold text-white mb-2">{label}</div>
      {payload.map((p) => (
        <div
          key={p.name}
          className="flex justify-between gap-4 mb-0.5"
          style={{ color: p.color }}
        >
          <span>{LABELS[p.name] || p.name}</span>
          <span>${(p.value / 1000).toFixed(0)}k</span>
        </div>
      ))}
      <div className="border-t border-white/10 mt-1.5 pt-1.5 flex justify-between text-white font-medium">
        <span>Total</span>
        <span>${(total / 1000).toFixed(0)}k</span>
      </div>
    </div>
  );
}

function DonutTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  return (
    <div className="glass rounded-lg p-3 border border-white/20 text-xs">
      <div style={{ color: p.color }} className="font-semibold">
        {LABELS[p.name] || p.name}
      </div>
      <div className="text-white">${(p.value / 1000).toFixed(0)}k</div>
    </div>
  );
}

interface Props {
  className?: string;
}

export default function CostBreakdownChart({ className = "" }: Props) {
  const [view, setView] = useState<"stacked" | "donut">("stacked");

  // Build donut data from latest month
  const latest = MONTHLY_COSTS[MONTHLY_COSTS.length - 1];
  const donutData = Object.entries(COLORS).map(([key, color]) => ({
    name: key,
    value: latest[key as keyof MonthlyCostBreakdown] as number,
    color,
  }));
  const totalLatest = donutData.reduce((s, d) => s + d.value, 0);

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h3 className="text-lg font-semibold text-navy-100 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-ocean-400" />
          Monthly Cost Breakdown
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setView("stacked")}
            className={`text-xs px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${
              view === "stacked"
                ? "bg-ocean-600 text-white"
                : "glass text-navy-300 hover:text-white"
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Stacked
          </button>
          <button
            onClick={() => setView("donut")}
            className={`text-xs px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${
              view === "donut"
                ? "bg-cargo-600 text-white"
                : "glass text-navy-300 hover:text-white"
            }`}
          >
            <PieIcon className="w-3.5 h-3.5" />
            Current Month
          </button>
        </div>
      </div>

      {view === "stacked" && (
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={MONTHLY_COSTS}
              margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis
                dataKey="month"
                tick={{ fill: "#90b3ff", fontSize: 11 }}
                axisLine={{ stroke: "#ffffff15" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#90b3ff", fontSize: 11 }}
                axisLine={{ stroke: "#ffffff15" }}
                tickLine={false}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<BarTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: 11, color: "#90b3ff" }}
                formatter={(value: string) => LABELS[value] || value}
              />
              <Bar dataKey="freight" stackId="a" fill={COLORS.freight} />
              <Bar dataKey="duties" stackId="a" fill={COLORS.duties} />
              <Bar dataKey="drayage" stackId="a" fill={COLORS.drayage} />
              <Bar dataKey="storage" stackId="a" fill={COLORS.storage} />
              <Bar dataKey="insurance" stackId="a" fill={COLORS.insurance} />
              <Bar
                dataKey="fees"
                stackId="a"
                fill={COLORS.fees}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {view === "donut" && (
        <div className="grid md:grid-cols-2 gap-6 items-center">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius="45%"
                  outerRadius="75%"
                  paddingAngle={2}
                  dataKey="value"
                  nameKey="name"
                >
                  {donutData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<DonutTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2.5">
            <div className="text-sm font-medium text-navy-200 mb-3">
              {latest.month} — Total: ${(totalLatest / 1000).toFixed(0)}k
            </div>
            {donutData.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ background: item.color }}
                  />
                  <span className="text-navy-300">
                    {LABELS[item.name] || item.name}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div
                    className="h-1.5 rounded-full"
                    style={{
                      width: `${(item.value / totalLatest) * 120}px`,
                      background: item.color,
                      opacity: 0.6,
                    }}
                  />
                  <span className="text-white font-medium w-14 text-right">
                    ${(item.value / 1000).toFixed(0)}k
                  </span>
                  <span className="text-navy-500 w-10 text-right">
                    {((item.value / totalLatest) * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Month-over-month change cards */}
      {MONTHLY_COSTS.length >= 2 && (() => {
        const prev = MONTHLY_COSTS[MONTHLY_COSTS.length - 2];
        const curr = MONTHLY_COSTS[MONTHLY_COSTS.length - 1];
        const prevTotal = Object.entries(COLORS).reduce(
          (s, [k]) => s + (prev[k as keyof MonthlyCostBreakdown] as number),
          0
        );
        const currTotal = Object.entries(COLORS).reduce(
          (s, [k]) => s + (curr[k as keyof MonthlyCostBreakdown] as number),
          0
        );
        const change = ((currTotal - prevTotal) / prevTotal) * 100;

        return (
          <div className="grid grid-cols-3 gap-4">
            <div className="glass rounded-xl p-4 text-center">
              <div className="text-xs text-navy-400 mb-1">Current Month</div>
              <div className="text-xl font-bold text-white">
                ${(currTotal / 1000).toFixed(0)}k
              </div>
            </div>
            <div className="glass rounded-xl p-4 text-center">
              <div className="text-xs text-navy-400 mb-1">Previous Month</div>
              <div className="text-xl font-bold text-navy-300">
                ${(prevTotal / 1000).toFixed(0)}k
              </div>
            </div>
            <div className="glass rounded-xl p-4 text-center">
              <div className="text-xs text-navy-400 mb-1">Change</div>
              <div
                className={`text-xl font-bold ${
                  change <= 0 ? "text-green-400" : "text-red-400"
                }`}
              >
                {change > 0 ? "+" : ""}
                {change.toFixed(1)}%
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

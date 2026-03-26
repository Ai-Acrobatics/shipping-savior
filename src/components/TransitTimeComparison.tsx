"use client";

import { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ScatterChart,
  Scatter,
  ZAxis,
} from "recharts";
import { Clock, ArrowUpDown } from "lucide-react";
import { ROUTES, getRoutePorts } from "@/lib/data/routes";

type SortBy = "transit" | "cost" | "reliability" | "value";

interface CustomTooltipProps {
  active?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: Array<{ payload: any; value: number; name: string }>;
  label?: string;
}

function BarTip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="glass rounded-lg p-3 border border-white/20 text-xs min-w-[180px]">
      <div className="font-semibold text-white mb-1">{label}</div>
      <div className="text-navy-300 mb-2">{d.carrier}</div>
      <div className="space-y-1">
        <div className="flex justify-between">
          <span className="text-ocean-300">Transit</span>
          <span className="text-white">
            {d.minDays}–{d.maxDays} days
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-cargo-300">Cost/TEU</span>
          <span className="text-white">${d.cost.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-green-300">Reliability</span>
          <span className="text-white">{d.reliability}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-purple-300">Backhaul</span>
          <span className="text-white">{d.backhaul}% off</span>
        </div>
      </div>
    </div>
  );
}

function ScatterTip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="glass rounded-lg p-3 border border-white/20 text-xs min-w-[160px]">
      <div className="font-semibold text-white mb-1">{d.route}</div>
      <div className="text-navy-300 mb-2">{d.carrier}</div>
      <div className="space-y-1">
        <div className="flex justify-between">
          <span className="text-ocean-300">Avg Transit</span>
          <span className="text-white">{d.avgDays} days</span>
        </div>
        <div className="flex justify-between">
          <span className="text-cargo-300">Cost/TEU</span>
          <span className="text-white">${d.cost.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-green-300">Reliability</span>
          <span className="text-white">{d.reliability}%</span>
        </div>
      </div>
    </div>
  );
}

interface Props {
  className?: string;
}

export default function TransitTimeComparison({ className = "" }: Props) {
  const [view, setView] = useState<"bar" | "scatter">("bar");
  const [sortBy, setSortBy] = useState<SortBy>("transit");

  const barData = useMemo(() => {
    const data = ROUTES.map((r) => {
      const { origin, dest } = getRoutePorts(r);
      return {
        route: `${origin?.city?.split(" ")[0] || "?"} → ${dest?.city?.split(" ")[0] || "?"}`,
        carrier: r.carrier,
        minDays: r.transitDays.min,
        maxDays: r.transitDays.max,
        avgDays: (r.transitDays.min + r.transitDays.max) / 2,
        cost: r.costPerTEU,
        reliability: r.reliability,
        backhaul: r.backhaulDiscount,
        direct: r.direct,
        // Value score: lower cost + faster + more reliable = higher
        value: Math.round(
          (r.reliability / 100) *
            (1 - r.costPerTEU / 5000) *
            (1 - ((r.transitDays.min + r.transitDays.max) / 2) / 40) *
            1000
        ),
      };
    });

    return data.sort((a, b) => {
      switch (sortBy) {
        case "transit":
          return a.avgDays - b.avgDays;
        case "cost":
          return a.cost - b.cost;
        case "reliability":
          return b.reliability - a.reliability;
        case "value":
          return b.value - a.value;
      }
    });
  }, [sortBy]);

  const scatterData = useMemo(() => {
    return ROUTES.map((r) => {
      const { origin, dest } = getRoutePorts(r);
      return {
        route: `${origin?.city || "?"} → ${dest?.city || "?"}`,
        carrier: r.carrier,
        avgDays: (r.transitDays.min + r.transitDays.max) / 2,
        cost: r.costPerTEU,
        reliability: r.reliability,
      };
    });
  }, []);

  const sortMetric: Record<SortBy, { dataKey: string; label: string; color: string }> = {
    transit: { dataKey: "avgDays", label: "Avg Transit Days", color: "#00bcd4" },
    cost: { dataKey: "cost", label: "Cost per TEU ($)", color: "#ffc81a" },
    reliability: { dataKey: "reliability", label: "On-Time %", color: "#22c55e" },
    value: { dataKey: "value", label: "Value Score", color: "#a855f7" },
  };

  const current = sortMetric[sortBy];

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h3 className="text-lg font-semibold text-navy-100 flex items-center gap-2">
          <Clock className="w-5 h-5 text-ocean-400" />
          Route Comparison
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setView("bar")}
            className={`text-xs px-3 py-1.5 rounded-full transition-all ${
              view === "bar"
                ? "bg-ocean-600 text-white"
                : "glass text-navy-300 hover:text-white"
            }`}
          >
            Rankings
          </button>
          <button
            onClick={() => setView("scatter")}
            className={`text-xs px-3 py-1.5 rounded-full transition-all ${
              view === "scatter"
                ? "bg-cargo-600 text-white"
                : "glass text-navy-300 hover:text-white"
            }`}
          >
            Cost vs. Speed
          </button>
        </div>
      </div>

      {view === "bar" && (
        <>
          {/* Sort controls */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-3.5 h-3.5 text-navy-400" />
            <span className="text-xs text-navy-400">Sort by:</span>
            {(Object.keys(sortMetric) as SortBy[]).map((s) => (
              <button
                key={s}
                onClick={() => setSortBy(s)}
                className={`text-xs px-3 py-1.5 rounded-full transition-all capitalize ${
                  sortBy === s
                    ? "text-white"
                    : "glass text-navy-300 hover:text-white"
                }`}
                style={
                  sortBy === s
                    ? {
                        backgroundColor: sortMetric[s].color + "30",
                        border: `1px solid ${sortMetric[s].color}`,
                      }
                    : {}
                }
              >
                {s}
              </button>
            ))}
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={barData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#ffffff10"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  tick={{ fill: "#90b3ff", fontSize: 10 }}
                  axisLine={{ stroke: "#ffffff15" }}
                  tickLine={false}
                  tickFormatter={(v) =>
                    current.dataKey === "cost"
                      ? `$${(v / 1000).toFixed(1)}k`
                      : current.dataKey === "reliability"
                      ? `${v}%`
                      : String(v)
                  }
                />
                <YAxis
                  type="category"
                  dataKey="route"
                  tick={{ fill: "#90b3ff", fontSize: 10 }}
                  axisLine={{ stroke: "#ffffff15" }}
                  tickLine={false}
                  width={110}
                />
                <Tooltip content={<BarTip />} />
                <Bar
                  dataKey={current.dataKey}
                  radius={[0, 4, 4, 0]}
                >
                  {barData.map((entry, index) => (
                    <Cell
                      key={entry.route + entry.carrier}
                      fill={
                        index === 0
                          ? current.color
                          : index === barData.length - 1
                          ? "#ef444480"
                          : current.color + "60"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {view === "scatter" && (
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis
                type="number"
                dataKey="avgDays"
                name="Transit Days"
                tick={{ fill: "#90b3ff", fontSize: 10 }}
                axisLine={{ stroke: "#ffffff15" }}
                tickLine={false}
                label={{
                  value: "Avg Transit Days →",
                  position: "insideBottom",
                  offset: -5,
                  fill: "#5c8dff",
                  fontSize: 10,
                }}
              />
              <YAxis
                type="number"
                dataKey="cost"
                name="Cost/TEU"
                tick={{ fill: "#90b3ff", fontSize: 10 }}
                axisLine={{ stroke: "#ffffff15" }}
                tickLine={false}
                tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`}
                label={{
                  value: "Cost/TEU →",
                  angle: -90,
                  position: "insideLeft",
                  fill: "#5c8dff",
                  fontSize: 10,
                }}
              />
              <ZAxis
                type="number"
                dataKey="reliability"
                range={[100, 400]}
                name="Reliability"
              />
              <Tooltip content={<ScatterTip />} />
              <Scatter data={scatterData} fill="#00bcd4">
                {scatterData.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={
                      entry.reliability >= 90
                        ? "#22c55e"
                        : entry.reliability >= 85
                        ? "#ffc81a"
                        : "#ef4444"
                    }
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-center gap-6 text-xs text-navy-400 mt-2">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span>90%+ reliable</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <span>85–89%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span>&lt;85%</span>
            </div>
            <span className="text-navy-500">
              Bubble size = reliability score
            </span>
          </div>
        </div>
      )}

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {
            label: "Fastest Route",
            value: `${barData.sort((a, b) => a.avgDays - b.avgDays)[0]?.avgDays} days`,
            sub: barData.sort((a, b) => a.avgDays - b.avgDays)[0]?.route,
            color: "text-ocean-300",
          },
          {
            label: "Cheapest Route",
            value: `$${barData.sort((a, b) => a.cost - b.cost)[0]?.cost.toLocaleString()}`,
            sub: barData.sort((a, b) => a.cost - b.cost)[0]?.route,
            color: "text-cargo-300",
          },
          {
            label: "Most Reliable",
            value: `${barData.sort((a, b) => b.reliability - a.reliability)[0]?.reliability}%`,
            sub: barData.sort((a, b) => b.reliability - a.reliability)[0]?.route,
            color: "text-green-400",
          },
          {
            label: "Best Value",
            value: `Score ${barData.sort((a, b) => b.value - a.value)[0]?.value}`,
            sub: barData.sort((a, b) => b.value - a.value)[0]?.route,
            color: "text-purple-300",
          },
        ].map((stat) => (
          <div key={stat.label} className="glass rounded-xl p-3 text-center">
            <div className="text-xs text-navy-400 mb-1">{stat.label}</div>
            <div className={`text-lg font-bold ${stat.color}`}>
              {stat.value}
            </div>
            <div className="text-[10px] text-navy-500 mt-0.5 truncate">
              {stat.sub}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import {
  BarChart3, TrendingUp, TrendingDown, DollarSign, Ship,
  Clock, Star, Package, ArrowUpDown, ChevronDown,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Legend, LineChart, Line,
} from "recharts";
import {
  monthlyCosts, costCategories, routePerformance, carrierMetrics,
  formatCurrency,
} from "@/lib/data/dashboard";

// ─── Custom Tooltip ──────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload) return null;
  return (
    <div className="bg-navy-900/95 backdrop-blur-sm border border-white/10 rounded-lg px-3 py-2 text-xs">
      <div className="text-white font-medium mb-1">{label}</div>
      {payload.map((entry: { name: string; value: number; color: string }, i: number) => (
        <div key={i} className="flex items-center gap-2 text-navy-300">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span>{entry.name}:</span>
          <span className="text-white font-medium">${entry.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Cost Category Colors ────────────────────────────────────

const PIE_COLORS = costCategories.map((c) => c.color);

// ─── Main Analytics Page ─────────────────────────────────────

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<"3m" | "6m" | "12m">("6m");

  const totalSpend = monthlyCosts[monthlyCosts.length - 1].total;
  const prevSpend = monthlyCosts[monthlyCosts.length - 2].total;
  const spendChange = ((totalSpend - prevSpend) / prevSpend) * 100;

  const avgCostPerUnit = monthlyCosts[monthlyCosts.length - 1].avgPerUnit;
  const prevAvg = monthlyCosts[monthlyCosts.length - 2].avgPerUnit;
  const avgChange = ((avgCostPerUnit - prevAvg) / prevAvg) * 100;

  // Prepare data for stacked area chart
  const areaData = monthlyCosts.map((m) => ({
    month: m.month.replace(" 2023", " '23").replace(" 2024", " '24"),
    Freight: m.freight,
    Duty: m.duty,
    Insurance: m.insurance,
    Drayage: m.drayage,
    Storage: m.storage,
  }));

  // Prepare data for cost per unit line chart
  const unitCostData = monthlyCosts.map((m) => ({
    month: m.month.replace(" 2023", " '23").replace(" 2024", " '24"),
    costPerUnit: m.avgPerUnit,
    shipments: m.shipments,
  }));

  // Prepare pie data
  const pieData = costCategories
    .filter((c) => c.category !== "Gross Margin")
    .map((c) => ({
      name: c.category,
      value: c.amount,
    }));

  // Carrier radar data
  const carrierRadarData = carrierMetrics.map((c) => ({
    carrier: c.carrier,
    "On-Time %": c.onTimeRate,
    Reliability: c.reliability,
    Rating: c.rating * 20,
    "Cost Index": 100 - Math.round((c.avgRate / 7000) * 100),
  }));

  return (
    <div className="max-w-screen-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Cost Analytics</h1>
          <p className="text-sm text-navy-400 mt-1">
            Spending trends, cost breakdown, route performance, and carrier analysis
          </p>
        </div>
        <div className="flex items-center gap-1 glass rounded-xl p-1">
          {(["3m", "6m", "12m"] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                timeRange === range
                  ? "bg-ocean-500/30 text-ocean-300"
                  : "text-navy-400 hover:text-navy-200"
              }`}
            >
              {range === "3m" ? "3 Months" : range === "6m" ? "6 Months" : "12 Months"}
            </button>
          ))}
        </div>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-ocean-400" />
            <span className="text-xs text-navy-400">Monthly Spend</span>
          </div>
          <div className="text-2xl font-bold text-white">{formatCurrency(totalSpend)}</div>
          <span className={`text-xs flex items-center gap-0.5 mt-1 ${spendChange > 0 ? "text-red-400" : "text-green-400"}`}>
            {spendChange > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(spendChange).toFixed(1)}% vs prev month
          </span>
        </div>

        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Package className="w-4 h-4 text-cargo-400" />
            <span className="text-xs text-navy-400">Avg Cost/Unit</span>
          </div>
          <div className="text-2xl font-bold text-white">${avgCostPerUnit.toFixed(2)}</div>
          <span className={`text-xs flex items-center gap-0.5 mt-1 ${avgChange < 0 ? "text-green-400" : "text-red-400"}`}>
            {avgChange < 0 ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
            {Math.abs(avgChange).toFixed(1)}% vs prev month
          </span>
        </div>

        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Ship className="w-4 h-4 text-green-400" />
            <span className="text-xs text-navy-400">Active Shipments</span>
          </div>
          <div className="text-2xl font-bold text-white">{monthlyCosts[monthlyCosts.length - 1].shipments}</div>
          <span className="text-xs text-navy-500 mt-1">This month</span>
        </div>

        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-navy-400">Gross Margin</span>
          </div>
          <div className="text-2xl font-bold text-white">18.6%</div>
          <span className="text-xs text-green-400 flex items-center gap-0.5 mt-1">
            <TrendingUp className="w-3 h-3" />
            +2.1% vs prev month
          </span>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Stacked Area — Total Spend Over Time */}
        <div className="lg:col-span-2 glass rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Monthly Spend Breakdown</h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={areaData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" tick={{ fill: "#4d6a8a", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#4d6a8a", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="Freight" stackId="1" stroke="#00bcd4" fill="#00bcd4" fillOpacity={0.3} />
                <Area type="monotone" dataKey="Duty" stackId="1" stroke="#e6a800" fill="#e6a800" fillOpacity={0.3} />
                <Area type="monotone" dataKey="Insurance" stackId="1" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
                <Area type="monotone" dataKey="Drayage" stackId="1" stroke="#a855f7" fill="#a855f7" fillOpacity={0.3} />
                <Area type="monotone" dataKey="Storage" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie — Cost Category Split */}
        <div className="glass rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Cost Distribution</h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%" cy="50%"
                  innerRadius={55} outerRadius={85}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [`$${value.toLocaleString()}`, ""]}
                  contentStyle={{ background: "#0a1929", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "12px" }}
                  itemStyle={{ color: "#e7f0ff" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Legend */}
          <div className="grid grid-cols-2 gap-2 mt-2">
            {costCategories.filter((c) => c.category !== "Gross Margin").map((cat) => (
              <div key={cat.category} className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                <span className="text-[10px] text-navy-400 truncate">{cat.category}</span>
                <span className="text-[10px] text-navy-300 ml-auto">{cat.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Cost Per Unit Trend */}
        <div className="glass rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Cost Per Unit Trend</h3>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={unitCostData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" tick={{ fill: "#4d6a8a", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#4d6a8a", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} domain={["auto", "auto"]} />
                <Tooltip
                  contentStyle={{ background: "#0a1929", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "12px" }}
                  itemStyle={{ color: "#e7f0ff" }}
                  formatter={(value: number) => [`$${value.toFixed(2)}`, "Cost/Unit"]}
                />
                <Line type="monotone" dataKey="costPerUnit" stroke="#22c55e" strokeWidth={2} dot={{ fill: "#22c55e", r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Shipments Per Month */}
        <div className="glass rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Monthly Shipment Volume</h3>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={unitCostData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" tick={{ fill: "#4d6a8a", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#4d6a8a", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "#0a1929", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "12px" }}
                  itemStyle={{ color: "#e7f0ff" }}
                  formatter={(value: number) => [value, "Shipments"]}
                />
                <Bar dataKey="shipments" fill="#00bcd4" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Route Performance Table */}
      <div className="glass rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-white mb-4">Route Performance</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-xs text-navy-400 font-medium py-3 px-3">Route</th>
                <th className="text-left text-xs text-navy-400 font-medium py-3 px-3">Shipments</th>
                <th className="text-left text-xs text-navy-400 font-medium py-3 px-3">Avg Cost</th>
                <th className="text-left text-xs text-navy-400 font-medium py-3 px-3">Transit Days</th>
                <th className="text-left text-xs text-navy-400 font-medium py-3 px-3">On-Time</th>
                <th className="text-left text-xs text-navy-400 font-medium py-3 px-3">Trend</th>
              </tr>
            </thead>
            <tbody>
              {routePerformance.map((route) => (
                <tr key={route.route} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-3 px-3">
                    <div className="text-white font-medium">{route.route}</div>
                    <div className="text-[10px] text-navy-500">{route.origin} → {route.destination}</div>
                  </td>
                  <td className="py-3 px-3 text-navy-300">{route.shipments}</td>
                  <td className="py-3 px-3 text-white font-medium">${route.avgCost.toLocaleString()}</td>
                  <td className="py-3 px-3 text-navy-300">{route.avgTransitDays} days</td>
                  <td className="py-3 px-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      route.onTimeRate >= 90 ? "bg-green-500/20 text-green-300" :
                      route.onTimeRate >= 80 ? "bg-cargo-500/20 text-cargo-300" :
                      "bg-red-500/20 text-red-300"
                    }`}>
                      {route.onTimeRate}%
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`text-xs flex items-center gap-0.5 ${
                      route.trend > 0 ? "text-green-400" : route.trend < 0 ? "text-red-400" : "text-navy-400"
                    }`}>
                      {route.trend > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {Math.abs(route.trend)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Carrier Performance */}
      <div className="glass rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-white mb-4">Carrier Performance</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {carrierMetrics.map((carrier) => (
            <div key={carrier.carrier} className="bg-white/5 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-medium text-white">{carrier.carrier}</div>
                <div className="flex items-center gap-0.5">
                  <Star className="w-3 h-3 text-cargo-400 fill-cargo-400" />
                  <span className="text-xs text-navy-300">{carrier.rating}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-[10px] text-navy-500">Shipments</div>
                  <div className="text-sm font-medium text-white">{carrier.shipments}</div>
                </div>
                <div>
                  <div className="text-[10px] text-navy-500">Avg Rate</div>
                  <div className="text-sm font-medium text-ocean-300">${carrier.avgRate.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-[10px] text-navy-500">On-Time</div>
                  <div className={`text-sm font-medium ${
                    carrier.onTimeRate >= 90 ? "text-green-400" :
                    carrier.onTimeRate >= 80 ? "text-cargo-400" : "text-red-400"
                  }`}>{carrier.onTimeRate}%</div>
                </div>
                <div>
                  <div className="text-[10px] text-navy-500">Reliability</div>
                  <div className="text-sm font-medium text-white">{carrier.reliability}%</div>
                </div>
              </div>
              {/* Reliability bar */}
              <div className="mt-3">
                <div className="w-full bg-white/5 rounded-full h-1.5">
                  <div
                    className={`h-full rounded-full ${
                      carrier.reliability >= 90 ? "bg-green-500" :
                      carrier.reliability >= 80 ? "bg-cargo-400" : "bg-red-500"
                    }`}
                    style={{ width: `${carrier.reliability}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

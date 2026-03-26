"use client";

import {
  PiggyBank, TrendingUp, DollarSign, Shield, Ship,
  ArrowUpDown, Zap, Package, Repeat, FileText,
} from "lucide-react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
} from "recharts";
import { savingsEntries, formatCurrency } from "@/lib/data/dashboard";

const typeConfig: Record<string, { label: string; icon: typeof Shield; color: string; bgColor: string }> = {
  ftz: { label: "FTZ Savings", icon: Shield, color: "text-green-400", bgColor: "bg-green-500/20" },
  "rate-negotiation": { label: "Rate Negotiation", icon: DollarSign, color: "text-ocean-400", bgColor: "bg-ocean-500/20" },
  "route-optimization": { label: "Route Optimization", icon: Ship, color: "text-purple-400", bgColor: "bg-purple-500/20" },
  consolidation: { label: "Consolidation", icon: Package, color: "text-cargo-400", bgColor: "bg-cargo-500/20" },
  "duty-drawback": { label: "Duty Drawback", icon: Repeat, color: "text-blue-400", bgColor: "bg-blue-500/20" },
};

const PIE_COLORS = ["#22c55e", "#00bcd4", "#a855f7", "#e6a800", "#3b82f6"];

export default function SavingsPage() {
  const totalSavings = savingsEntries.reduce((acc, s) => acc + s.amount, 0);

  // Group by type
  const byType = savingsEntries.reduce((acc, s) => {
    if (!acc[s.type]) acc[s.type] = { type: s.type, amount: 0, count: 0 };
    acc[s.type].amount += s.amount;
    acc[s.type].count += 1;
    return acc;
  }, {} as Record<string, { type: string; amount: number; count: number }>);

  const typeData = Object.values(byType).sort((a, b) => b.amount - a.amount);

  const pieData = typeData.map((t) => ({
    name: typeConfig[t.type]?.label || t.type,
    value: t.amount,
  }));

  // Quarterly savings trend (mock)
  const quarterlyData = [
    { quarter: "Q1 2023", savings: 156000 },
    { quarter: "Q2 2023", savings: 178000 },
    { quarter: "Q3 2023", savings: 201000 },
    { quarter: "Q4 2023", savings: 234000 },
    { quarter: "Q1 2024", savings: totalSavings },
  ];

  // ROI calculation
  const ftzInvestment = 45000; // annual FTZ fees
  const ftzSavings = typeData.find((t) => t.type === "ftz")?.amount || 0;
  const ftzROI = ((ftzSavings - ftzInvestment) / ftzInvestment) * 100;

  return (
    <div className="max-w-screen-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Savings Report</h1>
        <p className="text-sm text-navy-400 mt-1">
          FTZ savings, rate optimization, and cost reduction analysis
        </p>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <PiggyBank className="w-4 h-4 text-green-400" />
            <span className="text-xs text-navy-400">Total Savings (Q1)</span>
          </div>
          <div className="text-2xl font-bold text-white">{formatCurrency(totalSavings)}</div>
          <span className="text-xs text-green-400 flex items-center gap-0.5 mt-1">
            <TrendingUp className="w-3 h-3" />
            +21.4% vs Q4 2023
          </span>
        </div>

        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-green-400" />
            <span className="text-xs text-navy-400">FTZ Savings</span>
          </div>
          <div className="text-2xl font-bold text-white">{formatCurrency(ftzSavings)}</div>
          <span className="text-xs text-navy-500 mt-1">
            Across 3 FTZ zones
          </span>
        </div>

        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-ocean-400" />
            <span className="text-xs text-navy-400">FTZ ROI</span>
          </div>
          <div className="text-2xl font-bold text-green-400">{ftzROI.toFixed(0)}%</div>
          <span className="text-xs text-navy-500 mt-1">
            On ${(ftzInvestment / 1000).toFixed(0)}K annual investment
          </span>
        </div>

        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-cargo-400" />
            <span className="text-xs text-navy-400">Avg Savings/Shipment</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {formatCurrency(totalSavings / 14)}
          </div>
          <span className="text-xs text-navy-500 mt-1">Based on 14 shipments</span>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Savings by Type (Pie) */}
        <div className="glass rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Savings by Category</h3>
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
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="none" />
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
          <div className="space-y-2 mt-2">
            {typeData.map((t, i) => {
              const config = typeConfig[t.type];
              return (
                <div key={t.type} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                    />
                    <span className="text-xs text-navy-300">{config?.label || t.type}</span>
                  </div>
                  <span className="text-xs text-white font-medium">{formatCurrency(t.amount)}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quarterly Trend (Bar) */}
        <div className="lg:col-span-2 glass rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Quarterly Savings Trend</h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={quarterlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="quarter" tick={{ fill: "#4d6a8a", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#4d6a8a", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
                <Tooltip
                  contentStyle={{ background: "#0a1929", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "12px" }}
                  itemStyle={{ color: "#e7f0ff" }}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, "Savings"]}
                />
                <Bar dataKey="savings" fill="#22c55e" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Savings Entries Table */}
      <div className="glass rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white">Savings Breakdown — Q1 2024</h3>
          <button className="flex items-center gap-1.5 text-xs glass glass-hover px-3 py-1.5 rounded-lg text-navy-300">
            <FileText className="w-3.5 h-3.5" />
            Export Report
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-xs text-navy-400 font-medium py-3 px-3">Source</th>
                <th className="text-left text-xs text-navy-400 font-medium py-3 px-3">Type</th>
                <th className="text-left text-xs text-navy-400 font-medium py-3 px-3">Description</th>
                <th className="text-right text-xs text-navy-400 font-medium py-3 px-3">Amount</th>
              </tr>
            </thead>
            <tbody>
              {savingsEntries.map((entry, i) => {
                const config = typeConfig[entry.type];
                const Icon = config?.icon || DollarSign;
                return (
                  <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-3 px-3">
                      <div className="text-white font-medium">{entry.source}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full ${config?.bgColor || "bg-white/10"} ${config?.color || "text-white"}`}>
                        <Icon className="w-3 h-3" />
                        {config?.label || entry.type}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="text-xs text-navy-400 max-w-sm">{entry.description}</div>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span className="text-green-400 font-bold">{formatCurrency(entry.amount)}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t border-white/10">
                <td colSpan={3} className="py-3 px-3 text-sm font-semibold text-white">Total Q1 2024 Savings</td>
                <td className="py-3 px-3 text-right text-lg font-bold text-green-400">{formatCurrency(totalSavings)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* FTZ ROI Analysis */}
      <div className="glass rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-4 h-4 text-green-400" />
          <h3 className="text-sm font-semibold text-white">FTZ Return on Investment</h3>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            {
              zone: "FTZ Zone 202 (LA)",
              investment: "$18,000/yr",
              savings: "$87,400",
              roi: "386%",
              description: "Inverted tariff benefit on Vietnam electronics",
            },
            {
              zone: "FTZ Zone 50 (Long Beach)",
              investment: "$15,000/yr",
              savings: "$42,300",
              roi: "182%",
              description: "Weekly entry savings on Thai apparel",
            },
            {
              zone: "FTZ Zone 5 (Seattle)",
              investment: "$12,000/yr",
              savings: "$12,800",
              roi: "7%",
              description: "Cold chain duty deferral for Alaska cargo",
            },
          ].map((zone) => (
            <div key={zone.zone} className="bg-white/5 rounded-xl p-4">
              <div className="text-sm font-medium text-white mb-2">{zone.zone}</div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <div className="text-[10px] text-navy-500">Annual Fee</div>
                  <div className="text-sm font-medium text-navy-300">{zone.investment}</div>
                </div>
                <div>
                  <div className="text-[10px] text-navy-500">Q1 Savings</div>
                  <div className="text-sm font-bold text-green-400">{zone.savings}</div>
                </div>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-navy-500">Annualized ROI</span>
                <span className={`text-sm font-bold ${
                  parseInt(zone.roi) > 100 ? "text-green-400" :
                  parseInt(zone.roi) > 0 ? "text-cargo-400" :
                  "text-red-400"
                }`}>{zone.roi}</span>
              </div>
              <div className="text-xs text-navy-400">{zone.description}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

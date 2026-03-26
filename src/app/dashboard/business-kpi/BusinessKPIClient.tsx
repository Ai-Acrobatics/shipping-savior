// @ts-nocheck
"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import {
  DollarSign, TrendingUp, TrendingDown, Users, Package,
  Target, BarChart3, Activity, Award, Zap, ArrowUpRight,
  CheckCircle2, AlertTriangle, XCircle, RefreshCw,
  ChevronRight, PiggyBank, Star, Percent,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, LineChart, Line,
  Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Cell, PieChart, Pie,
} from "recharts";
import {
  businessKPIs,
  revenueTimeline,
  type BusinessKPI,
} from "@/lib/data/monitoring";
import {
  monthlyCosts,
  savingsEntries,
  formatCurrency,
} from "@/lib/data/dashboard";

// ─── Extended Mock Data ────────────────────────────────────────

const customerSegments = [
  { name: "SMB Importers", customers: 58, mrr: 28400, churn: 1.2, color: "#00bcd4" },
  { name: "Mid-Market", customers: 31, mrr: 38600, churn: 0.8, color: "#22c55e" },
  { name: "Enterprise", customers: 7, mrr: 17500, churn: 0.3, color: "#a78bfa" },
];

const mrrBreakdown = [
  { month: "Oct", newMRR: 8200, expansion: 3100, churn: -1800, net: 9500 },
  { month: "Nov", newMRR: 7400, expansion: 3800, churn: -1600, net: 9600 },
  { month: "Dec", newMRR: 5100, expansion: 2200, churn: -2100, net: 5200 },
  { month: "Jan", newMRR: 9800, expansion: 4200, churn: -1400, net: 12600 },
  { month: "Feb", newMRR: 6200, expansion: 3600, churn: -1700, net: 8100 },
  { month: "Mar", newMRR: 7100, expansion: 4800, churn: -1200, net: 10700 },
];

const savingsByCategory = [
  { name: "FTZ Benefits", value: 142500, pct: 58.4, color: "#00bcd4" },
  { name: "Rate Negotiation", value: 52800, pct: 21.6, color: "#22c55e" },
  { name: "Route Optimization", value: 26900, pct: 11.0, color: "#a78bfa" },
  { name: "Consolidation", value: 8900, pct: 3.7, color: "#fbbf24" },
  { name: "Duty Drawback", value: 21600, pct: 5.3, color: "#f97316" },
];

const npsHistory = [
  { month: "Oct", nps: 42, csat: 4.3 },
  { month: "Nov", nps: 47, csat: 4.4 },
  { month: "Dec", nps: 51, csat: 4.5 },
  { month: "Jan", nps: 54, csat: 4.5 },
  { month: "Feb", nps: 58, csat: 4.6 },
  { month: "Mar", nps: 62, csat: 4.6 },
];

const shipmentsGrowth = [
  { month: "Oct", managed: 18, ftz: 6, coldChain: 3 },
  { month: "Nov", managed: 22, ftz: 8, coldChain: 4 },
  { month: "Dec", managed: 19, ftz: 7, coldChain: 3 },
  { month: "Jan", managed: 28, ftz: 10, coldChain: 5 },
  { month: "Feb", managed: 31, ftz: 12, coldChain: 6 },
  { month: "Mar", managed: 37, ftz: 14, coldChain: 8 },
];

const topWins = [
  { title: "Cost savings 22% above target", icon: PiggyBank, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  { title: "MRR up 12.4% MoM — Q2 trajectory on track", icon: TrendingUp, color: "text-ocean-400", bg: "bg-ocean-500/10" },
  { title: "NPS reached 62 — best score to date", icon: Star, color: "text-amber-400", bg: "bg-amber-500/10" },
  { title: "FTZ utilization 78% — approaching target", icon: Zap, color: "text-purple-400", bg: "bg-purple-500/10" },
];

const topRisks = [
  { title: "Active users 29% below target (142 vs 200)", icon: Users, color: "text-amber-400", bg: "bg-amber-500/10" },
  { title: "On-time delivery at 89% — slipped vs 92% goal", icon: AlertTriangle, color: "text-red-400", bg: "bg-red-500/10" },
  { title: "Shipments 26% below monthly target (37 vs 50)", icon: Package, color: "text-amber-400", bg: "bg-amber-500/10" },
];

// ─── Types ─────────────────────────────────────────────────────

type KPICategory = "all" | "revenue" | "efficiency" | "quality" | "growth";

// ─── Tooltip ───────────────────────────────────────────────────

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload) return null;
  return (
    <div className="bg-navy-900/95 backdrop-blur-sm border border-white/10 rounded-lg px-3 py-2 text-xs">
      <div className="text-white font-medium mb-1">{label}</div>
      {payload.map((entry: any, i: number) => (
        <div key={i} className="flex items-center gap-2 text-navy-300">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span>{entry.name}:</span>
          <span className="text-white font-medium">
            {typeof entry.value === "number" && Math.abs(entry.value) >= 1000
              ? `$${(entry.value / 1000).toFixed(0)}K`
              : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Progress Bar ──────────────────────────────────────────────

function ProgressBar({
  value, max, color = "bg-ocean-500", showPct = false,
}: {
  value: number; max: number; color?: string; showPct?: boolean;
}) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="relative w-full">
      <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
      {showPct && (
        <span className="absolute right-0 -top-4 text-[10px] text-navy-400">{pct.toFixed(0)}%</span>
      )}
    </div>
  );
}

// ─── KPI Status Badge ──────────────────────────────────────────

function StatusBadge({ status }: { status: BusinessKPI["status"] }) {
  const config = {
    "on-track": { label: "On Track", className: "bg-emerald-500/20 text-emerald-300" },
    "at-risk":  { label: "At Risk",  className: "bg-amber-500/20 text-amber-300" },
    "behind":   { label: "Behind",   className: "bg-red-500/20 text-red-300" },
  };
  const c = config[status];
  return (
    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${c.className}`}>
      {c.label}
    </span>
  );
}

// ─── Category Icon ─────────────────────────────────────────────

function CategoryIcon({ category }: { category: BusinessKPI["category"] }) {
  const config = {
    revenue:    { icon: DollarSign, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    efficiency: { icon: Zap,        color: "text-ocean-400",   bg: "bg-ocean-500/10"   },
    quality:    { icon: Star,       color: "text-amber-400",   bg: "bg-amber-500/10"   },
    growth:     { icon: TrendingUp, color: "text-purple-400",  bg: "bg-purple-500/10"  },
  };
  const c = config[category];
  const Icon = c.icon;
  return (
    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${c.bg}`}>
      <Icon className={`w-4 h-4 ${c.color}`} />
    </div>
  );
}

// ─── Headline Metric Card ──────────────────────────────────────

function MetricCard({
  label, value, subtitle, trend, status, icon: Icon, iconColor, iconBg,
}: {
  label: string; value: string; subtitle: string; trend?: number;
  status?: BusinessKPI["status"]; icon: any; iconColor: string; iconBg: string;
}) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        {status && <StatusBadge status={status} />}
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-xs text-navy-400 mt-0.5">{label}</div>
      <div className="flex items-center justify-between mt-2">
        <span className="text-[10px] text-navy-500">{subtitle}</span>
        {trend !== undefined && (
          <span className={`text-xs flex items-center gap-0.5 font-medium ${trend >= 0 ? "text-emerald-400" : "text-red-400"}`}>
            {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────

export default function BusinessKPIClient() {
  const [filter, setFilter] = useState<KPICategory>("all");
  const [lastRefreshed] = useState(() => new Date().toLocaleTimeString());

  const currentMRR = revenueTimeline[revenueTimeline.length - 1].revenue;
  const prevMRR = revenueTimeline[revenueTimeline.length - 2].revenue;
  const mrrGrowth = (((currentMRR - prevMRR) / prevMRR) * 100).toFixed(1);

  const totalSavings = savingsEntries.reduce((sum, e) => sum + e.amount, 0);
  const totalCustomers = customerSegments.reduce((sum, s) => sum + s.customers, 0);

  const filteredKPIs = filter === "all"
    ? businessKPIs
    : businessKPIs.filter((k) => k.category === filter);

  const onTrackCount = businessKPIs.filter((k) => k.status === "on-track").length;
  const atRiskCount  = businessKPIs.filter((k) => k.status === "at-risk").length;
  const behindCount  = businessKPIs.filter((k) => k.status === "behind").length;

  return (
    <div className="min-h-screen bg-[#04081a] text-white">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="px-6 py-5 border-b border-white/5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-white">Business KPI Dashboard</h1>
            <p className="text-xs text-navy-400 mt-0.5">
              Q1 2026 · March 26 snapshot · Real-time business performance
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-[10px] text-navy-500">
              <RefreshCw className="w-3 h-3" />
              <span>Updated {lastRefreshed}</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-medium text-emerald-300">Live</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">

        {/* ── Health Summary ──────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-4">
          <div className="glass rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="text-xl font-bold text-white">{onTrackCount}</div>
              <div className="text-xs text-navy-400">KPIs On Track</div>
            </div>
          </div>
          <div className="glass rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="text-xl font-bold text-white">{atRiskCount}</div>
              <div className="text-xs text-navy-400">KPIs At Risk</div>
            </div>
          </div>
          <div className="glass rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center flex-shrink-0">
              <XCircle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <div className="text-xl font-bold text-white">{behindCount}</div>
              <div className="text-xs text-navy-400">KPIs Behind</div>
            </div>
          </div>
        </div>

        {/* ── Headline Metrics ────────────────────────────────── */}
        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <MetricCard
            label="Monthly Recurring Revenue"
            value={formatCurrency(currentMRR)}
            subtitle={`Target: ${formatCurrency(100000)}`}
            trend={Number(mrrGrowth)}
            status="on-track"
            icon={DollarSign}
            iconColor="text-emerald-400"
            iconBg="bg-emerald-500/10"
          />
          <MetricCard
            label="Cost Savings Delivered"
            value={formatCurrency(totalSavings)}
            subtitle="Target: $200,000 · 122% achieved"
            trend={18.2}
            status="on-track"
            icon={PiggyBank}
            iconColor="text-ocean-400"
            iconBg="bg-ocean-500/10"
          />
          <MetricCard
            label="Active Customers"
            value={String(totalCustomers)}
            subtitle="Target: 200 · 48% to goal"
            trend={8.6}
            status="at-risk"
            icon={Users}
            iconColor="text-amber-400"
            iconBg="bg-amber-500/10"
          />
          <MetricCard
            label="Shipments This Month"
            value="37"
            subtitle="Target: 50 · 74% to goal"
            trend={5.7}
            status="at-risk"
            icon={Package}
            iconColor="text-purple-400"
            iconBg="bg-purple-500/10"
          />
        </div>

        {/* ── Revenue + Savings Charts ─────────────────────────── */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* MRR vs Target */}
          <div className="glass rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">MRR vs Target</h3>
              <span className="text-[10px] text-navy-400">6-month view</span>
            </div>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueTimeline} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="month" tick={{ fill: "#4d6a8a", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#4d6a8a", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: "11px" }} formatter={(v) => <span style={{ color: "#94a3b8" }}>{v}</span>} />
                  <Bar dataKey="revenue" name="Revenue" fill="#22c55e" radius={[4, 4, 0, 0]} barSize={20} />
                  <Bar dataKey="target"  name="Target"  fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} opacity={0.35} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* MRR Waterfall (new / expansion / churn) */}
          <div className="glass rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">MRR Movement</h3>
              <span className="text-[10px] text-navy-400">New · Expansion · Churn</span>
            </div>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mrrBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="month" tick={{ fill: "#4d6a8a", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#4d6a8a", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: "11px" }} formatter={(v) => <span style={{ color: "#94a3b8" }}>{v}</span>} />
                  <Bar dataKey="newMRR"    name="New MRR"    fill="#22c55e" radius={[4, 4, 0, 0]} barSize={14} stackId="stack" />
                  <Bar dataKey="expansion" name="Expansion"  fill="#00bcd4" radius={[4, 4, 0, 0]} barSize={14} stackId="stack" />
                  <Bar dataKey="churn"     name="Churn"      fill="#ef4444" radius={[4, 4, 0, 0]} barSize={14} stackId="stack" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* ── Cost Savings + Shipments ──────────────────────────── */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Savings Delivered Over Time */}
          <div className="glass rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">Customer Savings Delivered</h3>
              <span className="text-[10px] text-emerald-400 font-medium">+18.2% MoM</span>
            </div>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueTimeline}>
                  <defs>
                    <linearGradient id="savingsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"   stopColor="#00bcd4" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#00bcd4" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="month" tick={{ fill: "#4d6a8a", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#4d6a8a", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="costSavings" name="Savings Delivered" stroke="#00bcd4" fill="url(#savingsGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Shipments Growth */}
          <div className="glass rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">Shipments Managed</h3>
              <span className="text-[10px] text-navy-400">By type</span>
            </div>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={shipmentsGrowth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="month" tick={{ fill: "#4d6a8a", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#4d6a8a", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: "11px" }} formatter={(v) => <span style={{ color: "#94a3b8" }}>{v}</span>} />
                  <Bar dataKey="managed"   name="Total"      fill="#a78bfa" radius={[4, 4, 0, 0]} barSize={18} />
                  <Bar dataKey="ftz"       name="FTZ"        fill="#00bcd4" radius={[4, 4, 0, 0]} barSize={18} />
                  <Bar dataKey="coldChain" name="Cold Chain" fill="#22c55e" radius={[4, 4, 0, 0]} barSize={18} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* ── Customer + NPS ────────────────────────────────────── */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Customer Segments */}
          <div className="glass rounded-2xl p-5 lg:col-span-1">
            <h3 className="text-sm font-semibold text-white mb-4">Customer Segments</h3>
            <div className="space-y-4">
              {customerSegments.map((seg) => {
                const pct = Math.round((seg.customers / totalCustomers) * 100);
                return (
                  <div key={seg.name}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-white font-medium">{seg.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-navy-400">{seg.customers} customers</span>
                        <span className="text-[10px] font-medium" style={{ color: seg.color }}>
                          {formatCurrency(seg.mrr)}/mo
                        </span>
                      </div>
                    </div>
                    <div className="relative pt-1">
                      <ProgressBar value={seg.customers} max={totalCustomers} color="bg-current" showPct={false} />
                      <div
                        className="w-full rounded-full h-1.5 overflow-hidden"
                        style={{ background: "rgba(255,255,255,0.05)" }}
                      >
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${pct}%`, backgroundColor: seg.color }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[10px] text-navy-500">{pct}% of customers</span>
                      <span className="text-[10px] text-navy-500">{seg.churn}% churn</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-2 gap-3">
              <div className="bg-white/5 rounded-xl p-3 text-center">
                <div className="text-lg font-bold text-white">{totalCustomers}</div>
                <div className="text-[10px] text-navy-400">Total Customers</div>
              </div>
              <div className="bg-white/5 rounded-xl p-3 text-center">
                <div className="text-lg font-bold text-white">
                  {formatCurrency(customerSegments.reduce((s, c) => s + c.mrr, 0))}
                </div>
                <div className="text-[10px] text-navy-400">Total MRR</div>
              </div>
            </div>
          </div>

          {/* NPS + CSAT */}
          <div className="glass rounded-2xl p-5 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">NPS & Customer Satisfaction</h3>
              <div className="flex items-center gap-3">
                <div className="text-center">
                  <div className="text-lg font-bold text-emerald-400">62</div>
                  <div className="text-[10px] text-navy-400">NPS</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-amber-400">4.6</div>
                  <div className="text-[10px] text-navy-400">CSAT</div>
                </div>
              </div>
            </div>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={npsHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="month" tick={{ fill: "#4d6a8a", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="nps" domain={[30, 70]} tick={{ fill: "#4d6a8a", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="csat" orientation="right" domain={[4.0, 5.0]} tick={{ fill: "#4d6a8a", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: "11px" }} formatter={(v) => <span style={{ color: "#94a3b8" }}>{v}</span>} />
                  <Line yAxisId="nps"  type="monotone" dataKey="nps"  name="NPS"  stroke="#22c55e" strokeWidth={2} dot={{ r: 3, fill: "#22c55e" }} />
                  <Line yAxisId="csat" type="monotone" dataKey="csat" name="CSAT" stroke="#fbbf24" strokeWidth={2} dot={{ r: 3, fill: "#fbbf24" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* ── Savings Breakdown ────────────────────────────────── */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="glass rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-white mb-4">Savings by Category</h3>
            <div className="flex items-center gap-6">
              <div className="w-[140px] h-[140px] flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={savingsByCategory} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" strokeWidth={0}>
                      {savingsByCategory.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const d = payload[0].payload;
                        return (
                          <div className="bg-navy-900/95 border border-white/10 rounded-lg px-3 py-2 text-xs">
                            <div className="text-white font-medium">{d.name}</div>
                            <div className="text-navy-300">{formatCurrency(d.value)} ({d.pct}%)</div>
                          </div>
                        );
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-2">
                {savingsByCategory.map((item) => (
                  <div key={item.name}>
                    <div className="flex items-center justify-between mb-0.5">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                        <span className="text-[11px] text-navy-300">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-white font-medium">{formatCurrency(item.value)}</span>
                        <span className="text-[10px] text-navy-500">{item.pct}%</span>
                      </div>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-1 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${item.pct}%`, backgroundColor: item.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* FTZ + Efficiency KPIs */}
          <div className="glass rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-white mb-4">Efficiency Metrics</h3>
            <div className="space-y-4">
              {businessKPIs.filter(k => k.category === "efficiency" || k.category === "quality").map((kpi) => {
                const pct = Math.min((kpi.numericValue / kpi.numericTarget) * 100, 100);
                const barColor = kpi.status === "on-track" ? "bg-emerald-500" : kpi.status === "at-risk" ? "bg-amber-400" : "bg-red-500";
                return (
                  <div key={kpi.name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-navy-300 font-medium">{kpi.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-white font-bold">{kpi.value}</span>
                        <StatusBadge status={kpi.status} />
                      </div>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                      <div className={`h-full rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="text-[10px] text-navy-500">
                        {kpi.trend >= 0 ? "+" : ""}{kpi.trend}% MoM
                      </span>
                      <span className="text-[10px] text-navy-500">Target: {kpi.target}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── All KPIs Table ────────────────────────────────────── */}
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">All Business KPIs</h3>
            {/* Category Filter */}
            <div className="flex items-center gap-1">
              {(["all", "revenue", "efficiency", "quality", "growth"] as KPICategory[]).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`text-[11px] px-3 py-1 rounded-lg capitalize transition-colors ${
                    filter === cat
                      ? "bg-ocean-500/20 text-ocean-300 font-medium"
                      : "text-navy-400 hover:text-navy-200 hover:bg-white/5"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left text-xs text-navy-400 font-medium py-2.5 px-3">KPI</th>
                  <th className="text-left text-xs text-navy-400 font-medium py-2.5 px-3">Category</th>
                  <th className="text-right text-xs text-navy-400 font-medium py-2.5 px-3">Current</th>
                  <th className="text-right text-xs text-navy-400 font-medium py-2.5 px-3">Target</th>
                  <th className="text-right text-xs text-navy-400 font-medium py-2.5 px-3">Progress</th>
                  <th className="text-right text-xs text-navy-400 font-medium py-2.5 px-3">Trend</th>
                  <th className="text-left text-xs text-navy-400 font-medium py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredKPIs.map((kpi) => {
                  const pct = Math.min(Math.round((kpi.numericValue / kpi.numericTarget) * 100), 100);
                  const barColor = kpi.status === "on-track" ? "bg-emerald-500" : kpi.status === "at-risk" ? "bg-amber-400" : "bg-red-500";
                  return (
                    <tr key={kpi.name} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors group">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <CategoryIcon category={kpi.category} />
                          <span className="text-xs text-white font-medium">{kpi.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-navy-300 capitalize">
                          {kpi.category}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right text-white font-bold text-xs">{kpi.value}</td>
                      <td className="py-3 px-3 text-right text-navy-400 text-xs">{kpi.target}</td>
                      <td className="py-3 px-3">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-20 bg-white/5 rounded-full h-1 overflow-hidden">
                            <div className={`h-full rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-[10px] text-navy-400 w-8 text-right">{pct}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <span className={`text-xs flex items-center gap-0.5 justify-end ${kpi.trend >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                          {kpi.trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {Math.abs(kpi.trend)}%
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <StatusBadge status={kpi.status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Wins & Risks ──────────────────────────────────────── */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Top Wins */}
          <div className="glass rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-white">This Month&apos;s Wins</h3>
            </div>
            <div className="space-y-3">
              {topWins.map((win, i) => {
                const Icon = win.icon;
                return (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/[0.07] transition-colors">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${win.bg}`}>
                      <Icon className={`w-4 h-4 ${win.color}`} />
                    </div>
                    <span className="text-xs text-navy-200">{win.title}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-navy-600 ml-auto flex-shrink-0" />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Risks */}
          <div className="glass rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-semibold text-white">Active Risks</h3>
            </div>
            <div className="space-y-3">
              {topRisks.map((risk, i) => {
                const Icon = risk.icon;
                return (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/[0.07] transition-colors">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${risk.bg}`}>
                      <Icon className={`w-4 h-4 ${risk.color}`} />
                    </div>
                    <span className="text-xs text-navy-200">{risk.title}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-navy-600 ml-auto flex-shrink-0" />
                  </div>
                );
              })}
            </div>

            {/* Quick action */}
            <div className="mt-4 pt-4 border-t border-white/5">
              <div className="flex items-center justify-between text-xs text-navy-400">
                <span>3 items need attention</span>
                <button className="flex items-center gap-1 text-ocean-400 hover:text-ocean-300 transition-colors font-medium">
                  View action plan <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

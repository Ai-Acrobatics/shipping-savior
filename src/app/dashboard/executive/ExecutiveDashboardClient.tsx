"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Users,
  Building2,
  Calculator,
  Activity,
  Clock,
  Search,
  CalendarDays,
  ArrowLeft,
  Shield,
  Box,
  Zap,
  Ship,
  MapPin,
  ArrowRight,
  Hash,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
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
  LineChart,
  Line,
  Legend,
  AreaChart,
  Area,
} from "recharts";

// ─── Types ──────────────────────────────────────────────────

interface AnalyticsData {
  summary: {
    totalCalculations: number;
    totalUsers: number;
    totalOrganizations: number;
    totalSavings: number;
  };
  calculationsByType: Array<{ type: string; label: string; count: number }>;
  calculationsTrend: Array<Record<string, unknown>>;
  recentActivity: Array<{
    id: string;
    action: string;
    actionLabel: string;
    metadata: Record<string, unknown> | null;
    ipAddress: string | null;
    createdAt: string;
    userName: string;
    userEmail: string | null;
  }>;
  savings: {
    total: number;
    ftz: number;
    tariff: number;
    containerOptimization: number;
    byMonth: Array<{ month: string; amount: number }>;
  };
  organizationStats: Array<{
    id: string;
    name: string;
    plan: string;
    memberCount: number;
    calcCount: number;
  }>;
  topHtsCodes: Array<{ code: string; description: string; count: number }>;
  routeTrends: Array<{
    origin: string;
    destination: string;
    count: number;
    avgCost: number;
  }>;
}

// ─── Colors ─────────────────────────────────────────────────

const CALC_TYPE_COLORS: Record<string, string> = {
  landed_cost: "#0066FF",
  unit_economics: "#10b981",
  ftz_savings: "#f59e0b",
  pf_npf_comparison: "#8b5cf6",
  container_utilization: "#ec4899",
  tariff_scenario: "#06b6d4",
};

const PIE_COLORS = ["#0066FF", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4"];

const ACTION_ICONS: Record<string, { icon: typeof Activity; color: string; bg: string }> = {
  login: { icon: Users, color: "text-ocean-600", bg: "bg-ocean-50" },
  register: { icon: Zap, color: "text-emerald-600", bg: "bg-emerald-50" },
  logout: { icon: ArrowLeft, color: "text-navy-500", bg: "bg-navy-50" },
  failed_login: { icon: AlertCircle, color: "text-red-600", bg: "bg-red-50" },
  invite_sent: { icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
  invite_accepted: { icon: Users, color: "text-emerald-600", bg: "bg-emerald-50" },
  calculation_saved: { icon: Calculator, color: "text-ocean-600", bg: "bg-ocean-50" },
  calculation_deleted: { icon: AlertCircle, color: "text-red-600", bg: "bg-red-50" },
};

// ─── Custom Tooltip ─────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload) return null;
  return (
    <div className="bg-navy-900/95 backdrop-blur-sm border border-white/10 rounded-lg px-3 py-2 text-xs shadow-lg">
      <div className="text-white font-medium mb-1">{label}</div>
      {payload.map((entry: { name: string; value: number; color: string }, i: number) => (
        <div key={i} className="flex items-center gap-2 text-navy-300">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span>{entry.name}:</span>
          <span className="text-white font-medium">
            {typeof entry.value === "number" && entry.name.toLowerCase().includes("cost")
              ? `$${entry.value.toLocaleString()}`
              : entry.value.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Helpers ────────────────────────────────────────────────

function formatCurrency(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

function formatMonth(m: string): string {
  const [year, month] = m.split("-");
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[parseInt(month, 10) - 1]} ${year?.slice(2)}`;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// ─── Main Component ─────────────────────────────────────────

export default function ExecutiveDashboardClient() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{ from: string; to: string }>({
    from: "",
    to: "",
  });
  const [preset, setPreset] = useState<string>("all");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (dateRange.from) params.set("from", dateRange.from);
      if (dateRange.to) params.set("to", dateRange.to);
      const res = await fetch(`/api/analytics/executive?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load analytics");
      const json = await res.json();
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function applyPreset(key: string) {
    setPreset(key);
    const now = new Date();
    switch (key) {
      case "7d": {
        const d = new Date(now);
        d.setDate(d.getDate() - 7);
        setDateRange({ from: d.toISOString().slice(0, 10), to: now.toISOString().slice(0, 10) });
        break;
      }
      case "30d": {
        const d = new Date(now);
        d.setDate(d.getDate() - 30);
        setDateRange({ from: d.toISOString().slice(0, 10), to: now.toISOString().slice(0, 10) });
        break;
      }
      case "90d": {
        const d = new Date(now);
        d.setDate(d.getDate() - 90);
        setDateRange({ from: d.toISOString().slice(0, 10), to: now.toISOString().slice(0, 10) });
        break;
      }
      case "1y": {
        const d = new Date(now);
        d.setFullYear(d.getFullYear() - 1);
        setDateRange({ from: d.toISOString().slice(0, 10), to: now.toISOString().slice(0, 10) });
        break;
      }
      default:
        setDateRange({ from: "", to: "" });
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-navy-500">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span className="text-sm font-medium">Loading analytics...</span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-navy-50 flex items-center justify-center">
        <div className="bg-white border border-red-200 rounded-2xl p-8 max-w-md text-center shadow-soft">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-navy-900 mb-2">Error loading analytics</h2>
          <p className="text-sm text-navy-500 mb-4">{error || "Unknown error"}</p>
          <button
            onClick={fetchData}
            className="inline-flex items-center gap-2 text-sm bg-ocean-50 text-ocean-700 border border-ocean-200 px-4 py-2 rounded-lg hover:bg-ocean-100 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { summary, calculationsByType, calculationsTrend, recentActivity, savings, organizationStats, topHtsCodes, routeTrends } = data;

  return (
    <div className="min-h-screen bg-navy-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-navy-100 px-6 py-4 sticky top-0 z-40 shadow-soft">
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-ocean-500 to-ocean-700 flex items-center justify-center shadow-sm">
                <Ship className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-sm text-navy-900">
                Shipping<span className="text-ocean-500">Savior</span>
              </span>
            </Link>
            <nav className="hidden md:flex items-center gap-1">
              <Link href="/dashboard" className="px-3 py-1.5 rounded-lg text-sm text-navy-500 hover:text-navy-900 hover:bg-navy-50 transition-colors font-medium">
                Operations
              </Link>
              <Link href="/dashboard/analytics" className="px-3 py-1.5 rounded-lg text-sm text-navy-500 hover:text-navy-900 hover:bg-navy-50 transition-colors font-medium">
                Cost Analytics
              </Link>
              <span className="px-3 py-1.5 rounded-lg text-sm bg-ocean-50 text-ocean-700 font-medium">
                Executive
              </span>
            </nav>
          </div>
          <button
            onClick={fetchData}
            className="flex items-center gap-2 text-xs border border-navy-200 hover:bg-navy-50 px-3 py-2 rounded-lg text-navy-500 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
        </div>
      </header>

      <div className="max-w-screen-2xl mx-auto px-6 py-8 space-y-8">
        {/* Page Header + Date Filter */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-navy-900">Executive Dashboard</h1>
            <p className="text-sm text-navy-500 mt-1">
              Real-time analytics from your shipping operations
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Presets */}
            {[
              { key: "all", label: "All Time" },
              { key: "7d", label: "7D" },
              { key: "30d", label: "30D" },
              { key: "90d", label: "90D" },
              { key: "1y", label: "1Y" },
            ].map((p) => (
              <button
                key={p.key}
                onClick={() => applyPreset(p.key)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                  preset === p.key
                    ? "bg-ocean-50 text-ocean-700 border-ocean-200"
                    : "bg-white text-navy-500 border-navy-200 hover:bg-navy-50"
                }`}
              >
                {p.label}
              </button>
            ))}
            <div className="flex items-center gap-1 ml-2">
              <CalendarDays className="w-3.5 h-3.5 text-navy-400" />
              <input
                type="date"
                value={dateRange.from}
                onChange={(e) => {
                  setPreset("custom");
                  setDateRange((prev) => ({ ...prev, from: e.target.value }));
                }}
                className="text-xs border border-navy-200 rounded-lg px-2 py-1.5 bg-white text-navy-700 focus:outline-none focus:ring-1 focus:ring-ocean-300"
              />
              <span className="text-xs text-navy-400">to</span>
              <input
                type="date"
                value={dateRange.to}
                onChange={(e) => {
                  setPreset("custom");
                  setDateRange((prev) => ({ ...prev, to: e.target.value }));
                }}
                className="text-xs border border-navy-200 rounded-lg px-2 py-1.5 bg-white text-navy-700 focus:outline-none focus:ring-1 focus:ring-ocean-300"
              />
            </div>
          </div>
        </div>

        {/* Summary KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "Total Calculations",
              value: summary.totalCalculations.toLocaleString(),
              icon: Calculator,
              color: "bg-ocean-50 text-ocean-600",
            },
            {
              label: "Total Users",
              value: summary.totalUsers.toLocaleString(),
              icon: Users,
              color: "bg-emerald-50 text-emerald-600",
            },
            {
              label: "Organizations",
              value: summary.totalOrganizations.toLocaleString(),
              icon: Building2,
              color: "bg-purple-50 text-purple-600",
            },
            {
              label: "Cost Savings Tracked",
              value: formatCurrency(summary.totalSavings),
              icon: DollarSign,
              color: "bg-amber-50 text-amber-600",
            },
          ].map((kpi) => (
            <div key={kpi.label} className="bg-white border border-navy-100 rounded-2xl p-5 shadow-soft hover:shadow-card transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-navy-500 font-semibold uppercase tracking-wide">{kpi.label}</span>
                <div className={`w-8 h-8 rounded-lg ${kpi.color} flex items-center justify-center`}>
                  <kpi.icon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-navy-900">{kpi.value}</div>
            </div>
          ))}
        </div>

        {/* Charts Row 1: Calculations by Type + Savings Breakdown */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Bar Chart: Calculations by Type */}
          <div className="bg-white border border-navy-100 rounded-2xl p-6 shadow-soft">
            <div className="flex items-center gap-2 mb-5">
              <BarChart3 className="w-4 h-4 text-ocean-500" />
              <h2 className="text-base font-semibold text-navy-900">Calculations by Type</h2>
            </div>
            {calculationsByType.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={calculationsByType} layout="vertical" margin={{ left: 20, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" tick={{ fontSize: 11, fill: "#6b7280" }} />
                  <YAxis
                    type="category"
                    dataKey="label"
                    tick={{ fontSize: 11, fill: "#6b7280" }}
                    width={130}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Calculations" radius={[0, 4, 4, 0]}>
                    {calculationsByType.map((entry, i) => (
                      <Cell key={i} fill={CALC_TYPE_COLORS[entry.type] || PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState message="No calculations yet" />
            )}
          </div>

          {/* Pie Chart: Savings Breakdown */}
          <div className="bg-white border border-navy-100 rounded-2xl p-6 shadow-soft">
            <div className="flex items-center gap-2 mb-5">
              <DollarSign className="w-4 h-4 text-emerald-500" />
              <h2 className="text-base font-semibold text-navy-900">Savings Breakdown</h2>
            </div>
            {savings.total > 0 ? (
              <div className="flex items-center gap-6">
                <ResponsiveContainer width="50%" height={260}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: "FTZ Savings", value: savings.ftz },
                        { name: "Tariff Savings", value: savings.tariff },
                        { name: "Container Opt.", value: savings.containerOptimization },
                      ].filter((d) => d.value > 0)}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={90}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {["#f59e0b", "#06b6d4", "#ec4899"].map((color, i) => (
                        <Cell key={i} fill={color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => formatCurrency(Number(value))}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-3 flex-1">
                  {[
                    { label: "FTZ Savings", value: savings.ftz, color: "#f59e0b", icon: Shield },
                    { label: "Tariff Savings", value: savings.tariff, color: "#06b6d4", icon: TrendingUp },
                    { label: "Container Opt.", value: savings.containerOptimization, color: "#ec4899", icon: Box },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-3">
                      <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-navy-500">{item.label}</div>
                        <div className="text-sm font-semibold text-navy-900">{formatCurrency(item.value)}</div>
                      </div>
                    </div>
                  ))}
                  <div className="pt-3 border-t border-navy-100">
                    <div className="text-xs text-navy-400">Total Savings</div>
                    <div className="text-lg font-bold text-emerald-600">{formatCurrency(savings.total)}</div>
                  </div>
                </div>
              </div>
            ) : (
              <EmptyState message="No savings data yet" />
            )}
          </div>
        </div>

        {/* Charts Row 2: Trend + Savings Over Time */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Calculations Trend */}
          <div className="bg-white border border-navy-100 rounded-2xl p-6 shadow-soft">
            <div className="flex items-center gap-2 mb-5">
              <TrendingUp className="w-4 h-4 text-ocean-500" />
              <h2 className="text-base font-semibold text-navy-900">Calculation Volume Trend</h2>
            </div>
            {calculationsTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart
                  data={calculationsTrend.map((d) => ({
                    ...d,
                    month: formatMonth(d.month as string),
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#6b7280" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="total" name="Total" stroke="#0066FF" fill="#0066FF" fillOpacity={0.1} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState message="No trend data yet" />
            )}
          </div>

          {/* Savings Over Time */}
          <div className="bg-white border border-navy-100 rounded-2xl p-6 shadow-soft">
            <div className="flex items-center gap-2 mb-5">
              <DollarSign className="w-4 h-4 text-emerald-500" />
              <h2 className="text-base font-semibold text-navy-900">Savings Over Time</h2>
            </div>
            {savings.byMonth.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={savings.byMonth.map((d) => ({ ...d, month: formatMonth(d.month) }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#6b7280" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} tickFormatter={(v) => formatCurrency(v)} />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Bar dataKey="amount" name="Savings" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState message="No savings trend data" />
            )}
          </div>
        </div>

        {/* Middle Section: Activity Feed + Org Stats */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Activity Feed */}
          <div className="lg:col-span-2 bg-white border border-navy-100 rounded-2xl p-6 shadow-soft">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-ocean-500" />
                <h2 className="text-base font-semibold text-navy-900">User Activity Feed</h2>
              </div>
              <span className="text-xs text-navy-400">{recentActivity.length} events</span>
            </div>
            {recentActivity.length > 0 ? (
              <div className="space-y-1 max-h-[400px] overflow-y-auto">
                {recentActivity.map((event) => {
                  const config = ACTION_ICONS[event.action] || { icon: Activity, color: "text-navy-500", bg: "bg-navy-50" };
                  const Icon = config.icon;
                  return (
                    <div key={event.id} className="flex items-start gap-3 py-2.5 border-b border-navy-50 last:border-0">
                      <div className={`w-7 h-7 rounded-lg ${config.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                        <Icon className={`w-3.5 h-3.5 ${config.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-navy-900">{event.userName}</span>
                          <span className="text-xs text-navy-500">{event.actionLabel}</span>
                        </div>
                        {event.metadata && Object.keys(event.metadata).length > 0 && (
                          <div className="text-xs text-navy-400 mt-0.5 truncate">
                            {Object.entries(event.metadata)
                              .slice(0, 3)
                              .map(([k, v]) => `${k}: ${v}`)
                              .join(" · ")}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs text-navy-400">{timeAgo(event.createdAt)}</span>
                        {event.ipAddress && (
                          <span className="text-[10px] text-navy-300 font-mono">{event.ipAddress}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState message="No activity recorded yet" />
            )}
          </div>

          {/* Organization Stats */}
          <div className="bg-white border border-navy-100 rounded-2xl p-6 shadow-soft">
            <div className="flex items-center gap-2 mb-5">
              <Building2 className="w-4 h-4 text-purple-500" />
              <h2 className="text-base font-semibold text-navy-900">Organization Usage</h2>
            </div>
            {organizationStats.length > 0 ? (
              <div className="space-y-3">
                {organizationStats.map((org) => (
                  <div key={org.id} className="border border-navy-100 rounded-xl p-4 hover:shadow-card transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-navy-900 truncate">{org.name}</div>
                        <span className={`inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-full border mt-1 ${
                          org.plan === "enterprise"
                            ? "bg-purple-50 text-purple-700 border-purple-200"
                            : org.plan === "pro"
                            ? "bg-ocean-50 text-ocean-700 border-ocean-200"
                            : "bg-navy-50 text-navy-600 border-navy-200"
                        }`}>
                          {org.plan}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      <div className="bg-navy-50 rounded-lg px-3 py-2">
                        <div className="text-[10px] text-navy-400 uppercase tracking-wide">Members</div>
                        <div className="text-sm font-bold text-navy-900">{org.memberCount}</div>
                      </div>
                      <div className="bg-navy-50 rounded-lg px-3 py-2">
                        <div className="text-[10px] text-navy-400 uppercase tracking-wide">Calcs</div>
                        <div className="text-sm font-bold text-navy-900">{org.calcCount}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState message="No organizations yet" />
            )}
          </div>
        </div>

        {/* Bottom Section: Top HTS Codes + Route Trends */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Top HTS Codes */}
          <div className="bg-white border border-navy-100 rounded-2xl p-6 shadow-soft">
            <div className="flex items-center gap-2 mb-5">
              <Hash className="w-4 h-4 text-ocean-500" />
              <h2 className="text-base font-semibold text-navy-900">Top HTS Codes Searched</h2>
            </div>
            {topHtsCodes.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-navy-100">
                      <th className="text-left text-xs text-navy-400 font-semibold uppercase tracking-wide pb-3 pr-4">Code</th>
                      <th className="text-left text-xs text-navy-400 font-semibold uppercase tracking-wide pb-3 pr-4">Description</th>
                      <th className="text-right text-xs text-navy-400 font-semibold uppercase tracking-wide pb-3">Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topHtsCodes.map((hts, i) => {
                      const maxCount = topHtsCodes[0]?.count || 1;
                      return (
                        <tr key={hts.code} className="border-b border-navy-50 last:border-0 hover:bg-navy-50/50 transition-colors">
                          <td className="py-2.5 pr-4">
                            <span className="text-sm font-mono font-medium text-ocean-700">{hts.code}</span>
                          </td>
                          <td className="py-2.5 pr-4">
                            <div className="text-xs text-navy-600 truncate max-w-[200px]">{hts.description || "—"}</div>
                          </td>
                          <td className="py-2.5">
                            <div className="flex items-center justify-end gap-2">
                              <div className="w-16 bg-navy-100 rounded-full h-1.5">
                                <div
                                  className="h-full rounded-full bg-ocean-400"
                                  style={{ width: `${(hts.count / maxCount) * 100}%` }}
                                />
                              </div>
                              <span className="text-xs font-medium text-navy-900 w-6 text-right">{hts.count}</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState message="No HTS codes searched yet" />
            )}
          </div>

          {/* Route Comparison Trends */}
          <div className="bg-white border border-navy-100 rounded-2xl p-6 shadow-soft">
            <div className="flex items-center gap-2 mb-5">
              <MapPin className="w-4 h-4 text-ocean-500" />
              <h2 className="text-base font-semibold text-navy-900">Route Comparison Trends</h2>
            </div>
            {routeTrends.length > 0 ? (
              <div className="space-y-3">
                {routeTrends.map((route, i) => {
                  const maxCount = routeTrends[0]?.count || 1;
                  return (
                    <div key={`${route.origin}-${route.destination}`} className="border border-navy-100 rounded-xl p-4 hover:shadow-card transition-shadow">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5 text-sm font-medium text-navy-900">
                          <span>{route.origin}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-navy-400" />
                          <span>{route.destination}</span>
                        </div>
                        <span className="text-xs bg-ocean-50 text-ocean-700 px-2 py-0.5 rounded-full font-medium">
                          {route.count} calcs
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <div className="w-full bg-navy-100 rounded-full h-1.5">
                            <div
                              className="h-full rounded-full bg-ocean-400"
                              style={{ width: `${(route.count / maxCount) * 100}%` }}
                            />
                          </div>
                        </div>
                        {route.avgCost > 0 && (
                          <span className="text-xs text-navy-500 flex-shrink-0">
                            Avg: {formatCurrency(route.avgCost)}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState message="No route data yet" />
            )}
          </div>
        </div>

        {/* Back to Dashboard */}
        <div className="flex items-center justify-center pb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-navy-400 hover:text-ocean-600 transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Operations Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-navy-400">
      <Search className="w-8 h-8 mb-2 opacity-50" />
      <p className="text-sm">{message}</p>
      <p className="text-xs mt-1">Data will appear as users interact with the platform</p>
    </div>
  );
}

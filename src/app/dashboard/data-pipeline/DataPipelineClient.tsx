// @ts-nocheck
"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Database,
  RefreshCw,
  Wifi,
  WifiOff,
  TrendingUp,
  TrendingDown,
  Zap,
  Filter,
  ChevronDown,
  ChevronUp,
  Info,
  Shield,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Circle,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import {
  carrierAPIConnections,
  dataPipelines,
  dataFreshnessItems,
  pipelineErrors,
  ingestionRateTimeline,
  getPipelineSummaryStats,
  type CarrierAPIConnection,
  type PipelineStage,
  type DataFreshnessItem,
  type PipelineError,
} from "@/lib/data/monitoring";

// ─── Helpers ──────────────────────────────────────────────────

function StatusDot({ status }: { status: string }) {
  const map: Record<string, string> = {
    connected: "bg-emerald-400",
    healthy: "bg-emerald-400",
    fresh: "bg-emerald-400",
    degraded: "bg-amber-400",
    warning: "bg-amber-400",
    stale: "bg-amber-400",
    disconnected: "bg-red-400",
    error: "bg-red-400",
    critical: "bg-red-500",
    idle: "bg-navy-400",
    maintenance: "bg-purple-400",
  };
  const cls = map[status] ?? "bg-navy-400";
  return (
    <span className="relative flex items-center justify-center w-3 h-3 flex-shrink-0">
      {(status === "connected" || status === "healthy" || status === "fresh") && (
        <span className={`absolute inline-flex h-full w-full rounded-full ${cls} opacity-40 animate-ping`} />
      )}
      <span className={`relative inline-flex w-2 h-2 rounded-full ${cls}`} />
    </span>
  );
}

function StatusBadge({ status, size = "sm" }: { status: string; size?: "sm" | "xs" }) {
  const map: Record<string, { label: string; cls: string }> = {
    connected: { label: "Connected", cls: "bg-emerald-500/20 text-emerald-300" },
    healthy: { label: "Healthy", cls: "bg-emerald-500/20 text-emerald-300" },
    fresh: { label: "Fresh", cls: "bg-emerald-500/20 text-emerald-300" },
    degraded: { label: "Degraded", cls: "bg-amber-500/20 text-amber-300" },
    warning: { label: "Warning", cls: "bg-amber-500/20 text-amber-300" },
    stale: { label: "Stale", cls: "bg-amber-500/20 text-amber-300" },
    disconnected: { label: "Disconnected", cls: "bg-red-500/20 text-red-300" },
    error: { label: "Error", cls: "bg-red-500/20 text-red-300" },
    critical: { label: "Critical", cls: "bg-red-500/25 text-red-300" },
    idle: { label: "Idle", cls: "bg-navy-400/20 text-navy-300" },
    maintenance: { label: "Maintenance", cls: "bg-purple-500/20 text-purple-300" },
  };
  const c = map[status] ?? { label: status, cls: "bg-navy-400/20 text-navy-300" };
  return (
    <span
      className={`font-medium rounded-full px-2 py-0.5 ${c.cls} ${
        size === "xs" ? "text-[9px]" : "text-[10px]"
      }`}
    >
      {c.label}
    </span>
  );
}

function MiniBar({
  value,
  max,
  colorClass = "bg-ocean-500",
}: {
  value: number;
  max: number;
  colorClass?: string;
}) {
  const pct = Math.min((value / max) * 100, 100);
  const bar = pct > 90 ? "bg-red-500" : pct > 75 ? "bg-amber-400" : colorClass;
  return (
    <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
      <div className={`h-full rounded-full transition-all ${bar}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function FreshnessBar({ age, sla }: { age: number; sla: number }) {
  const pct = Math.min((age / sla) * 100, 100);
  const bar = pct > 100 ? "bg-red-500" : pct > 80 ? "bg-amber-400" : "bg-emerald-500";
  return (
    <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
      <div className={`h-full rounded-full transition-all ${bar}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

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
            {entry.value.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Carrier API Card ──────────────────────────────────────────

function CarrierAPICard({ conn }: { conn: CarrierAPIConnection }) {
  const [expanded, setExpanded] = useState(false);
  const ratePct = Math.round((conn.rateLimit.used / conn.rateLimit.limit) * 100);

  return (
    <div
      className={`glass rounded-2xl border transition-all ${
        conn.status === "disconnected"
          ? "border-red-500/30"
          : conn.status === "degraded"
          ? "border-amber-500/30"
          : "border-white/5"
      }`}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer select-none"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <StatusDot status={conn.status} />
          <div>
            <div className="text-sm font-semibold text-white flex items-center gap-2">
              {conn.carrierName}
              <span className="text-[9px] font-normal text-navy-500 bg-white/5 px-1.5 py-0.5 rounded">
                {conn.connectionType}
              </span>
            </div>
            <div className="text-[10px] text-navy-500 mt-0.5">
              Last sync: {conn.lastSyncedAt}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-medium text-white">
              {conn.recordsToday.toLocaleString()}
            </div>
            <div className="text-[9px] text-navy-500">records today</div>
          </div>
          <div className="text-right hidden md:block">
            <div
              className={`text-xs font-medium ${
                conn.avgLatencyMs === 0
                  ? "text-navy-500"
                  : conn.avgLatencyMs < 300
                  ? "text-emerald-400"
                  : conn.avgLatencyMs < 600
                  ? "text-amber-400"
                  : "text-red-400"
              }`}
            >
              {conn.avgLatencyMs === 0 ? "—" : `${conn.avgLatencyMs}ms`}
            </div>
            <div className="text-[9px] text-navy-500">latency</div>
          </div>
          <StatusBadge status={conn.status} />
          <button className="text-navy-500 hover:text-white transition-colors">
            {expanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Expanded Detail */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-white/5 pt-3 space-y-3">
          {conn.notes && (
            <div className="flex items-start gap-2 text-[11px] text-amber-300 bg-amber-500/10 rounded-lg px-3 py-2">
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              {conn.notes}
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <div className="text-[10px] text-navy-500 mb-1">Region</div>
              <div className="text-xs text-white">{conn.region}</div>
            </div>
            <div>
              <div className="text-[10px] text-navy-500 mb-1">Auth Method</div>
              <div className="text-xs text-white">{conn.authMethod}</div>
            </div>
            <div>
              <div className="text-[10px] text-navy-500 mb-1">30d Uptime</div>
              <div
                className={`text-xs font-medium ${
                  conn.uptime30d >= 99.5
                    ? "text-emerald-400"
                    : conn.uptime30d >= 98
                    ? "text-amber-400"
                    : "text-red-400"
                }`}
              >
                {conn.uptime30d}%
              </div>
            </div>
            <div>
              <div className="text-[10px] text-navy-500 mb-1">Error Rate</div>
              <div
                className={`text-xs font-medium ${
                  conn.errorRate === 0
                    ? "text-emerald-400"
                    : conn.errorRate < 0.5
                    ? "text-ocean-300"
                    : conn.errorRate < 2
                    ? "text-amber-400"
                    : "text-red-400"
                }`}
              >
                {conn.errorRate === 100 ? "N/A" : `${conn.errorRate}%`}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-navy-500 mb-1">Last Ping</div>
              <div className="text-xs text-white">{conn.lastPing}</div>
            </div>
            <div>
              <div className="text-[10px] text-navy-500 mb-1">Rate Limit Reset</div>
              <div className="text-xs text-white">{conn.rateLimit.resetIn}</div>
            </div>
          </div>

          {/* Rate Limit Bar */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-navy-500">API Rate Limit</span>
              <span className="text-[10px] text-navy-400">
                {conn.rateLimit.used.toLocaleString()} / {conn.rateLimit.limit.toLocaleString()} calls
                <span className="ml-1 text-navy-500">({ratePct}%)</span>
              </span>
            </div>
            <MiniBar value={conn.rateLimit.used} max={conn.rateLimit.limit} colorClass="bg-ocean-500" />
          </div>

          {/* Data Types */}
          <div>
            <div className="text-[10px] text-navy-500 mb-1.5">Data Types Synced</div>
            <div className="flex flex-wrap gap-1">
              {conn.dataTypes.map((dt) => (
                <span
                  key={dt}
                  className="text-[9px] px-1.5 py-0.5 rounded bg-ocean-500/15 text-ocean-300 border border-ocean-500/20"
                >
                  {dt}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Pipeline Row ──────────────────────────────────────────────

function PipelineRow({ pipeline }: { pipeline: PipelineStage }) {
  return (
    <tr className="border-b border-white/5 hover:bg-white/[0.03] transition-colors group">
      <td className="py-3 px-4">
        <div className="flex items-center gap-2">
          <StatusDot status={pipeline.status} />
          <div>
            <div className="text-xs font-medium text-white group-hover:text-ocean-300 transition-colors">
              {pipeline.name}
            </div>
            <div className="text-[10px] text-navy-500 mt-0.5">{pipeline.description}</div>
          </div>
        </div>
      </td>
      <td className="py-3 px-3 hidden sm:table-cell">
        <StatusBadge status={pipeline.status} />
      </td>
      <td className="py-3 px-3 text-xs text-navy-300 hidden md:table-cell">
        {pipeline.lastRun}
      </td>
      <td className="py-3 px-3 text-xs text-navy-300 hidden lg:table-cell">
        {pipeline.nextRun}
      </td>
      <td className="py-3 px-3 text-xs text-navy-300 hidden lg:table-cell">
        {pipeline.avgDuration}
      </td>
      <td className="py-3 px-3 text-xs text-white">
        {pipeline.recordsProcessed.toLocaleString()}
      </td>
      <td className="py-3 px-3 text-xs">
        <span
          className={
            pipeline.errorCount === 0
              ? "text-emerald-400"
              : pipeline.errorCount < 5
              ? "text-amber-400"
              : "text-red-400"
          }
        >
          {pipeline.errorCount}
        </span>
      </td>
      <td className="py-3 px-3 text-xs">
        <span
          className={
            pipeline.successRate >= 99.9
              ? "text-emerald-400"
              : pipeline.successRate >= 99
              ? "text-ocean-300"
              : pipeline.successRate >= 95
              ? "text-amber-400"
              : "text-red-400"
          }
        >
          {pipeline.successRate}%
        </span>
      </td>
    </tr>
  );
}

// ─── Error Log Row ─────────────────────────────────────────────

function ErrorLogRow({ err }: { err: PipelineError }) {
  const sev =
    err.severity === "critical"
      ? { dot: "bg-red-500", text: "text-red-400", badge: "bg-red-500/15 text-red-300" }
      : err.severity === "warning"
      ? { dot: "bg-amber-400", text: "text-amber-400", badge: "bg-amber-500/15 text-amber-300" }
      : { dot: "bg-navy-400", text: "text-navy-400", badge: "bg-navy-400/15 text-navy-300" };

  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 rounded-xl border transition-colors ${
        err.resolved ? "border-white/5 bg-white/[0.02]" : "border-white/[0.07] bg-white/[0.04]"
      }`}
    >
      <span className={`w-2 h-2 rounded-full flex-shrink-0 mt-1 ${sev.dot} ${err.resolved ? "opacity-40" : ""}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-0.5">
          <span className="text-xs font-medium text-white">{err.pipeline}</span>
          {err.carrier && (
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-ocean-500/15 text-ocean-300">
              {err.carrier}
            </span>
          )}
          <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full ${sev.badge}`}>
            {err.severity.toUpperCase()}
          </span>
          {err.resolved && (
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400">
              Resolved
            </span>
          )}
        </div>
        <div className={`text-[11px] ${err.resolved ? "text-navy-500" : "text-navy-300"}`}>
          {err.message}
        </div>
        <div className="text-[10px] text-navy-600 mt-1">{err.timestamp}</div>
      </div>
      {err.count > 0 && (
        <div className="flex-shrink-0 text-right">
          <div className={`text-xs font-bold ${sev.text}`}>{err.count}x</div>
          <div className="text-[9px] text-navy-600">occurrences</div>
        </div>
      )}
    </div>
  );
}

// ─── Freshness Card ────────────────────────────────────────────

function FreshnessCard({ item }: { item: DataFreshnessItem }) {
  const ageFmt =
    item.ageMinutes < 60
      ? `${item.ageMinutes}m ago`
      : `${Math.round(item.ageMinutes / 60)}h ago`;

  return (
    <div
      className={`glass rounded-xl p-3.5 border transition-all ${
        item.status === "critical"
          ? "border-red-500/30 bg-red-500/5"
          : item.status === "stale"
          ? "border-amber-500/20 bg-amber-500/5"
          : "border-white/5"
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <div className="text-xs font-medium text-white leading-tight">{item.dataSource}</div>
          <div className="text-[9px] text-navy-500 mt-0.5">{item.category}</div>
        </div>
        <StatusBadge status={item.status} size="xs" />
      </div>

      <FreshnessBar age={item.ageMinutes} sla={item.slaMinutes} />

      <div className="flex items-center justify-between mt-1.5">
        <span className="text-[10px] text-navy-500">{item.updateFrequency}</span>
        <span
          className={`text-[10px] font-medium ${
            item.status === "critical"
              ? "text-red-400"
              : item.status === "stale"
              ? "text-amber-400"
              : "text-emerald-400"
          }`}
        >
          {ageFmt}
        </span>
      </div>

      <div className="text-[9px] text-navy-600 mt-1">
        {item.recordCount > 0 ? `${item.recordCount.toLocaleString()} records` : "No data"}
        {" · "}Updated {item.lastUpdated}
      </div>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────

export default function DataPipelineClient() {
  const stats = getPipelineSummaryStats();
  const [carrierFilter, setCarrierFilter] = useState<"all" | "connected" | "degraded" | "disconnected">("all");
  const [errorFilter, setErrorFilter] = useState<"all" | "active" | "resolved">("all");

  const filteredCarriers = carrierAPIConnections.filter((c) => {
    if (carrierFilter === "all") return true;
    return c.status === carrierFilter;
  });

  const filteredErrors = pipelineErrors.filter((e) => {
    if (errorFilter === "all") return true;
    if (errorFilter === "active") return !e.resolved;
    return e.resolved;
  });

  const totalRecordsToday = stats.totalRecordsToday;
  const activeErrors = pipelineErrors.filter((e) => !e.resolved).length;
  const criticalErrors = pipelineErrors.filter((e) => e.severity === "critical" && !e.resolved).length;

  return (
    <div className="space-y-6 text-white">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-ocean-400" />
            Data Pipeline Health
          </h1>
          <p className="text-sm text-navy-400 mt-0.5">
            Carrier API connections, ingestion rates, pipeline status, and data freshness
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live
          </div>
          <button className="flex items-center gap-1.5 text-xs text-navy-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 px-3 py-1.5 rounded-lg transition-colors">
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          {
            label: "Records Today",
            value: totalRecordsToday.toLocaleString(),
            icon: <BarChart3 className="w-4 h-4 text-ocean-400" />,
            sub: "across all pipelines",
            color: "text-white",
          },
          {
            label: "Carriers Online",
            value: `${stats.connectedCarriers}/${stats.totalCarriers}`,
            icon: <Wifi className="w-4 h-4 text-emerald-400" />,
            sub: "API connections",
            color: stats.connectedCarriers === stats.totalCarriers ? "text-emerald-400" : "text-amber-400",
          },
          {
            label: "Active Errors",
            value: activeErrors.toString(),
            icon: <AlertTriangle className="w-4 h-4 text-amber-400" />,
            sub: `${criticalErrors} critical`,
            color: activeErrors === 0 ? "text-emerald-400" : criticalErrors > 0 ? "text-red-400" : "text-amber-400",
          },
          {
            label: "Healthy Pipelines",
            value: `${stats.healthyPipelines}/${dataPipelines.length}`,
            icon: <Activity className="w-4 h-4 text-ocean-400" />,
            sub: "running normally",
            color: stats.healthyPipelines === dataPipelines.length ? "text-emerald-400" : "text-amber-400",
          },
          {
            label: "Fresh Data",
            value: `${stats.freshDataSources}/${dataFreshnessItems.length}`,
            icon: <Zap className="w-4 h-4 text-yellow-400" />,
            sub: "within SLA",
            color: stats.freshDataSources >= dataFreshnessItems.length - 1 ? "text-emerald-400" : "text-amber-400",
          },
          {
            label: "Last Full Sync",
            value: "14:43",
            icon: <Clock className="w-4 h-4 text-navy-400" />,
            sub: "UTC today",
            color: "text-white",
          },
        ].map((stat) => (
          <div key={stat.label} className="glass rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              {stat.icon}
              <span className="text-[10px] text-navy-500">{stat.label}</span>
            </div>
            <div className={`text-lg font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-[10px] text-navy-500 mt-0.5">{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* Ingestion Rate Chart */}
      <div className="glass rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-white">Ingestion Rate — Today (UTC)</h2>
          <span className="text-[10px] text-navy-500">Records ingested &amp; errors per 2h window</span>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={ingestionRateTimeline} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="ingestGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00bcd4" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#00bcd4" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="errorGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="time" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
            <YAxis yAxisId="records" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
            <YAxis yAxisId="errors" orientation="right" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              yAxisId="records"
              type="monotone"
              dataKey="recordsIngested"
              name="Records"
              stroke="#00bcd4"
              strokeWidth={2}
              fill="url(#ingestGrad)"
            />
            <Area
              yAxisId="errors"
              type="monotone"
              dataKey="errorsLogged"
              name="Errors"
              stroke="#f59e0b"
              strokeWidth={1.5}
              fill="url(#errorGrad)"
              strokeDasharray="4 2"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Carrier API Connections */}
      <div className="glass rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Wifi className="w-4 h-4 text-ocean-400" />
            Carrier API Connections
            <span className="text-[10px] text-navy-500 font-normal">
              ({stats.connectedCarriers} connected, {carrierAPIConnections.filter(c => c.status === "degraded").length} degraded, {carrierAPIConnections.filter(c => c.status === "disconnected").length} down)
            </span>
          </h2>
          <div className="flex items-center gap-1">
            {(["all", "connected", "degraded", "disconnected"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setCarrierFilter(f)}
                className={`text-[10px] px-2.5 py-1 rounded-lg capitalize transition-colors ${
                  carrierFilter === f
                    ? "bg-ocean-500/20 text-ocean-300 border border-ocean-500/30"
                    : "text-navy-500 bg-white/5 hover:text-white"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          {filteredCarriers.map((conn) => (
            <CarrierAPICard key={conn.carrierId} conn={conn} />
          ))}
        </div>
      </div>

      {/* Pipeline Status Table + Data Freshness side by side */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        {/* Pipeline Table */}
        <div className="xl:col-span-3 glass rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-ocean-400" />
            Pipeline Stage Status
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10">
                  {["Pipeline", "Status", "Last Run", "Next Run", "Duration", "Records", "Errors", "Success %"].map(
                    (h) => (
                      <th
                        key={h}
                        className={`pb-2 text-[10px] font-medium text-navy-500 pr-3 ${
                          h === "Status" ? "hidden sm:table-cell" :
                          h === "Last Run" ? "hidden md:table-cell" :
                          ["Next Run", "Duration"].includes(h) ? "hidden lg:table-cell" : ""
                        }`}
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {dataPipelines.map((p) => (
                  <PipelineRow key={p.name} pipeline={p} />
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Data Freshness */}
        <div className="xl:col-span-2 glass rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            Data Freshness
          </h2>
          <div className="space-y-2">
            {dataFreshnessItems.map((item) => (
              <FreshnessCard key={item.dataSource} item={item} />
            ))}
          </div>
        </div>
      </div>

      {/* Error / Warning Log */}
      <div className="glass rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            Pipeline Error Log
            {activeErrors > 0 && (
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-red-500/20 text-red-300">
                {activeErrors} active
              </span>
            )}
          </h2>
          <div className="flex items-center gap-1">
            {(["all", "active", "resolved"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setErrorFilter(f)}
                className={`text-[10px] px-2.5 py-1 rounded-lg capitalize transition-colors ${
                  errorFilter === f
                    ? "bg-ocean-500/20 text-ocean-300 border border-ocean-500/30"
                    : "text-navy-500 bg-white/5 hover:text-white"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          {filteredErrors.length === 0 ? (
            <div className="text-center py-8 text-navy-500 text-sm">No errors to display</div>
          ) : (
            filteredErrors.map((err) => (
              <ErrorLogRow key={err.id} err={err} />
            ))
          )}
        </div>
      </div>

      {/* Latency Comparison Bar Chart */}
      <div className="glass rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-ocean-400" />
          Carrier API Avg Latency (ms)
        </h2>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart
            data={carrierAPIConnections
              .filter((c) => c.avgLatencyMs > 0)
              .map((c) => ({ name: c.carrierName, latency: c.avgLatencyMs, target: 300 }))}
            margin={{ top: 4, right: 4, bottom: 0, left: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="latency" name="Latency (ms)" fill="#00bcd4" radius={[4, 4, 0, 0]} />
            <Bar dataKey="target" name="Target (ms)" fill="rgba(255,255,255,0.06)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <div className="flex items-center justify-center gap-4 mt-2">
          <div className="flex items-center gap-1.5 text-[10px] text-navy-400">
            <span className="w-3 h-2 rounded-sm bg-ocean-400 inline-block" />
            Actual latency
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-navy-400">
            <span className="w-3 h-2 rounded-sm bg-white/10 inline-block" />
            300ms target
          </div>
        </div>
      </div>
    </div>
  );
}

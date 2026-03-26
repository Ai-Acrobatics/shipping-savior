// @ts-nocheck
"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import {
  Activity, Server, Database, Brain, BarChart3, Target,
  CheckCircle2, AlertTriangle, XCircle, Clock, Cpu,
  HardDrive, Wifi, TrendingUp, TrendingDown, Zap,
  Eye, Shield, FileSearch, Bot, Gauge, Users, DollarSign,
  RefreshCw, ChevronRight, Check, X, Minus, ArrowUpDown,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, BarChart, Bar, RadarChart,
  Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend,
} from "recharts";
import {
  platformServices,
  uptimeHistory,
  resourceMetrics,
  dataPipelines,
  dataQualityMetrics,
  aiAgents,
  aiPerformanceTrends,
  businessKPIs,
  revenueTimeline,
  competitors,
  featureComparison,
  getOverallPlatformStatus,
  getOverallUptime,
  getAITotalCost,
  getDataQualityScore,
} from "@/lib/data/monitoring";

// ─── Types ─────────────────────────────────────────────────────

type MonitoringTab = "platform" | "data" | "ai" | "business" | "competitors";

// ─── Shared Tooltip ────────────────────────────────────────────

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
            {typeof entry.value === "number" && entry.value > 1000
              ? `$${(entry.value / 1000).toFixed(0)}K`
              : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Status Indicators ─────────────────────────────────────────

function StatusDot({ status }: { status: string }) {
  const color =
    status === "operational" || status === "healthy" || status === "active" || status === "on-track"
      ? "bg-emerald-400"
      : status === "degraded" || status === "warning" || status === "at-risk" || status === "learning"
      ? "bg-amber-400"
      : status === "idle"
      ? "bg-navy-400"
      : "bg-red-400";
  return (
    <span className={`w-2 h-2 rounded-full ${color} inline-block`} />
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    operational: { label: "Operational", className: "bg-emerald-500/20 text-emerald-300" },
    degraded: { label: "Degraded", className: "bg-amber-500/20 text-amber-300" },
    down: { label: "Down", className: "bg-red-500/20 text-red-300" },
    healthy: { label: "Healthy", className: "bg-emerald-500/20 text-emerald-300" },
    warning: { label: "Warning", className: "bg-amber-500/20 text-amber-300" },
    error: { label: "Error", className: "bg-red-500/20 text-red-300" },
    idle: { label: "Idle", className: "bg-navy-400/20 text-navy-300" },
    active: { label: "Active", className: "bg-emerald-500/20 text-emerald-300" },
    learning: { label: "Learning", className: "bg-purple-500/20 text-purple-300" },
  };
  const c = config[status] || { label: status, className: "bg-navy-400/20 text-navy-300" };
  return (
    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${c.className}`}>
      {c.label}
    </span>
  );
}

// ─── Progress Bar ──────────────────────────────────────────────

function ProgressBar({ value, max, color = "bg-ocean-500" }: { value: number; max: number; color?: string }) {
  const pct = Math.min((value / max) * 100, 100);
  const barColor = pct > 90 ? "bg-red-500" : pct > 75 ? "bg-amber-400" : color;
  return (
    <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
      <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

// ─── Tab: Platform Health ──────────────────────────────────────

function PlatformHealthTab() {
  const overallStatus = getOverallPlatformStatus();
  const overallUptime = getOverallUptime();

  return (
    <div className="space-y-6">
      {/* Overall Status Banner */}
      <div className={`rounded-2xl p-5 border ${
        overallStatus === "operational"
          ? "bg-emerald-500/5 border-emerald-500/20"
          : overallStatus === "degraded"
          ? "bg-amber-500/5 border-amber-500/20"
          : "bg-red-500/5 border-red-500/20"
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              overallStatus === "operational" ? "bg-emerald-500/20" : overallStatus === "degraded" ? "bg-amber-500/20" : "bg-red-500/20"
            }`}>
              {overallStatus === "operational" ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : overallStatus === "degraded" ? (
                <AlertTriangle className="w-5 h-5 text-amber-400" />
              ) : (
                <XCircle className="w-5 h-5 text-red-400" />
              )}
            </div>
            <div>
              <div className="text-sm font-semibold text-white">
                {overallStatus === "operational" ? "All Systems Operational" : overallStatus === "degraded" ? "Partial System Degradation" : "System Outage"}
              </div>
              <div className="text-xs text-navy-400 mt-0.5">
                {overallUptime}% uptime over last 30 days &middot; {platformServices.filter(s => s.status === "operational").length}/{platformServices.length} services healthy
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-navy-400">Last checked</div>
            <div className="text-xs text-navy-300 font-medium">Just now</div>
          </div>
        </div>
      </div>

      {/* 30-Day Uptime Bar */}
      <div className="glass rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-white">30-Day Uptime History</h3>
          <span className="text-xs text-navy-400">{overallUptime}% average</span>
        </div>
        <div className="flex items-end gap-0.5 h-8">
          {uptimeHistory.map((day) => (
            <div
              key={day.date}
              className={`flex-1 rounded-sm cursor-pointer transition-colors ${
                day.status === "operational" ? "bg-emerald-500 hover:bg-emerald-400" :
                day.status === "degraded" ? "bg-amber-400 hover:bg-amber-300" :
                "bg-red-500 hover:bg-red-400"
              }`}
              style={{ height: `${Math.max(20, (day.uptimePct - 99) * 100)}%` }}
              title={`${day.date}: ${day.uptimePct.toFixed(2)}%`}
            />
          ))}
        </div>
        <div className="flex items-center justify-between mt-2 text-[10px] text-navy-500">
          <span>30 days ago</span>
          <span>Today</span>
        </div>
      </div>

      {/* Services Grid */}
      <div className="glass rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-white mb-4">Service Status</h3>
        <div className="space-y-2">
          {platformServices.map((service) => (
            <div
              key={service.name}
              className="flex items-center justify-between py-3 px-4 rounded-xl bg-white/5 hover:bg-white/[0.07] transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <StatusDot status={service.status} />
                <div className="min-w-0">
                  <div className="text-sm font-medium text-white truncate">{service.name}</div>
                  <div className="text-[10px] text-navy-500">{service.description}</div>
                </div>
              </div>
              <div className="flex items-center gap-6 flex-shrink-0">
                <div className="text-right hidden sm:block">
                  <div className="text-xs text-navy-400">Response</div>
                  <div className="text-xs text-white font-medium">{service.responseTime}ms</div>
                </div>
                <div className="text-right hidden md:block">
                  <div className="text-xs text-navy-400">Uptime</div>
                  <div className="text-xs text-white font-medium">{service.uptime}%</div>
                </div>
                <div className="text-right hidden lg:block">
                  <div className="text-xs text-navy-400">Error Rate</div>
                  <div className={`text-xs font-medium ${
                    service.errorRate > 0.1 ? "text-amber-400" : "text-emerald-400"
                  }`}>{service.errorRate}%</div>
                </div>
                <StatusBadge status={service.status} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Resource Usage */}
      <div className="glass rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-white mb-4">Infrastructure Resources</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {resourceMetrics.map((metric) => {
            const pct = (metric.current / metric.limit) * 100;
            return (
              <div key={metric.name} className="bg-white/5 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-navy-400">{metric.name}</span>
                  <span className={`text-xs flex items-center gap-0.5 ${
                    metric.trend > 0 ? "text-amber-400" : metric.trend < 0 ? "text-emerald-400" : "text-navy-400"
                  }`}>
                    {metric.trend > 0 ? <TrendingUp className="w-3 h-3" /> : metric.trend < 0 ? <TrendingDown className="w-3 h-3" /> : null}
                    {metric.trend !== 0 && `${Math.abs(metric.trend)}%`}
                  </span>
                </div>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-lg font-bold text-white">{metric.current}</span>
                  <span className="text-xs text-navy-500">/ {metric.limit} {metric.unit}</span>
                </div>
                <ProgressBar value={metric.current} max={metric.limit} />
                <div className="text-[10px] text-navy-500 mt-1 text-right">{pct.toFixed(0)}% utilized</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Data Pipeline Health ─────────────────────────────────

function DataPipelineTab() {
  const qualityScore = getDataQualityScore();
  const healthyPipelines = dataPipelines.filter(p => p.status === "healthy").length;

  return (
    <div className="space-y-6">
      {/* Quality Score Card */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Database className="w-4 h-4 text-ocean-400" />
            <span className="text-xs text-navy-400">Data Quality Score</span>
          </div>
          <div className="text-2xl font-bold text-white">{qualityScore}%</div>
          <span className="text-xs text-emerald-400 flex items-center gap-0.5 mt-1">
            <TrendingUp className="w-3 h-3" />
            +0.3% this week
          </span>
        </div>
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-navy-400">Healthy Pipelines</span>
          </div>
          <div className="text-2xl font-bold text-white">{healthyPipelines}/{dataPipelines.length}</div>
          <span className="text-xs text-navy-400 mt-1">All critical paths healthy</span>
        </div>
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <RefreshCw className="w-4 h-4 text-cargo-400" />
            <span className="text-xs text-navy-400">Records Today</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {dataPipelines.reduce((sum, p) => sum + p.recordsProcessed, 0).toLocaleString()}
          </div>
          <span className="text-xs text-navy-400 mt-1">Across all pipelines</span>
        </div>
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-navy-400">Total Errors</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {dataPipelines.reduce((sum, p) => sum + p.errorCount, 0)}
          </div>
          <span className="text-xs text-amber-400 mt-1">Across all runs today</span>
        </div>
      </div>

      {/* Pipeline Status Table */}
      <div className="glass rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-white mb-4">Pipeline Status</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-xs text-navy-400 font-medium py-3 px-3">Pipeline</th>
                <th className="text-left text-xs text-navy-400 font-medium py-3 px-3">Status</th>
                <th className="text-left text-xs text-navy-400 font-medium py-3 px-3 hidden md:table-cell">Last Run</th>
                <th className="text-left text-xs text-navy-400 font-medium py-3 px-3 hidden lg:table-cell">Duration</th>
                <th className="text-right text-xs text-navy-400 font-medium py-3 px-3">Records</th>
                <th className="text-right text-xs text-navy-400 font-medium py-3 px-3">Success</th>
              </tr>
            </thead>
            <tbody>
              {dataPipelines.map((pipeline) => (
                <tr key={pipeline.name} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-3 px-3">
                    <div className="text-white font-medium text-xs">{pipeline.name}</div>
                    <div className="text-[10px] text-navy-500 mt-0.5">{pipeline.description}</div>
                  </td>
                  <td className="py-3 px-3">
                    <StatusBadge status={pipeline.status} />
                  </td>
                  <td className="py-3 px-3 text-navy-300 text-xs hidden md:table-cell">{pipeline.lastRun}</td>
                  <td className="py-3 px-3 text-navy-300 text-xs hidden lg:table-cell">{pipeline.avgDuration}</td>
                  <td className="py-3 px-3 text-right text-white text-xs font-medium">
                    {pipeline.recordsProcessed.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <span className={`text-xs font-medium ${
                      pipeline.successRate >= 99.9 ? "text-emerald-400" :
                      pipeline.successRate >= 99 ? "text-ocean-300" :
                      pipeline.successRate >= 95 ? "text-amber-400" :
                      "text-red-400"
                    }`}>
                      {pipeline.successRate}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Data Quality Dimensions */}
      <div className="glass rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-white mb-4">Data Quality Dimensions</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {dataQualityMetrics.map((metric) => (
            <div key={metric.dimension} className="bg-white/5 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-white">{metric.dimension}</span>
                <span className={`text-xs flex items-center gap-0.5 ${
                  metric.trend >= 0 ? "text-emerald-400" : "text-red-400"
                }`}>
                  {metric.trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {Math.abs(metric.trend)}%
                </span>
              </div>
              <div className="flex items-baseline gap-1 mb-1">
                <span className={`text-lg font-bold ${
                  metric.score >= 98 ? "text-emerald-400" :
                  metric.score >= 95 ? "text-ocean-300" :
                  metric.score >= 90 ? "text-amber-400" :
                  "text-red-400"
                }`}>{metric.score}%</span>
              </div>
              <div className="text-[10px] text-navy-500 mb-2">{metric.description}</div>
              <ProgressBar value={metric.score} max={100} color={
                metric.score >= 98 ? "bg-emerald-500" :
                metric.score >= 95 ? "bg-ocean-500" :
                "bg-amber-400"
              } />
              {metric.issues > 0 && (
                <div className="text-[10px] text-amber-400 mt-1">{metric.issues} open issues</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Tab: AI Agent Performance ─────────────────────────────────

function AIPerformanceTab() {
  const totalCost = getAITotalCost();
  const activeAgents = aiAgents.filter(a => a.status === "active").length;
  const avgAccuracy = aiAgents.filter(a => a.accuracy > 0).reduce((sum, a) => sum + a.accuracy, 0) /
    aiAgents.filter(a => a.accuracy > 0).length;

  return (
    <div className="space-y-6">
      {/* Top KPIs */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Bot className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-navy-400">Active Agents</span>
          </div>
          <div className="text-2xl font-bold text-white">{activeAgents}/{aiAgents.length}</div>
          <span className="text-xs text-navy-400 mt-1">1 learning, 1 idle</span>
        </div>
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-ocean-400" />
            <span className="text-xs text-navy-400">Avg Accuracy</span>
          </div>
          <div className="text-2xl font-bold text-white">{avgAccuracy.toFixed(1)}%</div>
          <span className="text-xs text-emerald-400 flex items-center gap-0.5 mt-1">
            <TrendingUp className="w-3 h-3" />
            +1.8% this month
          </span>
        </div>
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-cargo-400" />
            <span className="text-xs text-navy-400">Requests Today</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {aiAgents.reduce((sum, a) => sum + a.requestsToday, 0).toLocaleString()}
          </div>
          <span className="text-xs text-navy-400 mt-1">Across all models</span>
        </div>
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-navy-400">AI Cost Today</span>
          </div>
          <div className="text-2xl font-bold text-white">${totalCost.toFixed(2)}</div>
          <span className="text-xs text-navy-400 mt-1">~${(totalCost * 30).toFixed(0)}/month projected</span>
        </div>
      </div>

      {/* Agent Cards */}
      <div className="glass rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-white mb-4">AI Agent Status</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {aiAgents.map((agent) => (
            <div key={agent.name} className="bg-white/5 rounded-xl p-4 hover:bg-white/[0.07] transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <StatusDot status={agent.status} />
                  <div>
                    <span className="text-sm font-medium text-white">{agent.name}</span>
                    <span className="text-[10px] text-navy-500 ml-2">{agent.modelVersion}</span>
                  </div>
                </div>
                <StatusBadge status={agent.status} />
              </div>
              <div className="text-[10px] text-navy-500 mb-3">{agent.description}</div>
              <div className="grid grid-cols-4 gap-2">
                <div>
                  <div className="text-[10px] text-navy-500">Accuracy</div>
                  <div className={`text-xs font-medium ${
                    agent.accuracy >= 95 ? "text-emerald-400" :
                    agent.accuracy >= 90 ? "text-ocean-300" :
                    agent.accuracy >= 85 ? "text-amber-400" :
                    "text-red-400"
                  }`}>{agent.accuracy}%</div>
                </div>
                <div>
                  <div className="text-[10px] text-navy-500">Requests</div>
                  <div className="text-xs font-medium text-white">{agent.requestsToday.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-[10px] text-navy-500">Latency</div>
                  <div className="text-xs font-medium text-white">{agent.avgLatency}ms</div>
                </div>
                <div>
                  <div className="text-[10px] text-navy-500">Cost</div>
                  <div className="text-xs font-medium text-white">${agent.costToday.toFixed(2)}</div>
                </div>
              </div>
              {/* Accuracy bar */}
              <div className="mt-3">
                <ProgressBar value={agent.accuracy} max={100} color={
                  agent.accuracy >= 95 ? "bg-emerald-500" :
                  agent.accuracy >= 90 ? "bg-ocean-500" :
                  "bg-amber-400"
                } />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Trends Chart */}
      <div className="glass rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-white mb-4">Accuracy Trends (5 Weeks)</h3>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={aiPerformanceTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fill: "#4d6a8a", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fill: "#4d6a8a", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                domain={[80, 100]}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: "11px" }}
                formatter={(value) => <span style={{ color: "#94a3b8" }}>{value}</span>}
              />
              <Line type="monotone" dataKey="etaAccuracy" name="ETA Predictor" stroke="#22c55e" strokeWidth={2} dot={{ fill: "#22c55e", r: 3 }} />
              <Line type="monotone" dataKey="dutyAccuracy" name="Duty Classifier" stroke="#3b82f6" strokeWidth={2} dot={{ fill: "#3b82f6", r: 3 }} />
              <Line type="monotone" dataKey="routeAccuracy" name="Route Optimizer" stroke="#f59e0b" strokeWidth={2} dot={{ fill: "#f59e0b", r: 3 }} />
              <Line type="monotone" dataKey="docAccuracy" name="Doc Extractor" stroke="#a855f7" strokeWidth={2} dot={{ fill: "#a855f7", r: 3 }} />
              <Line type="monotone" dataKey="anomalyPrecision" name="Anomaly Detector" stroke="#ef4444" strokeWidth={2} dot={{ fill: "#ef4444", r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Business KPIs ────────────────────────────────────────

function BusinessKPITab() {
  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {businessKPIs.slice(0, 4).map((kpi) => (
          <div key={kpi.name} className="glass rounded-2xl p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-navy-400">{kpi.name}</span>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                kpi.status === "on-track" ? "bg-emerald-500/20 text-emerald-300" :
                kpi.status === "at-risk" ? "bg-amber-500/20 text-amber-300" :
                "bg-red-500/20 text-red-300"
              }`}>
                {kpi.status === "on-track" ? "On Track" : kpi.status === "at-risk" ? "At Risk" : "Behind"}
              </span>
            </div>
            <div className="text-2xl font-bold text-white">{kpi.value}</div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-navy-500">Target: {kpi.target}</span>
              <span className={`text-xs flex items-center gap-0.5 ${
                kpi.trend >= 0 ? "text-emerald-400" : "text-red-400"
              }`}>
                {kpi.trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {Math.abs(kpi.trend)}%
              </span>
            </div>
            {/* Target progress */}
            <div className="mt-2">
              <ProgressBar
                value={kpi.numericValue}
                max={kpi.numericTarget}
                color={kpi.status === "on-track" ? "bg-emerald-500" : kpi.status === "at-risk" ? "bg-amber-400" : "bg-red-500"}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Revenue vs Target Chart */}
      <div className="glass rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-white mb-4">Revenue vs Target</h3>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenueTimeline}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: "#4d6a8a", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fill: "#4d6a8a", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: "11px" }}
                formatter={(value) => <span style={{ color: "#94a3b8" }}>{value}</span>}
              />
              <Bar dataKey="revenue" name="Revenue" fill="#22c55e" radius={[4, 4, 0, 0]} barSize={24} />
              <Bar dataKey="target" name="Target" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={24} opacity={0.3} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Cost Savings Chart */}
      <div className="glass rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-white mb-4">Customer Cost Savings Delivered</h3>
        <div className="h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueTimeline}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: "#4d6a8a", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fill: "#4d6a8a", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="costSavings"
                name="Savings Delivered"
                stroke="#00bcd4"
                fill="#00bcd4"
                fillOpacity={0.2}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* All KPIs Table */}
      <div className="glass rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-white mb-4">All Business KPIs</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-xs text-navy-400 font-medium py-3 px-3">KPI</th>
                <th className="text-left text-xs text-navy-400 font-medium py-3 px-3">Category</th>
                <th className="text-right text-xs text-navy-400 font-medium py-3 px-3">Current</th>
                <th className="text-right text-xs text-navy-400 font-medium py-3 px-3">Target</th>
                <th className="text-right text-xs text-navy-400 font-medium py-3 px-3">Trend</th>
                <th className="text-left text-xs text-navy-400 font-medium py-3 px-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {businessKPIs.map((kpi) => (
                <tr key={kpi.name} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-3 px-3 text-white font-medium text-xs">{kpi.name}</td>
                  <td className="py-3 px-3">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-navy-300 capitalize">
                      {kpi.category}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right text-white font-medium text-xs">{kpi.value}</td>
                  <td className="py-3 px-3 text-right text-navy-400 text-xs">{kpi.target}</td>
                  <td className="py-3 px-3 text-right">
                    <span className={`text-xs flex items-center gap-0.5 justify-end ${
                      kpi.trend >= 0 ? "text-emerald-400" : "text-red-400"
                    }`}>
                      {kpi.trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {Math.abs(kpi.trend)}%
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                      kpi.status === "on-track" ? "bg-emerald-500/20 text-emerald-300" :
                      kpi.status === "at-risk" ? "bg-amber-500/20 text-amber-300" :
                      "bg-red-500/20 text-red-300"
                    }`}>
                      {kpi.status === "on-track" ? "On Track" : kpi.status === "at-risk" ? "At Risk" : "Behind"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Competitor Tracking ──────────────────────────────────

function CompetitorTrackingTab() {
  const ourFeatureCount = featureComparison.filter(f => f.shippingSavior).length;

  return (
    <div className="space-y-6">
      {/* Competitive Summary */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-navy-400">Feature Advantage</span>
          </div>
          <div className="text-2xl font-bold text-white">{ourFeatureCount}/{featureComparison.length}</div>
          <span className="text-xs text-emerald-400 mt-1">Most complete feature set</span>
        </div>
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Eye className="w-4 h-4 text-ocean-400" />
            <span className="text-xs text-navy-400">Competitors Tracked</span>
          </div>
          <div className="text-2xl font-bold text-white">{competitors.length}</div>
          <span className="text-xs text-navy-400 mt-1">
            {competitors.filter(c => c.threatLevel === "high").length} high threat
          </span>
        </div>
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-cargo-400" />
            <span className="text-xs text-navy-400">Price Position</span>
          </div>
          <div className="text-2xl font-bold text-white">Competitive</div>
          <span className="text-xs text-emerald-400 mt-1">10-50% below top competitors</span>
        </div>
      </div>

      {/* Competitor Cards */}
      <div className="glass rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-white mb-4">Competitor Intelligence</h3>
        <div className="space-y-4">
          {competitors.map((comp) => (
            <div key={comp.name} className="bg-white/5 rounded-xl p-4 hover:bg-white/[0.07] transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                    comp.threatLevel === "high" ? "bg-red-500/20 text-red-300" :
                    comp.threatLevel === "medium" ? "bg-amber-500/20 text-amber-300" :
                    "bg-emerald-500/20 text-emerald-300"
                  }`}>
                    {comp.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">{comp.name}</div>
                    <div className="text-[10px] text-navy-500">{comp.category}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-navy-400">Pricing: <span className="text-white font-medium">{comp.pricingVsUs}</span></span>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                    comp.threatLevel === "high" ? "bg-red-500/20 text-red-300" :
                    comp.threatLevel === "medium" ? "bg-amber-500/20 text-amber-300" :
                    "bg-emerald-500/20 text-emerald-300"
                  }`}>
                    {comp.threatLevel.charAt(0).toUpperCase() + comp.threatLevel.slice(1)} Threat
                  </span>
                </div>
              </div>
              <div className="grid sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <div className="text-navy-500 mb-1 font-medium">Strengths</div>
                  <ul className="space-y-0.5">
                    {comp.strengths.map((s, i) => (
                      <li key={i} className="text-navy-300 flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-emerald-400 flex-shrink-0" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="text-navy-500 mb-1 font-medium">Weaknesses</div>
                  <ul className="space-y-0.5">
                    {comp.weaknesses.map((w, i) => (
                      <li key={i} className="text-navy-300 flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-red-400 flex-shrink-0" />
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="text-navy-500 mb-1 font-medium">Recent Move</div>
                  <p className="text-navy-300">{comp.recentMoves}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Feature Comparison Matrix */}
      <div className="glass rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-white mb-4">Feature Comparison Matrix</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-xs text-navy-400 font-medium py-3 px-3">Feature</th>
                <th className="text-center text-xs text-ocean-400 font-medium py-3 px-3">ShippingSavior</th>
                <th className="text-center text-xs text-navy-400 font-medium py-3 px-3">Flexport</th>
                <th className="text-center text-xs text-navy-400 font-medium py-3 px-3">Freightos</th>
                <th className="text-center text-xs text-navy-400 font-medium py-3 px-3">project44</th>
                <th className="text-center text-xs text-navy-400 font-medium py-3 px-3">Descartes</th>
              </tr>
            </thead>
            <tbody>
              {featureComparison.map((row) => (
                <tr key={row.feature} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-3 px-3 text-white text-xs font-medium">{row.feature}</td>
                  <td className="py-3 px-3 text-center">
                    {row.shippingSavior ? (
                      <Check className="w-4 h-4 text-ocean-400 mx-auto" />
                    ) : (
                      <Minus className="w-4 h-4 text-navy-600 mx-auto" />
                    )}
                  </td>
                  <td className="py-3 px-3 text-center">
                    {row.flexport ? (
                      <Check className="w-4 h-4 text-emerald-500 mx-auto" />
                    ) : (
                      <Minus className="w-4 h-4 text-navy-600 mx-auto" />
                    )}
                  </td>
                  <td className="py-3 px-3 text-center">
                    {row.freightos ? (
                      <Check className="w-4 h-4 text-emerald-500 mx-auto" />
                    ) : (
                      <Minus className="w-4 h-4 text-navy-600 mx-auto" />
                    )}
                  </td>
                  <td className="py-3 px-3 text-center">
                    {row.project44 ? (
                      <Check className="w-4 h-4 text-emerald-500 mx-auto" />
                    ) : (
                      <Minus className="w-4 h-4 text-navy-600 mx-auto" />
                    )}
                  </td>
                  <td className="py-3 px-3 text-center">
                    {row.descartes ? (
                      <Check className="w-4 h-4 text-emerald-500 mx-auto" />
                    ) : (
                      <Minus className="w-4 h-4 text-navy-600 mx-auto" />
                    )}
                  </td>
                </tr>
              ))}
              {/* Totals Row */}
              <tr className="border-t border-white/10">
                <td className="py-3 px-3 text-white text-xs font-bold">Total Features</td>
                <td className="py-3 px-3 text-center text-ocean-400 font-bold text-xs">
                  {featureComparison.filter(f => f.shippingSavior).length}
                </td>
                <td className="py-3 px-3 text-center text-navy-300 font-bold text-xs">
                  {featureComparison.filter(f => f.flexport).length}
                </td>
                <td className="py-3 px-3 text-center text-navy-300 font-bold text-xs">
                  {featureComparison.filter(f => f.freightos).length}
                </td>
                <td className="py-3 px-3 text-center text-navy-300 font-bold text-xs">
                  {featureComparison.filter(f => f.project44).length}
                </td>
                <td className="py-3 px-3 text-center text-navy-300 font-bold text-xs">
                  {featureComparison.filter(f => f.descartes).length}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Main Monitoring Dashboard ─────────────────────────────────

const tabs: { key: MonitoringTab; label: string; icon: any; description: string }[] = [
  { key: "platform", label: "Platform Health", icon: Server, description: "Uptime, services, resources" },
  { key: "data", label: "Data Pipeline", icon: Database, description: "Pipelines, quality, freshness" },
  { key: "ai", label: "AI Performance", icon: Brain, description: "Models, accuracy, cost" },
  { key: "business", label: "Business KPIs", icon: BarChart3, description: "Revenue, growth, efficiency" },
  { key: "competitors", label: "Competitors", icon: Eye, description: "Market intel, features" },
];

export default function MonitoringDashboard() {
  const [activeTab, setActiveTab] = useState<MonitoringTab>("platform");

  return (
    <div className="max-w-screen-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Monitoring</h1>
          <p className="text-sm text-navy-400 mt-1">
            Platform health, data quality, AI performance, and business metrics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StatusDot status={getOverallPlatformStatus()} />
          <span className="text-xs text-navy-400">
            {getOverallPlatformStatus() === "operational" ? "All systems operational" : "Degraded performance"}
          </span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap items-center gap-1 glass rounded-xl p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === tab.key
                ? "bg-ocean-500/30 text-ocean-300"
                : "text-navy-400 hover:text-navy-200"
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden">{tab.label.split(" ")[0]}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "platform" && <PlatformHealthTab />}
      {activeTab === "data" && <DataPipelineTab />}
      {activeTab === "ai" && <AIPerformanceTab />}
      {activeTab === "business" && <BusinessKPITab />}
      {activeTab === "competitors" && <CompetitorTrackingTab />}
    </div>
  );
}

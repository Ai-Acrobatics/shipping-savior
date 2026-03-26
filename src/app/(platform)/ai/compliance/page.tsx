"use client";

// ============================================================
// AI Compliance Dashboard Page
// Sprint 4: AI Agent Layer
//
// Features:
// - Alert feed sorted by severity
// - ISF deadline countdown timers
// - Tariff change notifications
// - Resolution workflow (acknowledge -> investigate -> resolve)
// ============================================================

import { useState, useCallback, useEffect } from "react";
import {
  Shield,
  AlertTriangle,
  AlertCircle,
  Info,
  Clock,
  CheckCircle2,
  Search,
  Loader2,
  ChevronDown,
  XCircle,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────

interface ComplianceAlert {
  type: string;
  severity: "critical" | "warning" | "info";
  message: string;
  actionRequired: string;
  deadline?: string;
}

interface ComplianceResult {
  alerts: ComplianceAlert[];
  riskScore: number;
  assessedAt: string;
  processingTimeMs: number;
}

type AlertStatus = "new" | "acknowledged" | "investigating" | "resolved";

interface TrackedAlert extends ComplianceAlert {
  id: string;
  status: AlertStatus;
  checkedAt: string;
}

// ─── Countries ───────────────────────────────────────────────

const COUNTRIES = [
  { code: "CN", name: "China" },
  { code: "VN", name: "Vietnam" },
  { code: "TH", name: "Thailand" },
  { code: "ID", name: "Indonesia" },
  { code: "KH", name: "Cambodia" },
  { code: "MY", name: "Malaysia" },
  { code: "IN", name: "India" },
  { code: "BD", name: "Bangladesh" },
  { code: "MX", name: "Mexico" },
  { code: "KR", name: "South Korea" },
];

// ─── Helpers ─────────────────────────────────────────────────

function getCountdownString(deadline: string): string {
  const diff = new Date(deadline).getTime() - Date.now();
  if (diff <= 0) return "OVERDUE";
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${mins}m remaining`;
}

function getSeverityColor(severity: string) {
  switch (severity) {
    case "critical":
      return {
        bg: "bg-red-900/30",
        border: "border-red-700/50",
        text: "text-red-400",
        badge: "bg-red-600",
      };
    case "warning":
      return {
        bg: "bg-amber-900/30",
        border: "border-amber-700/50",
        text: "text-amber-400",
        badge: "bg-amber-600",
      };
    default:
      return {
        bg: "bg-blue-900/30",
        border: "border-blue-700/50",
        text: "text-blue-400",
        badge: "bg-blue-600",
      };
  }
}

function getSeverityIcon(severity: string) {
  switch (severity) {
    case "critical":
      return <XCircle className="w-5 h-5 text-red-400" />;
    case "warning":
      return <AlertTriangle className="w-5 h-5 text-amber-400" />;
    default:
      return <Info className="w-5 h-5 text-blue-400" />;
  }
}

// ─── Component ───────────────────────────────────────────────

export default function CompliancePage() {
  const [htsCode, setHtsCode] = useState("");
  const [countryOfOrigin, setCountryOfOrigin] = useState("CN");
  const [productDescription, setProductDescription] = useState("");
  const [vesselDepartureDate, setVesselDepartureDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trackedAlerts, setTrackedAlerts] = useState<TrackedAlert[]>([]);
  const [latestRiskScore, setLatestRiskScore] = useState<number | null>(null);
  const [, setTick] = useState(0);

  // Countdown timer refresh
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(interval);
  }, []);

  const handleCheck = useCallback(async () => {
    if (!htsCode.trim() || !productDescription.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/ai/compliance-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          htsCode,
          countryOfOrigin,
          productDescription,
          vesselDepartureDate: vesselDepartureDate || undefined,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error ?? "Compliance check failed");
      }

      const data: ComplianceResult = await res.json();
      setLatestRiskScore(data.riskScore);

      // Add new alerts to tracked list
      const newTracked: TrackedAlert[] = data.alerts.map((alert, idx) => ({
        ...alert,
        id: `${Date.now()}-${idx}`,
        status: "new" as AlertStatus,
        checkedAt: data.assessedAt,
      }));

      setTrackedAlerts((prev) => [...newTracked, ...prev].slice(0, 100));
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [htsCode, countryOfOrigin, productDescription, vesselDepartureDate]);

  const updateAlertStatus = useCallback(
    (id: string, status: AlertStatus) => {
      setTrackedAlerts((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status } : a))
      );
    },
    []
  );

  const criticalCount = trackedAlerts.filter(
    (a) => a.severity === "critical" && a.status !== "resolved"
  ).length;
  const warningCount = trackedAlerts.filter(
    (a) => a.severity === "warning" && a.status !== "resolved"
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-ocean-950 text-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Shield className="w-8 h-8 text-ocean-400" />
              Compliance Monitor
            </h1>
            <p className="text-slate-400 mt-1">
              Real-time compliance alerts for ISF, tariffs, AD/CVD, UFLPA, and
              FDA
            </p>
          </div>

          {/* Risk Score Badge */}
          {latestRiskScore !== null && (
            <div
              className={`flex flex-col items-center px-6 py-3 rounded-xl border ${
                latestRiskScore >= 60
                  ? "bg-red-900/30 border-red-700/50"
                  : latestRiskScore >= 30
                  ? "bg-amber-900/30 border-amber-700/50"
                  : "bg-emerald-900/30 border-emerald-700/50"
              }`}
            >
              <div
                className={`text-3xl font-bold ${
                  latestRiskScore >= 60
                    ? "text-red-400"
                    : latestRiskScore >= 30
                    ? "text-amber-400"
                    : "text-emerald-400"
                }`}
              >
                {latestRiskScore}
              </div>
              <div className="text-xs text-slate-400">Risk Score</div>
            </div>
          )}
        </div>

        {/* Summary Badges */}
        {trackedAlerts.length > 0 && (
          <div className="flex gap-4 mb-6">
            <div className="flex items-center gap-2 px-4 py-2 bg-red-900/20 border border-red-700/30 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span className="text-red-300 font-medium">
                {criticalCount} Critical
              </span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-amber-900/20 border border-amber-700/30 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span className="text-amber-300 font-medium">
                {warningCount} Warnings
              </span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-900/20 border border-emerald-700/30 rounded-lg">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-300 font-medium">
                {trackedAlerts.filter((a) => a.status === "resolved").length}{" "}
                Resolved
              </span>
            </div>
          </div>
        )}

        {/* Input Form */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Run Compliance Check</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm text-slate-300 mb-1">
                HTS Code *
              </label>
              <input
                value={htsCode}
                onChange={(e) => setHtsCode(e.target.value)}
                placeholder="e.g., 6109.10.00"
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-ocean-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1">
                Country of Origin *
              </label>
              <div className="relative">
                <select
                  value={countryOfOrigin}
                  onChange={(e) => setCountryOfOrigin(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2.5 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-ocean-500"
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1">
                Vessel Departure
              </label>
              <input
                type="datetime-local"
                value={vesselDepartureDate}
                onChange={(e) => setVesselDepartureDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-ocean-500"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleCheck}
                disabled={
                  loading || !htsCode.trim() || !productDescription.trim()
                }
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-ocean-600 hover:bg-ocean-500 disabled:bg-slate-700 disabled:text-slate-500 rounded-lg font-semibold transition-colors"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Search className="w-5 h-5" />
                )}
                Check
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">
              Product Description *
            </label>
            <input
              value={productDescription}
              onChange={(e) => setProductDescription(e.target.value)}
              placeholder="e.g., Cotton t-shirts from Guangdong province"
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-ocean-500"
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-900/30 border border-red-700 rounded-xl p-4 mb-6 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {/* Alert Feed */}
        {trackedAlerts.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xl font-semibold">Alert Feed</h2>

            {trackedAlerts.map((alert) => {
              const colors = getSeverityColor(alert.severity);
              return (
                <div
                  key={alert.id}
                  className={`${colors.bg} border ${colors.border} rounded-xl p-5 ${
                    alert.status === "resolved" ? "opacity-50" : ""
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3">
                      {getSeverityIcon(alert.severity)}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`px-2 py-0.5 ${colors.badge} text-white text-xs font-medium rounded-full uppercase`}
                          >
                            {alert.severity}
                          </span>
                          <span className="px-2 py-0.5 bg-slate-700 text-slate-300 text-xs font-medium rounded-full">
                            {alert.type.replace(/_/g, " ")}
                          </span>
                          {alert.status !== "new" && (
                            <span className="px-2 py-0.5 bg-slate-600 text-slate-300 text-xs font-medium rounded-full">
                              {alert.status}
                            </span>
                          )}
                        </div>
                        <p className={`${colors.text} font-medium`}>
                          {alert.message}
                        </p>
                      </div>
                    </div>

                    {/* Countdown for ISF */}
                    {alert.deadline && (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/50 rounded-lg shrink-0">
                        <Clock className="w-4 h-4 text-red-400" />
                        <span className="text-sm font-mono text-red-300">
                          {getCountdownString(alert.deadline)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="bg-slate-900/30 rounded-lg p-3 mb-3">
                    <div className="text-xs text-slate-400 mb-1">
                      Action Required
                    </div>
                    <p className="text-sm text-slate-300">
                      {alert.actionRequired}
                    </p>
                  </div>

                  {/* Resolution Workflow */}
                  {alert.status !== "resolved" && (
                    <div className="flex gap-2">
                      {alert.status === "new" && (
                        <button
                          onClick={() =>
                            updateAlertStatus(alert.id, "acknowledged")
                          }
                          className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm transition-colors"
                        >
                          Acknowledge
                        </button>
                      )}
                      {(alert.status === "new" ||
                        alert.status === "acknowledged") && (
                        <button
                          onClick={() =>
                            updateAlertStatus(alert.id, "investigating")
                          }
                          className="px-3 py-1.5 bg-amber-700/30 hover:bg-amber-700/50 text-amber-300 rounded-lg text-sm transition-colors"
                        >
                          Investigate
                        </button>
                      )}
                      <button
                        onClick={() =>
                          updateAlertStatus(alert.id, "resolved")
                        }
                        className="px-3 py-1.5 bg-emerald-700/30 hover:bg-emerald-700/50 text-emerald-300 rounded-lg text-sm transition-colors"
                      >
                        Resolve
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {trackedAlerts.length === 0 && !loading && (
          <div className="text-center py-16 text-slate-400">
            <Shield className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg">No compliance alerts yet</p>
            <p className="text-sm mt-1">
              Run a compliance check above to scan for regulatory issues
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

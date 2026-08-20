"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AlertTriangle, RefreshCw, TrendingDown, TrendingUp } from "lucide-react";
import { formatMarginPct, type MarginBucket, type RollupDimension } from "@/lib/analytics/margin";

/**
 * /platform/analytics — realized margin over time (AI-8869 sub-feature C).
 *
 * Answers Blake's question directly: "are your Asia → LA bookings still
 * profitable as freight rates drop?" Revenue is attributed to the sale date,
 * so a container that lands in March and sells in May shows up in May — the
 * only attribution that reflects what the business actually experienced.
 */

interface MarginTotals {
  revenueUsd: number;
  cogsUsd: number;
  grossMarginUsd: number;
  marginPct: number | null;
  unitsSold: number;
  inventoryValueUsd: number;
  linesTracked: number;
  linesWithSales: number;
}

interface MarginAlert {
  key: string;
  label: string;
  marginPct: number;
  thresholdPct: number;
  revenueUsd: number;
  grossMarginUsd: number;
}

interface MarginResponse {
  dimension: RollupDimension;
  buckets: MarginBucket[];
  totals: MarginTotals;
  bySku: MarginBucket[];
  byLane: MarginBucket[];
  alerts: MarginAlert[];
}

const currency = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const PERIODS: Array<{ value: RollupDimension; label: string }> = [
  { value: "month", label: "By month" },
  { value: "quarter", label: "By quarter" },
];

const THRESHOLDS = [
  { value: "0.1", label: "10%" },
  { value: "0.2", label: "20%" },
  { value: "0.3", label: "30%" },
];

export default function AnalyticsPage() {
  const [dimension, setDimension] = useState<RollupDimension>("month");
  const [threshold, setThreshold] = useState("0.2");
  const [data, setData] = useState<MarginResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMargin = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/analytics/margin?dimension=${dimension}&alertThreshold=${threshold}`
      );
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed to load analytics");
      setData(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load analytics");
    } finally {
      setIsLoading(false);
    }
  }, [dimension, threshold]);

  useEffect(() => {
    fetchMargin();
  }, [fetchMargin]);

  const chartData = (data?.buckets ?? []).map((b) => ({
    ...b,
    marginPctDisplay: b.marginPct === null ? null : Number((b.marginPct * 100).toFixed(1)),
  }));

  const hasData = (data?.totals.linesWithSales ?? 0) > 0;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-navy-900">Profitability</h1>
          <p className="text-navy-500 mt-1">
            Realized margin on what you have actually sold, at fully-loaded landed cost.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={dimension}
            onChange={(e) => setDimension(e.target.value as RollupDimension)}
            aria-label="Rollup period"
            className="text-sm border border-navy-200 rounded-lg px-3 py-2 bg-white"
          >
            {PERIODS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
          <select
            value={threshold}
            onChange={(e) => setThreshold(e.target.value)}
            aria-label="Margin alert threshold"
            className="text-sm border border-navy-200 rounded-lg px-3 py-2 bg-white"
          >
            {THRESHOLDS.map((t) => (
              <option key={t.value} value={t.value}>
                Alert under {t.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={fetchMargin}
            className="inline-flex items-center gap-2 text-sm border border-navy-200 rounded-lg px-3 py-2 text-navy-700 hover:bg-navy-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 text-sm">
          {error}
        </div>
      )}

      {/* Totals */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Revenue", value: currency(data?.totals.revenueUsd ?? 0), hint: `${(data?.totals.unitsSold ?? 0).toLocaleString()} units sold` },
          { label: "COGS", value: currency(data?.totals.cogsUsd ?? 0), hint: "Goods + freight + duty + fees" },
          { label: "Gross margin", value: currency(data?.totals.grossMarginUsd ?? 0), hint: formatMarginPct(data?.totals.marginPct ?? null) },
          { label: "Unsold inventory", value: currency(data?.totals.inventoryValueUsd ?? 0), hint: `${data?.totals.linesTracked ?? 0} lines tracked` },
        ].map((tile) => (
          <div key={tile.label} className="bg-white border border-navy-200 rounded-xl p-5">
            <p className="text-xs uppercase tracking-wide text-navy-400">{tile.label}</p>
            <p className="text-2xl font-semibold text-navy-900 mt-2">{tile.value}</p>
            <p className="text-xs text-navy-500 mt-1">{tile.hint}</p>
          </div>
        ))}
      </div>

      {/* Alerts */}
      {(data?.alerts.length ?? 0) > 0 && (
        <div className="space-y-2">
          {data!.alerts.map((alert) => (
            <div
              key={alert.key}
              className="flex gap-2 items-start text-sm bg-amber-50 border border-amber-200 text-amber-900 rounded-lg p-3"
            >
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                <strong>{alert.label}</strong> came in at {formatMarginPct(alert.marginPct)} —
                below your {formatMarginPct(alert.thresholdPct)} floor on{" "}
                {currency(alert.revenueUsd)} of revenue.
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Trend */}
      <div className="bg-white border border-navy-200 rounded-xl p-5">
        <h2 className="text-base font-semibold text-navy-900 mb-4">
          Margin trend {dimension === "month" ? "by month" : "by quarter"}
        </h2>
        {isLoading ? (
          <p className="text-sm text-navy-500">Loading…</p>
        ) : !hasData ? (
          <div className="py-10 text-center">
            <p className="text-navy-600 font-medium">No sales recorded yet.</p>
            <p className="text-sm text-navy-500 mt-1 max-w-md mx-auto">
              Add line items to a shipment, then record what you sold them for. Margin appears
              here as soon as there is a sale to measure against a landed cost.
            </p>
          </div>
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis
                  yAxisId="usd"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(v) => `$${Math.round(Number(v) / 1000)}k`}
                />
                <YAxis
                  yAxisId="pct"
                  orientation="right"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip
                  formatter={(value, name) =>
                    name === "Margin %"
                      ? [`${value}%`, name]
                      : [currency(Number(value)), name]
                  }
                />
                <Legend />
                <Bar yAxisId="usd" dataKey="revenueUsd" name="Revenue" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="usd" dataKey="cogsUsd" name="COGS" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                <Line
                  yAxisId="pct"
                  type="monotone"
                  dataKey="marginPctDisplay"
                  name="Margin %"
                  stroke="#16a34a"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  connectNulls
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Categorical rollups */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RollupTable title="By SKU" buckets={data?.bySku ?? []} />
        <RollupTable title="By lane" buckets={data?.byLane ?? []} />
      </div>
    </div>
  );
}

function RollupTable({ title, buckets }: { title: string; buckets: MarginBucket[] }) {
  const withRevenue = buckets.filter((b) => b.revenueUsd > 0);
  return (
    <div className="bg-white border border-navy-200 rounded-xl p-5">
      <h2 className="text-base font-semibold text-navy-900 mb-4">{title}</h2>
      {withRevenue.length === 0 ? (
        <p className="text-sm text-navy-500">Nothing sold yet.</p>
      ) : (
        <>
          <div className="h-56 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={withRevenue.slice(0, 8)} layout="vertical" margin={{ left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) => `$${Math.round(Number(v) / 1000)}k`}
                />
                <YAxis type="category" dataKey="label" tick={{ fontSize: 11 }} width={110} />
                <Tooltip formatter={(value) => currency(Number(value))} />
                <Bar dataKey="grossMarginUsd" name="Gross margin" fill="#0ea5e9" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-navy-400 border-b border-navy-200">
                <th className="pb-2 font-medium">Key</th>
                <th className="pb-2 font-medium text-right">Revenue</th>
                <th className="pb-2 font-medium text-right">Margin</th>
                <th className="pb-2 font-medium text-right">%</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-100">
              {withRevenue.map((bucket) => (
                <tr key={bucket.key}>
                  <td className="py-2 text-navy-700 font-medium truncate max-w-[160px]">
                    {bucket.label}
                  </td>
                  <td className="py-2 text-right tabular-nums text-navy-600">
                    {currency(bucket.revenueUsd)}
                  </td>
                  <td className="py-2 text-right tabular-nums text-navy-900">
                    {currency(bucket.grossMarginUsd)}
                  </td>
                  <td className="py-2 text-right tabular-nums">
                    <span
                      className={`inline-flex items-center gap-1 ${
                        (bucket.marginPct ?? 0) < 0 ? "text-red-600" : "text-emerald-600"
                      }`}
                    >
                      {(bucket.marginPct ?? 0) < 0 ? (
                        <TrendingDown className="w-3.5 h-3.5" />
                      ) : (
                        <TrendingUp className="w-3.5 h-3.5" />
                      )}
                      {formatMarginPct(bucket.marginPct)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

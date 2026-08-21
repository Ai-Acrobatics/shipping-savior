"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import {
  AlertTriangle,
  Loader2,
  Map as MapIcon,
  RefreshCw,
  Radio,
  Ship,
  Clock,
} from "lucide-react";

import type { VesselLane, UnresolvedLane } from "@/lib/vessel-map/lanes";

// MapLibre touches `window` at import time, so it can never be server-rendered.
const VesselMap = dynamic(() => import("@/components/vessel-map/VesselMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center rounded-xl bg-navy-100">
      <Loader2 className="h-5 w-5 animate-spin text-navy-500" />
    </div>
  ),
});

interface PositionsMeta {
  generatedAt: string;
  shipmentsConsidered: number;
  laneCount: number;
  unresolvedCount: number;
  aisProvider: string;
  livePositions: number;
  estimatedPositions: number;
}

interface PositionsResponse {
  lanes: VesselLane[];
  unresolved: UnresolvedLane[];
  meta: PositionsMeta;
}

/** Live AIS moves; re-poll on a cadence that is useful but not abusive. */
const REFRESH_MS = 60_000;

const STATUS_LABELS: Record<string, string> = {
  in_transit: "In transit",
  delayed: "Delayed",
  arrived: "Arrived",
  pending: "Pending",
};

function fmtDate(value: string | null): string {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString();
}

export default function VesselMapClient() {
  const [data, setData] = useState<PositionsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [includeAll, setIncludeAll] = useState(false);
  const [selectedShipmentId, setSelectedShipmentId] = useState<string | null>(null);

  const load = useCallback(
    async (opts: { silent?: boolean } = {}) => {
      if (opts.silent) setRefreshing(true);
      else setLoading(true);
      try {
        const res = await fetch(`/api/vessels/positions${includeAll ? "?all=1" : ""}`, {
          cache: "no-store",
        });
        if (!res.ok) throw new Error(`Request failed (${res.status})`);
        setData((await res.json()) as PositionsResponse);
        setError(null);
      } catch (err) {
        console.error("[vessel-map] load failed:", err);
        setError(err instanceof Error ? err.message : "Failed to load vessel positions");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [includeAll]
  );

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const timer = setInterval(() => load({ silent: true }), REFRESH_MS);
    return () => clearInterval(timer);
  }, [load]);

  const lanes = useMemo(() => data?.lanes ?? [], [data]);
  const meta = data?.meta;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-navy-900">
            <MapIcon className="h-6 w-6 text-ocean-600" />
            Vessel Map
          </h1>
          <p className="mt-1 text-sm text-navy-600">
            Route arcs and vessel positions for your active lanes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 rounded-lg border border-navy-200 bg-white px-3 py-2 text-xs font-medium text-navy-700">
            <input
              type="checkbox"
              checked={includeAll}
              onChange={(e) => setIncludeAll(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-navy-300"
            />
            Include arrived &amp; pending
          </label>
          <button
            type="button"
            onClick={() => load({ silent: true })}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-lg bg-ocean-600 px-3 py-2 text-xs font-semibold text-white hover:bg-ocean-700 disabled:opacity-60"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stat strip */}
      {meta && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard icon={Ship} label="Lanes plotted" value={String(meta.laneCount)} />
          <StatCard
            icon={Radio}
            label="Live AIS fixes"
            value={String(meta.livePositions)}
            tone={meta.livePositions > 0 ? "good" : "muted"}
          />
          <StatCard icon={Clock} label="Schedule estimates" value={String(meta.estimatedPositions)} />
          <StatCard
            icon={AlertTriangle}
            label="Unmapped shipments"
            value={String(meta.unresolvedCount)}
            tone={meta.unresolvedCount > 0 ? "warn" : "muted"}
          />
        </div>
      )}

      {meta?.aisProvider === "none" && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>
            No AIS provider configured — every vessel below is positioned by interpolating its
            ETD/ETA schedule. Set <code className="font-mono">AIS_PROVIDER</code> to stream live
            positions.
          </span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          <AlertTriangle className="h-4 w-4" />
          {error}
        </div>
      )}

      {/* Map */}
      <div className="overflow-hidden rounded-xl border border-navy-200 bg-white">
        {loading ? (
          <div className="flex h-[520px] items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-navy-400" />
          </div>
        ) : lanes.length === 0 ? (
          <div className="flex h-[520px] flex-col items-center justify-center gap-2 text-center">
            <Ship className="h-8 w-8 text-navy-300" />
            <p className="text-sm font-semibold text-navy-800">No lanes to plot yet</p>
            <p className="max-w-sm text-xs text-navy-500">
              Import shipments with a load and discharge port, and their routes will appear here.
            </p>
          </div>
        ) : (
          <VesselMap
            lanes={lanes}
            selectedShipmentId={selectedShipmentId}
            onSelectShipment={setSelectedShipmentId}
            className="h-[520px] w-full"
          />
        )}
      </div>

      {/* Lane table */}
      {lanes.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-navy-200 bg-white">
          <div className="border-b border-navy-200 px-4 py-3 text-sm font-semibold text-navy-900">
            Lanes ({lanes.length})
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-navy-50 text-navy-600">
                <tr>
                  <th className="px-4 py-2 font-semibold">Vessel</th>
                  <th className="px-4 py-2 font-semibold">Lane</th>
                  <th className="px-4 py-2 font-semibold">Distance</th>
                  <th className="px-4 py-2 font-semibold">ETA</th>
                  <th className="px-4 py-2 font-semibold">Progress</th>
                  <th className="px-4 py-2 font-semibold">Position</th>
                </tr>
              </thead>
              <tbody>
                {lanes.map((lane) => (
                  <tr
                    key={lane.shipmentId}
                    onClick={() => setSelectedShipmentId(lane.shipmentId)}
                    className={`cursor-pointer border-t border-navy-100 hover:bg-navy-50 ${
                      selectedShipmentId === lane.shipmentId ? "bg-ocean-50" : ""
                    }`}
                  >
                    <td className="px-4 py-2">
                      <div className="font-semibold text-navy-900">{lane.vesselName ?? "—"}</div>
                      <div className="text-navy-500">
                        {lane.reference ?? lane.containerNumber ?? "—"}
                        {lane.carrier ? ` · ${lane.carrier}` : ""}
                      </div>
                    </td>
                    <td className="px-4 py-2 text-navy-700">
                      {lane.origin.locode} → {lane.destination.locode}
                      <div className="text-navy-500">
                        {STATUS_LABELS[lane.status] ?? lane.status}
                      </div>
                    </td>
                    <td className="px-4 py-2 text-navy-700">
                      {lane.distanceKm.toLocaleString()} km
                    </td>
                    <td className="px-4 py-2 text-navy-700">{fmtDate(lane.eta)}</td>
                    <td className="px-4 py-2">
                      <div className="h-1.5 w-20 rounded-full bg-navy-100">
                        <div
                          className="h-1.5 rounded-full bg-ocean-500"
                          style={{ width: `${Math.round(lane.progress * 100)}%` }}
                        />
                      </div>
                      <span className="text-navy-500">{Math.round(lane.progress * 100)}%</span>
                    </td>
                    <td className="px-4 py-2">
                      {lane.vessel.live ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 font-semibold text-emerald-700">
                          <Radio className="h-3 w-3" /> Live
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full border border-navy-200 bg-navy-50 px-2 py-0.5 font-semibold text-navy-600">
                          <Clock className="h-3 w-3" /> Estimated
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Unresolved */}
      {data && data.unresolved.length > 0 && (
        <details className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900">
          <summary className="cursor-pointer font-semibold">
            {data.unresolved.length} shipment(s) could not be mapped
          </summary>
          <ul className="mt-2 space-y-1">
            {data.unresolved.slice(0, 25).map((row) => (
              <li key={row.shipmentId}>
                <span className="font-semibold">{row.reference ?? row.shipmentId.slice(0, 8)}</span>
                {" — "}
                {row.reason === "missing_ports"
                  ? "no load/discharge port on the shipment"
                  : row.reason === "unknown_origin"
                  ? `origin "${row.origin}" not in the port catalog`
                  : `destination "${row.destination}" not in the port catalog`}
              </li>
            ))}
          </ul>
        </details>
      )}

      {meta && (
        <p className="text-[11px] text-navy-500">
          Updated {new Date(meta.generatedAt).toLocaleTimeString()} · AIS provider:{" "}
          <span className="font-mono">{meta.aisProvider}</span> · auto-refresh every 60s
        </p>
      )}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  tone = "default",
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  tone?: "default" | "good" | "warn" | "muted";
}) {
  const toneClasses =
    tone === "good"
      ? "text-emerald-600"
      : tone === "warn"
      ? "text-amber-600"
      : tone === "muted"
      ? "text-navy-400"
      : "text-ocean-600";
  return (
    <div className="rounded-xl border border-navy-200 bg-white px-4 py-3">
      <div className="flex items-center gap-2 text-[11px] font-medium text-navy-500">
        <Icon className={`h-3.5 w-3.5 ${toneClasses}`} />
        {label}
      </div>
      <div className="mt-1 text-xl font-bold text-navy-900">{value}</div>
    </div>
  );
}

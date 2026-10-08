"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  Warehouse,
  Loader2,
  X,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  AlertTriangle,
  Thermometer,
  Box,
} from "lucide-react";
import {
  buildSlots,
  buildWeekGrid,
  defaultWeekStart,
  addDays,
  dayKey,
  type CrossDockShipment,
  type CrossDockSlot,
  type SlotTimeSource,
} from "@/lib/crossdock/board";
import EmptyState from "@/components/ui/empty-state";

// ── Constants ──────────────────────────────────────────

const PAGE_SIZE = 200; // API max per request
const ROW_CAP = 1000; // same cap as the load board

// A deadline is not an appointment — say which one the card is showing.
const SOURCE_LABEL: Record<SlotTimeSource, string> = {
  appointment: "Appt",
  reefer_cutoff: "Reefer cutoff",
  document_cutoff: "Doc cutoff",
  etd: "ETD",
  none: "No date",
};

const LANE_ACCENT: Record<string, string> = {
  kingsco: "border-l-ocean-500",
  anacapa: "border-l-indigo-500",
  port: "border-l-emerald-500",
  unassigned: "border-l-amber-400",
};

// ── Helpers ────────────────────────────────────────────

function formatTime(d: Date | null): string {
  if (!d) return "";
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function formatDay(d: Date): { weekday: string; date: string } {
  return {
    weekday: d.toLocaleDateString("en-US", { weekday: "short" }),
    date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  };
}

function formatRange(start: Date): string {
  const end = addDays(start, 6);
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  return `${start.toLocaleDateString("en-US", opts)} – ${end.toLocaleDateString("en-US", {
    ...opts,
    year: "numeric",
  })}`;
}

function SlotCard({ slot }: { slot: CrossDockSlot }) {
  const s = slot.shipment;
  const m = s.importMeta;
  const accent = LANE_ACCENT[slot.laneId] ?? "border-l-navy-400";
  const isAppt = slot.timeSource === "appointment";
  return (
    <Link
      href={`/platform/shipments/${s.id}`}
      className={`block rounded-lg border border-navy-100 border-l-4 ${accent} bg-white px-2 py-1.5 text-left shadow-sm transition-colors hover:border-ocean-300 hover:bg-ocean-50/40 ${
        slot.collision ? "ring-1 ring-red-300" : ""
      }`}
      title={[
        s.reference && `Booking ${s.reference}`,
        s.containerNumber && `Container ${s.containerNumber}`,
        s.carrier && `${s.carrier}${s.vesselName ? ` · ${s.vesselName}` : ""}`,
        s.pod && `→ ${s.pod}`,
        slot.rawCrossdock && `Cross-dock cell: ${slot.rawCrossdock}`,
      ]
        .filter(Boolean)
        .join("\n")}
    >
      <div className="flex items-center gap-1">
        {slot.at && (
          <span
            className={`text-[11px] font-bold ${isAppt ? "text-navy-900" : "text-navy-500"}`}
          >
            {formatTime(slot.at)}
          </span>
        )}
        <span
          className={`rounded px-1 text-[9px] font-semibold uppercase tracking-wide ${
            isAppt ? "bg-ocean-100 text-ocean-700" : "bg-navy-100 text-navy-500"
          }`}
        >
          {SOURCE_LABEL[slot.timeSource]}
        </span>
        {slot.collision && (
          <AlertTriangle
            className="ml-auto h-3 w-3 shrink-0 text-red-500"
            aria-label="Another booking has the same dock time"
          />
        )}
      </div>
      <p className="mt-0.5 truncate font-mono text-[11px] font-semibold text-navy-800">
        {s.reference || s.containerNumber || "—"}
      </p>
      <div className="mt-0.5 flex flex-wrap items-center gap-1">
        {m?.customerCode && (
          <span className="rounded-full bg-ocean-50 px-1.5 text-[9px] font-bold uppercase text-ocean-700">
            {m.customerCode}
          </span>
        )}
        {s.cargoType && (
          <span className="truncate text-[10px] text-navy-500">{s.cargoType}</span>
        )}
        {m?.temperature && (
          <span className="inline-flex items-center gap-0.5 text-[10px] text-sky-700">
            <Thermometer className="h-2.5 w-2.5" />
            {m.temperature.split(" ")[0]}
          </span>
        )}
      </div>
      {s.containerNumber && s.reference && (
        <p className="mt-0.5 flex items-center gap-0.5 truncate text-[10px] text-navy-400">
          <Box className="h-2.5 w-2.5 shrink-0" />
          {s.containerNumber}
        </p>
      )}
    </Link>
  );
}

// ── Main Component ─────────────────────────────────────

export default function CrossDockBoardPage() {
  const [rows, setRows] = useState<CrossDockShipment[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [weekStart, setWeekStart] = useState<Date | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const all: CrossDockShipment[] = [];
      let offset = 0;
      let totalRows = Infinity;
      while (offset < totalRows && all.length < ROW_CAP) {
        const res = await fetch(`/api/shipments?limit=${PAGE_SIZE}&offset=${offset}`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        const page: CrossDockShipment[] = data.shipments || [];
        all.push(...page);
        totalRows = data.pagination?.total ?? all.length;
        offset += PAGE_SIZE;
        if (page.length === 0) break; // never loop on an empty page
      }
      setRows(all.slice(0, ROW_CAP));
      setTotal(totalRows === Infinity ? all.length : totalRows);
    } catch {
      setError("Failed to load cross-dock appointments. Refresh to try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const slots = useMemo(() => buildSlots(rows), [rows]);

  // Pick the opening week once data is in; after that the user drives it.
  useEffect(() => {
    if (!loading && weekStart === null) setWeekStart(defaultWeekStart(slots));
  }, [loading, slots, weekStart]);

  const grid = useMemo(
    () => (weekStart ? buildWeekGrid(slots, weekStart) : null),
    [slots, weekStart]
  );

  const undatedCount = useMemo(() => slots.filter((s) => !s.at).length, [slots]);
  const collisionCount = useMemo(
    () => (grid ? Object.values(grid.cells).flatMap((d) => Object.values(d).flat()).filter((s) => s.collision).length : 0),
    [grid]
  );
  const todayKey = dayKey(new Date());

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-navy-900">
            <Warehouse className="h-6 w-6 text-ocean-500" />
            Cross-Dock Board
          </h1>
          <p className="mt-1 text-sm text-navy-500">
            Appointments by dock — KINGSCO, ANACAPA and direct to Port Hueneme
            {total > ROW_CAP && (
              <span className="ml-1 text-amber-600">(showing first {ROW_CAP} of {total})</span>
            )}
          </p>
        </div>

        {grid && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setWeekStart(addDays(grid.weekStart, -7))}
              className="rounded-xl border border-navy-200 p-2 text-navy-600 hover:border-ocean-400 hover:bg-ocean-50"
              aria-label="Previous week"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="min-w-[190px] text-center text-sm font-semibold text-navy-800">
              {formatRange(grid.weekStart)}
            </span>
            <button
              onClick={() => setWeekStart(addDays(grid.weekStart, 7))}
              className="rounded-xl border border-navy-200 p-2 text-navy-600 hover:border-ocean-400 hover:bg-ocean-50"
              aria-label="Next week"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => setWeekStart(defaultWeekStart(slots))}
              className="inline-flex items-center gap-1.5 rounded-xl border border-navy-200 px-3 py-2 text-sm font-medium text-navy-600 hover:border-ocean-400 hover:bg-ocean-50 hover:text-ocean-700"
            >
              <CalendarDays className="h-3.5 w-3.5" />
              Today
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{error}</span>
          <button onClick={() => setError(null)} aria-label="Dismiss error">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {loading || !grid ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-ocean-500" />
        </div>
      ) : slots.length === 0 ? (
        <div className="card rounded-2xl">
          <EmptyState
            title="No cross-dock loads yet"
            description="The board fills from the weekly workbook's cross-dock column (KINGSCO DRAY, ANACAPA, Delivery @ Port). Import a workbook to see appointments here."
            action={{ label: "Import workbook", href: "/platform/shipments/import" }}
            secondary={{ label: "Open the load board", href: "/platform/load-board" }}
          />
        </div>
      ) : (
        <>
          {/* Summary chips */}
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-navy-100 px-3 py-1 font-semibold text-navy-700">
              {grid.total} this week
            </span>
            {collisionCount > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 font-semibold text-red-700">
                <AlertTriangle className="h-3 w-3" />
                {collisionCount} sharing a dock time
              </span>
            )}
            {undatedCount > 0 && (
              <span className="rounded-full bg-amber-100 px-3 py-1 font-semibold text-amber-700">
                {undatedCount} with no date yet
              </span>
            )}
            <span className="text-navy-400 self-center">
              Times marked “Reefer cutoff” / “Doc cutoff” / “ETD” are deadlines from the workbook, not booked appointments.
            </span>
          </div>

          {/* Lane × day grid */}
          <div className="card overflow-x-auto rounded-2xl">
            <table className="w-full min-w-[1000px] table-fixed border-collapse">
              <thead>
                <tr className="border-b border-navy-100 bg-navy-50/60">
                  <th className="w-32 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-navy-500">
                    Dock
                  </th>
                  {grid.days.map((d) => {
                    const { weekday, date } = formatDay(d);
                    const isToday = dayKey(d) === todayKey;
                    return (
                      <th
                        key={dayKey(d)}
                        className={`px-2 py-2 text-left text-xs font-semibold ${
                          isToday ? "bg-ocean-50 text-ocean-700" : "text-navy-600"
                        }`}
                      >
                        <span className="block uppercase tracking-wider">{weekday}</span>
                        <span className="font-normal text-navy-400">{date}</span>
                      </th>
                    );
                  })}
                  {undatedCount > 0 && (
                    <th className="w-36 px-2 py-2 text-left text-xs font-semibold uppercase tracking-wider text-amber-700">
                      No date
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {grid.lanes.map((lane) => (
                  <tr key={lane.id} className="border-b border-navy-100 align-top last:border-b-0">
                    <th scope="row" className="px-3 py-3 text-left">
                      <span className="block text-sm font-bold text-navy-900">{lane.label}</span>
                      <span className="block text-[11px] font-normal text-navy-400">{lane.description}</span>
                    </th>
                    {grid.days.map((d) => {
                      const cell = grid.cells[lane.id]?.[dayKey(d)] ?? [];
                      const isToday = dayKey(d) === todayKey;
                      return (
                        <td
                          key={dayKey(d)}
                          className={`px-1.5 py-2 ${isToday ? "bg-ocean-50/40" : ""}`}
                        >
                          <div className="space-y-1.5">
                            {cell.map((slot) => (
                              <SlotCard key={slot.shipment.id} slot={slot} />
                            ))}
                          </div>
                        </td>
                      );
                    })}
                    {undatedCount > 0 && (
                      <td className="bg-amber-50/30 px-1.5 py-2">
                        <div className="space-y-1.5">
                          {(grid.undated[lane.id] ?? []).map((slot) => (
                            <SlotCard key={slot.shipment.id} slot={slot} />
                          ))}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

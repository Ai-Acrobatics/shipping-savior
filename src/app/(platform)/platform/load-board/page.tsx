"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  LayoutGrid,
  Loader2,
  X,
  Ship,
  Box,
  CalendarRange,
  Thermometer,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Anchor,
  ShieldCheck,
  PackageCheck,
  ChevronDown,
  Warehouse,
  Snowflake,
} from "lucide-react";
import {
  groupShipments,
  extractFilterOptions,
  hasReviewIssues,
  type LoadBoardShipment,
  type LoadBoardFilters,
} from "@/lib/loadboard/group";

// ── Constants ──────────────────────────────────────────

const PAGE_SIZE = 200; // API max per request
const ROW_CAP = 1000; // hard cap on rows pulled into the board

// ── Helpers ────────────────────────────────────────────

const STATUS_CFG: Record<
  string,
  { label: string; classes: string; icon: React.ComponentType<{ className?: string }> }
> = {
  booked: { label: "Booked", classes: "bg-navy-100 text-navy-700 border-navy-200", icon: Clock },
  in_transit: { label: "In Transit", classes: "bg-sky-100 text-sky-700 border-sky-200", icon: Ship },
  at_port: { label: "At Port", classes: "bg-indigo-100 text-indigo-700 border-indigo-200", icon: Anchor },
  customs: { label: "Customs", classes: "bg-violet-100 text-violet-700 border-violet-200", icon: ShieldCheck },
  delivered: { label: "Delivered", classes: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: PackageCheck },
  arrived: { label: "Arrived", classes: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
  delayed: { label: "Delayed", classes: "bg-red-100 text-red-700 border-red-200", icon: AlertTriangle },
  pending: { label: "Pending", classes: "bg-amber-100 text-amber-700 border-amber-200", icon: Clock },
};

function StatusBadge({ status }: { status: string | null | undefined }) {
  const cfg = STATUS_CFG[status ?? "pending"] ?? STATUS_CFG.pending;
  const Icon = cfg.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${cfg.classes}`}
    >
      <Icon className="h-3 w-3" />
      {cfg.label}
    </span>
  );
}

function formatDate(d: string | Date | null | undefined): string {
  if (!d) return "--";
  try {
    const date = d instanceof Date ? d : new Date(d);
    if (Number.isNaN(date.getTime())) return String(d);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return String(d);
  }
}

function Field({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="min-w-0">
      <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-navy-400">
        <Icon className="h-3 w-3 shrink-0" />
        {label}
      </p>
      <p className="mt-0.5 truncate text-xs font-medium text-navy-700" title={value || undefined}>
        {value || "--"}
      </p>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative min-w-0 flex-1 sm:min-w-[150px] sm:flex-none">
      <select
        aria-label={label}
        className="input-light w-full appearance-none pr-8 text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">{label}: All</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" />
    </div>
  );
}

// ── Main Component ─────────────────────────────────────

export default function LoadBoardPage() {
  const [rows, setRows] = useState<LoadBoardShipment[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [week, setWeek] = useState("");
  const [carrier, setCarrier] = useState("");
  const [destination, setDestination] = useState("");
  const [customer, setCustomer] = useState("");

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const all: LoadBoardShipment[] = [];
      let offset = 0;
      let totalRows = Infinity;
      while (offset < totalRows && all.length < ROW_CAP) {
        const res = await fetch(`/api/shipments?limit=${PAGE_SIZE}&offset=${offset}`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        const page: LoadBoardShipment[] = data.shipments || [];
        all.push(...page);
        totalRows = data.pagination?.total ?? all.length;
        offset += PAGE_SIZE;
        if (page.length === 0) break; // defensive: never loop on an empty page
      }
      setRows(all.slice(0, ROW_CAP));
      setTotal(totalRows === Infinity ? all.length : totalRows);
    } catch {
      setError("Failed to load the board. Refresh to try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const options = useMemo(() => extractFilterOptions(rows), [rows]);

  const filters: LoadBoardFilters = useMemo(
    () => ({
      week: week || undefined,
      carrier: carrier || undefined,
      destination: destination || undefined,
      customer: customer || undefined,
    }),
    [week, carrier, destination, customer]
  );

  const weeks = useMemo(() => groupShipments(rows, filters), [rows, filters]);

  const hasFilters = !!(week || carrier || destination || customer);
  const clearFilters = () => {
    setWeek("");
    setCarrier("");
    setDestination("");
    setCustomer("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-navy-900">
          <LayoutGrid className="h-6 w-6 text-ocean-500" />
          Load Board
        </h1>
        <p className="mt-1 text-sm text-navy-500">
          Weekly operating board — shipments by week, carrier, destination and cross-dock
          {total > ROW_CAP && (
            <span className="ml-1 text-amber-600">(showing first {ROW_CAP} of {total})</span>
          )}
        </p>
      </div>

      {/* Notifications */}
      {error && (
        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{error}</span>
          <button onClick={() => setError(null)} aria-label="Dismiss error">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Filter bar */}
      <div className="card rounded-2xl p-4">
        <div className="flex flex-wrap items-center gap-3">
          <FilterSelect label="Week" value={week} options={options.weeks} onChange={setWeek} />
          <FilterSelect label="Carrier" value={carrier} options={options.carriers} onChange={setCarrier} />
          <FilterSelect label="Destination" value={destination} options={options.destinations} onChange={setDestination} />
          <FilterSelect label="Customer" value={customer} options={options.customers} onChange={setCustomer} />
          <button
            onClick={clearFilters}
            disabled={!hasFilters}
            className="inline-flex items-center gap-1.5 rounded-xl border border-navy-200 px-3 py-2 text-sm font-medium text-navy-600 transition-colors hover:border-ocean-400 hover:bg-ocean-50 hover:text-ocean-700 disabled:opacity-40"
          >
            <X className="h-3.5 w-3.5" />
            Clear
          </button>
        </div>
      </div>

      {/* Board */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-ocean-500" />
        </div>
      ) : weeks.length === 0 ? (
        <div className="card rounded-2xl p-12 text-center">
          <LayoutGrid className="mx-auto h-12 w-12 text-navy-300" />
          <h3 className="mt-4 text-lg font-semibold text-navy-900">
            {hasFilters ? "No shipments match these filters" : "No shipments on the board"}
          </h3>
          <p className="mt-1 text-sm text-navy-500">
            {hasFilters
              ? "Try clearing one or more filters."
              : "Import a weekly workbook to populate the load board."}
          </p>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-ocean-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-ocean-600"
            >
              <X className="h-4 w-4" />
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {weeks.map((w) => (
            <section key={w.week}>
              {/* Week header */}
              <div className="mb-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h2 className="text-lg font-bold text-navy-900">{w.week}</h2>
                <span className="text-xs font-medium text-navy-500">
                  {w.shipmentCount} shipment{w.shipmentCount === 1 ? "" : "s"}
                  {" · "}
                  {w.containerCount} container{w.containerCount === 1 ? "" : "s"}
                </span>
              </div>

              {/* Carrier → destination group cards */}
              <div className="space-y-4">
                {w.groups.map((g) => (
                  <div key={g.key} className="card overflow-hidden rounded-2xl">
                    <div className="flex flex-wrap items-center gap-2 border-b border-navy-100 bg-navy-50/50 px-4 py-3">
                      <Ship className="h-4 w-4 shrink-0 text-ocean-500" />
                      <span className="text-sm font-bold text-navy-900">{g.carrier}</span>
                      <span className="text-navy-400">→</span>
                      <span className="text-sm font-semibold text-navy-700">{g.destination}</span>
                      <span className="ml-auto rounded-full bg-navy-100 px-2 py-0.5 text-xs font-semibold text-navy-600">
                        {g.shipments.length}
                      </span>
                    </div>

                    <div className="divide-y divide-navy-100">
                      {g.shipments.map((s) => {
                        const m = s.importMeta;
                        return (
                          <div key={s.id} className="px-4 py-3">
                            {/* Top line: ref, chips, status */}
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-mono text-xs font-semibold text-navy-800">
                                {s.reference || s.containerNumber || "--"}
                              </span>
                              {hasReviewIssues(s) && (
                                <span
                                  className="inline-block h-2 w-2 shrink-0 rounded-full bg-amber-400"
                                  title={`Review: ${(m?.reviewIssues ?? []).join("; ")}`}
                                  aria-label="Has review issues"
                                />
                              )}
                              {m?.customerCode && (
                                <span className="inline-flex items-center rounded-full bg-ocean-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ocean-700">
                                  {m.customerCode}
                                </span>
                              )}
                              {m?.temperature && (
                                <span className="inline-flex items-center gap-1 rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-[10px] font-semibold text-sky-700">
                                  <Thermometer className="h-3 w-3" />
                                  {m.temperature}
                                </span>
                              )}
                              <span className="ml-auto">
                                <StatusBadge status={s.status} />
                              </span>
                            </div>

                            {/* Detail grid */}
                            <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3 lg:grid-cols-5">
                              <Field icon={Box} label="Container" value={s.containerNumber} />
                              <Field icon={Ship} label="Vessel" value={s.vesselName} />
                              <Field
                                icon={Warehouse}
                                label="Cross-dock"
                                value={m?.crossdockAppointment ?? null}
                              />
                              <Field
                                icon={Snowflake}
                                label="Reefer cutoff"
                                value={m?.reeferCutoff ?? null}
                              />
                              <Field
                                icon={CalendarRange}
                                label="ETD → ETA"
                                value={`${formatDate(s.etd)} → ${formatDate(s.eta)}`}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

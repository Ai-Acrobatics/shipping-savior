"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Boxes, Filter, Layers, PackageSearch, RefreshCw, Warehouse } from "lucide-react";
import { DUTY_STATUS_LABELS, DUTY_STATUSES } from "@/lib/inventory/line-items";
import type { DutyStatus } from "@/lib/db/schema";

/**
 * /platform/inventory — container-level inventory (AI-8869 sub-feature A).
 *
 * "What do we have on hand, where, and with what duty status." On-hand is
 * imported quantity minus units already sold off the line, so a half-sold
 * container reports the half that's actually still sitting in the DC.
 *
 * The FTZ tile is the one Blake's pitch turns on: capital sitting in a zone
 * with duty deferred is cash the customer still has.
 */

interface InventoryLine {
  id: string;
  shipmentId: string | null;
  containerNumber: string | null;
  sku: string | null;
  description: string | null;
  htsCode: string | null;
  countryOfOrigin: string | null;
  quantity: number;
  quantitySold: number;
  quantityOnHand: number;
  unitOfMeasure: string | null;
  unitCostUsd: number;
  unitLandedCostUsd: number;
  onHandValueUsd: number;
  supplier: string | null;
  poRef: string | null;
  dutyStatus: DutyStatus;
  locationCode: string | null;
  locationName: string | null;
  shipmentReference: string | null;
  incoterm: string | null;
}

interface LocationBucket {
  locationCode: string;
  locationName: string | null;
  unitsOnHand: number;
  valueUsd: number;
  lineCount: number;
}

interface DutyBucket {
  dutyStatus: DutyStatus;
  label: string;
  unitsOnHand: number;
  valueUsd: number;
  lineCount: number;
}

interface InventoryResponse {
  lineItems: InventoryLine[];
  byLocation: LocationBucket[];
  byDutyStatus: DutyBucket[];
  totals: {
    lineCount: number;
    unitsOnHand: number;
    onHandValueUsd: number;
    ftzValueUsd: number;
  };
}

const currency = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const units = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 2 });

const DUTY_BADGE: Record<DutyStatus, string> = {
  in_transit: "bg-sky-50 text-sky-700 border-sky-200",
  ftz_pf: "bg-emerald-50 text-emerald-700 border-emerald-200",
  ftz_npf: "bg-emerald-50 text-emerald-700 border-emerald-200",
  bonded: "bg-violet-50 text-violet-700 border-violet-200",
  customs_cleared: "bg-navy-50 text-navy-700 border-navy-200",
  delivered: "bg-navy-50 text-navy-700 border-navy-200",
  consumed: "bg-navy-50 text-navy-400 border-navy-200",
};

export default function InventoryPage() {
  const [data, setData] = useState<InventoryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locationFilter, setLocationFilter] = useState("all");
  const [dutyFilter, setDutyFilter] = useState("all");
  const [search, setSearch] = useState("");

  const fetchInventory = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (locationFilter !== "all") params.set("location", locationFilter);
      if (dutyFilter !== "all") params.set("dutyStatus", dutyFilter);
      const qs = params.toString();
      const res = await fetch(`/api/inventory${qs ? `?${qs}` : ""}`);
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed to load inventory");
      setData(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load inventory");
    } finally {
      setIsLoading(false);
    }
  }, [locationFilter, dutyFilter]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const visibleLines = useMemo(() => {
    if (!data) return [];
    const q = search.trim().toLowerCase();
    if (!q) return data.lineItems;
    return data.lineItems.filter((line) =>
      [line.sku, line.description, line.htsCode, line.containerNumber, line.supplier, line.poRef]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(q))
    );
  }, [data, search]);

  // The location filter needs every location, not just the ones surviving the
  // current filter — otherwise picking one location strands you there.
  const [allLocations, setAllLocations] = useState<LocationBucket[]>([]);
  useEffect(() => {
    if (data && locationFilter === "all" && dutyFilter === "all") {
      setAllLocations(data.byLocation);
    }
  }, [data, locationFilter, dutyFilter]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-navy-900">Inventory</h1>
          <p className="text-navy-500 mt-1">
            Container contents by location and customs status. On-hand is what has landed and
            not yet sold.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchInventory}
          className="inline-flex items-center gap-2 text-sm border border-navy-200 rounded-lg px-3 py-2 text-navy-700 hover:bg-navy-50 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 text-sm">
          {error}
        </div>
      )}

      {/* KPI tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "On-hand value",
            value: currency(data?.totals.onHandValueUsd ?? 0),
            hint: "At fully-loaded landed cost",
            icon: Warehouse,
          },
          {
            label: "Units on hand",
            value: units(data?.totals.unitsOnHand ?? 0),
            hint: `${data?.totals.lineCount ?? 0} line items`,
            icon: Boxes,
          },
          {
            label: "Duty-deferred in FTZ",
            value: currency(data?.totals.ftzValueUsd ?? 0),
            hint: "Cash you still have",
            icon: Layers,
          },
          {
            label: "Locations",
            value: String(data?.byLocation.length ?? 0),
            hint: "FTZs, DCs and warehouses",
            icon: PackageSearch,
          },
        ].map((tile) => (
          <div key={tile.label} className="bg-white border border-navy-200 rounded-xl p-5">
            <div className="flex items-start justify-between">
              <p className="text-xs uppercase tracking-wide text-navy-400">{tile.label}</p>
              <tile.icon className="w-4 h-4 text-navy-300" />
            </div>
            <p className="text-2xl font-semibold text-navy-900 mt-2">{tile.value}</p>
            <p className="text-xs text-navy-500 mt-1">{tile.hint}</p>
          </div>
        ))}
      </div>

      {/* Rollups */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white border border-navy-200 rounded-xl p-5">
          <h2 className="text-base font-semibold text-navy-900 mb-4">By location</h2>
          {(data?.byLocation.length ?? 0) === 0 ? (
            <p className="text-sm text-navy-500">Nothing on hand.</p>
          ) : (
            <div className="space-y-3">
              {data!.byLocation.map((bucket) => {
                const pct =
                  data!.totals.onHandValueUsd > 0
                    ? (bucket.valueUsd / data!.totals.onHandValueUsd) * 100
                    : 0;
                return (
                  <div key={bucket.locationCode}>
                    <div className="flex justify-between text-sm">
                      <span className="text-navy-700 font-medium">
                        {bucket.locationName ?? bucket.locationCode}
                      </span>
                      <span className="text-navy-600 tabular-nums">
                        {currency(bucket.valueUsd)}
                      </span>
                    </div>
                    <div className="h-2 bg-navy-100 rounded-full mt-1.5 overflow-hidden">
                      <div className="h-full bg-ocean-500" style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-xs text-navy-400 mt-1">
                      {units(bucket.unitsOnHand)} units across {bucket.lineCount} line
                      {bucket.lineCount === 1 ? "" : "s"}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white border border-navy-200 rounded-xl p-5">
          <h2 className="text-base font-semibold text-navy-900 mb-4">By customs status</h2>
          {(data?.byDutyStatus.length ?? 0) === 0 ? (
            <p className="text-sm text-navy-500">Nothing on hand.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-navy-400 border-b border-navy-200">
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium text-right">Units</th>
                  <th className="pb-2 font-medium text-right">Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-100">
                {data!.byDutyStatus.map((bucket) => (
                  <tr key={bucket.dutyStatus}>
                    <td className="py-2">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs border ${
                          DUTY_BADGE[bucket.dutyStatus]
                        }`}
                      >
                        {bucket.label}
                      </span>
                    </td>
                    <td className="py-2 text-right tabular-nums text-navy-700">
                      {units(bucket.unitsOnHand)}
                    </td>
                    <td className="py-2 text-right tabular-nums text-navy-900 font-medium">
                      {currency(bucket.valueUsd)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Filters + line table */}
      <div className="bg-white border border-navy-200 rounded-xl">
        <div className="p-5 border-b border-navy-200 flex flex-wrap items-center gap-3">
          <Filter className="w-4 h-4 text-navy-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search SKU, HTS, container, supplier, PO"
            className="flex-1 min-w-[220px] text-sm border border-navy-200 rounded-lg px-3 py-2"
          />
          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            aria-label="Filter by location"
            className="text-sm border border-navy-200 rounded-lg px-3 py-2 bg-white"
          >
            <option value="all">All locations</option>
            {allLocations.map((b) => (
              <option key={b.locationCode} value={b.locationCode}>
                {b.locationName ?? b.locationCode}
              </option>
            ))}
          </select>
          <select
            value={dutyFilter}
            onChange={(e) => setDutyFilter(e.target.value)}
            aria-label="Filter by customs status"
            className="text-sm border border-navy-200 rounded-lg px-3 py-2 bg-white"
          >
            <option value="all">All statuses</option>
            {DUTY_STATUSES.map((s) => (
              <option key={s} value={s}>
                {DUTY_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <p className="p-6 text-sm text-navy-500">Loading inventory…</p>
          ) : visibleLines.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-navy-600 font-medium">No line items yet.</p>
              <p className="text-sm text-navy-500 mt-1">
                Add container contents from a shipment, or import them with your shipment CSV.
              </p>
              <Link
                href="/platform/shipments"
                className="inline-block mt-4 text-sm text-ocean-600 hover:text-ocean-700 font-medium"
              >
                Go to shipments →
              </Link>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-navy-400 border-b border-navy-200">
                  <th className="px-5 py-3 font-medium">SKU / description</th>
                  <th className="px-5 py-3 font-medium">HTS</th>
                  <th className="px-5 py-3 font-medium">Container</th>
                  <th className="px-5 py-3 font-medium">Location</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium text-right">On hand</th>
                  <th className="px-5 py-3 font-medium text-right">Unit landed</th>
                  <th className="px-5 py-3 font-medium text-right">Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-100">
                {visibleLines.map((line) => (
                  <tr key={line.id} className="hover:bg-navy-50/50">
                    <td className="px-5 py-3">
                      <p className="font-medium text-navy-900">{line.sku ?? "—"}</p>
                      <p className="text-xs text-navy-500 truncate max-w-[240px]">
                        {line.description ?? ""}
                      </p>
                    </td>
                    <td className="px-5 py-3 text-navy-600 tabular-nums">{line.htsCode ?? "—"}</td>
                    <td className="px-5 py-3 text-navy-600">
                      {line.shipmentId ? (
                        <Link
                          href={`/platform/shipments/${line.shipmentId}`}
                          className="text-ocean-600 hover:text-ocean-700"
                        >
                          {line.containerNumber ?? line.shipmentReference ?? "shipment"}
                        </Link>
                      ) : (
                        (line.containerNumber ?? "—")
                      )}
                    </td>
                    <td className="px-5 py-3 text-navy-600">
                      {line.locationName ?? line.locationCode ?? "—"}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs border ${
                          DUTY_BADGE[line.dutyStatus]
                        }`}
                      >
                        {DUTY_STATUS_LABELS[line.dutyStatus]}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums text-navy-900">
                      {units(line.quantityOnHand)}
                      {line.quantitySold > 0 && (
                        <span className="text-xs text-navy-400 block">
                          {units(line.quantitySold)} sold
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums text-navy-600">
                      ${line.unitLandedCostUsd.toFixed(2)}
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums font-medium text-navy-900">
                      {currency(line.onHandValueUsd)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

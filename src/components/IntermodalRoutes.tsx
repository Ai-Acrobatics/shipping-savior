"use client";

/**
 * Multi-modal route markers — AI-12015
 *
 * The route map and the comparison chart both treat a routing as one line
 * between two ports. That is fine for a transpacific vessel service and wrong
 * for everything that keeps going inland.
 *
 * This view renders the routing the way it actually moves: a marker for every
 * place the box touches, a coloured segment per mode between them, and the
 * interchange dwell drawn as its own beat rather than hidden inside the
 * transit number. The gap between "19 days transit" and "23 days door to door"
 * is the whole point of the feature, so it is the thing the eye lands on.
 *
 * All numbers come from lib/intermodal, so what is drawn here matches what the
 * API returns byte for byte.
 */

import { useMemo, useState } from "react";
import {
  Anchor,
  Clock,
  DollarSign,
  Leaf,
  Plane,
  ShieldCheck,
  Ship,
  Train,
  Truck,
  Warehouse,
} from "lucide-react";
import {
  MODE_LABELS,
  getNode,
  intermodalDestinations,
  rankIntermodalRoutes,
  routeNodeCodes,
  type NodeKind,
  type RankedRoute,
  type SortKey,
  type TransportMode,
} from "@/lib/intermodal";

// ─── Mode presentation ────────────────────────────────────
//
// One colour per mode, reused by the segment bar, the leg rows and the chips,
// so "the blue part of the bar" and "the ocean leg" are the same thing
// everywhere on the page.

const MODE_STYLE: Record<TransportMode, { bar: string; chip: string; icon: typeof Ship }> = {
  "ocean-fcl": { bar: "bg-ocean-500", chip: "bg-ocean-500/20 text-ocean-300", icon: Ship },
  "ocean-lcl": { bar: "bg-ocean-400", chip: "bg-ocean-400/20 text-ocean-200", icon: Ship },
  air: { bar: "bg-purple-500", chip: "bg-purple-500/20 text-purple-300", icon: Plane },
  rail: { bar: "bg-cargo-500", chip: "bg-cargo-500/20 text-cargo-300", icon: Train },
  drayage: { bar: "bg-green-500", chip: "bg-green-500/20 text-green-300", icon: Truck },
  barge: { bar: "bg-teal-500", chip: "bg-teal-500/20 text-teal-300", icon: Ship },
};

const NODE_ICON: Record<NodeKind, typeof Anchor> = {
  seaport: Anchor,
  rail_ramp: Warehouse,
  airport: Plane,
  inland_point: Truck,
};

const NODE_LABEL: Record<NodeKind, string> = {
  seaport: "Seaport",
  rail_ramp: "Rail ramp",
  airport: "Airport",
  inland_point: "Delivery area",
};

const SORT_OPTIONS: Array<{ key: SortKey; label: string }> = [
  { key: "door_to_door", label: "Door to door" },
  { key: "cost", label: "Total cost" },
  { key: "reliability", label: "Reliability" },
  { key: "co2", label: "Carbon" },
];

function money(value: number): string {
  return `$${Math.round(value).toLocaleString("en-US")}`;
}

export default function IntermodalRoutes() {
  const destinations = useMemo(() => intermodalDestinations(), []);
  const [destination, setDestination] = useState<string>(destinations[0]?.code ?? "");
  const [sort, setSort] = useState<SortKey>("door_to_door");
  const [throughBillOnly, setThroughBillOnly] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const ranked = useMemo(
    () => rankIntermodalRoutes({ destination: destination || undefined, sort, throughBillOnly }),
    [destination, sort, throughBillOnly]
  );

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white">Intermodal route options</h3>
        <p className="text-sm text-navy-400 mt-1">
          Ocean, rail, air and drayage as one chain. Door-to-door counts the days the box sits at
          each interchange — the transit number never does.
        </p>
      </div>

      {/* ── Controls ─────────────────────────────────────── */}
      <div className="flex flex-wrap items-end gap-3">
        <label className="block">
          <span className="block text-[11px] uppercase tracking-wide text-navy-400 mb-1.5">
            Inland destination
          </span>
          <select
            value={destination}
            onChange={(e) => {
              setDestination(e.target.value);
              setExpandedId(null);
            }}
            className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:ring-2 focus:ring-ocean-500/40"
          >
            <option value="">Every destination</option>
            {destinations.map((d) => (
              <option key={d.code} value={d.code} className="bg-[#020a17]">
                {d.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="block text-[11px] uppercase tracking-wide text-navy-400 mb-1.5">
            Rank by
          </span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:ring-2 focus:ring-ocean-500/40"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.key} value={o.key} className="bg-[#020a17]">
                {o.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg bg-white/5 border border-white/10">
          <input
            type="checkbox"
            checked={throughBillOnly}
            onChange={(e) => setThroughBillOnly(e.target.checked)}
            className="w-4 h-4 rounded border-white/20 bg-transparent text-ocean-500"
          />
          <span className="text-sm text-navy-200">
            Through bill only
            <span className="block text-[11px] text-navy-500">
              Carrier owns the inland leg — and the delay
            </span>
          </span>
        </label>
      </div>

      {/* ── Mode legend ──────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2">
        {(Object.keys(MODE_STYLE) as TransportMode[]).map((mode) => {
          const style = MODE_STYLE[mode];
          const Icon = style.icon;
          return (
            <span
              key={mode}
              className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full ${style.chip}`}
            >
              <Icon className="w-3 h-3" />
              {MODE_LABELS[mode]}
            </span>
          );
        })}
      </div>

      {ranked.length === 0 ? (
        <p className="text-sm text-navy-400">
          No intermodal routings match. Widen the destination or turn off the through-bill filter.
        </p>
      ) : (
        <div className="space-y-4">
          {ranked.map((entry) => (
            <RouteCard
              key={entry.route.id}
              entry={entry}
              expanded={expandedId === entry.route.id}
              onToggle={() =>
                setExpandedId(expandedId === entry.route.id ? null : entry.route.id)
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────

function RouteCard({
  entry,
  expanded,
  onToggle,
}: {
  entry: RankedRoute;
  expanded: boolean;
  onToggle: () => void;
}) {
  const { route, totals, transitPremiumDays, costPremiumUsd } = entry;
  const nodeCodes = routeNodeCodes(route);

  return (
    <section className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-base font-semibold text-white">{route.label}</h4>
            <span
              className={`text-[10px] uppercase tracking-wide font-bold px-2 py-0.5 rounded-full ${
                route.throughBillOfLading
                  ? "bg-ocean-500/20 text-ocean-300"
                  : "bg-white/10 text-navy-300"
              }`}
            >
              {route.throughBillOfLading ? "through bill" : "merchant haulage"}
            </span>
            {transitPremiumDays === 0 && (
              <span className="text-[10px] uppercase tracking-wide font-bold px-2 py-0.5 rounded-full bg-green-500/20 text-green-300">
                fastest
              </span>
            )}
            {costPremiumUsd === 0 && (
              <span className="text-[10px] uppercase tracking-wide font-bold px-2 py-0.5 rounded-full bg-cargo-500/20 text-cargo-300">
                cheapest
              </span>
            )}
          </div>
          <p className="text-xs text-navy-400 mt-1">
            {route.sellingCarrier} · {totals.modeSequence} · {totals.legCount} legs
          </p>
        </div>

        <button
          type="button"
          onClick={onToggle}
          className="text-xs font-medium text-ocean-300 hover:text-ocean-200 transition-colors shrink-0"
        >
          {expanded ? "Hide legs" : "Show legs"}
        </button>
      </div>

      {/* ── Mode segment bar ───────────────────────────────
          Widths are proportional to each leg's worst-case transit, with
          interchange dwell drawn as its own neutral block. A rail routing
          whose ramp wait is a third of the inland time should look like it. */}
      <div className="flex h-2.5 rounded-full overflow-hidden bg-white/5 mb-2">
        {route.legs.map((leg, i) => {
          const dwell = i < route.legs.length - 1 ? getNode(leg.toCode)?.interchangeDwellDays ?? 0 : 0;
          const span = leg.transitDays.max;
          return (
            <div key={leg.id} className="flex" style={{ flexGrow: span + dwell, minWidth: 0 }}>
              <div
                className={MODE_STYLE[leg.mode].bar}
                style={{ flexGrow: span, minWidth: 0 }}
                title={`${MODE_LABELS[leg.mode]} · ${leg.transitDays.min}–${leg.transitDays.max} days`}
              />
              {dwell > 0 && (
                <div
                  className="bg-white/20"
                  style={{ flexGrow: dwell, minWidth: 0 }}
                  title={`${dwell} day interchange dwell at ${getNode(leg.toCode)?.name ?? leg.toCode}`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* ── Node markers ──────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-x-1 gap-y-2 mb-4">
        {nodeCodes.map((code, i) => {
          const node = getNode(code);
          const Icon = node ? NODE_ICON[node.kind] : Anchor;
          return (
            <span key={`${code}-${i}`} className="flex items-center gap-1">
              <span
                className="inline-flex items-center gap-1.5 text-[11px] px-2 py-1 rounded-md bg-white/5 border border-white/10 text-navy-200"
                title={node ? `${NODE_LABEL[node.kind]} · ${node.name}` : code}
              >
                <Icon className="w-3 h-3 text-navy-400" />
                {node?.city ?? code}
              </span>
              {i < nodeCodes.length - 1 && <span className="text-navy-600 text-xs">→</span>}
            </span>
          );
        })}
      </div>

      {/* ── Totals ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Metric
          icon={Clock}
          label="Door to door"
          value={`${totals.doorToDoorDays.min}–${totals.doorToDoorDays.max} days`}
          sub={`${totals.transitDays.min}–${totals.transitDays.max} moving + ${totals.dwellDays} waiting`}
          tone="text-ocean-300"
        />
        <Metric
          icon={DollarSign}
          label="Total cost"
          value={money(totals.totalCostUsd)}
          sub={
            totals.worstCaseStorageUsd > 0
              ? `${money(totals.freightCostUsd)} freight + ${money(
                  totals.worstCaseStorageUsd
                )} worst-case storage`
              : `${money(totals.freightCostUsd)} freight, no storage exposure`
          }
          tone="text-cargo-300"
        />
        <Metric
          icon={ShieldCheck}
          label="Reliability"
          value={`${totals.reliability}%`}
          sub="every leg on time, compounded"
          tone="text-green-300"
        />
        <Metric
          icon={Leaf}
          label="Carbon"
          value={totals.co2Kg === null ? "—" : `${totals.co2Kg.toLocaleString("en-US")} kg`}
          sub={totals.co2Kg === null ? "not stated on every leg" : "CO2e per 40ft"}
          tone="text-teal-300"
        />
      </div>

      {(transitPremiumDays > 0 || costPremiumUsd > 0) && (
        <p className="text-[11px] text-navy-500 mt-3">
          {transitPremiumDays > 0 && `${transitPremiumDays} days slower than the fastest option`}
          {transitPremiumDays > 0 && costPremiumUsd > 0 && " · "}
          {costPremiumUsd > 0 && `${money(costPremiumUsd)} more than the cheapest`}
        </p>
      )}

      {route.notes && <p className="text-xs text-navy-400 mt-3 leading-relaxed">{route.notes}</p>}

      {expanded && (
        <div className="mt-5 pt-5 border-t border-white/10 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-wide text-navy-500 border-b border-white/10">
                <th className="py-2 pr-3 font-semibold">Leg</th>
                <th className="py-2 px-3 font-semibold">Carrier / service</th>
                <th className="py-2 px-3 font-semibold text-right">Transit</th>
                <th className="py-2 px-3 font-semibold text-right">Cost</th>
                <th className="py-2 pl-3 font-semibold text-right">On time</th>
              </tr>
            </thead>
            <tbody>
              {route.legs.map((leg, i) => {
                const style = MODE_STYLE[leg.mode];
                const Icon = style.icon;
                const toNode = getNode(leg.toCode);
                const dwell = i < route.legs.length - 1 ? toNode?.interchangeDwellDays ?? 0 : 0;
                return [
                  <tr key={leg.id} className="border-b border-white/5">
                    <td className="py-2.5 pr-3">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full ${style.chip}`}>
                        <Icon className="w-3 h-3" />
                        {MODE_LABELS[leg.mode]}
                      </span>
                      <div className="text-navy-500 mt-1">
                        {getNode(leg.fromCode)?.city ?? leg.fromCode} → {toNode?.city ?? leg.toCode}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-navy-200">
                      {leg.carrier}
                      {leg.service && <div className="text-navy-500">{leg.service}</div>}
                      {leg.notes && <div className="text-navy-500 italic mt-0.5">{leg.notes}</div>}
                    </td>
                    <td className="py-2.5 px-3 text-right text-white whitespace-nowrap">
                      {leg.transitDays.min}–{leg.transitDays.max} d
                    </td>
                    <td className="py-2.5 px-3 text-right text-white whitespace-nowrap">
                      {money(leg.costUsd)}
                    </td>
                    <td className="py-2.5 pl-3 text-right text-navy-200">{leg.reliability}%</td>
                  </tr>,
                  dwell > 0 ? (
                    // The interchange gets its own row on purpose. It is not a
                    // leg, nobody bills freight for it, and it is where the
                    // schedule quietly goes wrong.
                    <tr key={`${leg.id}-dwell`} className="border-b border-white/5 bg-white/[0.02]">
                      <td className="py-2 pr-3 text-navy-400" colSpan={2}>
                        Interchange at {toNode?.name ?? leg.toCode}
                        {toNode && (
                          <span className="text-navy-600">
                            {" "}
                            · {toNode.freeDays} free days, then {money(toNode.storagePerDayUsd)}/day
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-right text-navy-300 whitespace-nowrap">
                        +{dwell} d
                      </td>
                      <td className="py-2 px-3 text-right text-navy-600">—</td>
                      <td className="py-2 pl-3 text-right text-navy-600">—</td>
                    </tr>
                  ) : null,
                ];
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  sub,
  tone,
}: {
  icon: typeof Clock;
  label: string;
  value: string;
  sub: string;
  tone: string;
}) {
  return (
    <div className="rounded-lg bg-white/[0.03] border border-white/5 p-3">
      <div className={`flex items-center gap-1.5 text-[10px] uppercase tracking-wide ${tone}`}>
        <Icon className="w-3 h-3" />
        {label}
      </div>
      <div className="text-sm font-semibold text-white mt-1">{value}</div>
      <div className="text-[10px] text-navy-500 mt-0.5 leading-snug">{sub}</div>
    </div>
  );
}

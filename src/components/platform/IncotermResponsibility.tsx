"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, ArrowLeftRight, Info } from "lucide-react";
import {
  COST_SEGMENTS,
  INCOTERMS,
  INCOTERM_PROFILES,
  SEGMENT_LABELS,
  compareIncotermCost,
  incotermWarnings,
  splitCostsByResponsibility,
  type CostLine,
  type Incoterm,
  type TradeRole,
} from "@/lib/incoterms";

/**
 * Incoterm cost-responsibility panel (AI-8869 sub-feature B).
 *
 * Drops onto the landed-cost calculator and the shipment detail page. Given a
 * cost breakdown it answers the question the total alone can't: of this
 * number, how much actually lands on us under the term we agreed?
 *
 * All computation is client-side against the pure engine in @/lib/incoterms —
 * changing the term or the role is instant with no round trip, which is what
 * makes the "what if we bought CIF instead" comparison usable.
 */

interface Props {
  costs: CostLine[];
  /** Controlled term. Omit for the panel's own picker. */
  incoterm?: Incoterm | null;
  tradeRole?: TradeRole;
  onIncotermChange?: (term: Incoterm) => void;
  onTradeRoleChange?: (role: TradeRole) => void;
  /** Surfaces the "you're using a bulk rule for a box" warning. */
  containerised?: boolean;
  className?: string;
}

const currency = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export default function IncotermResponsibility({
  costs,
  incoterm,
  tradeRole,
  onIncotermChange,
  onTradeRoleChange,
  containerised = true,
  className = "",
}: Props) {
  const [localTerm, setLocalTerm] = useState<Incoterm>(incoterm ?? "FOB");
  const [localRole, setLocalRole] = useState<TradeRole>(tradeRole ?? "buyer");

  const term = incoterm ?? localTerm;
  const role = tradeRole ?? localRole;

  const setTerm = (next: Incoterm) => {
    setLocalTerm(next);
    onIncotermChange?.(next);
  };
  const setRole = (next: TradeRole) => {
    setLocalRole(next);
    onTradeRoleChange?.(next);
  };

  const profile = INCOTERM_PROFILES[term];
  const split = useMemo(() => splitCostsByResponsibility(term, role, costs), [term, role, costs]);
  const warnings = useMemo(
    () => incotermWarnings(term, role, { containerised }),
    [term, role, containerised]
  );
  const comparison = useMemo(() => compareIncotermCost(role, costs), [role, costs]);

  const counterparty = role === "buyer" ? "seller" : "buyer";
  const bestAlternative = comparison.find((c) => c.term !== term && c.ourTotal < split.ourTotal);

  return (
    <div className={`bg-white border border-navy-200 rounded-xl ${className}`}>
      <div className="p-5 border-b border-navy-200">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-navy-900">Incoterm cost responsibility</h3>
            <p className="text-sm text-navy-500 mt-0.5">
              Which segments of this move land on your P&amp;L under {term}.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={term}
              onChange={(e) => setTerm(e.target.value as Incoterm)}
              aria-label="Incoterm"
              className="text-sm border border-navy-200 rounded-lg px-3 py-2 bg-white text-navy-900"
            >
              {INCOTERMS.map((t) => (
                <option key={t} value={t}>
                  {t} — {INCOTERM_PROFILES[t].name}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => setRole(counterparty)}
              className="inline-flex items-center gap-1.5 text-sm border border-navy-200 rounded-lg px-3 py-2 text-navy-700 hover:bg-navy-50 transition-colors"
              title="Switch which side of the sale you are on"
            >
              <ArrowLeftRight className="w-4 h-4" />
              We are the {role}
            </button>
          </div>
        </div>
      </div>

      {/* Totals */}
      <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-navy-200 border-b border-navy-200">
        <div className="p-5">
          <p className="text-xs uppercase tracking-wide text-navy-400">Our cost</p>
          <p className="text-2xl font-semibold text-navy-900 mt-1">{currency(split.ourTotal)}</p>
          <p className="text-xs text-navy-500 mt-1">
            {(split.ourShare * 100).toFixed(0)}% of the {currency(split.grandTotal)} total
          </p>
        </div>
        <div className="p-5">
          <p className="text-xs uppercase tracking-wide text-navy-400">
            {counterparty === "seller" ? "Supplier" : "Customer"} cost
          </p>
          <p className="text-2xl font-semibold text-navy-600 mt-1">
            {currency(split.counterpartyTotal)}
          </p>
          <p className="text-xs text-navy-500 mt-1">
            {split.counterpartySegments.length} segment
            {split.counterpartySegments.length === 1 ? "" : "s"} they own
          </p>
        </div>
        <div className="p-5">
          <p className="text-xs uppercase tracking-wide text-navy-400">Risk transfers</p>
          <p className="text-sm font-medium text-navy-900 mt-1 leading-snug">
            {profile.riskTransfer}
          </p>
        </div>
      </div>

      {/* Responsibility bar */}
      {split.grandTotal > 0 && (
        <div className="px-5 pt-5">
          <div className="h-3 w-full rounded-full overflow-hidden flex bg-navy-100">
            <div
              className="bg-ocean-500"
              style={{ width: `${split.ourShare * 100}%` }}
              title={`Ours: ${currency(split.ourTotal)}`}
            />
            <div
              className="bg-navy-300"
              style={{ width: `${(1 - split.ourShare) * 100}%` }}
              title={`Theirs: ${currency(split.counterpartyTotal)}`}
            />
          </div>
          <div className="flex justify-between text-xs text-navy-500 mt-2">
            <span>Ours</span>
            <span>Theirs</span>
          </div>
        </div>
      )}

      {/* Line-by-line allocation */}
      <div className="p-5">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-navy-400 border-b border-navy-200">
              <th className="pb-2 font-medium">Cost</th>
              <th className="pb-2 font-medium">Segment</th>
              <th className="pb-2 font-medium text-right">Amount</th>
              <th className="pb-2 font-medium text-right">Owner</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-100">
            {split.lines.map((line, i) => (
              <tr key={`${line.label}-${i}`} className={line.ours ? "" : "text-navy-400"}>
                <td className="py-2 font-medium">{line.label}</td>
                <td className="py-2">{line.segmentLabel}</td>
                <td className="py-2 text-right tabular-nums">{currency(line.amount)}</td>
                <td className="py-2 text-right">
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-xs border ${
                      line.ours
                        ? "bg-ocean-50 text-ocean-700 border-ocean-200"
                        : "bg-navy-50 text-navy-500 border-navy-200"
                    }`}
                  >
                    {line.ours ? "Us" : `Their ${line.owner}`}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Segment ownership matrix — the full rule, including segments with no
          cost line, so a customer can see what they've agreed to regardless of
          whether they've priced it yet. */}
      <details className="px-5 pb-5">
        <summary className="cursor-pointer text-sm font-medium text-navy-700">
          Full {term} obligation map
        </summary>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
          {COST_SEGMENTS.filter((s) => s !== "goods" && s !== "postImport").map((segment) => {
            const owner = profile.segments[segment];
            const ours = owner === role;
            return (
              <div key={segment} className="flex items-center justify-between text-sm py-1">
                <span className="text-navy-600">{SEGMENT_LABELS[segment]}</span>
                <span className={ours ? "font-medium text-ocean-700" : "text-navy-400"}>
                  {ours ? "Us" : "Them"}
                </span>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-navy-500 mt-3 flex gap-1.5">
          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>
            {profile.note} Named place: {profile.namedPlace}.
          </span>
        </p>
      </details>

      {/* Exposure warnings */}
      {warnings.length > 0 && (
        <div className="px-5 pb-5 space-y-2">
          {warnings.map((warning, i) => (
            <div
              key={i}
              className="flex gap-2 text-sm bg-amber-50 border border-amber-200 text-amber-900 rounded-lg p-3"
            >
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{warning}</span>
            </div>
          ))}
        </div>
      )}

      {/* Negotiating lever */}
      {bestAlternative && split.grandTotal > 0 && (
        <div className="px-5 pb-5">
          <div className="text-sm bg-ocean-50 border border-ocean-200 text-ocean-900 rounded-lg p-3">
            Renegotiating to <strong>{bestAlternative.term}</strong> ({bestAlternative.name}) would
            move {currency(split.ourTotal - bestAlternative.ourTotal)} of this move onto the{" "}
            {counterparty}. The supplier will price that in — but it is a lever most importers
            never pull.
          </div>
        </div>
      )}
    </div>
  );
}

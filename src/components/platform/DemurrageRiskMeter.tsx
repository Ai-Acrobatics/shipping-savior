import { AlertTriangle, CircleCheck, Clock, DollarSign, Truck } from "lucide-react";
import type { DemurrageRisk, RiskLevel } from "@/lib/alerts/demurrage";

interface DemurrageRiskMeterProps {
  risk: DemurrageRisk;
}

const LEVEL_STYLES: Record<RiskLevel, { card: string; bar: string; chip: string; label: string }> = {
  clear:    { card: "border-navy-200 bg-navy-50",     bar: "bg-navy-300",     chip: "bg-navy-100 text-navy-600",       label: "Clear" },
  safe:     { card: "border-emerald-200 bg-emerald-50", bar: "bg-emerald-500", chip: "bg-emerald-100 text-emerald-700", label: "On time" },
  warning:  { card: "border-amber-200 bg-amber-50",   bar: "bg-amber-500",    chip: "bg-amber-100 text-amber-700",     label: "Watch" },
  critical: { card: "border-orange-300 bg-orange-50", bar: "bg-orange-500",   chip: "bg-orange-100 text-orange-700",   label: "Act now" },
  accruing: { card: "border-red-300 bg-red-50",       bar: "bg-red-500",      chip: "bg-red-100 text-red-700",         label: "Accruing" },
};

const CLOCK_LABEL: Record<DemurrageRisk["clock"], string> = {
  pending: "Not started",
  demurrage: "Demurrage — box in terminal",
  detention: "Detention — box on the street",
  clear: "Closed out",
};

function usd(n: number): string {
  return `$${Math.round(n).toLocaleString("en-US")}`;
}

/**
 * Per-container free-time meter (AI-12011).
 *
 * The bar shows free time consumed on whichever clock is running. Demurrage
 * and detention are deliberately labelled distinctly — the two are separate
 * charges from separate parties, and a box that cleared demurrage can still
 * be burning detention.
 */
export default function DemurrageRiskMeter({ risk }: DemurrageRiskMeterProps) {
  const style = LEVEL_STYLES[risk.riskLevel];

  const freeDays =
    risk.clock === "detention"
      ? risk.tariff.detentionFreeDays
      : risk.tariff.demurrageFreeDays;

  // Fraction of free time burned. Pinned to 100% once charges accrue.
  const consumed =
    risk.daysRemaining === null
      ? 0
      : risk.chargeableDays > 0
        ? 1
        : Math.min(1, Math.max(0, (freeDays - risk.daysRemaining) / Math.max(1, freeDays)));

  const Icon =
    risk.riskLevel === "accruing"
      ? AlertTriangle
      : risk.riskLevel === "clear"
        ? CircleCheck
        : risk.clock === "detention"
          ? Truck
          : Clock;

  return (
    <div className={`rounded-2xl border p-6 ${style.card}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-navy-500">
            <Icon className="h-4 w-4" />
            Demurrage / Detention Risk
          </h2>
          <p className="mt-2 text-lg font-bold text-navy-900">{risk.headline}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${style.chip}`}>
          {style.label}
        </span>
      </div>

      {risk.clock !== "pending" && risk.clock !== "clear" && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs font-medium text-navy-500">
            <span>{CLOCK_LABEL[risk.clock]}</span>
            <span>
              {risk.chargeableDays > 0
                ? `${risk.chargeableDays} chargeable ${risk.chargeableDays === 1 ? "day" : "days"}`
                : `${freeDays} ${risk.tariff.dayBasis} free ${freeDays === 1 ? "day" : "days"}`}
            </span>
          </div>
          <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-white/70">
            <div
              className={`h-full rounded-full transition-all ${style.bar}`}
              style={{ width: `${Math.round(consumed * 100)}%` }}
            />
          </div>
        </div>
      )}

      <p className="mt-4 text-sm leading-relaxed text-navy-600">{risk.detail}</p>

      {risk.chargeableDays > 0 && (
        <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-white/60 pt-4 sm:grid-cols-3">
          <div>
            <dt className="flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-navy-400">
              <DollarSign className="h-3 w-3" />
              Accrued
            </dt>
            <dd className="mt-0.5 text-lg font-bold text-red-600">{usd(risk.accruedUsd)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-navy-400">
              Per day
            </dt>
            <dd className="mt-0.5 text-lg font-bold text-navy-800">
              {usd(risk.perDiemUsd)}
              <span className="text-xs font-medium text-navy-400">/container</span>
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-navy-400">
              In 7 days
            </dt>
            <dd className="mt-0.5 text-lg font-bold text-navy-800">{usd(risk.projectedUsd7d)}</dd>
          </div>
        </dl>
      )}

      <p className="mt-4 text-xs text-navy-400">
        {risk.tariff.source === "contract"
          ? `Free time from your contracted terms (${risk.tariff.carrier}).`
          : `Free time and rates are market-typical estimates for ${risk.tariff.carrier}, not your contract. Set importMeta.demurrageTariff to use your real terms.`}
        {risk.containerCount > 1 && ` Totals cover ${risk.containerCount} containers.`}
      </p>
    </div>
  );
}

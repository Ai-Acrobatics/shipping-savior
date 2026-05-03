"use client";

/**
 * ScenarioBanner — when the dashboard is loaded with ?scenario=<id>,
 * render the pre-loaded lane comparison + savings callout for the
 * investor walkthrough. Tour-step targets live here so GuidedTour
 * can highlight them in sequence.
 *
 * Linear: AI-6537 (data) + AI-6542 (tour) + AI-8727 (card fix)
 */

import { useSearchParams } from "next/navigation";
import {
  Ship,
  Anchor,
  Truck,
  Globe,
  ArrowRight,
  Clock,
  Shield,
  DollarSign,
  TrendingDown,
  Sparkles,
} from "lucide-react";
import { getScenarioById, type DemoScenario } from "@/lib/data/demo-scenarios";

const accentMap: Record<DemoScenario["accent"], { text: string; bg: string; border: string; ring: string }> = {
  blue: {
    text: "text-ocean-600",
    bg: "bg-ocean-50",
    border: "border-ocean-200",
    ring: "ring-ocean-500/20",
  },
  emerald: {
    text: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    ring: "ring-emerald-500/20",
  },
  amber: {
    text: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
    ring: "ring-amber-500/20",
  },
};

const modeIcon = {
  "ocean-reefer": Ship,
  "ocean-dry": Ship,
  "jones-act-multimodal": Anchor,
} as const;

function formatMoney(v: number) {
  return v.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

export default function ScenarioBanner() {
  const params = useSearchParams();
  const scenarioId = params?.get("scenario");
  if (!scenarioId) return null;

  const scenario = getScenarioById(scenarioId);
  if (!scenario) return null;

  const accent = accentMap[scenario.accent];
  const Icon = modeIcon[scenario.mode] ?? Ship;
  const cheapest = [...scenario.carriers].sort((a, b) => a.rate - b.rate)[0];

  return (
    <div
      data-tour-step="1"
      className={`rounded-2xl border ${accent.border} ${accent.bg} p-5 md:p-6 shadow-soft`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-3 min-w-0">
          <div className={`w-11 h-11 rounded-xl bg-white border ${accent.border} flex items-center justify-center flex-shrink-0`}>
            <Icon className={`w-5 h-5 ${accent.text}`} />
          </div>
          <div className="min-w-0">
            <div className={`text-[11px] font-semibold uppercase tracking-widest ${accent.text} flex items-center gap-1.5`}>
              <Sparkles className="w-3 h-3" /> Investor Demo Scenario
            </div>
            <h2 className="text-lg md:text-xl font-bold text-navy-900 mt-0.5 truncate">
              {scenario.name}
            </h2>
            <p className="text-sm text-navy-600 mt-1">
              {scenario.containerCount}× {scenario.containerType} · {scenario.commodity}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-navy-700 font-medium">
          <Globe className="w-4 h-4 text-navy-500" />
          <span>{scenario.origin}</span>
          <ArrowRight className="w-4 h-4 text-navy-400" />
          <span>{scenario.destination}</span>
        </div>
      </div>

      {/* Carrier comparison */}
      <div data-tour-step="2" className="mt-5 rounded-xl border border-navy-200 bg-white overflow-hidden">
        <div className="px-4 py-2.5 border-b border-navy-100 bg-navy-50/50 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-navy-600">
            Carrier comparison · {scenario.carriers.length} options
          </span>
          <span className="text-[11px] font-mono text-navy-500">
            {scenario.departureDate} → {scenario.arrivalDate}
          </span>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-navy-100 text-left">
              <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-navy-500">Carrier</th>
              <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-navy-500">
                <span className="inline-flex items-center gap-1">
                  <DollarSign className="w-3 h-3" /> Rate / box
                </span>
              </th>
              <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-navy-500">
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Transit
                </span>
              </th>
              <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-navy-500">
                <span className="inline-flex items-center gap-1">
                  <Shield className="w-3 h-3" /> Reliability
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {scenario.carriers.map((c) => (
              <tr
                key={c.name}
                className={`border-b border-navy-100 last:border-0 ${
                  c.highlight ? `${accent.bg}` : ""
                }`}
              >
                <td className="px-4 py-3 font-medium text-navy-900">
                  {c.name}
                  {c.highlight && (
                    <span className={`ml-2 text-[10px] font-bold uppercase ${accent.text}`}>
                      Best
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-navy-700 font-mono text-xs">{formatMoney(c.rate)}</td>
                <td className="px-4 py-3 text-navy-700 font-mono text-xs">{c.transitDays} days</td>
                <td className="px-4 py-3 text-navy-700 font-mono text-xs">
                  {c.reliabilityLabel ?? `${c.reliability}%`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Savings callout — also serves as the Tariff Alert step (4) */}
      <div data-tour-step="4" className={`mt-4 rounded-xl border ${accent.border} bg-white p-4 flex items-start gap-3`}>
        <div className={`w-10 h-10 rounded-lg ${accent.bg} flex items-center justify-center flex-shrink-0`}>
          <TrendingDown className={`w-5 h-5 ${accent.text}`} />
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold text-navy-900">{scenario.savingsCallout}</div>
          <p className="text-xs text-navy-600 mt-1 leading-relaxed">{scenario.useCase}</p>
          {scenario.contractRate && scenario.tariffRate && (
            <p className="text-xs text-navy-500 mt-1.5 font-mono">
              Contract {formatMoney(scenario.contractRate)} vs Tariff {formatMoney(scenario.tariffRate)} · {scenario.containerCount} boxes ·
              total saved {formatMoney(scenario.contractSavingsTotal ?? 0)}
            </p>
          )}
          {scenario.htsCode && (
            <p className="text-xs text-navy-500 mt-1.5 font-mono">
              HTS {scenario.htsCode} · {scenario.htsDescription} · {scenario.mfnRate}
            </p>
          )}
          {scenario.shelfLifeImpact && (
            <p className="text-xs text-navy-500 mt-1.5 italic">{scenario.shelfLifeImpact}</p>
          )}
        </div>
        {cheapest && (
          <div className="text-right hidden sm:block">
            <div className="text-[10px] uppercase tracking-wider text-navy-400">Cheapest</div>
            <div className={`text-sm font-bold ${accent.text}`}>{cheapest.name}</div>
            <div className="text-xs text-navy-500 font-mono">{formatMoney(cheapest.rate)}</div>
          </div>
        )}
      </div>

      {/* FTZ savings sub-callout when present */}
      {scenario.ftzSavings && (
        <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50/50 px-4 py-3 flex items-center gap-3">
          <Truck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <div className="text-xs text-navy-700">
            <span className="font-semibold">{scenario.ftzZone}:</span>{" "}
            cross-dock entry saves <span className="font-bold text-emerald-700">{formatMoney(scenario.ftzSavings)}</span> vs full-duty entry.
          </div>
        </div>
      )}

      {/* Metrics strip — tour step 6 anchor */}
      <div
        data-tour-step="6"
        className="mt-5 grid grid-cols-3 gap-3"
      >
        <div className="rounded-lg bg-white border border-navy-200 px-4 py-3 text-center">
          <div className="text-lg font-bold text-navy-900">$2.4B</div>
          <div className="text-[10px] uppercase tracking-wider text-navy-500">Tracked freight</div>
        </div>
        <div className="rounded-lg bg-white border border-navy-200 px-4 py-3 text-center">
          <div className="text-lg font-bold text-navy-900">3,700</div>
          <div className="text-[10px] uppercase tracking-wider text-navy-500">Ports</div>
        </div>
        <div className="rounded-lg bg-white border border-navy-200 px-4 py-3 text-center">
          <div className="text-lg font-bold text-navy-900">200+</div>
          <div className="text-[10px] uppercase tracking-wider text-navy-500">HTS codes</div>
        </div>
      </div>
    </div>
  );
}

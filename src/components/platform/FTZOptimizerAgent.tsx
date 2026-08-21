"use client";

/**
 * FTZ Optimizer Agent — AI-12021
 *
 * Enter a bill of materials plus the economics of running a zone, get back an
 * inverted-tariff read, a PF/NPF election and a five-year NPV.
 *
 * Every number is computed server-side by lib/ftz-optimizer so what renders
 * here always matches the API contract — this component only collects input
 * and presents the result.
 */

import { useState } from "react";
import {
  AlertTriangle,
  ArrowDownRight,
  Building2,
  CheckCircle2,
  Info,
  Layers,
  Loader2,
  Lock,
  Minus,
  Plus,
  ShieldAlert,
  Sparkles,
  TrendingDown,
  Unlock,
  XCircle,
} from "lucide-react";
import type {
  FtzElection,
  FtzOptimization,
  FtzVerdict,
} from "@/lib/ftz-optimizer/types";

const COUNTRY_OPTIONS = [
  "CN", "VN", "TH", "ID", "KH", "MY", "PH", "MM", "IN",
  "BD", "US", "MX", "CA", "DE", "JP", "KR", "TW", "AU",
  "GB", "FR", "IT", "BR", "TR", "PK", "EG", "OTHER",
] as const;

const VERDICT_STYLES: Record<FtzVerdict, { chip: string; icon: typeof CheckCircle2 }> = {
  PURSUE: { chip: "bg-emerald-100 text-emerald-800 border-emerald-300", icon: CheckCircle2 },
  MARGINAL: { chip: "bg-amber-100 text-amber-800 border-amber-300", icon: AlertTriangle },
  SKIP: { chip: "bg-red-100 text-red-800 border-red-300", icon: XCircle },
};

const ELECTION_COPY: Record<FtzElection, { title: string; blurb: string; icon: typeof Lock }> = {
  PF: {
    title: "Privileged Foreign",
    blurb:
      "Freeze the classification and rate at admission. Whatever tariffs do while the goods sit in the zone, the duty bill is already known.",
    icon: Lock,
  },
  NPF: {
    title: "Non-Privileged Foreign",
    blurb:
      "Pay at withdrawal on the finished article's classification. The only route to inverted-tariff relief — and the only one exposed to rate movement during storage.",
    icon: Unlock,
  },
  MIXED: {
    title: "Mixed — NPF where allowed",
    blurb:
      "Elect NPF on the eligible slice of the BOM. Section 301/232 merchandise must still be admitted Privileged Foreign and stays on its component rate.",
    icon: Layers,
  },
};

interface ComponentDraft {
  description: string;
  htsCode: string;
  countryOfOrigin: string;
  annualValueUsd: string;
  dutyRatePctOverride: string;
}

const usd = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;
const pct = (n: number) => `${n.toFixed(2)}%`;

const emptyComponent = (): ComponentDraft => ({
  description: "",
  htsCode: "",
  countryOfOrigin: "VN",
  annualValueUsd: "",
  dutyRatePctOverride: "",
});

export default function FTZOptimizerAgent() {
  const [finishedDescription, setFinishedDescription] = useState("Assembled finished good");
  const [finishedHts, setFinishedHts] = useState("8509.40.00");
  const [finishedRateOverride, setFinishedRateOverride] = useState("2.5");

  const [components, setComponents] = useState<ComponentDraft[]>([
    {
      description: "Motor sub-assembly",
      htsCode: "8501.10.40",
      countryOfOrigin: "VN",
      annualValueUsd: "6000000",
      dutyRatePctOverride: "9",
    },
    {
      description: "Moulded housing",
      htsCode: "3926.90.99",
      countryOfOrigin: "TH",
      annualValueUsd: "4000000",
      dutyRatePctOverride: "6.5",
    },
  ]);

  const [manufacturingInZone, setManufacturingInZone] = useState(true);
  const [reExportSharePct, setReExportSharePct] = useState("0");
  const [scrapSharePct, setScrapSharePct] = useState("0");
  const [entriesPerYear, setEntriesPerYear] = useState("260");
  const [storageMonths, setStorageMonths] = useState("3");
  const [costOfCapitalPct, setCostOfCapitalPct] = useState("10");
  const [activationCostUsd, setActivationCostUsd] = useState("150000");
  const [annualOperatingCostUsd, setAnnualOperatingCostUsd] = useState("120000");
  const [tariffTrajectoryPctPerYear, setTariffTrajectoryPctPerYear] = useState("0");
  const [volumeGrowthPctPerYear, setVolumeGrowthPctPerYear] = useState("0");
  const [horizonYears, setHorizonYears] = useState("5");

  const [result, setResult] = useState<FtzOptimization | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateComponent = (index: number, patch: Partial<ComponentDraft>) => {
    setComponents((prev) => prev.map((c, i) => (i === index ? { ...c, ...patch } : c)));
  };

  const optimize = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    const body = {
      finishedGood: {
        description: finishedDescription.trim() || "Finished good",
        htsCode: finishedHts.trim(),
        ...(finishedRateOverride.trim()
          ? { dutyRatePctOverride: Number(finishedRateOverride) }
          : {}),
      },
      components: components
        .filter((c) => c.htsCode.trim() && Number(c.annualValueUsd) > 0)
        .map((c) => ({
          description: c.description.trim() || c.htsCode.trim(),
          htsCode: c.htsCode.trim(),
          countryOfOrigin: c.countryOfOrigin,
          annualValueUsd: Number(c.annualValueUsd),
          ...(c.dutyRatePctOverride.trim()
            ? { dutyRatePctOverride: Number(c.dutyRatePctOverride) }
            : {}),
        })),
      manufacturingInZone,
      reExportSharePct: Number(reExportSharePct) || 0,
      scrapSharePct: Number(scrapSharePct) || 0,
      entriesPerYear: Number(entriesPerYear) || 1,
      storageMonths: Number(storageMonths) || 0,
      costOfCapitalPct: Number(costOfCapitalPct) || 0,
      activationCostUsd: Number(activationCostUsd) || 0,
      annualOperatingCostUsd: Number(annualOperatingCostUsd) || 0,
      tariffTrajectoryPctPerYear: Number(tariffTrajectoryPctPerYear) || 0,
      volumeGrowthPctPerYear: Number(volumeGrowthPctPerYear) || 0,
      horizonYears: Number(horizonYears) || 5,
    };

    try {
      const res = await fetch("/api/ftz/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        const detail = Array.isArray(data.details)
          ? ` (${data.details
              .map((d: { field: string; message: string }) => `${d.field}: ${d.message}`)
              .join(", ")})`
          : "";
        setError(`${data.error ?? "Optimization failed"}${detail}`);
        return;
      }
      setResult(data.optimization as FtzOptimization);
    } catch {
      setError("Could not reach the FTZ optimizer. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const canSubmit =
    finishedHts.trim().length > 0 &&
    components.some((c) => c.htsCode.trim() && Number(c.annualValueUsd) > 0) &&
    !loading;

  return (
    <div className="space-y-6">
      {/* ── Bill of materials ───────────────────────────────────── */}
      <section className="bg-white border border-navy-200 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-navy-900 mb-1">Bill of materials</h2>
        <p className="text-sm text-navy-500 mb-5">
          Annual customs value of everything admitted into the zone. Leave the rate blank to
          resolve it from the HTS schedule, including any Section 301 action for the origin.
        </p>

        <div className="space-y-3">
          {components.map((component, index) => (
            <div
              key={index}
              className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end bg-navy-50/50 border border-navy-100 rounded-lg p-3"
            >
              <div className="md:col-span-4">
                <Field label="Component">
                  <input
                    type="text"
                    value={component.description}
                    onChange={(e) => updateComponent(index, { description: e.target.value })}
                    placeholder="e.g. Motor sub-assembly"
                    className={inputClass}
                  />
                </Field>
              </div>
              <div className="md:col-span-2">
                <Field label="HTS code">
                  <input
                    type="text"
                    value={component.htsCode}
                    onChange={(e) => updateComponent(index, { htsCode: e.target.value })}
                    placeholder="8501.10.40"
                    className={inputClass}
                  />
                </Field>
              </div>
              <div className="md:col-span-2">
                <Field label="Origin">
                  <select
                    value={component.countryOfOrigin}
                    onChange={(e) =>
                      updateComponent(index, { countryOfOrigin: e.target.value })
                    }
                    className={inputClass}
                  >
                    {COUNTRY_OPTIONS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
              <div className="md:col-span-2">
                <Field label="Annual value">
                  <input
                    type="number"
                    min={0}
                    value={component.annualValueUsd}
                    onChange={(e) =>
                      updateComponent(index, { annualValueUsd: e.target.value })
                    }
                    className={inputClass}
                  />
                </Field>
              </div>
              <div className="md:col-span-1">
                <Field label="Rate %">
                  <input
                    type="number"
                    min={0}
                    step="0.1"
                    value={component.dutyRatePctOverride}
                    onChange={(e) =>
                      updateComponent(index, { dutyRatePctOverride: e.target.value })
                    }
                    placeholder="auto"
                    className={inputClass}
                  />
                </Field>
              </div>
              <div className="md:col-span-1 flex justify-end">
                <button
                  type="button"
                  onClick={() =>
                    setComponents((prev) => prev.filter((_, i) => i !== index))
                  }
                  disabled={components.length === 1}
                  className="p-2 text-navy-400 hover:text-red-600 disabled:opacity-30 disabled:hover:text-navy-400 transition-colors"
                  aria-label="Remove component"
                >
                  <Minus className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setComponents((prev) => [...prev, emptyComponent()])}
          className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-ocean-600 hover:text-ocean-700"
        >
          <Plus className="w-4 h-4" />
          Add component
        </button>
      </section>

      {/* ── Finished good ───────────────────────────────────────── */}
      <section className="bg-white border border-navy-200 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-navy-900 mb-1">Finished article</h2>
        <p className="text-sm text-navy-500 mb-5">
          How the merchandise is classified when it leaves the zone. If this rate is lower than
          the weighted component rate, the structure is inverted.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="Description">
            <input
              type="text"
              value={finishedDescription}
              onChange={(e) => setFinishedDescription(e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="HTS code" required>
            <input
              type="text"
              value={finishedHts}
              onChange={(e) => setFinishedHts(e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Duty rate %" hint="Blank resolves from the HTS schedule">
            <input
              type="number"
              min={0}
              step="0.1"
              value={finishedRateOverride}
              onChange={(e) => setFinishedRateOverride(e.target.value)}
              placeholder="auto"
              className={inputClass}
            />
          </Field>
        </div>

        <label className="mt-5 flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={manufacturingInZone}
            onChange={(e) => setManufacturingInZone(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded border-navy-300 text-ocean-600 focus:ring-ocean-500"
          />
          <span className="text-sm text-navy-700">
            <span className="font-medium">Zone holds CBP production authority</span>
            <span className="block text-xs text-navy-500 mt-0.5">
              Required for inverted-tariff relief. A warehouse or distribution-only zone cannot
              change the classification at withdrawal.
            </span>
          </span>
        </label>
      </section>

      {/* ── Zone economics ──────────────────────────────────────── */}
      <section className="bg-white border border-navy-200 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-navy-900 mb-1">Zone economics</h2>
        <p className="text-sm text-navy-500 mb-5">
          Activation is a capital decision. These figures decide whether the duty relief actually
          covers what the zone costs to run.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Field label="Entries / year today" hint="Drives weekly-entry MPF savings">
            <input
              type="number"
              min={1}
              value={entriesPerYear}
              onChange={(e) => setEntriesPerYear(e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Storage months" hint="Admission to withdrawal">
            <input
              type="number"
              min={0}
              step="0.5"
              value={storageMonths}
              onChange={(e) => setStorageMonths(e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Re-export share %" hint="Duty-free out of the zone">
            <input
              type="number"
              min={0}
              max={100}
              value={reExportSharePct}
              onChange={(e) => setReExportSharePct(e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Scrap / yield loss %">
            <input
              type="number"
              min={0}
              max={100}
              value={scrapSharePct}
              onChange={(e) => setScrapSharePct(e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Activation cost $" hint="Application, bond, WMS, consultants">
            <input
              type="number"
              min={0}
              value={activationCostUsd}
              onChange={(e) => setActivationCostUsd(e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Annual operating cost $">
            <input
              type="number"
              min={0}
              value={annualOperatingCostUsd}
              onChange={(e) => setAnnualOperatingCostUsd(e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Cost of capital %" hint="Also the NPV discount rate">
            <input
              type="number"
              min={0}
              step="0.5"
              value={costOfCapitalPct}
              onChange={(e) => setCostOfCapitalPct(e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Horizon (years)">
            <input
              type="number"
              min={1}
              max={20}
              value={horizonYears}
              onChange={(e) => setHorizonYears(e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field
            label="Tariff trajectory %/yr"
            hint="Relative rate change: 10 turns a 7% rate into 7.7%"
          >
            <input
              type="number"
              step="1"
              value={tariffTrajectoryPctPerYear}
              onChange={(e) => setTariffTrajectoryPctPerYear(e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Volume growth %/yr">
            <input
              type="number"
              step="1"
              value={volumeGrowthPctPerYear}
              onChange={(e) => setVolumeGrowthPctPerYear(e.target.value)}
              className={inputClass}
            />
          </Field>
        </div>

        <button
          type="button"
          onClick={optimize}
          disabled={!canSubmit}
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-ocean-600 hover:bg-ocean-700 disabled:bg-navy-200 disabled:text-navy-400 text-white text-sm font-semibold transition-colors"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Optimizing
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Run FTZ optimizer
            </>
          )}
        </button>

        {error && (
          <div className="mt-4 flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </section>

      {result && <Results result={result} />}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Results
// ─────────────────────────────────────────────────────────────

function Results({ result }: { result: FtzOptimization }) {
  const verdictStyle = VERDICT_STYLES[result.verdict];
  const VerdictIcon = verdictStyle.icon;
  const election = ELECTION_COPY[result.election.election];
  const ElectionIcon = election.icon;

  return (
    <div className="space-y-6">
      {/* Verdict */}
      <section className="bg-white border border-navy-200 rounded-xl p-6">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold tracking-wide ${verdictStyle.chip}`}
          >
            <VerdictIcon className="w-3.5 h-3.5" />
            {result.verdict}
          </span>
          <span className="text-sm text-navy-600">{result.headline}</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-navy-100">
          <Stat
            label="Duty without a zone"
            value={usd(result.baselineAnnualDutyUsd)}
            sub="year one"
          />
          <Stat
            label="Duty in the zone"
            value={usd(result.optimizedAnnualDutyUsd)}
            sub="year one"
            tone="good"
          />
          <Stat
            label="Duty removed"
            value={`${result.dutySavingsPct.toFixed(1)}%`}
            sub={usd(result.baselineAnnualDutyUsd - result.optimizedAnnualDutyUsd)}
            tone="good"
          />
          <Stat
            label={`${result.npv.horizonYears}-year NPV`}
            value={usd(result.npv.npvUsd)}
            sub={
              result.npv.paybackMonths !== null
                ? `payback ${result.npv.paybackMonths} months`
                : "never pays back"
            }
            tone={result.npv.npvUsd > 0 ? "good" : "bad"}
          />
        </div>
      </section>

      {/* Election */}
      <section className="bg-white border border-navy-200 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 shrink-0 rounded-lg bg-ocean-50 flex items-center justify-center">
            <ElectionIcon className="w-5 h-5 text-ocean-600" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold text-navy-900">
                Elect {election.title}
              </h2>
              <span className="text-[10px] uppercase tracking-wide font-bold px-2 py-0.5 rounded-full bg-navy-100 text-navy-600">
                {result.election.confidence} confidence
              </span>
            </div>
            <p className="text-sm text-navy-500 mt-1">{election.blurb}</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Stat
            label="Duty under this election"
            value={usd(result.election.recommendedDutyUsd)}
            sub={`over ${result.npv.horizonYears} years`}
          />
          <Stat
            label="Duty under the alternative"
            value={usd(result.election.alternativeDutyUsd)}
            sub={`over ${result.npv.horizonYears} years`}
          />
          <Stat
            label="Election advantage"
            value={usd(result.election.electionAdvantageUsd)}
            tone="good"
          />
        </div>

        {result.election.rationale.length > 0 && (
          <ul className="mt-4 space-y-2">
            {result.election.rationale.map((line, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-navy-700">
                <ArrowDownRight className="w-4 h-4 mt-0.5 shrink-0 text-ocean-500" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Inverted tariff */}
      <section className="bg-white border border-navy-200 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-1">
          <TrendingDown className="w-5 h-5 text-ocean-600" />
          <h2 className="text-lg font-semibold text-navy-900">Inverted tariff analysis</h2>
        </div>
        <p className="text-sm text-navy-500 mb-4">
          Weighted component rate {pct(result.duty.weightedComponentRatePct)} against a{" "}
          {pct(result.duty.finishedGoodRatePct)} finished-good rate —{" "}
          {result.inversion.spreadPct > 0
            ? `a ${result.inversion.spreadPct.toFixed(2)}pt inversion.`
            : "no inversion."}
        </p>

        {result.inversion.blocked && result.inversion.blockedReason && (
          <div className="mb-4 flex items-start gap-2 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-3">
            <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{result.inversion.blockedReason}</span>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wide text-navy-400 border-b border-navy-100">
                <th className="py-2 pr-3 font-semibold">Component</th>
                <th className="py-2 px-3 font-semibold">HTS</th>
                <th className="py-2 px-3 font-semibold text-right">Annual value</th>
                <th className="py-2 px-3 font-semibold text-right">Rate</th>
                <th className="py-2 px-3 font-semibold text-right">Spread</th>
                <th className="py-2 pl-3 font-semibold text-right">Relief / yr</th>
              </tr>
            </thead>
            <tbody>
              {result.inversion.contributors.map((c) => (
                <tr key={c.id} className="border-b border-navy-50 last:border-0">
                  <td className="py-2 pr-3 text-navy-900">
                    {c.description}
                    {c.pfForced && (
                      <span className="ml-2 inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5">
                        <Lock className="w-2.5 h-2.5" />
                        PF-forced
                      </span>
                    )}
                  </td>
                  <td className="py-2 px-3 text-navy-500 font-mono text-xs">{c.htsCode}</td>
                  <td className="py-2 px-3 text-right text-navy-700">{usd(c.annualValueUsd)}</td>
                  <td className="py-2 px-3 text-right text-navy-700">{pct(c.componentRatePct)}</td>
                  <td
                    className={`py-2 px-3 text-right ${c.spreadPct > 0 ? "text-emerald-700" : "text-navy-400"}`}
                  >
                    {c.spreadPct > 0 ? "+" : ""}
                    {c.spreadPct.toFixed(2)}pt
                  </td>
                  <td
                    className={`py-2 pl-3 text-right font-semibold ${c.annualSavingsUsd > 0 ? "text-emerald-700" : "text-navy-400"}`}
                  >
                    {usd(c.annualSavingsUsd)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Drivers */}
      {result.drivers.length > 0 && (
        <section className="bg-white border border-navy-200 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-navy-900 mb-1">What is driving the number</h2>
          <p className="text-sm text-navy-500 mb-4">Largest lever first.</p>
          <ul className="space-y-2">
            {result.drivers.map((driver, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-navy-700">
                <span className="mt-0.5 w-5 h-5 shrink-0 rounded-full bg-ocean-50 text-ocean-700 text-[11px] font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <span>{driver}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* NPV table */}
      <section className="bg-white border border-navy-200 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-1">
          <Building2 className="w-5 h-5 text-ocean-600" />
          <h2 className="text-lg font-semibold text-navy-900">
            {result.npv.horizonYears}-year cash flow
          </h2>
        </div>
        <p className="text-sm text-navy-500 mb-4">
          Discounted at {result.npv.discountRatePct}% against{" "}
          {usd(result.npv.activationCostUsd)} of activation cost.
          {result.npv.irrPct !== null &&
            // The engine brackets IRR at 200%; anything that saturates it is
            // reported as an open bound rather than a precise-looking 200.0%.
            (result.npv.irrPct >= 200
              ? " IRR above 200%."
              : ` IRR ${result.npv.irrPct.toFixed(1)}%.`)}
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wide text-navy-400 border-b border-navy-100">
                <th className="py-2 pr-3 font-semibold">Year</th>
                <th className="py-2 px-3 font-semibold text-right">Duty saved</th>
                <th className="py-2 px-3 font-semibold text-right">MPF saved</th>
                <th className="py-2 px-3 font-semibold text-right">Deferral</th>
                <th className="py-2 px-3 font-semibold text-right">Operating</th>
                <th className="py-2 px-3 font-semibold text-right">Net</th>
                <th className="py-2 pl-3 font-semibold text-right">Cumulative (disc.)</th>
              </tr>
            </thead>
            <tbody>
              {result.npv.years.map((year) => (
                <tr key={year.year} className="border-b border-navy-50 last:border-0">
                  <td className="py-2 pr-3 text-navy-900 font-medium">{year.year}</td>
                  <td className="py-2 px-3 text-right text-navy-700">{usd(year.dutySavingsUsd)}</td>
                  <td className="py-2 px-3 text-right text-navy-700">{usd(year.mpfSavingsUsd)}</td>
                  <td className="py-2 px-3 text-right text-navy-700">{usd(year.deferralValueUsd)}</td>
                  <td className="py-2 px-3 text-right text-red-600">
                    ({usd(year.operatingCostUsd)})
                  </td>
                  <td
                    className={`py-2 px-3 text-right font-semibold ${year.netBenefitUsd >= 0 ? "text-emerald-700" : "text-red-700"}`}
                  >
                    {usd(year.netBenefitUsd)}
                  </td>
                  <td
                    className={`py-2 pl-3 text-right font-semibold ${year.cumulativeDiscountedUsd >= 0 ? "text-emerald-700" : "text-red-700"}`}
                  >
                    {usd(year.cumulativeDiscountedUsd)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Warnings */}
      {result.warnings.length > 0 && (
        <section className="bg-amber-50 border border-amber-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <h2 className="text-lg font-semibold text-amber-900">Before you act on this</h2>
          </div>
          <ul className="space-y-2">
            {result.warnings.map((warning, i) => (
              <li key={i} className="text-sm text-amber-900 flex items-start gap-2">
                <span className="mt-1.5 w-1 h-1 rounded-full bg-amber-500 shrink-0" />
                <span>{warning}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Disclaimers */}
      <section className="bg-navy-50 border border-navy-200 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-2">
          <Info className="w-4 h-4 text-navy-500" />
          <h3 className="text-sm font-semibold text-navy-700">Compliance notes</h3>
        </div>
        <ul className="space-y-1.5">
          {result.disclaimers.map((line, i) => (
            <li key={i} className="text-xs text-navy-500 leading-relaxed">
              {line}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Shared bits
// ─────────────────────────────────────────────────────────────

const inputClass =
  "w-full px-3 py-2 rounded-lg border border-navy-300 text-sm text-navy-900 bg-white focus:outline-none focus:ring-2 focus:ring-ocean-500/40 focus:border-ocean-500";

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-navy-700 mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </span>
      {children}
      {hint && <span className="block text-[11px] text-navy-400 mt-1">{hint}</span>}
    </label>
  );
}

function Stat({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "good" | "bad";
}) {
  const toneClass =
    tone === "good" ? "text-emerald-700" : tone === "bad" ? "text-red-700" : "text-navy-900";
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wide text-navy-400 font-semibold">{label}</div>
      <div className={`text-xl font-bold mt-0.5 ${toneClass}`}>{value}</div>
      {sub && <div className="text-[11px] text-navy-500 mt-0.5">{sub}</div>}
    </div>
  );
}

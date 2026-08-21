"use client";

/**
 * Rate Negotiation Agent — AI-12020
 *
 * Enter a carrier quote, get a market grade, a counter-offer ladder and a
 * ready-to-send negotiation script. All scoring happens server-side against
 * the FBX benchmark so the numbers here always match the API contract.
 */

import { useState } from "react";
import {
  AlertTriangle,
  Check,
  Copy,
  Gauge,
  Info,
  Loader2,
  MessageSquareQuote,
  Minus,
  Phone,
  Plus,
  Shield,
  TrendingDown,
  TrendingUp,
  Trophy,
} from "lucide-react";
import type {
  NegotiableContainerType,
  NegotiationAnalysis,
  QuoteGrade,
} from "@/lib/negotiation/types";

const CONTAINER_OPTIONS: { value: NegotiableContainerType; label: string }[] = [
  { value: "20GP", label: "20' General Purpose" },
  { value: "40GP", label: "40' General Purpose" },
  { value: "40HC", label: "40' High Cube" },
  { value: "20RF", label: "20' Reefer" },
  { value: "40RF", label: "40' Reefer" },
];

const CONTRACT_OPTIONS = [
  { value: "spot", label: "Spot booking" },
  { value: "90_day", label: "90-day contract" },
  { value: "180_day", label: "180-day contract" },
  { value: "365_day", label: "12-month contract" },
] as const;

const COMMON_SURCHARGES = ["BAF", "THC", "ISPS", "DOC", "ISF", "AMS", "OTHC"];

const GRADE_STYLES: Record<QuoteGrade, { chip: string; ring: string }> = {
  A: { chip: "bg-emerald-100 text-emerald-800 border-emerald-300", ring: "text-emerald-500" },
  B: { chip: "bg-lime-100 text-lime-800 border-lime-300", ring: "text-lime-500" },
  C: { chip: "bg-amber-100 text-amber-800 border-amber-300", ring: "text-amber-500" },
  D: { chip: "bg-orange-100 text-orange-800 border-orange-300", ring: "text-orange-500" },
  F: { chip: "bg-red-100 text-red-800 border-red-300", ring: "text-red-500" },
};

const VERDICT_COPY: Record<string, string> = {
  accept: "Accept",
  negotiate: "Negotiate",
  "strong-negotiate": "Negotiate hard",
  reject: "Re-bid the lane",
};

const STRENGTH_STYLES: Record<string, string> = {
  high: "bg-emerald-50 border-emerald-200 text-emerald-900",
  medium: "bg-sky-50 border-sky-200 text-sky-900",
  low: "bg-navy-50 border-navy-200 text-navy-700",
};

interface LineItemDraft {
  code: string;
  amount: string;
  perShipment: boolean;
}

const usd = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;

export default function RateNegotiationAgent() {
  const [carrier, setCarrier] = useState("");
  const [originPort, setOriginPort] = useState("CNSHA");
  const [destPort, setDestPort] = useState("USLAX");
  const [containerType, setContainerType] = useState<NegotiableContainerType>("40HC");
  const [containerCount, setContainerCount] = useState("10");
  const [baseRate, setBaseRate] = useState("");
  const [contractType, setContractType] =
    useState<(typeof CONTRACT_OPTIONS)[number]["value"]>("90_day");
  const [annualVolume, setAnnualVolume] = useState("");
  const [flexibleDates, setFlexibleDates] = useState(false);
  const [lineItems, setLineItems] = useState<LineItemDraft[]>([
    { code: "BAF", amount: "", perShipment: false },
    { code: "THC", amount: "", perShipment: false },
  ]);
  const [competingCarrier, setCompetingCarrier] = useState("");
  const [competingRate, setCompetingRate] = useState("");
  const [polishWithAi, setPolishWithAi] = useState(false);

  const [analysis, setAnalysis] = useState<NegotiationAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const updateLineItem = (index: number, patch: Partial<LineItemDraft>) => {
    setLineItems((prev) => prev.map((li, i) => (i === index ? { ...li, ...patch } : li)));
  };

  const copy = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied((c) => (c === key ? null : c)), 2000);
    } catch {
      setError("Could not copy to clipboard — select the text and copy it manually.");
    }
  };

  const analyze = async () => {
    setLoading(true);
    setError(null);
    setAnalysis(null);

    const body: Record<string, unknown> = {
      carrier: carrier.trim(),
      originPort: originPort.trim(),
      destPort: destPort.trim(),
      containerType,
      containerCount: Number(containerCount),
      baseRatePerContainer: Number(baseRate),
      contractType,
      flexibleDates,
      polishWithAi,
    };

    const items = lineItems
      .filter((li) => li.code.trim() && li.amount.trim() && Number(li.amount) > 0)
      .map((li) => ({
        code: li.code.trim().toUpperCase(),
        amount: Number(li.amount),
        perShipment: li.perShipment,
      }));
    if (items.length > 0) body.lineItems = items;

    if (annualVolume.trim() && Number(annualVolume) > 0) {
      body.annualFeuVolume = Number(annualVolume);
    }
    if (competingCarrier.trim() && Number(competingRate) > 0) {
      body.competingQuotes = [
        { carrier: competingCarrier.trim(), ratePerContainer: Number(competingRate) },
      ];
    }

    try {
      const res = await fetch("/api/negotiation/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        const detail = Array.isArray(data.details)
          ? ` (${data.details.map((d: { field: string; message: string }) => `${d.field}: ${d.message}`).join(", ")})`
          : "";
        setError(`${data.error ?? "Analysis failed"}${detail}`);
        return;
      }
      setAnalysis(data.analysis as NegotiationAnalysis);
    } catch {
      setError("Could not reach the negotiation service. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const canSubmit =
    carrier.trim().length > 0 &&
    Number(baseRate) > 0 &&
    Number(containerCount) >= 1 &&
    !loading;

  return (
    <div className="space-y-6">
      {/* ── Quote input ─────────────────────────────────────────── */}
      <section className="bg-white border border-navy-200 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-navy-900 mb-1">Carrier quote</h2>
        <p className="text-sm text-navy-500 mb-5">
          Enter the quote exactly as the carrier sent it. Surcharges matter — they are often where
          the padding hides.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="Carrier" required>
            <input
              type="text"
              value={carrier}
              onChange={(e) => setCarrier(e.target.value)}
              placeholder="e.g. Maersk"
              className={inputClass}
            />
          </Field>

          <Field label="Origin port" hint="UN/LOCODE, e.g. CNSHA">
            <input
              type="text"
              value={originPort}
              onChange={(e) => setOriginPort(e.target.value.toUpperCase())}
              className={inputClass}
            />
          </Field>

          <Field label="Destination port" hint="UN/LOCODE, e.g. USLAX">
            <input
              type="text"
              value={destPort}
              onChange={(e) => setDestPort(e.target.value.toUpperCase())}
              className={inputClass}
            />
          </Field>

          <Field label="Container type">
            <select
              value={containerType}
              onChange={(e) => setContainerType(e.target.value as NegotiableContainerType)}
              className={inputClass}
            >
              {CONTAINER_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Containers on this quote">
            <input
              type="number"
              min={1}
              value={containerCount}
              onChange={(e) => setContainerCount(e.target.value)}
              className={inputClass}
            />
          </Field>

          <Field label="Base ocean freight (USD / container)" required>
            <input
              type="number"
              min={0}
              value={baseRate}
              onChange={(e) => setBaseRate(e.target.value)}
              placeholder="e.g. 3200"
              className={inputClass}
            />
          </Field>
        </div>

        {/* Surcharges */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-navy-900">Surcharges & accessorials</h3>
            <button
              type="button"
              onClick={() =>
                setLineItems((prev) => [...prev, { code: "", amount: "", perShipment: false }])
              }
              className="inline-flex items-center gap-1 text-xs font-medium text-ocean-600 hover:text-ocean-700"
            >
              <Plus className="w-3.5 h-3.5" /> Add charge
            </button>
          </div>

          <div className="space-y-2">
            {lineItems.map((li, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="text"
                  list="surcharge-codes"
                  value={li.code}
                  onChange={(e) => updateLineItem(i, { code: e.target.value.toUpperCase() })}
                  placeholder="Code (BAF, THC…)"
                  className={`${inputClass} flex-1`}
                />
                <input
                  type="number"
                  min={0}
                  value={li.amount}
                  onChange={(e) => updateLineItem(i, { amount: e.target.value })}
                  placeholder="USD"
                  className={`${inputClass} w-32`}
                />
                <label className="flex items-center gap-1.5 text-xs text-navy-600 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={li.perShipment}
                    onChange={(e) => updateLineItem(i, { perShipment: e.target.checked })}
                    className="rounded border-navy-300"
                  />
                  per shipment
                </label>
                <button
                  type="button"
                  onClick={() => setLineItems((prev) => prev.filter((_, idx) => idx !== i))}
                  className="p-1.5 text-navy-400 hover:text-red-600"
                  aria-label="Remove charge"
                >
                  <Minus className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <datalist id="surcharge-codes">
            {COMMON_SURCHARGES.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>

        {/* Leverage inputs */}
        <div className="mt-6 pt-6 border-t border-navy-200">
          <h3 className="text-sm font-semibold text-navy-900 mb-3">
            Your leverage <span className="font-normal text-navy-500">(optional, but this is what moves the rate)</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="Contract term">
              <select
                value={contractType}
                onChange={(e) =>
                  setContractType(e.target.value as (typeof CONTRACT_OPTIONS)[number]["value"])
                }
                className={inputClass}
              >
                {CONTRACT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Annual volume (FEU/year)" hint="Powers annualized savings">
              <input
                type="number"
                min={0}
                value={annualVolume}
                onChange={(e) => setAnnualVolume(e.target.value)}
                placeholder="e.g. 800"
                className={inputClass}
              />
            </Field>

            <Field label="Best competing quote (all-in USD / container)">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={competingCarrier}
                  onChange={(e) => setCompetingCarrier(e.target.value)}
                  placeholder="Carrier"
                  className={`${inputClass} flex-1`}
                />
                <input
                  type="number"
                  min={0}
                  value={competingRate}
                  onChange={(e) => setCompetingRate(e.target.value)}
                  placeholder="Rate"
                  className={`${inputClass} w-28`}
                />
              </div>
            </Field>
          </div>

          <div className="flex flex-wrap gap-5 mt-4">
            <label className="flex items-center gap-2 text-sm text-navy-700">
              <input
                type="checkbox"
                checked={flexibleDates}
                onChange={(e) => setFlexibleDates(e.target.checked)}
                className="rounded border-navy-300"
              />
              We can flex sailing dates (+/- 7 days)
            </label>
            <label className="flex items-center gap-2 text-sm text-navy-700">
              <input
                type="checkbox"
                checked={polishWithAi}
                onChange={(e) => setPolishWithAi(e.target.checked)}
                className="rounded border-navy-300"
              />
              Polish the email with AI (numbers stay locked)
            </label>
          </div>
        </div>

        <button
          type="button"
          onClick={analyze}
          disabled={!canSubmit}
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-ocean-600 text-white font-medium text-sm hover:bg-ocean-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Gauge className="w-4 h-4" />}
          {loading ? "Benchmarking…" : "Benchmark this quote"}
        </button>

        {error && (
          <div className="mt-4 flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-800">
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </section>

      {analysis && <AnalysisView analysis={analysis} onCopy={copy} copied={copied} />}
    </div>
  );
}

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

function AnalysisView({
  analysis,
  onCopy,
  copied,
}: {
  analysis: NegotiationAnalysis;
  onCopy: (key: string, text: string) => void;
  copied: string | null;
}) {
  const { score, benchmark, plan, leverage, script, disclaimers } = analysis;
  const gradeStyle = GRADE_STYLES[score.grade];

  return (
    <div className="space-y-6">
      {/* ── Verdict ─────────────────────────────────────────────── */}
      <section className="bg-white border border-navy-200 rounded-xl p-6">
        <div className="flex flex-wrap items-start gap-5">
          <div
            className={`w-20 h-20 shrink-0 rounded-xl border-2 flex flex-col items-center justify-center ${gradeStyle.chip}`}
          >
            <span className="text-3xl font-bold leading-none">{score.grade}</span>
            <span className="text-[10px] font-semibold uppercase tracking-wide mt-1">
              {Math.round(score.percentileRank)}th pct
            </span>
          </div>

          <div className="flex-1 min-w-[260px]">
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${gradeStyle.chip}`}>
                {VERDICT_COPY[score.verdict] ?? score.verdict}
              </span>
              <span className="text-xs text-navy-500">
                benchmarked vs {benchmark.lane.code} · {benchmark.lane.asOf}
              </span>
            </div>
            <p className="text-navy-900 font-medium">{score.headline}</p>
            <p className="text-sm text-navy-500 mt-2 flex items-start gap-1.5">
              {benchmark.trend.direction === "falling" ? (
                <TrendingDown className="w-4 h-4 mt-0.5 shrink-0 text-emerald-600" />
              ) : benchmark.trend.direction === "rising" ? (
                <TrendingUp className="w-4 h-4 mt-0.5 shrink-0 text-amber-600" />
              ) : (
                <Minus className="w-4 h-4 mt-0.5 shrink-0 text-navy-400" />
              )}
              {benchmark.trend.summary}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-navy-200">
          <Stat label="Quoted all-in" value={usd(score.allInPerContainer)} sub="per container" />
          <Stat
            label="Market median"
            value={usd(score.benchmarkPerContainer)}
            sub={`${benchmark.lane.code} 4-wk avg`}
          />
          <Stat
            label="Variance"
            value={`${score.variancePct >= 0 ? "+" : ""}${score.variancePct}%`}
            sub={`${score.varianceUsd >= 0 ? "+" : "-"}${usd(Math.abs(score.varianceUsd))}/container`}
            tone={score.variancePct > 0 ? "bad" : "good"}
          />
          <Stat
            label="Target savings"
            value={usd(plan.expectedSavings.perShipment)}
            sub={
              plan.expectedSavings.annualized !== null
                ? `${usd(plan.expectedSavings.annualized)}/year`
                : "this shipment"
            }
            tone="good"
          />
        </div>
      </section>

      {/* ── Market curve ────────────────────────────────────────── */}
      <section className="bg-white border border-navy-200 rounded-xl p-6">
        <h3 className="text-sm font-semibold text-navy-900 mb-1">
          Where this quote sits on the {benchmark.lane.code} market
        </h3>
        <p className="text-xs text-navy-500 mb-5">{benchmark.matchNote}</p>

        <MarketBar
          percentiles={benchmark.percentiles}
          quoted={score.allInPerContainer}
          target={plan.targetRatePerContainer}
        />

        <div className="grid grid-cols-5 gap-2 mt-4 text-center">
          {(["p10", "p25", "p50", "p75", "p90"] as const).map((k) => (
            <div key={k}>
              <div className="text-[10px] uppercase tracking-wide text-navy-400 font-semibold">
                {k.toUpperCase()}
              </div>
              <div className="text-sm font-semibold text-navy-800">
                {usd(benchmark.percentiles[k])}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Counter-offer ladder ────────────────────────────────── */}
      <section className="bg-white border border-navy-200 rounded-xl p-6">
        <h3 className="text-sm font-semibold text-navy-900 mb-1">Counter-offer ladder</h3>
        <p className="text-xs text-navy-500 mb-5">
          Open at round 1. Land at round 2. Round 3 only if they will not move — above{" "}
          {usd(plan.walkAwayRatePerContainer)} per container, re-bid the lane instead of signing.
        </p>

        <div className="space-y-3">
          {plan.rounds.map((r) => (
            <div
              key={r.round}
              className={`p-4 rounded-lg border ${
                r.round === 2 ? "border-ocean-300 bg-ocean-50" : "border-navy-200 bg-navy-50/50"
              }`}
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="text-sm font-semibold text-navy-900">
                  {r.round}. {r.label}
                </span>
                <span className="text-lg font-bold text-navy-900">
                  {usd(r.ratePerContainer)}
                  <span className="text-xs font-normal text-navy-500"> /container</span>
                </span>
              </div>
              <div className="text-xs text-emerald-700 font-medium mt-0.5">
                saves {usd(r.savingsPerContainer)}/container ({r.savingsPct}%)
              </div>
              <p className="text-sm text-navy-600 mt-2">{r.rationale}</p>
              <p className="text-sm text-navy-800 mt-2">
                <span className="font-medium">Trade:</span> {r.concession}
              </p>
            </div>
          ))}
        </div>

        {score.surchargeFindings.length > 0 && (
          <div className="mt-5 p-4 rounded-lg bg-amber-50 border border-amber-200">
            <h4 className="text-sm font-semibold text-amber-900 flex items-center gap-1.5">
              <Shield className="w-4 h-4" />
              {usd(score.surchargeExcessTotal)}/container of surcharge padding
            </h4>
            <ul className="mt-2 space-y-1">
              {score.surchargeFindings.map((f) => (
                <li key={f.code} className="text-sm text-amber-900">
                  <span className="font-medium">{f.code}</span> quoted at {usd(f.quoted)} vs a
                  typical ceiling of {usd(f.typicalMax)} —{" "}
                  <span className="font-semibold">{usd(f.excess)} over</span>
                  {f.severity === "high" && (
                    <span className="ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-200 text-amber-900">
                      HIGH
                    </span>
                  )}
                </li>
              ))}
            </ul>
            <p className="text-xs text-amber-800 mt-2">
              Usually the easiest yes — a rep can move surcharges without pricing-desk approval.
              Worth {usd(plan.surchargeSavings.perShipment)} on this shipment alone.
            </p>
          </div>
        )}
      </section>

      {/* ── Leverage ────────────────────────────────────────────── */}
      {leverage.length > 0 && (
        <section className="bg-white border border-navy-200 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-navy-900 mb-4 flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-ocean-600" />
            Your leverage, strongest first
          </h3>
          <div className="space-y-2.5">
            {leverage.map((l) => (
              <div key={l.key} className={`p-3 rounded-lg border ${STRENGTH_STYLES[l.strength]}`}>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{l.title}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wide opacity-70">
                    {l.strength}
                  </span>
                </div>
                <p className="text-sm mt-1 opacity-90">{l.detail}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Script ──────────────────────────────────────────────── */}
      <section className="bg-white border border-navy-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-navy-900 flex items-center gap-1.5">
            <MessageSquareQuote className="w-4 h-4 text-ocean-600" />
            Negotiation script
          </h3>
          {script.aiPolished && (
            <span className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded bg-ocean-100 text-ocean-700">
              AI polished
            </span>
          )}
        </div>

        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-navy-500">
              Counter-offer email
            </span>
            <CopyButton
              copiedKey={copied}
              itemKey="email"
              onClick={() => onCopy("email", `Subject: ${script.emailSubject}\n\n${script.emailBody}`)}
            />
          </div>
          <div className="p-4 rounded-lg bg-navy-50 border border-navy-200">
            <div className="text-sm font-semibold text-navy-900 mb-2">
              Subject: {script.emailSubject}
            </div>
            <pre className="text-sm text-navy-800 whitespace-pre-wrap font-sans leading-relaxed">
              {script.emailBody}
            </pre>
          </div>
        </div>

        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-navy-500 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5" /> Call talking points
            </span>
            <CopyButton
              copiedKey={copied}
              itemKey="call"
              onClick={() => onCopy("call", script.callTalkingPoints.map((p, i) => `${i + 1}. ${p}`).join("\n\n"))}
            />
          </div>
          <ol className="space-y-2">
            {script.callTalkingPoints.map((p, i) => (
              <li key={i} className="flex gap-2.5 text-sm text-navy-800">
                <span className="shrink-0 w-5 h-5 rounded-full bg-ocean-100 text-ocean-700 text-xs font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <span>{p}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="mb-5">
          <span className="block text-xs font-semibold uppercase tracking-wide text-navy-500 mb-2">
            When they push back
          </span>
          <div className="space-y-2.5">
            {script.objectionHandling.map((o, i) => (
              <details key={i} className="group rounded-lg border border-navy-200 overflow-hidden">
                <summary className="px-3 py-2.5 text-sm font-medium text-navy-900 cursor-pointer bg-navy-50 hover:bg-navy-100 transition-colors">
                  {o.objection}
                </summary>
                <p className="px-3 py-2.5 text-sm text-navy-700 border-t border-navy-200">
                  {o.response}
                </p>
              </details>
            ))}
          </div>
        </div>

        <div className="p-4 rounded-lg bg-navy-900 text-navy-100">
          <span className="block text-xs font-semibold uppercase tracking-wide text-ocean-300 mb-1.5">
            Your walk-away (BATNA)
          </span>
          <p className="text-sm leading-relaxed">{script.batna}</p>
        </div>
      </section>

      {/* ── Disclaimers ─────────────────────────────────────────── */}
      <section className="rounded-xl border border-navy-200 bg-navy-50/60 p-5">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-navy-600 flex items-center gap-1.5 mb-2">
          <Info className="w-3.5 h-3.5" /> Read this before you quote a number
        </h3>
        <ul className="space-y-1.5">
          {disclaimers.map((d, i) => (
            <li key={i} className="text-xs text-navy-600 leading-relaxed">
              • {d}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function CopyButton({
  itemKey,
  copiedKey,
  onClick,
}: {
  itemKey: string;
  copiedKey: string | null;
  onClick: () => void;
}) {
  const isCopied = copiedKey === itemKey;
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 text-xs font-medium text-ocean-600 hover:text-ocean-700"
    >
      {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      {isCopied ? "Copied" : "Copy"}
    </button>
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

/**
 * Positions the quote and the target on the p10→p90 market band. Anything
 * beyond the band is pinned to the edge so a wildly-off quote still renders
 * inside the bar rather than escaping it.
 */
function MarketBar({
  percentiles,
  quoted,
  target,
}: {
  percentiles: { p10: number; p25: number; p50: number; p75: number; p90: number };
  quoted: number;
  target: number;
}) {
  const lo = percentiles.p10;
  const hi = percentiles.p90;
  const span = Math.max(hi - lo, 1);
  const pos = (v: number) => Math.min(Math.max(((v - lo) / span) * 100, 0), 100);

  return (
    <div className="relative pt-8 pb-6">
      <div className="h-3 rounded-full bg-gradient-to-r from-emerald-400 via-amber-300 to-red-400" />

      {/* Target marker */}
      <div
        className="absolute top-8 -translate-x-1/2 flex flex-col items-center"
        style={{ left: `${pos(target)}%` }}
      >
        <div className="w-0.5 h-3 bg-ocean-600" />
        <span className="mt-0.5 text-[10px] font-semibold text-ocean-700 whitespace-nowrap">
          target {usd(target)}
        </span>
      </div>

      {/* Quote marker */}
      <div
        className="absolute top-0 -translate-x-1/2 flex flex-col items-center"
        style={{ left: `${pos(quoted)}%` }}
      >
        <span className="text-[10px] font-bold text-navy-900 whitespace-nowrap">
          quoted {usd(quoted)}
        </span>
        <div className="w-0.5 h-4 bg-navy-900" />
      </div>
    </div>
  );
}

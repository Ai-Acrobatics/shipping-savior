"use client";

/**
 * Compliance Screening Agent — AI-12017
 *
 * Enter the parties and the commercial invoice lines, get back a pre-departure
 * verdict: denied parties, sanctioned jurisdictions, Section 301, UFLPA and
 * which agencies own the entry.
 *
 * Everything is computed server-side by lib/compliance, so what renders here
 * always matches the API contract. This component collects input and presents
 * the result — it never derives a compliance conclusion of its own.
 */

import { useState } from "react";
import {
  AlertTriangle,
  Building2,
  CalendarClock,
  CheckCircle2,
  FileWarning,
  Info,
  Landmark,
  Loader2,
  Minus,
  Package,
  Plus,
  ShieldAlert,
  ShieldCheck,
  Siren,
  XCircle,
} from "lucide-react";
import type {
  ComplianceFinding,
  ComplianceScreeningResult,
  ComplianceVerdict,
  FindingSeverity,
  PartyRole,
  UflpaRiskBand,
} from "@/lib/compliance/types";
import { PARTY_ROLE_LABELS, SCREEN_LABELS } from "@/lib/compliance/types";

const COUNTRY_OPTIONS = [
  "CN", "VN", "TH", "ID", "KH", "MY", "PH", "MM", "IN", "BD",
  "US", "MX", "CA", "DE", "JP", "KR", "TW", "AU", "GB", "FR",
  "IT", "BR", "TR", "PK", "EG", "RU", "BY", "IR", "KP", "CU", "SY", "UA",
] as const;

const PARTY_ROLES = Object.keys(PARTY_ROLE_LABELS) as PartyRole[];

const VERDICT_STYLES: Record<
  ComplianceVerdict,
  { chip: string; banner: string; icon: typeof CheckCircle2; headline: string }
> = {
  CLEAR: {
    chip: "bg-emerald-100 text-emerald-800 border-emerald-300",
    banner: "bg-emerald-50 border-emerald-200",
    icon: ShieldCheck,
    headline: "Clear to book",
  },
  REVIEW: {
    chip: "bg-amber-100 text-amber-800 border-amber-300",
    banner: "bg-amber-50 border-amber-200",
    icon: AlertTriangle,
    headline: "Clear these before departure",
  },
  BLOCKED: {
    chip: "bg-red-100 text-red-800 border-red-300",
    banner: "bg-red-50 border-red-200",
    icon: Siren,
    headline: "Do not sail",
  },
};

const SEVERITY_STYLES: Record<
  FindingSeverity,
  { chip: string; border: string; icon: typeof XCircle; label: string }
> = {
  block: {
    chip: "bg-red-100 text-red-800 border-red-300",
    border: "border-l-red-500",
    icon: XCircle,
    label: "Blocker",
  },
  warn: {
    chip: "bg-amber-100 text-amber-800 border-amber-300",
    border: "border-l-amber-500",
    icon: AlertTriangle,
    label: "Fix before departure",
  },
  advisory: {
    chip: "bg-navy-100 text-navy-700 border-navy-300",
    border: "border-l-navy-300",
    icon: Info,
    label: "Advisory",
  },
};

const BAND_STYLES: Record<UflpaRiskBand, string> = {
  prohibited: "bg-red-100 text-red-800",
  high: "bg-amber-100 text-amber-800",
  elevated: "bg-yellow-50 text-yellow-800",
  low: "bg-emerald-50 text-emerald-800",
};

interface PartyDraft {
  name: string;
  role: PartyRole;
  country: string;
  address: string;
}

interface LineDraft {
  description: string;
  htsCode: string;
  countryOfOrigin: string;
  valueUsd: string;
  manufacturerName: string;
  manufacturerRegion: string;
  hasSupplyChainTraceability: boolean;
  section301ExclusionClaimed: boolean;
}

const usd = (value: number) => `$${Math.round(value).toLocaleString("en-US")}`;

const emptyParty = (): PartyDraft => ({
  name: "",
  role: "supplier",
  country: "CN",
  address: "",
});

const emptyLine = (): LineDraft => ({
  description: "",
  htsCode: "",
  countryOfOrigin: "CN",
  valueUsd: "",
  manufacturerName: "",
  manufacturerRegion: "",
  hasSupplyChainTraceability: false,
  section301ExclusionClaimed: false,
});

export default function ComplianceScreeningAgent() {
  const [parties, setParties] = useState<PartyDraft[]>([
    { name: "Mekong Textile Export JSC", role: "shipper", country: "VN", address: "Binh Duong, Vietnam" },
    { name: "Harbor Goods LLC", role: "consignee", country: "US", address: "Long Beach, CA" },
  ]);

  const [lines, setLines] = useState<LineDraft[]>([
    {
      description: "Cotton knit shirts",
      htsCode: "6109.10.00",
      countryOfOrigin: "CN",
      valueUsd: "180000",
      manufacturerName: "",
      manufacturerRegion: "",
      hasSupplyChainTraceability: false,
      section301ExclusionClaimed: false,
    },
  ]);

  const [departureDate, setDepartureDate] = useState("");
  const [portOfEntry, setPortOfEntry] = useState("USLAX");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ComplianceScreeningResult | null>(null);

  const updateParty = (index: number, patch: Partial<PartyDraft>) =>
    setParties((prev) => prev.map((party, i) => (i === index ? { ...party, ...patch } : party)));

  const updateLine = (index: number, patch: Partial<LineDraft>) =>
    setLines((prev) => prev.map((line, i) => (i === index ? { ...line, ...patch } : line)));

  const screen = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    const body = {
      parties: parties
        .filter((party) => party.name.trim())
        .map((party) => ({
          name: party.name.trim(),
          role: party.role,
          country: party.country || undefined,
          address: party.address.trim() || undefined,
        })),
      lineItems: lines
        .filter((line) => line.htsCode.trim() && line.description.trim())
        .map((line) => ({
          description: line.description.trim(),
          htsCode: line.htsCode.trim(),
          countryOfOrigin: line.countryOfOrigin,
          valueUsd: Number(line.valueUsd) || 0,
          manufacturerName: line.manufacturerName.trim() || undefined,
          manufacturerRegion: line.manufacturerRegion.trim() || undefined,
          hasSupplyChainTraceability: line.hasSupplyChainTraceability || undefined,
          section301ExclusionClaimed: line.section301ExclusionClaimed || undefined,
        })),
      departureDate: departureDate || undefined,
      portOfEntry: portOfEntry.trim() || undefined,
    };

    try {
      const res = await fetch("/api/compliance/screen", {
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
        setError(`${data.error ?? "Screening failed"}${detail}`);
        return;
      }
      setResult(data.screening as ComplianceScreeningResult);
    } catch {
      setError("Could not reach the compliance screen. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const canSubmit =
    parties.some((party) => party.name.trim()) &&
    lines.some((line) => line.htsCode.trim() && line.description.trim()) &&
    !loading;

  return (
    <div className="space-y-6">
      {/* ── Parties ────────────────────────────────────────── */}
      <section className="bg-white border border-navy-200 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-1">
          <Building2 className="w-4 h-4 text-ocean-600" />
          <h2 className="text-lg font-semibold text-navy-900">Parties to the transaction</h2>
        </div>
        <p className="text-sm text-navy-500 mb-5">
          Every name on the booking. Restricted-party screening is strict liability — the
          forwarder and the factory count, not just the shipper and consignee.
        </p>

        <div className="space-y-3">
          {parties.map((party, index) => (
            <div
              key={index}
              className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end bg-navy-50/50 border border-navy-100 rounded-lg p-3"
            >
              <div className="md:col-span-4">
                <Field label="Legal name" required>
                  <input
                    type="text"
                    value={party.name}
                    onChange={(e) => updateParty(index, { name: e.target.value })}
                    placeholder="As it appears on the commercial invoice"
                    className={inputClass}
                  />
                </Field>
              </div>
              <div className="md:col-span-3">
                <Field label="Role">
                  <select
                    value={party.role}
                    onChange={(e) => updateParty(index, { role: e.target.value as PartyRole })}
                    className={inputClass}
                  >
                    {PARTY_ROLES.map((role) => (
                      <option key={role} value={role}>
                        {PARTY_ROLE_LABELS[role]}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
              <div className="md:col-span-1">
                <Field label="Country">
                  <select
                    value={party.country}
                    onChange={(e) => updateParty(index, { country: e.target.value })}
                    className={inputClass}
                  >
                    {COUNTRY_OPTIONS.map((code) => (
                      <option key={code} value={code}>
                        {code}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
              <div className="md:col-span-3">
                <Field label="Address" hint="Screened for restricted regions">
                  <input
                    type="text"
                    value={party.address}
                    onChange={(e) => updateParty(index, { address: e.target.value })}
                    placeholder="City, province"
                    className={inputClass}
                  />
                </Field>
              </div>
              <div className="md:col-span-1 flex justify-end">
                <button
                  type="button"
                  onClick={() => setParties((prev) => prev.filter((_, i) => i !== index))}
                  disabled={parties.length === 1}
                  className="p-2 text-navy-400 hover:text-red-600 disabled:opacity-30 disabled:hover:text-navy-400 transition-colors"
                  aria-label="Remove party"
                >
                  <Minus className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setParties((prev) => [...prev, emptyParty()])}
          className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-ocean-600 hover:text-ocean-700"
        >
          <Plus className="w-4 h-4" /> Add party
        </button>
      </section>

      {/* ── Line items ─────────────────────────────────────── */}
      <section className="bg-white border border-navy-200 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-1">
          <Package className="w-4 h-4 text-ocean-600" />
          <h2 className="text-lg font-semibold text-navy-900">Commercial invoice lines</h2>
        </div>
        <p className="text-sm text-navy-500 mb-5">
          Classification and origin drive Section 301, UFLPA and which agencies own the entry.
          Naming the factory matters — it is the entity the forced-labour lists are written against.
        </p>

        <div className="space-y-4">
          {lines.map((line, index) => (
            <div key={index} className="bg-navy-50/50 border border-navy-100 rounded-lg p-3 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                <div className="md:col-span-4">
                  <Field label="Description" required>
                    <input
                      type="text"
                      value={line.description}
                      onChange={(e) => updateLine(index, { description: e.target.value })}
                      placeholder="e.g. Cotton knit shirts"
                      className={inputClass}
                    />
                  </Field>
                </div>
                <div className="md:col-span-2">
                  <Field label="HTS code" required>
                    <input
                      type="text"
                      value={line.htsCode}
                      onChange={(e) => updateLine(index, { htsCode: e.target.value })}
                      placeholder="6109.10.00"
                      className={inputClass}
                    />
                  </Field>
                </div>
                <div className="md:col-span-2">
                  <Field label="Origin">
                    <select
                      value={line.countryOfOrigin}
                      onChange={(e) => updateLine(index, { countryOfOrigin: e.target.value })}
                      className={inputClass}
                    >
                      {COUNTRY_OPTIONS.map((code) => (
                        <option key={code} value={code}>
                          {code}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
                <div className="md:col-span-3">
                  <Field label="Entered value (USD)">
                    <input
                      type="number"
                      min={0}
                      value={line.valueUsd}
                      onChange={(e) => updateLine(index, { valueUsd: e.target.value })}
                      className={inputClass}
                    />
                  </Field>
                </div>
                <div className="md:col-span-1 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setLines((prev) => prev.filter((_, i) => i !== index))}
                    disabled={lines.length === 1}
                    className="p-2 text-navy-400 hover:text-red-600 disabled:opacity-30 disabled:hover:text-navy-400 transition-colors"
                    aria-label="Remove line"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                <div className="md:col-span-4">
                  <Field label="Manufacturer" hint="Screened against the UFLPA Entity List">
                    <input
                      type="text"
                      value={line.manufacturerName}
                      onChange={(e) => updateLine(index, { manufacturerName: e.target.value })}
                      placeholder="Factory legal name"
                      className={inputClass}
                    />
                  </Field>
                </div>
                <div className="md:col-span-3">
                  <Field label="Region of manufacture" hint="Province or city">
                    <input
                      type="text"
                      value={line.manufacturerRegion}
                      onChange={(e) => updateLine(index, { manufacturerRegion: e.target.value })}
                      placeholder="e.g. Guangdong"
                      className={inputClass}
                    />
                  </Field>
                </div>
                <div className="md:col-span-5 flex flex-wrap gap-4 pb-1">
                  <Checkbox
                    checked={line.hasSupplyChainTraceability}
                    onChange={(checked) =>
                      updateLine(index, { hasSupplyChainTraceability: checked })
                    }
                    label="Traceability package on file"
                  />
                  <Checkbox
                    checked={line.section301ExclusionClaimed}
                    onChange={(checked) =>
                      updateLine(index, { section301ExclusionClaimed: checked })
                    }
                    label="301 exclusion claimed"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setLines((prev) => [...prev, emptyLine()])}
          className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-ocean-600 hover:text-ocean-700"
        >
          <Plus className="w-4 h-4" /> Add line
        </button>
      </section>

      {/* ── Shipment ───────────────────────────────────────── */}
      <section className="bg-white border border-navy-200 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-1">
          <CalendarClock className="w-4 h-4 text-ocean-600" />
          <h2 className="text-lg font-semibold text-navy-900">Shipment</h2>
        </div>
        <p className="text-sm text-navy-500 mb-5">
          The departure date is what turns a missing agency filing from a to-do into a blocker.
          Leave it blank and lead times are reported without a deadline.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Field label="Departure date">
            <input
              type="date"
              value={departureDate}
              onChange={(e) => setDepartureDate(e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Port of entry" hint="UN/LOCODE">
            <input
              type="text"
              value={portOfEntry}
              onChange={(e) => setPortOfEntry(e.target.value)}
              placeholder="USLAX"
              className={inputClass}
            />
          </Field>
          <div className="flex items-end">
            <button
              type="button"
              onClick={screen}
              disabled={!canSubmit}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-ocean-600 text-white text-sm font-semibold hover:bg-ocean-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Screening
                </>
              ) : (
                <>
                  <ShieldAlert className="w-4 h-4" /> Screen shipment
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            <XCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </section>

      {result && <ScreeningResult result={result} />}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Result
// ─────────────────────────────────────────────────────────────

function ScreeningResult({ result }: { result: ComplianceScreeningResult }) {
  const verdict = VERDICT_STYLES[result.verdict];
  const VerdictIcon = verdict.icon;

  return (
    <div className="space-y-6">
      {/* Verdict */}
      <section className={`border rounded-xl p-6 ${verdict.banner}`}>
        <div className="flex flex-col md:flex-row md:items-center gap-5">
          <div className="flex items-start gap-4 flex-1">
            <VerdictIcon className="w-8 h-8 shrink-0 text-navy-900" />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border ${verdict.chip}`}
                >
                  {result.verdict}
                </span>
                <h2 className="text-xl font-bold text-navy-900">{verdict.headline}</h2>
              </div>
              <p className="text-sm text-navy-700 mt-1.5">{result.summary}</p>
            </div>
          </div>
          <div className="flex gap-6 md:border-l md:border-navy-200 md:pl-6">
            <Stat label="Score" value={`${result.score}`} sub={`Grade ${result.grade}`} />
            <Stat
              label="Exposure"
              value={usd(result.exposure.totalUsd)}
              sub={`on ${usd(result.totalValueUsd)} entered value`}
              tone={result.exposure.totalUsd > 0 ? "bad" : "good"}
            />
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <CountChip count={result.counts.block} label="blocking" tone="block" />
          <CountChip count={result.counts.warn} label="to fix" tone="warn" />
          <CountChip count={result.counts.advisory} label="advisory" tone="advisory" />
        </div>
      </section>

      {/* Coverage — deliberately adjacent to the verdict, not buried. */}
      <section className="bg-navy-50 border border-navy-200 rounded-xl p-4">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 mt-0.5 shrink-0 text-navy-500" />
          <div className="text-xs text-navy-700">
            <span className="font-semibold">Screening coverage: </span>
            {result.coverage.listRecordCount.toLocaleString("en-US")} records across{" "}
            {result.coverage.sources.join(", ")} ({result.coverage.listVersion}).{" "}
            {result.coverage.caveat}
          </div>
        </div>
      </section>

      {/* Exposure breakdown */}
      {result.exposure.basis.length > 0 && (
        <section className="bg-white border border-navy-200 rounded-xl p-6">
          <h3 className="text-base font-semibold text-navy-900 mb-1">Where the exposure comes from</h3>
          <p className="text-sm text-navy-500 mb-4">
            Duty is a cost. Penalty, hold and value-at-risk are what a shipment loses by sailing
            with these findings open.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <Stat label="Additional duty" value={usd(result.exposure.additionalDutyUsd)} />
            <Stat label="Penalty" value={usd(result.exposure.penaltyUsd)} />
            <Stat label="Hold cost" value={usd(result.exposure.holdCostUsd)} />
            <Stat label="Value at risk" value={usd(result.exposure.valueAtRiskUsd)} />
          </div>
          <ul className="space-y-1.5">
            {result.exposure.basis.map((line, i) => (
              <li key={i} className="text-sm text-navy-600 flex gap-2">
                <span className="text-navy-300">—</span>
                {line}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Findings */}
      <section className="bg-white border border-navy-200 rounded-xl p-6">
        <h3 className="text-base font-semibold text-navy-900 mb-4">
          Findings ({result.findings.length})
        </h3>
        {result.findings.length === 0 ? (
          <p className="text-sm text-navy-500">
            Nothing surfaced on the screens run. Read that alongside the coverage note above.
          </p>
        ) : (
          <div className="space-y-3">
            {result.findings.map((finding) => (
              <FindingCard key={finding.id} finding={finding} />
            ))}
          </div>
        )}
      </section>

      {/* Agency routing */}
      {result.screens.pga.requirements.length > 0 && (
        <section className="bg-white border border-navy-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-1">
            <Landmark className="w-4 h-4 text-ocean-600" />
            <h3 className="text-base font-semibold text-navy-900">Agency routing</h3>
          </div>
          <p className="text-sm text-navy-500 mb-4">
            {result.screens.pga.agencies.join(", ")} own this entry.
            {result.screens.pga.daysUntilDeparture !== null && (
              <>
                {" "}
                Departure is {result.screens.pga.daysUntilDeparture} day
                {result.screens.pga.daysUntilDeparture === 1 ? "" : "s"} out; the longest missing
                lead time is {result.screens.pga.maxLeadTimeDays} days.
              </>
            )}
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wide text-navy-400 border-b border-navy-200">
                  <th className="py-2 pr-3 font-semibold">Agency</th>
                  <th className="py-2 pr-3 font-semibold">Filing</th>
                  <th className="py-2 pr-3 font-semibold">Line</th>
                  <th className="py-2 pr-3 font-semibold">Lead time</th>
                  <th className="py-2 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {result.screens.pga.requirements.map((hit, i) => (
                  <tr key={`${hit.code}-${hit.lineIndex}-${i}`} className="border-b border-navy-100 last:border-0">
                    <td className="py-2 pr-3 font-medium text-navy-900">{hit.agency}</td>
                    <td className="py-2 pr-3 text-navy-700">
                      {hit.filing}
                      {hit.form && <span className="text-navy-400"> · {hit.form}</span>}
                    </td>
                    <td className="py-2 pr-3 text-navy-500">{hit.htsCode}</td>
                    <td className="py-2 pr-3 text-navy-700">{hit.leadTimeDays}d</td>
                    <td className="py-2">
                      {hit.onFile ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 text-xs font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" /> On file
                        </span>
                      ) : (
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-semibold ${
                            hit.mandatory ? "text-red-700" : "text-amber-700"
                          }`}
                        >
                          <FileWarning className="w-3.5 h-3.5" />
                          {hit.mandatory ? "Required" : "Check"}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Section 301 */}
      {result.screens.section301.linesInScope > 0 && (
        <section className="bg-white border border-navy-200 rounded-xl p-6">
          <h3 className="text-base font-semibold text-navy-900 mb-4">Section 301 detail</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wide text-navy-400 border-b border-navy-200">
                  <th className="py-2 pr-3 font-semibold">Line</th>
                  <th className="py-2 pr-3 font-semibold">HTS</th>
                  <th className="py-2 pr-3 font-semibold">Origin</th>
                  <th className="py-2 pr-3 font-semibold">List</th>
                  <th className="py-2 pr-3 font-semibold">Rate</th>
                  <th className="py-2 font-semibold">Additional duty</th>
                </tr>
              </thead>
              <tbody>
                {result.screens.section301.lines
                  .filter((line) => line.additionalRatePct > 0)
                  .map((line) => (
                    <tr key={line.lineIndex} className="border-b border-navy-100 last:border-0">
                      <td className="py-2 pr-3 text-navy-900">{line.description}</td>
                      <td className="py-2 pr-3 text-navy-500">{line.htsCode}</td>
                      <td className="py-2 pr-3 text-navy-500">{line.countryOfOrigin}</td>
                      <td className="py-2 pr-3 text-navy-600">{line.list}</td>
                      <td className="py-2 pr-3 text-navy-700">+{line.additionalRatePct}%</td>
                      <td className="py-2 font-semibold text-navy-900">
                        {line.exclusionClaimed ? (
                          <span className="text-amber-700">Exclusion claimed</span>
                        ) : (
                          usd(line.additionalDutyUsd)
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* UFLPA */}
      {result.screens.uflpa.lines.some((line) => line.band !== "low") && (
        <section className="bg-white border border-navy-200 rounded-xl p-6">
          <h3 className="text-base font-semibold text-navy-900 mb-1">Forced-labour risk by line</h3>
          <p className="text-sm text-navy-500 mb-4">
            UFLPA reaches inputs &quot;wholly or in part&quot; from the XUAR, so a third-country
            assembly point does not by itself clear a line.
          </p>
          <div className="space-y-2">
            {result.screens.uflpa.lines
              .filter((line) => line.band !== "low")
              .map((line) => (
                <div
                  key={line.lineIndex}
                  className="flex flex-col md:flex-row md:items-start gap-2 md:gap-4 border border-navy-100 rounded-lg p-3"
                >
                  <div className="md:w-56 shrink-0">
                    <div className="font-medium text-navy-900 text-sm">{line.description}</div>
                    <div className="text-xs text-navy-400">
                      {line.htsCode} · {line.countryOfOrigin}
                    </div>
                    <span
                      className={`inline-block mt-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${BAND_STYLES[line.band]}`}
                    >
                      {line.band}
                    </span>
                  </div>
                  <div className="flex-1 text-sm text-navy-600 space-y-1">
                    {line.reasons.map((reason, i) => (
                      <p key={i}>{reason}</p>
                    ))}
                    {line.valueAtRiskUsd > 0 && (
                      <p className="text-red-700 font-medium">
                        {usd(line.valueAtRiskUsd)} of entered value exposed to detention.
                      </p>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </section>
      )}

      {/* Action plan */}
      {result.actionPlan.length > 0 && (
        <section className="bg-navy-900 rounded-xl p-6">
          <h3 className="text-base font-semibold text-white mb-3">What to do next</h3>
          <ol className="space-y-2">
            {result.actionPlan.map((step, i) => (
              <li key={i} className="flex gap-3 text-sm text-navy-100">
                <span className="shrink-0 w-5 h-5 rounded-full bg-navy-700 text-white text-[11px] font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
}

function FindingCard({ finding }: { finding: ComplianceFinding }) {
  const style = SEVERITY_STYLES[finding.severity];
  const Icon = style.icon;

  return (
    <div className={`border border-navy-100 border-l-4 ${style.border} rounded-lg p-4`}>
      <div className="flex items-start gap-3">
        <Icon className="w-4 h-4 mt-0.5 shrink-0 text-navy-500" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${style.chip}`}>
              {style.label}
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wide text-navy-400">
              {SCREEN_LABELS[finding.screen]}
            </span>
            {finding.confidencePct !== undefined && (
              <span className="text-[10px] text-navy-400">{finding.confidencePct}% match</span>
            )}
          </div>
          <h4 className="font-semibold text-navy-900 text-sm">{finding.title}</h4>
          <p className="text-sm text-navy-600 mt-1">{finding.detail}</p>
          <p className="text-sm text-navy-800 mt-2">
            <span className="font-semibold">Next: </span>
            {finding.remediation}
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-[11px] text-navy-400">
            <span>{finding.authority}</span>
            <span>{finding.subject.label}</span>
            {finding.exposureUsd !== undefined && <span>{usd(finding.exposureUsd)} at stake</span>}
            {finding.evidence?.map((item, i) => (
              <span key={i}>{item}</span>
            ))}
          </div>
        </div>
      </div>
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

function Checkbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <label className="inline-flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 rounded border-navy-300 text-ocean-600 focus:ring-ocean-500/40"
      />
      <span className="text-xs text-navy-700">{label}</span>
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

function CountChip({
  count,
  label,
  tone,
}: {
  count: number;
  label: string;
  tone: FindingSeverity;
}) {
  const style = SEVERITY_STYLES[tone];
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${style.chip}`}>
      {count} {label}
    </span>
  );
}

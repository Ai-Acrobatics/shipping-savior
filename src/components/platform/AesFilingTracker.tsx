"use client";

import { useState } from "react";
import { Check, Copy, ExternalLink, FileCheck2, X } from "lucide-react";
import {
  AES_PROGRESS,
  AES_STATUSES,
  AES_STATUS_LABELS,
  aceLinksFor,
  isItn,
  readAesFiling,
  type AesFiling,
  type AesStatus,
} from "@/lib/shipments/aes";

/**
 * AES / EEI filing tracker card on the shipment detail page (AI-12006).
 *
 * Shows TBD -> Filed -> Accepted progress, the ITN, and the CBP ACE link for
 * the next action. Edits go through the authed, org-scoped
 * PATCH /api/shipments/[id], which enforces the invariants (accepted needs an
 * ITN, exempt needs a citation) — this component only mirrors them for UX.
 */

interface Props {
  shipmentId: string;
  initialImportMeta: unknown;
}

const STATUS_BADGE: Record<AesStatus, string> = {
  tbd: "bg-amber-100 text-amber-700 border-amber-200",
  filed: "bg-sky-100 text-sky-700 border-sky-200",
  accepted: "bg-emerald-100 text-emerald-700 border-emerald-200",
  rejected: "bg-red-100 text-red-700 border-red-200",
  exempt: "bg-navy-100 text-navy-600 border-navy-200",
};

function fmtDate(iso: string | null) {
  if (!iso) return null;
  const d = new Date(iso);
  return isNaN(d.getTime())
    ? null
    : d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function AesFilingTracker({ shipmentId, initialImportMeta }: Props) {
  const [filing, setFiling] = useState<AesFiling>(() => readAesFiling(initialImportMeta));
  const [status, setStatus] = useState<AesStatus>(filing.status);
  const [aesNumber, setAesNumber] = useState(filing.aesNumber ?? "");
  const [exemption, setExemption] = useState(filing.exemption ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const dirty =
    status !== filing.status ||
    !filing.explicit ||
    aesNumber.trim() !== (filing.aesNumber ?? "") ||
    exemption.trim() !== (filing.exemption ?? "");

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/shipments/${shipmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          aesStatus: status,
          aesNumber: aesNumber.trim() || null,
          aesExemption: exemption.trim() || null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Failed to save AES filing");
        return;
      }
      const next = readAesFiling(data.shipment?.importMeta);
      setFiling(next);
      setStatus(next.status);
      setAesNumber(next.aesNumber ?? "");
      setExemption(next.exemption ?? "");
    } catch {
      setError("Failed to save AES filing");
    } finally {
      setSaving(false);
    }
  }

  async function copyItn() {
    if (!filing.aesNumber) return;
    try {
      await navigator.clipboard.writeText(filing.aesNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable — the ITN is still visible to select */
    }
  }

  const links = aceLinksFor(filing);
  const progressIndex =
    filing.status === "rejected" ? 1 : AES_PROGRESS.indexOf(filing.status);
  const itnWarning = aesNumber.trim() && !isItn(aesNumber.trim().toUpperCase());

  return (
    <div className="card rounded-2xl p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-navy-500">
          <FileCheck2 className="h-4 w-4" />
          AES Filing (EEI)
        </h2>
        <span
          className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${STATUS_BADGE[filing.status]}`}
        >
          {AES_STATUS_LABELS[filing.status]}
          {!filing.explicit && filing.status !== "tbd" && " (from AES #)"}
        </span>
      </div>

      {/* Progress: TBD -> Filed -> Accepted. Exempt skips the track entirely. */}
      {filing.status === "exempt" ? (
        <p className="mb-5 text-sm text-navy-600">
          No EEI filing required — exemption{" "}
          <span className="font-mono font-semibold">{filing.exemption}</span>.
        </p>
      ) : (
        <ol className="mb-5 flex items-center gap-2">
          {AES_PROGRESS.map((step, i) => {
            const done = i < progressIndex || (i === progressIndex && step === "accepted");
            const current = i === progressIndex;
            const failed = current && filing.status === "rejected";
            const date =
              step === "filed"
                ? fmtDate(filing.filedAt)
                : step === "accepted"
                  ? fmtDate(filing.acceptedAt)
                  : null;
            return (
              <li key={step} className="flex flex-1 items-center gap-2">
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold ${
                    failed
                      ? "border-red-300 bg-red-100 text-red-700"
                      : done
                        ? "border-emerald-300 bg-emerald-100 text-emerald-700"
                        : current
                          ? "border-ocean-400 bg-ocean-50 text-ocean-700"
                          : "border-navy-200 bg-white text-navy-400"
                  }`}
                >
                  {failed ? <X className="h-3.5 w-3.5" /> : done ? <Check className="h-3.5 w-3.5" /> : i + 1}
                </span>
                <span className="min-w-0">
                  <span className="block text-xs font-medium text-navy-700">
                    {failed ? "Rejected" : AES_STATUS_LABELS[step]}
                  </span>
                  {date && <span className="block text-[11px] text-navy-400">{date}</span>}
                </span>
                {i < AES_PROGRESS.length - 1 && (
                  <span className={`h-px flex-1 ${i < progressIndex ? "bg-emerald-300" : "bg-navy-200"}`} />
                )}
              </li>
            );
          })}
        </ol>
      )}

      {filing.aesNumber && (
        <div className="mb-5 flex items-center gap-2 text-sm">
          <span className="text-xs font-medium uppercase tracking-wide text-navy-400">ITN</span>
          <span className="font-mono font-semibold text-navy-800">{filing.aesNumber}</span>
          <button
            type="button"
            onClick={copyItn}
            className="inline-flex items-center gap-1 rounded border border-navy-200 px-1.5 py-0.5 text-xs text-navy-500 hover:border-ocean-400 hover:text-ocean-700"
          >
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      )}

      {/* CBP ACE deep links — primary next action first. */}
      <div className="mb-5 flex flex-wrap gap-2">
        {links.map((l) => (
          <a
            key={l.label}
            href={l.href}
            target="_blank"
            rel="noopener noreferrer"
            className={
              l.primary
                ? "inline-flex items-center gap-1.5 rounded-lg bg-ocean-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-ocean-700"
                : "inline-flex items-center gap-1.5 rounded-lg border border-navy-200 px-3 py-1.5 text-sm font-medium text-navy-700 hover:border-ocean-400 hover:bg-ocean-50 hover:text-ocean-700"
            }
          >
            {l.label}
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        ))}
      </div>

      {/* Edit */}
      <div className="grid grid-cols-1 gap-3 border-t border-navy-100 pt-4 sm:grid-cols-3">
        <label className="text-xs font-medium uppercase tracking-wide text-navy-400">
          Status
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as AesStatus)}
            className="mt-1 block w-full rounded-lg border border-navy-200 px-2 py-1.5 text-sm normal-case tracking-normal text-navy-800"
          >
            {AES_STATUSES.map((s) => (
              <option key={s} value={s}>
                {AES_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-medium uppercase tracking-wide text-navy-400">
          AES # / ITN
          <input
            value={aesNumber}
            onChange={(e) => setAesNumber(e.target.value)}
            placeholder="X20250930123456"
            className="mt-1 block w-full rounded-lg border border-navy-200 px-2 py-1.5 font-mono text-sm normal-case tracking-normal text-navy-800"
          />
          {itnWarning && (
            <span className="mt-1 block text-[11px] normal-case tracking-normal text-amber-600">
              Doesn&apos;t look like an ITN (X + 14 digits)
            </span>
          )}
        </label>
        {status === "exempt" && (
          <label className="text-xs font-medium uppercase tracking-wide text-navy-400">
            Exemption citation
            <input
              value={exemption}
              onChange={(e) => setExemption(e.target.value)}
              placeholder="NOEEI 30.37(a)"
              className="mt-1 block w-full rounded-lg border border-navy-200 px-2 py-1.5 font-mono text-sm normal-case tracking-normal text-navy-800"
            />
          </label>
        )}
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={save}
          disabled={saving || !dirty}
          className="rounded-lg bg-navy-800 px-4 py-1.5 text-sm font-medium text-white hover:bg-navy-900 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {saving ? "Saving…" : "Save AES filing"}
        </button>
      </div>
    </div>
  );
}

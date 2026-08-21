"use client";

/**
 * Customs broker handoff — AI-12018
 *
 * The last step on the Trade Documents page: take the set that was just read
 * and reconciled, and hand it to the human who files the entry.
 *
 * Two things this panel is careful about:
 *
 *   * It will not offer to send a set with unresolved blockers until the user
 *     ticks an explicit acknowledgement. Sending a broker a package that reads
 *     like a delivery receipt while the ISF is late is the exact failure the
 *     document pipeline exists to prevent.
 *   * The share link is shown exactly once. The server never returns a live
 *     token again — losing the URL means issuing a new link, which is the
 *     recoverable outcome. A list endpoint that hands out live tokens is not.
 */

import { useCallback, useMemo, useState } from "react";
import {
  AlertTriangle,
  Check,
  Copy,
  Link2,
  Loader2,
  Send,
  ShieldOff,
} from "lucide-react";
import type { ReconciliationReport, ShipmentProfile } from "@/lib/documents/types";

export interface HandoffCandidate {
  documentId: string | null;
  fileName: string;
  label: string;
  blockerCount: number;
}

const EXPIRY_OPTIONS = [
  { hours: 24, label: "24 hours" },
  { hours: 72, label: "3 days" },
  { hours: 168, label: "7 days" },
  { hours: 336, label: "14 days" },
];

interface CreatedHandoff {
  handoffId: string;
  shareUrl: string;
  expiresAt: string;
  fileName: string;
  sizeBytes: number;
  clearedToFile: boolean;
  releasedWithBlockers: boolean;
  blockerCount: number;
  warningCount: number;
  omissions: Array<{ key: string; reason: string }>;
}

export default function BrokerHandoffPanel({
  documents,
  profile,
  report,
}: {
  documents: HandoffCandidate[];
  profile: ShipmentProfile;
  report: ReconciliationReport | null;
}) {
  const [brokerName, setBrokerName] = useState("");
  const [brokerEmail, setBrokerEmail] = useState("");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [expiresInHours, setExpiresInHours] = useState(72);
  const [acknowledge, setAcknowledge] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<CreatedHandoff | null>(null);
  const [copied, setCopied] = useState(false);
  const [revoked, setRevoked] = useState(false);

  const documentIds = useMemo(
    () => documents.map((d) => d.documentId).filter((id): id is string => !!id),
    [documents]
  );
  // Packaging works from stored documents. Anything that failed to persist has
  // no original in blob storage to attach, so it cannot be handed over.
  const unstoredCount = documents.length - documentIds.length;

  const blockerCount = useMemo(() => {
    const fromDocuments = documents.reduce((total, d) => total + d.blockerCount, 0);
    const fromReconciliation = report
      ? report.findings.filter((f) => f.severity === "blocker").length +
        report.missingDocuments.length
      : 0;
    return fromDocuments + fromReconciliation;
  }, [documents, report]);

  const needsAcknowledgement = blockerCount > 0;
  const canSend = documentIds.length > 0 && (!needsAcknowledgement || acknowledge) && !sending;

  const send = useCallback(async () => {
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/handoff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentIds,
          profile,
          expiresInHours,
          reference: reference.trim() || undefined,
          brokerName: brokerName.trim() || undefined,
          brokerEmail: brokerEmail.trim() || undefined,
          notes: notes.trim() || undefined,
          acknowledgeBlockers: needsAcknowledgement ? acknowledge : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error ?? "The handoff package could not be created.");
        return;
      }
      setCreated(data as CreatedHandoff);
      setRevoked(false);
      setCopied(false);
    } catch {
      setError("Could not reach the handoff service. Check your connection and try again.");
    } finally {
      setSending(false);
    }
  }, [
    acknowledge,
    brokerEmail,
    brokerName,
    documentIds,
    expiresInHours,
    needsAcknowledgement,
    notes,
    profile,
    reference,
  ]);

  const revoke = useCallback(async () => {
    if (!created) return;
    try {
      const res = await fetch("/api/handoff/revoke", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handoffId: created.handoffId }),
      });
      if (res.ok) setRevoked(true);
      else setError("The link could not be revoked. Try again.");
    } catch {
      setError("Could not reach the handoff service.");
    }
  }, [created]);

  const copy = useCallback(async () => {
    if (!created) return;
    try {
      await navigator.clipboard.writeText(created.shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setError("Copying failed — select the link and copy it manually.");
    }
  }, [created]);

  return (
    <div className="mt-6 pt-6 border-t border-navy-100">
      <div className="flex items-center gap-2 mb-1">
        <Send className="w-5 h-5 text-ocean-600" />
        <h3 className="text-base font-semibold text-navy-900">Hand off to a customs broker</h3>
      </div>
      <p className="text-sm text-navy-500 mb-5">
        Packages the whole set as one ZIP with a cover sheet on top — what needs fixing, what the
        shipment is, and every original — behind a link that expires.
      </p>

      {unstoredCount > 0 && (
        <div className="mb-4 flex items-start gap-2 text-sm text-amber-900 bg-amber-50 border border-amber-200 rounded-lg p-3">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>
            {unstoredCount} document{unstoredCount === 1 ? "" : "s"} could not be saved to the
            library and will not be included. Re-upload {unstoredCount === 1 ? "it" : "them"} before
            sending.
          </span>
        </div>
      )}

      {!created && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <label className="block">
              <span className="block text-xs font-medium text-navy-700 mb-1.5">Broker name</span>
              <input
                type="text"
                value={brokerName}
                onChange={(e) => setBrokerName(e.target.value)}
                placeholder="Acme Customs Brokerage"
                className="w-full px-3 py-2 rounded-lg border border-navy-300 text-sm text-navy-900 bg-white focus:outline-none focus:ring-2 focus:ring-ocean-500/40 focus:border-ocean-500"
              />
            </label>
            <label className="block">
              <span className="block text-xs font-medium text-navy-700 mb-1.5">Broker email</span>
              <input
                type="email"
                value={brokerEmail}
                onChange={(e) => setBrokerEmail(e.target.value)}
                placeholder="entry@acmecustoms.com"
                className="w-full px-3 py-2 rounded-lg border border-navy-300 text-sm text-navy-900 bg-white focus:outline-none focus:ring-2 focus:ring-ocean-500/40 focus:border-ocean-500"
              />
            </label>
            <label className="block">
              <span className="block text-xs font-medium text-navy-700 mb-1.5">
                Your reference <span className="text-navy-400 font-normal">(optional)</span>
              </span>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="SS-2026-0412"
                className="w-full px-3 py-2 rounded-lg border border-navy-300 text-sm text-navy-900 bg-white focus:outline-none focus:ring-2 focus:ring-ocean-500/40 focus:border-ocean-500"
              />
            </label>
            <label className="block">
              <span className="block text-xs font-medium text-navy-700 mb-1.5">Link expires in</span>
              <select
                value={expiresInHours}
                onChange={(e) => setExpiresInHours(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-navy-300 text-sm text-navy-900 bg-white focus:outline-none focus:ring-2 focus:ring-ocean-500/40 focus:border-ocean-500"
              >
                {EXPIRY_OPTIONS.map((o) => (
                  <option key={o.hours} value={o.hours}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="block mb-4">
            <span className="block text-xs font-medium text-navy-700 mb-1.5">
              Note for the broker <span className="text-navy-400 font-normal">(optional)</span>
            </span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              maxLength={2000}
              placeholder="Anything the cover sheet should say — special instructions, who to call, what changed since the last package."
              className="w-full px-3 py-2 rounded-lg border border-navy-300 text-sm text-navy-900 bg-white focus:outline-none focus:ring-2 focus:ring-ocean-500/40 focus:border-ocean-500"
            />
          </label>

          {needsAcknowledgement && (
            <label className="flex items-start gap-3 cursor-pointer bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <input
                type="checkbox"
                checked={acknowledge}
                onChange={(e) => setAcknowledge(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-red-300 text-red-600 focus:ring-red-500"
              />
              <span className="text-sm text-red-900">
                <span className="font-medium">
                  Send anyway with {blockerCount} unresolved blocker
                  {blockerCount === 1 ? "" : "s"}
                </span>
                <span className="block text-xs mt-0.5 text-red-800/90">
                  The cover sheet will say so in the first line the broker reads. Acknowledging a
                  blocker does not clear it.
                </span>
              </span>
            </label>
          )}

          {error && (
            <div className="mb-4 flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="button"
            onClick={send}
            disabled={!canSend}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-ocean-600 hover:bg-ocean-700 disabled:bg-navy-200 disabled:text-navy-400 text-white text-sm font-semibold transition-colors"
          >
            {sending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Building package
              </>
            ) : (
              <>
                <Link2 className="w-4 h-4" />
                Create handoff link for {documentIds.length} document
                {documentIds.length === 1 ? "" : "s"}
              </>
            )}
          </button>
        </>
      )}

      {created && (
        <div className="space-y-4">
          <div
            className={`text-sm border rounded-lg p-3 ${
              revoked
                ? "bg-navy-50 border-navy-200 text-navy-700"
                : created.releasedWithBlockers
                  ? "bg-red-50 border-red-200 text-red-900"
                  : "bg-emerald-50 border-emerald-200 text-emerald-900"
            }`}
          >
            {revoked
              ? "This link has been revoked. The broker now sees a revocation notice instead of the package."
              : created.releasedWithBlockers
                ? `Package created and released with ${created.blockerCount} unresolved blocker${
                    created.blockerCount === 1 ? "" : "s"
                  }. The cover sheet says so at the top.`
                : "Package created. Every document validates and the set agrees with itself."}
          </div>

          {!revoked && (
            <>
              <div>
                <span className="block text-xs font-medium text-navy-700 mb-1.5">
                  Share link — shown once, so copy it now
                </span>
                <div className="flex gap-2">
                  <input
                    readOnly
                    value={created.shareUrl}
                    onFocus={(e) => e.currentTarget.select()}
                    className="flex-1 min-w-0 px-3 py-2 rounded-lg border border-navy-300 text-sm text-navy-900 bg-navy-50 font-mono"
                  />
                  <button
                    type="button"
                    onClick={copy}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-navy-900 hover:bg-navy-800 text-white text-sm font-semibold transition-colors shrink-0"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>
                <p className="text-[11px] text-navy-400 mt-2">
                  {created.fileName} · {(created.sizeBytes / 1024 / 1024).toFixed(1)} MB · expires{" "}
                  {new Date(created.expiresAt).toISOString().replace("T", " ").slice(0, 16)} UTC
                </p>
              </div>

              {created.omissions.length > 0 && (
                <div className="text-sm text-amber-900 bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <div className="font-medium mb-1">
                    {created.omissions.length} original
                    {created.omissions.length === 1 ? " was" : "s were"} not attached
                  </div>
                  <ul className="list-disc pl-5 space-y-0.5 text-xs">
                    {created.omissions.map((o) => (
                      <li key={o.key}>{o.reason}</li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                type="button"
                onClick={revoke}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-red-200 text-red-700 hover:bg-red-50 text-sm font-semibold transition-colors"
              >
                <ShieldOff className="w-4 h-4" />
                Revoke this link
              </button>
            </>
          )}

          <button
            type="button"
            onClick={() => {
              setCreated(null);
              setRevoked(false);
              setAcknowledge(false);
            }}
            className="block text-sm text-ocean-700 hover:text-ocean-800 font-medium"
          >
            Create another handoff package
          </button>
        </div>
      )}
    </div>
  );
}

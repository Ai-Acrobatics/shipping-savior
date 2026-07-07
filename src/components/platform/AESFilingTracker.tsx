"use client";

/**
 * AESFilingTracker — inline AES status + CBP ACE deep link management.
 *
 * AI-12006: Per-shipment AES status (TBD → Filed → Accepted) with CBP ACE deep links.
 * Renders a compact card with status badge, AES number, and editable ACE link.
 */

import { useState } from "react";
import {
  FileText,
  CheckCircle2,
  Clock,
  Shield,
  ExternalLink,
  Loader2,
  Pencil,
  X,
  Check,
} from "lucide-react";

interface Props {
  shipmentId: string;
  aesStatus: string | null;
  aesNumber: string | null;
  aceDeepLink: string | null;
}

const STATUS_META: Record<string, { label: string; classes: string; icon: typeof Shield }> = {
  tbd: { label: "TBD — Not yet filed", classes: "bg-amber-50 text-amber-700 border-amber-200", icon: Clock },
  filed: { label: "Filed with CBP", classes: "bg-sky-50 text-sky-700 border-sky-200", icon: FileText },
  accepted: { label: "Accepted by CBP", classes: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
};

export default function AESFilingTracker({ shipmentId, aesStatus: initialStatus, aesNumber: initialNumber, aceDeepLink: initialLink }: Props) {
  const [status, setStatus] = useState<string>(initialStatus || "tbd");
  const [aesNumber, setAesNumber] = useState<string>(initialNumber || "");
  const [aceLink, setAceLink] = useState<string>(initialLink || "");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // local edit state
  const [editStatus, setEditStatus] = useState(status);
  const [editNumber, setEditNumber] = useState(aesNumber);
  const [editLink, setEditLink] = useState(aceLink);

  const meta = STATUS_META[status] || STATUS_META.tbd;
  const Icon = meta.icon;

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`/api/shipments/${shipmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          aesStatus: editStatus,
          aesNumber: editNumber || null,
          aceDeepLink: editLink || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update");
      }
      setStatus(editStatus);
      setAesNumber(editNumber);
      setAceLink(editLink);
      setEditing(false);
      setSuccess("AES status updated");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditStatus(status);
    setEditNumber(aesNumber);
    setEditLink(aceLink);
    setEditing(false);
    setError(null);
  };

  const aceUrl = aceLink
    ? aceLink.startsWith("http")
      ? aceLink
      : `https://ace.cbp.dhs.gov/acexpub/acexpub_Apps/ExParties/exportInquiry/index.php?action=details&itn=${aceLink}`
    : null;

  return (
    <div className="card rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-navy-500" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-navy-500">
            AES Filing Tracker
          </h2>
          {!editing && (
            <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${meta.classes}`}>
              <Icon className="h-3 w-3" />
              {meta.label}
            </span>
          )}
        </div>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-navy-200 px-3 py-1 text-xs font-medium text-navy-600 hover:border-ocean-400 hover:bg-ocean-50 hover:text-ocean-700 transition-colors"
          >
            <Pencil className="h-3 w-3" />
            Edit
          </button>
        )}
      </div>

      {/* Notifications */}
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)}><X className="h-3 w-3" /></button>
        </div>
      )}
      {success && (
        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700 flex items-center gap-1.5">
          <CheckCircle2 className="h-3 w-3" />
          {success}
        </div>
      )}

      {editing ? (
        /* Edit mode */
        <div className="space-y-4">
          {/* Status dropdown */}
          <div>
            <label className="block text-xs font-medium text-navy-600 mb-1">AES Status</label>
            <div className="relative">
              <select
                className="input-light appearance-none pr-8"
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
              >
                <option value="tbd">TBD — Not yet filed</option>
                <option value="filed">Filed with CBP</option>
                <option value="accepted">Accepted by CBP</option>
              </select>
            </div>
          </div>

          {/* AES Number */}
          <div>
            <label className="block text-xs font-medium text-navy-600 mb-1">
              AES ITN / XTN Number
            </label>
            <input
              className="input-light"
              placeholder="e.g. X20260706123456"
              value={editNumber}
              onChange={(e) => setEditNumber(e.target.value)}
            />
          </div>

          {/* ACE Deep Link */}
          <div>
            <label className="block text-xs font-medium text-navy-600 mb-1">
              CBP ACE Deep Link or ITN
            </label>
            <input
              className="input-light"
              placeholder="https://ace.cbp.dhs.gov/... or ITN reference"
              value={editLink}
              onChange={(e) => setEditLink(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-navy-100">
            <button
              onClick={handleCancel}
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-navy-600 hover:bg-navy-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-lg bg-ocean-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-ocean-600 disabled:opacity-50 transition-colors"
            >
              {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
              Save
            </button>
          </div>
        </div>
      ) : (
        /* View mode */
        <div className="space-y-3">
          {aesNumber && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-navy-500">AES#:</span>
              <span className="font-mono text-sm font-semibold text-navy-800">{aesNumber}</span>
            </div>
          )}
          {aceUrl && (
            <a
              href={aceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-navy-200 px-3 py-1.5 text-xs font-medium text-navy-700 hover:border-ocean-400 hover:bg-ocean-50 hover:text-ocean-700 transition-colors"
            >
              <ExternalLink className="h-3 w-3" />
              Open in CBP ACE Portal
            </a>
          )}
          {!aesNumber && !aceUrl && (
            <p className="text-xs text-navy-400">No AES filing data recorded. Click Edit to add.</p>
          )}
          {/* Progress tracker */}
          <div className="mt-3 flex items-center gap-1">
            {(["tbd", "filed", "accepted"] as const).map((step, i) => {
              const isActive = status === step;
              const isPast = (status === "filed" && step === "tbd") || (status === "accepted" && (step === "tbd" || step === "filed"));
              return (
                <div key={step} className="flex items-center gap-1">
                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ${
                      isActive
                        ? "bg-ocean-500 text-white"
                        : isPast
                          ? "bg-emerald-100 text-emerald-600"
                          : "bg-navy-100 text-navy-400"
                    }`}
                  >
                    {isPast ? <CheckCircle2 className="h-3 w-3" /> : i + 1}
                  </div>
                  {i < 2 && (
                    <div className={`h-0.5 w-8 rounded ${isPast ? "bg-emerald-400" : "bg-navy-200"}`} />
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex gap-6 text-[10px] text-navy-400">
            <span>TBD</span>
            <span>Filed</span>
            <span>Accepted</span>
          </div>
        </div>
      )}
    </div>
  );
}

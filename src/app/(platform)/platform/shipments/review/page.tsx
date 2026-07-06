"use client";

/**
 * Review queue for workbook-imported shipments (AI-10777).
 *
 * Lists every shipment whose importMeta.reviewIssues is non-empty and shows
 * inline inputs for ONLY the missing fields. Saving PATCHes the shipment; the
 * API recomputes reviewIssues and the row leaves the queue once clean.
 */

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ClipboardCheck,
  Loader2,
  Save,
  X,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────

interface ImportMeta {
  week?: string | null;
  aesNumber?: string | null;
  sealNumber?: string | null;
  reviewIssues?: string[] | null;
  fileName?: string | null;
}

interface ReviewShipment {
  id: string;
  reference: string | null;
  containerNumber: string | null;
  vesselName: string | null;
  carrier: string | null;
  pol: string | null;
  pod: string | null;
  etd: string | null;
  eta: string | null;
  weightKg: number | null;
  importMeta: ImportMeta | null;
}

interface RowForm {
  containerNumber: string;
  aesNumber: string;
  weightKg: string;
  etd: string;
  eta: string;
}

const EMPTY_FORM: RowForm = {
  containerNumber: "",
  aesNumber: "",
  weightKg: "",
  etd: "",
  eta: "",
};

// Which inline input does each parser issue need?
function inputsForIssues(issues: string[]): (keyof RowForm)[] {
  const fields = new Set<keyof RowForm>();
  for (const issue of issues) {
    if (issue === "missing container number") fields.add("containerNumber");
    else if (issue === "missing AES filing number") fields.add("aesNumber");
    else if (issue === "missing weight" || issue.startsWith("unparseable weight"))
      fields.add("weightKg");
    else if (issue === "missing/unparseable departure date") fields.add("etd");
    else if (issue === "missing/unparseable ETA") fields.add("eta");
  }
  return Array.from(fields);
}

const FIELD_CONFIG: Record<
  keyof RowForm,
  { label: string; placeholder: string; type: "text" | "number" | "date" }
> = {
  containerNumber: { label: "Container #", placeholder: "e.g. MNBU0334957", type: "text" },
  aesNumber: { label: "AES #", placeholder: "e.g. X20250930123456", type: "text" },
  weightKg: { label: "Weight (kg)", placeholder: "e.g. 14739", type: "number" },
  etd: { label: "Departure (ETD)", placeholder: "", type: "date" },
  eta: { label: "ETA", placeholder: "", type: "date" },
};

// ── Page ───────────────────────────────────────────────

export default function ShipmentReviewPage() {
  const [rows, setRows] = useState<ReviewShipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [forms, setForms] = useState<Record<string, RowForm>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [resolvedIds, setResolvedIds] = useState<Set<string>>(new Set());
  const [rowErrors, setRowErrors] = useState<Record<string, string>>({});

  const fetchQueue = useCallback(async () => {
    try {
      const res = await fetch("/api/shipments?needsReview=1&limit=200");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setRows(data.shipments || []);
    } catch {
      setError("Failed to load the review queue");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  const setField = (id: string, field: keyof RowForm, value: string) => {
    setForms((prev) => ({
      ...prev,
      [id]: { ...(prev[id] ?? EMPTY_FORM), [field]: value },
    }));
  };

  const handleSave = async (row: ReviewShipment) => {
    const form = forms[row.id] ?? EMPTY_FORM;
    const patch: Record<string, unknown> = {};
    if (form.containerNumber.trim()) patch.containerNumber = form.containerNumber.trim();
    if (form.aesNumber.trim()) patch.aesNumber = form.aesNumber.trim();
    if (form.weightKg.trim()) {
      const n = Number(form.weightKg);
      if (!Number.isFinite(n) || n <= 0) {
        setRowErrors((prev) => ({ ...prev, [row.id]: "Weight must be a positive number" }));
        return;
      }
      patch.weightKg = n;
    }
    if (form.etd) patch.etd = form.etd;
    if (form.eta) patch.eta = form.eta;

    if (Object.keys(patch).length === 0) {
      setRowErrors((prev) => ({ ...prev, [row.id]: "Fill at least one field before saving" }));
      return;
    }

    setSavingId(row.id);
    setRowErrors((prev) => {
      const next = { ...prev };
      delete next[row.id];
      return next;
    });

    try {
      const res = await fetch(`/api/shipments/${row.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");

      const updated: ReviewShipment = data.shipment;
      const remaining: string[] = updated.importMeta?.reviewIssues ?? [];

      if (remaining.length === 0) {
        // Brief success flash, then drop the row from the queue.
        setResolvedIds((prev) => new Set(prev).add(row.id));
        setTimeout(() => {
          setRows((prev) => prev.filter((r) => r.id !== row.id));
          setResolvedIds((prev) => {
            const next = new Set(prev);
            next.delete(row.id);
            return next;
          });
        }, 1200);
      } else {
        // Partially fixed: keep the row with its updated issue list.
        setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, ...updated } : r)));
        setForms((prev) => ({ ...prev, [row.id]: EMPTY_FORM }));
      }
    } catch (err) {
      setRowErrors((prev) => ({
        ...prev,
        [row.id]: err instanceof Error ? err.message : "Failed to save",
      }));
    } finally {
      setSavingId(null);
    }
  };

  const pendingCount = rows.filter((r) => !resolvedIds.has(r.id)).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/platform/shipments"
            className="inline-flex items-center gap-1 text-xs font-medium text-navy-500 hover:text-ocean-600"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to Shipment Tracker
          </Link>
          <h1 className="mt-1 flex items-center gap-2 text-2xl font-bold text-navy-900">
            <ClipboardCheck className="h-6 w-6 text-ocean-500" />
            {loading ? "Review Queue" : `${pendingCount} shipment${pendingCount === 1 ? "" : "s"} need${pendingCount === 1 ? "s" : ""} review`}
          </h1>
          <p className="mt-1 text-sm text-navy-500">
            Workbook rows imported with missing data — fill in the gaps and save to clear them
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{error}</span>
          <button onClick={() => setError(null)}>
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-ocean-500" />
        </div>
      ) : rows.length === 0 ? (
        <div className="card rounded-2xl p-12 text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-400" />
          <h3 className="mt-4 text-lg font-semibold text-navy-900">All clear</h3>
          <p className="mt-1 text-sm text-navy-500">
            No imported shipments need review right now
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {rows.map((row) => {
            const issues = row.importMeta?.reviewIssues ?? [];
            const fields = inputsForIssues(issues);
            const form = forms[row.id] ?? EMPTY_FORM;
            const resolved = resolvedIds.has(row.id);

            return (
              <div
                key={row.id}
                className={`card rounded-2xl p-5 transition-opacity ${resolved ? "opacity-60" : ""}`}
              >
                {/* Row header: booking reference + week + issue chips */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-sm font-bold text-navy-900">
                    {row.reference || row.containerNumber || "—"}
                  </span>
                  {row.importMeta?.week && (
                    <span className="inline-flex items-center rounded-full bg-navy-100 px-2.5 py-0.5 text-xs font-medium text-navy-600">
                      {row.importMeta.week}
                    </span>
                  )}
                  {(row.pol || row.pod) && (
                    <span className="text-xs text-navy-500">
                      {row.pol || "?"} → {row.pod || "?"}
                    </span>
                  )}
                  {resolved ? (
                    <span className="ml-auto inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                      <CheckCircle2 className="h-3 w-3" />
                      Resolved
                    </span>
                  ) : (
                    <span className="ml-auto flex flex-wrap gap-1.5">
                      {issues.map((issue) => (
                        <span
                          key={issue}
                          className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700"
                        >
                          <AlertTriangle className="h-3 w-3" />
                          {issue}
                        </span>
                      ))}
                    </span>
                  )}
                </div>

                {/* Inline inputs for ONLY the missing fields */}
                {!resolved && (
                  <div className="mt-4 flex flex-wrap items-end gap-3 border-t border-navy-100 pt-4">
                    {fields.map((field) => {
                      const cfg = FIELD_CONFIG[field];
                      return (
                        <div key={field} className="w-44">
                          <label className="mb-1 block text-xs font-medium text-navy-600">
                            {cfg.label}
                          </label>
                          <input
                            type={cfg.type}
                            className="input-light"
                            placeholder={cfg.placeholder}
                            value={form[field]}
                            onChange={(e) => setField(row.id, field, e.target.value)}
                          />
                        </div>
                      );
                    })}
                    <button
                      onClick={() => handleSave(row)}
                      disabled={savingId === row.id}
                      className="inline-flex items-center gap-2 rounded-xl bg-ocean-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-ocean-600 disabled:opacity-50"
                    >
                      {savingId === row.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      Save
                    </button>
                    {rowErrors[row.id] && (
                      <span className="text-xs font-medium text-red-600">{rowErrors[row.id]}</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

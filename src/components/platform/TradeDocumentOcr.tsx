"use client";

/**
 * Multi-document trade OCR — AI-12016
 *
 * Upload each document in a shipment's paperwork set, get it classified,
 * extracted and validated against the rules that actually govern it, then
 * reconcile the whole set before anything is filed.
 *
 * All parsing and validation happens server-side in lib/documents, so what is
 * rendered here always matches what the API contract enforced.
 */

import { useCallback, useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  FileText,
  Info,
  Layers,
  Loader2,
  ShieldAlert,
  Trash2,
  Upload,
  XCircle,
} from "lucide-react";
import type {
  DocumentValidation,
  IssueSeverity,
  ReconciliationReport,
  ShipmentProfile,
  TradeDocumentType,
} from "@/lib/documents/types";

const TYPE_LABELS: Record<TradeDocumentType, string> = {
  bill_of_lading: "Bill of Lading",
  commercial_invoice: "Commercial Invoice",
  packing_list: "Packing List",
  isf: "ISF (10+2)",
  certificate_of_origin: "Certificate of Origin",
  phytosanitary_certificate: "Phytosanitary Certificate",
  fda_prior_notice: "FDA Prior Notice",
};

const TYPE_OPTIONS: Array<{ value: TradeDocumentType | "auto"; label: string }> = [
  { value: "auto", label: "Detect automatically" },
  ...(Object.keys(TYPE_LABELS) as TradeDocumentType[]).map((value) => ({
    value,
    label: TYPE_LABELS[value],
  })),
];

const SEVERITY_STYLES: Record<IssueSeverity, { chip: string; icon: typeof XCircle }> = {
  blocker: { chip: "bg-red-50 border-red-200 text-red-900", icon: XCircle },
  warning: { chip: "bg-amber-50 border-amber-200 text-amber-900", icon: AlertTriangle },
  info: { chip: "bg-navy-50 border-navy-200 text-navy-700", icon: Info },
};

interface ProcessedDoc {
  key: string;
  documentId: string | null;
  documentType: TradeDocumentType;
  typeSource: string;
  typeConflict: { modelClaim: TradeDocumentType; textClaim: TradeDocumentType } | null;
  fileName: string;
  extracted: Record<string, unknown>;
  confidence: Record<string, number>;
  validation: DocumentValidation;
}

function humanizeKey(key: string): string {
  return key
    .split("_")
    .map((part) => (part.length <= 3 ? part.toUpperCase() : part[0].toUpperCase() + part.slice(1)))
    .join(" ");
}

function renderValue(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (Array.isArray(value)) return value.length ? value.join(", ") : "—";
  if (typeof value === "number") return value.toLocaleString("en-US");
  return String(value);
}

export default function TradeDocumentOcr() {
  const [requestedType, setRequestedType] = useState<TradeDocumentType | "auto">("auto");
  const [docs, setDocs] = useState<ProcessedDoc[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [profile, setProfile] = useState<ShipmentProfile>({ oceanImportToUs: true });
  const [report, setReport] = useState<ReconciliationReport | null>(null);
  const [reconciling, setReconciling] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const upload = useCallback(
    async (file: File) => {
      setUploading(true);
      setError(null);
      setReport(null);

      const fd = new FormData();
      fd.append("file", file);
      if (requestedType !== "auto") fd.append("documentType", requestedType);

      try {
        const res = await fetch("/api/documents", { method: "POST", body: fd });
        const data = await res.json();
        if (!res.ok || !data.success) {
          setError(data.error ?? "Document processing failed.");
          return;
        }
        setDocs((prev) => [
          ...prev,
          {
            key: `${Date.now()}-${file.name}`,
            documentId: data.documentId ?? null,
            documentType: data.documentType,
            typeSource: data.typeSource,
            typeConflict: data.typeConflict ?? null,
            fileName: data.fileName ?? file.name,
            extracted: data.extracted ?? {},
            confidence: data.confidence ?? {},
            validation: data.validation,
          },
        ]);
      } catch {
        setError("Could not reach the document service. Check your connection and try again.");
      } finally {
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    },
    [requestedType]
  );

  const reconcile = useCallback(async () => {
    setReconciling(true);
    setError(null);
    try {
      const res = await fetch("/api/documents/reconcile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documents: docs.map((d) => ({
            type: d.documentType,
            fields: d.extracted,
            confidence: d.confidence,
          })),
          profile,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Reconciliation failed.");
        return;
      }
      setReport(data.report as ReconciliationReport);
    } catch {
      setError("Could not reach the reconciliation service.");
    } finally {
      setReconciling(false);
    }
  }, [docs, profile]);

  const removeDoc = (key: string) => {
    setDocs((prev) => prev.filter((d) => d.key !== key));
    setReport(null);
  };

  const toggleProfile = (patch: Partial<ShipmentProfile>) => {
    setProfile((prev) => ({ ...prev, ...patch }));
    setReport(null);
  };

  return (
    <div className="space-y-6">
      {/* ── Upload ──────────────────────────────────────────── */}
      <section className="bg-white border border-navy-200 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-navy-900 mb-1">Upload a document</h2>
        <p className="text-sm text-navy-500 mb-5">
          Invoice, packing list, ISF, certificate of origin, phytosanitary certificate or FDA
          Prior Notice. Leave the type on automatic and it will be identified from the page.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
          <label className="block sm:w-72">
            <span className="block text-xs font-medium text-navy-700 mb-1.5">Document type</span>
            <select
              value={requestedType}
              onChange={(e) =>
                setRequestedType(e.target.value as TradeDocumentType | "auto")
              }
              className="w-full px-3 py-2 rounded-lg border border-navy-300 text-sm text-navy-900 bg-white focus:outline-none focus:ring-2 focus:ring-ocean-500/40 focus:border-ocean-500"
            >
              {TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void upload(file);
            }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-ocean-600 hover:bg-ocean-700 disabled:bg-navy-200 disabled:text-navy-400 text-white text-sm font-semibold transition-colors"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Reading document
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Choose file
              </>
            )}
          </button>
        </div>

        <p className="text-[11px] text-navy-400 mt-3">
          PDF or image, up to 25MB. Counts against your monthly OCR allowance.
        </p>

        {error && (
          <div className="mt-4 flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </section>

      {/* ── Processed documents ─────────────────────────────── */}
      {docs.map((doc) => (
        <DocumentCard key={doc.key} doc={doc} onRemove={() => removeDoc(doc.key)} />
      ))}

      {/* ── Reconciliation ──────────────────────────────────── */}
      {docs.length > 0 && (
        <section className="bg-white border border-navy-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-1">
            <Layers className="w-5 h-5 text-ocean-600" />
            <h2 className="text-lg font-semibold text-navy-900">Reconcile the set</h2>
          </div>
          <p className="text-sm text-navy-500 mb-4">
            Every document above can be individually valid and the set still be wrong. Tell us
            what the cargo is and we will check the numbers agree — and that nothing required is
            missing.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-5">
            <ProfileToggle
              label="Ocean import into the US"
              hint="Requires a bill of lading and an ISF"
              checked={!!profile.oceanImportToUs}
              onChange={(v) => toggleProfile({ oceanImportToUs: v })}
            />
            <ProfileToggle
              label="Contains plant product"
              hint="Requires a phytosanitary certificate"
              checked={!!profile.containsPlantProduct}
              onChange={(v) => toggleProfile({ containsPlantProduct: v })}
            />
            <ProfileToggle
              label="FDA-regulated article"
              hint="Food, drug, device or cosmetic — requires Prior Notice"
              checked={!!profile.containsFdaRegulatedProduct}
              onChange={(v) => toggleProfile({ containsFdaRegulatedProduct: v })}
            />
            <ProfileToggle
              label="Claiming preferential origin"
              hint="Requires a certificate of origin"
              checked={!!profile.claimsPreferentialOrigin}
              onChange={(v) => toggleProfile({ claimsPreferentialOrigin: v })}
            />
          </div>

          <button
            type="button"
            onClick={reconcile}
            disabled={reconciling}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-navy-900 hover:bg-navy-800 disabled:bg-navy-200 disabled:text-navy-400 text-white text-sm font-semibold transition-colors"
          >
            {reconciling ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Checking
              </>
            ) : (
              <>
                <Layers className="w-4 h-4" />
                Reconcile {docs.length} document{docs.length === 1 ? "" : "s"}
              </>
            )}
          </button>

          {report && <ReconciliationPanel report={report} />}
        </section>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────

function DocumentCard({ doc, onRemove }: { doc: ProcessedDoc; onRemove: () => void }) {
  const { validation } = doc;
  const blockers = validation.issues.filter((i) => i.severity === "blocker");

  return (
    <section className="bg-white border border-navy-200 rounded-xl p-6">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div className="flex items-start gap-3 min-w-0">
          <div
            className={`w-10 h-10 shrink-0 rounded-lg flex items-center justify-center ${
              validation.valid ? "bg-emerald-50" : "bg-red-50"
            }`}
          >
            {validation.valid ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            ) : (
              <ShieldAlert className="w-5 h-5 text-red-600" />
            )}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-semibold text-navy-900">
                {TYPE_LABELS[doc.documentType]}
              </h3>
              <span className="text-[10px] uppercase tracking-wide font-bold px-2 py-0.5 rounded-full bg-navy-100 text-navy-600">
                {doc.typeSource === "requested" ? "type given" : `type from ${doc.typeSource}`}
              </span>
              <span
                className={`text-[10px] uppercase tracking-wide font-bold px-2 py-0.5 rounded-full ${
                  validation.valid
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {validation.valid ? "usable" : `${blockers.length} blocker${blockers.length === 1 ? "" : "s"}`}
              </span>
            </div>
            <p className="text-xs text-navy-500 mt-1 flex items-center gap-1.5">
              <FileText className="w-3 h-3" />
              {doc.fileName} · {Math.round(validation.completeness * 100)}% of required fields read
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onRemove}
          className="p-2 text-navy-400 hover:text-red-600 transition-colors"
          aria-label="Remove document"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {doc.typeConflict && (
        <div className="mb-4 flex items-start gap-2 text-sm text-amber-900 bg-amber-50 border border-amber-200 rounded-lg p-3">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>
            The extraction model read this as a{" "}
            <strong>{TYPE_LABELS[doc.typeConflict.modelClaim]}</strong>, but the page text reads
            like a <strong>{TYPE_LABELS[doc.typeConflict.textClaim]}</strong>. It has been
            validated as the former — re-upload with the type set explicitly if that is wrong.
          </span>
        </div>
      )}

      {validation.issues.length > 0 && (
        <ul className="space-y-2 mb-5">
          {validation.issues.map((issue, i) => {
            const style = SEVERITY_STYLES[issue.severity];
            const Icon = style.icon;
            return (
              <li
                key={`${issue.code}-${i}`}
                className={`flex items-start gap-2 text-sm border rounded-lg p-3 ${style.chip}`}
              >
                <Icon className="w-4 h-4 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <div>{issue.message}</div>
                  {issue.authority && (
                    <div className="text-[11px] opacity-70 mt-1">{issue.authority}</div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wide text-navy-400 border-b border-navy-100">
              <th className="py-2 pr-3 font-semibold">Field</th>
              <th className="py-2 px-3 font-semibold">Value</th>
              <th className="py-2 pl-3 font-semibold text-right">Confidence</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(doc.extracted).map(([key, value]) => {
              const score = doc.confidence[key] ?? 0;
              const empty = value === null || (Array.isArray(value) && value.length === 0);
              return (
                <tr key={key} className="border-b border-navy-50 last:border-0">
                  <td className="py-2 pr-3 text-navy-500">{humanizeKey(key)}</td>
                  <td className={`py-2 px-3 ${empty ? "text-navy-300" : "text-navy-900"}`}>
                    {renderValue(value)}
                  </td>
                  <td className="py-2 pl-3 text-right">
                    {empty ? (
                      <span className="text-navy-300">—</span>
                    ) : (
                      <span
                        className={
                          score >= 0.85
                            ? "text-emerald-700"
                            : score >= 0.6
                              ? "text-navy-600"
                              : "text-amber-700 font-semibold"
                        }
                      >
                        {Math.round(score * 100)}%
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function ReconciliationPanel({ report }: { report: ReconciliationReport }) {
  return (
    <div className="mt-5 pt-5 border-t border-navy-100 space-y-4">
      <div
        className={`flex items-start gap-2 text-sm border rounded-lg p-3 ${
          report.clearedToFile
            ? "bg-emerald-50 border-emerald-200 text-emerald-900"
            : "bg-red-50 border-red-200 text-red-900"
        }`}
      >
        {report.clearedToFile ? (
          <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
        ) : (
          <XCircle className="w-4 h-4 mt-0.5 shrink-0" />
        )}
        <span>
          {report.clearedToFile
            ? "The set is internally consistent and everything the cargo profile requires is present."
            : "This set is not ready to file. Resolve the items below first."}
        </span>
      </div>

      {report.missingDocuments.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-navy-400 mb-2">
            Missing for this cargo
          </h4>
          <ul className="flex flex-wrap gap-2">
            {report.missingDocuments.map((type) => (
              <li
                key={type}
                className="text-xs font-medium px-2.5 py-1 rounded-full bg-red-50 border border-red-200 text-red-800"
              >
                {TYPE_LABELS[type]}
              </li>
            ))}
          </ul>
        </div>
      )}

      {report.findings.length > 0 ? (
        <ul className="space-y-2">
          {report.findings.map((finding, i) => {
            const style = SEVERITY_STYLES[finding.severity];
            const Icon = style.icon;
            return (
              <li
                key={`${finding.code}-${i}`}
                className={`text-sm border rounded-lg p-3 ${style.chip}`}
              >
                <div className="flex items-start gap-2">
                  <Icon className="w-4 h-4 mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <div>{finding.message}</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {finding.values.map((v, j) => (
                        <span
                          key={`${v.type}-${j}`}
                          className="text-[11px] px-2 py-0.5 rounded bg-white/70 border border-current/20"
                        >
                          {TYPE_LABELS[v.type]}: {v.value}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-sm text-navy-500">
          No disagreements found across {report.documentTypes.length} document
          {report.documentTypes.length === 1 ? "" : "s"}.
        </p>
      )}
    </div>
  );
}

function ProfileToggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer bg-navy-50/50 border border-navy-100 rounded-lg p-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 w-4 h-4 rounded border-navy-300 text-ocean-600 focus:ring-ocean-500"
      />
      <span className="text-sm text-navy-700">
        <span className="font-medium">{label}</span>
        <span className="block text-xs text-navy-500 mt-0.5">{hint}</span>
      </span>
    </label>
  );
}

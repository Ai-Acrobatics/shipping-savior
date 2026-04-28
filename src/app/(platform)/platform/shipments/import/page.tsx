"use client";

import { useState, useCallback, useRef } from "react";
import Link from "next/link";
import {
  Upload,
  Download,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  ArrowLeft,
} from "lucide-react";

interface PreviewRow {
  rowNumber: number;
  raw: Record<string, string>;
  errors: string[];
  valid: boolean;
}

interface DryRunResult {
  dryRun: true;
  totalRows: number;
  validCount: number;
  invalidCount: number;
  preview: PreviewRow[];
}

interface ImportResult {
  ok: true;
  inserted: number;
  ids: string[];
}

type Status = "idle" | "previewing" | "preview-ready" | "importing" | "imported" | "error";

const PREVIEW_COLUMNS = [
  "reference",
  "origin_port",
  "dest_port",
  "carrier",
  "etd",
  "eta",
  "container_count",
  "container_type",
  "cargo_type",
  "weight_kg",
  "value_usd",
];

export default function ShipmentsImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<DryRunResult | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((f: File) => {
    setError(null);
    setPreview(null);
    setImportResult(null);
    if (!f.name.toLowerCase().endsWith(".csv")) {
      setError("Please upload a CSV file (.csv extension required)");
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setError("File too large (max 10 MB)");
      return;
    }
    setFile(f);
    setStatus("idle");
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      const f = e.dataTransfer.files?.[0];
      if (f) handleFile(f);
    },
    [handleFile]
  );

  const previewCsv = async () => {
    if (!file) return;
    setStatus("previewing");
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/shipments/import?dryRun=1", {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to preview CSV");
        setStatus("error");
        return;
      }
      setPreview(data as DryRunResult);
      setStatus("preview-ready");
    } catch (e) {
      setError(`Network error: ${(e as Error).message}`);
      setStatus("error");
    }
  };

  const commitImport = async () => {
    if (!file) return;
    setStatus("importing");
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/shipments/import", {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to import");
        setStatus("error");
        return;
      }
      setImportResult(data as ImportResult);
      setStatus("imported");
    } catch (e) {
      setError(`Network error: ${(e as Error).message}`);
      setStatus("error");
    }
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setImportResult(null);
    setStatus("idle");
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="min-h-screen bg-navy-50">
      <div className="max-w-screen-xl mx-auto px-6 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Link
              href="/platform/shipments"
              className="inline-flex items-center gap-1.5 text-xs text-navy-500 hover:text-navy-700 mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Shipments
            </Link>
            <h1 className="text-2xl font-bold text-navy-900">Import Shipments</h1>
            <p className="text-sm text-navy-500 mt-1">
              Upload a CSV of your shipments to populate the dashboard with real data.
            </p>
          </div>
          <a
            href="/api/shipments/import"
            className="inline-flex items-center gap-2 text-sm border border-ocean-200 bg-ocean-50 hover:bg-ocean-100 text-ocean-700 px-4 py-2 rounded-lg transition-colors font-medium"
            download
          >
            <Download className="w-4 h-4" />
            Download CSV Template
          </a>
        </div>

        {/* Imported success state */}
        {status === "imported" && importResult && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 flex items-start gap-4">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-base font-semibold text-emerald-900">
                {importResult.inserted} shipments imported successfully
              </h3>
              <p className="text-sm text-emerald-700 mt-1">
                Your dashboard is now populated with real data.
              </p>
              <div className="flex gap-3 mt-4">
                <Link
                  href="/dashboard"
                  className="text-sm bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
                >
                  Go to Dashboard
                </Link>
                <button
                  onClick={reset}
                  className="text-sm border border-emerald-300 hover:bg-emerald-100 text-emerald-700 px-4 py-2 rounded-lg transition-colors font-medium"
                >
                  Import another file
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Drop zone — show when no file or after error */}
        {status !== "imported" && !file && (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={onDrop}
            className={`bg-white border-2 border-dashed rounded-2xl p-12 text-center transition-colors ${
              dragActive
                ? "border-ocean-500 bg-ocean-50"
                : "border-navy-200 hover:border-navy-300"
            }`}
          >
            <Upload className="w-12 h-12 text-navy-400 mx-auto mb-4" />
            <h3 className="text-base font-semibold text-navy-900 mb-2">
              Drag & drop your CSV here
            </h3>
            <p className="text-sm text-navy-500 mb-4">
              or click to browse. Max 10 MB.
            </p>
            <input
              ref={inputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
            />
            <button
              onClick={() => inputRef.current?.click()}
              className="bg-ocean-600 hover:bg-ocean-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Browse Files
            </button>
            <p className="text-xs text-navy-400 mt-4">
              Required columns: reference, origin_port, dest_port. Download the template above for the full schema.
            </p>
          </div>
        )}

        {/* File chosen — show preview controls */}
        {file && status !== "imported" && (
          <div className="bg-white border border-navy-100 rounded-2xl p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-ocean-600" />
                <div>
                  <div className="text-sm font-semibold text-navy-900">{file.name}</div>
                  <div className="text-xs text-navy-500">
                    {(file.size / 1024).toFixed(1)} KB
                  </div>
                </div>
              </div>
              <button
                onClick={reset}
                className="text-navy-400 hover:text-navy-700 transition-colors"
                aria-label="Clear file"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {status === "idle" && (
              <button
                onClick={previewCsv}
                className="mt-4 w-full bg-ocean-600 hover:bg-ocean-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
              >
                Preview Import
              </button>
            )}

            {status === "previewing" && (
              <div className="mt-4 flex items-center justify-center gap-2 text-sm text-navy-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                Validating CSV…
              </div>
            )}
          </div>
        )}

        {/* Error banner */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        {/* Preview table */}
        {preview && (status === "preview-ready" || status === "importing") && (
          <div className="bg-white border border-navy-100 rounded-2xl p-5 shadow-soft space-y-4">
            <div className="flex flex-wrap items-center gap-4">
              <div>
                <h3 className="text-base font-semibold text-navy-900">Preview</h3>
                <p className="text-xs text-navy-500 mt-0.5">
                  {preview.totalRows} total rows ·{" "}
                  <span className="text-emerald-600 font-medium">{preview.validCount} valid</span>
                  {preview.invalidCount > 0 && (
                    <>
                      {" "}·{" "}
                      <span className="text-red-600 font-medium">{preview.invalidCount} invalid</span>
                    </>
                  )}
                </p>
              </div>
              <div className="ml-auto flex gap-2">
                <button
                  onClick={reset}
                  className="text-sm border border-navy-200 hover:bg-navy-50 text-navy-700 px-4 py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  disabled={preview.invalidCount > 0 || status === "importing"}
                  onClick={commitImport}
                  className="text-sm bg-emerald-600 hover:bg-emerald-700 disabled:bg-navy-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors font-medium"
                >
                  {status === "importing" ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Importing…
                    </span>
                  ) : (
                    `Import ${preview.validCount} shipments`
                  )}
                </button>
              </div>
            </div>

            {preview.invalidCount > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
                Fix the errored rows in your CSV and re-upload to proceed. The Import button is disabled until all rows are valid.
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-navy-100">
                    <th className="text-left text-navy-400 font-semibold uppercase tracking-wide py-2 pr-3">Row</th>
                    <th className="text-left text-navy-400 font-semibold uppercase tracking-wide py-2 pr-3">Status</th>
                    {PREVIEW_COLUMNS.map((c) => (
                      <th key={c} className="text-left text-navy-400 font-semibold uppercase tracking-wide py-2 pr-3">
                        {c}
                      </th>
                    ))}
                    <th className="text-left text-navy-400 font-semibold uppercase tracking-wide py-2">Errors</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.preview.map((row) => (
                    <tr
                      key={row.rowNumber}
                      className={`border-b border-navy-50 last:border-0 ${
                        row.valid ? "" : "bg-red-50/30"
                      }`}
                    >
                      <td className="py-2 pr-3 text-navy-500">{row.rowNumber}</td>
                      <td className="py-2 pr-3">
                        {row.valid ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700">
                            <CheckCircle2 className="w-3 h-3" />
                            OK
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-red-700">
                            <AlertCircle className="w-3 h-3" />
                            Error
                          </span>
                        )}
                      </td>
                      {PREVIEW_COLUMNS.map((c) => (
                        <td key={c} className="py-2 pr-3 text-navy-700 max-w-[140px] truncate">
                          {row.raw[c] ?? ""}
                        </td>
                      ))}
                      <td className="py-2 text-red-700">
                        {row.errors.length > 0 ? row.errors.join("; ") : ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {preview.totalRows > preview.preview.length && (
                <p className="text-xs text-navy-400 mt-3">
                  Showing first {preview.preview.length} of {preview.totalRows} rows.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

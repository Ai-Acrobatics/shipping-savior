"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Package,
  Upload,
  Loader2,
  X,
  Save,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Ship,
  MapPin,
  ChevronDown,
  FileText,
} from "lucide-react";
import HelpHint from "@/components/ui/HelpHint";

// ── Types ──────────────────────────────────────────────

interface ExtractedBOL {
  container_numbers?: string[] | null;
  vessel_name?: string | null;
  voyage_number?: string | null;
  port_of_loading?: string | null;
  port_of_discharge?: string | null;
  etd?: string | null;
  eta?: string | null;
  carrier?: string | null;
  shipper?: string | null;
  consignee?: string | null;
  notify_party?: string | null;
  goods_description?: string | null;
  weight_kg?: number | null;
  quantity?: number | null;
}

interface BOLConfidence {
  container_numbers?: number | null;
  vessel_name?: number | null;
  voyage_number?: number | null;
  port_of_loading?: number | null;
  port_of_discharge?: number | null;
  etd?: number | null;
  eta?: number | null;
  carrier?: number | null;
  shipper?: number | null;
  consignee?: number | null;
  notify_party?: number | null;
  goods_description?: number | null;
  weight_kg?: number | null;
  quantity?: number | null;
}

interface Shipment {
  id: string;
  containerNumber: string | null;
  vesselName: string | null;
  voyageNumber: string | null;
  pol: string | null;
  pod: string | null;
  etd: string | null;
  eta: string | null;
  carrier: string | null;
  shipper: string | null;
  consignee: string | null;
  goodsDescription: string | null;
  weightKg: number | null;
  quantity: number | null;
  status: "in_transit" | "arrived" | "delayed" | "pending";
  source: "manual" | "bol_ocr";
  bolBlobUrl?: string | null;
  bolFileName?: string | null;
  createdAt: string;
}

// ── Helpers ────────────────────────────────────────────

function statusBadge(status: Shipment["status"]) {
  const cfg = {
    in_transit: { label: "In Transit", classes: "bg-sky-100 text-sky-700 border-sky-200", icon: Ship },
    arrived: { label: "Arrived", classes: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
    delayed: { label: "Delayed", classes: "bg-red-100 text-red-700 border-red-200", icon: AlertTriangle },
    pending: { label: "Pending", classes: "bg-amber-100 text-amber-700 border-amber-200", icon: Clock },
  };
  const { label, classes, icon: Icon } = cfg[status] || cfg.pending;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${classes}`}>
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}

function formatDate(d: string | null | undefined): string {
  if (!d) return "--";
  try {
    return new Date(d).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return d;
  }
}

function ConfidenceBadge({ score }: { score: number | null | undefined }) {
  if (score == null || Number.isNaN(score)) return null;
  const pct = Math.round(score * 100);
  const tier =
    score >= 0.85
      ? { label: `${pct}% confident`, classes: "bg-emerald-50 text-emerald-700 border-emerald-200" }
      : score >= 0.6
        ? { label: `${pct}% — verify`, classes: "bg-amber-50 text-amber-700 border-amber-200" }
        : { label: `${pct}% — low`, classes: "bg-red-50 text-red-700 border-red-200" };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-1.5 py-0 text-[10px] font-semibold ${tier.classes}`}
      title="AI-estimated confidence — review before saving"
    >
      {tier.label}
    </span>
  );
}

// ── Main Component ─────────────────────────────────────

export default function ShipmentsPage() {
  const [shipmentsList, setShipmentsList] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Upload state
  const [uploadMode, setUploadMode] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [extracted, setExtracted] = useState<ExtractedBOL | null>(null);
  const [confidence, setConfidence] = useState<BOLConfidence | null>(null);
  const [bolDocumentId, setBolDocumentId] = useState<string | null>(null);
  const [bolBlobUrl, setBolBlobUrl] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Review form state (editable after extraction)
  const [form, setForm] = useState({
    containerNumber: "",
    vesselName: "",
    voyageNumber: "",
    pol: "",
    pod: "",
    etd: "",
    eta: "",
    carrier: "",
    shipper: "",
    consignee: "",
    notifyParty: "",
    goodsDescription: "",
    weightKg: "",
    quantity: "",
    status: "in_transit" as Shipment["status"],
  });

  const [saving, setSaving] = useState(false);

  const fetchShipments = useCallback(async () => {
    try {
      const res = await fetch("/api/shipments");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setShipmentsList(data.shipments || []);
    } catch {
      setError("Failed to load shipments");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchShipments();
  }, [fetchShipments]);

  // Populate form from extracted BOL
  useEffect(() => {
    if (!extracted) return;
    setForm((prev) => ({
      ...prev,
      containerNumber: extracted.container_numbers?.[0] || "",
      vesselName: extracted.vessel_name || "",
      voyageNumber: extracted.voyage_number || "",
      pol: extracted.port_of_loading || "",
      pod: extracted.port_of_discharge || "",
      etd: extracted.etd ? extracted.etd.slice(0, 10) : "",
      eta: extracted.eta ? extracted.eta.slice(0, 10) : "",
      carrier: extracted.carrier || "",
      shipper: extracted.shipper || "",
      consignee: extracted.consignee || "",
      notifyParty: extracted.notify_party || "",
      goodsDescription: extracted.goods_description || "",
      weightKg: extracted.weight_kg?.toString() || "",
      quantity: extracted.quantity?.toString() || "",
    }));
  }, [extracted]);

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    setError(null);
    setExtracted(null);
    setConfidence(null);
    setBolDocumentId(null);
    setBolBlobUrl(null);
    setUploadedFileName(file.name);

    const fd = new FormData();
    fd.append("file", file);

    try {
      const res = await fetch("/api/bol", { method: "POST", body: fd });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "OCR failed");
      }

      setExtracted(data.extracted);
      setConfidence(data.confidence || null);
      setBolDocumentId(data.bolDocumentId || null);
      setBolBlobUrl(data.blobUrl || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/shipments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          containerNumber: form.containerNumber || null,
          vesselName: form.vesselName || null,
          voyageNumber: form.voyageNumber || null,
          pol: form.pol || null,
          pod: form.pod || null,
          etd: form.etd || null,
          eta: form.eta || null,
          carrier: form.carrier || null,
          shipper: form.shipper || null,
          consignee: form.consignee || null,
          notifyParty: form.notifyParty || null,
          goodsDescription: form.goodsDescription || null,
          weightKg: form.weightKg ? parseInt(form.weightKg) : null,
          quantity: form.quantity ? parseInt(form.quantity) : null,
          status: form.status,
          source: extracted ? "bol_ocr" : "manual",
          bolDocumentId: bolDocumentId,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save");
      }

      setSuccess("Shipment saved successfully");
      setUploadMode(false);
      setExtracted(null);
      setConfidence(null);
      setBolDocumentId(null);
      setBolBlobUrl(null);
      setUploadedFileName(null);
      setForm({
        containerNumber: "",
        vesselName: "",
        voyageNumber: "",
        pol: "",
        pod: "",
        etd: "",
        eta: "",
        carrier: "",
        shipper: "",
        consignee: "",
        notifyParty: "",
        goodsDescription: "",
        weightKg: "",
        quantity: "",
        status: "in_transit",
      });
      fetchShipments();
      setTimeout(() => setSuccess(null), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const inTransit = shipmentsList.filter((s) => s.status === "in_transit").length;
  const arrived = shipmentsList.filter((s) => s.status === "arrived").length;
  const delayed = shipmentsList.filter((s) => s.status === "delayed").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div>
            <h1 className="text-2xl font-bold text-navy-900">Shipment Tracker</h1>
            <p className="mt-1 text-sm text-navy-500">
              Upload Bills of Lading to extract and track your container shipments
            </p>
          </div>
          <HelpHint
            articleSlug="importing-shipments-csv"
            label="Bulk loading shipments? Read the CSV import walkthrough."
          />
        </div>
        <button
          onClick={() => { setUploadMode(true); setExtracted(null); setError(null); }}
          className="inline-flex items-center gap-2 rounded-xl bg-ocean-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-ocean-600"
        >
          <Upload className="h-4 w-4" />
          Upload Bill of Lading
        </button>
      </div>

      {/* Notifications */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)}>
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      {success && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          {success}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Total Shipments", value: shipmentsList.length, icon: Package, color: "text-ocean-600" },
          { label: "In Transit", value: inTransit, icon: Ship, color: "text-sky-600" },
          { label: "Arrived", value: arrived, icon: CheckCircle2, color: "text-emerald-600" },
          { label: "Delayed", value: delayed, icon: AlertTriangle, color: delayed > 0 ? "text-red-600" : "text-navy-400" },
        ].map((s) => (
          <div key={s.label} className="card rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-50">
                <s.icon className={`h-5 w-5 ${s.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-navy-900">{s.value}</p>
                <p className="text-xs text-navy-500">{s.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Upload Zone + Review Form */}
      {uploadMode && (
        <div className="card rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between border-b border-navy-100 px-6 py-4">
            <h2 className="text-lg font-bold text-navy-900">
              {extracted ? "Review Extracted Data" : "Upload Bill of Lading"}
            </h2>
            <button
              onClick={() => { setUploadMode(false); setExtracted(null); setError(null); }}
              className="rounded-lg p-1.5 text-navy-400 hover:bg-navy-100 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="px-6 py-5 space-y-6">
            {/* Drop zone */}
            {!extracted && (
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-12 text-center transition-colors ${
                  dragOver
                    ? "border-ocean-400 bg-ocean-50"
                    : "border-navy-300 hover:border-ocean-400 hover:bg-navy-50"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
                {uploading ? (
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-10 w-10 animate-spin text-ocean-500" />
                    <p className="font-semibold text-navy-700">AI is reading your BOL...</p>
                    <p className="text-sm text-navy-500">Extracting shipment data with Claude</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-ocean-50">
                      <Upload className="h-8 w-8 text-ocean-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-navy-700">
                        Drag & drop your Bill of Lading here
                      </p>
                      <p className="mt-1 text-sm text-navy-500">
                        or click to browse — PDF or image (JPG, PNG)
                      </p>
                    </div>
                    {uploadedFileName && (
                      <p className="text-sm font-medium text-ocean-600">
                        Selected: {uploadedFileName}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Extraction success notice */}
            {extracted && uploadedFileName && (
              <div className="flex flex-wrap items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                <div className="text-sm">
                  <span className="font-semibold text-emerald-700">AI extracted data from {uploadedFileName}</span>
                  <span className="ml-1 text-emerald-600">
                    — review fields with <span className="font-semibold">amber/red</span> confidence before saving
                  </span>
                </div>
                {bolBlobUrl && (
                  <a
                    href={bolBlobUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-full border border-emerald-300 bg-white px-2.5 py-0.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                  >
                    <FileText className="h-3 w-3" />
                    View original
                  </a>
                )}
                <button
                  onClick={() => {
                    setExtracted(null);
                    setConfidence(null);
                    setBolDocumentId(null);
                    setBolBlobUrl(null);
                    setUploadedFileName(null);
                  }}
                  className="ml-auto text-emerald-500 hover:text-emerald-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Review / Entry Form */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-navy-700 border-b border-navy-100 pb-2">
                Shipment Details {!extracted && <span className="font-normal text-navy-400">(fill manually or upload BOL)</span>}
              </h3>

              {/* Row 1: Container, Carrier */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-xs font-medium text-navy-600 mb-1">
                    Container Number
                    <ConfidenceBadge score={confidence?.container_numbers} />
                  </label>
                  <input
                    className="input-light"
                    placeholder="e.g. MAEU1234567"
                    value={form.containerNumber}
                    onChange={(e) => setForm({ ...form, containerNumber: e.target.value })}
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-xs font-medium text-navy-600 mb-1">
                    Carrier
                    <ConfidenceBadge score={confidence?.carrier} />
                  </label>
                  <input
                    className="input-light"
                    placeholder="e.g. Maersk"
                    value={form.carrier}
                    onChange={(e) => setForm({ ...form, carrier: e.target.value })}
                  />
                </div>
              </div>

              {/* Row 2: Vessel, Voyage */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-xs font-medium text-navy-600 mb-1">
                    Vessel Name
                    <ConfidenceBadge score={confidence?.vessel_name} />
                  </label>
                  <input
                    className="input-light"
                    placeholder="e.g. Emma Maersk"
                    value={form.vesselName}
                    onChange={(e) => setForm({ ...form, vesselName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-xs font-medium text-navy-600 mb-1">
                    Voyage Number
                    <ConfidenceBadge score={confidence?.voyage_number} />
                  </label>
                  <input
                    className="input-light"
                    placeholder="e.g. 123W"
                    value={form.voyageNumber}
                    onChange={(e) => setForm({ ...form, voyageNumber: e.target.value })}
                  />
                </div>
              </div>

              {/* Row 3: POL, POD */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-xs font-medium text-navy-600 mb-1">
                    Port of Loading (POL)
                    <ConfidenceBadge score={confidence?.port_of_loading} />
                  </label>
                  <input
                    className="input-light"
                    placeholder="e.g. Shanghai, China"
                    value={form.pol}
                    onChange={(e) => setForm({ ...form, pol: e.target.value })}
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-xs font-medium text-navy-600 mb-1">
                    Port of Discharge (POD)
                    <ConfidenceBadge score={confidence?.port_of_discharge} />
                  </label>
                  <input
                    className="input-light"
                    placeholder="e.g. Los Angeles, USA"
                    value={form.pod}
                    onChange={(e) => setForm({ ...form, pod: e.target.value })}
                  />
                </div>
              </div>

              {/* Row 4: ETD, ETA */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-xs font-medium text-navy-600 mb-1">
                    ETD
                    <ConfidenceBadge score={confidence?.etd} />
                  </label>
                  <input
                    type="date"
                    className="input-light"
                    value={form.etd}
                    onChange={(e) => setForm({ ...form, etd: e.target.value })}
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-xs font-medium text-navy-600 mb-1">
                    ETA
                    <ConfidenceBadge score={confidence?.eta} />
                  </label>
                  <input
                    type="date"
                    className="input-light"
                    value={form.eta}
                    onChange={(e) => setForm({ ...form, eta: e.target.value })}
                  />
                </div>
              </div>

              {/* Row 5: Shipper, Consignee */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-xs font-medium text-navy-600 mb-1">
                    Shipper
                    <ConfidenceBadge score={confidence?.shipper} />
                  </label>
                  <input
                    className="input-light"
                    placeholder="Exporter name"
                    value={form.shipper}
                    onChange={(e) => setForm({ ...form, shipper: e.target.value })}
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-xs font-medium text-navy-600 mb-1">
                    Consignee
                    <ConfidenceBadge score={confidence?.consignee} />
                  </label>
                  <input
                    className="input-light"
                    placeholder="Importer name"
                    value={form.consignee}
                    onChange={(e) => setForm({ ...form, consignee: e.target.value })}
                  />
                </div>
              </div>

              {/* Row 6: Weight, Quantity, Status */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-xs font-medium text-navy-600 mb-1">
                    Weight (kg)
                    <ConfidenceBadge score={confidence?.weight_kg} />
                  </label>
                  <input
                    type="number"
                    className="input-light"
                    placeholder="20000"
                    value={form.weightKg}
                    onChange={(e) => setForm({ ...form, weightKg: e.target.value })}
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-xs font-medium text-navy-600 mb-1">
                    Quantity (pkgs)
                    <ConfidenceBadge score={confidence?.quantity} />
                  </label>
                  <input
                    type="number"
                    className="input-light"
                    placeholder="500"
                    value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-navy-600 mb-1">Status</label>
                  <div className="relative">
                    <select
                      className="input-light appearance-none pr-8"
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value as Shipment["status"] })}
                    >
                      <option value="in_transit">In Transit</option>
                      <option value="arrived">Arrived</option>
                      <option value="delayed">Delayed</option>
                      <option value="pending">Pending</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" />
                  </div>
                </div>
              </div>

              {/* Goods Description */}
              <div>
                <label className="flex items-center gap-2 text-xs font-medium text-navy-600 mb-1">
                  Goods Description
                  <ConfidenceBadge score={confidence?.goods_description} />
                </label>
                <textarea
                  className="input-light min-h-[60px]"
                  placeholder="Description of cargo..."
                  value={form.goodsDescription}
                  onChange={(e) => setForm({ ...form, goodsDescription: e.target.value })}
                />
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end gap-3 border-t border-navy-100 pt-4">
              <button
                onClick={() => { setUploadMode(false); setExtracted(null); }}
                className="rounded-xl px-4 py-2 text-sm font-medium text-navy-600 hover:bg-navy-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-ocean-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-ocean-600 disabled:opacity-50"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Shipment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Shipments Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-ocean-500" />
        </div>
      ) : shipmentsList.length === 0 ? (
        <div className="card rounded-2xl p-12 text-center">
          <Package className="mx-auto h-12 w-12 text-navy-300" />
          <h3 className="mt-4 text-lg font-semibold text-navy-900">No shipments yet</h3>
          <p className="mt-1 text-sm text-navy-500">
            Upload your first Bill of Lading to start tracking your containers
          </p>
          <button
            onClick={() => setUploadMode(true)}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-ocean-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-ocean-600"
          >
            <Upload className="h-4 w-4" />
            Upload Bill of Lading
          </button>
        </div>
      ) : (
        <div className="card rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-navy-100 bg-navy-50/50">
                <tr className="text-left text-xs font-semibold uppercase tracking-wider text-navy-500">
                  <th className="px-4 py-3">Container ID</th>
                  <th className="px-4 py-3">Route</th>
                  <th className="px-4 py-3">Carrier</th>
                  <th className="px-4 py-3">Vessel</th>
                  <th className="px-4 py-3">ETA</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Source</th>
                  <th className="px-4 py-3">BOL</th>
                </tr>
              </thead>
              <tbody>
                {shipmentsList.map((s) => (
                  <tr key={s.id} className="border-b border-navy-100 last:border-0 hover:bg-navy-50/30 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs font-semibold text-navy-800">
                        {s.containerNumber || "--"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {s.pol || s.pod ? (
                        <div className="flex items-center gap-1 text-xs text-navy-600">
                          <MapPin className="h-3 w-3 text-navy-400 shrink-0" />
                          <span>{s.pol || "?"}</span>
                          <span className="text-navy-400">→</span>
                          <span>{s.pod || "?"}</span>
                        </div>
                      ) : (
                        <span className="text-navy-400">--</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-navy-700">{s.carrier || "--"}</td>
                    <td className="px-4 py-3 text-navy-600">{s.vesselName || "--"}</td>
                    <td className="px-4 py-3 text-navy-600">{formatDate(s.eta)}</td>
                    <td className="px-4 py-3">{statusBadge(s.status)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        s.source === "bol_ocr"
                          ? "bg-violet-100 text-violet-700"
                          : "bg-navy-100 text-navy-600"
                      }`}>
                        {s.source === "bol_ocr" ? "AI / OCR" : "Manual"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {s.bolBlobUrl ? (
                        <a
                          href={s.bolBlobUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-lg border border-navy-200 px-2 py-0.5 text-xs font-medium text-navy-700 hover:border-ocean-400 hover:bg-ocean-50 hover:text-ocean-700"
                          title={s.bolFileName || "View original BOL"}
                        >
                          <FileText className="h-3 w-3" />
                          View
                        </a>
                      ) : (
                        <span className="text-xs text-navy-300">--</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

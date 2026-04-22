"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  FileText,
  Plus,
  ChevronDown,
  ChevronUp,
  Trash2,
  Ship,
  Route,
  AlertTriangle,
  Clock,
  X,
  Loader2,
  Upload,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────

interface Lane {
  id: string;
  contractId: string;
  originPort: string;
  originPortName: string;
  destPort: string;
  destPortName: string;
  rate20ft: number | null;
  rate40ft: number | null;
  rate40hc: number | null;
  currency: string;
  commodity: string | null;
  createdAt: string;
}

interface Contract {
  id: string;
  carrier: string;
  carrierCode: string;
  contractNumber: string | null;
  contractType: string;
  startDate: string;
  endDate: string;
  contactName: string | null;
  contactEmail: string | null;
  notes: string | null;
  createdAt: string;
  laneCount?: number;
  lanes?: Lane[];
}

// ── Carrier data ──────────────────────────────────────

const CARRIERS = [
  { name: "Maersk", code: "MAEU" },
  { name: "MSC", code: "MSCU" },
  { name: "CMA CGM", code: "CMDU" },
  { name: "COSCO Shipping", code: "COSU" },
  { name: "Hapag-Lloyd", code: "HLCU" },
  { name: "Evergreen", code: "EGLV" },
  { name: "ONE", code: "ONEY" },
  { name: "Yang Ming", code: "YMLU" },
  { name: "ZIM", code: "ZIMU" },
  { name: "HMM", code: "HMMU" },
  { name: "Wan Hai", code: "WHLC" },
  { name: "PIL", code: "PCIU" },
];

const CONTRACT_TYPES: { value: string; label: string }[] = [
  { value: "spot", label: "Spot" },
  { value: "90_day", label: "90-Day" },
  { value: "180_day", label: "180-Day" },
  { value: "365_day", label: "Annual (365)" },
];

// ── Helpers ───────────────────────────────────────────

function daysRemaining(endDate: string): number {
  const diff = new Date(endDate).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function getStatus(endDate: string): "active" | "expiring" | "expired" {
  const days = daysRemaining(endDate);
  if (days <= 0) return "expired";
  if (days <= 30) return "expiring";
  return "active";
}

function statusBadge(status: "active" | "expiring" | "expired") {
  const styles = {
    active: "bg-emerald-100 text-emerald-700 border-emerald-200",
    expiring: "bg-amber-100 text-amber-700 border-amber-200",
    expired: "bg-red-100 text-red-700 border-red-200",
  };
  const labels = {
    active: "Active",
    expiring: "Expiring Soon",
    expired: "Expired",
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${styles[status]}`}>
      {status === "expiring" && <AlertTriangle className="h-3 w-3" />}
      {labels[status]}
    </span>
  );
}

function contractTypeBadge(type: string) {
  const colors: Record<string, string> = {
    spot: "bg-navy-100 text-navy-700 border-navy-200",
    "90_day": "bg-sky-100 text-sky-700 border-sky-200",
    "180_day": "bg-indigo-100 text-indigo-700 border-indigo-200",
    "365_day": "bg-violet-100 text-violet-700 border-violet-200",
  };
  const labels: Record<string, string> = {
    spot: "Spot",
    "90_day": "90-Day",
    "180_day": "180-Day",
    "365_day": "Annual",
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${colors[type] || "bg-gray-100 text-gray-700"}`}>
      {labels[type] || type}
    </span>
  );
}

function carrierBadge(carrier: string, code: string) {
  const colorMap: Record<string, string> = {
    MAEU: "bg-sky-500",
    MSCU: "bg-indigo-500",
    CMDU: "bg-red-500",
    COSU: "bg-blue-600",
    HLCU: "bg-orange-500",
    EGLV: "bg-emerald-600",
    ONEY: "bg-pink-500",
    YMLU: "bg-yellow-500",
    ZIMU: "bg-purple-500",
    HMMU: "bg-teal-500",
  };
  return (
    <div className="flex items-center gap-2">
      <div className={`h-3 w-3 rounded-full ${colorMap[code] || "bg-gray-400"}`} />
      <span className="font-semibold text-navy-900">{carrier}</span>
      <span className="text-xs text-navy-400 font-mono">{code}</span>
    </div>
  );
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatCurrency(val: number | null): string {
  if (val === null || val === undefined) return "--";
  return `$${val.toLocaleString()}`;
}

// ── Main component ────────────────────────────────────

// ── AI Parse Modal types ──────────────────────────────

interface ParsedContract {
  carrier?: string;
  contract_number?: string | null;
  start_date?: string;
  end_date?: string;
  lanes?: Array<{
    origin_port?: string;
    dest_port?: string;
    rate_20ft?: number | null;
    rate_40ft?: number | null;
    rate_40hc?: number | null;
    currency?: string;
    commodity?: string | null;
  }>;
}

export default function ContractsPage() {
  const [contractsList, setContractsList] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expandedLanes, setExpandedLanes] = useState<Record<string, Lane[]>>({});
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // AI Upload modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadDragOver, setUploadDragOver] = useState(false);
  const [uploadParsing, setUploadParsing] = useState(false);
  const [parsedContract, setParsedContract] = useState<ParsedContract | null>(null);
  const [uploadFileName, setUploadFileName] = useState<string | null>(null);
  const [uploadSaving, setUploadSaving] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const uploadFileRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formCarrier, setFormCarrier] = useState(CARRIERS[0].name);
  const [formCarrierCode, setFormCarrierCode] = useState(CARRIERS[0].code);
  const [formContractType, setFormContractType] = useState("90_day");
  const [formContractNumber, setFormContractNumber] = useState("");
  const [formStartDate, setFormStartDate] = useState("");
  const [formEndDate, setFormEndDate] = useState("");
  const [formContactName, setFormContactName] = useState("");
  const [formContactEmail, setFormContactEmail] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [formLanes, setFormLanes] = useState<Array<{
    originPort: string;
    originPortName: string;
    destPort: string;
    destPortName: string;
    rate20ft: string;
    rate40ft: string;
    rate40hc: string;
    commodity: string;
  }>>([]);

  // Add Lane to existing contract state
  const [addLaneContractId, setAddLaneContractId] = useState<string | null>(null);
  const [newLane, setNewLane] = useState({
    originPort: "",
    originPortName: "",
    destPort: "",
    destPortName: "",
    rate20ft: "",
    rate40ft: "",
    rate40hc: "",
    commodity: "",
  });

  // Fetch contracts
  const fetchContracts = useCallback(async () => {
    try {
      const res = await fetch("/api/contracts");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setContractsList(data.contracts || []);
    } catch {
      setError("Failed to load contracts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  // Expand/collapse a contract — fetch lanes on expand
  const toggleExpand = async (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(id);
    if (!expandedLanes[id]) {
      try {
        const res = await fetch(`/api/contracts/${id}`);
        if (res.ok) {
          const data = await res.json();
          setExpandedLanes((prev) => ({ ...prev, [id]: data.contract.lanes || [] }));
        }
      } catch {
        // Silently handle — lanes just won't show
      }
    }
  };

  // Create contract
  const handleCreate = async () => {
    setSaving(true);
    setError(null);

    try {
      const lanes = formLanes
        .filter((l) => l.originPort && l.destPort)
        .map((l) => ({
          originPort: l.originPort,
          originPortName: l.originPortName || l.originPort,
          destPort: l.destPort,
          destPortName: l.destPortName || l.destPort,
          rate20ft: l.rate20ft ? parseInt(l.rate20ft) : undefined,
          rate40ft: l.rate40ft ? parseInt(l.rate40ft) : undefined,
          rate40hc: l.rate40hc ? parseInt(l.rate40hc) : undefined,
          commodity: l.commodity || undefined,
        }));

      const res = await fetch("/api/contracts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          carrier: formCarrier,
          carrierCode: formCarrierCode,
          contractType: formContractType,
          contractNumber: formContractNumber || undefined,
          startDate: formStartDate,
          endDate: formEndDate,
          contactName: formContactName || undefined,
          contactEmail: formContactEmail || undefined,
          notes: formNotes || undefined,
          lanes,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create contract");
      }

      setShowModal(false);
      resetForm();
      fetchContracts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create contract");
    } finally {
      setSaving(false);
    }
  };

  // Delete contract
  const handleDelete = async (id: string) => {
    if (!confirm("Delete this contract and all its lanes?")) return;

    try {
      const res = await fetch(`/api/contracts/${id}`, { method: "DELETE" });
      if (!res.ok && res.status !== 204) throw new Error("Failed to delete");
      fetchContracts();
      if (expandedId === id) setExpandedId(null);
    } catch {
      setError("Failed to delete contract");
    }
  };

  // Add lane to existing contract
  const handleAddLane = async () => {
    if (!addLaneContractId) return;
    setSaving(true);

    try {
      const res = await fetch(`/api/contracts/${addLaneContractId}/lanes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originPort: newLane.originPort,
          originPortName: newLane.originPortName || newLane.originPort,
          destPort: newLane.destPort,
          destPortName: newLane.destPortName || newLane.destPort,
          rate20ft: newLane.rate20ft ? parseInt(newLane.rate20ft) : undefined,
          rate40ft: newLane.rate40ft ? parseInt(newLane.rate40ft) : undefined,
          rate40hc: newLane.rate40hc ? parseInt(newLane.rate40hc) : undefined,
          commodity: newLane.commodity || undefined,
        }),
      });

      if (!res.ok) throw new Error("Failed to add lane");

      const data = await res.json();
      setExpandedLanes((prev) => ({
        ...prev,
        [addLaneContractId]: [...(prev[addLaneContractId] || []), data.lane],
      }));
      setAddLaneContractId(null);
      setNewLane({ originPort: "", originPortName: "", destPort: "", destPortName: "", rate20ft: "", rate40ft: "", rate40hc: "", commodity: "" });
      fetchContracts();
    } catch {
      setError("Failed to add lane");
    } finally {
      setSaving(false);
    }
  };

  // Delete lane
  const handleDeleteLane = async (contractId: string, laneId: string) => {
    if (!confirm("Remove this lane?")) return;

    try {
      const res = await fetch(`/api/contracts/${contractId}/lanes?laneId=${laneId}`, { method: "DELETE" });
      if (!res.ok && res.status !== 204) throw new Error("Failed to delete lane");

      setExpandedLanes((prev) => ({
        ...prev,
        [contractId]: (prev[contractId] || []).filter((l) => l.id !== laneId),
      }));
      fetchContracts();
    } catch {
      setError("Failed to delete lane");
    }
  };

  // ── AI Upload handlers ────────────────────────────────

  const handleContractFileUpload = async (file: File) => {
    setUploadParsing(true);
    setError(null);
    setParsedContract(null);
    setUploadFileName(file.name);

    const fd = new FormData();
    fd.append("file", file);

    try {
      const res = await fetch("/api/contracts/parse", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Parse failed");
      setParsedContract(data.extracted);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to parse contract");
    } finally {
      setUploadParsing(false);
    }
  };

  const handleUploadFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setUploadDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleContractFileUpload(file);
  };

  const handleUploadFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleContractFileUpload(file);
  };

  const handleSaveParsedContract = async () => {
    if (!parsedContract) return;
    setUploadSaving(true);
    setError(null);

    try {
      const lanes = (parsedContract.lanes || [])
        .filter((l) => l.origin_port && l.dest_port)
        .map((l) => ({
          originPort: (l.origin_port || "").slice(0, 10).toUpperCase(),
          originPortName: l.origin_port || "",
          destPort: (l.dest_port || "").slice(0, 10).toUpperCase(),
          destPortName: l.dest_port || "",
          rate20ft: l.rate_20ft ?? undefined,
          rate40ft: l.rate_40ft ?? undefined,
          rate40hc: l.rate_40hc ?? undefined,
          commodity: l.commodity || undefined,
        }));

      const res = await fetch("/api/contracts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          carrier: parsedContract.carrier || "Unknown",
          carrierCode: (parsedContract.carrier || "UNKN").slice(0, 4).toUpperCase(),
          contractType: "365_day",
          contractNumber: parsedContract.contract_number || undefined,
          startDate: parsedContract.start_date || new Date().toISOString().slice(0, 10),
          endDate: parsedContract.end_date || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
          notes: `Parsed from uploaded document: ${uploadFileName}`,
          lanes,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save contract");
      }

      setUploadSuccess(`Contract saved from ${uploadFileName}`);
      setShowUploadModal(false);
      setParsedContract(null);
      setUploadFileName(null);
      fetchContracts();
      setTimeout(() => setUploadSuccess(null), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save contract");
    } finally {
      setUploadSaving(false);
    }
  };

  const resetForm = () => {
    setFormCarrier(CARRIERS[0].name);
    setFormCarrierCode(CARRIERS[0].code);
    setFormContractType("90_day");
    setFormContractNumber("");
    setFormStartDate("");
    setFormEndDate("");
    setFormContactName("");
    setFormContactEmail("");
    setFormNotes("");
    setFormLanes([]);
    setError(null);
  };

  const addEmptyLane = () => {
    setFormLanes((prev) => [
      ...prev,
      { originPort: "", originPortName: "", destPort: "", destPortName: "", rate20ft: "", rate40ft: "", rate40hc: "", commodity: "" },
    ]);
  };

  const updateFormLane = (index: number, field: string, value: string) => {
    setFormLanes((prev) => prev.map((l, i) => (i === index ? { ...l, [field]: value } : l)));
  };

  const removeFormLane = (index: number) => {
    setFormLanes((prev) => prev.filter((_, i) => i !== index));
  };

  // Stats
  const activeContracts = contractsList.filter((c) => getStatus(c.endDate) === "active").length;
  const expiringSoon = contractsList.filter((c) => getStatus(c.endDate) === "expiring").length;
  const totalLanes = contractsList.reduce((sum, c) => sum + (c.laneCount || 0), 0);
  const uniqueCarriers = new Set(contractsList.map((c) => c.carrierCode)).size;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Contract Manager</h1>
          <p className="mt-1 text-sm text-navy-500">
            Track ocean freight contracts, lanes, and rates across carriers
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setShowUploadModal(true); setParsedContract(null); setError(null); }}
            className="inline-flex items-center gap-2 rounded-xl border border-ocean-200 bg-ocean-50 px-4 py-2.5 text-sm font-semibold text-ocean-700 shadow-sm transition-colors hover:bg-ocean-100"
          >
            <Sparkles className="h-4 w-4" />
            Upload Contract
          </button>
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            className="inline-flex items-center gap-2 rounded-xl bg-ocean-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-ocean-600"
          >
            <Plus className="h-4 w-4" />
            Add Contract
          </button>
        </div>
      </div>

      {/* Success banner */}
      {uploadSuccess && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {uploadSuccess}
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Active Contracts", value: activeContracts, icon: FileText, color: "text-ocean-600" },
          { label: "Total Lanes", value: totalLanes, icon: Route, color: "text-indigo-600" },
          { label: "Expiring Soon", value: expiringSoon, icon: Clock, color: expiringSoon > 0 ? "text-amber-600" : "text-navy-400" },
          { label: "Active Carriers", value: uniqueCarriers, icon: Ship, color: "text-emerald-600" },
        ].map((stat) => (
          <div key={stat.label} className="card rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-50">
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-navy-900">{stat.value}</p>
                <p className="text-xs text-navy-500">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Contract list */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-ocean-500" />
        </div>
      ) : contractsList.length === 0 ? (
        <div className="card rounded-2xl p-12 text-center">
          <FileText className="mx-auto h-12 w-12 text-navy-300" />
          <h3 className="mt-4 text-lg font-semibold text-navy-900">No contracts yet</h3>
          <p className="mt-1 text-sm text-navy-500">
            Add your first carrier contract to start tracking rates and lanes
          </p>
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-ocean-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-ocean-600"
          >
            <Plus className="h-4 w-4" />
            Add Contract
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {contractsList.map((contract) => {
            const status = getStatus(contract.endDate);
            const days = daysRemaining(contract.endDate);
            const isExpanded = expandedId === contract.id;
            const lanes = expandedLanes[contract.id] || [];

            return (
              <div key={contract.id} className="card rounded-2xl overflow-hidden">
                {/* Contract header row */}
                <div
                  className="flex items-center gap-4 p-4 cursor-pointer hover:bg-navy-50/50 transition-colors"
                  onClick={() => toggleExpand(contract.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      {carrierBadge(contract.carrier, contract.carrierCode)}
                      {contractTypeBadge(contract.contractType)}
                      {statusBadge(status)}
                    </div>
                    <div className="mt-1.5 flex items-center gap-4 text-xs text-navy-500">
                      <span>
                        {formatDate(contract.startDate)} — {formatDate(contract.endDate)}
                        <span className={`ml-1 font-semibold ${
                          status === "expired" ? "text-red-600" : status === "expiring" ? "text-amber-600" : "text-emerald-600"
                        }`}>
                          ({status === "expired" ? "Expired" : `${days}d left`})
                        </span>
                      </span>
                      <span className="text-navy-400">|</span>
                      <span>{contract.laneCount || 0} lanes</span>
                      {contract.contractNumber && (
                        <>
                          <span className="text-navy-400">|</span>
                          <span className="font-mono"># {contract.contractNumber}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(contract.id); }}
                      className="rounded-lg p-2 text-navy-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                      title="Delete contract"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5 text-navy-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-navy-400" />
                    )}
                  </div>
                </div>

                {/* Expanded lane details */}
                {isExpanded && (
                  <div className="border-t border-navy-100 bg-navy-50/30 p-4">
                    {/* Contact info */}
                    {(contract.contactName || contract.contactEmail || contract.notes) && (
                      <div className="mb-4 flex flex-wrap gap-4 text-xs text-navy-500">
                        {contract.contactName && <span>Contact: <span className="font-medium text-navy-700">{contract.contactName}</span></span>}
                        {contract.contactEmail && <span>Email: <a href={`mailto:${contract.contactEmail}`} className="font-medium text-ocean-600 hover:underline">{contract.contactEmail}</a></span>}
                        {contract.notes && <span className="w-full">Notes: <span className="text-navy-600">{contract.notes}</span></span>}
                      </div>
                    )}

                    {/* Lanes table */}
                    {lanes.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-navy-200 text-left text-xs font-semibold uppercase tracking-wider text-navy-500">
                              <th className="pb-2 pr-4">Origin</th>
                              <th className="pb-2 pr-4">Destination</th>
                              <th className="pb-2 pr-4 text-right">20ft</th>
                              <th className="pb-2 pr-4 text-right">40ft</th>
                              <th className="pb-2 pr-4 text-right">40HC</th>
                              <th className="pb-2 pr-4">Commodity</th>
                              <th className="pb-2 w-10"></th>
                            </tr>
                          </thead>
                          <tbody>
                            {lanes.map((lane) => (
                              <tr key={lane.id} className="border-b border-navy-100 last:border-0">
                                <td className="py-2 pr-4">
                                  <span className="font-mono text-xs font-semibold text-navy-700">{lane.originPort}</span>
                                  <span className="ml-1 text-navy-500">{lane.originPortName}</span>
                                </td>
                                <td className="py-2 pr-4">
                                  <span className="font-mono text-xs font-semibold text-navy-700">{lane.destPort}</span>
                                  <span className="ml-1 text-navy-500">{lane.destPortName}</span>
                                </td>
                                <td className="py-2 pr-4 text-right font-medium text-navy-800">{formatCurrency(lane.rate20ft)}</td>
                                <td className="py-2 pr-4 text-right font-medium text-navy-800">{formatCurrency(lane.rate40ft)}</td>
                                <td className="py-2 pr-4 text-right font-medium text-navy-800">{formatCurrency(lane.rate40hc)}</td>
                                <td className="py-2 pr-4 text-navy-500">{lane.commodity || "--"}</td>
                                <td className="py-2">
                                  <button
                                    onClick={() => handleDeleteLane(contract.id, lane.id)}
                                    className="rounded p-1 text-navy-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                                    title="Remove lane"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-sm text-navy-400 italic">No lanes added yet</p>
                    )}

                    {/* Add lane form (inline) */}
                    {addLaneContractId === contract.id ? (
                      <div className="mt-4 rounded-xl border border-navy-200 bg-white p-4">
                        <h4 className="text-sm font-semibold text-navy-900 mb-3">Add Lane</h4>
                        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                          <div>
                            <label className="block text-xs font-medium text-navy-600 mb-1">Origin Port Code</label>
                            <input className="input-light" placeholder="e.g. CNSHA" value={newLane.originPort} onChange={(e) => setNewLane({ ...newLane, originPort: e.target.value.toUpperCase() })} />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-navy-600 mb-1">Origin Name</label>
                            <input className="input-light" placeholder="e.g. Shanghai" value={newLane.originPortName} onChange={(e) => setNewLane({ ...newLane, originPortName: e.target.value })} />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-navy-600 mb-1">Dest Port Code</label>
                            <input className="input-light" placeholder="e.g. USLAX" value={newLane.destPort} onChange={(e) => setNewLane({ ...newLane, destPort: e.target.value.toUpperCase() })} />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-navy-600 mb-1">Dest Name</label>
                            <input className="input-light" placeholder="e.g. Los Angeles" value={newLane.destPortName} onChange={(e) => setNewLane({ ...newLane, destPortName: e.target.value })} />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-navy-600 mb-1">20ft Rate ($)</label>
                            <input className="input-light" type="number" placeholder="2500" value={newLane.rate20ft} onChange={(e) => setNewLane({ ...newLane, rate20ft: e.target.value })} />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-navy-600 mb-1">40ft Rate ($)</label>
                            <input className="input-light" type="number" placeholder="4000" value={newLane.rate40ft} onChange={(e) => setNewLane({ ...newLane, rate40ft: e.target.value })} />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-navy-600 mb-1">40HC Rate ($)</label>
                            <input className="input-light" type="number" placeholder="4300" value={newLane.rate40hc} onChange={(e) => setNewLane({ ...newLane, rate40hc: e.target.value })} />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-navy-600 mb-1">Commodity</label>
                            <input className="input-light" placeholder="e.g. Electronics" value={newLane.commodity} onChange={(e) => setNewLane({ ...newLane, commodity: e.target.value })} />
                          </div>
                        </div>
                        <div className="mt-3 flex gap-2">
                          <button
                            onClick={handleAddLane}
                            disabled={saving || !newLane.originPort || !newLane.destPort}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-ocean-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-ocean-600 disabled:opacity-50"
                          >
                            {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
                            Add Lane
                          </button>
                          <button
                            onClick={() => setAddLaneContractId(null)}
                            className="rounded-lg px-3 py-1.5 text-xs font-medium text-navy-600 hover:bg-navy-100 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setAddLaneContractId(contract.id)}
                        className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-dashed border-navy-300 px-3 py-1.5 text-xs font-medium text-navy-500 transition-colors hover:border-ocean-400 hover:text-ocean-600"
                      >
                        <Plus className="h-3 w-3" />
                        Add Lane
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── AI Upload Contract Modal ────────────────────── */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl">
            {/* Modal header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-navy-100 bg-white px-6 py-4 rounded-t-2xl">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-ocean-500" />
                <h2 className="text-lg font-bold text-navy-900">Upload Contract</h2>
              </div>
              <button
                onClick={() => { setShowUploadModal(false); setParsedContract(null); }}
                className="rounded-lg p-1.5 text-navy-400 hover:bg-navy-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-5">
              {/* Drop zone */}
              {!parsedContract && (
                <div
                  onDragOver={(e) => { e.preventDefault(); setUploadDragOver(true); }}
                  onDragLeave={() => setUploadDragOver(false)}
                  onDrop={handleUploadFileDrop}
                  onClick={() => uploadFileRef.current?.click()}
                  className={`cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-colors ${
                    uploadDragOver
                      ? "border-ocean-400 bg-ocean-50"
                      : "border-navy-300 hover:border-ocean-400 hover:bg-navy-50"
                  }`}
                >
                  <input
                    ref={uploadFileRef}
                    type="file"
                    accept=".pdf,image/*"
                    className="hidden"
                    onChange={handleUploadFileChange}
                  />
                  {uploadParsing ? (
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="h-10 w-10 animate-spin text-ocean-500" />
                      <p className="font-semibold text-navy-700">AI is reading your contract...</p>
                      <p className="text-sm text-navy-500">Extracting lanes and rates with Claude</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-ocean-50">
                        <Upload className="h-7 w-7 text-ocean-500" />
                      </div>
                      <div>
                        <p className="font-semibold text-navy-700">Drop your rate sheet or contract here</p>
                        <p className="mt-1 text-sm text-navy-500">PDF or image — AI will extract carrier, lanes, and rates</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Extracted Contract Preview */}
              {parsedContract && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                    <span className="text-sm font-semibold text-emerald-700">
                      AI extracted contract from {uploadFileName}
                    </span>
                    <button
                      onClick={() => { setParsedContract(null); setUploadFileName(null); }}
                      className="ml-auto text-emerald-500 hover:text-emerald-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Summary */}
                  <div className="rounded-xl border border-navy-200 bg-navy-50/50 p-4 space-y-3">
                    <h3 className="text-sm font-semibold text-navy-800">Contract Summary</h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-navy-500">Carrier:</span>
                        <span className="ml-2 font-semibold text-navy-800">{parsedContract.carrier || "--"}</span>
                      </div>
                      <div>
                        <span className="text-navy-500">Contract #:</span>
                        <span className="ml-2 font-mono font-semibold text-navy-800">{parsedContract.contract_number || "--"}</span>
                      </div>
                      <div>
                        <span className="text-navy-500">Start:</span>
                        <span className="ml-2 text-navy-800">{parsedContract.start_date || "--"}</span>
                      </div>
                      <div>
                        <span className="text-navy-500">End:</span>
                        <span className="ml-2 text-navy-800">{parsedContract.end_date || "--"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Lanes */}
                  {parsedContract.lanes && parsedContract.lanes.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-navy-800 mb-2">
                        Lanes ({parsedContract.lanes.length})
                      </h3>
                      <div className="overflow-x-auto rounded-xl border border-navy-200">
                        <table className="w-full text-xs">
                          <thead className="bg-navy-50 border-b border-navy-200">
                            <tr className="text-left font-semibold uppercase tracking-wider text-navy-500">
                              <th className="px-3 py-2">Origin</th>
                              <th className="px-3 py-2">Destination</th>
                              <th className="px-3 py-2 text-right">20ft</th>
                              <th className="px-3 py-2 text-right">40ft</th>
                              <th className="px-3 py-2 text-right">40HC</th>
                              <th className="px-3 py-2">Commodity</th>
                            </tr>
                          </thead>
                          <tbody>
                            {parsedContract.lanes.map((lane, i) => (
                              <tr key={i} className="border-b border-navy-100 last:border-0">
                                <td className="px-3 py-2 font-mono font-semibold text-navy-700">{lane.origin_port || "--"}</td>
                                <td className="px-3 py-2 font-mono font-semibold text-navy-700">{lane.dest_port || "--"}</td>
                                <td className="px-3 py-2 text-right text-navy-800">{lane.rate_20ft ? `$${lane.rate_20ft.toLocaleString()}` : "--"}</td>
                                <td className="px-3 py-2 text-right text-navy-800">{lane.rate_40ft ? `$${lane.rate_40ft.toLocaleString()}` : "--"}</td>
                                <td className="px-3 py-2 text-right text-navy-800">{lane.rate_40hc ? `$${lane.rate_40hc.toLocaleString()}` : "--"}</td>
                                <td className="px-3 py-2 text-navy-500">{lane.commodity || "--"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal footer */}
            <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-navy-100 bg-white px-6 py-4 rounded-b-2xl">
              <button
                onClick={() => { setShowUploadModal(false); setParsedContract(null); }}
                className="rounded-xl px-4 py-2 text-sm font-medium text-navy-600 hover:bg-navy-100 transition-colors"
              >
                Cancel
              </button>
              {parsedContract && (
                <button
                  onClick={handleSaveParsedContract}
                  disabled={uploadSaving}
                  className="inline-flex items-center gap-2 rounded-xl bg-ocean-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-ocean-600 disabled:opacity-50"
                >
                  {uploadSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  Save Contract
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Add Contract Modal ──────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl">
            {/* Modal header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-navy-100 bg-white px-6 py-4 rounded-t-2xl">
              <h2 className="text-lg font-bold text-navy-900">New Contract</h2>
              <button onClick={() => setShowModal(false)} className="rounded-lg p-1.5 text-navy-400 hover:bg-navy-100 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-5">
              {/* Carrier + Type */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-navy-700 mb-1">Carrier *</label>
                  <select
                    className="input-light"
                    value={formCarrier}
                    onChange={(e) => {
                      const c = CARRIERS.find((c) => c.name === e.target.value);
                      setFormCarrier(e.target.value);
                      setFormCarrierCode(c?.code || "");
                    }}
                  >
                    {CARRIERS.map((c) => (
                      <option key={c.code} value={c.name}>
                        {c.name} ({c.code})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-navy-700 mb-1">Contract Type *</label>
                  <select
                    className="input-light"
                    value={formContractType}
                    onChange={(e) => setFormContractType(e.target.value)}
                  >
                    {CONTRACT_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-navy-700 mb-1">Start Date *</label>
                  <input type="date" className="input-light" value={formStartDate} onChange={(e) => setFormStartDate(e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-navy-700 mb-1">End Date *</label>
                  <input type="date" className="input-light" value={formEndDate} onChange={(e) => setFormEndDate(e.target.value)} />
                </div>
              </div>

              {/* Contract number */}
              <div>
                <label className="block text-xs font-semibold text-navy-700 mb-1">Contract Number</label>
                <input className="input-light" placeholder="e.g. SC-2026-1234" value={formContractNumber} onChange={(e) => setFormContractNumber(e.target.value)} />
              </div>

              {/* Contact */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-navy-700 mb-1">Contact Name</label>
                  <input className="input-light" placeholder="Rep name" value={formContactName} onChange={(e) => setFormContactName(e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-navy-700 mb-1">Contact Email</label>
                  <input className="input-light" type="email" placeholder="rep@carrier.com" value={formContactEmail} onChange={(e) => setFormContactEmail(e.target.value)} />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-navy-700 mb-1">Notes</label>
                <textarea className="input-light min-h-[60px]" placeholder="Any relevant details..." value={formNotes} onChange={(e) => setFormNotes(e.target.value)} />
              </div>

              {/* Lanes */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-navy-700">Lanes</label>
                  <button onClick={addEmptyLane} className="inline-flex items-center gap-1 text-xs font-medium text-ocean-600 hover:text-ocean-700">
                    <Plus className="h-3 w-3" />
                    Add Lane
                  </button>
                </div>
                {formLanes.length === 0 ? (
                  <p className="text-xs text-navy-400 italic">No lanes added — you can add them after creating the contract</p>
                ) : (
                  <div className="space-y-3">
                    {formLanes.map((lane, i) => (
                      <div key={i} className="relative rounded-xl border border-navy-200 bg-navy-50/50 p-3">
                        <button onClick={() => removeFormLane(i)} className="absolute top-2 right-2 rounded p-1 text-navy-400 hover:text-red-500 transition-colors">
                          <X className="h-3.5 w-3.5" />
                        </button>
                        <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
                          <input className="input-light text-xs" placeholder="Origin Code" value={lane.originPort} onChange={(e) => updateFormLane(i, "originPort", e.target.value.toUpperCase())} />
                          <input className="input-light text-xs" placeholder="Origin Name" value={lane.originPortName} onChange={(e) => updateFormLane(i, "originPortName", e.target.value)} />
                          <input className="input-light text-xs" placeholder="Dest Code" value={lane.destPort} onChange={(e) => updateFormLane(i, "destPort", e.target.value.toUpperCase())} />
                          <input className="input-light text-xs" placeholder="Dest Name" value={lane.destPortName} onChange={(e) => updateFormLane(i, "destPortName", e.target.value)} />
                          <input className="input-light text-xs" type="number" placeholder="20ft $" value={lane.rate20ft} onChange={(e) => updateFormLane(i, "rate20ft", e.target.value)} />
                          <input className="input-light text-xs" type="number" placeholder="40ft $" value={lane.rate40ft} onChange={(e) => updateFormLane(i, "rate40ft", e.target.value)} />
                          <input className="input-light text-xs" type="number" placeholder="40HC $" value={lane.rate40hc} onChange={(e) => updateFormLane(i, "rate40hc", e.target.value)} />
                          <input className="input-light text-xs" placeholder="Commodity" value={lane.commodity} onChange={(e) => updateFormLane(i, "commodity", e.target.value)} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Modal footer */}
            <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-navy-100 bg-white px-6 py-4 rounded-b-2xl">
              <button
                onClick={() => setShowModal(false)}
                className="rounded-xl px-4 py-2 text-sm font-medium text-navy-600 hover:bg-navy-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={saving || !formCarrier || !formStartDate || !formEndDate}
                className="inline-flex items-center gap-2 rounded-xl bg-ocean-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-ocean-600 disabled:opacity-50"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Create Contract
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

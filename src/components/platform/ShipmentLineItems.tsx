"use client";

import { useCallback, useEffect, useState } from "react";
import { Boxes, DollarSign, Plus, Trash2, Upload } from "lucide-react";
import { DUTY_STATUS_LABELS, DUTY_STATUSES } from "@/lib/inventory/line-items";
import { parseLineItemCsv } from "@/lib/inventory/csv";
import { INCOTERMS, INCOTERM_PROFILES, type Incoterm, type TradeRole } from "@/lib/incoterms";
import type { DutyStatus } from "@/lib/db/schema";

/**
 * Container contents + Incoterm + sales, on the shipment detail page (AI-8869).
 *
 * This is the whole end-to-end flow in one panel: attach line items (manually
 * or by pasting a CSV out of the customer's ERP), set the Incoterm on the
 * sale, then record what the goods sold for. Everything downstream —
 * /platform/inventory and /platform/analytics — reads from what's entered here.
 */

interface LineItemRow {
  id: string;
  containerNumber: string | null;
  sku: string | null;
  description: string | null;
  htsCode: string | null;
  countryOfOrigin: string | null;
  quantity: string;
  unitOfMeasure: string | null;
  unitCostUsd: string;
  supplier: string | null;
  poRef: string | null;
  dutyStatus: DutyStatus;
  locationCode: string | null;
  allocatedLandedCostUsd: string | null;
}

interface Props {
  shipmentId: string;
  initialIncoterm?: Incoterm | null;
  initialTradeRole?: TradeRole;
}

const BLANK = {
  sku: "",
  description: "",
  htsCode: "",
  countryOfOrigin: "",
  quantity: "",
  unitCostUsd: "",
  supplier: "",
  poRef: "",
  containerNumber: "",
  locationCode: "",
  dutyStatus: "in_transit" as DutyStatus,
};

const num = (v: string | null) => {
  const n = Number(v ?? 0);
  return Number.isFinite(n) ? n : 0;
};
const currency = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });

export default function ShipmentLineItems({
  shipmentId,
  initialIncoterm = null,
  initialTradeRole = "buyer",
}: Props) {
  const [rows, setRows] = useState<LineItemRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [draft, setDraft] = useState({ ...BLANK });
  const [csv, setCsv] = useState("");
  const [showCsv, setShowCsv] = useState(false);
  const [saving, setSaving] = useState(false);

  const [incoterm, setIncoterm] = useState<Incoterm | "">(initialIncoterm ?? "");
  const [tradeRole, setTradeRole] = useState<TradeRole>(initialTradeRole);

  const [saleFor, setSaleFor] = useState<string | null>(null);
  const [sale, setSale] = useState({ quantitySold: "", unitSalePriceUsd: "", customer: "" });

  const fetchRows = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/shipments/${shipmentId}/line-items`);
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed to load line items");
      setRows((await res.json()).lineItems ?? []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load line items");
    } finally {
      setIsLoading(false);
    }
  }, [shipmentId]);

  useEffect(() => {
    fetchRows();
  }, [fetchRows]);

  const post = async (items: Record<string, unknown>[]) => {
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      const res = await fetch(`/api/shipments/${shipmentId}/line-items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Failed to save line items");
      setNotice(`Added ${body.lineItems.length} line item${body.lineItems.length === 1 ? "" : "s"}.`);
      await fetchRows();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save line items");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const addDraft = async () => {
    if (!draft.quantity || !draft.unitCostUsd) {
      setError("Quantity and unit cost are required.");
      return;
    }
    if (await post([{ ...draft }])) setDraft({ ...BLANK });
  };

  const importCsv = async () => {
    const parsed = parseLineItemCsv(csv);
    if (parsed.length === 0) {
      setError("No rows found. Include a header row with at least qty and unit cost columns.");
      return;
    }
    if (await post(parsed)) {
      setCsv("");
      setShowCsv(false);
    }
  };

  const remove = async (id: string) => {
    const res = await fetch(`/api/line-items/${id}`, { method: "DELETE" });
    if (res.ok || res.status === 204) setRows((prev) => prev.filter((r) => r.id !== id));
    else setError("Failed to delete line item.");
  };

  const saveIncoterm = async (term: Incoterm | "", role: TradeRole) => {
    setError(null);
    const res = await fetch(`/api/shipments/${shipmentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ incoterm: term || null, tradeRole: role }),
    });
    if (!res.ok) setError((await res.json()).error ?? "Failed to save Incoterm");
    else setNotice("Incoterm saved.");
  };

  const recordSale = async () => {
    if (!saleFor) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lineItemId: saleFor,
          quantitySold: Number(sale.quantitySold),
          unitSalePriceUsd: Number(sale.unitSalePriceUsd),
          customer: sale.customer || undefined,
        }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Failed to record sale");
      setNotice("Sale recorded — margin will show on the Profitability page.");
      setSaleFor(null);
      setSale({ quantitySold: "", unitSalePriceUsd: "", customer: "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to record sale");
    } finally {
      setSaving(false);
    }
  };

  const goodsValue = rows.reduce((s, r) => s + num(r.quantity) * num(r.unitCostUsd), 0);

  return (
    <div className="card rounded-2xl p-6 space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-navy-500 flex items-center gap-2">
            <Boxes className="h-4 w-4" />
            Container contents
          </h2>
          <p className="text-sm text-navy-500 mt-1">
            {rows.length} line{rows.length === 1 ? "" : "s"} · {currency(goodsValue)} of goods
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={incoterm}
            onChange={(e) => {
              const next = e.target.value as Incoterm | "";
              setIncoterm(next);
              saveIncoterm(next, tradeRole);
            }}
            aria-label="Incoterm"
            className="text-sm border border-navy-200 rounded-lg px-3 py-2 bg-white"
          >
            <option value="">Incoterm…</option>
            {INCOTERMS.map((t) => (
              <option key={t} value={t}>
                {t} — {INCOTERM_PROFILES[t].name}
              </option>
            ))}
          </select>
          <select
            value={tradeRole}
            onChange={(e) => {
              const next = e.target.value as TradeRole;
              setTradeRole(next);
              saveIncoterm(incoterm, next);
            }}
            aria-label="Our side of the sale"
            className="text-sm border border-navy-200 rounded-lg px-3 py-2 bg-white"
          >
            <option value="buyer">We are the buyer</option>
            <option value="seller">We are the seller</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-3 text-sm">
          {error}
        </div>
      )}
      {notice && !error && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg p-3 text-sm">
          {notice}
        </div>
      )}

      {/* Existing lines */}
      {isLoading ? (
        <p className="text-sm text-navy-500">Loading line items…</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-navy-500">
          No line items yet. Add what is inside this container to track inventory and margin.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-navy-400 border-b border-navy-200">
                <th className="pb-2 font-medium">SKU</th>
                <th className="pb-2 font-medium">HTS</th>
                <th className="pb-2 font-medium text-right">Qty</th>
                <th className="pb-2 font-medium text-right">Unit cost</th>
                <th className="pb-2 font-medium">Status</th>
                <th className="pb-2 font-medium text-right">Value</th>
                <th className="pb-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-100">
              {rows.map((row) => (
                <tr key={row.id}>
                  <td className="py-2">
                    <p className="font-medium text-navy-900">{row.sku ?? "—"}</p>
                    <p className="text-xs text-navy-500 truncate max-w-[200px]">
                      {row.description ?? ""}
                    </p>
                  </td>
                  <td className="py-2 text-navy-600 tabular-nums">{row.htsCode ?? "—"}</td>
                  <td className="py-2 text-right tabular-nums">{num(row.quantity)}</td>
                  <td className="py-2 text-right tabular-nums">
                    {currency(num(row.unitCostUsd))}
                  </td>
                  <td className="py-2 text-navy-600 text-xs">
                    {DUTY_STATUS_LABELS[row.dutyStatus]}
                  </td>
                  <td className="py-2 text-right tabular-nums font-medium">
                    {currency(num(row.quantity) * num(row.unitCostUsd))}
                  </td>
                  <td className="py-2 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => setSaleFor(saleFor === row.id ? null : row.id)}
                      className="text-ocean-600 hover:text-ocean-700 p-1"
                      title="Record a sale against this line"
                      aria-label="Record a sale"
                    >
                      <DollarSign className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(row.id)}
                      className="text-navy-400 hover:text-red-600 p-1"
                      title="Delete line item"
                      aria-label="Delete line item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Record a sale */}
      {saleFor && (
        <div className="border border-ocean-200 bg-ocean-50/50 rounded-xl p-4 space-y-3">
          <p className="text-sm font-medium text-navy-800">Record a sale</p>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
            <input
              value={sale.quantitySold}
              onChange={(e) => setSale({ ...sale, quantitySold: e.target.value })}
              placeholder="Units sold"
              inputMode="decimal"
              className="text-sm border border-navy-200 rounded-lg px-3 py-2"
            />
            <input
              value={sale.unitSalePriceUsd}
              onChange={(e) => setSale({ ...sale, unitSalePriceUsd: e.target.value })}
              placeholder="Sale price / unit"
              inputMode="decimal"
              className="text-sm border border-navy-200 rounded-lg px-3 py-2"
            />
            <input
              value={sale.customer}
              onChange={(e) => setSale({ ...sale, customer: e.target.value })}
              placeholder="Customer (optional)"
              className="text-sm border border-navy-200 rounded-lg px-3 py-2"
            />
            <button
              type="button"
              onClick={recordSale}
              disabled={saving || !sale.quantitySold || !sale.unitSalePriceUsd}
              className="text-sm bg-ocean-600 text-white rounded-lg px-3 py-2 hover:bg-ocean-700 disabled:opacity-50"
            >
              Save sale
            </button>
          </div>
        </div>
      )}

      {/* Add a line */}
      <div className="border-t border-navy-100 pt-4 space-y-3">
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
          <input
            value={draft.sku}
            onChange={(e) => setDraft({ ...draft, sku: e.target.value })}
            placeholder="SKU"
            className="text-sm border border-navy-200 rounded-lg px-3 py-2"
          />
          <input
            value={draft.description}
            onChange={(e) => setDraft({ ...draft, description: e.target.value })}
            placeholder="Description"
            className="text-sm border border-navy-200 rounded-lg px-3 py-2 sm:col-span-2"
          />
          <input
            value={draft.htsCode}
            onChange={(e) => setDraft({ ...draft, htsCode: e.target.value })}
            placeholder="HTS code"
            className="text-sm border border-navy-200 rounded-lg px-3 py-2"
          />
          <input
            value={draft.quantity}
            onChange={(e) => setDraft({ ...draft, quantity: e.target.value })}
            placeholder="Qty"
            inputMode="decimal"
            className="text-sm border border-navy-200 rounded-lg px-3 py-2"
          />
          <input
            value={draft.unitCostUsd}
            onChange={(e) => setDraft({ ...draft, unitCostUsd: e.target.value })}
            placeholder="Unit cost"
            inputMode="decimal"
            className="text-sm border border-navy-200 rounded-lg px-3 py-2"
          />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <input
            value={draft.supplier}
            onChange={(e) => setDraft({ ...draft, supplier: e.target.value })}
            placeholder="Supplier"
            className="text-sm border border-navy-200 rounded-lg px-3 py-2"
          />
          <input
            value={draft.locationCode}
            onChange={(e) => setDraft({ ...draft, locationCode: e.target.value })}
            placeholder="Location / FTZ"
            className="text-sm border border-navy-200 rounded-lg px-3 py-2"
          />
          <select
            value={draft.dutyStatus}
            onChange={(e) => setDraft({ ...draft, dutyStatus: e.target.value as DutyStatus })}
            aria-label="Customs status"
            className="text-sm border border-navy-200 rounded-lg px-3 py-2 bg-white"
          >
            {DUTY_STATUSES.map((s) => (
              <option key={s} value={s}>
                {DUTY_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={addDraft}
              disabled={saving}
              className="flex-1 inline-flex items-center justify-center gap-1.5 text-sm bg-ocean-600 text-white rounded-lg px-3 py-2 hover:bg-ocean-700 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
            <button
              type="button"
              onClick={() => setShowCsv((v) => !v)}
              className="inline-flex items-center gap-1.5 text-sm border border-navy-200 rounded-lg px-3 py-2 text-navy-700 hover:bg-navy-50"
              title="Paste a CSV export from your ERP"
            >
              <Upload className="w-4 h-4" />
              CSV
            </button>
          </div>
        </div>

        {showCsv && (
          <div className="space-y-2">
            <textarea
              value={csv}
              onChange={(e) => setCsv(e.target.value)}
              rows={6}
              placeholder={"sku,description,hts,qty,unit_cost,supplier,po\nBANANA-40LB,Cavendish 40lb,0803.90.00,1200,8.50,Fruta SA,PO-4471"}
              className="w-full text-sm font-mono border border-navy-200 rounded-lg px-3 py-2"
            />
            <p className="text-xs text-navy-500">
              Header row required. Column order doesn&apos;t matter — common ERP aliases
              (item_code, tariff_code, qty, unit_cost, vendor, po_number) are recognised.
            </p>
            <button
              type="button"
              onClick={importCsv}
              disabled={saving}
              className="text-sm bg-navy-800 text-white rounded-lg px-3 py-2 hover:bg-navy-900 disabled:opacity-50"
            >
              Import {parseLineItemCsv(csv).length || ""} rows
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

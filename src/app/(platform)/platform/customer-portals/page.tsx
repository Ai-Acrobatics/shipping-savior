"use client";

/**
 * Customer portal management (AI-12022).
 *
 * Mints and revokes the read-only share links an NVOCC hands to its own
 * customers. Codes come off the board (importMeta.customerCode) so the
 * operator picks from what actually exists rather than typing a code that
 * matches nothing and produces an empty portal.
 */

import { useCallback, useEffect, useState } from "react";
import {
  Check,
  Copy,
  ExternalLink,
  Eye,
  Loader2,
  Link2,
  RefreshCw,
  Trash2,
  X,
} from "lucide-react";

interface Portal {
  id: string;
  customerCode: string;
  label: string;
  token: string;
  enabled: boolean;
  lastViewedAt: string | null;
  viewCount: number;
}

interface CustomerCode {
  code: string;
  shipmentCount: number;
}

export default function CustomerPortalsPage() {
  const [portals, setPortals] = useState<Portal[]>([]);
  const [codes, setCodes] = useState<CustomerCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [newCode, setNewCode] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/customer-portals");
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      setPortals(data.portals ?? []);
      setCodes(data.customerCodes ?? []);
      setError(null);
    } catch {
      setError("Could not load customer portals");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const portalUrl = (token: string) =>
    typeof window === "undefined" ? `/track/${token}` : `${window.location.origin}/track/${token}`;

  const copy = async (portal: Portal) => {
    try {
      await navigator.clipboard.writeText(portalUrl(portal.token));
      setCopiedId(portal.id);
      setTimeout(() => setCopiedId(null), 1600);
    } catch {
      setError("Could not copy — select the link and copy it manually");
    }
  };

  const create = async () => {
    if (!newCode.trim()) {
      setError("Pick a customer code first");
      return;
    }
    setCreating(true);
    setError(null);
    try {
      const res = await fetch("/api/customer-portals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerCode: newCode.trim(), label: newLabel.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create portal");
      setNewCode("");
      setNewLabel("");
      await load();
      if (data.created === false) {
        setError(`A portal for ${newCode.trim().toUpperCase()} already exists — showing it below`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create portal");
    } finally {
      setCreating(false);
    }
  };

  const patch = async (portal: Portal, body: Record<string, unknown>) => {
    setBusyId(portal.id);
    setError(null);
    try {
      const res = await fetch(`/api/customer-portals/${portal.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update portal");
      setPortals((prev) => prev.map((p) => (p.id === portal.id ? data.portal : p)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update portal");
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (portal: Portal) => {
    if (!confirm(`Delete the portal for ${portal.label}? The link stops working immediately.`)) {
      return;
    }
    setBusyId(portal.id);
    try {
      const res = await fetch(`/api/customer-portals/${portal.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete portal");
      setPortals((prev) => prev.filter((p) => p.id !== portal.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete portal");
    } finally {
      setBusyId(null);
    }
  };

  const linked = new Set(portals.map((p) => p.customerCode));
  const unlinked = codes.filter((c) => !linked.has(c.code));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-navy-900">
          <Link2 className="h-6 w-6 text-ocean-500" />
          Customer Portals
        </h1>
        <p className="mt-1 text-sm text-navy-500">
          Give each customer a read-only tracking page for their own shipments — no login, no
          seat in your account, revocable any time.
        </p>
      </div>

      {error && (
        <div className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <span>{error}</span>
          <button onClick={() => setError(null)} aria-label="Dismiss">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Create */}
      <div className="card rounded-2xl p-5">
        <h2 className="text-base font-semibold text-navy-900">New portal</h2>
        <div className="mt-3 flex flex-wrap items-end gap-3">
          <div className="w-44">
            <label htmlFor="customerCode" className="mb-1 block text-xs font-medium text-navy-600">
              Customer code
            </label>
            <input
              id="customerCode"
              list="customer-codes"
              className="input-light"
              placeholder="e.g. C"
              value={newCode}
              onChange={(e) => setNewCode(e.target.value)}
            />
            <datalist id="customer-codes">
              {unlinked.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.shipmentCount} shipments
                </option>
              ))}
            </datalist>
          </div>
          <div className="w-64">
            <label htmlFor="label" className="mb-1 block text-xs font-medium text-navy-600">
              Customer name (shown on their page)
            </label>
            <input
              id="label"
              className="input-light"
              placeholder="e.g. Sunview Produce"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
            />
          </div>
          <button
            onClick={create}
            disabled={creating}
            className="inline-flex items-center gap-2 rounded-xl bg-ocean-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-ocean-600 disabled:opacity-50"
          >
            {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link2 className="h-4 w-4" />}
            Create link
          </button>
        </div>
        {unlinked.length > 0 && (
          <p className="mt-3 text-xs text-navy-500">
            On your board without a portal yet:{" "}
            {unlinked.map((c) => (
              <button
                key={c.code}
                onClick={() => setNewCode(c.code)}
                className="mr-1.5 rounded-full bg-navy-100 px-2 py-0.5 font-medium text-navy-700 hover:bg-navy-200"
              >
                {c.code} ({c.shipmentCount})
              </button>
            ))}
          </p>
        )}
      </div>

      {/* Existing */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-ocean-500" />
        </div>
      ) : portals.length === 0 ? (
        <div className="card rounded-2xl p-12 text-center">
          <Link2 className="mx-auto h-10 w-10 text-navy-300" />
          <h3 className="mt-3 text-lg font-semibold text-navy-900">No customer portals yet</h3>
          <p className="mt-1 text-sm text-navy-500">
            Create one above and send your customer the link.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {portals.map((portal) => (
            <div key={portal.id} className="card rounded-2xl p-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-navy-900">{portal.label}</span>
                <span className="rounded-full bg-navy-100 px-2.5 py-0.5 font-mono text-xs font-medium text-navy-600">
                  {portal.customerCode}
                </span>
                {!portal.enabled && (
                  <span className="rounded-full border border-red-200 bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-700">
                    Disabled
                  </span>
                )}
                <span className="ml-auto inline-flex items-center gap-1 text-xs text-navy-500">
                  <Eye className="h-3 w-3" />
                  {portal.viewCount} view{portal.viewCount === 1 ? "" : "s"}
                  {portal.lastViewedAt
                    ? ` · last ${new Date(portal.lastViewedAt).toLocaleDateString("en-US")}`
                    : ""}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <code className="flex-1 truncate rounded-lg bg-navy-50 px-3 py-2 text-xs text-navy-700">
                  {portalUrl(portal.token)}
                </code>
                <button
                  onClick={() => copy(portal)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-navy-200 px-3 py-2 text-xs font-medium text-navy-700 hover:bg-navy-50"
                >
                  {copiedId === portal.id ? (
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  {copiedId === portal.id ? "Copied" : "Copy"}
                </button>
                <a
                  href={portalUrl(portal.token)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-navy-200 px-3 py-2 text-xs font-medium text-navy-700 hover:bg-navy-50"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Open
                </a>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-navy-100 pt-3">
                <button
                  onClick={() => patch(portal, { enabled: !portal.enabled })}
                  disabled={busyId === portal.id}
                  className="rounded-lg border border-navy-200 px-3 py-1.5 text-xs font-medium text-navy-700 hover:bg-navy-50 disabled:opacity-50"
                >
                  {portal.enabled ? "Disable" : "Enable"}
                </button>
                <button
                  onClick={() => {
                    if (
                      confirm(
                        "Issue a new link? The current URL stops working — use this if the old one went to the wrong inbox."
                      )
                    ) {
                      patch(portal, { rotateToken: true });
                    }
                  }}
                  disabled={busyId === portal.id}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-navy-200 px-3 py-1.5 text-xs font-medium text-navy-700 hover:bg-navy-50 disabled:opacity-50"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  New link
                </button>
                <button
                  onClick={() => remove(portal)}
                  disabled={busyId === portal.id}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

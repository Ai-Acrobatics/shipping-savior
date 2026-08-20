"use client";

import { useState } from "react";
import Link from "next/link";
import { Download, ShieldAlert, Loader2 } from "lucide-react";

/**
 * Self-service GDPR controls (AI-8780).
 *
 * Article 15 (access) and Article 17 (erasure) are rights the data subject
 * exercises, so the endpoints have to be reachable from the product — an
 * API that only curl can reach does not satisfy either article.
 *
 * Deletion is gated behind typing the account email, which is harder to do by
 * muscle memory than clicking a confirm button and matches the wording users
 * expect from other SaaS destructive actions.
 */

const CONFIRM_PHRASE = "DELETE MY ACCOUNT";

export default function PrivacyControls({ email }: { email: string }) {
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const [confirmEmail, setConfirmEmail] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const emailMatches = confirmEmail.trim().toLowerCase() === email.trim().toLowerCase();

  const handleExport = async () => {
    setExporting(true);
    setExportError(null);
    try {
      const res = await fetch("/api/account/export");
      if (!res.ok) {
        throw new Error(`Export failed (${res.status})`);
      }
      // Stream to a blob so the browser saves the archive rather than trying to
      // render it — a plain <a href> would lose the session on some browsers.
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `shipping-savior-export-${new Date().toISOString().slice(0, 10)}.zip`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      setExportError(
        error instanceof Error
          ? `We couldn't build your export. ${error.message}`
          : "We couldn't build your export. Please try again."
      );
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = async () => {
    if (!emailMatches) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch("/api/account/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: CONFIRM_PHRASE }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error ?? `Deletion failed (${res.status})`);
      }
      // Everything is gone — bail out of the authenticated shell entirely.
      window.location.href = "/api/auth/signout?callbackUrl=/";
    } catch (error) {
      setDeleteError(
        error instanceof Error ? error.message : "We couldn't delete your account."
      );
      setDeleting(false);
    }
  };

  return (
    <div className="p-6 space-y-8">
      <div>
        <h3 className="font-medium text-navy-900">Export your data</h3>
        <p className="mt-1 text-sm text-navy-500">
          Download a ZIP archive of your profile, shipments, calculations, contracts,
          audit log, and cookie-consent history. Your password is never included —
          it is stored only as a one-way hash.
        </p>
        <button
          type="button"
          onClick={handleExport}
          disabled={exporting}
          className="mt-3 inline-flex items-center gap-2 rounded-lg border border-navy-200 px-4 py-2 text-sm font-medium text-navy-700 transition-colors hover:border-ocean-300 hover:text-ocean-700 disabled:opacity-60"
        >
          {exporting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          {exporting ? "Building your export…" : "Download my data"}
        </button>
        {exportError && (
          <p role="alert" className="mt-2 text-sm text-red-600">
            {exportError}
          </p>
        )}
      </div>

      <div className="border-t border-navy-100 pt-6">
        <h3 className="font-medium text-navy-900">Delete your account</h3>
        <p className="mt-1 text-sm text-navy-500">
          This permanently removes your account and, if you are the only member,
          your organization and all of its shipments, calculations, and contracts.
          Any active subscription is cancelled. This cannot be undone.
        </p>
        <label
          htmlFor="confirm-delete-email"
          className="mt-4 block text-sm font-medium text-navy-700"
        >
          Type <span className="font-mono text-navy-900">{email}</span> to confirm
        </label>
        <input
          id="confirm-delete-email"
          type="email"
          autoComplete="off"
          value={confirmEmail}
          onChange={(e) => setConfirmEmail(e.target.value)}
          placeholder={email}
          className="mt-1 w-full max-w-sm rounded-lg border border-navy-200 px-3 py-2 text-sm text-navy-900 focus:border-ocean-400 focus:outline-none"
        />
        <button
          type="button"
          onClick={handleDelete}
          disabled={!emailMatches || deleting}
          className="mt-3 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
        >
          {deleting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ShieldAlert className="h-4 w-4" />
          )}
          {deleting ? "Deleting…" : "Delete my account permanently"}
        </button>
        {deleteError && (
          <p role="alert" className="mt-2 text-sm text-red-600">
            {deleteError}
          </p>
        )}
      </div>

      <p className="border-t border-navy-100 pt-6 text-xs text-navy-400">
        Read how we handle your data in our{" "}
        <Link href="/privacy" className="text-ocean-600 hover:text-ocean-700 underline">
          Privacy Policy
        </Link>
        ,{" "}
        <Link href="/sub-processors" className="text-ocean-600 hover:text-ocean-700 underline">
          sub-processor register
        </Link>
        , and{" "}
        <Link href="/security" className="text-ocean-600 hover:text-ocean-700 underline">
          security overview
        </Link>
        .
      </p>
    </div>
  );
}

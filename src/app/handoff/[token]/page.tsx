/**
 * Broker-facing handoff page — AI-12018
 *
 * The page a customs broker lands on from the emailed link. No login, no
 * account, no app shell — they are not a user of this product and never will
 * be. One page: is this set clear to file, what needs fixing, and the download.
 *
 * Rendered server-side straight from the stored manifest so the web view and
 * the copy inside the ZIP are the same bytes of markup. Expiry and revocation
 * are re-checked here rather than trusted from the link.
 */

import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { brokerHandoffs, brokerHandoffAccess } from "@/lib/db/schema";
import {
  formatRemaining,
  hashShareToken,
  isWellFormedShareToken,
  linkStatusMessage,
  renderCoverSheetBodyHtml,
  resolveLinkState,
  type HandoffManifest,
  type HandoffLinkStatus,
} from "@/lib/handoff";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// A handoff link in a search index would defeat the entire expiry design.
export const metadata: Metadata = {
  title: "Customs broker handoff package",
  robots: { index: false, follow: false, nocache: true },
};

interface PageProps {
  params: { token: string };
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-5 py-12">{children}</div>
    </main>
  );
}

function Unavailable({ status, message }: { status: HandoffLinkStatus | "unknown"; message: string }) {
  return (
    <Shell>
      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
        <p className="text-xs font-bold uppercase tracking-[.12em] text-slate-500 mb-2">
          Customs broker handoff
        </p>
        <h1 className="text-2xl font-bold text-slate-900 mb-3">
          {status === "revoked"
            ? "This link was revoked"
            : status === "expired"
              ? "This link has expired"
              : "This link is not valid"}
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed max-w-md mx-auto">{message}</p>
      </div>
    </Shell>
  );
}

export default async function HandoffPage({ params }: PageProps) {
  const token = params.token;

  if (!isWellFormedShareToken(token)) {
    return (
      <Unavailable
        status="unknown"
        message="Check that the whole link was copied — handoff links are long and email clients sometimes break them across lines."
      />
    );
  }

  let row;
  try {
    const [found] = await db
      .select({
        id: brokerHandoffs.id,
        manifestJson: brokerHandoffs.manifestJson,
        zipFileName: brokerHandoffs.zipFileName,
        zipSizeBytes: brokerHandoffs.zipSizeBytes,
        expiresAt: brokerHandoffs.expiresAt,
        revokedAt: brokerHandoffs.revokedAt,
      })
      .from(brokerHandoffs)
      .where(eq(brokerHandoffs.tokenHash, hashShareToken(token)))
      .limit(1);
    row = found;
  } catch (error) {
    console.error("[handoff page] Lookup failed:", error);
    return (
      <Unavailable
        status="unknown"
        message="This package could not be opened right now. Try again in a few minutes, or ask the sender to re-issue the link."
      />
    );
  }

  if (!row) {
    return (
      <Unavailable
        status="unknown"
        message="Check that the whole link was copied — handoff links are long and email clients sometimes break them across lines."
      />
    );
  }

  const state = resolveLinkState({ expiresAt: row.expiresAt, revokedAt: row.revokedAt });
  if (state.status !== "active") {
    try {
      await db.insert(brokerHandoffAccess).values({
        handoffId: row.id,
        action: "denied",
        reason: state.status,
      });
    } catch {
      // Evidence, not a gate.
    }
    return <Unavailable status={state.status} message={linkStatusMessage(state.status)} />;
  }

  try {
    await db.insert(brokerHandoffAccess).values({ handoffId: row.id, action: "view" });
  } catch {
    // Evidence, not a gate.
  }

  const manifest = row.manifestJson as unknown as HandoffManifest;
  const sizeMb = row.zipSizeBytes ? (row.zipSizeBytes / 1024 / 1024).toFixed(1) : null;

  return (
    <Shell>
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-slate-200 bg-white">
          <div>
            <p className="text-xs font-semibold text-slate-500">
              Link expires in {formatRemaining(state.secondsRemaining)}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              {manifest.documents.length} document
              {manifest.documents.length === 1 ? "" : "s"}
              {sizeMb ? ` · ${sizeMb} MB` : ""}
            </p>
          </div>
          <a
            href={`/api/handoff/share/${encodeURIComponent(token)}?download=1`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition-colors"
          >
            Download package (.zip)
          </a>
        </div>

        {/* Server-rendered from the stored manifest; every interpolated value
            is HTML-escaped in renderCoverSheetBodyHtml. */}
        <div dangerouslySetInnerHTML={{ __html: renderCoverSheetBodyHtml(manifest) }} />
      </div>
    </Shell>
  );
}

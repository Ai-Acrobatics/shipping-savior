/**
 * Public customs broker handoff link — AI-12018
 *
 * GET /api/handoff/share/:token           → manifest, for the broker-facing page
 * GET /api/handoff/share/:token?download=1 → the ZIP itself
 *
 * The only unauthenticated route in the platform that returns shipment data,
 * so the rules are tight:
 *
 *   * The token is 256 bits of CSPRNG entropy, stored as a SHA-256 hash and
 *     looked up by that hash — one indexed read, no scan over live tokens.
 *   * Expiry and revocation are checked on every hit, including downloads. A
 *     link that worked an hour ago is not evidence it works now.
 *   * The ZIP is streamed through this route rather than redirected to. Vercel
 *     Blob is public-read and permanent; handing out that URL would make the
 *     expiry cosmetic.
 *   * Denied hits are logged too. "Was the dead link still being tried after
 *     we revoked it" is a question someone asks after a shipment goes wrong.
 */

import { NextRequest, NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { brokerHandoffs, brokerHandoffAccess } from "@/lib/db/schema";
import {
  hashShareToken,
  isWellFormedShareToken,
  linkStatusMessage,
  resolveLinkState,
  type HandoffManifest,
} from "@/lib/handoff";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Never cache a token-gated response at the edge or in the browser. */
const NO_STORE = {
  "Cache-Control": "no-store, no-cache, must-revalidate, private",
  // A handoff link should never turn up in a broker's outbound referer chain.
  "Referrer-Policy": "no-referrer",
  "X-Robots-Tag": "noindex, nofollow, noarchive",
};

function clientIp(request: NextRequest): string | null {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim().slice(0, 64) || null;
  return request.headers.get("x-real-ip")?.slice(0, 64) ?? null;
}

async function logAccess(args: {
  handoffId: string;
  action: "view" | "download" | "denied";
  reason?: string | null;
  request: NextRequest;
}) {
  try {
    await db.insert(brokerHandoffAccess).values({
      handoffId: args.handoffId,
      action: args.action,
      reason: args.reason ?? null,
      ipAddress: clientIp(args.request),
      userAgent: args.request.headers.get("user-agent")?.slice(0, 500) ?? null,
    });
  } catch (error) {
    // The access log is evidence, not a gate. Losing a row must not cost the
    // broker their download.
    console.error("[handoff/share] Failed to write access log:", error);
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  const token = params.token;

  // Malformed tokens never existed — reject without touching the database.
  if (!isWellFormedShareToken(token)) {
    return NextResponse.json(
      { error: "This handoff link is not valid." },
      { status: 404, headers: NO_STORE }
    );
  }

  let row;
  try {
    const [found] = await db
      .select({
        id: brokerHandoffs.id,
        manifestJson: brokerHandoffs.manifestJson,
        zipBlobUrl: brokerHandoffs.zipBlobUrl,
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
    console.error("[handoff/share] Lookup failed:", error);
    return NextResponse.json(
      { error: "Could not open this handoff package. Try again shortly." },
      { status: 500, headers: NO_STORE }
    );
  }

  // Unknown token and revoked token deliberately look different: a broker
  // needs to know whether to ask for a new link or stop filing.
  if (!row) {
    return NextResponse.json(
      { error: "This handoff link is not valid." },
      { status: 404, headers: NO_STORE }
    );
  }

  const state = resolveLinkState({ expiresAt: row.expiresAt, revokedAt: row.revokedAt });
  if (state.status !== "active") {
    void logAccess({ handoffId: row.id, action: "denied", reason: state.status, request });
    return NextResponse.json(
      { error: linkStatusMessage(state.status), status: state.status },
      { status: 410, headers: NO_STORE }
    );
  }

  const manifest = row.manifestJson as unknown as HandoffManifest;
  const wantsDownload = request.nextUrl.searchParams.get("download") === "1";

  if (!wantsDownload) {
    void logAccess({ handoffId: row.id, action: "view", request });
    return NextResponse.json(
      {
        manifest,
        link: state,
        fileName: row.zipFileName,
        sizeBytes: row.zipSizeBytes,
      },
      { headers: NO_STORE }
    );
  }

  if (!row.zipBlobUrl) {
    return NextResponse.json(
      { error: "The archive for this package is missing. Ask the sender to re-issue it." },
      { status: 404, headers: NO_STORE }
    );
  }

  let archive: ArrayBuffer;
  try {
    const upstream = await fetch(row.zipBlobUrl, { cache: "no-store" });
    if (!upstream.ok) throw new Error(`blob responded ${upstream.status}`);
    archive = await upstream.arrayBuffer();
  } catch (error) {
    console.error("[handoff/share] Failed to read the archive:", error);
    return NextResponse.json(
      { error: "The archive could not be read. Try again shortly." },
      { status: 502, headers: NO_STORE }
    );
  }

  try {
    const now = new Date();
    await db
      .update(brokerHandoffs)
      .set({
        downloadCount: sql`${brokerHandoffs.downloadCount} + 1`,
        lastAccessedAt: now,
        firstAccessedAt: sql`coalesce(${brokerHandoffs.firstAccessedAt}, ${now})`,
      })
      .where(eq(brokerHandoffs.id, row.id));
  } catch (error) {
    console.error("[handoff/share] Failed to record the download:", error);
  }
  void logAccess({ handoffId: row.id, action: "download", request });

  const fileName = (row.zipFileName ?? "customs-handoff.zip").replace(/[^a-zA-Z0-9._-]/g, "-");
  return new NextResponse(archive, {
    headers: {
      ...NO_STORE,
      "Content-Type": "application/zip",
      "Content-Length": String(archive.byteLength),
      "Content-Disposition": `attachment; filename="${fileName}"`,
    },
  });
}

/**
 * Customs broker handoff package — AI-12018
 *
 * POST /api/handoff  — package a validated document set for a customs broker
 * GET  /api/handoff  — list the org's packages and their link state
 *
 * The end of the document pipeline. AI-12016 reads the documents and checks
 * each one; this hands the result to the human who files the entry, as one ZIP
 * with a cover sheet and a link that stops working.
 *
 * Two rules the route owns and the pure layer cannot:
 *
 *   1. A set with unresolved blockers is refused (409) unless the caller
 *      explicitly acknowledges them. Shipping a broker a package that reads
 *      like a delivery receipt while the ISF is late is the failure mode this
 *      whole feature exists to prevent.
 *   2. The ZIP's blob URL never leaves the server. Vercel Blob is public-read
 *      and permanent, so returning it would make "time-limited" a lie — the
 *      bytes are streamed back through the token-checked share route instead.
 */

import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { put } from "@vercel/blob";
import { and, desc, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { brokerHandoffs, organizations, tradeDocuments } from "@/lib/db/schema";
import { hasPermission, type OrgRoleType } from "@/lib/auth/permissions";
import {
  reconcileDocumentSet,
  type DocumentExtraction,
  type DocumentValidation,
  type ShipmentProfile,
} from "@/lib/documents";
import {
  buildHandoffManifest,
  buildHandoffZip,
  clampExpiryHours,
  DEFAULT_EXPIRY_HOURS,
  documentKey,
  expiryFrom,
  generateShareToken,
  handoffFileName,
  hashShareToken,
  MAX_EXPIRY_HOURS,
  MAX_ORIGINAL_BYTES,
  MIN_EXPIRY_HOURS,
  planArchive,
  resolveLinkState,
  tokenPrefix,
  type HandoffSourceDocument,
} from "@/lib/handoff";

// zlib and Buffer — the ZIP writer is Node-only, not edge.
export const runtime = "nodejs";
// Fetching up to 25 originals from blob storage and deflating them is well
// past the 10s default.
export const maxDuration = 60;

/** How long we will wait on blob storage for one original before giving up. */
const ORIGINAL_FETCH_TIMEOUT_MS = 15_000;

const bodySchema = z.object({
  documentIds: z.array(z.string().uuid()).min(1).max(25),
  shipmentId: z.string().uuid().optional(),
  reference: z.string().trim().max(200).optional(),
  brokerName: z.string().trim().max(300).optional(),
  brokerEmail: z.string().trim().email().max(320).optional(),
  notes: z.string().trim().max(2000).optional(),
  expiresInHours: z.number().int().min(MIN_EXPIRY_HOURS).max(MAX_EXPIRY_HOURS).optional(),
  profile: z
    .object({
      containsPlantProduct: z.boolean().optional(),
      containsFdaRegulatedProduct: z.boolean().optional(),
      claimsPreferentialOrigin: z.boolean().optional(),
      oceanImportToUs: z.boolean().optional(),
    })
    .optional(),
  /** Package anyway, with the blockers stamped across the cover sheet. */
  acknowledgeBlockers: z.boolean().optional(),
});

/** Documents come back in the order the caller listed them — filing order. */
function orderByRequest<T extends { id: string }>(rows: T[], ids: string[]): T[] {
  const byId = new Map(rows.map((row) => [row.id, row]));
  return ids.map((id) => byId.get(id)).filter((row): row is T => !!row);
}

async function fetchOriginal(url: string): Promise<Buffer | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ORIGINAL_FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal, cache: "no-store" });
    if (!res.ok) return null;
    const declared = Number(res.headers.get("content-length") ?? "0");
    if (declared > MAX_ORIGINAL_BYTES) return null;
    const buffer = Buffer.from(await res.arrayBuffer());
    return buffer.length > MAX_ORIGINAL_BYTES ? null : buffer;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const orgId = session.user.orgId;

  if (!hasPermission((session.user.role ?? "viewer") as OrgRoleType, "handoff:share")) {
    return NextResponse.json(
      {
        error:
          "Your role can view documents but cannot send a handoff package. Ask an admin to share it.",
      },
      { status: 403 }
    );
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid handoff request",
        details: parsed.error.issues.map((i) => ({
          field: i.path.join("."),
          message: i.message,
        })),
      },
      { status: 400 }
    );
  }
  const input = parsed.data;
  const profile: ShipmentProfile = input.profile ?? {};

  // ── 1. Load the set, scoped to the caller's org ─────────
  let rows;
  try {
    rows = await db
      .select({
        id: tradeDocuments.id,
        documentType: tradeDocuments.documentType,
        fileName: tradeDocuments.fileName,
        fileType: tradeDocuments.fileType,
        blobUrl: tradeDocuments.blobUrl,
        extractedJson: tradeDocuments.extractedJson,
        validationJson: tradeDocuments.validationJson,
      })
      .from(tradeDocuments)
      .where(and(eq(tradeDocuments.orgId, orgId), inArray(tradeDocuments.id, input.documentIds)));
  } catch (error) {
    console.error("[handoff] Failed to load trade documents:", error);
    return NextResponse.json({ error: "Failed to load documents" }, { status: 500 });
  }

  if (rows.length !== input.documentIds.length) {
    // Packaging a partial set would produce a cover sheet that reports an
    // all-clear over documents that were never read.
    return NextResponse.json(
      {
        error:
          "One or more documents were not found for this organization. A partial set would report a false all-clear.",
      },
      { status: 404 }
    );
  }

  const ordered = orderByRequest(rows, input.documentIds);
  const extractions: DocumentExtraction[] = ordered.map((row) => ({
    type: row.documentType as DocumentExtraction["type"],
    fields: (row.extractedJson as Record<string, unknown>) ?? {},
    confidence: {},
  }));

  // ── 2. Reconcile before anything is built ───────────────
  const reconciliation = reconcileDocumentSet(extractions, profile);

  const perDocumentBlockers = ordered.reduce((total, row) => {
    const validation = row.validationJson as DocumentValidation | null;
    return total + (validation?.issues.filter((i) => i.severity === "blocker").length ?? 0);
  }, 0);
  const totalBlockers =
    perDocumentBlockers +
    reconciliation.findings.filter((f) => f.severity === "blocker").length +
    reconciliation.missingDocuments.length;

  if (totalBlockers > 0 && !input.acknowledgeBlockers) {
    return NextResponse.json(
      {
        error:
          "This document set has unresolved blockers. Fix them, or re-send with acknowledgeBlockers to release the package with the blockers stamped on the cover sheet.",
        blockerCount: totalBlockers,
        report: reconciliation,
      },
      { status: 409 }
    );
  }

  // ── 3. Pull the originals ───────────────────────────────
  const originals = await Promise.all(
    ordered.map((row) => (row.blobUrl ? fetchOriginal(row.blobUrl) : Promise.resolve(null)))
  );

  const documents: HandoffSourceDocument[] = ordered.map((row, i) => ({
    documentId: row.id,
    type: row.documentType as DocumentExtraction["type"],
    fileName: row.fileName,
    fileType: row.fileType,
    fields: (row.extractedJson as Record<string, unknown>) ?? {},
    validation: (row.validationJson as DocumentValidation | null) ?? null,
    original: originals[i],
    omissionReason: row.blobUrl
      ? originals[i]
        ? null
        : "The stored original could not be retrieved when this package was built. Request it directly."
      : "The original file was never stored for this document — only the extracted data is available.",
  }));

  // ── 4. Build the package ────────────────────────────────
  const now = new Date();
  const expiresAt = expiryFrom(now, input.expiresInHours ?? DEFAULT_EXPIRY_HOURS);
  const token = generateShareToken();

  let organizationName: string | null = null;
  try {
    const [org] = await db
      .select({ name: organizations.name })
      .from(organizations)
      .where(eq(organizations.id, orgId))
      .limit(1);
    organizationName = org?.name ?? null;
  } catch {
    // Cosmetic on the cover sheet — never worth failing the build for.
  }

  const plan = planArchive(documents);
  const packageId = randomUUID();
  const manifest = buildHandoffManifest({
    packageId,
    documents,
    reconciliation,
    profile,
    archivePaths: plan.archivePaths,
    omissionReasons: plan.omissionReasons,
    generatedAt: now,
    expiresAt,
    organizationName,
    userName: session.user.name ?? session.user.email ?? null,
    brokerName: input.brokerName ?? null,
    brokerEmail: input.brokerEmail ?? null,
    reference: input.reference ?? null,
    notes: input.notes ?? null,
    releasedWithBlockers: !!input.acknowledgeBlockers,
  });

  let zip: Buffer;
  try {
    zip = buildHandoffZip({
      manifest,
      documents,
      archivePaths: plan.archivePaths,
      generatedAt: now,
    });
  } catch (error) {
    console.error("[handoff] Failed to build the archive:", error);
    return NextResponse.json({ error: "Failed to build the handoff package." }, { status: 500 });
  }

  const fileName = handoffFileName(manifest);

  // ── 5. Store it ─────────────────────────────────────────
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      {
        error:
          "Share links need blob storage, which is not configured on this deployment. The package built successfully — retry once BLOB_READ_WRITE_TOKEN is set.",
      },
      { status: 503 }
    );
  }

  let zipBlobUrl: string;
  try {
    const blob = await put(`handoff/${packageId}/${fileName}`, zip, {
      access: "public",
      contentType: "application/zip",
      addRandomSuffix: false,
    });
    zipBlobUrl = blob.url;
  } catch (error) {
    console.error("[handoff] Failed to store the archive:", error);
    return NextResponse.json({ error: "Failed to store the handoff package." }, { status: 502 });
  }

  // ── 6. Mint the link ────────────────────────────────────
  let handoffId: string;
  try {
    const [inserted] = await db
      .insert(brokerHandoffs)
      .values({
        orgId,
        shipmentId: input.shipmentId ?? null,
        createdByUserId: session.user.id ?? null,
        reference: input.reference ?? null,
        brokerName: input.brokerName ?? null,
        brokerEmail: input.brokerEmail ?? null,
        tokenHash: hashShareToken(token),
        tokenPrefix: tokenPrefix(token),
        documentIds: input.documentIds,
        manifestJson: manifest as unknown as Record<string, unknown>,
        reconciliationJson: reconciliation as unknown as Record<string, unknown>,
        clearedToFile: manifest.clearedToFile,
        releasedWithBlockers: manifest.releasedWithBlockers,
        blockerCount: manifest.blockerCount,
        warningCount: manifest.warningCount,
        zipBlobUrl,
        zipFileName: fileName,
        zipSizeBytes: zip.byteLength,
        expiresAt,
      })
      .returning({ id: brokerHandoffs.id });
    handoffId = inserted.id;
  } catch (error) {
    console.error("[handoff] Failed to record the handoff:", error);
    return NextResponse.json(
      { error: "The package was built but could not be recorded. Try again." },
      { status: 500 }
    );
  }

  const shareUrl = new URL(`/handoff/${token}`, request.nextUrl.origin).toString();

  return NextResponse.json(
    {
      success: true,
      handoffId,
      packageId,
      shareUrl,
      expiresAt: expiresAt.toISOString(),
      fileName,
      sizeBytes: zip.byteLength,
      clearedToFile: manifest.clearedToFile,
      releasedWithBlockers: manifest.releasedWithBlockers,
      blockerCount: manifest.blockerCount,
      warningCount: manifest.warningCount,
      omissions: plan.omissions,
      manifest,
    },
    { status: 201 }
  );
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const rows = await db
      .select({
        id: brokerHandoffs.id,
        reference: brokerHandoffs.reference,
        brokerName: brokerHandoffs.brokerName,
        brokerEmail: brokerHandoffs.brokerEmail,
        tokenPrefix: brokerHandoffs.tokenPrefix,
        documentIds: brokerHandoffs.documentIds,
        clearedToFile: brokerHandoffs.clearedToFile,
        releasedWithBlockers: brokerHandoffs.releasedWithBlockers,
        blockerCount: brokerHandoffs.blockerCount,
        warningCount: brokerHandoffs.warningCount,
        zipFileName: brokerHandoffs.zipFileName,
        zipSizeBytes: brokerHandoffs.zipSizeBytes,
        expiresAt: brokerHandoffs.expiresAt,
        revokedAt: brokerHandoffs.revokedAt,
        downloadCount: brokerHandoffs.downloadCount,
        firstAccessedAt: brokerHandoffs.firstAccessedAt,
        lastAccessedAt: brokerHandoffs.lastAccessedAt,
        createdAt: brokerHandoffs.createdAt,
      })
      .from(brokerHandoffs)
      .where(eq(brokerHandoffs.orgId, session.user.orgId))
      .orderBy(desc(brokerHandoffs.createdAt))
      .limit(50);

    // The token is not in the projection — an existing link cannot be
    // re-displayed, only revoked and re-issued. Losing the URL is recoverable;
    // a list endpoint that hands out live share tokens is not.
    const handoffs = rows.map((row) => ({
      ...row,
      documentCount: Array.isArray(row.documentIds) ? row.documentIds.length : 0,
      link: resolveLinkState({ expiresAt: row.expiresAt, revokedAt: row.revokedAt }),
    }));

    return NextResponse.json({ handoffs, count: handoffs.length });
  } catch (error) {
    console.error("[handoff] Failed to list handoffs:", error);
    return NextResponse.json({ error: "Failed to list handoff packages" }, { status: 500 });
  }
}

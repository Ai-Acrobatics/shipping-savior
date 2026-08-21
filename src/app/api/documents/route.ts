/**
 * Multi-document trade OCR — AI-12016
 *
 * POST /api/documents  — upload one trade document, extract, validate
 * GET  /api/documents  — list the org's processed documents
 *
 * Extends the BOL-only pipeline (`/api/bol`) to the full export set:
 * commercial invoice, packing list, ISF, certificate of origin,
 * phytosanitary certificate and FDA Prior Notice.
 *
 * The route owns auth, metering, blob storage and the model call. Everything
 * that decides whether a document is usable lives in lib/documents as pure
 * functions — including the ISF 24-hour and FDA Prior Notice windows, which
 * are the two rules that actually stop cargo.
 */

import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { desc, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { tradeDocuments } from "@/lib/db/schema";
import { extractWithFallback } from "@/lib/ai/providers";
import { enforceLimit, LimitExceededError } from "@/lib/billing/limits";
import { limitExceededResponse } from "@/lib/billing/respond";
import {
  DocumentParseError,
  buildAutoExtractionPrompt,
  buildExtractionPrompt,
  isTradeDocumentType,
  processExtraction,
  type RequestedDocumentType,
} from "@/lib/documents";

const ALLOWED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/tiff",
];

/** Same 25MB cap as the BOL route (product spec F-105). */
const MAX_FILE_BYTES = 25 * 1024 * 1024;

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const orgId = session.user.orgId;

  // Metered on the same quota as BOL uploads — it is the same OCR capacity,
  // and splitting it would let a free org get 5 BOLs plus 5 of everything else.
  try {
    await enforceLimit(orgId, "bolUploads");
  } catch (err) {
    if (err instanceof LimitExceededError) return limitExceededResponse(err);
    throw err;
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const fileType = file.type || "application/octet-stream";
  if (!ALLOWED_TYPES.includes(fileType)) {
    return NextResponse.json(
      { error: `Unsupported file type: ${fileType}. Upload a PDF or an image.` },
      { status: 400 }
    );
  }
  if (file.size > MAX_FILE_BYTES) {
    return NextResponse.json({ error: "File too large. Maximum size is 25MB." }, { status: 413 });
  }

  const rawDocType = formData.get("documentType");
  const requestedType: RequestedDocumentType =
    typeof rawDocType === "string" && isTradeDocumentType(rawDocType) ? rawDocType : "auto";
  if (
    typeof rawDocType === "string" &&
    rawDocType !== "" &&
    rawDocType !== "auto" &&
    !isTradeDocumentType(rawDocType)
  ) {
    return NextResponse.json(
      { error: `Unknown document type: ${rawDocType}` },
      { status: 400 }
    );
  }

  const rawShipmentId = formData.get("shipmentId");
  const shipmentId =
    typeof rawShipmentId === "string" && rawShipmentId.trim() ? rawShipmentId.trim() : null;

  const buffer = Buffer.from(await file.arrayBuffer());

  // ── 1. Store the original ───────────────────────────────
  let blobUrl: string | null = null;
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const blob = await put(`trade-docs/${Date.now()}-${safeName}`, buffer, {
        access: "public",
        contentType: fileType,
        addRandomSuffix: false,
      });
      blobUrl = blob.url;
    } catch (err) {
      console.warn("[documents] Blob upload failed, continuing without persistence:", err);
    }
  }

  // ── 2. Extract ──────────────────────────────────────────
  const prompt =
    requestedType === "auto"
      ? buildAutoExtractionPrompt()
      : buildExtractionPrompt(requestedType);

  let aiResult;
  try {
    aiResult = await extractWithFallback({
      buffer,
      fileType,
      prompt,
      taskType: "bol",
      fileName: file.name,
    });
  } catch (err) {
    // Provider/config details stay in server logs, never in the response.
    console.error("[documents] Extraction failed:", err);
    return NextResponse.json(
      {
        error:
          "Document processing is temporarily unavailable. Your file was received — please try again shortly or contact support.",
        blobUrl,
      },
      { status: 502 }
    );
  }

  // ── 3. Normalize + validate ─────────────────────────────
  let processed;
  try {
    processed = processExtraction({ rawText: aiResult.text, requestedType });
  } catch (err) {
    if (err instanceof DocumentParseError) {
      return NextResponse.json(
        {
          success: false,
          error: err.message,
          provider: aiResult.provider,
          raw: aiResult.text,
          blobUrl,
        },
        { status: 422 }
      );
    }
    throw err;
  }

  const { extraction, validation } = processed;
  const blockerCount = validation.issues.filter((i) => i.severity === "blocker").length;
  const warningCount = validation.issues.filter((i) => i.severity === "warning").length;

  // ── 4. Persist ──────────────────────────────────────────
  let documentId: string | null = null;
  try {
    const [row] = await db
      .insert(tradeDocuments)
      .values({
        orgId,
        shipmentId,
        documentType: extraction.type,
        typeSource: processed.typeSource,
        blobUrl,
        fileName: file.name,
        fileType,
        fileSizeBytes: buffer.byteLength,
        rawText: aiResult.text,
        extractedJson: extraction.fields,
        confidenceJson: extraction.confidence,
        validationJson: validation as unknown as Record<string, unknown>,
        isValid: validation.valid,
        blockerCount,
        warningCount,
      })
      .returning({ id: tradeDocuments.id });
    documentId = row?.id ?? null;
  } catch (err) {
    // A failed insert must not cost the caller the extraction they paid for.
    console.error("[documents] Failed to persist trade_documents row:", err);
  }

  return NextResponse.json({
    success: true,
    documentId,
    provider: aiResult.provider,
    latencyMs: aiResult.latencyMs,
    estimatedCostUsd: aiResult.estimatedCostUsd,
    documentType: extraction.type,
    typeSource: processed.typeSource,
    typeConflict: processed.typeConflict,
    classificationConfidence: processed.classificationConfidence,
    extracted: extraction.fields,
    confidence: extraction.confidence,
    validation,
    fileName: file.name,
    fileType,
    blobUrl,
  });
}

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const limitParam = parseInt(url.searchParams.get("limit") ?? "50", 10);
  const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 200) : 50;

  try {
    const rows = await db
      .select({
        id: tradeDocuments.id,
        documentType: tradeDocuments.documentType,
        typeSource: tradeDocuments.typeSource,
        fileName: tradeDocuments.fileName,
        fileType: tradeDocuments.fileType,
        fileSizeBytes: tradeDocuments.fileSizeBytes,
        blobUrl: tradeDocuments.blobUrl,
        extractedJson: tradeDocuments.extractedJson,
        confidenceJson: tradeDocuments.confidenceJson,
        validationJson: tradeDocuments.validationJson,
        isValid: tradeDocuments.isValid,
        blockerCount: tradeDocuments.blockerCount,
        warningCount: tradeDocuments.warningCount,
        shipmentId: tradeDocuments.shipmentId,
        createdAt: tradeDocuments.createdAt,
      })
      .from(tradeDocuments)
      .where(eq(tradeDocuments.orgId, session.user.orgId))
      .orderBy(desc(tradeDocuments.createdAt))
      .limit(limit);

    return NextResponse.json({ documents: rows, count: rows.length });
  } catch (error) {
    console.error("[documents] Failed to list trade documents:", error);
    return NextResponse.json({ error: "Failed to list documents" }, { status: 500 });
  }
}

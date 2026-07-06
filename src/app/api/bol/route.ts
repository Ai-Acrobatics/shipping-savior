import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { bolDocuments, shipments } from "@/lib/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { extractWithFallback } from "@/lib/ai/providers";
import { normalizeBolToShipments } from "@/lib/shipments/bol-normalize";
import { enforceLimit, LimitExceededError } from "@/lib/billing/limits";
import { limitExceededResponse } from "@/lib/billing/respond";

const BOL_EXTRACTION_PROMPT = `You are extracting shipment data from a Bill of Lading document.

Return ONLY valid JSON (no markdown) with two top-level keys:

1. "extracted": object with fields below. Use null if not found.
   - container_numbers: array of container numbers (format: XXXX1234567)
   - vessel_name: name of the vessel
   - voyage_number: voyage/trip number
   - port_of_loading: full port name
   - port_of_discharge: full port name
   - etd: estimated departure date (ISO format if possible)
   - eta: estimated arrival date (ISO format if possible)
   - carrier: shipping line name (e.g. Maersk, MSC, CMA CGM, ONE, Hapag-Lloyd)
   - shipper: shipper/exporter name
   - consignee: consignee/importer name
   - notify_party: notify party name
   - goods_description: description of goods
   - weight_kg: gross weight in kg (convert if in lbs: divide lbs by 2.20462)
   - quantity: number of packages/units

2. "confidence": object with a score 0.0-1.0 for each field above indicating how confident you are in the extracted value. Use 0.0 for any field returned as null. Examples of calibration: 1.0 = clearly legible and unambiguous; 0.7 = visible but slight interpretation required; 0.4 = partially obscured or inferred; 0.0 = missing/not found.

Example response shape:
{"extracted":{"container_numbers":["MSCU1234567"],"vessel_name":"MSC OSCAR","voyage_number":"24W","port_of_loading":"Shanghai","port_of_discharge":"Long Beach","etd":"2026-05-01","eta":"2026-05-22","carrier":"MSC","shipper":"ACME CO","consignee":"BETA INC","notify_party":"BETA INC","goods_description":"Electronics","weight_kg":18500,"quantity":240},"confidence":{"container_numbers":0.98,"vessel_name":0.95,"voyage_number":0.9,"port_of_loading":0.97,"port_of_discharge":0.97,"etd":0.88,"eta":0.88,"carrier":0.99,"shipper":0.92,"consignee":0.92,"notify_party":0.85,"goods_description":0.8,"weight_kg":0.9,"quantity":0.75}}`;

export async function POST(request: NextRequest) {
  // Auth + tier enforcement (AI-8778). BOL upload is metered: free 5/mo, premium 100/mo, enterprise unlimited.
  const session = await auth();
  if (!session?.user?.orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const orgId = session.user.orgId;

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

  const allowedTypes = [
    "application/pdf",
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
  ];
  const fileType = file.type || "application/octet-stream";
  if (!allowedTypes.includes(fileType)) {
    return NextResponse.json(
      { error: `Unsupported file type: ${fileType}. Please upload a PDF or image.` },
      { status: 400 }
    );
  }

  const MAX_FILE_BYTES = 25 * 1024 * 1024; // 25MB cap per product spec (F-105)
  if (file.size > MAX_FILE_BYTES) {
    return NextResponse.json(
      { error: "File too large. Maximum size is 25MB." },
      { status: 413 }
    );
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // ── 1. Upload original to Vercel Blob (optional) ───────
  let blobUrl: string | null = null;
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const blob = await put(`bol/${Date.now()}-${safeName}`, buffer, {
        access: "public",
        contentType: fileType,
        addRandomSuffix: false,
      });
      blobUrl = blob.url;
    } catch (err) {
      console.warn("Blob upload failed, continuing without persistence:", err);
    }
  }

  // ── 2. Extract via multi-provider fallback ──────────────
  // Tries Claude first, falls back to Gemini 2.5 Pro if Claude billing fails.
  // Every attempt is logged to model_comparison_logs for the audit dashboard.
  let aiResult;
  try {
    aiResult = await extractWithFallback({
      buffer,
      fileType,
      prompt: BOL_EXTRACTION_PROMPT,
      taskType: "bol",
      fileName: file.name,
    });
  } catch (err: unknown) {
    // Provider/config details stay in server logs — never in the client response.
    console.error("BOL extraction failed:", err);
    return NextResponse.json(
      {
        error:
          "Document processing is temporarily unavailable. Your file was received — please try again shortly or contact support.",
        blobUrl,
      },
      { status: 502 }
    );
  }

  // ── 3. Parse extracted JSON ────────────────────────────
  let parsed: { extracted?: Record<string, unknown>; confidence?: Record<string, number> };
  try {
    const cleaned = aiResult.text
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();
    parsed = JSON.parse(cleaned);
  } catch {
    return NextResponse.json({
      success: false,
      provider: aiResult.provider,
      error: "Failed to parse AI response as JSON",
      raw: aiResult.text,
      blobUrl,
    });
  }

  const extracted = parsed.extracted ?? (parsed as Record<string, unknown>);
  const confidence = parsed.confidence ?? null;

  // ── 4. Persist bol_documents row ───────────────────────
  let bolDocumentId: string | null = null;
  if (blobUrl) {
    try {
      const [row] = await db
        .insert(bolDocuments)
        .values({
          orgId,
          blobUrl,
          fileName: file.name,
          fileType,
          fileSizeBytes: buffer.byteLength,
          rawText: aiResult.text,
          extractedJson: extracted as unknown as Record<string, unknown>,
          confidenceJson: (confidence ?? null) as unknown as Record<string, unknown>,
        })
        .returning();
      bolDocumentId = row?.id ?? null;
    } catch (err) {
      console.error("Failed to persist bol_documents row:", err);
    }
  }

  // ── 5. Promote extracted data into container-level shipments ───────────
  // This is the "pipeline" step: the document-shaped extraction becomes
  // row-shaped shipment records (one per container number) that populate the
  // client's profile / dashboard. Skipped with ?createShipments=false for
  // preview-only extractions.
  const createShipments = formData.get("createShipments") !== "false";
  let createdShipments: Array<{ id: string; containerNumber: string | null }> = [];
  if (createShipments) {
    try {
      const rows = normalizeBolToShipments(extracted, {
        orgId,
        bolDocumentId,
        rawBolText: aiResult.text,
      });
      if (rows.length > 0) {
        const inserted = await db
          .insert(shipments)
          .values(rows)
          .returning({ id: shipments.id, containerNumber: shipments.containerNumber });
        createdShipments = inserted;
      }
    } catch (err) {
      // Don't fail the whole extraction if the promotion step errors — the
      // raw extraction + bol_documents row are still returned/persisted.
      console.error("Failed to promote BOL to shipments:", err);
    }
  }

  return NextResponse.json({
    success: true,
    provider: aiResult.provider,
    latencyMs: aiResult.latencyMs,
    estimatedCostUsd: aiResult.estimatedCostUsd,
    extracted,
    confidence,
    rawText: aiResult.text,
    fileName: file.name,
    fileType,
    blobUrl,
    bolDocumentId,
    createdShipments,
    shipmentCount: createdShipments.length,
  });
}

// GET /api/bol — list the org's processed BOL documents (most recent first),
// each annotated with how many shipment rows it produced. Powers the OCR
// history / audit surface in the dashboard.
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const orgId = session.user.orgId;

  const url = new URL(request.url);
  const limitParam = parseInt(url.searchParams.get("limit") ?? "50", 10);
  const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 200) : 50;

  try {
    const rows = await db
      .select({
        id: bolDocuments.id,
        fileName: bolDocuments.fileName,
        fileType: bolDocuments.fileType,
        fileSizeBytes: bolDocuments.fileSizeBytes,
        blobUrl: bolDocuments.blobUrl,
        extractedJson: bolDocuments.extractedJson,
        confidenceJson: bolDocuments.confidenceJson,
        createdAt: bolDocuments.createdAt,
        shipmentCount: sql<number>`count(${shipments.id})`.mapWith(Number),
      })
      .from(bolDocuments)
      .leftJoin(shipments, eq(shipments.bolDocumentId, bolDocuments.id))
      .where(eq(bolDocuments.orgId, orgId))
      .groupBy(bolDocuments.id)
      .orderBy(desc(bolDocuments.createdAt))
      .limit(limit);

    return NextResponse.json({ documents: rows, count: rows.length });
  } catch (error) {
    console.error("Failed to list BOL documents:", error);
    return NextResponse.json(
      { error: "Failed to list BOL documents" },
      { status: 500 }
    );
  }
}

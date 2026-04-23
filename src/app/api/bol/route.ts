import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { db } from "@/lib/db";
import { bolDocuments } from "@/lib/db/schema";
import { extractWithFallback } from "@/lib/ai/providers";

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
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: `OCR processing failed: ${msg}`, blobUrl },
      { status: 500 }
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
  });
}

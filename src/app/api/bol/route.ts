import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { put } from "@vercel/blob";
import { db } from "@/lib/db";
import { bolDocuments } from "@/lib/db/schema";

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
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "AI service unavailable — API key not configured." },
      { status: 503 }
    );
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

  // Validate file type
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

  // ── 1. Upload original to Vercel Blob ──────────────────
  // If BLOB_READ_WRITE_TOKEN is not configured, skip blob upload so OCR still
  // works in local dev / preview environments without blob billing.
  let blobUrl: string | null = null;
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const blobPath = `bol/${Date.now()}-${safeName}`;
      const blob = await put(blobPath, buffer, {
        access: "public",
        contentType: fileType,
        addRandomSuffix: false,
      });
      blobUrl = blob.url;
    } catch (err) {
      console.warn("Blob upload failed, continuing without persistence:", err);
    }
  }

  try {
    const client = new Anthropic({ apiKey });
    const base64Data = buffer.toString("base64");

    let mediaType: "application/pdf" | "image/jpeg" | "image/png" | "image/webp" | "image/gif";
    if (fileType === "application/pdf") {
      mediaType = "application/pdf";
    } else if (fileType === "image/png") {
      mediaType = "image/png";
    } else if (fileType === "image/webp") {
      mediaType = "image/webp";
    } else if (fileType === "image/gif") {
      mediaType = "image/gif";
    } else {
      mediaType = "image/jpeg";
    }

    const contentBlock =
      mediaType === "application/pdf"
        ? {
            type: "document" as const,
            source: {
              type: "base64" as const,
              media_type: "application/pdf" as const,
              data: base64Data,
            },
          }
        : {
            type: "image" as const,
            source: {
              type: "base64" as const,
              media_type: mediaType as "image/jpeg" | "image/png" | "image/webp" | "image/gif",
              data: base64Data,
            },
          };

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      messages: [
        {
          role: "user",
          content: [
            contentBlock,
            {
              type: "text",
              text: BOL_EXTRACTION_PROMPT,
            },
          ],
        },
      ],
    });

    const textContent = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("");

    let parsed: { extracted?: Record<string, unknown>; confidence?: Record<string, number> };
    try {
      const cleaned = textContent
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/```\s*$/i, "")
        .trim();
      parsed = JSON.parse(cleaned);
    } catch {
      return NextResponse.json({
        success: false,
        error: "Failed to parse AI response as JSON",
        raw: textContent,
        blobUrl,
      });
    }

    const extracted = parsed.extracted ?? (parsed as Record<string, unknown>);
    const confidence = parsed.confidence ?? null;

    // ── 2. Persist bol_documents row ───────────────────────
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
            rawText: textContent,
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
      extracted,
      confidence,
      rawText: textContent,
      fileName: file.name,
      fileType,
      blobUrl,
      bolDocumentId,
    });
  } catch (error: unknown) {
    console.error("BOL OCR error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `OCR processing failed: ${message}`, blobUrl },
      { status: 500 }
    );
  }
}

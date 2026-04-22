import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

const BOL_EXTRACTION_PROMPT = `You are extracting shipment data from a Bill of Lading document. Extract ALL of the following fields (use null if not found):
- container_numbers: array of container numbers (format: XXXX1234567)
- vessel_name: name of the vessel
- voyage_number: voyage/trip number
- port_of_loading: full port name
- port_of_discharge: full port name
- etd: estimated departure date (ISO format if possible)
- eta: estimated arrival date (ISO format if possible)
- carrier: shipping line name
- shipper: shipper/exporter name
- consignee: consignee/importer name
- notify_party: notify party name
- goods_description: description of goods
- weight_kg: gross weight in kg (convert if in lbs: divide lbs by 2.20462)
- quantity: number of packages/units
Return ONLY valid JSON, no markdown.`;

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

  // Write file to /tmp for processing
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const tmpPath = path.join(os.tmpdir(), `bol-${Date.now()}-${file.name}`);
  fs.writeFileSync(tmpPath, buffer);

  try {
    const client = new Anthropic({ apiKey });

    // Convert to base64
    const base64Data = buffer.toString("base64");

    // Determine media type for Claude
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

    // Send to Claude for extraction
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

    // Parse JSON response
    let extracted: Record<string, unknown>;
    try {
      // Strip any markdown code fences if present
      const cleaned = textContent
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/```\s*$/i, "")
        .trim();
      extracted = JSON.parse(cleaned);
    } catch {
      // If JSON parse fails, return the raw text for debugging
      return NextResponse.json({
        success: false,
        error: "Failed to parse AI response as JSON",
        raw: textContent,
      });
    }

    // Clean up tmp file
    try {
      fs.unlinkSync(tmpPath);
    } catch {
      // Ignore cleanup errors
    }

    return NextResponse.json({
      success: true,
      extracted,
      rawText: textContent,
      fileName: file.name,
      fileType,
    });
  } catch (error: unknown) {
    // Clean up tmp file on error
    try {
      fs.unlinkSync(tmpPath);
    } catch {
      // Ignore
    }

    console.error("BOL OCR error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `OCR processing failed: ${message}` },
      { status: 500 }
    );
  }
}

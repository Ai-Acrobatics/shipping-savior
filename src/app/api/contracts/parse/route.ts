import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { db } from "@/lib/db";
import { contracts, contractLanes } from "@/lib/db/schema";

const CONTRACT_EXTRACTION_PROMPT = `You are extracting rate information from a carrier freight contract or rate sheet. Extract:
- carrier: carrier/shipping line name
- contract_number: contract reference number (null if not found)
- start_date: contract validity start date (ISO format)
- end_date: contract validity end date (ISO format)
- lanes: array of rate lanes, each with:
  - origin_port: port code or full name
  - dest_port: port code or full name
  - rate_20ft: rate for 20ft container (number, USD unless specified)
  - rate_40ft: rate for 40ft container
  - rate_40hc: rate for 40ft high cube
  - currency: currency code (default USD)
  - commodity: commodity type if specified (null otherwise)
Return ONLY valid JSON.`;

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
  const saveToDb = formData.get("saveToDb") === "true";
  // For MVP: use demo org/user IDs if not provided
  const orgId = (formData.get("orgId") as string) || null;
  const userId = (formData.get("userId") as string) || null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const allowedTypes = [
    "application/pdf",
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ];
  const fileType = file.type || "application/octet-stream";
  if (!allowedTypes.includes(fileType)) {
    return NextResponse.json(
      { error: `Unsupported file type: ${fileType}` },
      { status: 400 }
    );
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const tmpPath = path.join(os.tmpdir(), `contract-${Date.now()}-${file.name}`);
  fs.writeFileSync(tmpPath, buffer);

  try {
    const client = new Anthropic({ apiKey });
    const base64Data = buffer.toString("base64");

    let mediaType: "application/pdf" | "image/jpeg" | "image/png" | "image/webp";
    if (fileType === "application/pdf") {
      mediaType = "application/pdf";
    } else if (fileType === "image/png") {
      mediaType = "image/png";
    } else if (fileType === "image/webp") {
      mediaType = "image/webp";
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
              media_type: mediaType as "image/jpeg" | "image/png" | "image/webp",
              data: base64Data,
            },
          };

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: [
            contentBlock,
            {
              type: "text",
              text: CONTRACT_EXTRACTION_PROMPT,
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
    let extracted: {
      carrier?: string;
      contract_number?: string | null;
      start_date?: string;
      end_date?: string;
      lanes?: Array<{
        origin_port?: string;
        dest_port?: string;
        rate_20ft?: number | null;
        rate_40ft?: number | null;
        rate_40hc?: number | null;
        currency?: string;
        commodity?: string | null;
      }>;
    };

    try {
      const cleaned = textContent
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/```\s*$/i, "")
        .trim();
      extracted = JSON.parse(cleaned);
    } catch {
      return NextResponse.json({
        success: false,
        error: "Failed to parse AI response as JSON",
        raw: textContent,
      });
    }

    // Optionally save to DB
    let savedContract = null;
    if (saveToDb && orgId && userId && extracted.carrier) {
      try {
        const [contract] = await db
          .insert(contracts)
          .values({
            orgId,
            userId,
            carrier: extracted.carrier || "Unknown",
            carrierCode: extracted.carrier?.slice(0, 4).toUpperCase() || "UNKN",
            contractNumber: extracted.contract_number || null,
            contractType: "365_day" as const,
            startDate: extracted.start_date ? new Date(extracted.start_date) : new Date(),
            endDate: extracted.end_date
              ? new Date(extracted.end_date)
              : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            notes: `Parsed from uploaded contract: ${file.name}`,
          })
          .returning();

        // Insert lanes
        if (extracted.lanes && extracted.lanes.length > 0) {
          const laneValues = extracted.lanes
            .filter((l) => l.origin_port && l.dest_port)
            .map((lane) => ({
              contractId: contract.id,
              originPort: (lane.origin_port || "").slice(0, 10).toUpperCase(),
              originPortName: lane.origin_port || "",
              destPort: (lane.dest_port || "").slice(0, 10).toUpperCase(),
              destPortName: lane.dest_port || "",
              rate20ft: lane.rate_20ft ?? null,
              rate40ft: lane.rate_40ft ?? null,
              rate40hc: lane.rate_40hc ?? null,
              currency: lane.currency || "USD",
              commodity: lane.commodity ?? null,
            }));

          if (laneValues.length > 0) {
            await db.insert(contractLanes).values(laneValues);
          }
        }

        savedContract = contract;
      } catch (dbError) {
        console.error("Failed to save contract to DB:", dbError);
        // Return parsed data even if DB save fails
      }
    }

    // Clean up tmp
    try {
      fs.unlinkSync(tmpPath);
    } catch {
      // Ignore
    }

    return NextResponse.json({
      success: true,
      extracted,
      savedContract,
      fileName: file.name,
    });
  } catch (error: unknown) {
    try {
      fs.unlinkSync(tmpPath);
    } catch {
      // Ignore
    }
    console.error("Contract parse error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Contract parsing failed: ${message}` },
      { status: 500 }
    );
  }
}

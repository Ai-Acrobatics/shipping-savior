import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { contracts, contractLanes } from "@/lib/db/schema";
import { extractWithFallback } from "@/lib/ai/providers";
import { enforceLimit, LimitExceededError } from "@/lib/billing/limits";
import { limitExceededResponse } from "@/lib/billing/respond";

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
  // Auth + tier enforcement (AI-8778). Contract upload is metered:
  // free 0/mo (blocked), premium 25/mo, enterprise unlimited.
  const session = await auth();
  if (!session?.user?.orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const orgId = session.user.orgId;
  const userId = session.user.id;

  try {
    await enforceLimit(orgId, "contractUploads");
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
  // Persist to DB by default for any authed call — explicit saveToDb=false
  // skips persistence for one-off "preview" extractions.
  const saveToDb = formData.get("saveToDb") !== "false";

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

  // ── Extract via multi-provider fallback ────────────────
  let aiResult;
  try {
    aiResult = await extractWithFallback({
      buffer,
      fileType,
      prompt: CONTRACT_EXTRACTION_PROMPT,
      taskType: "contract",
      fileName: file.name,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: `Contract parsing failed: ${msg}` },
      { status: 500 }
    );
  }

  // ── Parse JSON response ────────────────────────────────
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
    const cleaned = aiResult.text
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();
    extracted = JSON.parse(cleaned);
  } catch {
    return NextResponse.json({
      success: false,
      provider: aiResult.provider,
      error: "Failed to parse AI response as JSON",
      raw: aiResult.text,
    });
  }

  // ── Optionally save to DB ──────────────────────────────
  let savedContract = null;
  if (saveToDb && extracted.carrier) {
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
    }
  }

  return NextResponse.json({
    success: true,
    provider: aiResult.provider,
    latencyMs: aiResult.latencyMs,
    estimatedCostUsd: aiResult.estimatedCostUsd,
    extracted,
    savedContract,
    fileName: file.name,
  });
}

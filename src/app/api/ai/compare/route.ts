/**
 * POST /api/ai/compare
 *
 * Run the same BOL or contract document through ALL configured providers
 * simultaneously and return side-by-side results for quality/cost/speed comparison.
 *
 * Used by the model audit dashboard at /platform/ai-audit.
 */

import { NextRequest, NextResponse } from "next/server";
import { extractWithAll } from "@/lib/ai/providers";

const BOL_PROMPT = `You are extracting shipment data from a Bill of Lading document. Return ONLY valid JSON with fields: container_numbers (array), vessel_name, voyage_number, port_of_loading, port_of_discharge, etd (ISO date), eta (ISO date), carrier, shipper, consignee, notify_party, goods_description, weight_kg (number), quantity (number). Use null for missing fields.`;

const CONTRACT_PROMPT = `You are extracting rate information from a freight contract or rate sheet. Return ONLY valid JSON with: carrier, contract_number, start_date (ISO), end_date (ISO), lanes (array of: origin_port, dest_port, rate_20ft, rate_40ft, rate_40hc, currency, commodity). Use null for missing fields.`;

export async function POST(request: NextRequest) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  const taskType = (formData.get("taskType") as string) || "bol";

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const allowedTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png", "image/webp"];
  const fileType = file.type || "application/octet-stream";
  if (!allowedTypes.includes(fileType)) {
    return NextResponse.json({ error: `Unsupported file type: ${fileType}` }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const prompt = taskType === "contract" ? CONTRACT_PROMPT : BOL_PROMPT;

  const results = await extractWithAll({
    buffer,
    fileType,
    prompt,
    taskType: taskType as "bol" | "contract",
    fileName: file.name,
  });

  // Parse each provider's JSON response
  const parsed = results.map((r) => {
    if (r.error) return { ...r, parsed: null };
    try {
      const cleaned = r.text
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/```\s*$/i, "")
        .trim();
      return { ...r, parsed: JSON.parse(cleaned) };
    } catch {
      return { ...r, parsed: null, parseError: true };
    }
  });

  const successful = parsed.filter((r) => !r.error);
  const failed = parsed.filter((r) => !!r.error);

  return NextResponse.json({
    taskType,
    fileName: file.name,
    totalProviders: results.length,
    successful: successful.length,
    failed: failed.length,
    results: parsed,
    summary: {
      fastestProvider: successful.sort((a, b) => a.latencyMs - b.latencyMs)[0]?.provider ?? null,
      cheapestProvider: successful.sort((a, b) => a.estimatedCostUsd - b.estimatedCostUsd)[0]?.provider ?? null,
      totalCostUsd: successful.reduce((s, r) => s + r.estimatedCostUsd, 0).toFixed(6),
    },
  });
}

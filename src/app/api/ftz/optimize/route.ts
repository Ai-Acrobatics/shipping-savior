/**
 * POST /api/ftz/optimize — AI-12021
 *
 * Turn a bill of materials plus zone economics into an FTZ recommendation:
 * inverted-tariff detection, a PF/NPF election, and a five-year NPV with
 * payback and IRR.
 *
 * The analysis is pure and deterministic (see lib/ftz-optimizer), so this
 * route is only auth, validation and error shaping. No LLM: an election is
 * irreversible per admission and a hallucinated duty rate here is a
 * real-money, real-liability error.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import {
  optimizeFtz,
  FtzInputError,
  type FtzOptimizerInput,
} from "@/lib/ftz-optimizer";

const COUNTRY_CODES = [
  "CN", "VN", "TH", "ID", "KH", "MY", "PH", "MM", "IN",
  "BD", "US", "MX", "CA", "DE", "JP", "KR", "TW", "AU",
  "GB", "FR", "IT", "BR", "TR", "PK", "EG", "OTHER",
] as const;

const componentSchema = z.object({
  id: z.string().max(64).optional(),
  description: z.string().min(1).max(200),
  htsCode: z.string().min(4).max(14),
  countryOfOrigin: z.enum(COUNTRY_CODES),
  annualValueUsd: z.number().finite().min(0).max(100_000_000_000),
  dutyRatePctOverride: z.number().finite().min(0).max(500).optional(),
});

const bodySchema = z.object({
  finishedGood: z.object({
    description: z.string().min(1).max(200),
    htsCode: z.string().min(4).max(14),
    dutyRatePctOverride: z.number().finite().min(0).max(500).optional(),
    countryOfOrigin: z.enum(COUNTRY_CODES).optional(),
  }),
  components: z.array(componentSchema).min(1).max(200),
  manufacturingInZone: z.boolean(),
  reExportSharePct: z.number().finite().min(0).max(100),
  scrapSharePct: z.number().finite().min(0).max(100),
  entriesPerYear: z.number().finite().min(1).max(100_000),
  storageMonths: z.number().finite().min(0).max(60),
  costOfCapitalPct: z.number().finite().min(0).max(100),
  activationCostUsd: z.number().finite().min(0).max(100_000_000),
  annualOperatingCostUsd: z.number().finite().min(0).max(100_000_000),
  tariffTrajectoryPctPerYear: z.number().finite().min(-100).max(200),
  volumeGrowthPctPerYear: z.number().finite().min(-100).max(200).optional(),
  horizonYears: z.number().int().min(1).max(20).optional(),
});

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
        error: "Invalid FTZ scenario",
        details: parsed.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      },
      { status: 400 }
    );
  }

  try {
    const optimization = optimizeFtz(parsed.data as FtzOptimizerInput);
    return NextResponse.json({ optimization });
  } catch (error) {
    // Guard failures are the caller's problem — 400 with the message so the
    // UI can point at the field that has to change.
    if (error instanceof FtzInputError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("[ftz/optimize] Unexpected failure:", error);
    return NextResponse.json({ error: "Failed to optimize FTZ scenario" }, { status: 500 });
  }
}

// ============================================================
// POST /api/ai/ftz-strategy — AI FTZ strategy advisor
// Sprint 4: AI Agent Layer
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { analyzeFTZStrategy, checkRateLimit } from "@/lib/ai";
import type { CountryCode } from "@/lib/types";
import { COUNTRY_NAMES } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const orgId = request.headers.get("x-org-id") ?? "anonymous";
    const tier = request.headers.get("x-tier") === "paid" ? "paid" : "free";
    const rateCheck = checkRateLimit(orgId, tier as "free" | "paid");

    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded" },
        {
          status: 429,
          headers: {
            "Retry-After": Math.ceil(
              (rateCheck.resetAt - Date.now()) / 1000
            ).toString(),
          },
        }
      );
    }

    const body = await request.json();

    // Validate
    const requiredFields = [
      "productDescription",
      "htsCode",
      "countryOfOrigin",
      "annualVolume",
      "unitCostFOB",
      "destinationState",
    ];

    for (const field of requiredFields) {
      if (body[field] === undefined || body[field] === null) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    if (!(body.countryOfOrigin in COUNTRY_NAMES)) {
      return NextResponse.json(
        { error: "Invalid countryOfOrigin" },
        { status: 400 }
      );
    }

    const result = await analyzeFTZStrategy({
      productDescription: body.productDescription,
      htsCode: body.htsCode,
      countryOfOrigin: body.countryOfOrigin as CountryCode,
      annualVolume: Number(body.annualVolume),
      unitCostFOB: Number(body.unitCostFOB),
      currentDutyPaid: Number(body.currentDutyPaid ?? 0),
      destinationState: body.destinationState,
      reExportPercentage: Number(body.reExportPercentage ?? 0),
    });

    return NextResponse.json(result, {
      headers: {
        "X-RateLimit-Remaining": rateCheck.remaining.toString(),
      },
    });
  } catch (error) {
    console.error("[AI FTZ Strategy Error]", error);
    return NextResponse.json(
      { error: "FTZ strategy analysis failed. Please try again." },
      { status: 500 }
    );
  }
}

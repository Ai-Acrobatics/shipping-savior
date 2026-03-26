// ============================================================
// POST /api/ai/compliance-check — Compliance monitoring
// Sprint 4: AI Agent Layer
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { checkCompliance, checkRateLimit } from "@/lib/ai";
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
    if (!body.htsCode || typeof body.htsCode !== "string") {
      return NextResponse.json(
        { error: "htsCode is required" },
        { status: 400 }
      );
    }

    if (!body.countryOfOrigin || !(body.countryOfOrigin in COUNTRY_NAMES)) {
      return NextResponse.json(
        { error: "countryOfOrigin is required and must be valid" },
        { status: 400 }
      );
    }

    if (!body.productDescription || typeof body.productDescription !== "string") {
      return NextResponse.json(
        { error: "productDescription is required" },
        { status: 400 }
      );
    }

    const result = await checkCompliance({
      shipmentId: body.shipmentId,
      htsCode: body.htsCode,
      countryOfOrigin: body.countryOfOrigin as CountryCode,
      productDescription: body.productDescription,
      vesselDepartureDate: body.vesselDepartureDate,
    });

    return NextResponse.json(result, {
      headers: {
        "X-RateLimit-Remaining": rateCheck.remaining.toString(),
      },
    });
  } catch (error) {
    console.error("[AI Compliance Check Error]", error);
    return NextResponse.json(
      { error: "Compliance check failed. Please try again." },
      { status: 500 }
    );
  }
}

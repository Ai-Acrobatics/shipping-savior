// ============================================================
// POST /api/ai/classify — AI-powered HTS code classification
// Sprint 4: AI Agent Layer
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { classifyProduct, checkRateLimit } from "@/lib/ai";
import type { CountryCode } from "@/lib/types";
import { COUNTRY_NAMES } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const orgId = request.headers.get("x-org-id") ?? "anonymous";
    const tier = request.headers.get("x-tier") === "paid" ? "paid" : "free";
    const rateCheck = checkRateLimit(orgId, tier as "free" | "paid");

    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          retryAfter: Math.ceil((rateCheck.resetAt - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": new Date(rateCheck.resetAt).toISOString(),
            "Retry-After": Math.ceil(
              (rateCheck.resetAt - Date.now()) / 1000
            ).toString(),
          },
        }
      );
    }

    const body = await request.json();

    // Validate input
    if (!body.productDescription || typeof body.productDescription !== "string") {
      return NextResponse.json(
        { error: "productDescription is required and must be a string" },
        { status: 400 }
      );
    }

    if (!body.countryOfOrigin || !(body.countryOfOrigin in COUNTRY_NAMES)) {
      return NextResponse.json(
        {
          error: "countryOfOrigin is required and must be a valid country code",
          validCodes: Object.keys(COUNTRY_NAMES),
        },
        { status: 400 }
      );
    }

    const result = await classifyProduct({
      productDescription: body.productDescription,
      material: body.material,
      endUse: body.endUse,
      countryOfOrigin: body.countryOfOrigin as CountryCode,
    });

    return NextResponse.json(result, {
      headers: {
        "X-RateLimit-Remaining": rateCheck.remaining.toString(),
      },
    });
  } catch (error) {
    console.error("[AI Classify Error]", error);
    return NextResponse.json(
      { error: "Classification failed. Please try again." },
      { status: 500 }
    );
  }
}

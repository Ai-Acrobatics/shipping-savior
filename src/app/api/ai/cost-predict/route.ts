// ============================================================
// POST /api/ai/cost-predict — AI cost prediction
// Sprint 4: AI Agent Layer
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { predictCost, checkRateLimit } from "@/lib/ai";
import type { CountryCode } from "@/lib/types";
import { COUNTRY_NAMES } from "@/lib/types";

const VALID_CONTAINERS = ["20GP", "40GP", "40HC", "20RF", "40RF"];
const VALID_MODES = ["ocean-fcl", "ocean-lcl"];

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

    // Validate required fields
    const requiredFields = [
      "productDescription",
      "htsCode",
      "countryOfOrigin",
      "unitCostFOB",
      "totalUnits",
      "originPort",
      "destPort",
      "freightCostTotal",
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

    const result = await predictCost({
      productDescription: body.productDescription,
      htsCode: body.htsCode,
      countryOfOrigin: body.countryOfOrigin as CountryCode,
      unitCostFOB: Number(body.unitCostFOB),
      totalUnits: Number(body.totalUnits),
      containerType: VALID_CONTAINERS.includes(body.containerType)
        ? body.containerType
        : "40HC",
      originPort: body.originPort,
      destPort: body.destPort,
      shippingMode: VALID_MODES.includes(body.shippingMode)
        ? body.shippingMode
        : "ocean-fcl",
      freightCostTotal: Number(body.freightCostTotal),
    });

    return NextResponse.json(result, {
      headers: {
        "X-RateLimit-Remaining": rateCheck.remaining.toString(),
      },
    });
  } catch (error) {
    console.error("[AI Cost Predict Error]", error);
    return NextResponse.json(
      { error: "Cost prediction failed. Please try again." },
      { status: 500 }
    );
  }
}

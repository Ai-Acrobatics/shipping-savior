// ============================================================
// POST /api/ai/route-recommend — AI route optimization
// Sprint 4: AI Agent Layer
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { optimizeRoute, checkRateLimit } from "@/lib/ai";

const VALID_CARGO_TYPES = ["general", "cold-chain"];
const VALID_PRIORITIES = ["cost", "speed", "reliability"];
const VALID_CONTAINERS = ["20ft", "40ft", "40HC", "reefer"];

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
    if (!body.originPort || !body.destPort) {
      return NextResponse.json(
        { error: "originPort and destPort are required (UNLOCODE format)" },
        { status: 400 }
      );
    }

    if (body.cargoType && !VALID_CARGO_TYPES.includes(body.cargoType)) {
      return NextResponse.json(
        { error: `cargoType must be one of: ${VALID_CARGO_TYPES.join(", ")}` },
        { status: 400 }
      );
    }

    if (body.prioritize && !VALID_PRIORITIES.includes(body.prioritize)) {
      return NextResponse.json(
        { error: `prioritize must be one of: ${VALID_PRIORITIES.join(", ")}` },
        { status: 400 }
      );
    }

    if (body.containerType && !VALID_CONTAINERS.includes(body.containerType)) {
      return NextResponse.json(
        { error: `containerType must be one of: ${VALID_CONTAINERS.join(", ")}` },
        { status: 400 }
      );
    }

    const result = await optimizeRoute({
      originPort: body.originPort,
      destPort: body.destPort,
      cargoType: body.cargoType ?? "general",
      prioritize: body.prioritize ?? "cost",
      containerType: body.containerType ?? "40ft",
      flexibleDates: body.flexibleDates ?? false,
    });

    return NextResponse.json(result, {
      headers: {
        "X-RateLimit-Remaining": rateCheck.remaining.toString(),
      },
    });
  } catch (error) {
    console.error("[AI Route Recommend Error]", error);
    const message =
      error instanceof Error ? error.message : "Route optimization failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

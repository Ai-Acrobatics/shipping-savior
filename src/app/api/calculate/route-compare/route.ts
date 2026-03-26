import { NextResponse } from "next/server";
import { compareRoutes, type RouteCompareInput } from "@/lib/calculators/route-comparison";

export async function POST(request: Request) {
  try {
    const body: RouteCompareInput = await request.json();

    if (!body.originPort || !body.destPort) {
      return NextResponse.json(
        { error: "Missing required fields: originPort, destPort" },
        { status: 400 }
      );
    }

    const result = compareRoutes(body);

    return NextResponse.json({
      success: true,
      data: result,
      calculatedAt: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Calculation failed", details: String(error) },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import {
  calculateLandedCostEngine,
  type LandedCostEngineInput,
} from "@/lib/calculators/landed-cost-engine";

export async function POST(request: Request) {
  try {
    const body: LandedCostEngineInput = await request.json();

    // Validate required fields
    if (
      !body.unitCostOrigin ||
      !body.unitsPerContainer ||
      !body.containerShippingCost
    ) {
      return NextResponse.json(
        { error: "Missing required fields: unitCostOrigin, unitsPerContainer, containerShippingCost" },
        { status: 400 }
      );
    }

    const result = calculateLandedCostEngine(body);

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

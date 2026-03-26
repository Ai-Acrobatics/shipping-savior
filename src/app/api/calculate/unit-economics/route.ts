import { NextResponse } from "next/server";
import {
  calculateUnitEconomics,
  type UnitEconomicsInput,
} from "@/lib/calculators/unit-economics";

export async function POST(request: Request) {
  try {
    const body: UnitEconomicsInput = await request.json();

    if (!body.unitCostOrigin || !body.unitsPerContainer || !body.targetRetailPrice) {
      return NextResponse.json(
        { error: "Missing required fields: unitCostOrigin, unitsPerContainer, targetRetailPrice" },
        { status: 400 }
      );
    }

    const result = calculateUnitEconomics(body);

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

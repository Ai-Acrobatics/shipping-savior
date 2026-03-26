import { NextResponse } from "next/server";
import { calculateFTZSavings, type FTZInput } from "@/lib/calculators/ftz-savings";

export async function POST(request: Request) {
  try {
    const body: FTZInput = await request.json();

    if (!body.unitValue || !body.totalUnits) {
      return NextResponse.json(
        { error: "Missing required fields: unitValue, totalUnits" },
        { status: 400 }
      );
    }

    const result = calculateFTZSavings(body);

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

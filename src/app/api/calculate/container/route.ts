import { NextResponse } from "next/server";
import {
  calculateContainerUtilizationEngine,
  compareAllContainers,
  type ContainerCalcInput,
} from "@/lib/calculators/container-utilization-engine";

export async function POST(request: Request) {
  try {
    const body: ContainerCalcInput & { compareAll?: boolean } = await request.json();

    if (
      !body.productLengthCm ||
      !body.productWidthCm ||
      !body.productHeightCm ||
      !body.productWeightKg
    ) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: productLengthCm, productWidthCm, productHeightCm, productWeightKg",
        },
        { status: 400 }
      );
    }

    if (body.compareAll) {
      const results = compareAllContainers(body);
      return NextResponse.json({
        success: true,
        data: results,
        calculatedAt: new Date().toISOString(),
      });
    }

    if (!body.containerType) {
      return NextResponse.json(
        { error: "Missing required field: containerType (or set compareAll: true)" },
        { status: 400 }
      );
    }

    const result = calculateContainerUtilizationEngine(body);

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

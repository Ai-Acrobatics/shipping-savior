import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { calculations } from "@/lib/db/schema";
import { eq, desc, and } from "drizzle-orm";
import type { CalculatorType } from "@/lib/types/calculations";

const VALID_TYPES: CalculatorType[] = [
  "landed_cost",
  "unit_economics",
  "ftz_savings",
  "pf_npf_comparison",
  "container_utilization",
  "tariff_scenario",
];

// GET /api/calculations — list all calculations for the user's org
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { orgId } = session.user;
  const { searchParams } = new URL(request.url);
  const typeFilter = searchParams.get("type") as CalculatorType | null;

  try {
    const conditions = typeFilter && VALID_TYPES.includes(typeFilter)
      ? and(eq(calculations.orgId, orgId), eq(calculations.calculatorType, typeFilter))
      : eq(calculations.orgId, orgId);

    const rows = await db
      .select()
      .from(calculations)
      .where(conditions)
      .orderBy(desc(calculations.createdAt));

    return NextResponse.json({ calculations: rows });
  } catch (error) {
    console.error("Failed to fetch calculations:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/calculations — save a new calculation
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { orgId, id: userId } = session.user;

  let body: {
    calculatorType?: string;
    name?: string;
    inputs?: Record<string, unknown>;
    outputs?: Record<string, unknown>;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { calculatorType, name, inputs, outputs } = body;

  // Validate
  if (!calculatorType || !VALID_TYPES.includes(calculatorType as CalculatorType)) {
    return NextResponse.json({ error: "Invalid calculatorType" }, { status: 400 });
  }
  if (!name || typeof name !== "string" || name.trim().length === 0 || name.length > 255) {
    return NextResponse.json({ error: "Name is required (max 255 chars)" }, { status: 400 });
  }
  if (!inputs || typeof inputs !== "object") {
    return NextResponse.json({ error: "Inputs object is required" }, { status: 400 });
  }
  if (!outputs || typeof outputs !== "object") {
    return NextResponse.json({ error: "Outputs object is required" }, { status: 400 });
  }

  try {
    const [row] = await db
      .insert(calculations)
      .values({
        orgId,
        userId,
        calculatorType: calculatorType as CalculatorType,
        name: name.trim(),
        inputs,
        outputs,
      })
      .returning();

    return NextResponse.json({ calculation: row }, { status: 201 });
  } catch (error) {
    console.error("Failed to save calculation:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

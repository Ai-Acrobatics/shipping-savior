import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { contracts, contractLanes } from "@/lib/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import type { ContractType } from "@/lib/db/schema";

const VALID_CONTRACT_TYPES: ContractType[] = ["spot", "90_day", "180_day", "365_day"];

// GET /api/contracts — list all contracts for the user's org
export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { orgId } = session.user;

  try {
    // Get contracts with lane counts via subquery
    const rows = await db
      .select({
        id: contracts.id,
        orgId: contracts.orgId,
        userId: contracts.userId,
        carrier: contracts.carrier,
        carrierCode: contracts.carrierCode,
        contractNumber: contracts.contractNumber,
        contractType: contracts.contractType,
        startDate: contracts.startDate,
        endDate: contracts.endDate,
        contactName: contracts.contactName,
        contactEmail: contracts.contactEmail,
        notes: contracts.notes,
        createdAt: contracts.createdAt,
        updatedAt: contracts.updatedAt,
        laneCount: sql<number>`(SELECT COUNT(*) FROM contract_lanes WHERE contract_id = ${contracts.id})`.as("lane_count"),
      })
      .from(contracts)
      .where(eq(contracts.orgId, orgId))
      .orderBy(desc(contracts.createdAt));

    return NextResponse.json({ contracts: rows });
  } catch (error) {
    console.error("Failed to fetch contracts:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/contracts — create a new contract with optional lanes
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { orgId, id: userId } = session.user;

  let body: {
    carrier?: string;
    carrierCode?: string;
    contractNumber?: string;
    contractType?: string;
    startDate?: string;
    endDate?: string;
    contactName?: string;
    contactEmail?: string;
    notes?: string;
    lanes?: Array<{
      originPort: string;
      originPortName: string;
      destPort: string;
      destPortName: string;
      rate20ft?: number;
      rate40ft?: number;
      rate40hc?: number;
      currency?: string;
      commodity?: string;
    }>;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { carrier, carrierCode, contractNumber, contractType, startDate, endDate, contactName, contactEmail, notes, lanes } = body;

  // Validate required fields
  if (!carrier || typeof carrier !== "string") {
    return NextResponse.json({ error: "Carrier is required" }, { status: 400 });
  }
  if (!carrierCode || typeof carrierCode !== "string") {
    return NextResponse.json({ error: "Carrier code is required" }, { status: 400 });
  }
  if (!contractType || !VALID_CONTRACT_TYPES.includes(contractType as ContractType)) {
    return NextResponse.json({ error: "Invalid contract type" }, { status: 400 });
  }
  if (!startDate || !endDate) {
    return NextResponse.json({ error: "Start and end dates are required" }, { status: 400 });
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return NextResponse.json({ error: "Invalid date format" }, { status: 400 });
  }
  if (end <= start) {
    return NextResponse.json({ error: "End date must be after start date" }, { status: 400 });
  }

  try {
    // Create contract
    const [contract] = await db
      .insert(contracts)
      .values({
        orgId,
        userId,
        carrier,
        carrierCode,
        contractNumber: contractNumber || null,
        contractType: contractType as ContractType,
        startDate: start,
        endDate: end,
        contactName: contactName || null,
        contactEmail: contactEmail || null,
        notes: notes || null,
      })
      .returning();

    // Create lanes if provided
    let createdLanes: typeof contractLanes.$inferSelect[] = [];
    if (lanes && Array.isArray(lanes) && lanes.length > 0) {
      createdLanes = await db
        .insert(contractLanes)
        .values(
          lanes.map((lane) => ({
            contractId: contract.id,
            originPort: lane.originPort,
            originPortName: lane.originPortName,
            destPort: lane.destPort,
            destPortName: lane.destPortName,
            rate20ft: lane.rate20ft ?? null,
            rate40ft: lane.rate40ft ?? null,
            rate40hc: lane.rate40hc ?? null,
            currency: lane.currency || "USD",
            commodity: lane.commodity || null,
          }))
        )
        .returning();
    }

    return NextResponse.json(
      { contract: { ...contract, lanes: createdLanes } },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create contract:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

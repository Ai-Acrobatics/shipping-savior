import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { contracts, contractLanes } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

// POST /api/contracts/[id]/lanes — add a lane to a contract
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: contractId } = await params;
  const { orgId } = session.user;

  // Verify contract belongs to user's org
  try {
    const [contract] = await db
      .select()
      .from(contracts)
      .where(and(eq(contracts.id, contractId), eq(contracts.orgId, orgId)));

    if (!contract) {
      return NextResponse.json({ error: "Contract not found" }, { status: 404 });
    }
  } catch (error) {
    console.error("Failed to verify contract:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }

  let body: {
    originPort?: string;
    originPortName?: string;
    destPort?: string;
    destPortName?: string;
    rate20ft?: number;
    rate40ft?: number;
    rate40hc?: number;
    currency?: string;
    commodity?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { originPort, originPortName, destPort, destPortName, rate20ft, rate40ft, rate40hc, currency, commodity } = body;

  if (!originPort || !originPortName || !destPort || !destPortName) {
    return NextResponse.json({ error: "Origin and destination ports are required" }, { status: 400 });
  }

  try {
    const [lane] = await db
      .insert(contractLanes)
      .values({
        contractId,
        originPort,
        originPortName,
        destPort,
        destPortName,
        rate20ft: rate20ft ?? null,
        rate40ft: rate40ft ?? null,
        rate40hc: rate40hc ?? null,
        currency: currency || "USD",
        commodity: commodity || null,
      })
      .returning();

    return NextResponse.json({ lane }, { status: 201 });
  } catch (error) {
    console.error("Failed to add lane:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/contracts/[id]/lanes — remove a lane by laneId query param
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: contractId } = await params;
  const { orgId } = session.user;

  const { searchParams } = new URL(request.url);
  const laneId = searchParams.get("laneId");

  if (!laneId) {
    return NextResponse.json({ error: "laneId query parameter is required" }, { status: 400 });
  }

  // Verify contract belongs to user's org
  try {
    const [contract] = await db
      .select()
      .from(contracts)
      .where(and(eq(contracts.id, contractId), eq(contracts.orgId, orgId)));

    if (!contract) {
      return NextResponse.json({ error: "Contract not found" }, { status: 404 });
    }

    const [lane] = await db
      .delete(contractLanes)
      .where(and(eq(contractLanes.id, laneId), eq(contractLanes.contractId, contractId)))
      .returning();

    if (!lane) {
      return NextResponse.json({ error: "Lane not found" }, { status: 404 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Failed to delete lane:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

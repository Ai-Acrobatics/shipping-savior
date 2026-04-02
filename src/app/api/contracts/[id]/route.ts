import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { contracts, contractLanes } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import type { ContractType } from "@/lib/db/schema";

const VALID_CONTRACT_TYPES: ContractType[] = ["spot", "90_day", "180_day", "365_day"];

// GET /api/contracts/[id] — fetch a single contract with all lanes
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { orgId } = session.user;

  try {
    const [contract] = await db
      .select()
      .from(contracts)
      .where(and(eq(contracts.id, id), eq(contracts.orgId, orgId)));

    if (!contract) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const lanes = await db
      .select()
      .from(contractLanes)
      .where(eq(contractLanes.contractId, id));

    return NextResponse.json({ contract: { ...contract, lanes } });
  } catch (error) {
    console.error("Failed to fetch contract:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT /api/contracts/[id] — update contract details
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { orgId } = session.user;

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
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Build update payload (only include provided fields)
  const updates: Record<string, unknown> = { updatedAt: new Date() };

  if (body.carrier) updates.carrier = body.carrier;
  if (body.carrierCode) updates.carrierCode = body.carrierCode;
  if (body.contractNumber !== undefined) updates.contractNumber = body.contractNumber || null;
  if (body.contractType) {
    if (!VALID_CONTRACT_TYPES.includes(body.contractType as ContractType)) {
      return NextResponse.json({ error: "Invalid contract type" }, { status: 400 });
    }
    updates.contractType = body.contractType;
  }
  if (body.startDate) {
    const d = new Date(body.startDate);
    if (isNaN(d.getTime())) return NextResponse.json({ error: "Invalid start date" }, { status: 400 });
    updates.startDate = d;
  }
  if (body.endDate) {
    const d = new Date(body.endDate);
    if (isNaN(d.getTime())) return NextResponse.json({ error: "Invalid end date" }, { status: 400 });
    updates.endDate = d;
  }
  if (body.contactName !== undefined) updates.contactName = body.contactName || null;
  if (body.contactEmail !== undefined) updates.contactEmail = body.contactEmail || null;
  if (body.notes !== undefined) updates.notes = body.notes || null;

  try {
    const [contract] = await db
      .update(contracts)
      .set(updates)
      .where(and(eq(contracts.id, id), eq(contracts.orgId, orgId)))
      .returning();

    if (!contract) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ contract });
  } catch (error) {
    console.error("Failed to update contract:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/contracts/[id] — delete contract (lanes cascade)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { orgId } = session.user;

  try {
    const [row] = await db
      .delete(contracts)
      .where(and(eq(contracts.id, id), eq(contracts.orgId, orgId)))
      .returning();

    if (!row) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Failed to delete contract:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

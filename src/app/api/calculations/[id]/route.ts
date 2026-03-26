import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { calculations } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

// GET /api/calculations/[id] — fetch a single calculation
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
    const [row] = await db
      .select()
      .from(calculations)
      .where(and(eq(calculations.id, id), eq(calculations.orgId, orgId)));

    if (!row) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ calculation: row });
  } catch (error) {
    console.error("Failed to fetch calculation:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT /api/calculations/[id] — rename a calculation
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

  let body: { name?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { name } = body;
  if (!name || typeof name !== "string" || name.trim().length === 0 || name.length > 255) {
    return NextResponse.json({ error: "Name is required (max 255 chars)" }, { status: 400 });
  }

  try {
    const [row] = await db
      .update(calculations)
      .set({ name: name.trim(), updatedAt: new Date() })
      .where(and(eq(calculations.id, id), eq(calculations.orgId, orgId)))
      .returning();

    if (!row) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ calculation: row });
  } catch (error) {
    console.error("Failed to update calculation:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/calculations/[id] — delete a calculation
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
      .delete(calculations)
      .where(and(eq(calculations.id, id), eq(calculations.orgId, orgId)))
      .returning();

    if (!row) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Failed to delete calculation:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

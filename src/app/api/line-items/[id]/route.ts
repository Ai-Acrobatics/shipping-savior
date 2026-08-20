import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { lineItems } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import {
  DUTY_STATUSES,
  LineItemValidationError,
  parseLineItem,
} from "@/lib/inventory/line-items";

/**
 * PATCH/DELETE /api/line-items/[id] — edit or remove one line (AI-8869).
 *
 * PATCH is a partial update: only the keys present in the body are touched.
 * Each supplied key is still run through the same parser POST uses, so a
 * correction can't sneak past validation that a create would have caught.
 */

const EDITABLE = [
  "containerNumber",
  "sku",
  "description",
  "htsCode",
  "countryOfOrigin",
  "quantity",
  "unitOfMeasure",
  "unitCostUsd",
  "supplier",
  "poRef",
  "dutyStatus",
  "locationCode",
  "locationName",
  "allocatedLandedCostUsd",
  "allocatedOverheadUsd",
] as const;

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const { orgId } = session.user;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  try {
    const [existing] = await db
      .select()
      .from(lineItems)
      .where(and(eq(lineItems.id, id), eq(lineItems.orgId, orgId)))
      .limit(1);
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Re-validate against the merged row so a partial update can't produce a
    // combination the create path would have rejected.
    let merged;
    try {
      merged = parseLineItem({
        ...existing,
        ...Object.fromEntries(
          EDITABLE.filter((key) => key in body).map((key) => [key, body[key]])
        ),
      } as Record<string, unknown>);
    } catch (error) {
      if (error instanceof LineItemValidationError) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      throw error;
    }

    const updates: Record<string, unknown> = { updatedAt: new Date() };
    for (const key of EDITABLE) {
      if (key in body) updates[key] = merged[key];
    }
    if (Object.keys(updates).length === 1) {
      return NextResponse.json(
        { error: `No editable fields supplied. Editable: ${EDITABLE.join(", ")}` },
        { status: 400 }
      );
    }

    const [updated] = await db
      .update(lineItems)
      .set(updates)
      .where(and(eq(lineItems.id, id), eq(lineItems.orgId, orgId)))
      .returning();

    return NextResponse.json({ lineItem: updated, dutyStatuses: DUTY_STATUSES });
  } catch (error) {
    console.error("Failed to update line item:", error);
    return NextResponse.json({ error: "Failed to update line item" }, { status: 500 });
  }
}

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
    const deleted = await db
      .delete(lineItems)
      .where(and(eq(lineItems.id, id), eq(lineItems.orgId, orgId)))
      .returning({ id: lineItems.id });

    if (deleted.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    // Sale records cascade with the line item — deleting a line deletes the
    // revenue booked against it, which is correct: the margin was never real.
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Failed to delete line item:", error);
    return NextResponse.json({ error: "Failed to delete line item" }, { status: 500 });
  }
}

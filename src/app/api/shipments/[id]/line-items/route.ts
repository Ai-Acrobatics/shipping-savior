import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { lineItems, shipments } from "@/lib/db/schema";
import { and, asc, eq } from "drizzle-orm";
import {
  LineItemValidationError,
  parseLineItem,
  toNumber,
} from "@/lib/inventory/line-items";
import { allocateShipmentCost } from "@/lib/analytics/margin";

/**
 * GET/POST /api/shipments/[id]/line-items — container contents (AI-8869).
 *
 * POST accepts either a single `{...item}` or `{ items: [...] }` so the CSV
 * importer and the manual form hit the same endpoint. Org scoping mirrors
 * /api/shipments/[id]: cross-org access 404s rather than 403s, so shipment
 * existence is never leaked.
 */

const MAX_BULK_ITEMS = 500;

async function loadOwnedShipment(id: string, orgId: string) {
  const [row] = await db
    .select({ id: shipments.id, orgId: shipments.orgId })
    .from(shipments)
    .where(eq(shipments.id, id))
    .limit(1);
  return row && row.orgId === orgId ? row : null;
}

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
    const shipment = await loadOwnedShipment(id, orgId);
    if (!shipment) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const rows = await db
      .select()
      .from(lineItems)
      .where(and(eq(lineItems.shipmentId, id), eq(lineItems.orgId, orgId)))
      .orderBy(asc(lineItems.createdAt));

    const goodsValueUsd = rows.reduce(
      (sum, r) => sum + toNumber(r.quantity) * toNumber(r.unitCostUsd),
      0
    );

    return NextResponse.json({
      lineItems: rows,
      totals: {
        lineCount: rows.length,
        totalUnits: rows.reduce((sum, r) => sum + toNumber(r.quantity), 0),
        goodsValueUsd: Math.round(goodsValueUsd * 100) / 100,
        allocatedLandedCostUsd:
          Math.round(
            rows.reduce((sum, r) => sum + toNumber(r.allocatedLandedCostUsd), 0) * 100
          ) / 100,
      },
    });
  } catch (error) {
    console.error("Failed to fetch line items:", error);
    return NextResponse.json({ error: "Failed to fetch line items" }, { status: 500 });
  }
}

export async function POST(
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

  const rawItems = Array.isArray(body.items) ? body.items : [body];
  if (rawItems.length === 0) {
    return NextResponse.json({ error: "No line items supplied" }, { status: 400 });
  }
  if (rawItems.length > MAX_BULK_ITEMS) {
    return NextResponse.json(
      { error: `At most ${MAX_BULK_ITEMS} line items per request` },
      { status: 400 }
    );
  }

  let parsed;
  try {
    parsed = rawItems.map((item, i) => {
      if (typeof item !== "object" || item === null) {
        throw new LineItemValidationError(`Line ${i + 1}: expected an object`);
      }
      try {
        return parseLineItem(item as Record<string, unknown>);
      } catch (error) {
        throw new LineItemValidationError(
          `Line ${i + 1}: ${error instanceof Error ? error.message : "invalid"}`
        );
      }
    });
  } catch (error) {
    if (error instanceof LineItemValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    throw error;
  }

  try {
    const shipment = await loadOwnedShipment(id, orgId);
    if (!shipment) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const inserted = await db
      .insert(lineItems)
      .values(parsed.map((item) => ({ ...item, orgId, shipmentId: id })))
      .returning();

    // Optionally spread the shipment's non-goods landed cost over every line
    // on the shipment (not just the ones in this request) by goods value, so
    // margin reporting has a cost basis without a second round-trip.
    const nonGoodsCost = body.shipmentNonGoodsCostUsd;
    let allocated: Record<string, number> | null = null;
    if (typeof nonGoodsCost === "number" && Number.isFinite(nonGoodsCost) && nonGoodsCost >= 0) {
      const all = await db
        .select()
        .from(lineItems)
        .where(and(eq(lineItems.shipmentId, id), eq(lineItems.orgId, orgId)));

      allocated = allocateShipmentCost(
        all.map((r) => ({
          lineItemId: r.id,
          quantity: toNumber(r.quantity),
          unitCostUsd: toNumber(r.unitCostUsd),
        })),
        nonGoodsCost
      );

      await Promise.all(
        Object.entries(allocated).map(([lineItemId, amount]) =>
          db
            .update(lineItems)
            .set({ allocatedLandedCostUsd: String(amount), updatedAt: new Date() })
            .where(and(eq(lineItems.id, lineItemId), eq(lineItems.orgId, orgId)))
        )
      );
    }

    return NextResponse.json({ lineItems: inserted, allocated }, { status: 201 });
  } catch (error) {
    console.error("Failed to create line items:", error);
    return NextResponse.json({ error: "Failed to create line items" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { lineItems, saleRecords } from "@/lib/db/schema";
import { and, desc, eq, inArray, sum, type SQL } from "drizzle-orm";
import { toNumber } from "@/lib/inventory/line-items";

/**
 * GET/POST /api/sales — the revenue side of the margin calculation (AI-8869).
 *
 * A sale is booked against a line item, never a shipment, because the same
 * SKU on two containers can sell at two prices and the whole point of this
 * feature is being able to see that.
 *
 * POST refuses to over-sell a line: quantitySold across all rows can never
 * exceed the quantity imported. Without that check a fat-fingered entry
 * produces negative on-hand inventory and a margin number that looks great
 * for reasons that have nothing to do with the business.
 */

const MAX_BULK_SALES = 500;

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { orgId } = session.user;
  const { searchParams } = new URL(request.url);

  const lineItemId = searchParams.get("lineItemId");
  const shipmentId = searchParams.get("shipmentId");
  const limit = Math.min(
    Math.max(parseInt(searchParams.get("limit") ?? "200", 10) || 200, 1),
    1000
  );

  try {
    const conditions: SQL[] = [eq(saleRecords.orgId, orgId)];
    if (lineItemId) conditions.push(eq(saleRecords.lineItemId, lineItemId));
    if (shipmentId) conditions.push(eq(saleRecords.shipmentId, shipmentId));

    const rows = await db
      .select()
      .from(saleRecords)
      .where(and(...conditions))
      .orderBy(desc(saleRecords.saleDate))
      .limit(limit);

    return NextResponse.json({
      sales: rows,
      totals: {
        count: rows.length,
        unitsSold: rows.reduce((s, r) => s + toNumber(r.quantitySold), 0),
        revenueUsd:
          Math.round(
            rows.reduce((s, r) => s + toNumber(r.quantitySold) * toNumber(r.unitSalePriceUsd), 0) *
              100
          ) / 100,
      },
    });
  } catch (error) {
    console.error("Failed to fetch sales:", error);
    return NextResponse.json({ error: "Failed to fetch sales" }, { status: 500 });
  }
}

interface ParsedSale {
  lineItemId: string;
  saleDate: Date;
  quantitySold: number;
  unitSalePriceUsd: number;
  customer: string | null;
  channel: string | null;
  invoiceRef: string | null;
  notes: string | null;
}

function parseSale(input: Record<string, unknown>, index: number): ParsedSale | { error: string } {
  const prefix = `Sale ${index + 1}: `;
  const lineItemId = typeof input.lineItemId === "string" ? input.lineItemId.trim() : "";
  if (!lineItemId) return { error: `${prefix}lineItemId is required` };

  const quantitySold = Number(input.quantitySold);
  if (!Number.isFinite(quantitySold) || quantitySold <= 0) {
    return { error: `${prefix}quantitySold must be a positive number` };
  }

  const unitSalePriceUsd = Number(input.unitSalePriceUsd);
  if (!Number.isFinite(unitSalePriceUsd) || unitSalePriceUsd < 0) {
    return { error: `${prefix}unitSalePriceUsd must be a non-negative number` };
  }

  let saleDate = new Date();
  if (input.saleDate) {
    const parsed = new Date(input.saleDate as string);
    if (Number.isNaN(parsed.getTime())) return { error: `${prefix}invalid saleDate` };
    saleDate = parsed;
  }

  const str = (v: unknown, max: number) =>
    typeof v === "string" && v.trim() ? v.trim().slice(0, max) : null;

  return {
    lineItemId,
    saleDate,
    quantitySold,
    unitSalePriceUsd,
    customer: str(input.customer, 300),
    channel: str(input.channel, 100),
    invoiceRef: str(input.invoiceRef, 100),
    notes: str(input.notes, 2000),
  };
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { orgId } = session.user;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const raw = Array.isArray(body.sales) ? body.sales : [body];
  if (raw.length === 0) {
    return NextResponse.json({ error: "No sales supplied" }, { status: 400 });
  }
  if (raw.length > MAX_BULK_SALES) {
    return NextResponse.json(
      { error: `At most ${MAX_BULK_SALES} sales per request` },
      { status: 400 }
    );
  }

  const parsed: ParsedSale[] = [];
  for (let i = 0; i < raw.length; i++) {
    const item = raw[i];
    if (typeof item !== "object" || item === null) {
      return NextResponse.json({ error: `Sale ${i + 1}: expected an object` }, { status: 400 });
    }
    const result = parseSale(item as Record<string, unknown>, i);
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    parsed.push(result);
  }

  try {
    const ids = Array.from(new Set(parsed.map((p) => p.lineItemId)));

    // Every referenced line must belong to this org. Anything else 404s so a
    // probe can't distinguish "not yours" from "doesn't exist".
    const owned = await db
      .select({
        id: lineItems.id,
        shipmentId: lineItems.shipmentId,
        quantity: lineItems.quantity,
      })
      .from(lineItems)
      .where(and(eq(lineItems.orgId, orgId), inArray(lineItems.id, ids)));

    const ownedById = new Map(owned.map((r) => [r.id, r]));
    const missing = ids.filter((id) => !ownedById.has(id));
    if (missing.length > 0) {
      return NextResponse.json(
        { error: `Line item not found: ${missing[0]}` },
        { status: 404 }
      );
    }

    // Already-booked quantity per line, so the over-sell check accounts for
    // history and not just this request.
    const existingSold = await db
      .select({
        lineItemId: saleRecords.lineItemId,
        sold: sum(saleRecords.quantitySold),
      })
      .from(saleRecords)
      .where(and(eq(saleRecords.orgId, orgId), inArray(saleRecords.lineItemId, ids)))
      .groupBy(saleRecords.lineItemId);

    const soldById = new Map(existingSold.map((r) => [r.lineItemId, toNumber(r.sold)]));

    for (const id of ids) {
      const line = ownedById.get(id)!;
      const imported = toNumber(line.quantity);
      const alreadySold = soldById.get(id) ?? 0;
      const incoming = parsed
        .filter((p) => p.lineItemId === id)
        .reduce((s, p) => s + p.quantitySold, 0);

      if (alreadySold + incoming > imported) {
        return NextResponse.json(
          {
            error:
              `Cannot sell ${incoming} units of line ${id}: ${imported} imported, ` +
              `${alreadySold} already sold (${imported - alreadySold} available).`,
          },
          { status: 409 }
        );
      }
    }

    const inserted = await db
      .insert(saleRecords)
      .values(
        parsed.map((p) => ({
          orgId,
          lineItemId: p.lineItemId,
          shipmentId: ownedById.get(p.lineItemId)!.shipmentId,
          saleDate: p.saleDate,
          quantitySold: String(p.quantitySold),
          unitSalePriceUsd: String(p.unitSalePriceUsd),
          customer: p.customer,
          channel: p.channel,
          invoiceRef: p.invoiceRef,
          notes: p.notes,
        }))
      )
      .returning();

    return NextResponse.json({ sales: inserted }, { status: 201 });
  } catch (error) {
    console.error("Failed to record sales:", error);
    return NextResponse.json({ error: "Failed to record sales" }, { status: 500 });
  }
}

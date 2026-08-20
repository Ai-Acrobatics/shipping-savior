import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { lineItems, saleRecords, shipments } from "@/lib/db/schema";
import { and, eq, gte, inArray, type SQL } from "drizzle-orm";
import { toNumber } from "@/lib/inventory/line-items";
import {
  computeLineMargins,
  findMarginAlerts,
  rollUpMargin,
  summarizeMargins,
  type MarginLineInput,
  type MarginSaleInput,
  type RollupDimension,
} from "@/lib/analytics/margin";

/**
 * GET /api/analytics/margin — realized margin rollups (AI-8869 sub-feature C).
 *
 * "Are your Asia → LA bookings still profitable as freight rates drop?" is a
 * question about *realized* margin over time, so this endpoint joins the cost
 * side (line items + allocated landed cost) to the revenue side (sale records)
 * and rolls the result up along whichever dimension the caller asks for.
 *
 * Query params:
 *   ?dimension=month|quarter|sku|lane   (default: month)
 *   ?since=<ISO date>                   only sales on/after this date
 *   ?alertThreshold=<0-1>               flag buckets below this margin %
 */

const DIMENSIONS: RollupDimension[] = ["month", "quarter", "sku", "lane"];

/** "CNSHA → USLAX". Falls back through the BOL-flavoured columns. */
function laneLabel(origin: string | null, dest: string | null): string | null {
  const from = origin?.trim();
  const to = dest?.trim();
  if (!from && !to) return null;
  return `${from || "?"} → ${to || "?"}`;
}

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { orgId } = session.user;
  const { searchParams } = new URL(request.url);

  const dimensionParam = (searchParams.get("dimension") ?? "month") as RollupDimension;
  if (!DIMENSIONS.includes(dimensionParam)) {
    return NextResponse.json(
      { error: `dimension must be one of: ${DIMENSIONS.join(", ")}` },
      { status: 400 }
    );
  }

  let since: Date | null = null;
  const sinceParam = searchParams.get("since");
  if (sinceParam) {
    const parsed = new Date(sinceParam);
    if (Number.isNaN(parsed.getTime())) {
      return NextResponse.json({ error: "Invalid `since` date" }, { status: 400 });
    }
    since = parsed;
  }

  const thresholdParam = searchParams.get("alertThreshold");
  let alertThreshold: number | null = null;
  if (thresholdParam !== null) {
    const parsed = Number(thresholdParam);
    if (!Number.isFinite(parsed) || parsed < 0 || parsed > 1) {
      return NextResponse.json(
        { error: "alertThreshold must be between 0 and 1" },
        { status: 400 }
      );
    }
    alertThreshold = parsed;
  }

  try {
    const lineRows = await db
      .select({
        id: lineItems.id,
        shipmentId: lineItems.shipmentId,
        sku: lineItems.sku,
        description: lineItems.description,
        htsCode: lineItems.htsCode,
        quantity: lineItems.quantity,
        unitCostUsd: lineItems.unitCostUsd,
        allocatedLandedCostUsd: lineItems.allocatedLandedCostUsd,
        allocatedOverheadUsd: lineItems.allocatedOverheadUsd,
        originPort: shipments.originPort,
        destPort: shipments.destPort,
        pol: shipments.pol,
        pod: shipments.pod,
        eta: shipments.eta,
      })
      .from(lineItems)
      .leftJoin(shipments, eq(lineItems.shipmentId, shipments.id))
      .where(eq(lineItems.orgId, orgId));

    const saleConditions: SQL[] = [eq(saleRecords.orgId, orgId)];
    if (since) saleConditions.push(gte(saleRecords.saleDate, since));
    if (lineRows.length > 0) {
      saleConditions.push(
        inArray(
          saleRecords.lineItemId,
          lineRows.map((r) => r.id)
        )
      );
    }

    const saleRows =
      lineRows.length === 0
        ? []
        : await db
            .select({
              lineItemId: saleRecords.lineItemId,
              quantitySold: saleRecords.quantitySold,
              unitSalePriceUsd: saleRecords.unitSalePriceUsd,
              saleDate: saleRecords.saleDate,
            })
            .from(saleRecords)
            .where(and(...saleConditions));

    const marginLines: MarginLineInput[] = lineRows.map((row) => ({
      lineItemId: row.id,
      shipmentId: row.shipmentId,
      sku: row.sku,
      description: row.description,
      htsCode: row.htsCode,
      quantity: toNumber(row.quantity),
      unitCostUsd: toNumber(row.unitCostUsd),
      allocatedLandedCostUsd: toNumber(row.allocatedLandedCostUsd),
      allocatedOverheadUsd: toNumber(row.allocatedOverheadUsd),
      lane: laneLabel(row.originPort ?? row.pol, row.destPort ?? row.pod),
      arrivedAt: row.eta,
    }));

    const marginSales: MarginSaleInput[] = saleRows.map((row) => ({
      lineItemId: row.lineItemId,
      quantitySold: toNumber(row.quantitySold),
      unitSalePriceUsd: toNumber(row.unitSalePriceUsd),
      saleDate: row.saleDate,
    }));

    const margins = computeLineMargins(marginLines, marginSales);
    const buckets = rollUpMargin(margins, dimensionParam, marginSales);

    return NextResponse.json({
      dimension: dimensionParam,
      buckets,
      totals: summarizeMargins(margins),
      // Top/bottom performers are the same rollup along a categorical axis —
      // cheap to compute here, saves the client a second round trip.
      bySku: rollUpMargin(margins, "sku", marginSales),
      byLane: rollUpMargin(margins, "lane", marginSales),
      alerts:
        alertThreshold === null ? [] : findMarginAlerts(buckets, dimensionParam, alertThreshold),
      lines: margins,
    });
  } catch (error) {
    console.error("Failed to compute margin analytics:", error);
    return NextResponse.json({ error: "Failed to compute margin analytics" }, { status: 500 });
  }
}

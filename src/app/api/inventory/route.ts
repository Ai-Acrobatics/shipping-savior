import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { lineItems, saleRecords, shipments } from "@/lib/db/schema";
import { and, desc, eq, inArray, type SQL } from "drizzle-orm";
import {
  DUTY_STATUSES,
  DUTY_STATUS_LABELS,
  ON_HAND_STATUSES,
  toNumber,
} from "@/lib/inventory/line-items";
import type { DutyStatus } from "@/lib/db/schema";

/**
 * GET /api/inventory — "what do we have, where, with what duty status"
 * (AI-8869 sub-feature A).
 *
 * Returns the raw lines plus two rollups the /platform/inventory page renders
 * directly: by location and by duty status. On-hand quantity is imported
 * quantity minus everything sold off that line, so a half-sold container
 * reports the half that is actually still sitting there.
 *
 * Query params:
 *   ?location=<code>      filter to one FTZ / DC
 *   ?dutyStatus=<status>  filter to one duty status
 *   ?onHandOnly=1         drop in-transit and consumed lines
 */
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { orgId } = session.user;
  const { searchParams } = new URL(request.url);

  const locationFilter = searchParams.get("location");
  const dutyStatusFilter = searchParams.get("dutyStatus");
  const onHandOnly = searchParams.get("onHandOnly") === "1";

  if (dutyStatusFilter && !(DUTY_STATUSES as readonly string[]).includes(dutyStatusFilter)) {
    return NextResponse.json(
      { error: `dutyStatus must be one of: ${DUTY_STATUSES.join(", ")}` },
      { status: 400 }
    );
  }

  try {
    const conditions: SQL[] = [eq(lineItems.orgId, orgId)];
    if (locationFilter) conditions.push(eq(lineItems.locationCode, locationFilter));
    if (dutyStatusFilter) {
      conditions.push(eq(lineItems.dutyStatus, dutyStatusFilter as DutyStatus));
    } else if (onHandOnly) {
      conditions.push(inArray(lineItems.dutyStatus, ON_HAND_STATUSES));
    }

    const rows = await db
      .select({
        id: lineItems.id,
        shipmentId: lineItems.shipmentId,
        containerNumber: lineItems.containerNumber,
        sku: lineItems.sku,
        description: lineItems.description,
        htsCode: lineItems.htsCode,
        countryOfOrigin: lineItems.countryOfOrigin,
        quantity: lineItems.quantity,
        unitOfMeasure: lineItems.unitOfMeasure,
        unitCostUsd: lineItems.unitCostUsd,
        supplier: lineItems.supplier,
        poRef: lineItems.poRef,
        dutyStatus: lineItems.dutyStatus,
        locationCode: lineItems.locationCode,
        locationName: lineItems.locationName,
        allocatedLandedCostUsd: lineItems.allocatedLandedCostUsd,
        createdAt: lineItems.createdAt,
        shipmentReference: shipments.reference,
        shipmentStatus: shipments.status,
        incoterm: shipments.incoterm,
      })
      .from(lineItems)
      .leftJoin(shipments, eq(lineItems.shipmentId, shipments.id))
      .where(and(...conditions))
      .orderBy(desc(lineItems.createdAt));

    // Units already sold, per line, so on-hand is real rather than "imported".
    const soldByLine = new Map<string, number>();
    if (rows.length > 0) {
      const sold = await db
        .select({
          lineItemId: saleRecords.lineItemId,
          quantitySold: saleRecords.quantitySold,
        })
        .from(saleRecords)
        .where(
          and(
            eq(saleRecords.orgId, orgId),
            inArray(
              saleRecords.lineItemId,
              rows.map((r) => r.id)
            )
          )
        );
      for (const s of sold) {
        soldByLine.set(s.lineItemId, (soldByLine.get(s.lineItemId) ?? 0) + toNumber(s.quantitySold));
      }
    }

    const enriched = rows.map((row) => {
      const quantity = toNumber(row.quantity);
      const quantitySold = soldByLine.get(row.id) ?? 0;
      const quantityOnHand = Math.max(quantity - quantitySold, 0);
      const unitCost = toNumber(row.unitCostUsd);
      const allocated = toNumber(row.allocatedLandedCostUsd);
      const unitLandedCost = quantity > 0 ? unitCost + allocated / quantity : unitCost;
      return {
        ...row,
        quantity,
        quantitySold,
        quantityOnHand,
        unitCostUsd: unitCost,
        allocatedLandedCostUsd: allocated,
        unitLandedCostUsd: Math.round(unitLandedCost * 10000) / 10000,
        onHandValueUsd: Math.round(quantityOnHand * unitLandedCost * 100) / 100,
      };
    });

    // ── Rollups ──────────────────────────────────────────
    const byLocationMap = new Map<
      string,
      { locationCode: string; locationName: string | null; unitsOnHand: number; valueUsd: number; lineCount: number }
    >();
    for (const row of enriched) {
      const key = row.locationCode ?? "(unassigned)";
      const bucket = byLocationMap.get(key) ?? {
        locationCode: key,
        locationName: row.locationName ?? null,
        unitsOnHand: 0,
        valueUsd: 0,
        lineCount: 0,
      };
      bucket.unitsOnHand += row.quantityOnHand;
      bucket.valueUsd += row.onHandValueUsd;
      bucket.lineCount += 1;
      byLocationMap.set(key, bucket);
    }

    const byDutyStatusMap = new Map<
      DutyStatus,
      { dutyStatus: DutyStatus; label: string; unitsOnHand: number; valueUsd: number; lineCount: number }
    >();
    for (const row of enriched) {
      const bucket = byDutyStatusMap.get(row.dutyStatus) ?? {
        dutyStatus: row.dutyStatus,
        label: DUTY_STATUS_LABELS[row.dutyStatus],
        unitsOnHand: 0,
        valueUsd: 0,
        lineCount: 0,
      };
      bucket.unitsOnHand += row.quantityOnHand;
      bucket.valueUsd += row.onHandValueUsd;
      bucket.lineCount += 1;
      byDutyStatusMap.set(row.dutyStatus, bucket);
    }

    const round = <T extends { valueUsd: number }>(b: T) => ({
      ...b,
      valueUsd: Math.round(b.valueUsd * 100) / 100,
    });

    return NextResponse.json({
      lineItems: enriched,
      byLocation: Array.from(byLocationMap.values()).map(round).sort((a, b) => b.valueUsd - a.valueUsd),
      byDutyStatus: DUTY_STATUSES.filter((s) => byDutyStatusMap.has(s)).map((s) =>
        round(byDutyStatusMap.get(s)!)
      ),
      totals: {
        lineCount: enriched.length,
        unitsOnHand: enriched.reduce((sum, r) => sum + r.quantityOnHand, 0),
        onHandValueUsd:
          Math.round(enriched.reduce((sum, r) => sum + r.onHandValueUsd, 0) * 100) / 100,
        // Duty-deferred capital: goods sitting in an FTZ where no duty has
        // been paid yet. This is the cash-flow number the FTZ pitch turns on.
        ftzValueUsd:
          Math.round(
            enriched
              .filter((r) => r.dutyStatus === "ftz_pf" || r.dutyStatus === "ftz_npf")
              .reduce((sum, r) => sum + r.onHandValueUsd, 0) * 100
          ) / 100,
      },
    });
  } catch (error) {
    console.error("Failed to fetch inventory:", error);
    return NextResponse.json({ error: "Failed to fetch inventory" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { shipments } from "@/lib/db/schema";
import { and, eq, sql, type SQL } from "drizzle-orm";
import {
  buildCleanWorkbook,
  exportFileName,
  type WorkbookExportRow,
} from "@/lib/intake/workbook-export";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_ROWS = 5000;

/**
 * GET /api/shipments/export-workbook — write the board back out as a clean
 * .xlsx (AI-12009).
 *
 * Closes the loop opened by POST /api/shipments/import-workbook: rows come in
 * from Blake's hand-maintained workbook, gaps get filled in the review queue,
 * and this endpoint emits the corrected board — one sheet per week, one header
 * row, real dates and numeric weights. That replaces the manual Excel cleanup
 * pass entirely.
 *
 * Query params:
 *   week=<label>          only that week's sheet
 *   includeUnresolved=1   also emit rows still in the review queue, with a
 *                         "Review Notes" column (default: clean rows only)
 *   scope=all             every shipment, not just workbook-imported ones
 */
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { orgId } = session.user;

  const { searchParams } = new URL(request.url);
  const week = searchParams.get("week");
  const includeUnresolved = searchParams.get("includeUnresolved") === "1";
  const scope = searchParams.get("scope");

  try {
    const conditions: SQL[] = [eq(shipments.orgId, orgId)];
    if (scope !== "all") {
      conditions.push(eq(shipments.source, "workbook_import"));
    }
    if (!includeUnresolved) {
      conditions.push(
        sql`coalesce(jsonb_array_length(${shipments.importMeta}->'reviewIssues'), 0) = 0`
      );
    }
    if (week) {
      conditions.push(sql`${shipments.importMeta}->>'week' = ${week}`);
    }

    const rows = await db
      .select({
        reference: shipments.reference,
        pol: shipments.pol,
        pod: shipments.pod,
        cargoType: shipments.cargoType,
        carrier: shipments.carrier,
        vesselName: shipments.vesselName,
        etd: shipments.etd,
        eta: shipments.eta,
        containerNumber: shipments.containerNumber,
        shipper: shipments.shipper,
        goodsDescription: shipments.goodsDescription,
        weightKg: shipments.weightKg,
        status: shipments.status,
        importMeta: shipments.importMeta,
      })
      .from(shipments)
      .where(and(...conditions))
      .limit(MAX_ROWS);

    const buffer = await buildCleanWorkbook(rows as WorkbookExportRow[], {
      includeUnresolved,
    });

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${exportFileName()}"`,
        "Content-Length": String(buffer.byteLength),
        "Cache-Control": "no-store",
        // Lets the UI report "0 rows" instead of silently handing over an
        // empty file when the filters matched nothing.
        "X-Row-Count": String(rows.length),
      },
    });
  } catch (error) {
    console.error("Failed to export workbook:", error);
    return NextResponse.json({ error: "Failed to export workbook" }, { status: 500 });
  }
}

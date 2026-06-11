import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { shipments } from "@/lib/db/schema";
import { parseWorkbook } from "@/lib/intake/workbook";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_FILE_BYTES = 25 * 1024 * 1024;
const XLSX_TYPES = [
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "application/octet-stream", // some mail clients/browsers mislabel xlsx
];

/**
 * POST /api/shipments/import-workbook — Blake's weekly reefer-export operating
 * workbook (.xlsx, one sheet per week) → shipment rows (AI-10777).
 *
 * Every parsed row is imported; rows with data-quality problems carry
 * reviewIssues in import_meta and are reported back so the UI can surface a
 * review queue. Idempotency: a (orgId, reference) pair that already exists is
 * skipped and reported, so re-uploading the same workbook is safe.
 */
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { orgId, id: userId } = session.user;

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  const isXlsxName = /\.xlsx$/i.test(file.name);
  if (!XLSX_TYPES.includes(file.type || "application/octet-stream") || !isXlsxName) {
    return NextResponse.json(
      { error: "Unsupported file type. Please upload an .xlsx workbook." },
      { status: 400 }
    );
  }
  if (file.size > MAX_FILE_BYTES) {
    return NextResponse.json(
      { error: "File too large. Maximum size is 25MB." },
      { status: 413 }
    );
  }

  let parsed;
  try {
    parsed = await parseWorkbook(Buffer.from(await file.arrayBuffer()), file.name);
  } catch (err) {
    console.error("Workbook parse failed:", err);
    return NextResponse.json(
      { error: "Could not read that workbook. Is it a valid .xlsx file?" },
      { status: 422 }
    );
  }

  if (parsed.rows.length === 0) {
    return NextResponse.json(
      {
        error: "No shipment rows found. Expected weekly sheets with a Booking column.",
        sheetsSkipped: parsed.sheetsSkipped,
      },
      { status: 422 }
    );
  }

  // Existing booking references for this org → skip duplicates on re-upload.
  const existing = await db.query.shipments.findMany({
    columns: { reference: true },
    where: (s, { eq, and, isNotNull }) => and(eq(s.orgId, orgId), isNotNull(s.reference)),
  });
  const seen = new Set(existing.map((s) => s.reference));

  const toInsert = parsed.rows.filter((r) => !seen.has(r.reference));
  const duplicates = parsed.rows.length - toInsert.length;

  if (toInsert.length > 0) {
    await db.insert(shipments).values(
      toInsert.map((r) => ({
        orgId,
        userId,
        reference: r.reference,
        pol: r.pol,
        originPort: r.pol,
        pod: r.pod,
        destPort: r.pod,
        cargoType: r.cargoType,
        carrier: r.carrier,
        vesselName: r.vesselName,
        etd: r.etd,
        eta: r.eta,
        containerNumber: r.containerNumber,
        shipper: r.shipper,
        goodsDescription: r.goodsDescription,
        weightKg: r.weightKg,
        quantity: r.quantity,
        status: "booked" as const,
        source: "workbook_import" as const,
        importMeta: { ...r.meta, fileName: file.name, reviewIssues: r.reviewIssues },
      }))
    );
  }

  const needsReview = toInsert
    .filter((r) => r.reviewIssues.length > 0)
    .map((r) => ({
      reference: r.reference,
      week: r.meta.week,
      row: r.meta.rowNumber,
      issues: r.reviewIssues,
    }));

  return NextResponse.json({
    success: true,
    imported: toInsert.length,
    duplicatesSkipped: duplicates,
    needsReview,
    cleanRows: toInsert.length - needsReview.length,
    sheetsParsed: parsed.sheetsParsed,
    sheetsSkipped: parsed.sheetsSkipped,
  });
}

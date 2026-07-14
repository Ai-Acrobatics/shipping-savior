import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { shipments, bolDocuments } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import ExcelJS from "exceljs";

// GET /api/shipments/export?format=csv|xlsx
// Exports the weekly load board (all shipments) as CSV or styled XLSX.
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format") || "csv";

  try {
    const rows = await db
      .select({
        containerNumber: shipments.containerNumber,
        vesselName: shipments.vesselName,
        voyageNumber: shipments.voyageNumber,
        pol: shipments.pol,
        pod: shipments.pod,
        etd: shipments.etd,
        eta: shipments.eta,
        carrier: shipments.carrier,
        shipper: shipments.shipper,
        consignee: shipments.consignee,
        notifyParty: shipments.notifyParty,
        goodsDescription: shipments.goodsDescription,
        weightKg: shipments.weightKg,
        quantity: shipments.quantity,
        status: shipments.status,
        source: shipments.source,
        containerType: shipments.containerType,
        cargoType: shipments.cargoType,
        valueUsd: shipments.valueUsd,
        originPort: shipments.originPort,
        destPort: shipments.destPort,
        containerCount: shipments.containerCount,
        reference: shipments.reference,
        currentLocation: shipments.currentLocation,
        createdAt: shipments.createdAt,
        updatedAt: shipments.updatedAt,
        bolFileName: bolDocuments.fileName,
      })
      .from(shipments)
      .leftJoin(bolDocuments, eq(shipments.bolDocumentId, bolDocuments.id))
      .orderBy(desc(shipments.createdAt));

    if (format === "xlsx") {
      return await xlsxResponse(rows);
    }

    // Default: CSV
    return csvResponse(rows);
  } catch (error) {
    console.error("Failed to export shipments:", error);
    return NextResponse.json(
      { error: "Failed to export shipments" },
      { status: 500 },
    );
  }
}

// ── CSV helpers ────────────────────────────────────────

const STATUS_LABELS: Record<string, string> = {
  booked: "Booked",
  in_transit: "In Transit",
  at_port: "At Port",
  customs: "Customs",
  delivered: "Delivered",
  delayed: "Delayed",
  arrived: "Arrived",
  pending: "Pending",
};

const SOURCE_LABELS: Record<string, string> = {
  manual: "Manual",
  bol_ocr: "AI / OCR",
  csv_import: "CSV Import",
};

type ShipmentRow = {
  containerNumber: string | null;
  vesselName: string | null;
  voyageNumber: string | null;
  pol: string | null;
  pod: string | null;
  etd: Date | null;
  eta: Date | null;
  carrier: string | null;
  shipper: string | null;
  consignee: string | null;
  notifyParty: string | null;
  goodsDescription: string | null;
  weightKg: number | null;
  quantity: number | null;
  status: string;
  source: string;
  containerType: string | null;
  cargoType: string | null;
  valueUsd: string | null;
  originPort: string | null;
  destPort: string | null;
  containerCount: number | null;
  reference: string | null;
  currentLocation: string | null;
  createdAt: Date;
  updatedAt: Date;
  bolFileName: string | null;
};

function csvEscape(val: string | number | null | undefined): string {
  if (val == null) return "";
  const s = String(val);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function formatDateVal(d: Date | null): string {
  if (!d) return "";
  try {
    return d.toISOString().slice(0, 10);
  } catch {
    return "";
  }
}

function csvResponse(rows: ShipmentRow[]): NextResponse {
  // CSV header row
  const headers = [
    "Container Number",
    "Reference",
    "Vessel Name",
    "Voyage Number",
    "Origin (POL)",
    "Destination (POD)",
    "ETD",
    "ETA",
    "Carrier",
    "Shipper",
    "Consignee",
    "Notify Party",
    "Goods Description",
    "Weight (kg)",
    "Quantity",
    "Container Type",
    "Cargo Type",
    "Container Count",
    "Value (USD)",
    "Status",
    "Source",
    "Current Location",
    "BOL File",
    "Created At",
    "Updated At",
  ];

  const lines: string[] = [headers.map(csvEscape).join(",")];

  for (const row of rows) {
    const line = [
      row.containerNumber,
      row.reference,
      row.vesselName,
      row.voyageNumber,
      row.pol ?? row.originPort,
      row.pod ?? row.destPort,
      formatDateVal(row.etd),
      formatDateVal(row.eta),
      row.carrier,
      row.shipper,
      row.consignee,
      row.notifyParty,
      row.goodsDescription,
      row.weightKg,
      row.quantity,
      row.containerType,
      row.cargoType,
      row.containerCount,
      row.valueUsd,
      STATUS_LABELS[row.status] ?? row.status,
      SOURCE_LABELS[row.source] ?? row.source,
      row.currentLocation,
      row.bolFileName,
      formatDateVal(row.createdAt),
      formatDateVal(row.updatedAt),
    ].map(csvEscape).join(",");
    lines.push(line);
  }

  const csv = lines.join("\n");

  // Generate filename with current date
  const today = new Date().toISOString().slice(0, 10);
  const filename = `shipping-savior-load-board-${today}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

// ── XLSX helpers ───────────────────────────────────────

/** Compute the ISO week number for a date. */
function isoWeek(d: Date): number {
  const tmp = new Date(d.getTime());
  tmp.setUTCHours(0, 0, 0, 0);
  // Thursday in current week decides the year.
  tmp.setUTCDate(tmp.getUTCDate() + 3 - ((tmp.getUTCDay() + 6) % 7));
  const week1 = new Date(tmp.getUTCFullYear(), 0, 4);
  return 1 + Math.round(
    ((tmp.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getUTCDay() + 6) % 7)) / 7,
  );
}

const XLSX_HEADERS = [
  { header: "Container Number", key: "containerNumber", width: 20 },
  { header: "Reference", key: "reference", width: 16 },
  { header: "Vessel Name", key: "vesselName", width: 22 },
  { header: "Voyage", key: "voyageNumber", width: 10 },
  { header: "Origin (POL)", key: "pol", width: 18 },
  { header: "Destination (POD)", key: "pod", width: 18 },
  { header: "ETD", key: "etd", width: 14 },
  { header: "ETA", key: "eta", width: 14 },
  { header: "Carrier", key: "carrier", width: 16 },
  { header: "Shipper", key: "shipper", width: 20 },
  { header: "Consignee", key: "consignee", width: 20 },
  { header: "Goods Description", key: "goodsDescription", width: 30 },
  { header: "Weight (kg)", key: "weightKg", width: 12 },
  { header: "Qty", key: "quantity", width: 8 },
  { header: "Container Type", key: "containerType", width: 14 },
  { header: "Cargo Type", key: "cargoType", width: 14 },
  { header: "Container Count", key: "containerCount", width: 10 },
  { header: "Value (USD)", key: "valueUsd", width: 14 },
  { header: "Status", key: "status", width: 14 },
  { header: "Current Location", key: "currentLocation", width: 20 },
  { header: "BOL File", key: "bolFileName", width: 20 },
];

/** Navy-inspired theme colours. */
const THEME = {
  headerFill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF1E3A5F" } } as const,
  headerFont: { bold: true, color: { argb: "FFFFFFFF" }, size: 11, name: "Calibri" },
  altRowFill: { type: "pattern", pattern: "solid", fgColor: { argb: "FFF0F4F8" } } as const,
  border: {
    top: { style: "thin", color: { argb: "FFCBD5E1" } },
    left: { style: "thin", color: { argb: "FFCBD5E1" } },
    bottom: { style: "thin", color: { argb: "FFCBD5E1" } },
    right: { style: "thin", color: { argb: "FFCBD5E1" } },
  } as const,
  sectionFill: { type: "pattern", pattern: "solid", fgColor: { argb: "FFD4E2F0" } } as const,
  sectionFont: { bold: true, color: { argb: "FF1E3A5F" }, size: 12, name: "Calibri" },
};

async function xlsxResponse(rows: ShipmentRow[]): Promise<NextResponse> {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Load Board");

  // ── Column widths ──
  ws.columns = XLSX_HEADERS.map((h) => ({ header: h.header, key: h.key, width: h.width }));

  // ── Group shipments by ISO week ──
  // Use ETD as the week anchor; fall back to createdAt if ETD is null.
  const groups = new Map<number, ShipmentRow[]>();
  for (const row of rows) {
    const anchor = row.etd ?? row.createdAt;
    const week = isoWeek(new Date(anchor));
    if (!groups.has(week)) groups.set(week, []);
    groups.get(week)!.push(row);
  }

  // Sort weeks ascending
  const sortedWeeks = Array.from(groups.keys()).sort((a, b) => a - b);

  let rowIndex = 1;

  for (const week of sortedWeeks) {
    const weekRows = groups.get(week)!;

    // ── Section header ──
    const sectionCell = ws.getCell(rowIndex, 1);
    sectionCell.value = `Week ${week} — ${weekRows.length} shipment(s)`;
    sectionCell.font = THEME.sectionFont;
    sectionCell.fill = THEME.sectionFill;
    // Merge across all columns for the section header
    ws.mergeCells(rowIndex, 1, rowIndex, XLSX_HEADERS.length);
    rowIndex++;

    // ── Column headers ──
    const headerRow = ws.getRow(rowIndex);
    for (let c = 0; c < XLSX_HEADERS.length; c++) {
      const cell = headerRow.getCell(c + 1);
      cell.value = XLSX_HEADERS[c].header;
      cell.font = THEME.headerFont;
      cell.fill = THEME.headerFill;
      cell.border = THEME.border;
      cell.alignment = { vertical: "middle", wrapText: true };
    }
    headerRow.height = 28;
    rowIndex++;

    // ── Data rows ──
    for (let i = 0; i < weekRows.length; i++) {
      const row = weekRows[i];
      const xlRow = ws.getRow(rowIndex);

      const values = [
        row.containerNumber,
        row.reference,
        row.vesselName,
        row.voyageNumber,
        row.pol ?? row.originPort,
        row.pod ?? row.destPort,
        row.etd ? formatExcelDate(row.etd) : null,
        row.eta ? formatExcelDate(row.eta) : null,
        row.carrier,
        row.shipper,
        row.consignee,
        row.goodsDescription,
        row.weightKg,
        row.quantity,
        row.containerType,
        row.cargoType,
        row.containerCount,
        row.valueUsd,
        STATUS_LABELS[row.status] ?? row.status,
        row.currentLocation,
        row.bolFileName,
      ];

      for (let c = 0; c < values.length; c++) {
        const cell = xlRow.getCell(c + 1);
        cell.value = values[c];
        cell.border = THEME.border;
        cell.alignment = { vertical: "middle", wrapText: true };

        // Alternate row shading
        if (i % 2 === 1) {
          cell.fill = THEME.altRowFill;
        }
      }

      rowIndex++;
    }

    // Blank row between groups
    rowIndex++;
  }

  // ── Freeze header area ──
  ws.views = [{ state: "frozen", ySplit: 1, activeCell: "A2" }];

  // ── Week number for filename ──
  const currentWeek = sortedWeeks.length > 0 ? sortedWeeks[sortedWeeks.length - 1] : isoWeek(new Date());
  const filename = `load-board-week-${String(currentWeek).padStart(2, "0")}.xlsx`;

  // ── Write to buffer ──
  const buf = (await wb.xlsx.writeBuffer()) as Buffer;

  return new NextResponse(buf, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

function formatExcelDate(d: Date): string {
  try {
    return d.toISOString().slice(0, 10);
  } catch {
    return String(d);
  }
}

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { shipments, bolDocuments } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";

// GET /api/shipments/export?format=csv
// Exports the weekly load board (all shipments) as a CSV file for ops handoff.
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

    if (format === "csv") {
      return csvResponse(rows);
    }

    return NextResponse.json({ shipments: rows });
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

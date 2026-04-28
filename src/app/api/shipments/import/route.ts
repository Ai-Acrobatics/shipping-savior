import { NextRequest, NextResponse } from "next/server";
import { parse } from "csv-parse/sync";
import { auth } from "@/lib/auth";
import { bulkInsertShipments } from "@/lib/db/queries/shipments";
import type { NewShipment, ShipmentStatus } from "@/lib/db/schema";
import { CSV_TEMPLATE_COLUMNS } from "@/lib/shipments/csv-template";

type CsvRow = Record<string, string>;

interface ParsedRow {
  rowNumber: number;
  raw: CsvRow;
  shipment: Partial<NewShipment> | null;
  errors: string[];
}

const VALID_STATUSES: ShipmentStatus[] = [
  "booked",
  "in_transit",
  "at_port",
  "customs",
  "delivered",
  "delayed",
  "arrived",
  "pending",
];

function parseDate(value: string): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

function parseInteger(value: string): number | null {
  if (!value) return null;
  const cleaned = value.replace(/[, ]/g, "");
  const n = parseInt(cleaned, 10);
  return isNaN(n) ? null : n;
}

function parseFloatStr(value: string): string | null {
  if (!value) return null;
  const cleaned = value.replace(/[$, ]/g, "");
  const n = parseFloat(cleaned);
  return isNaN(n) ? null : n.toFixed(2);
}

function validateRow(row: CsvRow, rowNumber: number): ParsedRow {
  const errors: string[] = [];

  // Trim all values
  const r: CsvRow = {};
  for (const [k, v] of Object.entries(row)) {
    r[k.trim().toLowerCase()] = (v ?? "").toString().trim();
  }

  // Required fields
  if (!r.reference) errors.push("reference is required");
  if (!r.origin_port) errors.push("origin_port is required");
  if (!r.dest_port) errors.push("dest_port is required");

  // Date validation
  let etd: Date | null = null;
  let eta: Date | null = null;
  if (r.etd) {
    etd = parseDate(r.etd);
    if (!etd) errors.push(`etd "${r.etd}" is not a valid date (use YYYY-MM-DD)`);
  }
  if (r.eta) {
    eta = parseDate(r.eta);
    if (!eta) errors.push(`eta "${r.eta}" is not a valid date (use YYYY-MM-DD)`);
  }

  // Numeric validation
  let containerCount: number | null = null;
  if (r.container_count) {
    containerCount = parseInteger(r.container_count);
    if (containerCount === null) errors.push(`container_count "${r.container_count}" is not a valid integer`);
  }

  let weightKg: number | null = null;
  if (r.weight_kg) {
    weightKg = parseInteger(r.weight_kg);
    if (weightKg === null) errors.push(`weight_kg "${r.weight_kg}" is not a valid integer`);
  }

  let valueUsd: string | null = null;
  if (r.value_usd) {
    valueUsd = parseFloatStr(r.value_usd);
    if (valueUsd === null) errors.push(`value_usd "${r.value_usd}" is not a valid number`);
  }

  // Optional status (default in_transit)
  let status: ShipmentStatus = "in_transit";
  if (r.status) {
    const s = r.status.toLowerCase().replace(/[- ]/g, "_") as ShipmentStatus;
    if (VALID_STATUSES.includes(s)) {
      status = s;
    } else {
      errors.push(`status "${r.status}" is not valid (allowed: ${VALID_STATUSES.join(", ")})`);
    }
  }

  if (errors.length > 0) {
    return { rowNumber, raw: r, shipment: null, errors };
  }

  const shipment: Partial<NewShipment> = {
    reference: r.reference || null,
    originPort: r.origin_port || null,
    destPort: r.dest_port || null,
    carrier: r.carrier || null,
    etd,
    eta,
    containerCount,
    containerType: r.container_type || null,
    cargoType: r.cargo_type || null,
    weightKg,
    valueUsd,
    status,
    source: "csv_import",
    progress: 0,
  };

  return { rowNumber, raw: r, shipment, errors: [] };
}

async function parseCsvBody(request: NextRequest): Promise<{ csvText: string | null; error?: string }> {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    try {
      const form = await request.formData();
      const file = form.get("file");
      if (!(file instanceof File)) return { csvText: null, error: "No file uploaded (expected form field 'file')" };
      const text = await file.text();
      return { csvText: text };
    } catch (e) {
      return { csvText: null, error: `Failed to read uploaded file: ${(e as Error).message}` };
    }
  }

  if (contentType.includes("application/json")) {
    try {
      const body = await request.json();
      if (typeof body?.csvText !== "string") {
        return { csvText: null, error: "JSON body must contain a 'csvText' string" };
      }
      return { csvText: body.csvText };
    } catch {
      return { csvText: null, error: "Invalid JSON body" };
    }
  }

  // Fall back: raw text
  try {
    const text = await request.text();
    if (!text.trim()) return { csvText: null, error: "Empty CSV body" };
    return { csvText: text };
  } catch {
    return { csvText: null, error: "Could not read request body" };
  }
}

// POST /api/shipments/import — parse, validate, and (optionally) insert CSV rows.
// Query params:
//   ?dryRun=1  — parse + validate only, do not insert. Returns preview + errors.
// Body: either multipart form-data (field "file") or JSON {"csvText": "..."} or raw CSV text.
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orgId = session.user.orgId;
  const userId = session.user.id;
  if (!orgId) {
    return NextResponse.json({ error: "User has no organization" }, { status: 400 });
  }

  const { csvText, error: bodyError } = await parseCsvBody(request);
  if (!csvText) {
    return NextResponse.json({ error: bodyError ?? "No CSV provided" }, { status: 400 });
  }

  let records: CsvRow[];
  try {
    records = parse(csvText, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      relax_quotes: true,
      bom: true,
    }) as CsvRow[];
  } catch (e) {
    return NextResponse.json(
      { error: `Failed to parse CSV: ${(e as Error).message}` },
      { status: 400 }
    );
  }

  if (records.length === 0) {
    return NextResponse.json({ error: "CSV contained no rows" }, { status: 400 });
  }

  // Validate all rows
  const parsed: ParsedRow[] = records.map((row, i) => validateRow(row, i + 2)); // +2 = header is row 1
  const validRows = parsed.filter((r) => r.errors.length === 0 && r.shipment);
  const invalidRows = parsed.filter((r) => r.errors.length > 0);

  const url = new URL(request.url);
  const dryRun = url.searchParams.get("dryRun") === "1" || url.searchParams.get("dryRun") === "true";

  if (dryRun) {
    return NextResponse.json({
      dryRun: true,
      totalRows: records.length,
      validCount: validRows.length,
      invalidCount: invalidRows.length,
      preview: parsed.slice(0, 50).map((p) => ({
        rowNumber: p.rowNumber,
        raw: p.raw,
        errors: p.errors,
        valid: p.errors.length === 0,
      })),
    });
  }

  if (invalidRows.length > 0) {
    return NextResponse.json(
      {
        error: "CSV contains invalid rows. Fix errors and re-upload, or call with ?dryRun=1 to preview.",
        invalidCount: invalidRows.length,
        invalidRows: invalidRows.slice(0, 50),
      },
      { status: 400 }
    );
  }

  // Insert, scoped to caller's org
  const toInsert: NewShipment[] = validRows.map((p) => ({
    ...(p.shipment as Partial<NewShipment>),
    orgId,
    userId,
  })) as NewShipment[];

  try {
    const inserted = await bulkInsertShipments(toInsert);
    return NextResponse.json(
      {
        ok: true,
        inserted: inserted.length,
        ids: inserted.map((s) => s.id),
      },
      { status: 201 }
    );
  } catch (e) {
    console.error("Failed to bulk insert shipments:", e);
    return NextResponse.json(
      { error: "Failed to insert shipments" },
      { status: 500 }
    );
  }
}

// GET /api/shipments/import — return the CSV template as a downloadable file.
export async function GET() {
  const header = CSV_TEMPLATE_COLUMNS.join(",");
  const sample = [
    "SS-2026-1001",
    "Shanghai",
    "Los Angeles",
    "COSCO",
    "2026-05-01",
    "2026-05-18",
    "2",
    "40HC",
    "general",
    "42000",
    "187400.00",
  ].join(",");
  const csv = `${header}\n${sample}\n`;
  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="shipments-template.csv"',
    },
  });
}

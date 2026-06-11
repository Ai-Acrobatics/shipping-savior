import ExcelJS from "exceljs";

/**
 * Parser for Blake's refrigerated-export operating workbooks (AI-10777).
 *
 * Real-world shape (october.xlsx / December.xlsx, one sheet per ISO week):
 * - Row 1 = headers, row 2 = overflow sub-headers ("Delivery @ Port",
 *   "Temperature C", "Late Gate") — both skipped for data.
 * - Column layout varies per sheet (21–22 cols; Week 43 drops "Type of
 *   service" and moves "Customer"), so mapping is header-driven, never
 *   positional. Headers contain typos ("Corssdock") and trailing spaces.
 * - A record is any row with a Booking value; blank spacer rows are common.
 * - Weights arrive as kg with thousands separators ("14,738.76"), plain kg
 *   ("14288"), metric tonnes ("14.515"), or "TBD".
 * - Dates arrive as Excel dates, "Sep 30 2025 16:00", or "09/29/2025 12:00".
 */

export interface ParsedShipmentRow {
  /** Mapped onto the shipments table */
  reference: string; // Booking #
  pol: string | null;
  pod: string | null;
  cargoType: string | null;
  carrier: string | null;
  vesselName: string | null;
  etd: Date | null;
  eta: Date | null;
  containerNumber: string | null;
  shipper: string | null; // pickup location
  goodsDescription: string | null; // CTNS text
  weightKg: number | null;
  quantity: number | null; // carton count
  /** Everything board-specific, persisted to shipments.import_meta */
  meta: {
    week: string;
    rowNumber: number;
    typeOfService: string | null;
    customerCode: string | null;
    crossdockAppointment: string | null;
    temperature: string | null; // "Orden" column: setpoint + vents
    puNumber: string | null;
    poNumber: string | null;
    reeferCutoff: string | null;
    documentCutoff: string | null;
    aesNumber: string | null;
    sealNumber: string | null;
    rawWeight: string | null;
    rawCartons: string | null;
  };
  /** Why this row needs human review (empty = clean) */
  reviewIssues: string[];
}

export interface WorkbookParseResult {
  rows: ParsedShipmentRow[];
  sheetsParsed: string[];
  sheetsSkipped: { sheet: string; reason: string }[];
  /** rows dropped because they repeated a (booking, container) pair — merged-cell artifacts */
  duplicateRowsDropped: number;
}

/**
 * Identity of a shipment line on the board. A booking can legitimately span
 * several containers (one row each) — e.g. RICFJP621700 has 4 containers —
 * but vertically-merged cells make exceljs repeat the same record on
 * consecutive rows, so (booking, container) is the real unique key.
 */
export function rowKey(reference: string, containerNumber: string | null): string {
  return `${reference.trim()}::${(containerNumber ?? "").trim().toUpperCase()}`;
}

// Canonical field -> header aliases (normalized: lowercase, single-spaced,
// punctuation-insensitive, common typos folded in).
const HEADER_MAP: Record<string, string[]> = {
  typeOfService: ["type of service"],
  customerCode: ["customer"],
  crossdockAppointment: ["apt date request crossdock", "apt date request corssdock"],
  booking: ["booking"],
  pol: ["port of lading", "port of loading", "pol"],
  pod: ["destination"],
  cargoType: ["commodity"],
  temperature: ["orden", "temperature c", "temperature"],
  carrier: ["carrier"],
  vesselName: ["vessel"],
  etd: ["departure date", "etd"],
  shipper: ["pick up location (qty)", "pick up location", "pickup location"],
  puNumber: ["pu#", "pu #"],
  poNumber: ["po#", "po #"],
  reeferCutoff: ["reefer cutoff"],
  documentCutoff: ["document cutoff"],
  eta: ["eta"],
  aesNumber: ["aes #", "aes#"],
  containerNumber: ["cont #", "cont#", "container #"],
  sealNumber: ["seal #", "seal#"],
  weight: ["weight"],
  cartons: ["ctns", "cartons"],
};

function normalizeHeader(raw: unknown): string {
  return String(raw ?? "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function cellToString(value: ExcelJS.CellValue): string | null {
  if (value === null || value === undefined) return null;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "object") {
    if ("richText" in value) {
      return value.richText.map((r) => r.text).join("").trim() || null;
    }
    if ("text" in value) return String(value.text).trim() || null;
    if ("result" in value) return value.result != null ? String(value.result).trim() : null;
    return null;
  }
  const s = String(value).trim();
  return s.length ? s : null;
}

function isTbd(s: string | null): boolean {
  return !!s && /^tbd\b/i.test(s.trim());
}

/** Parse Blake's weight formats into integer kg. Returns null when unknown. */
export function parseWeightKg(raw: string | null): number | null {
  if (!raw || isTbd(raw)) return null;
  const cleaned = raw.replace(/,/g, "").replace(/[^\d.]/g, "");
  if (!cleaned) return null;
  const n = parseFloat(cleaned);
  if (isNaN(n) || n <= 0) return null;
  // Values under 100 are metric tonnes on this board (e.g. "14.515", "19.051");
  // anything larger is already kg ("14288", "14738.76965").
  const kg = n < 100 ? n * 1000 : n;
  return Math.round(kg);
}

/** Parse Excel dates plus the string formats seen on the board. */
export function parseBoardDate(value: ExcelJS.CellValue): Date | null {
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
  const s = cellToString(value);
  if (!s || isTbd(s)) return null;
  // "09/29/2025 12:00" | "Sep 30 2025 16:00" | ISO — Date.parse handles all
  // three in V8; reject anything it can't.
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

/** Leading integer from "1490 CTNS GRAPES / Uvas". */
export function parseCartons(raw: string | null): number | null {
  if (!raw) return null;
  const m = raw.replace(/,/g, "").match(/\d+/);
  if (!m) return null;
  const n = parseInt(m[0], 10);
  return n > 0 ? n : null;
}

export async function parseWorkbook(
  buffer: Buffer,
  fileName: string
): Promise<WorkbookParseResult> {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buffer as unknown as ExcelJS.Buffer);

  const rows: ParsedShipmentRow[] = [];
  const sheetsParsed: string[] = [];
  const sheetsSkipped: { sheet: string; reason: string }[] = [];
  const seenKeys = new Map<string, number>(); // rowKey -> index into rows
  let duplicateRowsDropped = 0;

  wb.eachSheet((ws) => {
    // Build header -> column index map from row 1.
    const colFor: Record<string, number> = {};
    ws.getRow(1).eachCell((cell, colNumber) => {
      const norm = normalizeHeader(cellToString(cell.value));
      if (!norm) return;
      for (const [field, aliases] of Object.entries(HEADER_MAP)) {
        if (aliases.includes(norm) && colFor[field] === undefined) {
          colFor[field] = colNumber;
        }
      }
    });

    if (colFor.booking === undefined) {
      sheetsSkipped.push({ sheet: ws.name, reason: "no Booking column in row 1" });
      return;
    }
    sheetsParsed.push(ws.name);

    const str = (row: ExcelJS.Row, field: string): string | null =>
      colFor[field] !== undefined ? cellToString(row.getCell(colFor[field]).value) : null;
    const cellVal = (row: ExcelJS.Row, field: string): ExcelJS.CellValue =>
      colFor[field] !== undefined ? row.getCell(colFor[field]).value : null;

    // Row 1 = headers, row 2 = sub-headers; data starts at row 3.
    for (let r = 3; r <= ws.rowCount; r++) {
      const row = ws.getRow(r);
      const booking = str(row, "booking");
      if (!booking) continue; // spacer row

      const reviewIssues: string[] = [];
      const rawWeight = str(row, "weight");
      const rawCartons = str(row, "cartons");
      const weightKg = parseWeightKg(rawWeight);
      const etd = parseBoardDate(cellVal(row, "etd"));
      const eta = parseBoardDate(cellVal(row, "eta"));
      const containerNumber = str(row, "containerNumber");
      const aesNumber = str(row, "aesNumber");

      if (!containerNumber || isTbd(containerNumber)) {
        reviewIssues.push("missing container number");
      }
      if (!aesNumber || isTbd(aesNumber)) {
        reviewIssues.push("missing AES filing number");
      }
      if (!rawWeight || isTbd(rawWeight)) {
        reviewIssues.push("missing weight");
      } else if (weightKg === null) {
        reviewIssues.push(`unparseable weight: "${rawWeight}"`);
      }
      if (!etd) reviewIssues.push("missing/unparseable departure date");
      if (!eta) reviewIssues.push("missing/unparseable ETA");

      const parsedRow: ParsedShipmentRow = {
        reference: booking,
        pol: str(row, "pol"),
        pod: str(row, "pod"),
        cargoType: str(row, "cargoType"),
        carrier: str(row, "carrier"),
        vesselName: str(row, "vesselName"),
        etd,
        eta,
        containerNumber: containerNumber && !isTbd(containerNumber) ? containerNumber : null,
        shipper: str(row, "shipper"),
        goodsDescription: rawCartons,
        weightKg,
        quantity: parseCartons(rawCartons),
        meta: {
          week: ws.name,
          rowNumber: r,
          typeOfService: str(row, "typeOfService"),
          customerCode: str(row, "customerCode"),
          crossdockAppointment: str(row, "crossdockAppointment"),
          temperature: str(row, "temperature"),
          puNumber: str(row, "puNumber"),
          poNumber: str(row, "poNumber"),
          reeferCutoff: str(row, "reeferCutoff"),
          documentCutoff: str(row, "documentCutoff"),
          aesNumber,
          sealNumber: str(row, "sealNumber"),
          rawWeight,
          rawCartons,
        },
        reviewIssues,
      };

      // Vertically-merged cells repeat a record on consecutive rows; keep the
      // cleaner copy of any (booking, container) pair.
      const key = rowKey(parsedRow.reference, parsedRow.containerNumber);
      const existingIdx = seenKeys.get(key);
      if (existingIdx !== undefined) {
        duplicateRowsDropped++;
        if (rows[existingIdx].reviewIssues.length > parsedRow.reviewIssues.length) {
          rows[existingIdx] = parsedRow;
        }
        continue;
      }
      seenKeys.set(key, rows.length);
      rows.push(parsedRow);
    }
  });

  void fileName;
  return { rows, sheetsParsed, sheetsSkipped, duplicateRowsDropped };
}

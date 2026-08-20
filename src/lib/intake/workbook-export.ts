import ExcelJS from "exceljs";

/**
 * Clean workbook write-back for Blake's reefer-export board (AI-12009).
 *
 * The import side (`workbook.ts`) reads Blake's hand-maintained .xlsx, flags
 * incomplete rows, and drops them into the review queue. This is the other
 * half of that loop: once the gaps are filled in-app, the board is written
 * back out as a *clean* .xlsx — one sheet per ISO week, exactly one header
 * row, correctly-spelled headers, real Excel dates and numeric weights.
 *
 * Two properties matter and are covered by tests:
 * 1. Round-trip — the emitted headers are all aliases `parseWorkbook` already
 *    understands, so an exported file re-imports with zero review issues.
 * 2. Typed cells — dates are Date values with a display format (not strings),
 *    weights and carton counts are numbers, so Blake can sort and sum without
 *    re-typing anything. That is the manual Excel step this replaces.
 */

/** One board line, as read off the shipments table. */
export interface WorkbookExportRow {
  reference: string | null;
  pol: string | null;
  pod: string | null;
  cargoType: string | null;
  carrier: string | null;
  vesselName: string | null;
  etd: Date | string | null;
  eta: Date | string | null;
  containerNumber: string | null;
  shipper: string | null;
  goodsDescription: string | null;
  weightKg: number | null;
  status: string | null;
  importMeta: Record<string, unknown> | null;
}

export interface BuildWorkbookOptions {
  /**
   * Include rows that still carry unresolved reviewIssues. Off by default —
   * "clean" means every row on the sheet is complete. When on, an extra
   * "Review Notes" column spells out what is still missing.
   */
  includeUnresolved?: boolean;
  /** Stamped into the cover metadata. Defaults to now. */
  generatedAt?: Date;
}

/**
 * Canonical column order, mirroring Blake's board left-to-right.
 *
 * Every header here is an alias `workbook.ts` HEADER_MAP already accepts, so
 * exports re-import losslessly. Where Blake's file has a typo or an opaque
 * label we emit the clean synonym instead: "Corssdock" -> "Crossdock",
 * "Orden" -> "Temperature C". Do not rename a header without adding the new
 * spelling to HEADER_MAP first, or the round-trip test will fail.
 */
const COLUMNS: {
  header: string;
  width: number;
  value: (row: WorkbookExportRow, meta: Meta) => ExcelJS.CellValue;
  numFmt?: string;
}[] = [
  { header: "Type of service", width: 16, value: (_r, m) => m.typeOfService },
  { header: "Customer", width: 12, value: (_r, m) => m.customerCode },
  { header: "Apt date request Crossdock", width: 24, value: (_r, m) => m.crossdockAppointment },
  { header: "Booking", width: 16, value: (r) => r.reference },
  { header: "Port of Lading", width: 16, value: (r) => r.pol },
  { header: "Destination", width: 18, value: (r) => r.pod },
  { header: "Commodity", width: 14, value: (r) => r.cargoType },
  { header: "Temperature C", width: 20, value: (_r, m) => m.temperature },
  { header: "Carrier", width: 14, value: (r) => r.carrier },
  { header: "Vessel", width: 26, value: (r) => r.vesselName },
  {
    header: "Departure Date",
    width: 16,
    value: (r) => toDate(r.etd),
    numFmt: "mm/dd/yyyy",
  },
  { header: "Pick up location", width: 22, value: (r) => r.shipper },
  { header: "PU#", width: 12, value: (_r, m) => m.puNumber },
  { header: "PO#", width: 12, value: (_r, m) => m.poNumber },
  { header: "Reefer Cutoff", width: 18, value: (_r, m) => m.reeferCutoff },
  { header: "Document cutoff", width: 18, value: (_r, m) => m.documentCutoff },
  { header: "ETA", width: 16, value: (r) => toDate(r.eta), numFmt: "mm/dd/yyyy" },
  { header: "AES #", width: 20, value: (_r, m) => m.aesNumber },
  { header: "CONT #", width: 16, value: (r) => r.containerNumber },
  { header: "SEAL #", width: 14, value: (_r, m) => m.sealNumber },
  { header: "Weight", width: 12, value: (r) => r.weightKg, numFmt: "#,##0" },
  { header: "CTNS", width: 26, value: (r) => r.goodsDescription },
  { header: "Status", width: 14, value: (r) => statusLabel(r.status) },
];

/** Only emitted when unresolved rows are included. Ignored on re-import. */
const REVIEW_COLUMN = { header: "Review Notes", width: 40 };

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

function statusLabel(status: string | null): string | null {
  if (!status) return null;
  return STATUS_LABELS[status] ?? status;
}

interface Meta {
  week: string | null;
  typeOfService: string | null;
  customerCode: string | null;
  crossdockAppointment: string | null;
  temperature: string | null;
  puNumber: string | null;
  poNumber: string | null;
  reeferCutoff: string | null;
  documentCutoff: string | null;
  aesNumber: string | null;
  sealNumber: string | null;
  reviewIssues: string[];
}

const META_STRING_KEYS = [
  "week",
  "typeOfService",
  "customerCode",
  "crossdockAppointment",
  "temperature",
  "puNumber",
  "poNumber",
  "reeferCutoff",
  "documentCutoff",
  "aesNumber",
  "sealNumber",
] as const;

/** importMeta is untyped jsonb — narrow it defensively. */
export function readMeta(raw: Record<string, unknown> | null): Meta {
  const src = raw ?? {};
  const out = {} as Meta;
  for (const key of META_STRING_KEYS) {
    const v = src[key];
    out[key] = typeof v === "string" && v.trim().length ? v.trim() : null;
  }
  out.reviewIssues = Array.isArray(src.reviewIssues)
    ? src.reviewIssues.filter((i): i is string => typeof i === "string")
    : [];
  return out;
}

function toDate(value: Date | string | null): Date | null {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Sheet names must be <=31 chars and free of : \ / ? * [ ] — Excel refuses to
 * open a workbook that breaks either rule, so sanitize rather than trust the
 * week label that came off the imported file.
 */
export function safeSheetName(raw: string | null, fallback: string): string {
  const cleaned = (raw ?? "").replace(/[:\\/?*[\]]/g, " ").replace(/\s+/g, " ").trim();
  if (!cleaned) return fallback;
  return cleaned.slice(0, 31);
}

/** Group rows into sheets by their week label, preserving first-seen order. */
export function groupByWeek(
  rows: WorkbookExportRow[]
): { sheet: string; rows: WorkbookExportRow[] }[] {
  const groups = new Map<string, WorkbookExportRow[]>();
  const used = new Set<string>();

  for (const row of rows) {
    const label = readMeta(row.importMeta).week;
    const key = label ?? "";
    const bucket = groups.get(key);
    if (bucket) bucket.push(row);
    else groups.set(key, [row]);
  }

  return Array.from(groups.entries()).map(([label, groupRows]) => {
    // Two different week labels can sanitize to the same name; disambiguate
    // rather than let exceljs throw on a duplicate worksheet name.
    let name = safeSheetName(label || null, "Unscheduled");
    if (used.has(name)) {
      let n = 2;
      while (used.has(`${name.slice(0, 28)} (${n})`)) n++;
      name = `${name.slice(0, 28)} (${n})`;
    }
    used.add(name);
    return { sheet: name, rows: groupRows };
  });
}

/** ETD ascending (undated last), then booking, so the sheet reads like a plan. */
export function sortBoardRows(rows: WorkbookExportRow[]): WorkbookExportRow[] {
  return [...rows].sort((a, b) => {
    const da = toDate(a.etd)?.getTime();
    const db = toDate(b.etd)?.getTime();
    if (da !== db) {
      if (da === undefined) return 1;
      if (db === undefined) return -1;
      return da - db;
    }
    return (a.reference ?? "").localeCompare(b.reference ?? "");
  });
}

export function exportFileName(generatedAt: Date = new Date()): string {
  return `shipping-savior-board-${generatedAt.toISOString().slice(0, 10)}.xlsx`;
}

/**
 * Render the board to a styled .xlsx buffer. Returns an empty-but-valid
 * workbook (single "Board" sheet with headers) when there is nothing to
 * export, so the download never fails on an empty queue.
 */
export async function buildCleanWorkbook(
  rows: WorkbookExportRow[],
  options: BuildWorkbookOptions = {}
): Promise<Buffer> {
  const { includeUnresolved = false } = options;
  const wb = new ExcelJS.Workbook();
  wb.creator = "Shipping Savior";
  wb.created = options.generatedAt ?? new Date();

  const headers = [
    ...COLUMNS.map((c) => c.header),
    ...(includeUnresolved ? [REVIEW_COLUMN.header] : []),
  ];
  const widths = [
    ...COLUMNS.map((c) => c.width),
    ...(includeUnresolved ? [REVIEW_COLUMN.width] : []),
  ];

  const groups = rows.length ? groupByWeek(rows) : [{ sheet: "Board", rows: [] }];

  for (const group of groups) {
    const ws = wb.addWorksheet(group.sheet);
    ws.columns = widths.map((width) => ({ width }));

    const headerRow = ws.addRow(headers);
    headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
    headerRow.alignment = { vertical: "middle", horizontal: "left" };
    headerRow.height = 22;
    headerRow.eachCell((cell) => {
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0F2A47" } };
    });

    for (const row of sortBoardRows(group.rows)) {
      const meta = readMeta(row.importMeta);
      const values = COLUMNS.map((c) => c.value(row, meta));
      if (includeUnresolved) values.push(meta.reviewIssues.join("; ") || null);

      const excelRow = ws.addRow(values);
      COLUMNS.forEach((col, idx) => {
        if (col.numFmt) excelRow.getCell(idx + 1).numFmt = col.numFmt;
      });
      // Flag anything still incomplete so it is obvious on the printed board.
      if (meta.reviewIssues.length > 0) {
        excelRow.eachCell((cell) => {
          cell.font = { color: { argb: "FF9A3412" } };
        });
      }
    }

    ws.views = [{ state: "frozen", ySplit: 1 }];
    ws.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: 1, column: headers.length },
    };
  }

  const out = await wb.xlsx.writeBuffer();
  return Buffer.from(out as ArrayBuffer);
}

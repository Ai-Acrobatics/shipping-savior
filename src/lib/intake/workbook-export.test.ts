/**
 * Write-back tests for the clean board export (AI-12009).
 *
 * The load-bearing property is the round-trip: an exported workbook must
 * re-import through `parseWorkbook` with every field intact and zero review
 * issues. If a header is renamed without updating HEADER_MAP, or a date/weight
 * stops being written as a typed cell, that test fails.
 */
import { describe, it, expect } from "vitest";
import ExcelJS from "exceljs";
import {
  buildCleanWorkbook,
  groupByWeek,
  readMeta,
  safeSheetName,
  sortBoardRows,
  exportFileName,
  type WorkbookExportRow,
} from "./workbook-export";
import { parseWorkbook } from "./workbook";

function row(overrides: Partial<WorkbookExportRow> = {}): WorkbookExportRow {
  return {
    reference: "USA142319",
    pol: "Hueneme",
    pod: "Puerto Quetzal",
    cargoType: "Grapes",
    carrier: "Chiquita",
    vesselName: "CHIQUITA PROGRESS 221S",
    etd: new Date("2025-10-02T03:00:00Z"),
    eta: new Date("2025-10-08T11:00:00Z"),
    containerNumber: "TEMU9638861",
    shipper: "Sunview",
    goodsDescription: "1600 CTNS GRAPES / Uvas",
    weightKg: 14739,
    status: "booked",
    importMeta: {
      week: "Week 41",
      typeOfService: "Full Service",
      customerCode: "C",
      crossdockAppointment: "KINGSCO DRAY",
      temperature: "0.0 Vents Closed",
      puNumber: "8559028",
      poNumber: "4526",
      reeferCutoff: "09/29/2025 12:00",
      documentCutoff: "09/29/2025 15:00",
      aesNumber: "X20250925038726",
      sealNumber: "1056676",
      reviewIssues: [],
    },
    ...overrides,
  };
}

async function load(buffer: Buffer): Promise<ExcelJS.Workbook> {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buffer as unknown as ExcelJS.Buffer);
  return wb;
}

describe("buildCleanWorkbook", () => {
  it("round-trips through the importer with zero review issues", async () => {
    const buffer = await buildCleanWorkbook([row()]);
    const parsed = await parseWorkbook(buffer, "export.xlsx");

    expect(parsed.rows).toHaveLength(1);
    const r = parsed.rows[0];
    expect(r.reviewIssues).toEqual([]);
    expect(r.reference).toBe("USA142319");
    expect(r.containerNumber).toBe("TEMU9638861");
    expect(r.pol).toBe("Hueneme");
    expect(r.pod).toBe("Puerto Quetzal");
    expect(r.carrier).toBe("Chiquita");
    expect(r.vesselName).toBe("CHIQUITA PROGRESS 221S");
    expect(r.weightKg).toBe(14739);
    expect(r.quantity).toBe(1600);
    expect(r.etd?.toISOString()).toBe("2025-10-02T03:00:00.000Z");
    expect(r.eta?.toISOString()).toBe("2025-10-08T11:00:00.000Z");
    expect(r.meta.aesNumber).toBe("X20250925038726");
    expect(r.meta.sealNumber).toBe("1056676");
    expect(r.meta.temperature).toBe("0.0 Vents Closed");
    expect(r.meta.puNumber).toBe("8559028");
    expect(r.meta.typeOfService).toBe("Full Service");
    expect(r.meta.customerCode).toBe("C");
    expect(r.meta.crossdockAppointment).toBe("KINGSCO DRAY");
  });

  it("writes one sheet per week, named after the week label", async () => {
    const buffer = await buildCleanWorkbook([
      row(),
      row({
        reference: "BN61723",
        importMeta: { week: "Week 43", reviewIssues: [] },
      }),
    ]);
    const wb = await load(buffer);
    expect(wb.worksheets.map((w) => w.name)).toEqual(["Week 41", "Week 43"]);
  });

  it("writes dates and weights as typed cells, not strings", async () => {
    const wb = await load(await buildCleanWorkbook([row()]));
    const ws = wb.getWorksheet("Week 41")!;
    const headers = (ws.getRow(1).values as unknown[]).slice(1).map(String);
    const cellFor = (header: string) =>
      ws.getRow(2).getCell(headers.indexOf(header) + 1);

    expect(cellFor("Departure Date").value).toBeInstanceOf(Date);
    expect(cellFor("ETA").value).toBeInstanceOf(Date);
    expect(cellFor("Departure Date").numFmt).toBe("mm/dd/yyyy");
    expect(cellFor("Weight").value).toBe(14739);
    expect(typeof cellFor("Weight").value).toBe("number");
  });

  it("emits exactly one header row with clean spellings", async () => {
    const wb = await load(await buildCleanWorkbook([row()]));
    const ws = wb.getWorksheet("Week 41")!;
    const headers = (ws.getRow(1).values as unknown[]).slice(1).map(String);

    expect(headers).toContain("Apt date request Crossdock"); // not "Corssdock"
    expect(headers).toContain("Temperature C"); // not "Orden"
    expect(headers.some((h) => h !== h.trim())).toBe(false);
    // Data starts immediately on row 2 — no sub-header row.
    expect(ws.getRow(2).getCell(headers.indexOf("Booking") + 1).value).toBe(
      "USA142319"
    );
    expect(ws.rowCount).toBe(2);
  });

  it("omits the Review Notes column unless unresolved rows are included", async () => {
    const clean = await load(await buildCleanWorkbook([row()]));
    const cleanHeaders = (clean.getWorksheet("Week 41")!.getRow(1).values as unknown[])
      .slice(1)
      .map(String);
    expect(cleanHeaders).not.toContain("Review Notes");

    const flagged = row({
      containerNumber: null,
      importMeta: { week: "Week 41", reviewIssues: ["missing container number"] },
    });
    const withNotes = await load(
      await buildCleanWorkbook([flagged], { includeUnresolved: true })
    );
    const ws = withNotes.getWorksheet("Week 41")!;
    const headers = (ws.getRow(1).values as unknown[]).slice(1).map(String);
    expect(headers).toContain("Review Notes");
    expect(ws.getRow(2).getCell(headers.indexOf("Review Notes") + 1).value).toBe(
      "missing container number"
    );
  });

  it("returns a valid empty workbook when there is nothing to export", async () => {
    const wb = await load(await buildCleanWorkbook([]));
    expect(wb.worksheets).toHaveLength(1);
    expect(wb.worksheets[0].name).toBe("Board");
    expect(wb.worksheets[0].rowCount).toBe(1); // headers only
  });

  it("freezes the header row and turns on autofilter", async () => {
    const wb = await load(await buildCleanWorkbook([row()]));
    const ws = wb.getWorksheet("Week 41")!;
    expect(ws.views[0]).toMatchObject({ state: "frozen", ySplit: 1 });
    expect(ws.autoFilter).toBeTruthy();
  });

  it("sorts each sheet by departure date, undated rows last", async () => {
    const buffer = await buildCleanWorkbook([
      row({ reference: "LATE", etd: new Date("2025-10-09T00:00:00Z") }),
      row({ reference: "NODATE", etd: null, eta: null }),
      row({ reference: "EARLY", etd: new Date("2025-10-01T00:00:00Z") }),
    ]);
    const wb = await load(buffer);
    const ws = wb.getWorksheet("Week 41")!;
    const headers = (ws.getRow(1).values as unknown[]).slice(1).map(String);
    const bookingCol = headers.indexOf("Booking") + 1;
    const order = [2, 3, 4].map((r) => ws.getRow(r).getCell(bookingCol).value);
    expect(order).toEqual(["EARLY", "LATE", "NODATE"]);
  });
});

describe("helpers", () => {
  it("sanitizes sheet names Excel would reject", () => {
    expect(safeSheetName("Week 41/43", "Board")).toBe("Week 41 43");
    expect(safeSheetName("   ", "Board")).toBe("Board");
    expect(safeSheetName("x".repeat(50), "Board")).toHaveLength(31);
  });

  it("disambiguates weeks that sanitize to the same sheet name", () => {
    const groups = groupByWeek([
      row({ importMeta: { week: "Week 41/1", reviewIssues: [] } }),
      row({ importMeta: { week: "Week 41?1", reviewIssues: [] } }),
    ]);
    expect(new Set(groups.map((g) => g.sheet)).size).toBe(2);
  });

  it("buckets rows without a week label into one sheet", () => {
    const groups = groupByWeek([row({ importMeta: null }), row({ importMeta: {} })]);
    expect(groups).toHaveLength(1);
    expect(groups[0].sheet).toBe("Unscheduled");
    expect(groups[0].rows).toHaveLength(2);
  });

  it("narrows untyped importMeta defensively", () => {
    const meta = readMeta({ week: "  Week 41  ", aesNumber: 42, reviewIssues: ["a", 7] });
    expect(meta.week).toBe("Week 41");
    expect(meta.aesNumber).toBeNull();
    expect(meta.reviewIssues).toEqual(["a"]);
    expect(readMeta(null).reviewIssues).toEqual([]);
  });

  it("does not mutate the caller's array when sorting", () => {
    const rows = [row({ reference: "B" }), row({ reference: "A" })];
    const sorted = sortBoardRows(rows);
    expect(rows[0].reference).toBe("B");
    expect(sorted[0].reference).toBe("A");
  });

  it("stamps the export filename with the generation date", () => {
    expect(exportFileName(new Date("2026-08-20T12:00:00Z"))).toBe(
      "shipping-savior-board-2026-08-20.xlsx"
    );
  });
});

/**
 * Parser tests for Blake's reefer-export workbook (AI-10777).
 *
 * The fixture is generated in-memory with exceljs and replicates the quirks
 * observed in the real october.xlsx / December.xlsx: two header rows, layout
 * differences between sheets (Week 43 drops "Type of service"), the
 * "Corssdock" typo, trailing header spaces, spacer rows between records,
 * TBD values, kg-with-commas vs tonnes weights, and string-format dates.
 */
import { describe, it, expect, beforeAll } from "vitest";
import ExcelJS from "exceljs";
import { parseWorkbook, parseWeightKg, parseBoardDate, parseCartons } from "./workbook";

async function buildFixture(): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();

  // Standard 22-col layout (like Week 41) with the real typo + trailing space.
  const w41 = wb.addWorksheet("Week 41");
  w41.addRow([
    "Type of service", "Customer", "Apt date request Corssdock", "Booking",
    "Port of Lading ", "Destination", "Commodity", "Orden", "Carrier", "Vessel",
    "Departure Date", "Pick up location (QTY)", "PU#", "PO#", "Reefer Cutoff",
    "Document cutoff", "ETA", "AES #", "CONT #", "SEAL #", "Weight", "CTNS",
  ]);
  w41.addRow(["", "", "Delivery @ Port", "", "", "", "", "Temperature C"]); // sub-header
  w41.addRow([
    "Full Service", "C", "KINGSCO DRAY", "USA142319", "Hueneme", "Puerto Quetzal",
    "Grapes", "0.0 Vents Closed", "Chiquita", "CHIQUITA PROGRESS 221S",
    new Date("2025-10-02T03:00:00Z"), "Sunview", "8559028", "4526",
    "09/29/2025 12:00", new Date("2025-09-29T15:00:00Z"), new Date("2025-10-08T11:00:00Z"),
    "X20250925038726", "TEMU9638861", "1056676", "14,738.76965", "1600 CTNS GRAPES / Uvas",
  ]);
  w41.addRow([]); // spacer
  w41.addRow([
    "Trucking", "J", "KINGSCO DRAY", "BN60586", "Hueneme", "Bolivar",
    "Grapes", "0.0 Vents Closed", "Del Monte", "Del Monte Valiant V40",
    "Sep 30 2025 16:00", "Kern Vineyards", "25-7550", "U57003EC",
    "Sep 30 2025 16:00", "Oct 1 2025 11:00", "TBD",
    "TBD", "TBD", "7803208", "TBD", "1500 CTNS GRAPES / Uvas",
  ]);
  w41.addRow([
    "Full Service", "H", "ANACAPA", "USA142822", "Hueneme", "Puerto Quetzal",
    "Pears", "0.0 Vents 20 CBM", "Chiquita", "CHIQUITA PROGRESS 221S",
    new Date("2025-10-02T03:00:00Z"), "Naumes Shipping", "41309", "4533",
    "09/29/2025 12:00", new Date("2025-09-29T15:00:00Z"), new Date("2025-10-08T11:00:00Z"),
    "X20250925040794", "SEGU9596395", "UL-5387636", "19.051", "980 CTNS Pears/ Peras",
  ]);

  // Week 43 variant layout: no "Type of service", Customer moved to col J.
  const w43 = wb.addWorksheet("Week 43");
  w43.addRow([
    "Apt date request Corssdock", "Booking", "Port of Lading", "Destination",
    "Commodity", "Orden", "Carrier", "Vessel", "Departure Date", "Customer",
    "Pick up location (QTY)", "PU#", "PO#", "Reefer Cutoff", "Document cutoff",
    "ETA", "AES #", "CONT #", "SEAL #", "Weight", "CTNS",
  ]);
  w43.addRow(["Delivery @ Port"]);
  w43.addRow([
    "ANACAPA", "BN61723", "Hueneme", "Caldera", "Apples", "-0.5 Vents Closed",
    "Chiquita", "CHIQUITA TRADER 314N", new Date("2025-10-23T03:00:00Z"), "K",
    "Naumes", "41410", "4601", "10/20/2025 12:00", new Date("2025-10-20T15:00:00Z"),
    new Date("2025-11-01T11:00:00Z"), "X20251020000001", "SEGU1111111", "S-1",
    "18200", "900 CTNS Apples / Manzanas",
  ]);

  // A non-week sheet without a Booking column should be skipped, not crash.
  const notes = wb.addWorksheet("Notes");
  notes.addRow(["Random", "Stuff"]);
  notes.addRow(["a", "b"]);

  return Buffer.from(await wb.xlsx.writeBuffer());
}

let result: Awaited<ReturnType<typeof parseWorkbook>>;
beforeAll(async () => {
  result = await parseWorkbook(await buildFixture(), "fixture.xlsx");
});

describe("parseWorkbook", () => {
  it("parses records from all weekly sheets and skips non-week sheets", () => {
    expect(result.sheetsParsed).toEqual(["Week 41", "Week 43"]);
    expect(result.sheetsSkipped).toEqual([{ sheet: "Notes", reason: "no Booking column in row 1" }]);
    expect(result.rows).toHaveLength(4);
  });

  it("maps the standard layout, including comma-formatted kg weight", () => {
    const r = result.rows.find((x) => x.reference === "USA142319")!;
    expect(r.pol).toBe("Hueneme");
    expect(r.pod).toBe("Puerto Quetzal");
    expect(r.cargoType).toBe("Grapes");
    expect(r.carrier).toBe("Chiquita");
    expect(r.containerNumber).toBe("TEMU9638861");
    expect(r.weightKg).toBe(14739); // "14,738.76965" → rounded kg
    expect(r.quantity).toBe(1600);
    expect(r.meta.temperature).toBe("0.0 Vents Closed");
    expect(r.meta.aesNumber).toBe("X20250925038726");
    expect(r.meta.customerCode).toBe("C");
    expect(r.reviewIssues).toEqual([]);
  });

  it("converts tonnes-style weights to kg", () => {
    const r = result.rows.find((x) => x.reference === "USA142822")!;
    expect(r.weightKg).toBe(19051); // "19.051" tonnes
    expect(r.quantity).toBe(980);
  });

  it("flags TBD container/AES/weight/ETA rows for review without dropping them", () => {
    const r = result.rows.find((x) => x.reference === "BN60586")!;
    expect(r.containerNumber).toBeNull();
    expect(r.weightKg).toBeNull();
    expect(r.eta).toBeNull();
    expect(r.etd).toBeInstanceOf(Date); // "Sep 30 2025 16:00" string parses
    expect(r.reviewIssues).toEqual(
      expect.arrayContaining([
        "missing container number",
        "missing AES filing number",
        "missing weight",
        "missing/unparseable ETA",
      ])
    );
  });

  it("handles the Week 43 variant layout (no service column, moved Customer)", () => {
    const r = result.rows.find((x) => x.reference === "BN61723")!;
    expect(r.meta.week).toBe("Week 43");
    expect(r.meta.typeOfService).toBeNull();
    expect(r.meta.customerCode).toBe("K");
    expect(r.pod).toBe("Caldera");
    expect(r.weightKg).toBe(18200); // plain kg stays kg
    expect(r.reviewIssues).toEqual([]);
  });
});

describe("field parsers", () => {
  it("parseWeightKg", () => {
    expect(parseWeightKg("14,738.76965")).toBe(14739);
    expect(parseWeightKg("14288")).toBe(14288);
    expect(parseWeightKg("14.515")).toBe(14515);
    expect(parseWeightKg("TBD")).toBeNull();
    expect(parseWeightKg(null)).toBeNull();
    expect(parseWeightKg("n/a")).toBeNull();
  });

  it("parseBoardDate", () => {
    expect(parseBoardDate(new Date("2025-10-08T11:00:00Z"))).toBeInstanceOf(Date);
    expect(parseBoardDate("09/29/2025 12:00")).toBeInstanceOf(Date);
    expect(parseBoardDate("Sep 30 2025 16:00")).toBeInstanceOf(Date);
    expect(parseBoardDate("TBD")).toBeNull();
    expect(parseBoardDate("")).toBeNull();
  });

  it("parseCartons", () => {
    expect(parseCartons("1490 CTNS GRAPES / Uvas")).toBe(1490);
    expect(parseCartons("980 CTNS Pears/ Peras")).toBe(980);
    expect(parseCartons("no digits")).toBeNull();
    expect(parseCartons(null)).toBeNull();
  });
});

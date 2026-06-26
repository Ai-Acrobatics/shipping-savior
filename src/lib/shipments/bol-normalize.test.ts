import { describe, it, expect } from "vitest";
import {
  cleanString,
  normalizeContainerNumber,
  coerceNumber,
  coerceWeightKg,
  coerceQuantity,
  parseBolDate,
  extractContainerNumbers,
  normalizeBolToShipments,
  type ExtractedBol,
} from "./bol-normalize";

const FULL_BOL: ExtractedBol = {
  container_numbers: ["MSCU1234567", "TGHU 765-4321"],
  vessel_name: "MSC OSCAR",
  voyage_number: "24W",
  port_of_loading: "Shanghai",
  port_of_discharge: "Long Beach",
  etd: "2026-05-01",
  eta: "2026-05-22",
  carrier: "MSC",
  shipper: "ACME CO",
  consignee: "BETA INC",
  notify_party: "BETA INC",
  goods_description: "Electronics",
  weight_kg: 18500,
  quantity: 240,
};

describe("cleanString", () => {
  it("trims and returns strings", () => {
    expect(cleanString("  hello  ")).toBe("hello");
  });
  it("stringifies numbers", () => {
    expect(cleanString(42)).toBe("42");
  });
  it("returns null for empty / whitespace", () => {
    expect(cleanString("   ")).toBeNull();
    expect(cleanString("")).toBeNull();
  });
  it("treats OCR null-ish sentinels as null", () => {
    expect(cleanString("null")).toBeNull();
    expect(cleanString("N/A")).toBeNull();
    expect(cleanString("Not Found")).toBeNull();
    expect(cleanString("---")).toBeNull();
  });
  it("returns null for non-stringable", () => {
    expect(cleanString({})).toBeNull();
    expect(cleanString(undefined)).toBeNull();
  });
});

describe("normalizeContainerNumber", () => {
  it("uppercases and strips spaces/hyphens", () => {
    expect(normalizeContainerNumber("tghu 765-4321")).toBe("TGHU7654321");
  });
  it("keeps a valid ISO 6346 number as-is", () => {
    expect(normalizeContainerNumber("MSCU1234567")).toBe("MSCU1234567");
  });
  it("drops values with no digits", () => {
    expect(normalizeContainerNumber("PENDING")).toBeNull();
  });
  it("drops too-short values", () => {
    expect(normalizeContainerNumber("AB12")).toBeNull();
  });
  it("returns null for empty", () => {
    expect(normalizeContainerNumber("")).toBeNull();
    expect(normalizeContainerNumber(null)).toBeNull();
  });
});

describe("coerceNumber", () => {
  it("passes finite numbers through", () => {
    expect(coerceNumber(12.5)).toBe(12.5);
  });
  it("parses numeric strings with separators / symbols", () => {
    expect(coerceNumber("18,500")).toBe(18500);
    expect(coerceNumber("$1200")).toBe(1200);
  });
  it("returns null for junk", () => {
    expect(coerceNumber("abc")).toBeNull();
    expect(coerceNumber(NaN)).toBeNull();
    expect(coerceNumber(null)).toBeNull();
  });
});

describe("coerceWeightKg / coerceQuantity", () => {
  it("rounds to integers", () => {
    expect(coerceWeightKg(18500.7)).toBe(18501);
    expect(coerceQuantity("240.2")).toBe(240);
  });
  it("clamps negatives to null", () => {
    expect(coerceWeightKg(-5)).toBeNull();
    expect(coerceQuantity(-1)).toBeNull();
  });
});

describe("parseBolDate", () => {
  it("parses ISO dates", () => {
    expect(parseBolDate("2026-05-01")?.getUTCFullYear()).toBe(2026);
  });
  it("returns null for unparseable", () => {
    expect(parseBolDate("not a date")).toBeNull();
    expect(parseBolDate(null)).toBeNull();
  });
  it("rejects absurd years (OCR misreads)", () => {
    expect(parseBolDate("1880-01-01")).toBeNull();
  });
});

describe("extractContainerNumbers", () => {
  it("normalizes + de-dupes an array", () => {
    expect(
      extractContainerNumbers({ container_numbers: ["MSCU1234567", "mscu1234567", "TGHU 7654321"] })
    ).toEqual(["MSCU1234567", "TGHU7654321"]);
  });
  it("splits a single delimited string", () => {
    expect(
      extractContainerNumbers({ container_numbers: "MSCU1234567, TGHU7654321" })
    ).toEqual(["MSCU1234567", "TGHU7654321"]);
  });
  it("returns [] when missing", () => {
    expect(extractContainerNumbers({})).toEqual([]);
    expect(extractContainerNumbers({ container_numbers: null })).toEqual([]);
  });
});

describe("normalizeBolToShipments", () => {
  it("creates one shipment per container number", () => {
    const rows = normalizeBolToShipments(FULL_BOL, {
      orgId: "org-1",
      bolDocumentId: "bol-1",
      rawBolText: "raw",
    });
    expect(rows).toHaveLength(2);
    expect(rows.map((r) => r.containerNumber)).toEqual(["MSCU1234567", "TGHU7654321"]);
  });

  it("shares vessel/route/party data across every container row", () => {
    const rows = normalizeBolToShipments(FULL_BOL, { orgId: "org-1" });
    for (const r of rows) {
      expect(r.vesselName).toBe("MSC OSCAR");
      expect(r.carrier).toBe("MSC");
      expect(r.pol).toBe("Shanghai");
      expect(r.pod).toBe("Long Beach");
      expect(r.originPort).toBe("Shanghai");
      expect(r.destPort).toBe("Long Beach");
      expect(r.source).toBe("bol_ocr");
      expect(r.status).toBe("in_transit");
      expect(r.weightKg).toBe(18500);
      expect(r.quantity).toBe(240);
      expect(r.containerCount).toBe(2);
      expect(r.orgId).toBe("org-1");
      expect(r.etd).toBeInstanceOf(Date);
      expect(r.eta).toBeInstanceOf(Date);
    }
  });

  it("yields a single null-container row when no containers are readable", () => {
    const rows = normalizeBolToShipments({
      ...FULL_BOL,
      container_numbers: [],
    });
    expect(rows).toHaveLength(1);
    expect(rows[0].containerNumber).toBeNull();
    expect(rows[0].vesselName).toBe("MSC OSCAR");
    expect(rows[0].containerCount).toBeNull();
  });

  it("handles null/undefined extracted blob defensively", () => {
    const rows = normalizeBolToShipments(null);
    expect(rows).toHaveLength(1);
    expect(rows[0].containerNumber).toBeNull();
    expect(rows[0].source).toBe("bol_ocr");
  });

  it("links the originating bol document id", () => {
    const rows = normalizeBolToShipments(FULL_BOL, { bolDocumentId: "bol-xyz" });
    expect(rows.every((r) => r.bolDocumentId === "bol-xyz")).toBe(true);
  });
});

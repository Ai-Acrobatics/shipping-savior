/**
 * Unit tests for the multi-document trade OCR layer (AI-12016).
 *
 * Pure functions only — no model call, no DB. The model's output is fed in as
 * a JSON string exactly as `extractWithFallback` would return it.
 *
 * The timing rules get the most coverage because they are the ones that
 * actually stop cargo: ISF's 24-hour pre-lading deadline and FDA Prior
 * Notice's mode-dependent window are both "miss it and the shipment is
 * refused", and both are arithmetic we can pin exactly.
 */
import { describe, it, expect } from "vitest";
import {
  processExtraction,
  parseModelPayload,
  DocumentParseError,
  validateDocument,
  reconcileDocumentSet,
  requiredDocuments,
  classifyDocumentText,
  resolveDocumentType,
  normalizeExtraction,
  buildExtractionPrompt,
  buildAutoExtractionPrompt,
  coerceNumber,
  coerceDate,
  coerceDateTime,
  coerceStringArray,
  cleanString,
  DOCUMENT_TYPES,
  DOCUMENT_SPECS,
  ISF_LEAD_HOURS,
  FDA_LEAD_HOURS_BY_MODE,
  FDA_MAX_LEAD_DAYS,
  type DocumentExtraction,
} from "./index";

const NOW = new Date("2026-06-15T12:00:00Z");

function extraction(
  type: DocumentExtraction["type"],
  fields: Record<string, unknown>
): DocumentExtraction {
  const confidence: Record<string, number> = {};
  for (const key of Object.keys(fields)) confidence[key] = 0.95;
  return { type, fields, confidence };
}

// ─────────────────────────────────────────────────────────
// Registry
// ─────────────────────────────────────────────────────────

describe("document registry", () => {
  it("covers the six documents the issue names plus the existing BOL", () => {
    expect(DOCUMENT_TYPES.sort()).toEqual(
      [
        "bill_of_lading",
        "certificate_of_origin",
        "commercial_invoice",
        "fda_prior_notice",
        "isf",
        "packing_list",
        "phytosanitary_certificate",
      ].sort()
    );
  });

  it("gives every type at least one required field and a regulatory authority", () => {
    for (const type of DOCUMENT_TYPES) {
      const spec = DOCUMENT_SPECS[type];
      expect(spec.fields.some((f) => f.required), `${type} has no required field`).toBe(true);
      expect(spec.authority.length, `${type} has no authority`).toBeGreaterThan(0);
      expect(spec.signals.length, `${type} has no classifier signals`).toBeGreaterThan(0);
    }
  });

  it("uses unique field keys within each document type", () => {
    for (const type of DOCUMENT_TYPES) {
      const keys = DOCUMENT_SPECS[type].fields.map((f) => f.key);
      expect(new Set(keys).size, `${type} has duplicate field keys`).toBe(keys.length);
    }
  });
});

// ─────────────────────────────────────────────────────────
// Prompts
// ─────────────────────────────────────────────────────────

describe("prompt construction", () => {
  it("derives the field list from the registry so prompts cannot drift", () => {
    const prompt = buildExtractionPrompt("phytosanitary_certificate");
    for (const field of DOCUMENT_SPECS.phytosanitary_certificate.fields) {
      expect(prompt).toContain(field.key);
    }
    expect(prompt).toMatch(/REQUIRED/);
  });

  it("tells the model never to invent an identifier", () => {
    expect(buildExtractionPrompt("fda_prior_notice")).toMatch(/Never invent a/i);
    expect(buildAutoExtractionPrompt()).toMatch(/Never invent a/i);
  });

  it("lists every document type in the auto prompt", () => {
    const prompt = buildAutoExtractionPrompt();
    for (const type of DOCUMENT_TYPES) expect(prompt).toContain(type);
  });
});

// ─────────────────────────────────────────────────────────
// Classification
// ─────────────────────────────────────────────────────────

describe("text classification", () => {
  it("identifies a phytosanitary certificate from its distinctive language", () => {
    const result = classifyDocumentText(
      "PHYTOSANITARY CERTIFICATE. National Plant Protection Organization of Peru. " +
        "Botanical name: Vitis vinifera. Additional declaration: free from quarantine pests."
    );
    expect(result.type).toBe("phytosanitary_certificate");
    expect(result.confidence).toBeGreaterThan(0.5);
    expect(result.ambiguous).toBe(false);
  });

  it("identifies an ISF from the 10+2 vocabulary", () => {
    const result = classifyDocumentText(
      "IMPORTER SECURITY FILING 10+2. ISF transaction number: ISF12345678. " +
        "Container stuffing location: Ningbo CFS. Consolidator: ABC Logistics."
    );
    expect(result.type).toBe("isf");
  });

  it("does not confuse FDA prior notice with a phytosanitary certificate", () => {
    const result = classifyDocumentText(
      "PRIOR NOTICE CONFIRMATION. Food and Drug Administration. " +
        "PN Confirmation Number: 1234567890. FDA product code: 20ABC01."
    );
    expect(result.type).toBe("fda_prior_notice");
  });

  it("returns a null type with zero confidence when nothing matches", () => {
    const result = classifyDocumentText("Dear supplier, thanks for the samples.");
    expect(result.type).toBeNull();
    expect(result.confidence).toBe(0);
  });

  it("honours an explicit request over both the model and the text", () => {
    const resolved = resolveDocumentType({
      requested: "packing_list",
      modelClaim: "commercial_invoice",
      rawText: "COMMERCIAL INVOICE invoice no unit price incoterm",
    });
    expect(resolved.type).toBe("packing_list");
    expect(resolved.source).toBe("requested");
  });

  it("flags a conflict when the model and the text disagree confidently", () => {
    const resolved = resolveDocumentType({
      requested: "auto",
      modelClaim: "commercial_invoice",
      rawText:
        "PHYTOSANITARY CERTIFICATE. National Plant Protection Organization. " +
        "Botanical name. Additional declaration. Free from quarantine pests. Disinfestation. NPPO.",
    });
    expect(resolved.type).toBe("commercial_invoice"); // model still wins
    expect(resolved.conflict).toEqual({
      modelClaim: "commercial_invoice",
      textClaim: "phytosanitary_certificate",
    });
  });

  it("falls back to the text classifier when the model names nothing usable", () => {
    const resolved = resolveDocumentType({
      requested: "auto",
      modelClaim: "not_a_real_type",
      rawText: "PACKING LIST carton no marks and numbers net weight cbm",
    });
    expect(resolved.type).toBe("packing_list");
    expect(resolved.source).toBe("text");
  });
});

// ─────────────────────────────────────────────────────────
// Coercion
// ─────────────────────────────────────────────────────────

describe("value coercion", () => {
  it("treats OCR placeholder text as absent", () => {
    for (const placeholder of ["N/A", "n/a", "none", "unknown", "NOT FOUND", "---", "null"]) {
      expect(cleanString(placeholder), placeholder).toBeNull();
    }
  });

  it("strips currency and thousands separators from numbers", () => {
    expect(coerceNumber("$18,500.50")).toBe(18500.5);
    expect(coerceNumber("18 500 KG")).toBe(18500);
  });

  it("refuses hedged figures rather than inventing a customs value", () => {
    expect(coerceNumber("approximately 18000")).toBeNull();
    expect(coerceNumber("~18000")).toBeNull();
  });

  it("rejects impossible calendar dates instead of silently rolling them over", () => {
    expect(coerceDate("2026-02-31")).toBeNull();
    expect(coerceDate("2026-02-28")).toBe("2026-02-28");
  });

  it("anchors a bare date to midnight UTC so timing rules can compare it", () => {
    expect(coerceDateTime("2026-05-01")).toBe("2026-05-01T00:00:00.000Z");
  });

  it("splits a delimited string into an array", () => {
    expect(coerceStringArray("8501.10.40; 3926.90.99")).toEqual(["8501.10.40", "3926.90.99"]);
  });

  it("normalizes container numbers and drops unusable ones", () => {
    const { fields } = normalizeExtraction(
      "bill_of_lading",
      { container_numbers: ["mscu 123-4567", "??", "TGHU7654321"] },
      {}
    );
    expect(fields.container_numbers).toEqual(["MSCU1234567", "TGHU7654321"]);
  });

  it("drops keys the document type does not declare", () => {
    const { fields } = normalizeExtraction(
      "packing_list",
      { package_count: 240, nonsense_key: "ignore me" },
      {}
    );
    expect(fields.package_count).toBe(240);
    expect(fields).not.toHaveProperty("nonsense_key");
  });

  it("zeroes the confidence of a value the coercion layer rejected", () => {
    const { fields, confidence } = normalizeExtraction(
      "commercial_invoice",
      { total_value: "approximately 40000" },
      { total_value: 0.95 }
    );
    expect(fields.total_value).toBeNull();
    expect(confidence.total_value).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────
// ISF timing
// ─────────────────────────────────────────────────────────

describe("ISF validation", () => {
  const base = {
    isf_transaction_number: "ISF987654321",
    importer_of_record_number: "12-3456789",
    consignee_number: "12-3456789",
    seller: "Ningbo Widgets Co",
    buyer: "US Importer LLC",
    manufacturer: "Ningbo Widgets Co",
    ship_to_party: "US Importer LLC, Long Beach CA",
    country_of_origin: "China",
    hts_codes: ["8501.10.40"],
    container_stuffing_location: "Ningbo CFS",
    consolidator: "ABC Logistics",
  };

  it("passes a filing made more than 24 hours before lading", () => {
    const result = validateDocument(
      extraction("isf", {
        ...base,
        filing_datetime: "2026-05-01T00:00:00Z",
        lading_datetime: "2026-05-03T00:00:00Z",
      }),
      { now: NOW }
    );
    expect(result.valid).toBe(true);
    expect(result.issues.filter((i) => i.severity === "blocker")).toHaveLength(0);
  });

  it("blocks a filing inside the 24-hour window and says how short it is", () => {
    const result = validateDocument(
      extraction("isf", {
        ...base,
        filing_datetime: "2026-05-02T18:00:00Z",
        lading_datetime: "2026-05-03T00:00:00Z", // 6 hours
      }),
      { now: NOW }
    );
    expect(result.valid).toBe(false);
    const issue = result.issues.find((i) => i.code === "isf.filed_late");
    expect(issue?.severity).toBe("blocker");
    expect(issue?.message).toMatch(/6.0 hours before lading/);
    expect(issue?.message).toMatch(new RegExp(`at least ${ISF_LEAD_HOURS} hours`));
  });

  it("blocks a filing made after lading and names the liquidated damages exposure", () => {
    const result = validateDocument(
      extraction("isf", {
        ...base,
        filing_datetime: "2026-05-04T00:00:00Z",
        lading_datetime: "2026-05-03T00:00:00Z",
      }),
      { now: NOW }
    );
    const issue = result.issues.find((i) => i.code === "isf.filed_after_lading");
    expect(issue?.severity).toBe("blocker");
    expect(issue?.message).toMatch(/\$5,000/);
  });

  it("warns when an HTS number is below the 6 digits ISF requires", () => {
    const result = validateDocument(
      extraction("isf", {
        ...base,
        hts_codes: ["8501"],
        filing_datetime: "2026-05-01T00:00:00Z",
        lading_datetime: "2026-05-03T00:00:00Z",
      }),
      { now: NOW }
    );
    expect(result.issues.find((i) => i.code === "isf.hts_below_six_digits")?.severity).toBe(
      "warning"
    );
  });

  it("blocks on any missing 10+2 element", () => {
    const { consolidator, ...withoutConsolidator } = base;
    const result = validateDocument(
      extraction("isf", {
        ...withoutConsolidator,
        filing_datetime: "2026-05-01T00:00:00Z",
        lading_datetime: "2026-05-03T00:00:00Z",
      }),
      { now: NOW }
    );
    expect(result.valid).toBe(false);
    expect(result.missingRequired).toContain("consolidator");
    expect(result.completeness).toBeLessThan(1);
  });
});

// ─────────────────────────────────────────────────────────
// FDA Prior Notice timing
// ─────────────────────────────────────────────────────────

describe("FDA Prior Notice validation", () => {
  const base = {
    confirmation_number: "PN20260501123456",
    port_of_arrival: "Long Beach, CA",
    fda_product_code: "20ABC01",
    product_description: "Fresh table grapes",
    manufacturer: "Andes Fruit SA",
    manufacturer_registration_number: "12345678901",
    country_of_production: "Peru",
    country_of_shipment: "Peru",
  };

  it("passes ocean cargo filed more than 8 hours out", () => {
    const result = validateDocument(
      extraction("fda_prior_notice", {
        ...base,
        mode_of_transport: "water",
        submission_datetime: "2026-05-01T00:00:00Z",
        arrival_datetime: "2026-05-01T12:00:00Z",
      }),
      { now: NOW }
    );
    expect(result.valid).toBe(true);
  });

  it("blocks ocean cargo filed inside the 8-hour water window", () => {
    const result = validateDocument(
      extraction("fda_prior_notice", {
        ...base,
        mode_of_transport: "water",
        submission_datetime: "2026-05-01T08:00:00Z",
        arrival_datetime: "2026-05-01T12:00:00Z", // 4 hours
      }),
      { now: NOW }
    );
    const issue = result.issues.find((i) => i.code === "fda.prior_notice_late");
    expect(issue?.severity).toBe("blocker");
    expect(issue?.message).toMatch(/at least 8 hours/);
    expect(issue?.message).toMatch(/refusable/);
  });

  it("accepts the same 4-hour lead time when the mode is air", () => {
    const result = validateDocument(
      extraction("fda_prior_notice", {
        ...base,
        mode_of_transport: "air",
        submission_datetime: "2026-05-01T08:00:00Z",
        arrival_datetime: "2026-05-01T12:00:00Z",
      }),
      { now: NOW }
    );
    expect(result.valid).toBe(true);
  });

  it("applies the 2-hour road window", () => {
    expect(FDA_LEAD_HOURS_BY_MODE.road).toBe(2);
    const result = validateDocument(
      extraction("fda_prior_notice", {
        ...base,
        mode_of_transport: "road",
        submission_datetime: "2026-05-01T11:00:00Z",
        arrival_datetime: "2026-05-01T12:00:00Z", // 1 hour
      }),
      { now: NOW }
    );
    expect(result.issues.find((i) => i.code === "fda.prior_notice_late")).toBeDefined();
  });

  it("blocks a notice submitted after the article arrived", () => {
    const result = validateDocument(
      extraction("fda_prior_notice", {
        ...base,
        mode_of_transport: "water",
        submission_datetime: "2026-05-02T00:00:00Z",
        arrival_datetime: "2026-05-01T12:00:00Z",
      }),
      { now: NOW }
    );
    expect(result.issues.find((i) => i.code === "fda.submitted_after_arrival")?.severity).toBe(
      "blocker"
    );
  });

  it(`blocks a notice filed more than ${FDA_MAX_LEAD_DAYS} days ahead`, () => {
    const result = validateDocument(
      extraction("fda_prior_notice", {
        ...base,
        mode_of_transport: "water",
        submission_datetime: "2026-04-01T00:00:00Z",
        arrival_datetime: "2026-05-01T00:00:00Z", // 30 days
      }),
      { now: NOW }
    );
    const issue = result.issues.find((i) => i.code === "fda.submitted_too_early");
    expect(issue?.severity).toBe("blocker");
    expect(issue?.message).toMatch(/resubmitted/);
  });

  it("warns rather than passing silently when the mode is unreadable", () => {
    const result = validateDocument(
      extraction("fda_prior_notice", {
        ...base,
        mode_of_transport: "barge-ish",
        submission_datetime: "2026-05-01T00:00:00Z",
        arrival_datetime: "2026-05-01T12:00:00Z",
      }),
      { now: NOW }
    );
    expect(result.issues.find((i) => i.code === "fda.mode_unrecognised")?.severity).toBe(
      "warning"
    );
  });

  it("warns on a registration number that is not an 11-digit facility number", () => {
    const result = validateDocument(
      extraction("fda_prior_notice", {
        ...base,
        manufacturer_registration_number: "ABC-1",
        mode_of_transport: "water",
        submission_datetime: "2026-05-01T00:00:00Z",
        arrival_datetime: "2026-05-01T12:00:00Z",
      }),
      { now: NOW }
    );
    expect(result.issues.find((i) => i.code === "fda.registration_format")).toBeDefined();
  });
});

// ─────────────────────────────────────────────────────────
// Phytosanitary
// ─────────────────────────────────────────────────────────

describe("phytosanitary certificate validation", () => {
  const base = {
    certificate_number: "PE-2026-004512",
    issuing_nppo: "SENASA Peru",
    country_of_origin: "Peru",
    country_of_destination: "United States",
    exporter: "Andes Fruit SA",
    consignee: "US Produce LLC",
    botanical_name: "Vitis vinifera",
    commodity_description: "Fresh table grapes, 4,800 cartons",
    additional_declaration: "Free from Drosophila suzukii per USDA APHIS requirements.",
  };

  it("passes a certificate issued shortly before departure", () => {
    const result = validateDocument(
      extraction("phytosanitary_certificate", {
        ...base,
        issue_date: "2026-05-01",
        departure_date: "2026-05-04",
      }),
      { now: NOW }
    );
    expect(result.valid).toBe(true);
  });

  it("blocks a certificate issued after the consignment departed", () => {
    const result = validateDocument(
      extraction("phytosanitary_certificate", {
        ...base,
        issue_date: "2026-05-10",
        departure_date: "2026-05-04",
      }),
      { now: NOW }
    );
    expect(result.valid).toBe(false);
    expect(
      result.issues.find((i) => i.code === "phyto.issued_after_departure")?.severity
    ).toBe("blocker");
  });

  it("blocks a certificate dated in the future", () => {
    const result = validateDocument(
      extraction("phytosanitary_certificate", { ...base, issue_date: "2026-09-01" }),
      { now: NOW }
    );
    expect(result.issues.find((i) => i.code === "phyto.issued_in_future")?.severity).toBe(
      "blocker"
    );
  });

  it("warns — not blocks — on a stale issue date, because the limit varies by NPPO", () => {
    const result = validateDocument(
      extraction("phytosanitary_certificate", {
        ...base,
        issue_date: "2026-04-01",
        departure_date: "2026-05-04",
      }),
      { now: NOW }
    );
    const issue = result.issues.find((i) => i.code === "phyto.issue_window_exceeded");
    expect(issue?.severity).toBe("warning");
    expect(issue?.message).toMatch(/confirm the destination's limit/i);
    expect(result.valid).toBe(true);
  });

  it("warns when treatment is dated after certification", () => {
    const result = validateDocument(
      extraction("phytosanitary_certificate", {
        ...base,
        issue_date: "2026-05-01",
        treatment_date: "2026-05-03",
      }),
      { now: NOW }
    );
    expect(result.issues.find((i) => i.code === "phyto.treatment_after_issue")?.severity).toBe(
      "warning"
    );
  });

  it("blocks when the botanical name is missing", () => {
    const { botanical_name, ...withoutBotanical } = base;
    const result = validateDocument(
      extraction("phytosanitary_certificate", { ...withoutBotanical, issue_date: "2026-05-01" }),
      { now: NOW }
    );
    expect(result.valid).toBe(false);
    expect(result.missingRequired).toContain("botanical_name");
  });

  it("notes a missing additional declaration without blocking", () => {
    const { additional_declaration, ...withoutAd } = base;
    const result = validateDocument(
      extraction("phytosanitary_certificate", { ...withoutAd, issue_date: "2026-05-01" }),
      { now: NOW }
    );
    expect(result.valid).toBe(true);
    expect(result.issues.find((i) => i.code === "phyto.no_additional_declaration")?.severity).toBe(
      "info"
    );
  });
});

// ─────────────────────────────────────────────────────────
// Invoice / packing list / COO
// ─────────────────────────────────────────────────────────

describe("commercial invoice validation", () => {
  const base = {
    invoice_number: "INV-2026-0088",
    invoice_date: "2026-05-01",
    seller: "Ningbo Widgets Co",
    buyer: "US Importer LLC",
    currency: "USD",
    total_value: 84_500,
    incoterm: "FOB",
    incoterm_place: "Ningbo",
    country_of_origin: "China",
    hts_codes: ["8501.10.40"],
  };

  it("passes a complete invoice", () => {
    expect(validateDocument(extraction("commercial_invoice", base), { now: NOW }).valid).toBe(true);
  });

  it("blocks a zero or negative customs value", () => {
    const result = validateDocument(
      extraction("commercial_invoice", { ...base, total_value: 0 }),
      { now: NOW }
    );
    expect(result.issues.find((i) => i.code === "invoice.non_positive_value")?.severity).toBe(
      "blocker"
    );
  });

  it("warns on a non-ISO currency and an unrecognised incoterm", () => {
    const result = validateDocument(
      extraction("commercial_invoice", { ...base, currency: "dollars", incoterm: "FOBB" }),
      { now: NOW }
    );
    expect(result.issues.find((i) => i.code === "invoice.currency_format")).toBeDefined();
    expect(result.issues.find((i) => i.code === "invoice.incoterm_unrecognised")).toBeDefined();
  });

  it("notes an incoterm with no named place", () => {
    const { incoterm_place, ...withoutPlace } = base;
    const result = validateDocument(
      extraction("commercial_invoice", withoutPlace),
      { now: NOW }
    );
    expect(result.issues.find((i) => i.code === "invoice.incoterm_place_missing")?.severity).toBe(
      "info"
    );
  });
});

describe("packing list validation", () => {
  const base = {
    invoice_number: "INV-2026-0088",
    shipper: "Ningbo Widgets Co",
    consignee: "US Importer LLC",
    package_count: 240,
    net_weight_kg: 16_800,
    gross_weight_kg: 18_500,
  };

  it("blocks a net weight greater than the gross weight", () => {
    const result = validateDocument(
      extraction("packing_list", { ...base, net_weight_kg: 19_000 }),
      { now: NOW }
    );
    const issue = result.issues.find((i) => i.code === "packing.net_exceeds_gross");
    expect(issue?.severity).toBe("blocker");
    expect(issue?.message).toMatch(/physically impossible/);
  });

  it("blocks a zero package count", () => {
    const result = validateDocument(
      extraction("packing_list", { ...base, package_count: 0 }),
      { now: NOW }
    );
    expect(result.issues.find((i) => i.code === "packing.no_packages")?.severity).toBe("blocker");
  });
});

describe("certificate of origin validation", () => {
  const base = {
    issue_date: "2026-05-01",
    exporter: "Ningbo Widgets Co",
    importer: "US Importer LLC",
    country_of_origin: "Mexico",
    signatory: "J. Alvarez",
  };

  it("blocks an expired blanket period", () => {
    const result = validateDocument(
      extraction("certificate_of_origin", {
        ...base,
        issue_date: "2026-01-01",
        blanket_period_end: "2026-01-31",
      }),
      { now: NOW }
    );
    expect(result.issues.find((i) => i.code === "coo.blanket_period_expired")?.severity).toBe(
      "blocker"
    );
  });

  it("blocks a blanket period that ends before it was issued", () => {
    const result = validateDocument(
      extraction("certificate_of_origin", {
        ...base,
        issue_date: "2026-08-01",
        blanket_period_end: "2026-07-01",
      }),
      { now: NOW }
    );
    expect(result.issues.find((i) => i.code === "coo.blanket_period_inverted")).toBeDefined();
  });

  it("warns when a USMCA claim omits the origin criterion", () => {
    const result = validateDocument(
      extraction("certificate_of_origin", { ...base, trade_agreement: "USMCA" }),
      { now: NOW }
    );
    expect(result.issues.find((i) => i.code === "coo.usmca_missing_criterion")?.severity).toBe(
      "warning"
    );
  });
});

// ─────────────────────────────────────────────────────────
// Low confidence
// ─────────────────────────────────────────────────────────

describe("confidence handling", () => {
  it("surfaces a populated but low-confidence required field as a warning", () => {
    const result = validateDocument(
      {
        type: "packing_list",
        fields: {
          invoice_number: "INV-1",
          shipper: "A Co",
          consignee: "B Co",
          package_count: 240,
          net_weight_kg: 16_800,
          gross_weight_kg: 18_500,
        },
        confidence: { gross_weight_kg: 0.35 },
      },
      { now: NOW }
    );
    expect(result.lowConfidenceFields).toContain("gross_weight_kg");
    const issue = result.issues.find((i) => i.code === "field.low_confidence");
    expect(issue?.severity).toBe("warning");
    expect(issue?.message).toMatch(/35% confidence/);
  });

  it("does not flag a field that is simply absent as low confidence", () => {
    const result = validateDocument(
      { type: "packing_list", fields: { package_count: 240 }, confidence: {} },
      { now: NOW }
    );
    expect(result.lowConfidenceFields).toHaveLength(0);
  });
});

// ─────────────────────────────────────────────────────────
// Reconciliation
// ─────────────────────────────────────────────────────────

describe("cross-document reconciliation", () => {
  const invoice = extraction("commercial_invoice", {
    invoice_number: "INV-2026-0088",
    buyer: "US Importer LLC",
    seller: "Ningbo Widgets Co.",
    total_value: 84_500,
    total_quantity: 4_800,
    country_of_origin: "China",
    gross_weight_kg: 18_500,
  });

  const packing = extraction("packing_list", {
    invoice_number: "INV-2026-0088",
    consignee: "US Importer, LLC",
    shipper: "Ningbo Widgets Company",
    package_count: 240,
    total_quantity: 4_800,
    gross_weight_kg: 18_480,
    net_weight_kg: 16_800,
  });

  const bol = extraction("bill_of_lading", {
    bl_number: "MAEU123456789",
    consignee: "US Importer LLC",
    shipper: "Ningbo Widgets Co",
    package_count: 240,
    gross_weight_kg: 18_500,
    container_numbers: ["MSCU1234567"],
  });

  it("clears a consistent document set", () => {
    const report = reconcileDocumentSet([invoice, packing, bol]);
    expect(report.findings.filter((f) => f.severity === "blocker")).toHaveLength(0);
    expect(report.clearedToFile).toBe(true);
  });

  it("tolerates entity-suffix and punctuation drift in party names", () => {
    const report = reconcileDocumentSet([invoice, packing, bol]);
    expect(report.findings.find((f) => f.code === "reconcile.consignee_mismatch")).toBeUndefined();
    expect(report.findings.find((f) => f.code === "reconcile.shipper_mismatch")).toBeUndefined();
  });

  it("tolerates a sub-2% gross weight difference but reports a larger one", () => {
    const clean = reconcileDocumentSet([invoice, packing]);
    expect(clean.findings.find((f) => f.code === "reconcile.gross_weight_mismatch")).toBeUndefined();

    const heavy = extraction("packing_list", { ...packing.fields, gross_weight_kg: 21_000 });
    const drifted = reconcileDocumentSet([invoice, heavy]);
    expect(
      drifted.findings.find((f) => f.code === "reconcile.gross_weight_mismatch")?.severity
    ).toBe("warning");
  });

  it("blocks on any package-count difference — that number goes on the entry", () => {
    const short = extraction("packing_list", { ...packing.fields, package_count: 238 });
    const report = reconcileDocumentSet([short, bol]);
    const finding = report.findings.find((f) => f.code === "reconcile.package_count_mismatch");
    expect(finding?.severity).toBe("blocker");
    expect(finding?.values.map((v) => v.value).sort()).toEqual(["238", "240"]);
    expect(report.clearedToFile).toBe(false);
  });

  it("blocks on a country-of-origin disagreement", () => {
    const isf = extraction("isf", { country_of_origin: "Vietnam" });
    const report = reconcileDocumentSet([invoice, isf]);
    expect(report.findings.find((f) => f.code === "reconcile.origin_mismatch")?.severity).toBe(
      "blocker"
    );
  });

  it("reports the union of container numbers when they disagree", () => {
    const otherBox = extraction("packing_list", {
      ...packing.fields,
      container_numbers: ["TGHU7654321"],
    });
    const report = reconcileDocumentSet([bol, otherBox]);
    const finding = report.findings.find((f) => f.code === "reconcile.container_mismatch");
    expect(finding).toBeDefined();
    expect(finding?.message).toContain("MSCU1234567");
    expect(finding?.message).toContain("TGHU7654321");
  });

  it("stays quiet when only one document carries a field", () => {
    const report = reconcileDocumentSet([invoice]);
    expect(report.findings).toHaveLength(0);
  });

  it("names the documents a produce shipment is missing", () => {
    const report = reconcileDocumentSet([invoice, packing, bol], {
      oceanImportToUs: true,
      containsPlantProduct: true,
      containsFdaRegulatedProduct: true,
    });
    expect(report.missingDocuments).toContain("phytosanitary_certificate");
    expect(report.missingDocuments).toContain("fda_prior_notice");
    expect(report.missingDocuments).toContain("isf");
    expect(report.clearedToFile).toBe(false);
  });

  it("requires only invoice and packing list for a bare shipment", () => {
    expect(requiredDocuments({}).sort()).toEqual(["commercial_invoice", "packing_list"]);
  });

  it("adds the certificate of origin only when preference is claimed", () => {
    expect(requiredDocuments({ claimsPreferentialOrigin: true })).toContain(
      "certificate_of_origin"
    );
    expect(requiredDocuments({})).not.toContain("certificate_of_origin");
  });
});

// ─────────────────────────────────────────────────────────
// End-to-end from a model payload
// ─────────────────────────────────────────────────────────

describe("processExtraction", () => {
  const payload = JSON.stringify({
    document_type: "fda_prior_notice",
    extracted: {
      confirmation_number: "PN20260501123456",
      submission_datetime: "2026-05-01T08:00:00Z",
      arrival_datetime: "2026-05-01T12:00:00Z",
      mode_of_transport: "water",
      port_of_arrival: "Long Beach, CA",
      fda_product_code: "20ABC01",
      product_description: "Fresh table grapes",
      manufacturer: "Andes Fruit SA",
      manufacturer_registration_number: "12345678901",
      country_of_production: "Peru",
      country_of_shipment: "Peru",
    },
    confidence: {
      confirmation_number: 0.97,
      submission_datetime: 0.93,
      arrival_datetime: 0.93,
      mode_of_transport: 0.99,
    },
  });

  it("parses, normalizes and validates in one pass", () => {
    const result = processExtraction({ rawText: payload, now: NOW });
    expect(result.extraction.type).toBe("fda_prior_notice");
    expect(result.validation.valid).toBe(false);
    expect(result.validation.issues.find((i) => i.code === "fda.prior_notice_late")).toBeDefined();
  });

  it("tolerates markdown fences around the JSON", () => {
    const fenced = "```json\n" + payload + "\n```";
    expect(processExtraction({ rawText: fenced, now: NOW }).extraction.type).toBe(
      "fda_prior_notice"
    );
  });

  it("throws rather than half-parsing malformed JSON", () => {
    expect(() => processExtraction({ rawText: "{not json", now: NOW })).toThrow(
      DocumentParseError
    );
    expect(() => parseModelPayload("")).toThrow(/empty response/i);
    expect(() => parseModelPayload("[1,2,3]")).toThrow(/not a JSON object/i);
  });

  it("throws when the type cannot be determined at all", () => {
    const anonymous = JSON.stringify({ extracted: { foo: "bar" } });
    expect(() => processExtraction({ rawText: anonymous, now: NOW })).toThrow(
      /Could not determine which trade document/i
    );
  });

  it("lets an explicit request override the model's claim", () => {
    const result = processExtraction({
      rawText: payload,
      requestedType: "commercial_invoice",
      now: NOW,
    });
    expect(result.extraction.type).toBe("commercial_invoice");
    expect(result.typeSource).toBe("requested");
    // The FDA fields are not part of an invoice, so they are dropped and the
    // invoice's own required fields come back missing.
    expect(result.validation.missingRequired).toContain("invoice_number");
  });
});

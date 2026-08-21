// ============================================================
// Multi-document trade OCR — cross-document reconciliation (AI-12016)
//
// Each document can be individually valid and the set still be wrong. The
// invoice says 240 cartons, the packing list says 238, the BOL says 240 — one
// of those is the number CBP will see, and the discrepancy surfaces as an exam
// hold rather than a correction.
//
// This module compares the fields that appear on more than one document and
// reports where they disagree, plus which documents the cargo profile requires
// and the set does not contain.
// ============================================================

import type {
  DocumentExtraction,
  ReconciliationFinding,
  ReconciliationReport,
  ShipmentProfile,
  TradeDocumentType,
} from "./types";

/** Weights are rounded and re-typed by hand across documents; 2% is noise. */
export const WEIGHT_TOLERANCE_PCT = 2;
/** Invoice totals across documents should agree to the cent, but FX rounding happens. */
export const VALUE_TOLERANCE_PCT = 1;

interface FieldObservation {
  type: TradeDocumentType;
  value: unknown;
}

function observe(
  documents: DocumentExtraction[],
  key: string
): FieldObservation[] {
  return documents
    .map((doc) => ({ type: doc.type, value: doc.fields?.[key] }))
    .filter((o) => o.value !== null && o.value !== undefined && o.value !== "");
}

function normalizeParty(value: unknown): string | null {
  if (typeof value !== "string") return null;
  // Party names are re-typed per document: punctuation, entity suffixes and
  // address tails all vary. Compare on the alphanumeric core of the name.
  const core = value
    .toLowerCase()
    .replace(
      /\b(co|company|inc|incorporated|ltd|limited|llc|corp|corporation|gmbh|bv|sa|srl|pte|pty)\b\.?/g,
      ""
    )
    .replace(/[^a-z0-9]/g, "");
  return core.length >= 3 ? core : null;
}

function pctDiff(a: number, b: number): number {
  const denominator = Math.max(Math.abs(a), Math.abs(b));
  if (denominator === 0) return 0;
  return (Math.abs(a - b) / denominator) * 100;
}

function numericFinding(args: {
  observations: FieldObservation[];
  code: string;
  label: string;
  tolerancePct: number;
  unit: string;
  severity: "blocker" | "warning";
}): ReconciliationFinding | null {
  const numeric = args.observations.filter(
    (o): o is { type: TradeDocumentType; value: number } => typeof o.value === "number"
  );
  if (numeric.length < 2) return null;

  const values = numeric.map((o) => o.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const diff = pctDiff(min, max);
  if (diff <= args.tolerancePct) return null;

  return {
    severity: args.severity,
    code: args.code,
    message: `${args.label} disagrees across documents by ${diff.toFixed(1)}% (${min.toLocaleString()}${args.unit} vs ${max.toLocaleString()}${args.unit}). Resolve before filing — the entry can only carry one figure.`,
    documents: numeric.map((o) => o.type),
    values: numeric.map((o) => ({ type: o.type, value: `${o.value.toLocaleString()}${args.unit}` })),
  };
}

function identityFinding(args: {
  observations: FieldObservation[];
  code: string;
  label: string;
  severity: "blocker" | "warning";
  normalizer?: (value: unknown) => string | null;
}): ReconciliationFinding | null {
  const normalize = args.normalizer ?? ((v: unknown) =>
    typeof v === "string" ? v.trim().toLowerCase() : null);

  const normalized = args.observations
    .map((o) => ({ type: o.type, raw: o.value, key: normalize(o.value) }))
    .filter((o): o is { type: TradeDocumentType; raw: unknown; key: string } => o.key !== null);

  if (normalized.length < 2) return null;
  const distinct = new Set(normalized.map((o) => o.key));
  if (distinct.size < 2) return null;

  return {
    severity: args.severity,
    code: args.code,
    message: `${args.label} is not the same on every document. A mismatch here is the single most common cause of a document-review hold.`,
    documents: normalized.map((o) => o.type),
    values: normalized.map((o) => ({ type: o.type, value: String(o.raw) })),
  };
}

function containerFinding(documents: DocumentExtraction[]): ReconciliationFinding | null {
  const sets = documents
    .map((doc) => ({
      type: doc.type,
      containers: Array.isArray(doc.fields?.container_numbers)
        ? (doc.fields.container_numbers as unknown[]).filter(
            (c): c is string => typeof c === "string"
          )
        : [],
    }))
    .filter((s) => s.containers.length > 0);

  if (sets.length < 2) return null;

  const union = new Set(sets.flatMap((s) => s.containers));
  const disagreeing = sets.filter((s) => s.containers.length !== union.size ||
    s.containers.some((c) => !union.has(c)));

  const allMatch = sets.every(
    (s) => s.containers.length === union.size && s.containers.every((c) => union.has(c))
  );
  if (allMatch) return null;

  return {
    severity: "warning",
    code: "reconcile.container_mismatch",
    message: `Container numbers differ across documents. Union of all numbers seen: ${[...union].join(", ")}.`,
    documents: disagreeing.map((s) => s.type),
    values: sets.map((s) => ({ type: s.type, value: s.containers.join(", ") })),
  };
}

/** Which documents the cargo profile makes mandatory. */
export function requiredDocuments(profile: ShipmentProfile): TradeDocumentType[] {
  const required: TradeDocumentType[] = ["commercial_invoice", "packing_list"];
  if (profile.oceanImportToUs) {
    required.push("bill_of_lading", "isf");
  }
  if (profile.containsPlantProduct) required.push("phytosanitary_certificate");
  if (profile.containsFdaRegulatedProduct) required.push("fda_prior_notice");
  if (profile.claimsPreferentialOrigin) required.push("certificate_of_origin");
  return [...new Set(required)];
}

export function reconcileDocumentSet(
  documents: DocumentExtraction[],
  profile: ShipmentProfile = {}
): ReconciliationReport {
  const documentTypes = [...new Set(documents.map((d) => d.type))];
  const missingDocuments = requiredDocuments(profile).filter(
    (type) => !documentTypes.includes(type)
  );

  const findings: ReconciliationFinding[] = [];

  const gross = numericFinding({
    observations: observe(documents, "gross_weight_kg"),
    code: "reconcile.gross_weight_mismatch",
    label: "Gross weight",
    tolerancePct: WEIGHT_TOLERANCE_PCT,
    unit: " kg",
    severity: "warning",
  });
  if (gross) findings.push(gross);

  const packages = numericFinding({
    observations: observe(documents, "package_count"),
    code: "reconcile.package_count_mismatch",
    label: "Package count",
    tolerancePct: 0,
    unit: "",
    severity: "blocker",
  });
  if (packages) findings.push(packages);

  const quantity = numericFinding({
    observations: observe(documents, "total_quantity"),
    code: "reconcile.quantity_mismatch",
    label: "Total quantity",
    tolerancePct: 0,
    unit: " units",
    severity: "warning",
  });
  if (quantity) findings.push(quantity);

  const value = numericFinding({
    observations: observe(documents, "total_value"),
    code: "reconcile.value_mismatch",
    label: "Declared value",
    tolerancePct: VALUE_TOLERANCE_PCT,
    unit: "",
    severity: "blocker",
  });
  if (value) findings.push(value);

  // Consignee appears under three different keys depending on the document.
  const consigneeObservations = [
    ...observe(documents, "consignee"),
    ...observe(documents, "importer"),
    ...observe(documents, "buyer"),
  ];
  const consignee = identityFinding({
    observations: consigneeObservations,
    code: "reconcile.consignee_mismatch",
    label: "Consignee / importer",
    severity: "warning",
    normalizer: normalizeParty,
  });
  if (consignee) findings.push(consignee);

  const shipperObservations = [
    ...observe(documents, "shipper"),
    ...observe(documents, "seller"),
    ...observe(documents, "exporter"),
  ];
  const shipper = identityFinding({
    observations: shipperObservations,
    code: "reconcile.shipper_mismatch",
    label: "Shipper / seller / exporter",
    severity: "warning",
    normalizer: normalizeParty,
  });
  if (shipper) findings.push(shipper);

  const origin = identityFinding({
    observations: observe(documents, "country_of_origin"),
    code: "reconcile.origin_mismatch",
    label: "Country of origin",
    severity: "blocker",
  });
  if (origin) findings.push(origin);

  const invoiceRef = identityFinding({
    observations: observe(documents, "invoice_number"),
    code: "reconcile.invoice_reference_mismatch",
    label: "Invoice reference",
    severity: "warning",
  });
  if (invoiceRef) findings.push(invoiceRef);

  const bl = identityFinding({
    observations: observe(documents, "bl_number"),
    code: "reconcile.bl_reference_mismatch",
    label: "Bill of lading reference",
    severity: "warning",
  });
  if (bl) findings.push(bl);

  const containers = containerFinding(documents);
  if (containers) findings.push(containers);

  const severityOrder = { blocker: 0, warning: 1, info: 2 } as const;
  findings.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  return {
    documentTypes,
    missingDocuments,
    findings,
    clearedToFile:
      missingDocuments.length === 0 &&
      !findings.some((f) => f.severity === "blocker"),
  };
}

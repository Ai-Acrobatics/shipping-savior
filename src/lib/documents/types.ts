// ============================================================
// Multi-document trade OCR — types (AI-12016)
//
// Extends the BOL-only OCR pipeline to the full export document set. The BOL
// tells you what moved; these documents are what decides whether it clears.
//
// Two of them are hard gates rather than paperwork:
//   * Phytosanitary certificate — no valid cert, no produce entry (IPPC/ISPM 12)
//   * FDA Prior Notice — no confirmation number filed inside the statutory
//     window, and FDA refuses the article at the port (21 CFR 1.283)
//
// Every document type declares its fields as data, so one registry drives the
// extraction prompt, the completeness check and the UI form. Adding a document
// type means adding a spec, not editing four files.
// ============================================================

export type TradeDocumentType =
  | "bill_of_lading"
  | "commercial_invoice"
  | "packing_list"
  | "isf"
  | "certificate_of_origin"
  | "phytosanitary_certificate"
  | "fda_prior_notice";

/** What the caller may ask for. "auto" runs the classifier. */
export type RequestedDocumentType = TradeDocumentType | "auto";

export type FieldKind = "string" | "number" | "date" | "datetime" | "string[]";

export interface DocumentFieldSpec {
  /** snake_case key the model is asked to return. */
  key: string;
  label: string;
  kind: FieldKind;
  /** Prompt-side description of what to look for. */
  hint: string;
  /**
   * Missing this field blocks the document from being treated as usable.
   * Required fields are the statutory/contractual minimum, not "nice to have".
   */
  required?: boolean;
}

export interface DocumentTypeSpec {
  type: TradeDocumentType;
  label: string;
  /** One line explaining what the document is for, shown in the UI. */
  purpose: string;
  /**
   * Lowercase phrases that identify this document in raw OCR text. Weighted
   * by specificity: a phrase only this document uses scores higher.
   */
  signals: Array<{ phrase: string; weight: number }>;
  fields: DocumentFieldSpec[];
  /** Regulatory citation shown alongside validation failures. */
  authority: string;
}

// ─── Extraction ───────────────────────────────────────────

export interface DocumentExtraction {
  type: TradeDocumentType;
  /** Field key → value, coerced per the field's kind. */
  fields: Record<string, unknown>;
  /** Field key → 0..1 model confidence. */
  confidence: Record<string, number>;
}

// ─── Classification ───────────────────────────────────────

export interface ClassificationCandidate {
  type: TradeDocumentType;
  score: number;
  matched: string[];
}

export interface ClassificationResult {
  type: TradeDocumentType | null;
  confidence: number;
  candidates: ClassificationCandidate[];
  /** True when two types scored close enough that the call is not safe. */
  ambiguous: boolean;
}

// ─── Validation ───────────────────────────────────────────

export type IssueSeverity = "blocker" | "warning" | "info";

export interface ValidationIssue {
  severity: IssueSeverity;
  /** Stable machine code, e.g. "fda.prior_notice_late". */
  code: string;
  message: string;
  /** Field keys the issue points at, for UI highlighting. */
  fields: string[];
  /** Regulatory hook, when the issue is a legal requirement rather than hygiene. */
  authority?: string;
}

export interface DocumentValidation {
  type: TradeDocumentType;
  /** No blockers. Warnings do not stop a document from being usable. */
  valid: boolean;
  issues: ValidationIssue[];
  /** Required fields present / required fields total. */
  completeness: number;
  missingRequired: string[];
  /** Fields the model returned but flagged below the review threshold. */
  lowConfidenceFields: string[];
}

// ─── Cross-document reconciliation ────────────────────────

export interface ReconciliationFinding {
  severity: IssueSeverity;
  code: string;
  message: string;
  /** Document types that disagree. */
  documents: TradeDocumentType[];
  values: Array<{ type: TradeDocumentType; value: string }>;
}

export interface ReconciliationReport {
  documentTypes: TradeDocumentType[];
  /** Document types the shipment mode requires that are not in the set. */
  missingDocuments: TradeDocumentType[];
  findings: ReconciliationFinding[];
  /** No blocker findings and nothing required is missing. */
  clearedToFile: boolean;
}

/** Cargo attributes that decide which documents a shipment actually needs. */
export interface ShipmentProfile {
  /** Perishable plant product — triggers the phytosanitary requirement. */
  containsPlantProduct?: boolean;
  /** Food, drug, device or cosmetic — triggers FDA Prior Notice. */
  containsFdaRegulatedProduct?: boolean;
  /** Claiming preferential duty treatment — triggers certificate of origin. */
  claimsPreferentialOrigin?: boolean;
  /** Ocean import into the US — triggers ISF (10+2). */
  oceanImportToUs?: boolean;
}

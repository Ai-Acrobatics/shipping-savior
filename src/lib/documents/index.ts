// ============================================================
// Multi-document trade OCR (AI-12016) — public surface
//
// Extends the BOL-only pipeline to the full export document set: commercial
// invoice, packing list, ISF, certificate of origin, phytosanitary
// certificate and FDA Prior Notice.
//
// Everything here is pure: parsing, classification, validation and
// reconciliation are all synchronous functions over plain data, so the whole
// compliance layer is unit-testable and the API route only owns auth, blob
// storage and the model call.
// ============================================================

import { resolveDocumentType } from "./classify";
import { normalizeExtraction } from "./normalize";
import { validateDocument } from "./validate";
import type {
  DocumentExtraction,
  DocumentValidation,
  RequestedDocumentType,
  TradeDocumentType,
} from "./types";

export * from "./types";
export {
  DOCUMENT_SPECS,
  DOCUMENT_TYPES,
  getDocumentSpec,
  isTradeDocumentType,
} from "./registry";
export { buildExtractionPrompt, buildAutoExtractionPrompt } from "./prompt";
export {
  classifyDocumentText,
  resolveDocumentType,
  AMBIGUITY_MARGIN,
} from "./classify";
export {
  normalizeExtraction,
  cleanString,
  coerceNumber,
  coerceDate,
  coerceDateTime,
  coerceStringArray,
  normalizeContainerNumber,
} from "./normalize";
export {
  validateDocument,
  LOW_CONFIDENCE_THRESHOLD,
  ISF_LEAD_HOURS,
  FDA_LEAD_HOURS_BY_MODE,
  FDA_MAX_LEAD_DAYS,
  PHYTO_ISSUE_WINDOW_DAYS,
} from "./validate";
export {
  reconcileDocumentSet,
  requiredDocuments,
  WEIGHT_TOLERANCE_PCT,
  VALUE_TOLERANCE_PCT,
} from "./reconcile";

export class DocumentParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DocumentParseError";
  }
}

export interface ProcessedDocument {
  extraction: DocumentExtraction;
  validation: DocumentValidation;
  /** How the document type was decided. */
  typeSource: "requested" | "model" | "text" | "none";
  /** Set when the model's claimed type and the text classifier disagree. */
  typeConflict: { modelClaim: TradeDocumentType; textClaim: TradeDocumentType } | null;
  classificationConfidence: number;
}

/**
 * Strip markdown fences and parse the model's JSON payload.
 *
 * Models wrap JSON in ```json fences intermittently rather than consistently,
 * so this has to tolerate both. It does NOT try to repair malformed JSON —
 * a half-parsed compliance document is worse than a failed one.
 */
export function parseModelPayload(text: string): {
  document_type?: unknown;
  extracted?: Record<string, unknown>;
  confidence?: Record<string, unknown>;
} {
  const cleaned = (text ?? "")
    .replace(/^\s*```(?:json)?\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  if (!cleaned) {
    throw new DocumentParseError("The model returned an empty response.");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new DocumentParseError("The model response was not valid JSON.");
  }

  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new DocumentParseError("The model response was not a JSON object.");
  }

  return parsed as Record<string, unknown>;
}

/**
 * Turn a raw model response into a normalized, validated document.
 *
 * `requestedType` of "auto" (or omitted) lets the model classify, cross-checked
 * against the deterministic text classifier. An explicit type always wins —
 * the user knows what they uploaded.
 */
export function processExtraction(args: {
  rawText: string;
  requestedType?: RequestedDocumentType;
  now?: Date;
}): ProcessedDocument {
  const payload = parseModelPayload(args.rawText);

  const resolved = resolveDocumentType({
    requested: args.requestedType,
    modelClaim: typeof payload.document_type === "string" ? payload.document_type : null,
    rawText: args.rawText,
  });

  if (!resolved.type) {
    throw new DocumentParseError(
      "Could not determine which trade document this is. Re-upload with the document type selected explicitly."
    );
  }

  const { fields, confidence } = normalizeExtraction(
    resolved.type,
    (payload.extracted as Record<string, unknown>) ?? null,
    (payload.confidence as Record<string, unknown>) ?? null
  );

  const extraction: DocumentExtraction = { type: resolved.type, fields, confidence };
  const validation = validateDocument(extraction, { now: args.now });

  return {
    extraction,
    validation,
    typeSource: resolved.source,
    typeConflict: resolved.conflict,
    classificationConfidence: resolved.classification.confidence,
  };
}

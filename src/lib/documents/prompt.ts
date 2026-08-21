// ============================================================
// Multi-document trade OCR — prompt construction (AI-12016)
//
// The prompt is generated from the registry rather than hand-written per
// document, so a field added to a spec is automatically extracted, validated
// and rendered. Hand-written prompts drift from the field list within a
// release or two — this cannot.
// ============================================================

import { DOCUMENT_SPECS, DOCUMENT_TYPES, getDocumentSpec } from "./registry";
import type { DocumentFieldSpec, TradeDocumentType } from "./types";

function fieldLine(field: DocumentFieldSpec): string {
  const kindHint =
    field.kind === "string[]"
      ? "array of strings"
      : field.kind === "number"
        ? "number only, no currency symbols or thousands separators"
        : field.kind === "date"
          ? "ISO 8601 date, YYYY-MM-DD"
          : field.kind === "datetime"
            ? "ISO 8601 datetime with timezone offset where legible, e.g. 2026-05-01T14:30:00Z"
            : "string";
  return `   - ${field.key} (${kindHint}): ${field.hint}${field.required ? " [REQUIRED]" : ""}`;
}

/**
 * Prompt for a document whose type the caller already knows.
 *
 * The "do not guess" instruction matters more here than in most extraction
 * prompts: a hallucinated FDA confirmation number or ISF transaction number
 * reads as compliant right up until the entry is refused at the port.
 */
export function buildExtractionPrompt(type: TradeDocumentType): string {
  const spec = getDocumentSpec(type);
  return [
    `You are extracting structured data from a ${spec.label} used in international trade.`,
    `Purpose of this document: ${spec.purpose}`,
    "",
    "Return ONLY valid JSON (no markdown fences) with three top-level keys:",
    "",
    `1. "document_type": the string "${spec.type}" if the document really is a ${spec.label}, otherwise the closest match from this list: ${DOCUMENT_TYPES.join(", ")}.`,
    "",
    '2. "extracted": an object with exactly these keys. Use null for anything not present on the document.',
    ...spec.fields.map(fieldLine),
    "",
    '3. "confidence": an object with the same keys, each a number 0.0-1.0 describing how confident you are in that value. Use 0.0 for any field you returned as null.',
    "   Calibration: 1.0 = printed clearly and unambiguous; 0.7 = legible but needed interpretation; 0.4 = partially obscured or inferred from context; 0.0 = absent.",
    "",
    "RULES:",
    "- Never invent a reference, certificate, registration or confirmation number. If it is not legible, return null with confidence 0.0.",
    "- Transcribe identifiers exactly as printed, including letter case and leading zeros.",
    "- Dates: return ISO 8601. If the document uses an ambiguous numeric format, prefer the interpretation consistent with other dates on the same document, and lower the confidence to 0.5 or below.",
    "- Weights: return kilograms. If the document states pounds, divide by 2.20462 and lower confidence to 0.8.",
    "- Do not summarise or editorialise. Return values, not sentences about values.",
  ].join("\n");
}

/**
 * Prompt used when the caller passes docType "auto". The model classifies and
 * extracts in one pass, so an unknown upload costs one call rather than two.
 */
export function buildAutoExtractionPrompt(): string {
  const catalogue = DOCUMENT_TYPES.map((type) => {
    const spec = DOCUMENT_SPECS[type];
    return `   - "${type}" — ${spec.label}: ${spec.purpose}`;
  });

  const fieldCatalogue = DOCUMENT_TYPES.map((type) => {
    const spec = DOCUMENT_SPECS[type];
    return [
      `   ${spec.type}:`,
      ...spec.fields.map((f) => `     - ${f.key}: ${f.hint}`),
    ].join("\n");
  });

  return [
    "You are identifying and extracting data from a single international trade document.",
    "",
    "STEP 1 — Identify which of these documents it is:",
    ...catalogue,
    "",
    "STEP 2 — Extract the fields for THAT document type only:",
    ...fieldCatalogue,
    "",
    "Return ONLY valid JSON (no markdown fences) with three top-level keys:",
    '  "document_type": one of the ids above.',
    '  "extracted": an object with that type\'s field keys. null for anything absent.',
    '  "confidence": the same keys, each 0.0-1.0. 0.0 for nulls.',
    "",
    "RULES:",
    "- If the document is genuinely none of the listed types, still pick the closest and set every confidence at or below 0.3.",
    "- Never invent a reference, certificate, registration or confirmation number. Not legible means null.",
    "- Dates as ISO 8601 (YYYY-MM-DD, or full datetime with offset when a time is printed). Weights in kilograms.",
    "- Transcribe identifiers exactly as printed.",
  ].join("\n");
}

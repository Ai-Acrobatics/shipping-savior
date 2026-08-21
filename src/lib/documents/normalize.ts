// ============================================================
// Multi-document trade OCR — value coercion (AI-12016)
//
// The model returns strings shaped by whatever the scan looked like. This
// layer coerces them to the kind the field spec declares, so validation and
// reconciliation compare like with like.
//
// Deliberately forgiving on formatting, deliberately strict on meaning: a
// weight of "18,500 KG" becomes 18500, but "approximately 18t" becomes null
// rather than a number nobody can defend on an entry summary.
// ============================================================

import type { DocumentFieldSpec, TradeDocumentType } from "./types";
import { getDocumentSpec } from "./registry";

/** OCR models echo these as literal text when a field is blank. */
const NULLISH = /^(null|nil|n\/?a|none|unknown|not\s+(found|stated|applicable)|-+|\.+)$/i;

export function cleanString(value: unknown): string | null {
  if (value == null) return null;
  if (typeof value === "number") return Number.isFinite(value) ? String(value) : null;
  if (typeof value !== "string") return null;
  const trimmed = value.trim().replace(/\s+/g, " ");
  if (!trimmed || NULLISH.test(trimmed)) return null;
  return trimmed;
}

export function coerceNumber(value: unknown): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  const s = cleanString(value);
  if (!s) return null;
  // Reject hedged figures outright — "approximately 18t" is not a customs value.
  if (/(approx|about|circa|~|±)/i.test(s)) return null;
  const stripped = s.replace(/[^0-9.\-]/g, "");
  if (!stripped || stripped === "-" || stripped === "." || stripped === "-.") return null;
  const n = Number(stripped);
  return Number.isFinite(n) ? n : null;
}

/** ISO date (YYYY-MM-DD) or null. Rejects impossible calendar dates. */
export function coerceDate(value: unknown): string | null {
  const iso = coerceDateTime(value);
  return iso ? iso.slice(0, 10) : null;
}

/**
 * Full ISO datetime or null. A bare date is anchored to midnight UTC, which
 * makes date-only inputs comparable without silently inventing a clock time
 * that a timing rule would then treat as precise.
 */
export function coerceDateTime(value: unknown): string | null {
  const s = cleanString(value);
  if (!s) return null;

  // Bare date — anchor to midnight UTC.
  const bare = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (bare) {
    const parsed = new Date(`${s}T00:00:00Z`);
    return isValidCalendarDate(parsed, s) ? parsed.toISOString() : null;
  }

  const parsed = new Date(s);
  if (Number.isNaN(parsed.getTime())) return null;
  // Guard against Date's permissive rollover: 2026-02-31 becomes March 3.
  const datePart = s.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (datePart && !isValidCalendarDate(parsed, datePart[0])) return null;
  return parsed.toISOString();
}

function isValidCalendarDate(parsed: Date, isoDate: string): boolean {
  if (Number.isNaN(parsed.getTime())) return false;
  return parsed.toISOString().slice(0, 10) === isoDate;
}

export function coerceStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map(cleanString).filter((v): v is string => v !== null);
  }
  const s = cleanString(value);
  if (!s) return [];
  // A single string of comma/semicolon/newline separated values is common.
  return s
    .split(/[,;\n]+/)
    .map((part) => cleanString(part))
    .filter((v): v is string => v !== null);
}

/** Normalize toward ISO 6346 (4 letters + 7 digits) without rejecting real-world noise. */
export function normalizeContainerNumber(value: unknown): string | null {
  const s = cleanString(value);
  if (!s) return null;
  const compact = s.replace(/[\s-]+/g, "").toUpperCase();
  if (compact.length < 5 || !/\d/.test(compact)) return null;
  return compact.slice(0, 20);
}

function coerceField(field: DocumentFieldSpec, raw: unknown): unknown {
  switch (field.kind) {
    case "number":
      return coerceNumber(raw);
    case "date":
      return coerceDate(raw);
    case "datetime":
      return coerceDateTime(raw);
    case "string[]": {
      const arr = coerceStringArray(raw);
      if (field.key === "container_numbers") {
        return arr
          .map(normalizeContainerNumber)
          .filter((v): v is string => v !== null);
      }
      return arr;
    }
    default:
      return cleanString(raw);
  }
}

/**
 * Coerce a raw model payload into the shape the document type declares.
 * Keys the spec does not declare are dropped — an extraction is a contract,
 * not a bag of whatever the model felt like returning.
 */
export function normalizeExtraction(
  type: TradeDocumentType,
  rawFields: Record<string, unknown> | null | undefined,
  rawConfidence: Record<string, unknown> | null | undefined
): { fields: Record<string, unknown>; confidence: Record<string, number> } {
  const spec = getDocumentSpec(type);
  const fields: Record<string, unknown> = {};
  const confidence: Record<string, number> = {};

  for (const field of spec.fields) {
    const value = coerceField(field, rawFields?.[field.key]);
    fields[field.key] = value;

    const isEmpty =
      value === null || (Array.isArray(value) && value.length === 0);
    const rawScore = rawConfidence?.[field.key];
    const score = typeof rawScore === "number" && Number.isFinite(rawScore)
      ? Math.min(1, Math.max(0, rawScore))
      : 0;
    // A value the coercion layer rejected cannot carry the model's confidence
    // with it — otherwise a 0.95 sits next to a null.
    confidence[field.key] = isEmpty ? 0 : score;
  }

  return { fields, confidence };
}

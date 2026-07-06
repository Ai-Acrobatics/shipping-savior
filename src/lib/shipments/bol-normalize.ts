/**
 * BOL → Shipment normalization (AI-8054)
 *
 * The OCR layer (`POST /api/bol` → `extractWithFallback`) lands raw extracted
 * JSON in the `bol_documents` table. That JSON is document-shaped: one record
 * per uploaded file, with `container_numbers` as an array.
 *
 * The *pipeline* part of "OCR pipeline for shipping documents" is promoting that
 * document-shaped blob into row-shaped, container-level `shipments` records that
 * actually populate the client's profile / dashboard. This module is that
 * promotion step, kept pure (no DB, no I/O) so it is unit-testable in isolation.
 *
 * One BOL → N shipments (one per container number). A BOL with no readable
 * container numbers still yields a single shipment row (container = null) so the
 * vessel/route/parties data is not lost.
 */

import type { NewShipment } from "@/lib/db/schema";

/** Shape of the `extracted` object produced by BOL_EXTRACTION_PROMPT. */
export interface ExtractedBol {
  container_numbers?: unknown;
  vessel_name?: unknown;
  voyage_number?: unknown;
  port_of_loading?: unknown;
  port_of_discharge?: unknown;
  etd?: unknown;
  eta?: unknown;
  carrier?: unknown;
  shipper?: unknown;
  consignee?: unknown;
  notify_party?: unknown;
  goods_description?: unknown;
  weight_kg?: unknown;
  quantity?: unknown;
}

export interface NormalizeOptions {
  orgId?: string | null;
  bolDocumentId?: string | null;
  rawBolText?: string | null;
}

/** Trim a value to a string, or null when empty / non-stringable. */
export function cleanString(v: unknown): string | null {
  if (v == null) return null;
  if (typeof v === "number") return String(v);
  if (typeof v !== "string") return null;
  const t = v.trim();
  if (!t) return null;
  // OCR models sometimes echo "null"/"N/A"/"unknown" as literal text.
  if (/^(null|n\/?a|none|unknown|not\s+found|-+)$/i.test(t)) return null;
  return t;
}

/**
 * Normalize a container number toward ISO 6346 (4 letters + 7 digits, e.g.
 * MSCU1234567). Whitespace and hyphens are stripped and the value is
 * uppercased. We do NOT reject non-conforming values outright — real BOLs carry
 * malformed or partial numbers — but a value that cannot plausibly be a
 * container id (too short, no digits) is dropped to null.
 */
export function normalizeContainerNumber(v: unknown): string | null {
  const s = cleanString(v);
  if (!s) return null;
  const compact = s.replace(/[\s-]+/g, "").toUpperCase();
  if (compact.length < 5) return null;
  if (!/\d/.test(compact)) return null;
  // Cap at the schema column length (varchar(20)).
  return compact.slice(0, 20);
}

/** Coerce to a finite number, accepting numeric strings like "18,500" or "$1200". */
export function coerceNumber(v: unknown): number | null {
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  if (typeof v === "string") {
    const cleaned = v.replace(/[^0-9.\-]/g, "");
    if (!cleaned || cleaned === "-" || cleaned === ".") return null;
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

/** weight_kg is an integer column — round and clamp to non-negative. */
export function coerceWeightKg(v: unknown): number | null {
  const n = coerceNumber(v);
  if (n == null) return null;
  const rounded = Math.round(n);
  return rounded < 0 ? null : rounded;
}

/** quantity is an integer column. */
export function coerceQuantity(v: unknown): number | null {
  const n = coerceNumber(v);
  if (n == null) return null;
  const rounded = Math.round(n);
  return rounded < 0 ? null : rounded;
}

/** Parse a loosely-formatted date string into a Date, or null when unparseable. */
export function parseBolDate(v: unknown): Date | null {
  const s = cleanString(v);
  if (!s) return null;
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return null;
  // Guard against absurd OCR misreads (year far outside shipping reality).
  const year = d.getUTCFullYear();
  if (year < 2000 || year > 2100) return null;
  return d;
}

/** Pull container numbers out of the extracted blob as a clean, de-duped list. */
export function extractContainerNumbers(extracted: ExtractedBol): string[] {
  const raw = extracted.container_numbers;
  const list: unknown[] = Array.isArray(raw)
    ? raw
    : raw == null
      ? []
      : // A single string may arrive comma/semicolon/newline separated.
        typeof raw === "string"
        ? raw.split(/[,;\n]/)
        : [raw];

  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of list) {
    const norm = normalizeContainerNumber(item);
    if (norm && !seen.has(norm)) {
      seen.add(norm);
      out.push(norm);
    }
  }
  return out;
}

/**
 * Build the columns shared by every shipment derived from a single BOL
 * (everything except the per-container number).
 */
function sharedShipmentFields(
  extracted: ExtractedBol,
  opts: NormalizeOptions
): Omit<NewShipment, "containerNumber"> {
  const pol = cleanString(extracted.port_of_loading);
  const pod = cleanString(extracted.port_of_discharge);
  return {
    orgId: opts.orgId ?? null,
    vesselName: cleanString(extracted.vessel_name),
    voyageNumber: cleanString(extracted.voyage_number),
    // Keep both the OCR-flavored (pol/pod) and the CSV-flavored
    // (originPort/destPort) columns populated so either UI surface works.
    pol,
    pod,
    originPort: pol,
    destPort: pod,
    etd: parseBolDate(extracted.etd),
    eta: parseBolDate(extracted.eta),
    carrier: cleanString(extracted.carrier),
    shipper: cleanString(extracted.shipper),
    consignee: cleanString(extracted.consignee),
    notifyParty: cleanString(extracted.notify_party),
    goodsDescription: cleanString(extracted.goods_description),
    cargoType: cleanString(extracted.goods_description),
    weightKg: coerceWeightKg(extracted.weight_kg),
    quantity: coerceQuantity(extracted.quantity),
    status: "in_transit",
    source: "bol_ocr",
    rawBolText: opts.rawBolText ?? null,
    bolDocumentId: opts.bolDocumentId ?? null,
  };
}

/**
 * Promote an extracted BOL into one-or-more shipment insert objects.
 *
 * - N container numbers  → N shipment rows, each carrying the same vessel /
 *   route / party data plus its own container number, and a `containerCount`
 *   that reflects the whole BOL.
 * - 0 container numbers  → a single row with `containerNumber: null` so the
 *   document's other data still lands in the client's profile.
 */
export function normalizeBolToShipments(
  extracted: ExtractedBol | null | undefined,
  opts: NormalizeOptions = {}
): NewShipment[] {
  const ex = extracted ?? {};
  const containers = extractContainerNumbers(ex);
  const shared = sharedShipmentFields(ex, opts);
  const containerCount = containers.length || null;

  if (containers.length === 0) {
    return [{ ...shared, containerNumber: null, containerCount }];
  }

  return containers.map((containerNumber) => ({
    ...shared,
    containerNumber,
    containerCount,
  }));
}

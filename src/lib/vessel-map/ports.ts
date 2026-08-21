// ── Port resolution for the vessel map (AI-12012) ─────────────────────
//
// Shipments carry ports as free text: BOL OCR writes "SHANGHAI, CN", the
// reefer workbook writes "Manzanillo", and CSV imports sometimes write the
// bare LOCODE. data/ports.json holds 707 ports with coordinates keyed by
// LOCODE, so every lane needs a tolerant text → coordinate resolver before it
// can be drawn.

export interface PortRecord {
  locode: string;
  name: string;
  country: string;
  country_code: string;
  lat: number;
  lng: number;
  port_type?: string;
  size?: string;
  region?: string;
}

export interface PortIndex {
  byLocode: Map<string, PortRecord>;
  byName: Map<string, PortRecord>;
  all: PortRecord[];
}

/** Country/qualifier noise that shows up in BOL port strings. */
const STRIPPED_TOKENS = [
  "PORT OF",
  "PORT",
  "TERMINAL",
  "SEAPORT",
  "HARBOUR",
  "HARBOR",
];

/**
 * Canonical comparison key: uppercase, accent-folded, punctuation collapsed,
 * qualifier words removed. "Port of Los Angeles, CA (USA)" → "LOS ANGELES CA USA".
 */
export function normalizePortKey(raw: string): string {
  let s = raw
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9 ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  for (const token of STRIPPED_TOKENS) {
    s = s.replace(new RegExp(`(^|\\s)${token}(\\s|$)`, "g"), " ");
  }

  return s.replace(/\s+/g, " ").trim();
}

/** A LOCODE is exactly 5 alphanumerics starting with a 2-letter country code. */
export function looksLikeLocode(raw: string): boolean {
  return /^[A-Z]{2}[A-Z0-9]{3}$/.test(raw.trim().toUpperCase());
}

/**
 * Alias keys a catalog name should also answer to.
 *
 * The shipped catalog uses compound and parenthetical names —
 * "New York/New Jersey", "Ningbo-Zhoushan", "Norfolk (Virginia)",
 * "Miami (PortMiami)" — but shippers type one component. Split on the
 * separators *before* punctuation is collapsed so each component stays
 * addressable.
 */
export function portNameAliases(name: string): string[] {
  const aliases = new Set<string>();

  // Strip parentheticals: "Norfolk (Virginia)" → "Norfolk".
  const withoutParens = name.replace(/\([^)]*\)/g, " ");
  for (const part of [name, withoutParens, ...withoutParens.split(/[/,\-]+/)]) {
    const key = normalizePortKey(part);
    // 3 chars is the shortest real port name in the catalog ("Rio").
    if (key.length >= 3) aliases.add(key);
  }

  return [...aliases];
}

export function buildPortIndex(ports: PortRecord[]): PortIndex {
  const byLocode = new Map<string, PortRecord>();
  const byName = new Map<string, PortRecord>();

  for (const port of ports) {
    if (!Number.isFinite(port.lat) || !Number.isFinite(port.lng)) continue;
    byLocode.set(port.locode.toUpperCase(), port);

    // First writer wins: ports.json is ordered by TEU, so the busier port
    // keeps an ambiguous name (e.g. "Valencia" → ESVLC, not VEVLN).
    for (const alias of portNameAliases(port.name)) {
      if (!byName.has(alias)) byName.set(alias, port);
    }
  }

  return { byLocode, byName, all: ports };
}

/**
 * Resolve free-text port input to a catalog record.
 *
 * Order: LOCODE → exact normalized name → embedded LOCODE token → name token
 * prefix match. Returns null rather than guessing when nothing is confident,
 * so an unresolvable lane is reported as such instead of drawn at (0, 0).
 */
export function resolvePort(index: PortIndex, raw: string | null | undefined): PortRecord | null {
  if (!raw) return null;
  const trimmed = String(raw).trim();
  if (!trimmed) return null;

  if (looksLikeLocode(trimmed)) {
    const hit = index.byLocode.get(trimmed.toUpperCase());
    if (hit) return hit;
  }

  const key = normalizePortKey(trimmed);
  if (!key) return null;

  const exact = index.byName.get(key);
  if (exact) return exact;

  const tokens = key.split(" ");

  // "SHANGHAI CNSHA" / "CNSHA SHANGHAI" — a LOCODE hiding inside the string.
  for (const token of tokens) {
    if (looksLikeLocode(token)) {
      const hit = index.byLocode.get(token);
      if (hit) return hit;
    }
  }

  // "SHANGHAI CN" / "LOS ANGELES CA USA" — drop trailing qualifiers until the
  // remaining prefix matches a known port name.
  for (let end = tokens.length - 1; end >= 1; end -= 1) {
    const candidate = tokens.slice(0, end).join(" ");
    const hit = index.byName.get(candidate);
    if (hit) return hit;
  }

  return null;
}

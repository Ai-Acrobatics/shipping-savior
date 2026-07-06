/**
 * Load-board grouping for Blake's weekly refrigerated-export operating board
 * (AI-10777). Pure functions — no fetch, no React — so the week/carrier/
 * destination pivots are unit-testable in isolation.
 *
 * Rows come from GET /api/shipments. Workbook rows carry `importMeta`
 * ("Week 40".."Week 48", customer code, cross-dock appointment, cutoffs…);
 * manual/BOL rows have importMeta = null and fall back to an ETD-derived
 * ISO-week bucket ("Week N (ETD)") or "Unscheduled".
 */

export const UNSCHEDULED = "Unscheduled";

export interface LoadBoardImportMeta {
  week?: string | null;
  typeOfService?: string | null;
  customerCode?: string | null;
  crossdockAppointment?: string | null;
  temperature?: string | null;
  reeferCutoff?: string | null;
  documentCutoff?: string | null;
  aesNumber?: string | null;
  sealNumber?: string | null;
  reviewIssues?: string[] | null;
  [key: string]: unknown;
}

/** Minimal shipment shape the board needs. Every field may be absent/null. */
export interface LoadBoardShipment {
  id: string;
  reference?: string | null;
  carrier?: string | null;
  vesselName?: string | null;
  pol?: string | null;
  pod?: string | null;
  etd?: string | Date | null;
  eta?: string | Date | null;
  containerNumber?: string | null;
  cargoType?: string | null;
  quantity?: number | null;
  weightKg?: number | null;
  status?: string | null;
  importMeta?: LoadBoardImportMeta | null;
}

export interface LoadBoardFilters {
  week?: string;
  carrier?: string;
  destination?: string;
  customer?: string;
}

export interface LoadBoardGroup {
  key: string;
  carrier: string;
  destination: string;
  shipments: LoadBoardShipment[];
}

export interface LoadBoardWeek {
  week: string;
  shipmentCount: number;
  /** Distinct non-empty container numbers in the week. */
  containerCount: number;
  groups: LoadBoardGroup[];
}

export interface LoadBoardFilterOptions {
  weeks: string[];
  carriers: string[];
  destinations: string[];
  customers: string[];
}

const UNKNOWN_CARRIER = "Unknown carrier";
const UNKNOWN_DESTINATION = "Unknown destination";

// ── Week labelling ─────────────────────────────────────

function parseDate(value: string | Date | null | undefined): Date | null {
  if (value == null) return null;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** ISO-8601 week number (1–53). */
export function isoWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7; // Mon=1..Sun=7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum); // nearest Thursday
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

/**
 * Bucket label for a shipment:
 * - importMeta.week ("Week 40") when present,
 * - else "Week N (ETD)" derived from the ETD's ISO week,
 * - else "Unscheduled".
 */
export function weekLabel(row: LoadBoardShipment): string {
  const metaWeek = row.importMeta?.week;
  if (typeof metaWeek === "string" && metaWeek.trim() !== "") return metaWeek.trim();
  const etd = parseDate(row.etd);
  if (etd) return `Week ${isoWeek(etd)} (ETD)`;
  return UNSCHEDULED;
}

/**
 * Sort key: numeric week order ("Week 9" < "Week 40" < "Week 44"); a derived
 * "Week N (ETD)" bucket sorts directly after the real "Week N"; labels with
 * no number sort after all numbered weeks; "Unscheduled" is always last.
 */
function weekSortKey(label: string): [number, number, number, string] {
  if (label === UNSCHEDULED) return [3, 0, 0, label];
  const m = label.match(/(\d+)/);
  const etd = /\(ETD\)/.test(label) ? 1 : 0;
  if (!m) return [2, 0, etd, label];
  return [0, parseInt(m[1], 10), etd, label];
}

export function compareWeekLabels(a: string, b: string): number {
  const ka = weekSortKey(a);
  const kb = weekSortKey(b);
  if (ka[0] !== kb[0]) return ka[0] - kb[0];
  if (ka[1] !== kb[1]) return ka[1] - kb[1];
  if (ka[2] !== kb[2]) return ka[2] - kb[2];
  return ka[3].localeCompare(kb[3]);
}

// ── Filtering ──────────────────────────────────────────

function clean(value: string | null | undefined): string | null {
  if (typeof value !== "string") return null;
  const t = value.trim();
  return t === "" ? null : t;
}

function matchesFilters(row: LoadBoardShipment, filters: LoadBoardFilters): boolean {
  if (filters.week && weekLabel(row) !== filters.week) return false;
  if (filters.carrier && clean(row.carrier) !== filters.carrier) return false;
  if (filters.destination && clean(row.pod) !== filters.destination) return false;
  if (filters.customer && clean(row.importMeta?.customerCode) !== filters.customer) {
    return false;
  }
  return true;
}

export function hasReviewIssues(row: LoadBoardShipment): boolean {
  const issues = row.importMeta?.reviewIssues;
  return Array.isArray(issues) && issues.length > 0;
}

// ── Grouping ───────────────────────────────────────────

function timeOf(value: string | Date | null | undefined): number {
  const d = parseDate(value);
  return d ? d.getTime() : Number.MAX_SAFE_INTEGER;
}

/**
 * Filter rows, then pivot week → (carrier + destination) → rows.
 * Weeks sorted numerically with "Unscheduled" last; groups sorted by
 * carrier then destination; rows sorted by ETD then booking reference.
 */
export function groupShipments(
  rows: LoadBoardShipment[],
  filters: LoadBoardFilters = {}
): LoadBoardWeek[] {
  const weekMap = new Map<string, Map<string, LoadBoardGroup>>();

  for (const row of rows ?? []) {
    if (!row || !matchesFilters(row, filters)) continue;
    const week = weekLabel(row);
    const carrier = clean(row.carrier) ?? UNKNOWN_CARRIER;
    const destination = clean(row.pod) ?? UNKNOWN_DESTINATION;
    const key = `${carrier}::${destination}`;

    let groups = weekMap.get(week);
    if (!groups) {
      groups = new Map();
      weekMap.set(week, groups);
    }
    let group = groups.get(key);
    if (!group) {
      group = { key, carrier, destination, shipments: [] };
      groups.set(key, group);
    }
    group.shipments.push(row);
  }

  return Array.from(weekMap.entries())
    .sort(([a], [b]) => compareWeekLabels(a, b))
    .map(([week, groups]) => {
      const sortedGroups = Array.from(groups.values()).sort(
        (a, b) =>
          a.carrier.localeCompare(b.carrier) ||
          a.destination.localeCompare(b.destination)
      );
      const containers = new Set<string>();
      let shipmentCount = 0;
      for (const g of sortedGroups) {
        g.shipments.sort(
          (a, b) =>
            timeOf(a.etd) - timeOf(b.etd) ||
            (clean(a.reference) ?? "").localeCompare(clean(b.reference) ?? "")
        );
        shipmentCount += g.shipments.length;
        for (const s of g.shipments) {
          const c = clean(s.containerNumber);
          if (c) containers.add(c.toUpperCase());
        }
      }
      return {
        week,
        shipmentCount,
        containerCount: containers.size,
        groups: sortedGroups,
      };
    });
}

// ── Filter options ─────────────────────────────────────

/** Distinct, sorted dropdown options derived from the loaded rows. */
export function extractFilterOptions(rows: LoadBoardShipment[]): LoadBoardFilterOptions {
  const weeks = new Set<string>();
  const carriers = new Set<string>();
  const destinations = new Set<string>();
  const customers = new Set<string>();

  for (const row of rows ?? []) {
    if (!row) continue;
    weeks.add(weekLabel(row));
    const carrier = clean(row.carrier);
    if (carrier) carriers.add(carrier);
    const destination = clean(row.pod);
    if (destination) destinations.add(destination);
    const customer = clean(row.importMeta?.customerCode);
    if (customer) customers.add(customer);
  }

  const alpha = (a: string, b: string) => a.localeCompare(b);
  return {
    weeks: Array.from(weeks).sort(compareWeekLabels),
    carriers: Array.from(carriers).sort(alpha),
    destinations: Array.from(destinations).sort(alpha),
    customers: Array.from(customers).sort(alpha),
  };
}

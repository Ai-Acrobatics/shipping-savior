/**
 * Cross-dock appointment board (AI-12007). Pure functions — no fetch, no
 * React — so lane assignment, slot timing and the week grid are unit-testable.
 *
 * Source of truth is the shipment itself, not a separate appointments table:
 * Blake's weekly workbook already carries the cross-dock column
 * ("Apt date request Crossdock") on every row, persisted to
 * shipments.import_meta.crossdockAppointment by the workbook intake. In
 * practice that cell holds the cross-dock operator ("KINGSCO DRAY",
 * "ANACAPA") or "Delivery @ Port" for loads that go straight to Port
 * Hueneme — and sometimes a date. Reading it from the shipment means the
 * board can never disagree with the load board or the export.
 *
 * Timing: when the cell carries an explicit date, that is the appointment.
 * Otherwise the slot falls back to the reefer cutoff (the moment the box has
 * to be at the port), then the document cutoff, then ETD — and the board says
 * which one it used. A deadline is not an appointment, and the UI must not
 * present one as the other.
 */

export type LaneId = "kingsco" | "anacapa" | "port" | "unassigned" | `other:${string}`;

export interface CrossDockImportMeta {
  week?: string | null;
  customerCode?: string | null;
  crossdockAppointment?: string | null;
  temperature?: string | null;
  reeferCutoff?: string | null;
  documentCutoff?: string | null;
  typeOfService?: string | null;
  [key: string]: unknown;
}

/** Minimal shipment shape the board needs (subset of GET /api/shipments rows). */
export interface CrossDockShipment {
  id: string;
  reference?: string | null;
  containerNumber?: string | null;
  carrier?: string | null;
  vesselName?: string | null;
  pod?: string | null;
  cargoType?: string | null;
  etd?: string | Date | null;
  status?: string | null;
  importMeta?: CrossDockImportMeta | null;
}

export type SlotTimeSource = "appointment" | "reefer_cutoff" | "document_cutoff" | "etd" | "none";

export interface CrossDockSlot {
  shipment: CrossDockShipment;
  laneId: LaneId;
  laneLabel: string;
  /** Null when no usable date exists anywhere on the row. */
  at: Date | null;
  timeSource: SlotTimeSource;
  /** The raw cross-dock cell, for display/tooltips. */
  rawCrossdock: string | null;
  /** Another slot in the same lane is booked for the exact same minute. */
  collision: boolean;
}

export interface Lane {
  id: LaneId;
  label: string;
  description: string;
}

export const KNOWN_LANES: Lane[] = [
  { id: "kingsco", label: "KINGSCO", description: "KINGSCO Dray cross-dock" },
  { id: "anacapa", label: "ANACAPA", description: "ANACAPA cross-dock" },
  { id: "port", label: "Port Hueneme", description: "Delivery direct to port" },
];

export const UNASSIGNED_LANE: Lane = {
  id: "unassigned",
  label: "Unassigned",
  description: "No cross-dock operator on the row yet",
};

// ── Parsing ────────────────────────────────────────────

function clean(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const t = value.replace(/\s+/g, " ").trim();
  return t === "" ? null : t;
}

const PLACEHOLDERS = new Set(["tbd", "tba", "n/a", "na", "-", "--", "pending"]);

/** Which lane a raw cross-dock cell belongs to. */
export function laneFor(raw: string | null | undefined): { id: LaneId; label: string } {
  const value = clean(raw);
  if (!value || PLACEHOLDERS.has(value.toLowerCase())) {
    return { id: UNASSIGNED_LANE.id, label: UNASSIGNED_LANE.label };
  }
  if (/kings\s*co/i.test(value)) return { id: "kingsco", label: "KINGSCO" };
  if (/anacapa/i.test(value)) return { id: "anacapa", label: "ANACAPA" };
  if (/(@|\bat\b|\bto\b)\s*port|\bport\b|hueneme|wainimi/i.test(value)) {
    return { id: "port", label: "Port Hueneme" };
  }
  // A cell that is only a date names a time, not an operator.
  const words = value.replace(DATE_TOKEN_RE, " ").replace(/\b[ap]m\b/gi, " ");
  if (!/[a-z]{2,}/i.test(words)) {
    return { id: UNASSIGNED_LANE.id, label: UNASSIGNED_LANE.label };
  }
  const label = words.replace(/\s+/g, " ").trim().toUpperCase();
  return { id: `other:${label}`, label };
}

// Date-ish tokens we are willing to hand to the Date parser. Requiring one of
// these stops V8's permissive legacy parser from turning "ANACAPA 1" into 2001.
const DATE_TOKEN_RE =
  /\d{4}-\d{2}-\d{2}(?:[T ][\d:.]+(?:Z|[+-]\d{2}:?\d{2})?)?|\d{1,2}\/\d{1,2}\/\d{2,4}(?:\s+\d{1,2}:\d{2}(?:\s*[ap]m)?)?|\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\.?\s+\d{1,2},?\s+\d{4}(?:\s+\d{1,2}:\d{2}(?:\s*[ap]m)?)?/gi;

/**
 * Parse a date out of a free-text workbook cell. Returns null for "TBD",
 * operator names, and anything without a recognisable date token.
 */
export function parseLooseDate(value: string | Date | null | undefined): Date | null {
  if (value == null) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  const text = clean(value);
  if (!text) return null;
  const match = text.match(DATE_TOKEN_RE);
  if (!match) return null;
  const token = match[0].replace(/\b(sept)\b/i, "Sep").replace(/,/g, "");
  const d = new Date(token);
  if (Number.isNaN(d.getTime())) return null;
  const y = d.getFullYear();
  if (y < 2000 || y > 2100) return null;
  return d;
}

/** Resolve when a row is due at the cross-dock, and on what evidence. */
export function slotTime(row: CrossDockShipment): { at: Date | null; source: SlotTimeSource } {
  const meta = row.importMeta ?? {};
  const appointment = parseLooseDate(clean(meta.crossdockAppointment));
  if (appointment) return { at: appointment, source: "appointment" };
  const reefer = parseLooseDate(clean(meta.reeferCutoff));
  if (reefer) return { at: reefer, source: "reefer_cutoff" };
  const docs = parseLooseDate(clean(meta.documentCutoff));
  if (docs) return { at: docs, source: "document_cutoff" };
  const etd = parseLooseDate(row.etd ?? null);
  if (etd) return { at: etd, source: "etd" };
  return { at: null, source: "none" };
}

// ── Building ───────────────────────────────────────────

/**
 * Only workbook rows belong on the board — manual/BOL shipments have no
 * cross-dock column at all, and listing them as "Unassigned" would invent
 * a to-do that does not exist.
 */
export function isCrossDockRow(row: CrossDockShipment): boolean {
  return !!row && !!row.importMeta && typeof row.importMeta === "object";
}

export function buildSlots(rows: CrossDockShipment[]): CrossDockSlot[] {
  const slots: CrossDockSlot[] = [];
  for (const row of rows ?? []) {
    if (!isCrossDockRow(row)) continue;
    const rawCrossdock = clean(row.importMeta?.crossdockAppointment);
    const lane = laneFor(rawCrossdock);
    const { at, source } = slotTime(row);
    slots.push({
      shipment: row,
      laneId: lane.id,
      laneLabel: lane.label,
      at,
      timeSource: source,
      rawCrossdock,
      collision: false,
    });
  }

  // Same lane, same minute, different booking = two trucks for one door.
  // Only explicit appointments count: two loads sharing a reefer cutoff is
  // normal (one vessel, one cutoff) and is not a dock conflict.
  const byMinute = new Map<string, CrossDockSlot[]>();
  for (const s of slots) {
    if (!s.at || s.timeSource !== "appointment" || s.laneId === "unassigned") continue;
    const key = `${s.laneId}|${Math.floor(s.at.getTime() / 60000)}`;
    const list = byMinute.get(key) ?? [];
    list.push(s);
    byMinute.set(key, list);
  }
  for (const list of byMinute.values()) {
    const bookings = new Set(list.map((s) => clean(s.shipment.reference) ?? s.shipment.id));
    if (bookings.size > 1) for (const s of list) s.collision = true;
  }

  return slots.sort(compareSlots);
}

function compareSlots(a: CrossDockSlot, b: CrossDockSlot): number {
  const ta = a.at ? a.at.getTime() : Number.MAX_SAFE_INTEGER;
  const tb = b.at ? b.at.getTime() : Number.MAX_SAFE_INTEGER;
  if (ta !== tb) return ta - tb;
  return (clean(a.shipment.reference) ?? "").localeCompare(clean(b.shipment.reference) ?? "");
}

/** Lanes to render: the three known docks always, then any others seen, Unassigned last. */
export function lanesFor(slots: CrossDockSlot[]): Lane[] {
  const others = new Map<string, Lane>();
  let hasUnassigned = false;
  for (const s of slots) {
    if (s.laneId === "unassigned") hasUnassigned = true;
    else if (s.laneId.startsWith("other:") && !others.has(s.laneId)) {
      others.set(s.laneId, { id: s.laneId, label: s.laneLabel, description: "Other cross-dock" });
    }
  }
  return [
    ...KNOWN_LANES,
    ...Array.from(others.values()).sort((a, b) => a.label.localeCompare(b.label)),
    ...(hasUnassigned ? [UNASSIGNED_LANE] : []),
  ];
}

// ── Calendar ───────────────────────────────────────────

/** Local-midnight Monday of the week containing `date`. */
export function startOfWeek(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const offset = (d.getDay() + 6) % 7; // Mon=0..Sun=6
  d.setDate(d.getDate() - offset);
  return d;
}

export function addDays(date: Date, n: number): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  d.setDate(d.getDate() + n);
  return d;
}

export function dayKey(date: Date): string {
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${m}-${d}`;
}

/**
 * Which week to open on: this week if anything is due in it, otherwise the
 * week of the next upcoming slot, otherwise the week of the latest slot.
 */
export function defaultWeekStart(slots: CrossDockSlot[], now: Date = new Date()): Date {
  const thisWeek = startOfWeek(now);
  const nextWeek = addDays(thisWeek, 7);
  const dated = slots.filter((s) => s.at).map((s) => s.at as Date);
  if (dated.length === 0) return thisWeek;
  if (dated.some((d) => d >= thisWeek && d < nextWeek)) return thisWeek;
  const upcoming = dated.filter((d) => d >= now).sort((a, b) => a.getTime() - b.getTime());
  if (upcoming.length) return startOfWeek(upcoming[0]);
  const latest = dated.reduce((a, b) => (a > b ? a : b));
  return startOfWeek(latest);
}

export interface WeekGrid {
  weekStart: Date;
  days: Date[];
  lanes: Lane[];
  /** cells[laneId][dayKey] → slots, time-ordered */
  cells: Record<string, Record<string, CrossDockSlot[]>>;
  /** Slots with no usable date, per lane — shown in a trailing column. */
  undated: Record<string, CrossDockSlot[]>;
  /** Count of dated slots in this week. */
  total: number;
}

export function buildWeekGrid(slots: CrossDockSlot[], weekStart: Date): WeekGrid {
  const start = startOfWeek(weekStart);
  const end = addDays(start, 7);
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));
  const lanes = lanesFor(slots);
  const cells: WeekGrid["cells"] = {};
  const undated: WeekGrid["undated"] = {};
  for (const lane of lanes) {
    cells[lane.id] = Object.fromEntries(days.map((d) => [dayKey(d), [] as CrossDockSlot[]]));
    undated[lane.id] = [];
  }
  let total = 0;
  for (const s of slots) {
    if (!s.at) {
      undated[s.laneId]?.push(s);
      continue;
    }
    if (s.at < start || s.at >= end) continue;
    cells[s.laneId]?.[dayKey(s.at)]?.push(s);
    total++;
  }
  return { weekStart: start, days, lanes, cells, undated, total };
}

/**
 * Shipping-history stats for the AI assistant (AI-8060).
 *
 * Blake asked for "AI memory" — the assistant should be able to answer
 * questions about the org's own shipping history ("how many loads did we move
 * to Rotterdam this quarter?", "which carrier is late most often for us?").
 *
 * `summarizeShippingHistory` is pure so it can be unit-tested without a DB.
 * `loadShippingHistory` does the org-scoped read. orgId always comes from the
 * session — never from model/tool input.
 */
import { and, desc, eq, gte } from 'drizzle-orm';
import { db } from '@/lib/db';
import { shipments } from '@/lib/db/schema';

export interface HistoryShipmentRow {
  reference: string | null;
  containerNumber: string | null;
  originPort: string | null;
  destPort: string | null;
  pol: string | null;
  pod: string | null;
  carrier: string | null;
  status: string;
  source: string;
  containerCount: number | null;
  weightKg: number | null;
  valueUsd: string | number | null;
  etd: Date | null;
  eta: Date | null;
  createdAt: Date;
}

export interface HistoryFilter {
  carrier?: string;
  lane?: string; // matches origin OR destination, case-insensitive substring
  status?: string;
}

export interface CountRow {
  name: string;
  shipments: number;
}

export interface ShippingHistorySummary {
  windowDays: number;
  totalShipments: number;
  totalContainers: number;
  totalWeightKg: number;
  totalValueUsd: number;
  byStatus: Record<string, number>;
  bySource: Record<string, number>;
  topCarriers: Array<CountRow & { delayed: number; delayRatePct: number }>;
  topLanes: CountRow[];
  avgPlannedTransitDays: number | null;
  recent: Array<{
    reference: string | null;
    lane: string;
    carrier: string | null;
    status: string;
    etd: string | null;
    eta: string | null;
  }>;
  note?: string;
}

const MAX_TOP = 5;
const MAX_RECENT = 10;

function clean(v: string | null | undefined): string | null {
  const t = v?.trim();
  return t ? t : null;
}

function origin(r: HistoryShipmentRow): string | null {
  return clean(r.originPort) ?? clean(r.pol);
}

function dest(r: HistoryShipmentRow): string | null {
  return clean(r.destPort) ?? clean(r.pod);
}

function laneOf(r: HistoryShipmentRow): string {
  return `${origin(r) ?? '?'} → ${dest(r) ?? '?'}`;
}

function toNumber(v: string | number | null): number {
  if (v === null || v === undefined) return 0;
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

function topCounts(map: Map<string, number>): CountRow[] {
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, MAX_TOP)
    .map(([name, n]) => ({ name, shipments: n }));
}

export function applyHistoryFilter(
  rows: HistoryShipmentRow[],
  filter: HistoryFilter = {},
): HistoryShipmentRow[] {
  const carrier = filter.carrier?.trim().toLowerCase();
  const lane = filter.lane?.trim().toLowerCase();
  const status = filter.status?.trim().toLowerCase();
  return rows.filter((r) => {
    if (carrier && !(r.carrier ?? '').toLowerCase().includes(carrier)) return false;
    if (status && r.status.toLowerCase() !== status) return false;
    if (lane) {
      const o = (origin(r) ?? '').toLowerCase();
      const d = (dest(r) ?? '').toLowerCase();
      if (!o.includes(lane) && !d.includes(lane)) return false;
    }
    return true;
  });
}

export function summarizeShippingHistory(
  rows: HistoryShipmentRow[],
  windowDays: number,
): ShippingHistorySummary {
  const byStatus: Record<string, number> = {};
  const bySource: Record<string, number> = {};
  const carriers = new Map<string, number>();
  const carrierDelays = new Map<string, number>();
  const lanes = new Map<string, number>();
  let totalContainers = 0;
  let totalWeightKg = 0;
  let totalValueUsd = 0;
  let transitSum = 0;
  let transitN = 0;

  for (const r of rows) {
    byStatus[r.status] = (byStatus[r.status] ?? 0) + 1;
    bySource[r.source] = (bySource[r.source] ?? 0) + 1;

    const c = clean(r.carrier);
    if (c) {
      carriers.set(c, (carriers.get(c) ?? 0) + 1);
      if (r.status === 'delayed') carrierDelays.set(c, (carrierDelays.get(c) ?? 0) + 1);
    }
    if (origin(r) || dest(r)) {
      const l = laneOf(r);
      lanes.set(l, (lanes.get(l) ?? 0) + 1);
    }

    // A row with no container_count is still one container-level shipment.
    totalContainers += r.containerCount && r.containerCount > 0 ? r.containerCount : 1;
    totalWeightKg += r.weightKg ?? 0;
    totalValueUsd += toNumber(r.valueUsd);

    if (r.etd && r.eta) {
      const days = (r.eta.getTime() - r.etd.getTime()) / 86_400_000;
      // Ignore inverted or absurd dates from OCR/workbook noise.
      if (days >= 0 && days <= 120) {
        transitSum += days;
        transitN++;
      }
    }
  }

  const recent = [...rows]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, MAX_RECENT)
    .map((r) => ({
      reference: clean(r.reference) ?? clean(r.containerNumber),
      lane: laneOf(r),
      carrier: clean(r.carrier),
      status: r.status,
      etd: r.etd ? r.etd.toISOString().slice(0, 10) : null,
      eta: r.eta ? r.eta.toISOString().slice(0, 10) : null,
    }));

  const summary: ShippingHistorySummary = {
    windowDays,
    totalShipments: rows.length,
    totalContainers: rows.length ? totalContainers : 0,
    totalWeightKg,
    totalValueUsd: Math.round(totalValueUsd * 100) / 100,
    byStatus,
    bySource,
    topCarriers: topCounts(carriers).map((row) => {
      const delayed = carrierDelays.get(row.name) ?? 0;
      return { ...row, delayed, delayRatePct: Math.round((delayed / row.shipments) * 1000) / 10 };
    }),
    topLanes: topCounts(lanes),
    avgPlannedTransitDays: transitN ? Math.round((transitSum / transitN) * 10) / 10 : null,
    recent,
  };
  if (rows.length === 0) {
    summary.note =
      'No shipments recorded for this organization in the selected window. Suggest uploading a Bill of Lading or importing the weekly workbook.';
  }
  return summary;
}

export function clampWindowDays(input: unknown): number {
  const n = typeof input === 'number' ? input : Number(input);
  if (!Number.isFinite(n) || n <= 0) return 90;
  return Math.min(Math.round(n), 730);
}

const HISTORY_ROW_LIMIT = 2000;

export async function loadShippingHistory(
  orgId: string,
  opts: { windowDays?: unknown } & HistoryFilter = {},
): Promise<ShippingHistorySummary> {
  const windowDays = clampWindowDays(opts.windowDays);
  const since = new Date(Date.now() - windowDays * 86_400_000);
  const rows = await db
    .select({
      reference: shipments.reference,
      containerNumber: shipments.containerNumber,
      originPort: shipments.originPort,
      destPort: shipments.destPort,
      pol: shipments.pol,
      pod: shipments.pod,
      carrier: shipments.carrier,
      status: shipments.status,
      source: shipments.source,
      containerCount: shipments.containerCount,
      weightKg: shipments.weightKg,
      valueUsd: shipments.valueUsd,
      etd: shipments.etd,
      eta: shipments.eta,
      createdAt: shipments.createdAt,
    })
    .from(shipments)
    .where(and(eq(shipments.orgId, orgId), gte(shipments.createdAt, since)))
    .orderBy(desc(shipments.createdAt))
    .limit(HISTORY_ROW_LIMIT);

  const summary = summarizeShippingHistory(applyHistoryFilter(rows, opts), windowDays);
  if (rows.length === HISTORY_ROW_LIMIT) {
    summary.note = `Only the most recent ${HISTORY_ROW_LIMIT} shipments in the window were analyzed.`;
  }
  return summary;
}

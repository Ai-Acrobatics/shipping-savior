/**
 * Cutoff alarm engine (Tier 0 roadmap item 2 — Blake's #1 field pain point).
 *
 * Scans shipments whose workbook importMeta carries reefer/document cutoff
 * timestamps and decides which need an alert: cutoff is within the warning
 * window (default 24h), not yet passed, and not already alerted (dedupe
 * state lives in importMeta.cutoffAlertsSent so no migration is needed).
 *
 * Timezone note: workbook cutoffs are stored without a timezone ("Sep 30
 * 2025 16:00" or ISO from Excel dates). Parsed as UTC/server-local they can
 * read up to ~8h EARLY for Pacific operations — early alerts are the safe
 * failure mode for a cutoff alarm.
 */

export type CutoffKind = 'reefer' | 'document';

export interface DueCutoff {
  shipmentId: string;
  orgId: string;
  kind: CutoffKind;
  cutoffAt: Date;
  hoursLeft: number;
  /** Human label for the push: container or booking reference. */
  label: string;
}

export interface CutoffShipmentRow {
  id: string;
  orgId: string | null;
  containerNumber: string | null;
  reference: string | null;
  pol: string | null;
  status: string;
  importMeta: unknown;
}

const TERMINAL_STATUSES = new Set(['delivered', 'cancelled']);

/** Parse a stored cutoff value (ISO string, US datetime, Excel text). */
export function parseCutoff(value: unknown): Date | null {
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
  if (typeof value !== 'string') return null;
  const s = value.trim();
  if (!s) return null;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

interface AlertsSentState {
  reefer?: string;
  document?: string;
}

function alertsSent(meta: Record<string, unknown>): AlertsSentState {
  const raw = meta.cutoffAlertsSent;
  return raw && typeof raw === 'object' ? (raw as AlertsSentState) : {};
}

/**
 * Pure selection: which (shipment, cutoff-kind) pairs are due for an alert
 * right now. A pair is due when its cutoff parses, lies in
 * (now, now + windowHours], and has no cutoffAlertsSent marker yet.
 */
export function findDueCutoffs(
  rows: CutoffShipmentRow[],
  now: Date = new Date(),
  windowHours = 24
): DueCutoff[] {
  const due: DueCutoff[] = [];
  const windowMs = windowHours * 3600_000;

  for (const row of rows) {
    if (!row.orgId) continue;
    if (TERMINAL_STATUSES.has(row.status)) continue;
    const meta =
      row.importMeta && typeof row.importMeta === 'object'
        ? (row.importMeta as Record<string, unknown>)
        : {};
    const sent = alertsSent(meta);

    const kinds: Array<{ kind: CutoffKind; value: unknown }> = [
      { kind: 'reefer', value: meta.reeferCutoff },
      { kind: 'document', value: meta.documentCutoff },
    ];

    for (const { kind, value } of kinds) {
      if (sent[kind]) continue; // already alerted
      const cutoffAt = parseCutoff(value);
      if (!cutoffAt) continue;
      const deltaMs = cutoffAt.getTime() - now.getTime();
      if (deltaMs <= 0 || deltaMs > windowMs) continue;
      due.push({
        shipmentId: row.id,
        orgId: row.orgId,
        kind,
        cutoffAt,
        hoursLeft: Math.max(1, Math.round(deltaMs / 3600_000)),
        label: row.containerNumber ?? row.reference ?? 'Shipment',
      });
    }
  }

  return due;
}

/** Push copy for one due cutoff. */
export function cutoffMessage(d: DueCutoff, pol: string | null): {
  title: string;
  body: string;
} {
  const kindLabel = d.kind === 'reefer' ? 'Reefer cutoff' : 'Doc cutoff';
  return {
    title: `⏰ ${kindLabel} in ~${d.hoursLeft}h — ${d.label}`,
    body: `${d.label}${pol ? ` at ${pol}` : ''}: ${kindLabel.toLowerCase()} ${d.cutoffAt.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}. Confirm gate-in / docs now.`,
  };
}

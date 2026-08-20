// ============================================================
// Notification producer helper
// AI-12013
//
// The one way anything in the app creates a notification. Producers (crons,
// webhooks, API routes) call `createNotifications` and get idempotency for
// free via `dedupeKey` — which is what lets an hourly cron re-scan the same
// shipment without re-buzzing anyone.
// ============================================================

import { db } from '@/lib/db';
import { notifications, type NewNotification } from '@/lib/db/schema';
import type { NotificationSeverity, NotificationType } from '@/lib/db/schema';

export interface CreateNotificationInput {
  orgId: string;
  /** Omit to fan out to the whole org. */
  userId?: string | null;
  type: NotificationType;
  severity?: NotificationSeverity;
  title: string;
  message: string;
  actionLabel?: string | null;
  actionUrl?: string | null;
  /**
   * Stable identity for the thing being alerted about, unique per org.
   * `cutoff:<shipmentId>:reefer`, `margin:<sku>:2026-05`. Omit only for
   * genuinely one-off notifications that should never be suppressed.
   */
  dedupeKey?: string | null;
  sourceTable?: string | null;
  sourceId?: string | null;
}

const toRow = (input: CreateNotificationInput): NewNotification => ({
  orgId: input.orgId,
  userId: input.userId ?? null,
  type: input.type,
  severity: input.severity ?? 'info',
  title: input.title.slice(0, 300),
  message: input.message,
  actionLabel: input.actionLabel?.slice(0, 100) ?? null,
  actionUrl: input.actionUrl?.slice(0, 500) ?? null,
  dedupeKey: input.dedupeKey?.slice(0, 200) ?? null,
  sourceTable: input.sourceTable ?? null,
  sourceId: input.sourceId ?? null,
});

/**
 * Insert notifications, skipping any whose (orgId, dedupeKey) already exists.
 *
 * Returns only the rows actually inserted, so a caller can tell "3 new
 * cutoffs" from "the same 3 cutoffs I saw an hour ago" and decide whether to
 * push. Duplicates inside the same batch are collapsed first — Postgres
 * rejects a statement that conflicts with itself even with ON CONFLICT.
 */
export async function createNotifications(
  inputs: CreateNotificationInput[]
): Promise<Array<typeof notifications.$inferSelect>> {
  if (inputs.length === 0) return [];

  const seen = new Set<string>();
  const rows: NewNotification[] = [];
  for (const input of inputs) {
    const row = toRow(input);
    if (row.dedupeKey) {
      const key = `${row.orgId}:${row.dedupeKey}`;
      if (seen.has(key)) continue;
      seen.add(key);
    }
    rows.push(row);
  }

  return db
    .insert(notifications)
    .values(rows)
    .onConflictDoNothing({
      target: [notifications.orgId, notifications.dedupeKey],
    })
    .returning();
}

export async function createNotification(
  input: CreateNotificationInput
): Promise<typeof notifications.$inferSelect | null> {
  const [row] = await createNotifications([input]);
  return row ?? null;
}

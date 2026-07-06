import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { shipments, pushTokens } from '@/lib/db/schema';
import { eq, inArray, sql } from 'drizzle-orm';
import {
  findDueCutoffs,
  cutoffMessage,
  type CutoffShipmentRow,
} from '@/lib/alerts/cutoff';
import { sendExpoPushes, type ExpoPushMessage } from '@/lib/alerts/expo-push';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * GET /api/cron/cutoff-alerts — hourly Vercel cron (see vercel.json).
 *
 * Finds reefer/document cutoffs due within 24h across all orgs and pushes an
 * alert to every registered mobile device in the shipment's org. Dedupe: a
 * marker is written to importMeta.cutoffAlertsSent AFTER a successful send,
 * so failed runs retry next hour and nobody gets double-buzzed.
 *
 * Auth: Vercel cron sends `Authorization: Bearer ${CRON_SECRET}`.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Only rows that even have a cutoff recorded — keeps the scan cheap.
  const candidates = (await db
    .select({
      id: shipments.id,
      orgId: shipments.orgId,
      containerNumber: shipments.containerNumber,
      reference: shipments.reference,
      pol: shipments.pol,
      status: shipments.status,
      importMeta: shipments.importMeta,
    })
    .from(shipments)
    .where(
      sql`${shipments.importMeta} ?| array['reeferCutoff','documentCutoff']`
    )) as Array<CutoffShipmentRow & { pol: string | null }>;

  const due = findDueCutoffs(candidates, new Date());
  if (due.length === 0) {
    return NextResponse.json({ scanned: candidates.length, due: 0, pushed: 0 });
  }

  // One token fetch for all affected orgs.
  const orgIds = [...new Set(due.map((d) => d.orgId))];
  const tokens = await db
    .select({
      token: pushTokens.token,
      orgId: pushTokens.orgId,
    })
    .from(pushTokens)
    .where(inArray(pushTokens.orgId, orgIds));

  const tokensByOrg = new Map<string, string[]>();
  for (const t of tokens) {
    const list = tokensByOrg.get(t.orgId) ?? [];
    list.push(t.token);
    tokensByOrg.set(t.orgId, list);
  }

  const polById = new Map(candidates.map((c) => [c.id, c.pol]));
  const messages: ExpoPushMessage[] = [];
  const messageMeta: Array<{ shipmentId: string; kind: string }> = [];
  for (const d of due) {
    const { title, body } = cutoffMessage(d, polById.get(d.shipmentId) ?? null);
    for (const token of tokensByOrg.get(d.orgId) ?? []) {
      messages.push({
        to: token,
        title,
        body,
        sound: 'default',
        channelId: 'shipments',
        data: { shipmentId: d.shipmentId, kind: d.kind, url: `/shipment/${d.shipmentId}` },
      });
      messageMeta.push({ shipmentId: d.shipmentId, kind: d.kind });
    }
  }

  const outcomes = messages.length ? await sendExpoPushes(messages) : [];

  // Prune tokens Expo says are gone.
  const deadTokens = [
    ...new Set(
      outcomes
        .filter((o) => o.error === 'DeviceNotRegistered')
        .map((o) => o.token)
    ),
  ];
  if (deadTokens.length) {
    await db.delete(pushTokens).where(inArray(pushTokens.token, deadTokens));
  }

  // Mark (shipment, kind) alerted when at least one push for it succeeded —
  // or when the org simply has no registered devices (nothing to retry).
  const succeeded = new Set<string>();
  outcomes.forEach((o, idx) => {
    if (o.ok) succeeded.add(`${messageMeta[idx].shipmentId}:${messageMeta[idx].kind}`);
  });
  const nowIso = new Date().toISOString();
  let marked = 0;
  for (const d of due) {
    const orgHasDevices = (tokensByOrg.get(d.orgId) ?? []).length > 0;
    if (orgHasDevices && !succeeded.has(`${d.shipmentId}:${d.kind}`)) continue;
    await db
      .update(shipments)
      .set({
        importMeta: sql`jsonb_set(coalesce(${shipments.importMeta}, '{}'::jsonb), ${sql.raw(`'{cutoffAlertsSent,${d.kind}}'`)}, to_jsonb(${nowIso}::text), true)`,
        updatedAt: new Date(),
      })
      .where(eq(shipments.id, d.shipmentId));
    marked++;
  }

  return NextResponse.json({
    scanned: candidates.length,
    due: due.length,
    pushed: outcomes.filter((o) => o.ok).length,
    failed: outcomes.filter((o) => !o.ok).length,
    deadTokensPruned: deadTokens.length,
    marked,
  });
}

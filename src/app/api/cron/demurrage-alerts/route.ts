import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { shipments, pushTokens } from '@/lib/db/schema';
import { eq, inArray, sql } from 'drizzle-orm';
import {
  findDueDemurrageAlerts,
  demurrageMessage,
  type DemurrageShipmentRow,
} from '@/lib/alerts/demurrage';
import { sendExpoPushes, type ExpoPushMessage } from '@/lib/alerts/expo-push';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * GET /api/cron/demurrage-alerts — hourly Vercel cron (see vercel.json).
 *
 * Raises a push BEFORE free time lapses, and again at each escalation, so the
 * first anyone hears about demurrage is not the invoice. Dedupe markers are
 * written to importMeta.demurrageAlertsSent keyed by `${clock}:${riskLevel}`
 * AFTER a successful send — same shape as cutoffAlertsSent, no migration.
 *
 * Auth: Vercel cron sends `Authorization: Bearer ${CRON_SECRET}`.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Only rows that can have a running clock: an arrival event recorded in
  // importMeta, or at minimum an ETA to estimate from. Keeps the scan cheap.
  const candidates = (await db
    .select({
      id: shipments.id,
      orgId: shipments.orgId,
      containerNumber: shipments.containerNumber,
      reference: shipments.reference,
      carrier: shipments.carrier,
      containerCount: shipments.containerCount,
      eta: shipments.eta,
      status: shipments.status,
      importMeta: shipments.importMeta,
    })
    .from(shipments)
    .where(
      sql`(${shipments.importMeta} ?| array['dischargedAt','availableAt','ata','actualArrival','gateOutAt'] OR ${shipments.eta} IS NOT NULL)`
    )) as DemurrageShipmentRow[];

  const due = findDueDemurrageAlerts(candidates, new Date());
  if (due.length === 0) {
    return NextResponse.json({ scanned: candidates.length, due: 0, pushed: 0 });
  }

  const orgIds = [...new Set(due.map((d) => d.orgId))];
  const tokens = await db
    .select({ token: pushTokens.token, orgId: pushTokens.orgId })
    .from(pushTokens)
    .where(inArray(pushTokens.orgId, orgIds));

  const tokensByOrg = new Map<string, string[]>();
  for (const t of tokens) {
    const list = tokensByOrg.get(t.orgId) ?? [];
    list.push(t.token);
    tokensByOrg.set(t.orgId, list);
  }

  const messages: ExpoPushMessage[] = [];
  const messageMeta: Array<{ shipmentId: string; stage: string }> = [];
  for (const d of due) {
    const { title, body } = demurrageMessage(d);
    for (const token of tokensByOrg.get(d.orgId) ?? []) {
      messages.push({
        to: token,
        title,
        body,
        sound: 'default',
        channelId: 'shipments',
        data: {
          shipmentId: d.shipmentId,
          kind: d.clock,
          riskLevel: d.riskLevel,
          url: `/shipment/${d.shipmentId}`,
        },
      });
      messageMeta.push({ shipmentId: d.shipmentId, stage: d.stage });
    }
  }

  const outcomes = messages.length ? await sendExpoPushes(messages) : [];

  const deadTokens = [
    ...new Set(
      outcomes.filter((o) => o.error === 'DeviceNotRegistered').map((o) => o.token)
    ),
  ];
  if (deadTokens.length) {
    await db.delete(pushTokens).where(inArray(pushTokens.token, deadTokens));
  }

  // Mark a stage alerted when at least one push landed, or when the org has no
  // registered devices at all (nothing to retry next hour).
  const succeeded = new Set<string>();
  outcomes.forEach((o, idx) => {
    if (o.ok) succeeded.add(`${messageMeta[idx].shipmentId}:${messageMeta[idx].stage}`);
  });

  const nowIso = new Date().toISOString();
  let marked = 0;
  for (const d of due) {
    const orgHasDevices = (tokensByOrg.get(d.orgId) ?? []).length > 0;
    if (orgHasDevices && !succeeded.has(`${d.shipmentId}:${d.stage}`)) continue;
    await db
      .update(shipments)
      .set({
        // Merge rather than jsonb_set: `jsonb_set(.., '{parent,child}', .., true)`
        // only creates the LAST path element. With no `demurrageAlertsSent`
        // object yet — i.e. the first alert for every shipment — it returns the
        // input untouched, the UPDATE still reports success, and the stage
        // re-alerts every hour forever. Concatenating built objects creates the
        // parent and preserves every sibling key. Verified against Postgres 16.
        importMeta: sql`
          coalesce(${shipments.importMeta}, '{}'::jsonb) || jsonb_build_object(
            'demurrageAlertsSent',
            coalesce(${shipments.importMeta} -> 'demurrageAlertsSent', '{}'::jsonb)
              || jsonb_build_object(${d.stage}::text, ${nowIso}::text)
          )`,
        updatedAt: new Date(),
      })
      .where(eq(shipments.id, d.shipmentId));
    marked++;
  }

  return NextResponse.json({
    scanned: candidates.length,
    due: due.length,
    accruing: due.filter((d) => d.riskLevel === 'accruing').length,
    pushed: outcomes.filter((o) => o.ok).length,
    failed: outcomes.filter((o) => !o.ok).length,
    deadTokensPruned: deadTokens.length,
    marked,
  });
}

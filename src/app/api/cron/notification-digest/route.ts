import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  notificationPreferences,
  notificationReads,
  notifications,
  orgMembers,
  users,
} from "@/lib/db/schema";
import { and, eq, gt, inArray, isNull, or } from "drizzle-orm";
import { getAppBaseUrl, sendEmail } from "@/lib/auth/email";
import {
  isDigestDue,
  resolvePreferences,
  shouldDeliver,
  type EffectivePreferences,
} from "@/lib/notifications/preferences";
import {
  renderDigest,
  type DigestNotification,
  type DigestPeriod,
} from "@/lib/notifications/digest";
import type { DigestFrequency } from "@/lib/db/schema";

/** `immediate` rides this same hourly cron — see digestIntervalMs. */
function digestPeriod(frequency: DigestFrequency): DigestPeriod {
  if (frequency === "weekly") return "week";
  if (frequency === "immediate") return "hour";
  return "day";
}

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * GET /api/cron/notification-digest — hourly Vercel cron (see vercel.json).
 *
 * Walks every org membership, resolves that user's preferences, and emails a
 * digest to anyone whose interval has elapsed. Runs hourly rather than daily
 * so quiet hours and weekly cadences are respected per-user instead of
 * everyone getting mail at whatever hour the daily cron happens to fire.
 *
 * Idempotency: `digestLastSentAt` is written only after a successful send,
 * so a failed run retries next hour rather than skipping a user's digest.
 * `emailedAt` is stamped on the included notifications so the next digest
 * starts where this one stopped.
 *
 * Auth: Vercel cron sends `Authorization: Bearer ${CRON_SECRET}`.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const baseUrl = getAppBaseUrl();

  const memberships = await db
    .select({
      userId: orgMembers.userId,
      orgId: orgMembers.orgId,
      email: users.email,
      name: users.name,
      mutedTypes: notificationPreferences.mutedTypes,
      minSeverity: notificationPreferences.minSeverity,
      inAppEnabled: notificationPreferences.inAppEnabled,
      pushEnabled: notificationPreferences.pushEnabled,
      emailDigest: notificationPreferences.emailDigest,
      quietHoursStart: notificationPreferences.quietHoursStart,
      quietHoursEnd: notificationPreferences.quietHoursEnd,
      timezone: notificationPreferences.timezone,
      digestLastSentAt: notificationPreferences.digestLastSentAt,
    })
    .from(orgMembers)
    .innerJoin(users, eq(orgMembers.userId, users.id))
    .leftJoin(
      notificationPreferences,
      and(
        eq(notificationPreferences.userId, orgMembers.userId),
        eq(notificationPreferences.orgId, orgMembers.orgId)
      )
    );

  let considered = 0;
  let due = 0;
  let sent = 0;
  let empty = 0;
  let failed = 0;

  for (const membership of memberships) {
    considered++;

    const prefs: EffectivePreferences = resolvePreferences(
      membership.emailDigest
        ? {
            mutedTypes: (membership.mutedTypes ?? []) as EffectivePreferences["mutedTypes"],
            minSeverity: membership.minSeverity ?? undefined,
            inAppEnabled: membership.inAppEnabled ?? undefined,
            pushEnabled: membership.pushEnabled ?? undefined,
            emailDigest: membership.emailDigest,
            quietHoursStart: membership.quietHoursStart,
            quietHoursEnd: membership.quietHoursEnd,
            timezone: membership.timezone ?? undefined,
            digestLastSentAt: membership.digestLastSentAt,
          }
        : null
    );

    if (!isDigestDue(prefs, now)) continue;
    due++;

    // Everything in this user's audience they haven't already been emailed
    // about and haven't already read in-app. Reading it in the bell is a
    // clear signal they don't need it again in their inbox.
    const since = prefs.digestLastSentAt ? new Date(prefs.digestLastSentAt) : null;
    const conditions = [
      eq(notifications.orgId, membership.orgId),
      or(eq(notifications.userId, membership.userId), isNull(notifications.userId)),
      isNull(notifications.emailedAt),
      isNull(notificationReads.id),
    ];
    if (since) conditions.push(gt(notifications.createdAt, since));

    const rows = await db
      .select({
        id: notifications.id,
        type: notifications.type,
        severity: notifications.severity,
        title: notifications.title,
        message: notifications.message,
        actionLabel: notifications.actionLabel,
        actionUrl: notifications.actionUrl,
        createdAt: notifications.createdAt,
      })
      .from(notifications)
      .leftJoin(
        notificationReads,
        and(
          eq(notificationReads.notificationId, notifications.id),
          eq(notificationReads.userId, membership.userId)
        )
      )
      .where(and(...conditions))
      .limit(200);

    // Apply the same mute/severity rules the in-app feed uses, so a digest
    // never surfaces something the user muted.
    const deliverable: DigestNotification[] = rows.filter((row) =>
      shouldDeliver(prefs, { type: row.type, severity: row.severity }, "email", now)
    );

    const digest = renderDigest(deliverable, {
      baseUrl,
      period: digestPeriod(prefs.emailDigest),
      recipientName: membership.name,
    });

    if (!digest) {
      // Nothing to say. Still advance the clock so we don't re-scan this
      // user every hour for the rest of the period.
      empty++;
      await touchDigestClock(membership.userId, membership.orgId, now, prefs);
      continue;
    }

    const result = await sendEmail({
      to: membership.email,
      subject: digest.subject,
      html: digest.html,
      text: digest.text,
    });

    if (!result.ok && !result.skipped) {
      // Leave digestLastSentAt alone so next hour retries with the same set.
      failed++;
      continue;
    }

    sent++;
    await db
      .update(notifications)
      .set({ emailedAt: now })
      .where(inArray(notifications.id, digest.notificationIds));
    await touchDigestClock(membership.userId, membership.orgId, now, prefs);
  }

  return NextResponse.json({ considered, due, sent, empty, failed });
}

/**
 * Advance `digestLastSentAt`. Upserts because a user on the default `daily`
 * setting has no preferences row until now — without this they'd be "due"
 * on every single run forever.
 */
async function touchDigestClock(
  userId: string,
  orgId: string,
  now: Date,
  prefs: EffectivePreferences
) {
  await db
    .insert(notificationPreferences)
    .values({
      userId,
      orgId,
      mutedTypes: prefs.mutedTypes,
      minSeverity: prefs.minSeverity,
      inAppEnabled: prefs.inAppEnabled,
      pushEnabled: prefs.pushEnabled,
      emailDigest: prefs.emailDigest,
      quietHoursStart: prefs.quietHoursStart,
      quietHoursEnd: prefs.quietHoursEnd,
      timezone: prefs.timezone,
      digestLastSentAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: [notificationPreferences.userId, notificationPreferences.orgId],
      set: { digestLastSentAt: now, updatedAt: now },
    });
}

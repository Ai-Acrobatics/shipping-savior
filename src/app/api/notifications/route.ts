import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notificationReads, notifications } from "@/lib/db/schema";
import { and, desc, eq, isNull, or, sql, type SQL } from "drizzle-orm";
import { NOTIFICATION_TYPE_LABELS } from "@/lib/notifications/preferences";

/**
 * GET /api/notifications — the bell feed (AI-12013).
 *
 * Returns notifications addressed to this user plus org-wide ones
 * (`user_id IS NULL`), each annotated with THIS user's read state. Read
 * state lives in its own table because one org-wide notification is read by
 * each member independently.
 *
 * ?unread=1  only unread
 * ?limit=    default 30, max 100
 */

const DEFAULT_LIMIT = 30;
const MAX_LIMIT = 100;

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { orgId, id: userId } = session.user;

  const { searchParams } = new URL(request.url);
  const unreadOnly = searchParams.get("unread") === "1";
  const limit = Math.min(
    Math.max(parseInt(searchParams.get("limit") ?? `${DEFAULT_LIMIT}`, 10) || DEFAULT_LIMIT, 1),
    MAX_LIMIT
  );

  try {
    // Addressed to me, or to nobody in particular within my org.
    const audience = and(
      eq(notifications.orgId, orgId),
      or(eq(notifications.userId, userId), isNull(notifications.userId))
    ) as SQL;

    const conditions: SQL[] = [audience];
    if (unreadOnly) conditions.push(isNull(notificationReads.id) as SQL);

    const rows = await db
      .select({
        id: notifications.id,
        type: notifications.type,
        severity: notifications.severity,
        title: notifications.title,
        message: notifications.message,
        actionLabel: notifications.actionLabel,
        actionUrl: notifications.actionUrl,
        sourceTable: notifications.sourceTable,
        sourceId: notifications.sourceId,
        createdAt: notifications.createdAt,
        readAt: notificationReads.readAt,
        orgWide: sql<boolean>`${notifications.userId} is null`,
      })
      .from(notifications)
      .leftJoin(
        notificationReads,
        and(
          eq(notificationReads.notificationId, notifications.id),
          eq(notificationReads.userId, userId)
        )
      )
      .where(and(...conditions))
      .orderBy(desc(notifications.createdAt))
      .limit(limit);

    // Unread count is always the full unread count, not the count of the
    // page just returned — the badge would otherwise cap at `limit`.
    const [{ unread }] = await db
      .select({ unread: sql<number>`count(*)::int` })
      .from(notifications)
      .leftJoin(
        notificationReads,
        and(
          eq(notificationReads.notificationId, notifications.id),
          eq(notificationReads.userId, userId)
        )
      )
      .where(and(audience, isNull(notificationReads.id)));

    return NextResponse.json({
      notifications: rows.map((row) => ({ ...row, read: row.readAt !== null })),
      unreadCount: unread ?? 0,
      typeLabels: NOTIFICATION_TYPE_LABELS,
    });
  } catch (error) {
    console.error("Failed to fetch notifications:", error);
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}

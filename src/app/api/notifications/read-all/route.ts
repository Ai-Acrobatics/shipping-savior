import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notificationReads, notifications } from "@/lib/db/schema";
import { and, eq, isNull, or } from "drizzle-orm";

/**
 * POST /api/notifications/read-all — clear the badge (AI-12013).
 *
 * Inserts a read row for every currently-unread notification in this user's
 * audience. Deliberately snapshot-based rather than "mark everything before
 * timestamp T": a notification that arrives mid-request stays unread, which
 * is the behaviour a user expects from a button they just clicked.
 */
export async function POST() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { orgId, id: userId } = session.user;

  try {
    const unread = await db
      .select({ id: notifications.id })
      .from(notifications)
      .leftJoin(
        notificationReads,
        and(
          eq(notificationReads.notificationId, notifications.id),
          eq(notificationReads.userId, userId)
        )
      )
      .where(
        and(
          eq(notifications.orgId, orgId),
          or(eq(notifications.userId, userId), isNull(notifications.userId)),
          isNull(notificationReads.id)
        )
      );

    if (unread.length === 0) {
      return NextResponse.json({ marked: 0 });
    }

    await db
      .insert(notificationReads)
      .values(unread.map((row) => ({ notificationId: row.id, userId })))
      .onConflictDoNothing({
        target: [notificationReads.notificationId, notificationReads.userId],
      });

    return NextResponse.json({ marked: unread.length });
  } catch (error) {
    console.error("Failed to mark all notifications read:", error);
    return NextResponse.json({ error: "Failed to mark all read" }, { status: 500 });
  }
}

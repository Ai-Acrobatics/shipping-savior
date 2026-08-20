import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notificationReads, notifications } from "@/lib/db/schema";
import { and, eq, isNull, or } from "drizzle-orm";

/**
 * PATCH /api/notifications/[id] — mark one notification read or unread
 * (AI-12013).
 *
 * `{ read: true }` inserts this user's read row; `{ read: false }` deletes
 * it. The notification itself is never mutated — marking an org-wide
 * notification read must not clear it for the rest of the team.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const { orgId, id: userId } = session.user;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (typeof body.read !== "boolean") {
    return NextResponse.json({ error: "read must be a boolean" }, { status: 400 });
  }

  try {
    // Confirm the notification exists AND is addressed to this user's
    // audience. 404 on anything else so a probe can't enumerate ids.
    const [target] = await db
      .select({ id: notifications.id })
      .from(notifications)
      .where(
        and(
          eq(notifications.id, id),
          eq(notifications.orgId, orgId),
          or(eq(notifications.userId, userId), isNull(notifications.userId))
        )
      )
      .limit(1);

    if (!target) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (body.read) {
      await db
        .insert(notificationReads)
        .values({ notificationId: id, userId })
        .onConflictDoNothing({
          target: [notificationReads.notificationId, notificationReads.userId],
        });
    } else {
      await db
        .delete(notificationReads)
        .where(
          and(
            eq(notificationReads.notificationId, id),
            eq(notificationReads.userId, userId)
          )
        );
    }

    return NextResponse.json({ id, read: body.read });
  } catch (error) {
    console.error("Failed to update notification read state:", error);
    return NextResponse.json({ error: "Failed to update notification" }, { status: 500 });
  }
}

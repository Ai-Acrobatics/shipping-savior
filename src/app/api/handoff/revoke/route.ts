/**
 * Revoke a customs broker handoff link — AI-12018
 *
 * POST /api/handoff/revoke  { handoffId }
 *
 * Kills the share link immediately. Revocation is separate from expiry on
 * purpose: the broker-facing page says "revoked by the sender", not "expired",
 * because those two prompt different next actions — one is "ask for a new
 * link", the other is "stop, something changed".
 *
 * Idempotent. Re-revoking keeps the original revocation timestamp, which is
 * the one that answers "when did we pull it back".
 */

import { NextRequest, NextResponse } from "next/server";
import { and, eq, isNull } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { brokerHandoffs } from "@/lib/db/schema";
import { hasPermission, type OrgRoleType } from "@/lib/auth/permissions";
import { resolveLinkState } from "@/lib/handoff";

export const runtime = "nodejs";

const bodySchema = z.object({ handoffId: z.string().uuid() });

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!hasPermission((session.user.role ?? "viewer") as OrgRoleType, "handoff:share")) {
    return NextResponse.json(
      { error: "Your role cannot revoke handoff links. Ask an admin." },
      { status: 403 }
    );
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "A handoffId is required." }, { status: 400 });
  }

  try {
    const now = new Date();
    // Scoped to the caller's org and to links that are not already revoked —
    // an id is not authorization, and the first revocation is the one that counts.
    const updated = await db
      .update(brokerHandoffs)
      .set({ revokedAt: now })
      .where(
        and(
          eq(brokerHandoffs.id, parsed.data.handoffId),
          eq(brokerHandoffs.orgId, session.user.orgId),
          isNull(brokerHandoffs.revokedAt)
        )
      )
      .returning({ id: brokerHandoffs.id, revokedAt: brokerHandoffs.revokedAt });

    if (updated.length) {
      return NextResponse.json({
        success: true,
        handoffId: updated[0].id,
        revokedAt: updated[0].revokedAt,
        link: resolveLinkState({ expiresAt: now, revokedAt: updated[0].revokedAt }),
      });
    }

    // Nothing updated: either it is already revoked, or it is not ours.
    const [existing] = await db
      .select({
        id: brokerHandoffs.id,
        revokedAt: brokerHandoffs.revokedAt,
        expiresAt: brokerHandoffs.expiresAt,
      })
      .from(brokerHandoffs)
      .where(
        and(
          eq(brokerHandoffs.id, parsed.data.handoffId),
          eq(brokerHandoffs.orgId, session.user.orgId)
        )
      )
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: "Handoff package not found." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      handoffId: existing.id,
      revokedAt: existing.revokedAt,
      alreadyRevoked: true,
      link: resolveLinkState({ expiresAt: existing.expiresAt, revokedAt: existing.revokedAt }),
    });
  } catch (error) {
    console.error("[handoff/revoke] Failed to revoke:", error);
    return NextResponse.json({ error: "Failed to revoke the handoff link." }, { status: 500 });
  }
}

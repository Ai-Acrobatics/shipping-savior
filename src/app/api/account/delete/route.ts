import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  users,
  organizations,
  orgMembers,
  shipments,
  calculations,
  contracts,
  contractLanes,
  invites,
  bolDocuments,
  auditLogs,
} from "@/lib/db/schema";
import { and, count, eq, inArray } from "drizzle-orm";

const CONFIRM_PHRASE = "DELETE MY ACCOUNT";

/**
 * POST /api/account/delete — GDPR Art. 17 right-to-erasure (AI-8780).
 *
 * Requires body {"confirm":"DELETE MY ACCOUNT"}. Behavior:
 *   - Sole member of the org  → purge org-scoped children (contract lanes,
 *     contracts, shipments, calculations, invites, BOL documents), the
 *     membership, the organization, then the user row.
 *   - Owner with other members → 409: ownership must be transferred first.
 *   - Non-owner member         → delete only their membership + user row.
 *
 * An audit log entry is written BEFORE any deletion. The auditActionEnum has
 * no dedicated account-deletion value and the schema is frozen for this task,
 * so we use 'logout' (the closest existing terminal-auth event) with
 * metadata.event = "account_deleted" carrying the real semantics. The
 * audit row survives the user/org deletion because both FKs are
 * onDelete: 'set null'.
 */
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id: userId, orgId } = session.user;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  if (
    !body ||
    typeof body !== "object" ||
    (body as { confirm?: unknown }).confirm !== CONFIRM_PHRASE
  ) {
    return NextResponse.json(
      { error: `Confirmation required: send {"confirm":"${CONFIRM_PHRASE}"}` },
      { status: 400 }
    );
  }

  try {
    const memberRows = await db
      .select()
      .from(orgMembers)
      .where(and(eq(orgMembers.orgId, orgId), eq(orgMembers.userId, userId)))
      .limit(1);
    const membership = memberRows[0] ?? null;

    const countRows = await db
      .select({ total: count() })
      .from(orgMembers)
      .where(eq(orgMembers.orgId, orgId));
    const memberCount = Number(countRows[0]?.total ?? 0);

    const soleMember = memberCount <= 1;
    if (!soleMember && membership?.role === "owner") {
      return NextResponse.json(
        { error: "Transfer ownership before deleting your account" },
        { status: 409 }
      );
    }

    await db.transaction(async (tx) => {
      // Audit BEFORE deletion — FKs are set-null so this row outlives the user/org.
      await tx.insert(auditLogs).values({
        orgId,
        userId,
        action: "logout",
        metadata: { event: "account_deleted", userId, orgId, soleMember },
      });

      if (soleMember) {
        // Children first. contractLanes has no orgId, so resolve the org's
        // contract ids and delete lanes explicitly (cascade would also catch
        // them, but we keep the erasure order explicit and auditable).
        const orgContracts = await tx
          .select({ id: contracts.id })
          .from(contracts)
          .where(eq(contracts.orgId, orgId));
        if (orgContracts.length > 0) {
          await tx.delete(contractLanes).where(
            inArray(
              contractLanes.contractId,
              orgContracts.map((c) => c.id)
            )
          );
        }
        await tx.delete(contracts).where(eq(contracts.orgId, orgId));
        await tx.delete(shipments).where(eq(shipments.orgId, orgId));
        await tx.delete(calculations).where(eq(calculations.orgId, orgId));
        await tx.delete(invites).where(eq(invites.orgId, orgId));
        await tx.delete(bolDocuments).where(eq(bolDocuments.orgId, orgId));
        await tx.delete(orgMembers).where(eq(orgMembers.orgId, orgId));
        await tx.delete(organizations).where(eq(organizations.id, orgId));
      } else {
        // Non-owner member leaving a multi-member org: remove only their
        // membership; org data created by them stays with the org.
        await tx
          .delete(orgMembers)
          .where(and(eq(orgMembers.orgId, orgId), eq(orgMembers.userId, userId)));
      }

      await tx.delete(users).where(eq(users.id, userId));
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete account:", error);
    return NextResponse.json({ error: "Failed to delete account" }, { status: 500 });
  }
}

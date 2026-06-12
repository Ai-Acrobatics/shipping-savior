import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  users,
  organizations,
  orgMembers,
  shipments,
  calculations,
  contracts,
} from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";

/**
 * GET /api/account/export — GDPR Art. 15 data access / portability export (AI-8780).
 *
 * Returns a downloadable JSON file containing the caller's personal data:
 *   - user row (passwordHash is ALWAYS stripped)
 *   - their organization and their orgMember row
 *   - org-scoped shipments, calculations, and contracts when the caller is
 *     owner/admin; otherwise only the rows the caller created themselves.
 */
export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id: userId, orgId, role } = session.user;
  const orgWide = role === "owner" || role === "admin";

  try {
    const userRows = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    const orgRows = await db
      .select()
      .from(organizations)
      .where(eq(organizations.id, orgId))
      .limit(1);
    const memberRows = await db
      .select()
      .from(orgMembers)
      .where(and(eq(orgMembers.orgId, orgId), eq(orgMembers.userId, userId)))
      .limit(1);

    const shipmentRows = await db
      .select()
      .from(shipments)
      .where(
        orgWide
          ? eq(shipments.orgId, orgId)
          : and(eq(shipments.orgId, orgId), eq(shipments.userId, userId))
      );
    const calculationRows = await db
      .select()
      .from(calculations)
      .where(
        orgWide
          ? eq(calculations.orgId, orgId)
          : and(eq(calculations.orgId, orgId), eq(calculations.userId, userId))
      );
    const contractRows = await db
      .select()
      .from(contracts)
      .where(
        orgWide
          ? eq(contracts.orgId, orgId)
          : and(eq(contracts.orgId, orgId), eq(contracts.userId, userId))
      );

    const userRow = userRows[0] ?? null;
    if (!userRow) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    // Never ship the credential hash, even though we selected the full row —
    // defensive strip in case the query shape changes.
    const { passwordHash: _passwordHash, ...safeUser } = userRow as Record<string, unknown> & {
      passwordHash?: string;
    };

    const payload = {
      exportedAt: new Date().toISOString(),
      user: safeUser,
      org: orgRows[0] ?? null,
      orgMember: memberRows[0] ?? null,
      shipments: shipmentRows,
      calculations: calculationRows,
      contracts: contractRows,
    };

    return new NextResponse(JSON.stringify(payload, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": 'attachment; filename="account-export.json"',
      },
    });
  } catch (error) {
    console.error("Failed to build account export:", error);
    return NextResponse.json({ error: "Failed to build account export" }, { status: 500 });
  }
}

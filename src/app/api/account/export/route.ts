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
  auditLogs,
  cookieConsents,
} from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { createZip, toCsv, type ZipEntry } from "@/lib/zip";

/**
 * GET /api/account/export — GDPR Art. 15 data access / portability export (AI-8780).
 *
 * Returns a ZIP archive of the caller's personal data:
 *   - profile.json          user row (passwordHash is ALWAYS stripped) + org + membership
 *   - shipments.csv         org-scoped or self-scoped depending on role
 *   - calculations.csv      "
 *   - contracts.csv         "
 *   - audit-logs.csv        security events attributable to the caller
 *   - cookie-consents.csv   consent history recorded by /api/consent
 *   - README.txt            what each file is, so the export is intelligible
 *
 * Scoping: owner/admin get the whole organization (they are the controller for
 * that data); member/viewer get only rows they created themselves, so an export
 * can never become a lateral data-exfiltration path.
 *
 * CSV is chosen for the tabular data because Art. 20 asks for a "commonly used,
 * machine-readable format" — a spreadsheet the data subject can actually open.
 */
export async function GET() {
  // `auth()` can resolve to a session object whose `user` is undefined (e.g.
  // auth.js returns a shell session when the host is untrusted or the JWT fails
  // to decode). Checking only `!session` let that case through to the
  // destructure below and turned an unauthenticated call into a 500 instead of
  // a 401 — guard on the fields we actually read.
  const session = await auth();
  if (!session?.user?.id || !session.user.orgId) {
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
    const auditRows = await db
      .select()
      .from(auditLogs)
      .where(
        orgWide
          ? eq(auditLogs.orgId, orgId)
          : and(eq(auditLogs.orgId, orgId), eq(auditLogs.userId, userId))
      );
    // Consent is always personal to the caller — never org-wide, even for owners.
    const consentRows = await db
      .select()
      .from(cookieConsents)
      .where(eq(cookieConsents.userId, userId));

    const userRow = userRows[0] ?? null;
    if (!userRow) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    // Never ship the credential hash, even though we selected the full row —
    // defensive strip in case the query shape changes.
    const { passwordHash: _passwordHash, ...safeUser } = userRow as Record<string, unknown> & {
      passwordHash?: string;
    };

    const exportedAt = new Date();
    const profile = {
      exportedAt: exportedAt.toISOString(),
      scope: orgWide ? "organization" : "self",
      user: safeUser,
      org: orgRows[0] ?? null,
      orgMember: memberRows[0] ?? null,
    };

    const entries: ZipEntry[] = [
      {
        name: "README.txt",
        content: [
          "Shipping Savior — personal data export",
          `Generated: ${exportedAt.toISOString()}`,
          `Scope: ${orgWide ? "entire organization (you are an owner/admin)" : "records you created"}`,
          "",
          "Files in this archive:",
          "  profile.json         Your account, organization, and membership records.",
          "  shipments.csv        Shipment records.",
          "  calculations.csv     Saved calculator runs.",
          "  contracts.csv        Contract records.",
          "  audit-logs.csv       Security events (logins, invites, data changes).",
          "  cookie-consents.csv  Your cookie-consent history.",
          "",
          "Your password is never included in an export — it is stored only as a",
          "one-way bcrypt hash and cannot be exported or recovered.",
          "",
          "Questions about this export, or want your data deleted?",
          "  privacy@shippingsavior.com",
          "",
        ].join("\n"),
      },
      { name: "profile.json", content: JSON.stringify(profile, null, 2) },
      { name: "shipments.csv", content: toCsv(shipmentRows as Record<string, unknown>[]) },
      { name: "calculations.csv", content: toCsv(calculationRows as Record<string, unknown>[]) },
      { name: "contracts.csv", content: toCsv(contractRows as Record<string, unknown>[]) },
      { name: "audit-logs.csv", content: toCsv(auditRows as Record<string, unknown>[]) },
      { name: "cookie-consents.csv", content: toCsv(consentRows as Record<string, unknown>[]) },
    ];

    const zip = createZip(entries, exportedAt);
    const filename = `shipping-savior-export-${exportedAt.toISOString().slice(0, 10)}.zip`;

    // createZip allocates a buffer sized exactly to the archive, so handing the
    // ArrayBuffer to the Response is a hand-off rather than a copy. (Uint8Array
    // itself is not in the DOM `BodyInit` union under this tsconfig lib.)
    const body = zip.buffer as ArrayBuffer;

    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": String(zip.length),
        // An export is personal data — never let a CDN or browser cache it.
        "Cache-Control": "no-store, private",
      },
    });
  } catch (error) {
    console.error("Failed to build account export:", error);
    return NextResponse.json({ error: "Failed to build account export" }, { status: 500 });
  }
}

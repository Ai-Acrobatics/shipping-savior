import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { shipments, shipmentStatusEnum } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const VALID_STATUSES = shipmentStatusEnum.enumValues;

/**
 * GET/PATCH /api/shipments/[id] — single-shipment read + review-queue edits
 * (AI-10777).
 *
 * Workbook imports flag incomplete rows via importMeta.reviewIssues. PATCH
 * lets the review UI fill missing fields and recomputes reviewIssues so a
 * fully-fixed row drops out of the queue. Org scoping returns 404 (not 403)
 * on cross-org access so shipment existence is never leaked.
 */

type ImportMeta = Record<string, unknown> & { reviewIssues?: unknown };

async function loadShipment(id: string) {
  const [row] = await db
    .select()
    .from(shipments)
    .where(eq(shipments.id, id))
    .limit(1);
  return row ?? null;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  try {
    const shipment = await loadShipment(id);
    if (!shipment || shipment.orgId !== session.user.orgId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ shipment });
  } catch (error) {
    console.error("Failed to fetch shipment:", error);
    return NextResponse.json({ error: "Failed to fetch shipment" }, { status: 500 });
  }
}

// Fields PATCH-able straight onto the shipments row.
const STRING_FIELDS = [
  "containerNumber",
  "vesselName",
  "voyageNumber",
  "pol",
  "pod",
  "carrier",
] as const;
const NUMBER_FIELDS = ["weightKg", "quantity"] as const;

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  let existing;
  try {
    existing = await loadShipment(id);
  } catch (error) {
    console.error("Failed to load shipment:", error);
    return NextResponse.json({ error: "Failed to update shipment" }, { status: 500 });
  }
  if (!existing || existing.orgId !== session.user.orgId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updates: Record<string, unknown> = {};

  for (const field of STRING_FIELDS) {
    if (field in body) {
      const value = body[field];
      if (value !== null && typeof value !== "string") {
        return NextResponse.json({ error: `${field} must be a string` }, { status: 400 });
      }
      updates[field] = typeof value === "string" && value.trim().length ? value.trim() : null;
    }
  }

  for (const field of NUMBER_FIELDS) {
    if (field in body) {
      const value = body[field];
      if (value !== null && (typeof value !== "number" || !Number.isFinite(value))) {
        return NextResponse.json({ error: `${field} must be a number` }, { status: 400 });
      }
      updates[field] = typeof value === "number" ? Math.round(value) : null;
    }
  }

  // Same contract as POST /api/shipments: 400 on unparseable dates.
  const parseDate = (value: unknown, field: string): Date | null | { error: string } => {
    if (!value) return null;
    const d = new Date(value as string);
    return isNaN(d.getTime()) ? { error: `Invalid date for ${field}` } : d;
  };
  for (const field of ["etd", "eta"] as const) {
    if (field in body) {
      const parsed = parseDate(body[field], field);
      if (parsed && "error" in parsed) {
        return NextResponse.json({ error: parsed.error }, { status: 400 });
      }
      updates[field] = parsed;
    }
  }

  // Invalid status is rejected with 400 (not silently coerced) — review edits
  // should never quietly change a status the user didn't pick.
  if ("status" in body) {
    const status = body.status;
    if (
      typeof status !== "string" ||
      !(VALID_STATUSES as readonly string[]).includes(status)
    ) {
      return NextResponse.json(
        { error: `Invalid status. Expected one of: ${VALID_STATUSES.join(", ")}` },
        { status: 400 }
      );
    }
    updates.status = status as (typeof VALID_STATUSES)[number];
  }

  // importMeta-resident fields (Blake's board has no dedicated columns).
  const currentMeta: ImportMeta =
    existing.importMeta && typeof existing.importMeta === "object"
      ? { ...(existing.importMeta as ImportMeta) }
      : {};
  for (const field of ["aesNumber", "sealNumber"] as const) {
    if (field in body) {
      const value = body[field];
      if (value !== null && typeof value !== "string") {
        return NextResponse.json({ error: `${field} must be a string` }, { status: 400 });
      }
      currentMeta[field] =
        typeof value === "string" && value.trim().length ? value.trim() : null;
    }
  }

  // Recompute reviewIssues against the post-update values: drop any issue
  // whose underlying field is now filled, keep everything else verbatim.
  const finalValue = <K extends keyof typeof existing>(key: K) =>
    key in updates ? (updates[key as string] as (typeof existing)[K]) : existing[key];
  const priorIssues = Array.isArray(currentMeta.reviewIssues)
    ? currentMeta.reviewIssues.filter((i): i is string => typeof i === "string")
    : [];
  const remainingIssues = priorIssues.filter((issue) => {
    if (issue === "missing container number") return !finalValue("containerNumber");
    if (issue === "missing weight" || issue.startsWith("unparseable weight"))
      return finalValue("weightKg") == null;
    if (issue === "missing AES filing number") return !currentMeta.aesNumber;
    if (issue === "missing/unparseable ETA") return !finalValue("eta");
    if (issue === "missing/unparseable departure date") return !finalValue("etd");
    return true;
  });
  currentMeta.reviewIssues = remainingIssues;

  try {
    const [updated] = await db
      .update(shipments)
      .set({ ...updates, importMeta: currentMeta, updatedAt: new Date() })
      .where(eq(shipments.id, id))
      .returning();
    return NextResponse.json({ shipment: updated });
  } catch (error) {
    console.error("Failed to update shipment:", error);
    return NextResponse.json({ error: "Failed to update shipment" }, { status: 500 });
  }
}

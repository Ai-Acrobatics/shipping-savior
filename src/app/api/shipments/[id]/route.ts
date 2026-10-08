import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { shipments, bolDocuments, shipmentStatusEnum } from "@/lib/db/schema";
import { parseIncoterm } from "@/lib/incoterms";
import { applyAesUpdate, aesIssueResolved, readAesFiling } from "@/lib/shipments/aes";
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
    // Attach the linked BOL blob (parity with GET /api/shipments list rows).
    let bolBlobUrl: string | null = null;
    let bolFileName: string | null = null;
    if (shipment.bolDocumentId) {
      const [doc] = await db
        .select({ blobUrl: bolDocuments.blobUrl, fileName: bolDocuments.fileName })
        .from(bolDocuments)
        .where(eq(bolDocuments.id, shipment.bolDocumentId))
        .limit(1);
      bolBlobUrl = doc?.blobUrl ?? null;
      bolFileName = doc?.fileName ?? null;
    }
    return NextResponse.json({ shipment: { ...shipment, bolBlobUrl, bolFileName } });
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
  // AI-8869 — the named place that qualifies the Incoterm ("FOB Shanghai").
  "incotermPlace",
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

  // AI-8869 — Incoterm and trade role. Validated against the Incoterms 2020
  // vocabulary rather than trusted, because the whole cost-responsibility
  // split downstream is keyed off this one field.
  if ("incoterm" in body) {
    const raw = body.incoterm;
    if (raw === null || raw === "") {
      updates.incoterm = null;
    } else {
      const term = parseIncoterm(raw);
      if (!term) {
        return NextResponse.json(
          { error: "incoterm must be a valid Incoterms 2020 rule" },
          { status: 400 }
        );
      }
      updates.incoterm = term;
    }
  }

  if ("tradeRole" in body) {
    const raw = body.tradeRole;
    if (raw !== "buyer" && raw !== "seller") {
      return NextResponse.json(
        { error: "tradeRole must be 'buyer' or 'seller'" },
        { status: 400 }
      );
    }
    updates.tradeRole = raw;
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
  let currentMeta: ImportMeta =
    existing.importMeta && typeof existing.importMeta === "object"
      ? { ...(existing.importMeta as ImportMeta) }
      : {};
  if ("sealNumber" in body) {
    const value = body.sealNumber;
    if (value !== null && typeof value !== "string") {
      return NextResponse.json({ error: "sealNumber must be a string" }, { status: 400 });
    }
    currentMeta.sealNumber =
      typeof value === "string" && value.trim().length ? value.trim() : null;
  }

  // AI-12006 — AES filing tracker (status, ITN, exemption). Only the keys
  // present in the body are passed through, so unrelated edits never touch
  // the filing state.
  const aesInput: Record<string, unknown> = {};
  for (const key of ["aesStatus", "aesNumber", "aesExemption"] as const) {
    if (key in body) aesInput[key] = body[key];
  }
  if (Object.keys(aesInput).length) {
    const result = applyAesUpdate(currentMeta, aesInput);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    currentMeta = result.meta as ImportMeta;
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
    if (issue === "missing AES filing number")
      return !aesIssueResolved(readAesFiling(currentMeta));
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

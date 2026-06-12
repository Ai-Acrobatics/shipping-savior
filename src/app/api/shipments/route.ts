import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { shipments, bolDocuments, shipmentStatusEnum, shipmentSourceEnum } from "@/lib/db/schema";
import { desc, eq, and, count, sql, type SQL } from "drizzle-orm";

const VALID_STATUSES = shipmentStatusEnum.enumValues;
const VALID_SOURCES = shipmentSourceEnum.enumValues;

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200;

// GET /api/shipments — list the authenticated org's shipments with linked BOL blob URL.
// Supports ?status=, ?limit= (default 50, max 200), ?offset= for server-side pagination,
// and ?needsReview=1 to return only rows whose importMeta.reviewIssues is non-empty (AI-10777).
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { orgId } = session.user;

  const { searchParams } = new URL(request.url);
  const statusFilter = searchParams.get("status");
  const limit = Math.min(
    Math.max(parseInt(searchParams.get("limit") ?? `${DEFAULT_LIMIT}`, 10) || DEFAULT_LIMIT, 1),
    MAX_LIMIT
  );
  const offset = Math.max(parseInt(searchParams.get("offset") ?? "0", 10) || 0, 0);

  try {
    const conditions: SQL[] = [eq(shipments.orgId, orgId)];
    if (statusFilter && (VALID_STATUSES as readonly string[]).includes(statusFilter)) {
      conditions.push(eq(shipments.status, statusFilter as (typeof VALID_STATUSES)[number]));
    }
    if (searchParams.get("needsReview") === "1") {
      // Only workbook rows still carrying parser review flags.
      conditions.push(
        sql`coalesce(jsonb_array_length(${shipments.importMeta}->'reviewIssues'), 0) > 0`
      );
    }
    const where = and(...conditions);

    const [rows, [{ total }]] = await Promise.all([
      db
        .select({
          id: shipments.id,
          orgId: shipments.orgId,
          reference: shipments.reference,
          containerNumber: shipments.containerNumber,
          vesselName: shipments.vesselName,
          voyageNumber: shipments.voyageNumber,
          pol: shipments.pol,
          pod: shipments.pod,
          etd: shipments.etd,
          eta: shipments.eta,
          carrier: shipments.carrier,
          shipper: shipments.shipper,
          consignee: shipments.consignee,
          notifyParty: shipments.notifyParty,
          goodsDescription: shipments.goodsDescription,
          weightKg: shipments.weightKg,
          quantity: shipments.quantity,
          status: shipments.status,
          source: shipments.source,
          importMeta: shipments.importMeta,
          bolDocumentId: shipments.bolDocumentId,
          bolBlobUrl: bolDocuments.blobUrl,
          bolFileName: bolDocuments.fileName,
          createdAt: shipments.createdAt,
          updatedAt: shipments.updatedAt,
        })
        .from(shipments)
        .leftJoin(bolDocuments, eq(shipments.bolDocumentId, bolDocuments.id))
        .where(where)
        .orderBy(desc(shipments.createdAt))
        .limit(limit)
        .offset(offset),
      db.select({ total: count() }).from(shipments).where(where),
    ]);

    return NextResponse.json({
      shipments: rows,
      pagination: { total, limit, offset },
    });
  } catch (error) {
    console.error("Failed to fetch shipments:", error);
    return NextResponse.json(
      { error: "Failed to fetch shipments" },
      { status: 500 }
    );
  }
}

// POST /api/shipments — save a new shipment for the authenticated org.
// orgId always comes from the session, never from the request body.
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { orgId, id: userId } = session.user;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const {
    containerNumber,
    vesselName,
    voyageNumber,
    pol,
    pod,
    etd,
    eta,
    carrier,
    shipper,
    consignee,
    notifyParty,
    goodsDescription,
    weightKg,
    quantity,
    status = "in_transit",
    source = "manual",
    rawBolText,
    bolDocumentId,
  } = body as Record<string, unknown>;

  const parseDate = (value: unknown, field: string): Date | null | { error: string } => {
    if (!value) return null;
    const d = new Date(value as string);
    return isNaN(d.getTime()) ? { error: `Invalid date for ${field}` } : d;
  };
  const etdDate = parseDate(etd, "etd");
  const etaDate = parseDate(eta, "eta");
  for (const d of [etdDate, etaDate]) {
    if (d && "error" in d) {
      return NextResponse.json({ error: d.error }, { status: 400 });
    }
  }

  const safeStatus = (VALID_STATUSES as readonly string[]).includes(status as string)
    ? (status as (typeof VALID_STATUSES)[number])
    : "in_transit";
  const safeSource = (VALID_SOURCES as readonly string[]).includes(source as string)
    ? (source as (typeof VALID_SOURCES)[number])
    : "manual";

  try {
    const [newShipment] = await db
      .insert(shipments)
      .values({
        orgId,
        userId,
        containerNumber: typeof containerNumber === "string" ? containerNumber : null,
        vesselName: typeof vesselName === "string" ? vesselName : null,
        voyageNumber: typeof voyageNumber === "string" ? voyageNumber : null,
        pol: typeof pol === "string" ? pol : null,
        pod: typeof pod === "string" ? pod : null,
        etd: etdDate as Date | null,
        eta: etaDate as Date | null,
        carrier: typeof carrier === "string" ? carrier : null,
        shipper: typeof shipper === "string" ? shipper : null,
        consignee: typeof consignee === "string" ? consignee : null,
        notifyParty: typeof notifyParty === "string" ? notifyParty : null,
        goodsDescription: typeof goodsDescription === "string" ? goodsDescription : null,
        weightKg: typeof weightKg === "number" ? weightKg : null,
        quantity: typeof quantity === "number" ? quantity : null,
        status: safeStatus,
        source: safeSource,
        rawBolText: typeof rawBolText === "string" ? rawBolText : null,
        bolDocumentId: typeof bolDocumentId === "string" ? bolDocumentId : null,
      })
      .returning();

    return NextResponse.json({ shipment: newShipment }, { status: 201 });
  } catch (error) {
    console.error("Failed to create shipment:", error);
    return NextResponse.json(
      { error: "Failed to create shipment" },
      { status: 500 }
    );
  }
}

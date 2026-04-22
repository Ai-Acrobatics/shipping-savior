import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { shipments, bolDocuments } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";

// GET /api/shipments — fetch all shipments with linked BOL blob URL (MVP: no auth required)
export async function GET() {
  try {
    const rows = await db
      .select({
        id: shipments.id,
        orgId: shipments.orgId,
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
        bolDocumentId: shipments.bolDocumentId,
        bolBlobUrl: bolDocuments.blobUrl,
        bolFileName: bolDocuments.fileName,
        createdAt: shipments.createdAt,
        updatedAt: shipments.updatedAt,
      })
      .from(shipments)
      .leftJoin(bolDocuments, eq(shipments.bolDocumentId, bolDocuments.id))
      .orderBy(desc(shipments.createdAt));

    return NextResponse.json({ shipments: rows });
  } catch (error) {
    console.error("Failed to fetch shipments:", error);
    return NextResponse.json(
      { error: "Failed to fetch shipments" },
      { status: 500 }
    );
  }
}

// POST /api/shipments — save a new shipment
export async function POST(request: NextRequest) {
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
    orgId,
  } = body as Record<string, unknown>;

  try {
    const [newShipment] = await db
      .insert(shipments)
      .values({
        orgId: typeof orgId === "string" ? orgId : null,
        containerNumber: typeof containerNumber === "string" ? containerNumber : null,
        vesselName: typeof vesselName === "string" ? vesselName : null,
        voyageNumber: typeof voyageNumber === "string" ? voyageNumber : null,
        pol: typeof pol === "string" ? pol : null,
        pod: typeof pod === "string" ? pod : null,
        etd: etd ? new Date(etd as string) : null,
        eta: eta ? new Date(eta as string) : null,
        carrier: typeof carrier === "string" ? carrier : null,
        shipper: typeof shipper === "string" ? shipper : null,
        consignee: typeof consignee === "string" ? consignee : null,
        notifyParty: typeof notifyParty === "string" ? notifyParty : null,
        goodsDescription: typeof goodsDescription === "string" ? goodsDescription : null,
        weightKg: typeof weightKg === "number" ? weightKg : null,
        quantity: typeof quantity === "number" ? quantity : null,
        status: (status as "in_transit" | "arrived" | "delayed" | "pending") || "in_transit",
        source: (source as "manual" | "bol_ocr") || "manual",
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

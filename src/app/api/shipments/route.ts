import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { shipments } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

// GET /api/shipments — fetch all shipments (MVP: no auth required)
export async function GET() {
  try {
    const rows = await db
      .select()
      .from(shipments)
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

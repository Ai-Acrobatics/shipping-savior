import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { shipments, bolDocuments } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

// GET /api/shipments/[id] — fetch a single shipment with its linked BOL blob.
// MVP: no auth required, consistent with GET /api/shipments (list).
//
// NOTE: selects only the BOL-flavored columns that exist in the production
// shipments table. The CSV-import columns (reference, origin_port, progress,
// current_location, ...) are declared in schema.ts / migration 0000 but were
// never applied to the production database (migration drift), so selecting them
// here would throw "column does not exist". See AI-8055.
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const [row] = await db
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
      .where(eq(shipments.id, id));

    if (!row) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ shipment: row });
  } catch (error) {
    console.error("Failed to fetch shipment:", error);
    return NextResponse.json(
      { error: "Failed to fetch shipment" },
      { status: 500 }
    );
  }
}

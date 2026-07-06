/**
 * /platform/shipments/[id] — single shipment detail + journey timeline (AI-8055).
 *
 * Server component. Loads the shipment directly from the database and renders
 * the visual timeline (ShipmentTimeline) plus a details grid and BOL link.
 * Auth is handled by the (platform) layout. force-dynamic so we never query the
 * DB at build time.
 *
 * NOTE: selects only the BOL-flavored columns that exist in the production
 * shipments table — the CSV-import columns are declared in schema.ts but were
 * never applied to prod (migration drift). The timeline derives gracefully from
 * pol/pod + etd/eta + status. See AI-8055.
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Ship,
  MapPin,
  Package,
  FileText,
  Building2,
  Weight,
  Boxes,
} from "lucide-react";
import { db } from "@/lib/db";
import { shipments, bolDocuments } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import ShipmentTimeline from "@/components/platform/ShipmentTimeline";

export const dynamic = "force-dynamic";

const STATUS_CONFIG: Record<string, { label: string; classes: string }> = {
  in_transit: { label: "In Transit", classes: "bg-sky-100 text-sky-700 border-sky-200" },
  arrived: { label: "Arrived", classes: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  delayed: { label: "Delayed", classes: "bg-red-100 text-red-700 border-red-200" },
  pending: { label: "Pending", classes: "bg-amber-100 text-amber-700 border-amber-200" },
};

function fmt(value: string | number | Date | null | undefined): string {
  if (value === null || value === undefined || value === "") return "--";
  if (value instanceof Date) {
    return value.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }
  return String(value);
}

async function loadShipment(id: string) {
  try {
    const [row] = await db
      .select({
        id: shipments.id,
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
        bolBlobUrl: bolDocuments.blobUrl,
        bolFileName: bolDocuments.fileName,
        createdAt: shipments.createdAt,
      })
      .from(shipments)
      .leftJoin(bolDocuments, eq(shipments.bolDocumentId, bolDocuments.id))
      .where(eq(shipments.id, id));
    return row ?? null;
  } catch (error) {
    console.error("Failed to load shipment detail:", error);
    return null;
  }
}

export default async function ShipmentDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const shipment = await loadShipment(params.id);
  if (!shipment) notFound();

  const statusCfg = STATUS_CONFIG[shipment.status] || STATUS_CONFIG.pending;
  const origin = shipment.pol || "Origin";
  const dest = shipment.pod || "Destination";

  const details: Array<{ label: string; value: string; icon: typeof Ship }> = [
    { label: "Carrier", value: fmt(shipment.carrier), icon: Ship },
    { label: "Vessel", value: fmt(shipment.vesselName), icon: Ship },
    { label: "Voyage", value: fmt(shipment.voyageNumber), icon: Ship },
    { label: "Container", value: fmt(shipment.containerNumber), icon: Boxes },
    { label: "Cargo", value: fmt(shipment.goodsDescription), icon: Package },
    { label: "Shipper", value: fmt(shipment.shipper), icon: Building2 },
    { label: "Consignee", value: fmt(shipment.consignee), icon: Building2 },
    { label: "Notify Party", value: fmt(shipment.notifyParty), icon: Building2 },
    { label: "Weight (kg)", value: fmt(shipment.weightKg), icon: Weight },
    { label: "Quantity", value: fmt(shipment.quantity), icon: Boxes },
    { label: "ETD", value: fmt(shipment.etd), icon: MapPin },
    { label: "ETA", value: fmt(shipment.eta), icon: MapPin },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <Link
        href="/platform/shipments"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-navy-500 hover:text-ocean-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to shipments
      </Link>

      {/* Header */}
      <div className="card rounded-2xl p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-mono text-xs font-semibold text-navy-400">
              {shipment.containerNumber || shipment.id.slice(0, 8)}
            </p>
            <h1 className="mt-1 flex items-center gap-2 text-xl font-bold text-navy-900">
              <MapPin className="h-5 w-5 text-ocean-500" />
              {origin}
              <span className="text-navy-300">→</span>
              {dest}
            </h1>
          </div>
          <span
            className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium ${statusCfg.classes}`}
          >
            {statusCfg.label}
          </span>
        </div>
      </div>

      {/* Timeline */}
      <ShipmentTimeline shipment={shipment} />

      {/* Details grid */}
      <div className="card rounded-2xl p-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-navy-500">
          Shipment Details
        </h2>
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {details.map((d) => (
            <div key={d.label}>
              <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-navy-400">
                <d.icon className="h-3 w-3" />
                {d.label}
              </dt>
              <dd className="mt-0.5 text-sm font-medium text-navy-800">{d.value}</dd>
            </div>
          ))}
        </dl>

        {shipment.bolBlobUrl && (
          <a
            href={shipment.bolBlobUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-1.5 rounded-lg border border-navy-200 px-3 py-1.5 text-sm font-medium text-navy-700 hover:border-ocean-400 hover:bg-ocean-50 hover:text-ocean-700"
          >
            <FileText className="h-4 w-4" />
            View original Bill of Lading
          </a>
        )}
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { loadPortalView, recordPortalView } from "@/lib/portal/load";
import type { CustomerShipment } from "@/lib/portal/customer-portal";

// Public, per-token, never cached: one customer's boxes must never be served
// to another token off an edge cache.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * /track/[token] — NVOCC white-label customer portal (AI-12022).
 *
 * Read-only, no login, no account. The NVOCC's customer sees only their own
 * boxes, branded to the NVOCC. Everything rendered comes through the
 * allowlist projection in `toCustomerShipment` — no cost, margin, shipper or
 * importMeta data reaches this page.
 */

export const metadata: Metadata = {
  title: "Shipment Tracking",
  // A share link should never end up in a search index.
  robots: { index: false, follow: false },
};

const STATUS_STYLE: Record<string, string> = {
  delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
  arrived: "bg-emerald-50 text-emerald-700 border-emerald-200",
  in_transit: "bg-sky-50 text-sky-700 border-sky-200",
  at_port: "bg-sky-50 text-sky-700 border-sky-200",
  customs: "bg-amber-50 text-amber-700 border-amber-200",
  delayed: "bg-red-50 text-red-700 border-red-200",
};

function formatDate(iso: string | null): string {
  if (!iso) return "TBD";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

function ShipmentCard({ shipment }: { shipment: CustomerShipment }) {
  const badge = STATUS_STYLE[shipment.status] ?? "bg-slate-100 text-slate-700 border-slate-200";
  const progress = Math.max(0, Math.min(100, shipment.timeline.progressPercent));

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-mono text-sm font-bold text-slate-900">
            {shipment.containerNumber || shipment.reference || "Shipment"}
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            {shipment.reference && shipment.containerNumber
              ? `Booking ${shipment.reference}`
              : null}
            {shipment.poNumber ? ` · PO ${shipment.poNumber}` : null}
          </p>
        </div>
        <span
          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${badge}`}
        >
          {shipment.statusLabel}
        </span>
      </div>

      <div className="mt-4 flex items-center gap-3 text-sm">
        <span className="font-medium text-slate-800">{shipment.origin || "Origin"}</span>
        <span className="h-px flex-1 bg-slate-200" aria-hidden />
        <span className="font-medium text-slate-800">{shipment.destination || "Destination"}</span>
      </div>

      <div
        className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100"
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${shipment.statusLabel} — ${progress}% of the way`}
      >
        <div
          className={`h-full rounded-full ${shipment.timeline.delayed ? "bg-red-500" : "bg-sky-500"}`}
          style={{ width: `${progress}%` }}
        />
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm sm:grid-cols-4">
        <div>
          <dt className="text-xs font-medium text-slate-500">Departs</dt>
          <dd className="text-slate-900">{formatDate(shipment.etd)}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-slate-500">Arrives</dt>
          <dd className={shipment.timeline.delayed ? "text-red-600" : "text-slate-900"}>
            {formatDate(shipment.eta)}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-slate-500">Vessel</dt>
          <dd className="truncate text-slate-900">{shipment.vesselName || "—"}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-slate-500">Carrier</dt>
          <dd className="truncate text-slate-900">{shipment.carrier || "—"}</dd>
        </div>
      </dl>

      {shipment.description && (
        <p className="mt-3 border-t border-slate-100 pt-3 text-sm text-slate-600">
          {shipment.description}
        </p>
      )}
    </article>
  );
}

export default async function CustomerTrackingPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const view = await loadPortalView(token);

  // Unknown and revoked tokens both 404 — a distinct "revoked" page would
  // confirm the customer relationship to anyone holding a stale URL.
  if (!view) notFound();

  void recordPortalView(token);

  const { summary } = view;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-baseline justify-between gap-2 px-6 py-6">
          <div>
            {/* White-label: the NVOCC is the brand here, not us. */}
            <p className="text-lg font-bold text-slate-900">{view.brandName}</p>
            <p className="text-sm text-slate-500">Shipment tracking for {view.customerLabel}</p>
          </div>
          <p className="text-xs text-slate-400">
            Updated {new Date(view.generatedAt).toLocaleString("en-US")}
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Shipments", value: summary.total },
            { label: "In transit", value: summary.inTransit },
            { label: "Arrived", value: summary.arrived },
            { label: "Delayed", value: summary.delayed },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3"
            >
              <dt className="text-xs font-medium text-slate-500">{stat.label}</dt>
              <dd className="mt-0.5 text-2xl font-bold text-slate-900">{stat.value}</dd>
            </div>
          ))}
        </dl>

        {summary.nextArrival && (
          <p className="mt-4 text-sm text-slate-600">
            Next arrival{" "}
            <strong className="text-slate-900">{formatDate(summary.nextArrival)}</strong>
          </p>
        )}

        <div className="mt-6 space-y-4">
          {view.shipments.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
              <h2 className="text-lg font-semibold text-slate-900">No shipments yet</h2>
              <p className="mt-1 text-sm text-slate-500">
                Bookings will appear here as soon as they are on the water.
              </p>
            </div>
          ) : (
            view.shipments.map((shipment) => (
              <ShipmentCard key={shipment.id} shipment={shipment} />
            ))
          )}
        </div>
      </main>

      <footer className="mx-auto max-w-5xl px-6 pb-10 text-center text-xs text-slate-400">
        Powered by Shipping Savior
      </footer>
    </div>
  );
}

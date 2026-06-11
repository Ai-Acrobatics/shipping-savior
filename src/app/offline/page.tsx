import Link from "next/link";

export const metadata = {
  title: "Offline | Shipping Savior",
};

// Offline fallback served by the service worker when a navigation fails.
export default function OfflinePage() {
  return (
    <main className="min-h-screen bg-navy-900 text-white flex flex-col items-center justify-center px-6 text-center">
      <div className="text-6xl mb-6">🚢</div>
      <h1 className="text-3xl font-bold mb-3">You&apos;re offline</h1>
      <p className="text-navy-300 max-w-md mb-8">
        Shipping Savior needs a connection to load live shipment, rate, and
        tariff data. Reconnect and try again.
      </p>
      <Link
        href="/platform/dashboard"
        className="rounded-lg bg-ocean-500 hover:bg-ocean-600 px-6 py-3 font-semibold transition-colors"
      >
        Retry dashboard
      </Link>
    </main>
  );
}

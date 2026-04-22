"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";

interface TariffCheckResult {
  hasContract: boolean;
  tariffRate: number;
  contractedRate: number | null;
  savings: number | null;
  carrier?: string;
}

interface Shipment {
  id: string;
  pol: string | null;
  pod: string | null;
  containerNumber: string | null;
}

// Example routes to check — uses recent shipments' POL/POD pairs
const DEMO_ROUTES = [
  { origin: "CNSHA", destination: "USLAX" },
  { origin: "CNNGB", destination: "USLAX" },
  { origin: "CNYTN", destination: "USNY" },
];

export default function TariffAlertCard() {
  const [loading, setLoading] = useState(true);
  const [shipmentRoutes, setShipmentRoutes] = useState<{ origin: string; destination: string; containerNumber?: string | null }[]>([]);
  const [results, setResults] = useState<Array<{
    origin: string;
    destination: string;
    result: TariffCheckResult;
    containerNumber?: string | null;
  }>>([]);

  useEffect(() => {
    const fetchAndCheck = async () => {
      setLoading(true);

      try {
        // Fetch recent shipments to get real routes
        const shipmentsRes = await fetch("/api/shipments");
        let routes = DEMO_ROUTES.map((r) => ({ ...r, containerNumber: null }));

        if (shipmentsRes.ok) {
          const data = await shipmentsRes.json();
          const recentShipments: Shipment[] = (data.shipments || []).slice(0, 3);
          const realRoutes = recentShipments
            .filter((s) => s.pol && s.pod)
            .map((s) => ({
              origin: s.pol!.slice(0, 10).toUpperCase().replace(/\s+/g, ""),
              destination: s.pod!.slice(0, 10).toUpperCase().replace(/\s+/g, ""),
              containerNumber: s.containerNumber,
            }));

          if (realRoutes.length > 0) {
            routes = realRoutes;
            setShipmentRoutes(realRoutes);
          }
        }

        // Check tariff for each route
        const checkResults = await Promise.all(
          routes.slice(0, 3).map(async (route) => {
            try {
              const res = await fetch(
                `/api/contracts/check-tariff?origin=${encodeURIComponent(route.origin)}&destination=${encodeURIComponent(route.destination)}`
              );
              if (!res.ok) return null;
              const result: TariffCheckResult = await res.json();
              return { ...route, result };
            } catch {
              return null;
            }
          })
        );

        const valid = checkResults.filter(Boolean) as Array<{
          origin: string;
          destination: string;
          result: TariffCheckResult;
          containerNumber?: string | null;
        }>;
        setResults(valid);
      } catch {
        // Silently fail — card is non-critical
      } finally {
        setLoading(false);
      }
    };

    fetchAndCheck();
  }, []);

  const tariffBookings = results.filter((r) => !r.result.hasContract);
  const totalPotentialSavings = tariffBookings.reduce((sum, r) => {
    // Estimate savings: if no contract, assume ~15% savings possible
    return sum + (r.result.tariffRate ? Math.round(r.result.tariffRate * 0.15) : 0);
  }, 0);

  return (
    <div className="bg-white border border-navy-200 rounded-xl p-5 shadow-soft">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            tariffBookings.length > 0 ? "bg-amber-50" : "bg-emerald-50"
          }`}>
            {tariffBookings.length > 0 ? (
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            )}
          </div>
          <h3 className="text-sm font-semibold text-navy-800">Tariff Alert</h3>
        </div>
        <Link
          href="/platform/contracts"
          className="text-xs font-medium text-ocean-600 hover:text-ocean-700 flex items-center gap-1"
        >
          Manage Contracts
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="w-5 h-5 animate-spin text-ocean-500" />
        </div>
      ) : results.length === 0 ? (
        <p className="text-sm text-navy-500">Add shipments to analyze tariff vs. contract rates.</p>
      ) : tariffBookings.length === 0 ? (
        <div className="text-sm text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2">
          All checked routes have active contract rates. Great coverage!
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-sm text-amber-700 font-medium">
            {tariffBookings.length} route{tariffBookings.length > 1 ? "s" : ""} booking on tariff
            {totalPotentialSavings > 0 && (
              <span className="ml-1 text-amber-600">
                — potential savings ~${totalPotentialSavings.toLocaleString()}
              </span>
            )}
          </p>
          <div className="space-y-1.5">
            {tariffBookings.slice(0, 3).map((r, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 text-xs">
                <span className="font-mono font-semibold text-navy-700">
                  {r.origin} → {r.destination}
                  {r.containerNumber && (
                    <span className="ml-1.5 font-normal text-navy-500">({r.containerNumber})</span>
                  )}
                </span>
                <span className="text-amber-700 font-medium">
                  Tariff: ${r.result.tariffRate?.toLocaleString() ?? "--"}/40ft
                </span>
              </div>
            ))}
          </div>
          <Link
            href="/platform/contracts"
            className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-ocean-600 hover:text-ocean-700"
          >
            Add contract rates to save money
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      )}
    </div>
  );
}

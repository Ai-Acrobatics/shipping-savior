"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";

interface ShipmentAnalysis {
  shipmentId: string;
  containerNumber: string | null;
  route: string;
  carrier: string | null;
  hasContract: boolean;
  contractRate: number | null;
  tariffRate: number;
  savings: number;
  status: "contract" | "tariff" | "unknown";
}

interface SavingsSummary {
  monthlySavingsRealized: number;
  monthlySavingsPotential: number;
  totalSavingsIdentified: number;
  tariffBookings: number;
  contractBookings: number;
  totalAnalyzed: number;
  activeLaneCount: number;
  analyses: ShipmentAnalysis[];
}

export default function TariffAlertCard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<SavingsSummary | null>(null);

  useEffect(() => {
    fetch("/api/contracts/savings-summary")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setData(d))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  const analyses = data?.analyses ?? [];
  const tariffAnalyses = analyses.filter((a) => a.status === "tariff");
  const contractAnalyses = analyses.filter((a) => a.status === "contract");
  const totalPotentialSavings = tariffAnalyses.reduce(
    (sum, a) => sum + a.savings,
    0,
  );

  return (
    <div className="bg-white border border-navy-200 rounded-xl p-5 shadow-soft">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              tariffAnalyses.length > 0 ? "bg-amber-50" : "bg-emerald-50"
            }`}
          >
            {tariffAnalyses.length > 0 ? (
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            )}
          </div>
          <h3 className="text-sm font-semibold text-navy-800">
            Tariff vs. Contract Detection
          </h3>
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
      ) : analyses.length === 0 ? (
        <p className="text-sm text-navy-500">
          Add shipments to analyze tariff vs. contract rates.
        </p>
      ) : (
        <div className="space-y-3">
          {/* Headline summary */}
          {tariffAnalyses.length > 0 ? (
            <p className="text-sm text-amber-700 font-medium">
              {tariffAnalyses.length} container
              {tariffAnalyses.length > 1 ? "s" : ""} booking on tariff
              {totalPotentialSavings > 0 && (
                <span className="ml-1 text-amber-600">
                  — potential savings $
                  {totalPotentialSavings.toLocaleString()}
                </span>
              )}
            </p>
          ) : (
            <div className="text-sm text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2">
              All {contractAnalyses.length} container
              {contractAnalyses.length !== 1 ? "s" : ""} booked at contract
              rates. Great coverage!
            </div>
          )}

          {/* Per-container detail table */}
          <div className="overflow-x-auto rounded-lg border border-navy-100">
            <table className="w-full text-xs">
              <thead className="bg-navy-50 border-b border-navy-100">
                <tr className="text-left font-semibold uppercase tracking-wider text-navy-500">
                  <th className="px-3 py-2">Container</th>
                  <th className="px-3 py-2">Route</th>
                  <th className="px-3 py-2 text-right">Contract</th>
                  <th className="px-3 py-2 text-right">Tariff</th>
                  <th className="px-3 py-2 text-right">Delta</th>
                  <th className="px-3 py-2 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {analyses.slice(0, 6).map((a) => (
                  <tr
                    key={a.shipmentId}
                    className={`border-b border-navy-50 last:border-0 ${
                      a.status === "tariff" ? "bg-amber-50/40" : ""
                    }`}
                  >
                    <td className="px-3 py-2 font-mono font-semibold text-navy-700">
                      {a.containerNumber || "—"}
                    </td>
                    <td className="px-3 py-2 font-mono text-navy-600">
                      {a.route}
                    </td>
                    <td className="px-3 py-2 text-right text-navy-800">
                      {a.contractRate
                        ? `$${a.contractRate.toLocaleString()}`
                        : "—"}
                    </td>
                    <td className="px-3 py-2 text-right text-navy-800">
                      ${a.tariffRate.toLocaleString()}
                    </td>
                    <td
                      className={`px-3 py-2 text-right font-semibold ${
                        a.savings > 0
                          ? a.status === "contract"
                            ? "text-emerald-600"
                            : "text-amber-700"
                          : "text-navy-400"
                      }`}
                    >
                      {a.savings > 0
                        ? `${a.status === "contract" ? "saved" : "save"} $${a.savings.toLocaleString()}`
                        : "—"}
                    </td>
                    <td className="px-3 py-2 text-center">
                      {a.status === "contract" ? (
                        <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                          CONTRACT
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                          ON TARIFF
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {tariffAnalyses.length > 0 && (
            <Link
              href="/platform/contracts"
              className="inline-flex items-center gap-1 text-xs font-medium text-ocean-600 hover:text-ocean-700"
            >
              Add contract rates to close the gap
              <ArrowRight className="w-3 h-3" />
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

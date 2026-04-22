"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TrendingUp, ArrowRight, Loader2, Package } from "lucide-react";

interface SavingsSummary {
  monthlySavingsRealized: number;
  monthlySavingsPotential: number;
  totalSavingsIdentified: number;
  tariffBookings: number;
  contractBookings: number;
  totalAnalyzed: number;
  activeLaneCount: number;
}

export default function SavingsKpiCard() {
  const [data, setData] = useState<SavingsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/contracts/savings-summary")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setData(d))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  const totalSavings = data?.totalSavingsIdentified ?? 0;
  const realized = data?.monthlySavingsRealized ?? 0;
  const potential = data?.monthlySavingsPotential ?? 0;
  const tariffCount = data?.tariffBookings ?? 0;
  const contractCount = data?.contractBookings ?? 0;

  return (
    <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-5 shadow-soft text-white relative overflow-hidden">
      <div className="absolute right-0 top-0 opacity-10">
        <TrendingUp className="w-28 h-28" strokeWidth={1.5} />
      </div>
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-sm font-semibold text-white/90">
              Contract Savings This Month
            </h3>
          </div>
          <Link
            href="/platform/contracts"
            className="text-xs font-medium text-white/80 hover:text-white inline-flex items-center gap-1"
          >
            Details
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="w-5 h-5 animate-spin text-white/70" />
          </div>
        ) : (
          <>
            <p className="text-3xl font-bold text-white">
              ${totalSavings.toLocaleString()}
            </p>
            <p className="text-xs text-white/80 mt-1">
              {realized > 0 && (
                <span className="font-medium">
                  ${realized.toLocaleString()} realized
                </span>
              )}
              {realized > 0 && potential > 0 && (
                <span className="mx-1 text-white/60">•</span>
              )}
              {potential > 0 && (
                <span className="font-medium">
                  ${potential.toLocaleString()} potential
                </span>
              )}
              {realized === 0 && potential === 0 && (
                <span>Add contracts and shipments to track savings</span>
              )}
            </p>

            {(tariffCount > 0 || contractCount > 0) && (
              <div className="mt-4 flex items-center gap-4 pt-3 border-t border-white/20 text-xs">
                <div className="flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-emerald-100" />
                  <span className="font-semibold">{contractCount}</span>
                  <span className="text-white/70">on contract</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-amber-100" />
                  <span className="font-semibold">{tariffCount}</span>
                  <span className="text-white/70">on tariff</span>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

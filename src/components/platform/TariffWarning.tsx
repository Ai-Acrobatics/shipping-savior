"use client";

import { AlertTriangle, Plus, ArrowRight } from "lucide-react";

interface TariffWarningProps {
  origin: string;
  originName: string;
  destination: string;
  destinationName: string;
  tariffRate: number;
  typicalContractedRate?: number;
  onAddLane?: () => void;
}

export default function TariffWarning({
  origin,
  originName,
  destination,
  destinationName,
  tariffRate,
  typicalContractedRate,
  onAddLane,
}: TariffWarningProps) {
  // Estimate a typical contracted rate as ~30% below tariff if not provided
  const contracted = typicalContractedRate ?? Math.round(tariffRate * 0.7);
  const overpay = tariffRate - contracted;

  return (
    <div className="rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-amber-800">
            Booking on Tariff — No Contract Found
          </h4>
          <p className="mt-1 text-sm text-amber-700">
            No contract for{" "}
            <span className="font-mono font-semibold">{origin}</span>{" "}
            <ArrowRight className="inline h-3 w-3 mx-0.5" />{" "}
            <span className="font-mono font-semibold">{destination}</span>
          </p>

          {/* Rate comparison grid */}
          <div className="mt-3 grid grid-cols-3 gap-3">
            <div className="rounded-lg bg-white/60 p-2.5 text-center">
              <p className="text-[10px] font-medium uppercase tracking-wider text-amber-600">
                Tariff Rate
              </p>
              <p className="mt-0.5 text-lg font-bold text-red-600">
                ${tariffRate.toLocaleString()}
              </p>
            </div>
            <div className="rounded-lg bg-white/60 p-2.5 text-center">
              <p className="text-[10px] font-medium uppercase tracking-wider text-amber-600">
                Typical Contracted
              </p>
              <p className="mt-0.5 text-lg font-bold text-emerald-600">
                ${contracted.toLocaleString()}
              </p>
            </div>
            <div className="rounded-lg bg-white/60 p-2.5 text-center">
              <p className="text-[10px] font-medium uppercase tracking-wider text-amber-600">
                You&apos;d Overpay
              </p>
              <p className="mt-0.5 text-lg font-bold text-red-600">
                ${overpay.toLocaleString()}
              </p>
            </div>
          </div>

          <p className="mt-2 text-xs text-amber-600">
            {originName} to {destinationName} — 40ft container estimate
          </p>

          {onAddLane && (
            <button
              onClick={onAddLane}
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-amber-700"
            >
              <Plus className="h-3.5 w-3.5" />
              Add this lane to a contract
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

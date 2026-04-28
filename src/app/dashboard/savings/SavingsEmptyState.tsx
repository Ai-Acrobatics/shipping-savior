"use client";

import Link from "next/link";
import { PiggyBank, Upload, ArrowRight } from "lucide-react";

export default function SavingsEmptyState() {
  return (
    <div className="max-w-screen-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Savings Report</h1>
        <p className="text-sm text-navy-600 mt-1">
          FTZ savings, rate optimization, and cost reduction analysis
        </p>
      </div>

      <div className="bg-white border border-navy-100 rounded-2xl p-12 text-center shadow-soft">
        <div className="w-16 h-16 rounded-full bg-ocean-50 flex items-center justify-center mx-auto mb-4">
          <PiggyBank className="w-8 h-8 text-ocean-600" />
        </div>
        <h2 className="text-lg font-semibold text-navy-900 mb-2">
          No shipments to analyze yet
        </h2>
        <p className="text-sm text-navy-500 max-w-md mx-auto mb-6">
          Once you import your shipments, we&apos;ll surface FTZ savings, rate
          optimization opportunities, and duty drawback analysis here.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/platform/shipments/import"
            className="inline-flex items-center gap-2 bg-ocean-600 hover:bg-ocean-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            <Upload className="w-4 h-4" />
            Import CSV
          </Link>
          <Link
            href="/platform/shipments"
            className="inline-flex items-center gap-2 border border-navy-200 hover:bg-navy-50 text-navy-700 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            View Shipments
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

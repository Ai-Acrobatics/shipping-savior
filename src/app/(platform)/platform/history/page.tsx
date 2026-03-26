import Link from "next/link";
import { Clock, Calculator, Search, Filter, ArrowRight } from "lucide-react";

export default function HistoryPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">
          Calculation History
        </h1>
        <p className="text-navy-500 mt-1">
          View and manage your saved calculations.
        </p>
      </div>

      {/* Filter Bar (placeholder — disabled) */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
          <input
            type="text"
            placeholder="Search calculations..."
            disabled
            className="w-full pl-10 pr-4 py-2 border border-navy-200 rounded-lg text-sm bg-navy-50 text-navy-400 cursor-not-allowed"
          />
        </div>
        <select
          disabled
          className="px-3 py-2 border border-navy-200 rounded-lg text-sm bg-navy-50 text-navy-400 cursor-not-allowed"
        >
          <option>All Types</option>
          <option>Landed Cost</option>
          <option>Unit Economics</option>
          <option>FTZ Savings</option>
          <option>PF/NPF</option>
          <option>Container</option>
          <option>Tariff Scenario</option>
        </select>
        <button
          disabled
          className="flex items-center gap-2 px-3 py-2 border border-navy-200 rounded-lg text-sm bg-navy-50 text-navy-400 cursor-not-allowed"
        >
          <Filter className="w-4 h-4" />
          Date Range
        </button>
      </div>

      {/* Empty State */}
      <div className="bg-white border border-navy-200 rounded-xl p-12 text-center">
        <div className="w-16 h-16 rounded-full bg-navy-100 flex items-center justify-center mx-auto mb-4">
          <Clock className="w-8 h-8 text-navy-400" />
        </div>
        <h3 className="text-lg font-semibold text-navy-900 mb-2">
          No saved calculations yet
        </h3>
        <p className="text-navy-500 text-sm max-w-md mx-auto mb-6">
          Your calculation history will appear here once you run and save a
          calculator. Results are stored securely and can be exported anytime.
        </p>
        <Link
          href="/platform/calculators"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-ocean-600 to-indigo-500 text-white text-sm font-medium rounded-lg hover:from-ocean-700 hover:to-indigo-600 transition-all"
        >
          <Calculator className="w-4 h-4" />
          Go to Calculators
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

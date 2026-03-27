"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, Filter } from "lucide-react";
import CalculationHistory from "@/components/platform/CalculationHistory";
import type { SavedCalculation, CalculatorType } from "@/lib/types/calculations";
import {
  CALCULATOR_TYPE_LABELS,
  CALCULATOR_ROUTES,
} from "@/lib/types/calculations";

const ALL_TYPES: CalculatorType[] = [
  "landed_cost",
  "unit_economics",
  "ftz_savings",
  "pf_npf_comparison",
  "container_utilization",
  "tariff_scenario",
];

export default function HistoryPage() {
  const router = useRouter();
  const [calculations, setCalculations] = useState<SavedCalculation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchCalculations = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = typeFilter !== "all" ? `?type=${typeFilter}` : "";
      const res = await fetch(`/api/calculations${params}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setCalculations(data.calculations ?? []);
    } catch (error) {
      console.error("Failed to fetch calculations:", error);
    } finally {
      setIsLoading(false);
    }
  }, [typeFilter]);

  useEffect(() => {
    fetchCalculations();
  }, [fetchCalculations]);

  // Filter by search query (client-side)
  const filteredCalculations = searchQuery.trim()
    ? calculations.filter((c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : calculations;

  const handleLoad = (calc: SavedCalculation) => {
    const route = CALCULATOR_ROUTES[calc.calculatorType as CalculatorType];
    if (route) {
      router.push(`${route}?loadId=${calc.id}`);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/calculations/${id}`, { method: "DELETE" });
      if (res.ok || res.status === 204) {
        setCalculations((prev) => prev.filter((c) => c.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete calculation:", error);
    }
  };

  const handleRename = async (id: string, newName: string) => {
    try {
      const res = await fetch(`/api/calculations/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName }),
      });
      if (res.ok) {
        const data = await res.json();
        setCalculations((prev) =>
          prev.map((c) => (c.id === id ? { ...c, name: data.calculation.name } : c))
        );
      }
    } catch (error) {
      console.error("Failed to rename calculation:", error);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Calculation History</h1>
        <p className="text-navy-500 mt-1">
          View and manage your saved calculations.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
          <input
            type="text"
            placeholder="Search calculations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-navy-200 rounded-lg text-sm text-navy-900 placeholder-navy-400 bg-white focus:outline-none focus:ring-2 focus:ring-ocean-500/30 focus:border-ocean-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-navy-400" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-navy-200 rounded-lg text-sm text-navy-700 bg-white focus:outline-none focus:ring-2 focus:ring-ocean-500/30 focus:border-ocean-500"
          >
            <option value="all">All Types</option>
            {ALL_TYPES.map((type) => (
              <option key={type} value={type}>
                {CALCULATOR_TYPE_LABELS[type]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results count */}
      {!isLoading && (
        <div className="text-xs text-navy-400 font-medium">
          Showing {filteredCalculations.length} of {calculations.length} calculation{calculations.length !== 1 ? "s" : ""}
        </div>
      )}

      {/* History table */}
      <CalculationHistory
        calculations={filteredCalculations}
        onLoad={handleLoad}
        onDelete={handleDelete}
        onRename={handleRename}
        isLoading={isLoading}
      />
    </div>
  );
}

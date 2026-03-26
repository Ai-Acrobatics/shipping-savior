"use client";

import { TrendingUp, TrendingDown } from "lucide-react";
import type { CostCategory } from "@/lib/data/dashboard";

export default function CostBreakdownPanel({
  categories,
  total,
}: {
  categories: CostCategory[];
  total: number;
}) {
  return (
    <div className="space-y-3">
      {categories.map((cat) => (
        <div key={cat.category}>
          <div className="flex items-center justify-between text-xs mb-1">
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: cat.color }}
              />
              <span className="text-navy-300">{cat.category}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-white font-medium">
                ${cat.amount.toLocaleString()}
              </span>
              {cat.trend !== 0 && (
                <span className={`flex items-center gap-0.5 ${
                  cat.category === "Gross Margin"
                    ? cat.trend > 0 ? "text-green-400" : "text-red-400"
                    : cat.trend < 0 ? "text-green-400" : "text-red-400"
                }`}>
                  {cat.trend > 0 ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  <span className="text-[10px]">{Math.abs(cat.trend)}%</span>
                </span>
              )}
            </div>
          </div>
          <div className="w-full bg-white/5 rounded-full h-1.5">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${cat.percentage}%`,
                backgroundColor: cat.color,
              }}
            />
          </div>
        </div>
      ))}

      <div className="pt-3 border-t border-white/5 flex items-center justify-between">
        <span className="text-xs text-navy-400">Total Revenue</span>
        <span className="text-sm font-bold text-white">${total.toLocaleString()}</span>
      </div>
    </div>
  );
}

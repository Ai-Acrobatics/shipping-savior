"use client";

import {
  TrendingUp, TrendingDown, Target, AlertTriangle, CheckCircle2,
  DollarSign, Package, PiggyBank, Clock,
} from "lucide-react";
import type { ExecutiveSummary } from "@/lib/data/dashboard";
import { formatCurrency } from "@/lib/data/dashboard";

export default function ExecutiveSummaryCard({ data }: { data: ExecutiveSummary }) {
  const revenueChange = ((data.revenue.current - data.revenue.previous) / data.revenue.previous) * 100;
  const revenueProgress = (data.revenue.current / data.revenue.target) * 100;

  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-white">Executive Summary</h2>
          <p className="text-xs text-navy-400 mt-0.5">{data.period}</p>
        </div>
        <span className="text-xs px-3 py-1.5 rounded-full bg-ocean-500/20 text-ocean-300 font-medium">
          Stakeholder View
        </span>
      </div>

      {/* Top Row KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white/5 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-green-400" />
            <span className="text-xs text-navy-400">Revenue</span>
          </div>
          <div className="text-xl font-bold text-white">{formatCurrency(data.revenue.current)}</div>
          <div className="flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3 text-green-400" />
            <span className="text-xs text-green-400">+{revenueChange.toFixed(1)}%</span>
            <span className="text-xs text-navy-500">vs prev mo.</span>
          </div>
        </div>

        <div className="bg-white/5 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Package className="w-4 h-4 text-ocean-400" />
            <span className="text-xs text-navy-400">Volume</span>
          </div>
          <div className="text-xl font-bold text-white">{data.volume.containers} containers</div>
          <div className="text-xs text-navy-500 mt-1">{data.volume.teus} TEUs · {data.volume.weight}</div>
        </div>

        <div className="bg-white/5 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <PiggyBank className="w-4 h-4 text-cargo-400" />
            <span className="text-xs text-navy-400">Total Savings</span>
          </div>
          <div className="text-xl font-bold text-white">{formatCurrency(data.savings.total)}</div>
          <div className="text-xs text-navy-500 mt-1">
            FTZ: {formatCurrency(data.savings.ftz)} · Rate: {formatCurrency(data.savings.rateOpt)}
          </div>
        </div>

        <div className="bg-white/5 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-navy-400">On-Time Rate</span>
          </div>
          <div className="text-xl font-bold text-white">{data.onTime.rate}%</div>
          <div className="flex items-center gap-1 mt-1">
            {data.onTime.rate >= data.onTime.target ? (
              <>
                <CheckCircle2 className="w-3 h-3 text-green-400" />
                <span className="text-xs text-green-400">Above target</span>
              </>
            ) : (
              <>
                <TrendingDown className="w-3 h-3 text-red-400" />
                <span className="text-xs text-red-400">{(data.onTime.target - data.onTime.rate).toFixed(1)}% below target</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Revenue Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-navy-400">Revenue vs Target</span>
          <span className="text-xs text-navy-300">{formatCurrency(data.revenue.current)} / {formatCurrency(data.revenue.target)}</span>
        </div>
        <div className="w-full bg-white/5 rounded-full h-2.5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-ocean-500 to-green-500 transition-all"
            style={{ width: `${Math.min(revenueProgress, 100)}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-1">
          <span className="text-[10px] text-navy-500">{revenueProgress.toFixed(0)}% of target</span>
          <span className="text-[10px] text-navy-500">
            <Target className="w-2.5 h-2.5 inline mr-0.5" />
            {formatCurrency(data.revenue.target)}
          </span>
        </div>
      </div>

      {/* Risks & Wins */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span className="text-sm font-medium text-red-300">Top Risks</span>
          </div>
          <div className="space-y-2">
            {data.topRisks.map((risk, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-red-500/20 text-red-400 text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span className="text-xs text-navy-300">{risk}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-green-500/5 border border-green-500/10 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-4 h-4 text-green-400" />
            <span className="text-sm font-medium text-green-300">Top Wins</span>
          </div>
          <div className="space-y-2">
            {data.topWins.map((win, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-green-500/20 text-green-400 text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span className="text-xs text-navy-300">{win}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

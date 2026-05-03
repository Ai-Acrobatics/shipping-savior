"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Ship,
  Navigation,
  DollarSign,
  Clock,
  Activity,
  ArrowLeft,
  Bell,
  RefreshCw,
} from "lucide-react";
import InteractiveRouteMap from "@/components/InteractiveRouteMap";
import CostBreakdownChart from "@/components/CostBreakdownChart";
import TransitTimeComparison from "@/components/TransitTimeComparison";
import TrendAnalysisChart from "@/components/TrendAnalysisChart";

type Tab = "map" | "costs" | "transit" | "trends";

const tabs: { key: Tab; label: string; icon: typeof Navigation }[] = [
  { key: "map", label: "Route Map", icon: Navigation },
  { key: "costs", label: "Cost Breakdown", icon: DollarSign },
  { key: "transit", label: "Route Comparison", icon: Clock },
  { key: "trends", label: "Rate Trends", icon: Activity },
];

export default function RoutesPage() {
  const [activeTab, setActiveTab] = useState<Tab>("map");

  return (
    <div className="min-h-screen bg-[#020a17]">
      {/* Top Nav */}
      <header className="glass border-b border-white/5 px-6 py-4 sticky top-0 z-40">
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-ocean-500 to-ocean-700 flex items-center justify-center">
                <Ship className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-sm">
                Shipping<span className="gradient-text">Savior</span>
              </span>
            </Link>
            <nav className="hidden md:flex items-center gap-1">
              {[
                { label: "Dashboard", href: "/dashboard" },
                { label: "Routes", href: "/routes", active: true },
                { label: "FTZ Zones", href: "/ftz-analyzer" },
                { label: "Proposal", href: "/" },
              ].map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    item.active
                      ? "bg-ocean-500/20 text-ocean-300"
                      : "text-navy-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 text-xs glass glass-hover px-3 py-2 rounded-lg text-navy-300">
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Live rates</span>
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-ocean-600 to-ocean-800 flex items-center justify-center text-xs font-bold text-white">
              JS
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-screen-2xl mx-auto px-6 py-8 space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">
            Routes & Visualization
          </h1>
          <p className="text-sm text-navy-400 mt-1">
            Interactive shipping routes, cost analysis, and freight rate trends
            across SE Asia → US lanes
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 glass rounded-xl p-1 w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? "bg-ocean-500/30 text-ocean-300"
                  : "text-navy-400 hover:text-navy-200"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="glass rounded-2xl p-6">
          {activeTab === "map" && <InteractiveRouteMap />}
          {activeTab === "costs" && <CostBreakdownChart />}
          {activeTab === "transit" && <TransitTimeComparison />}
          {activeTab === "trends" && <TrendAnalysisChart />}
        </div>

        {/* Bottom Navigation — AI-8729: removed Back to Proposal (kicked platform users to marketing site) */}
        <div className="flex items-center pb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-navy-400 hover:text-ocean-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

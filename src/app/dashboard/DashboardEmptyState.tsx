"use client";

import Link from "next/link";
import { Ship, Upload, ArrowRight, Calculator, Shield, BarChart3 } from "lucide-react";

export default function DashboardEmptyState() {
  return (
    <div className="min-h-screen bg-navy-50">
      <div className="max-w-screen-2xl mx-auto px-6 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Operations Dashboard</h1>
          <p className="text-sm text-navy-500 mt-1">
            Real-time view of all shipments, costs, and partner activity
          </p>
        </div>

        {/* Empty state hero */}
        <div className="bg-white border border-navy-100 rounded-2xl p-12 text-center shadow-soft">
          <div className="w-16 h-16 rounded-full bg-ocean-50 flex items-center justify-center mx-auto mb-4">
            <Ship className="w-8 h-8 text-ocean-600" />
          </div>
          <h2 className="text-lg font-semibold text-navy-900 mb-2">
            Welcome to Shipping Savior
          </h2>
          <p className="text-sm text-navy-500 max-w-md mx-auto mb-6">
            Get started by importing your shipments. We&apos;ll surface
            real-time tracking, cost analysis, and savings opportunities as your
            data flows in.
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

        {/* Quick start tiles */}
        <div className="grid md:grid-cols-3 gap-4">
          {[
            {
              icon: Calculator,
              title: "Run a calculator",
              description: "Estimate landed cost, FTZ savings, or container utilization without importing anything.",
              href: "/platform",
              cta: "Open calculators",
            },
            {
              icon: Shield,
              title: "Set up FTZ analysis",
              description: "See how a Foreign Trade Zone could reduce duties on your inbound shipments.",
              href: "/platform/calculators/ftz-savings",
              cta: "Try FTZ Savings",
            },
            {
              icon: BarChart3,
              title: "Compare carriers",
              description: "Benchmark spot vs contract rates across major lanes before you negotiate.",
              href: "/carrier-comparison",
              cta: "Compare carriers",
            },
          ].map((tile) => (
            <Link
              key={tile.title}
              href={tile.href}
              className="bg-white border border-navy-100 rounded-2xl p-5 hover:shadow-card hover:border-navy-200 transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-ocean-50 flex items-center justify-center mb-3">
                <tile.icon className="w-5 h-5 text-ocean-600" />
              </div>
              <h3 className="text-sm font-semibold text-navy-900 mb-1">{tile.title}</h3>
              <p className="text-xs text-navy-500 mb-3">{tile.description}</p>
              <span className="inline-flex items-center gap-1 text-xs text-ocean-700 font-medium group-hover:gap-2 transition-all">
                {tile.cta}
                <ArrowRight className="w-3 h-3" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

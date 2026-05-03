"use client";

/**
 * /demo — public investor scenario picker.
 *
 * Linear: AI-8727
 *
 * Replaces the previous broken state where each card linked to a generic
 * /dashboard with a fake "0/4" progress indicator that did nothing.
 *
 * Now:
 *  - Three real scenarios pulled from src/lib/data/demo-scenarios.ts
 *  - Each card CTA links to /platform/scenarios/<id>?tour=true, which
 *    redirects into the dashboard with the lane pre-loaded and the
 *    GuidedTour overlay activated.
 *  - Each card surfaces its real walkthrough length (5 min vs 12 min deep
 *    dive) instead of a fake progress counter.
 *  - Fourth backhaul card removed per the v1.1 demo brief.
 */

import { useState } from "react";
import Link from "next/link";
import ScheduleDemoButton from "@/components/cal/ScheduleDemoButton";
import {
  Ship, Truck, Anchor,
  ArrowRight, ChevronRight, Globe,
  DollarSign, Clock, Shield, TrendingDown, Sparkles,
} from "lucide-react";
import { demoScenarios, type DemoScenario } from "@/lib/data/demo-scenarios";

const accentClasses: Record<DemoScenario["accent"], {
  text: string;
  bg: string;
  border: string;
  glow: string;
  ringFrom: string;
}> = {
  blue: {
    text: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
    glow: "shadow-[0_0_40px_rgba(59,130,246,0.15)]",
    ringFrom: "from-blue-500",
  },
  emerald: {
    text: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    glow: "shadow-[0_0_40px_rgba(16,185,129,0.15)]",
    ringFrom: "from-emerald-500",
  },
  amber: {
    text: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    glow: "shadow-[0_0_40px_rgba(245,158,11,0.15)]",
    ringFrom: "from-amber-500",
  },
};

const modeIcon = {
  "ocean-reefer": Ship,
  "ocean-dry": Ship,
  "jones-act-multimodal": Anchor,
} as const;

function formatMoney(v: number) {
  return v.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

export default function DemoPage() {
  const [activeId, setActiveId] = useState<string | null>(demoScenarios[0]?.id ?? null);

  return (
    <main className="min-h-screen bg-[#0a0a1a] text-white overflow-hidden">
      {/* ── NAV BAR ── */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-[#0a0a1a]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-ocean-500 to-indigo-600 flex items-center justify-center">
              <Ship className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">
              Shipping<span className="text-ocean-400">Savior</span>
            </span>
          </Link>
          <Link
            href="/platform/dashboard"
            className="text-sm text-white/60 hover:text-white transition-colors"
          >
            Open Dashboard
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative pt-32 pb-16 px-6 text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-ocean-500/8 rounded-full blur-[120px] pointer-events-none" />
        <p className="text-sm font-semibold text-ocean-400 tracking-widest uppercase mb-4">
          Live Demo
        </p>
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tighter mb-5">
          Pick a real shipment
        </h1>
        <p className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto leading-relaxed">
          Three pre-loaded scenarios. Real lanes, real carriers, real numbers.
          Click one and we&apos;ll walk you through the platform with that data live.
        </p>
      </section>

      {/* ── SCENARIO CARDS ── */}
      <section className="max-w-5xl mx-auto px-6 pb-32 space-y-6">
        {demoScenarios.map((scenario) => {
          const isOpen = activeId === scenario.id;
          const accent = accentClasses[scenario.accent];
          const Icon = modeIcon[scenario.mode] ?? Ship;
          const cheapest = [...scenario.carriers].sort((a, b) => a.rate - b.rate)[0];

          return (
            <div
              key={scenario.id}
              className={`rounded-2xl border transition-all duration-500 cursor-pointer
                ${isOpen
                  ? `${accent.border} ${accent.glow} bg-white/[0.03]`
                  : "border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]"
                }`}
              onClick={() => setActiveId(isOpen ? null : scenario.id)}
            >
              {/* Header */}
              <div className="flex items-center gap-4 p-6">
                <div className={`w-12 h-12 rounded-xl ${accent.bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-6 h-6 ${accent.text}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-mono ${accent.text} opacity-60 uppercase tracking-wider`}>
                      {scenario.mode === "jones-act-multimodal" ? "Jones Act" : scenario.mode === "ocean-reefer" ? "Reefer" : "Ocean dry"}
                    </span>
                    <h2 className="text-lg font-bold truncate">{scenario.name}</h2>
                  </div>
                  <p className="text-sm text-white/40 truncate">
                    {scenario.containerCount}× {scenario.containerType} · {scenario.commodity.split(" (")[0]}
                  </p>
                </div>
                <div className="hidden sm:flex items-center gap-1.5 text-xs text-white/40 font-medium">
                  <Clock className="w-3.5 h-3.5" />
                  {scenario.walkthroughLength}
                </div>
                <ChevronRight
                  className={`w-5 h-5 text-white/20 transition-transform duration-300 flex-shrink-0 ${
                    isOpen ? "rotate-90" : ""
                  }`}
                />
              </div>

              {/* Expanded Content */}
              <div
                className={`overflow-hidden transition-all duration-500 ${
                  isOpen ? "max-h-[900px] opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div className="px-6 pb-6 space-y-6">
                  <div className={`h-px ${accent.bg}`} />

                  {/* Route */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                      <Globe className={`w-4 h-4 ${accent.text}`} />
                      <span className="text-sm font-medium">{scenario.origin}</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/20">
                      <div className="w-12 h-px bg-current" />
                      <ArrowRight className="w-4 h-4" />
                      <div className="w-12 h-px bg-current" />
                    </div>
                    <span className="text-sm font-medium">{scenario.destination}</span>
                  </div>

                  {/* Carrier table */}
                  <div className="rounded-xl border border-white/5 overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/5">
                          <th className="text-left px-4 py-3 text-white/30 font-medium text-xs uppercase tracking-wider">Carrier</th>
                          <th className="text-left px-4 py-3 text-white/30 font-medium text-xs uppercase tracking-wider">
                            <span className="inline-flex items-center gap-1">
                              <DollarSign className="w-3 h-3" /> Rate
                            </span>
                          </th>
                          <th className="text-left px-4 py-3 text-white/30 font-medium text-xs uppercase tracking-wider">
                            <span className="inline-flex items-center gap-1">
                              <Clock className="w-3 h-3" /> Transit
                            </span>
                          </th>
                          <th className="text-left px-4 py-3 text-white/30 font-medium text-xs uppercase tracking-wider">
                            <span className="inline-flex items-center gap-1">
                              <Shield className="w-3 h-3" /> Reliability
                            </span>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {scenario.carriers.map((c) => (
                          <tr
                            key={c.name}
                            className={`border-b border-white/5 last:border-0 ${
                              c.highlight ? `${accent.bg}` : ""
                            }`}
                          >
                            <td className="px-4 py-3 font-medium">
                              {c.name}
                              {c.highlight && (
                                <span className={`ml-2 text-[10px] font-bold uppercase ${accent.text}`}>
                                  Best
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-white/70 font-mono text-xs">{formatMoney(c.rate)}</td>
                            <td className="px-4 py-3 text-white/70 font-mono text-xs">{c.transitDays}d</td>
                            <td className="px-4 py-3 text-white/70 font-mono text-xs">
                              {c.reliabilityLabel ?? `${c.reliability}%`}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Savings callout */}
                  <div className={`rounded-xl ${accent.bg} border ${accent.border} p-5 flex items-center gap-4`}>
                    <div className="w-14 h-14 rounded-xl bg-[#0a0a1a] flex items-center justify-center flex-shrink-0">
                      <TrendingDown className={`w-7 h-7 ${accent.text}`} />
                    </div>
                    <div className="flex-1">
                      <div className={`text-xl font-bold ${accent.text}`}>
                        {scenario.savingsCallout}
                      </div>
                      <div className="text-sm text-white/50 mt-1">{scenario.useCase}</div>
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-2 text-xs text-white/40">
                      <Sparkles className="w-3.5 h-3.5" />
                      Cheapest carrier on this lane:{" "}
                      <span className="text-white/80 font-semibold">
                        {cheapest?.name ?? "—"} {cheapest ? `at ${formatMoney(cheapest.rate)}` : ""}
                      </span>
                    </div>
                    <Link
                      href={`/platform/scenarios/${scenario.id}?tour=true`}
                      onClick={(e) => e.stopPropagation()}
                      className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold
                        ${accent.bg} ${accent.text} border ${accent.border}
                        hover:brightness-125 transition-all`}
                    >
                      Start guided walkthrough
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* ── BOTTOM CTA ── */}
        <div className="text-center pt-16 pb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to optimize your supply chain?
          </h2>
          <p className="text-white/40 mb-8 max-w-lg mx-auto">
            Start comparing carriers, calculating landed costs, and finding savings across every shipping lane.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <ScheduleDemoButton
              source="demo_page_bottom_cta"
              modalTitle="Book a Shipping Savior demo"
              className="inline-flex items-center gap-3 bg-gradient-to-r from-ocean-500 to-indigo-600 text-white font-bold px-10 py-4 rounded-full text-lg
                shadow-[0_8px_32px_rgba(37,99,235,0.3)] hover:shadow-[0_12px_48px_rgba(37,99,235,0.45)]
                hover:brightness-110 transition-all duration-300"
            >
              Schedule a Demo
              <ArrowRight className="w-5 h-5" />
            </ScheduleDemoButton>
            <Link
              href="/platform/dashboard"
              className="inline-flex items-center gap-3 border border-white/20 hover:border-white/40 text-white font-medium px-10 py-4 rounded-full text-lg
                hover:bg-white/5 transition-all duration-300"
            >
              Open Dashboard
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-3 border border-white/20 hover:border-white/40 text-white font-medium px-10 py-4 rounded-full text-lg
                hover:bg-white/5 transition-all duration-300"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

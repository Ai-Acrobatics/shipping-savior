"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Ship, Truck, Anchor, Package,
  ArrowRight, ChevronRight, Globe,
  DollarSign, Clock, Shield, TrendingDown,
} from "lucide-react";

/* ────────── SCENARIO DATA ────────── */

type Scenario = {
  id: number;
  title: string;
  subtitle: string;
  accent: string;
  accentBg: string;
  accentBorder: string;
  accentGlow: string;
  icon: typeof Ship;
  route: { origin: string; destination: string; distance: string };
  carriers: {
    name: string;
    transit: string;
    reliability: string;
    highlight?: boolean;
  }[];
  metric: { value: string; label: string };
  insight: string;
  cta: { label: string; href: string };
};

const scenarios: Scenario[] = [
  {
    id: 1,
    title: "Ocean Freight — Asia to West Coast",
    subtitle: "Compare 7 carriers in seconds instead of hours of manual research",
    accent: "text-blue-400",
    accentBg: "bg-blue-500/10",
    accentBorder: "border-blue-500/30",
    accentGlow: "shadow-[0_0_40px_rgba(59,130,246,0.15)]",
    icon: Ship,
    route: { origin: "Qingdao, China", destination: "Port of Los Angeles", distance: "6,252 nmi" },
    carriers: [
      { name: "Maersk", transit: "32 days", reliability: "75%", highlight: false },
      { name: "MSC", transit: "34 days", reliability: "68%" },
      { name: "CMA CGM", transit: "31 days", reliability: "72%", highlight: true },
      { name: "COSCO", transit: "33 days", reliability: "70%" },
    ],
    metric: { value: "$1,200", label: "FTZ savings per container" },
    insight: "Compare 7 carriers in seconds instead of hours of manual research",
    cta: { label: "Try Route Comparison", href: "/dashboard?scenario=qingdao-la" },
  },
  {
    id: 2,
    title: "Cross-Dock — Trader Joe's Supply Chain",
    subtitle: "Optimize last-mile routing to cut costs and transit time",
    accent: "text-emerald-400",
    accentBg: "bg-emerald-500/10",
    accentBorder: "border-emerald-500/30",
    accentGlow: "shadow-[0_0_40px_rgba(16,185,129,0.15)]",
    icon: Truck,
    route: { origin: "Port of Hueneme", destination: "Palmdale/Lancaster (TJ Dist. Center)", distance: "70 mi via 126/Fillmore" },
    carriers: [
      { name: "126/Fillmore Bypass", transit: "1.5 hrs", reliability: "70 mi", highlight: true },
      { name: "San Diego via LA", transit: "4.5 hrs", reliability: "150+ mi" },
      { name: "I-5 Corridor", transit: "3.5 hrs", reliability: "120 mi" },
    ],
    metric: { value: "$350", label: "savings per load + 3 hours faster" },
    insight: "Optimize last-mile routing to cut costs and transit time",
    cta: { label: "Try Route Optimizer", href: "/dashboard?scenario=tj-crossdock" },
  },
  {
    id: 3,
    title: "Jones Act — Domestic Hawaii",
    subtitle: "Compare Jones Act carriers for US territory shipping",
    accent: "text-amber-400",
    accentBg: "bg-amber-500/10",
    accentBorder: "border-amber-500/30",
    accentGlow: "shadow-[0_0_40px_rgba(245,158,11,0.15)]",
    icon: Anchor,
    route: { origin: "Los Angeles", destination: "Honolulu", distance: "2,226 nmi" },
    carriers: [
      { name: "Matson (CLX)", transit: "5 days", reliability: "85%", highlight: true },
      { name: "Pasha Hawaii", transit: "6 days", reliability: "82%" },
    ],
    metric: { value: "$0", label: "customs/duties — domestic American flag vessels" },
    insight: "Compare Jones Act carriers for US territory shipping",
    cta: { label: "Search Jones Act Routes", href: "/dashboard?scenario=ja-hawaii" },
  },
  {
    id: 4,
    title: "Backhaul — European Export Program",
    subtitle: "Turn empty return containers into revenue",
    accent: "text-purple-400",
    accentBg: "bg-purple-500/10",
    accentBorder: "border-purple-500/30",
    accentGlow: "shadow-[0_0_40px_rgba(168,85,247,0.15)]",
    icon: Package,
    route: { origin: "Rotterdam", destination: "Puerto Barrios, Guatemala", distance: "5,100 nmi" },
    carriers: [
      { name: "Chiquita / Great White Fleet", transit: "14 days", reliability: "78%", highlight: true },
      { name: "CMA CGM", transit: "18 days", reliability: "72%" },
      { name: "Hapag-Lloyd", transit: "16 days", reliability: "74%" },
    ],
    metric: { value: "40%", label: "cost reduction via backhaul fill" },
    insight: "Turn empty return containers into revenue",
    cta: { label: "Explore Backhaul Deals", href: "/dashboard?scenario=eu-backhaul" },
  },
];

/* ────────── COMPONENT ────────── */

export default function DemoPage() {
  const [activeId, setActiveId] = useState<number | null>(1);

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
            href="/dashboard"
            className="text-sm text-white/60 hover:text-white transition-colors"
          >
            Open Dashboard
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative pt-32 pb-20 px-6 text-center">
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-ocean-500/8 rounded-full blur-[120px] pointer-events-none" />

        <p className="text-sm font-semibold text-ocean-400 tracking-widest uppercase mb-4">
          Live Demo
        </p>
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tighter mb-5">
          Shipping Savior
        </h1>
        <p className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto leading-relaxed mb-10">
          See how global trade intelligence works across 4 real-world scenarios
        </p>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-3 mb-6">
          {scenarios.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveId(activeId === s.id ? null : s.id)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                activeId === s.id
                  ? "scale-125 bg-ocean-400 ring-2 ring-ocean-400/40"
                  : "bg-white/20 hover:bg-white/40"
              }`}
              aria-label={`Scenario ${s.id}`}
            />
          ))}
          <span className="ml-3 text-xs text-white/30 font-mono">
            {activeId ? `${activeId}/4` : "0/4"}
          </span>
        </div>
      </section>

      {/* ── SCENARIO CARDS ── */}
      <section className="max-w-5xl mx-auto px-6 pb-32 space-y-6">
        {scenarios.map((scenario) => {
          const isOpen = activeId === scenario.id;
          const Icon = scenario.icon;

          return (
            <div
              key={scenario.id}
              className={`rounded-2xl border transition-all duration-500 cursor-pointer
                ${isOpen
                  ? `${scenario.accentBorder} ${scenario.accentGlow} bg-white/[0.03]`
                  : "border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]"
                }`}
              onClick={() => setActiveId(isOpen ? null : scenario.id)}
            >
              {/* Header */}
              <div className="flex items-center gap-4 p-6">
                <div className={`w-12 h-12 rounded-xl ${scenario.accentBg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-6 h-6 ${scenario.accent}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-mono ${scenario.accent} opacity-60`}>
                      {String(scenario.id).padStart(2, "0")}
                    </span>
                    <h2 className="text-lg font-bold truncate">{scenario.title}</h2>
                  </div>
                  <p className="text-sm text-white/40 truncate">{scenario.subtitle}</p>
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
                  isOpen ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div className="px-6 pb-6 space-y-6">
                  {/* Divider */}
                  <div className={`h-px ${scenario.accentBg}`} />

                  {/* Route Visualization */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                      <Globe className={`w-4 h-4 ${scenario.accent}`} />
                      <span className="text-sm font-medium">{scenario.route.origin}</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/20">
                      <div className="w-12 h-px bg-current" />
                      <span className="text-xs font-mono">{scenario.route.distance}</span>
                      <div className="w-12 h-px bg-current" />
                      <ArrowRight className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium">{scenario.route.destination}</span>
                  </div>

                  {/* Carrier Comparison Table */}
                  <div className="rounded-xl border border-white/5 overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/5">
                          <th className="text-left px-4 py-3 text-white/30 font-medium text-xs uppercase tracking-wider">
                            {scenario.id === 2 ? "Route" : "Carrier"}
                          </th>
                          <th className="text-left px-4 py-3 text-white/30 font-medium text-xs uppercase tracking-wider">
                            <span className="inline-flex items-center gap-1">
                              <Clock className="w-3 h-3" /> Transit
                            </span>
                          </th>
                          <th className="text-left px-4 py-3 text-white/30 font-medium text-xs uppercase tracking-wider">
                            <span className="inline-flex items-center gap-1">
                              <Shield className="w-3 h-3" /> {scenario.id === 2 ? "Distance" : "Reliability"}
                            </span>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {scenario.carriers.map((c, i) => (
                          <tr
                            key={c.name}
                            className={`border-b border-white/5 last:border-0 ${
                              c.highlight ? `${scenario.accentBg}` : ""
                            }`}
                          >
                            <td className="px-4 py-3 font-medium">
                              {c.name}
                              {c.highlight && (
                                <span className={`ml-2 text-[10px] font-bold uppercase ${scenario.accent}`}>
                                  Best
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-white/70 font-mono text-xs">{c.transit}</td>
                            <td className="px-4 py-3 text-white/70 font-mono text-xs">{c.reliability}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Key Metric Callout */}
                  <div className={`rounded-xl ${scenario.accentBg} border ${scenario.accentBorder} p-5 flex items-center gap-4`}>
                    <div className={`w-14 h-14 rounded-xl bg-[#0a0a1a] flex items-center justify-center flex-shrink-0`}>
                      {scenario.id === 3 ? (
                        <Shield className={`w-7 h-7 ${scenario.accent}`} />
                      ) : scenario.id === 4 ? (
                        <TrendingDown className={`w-7 h-7 ${scenario.accent}`} />
                      ) : (
                        <DollarSign className={`w-7 h-7 ${scenario.accent}`} />
                      )}
                    </div>
                    <div>
                      <div className={`text-3xl font-bold ${scenario.accent}`}>
                        {scenario.metric.value}
                      </div>
                      <div className="text-sm text-white/50">{scenario.metric.label}</div>
                    </div>
                  </div>

                  {/* Insight + CTA */}
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <p className="text-sm text-white/40 italic max-w-md">
                      &ldquo;{scenario.insight}&rdquo;
                    </p>
                    <Link
                      href={scenario.cta.href}
                      onClick={(e) => e.stopPropagation()}
                      className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold
                        ${scenario.accentBg} ${scenario.accent} border ${scenario.accentBorder}
                        hover:brightness-125 transition-all`}
                    >
                      {scenario.cta.label}
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
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-3 bg-gradient-to-r from-ocean-500 to-indigo-600 text-white font-bold px-10 py-4 rounded-full text-lg
                shadow-[0_8px_32px_rgba(37,99,235,0.3)] hover:shadow-[0_12px_48px_rgba(37,99,235,0.45)]
                hover:brightness-110 transition-all duration-300"
            >
              Schedule Demo
              <ArrowRight className="w-5 h-5" />
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

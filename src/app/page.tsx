import { Suspense } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import ScrollReveal from "@/components/ScrollReveal";
import ParallaxSection from "@/components/ParallaxSection";
import AnimatedCounter from "@/components/AnimatedCounter";
import UnitEconomicsCalculator from "@/components/UnitEconomicsCalculator";
import FTZSavingsCalculator from "@/components/FTZSavingsCalculator";
import ShippingRouteMap from "@/components/ShippingRouteMap";
import RateComparisonChart from "@/components/RateComparisonChart";
import TariffBreakdownChart from "@/components/TariffBreakdownChart";
import PortComparisonTool from "@/components/PortComparisonTool";
import PricingTiers from "@/components/PricingTiers";
import PlatformWireframes from "@/components/PlatformWireframes";
import CTASection from "@/components/CTASection";
import {
  Ship, Globe, Calculator, Shield, BarChart3, FileText,
  Anchor, Container, Route, Database, Map, Truck,
  ArrowRight, Check, Zap, TrendingUp, Clock, DollarSign,
  LayoutDashboard, Brain, Bot, Radar, FileCheck, Monitor,
} from "lucide-react";

const platformFeatures = [
  {
    icon: Calculator,
    title: "Landed Cost Calculator",
    description: "Unit cost + shipping + duties + fulfillment = true per-unit landed cost with multi-currency support",
    color: "from-ocean-500 to-ocean-600",
    bgLight: "bg-ocean-50",
    iconColor: "text-ocean-600",
  },
  {
    icon: Shield,
    title: "FTZ Savings Analyzer",
    description: "Lock duty rates at entry, model incremental withdrawals, compare FTZ vs non-FTZ scenarios",
    color: "from-emerald-500 to-emerald-600",
    bgLight: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
  {
    icon: Route,
    title: "Route Comparison",
    description: "Compare carrier options with backhaul pricing, transshipment routes, and transit time analysis",
    color: "from-cargo-500 to-cargo-600",
    bgLight: "bg-amber-50",
    iconColor: "text-amber-600",
  },
  {
    icon: Globe,
    title: "Tariff Estimator",
    description: "HTS code lookup with duty rates by country of origin. SE Asia focus: Vietnam, Thailand, Indonesia, Cambodia",
    color: "from-purple-500 to-purple-600",
    bgLight: "bg-purple-50",
    iconColor: "text-purple-600",
  },
  {
    icon: Container,
    title: "Container Calculator",
    description: "Optimize utilization by volume AND weight. Shows which limit you hit first and cost-per-unit at scale",
    color: "from-blue-500 to-blue-600",
    bgLight: "bg-blue-50",
    iconColor: "text-blue-600",
  },
  {
    icon: Map,
    title: "Interactive Route Map",
    description: "WebGL-powered visualization of shipping lanes, transshipment hubs, and port locations worldwide",
    color: "from-teal-500 to-teal-600",
    bgLight: "bg-teal-50",
    iconColor: "text-teal-600",
  },
];

const importSteps = [
  { step: "01", title: "Source Product", subtitle: "SE Asia", description: "Identify high-quality products. Quality inspection. Negotiate unit price.", icon: Globe },
  { step: "02", title: "Purchase & Ship", subtitle: "Ocean Freight", description: "Bankroll container. Book carrier. ISF filing 24h before departure.", icon: Ship },
  { step: "03", title: "Customs Clearance", subtitle: "US CBP", description: "HTS classification. Duty calculation. Pay MPF + HMF. Possible exam.", icon: FileText },
  { step: "04", title: "FTZ Entry", subtitle: "Bonded Warehouse", description: "Lock duty rate at entry date. Store goods behind bonded gate.", icon: Shield },
  { step: "05", title: "Withdraw & Fulfill", subtitle: "Incremental", description: "Pull pallets as needed. Pay duty per withdrawal. Ship to 3PL.", icon: Truck },
  { step: "06", title: "Sell & Profit", subtitle: "Online/Wholesale", description: "List on marketplace. Fulfill orders. Track margins per SKU.", icon: DollarSign },
];

const hiddenCosts = [
  { name: "Demurrage", range: "$150-400/day", description: "Container sits at port too long" },
  { name: "Detention", range: "$100-300/day", description: "Container not returned to carrier in time" },
  { name: "Chassis Fees", range: "$20-35/day", description: "Chassis rental for container transport" },
  { name: "Drayage", range: "$200-800", description: "Truck from port to warehouse" },
  { name: "Exam Fees", range: "$300-3,000", description: "CBP inspects your container" },
  { name: "MPF", range: "0.3464%", description: "Merchandise Processing Fee" },
  { name: "HMF", range: "0.125%", description: "Harbor Maintenance Fee" },
  { name: "Customs Bond", range: "$500-5K/yr", description: "Required surety bond for importing" },
];

const techStack = [
  { name: "Next.js 14", purpose: "Full-stack framework with App Router" },
  { name: "MapLibre GL + deck.gl", purpose: "Free WebGL map rendering (no Mapbox costs)" },
  { name: "Recharts + Tremor", purpose: "Dashboard charts and KPI cards" },
  { name: "decimal.js", purpose: "Precise financial calculations (no floating-point errors)" },
  { name: "USITC HTS API", purpose: "Free tariff/duty rate data from US government" },
  { name: "OFIS Database", purpose: "260+ FTZ locations from trade.gov" },
];

const roadmapPhases = [
  {
    phase: 1,
    title: "Proposal Site + Wireframes",
    status: "In Progress",
    items: ["Interactive proposal website", "Platform wireframes", "Architecture diagrams", "Live calculators"],
    color: "border-ocean-500",
    dotColor: "bg-ocean-500",
  },
  {
    phase: 2,
    title: "Data Foundation + Core Calculators",
    status: "Next",
    items: ["HTS tariff dataset (100K+ codes)", "Landed cost calculator", "Container utilization", "Port & route data"],
    color: "border-cargo-500",
    dotColor: "bg-cargo-500",
  },
  {
    phase: 3,
    title: "Visualization Layer",
    status: "In Progress",
    items: ["Interactive shipping route map", "Port comparison tool", "Dashboard charts", "Carrier comparison UI"],
    color: "border-purple-500",
    dotColor: "bg-purple-500",
  },
  {
    phase: 4,
    title: "FTZ Analyzer + Tariff Scenarios",
    status: "In Progress",
    items: ["Full FTZ savings modeler", "Tariff scenario analysis", "Multi-scenario comparison", "What-if modeling"],
    color: "border-emerald-500",
    dotColor: "bg-emerald-500",
  },
  {
    phase: 5,
    title: "Knowledge Base + Documents",
    status: "In Progress",
    items: ["40+ glossary terms", "All 11 Incoterms 2020", "CBP compliance guides", "Trade regulations by region"],
    color: "border-blue-500",
    dotColor: "bg-blue-500",
  },
  {
    phase: 6,
    title: "Dashboard + Tracking",
    status: "In Progress",
    items: ["Shipment tracking overview", "Cost/margin dashboard", "Cold chain vs general cargo", "Partner status"],
    color: "border-teal-500",
    dotColor: "bg-teal-500",
  },
];

const aiAgentsMini = [
  { name: "Tariff Intelligence", icon: Radar, gradient: "from-ocean-600 to-indigo-600", desc: "Monitors HTS changes & alerts on duty rate shifts" },
  { name: "Route Optimization", icon: Route, gradient: "from-cargo-500 to-orange-600", desc: "Finds best backhaul deals & carrier schedules" },
  { name: "FTZ Strategy", icon: Shield, gradient: "from-emerald-500 to-teal-600", desc: "Models withdrawal schedules & optimizes duty timing" },
  { name: "Compliance Monitor", icon: FileCheck, gradient: "from-purple-500 to-violet-600", desc: "Tracks ISF deadlines & flags documentation gaps" },
  { name: "Cost Analysis", icon: TrendingUp, gradient: "from-blue-500 to-cyan-600", desc: "Tracks landed costs & identifies margin optimization" },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Header />

      {/* ===== HERO ===== */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden hero-gradient grain-overlay">
        {/* Dot grid pattern */}
        <div className="absolute inset-0 pattern-dots-hero" />

        {/* Animated gradient orbs */}
        <div className="orb top-1/4 -left-32 w-[500px] h-[500px] bg-ocean-300/30 animate-orb-float-1" />
        <div className="orb bottom-1/4 -right-32 w-[400px] h-[400px] bg-indigo-300/25 animate-orb-float-2" />
        <div className="orb top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-ocean-200/20 animate-orb-float-3" />

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-ocean-200/60 rounded-full px-5 py-2.5 mb-8 shadow-soft">
            <Zap className="w-4 h-4 text-ocean-600" />
            <span className="text-sm font-medium text-navy-600">AI-Powered International Logistics Platform</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-6 text-navy-900">
            <span className="gradient-text-hero">Shipping</span>{" "}
            <span>Savior</span>
          </h1>

          <p className="text-xl md:text-2xl text-navy-600 max-w-3xl mx-auto mb-4 leading-relaxed">
            Turn manual freight brokerage into{" "}
            <span className="text-ocean-600 font-semibold">data-driven operations</span>.
            Calculators, route comparison, FTZ strategy, and tariff optimization
            — all powered by autonomous AI agents.
          </p>

          <p className="text-lg text-navy-400 max-w-2xl mx-auto mb-10">
            Built for international freight operators who dominate cold chain exports
            and are expanding into SE Asia consumer goods imports.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#calculators" className="btn-primary px-8 py-4 text-base">
              Try Live Calculators
              <ArrowRight className="w-5 h-5" />
            </a>
            <Link href="/agreement" className="btn-secondary px-8 py-4 text-base">
              <FileText className="w-5 h-5" />
              View Full Proposal
            </Link>
          </div>

          {/* Stats bar */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "HTS Codes", value: "100K+", icon: Database },
              { label: "Ports Mapped", value: "3,700+", icon: Anchor },
              { label: "FTZ Zones", value: "260+", icon: Shield },
              { label: "API Cost", value: "$0", icon: DollarSign },
            ].map((stat) => (
              <div key={stat.label} className="group bg-white/70 backdrop-blur-sm border border-navy-200/50 rounded-xl p-5 shadow-soft hover:shadow-card hover:-translate-y-0.5 transition-all duration-300">
                <stat.icon className="w-5 h-5 text-ocean-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-navy-900">
                  <AnimatedCounter value={stat.value} />
                </div>
                <div className="text-xs font-medium text-navy-400 mt-1">{stat.label}</div>
                {/* Accent line */}
                <div className="mt-3 h-0.5 w-8 mx-auto rounded-full bg-gradient-to-r from-ocean-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
        </div>

        {/* Wave divider at bottom */}
        <div className="absolute bottom-0 left-0 right-0 z-10">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0,32L80,26.7C160,21,320,11,480,10.7C640,11,800,21,960,26.7C1120,32,1280,32,1360,32L1440,32L1440,60L0,60Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* ===== TRUSTED BY / SOCIAL PROOF ===== */}
      <section className="py-14 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <p className="text-sm font-medium text-navy-400 tracking-wider uppercase">Built For Industry Leaders</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-14 opacity-50">
            {["Cold Chain Exports", "SE Asia Imports", "FTZ Operations", "Freight Brokerage", "3PL Management"].map((name) => (
              <div key={name} className="flex items-center gap-2 text-navy-400">
                <Ship className="w-4 h-4" />
                <span className="text-sm font-semibold tracking-wide">{name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== AI-POWERED AGENTS MINI SECTION ===== */}
      <section className="py-20 px-6 section-alt">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-200 rounded-full px-5 py-2.5 mb-5 shadow-soft">
                <Bot className="w-4 h-4 text-indigo-600" />
                <span className="text-sm font-medium text-indigo-700">Autonomous AI Agents</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-navy-900 mb-5">
                Powered by <span className="gradient-text-hero">5 AI Agents</span>
              </h2>
              <p className="text-lg text-navy-500 max-w-2xl mx-auto">
                Autonomous intelligence that monitors, analyzes, and optimizes
                your logistics operations 24/7.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            {aiAgentsMini.map((agent, i) => (
              <ScrollReveal key={agent.name} delay={i * 80}>
                <div className="gradient-border bg-white rounded-2xl p-5 text-center h-full hover:shadow-premium transition-all duration-300 group">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${agent.gradient} flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                    <agent.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-sm font-bold text-navy-900 mb-1.5">{agent.name}</h3>
                  <p className="text-xs text-navy-500 leading-relaxed">{agent.desc}</p>
                  <div className="flex items-center justify-center gap-1.5 mt-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-[10px] text-emerald-600 font-medium">Active</span>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal delay={400}>
            <div className="text-center">
              <Link
                href="/agreement"
                className="inline-flex items-center gap-2 text-sm font-semibold text-ocean-600 hover:text-indigo-600 transition-colors"
              >
                See full AI agent architecture
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ===== PLATFORM FEATURES ===== */}
      <section id="platform" className="py-28 px-6 bg-white relative wave-divider">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-20">
              <p className="text-sm font-semibold text-ocean-600 tracking-wider uppercase mb-3">Platform</p>
              <h2 className="text-4xl md:text-5xl font-bold text-navy-900 mb-5">
                Complete Logistics <span className="gradient-text">Toolkit</span>
              </h2>
              <p className="text-lg text-navy-500 max-w-2xl mx-auto">
                Six core tools that systematize every aspect of international freight
                operations — from sourcing to fulfillment.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {platformFeatures.map((feature, i) => (
              <ScrollReveal key={feature.title} delay={i * 100}>
                <div className="group gradient-border bg-white rounded-2xl p-7 h-full hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 card-shine">
                  <div className={`w-14 h-14 rounded-2xl ${feature.bgLight} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                    <feature.icon className={`w-7 h-7 ${feature.iconColor}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-navy-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-navy-500 leading-relaxed">{feature.description}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CALCULATOR ===== */}
      <section id="calculators" className="py-28 px-6 bg-navy-50 relative wave-divider-white">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-14">
              <div className="inline-flex items-center gap-2 bg-white border border-navy-200/60 rounded-full px-4 py-2 mb-4 shadow-soft">
                <Calculator className="w-4 h-4 text-ocean-500" />
                <span className="text-sm font-medium text-navy-600">Live Calculator</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-navy-900 mb-5">
                Unit Economics <span className="gradient-text-gold">Calculator</span>
              </h2>
              <p className="text-lg text-navy-500 max-w-2xl mx-auto">
                Model the complete value chain from origin cost to retail price.
                See exactly where your margin comes from.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal>
            <div className="bg-white border border-navy-100 rounded-2xl p-8 md:p-10 shadow-card">
              <Suspense fallback={<div className="animate-pulse h-64 bg-navy-50 rounded-xl" />}>
                <UnitEconomicsCalculator />
              </Suspense>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ===== IMPORT PIPELINE ===== */}
      <section id="routes" className="py-28 px-6 bg-white relative wave-divider">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-20">
              <p className="text-sm font-semibold text-ocean-600 tracking-wider uppercase mb-3">Process</p>
              <h2 className="text-4xl md:text-5xl font-bold text-navy-900 mb-5">
                The Import <span className="gradient-text">Pipeline</span>
              </h2>
              <p className="text-lg text-navy-500 max-w-2xl mx-auto">
                From sourcing in SE Asia to fulfillment in the US —
                every step systematized with the right tools.
              </p>
            </div>
          </ScrollReveal>

          {/* Alternating timeline layout */}
          <div className="relative">
            {/* Center line with gradient */}
            <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-ocean-500 via-indigo-500 to-cargo-500" />

            <div className="space-y-8 lg:space-y-12">
              {importSteps.map((step, i) => (
                <ScrollReveal key={step.step} delay={i * 100} direction={i % 2 === 0 ? "left" : "right"}>
                  <div className={`lg:flex items-center gap-8 ${i % 2 === 0 ? "" : "lg:flex-row-reverse"}`}>
                    <div className={`flex-1 ${i % 2 === 0 ? "lg:text-right" : "lg:text-left"}`}>
                      <div className="gradient-border bg-white rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300 inline-block text-left">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-ocean-500 to-indigo-600 flex items-center justify-center shadow-sm">
                            <step.icon className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <span className="text-xs font-semibold text-ocean-500 uppercase tracking-wide">{step.subtitle}</span>
                            <h3 className="text-lg font-semibold text-navy-900">{step.title}</h3>
                          </div>
                        </div>
                        <p className="text-sm text-navy-500 leading-relaxed">{step.description}</p>
                      </div>
                    </div>

                    {/* Center dot */}
                    <div className="hidden lg:flex items-center justify-center w-12 h-12 rounded-full bg-white border-2 border-ocean-500 shadow-md flex-shrink-0 z-10 hover:scale-110 transition-transform">
                      <span className="text-sm font-bold text-ocean-600">{step.step}</span>
                    </div>

                    <div className="flex-1" />
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== HIDDEN COSTS ===== */}
      <ParallaxSection
        className="py-28 px-6"
        bgClassName="bg-gradient-to-br from-rose-50 via-red-50 to-orange-50"
        speed={0.15}
      >
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-14">
              <p className="text-sm font-semibold text-red-500 tracking-wider uppercase mb-3">Warning</p>
              <h2 className="text-4xl md:text-5xl font-bold text-navy-900 mb-5">
                Hidden Costs That Add{" "}
                <span className="text-red-500">15-25%</span>
              </h2>
              <p className="text-lg text-navy-500 max-w-2xl mx-auto">
                Most platforms miss these. Our calculators include ALL of them
                so your landed cost is truly accurate.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {hiddenCosts.map((cost, i) => (
              <ScrollReveal key={cost.name} delay={i * 60}>
                <div className="bg-white border border-red-100 rounded-xl p-5 hover:shadow-card hover:border-red-200 hover:-translate-y-0.5 transition-all duration-300">
                  <div className="text-sm font-semibold text-navy-800">{cost.name}</div>
                  <div className="text-xl font-bold text-red-500 mt-1">{cost.range}</div>
                  <div className="text-xs text-navy-400 mt-2">{cost.description}</div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </ParallaxSection>

      {/* ===== FTZ STRATEGY ===== */}
      <ParallaxSection
        className="py-28 px-6"
        bgClassName="bg-gradient-to-br from-emerald-50/80 via-green-50/50 to-teal-50/30 pattern-dots"
        speed={0.1}
      >
        <div id="ftz" className="max-w-7xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-14">
              <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-full px-4 py-2 mb-4 shadow-soft">
                <Shield className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-medium text-emerald-700">#1 Differentiator — Zero Competitors Offer This</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-navy-900 mb-5">
                FTZ Savings <span className="text-emerald-600">Analyzer</span>
              </h2>
              <p className="text-lg text-navy-500 max-w-2xl mx-auto">
                Foreign Trade Zones lock your duty rate on entry day.
                Model the savings with incremental withdrawal scheduling.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal>
            <div className="bg-white border border-emerald-100 rounded-2xl p-8 md:p-10 shadow-card">
              <Suspense fallback={<div className="animate-pulse h-64 bg-emerald-50 rounded-xl" />}>
                <FTZSavingsCalculator />
              </Suspense>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <div className="mt-8 bg-white border border-amber-100 rounded-xl p-7 shadow-soft">
              <h3 className="text-lg font-semibold text-amber-700 mb-4">
                Why FTZ Strategy Matters
              </h3>
              <div className="grid md:grid-cols-3 gap-6 text-sm text-navy-600">
                <div>
                  <strong className="text-navy-900 block mb-1">Rate Locking</strong>
                  Duty rates are locked on the date goods enter the FTZ — regardless of
                  future tariff increases. With shifting trade policy, this is insurance.
                </div>
                <div>
                  <strong className="text-navy-900 block mb-1">Incremental Withdrawal</strong>
                  Only pay duties on goods as they leave the FTZ. Spread cash flow over months
                  instead of paying everything upfront at customs.
                </div>
                <div>
                  <strong className="text-navy-900 block mb-1">260+ US Zones</strong>
                  FTZs exist near every major port. Goods sit in bonded warehouses —
                  protected, secure, duty-deferred until you need them.
                </div>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={300}>
            <div className="mt-8 text-center">
              <a
                href="/ftz-analyzer"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-semibold px-8 py-3.5 rounded-xl transition-all hover:scale-[1.02] shadow-lg shadow-emerald-500/20"
              >
                Open Full FTZ Analyzer + Tariff Scenarios
                <ArrowRight className="w-4 h-4" />
              </a>
              <p className="text-xs text-navy-400 mt-3">
                HTS code lookup · multi-scenario comparison · zone finder · withdrawal scheduling
              </p>
            </div>
          </ScrollReveal>
        </div>
      </ParallaxSection>

      {/* ===== VISUALIZATION LAYER ===== */}
      <section id="visualization" className="py-28 px-6 bg-navy-50 relative wave-divider-white">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-14">
              <div className="inline-flex items-center gap-2 bg-purple-50 border border-purple-200 rounded-full px-4 py-2 mb-4 shadow-soft">
                <BarChart3 className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-700">Phase 3 — Visualization Layer</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-navy-900 mb-5">
                Route Maps, Charts &amp;{" "}
                <span className="bg-gradient-to-r from-purple-600 to-indigo-500 bg-clip-text text-transparent">
                  Port Analysis
                </span>
              </h2>
              <p className="text-lg text-navy-500 max-w-2xl mx-auto">
                Interactive shipping route map, carrier rate comparisons, tariff breakdowns,
                and port performance radar — all in one visualization toolkit.
              </p>
            </div>
          </ScrollReveal>

          {/* Shipping Route Map */}
          <ScrollReveal>
            <div className="bg-white border border-navy-100 rounded-2xl p-6 md:p-8 mb-8 shadow-card">
              <ShippingRouteMap />
            </div>
          </ScrollReveal>

          {/* Rate Comparison + Tariff Breakdown side by side */}
          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            <ScrollReveal delay={100}>
              <div className="bg-white border border-navy-100 rounded-2xl p-6 shadow-card h-full">
                <RateComparisonChart />
              </div>
            </ScrollReveal>
            <ScrollReveal delay={200}>
              <div className="bg-white border border-navy-100 rounded-2xl p-6 shadow-card h-full">
                <TariffBreakdownChart />
              </div>
            </ScrollReveal>
          </div>

          {/* Port Comparison Tool */}
          <ScrollReveal delay={150}>
            <div className="bg-white border border-navy-100 rounded-2xl p-6 md:p-8 shadow-card">
              <PortComparisonTool />
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ===== ARCHITECTURE / TECH STACK ===== */}
      <section id="architecture" className="py-28 px-6 bg-white relative wave-divider">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-14">
              <p className="text-sm font-semibold text-ocean-600 tracking-wider uppercase mb-3">Technology</p>
              <h2 className="text-4xl md:text-5xl font-bold text-navy-900 mb-5">
                Built on <span className="gradient-text">Free Data Sources</span>
              </h2>
              <p className="text-lg text-navy-500 max-w-2xl mx-auto">
                All critical data comes from US government sources — zero API costs.
                Open-source mapping stack — zero licensing fees.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-14">
            {techStack.map((tech, i) => (
              <ScrollReveal key={tech.name} delay={i * 80}>
                <div className="gradient-border bg-white rounded-xl p-5 hover:shadow-card hover:-translate-y-0.5 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                    <span className="font-semibold text-navy-900 text-sm">{tech.name}</span>
                  </div>
                  <p className="text-xs text-navy-500 ml-9">{tech.purpose}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>

          {/* Architecture diagram */}
          <ScrollReveal>
            <div className="bg-gradient-to-br from-navy-900 to-navy-800 border border-navy-700 rounded-2xl p-8 font-mono text-xs text-navy-300 overflow-x-auto shadow-premium">
              <div className="text-sm font-semibold text-ocean-400 mb-4 font-sans">System Architecture</div>
              <pre className="whitespace-pre leading-relaxed">{`
┌─────────────────────────────────────────────────────────────┐
│  BROWSER                                                     │
│                                                               │
│  ┌──────────┐  ┌──────────────┐  ┌─────────────────────┐   │
│  │ Proposal │  │ Calculators  │  │ Map Visualization    │   │
│  │ Site     │  │ (decimal.js) │  │ MapLibre + deck.gl   │   │
│  └──────────┘  └──────┬───────┘  └──────────┬──────────┘   │
│                        │                      │               │
│              ┌─────────┴──────────────────────┘               │
│              │  Pure TS Calculation Engine                     │
│              │  + Zustand State + URL Sharing                 │
│              └─────────┬──────────────────────                │
└────────────────────────┼──────────────────────────────────────┘
                         │
┌────────────────────────┼──────────────────────────────────────┐
│  NEXT.JS SERVER        │  (Vercel)                            │
│                        │                                      │
│  /api/export/pdf ──── @react-pdf/renderer                    │
│  /api/hts/search ──── FlexSearch index                       │
│                                                               │
│  STATIC DATA (/data/*.json):                                 │
│  ┌────────────────────────────────────────────────────┐      │
│  │ hts-schedule.json │ ports.json │ ftz-locations.json │      │
│  │ duty-rates.json   │ routes.json│ container-specs    │      │
│  └────────────────────────────────────────────────────┘      │
│  Source: USITC (free) │ UN/LOCODE │ OFIS/trade.gov           │
└───────────────────────────────────────────────────────────────┘`}
              </pre>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ===== ROADMAP ===== */}
      <section id="roadmap" className="py-28 px-6 bg-navy-50 relative">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-20">
              <p className="text-sm font-semibold text-cargo-600 tracking-wider uppercase mb-3">Timeline</p>
              <h2 className="text-4xl md:text-5xl font-bold text-navy-900 mb-5">
                Development <span className="gradient-text-gold">Roadmap</span>
              </h2>
              <p className="text-lg text-navy-500 max-w-2xl mx-auto">
                Six phases from proposal to full platform.
                Each phase delivers working, deployable features.
              </p>
            </div>
          </ScrollReveal>

          {/* Timeline layout */}
          <div className="relative">
            {/* Vertical line with gradient */}
            <div className="absolute left-6 md:left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-ocean-500 via-purple-500 to-teal-500" />

            <div className="space-y-8">
              {roadmapPhases.map((phase, i) => (
                <ScrollReveal key={phase.phase} delay={i * 100}>
                  <div className="relative pl-16 md:pl-20">
                    {/* Timeline dot */}
                    <div className={`absolute left-4 md:left-6 top-6 w-5 h-5 rounded-full ${phase.dotColor} ring-4 ring-white shadow-md ${phase.status === "In Progress" ? "animate-pulse" : ""}`} />

                    <div className={`bg-white border border-navy-100 rounded-2xl p-6 shadow-soft hover:shadow-card hover:-translate-y-0.5 transition-all duration-300 border-l-4 ${phase.color}`}>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl font-bold text-navy-200">
                            0{phase.phase}
                          </span>
                          <h3 className="text-lg font-semibold text-navy-900">{phase.title}</h3>
                        </div>
                        <span
                          className={`text-xs font-medium px-3 py-1.5 rounded-full ${
                            phase.status === "In Progress"
                              ? "bg-ocean-50 text-ocean-700 border border-ocean-200"
                              : phase.status === "Next"
                              ? "bg-cargo-50 text-cargo-700 border border-cargo-200"
                              : "bg-navy-50 text-navy-500 border border-navy-200"
                          }`}
                        >
                          {phase.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {phase.items.map((item) => (
                          <div key={item} className="flex items-center gap-2 text-sm text-navy-600">
                            <Check className="w-3.5 h-3.5 text-ocean-500 flex-shrink-0" />
                            {item}
                          </div>
                        ))}
                      </div>
                      {phase.phase === 5 && phase.status === "In Progress" && (
                        <div className="mt-4">
                          <Link
                            href="/knowledge-base"
                            className="inline-flex items-center gap-2 text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-4 py-2 rounded-lg transition-colors"
                          >
                            <FileText className="w-4 h-4" />
                            Open Knowledge Base
                            <ArrowRight className="w-4 h-4" />
                          </Link>
                        </div>
                      )}
                      {phase.phase === 6 && phase.status === "In Progress" && (
                        <div className="mt-4">
                          <Link
                            href="/dashboard"
                            className="inline-flex items-center gap-2 text-sm bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 px-4 py-2 rounded-lg transition-colors"
                          >
                            <LayoutDashboard className="w-4 h-4" />
                            View Live Demo
                            <ArrowRight className="w-4 h-4" />
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Platform Wireframes */}
      <section id="wireframes" className="py-24 px-6 bg-navy-950/50">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-4 border-ocean-500/30">
                <Monitor className="w-4 h-4 text-ocean-400" />
                <span className="text-sm text-ocean-300">Platform Preview</span>
              </div>
              <h2 className="text-4xl font-bold text-white mb-4">
                Every Screen, <span className="gradient-text">Designed</span>
              </h2>
              <p className="text-lg text-navy-300 max-w-2xl mx-auto">
                Six core platform screens — from operations dashboard to PDF
                report generation. Click through to see what gets built.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal>
            <PlatformWireframes />
          </ScrollReveal>
        </div>
      </section>

      {/* Pricing Tiers */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-4">
                Simple, Transparent{" "}
                <span className="gradient-text-gold">Pricing</span>
              </h2>
              <p className="text-lg text-navy-300 max-w-2xl mx-auto">
                Start with the tools you need. Scale as your operation grows.
                All plans include a 14-day free trial — no credit card required.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal>
            <PricingTiers />
          </ScrollReveal>
        </div>
      </section>

      {/* Call to Action */}
      <section id="cta" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <CTASection />
          </ScrollReveal>
        </div>
      </section>

      {/* ===== COMPETITIVE ADVANTAGE ===== */}
      <section className="py-28 px-6 bg-gradient-to-b from-white to-navy-50">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-14">
              <h2 className="text-4xl md:text-5xl font-bold text-navy-900 mb-5">
                Why <span className="gradient-text">Shipping Savior</span>
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: "FTZ Strategy — Nobody Else Has This",
                description:
                  "Zero competitors combine FTZ savings modeling with freight brokerage tools. Flexport handles compliance but not FTZ optimization. This is the gap.",
                gradient: "from-emerald-500 to-teal-600",
                bgLight: "bg-emerald-50",
              },
              {
                icon: TrendingUp,
                title: "Backhaul Intelligence",
                description:
                  "Backhaul pricing is invisible in every existing platform. Surfacing return-leg pricing advantages as a selection criterion is unique and valuable.",
                gradient: "from-ocean-500 to-indigo-600",
                bgLight: "bg-ocean-50",
              },
              {
                icon: Clock,
                title: "Cold Chain + General Cargo Hybrid",
                description:
                  "Built by someone who handles 96-97% of a Lineage terminal. No platform serves the operator who does both cold chain and general imports.",
                gradient: "from-cargo-500 to-orange-600",
                bgLight: "bg-amber-50",
              },
            ].map((item, i) => (
              <ScrollReveal key={item.title} delay={i * 150}>
                <div className="gradient-border bg-white rounded-2xl p-8 text-center h-full hover:shadow-premium hover:-translate-y-1 transition-all duration-300">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mx-auto mb-6 shadow-lg`}>
                    <item.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-navy-900 mb-3">{item.title}</h3>
                  <p className="text-sm text-navy-500 leading-relaxed">{item.description}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== BUSINESS STRATEGY ===== */}
      <section className="py-24 px-6 section-alt">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <p className="text-sm font-semibold text-ocean-600 tracking-wider uppercase mb-3">Business Strategy</p>
              <h2 className="text-4xl md:text-5xl font-bold text-navy-900 mb-5">
                Beyond the <span className="gradient-text">Platform</span>
              </h2>
              <p className="text-lg text-navy-500 max-w-2xl mx-auto">
                Deep strategic analysis: SaaS monetization, Six Sigma process optimization, and a comprehensive four-phase project plan.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-8">
            <ScrollReveal>
              <Link href="/monetization" className="block group">
                <div className="bg-white rounded-2xl p-8 border border-navy-200/60 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 h-full">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-ocean-500 to-indigo-600 flex items-center justify-center mb-6 shadow-lg">
                    <DollarSign className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-navy-900 mb-3">SaaS Monetization Strategy</h3>
                  <p className="text-sm text-navy-500 leading-relaxed mb-6">
                    Six revenue streams, three pricing tiers ($299-$2,499/mo), interactive revenue calculator,
                    go-to-market strategy, competitive moat analysis, and unit economics showing 19:1 LTV:CAC.
                  </p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {["6 Revenue Streams", "85%+ Margin", "GTM Roadmap"].map((tag) => (
                      <span key={tag} className="text-xs bg-ocean-50 text-ocean-700 px-3 py-1 rounded-full font-medium border border-ocean-100">{tag}</span>
                    ))}
                  </div>
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-ocean-600 group-hover:gap-3 transition-all">
                    View Monetization Strategy <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </Link>
            </ScrollReveal>

            <ScrollReveal delay={150}>
              <Link href="/six-sigma" className="block group">
                <div className="bg-white rounded-2xl p-8 border border-navy-200/60 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 h-full">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mb-6 shadow-lg">
                    <BarChart3 className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-navy-900 mb-3">Six Sigma DMAIC Analysis</h3>
                  <p className="text-sm text-navy-500 leading-relaxed mb-6">
                    Full DMAIC analysis: Define problem (40-60% time waste), Measure baseline (3.5 sigma),
                    Analyze root causes (Ishikawa + Pareto), Improve with platform features, Control with SPC.
                  </p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {["3.5 to 5.0 Sigma", "400%+ ROI", "$150K-500K Savings"].map((tag) => (
                      <span key={tag} className="text-xs bg-purple-50 text-purple-700 px-3 py-1 rounded-full font-medium border border-purple-100">{tag}</span>
                    ))}
                  </div>
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-purple-600 group-hover:gap-3 transition-all">
                    View Six Sigma Analysis <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </Link>
            </ScrollReveal>

            <ScrollReveal delay={300}>
              <Link href="/phases" className="block group">
                <div className="bg-white rounded-2xl p-8 border border-navy-200/60 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 h-full">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center mb-6 shadow-lg">
                    <LayoutDashboard className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-navy-900 mb-3">Project Phases</h3>
                  <p className="text-sm text-navy-500 leading-relaxed mb-6">
                    Four comprehensive phases: Research (data source validation, competitor mapping), Planning (architecture,
                    AI agents, financial model), Monitoring (KPIs, pipeline health), and full Platform Outline.
                  </p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {["4 Phases", "6 AI Agents", "26 Data Sources"].map((tag) => (
                      <span key={tag} className="text-xs bg-amber-50 text-amber-700 px-3 py-1 rounded-full font-medium border border-amber-100">{tag}</span>
                    ))}
                  </div>
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-amber-600 group-hover:gap-3 transition-all">
                    View Project Phases <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </Link>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ===== VIEW FULL PROPOSAL CTA ===== */}
      <section className="py-20 px-6 bg-gradient-to-r from-ocean-600 via-indigo-600 to-ocean-700">
        <div className="max-w-3xl mx-auto text-center">
          <ScrollReveal>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to See the Full Platform?
            </h2>
            <p className="text-lg text-ocean-100 mb-8 max-w-xl mx-auto">
              View the complete service agreement with AI agent architecture,
              app mockups, pricing, and delivery timeline.
            </p>
            <Link
              href="/agreement"
              className="inline-flex items-center gap-2 bg-white text-ocean-700 font-bold px-8 py-4 rounded-xl text-base hover:bg-ocean-50 transition-all hover:scale-[1.02] shadow-premium"
            >
              <FileText className="w-5 h-5" />
              View Full Proposal
              <ArrowRight className="w-5 h-5" />
            </Link>
          </ScrollReveal>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="py-14 px-6 border-t border-navy-100 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-ocean-500 to-indigo-600 flex items-center justify-center shadow-sm">
              <Ship className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-navy-900">
              Shipping<span className="gradient-text">Savior</span>
            </span>
          </div>
          <div className="text-sm text-navy-400">
            AI-Powered International Logistics Platform — Built with AI Acrobatics
          </div>
          <div className="text-xs text-navy-400">
            Tariff data for informational purposes only. Verify at hts.usitc.gov
          </div>
        </div>
      </footer>
    </main>
  );
}

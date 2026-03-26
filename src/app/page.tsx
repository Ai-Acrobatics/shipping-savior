import Link from "next/link";
import Header from "@/components/Header";
import ScrollReveal from "@/components/ScrollReveal";
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
  LayoutDashboard, Monitor,
} from "lucide-react";

const platformFeatures = [
  {
    icon: Calculator,
    title: "Landed Cost Calculator",
    description: "Unit cost + shipping + duties + fulfillment = true per-unit landed cost with multi-currency support",
    color: "from-ocean-500 to-ocean-700",
  },
  {
    icon: Shield,
    title: "FTZ Savings Analyzer",
    description: "Lock duty rates at entry, model incremental withdrawals, compare FTZ vs non-FTZ scenarios",
    color: "from-green-500 to-green-700",
  },
  {
    icon: Route,
    title: "Route Comparison",
    description: "Compare carrier options with backhaul pricing, transshipment routes, and transit time analysis",
    color: "from-cargo-500 to-cargo-700",
  },
  {
    icon: Globe,
    title: "Tariff Estimator",
    description: "HTS code lookup with duty rates by country of origin. SE Asia focus: Vietnam, Thailand, Indonesia, Cambodia",
    color: "from-purple-500 to-purple-700",
  },
  {
    icon: Container,
    title: "Container Calculator",
    description: "Optimize utilization by volume AND weight. Shows which limit you hit first and cost-per-unit at scale",
    color: "from-blue-500 to-blue-700",
  },
  {
    icon: Map,
    title: "Interactive Route Map",
    description: "WebGL-powered visualization of shipping lanes, transshipment hubs, and port locations worldwide",
    color: "from-teal-500 to-teal-700",
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
  },
  {
    phase: 2,
    title: "Data Foundation + Core Calculators",
    status: "Next",
    items: ["HTS tariff dataset (100K+ codes)", "Landed cost calculator", "Container utilization", "Port & route data"],
    color: "border-cargo-500",
  },
  {
    phase: 3,
    title: "Visualization Layer",
    status: "In Progress",
    items: ["Interactive shipping route map", "Port comparison tool", "Dashboard charts", "Carrier comparison UI"],
    color: "border-purple-500",
  },
  {
    phase: 4,
    title: "FTZ Analyzer + Tariff Scenarios",
    status: "In Progress",
    items: ["Full FTZ savings modeler", "Tariff scenario analysis", "Multi-scenario comparison", "What-if modeling"],
    color: "border-green-500",
  },
  {
    phase: 5,
    title: "Knowledge Base + Documents",
    status: "In Progress",
    items: ["40+ glossary terms", "All 11 Incoterms 2020", "CBP compliance guides", "Trade regulations by region"],
    color: "border-blue-500",
  },
  {
    phase: 6,
    title: "Dashboard + Tracking",
    status: "In Progress",
    items: ["Shipment tracking overview", "Cost/margin dashboard", "Cold chain vs general cargo", "Partner status"],
    color: "border-teal-500",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-navy-950 via-navy-900 to-navy-950" />
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-ocean-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-cargo-500/10 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-8">
            <Zap className="w-4 h-4 text-cargo-400" />
            <span className="text-sm text-navy-200">International Logistics Platform</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
            <span className="gradient-text">Shipping</span>{" "}
            <span className="text-white">Savior</span>
          </h1>

          <p className="text-xl md:text-2xl text-navy-200 max-w-3xl mx-auto mb-4 leading-relaxed">
            Turn manual freight brokerage into{" "}
            <span className="text-ocean-400 font-semibold">data-driven operations</span>.
            Calculators, route comparison, FTZ strategy, and tariff optimization
            — all in one platform.
          </p>

          <p className="text-lg text-navy-300 max-w-2xl mx-auto mb-10">
            Built for international freight operators who dominate cold chain exports
            and are expanding into SE Asia consumer goods imports.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#calculators"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-ocean-600 to-ocean-500 hover:from-ocean-500 hover:to-ocean-400 text-white font-semibold px-8 py-4 rounded-xl transition-all hover:scale-105 shadow-lg shadow-ocean-500/20"
            >
              Try Live Calculators
              <ArrowRight className="w-5 h-5" />
            </a>
            <a
              href="#platform"
              className="inline-flex items-center gap-2 glass glass-hover text-navy-100 font-semibold px-8 py-4 rounded-xl"
            >
              Explore Platform
            </a>
          </div>

          {/* Stats bar */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: "HTS Codes", value: "100K+", icon: Database },
              { label: "Ports Mapped", value: "3,700+", icon: Anchor },
              { label: "FTZ Zones", value: "260+", icon: Shield },
              { label: "API Cost", value: "$0", icon: DollarSign },
            ].map((stat) => (
              <div key={stat.label} className="glass rounded-xl p-4">
                <stat.icon className="w-5 h-5 text-ocean-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-navy-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Features */}
      <section id="platform" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-4">
                Complete Logistics <span className="gradient-text">Toolkit</span>
              </h2>
              <p className="text-lg text-navy-300 max-w-2xl mx-auto">
                Six core tools that systematize every aspect of international freight
                operations — from sourcing to fulfillment.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {platformFeatures.map((feature, i) => (
              <ScrollReveal key={feature.title} delay={i * 100}>
                <div className="glass glass-hover rounded-2xl p-6 h-full">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-navy-300 leading-relaxed">{feature.description}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Live Calculator: Unit Economics */}
      <section id="calculators" className="py-24 px-6 bg-navy-950/50">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-4">
                <Calculator className="w-4 h-4 text-ocean-400" />
                <span className="text-sm text-navy-200">Live Calculator</span>
              </div>
              <h2 className="text-4xl font-bold text-white mb-4">
                Unit Economics <span className="gradient-text-gold">Calculator</span>
              </h2>
              <p className="text-lg text-navy-300 max-w-2xl mx-auto">
                Model the complete value chain from origin cost to retail price.
                See exactly where your margin comes from.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal>
            <div className="glass rounded-2xl p-8">
              <UnitEconomicsCalculator />
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Import Process Flow */}
      <section id="routes" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-4">
                The Import <span className="gradient-text">Pipeline</span>
              </h2>
              <p className="text-lg text-navy-300 max-w-2xl mx-auto">
                From sourcing in SE Asia to fulfillment in the US —
                every step systematized with the right tools.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {importSteps.map((step, i) => (
              <ScrollReveal key={step.step} delay={i * 100}>
                <div className="glass glass-hover rounded-2xl p-6 relative overflow-hidden">
                  <div className="absolute top-4 right-4 text-5xl font-bold text-white/5">
                    {step.step}
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-ocean-600 to-ocean-800 flex items-center justify-center mb-4">
                    <step.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-xs text-ocean-400 font-medium mb-1">{step.subtitle}</div>
                  <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-navy-300">{step.description}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Hidden Costs Warning */}
      <section className="py-24 px-6 bg-red-950/10">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white mb-4">
                Hidden Costs That Add{" "}
                <span className="text-red-400">15-25%</span>
              </h2>
              <p className="text-lg text-navy-300 max-w-2xl mx-auto">
                Most platforms miss these. Our calculators include ALL of them
                so your landed cost is truly accurate.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {hiddenCosts.map((cost, i) => (
              <ScrollReveal key={cost.name} delay={i * 50}>
                <div className="glass rounded-xl p-4 border-red-500/10 hover:border-red-500/30 transition-colors">
                  <div className="text-sm font-semibold text-white">{cost.name}</div>
                  <div className="text-lg font-bold text-red-400">{cost.range}</div>
                  <div className="text-xs text-navy-400 mt-1">{cost.description}</div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* FTZ Strategy Section */}
      <section id="ftz" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-4 border-green-500/30">
                <Shield className="w-4 h-4 text-green-400" />
                <span className="text-sm text-green-300">#1 Differentiator — Zero Competitors Offer This</span>
              </div>
              <h2 className="text-4xl font-bold text-white mb-4">
                FTZ Savings <span className="text-green-400">Analyzer</span>
              </h2>
              <p className="text-lg text-navy-300 max-w-2xl mx-auto">
                Foreign Trade Zones lock your duty rate on entry day.
                Model the savings with incremental withdrawal scheduling.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal>
            <div className="glass rounded-2xl p-8 border-green-500/10">
              <FTZSavingsCalculator />
            </div>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <div className="mt-8 glass rounded-xl p-6 border-cargo-500/20">
              <h3 className="text-lg font-semibold text-cargo-300 mb-3">
                Why FTZ Strategy Matters
              </h3>
              <div className="grid md:grid-cols-3 gap-4 text-sm text-navy-300">
                <div>
                  <strong className="text-white block mb-1">Rate Locking</strong>
                  Duty rates are locked on the date goods enter the FTZ — regardless of
                  future tariff increases. With shifting trade policy, this is insurance.
                </div>
                <div>
                  <strong className="text-white block mb-1">Incremental Withdrawal</strong>
                  Only pay duties on goods as they leave the FTZ. Spread cash flow over months
                  instead of paying everything upfront at customs.
                </div>
                <div>
                  <strong className="text-white block mb-1">260+ US Zones</strong>
                  FTZs exist near every major port. Goods sit in bonded warehouses —
                  protected, secure, duty-deferred until you need them.
                </div>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={300}>
            <div className="mt-6 text-center">
              <a
                href="/ftz-analyzer"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-semibold px-6 py-3 rounded-xl transition-all hover:scale-105 shadow-lg shadow-green-500/20"
              >
                Open Full FTZ Analyzer + Tariff Scenarios
                <ArrowRight className="w-4 h-4" />
              </a>
              <p className="text-xs text-navy-500 mt-2">
                HTS code lookup · multi-scenario comparison · zone finder · withdrawal scheduling
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Visualization Layer */}
      <section id="visualization" className="py-24 px-6 bg-navy-950/50">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-4 border-purple-500/30">
                <BarChart3 className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-purple-300">Phase 3 — Visualization Layer</span>
              </div>
              <h2 className="text-4xl font-bold text-white mb-4">
                Route Maps, Charts &amp;{" "}
                <span className="bg-gradient-to-r from-purple-400 to-purple-200 bg-clip-text text-transparent">
                  Port Analysis
                </span>
              </h2>
              <p className="text-lg text-navy-300 max-w-2xl mx-auto">
                Interactive shipping route map, carrier rate comparisons, tariff breakdowns,
                and port performance radar — all in one visualization toolkit.
              </p>
            </div>
          </ScrollReveal>

          {/* Shipping Route Map */}
          <ScrollReveal>
            <div className="glass rounded-2xl p-6 md:p-8 mb-8">
              <ShippingRouteMap />
            </div>
          </ScrollReveal>

          {/* Rate Comparison + Tariff Breakdown side by side */}
          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            <ScrollReveal delay={100}>
              <div className="glass rounded-2xl p-6">
                <RateComparisonChart />
              </div>
            </ScrollReveal>
            <ScrollReveal delay={200}>
              <div className="glass rounded-2xl p-6">
                <TariffBreakdownChart />
              </div>
            </ScrollReveal>
          </div>

          {/* Port Comparison Tool */}
          <ScrollReveal delay={150}>
            <div className="glass rounded-2xl p-6 md:p-8">
              <PortComparisonTool />
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Architecture / Tech Stack */}
      <section id="architecture" className="py-24 px-6 bg-navy-950/50">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white mb-4">
                Built on <span className="gradient-text">Free Data Sources</span>
              </h2>
              <p className="text-lg text-navy-300 max-w-2xl mx-auto">
                All critical data comes from US government sources — zero API costs.
                Open-source mapping stack — zero licensing fees.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
            {techStack.map((tech, i) => (
              <ScrollReveal key={tech.name} delay={i * 80}>
                <div className="glass glass-hover rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                    <span className="font-semibold text-white text-sm">{tech.name}</span>
                  </div>
                  <p className="text-xs text-navy-400 ml-7">{tech.purpose}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>

          {/* Architecture diagram */}
          <ScrollReveal>
            <div className="glass rounded-2xl p-8 font-mono text-xs text-navy-300 overflow-x-auto">
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

      {/* Roadmap */}
      <section id="roadmap" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-4">
                Development <span className="gradient-text-gold">Roadmap</span>
              </h2>
              <p className="text-lg text-navy-300 max-w-2xl mx-auto">
                Six phases from proposal to full platform.
                Each phase delivers working, deployable features.
              </p>
            </div>
          </ScrollReveal>

          <div className="space-y-6">
            {roadmapPhases.map((phase, i) => (
              <ScrollReveal key={phase.phase} delay={i * 100}>
                <div className={`glass rounded-2xl p-6 border-l-4 ${phase.color}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold text-white/20">
                        0{phase.phase}
                      </span>
                      <div>
                        <h3 className="text-lg font-semibold text-white">{phase.title}</h3>
                      </div>
                    </div>
                    <span
                      className={`text-xs font-medium px-3 py-1 rounded-full ${
                        phase.status === "In Progress"
                          ? "bg-ocean-500/20 text-ocean-300"
                          : phase.status === "Next"
                          ? "bg-cargo-500/20 text-cargo-300"
                          : phase.status === "Future"
                          ? "bg-navy-700/50 text-navy-400"
                          : "bg-white/5 text-navy-400"
                      }`}
                    >
                      {phase.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {phase.items.map((item) => (
                      <div key={item} className="flex items-center gap-2 text-sm text-navy-300">
                        <Check className="w-3 h-3 text-ocean-500 flex-shrink-0" />
                        {item}
                      </div>
                    ))}
                  </div>
                  {phase.phase === 5 && phase.status === "In Progress" && (
                    <div className="mt-4">
                      <Link
                        href="/knowledge-base"
                        className="inline-flex items-center gap-2 text-sm bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 px-4 py-2 rounded-lg transition-colors"
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
                        className="inline-flex items-center gap-2 text-sm bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/30 px-4 py-2 rounded-lg transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        View Live Demo
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  )}
                </div>
              </ScrollReveal>
            ))}
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

      {/* Competitive Advantage */}
      <section className="py-24 px-6 bg-gradient-to-b from-navy-950/50 to-navy-950">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white mb-4">
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
              },
              {
                icon: TrendingUp,
                title: "Backhaul Intelligence",
                description:
                  "Backhaul pricing is invisible in every existing platform. Surfacing return-leg pricing advantages as a selection criterion is unique and valuable.",
              },
              {
                icon: Clock,
                title: "Cold Chain + General Cargo Hybrid",
                description:
                  "Built by someone who handles 96-97% of a Lineage terminal. No platform serves the operator who does both cold chain and general imports.",
              },
            ].map((item, i) => (
              <ScrollReveal key={item.title} delay={i * 150}>
                <div className="glass glass-hover rounded-2xl p-8 text-center h-full">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-ocean-600 to-ocean-800 flex items-center justify-center mx-auto mb-5">
                    <item.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-3">{item.title}</h3>
                  <p className="text-sm text-navy-300 leading-relaxed">{item.description}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-ocean-500 to-ocean-700 flex items-center justify-center">
              <Ship className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold">
              Shipping<span className="gradient-text">Savior</span>
            </span>
          </div>
          <div className="text-sm text-navy-500">
            International Logistics Platform — Built with AI Acrobatics
          </div>
          <div className="text-xs text-navy-600">
            Tariff data for informational purposes only. Verify at hts.usitc.gov
          </div>
        </div>
      </footer>
    </main>
  );
}

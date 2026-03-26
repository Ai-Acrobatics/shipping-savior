"use client";

import Header from "@/components/Header";
import ScrollReveal from "@/components/ScrollReveal";
import {
  Brain, Route, Shield, FileCheck, DollarSign, Cpu,
  Check, ArrowRight, Zap, Globe, BarChart3, Ship,
  Smartphone, Monitor, Clock, Star, ChevronRight,
  Bot, Radar, Calculator, AlertTriangle, TrendingUp,
  Layers, Database, Lock, Workflow,
} from "lucide-react";

const aiAgents = [
  {
    name: "Tariff Intelligence Agent",
    description: "Monitors HTS code changes in real-time, alerts on duty rate shifts, tracks trade policy updates across 180+ countries. Automatically recalculates landed costs when rates change.",
    icon: Radar,
    gradient: "from-ocean-600 to-indigo-600",
    bgLight: "bg-ocean-50",
    status: "Active",
    statusColor: "bg-emerald-500",
    capabilities: ["HTS monitoring", "Rate alerts", "Policy tracking", "Auto-recalculation"],
  },
  {
    name: "Route Optimization Agent",
    description: "Analyzes carrier schedules, identifies backhaul pricing opportunities, compares transshipment routes, and finds the fastest path with the lowest total cost.",
    icon: Route,
    gradient: "from-cargo-500 to-orange-600",
    bgLight: "bg-amber-50",
    status: "Active",
    statusColor: "bg-emerald-500",
    capabilities: ["Backhaul detection", "Schedule analysis", "Cost optimization", "Transit modeling"],
  },
  {
    name: "FTZ Strategy Agent",
    description: "Models withdrawal schedules, optimizes duty timing based on rate forecasts, identifies the best FTZ locations for your cargo profile, and maximizes cash flow deferral.",
    icon: Shield,
    gradient: "from-emerald-500 to-teal-600",
    bgLight: "bg-emerald-50",
    status: "Active",
    statusColor: "bg-emerald-500",
    capabilities: ["Withdrawal scheduling", "Rate locking", "Zone selection", "Cash flow optimization"],
  },
  {
    name: "Compliance Agent",
    description: "Monitors ISF filing deadlines, flags documentation gaps before they become penalties, validates HTS classifications, and ensures regulatory compliance across jurisdictions.",
    icon: FileCheck,
    gradient: "from-purple-500 to-violet-600",
    bgLight: "bg-purple-50",
    status: "Active",
    statusColor: "bg-emerald-500",
    capabilities: ["ISF monitoring", "Doc validation", "HTS verification", "Penalty prevention"],
  },
  {
    name: "Cost Analysis Agent",
    description: "Tracks landed costs per SKU in real-time, identifies margin optimization opportunities, surfaces hidden cost anomalies, and generates profitability forecasts.",
    icon: TrendingUp,
    gradient: "from-blue-500 to-cyan-600",
    bgLight: "bg-blue-50",
    status: "Active",
    statusColor: "bg-emerald-500",
    capabilities: ["SKU-level tracking", "Margin analysis", "Anomaly detection", "Forecasting"],
  },
];

const platformFeatures = [
  "Real-time duty rate monitoring & alerts",
  "Landed cost calculator with 15+ cost components",
  "FTZ savings modeler with withdrawal scheduling",
  "Interactive route comparison with backhaul pricing",
  "Container utilization optimizer (volume + weight)",
  "HTS code lookup with 100K+ tariff codes",
  "Port performance analytics & comparison",
  "Cold chain + general cargo hybrid management",
  "ISF filing deadline tracker & reminders",
  "Multi-currency support with live exchange rates",
  "PDF export for proposals & cost breakdowns",
  "AI-powered carrier recommendations",
];

const techStackItems = [
  { name: "Next.js 14", category: "Framework", icon: Layers },
  { name: "TypeScript", category: "Language", icon: Cpu },
  { name: "MapLibre GL", category: "Mapping", icon: Globe },
  { name: "PostgreSQL", category: "Database", icon: Database },
  { name: "Vercel Edge", category: "Hosting", icon: Zap },
  { name: "AI Agents", category: "Intelligence", icon: Brain },
];

const timeline = [
  { phase: "Phase 1", title: "Foundation & Core Tools", duration: "Weeks 1-3", status: "complete", items: ["Platform architecture", "Landed cost calculator", "FTZ savings analyzer", "Interactive proposal site"] },
  { phase: "Phase 2", title: "Visualization & Data", duration: "Weeks 4-6", status: "in-progress", items: ["Route comparison maps", "Port analytics", "Tariff breakdown charts", "Rate comparison tools"] },
  { phase: "Phase 3", title: "AI Agent Layer", duration: "Weeks 7-10", status: "upcoming", items: ["Tariff intelligence agent", "Route optimization agent", "Compliance monitoring", "Cost analysis engine"] },
  { phase: "Phase 4", title: "Dashboard & Mobile", duration: "Weeks 11-14", status: "upcoming", items: ["Executive dashboard", "Shipment tracking", "Mobile-responsive app", "Notification system"] },
  { phase: "Phase 5", title: "Integration & Scale", duration: "Weeks 15-18", status: "upcoming", items: ["Carrier API integrations", "Customs broker feeds", "Client portal", "White-label options"] },
];

function MockupDashboard() {
  return (
    <div className="mockup-frame">
      <div className="mockup-titlebar">
        <div className="mockup-dot bg-red-400" />
        <div className="mockup-dot bg-amber-400" />
        <div className="mockup-dot bg-emerald-400" />
        <span className="text-xs text-navy-400 ml-2 font-mono">shipping-savior.app/dashboard</span>
      </div>
      <div className="p-5 bg-gradient-to-br from-navy-50 to-white">
        {/* Top nav mockup */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-ocean-500 to-indigo-600" />
            <div className="mockup-skeleton h-4 w-28" />
          </div>
          <div className="flex gap-2">
            <div className="mockup-skeleton h-8 w-20 rounded-lg" />
            <div className="mockup-skeleton h-8 w-24 rounded-lg" />
          </div>
        </div>
        {/* KPI Row */}
        <div className="grid grid-cols-4 gap-3 mb-5">
          {[
            { label: "Active Shipments", value: "24", color: "border-ocean-500" },
            { label: "Total Value", value: "$2.4M", color: "border-emerald-500" },
            { label: "Avg Transit", value: "18d", color: "border-cargo-500" },
            { label: "Duty Saved", value: "$127K", color: "border-indigo-500" },
          ].map((kpi) => (
            <div key={kpi.label} className={`bg-white rounded-lg p-3 border-l-3 ${kpi.color} shadow-sm border`}>
              <div className="text-[10px] text-navy-400 font-medium">{kpi.label}</div>
              <div className="text-lg font-bold text-navy-900 mt-0.5">{kpi.value}</div>
            </div>
          ))}
        </div>
        {/* Chart area */}
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2 bg-white rounded-lg p-4 border border-navy-100 shadow-sm">
            <div className="text-xs font-semibold text-navy-700 mb-3">Cost Breakdown by Route</div>
            <div className="flex items-end gap-2 h-24">
              {[65, 45, 80, 55, 70, 40, 90, 60, 50, 75, 85, 45].map((h, i) => (
                <div key={i} className="flex-1 rounded-t" style={{ height: `${h}%`, background: `linear-gradient(180deg, #2563eb, #6366f1)`, opacity: 0.6 + (h / 300) }} />
              ))}
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-navy-100 shadow-sm">
            <div className="text-xs font-semibold text-navy-700 mb-3">AI Agents</div>
            <div className="space-y-2.5">
              {["Tariff Intel", "Route Opt", "FTZ Strategy", "Compliance"].map((name) => (
                <div key={name} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-[10px] text-navy-600">{name}</span>
                  <span className="ml-auto text-[9px] text-emerald-600 font-medium">Active</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MockupRouteComparison() {
  return (
    <div className="mockup-frame">
      <div className="mockup-titlebar">
        <div className="mockup-dot bg-red-400" />
        <div className="mockup-dot bg-amber-400" />
        <div className="mockup-dot bg-emerald-400" />
        <span className="text-xs text-navy-400 ml-2 font-mono">shipping-savior.app/routes</span>
      </div>
      <div className="p-5 bg-white">
        <div className="text-xs font-semibold text-navy-700 mb-3">Route Comparison: Ho Chi Minh City → Los Angeles</div>
        <div className="space-y-3">
          {[
            { carrier: "Maersk Direct", days: "18 days", cost: "$3,240", saving: "Best Price", color: "border-ocean-500 bg-ocean-50" },
            { carrier: "ONE (via Singapore)", days: "22 days", cost: "$3,480", saving: "Backhaul -12%", color: "border-cargo-500 bg-cargo-50" },
            { carrier: "Evergreen Direct", days: "19 days", cost: "$3,560", saving: "", color: "border-navy-200 bg-white" },
          ].map((route) => (
            <div key={route.carrier} className={`rounded-lg p-3 border ${route.color} flex items-center justify-between`}>
              <div>
                <div className="text-xs font-semibold text-navy-800">{route.carrier}</div>
                <div className="text-[10px] text-navy-400">{route.days}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-navy-900">{route.cost}</div>
                {route.saving && <div className="text-[10px] text-emerald-600 font-medium">{route.saving}</div>}
              </div>
            </div>
          ))}
        </div>
        {/* Mini map */}
        <div className="mt-4 rounded-lg bg-gradient-to-r from-ocean-50 to-indigo-50 h-20 flex items-center justify-center border border-ocean-100">
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="w-3 h-3 rounded-full bg-ocean-500 mx-auto mb-1" />
              <span className="text-[9px] text-navy-500">HCM</span>
            </div>
            <div className="w-32 h-px bg-gradient-to-r from-ocean-500 to-indigo-500 relative">
              <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-2 h-2 rounded-full bg-cargo-400" />
              <Ship className="absolute top-1/2 left-1/2 -translate-y-1/2 w-3 h-3 text-ocean-600" />
            </div>
            <div className="text-center">
              <div className="w-3 h-3 rounded-full bg-indigo-500 mx-auto mb-1" />
              <span className="text-[9px] text-navy-500">LAX</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MockupFTZ() {
  return (
    <div className="mockup-frame">
      <div className="mockup-titlebar">
        <div className="mockup-dot bg-red-400" />
        <div className="mockup-dot bg-amber-400" />
        <div className="mockup-dot bg-emerald-400" />
        <span className="text-xs text-navy-400 ml-2 font-mono">shipping-savior.app/ftz-analyzer</span>
      </div>
      <div className="p-5 bg-white">
        <div className="text-xs font-semibold text-navy-700 mb-3">FTZ Savings Analysis</div>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="rounded-lg bg-emerald-50 p-3 border border-emerald-200">
            <div className="text-[10px] text-emerald-600 font-medium">Annual Savings</div>
            <div className="text-xl font-bold text-emerald-700">$47,200</div>
          </div>
          <div className="rounded-lg bg-ocean-50 p-3 border border-ocean-200">
            <div className="text-[10px] text-ocean-600 font-medium">Duty Deferred</div>
            <div className="text-xl font-bold text-ocean-700">$184K</div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="text-[10px] text-navy-500 font-medium mb-1">Withdrawal Schedule</div>
          {["Jan", "Feb", "Mar", "Apr"].map((month, i) => (
            <div key={month} className="flex items-center gap-2">
              <span className="text-[10px] text-navy-400 w-8">{month}</span>
              <div className="flex-1 bg-navy-100 rounded-full h-2.5 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500" style={{ width: `${[65, 45, 80, 55][i]}%` }} />
              </div>
              <span className="text-[10px] text-navy-500 w-12 text-right">{["$12.4K", "$8.6K", "$15.2K", "$11K"][i]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MockupMobile() {
  return (
    <div className="w-48 mx-auto">
      <div className="bg-navy-900 rounded-[24px] p-2 shadow-premium">
        <div className="bg-white rounded-[18px] overflow-hidden">
          {/* Status bar */}
          <div className="bg-navy-50 px-3 py-1.5 flex items-center justify-between">
            <span className="text-[8px] text-navy-400">9:41</span>
            <div className="flex gap-1">
              <div className="w-3 h-1.5 rounded-sm bg-navy-300" />
              <div className="w-3 h-1.5 rounded-sm bg-navy-300" />
            </div>
          </div>
          {/* App content */}
          <div className="p-3">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-ocean-500 to-indigo-600" />
              <span className="text-[10px] font-bold text-navy-900">ShippingSavior</span>
            </div>
            <div className="bg-ocean-50 rounded-lg p-2.5 mb-2.5 border border-ocean-100">
              <div className="text-[9px] text-ocean-600 font-medium">Active Shipments</div>
              <div className="text-base font-bold text-navy-900">12</div>
            </div>
            <div className="space-y-1.5">
              {["MSKU-2847", "COSU-9123", "OOCL-4521"].map((id) => (
                <div key={id} className="flex items-center gap-2 bg-navy-50 rounded-md p-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="text-[8px] font-mono text-navy-600">{id}</span>
                  <ChevronRight className="w-2.5 h-2.5 text-navy-300 ml-auto" />
                </div>
              ))}
            </div>
          </div>
          {/* Bottom nav */}
          <div className="border-t border-navy-100 px-3 py-2 flex justify-around">
            {[Monitor, Route, Shield, BarChart3].map((Icon, i) => (
              <Icon key={i} className={`w-4 h-4 ${i === 0 ? "text-ocean-600" : "text-navy-300"}`} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AgreementPage() {
  return (
    <main className="min-h-screen bg-white">
      <Header />

      {/* ===== HERO ===== */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 hero-gradient pattern-dots-hero grain-overlay" />
        <div className="absolute top-20 -left-32 w-[400px] h-[400px] bg-ocean-200/30 rounded-full blur-3xl animate-orb-float-1" />
        <div className="absolute bottom-10 -right-32 w-[350px] h-[350px] bg-indigo-200/25 rounded-full blur-3xl animate-orb-float-2" />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-ocean-200 rounded-full px-5 py-2.5 mb-8 shadow-soft">
            <Brain className="w-4 h-4 text-ocean-600" />
            <span className="text-sm font-medium text-navy-600">AI-Powered Logistics Platform</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 text-navy-900">
            Service{" "}
            <span className="gradient-text-hero">Agreement</span>
          </h1>

          <p className="text-xl text-navy-500 max-w-2xl mx-auto mb-6 leading-relaxed">
            A comprehensive AI-powered logistics platform built to transform
            manual freight brokerage into autonomous, data-driven operations.
          </p>

          <div className="flex flex-wrap gap-4 justify-center text-sm">
            {["5 AI Agents", "Full Platform Build", "18-Week Delivery"].map((tag) => (
              <span key={tag} className="bg-white/80 border border-navy-200 rounded-full px-4 py-2 text-navy-600 font-medium shadow-soft">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ===== WHAT YOU'RE GETTING ===== */}
      <section className="py-24 px-6 section-alt">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <p className="text-sm font-semibold text-ocean-600 tracking-wider uppercase mb-3">Deliverables</p>
              <h2 className="text-4xl md:text-5xl font-bold text-navy-900 mb-5">
                What You&apos;re <span className="gradient-text">Getting</span>
              </h2>
              <p className="text-lg text-navy-500 max-w-2xl mx-auto">
                A turnkey logistics intelligence platform with autonomous AI agents
                that work 24/7 to optimize your operations.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {/* Platform Features */}
            <ScrollReveal>
              <div className="bg-white rounded-2xl p-8 border border-navy-100 shadow-card h-full">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-ocean-600 to-indigo-600 flex items-center justify-center shadow-glow-blue">
                    <Layers className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-navy-900">Platform Features</h3>
                    <p className="text-sm text-navy-400">Everything included</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {platformFeatures.map((feature) => (
                    <div key={feature} className="flex items-start gap-3 group">
                      <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-emerald-200 transition-colors">
                        <Check className="w-3 h-3 text-emerald-600" />
                      </div>
                      <span className="text-sm text-navy-600">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            {/* Technology Stack */}
            <ScrollReveal delay={150}>
              <div className="space-y-8">
                <div className="bg-white rounded-2xl p-8 border border-navy-100 shadow-card">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-glow-indigo">
                      <Cpu className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-navy-900">Technology Stack</h3>
                      <p className="text-sm text-navy-400">Enterprise-grade foundation</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {techStackItems.map((tech) => (
                      <div key={tech.name} className="bg-navy-50 rounded-xl p-4 hover:bg-ocean-50 transition-colors group">
                        <tech.icon className="w-5 h-5 text-navy-400 group-hover:text-ocean-600 mb-2 transition-colors" />
                        <div className="text-sm font-semibold text-navy-800">{tech.name}</div>
                        <div className="text-xs text-navy-400">{tech.category}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-ocean-600 to-indigo-700 rounded-2xl p-8 text-white shadow-glow-blue">
                  <div className="flex items-center gap-3 mb-4">
                    <Lock className="w-6 h-6 text-ocean-200" />
                    <h3 className="text-lg font-bold">Enterprise Security</h3>
                  </div>
                  <div className="space-y-2 text-sm text-ocean-100">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-300" />
                      <span>SOC 2 compliant infrastructure</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-300" />
                      <span>End-to-end encryption</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-300" />
                      <span>Role-based access control</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-300" />
                      <span>Automated backups & disaster recovery</span>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ===== AI AGENT SHOWCASE ===== */}
      <section className="py-24 px-6 bg-white wave-divider-white relative">
        <div className="max-w-6xl mx-auto relative z-10">
          <ScrollReveal>
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-200 rounded-full px-5 py-2.5 mb-6 shadow-soft">
                <Bot className="w-4 h-4 text-indigo-600" />
                <span className="text-sm font-medium text-indigo-700">Autonomous Intelligence</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-navy-900 mb-5">
                AI Agents That <span className="gradient-text-hero">Never Sleep</span>
              </h2>
              <p className="text-lg text-navy-500 max-w-2xl mx-auto">
                Five autonomous AI agents continuously monitor, analyze, and optimize
                every aspect of your logistics operations.
              </p>
            </div>
          </ScrollReveal>

          {/* Agent architecture diagram */}
          <ScrollReveal>
            <div className="bg-gradient-to-br from-navy-900 to-navy-800 rounded-2xl p-8 md:p-10 mb-12 shadow-premium">
              <div className="text-center mb-8">
                <h3 className="text-lg font-bold text-white mb-2">Agent Architecture</h3>
                <p className="text-sm text-navy-300">Autonomous agents working in concert</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {aiAgents.map((agent) => (
                  <div key={agent.name} className="text-center group">
                    <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br ${agent.gradient} flex items-center justify-center mx-auto mb-3 shadow-lg group-hover:scale-110 transition-transform`}>
                      <agent.icon className="w-7 h-7 md:w-8 md:h-8 text-white" />
                    </div>
                    <div className="text-xs font-semibold text-white mb-1">{agent.name.split(" ").slice(0, 2).join(" ")}</div>
                    <div className="flex items-center justify-center gap-1">
                      <div className={`w-1.5 h-1.5 rounded-full ${agent.statusColor}`} />
                      <span className="text-[10px] text-emerald-400">{agent.status}</span>
                    </div>
                  </div>
                ))}
              </div>
              {/* Connection lines */}
              <div className="hidden md:flex items-center justify-center mt-6 gap-4">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-ocean-500 to-transparent" />
                <div className="px-4 py-2 bg-ocean-500/20 border border-ocean-500/30 rounded-full text-xs text-ocean-300 font-medium">
                  Central Intelligence Hub
                </div>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-ocean-500 to-transparent" />
              </div>
            </div>
          </ScrollReveal>

          {/* Agent detail cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {aiAgents.map((agent, i) => (
              <ScrollReveal key={agent.name} delay={i * 100}>
                <div className="gradient-border bg-white rounded-2xl p-7 h-full hover:shadow-premium transition-all duration-300">
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${agent.gradient} flex items-center justify-center shadow-lg flex-shrink-0`}>
                      <agent.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-navy-900">{agent.name}</h3>
                      <div className="flex items-center gap-1.5 mt-1">
                        <div className={`w-2 h-2 rounded-full ${agent.statusColor}`} />
                        <span className="text-xs text-emerald-600 font-medium">{agent.status}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-navy-500 leading-relaxed mb-4">{agent.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {agent.capabilities.map((cap) => (
                      <span key={cap} className="text-[10px] bg-navy-50 text-navy-600 px-2.5 py-1 rounded-full font-medium">
                        {cap}
                      </span>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== APP MOCKUPS ===== */}
      <section className="py-24 px-6 section-alt">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-white border border-navy-200 rounded-full px-5 py-2.5 mb-6 shadow-soft">
                <Monitor className="w-4 h-4 text-ocean-600" />
                <span className="text-sm font-medium text-navy-600">Platform Preview</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-navy-900 mb-5">
                What the App <span className="gradient-text-hero">Looks Like</span>
              </h2>
              <p className="text-lg text-navy-500 max-w-2xl mx-auto">
                Wireframe previews of the full platform. Clean, data-rich interfaces
                designed for logistics operators who need answers fast.
              </p>
            </div>
          </ScrollReveal>

          {/* Mockup grid */}
          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            <ScrollReveal>
              <div>
                <h3 className="text-lg font-bold text-navy-900 mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-ocean-600" />
                  Executive Dashboard
                </h3>
                <MockupDashboard />
              </div>
            </ScrollReveal>
            <ScrollReveal delay={150}>
              <div>
                <h3 className="text-lg font-bold text-navy-900 mb-4 flex items-center gap-2">
                  <Route className="w-5 h-5 text-cargo-600" />
                  Route Comparison
                </h3>
                <MockupRouteComparison />
              </div>
            </ScrollReveal>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <ScrollReveal delay={100}>
              <div className="lg:col-span-2">
                <h3 className="text-lg font-bold text-navy-900 mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-emerald-600" />
                  FTZ Savings Analyzer
                </h3>
                <MockupFTZ />
              </div>
            </ScrollReveal>
            <ScrollReveal delay={250}>
              <div>
                <h3 className="text-lg font-bold text-navy-900 mb-4 flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-indigo-600" />
                  Mobile App
                </h3>
                <MockupMobile />
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ===== TIMELINE ===== */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <p className="text-sm font-semibold text-cargo-600 tracking-wider uppercase mb-3">Timeline</p>
              <h2 className="text-4xl md:text-5xl font-bold text-navy-900 mb-5">
                Delivery <span className="gradient-text-gold">Phases</span>
              </h2>
              <p className="text-lg text-navy-500 max-w-2xl mx-auto">
                18 weeks from kickoff to full platform. Each phase delivers
                working, deployable features you can use immediately.
              </p>
            </div>
          </ScrollReveal>

          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-ocean-500 via-indigo-500 to-cargo-500" />

            <div className="space-y-8">
              {timeline.map((phase, i) => (
                <ScrollReveal key={phase.phase} delay={i * 100}>
                  <div className="relative pl-16">
                    {/* Timeline dot */}
                    <div className={`absolute left-4 top-6 w-5 h-5 rounded-full ring-4 ring-white shadow-md ${
                      phase.status === "complete" ? "bg-emerald-500" : phase.status === "in-progress" ? "bg-ocean-500 animate-pulse" : "bg-navy-300"
                    }`} />

                    <div className={`bg-white border rounded-2xl p-6 shadow-soft hover:shadow-card transition-all duration-300 ${
                      phase.status === "complete" ? "border-emerald-200" : phase.status === "in-progress" ? "border-ocean-200" : "border-navy-100"
                    }`}>
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <span className="text-xs font-bold text-ocean-600 uppercase tracking-wider">{phase.phase}</span>
                          <h3 className="text-lg font-bold text-navy-900">{phase.title}</h3>
                        </div>
                        <div className="text-right">
                          <span className={`text-xs font-medium px-3 py-1.5 rounded-full ${
                            phase.status === "complete" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                            phase.status === "in-progress" ? "bg-ocean-50 text-ocean-700 border border-ocean-200" :
                            "bg-navy-50 text-navy-500 border border-navy-200"
                          }`}>
                            {phase.status === "complete" ? "Complete" : phase.status === "in-progress" ? "In Progress" : "Upcoming"}
                          </span>
                          <div className="text-xs text-navy-400 mt-1">{phase.duration}</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {phase.items.map((item) => (
                          <div key={item} className="flex items-center gap-2 text-sm text-navy-600">
                            <Check className={`w-3.5 h-3.5 flex-shrink-0 ${phase.status === "complete" ? "text-emerald-500" : "text-ocean-400"}`} />
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== PRICING / INVESTMENT ===== */}
      <section className="py-24 px-6 bg-gradient-to-b from-navy-900 to-navy-950">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-14">
              <p className="text-sm font-semibold text-ocean-400 tracking-wider uppercase mb-3">Investment</p>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-5">
                Platform Investment
              </h2>
              <p className="text-lg text-navy-300 max-w-2xl mx-auto">
                A one-time build investment for a platform that generates
                ongoing operational savings and competitive advantage.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={100}>
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 md:p-10 mb-8">
              <div className="grid md:grid-cols-3 gap-8 text-center">
                <div>
                  <div className="text-sm text-navy-300 mb-2">Platform Build</div>
                  <div className="text-4xl font-bold text-white mb-1">$45,000</div>
                  <div className="text-xs text-navy-400">One-time investment</div>
                </div>
                <div className="border-y md:border-y-0 md:border-x border-white/10 py-6 md:py-0">
                  <div className="text-sm text-navy-300 mb-2">Monthly Hosting</div>
                  <div className="text-4xl font-bold text-white mb-1">$500</div>
                  <div className="text-xs text-navy-400">Infrastructure + AI agents</div>
                </div>
                <div>
                  <div className="text-sm text-navy-300 mb-2">Projected ROI</div>
                  <div className="text-4xl font-bold text-emerald-400 mb-1">340%</div>
                  <div className="text-xs text-navy-400">Year 1 estimated return</div>
                </div>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                  <Check className="w-5 h-5 text-emerald-400" />
                  Included in Build
                </h3>
                <div className="space-y-2.5 text-sm text-navy-300">
                  {["Full platform development", "5 autonomous AI agents", "All calculators & tools", "Interactive maps & charts", "Knowledge base (40+ terms)", "Mobile-responsive design", "PDF export capability", "Source code ownership"].map((item) => (
                    <div key={item} className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-cargo-400" />
                  Ongoing Support
                </h3>
                <div className="space-y-2.5 text-sm text-navy-300">
                  {["AI agent monitoring & tuning", "Tariff data updates", "Carrier rate feeds", "Feature enhancements", "Priority bug fixes", "Performance optimization", "Security patches", "24/7 uptime monitoring"].map((item) => (
                    <div key={item} className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-cargo-400 flex-shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ===== NEXT STEPS CTA ===== */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <ScrollReveal>
            <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-full px-5 py-2.5 mb-8 shadow-soft">
              <Zap className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-medium text-emerald-700">Ready to Start</span>
            </div>

            <h2 className="text-4xl md:text-5xl font-bold text-navy-900 mb-6">
              Next <span className="gradient-text-hero">Steps</span>
            </h2>

            <div className="space-y-6 mb-10 text-left max-w-lg mx-auto">
              {[
                { step: "1", title: "Review this proposal", description: "Explore the live calculators, mockups, and agent architecture" },
                { step: "2", title: "Schedule a walkthrough", description: "30-minute call to discuss customization and priorities" },
                { step: "3", title: "Sign & kickoff", description: "Development begins immediately with Phase 1 deliverables" },
              ].map((item) => (
                <div key={item.step} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-ocean-600 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-glow-blue text-white font-bold text-sm">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="font-bold text-navy-900">{item.title}</h3>
                    <p className="text-sm text-navy-500">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/#calculators" className="btn-primary px-8 py-4 text-base">
                Try Live Calculators
                <ArrowRight className="w-5 h-5" />
              </a>
              <a href="/" className="btn-secondary px-8 py-4 text-base">
                Back to Platform Overview
              </a>
            </div>
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
            AI-Powered International Logistics Platform
          </div>
          <div className="text-xs text-navy-400">
            Confidential Proposal &mdash; Built with AI Acrobatics
          </div>
        </div>
      </footer>
    </main>
  );
}

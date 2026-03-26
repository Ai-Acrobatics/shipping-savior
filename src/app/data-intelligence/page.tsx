"use client";

import { useState } from "react";
import Header from "@/components/Header";
import ScrollReveal from "@/components/ScrollReveal";
import {
  Database, Brain, ArrowRight, Check, Zap, Globe,
  BarChart3, Ship, TrendingUp, Shield, Cpu, Search,
  FileText, AlertTriangle, Clock, Bot, Radar,
  Route, Calculator, Activity, DollarSign, Lock,
  ChevronRight, Layers, Eye, RefreshCw, Download,
  Code2, Workflow, Server, HardDrive, Radio,
} from "lucide-react";

/* ─── Data Source Categories ─── */
const dataCategories = [
  {
    name: "Tariff & Duty",
    icon: FileText,
    gradient: "from-blue-500 to-blue-600",
    bgLight: "bg-blue-50",
    borderColor: "border-blue-200",
    textColor: "text-blue-700",
    sources: [
      { name: "USITC HTS Schedule", data: "100K+ tariff codes, duty rates, special programs", frequency: "Quarterly", method: "Download JSON", cost: "FREE" },
      { name: "USITC DataWeb", data: "Historical trade statistics by country/product", frequency: "Monthly", method: "Export CSV", cost: "FREE" },
      { name: "CBP Rulings Database", data: "Tariff classification precedents", frequency: "Weekly", method: "Scrape HTML", cost: "FREE" },
      { name: "Section 301 Tariff Lists", data: "Additional duties by country/product", frequency: "As published", method: "Monitor Federal Register", cost: "FREE" },
      { name: "AD/CVD Orders", data: "Anti-dumping/countervailing duty database", frequency: "Monthly", method: "CBP Website", cost: "FREE" },
      { name: "Trade Agreement Rates", data: "USMCA, CAFTA-DR preferential rates", frequency: "Annually", method: "USITC", cost: "FREE" },
    ],
  },
  {
    name: "Carrier & Vessel",
    icon: Ship,
    gradient: "from-ocean-500 to-ocean-600",
    bgLight: "bg-ocean-50",
    borderColor: "border-ocean-200",
    textColor: "text-ocean-700",
    sources: [
      { name: "Maersk Developer API", data: "Schedules, tracking, booking", frequency: "Real-time", method: "REST API", cost: "FREE" },
      { name: "CMA CGM API Portal", data: "Schedule search, tracking", frequency: "Real-time", method: "REST API", cost: "FREE" },
      { name: "MSC Schedules", data: "Vessel schedules by port pair", frequency: "Weekly", method: "Scrape Website", cost: "FREE" },
      { name: "COSCO/Evergreen/ONE", data: "Vessel schedule pages", frequency: "Weekly", method: "Scrape", cost: "FREE" },
      { name: "MarineTraffic AIS", data: "Real-time vessel positions", frequency: "Real-time", method: "API", cost: "$100+/mo" },
      { name: "Terminal49", data: "Container tracking across all US terminals", frequency: "Real-time", method: "API", cost: "FREE tier" },
      { name: "Searoutes API", data: "Maritime route distances and waypoints", frequency: "On-demand", method: "API", cost: "Tiered" },
    ],
  },
  {
    name: "Port & Terminal",
    icon: Globe,
    gradient: "from-emerald-500 to-emerald-600",
    bgLight: "bg-emerald-50",
    borderColor: "border-emerald-200",
    textColor: "text-emerald-700",
    sources: [
      { name: "MARAD Port Statistics", data: "US port throughput, vessel calls", frequency: "Monthly", method: "Download", cost: "FREE" },
      { name: "World Port Index (NGA)", data: "3,700+ ports with coordinates", frequency: "Annually", method: "Download", cost: "FREE" },
      { name: "UN/LOCODE", data: "Standard port codes worldwide", frequency: "Bi-annually", method: "Download", cost: "FREE" },
      { name: "Terminal Gate Hours", data: "Per-terminal operating schedules", frequency: "Weekly", method: "Scrape", cost: "FREE" },
      { name: "Demurrage/Detention Fees", data: "Per-carrier tariff schedules", frequency: "Quarterly", method: "Scrape PDFs", cost: "FREE" },
    ],
  },
  {
    name: "Trade Intelligence",
    icon: BarChart3,
    gradient: "from-indigo-500 to-indigo-600",
    bgLight: "bg-indigo-50",
    borderColor: "border-indigo-200",
    textColor: "text-indigo-700",
    sources: [
      { name: "Census Bureau (usatrade)", data: "US import/export volumes by HS code", frequency: "Monthly", method: "API", cost: "FREE" },
      { name: "UN Comtrade", data: "Global trade flows between countries", frequency: "Monthly", method: "API", cost: "FREE" },
      { name: "ImportGenius/Panjiva", data: "Bill of lading records, competitor analysis", frequency: "Daily", method: "Subscription", cost: "$99-500/mo" },
      { name: "CBP FOIA", data: "Public import records", frequency: "On request", method: "Request", cost: "FREE" },
    ],
  },
  {
    name: "FTZ & Compliance",
    icon: Shield,
    gradient: "from-purple-500 to-purple-600",
    bgLight: "bg-purple-50",
    borderColor: "border-purple-200",
    textColor: "text-purple-700",
    sources: [
      { name: "OFIS (trade.gov)", data: "260+ FTZ locations, operators, contacts", frequency: "Monthly", method: "Scrape", cost: "FREE" },
      { name: "Federal Register", data: "Tariff changes, trade policy notices", frequency: "Daily", method: "API", cost: "FREE" },
      { name: "CBP CSMS", data: "Cargo systems alerts, system updates", frequency: "Real-time", method: "Subscribe", cost: "FREE" },
      { name: "FDA Import Alerts", data: "Food safety alerts for cold chain", frequency: "Weekly", method: "API", cost: "FREE" },
    ],
  },
];

/* ─── AI Agents ─── */
const aiAgents = [
  {
    name: "Tariff Classification AI",
    icon: Calculator,
    gradient: "from-blue-500 to-blue-600",
    bgLight: "bg-blue-50",
    borderColor: "border-blue-200",
    description: "Auto-classifies products to HTS codes from plain-text descriptions. Learns from CBP rulings to improve accuracy over time.",
    dataSources: ["USITC HTS", "CBP Rulings", "Claude API"],
    revenue: "$5-25 per classification",
    comparison: "vs $100-300 from customs brokers",
    accuracy: "92%+",
    status: "Active",
  },
  {
    name: "Route Optimizer",
    icon: Route,
    gradient: "from-ocean-500 to-ocean-600",
    bgLight: "bg-ocean-50",
    borderColor: "border-ocean-200",
    description: "Finds best carrier/route combinations based on cost, speed, and reliability. Surfaces backhaul opportunities invisible to competitors.",
    dataSources: ["All carrier schedules", "AIS data", "Port congestion"],
    revenue: "Included in Pro/Enterprise",
    comparison: "Drives tier upgrades",
    accuracy: "Real-time",
    status: "Active",
  },
  {
    name: "Cost Predictor",
    icon: DollarSign,
    gradient: "from-emerald-500 to-emerald-600",
    bgLight: "bg-emerald-50",
    borderColor: "border-emerald-200",
    description: "Predicts total landed cost including hidden fees. Flags anomalous charges and benchmarks against market rates.",
    dataSources: ["Historical shipments", "Carrier tariffs", "Demurrage patterns"],
    revenue: "Per-prediction or subscription",
    comparison: "Catches $1K+ overcharges",
    accuracy: "+/-3%",
    status: "Active",
  },
  {
    name: "Compliance Monitor",
    icon: AlertTriangle,
    gradient: "from-amber-500 to-amber-600",
    bgLight: "bg-amber-50",
    borderColor: "border-amber-200",
    description: "Watches for tariff changes, ISF deadlines, and expiring bonds. Zero ISF penalties means $5K saved per avoided violation.",
    dataSources: ["Federal Register", "CBP CSMS", "Customs bond records"],
    revenue: "$99/mo per monitored entity",
    comparison: "Prevents $5K+ penalties each",
    accuracy: "99.9%",
    status: "Active",
  },
  {
    name: "FTZ Strategy Optimizer",
    icon: Shield,
    gradient: "from-purple-500 to-purple-600",
    bgLight: "bg-purple-50",
    borderColor: "border-purple-200",
    description: "Recommends optimal FTZ entry timing and withdrawal schedules. No competitor offers this — unique market position.",
    dataSources: ["USITC duty trends", "FTZ inventory", "Demand forecasts"],
    revenue: "$2,500 per strategy engagement",
    comparison: "Unique — no competition",
    accuracy: "Custom per client",
    status: "Active",
  },
  {
    name: "Trade Intelligence",
    icon: Eye,
    gradient: "from-teal-500 to-teal-600",
    bgLight: "bg-teal-50",
    borderColor: "border-teal-200",
    description: "Analyzes competitor imports, trending products, and market sizing. Identifies 'first on the Silk Road' opportunities before anyone else.",
    dataSources: ["ImportGenius BOL data", "Census statistics", "UN Comtrade"],
    revenue: "$500-2K/mo data subscription",
    comparison: "Actionable market intel",
    accuracy: "Updated daily",
    status: "Coming Soon",
  },
];

/* ─── Pipeline Steps ─── */
const pipelineSteps = [
  { label: "Sources", detail: "20+ public APIs, websites, and databases", icon: Globe, color: "from-blue-500 to-blue-600" },
  { label: "Scrapers", detail: "Crawlee + Playwright, scheduled crons", icon: Code2, color: "from-ocean-500 to-ocean-600" },
  { label: "Data Lake", detail: "PostgreSQL + pgvector embeddings", icon: HardDrive, color: "from-emerald-500 to-emerald-600" },
  { label: "AI Processing", detail: "Claude API + custom ML models", icon: Brain, color: "from-purple-500 to-purple-600" },
  { label: "API Layer", detail: "REST + WebSocket real-time feeds", icon: Server, color: "from-indigo-500 to-indigo-600" },
  { label: "Platform", detail: "User-facing tools and dashboards", icon: Layers, color: "from-teal-500 to-teal-600" },
];

/* ─── Competitive Advantages ─── */
const advantages = [
  {
    ours: "Scrape 20+ sources daily for real-time data",
    theirs: "Use static, quarterly-updated spreadsheets",
    icon: RefreshCw,
    gradient: "from-ocean-500 to-ocean-600",
  },
  {
    ours: "AI classifies tariffs for $5 in seconds",
    theirs: "Charge $100-300 for manual classification",
    icon: Calculator,
    gradient: "from-emerald-500 to-emerald-600",
  },
  {
    ours: "Automated FTZ strategy saves $50K+ per container",
    theirs: "Ignore FTZ entirely — leave money on the table",
    icon: Shield,
    gradient: "from-purple-500 to-purple-600",
  },
  {
    ours: "Predictive compliance prevents $5K penalties",
    theirs: "Reactive — discover penalties after they happen",
    icon: AlertTriangle,
    gradient: "from-amber-500 to-amber-600",
  },
];

export default function DataIntelligencePage() {
  const [activeCategory, setActiveCategory] = useState(0);

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
            <span className="text-sm font-medium text-navy-600">AI-Powered</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 text-navy-900">
            Data Intelligence{" "}
            <span className="gradient-text-hero">Platform</span>
          </h1>

          <p className="text-xl text-navy-500 max-w-2xl mx-auto mb-8 leading-relaxed">
            Scrape, aggregate, and analyze shipping data from 20+ public sources
            — then use AI agents to deliver intelligent logistics services.
          </p>

          <div className="flex flex-wrap gap-4 justify-center text-sm">
            {[
              { label: "20+ Data Sources", icon: Database },
              { label: "6 AI Agents", icon: Bot },
              { label: "Real-Time Monitoring", icon: Radio },
              { label: "$0 Data Cost", icon: DollarSign },
            ].map((stat) => (
              <span key={stat.label} className="inline-flex items-center gap-2 bg-white/80 border border-navy-200 rounded-full px-4 py-2 text-navy-600 font-medium shadow-soft">
                <stat.icon className="w-4 h-4 text-ocean-600" />
                {stat.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ===== DATA SOURCES ===== */}
      <section className="py-24 px-6 section-alt">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <p className="text-sm font-semibold text-ocean-600 tracking-wider uppercase mb-3">Data Foundation</p>
              <h2 className="text-4xl md:text-5xl font-bold text-navy-900 mb-5">
                Data Sources We <span className="gradient-text">Scrape</span>
              </h2>
              <p className="text-lg text-navy-500 max-w-2xl mx-auto">
                26 public data sources organized into five categories. Most are free.
                We scrape, normalize, and index everything into a unified data lake.
              </p>
            </div>
          </ScrollReveal>

          {/* Category Tabs */}
          <ScrollReveal>
            <div className="flex flex-wrap gap-3 justify-center mb-12">
              {dataCategories.map((cat, i) => (
                <button
                  key={cat.name}
                  onClick={() => setActiveCategory(i)}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                    activeCategory === i
                      ? "bg-gradient-to-r " + cat.gradient + " text-white shadow-lg scale-105"
                      : "bg-white border border-navy-200 text-navy-600 hover:border-ocean-300 hover:text-ocean-600"
                  }`}
                >
                  <cat.icon className="w-4 h-4" />
                  {cat.name}
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    activeCategory === i ? "bg-white/20" : "bg-navy-100"
                  }`}>
                    {cat.sources.length}
                  </span>
                </button>
              ))}
            </div>
          </ScrollReveal>

          {/* Active Category Sources */}
          <ScrollReveal>
            <div className="grid gap-4">
              {dataCategories[activeCategory].sources.map((source) => (
                <div
                  key={source.name}
                  className={`bg-white rounded-xl p-5 border ${dataCategories[activeCategory].borderColor} shadow-soft hover:shadow-card transition-all duration-300`}
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-bold text-navy-900">{source.name}</h4>
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                          source.cost === "FREE"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}>
                          {source.cost}
                        </span>
                      </div>
                      <p className="text-sm text-navy-500">{source.data}</p>
                    </div>
                    <div className="flex gap-6 text-sm">
                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-navy-400 font-semibold mb-1">Frequency</div>
                        <div className="text-navy-700 font-medium">{source.frequency}</div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-navy-400 font-semibold mb-1">Method</div>
                        <div className="text-navy-700 font-medium">{source.method}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollReveal>

          {/* Source Count Summary */}
          <ScrollReveal delay={100}>
            <div className="mt-12 grid grid-cols-2 md:grid-cols-5 gap-4">
              {dataCategories.map((cat) => {
                const freeCount = cat.sources.filter((s) => s.cost === "FREE" || s.cost === "FREE tier").length;
                return (
                  <div key={cat.name} className={`${cat.bgLight} rounded-xl p-4 border ${cat.borderColor} text-center`}>
                    <div className={`text-2xl font-bold ${cat.textColor}`}>{cat.sources.length}</div>
                    <div className="text-xs text-navy-500 font-medium mt-1">{cat.name}</div>
                    <div className="text-[10px] text-emerald-600 font-medium mt-0.5">{freeCount} free</div>
                  </div>
                );
              })}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ===== DATA PIPELINE ===== */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <p className="text-sm font-semibold text-ocean-600 tracking-wider uppercase mb-3">Architecture</p>
              <h2 className="text-4xl md:text-5xl font-bold text-navy-900 mb-5">
                Data Pipeline <span className="gradient-text">Architecture</span>
              </h2>
              <p className="text-lg text-navy-500 max-w-2xl mx-auto">
                From raw public data to AI-powered insights in six stages.
              </p>
            </div>
          </ScrollReveal>

          {/* Pipeline Flow */}
          <ScrollReveal>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
              {pipelineSteps.map((step, i) => (
                <div key={step.label} className="relative">
                  <div className="bg-white rounded-2xl p-5 border border-navy-100 shadow-card text-center h-full hover:shadow-premium transition-all duration-300">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center mx-auto mb-3 shadow-lg`}>
                      <step.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-xs font-semibold text-ocean-600 mb-1">Step {i + 1}</div>
                    <h4 className="font-bold text-navy-900 text-sm mb-1">{step.label}</h4>
                    <p className="text-[11px] text-navy-500 leading-relaxed">{step.detail}</p>
                  </div>
                  {i < pipelineSteps.length - 1 && (
                    <div className="hidden lg:flex absolute top-1/2 -right-2 transform -translate-y-1/2 z-10">
                      <ChevronRight className="w-4 h-4 text-navy-300" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollReveal>

          {/* Tech Stack Details */}
          <ScrollReveal delay={100}>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl p-6 border border-navy-100 shadow-card">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-ocean-500 to-ocean-600 flex items-center justify-center">
                    <Code2 className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="font-bold text-navy-900">Scrapers</h4>
                </div>
                <ul className="space-y-2">
                  {["Crawlee + Playwright for JS-heavy sites", "Custom cron schedules per source", "Rate limiting and retry logic", "Change detection and diffing"].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-navy-600">
                      <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-navy-100 shadow-card">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                    <HardDrive className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="font-bold text-navy-900">Storage</h4>
                </div>
                <ul className="space-y-2">
                  {["PostgreSQL for structured data", "pgvector for AI embeddings", "Typesense for HTS fuzzy search", "S3 for raw document archive"].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-navy-600">
                      <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-navy-100 shadow-card">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                    <Activity className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="font-bold text-navy-900">Monitoring</h4>
                </div>
                <ul className="space-y-2">
                  {["Freshness alerts per data source", "Data quality validation checks", "Anomaly detection on values", "Scraper health dashboard"].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-navy-600">
                      <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ===== AI AGENTS ===== */}
      <section className="py-24 px-6 section-alt">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <p className="text-sm font-semibold text-ocean-600 tracking-wider uppercase mb-3">The Money Makers</p>
              <h2 className="text-4xl md:text-5xl font-bold text-navy-900 mb-5">
                AI Agent <span className="gradient-text">Services</span>
              </h2>
              <p className="text-lg text-navy-500 max-w-2xl mx-auto">
                Six specialized AI agents that transform raw data into premium,
                revenue-generating logistics services.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {aiAgents.map((agent, i) => (
              <ScrollReveal key={agent.name} delay={i * 75}>
                <div className="bg-white rounded-2xl p-6 border border-navy-100 shadow-card hover:shadow-premium transition-all duration-300 h-full flex flex-col">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${agent.gradient} flex items-center justify-center shadow-lg`}>
                      <agent.icon className="w-6 h-6 text-white" />
                    </div>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                      agent.status === "Active"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}>
                      <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${
                        agent.status === "Active" ? "bg-emerald-500" : "bg-amber-500"
                      }`} />
                      {agent.status}
                    </span>
                  </div>

                  {/* Name & Description */}
                  <h3 className="text-lg font-bold text-navy-900 mb-2">{agent.name}</h3>
                  <p className="text-sm text-navy-500 mb-4 leading-relaxed flex-1">{agent.description}</p>

                  {/* Data Sources */}
                  <div className="mb-4">
                    <div className="text-[10px] uppercase tracking-wider text-navy-400 font-semibold mb-2">Data Sources</div>
                    <div className="flex flex-wrap gap-1.5">
                      {agent.dataSources.map((ds) => (
                        <span key={ds} className={`text-[11px] px-2 py-1 rounded-md ${agent.bgLight} ${agent.borderColor} border font-medium text-navy-600`}>
                          {ds}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Revenue & Stats */}
                  <div className={`rounded-xl p-3 ${agent.bgLight} border ${agent.borderColor}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-navy-700">{agent.revenue}</span>
                      {agent.accuracy && (
                        <span className="text-[10px] text-navy-500">{agent.accuracy} accuracy</span>
                      )}
                    </div>
                    <div className="text-[11px] text-navy-500">{agent.comparison}</div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT CONNECTS ===== */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <p className="text-sm font-semibold text-ocean-600 tracking-wider uppercase mb-3">System Overview</p>
              <h2 className="text-4xl md:text-5xl font-bold text-navy-900 mb-5">
                How It All <span className="gradient-text">Connects</span>
              </h2>
              <p className="text-lg text-navy-500 max-w-2xl mx-auto">
                Data flows from public sources through our pipeline into AI agents
                that power every tool on the platform.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal>
            <div className="bg-white rounded-2xl border border-navy-100 shadow-premium overflow-hidden">
              <div className="grid md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-navy-100">
                {/* Column 1: Data Sources */}
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                      <Database className="w-4 h-4 text-white" />
                    </div>
                    <h4 className="font-bold text-navy-900 text-sm">Data Sources</h4>
                  </div>
                  <div className="space-y-2">
                    {["Tariff & Duty (6)", "Carrier & Vessel (7)", "Port & Terminal (5)", "Trade Intel (4)", "FTZ & Compliance (4)"].map((item) => (
                      <div key={item} className="text-xs text-navy-600 bg-navy-50 rounded-lg px-3 py-2 font-medium">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Column 2: Processing */}
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-ocean-500 to-ocean-600 flex items-center justify-center">
                      <Workflow className="w-4 h-4 text-white" />
                    </div>
                    <h4 className="font-bold text-navy-900 text-sm">Processing</h4>
                  </div>
                  <div className="space-y-2">
                    {["Crawlee scrapers", "Cron schedulers", "Data normalization", "pgvector embeddings", "Typesense indexing"].map((item) => (
                      <div key={item} className="text-xs text-navy-600 bg-ocean-50 rounded-lg px-3 py-2 font-medium">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Column 3: AI Agents */}
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                      <Brain className="w-4 h-4 text-white" />
                    </div>
                    <h4 className="font-bold text-navy-900 text-sm">AI Agents</h4>
                  </div>
                  <div className="space-y-2">
                    {aiAgents.map((agent) => (
                      <div key={agent.name} className="flex items-center gap-2 text-xs text-navy-600 bg-purple-50 rounded-lg px-3 py-2 font-medium">
                        <span className={`w-1.5 h-1.5 rounded-full ${agent.status === "Active" ? "bg-emerald-500" : "bg-amber-500"}`} />
                        {agent.name}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Column 4: Platform Tools */}
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                      <Layers className="w-4 h-4 text-white" />
                    </div>
                    <h4 className="font-bold text-navy-900 text-sm">Platform Tools</h4>
                  </div>
                  <div className="space-y-2">
                    {["Landed cost calculator", "HTS code lookup", "Route comparison", "FTZ savings analyzer", "Shipment tracker", "Trade analytics"].map((item) => (
                      <div key={item} className="text-xs text-navy-600 bg-emerald-50 rounded-lg px-3 py-2 font-medium">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ===== COMPETITIVE ADVANTAGE ===== */}
      <section className="py-24 px-6 section-alt">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <p className="text-sm font-semibold text-ocean-600 tracking-wider uppercase mb-3">Why We Win</p>
              <h2 className="text-4xl md:text-5xl font-bold text-navy-900 mb-5">
                Competitive <span className="gradient-text">Advantage</span>
              </h2>
              <p className="text-lg text-navy-500 max-w-2xl mx-auto">
                While competitors rely on static data and manual processes,
                our AI-powered pipeline delivers intelligence they cannot match.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-6">
            {advantages.map((adv, i) => (
              <ScrollReveal key={i} delay={i * 100}>
                <div className="bg-white rounded-2xl p-6 border border-navy-100 shadow-card hover:shadow-premium transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${adv.gradient} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                      <adv.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-3 h-3 text-emerald-600" />
                        </div>
                        <div>
                          <div className="text-[10px] uppercase tracking-wider text-emerald-600 font-semibold mb-0.5">Shipping Savior</div>
                          <p className="text-sm font-medium text-navy-900">{adv.ours}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <ArrowRight className="w-3 h-3 text-red-400" />
                        </div>
                        <div>
                          <div className="text-[10px] uppercase tracking-wider text-navy-400 font-semibold mb-0.5">Competitors</div>
                          <p className="text-sm text-navy-500">{adv.theirs}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <ScrollReveal>
            <div className="bg-gradient-to-br from-navy-900 via-navy-800 to-indigo-900 rounded-3xl p-12 md:p-16 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-ocean-500/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl" />

              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-5 py-2 mb-6">
                  <Database className="w-4 h-4 text-ocean-300" />
                  <span className="text-sm font-medium text-white/80">26 Sources. 6 Agents. One Platform.</span>
                </div>

                <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                  Data is the new oil.
                  <br />
                  <span className="text-ocean-300">We built the refinery.</span>
                </h2>

                <p className="text-lg text-white/70 max-w-xl mx-auto mb-8">
                  Every data source is free or low-cost. The AI agents are the margin.
                  This is how Shipping Savior prints money.
                </p>

                <div className="flex flex-wrap gap-4 justify-center">
                  <a
                    href="/monetization"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-white px-6 py-3 rounded-xl transition-all duration-300 hover:scale-[1.02] shadow-lg"
                    style={{
                      background: "linear-gradient(135deg, #1a56db, #6366f1)",
                      boxShadow: "0 4px 15px rgba(37, 99, 235, 0.3)",
                    }}
                  >
                    See Revenue Model
                    <ArrowRight className="w-4 h-4" />
                  </a>
                  <a
                    href="/agreement"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-white/90 px-6 py-3 rounded-xl border border-white/20 hover:bg-white/10 transition-all duration-300"
                  >
                    View Proposal
                    <ChevronRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </main>
  );
}

"use client";

import Header from "@/components/Header";
import ScrollReveal from "@/components/ScrollReveal";
import {
  Server, Database, Globe, Zap, Shield, Brain,
  ArrowRight, ArrowDown, Ship, Layers, RefreshCw,
  Cloud, Lock, Route, FileText, Search, Workflow,
  Box, Container, AlertTriangle, Check, Monitor,
  GitBranch, BarChart3, Users, Building2, Cable,
  Network, HardDrive, Cpu, Activity, Code2,
} from "lucide-react";

/* ───────── SECTION 1: SYSTEM OVERVIEW LAYERS ───────── */

const architectureLayers = [
  {
    label: "Presentation Layer",
    color: "from-ocean-500 to-indigo-600",
    bg: "bg-ocean-50",
    border: "border-ocean-200",
    badge: "bg-ocean-100 text-ocean-700",
    icon: Monitor,
    items: [
      "Next.js 14 App Router (React Server + Client Components)",
      "Tailwind CSS + Framer Motion animations",
      "react-map-gl + deck.gl interactive maps",
      "Recharts + @tremor/react dashboards",
      "@tanstack/react-table data grids",
    ],
    note: "Served via Vercel Edge Network — CDN-cached static + streaming SSR",
  },
  {
    label: "API Layer",
    color: "from-purple-500 to-violet-600",
    bg: "bg-purple-50",
    border: "border-purple-200",
    badge: "bg-purple-100 text-purple-700",
    icon: Server,
    items: [
      "Next.js API Routes (serverless functions on Vercel)",
      "13 internal REST endpoints (hts, calculate, routes, compliance, shipments)",
      "JWT auth middleware on all protected routes",
      "Zod schema validation on all request bodies",
      "Redis (Upstash) rate limiting — 100 req/min per IP",
    ],
    note: "Stateless, horizontally scalable, cold start < 200ms",
  },
  {
    label: "Business Logic Layer",
    color: "from-amber-500 to-orange-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
    badge: "bg-amber-100 text-amber-700",
    icon: GitBranch,
    items: [
      "Landed cost calculator (decimal.js precision arithmetic)",
      "FTZ savings modeling (PF/NPF election logic)",
      "Container utilization optimizer (volume + weight constraints)",
      "Tariff duty rate resolver (HTS + country + trade program)",
      "AI classification pipeline (Claude API + RAG over CBP rulings)",
    ],
    note: "Pure TypeScript modules — fully testable, zero framework coupling",
  },
  {
    label: "Data Access Layer",
    color: "from-emerald-500 to-teal-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    badge: "bg-emerald-100 text-emerald-700",
    icon: Database,
    items: [
      "Drizzle ORM — type-safe queries with migrations",
      "Neon PostgreSQL serverless (pgvector for embeddings)",
      "Typesense Cloud — fuzzy HTS code search index",
      "Redis (Upstash) — query result caching, session store",
      "Vercel Blob — PDF reports and document storage",
    ],
    note: "All queries typed end-to-end — no raw SQL in application code",
  },
  {
    label: "Data Pipeline Layer",
    color: "from-slate-500 to-gray-600",
    bg: "bg-slate-50",
    border: "border-slate-200",
    badge: "bg-slate-100 text-slate-700",
    icon: Workflow,
    items: [
      "Inngest — job orchestration, retries, scheduling",
      "Crawlee + Playwright — carrier and CBP web scraping",
      "Node-cron — nightly data freshness checks",
      "Cheerio — lightweight HTML parsing",
      "pgvector embeddings pipeline (Claude text-embedding-3)",
    ],
    note: "Decoupled from application — failures don't impact user-facing requests",
  },
];

/* ───────── SECTION 2: DATA FLOW ───────── */

const dataFlowSteps = [
  {
    step: "1",
    label: "User Request",
    icon: Users,
    color: "bg-ocean-500",
    desc: "Browser sends request to Vercel Edge (SSR page or API route)",
    arrow: true,
  },
  {
    step: "2",
    label: "Auth Middleware",
    icon: Lock,
    color: "bg-red-500",
    desc: "JWT verified, rate limit checked via Redis, request allowed or rejected",
    arrow: true,
  },
  {
    step: "3",
    label: "API Route",
    icon: Server,
    color: "bg-purple-500",
    desc: "Serverless function validates payload with Zod, routes to business logic",
    arrow: true,
  },
  {
    step: "4",
    label: "Business Logic",
    icon: GitBranch,
    color: "bg-amber-500",
    desc: "Calculation or query executed — may call Claude API for AI features",
    arrow: true,
  },
  {
    step: "5",
    label: "Data Layer",
    icon: Database,
    color: "bg-emerald-500",
    desc: "Drizzle queries Neon Postgres; cache hit served from Redis if available",
    arrow: true,
  },
  {
    step: "6",
    label: "Response",
    icon: Zap,
    color: "bg-indigo-500",
    desc: "Typed JSON returned, React components rerender with fresh data",
    arrow: false,
  },
];

/* ───────── SECTION 3: CARRIER INTEGRATIONS ───────── */

const carrierIntegrations = [
  {
    name: "Maersk",
    method: "REST API",
    badge: "API Key",
    badgeColor: "bg-emerald-100 text-emerald-700",
    endpoints: ["GET /schedules", "GET /tracking/{container}"],
    data: "Port-to-port schedules, vessel ETAs, container status",
    refresh: "Daily",
    icon: Ship,
  },
  {
    name: "CMA CGM",
    method: "REST API",
    badge: "API Key",
    badgeColor: "bg-emerald-100 text-emerald-700",
    endpoints: ["GET /schedules", "GET /tracking"],
    data: "Route schedules, transit times, live tracking",
    refresh: "Daily",
    icon: Ship,
  },
  {
    name: "Hapag-Lloyd",
    method: "REST API",
    badge: "API Key",
    badgeColor: "bg-emerald-100 text-emerald-700",
    endpoints: ["GET /schedule/v3/routes"],
    data: "Liner schedules, backhaul pricing flags",
    refresh: "Daily",
    icon: Ship,
  },
  {
    name: "MSC",
    method: "Web Scrape",
    badge: "Playwright",
    badgeColor: "bg-amber-100 text-amber-700",
    endpoints: ["msc.com/en/find-a-schedule"],
    data: "Schedule search results, transit days, port pairs",
    refresh: "Weekly",
    icon: Ship,
  },
  {
    name: "Terminal49",
    method: "REST API",
    badge: "Paid — Free Tier",
    badgeColor: "bg-blue-100 text-blue-700",
    endpoints: ["GET /api/v2/containers/{number}"],
    data: "Container tracking events, terminal holds, customs release",
    refresh: "Real-time",
    icon: Container,
  },
  {
    name: "MarineTraffic",
    method: "REST API",
    badge: "Paid — $199+/mo",
    badgeColor: "bg-rose-100 text-rose-700",
    endpoints: ["GET /api/exportvessel/v:2"],
    data: "AIS vessel positions, ETA predictions, port congestion",
    refresh: "15-min intervals",
    icon: Globe,
  },
];

/* ───────── SECTION 4: GOVERNMENT & DATA APIS ───────── */

const govDataSources = [
  {
    name: "USITC HTS API",
    type: "Federal API",
    color: "bg-navy-100 text-navy-700",
    data: "Full HTS tariff schedule (10-digit codes, duty rates, unit quantities)",
    schedule: "Quarterly",
    format: "JSON",
    endpoint: "dataweb.usitc.gov/api",
  },
  {
    name: "CBP CROSS",
    type: "Scrape",
    color: "bg-amber-100 text-amber-700",
    data: "220K+ CBP classification rulings — embedded for RAG search",
    schedule: "Daily delta",
    format: "HTML → plain text → vector",
    endpoint: "rulings.cbp.gov",
  },
  {
    name: "Federal Register API",
    type: "Federal API",
    color: "bg-navy-100 text-navy-700",
    data: "Tariff change notices, Section 301 updates, AD/CVD orders",
    schedule: "Daily",
    format: "JSON",
    endpoint: "federalregister.gov/api/v1",
  },
  {
    name: "Census Bureau API",
    type: "Federal API",
    color: "bg-navy-100 text-navy-700",
    data: "US trade statistics by HTS code, country, port (monthly)",
    schedule: "Monthly",
    format: "JSON",
    endpoint: "api.census.gov/data",
  },
  {
    name: "UN/LOCODE + World Port Index",
    type: "Download",
    color: "bg-indigo-100 text-indigo-700",
    data: "Port codes, coordinates, country, facility types — merged dataset",
    schedule: "Annual",
    format: "CSV",
    endpoint: "unece.org/trade + NGA.mil",
  },
  {
    name: "OFIS (FTZ Locator)",
    type: "Scrape",
    color: "bg-amber-100 text-amber-700",
    data: "All 180+ active FTZ zones, operators, subzones, location data",
    schedule: "Monthly",
    format: "HTML → structured",
    endpoint: "enforcement.trade.gov/ftz",
  },
  {
    name: "FDA openFDA",
    type: "Federal API",
    color: "bg-navy-100 text-navy-700",
    data: "Import alerts for food, drug, device shipments (cold chain focus)",
    schedule: "Daily",
    format: "JSON",
    endpoint: "api.fda.gov/import",
  },
  {
    name: "Searoutes API",
    type: "Paid API",
    color: "bg-rose-100 text-rose-700",
    data: "Maritime route distances, great-circle vs canal routing, fuel estimates",
    schedule: "On-demand",
    format: "JSON",
    endpoint: "api.searoutes.com",
  },
];

/* ───────── SECTION 5: API ENDPOINT MAP ───────── */

const apiEndpoints = [
  {
    group: "HTS & Tariff",
    color: "from-amber-500 to-orange-600",
    icon: FileText,
    endpoints: [
      { method: "GET", path: "/api/hts/search", desc: "Fuzzy search HTS codes (Typesense)", auth: false },
      { method: "POST", path: "/api/hts/classify", desc: "AI tariff classification via Claude", auth: true },
      { method: "GET", path: "/api/hts/[code]", desc: "Full HTS code details + rates by country", auth: false },
    ],
  },
  {
    group: "Calculators",
    color: "from-ocean-500 to-indigo-600",
    icon: BarChart3,
    endpoints: [
      { method: "POST", path: "/api/calculate/landed-cost", desc: "Multi-currency landed cost with duty", auth: true },
      { method: "POST", path: "/api/calculate/ftz-savings", desc: "PF/NPF savings model across withdrawal schedule", auth: true },
      { method: "POST", path: "/api/calculate/container", desc: "Container utilization — volume + weight constraint", auth: true },
      { method: "POST", path: "/api/calculate/unit-economics", desc: "Value chain analysis from FOB to shelf", auth: true },
    ],
  },
  {
    group: "Routes & Carriers",
    color: "from-emerald-500 to-teal-600",
    icon: Route,
    endpoints: [
      { method: "GET", path: "/api/routes/compare", desc: "Side-by-side carrier comparison for a port pair", auth: false },
      { method: "POST", path: "/api/routes/optimize", desc: "AI-ranked route recommendations", auth: true },
    ],
  },
  {
    group: "Compliance",
    color: "from-rose-500 to-red-600",
    icon: Shield,
    endpoints: [
      { method: "POST", path: "/api/compliance/check", desc: "Validate shipment against active regulations", auth: true },
      { method: "GET", path: "/api/compliance/alerts", desc: "Active regulatory alerts for user org", auth: true },
    ],
  },
  {
    group: "Shipments & Dashboard",
    color: "from-purple-500 to-violet-600",
    icon: Ship,
    endpoints: [
      { method: "GET/POST/PUT", path: "/api/shipments", desc: "Shipment CRUD + status updates", auth: true },
      { method: "GET", path: "/api/dashboard/kpis", desc: "Aggregated KPIs for executive dashboard", auth: true },
      { method: "POST", path: "/api/export/pdf", desc: "Generate PDF cost report via @react-pdf/renderer", auth: true },
    ],
  },
];

/* ───────── SECTION 6: DATABASE SCHEMA OVERVIEW ───────── */

const schemaGroups = [
  {
    group: "Core / Auth",
    color: "from-ocean-600 to-indigo-600",
    bg: "bg-ocean-50",
    icon: Users,
    tables: ["users", "organizations", "sessions"],
    relations: "users → organizations (many-to-one)",
  },
  {
    group: "Tariff Intelligence",
    color: "from-amber-500 to-orange-600",
    bg: "bg-amber-50",
    icon: FileText,
    tables: ["hts_codes", "hts_notes", "cbp_rulings", "tariff_changes", "country_rates"],
    relations: "hts_codes → cbp_rulings, country_rates (one-to-many)",
  },
  {
    group: "Shipment Tracking",
    color: "from-ocean-500 to-cyan-600",
    bg: "bg-cyan-50",
    icon: Ship,
    tables: ["shipments", "containers", "shipment_documents", "shipment_timeline"],
    relations: "shipments → containers, documents, timeline (one-to-many)",
  },
  {
    group: "Routes & Carriers",
    color: "from-emerald-500 to-teal-600",
    bg: "bg-emerald-50",
    icon: Route,
    tables: ["ports", "carriers", "carrier_routes", "carrier_schedules"],
    relations: "carrier_routes → ports (many-to-many via origin/dest)",
  },
  {
    group: "FTZ Management",
    color: "from-purple-500 to-violet-600",
    bg: "bg-purple-50",
    icon: Shield,
    tables: ["ftz_zones", "ftz_entries", "ftz_withdrawals"],
    relations: "ftz_entries → ftz_zones, ftz_withdrawals (cascade)",
  },
  {
    group: "Saved Calculations",
    color: "from-indigo-500 to-blue-600",
    bg: "bg-indigo-50",
    icon: BarChart3,
    tables: ["saved_calculations", "calculation_history"],
    relations: "saved_calculations → users (many-to-one)",
  },
  {
    group: "AI & Machine Learning",
    color: "from-rose-500 to-red-600",
    bg: "bg-rose-50",
    icon: Brain,
    tables: ["ai_classifications", "ai_route_recommendations", "compliance_alerts"],
    relations: "ai_classifications → users, hts_codes (feedback loop)",
  },
  {
    group: "Data Pipeline",
    color: "from-slate-500 to-gray-600",
    bg: "bg-slate-50",
    icon: RefreshCw,
    tables: ["scrape_jobs", "data_quality_scores"],
    relations: "scrape_jobs (standalone — pipeline ops only)",
  },
];

/* ───────── SECTION 7: SECURITY & COMPLIANCE ───────── */

const securityControls = [
  { control: "Authentication", detail: "JWT-based sessions (30-day maxAge, httpOnly cookies)", icon: Lock },
  { control: "Authorization", detail: "Role-based (admin / user) enforced in middleware + layout", icon: Shield },
  { control: "Rate Limiting", detail: "Redis sliding window — 100 req/min per IP on all API routes", icon: Activity },
  { control: "Input Validation", detail: "Zod schemas on all request bodies — reject before business logic", icon: Check },
  { control: "SQL Injection", detail: "Drizzle ORM parameterized queries — no raw SQL", icon: Database },
  { control: "Secret Management", detail: "All API keys in Vercel environment variables — never in source", icon: HardDrive },
  { control: "HTTPS Everywhere", detail: "Vercel enforces TLS 1.3, HSTS header on all routes", icon: Globe },
  { control: "Error Handling", detail: "Sentry for error tracking — no raw stack traces exposed to clients", icon: AlertTriangle },
];

/* ───────── SECTION 8: INFRASTRUCTURE DIAGRAM ───────── */

const infraNodes = [
  {
    label: "User Browser",
    icon: Monitor,
    color: "bg-ocean-500",
    position: "left",
    connections: ["Vercel Edge"],
  },
  {
    label: "Vercel Edge",
    icon: Zap,
    color: "bg-indigo-500",
    position: "center-top",
    connections: ["Next.js SSR", "CDN Cache"],
  },
  {
    label: "Serverless Functions",
    icon: Server,
    color: "bg-purple-500",
    position: "center",
    connections: ["Neon Postgres", "Redis", "Vercel Blob", "Claude API"],
  },
  {
    label: "Neon Postgres",
    icon: Database,
    color: "bg-emerald-500",
    position: "bottom-left",
    connections: [],
  },
  {
    label: "Redis (Upstash)",
    icon: Zap,
    color: "bg-red-500",
    position: "bottom-center",
    connections: [],
  },
  {
    label: "Typesense",
    icon: Search,
    color: "bg-violet-500",
    position: "bottom-right",
    connections: [],
  },
  {
    label: "Claude API",
    icon: Brain,
    color: "bg-orange-500",
    position: "right",
    connections: [],
  },
  {
    label: "Data Pipeline",
    icon: RefreshCw,
    color: "bg-slate-500",
    position: "far-right",
    connections: ["Neon Postgres"],
  },
];

/* ───────── PAGE COMPONENT ───────── */

export default function PlatformArchitecturePage() {
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
            <Network className="w-4 h-4 text-ocean-600" />
            <span className="text-sm font-medium text-navy-600">Platform Architecture</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 text-navy-900">
            System{" "}
            <span className="gradient-text-hero">Architecture</span>
          </h1>

          <p className="text-xl text-navy-500 max-w-2xl mx-auto mb-6 leading-relaxed">
            How ShippingSavior is built — 5-layer architecture, carrier integrations,
            data flow from raw source to UI, and the database schema that powers it all.
          </p>

          <div className="flex flex-wrap gap-4 justify-center text-sm">
            {["5 Architecture Layers", "6 Carrier Integrations", "8 Gov. Data Sources", "13 API Endpoints", "18 DB Tables"].map((tag) => (
              <span key={tag} className="bg-white/80 border border-navy-200 rounded-full px-4 py-2 text-navy-600 font-medium shadow-soft">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SECTION 1: ARCHITECTURE LAYERS ===== */}
      <section className="py-24 px-6 section-alt">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <p className="text-sm font-semibold text-ocean-600 tracking-wider uppercase mb-3">Section 1</p>
              <h2 className="text-4xl md:text-5xl font-bold text-navy-900 mb-5">
                Layered <span className="gradient-text">Architecture</span>
              </h2>
              <p className="text-lg text-navy-500 max-w-2xl mx-auto">
                Five discrete layers with clear separation of concerns.
                Each layer has a single responsibility and communicates downward only.
              </p>
            </div>
          </ScrollReveal>

          <div className="space-y-6">
            {architectureLayers.map((layer, i) => (
              <ScrollReveal key={layer.label} delay={i * 80}>
                <div className={`rounded-2xl border ${layer.border} ${layer.bg} p-6`}>
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${layer.color} flex items-center justify-center flex-shrink-0 shadow-md`}>
                      <layer.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-3 flex-wrap">
                        <h3 className="text-lg font-bold text-navy-900">{layer.label}</h3>
                        <span className={`text-xs font-bold uppercase tracking-wide px-2.5 py-1 rounded-full ${layer.badge}`}>
                          Layer {i + 1}
                        </span>
                      </div>
                      <ul className="space-y-1.5 mb-4">
                        {layer.items.map((item) => (
                          <li key={item} className="flex items-start gap-2 text-sm text-navy-600">
                            <Check className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                      <p className="text-xs font-medium text-navy-400 bg-white/60 rounded-lg px-3 py-2 border border-navy-100 inline-block">
                        {layer.note}
                      </p>
                    </div>
                  </div>
                </div>
                {i < architectureLayers.length - 1 && (
                  <div className="flex justify-center my-2">
                    <ArrowDown className="w-5 h-5 text-navy-300" />
                  </div>
                )}
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SECTION 2: DATA FLOW ===== */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <p className="text-sm font-semibold text-ocean-600 tracking-wider uppercase mb-3">Section 2</p>
              <h2 className="text-4xl md:text-5xl font-bold text-navy-900 mb-5">
                Request <span className="gradient-text">Data Flow</span>
              </h2>
              <p className="text-lg text-navy-500 max-w-2xl mx-auto">
                Every user action follows this path — from browser to Vercel to Postgres and back.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal>
            <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4">
              {dataFlowSteps.map((step, i) => (
                <div key={step.step} className="flex md:flex-col items-center gap-3 md:gap-2">
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className={`w-12 h-12 rounded-xl ${step.color} flex items-center justify-center shadow-md`}>
                      <step.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-xs font-bold text-navy-900 mt-2 text-center leading-tight">{step.label}</div>
                  </div>
                  <div className="flex-1 md:flex-none">
                    <p className="text-xs text-navy-500 text-center leading-relaxed hidden md:block">{step.desc}</p>
                  </div>
                  {step.arrow && i < dataFlowSteps.length - 1 && (
                    <ArrowRight className="w-5 h-5 text-navy-300 flex-shrink-0 hidden md:block absolute" style={{ display: "none" }} />
                  )}
                </div>
              ))}
            </div>

            {/* Flow connectors */}
            <div className="hidden lg:flex items-stretch gap-0 mt-8 bg-navy-50 rounded-2xl p-6 border border-navy-100">
              {dataFlowSteps.map((step, i) => (
                <div key={step.step} className="flex items-center flex-1">
                  <div className="flex-1 text-center">
                    <div className={`w-10 h-10 rounded-lg ${step.color} flex items-center justify-center mx-auto mb-2 shadow-sm`}>
                      <step.icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-xs font-bold text-navy-800 mb-1">{step.label}</div>
                    <div className="text-xs text-navy-400 leading-tight px-1">{step.desc}</div>
                  </div>
                  {step.arrow && (
                    <ArrowRight className="w-5 h-5 text-navy-300 flex-shrink-0 mx-1" />
                  )}
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ===== SECTION 3: CARRIER INTEGRATIONS ===== */}
      <section className="py-24 px-6 section-alt">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <p className="text-sm font-semibold text-ocean-600 tracking-wider uppercase mb-3">Section 3</p>
              <h2 className="text-4xl md:text-5xl font-bold text-navy-900 mb-5">
                Carrier <span className="gradient-text">Integrations</span>
              </h2>
              <p className="text-lg text-navy-500 max-w-2xl mx-auto">
                6 carrier and tracking integrations — mix of REST APIs, paid data services,
                and Playwright-driven scraping where no API exists.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {carrierIntegrations.map((carrier, i) => (
              <ScrollReveal key={carrier.name} delay={i * 60}>
                <div className="bg-white rounded-2xl border border-navy-100 shadow-soft hover:shadow-card hover:-translate-y-1 transition-all duration-300 p-6 group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-ocean-500 to-indigo-600 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                        <carrier.icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="font-bold text-navy-900 text-sm">{carrier.name}</div>
                        <div className="text-xs text-navy-400">{carrier.method}</div>
                      </div>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${carrier.badgeColor}`}>
                      {carrier.badge}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    {carrier.endpoints.map((ep) => (
                      <code key={ep} className="block text-xs bg-navy-50 text-navy-700 px-3 py-1.5 rounded-lg font-mono border border-navy-100">
                        {ep}
                      </code>
                    ))}
                  </div>

                  <p className="text-xs text-navy-500 leading-relaxed mb-3">{carrier.data}</p>

                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-3 h-3 text-navy-400" />
                    <span className="text-xs text-navy-400 font-medium">Refresh: {carrier.refresh}</span>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SECTION 4: GOVERNMENT DATA SOURCES ===== */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <p className="text-sm font-semibold text-ocean-600 tracking-wider uppercase mb-3">Section 4</p>
              <h2 className="text-4xl md:text-5xl font-bold text-navy-900 mb-5">
                Government & <span className="gradient-text">Trade Data</span>
              </h2>
              <p className="text-lg text-navy-500 max-w-2xl mx-auto">
                8 official data sources providing the tariff, port, trade, and regulatory
                data that powers classifications and compliance checks.
              </p>
            </div>
          </ScrollReveal>

          <div className="overflow-x-auto rounded-2xl border border-navy-100 shadow-soft">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-navy-50 border-b border-navy-100">
                  <th className="text-left px-5 py-4 text-xs font-bold text-navy-600 uppercase tracking-wide">Source</th>
                  <th className="text-left px-5 py-4 text-xs font-bold text-navy-600 uppercase tracking-wide">Type</th>
                  <th className="text-left px-5 py-4 text-xs font-bold text-navy-600 uppercase tracking-wide hidden md:table-cell">Data Provided</th>
                  <th className="text-left px-5 py-4 text-xs font-bold text-navy-600 uppercase tracking-wide">Format</th>
                  <th className="text-left px-5 py-4 text-xs font-bold text-navy-600 uppercase tracking-wide">Refresh</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-100">
                {govDataSources.map((src) => (
                  <tr key={src.name} className="bg-white hover:bg-navy-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-navy-900 text-sm">{src.name}</div>
                      <div className="text-xs text-navy-400 font-mono mt-0.5 hidden lg:block">{src.endpoint}</div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${src.color}`}>{src.type}</span>
                    </td>
                    <td className="px-5 py-4 text-xs text-navy-500 hidden md:table-cell max-w-xs">{src.data}</td>
                    <td className="px-5 py-4 text-xs text-navy-600 font-mono">{src.format}</td>
                    <td className="px-5 py-4 text-xs text-navy-600 font-medium">{src.schedule}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ===== SECTION 5: API ENDPOINT MAP ===== */}
      <section className="py-24 px-6 section-alt">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <p className="text-sm font-semibold text-ocean-600 tracking-wider uppercase mb-3">Section 5</p>
              <h2 className="text-4xl md:text-5xl font-bold text-navy-900 mb-5">
                API <span className="gradient-text">Endpoint Map</span>
              </h2>
              <p className="text-lg text-navy-500 max-w-2xl mx-auto">
                13 internal API routes organized by domain. All protected endpoints
                require a valid JWT session token in the request cookie.
              </p>
            </div>
          </ScrollReveal>

          <div className="space-y-6">
            {apiEndpoints.map((group, i) => (
              <ScrollReveal key={group.group} delay={i * 60}>
                <div className="bg-white rounded-2xl border border-navy-100 shadow-soft p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${group.color} flex items-center justify-center shadow-md`}>
                      <group.icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-navy-900">{group.group}</h3>
                  </div>
                  <div className="space-y-3">
                    {group.endpoints.map((ep) => (
                      <div key={ep.path} className="flex items-start gap-3 p-3 rounded-xl bg-navy-50 border border-navy-100">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-lg flex-shrink-0 font-mono ${
                          ep.method.includes("GET")
                            ? "bg-emerald-100 text-emerald-700"
                            : ep.method.includes("POST")
                            ? "bg-ocean-100 text-ocean-700"
                            : "bg-amber-100 text-amber-700"
                        }`}>
                          {ep.method}
                        </span>
                        <code className="text-sm font-mono text-navy-700 flex-shrink-0 pt-0.5">{ep.path}</code>
                        <span className="text-xs text-navy-500 flex-1 pt-0.5 hidden sm:block">{ep.desc}</span>
                        {ep.auth ? (
                          <Lock className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" title="Auth required" />
                        ) : (
                          <Globe className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" title="Public" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal delay={100}>
            <div className="mt-6 flex gap-6 text-xs text-navy-500">
              <div className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-500" />
                <span>Auth required (JWT session)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-emerald-400" />
                <span>Public endpoint</span>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ===== SECTION 6: DATABASE SCHEMA ===== */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <p className="text-sm font-semibold text-ocean-600 tracking-wider uppercase mb-3">Section 6</p>
              <h2 className="text-4xl md:text-5xl font-bold text-navy-900 mb-5">
                Database <span className="gradient-text">Schema</span>
              </h2>
              <p className="text-lg text-navy-500 max-w-2xl mx-auto">
                Neon PostgreSQL with 18+ tables across 8 domain groups. Drizzle ORM
                for type-safe queries and pgvector for AI embedding search.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {schemaGroups.map((group, i) => (
              <ScrollReveal key={group.group} delay={i * 50}>
                <div className={`rounded-2xl border border-navy-100 ${group.bg} p-5 hover:shadow-card transition-all duration-300 hover:-translate-y-0.5`}>
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${group.color} flex items-center justify-center shadow-md mb-4`}>
                    <group.icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-bold text-navy-900 text-sm mb-3">{group.group}</h3>
                  <div className="space-y-1.5 mb-4">
                    {group.tables.map((table) => (
                      <code key={table} className="block text-xs bg-white/80 text-navy-700 px-2.5 py-1 rounded-lg border border-navy-100 font-mono">
                        {table}
                      </code>
                    ))}
                  </div>
                  <p className="text-xs text-navy-400 leading-relaxed">{group.relations}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SECTION 7: SECURITY ===== */}
      <section className="py-24 px-6 section-alt">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <p className="text-sm font-semibold text-ocean-600 tracking-wider uppercase mb-3">Section 7</p>
              <h2 className="text-4xl md:text-5xl font-bold text-navy-900 mb-5">
                Security <span className="gradient-text">Controls</span>
              </h2>
              <p className="text-lg text-navy-500 max-w-2xl mx-auto">
                Defense in depth — security applied at every layer of the stack,
                not bolted on at the end.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {securityControls.map((item, i) => (
              <ScrollReveal key={item.control} delay={i * 50}>
                <div className="bg-white rounded-2xl border border-navy-100 shadow-soft p-5 hover:shadow-card hover:-translate-y-0.5 transition-all duration-300 group">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-ocean-500 to-indigo-600 flex items-center justify-center shadow-md mb-4 group-hover:scale-110 transition-transform">
                    <item.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="font-bold text-navy-900 text-sm mb-2">{item.control}</div>
                  <p className="text-xs text-navy-500 leading-relaxed">{item.detail}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SECTION 8: INFRASTRUCTURE MAP ===== */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <p className="text-sm font-semibold text-ocean-600 tracking-wider uppercase mb-3">Section 8</p>
              <h2 className="text-4xl md:text-5xl font-bold text-navy-900 mb-5">
                Infrastructure <span className="gradient-text">Map</span>
              </h2>
              <p className="text-lg text-navy-500 max-w-2xl mx-auto">
                All services and how they connect — Vercel at the center, external APIs
                on the edges, data pipeline running independently in the background.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal>
            <div className="bg-navy-900 rounded-3xl p-8 md:p-12 border border-navy-700 shadow-2xl">
              {/* Central Vercel node */}
              <div className="flex flex-col items-center gap-6">

                {/* Top row: Browser → Vercel Edge */}
                <div className="flex items-center gap-6 w-full justify-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-14 h-14 rounded-2xl bg-ocean-500 flex items-center justify-center shadow-lg">
                      <Monitor className="w-7 h-7 text-white" />
                    </div>
                    <span className="text-xs font-medium text-navy-300 text-center">User Browser</span>
                  </div>
                  <div className="flex items-center gap-1 text-navy-500">
                    <div className="w-16 h-px bg-navy-600" />
                    <ArrowRight className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-500 flex items-center justify-center shadow-lg ring-2 ring-indigo-400/40">
                      <Zap className="w-7 h-7 text-white" />
                    </div>
                    <span className="text-xs font-medium text-indigo-300 text-center">Vercel Edge<br/>(CDN + SSR)</span>
                  </div>
                  <div className="flex items-center gap-1 text-navy-500">
                    <div className="w-16 h-px bg-navy-600" />
                    <ArrowRight className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-14 h-14 rounded-2xl bg-purple-500 flex items-center justify-center shadow-lg ring-2 ring-purple-400/40">
                      <Server className="w-7 h-7 text-white" />
                    </div>
                    <span className="text-xs font-medium text-purple-300 text-center">Serverless<br/>Functions</span>
                  </div>
                </div>

                {/* Arrow down */}
                <ArrowDown className="w-5 h-5 text-navy-500" />

                {/* Bottom row: data stores */}
                <div className="flex flex-wrap items-start justify-center gap-8 w-full">
                  {[
                    { label: "Neon Postgres", sub: "+ pgvector", icon: Database, color: "bg-emerald-500" },
                    { label: "Redis (Upstash)", sub: "Cache + Rate Limit", icon: Zap, color: "bg-red-500" },
                    { label: "Typesense", sub: "HTS Search Index", icon: Search, color: "bg-violet-500" },
                    { label: "Vercel Blob", sub: "PDF Storage", icon: Cloud, color: "bg-sky-500" },
                    { label: "Claude API", sub: "AI Classification", icon: Brain, color: "bg-orange-500" },
                  ].map((node) => (
                    <div key={node.label} className="flex flex-col items-center gap-2">
                      <div className={`w-12 h-12 rounded-xl ${node.color} flex items-center justify-center shadow-md`}>
                        <node.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-center">
                        <div className="text-xs font-semibold text-white">{node.label}</div>
                        <div className="text-xs text-navy-400">{node.sub}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Divider */}
                <div className="w-full border-t border-navy-700 pt-6 mt-2">
                  <div className="flex items-center gap-4 justify-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-10 h-10 rounded-xl bg-slate-600 flex items-center justify-center">
                        <RefreshCw className="w-5 h-5 text-slate-200" />
                      </div>
                      <span className="text-xs font-medium text-navy-400">Inngest Pipeline</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-navy-600" />
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-10 h-10 rounded-xl bg-slate-600 flex items-center justify-center">
                        <Globe className="w-5 h-5 text-slate-200" />
                      </div>
                      <span className="text-xs font-medium text-navy-400">External Sources</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-navy-600" />
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center">
                        <Database className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-xs font-medium text-navy-400">Neon Postgres</span>
                    </div>
                  </div>
                  <p className="text-center text-xs text-navy-500 mt-3">
                    Background pipeline — runs independently, never blocks user requests
                  </p>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ===== SECTION 9: SCALABILITY NOTES ===== */}
      <section className="py-24 px-6 section-alt">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <p className="text-sm font-semibold text-ocean-600 tracking-wider uppercase mb-3">Section 9</p>
              <h2 className="text-4xl md:text-5xl font-bold text-navy-900 mb-5">
                Scalability <span className="gradient-text">Design</span>
              </h2>
              <p className="text-lg text-navy-500 max-w-2xl mx-auto">
                Built to scale from 1 user to enterprise without architectural rewrites.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: "Stateless Functions",
                icon: Server,
                color: "from-ocean-500 to-indigo-600",
                points: [
                  "Vercel serverless — auto-scales to traffic",
                  "No server state — every request is independent",
                  "Cold start < 200ms on Vercel Edge",
                  "Request parallelism unlimited (Vercel plans)",
                ],
              },
              {
                title: "Database Scaling",
                icon: Database,
                color: "from-emerald-500 to-teal-600",
                points: [
                  "Neon auto-scales compute on demand",
                  "Redis caches hot queries (tariff rates, routes)",
                  "Read replica for analytics queries",
                  "pgvector HNSW index for fast embedding search",
                ],
              },
              {
                title: "Multi-Tenancy",
                icon: Building2,
                color: "from-purple-500 to-violet-600",
                points: [
                  "org_id on every resource row — full isolation",
                  "Row-level security in Postgres",
                  "Org-scoped API keys and rate limits",
                  "Plan-gated features via org.plan field",
                ],
              },
            ].map((card, i) => (
              <ScrollReveal key={card.title} delay={i * 80}>
                <div className="bg-white rounded-2xl border border-navy-100 shadow-soft p-6 hover:shadow-card transition-all duration-300">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center shadow-md mb-5`}>
                    <card.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-navy-900 text-lg mb-4">{card.title}</h3>
                  <ul className="space-y-2">
                    {card.points.map((pt) => (
                      <li key={pt} className="flex items-start gap-2 text-sm text-navy-600">
                        <Check className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                        {pt}
                      </li>
                    ))}
                  </ul>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <ScrollReveal>
            <h2 className="text-4xl font-bold text-navy-900 mb-5">
              Ready to build this <span className="gradient-text">together?</span>
            </h2>
            <p className="text-lg text-navy-500 mb-10">
              Full technical specification, database schema, carrier integrations,
              and a clear roadmap — the architecture is ready to ship.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <a
                href="/tech-spec"
                className="inline-flex items-center gap-2 bg-white border-2 border-navy-200 text-navy-700 px-8 py-4 rounded-xl font-semibold hover:border-ocean-400 hover:text-ocean-600 transition-colors"
              >
                <Code2 className="w-5 h-5" />
                Tech Stack Details
              </a>
              <a
                href="/agreement"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-ocean-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold hover:opacity-90 transition-opacity shadow-md hover:shadow-lg"
              >
                View Proposal
                <ArrowRight className="w-5 h-5" />
              </a>
            </div>
          </ScrollReveal>
        </div>
      </section>

    </main>
  );
}

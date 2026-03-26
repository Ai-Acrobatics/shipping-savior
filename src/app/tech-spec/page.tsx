"use client";

import Header from "@/components/Header";
import ScrollReveal from "@/components/ScrollReveal";
import {
  Cpu, Globe, Database, Zap, BarChart3, Ship,
  Layers, Lock, ArrowRight, Check, ChevronRight,
  Brain, Route, Shield, FileCheck, Bot, Radar,
  Server, Cloud, Eye, Workflow, Box, Search,
  Table, FormInput, Link2, RefreshCw, AlertTriangle,
  Building2, Landmark, TrendingUp, Users, DollarSign,
  FileText, Monitor, HardDrive, Gauge, Cable,
  Container, Anchor, MapPin, BarChart2, Activity,
} from "lucide-react";

/* ───────── SECTION 1: TECHNOLOGY STACK ───────── */

const frontendStack = [
  { name: "Next.js 14", detail: "Full-stack React framework (App Router)", icon: Layers, color: "from-ocean-600 to-indigo-600" },
  { name: "TypeScript 5", detail: "Type safety for financial calculations", icon: Cpu, color: "from-blue-500 to-cyan-600" },
  { name: "Tailwind CSS 3.4", detail: "Utility-first styling", icon: Monitor, color: "from-cyan-500 to-teal-600" },
  { name: "Framer Motion", detail: "Animations and parallax", icon: Activity, color: "from-purple-500 to-pink-600" },
  { name: "react-map-gl + MapLibre + deck.gl", detail: "Free WebGL mapping", icon: Globe, color: "from-emerald-500 to-teal-600" },
  { name: "Recharts + @tremor/react", detail: "Dashboard charts", icon: BarChart3, color: "from-indigo-500 to-violet-600" },
  { name: "@tanstack/react-table", detail: "Data tables (HTS lookup, shipments)", icon: Table, color: "from-orange-500 to-amber-600" },
  { name: "react-hook-form + zod", detail: "Form handling and validation", icon: FormInput, color: "from-rose-500 to-red-600" },
  { name: "Zustand", detail: "State management", icon: Box, color: "from-yellow-500 to-orange-600" },
  { name: "nuqs", detail: "URL state sync (shareable calculator links)", icon: Link2, color: "from-sky-500 to-blue-600" },
];

const backendStack = [
  { name: "Next.js API Routes", detail: "Serverless endpoints", icon: Server, color: "from-ocean-600 to-indigo-600" },
  { name: "Drizzle ORM", detail: "Type-safe database queries", icon: Database, color: "from-emerald-500 to-green-600" },
  { name: "@react-pdf/renderer", detail: "PDF document generation", icon: FileText, color: "from-red-500 to-rose-600" },
  { name: "decimal.js", detail: "Precise financial arithmetic", icon: DollarSign, color: "from-amber-500 to-yellow-600" },
  { name: "currency.js", detail: "Multi-currency formatting", icon: DollarSign, color: "from-teal-500 to-cyan-600" },
  { name: "Fuse.js / Typesense", detail: "Fuzzy search for HTS codes", icon: Search, color: "from-violet-500 to-purple-600" },
];

const aiStack = [
  { name: "Claude API (Anthropic)", detail: "Tariff classification, compliance analysis", icon: Brain, color: "from-orange-500 to-red-600" },
  { name: "pgvector", detail: "Vector embeddings for semantic search on CBP rulings", icon: Database, color: "from-indigo-500 to-blue-600" },
  { name: "RAG Pipeline", detail: "Retrieval augmented generation over trade rulings", icon: Workflow, color: "from-purple-500 to-violet-600" },
];

const pipelineStack = [
  { name: "Crawlee + Playwright", detail: "Web scraping at scale", icon: Globe, color: "from-green-500 to-emerald-600" },
  { name: "Inngest", detail: "Job orchestration and scheduling", icon: Workflow, color: "from-blue-500 to-indigo-600" },
  { name: "Node-cron", detail: "Periodic data refresh", icon: RefreshCw, color: "from-slate-500 to-gray-600" },
  { name: "Cheerio", detail: "HTML parsing for simple pages", icon: FileText, color: "from-yellow-500 to-amber-600" },
];

const infraStack = [
  { name: "Vercel", detail: "Frontend hosting and serverless functions", icon: Zap, color: "from-ocean-600 to-indigo-600" },
  { name: "Neon PostgreSQL", detail: "Serverless Postgres with pgvector", icon: Database, color: "from-emerald-500 to-teal-600" },
  { name: "Typesense Cloud", detail: "Search engine for HTS codes", icon: Search, color: "from-violet-500 to-purple-600" },
  { name: "Redis (Upstash)", detail: "Caching and rate limiting", icon: Zap, color: "from-red-500 to-rose-600" },
  { name: "Vercel Blob", detail: "PDF and document storage", icon: Cloud, color: "from-sky-500 to-blue-600" },
];

const monitoringStack = [
  { name: "Vercel Analytics", detail: "Core Web Vitals", icon: Gauge, color: "from-ocean-500 to-blue-600" },
  { name: "Sentry", detail: "Error tracking", icon: AlertTriangle, color: "from-red-500 to-orange-600" },
  { name: "Inngest Dashboard", detail: "Job monitoring", icon: Eye, color: "from-indigo-500 to-purple-600" },
  { name: "Custom Dashboards", detail: "Data freshness, AI accuracy", icon: BarChart2, color: "from-emerald-500 to-teal-600" },
];

function StackSection({ title, subtitle, items, badgeColor }: {
  title: string;
  subtitle: string;
  items: typeof frontendStack;
  badgeColor: string;
}) {
  return (
    <div className="mb-12">
      <div className="flex items-center gap-3 mb-6">
        <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full ${badgeColor}`}>
          {title}
        </span>
        <span className="text-sm text-navy-400">{subtitle}</span>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((tech) => (
          <div
            key={tech.name}
            className="bg-white rounded-xl p-5 border border-navy-100 shadow-soft hover:shadow-card hover:-translate-y-0.5 transition-all duration-300 group"
          >
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${tech.color} flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 transition-transform`}>
                <tech.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-sm font-bold text-navy-900">{tech.name}</div>
                <div className="text-xs text-navy-400 mt-0.5">{tech.detail}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ───────── SECTION 2: INTEGRATIONS ───────── */

const govApis = [
  { name: "USITC HTS API", data: "Tariff data (JSON, quarterly updates)", icon: FileText },
  { name: "CBP CROSS", data: "Classification rulings (scrape, 220K+ rulings)", icon: Search },
  { name: "Federal Register API", data: "Tariff change monitoring (daily)", icon: AlertTriangle },
  { name: "Census Bureau API", data: "Trade statistics (monthly)", icon: BarChart3 },
  { name: "OFIS", data: "FTZ locations (scrape, monthly)", icon: MapPin },
  { name: "FDA openFDA API", data: "Import alerts for cold chain (daily)", icon: Shield },
  { name: "UN/LOCODE", data: "Port codes (download, annual)", icon: Anchor },
  { name: "World Port Index", data: "Port details (download, annual)", icon: Globe },
];

const carrierApis = [
  { name: "Maersk Developer Portal", data: "Schedules, tracking", icon: Ship },
  { name: "CMA CGM API Portal", data: "Schedules, tracking", icon: Ship },
  { name: "MSC", data: "Schedules (scrape)", icon: Ship },
  { name: "Hapag-Lloyd", data: "Schedules (API)", icon: Ship },
];

const paidApis = [
  { name: "Terminal49", data: "Container tracking (free tier: 100 containers)", price: "Free tier" },
  { name: "MarineTraffic / Datalastic", data: "AIS vessel positions", price: "$199+/mo" },
  { name: "Searoutes API", data: "Maritime route distances", price: "Tiered" },
  { name: "ImportGenius", data: "BOL/competitor data", price: "$99-500/mo" },
];

const internalApis = [
  { endpoint: "/api/hts/search", desc: "HTS code fuzzy search" },
  { endpoint: "/api/hts/classify", desc: "AI tariff classification" },
  { endpoint: "/api/calculate/landed-cost", desc: "Landed cost calculation" },
  { endpoint: "/api/calculate/ftz-savings", desc: "FTZ savings modeling" },
  { endpoint: "/api/calculate/container", desc: "Container utilization" },
  { endpoint: "/api/calculate/unit-economics", desc: "Value chain analysis" },
  { endpoint: "/api/routes/compare", desc: "Carrier route comparison" },
  { endpoint: "/api/routes/optimize", desc: "AI route recommendation" },
  { endpoint: "/api/compliance/check", desc: "Compliance validation" },
  { endpoint: "/api/compliance/alerts", desc: "Regulatory change alerts" },
  { endpoint: "/api/export/pdf", desc: "PDF report generation" },
  { endpoint: "/api/shipments", desc: "Shipment CRUD" },
  { endpoint: "/api/dashboard/kpis", desc: "Dashboard metrics" },
];

/* ───────── SECTION 3: DATABASE ───────── */

const dbSchema = [
  {
    group: "Core",
    color: "from-ocean-600 to-indigo-600",
    icon: Users,
    tables: [
      { name: "users", cols: "id, email, name, role, org_id, created_at" },
      { name: "organizations", cols: "id, name, plan, stripe_id, created_at" },
    ],
  },
  {
    group: "Tariff",
    color: "from-amber-500 to-orange-600",
    icon: FileText,
    tables: [
      { name: "hts_codes", cols: "id, code (text), description, general_rate, special_rates (jsonb), unit_qty, chapter, heading, subheading, last_updated" },
      { name: "hts_notes", cols: "id, hts_code_id, note_type, content" },
      { name: "cbp_rulings", cols: "id, ruling_number, hts_code, product_description, ruling_text, ruling_date, embedding (vector)" },
      { name: "tariff_changes", cols: "id, hts_code, old_rate, new_rate, effective_date, source (federal_register_id)" },
      { name: "country_rates", cols: "id, hts_code_id, country_code, duty_rate, program (GSP, USMCA, etc.)" },
    ],
  },
  {
    group: "Shipping",
    color: "from-ocean-500 to-cyan-600",
    icon: Ship,
    tables: [
      { name: "shipments", cols: "id, org_id, reference, origin_port, dest_port, carrier, status, cargo_type, container_count, eta, value, created_at" },
      { name: "containers", cols: "id, shipment_id, number, type (20ft/40ft/40HC/reefer), weight, volume, seal_number" },
      { name: "shipment_documents", cols: "id, shipment_id, doc_type (BOL/ISF/CI/PL), file_url, status, created_at" },
      { name: "shipment_timeline", cols: "id, shipment_id, event_type, location, timestamp, details" },
    ],
  },
  {
    group: "Routes",
    color: "from-emerald-500 to-teal-600",
    icon: Route,
    tables: [
      { name: "ports", cols: "id, locode, name, country, lat, lng, type, facilities (jsonb)" },
      { name: "carriers", cols: "id, name, code, logo_url, website, api_available" },
      { name: "carrier_routes", cols: "id, carrier_id, origin_port_id, dest_port_id, transit_days, frequency, transshipment_ports (jsonb), backhaul_available" },
      { name: "carrier_schedules", cols: "id, route_id, vessel_name, departure_date, arrival_date, status" },
    ],
  },
  {
    group: "FTZ",
    color: "from-purple-500 to-violet-600",
    icon: Shield,
    tables: [
      { name: "ftz_zones", cols: "id, zone_number, name, location, operator, contact, lat, lng, subzones (jsonb)" },
      { name: "ftz_entries", cols: "id, org_id, ftz_zone_id, entry_date, locked_duty_rate, status_election (PF/NPF), total_units, unit_value" },
      { name: "ftz_withdrawals", cols: "id, entry_id, withdrawal_date, units, duty_paid, cumulative_savings" },
    ],
  },
  {
    group: "Calculator",
    color: "from-indigo-500 to-blue-600",
    icon: BarChart3,
    tables: [
      { name: "saved_calculations", cols: "id, user_id, calc_type, inputs (jsonb), results (jsonb), name, created_at" },
      { name: "calculation_history", cols: "id, user_id, calc_type, inputs (jsonb), results (jsonb), created_at" },
    ],
  },
  {
    group: "AI",
    color: "from-rose-500 to-red-600",
    icon: Brain,
    tables: [
      { name: "ai_classifications", cols: "id, user_id, product_description, predicted_hts, confidence, human_override, correct_hts, created_at" },
      { name: "ai_route_recommendations", cols: "id, user_id, origin, destination, recommended_route_id, alternatives (jsonb), accepted, created_at" },
      { name: "compliance_alerts", cols: "id, org_id, alert_type, severity, message, related_shipment_id, resolved, created_at" },
    ],
  },
  {
    group: "Data Pipeline",
    color: "from-slate-500 to-gray-600",
    icon: RefreshCw,
    tables: [
      { name: "scrape_jobs", cols: "id, source_name, last_run, status, records_processed, errors, next_run" },
      { name: "data_quality_scores", cols: "id, source_name, completeness, accuracy, freshness, score_date" },
    ],
  },
];

/* ───────── SECTION 4: DATA PIPELINE ───────── */

const pipelineSteps = [
  { step: "Raw Data", icon: Cloud, color: "bg-navy-500", desc: "Ingest from APIs, scrapers, downloads" },
  { step: "Validation", icon: Check, color: "bg-red-500", desc: "Schema checks, format validation" },
  { step: "Normalization", icon: RefreshCw, color: "bg-amber-500", desc: "Standardize codes, formats, units" },
  { step: "Deduplication", icon: Layers, color: "bg-orange-500", desc: "Merge duplicates, resolve conflicts" },
  { step: "Enrichment", icon: Brain, color: "bg-purple-500", desc: "Add rates, flags, embeddings" },
  { step: "Indexing", icon: Search, color: "bg-indigo-500", desc: "Typesense + pgvector indexing" },
  { step: "Ready", icon: Zap, color: "bg-emerald-500", desc: "Queryable, searchable, up-to-date" },
];

const dataSourcePipelines = [
  {
    source: "HTS Codes",
    format: "JSON / CSV",
    steps: [
      "Normalize: \"6402.99.40\" to \"6402994000\" (10 digits, no dots)",
      "Validate: chapter (01-99), heading, subheading ranges",
      "Enrich: add country-specific rates, AD/CVD flags",
      "Index: Typesense for fuzzy search, pgvector for semantic",
    ],
    destination: "hts_codes + Typesense",
    schedule: "Quarterly",
  },
  {
    source: "Port Data",
    format: "CSV / XML",
    steps: [
      "Merge UN/LOCODE + World Port Index on code",
      "Geocode any ports missing coordinates",
      "Normalize country names to ISO codes",
      "Deduplicate (some ports have multiple entries)",
    ],
    destination: "ports table",
    schedule: "Annual",
  },
  {
    source: "Carrier Schedules",
    format: "JSON / HTML",
    steps: [
      "Normalize port codes to UN/LOCODE standard",
      "Parse transit times to integers (days)",
      "Identify transshipment points",
      "Flag direct vs connecting routes",
    ],
    destination: "carrier_routes + carrier_schedules",
    schedule: "Weekly",
  },
  {
    source: "CBP Rulings",
    format: "HTML (scrape)",
    steps: [
      "Extract ruling number, HTS code, description, date",
      "Clean HTML to plain text for ruling body",
      "Generate vector embeddings via Claude",
      "Store for RAG semantic search",
    ],
    destination: "cbp_rulings (with vector)",
    schedule: "Daily",
  },
];

/* ───────── SECTION 5: MUNICIPAL EXPANSION ───────── */

const municipalUseCases = [
  { title: "Port Authorities", desc: "Track vessel arrivals, berth utilization, cargo throughput, fee collection", icon: Anchor, color: "from-ocean-600 to-indigo-600" },
  { title: "Customs & Border Protection", desc: "HTS classification validation, compliance monitoring, risk scoring", icon: Shield, color: "from-red-500 to-rose-600" },
  { title: "City/County Economic Development", desc: "Track FTZ utilization, measure trade impact on local economy", icon: Building2, color: "from-emerald-500 to-teal-600" },
  { title: "State Trade Offices", desc: "Export promotion, trade lane analysis, business matchmaking", icon: Globe, color: "from-purple-500 to-violet-600" },
  { title: "Municipal Bonded Warehouses", desc: "Inventory management, duty payment tracking, withdrawal scheduling", icon: Container, color: "from-amber-500 to-orange-600" },
];

const municipalFeatures = [
  "Multi-tenant SaaS with government-specific roles",
  "CJIS/FedRAMP compliance considerations",
  "Open data integration (public port statistics, trade data)",
  "Reporting for government stakeholders (economic impact, job creation)",
  "Integration with CBP ACE (Automated Commercial Environment)",
  "Public-facing dashboards for transparency",
];

const expansionTimeline = [
  { phase: "Current", label: "Private Sector", desc: "Freight brokers, importers, 3PLs", icon: Ship, color: "bg-ocean-500" },
  { phase: "Next", label: "Municipal", desc: "Port authorities, city/county govt", icon: Landmark, color: "bg-indigo-500" },
  { phase: "Future", label: "Federal", desc: "CBP, Commerce Dept, trade offices", icon: Building2, color: "bg-purple-500" },
];

/* ───────── PAGE COMPONENT ───────── */

export default function TechSpecPage() {
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
            <Cpu className="w-4 h-4 text-ocean-600" />
            <span className="text-sm font-medium text-navy-600">Technical Specification</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 text-navy-900">
            Under the{" "}
            <span className="gradient-text-hero">Hood</span>
          </h1>

          <p className="text-xl text-navy-500 max-w-2xl mx-auto mb-6 leading-relaxed">
            Complete technical architecture, data pipelines, database schema,
            and integration map powering the ShippingSavior platform.
          </p>

          <div className="flex flex-wrap gap-4 justify-center text-sm">
            {["30+ Libraries", "13 API Endpoints", "8 Database Groups", "7-Stage Pipeline"].map((tag) => (
              <span key={tag} className="bg-white/80 border border-navy-200 rounded-full px-4 py-2 text-navy-600 font-medium shadow-soft">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SECTION 1: TECHNOLOGY STACK ===== */}
      <section className="py-24 px-6 section-alt">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <p className="text-sm font-semibold text-ocean-600 tracking-wider uppercase mb-3">Section 1</p>
              <h2 className="text-4xl md:text-5xl font-bold text-navy-900 mb-5">
                Technology <span className="gradient-text">Stack</span>
              </h2>
              <p className="text-lg text-navy-500 max-w-2xl mx-auto">
                Every library, framework, and service chosen for a reason.
                No bloat, no unnecessary dependencies.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal>
            <StackSection
              title="Frontend"
              subtitle="10 libraries for UI, mapping, and interactivity"
              items={frontendStack}
              badgeColor="bg-ocean-100 text-ocean-700 border border-ocean-200"
            />
          </ScrollReveal>

          <ScrollReveal delay={100}>
            <StackSection
              title="Backend"
              subtitle="6 libraries for APIs, PDFs, and precision math"
              items={backendStack}
              badgeColor="bg-emerald-100 text-emerald-700 border border-emerald-200"
            />
          </ScrollReveal>

          <ScrollReveal delay={150}>
            <StackSection
              title="AI / ML"
              subtitle="3 components for intelligent classification"
              items={aiStack}
              badgeColor="bg-rose-100 text-rose-700 border border-rose-200"
            />
          </ScrollReveal>

          <ScrollReveal delay={100}>
            <StackSection
              title="Data Pipeline"
              subtitle="4 tools for scraping, parsing, and scheduling"
              items={pipelineStack}
              badgeColor="bg-amber-100 text-amber-700 border border-amber-200"
            />
          </ScrollReveal>

          <ScrollReveal delay={150}>
            <StackSection
              title="Infrastructure"
              subtitle="5 cloud services for hosting, storage, and search"
              items={infraStack}
              badgeColor="bg-indigo-100 text-indigo-700 border border-indigo-200"
            />
          </ScrollReveal>

          <ScrollReveal delay={100}>
            <StackSection
              title="Monitoring"
              subtitle="4 tools for observability and quality"
              items={monitoringStack}
              badgeColor="bg-purple-100 text-purple-700 border border-purple-200"
            />
          </ScrollReveal>
        </div>
      </section>

      {/* ===== SECTION 2: INTEGRATIONS MAP ===== */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <p className="text-sm font-semibold text-cargo-600 tracking-wider uppercase mb-3">Section 2</p>
              <h2 className="text-4xl md:text-5xl font-bold text-navy-900 mb-5">
                Integrations <span className="gradient-text-gold">Map</span>
              </h2>
              <p className="text-lg text-navy-500 max-w-2xl mx-auto">
                Every external data source and API the platform connects to,
                organized by access type and cost.
              </p>
            </div>
          </ScrollReveal>

          {/* Architecture diagram */}
          <ScrollReveal>
            <div className="bg-gradient-to-br from-navy-900 to-navy-800 rounded-2xl p-8 md:p-10 mb-12 shadow-premium">
              <div className="text-center mb-8">
                <h3 className="text-lg font-bold text-white mb-2">Integration Architecture</h3>
                <p className="text-sm text-navy-300">Data flows from external sources through our pipeline into the platform</p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {/* Left: External Sources */}
                <div className="space-y-3">
                  <div className="text-xs font-bold text-ocean-400 uppercase tracking-wider mb-3 text-center">External Sources</div>
                  {["USITC", "CBP CROSS", "Fed Register", "Census", "Maersk", "CMA CGM"].map((src) => (
                    <div key={src} className="bg-navy-700/50 border border-navy-600 rounded-lg px-4 py-2.5 text-sm text-navy-200 text-center">
                      {src}
                    </div>
                  ))}
                </div>

                {/* Center: Processing */}
                <div className="flex flex-col items-center justify-center">
                  <div className="hidden md:flex flex-col items-center gap-3">
                    <ArrowRight className="w-6 h-6 text-ocean-400" />
                    <div className="bg-ocean-500/20 border border-ocean-500/30 rounded-xl px-6 py-4 text-center">
                      <Workflow className="w-8 h-8 text-ocean-400 mx-auto mb-2" />
                      <div className="text-sm font-bold text-white">Data Pipeline</div>
                      <div className="text-xs text-ocean-300 mt-1">Crawlee + Inngest</div>
                    </div>
                    <ArrowRight className="w-6 h-6 text-ocean-400" />
                    <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-xl px-6 py-4 text-center">
                      <Database className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                      <div className="text-sm font-bold text-white">Neon PostgreSQL</div>
                      <div className="text-xs text-emerald-300 mt-1">+ pgvector + Typesense</div>
                    </div>
                    <ArrowRight className="w-6 h-6 text-ocean-400" />
                  </div>
                  <div className="md:hidden py-4 text-center">
                    <ChevronRight className="w-6 h-6 text-ocean-400 mx-auto rotate-90" />
                  </div>
                </div>

                {/* Right: Internal APIs */}
                <div className="space-y-3">
                  <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-3 text-center">Platform APIs</div>
                  {["/api/hts/search", "/api/calculate/*", "/api/routes/*", "/api/compliance/*", "/api/export/pdf", "/api/dashboard/kpis"].map((api) => (
                    <div key={api} className="bg-navy-700/50 border border-emerald-500/30 rounded-lg px-4 py-2.5 text-sm text-emerald-300 text-center font-mono">
                      {api}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Free Government APIs */}
          <ScrollReveal delay={100}>
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                  Free Government APIs
                </span>
                <span className="text-sm text-navy-400">Official data sources, zero cost</span>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {govApis.map((api) => (
                  <div key={api.name} className="bg-white rounded-xl p-5 border border-navy-100 shadow-soft hover:shadow-card transition-all duration-300">
                    <div className="flex items-center gap-2 mb-2">
                      <api.icon className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-bold text-navy-900">{api.name}</span>
                    </div>
                    <p className="text-xs text-navy-400">{api.data}</p>
                    <span className="inline-block mt-2 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">FREE</span>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>

          {/* Carrier APIs */}
          <ScrollReveal delay={150}>
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full bg-ocean-100 text-ocean-700 border border-ocean-200">
                  Free Carrier APIs
                </span>
                <span className="text-sm text-navy-400">Registration required</span>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {carrierApis.map((api) => (
                  <div key={api.name} className="bg-white rounded-xl p-5 border border-navy-100 shadow-soft hover:shadow-card transition-all duration-300">
                    <div className="flex items-center gap-2 mb-2">
                      <api.icon className="w-4 h-4 text-ocean-600" />
                      <span className="text-xs font-bold text-navy-900">{api.name}</span>
                    </div>
                    <p className="text-xs text-navy-400">{api.data}</p>
                    <span className="inline-block mt-2 text-[10px] font-bold text-ocean-600 bg-ocean-50 px-2 py-0.5 rounded-full">FREE</span>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>

          {/* Paid APIs */}
          <ScrollReveal delay={100}>
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                  Paid APIs (Phase 2+)
                </span>
                <span className="text-sm text-navy-400">Premium data for scaling</span>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {paidApis.map((api) => (
                  <div key={api.name} className="bg-white rounded-xl p-5 border border-navy-100 shadow-soft hover:shadow-card transition-all duration-300">
                    <span className="text-xs font-bold text-navy-900">{api.name}</span>
                    <p className="text-xs text-navy-400 mt-1">{api.data}</p>
                    <span className="inline-block mt-2 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">{api.price}</span>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>

          {/* Internal APIs */}
          <ScrollReveal delay={150}>
            <div>
              <div className="flex items-center gap-3 mb-6">
                <span className="text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200">
                  Internal APIs (We Build)
                </span>
                <span className="text-sm text-navy-400">13 endpoints powering the platform</span>
              </div>
              <div className="bg-navy-900 rounded-2xl p-6 shadow-premium">
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {internalApis.map((api) => (
                    <div key={api.endpoint} className="flex items-center gap-3 bg-navy-800/50 rounded-lg px-4 py-3 border border-navy-700">
                      <code className="text-xs text-ocean-400 font-mono flex-shrink-0">{api.endpoint}</code>
                      <span className="text-[10px] text-navy-400 hidden lg:inline">{api.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ===== SECTION 3: DATABASE STRUCTURE ===== */}
      <section className="py-24 px-6 section-alt">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <p className="text-sm font-semibold text-ocean-600 tracking-wider uppercase mb-3">Section 3</p>
              <h2 className="text-4xl md:text-5xl font-bold text-navy-900 mb-5">
                Database <span className="gradient-text">Structure</span>
              </h2>
              <p className="text-lg text-navy-500 max-w-2xl mx-auto">
                Complete schema across 8 table groups, 25+ tables, built on
                Neon PostgreSQL with pgvector for AI-powered search.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-6">
            {dbSchema.map((group, gi) => (
              <ScrollReveal key={group.group} delay={gi * 80}>
                <div className="bg-white rounded-2xl border border-navy-100 shadow-card overflow-hidden h-full">
                  {/* Group header */}
                  <div className={`bg-gradient-to-r ${group.color} px-6 py-4 flex items-center gap-3`}>
                    <group.icon className="w-5 h-5 text-white" />
                    <h3 className="text-base font-bold text-white">{group.group} Tables</h3>
                    <span className="ml-auto text-xs text-white/70 font-medium">{group.tables.length} table{group.tables.length > 1 ? "s" : ""}</span>
                  </div>
                  {/* Tables */}
                  <div className="p-5 space-y-4">
                    {group.tables.map((table) => (
                      <div key={table.name} className="group">
                        <div className="flex items-center gap-2 mb-1.5">
                          <HardDrive className="w-3.5 h-3.5 text-navy-400" />
                          <code className="text-sm font-bold text-navy-900 font-mono">{table.name}</code>
                        </div>
                        <div className="pl-5.5 flex flex-wrap gap-1.5">
                          {table.cols.split(", ").map((col) => (
                            <span
                              key={col}
                              className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                                col.includes("(") ? "bg-indigo-50 text-indigo-600 border border-indigo-200" : "bg-navy-50 text-navy-500"
                              }`}
                            >
                              {col}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SECTION 4: DATA CLEANING PIPELINE ===== */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <p className="text-sm font-semibold text-cargo-600 tracking-wider uppercase mb-3">Section 4</p>
              <h2 className="text-4xl md:text-5xl font-bold text-navy-900 mb-5">
                Data Cleaning <span className="gradient-text-gold">Pipeline</span>
              </h2>
              <p className="text-lg text-navy-500 max-w-2xl mx-auto">
                Seven-stage pipeline ensuring every data point is validated,
                normalized, and indexed before reaching the platform.
              </p>
            </div>
          </ScrollReveal>

          {/* Pipeline flow */}
          <ScrollReveal>
            <div className="flex flex-wrap items-center justify-center gap-3 mb-16">
              {pipelineSteps.map((step, i) => (
                <div key={step.step} className="flex items-center gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-12 h-12 rounded-xl ${step.color} flex items-center justify-center shadow-lg`}>
                      <step.icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xs font-bold text-navy-900 mt-2">{step.step}</span>
                    <span className="text-[10px] text-navy-400 mt-0.5 text-center max-w-[100px]">{step.desc}</span>
                  </div>
                  {i < pipelineSteps.length - 1 && (
                    <ArrowRight className="w-5 h-5 text-navy-300 flex-shrink-0 hidden sm:block" />
                  )}
                </div>
              ))}
            </div>
          </ScrollReveal>

          {/* Per-source pipelines */}
          <div className="grid md:grid-cols-2 gap-6">
            {dataSourcePipelines.map((ds, i) => (
              <ScrollReveal key={ds.source} delay={i * 100}>
                <div className="bg-white rounded-2xl p-7 border border-navy-100 shadow-card h-full">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-base font-bold text-navy-900">{ds.source}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-medium text-navy-400 bg-navy-50 px-2.5 py-1 rounded-full">{ds.format}</span>
                      <span className="text-[10px] font-medium text-ocean-600 bg-ocean-50 px-2.5 py-1 rounded-full">{ds.schedule}</span>
                    </div>
                  </div>
                  <div className="space-y-3 mb-4">
                    {ds.steps.map((step, si) => (
                      <div key={si} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-ocean-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-[10px] font-bold text-ocean-600">{si + 1}</span>
                        </div>
                        <span className="text-sm text-navy-600">{step}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 pt-3 border-t border-navy-100">
                    <Database className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-xs text-navy-400">Destination:</span>
                    <code className="text-xs font-mono text-emerald-600 font-medium">{ds.destination}</code>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SECTION 5: MUNICIPAL EXPANSION ===== */}
      <section className="py-24 px-6 section-alt">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-white border border-indigo-200 rounded-full px-5 py-2.5 mb-6 shadow-soft">
                <Landmark className="w-4 h-4 text-indigo-600" />
                <span className="text-sm font-medium text-indigo-700">Market Expansion</span>
              </div>
              <p className="text-sm font-semibold text-indigo-600 tracking-wider uppercase mb-3">Section 5</p>
              <h2 className="text-4xl md:text-5xl font-bold text-navy-900 mb-5">
                Municipal <span className="gradient-text-hero">Expansion</span>
              </h2>
              <p className="text-lg text-navy-500 max-w-2xl mx-auto">
                The same platform adapted for government and municipal use -- port authorities,
                customs agencies, and economic development offices.
              </p>
            </div>
          </ScrollReveal>

          {/* Market expansion roadmap */}
          <ScrollReveal>
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-16">
              {expansionTimeline.map((phase, i) => (
                <div key={phase.phase} className="flex items-center gap-6">
                  <div className="text-center">
                    <div className={`w-20 h-20 rounded-2xl ${phase.color} flex items-center justify-center mx-auto mb-3 shadow-lg`}>
                      <phase.icon className="w-10 h-10 text-white" />
                    </div>
                    <span className="text-xs font-bold text-navy-400 uppercase tracking-wider">{phase.phase}</span>
                    <div className="text-base font-bold text-navy-900 mt-1">{phase.label}</div>
                    <div className="text-xs text-navy-400 mt-0.5">{phase.desc}</div>
                  </div>
                  {i < expansionTimeline.length - 1 && (
                    <ArrowRight className="w-8 h-8 text-navy-300 flex-shrink-0 hidden md:block" />
                  )}
                </div>
              ))}
            </div>
          </ScrollReveal>

          {/* Use cases */}
          <ScrollReveal delay={100}>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {municipalUseCases.map((uc) => (
                <div key={uc.title} className="bg-white rounded-2xl p-7 border border-navy-100 shadow-card hover:shadow-premium transition-all duration-300 group">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${uc.color} flex items-center justify-center shadow-lg mb-4 group-hover:scale-110 transition-transform`}>
                    <uc.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-base font-bold text-navy-900 mb-2">{uc.title}</h3>
                  <p className="text-sm text-navy-500 leading-relaxed">{uc.desc}</p>
                </div>
              ))}
            </div>
          </ScrollReveal>

          {/* Municipal features + pricing */}
          <div className="grid md:grid-cols-2 gap-8">
            <ScrollReveal delay={150}>
              <div className="bg-white rounded-2xl p-8 border border-navy-100 shadow-card h-full">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                    <Server className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-navy-900">Municipal Features</h3>
                    <p className="text-sm text-navy-400">Government-grade capabilities</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {municipalFeatures.map((feature) => (
                    <div key={feature} className="flex items-start gap-3 group">
                      <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-indigo-600" />
                      </div>
                      <span className="text-sm text-navy-600">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <div className="bg-gradient-to-br from-navy-900 to-navy-800 rounded-2xl p-8 text-white shadow-premium h-full">
                <div className="flex items-center gap-3 mb-6">
                  <DollarSign className="w-6 h-6 text-ocean-300" />
                  <h3 className="text-xl font-bold">Municipal Pricing</h3>
                </div>
                <div className="space-y-6">
                  <div className="bg-ocean-500/10 border border-ocean-500/20 rounded-xl p-5">
                    <div className="text-sm text-ocean-300 font-medium mb-1">Government Tier</div>
                    <div className="text-3xl font-bold text-white">$4,999<span className="text-base font-normal text-navy-300">/mo</span></div>
                    <p className="text-xs text-navy-300 mt-1">Or annual contract with discount</p>
                  </div>
                  <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-5">
                    <div className="text-sm text-indigo-300 font-medium mb-1">Custom Implementations</div>
                    <div className="text-3xl font-bold text-white">$50K-200K</div>
                    <p className="text-xs text-navy-300 mt-1">White-label deployments, custom integrations</p>
                  </div>
                  <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-5">
                    <div className="text-sm text-purple-300 font-medium mb-1">Data Sharing Agreements</div>
                    <div className="text-lg font-bold text-white">Port Authority Partnerships</div>
                    <p className="text-xs text-navy-300 mt-1">Revenue share on commercial data products</p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ===== FOOTER CTA ===== */}
      <section className="py-20 px-6 bg-gradient-to-b from-navy-900 to-navy-950">
        <div className="max-w-3xl mx-auto text-center">
          <ScrollReveal>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Build?
            </h2>
            <p className="text-lg text-navy-300 mb-8">
              This is the technical foundation. The architecture is designed,
              the data sources are mapped, and the pipeline is ready.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <a
                href="/agreement"
                className="inline-flex items-center gap-2 text-sm font-semibold text-white px-7 py-3.5 rounded-xl transition-all duration-300 hover:scale-[1.02] shadow-lg"
                style={{
                  background: "linear-gradient(135deg, #1a56db, #6366f1)",
                  boxShadow: "0 4px 15px rgba(37, 99, 235, 0.3)",
                }}
              >
                View Full Proposal
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="/dashboard"
                className="inline-flex items-center gap-2 text-sm font-semibold text-ocean-300 bg-navy-800 border border-navy-600 px-7 py-3.5 rounded-xl hover:bg-navy-700 transition-all duration-300"
              >
                Live Demo
                <ChevronRight className="w-4 h-4" />
              </a>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </main>
  );
}

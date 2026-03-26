"use client";

import { useState } from "react";
import Header from "@/components/Header";
import ScrollReveal from "@/components/ScrollReveal";
import Link from "next/link";
import {
  Search, FileText, BarChart3, Eye, Layout,
  Check, ArrowRight, ChevronDown, ChevronRight,
  Globe, Database, Cpu, Shield, Users, Target,
  Brain, Radar, Route, FileCheck, TrendingUp,
  Ship, Zap, Clock, DollarSign, AlertTriangle,
  Layers, Lock, Calculator, Bot, Monitor,
  Activity, PieChart, LineChart, Settings,
  BookOpen, Map, Truck, Container, Anchor,
  Workflow, Code2, Server, Gauge, Bell,
  ClipboardList, Milestone, Lightbulb,
  CheckCircle2, Circle, ArrowUpRight,
} from "lucide-react";

/* ─── Phase Config ─── */
const phases = [
  { id: "research", label: "Research", weeks: "Weeks 1-4", color: "ocean", gradient: "from-ocean-500 to-ocean-600", bgLight: "bg-ocean-50", borderColor: "border-ocean-200", textColor: "text-ocean-600", dotColor: "bg-ocean-500", icon: Search },
  { id: "planning", label: "Planning", weeks: "Weeks 5-8", color: "indigo", gradient: "from-indigo-500 to-indigo-600", bgLight: "bg-indigo-50", borderColor: "border-indigo-200", textColor: "text-indigo-600", dotColor: "bg-indigo-500", icon: FileText },
  { id: "monitoring", label: "Monitoring", weeks: "Week 9+", color: "emerald", gradient: "from-emerald-500 to-emerald-600", bgLight: "bg-emerald-50", borderColor: "border-emerald-200", textColor: "text-emerald-600", dotColor: "bg-emerald-500", icon: Eye },
  { id: "outline", label: "Outline", weeks: "Full Spec", color: "amber", gradient: "from-amber-500 to-amber-600", bgLight: "bg-amber-50", borderColor: "border-amber-200", textColor: "text-amber-600", dotColor: "bg-amber-500", icon: Layout },
];

/* ─── Expandable Section Component ─── */
function ExpandableSection({ title, icon: Icon, iconGradient, children, defaultOpen = false }: {
  title: string;
  icon: React.ElementType;
  iconGradient: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-2xl border border-navy-200/60 shadow-card overflow-hidden transition-all duration-300 hover:shadow-card-hover">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-4 p-6 text-left hover:bg-navy-50/50 transition-colors"
      >
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${iconGradient} flex items-center justify-center flex-shrink-0 shadow-md`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-lg font-bold text-navy-900 flex-1">{title}</h3>
        {open ? <ChevronDown className="w-5 h-5 text-navy-400" /> : <ChevronRight className="w-5 h-5 text-navy-400" />}
      </button>
      {open && <div className="px-6 pb-6 pt-0">{children}</div>}
    </div>
  );
}

/* ─── Deliverable Checklist ─── */
function DeliverableList({ items }: { items: string[] }) {
  return (
    <div className="mt-6 bg-navy-50/80 rounded-xl p-5 border border-navy-100">
      <h4 className="text-sm font-bold text-navy-900 uppercase tracking-wider mb-3 flex items-center gap-2">
        <ClipboardList className="w-4 h-4 text-ocean-500" />
        Deliverables
      </h4>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
            <span className="text-sm text-navy-700">{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Bullet List ─── */
function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2 mt-3">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2.5">
          <Circle className="w-2 h-2 text-ocean-400 mt-2 flex-shrink-0 fill-current" />
          <span className="text-sm text-navy-600 leading-relaxed">{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function PhasesPage() {
  const [activePhase, setActivePhase] = useState("research");

  return (
    <main className="min-h-screen bg-white">
      <Header />

      {/* ===== HERO ===== */}
      <section className="relative pt-32 pb-20 overflow-hidden hero-gradient grain-overlay">
        <div className="absolute inset-0 pattern-dots-hero" />
        <div className="orb top-1/4 -left-32 w-[400px] h-[400px] bg-ocean-300/30 animate-orb-float-1" />
        <div className="orb bottom-1/4 -right-32 w-[300px] h-[300px] bg-indigo-300/25 animate-orb-float-2" />

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-ocean-200/60 rounded-full px-5 py-2.5 mb-8 shadow-soft">
            <Milestone className="w-4 h-4 text-ocean-600" />
            <span className="text-sm font-medium text-navy-600">Project Lifecycle</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 text-navy-900">
            Four <span className="gradient-text-hero">Phases</span> to Launch
          </h1>

          <p className="text-xl text-navy-600 max-w-3xl mx-auto mb-4 leading-relaxed">
            A comprehensive, investor-ready roadmap from initial research through full platform specification.
            Every phase has clear deliverables, timelines, and success criteria.
          </p>
          <p className="text-lg text-navy-400 max-w-2xl mx-auto">
            Research. Plan. Monitor. Specify. Then build with confidence.
          </p>
        </div>

        <div className="absolute bottom-0 left-0 right-0 z-10">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0,32L80,26.7C160,21,320,11,480,10.7C640,11,800,21,960,26.7C1120,32,1280,32,1360,32L1440,32L1440,60L0,60Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* ===== TIMELINE OVERVIEW ===== */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {phases.map((phase) => (
                <button
                  key={phase.id}
                  onClick={() => {
                    setActivePhase(phase.id);
                    document.getElementById(phase.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  className={`group relative bg-white rounded-2xl p-6 border-2 transition-all duration-300 hover:shadow-card hover:-translate-y-1 text-left ${
                    activePhase === phase.id
                      ? `${phase.borderColor} shadow-card`
                      : "border-navy-200/60 shadow-soft"
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${phase.gradient} flex items-center justify-center mb-4 shadow-md`}>
                    <phase.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-navy-900 mb-1">{phase.label}</h3>
                  <p className="text-sm text-navy-400 font-medium">{phase.weeks}</p>
                  <div className={`absolute top-3 right-3 w-3 h-3 rounded-full ${phase.dotColor} ${activePhase === phase.id ? "animate-pulse" : "opacity-40"}`} />
                </button>
              ))}
            </div>
          </ScrollReveal>

          {/* Connecting Timeline Bar */}
          <ScrollReveal delay={200}>
            <div className="mt-8 relative">
              <div className="h-2 bg-navy-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-ocean-500 via-indigo-500 via-emerald-500 to-amber-500" style={{ width: "100%" }} />
              </div>
              <div className="flex justify-between mt-3">
                <span className="text-xs font-medium text-navy-400">Week 1</span>
                <span className="text-xs font-medium text-navy-400">Week 4</span>
                <span className="text-xs font-medium text-navy-400">Week 8</span>
                <span className="text-xs font-medium text-navy-400">Ongoing</span>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>


      {/* ═══════════════════════════════════════════════════════════════
          PHASE 1: RESEARCH (Weeks 1-4)
      ═══════════════════════════════════════════════════════════════ */}
      <section id="research" className="py-24 px-6 section-alt scroll-mt-24">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="flex items-center gap-4 mb-3">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-ocean-500 to-ocean-600 flex items-center justify-center shadow-lg">
                <Search className="w-7 h-7 text-white" />
              </div>
              <div>
                <span className="text-sm font-bold text-ocean-600 uppercase tracking-wider">Phase 1</span>
                <h2 className="text-4xl md:text-5xl font-bold text-navy-900">Research</h2>
              </div>
              <span className="ml-auto text-sm font-medium text-navy-400 bg-ocean-50 px-4 py-2 rounded-full border border-ocean-100">Weeks 1-4</span>
            </div>
            <p className="text-lg text-navy-500 max-w-3xl mb-10">
              Validate every assumption before writing a single line of production code. Test data sources, benchmark technologies,
              interview users, and map the competitive landscape exhaustively.
            </p>
          </ScrollReveal>

          <div className="space-y-4">
            {/* 1.1 Market & Competitor Intelligence */}
            <ScrollReveal>
              <ExpandableSection title="1.1 Market & Competitor Intelligence" icon={Target} iconGradient="from-ocean-500 to-ocean-600" defaultOpen={true}>
                <p className="text-sm text-navy-500 mb-4">
                  Map the entire logistics SaaS landscape to identify where Shipping Savior fits, what gaps exist, and where the market is heading.
                </p>
                <BulletList items={[
                  "Map all logistics SaaS competitors: Freightos, Flexport, project44, FourKites, ShipBob, Xeneta, Descartes, and emerging players",
                  "Feature gap analysis — what they have vs. what we have vs. what nobody has (FTZ strategy is the #1 whitespace)",
                  "Pricing benchmarks across the market ($99/mo starter to $10K+ enterprise at major platforms)",
                  "Customer acquisition channels they use: content marketing, partnerships, freight trade shows, LinkedIn outreach",
                  "Their API/integration ecosystems: which ERPs, TMS, and carrier APIs they support",
                  "Market sizing: TAM/SAM/SOM for logistics SaaS (estimated $12B+ TAM by 2027)",
                ]} />
              </ExpandableSection>
            </ScrollReveal>

            {/* 1.2 Data Source Validation */}
            <ScrollReveal delay={50}>
              <ExpandableSection title="1.2 Data Source Validation" icon={Database} iconGradient="from-blue-500 to-blue-600">
                <p className="text-sm text-navy-500 mb-4">
                  Test all 26+ identified data sources for reliability, completeness, rate limits, and data freshness. Separate free government sources from paid commercial APIs.
                </p>
                <BulletList items={[
                  "Test USITC HTS API response format, rate limits, and coverage (100K+ tariff codes)",
                  "Verify CBP CROSS rulings database scraping throughput and data structure",
                  "Validate carrier API access: Maersk Developer Portal, CMA CGM API Portal, MSC (status TBD), Hapag-Lloyd",
                  "Assess ImportGenius/Panjiva data quality for competitive intelligence on SE Asia trade flows",
                  "Map FDA import alert coverage for SE Asia cold chain products (seafood, produce, dairy)",
                  "Test OFIS FTZ database API for all 260+ zone locations with coordinates",
                  "Validate UN/LOCODE and World Port Index data for 3,700+ port entries",
                  "Evaluate AIS data providers (MarineTraffic, Kpler, VesselFinder) for live vessel tracking — pricing and coverage",
                  "Test Customs Rulings Online Search System (CROSS) for HTS classification precedents",
                  "Verify USDA APHIS data for cold chain import permits and phytosanitary requirements",
                ]} />

                <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                    <h5 className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2">Free / Government</h5>
                    <p className="text-xs text-emerald-600">USITC HTS, OFIS FTZ, CBP CROSS, UN/LOCODE, World Port Index, FDA Alerts, Census Trade Data</p>
                  </div>
                  <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                    <h5 className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-2">Free / Carrier APIs</h5>
                    <p className="text-xs text-amber-600">Maersk Developer Portal, CMA CGM API, carrier schedule feeds, port authority APIs</p>
                  </div>
                  <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                    <h5 className="text-xs font-bold text-red-700 uppercase tracking-wider mb-2">Paid / Commercial</h5>
                    <p className="text-xs text-red-600">MarineTraffic AIS, ImportGenius, Panjiva, Descartes CustomsInfo, Xeneta benchmarks</p>
                  </div>
                </div>
              </ExpandableSection>
            </ScrollReveal>

            {/* 1.3 Technology Validation */}
            <ScrollReveal delay={100}>
              <ExpandableSection title="1.3 Technology Validation" icon={Cpu} iconGradient="from-purple-500 to-purple-600">
                <p className="text-sm text-navy-500 mb-4">
                  Benchmark every library choice with real data and real workloads. No assumptions — measure performance before committing to the stack.
                </p>
                <BulletList items={[
                  "Test searoute-js with 20+ SE Asia to US port pairs (Ho Chi Minh City, Bangkok, Jakarta, Semarang to LA, Long Beach, Savannah, Newark)",
                  "Benchmark Typesense vs. Meilisearch for HTS code search across 100K+ entries — index build time, query latency, fuzzy matching accuracy",
                  "Evaluate MapLibre GL + deck.gl rendering performance with 500+ simultaneous routes on mid-range hardware",
                  "Test @react-pdf/renderer for complex shipping documents (landed cost reports, BOL templates) on Vercel serverless — measure timeout risk",
                  "Validate pgvector for semantic search on CBP rulings (10K+ ruling documents, embedding quality, retrieval accuracy)",
                  "Benchmark decimal.js vs. big.js vs. bignumber.js for financial calculations — API ergonomics and bundle size",
                  "Test Crawlee + Playwright for government website scraping (CBP, USITC, FDA) — reliability and rate limit handling",
                  "Evaluate Zustand vs. Jotai for calculator state management with URL serialization via nuqs",
                ]} />
              </ExpandableSection>
            </ScrollReveal>

            {/* 1.4 Regulatory & Compliance Research */}
            <ScrollReveal delay={150}>
              <ExpandableSection title="1.4 Regulatory & Compliance Research" icon={Shield} iconGradient="from-emerald-500 to-emerald-600">
                <p className="text-sm text-navy-500 mb-4">
                  International trade compliance is the highest-stakes area. One miscalculation can mean $5,000+ penalties per filing.
                  Map every requirement before building compliance features.
                </p>
                <BulletList items={[
                  "Map ISF (Importer Security Filing) requirements by port of entry — 24h before vessel departure, $5,000 penalty per late filing",
                  "Document FTZ regulations (19 CFR Part 146) decision tree: privileged foreign status vs. non-privileged, zone-to-zone transfers, weekly entry procedures",
                  "Catalog Section 301/201/232 tariff lists for SE Asia countries — Vietnam (up to 25% additional), Thailand, Indonesia, Cambodia, Myanmar",
                  "Research UFLPA (Uyghur Forced Labor Prevention Act) compliance requirements for supply chain traceability from SE Asia",
                  "Document AD/CVD (Antidumping and Countervailing Duty) orders affecting apparel and CPG from Vietnam, Thailand, Indonesia",
                  "Map FDA prior notice requirements for food imports (cold chain specialty)",
                  "Document customs bond requirements: continuous vs. single-entry, cost structures",
                  "Research April 2025 executive order mandating Privileged Foreign (PF) status for reciprocal-tariff-scope goods in FTZs",
                ]} />

                <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h5 className="text-sm font-bold text-amber-800">Critical: FTZ Status Elections Are Permanent</h5>
                      <p className="text-xs text-amber-700 mt-1">
                        Once a zone status election is made (Privileged Foreign vs. Non-Privileged Foreign), it cannot be reversed.
                        The April 2025 executive order mandates PF status for reciprocal-tariff-scope goods. Platform must display clear
                        warnings and disclaimers — this is not something to get wrong.
                      </p>
                    </div>
                  </div>
                </div>
              </ExpandableSection>
            </ScrollReveal>

            {/* 1.5 User Research */}
            <ScrollReveal delay={200}>
              <ExpandableSection title="1.5 User Research" icon={Users} iconGradient="from-cargo-500 to-orange-600">
                <p className="text-sm text-navy-500 mb-4">
                  Talk to real users before building. Identify the top pain points that people would actually pay to solve.
                </p>
                <BulletList items={[
                  "Interview 5-10 freight forwarders on their biggest operational pain points (manual quoting, rate comparison, document management)",
                  "Survey customs brokers on HTS classification challenges — where do they spend the most time? What tools do they use?",
                  "Document Blake's current manual workflow in detail (as-is process map): how quotes are built, how carriers are compared, how FTZ decisions are made",
                  "Identify top 3 'I'd pay for that' features from potential users — validate the pricing model against willingness to pay",
                  "Map the decision-making journey: who decides (operations manager, CFO, freight broker), what triggers a search, what closes a deal",
                  "Conduct 3-5 ride-alongs with Blake's current operations to observe the manual workflow in real time",
                  "Create user personas: Small Importer (1-5 containers/month), Mid-Market (5-50), Enterprise (50+), Customs Broker, Freight Forwarder",
                ]} />
              </ExpandableSection>
            </ScrollReveal>

            {/* Phase 1 Deliverables */}
            <ScrollReveal delay={250}>
              <DeliverableList items={[
                "Competitor analysis report with feature gap matrix",
                "Data source validation matrix (26 sources: tested/untested, reliable/unreliable, free/paid)",
                "Technology benchmark results (search engine, mapping, PDF generation, financial math)",
                "Regulatory compliance guide (ISF, FTZ, Section 301, UFLPA, AD/CVD)",
                "User research findings with persona definitions and top pain points",
              ]} />
            </ScrollReveal>
          </div>
        </div>
      </section>


      {/* ═══════════════════════════════════════════════════════════════
          PHASE 2: PLANNING (Weeks 5-8)
      ═══════════════════════════════════════════════════════════════ */}
      <section id="planning" className="py-24 px-6 bg-white scroll-mt-24">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="flex items-center gap-4 mb-3">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg">
                <FileText className="w-7 h-7 text-white" />
              </div>
              <div>
                <span className="text-sm font-bold text-indigo-600 uppercase tracking-wider">Phase 2</span>
                <h2 className="text-4xl md:text-5xl font-bold text-navy-900">Planning</h2>
              </div>
              <span className="ml-auto text-sm font-medium text-navy-400 bg-indigo-50 px-4 py-2 rounded-full border border-indigo-100">Weeks 5-8</span>
            </div>
            <p className="text-lg text-navy-500 max-w-3xl mb-10">
              Turn research into actionable plans. Product roadmap, technical architecture, data pipelines,
              AI agent development plans, go-to-market strategy, and financial projections — all documented before code.
            </p>
          </ScrollReveal>

          <div className="space-y-4">
            {/* 2.1 Product Roadmap */}
            <ScrollReveal>
              <ExpandableSection title="2.1 Product Roadmap" icon={Milestone} iconGradient="from-indigo-500 to-indigo-600" defaultOpen={true}>
                <p className="text-sm text-navy-500 mb-4">
                  A 6-month feature roadmap that tells everyone — engineers, investors, partners — exactly what ships and when.
                </p>
                <BulletList items={[
                  "6-month feature roadmap with monthly milestones and clear success metrics",
                  "MVP definition: what ships in Month 3 (landed cost calculator, HTS lookup, FTZ savings analyzer, route map, container calculator)",
                  "Feature prioritization matrix (impact x effort) — rank all 40+ features across the 6 modules",
                  "Dependencies graph between features: data layer before calculators, calculators before visualizations, tariff engine before FTZ analyzer",
                  "Risk registry with mitigation strategies: data source failures, API rate limits, FTZ regulation changes, cold chain data gaps",
                  "Sprint planning framework: 2-week sprints, weekly demos, monthly stakeholder reviews",
                ]} />
              </ExpandableSection>
            </ScrollReveal>

            {/* 2.2 Technical Architecture Plan */}
            <ScrollReveal delay={50}>
              <ExpandableSection title="2.2 Technical Architecture Plan" icon={Layers} iconGradient="from-violet-500 to-violet-600">
                <p className="text-sm text-navy-500 mb-4">
                  Full system architecture document covering every component, API, data flow, and infrastructure decision.
                </p>
                <BulletList items={[
                  "System architecture document: Next.js 14 App Router monolith with 6 logical service components",
                  "Database schema design: PostgreSQL (Neon) + pgvector for semantic search on CBP rulings",
                  "Data pipeline architecture: Crawlee scrapers -> processing/normalization -> PostgreSQL storage -> Typesense search index -> API layer",
                  "AI agent architecture: which models (Claude API for reasoning, embeddings for search), training data sources, evaluation metrics",
                  "Infrastructure plan: Vercel (app + serverless functions) + Neon PostgreSQL + Typesense Cloud + Upstash Redis (rate limiting + caching)",
                  "Security architecture: NextAuth for auth, encrypted API keys in Vercel env, row-level security in PostgreSQL, SOC 2 compliance roadmap",
                  "API design: REST endpoints for calculators and data, WebSocket for real-time vessel tracking (Phase 2+)",
                  "Caching strategy: ISR for semi-static pages, Redis for hot data, client-side SWR for user-specific data",
                ]} />

                <div className="mt-5 bg-indigo-50 rounded-xl p-5 border border-indigo-100">
                  <h5 className="text-sm font-bold text-indigo-800 mb-3">Architecture at a Glance</h5>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      { label: "Framework", value: "Next.js 14 (App Router)" },
                      { label: "Database", value: "PostgreSQL + pgvector" },
                      { label: "Search", value: "Typesense" },
                      { label: "Cache", value: "Upstash Redis" },
                      { label: "Maps", value: "MapLibre + deck.gl" },
                      { label: "AI", value: "Claude API + Embeddings" },
                    ].map((item) => (
                      <div key={item.label} className="bg-white rounded-lg p-3 border border-indigo-100">
                        <p className="text-xs font-medium text-indigo-500">{item.label}</p>
                        <p className="text-sm font-bold text-navy-900">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </ExpandableSection>
            </ScrollReveal>

            {/* 2.3 Data Pipeline Plan */}
            <ScrollReveal delay={100}>
              <ExpandableSection title="2.3 Data Pipeline Plan" icon={Workflow} iconGradient="from-blue-500 to-cyan-600">
                <p className="text-sm text-navy-500 mb-4">
                  Design the entire data ingestion, processing, and serving pipeline for all 26+ data sources.
                </p>
                <BulletList items={[
                  "Scraping schedule for all 26 sources: USITC HTS (weekly), carrier schedules (daily), port data (monthly), FDA alerts (daily)",
                  "Data quality monitoring strategy: completeness scores, accuracy validation, consistency checks across sources",
                  "Freshness alerting system design: Slack/email alerts when any source is stale beyond its SLA (e.g., HTS > 7 days, carrier schedules > 24h)",
                  "ETL pipeline for normalizing data across sources: different date formats, currency codes, port identifiers, HTS code formats",
                  "Search index build/rebuild strategy for HTS codes: incremental updates vs. full rebuild, index versioning",
                  "Data deduplication logic for carrier routes (same route from multiple sources with slightly different data)",
                  "Archival strategy: keep historical tariff rates for trend analysis and scenario modeling",
                  "Error handling and retry logic: exponential backoff, dead letter queues for failed scrapes, manual override for blocked sources",
                ]} />
              </ExpandableSection>
            </ScrollReveal>

            {/* 2.4 AI Agent Development Plan */}
            <ScrollReveal delay={150}>
              <ExpandableSection title="2.4 AI Agent Development Plan (6 Agents)" icon={Brain} iconGradient="from-purple-500 to-violet-600">
                <p className="text-sm text-navy-500 mb-4">
                  Each of the 6 AI agents has a distinct training data source, model selection, evaluation metric, and rollout strategy.
                </p>

                {[
                  {
                    name: "Tariff Classification Agent",
                    icon: Radar,
                    color: "ocean",
                    training: "USITC HTS database (100K+ codes) + CBP CROSS rulings (50K+ rulings) + historical classification decisions",
                    model: "Claude API for reasoning chain, text-embedding-3-large for semantic HTS code matching",
                    metrics: "Accuracy: 95%+ on 6-digit HTS, 85%+ on 10-digit. Human override rate < 10%",
                    rollout: "Beta with 100 product descriptions -> accuracy audit -> production with confidence scoring",
                    cost: "$0.03-0.08 per classification (Claude API input + output tokens)",
                  },
                  {
                    name: "Route Optimization Agent",
                    icon: Route,
                    color: "amber",
                    training: "Carrier schedule APIs + historical transit times + port congestion data + backhaul rate patterns",
                    model: "Claude API for multi-factor recommendation, custom scoring algorithm for route ranking",
                    metrics: "Recommendation acceptance rate > 70%, average cost savings > 8% vs. manual selection",
                    rollout: "Shadow mode (recommendations without action) -> A/B test vs. manual -> full deployment",
                    cost: "$0.05-0.12 per route optimization (multi-carrier comparison)",
                  },
                  {
                    name: "Cost Prediction Agent",
                    icon: TrendingUp,
                    color: "blue",
                    training: "Historical landed cost data + tariff rate trends + seasonal freight rate patterns + fuel surcharge history",
                    model: "Time-series forecasting model + Claude API for narrative explanation of predictions",
                    metrics: "Prediction accuracy: within 5% of actual landed cost, 30-day forecast horizon",
                    rollout: "Backtesting on 12 months of historical data -> live shadow predictions -> customer-facing",
                    cost: "$0.02-0.05 per prediction (primarily embedding lookup + lightweight inference)",
                  },
                  {
                    name: "Compliance Monitoring Agent",
                    icon: FileCheck,
                    color: "purple",
                    training: "CBP regulations, ISF requirements, FDA alerts, UFLPA guidelines, AD/CVD orders",
                    model: "Claude API for regulation interpretation + rule-based deadline tracking engine",
                    metrics: "Zero missed ISF deadlines ($5K penalty each), false positive rate < 5%, alert response time < 1h",
                    rollout: "Internal monitoring -> alerts to operations team -> automated filing reminders",
                    cost: "$0.01-0.03 per compliance check (mostly rule-based, AI for edge cases)",
                  },
                  {
                    name: "FTZ Strategy Optimizer",
                    icon: Shield,
                    color: "emerald",
                    training: "FTZ regulations (19 CFR 146), historical duty rate changes, withdrawal pattern data, cash flow models",
                    model: "Custom optimization algorithm + Claude API for strategy explanation + Monte Carlo simulation for rate forecasting",
                    metrics: "Average duty savings identified > 12%, withdrawal schedule adherence > 95%",
                    rollout: "Modeling tool -> recommendation engine -> automated withdrawal scheduling suggestions",
                    cost: "$0.08-0.15 per strategy analysis (complex multi-variable optimization)",
                  },
                  {
                    name: "Trade Intelligence Agent",
                    icon: Globe,
                    color: "teal",
                    training: "Census trade data, competitor import patterns (ImportGenius), trade policy news, tariff announcements",
                    model: "Claude API for market analysis + embedding-based similarity search for pattern detection",
                    metrics: "Insights generated per week > 5, user engagement rate > 60%, actionable intelligence score > 80%",
                    rollout: "Weekly digest -> real-time alerts for significant changes -> predictive market intelligence",
                    cost: "$0.10-0.20 per intelligence report (high-context analysis)",
                  },
                ].map((agent) => (
                  <div key={agent.name} className="mt-4 bg-navy-50/80 rounded-xl p-5 border border-navy-100">
                    <div className="flex items-center gap-3 mb-3">
                      <agent.icon className="w-5 h-5 text-navy-700" />
                      <h5 className="text-sm font-bold text-navy-900">{agent.name}</h5>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs font-semibold text-navy-500 uppercase tracking-wider mb-1">Training Data</p>
                        <p className="text-xs text-navy-600">{agent.training}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-navy-500 uppercase tracking-wider mb-1">Model Selection</p>
                        <p className="text-xs text-navy-600">{agent.model}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-navy-500 uppercase tracking-wider mb-1">Evaluation Metrics</p>
                        <p className="text-xs text-navy-600">{agent.metrics}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-navy-500 uppercase tracking-wider mb-1">Rollout Strategy</p>
                        <p className="text-xs text-navy-600">{agent.rollout}</p>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-navy-200/60">
                      <p className="text-xs text-navy-400"><span className="font-semibold">Cost per inference:</span> {agent.cost}</p>
                    </div>
                  </div>
                ))}
              </ExpandableSection>
            </ScrollReveal>

            {/* 2.5 Go-to-Market Plan */}
            <ScrollReveal delay={200}>
              <ExpandableSection title="2.5 Go-to-Market Plan" icon={Target} iconGradient="from-cargo-500 to-orange-600">
                <p className="text-sm text-navy-500 mb-4">
                  How we launch, who we target first, and how we grow from 0 to 1,000 paying subscribers.
                </p>
                <BulletList items={[
                  "Launch timeline: private beta (Month 4), public beta (Month 5), GA (Month 6)",
                  "Content marketing calendar: 2 blog posts/week on import/export topics, monthly webinar series, weekly LinkedIn posts",
                  "Free tool strategy: landed cost calculator and HTS lookup are free forever — conversion funnel to paid tiers for FTZ analyzer, route optimization, AI agents",
                  "Partnership development: 10 freight forwarders as beta partners, 5 customs brokers for HTS validation, 3 FTZ operators for zone data",
                  "Pricing validation plan: A/B test $299/$799/$2499 tiers against $199/$599/$1999 (10% conversion rate target)",
                  "Conference strategy: FreightWaves LIVE, TPM (Trans-Pacific Maritime), JOC Inland Distribution Conference",
                  "SEO strategy: target 50 long-tail keywords (e.g., 'FTZ duty savings calculator', 'HTS code lookup free', 'landed cost calculator import')",
                  "Referral program: 20% recurring commission for freight forwarders who refer customers",
                ]} />
              </ExpandableSection>
            </ScrollReveal>

            {/* 2.6 Financial Plan */}
            <ScrollReveal delay={250}>
              <ExpandableSection title="2.6 Financial Plan" icon={DollarSign} iconGradient="from-emerald-500 to-emerald-600">
                <p className="text-sm text-navy-500 mb-4">
                  Development budget, monthly burn, revenue projections, and break-even analysis for the first 18 months.
                </p>
                <BulletList items={[
                  "Development budget breakdown by phase: Phase 1 ($15K), Phase 2 ($25K), Phase 3 ($20K), Phase 4 ($30K) — total $90K development",
                  "Monthly burn rate projection: $8K/mo (infrastructure $1.5K, AI API costs $2K, data sources $1K, marketing $2K, operational $1.5K)",
                  "Revenue forecast: Month 6: $5K MRR, Month 12: $35K MRR, Month 18: $120K MRR (based on 3-tier pricing)",
                  "Break-even analysis: Month 14 at current projections, Month 11 with enterprise deal acceleration",
                  "Funding requirements: $150K seed round covers 18 months of runway with 3-month buffer",
                  "Unit economics: $0.10/unit origin cost -> $5.00 retail = 50x markup, platform SaaS captures $0.002-0.01 per unit in analytics value",
                  "LTV:CAC target: 19:1 (average customer lifetime 24 months x $799/mo avg revenue / $1,000 CAC)",
                ]} />

                <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: "Dev Budget", value: "$90K", sub: "4 phases" },
                    { label: "Monthly Burn", value: "$8K", sub: "post-launch" },
                    { label: "Break-Even", value: "Month 14", sub: "projected" },
                    { label: "LTV:CAC", value: "19:1", sub: "target ratio" },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-emerald-50 rounded-xl p-4 border border-emerald-100 text-center">
                      <p className="text-xs font-medium text-emerald-600">{stat.label}</p>
                      <p className="text-xl font-bold text-navy-900">{stat.value}</p>
                      <p className="text-xs text-emerald-500">{stat.sub}</p>
                    </div>
                  ))}
                </div>
              </ExpandableSection>
            </ScrollReveal>

            {/* Phase 2 Deliverables */}
            <ScrollReveal delay={300}>
              <DeliverableList items={[
                "Product roadmap document with 6-month milestones",
                "Technical architecture document (components, APIs, data flows, infrastructure)",
                "Data pipeline specification (26 sources, scraping schedules, ETL logic, quality monitoring)",
                "AI agent development plans x6 (training data, models, metrics, rollout, cost per inference)",
                "Go-to-market strategy document (launch timeline, content calendar, partnership plan, pricing validation)",
                "Financial model (development budget, burn rate, revenue forecast, break-even analysis)",
              ]} />
            </ScrollReveal>
          </div>
        </div>
      </section>


      {/* ═══════════════════════════════════════════════════════════════
          PHASE 3: MONITORING (Ongoing from Week 9)
      ═══════════════════════════════════════════════════════════════ */}
      <section id="monitoring" className="py-24 px-6 section-alt scroll-mt-24">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="flex items-center gap-4 mb-3">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg">
                <Eye className="w-7 h-7 text-white" />
              </div>
              <div>
                <span className="text-sm font-bold text-emerald-600 uppercase tracking-wider">Phase 3</span>
                <h2 className="text-4xl md:text-5xl font-bold text-navy-900">Monitoring</h2>
              </div>
              <span className="ml-auto text-sm font-medium text-navy-400 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100">Week 9+ (Ongoing)</span>
            </div>
            <p className="text-lg text-navy-500 max-w-3xl mb-10">
              Once the platform is live, monitor everything: platform health, data pipeline freshness, AI agent accuracy,
              business KPIs, and competitor movements. If you cannot measure it, you cannot improve it.
            </p>
          </ScrollReveal>

          <div className="space-y-4">
            {/* 3.1 Platform Health Monitoring */}
            <ScrollReveal>
              <ExpandableSection title="3.1 Platform Health Monitoring" icon={Activity} iconGradient="from-emerald-500 to-emerald-600" defaultOpen={true}>
                <p className="text-sm text-navy-500 mb-4">
                  Core infrastructure and performance monitoring to ensure 99.9%+ uptime and sub-200ms response times.
                </p>
                <BulletList items={[
                  "Uptime monitoring: Vercel deployment health checks every 60 seconds from 3 regions (US-East, US-West, EU-West)",
                  "API response time tracking: p50 < 100ms, p95 < 200ms, p99 < 500ms targets for all calculator endpoints",
                  "Build success rate: track Next.js build failures, deployment rollback frequency, and mean time to recovery",
                  "Error rate by page/component: Sentry integration with error budgets (< 0.1% error rate per endpoint)",
                  "Core Web Vitals: LCP < 2.5s, FID < 100ms, CLS < 0.1 — tracked via Vercel Analytics and Chrome UX Report",
                  "Database connection pool monitoring: active connections, query latency p95, slow query log analysis",
                  "Serverless function cold start tracking: measure impact on calculator response times",
                ]} />
              </ExpandableSection>
            </ScrollReveal>

            {/* 3.2 Data Pipeline Monitoring */}
            <ScrollReveal delay={50}>
              <ExpandableSection title="3.2 Data Pipeline Monitoring" icon={Database} iconGradient="from-blue-500 to-cyan-600">
                <p className="text-sm text-navy-500 mb-4">
                  Stale data is worse than no data. Monitor freshness, accuracy, and coverage for every data source continuously.
                </p>
                <BulletList items={[
                  "Data freshness dashboard: last successful scrape time for each of the 26 sources, color-coded (green/yellow/red)",
                  "Scrape success/failure rate by source: track API errors, rate limit hits, HTML structure changes, auth failures",
                  "Data quality scores: completeness (% of expected fields populated), accuracy (spot-check against source), consistency (cross-source validation)",
                  "HTS code coverage: % of 100K+ codes with current duty rates, flag gaps in SE Asia product categories",
                  "Carrier schedule coverage: % of major SE Asia to US routes with current sailing data",
                  "Alert on stale data: > 24h for real-time sources (carrier schedules), > 7d for periodic sources (HTS rates), > 30d for stable sources (port data)",
                  "Data volume trending: track record counts over time to catch silent failures (e.g., scraper returning 0 results without error)",
                  "ETL pipeline latency: time from scrape to searchable index — target < 15 minutes for carrier data, < 1 hour for tariff data",
                ]} />
              </ExpandableSection>
            </ScrollReveal>

            {/* 3.3 AI Agent Performance Monitoring */}
            <ScrollReveal delay={100}>
              <ExpandableSection title="3.3 AI Agent Performance Monitoring" icon={Brain} iconGradient="from-purple-500 to-violet-600">
                <p className="text-sm text-navy-500 mb-4">
                  Each AI agent has specific accuracy targets and performance metrics. Monitor drift, bias, and degradation continuously.
                </p>

                <div className="space-y-3">
                  {[
                    { name: "Tariff Classification Agent", metrics: "Accuracy rate, confidence score distribution, human override rate, misclassification patterns by product category" },
                    { name: "Route Optimization Agent", metrics: "Recommendation acceptance rate, cost savings achieved (actual vs. predicted), carrier selection distribution, transit time accuracy" },
                    { name: "Cost Prediction Agent", metrics: "Prediction accuracy (MAPE < 5%), prediction horizon performance (7-day vs. 30-day), error distribution by cost component" },
                    { name: "Compliance Monitor Agent", metrics: "Alerts generated per week, false positive rate (target < 5%), penalties avoided (dollar value), average alert-to-action time" },
                    { name: "FTZ Strategy Optimizer", metrics: "Savings realized vs. projected, withdrawal schedule adherence rate (target > 95%), zone utilization efficiency" },
                    { name: "Trade Intelligence Agent", metrics: "Insights generated per week, user engagement rate (opened, acted upon), predictive accuracy of market trend calls" },
                  ].map((agent) => (
                    <div key={agent.name} className="bg-white rounded-xl p-4 border border-navy-100">
                      <h5 className="text-sm font-bold text-navy-800 mb-1">{agent.name}</h5>
                      <p className="text-xs text-navy-500">{agent.metrics}</p>
                    </div>
                  ))}
                </div>
              </ExpandableSection>
            </ScrollReveal>

            {/* 3.4 Business KPI Dashboard */}
            <ScrollReveal delay={150}>
              <ExpandableSection title="3.4 Business KPI Dashboard" icon={PieChart} iconGradient="from-cargo-500 to-orange-600">
                <p className="text-sm text-navy-500 mb-4">
                  The metrics that matter for growing a SaaS business. Tracked weekly, reported monthly, reviewed quarterly.
                </p>
                <BulletList items={[
                  "MRR/ARR tracking with month-over-month growth rate (target: 15%+ MoM in first year)",
                  "Customer acquisition: new subscribers per month, by tier (Starter, Professional, Enterprise)",
                  "Churn rate: logo churn and revenue churn, tracked by cohort and tier (target < 5% monthly)",
                  "Feature usage analytics: which tools are used most frequently, session duration, feature adoption curves",
                  "NPS score: quarterly survey, track by customer segment (target > 50)",
                  "Support ticket volume and resolution time: first response < 4h, resolution < 24h",
                  "Revenue per customer: ARPU trending, upsell/cross-sell conversion rates",
                  "CAC payback period: target < 6 months for Professional tier, < 3 months for Enterprise",
                  "Free-to-paid conversion rate: target 5% of free calculator users convert within 30 days",
                ]} />
              </ExpandableSection>
            </ScrollReveal>

            {/* 3.5 Competitor Monitoring */}
            <ScrollReveal delay={200}>
              <ExpandableSection title="3.5 Competitor Monitoring" icon={Radar} iconGradient="from-red-500 to-red-600">
                <p className="text-sm text-navy-500 mb-4">
                  Know what the competition is doing before they do it. Track feature releases, pricing changes, and new market entrants.
                </p>
                <BulletList items={[
                  "Track competitor feature releases: Freightos, Flexport, project44, FourKites weekly changelog monitoring",
                  "Monitor competitor pricing changes: set up alerts for pricing page modifications (Visualping or similar)",
                  "Alert on new entrants to the FTZ analytics space (currently zero competitors — defend this moat)",
                  "Track market share indicators: website traffic trends (SimilarWeb), job postings (hiring = growing), funding rounds",
                  "Social listening: freight industry subreddits, LinkedIn groups, FreightWaves commentary for competitor mentions",
                  "Patent monitoring: track new patent filings in logistics AI/ML, FTZ optimization, tariff classification",
                ]} />
              </ExpandableSection>
            </ScrollReveal>

            {/* Phase 3 Deliverables */}
            <ScrollReveal delay={250}>
              <DeliverableList items={[
                "Monitoring dashboard specification (Grafana/Datadog layout with all metrics)",
                "Alert playbook: who gets notified, when, how (PagerDuty/Slack escalation chain)",
                "KPI definitions and targets document (every metric, target, owner, frequency)",
                "Monthly reporting template (executive summary, metrics, trends, action items)",
                "Quarterly business review template (deep-dive analysis, competitive landscape update, roadmap review)",
              ]} />
            </ScrollReveal>
          </div>
        </div>
      </section>


      {/* ═══════════════════════════════════════════════════════════════
          PHASE 4: OUTLINE (The Full Platform Spec)
      ═══════════════════════════════════════════════════════════════ */}
      <section id="outline" className="py-24 px-6 bg-white scroll-mt-24">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="flex items-center gap-4 mb-3">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg">
                <Layout className="w-7 h-7 text-white" />
              </div>
              <div>
                <span className="text-sm font-bold text-amber-600 uppercase tracking-wider">Phase 4</span>
                <h2 className="text-4xl md:text-5xl font-bold text-navy-900">Outline</h2>
              </div>
              <span className="ml-auto text-sm font-medium text-navy-400 bg-amber-50 px-4 py-2 rounded-full border border-amber-100">Full Platform Spec</span>
            </div>
            <p className="text-lg text-navy-500 max-w-3xl mb-10">
              The complete platform specification — every page, every feature, every API endpoint, every database table.
              This is the blueprint that an engineering team uses to build the production platform.
            </p>
          </ScrollReveal>

          <div className="space-y-4">
            {/* 4.1 Platform Architecture Outline */}
            <ScrollReveal>
              <ExpandableSection title="4.1 Platform Architecture Outline" icon={Server} iconGradient="from-amber-500 to-amber-600" defaultOpen={true}>
                <p className="text-sm text-navy-500 mb-4">
                  Complete inventory of every component in the platform — nothing left unspecified.
                </p>
                <BulletList items={[
                  "Complete component inventory: every page (40+), every feature, every API endpoint (25+), every background job",
                  "Data model: every entity, relationship, and field — Users, Organizations, Shipments, HTS Codes, Routes, FTZ Entries, Calculations, AI Results",
                  "API specification: every endpoint with request/response format, authentication, rate limits, error codes (OpenAPI 3.0 spec)",
                  "User roles and permissions matrix: Admin, Operations Manager, Analyst, Viewer — RBAC with row-level security",
                  "Integration points with external systems: carrier APIs, customs brokers, FTZ operators, 3PLs, ERP connectors",
                  "Event architecture: domain events (ShipmentCreated, DutyRateChanged, ComplianceAlertTriggered) for async processing",
                ]} />
              </ExpandableSection>
            </ScrollReveal>

            {/* 4.2 Feature Outline — Module 1 */}
            <ScrollReveal delay={50}>
              <ExpandableSection title="4.2a Module 1: Core Calculators" icon={Calculator} iconGradient="from-ocean-500 to-ocean-600">
                <p className="text-sm text-navy-500 mb-4">
                  The foundational calculation tools that every user interacts with. Pure TypeScript, browser-side, sharing via URL params.
                </p>

                {[
                  {
                    name: "Landed Cost Calculator",
                    details: "Inputs: unit cost (origin currency), units/container, shipping cost, duty rate (from HTS lookup), insurance rate, customs broker fee, inland freight, MPF (0.3464%), HMF (0.125%), bond cost, exam fee probability. Outputs: per-unit breakdown for each cost component, total landed cost, margin analysis at wholesale and retail. Edge cases: multi-currency conversion, reefer premium toggle, partial container loads, DDP vs FOB vs CIF Incoterm switching."
                  },
                  {
                    name: "Unit Economics Calculator",
                    details: "Full value chain model: $0.10 origin -> $0.50 landed -> $2.00 wholesale -> $5.00 retail. Shows margin at each step, contribution margin per unit, break-even volume, sensitivity analysis on origin cost and duty rate changes. Interactive sliders for each cost component."
                  },
                  {
                    name: "Container Utilization Calculator",
                    details: "Dual constraint: volume (CBM) AND weight (kg). Container types: 20ft, 40ft, 40ft HC, reefer. Inputs: product dimensions, product weight, packaging efficiency factor. Outputs: max units (volume-limited), max units (weight-limited), effective max (lower of both), cost per unit at given shipping rate. Visual diagram showing container fill."
                  },
                  {
                    name: "Duty/Tariff Estimator",
                    details: "HTS code lookup via Typesense (fuzzy search on 100K+ entries). Inputs: product description or HTS code, country of origin. Outputs: general duty rate, special program rates (GSP, FTA), Section 301 surcharge, AD/CVD rates if applicable. Shows effective total duty rate with all components broken down."
                  },
                  {
                    name: "FTZ Savings Analyzer",
                    details: "The #1 differentiator. Compare duty-locked rate (at FTZ entry) vs. current rate. Model incremental withdrawal over 6-24 months. Show cumulative savings, cash flow deferral value, break-even point for FTZ entry costs. Scenario comparison: PF vs. NPF status, different entry timing, rate change projections. Critical warning for permanent status elections."
                  },
                ].map((feature) => (
                  <div key={feature.name} className="mt-3 bg-ocean-50/50 rounded-xl p-4 border border-ocean-100">
                    <h5 className="text-sm font-bold text-navy-900 mb-2">{feature.name}</h5>
                    <p className="text-xs text-navy-600 leading-relaxed">{feature.details}</p>
                  </div>
                ))}
              </ExpandableSection>
            </ScrollReveal>

            {/* 4.2 Feature Outline — Module 2 */}
            <ScrollReveal delay={100}>
              <ExpandableSection title="4.2b Module 2: Route Intelligence" icon={Map} iconGradient="from-cargo-500 to-orange-600">
                <p className="text-sm text-navy-500 mb-4">
                  Visualization and comparison tools for shipping routes, carriers, and port operations.
                </p>

                {[
                  {
                    name: "Carrier/Route Comparison Tool",
                    details: "3-option presentation matching Blake's current workflow. For any origin-destination pair, show top 3 carrier options with: transit time, total cost, transshipment points, reliability score, schedule frequency. Filterable by direct vs. transshipment, carrier, cost range. Data from Maersk + CMA CGM + MSC schedule APIs."
                  },
                  {
                    name: "Interactive Shipping Route Map",
                    details: "MapLibre GL base map + deck.gl ArcLayer for routes + ScatterplotLayer for ports + GeoJsonLayer for FTZ boundaries. Great circle arcs (greatCircle: true). Click route for detail panel. Animated TripsLayer for presentation mode. Level-of-detail: fewer routes when zoomed out. Pre-computed searoute-js polylines at build time."
                  },
                  {
                    name: "Transshipment Hub Visualization",
                    details: "Hub-and-spoke network visualization centered on Panama, Singapore, Busan, Colombo, Port Klang. Show feeder routes to hub and trunk routes from hub. Dwell time at each hub. Cost implications of each transshipment point."
                  },
                  {
                    name: "Backhaul Pricing Intelligence",
                    details: "The invisible advantage: return-leg pricing on vessels going back to Asia. Show routes where backhaul discounts are available (typically 30-50% lower than headhaul). Map seasonal patterns in backhaul availability. Currently invisible in all competitor platforms."
                  },
                  {
                    name: "Vessel Schedule Aggregator",
                    details: "Unified view of sailings from Maersk, CMA CGM, MSC, Hapag-Lloyd for specific port pairs. Filter by departure window, transit time, transshipment count. Data from carrier schedule APIs (free tier). Display vessel name, service code, departure date, ETA."
                  },
                ].map((feature) => (
                  <div key={feature.name} className="mt-3 bg-amber-50/50 rounded-xl p-4 border border-amber-100">
                    <h5 className="text-sm font-bold text-navy-900 mb-2">{feature.name}</h5>
                    <p className="text-xs text-navy-600 leading-relaxed">{feature.details}</p>
                  </div>
                ))}
              </ExpandableSection>
            </ScrollReveal>

            {/* 4.2 Feature Outline — Module 3 */}
            <ScrollReveal delay={150}>
              <ExpandableSection title="4.2c Module 3: Operations Dashboard" icon={Monitor} iconGradient="from-blue-500 to-blue-600">
                <p className="text-sm text-navy-500 mb-4">
                  The daily command center for freight operations. Track shipments, analyze margins, monitor the business.
                </p>

                {[
                  {
                    name: "Shipment Tracking",
                    details: "Status pipeline: Booked -> In Transit -> At Port -> Customs Clearance -> In FTZ -> Released -> Delivered. Map view with live positions. List view with sort/filter by status, carrier, origin, destination. Estimated vs. actual arrival tracking. Exception alerts (delays, holds, exams)."
                  },
                  {
                    name: "Cost/Margin Analysis",
                    details: "Per shipment, per product, per route profitability views. Landed cost vs. budget variance. Margin trending over time (is profitability improving?). Cost component breakdown charts. Identify highest-margin and lowest-margin routes/products."
                  },
                  {
                    name: "Cold Chain vs. General Cargo Split View",
                    details: "Separate dashboards for temperature-controlled and general cargo. Reefer container premium tracking. Spoilage/loss rates. Cold chain compliance status. General cargo volume and margin trends."
                  },
                  {
                    name: "Partner/Fulfillment Center Status",
                    details: "Track 3PL partners: inventory levels, processing times, shipping performance. FTZ operator status: zone utilization, withdrawal queue, available capacity. Customs broker performance: clearance times, error rates."
                  },
                  {
                    name: "Activity Feed & Notifications",
                    details: "Chronological feed of all system events: shipment updates, compliance alerts, rate changes, AI agent recommendations. Configurable notifications: email, Slack, SMS by event type and severity. Daily digest email option."
                  },
                ].map((feature) => (
                  <div key={feature.name} className="mt-3 bg-blue-50/50 rounded-xl p-4 border border-blue-100">
                    <h5 className="text-sm font-bold text-navy-900 mb-2">{feature.name}</h5>
                    <p className="text-xs text-navy-600 leading-relaxed">{feature.details}</p>
                  </div>
                ))}
              </ExpandableSection>
            </ScrollReveal>

            {/* 4.2 Feature Outline — Module 4 */}
            <ScrollReveal delay={200}>
              <ExpandableSection title="4.2d Module 4: AI Agents" icon={Bot} iconGradient="from-purple-500 to-violet-600">
                <p className="text-sm text-navy-500 mb-4">
                  Six autonomous AI agents that handle the heavy lifting — tariff classification, route optimization, cost prediction,
                  compliance monitoring, FTZ strategy, and trade intelligence.
                </p>

                {[
                  {
                    name: "Tariff Classification Agent",
                    details: "Input: product description (free text or structured). Process: semantic search against 100K+ HTS codes using pgvector embeddings, then Claude API reasoning chain to select the best 10-digit code. Output: HTS code, duty rate, confidence score (0-100%), reasoning explanation, alternative codes. Fallback: flag for human review if confidence < 80%."
                  },
                  {
                    name: "Route Optimization Agent",
                    details: "Input: origin port, destination port, cargo type, priority (cost vs speed). Process: query all carrier schedules, score each option on cost + transit time + reliability + transshipment risk + backhaul availability. Output: ranked top 3 recommendations with full reasoning. Learning: track which recommendations users accept to improve future scoring."
                  },
                  {
                    name: "Cost Prediction Agent",
                    details: "Input: product details, origin, destination, target date range. Process: time-series model on historical landed costs + tariff rate trends + seasonal freight patterns + fuel surcharge projections. Output: predicted landed cost with confidence interval, component-level breakdown, key risk factors. Horizon: 7-day, 30-day, 90-day forecasts."
                  },
                  {
                    name: "Compliance Monitoring Agent",
                    details: "Continuous monitoring: ISF filing deadlines (24h before departure), document completeness checks, HTS classification validation, AD/CVD order matching, UFLPA risk flagging. Alert types: Critical (ISF deadline in 48h), Warning (missing document), Info (regulation change). Integration: Slack, email, SMS, dashboard notification."
                  },
                  {
                    name: "FTZ Strategy Optimizer",
                    details: "Input: product details, duty rates, projected volume, cash flow constraints. Process: model PF vs NPF status, entry timing optimization, withdrawal scheduling based on demand forecasts, Monte Carlo simulation for rate change scenarios. Output: recommended strategy with projected savings, withdrawal calendar, risk analysis. Warning: permanent election status highlighted prominently."
                  },
                  {
                    name: "Trade Intelligence Agent",
                    details: "Continuous analysis: Census trade data for volume trends, competitor import patterns via ImportGenius, tariff policy announcements, market pricing trends. Output: weekly intelligence digest, real-time alerts for significant changes (e.g., new AD/CVD order on your product category), quarterly market outlook reports. Proactive: surfaces opportunities (e.g., 'Thailand exports of HTS 6402 up 30% — investigate sourcing')."
                  },
                ].map((feature) => (
                  <div key={feature.name} className="mt-3 bg-purple-50/50 rounded-xl p-4 border border-purple-100">
                    <h5 className="text-sm font-bold text-navy-900 mb-2">{feature.name}</h5>
                    <p className="text-xs text-navy-600 leading-relaxed">{feature.details}</p>
                  </div>
                ))}
              </ExpandableSection>
            </ScrollReveal>

            {/* 4.2 Feature Outline — Module 5 */}
            <ScrollReveal delay={250}>
              <ExpandableSection title="4.2e Module 5: Knowledge Base" icon={BookOpen} iconGradient="from-teal-500 to-teal-600">
                <p className="text-sm text-navy-500 mb-4">
                  Comprehensive reference library that turns the platform into the definitive resource for international trade operations.
                </p>

                {[
                  {
                    name: "Import Process SOPs",
                    details: "6-step flow documented in detail: Source -> Ship -> Clear -> FTZ -> Fulfill -> Sell. Each step has checklists, required documents, common mistakes, timeline expectations, cost ranges. Interactive flowchart with click-to-expand detail."
                  },
                  {
                    name: "FTZ Operations Guide",
                    details: "Everything about Foreign Trade Zones: how to apply for activation, PF vs NPF status elections (with irreversibility warnings), weekly entry procedures, withdrawal processes, recordkeeping requirements, CBP audit preparation. Covers 19 CFR Part 146 in plain English."
                  },
                  {
                    name: "Compliance Checklists",
                    details: "By product category: apparel (fiber content labeling, country of origin marking), food/cold chain (FDA prior notice, USDA APHIS permits, temperature logging), consumer goods (CPSC requirements, FCC if electronic). By country: Vietnam, Thailand, Indonesia, Cambodia — specific documentation requirements."
                  },
                  {
                    name: "Documentation Requirements Matrix",
                    details: "Complete matrix: Bill of Lading, Commercial Invoice, Packing List, ISF, Certificate of Origin, Phytosanitary Certificate, FDA Prior Notice, Customs Bond, Power of Attorney, Entry Summary (CBP 7501). For each: who prepares it, when it's needed, required fields, common errors."
                  },
                  {
                    name: "Tariff Classification Guide",
                    details: "How to determine HTS codes: General Rules of Interpretation (GRI 1-6), Section and Chapter notes, real-world examples from CBP CROSS rulings. Common classification errors and their penalties ($600M+ collected by CBP annually). When to use a customs broker vs. self-classify."
                  },
                ].map((feature) => (
                  <div key={feature.name} className="mt-3 bg-teal-50/50 rounded-xl p-4 border border-teal-100">
                    <h5 className="text-sm font-bold text-navy-900 mb-2">{feature.name}</h5>
                    <p className="text-xs text-navy-600 leading-relaxed">{feature.details}</p>
                  </div>
                ))}
              </ExpandableSection>
            </ScrollReveal>

            {/* 4.2 Feature Outline — Module 6 */}
            <ScrollReveal delay={300}>
              <ExpandableSection title="4.2f Module 6: Data Pipeline" icon={Workflow} iconGradient="from-navy-500 to-navy-600">
                <p className="text-sm text-navy-500 mb-4">
                  The invisible infrastructure that powers everything. 26+ data sources, continuous scraping, quality assurance, search indexing.
                </p>

                {[
                  {
                    name: "Scraper Infrastructure",
                    details: "Crawlee + Playwright for JavaScript-rendered government sites. Custom HTTP scrapers for API-based sources. Proxy rotation for rate-limited sites. Scheduler: Cron-based with dead-letter retry queue. Monitoring: success/failure dashboards, alert on consecutive failures."
                  },
                  {
                    name: "Data Lake (PostgreSQL + pgvector)",
                    details: "Normalized schema for all data types: tariff codes, duty rates, port data, carrier routes, FTZ locations, compliance rulings. pgvector extension for semantic search on CBP rulings and product descriptions. Partitioned tables for time-series data (historical rates, vessel positions)."
                  },
                  {
                    name: "Search Engine (Typesense)",
                    details: "Primary index: HTS codes (100K+ entries) with fuzzy search, faceted filtering by chapter/heading/subheading. Secondary index: ports (3,700+) with geo-search. Tertiary index: CBP rulings (50K+) with full-text search. Incremental index updates on data changes."
                  },
                  {
                    name: "Freshness Monitoring",
                    details: "Per-source SLA tracking: USITC (weekly), carrier schedules (daily), port data (monthly), FDA alerts (daily), AIS positions (real-time). Dashboard showing last successful update, next expected update, health status. Automated alerts when SLA is breached."
                  },
                  {
                    name: "Quality Assurance",
                    details: "Automated validation rules: HTS codes must be 10 digits, duty rates must be 0-100%, port coordinates must be valid lat/lng, carrier names must match known list. Cross-source validation: compare USITC HTS data against Descartes, compare carrier schedules against actual AIS data. Monthly data quality report with trending."
                  },
                ].map((feature) => (
                  <div key={feature.name} className="mt-3 bg-navy-50 rounded-xl p-4 border border-navy-200">
                    <h5 className="text-sm font-bold text-navy-900 mb-2">{feature.name}</h5>
                    <p className="text-xs text-navy-600 leading-relaxed">{feature.details}</p>
                  </div>
                ))}
              </ExpandableSection>
            </ScrollReveal>

            {/* 4.3 User Journey Maps */}
            <ScrollReveal delay={350}>
              <ExpandableSection title="4.3 User Journey Maps" icon={Workflow} iconGradient="from-indigo-500 to-indigo-600">
                <p className="text-sm text-navy-500 mb-4">
                  Five key user journeys that define how people use the platform day-to-day.
                </p>

                {[
                  {
                    name: "New User Onboarding",
                    steps: "Landing page -> Sign up (email) -> Guided tour (3 screens) -> Try free calculator -> See results -> Prompt to upgrade for FTZ analyzer -> Convert or bookmark",
                  },
                  {
                    name: "Freight Quote Workflow",
                    steps: "Enter origin/destination -> Select cargo type -> Compare 3 carrier options -> Add landed cost breakdown -> Generate PDF proposal -> Send to customer",
                  },
                  {
                    name: "Import Workflow (End-to-End)",
                    steps: "Product sourcing research -> Landed cost estimate -> Book carrier -> ISF filing reminder -> Track shipment -> Customs clearance -> FTZ entry -> Incremental withdrawal -> Fulfillment -> Margin analysis",
                  },
                  {
                    name: "FTZ Strategy Workflow",
                    steps: "Evaluate FTZ eligibility -> Compare PF vs NPF -> Model duty savings -> Decide entry timing -> Enter goods -> Set withdrawal schedule -> Monitor rate changes -> Adjust strategy -> Report realized savings",
                  },
                  {
                    name: "Daily Dashboard Workflow",
                    steps: "Morning login -> Review shipment status pipeline -> Check compliance alerts -> Review AI recommendations -> Approve/reject suggestions -> Check margin dashboard -> Plan today's actions",
                  },
                ].map((journey) => (
                  <div key={journey.name} className="mt-3 bg-indigo-50/50 rounded-xl p-4 border border-indigo-100">
                    <h5 className="text-sm font-bold text-navy-900 mb-2">{journey.name}</h5>
                    <div className="flex flex-wrap gap-1.5">
                      {journey.steps.split(" -> ").map((step, i, arr) => (
                        <span key={i} className="inline-flex items-center gap-1">
                          <span className="text-xs bg-white text-navy-700 px-2.5 py-1 rounded-lg border border-indigo-100 font-medium">{step}</span>
                          {i < arr.length - 1 && <ArrowRight className="w-3 h-3 text-indigo-300" />}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </ExpandableSection>
            </ScrollReveal>

            {/* 4.4 Technical Specifications */}
            <ScrollReveal delay={400}>
              <ExpandableSection title="4.4 Technical Specifications" icon={Code2} iconGradient="from-navy-500 to-navy-700">
                <p className="text-sm text-navy-500 mb-4">
                  The engineering-level detail needed to build the platform. API endpoints, database tables, cron jobs, and environment configuration.
                </p>
                <BulletList items={[
                  "API endpoint specifications: 25+ endpoints including /api/calculate/landed-cost, /api/calculate/ftz-savings, /api/hts/search, /api/routes/compare, /api/export/pdf, /api/agents/classify, /api/agents/optimize-route — each with OpenAPI 3.0 spec",
                  "Database table definitions: 15+ tables including users, organizations, shipments, hts_codes, duty_rates, routes, ftz_entries, calculations, ai_results, audit_logs — with indexes, constraints, and RLS policies",
                  "Search index configurations: Typesense collections for hts_codes (schema: code, description, duty_rate, chapter, heading, country_rates), ports (schema: code, name, country, lat, lng, throughput), rulings (schema: ruling_number, date, description, hts_codes, full_text)",
                  "Cron job schedules: HTS data refresh (weekly Sunday 2am), carrier schedules (daily 6am), FDA alerts (daily 8am), port data (monthly 1st), AIS positions (every 15 min for tracked vessels), data quality audit (weekly Monday 3am)",
                  "Environment variables: 30+ env vars across Vercel, database, search, AI, carrier APIs, monitoring — documented with descriptions, required/optional, and example values",
                  "Secrets management: Vercel environment variables for production, .env.local for development, documented rotation schedule for API keys",
                ]} />
              </ExpandableSection>
            </ScrollReveal>

            {/* Phase 4 Deliverables */}
            <ScrollReveal delay={450}>
              <DeliverableList items={[
                "Complete platform specification document (component inventory, data model, API spec, permissions matrix)",
                "Feature specification for each of the 6 modules (calculators, route intelligence, operations, AI agents, knowledge base, data pipeline)",
                "User journey maps for 5 key workflows (onboarding, quoting, importing, FTZ strategy, daily operations)",
                "Technical specifications (API docs, database schema, search configs, cron schedules, env vars)",
                "API documentation outline (OpenAPI 3.0 spec for all 25+ endpoints)",
              ]} />
            </ScrollReveal>
          </div>
        </div>
      </section>


      {/* ===== BOTTOM CTA ===== */}
      <section className="py-20 px-6 bg-gradient-to-r from-ocean-600 via-indigo-600 to-ocean-700">
        <div className="max-w-3xl mx-auto text-center">
          <ScrollReveal>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Move Forward?
            </h2>
            <p className="text-lg text-ocean-100 mb-8 max-w-xl mx-auto">
              View the full service agreement, explore the platform demo,
              or dive into the monetization strategy.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/agreement"
                className="inline-flex items-center gap-2 bg-white text-ocean-700 font-bold px-8 py-4 rounded-xl text-base hover:bg-ocean-50 transition-all hover:scale-[1.02] shadow-premium"
              >
                <FileText className="w-5 h-5" />
                View Full Proposal
              </Link>
              <Link
                href="/monetization"
                className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white font-bold px-8 py-4 rounded-xl text-base border border-white/20 hover:bg-white/20 transition-all"
              >
                <DollarSign className="w-5 h-5" />
                Monetization Strategy
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="bg-navy-900 text-navy-300 py-12 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-ocean-500 to-indigo-600 flex items-center justify-center">
              <Ship className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-white">Shipping<span className="text-ocean-400">Savior</span></span>
          </div>
          <p className="text-sm text-navy-400">AI-Powered International Logistics Platform</p>
          <p className="text-xs text-navy-500 mt-4">Built with Next.js, TypeScript, and a deep understanding of international trade.</p>
        </div>
      </footer>
    </main>
  );
}

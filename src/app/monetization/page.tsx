"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import ScrollReveal from "@/components/ScrollReveal";
import {
  DollarSign, Layers, ArrowRight, Check, Zap, Globe,
  BarChart3, Ship, TrendingUp, Database, Lock, Cpu,
  Shield, Users, Target, Rocket, Crown, Star,
  ArrowUpRight, CircleDollarSign, Building2, Code2,
  ShoppingCart, Brain, ChevronRight, Minus,
} from "lucide-react";

/* ─── Tier Data ─── */
const tiers = [
  {
    name: "Starter",
    price: 299,
    annual: 249,
    description: "For small importers getting started with data-driven logistics",
    icon: Zap,
    gradient: "from-ocean-500 to-ocean-600",
    borderColor: "border-ocean-200",
    popular: false,
    features: [
      "Landed cost calculator",
      "HTS code lookup (100 searches/mo)",
      "Container utilization calculator",
      "Basic route comparison (3 routes)",
      "Email support",
      "1 user seat",
    ],
    excluded: [
      "FTZ savings analyzer",
      "Tariff scenario modeling",
      "API access",
      "Custom integrations",
      "Data & intelligence reports",
    ],
  },
  {
    name: "Professional",
    price: 799,
    annual: 666,
    description: "For growing freight operations that need FTZ strategy and automation",
    icon: TrendingUp,
    gradient: "from-indigo-500 to-indigo-600",
    borderColor: "border-indigo-300",
    popular: true,
    features: [
      "Everything in Starter",
      "FTZ savings analyzer",
      "Unlimited HTS lookups",
      "Tariff scenario modeling",
      "Backhaul pricing intelligence",
      "Shipment tracking dashboard",
      "Transaction tracking (50/mo)",
      "Priority support",
      "5 user seats",
    ],
    excluded: [
      "API access",
      "Custom integrations",
      "White-label options",
    ],
  },
  {
    name: "Enterprise",
    price: 2499,
    annual: 2082,
    description: "For large-scale operations needing full platform access and API licensing",
    icon: Crown,
    gradient: "from-purple-500 to-purple-600",
    borderColor: "border-purple-200",
    popular: false,
    features: [
      "Everything in Professional",
      "Unlimited transactions",
      "White-label API access",
      "Custom integrations",
      "Data & intelligence reports",
      "FTZ consulting sessions (2/mo)",
      "Dedicated account manager",
      "Custom SLAs",
      "Unlimited user seats",
      "SSO & advanced security",
    ],
    excluded: [],
  },
];

/* ─── Revenue Streams ─── */
const revenueStreams = [
  {
    title: "Platform Subscriptions",
    description: "Tiered monthly access to calculators, route tools, and the operations dashboard. Predictable recurring revenue with clear upgrade paths.",
    icon: Layers,
    gradient: "from-ocean-500 to-ocean-600",
    bgLight: "bg-ocean-50",
    revenue: "$299-2,499/mo per customer",
    model: "Recurring MRR",
  },
  {
    title: "Transaction Fees",
    description: "Per-shipment tracking fee for every container processed through the platform. Similar to Flexport's per-shipment model — scales with customer volume.",
    icon: CircleDollarSign,
    gradient: "from-emerald-500 to-emerald-600",
    bgLight: "bg-emerald-50",
    revenue: "$15-50 per shipment",
    model: "Usage-based",
  },
  {
    title: "FTZ Consulting as a Service",
    description: "Premium FTZ strategy analysis engagements — the thing no competitor offers. Includes duty-lock modeling, withdrawal scheduling, and zone selection.",
    icon: Shield,
    gradient: "from-indigo-500 to-indigo-600",
    bgLight: "bg-indigo-50",
    revenue: "$2,500 per engagement",
    model: "High-margin services",
  },
  {
    title: "Data & Intelligence",
    description: "Sell anonymized trade lane data, tariff trend reports, and market intelligence. Network effects make data more valuable as more users join.",
    icon: Database,
    gradient: "from-purple-500 to-purple-600",
    bgLight: "bg-purple-50",
    revenue: "$500-2,000/mo",
    model: "Data monetization",
  },
  {
    title: "White-Label API",
    description: "License the calculation engines (landed cost, FTZ, route optimization) to other logistics platforms, ERPs, and freight management tools.",
    icon: Code2,
    gradient: "from-teal-500 to-teal-600",
    bgLight: "bg-teal-50",
    revenue: "$1,000-5,000/mo",
    model: "API licensing",
  },
  {
    title: "Fulfillment Marketplace",
    description: "2-5% referral commission on 3PL and fulfillment partnerships. Connect importers with warehouses, creating a two-sided marketplace.",
    icon: ShoppingCart,
    gradient: "from-cargo-500 to-cargo-600",
    bgLight: "bg-amber-50",
    revenue: "2-5% commission",
    model: "Marketplace fees",
  },
];

/* ─── GTM Phases ─── */
const gtmPhases = [
  {
    phase: 1,
    title: "Free Tools for Lead Generation",
    description: "Launch free calculators (landed cost, container utilization) as content marketing magnets. Build organic traffic, capture emails, convert to paid subscribers.",
    timeline: "Months 1-6",
    metrics: "10K monthly users, 500 free accounts, 50 paid conversions",
    color: "border-ocean-500",
    dotColor: "bg-ocean-500",
  },
  {
    phase: 2,
    title: "Freight Forwarder Partnerships",
    description: "White-label tools for established freight forwarders. They get branded calculators; we get distribution and transaction volume.",
    timeline: "Months 6-12",
    metrics: "10 partnership deals, $50K MRR from white-label",
    color: "border-indigo-500",
    dotColor: "bg-indigo-500",
  },
  {
    phase: 3,
    title: "Data Marketplace Launch",
    description: "Aggregate anonymized trade lane data from platform usage. Sell tariff trend reports and market intelligence to enterprises.",
    timeline: "Months 12-18",
    metrics: "100+ data subscribers, $100K ARR from data alone",
    color: "border-purple-500",
    dotColor: "bg-purple-500",
  },
  {
    phase: 4,
    title: "Enterprise API Licensing",
    description: "License calculation engines to TMS platforms, ERPs, and customs brokers. High-margin, high-retention B2B revenue.",
    timeline: "Months 18-24",
    metrics: "20 API clients, $200K+ MRR",
    color: "border-emerald-500",
    dotColor: "bg-emerald-500",
  },
];

/* ─── Competitive Moat Items ─── */
const moatItems = [
  {
    title: "FTZ Strategy Tooling",
    description: "Nobody else has automated FTZ savings analysis. Duty-rate locking, incremental withdrawal modeling, zone selection — all unique to our platform.",
    icon: Shield,
    strength: 95,
    gradient: "from-emerald-500 to-emerald-600",
  },
  {
    title: "Cold Chain + General Cargo Hybrid",
    description: "Competitors focus on one or the other. We handle both with specialized cost models, creating a unified platform for diversified importers.",
    icon: Ship,
    strength: 85,
    gradient: "from-ocean-500 to-ocean-600",
  },
  {
    title: "Backhaul Intelligence",
    description: "Invisible in all competitor platforms. We surface return-leg pricing opportunities that can reduce shipping costs 10-25%.",
    icon: TrendingUp,
    strength: 90,
    gradient: "from-indigo-500 to-indigo-600",
  },
  {
    title: "Data Network Effects",
    description: "More users = better route/pricing data = more accurate tools = more users. Classic data flywheel that compounds over time.",
    icon: Globe,
    strength: 80,
    gradient: "from-purple-500 to-purple-600",
  },
];

/* ─── Unit Economics ─── */
const unitEconomics = [
  { label: "CAC", sublabel: "Customer Acquisition Cost", value: "$500", detail: "Content marketing + free tools funnel", color: "text-ocean-600", bg: "bg-ocean-50", border: "border-ocean-200" },
  { label: "LTV", sublabel: "Lifetime Value", value: "$9,600", detail: "Avg $800/mo x 12 months retention", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
  { label: "LTV:CAC", sublabel: "Ratio", value: "19:1", detail: "Excellent — 3:1 is considered healthy", color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-200" },
  { label: "Gross Margin", sublabel: "Software Margin", value: "85%+", detail: "Pure software, minimal COGS", color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-200" },
  { label: "Payback", sublabel: "Payback Period", value: "<1 mo", detail: "First month subscription covers CAC", color: "text-teal-600", bg: "bg-teal-50", border: "border-teal-200" },
];

/* ─── Revenue Calculator Component ─── */
function RevenueCalculator() {
  const [starterSubs, setStarterSubs] = useState(30);
  const [proSubs, setProSubs] = useState(15);
  const [enterpriseSubs, setEnterpriseSubs] = useState(5);
  const [monthlyShipments, setMonthlyShipments] = useState(200);
  const [ftzEngagements, setFtzEngagements] = useState(3);

  const subscriptionMRR = starterSubs * 299 + proSubs * 799 + enterpriseSubs * 2499;
  const transactionRevenue = monthlyShipments * 32; // avg $32 per shipment
  const consultingRevenue = ftzEngagements * 2500;
  const totalMRR = subscriptionMRR + transactionRevenue + consultingRevenue;
  const arr = totalMRR * 12;

  const sliders = [
    { label: "Starter Subscribers", value: starterSubs, setter: setStarterSubs, max: 100, unit: "", color: "bg-ocean-500" },
    { label: "Professional Subscribers", value: proSubs, setter: setProSubs, max: 50, unit: "", color: "bg-indigo-500" },
    { label: "Enterprise Subscribers", value: enterpriseSubs, setter: setEnterpriseSubs, max: 20, unit: "", color: "bg-purple-500" },
    { label: "Monthly Shipments Tracked", value: monthlyShipments, setter: setMonthlyShipments, max: 1000, unit: "", color: "bg-emerald-500" },
    { label: "FTZ Consulting Engagements/mo", value: ftzEngagements, setter: setFtzEngagements, max: 20, unit: "", color: "bg-teal-500" },
  ];

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Sliders */}
      <div className="space-y-6">
        {sliders.map((s) => (
          <div key={s.label}>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-navy-700">{s.label}</label>
              <span className="text-sm font-bold text-navy-900">{s.value}{s.unit}</span>
            </div>
            <input
              type="range"
              min={0}
              max={s.max}
              value={s.value}
              onChange={(e) => s.setter(Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, ${s.color === "bg-ocean-500" ? "#2563eb" : s.color === "bg-indigo-500" ? "#6366f1" : s.color === "bg-purple-500" ? "#a855f7" : s.color === "bg-emerald-500" ? "#10b981" : "#14b8a6"} ${(s.value / s.max) * 100}%, #e2e8f0 ${(s.value / s.max) * 100}%)`,
              }}
            />
          </div>
        ))}
      </div>

      {/* Results */}
      <div className="space-y-4">
        <div className="bg-gradient-to-br from-ocean-50 to-indigo-50 rounded-2xl p-6 border border-ocean-200">
          <p className="text-sm font-medium text-ocean-600 mb-1">Subscription MRR</p>
          <p className="text-3xl font-bold text-navy-900">${subscriptionMRR.toLocaleString()}</p>
          <div className="mt-3 space-y-1 text-xs text-navy-500">
            <div className="flex justify-between"><span>{starterSubs} Starter x $299</span><span>${(starterSubs * 299).toLocaleString()}</span></div>
            <div className="flex justify-between"><span>{proSubs} Professional x $799</span><span>${(proSubs * 799).toLocaleString()}</span></div>
            <div className="flex justify-between"><span>{enterpriseSubs} Enterprise x $2,499</span><span>${(enterpriseSubs * 2499).toLocaleString()}</span></div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-200">
          <p className="text-sm font-medium text-emerald-600 mb-1">Transaction Revenue</p>
          <p className="text-3xl font-bold text-navy-900">${transactionRevenue.toLocaleString()}<span className="text-base font-normal text-navy-400">/mo</span></p>
          <p className="text-xs text-navy-500 mt-1">{monthlyShipments} shipments x ~$32 avg fee</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl p-6 border border-purple-200">
          <p className="text-sm font-medium text-purple-600 mb-1">Consulting Revenue</p>
          <p className="text-3xl font-bold text-navy-900">${consultingRevenue.toLocaleString()}<span className="text-base font-normal text-navy-400">/mo</span></p>
          <p className="text-xs text-navy-500 mt-1">{ftzEngagements} FTZ engagements x $2,500</p>
        </div>

        {/* Total */}
        <div className="bg-gradient-to-r from-ocean-600 via-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-sm font-medium text-ocean-100">Total MRR</p>
              <p className="text-4xl font-bold">${totalMRR.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-ocean-100">Projected ARR</p>
              <p className="text-4xl font-bold">${arr.toLocaleString()}</p>
            </div>
          </div>
          {/* Visual bar */}
          <div className="flex rounded-full overflow-hidden h-3 bg-white/20">
            <div className="bg-ocean-300" style={{ width: `${(subscriptionMRR / totalMRR) * 100}%` }} title="Subscriptions" />
            <div className="bg-emerald-300" style={{ width: `${(transactionRevenue / totalMRR) * 100}%` }} title="Transactions" />
            <div className="bg-purple-300" style={{ width: `${(consultingRevenue / totalMRR) * 100}%` }} title="Consulting" />
          </div>
          <div className="flex justify-between mt-2 text-xs text-white/70">
            <span>Subscriptions</span>
            <span>Transactions</span>
            <span>Consulting</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ─── */
export default function MonetizationPage() {
  const [annual, setAnnual] = useState(false);

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
            <DollarSign className="w-4 h-4 text-ocean-600" />
            <span className="text-sm font-medium text-navy-600">SaaS Monetization Strategy</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 text-navy-900">
            Revenue{" "}
            <span className="gradient-text-hero">Engine</span>
          </h1>

          <p className="text-xl text-navy-500 max-w-2xl mx-auto mb-6 leading-relaxed">
            Six revenue streams, three pricing tiers, and a go-to-market strategy
            designed to build a $10M+ ARR logistics SaaS platform.
          </p>

          <div className="flex flex-wrap gap-4 justify-center text-sm">
            {["6 Revenue Streams", "85%+ Gross Margin", "19:1 LTV:CAC"].map((tag) => (
              <span key={tag} className="bg-white/80 border border-navy-200 rounded-full px-4 py-2 text-navy-600 font-medium shadow-soft">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ===== REVENUE STREAMS ===== */}
      <section className="py-24 px-6 section-alt">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <p className="text-sm font-semibold text-ocean-600 tracking-wider uppercase mb-3">Revenue Model</p>
              <h2 className="text-4xl md:text-5xl font-bold text-navy-900 mb-5">
                Six Revenue <span className="gradient-text">Streams</span>
              </h2>
              <p className="text-lg text-navy-500 max-w-2xl mx-auto">
                Diversified revenue across subscriptions, usage fees, consulting,
                data, API licensing, and marketplace commissions.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {revenueStreams.map((stream, i) => (
              <ScrollReveal key={stream.title} delay={i * 100}>
                <div className="bg-white rounded-2xl p-6 border border-navy-200/60 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300 h-full">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stream.gradient} flex items-center justify-center mb-4 shadow-md`}>
                    <stream.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-navy-900 mb-2">{stream.title}</h3>
                  <p className="text-sm text-navy-500 leading-relaxed mb-4">{stream.description}</p>
                  <div className="flex items-center justify-between pt-4 border-t border-navy-100">
                    <span className="text-xs font-medium text-navy-400">{stream.model}</span>
                    <span className="text-sm font-bold text-ocean-600">{stream.revenue}</span>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PRICING TIERS ===== */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-12">
              <p className="text-sm font-semibold text-ocean-600 tracking-wider uppercase mb-3">Pricing</p>
              <h2 className="text-4xl md:text-5xl font-bold text-navy-900 mb-5">
                Three <span className="gradient-text">Tiers</span>
              </h2>
              <p className="text-lg text-navy-500 max-w-2xl mx-auto mb-8">
                Simple, transparent pricing that scales with your operations.
              </p>

              {/* Annual toggle */}
              <div className="inline-flex items-center gap-3 bg-navy-50 rounded-full p-1.5">
                <button
                  onClick={() => setAnnual(false)}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${!annual ? "bg-white shadow-soft text-navy-900" : "text-navy-500"}`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setAnnual(true)}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${annual ? "bg-white shadow-soft text-navy-900" : "text-navy-500"}`}
                >
                  Annual <span className="text-emerald-600 text-xs ml-1">Save 17%</span>
                </button>
              </div>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-6">
            {tiers.map((tier, i) => (
              <ScrollReveal key={tier.name} delay={i * 150}>
                <div className={`relative bg-white rounded-2xl p-8 border ${tier.popular ? "border-indigo-300 shadow-premium ring-2 ring-indigo-500/20" : "border-navy-200/60 shadow-card"} hover:shadow-card-hover transition-all duration-300 h-full flex flex-col`}>
                  {tier.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-md">
                      Most Popular
                    </div>
                  )}
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tier.gradient} flex items-center justify-center mb-4 shadow-md`}>
                    <tier.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-navy-900 mb-1">{tier.name}</h3>
                  <p className="text-sm text-navy-500 mb-6">{tier.description}</p>

                  <div className="mb-6">
                    <span className="text-4xl font-bold text-navy-900">${annual ? tier.annual : tier.price}</span>
                    <span className="text-navy-400 text-sm">/mo</span>
                    {annual && (
                      <div className="text-xs text-emerald-600 font-medium mt-1">
                        Billed annually (2 months free)
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 flex-1">
                    {tier.features.map((f) => (
                      <div key={f} className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                        <span className="text-sm text-navy-600">{f}</span>
                      </div>
                    ))}
                    {tier.excluded.map((f) => (
                      <div key={f} className="flex items-start gap-2.5 opacity-40">
                        <Minus className="w-4 h-4 text-navy-300 mt-0.5 shrink-0" />
                        <span className="text-sm text-navy-400">{f}</span>
                      </div>
                    ))}
                  </div>

                  <button className={`mt-8 w-full py-3 rounded-xl font-semibold text-sm transition-all ${tier.popular ? "bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg hover:shadow-xl hover:scale-[1.02]" : "bg-navy-50 text-navy-700 hover:bg-navy-100"}`}>
                    Get Started
                  </button>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== REVENUE PROJECTIONS (CALCULATOR) ===== */}
      <section className="py-24 px-6 section-alt">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <p className="text-sm font-semibold text-ocean-600 tracking-wider uppercase mb-3">Revenue Projections</p>
              <h2 className="text-4xl md:text-5xl font-bold text-navy-900 mb-5">
                Interactive Revenue <span className="gradient-text">Calculator</span>
              </h2>
              <p className="text-lg text-navy-500 max-w-2xl mx-auto">
                Model your revenue across subscriptions, transaction fees, and FTZ consulting
                engagements. Drag the sliders to see projected MRR and ARR.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal>
            <div className="bg-white rounded-2xl p-8 border border-navy-200/60 shadow-premium">
              <RevenueCalculator />
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ===== GO-TO-MARKET STRATEGY ===== */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <p className="text-sm font-semibold text-ocean-600 tracking-wider uppercase mb-3">Go-to-Market</p>
              <h2 className="text-4xl md:text-5xl font-bold text-navy-900 mb-5">
                Four-Phase <span className="gradient-text">GTM Strategy</span>
              </h2>
              <p className="text-lg text-navy-500 max-w-2xl mx-auto">
                From free tools for lead generation to enterprise API licensing.
                Each phase builds on the last, compounding revenue and data moats.
              </p>
            </div>
          </ScrollReveal>

          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-6 top-0 bottom-0 w-px bg-navy-200 hidden md:block" />

            <div className="space-y-8">
              {gtmPhases.map((phase, i) => (
                <ScrollReveal key={phase.phase} delay={i * 150}>
                  <div className="relative md:pl-16">
                    {/* Dot */}
                    <div className={`hidden md:block absolute left-4 top-6 w-5 h-5 rounded-full ${phase.dotColor} border-4 border-white shadow-md`} />
                    <div className={`bg-white rounded-2xl p-8 border-l-4 ${phase.color} shadow-card hover:shadow-card-hover transition-all`}>
                      <div className="flex flex-wrap items-center gap-3 mb-3">
                        <span className="text-xs font-bold text-ocean-600 bg-ocean-50 px-3 py-1 rounded-full">Phase {phase.phase}</span>
                        <span className="text-xs text-navy-400">{phase.timeline}</span>
                      </div>
                      <h3 className="text-xl font-bold text-navy-900 mb-2">{phase.title}</h3>
                      <p className="text-sm text-navy-500 leading-relaxed mb-4">{phase.description}</p>
                      <div className="bg-navy-50 rounded-lg px-4 py-3">
                        <span className="text-xs font-semibold text-navy-600">Target: </span>
                        <span className="text-xs text-navy-500">{phase.metrics}</span>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== COMPETITIVE MOAT ===== */}
      <section className="py-24 px-6 section-alt">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <p className="text-sm font-semibold text-ocean-600 tracking-wider uppercase mb-3">Defensibility</p>
              <h2 className="text-4xl md:text-5xl font-bold text-navy-900 mb-5">
                Competitive <span className="gradient-text">Moat</span>
              </h2>
              <p className="text-lg text-navy-500 max-w-2xl mx-auto">
                Four layers of defensibility that make this platform impossible to replicate overnight.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-6">
            {moatItems.map((item, i) => (
              <ScrollReveal key={item.title} delay={i * 100}>
                <div className="bg-white rounded-2xl p-8 border border-navy-200/60 shadow-card hover:shadow-card-hover transition-all duration-300">
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-md`}>
                      <item.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-navy-900">{item.title}</h3>
                      <span className="text-xs text-navy-400">Moat Strength: {item.strength}%</span>
                    </div>
                  </div>
                  <p className="text-sm text-navy-500 leading-relaxed mb-4">{item.description}</p>
                  {/* Strength bar */}
                  <div className="h-2 bg-navy-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${item.gradient}`}
                      style={{ width: `${item.strength}%` }}
                    />
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== UNIT ECONOMICS ===== */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <p className="text-sm font-semibold text-ocean-600 tracking-wider uppercase mb-3">SaaS Metrics</p>
              <h2 className="text-4xl md:text-5xl font-bold text-navy-900 mb-5">
                Unit <span className="gradient-text">Economics</span>
              </h2>
              <p className="text-lg text-navy-500 max-w-2xl mx-auto">
                Best-in-class SaaS unit economics driven by low CAC (free tools funnel)
                and high LTV (sticky platform with switching costs).
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {unitEconomics.map((metric, i) => (
              <ScrollReveal key={metric.label} delay={i * 100}>
                <div className={`${metric.bg} rounded-2xl p-6 border ${metric.border} text-center`}>
                  <p className={`text-xs font-semibold ${metric.color} mb-1`}>{metric.label}</p>
                  <p className="text-3xl font-bold text-navy-900 mb-1">{metric.value}</p>
                  <p className="text-[11px] text-navy-400 leading-snug">{metric.detail}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>

          {/* Visual LTV:CAC comparison */}
          <ScrollReveal delay={200}>
            <div className="mt-12 bg-gradient-to-br from-navy-50 to-ocean-50 rounded-2xl p-8 border border-navy-200/60">
              <h3 className="text-lg font-bold text-navy-900 mb-6 text-center">LTV vs CAC Visual Comparison</h3>
              <div className="flex items-end justify-center gap-8 h-48">
                <div className="text-center">
                  <div className="w-20 bg-gradient-to-t from-ocean-500 to-ocean-400 rounded-t-lg mx-auto shadow-md" style={{ height: "24px" }} />
                  <p className="text-sm font-bold text-navy-900 mt-2">$500</p>
                  <p className="text-xs text-navy-400">CAC</p>
                </div>
                <div className="text-center">
                  <div className="w-20 bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t-lg mx-auto shadow-md" style={{ height: "192px" }} />
                  <p className="text-sm font-bold text-navy-900 mt-2">$9,600</p>
                  <p className="text-xs text-navy-400">LTV</p>
                </div>
              </div>
              <p className="text-center text-sm text-navy-500 mt-4">
                LTV is <span className="font-bold text-emerald-600">19.2x</span> the customer acquisition cost — indicating a highly efficient growth model
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="py-20 px-6 bg-gradient-to-r from-ocean-600 via-indigo-600 to-ocean-700">
        <div className="max-w-3xl mx-auto text-center">
          <ScrollReveal>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Build the Revenue Engine?
            </h2>
            <p className="text-lg text-ocean-100 mb-8 max-w-xl mx-auto">
              Let&apos;s turn this strategy into a live SaaS platform generating recurring revenue.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/agreement"
                className="inline-flex items-center gap-2 bg-white text-ocean-700 font-bold px-8 py-4 rounded-xl text-base hover:bg-ocean-50 transition-all hover:scale-[1.02] shadow-premium"
              >
                View Full Proposal
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/six-sigma"
                className="inline-flex items-center gap-2 bg-white/10 text-white border border-white/30 font-bold px-8 py-4 rounded-xl text-base hover:bg-white/20 transition-all"
              >
                Six Sigma Analysis
                <ArrowRight className="w-5 h-5" />
              </Link>
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
            AI-Powered International Logistics Platform — Built with AI Acrobatics
          </div>
        </div>
      </footer>
    </main>
  );
}

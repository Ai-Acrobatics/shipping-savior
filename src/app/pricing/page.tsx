"use client";

import Link from "next/link";
import Header from "@/components/Header";
import { motion } from "framer-motion";
import {
  Check,
  X,
  Ship,
  ArrowRight,
  Zap,
  Users,
  Shield,
  HelpCircle,
  ChevronDown,
  Star,
} from "lucide-react";
import { useState } from "react";

/* ─────────── TIERS ─────────── */

const tiers = [
  {
    name: "Explorer",
    tagline: "Free",
    price: "$0",
    period: "/month",
    annualNote: null,
    description: "Get started with core logistics tools and limited searches.",
    cta: "Get Started Free",
    ctaHref: "/register",
    highlighted: false,
    badge: null,
    features: [
      "1 user",
      "10 schedule searches/day",
      "3 calculator uses/month",
      "Community support",
      "Ad-supported experience",
    ],
  },
  {
    name: "Navigator",
    tagline: "Premium",
    price: "$299",
    period: "/month",
    annualNote: "$249/mo billed annually",
    description:
      "Full platform access for growing freight teams who need reliable data.",
    cta: "Contact Sales",
    ctaHref: "/demo",
    highlighted: true,
    badge: "RECOMMENDED",
    features: [
      "Up to 8 users",
      "Unlimited schedule search",
      "Full carrier comparison + reliability scores",
      "Contract management (up to 10 contracts)",
      "PDF exports",
      "Email support",
    ],
  },
  {
    name: "Commander",
    tagline: "Enterprise",
    price: "Custom",
    period: "",
    annualNote: null,
    description:
      "White-glove solution for NVOCCs and large freight operations.",
    cta: "Contact Sales",
    ctaHref: "/demo",
    highlighted: false,
    badge: null,
    features: [
      "20+ users (custom bundles)",
      "Everything in Navigator",
      "Unlimited contracts",
      "API access",
      "Custom integrations",
      "White-label option for NVOCCs",
      "Dedicated account manager",
    ],
  },
];

/* ─────────── COMPARISON MATRIX ─────────── */

type FeatureValue = boolean | string;

interface ComparisonFeature {
  feature: string;
  explorer: FeatureValue;
  navigator: FeatureValue;
  commander: FeatureValue;
}

const comparisonFeatures: ComparisonFeature[] = [
  { feature: "Users", explorer: "1", navigator: "Up to 8", commander: "20+ (custom)" },
  { feature: "Schedule searches", explorer: "10/day", navigator: "Unlimited", commander: "Unlimited" },
  { feature: "Calculator uses", explorer: "3/month", navigator: "Unlimited", commander: "Unlimited" },
  { feature: "Carrier comparison", explorer: false, navigator: true, commander: true },
  { feature: "Reliability scores", explorer: false, navigator: true, commander: true },
  { feature: "Contract management", explorer: false, navigator: "Up to 10", commander: "Unlimited" },
  { feature: "PDF exports", explorer: false, navigator: true, commander: true },
  { feature: "API access", explorer: false, navigator: false, commander: true },
  { feature: "Custom integrations", explorer: false, navigator: false, commander: true },
  { feature: "White-label option", explorer: false, navigator: false, commander: true },
  { feature: "Support", explorer: "Community", navigator: "Email", commander: "Dedicated manager" },
];

/* ─────────── FAQ ─────────── */

const faqs = [
  {
    q: "How does per-user pricing work for larger teams?",
    a: "Navigator includes up to 8 users. For teams needing more seats, Commander offers custom user bundles with volume discounts. Contact sales and we'll build a package that fits your organization.",
  },
  {
    q: "Can I switch plans as my team grows?",
    a: "Absolutely. You can upgrade from Explorer to Navigator at any time. Moving to Commander is handled through our sales team to ensure a smooth transition with dedicated onboarding.",
  },
  {
    q: "What data sources power the carrier comparisons?",
    a: "We aggregate real-time schedule data from 8+ major container shipping lines, combining transit times, historical on-time performance, equipment availability, and rate benchmarks into a single view.",
  },
  {
    q: "Is there a long-term contract requirement?",
    a: "Navigator is available month-to-month or with an annual commitment (save ~17%). Commander agreements are tailored to your organization and typically run 12 months.",
  },
  {
    q: "How does the API access work on the Commander plan?",
    a: "Commander includes RESTful API access to schedule search, carrier comparison, and calculator endpoints. We provide OpenAPI docs, sandbox environments, and integration support from your dedicated account manager.",
  },
];

/* ─────────── PAGE ─────────── */

export default function PricingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <main className="min-h-screen bg-[#0a0a1a] text-white overflow-hidden">
      <Header />

      {/* ══════════ VALUE PROP BANNER ══════════ */}
      <section className="relative pt-32 pb-8 px-6">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a1a] via-[#0d1230] to-[#0a0a1a]" />
        <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-ocean-600/10 rounded-full filter blur-[120px]" />
        <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-indigo-600/8 rounded-full filter blur-[120px]" />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 border border-ocean-500/30 bg-ocean-500/10 rounded-full px-5 py-2 mb-8">
              <Zap className="w-4 h-4 text-ocean-400" />
              <span className="text-sm font-medium text-ocean-300">
                Transparent B2B Pricing
              </span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.7 }}
            className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6"
          >
            The cost of{" "}
            <span className="bg-gradient-to-r from-ocean-400 via-indigo-400 to-ocean-300 bg-clip-text text-transparent">
              incomplete information
            </span>
            <br />
            exceeds the cost of our platform
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-lg text-gray-400 max-w-2xl mx-auto"
          >
            One missed backhaul deal or suboptimal routing decision costs more
            than a year of Shipping Savior. Choose the plan that fits your
            operation.
          </motion.p>
        </div>
      </section>

      {/* ══════════ PRICING CARDS ══════════ */}
      <section className="relative py-16 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6 items-stretch">
          {tiers.map((tier, i) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.12, duration: 0.6 }}
              className={`relative rounded-2xl p-[1px] ${
                tier.highlighted
                  ? "bg-gradient-to-b from-ocean-400 via-indigo-500 to-ocean-600 shadow-[0_0_60px_rgba(37,99,235,0.25)]"
                  : "bg-gradient-to-b from-gray-700/50 to-gray-800/30"
              }`}
            >
              {tier.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                  <div className="flex items-center gap-1.5 bg-gradient-to-r from-ocean-500 to-indigo-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
                    <Star className="w-3 h-3" />
                    {tier.badge}
                  </div>
                </div>
              )}

              <div
                className={`rounded-2xl p-8 h-full flex flex-col ${
                  tier.highlighted
                    ? "bg-[#0d1230]"
                    : "bg-[#111133]/80"
                }`}
              >
                {/* Tier header */}
                <div className="mb-6">
                  <p className="text-xs font-semibold tracking-wider uppercase text-ocean-400 mb-1">
                    {tier.tagline}
                  </p>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {tier.name}
                  </h3>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    {tier.description}
                  </p>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-white">
                      {tier.price}
                    </span>
                    {tier.period && (
                      <span className="text-gray-500 text-sm">{tier.period}</span>
                    )}
                  </div>
                  {tier.annualNote && (
                    <p className="text-sm text-ocean-400 mt-1">{tier.annualNote}</p>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8 flex-1">
                  {tier.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-ocean-400 mt-0.5 shrink-0" />
                      <span className="text-sm text-gray-300">{feat}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link
                  href={tier.ctaHref}
                  className={`block text-center font-semibold py-3 rounded-xl transition-all duration-300 ${
                    tier.highlighted
                      ? "bg-gradient-to-r from-ocean-500 to-indigo-500 text-white shadow-[0_4px_20px_rgba(37,99,235,0.4)] hover:shadow-[0_6px_28px_rgba(37,99,235,0.55)] hover:scale-[1.02]"
                      : "border border-gray-600 text-gray-300 hover:border-ocean-500 hover:text-ocean-400"
                  }`}
                >
                  {tier.cta}
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══════════ PER-USER BUNDLE CALLOUT ══════════ */}
      <section className="py-12 px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <div className="relative rounded-2xl p-[1px] bg-gradient-to-r from-ocean-500/40 via-indigo-500/40 to-ocean-500/40">
            <div className="rounded-2xl bg-[#0d1230] p-8 md:p-10 flex flex-col md:flex-row items-center gap-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-ocean-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-lg">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-xl font-bold text-white mb-2">
                  Need a custom user bundle?
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Teams of 10, 50, or 200 -- we offer volume-based per-seat pricing
                  that scales with your organization. Commander plans include
                  dedicated onboarding, SSO, and SLA guarantees. Contact our sales
                  team to build the right package.
                </p>
              </div>
              <Link
                href="/demo"
                className="shrink-0 inline-flex items-center gap-2 bg-gradient-to-r from-ocean-500 to-indigo-500 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
              >
                Talk to Sales
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ══════════ FEATURE COMPARISON MATRIX ══════════ */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Full Feature Comparison
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              See exactly what&apos;s included in each plan.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="overflow-x-auto"
          >
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-700/50">
                  <th className="text-left py-4 px-4 text-sm font-medium text-gray-500 w-1/4">
                    Feature
                  </th>
                  <th className="text-center py-4 px-4 text-sm font-bold text-gray-300 w-1/4">
                    Explorer
                  </th>
                  <th className="text-center py-4 px-4 text-sm font-bold text-ocean-400 w-1/4">
                    Navigator
                  </th>
                  <th className="text-center py-4 px-4 text-sm font-bold text-gray-300 w-1/4">
                    Commander
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((row, i) => (
                  <tr
                    key={row.feature}
                    className={`border-b border-gray-800/50 ${
                      i % 2 === 0 ? "bg-white/[0.02]" : ""
                    }`}
                  >
                    <td className="py-3.5 px-4 text-sm text-gray-300 font-medium">
                      {row.feature}
                    </td>
                    {(["explorer", "navigator", "commander"] as const).map(
                      (plan) => (
                        <td
                          key={plan}
                          className="py-3.5 px-4 text-center text-sm"
                        >
                          {renderCellValue(row[plan])}
                        </td>
                      )
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </div>
      </section>

      {/* ══════════ FAQ ══════════ */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 border border-gray-700/50 bg-gray-800/30 rounded-full px-5 py-2 mb-6">
              <HelpCircle className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-400">FAQ</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Frequently Asked Questions
            </h2>
          </motion.div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="rounded-xl border border-gray-800/60 bg-[#111133]/50 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left"
                >
                  <span className="text-sm font-medium text-gray-200">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-500 shrink-0 transition-transform duration-300 ${
                      openFaq === i ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-4">
                    <p className="text-sm text-gray-400 leading-relaxed">
                      {faq.a}
                    </p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ BOTTOM CTA ══════════ */}
      <section className="relative py-24 px-6">
        <div className="absolute inset-0 bg-gradient-to-t from-ocean-900/20 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-1/3 w-[600px] h-[300px] bg-ocean-600/10 rounded-full filter blur-[100px]" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative z-10 max-w-2xl mx-auto text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-5">
            Ready to see it in action?
          </h2>
          <p className="text-gray-400 mb-8 max-w-lg mx-auto">
            Schedule a 30-minute walkthrough with our team. We&apos;ll show you
            how Shipping Savior fits your specific operation.
          </p>
          <Link
            href="/demo"
            className="inline-flex items-center gap-3 bg-gradient-to-r from-ocean-500 to-indigo-500 text-white font-bold px-10 py-4 rounded-full shadow-[0_4px_24px_rgba(37,99,235,0.4)] hover:shadow-[0_8px_32px_rgba(37,99,235,0.55)] hover:scale-[1.02] transition-all duration-300 text-lg"
          >
            Schedule a Demo
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </section>

      {/* ══════════ FOOTER ══════════ */}
      <footer className="py-10 px-6 border-t border-gray-800/50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-ocean-500 to-indigo-600 flex items-center justify-center">
              <Ship className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-bold text-gray-300">
              Shipping<span className="bg-gradient-to-r from-ocean-400 to-indigo-400 bg-clip-text text-transparent">Savior</span>
            </span>
          </div>
          <div className="text-xs text-gray-600">
            Powered by{" "}
            <a
              href="https://aiacrobatics.com"
              className="text-ocean-500 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              AI Acrobatics
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}

/* ─────────── HELPERS ─────────── */

function renderCellValue(value: FeatureValue) {
  if (value === true) {
    return (
      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-ocean-500/20">
        <Check className="w-3.5 h-3.5 text-ocean-400" />
      </span>
    );
  }
  if (value === false) {
    return (
      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-800/50">
        <X className="w-3.5 h-3.5 text-gray-600" />
      </span>
    );
  }
  return <span className="text-gray-300">{value}</span>;
}

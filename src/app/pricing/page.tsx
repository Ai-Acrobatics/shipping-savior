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
  HelpCircle,
  ChevronDown,
  Star,
} from "lucide-react";
import { useState } from "react";

/* ─────────── TIERS (per Blake's pricing model — AI-7252) ─────────── */

interface Tier {
  name: string;
  tagline: string;
  price: string;
  period: string;
  perUserNote: string | null;
  description: string;
  cta: string;
  ctaHref: string;
  highlighted: boolean;
  badge: string | null;
  features: string[];
}

const tiers: Tier[] = [
  {
    name: "Free",
    tagline: "For exploration",
    price: "$0",
    period: "/month",
    perUserNote: null,
    description:
      "Try the platform — basic carrier directory, knowledge base, and a starter credit pack.",
    cta: "Get Started Free",
    ctaHref: "/register",
    highlighted: false,
    badge: null,
    features: [
      "1 user",
      "10 calculations / month",
      "5 BOL uploads / month",
      "Basic carrier directory access",
      "Knowledge base articles",
      "Ad-supported experience",
      "Community support",
    ],
  },
  {
    name: "Premium",
    tagline: "For growing operators",
    price: "$499",
    period: "/month",
    perUserNote: "$62 / user / month at 8 users",
    description:
      "Full intelligence stack for freight teams who make daily routing, carrier, and tariff decisions.",
    cta: "Start Free Trial",
    ctaHref: "/register?plan=premium",
    highlighted: true,
    badge: "MOST POPULAR",
    features: [
      "Up to 8 users (bundle pricing)",
      "Unlimited calculations",
      "100 BOL OCR extractions / month",
      "25 contract uploads / month",
      "Full carrier intelligence + reliability scores",
      "Tariff alerts (real-time HTS changes)",
      "FTZ savings calculator",
      "Priority email support",
    ],
  },
  {
    name: "Enterprise",
    tagline: "For supply chain teams",
    price: "Custom",
    period: "",
    perUserNote: "From $50 / user / month at 20 users",
    description:
      "White-label intelligence, custom integrations, and dedicated success for NVOCCs and large operators.",
    cta: "Talk to Sales",
    ctaHref:
      "mailto:julian@aiacrobatics.com?subject=Shipping%20Savior%20Enterprise%20Inquiry",
    highlighted: false,
    badge: null,
    features: [
      "Up to 20 / unlimited users",
      "Everything in Premium",
      "White-label deployment for NVOCCs",
      "Custom carrier API integrations",
      "Dedicated success manager",
      "SSO / SAML",
      "Audit logs + compliance reporting",
      "99.9% uptime SLA",
    ],
  },
];

/* ─────────── COMPARISON MATRIX (AI-8725: no empty cells) ─────────── */

type FeatureValue = boolean | string;

interface ComparisonFeature {
  feature: string;
  free: FeatureValue;
  premium: FeatureValue;
  enterprise: FeatureValue;
}

// Every cell renders ✓ / ✗ / value — no empty cells per AI-8725.
const comparisonFeatures: ComparisonFeature[] = [
  { feature: "Users", free: "1", premium: "Up to 8", enterprise: "Up to 20 / unlimited" },
  { feature: "Calculations", free: "10 / mo", premium: "Unlimited", enterprise: "Unlimited" },
  { feature: "BOL OCR uploads", free: "5 / mo", premium: "100 / mo", enterprise: "Unlimited" },
  { feature: "Contract uploads", free: false, premium: "25 / mo", enterprise: "Unlimited" },
  { feature: "Carrier intelligence", free: "Basic directory", premium: "Full + reliability", enterprise: "Full + reliability" },
  { feature: "Tariff alerts", free: false, premium: true, enterprise: true },
  { feature: "FTZ calculator", free: false, premium: true, enterprise: true },
  { feature: "Multi-modal (rail / air / drayage)", free: false, premium: true, enterprise: true },
  { feature: "API access", free: false, premium: false, enterprise: true },
  { feature: "SSO / SAML", free: false, premium: false, enterprise: true },
  { feature: "Audit log", free: false, premium: false, enterprise: true },
  { feature: "Support SLA", free: "Community", premium: "Priority email", enterprise: "Dedicated manager + 99.9%" },
];

/* ─────────── FAQ ─────────── */

const faqs = [
  {
    q: "Can I change plans later?",
    a: "Yes. Upgrade from Free to Premium any time directly from your settings — your data and history come with you. Moving to Enterprise is handled by our success team to set up SSO, custom integrations, and per-seat bundles.",
  },
  {
    q: "What happens if I exceed limits?",
    a: "On Free, you'll see a soft cap with the option to upgrade — no surprise charges. On Premium, BOL OCR and contract uploads burst up to 25% above your monthly cap before we reach out about an Enterprise plan that fits your volume.",
  },
  {
    q: "Do you offer annual billing?",
    a: "Yes — Premium annual saves 17% (effectively $415/mo when billed yearly). Enterprise contracts are typically 12 months and include volume discounts on the per-user bundle.",
  },
  {
    q: "Is there a free trial for Premium?",
    a: "Yes. Premium includes a 14-day free trial — full feature access, no credit card required. Cancel anytime during the trial and you stay on Free with no charge.",
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
                Value-based pricing for B2B freight teams
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
            One missed backhaul or suboptimal routing decision costs more than a
            year of Shipping Savior. Pick the plan that fits your operation —
            scale your team without recalculating per-seat costs every month.
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
                  tier.highlighted ? "bg-[#0d1230]" : "bg-[#111133]/80"
                }`}
              >
                {/* Tier header */}
                <div className="mb-6">
                  <p className="text-xs font-semibold tracking-wider uppercase text-ocean-400 mb-1">
                    {tier.tagline}
                  </p>
                  <h3 className="text-2xl font-bold text-white mb-2">{tier.name}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    {tier.description}
                  </p>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-white">{tier.price}</span>
                    {tier.period && (
                      <span className="text-gray-500 text-sm">{tier.period}</span>
                    )}
                  </div>
                  {tier.perUserNote && (
                    <p className="text-sm text-ocean-400 mt-1">{tier.perUserNote}</p>
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

      {/* ══════════ WHY PER-USER BUNDLES ══════════ */}
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
                  Why per-user bundles?
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Buy a bundle, scale your team without recalculating per-seat
                  costs every month. Up to 8 users on Premium ={" "}
                  <span className="text-ocean-300 font-semibold">$62 / user</span>.
                  Up to 20 on Enterprise ={" "}
                  <span className="text-ocean-300 font-semibold">$50 / user</span>.
                  Unlimited Enterprise plans are priced on volume — talk to sales.
                </p>
              </div>
              <Link
                href="mailto:julian@aiacrobatics.com?subject=Shipping%20Savior%20Enterprise%20Inquiry"
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
              Full feature comparison
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Every plan, side by side. No empty cells.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="overflow-x-auto"
          >
            <table className="w-full border-collapse min-w-[640px]">
              <thead>
                <tr className="border-b border-gray-700/50">
                  <th className="text-left py-4 px-4 text-sm font-medium text-gray-500 w-1/4">
                    Feature
                  </th>
                  <th className="text-center py-4 px-4 text-sm font-bold text-gray-300 w-1/4">
                    Free
                  </th>
                  <th className="text-center py-4 px-4 text-sm font-bold text-ocean-400 w-1/4">
                    Premium
                  </th>
                  <th className="text-center py-4 px-4 text-sm font-bold text-gray-300 w-1/4">
                    Enterprise
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
                    {(["free", "premium", "enterprise"] as const).map((plan) => (
                      <td key={plan} className="py-3.5 px-4 text-center text-sm">
                        {renderCellValue(row[plan])}
                      </td>
                    ))}
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
              Frequently asked questions
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
                  type="button"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left"
                  aria-expanded={openFaq === i}
                >
                  <span className="text-sm font-medium text-gray-200">{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-500 shrink-0 transition-transform duration-300 ${
                      openFaq === i ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-4">
                    <p className="text-sm text-gray-400 leading-relaxed">{faq.a}</p>
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
            Schedule a 30-minute walkthrough. We&apos;ll show you how Shipping
            Savior fits your specific freight operation.
          </p>
          <Link
            href="mailto:julian@aiacrobatics.com?subject=Shipping%20Savior%20Demo%20Request"
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
              Shipping
              <span className="bg-gradient-to-r from-ocean-400 to-indigo-400 bg-clip-text text-transparent">
                Savior
              </span>
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

// AI-8725: every cell renders ✓ / ✗ / value — never empty.
function renderCellValue(value: FeatureValue) {
  if (value === true) {
    return (
      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-emerald-500/30 ring-1 ring-emerald-400/40">
        <Check className="w-4 h-4 text-emerald-300" strokeWidth={3} />
      </span>
    );
  }
  if (value === false) {
    return (
      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-700/60 ring-1 ring-gray-600/40">
        <X className="w-4 h-4 text-gray-400" strokeWidth={3} />
      </span>
    );
  }
  return <span className="text-white font-medium">{value}</span>;
}

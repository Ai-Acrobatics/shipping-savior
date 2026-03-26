"use client";

import { Check, X, Zap, Crown, Building2 } from "lucide-react";

interface PricingTier {
  name: string;
  subtitle: string;
  price: string;
  period: string;
  description: string;
  icon: typeof Zap;
  color: string;
  borderColor: string;
  bgColor: string;
  featured: boolean;
  features: Array<{ label: string; included: boolean }>;
  cta: string;
}

const tiers: PricingTier[] = [
  {
    name: "Operator",
    subtitle: "For individual freight operators",
    price: "$299",
    period: "/month",
    description:
      "Essential tools for operators handling import/export operations. Calculators, route comparison, and tariff lookup.",
    icon: Zap,
    color: "text-ocean-400",
    borderColor: "border-ocean-500/30",
    bgColor: "bg-ocean-500/5",
    featured: false,
    features: [
      { label: "Landed cost calculator", included: true },
      { label: "Unit economics modeler", included: true },
      { label: "HTS tariff lookup (100K+ codes)", included: true },
      { label: "Container utilization calculator", included: true },
      { label: "3 carrier route comparisons", included: true },
      { label: "Basic FTZ savings estimate", included: true },
      { label: "PDF export (5/month)", included: true },
      { label: "Full FTZ scenario modeling", included: false },
      { label: "Multi-user dashboard", included: false },
      { label: "API access", included: false },
    ],
    cta: "Start Free Trial",
  },
  {
    name: "Brokerage",
    subtitle: "For freight brokerages & importers",
    price: "$799",
    period: "/month",
    description:
      "Full platform access with FTZ strategy tools, advanced analytics, and multi-scenario comparison for growing operations.",
    icon: Crown,
    color: "text-cargo-400",
    borderColor: "border-cargo-500/40",
    bgColor: "bg-cargo-500/5",
    featured: true,
    features: [
      { label: "Everything in Operator", included: true },
      { label: "Full FTZ savings analyzer", included: true },
      { label: "Tariff scenario builder", included: true },
      { label: "Backhaul intelligence alerts", included: true },
      { label: "Unlimited route comparisons", included: true },
      { label: "Shipment tracking dashboard", included: true },
      { label: "Unlimited PDF exports", included: true },
      { label: "Multi-user (up to 5 seats)", included: true },
      { label: "Knowledge base & SOPs", included: true },
      { label: "API access", included: false },
    ],
    cta: "Start Free Trial",
  },
  {
    name: "Enterprise",
    subtitle: "For logistics companies at scale",
    price: "Custom",
    period: "",
    description:
      "White-label deployment, API integration, custom data pipelines, and dedicated support for enterprise logistics operations.",
    icon: Building2,
    color: "text-purple-400",
    borderColor: "border-purple-500/30",
    bgColor: "bg-purple-500/5",
    featured: false,
    features: [
      { label: "Everything in Brokerage", included: true },
      { label: "Unlimited seats", included: true },
      { label: "Full REST API access", included: true },
      { label: "Custom data integrations", included: true },
      { label: "White-label option", included: true },
      { label: "Dedicated account manager", included: true },
      { label: "Custom compliance rules", included: true },
      { label: "SSO / SAML authentication", included: true },
      { label: "SLA guarantee (99.9%)", included: true },
      { label: "On-premise deployment option", included: true },
    ],
    cta: "Contact Sales",
  },
];

export default function PricingTiers() {
  return (
    <div className="grid md:grid-cols-3 gap-6 items-start">
      {tiers.map((tier) => (
        <div
          key={tier.name}
          className={`relative rounded-2xl p-6 transition-all ${
            tier.featured
              ? `glass border-2 ${tier.borderColor} ${tier.bgColor} scale-[1.02]`
              : `glass ${tier.borderColor}`
          }`}
        >
          {tier.featured && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-gradient-to-r from-cargo-500 to-cargo-400 text-navy-950 text-xs font-bold px-4 py-1 rounded-full">
                Most Popular
              </span>
            </div>
          )}

          {/* Header */}
          <div className="mb-6">
            <div
              className={`w-10 h-10 rounded-xl bg-gradient-to-br ${
                tier.name === "Operator"
                  ? "from-ocean-600 to-ocean-800"
                  : tier.name === "Brokerage"
                  ? "from-cargo-600 to-cargo-800"
                  : "from-purple-600 to-purple-800"
              } flex items-center justify-center mb-4`}
            >
              <tier.icon className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white">{tier.name}</h3>
            <p className="text-xs text-navy-400 mt-1">{tier.subtitle}</p>
          </div>

          {/* Price */}
          <div className="mb-4">
            <span className="text-4xl font-bold text-white">{tier.price}</span>
            {tier.period && (
              <span className="text-sm text-navy-400">{tier.period}</span>
            )}
          </div>

          <p className="text-sm text-navy-300 leading-relaxed mb-6">
            {tier.description}
          </p>

          {/* CTA Button */}
          <button
            className={`w-full py-3 rounded-xl font-semibold text-sm transition-all mb-6 ${
              tier.featured
                ? "bg-gradient-to-r from-cargo-500 to-cargo-400 text-navy-950 hover:from-cargo-400 hover:to-cargo-300 shadow-lg shadow-cargo-500/20"
                : "glass glass-hover text-white"
            }`}
          >
            {tier.cta}
          </button>

          {/* Features */}
          <div className="space-y-2.5">
            {tier.features.map((feature) => (
              <div
                key={feature.label}
                className="flex items-start gap-2.5 text-sm"
              >
                {feature.included ? (
                  <Check className={`w-4 h-4 ${tier.color} flex-shrink-0 mt-0.5`} />
                ) : (
                  <X className="w-4 h-4 text-navy-600 flex-shrink-0 mt-0.5" />
                )}
                <span
                  className={
                    feature.included ? "text-navy-200" : "text-navy-600"
                  }
                >
                  {feature.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

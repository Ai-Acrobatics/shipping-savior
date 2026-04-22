"use client";

import { Suspense } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import AnimatedSection, { AnimatedItem } from "@/components/ui/AnimatedSection";
import GlassCard from "@/components/ui/GlassCard";
import GradientButton from "@/components/ui/GradientButton";
import StatsBar from "@/components/ui/StatsBar";
import ProblemCard from "@/components/ui/ProblemCard";
import FeatureCard from "@/components/ui/FeatureCard";
import HowItWorksStep from "@/components/ui/HowItWorksStep";
import { VercelV0Chat } from "@/components/ui/v0-ai-chat";
import { GlobeFlights } from "@/components/ui/cobe-globe-flights";
import { motion } from "framer-motion";
import {
  Ship, Globe, Calculator, Shield, BarChart3,
  Anchor, Container, Route, Database, Map, Truck,
  ArrowRight, Zap, TrendingUp, Clock, DollarSign,
  Brain, Bot, FileCheck, Radar, Play,
  AlertTriangle, Shuffle, RefreshCw, Search,
  Users, Warehouse, Snowflake, Package,
} from "lucide-react";

/* ─────────── DATA ─────────── */

const heroStats = [
  { label: "Carrier Lines", value: "8+", icon: Ship },
  { label: "Ports Mapped", value: "700+", icon: Anchor },
  { label: "FTZ Zones", value: "268", icon: Shield },
  { label: "Real-Time Schedules", value: "Live", icon: Clock },
];

const problems = [
  {
    icon: Shuffle,
    title: "Fragmented Data",
    description:
      "Shipping data scattered across dozens of carrier websites. No single view of rates, schedules, or reliability.",
  },
  {
    icon: AlertTriangle,
    title: "Uninformed Decisions",
    description:
      "Importers making million-dollar routing choices without complete cost, transit, or duty information.",
  },
  {
    icon: Search,
    title: "No Carrier Comparison",
    description:
      "No tool compares transit times, reliability scores, and rates side-by-side across all major shipping lines.",
  },
  {
    icon: RefreshCw,
    title: "Constant Changes",
    description:
      "Geopolitical events, tariff shifts, and schedule changes require instant pivots that manual processes can't support.",
  },
];

const features = [
  {
    icon: Calculator,
    title: "Landed Cost Calculator",
    description: "Unit cost + shipping + duties + fulfillment = true per-unit landed cost with multi-currency support.",
    gradient: "from-ocean-500 to-ocean-600",
    href: "#calculators",
  },
  {
    icon: Shield,
    title: "FTZ Savings Analyzer",
    description: "Lock duty rates at entry, model incremental withdrawals, compare FTZ vs non-FTZ scenarios.",
    gradient: "from-emerald-500 to-teal-600",
    href: "/ftz-analyzer",
  },
  {
    icon: Route,
    title: "Route Comparison",
    description: "Compare carrier options with backhaul pricing, transshipment routes, and transit time analysis.",
    gradient: "from-cargo-500 to-orange-500",
    href: "#visualization",
  },
  {
    icon: Globe,
    title: "Tariff Estimator",
    description: "HTS code lookup with duty rates by country of origin. SE Asia focus: Vietnam, Thailand, Indonesia.",
    gradient: "from-purple-500 to-violet-600",
    href: "/ftz-analyzer",
  },
  {
    icon: Container,
    title: "Container Calculator",
    description: "Optimize utilization by volume AND weight. See which limit you hit first and cost-per-unit at scale.",
    gradient: "from-blue-500 to-cyan-600",
    href: "#calculators",
  },
  {
    icon: Map,
    title: "Interactive Route Map",
    description: "Visualization of shipping lanes, transshipment hubs, and port locations worldwide.",
    gradient: "from-indigo-500 to-ocean-600",
    href: "#visualization",
  },
  {
    icon: BarChart3,
    title: "Carrier Comparison",
    description: "Side-by-side carrier analysis: on-time %, transit days, capacity, rates, and equipment availability.",
    gradient: "from-ocean-600 to-indigo-600",
    href: "#platform",
  },
  {
    icon: Database,
    title: "Contract Manager",
    description: "Track rate agreements, volume commitments, and contract expiry across all carrier relationships.",
    gradient: "from-navy-600 to-navy-800",
    href: "#platform",
  },
  {
    icon: Brain,
    title: "AI Assistant",
    description: "Natural language queries: 'cheapest route from Shenzhen to LA with cold chain' answered instantly.",
    gradient: "from-cargo-500 to-cargo-600",
    href: "#platform",
  },
];

const howItWorks = [
  {
    icon: Search,
    title: "Enter Your Route",
    description: "Origin port, destination port, commodity type, and container requirements.",
  },
  {
    icon: BarChart3,
    title: "Compare Carriers",
    description: "See all shipping lines, transit times, reliability scores, and rates side-by-side.",
  },
  {
    icon: Calculator,
    title: "Optimize Costs",
    description: "Calculate landed cost, FTZ savings, tariff scenarios, and container utilization.",
  },
  {
    icon: TrendingUp,
    title: "Make Informed Decisions",
    description: "Export reports, manage contracts, track vessels, and optimize continuously.",
  },
];

const audiences = [
  { icon: Snowflake, label: "Cold Chain Exporters", color: "text-sky-500" },
  { icon: Package, label: "SE Asia Importers", color: "text-cargo-500" },
  { icon: Warehouse, label: "FTZ Operators", color: "text-emerald-500" },
  { icon: Truck, label: "Freight Brokers", color: "text-purple-500" },
];

const aiAgents = [
  { name: "Tariff Intelligence", icon: Radar, gradient: "from-ocean-600 to-indigo-600", desc: "Monitors HTS changes & alerts on duty rate shifts" },
  { name: "Route Optimization", icon: Route, gradient: "from-cargo-500 to-orange-600", desc: "Finds best backhaul deals & carrier schedules" },
  { name: "FTZ Strategy", icon: Shield, gradient: "from-emerald-500 to-teal-600", desc: "Models withdrawal schedules & optimizes duty timing" },
  { name: "Compliance Monitor", icon: FileCheck, gradient: "from-purple-500 to-violet-600", desc: "Tracks ISF deadlines & flags documentation gaps" },
  { name: "Cost Analysis", icon: TrendingUp, gradient: "from-blue-500 to-cyan-600", desc: "Tracks landed costs & identifies margin optimization" },
];

/* ─────────── PAGE ─────────── */

export default function Home() {
  return (
    <main className="min-h-screen bg-white overflow-hidden">
      <Header />

      {/* ══════════ HERO ══════════ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 hero-gradient" />
        <div className="absolute inset-0 pattern-dots-hero" />

        {/* Animated gradient blobs */}
        <div className="absolute top-1/4 -left-32 w-[500px] h-[500px] bg-ocean-300/25 rounded-full filter blur-[80px] animate-blob" />
        <div className="absolute bottom-1/4 -right-32 w-[400px] h-[400px] bg-indigo-300/20 rounded-full filter blur-[80px] animate-blob-delay-2" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-ocean-200/15 rounded-full filter blur-[100px] animate-blob-delay-4" />

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 glass-premium rounded-full px-5 py-2.5 mb-8 shadow-soft">
              <Zap className="w-4 h-4 text-ocean-600" />
              <span className="text-sm font-medium text-navy-600">
                AI-Powered Logistics Intelligence
              </span>
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.7 }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tighter mb-6 text-navy-900"
          >
            <span className="gradient-text-hero">Global Trade</span>
            <br className="hidden sm:block" />
            {" "}Intelligence
            <br className="hidden sm:block" />
            <span className="text-navy-900">In One Platform</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.6 }}
            className="text-lg md:text-xl text-navy-500 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Stop juggling 10 carrier websites. Compare shipping lines, optimize duties,
            and manage contracts from a{" "}
            <span className="text-ocean-600 font-semibold">single command center</span>.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <GradientButton href="/demo">
              See Demo
              <ArrowRight className="w-5 h-5" />
            </GradientButton>
            <GradientButton variant="outline" href="#how-it-works">
              <Play className="w-5 h-5" />
              Watch How It Works
            </GradientButton>
          </motion.div>

          {/* Agent chat — ask a shipping question */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85, duration: 0.6 }}
            className="mt-14 mb-10"
          >
            <VercelV0Chat />
          </motion.div>

          {/* Stats bar */}
          <StatsBar stats={heroStats} />
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0 z-10">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0,32L80,26.7C160,21,320,11,480,10.7C640,11,800,21,960,26.7C1120,32,1280,32,1360,32L1440,32L1440,60L0,60Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* ══════════ PROBLEMS ══════════ */}
      <section className="py-24 md:py-32 px-6 bg-white relative">
        <div className="max-w-6xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <p className="text-sm font-semibold text-red-500 tracking-wider uppercase mb-3">
              The Problem
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-navy-900 mb-5">
              International Shipping Is{" "}
              <span className="text-red-500">Broken</span>
            </h2>
            <p className="text-lg text-navy-500 max-w-2xl mx-auto">
              Freight operators waste 40-60% of their time on manual data
              gathering across fragmented systems.
            </p>
          </AnimatedSection>

          <AnimatedSection stagger className="grid md:grid-cols-2 gap-6">
            {problems.map((problem, i) => (
              <AnimatedItem key={problem.title}>
                <ProblemCard
                  icon={problem.icon}
                  title={problem.title}
                  description={problem.description}
                  index={i}
                />
              </AnimatedItem>
            ))}
          </AnimatedSection>
        </div>
      </section>

      {/* ══════════ FEATURES ══════════ */}
      <section id="platform" className="py-24 md:py-32 px-6 section-alt relative wave-divider">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <p className="text-sm font-semibold text-ocean-600 tracking-wider uppercase mb-3">
              Platform
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-navy-900 mb-5">
              Complete Logistics{" "}
              <span className="gradient-text">Toolkit</span>
            </h2>
            <p className="text-lg text-navy-500 max-w-2xl mx-auto">
              Nine powerful tools that systematize every aspect of international
              freight — from rate comparison to AI-powered insights.
            </p>
          </AnimatedSection>

          <AnimatedSection stagger className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <AnimatedItem key={feature.title}>
                <FeatureCard
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                  gradient={feature.gradient}
                  href={feature.href}
                />
              </AnimatedItem>
            ))}
          </AnimatedSection>
        </div>
      </section>

      {/* ══════════ HOW IT WORKS ══════════ */}
      <section id="how-it-works" className="py-24 md:py-32 px-6 bg-white relative">
        <div className="max-w-5xl mx-auto">
          <AnimatedSection className="text-center mb-20">
            <p className="text-sm font-semibold text-ocean-600 tracking-wider uppercase mb-3">
              How It Works
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-navy-900 mb-5">
              From Route to{" "}
              <span className="gradient-text">Decision</span>
              {" "}in Minutes
            </h2>
            <p className="text-lg text-navy-500 max-w-2xl mx-auto">
              Four steps to transform scattered shipping data into actionable intelligence.
            </p>
          </AnimatedSection>

          <AnimatedSection stagger className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-6">
            {howItWorks.map((step, i) => (
              <AnimatedItem key={step.title}>
                <HowItWorksStep
                  number={i + 1}
                  title={step.title}
                  description={step.description}
                  icon={step.icon}
                  isLast={i === howItWorks.length - 1}
                />
              </AnimatedItem>
            ))}
          </AnimatedSection>
        </div>
      </section>

      {/* ══════════ AI AGENTS ══════════ */}
      <section className="py-24 md:py-32 px-6 section-alt relative">
        <div className="max-w-6xl mx-auto">
          <AnimatedSection className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-200 rounded-full px-5 py-2.5 mb-5 shadow-soft">
              <Bot className="w-4 h-4 text-indigo-600" />
              <span className="text-sm font-medium text-indigo-700">Autonomous AI Agents</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-navy-900 mb-5">
              Powered by{" "}
              <span className="gradient-text-hero">5 AI Agents</span>
            </h2>
            <p className="text-lg text-navy-500 max-w-2xl mx-auto">
              Autonomous intelligence that monitors, analyzes, and optimizes
              your logistics operations 24/7.
            </p>
          </AnimatedSection>

          <AnimatedSection stagger className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {aiAgents.map((agent) => (
              <AnimatedItem key={agent.name}>
                <GlassCard className="p-5 text-center h-full">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${agent.gradient} flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                    <agent.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-sm font-bold text-navy-900 mb-1.5">{agent.name}</h3>
                  <p className="text-xs text-navy-500 leading-relaxed">{agent.desc}</p>
                  <div className="flex items-center justify-center gap-1.5 mt-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-[10px] text-emerald-600 font-medium">Active</span>
                  </div>
                </GlassCard>
              </AnimatedItem>
            ))}
          </AnimatedSection>
        </div>
      </section>

      {/* ══════════ GLOBAL TRADE LANES ══════════ */}
      <section className="py-24 md:py-32 px-6 bg-white relative overflow-hidden">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-sm font-medium text-ocean-600 tracking-wider uppercase mb-4">
              Global Coverage
            </p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-navy-900 mb-6">
              Every lane, <span className="gradient-text-hero">every carrier</span>, one view
            </h2>
            <p className="text-lg text-navy-500 leading-relaxed mb-6">
              We aggregate live schedules, reliability scores, and rates across 3,700+ ports
              and 8+ major carrier lines — including Jones Act carriers for domestic US routes.
              From Qingdao to Long Beach, Rotterdam to Central America, Seattle to Honolulu.
            </p>
            <ul className="space-y-3 text-navy-700">
              <li className="flex items-start gap-2">
                <span className="mt-1 w-2 h-2 rounded-full bg-ocean-500 flex-shrink-0" />
                <span>Ocean · rail intermodal · air freight · drayage</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 w-2 h-2 rounded-full bg-ocean-500 flex-shrink-0" />
                <span>Carrier reliability scoring from VSA alliance + on-time history</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 w-2 h-2 rounded-full bg-ocean-500 flex-shrink-0" />
                <span>Jones Act support (Matson, Pasha Hawaii) for domestic US routes</span>
              </li>
            </ul>
          </div>
          <div className="w-full max-w-lg mx-auto">
            <GlobeFlights />
          </div>
        </div>
      </section>

      {/* ══════════ SOCIAL PROOF / AUDIENCE ══════════ */}
      <section className="py-20 px-6 bg-white border-y border-navy-100">
        <div className="max-w-5xl mx-auto">
          <AnimatedSection className="text-center mb-10">
            <p className="text-sm font-medium text-navy-400 tracking-wider uppercase">
              Built for Industry Leaders
            </p>
          </AnimatedSection>

          <AnimatedSection stagger className="flex flex-wrap items-center justify-center gap-8 md:gap-14">
            {audiences.map((a) => (
              <AnimatedItem key={a.label}>
                <div className="flex items-center gap-3 group">
                  <div className="w-10 h-10 rounded-xl bg-navy-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <a.icon className={`w-5 h-5 ${a.color}`} />
                  </div>
                  <span className="text-sm font-semibold text-navy-600 tracking-wide">{a.label}</span>
                </div>
              </AnimatedItem>
            ))}
          </AnimatedSection>

          {/* Partner logos placeholder */}
          <AnimatedSection delay={0.3}>
            <div className="mt-14 flex justify-center gap-8 opacity-30">
              {[1, 2, 3, 4, 5].map((n) => (
                <div
                  key={n}
                  className="w-28 h-10 rounded-lg bg-navy-200/60"
                />
              ))}
            </div>
            <p className="text-center text-xs text-navy-300 mt-3">
              Partner integrations coming soon
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* ══════════ CTA ══════════ */}
      <section className="relative py-28 md:py-36 px-6 overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-ocean-600 via-indigo-600 to-ocean-700" />

        {/* Blob accents */}
        <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-white/5 rounded-full filter blur-[100px] animate-blob" />
        <div className="absolute bottom-0 right-0 w-[350px] h-[350px] bg-indigo-400/10 rounded-full filter blur-[100px] animate-blob-delay-2" />

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <AnimatedSection>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-5 text-glow-blue">
              Ready to Stop Guessing?
            </h2>
            <p className="text-lg text-ocean-100 mb-10 max-w-xl mx-auto leading-relaxed">
              Join the next generation of data-driven freight operators.
              Compare carriers, optimize costs, and make confident decisions.
            </p>

            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="inline-block"
            >
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-3 bg-white text-ocean-700 font-bold px-10 py-5 rounded-full text-lg
                           shadow-[0_8px_32px_rgba(0,0,0,0.2)]
                           hover:shadow-[0_12px_48px_rgba(0,0,0,0.3)]
                           hover:bg-ocean-50 transition-all duration-300"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>

            <p className="text-sm text-ocean-200 mt-5">
              No credit card required. 14-day free trial.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* ══════════ FOOTER ══════════ */}
      <footer className="py-14 px-6 border-t border-navy-100 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-10 mb-10">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-ocean-500 to-indigo-600 flex items-center justify-center shadow-sm">
                  <Ship className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold text-navy-900">
                  Shipping<span className="gradient-text">Savior</span>
                </span>
              </div>
              <p className="text-sm text-navy-400 leading-relaxed">
                AI-powered international logistics intelligence platform for freight operators.
              </p>
            </div>

            {/* Platform */}
            <div>
              <h4 className="text-xs font-bold text-navy-900 uppercase tracking-wider mb-4">
                Platform
              </h4>
              <div className="space-y-2.5">
                {[
                  { label: "Landed Cost Calculator", href: "#calculators" },
                  { label: "FTZ Analyzer", href: "/ftz-analyzer" },
                  { label: "Route Comparison", href: "#visualization" },
                  { label: "Dashboard", href: "/dashboard" },
                  { label: "Knowledge Base", href: "/knowledge-base" },
                ].map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="block text-sm text-navy-400 hover:text-ocean-600 transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Resources */}
            <div>
              <h4 className="text-xs font-bold text-navy-900 uppercase tracking-wider mb-4">
                Resources
              </h4>
              <div className="space-y-2.5">
                {[
                  { label: "Monetization Strategy", href: "/monetization" },
                  { label: "Six Sigma Analysis", href: "/six-sigma" },
                  { label: "Project Phases", href: "/phases" },
                  { label: "Full Proposal", href: "/agreement" },
                ].map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="block text-sm text-navy-400 hover:text-ocean-600 transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-xs font-bold text-navy-900 uppercase tracking-wider mb-4">
                Contact
              </h4>
              <div className="space-y-2.5 text-sm text-navy-400">
                <p>Blake Harwell, Co-Founder</p>
                <p>Cold Chain & Logistics Expert</p>
                <p className="text-ocean-600 font-medium">info@shippingsavior.com</p>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-navy-100 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="text-xs text-navy-400">
              Tariff data for informational purposes only. Verify at{" "}
              <a href="https://hts.usitc.gov" className="text-ocean-500 hover:underline" target="_blank" rel="noopener noreferrer">
                hts.usitc.gov
              </a>
            </div>
            <div className="text-xs text-navy-300">
              Powered by{" "}
              <a href="https://aiacrobatics.com" className="text-ocean-500 hover:underline" target="_blank" rel="noopener noreferrer">
                AI Acrobatics
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}

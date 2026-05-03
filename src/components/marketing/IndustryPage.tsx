"use client";

/**
 * IndustryPage — shared template for vertical marketing landing pages.
 *
 * Used by /industries/cold-chain, /industries/automotive, and
 * /industries/personal-care. Each vertical page imports this template
 * and passes its own copy in via props — keeps the visual language
 * consistent (ocean gradient, navy/cyan palette, glass-premium cards)
 * while letting us iterate on per-industry messaging.
 *
 * Per AI-8870, do NOT name-drop specific brands (Trader Joe's, Chiquita,
 * etc.). Use generic phrasing like "a top-3 grocer" or "premium produce
 * importer" in quotes/case studies.
 *
 * Visual structure (top to bottom):
 *   1. Header (site nav)
 *   2. Hero — eyebrow, h1, subhead, primary + secondary CTA
 *   3. LogoMarquee — same trusted partners
 *   4. Problems grid — 3-4 industry-specific pain points
 *   5. Features grid — 3-4 platform capabilities mapped to industry
 *   6. CounterStrip — platform-wide metrics
 *   7. Quote — single anonymized testimonial
 *   8. Industry metrics — 3-4 specific stats for this vertical
 *   9. Use cases — 2-3 short scenarios
 *   10. CTA — schedule demo + view pricing
 *   11. Footer (site footer is owned by individual pages; we render a
 *       compact one inline here so all 3 verticals match)
 */

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CircleCheck,
  Quote as QuoteIcon,
  Ship,
  Snowflake,
  Truck,
  Sparkles,
  Calculator,
  FileCheck,
  Shield,
  Container,
  Route,
  Globe2,
  Clock,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import Header from "@/components/Header";
import { LogoMarquee } from "@/components/marketing/LogoMarquee";
import { CounterStrip } from "@/components/marketing/CounterStrip";

// ──────────────────────── ICON MAP ────────────────────────
//
// Vertical pages pass icon names as strings so the page files stay JSON-
// shaped and we don't have to import lucide on the server route. Add new
// icons here as needed.

export type IndustryIconName =
  | "snowflake"
  | "truck"
  | "sparkles"
  | "calculator"
  | "filecheck"
  | "shield"
  | "container"
  | "route"
  | "globe"
  | "clock"
  | "ship"
  | "trending";

const ICON_MAP: Record<IndustryIconName, LucideIcon> = {
  snowflake: Snowflake,
  truck: Truck,
  sparkles: Sparkles,
  calculator: Calculator,
  filecheck: FileCheck,
  shield: Shield,
  container: Container,
  route: Route,
  globe: Globe2,
  clock: Clock,
  ship: Ship,
  trending: TrendingUp,
};

// ──────────────────────── TYPES ────────────────────────

export interface IndustryHero {
  eyebrow: string;
  h1: string;
  subhead: string;
  primaryCTA: { label: string; href: string };
  secondaryCTA: { label: string; href: string };
}

export interface IndustryProblem {
  title: string;
  body: string;
  icon: IndustryIconName;
}

export interface IndustryFeature {
  title: string;
  body: string;
  link: string;
  icon?: IndustryIconName;
}

export interface IndustryQuote {
  text: string;
  author: string;
  role: string;
  company: string;
}

export interface IndustryMetric {
  label: string;
  value: string;
}

export interface IndustryUseCase {
  name: string;
  description: string;
}

export interface IndustryCTA {
  headline: string;
  subhead: string;
}

export interface IndustryPageProps {
  vertical: string;
  hero: IndustryHero;
  problems: IndustryProblem[];
  features: IndustryFeature[];
  quote: IndustryQuote;
  metrics: IndustryMetric[];
  useCases: IndustryUseCase[];
  cta: IndustryCTA;
}

// ──────────────────────── COMPONENT ────────────────────────

export function IndustryPage({
  vertical,
  hero,
  problems,
  features,
  quote,
  metrics,
  useCases,
  cta,
}: IndustryPageProps) {
  return (
    <main className="min-h-screen bg-white overflow-hidden text-navy-900">
      <Header />

      {/* ══════════════════ HERO ══════════════════ */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 px-6 overflow-hidden">
        {/* Ocean gradient background */}
        <div className="absolute inset-0 hero-gradient" />
        <div className="absolute inset-0 pattern-dots-hero opacity-60" />

        {/* Floating ocean blobs */}
        <div className="absolute top-[10%] -left-32 w-[480px] h-[480px] bg-ocean-200/40 rounded-full filter blur-[90px] animate-blob" />
        <div className="absolute bottom-[5%] -right-32 w-[420px] h-[420px] bg-cyan-200/40 rounded-full filter blur-[90px] animate-blob-delay-2" />

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 glass-premium rounded-full px-5 py-2.5 mb-7 shadow-soft">
              <span className="w-1.5 h-1.5 rounded-full bg-ocean-500 animate-pulse" />
              <span className="text-sm font-medium text-navy-700">
                {hero.eyebrow}
              </span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.7 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter mb-6 text-balance"
          >
            {hero.h1.split(" ").slice(0, -2).join(" ")}{" "}
            <span className="bg-gradient-to-br from-ocean-600 via-ocean-500 to-cyan-400 bg-clip-text text-transparent">
              {hero.h1.split(" ").slice(-2).join(" ")}
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-lg md:text-xl text-navy-600 max-w-3xl mx-auto mb-9 leading-relaxed"
          >
            {hero.subhead}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              href={hero.primaryCTA.href}
              className="group inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-gradient-to-r from-ocean-600 to-cyan-500 text-white font-medium shadow-lg shadow-ocean-500/25 hover:shadow-xl hover:shadow-ocean-500/35 hover:scale-[1.02] transition-all"
            >
              {hero.primaryCTA.label}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href={hero.secondaryCTA.href}
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full glass-premium text-navy-700 hover:bg-white/90 transition-all font-medium"
            >
              {hero.secondaryCTA.label}
            </Link>
          </motion.div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none">
          <svg
            viewBox="0 0 1440 80"
            fill="none"
            className="w-full"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0,40 C240,80 480,0 720,40 C960,80 1200,20 1440,40 L1440,80 L0,80 Z"
              fill="white"
            />
          </svg>
        </div>
      </section>

      {/* ══════════════════ LOGO MARQUEE ══════════════════ */}
      <LogoMarquee />

      {/* ══════════════════ PROBLEMS ══════════════════ */}
      <section className="relative py-20 md:py-28 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <p className="text-sm font-medium text-ocean-600 tracking-wider uppercase mb-4">
              Why {vertical} is hard
            </p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tighter text-navy-900 mb-5 text-balance">
              The problems we{" "}
              <span className="bg-gradient-to-br from-ocean-600 via-ocean-500 to-cyan-400 bg-clip-text text-transparent">
                actually solve
              </span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
            {problems.map((p, i) => {
              const Icon = ICON_MAP[p.icon] ?? Container;
              return (
                <motion.div
                  key={p.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{
                    delay: i * 0.08,
                    duration: 0.6,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="glass-premium rounded-2xl p-6 border border-ocean-100/60 hover:border-ocean-200/80 hover:-translate-y-1 transition-all shadow-soft"
                >
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-ocean-500 to-cyan-400 flex items-center justify-center mb-4 shadow-md shadow-ocean-500/30">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-base md:text-lg font-semibold text-navy-900 mb-2">
                    {p.title}
                  </h3>
                  <p className="text-sm text-navy-600 leading-relaxed">
                    {p.body}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════ FEATURES ══════════════════ */}
      <section className="relative py-20 md:py-28 px-6 bg-gradient-to-b from-white via-ocean-50/40 to-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <p className="text-sm font-medium text-ocean-600 tracking-wider uppercase mb-4">
              How Shipping Savior helps
            </p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tighter text-navy-900 mb-5 text-balance">
              The features that{" "}
              <span className="bg-gradient-to-br from-ocean-600 via-ocean-500 to-cyan-400 bg-clip-text text-transparent">
                matter for {vertical}
              </span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
            {features.map((f, i) => {
              const Icon = f.icon ? ICON_MAP[f.icon] ?? Calculator : Calculator;
              return (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{
                    delay: i * 0.08,
                    duration: 0.6,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="group bg-white rounded-2xl p-6 border border-navy-100 hover:border-ocean-200 hover:shadow-card hover:-translate-y-1 transition-all"
                >
                  <div className="w-11 h-11 rounded-xl bg-ocean-50 flex items-center justify-center mb-4 group-hover:bg-gradient-to-br group-hover:from-ocean-500 group-hover:to-cyan-400 transition-all">
                    <Icon className="w-5 h-5 text-ocean-600 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-base md:text-lg font-semibold text-navy-900 mb-2">
                    {f.title}
                  </h3>
                  <p className="text-sm text-navy-600 leading-relaxed mb-4">
                    {f.body}
                  </p>
                  <Link
                    href={f.link}
                    className="inline-flex items-center gap-1 text-sm font-medium text-ocean-600 hover:text-ocean-700 transition-colors"
                  >
                    Learn more
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════ COUNTER STRIP ══════════════════ */}
      <CounterStrip />

      {/* ══════════════════ QUOTE ══════════════════ */}
      <section className="relative py-20 md:py-28 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="relative glass-premium rounded-3xl p-8 md:p-12 border border-ocean-100/60 shadow-soft"
          >
            <QuoteIcon className="absolute top-6 left-6 md:top-8 md:left-8 w-10 h-10 text-ocean-200" />
            <div className="relative z-10 pl-12 md:pl-14">
              <p className="text-xl md:text-2xl text-navy-800 leading-relaxed font-medium mb-6 italic">
                &ldquo;{quote.text}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-ocean-500 to-cyan-400 flex items-center justify-center text-white font-semibold text-sm">
                  {quote.author
                    .split(" ")
                    .map((w) => w[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
                <div>
                  <div className="text-sm font-semibold text-navy-900">
                    {quote.author}
                  </div>
                  <div className="text-xs text-navy-500">
                    {quote.role} · {quote.company}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════ INDUSTRY METRICS ══════════════════ */}
      <section className="relative py-20 md:py-28 px-6 bg-gradient-to-b from-white to-ocean-50/40">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <p className="text-sm font-medium text-ocean-600 tracking-wider uppercase mb-4">
              By the numbers
            </p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tighter text-navy-900 mb-5 text-balance">
              What {vertical}{" "}
              <span className="bg-gradient-to-br from-ocean-600 via-ocean-500 to-cyan-400 bg-clip-text text-transparent">
                operators see
              </span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
            {metrics.map((m, i) => (
              <motion.div
                key={m.label}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{
                  delay: i * 0.08,
                  duration: 0.6,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="bg-white rounded-2xl p-6 border border-ocean-100 shadow-soft"
              >
                <div className="text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-br from-ocean-600 via-ocean-500 to-cyan-400 bg-clip-text text-transparent mb-2">
                  {m.value}
                </div>
                <div className="text-xs md:text-sm text-navy-600 leading-snug">
                  {m.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ USE CASES ══════════════════ */}
      <section className="relative py-20 md:py-28 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <p className="text-sm font-medium text-ocean-600 tracking-wider uppercase mb-4">
              Real scenarios
            </p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tighter text-navy-900 mb-5 text-balance">
              How operators{" "}
              <span className="bg-gradient-to-br from-ocean-600 via-ocean-500 to-cyan-400 bg-clip-text text-transparent">
                actually use it
              </span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-5 md:gap-6">
            {useCases.map((u, i) => (
              <motion.div
                key={u.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{
                  delay: i * 0.1,
                  duration: 0.7,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-ocean-50 via-white to-cyan-50/40 border border-ocean-100 p-7 md:p-8 shadow-soft"
              >
                <div className="flex items-start gap-3 mb-3">
                  <CircleCheck className="w-5 h-5 text-ocean-500 flex-shrink-0 mt-1" />
                  <h3 className="text-lg md:text-xl font-semibold text-navy-900 leading-snug">
                    {u.name}
                  </h3>
                </div>
                <p className="text-sm md:text-base text-navy-600 leading-relaxed pl-8">
                  {u.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ CTA ══════════════════ */}
      <section className="relative py-24 md:py-32 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-ocean-600 via-ocean-500 to-cyan-400" />
        <div
          className="absolute inset-0 opacity-30 mix-blend-overlay"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 30%, rgba(255,255,255,0.5) 0%, transparent 40%), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.4) 0%, transparent 40%)",
          }}
        />

        {/* Wave divider top */}
        <div className="absolute top-0 left-0 right-0 pointer-events-none">
          <svg
            viewBox="0 0 1440 60"
            fill="none"
            className="w-full"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0,32 C240,60 480,8 720,32 C960,60 1200,16 1440,32 L1440,0 L0,0 Z"
              fill="white"
            />
          </svg>
        </div>

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tighter text-white mb-6 text-balance">
            {cta.headline}
          </h2>
          <p className="text-white/85 text-lg md:text-xl mb-10 leading-relaxed max-w-2xl mx-auto">
            {cta.subhead}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={hero.primaryCTA.href}
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-white text-ocean-700 font-semibold shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all"
            >
              {hero.primaryCTA.label}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href={hero.secondaryCTA.href}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-white/10 backdrop-blur-md border border-white/30 text-white font-semibold hover:bg-white/20 transition-all"
            >
              {hero.secondaryCTA.label}
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════ FOOTER ══════════════════ */}
      <footer className="relative px-6 py-10 bg-white border-t border-ocean-50">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-navy-500">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-ocean-500 to-cyan-400 flex items-center justify-center">
              <Ship className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-semibold text-navy-700">Shipping Savior</span>
            <span className="text-navy-400">·</span>
            <span className="text-navy-400 text-xs">
              © 2026 · Built by Julian Bradley × Blake Harwell
            </span>
          </div>
          <div className="flex items-center gap-5 text-xs">
            <Link
              href="/industries/cold-chain"
              className="text-navy-500 hover:text-ocean-600 transition-colors"
            >
              Cold-chain
            </Link>
            <Link
              href="/industries/automotive"
              className="text-navy-500 hover:text-ocean-600 transition-colors"
            >
              Automotive
            </Link>
            <Link
              href="/industries/personal-care"
              className="text-navy-500 hover:text-ocean-600 transition-colors"
            >
              Personal care
            </Link>
            <Link
              href="/pricing"
              className="text-navy-500 hover:text-ocean-600 transition-colors"
            >
              Pricing
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

export default IndustryPage;

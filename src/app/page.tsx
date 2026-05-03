"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import Header from "@/components/Header";
import { VercelV0Chat } from "@/components/ui/v0-ai-chat";
import { GlobeFlights } from "@/components/ui/cobe-globe-flights";
import { LogoMarquee } from "@/components/marketing/LogoMarquee";
import { CounterStrip } from "@/components/marketing/CounterStrip";
import { motion, AnimatePresence } from "framer-motion";
import {
  Ship,
  Anchor,
  Shield,
  Route,
  Calculator,
  Container,
  Truck,
  Plane,
  FileCheck,
  Snowflake,
  ArrowRight,
  Play,
  ChevronDown,
  Zap,
  Clock,
  DollarSign,
  TrendingUp,
  Globe2,
  Radar,
  CircleCheck,
} from "lucide-react";

/* ──────────────────────── DATA ──────────────────────── */

const dynamicWords = [
  "freight",
  "anywhere",
  "smarter",
  "cold-chain",
  "containers",
  "at scale",
];

const metrics = [
  { label: "Global Ports Mapped", value: "3700", suffix: "+", accent: "ocean" },
  { label: "HTS Codes Indexed", value: "200", suffix: "+", accent: "cyan" },
  { label: "FTZ Zones Covered", value: "260", suffix: "", accent: "ocean" },
  { label: "Carrier Lines Tracked", value: "8", suffix: "+", accent: "cyan" },
];

const features = [
  {
    title: "Carrier Intelligence",
    desc: "Live schedules, reliability scoring, and lane overlap detection across 8+ major lines — including Jones Act carriers.",
    icon: Ship,
    bullets: [
      "Maersk, MSC, CMA CGM, ONE, Hapag-Lloyd",
      "Matson + Pasha Hawaii for domestic US",
      "Multi-modal: ocean, rail, air, drayage",
    ],
  },
  {
    title: "FTZ Strategy & Savings",
    desc: "Lock duty rates at entry, model incremental withdrawals, and compare FTZ vs non-FTZ scenarios in minutes, not days.",
    icon: Shield,
    bullets: [
      "260+ FTZ zones mapped",
      "Duty-lock modeling for rate hedging",
      "Pallet-level withdrawal scheduling",
    ],
  },
  {
    title: "Contract Intelligence",
    desc: "Drag-drop your rate sheets. Claude parses carrier, dates, and lane rates. Flags shipments booked off-contract when you have coverage.",
    icon: FileCheck,
    bullets: [
      "BOL OCR via Claude vision",
      "Booking-on-tariff detection",
      "Lane visibility across all contracts",
    ],
  },
  {
    title: "Route Optimization",
    desc: "Compare origin-to-destination options side-by-side with transit time, cost, backhaul availability, and transshipment paths.",
    icon: Route,
    bullets: [
      "Transshipment via Panama / Cartagena",
      "Backhaul availability signals",
      "Cold chain vs general cargo split",
    ],
  },
];

const faqs = [
  {
    q: "What exactly does Shipping Savior do?",
    a: "We aggregate live schedules, rates, and reliability data from 8+ major carriers and 3,700+ ports into one decision surface. Importers, freight brokers, and NVOCCs use it to price shipments, compare carriers, model FTZ savings, and manage contracts — instead of juggling 10 carrier websites.",
  },
  {
    q: "Who is this built for?",
    a: "B2B shippers, freight brokers, NVOCCs (there are 10,000+ globally), and enterprise importers. It works equally well for cold-chain exporters (where one of our co-founders moves the majority of a top global producer's European exports), automotive and personal-care CPG, and general cargo.",
  },
  {
    q: "How is this different from Freightos or Flexport?",
    a: "Those are booking marketplaces. We're intelligence — we surface the best route + carrier + contract + FTZ strategy before you book, using carrier data that's already public but fragmented. You keep your existing booking relationships; we just make them smarter.",
  },
  {
    q: "Do you support Jones Act carriers?",
    a: "Yes. Matson and Pasha Hawaii for Hawaii / Alaska / Puerto Rico / USVI routes are fully indexed with a domestic-ocean indicator so you never confuse Jones Act rates with international freight.",
  },
  {
    q: "What about FTZ and tariff strategy?",
    a: "Every lane analysis includes a Foreign Trade Zone simulator — lock duty rates at entry, model incremental withdrawal schedules, and see exactly what FTZ entry would save on your tariff exposure this year and next.",
  },
  {
    q: "How does pricing work?",
    a: "Three tiers: Free (with ads/credits) for small importers, Premium for growing brokerages, Enterprise for large shippers. Per-user bundles up to 8, up to 20, or unlimited. Value-based: if the decisions we help you make save $100K, we're worth $5K.",
  },
];

/* ───────── helper: animated counter (Terra pattern, inline) ───────── */

function AnimatedCounter({
  value,
  suffix = "",
  accent = "ocean",
}: {
  value: string;
  suffix?: string;
  accent?: "ocean" | "cyan";
}) {
  const [display, setDisplay] = useState("0");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const target = parseFloat(value.replace(/,/g, ""));
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        let current = 0;
        const step = target / 60;
        const tick = setInterval(() => {
          current += step;
          if (current >= target) {
            setDisplay(target.toLocaleString());
            clearInterval(tick);
          } else {
            setDisplay(Math.floor(current).toLocaleString());
          }
        }, 16);
        obs.disconnect();
      },
      { threshold: 0.5 },
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [value]);

  const accentClass =
    accent === "ocean"
      ? "from-ocean-600 via-ocean-500 to-cyan-400"
      : "from-cyan-500 via-sky-400 to-ocean-500";

  return (
    <div
      ref={ref}
      className={`bg-gradient-to-br ${accentClass} bg-clip-text text-transparent font-bold tracking-tighter`}
    >
      {display}
      {suffix}
    </div>
  );
}

/* ──────────────────────── PAGE ──────────────────────── */

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [dynamicWordIndex, setDynamicWordIndex] = useState(0);
  const [dashboardTilt, setDashboardTilt] = useState(0);
  const [selectedFeature, setSelectedFeature] = useState(0);
  const [featureFade, setFeatureFade] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const dashboardRef = useRef<HTMLDivElement>(null);

  // ─── Hero chat state (AI-8775 task 3) ──────────────────────────────
  const { data: session } = useSession();
  const [chatPrompt, setChatPrompt] = useState<string | null>(null);
  const [chatResponse, setChatResponse] = useState<string>("");
  const [chatStreaming, setChatStreaming] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const chatAbortRef = useRef<AbortController | null>(null);

  const handleHeroChatSubmit = useCallback(async (message: string) => {
    // Abort any in-flight request
    if (chatAbortRef.current) {
      chatAbortRef.current.abort();
    }
    const ac = new AbortController();
    chatAbortRef.current = ac;

    setChatPrompt(message);
    setChatResponse("");
    setChatError(null);
    setChatStreaming(true);

    try {
      const res = await fetch("/api/home-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
        signal: ac.signal,
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
        throw new Error(errBody.error || `HTTP ${res.status}`);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response body");
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        // Parse SSE events (data: <json>\n\n)
        const events = buffer.split("\n\n");
        buffer = events.pop() ?? "";

        for (const evt of events) {
          const line = evt.split("\n").find((l) => l.startsWith("data: "));
          if (!line) continue;
          const json = line.slice(6).trim();
          if (!json) continue;
          try {
            const payload = JSON.parse(json);
            if (payload.type === "text" && typeof payload.content === "string") {
              setChatResponse((prev) => prev + payload.content);
            } else if (payload.type === "error") {
              setChatError(payload.error || "Stream error");
            }
          } catch {
            // ignore malformed event
          }
        }
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      setChatError(err instanceof Error ? err.message : "Chat failed");
    } finally {
      setChatStreaming(false);
    }
  }, []);

  // Hero mount fade-in
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Dynamic word rotation — instant swap, always visible. Per-char
  // reveal animation removed because it left an opacity-0 frame on
  // every cycle which made the headline read just "Ship" mid-rotation.
  useEffect(() => {
    const interval = setInterval(() => {
      setDynamicWordIndex((i) => (i + 1) % dynamicWords.length);
    }, 2600);
    return () => clearInterval(interval);
  }, []);

  // Parallax + 3D dashboard tilt
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
      if (dashboardRef.current) {
        const rect = dashboardRef.current.getBoundingClientRect();
        const vh = window.innerHeight;
        const start = vh * 0.85;
        const end = vh * 0.15;
        if (rect.top >= start) setDashboardTilt(0);
        else if (rect.top <= end) setDashboardTilt(12);
        else {
          const progress = (start - rect.top) / (start - end);
          setDashboardTilt(progress * 12);
        }
      }
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Auto-rotate feature carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setFeatureFade(false);
      setTimeout(() => {
        setSelectedFeature((i) => (i + 1) % features.length);
        setFeatureFade(true);
      }, 280);
    }, 5500);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen bg-white overflow-hidden text-navy-900">
      <Header />

      {/* ══════════════════ HERO ══════════════════ */}
      <section
        className={`relative min-h-screen flex items-center justify-center overflow-hidden transition-all duration-[1100ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isLoaded ? "scale-100 opacity-100" : "scale-[1.02] opacity-0"
        }`}
      >
        {/* Animated ocean gradient */}
        <div className="absolute inset-0 hero-gradient" />
        <div className="absolute inset-0 pattern-dots-hero" />

        {/* Floating ocean blobs */}
        <div
          className="absolute top-[15%] -left-40 w-[560px] h-[560px] bg-ocean-200/40 rounded-full filter blur-[90px] animate-blob"
          style={{ transform: `translateY(${scrollY * 0.3}px)` }}
        />
        <div
          className="absolute bottom-[10%] -right-40 w-[460px] h-[460px] bg-cyan-200/40 rounded-full filter blur-[90px] animate-blob-delay-2"
          style={{ transform: `translateY(${scrollY * 0.4}px)` }}
        />
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-indigo-200/30 rounded-full filter blur-[110px] animate-blob-delay-4"
          style={{ transform: `translateY(${scrollY * 0.2}px)` }}
        />

        <div
          className="relative z-10 max-w-6xl mx-auto px-6 text-center pt-24 pb-20"
          style={{ transform: `translateY(${scrollY * 0.15}px)` }}
        >
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 glass-premium rounded-full px-5 py-2.5 mb-8 shadow-soft">
              <Zap className="w-4 h-4 text-ocean-600" />
              <span className="text-sm font-medium text-navy-700">
                AI-Powered Logistics Intelligence
              </span>
            </div>
          </motion.div>

          {/* Headline with dynamic word + char reveal */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tighter mb-7 text-balance"
          >
            <span>Ship </span>
            <span className="inline-block bg-gradient-to-br from-ocean-600 via-ocean-500 to-cyan-400 bg-clip-text text-transparent">
              {dynamicWords[dynamicWordIndex]}
            </span>
          </motion.h1>

          {/* Subhead */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.6 }}
            className="text-lg md:text-xl text-navy-600 max-w-2xl mx-auto mb-9 leading-relaxed"
          >
            Real-time schedules, contract intelligence, FTZ modeling, and
            multi-modal routing — across 8+ carriers and 3,700+ ports. Stop
            juggling 10 carrier websites and start{" "}
            <span className="text-ocean-600 font-semibold">making better decisions</span>.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
          >
            <Link
              href="/demo"
              className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-gradient-to-r from-ocean-600 to-cyan-500 text-white font-medium shadow-lg shadow-ocean-500/25 hover:shadow-xl hover:shadow-ocean-500/35 hover:scale-[1.02] transition-all"
            >
              See Live Demo
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="#how-it-works"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full glass-premium text-navy-700 hover:bg-white/90 transition-all font-medium"
            >
              <Play className="w-4 h-4" />
              Watch How It Works
            </Link>
          </motion.div>

          {/* Hero chat */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.95, duration: 0.7 }}
            className="mb-14"
          >
            <VercelV0Chat onSubmit={handleHeroChatSubmit} />

            <AnimatePresence>
              {(chatPrompt || chatStreaming) && (
                <motion.div
                  key="hero-chat-response"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.35 }}
                  className="max-w-4xl mx-auto mt-6 text-left"
                >
                  <div className="rounded-2xl border border-ocean-100 bg-white/80 backdrop-blur-sm shadow-soft p-5 md:p-6">
                    {chatPrompt && (
                      <div className="mb-3 text-xs uppercase tracking-wider text-navy-400 font-medium">
                        You asked
                      </div>
                    )}
                    {chatPrompt && (
                      <p className="text-sm md:text-base text-navy-700 mb-4 italic">
                        &ldquo;{chatPrompt}&rdquo;
                      </p>
                    )}
                    <div className="text-xs uppercase tracking-wider text-ocean-600 font-medium mb-2">
                      Shipping Savior AI
                    </div>
                    {chatError ? (
                      <p className="text-sm text-red-600">
                        {chatError}
                      </p>
                    ) : (
                      <p className="text-sm md:text-base text-navy-800 whitespace-pre-wrap leading-relaxed">
                        {chatResponse}
                        {chatStreaming && (
                          <span
                            aria-hidden="true"
                            className="inline-block w-2 h-4 ml-0.5 align-middle bg-ocean-500 animate-pulse"
                          />
                        )}
                      </p>
                    )}
                    {!chatStreaming && !chatError && !session?.user && chatResponse.length > 0 && (
                      <Link
                        href="/register"
                        className="inline-flex items-center gap-1 mt-4 text-sm font-medium text-ocean-600 hover:text-ocean-700 transition-colors"
                      >
                        Sign up free to save this conversation
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Dashboard mock with 3D tilt */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.8 }}
            ref={dashboardRef}
            style={{ perspective: "1400px" }}
            className="max-w-5xl mx-auto"
          >
            <div
              className="relative aspect-[16/9] rounded-3xl overflow-hidden shadow-2xl shadow-ocean-900/20 border border-ocean-100/60"
              style={{
                transform: `rotateX(${dashboardTilt}deg)`,
                transformStyle: "preserve-3d",
                transition: "transform 0.1s linear",
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-ocean-500/10 via-white to-cyan-100/40" />
              <div className="relative h-full grid grid-cols-4 gap-4 p-6 bg-white/60 backdrop-blur-sm">
                {[
                  { label: "Active Shipments", val: "12", trend: "+2%", icon: Container },
                  { label: "Monthly Volume", val: "$450K", trend: "+8.3%", icon: DollarSign },
                  { label: "Duty Savings MTD", val: "$18,500", trend: "+12.4%", icon: Shield },
                  { label: "Container Utilization", val: "78%", trend: "+1.8%", icon: TrendingUp },
                ].map((card, i) => (
                  <div
                    key={i}
                    className="glass-premium rounded-2xl p-4 flex flex-col justify-between border border-ocean-100/40"
                  >
                    <div className="flex items-start justify-between">
                      <p className="text-[11px] uppercase tracking-wider text-navy-500 font-medium">
                        {card.label}
                      </p>
                      <card.icon className="w-4 h-4 text-ocean-500" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-navy-900 tracking-tight">
                        {card.val}
                      </div>
                      <div className="text-xs text-emerald-600 font-medium mt-1">
                        {card.trend}
                      </div>
                    </div>
                  </div>
                ))}
                <div className="col-span-4 glass-premium rounded-2xl p-4 border border-ocean-100/40 flex items-center gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-ocean-500 to-cyan-400 flex items-center justify-center">
                    <Ship className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-navy-900">
                      MAEU-7842193 · Qingdao → Long Beach
                    </div>
                    <div className="text-xs text-navy-500">
                      ETA 2026-04-28 · 6,800 TEU · Ocean Alliance · On-time 94%
                    </div>
                  </div>
                  <div className="text-xs px-3 py-1.5 rounded-full bg-ocean-100 text-ocean-700 font-medium">
                    In Transit
                  </div>
                </div>
              </div>
            </div>
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

      {/* ══════════════════ COUNTER STRIP ══════════════════ */}
      <CounterStrip />

      {/* ══════════════════ METRICS ══════════════════ */}
      <section id="metrics" className="relative py-24 md:py-32 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14 md:mb-20">
            <p className="text-sm font-medium text-ocean-600 tracking-wider uppercase mb-4">
              Coverage at a glance
            </p>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter text-navy-900 mb-5 text-balance">
              Everywhere you ship,{" "}
              <span className="bg-gradient-to-br from-ocean-600 via-ocean-500 to-cyan-400 bg-clip-text text-transparent">
                we see it
              </span>
            </h2>
            <p className="text-navy-500 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
              Real coverage, real ports, real carriers — aggregated from
              public schedule data and refreshed every day.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {metrics.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{
                  delay: i * 0.1,
                  duration: 0.7,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="glass-premium rounded-3xl p-6 md:p-8 border border-ocean-100/60 hover:border-ocean-200/80 hover:-translate-y-1 transition-all shadow-soft"
              >
                <div className="flex items-center gap-2 mb-5">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      m.accent === "ocean" ? "bg-ocean-500" : "bg-cyan-400"
                    } animate-pulse`}
                  />
                  <span className="text-[11px] md:text-xs uppercase tracking-widest text-navy-500 font-medium">
                    {m.label}
                  </span>
                </div>
                <div className="text-5xl md:text-6xl lg:text-7xl leading-none">
                  <AnimatedCounter
                    value={m.value}
                    suffix={m.suffix}
                    accent={m.accent as "ocean" | "cyan"}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ GLOBAL TRADE LANES ══════════════════ */}
      <section className="relative py-24 md:py-32 px-6 bg-gradient-to-b from-white via-ocean-50/50 to-white overflow-hidden">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="text-sm font-medium text-ocean-600 tracking-wider uppercase mb-4">
              Global Coverage
            </p>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter text-navy-900 mb-6 text-balance">
              Every lane,{" "}
              <span className="bg-gradient-to-br from-ocean-600 via-ocean-500 to-cyan-400 bg-clip-text text-transparent">
                every carrier
              </span>
              , one view
            </h2>
            <p className="text-navy-600 text-lg leading-relaxed mb-8">
              We aggregate live schedules, reliability scores, and rates across
              3,700+ ports and 8+ major carrier lines — including Jones Act
              carriers for domestic US routes. From Qingdao to Long Beach,
              Rotterdam to Central America, Seattle to Honolulu.
            </p>
            <ul className="space-y-3 text-navy-700">
              {[
                "Ocean · rail intermodal · air freight · drayage",
                "Carrier reliability scoring from VSA alliance + on-time history",
                "Jones Act support (Matson, Pasha Hawaii) for domestic US routes",
                "Cold chain + general cargo split, all in one place",
              ].map((pt, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CircleCheck className="w-5 h-5 text-ocean-500 flex-shrink-0 mt-0.5" />
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-lg mx-auto"
          >
            <GlobeFlights />
          </motion.div>
        </div>
      </section>

      {/* ══════════════════ FEATURE CAROUSEL ══════════════════ */}
      <section
        id="how-it-works"
        className="relative py-24 md:py-32 px-6 bg-white overflow-hidden"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14 md:mb-20">
            <p className="text-sm font-medium text-ocean-600 tracking-wider uppercase mb-4">
              How it works
            </p>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter text-navy-900 mb-5 text-balance">
              Four intelligence layers,{" "}
              <span className="bg-gradient-to-br from-ocean-600 via-ocean-500 to-cyan-400 bg-clip-text text-transparent">
                one decision
              </span>
            </h2>
            <p className="text-navy-500 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
              Click any feature to dive in. Auto-rotates every few seconds —
              your click pauses the rotation.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-10 lg:gap-16 items-center">
            {/* Feature buttons */}
            <div className="space-y-4">
              {features.map((f, i) => {
                const Icon = f.icon;
                const active = i === selectedFeature;
                return (
                  <button
                    key={i}
                    onClick={() => {
                      setFeatureFade(false);
                      setTimeout(() => {
                        setSelectedFeature(i);
                        setFeatureFade(true);
                      }, 200);
                    }}
                    className={`relative w-full text-left flex gap-4 items-start p-5 md:p-6 rounded-2xl transition-all overflow-hidden border ${
                      active
                        ? "glass-premium border-ocean-200/80 shadow-soft"
                        : "bg-white/50 border-navy-100 hover:border-ocean-100"
                    }`}
                  >
                    <div
                      className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                        active
                          ? "bg-gradient-to-br from-ocean-500 to-cyan-400 text-white shadow-lg shadow-ocean-500/30"
                          : "bg-ocean-50 text-ocean-500"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h3
                        className={`text-lg md:text-xl font-semibold mb-1 ${
                          active ? "text-navy-900" : "text-navy-700"
                        }`}
                      >
                        {f.title}
                      </h3>
                      <p
                        className={`text-sm md:text-base leading-relaxed ${
                          active ? "text-navy-600" : "text-navy-500"
                        }`}
                      >
                        {f.desc}
                      </p>
                    </div>
                    {active && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-ocean-100 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-ocean-500 to-cyan-400"
                          style={{
                            animation: "featureProgress 5.5s linear",
                          }}
                        />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Feature detail card */}
            <motion.div
              key={selectedFeature}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: featureFade ? 1 : 0, y: featureFade ? 0 : 14 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="relative"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-ocean-900/15 border border-ocean-100/60 bg-gradient-to-br from-white via-ocean-50/40 to-cyan-50/40">
                <div className="aspect-[4/5] md:aspect-square p-8 md:p-10 flex flex-col justify-end relative">
                  {/* Decorative blobs inside card */}
                  <div className="absolute top-10 right-10 w-40 h-40 bg-ocean-200/40 rounded-full filter blur-2xl" />
                  <div className="absolute bottom-20 left-10 w-48 h-48 bg-cyan-200/40 rounded-full filter blur-2xl" />

                  <div className="relative z-10">
                    {(() => {
                      const F = features[selectedFeature];
                      const Icon = F.icon;
                      return (
                        <>
                          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-ocean-500 to-cyan-400 flex items-center justify-center mb-6 shadow-xl shadow-ocean-500/30">
                            <Icon className="w-7 h-7 text-white" />
                          </div>
                          <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-navy-900 mb-4">
                            {F.title}
                          </h3>
                          <ul className="space-y-2.5">
                            {F.bullets.map((b, bi) => (
                              <li
                                key={bi}
                                className="flex items-start gap-2 text-navy-700"
                              >
                                <span className="flex-shrink-0 mt-2 w-1.5 h-1.5 rounded-full bg-ocean-500" />
                                <span className="text-sm md:text-base">{b}</span>
                              </li>
                            ))}
                          </ul>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════ FAQ ══════════════════ */}
      <section className="relative py-24 md:py-32 px-6 bg-gradient-to-b from-white to-ocean-50/40">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <p className="text-sm font-medium text-ocean-600 tracking-wider uppercase mb-4">
              Frequently asked
            </p>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter text-navy-900 mb-5 text-balance">
              Got{" "}
              <span className="bg-gradient-to-br from-ocean-600 via-ocean-500 to-cyan-400 bg-clip-text text-transparent">
                questions
              </span>
              ?
            </h2>
            <p className="text-navy-500 text-base md:text-lg max-w-xl mx-auto leading-relaxed">
              Everything buyers, brokers, and investors ask us — up front.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((f, i) => {
              const open = openFaq === i;
              return (
                <div
                  key={i}
                  className={`glass-premium rounded-2xl border transition-all overflow-hidden ${
                    open
                      ? "border-ocean-200/80 shadow-soft"
                      : "border-navy-100 hover:border-ocean-100"
                  }`}
                >
                  <button
                    onClick={() => setOpenFaq(open ? null : i)}
                    aria-expanded={open}
                    aria-controls={`faq-panel-${i}`}
                    className="w-full flex items-center justify-between p-5 md:p-6 text-left"
                  >
                    <span className="text-base md:text-lg font-semibold text-navy-900 pr-4">
                      {f.q}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 flex-shrink-0 text-ocean-500 transition-transform duration-300 ${
                        open ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  <div
                    id={`faq-panel-${i}`}
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      open ? "max-h-[520px] opacity-100" : "max-h-0 opacity-0"
                    }`}
                  >
                    <p className="px-5 md:px-6 pb-5 md:pb-6 text-navy-600 leading-relaxed text-sm md:text-base">
                      {f.a}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════ CTA ══════════════════ */}
      <section
        id="cta"
        className="relative py-28 md:py-40 px-6 overflow-hidden"
      >
        {/* Ocean gradient background */}
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
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md border border-white/25 rounded-full px-5 py-2 mb-8 text-sm text-white font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            Investor Demo · Las Vegas · May 11
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter text-white mb-6 text-balance">
            Ready to see it in action?
          </h2>
          <p className="text-white/85 text-lg md:text-xl mb-10 leading-relaxed max-w-2xl mx-auto">
            Book a walkthrough of the platform — Qingdao → LA, West Coast
            cross-dock optimization, multi-modal routing, FTZ strategy, and
            contract intelligence. 20 minutes, zero slides.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/demo"
              className="group inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white text-ocean-700 font-semibold shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all"
            >
              See Live Demo
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/jv-agreement"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white/10 backdrop-blur-md border border-white/30 text-white font-semibold hover:bg-white/20 transition-all"
            >
              View JV Agreement
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════ FOOTER ══════════════════ */}
      <footer className="relative px-6 py-12 bg-white border-t border-ocean-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-ocean-500 to-cyan-400 flex items-center justify-center">
                  <Ship className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-navy-900">
                  Shipping Savior
                </span>
              </div>
              <p className="text-xs text-navy-500 leading-relaxed">
                Global trade intelligence for shippers, brokers, and NVOCCs.
                Built by Julian Bradley + Blake Harwell.
              </p>
            </div>
            <div>
              <div className="text-xs uppercase tracking-widest text-navy-700 font-semibold mb-4">
                Platform
              </div>
              <div className="space-y-2.5">
                <Link href="/carrier-comparison" className="block text-sm text-navy-500 hover:text-ocean-600">
                  Carriers
                </Link>
                <Link href="/port-finder" className="block text-sm text-navy-500 hover:text-ocean-600">
                  Ports
                </Link>
                <Link href="/ftz-analyzer" className="block text-sm text-navy-500 hover:text-ocean-600">
                  FTZ Analyzer
                </Link>
                <Link href="/knowledge-base" className="block text-sm text-navy-500 hover:text-ocean-600">
                  Knowledge Base
                </Link>
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-widest text-navy-700 font-semibold mb-4">
                Product
              </div>
              <div className="space-y-2.5">
                <Link href="/demo" className="block text-sm text-navy-500 hover:text-ocean-600">
                  Demo
                </Link>
                <Link href="/pricing" className="block text-sm text-navy-500 hover:text-ocean-600">
                  Pricing
                </Link>
                <Link href="/dashboard" className="block text-sm text-navy-500 hover:text-ocean-600">
                  Dashboard
                </Link>
                <Link href="/phases" className="block text-sm text-navy-500 hover:text-ocean-600">
                  Roadmap
                </Link>
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-widest text-navy-700 font-semibold mb-4">
                Company
              </div>
              <div className="space-y-2.5">
                <Link href="/jv-agreement" className="block text-sm text-navy-500 hover:text-ocean-600">
                  JV Agreement
                </Link>
                <Link href="/tech-spec" className="block text-sm text-navy-500 hover:text-ocean-600">
                  Tech Spec
                </Link>
                <Link href="/six-sigma" className="block text-sm text-navy-500 hover:text-ocean-600">
                  Six Sigma
                </Link>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-ocean-50 flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-navy-400">
            <div>© 2026 Shipping Savior · Julian Bradley × Blake Harwell</div>
          </div>
        </div>
      </footer>
    </main>
  );
}

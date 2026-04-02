"use client";

import { useState, useEffect, useMemo } from "react";
import Header from "@/components/Header";
import AnimatedSection, { AnimatedItem } from "@/components/ui/AnimatedSection";
import GlassCard from "@/components/ui/GlassCard";
import GradientButton from "@/components/ui/GradientButton";
import { motion, AnimatePresence } from "framer-motion";
import Fuse from "fuse.js";
import {
  Ship, Search, ArrowRight, Clock, Shield, TrendingUp,
  ChevronDown, ChevronUp, Anchor, BarChart3, Calendar,
  SortAsc, Filter, Zap, ArrowUpDown, Globe,
} from "lucide-react";

/* ─────────── TYPES ─────────── */

interface Port {
  locode: string;
  name: string;
  country: string;
  country_code: string;
  annual_teu: number;
}

interface CarrierResult {
  carrier: string;
  carrierCode: string;
  alliance: string;
  transitMin: number;
  transitMax: number;
  reliabilityPercent: number;
  reliabilityGrade: "A" | "B" | "C" | "D" | "F";
  avgDelayDays: number;
  upcomingSailings: {
    vessel: string;
    departure: string;
    arrival: string;
    transitDays: number;
  }[];
}

type SortMode = "fastest" | "reliable" | "soonest";

/* ─────────── MOCK DATA ─────────── */
// TODO: Replace with real API calls to /api/schedules/search, /api/carriers/reliability, /api/carriers/ports

const MOCK_CARRIERS: Record<string, CarrierResult[]> = {
  "CNQIN-USLAX": [
    {
      carrier: "Maersk",
      carrierCode: "MAEU",
      alliance: "2M",
      transitMin: 22,
      transitMax: 26,
      reliabilityPercent: 87,
      reliabilityGrade: "B",
      avgDelayDays: 1.8,
      upcomingSailings: [
        { vessel: "Maersk Eindhoven", departure: "2026-04-02", arrival: "2026-04-26", transitDays: 24 },
        { vessel: "Maersk Emerald", departure: "2026-04-09", arrival: "2026-05-01", transitDays: 22 },
        { vessel: "Maersk Elba", departure: "2026-04-16", arrival: "2026-05-10", transitDays: 24 },
      ],
    },
    {
      carrier: "MSC",
      carrierCode: "MSCU",
      alliance: "2M",
      transitMin: 23,
      transitMax: 28,
      reliabilityPercent: 82,
      reliabilityGrade: "B",
      avgDelayDays: 2.3,
      upcomingSailings: [
        { vessel: "MSC Gulsun", departure: "2026-04-03", arrival: "2026-04-28", transitDays: 25 },
        { vessel: "MSC Isabella", departure: "2026-04-10", arrival: "2026-05-05", transitDays: 25 },
        { vessel: "MSC Mia", departure: "2026-04-17", arrival: "2026-05-13", transitDays: 26 },
      ],
    },
    {
      carrier: "CMA CGM",
      carrierCode: "CMDU",
      alliance: "Ocean Alliance",
      transitMin: 21,
      transitMax: 25,
      reliabilityPercent: 91,
      reliabilityGrade: "A",
      avgDelayDays: 1.2,
      upcomingSailings: [
        { vessel: "CMA CGM Marco Polo", departure: "2026-04-01", arrival: "2026-04-23", transitDays: 22 },
        { vessel: "CMA CGM Bougainville", departure: "2026-04-08", arrival: "2026-04-29", transitDays: 21 },
        { vessel: "CMA CGM Jules Verne", departure: "2026-04-15", arrival: "2026-05-07", transitDays: 22 },
      ],
    },
    {
      carrier: "COSCO",
      carrierCode: "COSU",
      alliance: "Ocean Alliance",
      transitMin: 24,
      transitMax: 30,
      reliabilityPercent: 78,
      reliabilityGrade: "C",
      avgDelayDays: 3.1,
      upcomingSailings: [
        { vessel: "COSCO Shipping Universe", departure: "2026-04-04", arrival: "2026-04-30", transitDays: 26 },
        { vessel: "COSCO Nebula", departure: "2026-04-11", arrival: "2026-05-09", transitDays: 28 },
        { vessel: "COSCO Galaxy", departure: "2026-04-18", arrival: "2026-05-14", transitDays: 26 },
      ],
    },
    {
      carrier: "Hapag-Lloyd",
      carrierCode: "HLCU",
      alliance: "THE Alliance",
      transitMin: 23,
      transitMax: 27,
      reliabilityPercent: 89,
      reliabilityGrade: "B",
      avgDelayDays: 1.5,
      upcomingSailings: [
        { vessel: "Berlin Express", departure: "2026-04-05", arrival: "2026-04-29", transitDays: 24 },
        { vessel: "Hamburg Express", departure: "2026-04-12", arrival: "2026-05-05", transitDays: 23 },
        { vessel: "Colombo Express", departure: "2026-04-19", arrival: "2026-05-14", transitDays: 25 },
      ],
    },
    {
      carrier: "ONE",
      carrierCode: "ONEY",
      alliance: "THE Alliance",
      transitMin: 22,
      transitMax: 26,
      reliabilityPercent: 85,
      reliabilityGrade: "B",
      avgDelayDays: 2.0,
      upcomingSailings: [
        { vessel: "ONE Columba", departure: "2026-04-06", arrival: "2026-04-30", transitDays: 24 },
        { vessel: "ONE Apus", departure: "2026-04-13", arrival: "2026-05-05", transitDays: 22 },
        { vessel: "ONE Minato", departure: "2026-04-20", arrival: "2026-05-14", transitDays: 24 },
      ],
    },
    {
      carrier: "Evergreen",
      carrierCode: "EGLV",
      alliance: "Ocean Alliance",
      transitMin: 24,
      transitMax: 28,
      reliabilityPercent: 76,
      reliabilityGrade: "C",
      avgDelayDays: 3.4,
      upcomingSailings: [
        { vessel: "Ever Golden", departure: "2026-04-07", arrival: "2026-05-02", transitDays: 25 },
        { vessel: "Ever Gifted", departure: "2026-04-14", arrival: "2026-05-10", transitDays: 26 },
        { vessel: "Ever Glory", departure: "2026-04-21", arrival: "2026-05-17", transitDays: 26 },
      ],
    },
  ],
};

/* ─────────── GRADE HELPERS ─────────── */

const gradeColors: Record<string, { bg: string; text: string; ring: string }> = {
  A: { bg: "bg-emerald-50", text: "text-emerald-700", ring: "ring-emerald-200" },
  B: { bg: "bg-blue-50", text: "text-blue-700", ring: "ring-blue-200" },
  C: { bg: "bg-amber-50", text: "text-amber-700", ring: "ring-amber-200" },
  D: { bg: "bg-orange-50", text: "text-orange-700", ring: "ring-orange-200" },
  F: { bg: "bg-red-50", text: "text-red-700", ring: "ring-red-200" },
};

const allianceColors: Record<string, string> = {
  "2M": "bg-blue-100 text-blue-700",
  "Ocean Alliance": "bg-teal-100 text-teal-700",
  "THE Alliance": "bg-purple-100 text-purple-700",
};

const carrierInitialColors: Record<string, string> = {
  MAEU: "from-sky-500 to-blue-600",
  MSCU: "from-blue-600 to-indigo-700",
  CMDU: "from-red-500 to-red-600",
  COSU: "from-blue-700 to-blue-900",
  HLCU: "from-orange-500 to-orange-600",
  ONEY: "from-pink-500 to-pink-600",
  EGLV: "from-green-600 to-green-700",
};

function getCarrierInitials(name: string): string {
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/* ─────────── COMPONENT ─────────── */

export default function CarrierComparisonPage() {
  const [ports, setPorts] = useState<Port[]>([]);
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [originSearch, setOriginSearch] = useState("");
  const [destSearch, setDestSearch] = useState("");
  const [showOriginDropdown, setShowOriginDropdown] = useState(false);
  const [showDestDropdown, setShowDestDropdown] = useState(false);
  const [results, setResults] = useState<CarrierResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [sortMode, setSortMode] = useState<SortMode>("fastest");
  const [expandedCarrier, setExpandedCarrier] = useState<string | null>(null);

  // Load ports
  useEffect(() => {
    fetch("/data/ports.json")
      .then((r) => r.json())
      .then((data) => {
        setPorts(data);
        // Set defaults: Qingdao -> Los Angeles
        const qingdao = data.find((p: Port) => p.locode === "CNQIN");
        const la = data.find((p: Port) => p.locode === "USLAX");
        if (qingdao) {
          setOrigin(qingdao.locode);
          setOriginSearch(`${qingdao.name} (${qingdao.locode})`);
        }
        if (la) {
          setDestination(la.locode);
          setDestSearch(`${la.name} (${la.locode})`);
        }
      })
      .catch(() => {});
  }, []);

  // Fuse search instances
  const fuse = useMemo(
    () =>
      new Fuse(ports, {
        keys: ["name", "locode", "country"],
        threshold: 0.3,
      }),
    [ports]
  );

  const originResults = useMemo(() => {
    if (!originSearch.trim()) return ports.slice(0, 8);
    return fuse.search(originSearch).map((r) => r.item).slice(0, 8);
  }, [originSearch, fuse, ports]);

  const destResults = useMemo(() => {
    if (!destSearch.trim()) return ports.slice(0, 8);
    return fuse.search(destSearch).map((r) => r.item).slice(0, 8);
  }, [destSearch, fuse, ports]);

  // Handle search
  async function handleCompare() {
    if (!origin || !destination) return;
    setLoading(true);
    setResults(null);

    // TODO: Replace with real API calls:
    // 1. const schedules = await fetch(`/api/schedules/search?origin=${origin}&destination=${destination}`).then(r => r.json());
    // 2. const reliability = await fetch(`/api/carriers/reliability`).then(r => r.json());
    // 3. const carrierPorts = await fetch(`/api/carriers/ports?port1=${origin}&port2=${destination}`).then(r => r.json());

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const routeKey = `${origin}-${destination}`;
    const mockResults = MOCK_CARRIERS[routeKey] || MOCK_CARRIERS["CNQIN-USLAX"];
    setResults(mockResults);
    setLoading(false);
  }

  // Sort results
  const sortedResults = useMemo(() => {
    if (!results) return null;
    const sorted = [...results];
    switch (sortMode) {
      case "fastest":
        sorted.sort((a, b) => a.transitMin - b.transitMin);
        break;
      case "reliable":
        sorted.sort((a, b) => b.reliabilityPercent - a.reliabilityPercent);
        break;
      case "soonest":
        sorted.sort(
          (a, b) =>
            new Date(a.upcomingSailings[0]?.departure || "").getTime() -
            new Date(b.upcomingSailings[0]?.departure || "").getTime()
        );
        break;
    }
    return sorted;
  }, [results, sortMode]);

  // Stats
  const stats = useMemo(() => {
    if (!results) return null;
    return {
      count: results.length,
      fastest: Math.min(...results.map((r) => r.transitMin)),
      mostReliable: Math.max(...results.map((r) => r.reliabilityPercent)),
    };
  }, [results]);

  function selectOriginPort(port: Port) {
    setOrigin(port.locode);
    setOriginSearch(`${port.name} (${port.locode})`);
    setShowOriginDropdown(false);
  }

  function selectDestPort(port: Port) {
    setDestination(port.locode);
    setDestSearch(`${port.name} (${port.locode})`);
    setShowDestDropdown(false);
  }

  return (
    <main className="min-h-screen bg-white overflow-hidden">
      <Header />

      {/* ══════════ HERO ══════════ */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
        <div className="absolute inset-0 hero-gradient" />
        <div className="absolute inset-0 pattern-dots-hero" />
        <div className="absolute top-1/3 -left-32 w-[400px] h-[400px] bg-ocean-300/20 rounded-full filter blur-[80px] animate-blob" />
        <div className="absolute bottom-1/4 -right-32 w-[350px] h-[350px] bg-indigo-300/15 rounded-full filter blur-[80px] animate-blob-delay-2" />

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 glass-premium rounded-full px-5 py-2.5 mb-6 shadow-soft">
              <BarChart3 className="w-4 h-4 text-ocean-600" />
              <span className="text-sm font-medium text-navy-600">
                Side-by-Side Analysis
              </span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.7 }}
            className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tighter mb-5 text-navy-900"
          >
            Compare{" "}
            <span className="gradient-text-hero">Shipping Lines</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.6 }}
            className="text-lg md:text-xl text-navy-500 max-w-2xl mx-auto leading-relaxed"
          >
            See transit times, reliability scores, and upcoming schedules
            side-by-side across all major carriers.
          </motion.p>
        </div>

        <div className="absolute bottom-0 left-0 right-0 z-10">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0,32L80,26.7C160,21,320,11,480,10.7C640,11,800,21,960,26.7C1120,32,1280,32,1360,32L1440,32L1440,60L0,60Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* ══════════ SEARCH FORM ══════════ */}
      <section className="py-12 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection>
            <GlassCard className="p-6 md:p-8">
              <div className="grid md:grid-cols-[1fr_1fr_auto] gap-4 items-end">
                {/* Origin */}
                <div className="relative">
                  <label className="block text-sm font-semibold text-navy-700 mb-2">
                    Origin Port
                  </label>
                  <div className="relative">
                    <Anchor className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
                    <input
                      type="text"
                      value={originSearch}
                      onChange={(e) => {
                        setOriginSearch(e.target.value);
                        setShowOriginDropdown(true);
                      }}
                      onFocus={() => setShowOriginDropdown(true)}
                      onBlur={() => setTimeout(() => setShowOriginDropdown(false), 200)}
                      placeholder="Search ports..."
                      className="input-light pl-10"
                    />
                  </div>
                  {showOriginDropdown && originResults.length > 0 && (
                    <div className="absolute z-30 w-full mt-1 bg-white border border-navy-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                      {originResults.map((port) => (
                        <button
                          key={port.locode}
                          onMouseDown={() => selectOriginPort(port)}
                          className="w-full text-left px-4 py-2.5 hover:bg-ocean-50 transition-colors text-sm"
                        >
                          <span className="font-medium text-navy-800">
                            {port.name}
                          </span>
                          <span className="text-navy-400 ml-2">
                            {port.country} &middot; {port.locode}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Destination */}
                <div className="relative">
                  <label className="block text-sm font-semibold text-navy-700 mb-2">
                    Destination Port
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
                    <input
                      type="text"
                      value={destSearch}
                      onChange={(e) => {
                        setDestSearch(e.target.value);
                        setShowDestDropdown(true);
                      }}
                      onFocus={() => setShowDestDropdown(true)}
                      onBlur={() => setTimeout(() => setShowDestDropdown(false), 200)}
                      placeholder="Search ports..."
                      className="input-light pl-10"
                    />
                  </div>
                  {showDestDropdown && destResults.length > 0 && (
                    <div className="absolute z-30 w-full mt-1 bg-white border border-navy-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                      {destResults.map((port) => (
                        <button
                          key={port.locode}
                          onMouseDown={() => selectDestPort(port)}
                          className="w-full text-left px-4 py-2.5 hover:bg-ocean-50 transition-colors text-sm"
                        >
                          <span className="font-medium text-navy-800">
                            {port.name}
                          </span>
                          <span className="text-navy-400 ml-2">
                            {port.country} &middot; {port.locode}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Compare Button */}
                <div>
                  <GradientButton onClick={handleCompare} className="w-full md:w-auto whitespace-nowrap">
                    <Search className="w-5 h-5" />
                    Compare
                  </GradientButton>
                </div>
              </div>
            </GlassCard>
          </AnimatedSection>
        </div>
      </section>

      {/* ══════════ RESULTS ══════════ */}
      <section className="pb-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-12 h-12 rounded-full border-4 border-ocean-200 border-t-ocean-600 animate-spin" />
              <p className="text-navy-500 mt-4 text-sm">Searching carriers...</p>
            </div>
          )}

          {/* Results */}
          <AnimatePresence>
            {sortedResults && !loading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {/* Summary Cards */}
                {stats && (
                  <AnimatedSection stagger className="grid grid-cols-3 gap-4 mb-8">
                    <AnimatedItem>
                      <GlassCard className="p-5 text-center">
                        <Ship className="w-6 h-6 text-ocean-500 mx-auto mb-2" />
                        <div className="text-3xl font-bold text-navy-900">{stats.count}</div>
                        <div className="text-xs font-medium text-navy-400 uppercase tracking-wider mt-1">
                          Carriers Found
                        </div>
                      </GlassCard>
                    </AnimatedItem>
                    <AnimatedItem>
                      <GlassCard className="p-5 text-center">
                        <Clock className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
                        <div className="text-3xl font-bold text-navy-900">{stats.fastest} days</div>
                        <div className="text-xs font-medium text-navy-400 uppercase tracking-wider mt-1">
                          Fastest Transit
                        </div>
                      </GlassCard>
                    </AnimatedItem>
                    <AnimatedItem>
                      <GlassCard className="p-5 text-center">
                        <Shield className="w-6 h-6 text-indigo-500 mx-auto mb-2" />
                        <div className="text-3xl font-bold text-navy-900">{stats.mostReliable}%</div>
                        <div className="text-xs font-medium text-navy-400 uppercase tracking-wider mt-1">
                          Most Reliable
                        </div>
                      </GlassCard>
                    </AnimatedItem>
                  </AnimatedSection>
                )}

                {/* Sort Controls */}
                <div className="flex items-center gap-2 mb-6 flex-wrap">
                  <ArrowUpDown className="w-4 h-4 text-navy-400" />
                  <span className="text-sm font-medium text-navy-500 mr-1">Sort by:</span>
                  {([
                    { key: "fastest", label: "Fastest", icon: Clock },
                    { key: "reliable", label: "Most Reliable", icon: Shield },
                    { key: "soonest", label: "Soonest Departure", icon: Calendar },
                  ] as const).map(({ key, label, icon: Icon }) => (
                    <button
                      key={key}
                      onClick={() => setSortMode(key)}
                      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                        sortMode === key
                          ? "bg-ocean-600 text-white shadow-md"
                          : "bg-navy-50 text-navy-600 hover:bg-navy-100"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {label}
                    </button>
                  ))}
                </div>

                {/* Carrier Cards */}
                <AnimatedSection stagger className="space-y-4">
                  {sortedResults.map((carrier, idx) => {
                    const isExpanded = expandedCarrier === carrier.carrierCode;
                    const gradeStyle = gradeColors[carrier.reliabilityGrade];
                    const colorGradient = carrierInitialColors[carrier.carrierCode] || "from-navy-500 to-navy-700";

                    return (
                      <AnimatedItem key={carrier.carrierCode}>
                        <GlassCard
                          hover={false}
                          className={`overflow-hidden transition-all duration-300 ${
                            isExpanded ? "ring-2 ring-ocean-300" : ""
                          }`}
                        >
                          {/* Main Row */}
                          <div className="p-5 md:p-6">
                            <div className="flex flex-col md:flex-row md:items-center gap-4">
                              {/* Carrier Identity */}
                              <div className="flex items-center gap-4 md:w-56 shrink-0">
                                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${colorGradient} flex items-center justify-center shadow-lg shrink-0`}>
                                  <span className="text-white font-bold text-sm">
                                    {getCarrierInitials(carrier.carrier)}
                                  </span>
                                </div>
                                <div>
                                  <h3 className="font-bold text-navy-900 text-lg leading-tight">
                                    {carrier.carrier}
                                  </h3>
                                  <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${allianceColors[carrier.alliance] || "bg-navy-100 text-navy-600"}`}>
                                    {carrier.alliance}
                                  </span>
                                </div>
                              </div>

                              {/* Stats Grid */}
                              <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                                {/* Transit Time */}
                                <div className="text-center md:text-left">
                                  <div className="text-xs text-navy-400 font-medium uppercase tracking-wider mb-1">
                                    Transit
                                  </div>
                                  <div className="text-xl font-bold text-navy-900">
                                    {carrier.transitMin}-{carrier.transitMax}
                                    <span className="text-sm font-normal text-navy-400 ml-1">days</span>
                                  </div>
                                </div>

                                {/* Reliability */}
                                <div className="text-center md:text-left">
                                  <div className="text-xs text-navy-400 font-medium uppercase tracking-wider mb-1">
                                    Reliability
                                  </div>
                                  <div className="flex items-center gap-2 justify-center md:justify-start">
                                    <span className="text-xl font-bold text-navy-900">
                                      {carrier.reliabilityPercent}%
                                    </span>
                                    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold ring-1 ${gradeStyle.bg} ${gradeStyle.text} ${gradeStyle.ring}`}>
                                      {carrier.reliabilityGrade}
                                    </span>
                                  </div>
                                </div>

                                {/* Avg Delay */}
                                <div className="text-center md:text-left">
                                  <div className="text-xs text-navy-400 font-medium uppercase tracking-wider mb-1">
                                    Avg Delay
                                  </div>
                                  <div className="text-xl font-bold text-navy-900">
                                    {carrier.avgDelayDays}
                                    <span className="text-sm font-normal text-navy-400 ml-1">days</span>
                                  </div>
                                </div>

                                {/* Next Sailing */}
                                <div className="text-center md:text-left">
                                  <div className="text-xs text-navy-400 font-medium uppercase tracking-wider mb-1">
                                    Next Sailing
                                  </div>
                                  <div className="text-sm font-semibold text-ocean-600">
                                    {formatDate(carrier.upcomingSailings[0]?.departure || "")}
                                  </div>
                                </div>
                              </div>

                              {/* Expand Button */}
                              <button
                                onClick={() =>
                                  setExpandedCarrier(
                                    isExpanded ? null : carrier.carrierCode
                                  )
                                }
                                className="shrink-0 p-2 rounded-xl hover:bg-navy-50 transition-colors text-navy-400 hover:text-ocean-600"
                                aria-label="View full schedule"
                              >
                                {isExpanded ? (
                                  <ChevronUp className="w-5 h-5" />
                                ) : (
                                  <ChevronDown className="w-5 h-5" />
                                )}
                              </button>
                            </div>
                          </div>

                          {/* Expanded Schedule */}
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="overflow-hidden"
                              >
                                <div className="px-5 md:px-6 pb-5 md:pb-6 border-t border-navy-100 pt-5">
                                  <h4 className="text-sm font-bold text-navy-700 mb-4 flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-ocean-500" />
                                    Upcoming Sailings
                                  </h4>
                                  <div className="grid gap-3">
                                    {carrier.upcomingSailings.map((sailing, si) => (
                                      <div
                                        key={si}
                                        className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 p-3 bg-navy-50/80 rounded-xl"
                                      >
                                        <div className="flex items-center gap-2 sm:w-48">
                                          <Ship className="w-4 h-4 text-ocean-500 shrink-0" />
                                          <span className="font-semibold text-sm text-navy-800">
                                            {sailing.vessel}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-navy-600">
                                          <span>
                                            <span className="text-navy-400">Departs:</span>{" "}
                                            <span className="font-medium">{formatDate(sailing.departure)}</span>
                                          </span>
                                          <ArrowRight className="w-3.5 h-3.5 text-navy-300" />
                                          <span>
                                            <span className="text-navy-400">Arrives:</span>{" "}
                                            <span className="font-medium">{formatDate(sailing.arrival)}</span>
                                          </span>
                                          <span className="text-ocean-600 font-semibold">
                                            {sailing.transitDays}d
                                          </span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </GlassCard>
                      </AnimatedItem>
                    );
                  })}
                </AnimatedSection>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Empty State */}
          {!results && !loading && (
            <AnimatedSection className="text-center py-20">
              <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-ocean-50 flex items-center justify-center">
                <BarChart3 className="w-10 h-10 text-ocean-400" />
              </div>
              <h3 className="text-xl font-bold text-navy-800 mb-2">
                Select your route to compare carriers
              </h3>
              <p className="text-navy-500 max-w-md mx-auto text-sm">
                Choose an origin and destination port above, then click
                &ldquo;Compare&rdquo; to see all available shipping lines with
                transit times, reliability grades, and upcoming sailings.
              </p>
            </AnimatedSection>
          )}
        </div>
      </section>

      {/* ══════════ FOOTER ══════════ */}
      <footer className="py-10 px-6 border-t border-navy-100 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-ocean-500 to-indigo-600 flex items-center justify-center">
              <Ship className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-bold text-navy-900">
              Shipping<span className="gradient-text">Savior</span>
            </span>
          </div>
          <div className="text-xs text-navy-300">
            Powered by{" "}
            <a href="https://aiacrobatics.com" className="text-ocean-500 hover:underline" target="_blank" rel="noopener noreferrer">
              AI Acrobatics
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}

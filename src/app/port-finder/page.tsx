"use client";

import { useState, useEffect, useMemo } from "react";
import Header from "@/components/Header";
import AnimatedSection, { AnimatedItem } from "@/components/ui/AnimatedSection";
import GlassCard from "@/components/ui/GlassCard";
import GradientButton from "@/components/ui/GradientButton";
import { motion, AnimatePresence } from "framer-motion";
import Fuse from "fuse.js";
import {
  Ship, Search, Anchor, Globe, Shield, TrendingUp,
  Users, ArrowRight, Clock, BarChart3, Zap,
  Container, MapPin, ChevronRight,
} from "lucide-react";

/* ─────────── TYPES ─────────── */

interface Port {
  locode: string;
  name: string;
  country: string;
  country_code: string;
  annual_teu: number;
  region?: string;
  port_type?: string;
  size?: string;
}

interface CarrierInfo {
  name: string;
  code: string;
  alliance: string;
  transitDays?: number;
  reliabilityGrade?: "A" | "B" | "C" | "D" | "F";
  reliabilityPercent?: number;
}

/* ─────────── MOCK DATA ─────────── */
// TODO: Replace with real API call to /api/carriers/ports?port1=XXX&port2=YYY

const MOCK_PORT_CARRIERS: Record<string, CarrierInfo[]> = {
  CNQIN: [
    { name: "Maersk", code: "MAEU", alliance: "2M", reliabilityGrade: "B", reliabilityPercent: 87 },
    { name: "MSC", code: "MSCU", alliance: "2M", reliabilityGrade: "B", reliabilityPercent: 82 },
    { name: "CMA CGM", code: "CMDU", alliance: "Ocean Alliance", reliabilityGrade: "A", reliabilityPercent: 91 },
    { name: "COSCO", code: "COSU", alliance: "Ocean Alliance", reliabilityGrade: "C", reliabilityPercent: 78 },
    { name: "Hapag-Lloyd", code: "HLCU", alliance: "THE Alliance", reliabilityGrade: "B", reliabilityPercent: 89 },
    { name: "ONE", code: "ONEY", alliance: "THE Alliance", reliabilityGrade: "B", reliabilityPercent: 85 },
    { name: "Evergreen", code: "EGLV", alliance: "Ocean Alliance", reliabilityGrade: "C", reliabilityPercent: 76 },
    { name: "Yang Ming", code: "YMLU", alliance: "THE Alliance", reliabilityGrade: "C", reliabilityPercent: 74 },
  ],
  USLAX: [
    { name: "Maersk", code: "MAEU", alliance: "2M", reliabilityGrade: "B", reliabilityPercent: 87 },
    { name: "MSC", code: "MSCU", alliance: "2M", reliabilityGrade: "B", reliabilityPercent: 82 },
    { name: "CMA CGM", code: "CMDU", alliance: "Ocean Alliance", reliabilityGrade: "A", reliabilityPercent: 91 },
    { name: "COSCO", code: "COSU", alliance: "Ocean Alliance", reliabilityGrade: "C", reliabilityPercent: 78 },
    { name: "Hapag-Lloyd", code: "HLCU", alliance: "THE Alliance", reliabilityGrade: "B", reliabilityPercent: 89 },
    { name: "ONE", code: "ONEY", alliance: "THE Alliance", reliabilityGrade: "B", reliabilityPercent: 85 },
    { name: "Evergreen", code: "EGLV", alliance: "Ocean Alliance", reliabilityGrade: "C", reliabilityPercent: 76 },
    { name: "ZIM", code: "ZIMU", alliance: "Independent", reliabilityGrade: "C", reliabilityPercent: 73 },
    { name: "HMM", code: "HMMU", alliance: "THE Alliance", reliabilityGrade: "B", reliabilityPercent: 80 },
  ],
  VNSGN: [
    { name: "Maersk", code: "MAEU", alliance: "2M", reliabilityGrade: "B", reliabilityPercent: 87 },
    { name: "MSC", code: "MSCU", alliance: "2M", reliabilityGrade: "B", reliabilityPercent: 82 },
    { name: "CMA CGM", code: "CMDU", alliance: "Ocean Alliance", reliabilityGrade: "A", reliabilityPercent: 91 },
    { name: "COSCO", code: "COSU", alliance: "Ocean Alliance", reliabilityGrade: "C", reliabilityPercent: 78 },
    { name: "Hapag-Lloyd", code: "HLCU", alliance: "THE Alliance", reliabilityGrade: "B", reliabilityPercent: 89 },
    { name: "Evergreen", code: "EGLV", alliance: "Ocean Alliance", reliabilityGrade: "C", reliabilityPercent: 76 },
  ],
  USNYC: [
    { name: "Maersk", code: "MAEU", alliance: "2M", reliabilityGrade: "B", reliabilityPercent: 87 },
    { name: "MSC", code: "MSCU", alliance: "2M", reliabilityGrade: "B", reliabilityPercent: 82 },
    { name: "CMA CGM", code: "CMDU", alliance: "Ocean Alliance", reliabilityGrade: "A", reliabilityPercent: 91 },
    { name: "Hapag-Lloyd", code: "HLCU", alliance: "THE Alliance", reliabilityGrade: "B", reliabilityPercent: 89 },
    { name: "ONE", code: "ONEY", alliance: "THE Alliance", reliabilityGrade: "B", reliabilityPercent: 85 },
    { name: "ZIM", code: "ZIMU", alliance: "Independent", reliabilityGrade: "C", reliabilityPercent: 73 },
    { name: "HMM", code: "HMMU", alliance: "THE Alliance", reliabilityGrade: "B", reliabilityPercent: 80 },
  ],
};

/* ─────────── HELPERS ─────────── */

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
  "Independent": "bg-navy-100 text-navy-600",
};

const carrierGradients: Record<string, string> = {
  MAEU: "from-sky-500 to-blue-600",
  MSCU: "from-blue-600 to-indigo-700",
  CMDU: "from-red-500 to-red-600",
  COSU: "from-blue-700 to-blue-900",
  HLCU: "from-orange-500 to-orange-600",
  ONEY: "from-pink-500 to-pink-600",
  EGLV: "from-green-600 to-green-700",
  YMLU: "from-yellow-500 to-yellow-600",
  ZIMU: "from-violet-500 to-violet-600",
  HMMU: "from-cyan-600 to-cyan-700",
};

function getCarrierInitials(name: string): string {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

function formatTeu(teu: number): string {
  if (teu >= 1_000_000) return `${(teu / 1_000_000).toFixed(1)}M`;
  if (teu >= 1000) return `${(teu / 1000).toFixed(0)}K`;
  return String(teu);
}

/* ─────────── COMPONENT ─────────── */

export default function PortFinderPage() {
  const [ports, setPorts] = useState<Port[]>([]);
  const [port1Search, setPort1Search] = useState("");
  const [port2Search, setPort2Search] = useState("");
  const [port1, setPort1] = useState<Port | null>(null);
  const [port2, setPort2] = useState<Port | null>(null);
  const [showDrop1, setShowDrop1] = useState(false);
  const [showDrop2, setShowDrop2] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // Results
  const [port1Carriers, setPort1Carriers] = useState<CarrierInfo[]>([]);
  const [port2Carriers, setPort2Carriers] = useState<CarrierInfo[]>([]);

  // Load ports
  useEffect(() => {
    fetch("/data/ports.json")
      .then((r) => r.json())
      .then((data) => setPorts(data))
      .catch(() => {});
  }, []);

  const fuse = useMemo(
    () => new Fuse(ports, { keys: ["name", "locode", "country"], threshold: 0.3 }),
    [ports]
  );

  const results1 = useMemo(() => {
    if (!port1Search.trim()) return ports.slice(0, 8);
    return fuse.search(port1Search).map((r) => r.item).slice(0, 8);
  }, [port1Search, fuse, ports]);

  const results2 = useMemo(() => {
    if (!port2Search.trim()) return ports.slice(0, 8);
    return fuse.search(port2Search).map((r) => r.item).slice(0, 8);
  }, [port2Search, fuse, ports]);

  // Computed overlap
  const { overlapCarriers, port1Only, port2Only } = useMemo(() => {
    if (!searched) return { overlapCarriers: [], port1Only: [], port2Only: [] };

    const p2Codes = new Set(port2Carriers.map((c) => c.code));
    const p1Codes = new Set(port1Carriers.map((c) => c.code));

    return {
      overlapCarriers: port1Carriers.filter((c) => p2Codes.has(c.code)),
      port1Only: port1Carriers.filter((c) => !p2Codes.has(c.code)),
      port2Only: port2Carriers.filter((c) => !p1Codes.has(c.code)),
    };
  }, [port1Carriers, port2Carriers, searched]);

  function selectPort1(port: Port) {
    setPort1(port);
    setPort1Search(`${port.name} (${port.locode})`);
    setShowDrop1(false);
  }

  function selectPort2(port: Port) {
    setPort2(port);
    setPort2Search(`${port.name} (${port.locode})`);
    setShowDrop2(false);
  }

  async function handleSearch() {
    if (!port1 || !port2) return;
    setLoading(true);
    setSearched(false);

    // TODO: Replace with real API call:
    // const data = await fetch(`/api/carriers/ports?port1=${port1.locode}&port2=${port2.locode}`).then(r => r.json());
    await new Promise((resolve) => setTimeout(resolve, 700));

    setPort1Carriers(MOCK_PORT_CARRIERS[port1.locode] || MOCK_PORT_CARRIERS["CNQIN"]);
    setPort2Carriers(MOCK_PORT_CARRIERS[port2.locode] || MOCK_PORT_CARRIERS["USLAX"]);
    setSearched(true);
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-white overflow-hidden">
      <Header />

      {/* ══════════ HERO ══════════ */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
        <div className="absolute inset-0 hero-gradient" />
        <div className="absolute inset-0 pattern-dots-hero" />
        <div className="absolute top-1/3 -right-32 w-[400px] h-[400px] bg-indigo-300/20 rounded-full filter blur-[80px] animate-blob" />
        <div className="absolute bottom-1/3 -left-32 w-[350px] h-[350px] bg-ocean-300/15 rounded-full filter blur-[80px] animate-blob-delay-2" />

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 glass-premium rounded-full px-5 py-2.5 mb-6 shadow-soft">
              <Anchor className="w-4 h-4 text-ocean-600" />
              <span className="text-sm font-medium text-navy-600">
                Port Carrier Discovery
              </span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.7 }}
            className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tighter mb-5 text-navy-900"
          >
            Find Your{" "}
            <span className="gradient-text-hero">Carriers</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.6 }}
            className="text-lg md:text-xl text-navy-500 max-w-2xl mx-auto leading-relaxed"
          >
            Discover which shipping lines connect any two ports worldwide.
            See the overlap and find your best options.
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
                {/* Port A */}
                <div className="relative">
                  <label className="block text-sm font-semibold text-navy-700 mb-2">
                    Port A
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ocean-500" />
                    <input
                      type="text"
                      value={port1Search}
                      onChange={(e) => {
                        setPort1Search(e.target.value);
                        setShowDrop1(true);
                      }}
                      onFocus={() => setShowDrop1(true)}
                      onBlur={() => setTimeout(() => setShowDrop1(false), 200)}
                      placeholder="Search port name or code..."
                      className="input-light pl-10"
                    />
                  </div>
                  {showDrop1 && results1.length > 0 && (
                    <div className="absolute z-30 w-full mt-1 bg-white border border-navy-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                      {results1.map((p) => (
                        <button
                          key={p.locode}
                          onMouseDown={() => selectPort1(p)}
                          className="w-full text-left px-4 py-2.5 hover:bg-ocean-50 transition-colors text-sm flex items-center justify-between"
                        >
                          <span>
                            <span className="font-medium text-navy-800">{p.name}</span>
                            <span className="text-navy-400 ml-2">{p.country}</span>
                          </span>
                          <span className="text-xs font-mono text-ocean-600 bg-ocean-50 px-2 py-0.5 rounded">
                            {p.locode}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Port B */}
                <div className="relative">
                  <label className="block text-sm font-semibold text-navy-700 mb-2">
                    Port B
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500" />
                    <input
                      type="text"
                      value={port2Search}
                      onChange={(e) => {
                        setPort2Search(e.target.value);
                        setShowDrop2(true);
                      }}
                      onFocus={() => setShowDrop2(true)}
                      onBlur={() => setTimeout(() => setShowDrop2(false), 200)}
                      placeholder="Search port name or code..."
                      className="input-light pl-10"
                    />
                  </div>
                  {showDrop2 && results2.length > 0 && (
                    <div className="absolute z-30 w-full mt-1 bg-white border border-navy-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                      {results2.map((p) => (
                        <button
                          key={p.locode}
                          onMouseDown={() => selectPort2(p)}
                          className="w-full text-left px-4 py-2.5 hover:bg-ocean-50 transition-colors text-sm flex items-center justify-between"
                        >
                          <span>
                            <span className="font-medium text-navy-800">{p.name}</span>
                            <span className="text-navy-400 ml-2">{p.country}</span>
                          </span>
                          <span className="text-xs font-mono text-ocean-600 bg-ocean-50 px-2 py-0.5 rounded">
                            {p.locode}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Discover Button */}
                <div>
                  <GradientButton onClick={handleSearch} className="w-full md:w-auto whitespace-nowrap">
                    <Search className="w-5 h-5" />
                    Discover
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
              <p className="text-navy-500 mt-4 text-sm">Discovering carriers...</p>
            </div>
          )}

          <AnimatePresence>
            {searched && !loading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {/* Port Info Cards */}
                {port1 && port2 && (
                  <AnimatedSection stagger className="grid md:grid-cols-2 gap-4 mb-10">
                    <AnimatedItem>
                      <GlassCard className="p-5">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-ocean-500 to-ocean-600 flex items-center justify-center shadow-md">
                            <MapPin className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="font-bold text-navy-900">{port1.name}</h3>
                            <p className="text-xs text-navy-400">
                              {port1.country} &middot; {port1.locode}
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-3 mt-4">
                          <div className="bg-navy-50 rounded-lg p-3 text-center">
                            <div className="text-lg font-bold text-navy-900">
                              {formatTeu(port1.annual_teu)}
                            </div>
                            <div className="text-[10px] text-navy-400 uppercase tracking-wider font-medium">
                              TEU/Year
                            </div>
                          </div>
                          <div className="bg-navy-50 rounded-lg p-3 text-center">
                            <div className="text-lg font-bold text-navy-900">
                              {port1Carriers.length}
                            </div>
                            <div className="text-[10px] text-navy-400 uppercase tracking-wider font-medium">
                              Carriers
                            </div>
                          </div>
                          <div className="bg-navy-50 rounded-lg p-3 text-center">
                            <div className="text-lg font-bold text-navy-900">
                              {port1.region || port1.country_code}
                            </div>
                            <div className="text-[10px] text-navy-400 uppercase tracking-wider font-medium">
                              Region
                            </div>
                          </div>
                        </div>
                      </GlassCard>
                    </AnimatedItem>
                    <AnimatedItem>
                      <GlassCard className="p-5">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-md">
                            <MapPin className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="font-bold text-navy-900">{port2.name}</h3>
                            <p className="text-xs text-navy-400">
                              {port2.country} &middot; {port2.locode}
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-3 mt-4">
                          <div className="bg-navy-50 rounded-lg p-3 text-center">
                            <div className="text-lg font-bold text-navy-900">
                              {formatTeu(port2.annual_teu)}
                            </div>
                            <div className="text-[10px] text-navy-400 uppercase tracking-wider font-medium">
                              TEU/Year
                            </div>
                          </div>
                          <div className="bg-navy-50 rounded-lg p-3 text-center">
                            <div className="text-lg font-bold text-navy-900">
                              {port2Carriers.length}
                            </div>
                            <div className="text-[10px] text-navy-400 uppercase tracking-wider font-medium">
                              Carriers
                            </div>
                          </div>
                          <div className="bg-navy-50 rounded-lg p-3 text-center">
                            <div className="text-lg font-bold text-navy-900">
                              {port2.region || port2.country_code}
                            </div>
                            <div className="text-[10px] text-navy-400 uppercase tracking-wider font-medium">
                              Region
                            </div>
                          </div>
                        </div>
                      </GlassCard>
                    </AnimatedItem>
                  </AnimatedSection>
                )}

                {/* Venn-style Visualization */}
                <AnimatedSection className="mb-10">
                  <div className="relative bg-gradient-to-br from-navy-50 via-ocean-50/50 to-indigo-50/50 rounded-3xl p-8 md:p-12 overflow-hidden">
                    {/* Decorative blobs */}
                    <div className="absolute top-0 left-0 w-40 h-40 bg-ocean-200/20 rounded-full filter blur-[60px]" />
                    <div className="absolute bottom-0 right-0 w-40 h-40 bg-indigo-200/20 rounded-full filter blur-[60px]" />

                    <h3 className="text-center text-sm font-bold text-navy-700 uppercase tracking-wider mb-8">
                      Carrier Overlap
                    </h3>

                    {/* Visual Venn */}
                    <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-0 relative">
                      {/* Port A Circle */}
                      <div className="relative w-48 h-48 md:w-56 md:h-56 rounded-full bg-ocean-100/60 border-2 border-ocean-300/50 flex items-center justify-center md:-mr-12 z-10">
                        <div className="text-center px-4">
                          <div className="text-xs font-bold text-ocean-700 uppercase tracking-wider mb-1">
                            {port1?.locode || "Port A"} Only
                          </div>
                          <div className="text-3xl font-bold text-ocean-800">
                            {port1Only.length}
                          </div>
                          <div className="text-[10px] text-ocean-600 mt-1">
                            {port1Only.map((c) => c.name).join(", ") || "None"}
                          </div>
                        </div>
                      </div>

                      {/* Overlap Zone */}
                      <div className="relative w-48 h-48 md:w-56 md:h-56 rounded-full bg-gradient-to-br from-ocean-200/80 to-indigo-200/80 border-2 border-white/60 flex items-center justify-center z-20 shadow-lg md:-mx-6">
                        <div className="text-center px-4">
                          <div className="text-xs font-bold text-navy-700 uppercase tracking-wider mb-1">
                            Both Ports
                          </div>
                          <div className="text-4xl font-bold gradient-text">
                            {overlapCarriers.length}
                          </div>
                          <div className="text-[10px] text-navy-600 mt-1">
                            carriers overlap
                          </div>
                        </div>
                      </div>

                      {/* Port B Circle */}
                      <div className="relative w-48 h-48 md:w-56 md:h-56 rounded-full bg-indigo-100/60 border-2 border-indigo-300/50 flex items-center justify-center md:-ml-12 z-10">
                        <div className="text-center px-4">
                          <div className="text-xs font-bold text-indigo-700 uppercase tracking-wider mb-1">
                            {port2?.locode || "Port B"} Only
                          </div>
                          <div className="text-3xl font-bold text-indigo-800">
                            {port2Only.length}
                          </div>
                          <div className="text-[10px] text-indigo-600 mt-1">
                            {port2Only.map((c) => c.name).join(", ") || "None"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </AnimatedSection>

                {/* Overlap Carriers — Highlighted */}
                {overlapCarriers.length > 0 && (
                  <AnimatedSection className="mb-10">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-ocean-500 to-indigo-600 flex items-center justify-center">
                        <Users className="w-4 h-4 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-navy-900">
                        Carriers Serving Both Ports
                      </h3>
                      <span className="text-sm bg-ocean-100 text-ocean-700 font-semibold px-3 py-1 rounded-full">
                        {overlapCarriers.length} carriers
                      </span>
                    </div>

                    <AnimatedSection stagger className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {overlapCarriers.map((carrier) => {
                        const gradeStyle = gradeColors[carrier.reliabilityGrade || "C"];
                        const gradient = carrierGradients[carrier.code] || "from-navy-500 to-navy-700";

                        return (
                          <AnimatedItem key={carrier.code}>
                            <GlassCard className="p-5 h-full">
                              <div className="flex items-center gap-3 mb-4">
                                <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg shrink-0`}>
                                  <span className="text-white font-bold text-xs">
                                    {getCarrierInitials(carrier.name)}
                                  </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-bold text-navy-900 truncate">
                                    {carrier.name}
                                  </h4>
                                  <span className={`inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold ${allianceColors[carrier.alliance] || "bg-navy-100 text-navy-600"}`}>
                                    {carrier.alliance}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="text-xs text-navy-400 font-medium uppercase tracking-wider">
                                    Reliability
                                  </div>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-lg font-bold text-navy-900">
                                      {carrier.reliabilityPercent}%
                                    </span>
                                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-md text-[10px] font-bold ring-1 ${gradeStyle.bg} ${gradeStyle.text} ${gradeStyle.ring}`}>
                                      {carrier.reliabilityGrade}
                                    </span>
                                  </div>
                                </div>

                                {/* Visual bar */}
                                <div className="w-24 h-2 bg-navy-100 rounded-full overflow-hidden">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${carrier.reliabilityPercent}%` }}
                                    transition={{ duration: 1, delay: 0.3 }}
                                    className={`h-full rounded-full ${
                                      (carrier.reliabilityPercent || 0) >= 85
                                        ? "bg-emerald-500"
                                        : (carrier.reliabilityPercent || 0) >= 75
                                        ? "bg-blue-500"
                                        : "bg-amber-500"
                                    }`}
                                  />
                                </div>
                              </div>
                            </GlassCard>
                          </AnimatedItem>
                        );
                      })}
                    </AnimatedSection>
                  </AnimatedSection>
                )}

                {/* Port-Only Carriers */}
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Port A Only */}
                  {port1Only.length > 0 && (
                    <AnimatedSection>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-3 h-3 rounded-full bg-ocean-500" />
                        <h4 className="text-sm font-bold text-navy-700 uppercase tracking-wider">
                          {port1?.name} Only
                        </h4>
                        <span className="text-xs text-navy-400">
                          ({port1Only.length})
                        </span>
                      </div>
                      <div className="space-y-2">
                        {port1Only.map((carrier) => {
                          const gradient = carrierGradients[carrier.code] || "from-navy-500 to-navy-700";
                          return (
                            <div
                              key={carrier.code}
                              className="flex items-center gap-3 p-3 bg-ocean-50/50 rounded-xl border border-ocean-100"
                            >
                              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow shrink-0`}>
                                <span className="text-white font-bold text-[10px]">
                                  {getCarrierInitials(carrier.name)}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <span className="text-sm font-semibold text-navy-800">
                                  {carrier.name}
                                </span>
                                <span className={`ml-2 inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${allianceColors[carrier.alliance] || "bg-navy-100 text-navy-600"}`}>
                                  {carrier.alliance}
                                </span>
                              </div>
                              {carrier.reliabilityGrade && (
                                <span className={`inline-flex items-center justify-center w-6 h-6 rounded-md text-[10px] font-bold ring-1 ${gradeColors[carrier.reliabilityGrade].bg} ${gradeColors[carrier.reliabilityGrade].text} ${gradeColors[carrier.reliabilityGrade].ring}`}>
                                  {carrier.reliabilityGrade}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </AnimatedSection>
                  )}

                  {/* Port B Only */}
                  {port2Only.length > 0 && (
                    <AnimatedSection>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-3 h-3 rounded-full bg-indigo-500" />
                        <h4 className="text-sm font-bold text-navy-700 uppercase tracking-wider">
                          {port2?.name} Only
                        </h4>
                        <span className="text-xs text-navy-400">
                          ({port2Only.length})
                        </span>
                      </div>
                      <div className="space-y-2">
                        {port2Only.map((carrier) => {
                          const gradient = carrierGradients[carrier.code] || "from-navy-500 to-navy-700";
                          return (
                            <div
                              key={carrier.code}
                              className="flex items-center gap-3 p-3 bg-indigo-50/50 rounded-xl border border-indigo-100"
                            >
                              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow shrink-0`}>
                                <span className="text-white font-bold text-[10px]">
                                  {getCarrierInitials(carrier.name)}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <span className="text-sm font-semibold text-navy-800">
                                  {carrier.name}
                                </span>
                                <span className={`ml-2 inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${allianceColors[carrier.alliance] || "bg-navy-100 text-navy-600"}`}>
                                  {carrier.alliance}
                                </span>
                              </div>
                              {carrier.reliabilityGrade && (
                                <span className={`inline-flex items-center justify-center w-6 h-6 rounded-md text-[10px] font-bold ring-1 ${gradeColors[carrier.reliabilityGrade].bg} ${gradeColors[carrier.reliabilityGrade].text} ${gradeColors[carrier.reliabilityGrade].ring}`}>
                                  {carrier.reliabilityGrade}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </AnimatedSection>
                  )}
                </div>

                {/* CTA */}
                {overlapCarriers.length > 0 && (
                  <AnimatedSection delay={0.3} className="mt-12 text-center">
                    <GlassCard className="p-8 max-w-xl mx-auto">
                      <h3 className="text-lg font-bold text-navy-900 mb-2">
                        Ready to compare schedules?
                      </h3>
                      <p className="text-sm text-navy-500 mb-5">
                        See transit times, reliability scores, and upcoming sailings for
                        these {overlapCarriers.length} overlapping carriers.
                      </p>
                      <GradientButton
                        href={`/carrier-comparison?origin=${port1?.locode || ""}&destination=${port2?.locode || ""}`}
                      >
                        Compare Carriers
                        <ArrowRight className="w-5 h-5" />
                      </GradientButton>
                    </GlassCard>
                  </AnimatedSection>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Empty State */}
          {!searched && !loading && (
            <AnimatedSection className="text-center py-20">
              <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-indigo-50 flex items-center justify-center">
                <Globe className="w-10 h-10 text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold text-navy-800 mb-2">
                Select two ports to discover carriers
              </h3>
              <p className="text-navy-500 max-w-md mx-auto text-sm">
                Search for any two ports worldwide to see which shipping lines
                serve them both, with a visual Venn diagram of carrier overlap.
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

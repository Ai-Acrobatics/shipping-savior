"use client";

import Link from "next/link";
import Header from "@/components/Header";
import ScrollReveal from "@/components/ScrollReveal";
import {
  Target, BarChart3, Search, Lightbulb, ShieldCheck,
  ArrowRight, Check, Ship, DollarSign, Clock,
  FileText, AlertTriangle, TrendingUp, TrendingDown,
  Zap, Brain, Calculator, Route, Shield, Globe,
  ChevronRight, Activity, Gauge, Award, Layers,
  CheckCircle2, XCircle, ArrowUpRight, ArrowDownRight,
} from "lucide-react";

/* ─── DMAIC Phase Colors ─── */
const phaseColors = {
  define: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", accent: "bg-blue-500", gradient: "from-blue-500 to-blue-600", light: "text-blue-600" },
  measure: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", accent: "bg-emerald-500", gradient: "from-emerald-500 to-emerald-600", light: "text-emerald-600" },
  analyze: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", accent: "bg-amber-500", gradient: "from-amber-500 to-amber-600", light: "text-amber-600" },
  improve: { bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-700", accent: "bg-purple-500", gradient: "from-purple-500 to-purple-600", light: "text-purple-600" },
  control: { bg: "bg-teal-50", border: "border-teal-200", text: "text-teal-700", accent: "bg-teal-500", gradient: "from-teal-500 to-teal-600", light: "text-teal-600" },
};

/* ─── CTQ Tree Data ─── */
const ctqItems = [
  { need: "Speed", metric: "Quote turnaround < 2 hours", current: "1-2 days", icon: Clock, color: "text-blue-600", bg: "bg-blue-50" },
  { need: "Accuracy", metric: "Landed cost within +/-3%", current: "+/-15-20%", icon: Target, color: "text-emerald-600", bg: "bg-emerald-50" },
  { need: "Compliance", metric: "Zero ISF filing penalties", current: "Occasional $5K penalties", icon: ShieldCheck, color: "text-amber-600", bg: "bg-amber-50" },
  { need: "Savings", metric: "FTZ duty savings > $10K/container", current: "Not tracked ($0)", icon: DollarSign, color: "text-purple-600", bg: "bg-purple-50" },
];

/* ─── Baseline Metrics ─── */
const baselineMetrics = [
  { label: "Quote Turnaround", value: "24-48h", target: "<30 min", improvement: "97%", icon: Clock },
  { label: "Landed Cost Accuracy", value: "+/-15-20%", target: "+/-2-3%", improvement: "85%", icon: Target },
  { label: "ISF Filing Compliance", value: "~95%", target: "99.9%", improvement: "5%", icon: ShieldCheck },
  { label: "FTZ Utilization", value: "0%", target: "100%", improvement: "N/A", icon: Shield },
  { label: "Doc Error Rate", value: "~8%", target: "<0.5%", improvement: "94%", icon: FileText },
  { label: "Manual Hours/Shipment", value: "4-6h", target: "<30 min", improvement: "92%", icon: Clock },
];

/* ─── Pareto Data ─── */
const paretoItems = [
  { cause: "Manual tariff/duty research", pct: 35, cumulative: 35, color: "bg-amber-500" },
  { cause: "Carrier schedule lookup", pct: 28, cumulative: 63, color: "bg-amber-400" },
  { cause: "Document preparation", pct: 17, cumulative: 80, color: "bg-amber-300" },
  { cause: "FTZ decision-making", pct: 10, cumulative: 90, color: "bg-amber-200" },
  { cause: "Communication delays", pct: 7, cumulative: 97, color: "bg-amber-100" },
  { cause: "Other", pct: 3, cumulative: 100, color: "bg-navy-200" },
];

/* ─── Solution Matrix ─── */
const solutionMatrix = [
  { rootCause: "Manual tariff research", solution: "HTS Code Lookup + Tariff Estimator", icon: Calculator, impact: "High", effort: "Medium", gradient: "from-blue-500 to-blue-600" },
  { rootCause: "Carrier schedule lookup", solution: "Route Comparison Tool", icon: Route, impact: "High", effort: "Medium", gradient: "from-emerald-500 to-emerald-600" },
  { rootCause: "Document preparation", solution: "BOL Generator + Document Templates", icon: FileText, impact: "Medium", effort: "Low", gradient: "from-amber-500 to-amber-600" },
  { rootCause: "No FTZ strategy", solution: "FTZ Savings Analyzer", icon: Shield, impact: "Very High", effort: "High", gradient: "from-purple-500 to-purple-600" },
  { rootCause: "Inaccurate costs", solution: "Landed Cost Calculator (ALL hidden costs)", icon: DollarSign, impact: "Very High", effort: "Medium", gradient: "from-teal-500 to-teal-600" },
  { rootCause: "No visibility", solution: "Operations Dashboard", icon: BarChart3, impact: "High", effort: "Medium", gradient: "from-indigo-500 to-indigo-600" },
];

/* ─── Before/After Metrics ─── */
const beforeAfter = [
  { metric: "Quote Turnaround", before: "24-48 hours", after: "<30 minutes", reduction: "97%", icon: Clock },
  { metric: "Landed Cost Accuracy", before: "+/-15-20%", after: "+/-2-3%", reduction: "85%", icon: Target },
  { metric: "ISF Compliance", before: "95%", after: "99.9%", reduction: "", icon: ShieldCheck },
  { metric: "FTZ Savings", before: "$0", after: "$10K-50K/container", reduction: "", icon: DollarSign },
  { metric: "Manual Hours", before: "4-6h/shipment", after: "<30 min/shipment", reduction: "92%", icon: Activity },
  { metric: "Doc Errors", before: "8%", after: "<0.5%", reduction: "94%", icon: FileText },
];

/* ─── Financial Impact ─── */
const financialImpact = [
  { label: "Annual Time Savings", value: "1,500+", unit: "hours", detail: "300 shipments x 5h saved per shipment", icon: Clock, color: "text-ocean-600", bg: "bg-ocean-50", border: "border-ocean-200" },
  { label: "Annual Cost Savings", value: "$150K-500K", unit: "", detail: "Time + error reduction + FTZ savings", icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
  { label: "FTZ Revenue Opportunity", value: "$2M+", unit: "", detail: "FTZ strategy on existing volume", icon: TrendingUp, color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-200" },
  { label: "Sigma Improvement", value: "3.5 to 5.0+", unit: "sigma", detail: "From 2.3% defect rate to <0.023%", icon: Award, color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-200" },
  { label: "Year 1 ROI", value: "400%+", unit: "", detail: "Platform investment vs. total savings", icon: Zap, color: "text-teal-600", bg: "bg-teal-50", border: "border-teal-200" },
];

/* ─── Fishbone Diagram ─── */
function IshikawaDiagram() {
  const categories = [
    {
      name: "People",
      color: "bg-blue-500",
      textColor: "text-blue-700",
      borderColor: "border-blue-300",
      bgLight: "bg-blue-50",
      causes: ["Manual carrier research", "Tribal knowledge not documented", "Single-threaded expertise"],
      position: "top-left",
    },
    {
      name: "Process",
      color: "bg-emerald-500",
      textColor: "text-emerald-700",
      borderColor: "border-emerald-300",
      bgLight: "bg-emerald-50",
      causes: ["No standardized quote workflow", "Ad-hoc FTZ decisions", "Reactive compliance checks"],
      position: "top-right",
    },
    {
      name: "Technology",
      color: "bg-amber-500",
      textColor: "text-amber-700",
      borderColor: "border-amber-300",
      bgLight: "bg-amber-50",
      causes: ["Spreadsheet-based operations", "No real-time tariff data", "No route optimization tools"],
      position: "bottom-left",
    },
    {
      name: "Data",
      color: "bg-purple-500",
      textColor: "text-purple-700",
      borderColor: "border-purple-300",
      bgLight: "bg-purple-50",
      causes: ["Siloed information systems", "No central dashboard", "Stale duty rates used"],
      position: "bottom-right",
    },
  ];

  return (
    <div className="bg-white rounded-2xl p-8 border border-navy-200/60 shadow-card">
      <h3 className="text-lg font-bold text-navy-900 mb-6 text-center">Root Cause Analysis (Ishikawa Diagram)</h3>

      {/* Category grid */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {categories.map((cat) => (
          <div key={cat.name} className={`${cat.bgLight} rounded-xl p-5 border ${cat.borderColor}`}>
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-3 h-3 rounded-full ${cat.color}`} />
              <span className={`text-sm font-bold ${cat.textColor}`}>{cat.name}</span>
            </div>
            <ul className="space-y-2">
              {cat.causes.map((cause) => (
                <li key={cause} className="flex items-start gap-2 text-sm text-navy-600">
                  <ChevronRight className={`w-3.5 h-3.5 ${cat.textColor} mt-0.5 shrink-0`} />
                  {cause}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Central effect */}
      <div className="flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center">
            <div className="w-16 h-0.5 bg-blue-400" />
            <div className="w-16 h-0.5 bg-emerald-400" />
          </div>
          <div className="bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl px-6 py-3 text-sm font-bold shadow-lg text-center">
            <AlertTriangle className="w-4 h-4 inline mr-1.5 -mt-0.5" />
            Manual Freight Operations: 40-60% Time Waste
          </div>
          <div className="hidden md:flex items-center">
            <div className="w-16 h-0.5 bg-amber-400" />
            <div className="w-16 h-0.5 bg-purple-400" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── SPC Chart Mockup ─── */
function SPCChart() {
  const dataPoints = [3.2, 3.5, 3.4, 3.8, 4.0, 3.9, 4.2, 4.1, 4.5, 4.3, 4.6, 4.8, 4.7, 5.0, 4.9, 5.1, 5.0, 5.2];
  const ucl = 5.5;
  const lcl = 3.0;
  const target = 5.0;
  const maxVal = 6;
  const chartHeight = 160;

  return (
    <div className="bg-white rounded-2xl p-6 border border-navy-200/60 shadow-card">
      <h4 className="text-sm font-bold text-navy-900 mb-4">Statistical Process Control — Sigma Level Over Time</h4>
      <div className="relative" style={{ height: chartHeight + 40 }}>
        {/* Y axis labels */}
        <div className="absolute left-0 top-0 bottom-8 w-8 flex flex-col justify-between text-[10px] text-navy-400">
          <span>6.0</span>
          <span>5.0</span>
          <span>4.0</span>
          <span>3.0</span>
        </div>

        {/* Chart area */}
        <div className="ml-10 relative" style={{ height: chartHeight }}>
          {/* UCL line */}
          <div className="absolute w-full border-t-2 border-dashed border-red-300" style={{ top: `${(1 - ucl / maxVal) * chartHeight}px` }}>
            <span className="absolute right-0 -top-4 text-[9px] text-red-400 font-medium">UCL (5.5)</span>
          </div>
          {/* Target line */}
          <div className="absolute w-full border-t-2 border-dashed border-emerald-400" style={{ top: `${(1 - target / maxVal) * chartHeight}px` }}>
            <span className="absolute right-0 -top-4 text-[9px] text-emerald-500 font-medium">Target (5.0)</span>
          </div>
          {/* LCL line */}
          <div className="absolute w-full border-t-2 border-dashed border-red-300" style={{ top: `${(1 - lcl / maxVal) * chartHeight}px` }}>
            <span className="absolute right-0 -top-4 text-[9px] text-red-400 font-medium">LCL (3.0)</span>
          </div>

          {/* Data points */}
          <svg className="absolute inset-0 w-full" style={{ height: chartHeight }}>
            {/* Line connecting points */}
            <polyline
              fill="none"
              stroke="#2563eb"
              strokeWidth="2"
              points={dataPoints.map((v, i) => `${(i / (dataPoints.length - 1)) * 100}%,${(1 - v / maxVal) * chartHeight}`).join(" ")}
            />
            {/* Dots */}
            {dataPoints.map((v, i) => (
              <circle
                key={i}
                cx={`${(i / (dataPoints.length - 1)) * 100}%`}
                cy={(1 - v / maxVal) * chartHeight}
                r="4"
                fill={v >= target ? "#10b981" : "#2563eb"}
                stroke="white"
                strokeWidth="2"
              />
            ))}
          </svg>
        </div>

        {/* X axis */}
        <div className="ml-10 flex justify-between mt-2 text-[9px] text-navy-400">
          <span>Month 1</span>
          <span>Month 6</span>
          <span>Month 12</span>
          <span>Month 18</span>
        </div>
      </div>
      <div className="flex items-center gap-4 mt-4 text-xs text-navy-500">
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-ocean-500" /> Sigma Level</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> At or Above Target</span>
        <span className="flex items-center gap-1.5"><span className="w-6 h-0.5 border-t-2 border-dashed border-red-300" /> Control Limits</span>
      </div>
    </div>
  );
}

/* ─── Sigma Gauge ─── */
function SigmaGauge({ current, target }: { current: number; target: number }) {
  const pctCurrent = (current / 6) * 100;
  const pctTarget = (target / 6) * 100;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-48 h-24 overflow-hidden">
        {/* Background arc */}
        <div className="absolute inset-0 rounded-t-full border-8 border-navy-100 border-b-0" />
        {/* Current level arc */}
        <div
          className="absolute inset-0 rounded-t-full border-8 border-b-0"
          style={{
            borderColor: current >= 5 ? "#10b981" : current >= 4 ? "#2563eb" : "#f59e0b",
            clipPath: `polygon(0 100%, 0 0, ${pctCurrent}% 0, ${pctCurrent}% 100%)`,
          }}
        />
        {/* Target indicator */}
        <div
          className="absolute top-0 w-1 h-24 bg-emerald-500"
          style={{ left: `${pctTarget}%`, transform: "translateX(-50%)" }}
        />
        {/* Center */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
          <div className="text-3xl font-bold text-navy-900">{current}σ</div>
        </div>
      </div>
      <div className="flex items-center gap-4 mt-3 text-xs text-navy-500">
        <span>Current: <span className="font-bold text-ocean-600">{current}σ</span></span>
        <span>Target: <span className="font-bold text-emerald-600">{target}σ</span></span>
      </div>
    </div>
  );
}

/* ─── Main Page ─── */
export default function SixSigmaPage() {
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
            <Award className="w-4 h-4 text-ocean-600" />
            <span className="text-sm font-medium text-navy-600">Six Sigma DMAIC Analysis</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 text-navy-900">
            Six Sigma{" "}
            <span className="gradient-text-hero">Analysis</span>
          </h1>

          <p className="text-xl text-navy-500 max-w-2xl mx-auto mb-8 leading-relaxed">
            A rigorous DMAIC analysis of the international freight brokerage business model,
            quantifying waste, identifying root causes, and mapping solutions to platform features.
          </p>

          {/* Sigma badge */}
          <div className="inline-flex items-center gap-3 bg-white border border-navy-200 rounded-2xl px-6 py-4 shadow-card">
            <div className="flex items-center gap-2">
              <span className="text-sm text-navy-500">Current:</span>
              <span className="text-2xl font-bold text-amber-600">3.5σ</span>
            </div>
            <ArrowRight className="w-5 h-5 text-navy-300" />
            <div className="flex items-center gap-2">
              <span className="text-sm text-navy-500">Target:</span>
              <span className="text-2xl font-bold text-emerald-600">5.0σ+</span>
            </div>
          </div>

          {/* DMAIC nav pills */}
          <div className="flex flex-wrap gap-3 justify-center mt-10">
            {[
              { name: "Define", color: "bg-blue-100 text-blue-700 border-blue-200" },
              { name: "Measure", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
              { name: "Analyze", color: "bg-amber-100 text-amber-700 border-amber-200" },
              { name: "Improve", color: "bg-purple-100 text-purple-700 border-purple-200" },
              { name: "Control", color: "bg-teal-100 text-teal-700 border-teal-200" },
            ].map((phase) => (
              <a
                key={phase.name}
                href={`#${phase.name.toLowerCase()}`}
                className={`${phase.color} border px-5 py-2 rounded-full text-sm font-semibold hover:scale-105 transition-transform`}
              >
                {phase.name}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ===== DEFINE PHASE ===== */}
      <section id="define" className="py-24 px-6 section-alt">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${phaseColors.define.gradient} flex items-center justify-center shadow-md`}>
                <Target className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-bold text-blue-600 tracking-wider uppercase">Phase 1</p>
                <h2 className="text-3xl md:text-4xl font-bold text-navy-900">Define</h2>
              </div>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-6 mt-10">
            {/* Problem Statement */}
            <ScrollReveal>
              <div className={`${phaseColors.define.bg} rounded-2xl p-8 border ${phaseColors.define.border} h-full`}>
                <h3 className="text-lg font-bold text-navy-900 mb-3">Problem Statement</h3>
                <p className="text-sm text-navy-600 leading-relaxed">
                  Manual freight brokerage wastes <span className="font-bold text-blue-700">40-60% of time</span> on
                  repeatable tasks: carrier lookup, tariff research, route comparison, and document preparation.
                  This results in slow quotes, inaccurate costs, compliance risks, and missed FTZ savings opportunities.
                </p>
              </div>
            </ScrollReveal>

            {/* Project Charter */}
            <ScrollReveal delay={100}>
              <div className={`${phaseColors.define.bg} rounded-2xl p-8 border ${phaseColors.define.border} h-full`}>
                <h3 className="text-lg font-bold text-navy-900 mb-3">Project Charter</h3>
                <p className="text-sm text-navy-600 leading-relaxed mb-4">
                  Systematize international freight operations to reduce cycle time, errors, and cost overruns
                  through a purpose-built logistics intelligence platform.
                </p>
                <div className="space-y-2">
                  {["Reduce quote turnaround by 95%+", "Achieve +/-3% landed cost accuracy", "Eliminate ISF filing penalties", "Unlock FTZ savings on all shipments"].map((goal) => (
                    <div key={goal} className="flex items-center gap-2 text-sm text-navy-700">
                      <Check className="w-4 h-4 text-blue-500 shrink-0" />
                      {goal}
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* Voice of Customer */}
          <ScrollReveal delay={200}>
            <div className="mt-6 bg-white rounded-2xl p-8 border border-navy-200/60 shadow-card">
              <h3 className="text-lg font-bold text-navy-900 mb-2">Voice of Customer (VOC)</h3>
              <p className="text-sm text-navy-500 mb-6">What customers need from a modernized freight operation</p>
              <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { need: "Faster quotes", detail: "Same-day, not next-week" },
                  { need: "Accurate landed costs", detail: "Including ALL hidden fees" },
                  { need: "FTZ savings visibility", detail: "Show me the money I'm leaving on the table" },
                  { need: "Fewer doc errors", detail: "Zero penalties, zero delays" },
                ].map((voc) => (
                  <div key={voc.need} className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                    <p className="text-sm font-bold text-navy-900 mb-1">{voc.need}</p>
                    <p className="text-xs text-navy-500">{voc.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>

          {/* CTQ Tree */}
          <ScrollReveal delay={300}>
            <div className="mt-6 bg-white rounded-2xl p-8 border border-navy-200/60 shadow-card">
              <h3 className="text-lg font-bold text-navy-900 mb-6">Critical to Quality (CTQ) Tree</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {ctqItems.map((item) => (
                  <div key={item.need} className={`${item.bg} rounded-xl p-5 border border-navy-100`}>
                    <div className="flex items-center gap-2 mb-3">
                      <item.icon className={`w-5 h-5 ${item.color}`} />
                      <span className="font-bold text-navy-900">{item.need}</span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start gap-2">
                        <span className="text-navy-400 text-xs shrink-0 mt-0.5">TARGET:</span>
                        <span className="text-navy-700 font-medium">{item.metric}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-navy-400 text-xs shrink-0 mt-0.5">CURRENT:</span>
                        <span className="text-red-600 font-medium">{item.current}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ===== MEASURE PHASE ===== */}
      <section id="measure" className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${phaseColors.measure.gradient} flex items-center justify-center shadow-md`}>
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-bold text-emerald-600 tracking-wider uppercase">Phase 2</p>
                <h2 className="text-3xl md:text-4xl font-bold text-navy-900">Measure</h2>
              </div>
            </div>
          </ScrollReveal>

          {/* Baseline Metrics */}
          <ScrollReveal>
            <div className="mt-10 bg-emerald-50 rounded-2xl p-8 border border-emerald-200">
              <h3 className="text-lg font-bold text-navy-900 mb-6">Current State Baseline Metrics</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {baselineMetrics.map((m) => (
                  <div key={m.label} className="bg-white rounded-xl p-5 border border-emerald-100">
                    <div className="flex items-center gap-2 mb-3">
                      <m.icon className="w-4 h-4 text-emerald-600" />
                      <span className="text-sm font-bold text-navy-900">{m.label}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-navy-400">Current</p>
                        <p className="text-lg font-bold text-red-600">{m.value}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-navy-300" />
                      <div className="text-right">
                        <p className="text-xs text-navy-400">Target</p>
                        <p className="text-lg font-bold text-emerald-600">{m.target}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>

          {/* Process Capability */}
          <ScrollReveal delay={150}>
            <div className="mt-6 bg-white rounded-2xl p-8 border border-navy-200/60 shadow-card">
              <h3 className="text-lg font-bold text-navy-900 mb-6">Process Capability — Sigma Level</h3>
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="space-y-4">
                    <div className="bg-amber-50 rounded-xl p-5 border border-amber-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-navy-900">Current State</span>
                        <span className="text-2xl font-bold text-amber-600">3.5σ</span>
                      </div>
                      <p className="text-xs text-navy-500">Defect rate ~2.3% (errors per shipment)</p>
                      <div className="mt-2 h-2 bg-navy-100 rounded-full overflow-hidden">
                        <div className="h-full w-[58%] bg-gradient-to-r from-amber-400 to-amber-500 rounded-full" />
                      </div>
                    </div>
                    <div className="bg-emerald-50 rounded-xl p-5 border border-emerald-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-navy-900">Target State</span>
                        <span className="text-2xl font-bold text-emerald-600">5.0σ+</span>
                      </div>
                      <p className="text-xs text-navy-500">Defect rate &lt;0.023% (near-zero errors)</p>
                      <div className="mt-2 h-2 bg-navy-100 rounded-full overflow-hidden">
                        <div className="h-full w-[83%] bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-center">
                  <SigmaGauge current={3.5} target={5.0} />
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ===== ANALYZE PHASE ===== */}
      <section id="analyze" className="py-24 px-6 section-alt">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${phaseColors.analyze.gradient} flex items-center justify-center shadow-md`}>
                <Search className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-bold text-amber-600 tracking-wider uppercase">Phase 3</p>
                <h2 className="text-3xl md:text-4xl font-bold text-navy-900">Analyze</h2>
              </div>
            </div>
          </ScrollReveal>

          {/* Ishikawa Diagram */}
          <ScrollReveal>
            <div className="mt-10">
              <IshikawaDiagram />
            </div>
          </ScrollReveal>

          {/* Pareto Analysis */}
          <ScrollReveal delay={150}>
            <div className="mt-6 bg-white rounded-2xl p-8 border border-navy-200/60 shadow-card">
              <h3 className="text-lg font-bold text-navy-900 mb-2">Pareto Analysis</h3>
              <p className="text-sm text-navy-500 mb-6">80% of delays come from 3 root causes</p>
              <div className="space-y-3">
                {paretoItems.map((item) => (
                  <div key={item.cause} className="flex items-center gap-4">
                    <span className="text-sm text-navy-600 w-48 shrink-0 truncate">{item.cause}</span>
                    <div className="flex-1 h-6 bg-navy-100 rounded-full overflow-hidden relative">
                      <div
                        className={`h-full ${item.color} rounded-full transition-all duration-1000`}
                        style={{ width: `${item.pct}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-navy-900 w-10 text-right">{item.pct}%</span>
                    <span className="text-xs text-navy-400 w-14 text-right">{item.cumulative}% cum.</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 bg-amber-50 rounded-lg p-4 border border-amber-200">
                <p className="text-sm text-amber-800">
                  <span className="font-bold">Key insight:</span> Automating just the top 3 causes
                  (tariff research, carrier lookup, document prep) eliminates <span className="font-bold">80% of all delays</span>.
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ===== IMPROVE PHASE ===== */}
      <section id="improve" className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${phaseColors.improve.gradient} flex items-center justify-center shadow-md`}>
                <Lightbulb className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-bold text-purple-600 tracking-wider uppercase">Phase 4</p>
                <h2 className="text-3xl md:text-4xl font-bold text-navy-900">Improve</h2>
              </div>
            </div>
          </ScrollReveal>

          {/* Solution Matrix */}
          <ScrollReveal>
            <div className="mt-10">
              <h3 className="text-lg font-bold text-navy-900 mb-6">Solution Matrix — Root Cause to Platform Feature</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {solutionMatrix.map((sol, i) => (
                  <div key={sol.rootCause} className="bg-white rounded-2xl p-6 border border-navy-200/60 shadow-card hover:shadow-card-hover transition-all duration-300">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${sol.gradient} flex items-center justify-center mb-4 shadow-md`}>
                      <sol.icon className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-xs text-navy-400 mb-1">Root Cause</p>
                    <p className="text-sm font-bold text-red-600 mb-3">{sol.rootCause}</p>
                    <div className="flex items-center gap-1.5 mb-3 text-navy-300">
                      <ArrowDownRight className="w-4 h-4" />
                      <span className="text-xs">Solved by</span>
                    </div>
                    <p className="text-sm font-bold text-navy-900 mb-3">{sol.solution}</p>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${sol.impact === "Very High" ? "bg-emerald-100 text-emerald-700" : sol.impact === "High" ? "bg-blue-100 text-blue-700" : "bg-navy-100 text-navy-600"}`}>
                        {sol.impact} Impact
                      </span>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${sol.effort === "Low" ? "bg-emerald-100 text-emerald-700" : sol.effort === "Medium" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>
                        {sol.effort} Effort
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>

          {/* Before / After Comparison */}
          <ScrollReveal delay={150}>
            <div className="mt-12">
              <h3 className="text-lg font-bold text-navy-900 mb-6">Expected Improvements — Before vs After</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {beforeAfter.map((ba) => (
                  <div key={ba.metric} className="bg-white rounded-2xl overflow-hidden border border-navy-200/60 shadow-card">
                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-4">
                        <ba.icon className="w-4 h-4 text-purple-600" />
                        <span className="text-sm font-bold text-navy-900">{ba.metric}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-red-50 rounded-lg p-3 border border-red-100 text-center">
                          <p className="text-[10px] text-red-500 font-medium mb-0.5">Before</p>
                          <p className="text-sm font-bold text-red-700">{ba.before}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-navy-300 shrink-0" />
                        <div className="flex-1 bg-emerald-50 rounded-lg p-3 border border-emerald-100 text-center">
                          <p className="text-[10px] text-emerald-500 font-medium mb-0.5">After</p>
                          <p className="text-sm font-bold text-emerald-700">{ba.after}</p>
                        </div>
                      </div>
                    </div>
                    {ba.reduction && (
                      <div className="bg-purple-50 px-5 py-2.5 border-t border-purple-100">
                        <p className="text-xs text-purple-700 font-medium text-center">
                          <ArrowUpRight className="w-3 h-3 inline -mt-0.5" /> {ba.reduction} improvement
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ===== CONTROL PHASE ===== */}
      <section id="control" className="py-24 px-6 section-alt">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${phaseColors.control.gradient} flex items-center justify-center shadow-md`}>
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-bold text-teal-600 tracking-wider uppercase">Phase 5</p>
                <h2 className="text-3xl md:text-4xl font-bold text-navy-900">Control</h2>
              </div>
            </div>
          </ScrollReveal>

          {/* Control Plan */}
          <ScrollReveal>
            <div className="mt-10 grid md:grid-cols-2 gap-6">
              <div className="bg-teal-50 rounded-2xl p-8 border border-teal-200">
                <h3 className="text-lg font-bold text-navy-900 mb-4">Control Plan</h3>
                <p className="text-sm text-navy-500 mb-4">Dashboard KPIs that monitor each critical metric in real-time</p>
                <div className="space-y-3">
                  {[
                    "Quote turnaround time (target: <30 min)",
                    "Landed cost variance (target: +/-3%)",
                    "ISF filing on-time rate (target: 99.9%)",
                    "FTZ utilization rate (target: 100%)",
                    "Documentation error rate (target: <0.5%)",
                    "Customer satisfaction score (target: >4.5/5)",
                  ].map((kpi) => (
                    <div key={kpi} className="flex items-center gap-2 text-sm text-navy-700">
                      <Gauge className="w-4 h-4 text-teal-500 shrink-0" />
                      {kpi}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl p-8 border border-navy-200/60 shadow-card">
                <h3 className="text-lg font-bold text-navy-900 mb-4">Sustaining Gains</h3>
                <div className="space-y-4">
                  {[
                    { title: "Automated Alerts", desc: "Real-time notifications when any metric drifts outside control limits", icon: AlertTriangle },
                    { title: "Monthly Reviews", desc: "Data-driven monthly review cadence to identify optimization opportunities", icon: BarChart3 },
                    { title: "Continuous Improvement", desc: "Quarterly DMAIC cycles on sub-processes to drive incremental gains", icon: TrendingUp },
                  ].map((item) => (
                    <div key={item.title} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center shrink-0">
                        <item.icon className="w-4 h-4 text-teal-600" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-navy-900">{item.title}</p>
                        <p className="text-xs text-navy-500">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* SPC Chart */}
          <ScrollReveal delay={150}>
            <div className="mt-6">
              <SPCChart />
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ===== FINANCIAL IMPACT SUMMARY ===== */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <p className="text-sm font-semibold text-ocean-600 tracking-wider uppercase mb-3">Bottom Line</p>
              <h2 className="text-4xl md:text-5xl font-bold text-navy-900 mb-5">
                Financial <span className="gradient-text">Impact</span>
              </h2>
              <p className="text-lg text-navy-500 max-w-2xl mx-auto">
                The quantified business case for platform investment.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {financialImpact.map((item, i) => (
              <ScrollReveal key={item.label} delay={i * 100}>
                <div className={`${item.bg} rounded-2xl p-6 border ${item.border} text-center h-full`}>
                  <item.icon className={`w-6 h-6 ${item.color} mx-auto mb-2`} />
                  <p className={`text-xs font-semibold ${item.color} mb-1`}>{item.label}</p>
                  <p className="text-2xl font-bold text-navy-900 mb-1">{item.value}</p>
                  <p className="text-[11px] text-navy-400 leading-snug">{item.detail}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>

          {/* Summary callout */}
          <ScrollReveal delay={200}>
            <div className="mt-12 bg-gradient-to-r from-ocean-600 via-indigo-600 to-purple-600 rounded-2xl p-8 text-white">
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div>
                  <p className="text-sm text-ocean-100 mb-1">Sigma Improvement</p>
                  <p className="text-4xl font-bold">3.5σ → 5.0σ+</p>
                  <p className="text-xs text-ocean-200 mt-1">From 23,000 DPMO to &lt;230 DPMO</p>
                </div>
                <div>
                  <p className="text-sm text-ocean-100 mb-1">Total Annual Savings</p>
                  <p className="text-4xl font-bold">$150K-500K</p>
                  <p className="text-xs text-ocean-200 mt-1">Time + errors + FTZ optimization</p>
                </div>
                <div>
                  <p className="text-sm text-ocean-100 mb-1">Year 1 ROI</p>
                  <p className="text-4xl font-bold">400%+</p>
                  <p className="text-xs text-ocean-200 mt-1">Platform cost vs. total value created</p>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="py-20 px-6 bg-gradient-to-r from-ocean-600 via-indigo-600 to-ocean-700">
        <div className="max-w-3xl mx-auto text-center">
          <ScrollReveal>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Reach 5σ?
            </h2>
            <p className="text-lg text-ocean-100 mb-8 max-w-xl mx-auto">
              Let&apos;s transform your operations from manual freight brokerage to a Six Sigma-level
              logistics platform.
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
                href="/monetization"
                className="inline-flex items-center gap-2 bg-white/10 text-white border border-white/30 font-bold px-8 py-4 rounded-xl text-base hover:bg-white/20 transition-all"
              >
                SaaS Monetization Strategy
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

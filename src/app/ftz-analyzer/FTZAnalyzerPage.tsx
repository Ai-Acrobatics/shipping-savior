"use client";

import { useState } from "react";
import Header from "@/components/Header";
import ScrollReveal from "@/components/ScrollReveal";
import HTSCodeLookup from "@/components/HTSCodeLookup";
import TariffScenarioBuilder from "@/components/TariffScenarioBuilder";
import FTZAnalyzer from "@/components/FTZAnalyzer";
import {
  Shield,
  GitCompare,
  ChevronRight,
  Zap,
  ArrowRight,
  Info,
  Search,
  BarChart3,
  Warehouse,
  Globe,
} from "lucide-react";

const WORKFLOW_STEPS = [
  {
    step: "01",
    icon: Search,
    title: "HTS Code Lookup",
    description: "Find your product's HTS code and get duty rates by country of origin",
    iconColor: "text-ocean-600",
    bgLight: "bg-ocean-50",
    borderColor: "border-ocean-200",
    anchor: "hts",
  },
  {
    step: "02",
    icon: GitCompare,
    title: "Tariff Scenario Comparison",
    description: "Build side-by-side tariff scenarios — model Section 301, country switches, what-ifs",
    iconColor: "text-cargo-600",
    bgLight: "bg-amber-50",
    borderColor: "border-amber-200",
    anchor: "scenarios",
  },
  {
    step: "03",
    icon: Shield,
    title: "FTZ Savings Modeler",
    description: "Lock duty rates, choose an FTZ zone, and model incremental withdrawal schedules",
    iconColor: "text-emerald-600",
    bgLight: "bg-emerald-50",
    borderColor: "border-emerald-200",
    anchor: "ftz",
  },
];

export default function FTZAnalyzerPage() {
  const [ftzRate, setFtzRate] = useState<number | undefined>(undefined);
  const [ftzCountry, setFtzCountry] = useState<string | undefined>(undefined);
  const [scenarioRate, setScenarioRate] = useState<number | undefined>(undefined);
  const [scenarioCountry, setScenarioCountry] = useState<string | undefined>(undefined);

  const handleHTSRateSelect = (
    _htsCode: string,
    _description: string,
    rate: number,
    country: string
  ) => {
    setFtzRate(rate);
    setFtzCountry(country);
    setScenarioRate(rate);
    setScenarioCountry(country);
  };

  const handleScenarioSelect = (rate: number, country: string) => {
    setFtzRate(rate);
    setFtzCountry(country);
    document.getElementById("ftz")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main className="min-h-screen bg-white">
      <Header />

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden bg-gradient-to-br from-white via-emerald-50/50 to-ocean-50/30">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-emerald-100/40 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-ocean-100/30 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-full px-4 py-2 mb-8 shadow-soft">
            <Zap className="w-4 h-4 text-emerald-600" />
            <span className="text-sm font-medium text-emerald-700">Phase 4 — Live Tool</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 text-navy-900">
            FTZ Analyzer{" "}
            <span className="text-emerald-600">+</span>{" "}
            <span className="gradient-text">
              Tariff Scenarios
            </span>
          </h1>

          <p className="text-xl text-navy-500 max-w-3xl mx-auto mb-8 leading-relaxed">
            Three-step workflow: look up HTS duty rates, compare tariff scenarios side-by-side,
            then model FTZ savings with incremental withdrawal scheduling.
          </p>

          {(ftzRate !== undefined || scenarioRate !== undefined) && (
            <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5 mb-6 shadow-soft">
              <Info className="w-4 h-4 text-emerald-600" />
              <span className="text-sm text-emerald-700">
                Rate selected:{" "}
                <strong>{ftzRate?.toFixed(1) ?? scenarioRate?.toFixed(1)}%</strong>
                {ftzCountry && ` · ${ftzCountry}`}
                {" — "}
                <a href="#ftz" className="underline hover:no-underline font-medium">
                  Jump to FTZ Modeler
                </a>
              </span>
            </div>
          )}

          {/* Workflow steps */}
          <div className="grid md:grid-cols-3 gap-4 mt-12">
            {WORKFLOW_STEPS.map((step) => (
              <a
                key={step.step}
                href={`#${step.anchor}`}
                className={`bg-white border ${step.borderColor} rounded-2xl p-5 text-left group shadow-soft hover:shadow-card transition-all duration-300`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-3xl font-bold text-navy-200">{step.step}</div>
                  <div className={`p-2 rounded-lg ${step.bgLight}`}>
                    <step.icon className={`w-5 h-5 ${step.iconColor}`} />
                  </div>
                </div>
                <h3 className="text-sm font-semibold text-navy-900 mb-1 group-hover:text-ocean-600 transition-colors">
                  {step.title}
                </h3>
                <p className="text-xs text-navy-500 leading-relaxed">{step.description}</p>
                <div className="flex items-center gap-1 mt-3 text-xs text-navy-400 group-hover:text-ocean-600 transition-colors font-medium">
                  Jump to tool <ChevronRight className="w-3 h-3" />
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Step 1: HTS Code Lookup */}
      <section id="hts" className="py-20 px-6 bg-navy-50">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <div className="flex items-center gap-4 mb-8">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-ocean-50 border border-ocean-200">
                <Search className="w-5 h-5 text-ocean-600" />
              </div>
              <div>
                <div className="text-xs text-ocean-600 font-semibold mb-0.5 uppercase tracking-wide">STEP 1</div>
                <h2 className="text-2xl font-bold text-navy-900">HTS Code Lookup</h2>
              </div>
              <div className="flex-1 h-px bg-navy-200 hidden sm:block" />
              <div className="text-xs text-navy-400 hidden sm:block font-medium">
                Select a rate to pre-fill scenarios &rarr;
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal>
            <div className="bg-white border border-ocean-100 rounded-2xl p-6 shadow-card">
              <HTSCodeLookup onSelectRate={handleHTSRateSelect} />
            </div>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <div className="mt-4 flex items-center gap-2 text-xs text-navy-400 justify-center font-medium">
              <Info className="w-3 h-3" />
              Click &quot;Use Rate&quot; on any HTS code to automatically populate the tariff
              scenario builder and FTZ modeler below
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Step 2: Tariff Scenario Builder */}
      <section id="scenarios" className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <div className="flex items-center gap-4 mb-8">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-amber-50 border border-amber-200">
                <GitCompare className="w-5 h-5 text-cargo-600" />
              </div>
              <div>
                <div className="text-xs text-cargo-600 font-semibold mb-0.5 uppercase tracking-wide">STEP 2</div>
                <h2 className="text-2xl font-bold text-navy-900">Tariff Scenario Comparison</h2>
              </div>
              <div className="flex-1 h-px bg-navy-200 hidden sm:block" />
              <div className="text-xs text-navy-400 hidden sm:block font-medium">Up to 6 scenarios side-by-side</div>
            </div>
          </ScrollReveal>

          <ScrollReveal>
            <div className="bg-white border border-amber-100 rounded-2xl p-6 shadow-card">
              <div className="mb-6">
                <p className="text-sm text-navy-500 leading-relaxed">
                  Model multiple tariff scenarios simultaneously — compare sourcing from different
                  countries, apply Section 301 tariffs, or model future tariff changes. Click{" "}
                  <strong className="text-ocean-600">&quot;Use&quot;</strong> on any scenario to
                  send it directly to the FTZ modeler.
                </p>
              </div>
              <TariffScenarioBuilder onSelectScenario={handleScenarioSelect} />
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Step 3: FTZ Analyzer */}
      <section id="ftz" className="py-20 px-6 bg-navy-50">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <div className="flex items-center gap-4 mb-8">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200">
                <Shield className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <div className="text-xs text-emerald-600 font-semibold mb-0.5 uppercase tracking-wide">STEP 3</div>
                <h2 className="text-2xl font-bold text-navy-900">FTZ Savings Modeler</h2>
              </div>
              <div className="flex-1 h-px bg-navy-200 hidden sm:block" />
              <div className="text-xs text-navy-400 hidden sm:block font-medium">Full zone finder + withdrawal modeling</div>
            </div>
          </ScrollReveal>

          <ScrollReveal>
            <div className="bg-white border border-emerald-100 rounded-2xl p-6 shadow-card">
              <div className="mb-6">
                <p className="text-sm text-navy-500 leading-relaxed">
                  Lock your duty rate on entry date, search 260+ US FTZ locations, and model
                  incremental withdrawal schedules with three patterns (uniform, front-loaded,
                  back-loaded). Includes storage cost analysis and break-even calculation.
                </p>
              </div>
              <FTZAnalyzer
                initialDutyRate={ftzRate ?? scenarioRate}
                initialCountry={ftzCountry ?? scenarioCountry}
              />
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Why it matters */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-navy-900 mb-4">
                Why This <span className="text-emerald-600">Matters</span>
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Globe,
                title: "SE Asia Sourcing Intelligence",
                body: "Vietnam, Thailand, Indonesia, Cambodia — avoid Section 301 exposure by sourcing strategically. Our HTS lookup shows rate differentials instantly.",
                bgLight: "bg-ocean-50",
                iconColor: "text-ocean-600",
              },
              {
                icon: BarChart3,
                title: "Multi-Scenario What-If Modeling",
                body: "Run up to 6 tariff scenarios simultaneously. See the annual cost delta between sourcing options before committing to a supplier relationship.",
                bgLight: "bg-amber-50",
                iconColor: "text-cargo-600",
              },
              {
                icon: Warehouse,
                title: "FTZ Rate Lock Insurance",
                body: "Trade policy shifts fast. Lock your duty rate at entry, spread cash flow over months, and net real savings vs. storage costs — all modeled here.",
                bgLight: "bg-emerald-50",
                iconColor: "text-emerald-600",
              },
            ].map((item) => (
              <ScrollReveal key={item.title}>
                <div className="bg-white border border-navy-100 rounded-2xl p-6 h-full shadow-soft hover:shadow-card transition-all duration-300">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${item.bgLight}`}>
                    <item.icon className={`w-6 h-6 ${item.iconColor}`} />
                  </div>
                  <h3 className="text-base font-semibold text-navy-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-navy-500 leading-relaxed">{item.body}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal delay={200}>
            <div className="mt-10 text-center">
              <a
                href="/"
                className="inline-flex items-center gap-2 text-sm text-navy-400 hover:text-ocean-600 transition-colors font-medium"
              >
                <ArrowRight className="w-4 h-4 rotate-180" />
                Back to Shipping Savior Platform
              </a>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 border-t border-navy-100 bg-white">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm font-bold text-navy-900">
            Shipping
            <span className="gradient-text">
              Savior
            </span>
          </div>
          <div className="text-xs text-navy-400">
            Tariff data for informational purposes only. Verify at hts.usitc.gov
          </div>
          <div className="text-xs text-navy-400">Phase 4 — FTZ Analyzer + Tariff Scenarios</div>
        </div>
      </footer>
    </main>
  );
}

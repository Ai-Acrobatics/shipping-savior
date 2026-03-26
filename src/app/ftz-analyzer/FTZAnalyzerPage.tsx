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
    color: "text-ocean-400",
    badge: "bg-ocean-500/20",
    anchor: "hts",
  },
  {
    step: "02",
    icon: GitCompare,
    title: "Tariff Scenario Comparison",
    description: "Build side-by-side tariff scenarios — model Section 301, country switches, what-ifs",
    color: "text-cargo-400",
    badge: "bg-cargo-500/20",
    anchor: "scenarios",
  },
  {
    step: "03",
    icon: Shield,
    title: "FTZ Savings Modeler",
    description: "Lock duty rates, choose an FTZ zone, and model incremental withdrawal schedules",
    color: "text-green-400",
    badge: "bg-green-500/20",
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
    <main className="min-h-screen">
      <Header />

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-navy-950 via-navy-900 to-navy-950" />
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-green-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-ocean-500/5 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-8 border-green-500/30">
            <Zap className="w-4 h-4 text-green-400" />
            <span className="text-sm text-green-300">Phase 4 — Live Tool</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
            <span className="text-white">FTZ Analyzer</span>{" "}
            <span className="text-green-400">+</span>{" "}
            <span className="bg-gradient-to-r from-ocean-400 to-ocean-200 bg-clip-text text-transparent">
              Tariff Scenarios
            </span>
          </h1>

          <p className="text-xl text-navy-200 max-w-3xl mx-auto mb-8 leading-relaxed">
            Three-step workflow: look up HTS duty rates, compare tariff scenarios side-by-side,
            then model FTZ savings with incremental withdrawal scheduling.
          </p>

          {(ftzRate !== undefined || scenarioRate !== undefined) && (
            <div className="inline-flex items-center gap-2 glass rounded-xl px-4 py-2.5 mb-6 border-green-500/20 bg-green-500/5">
              <Info className="w-4 h-4 text-green-400" />
              <span className="text-sm text-green-300">
                Rate selected:{" "}
                <strong>{ftzRate?.toFixed(1) ?? scenarioRate?.toFixed(1)}%</strong>
                {ftzCountry && ` · ${ftzCountry}`}
                {" — "}
                <a href="#ftz" className="underline hover:no-underline">
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
                className="glass glass-hover rounded-2xl p-5 text-left group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-3xl font-bold text-white/10">{step.step}</div>
                  <div className={`p-2 rounded-lg ${step.badge}`}>
                    <step.icon className={`w-5 h-5 ${step.color}`} />
                  </div>
                </div>
                <h3 className="text-sm font-semibold text-white mb-1 group-hover:text-ocean-300 transition-colors">
                  {step.title}
                </h3>
                <p className="text-xs text-navy-400 leading-relaxed">{step.description}</p>
                <div className="flex items-center gap-1 mt-3 text-xs text-navy-500 group-hover:text-ocean-400 transition-colors">
                  Jump to tool <ChevronRight className="w-3 h-3" />
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Step 1: HTS Code Lookup */}
      <section id="hts" className="py-20 px-6 bg-navy-950/50">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <div className="flex items-center gap-4 mb-8">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-ocean-600/30 border border-ocean-500/40">
                <Search className="w-5 h-5 text-ocean-400" />
              </div>
              <div>
                <div className="text-xs text-ocean-400 font-medium mb-0.5">STEP 1</div>
                <h2 className="text-2xl font-bold text-white">HTS Code Lookup</h2>
              </div>
              <div className="flex-1 h-px bg-white/5 hidden sm:block" />
              <div className="text-xs text-navy-500 hidden sm:block">
                Select a rate to pre-fill scenarios →
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal>
            <div className="glass rounded-2xl p-6 border-ocean-500/10">
              <HTSCodeLookup onSelectRate={handleHTSRateSelect} />
            </div>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <div className="mt-4 flex items-center gap-2 text-xs text-navy-500 justify-center">
              <Info className="w-3 h-3" />
              Click &quot;Use Rate&quot; on any HTS code to automatically populate the tariff
              scenario builder and FTZ modeler below
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Step 2: Tariff Scenario Builder */}
      <section id="scenarios" className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <div className="flex items-center gap-4 mb-8">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-cargo-600/30 border border-cargo-500/40">
                <GitCompare className="w-5 h-5 text-cargo-400" />
              </div>
              <div>
                <div className="text-xs text-cargo-400 font-medium mb-0.5">STEP 2</div>
                <h2 className="text-2xl font-bold text-white">Tariff Scenario Comparison</h2>
              </div>
              <div className="flex-1 h-px bg-white/5 hidden sm:block" />
              <div className="text-xs text-navy-500 hidden sm:block">Up to 6 scenarios side-by-side</div>
            </div>
          </ScrollReveal>

          <ScrollReveal>
            <div className="glass rounded-2xl p-6 border-cargo-500/10">
              <div className="mb-6">
                <p className="text-sm text-navy-300 leading-relaxed">
                  Model multiple tariff scenarios simultaneously — compare sourcing from different
                  countries, apply Section 301 tariffs, or model future tariff changes. Click{" "}
                  <strong className="text-ocean-300">&quot;Use&quot;</strong> on any scenario to
                  send it directly to the FTZ modeler.
                </p>
              </div>
              <TariffScenarioBuilder onSelectScenario={handleScenarioSelect} />
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Step 3: FTZ Analyzer */}
      <section id="ftz" className="py-20 px-6 bg-navy-950/50">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <div className="flex items-center gap-4 mb-8">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-green-600/30 border border-green-500/40">
                <Shield className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <div className="text-xs text-green-400 font-medium mb-0.5">STEP 3</div>
                <h2 className="text-2xl font-bold text-white">FTZ Savings Modeler</h2>
              </div>
              <div className="flex-1 h-px bg-white/5 hidden sm:block" />
              <div className="text-xs text-navy-500 hidden sm:block">Full zone finder + withdrawal modeling</div>
            </div>
          </ScrollReveal>

          <ScrollReveal>
            <div className="glass rounded-2xl p-6 border-green-500/10">
              <div className="mb-6">
                <p className="text-sm text-navy-300 leading-relaxed">
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
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">
                Why This <span className="text-green-400">Matters</span>
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Globe,
                title: "SE Asia Sourcing Intelligence",
                body: "Vietnam, Thailand, Indonesia, Cambodia — avoid Section 301 exposure by sourcing strategically. Our HTS lookup shows rate differentials instantly.",
                colorClass: "bg-ocean-600/30",
                iconColor: "text-ocean-400",
              },
              {
                icon: BarChart3,
                title: "Multi-Scenario What-If Modeling",
                body: "Run up to 6 tariff scenarios simultaneously. See the annual cost delta between sourcing options before committing to a supplier relationship.",
                colorClass: "bg-cargo-600/30",
                iconColor: "text-cargo-400",
              },
              {
                icon: Warehouse,
                title: "FTZ Rate Lock Insurance",
                body: "Trade policy shifts fast. Lock your duty rate at entry, spread cash flow over months, and net real savings vs. storage costs — all modeled here.",
                colorClass: "bg-green-600/30",
                iconColor: "text-green-400",
              },
            ].map((item) => (
              <ScrollReveal key={item.title}>
                <div className="glass glass-hover rounded-2xl p-6 h-full">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${item.colorClass}`}>
                    <item.icon className={`w-6 h-6 ${item.iconColor}`} />
                  </div>
                  <h3 className="text-base font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-navy-300 leading-relaxed">{item.body}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal delay={200}>
            <div className="mt-10 text-center">
              <a
                href="/"
                className="inline-flex items-center gap-2 text-sm text-navy-400 hover:text-ocean-400 transition-colors"
              >
                <ArrowRight className="w-4 h-4 rotate-180" />
                Back to Shipping Savior Platform
              </a>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm font-bold text-white">
            Shipping
            <span className="bg-gradient-to-r from-ocean-400 to-ocean-200 bg-clip-text text-transparent">
              Savior
            </span>
          </div>
          <div className="text-xs text-navy-500">
            Tariff data for informational purposes only. Verify at hts.usitc.gov
          </div>
          <div className="text-xs text-navy-600">Phase 4 — FTZ Analyzer + Tariff Scenarios</div>
        </div>
      </footer>
    </main>
  );
}

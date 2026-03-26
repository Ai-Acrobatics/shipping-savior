import Header from "@/components/Header";
import ScrollReveal from "@/components/ScrollReveal";
import KnowledgeBase from "@/components/KnowledgeBase";
import { BookOpen, Globe, Scale, FileText, AlertTriangle, Lightbulb, Anchor, Snowflake, ClipboardList } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Knowledge Base | Shipping Savior",
  description: "Comprehensive reference for international shipping: glossary, Incoterms, port guides, compliance checklists, cold chain requirements, trade regulations, CBP forms, and document generation for commercial invoices and packing lists.",
};

const features = [
  {
    icon: BookOpen,
    title: "40+ Glossary Terms",
    description: "Every key term from Demurrage to Drawback — categorized and searchable.",
    color: "from-ocean-500 to-ocean-700",
  },
  {
    icon: Globe,
    title: "All 11 Incoterms 2020",
    description: "Interactive breakdown of seller/buyer responsibilities for every Incoterm.",
    color: "from-purple-500 to-purple-700",
  },
  {
    icon: Scale,
    title: "Compliance Guides",
    description: "ISF, customs bonds, FTZ operations, HTS classification, FDA, APHIS, and export controls.",
    color: "from-green-500 to-green-700",
  },
  {
    icon: Anchor,
    title: "Port Guides",
    description: "Detailed profiles for 8 major ports: congestion, costs, cold chain, FTZ proximity.",
    color: "from-teal-500 to-teal-700",
  },
  {
    icon: Snowflake,
    title: "Cold Chain Requirements",
    description: "Temperature zones, reefer specs, FSMA compliance, pharma GDP, and loading best practices.",
    color: "from-blue-500 to-blue-700",
  },
  {
    icon: ClipboardList,
    title: "Document Generator",
    description: "Generate commercial invoices and packing lists with all required fields for customs.",
    color: "from-cargo-500 to-cargo-700",
  },
  {
    icon: AlertTriangle,
    title: "Trade Regulations",
    description: "Section 301 tariffs, GSP status by country, FTAs, UFLPA, and active embargoes.",
    color: "from-red-500 to-red-700",
  },
  {
    icon: FileText,
    title: "CBP Forms Reference",
    description: "10 essential customs forms with purpose, use case, and official source links.",
    color: "from-indigo-500 to-indigo-700",
  },
  {
    icon: Lightbulb,
    title: "SE Asia Focus",
    description: "Specific guidance on Vietnam, Thailand, Indonesia, and Cambodia trade status.",
    color: "from-amber-500 to-amber-700",
  },
];

export default function KnowledgeBasePage() {
  return (
    <main className="min-h-screen">
      <Header />

      {/* Hero */}
      <section className="relative pt-32 pb-16 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-navy-950 via-navy-900 to-navy-950" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-ocean-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-6">
            <BookOpen className="w-4 h-4 text-ocean-400" />
            <span className="text-sm text-navy-200">Phase 5 — Knowledge Base + Documents</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-5">
            <span className="text-white">Shipping</span>{" "}
            <span className="gradient-text">Reference</span>
          </h1>

          <p className="text-lg md:text-xl text-navy-200 max-w-3xl mx-auto mb-8 leading-relaxed">
            Everything you need to know about international shipping regulations,
            trade terms, customs compliance, port operations, cold chain handling,
            and documentation — in one searchable reference.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {features.map((feature) => (
              <div key={feature.title} className="glass rounded-xl p-4 text-left">
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center mb-3`}>
                  <feature.icon className="w-4 h-4 text-white" />
                </div>
                <div className="text-sm font-semibold text-white mb-1">{feature.title}</div>
                <p className="text-xs text-navy-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Knowledge Base */}
      <section className="py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <div className="glass rounded-2xl p-6 md:p-8">
              <KnowledgeBase />
            </div>
          </ScrollReveal>

          {/* Disclaimer */}
          <ScrollReveal delay={200}>
            <div className="mt-8 glass rounded-xl p-4 border-cargo-500/20">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 text-cargo-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-navy-300 leading-relaxed">
                  <span className="font-semibold text-cargo-300">Important Disclaimer: </span>
                  This knowledge base is for informational purposes only and does not constitute legal or regulatory advice.
                  Trade regulations change frequently. Always verify current requirements with CBP, BIS, USTR, or a licensed
                  customs broker before making import/export decisions. Duty rates are indicative; verify at hts.usitc.gov.
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <a href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-ocean-500 to-ocean-700 flex items-center justify-center">
              <Globe className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold">
              Shipping<span className="gradient-text">Savior</span>
            </span>
          </a>
          <div className="text-sm text-navy-500">
            International Logistics Platform — Built with AI Acrobatics
          </div>
          <a href="/" className="text-xs text-ocean-400 hover:text-ocean-300 transition-colors">
            &larr; Back to Platform
          </a>
        </div>
      </footer>
    </main>
  );
}

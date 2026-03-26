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
    bgLight: "bg-ocean-50",
    iconColor: "text-ocean-600",
  },
  {
    icon: Globe,
    title: "All 11 Incoterms 2020",
    description: "Interactive breakdown of seller/buyer responsibilities for every Incoterm.",
    bgLight: "bg-purple-50",
    iconColor: "text-purple-600",
  },
  {
    icon: Scale,
    title: "Compliance Guides",
    description: "ISF, customs bonds, FTZ operations, HTS classification, FDA, APHIS, and export controls.",
    bgLight: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
  {
    icon: Anchor,
    title: "Port Guides",
    description: "Detailed profiles for 8 major ports: congestion, costs, cold chain, FTZ proximity.",
    bgLight: "bg-teal-50",
    iconColor: "text-teal-600",
  },
  {
    icon: Snowflake,
    title: "Cold Chain Requirements",
    description: "Temperature zones, reefer specs, FSMA compliance, pharma GDP, and loading best practices.",
    bgLight: "bg-blue-50",
    iconColor: "text-blue-600",
  },
  {
    icon: ClipboardList,
    title: "Document Generator",
    description: "Generate commercial invoices and packing lists with all required fields for customs.",
    bgLight: "bg-amber-50",
    iconColor: "text-amber-600",
  },
  {
    icon: AlertTriangle,
    title: "Trade Regulations",
    description: "Section 301 tariffs, GSP status by country, FTAs, UFLPA, and active embargoes.",
    bgLight: "bg-red-50",
    iconColor: "text-red-600",
  },
  {
    icon: FileText,
    title: "CBP Forms Reference",
    description: "10 essential customs forms with purpose, use case, and official source links.",
    bgLight: "bg-indigo-50",
    iconColor: "text-indigo-600",
  },
  {
    icon: Lightbulb,
    title: "SE Asia Focus",
    description: "Specific guidance on Vietnam, Thailand, Indonesia, and Cambodia trade status.",
    bgLight: "bg-amber-50",
    iconColor: "text-amber-600",
  },
];

export default function KnowledgeBasePage() {
  return (
    <main className="min-h-screen bg-white">
      <Header />

      {/* Hero */}
      <section className="relative pt-32 pb-16 px-6 overflow-hidden bg-gradient-to-br from-white via-ocean-50 to-white">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-ocean-100/50 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-100/30 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-navy-200/60 rounded-full px-4 py-2 mb-6 shadow-soft">
            <BookOpen className="w-4 h-4 text-ocean-500" />
            <span className="text-sm font-medium text-navy-600">Phase 5 — Knowledge Base + Documents</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-5 text-navy-900">
            Shipping{" "}
            <span className="gradient-text">Reference</span>
          </h1>

          <p className="text-lg md:text-xl text-navy-500 max-w-3xl mx-auto mb-8 leading-relaxed">
            Everything you need to know about international shipping regulations,
            trade terms, customs compliance, port operations, cold chain handling,
            and documentation — in one searchable reference.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {features.map((feature) => (
              <div key={feature.title} className="bg-white border border-navy-100 rounded-xl p-4 text-left shadow-soft hover:shadow-card transition-shadow">
                <div className={`w-8 h-8 rounded-lg ${feature.bgLight} flex items-center justify-center mb-3`}>
                  <feature.icon className={`w-4 h-4 ${feature.iconColor}`} />
                </div>
                <div className="text-sm font-semibold text-navy-900 mb-1">{feature.title}</div>
                <p className="text-xs text-navy-500 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Knowledge Base */}
      <section className="py-12 px-6 bg-navy-50">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <div className="bg-white border border-navy-100 rounded-2xl p-6 md:p-8 shadow-card">
              <KnowledgeBase />
            </div>
          </ScrollReveal>

          {/* Disclaimer */}
          <ScrollReveal delay={200}>
            <div className="mt-8 bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-navy-600 leading-relaxed">
                  <span className="font-semibold text-amber-700">Important Disclaimer: </span>
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
      <footer className="py-12 px-6 border-t border-navy-100 bg-white mt-0">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <a href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-ocean-500 to-ocean-700 flex items-center justify-center shadow-sm">
              <Globe className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-navy-900">
              Shipping<span className="gradient-text">Savior</span>
            </span>
          </a>
          <div className="text-sm text-navy-400">
            International Logistics Platform — Built with AI Acrobatics
          </div>
          <a href="/" className="text-xs text-ocean-600 hover:text-ocean-700 transition-colors font-medium">
            &larr; Back to Platform
          </a>
        </div>
      </footer>
    </main>
  );
}

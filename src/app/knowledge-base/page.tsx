import Header from "@/components/Header";
import ScrollReveal from "@/components/ScrollReveal";
import KnowledgeBase from "@/components/KnowledgeBase";
import KbArticleGrid from "@/components/kb/KbArticleGrid";
import { getAllArticleMeta } from "@/lib/kb";
import { BookOpen, Globe, AlertTriangle } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Knowledge Base | Shipping Savior",
  description:
    "Operator-grade reference for international shipping: FTZ playbooks, carrier scoring methodology, tariff guidance, calculator how-tos, and onboarding walkthroughs.",
};

export default function KnowledgeBasePage() {
  const articles = getAllArticleMeta();

  return (
    <main className="min-h-screen bg-white">
      <Header />

      {/* Hero */}
      <section className="relative pt-32 pb-12 px-6 overflow-hidden bg-gradient-to-br from-white via-ocean-50 to-white">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-ocean-100/50 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-100/30 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-navy-200/60 rounded-full px-4 py-2 mb-6 shadow-soft">
            <BookOpen className="w-4 h-4 text-ocean-500" />
            <span className="text-sm font-medium text-navy-600">Articles &amp; Reference</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-5 text-navy-900">
            Knowledge <span className="gradient-text">Base</span>
          </h1>

          <p className="text-lg md:text-xl text-navy-500 max-w-3xl mx-auto leading-relaxed">
            Practical writeups from people who have run the math, filed the entries, and chased the
            demurrage. Skim, search, or read the deep dives.
          </p>
        </div>
      </section>

      {/* Article grid + search */}
      <section className="py-8 px-6 bg-navy-50">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <div className="bg-white border border-navy-100 rounded-2xl p-6 md:p-8 shadow-card">
              <KbArticleGrid articles={articles} />
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Existing reference component (glossary, Incoterms, ports, forms) */}
      <section className="py-12 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-navy-900">Reference Library</h2>
            <p className="text-navy-500 mt-1 text-sm">
              Glossary, Incoterms, port profiles, CBP forms, and compliance checklists.
            </p>
          </div>
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
            International Logistics Platform &mdash; Built with AI Acrobatics
          </div>
          <a href="/" className="text-xs text-ocean-600 hover:text-ocean-700 transition-colors font-medium">
            &larr; Back to Platform
          </a>
        </div>
      </footer>
    </main>
  );
}

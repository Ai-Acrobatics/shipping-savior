"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import {
  Search, BookOpen, Globe, FileText, Scale, ChevronDown, ChevronUp,
  AlertTriangle, CheckCircle, Info, Filter, X, ExternalLink, Truck,
  Shield, Table2, DollarSign, ArrowRight, RotateCcw
} from "lucide-react";
import {
  glossaryTerms, incoterms, complianceGuides, tradeRegulations, customsForms,
  importProcessSteps, ftzGuideArticles, complianceChecklists, documentationMatrix, hiddenCosts,
  type GlossaryTerm, type Incoterm, type ComplianceGuide, type TradeRegulation
} from "@/lib/knowledge-base-data";

type Tab = "process" | "ftz-guide" | "checklists" | "docs-matrix" | "hidden-costs" | "glossary" | "incoterms" | "compliance" | "regulations" | "forms";

const categoryColors: Record<string, string> = {
  customs: "text-ocean-300 bg-ocean-500/10 border-ocean-500/20",
  freight: "text-blue-300 bg-blue-500/10 border-blue-500/20",
  trade: "text-purple-300 bg-purple-500/10 border-purple-500/20",
  ftz: "text-green-300 bg-green-500/10 border-green-500/20",
  documentation: "text-cargo-300 bg-cargo-500/10 border-cargo-500/20",
  finance: "text-pink-300 bg-pink-500/10 border-pink-500/20",
};

const regulationTypeColors: Record<string, string> = {
  tariff: "text-cargo-300 bg-cargo-500/10 border-cargo-500/20",
  restriction: "text-red-300 bg-red-500/10 border-red-500/20",
  fta: "text-green-300 bg-green-500/10 border-green-500/20",
  embargo: "text-red-400 bg-red-500/20 border-red-500/30",
  quota: "text-orange-300 bg-orange-500/10 border-orange-500/20",
};

const complianceCategoryColors: Record<string, string> = {
  cbp: "text-ocean-300 bg-ocean-500/10 border-ocean-500/20",
  itar: "text-red-300 bg-red-500/10 border-red-500/20",
  export: "text-purple-300 bg-purple-500/10 border-purple-500/20",
  fda: "text-green-300 bg-green-500/10 border-green-500/20",
  aphis: "text-cargo-300 bg-cargo-500/10 border-cargo-500/20",
  general: "text-navy-300 bg-white/5 border-white/10",
};

const riskColors: Record<string, string> = {
  buyer: "text-ocean-300",
  seller: "text-cargo-300",
  split: "text-purple-300",
};

// ---- Import Process ----
function ImportProcessSection({ query }: { query: string }) {
  const [openStep, setOpenStep] = useState<number | null>(null);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return importProcessSteps.filter(
      (s) =>
        !q ||
        s.title.toLowerCase().includes(q) ||
        s.overview.toLowerCase().includes(q) ||
        s.procedures.some((p) => p.toLowerCase().includes(q)) ||
        s.requiredDocs.some((d) => d.toLowerCase().includes(q))
    );
  }, [query]);

  return (
    <div>
      <p className="text-sm text-navy-300 mb-6 leading-relaxed">
        The complete 6-step process for importing goods into the United States — from sourcing suppliers in SE Asia to fulfillment and sale.
      </p>
      <div className="space-y-3">
        {filtered.map((step) => (
          <div key={step.step} className="glass rounded-xl overflow-hidden">
            <button
              className="w-full flex items-start justify-between gap-4 p-5 text-left hover:bg-white/5 transition-colors"
              onClick={() => setOpenStep(openStep === step.step ? null : step.step)}
            >
              <div className="flex items-start gap-4 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-ocean-500 to-ocean-700 flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-sm">{step.step}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-white mb-1">{step.title}</div>
                  <p className="text-sm text-navy-300 leading-relaxed line-clamp-2">{step.overview}</p>
                </div>
              </div>
              {openStep === step.step ? (
                <ChevronUp className="w-4 h-4 text-navy-400 flex-shrink-0 mt-1" />
              ) : (
                <ChevronDown className="w-4 h-4 text-navy-400 flex-shrink-0 mt-1" />
              )}
            </button>

            {openStep === step.step && (
              <div className="px-5 pb-5 border-t border-white/5 space-y-5 pt-4">
                <div>
                  <div className="text-xs font-semibold text-ocean-400 uppercase tracking-wide mb-2">Step-by-Step Procedure</div>
                  <ol className="space-y-1.5">
                    {step.procedures.map((proc, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-navy-200">
                        <span className="text-ocean-500 font-mono text-xs mt-0.5 flex-shrink-0">{i + 1}.</span>
                        {proc}
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-xl p-4">
                    <div className="text-xs font-semibold text-green-400 uppercase tracking-wide mb-2">Required Documents</div>
                    {step.requiredDocs.map((doc, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-navy-200 py-0.5">
                        <FileText className="w-3 h-3 text-green-500 flex-shrink-0" />
                        {doc}
                      </div>
                    ))}
                  </div>

                  <div className="bg-red-500/5 rounded-xl p-4 border border-red-500/10">
                    <div className="text-xs font-semibold text-red-400 uppercase tracking-wide mb-2 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Common Mistakes
                    </div>
                    {step.commonMistakes.map((m, i) => (
                      <div key={i} className="text-xs text-red-300/80 py-1 leading-relaxed">• {m}</div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 text-xs">
                  <div className="bg-white/5 rounded-lg px-3 py-2">
                    <span className="text-navy-500">Timeline: </span>
                    <span className="text-navy-200 font-medium">{step.timeline}</span>
                  </div>
                </div>

                {step.officialSources.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {step.officialSources.map((src, i) => (
                      <a
                        key={i}
                        href={src.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-ocean-400 hover:text-ocean-300 bg-ocean-500/10 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" />
                        {src.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-12 text-navy-500">
            <Truck className="w-8 h-8 mx-auto mb-3 opacity-50" />
            No import steps match your search.
          </div>
        )}
      </div>
    </div>
  );
}

// ---- FTZ Guide ----
function FTZGuideSection({ query }: { query: string }) {
  const [openArticle, setOpenArticle] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return ftzGuideArticles.filter(
      (a) =>
        !q ||
        a.title.toLowerCase().includes(q) ||
        a.content.toLowerCase().includes(q) ||
        a.keyPoints.some((p) => p.toLowerCase().includes(q))
    );
  }, [query]);

  return (
    <div>
      <p className="text-sm text-navy-300 mb-6 leading-relaxed">
        Comprehensive guide to Foreign Trade Zones — benefits, application process, compliance, and tariff strategy.
      </p>
      <div className="space-y-3">
        {filtered.map((article) => (
          <div key={article.slug} className="glass rounded-xl overflow-hidden">
            <button
              className="w-full flex items-start justify-between gap-4 p-5 text-left hover:bg-white/5 transition-colors"
              onClick={() => setOpenArticle(openArticle === article.slug ? null : article.slug)}
            >
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-white mb-1">{article.title}</div>
                <p className="text-sm text-navy-300 leading-relaxed line-clamp-2">{article.content}</p>
              </div>
              {openArticle === article.slug ? (
                <ChevronUp className="w-4 h-4 text-navy-400 flex-shrink-0 mt-1" />
              ) : (
                <ChevronDown className="w-4 h-4 text-navy-400 flex-shrink-0 mt-1" />
              )}
            </button>

            {openArticle === article.slug && (
              <div className="px-5 pb-5 border-t border-white/5 space-y-4 pt-4">
                <p className="text-sm text-navy-200 leading-relaxed">{article.content}</p>

                <div>
                  <div className="text-xs font-semibold text-green-400 uppercase tracking-wide mb-2">Key Points</div>
                  <ul className="space-y-1.5">
                    {article.keyPoints.map((point, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-navy-200">
                        <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>

                {article.officialSources.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {article.officialSources.map((src, i) => (
                      <a
                        key={i}
                        href={src.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-ocean-400 hover:text-ocean-300 bg-ocean-500/10 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" />
                        {src.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-12 text-navy-500">
            <Shield className="w-8 h-8 mx-auto mb-3 opacity-50" />
            No FTZ articles match your search.
          </div>
        )}
      </div>
    </div>
  );
}

// ---- Checklists ----
function useChecklist(checklistId: string) {
  const [checked, setChecked] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set<string>();
    try {
      const saved = localStorage.getItem(`kb-checklist-${checklistId}`);
      return saved ? new Set<string>(JSON.parse(saved)) : new Set<string>();
    } catch {
      return new Set<string>();
    }
  });

  const toggle = useCallback(
    (itemId: string) => {
      setChecked((prev) => {
        const next = new Set(prev);
        if (next.has(itemId)) next.delete(itemId);
        else next.add(itemId);
        localStorage.setItem(`kb-checklist-${checklistId}`, JSON.stringify(Array.from(next)));
        return next;
      });
    },
    [checklistId]
  );

  const reset = useCallback(() => {
    setChecked(new Set<string>());
    localStorage.removeItem(`kb-checklist-${checklistId}`);
  }, [checklistId]);

  return { checked, toggle, reset };
}

function ChecklistSection({ query }: { query: string }) {
  const [activeChecklist, setActiveChecklist] = useState(complianceChecklists[0].id);

  const checklist = complianceChecklists.find((c) => c.id === activeChecklist) ?? complianceChecklists[0];
  const { checked, toggle, reset } = useChecklist(checklist.id);

  const filteredItems = useMemo(() => {
    const q = query.toLowerCase();
    if (!q) return checklist.items;
    return checklist.items.filter(
      (item) => item.label.toLowerCase().includes(q) || item.detail.toLowerCase().includes(q)
    );
  }, [query, checklist]);

  const progress = checklist.items.length > 0 ? Math.round((checked.size / checklist.items.length) * 100) : 0;

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-6">
        {complianceChecklists.map((cl) => (
          <button
            key={cl.id}
            onClick={() => setActiveChecklist(cl.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              activeChecklist === cl.id
                ? "bg-ocean-500/30 border-ocean-500/50 text-ocean-200"
                : "bg-white/5 border-white/10 text-navy-400 hover:text-navy-200"
            }`}
          >
            {cl.title.replace(" Import Checklist", "").replace(" Checklist", "")}
          </button>
        ))}
      </div>

      <p className="text-sm text-navy-300 mb-4">{checklist.description}</p>

      {/* Progress bar */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-ocean-500 to-green-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-xs text-navy-400 font-medium w-24 text-right">
          {checked.size} / {checklist.items.length} ({progress}%)
        </span>
        <button
          onClick={reset}
          className="text-xs text-navy-500 hover:text-navy-300 transition-colors flex items-center gap-1"
          title="Reset checklist"
        >
          <RotateCcw className="w-3 h-3" />
        </button>
      </div>

      <div className="space-y-2">
        {filteredItems.map((item) => (
          <div key={item.id} className="glass rounded-xl p-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={checked.has(item.id)}
                onChange={() => toggle(item.id)}
                className="mt-0.5 w-4 h-4 rounded border-white/20 bg-white/5 text-ocean-500 focus:ring-ocean-500/30 flex-shrink-0"
              />
              <div className="flex-1">
                <div className={`text-sm font-medium transition-colors ${checked.has(item.id) ? "text-navy-500 line-through" : "text-white"}`}>
                  {item.label}
                </div>
                <p className="text-xs text-navy-400 mt-1 leading-relaxed">{item.detail}</p>
              </div>
            </label>
          </div>
        ))}

        {filteredItems.length === 0 && (
          <div className="text-center py-12 text-navy-500">
            <CheckCircle className="w-8 h-8 mx-auto mb-3 opacity-50" />
            No checklist items match your search.
          </div>
        )}
      </div>
    </div>
  );
}

// ---- Documentation Matrix ----
function DocMatrixSection({ query }: { query: string }) {
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return documentationMatrix.filter(
      (d) =>
        !q ||
        d.document.toLowerCase().includes(q) ||
        d.description.toLowerCase().includes(q) ||
        d.preparedBy.toLowerCase().includes(q)
    );
  }, [query]);

  const stepLabels = [
    { key: "sourcing" as const, label: "Sourcing" },
    { key: "isf" as const, label: "ISF" },
    { key: "transit" as const, label: "Transit" },
    { key: "customs" as const, label: "Customs" },
    { key: "ftz" as const, label: "FTZ" },
    { key: "fulfillment" as const, label: "Fulfill" },
  ];

  const selected = documentationMatrix.find((d) => d.document === selectedDoc);

  return (
    <div>
      <p className="text-sm text-navy-300 mb-6 leading-relaxed">
        Which documents are required at each step of the import process. Click a document name for details.
      </p>

      <div className="overflow-x-auto -mx-2 px-2">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left text-xs font-semibold text-navy-400 uppercase tracking-wide py-3 pr-4 sticky left-0 bg-transparent">
                Document
              </th>
              {stepLabels.map((s) => (
                <th key={s.key} className="text-center text-xs font-semibold text-navy-400 uppercase tracking-wide py-3 px-2 min-w-[60px]">
                  {s.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((doc) => (
              <tr
                key={doc.document}
                className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                onClick={() => setSelectedDoc(selectedDoc === doc.document ? null : doc.document)}
              >
                <td className="py-3 pr-4">
                  <span className="text-ocean-400 font-medium hover:text-ocean-300 transition-colors">
                    {doc.document}
                  </span>
                </td>
                {stepLabels.map((s) => (
                  <td key={s.key} className="text-center py-3 px-2">
                    {doc.steps[s.key] ? (
                      <span className="inline-block w-6 h-6 rounded-md bg-green-500/20 text-green-400 text-xs font-bold leading-6">
                        ✓
                      </span>
                    ) : (
                      <span className="inline-block w-6 h-6 rounded-md bg-white/5 text-navy-600 text-xs leading-6">
                        —
                      </span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="mt-6 glass rounded-xl p-5 border-ocean-500/20">
          <div className="font-semibold text-white mb-2">{selected.document}</div>
          <p className="text-sm text-navy-200 leading-relaxed mb-3">{selected.description}</p>
          <div className="grid md:grid-cols-2 gap-3 text-xs">
            <div className="bg-white/5 rounded-lg p-3">
              <span className="text-navy-500">Prepared by: </span>
              <span className="text-navy-200">{selected.preparedBy}</span>
            </div>
            <div className="bg-red-500/5 rounded-lg p-3 border border-red-500/10">
              <span className="text-red-400">Common mistakes: </span>
              <span className="text-red-300/80">{selected.commonMistakes}</span>
            </div>
          </div>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="text-center py-12 text-navy-500">
          <Table2 className="w-8 h-8 mx-auto mb-3 opacity-50" />
          No documents match your search.
        </div>
      )}
    </div>
  );
}

// ---- Hidden Costs ----
function HiddenCostsSection({ query }: { query: string }) {
  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return hiddenCosts.filter(
      (c) =>
        !q ||
        c.cost.toLowerCase().includes(q) ||
        c.notes.toLowerCase().includes(q) ||
        c.whenIncurred.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <div>
      <p className="text-sm text-navy-300 mb-6 leading-relaxed">
        Beyond duties and freight, these are the costs that catch importers off guard. Know them before they hit your margin.
      </p>

      <div className="space-y-3">
        {filtered.map((cost) => (
          <div key={cost.cost} className="glass rounded-xl p-4">
            <div className="flex items-start justify-between gap-4 mb-2">
              <div className="font-semibold text-white">{cost.cost}</div>
              <div className="text-sm font-mono text-cargo-400 bg-cargo-500/10 px-2 py-0.5 rounded whitespace-nowrap">
                {cost.typicalRange}
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-navy-400 mb-2">
              <ArrowRight className="w-3 h-3" />
              {cost.whenIncurred}
            </div>
            <p className="text-xs text-navy-300 leading-relaxed">{cost.notes}</p>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-12 text-navy-500">
            <DollarSign className="w-8 h-8 mx-auto mb-3 opacity-50" />
            No costs match your search.
          </div>
        )}
      </div>
    </div>
  );
}

// ---- Glossary ----
function GlossarySection({ query }: { query: string }) {
  const [openTerm, setOpenTerm] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const categories = ["all", "customs", "freight", "trade", "ftz", "documentation", "finance"];

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return glossaryTerms.filter((t) => {
      const matchesQ =
        !q ||
        t.term.toLowerCase().includes(q) ||
        t.abbreviation?.toLowerCase().includes(q) ||
        t.definition.toLowerCase().includes(q);
      const matchesCat = activeCategory === "all" || t.category === activeCategory;
      return matchesQ && matchesCat;
    });
  }, [query, activeCategory]);

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all capitalize ${
              activeCategory === cat
                ? "bg-ocean-500/30 border-ocean-500/50 text-ocean-200"
                : "bg-white/5 border-white/10 text-navy-400 hover:text-navy-200"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="text-xs text-navy-500 mb-4">{filtered.length} terms</div>

      <div className="space-y-2">
        {filtered.map((term) => (
          <div key={term.term} className="glass rounded-xl overflow-hidden">
            <button
              className="w-full flex items-start justify-between gap-4 p-4 text-left hover:bg-white/5 transition-colors"
              onClick={() => setOpenTerm(openTerm === term.term ? null : term.term)}
            >
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-white">{term.term}</span>
                    {term.abbreviation && (
                      <span className="text-xs font-mono text-ocean-400 bg-ocean-500/10 px-2 py-0.5 rounded">
                        {term.abbreviation}
                      </span>
                    )}
                    <span
                      className={`text-xs px-2 py-0.5 rounded border capitalize ${
                        categoryColors[term.category] || "text-navy-400 bg-white/5 border-white/10"
                      }`}
                    >
                      {term.category}
                    </span>
                  </div>
                </div>
              </div>
              {openTerm === term.term ? (
                <ChevronUp className="w-4 h-4 text-navy-400 flex-shrink-0 mt-0.5" />
              ) : (
                <ChevronDown className="w-4 h-4 text-navy-400 flex-shrink-0 mt-0.5" />
              )}
            </button>

            {openTerm === term.term && (
              <div className="px-4 pb-4 border-t border-white/5">
                <p className="text-sm text-navy-200 leading-relaxed pt-3">{term.definition}</p>
              </div>
            )}
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-12 text-navy-500">
            <BookOpen className="w-8 h-8 mx-auto mb-3 opacity-50" />
            No terms match your search.
          </div>
        )}
      </div>
    </div>
  );
}

// ---- Incoterms ----
function IncotermsSection({ query }: { query: string }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [transport, setTransport] = useState<"all" | "any" | "sea">("all");

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return incoterms.filter((t) => {
      const matchesQ =
        !q ||
        t.code.toLowerCase().includes(q) ||
        t.name.toLowerCase().includes(q) ||
        t.bestFor.toLowerCase().includes(q);
      const matchesT = transport === "all" || t.transport === transport;
      return matchesQ && matchesT;
    });
  }, [query, transport]);

  const selectedTerm = incoterms.find((t) => t.code === selected);

  return (
    <div>
      <div className="flex gap-2 mb-6">
        {(["all", "any", "sea"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTransport(t)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              transport === t
                ? "bg-ocean-500/30 border-ocean-500/50 text-ocean-200"
                : "bg-white/5 border-white/10 text-navy-400 hover:text-navy-200"
            }`}
          >
            {t === "all" ? "All Modes" : t === "any" ? "Any Transport" : "Sea Only"}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-3 mb-6">
        {filtered.map((term) => (
          <button
            key={term.code}
            onClick={() => setSelected(selected === term.code ? null : term.code)}
            className={`glass glass-hover rounded-xl p-4 text-left transition-all ${
              selected === term.code ? "border-ocean-500/40 bg-ocean-500/5" : ""
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl font-bold text-ocean-400">{term.code}</span>
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      term.transport === "sea"
                        ? "bg-blue-500/10 text-blue-300"
                        : "bg-purple-500/10 text-purple-300"
                    }`}
                  >
                    {term.transport === "sea" ? "Sea Only" : "Any Mode"}
                  </span>
                </div>
                <div className="text-sm font-medium text-white">{term.name}</div>
                <div className="text-xs text-navy-400 mt-1">{term.riskTransferPoint}</div>
              </div>
              <div className={`text-xs font-medium capitalize ${riskColors[term.risk]}`}>
                {term.risk === "split" ? "Split" : `${term.risk} bears risk`}
              </div>
            </div>
          </button>
        ))}
      </div>

      {selectedTerm && (
        <div className="glass rounded-2xl p-6 border-ocean-500/20">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl font-bold text-ocean-400">{selectedTerm.code}</span>
            <div>
              <div className="font-semibold text-white">{selectedTerm.name}</div>
              <div className="text-xs text-navy-400">Risk transfers at: {selectedTerm.riskTransferPoint}</div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-4">
            <div>
              <div className="text-xs font-semibold text-cargo-400 uppercase tracking-wide mb-2">Seller Covers</div>
              <ul className="space-y-1">
                {selectedTerm.sellerCovers.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-navy-200">
                    <CheckCircle className="w-3 h-3 text-cargo-500 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="text-xs font-semibold text-ocean-400 uppercase tracking-wide mb-2">Buyer Covers</div>
              <ul className="space-y-1">
                {selectedTerm.buyerCovers.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-navy-200">
                    <CheckCircle className="w-3 h-3 text-ocean-500 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-3 flex items-start gap-2">
            <Info className="w-4 h-4 text-ocean-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-navy-200">{selectedTerm.bestFor}</p>
          </div>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="text-center py-12 text-navy-500">
          <Globe className="w-8 h-8 mx-auto mb-3 opacity-50" />
          No incoterms match your search.
        </div>
      )}
    </div>
  );
}

// ---- Compliance ----
function ComplianceSection({ query }: { query: string }) {
  const [openGuide, setOpenGuide] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const categories = ["all", "cbp", "export", "fda", "aphis", "general"];

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return complianceGuides.filter((g) => {
      const matchesQ =
        !q ||
        g.title.toLowerCase().includes(q) ||
        g.summary.toLowerCase().includes(q) ||
        g.keyPoints.some((p) => p.toLowerCase().includes(q));
      const matchesCat = activeCategory === "all" || g.category === activeCategory;
      return matchesQ && matchesCat;
    });
  }, [query, activeCategory]);

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all uppercase ${
              activeCategory === cat
                ? "bg-ocean-500/30 border-ocean-500/50 text-ocean-200"
                : "bg-white/5 border-white/10 text-navy-400 hover:text-navy-200"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((guide) => (
          <div key={guide.id} className="glass rounded-xl overflow-hidden">
            <button
              className="w-full flex items-start justify-between gap-4 p-5 text-left hover:bg-white/5 transition-colors"
              onClick={() => setOpenGuide(openGuide === guide.id ? null : guide.id)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="font-semibold text-white">{guide.title}</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded border uppercase ${
                      complianceCategoryColors[guide.category] || "text-navy-400 bg-white/5 border-white/10"
                    }`}
                  >
                    {guide.category}
                  </span>
                </div>
                <p className="text-sm text-navy-300 leading-relaxed">{guide.summary}</p>
              </div>
              {openGuide === guide.id ? (
                <ChevronUp className="w-4 h-4 text-navy-400 flex-shrink-0 mt-1" />
              ) : (
                <ChevronDown className="w-4 h-4 text-navy-400 flex-shrink-0 mt-1" />
              )}
            </button>

            {openGuide === guide.id && (
              <div className="px-5 pb-5 border-t border-white/5 space-y-4 pt-4">
                <div>
                  <div className="text-xs font-semibold text-ocean-400 uppercase tracking-wide mb-2">Key Requirements</div>
                  <ul className="space-y-1.5">
                    {guide.keyPoints.map((point, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-navy-200">
                        <CheckCircle className="w-3.5 h-3.5 text-ocean-500 flex-shrink-0 mt-0.5" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="grid md:grid-cols-3 gap-3">
                  {guide.forms && guide.forms.length > 0 && (
                    <div className="bg-white/5 rounded-xl p-3">
                      <div className="text-xs font-semibold text-cargo-400 uppercase tracking-wide mb-2">Forms</div>
                      {guide.forms.map((f, i) => (
                        <div key={i} className="text-xs text-navy-300 py-0.5">{f}</div>
                      ))}
                    </div>
                  )}

                  {guide.deadlines && guide.deadlines.length > 0 && (
                    <div className="bg-white/5 rounded-xl p-3">
                      <div className="text-xs font-semibold text-purple-400 uppercase tracking-wide mb-2">Deadlines</div>
                      {guide.deadlines.map((d, i) => (
                        <div key={i} className="text-xs text-navy-300 py-0.5">{d}</div>
                      ))}
                    </div>
                  )}

                  {guide.penalties && (
                    <div className="bg-red-500/5 rounded-xl p-3 border border-red-500/10">
                      <div className="text-xs font-semibold text-red-400 uppercase tracking-wide mb-2 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Penalties
                      </div>
                      <div className="text-xs text-red-300">{guide.penalties}</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-12 text-navy-500">
            <Scale className="w-8 h-8 mx-auto mb-3 opacity-50" />
            No guides match your search.
          </div>
        )}
      </div>
    </div>
  );
}

// ---- Trade Regulations ----
function RegulationsSection({ query }: { query: string }) {
  const [openReg, setOpenReg] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<string>("all");
  const [activeRegion, setActiveRegion] = useState<string>("all");

  const types = ["all", "tariff", "restriction", "fta", "embargo", "quota"];
  const regions = ["all", ...Array.from(new Set(tradeRegulations.map((r) => r.region)))];

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return tradeRegulations.filter((r) => {
      const matchesQ =
        !q ||
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.region.toLowerCase().includes(q);
      const matchesType = activeType === "all" || r.type === activeType;
      const matchesRegion = activeRegion === "all" || r.region === activeRegion;
      return matchesQ && matchesType && matchesRegion;
    });
  }, [query, activeType, activeRegion]);

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-3">
        {types.map((t) => (
          <button
            key={t}
            onClick={() => setActiveType(t)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all capitalize ${
              activeType === t
                ? "bg-ocean-500/30 border-ocean-500/50 text-ocean-200"
                : "bg-white/5 border-white/10 text-navy-400 hover:text-navy-200"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <span className="text-xs text-navy-500 flex items-center gap-1 mr-1">
          <Filter className="w-3 h-3" /> Region:
        </span>
        {regions.map((r) => (
          <button
            key={r}
            onClick={() => setActiveRegion(r)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              activeRegion === r
                ? "bg-purple-500/30 border-purple-500/50 text-purple-200"
                : "bg-white/5 border-white/10 text-navy-400 hover:text-navy-200"
            }`}
          >
            {r === "all" ? "All Regions" : r}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((reg) => (
          <div key={reg.id} className="glass rounded-xl overflow-hidden">
            <button
              className="w-full flex items-start justify-between gap-4 p-5 text-left hover:bg-white/5 transition-colors"
              onClick={() => setOpenReg(openReg === reg.id ? null : reg.id)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="font-semibold text-white">{reg.title}</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded border capitalize ${
                      regulationTypeColors[reg.type] || "text-navy-400 bg-white/5 border-white/10"
                    }`}
                  >
                    {reg.type}
                  </span>
                  <span className="text-xs text-navy-500 bg-white/5 border border-white/10 px-2 py-0.5 rounded">
                    {reg.region}{reg.country ? ` (${reg.country})` : ""}
                  </span>
                </div>
                <p className="text-sm text-navy-300 leading-relaxed line-clamp-2">{reg.description}</p>
              </div>
              {openReg === reg.id ? (
                <ChevronUp className="w-4 h-4 text-navy-400 flex-shrink-0 mt-1" />
              ) : (
                <ChevronDown className="w-4 h-4 text-navy-400 flex-shrink-0 mt-1" />
              )}
            </button>

            {openReg === reg.id && (
              <div className="px-5 pb-5 border-t border-white/5 pt-4 space-y-3">
                <p className="text-sm text-navy-200 leading-relaxed">{reg.description}</p>

                <div className="flex flex-wrap gap-3 text-xs text-navy-400">
                  {reg.effectiveDate && (
                    <span className="flex items-center gap-1">
                      <span className="text-navy-500">Effective:</span>
                      <span className="text-navy-200">{reg.effectiveDate}</span>
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <span className="text-navy-500">Source:</span>
                    <span className="text-navy-200">{reg.source}</span>
                  </span>
                </div>

                {reg.htsCodes && reg.htsCodes.length > 0 && (
                  <div className="bg-white/5 rounded-xl p-3">
                    <div className="text-xs font-semibold text-cargo-400 uppercase tracking-wide mb-2">Affected HTS Chapters</div>
                    <div className="flex flex-wrap gap-2">
                      {reg.htsCodes.map((code, i) => (
                        <span key={i} className="text-xs font-mono bg-cargo-500/10 text-cargo-300 px-2 py-0.5 rounded border border-cargo-500/20">
                          {code}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-12 text-navy-500">
            <Globe className="w-8 h-8 mx-auto mb-3 opacity-50" />
            No regulations match your search.
          </div>
        )}
      </div>
    </div>
  );
}

// ---- Forms Reference ----
function FormsSection({ query }: { query: string }) {
  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return customsForms.filter(
      (f) =>
        !q ||
        f.code.toLowerCase().includes(q) ||
        f.name.toLowerCase().includes(q) ||
        f.use.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <div>
      <div className="text-xs text-navy-500 mb-4">{filtered.length} forms</div>
      <div className="grid gap-3">
        {filtered.map((form) => (
          <div key={form.code} className="glass glass-hover rounded-xl p-4">
            <div className="flex items-start gap-4">
              <div className="w-24 flex-shrink-0">
                <span className="text-xs font-mono font-bold text-ocean-400 bg-ocean-500/10 px-2 py-1 rounded border border-ocean-500/20">
                  {form.code}
                </span>
              </div>
              <div>
                <div className="font-semibold text-white text-sm mb-1">{form.name}</div>
                <p className="text-xs text-navy-300 leading-relaxed">{form.use}</p>
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-12 text-navy-500">
            <FileText className="w-8 h-8 mx-auto mb-3 opacity-50" />
            No forms match your search.
          </div>
        )}
      </div>

      <div className="mt-6 glass rounded-xl p-4 border-cargo-500/20">
        <div className="flex items-start gap-2">
          <ExternalLink className="w-4 h-4 text-cargo-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-navy-300">
            <span className="font-semibold text-cargo-300">Official Sources: </span>
            All CBP forms available at{" "}
            <span className="text-ocean-400">cbp.gov/trade/programs-administration/entry-summary/cbp-forms</span>
            {" "}— always download the current version before use.
          </div>
        </div>
      </div>
    </div>
  );
}

// ---- Main Component ----
export default function KnowledgeBase() {
  const [activeTab, setActiveTab] = useState<Tab>("process");
  const [searchQuery, setSearchQuery] = useState("");

  const tabs: { id: Tab; label: string; icon: React.ElementType; count: number }[] = [
    { id: "process", label: "Import Process", icon: Truck, count: importProcessSteps.length },
    { id: "ftz-guide", label: "FTZ Guide", icon: Shield, count: ftzGuideArticles.length },
    { id: "checklists", label: "Checklists", icon: CheckCircle, count: complianceChecklists.length },
    { id: "docs-matrix", label: "Documents", icon: Table2, count: documentationMatrix.length },
    { id: "hidden-costs", label: "Hidden Costs", icon: DollarSign, count: hiddenCosts.length },
    { id: "glossary", label: "Glossary", icon: BookOpen, count: glossaryTerms.length },
    { id: "incoterms", label: "Incoterms", icon: Globe, count: incoterms.length },
    { id: "compliance", label: "Compliance", icon: Scale, count: complianceGuides.length },
    { id: "regulations", label: "Regulations", icon: AlertTriangle, count: tradeRegulations.length },
    { id: "forms", label: "CBP Forms", icon: FileText, count: customsForms.length },
  ];

  const searchPlaceholders: Record<Tab, string> = {
    process: "Search import steps, procedures...",
    "ftz-guide": "Search FTZ articles...",
    checklists: "Search checklist items...",
    "docs-matrix": "Search documents...",
    "hidden-costs": "Search costs...",
    glossary: "Search terms, abbreviations...",
    incoterms: "Search incoterms...",
    compliance: "Search compliance topics...",
    regulations: "Search regulations, countries...",
    forms: "Search CBP forms...",
  };

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={searchPlaceholders[activeTab]}
          className="w-full glass rounded-xl pl-12 pr-10 py-3 text-sm text-white placeholder-navy-500 focus:outline-none focus:border-ocean-500/50 focus:ring-1 focus:ring-ocean-500/30 transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-navy-400 hover:text-navy-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
              activeTab === tab.id
                ? "bg-ocean-500/20 border-ocean-500/40 text-ocean-200"
                : "glass glass-hover text-navy-300 hover:text-white"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{tab.label}</span>
            <span
              className={`text-xs px-1.5 py-0.5 rounded-full ${
                activeTab === tab.id ? "bg-ocean-500/30 text-ocean-300" : "bg-white/10 text-navy-500"
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div>
        {activeTab === "process" && <ImportProcessSection query={searchQuery} />}
        {activeTab === "ftz-guide" && <FTZGuideSection query={searchQuery} />}
        {activeTab === "checklists" && <ChecklistSection query={searchQuery} />}
        {activeTab === "docs-matrix" && <DocMatrixSection query={searchQuery} />}
        {activeTab === "hidden-costs" && <HiddenCostsSection query={searchQuery} />}
        {activeTab === "glossary" && <GlossarySection query={searchQuery} />}
        {activeTab === "incoterms" && <IncotermsSection query={searchQuery} />}
        {activeTab === "compliance" && <ComplianceSection query={searchQuery} />}
        {activeTab === "regulations" && <RegulationsSection query={searchQuery} />}
        {activeTab === "forms" && <FormsSection query={searchQuery} />}
      </div>
    </div>
  );
}

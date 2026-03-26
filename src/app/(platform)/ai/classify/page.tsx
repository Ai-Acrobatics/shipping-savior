"use client";

// ============================================================
// AI Classification Dashboard Page
// Sprint 4: AI Agent Layer
//
// Product classification interface with:
// - Text input for product description
// - Country of origin dropdown
// - Confidence bars for top 3 predictions
// - Accept/Override actions
// - Classification history
// ============================================================

import { useState, useCallback } from "react";
import {
  Search,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  History,
  Sparkles,
  ChevronDown,
  ExternalLink,
  Edit3,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────

interface Prediction {
  htsCode: string;
  description: string;
  confidence: number;
  dutyRate: number;
  reasoning: string;
}

interface ClassificationResult {
  predictions: Prediction[];
  disclaimers: string[];
  processingTimeMs: number;
}

interface HistoryEntry {
  id: string;
  productDescription: string;
  countryOfOrigin: string;
  acceptedCode: string;
  confidence: number;
  timestamp: Date;
}

// ─── Country Options ─────────────────────────────────────────

const COUNTRIES = [
  { code: "CN", name: "China" },
  { code: "VN", name: "Vietnam" },
  { code: "TH", name: "Thailand" },
  { code: "ID", name: "Indonesia" },
  { code: "KH", name: "Cambodia" },
  { code: "MY", name: "Malaysia" },
  { code: "PH", name: "Philippines" },
  { code: "IN", name: "India" },
  { code: "BD", name: "Bangladesh" },
  { code: "MX", name: "Mexico" },
  { code: "CA", name: "Canada" },
  { code: "KR", name: "South Korea" },
  { code: "TW", name: "Taiwan" },
  { code: "JP", name: "Japan" },
  { code: "DE", name: "Germany" },
  { code: "GB", name: "United Kingdom" },
  { code: "IT", name: "Italy" },
  { code: "FR", name: "France" },
  { code: "BR", name: "Brazil" },
  { code: "TR", name: "Turkey" },
  { code: "OTHER", name: "Other" },
];

// ─── Component ───────────────────────────────────────────────

export default function ClassifyPage() {
  const [productDescription, setProductDescription] = useState("");
  const [material, setMaterial] = useState("");
  const [endUse, setEndUse] = useState("");
  const [countryOfOrigin, setCountryOfOrigin] = useState("CN");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ClassificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const handleClassify = useCallback(async () => {
    if (!productDescription.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/ai/classify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productDescription,
          material: material || undefined,
          endUse: endUse || undefined,
          countryOfOrigin,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error ?? "Classification failed");
      }

      const data: ClassificationResult = await res.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [productDescription, material, endUse, countryOfOrigin]);

  const handleAccept = useCallback(
    (prediction: Prediction) => {
      const entry: HistoryEntry = {
        id: Date.now().toString(),
        productDescription,
        countryOfOrigin,
        acceptedCode: prediction.htsCode,
        confidence: prediction.confidence,
        timestamp: new Date(),
      };
      setHistory((prev) => [entry, ...prev].slice(0, 50));
    },
    [productDescription, countryOfOrigin]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-ocean-950 text-white">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-ocean-400" />
              AI HTS Classifier
            </h1>
            <p className="text-slate-400 mt-1">
              AI-powered tariff code classification using General Rules of
              Interpretation
            </p>
          </div>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <History className="w-4 h-4" />
            History ({history.length})
          </button>
        </div>

        {/* Input Form */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Product Description *
              </label>
              <textarea
                value={productDescription}
                onChange={(e) => setProductDescription(e.target.value)}
                placeholder="e.g., Cotton crew neck t-shirt, 180 GSM jersey knit, screen printed..."
                rows={3}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-transparent resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Material (optional)
              </label>
              <input
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                placeholder="e.g., 100% cotton, polyester blend..."
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-ocean-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                End Use (optional)
              </label>
              <input
                value={endUse}
                onChange={(e) => setEndUse(e.target.value)}
                placeholder="e.g., Men's casual wear, outdoor sports..."
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-ocean-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Country of Origin *
              </label>
              <div className="relative">
                <select
                  value={countryOfOrigin}
                  onChange={(e) => setCountryOfOrigin(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-ocean-500"
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleClassify}
                disabled={loading || !productDescription.trim()}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-ocean-600 hover:bg-ocean-500 disabled:bg-slate-700 disabled:text-slate-500 rounded-lg font-semibold transition-colors"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Classifying...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    Classify Product
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-900/30 border border-red-700 rounded-xl p-4 mb-6 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Classification Results</h2>
              <span className="text-sm text-slate-400">
                {result.processingTimeMs}ms
              </span>
            </div>

            {result.predictions.map((pred, idx) => (
              <div
                key={pred.htsCode}
                className={`bg-slate-800/50 border rounded-xl p-5 ${
                  idx === 0
                    ? "border-ocean-500/50"
                    : "border-slate-700"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {idx === 0 && (
                        <span className="px-2 py-0.5 bg-ocean-600/30 text-ocean-300 text-xs font-medium rounded-full">
                          Top Match
                        </span>
                      )}
                      <span className="font-mono text-lg font-bold text-white">
                        {pred.htsCode}
                      </span>
                    </div>
                    <p className="text-slate-300">{pred.description}</p>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <div className="text-2xl font-bold text-white">
                      {(pred.confidence * 100).toFixed(0)}%
                    </div>
                    <div className="text-xs text-slate-400">confidence</div>
                  </div>
                </div>

                {/* Confidence Bar */}
                <div className="w-full bg-slate-700 rounded-full h-2 mb-3">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      pred.confidence >= 0.8
                        ? "bg-emerald-500"
                        : pred.confidence >= 0.5
                        ? "bg-amber-500"
                        : "bg-red-500"
                    }`}
                    style={{ width: `${pred.confidence * 100}%` }}
                  />
                </div>

                {/* Duty Rate & Reasoning */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                  <div className="bg-slate-900/50 rounded-lg p-3">
                    <div className="text-xs text-slate-400 mb-1">
                      Effective Duty Rate
                    </div>
                    <div className="text-lg font-bold text-cargo-400">
                      {pred.dutyRate.toFixed(1)}%
                    </div>
                  </div>
                  <div className="md:col-span-2 bg-slate-900/50 rounded-lg p-3">
                    <div className="text-xs text-slate-400 mb-1">
                      GRI Reasoning
                    </div>
                    <p className="text-sm text-slate-300">{pred.reasoning}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAccept(pred)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-600/30 rounded-lg text-sm transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Accept
                  </button>
                  <button className="flex items-center gap-1.5 px-4 py-2 bg-slate-700/50 hover:bg-slate-700 text-slate-300 border border-slate-600 rounded-lg text-sm transition-colors">
                    <Edit3 className="w-4 h-4" />
                    Override
                  </button>
                  <a
                    href={`https://hts.usitc.gov/?query=${pred.htsCode}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-4 py-2 bg-slate-700/50 hover:bg-slate-700 text-slate-300 border border-slate-600 rounded-lg text-sm transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    USITC
                  </a>
                </div>
              </div>
            ))}

            {/* Disclaimers */}
            <div className="bg-amber-900/20 border border-amber-700/30 rounded-xl p-4">
              <h3 className="text-sm font-medium text-amber-400 mb-2">
                Disclaimers
              </h3>
              <ul className="space-y-1">
                {result.disclaimers.map((d, i) => (
                  <li key={i} className="text-sm text-amber-300/70 flex gap-2">
                    <span className="shrink-0">-</span>
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* History */}
        {showHistory && history.length > 0 && (
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <History className="w-5 h-5 text-slate-400" />
              Classification History
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-2 px-3 text-slate-400 font-medium">
                      Product
                    </th>
                    <th className="text-left py-2 px-3 text-slate-400 font-medium">
                      Origin
                    </th>
                    <th className="text-left py-2 px-3 text-slate-400 font-medium">
                      HTS Code
                    </th>
                    <th className="text-left py-2 px-3 text-slate-400 font-medium">
                      Confidence
                    </th>
                    <th className="text-left py-2 px-3 text-slate-400 font-medium">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((entry) => (
                    <tr
                      key={entry.id}
                      className="border-b border-slate-700/50 hover:bg-slate-700/20"
                    >
                      <td className="py-2 px-3 text-slate-300 max-w-[200px] truncate">
                        {entry.productDescription}
                      </td>
                      <td className="py-2 px-3 text-slate-300">
                        {entry.countryOfOrigin}
                      </td>
                      <td className="py-2 px-3 font-mono text-ocean-400">
                        {entry.acceptedCode}
                      </td>
                      <td className="py-2 px-3">
                        <span
                          className={`${
                            entry.confidence >= 0.8
                              ? "text-emerald-400"
                              : "text-amber-400"
                          }`}
                        >
                          {(entry.confidence * 100).toFixed(0)}%
                        </span>
                      </td>
                      <td className="py-2 px-3 text-slate-400">
                        {entry.timestamp.toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

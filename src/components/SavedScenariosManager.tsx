"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Save,
  FolderOpen,
  Trash2,
  Copy,
  Clock,
  Tag,
  Plus,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Sparkles,
  Download,
  X,
} from "lucide-react";
import {
  type SavedScenarioSet,
  type SavedTariffScenario,
  type TradePolicy,
  loadAllScenarioSets,
  saveScenarioSet,
  deleteScenarioSet,
  duplicateScenarioSet,
  TRADE_POLICY_PRESETS,
  createScenarioSetFromPreset,
} from "@/lib/scenario-storage";

interface Props {
  currentScenarios: SavedTariffScenario[];
  onLoadScenarios: (scenarios: SavedTariffScenario[]) => void;
  onLoadFTZParams?: (params: NonNullable<SavedScenarioSet["ftzParams"]>) => void;
  ftzParams?: SavedScenarioSet["ftzParams"];
}

export default function SavedScenariosManager({
  currentScenarios,
  onLoadScenarios,
  onLoadFTZParams,
  ftzParams,
}: Props) {
  const [savedSets, setSavedSets] = useState<SavedScenarioSet[]>([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const [expandedSet, setExpandedSet] = useState<string | null>(null);
  const [saveName, setSaveName] = useState("");
  const [saveDescription, setSaveDescription] = useState("");
  const [saveTags, setSaveTags] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  const refreshSets = useCallback(() => {
    setSavedSets(loadAllScenarioSets());
  }, []);

  useEffect(() => {
    refreshSets();
  }, [refreshSets]);

  const handleSave = () => {
    if (!saveName.trim()) return;
    const newSet: SavedScenarioSet = {
      id: `set-${Date.now()}`,
      name: saveName.trim(),
      description: saveDescription.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      scenarios: currentScenarios,
      ftzParams: ftzParams,
      tags: saveTags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    };
    const updated = saveScenarioSet(newSet);
    setSavedSets(updated);
    setSaveName("");
    setSaveDescription("");
    setSaveTags("");
    setShowSaveModal(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleDelete = (id: string) => {
    const updated = deleteScenarioSet(id);
    setSavedSets(updated);
    if (expandedSet === id) setExpandedSet(null);
  };

  const handleDuplicate = (id: string) => {
    const updated = duplicateScenarioSet(id);
    setSavedSets(updated);
  };

  const handleLoad = (set: SavedScenarioSet) => {
    onLoadScenarios(set.scenarios);
    if (set.ftzParams && onLoadFTZParams) {
      onLoadFTZParams(set.ftzParams);
    }
  };

  const handleLoadPreset = (preset: TradePolicy) => {
    const newSet = createScenarioSetFromPreset(preset);
    onLoadScenarios(newSet.scenarios);
    // Also save it so user can find it later
    const updated = saveScenarioSet(newSet);
    setSavedSets(updated);
    setShowPresets(false);
  };

  const handleExportJSON = (set: SavedScenarioSet) => {
    const blob = new Blob([JSON.stringify(set, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${set.name.replace(/\s+/g, "-").toLowerCase()}-scenarios.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const totalRate = (s: SavedTariffScenario) => s.baseDutyRate + s.section301Rate;
  const annualCost = (s: SavedTariffScenario) =>
    s.unitValue * (totalRate(s) / 100) * s.annualUnits;

  return (
    <div className="space-y-4">
      {/* Action bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={() => setShowSaveModal(true)}
          className="flex items-center gap-2 text-sm px-4 py-2.5 rounded-xl bg-green-600/30 hover:bg-green-600/50 text-green-300 border border-green-500/30 transition-all"
        >
          <Save className="w-4 h-4" />
          Save Current
        </button>

        <button
          onClick={() => setShowPresets(!showPresets)}
          className="flex items-center gap-2 text-sm px-4 py-2.5 rounded-xl glass glass-hover text-ocean-300 border border-ocean-500/20 transition-all"
        >
          <Sparkles className="w-4 h-4" />
          Policy Presets
          {showPresets ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>

        {saveSuccess && (
          <div className="text-xs text-green-400 flex items-center gap-1 animate-fade-in">
            ✓ Saved successfully
          </div>
        )}

        <div className="ml-auto text-xs text-navy-500">
          {savedSets.length} saved scenario{savedSets.length !== 1 ? " sets" : ""}
        </div>
      </div>

      {/* Save Modal */}
      {showSaveModal && (
        <div className="glass rounded-2xl p-6 border border-green-500/20 bg-green-500/5 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-green-300 flex items-center gap-2">
              <Save className="w-4 h-4" />
              Save Scenario Set
            </h4>
            <button
              onClick={() => setShowSaveModal(false)}
              className="text-navy-500 hover:text-navy-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-navy-300 block mb-1">Name *</label>
              <input
                type="text"
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                placeholder="e.g., SE Asia Q1 2026 Analysis"
                className="w-full glass rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 bg-navy-900/50"
                autoFocus
              />
            </div>
            <div>
              <label className="text-xs text-navy-300 block mb-1">Description</label>
              <input
                type="text"
                value={saveDescription}
                onChange={(e) => setSaveDescription(e.target.value)}
                placeholder="Brief description of this scenario set"
                className="w-full glass rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 bg-navy-900/50"
              />
            </div>
            <div>
              <label className="text-xs text-navy-300 block mb-1">Tags (comma-separated)</label>
              <input
                type="text"
                value={saveTags}
                onChange={(e) => setSaveTags(e.target.value)}
                placeholder="e.g., vietnam, apparel, q1"
                className="w-full glass rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 bg-navy-900/50"
              />
            </div>

            <div className="text-xs text-navy-400 flex items-center gap-2">
              <FolderOpen className="w-3 h-3" />
              Will save {currentScenarios.length} scenario{currentScenarios.length !== 1 ? "s" : ""}{" "}
              {ftzParams ? "+ FTZ parameters" : ""}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowSaveModal(false)}
                className="text-xs px-3 py-1.5 rounded-lg text-navy-400 hover:text-navy-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!saveName.trim()}
                className="text-xs px-4 py-2 rounded-lg bg-green-600/50 hover:bg-green-600/70 text-green-200 font-medium transition-all disabled:opacity-40"
              >
                Save Scenario Set
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Trade Policy Presets */}
      {showPresets && (
        <div className="space-y-3 animate-fade-in">
          <div className="text-xs text-navy-400 flex items-center gap-2">
            <Sparkles className="w-3 h-3 text-ocean-400" />
            Pre-built scenarios for common trade policy situations. Click to load into the builder.
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {TRADE_POLICY_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handleLoadPreset(preset)}
                className="glass glass-hover rounded-xl p-4 text-left group border border-transparent hover:border-ocean-500/30 transition-all"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{preset.icon}</span>
                  <span className="text-sm font-semibold text-white group-hover:text-ocean-300 transition-colors">
                    {preset.name}
                  </span>
                </div>
                <p className="text-xs text-navy-400 leading-relaxed mb-3">{preset.description}</p>
                <div className="flex items-center gap-1 text-xs text-navy-500">
                  <span>{preset.scenarios.length} scenarios</span>
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Saved Sets List */}
      {savedSets.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-medium text-navy-400 flex items-center gap-2">
            <FolderOpen className="w-3 h-3" />
            Saved Scenario Sets
          </div>

          {savedSets.map((set) => {
            const isExpanded = expandedSet === set.id;
            const bestScenario = set.scenarios.reduce((best, s) =>
              annualCost(s) < annualCost(best) ? s : best
            );

            return (
              <div key={set.id} className="glass rounded-xl overflow-hidden">
                {/* Header */}
                <div
                  className="flex items-center gap-3 p-4 cursor-pointer hover:bg-white/5 transition-colors"
                  onClick={() => setExpandedSet(isExpanded ? null : set.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-white truncate">{set.name}</span>
                      <span className="text-xs text-navy-500">
                        {set.scenarios.length} scenario{set.scenarios.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                    {set.description && (
                      <p className="text-xs text-navy-400 truncate">{set.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-navy-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(set.updatedAt)}
                      </span>
                      {set.tags.length > 0 && (
                        <div className="flex items-center gap-1">
                          <Tag className="w-3 h-3 text-navy-500" />
                          {set.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="text-xs px-1.5 py-0.5 rounded bg-navy-800 text-navy-400"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLoad(set);
                      }}
                      className="text-xs px-3 py-1.5 rounded-lg bg-ocean-600/30 hover:bg-ocean-600/50 text-ocean-300 transition-colors"
                    >
                      Load
                    </button>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-navy-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-navy-500" />
                    )}
                  </div>
                </div>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="border-t border-white/5 p-4 bg-navy-950/30 space-y-3">
                    {/* Scenario summary */}
                    <div className="space-y-1">
                      {set.scenarios.map((s) => {
                        const rate = totalRate(s);
                        const cost = annualCost(s);
                        const isBest = s.id === bestScenario.id;
                        return (
                          <div
                            key={s.id}
                            className={`flex items-center justify-between text-xs py-1.5 px-2 rounded-lg ${
                              isBest ? "bg-green-500/10" : ""
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {isBest && <span className="text-green-400 text-xs">★</span>}
                              <span className="text-navy-200">{s.name}</span>
                              <span className="text-navy-500">{s.country}</span>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className={rate >= 25 ? "text-red-400" : rate >= 10 ? "text-cargo-300" : "text-green-400"}>
                                {rate.toFixed(1)}%
                              </span>
                              <span className="text-navy-300 font-medium">
                                ${cost.toLocaleString("en-US", { maximumFractionDigits: 0 })}/yr
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                      <button
                        onClick={() => handleLoad(set)}
                        className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-ocean-600/30 hover:bg-ocean-600/50 text-ocean-300 transition-colors"
                      >
                        <ArrowRight className="w-3 h-3" />
                        Load into Builder
                      </button>
                      <button
                        onClick={() => handleDuplicate(set.id)}
                        className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg glass glass-hover text-navy-300 transition-colors"
                      >
                        <Copy className="w-3 h-3" />
                        Duplicate
                      </button>
                      <button
                        onClick={() => handleExportJSON(set)}
                        className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg glass glass-hover text-navy-300 transition-colors"
                      >
                        <Download className="w-3 h-3" />
                        Export
                      </button>
                      <button
                        onClick={() => handleDelete(set.id)}
                        className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg glass hover:bg-red-500/20 text-navy-500 hover:text-red-400 transition-colors ml-auto"
                      >
                        <Trash2 className="w-3 h-3" />
                        Delete
                      </button>
                    </div>

                    {set.ftzParams && (
                      <div className="text-xs text-navy-500 flex items-center gap-2 pt-1">
                        <Plus className="w-3 h-3" />
                        Includes FTZ params: {set.ftzParams.lockedRate}% locked rate,{" "}
                        {set.ftzParams.totalMonths}mo withdrawal ({set.ftzParams.withdrawalPattern})
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {savedSets.length === 0 && !showPresets && (
        <div className="text-center py-6 text-sm text-navy-500">
          No saved scenarios yet. Save your current scenarios or load a policy preset to get started.
        </div>
      )}
    </div>
  );
}

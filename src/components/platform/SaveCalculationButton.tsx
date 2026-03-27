"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Save, X, Loader2, Check } from "lucide-react";
import type { CalculatorType, SavedCalculation } from "@/lib/types/calculations";

interface SaveCalculationButtonProps {
  calculatorType: CalculatorType;
  getInputs: () => Record<string, unknown>;
  getOutputs: () => Record<string, unknown>;
  defaultName?: string;
  onSaved?: (calculation: SavedCalculation) => void;
}

export default function SaveCalculationButton({
  calculatorType,
  getInputs,
  getOutputs,
  defaultName,
  onSaved,
}: SaveCalculationButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Generate a default name based on calculator type and date
  const generateDefaultName = useCallback(() => {
    if (defaultName) return defaultName;
    const date = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const labels: Record<CalculatorType, string> = {
      landed_cost: "Landed Cost",
      unit_economics: "Unit Economics",
      ftz_savings: "FTZ Savings",
      pf_npf_comparison: "PF vs NPF",
      container_utilization: "Container Util",
      tariff_scenario: "Tariff Scenario",
    };
    return `${labels[calculatorType]} - ${date}`;
  }, [calculatorType, defaultName]);

  const openModal = () => {
    setName(generateDefaultName());
    setIsOpen(true);
  };

  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.showModal();
      // Focus input after dialog opens
      setTimeout(() => inputRef.current?.select(), 50);
    } else {
      dialogRef.current?.close();
    }
  }, [isOpen]);

  // Clear toast after 3s
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);

    try {
      const inputs = getInputs();
      const outputs = getOutputs();

      const res = await fetch("/api/calculations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          calculatorType,
          name: name.trim(),
          inputs,
          outputs,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to save");
      }

      const data = await res.json();
      setToast({ type: "success", message: "Calculation saved" });
      setIsOpen(false);
      onSaved?.(data.calculation);
    } catch (err) {
      setToast({ type: "error", message: err instanceof Error ? err.message : "Failed to save" });
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !saving) {
      e.preventDefault();
      handleSave();
    }
    if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <>
      <button
        onClick={openModal}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-ocean-600 text-white hover:bg-ocean-700 transition-colors shadow-sm"
      >
        <Save className="w-4 h-4" />
        Save
      </button>

      {/* Modal */}
      <dialog
        ref={dialogRef}
        onClose={() => setIsOpen(false)}
        className="backdrop:bg-black/50 rounded-xl border border-navy-200 shadow-xl p-0 w-full max-w-md"
      >
        {isOpen && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-navy-900">Save Calculation</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-navy-400 hover:text-navy-600 rounded-lg hover:bg-navy-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-6">
              <label className="text-sm font-medium text-navy-600 block mb-1.5">
                Calculation Name
              </label>
              <input
                ref={inputRef}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter a name..."
                maxLength={255}
                className="w-full px-3 py-2 border border-navy-200 rounded-lg text-sm text-navy-900 placeholder-navy-400 focus:outline-none focus:ring-2 focus:ring-ocean-500/30 focus:border-ocean-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-sm font-medium text-navy-600 hover:text-navy-800 rounded-lg hover:bg-navy-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !name.trim()}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-ocean-600 hover:bg-ocean-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        )}
      </dialog>

      {/* Toast notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-sm font-medium transition-all ${
            toast.type === "success"
              ? "bg-emerald-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {toast.type === "success" ? (
            <Check className="w-4 h-4" />
          ) : (
            <X className="w-4 h-4" />
          )}
          {toast.message}
        </div>
      )}
    </>
  );
}

"use client";

import { useState } from "react";
import { ArrowUpRight, Trash2, Pencil, Check, X, Clock } from "lucide-react";
import type { SavedCalculation, CalculatorType } from "@/lib/types/calculations";
import {
  CALCULATOR_TYPE_LABELS,
  CALCULATOR_TYPE_COLORS,
} from "@/lib/types/calculations";

interface CalculationHistoryProps {
  calculations: SavedCalculation[];
  onLoad: (calculation: SavedCalculation) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, newName: string) => void;
  isLoading?: boolean;
}

function relativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

function SkeletonRow() {
  return (
    <tr className="border-b border-navy-100 animate-pulse">
      <td className="px-4 py-3"><div className="h-4 bg-navy-100 rounded w-40" /></td>
      <td className="px-4 py-3"><div className="h-5 bg-navy-100 rounded-full w-24" /></td>
      <td className="px-4 py-3"><div className="h-4 bg-navy-100 rounded w-16" /></td>
      <td className="px-4 py-3"><div className="h-4 bg-navy-100 rounded w-20" /></td>
    </tr>
  );
}

export default function CalculationHistory({
  calculations,
  onLoad,
  onDelete,
  onRename,
  isLoading,
}: CalculationHistoryProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const startEditing = (calc: SavedCalculation) => {
    setEditingId(calc.id);
    setEditName(calc.name);
  };

  const confirmEdit = () => {
    if (editingId && editName.trim()) {
      onRename(editingId, editName.trim());
    }
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    onDelete(id);
    setDeleteConfirmId(null);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-white border border-navy-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-navy-200 bg-navy-50">
              <th className="text-left px-4 py-3 text-xs text-navy-500 font-medium">Name</th>
              <th className="text-left px-4 py-3 text-xs text-navy-500 font-medium">Type</th>
              <th className="text-left px-4 py-3 text-xs text-navy-500 font-medium">Created</th>
              <th className="text-right px-4 py-3 text-xs text-navy-500 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // Empty state
  if (calculations.length === 0) {
    return (
      <div className="bg-white border border-navy-200 rounded-xl p-12 text-center">
        <div className="w-16 h-16 rounded-full bg-navy-100 flex items-center justify-center mx-auto mb-4">
          <Clock className="w-8 h-8 text-navy-400" />
        </div>
        <h3 className="text-lg font-semibold text-navy-900 mb-2">
          No saved calculations yet
        </h3>
        <p className="text-navy-500 text-sm max-w-md mx-auto">
          Use any calculator and click Save to store your results here.
        </p>
      </div>
    );
  }

  // Desktop table / Mobile cards
  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block bg-white border border-navy-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-navy-200 bg-navy-50">
              <th className="text-left px-4 py-3 text-xs text-navy-500 font-medium">Name</th>
              <th className="text-left px-4 py-3 text-xs text-navy-500 font-medium">Type</th>
              <th className="text-left px-4 py-3 text-xs text-navy-500 font-medium">Created</th>
              <th className="text-right px-4 py-3 text-xs text-navy-500 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {calculations.map((calc) => {
              const colors = CALCULATOR_TYPE_COLORS[calc.calculatorType as CalculatorType] ?? CALCULATOR_TYPE_COLORS.landed_cost;
              return (
                <tr key={calc.id} className="border-b border-navy-100 hover:bg-navy-50/50 transition-colors">
                  {/* Name */}
                  <td className="px-4 py-3">
                    {editingId === calc.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") confirmEdit();
                            if (e.key === "Escape") setEditingId(null);
                          }}
                          autoFocus
                          className="flex-1 px-2 py-1 border border-ocean-300 rounded text-sm text-navy-900 focus:outline-none focus:ring-1 focus:ring-ocean-500"
                        />
                        <button onClick={confirmEdit} className="text-emerald-600 hover:text-emerald-700">
                          <Check className="w-4 h-4" />
                        </button>
                        <button onClick={() => setEditingId(null)} className="text-navy-400 hover:text-navy-600">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <span
                        className="text-navy-900 font-medium cursor-pointer hover:text-ocean-600 transition-colors"
                        onDoubleClick={() => startEditing(calc)}
                        title="Double-click to rename"
                      >
                        {calc.name}
                      </span>
                    )}
                  </td>

                  {/* Type badge */}
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors.bg} ${colors.text} ${colors.border}`}>
                      {CALCULATOR_TYPE_LABELS[calc.calculatorType as CalculatorType] ?? calc.calculatorType}
                    </span>
                  </td>

                  {/* Created */}
                  <td className="px-4 py-3">
                    <span
                      className="text-navy-500 text-xs"
                      title={new Date(calc.createdAt).toLocaleString()}
                    >
                      {relativeTime(calc.createdAt)}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => startEditing(calc)}
                        className="p-1.5 text-navy-400 hover:text-navy-600 hover:bg-navy-100 rounded-lg transition-colors"
                        title="Rename"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onLoad(calc)}
                        className="p-1.5 text-ocean-600 hover:text-ocean-700 hover:bg-ocean-50 rounded-lg transition-colors"
                        title="Load"
                      >
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                      {deleteConfirmId === calc.id ? (
                        <div className="flex items-center gap-1 ml-1">
                          <span className="text-xs text-red-600">Delete?</span>
                          <button
                            onClick={() => handleDelete(calc.id)}
                            className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="p-1 text-navy-400 hover:text-navy-600 hover:bg-navy-100 rounded transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirmId(calc.id)}
                          className="p-1.5 text-navy-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {calculations.map((calc) => {
          const colors = CALCULATOR_TYPE_COLORS[calc.calculatorType as CalculatorType] ?? CALCULATOR_TYPE_COLORS.landed_cost;
          return (
            <div key={calc.id} className="bg-white border border-navy-200 rounded-xl p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="text-sm font-medium text-navy-900">{calc.name}</div>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border mt-1 ${colors.bg} ${colors.text} ${colors.border}`}>
                    {CALCULATOR_TYPE_LABELS[calc.calculatorType as CalculatorType] ?? calc.calculatorType}
                  </span>
                </div>
                <span className="text-xs text-navy-400">{relativeTime(calc.createdAt)}</span>
              </div>
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-navy-100">
                <button
                  onClick={() => onLoad(calc)}
                  className="flex-1 text-center text-xs font-medium text-ocean-600 py-1.5 rounded-lg hover:bg-ocean-50 transition-colors"
                >
                  Load
                </button>
                <button
                  onClick={() => startEditing(calc)}
                  className="flex-1 text-center text-xs font-medium text-navy-500 py-1.5 rounded-lg hover:bg-navy-50 transition-colors"
                >
                  Rename
                </button>
                <button
                  onClick={() => deleteConfirmId === calc.id ? handleDelete(calc.id) : setDeleteConfirmId(calc.id)}
                  className="flex-1 text-center text-xs font-medium text-red-500 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                >
                  {deleteConfirmId === calc.id ? "Confirm?" : "Delete"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

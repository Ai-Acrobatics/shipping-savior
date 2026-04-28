"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  X,
  Calculator,
  Compass,
  FileText,
  Layers,
  Download,
  PlayCircle,
} from "lucide-react";

// TODO: persist completion to org.onboarded_at — schema migration needed (depends on AI-8779)

const STORAGE_KEY = "ss_onboarded";
const PROGRESS_KEY = "ss_onboarding_progress";

type UseCase = "ftz" | "routes" | "contracts" | "multi";

interface OnboardingData {
  useCase: UseCase | null;
  annualTeu: string;
  primaryLanes: string;
  topCarriers: string[];
  csvChoice: "sample" | "fresh" | null;
}

const initialData: OnboardingData = {
  useCase: null,
  annualTeu: "",
  primaryLanes: "",
  topCarriers: [],
  csvChoice: null,
};

const useCaseOptions: { value: UseCase; label: string; description: string; icon: typeof Calculator }[] = [
  {
    value: "ftz",
    label: "FTZ analysis",
    description: "Run duty-deferral and weekly-entry math on your import volume.",
    icon: Layers,
  },
  {
    value: "routes",
    label: "Route comparison",
    description: "Compare carriers and lanes across transit, reliability, and rate.",
    icon: Compass,
  },
  {
    value: "contracts",
    label: "Contract intelligence",
    description: "Track contract rates against spot and surface negotiation opportunities.",
    icon: FileText,
  },
  {
    value: "multi",
    label: "All of the above",
    description: "We're a high-volume importer using the full platform.",
    icon: Calculator,
  },
];

const carrierOptions = [
  "Maersk",
  "MSC",
  "CMA CGM",
  "Hapag-Lloyd",
  "ONE",
  "COSCO",
  "Evergreen",
  "Yang Ming",
  "ZIM",
  "HMM",
];

export default function OnboardingWizard({ initialName }: { initialName?: string | null }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>(initialData);

  // Restore from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const done = window.localStorage.getItem(STORAGE_KEY);
    if (done === "true") {
      setOpen(false);
      return;
    }
    setOpen(true);
    const saved = window.localStorage.getItem(PROGRESS_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as { step?: number; data?: OnboardingData };
        if (parsed.step) setStep(parsed.step);
        if (parsed.data) setData({ ...initialData, ...parsed.data });
      } catch {
        // ignore parse errors
      }
    }
  }, []);

  // Persist progress on each change
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!open) return;
    window.localStorage.setItem(PROGRESS_KEY, JSON.stringify({ step, data }));
  }, [step, data, open]);

  function close(markDone: boolean) {
    if (typeof window !== "undefined") {
      if (markDone) {
        window.localStorage.setItem(STORAGE_KEY, "true");
        window.localStorage.removeItem(PROGRESS_KEY);
      }
    }
    setOpen(false);
  }

  function toggleCarrier(c: string) {
    setData((d) => ({
      ...d,
      topCarriers: d.topCarriers.includes(c)
        ? d.topCarriers.filter((x) => x !== c)
        : [...d.topCarriers, c],
    }));
  }

  if (!open) return null;

  const greeting = initialName ? `Welcome, ${initialName}.` : "Welcome to Shipping Savior.";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/60 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-navy-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-navy-900">{greeting}</h2>
            <p className="text-sm text-navy-500 mt-0.5">
              Step {step} of 4 &mdash; setting up your workspace
            </p>
          </div>
          <button
            type="button"
            onClick={() => close(false)}
            className="p-2 text-navy-400 hover:text-navy-700 hover:bg-navy-50 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-navy-100">
          <div
            className="h-full bg-gradient-to-r from-ocean-500 to-indigo-500 transition-all"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        {/* Body */}
        <div className="px-6 py-6 max-h-[60vh] overflow-y-auto">
          {step === 1 && (
            <div>
              <h3 className="text-base font-semibold text-navy-900 mb-1">
                What brought you here?
              </h3>
              <p className="text-sm text-navy-500 mb-4">
                We&rsquo;ll tailor the dashboard to your primary workflow. You can change this later.
              </p>
              <div className="space-y-2">
                {useCaseOptions.map((opt) => {
                  const Icon = opt.icon;
                  const selected = data.useCase === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setData((d) => ({ ...d, useCase: opt.value }))}
                      className={`w-full text-left flex items-start gap-3 p-4 rounded-xl border transition-all ${
                        selected
                          ? "border-ocean-500 bg-ocean-50 ring-2 ring-ocean-200"
                          : "border-navy-200 bg-white hover:border-ocean-300 hover:bg-navy-50"
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${selected ? "bg-ocean-100 text-ocean-700" : "bg-navy-100 text-navy-600"}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-navy-900">{opt.label}</div>
                        <div className="text-xs text-navy-500 mt-0.5">{opt.description}</div>
                      </div>
                      {selected && <Check className="w-4 h-4 text-ocean-600 mt-2" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h3 className="text-base font-semibold text-navy-900 mb-1">Tell us about your volume</h3>
              <p className="text-sm text-navy-500 mb-4">
                Rough numbers are fine. This helps us calibrate calculator defaults.
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1.5">
                    Annual TEU volume
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="e.g. 4500"
                    value={data.annualTeu}
                    onChange={(e) => setData((d) => ({ ...d, annualTeu: e.target.value }))}
                    className="w-full px-3 py-2 border border-navy-200 rounded-lg bg-white text-navy-900 placeholder:text-navy-400 focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1.5">
                    Primary lanes
                  </label>
                  <textarea
                    rows={3}
                    placeholder="One per line, e.g.&#10;CNSHA → USLAX&#10;VNHPH → USNYC"
                    value={data.primaryLanes}
                    onChange={(e) => setData((d) => ({ ...d, primaryLanes: e.target.value }))}
                    className="w-full px-3 py-2 border border-navy-200 rounded-lg bg-white text-navy-900 placeholder:text-navy-400 focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-2">
                    Top carriers (select all you use)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {carrierOptions.map((c) => {
                      const selected = data.topCarriers.includes(c);
                      return (
                        <button
                          key={c}
                          type="button"
                          onClick={() => toggleCarrier(c)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                            selected
                              ? "bg-ocean-600 border-ocean-600 text-white"
                              : "bg-white border-navy-200 text-navy-700 hover:border-ocean-300"
                          }`}
                        >
                          {c}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h3 className="text-base font-semibold text-navy-900 mb-1">Bring in some data</h3>
              <p className="text-sm text-navy-500 mb-4">
                Calculators get useful once we have shipments to score. You can do this now or skip ahead.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setData((d) => ({ ...d, csvChoice: "sample" }))}
                  className={`text-left p-4 rounded-xl border transition-all ${
                    data.csvChoice === "sample"
                      ? "border-ocean-500 bg-ocean-50 ring-2 ring-ocean-200"
                      : "border-navy-200 bg-white hover:border-ocean-300"
                  }`}
                >
                  <Download className="w-5 h-5 text-ocean-600 mb-2" />
                  <div className="font-medium text-navy-900">Try with sample CSV</div>
                  <div className="text-xs text-navy-500 mt-1">
                    50 mock shipments across 5 lanes &mdash; see the platform in action.
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setData((d) => ({ ...d, csvChoice: "fresh" }))}
                  className={`text-left p-4 rounded-xl border transition-all ${
                    data.csvChoice === "fresh"
                      ? "border-ocean-500 bg-ocean-50 ring-2 ring-ocean-200"
                      : "border-navy-200 bg-white hover:border-ocean-300"
                  }`}
                >
                  <FileText className="w-5 h-5 text-navy-600 mb-2" />
                  <div className="font-medium text-navy-900">Start fresh</div>
                  <div className="text-xs text-navy-500 mt-1">
                    Upload your own data later. We&rsquo;ll keep the dashboard quiet until you do.
                  </div>
                </button>
              </div>
              {data.csvChoice === "sample" && (
                <Link
                  href="/platform/shipments/import?sample=true"
                  className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-gradient-to-r from-ocean-600 to-indigo-500 text-white text-sm font-medium rounded-lg hover:from-ocean-700 hover:to-indigo-600 transition-all"
                >
                  Open import with sample
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          )}

          {step === 4 && (
            <div>
              <h3 className="text-base font-semibold text-navy-900 mb-1">Run your first calculator</h3>
              <p className="text-sm text-navy-500 mb-4">
                Pick a calculator that matches your use case &mdash; or browse them all.
              </p>
              <div className="space-y-3">
                <Link
                  href="/platform/calculators"
                  className="flex items-center justify-between p-4 rounded-xl border border-navy-200 bg-white hover:border-ocean-300 hover:bg-navy-50 transition-all group"
                  onClick={() => close(true)}
                >
                  <div className="flex items-center gap-3">
                    <PlayCircle className="w-5 h-5 text-ocean-600" />
                    <div>
                      <div className="font-medium text-navy-900">Open calculator hub</div>
                      <div className="text-xs text-navy-500 mt-0.5">
                        Landed Cost, FTZ Savings, PF/NPF, Container Util, Tariff Scenario.
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-navy-400 group-hover:text-ocean-600 group-hover:translate-x-0.5 transition-all" />
                </Link>
                <button
                  type="button"
                  onClick={() => close(true)}
                  className="w-full text-center text-sm text-navy-500 hover:text-navy-700 transition-colors py-2"
                >
                  I&rsquo;ll explore on my own &rarr;
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-navy-100 bg-navy-50 flex items-center justify-between">
          <button
            type="button"
            onClick={() => close(false)}
            className="text-sm text-navy-500 hover:text-navy-700 transition-colors"
          >
            Skip for now
          </button>
          <div className="flex items-center gap-2">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep((s) => Math.max(1, s - 1))}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-navy-700 hover:bg-navy-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            )}
            {step < 4 ? (
              <button
                type="button"
                onClick={() => setStep((s) => Math.min(4, s + 1))}
                disabled={step === 1 && !data.useCase}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium bg-gradient-to-r from-ocean-600 to-indigo-500 text-white rounded-lg hover:from-ocean-700 hover:to-indigo-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => close(true)}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium bg-gradient-to-r from-ocean-600 to-indigo-500 text-white rounded-lg hover:from-ocean-700 hover:to-indigo-600 transition-all"
              >
                Finish
                <Check className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

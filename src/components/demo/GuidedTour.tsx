"use client";

/**
 * GuidedTour — investor walkthrough overlay.
 *
 * Linear: AI-6542
 *
 * Activation:
 *   - URL param ?tour=true mounts the floating card.
 *   - Step persisted in sessionStorage ("ss-tour-step").
 *
 * Each step targets a `data-tour-step="N"` element somewhere in the platform UI
 * (see src/lib/data/demo-scenarios.ts → tourSteps). When the active step's target
 * exists in the DOM we draw a soft highlight ring around it.
 *
 * The card itself is a fixed bottom-right panel: title, body, Next/Previous,
 * "End Tour" link, and step counter ("Step 2 of 6").
 */

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { tourSteps } from "@/lib/data/demo-scenarios";
import { ArrowLeft, ArrowRight, X, Sparkles } from "lucide-react";

const STORAGE_KEY = "ss-tour-step";

export default function GuidedTour() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tourActive = searchParams?.get("tour") === "true";

  const [stepIndex, setStepIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);
  const rafRef = useRef<number | null>(null);

  // Hydrate step from sessionStorage so navigation between routes preserves position.
  useEffect(() => {
    setMounted(true);
    if (typeof window === "undefined") return;
    const stored = window.sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      const n = parseInt(stored, 10);
      if (!Number.isNaN(n) && n >= 0 && n < tourSteps.length) {
        setStepIndex(n);
      }
    }
  }, []);

  // Persist step.
  useEffect(() => {
    if (!mounted) return;
    if (typeof window === "undefined") return;
    window.sessionStorage.setItem(STORAGE_KEY, String(stepIndex));
  }, [stepIndex, mounted]);

  const currentStep = tourSteps[stepIndex];

  // Highlight the active step's target element. Recompute on resize/scroll.
  const recomputeHighlight = useCallback(() => {
    if (!currentStep) return;
    if (typeof document === "undefined") return;
    const target = document.querySelector(currentStep.targetSelector) as HTMLElement | null;
    if (!target) {
      setHighlightRect(null);
      return;
    }
    const rect = target.getBoundingClientRect();
    setHighlightRect(rect);
  }, [currentStep]);

  useEffect(() => {
    if (!tourActive || !mounted) return;
    recomputeHighlight();
    const handle = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(recomputeHighlight);
    };
    window.addEventListener("resize", handle);
    window.addEventListener("scroll", handle, true);
    // Re-poll a few times after mount in case the target hydrates late.
    const polls = [200, 500, 1200].map((d) => window.setTimeout(recomputeHighlight, d));
    return () => {
      window.removeEventListener("resize", handle);
      window.removeEventListener("scroll", handle, true);
      polls.forEach(clearTimeout);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [tourActive, mounted, recomputeHighlight, pathname]);

  const goTo = useCallback(
    (newIndex: number) => {
      if (newIndex < 0 || newIndex >= tourSteps.length) return;
      setStepIndex(newIndex);
      const next = tourSteps[newIndex];
      if (next?.href && next.href !== pathname) {
        // Preserve all current query params (incl. tour=true and scenario=).
        const params = new URLSearchParams(Array.from(searchParams?.entries() ?? []));
        if (!params.get("tour")) params.set("tour", "true");
        router.push(`${next.href}?${params.toString()}`);
      }
    },
    [router, pathname, searchParams]
  );

  const endTour = useCallback(() => {
    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem(STORAGE_KEY);
    }
    const params = new URLSearchParams(Array.from(searchParams?.entries() ?? []));
    params.delete("tour");
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname || "/");
  }, [router, pathname, searchParams]);

  if (!mounted || !tourActive || !currentStep) return null;

  const isFirst = stepIndex === 0;
  const isLast = stepIndex === tourSteps.length - 1;

  return (
    <>
      {/* Highlight ring on the current step target. */}
      {highlightRect && (
        <div
          aria-hidden
          className="pointer-events-none fixed z-[60] rounded-xl ring-2 ring-ocean-400/80 shadow-[0_0_0_6px_rgba(56,189,248,0.18),0_0_40px_rgba(56,189,248,0.35)] transition-all duration-300"
          style={{
            top: Math.max(highlightRect.top - 6, 0),
            left: Math.max(highlightRect.left - 6, 0),
            width: highlightRect.width + 12,
            height: highlightRect.height + 12,
          }}
        />
      )}

      {/* Floating walkthrough card. */}
      <div
        role="dialog"
        aria-label="Demo Walkthrough"
        className="fixed bottom-4 right-4 z-[70] w-[min(92vw,380px)] rounded-2xl border border-ocean-400/30 bg-[#0a0a1a]/95 text-white shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl"
      >
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-ocean-500 to-indigo-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-bold tracking-tight">Demo Walkthrough</span>
          </div>
          <button
            type="button"
            onClick={endTour}
            className="text-white/40 hover:text-white transition-colors"
            aria-label="End tour"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-4 pb-1 text-[11px] uppercase tracking-widest text-ocean-400/80 font-mono">
          Step {currentStep.step} of {tourSteps.length}
        </div>

        <div className="px-4 pb-4">
          <h3 className="text-base font-semibold leading-snug mb-1.5">
            {currentStep.title}
          </h3>
          <p className="text-sm text-white/65 leading-relaxed">
            {currentStep.body}
          </p>
        </div>

        {/* Progress dots */}
        <div className="px-4 pb-3 flex items-center gap-1.5">
          {tourSteps.map((_, i) => (
            <span
              key={i}
              className={`h-1 rounded-full transition-all duration-300 ${
                i === stepIndex
                  ? "w-6 bg-ocean-400"
                  : i < stepIndex
                  ? "w-3 bg-ocean-400/60"
                  : "w-3 bg-white/15"
              }`}
              aria-hidden
            />
          ))}
        </div>

        <div className="flex items-center justify-between gap-2 px-4 pb-4">
          <button
            type="button"
            onClick={endTour}
            className="text-xs text-white/40 hover:text-white/80 transition-colors"
          >
            End Tour
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => goTo(stepIndex - 1)}
              disabled={isFirst}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3.5 py-1.5 text-xs font-medium text-white/80 hover:border-white/30 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Previous
            </button>
            <button
              type="button"
              onClick={() => (isLast ? endTour() : goTo(stepIndex + 1))}
              className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-ocean-500 to-indigo-600 px-4 py-1.5 text-xs font-semibold text-white shadow-[0_4px_16px_rgba(56,189,248,0.35)] hover:brightness-110 transition-all"
            >
              {isLast ? "Finish" : "Next"}
              {!isLast && <ArrowRight className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

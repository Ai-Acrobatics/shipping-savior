"use client";

/**
 * UpgradePrompt (AI-8778)
 *
 * Modal banner shown when a metered API mutation returns HTTP 402
 * `{ error: "limit_exceeded", ... }`.
 *
 * Two ways to trigger:
 *   1. Mount `<UpgradePromptHost />` once in the platform shell. Anywhere
 *      in the tree, call `triggerUpgradePrompt({...})` after a `fetch`
 *      detects a 402.
 *   2. Use `<UpgradePrompt {...props} />` directly as a controlled banner.
 *
 * The host listens on a CustomEvent (window-scoped) so it works without a
 * context provider — keeps the integration footprint small for W7.
 */

import { useEffect, useState } from "react";
import { Sparkles, X } from "lucide-react";

export interface UpgradePromptProps {
  resource: string;          // 'calculations' | 'bolUploads' | 'contractUploads' | 'users'
  limit: number;             // -1 means unlimited (won't normally hit modal)
  used: number;
  currentPlan: string;       // 'free' | 'premium' | 'enterprise'
  onDismiss?: () => void;
}

const RESOURCE_LABELS: Record<string, string> = {
  calculations: "calculations",
  bolUploads: "BOL uploads",
  contractUploads: "contract uploads",
  users: "team members",
};

const NEXT_PLAN: Record<string, { name: string; pitch: string }> = {
  free: {
    name: "Premium",
    pitch: "unlimited calculations, 100 BOL uploads/mo, and 25 contract uploads/mo",
  },
  premium: {
    name: "Enterprise",
    pitch: "unlimited everything plus 20 team seats",
  },
  enterprise: {
    name: "Enterprise",
    pitch: "you've reached the cap — talk to us about a custom plan",
  },
};

const UPGRADE_EVENT = "shipping-savior:upgrade-prompt";

interface UpgradeEventDetail extends UpgradePromptProps {}

/**
 * Imperative trigger — call from anywhere in client code after a 402.
 */
export function triggerUpgradePrompt(detail: UpgradeEventDetail): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<UpgradeEventDetail>(UPGRADE_EVENT, { detail }));
}

/**
 * Helper that wraps `fetch` and auto-triggers the prompt on 402. Returns the
 * Response so callers can still consume it normally.
 */
export async function fetchWithUpgradePrompt(input: RequestInfo, init?: RequestInit): Promise<Response> {
  const res = await fetch(input, init);
  if (res.status === 402) {
    try {
      const body = await res.clone().json();
      if (body?.error === "limit_exceeded") {
        triggerUpgradePrompt({
          resource: body.resource,
          limit: body.limit,
          used: body.used,
          currentPlan: body.plan,
        });
      }
    } catch {
      // ignore — body wasn't the expected shape
    }
  }
  return res;
}

/**
 * Mount once at the top of the platform shell. Listens for the custom event.
 */
export function UpgradePromptHost() {
  const [active, setActive] = useState<UpgradePromptProps | null>(null);

  useEffect(() => {
    function handler(ev: Event) {
      const detail = (ev as CustomEvent<UpgradeEventDetail>).detail;
      setActive(detail);
    }
    window.addEventListener(UPGRADE_EVENT, handler);
    return () => window.removeEventListener(UPGRADE_EVENT, handler);
  }, []);

  if (!active) return null;
  return <UpgradePrompt {...active} onDismiss={() => setActive(null)} />;
}

/**
 * Controlled prompt — full-screen overlay with upgrade CTA.
 */
export default function UpgradePrompt({
  resource,
  limit,
  used,
  currentPlan,
  onDismiss,
}: UpgradePromptProps) {
  const label = RESOURCE_LABELS[resource] ?? resource;
  const next = NEXT_PLAN[currentPlan] ?? NEXT_PLAN.free;
  const limitDisplay = limit < 0 ? "∞" : limit;
  const planLabel = currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Plan limit reached"
      onClick={onDismiss}
    >
      <div
        className="relative w-full max-w-md rounded-2xl border border-navy-700 bg-[#0d1230] shadow-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="absolute top-3 right-3 p-1.5 rounded-lg text-navy-400 hover:bg-navy-800 hover:text-white transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500/15 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-amber-400/80 font-semibold">
              {planLabel} plan limit reached
            </p>
            <h3 className="text-lg font-bold text-white">
              You&apos;ve used {used} of {limitDisplay} monthly {label}
            </h3>
          </div>
        </div>

        <p className="text-sm text-navy-300 mb-5">
          Upgrade to <span className="font-semibold text-white">{next.name}</span> for {next.pitch}.
        </p>

        <div className="flex items-center gap-2">
          <a
            href="/pricing"
            className="flex-1 inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-ocean-500 hover:bg-ocean-400 text-white text-sm font-semibold transition-colors"
          >
            Upgrade now
          </a>
          {onDismiss && (
            <button
              type="button"
              onClick={onDismiss}
              className="px-4 py-2.5 rounded-lg text-sm font-medium text-navy-300 hover:bg-navy-800 transition-colors"
            >
              Not now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

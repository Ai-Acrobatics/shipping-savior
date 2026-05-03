"use client";

import { useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";

/**
 * Client island for the billing page (AI-8777).
 *
 * Two actions, both POST to API routes that return { url } for redirect:
 *   - Manage Subscription → /api/billing/portal
 *   - Upgrade to Premium  → /api/billing/checkout (with priceId)
 */

interface BillingActionsProps {
  /** True if the org already has a Stripe customer + active subscription. */
  hasActiveSubscription: boolean;
  /** Stripe price ID for the Premium plan, from STRIPE_PRICE_PREMIUM_MONTHLY. Empty string if not configured. */
  premiumPriceId: string;
}

export default function BillingActions({
  hasActiveSubscription,
  premiumPriceId,
}: BillingActionsProps) {
  const [loading, setLoading] = useState<"portal" | "upgrade" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function postToBilling(path: string, body?: Record<string, unknown>) {
    const res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
    if (!res.ok || !data.url) {
      throw new Error(data.error ?? `Request failed (${res.status})`);
    }
    window.location.assign(data.url);
  }

  async function openPortal() {
    setError(null);
    setLoading("portal");
    try {
      await postToBilling("/api/billing/portal");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Portal session failed");
      setLoading(null);
    }
  }

  async function startCheckout() {
    if (!premiumPriceId) {
      setError("Premium price ID is not configured. Set STRIPE_PRICE_PREMIUM_MONTHLY.");
      return;
    }
    setError(null);
    setLoading("upgrade");
    try {
      await postToBilling("/api/billing/checkout", { priceId: premiumPriceId });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Checkout failed");
      setLoading(null);
    }
  }

  return (
    <div className="space-y-3">
      {hasActiveSubscription ? (
        <button
          type="button"
          onClick={openPortal}
          disabled={loading !== null}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-ocean-500 to-indigo-500 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading === "portal" ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <ArrowRight className="w-4 h-4" />
          )}
          Manage Subscription
        </button>
      ) : (
        <button
          type="button"
          onClick={startCheckout}
          disabled={loading !== null || !premiumPriceId}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-ocean-500 to-indigo-500 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading === "upgrade" ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <ArrowRight className="w-4 h-4" />
          )}
          Upgrade to Premium
        </button>
      )}

      {error && (
        <p className="text-sm text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

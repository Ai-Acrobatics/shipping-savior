"use client";

import { useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";

/**
 * Client island for the billing page (AI-8777).
 *
 * Two actions, both POST to API routes that return { url } for redirect:
 *   - Manage Subscription → /api/billing/portal
 *   - Upgrade to Premium  → /api/billing/checkout (with priceId)
 *
 * AI-9859: never surface internal config (env var names, raw Stripe error
 * strings) to the customer. The server returns customer-safe copy for 5xx; we
 * pass that through and fall back to a generic message for everything else.
 */

interface BillingActionsProps {
  /** True if the org already has a Stripe customer + active subscription. */
  hasActiveSubscription: boolean;
  /** Stripe price ID for the Premium plan, from STRIPE_PRICE_PREMIUM_MONTHLY. Empty string if not configured. */
  premiumPriceId: string;
}

const ACTION_FALLBACK_MESSAGE =
  "Something went wrong. Please try again, or contact support if it keeps happening.";

/**
 * Pick customer-safe copy for a failed billing response. Trust server 5xx copy
 * (already customer-safe), pass through any other clean message, but never show
 * an internal string mentioning env vars / price IDs (AI-9859).
 */
function customerSafeError(status: number, serverError?: string): string {
  if (status >= 500 && serverError) return serverError;
  if (serverError && !/STRIPE_|price[_ ]?id|priceId|env/i.test(serverError)) {
    return serverError;
  }
  return ACTION_FALLBACK_MESSAGE;
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
      // Throw a customer-safe message — callers render it verbatim.
      throw new Error(customerSafeError(res.status, data.error));
    }
    window.location.assign(data.url);
  }

  async function openPortal() {
    setError(null);
    setLoading("portal");
    try {
      await postToBilling("/api/billing/portal");
    } catch (e) {
      setError(e instanceof Error ? e.message : ACTION_FALLBACK_MESSAGE);
      setLoading(null);
    }
  }

  async function startCheckout() {
    setError(null);
    setLoading("upgrade");
    try {
      // Send the slug as a fallback so the server can resolve the price from env
      // even when the page didn't receive a configured premiumPriceId. The server
      // returns a customer-safe 503 if billing isn't configured (AI-9859).
      await postToBilling("/api/billing/checkout", {
        priceId: premiumPriceId || "PREMIUM_MONTHLY",
        plan: "premium",
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : ACTION_FALLBACK_MESSAGE);
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
          disabled={loading !== null}
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

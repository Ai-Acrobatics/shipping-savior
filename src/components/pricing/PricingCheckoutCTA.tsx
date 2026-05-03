"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface PricingCheckoutCTAProps {
  /** Plan slug — used to look up the corresponding Stripe price on the server. */
  plan: "premium";
  /** Visible button label (e.g., "Start Free Trial"). */
  children: React.ReactNode;
  /** Tailwind class string from the parent card so the button matches the tier theme. */
  className?: string;
  /** Source ID for analytics. */
  source?: string;
}

/**
 * Pricing CTA that kicks off Stripe Checkout when the visitor is signed in,
 * and routes to /register?plan=<plan> otherwise (AI-8777).
 *
 * The intent (?plan=) survives the register flow so the post-register handler
 * can immediately start checkout once the user has a session + org.
 */
export default function PricingCheckoutCTA({
  plan,
  children,
  className,
  source,
}: PricingCheckoutCTAProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onClick() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId: planPriceIdLookup(plan) }),
      });

      // 401 = not signed in. Send through register with ?plan= preserved.
      if (res.status === 401) {
        router.push(`/register?plan=${plan}${source ? `&utm_source=${encodeURIComponent(source)}` : ""}`);
        return;
      }

      const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        // Surface any non-auth error inline. Common case: missing STRIPE_PRICE_PREMIUM_MONTHLY.
        throw new Error(data.error ?? `Checkout failed (${res.status})`);
      }
      window.location.assign(data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not start checkout");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={onClick}
        disabled={loading}
        className={className}
        data-source={source}
      >
        {loading ? (
          <span className="inline-flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Redirecting...
          </span>
        ) : (
          children
        )}
      </button>
      {error && (
        <p className="text-xs text-red-400 text-center" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * The actual Price ID is read from a server env var (STRIPE_PRICE_PREMIUM_MONTHLY).
 * From the browser we don't know that value, so we send a sentinel that the API
 * route already understands: the route reads from request body + env to pick the
 * right Stripe price. We pass the plan slug here as a stable contract.
 *
 * Note: the checkout API expects an actual Stripe priceId. Until we expose plan
 * slugs via a public env var, we let the API surface a clear error when the
 * STRIPE_PRICE_PREMIUM_MONTHLY env is unset; in production the Premium price ID
 * MUST be present in NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_MONTHLY for the browser
 * caller to send. Until that's wired we send the slug and let the server map it.
 */
function planPriceIdLookup(plan: "premium"): string {
  // Prefer NEXT_PUBLIC_* if exposed (recommended for production); fall back to
  // sending the slug so the server can map it via STRIPE_PRICE_PREMIUM_MONTHLY.
  if (plan === "premium") {
    return (
      process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_MONTHLY ?? "PREMIUM_MONTHLY"
    );
  }
  return "";
}

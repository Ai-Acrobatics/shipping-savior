/**
 * Server-side Stripe client (AI-8777).
 *
 * Use ONLY in server contexts (route handlers, server components, server actions).
 * Never import this from a client component — `STRIPE_SECRET_KEY` must not leak.
 */
import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  // Don't throw at import time during build — production runtime will surface the error,
  // and dev with no Stripe key set should still allow the app to boot for non-billing pages.
  // eslint-disable-next-line no-console
  console.warn(
    '[stripe/server] STRIPE_SECRET_KEY is not set — billing API routes will fail at runtime.'
  );
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? 'sk_test_placeholder', {
  // Pin to a stable API version so dashboard webhook deliveries match what this code expects.
  // Update intentionally when migrating to a newer version.
  apiVersion: '2026-04-22.dahlia',
  appInfo: {
    name: 'shipping-savior',
    version: '0.1.0',
  },
  // Server-side fetch — Next.js runtime handles HTTPS for us.
  typescript: true,
});

/**
 * Map a Stripe Price ID to our internal plan slug.
 * Returns null if the price ID isn't one of our known plans (e.g., a deprecated tier).
 */
export function planFromPriceId(priceId: string | null | undefined): 'premium' | 'enterprise' | null {
  if (!priceId) return null;
  if (priceId === process.env.STRIPE_PRICE_PREMIUM_MONTHLY) return 'premium';
  if (priceId === process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY) return 'enterprise';
  return null;
}

/**
 * Customer-safe error copy. Never leak env var names, Stripe internal error
 * strings, or "set STRIPE_PRICE_*" instructions to an end user — those are for
 * the team in server logs. A paying customer who hits a billing failure should
 * see a calm "we're on it, contact support" message (AI-9859).
 */
export const BILLING_UNAVAILABLE_MESSAGE =
  'Billing is temporarily unavailable. No charge was made — please try again shortly, or contact support if it keeps happening.';

export const CHECKOUT_FAILED_MESSAGE =
  "We couldn't start checkout. No charge was made — please try again, or contact support if the problem persists.";

export const PORTAL_FAILED_MESSAGE =
  "We couldn't open the billing portal. Please try again, or contact support if the problem persists.";

/**
 * True only when the Stripe secret key is configured for real (not the build-time
 * placeholder). When this is false, billing API routes must short-circuit with a
 * customer-safe 503 rather than calling Stripe and surfacing a raw error.
 */
export function isStripeConfigured(): boolean {
  const key = process.env.STRIPE_SECRET_KEY;
  return typeof key === 'string' && key.length > 0 && key !== 'sk_test_placeholder';
}

/**
 * Resolve a requested plan slug or price sentinel to a concrete Stripe price ID
 * from server env. Returns null when the matching env var is unset — callers
 * translate that into a customer-safe "billing unavailable" response, NOT a raw
 * "set STRIPE_PRICE_*" leak (AI-9859).
 *
 * Accepts: an actual Stripe price id (`price_...`), the slug sentinels
 * `PREMIUM_MONTHLY` / `ENTERPRISE_MONTHLY`, or a `plan` of `premium`/`enterprise`.
 */
export function resolvePriceId(input: {
  priceId?: string | null;
  plan?: string | null;
}): string | null {
  const raw = input.priceId?.trim();

  // A real Stripe price id passed straight through.
  if (raw && raw.startsWith('price_')) return raw;

  const wantsEnterprise = raw === 'ENTERPRISE_MONTHLY' || input.plan === 'enterprise';
  const wantsPremium = !raw || raw === 'PREMIUM_MONTHLY' || input.plan === 'premium';

  if (wantsEnterprise) return process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY ?? null;
  if (wantsPremium) return process.env.STRIPE_PRICE_PREMIUM_MONTHLY ?? null;
  return null;
}

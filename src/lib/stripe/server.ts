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
  apiVersion: '2025-09-30.clover',
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

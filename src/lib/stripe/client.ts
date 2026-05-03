/**
 * Browser-side Stripe.js loader (AI-8777).
 *
 * Use in client components only. Reads NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY which is
 * intentionally exposed to the browser. This file does NOT make API calls itself —
 * checkout flow uses the API route's returned URL via window.location.assign.
 *
 * Kept for completeness so a future inline-form Elements integration can wire in
 * without scaffolding.
 */
import { loadStripe, type Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null> | null = null;

export function getStripe(): Promise<Stripe | null> {
  if (!stripePromise) {
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!key) {
      // eslint-disable-next-line no-console
      console.warn(
        '[stripe/client] NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set — Stripe.js will not load.'
      );
      stripePromise = Promise.resolve(null);
    } else {
      stripePromise = loadStripe(key);
    }
  }
  return stripePromise;
}

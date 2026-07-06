/**
 * Billing placeholder mode (pre-Stripe launch).
 *
 * Until real Stripe products/keys are configured, the platform runs "open":
 * usage limits are not enforced and the checkout/portal routes return a
 * friendly 503 instead of crashing on a bad key. This lets the whole app be
 * tested end-to-end with placeholder Stripe env vars.
 *
 * Explicit override: set BILLING_PLACEHOLDER=false to force real enforcement
 * even with a placeholder-looking key (or =true to force open mode with real
 * keys, e.g. on a preview deploy).
 */
export function isBillingPlaceholder(): boolean {
  const flag = process.env.BILLING_PLACEHOLDER;
  if (flag === 'true') return true;
  if (flag === 'false') return false;
  const key = process.env.STRIPE_SECRET_KEY ?? '';
  return !key || key.includes('placeholder');
}

export const BILLING_PLACEHOLDER_MESSAGE =
  'Billing is in placeholder mode — Stripe is not configured yet. All platform features are open for testing; no payment is required.';

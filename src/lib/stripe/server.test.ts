/**
 * Unit tests for the Stripe config + price-resolution helpers (AI-9859).
 *
 * These guard the customer-facing failure mode behind issue AI-9859 ("paid for
 * it and got this error"): when Stripe env is missing we must detect it cleanly
 * so routes can return a customer-safe 503 instead of leaking "set
 * STRIPE_PRICE_*" to the end user.
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { isStripeConfigured, resolvePriceId } from './server';

const ENV_KEYS = [
  'STRIPE_SECRET_KEY',
  'STRIPE_PRICE_PREMIUM_MONTHLY',
  'STRIPE_PRICE_ENTERPRISE_MONTHLY',
] as const;

describe('isStripeConfigured', () => {
  const saved: Record<string, string | undefined> = {};

  beforeEach(() => {
    for (const k of ENV_KEYS) saved[k] = process.env[k];
  });
  afterEach(() => {
    for (const k of ENV_KEYS) {
      if (saved[k] === undefined) delete process.env[k];
      else process.env[k] = saved[k];
    }
  });

  it('is false when the key is unset', () => {
    delete process.env.STRIPE_SECRET_KEY;
    expect(isStripeConfigured()).toBe(false);
  });

  it('is false for the build-time placeholder', () => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_placeholder';
    expect(isStripeConfigured()).toBe(false);
  });

  it('is false for an empty string', () => {
    process.env.STRIPE_SECRET_KEY = '';
    expect(isStripeConfigured()).toBe(false);
  });

  it('is true for a real secret key', () => {
    process.env.STRIPE_SECRET_KEY = 'sk_live_realkey123';
    expect(isStripeConfigured()).toBe(true);
  });
});

describe('resolvePriceId', () => {
  const saved: Record<string, string | undefined> = {};

  beforeEach(() => {
    for (const k of ENV_KEYS) saved[k] = process.env[k];
    process.env.STRIPE_PRICE_PREMIUM_MONTHLY = 'price_premium_env';
    process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY = 'price_enterprise_env';
  });
  afterEach(() => {
    for (const k of ENV_KEYS) {
      if (saved[k] === undefined) delete process.env[k];
      else process.env[k] = saved[k];
    }
  });

  it('passes a literal Stripe price id straight through', () => {
    expect(resolvePriceId({ priceId: 'price_abc123' })).toBe('price_abc123');
  });

  it('maps the premium slug sentinel to the env price', () => {
    expect(resolvePriceId({ priceId: 'PREMIUM_MONTHLY' })).toBe('price_premium_env');
  });

  it('maps plan=premium to the env price', () => {
    expect(resolvePriceId({ plan: 'premium' })).toBe('price_premium_env');
  });

  it('maps the enterprise slug sentinel to the env price', () => {
    expect(resolvePriceId({ priceId: 'ENTERPRISE_MONTHLY' })).toBe('price_enterprise_env');
  });

  it('maps plan=enterprise to the env price', () => {
    expect(resolvePriceId({ plan: 'enterprise' })).toBe('price_enterprise_env');
  });

  it('defaults an empty request to premium', () => {
    expect(resolvePriceId({})).toBe('price_premium_env');
  });

  it('returns null when the premium env price is unset (no env leak)', () => {
    delete process.env.STRIPE_PRICE_PREMIUM_MONTHLY;
    expect(resolvePriceId({ plan: 'premium' })).toBeNull();
  });

  it('returns null when the enterprise env price is unset', () => {
    delete process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY;
    expect(resolvePriceId({ plan: 'enterprise' })).toBeNull();
  });
});

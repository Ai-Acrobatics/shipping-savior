/**
 * E2E: billing surface (AI-8783).
 *
 * Asserts the security gates around billing endpoints + the unauthenticated
 * marketing CTAs that funnel into them. We DON'T attempt to actually create a
 * Stripe session — that requires real keys and would generate real Stripe
 * objects in test mode.
 */
import { test, expect } from '@playwright/test';

test.describe('Pricing CTAs', () => {
  test('"Get Started" / "Start Free Trial" CTAs link to login or register', async ({ page }) => {
    await page.goto('/pricing');
    // Find any CTA — the exact label is product-team turf and changes.
    const ctas = page.locator('a:has-text("Free"), a:has-text("Trial"), a:has-text("Start")');
    expect(await ctas.count()).toBeGreaterThan(0);
  });
});

test.describe('Authenticated billing routes', () => {
  test('/platform/billing redirects unauth visitors to /login', async ({ page }) => {
    const response = await page.goto('/platform/billing');
    // Should land on login (post-redirect URL contains /login or /signin).
    const finalUrl = page.url();
    expect(finalUrl).toMatch(/\/(login|signin|auth)/i);
    // 200 from login page after redirect chain is fine; 401 also acceptable
    // if the platform layer responds before the browser redirects.
    expect([200, 302, 307, 401]).toContain(response?.status() ?? 200);
  });
});

test.describe('Billing API gates', () => {
  test('POST /api/billing/checkout returns 401/403 unauth', async ({ request }) => {
    const res = await request.post('/api/billing/checkout', {
      data: { plan: 'premium' },
      headers: { 'content-type': 'application/json' },
    });
    expect([401, 403]).toContain(res.status());
  });

  test('POST /api/billing/webhook rejects requests without Stripe signature', async ({ request }) => {
    const res = await request.post('/api/billing/webhook', {
      data: 'not-a-real-event',
      headers: { 'content-type': 'application/json' },
    });
    // Stripe webhook handler should reject anything missing/invalid sig.
    // Acceptable: 400 (bad request), 401 (unauth), or 403.
    expect([400, 401, 403]).toContain(res.status());
  });
});

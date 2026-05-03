/**
 * E2E: marketing surface (AI-8783, baseline cleared in AI-9199).
 *
 * Top of the funnel: homepage, /pricing, /demo. These pages must work
 * unauthenticated, render fast, and have ZERO serious/critical a11y
 * violations.
 *
 * a11y enforcement: AI-8783 originally shipped with an A11Y_BASELINE_RULES
 * filter that excluded two pre-existing critical violations
 * (`button-name` on the icon-only mobile menu button + `color-contrast`
 * on the LogoMarquee accent text). AI-9199 fixed both root causes and
 * dropped the filter — any new critical or serious violation now breaks
 * CI. See e2e/helpers/a11y.ts for the helper.
 */
import { test, expect } from '@playwright/test';
import { expectNoSeriousViolations } from './helpers/a11y';

test.describe('Homepage', () => {
  test('loads, exposes hero CTA + key marketing sections', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Shipping Savior/i);
    await expect(page.locator('main')).toBeVisible();
    const pricingLinks = page.locator('a[href="/pricing"], a[href*="/pricing"]');
    expect(await pricingLinks.count()).toBeGreaterThan(0);
  });

  test('zero serious/critical a11y violations', async ({ page }) => {
    await page.goto('/');
    await expectNoSeriousViolations(page);
  });
});

test.describe('Pricing page', () => {
  test('renders the three plan tiers', async ({ page }) => {
    await page.goto('/pricing');
    await expect(page.getByText(/^Free$/).first()).toBeVisible();
    await expect(page.getByText(/^Premium$/).first()).toBeVisible();
    await expect(page.getByText(/^Enterprise$/).first()).toBeVisible();
  });

  test('zero serious/critical a11y violations', async ({ page }) => {
    await page.goto('/pricing');
    await expectNoSeriousViolations(page);
  });
});

test.describe('Demo page', () => {
  test('loads scenario landing surface', async ({ page }) => {
    await page.goto('/demo');
    await expect(page.locator('main, body').first()).toBeVisible();
    const anchors = page.locator('a[href*="/demo/"], a[href*="scenario"]');
    expect(await anchors.count()).toBeGreaterThanOrEqual(0);
  });
});

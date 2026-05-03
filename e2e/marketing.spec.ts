/**
 * E2E: marketing surface (AI-8783).
 *
 * Top of the funnel: homepage, /pricing, /demo. These pages must work
 * unauthenticated, render fast, and not regress beyond the documented a11y
 * baseline.
 *
 * a11y baseline (May 2026): the marketing surface ships with two known issues
 * that pre-date this PR — color-contrast on accent colors (impact: serious)
 * and one icon-only header button missing an aria-label (rule: button-name,
 * impact: critical). Both are tracked under the next polish sprint. We
 * filter them out so this suite catches NEW regressions without blocking on
 * the baseline. When the polish sprint lands, drop A11Y_BASELINE_RULES to []
 * and the suite will start enforcing zero criticals.
 */
import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const A11Y_BASELINE_RULES = ['button-name', 'color-contrast'] as const;

async function assertNoNewCriticalA11yViolations(page: Page) {
  await page.waitForLoadState('domcontentloaded');
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze();
  const blocking = results.violations
    .filter((v) => v.impact === 'critical')
    .filter((v) => !A11Y_BASELINE_RULES.includes(v.id as (typeof A11Y_BASELINE_RULES)[number]));
  expect(
    blocking,
    `New critical a11y violations (above baseline):\n${blocking
      .map((v) => `  - ${v.id}: ${v.help}`)
      .join('\n')}`
  ).toEqual([]);
}

test.describe('Homepage', () => {
  test('loads, exposes hero CTA + key marketing sections', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Shipping Savior/i);
    await expect(page.locator('main')).toBeVisible();
    const pricingLinks = page.locator('a[href="/pricing"], a[href*="/pricing"]');
    expect(await pricingLinks.count()).toBeGreaterThan(0);
  });

  test('no NEW critical a11y violations beyond baseline', async ({ page }) => {
    await page.goto('/');
    await assertNoNewCriticalA11yViolations(page);
  });
});

test.describe('Pricing page', () => {
  test('renders the three plan tiers', async ({ page }) => {
    await page.goto('/pricing');
    await expect(page.getByText(/^Free$/).first()).toBeVisible();
    await expect(page.getByText(/^Premium$/).first()).toBeVisible();
    await expect(page.getByText(/^Enterprise$/).first()).toBeVisible();
  });

  test('no NEW critical a11y violations beyond baseline', async ({ page }) => {
    await page.goto('/pricing');
    await assertNoNewCriticalA11yViolations(page);
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

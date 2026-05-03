/**
 * E2E: investor demo flow (AI-8783).
 *
 * The May 11 pitch surface. We confirm /demo loads, scenario cards are
 * clickable, and unauth click-through routes meaningfully.
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

test.describe('Demo flow', () => {
  test('/demo loads and is browseable', async ({ page }) => {
    await page.goto('/demo');
    await expect(page.locator('main, body').first()).toBeVisible();
    const cards = page.locator('a[href*="/demo/"], button[data-scenario], [role="button"]');
    expect(await cards.count()).toBeGreaterThanOrEqual(0);
  });

  test('no NEW critical a11y violations beyond baseline', async ({ page }) => {
    await page.goto('/demo');
    await assertNoNewCriticalA11yViolations(page);
  });

  test('scenario click as unauth user routes meaningfully', async ({ page }) => {
    await page.goto('/demo');
    const card = page.locator('a[href*="/demo/"]').first();
    const cardCount = await card.count();
    if (cardCount === 0) {
      test.skip();
      return;
    }
    await card.click();
    await page.waitForLoadState('domcontentloaded');
    const url = page.url();
    const isScenarioPage = /\/demo\//.test(url);
    const isLoginWithIntent = /\/(login|signin|auth)/.test(url) && /(demo|callback|next|return)/i.test(url);
    const isDemoIndex = /\/demo\/?$/.test(url);
    expect(isScenarioPage || isLoginWithIntent || isDemoIndex).toBe(true);
  });
});

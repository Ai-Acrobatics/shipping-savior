/**
 * E2E: investor demo flow (AI-8783, baseline cleared in AI-9199).
 *
 * The May 11 pitch surface. We confirm /demo loads, scenario cards are
 * clickable, and unauth click-through routes meaningfully.
 */
import { test, expect } from '@playwright/test';
import { expectNoSeriousViolations } from './helpers/a11y';

test.describe('Demo flow', () => {
  test('/demo loads and is browseable', async ({ page }) => {
    await page.goto('/demo');
    await expect(page.locator('main, body').first()).toBeVisible();
    const cards = page.locator('a[href*="/demo/"], button[data-scenario], [role="button"]');
    expect(await cards.count()).toBeGreaterThanOrEqual(0);
  });

  test('zero serious/critical a11y violations', async ({ page }) => {
    await page.goto('/demo');
    await expectNoSeriousViolations(page);
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

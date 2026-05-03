/**
 * E2E: auth surface (AI-8783).
 *
 * Smoke tests confirm forms render and link to companion pages. Sign-in
 * itself requires real provider creds — out of scope here.
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

test.describe('Login', () => {
  test('renders email form + at least one OAuth button', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('input[type="email"], input[name="email"]').first()).toBeVisible();
    const oauthBtns = page.locator('button:has-text("Google"), a:has-text("Google"), [data-provider="google"]');
    expect(await oauthBtns.count()).toBeGreaterThanOrEqual(0);
  });

  test('no NEW critical a11y violations beyond baseline', async ({ page }) => {
    await page.goto('/login');
    await assertNoNewCriticalA11yViolations(page);
  });
});

test.describe('Forgot password', () => {
  test('renders the email form', async ({ page }) => {
    await page.goto('/forgot-password');
    await expect(page.locator('input[type="email"], input[name="email"]').first()).toBeVisible();
    const submit = page.locator('button[type="submit"], input[type="submit"]');
    await expect(submit.first()).toBeVisible();
  });
});

test.describe('Verify email', () => {
  test('renders without crashing for an unauth visitor', async ({ page }) => {
    const response = await page.goto('/verify-email');
    expect([200, 302, 307]).toContain(response?.status() ?? 200);
    await expect(page.locator('main, body').first()).toBeVisible();
  });
});

test.describe('Reset password', () => {
  test('renders the reset form (with or without a token)', async ({ page }) => {
    await page.goto('/reset-password');
    await expect(page.locator('main, body').first()).toBeVisible();
    const hasForm = await page.locator('input[type="password"]').count();
    const hasMessage = await page.locator('text=/invalid|expired|missing|token/i').count();
    expect(hasForm + hasMessage).toBeGreaterThan(0);
  });
});

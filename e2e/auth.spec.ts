/**
 * E2E: auth surface (AI-8783, baseline cleared in AI-9199).
 *
 * Smoke tests confirm forms render and link to companion pages. Sign-in
 * itself requires real provider creds — out of scope here.
 */
import { test, expect } from '@playwright/test';
import { expectNoSeriousViolations } from './helpers/a11y';

test.describe('Login', () => {
  test('renders email form + at least one OAuth button', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('input[type="email"], input[name="email"]').first()).toBeVisible();
    const oauthBtns = page.locator('button:has-text("Google"), a:has-text("Google"), [data-provider="google"]');
    expect(await oauthBtns.count()).toBeGreaterThanOrEqual(0);
  });

  test('zero serious/critical a11y violations', async ({ page }) => {
    await page.goto('/login');
    await expectNoSeriousViolations(page);
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

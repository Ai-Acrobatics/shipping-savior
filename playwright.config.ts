import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright config for Shipping Savior (AI-8783).
 *
 * - baseURL is configurable via PLAYWRIGHT_BASE_URL so the same suite can run
 *   against local dev (default), a Vercel preview, or production.
 * - 2 projects (chromium + mobile-chrome) cover desktop + mobile viewports.
 * - retries: 1 in CI, 0 locally — tests should be deterministic but real
 *   third-party services (NextAuth providers, Stripe) can wobble.
 * - Screenshots only on failure, no trace by default to keep CI artifacts small.
 */
export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [['list'], ['github']] : 'list',
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
    actionTimeout: 10_000,
    navigationTimeout: 15_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
});

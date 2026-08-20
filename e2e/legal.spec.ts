/**
 * E2E: trust & compliance surface (AI-8780).
 *
 * Procurement reviews fail on missing or unreachable policy documents, so this
 * spec asserts the thing that actually breaks: each of the five legal pages
 * renders unauthenticated, and every one of them is reachable from the
 * homepage footer. It also pins the cookie banner appearing before any consent
 * exists — the ePrivacy requirement that analytics stay gated by default.
 */
import { test, expect } from '@playwright/test';
import { expectNoSeriousViolations } from './helpers/a11y';

const LEGAL_PAGES = [
  { path: '/privacy', heading: /Privacy Policy/i },
  { path: '/terms', heading: /Terms of Service/i },
  { path: '/dpa', heading: /Data Processing Agreement/i },
  { path: '/sub-processors', heading: /Sub-processors/i },
  { path: '/security', heading: /Security/i },
];

test.describe('Legal pages', () => {
  for (const { path, heading } of LEGAL_PAGES) {
    test(`${path} renders unauthenticated with an h1`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
      await expect(page.locator('h1')).toHaveText(heading);
      await expect(page.locator('main')).toBeVisible();
    });
  }

  test('every legal page is reachable from the homepage footer', async ({ page }) => {
    await page.goto('/');
    const footer = page.locator('footer');
    for (const { path } of LEGAL_PAGES) {
      await expect(
        footer.locator(`a[href="${path}"]`).first(),
        `footer should link to ${path}`
      ).toHaveCount(1);
    }
  });

  test('/sub-processors lists the vendors that process customer data', async ({ page }) => {
    await page.goto('/sub-processors');
    // A register with no rows is worse than no page — it implies zero vendors.
    const rows = page.locator('table tbody tr');
    expect(await rows.count()).toBeGreaterThan(5);
    await expect(page.getByRole('cell', { name: 'Stripe' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Anthropic' })).toBeVisible();
  });

  test('/security states what we do NOT have, not just what we do', async ({ page }) => {
    await page.goto('/security');
    await expect(page.getByRole('heading', { name: /Not yet in place/i })).toBeVisible();
    await expect(page.getByText(/SOC 2 Type II/i)).toBeVisible();
  });

  // All five, not just the two new pages: legal documents are exactly the
  // content a screen-reader user has the strongest interest in reading, and
  // the whole family shares one link/typography treatment — so a regression in
  // that treatment should fail here rather than only on the newest page.
  for (const { path } of LEGAL_PAGES) {
    test(`${path} has zero serious/critical a11y violations`, async ({ page }) => {
      await page.goto(path);
      await expectNoSeriousViolations(page);
    });
  }
});

test.describe('Cookie consent', () => {
  test('banner appears for a visitor with no stored consent', async ({ page }) => {
    await page.goto('/');
    const banner = page.getByRole('dialog', { name: /cookie consent/i });
    await expect(banner).toBeVisible();
    await expect(banner.getByRole('button', { name: /essential only/i })).toBeVisible();
    await expect(banner.getByRole('button', { name: /accept all/i })).toBeVisible();
  });

  test('choosing a consent option dismisses the banner and persists the cookie', async ({
    page,
    context,
  }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /essential only/i }).click();
    await expect(page.getByRole('dialog', { name: /cookie consent/i })).toBeHidden();

    // The server-set cookie is the durable, auditable record — localStorage
    // alone was not demonstrable to a regulator.
    // The banner dismisses optimistically and POSTs in the background, so the
    // cookie lands slightly after the click — and a cold route compile in CI
    // can outrun the default 5s poll window.
    await expect
      .poll(
        async () =>
          (await context.cookies()).find((c) => c.name === 'cookie_consent')?.value,
        { timeout: 20_000 }
      )
      .toBe('essential');

    // And it stays dismissed on the next navigation.
    await page.goto('/pricing');
    await expect(page.getByRole('dialog', { name: /cookie consent/i })).toBeHidden();
  });
});

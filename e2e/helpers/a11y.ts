/**
 * a11y helpers (AI-9199).
 *
 * Single canonical wrapper around axe-core/playwright. Use
 * `expectNoSeriousViolations(page)` from any spec — it asserts that the
 * page has zero `serious` and zero `critical` WCAG 2 A/AA violations and
 * prints a readable per-violation diff if it fails.
 *
 * History: AI-8783 shipped the suite with an `A11Y_BASELINE_RULES` filter
 * that excluded two pre-existing violations (`button-name` on the icon-only
 * mobile menu button + `color-contrast` on the LogoMarquee accent text).
 * AI-9199 fixed those root causes and dropped the filter so any new
 * critical/serious violation breaks CI.
 */
import { expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const BLOCKING_IMPACTS = ['serious', 'critical'] as const;
type BlockingImpact = (typeof BLOCKING_IMPACTS)[number];

function isBlocking(impact: string | null | undefined): impact is BlockingImpact {
  return !!impact && (BLOCKING_IMPACTS as readonly string[]).includes(impact);
}

/**
 * Run axe-core against the current page and assert there are zero
 * `serious` or `critical` WCAG 2 A/AA violations. On failure, the
 * assertion message lists each blocking violation with rule id, impact,
 * help text, help URL, and the first three target selectors so the
 * failure output is actionable without re-running the test locally.
 */
export async function expectNoSeriousViolations(page: Page): Promise<void> {
  // Wait for the network + initial animations to settle so axe reads the
  // final computed styles, not framer-motion's `initial={{ opacity: 0 }}`
  // intermediate state. Without this, axe sees `opacity: 0` elements as
  // transparent and reports false-positive contrast failures against the
  // page root background.
  await page.waitForLoadState('networkidle');
  // Disable CSS animations + transitions so axe samples a stable frame.
  // Animated gradients + framer-motion entrance produce intermittent
  // false-positive contrast failures because axe captures one rendered
  // frame and resolves backgrounds against whatever pixels are visible
  // at that instant.
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        transition-duration: 0s !important;
        transition-delay: 0s !important;
      }
    `,
  });
  await page.waitForTimeout(500);
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze();

  const blocking = results.violations.filter((v) => isBlocking(v.impact));

  const diff = blocking
    .map((v) => {
      const targets = v.nodes
        .slice(0, 3)
        .map((n) => `      target: ${n.target.join(', ')}`)
        .join('\n');
      return [
        `  - ${v.id} [${v.impact}] — ${v.help}`,
        `      help: ${v.helpUrl}`,
        targets,
      ].join('\n');
    })
    .join('\n');

  expect(
    blocking,
    blocking.length === 0
      ? 'No serious/critical a11y violations'
      : `Found ${blocking.length} serious/critical a11y violation(s):\n${diff}`
  ).toEqual([]);
}

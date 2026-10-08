/**
 * AI-12010: Pure ETA-change threshold logic (no DB), shared by the alert
 * service and its tests.
 */

/** Minimum ETA change (in hours) that triggers an alert. */
export const MIN_DELAY_HOURS = 1;

/**
 * The signed delay in whole hours between the known ETA and a new one
 * (positive = later, negative = earlier), or null when the change is below
 * the alert threshold.
 */
export function etaDelayHours(knownEta: Date, newEta: Date): number | null {
  const diffHours = Math.round((newEta.getTime() - knownEta.getTime()) / 3_600_000);
  return Math.abs(diffHours) < MIN_DELAY_HOURS ? null : diffHours;
}

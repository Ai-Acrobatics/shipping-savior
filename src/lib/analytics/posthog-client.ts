/**
 * Browser-side PostHog wrapper.
 *
 * - No-op when NEXT_PUBLIC_POSTHOG_KEY is unset (so dev / non-analytics envs stay quiet).
 * - Cookie-consent-gated: PostHog is NOT initialized until the user accepts
 *   `localStorage.ss_cookie_consent === 'all'`. The compliance worker (W6) wires the
 *   banner that sets this key.
 *
 * Public API:
 *   - `initPostHogIfConsented()` — call once when consent is granted (or on page load if already granted)
 *   - `trackEvent(name, props?)` — fire an event (no-op if not initialized)
 *   - `identifyUser(distinctId, props?)` — alias the current session to a user id
 *   - `resetIdentity()` — call on logout
 */

import type { PostHog } from "posthog-js";

type EventName =
  | "signup_completed"
  | "demo_booked"
  | "calculator_used"
  | "csv_imported"
  | "subscription_created"
  // catch-all for ad-hoc events without growing the union too aggressively
  | (string & {});

let phInstance: PostHog | null = null;
let initInFlight: Promise<PostHog | null> | null = null;

function hasConsent(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem("ss_cookie_consent") === "all";
  } catch {
    return false;
  }
}

function getKey(): string | null {
  return process.env.NEXT_PUBLIC_POSTHOG_KEY || null;
}

function getHost(): string {
  return process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";
}

/**
 * Initialize PostHog only if (a) the key is set AND (b) cookie consent is granted.
 * Safe to call multiple times — returns the same instance.
 */
export async function initPostHogIfConsented(): Promise<PostHog | null> {
  if (typeof window === "undefined") return null;
  if (phInstance) return phInstance;
  if (!getKey()) return null;
  if (!hasConsent()) return null;
  if (initInFlight) return initInFlight;

  initInFlight = (async () => {
    const mod = await import("posthog-js");
    const ph = mod.default;
    ph.init(getKey() as string, {
      api_host: getHost(),
      // Respect Do Not Track + we already gate on explicit consent
      respect_dnt: true,
      capture_pageview: true,
      persistence: "localStorage+cookie",
      autocapture: false,
    });
    phInstance = ph;
    return ph;
  })();

  return initInFlight;
}

/**
 * Track a product event. No-op unless PostHog is initialized (key set + consent).
 */
export function trackEvent(name: EventName, props?: Record<string, unknown>): void {
  if (!phInstance) {
    // Try a passive init — if consent + key are both there, this will boot it
    // for the next call. We don't await so the current call stays sync.
    void initPostHogIfConsented();
    return;
  }
  try {
    phInstance.capture(name, props);
  } catch {
    // never throw from analytics
  }
}

export function identifyUser(distinctId: string, props?: Record<string, unknown>): void {
  if (!phInstance) return;
  try {
    phInstance.identify(distinctId, props);
  } catch {
    // swallow
  }
}

export function resetIdentity(): void {
  if (!phInstance) return;
  try {
    phInstance.reset();
  } catch {
    // swallow
  }
}

/**
 * Shared cookie-consent constants (AI-8780).
 *
 * Imported by both the client banner and the server route, so the cookie name,
 * storage key, and policy version can never drift apart.
 */

/** Server-readable consent cookie. Named per the AI-8780 spec. */
export const CONSENT_COOKIE = 'cookie_consent';

/** Opaque per-browser id so an anonymous consent can be produced on request. */
export const VISITOR_COOKIE = 'ss_visitor_id';

/** Client-side mirror of the choice — drives banner visibility without a round trip. */
export const CONSENT_STORAGE_KEY = 'ss-cookie-consent';

/**
 * Bump this whenever the banner copy or the categories it covers change.
 * Existing consents keep their old version, so a regulator can tell which text
 * a given visitor actually agreed to.
 */
export const CONSENT_POLICY_VERSION = '2026-08-20';

/** Consent is valid for 12 months, after which the banner asks again. */
export const CONSENT_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

export type ConsentChoiceValue = 'all' | 'essential';

export function isConsentChoice(value: unknown): value is ConsentChoiceValue {
  return value === 'all' || value === 'essential';
}

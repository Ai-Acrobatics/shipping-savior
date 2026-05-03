/**
 * UTM + attribution capture.
 *
 * Captures `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`
 * + the landing referrer + landing path on the FIRST page load that has any utm_*
 * param. Persists to `localStorage` under `ss_attribution`. Subsequent visits
 * do NOT overwrite (first-touch attribution model). To switch to last-touch,
 * call `clearAttribution()` before navigating.
 *
 * To send attribution to the server (e.g. on registration), call
 * `getAttributionHeader()` and add it to the request as `X-Attribution`.
 */

const STORAGE_KEY = "ss_attribution";

export interface AttributionRecord {
  source: string | null;
  medium: string | null;
  campaign: string | null;
  term: string | null;
  content: string | null;
  referrer: string | null;
  landing_path: string | null;
  captured_at: string; // ISO timestamp
}

const UTM_KEYS = ["source", "medium", "campaign", "term", "content"] as const;

function readStorage(): AttributionRecord | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AttributionRecord;
  } catch {
    return null;
  }
}

function writeStorage(record: AttributionRecord): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
  } catch {
    // localStorage might be disabled (private mode, quota, etc.) — silent fail
  }
}

/**
 * Inspect the current URL for utm_* params. If any are present AND no attribution
 * is already stored, persist a new attribution record. Idempotent.
 */
export function captureUtmFromUrl(): AttributionRecord | null {
  if (typeof window === "undefined") return null;

  const existing = readStorage();
  if (existing) return existing; // first-touch — don't clobber

  const params = new URLSearchParams(window.location.search);
  const utm: Partial<AttributionRecord> = {};
  let hasAny = false;
  for (const key of UTM_KEYS) {
    const v = params.get(`utm_${key}`);
    if (v) {
      hasAny = true;
      (utm as Record<string, string>)[key] = v;
    }
  }

  // If no UTM params at all, still capture the referrer once for organic visits
  // — this is useful for measuring organic search / direct.
  const referrer = document.referrer || null;
  const landing_path = window.location.pathname || null;

  if (!hasAny && !referrer) {
    return null;
  }

  const record: AttributionRecord = {
    source: utm.source ?? null,
    medium: utm.medium ?? null,
    campaign: utm.campaign ?? null,
    term: utm.term ?? null,
    content: utm.content ?? null,
    referrer,
    landing_path,
    captured_at: new Date().toISOString(),
  };

  writeStorage(record);
  return record;
}

/**
 * Read the persisted attribution record (or null if none).
 */
export function getAttribution(): AttributionRecord | null {
  return readStorage();
}

/**
 * Returns a serialized header value safe to send with fetch as `X-Attribution`.
 * Server-side helper `parseAttributionHeader()` decodes it.
 */
export function getAttributionHeader(): string | null {
  const a = readStorage();
  if (!a) return null;
  try {
    return encodeURIComponent(JSON.stringify(a));
  } catch {
    return null;
  }
}

/**
 * Wipe attribution — useful for testing or last-touch attribution flows.
 */
export function clearAttribution(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // swallow
  }
}

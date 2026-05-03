/**
 * Server-side helper to read attribution data from incoming requests.
 *
 * The client sets `X-Attribution` (URL-encoded JSON) — see
 * `src/lib/analytics/utm.ts:getAttributionHeader()`. The server decodes it and
 * returns a typed record suitable for persisting to the `users.attribution_*`
 * columns.
 *
 * Usage from a Next.js Route Handler (e.g. /api/auth/register):
 *
 *   const attribution = parseAttributionFromRequest(request);
 *   await db.insert(users).values({
 *     ...
 *     attributionSource: attribution?.source ?? null,
 *     attributionMedium: attribution?.medium ?? null,
 *     attributionCampaign: attribution?.campaign ?? null,
 *   });
 *
 * Also accepts attribution embedded in the request body under the key
 * `attribution` (object) — for cases where setting custom headers is awkward.
 */

export interface ServerAttribution {
  source: string | null;
  medium: string | null;
  campaign: string | null;
  term: string | null;
  content: string | null;
  referrer: string | null;
  landing_path: string | null;
  captured_at: string | null;
}

function emptyRecord(): ServerAttribution {
  return {
    source: null,
    medium: null,
    campaign: null,
    term: null,
    content: null,
    referrer: null,
    landing_path: null,
    captured_at: null,
  };
}

function safeString(v: unknown): string | null {
  if (typeof v !== "string") return null;
  if (v.length === 0) return null;
  // Defensive: cap at 255 to match typical varchar column
  return v.slice(0, 255);
}

function decodeHeader(raw: string | null): ServerAttribution | null {
  if (!raw) return null;
  try {
    const decoded = decodeURIComponent(raw);
    const parsed = JSON.parse(decoded);
    if (!parsed || typeof parsed !== "object") return null;
    const r = emptyRecord();
    const obj = parsed as Record<string, unknown>;
    r.source = safeString(obj.source);
    r.medium = safeString(obj.medium);
    r.campaign = safeString(obj.campaign);
    r.term = safeString(obj.term);
    r.content = safeString(obj.content);
    r.referrer = safeString(obj.referrer);
    r.landing_path = safeString(obj.landing_path);
    r.captured_at = safeString(obj.captured_at);
    return r;
  } catch {
    return null;
  }
}

/**
 * Pull attribution from a Request object. Checks `X-Attribution` header first,
 * then falls back to a `attribution` field on the parsed JSON body if provided.
 *
 * `body` is optional — pass it in if you've already parsed the JSON, otherwise
 * only the header is checked.
 */
export function parseAttributionFromRequest(
  request: Request,
  body?: unknown
): ServerAttribution | null {
  // 1. Try header
  const headerVal = request.headers.get("x-attribution");
  const fromHeader = decodeHeader(headerVal);
  if (fromHeader) return fromHeader;

  // 2. Fall back to body.attribution
  if (body && typeof body === "object" && body !== null) {
    const maybeAttr = (body as Record<string, unknown>).attribution;
    if (maybeAttr && typeof maybeAttr === "object") {
      const r = emptyRecord();
      const obj = maybeAttr as Record<string, unknown>;
      r.source = safeString(obj.source);
      r.medium = safeString(obj.medium);
      r.campaign = safeString(obj.campaign);
      r.term = safeString(obj.term);
      r.content = safeString(obj.content);
      r.referrer = safeString(obj.referrer);
      r.landing_path = safeString(obj.landing_path);
      r.captured_at = safeString(obj.captured_at);
      // Only return if at least one field is non-null
      if (Object.values(r).some((v) => v !== null)) return r;
    }
  }

  return null;
}

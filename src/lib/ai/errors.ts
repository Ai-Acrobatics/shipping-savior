/**
 * AI provider error classification (AI-8506).
 *
 * When the Anthropic API key has a zero credit balance, the SDK throws a
 * `400 invalid_request_error` whose message is "Your credit balance is too low
 * to access the Anthropic API...". Before this module every OCR / chat route
 * surfaced that raw SDK string to end users (and the May 11 demo), which looks
 * like an app crash rather than an ops/billing issue.
 *
 * `classifyAiError` maps provider errors (Anthropic SDK `APIError`, Gemini /
 * Kimi `fetch` errors, or generic `Error`) onto a small, stable set of kinds
 * with a user-safe message and the right HTTP status. Routes use this so:
 *   - credit / billing exhaustion -> 503 "temporarily unavailable" (retryable)
 *   - auth / missing key          -> 503 config error
 *   - rate limit                  -> 429
 *   - overloaded (529)            -> 503 retryable
 *   - everything else             -> 500 generic
 *
 * It never leaks the raw upstream string to the client, but always preserves
 * it in `detail` for server-side logging.
 */

export type AiErrorKind =
  | "credit_exhausted"
  | "auth"
  | "rate_limited"
  | "overloaded"
  | "unknown";

export interface ClassifiedAiError {
  kind: AiErrorKind;
  /** HTTP status the route should respond with. */
  status: number;
  /** Stable machine-readable code for clients. */
  code: string;
  /** User-safe message — never contains raw upstream/SDK text. */
  userMessage: string;
  /** Whether the caller may retry later (after billing/ops action). */
  retryable: boolean;
  /** Raw upstream message, for server logs only. Never send to the client. */
  detail: string;
}

interface ErrorLike {
  status?: number;
  message?: string;
  error?: { type?: string; message?: string };
}

const CREDIT_PATTERNS = [
  "credit balance is too low",
  "insufficient credit",
  "billing",
  "payment required",
  "purchase more credits",
];

const AUTH_PATTERNS = [
  "invalid x-api-key",
  "authentication_error",
  "invalid api key",
  "not configured",
  "no auth credentials",
  "unauthorized",
];

const RATE_LIMIT_PATTERNS = ["rate limit", "rate_limit", "too many requests"];

const OVERLOADED_PATTERNS = ["overloaded", "overloaded_error"];

function extractStatus(err: ErrorLike): number | undefined {
  if (typeof err.status === "number") return err.status;
  // Some fetch-based providers embed "API error 429:" in the message.
  const m = err.message?.match(/\b(4\d{2}|5\d{2})\b/);
  return m ? parseInt(m[1], 10) : undefined;
}

function matchesAny(haystack: string, needles: string[]): boolean {
  return needles.some((n) => haystack.includes(n));
}

/**
 * Classify any provider error into a user-safe shape.
 * Accepts the Anthropic `APIError`, a `fetch`-style error, or a plain `Error`.
 */
export function classifyAiError(err: unknown): ClassifiedAiError {
  const e = (err ?? {}) as ErrorLike;
  const rawMessage = e.error?.message || e.message || String(err);
  const haystack = rawMessage.toLowerCase();
  const status = extractStatus(e);
  const detail = rawMessage.slice(0, 500);

  // Credit / billing exhaustion. Anthropic returns 400 invalid_request_error
  // for a zero balance, so match on message rather than status alone.
  if (matchesAny(haystack, CREDIT_PATTERNS)) {
    return {
      kind: "credit_exhausted",
      status: 503,
      code: "ai_unavailable_billing",
      userMessage:
        "AI document processing is temporarily unavailable. Our team has been notified and is restoring service — please try again shortly.",
      retryable: true,
      detail,
    };
  }

  // Rate limited.
  if (status === 429 || matchesAny(haystack, RATE_LIMIT_PATTERNS)) {
    return {
      kind: "rate_limited",
      status: 429,
      code: "ai_rate_limited",
      userMessage:
        "Too many AI requests right now. Please wait a moment and try again.",
      retryable: true,
      detail,
    };
  }

  // Upstream overloaded (Anthropic 529).
  if (status === 529 || matchesAny(haystack, OVERLOADED_PATTERNS)) {
    return {
      kind: "overloaded",
      status: 503,
      code: "ai_overloaded",
      userMessage:
        "The AI service is busy at the moment. Please try again in a few seconds.",
      retryable: true,
      detail,
    };
  }

  // Auth / missing-or-invalid key. Treated as a config error (not the user's
  // fault), so 503 rather than 401 — the end user can't fix an API key.
  if (status === 401 || status === 403 || matchesAny(haystack, AUTH_PATTERNS)) {
    return {
      kind: "auth",
      status: 503,
      code: "ai_unavailable_config",
      userMessage:
        "AI document processing is temporarily unavailable due to a configuration issue. Our team has been notified.",
      retryable: false,
      detail,
    };
  }

  return {
    kind: "unknown",
    status: 500,
    code: "ai_error",
    userMessage:
      "AI processing failed unexpectedly. Please try again, or contact support if this persists.",
    retryable: true,
    detail,
  };
}

/**
 * Convenience: log a classified AI error server-side with enough context for
 * ops to tell a billing problem from a real bug, without leaking to the client.
 */
export function logAiError(
  scope: string,
  classified: ClassifiedAiError
): void {
  const line = `[ai/${scope}] ${classified.kind} (${classified.code}): ${classified.detail}`;
  if (classified.kind === "credit_exhausted" || classified.kind === "auth") {
    // Billing/config issues are ops-actionable — surface at error level.
    console.error(
      line +
        "  >> ACTION: check Anthropic credit balance / API key at console.anthropic.com"
    );
  } else {
    console.warn(line);
  }
}

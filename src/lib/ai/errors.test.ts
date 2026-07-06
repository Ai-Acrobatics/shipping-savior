/**
 * Unit tests for AI provider error classification (AI-8506).
 *
 * The load-bearing case is `credit_exhausted`: a zero Anthropic credit balance
 * surfaces as a 400 `invalid_request_error` whose message contains "credit
 * balance is too low". We must catch it on message (not status) and respond
 * 503 + a user-safe string — never the raw SDK text.
 */
import { describe, it, expect, vi } from "vitest";
import { classifyAiError, logAiError } from "./errors";

describe("classifyAiError", () => {
  it("classifies an Anthropic zero-credit-balance 400 as credit_exhausted/503", () => {
    // Shape of the Anthropic SDK APIError for a depleted balance.
    const err = {
      status: 400,
      message:
        "400 {\"type\":\"error\",\"error\":{\"type\":\"invalid_request_error\",\"message\":\"Your credit balance is too low to access the Anthropic API. Please go to Plans & Billing to upgrade or purchase credits.\"}}",
      error: {
        type: "invalid_request_error",
        message:
          "Your credit balance is too low to access the Anthropic API. Please go to Plans & Billing to upgrade or purchase credits.",
      },
    };
    const c = classifyAiError(err);
    expect(c.kind).toBe("credit_exhausted");
    expect(c.status).toBe(503);
    expect(c.code).toBe("ai_unavailable_billing");
    expect(c.retryable).toBe(true);
    // Never leak the raw upstream text to the client.
    expect(c.userMessage.toLowerCase()).not.toContain("credit balance");
    expect(c.userMessage).toMatch(/temporarily unavailable/i);
    // But it IS preserved for server logs.
    expect(c.detail).toContain("credit balance is too low");
  });

  it("classifies a plain credit-balance Error message (no status) as credit_exhausted", () => {
    const err = new Error(
      "Contract parsing failed: Your credit balance is too low to access the Anthropic API"
    );
    const c = classifyAiError(err);
    expect(c.kind).toBe("credit_exhausted");
    expect(c.status).toBe(503);
  });

  it("classifies a 429 as rate_limited", () => {
    const c = classifyAiError({ status: 429, message: "Rate limit exceeded" });
    expect(c.kind).toBe("rate_limited");
    expect(c.status).toBe(429);
  });

  it("classifies a fetch-style 'API error 429:' message as rate_limited", () => {
    const c = classifyAiError(new Error("Gemini API error 429: too many requests"));
    expect(c.kind).toBe("rate_limited");
    expect(c.status).toBe(429);
  });

  it("classifies a 529 / overloaded as overloaded/503", () => {
    const c = classifyAiError({ status: 529, message: "Overloaded" });
    expect(c.kind).toBe("overloaded");
    expect(c.status).toBe(503);
  });

  it("classifies a 401 auth error as auth/503 (non-retryable)", () => {
    const c = classifyAiError({
      status: 401,
      message: "authentication_error: invalid x-api-key",
    });
    expect(c.kind).toBe("auth");
    expect(c.status).toBe(503);
    expect(c.retryable).toBe(false);
  });

  it("classifies a missing-key 'not configured' message as auth", () => {
    const c = classifyAiError(new Error("ANTHROPIC_API_KEY not configured"));
    expect(c.kind).toBe("auth");
  });

  it("falls back to unknown/500 for an unrecognized error", () => {
    const c = classifyAiError(new Error("socket hang up"));
    expect(c.kind).toBe("unknown");
    expect(c.status).toBe(500);
  });

  it("never throws on null / undefined / non-error input", () => {
    expect(() => classifyAiError(null)).not.toThrow();
    expect(() => classifyAiError(undefined)).not.toThrow();
    expect(() => classifyAiError("just a string")).not.toThrow();
    expect(classifyAiError(null).kind).toBe("unknown");
  });
});

describe("logAiError", () => {
  it("logs credit_exhausted at error level with a billing action hint", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    logAiError("contracts/parse", classifyAiError(new Error("credit balance is too low")));
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0]).toContain("console.anthropic.com");
    spy.mockRestore();
  });

  it("logs unknown errors at warn level", () => {
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
    logAiError("home-chat", classifyAiError(new Error("socket hang up")));
    expect(spy).toHaveBeenCalledTimes(1);
    spy.mockRestore();
  });
});

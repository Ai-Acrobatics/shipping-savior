/**
 * Multi-provider AI extraction layer.
 *
 * Priority order: Claude (primary) → Gemini 2.5 Pro (fallback) → Kimi K2 (future)
 *
 * Each provider returns the same shape so routes are provider-agnostic.
 * Results are logged to the model_comparison_logs DB table for performance auditing.
 */

import Anthropic from "@anthropic-ai/sdk";
import { db } from "@/lib/db";
import { modelComparisonLogs } from "@/lib/db/schema";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ProviderName = "claude-sonnet-4" | "gemini-2.5-pro" | "kimi-k2";

export interface ExtractionInput {
  buffer: Buffer;
  fileType: string;
  prompt: string;
  taskType: "bol" | "contract";
  fileName?: string;
}

export interface ExtractionResult {
  provider: ProviderName;
  text: string;
  /** Time from call start to first token / response ready, ms */
  latencyMs: number;
  /** Rough input token count (estimate if provider doesn't return it) */
  inputTokens: number;
  /** Rough output token count */
  outputTokens: number;
  /** Estimated USD cost at public pricing */
  estimatedCostUsd: number;
  error?: string;
}

// ─── Cost tables (per 1M tokens, USD, public pricing 2026-04) ─────────────────

const COST_PER_M: Record<ProviderName, { input: number; output: number }> = {
  "claude-sonnet-4":  { input: 3.00,  output: 15.00 },
  "gemini-2.5-pro":   { input: 3.50,  output: 10.50 },
  "kimi-k2":          { input: 0.15,  output: 2.50  },
};

function estimateCost(provider: ProviderName, inputTokens: number, outputTokens: number) {
  const { input, output } = COST_PER_M[provider];
  return (inputTokens * input + outputTokens * output) / 1_000_000;
}

// ─── Claude provider ──────────────────────────────────────────────────────────

async function extractWithClaude(input: ExtractionInput): Promise<ExtractionResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not configured");

  const t0 = Date.now();
  const client = new Anthropic({ apiKey });
  const base64Data = input.buffer.toString("base64");

  const isImage = input.fileType.startsWith("image/");
  const mediaType = input.fileType as
    | "application/pdf"
    | "image/jpeg"
    | "image/png"
    | "image/webp"
    | "image/gif";

  const contentBlock = isImage
    ? {
        type: "image" as const,
        source: {
          type: "base64" as const,
          media_type: mediaType as "image/jpeg" | "image/png" | "image/webp" | "image/gif",
          data: base64Data,
        },
      }
    : {
        type: "document" as const,
        source: {
          type: "base64" as const,
          media_type: "application/pdf" as const,
          data: base64Data,
        },
      };

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: [contentBlock, { type: "text", text: input.prompt }],
      },
    ],
  });

  const text = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");

  const inputTokens = response.usage?.input_tokens ?? Math.ceil(input.buffer.byteLength / 4);
  const outputTokens = response.usage?.output_tokens ?? Math.ceil(text.length / 4);

  return {
    provider: "claude-sonnet-4",
    text,
    latencyMs: Date.now() - t0,
    inputTokens,
    outputTokens,
    estimatedCostUsd: estimateCost("claude-sonnet-4", inputTokens, outputTokens),
  };
}

// ─── Gemini provider ──────────────────────────────────────────────────────────

async function extractWithGemini(input: ExtractionInput): Promise<ExtractionResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not configured");

  const t0 = Date.now();
  const base64Data = input.buffer.toString("base64");

  const body = {
    contents: [
      {
        parts: [
          { inline_data: { mime_type: input.fileType, data: base64Data } },
          { text: input.prompt },
        ],
      },
    ],
    generationConfig: {
      responseMimeType: "application/json",
      maxOutputTokens: 4096,
      temperature: 0.1,
    },
  };

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${err.slice(0, 200)}`);
  }

  const data = await res.json() as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    usageMetadata?: { promptTokenCount?: number; candidatesTokenCount?: number };
    error?: { message?: string };
  };

  if (data.error) throw new Error(data.error.message ?? "Gemini error");

  const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
  const inputTokens = data.usageMetadata?.promptTokenCount ?? Math.ceil(input.buffer.byteLength / 4);
  const outputTokens = data.usageMetadata?.candidatesTokenCount ?? Math.ceil(text.length / 4);

  return {
    provider: "gemini-2.5-pro",
    text,
    latencyMs: Date.now() - t0,
    inputTokens,
    outputTokens,
    estimatedCostUsd: estimateCost("gemini-2.5-pro", inputTokens, outputTokens),
  };
}

// ─── Kimi K2 provider (Moonshot AI — OpenAI-compatible) ───────────────────────
// Requires KIMI_API_KEY env var. Sign up: platform.moonshot.cn
// Model: kimi-k2-0711-preview (or latest from: api.moonshot.cn/v1/models)

async function extractWithKimi(input: ExtractionInput): Promise<ExtractionResult> {
  const apiKey = process.env.KIMI_API_KEY;
  if (!apiKey) throw new Error("KIMI_API_KEY not configured");

  const t0 = Date.now();
  const base64Data = input.buffer.toString("base64");
  const dataUrl = `data:${input.fileType};base64,${base64Data}`;

  // Kimi K2 uses OpenAI-compatible vision format
  const body = {
    model: "kimi-k2-0711-preview",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: [
          { type: "image_url", image_url: { url: dataUrl } },
          { type: "text", text: input.prompt },
        ],
      },
    ],
  };

  const res = await fetch("https://api.moonshot.cn/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Kimi API error ${res.status}: ${err.slice(0, 200)}`);
  }

  const data = await res.json() as {
    choices?: Array<{ message?: { content?: string } }>;
    usage?: { prompt_tokens?: number; completion_tokens?: number };
    error?: { message?: string };
  };

  if (data.error) throw new Error(data.error.message ?? "Kimi error");

  const text = data.choices?.[0]?.message?.content ?? "";
  const inputTokens = data.usage?.prompt_tokens ?? Math.ceil(input.buffer.byteLength / 4);
  const outputTokens = data.usage?.completion_tokens ?? Math.ceil(text.length / 4);

  return {
    provider: "kimi-k2",
    text,
    latencyMs: Date.now() - t0,
    inputTokens,
    outputTokens,
    estimatedCostUsd: estimateCost("kimi-k2", inputTokens, outputTokens),
  };
}

// ─── Provider registry ────────────────────────────────────────────────────────

const PROVIDERS: Array<(input: ExtractionInput) => Promise<ExtractionResult>> = [
  extractWithClaude,
  extractWithGemini,
  // extractWithKimi,  // Uncomment once KIMI_API_KEY is set in Vercel
];

// ─── Main: fallback extraction ────────────────────────────────────────────────

/**
 * Try providers in order until one succeeds.
 * Logs every attempt (success or failure) to model_comparison_logs.
 */
export async function extractWithFallback(
  input: ExtractionInput
): Promise<ExtractionResult & { allAttempts: ExtractionResult[] }> {
  const attempts: ExtractionResult[] = [];

  for (const providerFn of PROVIDERS) {
    try {
      const result = await providerFn(input);
      attempts.push(result);
      // Log success
      await logAttempt({ input, result, success: true });
      return { ...result, allAttempts: attempts };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      const failureResult: ExtractionResult = {
        provider: providerFn.name.replace("extractWith", "").toLowerCase() as ProviderName,
        text: "",
        latencyMs: 0,
        inputTokens: 0,
        outputTokens: 0,
        estimatedCostUsd: 0,
        error: errorMsg,
      };
      attempts.push(failureResult);
      // Log failure — don't throw, try next provider
      await logAttempt({ input, result: failureResult, success: false });
      console.warn(`[ai/providers] ${failureResult.provider} failed: ${errorMsg.slice(0, 120)}`);
    }
  }

  // All providers failed
  const lastError = attempts.at(-1)?.error ?? "All AI providers failed";
  throw new Error(lastError);
}

/**
 * Run all providers simultaneously and return all results for comparison.
 * Used by the /api/ai/compare endpoint.
 */
export async function extractWithAll(
  input: ExtractionInput
): Promise<ExtractionResult[]> {
  const activeProviders: Array<() => Promise<ExtractionResult>> = [];

  if (process.env.ANTHROPIC_API_KEY) activeProviders.push(() => extractWithClaude(input));
  if (process.env.GEMINI_API_KEY) activeProviders.push(() => extractWithGemini(input));
  if (process.env.KIMI_API_KEY) activeProviders.push(() => extractWithKimi(input));

  const results = await Promise.allSettled(activeProviders.map((fn) => fn()));

  return results.map((r, i) => {
    if (r.status === "fulfilled") return r.value;
    return {
      provider: ["claude-sonnet-4", "gemini-2.5-pro", "kimi-k2"][i] as ProviderName,
      text: "",
      latencyMs: 0,
      inputTokens: 0,
      outputTokens: 0,
      estimatedCostUsd: 0,
      error: r.reason instanceof Error ? r.reason.message : String(r.reason),
    };
  });
}

// ─── Audit logger ─────────────────────────────────────────────────────────────

async function logAttempt({
  input,
  result,
  success,
}: {
  input: ExtractionInput;
  result: ExtractionResult;
  success: boolean;
}) {
  try {
    await db.insert(modelComparisonLogs).values({
      taskType: input.taskType,
      fileName: input.fileName ?? null,
      provider: result.provider,
      success,
      latencyMs: result.latencyMs,
      inputTokens: result.inputTokens,
      outputTokens: result.outputTokens,
      estimatedCostUsd: String(result.estimatedCostUsd.toFixed(6)),
      errorMessage: result.error ?? null,
      responsePreview: result.text.slice(0, 500) || null,
    });
  } catch (logErr) {
    // Never let logging break the request
    console.error("[ai/providers] Failed to write audit log:", logErr);
  }
}

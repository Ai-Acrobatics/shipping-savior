// ============================================================
// Shared Anthropic Client + Rate Limiting + Caching
// Sprint 4: AI Agent Layer
// ============================================================

import Anthropic from "@anthropic-ai/sdk";

// ─── Singleton Client ────────────────────────────────────────

let _client: Anthropic | null = null;

export function getAnthropicClient(): Anthropic {
  if (!_client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error(
        "ANTHROPIC_API_KEY environment variable is not set. " +
          "Add it to .env.local for development."
      );
    }
    _client = new Anthropic({ apiKey });
  }
  return _client;
}

// ─── In-Memory Cache ─────────────────────────────────────────

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry<unknown>>();

const DEFAULT_TTL_MS = 30 * 60 * 1000; // 30 minutes

export function getCached<T>(key: string): T | null {
  const entry = cache.get(key) as CacheEntry<T> | undefined;
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

export function setCache<T>(key: string, data: T, ttlMs = DEFAULT_TTL_MS): void {
  // Evict old entries if cache gets large
  if (cache.size > 500) {
    const now = Date.now();
    for (const [k, v] of cache) {
      if (now > v.expiresAt) cache.delete(k);
    }
  }
  cache.set(key, { data, expiresAt: Date.now() + ttlMs });
}

export function makeCacheKey(prefix: string, input: Record<string, unknown>): string {
  const sorted = Object.keys(input)
    .sort()
    .map((k) => `${k}:${JSON.stringify(input[k])}`)
    .join("|");
  return `${prefix}:${sorted}`;
}

// ─── Rate Limiting (per-org, in-memory) ──────────────────────

interface RateBucket {
  count: number;
  windowStart: number;
}

const rateBuckets = new Map<string, RateBucket>();

export function checkRateLimit(
  orgId: string,
  tier: "free" | "paid" = "free"
): { allowed: boolean; remaining: number; resetAt: number } {
  const maxPerMinute = tier === "paid" ? 100 : 10;
  const windowMs = 60_000;
  const now = Date.now();
  const key = `rate:${orgId}`;

  let bucket = rateBuckets.get(key);
  if (!bucket || now - bucket.windowStart > windowMs) {
    bucket = { count: 0, windowStart: now };
    rateBuckets.set(key, bucket);
  }

  const remaining = Math.max(0, maxPerMinute - bucket.count);
  const resetAt = bucket.windowStart + windowMs;

  if (bucket.count >= maxPerMinute) {
    return { allowed: false, remaining: 0, resetAt };
  }

  bucket.count++;
  return { allowed: true, remaining: remaining - 1, resetAt };
}

// ─── Token Usage Tracking ────────────────────────────────────

interface UsageRecord {
  orgId: string;
  endpoint: string;
  inputTokens: number;
  outputTokens: number;
  timestamp: number;
}

const usageLog: UsageRecord[] = [];

export function trackUsage(
  orgId: string,
  endpoint: string,
  inputTokens: number,
  outputTokens: number
): void {
  usageLog.push({
    orgId,
    endpoint,
    inputTokens,
    outputTokens,
    timestamp: Date.now(),
  });

  // Keep only last 10k records in memory
  if (usageLog.length > 10_000) {
    usageLog.splice(0, usageLog.length - 10_000);
  }
}

export function getUsageSummary(orgId: string): {
  totalInputTokens: number;
  totalOutputTokens: number;
  requestCount: number;
} {
  const orgRecords = usageLog.filter((r) => r.orgId === orgId);
  return {
    totalInputTokens: orgRecords.reduce((s, r) => s + r.inputTokens, 0),
    totalOutputTokens: orgRecords.reduce((s, r) => s + r.outputTokens, 0),
    requestCount: orgRecords.length,
  };
}

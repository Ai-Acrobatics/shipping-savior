/**
 * GET /api/ai/audit
 *
 * Returns model comparison logs — used by the audit dashboard.
 * Query params:
 *   ?taskType=bol|contract   (optional filter)
 *   ?provider=claude-sonnet-4|gemini-2.5-pro|kimi-k2  (optional filter)
 *   ?limit=50  (default 100)
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { modelComparisonLogs } from "@/lib/db/schema";
import { desc, eq, and } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const taskType = searchParams.get("taskType");
  const provider = searchParams.get("provider");
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "100", 10), 500);

  const conditions = [];
  if (taskType) conditions.push(eq(modelComparisonLogs.taskType, taskType));
  if (provider) conditions.push(eq(modelComparisonLogs.provider, provider));

  const rows = await db
    .select()
    .from(modelComparisonLogs)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(modelComparisonLogs.createdAt))
    .limit(limit);

  // Aggregate stats per provider
  const byProvider: Record<string, {
    provider: string;
    calls: number;
    successes: number;
    failures: number;
    avgLatencyMs: number;
    totalCostUsd: number;
    successRate: string;
  }> = {};

  for (const row of rows) {
    if (!byProvider[row.provider]) {
      byProvider[row.provider] = {
        provider: row.provider,
        calls: 0,
        successes: 0,
        failures: 0,
        avgLatencyMs: 0,
        totalCostUsd: 0,
        successRate: "0%",
      };
    }
    const agg = byProvider[row.provider];
    agg.calls++;
    if (row.success) agg.successes++;
    else agg.failures++;
    agg.avgLatencyMs = Math.round(
      (agg.avgLatencyMs * (agg.calls - 1) + (row.latencyMs ?? 0)) / agg.calls
    );
    agg.totalCostUsd += parseFloat(row.estimatedCostUsd ?? "0");
    agg.successRate = `${Math.round((agg.successes / agg.calls) * 100)}%`;
  }

  return NextResponse.json({
    total: rows.length,
    providerStats: Object.values(byProvider),
    logs: rows,
  });
}

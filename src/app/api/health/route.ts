import { NextResponse } from 'next/server';
import { sql } from 'drizzle-orm';
import { db } from '@/lib/db';

// Force dynamic so health checks always run fresh against the DB.
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/health
 * Liveness + readiness probe. Pings the Neon DB with a `SELECT 1`.
 * Returns 200 with status:"ok" if DB is reachable, 503 if not.
 */
export async function GET() {
  const base = {
    uptime: process.uptime(),
    commit: process.env.VERCEL_GIT_COMMIT_SHA || 'unknown',
    timestamp: Date.now(),
  };

  try {
    await db.execute(sql`SELECT 1`);
    return NextResponse.json({ status: 'ok', ...base });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown db error';
    return NextResponse.json(
      { status: 'error', error: message, ...base },
      { status: 503 }
    );
  }
}

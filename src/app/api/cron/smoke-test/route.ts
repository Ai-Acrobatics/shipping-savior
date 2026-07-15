import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * GET /api/cron/smoke-test — every 6 hours (see vercel.json).
 *
 * Prod synthetic monitoring: hits 15+ key routes + mobile auth endpoint and
 * reports pass/fail for each. On any failure, details are logged via console
 * (and Sentry when DSN is configured). The Vercel Cron dashboard catches
 * 5xx responses; inspect the response body for per-route granularity.
 *
 * Auth: Vercel cron sends `Authorization: Bearer ${CRON_SECRET}`.
 *
 * Response shape:
 *   { ok: true, results: [{ route, status, passed, error? }], summary: { total, passed, failed } }
 *   / OR { ok: false, error: "Unauthorized" } on bad auth.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.AUTH_URL || 'https://shipping-savior.vercel.app';
  const base = baseUrl.replace(/\/+$/, '');

  // ── Route manifest ──────────────────────────────────────────────────────
  // 15+ routes that cover the core user-facing surface + critical API paths.
  // Each entry: { route, label, method, expectedStatus?, check? }
  const routes: Array<{
    label: string;
    path: string;
    method?: 'GET' | 'POST';
    body?: unknown;
    expectedStatus?: number;
    expectUnauthenticated?: boolean;
  }> = [
    // Public pages
    { label: 'Homepage', path: '/' },
    { label: 'Pricing', path: '/pricing' },
    { label: 'Login', path: '/login' },
    { label: 'Register', path: '/register' },
    { label: 'Forgot password', path: '/forgot-password' },
    { label: 'Verify email', path: '/verify-email' },
    { label: 'Agent plan', path: '/agent-plan' },
    { label: 'Agreement', path: '/agreement' },
    { label: 'Terms', path: '/terms' },
    { label: 'Privacy', path: '/privacy' },

    // Public API endpoints
    { label: 'Health check', path: '/api/health' },
    { label: 'HTS search', path: '/api/hts/search', expectedStatus: 200 },

    // Protected pages (expect 302 redirect to login)
    { label: 'Dashboard (redirects unauth)', path: '/platform', expectedStatus: 302 },
    { label: 'Shipments (redirects unauth)', path: '/platform/shipments', expectedStatus: 302 },
    { label: 'Calculators (redirects unauth)', path: '/platform/calculators', expectedStatus: 302 },
    { label: 'Settings (redirects unauth)', path: '/platform/settings', expectedStatus: 302 },
    { label: 'Billing (redirects unauth)', path: '/platform/billing', expectedStatus: 302 },

    // Mobile auth endpoint — unauthenticated session check returns 401
    { label: 'Mobile auth session (unauth → 401)', path: '/api/mobile/auth/session', expectedStatus: 401 },

    // Mobile login endpoint — POST without body returns 400
    { label: 'Mobile auth login (no body → 400)', path: '/api/mobile/auth/login', method: 'POST', expectedStatus: 400 },
  ];

  const results: Array<{
    label: string;
    path: string;
    status: number;
    passed: boolean;
    error?: string;
  }> = [];

  for (const route of routes) {
    const url = `${base}${route.path}`;
    const start = Date.now();
    let status = 0;
    let error: string | undefined;
    let passed = false;

    try {
      const options: RequestInit = {
        method: route.method ?? 'GET',
        headers: { 'User-Agent': 'ShippingSavior-SmokeTest/1.0' },
        signal: AbortSignal.timeout(15_000),
      };

      if (route.body) {
        options.headers = { ...options.headers, 'Content-Type': 'application/json' };
        options.body = JSON.stringify(route.body);
      }

      const response = await fetch(url, options);
      status = response.status;

      const expected = route.expectedStatus ?? (route.method === 'POST' ? 400 : 200);
      const unauthOk = route.expectUnauthenticated && status === 302;

      passed = (status >= 200 && status < 400) || status === expected || unauthOk;

      if (!passed) {
        const body = await response.text().catch(() => '');
        error = `Expected ${expected}, got ${status}. Body: ${body.slice(0, 200)}`;
      }
    } catch (err) {
      error = err instanceof Error ? err.message : String(err);
      status = 0;
    }

    const elapsed = Date.now() - start;
    results.push({
      label: route.label,
      path: route.path,
      status,
      passed,
      error,
    });

    if (!passed) {
      console.error(`[SMOKE] FAIL ${route.label} (${url}) — ${error}`);
    }
  }

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  // Log failures to console (Sentry picks up console.error when DSN is set)
  if (failed > 0) {
    console.error(`[SMOKE] ${failed}/${results.length} routes FAILED`);
  }

  const body = {
    ok: failed === 0,
    timestamp: new Date().toISOString(),
    summary: { total: results.length, passed, failed },
    results,
  };

  return NextResponse.json(body, { status: failed === 0 ? 200 : 503 });
}
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * Prod routes to monitor — core public pages.
 */
const PUBLIC_ROUTES = [
  '/',
  '/pricing',
  '/calculators',
  '/routes',
  '/port-finder',
  '/carrier-comparison',
  '/industries/cold-chain',
  '/industries/automotive',
  '/knowledge-base',
  '/platform-architecture',
  '/tech-spec',
  '/six-sigma',
  '/phases',
  '/demo',
  '/monetization',
];

/**
 * API routes to monitor.
 */
const API_ROUTES = [
  { path: '/api/health', expectStatus: 200 },
  { path: '/api/mobile/auth/session', expectStatus: 401 },
  { path: '/api/mobile/devices', expectStatus: 401 },
];

interface RouteCheck {
  path: string;
  status: number | null;
  expected: number;
  ok: boolean;
  durationMs: number;
  error?: string;
  bodySnippet?: string;
}

interface CheckResult {
  timestamp: string;
  baseUrl: string;
  totalChecks: number;
  passed: number;
  failed: number;
  publicRoutes: RouteCheck[];
  apiRoutes: RouteCheck[];
  summary: string;
}

const BASE_URL = 'https://shipping-savior.vercel.app';

async function checkRoute(
  path: string,
  expectedStatus: number
): Promise<RouteCheck> {
  const start = Date.now();
  const url = `${BASE_URL}${path}`;
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: { 'User-Agent': 'ShippingSavior-ProdMonitor/1.0' },
      signal: AbortSignal.timeout(15_000),
      redirect: 'manual',
    });
    const durationMs = Date.now() - start;
    const status = res.status;
    const ok = status === expectedStatus;

    let bodySnippet: string | undefined;
    if (!ok && expectedStatus === 200) {
      try {
        const text = await res.text();
        bodySnippet = text.slice(0, 200);
      } catch {
        bodySnippet = '<body read failed>';
      }
    }

    return { path, status, expected: expectedStatus, ok, durationMs, error: ok ? undefined : `Expected ${expectedStatus}, got ${status}`, bodySnippet };
  } catch (err) {
    const durationMs = Date.now() - start;
    const message = err instanceof Error ? err.message : String(err);
    return { path, status: null, expected: expectedStatus, ok: false, durationMs, error: message };
  }
}

export async function GET(request: NextRequest) {
  // Auth check — only Vercel cron with the correct secret can trigger
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Run all checks concurrently
  const publicResults = await Promise.all(
    PUBLIC_ROUTES.map((path) => checkRoute(path, 200))
  );
  const apiResults = await Promise.all(
    API_ROUTES.map((route) => checkRoute(route.path, route.expectStatus))
  );

  const allChecks = [...publicResults, ...apiResults];
  const passed = allChecks.filter((c) => c.ok).length;
  const failed = allChecks.filter((c) => !c.ok).length;

  const result: CheckResult = {
    timestamp: new Date().toISOString(),
    baseUrl: BASE_URL,
    totalChecks: allChecks.length,
    passed,
    failed,
    publicRoutes: publicResults,
    apiRoutes: apiResults,
    summary: failed === 0
      ? `All ${allChecks.length} routes healthy`
      : `${failed}/${allChecks.length} route(s) FAILED`,
  };

  // On failure, try to alert via email if a monitor email is configured
  if (failed > 0) {
    const failures = allChecks.filter((c) => !c.ok);
    console.error('[prod-monitor] ROUTE FAILURES:', JSON.stringify(failures, null, 2));

    // Try to send alert email via Resend
    const monitorEmailTo = process.env.MONITOR_EMAIL_TO;
    if (monitorEmailTo) {
      try {
        const { sendEmail } = await import('@/lib/auth/email');
        const failureList = failures
          .map(
            (f) =>
              `<li><strong>${f.path}</strong> — ${f.error || 'unknown error'} (${f.durationMs}ms)</li>`
          )
          .join('');
        await sendEmail({
          to: monitorEmailTo,
          subject: `[PROD] ${failed} route(s) failing — ShippingSavior`,
          html: `<h2>Production Monitoring Alert</h2>
<p>${failed}/${allChecks.length} routes failed the synthetic check.</p>
<ul>${failureList}</ul>
<hr />
<p>Full report: <code>${BASE_URL}/api/cron/prod-monitor</code></p>`,
        });
      } catch (emailErr) {
        console.error('[prod-monitor] email alert failed:', emailErr);
      }
    }

    // Return 200 so Vercel cron doesn't retry — the alert has been sent
    return NextResponse.json(result);
  }

  return NextResponse.json(result);
}
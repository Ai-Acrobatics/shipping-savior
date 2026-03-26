# Monitoring & Platform Health: Shipping Savior

**Linear:** AI-5415
**Phase:** Phase 2 Planning — Operations
**Status:** Complete
**Last Updated:** 2026-03-26

---

## Table of Contents

1. [Uptime Monitoring](#1-uptime-monitoring)
2. [Core Web Vitals Tracking](#2-core-web-vitals-tracking)
3. [Error Tracking](#3-error-tracking)
4. [Performance Budgets](#4-performance-budgets)
5. [Alerting Setup](#5-alerting-setup)
6. [Platform Health Dashboard](#6-platform-health-dashboard)
7. [Runbook Templates](#7-runbook-templates)
8. [Implementation Checklist](#8-implementation-checklist)

---

## 1. Uptime Monitoring

### Vercel Built-In Monitoring

Vercel's free tier provides:
- **Deployment health checks** — Every deployment is verified before traffic switches over. If the health check endpoint (`/api/health`) returns non-2xx, Vercel aborts the promotion automatically.
- **Function invocation logs** — Serverless function errors surfaced in the Vercel dashboard under Logs > Functions.
- **Edge network status** — Vercel Status page (vercel.com/status) provides global CDN incident tracking.

**Setup steps:**

1. Create `app/api/health/route.ts`:

```typescript
// Lightweight health endpoint — always returns 200 with basic diagnostics
export async function GET() {
  return Response.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    // Phase 2+: add DB ping, Redis ping here
  });
}
```

2. In `vercel.json`, configure health check:

```json
{
  "healthcheck": {
    "path": "/api/health",
    "enabled": true
  }
}
```

3. Enable **Vercel Deployment Notifications** in Project Settings > Notifications:
   - Email on deployment failure
   - Email on deployment success (optional — low signal, skip in early phase)

### UptimeRobot Free Tier

UptimeRobot provides external uptime checks independent of Vercel's internal health checks. This is the "eyes from outside the building" — it catches cases where Vercel reports healthy but DNS, CDN, or regional routing is broken.

**Free tier provides:**
- 50 monitors
- 5-minute check interval
- Email + Slack + webhook alerts
- 90-day uptime history
- Public status page (shareable with Blake)

**Setup steps:**

1. Create account at uptimerobot.com
2. Add the following monitors:

| Monitor Name | URL | Type | Alert Threshold |
|---|---|---|---|
| Shipping Savior — Main | `https://shipping-savior.vercel.app/` | HTTP(s) | Down for > 5 min |
| Shipping Savior — Health API | `https://shipping-savior.vercel.app/api/health` | HTTP(s) | Down for > 5 min |
| Shipping Savior — Calculators | `https://shipping-savior.vercel.app/calculators` | HTTP(s) | Down for > 5 min |
| Shipping Savior — Route Map | `https://shipping-savior.vercel.app/map` | HTTP(s) | Down for > 5 min |

3. Configure keyword monitor on the main URL to verify the response body contains `"Shipping Savior"` (catches cases where the page loads but renders blank or a 500 error template).

4. Set up **Public Status Page** in UptimeRobot dashboard → Status Pages → Create. Share URL with Blake so he can self-check before pinging the team.

**Alert contacts to add:**
- Blake's email (primary)
- Agency Slack webhook (secondary — see Section 5)

**Alert thresholds:**
- Alert after 1 failed check (5-min detection window is already acceptable)
- Recovery notification: enabled — close the loop when service restores

### Escalation Path

```
[UptimeRobot detects down]
        ↓
  5-min check failure → Email alert to Blake + Slack #alerts
        ↓
  10 min still down → Blake texts agency contact
        ↓
  30 min still down → Agency declares SEV1 (see Section 5)
        ↓
  Runbook: RB-01 (see Section 7)
```

---

## 2. Core Web Vitals Tracking

### Target Thresholds

| Metric | Target | Good | Needs Improvement | Poor |
|--------|--------|------|-------------------|------|
| **LCP** (Largest Contentful Paint) | < 2.0s | < 2.5s | 2.5–4.0s | > 4.0s |
| **FID** (First Input Delay) | < 50ms | < 100ms | 100–300ms | > 300ms |
| **INP** (Interaction to Next Paint) | < 100ms | < 200ms | 200–500ms | > 500ms |
| **CLS** (Cumulative Layout Shift) | < 0.05 | < 0.1 | 0.1–0.25 | > 0.25 |
| **TTFB** (Time to First Byte) | < 600ms | < 800ms | 800–1800ms | > 1800ms |
| **FCP** (First Contentful Paint) | < 1.5s | < 1.8s | 1.8–3.0s | > 3.0s |

**Why these targets matter for Shipping Savior specifically:**
- Calculators are interactive — INP (successor to FID) is critical. A 500ms delay between input change and result update feels broken.
- The route map with deck.gl is the most CLS-prone component (WebGL canvas renders async, may cause layout shift if container height isn't pre-set).
- HTS data loads large JSON — TTFB and LCP can degrade if loading is synchronous.

### Vercel Analytics Setup

Vercel Analytics (free tier) provides real-user Core Web Vitals from actual visitors. This is more accurate than synthetic tests because it reflects real browser/device conditions.

**Setup:**

1. Enable in Vercel Project Settings → Analytics → Enable
2. Install the package:

```bash
npm install @vercel/analytics
```

3. Add to `app/layout.tsx`:

```typescript
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

4. View data at vercel.com → Project → Analytics tab.
   - Filter by page to identify which routes have the worst vitals
   - Map page will likely have the worst LCP due to WebGL initialization

**Vercel Speed Insights** (also free, separate package):

```bash
npm install @vercel/speed-insights
```

```typescript
import { SpeedInsights } from '@vercel/speed-insights/next';
// Add <SpeedInsights /> alongside <Analytics />
```

Speed Insights overlays p50/p75/p90/p99 percentile breakdowns — useful for understanding the tail latency that affects the slowest 10% of users (often mobile).

### Google Search Console

GSC provides the **Search Experience report** with Core Web Vitals broken down by URL group. This data directly impacts search rankings.

**Setup:**

1. Go to search.google.com/search-console
2. Add property for the production domain
3. Verify via DNS TXT record or HTML file upload to Vercel `/public/` directory
4. Navigate to Experience → Core Web Vitals (takes 28 days to populate after first real traffic)

**What to watch in GSC:**
- "Poor URL" count in the CWV report — any URL marked Poor affects ranking
- "Pages not indexed" — indicates 404s or crawl errors (shipping-savior is proposal content, SEO matters)
- Mobile vs. Desktop CWV split (mobile is the ranking signal — prioritize fixing mobile issues)

### Monitoring the Map Page Specifically

deck.gl + MapLibre has known CLS and LCP pitfalls:

```typescript
// Prevent CLS: Always set explicit height on map container
// Map canvas renders async — without fixed height, causes layout shift
<div style={{ width: '100%', height: '600px' }}>
  <DeckGL ... />
</div>
```

LCP on the map page will likely be the hero text (not the map itself). If the map container counts as the LCP element, loading state with a skeleton at the correct dimensions prevents the LCP from being penalized by late-rendering WebGL canvas.

---

## 3. Error Tracking

### Sentry Free Tier for Next.js

Sentry's free tier provides:
- 5,000 errors/month
- 10,000 performance transactions/month
- 7-day data retention
- Source maps for readable stack traces
- Next.js SDK with automatic instrumentation

**Setup:**

1. Create account at sentry.io → New Project → Next.js

2. Install:

```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

The wizard creates `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`, and patches `next.config.ts` automatically.

3. Key configuration in `sentry.client.config.ts`:

```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.VERCEL_ENV ?? 'development',
  // Only sample 10% of performance transactions (free tier limit)
  tracesSampleRate: 0.1,
  // Don't report errors in local dev
  enabled: process.env.NODE_ENV === 'production',
  // Ignore noisy browser extension errors
  ignoreErrors: [
    'ResizeObserver loop limit exceeded',
    'Non-Error promise rejection captured',
  ],
  beforeSend(event) {
    // Strip PII if any user data surfaces
    if (event.user) {
      delete event.user.email;
      delete event.user.ip_address;
    }
    return event;
  },
});
```

4. Add `NEXT_PUBLIC_SENTRY_DSN` and `SENTRY_AUTH_TOKEN` to Vercel environment variables.

5. Add `.sentryclirc` to `.gitignore` — it contains auth tokens.

### Key Error Categories to Track

**Category 1: Calculator Errors** (highest business impact)

```typescript
// Wrap all calculation functions with Sentry error boundaries
import * as Sentry from '@sentry/nextjs';

export function calculateLandedCost(params: LandedCostParams): LandedCostResult {
  return Sentry.startSpan({ name: 'calculate.landedCost' }, () => {
    try {
      // ... calculation logic using decimal.js
      return result;
    } catch (error) {
      Sentry.captureException(error, {
        tags: { calculator: 'landed-cost' },
        extra: { params }, // Log inputs for debugging
      });
      throw error; // Re-throw for UI error boundary
    }
  });
}
```

Alert trigger: Any calculator error — these are critical user-facing failures.

**Category 2: Map Rendering Failures**

```typescript
// In map component
useEffect(() => {
  if (mapError) {
    Sentry.captureException(mapError, {
      tags: { component: 'route-map', library: 'deck.gl' },
      extra: {
        webgl_support: !!document.createElement('canvas').getContext('webgl2'),
        viewport: `${window.innerWidth}x${window.innerHeight}`,
      },
    });
  }
}, [mapError]);
```

Alert trigger: > 5 map errors in 10 minutes (map failures are often browser/WebGL specific, not systemic).

**Category 3: HTS Data Load Failures**

```typescript
// In HTS data loading logic
async function loadHTSData(section: string): Promise<HTSEntry[]> {
  try {
    const response = await fetch(`/data/hts-${section}.json`);
    if (!response.ok) {
      throw new Error(`HTS data load failed: ${response.status} ${section}`);
    }
    return response.json();
  } catch (error) {
    Sentry.captureException(error, {
      tags: { component: 'hts-loader', section },
      level: 'error',
    });
    throw error;
  }
}
```

Alert trigger: Any HTS data load failure — all calculators depend on this.

**Category 4: PDF Generation Failures**

```typescript
// In /api/export/* routes
try {
  const pdfBuffer = await generatePDF(reportData);
  return new Response(pdfBuffer, { headers: { 'Content-Type': 'application/pdf' } });
} catch (error) {
  Sentry.captureException(error, {
    tags: { component: 'pdf-generator', reportType: reportData.type },
  });
  return Response.json({ error: 'PDF generation failed' }, { status: 500 });
}
```

Alert trigger: > 3 PDF generation failures in 1 hour.

### Sentry Alert Rules to Create

In Sentry → Alerts → Create Alert Rule:

| Alert Name | Condition | Threshold | Action |
|---|---|---|---|
| Calculator Error | `tags.calculator` is set | Any occurrence | Email immediately |
| HTS Load Failure | `tags.component = hts-loader` | Any occurrence | Email immediately |
| Map Rendering Failure | `tags.component = route-map` | > 5 in 10min | Email |
| PDF Export Failure | `tags.component = pdf-generator` | > 3 in 1hr | Email |
| Unhandled Promise Rejection | Any | > 10 in 5min | Email |
| Error Rate Spike | Error count | > 50 in 1hr | Email + Slack |

---

## 4. Performance Budgets

### Bundle Size Limits

The single largest performance risk is deck.gl's bundle size. Unguarded, it can bloat the initial load.

| Bundle | Size Limit | Strategy if Exceeded |
|--------|-----------|---------------------|
| **Initial JS (total)** | 400 KB gzip | Split route-specific chunks |
| **deck.gl chunk** | 250 KB gzip | Dynamic import, load only on map page |
| **HTS search chunk** (Fuse.js + index) | 150 KB gzip | Load on first search interaction |
| **@react-pdf/renderer** | 180 KB gzip | Server-side only, never in client bundle |
| **decimal.js + currency.js** | 30 KB gzip | Always inline with calculators |
| **Recharts + Tremor** | 120 KB gzip | Tree-shake unused chart types |
| **Total page size (map page)** | 2 MB | Lazy-load map tiles on interaction |

**Enforce with `next-bundle-analyzer`:**

```bash
npm install --save-dev @next/bundle-analyzer
```

```javascript
// next.config.ts
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});
module.exports = withBundleAnalyzer({ /* your config */ });
```

Run: `ANALYZE=true npm run build` — opens visual bundle map.

**deck.gl Dynamic Import Pattern (critical):**

```typescript
// Never import deck.gl at module level on pages that don't need the map
// This alone prevents ~250KB from hitting the initial bundle

const DeckGL = dynamic(() => import('@deck.gl/react').then(m => m.default), {
  ssr: false,
  loading: () => <MapSkeleton height={600} />,
});
```

### HTS JSON Load Time Thresholds

The full HTS JSON dataset is large (50–80 MB uncompressed). Structure the load to stay within budget:

| Load Operation | Threshold | Approach |
|---|---|---|
| Initial page load (no HTS) | 0 ms (not loaded) | Lazy — only load on search interaction |
| First search keystroke to index ready | < 800 ms | Load section-specific JSON, not full dataset |
| Subsequent searches (index warm) | < 50 ms | Fuse.js in-memory search |
| Full HTS dataset (if needed) | < 3 s on 4G | Chunked JSON with progress indicator |
| HTS section file (per-chapter, ~500KB) | < 500 ms | Preload on calculator page mount |

**Budget enforcement:** Add a `performance.mark()` / `performance.measure()` wrapper around HTS load calls in development. Log a warning if threshold is exceeded.

### Calculator Response Time

All calculator functions are pure TypeScript (client-side). No network round-trips. Response time = JavaScript execution time only.

| Calculator | Input Change to Result | Threshold |
|---|---|---|
| Landed Cost | Single field change | < 50 ms |
| Unit Economics | Single field change | < 50 ms |
| FTZ Savings Analyzer | Full recalculate | < 200 ms |
| Container Utilization | Dimension input change | < 50 ms |
| Duty/Tariff Estimator | HTS code lookup | < 100 ms |
| Multi-scenario comparison | 3-scenario recalculate | < 300 ms |

**Measurement approach:**

```typescript
// Development-only performance guard
export function timedCalculate<T>(name: string, fn: () => T): T {
  if (process.env.NODE_ENV !== 'development') return fn();
  const start = performance.now();
  const result = fn();
  const duration = performance.now() - start;
  if (duration > 200) {
    console.warn(`[PERF] ${name} took ${duration.toFixed(1)}ms — exceeds 200ms budget`);
  }
  return result;
}
```

### Vercel Function Execution Limits

For Phase 2 serverless API routes:

| Function | Timeout Budget | Memory Budget |
|---|---|---|
| `/api/calculate/*` | < 3 s (set max 10s) | 256 MB |
| `/api/export/pdf` | < 10 s (set max 30s) | 512 MB |
| `/api/hts/*` | < 5 s (set max 10s) | 256 MB |
| `/api/health` | < 100 ms | 128 MB |

Set explicitly in `vercel.json`:

```json
{
  "functions": {
    "app/api/export/pdf/route.ts": {
      "maxDuration": 30,
      "memory": 512
    },
    "app/api/health/route.ts": {
      "maxDuration": 5
    }
  }
}
```

---

## 5. Alerting Setup

### Severity Classification

| Severity | Definition | Response Time | Who Gets Paged |
|---|---|---|---|
| **SEV1** | Platform completely down (0% availability), data corruption, financial calculation errors returning wrong results | < 15 min | Agency on-call immediately |
| **SEV2** | Major feature broken (map won't load, calculators error, PDF export failing), degraded availability > 20% of users | < 1 hr | Blake + Agency within 1 hr |
| **SEV3** | Minor feature broken (single calculator field misformatted, non-critical page 500), performance degraded but functional | < 8 hr (next business day) | Email only, no page |

### SEV1 Triggers (immediate response required)

- UptimeRobot: main URL down > 10 minutes
- Health API returning non-200
- Sentry: any calculator error producing incorrect financial output
- Vercel deployment broken, last known-good not rolled back
- HTS data completely unavailable (all lookup requests failing)

### SEV2 Triggers (1-hour response)

- Map page fails to render for > 10% of sessions (Sentry map errors spiking)
- PDF export failures > 5 in 1 hour
- Vercel Analytics LCP > 4s on calculator pages (sustained, not spike)
- UptimeRobot: any monitored URL down > 15 minutes (after initial 5-min alert)
- Build failure preventing deployment of a fix

### SEV3 Triggers (next business day)

- Individual calculator field formatting wrong
- Non-critical page (About, Contact) returning 404 or 500
- CLS score degraded on a single page
- Sentry error rate mildly elevated (< 50/hr) but not linked to critical paths
- Vercel function cold start latency spikes (not sustained)

### Alert Channels

| Channel | Used For | Setup |
|---|---|---|
| **Email** | All severities (Blake's primary) | UptimeRobot + Sentry → Blake's email |
| **Slack** | SEV1 + SEV2 (agency visibility) | UptimeRobot webhook → `#client-shipping-savior` channel |
| **SMS** | SEV1 only (can't miss it) | UptimeRobot SMS → Blake's mobile (requires paid UptimeRobot tier) |

**Alternative to paid SMS:** Use UptimeRobot's free webhook → Zapier free tier → Twilio SMS (if agency has Twilio). Or use UptimeRobot's Telegram notification (completely free) as a mobile push alternative.

### Slack Webhook Setup

In UptimeRobot → My Settings → Alert Contacts → Add Alert Contact:
- Type: Slack
- Webhook URL: `https://hooks.slack.com/services/...` (create in Slack App or channel settings)
- Friendly Name: `Shipping Savior Alerts`

In Sentry → Settings → Integrations → Slack:
- Connect workspace
- Route SEV1/SEV2 alerts to `#client-shipping-savior`

### Alert Suppression Rules

To avoid alert fatigue during known maintenance windows:

1. **Planned deployment:** Pause UptimeRobot monitors for 5 minutes before Vercel deploy (UptimeRobot dashboard → pause/resume). Deployments typically complete in 2–3 minutes.
2. **Known data refresh:** HTS dataset updates (if scheduled) — pause HTS-specific Sentry alerts for the refresh window.
3. **Flapping prevention:** UptimeRobot already requires 2 consecutive failures before alerting — no additional suppression needed for transient blips.

---

## 6. Platform Health Dashboard

### What to Display

A health dashboard surfaces the "is everything working right now" view at a glance. For Shipping Savior (Phase 1–2), a lightweight dashboard built from free tools is sufficient.

**Required metrics:**

| Metric | Source | Refresh |
|---|---|---|
| Uptime % (30-day) | UptimeRobot | Real-time |
| Average response time (ms) | UptimeRobot | 5-min |
| Current status (up/down) | UptimeRobot | Real-time |
| Deployment health | Vercel dashboard | Per deploy |
| Error rate (errors/hr) | Sentry | Real-time |
| Top error types | Sentry | Hourly |
| LCP p75 | Vercel Analytics | Daily |
| CLS p75 | Vercel Analytics | Daily |
| Bundle size trend | CI artifact (if set up) | Per deploy |

### Free Tool: UptimeRobot Public Status Page

Create at uptimerobot.com → Status Pages → Create Status Page.

Features included free:
- Custom subdomain: `status.shipping-savior.vercel.app` or `shipping-savior.statuspage.uptimerobot.com`
- Shows all monitors in a single view
- 90-day history chart per monitor
- Incident history
- Shareable with Blake (no login required to view)

**Setup:**
1. UptimeRobot dashboard → Status Pages → Create
2. Add all 4 monitors to the page
3. Name it: "Shipping Savior Platform Status"
4. Share URL with Blake as his first stop when something feels slow

### Free Tool: Sentry Performance Dashboard

Sentry's free tier includes a Performance tab with:
- Transaction duration histograms by route
- Slowest transactions ranked
- Throughput trends (requests/min)

Navigate to: sentry.io → Project → Performance → set filter to `transaction.op:navigation` to see page-level metrics.

### Free Tool: Vercel Dashboard

vercel.com → Project → Analytics tab provides:
- Real User Monitoring (RUM) for all Core Web Vitals
- Page-level breakdown (see which routes are slowest)
- Device type / browser split

**Combine these three dashboards into a "weekly health check" habit:**
Every Monday, spend 5 minutes checking:
1. UptimeRobot: any incidents in the past week?
2. Sentry: any new error categories appearing?
3. Vercel Analytics: any page with LCP > 2.5s?

### Phase 2: Internal Health Dashboard

Once the platform itself is built (Phase 2), add a `/admin/health` route that queries:

```typescript
// app/admin/health/page.tsx (server component)
export default async function HealthPage() {
  const [dbPing, redisPing] = await Promise.allSettled([
    db.execute(sql`SELECT 1`),
    redis.ping(),
  ]);
  return (
    <HealthGrid>
      <StatusCard name="Database" status={dbPing.status} />
      <StatusCard name="Cache" status={redisPing.status} />
      <StatusCard name="HTS Data" status={htsDataAge()} />
      <StatusCard name="Last Deployment" status={buildInfo()} />
    </HealthGrid>
  );
}
```

---

## 7. Runbook Templates

Runbooks are step-by-step playbooks for recovering from known failure scenarios. Each runbook has a unique ID (RB-XX) for referencing in alerts.

---

### RB-01: Platform Completely Down (SEV1)

**Trigger:** UptimeRobot alert — main URL or health API returning non-200 for > 10 minutes.

**Diagnosis Steps:**

1. Check Vercel Status page: **vercel.com/status**
   - Is there an ongoing Vercel incident? If yes: wait, monitor, tweet Vercel support @vercel.
   - If no Vercel incident: proceed to step 2.

2. Check Vercel Project → Deployments tab:
   - Is the most recent deployment marked as "Error"?
   - If yes: rollback (see RB-01-B below).
   - If deployment shows "Ready": proceed to step 3.

3. Test from a different network/device (rules out local network issue):
   ```bash
   curl -I https://shipping-savior.vercel.app/api/health
   ```
   - If 200: likely a false alarm from UptimeRobot's node. Wait 10 min and re-check.
   - If non-200: proceed to step 4.

4. Check Vercel Logs → Functions for recent error patterns.
   - Look for: `FUNCTION_INVOCATION_TIMEOUT`, `FUNCTION_PAYLOAD_TOO_LARGE`, `503 Service Unavailable`.

5. If cause unknown: Rollback to last known-good deployment (RB-01-B).

**RB-01-B: Rollback Procedure:**

```bash
# Via Vercel CLI
npx vercel rollback [deployment-url] --scope [team-scope]

# Or via dashboard:
# Vercel Dashboard → Project → Deployments → find last "Ready" deployment → "..." → Promote to Production
```

Recovery validation:
```bash
curl https://shipping-savior.vercel.app/api/health
# Expected: {"status":"ok","timestamp":"..."}
```

**Post-incident:** Log in `.planning/incidents/YYYY-MM-DD-SEV1.md` with timeline, root cause, and fix.

---

### RB-02: HTS Data Stale or Unavailable (SEV2)

**Trigger:** Sentry alert `tags.component = hts-loader` OR user reports "tariff lookup not working".

**Context:** HTS data is static JSON in `/data/`. It can become stale (tariff rates change with policy) or fail to load (file missing from deployment, JSON parse error).

**Diagnosis Steps:**

1. Test the HTS endpoint directly:
   ```bash
   curl -I https://shipping-savior.vercel.app/data/hts-chapter-01.json
   # Expected: 200 OK, Content-Type: application/json
   ```

2. If 404: the file is missing from the deployment. Check git:
   ```bash
   git log --oneline -10 -- data/hts-*.json
   # Was the file recently deleted or moved?
   ```

3. If 200 but returns malformed JSON: open Sentry for the exact parse error message and file name.

4. If load is slow (> 3s): the file may be too large. Check file size:
   ```bash
   ls -lh data/hts-*.json | sort -k5 -rh | head
   ```

**Fix Procedures:**

| Problem | Fix |
|---|---|
| File missing from deployment | Re-add file to git, commit, redeploy |
| JSON parse error | Run `node -e "JSON.parse(require('fs').readFileSync('data/hts-XX.json','utf8'))"` locally to find line |
| File too large (> 2MB) | Split by HTS chapter, implement lazy loading by section |
| Data stale (rates changed) | Download fresh dataset from hts.usitc.gov, validate schema, commit |

**How to download fresh HTS data:**
```
1. Go to: https://hts.usitc.gov/ → Download → HTS in JSON format
2. Validate: node scripts/validate-hts.js (create if doesn't exist)
3. Replace files in /data/
4. Update data-version metadata in /data/hts-metadata.json
5. Commit: git commit -m "chore: refresh HTS dataset YYYY-MM-DD"
```

**Recovery validation:** Load the HTS lookup tool, search for a known HTS code (e.g., `6109.10` - T-shirts), verify rate is returned correctly.

---

### RB-03: Map Not Loading (SEV2)

**Trigger:** Sentry alert `tags.component = route-map` spike OR user reports blank map / WebGL error.

**Context:** The route map uses deck.gl + MapLibre GL. Failures can be: WebGL not supported by the user's browser, map tiles failing to load (MapTiler free tier quota), deck.gl bundle not loaded (dynamic import failure), or CSS sizing issue.

**Diagnosis Steps:**

1. Open the map page in a fresh browser:
   - Does the map container appear but show a blank gray box? → Map tiles failing (step 2)
   - Does the map container not appear at all? → Component not mounting (step 3)
   - Does an error overlay appear? → Check browser console for exact error (step 4)

2. **Map tiles failing:**
   - Open browser DevTools → Network → filter by `tiles` or `xyz`
   - Are tile requests returning 200 or 4xx/5xx?
   - If 4xx: MapTiler free tier quota may be exhausted (5,000 map views/month on free tier)
   - Fix: Switch to free Protomaps tile hosting (self-hosted, no quota) OR use OpenStreetMap tiles temporarily

3. **Component not mounting:**
   - Check Sentry for `ChunkLoadError` — indicates the deck.gl dynamic import failed
   - This can happen if Vercel CDN has a stale edge cache serving an old chunk hash
   - Fix: Force cache invalidation via Vercel dashboard → Project → Settings → Purge Cache

4. **WebGL error in console:**
   - "WebGL not supported" → User's browser/device doesn't support WebGL2
   - Fix: Add a graceful fallback: show a static route image or SVG route diagram for non-WebGL browsers
   - This is a known issue for some corporate networks that block WebGL

5. **Deck.gl rendering error:**
   - Check Sentry for the exact deck.gl error message
   - Common cause: data passed to ArcLayer contains null coordinates or malformed port entries
   - Fix: Add null guard to all port/route data before passing to deck.gl layers

**Recovery validation:** Load the map page, verify at least 3 shipping routes render as arcs, hover over a port to verify tooltip appears.

---

### RB-04: Build Failed / Deployment Blocked (SEV2)

**Trigger:** Vercel deployment notification — build failed; no new deployment is live.

**Context:** The last successful deployment remains live (Vercel never promotes a failed build). The risk is that a bug fix or hotfix cannot be deployed while the build is broken.

**Diagnosis Steps:**

1. Open Vercel Project → Deployments → find the failed deployment → click to open build log.

2. Common build failures and fixes:

| Error in Build Log | Root Cause | Fix |
|---|---|---|
| `Module not found: Can't resolve '@/...'` | Import path typo or missing file | Fix import path locally, `npm run build` to verify |
| `Type error: ... is not assignable to type ...` | TypeScript error | Run `npx tsc --noEmit` locally, fix type errors |
| `Error: Cannot find module 'decimal.js'` | Package not in `package.json` | `npm install decimal.js --save`, commit lock file |
| `ReferenceError: document is not defined` | Client-only code in server component | Wrap in `dynamic(() => ..., { ssr: false })` or add `'use client'` |
| `Sentry upload failed` | `SENTRY_AUTH_TOKEN` not set in Vercel env | Add env var in Vercel Project Settings → Environment Variables |
| Memory heap out of range | Bundle too large during build | Check bundle analyzer, reduce imports |

3. For TypeScript errors: run `npx tsc --noEmit` locally before every commit.

4. For any error not in the table above: copy the first 10 lines of the error from build logs and search Vercel community (vercel.com/community).

**Emergency workaround if fix is complex:**
- If the failed commit introduced the regression, `git revert` it and push:
  ```bash
  git revert HEAD --no-edit
  git push origin main
  ```
- Vercel will auto-deploy the revert. Fix the original issue in a new branch.

**Recovery validation:** Vercel dashboard shows newest deployment as "Ready" with green checkmark. URL responds with 200.

---

### RB-05: Calculator Returns Incorrect Results (SEV1)

**Trigger:** Sentry alert `tags.calculator` with unexpected output, OR user (Blake) reports wrong numbers.

**Context:** Calculator errors are SEV1 because incorrect financial figures could drive wrong business decisions (tariff savings miscalculated, wrong landed cost estimate). Treat as data integrity failure.

**Diagnosis Steps:**

1. Reproduce with the exact inputs Blake provided.
2. Run the calculator function directly in a Node REPL with the same inputs:
   ```bash
   node -e "
   const { calculateLandedCost } = require('./lib/calculators/landed-cost');
   console.log(calculateLandedCost({
     unitCost: 0.10,
     dutyRate: 0.25,
     freightCost: 0.08,
     // ... other params
   }));
   "
   ```
3. Check if `decimal.js` is being used for all intermediate calculations (not native JS floats):
   ```bash
   grep -r "parseFloat\|toFixed\|Math.round" lib/calculators/
   # Any hits are potential floating-point error sources
   ```
4. Check for HTS rate mismatch (tariff rate in data vs. what user expected):
   - Verify the HTS dataset version date in `/data/hts-metadata.json`
   - Cross-reference the duty rate on hts.usitc.gov directly

**Immediate mitigation if fix takes > 1 hour:**
- Display a yellow banner on all calculator pages:
  ```
  "We are investigating a calculation issue. Results may be temporarily inaccurate.
   We'll resolve this by [time]. For urgent needs, contact [email]."
  ```

**Recovery validation:** Re-run the failing inputs, verify output matches hand-calculated expected value. Remove the banner. Commit a regression test to prevent recurrence.

---

## 8. Implementation Checklist

### Phase 1 (Immediate — pre-launch)

- [ ] Create `/app/api/health/route.ts` health endpoint
- [ ] Add `@vercel/analytics` and `@vercel/speed-insights` to `app/layout.tsx`
- [ ] Enable Vercel Analytics in project settings
- [ ] Set up UptimeRobot free account with 4 monitors
- [ ] Create UptimeRobot public status page
- [ ] Add UptimeRobot email alert for Blake's email
- [ ] Install Sentry with `@sentry/wizard` and configure `sentry.client.config.ts`
- [ ] Add `NEXT_PUBLIC_SENTRY_DSN` and `SENTRY_AUTH_TOKEN` to Vercel environment vars
- [ ] Create the 6 Sentry alert rules (Section 3)
- [ ] Add deck.gl explicit container height (prevent CLS)
- [ ] Run `ANALYZE=true npm run build` — verify deck.gl chunk < 250KB gzip
- [ ] Verify Google Search Console property claim on production domain

### Phase 2 (Post-launch, within 30 days)

- [ ] Add Sentry error boundaries to all calculator functions
- [ ] Add `timedCalculate()` wrapper in development builds
- [ ] Create `/admin/health` internal dashboard route
- [ ] Set up Slack alert webhook for `#client-shipping-savior`
- [ ] Write HTS data refresh script (`scripts/refresh-hts.sh`)
- [ ] Document current HTS dataset date in `README.md`

### Phase 3 (Ongoing — quarterly)

- [ ] Review Sentry error trends — are any new categories emerging?
- [ ] Check bundle size against limits — has a new dependency inflated the bundle?
- [ ] Refresh HTS dataset (US tariff schedule updates irregularly — check USITC for notices)
- [ ] Review UptimeRobot history — any patterns in downtime timing?
- [ ] Run Lighthouse audit on map and calculator pages — verify CWV targets still met

---

*Document created: 2026-03-26*
*Linear: AI-5415*
*Next review: When Phase 2 DB/Redis is added (update RB-01 and health endpoint)*

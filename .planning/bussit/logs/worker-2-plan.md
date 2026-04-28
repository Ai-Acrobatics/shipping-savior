# Worker 2 Plan — AI-8781 Production Hardening (Foundation)

## Scope (in this worker)
- **A. Sentry monitoring** — install @sentry/nextjs, create config files, wrap next.config.mjs
- **C. Security headers** — CSP, HSTS, frame-options, etc. in next.config headers()
- **D. Build hygiene** — remove ignoreBuildErrors / ignoreDuringBuilds; fix surfacing TS errors
- **H. Health endpoint** — GET /api/health with DB ping

## Out of scope (skipped, needs Julian/account)
- B. Custom domain (DNS)
- E. Database backups (manual restore drill)
- F. Status page (3rd party account)
- G. Rate limiting (Upstash / Vercel firewall)
- I. Logs aggregation (Axiom/BetterStack)

## Execution order
1. Read codebase → understand db import shape, current next.config.mjs, app structure
2. Install @sentry/nextjs
3. Create sentry.client.config.ts, sentry.server.config.ts, sentry.edge.config.ts, instrumentation.ts
4. Wrap next.config.mjs with withSentryConfig + add headers() + remove ignoreBuildErrors flags
5. Run `npm run build` — fix TS errors as they surface
6. Add src/app/api/health/route.ts
7. Final build pass
8. Commit per logical chunk
9. Push branch

## Coordination boundaries
- I own: next.config.mjs, sentry.*.config.ts, instrumentation.ts, src/app/api/health/route.ts
- I do NOT touch: src/lib/data/dashboard.ts (W1), src/app/knowledge-base/* (W3), content/kb/* (W3)
- For TS errors in W1/W3 territory — minimal `as any` cast + TODO if necessary

## Commits
- `chore(infra): AI-8781 wire Sentry + sourcemap upload`
- `feat(infra): AI-8781 add security headers`
- `fix(types): AI-8781 enable strict TS build`
- `feat(api): AI-8781 add /api/health endpoint`

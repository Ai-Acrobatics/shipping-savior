# Worker 6 Plan — AI-8780 Trust & Compliance Foundation

## Scope (this worker — 8 of 9 sub-areas)
- 1: Privacy Policy at /privacy (DRAFT — flagged for human review)
- 2: Terms of Service at /terms (DRAFT — flagged for human review)
- 4: Cookie consent banner component + layout mount
- 5: Footer links across home / auth / dashboard layouts
- 6: GDPR data export `GET /api/account/export`
- 7: Account deletion `POST /api/account/delete`
- 8: Sub-processors page at /sub-processors
- 9: Security page at /security

## Skip
- 3: DPA at /dpa — placeholder page only ("Available on request — contact sales") because needs lawyer review (enterprise-only)

## HUMAN REVIEW REQUIRED — flagged for Julian + lawyer
ALL `<!-- TODO: review -->` HTML comments must be preserved through commit. Items needing review:
- Privacy policy text — every section
- Terms of service text — every section, especially SLA, liability cap, governing law
- Sub-processor list completeness (verify all sub-processors are listed)
- Email addresses: `privacy@shippingsavior.com`, `security@shippingsavior.com` — NEED ROUTING (depends on AI-8784)
- Penetration test pledge ("annual once revenue > $100K ARR") — public commitment, confirm Julian+lawyer agree
- Stripe subscription cancellation in /api/account/delete — TODO comment until AI-8777 wires Stripe
- Confirmation email after deletion — TODO comment until AI-8776 wires Resend
- DPA placeholder text (sales@shippingsavior.com routing)

## Implementation Order
1. Privacy Policy (`/privacy`)
2. Terms of Service (`/terms`)
3. DPA placeholder (`/dpa`)
4. Sub-processors page (`/sub-processors`)
5. Security page (`/security`)
6. Cookie consent banner component
7. Mount banner in root layout (small client wrapper)
8. Footer link additions — home page (3 layouts surgically)
9. ZIP library decision: use `jszip` (zero native deps; lighter than archiver in serverless)
10. GDPR data export endpoint
11. Account deletion endpoint
12. Verify: `npm run build` && `npx tsc --noEmit`

## Files I will create
- ADD: `src/app/privacy/page.tsx`
- ADD: `src/app/terms/page.tsx`
- ADD: `src/app/dpa/page.tsx` (placeholder)
- ADD: `src/app/sub-processors/page.tsx`
- ADD: `src/app/security/page.tsx`
- ADD: `src/components/CookieConsent.tsx` (client component)
- ADD: `src/components/LegalFooter.tsx` (shared footer link component for auth + dashboard)
- ADD: `src/app/api/account/export/route.ts`
- ADD: `src/app/api/account/delete/route.ts`
- ADD: `src/lib/legal/last-updated.ts` (single source of truth for "last updated" date)

## Files I will edit (small surgical edits)
- EDIT: `src/app/layout.tsx` (mount CookieConsent client component)
- EDIT: `src/app/page.tsx` (add legal links to footer "Company" column or new "Legal" column)
- EDIT: `src/app/(auth)/layout.tsx` (add minimal footer)
- EDIT: `src/components/dashboard/DashboardLayout.tsx` (add minimal footer)
- EDIT: `package.json` (add `jszip`)

## Coordination — what I will NOT touch
- `src/app/contact/`, `src/components/cal/`, `src/lib/analytics/` (Worker 4)
- `vitest.config.ts`, `playwright.config.ts`, `e2e/`, `*.test.ts` (Worker 5)
- `src/app/(auth)/*` beyond layout.tsx footer (auth-owning workers)
- `src/lib/auth/` beyond reading
- `src/(platform)/PlatformShell.tsx` — adding a footer in the dashboard layout instead since dashboard layout is the dashboard footer scope

## Cookie consent contract with Worker 4 (PostHog gate)
- localStorage key: `ss_cookie_consent`
- Cookie name: `cookie_consent` (server-readable)
- Values: `'all'` | `'essential'` | `'custom-json'` (where custom-json is `{"essential":true,"analytics":bool,"marketing":bool}`)
- Accept all → analytics ENABLED
- Reject non-essential / Customize without analytics → analytics DISABLED
- Geo: show banner only if `Accept-Language` indicates EU OR `?eu=1` query param. Otherwise default-set `'essential'` silently.

## Verification gates
```bash
npm run build
npx tsc --noEmit
```

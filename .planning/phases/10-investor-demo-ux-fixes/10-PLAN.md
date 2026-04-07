# Plan: Phase 10 — Investor Demo UX Fixes

---
wave: 3
depends_on: []
files_modified:
  - src/app/login/page.tsx
  - src/app/page.tsx
  - src/components/Header.tsx
  - src/app/layout.tsx
  - src/app/robots.ts
  - src/app/sitemap.xml/route.ts
  - public/images/og-image.png
autonomous: true
---

## Goal
Fix all critical and high-severity UX issues identified in the April 7 audit before Blake's visit (April 14) and investor demo (May 11).

## Tasks

<task id="10.1" effort="2h">
<title>Fix /login and /platform routes</title>
<description>
The /login route currently returns 404 and /platform redirects to the broken /login.

Fix:
1. Create `src/app/login/page.tsx` if missing — proper login form matching the platform's dark theme
2. Ensure /platform routes work with auth middleware
3. If user is not authenticated, redirect to /login (which now works)
4. If user IS authenticated, /login redirects to /platform/dashboard

Check existing auth setup in `src/app/api/auth/` and NextAuth config.
</description>
</task>

<task id="10.2" effort="1h">
<title>Update dashboard dates from 2024 to 2026</title>
<description>
The dashboard has hardcoded dates showing "Apr 2024" and "Mar 2024" which are 2 years stale.

Search all files in `src/` for hardcoded 2024 dates and update to current (2026):
- Shipment dates → March-April 2026
- Chart data → Recent 6 months (Oct 2025 - Apr 2026)
- Any "last updated" timestamps

Use grep to find all instances: `grep -r "2024" src/ --include="*.ts" --include="*.tsx"`
</description>
</task>

<task id="10.3" effort="2h">
<title>Reduce navigation to 5-6 items</title>
<description>
Current nav has 11 items: Platform, Calculators, FTZ Strategy, Wireframes, Pricing, Knowledge Base, Data Intelligence, Architecture, Phases, Proposal, Live Demo.

Reduce to 6 investor-focused items:
1. Platform (or "Dashboard") → /platform
2. Calculators → /#calculators anchor
3. Carrier Intelligence → /platform/carrier-discovery (new from Phase 7)
4. Contracts → /platform/contracts (new from Phase 9)
5. Pricing → /#pricing anchor
6. Live Demo → /dashboard

Move removed items to a "More" dropdown or footer links:
- Knowledge Base, Data Intelligence, Architecture, Phases, Wireframes → footer or dropdown

Edit `src/components/Header.tsx` (or wherever nav is defined).
</description>
</task>

<task id="10.4" effort="1h">
<title>Server-render hero stat counters</title>
<description>
Hero stats (HTS Codes, Ports Mapped, FTZ Zones, API Cost) are empty on server render — they only appear after client-side JS animation loads.

Fix: Ensure stat values are in the initial HTML. Either:
1. Remove animation and show static values, or
2. Set initial values in the server-rendered HTML and animate from there

Values to display: 200+ HTS Codes, 3,700+ Ports, 260+ FTZ Zones.
</description>
</task>

<task id="10.5" effort="1h">
<title>Add OG image, robots.txt, sitemap.xml</title>
<description>
1. Create OG image (1200x630px) — can be a simple branded card with:
   - "Shipping Savior" title
   - "AI-Powered Global Trade Intelligence" tagline
   - Dark navy background with gradient
   Save to `public/images/og-image.png`

2. Add og:image meta tag to `src/app/layout.tsx` metadata

3. Create `src/app/robots.ts` (Next.js robots file):
   - Allow all crawlers
   - Point to sitemap

4. Create `src/app/sitemap.xml/route.ts`:
   - List main public pages
   - Exclude /platform/* (auth-gated)

5. Update twitter:card to "summary_large_image" in layout metadata
</description>
</task>

## Verification
- [ ] /login renders a working login form (not 404)
- [ ] /platform redirects to /login if unauthenticated, shows dashboard if authenticated
- [ ] No dates showing 2024 anywhere in the dashboard
- [ ] Nav has exactly 5-6 items (not 11)
- [ ] Hero stats visible on initial page load (view source shows numbers)
- [ ] /robots.txt returns valid robots file
- [ ] /sitemap.xml returns valid sitemap
- [ ] Sharing URL on Slack/Twitter shows OG image preview
- [ ] `npm run build` succeeds

## must_haves
- No 404s on any linked page during investor demo
- Dashboard looks current (2026 dates)
- Navigation is clean and focused
- Link sharing shows branded preview image

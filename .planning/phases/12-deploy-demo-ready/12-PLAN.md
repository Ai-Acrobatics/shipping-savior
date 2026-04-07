# Plan: Phase 12 — Deploy & Demo Ready

---
wave: 4
depends_on: [8, 10, 11]
files_modified:
  - src/app/page.tsx
  - src/components/platform/Sidebar.tsx
autonomous: true
---

## Goal
Final integration, testing, and production deployment. Platform ready for May 11 investor pitch with no broken pages or friction.

## Tasks

<task id="12.1" effort="2h">
<title>Integration pass — wire new features into platform</title>
<description>
Ensure all new features from phases 6-11 are accessible:

1. Sidebar navigation update:
   - Add "Carrier Discovery" link → /platform/carrier-discovery
   - Add "Contracts" link → /platform/contracts
   - Keep: Dashboard, Calculators, History, Settings

2. Homepage updates:
   - Link hero CTA to /demo (guided walkthrough)
   - Update "Schedule a Demo" buttons to link to /demo
   - Replace old pricing section link with /pricing

3. AI Chatbot tool updates:
   - Add `search_schedules` tool (queries Phase 6 API)
   - Add `compare_carriers` tool (queries Phase 7 API)
   - Add `check_contract` tool (queries Phase 9 API)

4. Cross-link all new pages (carrier discovery → comparison → contracts)
</description>
</task>

<task id="12.2" effort="2h" depends_on="12.1">
<title>End-to-end demo flow testing</title>
<description>
Test the complete 5-minute investor demo flow:

1. Homepage → "See Demo" CTA → /demo page
2. Scenario 1: Qingdao → LA (carrier comparison, FTZ savings)
3. Scenario 2: Wainimi cross-dock (drayage cost savings)
4. Scenario 3: Jones Act Hawaii (domestic carrier comparison)
5. Scenario 4: Chiquita backhaul (export program)
6. Demo → Pricing page (tiers, per-user bundles)
7. Navigate to /platform/dashboard (show real analytics)
8. Carrier Discovery: search Qingdao → LA, compare 3 carriers
9. Contracts: show Lane visibility, tariff alert
10. AI Chatbot: ask "What's the fastest carrier from Qingdao to LA?"

Verify:
- No 404s on any click
- No loading skeletons visible for more than 1 second
- All data is current (2026 dates)
- Mobile responsive at each step
- No console errors
</description>
</task>

<task id="12.3" effort="1h" depends_on="12.2">
<title>Production build and deploy</title>
<description>
Final production deployment:

1. Run `npm run build` — fix any TypeScript errors
2. Run `npx vercel build --prod`
3. Deploy: `npx vercel deploy --prebuilt --prod --yes --scope ai-acrobatics --token $VERCEL_TOKEN`
4. Verify live site: shipping-savior.vercel.app
5. Test all 4 demo scenarios on production
6. Test /login, /platform, /demo, /pricing, /jv-agreement on production
7. Share final production URLs with Blake via text
</description>
</task>

<task id="12.4" effort="1h" depends_on="12.3">
<title>Pre-load demo data and final polish</title>
<description>
Ensure all demo data is in place for the pitch:

1. Verify Qingdao → LA schedule data renders
2. Verify Port of Wainimi carrier data renders
3. Verify Jones Act carriers (Matson, Pasha) render for Hawaii routes
4. Verify contract demo data (Kingsco, Hall Pass, Matson) loads
5. Verify reliability scores display on all carrier views
6. Screenshot key pages for offline backup (in case of connectivity issues)
7. Create PDF export of carrier comparison for offline demo

Send Blake the final production link + demo flow instructions.
</description>
</task>

## Verification
- [ ] Complete demo flow works start to finish (10 clicks, no errors)
- [ ] All 4 demo scenarios render with realistic data
- [ ] /login, /platform, /demo, /pricing all work
- [ ] AI chatbot can answer carrier/schedule questions
- [ ] Production deployment successful at shipping-savior.vercel.app
- [ ] Mobile responsive across demo flow
- [ ] Blake receives production link and confirms access

## must_haves
- Zero 404s during investor demo
- 5-minute guided walkthrough works smoothly
- All demo data is realistic and current
- Platform deployed to production before May 8

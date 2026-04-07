# Plan: Phase 11 — Demo Scenarios & Pricing Page

---
wave: 3
depends_on: [7, 8, 9]
files_modified:
  - src/app/demo/page.tsx
  - src/components/platform/DemoWalkthrough.tsx
  - src/lib/data/demo-scenarios.ts
  - src/app/pricing/page.tsx
  - src/components/PricingTiers.tsx
autonomous: true
---

## Goal
Create 4 pre-loaded demo scenarios for the investor pitch and a B2B tiered pricing page based on Blake's pricing model discussion.

## Tasks

<task id="11.1" effort="3h">
<title>Build demo scenario data</title>
<description>
Create `src/lib/data/demo-scenarios.ts` with 4 investor pitch scenarios:

**Scenario 1: "Ocean Freight — Asia to West Coast"**
- Route: Qingdao, China → Port of Los Angeles
- Carriers: Maersk (32 days, 75% reliable), MSC (34 days, 68%), CMA CGM (31 days, 72%)
- Landed cost: $4,850/container (showing FTZ savings of $1,200)
- Use case: "Compare carriers for your next Asia shipment"

**Scenario 2: "Cross-Dock — Trader Joe's Supply Chain"**
- Route: Port of Wainimi → Palmdale/Lancaster (Trader Joe's DC)
- Carriers: Hall Pass drayage (70 miles via 126/Fillmore bypass)
- Comparison: vs San Diego route (through LA traffic, 150+ miles)
- Savings: $350/load + 3 hours transit time
- Use case: "Optimize last-mile from port to distribution center"

**Scenario 3: "Jones Act — Domestic Hawaii"**
- Route: Los Angeles → Honolulu
- Carriers: Matson (5 days, 85% reliable), Pasha Hawaii (6 days, 82%)
- No customs/duties (domestic move)
- Use case: "American flag vessel comparison for domestic routes"

**Scenario 4: "Backhaul — European Export Program"**
- Route: Netherlands (Rotterdam) → Central America (Puerto Barrios, Guatemala)
- Carrier: Great White Fleet (Chiquita)
- Volume: 6M lbs in 8 weeks (150 loads)
- Use case: "Fill empty backhaul containers to reduce per-unit cost"

Each scenario includes: title, description, route, carriers, key_metric, insight, cta.
</description>
</task>

<task id="11.2" effort="4h" depends_on="11.1">
<title>Build guided demo walkthrough page</title>
<description>
Create `/demo` page with `DemoWalkthrough` component:

UI flow:
1. Landing: "Shipping Savior — Live Demo" with 4 scenario cards
2. User clicks a scenario → expands to show:
   - Route map (origin → destination with line)
   - Carrier comparison table (from Phase 7/8 data)
   - Key insight callout (savings, time, reliability)
   - "Try it yourself" button → links to relevant calculator/tool
3. Navigation: Previous / Next between scenarios
4. Progress indicator showing 1/4, 2/4, etc.
5. Final screen: CTA → "Ready to optimize your supply chain?" → Pricing page

Design: Full-width dark theme, immersive feel, minimal chrome.
No auth required (public page for investor demo).
</description>
</task>

<task id="11.3" effort="3h">
<title>Build tiered pricing page</title>
<description>
Create `/pricing` page (replace existing broken pricing section):

**Free Tier — "Explorer"**
- 1 user
- Basic schedule search (limited to 10/day)
- 3 calculator uses per month
- Community support
- Ads/sponsor content
- Price: $0

**Premium Tier — "Navigator"** (RECOMMENDED badge)
- Up to 8 users
- Unlimited schedule search
- Full carrier comparison + reliability scores
- Contract management (up to 10 contracts)
- PDF exports
- Email support
- Price: $299/month (or $249/mo annual)

**Enterprise Tier — "Commander"**
- Up to 20+ users (custom bundles)
- Everything in Premium
- Unlimited contracts
- API access
- Custom integrations
- Dedicated account manager
- White-label option for NVOCCs
- Price: "Contact Sales"

Include:
- Feature comparison matrix (table with checkmarks)
- Value prop banner: "The cost of incomplete information exceeds the cost of our platform"
- FAQ section addressing B2B concerns
- "Contact Sales" CTA (Calendly link or form, NOT fake "Start Free Trial")
- Per-user bundle callout: "Need more seats? Bundles available for 8, 20, or unlimited users"
</description>
</task>

<task id="11.4" effort="2h" depends_on="11.2">
<title>Add industry vertical selector</title>
<description>
Add industry context to the demo and platform:

Create a simple industry selector component that appears on the demo page and dashboard:
- Cold Chain (produce, frozen, pharma) — Blake's expertise
- Automotive (parts, vehicles)
- Personal Care (cosmetics, health)
- General Cargo (mixed goods)
- E-Commerce (marketplace fulfillment)

Each selection adjusts:
- Demo scenario emphasis (cold chain shows temp-controlled features)
- Terminology (reefer vs container, etc.)
- Featured ports and routes relevant to that vertical

This is a cosmetic/contextual change only — no backend logic needed.
Store selection in localStorage.
</description>
</task>

## Verification
- [ ] /demo page loads with 4 scenario cards
- [ ] Each scenario shows route, carriers, key metric, and insight
- [ ] Demo walkthrough navigates between scenarios smoothly
- [ ] /pricing page shows 3 tiers with feature comparison
- [ ] "Contact Sales" buttons work (Calendly or mailto)
- [ ] No "Start Free Trial" CTAs (replaced with proper B2B CTAs)
- [ ] Industry selector persists between page loads
- [ ] `npm run build` succeeds

## must_haves
- 4 demo scenarios with data from Blake's real use cases
- Guided walkthrough flows without friction for 5-minute investor demo
- Pricing page reflects B2B model (not consumer SaaS)
- Per-user bundle pricing clearly communicated

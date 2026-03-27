# PRD-01: Landing / Proposal Page

**Status:** Draft
**Priority:** P0 (First page built)
**Route:** `/` (root)
**Last Updated:** 2026-03-26

---

## 1. Overview & Purpose

The landing page is the primary proposal and presentation surface for the Shipping Savior logistics platform. It communicates the platform vision to potential partners, investors, and the founder's existing network. It must convey credibility, domain expertise, and technical sophistication in a single scrollable experience.

This is NOT a marketing landing page for end users. It is a proposal document rendered as an interactive website -- designed to be walked through in a meeting or shared via URL.

---

## 2. User Stories

| ID | As a... | I want to... | So that... |
|----|---------|-------------|------------|
| US-01-01 | Potential partner | See the platform's capabilities at a glance | I can evaluate whether to invest or collaborate |
| US-01-02 | Potential partner | Interact with a live calculator demo | I understand the tools are real, not just mockups |
| US-01-03 | Investor | See the revenue model and unit economics | I can assess the business viability |
| US-01-04 | Founder | Walk through the page in a meeting | I have a polished presentation tool |
| US-01-05 | Visitor | Navigate to deeper tool pages | I can explore specific capabilities in detail |
| US-01-06 | Mobile visitor | View the page on a tablet during a meeting | The experience is not broken on non-desktop devices |

---

## 3. Functional Requirements

### 3.1 Hero Section

- **Headline:** Bold value proposition communicating cold chain + SE Asia import expertise
- **Subheadline:** One-liner describing the platform (e.g., "End-to-end logistics intelligence from origin to retail shelf")
- **Primary CTA:** Scroll to calculator demo or navigate to Unit Economics tool
- **Secondary CTA:** Link to full dashboard/tools
- **Background:** Subtle animated gradient or shipping-themed visual (NOT a stock photo of containers)
- **Stats bar immediately below hero:** 3-4 key metrics
  - e.g., "96% cold chain terminal volume" / "500K+ units per container" / "5 SE Asia markets" / "$0.10 origin to $5.00 retail"

### 3.2 Feature Grid

- Grid of 6-8 platform capabilities, each as a card with:
  - Icon (Lucide or custom SVG)
  - Title (e.g., "Landed Cost Calculator", "FTZ Savings Analyzer")
  - 1-2 sentence description
  - Link to the full tool page
- Cards should use hover effects (subtle scale + shadow)
- Grid layout: 2 columns on mobile, 3 columns on tablet, 4 columns on desktop

### 3.3 Live Calculator Demo

- Embedded mini version of the Unit Economics calculator (PRD-02)
- Pre-populated with the canonical example: $0.10 origin -> $0.50 landed -> $2.00 wholesale -> $5.00 retail
- Sliders for unit cost, units per container, and markup
- Real-time output showing landed cost per unit, container profit, and retail margin
- "Open Full Calculator" CTA linking to `/tools/unit-economics`
- Must use `decimal.js` for all arithmetic (Pitfall 1)

### 3.4 Import Pipeline Visualization

- Horizontal or vertical flow diagram showing the 6-step import process:
  1. Source product (SE Asia)
  2. Negotiate & purchase (FOB terms)
  3. Ship to US port (container logistics)
  4. Clear customs (HTS classification, duty payment)
  5. Enter FTZ or fulfill directly
  6. Sell to end buyer (wholesale/retail)
- Each step should be clickable, expanding to show 2-3 bullet points of detail
- Visual style: connected nodes with progress-line animation on scroll

### 3.5 Hidden Costs Breakdown

- Section exposing the costs importers commonly miss:
  - Customs broker fees ($150-$250 per entry)
  - ISF filing penalties ($5,000 per violation)
  - Demurrage/detention ($150-$300/day after free time)
  - Container drayage ($500-$1,500 per container)
  - Exam fees ($300-$1,000 if CBP selects for inspection)
  - Warehouse handling ($0.15-$0.50 per unit)
- Display as an expanding accordion or animated reveal
- Each cost should show a range and brief explanation

### 3.6 FTZ Strategy Section

- Explanation of the Foreign Trade Zone advantage:
  - Lock duty rates on date of entry
  - Incremental withdrawal (pay duties only on what leaves)
  - Duties on FOB value (origin price), NOT retail value
- Visual: Before/after comparison showing cost savings
- Link to full FTZ Analyzer tool (PRD-03)
- Must include disclaimer: "For informational purposes only. FTZ status elections may be irrevocable. Consult a licensed customs broker."

### 3.7 Architecture Overview

- High-level system diagram showing platform components:
  - Data layer (HTS codes, ports, routes, FTZ data)
  - Calculator engine (landed cost, unit economics, FTZ savings)
  - Visualization layer (maps, charts, dashboards)
  - Export layer (PDF reports, shareable URLs)
- Rendered as a clean diagram (Mermaid or custom SVG), not a screenshot
- Purpose: Demonstrate technical depth to technical partners/investors

### 3.8 Roadmap Section

- Timeline showing Phase 1 (Proposal + Calculators) -> Phase 2 (Live Integrations) -> Phase 3 (SaaS Platform)
- Each phase shows 3-4 key deliverables
- Current phase highlighted
- Visual: Horizontal timeline with milestone markers

### 3.9 Competitive Advantages

- Grid or list of differentiators vs. existing platforms (Freightos, Flexport, Xeneta):
  - FTZ-native strategy (competitors ignore FTZ optimization)
  - Cold chain specialization (96% terminal volume)
  - SE Asia sourcing focus (not just China)
  - Unit economics transparency (origin to retail, not just freight)
  - No per-query API fees (local calculation engine)

### 3.10 Navigation & Footer

- Sticky top navigation with links to: Tools, Map, Dashboard, Knowledge Base
- Footer with: Contact info, disclaimer, copyright
- Smooth scroll between sections with section anchor links

---

## 4. Non-Functional Requirements

| Requirement | Target | Notes |
|-------------|--------|-------|
| First Contentful Paint | < 1.5s | Server components for all static content |
| Largest Contentful Paint | < 2.5s | Hero image/gradient must not block LCP |
| Cumulative Layout Shift | < 0.1 | No layout shifts from calculator loading |
| Total Page Weight | < 500KB initial | Lazy-load calculator and map sections |
| Accessibility | WCAG 2.1 AA | All interactive elements keyboard-navigable, proper heading hierarchy |
| Responsive | 375px - 2560px | Must work on tablet (1024px) for meeting use case |

---

## 5. Data Requirements

- No external data fetching on this page
- Calculator demo inputs: hardcoded defaults from PROJECT.md context
  - Unit cost origin: $0.10
  - Units per container: 500,000
  - Container shipping cost: $3,500
  - Duty rate: 6.5%
  - Wholesale price: $2.00
  - Retail price: $5.00
- Stats bar numbers: sourced from founder context (96% terminal volume, etc.)

---

## 6. UI/UX Specifications

- **Design language:** Premium, dark-themed proposal aesthetic (similar to done-with-debt template)
- **Color palette:** Deep navy/slate background, accent blue for CTAs, white/light gray text
- **Typography:** Inter or similar clean sans-serif, large headings (48-72px hero), readable body (16-18px)
- **Scroll animations:** Sections fade/slide in on scroll using Intersection Observer (NOT heavy animation libraries)
- **Calculator demo:** Contained in a "glass card" with subtle backdrop-blur
- **Mobile:** Sections stack vertically, feature grid collapses to 1-2 columns, calculator remains usable

---

## 7. Technical Implementation Notes

### Component Breakdown

```
app/page.tsx                          # Server component - page layout
components/landing/
  HeroSection.tsx                     # Server component
  StatsBar.tsx                        # Server component
  FeatureGrid.tsx                     # Server component
  CalculatorDemo.tsx                  # Client component ("use client")
  ImportPipeline.tsx                  # Client component (scroll animations)
  HiddenCosts.tsx                     # Client component (accordion)
  FTZStrategy.tsx                     # Server component with client sub-components
  ArchitectureDiagram.tsx             # Server component (SVG/Mermaid)
  RoadmapTimeline.tsx                 # Server component
  CompetitiveAdvantages.tsx           # Server component
```

### Key Decisions

- `page.tsx` is a Server Component that composes all sections
- Only `CalculatorDemo`, `ImportPipeline`, and `HiddenCosts` need `"use client"` (interactivity)
- Scroll animations via a lightweight `ScrollReveal` wrapper using Intersection Observer
- Calculator demo reuses calculation logic from `/lib/calculators/unit-economics.ts` (shared with PRD-02)
- No Zustand store needed on this page -- calculator demo state is local React state

### Dependencies

- `decimal.js` for calculator demo arithmetic
- `lucide-react` for feature grid icons
- Shared `/lib/calculators/unit-economics.ts` (developed in PRD-02, reused here)

---

## 8. Acceptance Criteria

| ID | Criterion | Verification |
|----|-----------|-------------|
| AC-01-01 | All 10 sections render without errors on desktop and tablet | Visual inspection at 1440px and 1024px |
| AC-01-02 | Calculator demo updates results in real-time when inputs change | Adjust slider, verify output changes within 100ms |
| AC-01-03 | Calculator demo uses decimal.js (no native floating-point) | Code review of CalculatorDemo.tsx |
| AC-01-04 | All feature grid cards link to correct tool pages | Click each card, verify navigation |
| AC-01-05 | Scroll animations trigger on viewport entry, not on page load | Scroll slowly, verify sections animate in |
| AC-01-06 | FTZ section includes compliance disclaimer | Visual inspection |
| AC-01-07 | Page loads in < 2s on 4G throttle | Lighthouse audit |
| AC-01-08 | All numbers display with units (USD, %, days, etc.) | Visual inspection (Pitfall 12) |
| AC-01-09 | Responsive layout works at 375px, 768px, 1024px, 1440px | Browser DevTools responsive mode |
| AC-01-10 | Navigation links scroll to correct sections | Click each nav item |

---

## 9. Dependencies

| Dependency | Type | PRD |
|-----------|------|-----|
| Unit economics calculator logic | Code reuse | PRD-02 |
| FTZ savings summary data | Content reference | PRD-03 |
| Feature descriptions match tool capabilities | Content alignment | PRD-02 through PRD-08 |

---

## 10. Known Pitfalls (from PITFALLS.md)

| Pitfall | Relevance | Mitigation |
|---------|-----------|------------|
| Pitfall 1: Floating-point arithmetic | Calculator demo on this page | Use decimal.js for all demo calculations |
| Pitfall 11: Overloading the dashboard | Risk of cramming too much into landing page | Each section is focused; deep tools are on separate pages |
| Pitfall 12: Missing units and labels | All displayed numbers | Every number has a unit label (USD, %, units, days) |

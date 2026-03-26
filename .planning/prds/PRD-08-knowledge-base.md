# PRD-08: Knowledge Base

**Status:** Draft
**Priority:** P2
**Route:** `/knowledge`
**Last Updated:** 2026-03-26

---

## 1. Overview & Purpose

The Knowledge Base documents the end-to-end import process, FTZ operations, compliance requirements, and documentation needs for international shipping. It serves as both a reference for the founder's team and a demonstration of domain expertise for partners and investors.

All content is educational and informational. It must include proper disclaimers and link to official sources. It does NOT provide legal, customs, or trade compliance advice.

---

## 2. User Stories

| ID | As a... | I want to... | So that... |
|----|---------|-------------|------------|
| US-08-01 | New team member | Read a step-by-step guide to the import process | I understand the workflow end to end |
| US-08-02 | Importer | Find the documentation required for my shipment type | I don't miss a required document |
| US-08-03 | Operations staff | Access compliance checklists by product category | I ensure every shipment meets requirements |
| US-08-04 | Importer | Understand FTZ benefits and procedures | I can evaluate whether FTZ is right for my goods |
| US-08-05 | Visitor | Search across all knowledge base articles | I can find specific information quickly |
| US-08-06 | Partner | See the depth of domain knowledge | I'm confident in the team's expertise |

---

## 3. Functional Requirements

### 3.1 Article Structure

The knowledge base is organized into 4 main sections:

#### Section 1: Import Process Flow (6 Steps)

| Step | Title | Key Content |
|------|-------|-------------|
| 1 | Sourcing & Purchase | Negotiating with SE Asia suppliers, FOB/CIF/DDP terms, purchase order requirements |
| 2 | Documentation & ISF Filing | ISF filing (24 hours before vessel departure), commercial invoice, packing list, BOL |
| 3 | Ocean Transit | Booking, vessel tracking, transshipment, transit times by route |
| 4 | US Customs Clearance | CBP entry process, duty payment, exam holds, customs broker role |
| 5 | FTZ Entry or Direct Delivery | FTZ admission process, PF/NPF election, direct delivery to warehouse |
| 6 | Fulfillment & Sale | 3PL operations, pick/pack/ship, channel distribution |

Each step is a separate article page with:
- Overview (2-3 paragraphs)
- Step-by-step procedure
- Required documents for this step
- Common mistakes / things to watch for
- Timeline estimates
- Links to related tools (calculators, map)
- Links to official sources

#### Section 2: FTZ Guide

| Article | Content |
|---------|---------|
| What is a Foreign Trade Zone? | Overview, history, legal basis (19 U.S.C. 81a-81u) |
| FTZ Benefits for Importers | Duty deferral, duty elimination on re-exports, inverted tariff, zone-to-zone transfers |
| PF vs NPF Status Explained | When to choose each, irrevocability warning, examples |
| FTZ Application Process | How to apply, timeline, costs, zone operators |
| FTZ Compliance Requirements | Record-keeping, CBP oversight, annual reports |
| FTZ and Tariff Strategy | Duty locking, April 2025 executive order implications, scenario planning |

#### Section 3: Compliance Checklists

Interactive checklists (checkboxes that persist in localStorage):

| Checklist | Items |
|-----------|-------|
| General Cargo Import Checklist | 15-20 items covering all steps from sourcing to delivery |
| Cold Chain Import Checklist | Adds temperature monitoring, USDA/FDA requirements, phytosanitary certificates |
| Apparel Import Checklist | Fiber content labeling, country of origin marking, CPSIA (children's products) |
| Food/CPG Import Checklist | FDA prior notice, food facility registration, labeling requirements |
| FTZ Admission Checklist | Zone entry requirements, documentation, election forms |

Each checklist:
- Checkbox items with expandable detail
- Progress indicator (X of Y complete)
- "Reset" button to clear all checks
- State persisted in localStorage (not server)

#### Section 4: Documentation Matrix

Reference table showing which documents are required at each step:

| Document | Sourcing | ISF | Transit | Customs | FTZ | Fulfillment |
|----------|---------|-----|---------|---------|-----|-------------|
| Purchase Order | Required | - | - | - | - | - |
| Commercial Invoice | Required | Required | Required | Required | Required | - |
| Packing List | - | Required | Required | Required | Required | Required |
| Bill of Lading | - | - | Required | Required | Required | - |
| ISF (10+2) | - | Required | - | - | - | - |
| CBP Entry Summary (7501) | - | - | - | Required | - | - |
| FTZ Admission Form | - | - | - | - | Required | - |
| Certificate of Origin | - | - | - | Required* | - | - |
| Phytosanitary Certificate | - | - | - | Required* | - | - |

*Required only for certain product types

- Sortable/filterable by step or by document
- Clicking a document name opens a detail panel explaining what it is, who prepares it, and common mistakes
- Export as PDF checklist

### 3.2 Search

- Full-text search across all knowledge base articles
- Search bar at top of knowledge base index page
- Results show: article title, section, matching excerpt with highlighted terms
- Search implemented via FlexSearch index built at build time from article content
- Minimum 2 characters to search

### 3.3 Navigation

- **Sidebar:** Persistent sidebar (desktop) or hamburger menu (mobile) with:
  - Section headers (Import Process, FTZ Guide, Compliance, Documents)
  - Individual article links under each section
  - Active article highlighted
  - "Back to Knowledge Base" link at top
- **Breadcrumbs:** "Knowledge Base > FTZ Guide > PF vs NPF Status Explained"
- **Previous/Next navigation:** At bottom of each article, links to adjacent articles in the section

### 3.4 Content Styling

- Articles rendered from MDX or structured data (not hardcoded JSX)
- Consistent styling: headings (h2, h3), body text, callout boxes (info, warning, tip), tables, bullet lists
- **Callout types:**
  - **Info (blue):** General helpful information
  - **Warning (amber):** Common mistakes, compliance risks
  - **Tip (green):** Best practices, cost-saving advice
  - **Danger (red):** Legal/compliance requirements, penalties

### 3.5 Disclaimers

Every article and every page in the knowledge base must include:

1. **Page-level disclaimer (top):** "This content is for educational and informational purposes only. It does not constitute legal, customs, or trade compliance advice. Consult a licensed customs broker or trade attorney for specific guidance."
2. **Compliance-specific disclaimer (where relevant):** "Regulations change frequently. Information current as of [date]. Verify with official sources."
3. **Links to official sources:** Every article links to relevant government sources (CBP, USITC, trade.gov, FDA, USDA)

### 3.6 Hidden Costs Section

Dedicated article (also referenced from landing page PRD-01):

| Cost | Typical Range | When Incurred | Notes |
|------|--------------|---------------|-------|
| Customs Broker Fee | $150-$250/entry | At customs clearance | Per entry, not per container |
| ISF Filing Penalty | $5,000/violation | If ISF not filed 24h before departure | Non-negotiable CBP penalty |
| Demurrage | $150-$300/day | After free time at port (usually 4-5 days) | Charged by the port/terminal |
| Detention | $100-$200/day | Container not returned to carrier on time | Charged by the shipping line |
| Drayage | $500-$1,500/container | Port to warehouse | Varies by distance and congestion |
| CBP Exam Fee | $300-$1,000 | If CBP selects shipment for inspection | Tailgate exam vs. intensive exam |
| Warehouse Handling | $0.15-$0.50/unit | At receiving warehouse/3PL | Unloading, scanning, shelving |
| Harbor Maintenance Fee | 0.125% of cargo value | At US port entry | Federal fee, non-waivable |
| Merchandise Processing Fee | 0.3464% (min $31.67, max $614.35) | At customs entry | Per entry |

---

## 4. Non-Functional Requirements

| Requirement | Target | Notes |
|-------------|--------|-------|
| Page load | < 1.5s per article | Server-rendered MDX/content |
| Search latency | < 100ms | Pre-built search index |
| Accessibility | WCAG 2.1 AA | Proper heading hierarchy, keyboard navigation, readable fonts |
| Responsive | 375px - 2560px | Sidebar collapses on mobile, tables scroll horizontally |
| Print | Clean print layout for checklists | CSS @media print rules |
| SEO | Server-rendered, semantic HTML | For potential public visibility |

---

## 5. Data Requirements

### Content Storage

Articles stored as structured JSON or MDX files in `/content/knowledge-base/`:

```
/content/knowledge-base/
  /import-process/
    01-sourcing.mdx
    02-documentation-isf.mdx
    03-ocean-transit.mdx
    04-customs-clearance.mdx
    05-ftz-entry.mdx
    06-fulfillment.mdx
  /ftz-guide/
    what-is-ftz.mdx
    ftz-benefits.mdx
    pf-vs-npf.mdx
    ftz-application.mdx
    ftz-compliance.mdx
    ftz-tariff-strategy.mdx
  /compliance/
    general-cargo-checklist.json
    cold-chain-checklist.json
    apparel-checklist.json
    food-cpg-checklist.json
    ftz-admission-checklist.json
  /reference/
    documentation-matrix.json
    hidden-costs.json
```

### Search Index

- Built at build time from article content
- Indexed fields: title, section, body text, tags
- Stored as static JSON served on demand

---

## 6. UI/UX Specifications

- **Layout:** Sidebar navigation (left, 280px) + content area (right, remaining width)
- **Sidebar:** Collapsible sections, active item highlighted, scrollable if content is long
- **Article styling:** Max-width 800px content column, comfortable line height (1.75), generous paragraph spacing
- **Checklists:** Interactive checkboxes with progress bar at top. Check state saved in localStorage.
- **Documentation matrix:** Full-width table with sticky headers. Color-coded cells (green=required, gray=not applicable).
- **Mobile:** Sidebar becomes hamburger menu. Article takes full width. Tables scroll horizontally.
- **Callout boxes:** Colored left-border with icon (info circle, warning triangle, lightbulb, alert octagon)
- **Table of contents:** Right sidebar (desktop only) showing article h2/h3 headings with scroll-spy

---

## 7. Technical Implementation Notes

### Component Breakdown

```
app/knowledge/page.tsx                     # Server component - KB index
app/knowledge/[section]/[slug]/page.tsx    # Server component - article view
components/knowledge/
  KBSidebar.tsx                            # Client component (mobile toggle)
  KBArticle.tsx                            # Server component (renders MDX)
  KBSearch.tsx                             # Client component (search bar + results)
  KBChecklist.tsx                          # Client component (interactive checklist)
  KBDocMatrix.tsx                          # Client component (sortable table)
  KBCallout.tsx                            # Server component (info/warning/tip/danger)
  KBTableOfContents.tsx                    # Client component (scroll-spy)
  KBBreadcrumbs.tsx                        # Server component
  KBDisclaimer.tsx                         # Server component
lib/data/
  knowledge-base.ts                        # Load and index KB content
```

### Content Rendering

- Use `@next/mdx` or `next-mdx-remote` for MDX rendering
- MDX enables custom components (Callout, Checklist, DocMatrix) within article content
- Server Component rendering for SEO and performance
- Frontmatter in each MDX file:

```yaml
---
title: "ISF Filing Requirements"
section: "import-process"
step: 2
description: "Everything you need to know about Importer Security Filing (10+2)"
tags: ["ISF", "customs", "CBP", "documentation"]
lastUpdated: "2026-03-01"
officialSources:
  - url: "https://www.cbp.gov/trade/trade-community/isf"
    label: "CBP ISF Information"
---
```

### Checklist Persistence

```typescript
// lib/hooks/useChecklist.ts
function useChecklist(checklistId: string) {
  const [checked, setChecked] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set();
    const saved = localStorage.getItem(`kb-checklist-${checklistId}`);
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  const toggle = (itemId: string) => {
    setChecked(prev => {
      const next = new Set(prev);
      next.has(itemId) ? next.delete(itemId) : next.add(itemId);
      localStorage.setItem(`kb-checklist-${checklistId}`, JSON.stringify([...next]));
      return next;
    });
  };

  return { checked, toggle, progress: checked.size };
}
```

---

## 8. Acceptance Criteria

| ID | Criterion | Verification |
|----|-----------|-------------|
| AC-08-01 | All 6 import process articles render with correct content | Navigate to each article |
| AC-08-02 | All 6 FTZ guide articles render | Navigate to each article |
| AC-08-03 | Checklists are interactive (checkboxes work) | Click checkboxes, verify state changes |
| AC-08-04 | Checklist state persists across page refreshes | Check items, refresh, verify still checked |
| AC-08-05 | Documentation matrix displays all documents and steps | Visual inspection of full table |
| AC-08-06 | Search returns relevant results for "ISF" | Search and verify |
| AC-08-07 | Search returns relevant results for "FTZ" | Search and verify |
| AC-08-08 | Every article has a disclaimer | Visual inspection |
| AC-08-09 | Every article links to official sources | Verify links are present and correct |
| AC-08-10 | Sidebar navigation highlights active article | Navigate between articles, verify highlight |
| AC-08-11 | Breadcrumbs show correct hierarchy | Verify on 3+ different articles |
| AC-08-12 | Previous/Next navigation works at bottom of articles | Click prev/next, verify correct article loads |
| AC-08-13 | Mobile sidebar collapses to hamburger menu | View at 375px |
| AC-08-14 | Hidden costs section shows all 9 cost categories with ranges | Visual inspection |

---

## 9. Dependencies

| Dependency | Type | PRD |
|-----------|------|-----|
| FTZ Analyzer | Cross-links from FTZ articles | PRD-03 |
| HTS Lookup | Cross-links from tariff classification articles | PRD-07 |
| Unit Economics Calculator | Cross-links from cost articles | PRD-02 |
| Route Comparison | Cross-links from transit articles | PRD-04 |
| Landing page hidden costs section | Content shared/referenced | PRD-01 |

---

## 10. Known Pitfalls (from PITFALLS.md)

| Pitfall | Relevance | Mitigation |
|---------|-----------|------------|
| Pitfall 2: Stale data presented as current | Regulatory content changes | Date-stamp every article. Link to official sources. Disclaimer on every page. |
| Pitfall 9: Incoterms confusion | Import process articles must be precise | Explicitly define Incoterms when referenced. Do not assume reader knowledge. |
| Phase warning: FTZ regulations complex | FTZ articles must be accurate but scoped | Scope to federal FTZ benefits. State-specific notes as "consult local FTZ operator." |
| Phase warning: Cold chain specifics | Cold chain checklist needs specialized knowledge | Mark cold chain items with source citations. Link to FDA/USDA guidance. |

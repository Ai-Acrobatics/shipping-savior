# PRD-07: HTS Code Lookup + Tariff Estimator

**Status:** Draft
**Priority:** P0 (Foundation data layer)
**Route:** `/tools/hts-lookup`
**Last Updated:** 2026-03-26

---

## 1. Overview & Purpose

The HTS Code Lookup tool enables users to search the US Harmonized Tariff Schedule (100K+ entries) and retrieve duty rates by HTS code and country of origin. It is the foundation data layer for all cost calculations -- the FTZ Analyzer, Unit Economics Calculator, and Landed Cost tools all depend on accurate duty rate data.

The tool must handle the full HTS dataset performantly, support fuzzy search across code numbers and descriptions, normalize inconsistent code formats, and clearly display rates with SE Asian country-of-origin specifics.

---

## 2. User Stories

| ID | As a... | I want to... | So that... |
|----|---------|-------------|------------|
| US-07-01 | Importer | Search for my product by description | I can find the correct HTS code |
| US-07-02 | Importer | Search by partial HTS code | I can navigate the tariff schedule hierarchy |
| US-07-03 | Importer | See the duty rate for my product from a specific country | I know my exact duty obligation |
| US-07-04 | Importer | Send a duty rate to the calculators | I don't have to re-enter the rate manually |
| US-07-05 | Importer | See special program rates (GSP, FTA) | I can take advantage of preferential programs |
| US-07-06 | Compliance officer | Verify the HTS classification for a product | I ensure correct tariff classification |
| US-07-07 | Importer | Filter results by country of origin | I see rates relevant to my sourcing country |

---

## 3. Functional Requirements

### 3.1 Search Interface

- **Search bar:** Full-width, prominent search input
  - Placeholder: "Search by product description or HTS code..."
  - Debounced search (300ms) -- no submit button needed
  - Minimum 2 characters to trigger search
- **Search modes:**
  - **Description search:** Fuzzy matching on product descriptions (e.g., "cotton t-shirt", "frozen shrimp")
  - **Code search:** Partial matching on HTS codes (e.g., "6109" finds all under chapter 61, heading 09)
  - Auto-detect: if input starts with a digit, treat as code search; otherwise, description search
- **Country filter:** Dropdown selector for country of origin
  - Highlighted options: Vietnam (VN), Thailand (TH), Indonesia (ID), Cambodia (KH), China (CN)
  - "All Countries" default showing general rates
- **Chapter filter:** Optional dropdown to narrow by HTS chapter (01-99)

### 3.2 Search Results Table

| Column | Description | Notes |
|--------|------------|-------|
| HTS Code | Formatted with dots (e.g., "6109.10.0012") | Always display with dots for readability (Pitfall 6) |
| Description | Product description from HTS schedule | May be hierarchical (indented for subcodes) |
| General Duty Rate | Rate for most countries | e.g., "16.5%", "Free", "$0.34/kg" |
| Special Rate | Preferential rates (GSP, CAFTA-DR, etc.) | e.g., "Free (AU, BH, CA, CL...)" |
| Country-Specific Rate | Rate for selected origin country | Shown if country filter active |
| Unit of Quantity | How duty is measured | e.g., "dozen", "kg", "square meters" |
| Section 301 | Additional tariff if applicable | e.g., "+25% (China List 3)" |

- Built with @tanstack/react-table
- Sortable by code, rate
- Paginated: 25 results per page
- Max 100 results per query (performance guard)
- Hierarchical indentation for sub-codes (2-digit chapter > 4-digit heading > 6-digit subheading > 8/10-digit tariff item)

### 3.3 "Use This Rate" Action

Each result row has a "Use This Rate" button that:

1. Copies the duty rate to clipboard
2. Provides navigation options:
   - "Use in Unit Economics Calculator" -> navigates to PRD-02 with `?dr=X.XX` param
   - "Use in FTZ Analyzer" -> navigates to PRD-03 with `?lr=X.XX` param
3. Shows a toast notification confirming the action

### 3.4 HTS Code Detail View

Clicking an HTS code expands an inline detail section or opens a detail panel:

- Full HTS hierarchy path (Chapter > Heading > Subheading > Tariff Item)
- All duty rate columns with footnotes
- Special program eligibility list
- Section 301/Section 232 additional tariff notes
- Related codes (same heading, adjacent codes)
- Link to official USITC source for this code

### 3.5 HTS Code Format Normalization (Pitfall 6)

- **Internal storage:** All codes stored as 10-digit strings, digits only (e.g., "6109100012")
- **Display format:** Always with dots (e.g., "6109.10.0012")
- **Search input:** Accept any format -- strip dots, dashes, spaces before matching
- **Partial code matching:**
  - "61" matches all codes starting with 61 (Chapter 61: Knitted apparel)
  - "6109" matches all codes starting with 6109
  - "6109.10" matches all under that subheading

### 3.6 Data Freshness Indicator (Pitfall 2)

- Prominently display: "HTS rates as of [dataset date]" at top of page
- Include disclaimer: "For informational purposes only. Verify current rates at hts.usitc.gov"
- Link to official USITC website
- If data is > 6 months old, show a warning badge

---

## 4. Non-Functional Requirements

| Requirement | Target | Notes |
|-------------|--------|-------|
| Search latency | < 200ms per query | Client-side Fuse.js/FlexSearch on loaded index |
| Index load time | < 1s | Lazy-load search index, not in initial page bundle |
| Results render | < 100ms for 25 results | @tanstack/react-table |
| Dataset size | ~100K HTS entries | Compressed JSON ~2-5MB, loaded on demand |
| Accessibility | WCAG 2.1 AA | Search input labeled, table navigable by keyboard |
| Responsive | 375px - 2560px | Table scrolls horizontally on mobile |

---

## 5. Data Requirements

### HTS Dataset Structure

```json
{
  "metadata": {
    "source": "USITC",
    "downloadDate": "2026-03-01",
    "version": "2026 Basic Edition",
    "url": "https://hts.usitc.gov"
  },
  "entries": [
    {
      "code": "6109100012",
      "codeFormatted": "6109.10.0012",
      "chapter": 61,
      "heading": "6109",
      "subheading": "610910",
      "description": "T-shirts, singlets, tank tops and similar garments, knitted or crocheted, of cotton",
      "generalRate": "16.5%",
      "specialRates": [
        { "program": "AU", "rate": "Free" },
        { "program": "BH", "rate": "Free" },
        { "program": "CA", "rate": "Free" }
      ],
      "column2Rate": "45%",
      "unitOfQuantity": "dozen",
      "section301": null,
      "section232": null,
      "countryRates": {
        "VN": { "rate": "16.5%", "notes": null },
        "TH": { "rate": "16.5%", "notes": null },
        "CN": { "rate": "16.5%", "section301": "25%", "totalRate": "41.5%" }
      },
      "indent": 3,
      "parentCode": "6109100000"
    }
  ]
}
```

### Search Index Strategy

**Phase 1 approach:**
1. Download full HTS schedule from USITC as JSON/CSV
2. Transform into structured JSON (`/data/hts-schedule.json`)
3. Build search index using FlexSearch (better for large datasets) or Fuse.js (better fuzzy matching)
4. Index fields: `code` (exact/prefix match), `description` (fuzzy match)
5. Lazy-load the index on first search interaction (not on page load)

**Index loading pattern:**
```typescript
// Load index on first search, cache in memory
let searchIndex: FlexSearch.Index | null = null;

async function getSearchIndex() {
  if (!searchIndex) {
    const data = await fetch('/data/hts-search-index.json');
    searchIndex = buildIndex(await data.json());
  }
  return searchIndex;
}
```

### Country-Specific Duty Rates

Compile duty rates for the 5 priority SE Asian countries from USITC DataWeb exports:
- Vietnam (VN)
- Thailand (TH)
- Indonesia (ID)
- Cambodia (KH)
- China (CN) -- including Section 301 additional tariffs

---

## 6. UI/UX Specifications

- **Layout:** Search bar at top (full-width), filters below, results table below that
- **Search bar styling:** Large, prominent (48px height), with a search icon and clear button
- **Country filter:** Horizontal toggle pills (VN | TH | ID | KH | CN | All) with country flags
- **Results table:** Clean, readable. Alternating row backgrounds. HTS codes in monospace font.
- **Hierarchical display:** Indent deeper codes. Show chapter/heading as gray section headers.
- **"Use This Rate" button:** Compact, inline with the rate column. Primary blue color.
- **Data freshness badge:** Yellow/amber badge if data > 3 months old, red if > 6 months
- **Empty state:** Helpful message with search suggestions ("Try 'frozen shrimp' or '0306'")
- **Loading state:** Skeleton table while index loads on first search

---

## 7. Technical Implementation Notes

### Component Breakdown

```
app/tools/hts-lookup/page.tsx             # Server component - layout + metadata
components/hts/
  HTSLookup.tsx                           # Client component - main
  HTSSearchBar.tsx                        # Client component - search input
  HTSCountryFilter.tsx                    # Client component - country pills
  HTSResultsTable.tsx                     # Client component - results table
  HTSDetailPanel.tsx                      # Client component - expanded code detail
  HTSFreshnessBadge.tsx                   # Server component - data date display
  HTSDisclaimer.tsx                       # Server component - legal text
lib/data/
  hts.ts                                  # HTS data loading, indexing, search
  hts-search.ts                           # Search index management (FlexSearch/Fuse.js)
```

### Search Implementation Decision: FlexSearch vs Fuse.js

| Criterion | FlexSearch | Fuse.js |
|-----------|-----------|---------|
| Speed (100K entries) | Faster (~5ms per query) | Slower (~50-200ms per query) |
| Fuzzy matching | Basic | Excellent (typo tolerance, partial matching) |
| Index size | Larger | Smaller |
| Relevance ranking | Basic | Better |

**Recommendation:** Use FlexSearch for code-based search (speed matters for prefix matching). Use Fuse.js for description-based search (fuzzy matching matters for product names). Detect search type from input and route to the appropriate index.

### HTS Code Normalization Utility

```typescript
// lib/utils/hts.ts
export function normalizeHTSCode(input: string): string {
  return input.replace(/[.\-\s]/g, '').padEnd(10, '0');
}

export function formatHTSCode(digits: string): string {
  // "6109100012" -> "6109.10.0012"
  return `${digits.slice(0,4)}.${digits.slice(4,6)}.${digits.slice(6)}`;
}

export function isHTSCodeSearch(input: string): boolean {
  return /^\d/.test(input.trim());
}
```

---

## 8. Acceptance Criteria

| ID | Criterion | Verification |
|----|-----------|-------------|
| AC-07-01 | Searching "cotton t-shirt" returns relevant HTS codes (Chapter 61) | Search and verify results |
| AC-07-02 | Searching "6109" returns all codes under that heading | Search and verify prefix matching |
| AC-07-03 | Searching "6109.10.0012" and "6109100012" return the same result | Test both formats (Pitfall 6) |
| AC-07-04 | Country filter shows country-specific rates | Select Vietnam, verify VN rates shown |
| AC-07-05 | China filter shows Section 301 additional tariffs | Select China, verify 301 surcharge displayed |
| AC-07-06 | "Use This Rate" button feeds rate into Unit Economics calculator | Click, verify navigation with correct param |
| AC-07-07 | Dataset date is prominently displayed (Pitfall 2) | Visual inspection |
| AC-07-08 | Disclaimer text is present | Visual inspection |
| AC-07-09 | Search returns results within 200ms | Measure with DevTools |
| AC-07-10 | Table is sortable and paginated | Click column headers, navigate pages |
| AC-07-11 | Mobile: search and table are usable at 375px | DevTools responsive mode |
| AC-07-12 | Empty state message shown for no results | Search nonsense string, verify message |
| AC-07-13 | Index loads lazily (not on page load) | Check network tab -- no index loaded until first search |

---

## 9. Dependencies

| Dependency | Type | PRD |
|-----------|------|-----|
| USITC HTS dataset | External data source | Downloaded and stored in /data/ |
| Unit Economics calculator | "Use This Rate" navigation | PRD-02 |
| FTZ Analyzer | "Use This Rate" navigation | PRD-03 |
| Landed cost calculator | Foundation rate data | PRD-02 |

---

## 10. Known Pitfalls (from PITFALLS.md)

| Pitfall | Relevance | Mitigation |
|---------|-----------|------------|
| Pitfall 2: Stale tariff data | CRITICAL for this page | Display dataset date prominently. Link to official source. Disclaimer on every page. |
| Pitfall 6: HTS code format inconsistency | CRITICAL for this page | Normalize to 10-digit canonical format. Search strips dots. Display always includes dots. |
| Pitfall 12: Missing units | Duty rates have various formats | Always show unit: "%", "$/kg", "$/doz", "Free" |
| Phase warning: HTS dataset size | 100K+ entries may slow build | Lazy-load search index. Do not import full dataset in page bundle. |

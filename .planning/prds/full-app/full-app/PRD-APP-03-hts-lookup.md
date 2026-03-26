# PRD: HTS Code Lookup

## Overview
- **Purpose:** Provide fast, fuzzy search across 100K+ Harmonized Tariff Schedule codes with duty rates, special program indicators, and country-of-origin filtering. This is the foundational data layer that feeds into the Landed Cost Calculator, FTZ Modeler, and AI Classifier.
- **User persona:** Importers classifying products for customs entry, freight brokers quoting duty costs to clients, compliance officers verifying tariff classifications.
- **Entry points:** Main navigation "HTS Lookup" link, "Look up HTS code" action from Landed Cost Calculator, "View HTS details" link from AI Classifier results, direct URL `/tools/hts-lookup`.

## Page Layout

### Desktop (1280px+)
- **Top section:** Search bar (full-width, prominent) with country-of-origin dropdown filter to the right. Below search: filter chips for Section 301, AD/CVD, and special program indicators.
- **Results section:** Full-width data table with columns: HTS Code, Description, General Duty Rate, Special Rates, Unit of Quantity, Section 301 indicator, AD/CVD indicator. Rows are clickable to expand detail panel.
- **Right sidebar (on row selection):** Slide-in detail panel showing full HTS hierarchy (chapter > heading > subheading > statistical suffix), all duty columns, related CBP rulings, and "Use this rate" action button.
- **Below table:** "Recently Searched" section showing last 10 lookups as clickable chips.

### Tablet (768px-1279px)
- Search bar full-width. Country filter below search on its own row. Table columns reduced to: HTS Code, Description, General Rate. Tap row to navigate to detail page instead of sidebar.

### Mobile (< 768px)
- Search bar full-width. Country filter as bottom sheet selector. Results as card list (one card per code) showing code, truncated description, general rate. Tap card for full detail page.

## Features & Functionality

### Feature: Fuzzy Search
- **Description:** Real-time search across HTS code numbers and descriptions. Supports partial codes (e.g., "6402"), descriptive terms (e.g., "rubber footwear"), and combined queries.
- **User interaction flow:**
  1. User types in search bar (minimum 2 characters to trigger)
  2. 300ms debounce before search executes
  3. Client-side search via FlexSearch index (pre-loaded, ~5MB compressed)
  4. Results render in table, sorted by relevance score
  5. Matching terms highlighted in yellow in description column
  6. Result count displayed: "Showing 47 of 18,927 results for 'rubber footwear'"
- **Edge cases:**
  - Empty search: show top-level HTS chapters (01-99) as browsable list
  - No results: "No HTS codes found for '[query]'. Try broader terms or check spelling."
  - Very broad search (>1000 results): show first 100, prompt "Refine your search for more specific results"
  - HTS code format variations: normalize input (strip dots, dashes, spaces) before searching
- **Validation rules:** Query string 2-200 chars. Sanitize for XSS.

### Feature: Country-of-Origin Filter
- **Description:** Filter duty rates by country of origin. Shows applicable general rates, special program rates (GSP, FTA), and additional duties (Section 301, AD/CVD).
- **User interaction flow:**
  1. User selects country from dropdown (top options: Vietnam, Thailand, Indonesia, Cambodia, China, India, Bangladesh)
  2. Table updates to show country-specific duty rate in a dedicated column
  3. Section 301 indicator appears for affected codes when China is selected
  4. AD/CVD indicators appear when applicable for selected country
  5. Special program rates (e.g., GSP "A" for developing countries) shown when applicable
- **Edge cases:**
  - Country with no special rates: show only General column
  - Multiple duty types apply (e.g., general + Section 301 + AD/CVD): show all with clear labels and cumulative total
  - "All Countries" option shows just the general rate column

### Feature: "Use This Rate" Action
- **Description:** Select an HTS code and its duty rate to pre-fill into the Landed Cost Calculator or FTZ Modeler.
- **User interaction flow:**
  1. User clicks "Use this rate" button in detail panel or row action
  2. HTS code, description, and duty rate are saved to session/URL state
  3. User is presented with option: "Open in Landed Cost Calculator" or "Open in FTZ Modeler"
  4. Selected tool opens with HTS code and duty rate pre-filled
- **Edge cases:**
  - Multiple duty rates apply (general + 301): prompt user to select which rate to use
  - User hasn't selected a country: prompt to select country first ("Select a country of origin to determine the applicable rate")

### Feature: Recently Searched Codes
- **Description:** Persistent history of the user's last 20 HTS code searches for quick re-access.
- **User interaction flow:**
  1. "Recently Searched" section below results table
  2. Shows HTS code + short description as clickable chips
  3. Click chip: populates search bar and scrolls to that code in results
  4. "Clear history" link to reset
- **Edge cases:**
  - New user with no history: section hidden
  - History exceeds 20 items: oldest items dropped (FIFO)

### Feature: Section 301/AD/CVD Indicators
- **Description:** Visual indicators on HTS codes that are subject to additional tariffs beyond the general rate.
- **Details:**
  - Section 301: orange badge "301" with tooltip showing additional duty percentage and affected list number
  - AD/CVD: red badge "AD/CVD" with tooltip showing case number and duty rate range
  - Both badges link to more details in the detail panel
  - Filter chips above table allow toggling: "Show only 301-affected" / "Show only AD/CVD-affected"

## Usability Requirements
- **Accessibility (WCAG 2.1 AA):** Search input has `role="combobox"` with `aria-expanded` and `aria-controls` for results. Table uses proper `<th>` scope attributes. Badges have `aria-label` describing the indicator. Detail panel announced via `aria-live="polite"`.
- **Keyboard navigation:** Focus starts in search bar. Tab moves to country filter, then filter chips, then table. Arrow keys navigate table rows. Enter opens detail panel. Escape closes detail panel.
- **Loading states:** Skeleton table rows during initial index load. Spinner in search bar during search. "Loading HTS data..." progress bar on first visit (index download).
- **Error states:** Index load failure: "Unable to load HTS data. Refresh the page to try again." Search error: inline message in results area.
- **Empty states:** Before first search: "Search for HTS codes by number or description" with example queries (e.g., "Try: 6402.99, rubber footwear, cotton t-shirt").
- **Performance targets:** LCP < 2.5s (index load). Search results render < 100ms after debounce. Table pagination/scroll at 60fps. Index size < 5MB gzipped.

## API Endpoints

### GET /api/hts/search
- **Description:** Search HTS codes by query string with optional country filter.
- **Authentication required:** Yes
- **Request parameters:**
  - `q` (string, required): search query (min 2 chars)
  - `country` (string, optional): ISO 3166-1 alpha-2 country code
  - `section301` (boolean, optional): filter to Section 301-affected codes only
  - `adcvd` (boolean, optional): filter to AD/CVD-affected codes only
  - `chapter` (number, optional): filter by HTS chapter (1-99)
  - `limit` (number, optional, default 50, max 200): results per page
  - `offset` (number, optional, default 0): pagination offset
- **Response (200):**
  ```json
  {
    "query": "rubber footwear",
    "country": "VN",
    "totalResults": 47,
    "results": [
      {
        "htsCode": "6402.99.4060",
        "htsCodeNormalized": "6402994060",
        "description": "Footwear with outer soles and uppers of rubber or plastics, other",
        "hierarchy": {
          "chapter": { "code": "64", "description": "Footwear, gaiters and the like" },
          "heading": { "code": "6402", "description": "Other footwear with outer soles and uppers of rubber or plastics" },
          "subheading": { "code": "6402.99", "description": "Other" }
        },
        "generalDutyRate": "20%",
        "specialRates": [
          { "program": "GSP", "indicator": "A", "rate": "Free" },
          { "program": "CAFTA-DR", "indicator": "P", "rate": "Free" }
        ],
        "unitOfQuantity": "pairs",
        "section301": null,
        "adcvd": null,
        "countrySpecificRate": {
          "country": "VN",
          "applicableRate": "20%",
          "additionalDuties": []
        },
        "relevanceScore": 0.95
      }
    ],
    "dataDate": "2026-03-15",
    "disclaimer": "For informational purposes only. Verify current rates at hts.usitc.gov"
  }
  ```
- **Error responses:**
  - 400: `{ "error": "query_too_short", "message": "Search query must be at least 2 characters" }`
  - 401: Unauthorized
  - 500: `{ "error": "search_error", "message": "Unable to search HTS database" }`
- **Rate limiting:** 60 requests per minute per user.

### GET /api/hts/:code
- **Description:** Get full details for a specific HTS code.
- **Authentication required:** Yes
- **Request parameters:** `code` (string): HTS code (dots optional, e.g., "6402.99.4060" or "6402994060")
- **Response (200):**
  ```json
  {
    "htsCode": "6402.99.4060",
    "description": "Footwear with outer soles and uppers of rubber or plastics, other, valued over $6.50 but not over $12.00/pair",
    "hierarchy": {
      "chapter": { "code": "64", "description": "Footwear, gaiters and the like" },
      "heading": { "code": "6402", "description": "..." },
      "subheading": { "code": "6402.99", "description": "..." },
      "statisticalSuffix": { "code": "4060", "description": "..." }
    },
    "dutyRates": {
      "general": "20%",
      "special": [
        { "program": "GSP", "indicator": "A", "rate": "Free", "countries": ["VN", "TH", "KH"] },
        { "program": "CAFTA-DR", "indicator": "P", "rate": "Free", "countries": ["CR", "GT", "SV"] }
      ],
      "column2": "35%"
    },
    "unitOfQuantity": "pairs",
    "section301": {
      "applicable": false,
      "listNumber": null,
      "additionalDuty": null
    },
    "adcvd": {
      "orders": []
    },
    "relatedRulings": [
      {
        "rulingNumber": "NY N123456",
        "date": "2025-08-15",
        "productDescription": "Men's rubber-soled athletic shoes",
        "htsClassification": "6402.99.4060"
      }
    ],
    "notes": "See Chapter 64, Note 3 for definitions.",
    "dataDate": "2026-03-15"
  }
  ```
- **Error responses:**
  - 404: `{ "error": "not_found", "message": "HTS code not found" }`

### GET /api/hts/recent
- **Description:** Get user's recently searched HTS codes.
- **Authentication required:** Yes
- **Response (200):**
  ```json
  {
    "recentSearches": [
      {
        "htsCode": "6402.99.4060",
        "description": "Footwear with outer soles...",
        "searchedAt": "2026-03-26T10:30:00Z"
      }
    ]
  }
  ```
- **Rate limiting:** 30 requests per minute.

## Data Requirements
- **Database tables read/written:**
  - `hts_codes` (read) — htsCode, description, generalDutyRate, specialRates (JSONB), unitOfQuantity, chapter, heading, subheading, section301 (JSONB), notes
  - `country_rates` (read) — htsCode, countryCode, applicableRate, additionalDuties (JSONB), effectiveDate
  - `search_history` (write) — userId, query, htsCode (if selected), countryFilter, searchedAt
  - `cbp_rulings` (read) — rulingNumber, date, htsCode, productDescription, fullText
- **External data sources:**
  - USITC HTS Schedule (JSON download, weekly refresh)
  - CBP CROSS Rulings Database (scraped, daily updates)
  - Section 301 tariff lists (Federal Register monitoring)
  - AD/CVD orders (CBP database, weekly scrape)
- **Caching strategy:**
  - HTS search index: built at deploy time, cached in CDN. Rebuilt weekly on data refresh.
  - Individual HTS code details: ISR with 24-hour revalidation.
  - Recent searches: per-user, cached in client localStorage + server DB.
  - Country-specific rates: static JSON per country, cached at CDN edge.

## Component Breakdown
- **Server Components:** `HtsLookupPage` (layout, initial data load), `HtsDetailPanel` (server-rendered detail view for SEO on direct links).
- **Client Components:** `HtsSearchBar` (input + debounce + combobox), `HtsResultsTable` (tanstack/react-table with sort/filter/pagination), `HtsDetailSidebar` (slide-in panel), `CountryFilter` (dropdown), `FilterChips` (301/AD/CVD toggles), `RecentSearches` (chip list), `DutyRateBadge`, `UseThisRateButton`.
- **Shared components used:** `Input`, `Select`, `Badge`, `Table`, `Card`, `Tooltip`, `Skeleton`, `EmptyState`.
- **New components needed:** `HtsSearchBar`, `HtsResultsTable`, `HtsDetailSidebar`, `CountryFilter`, `FilterChips`, `RecentSearches`, `DutyRateBadge`, `UseThisRateButton`, `HtsHierarchyTree`.

## Acceptance Criteria
- [ ] Search returns results within 100ms for any query on the 100K+ HTS dataset
- [ ] Fuzzy search matches partial codes ("6402"), descriptions ("rubber footwear"), and mixed queries
- [ ] HTS code format variations (with/without dots, partial codes) all resolve correctly
- [ ] Country-of-origin filter shows country-specific duty rates
- [ ] Section 301 badge appears on affected codes when China is selected as origin
- [ ] AD/CVD indicators display with case numbers and duty rate ranges
- [ ] "Use this rate" successfully passes HTS code and rate to Landed Cost Calculator
- [ ] Recently searched codes persist across page refreshes (up to 20 items)
- [ ] Data date is prominently displayed on every page
- [ ] Disclaimer "For informational purposes only" appears on every view
- [ ] Search bar has combobox ARIA pattern for screen readers
- [ ] Table is keyboard-navigable with arrow keys
- [ ] Mobile view shows card-based results instead of table
- [ ] FlexSearch index loads in < 3 seconds on first visit
- [ ] Empty state shows helpful example queries

## Dependencies
- **This page depends on:** Authentication (PRD-APP-01). HTS data pipeline (weekly USITC download + processing). CBP rulings database. Section 301 and AD/CVD data.
- **Pages that depend on this:** Landed Cost Calculator (PRD-APP-04) receives HTS code and rate. FTZ Modeler (PRD-APP-05) receives HTS code and rate. AI Classifier (PRD-APP-12) links to HTS detail for classification results. Compliance Center (PRD-APP-13) references HTS codes in tariff change alerts.

# PRD: Knowledge Base

## Overview
- **Purpose:** Educational resource hub covering import/export processes, FTZ operations, compliance requirements, document templates, and tariff classification guidance. Provides structured, searchable content that helps users understand the complexities of international shipping without needing external resources.
- **User persona:** New importers learning the process, team members onboarding to logistics operations, compliance officers looking up regulatory requirements, anyone needing quick reference for shipping procedures.
- **Entry points:** Main navigation "Knowledge Base" link, contextual "Learn more" links from calculators and tools, direct URL `/knowledge`, search from any page via global search.

## Page Layout

### Desktop (1280px+)
- **Left sidebar (250px, fixed):** Navigation tree organized by category. Collapsible sections: Import Process, FTZ Guide, Compliance, Documents, Tariffs, Glossary. Active article highlighted. Search input at top of sidebar.
- **Main content area (right):** Article viewer with breadcrumbs at top (Knowledge Base > Category > Article). Article content with headings, paragraphs, lists, tables, callout boxes, and images. Table of contents floating on right edge (for long articles).
- **Bottom of article:** Related articles section. "Was this helpful?" feedback buttons. Disclaimer.

### Tablet (768px-1279px)
- Sidebar collapses to hamburger menu. Article full-width. Floating ToC hidden (inline ToC at top instead).

### Mobile (< 768px)
- No sidebar — category navigation via breadcrumbs and category cards on index page. Article full-width. ToC as expandable sticky header.

## Features & Functionality

### Feature: Category Navigation
- **Description:** Hierarchical navigation through knowledge base categories and articles.
- **Categories:**
  1. **Import Process** — Step-by-step from sourcing to delivery
     - The Import Journey: Overview
     - Finding & Vetting Suppliers
     - Placing an Order & Negotiating Incoterms
     - Shipping & Freight Booking
     - Customs Clearance Process
     - Duties, Taxes & Fees Explained
     - Last Mile: Fulfillment & Distribution
  2. **FTZ Guide** — Foreign Trade Zone operations
     - What is an FTZ?
     - FTZ vs Direct Entry: Pros & Cons
     - PF vs NPF Status: Making the Right Choice
     - FTZ Entry & Withdrawal Procedures
     - Cost-Benefit Analysis Framework
     - FTZ Compliance Requirements
  3. **Compliance** — Regulatory requirements
     - ISF (10+2) Filing Guide
     - Customs Bond Requirements
     - Country of Origin Rules
     - Section 301 Tariffs Explained
     - AD/CVD Duties Guide
     - FDA Import Requirements (Food & Beverage)
     - USDA/APHIS Requirements
     - Record-Keeping Requirements
  4. **Documents** — Document guides and templates
     - Bill of Lading Explained
     - Commercial Invoice Requirements
     - Packing List Best Practices
     - Certificate of Origin Guide
     - ISF Filing Instructions
     - CBP Form 7501 Guide
  5. **Tariffs** — Classification and duty rates
     - Understanding the HTS Schedule
     - How to Classify Your Product
     - Duty Calculation Methods (ad valorem, specific, compound)
     - Special Programs (GSP, FTAs)
     - Trade Remedies: Section 301, 201, 232
     - Getting a Binding Ruling from CBP
  6. **Glossary** — Shipping and trade terminology
- **Interaction:** Click category to expand article list. Click article to load in main content area. Active article has visual indicator (left border highlight).

### Feature: Full-Text Search
- **Description:** Search across all knowledge base articles by title, content, and tags.
- **User interaction flow:**
  1. Type in search input (sidebar or global search)
  2. 300ms debounce, search executes
  3. Results show as list: article title, category badge, excerpt with highlighted match, relevance score
  4. Click result to navigate to article with search term highlighted in content
  5. "No results" shows suggestions: related terms, popular articles
- **Edge cases:**
  - Misspelled query: fuzzy matching with "Did you mean...?" suggestion
  - Very broad query: show top 10 results with "Refine your search" prompt
  - Special characters: stripped before search

### Feature: Article Viewer
- **Description:** Render knowledge base articles with rich formatting, interactive elements, and contextual navigation.
- **Content elements supported:**
  - Headings (H1-H4)
  - Paragraphs with inline formatting (bold, italic, links)
  - Ordered and unordered lists
  - Tables (responsive, scrollable on mobile)
  - Callout boxes (info, warning, tip, important)
  - Code/reference blocks (for HTS codes, form numbers)
  - Images with captions
  - Embedded links to platform tools ("Calculate your landed cost" linking to calculator)
  - Expandable FAQ sections (accordion)
- **Features:**
  - Reading time estimate at top
  - Table of contents (auto-generated from headings)
  - "Last updated" date
  - Print-friendly version (Ctrl+P)
  - Permalink for each heading (click heading to copy link)

### Feature: Interactive Compliance Checklists
- **Description:** Checklists within articles that users can check off, with progress persisted.
- **User interaction flow:**
  1. Checklist appears inline in article content
  2. User checks items as they complete them
  3. Progress saved to localStorage immediately, synced to server on next API call
  4. Progress bar at top of checklist shows completion percentage
  5. Completed checklists show green "Complete" badge
- **Examples:**
  - "Pre-Import Compliance Checklist" — 15 items
  - "FTZ Entry Documentation Checklist" — 10 items
  - "ISF Filing Checklist" — 8 items
- **Edge cases:**
  - Different browser: localStorage not synced, but server data loads on login. "Sync" button to force server load.
  - Checklist updated (items added/removed): preserve checked state for unchanged items.

### Feature: Links to Official Sources
- **Description:** Every article includes links to authoritative sources for verification and further reading.
- **Sources linked:**
  - USITC HTS Schedule (hts.usitc.gov)
  - CBP.gov (customs regulations, rulings)
  - OFIS (ofis.trade.gov) for FTZ data
  - Federal Register for regulations
  - FDA import guidance
  - USTR for trade policy
- **Display:** "Official Sources" section at bottom of each article with labeled links and brief descriptions.

### Feature: Disclaimer
- **Description:** Legal disclaimer on every article page.
- **Text:** "This content is for educational and informational purposes only. It does not constitute legal, tax, customs brokerage, or professional advice. Regulations change frequently — verify current requirements with qualified professionals and official government sources. Shipping Savior is not a licensed customs broker."
- **Display:** Subtle but visible footer on every article. More prominent version on compliance-related articles.

## Usability Requirements
- **Accessibility (WCAG 2.1 AA):** Sidebar navigation uses `role="navigation"` with `aria-label`. Articles use semantic heading hierarchy. Callout boxes use `role="note"` or `role="alert"`. Checklists use proper checkbox inputs with labels. All links distinguishable (not just by color). Minimum 16px font for body text.
- **Keyboard navigation:** Tab through sidebar items. Enter expands category or opens article. Tab through article content (links, checklists). Sidebar can be toggled with keyboard shortcut (Ctrl+B).
- **Loading states:** Article content: skeleton text blocks. Sidebar: skeleton navigation items. Search: inline spinner.
- **Error states:** Article not found: 404 with "This article may have been moved" + search box + popular articles. Search failure: "Search temporarily unavailable" with category navigation fallback.
- **Empty states:** Category with no articles: "Content coming soon for this category." Search with no results: "No articles found. Browse categories below."
- **Performance targets:** LCP < 1.5s (text-heavy pages should be fast). Search results < 200ms. Article navigation < 300ms (prefetched). Print rendering < 1s.

## API Endpoints

### GET /api/knowledge/articles
- **Description:** List or search knowledge base articles.
- **Authentication required:** Yes (or public for select articles)
- **Request parameters:**
  - `category` (string, optional): "import_process" | "ftz_guide" | "compliance" | "documents" | "tariffs" | "glossary"
  - `search` (string, optional): full-text search query
  - `limit` (number, optional, default 20)
  - `offset` (number, optional, default 0)
- **Response (200):**
  ```json
  {
    "articles": [
      {
        "slug": "customs-clearance-process",
        "title": "Customs Clearance Process: Step-by-Step Guide",
        "category": "import_process",
        "categoryName": "Import Process",
        "excerpt": "Learn the complete customs clearance process from arrival at port to release of goods...",
        "readingTimeMinutes": 8,
        "lastUpdated": "2026-03-15",
        "tags": ["customs", "clearance", "cbp", "entry"],
        "hasChecklist": true,
        "order": 5
      }
    ],
    "totalCount": 45,
    "categories": [
      { "id": "import_process", "name": "Import Process", "articleCount": 7 },
      { "id": "ftz_guide", "name": "FTZ Guide", "articleCount": 6 },
      { "id": "compliance", "name": "Compliance", "articleCount": 8 },
      { "id": "documents", "name": "Documents", "articleCount": 6 },
      { "id": "tariffs", "name": "Tariffs", "articleCount": 6 },
      { "id": "glossary", "name": "Glossary", "articleCount": 1 }
    ]
  }
  ```
- **Rate limiting:** 60 requests per minute.

### GET /api/knowledge/articles/:slug
- **Description:** Get full article content.
- **Authentication required:** Yes (or public for select articles)
- **Response (200):**
  ```json
  {
    "slug": "customs-clearance-process",
    "title": "Customs Clearance Process: Step-by-Step Guide",
    "category": "import_process",
    "content": "<markdown or MDX content>",
    "tableOfContents": [
      { "id": "overview", "title": "Overview", "level": 2 },
      { "id": "step-1-arrival", "title": "Step 1: Vessel Arrival", "level": 2 },
      { "id": "step-2-entry", "title": "Step 2: Entry Filing", "level": 2 }
    ],
    "checklists": [
      {
        "id": "pre-clearance",
        "title": "Pre-Clearance Checklist",
        "items": [
          { "id": "item-1", "text": "Confirm ISF was filed 24+ hours before departure", "checked": false },
          { "id": "item-2", "text": "Verify customs bond is active", "checked": true }
        ]
      }
    ],
    "relatedArticles": [
      { "slug": "isf-filing-guide", "title": "ISF (10+2) Filing Guide", "category": "compliance" }
    ],
    "officialSources": [
      { "name": "CBP Entry Process", "url": "https://www.cbp.gov/trade/basic-import-export/entry-process", "description": "Official CBP guide" }
    ],
    "readingTimeMinutes": 8,
    "lastUpdated": "2026-03-15",
    "disclaimer": "This content is for educational purposes only..."
  }
  ```
- **Error responses:**
  - 404: `{ "error": "not_found", "message": "Article not found", "suggestions": ["customs-bond-requirements", "duties-taxes-fees"] }`

### PUT /api/knowledge/checklists/:checklistId
- **Description:** Save checklist progress.
- **Authentication required:** Yes
- **Request body:**
  ```json
  {
    "items": {
      "item-1": true,
      "item-2": true,
      "item-3": false
    }
  }
  ```
- **Response (200):**
  ```json
  {
    "checklistId": "pre-clearance",
    "progress": 0.67,
    "savedAt": "2026-03-26T12:00:00Z"
  }
  ```

## Data Requirements
- **Database tables read/written:**
  - `knowledge_articles` (read) — OR MDX files in `content/knowledge/` directory (preferred for content-heavy pages). Fields: slug, title, category, content, tags, order, lastUpdated.
  - `checklist_progress` (read/write) — userId, checklistId, items (JSONB), lastUpdated
- **External data sources:** None — all content is authored in-house. Official source URLs are static links.
- **Caching strategy:** Article content cached at CDN with ISR (revalidate every 24 hours). Article list cached at CDN. Checklist progress cached per user in localStorage + server sync.

## Component Breakdown
- **Server Components:** `KnowledgeBasePage` (layout + sidebar), `ArticlePage` (article content rendering with MDX). These are ideal server component candidates — content-heavy, minimal interactivity.
- **Client Components:** `SearchBar` (knowledge base search), `SidebarNavigation` (expandable categories), `InteractiveChecklist`, `TableOfContents` (floating), `ArticleFeedback` ("Was this helpful?"), `SearchResults`.
- **Shared components used:** `Input`, `Card`, `Badge`, `Breadcrumbs`, `Accordion`, `Checkbox`, `Tooltip`.
- **New components needed:** `SidebarNavigation`, `ArticleRenderer`, `InteractiveChecklist`, `TableOfContents`, `ArticleFeedback`, `CalloutBox`, `OfficialSourcesList`, `DisclaimerFooter`.

## Acceptance Criteria
- [ ] Sidebar displays all categories with correct article counts
- [ ] Category expansion shows article list in correct order
- [ ] Article content renders with proper formatting (headings, lists, tables, callouts)
- [ ] Full-text search returns relevant results within 200ms
- [ ] Search highlights matched terms in article content
- [ ] Table of contents auto-generates from article headings
- [ ] Heading permalinks copy anchor links to clipboard
- [ ] Interactive checklists persist progress (localStorage + server)
- [ ] Checklist progress bar shows completion percentage
- [ ] Related articles section shows 2-4 relevant articles
- [ ] Official sources section links to correct government websites
- [ ] Disclaimer appears on every article page
- [ ] Breadcrumbs navigate correctly: KB > Category > Article
- [ ] Mobile view uses breadcrumbs instead of sidebar for navigation
- [ ] Articles render in < 1.5s LCP (server-rendered content)
- [ ] "Was this helpful?" feedback captured
- [ ] Print-friendly layout works via Ctrl+P

## Dependencies
- **This page depends on:** Authentication (PRD-APP-01) for checklist persistence and access control. Content authoring (MDX files or CMS entries).
- **Pages that depend on this:** All calculator pages link to relevant KB articles for context. Compliance Center (PRD-APP-13) links to compliance-related articles. Onboarding (PRD-APP-02) may reference KB for first-time users.

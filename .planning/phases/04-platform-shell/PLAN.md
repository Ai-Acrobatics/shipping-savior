# Phase 4: Platform Shell & Navigation

## Goal
Authenticated app shell with sidebar navigation, separated from the public proposal site.

## Architecture
- Route group: `(platform)` wraps all `/platform/*` pages
- Layout: Server component checks auth, redirects to `/login` if unauthenticated
- PlatformShell: Client component with sidebar + top bar + mobile nav
- Sidebar: Sectioned navigation (Overview, Tools, Data, Settings) with calculator sub-items
- All existing proposal site pages (/, /dashboard/*, /ftz-analyzer, etc.) remain untouched

## Components
1. `src/app/(platform)/layout.tsx` — Auth gate + user extraction
2. `src/app/(platform)/PlatformShell.tsx` — Shell with sidebar, top bar, mobile nav
3. `src/components/platform/Sidebar.tsx` — Sectioned nav with collapsible calculator sub-items
4. `src/components/platform/MobileNav.tsx` — Mobile overlay sidebar
5. `src/components/platform/UserMenu.tsx` — User dropdown with signOut

## Pages
- `/platform` — Dashboard with stats + quick actions
- `/platform/calculators` — Calculator hub grid
- `/platform/calculators/landed-cost` — Wraps LandedCostCalculator
- `/platform/calculators/unit-economics` — Wraps UnitEconomicsCalculator
- `/platform/calculators/ftz-savings` — Wraps FTZSavingsCalculator
- `/platform/calculators/pf-npf` — Wraps PFNPFCalculator
- `/platform/calculators/container` — Wraps ContainerUtilizationCalculator
- `/platform/calculators/tariff-scenario` — Wraps TariffScenarioBuilder
- `/platform/history` — Calculation history with search/filter
- `/platform/settings` — Profile, org, team settings

## Design
- Sidebar: Dark navy (#030d1a), ocean-500 active highlights
- Content: White background
- Collapsible sidebar with localStorage persistence
- Mobile: Hamburger overlay at <1024px breakpoint

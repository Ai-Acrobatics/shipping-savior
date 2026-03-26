# Research Summary: Shipping Logistics Platform

**Domain:** International Shipping/Freight/Cold Chain Logistics Analysis Platform
**Researched:** 2026-03-26
**Overall Confidence:** MEDIUM-HIGH

---

## Executive Summary

The international shipping/logistics technology space is well-served by enterprise platforms (Freightos, Flexport, project44, FourKites) but lacks accessible, interactive analysis tools for mid-market importers and freight professionals who need to quickly model landed costs, compare routes, and evaluate FTZ savings. The proposed platform fills this gap as a web-based analysis and proposal tool, not as a competing TMS or visibility platform.

The technology stack for Phase 1 is straightforward and low-cost. The core insight from research is that **all critical data sources are freely available from US government sources** -- the USITC provides HTS tariff data via REST API and downloadable JSON, the ITA maintains the FTZ database through OFIS, and port data is available from UN/LOCODE and the World Port Index. This means Phase 1 can be built entirely on free, authoritative datasets with zero API costs.

For visualization, the **MapLibre GL + deck.gl + react-map-gl** stack is the clear winner. It provides WebGL-accelerated route rendering (ArcLayer for shipping lanes, ScatterplotLayer for ports) with zero licensing costs, unlike Mapbox or Google Maps. The open-source `searoute-js` library can generate realistic maritime route polylines offline using Eurostat's marnet dataset, avoiding paid routing API costs in Phase 1.

The primary technical risks are: (1) floating-point arithmetic errors in financial calculations (mitigated by decimal.js), (2) the searoute-js library has low npm adoption and needs thorough testing before commitment, and (3) PDF generation on Vercel serverless may hit timeout limits for complex reports. All three are manageable with the documented prevention strategies.

---

## Key Findings

**Stack:** Next.js 14 + MapLibre GL + deck.gl + Recharts + @react-pdf/renderer. All free/open-source. Zero API costs in Phase 1.
**Architecture:** Static JSON data files + pure TypeScript calculators + layered map visualization. No database needed for Phase 1.
**Critical pitfall:** Floating-point math in duty/tariff calculations -- must use decimal.js from day one or every number will be subtly wrong.

---

## Implications for Roadmap

Based on research, suggested phase structure:

1. **Phase 1: Data Foundation + Core Calculators** -- Build the data layer first (HTS, ports, routes, FTZ as JSON datasets), then the calculation engine (landed cost, unit economics, container utilization, duty/tariff). These are pure TypeScript functions that can be fully unit-tested.
   - Addresses: HTS lookup, landed cost calculator, unit economics, container calculator
   - Avoids: API costs, database complexity, authentication overhead

2. **Phase 2: Visualization Layer** -- Add the interactive map (shipping routes, port locations) and dashboard charts (cost breakdowns, comparison visualizations). This phase depends on the data and calculator foundations from Phase 1.
   - Addresses: Route map, carrier comparison, dashboard UI
   - Avoids: Monolithic map component anti-pattern (build layers independently)

3. **Phase 3: FTZ Analyzer + Advanced Tools** -- The FTZ savings analyzer requires the most domain knowledge and depends on duty rate calculations from Phase 1. Tariff scenario modeling and multi-scenario comparison also build on the calculator engine.
   - Addresses: FTZ analyzer, tariff scenarios, scenario comparison
   - Avoids: Scope creep into operational TMS features

4. **Phase 4: Document Generation + Polish** -- PDF reports, Bill of Lading templates, export functionality. These are presentation-layer features that consume data from all earlier phases.
   - Addresses: PDF export, BOL generator, report templates
   - Avoids: Vercel timeout issues (start simple, add complexity incrementally)

5. **Phase 5 (Future): Live Integrations** -- Connect to carrier APIs (Maersk, CMA CGM), container tracking (Terminal49 free tier), and AIS vessel data. Only pursue when static data is no longer sufficient.
   - Addresses: Live vessel tracking, real-time schedules
   - Avoids: Premature API costs and fragile external dependencies

**Phase ordering rationale:**
- Data and calculators must come first because every other feature depends on them
- Maps and charts require data to visualize, so they follow the data layer
- FTZ analyzer is the most complex calculator and benefits from patterns established in Phase 1
- PDF generation consumes outputs from all calculators, so it comes last
- Live API integrations are deferred because Phase 1 uses free static data that is sufficient for analysis/proposal use cases

**Research flags for phases:**
- Phase 1: Needs deeper research on exact HTS JSON format from USITC download (verify field names, nesting structure)
- Phase 2: searoute-js needs hands-on testing with real port pairs before committing. Have Searoutes API as paid fallback.
- Phase 3: FTZ regulations are complex -- scope to federal benefits only, defer state-specific rules
- Phase 4: @react-pdf/renderer on Vercel serverless may need timeout investigation

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Core Stack (Next.js, TypeScript, Tailwind) | HIGH | Project constraint, well-understood |
| Mapping Stack (MapLibre + deck.gl + react-map-gl) | HIGH | All verified current versions, active maintenance, proven at scale |
| Chart Stack (Recharts + Tremor) | HIGH | Verified versions, massive adoption, Tailwind-native |
| Tariff Data Sources (USITC HTS) | HIGH | Verified REST API endpoint and download formats |
| FTZ Data Sources (OFIS) | HIGH | Verified official ITA database |
| Port Data (UN/LOCODE, World Port Index) | HIGH | Standard international datasets |
| Carrier Schedule APIs | MEDIUM | Verified portals exist (Maersk, CMA CGM), but registration/access terms need validation |
| Container Tracking APIs | MEDIUM | Terminal49 free tier verified, but 100-container limit may be restrictive |
| Maritime Route Calculation (searoute-js) | LOW-MEDIUM | Functional but low adoption (306 downloads/week). Test before committing. |
| Landed Cost API Services (Zonos) | MEDIUM | Verified pricing and API docs, but expensive for Phase 1 use case |

---

## Gaps to Address

- **HTS JSON structure**: Need to download and inspect the actual USITC JSON export to understand field names, nesting, and completeness before building the search index
- **searoute-js reliability**: Test with 10+ real SE Asia -> US port pairs to verify route quality before committing
- **SE Asia duty rates**: Need to compile country-specific duty rates from USITC DataWeb for Vietnam, Thailand, Indonesia, Cambodia -- this is manual research work
- **Carrier route data**: Major SE Asia -> US routes need to be compiled from carrier schedule pages -- no free aggregated dataset exists
- **FTZ location GeoJSON**: OFIS provides locations but not GeoJSON boundaries. May need to manually geocode FTZ zones for map display.
- **Cold chain specifics**: Reefer container premiums and cold chain cost factors need industry research beyond what web search provides

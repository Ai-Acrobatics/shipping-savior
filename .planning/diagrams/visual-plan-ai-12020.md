# AI-12020 — Rate Negotiation Agent (FBX benchmarks + counter-offers)

## Architecture

```
UI  /platform/negotiation -> RateNegotiationAgent.tsx
      | POST                          ^ NegotiationAnalysis JSON
      v                               |
API  /api/negotiation/analyze --------+   /api/negotiation/benchmarks (GET)
      |
      v
lib/negotiation/index.ts  analyzeQuote()
   benchmarks.ts   -> resolveLane(), normalizeToFeu()
   scoring.ts      -> percentileRank, variance%, grade A-F, verdict, surcharge outliers
   counter-offer.ts-> 3-round ladder + walk-away + savings (per-FEU / shipment / annual)
   script.ts       -> email counter, call points, objection handling, BATNA
      |
      v
lib/data/fbx-benchmarks.ts  (FBX01-04, FBX11-13 + documented derived lanes)
```

## Dependency graph

```mermaid
graph TD
  A[fbx-benchmarks.ts] --> B[benchmarks.ts]
  B --> C[scoring.ts]
  C --> D[counter-offer.ts]
  D --> E[script.ts]
  B & C & D & E --> F[index.ts analyzeQuote]
  F --> G[/api/negotiation/analyze]
  B --> H[/api/negotiation/benchmarks]
  G & H --> I[RateNegotiationAgent.tsx]
  I --> J[/platform/negotiation page]
  J --> K[Sidebar nav - Price section]
  F --> T[negotiation.test.ts]
```

## Component table

| Component | Purpose | Inputs | Outputs | Dependencies |
|---|---|---|---|---|
| fbx-benchmarks.ts | FBX lane index dataset | - | lane records | - |
| benchmarks.ts | lane resolution + FEU normalization + percentile curve | ports/regions, container type | LaneBenchmark | fbx-benchmarks |
| scoring.ts | grade a quote vs market | quote, benchmark | percentile, grade, verdict, outliers | benchmarks, freight-rates |
| counter-offer.ts | counter ladder + savings math | score, benchmark, volume | ladder, walk-away, savings | scoring |
| script.ts | negotiation email/call/objections | score, ladder, leverage | scripts | counter-offer |
| API routes | HTTP surface | JSON body | analysis | auth, lib |
| UI page | operator surface | form | rendered analysis | API |

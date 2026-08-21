# Visual Plan — AI-12021 FTZ Optimizer Agent

Turn the read-only FTZ calculator into a recommendation engine:
PF/NPF election, inverted-tariff detection, 5-yr NPV.

## Architecture

```
UI                          API                       ENGINE (pure, testable)
FTZOptimizerAgent.tsx  ──▶  POST /api/ftz/optimize ──▶ optimizeFtz()  (src/lib/ftz-optimizer)
  BOM component table         auth() gate               duty.ts            rate resolution + PF-forced (301/232)
  finished good               zod validation            inverted-tariff.ts weighted spread detection
  zone economics              400 on guard errors       election.ts        PF vs NPF vs MIXED
  verdict / election card                               savings.ts         MPF weekly entry, deferral, re-export
  5-yr NPV table                                        npv.ts             DCF, payback, IRR
                                                        index.ts           orchestrator + guards

DATA: lib/data/hts-tariffs.ts (getEffectiveDutyRate: base + Section 301)
      lib/calculators/landed-cost.ts (MPF_RATE / MPF_MIN / MPF_MAX)
```

## Dependency graph

```mermaid
graph TD
    A[types.ts] --> B[duty.ts]
    B --> C[inverted-tariff.ts]
    B --> D[savings.ts]
    C --> E[election.ts]
    E --> F[npv.ts]
    D --> F
    F --> G[index.ts orchestrator]
    G --> H[ftz-optimizer.test.ts]
    G --> I[POST /api/ftz/optimize]
    I --> J[FTZOptimizerAgent.tsx]
    J --> K[/platform/ftz-optimizer + Sidebar]
```

## Components

| Component | Purpose | Inputs | Outputs | Dependencies |
|---|---|---|---|---|
| duty.ts | Per-component + finished-good effective rates; flag Section 301/232 components CBP forces into PF status | components, finished HTS, country of origin | rated components, eligible vs PF-forced value split | hts-tariffs.ts |
| inverted-tariff.ts | Detect inverted duty structure (component rate > finished rate) | rated components, finished rate | spread, eligible value, annual savings | duty.ts |
| election.ts | Recommend PF / NPF / MIXED with rationale + confidence | rated components, inversion, tariff trajectory | election + duty-by-year per election | duty.ts, inverted-tariff.ts |
| savings.ts | Non-duty FTZ benefits | annual value, entries/yr, storage months, cost of capital | MPF weekly-entry savings, deferral float, re-export/scrap exemption | landed-cost MPF constants |
| npv.ts | 5-year discounted cash flow | yearly net benefit, activation + opex, discount rate | NPV, payback months, IRR, cumulative curve | - |
| index.ts | Orchestrator + input guards | FtzOptimizerInput | FtzOptimization (verdict, election, NPV, warnings) | all above |
| /api/ftz/optimize | Thin auth + zod wrapper | JSON body | { optimization } | index.ts, auth |
| FTZOptimizerAgent.tsx | Input + results UI | user form | rendered recommendation | API route |

## Domain rules encoded

- PF (Privileged Foreign): rate + classification frozen at admission, on the merchandise
  in its admitted (component) condition. Hedges rising tariffs.
- NPF (Non-Privileged Foreign): duty assessed at withdrawal on the finished article's
  classification and the rate then in effect. This is the only route to inverted-tariff
  relief, and it requires production authority in the zone.
- Section 301 / Section 232 merchandise must be admitted in PF status, so its value can
  never receive inverted-tariff relief - it stays on the component rate even under an
  otherwise-NPF election (hence the MIXED election outcome).
- Re-exported merchandise never enters US commerce, so no duty is owed at all.
- Weekly entry: an FTZ files one CBP entry per week, so MPF is capped once per week
  instead of once per shipment.
- HMF is NOT avoided by an FTZ - it is paid quarterly on zone withdrawals.

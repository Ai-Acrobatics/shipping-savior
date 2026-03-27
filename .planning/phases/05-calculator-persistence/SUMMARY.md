# Phase 5: Calculator Persistence — Summary

**Status:** COMPLETE
**Completed:** 2026-03-26

## What Was Built

### Foundation (Tasks 1, 13)
- **Type definitions** (`src/lib/types/calculations.ts`): CalculatorType enum, input shapes for all 6 calculators, SavedCalculation interface, labels/routes/color maps
- **useLoadCalculation hook** (`src/lib/hooks/useLoadCalculation.ts`): Reusable hook that reads `?loadId` from URL params, fetches saved calculation from API, and returns loaded inputs

### API Layer (Tasks 2, 3)
- **POST /api/calculations** — Save new calculation with type, name, inputs (JSONB), outputs (JSONB), scoped to user's org
- **GET /api/calculations** — List calculations for user's org with optional `?type=` filter, ordered newest first
- **GET /api/calculations/[id]** — Fetch single calculation, org-scoped (returns 404 for wrong org)
- **PUT /api/calculations/[id]** — Rename calculation (name + updated_at)
- **DELETE /api/calculations/[id]** — Delete calculation, org-scoped

### UI Components (Tasks 4, 5)
- **SaveCalculationButton** (`src/components/platform/SaveCalculationButton.tsx`): Reusable save button with native `<dialog>` modal, name input, auto-generated default name, toast notifications, Enter/Escape keyboard handling
- **CalculationHistory** (`src/components/platform/CalculationHistory.tsx`): Desktop table + mobile card layout, inline rename on double-click, delete with confirmation, type-colored badges, relative time display, skeleton loading state, empty state

### History Page (Task 6)
- **`src/app/(platform)/platform/history/page.tsx`**: Full history page with search input, calculator type filter dropdown, result count, fetches from API, handles load (navigates to calculator with `?loadId=`), delete, and rename

### Calculator Integration (Tasks 7-12)
All 6 calculators received:
- `showSaveButton` prop (only shown when rendered inside platform pages)
- `SaveCalculationButton` with `getInputs()` / `getOutputs()` callbacks capturing current calculator state
- `useLoadCalculation` hook for restoring saved inputs from `?loadId` URL param
- `useEffect` that maps loaded inputs back to individual state setters

**Calculators integrated:**
| Calculator | Type Enum | Component File |
|---|---|---|
| Landed Cost | `landed_cost` | `LandedCostCalculator.tsx` |
| Unit Economics | `unit_economics` | `UnitEconomicsCalculator.tsx` |
| FTZ Savings | `ftz_savings` | `FTZSavingsCalculator.tsx` |
| PF vs NPF | `pf_npf_comparison` | `PFNPFCalculator.tsx` |
| Container Utilization | `container_utilization` | `ContainerUtilizationCalculator.tsx` |
| Tariff Scenario | `tariff_scenario` | `TariffScenarioBuilder.tsx` |

### Platform Pages
All 6 calculator pages under `src/app/(platform)/platform/calculators/` pass `showSaveButton` to their calculator component.

## Architecture Decisions
- **Callback pattern** (`getInputs`/`getOutputs`) for SaveCalculationButton avoids coupling the save component to each calculator's state shape
- **Native `<dialog>` element** for the modal (zero dependency)
- **Org-scoped queries** at the API layer (all queries filter by `org_id` from session) — no cross-tenant access possible
- **`useLoadCalculation` hook** centralizes the load-from-history logic so each calculator only needs a `useEffect` to map inputs to state

## Files Created/Modified
- `src/lib/types/calculations.ts` (new)
- `src/lib/hooks/useLoadCalculation.ts` (new)
- `src/app/api/calculations/route.ts` (new)
- `src/app/api/calculations/[id]/route.ts` (new)
- `src/components/platform/SaveCalculationButton.tsx` (new)
- `src/components/platform/CalculationHistory.tsx` (new)
- `src/app/(platform)/platform/history/page.tsx` (new)
- `src/components/LandedCostCalculator.tsx` (modified)
- `src/components/UnitEconomicsCalculator.tsx` (modified)
- `src/components/FTZSavingsCalculator.tsx` (modified)
- `src/components/PFNPFCalculator.tsx` (modified)
- `src/components/ContainerUtilizationCalculator.tsx` (modified)
- `src/components/TariffScenarioBuilder.tsx` (modified)
- `src/app/(platform)/platform/calculators/*/page.tsx` (6 pages modified)

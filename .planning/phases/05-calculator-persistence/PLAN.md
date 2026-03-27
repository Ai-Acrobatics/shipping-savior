# Phase 5: Calculator Persistence

**Requirement:** R4 (Calculator Persistence)
**Goal:** All 6 calculators save results to database. Users can view history and reload.
**Status:** COMPLETE (2026-03-26)
**Depends on:** Phase 1 (calculations table), Phase 2 (auth), Phase 4 (platform shell)

## Success Criteria

- [x] Save button on each calculator stores inputs + outputs + type + user-defined name
- [x] /platform/history shows all saved calculations for user's org
- [x] Click a saved calculation loads it back into the calculator with all inputs pre-filled
- [x] All 6 calculator types supported
- [x] Calculations scoped to org_id (no cross-tenant access)

---

## Calculator Input/Output Shapes Reference

Each calculator type stores its inputs/outputs as JSONB. Here are the shapes:

### 1. Landed Cost (`landed_cost`)
**Inputs:** `LandedCostInput` from `src/lib/types.ts`
```
productDescription, htsCode, countryOfOrigin, unitCostFOB, totalUnits,
containerType, originPort, destPort, shippingMode, freightCostTotal,
customsBrokerFee, insuranceRate, drayageCost, warehousingPerUnit,
fulfillmentPerUnit, useFTZ, ftzStorageMonths, ftzStorageFeePerUnit
```
**Outputs:** `LandedCostResult` — perUnit totals, grand total, breakdown, effective rates

### 2. Unit Economics (`unit_economics`)
**Inputs (7 state vars in UnitEconomicsCalculator.tsx):**
```
unitCost, unitsPerContainer, containerCost, dutyRate,
fulfillmentCost, wholesaleMarkup, retailPrice
```
**Outputs:** `EconomicsResult` — landedCost, wholesalePrice, margins, containerProfit

### 3. FTZ Savings (`ftz_savings`)
**Inputs (5 state vars in FTZSavingsCalculator.tsx):**
```
unitValue, totalUnits, lockedRate, currentRate, months
```
**Outputs:** `FTZResult` — dutyWithoutFTZ, dutyWithFTZ, savings, savingsPercent, monthlyWithdrawals

### 4. PF/NPF Comparison (`pf_npf_comparison`)
**Inputs:** `PFNPFInputs` interface in PFNPFCalculator.tsx
```
currentDutyRate, futureDutyRate, monthlyImportVolume,
storageDurationMonths, storagePerMonth
```
**Outputs:** `PFNPFResult` — pfTotalDuty, npfTotalDuty, winner, breakEvenMonth, withdrawalTable

### 5. Container Utilization (`container_utilization`)
**Inputs:** `ContainerUtilizationInput` from `src/lib/types.ts`
```
containerType, unitLengthCm, unitWidthCm, unitHeightCm, unitWeightKg,
masterCasePcs, masterCaseLengthCm, masterCaseWidthCm, masterCaseHeightCm, masterCaseWeightKg
```
**Outputs:** `ContainerUtilizationResult` — byVolume, byWeight, bindingConstraint, optimalUnits

### 6. Tariff Scenario (`tariff_scenario`)
**Inputs (array of TariffScenario in TariffScenarioBuilder.tsx):**
```
scenarios: Array<{ name, country, baseDutyRate, section301Rate, unitValue, annualUnits, color }>
```
**Outputs:**
```
results: Array<{ totalDutyRate, annualDutyCost, dutyPerUnit, landedCostIncrease, riskLevel }>
bestScenario, worstScenario, delta
```

---

## Task 1: Type Definitions for Calculator Persistence

**File:** `src/lib/types/calculations.ts` (new)

Define TypeScript types that map each calculator's state to the JSONB `inputs` and `outputs` columns.

```typescript
// Calculator type enum matching DB enum
export type CalculatorType =
  | 'landed_cost'
  | 'unit_economics'
  | 'ftz_savings'
  | 'pf_npf_comparison'
  | 'container_utilization'
  | 'tariff_scenario';

// Input shapes per calculator type
export interface LandedCostInputs {
  productDescription: string;
  htsCode: string;
  countryOfOrigin: string;
  unitCostFOB: number;
  totalUnits: number;
  containerType: string;
  originPort: string;
  destPort: string;
  shippingMode: string;
  freightCostTotal: number;
  customsBrokerFee: number;
  insuranceRate: number;
  drayageCost: number;
  warehousingPerUnit: number;
  fulfillmentPerUnit: number;
  useFTZ: boolean;
  ftzStorageMonths: number;
  ftzStorageFeePerUnit: number;
}

export interface UnitEconomicsInputs {
  unitCost: number;
  unitsPerContainer: number;
  containerCost: number;
  dutyRate: number;
  fulfillmentCost: number;
  wholesaleMarkup: number;
  retailPrice: number;
}

export interface FTZSavingsInputs {
  unitValue: number;
  totalUnits: number;
  lockedRate: number;
  currentRate: number;
  months: number;
}

export interface PFNPFInputs {
  currentDutyRate: number;
  futureDutyRate: number;
  monthlyImportVolume: number;
  storageDurationMonths: number;
  storagePerMonth: number;
}

export interface ContainerUtilInputs {
  containerType: string;
  unitLengthCm: number;
  unitWidthCm: number;
  unitHeightCm: number;
  unitWeightKg: number;
  masterCasePcs?: number;
  masterCaseLengthCm?: number;
  masterCaseWidthCm?: number;
  masterCaseHeightCm?: number;
  masterCaseWeightKg?: number;
}

export interface TariffScenarioInputs {
  scenarios: Array<{
    name: string;
    country: string;
    baseDutyRate: number;
    section301Rate: number;
    unitValue: number;
    annualUnits: number;
    color: string;
  }>;
}

// Discriminated union for type-safe input/output mapping
export type CalculatorInputs =
  | { type: 'landed_cost'; data: LandedCostInputs }
  | { type: 'unit_economics'; data: UnitEconomicsInputs }
  | { type: 'ftz_savings'; data: FTZSavingsInputs }
  | { type: 'pf_npf_comparison'; data: PFNPFInputs }
  | { type: 'container_utilization'; data: ContainerUtilInputs }
  | { type: 'tariff_scenario'; data: TariffScenarioInputs };

// Saved calculation record (matches DB row shape)
export interface SavedCalculation {
  id: string;
  orgId: string;
  userId: string;
  calculatorType: CalculatorType;
  name: string;
  inputs: Record<string, unknown>;
  outputs: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

// Human-readable labels for calculator types
export const CALCULATOR_TYPE_LABELS: Record<CalculatorType, string> = {
  landed_cost: 'Landed Cost',
  unit_economics: 'Unit Economics',
  ftz_savings: 'FTZ Savings',
  pf_npf_comparison: 'PF vs NPF',
  container_utilization: 'Container Utilization',
  tariff_scenario: 'Tariff Scenario',
};
```

**Verification:** `npx tsc --noEmit` compiles clean.

---

## Task 2: API Route — List & Create Calculations

**File:** `src/app/api/calculations/route.ts` (new)

### GET `/api/calculations`
- Authenticate request via `auth()` (NextAuth helper)
- Look up user's `org_id` from `org_members` table
- Query `calculations` table filtered by `org_id`, ordered by `created_at DESC`
- Optional query param `?type=landed_cost` filters by `calculator_type`
- Return `{ calculations: SavedCalculation[] }`

### POST `/api/calculations`
- Authenticate request
- Parse body: `{ calculatorType, name, inputs, outputs }`
- Validate: `calculatorType` is one of the 6 enum values, `name` is non-empty string (max 255 chars), `inputs` and `outputs` are objects
- Insert into `calculations` with user's `org_id` and `user_id`
- Return `{ calculation: SavedCalculation }` with 201 status

**Error responses:**
- 401 if unauthenticated
- 400 if validation fails (missing fields, invalid type)
- 500 on DB error

**Verification:** `curl` test with valid JWT returns 201 and created record.

---

## Task 3: API Route — Get, Update, Delete Single Calculation

**File:** `src/app/api/calculations/[id]/route.ts` (new)

### GET `/api/calculations/[id]`
- Authenticate request
- Query `calculations` where `id = param` AND `org_id = user's org`
- Return 404 if not found (org_id filter prevents cross-tenant access)
- Return `{ calculation: SavedCalculation }`

### PUT `/api/calculations/[id]`
- Authenticate request
- Parse body: `{ name }` (only the name is editable after creation)
- Validate: `name` is non-empty string (max 255 chars)
- Update `name` and `updated_at` where `id = param` AND `org_id = user's org`
- Return updated record or 404

### DELETE `/api/calculations/[id]`
- Authenticate request
- Delete where `id = param` AND `org_id = user's org`
- Return 204 on success, 404 if not found

**Security:** All operations filter by `org_id` — users cannot access, modify, or delete calculations from other orgs.

**Verification:** Test GET/PUT/DELETE with valid and invalid IDs. Confirm cross-org access returns 404.

---

## Task 4: SaveCalculationButton Component

**File:** `src/components/platform/SaveCalculationButton.tsx` (new)

A reusable button + modal component that any calculator can use to save its current state.

### Props
```typescript
interface SaveCalculationButtonProps {
  calculatorType: CalculatorType;
  getInputs: () => Record<string, unknown>;    // called on save to snapshot current inputs
  getOutputs: () => Record<string, unknown>;   // called on save to snapshot current outputs
  defaultName?: string;                         // pre-filled name suggestion
  onSaved?: (calculation: SavedCalculation) => void;  // callback after successful save
}
```

### Behavior
1. Renders a "Save" button (lucide `Save` icon + text)
2. On click, opens a modal/dialog with:
   - Text input for calculation name (pre-filled with `defaultName` or auto-generated like "Landed Cost - Mar 26")
   - "Save" and "Cancel" buttons
3. On confirm:
   - Calls `getInputs()` and `getOutputs()` to snapshot current calculator state
   - POST to `/api/calculations` with `{ calculatorType, name, inputs, outputs }`
   - Show success toast on 201
   - Show error toast on failure
   - Call `onSaved` callback with created record
4. Loading state on save button while request is in-flight
5. Keyboard: Enter to save, Escape to cancel

### Implementation Notes
- Use native `<dialog>` element for the modal (no dependency needed)
- Toast notifications: use a simple `useState`-based toast or a shared toast context (check if one exists from Phase 4)
- The `getInputs`/`getOutputs` callback pattern avoids the component needing to know about each calculator's state shape

**Verification:** Renders without error. Modal opens/closes. API call fires with correct payload.

---

## Task 5: CalculationHistory Component

**File:** `src/components/platform/CalculationHistory.tsx` (new)

A table component that displays saved calculations and provides actions.

### Props
```typescript
interface CalculationHistoryProps {
  calculations: SavedCalculation[];
  onLoad: (calculation: SavedCalculation) => void;   // navigate to calculator with loaded inputs
  onDelete: (id: string) => void;
  onRename: (id: string, newName: string) => void;
  isLoading?: boolean;
}
```

### Columns
1. **Name** — editable on double-click (inline rename, calls `onRename`)
2. **Type** — calculator type label with color-coded badge
3. **Created** — relative time ("2 hours ago") with full date tooltip
4. **Actions** — Load (arrow icon), Delete (trash icon with confirmation)

### Features
- Empty state: "No saved calculations yet. Use any calculator and click Save."
- Skeleton loading state when `isLoading` is true
- Delete confirmation: "Are you sure? This cannot be undone."
- Clicking "Load" calls `onLoad` which navigates to the appropriate calculator page with `?loadId=<uuid>`

### Implementation Notes
- Calculator type badge colors: use a consistent color map (ocean for landed cost, cargo for unit economics, etc.)
- Date formatting: use `Intl.RelativeTimeFormat` or a simple helper (avoid adding date-fns)
- Responsive: on mobile, collapse to card layout instead of table

**Verification:** Renders with mock data. Actions trigger callbacks.

---

## Task 6: Platform History Page

**File:** `src/app/platform/history/page.tsx` (new)

### Behavior
1. Server component that verifies auth (redirect to `/login` if not authenticated)
2. Renders a client component `HistoryPageClient` that:
   - Fetches calculations on mount: `GET /api/calculations`
   - Optional filter dropdown for calculator type (all / landed cost / unit economics / etc.)
   - Renders `<CalculationHistory>` with fetched data
   - Delete handler: `DELETE /api/calculations/[id]`, then remove from local state
   - Rename handler: `PUT /api/calculations/[id]`, then update local state
   - Load handler: router.push to appropriate calculator page with `?loadId=<uuid>`

### Calculator Type to Route Map
```typescript
const CALCULATOR_ROUTES: Record<CalculatorType, string> = {
  landed_cost: '/platform/calculators/landed-cost',
  unit_economics: '/platform/calculators/unit-economics',
  ftz_savings: '/platform/calculators/ftz-savings',
  pf_npf_comparison: '/platform/calculators/pf-npf',
  container_utilization: '/platform/calculators/container-utilization',
  tariff_scenario: '/platform/calculators/tariff-scenarios',
};
```

**Note:** These routes may need to map to the existing calculator locations (currently under `/dashboard/calculators/` and `/ftz-analyzer/`). During execution, check whether Phase 4 relocates calculators under `/platform/calculators/` or keeps them in their current locations. If calculators stay in their current locations, update the route map accordingly:

```typescript
// Fallback if calculators aren't moved:
const CALCULATOR_ROUTES: Record<CalculatorType, string> = {
  landed_cost: '/dashboard/calculators/landed-cost',
  unit_economics: '/dashboard/calculators/unit-economics',
  ftz_savings: '/ftz-analyzer',
  pf_npf_comparison: '/ftz-analyzer/pf-calculator',
  container_utilization: '/dashboard/calculators/container-utilization',
  tariff_scenario: '/dashboard/calculators/tariff-scenarios',
};
```

### Page Layout
- Page title: "Calculation History"
- Filter bar: dropdown for calculator type + search input (filters by name)
- Results count: "Showing X of Y calculations"
- `<CalculationHistory>` table below

**Verification:** Page loads at `/platform/history`. Filter narrows results. Delete removes row.

---

## Task 7: Wire Save Button into Landed Cost Calculator

**File:** Edit existing landed cost calculator component (find the UI component that renders the form — likely in `src/app/dashboard/calculators/landed-cost/` or directly uses `src/lib/calculators/landed-cost.ts`)

### Changes
1. Import `SaveCalculationButton` and `CalculatorType`
2. Accept optional `initialInputs` prop (for loading saved calculations)
3. Add `useSearchParams()` to check for `?loadId=<uuid>`:
   - If present, fetch `GET /api/calculations/<loadId>` on mount
   - Set all state variables from the saved `inputs` object
4. Add `<SaveCalculationButton>` to the results area:
   - `calculatorType="landed_cost"`
   - `getInputs` returns current form state as `LandedCostInputs`
   - `getOutputs` returns the current `LandedCostResult`
   - `defaultName` auto-generates from product description or HTS code

**Note:** The landed cost calculator's computation is in `src/lib/calculators/landed-cost.ts` but the UI component that renders the form needs to be located. It may be a page component in `src/app/dashboard/calculators/landed-cost/page.tsx` or an inline component. During execution, trace from the page to the form to find the right file.

**Verification:** Save button appears. Clicking save stores to DB. Loading via `?loadId` pre-fills all inputs.

---

## Task 8: Wire Save Button into Unit Economics Calculator

**File:** `src/components/UnitEconomicsCalculator.tsx` (edit)

### Changes
1. Import `SaveCalculationButton`
2. Accept optional `defaultInputs?: UnitEconomicsInputs` prop
3. Add `useSearchParams()` + `useEffect` for `?loadId` param:
   - Fetch saved calculation and set state: `setUnitCost`, `setUnitsPerContainer`, etc.
4. Add `<SaveCalculationButton>` after the results section:
   - `calculatorType="unit_economics"`
   - `getInputs` returns `{ unitCost, unitsPerContainer, containerCost, dutyRate, fulfillmentCost, wholesaleMarkup, retailPrice }`
   - `getOutputs` returns the `result` object from `calculate()`
   - `defaultName`: `"Unit Economics - ${unitCost}/unit"`

**Verification:** Save/load round-trips correctly. All 7 inputs restore on load.

---

## Task 9: Wire Save Button into FTZ Savings Calculator

**File:** `src/components/FTZSavingsCalculator.tsx` (edit)

### Changes
1. Import `SaveCalculationButton`
2. Add `useSearchParams()` + load logic for `?loadId`
3. Add `<SaveCalculationButton>` after results:
   - `calculatorType="ftz_savings"`
   - `getInputs` returns `{ unitValue, totalUnits, lockedRate, currentRate, months }`
   - `getOutputs` returns the `result` from `calculateFTZ()`
   - `defaultName`: `"FTZ Savings - ${totalUnits} units"`

**Verification:** Save/load round-trips. All 5 inputs restore.

---

## Task 10: Wire Save Button into PF/NPF Calculator

**File:** `src/components/PFNPFCalculator.tsx` (edit)

### Changes
1. Import `SaveCalculationButton`
2. Add `useSearchParams()` + load logic for `?loadId`
3. Add `<SaveCalculationButton>` after results:
   - `calculatorType="pf_npf_comparison"`
   - `getInputs` returns `{ currentDutyRate, futureDutyRate, monthlyImportVolume, storageDurationMonths, storagePerMonth }`
   - `getOutputs` returns the `PFNPFResult`
   - `defaultName`: `"PF vs NPF - ${currentDutyRate}% locked"`

**Verification:** Save/load round-trips. All 5 inputs restore.

---

## Task 11: Wire Save Button into Container Utilization Calculator

**File:** Find the UI component for container utilization (computation is in `src/lib/calculators/container-utilization.ts`, the UI component rendering the form needs to be located — likely a page in `src/app/dashboard/calculators/container-utilization/`)

### Changes
1. Import `SaveCalculationButton`
2. Add `useSearchParams()` + load logic for `?loadId`
3. Add `<SaveCalculationButton>` after results:
   - `calculatorType="container_utilization"`
   - `getInputs` returns `ContainerUtilInputs` (all dimension/weight fields)
   - `getOutputs` returns the `ContainerUtilizationResult`
   - `defaultName`: `"Container Util - ${containerType}"`

**Verification:** Save/load round-trips. All dimension inputs restore.

---

## Task 12: Wire Save Button into Tariff Scenario Builder

**File:** `src/components/TariffScenarioBuilder.tsx` (edit)

### Changes
1. Import `SaveCalculationButton`
2. Add `useSearchParams()` + load logic for `?loadId`:
   - On load, call `setScenarios()` with the saved `inputs.scenarios` array
3. Add `<SaveCalculationButton>` in the header area (next to "Add Scenario" button):
   - `calculatorType="tariff_scenario"`
   - `getInputs` returns `{ scenarios }` (the full scenarios array)
   - `getOutputs` returns `{ results, bestScenario: bestScenario.name, worstScenario: worstScenario.name, delta }`
   - `defaultName`: `"Tariff Scenarios - ${scenarios.length} scenarios"`

**Note:** This calculator already has localStorage-based persistence via `src/lib/scenario-storage.ts` (`SavedScenariosManager`). The DB persistence supplements this — it scopes to org, enables cross-device access, and shows in `/platform/history`. The existing localStorage flow can remain as a quick-save fallback.

**Verification:** Save stores all scenarios. Load restores all scenarios including colors and names.

---

## Task 13: Add "useLoadCalculation" Hook

**File:** `src/lib/hooks/useLoadCalculation.ts` (new)

Extract the shared `?loadId` loading logic into a reusable hook to avoid duplicating fetch + state-setting logic in each calculator.

```typescript
export function useLoadCalculation(calculatorType: CalculatorType) {
  const searchParams = useSearchParams();
  const [loadedInputs, setLoadedInputs] = useState<Record<string, unknown> | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadId = searchParams.get('loadId');
    if (!loadId) return;

    setIsLoading(true);
    fetch(`/api/calculations/${loadId}`)
      .then(res => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then(data => {
        if (data.calculation.calculatorType !== calculatorType) {
          console.warn('Calculator type mismatch');
          return;
        }
        setLoadedInputs(data.calculation.inputs);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [searchParams, calculatorType]);

  return { loadedInputs, isLoading };
}
```

Each calculator then uses:
```typescript
const { loadedInputs } = useLoadCalculation('unit_economics');
useEffect(() => {
  if (loadedInputs) {
    setUnitCost(loadedInputs.unitCost as number);
    setUnitsPerContainer(loadedInputs.unitsPerContainer as number);
    // ... etc
  }
}, [loadedInputs]);
```

**Verification:** Hook fetches on mount when `?loadId` is present. Returns null when no param.

---

## Execution Order

```
Task 1  (type definitions)              — no dependencies
Task 13 (useLoadCalculation hook)       — depends on Task 1
Task 2  (API: list + create)            — depends on Task 1
Task 3  (API: get + update + delete)    — depends on Task 1
Task 4  (SaveCalculationButton)         — depends on Task 1, Task 2
Task 5  (CalculationHistory component)  — depends on Task 1
Task 6  (History page)                  — depends on Task 3, Task 5
Tasks 7-12 (wire into calculators)      — depends on Tasks 4, 13
```

### Parallel Waves

**Wave 1:** Task 1
**Wave 2:** Tasks 2, 3, 5, 13 (all depend only on Task 1)
**Wave 3:** Tasks 4, 6 (Task 4 depends on Task 2; Task 6 depends on Tasks 3, 5)
**Wave 4:** Tasks 7, 8, 9, 10, 11, 12 (all depend on Tasks 4, 13 — can run in parallel)

---

## Verification (Phase-Level)

After all 13 tasks complete:

1. **Save round-trip:** Open each of the 6 calculators, modify inputs, click Save, enter a name, confirm. Check `/platform/history` shows the entry.
2. **Load round-trip:** From `/platform/history`, click Load on a saved calculation. Verify the calculator opens with all inputs pre-filled and outputs match.
3. **Cross-org isolation:** Log in as User A (Org 1), save a calculation. Log in as User B (Org 2). Confirm `/platform/history` shows no calculations from Org 1. Confirm `GET /api/calculations/<org1-calc-id>` returns 404.
4. **Rename:** Double-click a calculation name in history. Edit. Confirm PUT fires and name persists on page refresh.
5. **Delete:** Click delete on a calculation. Confirm dialog appears. Confirm deletion. Row disappears. Page refresh confirms it is gone.
6. **Filter:** Save calculations of different types. Use the type filter dropdown. Confirm only matching type shows.
7. **TypeScript:** `npx tsc --noEmit` compiles clean across all edited files.

---
*Created: 2026-03-26*

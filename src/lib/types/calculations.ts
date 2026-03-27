// ============================================================
// Calculator Persistence — Type Definitions
// Phase 5: M1 Foundation
// ============================================================

// Calculator type enum matching DB enum
export type CalculatorType =
  | 'landed_cost'
  | 'unit_economics'
  | 'ftz_savings'
  | 'pf_npf_comparison'
  | 'container_utilization'
  | 'tariff_scenario';

// ─── Input shapes per calculator type ─────────────────────────

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

// ─── Discriminated union for type-safe input/output mapping ───

export type CalculatorInputs =
  | { type: 'landed_cost'; data: LandedCostInputs }
  | { type: 'unit_economics'; data: UnitEconomicsInputs }
  | { type: 'ftz_savings'; data: FTZSavingsInputs }
  | { type: 'pf_npf_comparison'; data: PFNPFInputs }
  | { type: 'container_utilization'; data: ContainerUtilInputs }
  | { type: 'tariff_scenario'; data: TariffScenarioInputs };

// ─── Saved calculation record (matches DB row shape) ──────────

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

// ─── Human-readable labels ────────────────────────────────────

export const CALCULATOR_TYPE_LABELS: Record<CalculatorType, string> = {
  landed_cost: 'Landed Cost',
  unit_economics: 'Unit Economics',
  ftz_savings: 'FTZ Savings',
  pf_npf_comparison: 'PF vs NPF',
  container_utilization: 'Container Utilization',
  tariff_scenario: 'Tariff Scenario',
};

// ─── Calculator type to route map ─────────────────────────────

export const CALCULATOR_ROUTES: Record<CalculatorType, string> = {
  landed_cost: '/platform/calculators/landed-cost',
  unit_economics: '/platform/calculators/unit-economics',
  ftz_savings: '/platform/calculators/ftz-savings',
  pf_npf_comparison: '/platform/calculators/pf-npf',
  container_utilization: '/platform/calculators/container',
  tariff_scenario: '/platform/calculators/tariff-scenario',
};

// ─── Badge colors per calculator type ─────────────────────────

export const CALCULATOR_TYPE_COLORS: Record<CalculatorType, { bg: string; text: string; border: string }> = {
  landed_cost: { bg: 'bg-ocean-50', text: 'text-ocean-700', border: 'border-ocean-200' },
  unit_economics: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  ftz_savings: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  pf_npf_comparison: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  container_utilization: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  tariff_scenario: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
};

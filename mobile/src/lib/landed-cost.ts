// Landed-cost math, ported from the web app (src/lib/calculators/landed-cost.ts).
// The web version resolves duty rate from the HTS dataset; on mobile the user
// enters an effective duty rate % directly (HTS lookup is available via the
// AI assistant tab, which calls the server-side tools).

export const MPF_RATE = 0.003464; // Merchandise Processing Fee: 0.3464%
export const MPF_MIN = 31.67;
export const MPF_MAX = 614.35;
export const HMF_RATE = 0.00125; // Harbor Maintenance Fee: 0.125%

export interface MobileLandedCostInput {
  unitCostFOB: number;
  totalUnits: number;
  dutyRatePct: number; // effective duty rate, e.g. 7.5 for 7.5%
  freightCostTotal: number;
  insuranceRatePct: number; // e.g. 0.3 for 0.3% of cargo value
  customsBrokerFee: number;
  drayageCost: number;
  warehousingPerUnit: number;
  fulfillmentPerUnit: number;
}

export interface CostLine {
  label: string;
  total: number;
  perUnit: number;
}

export interface MobileLandedCostResult {
  lines: CostLine[];
  totalLandedCost: number;
  landedCostPerUnit: number;
  effectiveMarkupPct: number; // landed vs FOB
}

export function calculateLandedCost(
  input: MobileLandedCostInput
): MobileLandedCostResult {
  const {
    unitCostFOB,
    totalUnits,
    dutyRatePct,
    freightCostTotal,
    insuranceRatePct,
    customsBrokerFee,
    drayageCost,
    warehousingPerUnit,
    fulfillmentPerUnit,
  } = input;

  const units = Math.max(totalUnits, 1);
  const cargoValue = unitCostFOB * units;
  const insurance = cargoValue * (insuranceRatePct / 100);
  const dutiableValue = cargoValue; // FOB basis for US entries
  const duty = dutiableValue * (dutyRatePct / 100);
  const mpf = Math.min(Math.max(dutiableValue * MPF_RATE, MPF_MIN), MPF_MAX);
  const hmf = dutiableValue * HMF_RATE; // ocean shipments only
  const warehousing = warehousingPerUnit * units;
  const fulfillment = fulfillmentPerUnit * units;

  const lines: CostLine[] = [
    { label: 'FOB Cargo Value', total: cargoValue, perUnit: unitCostFOB },
    { label: 'Ocean Freight', total: freightCostTotal, perUnit: freightCostTotal / units },
    { label: 'Insurance', total: insurance, perUnit: insurance / units },
    { label: 'Duty', total: duty, perUnit: duty / units },
    { label: 'MPF + HMF', total: mpf + hmf, perUnit: (mpf + hmf) / units },
    { label: 'Customs Broker', total: customsBrokerFee, perUnit: customsBrokerFee / units },
    { label: 'Drayage', total: drayageCost, perUnit: drayageCost / units },
    { label: 'Warehousing', total: warehousing, perUnit: warehousingPerUnit },
    { label: 'Fulfillment', total: fulfillment, perUnit: fulfillmentPerUnit },
  ].filter((l) => l.total > 0);

  const totalLandedCost = lines.reduce((sum, l) => sum + l.total, 0);
  const landedCostPerUnit = totalLandedCost / units;
  const effectiveMarkupPct =
    unitCostFOB > 0 ? ((landedCostPerUnit - unitCostFOB) / unitCostFOB) * 100 : 0;

  return { lines, totalLandedCost, landedCostPerUnit, effectiveMarkupPct };
}

export function formatCurrency(value: number, decimals = 2): string {
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

// ============================================================
// Container Utilization Calculator
// Phase 2: Core Calculators
//
// Calculates how many units fit in a container by:
//  - Volume (CBM)
//  - Weight (kg)
// Shows which constraint is binding and cost-per-unit at scale.
// ============================================================

import type {
  ContainerUtilizationInput,
  ContainerUtilizationResult,
  ContainerType,
} from "@/lib/types";
import { CONTAINER_SPECS, FCL_CONTAINER_TYPES } from "@/lib/data/containers";

/**
 * Calculate unit volume in CBM from centimeters
 */
function unitVolumeCBM(l: number, w: number, h: number): number {
  return (l * w * h) / 1_000_000; // cm³ → m³
}

/**
 * Calculate container utilization for a given container type and unit dimensions
 */
export function calculateContainerUtilization(
  input: ContainerUtilizationInput
): ContainerUtilizationResult {
  const spec = CONTAINER_SPECS[input.containerType];

  // Determine effective unit dimensions
  // If master case is specified, use that as packing unit
  let packUnitL: number;
  let packUnitW: number;
  let packUnitH: number;
  let packUnitWeight: number;
  let unitsPerPack: number;

  if (
    input.masterCasePcs &&
    input.masterCaseLengthCm &&
    input.masterCaseWidthCm &&
    input.masterCaseHeightCm &&
    input.masterCaseWeightKg
  ) {
    packUnitL = input.masterCaseLengthCm;
    packUnitW = input.masterCaseWidthCm;
    packUnitH = input.masterCaseHeightCm;
    packUnitWeight = input.masterCaseWeightKg;
    unitsPerPack = input.masterCasePcs;
  } else {
    packUnitL = input.unitLengthCm;
    packUnitW = input.unitWidthCm;
    packUnitH = input.unitHeightCm;
    packUnitWeight = input.unitWeightKg;
    unitsPerPack = 1;
  }

  // Volume-based calculation
  // Apply 85% packing efficiency (real-world standard)
  const PACKING_EFFICIENCY = 0.85;
  const packVolumeCBM = unitVolumeCBM(packUnitL, packUnitW, packUnitH);
  let packsByVolume = 0;

  if (packVolumeCBM > 0 && spec.volumeCapacity > 0) {
    packsByVolume = Math.floor(
      (spec.volumeCapacity * PACKING_EFFICIENCY) / packVolumeCBM
    );
  }

  const unitsByVolume = packsByVolume * unitsPerPack;
  const volumeUsedCBM = packsByVolume * packVolumeCBM;
  const volumeUtilPct = spec.volumeCapacity > 0
    ? (volumeUsedCBM / spec.volumeCapacity) * 100
    : 0;

  // Weight-based calculation
  let packsByWeight = 0;
  if (packUnitWeight > 0 && spec.weightCapacity > 0) {
    packsByWeight = Math.floor(spec.weightCapacity / packUnitWeight);
  }

  const unitsByWeight = packsByWeight * unitsPerPack;
  const weightUsedKg = packsByWeight * packUnitWeight;
  const weightUtilPct = spec.weightCapacity > 0
    ? (weightUsedKg / spec.weightCapacity) * 100
    : 0;

  // Binding constraint
  const bindingConstraint: "volume" | "weight" =
    unitsByVolume <= unitsByWeight ? "volume" : "weight";

  const optimalUnits = Math.min(unitsByVolume, unitsByWeight);

  return {
    container: spec,
    byVolume: {
      unitsPerContainer: unitsByVolume,
      volumeUsedCBM,
      volumeCapacityCBM: spec.volumeCapacity,
      utilizationPct: volumeUtilPct,
      wastedCBM: spec.volumeCapacity - volumeUsedCBM,
    },
    byWeight: {
      unitsPerContainer: unitsByWeight,
      weightUsedKg,
      weightCapacityKg: spec.weightCapacity,
      utilizationPct: weightUtilPct,
      remainingKg: spec.weightCapacity - weightUsedKg,
    },
    bindingConstraint,
    optimalUnits,
  };
}

/**
 * Compare all container types for a given unit spec
 */
export function compareContainerTypes(
  input: Omit<ContainerUtilizationInput, "containerType">
): Array<ContainerUtilizationResult & { freightRate?: number; costPerUnit?: number }> {
  return FCL_CONTAINER_TYPES.map((type) =>
    calculateContainerUtilization({ ...input, containerType: type })
  );
}

/**
 * Find the most efficient container type for given unit dimensions and freight rates
 */
export function findOptimalContainer(
  input: Omit<ContainerUtilizationInput, "containerType">,
  freightRates: Partial<Record<ContainerType, number>>
): {
  optimal: ContainerType;
  results: Array<ContainerUtilizationResult & { costPerUnit: number }>;
} {
  const comparisons = compareContainerTypes(input);

  const withCost = comparisons.map((result) => {
    const rate = freightRates[result.container.type] ?? 0;
    const costPerUnit = result.optimalUnits > 0 ? rate / result.optimalUnits : Infinity;
    return { ...result, costPerUnit };
  });

  const sorted = [...withCost].sort((a, b) => a.costPerUnit - b.costPerUnit);
  const optimal = sorted[0]?.container.type ?? "40HC";

  return { optimal, results: withCost };
}

/**
 * Calculate LCL CBM requirements and cost
 */
export function calculateLCLCost(params: {
  unitLengthCm: number;
  unitWidthCm: number;
  unitHeightCm: number;
  totalUnits: number;
  ratePerCBM: number;   // e.g. $45/CBM Asia-USWC
  minCBM?: number;      // minimum CBM billed (usually 1-2 CBM)
}): {
  totalCBM: number;
  billedCBM: number;
  totalCost: number;
  costPerUnit: number;
  breakEvenUnits: number; // units at which FCL becomes cheaper (vs 40HC)
} {
  const { unitLengthCm, unitWidthCm, unitHeightCm, totalUnits, ratePerCBM, minCBM = 1 } = params;
  const unitCBM = unitVolumeCBM(unitLengthCm, unitWidthCm, unitHeightCm);
  const totalCBM = unitCBM * totalUnits;
  const billedCBM = Math.max(totalCBM, minCBM);
  const totalCost = billedCBM * ratePerCBM;
  const costPerUnit = totalUnits > 0 ? totalCost / totalUnits : 0;

  // Break-even: when does FCL 40HC become cheaper?
  // Average 40HC rate $4400, 85% efficiency
  const fclRate = 4400;
  const fclCBM = CONTAINER_SPECS["40HC"].volumeCapacity * 0.85;
  const breakEvenCBM = fclRate / ratePerCBM;
  const breakEvenUnits = unitCBM > 0 ? Math.ceil(breakEvenCBM / unitCBM) : 0;

  return { totalCBM, billedCBM, totalCost, costPerUnit, breakEvenUnits };
}

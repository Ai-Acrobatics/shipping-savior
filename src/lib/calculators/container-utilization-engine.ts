// ============================================================
// Container Utilization Calculator Engine (Decimal.js precision)
// Sprint 3: Real calculation engine
//
// CRITICAL: Must calculate BOTH volume AND weight utilization
// and use the LOWER one. Dense goods hit weight limits at ~40% volume.
// ============================================================

import Decimal from "decimal.js";
import { CONTAINER_SPECS, FCL_CONTAINER_TYPES } from "@/lib/data/containers";
import type { ContainerType, ContainerSpec } from "@/lib/types";

Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

// ─── Types ───────────────────────────────────────────────

export interface ContainerCalcInput {
  productLengthCm: number;
  productWidthCm: number;
  productHeightCm: number;
  productWeightKg: number;
  containerType: ContainerType;
  packingEfficiency?: number; // 0-1, default 0.85
}

export interface ContainerCalcResult {
  containerType: ContainerType;
  containerLabel: string;
  volumeCapacityCBM: number;
  weightCapacityKg: number;

  // Volume calculation
  unitVolumeCBM: number;
  unitsByVolume: number;
  volumeUsedCBM: number;
  volumeUtilizationPct: number;

  // Weight calculation
  unitsByWeight: number;
  weightUsedKg: number;
  weightUtilizationPct: number;

  // Binding constraint
  optimalUnits: number;
  limitingFactor: "volume" | "weight";
  effectiveUtilizationPct: number;

  // Wasted capacity
  wastedVolumeCBM: number;
  wastedWeightKg: number;

  // Cost analysis (per unit at reference rate)
  referenceFreightRate: number;
  costPerUnit: number;
}

const PACKING_EFFICIENCY_DEFAULT = 0.85;

/**
 * Calculate container utilization with DUAL volume + weight check
 */
export function calculateContainerUtilizationEngine(
  input: ContainerCalcInput
): ContainerCalcResult {
  const spec = CONTAINER_SPECS[input.containerType];
  if (!spec || spec.type === "LCL") {
    // Return empty result for LCL
    return createEmptyResult(input.containerType);
  }

  const efficiency = new Decimal(
    input.packingEfficiency ?? PACKING_EFFICIENCY_DEFAULT
  );

  // ─── Unit Volume ──────────────────────────────────────
  const lengthM = new Decimal(input.productLengthCm).div(100);
  const widthM = new Decimal(input.productWidthCm).div(100);
  const heightM = new Decimal(input.productHeightCm).div(100);
  const unitVolumeCBM = lengthM.mul(widthM).mul(heightM);

  // ─── Volume-based capacity ────────────────────────────
  const effectiveVolume = new Decimal(spec.volumeCapacity).mul(efficiency);
  const unitsByVolume = unitVolumeCBM.gt(0)
    ? effectiveVolume.div(unitVolumeCBM).floor()
    : new Decimal(0);

  const volumeUsed = unitsByVolume.mul(unitVolumeCBM);
  const volumeUtilPct = new Decimal(spec.volumeCapacity).gt(0)
    ? volumeUsed.div(spec.volumeCapacity).mul(100)
    : new Decimal(0);

  // ─── Weight-based capacity ────────────────────────────
  const unitWeight = new Decimal(input.productWeightKg);
  const weightCapacity = new Decimal(spec.weightCapacity);
  const unitsByWeight = unitWeight.gt(0)
    ? weightCapacity.div(unitWeight).floor()
    : new Decimal(0);

  const weightUsed = unitsByWeight.mul(unitWeight);
  const weightUtilPct = weightCapacity.gt(0)
    ? weightUsed.div(weightCapacity).mul(100)
    : new Decimal(0);

  // ─── Binding constraint: use the LOWER number ────────
  const optimalUnits = Decimal.min(unitsByVolume, unitsByWeight);
  const limitingFactor: "volume" | "weight" = unitsByVolume.lte(unitsByWeight)
    ? "volume"
    : "weight";

  // Effective utilization based on limiting factor
  const effectiveVolUsed = optimalUnits.mul(unitVolumeCBM);
  const effectiveWeightUsed = optimalUnits.mul(unitWeight);

  const effectiveUtilPct = limitingFactor === "volume"
    ? volumeUtilPct
    : weightUtilPct;

  // Wasted capacity
  const wastedVolume = new Decimal(spec.volumeCapacity).sub(effectiveVolUsed);
  const wastedWeight = weightCapacity.sub(effectiveWeightUsed);

  // ─── Cost per unit at reference freight rate ──────────
  const refRate = 4400; // Asia-USWC 40HC reference
  const costPerUnit = optimalUnits.gt(0)
    ? new Decimal(refRate).div(optimalUnits)
    : new Decimal(0);

  return {
    containerType: input.containerType,
    containerLabel: spec.label,
    volumeCapacityCBM: spec.volumeCapacity,
    weightCapacityKg: spec.weightCapacity,
    unitVolumeCBM: unitVolumeCBM.toNumber(),
    unitsByVolume: unitsByVolume.toNumber(),
    volumeUsedCBM: volumeUsed.toNumber(),
    volumeUtilizationPct: volumeUtilPct.toNumber(),
    unitsByWeight: unitsByWeight.toNumber(),
    weightUsedKg: weightUsed.toNumber(),
    weightUtilizationPct: weightUtilPct.toNumber(),
    optimalUnits: optimalUnits.toNumber(),
    limitingFactor,
    effectiveUtilizationPct: effectiveUtilPct.toNumber(),
    wastedVolumeCBM: wastedVolume.toNumber(),
    wastedWeightKg: wastedWeight.toNumber(),
    referenceFreightRate: refRate,
    costPerUnit: costPerUnit.toNumber(),
  };
}

/**
 * Compare across all FCL container types
 */
export function compareAllContainers(
  input: Omit<ContainerCalcInput, "containerType">
): ContainerCalcResult[] {
  return FCL_CONTAINER_TYPES.map((type) =>
    calculateContainerUtilizationEngine({ ...input, containerType: type })
  );
}

/**
 * Find the optimal container for given product specs
 */
export function findOptimalContainerEngine(
  input: Omit<ContainerCalcInput, "containerType">
): { optimal: ContainerCalcResult; all: ContainerCalcResult[] } {
  const results = compareAllContainers(input);
  const sorted = [...results]
    .filter((r) => r.optimalUnits > 0)
    .sort((a, b) => a.costPerUnit - b.costPerUnit);

  return {
    optimal: sorted[0] ?? results[0],
    all: results,
  };
}

function createEmptyResult(containerType: ContainerType): ContainerCalcResult {
  return {
    containerType,
    containerLabel: "LCL",
    volumeCapacityCBM: 0,
    weightCapacityKg: 0,
    unitVolumeCBM: 0,
    unitsByVolume: 0,
    volumeUsedCBM: 0,
    volumeUtilizationPct: 0,
    unitsByWeight: 0,
    weightUsedKg: 0,
    weightUtilizationPct: 0,
    optimalUnits: 0,
    limitingFactor: "volume",
    effectiveUtilizationPct: 0,
    wastedVolumeCBM: 0,
    wastedWeightKg: 0,
    referenceFreightRate: 0,
    costPerUnit: 0,
  };
}

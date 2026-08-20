// ============================================================
// Line-item parsing + validation shared by the API routes
// AI-8869
//
// One place that knows how to turn "whatever the customer sent us" into a
// valid line-item row, so the manual form, the JSON API and the CSV import
// all reject the same things for the same reasons.
// ============================================================

import { dutyStatusEnum, type DutyStatus } from '@/lib/db/schema';

export const DUTY_STATUSES = dutyStatusEnum.enumValues;

export const DUTY_STATUS_LABELS: Record<DutyStatus, string> = {
  in_transit: 'In transit',
  ftz_pf: 'FTZ — privileged foreign',
  ftz_npf: 'FTZ — non-privileged foreign',
  bonded: 'Bonded warehouse',
  customs_cleared: 'Customs cleared',
  delivered: 'Delivered',
  consumed: 'Sold / consumed',
};

/** Duty statuses where the goods are physically on hand somewhere we control. */
export const ON_HAND_STATUSES: DutyStatus[] = [
  'ftz_pf',
  'ftz_npf',
  'bonded',
  'customs_cleared',
  'delivered',
];

export interface ParsedLineItem {
  containerNumber: string | null;
  sku: string | null;
  description: string | null;
  htsCode: string | null;
  countryOfOrigin: string | null;
  quantity: string;
  unitOfMeasure: string;
  unitCostUsd: string;
  supplier: string | null;
  poRef: string | null;
  dutyStatus: DutyStatus;
  locationCode: string | null;
  locationName: string | null;
  allocatedLandedCostUsd: string | null;
  allocatedOverheadUsd: string | null;
}

export class LineItemValidationError extends Error {}

const str = (value: unknown, max: number): string | null => {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed.slice(0, max) : null;
};

const num = (value: unknown, field: string, { min = 0 }: { min?: number } = {}): number => {
  const parsed = typeof value === 'number' ? value : Number(String(value ?? '').replace(/[$,\s]/g, ''));
  if (!Number.isFinite(parsed)) {
    throw new LineItemValidationError(`${field} must be a number`);
  }
  if (parsed < min) {
    throw new LineItemValidationError(`${field} must be >= ${min}`);
  }
  return parsed;
};

const optionalNum = (value: unknown, field: string): number | null => {
  if (value === null || value === undefined || value === '') return null;
  return num(value, field);
};

/**
 * Parse one line item off a request body or CSV row.
 *
 * Numerics are stored as strings because that is what `drizzle` expects for
 * `numeric` columns — round-tripping them through JS floats would quietly
 * lose cents on large quantities, which is the one thing a margin report
 * cannot afford.
 */
export function parseLineItem(input: Record<string, unknown>): ParsedLineItem {
  const quantity = num(input.quantity, 'quantity');
  const unitCostUsd = num(input.unitCostUsd ?? input.unitCost, 'unitCostUsd');

  const rawStatus = typeof input.dutyStatus === 'string' ? input.dutyStatus.trim() : '';
  if (rawStatus && !(DUTY_STATUSES as readonly string[]).includes(rawStatus)) {
    throw new LineItemValidationError(
      `dutyStatus must be one of: ${DUTY_STATUSES.join(', ')}`
    );
  }

  const country = str(input.countryOfOrigin, 2);

  return {
    containerNumber: str(input.containerNumber, 20),
    sku: str(input.sku, 100),
    description: str(input.description, 2000),
    htsCode: str(input.htsCode, 20),
    countryOfOrigin: country ? country.toUpperCase() : null,
    quantity: String(quantity),
    unitOfMeasure: str(input.unitOfMeasure, 20) ?? 'EA',
    unitCostUsd: String(unitCostUsd),
    supplier: str(input.supplier, 300),
    poRef: str(input.poRef, 100),
    dutyStatus: (rawStatus || 'in_transit') as DutyStatus,
    locationCode: str(input.locationCode, 100),
    locationName: str(input.locationName, 200),
    allocatedLandedCostUsd: (() => {
      const v = optionalNum(input.allocatedLandedCostUsd, 'allocatedLandedCostUsd');
      return v === null ? null : String(v);
    })(),
    allocatedOverheadUsd: (() => {
      const v = optionalNum(input.allocatedOverheadUsd, 'allocatedOverheadUsd');
      return v === null ? null : String(v);
    })(),
  };
}

/** `numeric` columns come back as strings; this is the one place we un-string them. */
export const toNumber = (value: string | number | null | undefined): number => {
  if (value === null || value === undefined) return 0;
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
};

// ============================================================
// Shipping Routes Dataset
// Source: Major carrier schedules + industry averages
// Phase 3: Visualization Layer
// ============================================================

import type { Port } from "@/lib/types";
import { PORTS } from "./ports";

// ─── Route Definition ────────────────────────────────────────

export interface RouteSegment {
  id: string;
  originCode: string;
  destCode: string;
  carrier: string;
  mode: "ocean-fcl" | "ocean-lcl" | "air";
  transitDays: { min: number; max: number };
  costPerTEU: number;
  direct: boolean;
  transshipmentCode?: string;
  frequency: "daily" | "weekly" | "bi-weekly";
  serviceRoute: string;
  backhaulDiscount: number; // percentage
  reliability: number; // on-time percentage
}

export interface CostTrend {
  month: string;
  oceanFCL: number;
  oceanLCL: number;
  air: number;
}

export interface MonthlyCostBreakdown {
  month: string;
  freight: number;
  duties: number;
  drayage: number;
  storage: number;
  insurance: number;
  fees: number;
}

// ─── Route Data ──────────────────────────────────────────────

export const ROUTES: RouteSegment[] = [
  // SE Asia → US West Coast (Direct)
  {
    id: "vnsgn-uslax-evg",
    originCode: "VNSGN",
    destCode: "USLAX",
    carrier: "Evergreen",
    mode: "ocean-fcl",
    transitDays: { min: 22, max: 26 },
    costPerTEU: 2850,
    direct: true,
    frequency: "weekly",
    serviceRoute: "Asia-USWC TP16",
    backhaulDiscount: 12,
    reliability: 87,
  },
  {
    id: "vnsgn-uslax-msc",
    originCode: "VNSGN",
    destCode: "USLAX",
    carrier: "MSC",
    mode: "ocean-fcl",
    transitDays: { min: 20, max: 24 },
    costPerTEU: 3100,
    direct: true,
    frequency: "weekly",
    serviceRoute: "Sentosa Express",
    backhaulDiscount: 8,
    reliability: 91,
  },
  {
    id: "vnsgn-uslax-cosco",
    originCode: "VNSGN",
    destCode: "USLAX",
    carrier: "COSCO",
    mode: "ocean-fcl",
    transitDays: { min: 24, max: 28 },
    costPerTEU: 2600,
    direct: true,
    frequency: "weekly",
    serviceRoute: "AWE3",
    backhaulDiscount: 18,
    reliability: 83,
  },
  {
    id: "vnsgn-uslax-maersk",
    originCode: "VNSGN",
    destCode: "USLAX",
    carrier: "Maersk",
    mode: "ocean-fcl",
    transitDays: { min: 19, max: 23 },
    costPerTEU: 3400,
    direct: true,
    frequency: "weekly",
    serviceRoute: "TP6 Transpacific",
    backhaulDiscount: 5,
    reliability: 94,
  },
  // Thailand → US West Coast
  {
    id: "thbkk-uslgb-one",
    originCode: "THBKK",
    destCode: "USLGB",
    carrier: "ONE",
    mode: "ocean-fcl",
    transitDays: { min: 20, max: 24 },
    costPerTEU: 2750,
    direct: true,
    frequency: "weekly",
    serviceRoute: "PS3 Pacific South",
    backhaulDiscount: 14,
    reliability: 89,
  },
  {
    id: "thbkk-uslgb-ym",
    originCode: "THBKK",
    destCode: "USLGB",
    carrier: "Yang Ming",
    mode: "ocean-fcl",
    transitDays: { min: 22, max: 26 },
    costPerTEU: 2550,
    direct: true,
    frequency: "bi-weekly",
    serviceRoute: "PS7",
    backhaulDiscount: 16,
    reliability: 85,
  },
  // Indonesia → US via Singapore transshipment
  {
    id: "idjkt-uslax-msc-ts",
    originCode: "IDJKT",
    destCode: "USLAX",
    carrier: "MSC",
    mode: "ocean-fcl",
    transitDays: { min: 26, max: 32 },
    costPerTEU: 3200,
    direct: false,
    transshipmentCode: "SGSIN",
    frequency: "weekly",
    serviceRoute: "Lion Express + Sentosa",
    backhaulDiscount: 10,
    reliability: 82,
  },
  // China → US West Coast
  {
    id: "cnsha-uslax-cosco",
    originCode: "CNSHA",
    destCode: "USLAX",
    carrier: "COSCO",
    mode: "ocean-fcl",
    transitDays: { min: 14, max: 18 },
    costPerTEU: 3800,
    direct: true,
    frequency: "daily",
    serviceRoute: "CEN Pacific Express",
    backhaulDiscount: 3,
    reliability: 92,
  },
  {
    id: "cnshe-uslgb-evg",
    originCode: "CNSHE",
    destCode: "USLGB",
    carrier: "Evergreen",
    mode: "ocean-fcl",
    transitDays: { min: 15, max: 19 },
    costPerTEU: 3600,
    direct: true,
    frequency: "weekly",
    serviceRoute: "CJS South China",
    backhaulDiscount: 6,
    reliability: 90,
  },
  // SE Asia → US East Coast (longer routes)
  {
    id: "vnsgn-usnyc-maersk",
    originCode: "VNSGN",
    destCode: "USNYC",
    carrier: "Maersk",
    mode: "ocean-fcl",
    transitDays: { min: 32, max: 38 },
    costPerTEU: 4200,
    direct: false,
    transshipmentCode: "SGSIN",
    frequency: "weekly",
    serviceRoute: "AE7 Asia-USEC",
    backhaulDiscount: 7,
    reliability: 88,
  },
  {
    id: "thbkk-ussav-one",
    originCode: "THBKK",
    destCode: "USSAV",
    carrier: "ONE",
    mode: "ocean-fcl",
    transitDays: { min: 30, max: 36 },
    costPerTEU: 3900,
    direct: false,
    transshipmentCode: "SGSIN",
    frequency: "bi-weekly",
    serviceRoute: "EC5 Suez Express",
    backhaulDiscount: 11,
    reliability: 84,
  },
  // Vietnam → Seattle
  {
    id: "vnsgn-ussea-cosco",
    originCode: "VNSGN",
    destCode: "USSEA",
    carrier: "COSCO",
    mode: "ocean-fcl",
    transitDays: { min: 18, max: 22 },
    costPerTEU: 2500,
    direct: true,
    frequency: "weekly",
    serviceRoute: "PNW Cascade",
    backhaulDiscount: 20,
    reliability: 86,
  },
  // Cambodia → US (via Singapore)
  {
    id: "khpnh-uslax-evg-ts",
    originCode: "KHPNH",
    destCode: "USLAX",
    carrier: "Evergreen",
    mode: "ocean-fcl",
    transitDays: { min: 28, max: 34 },
    costPerTEU: 3400,
    direct: false,
    transshipmentCode: "SGSIN",
    frequency: "bi-weekly",
    serviceRoute: "Mekong Feeder + TP16",
    backhaulDiscount: 8,
    reliability: 78,
  },
];

// ─── Cost Trend Data (12 months) ─────────────────────────────

export const COST_TRENDS: CostTrend[] = [
  { month: "Apr '25", oceanFCL: 2850, oceanLCL: 85, air: 4.20 },
  { month: "May '25", oceanFCL: 2920, oceanLCL: 88, air: 4.35 },
  { month: "Jun '25", oceanFCL: 3100, oceanLCL: 92, air: 4.50 },
  { month: "Jul '25", oceanFCL: 3350, oceanLCL: 98, air: 4.80 },
  { month: "Aug '25", oceanFCL: 3500, oceanLCL: 105, air: 5.10 },
  { month: "Sep '25", oceanFCL: 3200, oceanLCL: 96, air: 4.70 },
  { month: "Oct '25", oceanFCL: 2980, oceanLCL: 90, air: 4.40 },
  { month: "Nov '25", oceanFCL: 2750, oceanLCL: 82, air: 4.15 },
  { month: "Dec '25", oceanFCL: 2650, oceanLCL: 78, air: 4.00 },
  { month: "Jan '26", oceanFCL: 2800, oceanLCL: 84, air: 4.25 },
  { month: "Feb '26", oceanFCL: 2950, oceanLCL: 89, air: 4.40 },
  { month: "Mar '26", oceanFCL: 2880, oceanLCL: 86, air: 4.30 },
];

// ─── Monthly Cost Breakdown (last 6 months) ─────────────────

export const MONTHLY_COSTS: MonthlyCostBreakdown[] = [
  { month: "Oct '25", freight: 284000, duties: 118000, drayage: 54000, storage: 38000, insurance: 12000, fees: 18000 },
  { month: "Nov '25", freight: 268000, duties: 112000, drayage: 48000, storage: 35000, insurance: 11000, fees: 17000 },
  { month: "Dec '25", freight: 252000, duties: 105000, drayage: 42000, storage: 32000, insurance: 10000, fees: 16000 },
  { month: "Jan '26", freight: 292000, duties: 122000, drayage: 56000, storage: 40000, insurance: 13000, fees: 19000 },
  { month: "Feb '26", freight: 310000, duties: 128000, drayage: 58000, storage: 42000, insurance: 14000, fees: 20000 },
  { month: "Mar '26", freight: 298000, duties: 124000, drayage: 55000, storage: 41000, insurance: 13000, fees: 19000 },
];

// ─── Lookup Utilities ────────────────────────────────────────

export function getRoutesByOrigin(originCode: string): RouteSegment[] {
  return ROUTES.filter((r) => r.originCode === originCode);
}

export function getRoutesByDest(destCode: string): RouteSegment[] {
  return ROUTES.filter((r) => r.destCode === destCode);
}

export function getRoutesByCarrier(carrier: string): RouteSegment[] {
  return ROUTES.filter((r) => r.carrier === carrier);
}

export function getDirectRoutes(): RouteSegment[] {
  return ROUTES.filter((r) => r.direct);
}

export function getTransshipmentRoutes(): RouteSegment[] {
  return ROUTES.filter((r) => !r.direct);
}

export function getRoutePorts(route: RouteSegment): { origin?: Port; dest?: Port; transshipment?: Port } {
  return {
    origin: PORTS.find((p) => p.unlocode === route.originCode),
    dest: PORTS.find((p) => p.unlocode === route.destCode),
    transshipment: route.transshipmentCode
      ? PORTS.find((p) => p.unlocode === route.transshipmentCode)
      : undefined,
  };
}

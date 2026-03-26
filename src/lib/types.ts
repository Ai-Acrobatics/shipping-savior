// ============================================================
// Shipping Savior — Core Type Definitions
// Phase 2: Data Foundation + Core Calculators
// ============================================================

// ─── HTS / Tariff Types ────────────────────────────────────

export interface HTSCode {
  htsCode: string;          // e.g. "4202.92.30"
  description: string;
  unit: string;             // e.g. "No.", "kg", "dozen"
  generalRate: string;      // MFN/Column 1 General rate
  specialRate: string;      // GSP/FTA rates
  col2Rate: string;         // Column 2 (punitive) rate
  chapter: number;
  section: string;
  notes?: string;
}

export interface DutyRate {
  htsCode: string;
  countryOfOrigin: CountryCode;
  baseRate: number;         // percentage (e.g. 6.5 for 6.5%)
  section301Rate: number;   // additional Section 301 tariff (China)
  effectiveRate: number;    // baseRate + section301Rate
  freeTradeAgreement?: string;
  ftaRate?: number;
  notes?: string;
}

export type CountryCode =
  | "CN" | "VN" | "TH" | "ID" | "KH" | "MY" | "PH" | "MM" | "IN"
  | "BD" | "US" | "MX" | "CA" | "DE" | "JP" | "KR" | "TW" | "AU"
  | "GB" | "FR" | "IT" | "BR" | "TR" | "PK" | "EG" | "OTHER";

export const COUNTRY_NAMES: Record<CountryCode, string> = {
  CN: "China",
  VN: "Vietnam",
  TH: "Thailand",
  ID: "Indonesia",
  KH: "Cambodia",
  MY: "Malaysia",
  PH: "Philippines",
  MM: "Myanmar",
  IN: "India",
  BD: "Bangladesh",
  US: "United States",
  MX: "Mexico",
  CA: "Canada",
  DE: "Germany",
  JP: "Japan",
  KR: "South Korea",
  TW: "Taiwan",
  AU: "Australia",
  GB: "United Kingdom",
  FR: "France",
  IT: "Italy",
  BR: "Brazil",
  TR: "Turkey",
  PK: "Pakistan",
  EG: "Egypt",
  OTHER: "Other",
};

// ─── Container Types ───────────────────────────────────────

export type ContainerType = "20GP" | "40GP" | "40HC" | "20RF" | "40RF" | "LCL";

export interface ContainerSpec {
  type: ContainerType;
  label: string;
  internalLength: number;   // meters
  internalWidth: number;    // meters
  internalHeight: number;   // meters
  volumeCapacity: number;   // cubic meters (CBM)
  weightCapacity: number;   // kg
  teus: number;             // TEU equivalent
  description: string;
  coldChain: boolean;
}

// ─── Port Types ────────────────────────────────────────────

export type PortRole = "origin" | "destination" | "transshipment" | "both";

export interface Port {
  unlocode: string;         // e.g. "USLAX"
  name: string;
  city: string;
  country: CountryCode;
  lat: number;
  lng: number;
  type: "seaport" | "airport" | "inland";
  role: PortRole;
  tier: 1 | 2 | 3;         // 1 = major hub
  coldChainCapable: boolean;
  ftzNearby: boolean;
  ftzName?: string;
  congestionLevel: "low" | "medium" | "high";
  avgDwellDays: number;
  demurrageRate: number;    // $/day after free days
  detentionRate: number;    // $/day
  freeDays: number;
}

// ─── Route Types ───────────────────────────────────────────

export type ShippingMode = "ocean-fcl" | "ocean-lcl" | "air" | "air-express" | "ground" | "rail";

export interface ShippingRoute {
  id: string;
  originPort: string;       // UNLOCODE
  destPort: string;         // UNLOCODE
  carrier?: string;
  mode: ShippingMode;
  transitDays: { min: number; max: number };
  frequency: "daily" | "weekly" | "bi-weekly" | "monthly";
  directService: boolean;
  transshipmentPort?: string;
  notes?: string;
}

export interface FreightRate {
  routeId: string;
  containerType?: ContainerType;
  rateUSD: number;          // base rate per container or per CBM for LCL
  unit: "per-container" | "per-cbm" | "per-kg" | "per-lb";
  effectiveDate: string;
  expiryDate?: string;
  includes: string[];       // what's included (e.g. "BAF", "CAF")
  excludes: string[];
  surcharges: Surcharge[];
}

export interface Surcharge {
  code: string;
  name: string;
  amount: number;
  unit: "fixed" | "per-container" | "per-cbm" | "per-kg" | "percent";
  required: boolean;
}

// ─── FTZ Types ─────────────────────────────────────────────

export interface FTZLocation {
  id: string;
  number: number;           // official FTZ number
  name: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
  nearestPort: string;      // UNLOCODE
  distanceToPort: number;   // miles
  subzones: number;
  activeSince: number;      // year
  grantee: string;
  warehouses: number;
}

// ─── Landed Cost Types ─────────────────────────────────────

export interface LandedCostInput {
  // Product
  productDescription: string;
  htsCode: string;
  countryOfOrigin: CountryCode;
  unitCostFOB: number;
  totalUnits: number;

  // Shipping
  containerType: ContainerType;
  originPort: string;
  destPort: string;
  shippingMode: ShippingMode;
  freightCostTotal: number;

  // Fees
  customsBrokerFee: number;
  insuranceRate: number;    // % of cargo value
  drayageCost: number;
  warehousingPerUnit?: number;
  fulfillmentPerUnit?: number;

  // Optional FTZ
  useFTZ: boolean;
  ftzStorageMonths?: number;
  ftzStorageFeePerUnit?: number;
}

export interface LandedCostResult {
  perUnit: {
    fob: number;
    freight: number;
    insurance: number;
    dutyMPF: number;        // duty + MPF + HMF
    customsBroker: number;
    drayage: number;
    warehousing: number;
    fulfillment: number;
    ftzStorage: number;
    total: number;
  };
  total: {
    cargoValue: number;
    freight: number;
    insurance: number;
    duty: number;
    mpf: number;
    hmf: number;
    customsBroker: number;
    drayage: number;
    warehousing: number;
    fulfillment: number;
    ftzStorage: number;
    grandTotal: number;
  };
  effectiveDutyRate: number;   // actual % paid on total
  dutyRate: number;
  mpfRate: number;
  hmfRate: number;
  breakdown: CostBreakdownItem[];
}

export interface CostBreakdownItem {
  label: string;
  amount: number;
  perUnit: number;
  pct: number;
  color: string;
}

// ─── Container Utilization Types ───────────────────────────

export interface ContainerUtilizationInput {
  containerType: ContainerType;
  unitLengthCm: number;
  unitWidthCm: number;
  unitHeightCm: number;
  unitWeightKg: number;
  masterCasePcs?: number;    // units per master carton
  masterCaseLengthCm?: number;
  masterCaseWidthCm?: number;
  masterCaseHeightCm?: number;
  masterCaseWeightKg?: number;
  palletPattern?: boolean;
  palletType?: "standard" | "euro";
}

export interface ContainerUtilizationResult {
  container: ContainerSpec;
  byVolume: {
    unitsPerContainer: number;
    volumeUsedCBM: number;
    volumeCapacityCBM: number;
    utilizationPct: number;
    wastedCBM: number;
  };
  byWeight: {
    unitsPerContainer: number;
    weightUsedKg: number;
    weightCapacityKg: number;
    utilizationPct: number;
    remainingKg: number;
  };
  bindingConstraint: "volume" | "weight";
  optimalUnits: number;
  costPerUnit?: number;
}

// ─── Rate Calculator Types ──────────────────────────────────

export interface OceanFreightInput {
  originPort: string;
  destPort: string;
  containerType: ContainerType;
  cargoCBM?: number;         // for LCL
  cargoWeightKg?: number;    // for LCL/weight-based
  includeBAF: boolean;       // Bunker Adjustment Factor
  includeCAF: boolean;       // Currency Adjustment Factor
  includeISPS: boolean;      // Security surcharge
  includeDocFee: boolean;
}

export interface AirFreightInput {
  originAirport: string;
  destAirport: string;
  weightKg: number;
  volumeCBM: number;
  service: "standard" | "express" | "economy";
  cargoType: "general" | "perishable" | "dangerous" | "valuable";
}

export interface GroundFreightInput {
  originZip: string;
  destZip: string;
  weightLbs: number;
  pallets: number;
  service: "standard" | "expedited" | "white-glove";
  liftgateOrigin: boolean;
  liftgateDest: boolean;
  insideDelivery: boolean;
}

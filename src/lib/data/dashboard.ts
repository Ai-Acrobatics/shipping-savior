// Dashboard mock data — shipment stats, activity feed, notifications

export interface ShipmentSummary {
  inTransit: number;
  atPort: number;
  inFTZ: number;
  delivered: number;
  totalContainers: number;
}

export const shipmentSummary: ShipmentSummary = {
  inTransit: 4,
  atPort: 2,
  inFTZ: 8,
  delivered: 23,
  totalContainers: 37,
};

export interface ActivityItem {
  id: string;
  action: string;
  detail: string;
  timestamp: string;
  category: "shipment" | "tariff" | "ftz" | "document";
}

// ─── Shipment Tracking Types & Data ──────────────────────────────

export type ShipmentStatus = "in-transit" | "at-port" | "customs" | "delivered" | "delayed" | "booked";

export interface TimelineEvent {
  event: string;
  location: string;
  timestamp: string;
  status: "completed" | "current" | "upcoming";
  details?: string;
}

export interface ShipmentAlert {
  id: string;
  message: string;
  severity: "critical" | "warning" | "info";
  timestamp: string;
  resolved: boolean;
}

export interface TemperatureData {
  current: number;
  setPoint: number;
  min: number;
  max: number;
  unit: "C" | "F";
  lastUpdated: string;
  history: { time: string; value: number }[];
}

export interface ShipmentCosts {
  freight: number;
  duty: number;
  insurance: number;
  drayage: number;
  customs: number;
  storage: number;
  total: number;
  budgeted: number;
  perUnit: string;
  variance: number;
}

export interface DashboardShipment {
  id: string;
  reference: string;
  origin: string;
  destination: string;
  originPort: string;
  destPort: string;
  carrier: string;
  vessel?: string;
  voyageNumber?: string;
  status: ShipmentStatus;
  progress: number;
  currentLocation: string;
  containers: number;
  containerType: string;
  cargoType: "general" | "cold-chain";
  eta: string;
  etd: string;
  value: string;
  weight: string;
  volume: string;
  timeline: TimelineEvent[];
  alerts: ShipmentAlert[];
  temperature?: TemperatureData;
  costs: ShipmentCosts;
}

export const dashboardShipments: DashboardShipment[] = [
  {
    id: "MSCU-4821937",
    reference: "SS-2026-0042",
    origin: "Ho Chi Minh City, Vietnam",
    destination: "Long Beach, CA",
    originPort: "VNCLI",
    destPort: "USLGB",
    carrier: "MSC",
    vessel: "MSC ANNA",
    voyageNumber: "FA609R",
    status: "delivered",
    progress: 100,
    currentLocation: "FTZ #50 — Long Beach",
    containers: 2,
    containerType: "40ft Reefer",
    cargoType: "cold-chain",
    eta: "Mar 24, 2026",
    etd: "Feb 28, 2026",
    value: "$124,500",
    weight: "38,200 kg",
    volume: "62 CBM",
    timeline: [
      { event: "Booking confirmed", location: "Ho Chi Minh City", timestamp: "Feb 22, 2026", status: "completed" },
      { event: "Container loaded", location: "Cat Lai Terminal", timestamp: "Feb 27, 2026", status: "completed" },
      { event: "Vessel departed", location: "VNCLI", timestamp: "Feb 28, 2026", status: "completed" },
      { event: "Transshipment", location: "Singapore", timestamp: "Mar 5, 2026", status: "completed", details: "Transferred to MSC ANNA" },
      { event: "Arrived at port", location: "Long Beach", timestamp: "Mar 23, 2026", status: "completed" },
      { event: "Customs cleared", location: "Long Beach CBP", timestamp: "Mar 24, 2026", status: "completed" },
      { event: "Delivered to FTZ", location: "FTZ #50 — Long Beach", timestamp: "Mar 26, 2026", status: "completed" },
    ],
    alerts: [],
    temperature: {
      current: -18.2,
      setPoint: -18,
      min: -19.1,
      max: -17.4,
      unit: "C",
      lastUpdated: "Mar 26, 08:15 UTC",
      history: [
        { time: "6h", value: -18.1 },
        { time: "12h", value: -17.8 },
        { time: "18h", value: -18.3 },
        { time: "24h", value: -18.0 },
        { time: "30h", value: -17.4 },
        { time: "36h", value: -18.5 },
        { time: "42h", value: -19.1 },
        { time: "48h", value: -18.2 },
      ],
    },
    costs: {
      freight: 8200,
      duty: 4850,
      insurance: 620,
      drayage: 1450,
      customs: 385,
      storage: 780,
      total: 16285,
      budgeted: 16630,
      perUnit: "0.033",
      variance: -2.1,
    },
  },
  {
    id: "OOLU-7391024",
    reference: "SS-2026-0045",
    origin: "Bangkok, Thailand",
    destination: "Long Beach, CA",
    originPort: "THBKK",
    destPort: "USLGB",
    carrier: "OOCL",
    vessel: "OOCL TOKYO",
    voyageNumber: "033E",
    status: "in-transit",
    progress: 62,
    currentLocation: "Pacific Ocean — en route",
    containers: 1,
    containerType: "40ft HC",
    cargoType: "general",
    eta: "Apr 8, 2026",
    etd: "Mar 14, 2026",
    value: "$87,200",
    weight: "22,400 kg",
    volume: "58 CBM",
    timeline: [
      { event: "Booking confirmed", location: "Bangkok", timestamp: "Mar 8, 2026", status: "completed" },
      { event: "Container loaded", location: "Laem Chabang", timestamp: "Mar 13, 2026", status: "completed" },
      { event: "Vessel departed", location: "THLCH", timestamp: "Mar 14, 2026", status: "completed" },
      { event: "Transshipment", location: "Singapore", timestamp: "Mar 18, 2026", status: "completed", details: "Transferred to OOCL TOKYO" },
      { event: "Pacific crossing", location: "At sea", timestamp: "Mar 26, 2026", status: "current" },
      { event: "Arrive at port", location: "Long Beach", timestamp: "Apr 6, 2026", status: "upcoming" },
      { event: "Customs clearance", location: "Long Beach CBP", timestamp: "Apr 8, 2026", status: "upcoming" },
    ],
    alerts: [],
    costs: {
      freight: 4800,
      duty: 3120,
      insurance: 440,
      drayage: 1200,
      customs: 340,
      storage: 0,
      total: 9900,
      budgeted: 9753,
      perUnit: "0.045",
      variance: 1.5,
    },
  },
  {
    id: "CMAU-5529817",
    reference: "SS-2026-0048",
    origin: "Jakarta, Indonesia",
    destination: "Los Angeles, CA",
    originPort: "IDJKT",
    destPort: "USLAX",
    carrier: "CMA CGM",
    vessel: "CMA CGM MARCO POLO",
    voyageNumber: "0PM4XE",
    status: "delayed",
    progress: 38,
    currentLocation: "South China Sea — rerouted",
    containers: 3,
    containerType: "40ft HC",
    cargoType: "general",
    eta: "Apr 18, 2026 (was Apr 12)",
    etd: "Mar 18, 2026",
    value: "$215,600",
    weight: "64,800 kg",
    volume: "172 CBM",
    timeline: [
      { event: "Booking confirmed", location: "Jakarta", timestamp: "Mar 10, 2026", status: "completed" },
      { event: "Container loaded", location: "Tanjung Priok", timestamp: "Mar 17, 2026", status: "completed" },
      { event: "Vessel departed", location: "IDJKT", timestamp: "Mar 18, 2026", status: "completed" },
      { event: "Weather delay", location: "South China Sea", timestamp: "Mar 23, 2026", status: "current", details: "Typhoon avoidance reroute — 6 day delay" },
      { event: "Arrive at port", location: "Los Angeles", timestamp: "Apr 16, 2026", status: "upcoming" },
      { event: "Customs clearance", location: "LA/Long Beach CBP", timestamp: "Apr 18, 2026", status: "upcoming" },
    ],
    alerts: [
      {
        id: "alert-1",
        message: "Weather delay: typhoon avoidance reroute adding ~6 days. New ETA Apr 18.",
        severity: "warning",
        timestamp: "Mar 23, 2026 14:30 UTC",
        resolved: false,
      },
    ],
    costs: {
      freight: 14200,
      duty: 8640,
      insurance: 1080,
      drayage: 2100,
      customs: 720,
      storage: 0,
      total: 26740,
      budgeted: 25419,
      perUnit: "0.041",
      variance: 5.2,
    },
  },
  {
    id: "HLCU-2194830",
    reference: "SS-2026-0050",
    origin: "Phnom Penh, Cambodia",
    destination: "Newark, NJ",
    originPort: "KHPNH",
    destPort: "USEWR",
    carrier: "Hapag-Lloyd",
    vessel: "HAMBURG EXPRESS",
    voyageNumber: "046W",
    status: "customs",
    progress: 88,
    currentLocation: "Newark CBP — inspection",
    containers: 1,
    containerType: "40ft HC",
    cargoType: "general",
    eta: "Mar 28, 2026",
    etd: "Feb 25, 2026",
    value: "$63,900",
    weight: "18,600 kg",
    volume: "54 CBM",
    timeline: [
      { event: "Booking confirmed", location: "Phnom Penh", timestamp: "Feb 18, 2026", status: "completed" },
      { event: "Container loaded", location: "Sihanoukville Port", timestamp: "Feb 24, 2026", status: "completed" },
      { event: "Vessel departed", location: "KHSHV", timestamp: "Feb 25, 2026", status: "completed" },
      { event: "Transshipment", location: "Colombo, Sri Lanka", timestamp: "Mar 4, 2026", status: "completed" },
      { event: "Arrived at port", location: "Port Newark", timestamp: "Mar 25, 2026", status: "completed" },
      { event: "Customs inspection", location: "Newark CBP", timestamp: "Mar 26, 2026", status: "current", details: "Random CBP exam in progress" },
      { event: "Release & delivery", location: "Newark, NJ", timestamp: "Mar 28, 2026", status: "upcoming" },
    ],
    alerts: [
      {
        id: "alert-2",
        message: "CBP random inspection in progress — may add 1–2 business days.",
        severity: "info",
        timestamp: "Mar 26, 2026 09:00 UTC",
        resolved: false,
      },
    ],
    costs: {
      freight: 5100,
      duty: 2240,
      insurance: 320,
      drayage: 980,
      customs: 650,
      storage: 0,
      total: 9290,
      budgeted: 8948,
      perUnit: "0.052",
      variance: 3.8,
    },
  },
  {
    id: "EISU-6017293",
    reference: "SS-2026-0051",
    origin: "Qingdao, China",
    destination: "Long Beach, CA",
    originPort: "CNTAO",
    destPort: "USLGB",
    carrier: "Evergreen",
    vessel: "EVER GIVEN",
    voyageNumber: "1288-009E",
    status: "at-port",
    progress: 92,
    currentLocation: "Long Beach — awaiting customs",
    containers: 2,
    containerType: "40ft HC",
    cargoType: "general",
    eta: "Mar 27, 2026",
    etd: "Mar 4, 2026",
    value: "$156,300",
    weight: "41,200 kg",
    volume: "118 CBM",
    timeline: [
      { event: "Booking confirmed", location: "Qingdao", timestamp: "Feb 26, 2026", status: "completed" },
      { event: "Container loaded", location: "Qianwan Container Terminal", timestamp: "Mar 3, 2026", status: "completed" },
      { event: "Vessel departed", location: "CNTAO", timestamp: "Mar 4, 2026", status: "completed" },
      { event: "Arrived at port", location: "Long Beach", timestamp: "Mar 25, 2026", status: "completed" },
      { event: "Awaiting customs", location: "Long Beach", timestamp: "Mar 26, 2026", status: "current", details: "Pending ISF validation" },
      { event: "Delivery to FTZ", location: "FTZ #50 — Long Beach", timestamp: "Mar 27, 2026", status: "upcoming" },
    ],
    alerts: [],
    costs: {
      freight: 6400,
      duty: 14200,
      insurance: 780,
      drayage: 1450,
      customs: 520,
      storage: 0,
      total: 23350,
      budgeted: 23537,
      perUnit: "0.074",
      variance: -0.8,
    },
  },
  {
    id: "MAEU-9304712",
    reference: "SS-2026-0053",
    origin: "Ho Chi Minh City, Vietnam",
    destination: "Savannah, GA",
    originPort: "VNCLI",
    destPort: "USSAV",
    carrier: "Maersk",
    status: "booked",
    progress: 0,
    currentLocation: "Ho Chi Minh City — awaiting pickup",
    containers: 2,
    containerType: "40ft Reefer",
    cargoType: "cold-chain",
    eta: "May 15, 2026",
    etd: "Apr 10, 2026",
    value: "$198,000",
    weight: "44,600 kg",
    volume: "124 CBM",
    timeline: [
      { event: "Booking confirmed", location: "Ho Chi Minh City", timestamp: "Mar 24, 2026", status: "completed" },
      { event: "Container pickup", location: "Supplier warehouse", timestamp: "Apr 7, 2026", status: "upcoming" },
      { event: "Vessel departure", location: "VNCLI", timestamp: "Apr 10, 2026", status: "upcoming" },
      { event: "Arrive at port", location: "Savannah", timestamp: "May 13, 2026", status: "upcoming" },
      { event: "Customs & delivery", location: "Savannah, GA", timestamp: "May 15, 2026", status: "upcoming" },
    ],
    alerts: [],
    costs: {
      freight: 9600,
      duty: 7200,
      insurance: 990,
      drayage: 1800,
      customs: 480,
      storage: 0,
      total: 20070,
      budgeted: 20070,
      perUnit: "0.040",
      variance: 0,
    },
  },
];

export const recentActivity: ActivityItem[] = [
  {
    id: "a1",
    action: "Container released",
    detail: "MSCU-4821937 cleared CBP inspection — Long Beach",
    timestamp: "2026-03-26T08:30:00Z",
    category: "shipment",
  },
  {
    id: "a2",
    action: "FTZ withdrawal",
    detail: "50K units withdrawn from FTZ #50 at 6.5% locked rate",
    timestamp: "2026-03-22T11:30:00Z",
    category: "ftz",
  },
  {
    id: "a3",
    action: "Tariff scenario saved",
    detail: "Vietnam Base Case vs. China + Section 301 comparison",
    timestamp: "2026-03-21T15:00:00Z",
    category: "tariff",
  },
  {
    id: "a4",
    action: "ISF filed",
    detail: "Importer Security Filing submitted for OOCL container",
    timestamp: "2026-03-20T09:15:00Z",
    category: "document",
  },
  {
    id: "a5",
    action: "New booking confirmed",
    detail: "MSC ANNA — Ho Chi Minh City → Long Beach, ETD Apr 2",
    timestamp: "2026-03-19T14:30:00Z",
    category: "shipment",
  },
];

// Analytics data
export const monthlyCosts = [
  { month: "Oct", freight: 42000, duty: 18500, ftz: 3200, fulfillment: 12000, insurance: 2100, drayage: 4800, storage: 1600, total: 84200, avgPerUnit: 5.12, shipments: 4 },
  { month: "Nov", freight: 45000, duty: 19200, ftz: 3400, fulfillment: 13500, insurance: 2250, drayage: 5100, storage: 1700, total: 90150, avgPerUnit: 4.98, shipments: 5 },
  { month: "Dec", freight: 38000, duty: 16800, ftz: 2900, fulfillment: 11000, insurance: 1900, drayage: 4300, storage: 1450, total: 76350, avgPerUnit: 5.25, shipments: 3 },
  { month: "Jan", freight: 48000, duty: 21000, ftz: 3600, fulfillment: 14200, insurance: 2400, drayage: 5400, storage: 1800, total: 96400, avgPerUnit: 4.85, shipments: 6 },
  { month: "Feb", freight: 44000, duty: 19800, ftz: 3300, fulfillment: 13000, insurance: 2200, drayage: 5000, storage: 1650, total: 88950, avgPerUnit: 4.92, shipments: 5 },
  { month: "Mar", freight: 46000, duty: 20200, ftz: 3500, fulfillment: 13800, insurance: 2300, drayage: 5200, storage: 1750, total: 92750, avgPerUnit: 4.82, shipments: 4 },
];

export const costCategories = [
  { name: "Ocean Freight", category: "Ocean Freight", amount: 46000, pct: 55, percentage: 55, trend: 2.3, color: "#00bcd4" },
  { name: "Duty/Tariff", category: "Duty/Tariff", amount: 20200, pct: 24, percentage: 24, trend: -1.5, color: "#ffc81a" },
  { name: "Fulfillment", category: "Fulfillment", amount: 13800, pct: 17, percentage: 17, trend: 0.8, color: "#68d391" },
  { name: "FTZ Storage", category: "FTZ Storage", amount: 3500, pct: 4, percentage: 4, trend: 0, color: "#b794f4" },
];

export const routePerformance = [
  { route: "HCMC → Long Beach", transitDays: 18, onTime: 92, onTimeRate: 92, cost: 4200, volume: 12, avgRate: 4200 },
  { route: "Bangkok → Seattle", transitDays: 22, onTime: 88, onTimeRate: 88, cost: 3800, volume: 8, avgRate: 3800 },
  { route: "Jakarta → Savannah", transitDays: 28, onTime: 85, onTimeRate: 85, cost: 3500, volume: 5, avgRate: 3500 },
  { route: "Phnom Penh → Oakland", transitDays: 24, onTime: 90, onTimeRate: 90, cost: 4000, volume: 6, avgRate: 4000 },
];

export const carrierMetrics = [
  { carrier: "Maersk", reliability: 94, cost: 78, speed: 88, coverage: 95, support: 85, onTimeRate: 94, rating: 4.5, avgRate: 4200, totalShipments: 12 },
  { carrier: "MSC", reliability: 89, cost: 85, speed: 82, coverage: 92, support: 80, onTimeRate: 89, rating: 4.2, avgRate: 3800, totalShipments: 8 },
  { carrier: "CMA CGM", reliability: 91, cost: 80, speed: 85, coverage: 88, support: 82, onTimeRate: 91, rating: 4.3, avgRate: 4000, totalShipments: 6 },
  { carrier: "COSCO", reliability: 86, cost: 92, speed: 78, coverage: 85, support: 75, onTimeRate: 86, rating: 3.8, avgRate: 3500, totalShipments: 5 },
];

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

// ─── Executive Summary ────────────────────────────────────────

export interface ExecutiveSummary {
  period: string;
  revenue: { current: number; previous: number; target: number };
  volume: { containers: number; teus: string; weight: string };
  savings: { total: number; ftz: number; rateOpt: number };
  onTime: { rate: number; target: number };
  topRisks: string[];
  topWins: string[];
}

// ─── Notification Types ───────────────────────────────────────

export type NotificationType = "shipment" | "customs" | "cost" | "partner" | "system";
export type AlertSeverity = "critical" | "warning" | "info";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  severity: AlertSeverity;
  timestamp: string;
  read: boolean;
  shipmentId?: string;
  actionLabel?: string;
}

export const notifications: Notification[] = [
  {
    id: "n1",
    title: "Container MSCU-4821937 arrived at Long Beach",
    message: "Your 40ft refrigerated container has cleared customs and is ready for pickup at Pier J.",
    type: "shipment",
    severity: "info",
    timestamp: "2026-03-26T08:30:00Z",
    read: false,
    shipmentId: "MSCU-4821937",
    actionLabel: "View Shipment",
  },
  {
    id: "n2",
    title: "Section 301 tariff update — List 4A",
    message: "USTR announced rate adjustments effective April 15. Review impacted HTS codes in the tariff scenario builder.",
    type: "customs",
    severity: "warning",
    timestamp: "2026-03-25T14:15:00Z",
    read: false,
    actionLabel: "Review HTS Codes",
  },
  {
    id: "n3",
    title: "FTZ #50 storage invoice ready",
    message: "Monthly storage invoice for Long Beach FTZ available. $2,340 for March 2026.",
    type: "cost",
    severity: "info",
    timestamp: "2026-03-24T09:00:00Z",
    read: true,
    actionLabel: "View Invoice",
  },
  {
    id: "n4",
    title: "Vessel MSC ANNA ETA updated",
    message: "New ETA for Ho Chi Minh City → Long Beach route: April 2 (was April 5). 3-day improvement.",
    type: "shipment",
    severity: "info",
    timestamp: "2026-03-23T16:45:00Z",
    read: true,
    shipmentId: "MSCU-4821937",
  },
  {
    id: "n5",
    title: "Withdrawal batch processed",
    message: "50,000 units released from FTZ #50 at locked rate 6.5%. Duty payment of $1,625 queued.",
    type: "customs",
    severity: "info",
    timestamp: "2026-03-22T11:30:00Z",
    read: true,
  },
  {
    id: "n6",
    title: "Weather delay — CMA CGM MARCO POLO",
    message: "Typhoon avoidance reroute adding ~6 days to Jakarta → LA shipment. New ETA Apr 18.",
    type: "shipment",
    severity: "critical",
    timestamp: "2026-03-23T14:30:00Z",
    read: false,
    shipmentId: "CMAU-5529817",
    actionLabel: "Track Vessel",
  },
  {
    id: "n7",
    title: "CBP random inspection — HLCU-2194830",
    message: "Container selected for random CBP exam at Newark. May add 1–2 business days.",
    type: "customs",
    severity: "warning",
    timestamp: "2026-03-26T09:00:00Z",
    read: false,
    shipmentId: "HLCU-2194830",
    actionLabel: "View Details",
  },
  {
    id: "n8",
    title: "Rate negotiation success — Maersk",
    message: "New contract rate locked: $4,200/40ft HC HCMC→Savannah, 8% below market.",
    type: "partner",
    severity: "info",
    timestamp: "2026-03-21T10:00:00Z",
    read: true,
    actionLabel: "View Contract",
  },
  {
    id: "n9",
    title: "Platform maintenance scheduled",
    message: "Scheduled maintenance window: Mar 30, 2–4 AM UTC. Brief disruption expected.",
    type: "system",
    severity: "info",
    timestamp: "2026-03-20T08:00:00Z",
    read: true,
  },
];

// ─── Activity Feed ────────────────────────────────────────────

export type ActivityEventType =
  | "shipment_created"
  | "status_change"
  | "document_uploaded"
  | "cost_alert"
  | "customs_cleared"
  | "delivery_confirmed"
  | "rate_quote"
  | "partner_update";

export interface ActivityEvent {
  id: string;
  type: ActivityEventType;
  title: string;
  description: string;
  timestamp: string;
  shipmentId?: string;
}

export const activityFeed: ActivityEvent[] = [
  { id: "af1", type: "delivery_confirmed", title: "MSCU-4821937 delivered to FTZ #50", description: "Container cleared CBP and moved to Free Trade Zone warehouse", timestamp: "Mar 26, 08:30", shipmentId: "MSCU-4821937" },
  { id: "af2", type: "customs_cleared", title: "Customs clearance complete", description: "CBP inspection passed — no holds", timestamp: "Mar 24, 16:00", shipmentId: "MSCU-4821937" },
  { id: "af3", type: "cost_alert", title: "CMA CGM delay surcharge possible", description: "Weather reroute may trigger $800/container surcharge", timestamp: "Mar 23, 15:00", shipmentId: "CMAU-5529817" },
  { id: "af4", type: "status_change", title: "OOLU-7391024 passed Singapore", description: "Container transshipped at Singapore, now on OOCL TOKYO", timestamp: "Mar 18, 12:00", shipmentId: "OOLU-7391024" },
  { id: "af5", type: "document_uploaded", title: "ISF filed for EISU-6017293", description: "Importer Security Filing submitted to CBP", timestamp: "Mar 15, 09:15", shipmentId: "EISU-6017293" },
  { id: "af6", type: "shipment_created", title: "New booking: Maersk HCMC → Savannah", description: "2x 40ft Reefer containers, cold chain. ETD Apr 10.", timestamp: "Mar 24, 14:30", shipmentId: "MAEU-9304712" },
  { id: "af7", type: "rate_quote", title: "Rate locked: Maersk HCMC → Savannah", description: "$4,200/40ft HC — 8% below market rate", timestamp: "Mar 21, 10:00" },
  { id: "af8", type: "partner_update", title: "FTZ #50 capacity update", description: "Long Beach FTZ at 72% capacity — 280 pallet positions available", timestamp: "Mar 20, 08:00" },
];

// ─── Savings Entries ──────────────────────────────────────────

export interface SavingsEntry {
  type: string;
  source: string;
  description: string;
  amount: number;
}

export const savingsEntries: SavingsEntry[] = [
  { type: "ftz", source: "FTZ Zone 202 (LA)", description: "Inverted tariff benefit on Vietnam electronics — HTS 8542.31", amount: 87400 },
  { type: "ftz", source: "FTZ Zone 50 (Long Beach)", description: "Weekly entry savings on Thai apparel — reduced filing fees", amount: 42300 },
  { type: "ftz", source: "FTZ Zone 5 (Seattle)", description: "Cold chain duty deferral for Alaska seafood cargo", amount: 12800 },
  { type: "rate-negotiation", source: "Maersk Contract", description: "Annual contract rate 8% below spot market average", amount: 34200 },
  { type: "rate-negotiation", source: "MSC Volume Discount", description: "Q1 volume tier discount on HCMC→Long Beach lane", amount: 18600 },
  { type: "route-optimization", source: "Singapore Transshipment", description: "Switched from direct routing to hub transshipment — 12% cost reduction", amount: 22100 },
  { type: "route-optimization", source: "Consolidated Drayage", description: "Batched pickup for 3 containers — single truck dispatch", amount: 4800 },
  { type: "consolidation", source: "LCL Consolidation", description: "Combined 4 LCL shipments into 1 FCL — Bangkok origin", amount: 8900 },
  { type: "duty-drawback", source: "Re-export Drawback", description: "Duty drawback claim on re-exported components (99% recovery)", amount: 15200 },
  { type: "duty-drawback", source: "Manufacturing Drawback", description: "Section 1313(b) drawback on imported raw materials", amount: 6400 },
];

// Aliases for component compatibility
export type CostCategory = typeof costCategories[number];
export type CargoType = DashboardShipment["cargoType"];

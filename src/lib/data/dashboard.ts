// Dashboard mock data — notifications, shipment stats, activity feed

export type NotificationType = "shipment" | "customs" | "cost" | "partner" | "system";
export type AlertSeverity = "critical" | "warning" | "info";
export type CargoType = "general" | "cold-chain";

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
  { id: "n1", title: "Container MSCU-4821937 arrived at Long Beach", message: "Your 40ft refrigerated container has cleared customs and is ready for pickup at Pier J.", type: "shipment", severity: "info", timestamp: "2026-03-26T08:30:00Z", read: false, shipmentId: "MSCU-4821937", actionLabel: "View shipment" },
  { id: "n2", title: "Section 301 tariff update — List 4A", message: "USTR announced rate adjustments effective April 15. Review impacted HTS codes in the tariff scenario builder.", type: "customs", severity: "warning", timestamp: "2026-03-25T14:15:00Z", read: false, actionLabel: "Review tariffs" },
  { id: "n3", title: "FTZ #50 storage invoice ready", message: "Monthly storage invoice for Long Beach FTZ available. $2,340 for March 2026.", type: "cost", severity: "info", timestamp: "2026-03-24T09:00:00Z", read: true },
  { id: "n4", title: "Vessel MSC ANNA ETA updated", message: "New ETA for Ho Chi Minh City → Long Beach route: April 2 (was April 5). 3-day improvement.", type: "shipment", severity: "info", timestamp: "2026-03-23T16:45:00Z", read: true, shipmentId: "MAEU-9304712" },
  { id: "n5", title: "Withdrawal batch processed", message: "50,000 units released from FTZ #50 at locked rate 6.5%. Duty payment of $1,625 queued.", type: "system", severity: "info", timestamp: "2026-03-22T11:30:00Z", read: true },
  { id: "n6", title: "Typhoon warning — South China Sea", message: "Active typhoon may impact Jakarta → LA shipment. CMA CGM MARCO POLO rerouting adds ~6 days.", type: "shipment", severity: "critical", timestamp: "2026-03-23T14:30:00Z", read: false, shipmentId: "CMAU-5529817", actionLabel: "Track vessel" },
  { id: "n7", title: "Carrier rate increase — Evergreen", message: "Evergreen announced 8% GRI effective April 1 on all transpacific eastbound lanes.", type: "cost", severity: "warning", timestamp: "2026-03-21T10:00:00Z", read: true, actionLabel: "Compare rates" },
  { id: "n8", title: "CBP inspection — HLCU-2194830", message: "Random CBP exam in progress at Port Newark. May add 1-2 business days.", type: "customs", severity: "warning", timestamp: "2026-03-26T09:00:00Z", read: false, shipmentId: "HLCU-2194830" },
];

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
  currentLocation?: string;
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
    containers: 2,
    containerType: "40ft Reefer",
    cargoType: "cold-chain",
    currentLocation: "FTZ #50 — Long Beach",
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
    containers: 1,
    containerType: "40ft HC",
    cargoType: "general",
    currentLocation: "Pacific Ocean — en route to Long Beach",
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
      budgeted: 9750,
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
    containers: 3,
    containerType: "40ft HC",
    cargoType: "general",
    currentLocation: "South China Sea — weather reroute",
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
      budgeted: 25420,
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
    containers: 1,
    containerType: "40ft HC",
    cargoType: "general",
    currentLocation: "Port Newark — CBP inspection",
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
      budgeted: 8950,
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
    containers: 2,
    containerType: "40ft HC",
    cargoType: "general",
    currentLocation: "Long Beach — awaiting customs",
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
      budgeted: 23540,
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
    containers: 2,
    containerType: "40ft Reefer",
    cargoType: "cold-chain",
    currentLocation: "Ho Chi Minh City — awaiting pickup",
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


// Activity Feed
export interface ActivityEvent { id: string; type: "shipment_created" | "status_change" | "document_uploaded" | "cost_alert" | "customs_cleared" | "delivery_confirmed" | "rate_quote" | "partner_update"; title: string; description: string; timestamp: string; shipmentId?: string; }
export const activityFeed: ActivityEvent[] = [
  { id: "af1", type: "delivery_confirmed", title: "Delivery confirmed", description: "MSCU-4821937 to FTZ #50", timestamp: "2h ago", shipmentId: "MSCU-4821937" },
  { id: "af2", type: "customs_cleared", title: "Customs cleared", description: "CBP cleared at Long Beach", timestamp: "4h ago", shipmentId: "MSCU-4821937" },
  { id: "af3", type: "cost_alert", title: "Weather delay cost", description: "MARCO POLO +$1,200 demurrage", timestamp: "8h ago", shipmentId: "CMAU-5529817" },
  { id: "af4", type: "status_change", title: "CBP inspection", description: "HLCU-2194830 exam at Newark", timestamp: "12h ago", shipmentId: "HLCU-2194830" },
  { id: "af5", type: "document_uploaded", title: "ISF filed", description: "ISF for Bangkok-LB shipment", timestamp: "1d ago", shipmentId: "OOLU-7391024" },
  { id: "af6", type: "shipment_created", title: "New booking", description: "Maersk HCMC-Savannah Apr 10", timestamp: "2d ago", shipmentId: "MAEU-9304712" },
  { id: "af7", type: "rate_quote", title: "Rate quote ONE", description: "$4,350/TEU HCMC-LB", timestamp: "2d ago" },
  { id: "af8", type: "partner_update", title: "FTZ #50 update", description: "Rates unchanged Q2 2026", timestamp: "3d ago" },
];

// Analytics
export function formatCurrency(v: number): string { return v >= 1e6 ? "$" + (v/1e6).toFixed(1) + "M" : v >= 1e3 ? "$" + (v/1e3).toFixed(0) + "K" : "$" + v.toLocaleString(); }
export interface MonthlyCost { month: string; freight: number; duty: number; insurance: number; drayage: number; storage: number; total: number; avgPerUnit: number; shipments: number; }
export const monthlyCosts: MonthlyCost[] = [
  { month: "Oct 2025", freight: 28400, duty: 18200, insurance: 3100, drayage: 7200, storage: 2800, total: 59700, avgPerUnit: 0.048, shipments: 5 },
  { month: "Nov 2025", freight: 32100, duty: 21400, insurance: 3600, drayage: 8100, storage: 3200, total: 68400, avgPerUnit: 0.046, shipments: 6 },
  { month: "Dec 2025", freight: 35800, duty: 24600, insurance: 4200, drayage: 9400, storage: 3600, total: 77600, avgPerUnit: 0.044, shipments: 7 },
  { month: "Jan 2026", freight: 30200, duty: 19800, insurance: 3400, drayage: 7800, storage: 3100, total: 64300, avgPerUnit: 0.045, shipments: 6 },
  { month: "Feb 2026", freight: 38400, duty: 26200, insurance: 4500, drayage: 10200, storage: 4100, total: 83400, avgPerUnit: 0.042, shipments: 8 },
  { month: "Mar 2026", freight: 41200, duty: 28900, insurance: 4800, drayage: 11400, storage: 4600, total: 90900, avgPerUnit: 0.041, shipments: 9 },
];
export interface CostCategory { category: string; amount: number; percentage: number; color: string; trend: number; }
export const costCategories: CostCategory[] = [
  { category: "Freight", amount: 41200, percentage: 45, color: "#00bcd4", trend: 7.3 },
  { category: "Duty/Tariff", amount: 28900, percentage: 32, color: "#e6a800", trend: 10.3 },
  { category: "Drayage", amount: 11400, percentage: 13, color: "#a855f7", trend: 11.8 },
  { category: "Insurance", amount: 4800, percentage: 5, color: "#6366f1", trend: 6.7 },
  { category: "Storage", amount: 4600, percentage: 5, color: "#3b82f6", trend: 12.2 },
  { category: "Gross Margin", amount: 16800, percentage: 18.6, color: "#22c55e", trend: 2.1 },
];
export interface RoutePerformance { route: string; origin: string; destination: string; shipments: number; avgCost: number; avgTransitDays: number; onTimeRate: number; trend: number; }
export const routePerformance: RoutePerformance[] = [
  { route: "VNCLI-USLGB", origin: "Ho Chi Minh City", destination: "Long Beach", shipments: 14, avgCost: 12400, avgTransitDays: 24, onTimeRate: 92, trend: 3.2 },
  { route: "THBKK-USLGB", origin: "Bangkok", destination: "Long Beach", shipments: 8, avgCost: 9800, avgTransitDays: 26, onTimeRate: 88, trend: 1.5 },
  { route: "CNTAO-USLGB", origin: "Qingdao", destination: "Long Beach", shipments: 6, avgCost: 11200, avgTransitDays: 19, onTimeRate: 85, trend: -2.1 },
  { route: "IDJKT-USLAX", origin: "Jakarta", destination: "Los Angeles", shipments: 5, avgCost: 10600, avgTransitDays: 28, onTimeRate: 78, trend: -4.3 },
  { route: "KHSHV-USEWR", origin: "Sihanoukville", destination: "Newark", shipments: 4, avgCost: 14200, avgTransitDays: 32, onTimeRate: 91, trend: 2.8 },
];
export interface CarrierMetric { carrier: string; shipments: number; avgRate: number; onTimeRate: number; reliability: number; rating: number; }
export const carrierMetrics: CarrierMetric[] = [
  { carrier: "MSC", shipments: 12, avgRate: 4800, onTimeRate: 93, reliability: 91, rating: 4.3 },
  { carrier: "Maersk", shipments: 9, avgRate: 5200, onTimeRate: 96, reliability: 95, rating: 4.6 },
  { carrier: "CMA CGM", shipments: 7, avgRate: 4600, onTimeRate: 84, reliability: 82, rating: 3.8 },
  { carrier: "OOCL", shipments: 5, avgRate: 4400, onTimeRate: 90, reliability: 88, rating: 4.1 },
  { carrier: "Evergreen", shipments: 4, avgRate: 4200, onTimeRate: 87, reliability: 85, rating: 3.9 },
  { carrier: "Hapag-Lloyd", shipments: 3, avgRate: 5500, onTimeRate: 94, reliability: 93, rating: 4.4 },
];
export interface SavingsEntry { id: string; type: "ftz" | "rate-negotiation" | "route-optimization" | "consolidation" | "duty-drawback"; source: string; description: string; amount: number; date: string; }
export const savingsEntries: SavingsEntry[] = [
  { id: "s1", type: "ftz", source: "FTZ #50", description: "Rate lock Vietnam apparel", amount: 14200, date: "Mar 2026" },
  { id: "s2", type: "rate-negotiation", source: "MSC Contract", description: "Renewal discount", amount: 8400, date: "Mar 2026" },
  { id: "s3", type: "route-optimization", source: "Singapore Hub", description: "Transshipment savings", amount: 3200, date: "Feb 2026" },
  { id: "s4", type: "consolidation", source: "Vietnam Suppliers", description: "3 LCL merged to FCL", amount: 5600, date: "Feb 2026" },
  { id: "s5", type: "ftz", source: "FTZ #202", description: "Withdrawal timing electronics", amount: 9800, date: "Jan 2026" },
  { id: "s6", type: "duty-drawback", source: "CBP Drawback", description: "Re-export drawback", amount: 4100, date: "Jan 2026" },
  { id: "s7", type: "rate-negotiation", source: "OOCL Spot", description: "Below market rate", amount: 2800, date: "Dec 2025" },
  { id: "s8", type: "ftz", source: "FTZ #50", description: "Rate lock kitchenware", amount: 7600, date: "Dec 2025" },
  { id: "s9", type: "route-optimization", source: "Qingdao Direct", description: "Direct vs transshipment", amount: 1900, date: "Nov 2025" },
  { id: "s10", type: "consolidation", source: "Singapore Hub", description: "Multi-origin consolidation", amount: 4300, date: "Nov 2025" },
];
export interface ExecutiveSummary { period: string; revenue: { current: number; previous: number; target: number }; volume: { containers: number; teus: number; weight: string }; savings: { total: number; ftz: number; rateOpt: number }; onTime: { rate: number; target: number }; topRisks: string[]; topWins: string[]; }

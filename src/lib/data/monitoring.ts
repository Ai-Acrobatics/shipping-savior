// ============================================================
// Shipping Savior — Monitoring Data
// Phase 3: Platform Health, Data Quality, AI Performance, Business KPIs
// ============================================================

// ─── Platform Health ──────────────────────────────────────────

export interface ServiceStatus {
  name: string;
  status: "operational" | "degraded" | "down";
  uptime: number; // percentage over 30 days
  responseTime: number; // ms (p50)
  p99ResponseTime: number; // ms
  errorRate: number; // percentage
  lastIncident?: string;
  description: string;
}

export const platformServices: ServiceStatus[] = [
  {
    name: "Web Application",
    status: "operational",
    uptime: 99.97,
    responseTime: 142,
    p99ResponseTime: 420,
    errorRate: 0.02,
    description: "Next.js frontend and API routes",
  },
  {
    name: "Shipment Tracking API",
    status: "operational",
    uptime: 99.94,
    responseTime: 89,
    p99ResponseTime: 310,
    errorRate: 0.05,
    description: "Real-time shipment position and ETA updates",
  },
  {
    name: "Landed Cost Engine",
    status: "operational",
    uptime: 99.99,
    responseTime: 234,
    p99ResponseTime: 680,
    errorRate: 0.01,
    description: "Cost calculation and tariff lookups",
  },
  {
    name: "FTZ Analysis Service",
    status: "degraded",
    uptime: 99.82,
    responseTime: 412,
    p99ResponseTime: 1240,
    errorRate: 0.18,
    lastIncident: "Mar 25, 2026 — Elevated latency during batch processing",
    description: "Foreign Trade Zone savings analysis and withdrawal modeling",
  },
  {
    name: "Document Processing",
    status: "operational",
    uptime: 99.91,
    responseTime: 1820,
    p99ResponseTime: 4200,
    errorRate: 0.08,
    description: "ISF, B/L, and customs document parsing",
  },
  {
    name: "Notification Service",
    status: "operational",
    uptime: 99.95,
    responseTime: 56,
    p99ResponseTime: 180,
    errorRate: 0.03,
    description: "Email, SMS, and in-app alert delivery",
  },
  {
    name: "Rate Comparison API",
    status: "operational",
    uptime: 99.88,
    responseTime: 345,
    p99ResponseTime: 890,
    errorRate: 0.11,
    description: "Carrier rate quotes and comparison engine",
  },
  {
    name: "Database (PostgreSQL)",
    status: "operational",
    uptime: 99.99,
    responseTime: 12,
    p99ResponseTime: 45,
    errorRate: 0.0,
    description: "Primary data store on Neon serverless",
  },
];

export interface UptimeDay {
  date: string;
  status: "operational" | "degraded" | "down";
  uptimePct: number;
}

// 30-day uptime history for the overall platform
export const uptimeHistory: UptimeDay[] = Array.from({ length: 30 }, (_, i) => {
  const d = new Date(2026, 2, 26);
  d.setDate(d.getDate() - (29 - i));
  const dateStr = d.toISOString().split("T")[0];
  // Simulate mostly green with a couple degraded days
  const isDegraded = i === 12 || i === 25;
  return {
    date: dateStr,
    status: isDegraded ? "degraded" as const : "operational" as const,
    uptimePct: isDegraded ? 99.4 + Math.random() * 0.4 : 99.9 + Math.random() * 0.1,
  };
});

export interface ResourceMetric {
  name: string;
  current: number;
  limit: number;
  unit: string;
  trend: number; // percentage change from last period
}

export const resourceMetrics: ResourceMetric[] = [
  { name: "CPU Usage", current: 34, limit: 100, unit: "%", trend: -2.4 },
  { name: "Memory", current: 2.1, limit: 4.0, unit: "GB", trend: 5.1 },
  { name: "Database Connections", current: 18, limit: 50, unit: "conn", trend: 0 },
  { name: "API Requests/min", current: 842, limit: 5000, unit: "req/m", trend: 12.3 },
  { name: "Storage Used", current: 12.4, limit: 50, unit: "GB", trend: 3.8 },
  { name: "CDN Bandwidth", current: 284, limit: 1000, unit: "GB/mo", trend: 8.2 },
];

// ─── Data Pipeline Health ─────────────────────────────────────

export interface PipelineStage {
  name: string;
  status: "healthy" | "warning" | "error" | "idle";
  lastRun: string;
  nextRun: string;
  avgDuration: string;
  recordsProcessed: number;
  errorCount: number;
  successRate: number;
  description: string;
}

export const dataPipelines: PipelineStage[] = [
  {
    name: "Carrier Rate Ingestion",
    status: "healthy",
    lastRun: "Mar 26, 08:00 UTC",
    nextRun: "Mar 26, 20:00 UTC",
    avgDuration: "4m 12s",
    recordsProcessed: 12480,
    errorCount: 3,
    successRate: 99.98,
    description: "Pulls latest rates from 8 carriers via API/EDI",
  },
  {
    name: "HTS Code Sync",
    status: "healthy",
    lastRun: "Mar 26, 06:30 UTC",
    nextRun: "Mar 27, 06:30 UTC",
    avgDuration: "12m 45s",
    recordsProcessed: 18200,
    errorCount: 0,
    successRate: 100,
    description: "USITC HTS database delta sync",
  },
  {
    name: "Shipment Position Updates",
    status: "healthy",
    lastRun: "Mar 26, 14:28 UTC",
    nextRun: "Mar 26, 14:43 UTC",
    avgDuration: "38s",
    recordsProcessed: 342,
    errorCount: 1,
    successRate: 99.71,
    description: "AIS vessel position + container milestone polling",
  },
  {
    name: "FTZ Inventory Reconciliation",
    status: "warning",
    lastRun: "Mar 26, 07:00 UTC",
    nextRun: "Mar 27, 07:00 UTC",
    avgDuration: "8m 30s",
    recordsProcessed: 4820,
    errorCount: 14,
    successRate: 99.71,
    description: "Reconcile FTZ inventory counts with CBP records",
  },
  {
    name: "Tariff Schedule Updates",
    status: "healthy",
    lastRun: "Mar 25, 00:00 UTC",
    nextRun: "Mar 26, 00:00 UTC",
    avgDuration: "2m 15s",
    recordsProcessed: 640,
    errorCount: 0,
    successRate: 100,
    description: "Section 301, AD/CVD rate change monitoring",
  },
  {
    name: "Port Congestion Feed",
    status: "healthy",
    lastRun: "Mar 26, 12:00 UTC",
    nextRun: "Mar 26, 18:00 UTC",
    avgDuration: "1m 48s",
    recordsProcessed: 86,
    errorCount: 0,
    successRate: 100,
    description: "Port dwell times, berth availability, wait times",
  },
  {
    name: "Document OCR Pipeline",
    status: "idle",
    lastRun: "Mar 26, 11:42 UTC",
    nextRun: "On demand",
    avgDuration: "22s per doc",
    recordsProcessed: 18,
    errorCount: 1,
    successRate: 94.44,
    description: "Extracts structured data from scanned B/L, invoices",
  },
  {
    name: "Weather & Risk Feed",
    status: "healthy",
    lastRun: "Mar 26, 14:00 UTC",
    nextRun: "Mar 26, 15:00 UTC",
    avgDuration: "52s",
    recordsProcessed: 124,
    errorCount: 0,
    successRate: 100,
    description: "Typhoon tracks, port closures, geopolitical alerts",
  },
];

export interface DataQualityMetric {
  dimension: string;
  score: number; // 0-100
  description: string;
  issues: number;
  trend: number; // change from last period
}

export const dataQualityMetrics: DataQualityMetric[] = [
  { dimension: "Completeness", score: 97.2, description: "All required fields populated", issues: 12, trend: 0.4 },
  { dimension: "Accuracy", score: 99.1, description: "Data matches source of truth", issues: 4, trend: 0.2 },
  { dimension: "Timeliness", score: 94.8, description: "Data freshness within SLA", issues: 8, trend: -0.6 },
  { dimension: "Consistency", score: 98.4, description: "Cross-system data agreement", issues: 6, trend: 0.1 },
  { dimension: "Uniqueness", score: 99.8, description: "No duplicate records", issues: 1, trend: 0.0 },
  { dimension: "Validity", score: 96.5, description: "Values within expected ranges", issues: 15, trend: -0.3 },
];

// ─── AI Agent Performance ──────────────────────────────────────

export interface AIAgent {
  name: string;
  type: string;
  status: "active" | "idle" | "error" | "learning";
  accuracy: number;
  requestsToday: number;
  avgLatency: number; // ms
  costToday: number; // USD
  lastError?: string;
  modelVersion: string;
  description: string;
}

export const aiAgents: AIAgent[] = [
  {
    name: "ETA Predictor",
    type: "Regression Model",
    status: "active",
    accuracy: 94.2,
    requestsToday: 1240,
    avgLatency: 180,
    costToday: 2.48,
    modelVersion: "v3.2.1",
    description: "Predicts vessel/container ETAs using AIS + weather + port congestion data",
  },
  {
    name: "Duty Rate Classifier",
    type: "Classification",
    status: "active",
    accuracy: 97.8,
    requestsToday: 680,
    avgLatency: 95,
    costToday: 1.36,
    modelVersion: "v2.1.0",
    description: "Maps product descriptions to HTS codes and applicable duty rates",
  },
  {
    name: "Route Optimizer",
    type: "Optimization",
    status: "active",
    accuracy: 91.5,
    requestsToday: 342,
    avgLatency: 2400,
    costToday: 4.10,
    modelVersion: "v1.4.0",
    description: "Multi-objective route selection balancing cost, transit time, and risk",
  },
  {
    name: "Document Extractor",
    type: "NLP / OCR",
    status: "idle",
    accuracy: 89.3,
    requestsToday: 18,
    avgLatency: 3200,
    costToday: 0.54,
    modelVersion: "v2.0.3",
    description: "Extracts structured fields from bills of lading, invoices, and customs forms",
  },
  {
    name: "Anomaly Detector",
    type: "Anomaly Detection",
    status: "active",
    accuracy: 86.7,
    requestsToday: 4200,
    avgLatency: 45,
    costToday: 0.84,
    modelVersion: "v1.2.0",
    description: "Detects unusual cost spikes, delivery pattern shifts, and rate outliers",
  },
  {
    name: "Compliance Checker",
    type: "Rule Engine + LLM",
    status: "active",
    accuracy: 98.4,
    requestsToday: 156,
    avgLatency: 520,
    costToday: 1.87,
    modelVersion: "v1.1.2",
    description: "Validates shipment documents against CBP, USTR, and trade compliance rules",
  },
  {
    name: "Demand Forecaster",
    type: "Time Series",
    status: "learning",
    accuracy: 82.1,
    requestsToday: 0,
    avgLatency: 0,
    costToday: 0,
    modelVersion: "v0.9.0-beta",
    description: "Predicts future shipment volumes by lane and cargo type",
  },
];

export interface AIPerformanceTrend {
  date: string;
  etaAccuracy: number;
  dutyAccuracy: number;
  routeAccuracy: number;
  docAccuracy: number;
  anomalyPrecision: number;
}

export const aiPerformanceTrends: AIPerformanceTrend[] = [
  { date: "Week 1", etaAccuracy: 91.8, dutyAccuracy: 96.4, routeAccuracy: 88.2, docAccuracy: 85.1, anomalyPrecision: 82.3 },
  { date: "Week 2", etaAccuracy: 92.4, dutyAccuracy: 96.9, routeAccuracy: 89.1, docAccuracy: 86.4, anomalyPrecision: 83.1 },
  { date: "Week 3", etaAccuracy: 93.1, dutyAccuracy: 97.2, routeAccuracy: 90.3, docAccuracy: 87.8, anomalyPrecision: 84.8 },
  { date: "Week 4", etaAccuracy: 93.8, dutyAccuracy: 97.5, routeAccuracy: 90.8, docAccuracy: 88.6, anomalyPrecision: 85.9 },
  { date: "Week 5", etaAccuracy: 94.2, dutyAccuracy: 97.8, routeAccuracy: 91.5, docAccuracy: 89.3, anomalyPrecision: 86.7 },
];

// ─── Business KPIs ─────────────────────────────────────────────

export interface BusinessKPI {
  name: string;
  value: string;
  numericValue: number;
  target: string;
  numericTarget: number;
  unit: string;
  trend: number;
  status: "on-track" | "at-risk" | "behind";
  category: "revenue" | "efficiency" | "quality" | "growth";
}

export const businessKPIs: BusinessKPI[] = [
  {
    name: "Monthly Recurring Revenue",
    value: "$84,500",
    numericValue: 84500,
    target: "$100,000",
    numericTarget: 100000,
    unit: "USD",
    trend: 12.4,
    status: "on-track",
    category: "revenue",
  },
  {
    name: "Cost Savings Delivered",
    value: "$243,900",
    numericValue: 243900,
    target: "$200,000",
    numericTarget: 200000,
    unit: "USD",
    trend: 18.2,
    status: "on-track",
    category: "revenue",
  },
  {
    name: "Active Users",
    value: "142",
    numericValue: 142,
    target: "200",
    numericTarget: 200,
    unit: "users",
    trend: 8.6,
    status: "at-risk",
    category: "growth",
  },
  {
    name: "Shipments Managed",
    value: "37",
    numericValue: 37,
    target: "50",
    numericTarget: 50,
    unit: "shipments/mo",
    trend: 5.7,
    status: "at-risk",
    category: "growth",
  },
  {
    name: "Avg Landed Cost Reduction",
    value: "12.4%",
    numericValue: 12.4,
    target: "15%",
    numericTarget: 15,
    unit: "%",
    trend: 2.1,
    status: "on-track",
    category: "efficiency",
  },
  {
    name: "On-Time Delivery Rate",
    value: "89%",
    numericValue: 89,
    target: "92%",
    numericTarget: 92,
    unit: "%",
    trend: -2.1,
    status: "at-risk",
    category: "quality",
  },
  {
    name: "Customer Satisfaction",
    value: "4.6",
    numericValue: 4.6,
    target: "4.8",
    numericTarget: 4.8,
    unit: "/5.0",
    trend: 0.2,
    status: "on-track",
    category: "quality",
  },
  {
    name: "FTZ Utilization Rate",
    value: "78%",
    numericValue: 78,
    target: "85%",
    numericTarget: 85,
    unit: "%",
    trend: 4.3,
    status: "on-track",
    category: "efficiency",
  },
];

export interface RevenueDataPoint {
  month: string;
  revenue: number;
  target: number;
  costSavings: number;
}

export const revenueTimeline: RevenueDataPoint[] = [
  { month: "Oct", revenue: 52000, target: 60000, costSavings: 128000 },
  { month: "Nov", revenue: 58000, target: 65000, costSavings: 156000 },
  { month: "Dec", revenue: 62000, target: 70000, costSavings: 142000 },
  { month: "Jan", revenue: 71000, target: 80000, costSavings: 198000 },
  { month: "Feb", revenue: 76000, target: 90000, costSavings: 218000 },
  { month: "Mar", revenue: 84500, target: 100000, costSavings: 243900 },
];

// ─── Competitor Tracking ───────────────────────────────────────

export interface Competitor {
  name: string;
  category: string;
  marketShare: number;
  strengths: string[];
  weaknesses: string[];
  recentMoves: string;
  threatLevel: "low" | "medium" | "high";
  pricingVsUs: string;
}

export const competitors: Competitor[] = [
  {
    name: "Flexport",
    category: "Digital Freight Forwarder",
    marketShare: 2.8,
    strengths: ["Brand recognition", "VC funding ($2.3B)", "Full-service platform"],
    weaknesses: ["Premium pricing", "Less SMB focus", "Generic FTZ tools"],
    recentMoves: "Launched AI-powered customs classification tool in Q1 2026",
    threatLevel: "high",
    pricingVsUs: "+35-50%",
  },
  {
    name: "Freightos",
    category: "Rate Marketplace",
    marketShare: 1.2,
    strengths: ["Rate transparency", "Marketplace model", "WebCargo acquisition"],
    weaknesses: ["No FTZ analysis", "Limited cold chain", "Marketplace only"],
    recentMoves: "Expanded Asian carrier partnerships, added LCL booking",
    threatLevel: "medium",
    pricingVsUs: "+10-20%",
  },
  {
    name: "project44",
    category: "Visibility Platform",
    marketShare: 3.1,
    strengths: ["Real-time visibility", "Enterprise clients", "Carrier network"],
    weaknesses: ["No cost optimization", "No FTZ tools", "Enterprise-only pricing"],
    recentMoves: "Merged with FourKites, expanding supply chain visibility footprint",
    threatLevel: "medium",
    pricingVsUs: "+60-80%",
  },
  {
    name: "Descartes MacroPoint",
    category: "Visibility + Compliance",
    marketShare: 2.4,
    strengths: ["Compliance expertise", "Customs tools", "Large carrier network"],
    weaknesses: ["Legacy UX", "Slow innovation", "No landed cost engine"],
    recentMoves: "Added denied party screening integration",
    threatLevel: "low",
    pricingVsUs: "+20-30%",
  },
  {
    name: "Shippo",
    category: "Shipping API",
    marketShare: 0.8,
    strengths: ["Developer friendly", "Easy integration", "SMB market"],
    weaknesses: ["Domestic focus", "No FTZ/tariff", "Limited international"],
    recentMoves: "Expanding international carrier connections",
    threatLevel: "low",
    pricingVsUs: "-10-15%",
  },
];

export interface CompetitorFeatureMatrix {
  feature: string;
  shippingSavior: boolean;
  flexport: boolean;
  freightos: boolean;
  project44: boolean;
  descartes: boolean;
}

export const featureComparison: CompetitorFeatureMatrix[] = [
  { feature: "Landed Cost Calculator", shippingSavior: true, flexport: true, freightos: false, project44: false, descartes: false },
  { feature: "FTZ Savings Analysis", shippingSavior: true, flexport: false, freightos: false, project44: false, descartes: false },
  { feature: "Real-time Tracking", shippingSavior: true, flexport: true, freightos: false, project44: true, descartes: true },
  { feature: "HTS Code Lookup", shippingSavior: true, flexport: true, freightos: false, project44: false, descartes: true },
  { feature: "Rate Comparison", shippingSavior: true, flexport: true, freightos: true, project44: false, descartes: false },
  { feature: "Cold Chain Monitoring", shippingSavior: true, flexport: true, freightos: false, project44: true, descartes: false },
  { feature: "AI ETA Prediction", shippingSavior: true, flexport: true, freightos: false, project44: true, descartes: false },
  { feature: "Document OCR", shippingSavior: true, flexport: true, freightos: false, project44: false, descartes: true },
  { feature: "Duty Drawback", shippingSavior: true, flexport: false, freightos: false, project44: false, descartes: true },
  { feature: "Route Optimization", shippingSavior: true, flexport: true, freightos: false, project44: false, descartes: false },
  { feature: "Compliance Screening", shippingSavior: true, flexport: true, freightos: false, project44: false, descartes: true },
  { feature: "Container Utilization", shippingSavior: true, flexport: false, freightos: false, project44: false, descartes: false },
];

// ─── Utility ─────────────────────────────────────────────────

export function getOverallPlatformStatus(): "operational" | "degraded" | "down" {
  const statuses = platformServices.map((s) => s.status);
  if (statuses.includes("down")) return "down";
  if (statuses.includes("degraded")) return "degraded";
  return "operational";
}

export function getOverallUptime(): number {
  const avg = platformServices.reduce((sum, s) => sum + s.uptime, 0) / platformServices.length;
  return Math.round(avg * 100) / 100;
}

export function getAITotalCost(): number {
  return aiAgents.reduce((sum, a) => sum + a.costToday, 0);
}

export function getDataQualityScore(): number {
  const avg = dataQualityMetrics.reduce((sum, m) => sum + m.score, 0) / dataQualityMetrics.length;
  return Math.round(avg * 10) / 10;
}

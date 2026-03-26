// Competitor tracking mock data for monitoring dashboard

export interface Competitor {
  id: string;
  name: string;
  logo: string; // initials for avatar
  category: "forwarder" | "platform" | "nvocc" | "broker";
  website: string;
  tier: "enterprise" | "mid-market" | "startup";
  threat: "high" | "medium" | "low";
  overallScore: number; // 0-100
  scores: {
    pricing: number;
    technology: number;
    coverage: number;
    support: number;
    compliance: number;
  };
  metrics: {
    estRevenue: string;
    marketShare: string;
    routeCoverage: number;
    avgTransitDays: number;
    onTimeRate: number;
    digitalAdoption: number;
  };
  strengths: string[];
  weaknesses: string[];
  recentMoves: CompetitorMove[];
  priceComparison: PriceComparison[];
}

export interface CompetitorMove {
  date: string;
  type: "pricing" | "product" | "expansion" | "partnership" | "regulation";
  title: string;
  description: string;
  impact: "positive" | "negative" | "neutral";
}

export interface PriceComparison {
  route: string;
  ourRate: number;
  theirRate: number;
  difference: number; // percentage — positive means we're cheaper
}

export interface MarketAlert {
  id: string;
  timestamp: string;
  competitor: string;
  type: "pricing" | "product" | "expansion" | "partnership" | "regulation";
  title: string;
  description: string;
  severity: "critical" | "warning" | "info";
  read: boolean;
}

export interface MarketTrend {
  month: string;
  ourShare: number;
  flexport: number;
  freightos: number;
  xeneta: number;
  traditional: number;
}

export const competitors: Competitor[] = [
  {
    id: "flexport",
    name: "Flexport",
    logo: "FP",
    category: "forwarder",
    website: "flexport.com",
    tier: "enterprise",
    threat: "high",
    overallScore: 82,
    scores: {
      pricing: 70,
      technology: 95,
      coverage: 85,
      support: 78,
      compliance: 80,
    },
    metrics: {
      estRevenue: "$2.1B",
      marketShare: "4.8%",
      routeCoverage: 87,
      avgTransitDays: 19,
      onTimeRate: 89,
      digitalAdoption: 94,
    },
    strengths: [
      "Best-in-class visibility platform",
      "Strong VC backing and brand",
      "End-to-end supply chain OS",
      "Excellent API ecosystem",
    ],
    weaknesses: [
      "Premium pricing (15-25% above market)",
      "Weak on cold chain specialization",
      "High customer churn in SMB segment",
      "Recent layoffs impacting service quality",
    ],
    recentMoves: [
      {
        date: "Mar 20, 2026",
        type: "product",
        title: "Launched AI-powered tariff classifier",
        description: "New HTS code recommendation engine using LLMs for automated classification",
        impact: "negative",
      },
      {
        date: "Mar 12, 2026",
        type: "pricing",
        title: "Reduced SE Asia → US West Coast rates",
        description: "12% rate reduction on Vietnam and Thailand lanes to capture market share",
        impact: "negative",
      },
      {
        date: "Feb 28, 2026",
        type: "partnership",
        title: "Partnership with Lineage Logistics",
        description: "Cold chain integration for reefer container tracking",
        impact: "negative",
      },
    ],
    priceComparison: [
      { route: "HCMC → Long Beach", ourRate: 4200, theirRate: 4850, difference: 13.4 },
      { route: "Bangkok → Seattle", ourRate: 3800, theirRate: 4200, difference: 9.5 },
      { route: "Jakarta → LA", ourRate: 3500, theirRate: 4100, difference: 14.6 },
      { route: "Qingdao → Long Beach", ourRate: 3200, theirRate: 3650, difference: 12.3 },
    ],
  },
  {
    id: "freightos",
    name: "Freightos",
    logo: "FO",
    category: "platform",
    website: "freightos.com",
    tier: "enterprise",
    threat: "medium",
    overallScore: 74,
    scores: {
      pricing: 85,
      technology: 88,
      coverage: 72,
      support: 65,
      compliance: 60,
    },
    metrics: {
      estRevenue: "$450M",
      marketShare: "2.1%",
      routeCoverage: 72,
      avgTransitDays: 21,
      onTimeRate: 84,
      digitalAdoption: 91,
    },
    strengths: [
      "Marketplace model — carrier aggregation",
      "Real-time rate comparison engine",
      "Public company (CRGO on Nasdaq)",
      "Strong in instant quoting",
    ],
    weaknesses: [
      "Marketplace only — no asset control",
      "Limited FTZ/bonded warehouse integration",
      "Weak customs brokerage capability",
      "No cold chain specialization",
    ],
    recentMoves: [
      {
        date: "Mar 15, 2026",
        type: "expansion",
        title: "Opened Vietnam operations office",
        description: "New office in Ho Chi Minh City to capture SE Asia origin freight",
        impact: "negative",
      },
      {
        date: "Feb 18, 2026",
        type: "product",
        title: "Launched predictive transit analytics",
        description: "ML-based ETA predictions with 92% accuracy claim",
        impact: "neutral",
      },
    ],
    priceComparison: [
      { route: "HCMC → Long Beach", ourRate: 4200, theirRate: 4050, difference: -3.6 },
      { route: "Bangkok → Seattle", ourRate: 3800, theirRate: 3700, difference: -2.7 },
      { route: "Jakarta → LA", ourRate: 3500, theirRate: 3400, difference: -2.9 },
      { route: "Qingdao → Long Beach", ourRate: 3200, theirRate: 3150, difference: -1.6 },
    ],
  },
  {
    id: "xeneta",
    name: "Xeneta",
    logo: "XN",
    category: "platform",
    website: "xeneta.com",
    tier: "mid-market",
    threat: "medium",
    overallScore: 68,
    scores: {
      pricing: 78,
      technology: 82,
      coverage: 65,
      support: 70,
      compliance: 55,
    },
    metrics: {
      estRevenue: "$120M",
      marketShare: "0.8%",
      routeCoverage: 65,
      avgTransitDays: 22,
      onTimeRate: 82,
      digitalAdoption: 85,
    },
    strengths: [
      "Best ocean rate benchmarking data",
      "Strong analytics and market intelligence",
      "Growing air freight capabilities",
      "Good enterprise sales motion",
    ],
    weaknesses: [
      "Analytics-only — no operational execution",
      "No customs or compliance tools",
      "Limited to rate intelligence niche",
      "Small US presence",
    ],
    recentMoves: [
      {
        date: "Mar 5, 2026",
        type: "product",
        title: "Released Xeneta Carbon Emissions tracker",
        description: "Scope 3 emissions reporting integrated into rate benchmarks",
        impact: "neutral",
      },
    ],
    priceComparison: [
      { route: "HCMC → Long Beach", ourRate: 4200, theirRate: 4300, difference: 2.3 },
      { route: "Bangkok → Seattle", ourRate: 3800, theirRate: 3900, difference: 2.6 },
    ],
  },
  {
    id: "descartes",
    name: "Descartes Systems",
    logo: "DS",
    category: "platform",
    website: "descartes.com",
    tier: "enterprise",
    threat: "low",
    overallScore: 71,
    scores: {
      pricing: 65,
      technology: 75,
      coverage: 80,
      support: 72,
      compliance: 90,
    },
    metrics: {
      estRevenue: "$520M",
      marketShare: "1.5%",
      routeCoverage: 80,
      avgTransitDays: 20,
      onTimeRate: 86,
      digitalAdoption: 72,
    },
    strengths: [
      "Deep customs/compliance (ABI/ACI, ACE integration)",
      "Massive logistics network (28K+ connected parties)",
      "Stable public company (TSX: DSG)",
      "Strong government/regulatory connections",
    ],
    weaknesses: [
      "Legacy technology — slow innovation",
      "Complex pricing and implementation",
      "Poor UX compared to modern platforms",
      "Weak in real-time rate intelligence",
    ],
    recentMoves: [
      {
        date: "Mar 18, 2026",
        type: "regulation",
        title: "CBP ACE integration update",
        description: "First to support new ACE 2.0 filing requirements ahead of June deadline",
        impact: "neutral",
      },
    ],
    priceComparison: [
      { route: "HCMC → Long Beach", ourRate: 4200, theirRate: 4500, difference: 6.7 },
      { route: "Bangkok → Seattle", ourRate: 3800, theirRate: 4100, difference: 7.3 },
    ],
  },
  {
    id: "shipbob",
    name: "ShipBob",
    logo: "SB",
    category: "forwarder",
    website: "shipbob.com",
    tier: "startup",
    threat: "low",
    overallScore: 58,
    scores: {
      pricing: 80,
      technology: 72,
      coverage: 45,
      support: 68,
      compliance: 42,
    },
    metrics: {
      estRevenue: "$350M",
      marketShare: "0.6%",
      routeCoverage: 45,
      avgTransitDays: 24,
      onTimeRate: 78,
      digitalAdoption: 80,
    },
    strengths: [
      "Strong DTC fulfillment network",
      "Simple onboarding for SMBs",
      "Good last-mile delivery times",
      "Growing international presence",
    ],
    weaknesses: [
      "Primarily domestic fulfillment focus",
      "Limited international freight expertise",
      "No FTZ or bonded warehouse capabilities",
      "Weak customs brokerage",
    ],
    recentMoves: [
      {
        date: "Feb 25, 2026",
        type: "expansion",
        title: "Launched Australia fulfillment center",
        description: "New Sydney warehouse for APAC-origin DTC brands",
        impact: "neutral",
      },
    ],
    priceComparison: [
      { route: "HCMC → Long Beach", ourRate: 4200, theirRate: 4600, difference: 8.7 },
    ],
  },
];

export const marketAlerts: MarketAlert[] = [
  {
    id: "ma-1",
    timestamp: "2026-03-25T10:30:00Z",
    competitor: "Flexport",
    type: "pricing",
    title: "Flexport aggressive rate cuts on SE Asia lanes",
    description: "Flexport reduced Vietnam → US West Coast rates by 12%, potentially below cost. Monitor for sustained pricing pressure on HCMC → Long Beach lane.",
    severity: "critical",
    read: false,
  },
  {
    id: "ma-2",
    timestamp: "2026-03-22T14:00:00Z",
    competitor: "Freightos",
    type: "expansion",
    title: "Freightos opens HCMC office",
    description: "Freightos (CRGO) establishing origin operations in Ho Chi Minh City. Could improve their Vietnam lane pricing by 5-8% through direct carrier relationships.",
    severity: "warning",
    read: false,
  },
  {
    id: "ma-3",
    timestamp: "2026-03-20T09:15:00Z",
    competitor: "Flexport",
    type: "product",
    title: "Flexport AI tariff classifier launch",
    description: "New HTS classification tool threatens our tariff scenario builder differentiation. Claims 96% accuracy on 6-digit HTS codes.",
    severity: "warning",
    read: true,
  },
  {
    id: "ma-4",
    timestamp: "2026-03-18T16:00:00Z",
    competitor: "Descartes",
    type: "regulation",
    title: "Descartes first with ACE 2.0 compliance",
    description: "Descartes Systems announced first-to-market ACE 2.0 filing support, ahead of June 2026 CBP deadline. We should verify our compliance timeline.",
    severity: "info",
    read: true,
  },
  {
    id: "ma-5",
    timestamp: "2026-03-15T11:30:00Z",
    competitor: "Xeneta",
    type: "product",
    title: "Xeneta launches carbon emissions tracker",
    description: "New Scope 3 emissions reporting feature could appeal to ESG-focused importers. Consider adding emissions data to our landed cost calculations.",
    severity: "info",
    read: true,
  },
];

export const marketTrends: MarketTrend[] = [
  { month: "Oct", ourShare: 1.2, flexport: 4.5, freightos: 1.9, xeneta: 0.7, traditional: 91.7 },
  { month: "Nov", ourShare: 1.4, flexport: 4.6, freightos: 2.0, xeneta: 0.7, traditional: 91.3 },
  { month: "Dec", ourShare: 1.5, flexport: 4.7, freightos: 2.0, xeneta: 0.8, traditional: 91.0 },
  { month: "Jan", ourShare: 1.7, flexport: 4.8, freightos: 2.1, xeneta: 0.8, traditional: 90.6 },
  { month: "Feb", ourShare: 1.9, flexport: 4.7, freightos: 2.1, xeneta: 0.8, traditional: 90.5 },
  { month: "Mar", ourShare: 2.1, flexport: 4.8, freightos: 2.2, xeneta: 0.8, traditional: 90.1 },
];

export const featureMatrix = [
  { feature: "Real-time tracking", us: true, flexport: true, freightos: true, xeneta: false, descartes: true },
  { feature: "HTS classification AI", us: true, flexport: true, freightos: false, xeneta: false, descartes: true },
  { feature: "FTZ management", us: true, flexport: false, freightos: false, xeneta: false, descartes: true },
  { feature: "Cold chain monitoring", us: true, flexport: true, freightos: false, xeneta: false, descartes: false },
  { feature: "Landed cost calculator", us: true, flexport: true, freightos: true, xeneta: true, descartes: false },
  { feature: "Rate benchmarking", us: true, flexport: true, freightos: true, xeneta: true, descartes: false },
  { feature: "Customs compliance", us: true, flexport: true, freightos: false, xeneta: false, descartes: true },
  { feature: "Carbon emissions", us: false, flexport: true, freightos: false, xeneta: true, descartes: false },
  { feature: "Multi-modal (air+ocean)", us: true, flexport: true, freightos: true, xeneta: true, descartes: true },
  { feature: "API ecosystem", us: true, flexport: true, freightos: true, xeneta: true, descartes: true },
  { feature: "Predictive ETA", us: true, flexport: true, freightos: true, xeneta: false, descartes: false },
  { feature: "Tariff scenario builder", us: true, flexport: false, freightos: false, xeneta: false, descartes: false },
];

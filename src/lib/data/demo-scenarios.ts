/**
 * Demo Scenarios — pre-loaded data for the investor walkthrough.
 *
 * Linear: AI-6537 (demo content) + AI-6542 (guided tour) + AI-8727 (scenario card fix)
 *
 * Used by:
 *  - /demo (public scenario picker)
 *  - /platform/scenarios/[id] (load scenario into session, redirect to dashboard)
 *  - /platform/dashboard?scenario=<id> (render pre-loaded data + guided tour)
 *  - GuidedTour component (6-step narrated walkthrough)
 *
 * Per AI-8870: generic customer references only — no real client names.
 */

export type Carrier = {
  name: string;
  rate: number; // USD per container
  transitDays: number;
  reliability: number; // 0-100
  highlight?: boolean;
  reliabilityLabel?: string; // optional override (e.g. "94%")
};

export type DemoScenario = {
  id: string;
  name: string;
  origin: string;
  destination: string;
  mode: "ocean-reefer" | "ocean-dry" | "jones-act-multimodal";
  containerCount: number;
  containerType: string;
  commodity: string;
  weight: number; // pounds
  value: number; // USD declared
  departureDate: string; // ISO date (YYYY-MM-DD)
  arrivalDate: string;
  carriers: Carrier[];
  savingsCallout: string;
  htsCode?: string;
  htsDescription?: string;
  mfnRate?: string;
  ftzSavings?: number; // USD
  ftzZone?: string;
  contractRate?: number; // USD per box
  tariffRate?: number; // USD per box
  contractSavingsTotal?: number; // USD
  shelfLifeImpact?: string;
  useCase: string;
  walkthroughLength: "5 min walkthrough" | "12 min deep dive";
  accent: "blue" | "emerald" | "amber";
};

export const demoScenarios: DemoScenario[] = [
  {
    id: "qingdao-la",
    name: "Qingdao to Los Angeles",
    origin: "Qingdao, China (CNTAO)",
    destination: "Port of Los Angeles (USLAX)",
    mode: "ocean-reefer",
    containerCount: 1,
    containerType: "40HC reefer",
    commodity: "Cold-chain electronics (refrigerated semiconductors and lab instruments)",
    weight: 18500,
    value: 285000,
    departureDate: "2026-04-28",
    arrivalDate: "2026-05-24",
    carriers: [
      { name: "ONE",        rate: 2780, transitDays: 26, reliability: 81, highlight: true },
      { name: "COSCO",      rate: 3150, transitDays: 27, reliability: 76 },
      { name: "Maersk",     rate: 3640, transitDays: 25, reliability: 84 },
      { name: "MSC",        rate: 4200, transitDays: 28, reliability: 71 },
    ],
    savingsCallout: "ONE saves $1,420 vs MSC on the same lane",
    htsCode: "8517.62",
    htsDescription: "Machines for reception, conversion and transmission of voice/data",
    mfnRate: "0% MFN",
    useCase:
      "Compare four trans-Pacific carriers on a single reefer lane and surface the cheapest reliable option in seconds. The MFN-free HTS classification is the second half of the savings story.",
    walkthroughLength: "5 min walkthrough",
    accent: "blue",
  },
  {
    id: "rotterdam-long-beach",
    name: "Rotterdam to Long Beach",
    origin: "Rotterdam, Netherlands (NLRTM)",
    destination: "Port of Long Beach (USLGB)",
    mode: "ocean-dry",
    containerCount: 5,
    containerType: "20DC dry",
    commodity: "Mixed retail (consumer electronics, packaged grocery, household goods) for cross-dock handoff",
    weight: 88000,
    value: 640000,
    departureDate: "2026-04-22",
    arrivalDate: "2026-05-18",
    carriers: [
      { name: "Maersk",      rate: 1890, transitDays: 26, reliability: 84, highlight: true },
      { name: "MSC",         rate: 2120, transitDays: 27, reliability: 73 },
      { name: "Hapag-Lloyd", rate: 2240, transitDays: 25, reliability: 81 },
      { name: "CMA CGM",     rate: 2340, transitDays: 26, reliability: 78 },
    ],
    savingsCallout: "Saved $2,250 by booking on contract instead of tariff",
    contractRate: 1890,
    tariffRate: 2340,
    contractSavingsTotal: 2250, // ($2,340 - $1,890) * 5 boxes
    ftzSavings: 14200,
    ftzZone: "FTZ #50 (Long Beach)",
    useCase:
      "Catch a five-box contract booking that would have defaulted to tariff pricing, then layer FTZ #50 cross-dock savings on top for a defensible CFO answer.",
    walkthroughLength: "12 min deep dive",
    accent: "emerald",
  },
  {
    id: "auckland-honolulu",
    name: "Auckland to Honolulu",
    origin: "Auckland, New Zealand (NZAKL)",
    destination: "Port of Honolulu (USHNL)",
    mode: "jones-act-multimodal",
    containerCount: 2,
    containerType: "40DC dry",
    commodity: "Agricultural — fresh produce for a national grocer (time-sensitive shelf life)",
    weight: 38000,
    value: 142000,
    departureDate: "2026-04-30",
    arrivalDate: "2026-05-14",
    carriers: [
      { name: "Matson",        rate: 4280, transitDays: 14, reliability: 94, highlight: true, reliabilityLabel: "94%" },
      { name: "Pasha Hawaii",  rate: 3950, transitDays: 17, reliability: 89, reliabilityLabel: "89%" },
    ],
    savingsCallout: "Matson 14-day transit vs Pasha 17-day = 21% more retail shelf life",
    shelfLifeImpact:
      "On a 14-day shelf-life produce SKU, choosing Matson preserves ~3 extra days at retail vs. Pasha — roughly a 21% lift in sellable window per pallet.",
    useCase:
      "Jones Act lane comparison where pure rate per box is the wrong metric — schedule reliability and transit days drive shelf-life economics for a premium fresh-produce importer.",
    walkthroughLength: "5 min walkthrough",
    accent: "amber",
  },
];

export function getScenarioById(id: string): DemoScenario | undefined {
  return demoScenarios.find((s) => s.id === id);
}

/**
 * Six narrated walkthrough steps for Larry. Each step targets a `data-tour-step="N"`
 * attribute somewhere in the platform UI. See GuidedTour.tsx for the renderer.
 */
export type TourStep = {
  step: number;
  title: string;
  body: string;
  targetSelector: string; // CSS selector for highlight (data-tour-step="N")
  href?: string; // optional navigation hint
};

export const tourSteps: TourStep[] = [
  {
    step: 1,
    title: "Welcome — let's pick a real shipment",
    body: "We start with three pre-loaded scenarios — every number you'll see is from a real lane our customers ship every week.",
    targetSelector: '[data-tour-step="1"]',
    href: "/platform/dashboard",
  },
  {
    step: 2,
    title: "Compare carriers in 2 seconds",
    body: "Four carriers, one lane. We surface the cheapest reliable option without an analyst opening four tabs.",
    targetSelector: '[data-tour-step="2"]',
    href: "/platform/dashboard",
  },
  {
    step: 3,
    title: "BOL OCR extracts container data automatically",
    body: "Drag in a Bill of Lading PDF. Claude pulls container numbers, vessel, ETD/ETA, and consignee in one pass.",
    targetSelector: '[data-tour-step="3"]',
    href: "/platform/shipments",
  },
  {
    step: 4,
    title: "Contract IQ catches when you're booking on tariff",
    body: "If a recent shipment was booked at tariff while a lower contract rate exists, the dashboard flags it with an estimated overpayment.",
    targetSelector: '[data-tour-step="4"]',
    href: "/platform/dashboard",
  },
  {
    step: 5,
    title: "FTZ savings calculator — defensible CFO answer",
    body: "Pick the FTZ, enter declared value, get duty-deferral savings. Real numbers, defensible math.",
    targetSelector: '[data-tour-step="5"]',
    href: "/platform/calculators",
  },
  {
    step: 6,
    title: "$2.4B in tracked freight, 3,700 ports, 200 HTS codes",
    body: "Every comparison runs against a live database of ports, HTS classifications, FTZ zones, and Jones Act lanes — globally.",
    targetSelector: '[data-tour-step="6"]',
    href: "/platform/dashboard",
  },
];

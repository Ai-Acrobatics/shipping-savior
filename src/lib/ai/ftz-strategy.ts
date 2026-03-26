// ============================================================
// AI-Powered FTZ Strategy Advisor
// Sprint 4: AI Agent Layer
//
// Analyzes tariff trends, recommends Privileged Foreign (PF)
// vs Non-Privileged Foreign (NPF) status election, suggests
// optimal FTZ zone, models withdrawal scenarios.
// ============================================================

import { getAnthropicClient, getCached, setCache, makeCacheKey, trackUsage } from "./client";
import { getEffectiveDutyRate, SECTION_301_RATES } from "@/lib/data/hts-tariffs";
import { PORTS } from "@/lib/data/ports";
import type { CountryCode } from "@/lib/types";

// ─── Types ───────────────────────────────────────────────────

export interface FTZStrategyInput {
  productDescription: string;
  htsCode: string;
  countryOfOrigin: CountryCode;
  annualVolume: number; // units per year
  unitCostFOB: number;
  currentDutyPaid: number; // annual duty cost
  destinationState: string;
  reExportPercentage: number; // 0-100, % of goods re-exported
}

export interface FTZZoneRecommendation {
  ftzNumber: string;
  ftzName: string;
  port: string;
  city: string;
  distanceToPort: string;
  advantages: string[];
}

export interface WithdrawalScenario {
  name: string;
  description: string;
  dutyRate: number;
  annualDutyCost: number;
  savings: number;
  recommendation: "recommended" | "consider" | "not-recommended";
}

export interface FTZStrategyResult {
  statusElection: {
    recommendation: "PF" | "NPF";
    reasoning: string;
    pfDutyRate: number;
    npfDutyRate: number;
    annualSavings: number;
  };
  zoneRecommendations: FTZZoneRecommendation[];
  withdrawalScenarios: WithdrawalScenario[];
  aiStrategy: string;
  totalAnnualSavings: number;
  roiMonths: number;
  processingTimeMs: number;
}

// ─── FTZ Setup Costs ─────────────────────────────────────────

const FTZ_SETUP_COST = 15000; // Approximate annual FTZ operating cost
const FTZ_ACTIVATION_COST = 5000; // One-time activation
const FTZ_MONTHLY_STORAGE_PER_UNIT = 0.15; // $/unit/month

// ─── FTZ Zone Database (US major FTZs) ───────────────────────

const FTZ_ZONES: FTZZoneRecommendation[] = [
  {
    ftzNumber: "202",
    ftzName: "Los Angeles FTZ",
    port: "USLAX",
    city: "Los Angeles, CA",
    distanceToPort: "5 miles",
    advantages: [
      "Largest port complex in US",
      "Extensive cold chain infrastructure",
      "Rail connections to Midwest",
    ],
  },
  {
    ftzNumber: "50",
    ftzName: "Long Beach FTZ",
    port: "USLGB",
    city: "Long Beach, CA",
    distanceToPort: "Adjacent",
    advantages: [
      "Adjacent to port terminals",
      "Lower congestion than LA",
      "Modern automated facilities",
    ],
  },
  {
    ftzNumber: "5",
    ftzName: "Seattle FTZ",
    port: "USSEA",
    city: "Seattle, WA",
    distanceToPort: "8 miles",
    advantages: [
      "Closest US port to Asia",
      "Lower congestion",
      "Gateway to Pacific Northwest",
    ],
  },
  {
    ftzNumber: "1",
    ftzName: "New York FTZ",
    port: "USNYC",
    city: "New York, NJ",
    distanceToPort: "10 miles",
    advantages: [
      "Access to East Coast distribution",
      "Largest consumer market",
      "Multiple subzones available",
    ],
  },
  {
    ftzNumber: "104",
    ftzName: "Savannah FTZ",
    port: "USSAV",
    city: "Savannah, GA",
    distanceToPort: "Adjacent",
    advantages: [
      "Fastest-growing US port",
      "Low operating costs",
      "Southeast distribution hub",
    ],
  },
  {
    ftzNumber: "84",
    ftzName: "Houston FTZ",
    port: "USHOU",
    city: "Houston, TX",
    distanceToPort: "12 miles",
    advantages: [
      "No state income tax",
      "Central US distribution",
      "Petrochemical supply chain integration",
    ],
  },
];

// ─── State-to-FTZ Proximity Mapping ─────────────────────────

const STATE_FTZ_PREFERENCE: Record<string, string[]> = {
  CA: ["202", "50"],
  WA: ["5"],
  OR: ["5"],
  NY: ["1"],
  NJ: ["1"],
  CT: ["1"],
  GA: ["104"],
  SC: ["104"],
  FL: ["104"],
  TX: ["84"],
  LA: ["84"],
  IL: ["1", "84"],
  OH: ["1"],
  PA: ["1"],
};

// ─── Main Strategy Function ──────────────────────────────────

export async function analyzeFTZStrategy(
  input: FTZStrategyInput
): Promise<FTZStrategyResult> {
  const startTime = Date.now();

  // Check cache
  const cacheKey = makeCacheKey("ftz", input as unknown as Record<string, unknown>);
  const cached = getCached<FTZStrategyResult>(cacheKey);
  if (cached) return cached;

  // ── 1. Status Election Analysis ────────────────────────────
  const rates = getEffectiveDutyRate(input.htsCode, input.countryOfOrigin);
  const pfDutyRate = rates.effective; // PF: duty on foreign goods at import rate
  const annualCargoValue = input.unitCostFOB * input.annualVolume;

  // NPF: duty based on finished product classification (may be lower)
  // For simplicity, model NPF as potentially lower if manufacturing occurs in FTZ
  const npfDutyRate = Math.max(0, rates.baseRate * 0.7); // Assume manufacturing reduces effective rate

  const pfAnnualDuty = annualCargoValue * (pfDutyRate / 100);
  const npfAnnualDuty = annualCargoValue * (npfDutyRate / 100);

  // Re-export savings (goods re-exported from FTZ pay no US duty)
  const reExportSavings =
    pfAnnualDuty * (input.reExportPercentage / 100);

  // Duty deferral benefit (time value of money — assume 5% cost of capital)
  const avgDeferralMonths = 6; // Avg time goods stay in FTZ
  const deferralBenefit =
    pfAnnualDuty * 0.05 * (avgDeferralMonths / 12);

  const statusRecommendation = npfDutyRate < pfDutyRate ? "NPF" : "PF";
  const statusSavings =
    statusRecommendation === "NPF"
      ? pfAnnualDuty - npfAnnualDuty
      : 0;

  // ── 2. Zone Recommendations ────────────────────────────────
  const stateAbbr = input.destinationState.toUpperCase().substring(0, 2);
  const preferredZones = STATE_FTZ_PREFERENCE[stateAbbr] ?? [];

  const zoneRecommendations = FTZ_ZONES.filter(
    (z) => preferredZones.includes(z.ftzNumber)
  );

  // If no state-specific match, recommend top 3 by volume
  if (zoneRecommendations.length === 0) {
    zoneRecommendations.push(...FTZ_ZONES.slice(0, 3));
  }

  // ── 3. Withdrawal Scenarios ────────────────────────────────
  const withdrawalScenarios: WithdrawalScenario[] = [
    {
      name: "Domestic Consumption (Standard)",
      description: "Withdraw for domestic sale — full duty applies",
      dutyRate: pfDutyRate,
      annualDutyCost: pfAnnualDuty * ((100 - input.reExportPercentage) / 100),
      savings: reExportSavings + deferralBenefit,
      recommendation: "recommended",
    },
    {
      name: "Re-Export (Duty Free)",
      description: "Re-export goods from FTZ — zero US duty",
      dutyRate: 0,
      annualDutyCost: 0,
      savings: reExportSavings,
      recommendation:
        input.reExportPercentage > 10 ? "recommended" : "not-recommended",
    },
    {
      name: "Weekly Entry (Reduced Filing)",
      description:
        "File one customs entry per week instead of per-shipment — reduces broker fees",
      dutyRate: pfDutyRate,
      annualDutyCost: pfAnnualDuty,
      savings: Math.round((52 - input.annualVolume / 500) * 150), // Savings on broker fees
      recommendation: input.annualVolume > 10000 ? "recommended" : "consider",
    },
    {
      name: "Inverted Tariff Election",
      description:
        "Elect NPF status to use lower finished-good tariff rate after FTZ manufacturing",
      dutyRate: npfDutyRate,
      annualDutyCost: npfAnnualDuty,
      savings: statusSavings,
      recommendation:
        statusSavings > FTZ_SETUP_COST ? "recommended" : "consider",
    },
  ];

  // ── 4. Total Savings & ROI ─────────────────────────────────
  const totalAnnualSavings =
    reExportSavings + deferralBenefit + statusSavings;
  const totalSetupCost = FTZ_ACTIVATION_COST + FTZ_SETUP_COST;
  const roiMonths =
    totalAnnualSavings > 0
      ? Math.ceil((totalSetupCost / totalAnnualSavings) * 12)
      : 999;

  // ── 5. AI Strategy Recommendation ──────────────────────────
  const aiStrategy = await generateFTZStrategy(input, {
    pfDutyRate,
    npfDutyRate,
    totalAnnualSavings,
    roiMonths,
    reExportSavings,
    zoneRecommendations,
  });

  const result: FTZStrategyResult = {
    statusElection: {
      recommendation: statusRecommendation,
      reasoning:
        statusRecommendation === "NPF"
          ? `NPF status reduces effective duty from ${pfDutyRate.toFixed(1)}% to ${npfDutyRate.toFixed(1)}% through finished-good classification. Annual savings: $${statusSavings.toFixed(0)}.`
          : `PF status is optimal — the component duty rate (${pfDutyRate.toFixed(1)}%) is already at or below the finished-good rate.`,
      pfDutyRate,
      npfDutyRate,
      annualSavings: Math.round(statusSavings),
    },
    zoneRecommendations,
    withdrawalScenarios,
    aiStrategy,
    totalAnnualSavings: Math.round(totalAnnualSavings),
    roiMonths,
    processingTimeMs: Date.now() - startTime,
  };

  setCache(cacheKey, result);
  return result;
}

// ─── AI Strategy Generation ──────────────────────────────────

async function generateFTZStrategy(
  input: FTZStrategyInput,
  analysis: {
    pfDutyRate: number;
    npfDutyRate: number;
    totalAnnualSavings: number;
    roiMonths: number;
    reExportSavings: number;
    zoneRecommendations: FTZZoneRecommendation[];
  }
): Promise<string> {
  try {
    const client = getAnthropicClient();

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 600,
      system: `You are an FTZ (Foreign Trade Zone) strategy consultant. Provide a concise strategic recommendation for whether and how to use an FTZ. Consider:
1. Duty savings potential (is it worth the setup cost?)
2. Cash flow benefits of duty deferral
3. Re-export advantages
4. Inverted tariff opportunities
5. Zone selection rationale

Be specific with dollar amounts and timelines. Give a clear yes/no recommendation with supporting reasoning. Do NOT use markdown formatting.`,
      messages: [
        {
          role: "user",
          content: `FTZ Strategy Analysis:
Product: ${input.productDescription}
HTS: ${input.htsCode}, Origin: ${input.countryOfOrigin}
Annual volume: ${input.annualVolume.toLocaleString()} units at $${input.unitCostFOB}/unit
Current annual duty: $${input.currentDutyPaid.toLocaleString()}
Re-export: ${input.reExportPercentage}%
Destination: ${input.destinationState}

Analysis:
- PF duty rate: ${analysis.pfDutyRate.toFixed(1)}%
- NPF duty rate: ${analysis.npfDutyRate.toFixed(1)}%
- Total annual savings potential: $${analysis.totalAnnualSavings.toLocaleString()}
- ROI payback: ${analysis.roiMonths} months
- Re-export duty savings: $${analysis.reExportSavings.toFixed(0)}
- Recommended zones: ${analysis.zoneRecommendations.map((z) => z.ftzName).join(", ")}`,
        },
      ],
    });

    trackUsage(
      "system",
      "ftz-strategy",
      response.usage?.input_tokens ?? 0,
      response.usage?.output_tokens ?? 0
    );

    const textBlock = response.content.find((b) => b.type === "text");
    return textBlock && textBlock.type === "text"
      ? textBlock.text
      : "FTZ strategy based on algorithmic analysis.";
  } catch {
    const worthIt = analysis.totalAnnualSavings > FTZ_SETUP_COST;
    return `${worthIt ? "FTZ usage is recommended" : "FTZ may not be cost-effective"} for this product. Estimated annual savings: $${analysis.totalAnnualSavings.toLocaleString()} with a ${analysis.roiMonths}-month payback period. ${input.reExportPercentage > 0 ? `Re-export savings of $${analysis.reExportSavings.toFixed(0)}/year make the FTZ particularly valuable.` : "Consider FTZ primarily for duty deferral and consolidated entry filing benefits."}`;
  }
}

// ============================================================
// AI-Powered Cost Predictor
// Sprint 4: AI Agent Layer
//
// Predicts total landed cost with probabilistic risk factors:
// - Demurrage/detention probability
// - CBP exam probability
// - Delay probability by port
// - Confidence intervals for total cost
// ============================================================

import { getAnthropicClient, getCached, setCache, makeCacheKey, trackUsage } from "./client";
import { calculateLandedCost } from "@/lib/calculators/landed-cost";
import { getPort } from "@/lib/data/ports";
import type { LandedCostInput, CountryCode } from "@/lib/types";

// ─── Types ───────────────────────────────────────────────────

export interface CostPredictionInput {
  productDescription: string;
  htsCode: string;
  countryOfOrigin: CountryCode;
  unitCostFOB: number;
  totalUnits: number;
  containerType: "20GP" | "40GP" | "40HC" | "20RF" | "40RF";
  originPort: string;
  destPort: string;
  shippingMode: "ocean-fcl" | "ocean-lcl";
  freightCostTotal: number;
}

export interface RiskFactor {
  name: string;
  probability: number; // 0-1
  costImpact: number; // USD
  expectedCost: number; // probability * costImpact
  description: string;
}

export interface CostPredictionResult {
  baseLandedCost: {
    perUnit: number;
    total: number;
  };
  riskFactors: RiskFactor[];
  totalRiskCost: number;
  predictedCost: {
    perUnit: {
      low: number;
      expected: number;
      high: number;
    };
    total: {
      low: number;
      expected: number;
      high: number;
    };
    confidenceLevel: number; // e.g., 90 for 90% CI
  };
  aiInsights: string;
  processingTimeMs: number;
}

// ─── Risk Factor Models ──────────────────────────────────────

// Demurrage risk by port congestion level
const DEMURRAGE_RISK: Record<string, { probability: number; avgDays: number }> = {
  high: { probability: 0.35, avgDays: 3 },
  medium: { probability: 0.15, avgDays: 2 },
  low: { probability: 0.05, avgDays: 1 },
};

// CBP exam probability by country and product category
const CBP_EXAM_BASE_RATE = 0.03; // 3% baseline
const CBP_EXAM_COUNTRY_MULTIPLIER: Partial<Record<CountryCode, number>> = {
  CN: 2.5,
  VN: 1.5,
  TH: 1.2,
  ID: 1.3,
  KH: 1.8,
  BD: 1.6,
  PK: 2.0,
};
const CBP_EXAM_COST_RANGE = { vacis: 300, intensive: 1500, tailgate: 500 };

// Delay cost per day (storage, opportunity cost)
const DELAY_COST_PER_DAY_PER_CONTAINER = 250;

// ─── Main Prediction Function ────────────────────────────────

export async function predictCost(
  input: CostPredictionInput
): Promise<CostPredictionResult> {
  const startTime = Date.now();

  // Check cache
  const cacheKey = makeCacheKey("cost-predict", input as unknown as Record<string, unknown>);
  const cached = getCached<CostPredictionResult>(cacheKey);
  if (cached) return cached;

  // ── 1. Calculate base landed cost ──────────────────────────
  const landedCostInput: LandedCostInput = {
    productDescription: input.productDescription,
    htsCode: input.htsCode,
    countryOfOrigin: input.countryOfOrigin,
    unitCostFOB: input.unitCostFOB,
    totalUnits: input.totalUnits,
    containerType: input.containerType,
    originPort: input.originPort,
    destPort: input.destPort,
    shippingMode: input.shippingMode,
    freightCostTotal: input.freightCostTotal,
    customsBrokerFee: 350,
    insuranceRate: 0.5,
    drayageCost: 500,
    warehousingPerUnit: 0,
    fulfillmentPerUnit: 0,
    useFTZ: false,
  };

  const baseLandedCost = calculateLandedCost(landedCostInput);

  // ── 2. Calculate risk factors ──────────────────────────────
  const riskFactors: RiskFactor[] = [];
  const destPort = getPort(input.destPort);

  // Demurrage risk
  const congestion = destPort?.congestionLevel ?? "medium";
  const demurrageRisk = DEMURRAGE_RISK[congestion]!;
  const demurrageRate = destPort?.demurrageRate ?? 300;
  const demurrageCost = demurrageRate * demurrageRisk.avgDays;

  riskFactors.push({
    name: "Demurrage/Detention",
    probability: demurrageRisk.probability,
    costImpact: demurrageCost,
    expectedCost: Math.round(demurrageRisk.probability * demurrageCost),
    description: `${(demurrageRisk.probability * 100).toFixed(0)}% chance of ${demurrageRisk.avgDays}-day delay at ${destPort?.name ?? input.destPort} ($${demurrageRate}/day). Port congestion: ${congestion}.`,
  });

  // CBP exam risk
  const countryMultiplier =
    CBP_EXAM_COUNTRY_MULTIPLIER[input.countryOfOrigin] ?? 1.0;
  const examProbability = Math.min(0.3, CBP_EXAM_BASE_RATE * countryMultiplier);
  const avgExamCost =
    (CBP_EXAM_COST_RANGE.vacis * 0.6 +
      CBP_EXAM_COST_RANGE.tailgate * 0.3 +
      CBP_EXAM_COST_RANGE.intensive * 0.1);

  riskFactors.push({
    name: "CBP Examination",
    probability: examProbability,
    costImpact: Math.round(avgExamCost),
    expectedCost: Math.round(examProbability * avgExamCost),
    description: `${(examProbability * 100).toFixed(1)}% exam probability for ${input.countryOfOrigin} origin. Costs: VACIS scan $${CBP_EXAM_COST_RANGE.vacis}, tailgate $${CBP_EXAM_COST_RANGE.tailgate}, intensive $${CBP_EXAM_COST_RANGE.intensive}.`,
  });

  // Delay/congestion risk
  const avgDwellDays = destPort?.avgDwellDays ?? 3;
  const delayProbability = congestion === "high" ? 0.25 : congestion === "medium" ? 0.1 : 0.03;
  const delayCost = DELAY_COST_PER_DAY_PER_CONTAINER * 2; // avg 2-day delay

  riskFactors.push({
    name: "Port Delay (beyond avg dwell)",
    probability: delayProbability,
    costImpact: delayCost,
    expectedCost: Math.round(delayProbability * delayCost),
    description: `${(delayProbability * 100).toFixed(0)}% chance of additional 2-day delay. Average dwell at ${destPort?.name ?? input.destPort}: ${avgDwellDays} days.`,
  });

  // Section 301 bond risk (China only)
  if (input.countryOfOrigin === "CN") {
    const bondIncreaseCost = baseLandedCost.total.duty * 0.1; // 10% bond increase
    riskFactors.push({
      name: "Section 301 Bond Increase",
      probability: 0.15,
      costImpact: Math.round(bondIncreaseCost),
      expectedCost: Math.round(0.15 * bondIncreaseCost),
      description:
        "15% probability of customs bond increase due to Section 301 tariff adjustments. Affects working capital requirements.",
    });
  }

  // ── 3. Calculate confidence interval ───────────────────────
  const totalRiskCost = riskFactors.reduce((s, r) => s + r.expectedCost, 0);
  const maxRiskCost = riskFactors.reduce((s, r) => s + r.costImpact, 0);

  const baseTotalCost = baseLandedCost.total.grandTotal;
  const expectedTotal = baseTotalCost + totalRiskCost;
  const lowTotal = baseTotalCost; // best case: no risks materialize
  const highTotal = baseTotalCost + maxRiskCost * 0.7; // 90% CI: ~70% of max

  const expectedPerUnit = expectedTotal / input.totalUnits;
  const lowPerUnit = lowTotal / input.totalUnits;
  const highPerUnit = highTotal / input.totalUnits;

  // ── 4. AI Insights ─────────────────────────────────────────
  const aiInsights = await generateCostInsights(input, baseLandedCost, riskFactors);

  const result: CostPredictionResult = {
    baseLandedCost: {
      perUnit: baseLandedCost.perUnit.total,
      total: baseTotalCost,
    },
    riskFactors,
    totalRiskCost,
    predictedCost: {
      perUnit: {
        low: Math.round(lowPerUnit * 100) / 100,
        expected: Math.round(expectedPerUnit * 100) / 100,
        high: Math.round(highPerUnit * 100) / 100,
      },
      total: {
        low: Math.round(lowTotal),
        expected: Math.round(expectedTotal),
        high: Math.round(highTotal),
      },
      confidenceLevel: 90,
    },
    aiInsights,
    processingTimeMs: Date.now() - startTime,
  };

  setCache(cacheKey, result);
  return result;
}

// ─── AI Insights Generation ──────────────────────────────────

async function generateCostInsights(
  input: CostPredictionInput,
  baseCost: { total: { grandTotal: number; duty: number }; perUnit: { total: number } },
  risks: RiskFactor[]
): Promise<string> {
  try {
    const client = getAnthropicClient();

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 400,
      system:
        "You are a supply chain cost optimization expert. Provide 2-3 actionable insights about the cost prediction. Focus on the biggest cost drivers and practical ways to reduce landed cost. Be specific with numbers and percentages. Do NOT use markdown.",
      messages: [
        {
          role: "user",
          content: `Cost prediction for: ${input.productDescription}
Origin: ${input.countryOfOrigin}, ${input.originPort} → ${input.destPort}
Units: ${input.totalUnits} at $${input.unitCostFOB}/unit FOB
Base landed cost: $${baseCost.perUnit.total.toFixed(2)}/unit ($${baseCost.total.grandTotal.toFixed(0)} total)
Duty: $${baseCost.total.duty.toFixed(0)}
Freight: $${input.freightCostTotal}
Risk factors:
${risks.map((r) => `- ${r.name}: ${(r.probability * 100).toFixed(0)}% chance, $${r.costImpact} impact`).join("\n")}`,
        },
      ],
    });

    trackUsage(
      "system",
      "cost-predict",
      response.usage?.input_tokens ?? 0,
      response.usage?.output_tokens ?? 0
    );

    const textBlock = response.content.find((b) => b.type === "text");
    return textBlock && textBlock.type === "text"
      ? textBlock.text
      : "Cost prediction based on algorithmic risk modeling.";
  } catch {
    return `Base landed cost is $${baseCost.perUnit.total.toFixed(2)}/unit. The largest risk factor is ${risks.sort((a, b) => b.expectedCost - a.expectedCost)[0]?.name ?? "unknown"} which adds an expected $${risks.sort((a, b) => b.expectedCost - a.expectedCost)[0]?.expectedCost ?? 0} to total cost.`;
  }
}

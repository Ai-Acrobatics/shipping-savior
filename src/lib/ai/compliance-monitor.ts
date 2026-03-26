// ============================================================
// AI-Powered Compliance Monitor
// Sprint 4: AI Agent Layer
//
// Monitors shipments for regulatory compliance issues:
// - ISF filing deadlines ($5K penalty per late filing)
// - Section 301 tariff exposure
// - AD/CVD (anti-dumping/countervailing duty) orders
// - UFLPA (Uyghur Forced Labor Prevention Act) risk
// - FDA import alerts for food/pharma
// ============================================================

import { getAnthropicClient, trackUsage } from "./client";
import { getEffectiveDutyRate, SECTION_301_RATES } from "@/lib/data/hts-tariffs";
import type { CountryCode } from "@/lib/types";

// ─── Types ───────────────────────────────────────────────────

export interface ComplianceCheck {
  shipmentId?: string;
  htsCode: string;
  countryOfOrigin: CountryCode;
  productDescription: string;
  vesselDepartureDate?: string;
}

export interface ComplianceAlert {
  type:
    | "isf_deadline"
    | "tariff_change"
    | "ad_cvd"
    | "fda_alert"
    | "uflpa_risk";
  severity: "critical" | "warning" | "info";
  message: string;
  actionRequired: string;
  deadline?: string;
}

export interface ComplianceResult {
  alerts: ComplianceAlert[];
  riskScore: number; // 0-100
  assessedAt: string;
  processingTimeMs: number;
}

// ─── Known AD/CVD Orders (representative sample) ─────────────
// Real AD/CVD orders are maintained by ITA at trade.gov/enforcement

const ADCVD_ORDERS: Array<{
  htsPrefix: string;
  country: CountryCode;
  type: "AD" | "CVD" | "both";
  product: string;
  rate: string;
}> = [
  { htsPrefix: "9401", country: "CN", type: "both", product: "Wooden bedroom furniture", rate: "43.23-216.01%" },
  { htsPrefix: "9403", country: "CN", type: "both", product: "Wooden cabinets and vanities", rate: "4.37-252.09%" },
  { htsPrefix: "7306", country: "CN", type: "both", product: "Circular welded carbon steel pipes", rate: "69.20-85.55%" },
  { htsPrefix: "8414", country: "CN", type: "AD", product: "Small vertical shaft engines", rate: "206.72%" },
  { htsPrefix: "6109", country: "VN", type: "AD", product: "Certain polyester staple fiber", rate: "0-55.27%" },
  { htsPrefix: "6404", country: "CN", type: "both", product: "Certain rubber footwear", rate: "0-63.98%" },
  { htsPrefix: "8544", country: "CN", type: "AD", product: "Aluminum wire and cable", rate: "63.47%" },
];

// ─── FDA Import Alert Categories ──────────────────────────────

const FDA_ALERT_HTS_PREFIXES = [
  "03", "04", "07", "08", "09", "15", "16", "17", "18", "19", "20", "21", "22",
  // Pharma / medical
  "30", "9018", "9019", "9021", "9022",
];

// ─── UFLPA High-Risk Product Categories ──────────────────────

const UFLPA_HIGH_RISK_CATEGORIES = [
  { keyword: "cotton", risk: "Xinjiang cotton sourcing" },
  { keyword: "polysilicon", risk: "Solar panel supply chain" },
  { keyword: "tomato", risk: "Xinjiang tomato processing" },
  { keyword: "pvc", risk: "PVC/vinyl production" },
  { keyword: "apparel", risk: "Garment manufacturing forced labor" },
  { keyword: "textile", risk: "Textile raw material sourcing" },
  { keyword: "solar", risk: "Polysilicon/solar cell supply chain" },
  { keyword: "hair", risk: "Hair products from Xinjiang" },
];

// ─── Core Compliance Check ───────────────────────────────────

export async function checkCompliance(
  input: ComplianceCheck
): Promise<ComplianceResult> {
  const startTime = Date.now();
  const alerts: ComplianceAlert[] = [];
  let riskScore = 0;

  // ── 1. ISF Filing Deadline ─────────────────────────────────
  if (input.vesselDepartureDate) {
    const departure = new Date(input.vesselDepartureDate);
    const now = new Date();
    const hoursUntilDeparture =
      (departure.getTime() - now.getTime()) / (1000 * 60 * 60);
    const isfDeadline = new Date(departure.getTime() - 24 * 60 * 60 * 1000);

    if (hoursUntilDeparture <= 0) {
      // Vessel already departed
      alerts.push({
        type: "isf_deadline",
        severity: "critical",
        message:
          "Vessel has already departed. ISF filing must be confirmed as submitted.",
        actionRequired:
          "Verify ISF was filed before departure. If not, file immediately and prepare for potential $5,000 penalty.",
        deadline: isfDeadline.toISOString(),
      });
      riskScore += 30;
    } else if (hoursUntilDeparture <= 24) {
      alerts.push({
        type: "isf_deadline",
        severity: "critical",
        message: `ISF filing deadline is in ${Math.round(hoursUntilDeparture)} hours. The ISF (10+2) must be filed at least 24 hours before vessel departure.`,
        actionRequired:
          "File ISF immediately via your customs broker. Late filing penalty is $5,000 per occurrence. Required data: manufacturer, seller, buyer, ship-to, container stuffing location, consolidator, HTS-6, country of origin.",
        deadline: isfDeadline.toISOString(),
      });
      riskScore += 25;
    } else if (hoursUntilDeparture <= 48) {
      alerts.push({
        type: "isf_deadline",
        severity: "warning",
        message: `ISF filing deadline approaching: ${Math.round(hoursUntilDeparture - 24)} hours until the 24-hour cutoff.`,
        actionRequired:
          "Ensure ISF filing is prepared and ready to submit. Confirm all 10+2 data elements with your customs broker.",
        deadline: isfDeadline.toISOString(),
      });
      riskScore += 10;
    }
  }

  // ── 2. Section 301 Tariff Check ────────────────────────────
  if (input.countryOfOrigin === "CN") {
    const chapter = input.htsCode.substring(0, 2);
    const section301Rate = SECTION_301_RATES[chapter];
    if (section301Rate && section301Rate > 0) {
      const severity = section301Rate >= 25 ? "warning" : "info";
      alerts.push({
        type: "tariff_change",
        severity,
        message: `Section 301 tariff of ${section301Rate}% applies to this product from China (HTS Chapter ${chapter}). This is in addition to the MFN duty rate.`,
        actionRequired:
          section301Rate >= 25
            ? "Consider sourcing alternatives from Vietnam, Thailand, or Indonesia to avoid Section 301 tariffs. Review exclusion requests at ustr.gov."
            : "Factor additional tariff into landed cost calculations. Monitor USTR for rate changes.",
      });
      riskScore += section301Rate >= 25 ? 15 : 5;
    }
  }

  // ── 3. AD/CVD Order Check ──────────────────────────────────
  const hts4 = input.htsCode.substring(0, 4);
  const matchingOrders = ADCVD_ORDERS.filter(
    (order) =>
      input.htsCode.startsWith(order.htsPrefix) &&
      order.country === input.countryOfOrigin
  );

  for (const order of matchingOrders) {
    alerts.push({
      type: "ad_cvd",
      severity: "critical",
      message: `Active ${order.type === "both" ? "AD/CVD" : order.type} order on "${order.product}" from ${order.country}. Duty rates: ${order.rate}.`,
      actionRequired:
        "Verify if your specific product falls within the scope of this order. Contact your customs broker for a scope ruling. AD/CVD duties are assessed IN ADDITION to regular duties and Section 301.",
    });
    riskScore += 20;
  }

  // ── 4. FDA Import Alert Check ──────────────────────────────
  const isFDARegulated = FDA_ALERT_HTS_PREFIXES.some((prefix) =>
    input.htsCode.startsWith(prefix)
  );
  if (isFDARegulated) {
    alerts.push({
      type: "fda_alert",
      severity: "warning",
      message:
        "This product may be subject to FDA regulation. Import alerts and detention without physical examination (DWPE) may apply.",
      actionRequired:
        "Check FDA Import Alert database at fda.gov/industry/actions-enforcement/import-alerts. Ensure Prior Notice is filed (food) or product registration is current (medical devices). Cold chain products require temperature monitoring documentation.",
    });
    riskScore += 10;
  }

  // ── 5. UFLPA Risk Assessment (AI-powered) ─────────────────
  const uflpaRisk = await assessUFLPARisk(input);
  if (uflpaRisk) {
    alerts.push(uflpaRisk.alert);
    riskScore += uflpaRisk.riskContribution;
  }

  // ── Normalize risk score ───────────────────────────────────
  riskScore = Math.min(100, riskScore);

  return {
    alerts,
    riskScore,
    assessedAt: new Date().toISOString(),
    processingTimeMs: Date.now() - startTime,
  };
}

// ─── UFLPA Risk Assessment (uses Claude) ─────────────────────

async function assessUFLPARisk(
  input: ComplianceCheck
): Promise<{ alert: ComplianceAlert; riskContribution: number } | null> {
  // Quick screen: only China origin needs UFLPA assessment
  if (input.countryOfOrigin !== "CN") return null;

  // Keyword-based pre-screen
  const desc = input.productDescription.toLowerCase();
  const matchingRisks = UFLPA_HIGH_RISK_CATEGORIES.filter((cat) =>
    desc.includes(cat.keyword)
  );

  if (matchingRisks.length === 0) {
    // No keyword match — low risk, skip AI call
    return null;
  }

  // Use Claude for deeper UFLPA assessment
  try {
    const client = getAnthropicClient();

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 500,
      system: `You are a UFLPA (Uyghur Forced Labor Prevention Act) compliance specialist. Assess the forced labor risk for the given product imported from China. Consider:
1. Is the product or its raw materials commonly sourced from Xinjiang?
2. Are there known entities on the UFLPA Entity List in this supply chain?
3. What documentation would CBP require for a rebuttable presumption?

Return EXACTLY a JSON object (no markdown):
{
  "riskLevel": "high" | "medium" | "low",
  "reasoning": "Brief explanation",
  "requiredDocumentation": ["list", "of", "required", "docs"]
}`,
      messages: [
        {
          role: "user",
          content: `Product: ${input.productDescription}\nHTS Code: ${input.htsCode}\nRisk flags: ${matchingRisks.map((r) => r.risk).join(", ")}`,
        },
      ],
    });

    trackUsage(
      "system",
      "uflpa-check",
      response.usage?.input_tokens ?? 0,
      response.usage?.output_tokens ?? 0
    );

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") return null;

    let assessment: {
      riskLevel: "high" | "medium" | "low";
      reasoning: string;
      requiredDocumentation: string[];
    };

    try {
      assessment = JSON.parse(textBlock.text);
    } catch {
      const jsonMatch = textBlock.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) return null;
      assessment = JSON.parse(jsonMatch[0]);
    }

    const severityMap = {
      high: "critical" as const,
      medium: "warning" as const,
      low: "info" as const,
    };

    const riskContributionMap = { high: 25, medium: 15, low: 5 };

    return {
      alert: {
        type: "uflpa_risk",
        severity: severityMap[assessment.riskLevel],
        message: `UFLPA Risk (${assessment.riskLevel}): ${assessment.reasoning}`,
        actionRequired: `Required documentation to overcome rebuttable presumption: ${assessment.requiredDocumentation.join("; ")}. Consult with a customs attorney specializing in forced labor compliance.`,
      },
      riskContribution: riskContributionMap[assessment.riskLevel],
    };
  } catch (error) {
    // If AI assessment fails, fall back to keyword-based alert
    return {
      alert: {
        type: "uflpa_risk",
        severity: "warning",
        message: `Potential UFLPA risk: Product description matches forced labor risk categories (${matchingRisks.map((r) => r.risk).join(", ")}). Automated assessment unavailable.`,
        actionRequired:
          "Manually verify supply chain documentation. Ensure you can demonstrate that goods are not produced with forced labor. Maintain supply chain mapping, audit reports, and worker payment records.",
      },
      riskContribution: 15,
    };
  }
}

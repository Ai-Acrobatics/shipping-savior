// ============================================================
// AI-Powered HTS Code Classification
// Sprint 4: AI Agent Layer
//
// Uses Claude to classify products into HTS codes with
// confidence scores and reasoning based on the General Rules
// of Interpretation (GRI).
// ============================================================

import { getAnthropicClient, getCached, setCache, makeCacheKey, trackUsage } from "./client";
import { HTS_CODES, getEffectiveDutyRate } from "@/lib/data/hts-tariffs";
import type { CountryCode } from "@/lib/types";

// ─── Types ───────────────────────────────────────────────────

export interface ClassificationInput {
  productDescription: string;
  material?: string;
  endUse?: string;
  countryOfOrigin: CountryCode;
}

export interface ClassificationPrediction {
  htsCode: string;
  description: string;
  confidence: number; // 0-1
  dutyRate: number;
  reasoning: string;
}

export interface ClassificationResult {
  predictions: ClassificationPrediction[];
  disclaimers: string[];
  processingTimeMs: number;
}

// ─── System Prompt ───────────────────────────────────────────

const CLASSIFICATION_SYSTEM_PROMPT = `You are an expert US Customs HTS (Harmonized Tariff Schedule) classifier. You classify imported products into the correct 10-digit HTS code following the General Rules of Interpretation (GRI).

## Classification Methodology

Follow the GRI in strict order:
1. **GRI 1**: Classification is determined by the terms of the headings and relevant Section/Chapter notes.
2. **GRI 2(a)**: Incomplete or unfinished articles classifiable as the complete article.
3. **GRI 2(b)**: Mixtures and composites classified by essential character.
4. **GRI 3**: When goods are prima facie classifiable under two+ headings, apply 3(a) most specific, 3(b) essential character, 3(c) last in numerical order.
5. **GRI 4**: Most akin to goods classified elsewhere.
6. **GRI 5**: Containers/packing classified with the goods unless clearly reusable.
7. **GRI 6**: Classification at subheading level follows the same rules.

## Common Pitfalls
- Composite articles: Classify by essential character (GRI 2b/3b)
- "Parts and accessories" vs complete articles
- "Sets put up for retail sale" have special rules (GRI 3b)
- "Other" catch-all codes are often wrong — try more specific codes first
- Chapter 61 (knit) vs Chapter 62 (woven) apparel distinction
- Chapter 85 electronics vs Chapter 84 machinery

## Available HTS Codes in Our Database
${HTS_CODES.map((h) => `${h.htsCode}: ${h.description}`).join("\n")}

## Response Format
Return EXACTLY a JSON object (no markdown, no code fences) with this structure:
{
  "predictions": [
    {
      "htsCode": "XXXX.XX.XX",
      "description": "Official HTS description",
      "confidence": 0.85,
      "reasoning": "GRI 1: The product is described by heading XXXX which covers..."
    },
    // ... (return top 3 predictions)
  ]
}

Rules:
- Always return exactly 3 predictions ranked by confidence (highest first)
- Confidence must sum to <= 1.0 across all predictions
- Each reasoning must cite the specific GRI rule applied
- Use codes from the provided database when possible
- If no exact match, use the closest available code and note the limitation`;

// ─── Few-Shot Examples ───────────────────────────────────────

const FEW_SHOT_EXAMPLES = [
  {
    role: "user" as const,
    content: `Classify this product:
Product: Cotton crew neck t-shirt
Material: 100% cotton, knitted jersey fabric
End use: Men's casual wear
Country of origin: Vietnam`,
  },
  {
    role: "assistant" as const,
    content: JSON.stringify({
      predictions: [
        {
          htsCode: "6109.10.00",
          description:
            "T-shirts, singlets and other vests, of cotton, knitted or crocheted",
          confidence: 0.92,
          reasoning:
            "GRI 1: The product is specifically described by heading 6109 which covers 'T-shirts, singlets and other vests, knitted or crocheted.' Subheading 6109.10 covers those of cotton. The knitted jersey fabric confirms Chapter 61 (knit) classification.",
        },
        {
          htsCode: "6110.20.20",
          description: "Jerseys, pullovers, sweatshirts of cotton, knitted",
          confidence: 0.05,
          reasoning:
            "GRI 3(a): While heading 6110 covers 'jerseys, pullovers, cardigans, waistcoats,' a t-shirt is more specifically classified under 6109. Only applicable if the garment has a collar or is pullover-style.",
        },
        {
          htsCode: "6203.42.40",
          description: "Men's or boys' trousers, of cotton",
          confidence: 0.03,
          reasoning:
            "GRI 1: Not applicable — this heading covers trousers, not upper-body garments. Included as a low-confidence alternative only to illustrate the cotton/woven apparel chapter.",
        },
      ],
    }),
  },
  {
    role: "user" as const,
    content: `Classify this product:
Product: Portable laptop computer
Material: Aluminum and plastic chassis, lithium-ion battery
End use: Business/personal computing
Country of origin: China`,
  },
  {
    role: "assistant" as const,
    content: JSON.stringify({
      predictions: [
        {
          htsCode: "8471.30.01",
          description:
            "Portable automatic data processing machines, weighing not more than 10 kg",
          confidence: 0.95,
          reasoning:
            "GRI 1: Heading 8471 covers 'Automatic data processing machines and units thereof.' Subheading 8471.30 specifically covers portable ADPs (laptops) weighing not more than 10 kg. This is the definitive classification for laptops.",
        },
        {
          htsCode: "8517.12.00",
          description: "Telephones — smartphones",
          confidence: 0.03,
          reasoning:
            "GRI 1: Not applicable — heading 8517 covers telephone sets. A laptop's primary function is data processing, not telephony. Only relevant if the device were primarily a communication device.",
        },
        {
          htsCode: "8528.72.64",
          description: "Color television receivers (monitors)",
          confidence: 0.02,
          reasoning:
            "GRI 3(b): Not applicable — while a laptop has a display, its essential character is as a data processing machine (heading 8471), not a monitor/TV receiver (heading 8528).",
        },
      ],
    }),
  },
];

// ─── Classification Function ─────────────────────────────────

export async function classifyProduct(
  input: ClassificationInput
): Promise<ClassificationResult> {
  const startTime = Date.now();

  // Check cache first
  const cacheKey = makeCacheKey("classify", input as unknown as Record<string, unknown>);
  const cached = getCached<ClassificationResult>(cacheKey);
  if (cached) return cached;

  const client = getAnthropicClient();

  const userMessage = `Classify this product:
Product: ${input.productDescription}${input.material ? `\nMaterial: ${input.material}` : ""}${input.endUse ? `\nEnd use: ${input.endUse}` : ""}
Country of origin: ${input.countryOfOrigin}`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1500,
    system: CLASSIFICATION_SYSTEM_PROMPT,
    messages: [...FEW_SHOT_EXAMPLES, { role: "user", content: userMessage }],
  });

  // Track usage
  trackUsage(
    "system",
    "classify",
    response.usage?.input_tokens ?? 0,
    response.usage?.output_tokens ?? 0
  );

  // Parse response
  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from Claude");
  }

  let parsed: { predictions: Array<{ htsCode: string; description: string; confidence: number; reasoning: string }> };
  try {
    parsed = JSON.parse(textBlock.text);
  } catch {
    // Try to extract JSON from markdown code fences
    const jsonMatch = textBlock.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to parse classification response");
    }
    parsed = JSON.parse(jsonMatch[0]);
  }

  // Enrich with duty rates
  const predictions: ClassificationPrediction[] = parsed.predictions.map((p) => {
    const rates = getEffectiveDutyRate(p.htsCode, input.countryOfOrigin);
    return {
      htsCode: p.htsCode,
      description: p.description,
      confidence: p.confidence,
      dutyRate: rates.effective,
      reasoning: p.reasoning,
    };
  });

  const result: ClassificationResult = {
    predictions,
    disclaimers: [
      "For informational purposes only. Official classification requires a licensed customs broker.",
      "AI predictions are based on product description — actual classification depends on physical inspection and lab analysis.",
      "Section 301 and AD/CVD rates may apply in addition to the MFN duty rate shown.",
      "Always verify with the USITC HTS database at hts.usitc.gov before filing.",
    ],
    processingTimeMs: Date.now() - startTime,
  };

  // Cache for 30 minutes
  setCache(cacheKey, result);

  return result;
}

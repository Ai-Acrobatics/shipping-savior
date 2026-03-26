# AI Agent Development Plans — Shipping Savior

**Linear:** AI-5459, AI-5435
**Phase:** Phase 3 — Platform Implementation
**Status:** Planning Complete — Ready for Sprint 5 Implementation
**Last Updated:** 2026-03-26
**Depends On:** [TECHNICAL-ARCHITECTURE.md](./TECHNICAL-ARCHITECTURE.md), [prds/AI-AGENT-PLANS.md](./prds/AI-AGENT-PLANS.md)

---

## Overview

This document is the developer-facing implementation guide for the five AI agents included in Phase 3 Sprint 5. It translates the strategic agent plans (AI-5411 in `prds/AI-AGENT-PLANS.md`) into actionable implementation specs covering prompt design, tool definitions, API contracts, and integration wiring.

### Agent Roster

| # | Agent | Sprint Priority | Model | Trigger |
|---|-------|----------------|-------|---------|
| 1 | HTS Classification Agent | P0 — Sprint 5, Week 1 | Claude 3.5 Sonnet + pgvector | User submits product description |
| 2 | Rate Shopping Agent | P0 — Sprint 5, Week 2 | Claude 3.5 Sonnet | User requests route recommendations |
| 3 | Duty Calculation Agent | P1 — Sprint 5, Week 2 | Claude 3 Haiku | Attached to landed cost calculator |
| 4 | Document Processing Agent | P1 — Sprint 5, Week 3 | Claude 3.5 Sonnet (Vision) | File upload event |
| 5 | Compliance Agent | P2 — Sprint 5, Week 4 | Claude 3.5 Sonnet | Shipment creation or HTS confirmation |

### Architecture Decision: Direct Anthropic API (No Framework)

Per the Phase 2 planning decision log (Decision 4), all five agents use direct Anthropic API calls — no LangChain, LangGraph, or hosted agent platform. Rationale:

- These agents are **query-response** or **async cron** tasks, not multi-step autonomous loops. A framework adds complexity without value at this scope.
- The platform already has Vercel serverless functions as the execution environment — no additional worker infrastructure is needed for MVP.
- Cost and latency are predictable. Full control over prompt construction and streaming behavior.

When the platform reaches Phase 4, the Anomaly and Forecast agents (which require multi-step reasoning and tool use loops) can be extracted to Railway workers and may benefit from a framework at that point.

---

## Infrastructure Shared Across All Agents

### Environment Variables

```bash
ANTHROPIC_API_KEY=           # Required for all agents
OPENAI_API_KEY=              # Required for embedding generation (Agent 1)
DATABASE_URL=                # Neon PostgreSQL — all agents read/write audit_logs
AGENT_RATE_LIMIT_ENABLED=true
AGENT_SPEND_ALERT_THRESHOLD=100  # Monthly $ threshold — triggers email alert
```

### Shared Types (`lib/agents/types.ts`)

```typescript
export interface AgentRequest {
  orgId: string;
  userId: string;
  sessionId: string;
  requestId: string;         // UUID, for audit log correlation
}

export interface AgentResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  tokensUsed: number;        // Logged for cost tracking
  latencyMs: number;
  agentVersion: string;      // Semantic version — "1.0.0"
}

export type AgentConfidence = "high" | "medium" | "low";
```

### Audit Logging (`lib/agents/audit.ts`)

Every agent call is logged to the `agent_calls` table before the LLM request fires and updated on completion. This is non-negotiable for compliance and cost monitoring.

```typescript
// Called before every agent invocation
export async function logAgentCall(params: {
  agentName: string;
  requestId: string;
  orgId: string;
  userId: string;
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
  success: boolean;
  error?: string;
}): Promise<void>
```

### Database Schema (`lib/db/schema.ts` additions)

```sql
CREATE TABLE agent_calls (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_name    TEXT NOT NULL,         -- "hts-classification", "rate-shopping", etc.
  request_id    UUID NOT NULL,
  org_id        UUID REFERENCES organizations(id),
  user_id       UUID REFERENCES users(id),
  input_tokens  INT NOT NULL,
  output_tokens INT NOT NULL,
  latency_ms    INT NOT NULL,
  success       BOOLEAN NOT NULL,
  error         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_agent_calls_org_created ON agent_calls(org_id, created_at DESC);
CREATE INDEX idx_agent_calls_agent_created ON agent_calls(agent_name, created_at DESC);
```

### Rate Limiting

All agent API routes use Vercel KV for per-org rate limiting. Apply via the `withRateLimit` middleware wrapper in `lib/agents/rate-limit.ts`:

| Agent | Rate Limit |
|-------|-----------|
| HTS Classification | 20 req/min per org |
| Rate Shopping | 10 req/min per org |
| Duty Calculation | 30 req/min per org |
| Document Processing | 5 req/min per org (file uploads) |
| Compliance | 15 req/min per org |

---

## Agent 1: HTS Classification Agent

### Purpose

Suggest the correct 10-digit Harmonized Tariff Schedule (HTS) code for a product given a free-form description. This is the platform's foundational intelligence feature — duty rates, FTZ strategy, and compliance checks all depend on an accurate HTS code. Manual lookup takes 15–45 minutes per shipment and carries penalty risk from CBP misclassification.

### Route

`POST /api/agents/hts-classify`

### Input / Output

```typescript
// Request body
interface HTSClassifyRequest extends AgentRequest {
  productDescription: string;     // Required. 10–5000 chars.
  countryOfOrigin: string;         // ISO 3166-1 alpha-2 (e.g., "VN", "TH")
  materials?: string[];            // Optional. ["cotton", "polyester"]
  intendedUse?: string;            // Optional. "retail sale" | "industrial"
  imageUrl?: string;               // Optional. Product photo for multimodal fallback
}

// Response
interface HTSClassifyResult {
  primaryCode: {
    htsCode: string;               // 10-digit, e.g. "6402.99.4000"
    description: string;           // Official HTS schedule description
    dutyRate: string;              // e.g. "12.5%" or "Free"
    specialRates: SpecialRate[];   // GSP, CAFTA-DR, USMCA, etc.
    confidence: number;            // 0–1
    confidenceLabel: AgentConfidence;
  };
  alternativeCodes: Array<{
    htsCode: string;
    description: string;
    dutyRate: string;
    confidence: number;
    rationale: string;
  }>;
  classificationRationale: string; // Plain-English explanation
  warnings: string[];              // e.g. "Section 301 surcharge applies"
  reviewRequired: boolean;         // True if confidence < 0.75
  dataAsOf: string;                // ISO date of HTS data version used
}
```

### Prompt Design

The agent uses a two-stage approach:

**Stage 1 — Retrieval (pgvector)**

Before calling Claude, retrieve the top 20 candidate HTS headings from the `hts_codes` table using pgvector cosine similarity on the product description embedding:

```sql
SELECT hts_code, description, duty_rate, chapter_notes
FROM hts_codes
ORDER BY embedding <=> $1
LIMIT 20;
```

**Stage 2 — Claude Reranking + Structured Output**

```typescript
const systemPrompt = `You are a certified U.S. Customs Broker specializing in HTS tariff classification under the Harmonized Tariff Schedule of the United States (HTSUS). Your job is to analyze a product description and select the most accurate 10-digit HTS code from the candidate list provided.

Classification Rules:
1. Always apply the General Rules of Interpretation (GRIs) in order. GRI 1 (specific description) overrides GRI 3 (most specific).
2. For composite articles, classify by the component that gives essential character.
3. When uncertain between chapter headings, favor the more specific description.
4. Country of origin affects duty rates but NEVER affects classification.
5. Section 301 tariffs (China surcharges) are additional duties — they do not change the base HTS code.

Output Requirements:
- Return a JSON object matching the HTSClassifyResult schema exactly.
- Set reviewRequired: true whenever confidence < 0.75 or when two codes are plausible.
- Include a classificationRationale of 2–4 sentences explaining why the primary code was chosen over alternatives.
- Warnings must include: Section 301 applicability, antidumping/countervailing duty orders, FDA prior notice requirements, CPSC requirements for children's products.

IMPORTANT: This is a classification suggestion only. The final determination rests with the importer or a licensed customs broker. Never present a suggestion as a binding ruling.`;

const userMessage = `Classify this product:

Description: ${productDescription}
Country of Origin: ${countryOfOrigin}
${materials?.length ? `Materials: ${materials.join(", ")}` : ""}
${intendedUse ? `Intended Use: ${intendedUse}` : ""}

Candidate HTS Codes (from tariff schedule search):
${candidates.map((c, i) => `${i + 1}. ${c.htsCode} — ${c.description} — Duty: ${c.dutyRate}`).join("\n")}

Respond with a JSON object matching the HTSClassifyResult schema.`;
```

**Response Parsing**

Use Zod to parse and validate the Claude response:

```typescript
import { z } from "zod";

const HTSClassifyResultSchema = z.object({
  primaryCode: z.object({
    htsCode: z.string().regex(/^\d{4}\.\d{2}\.\d{4}$/),
    description: z.string(),
    dutyRate: z.string(),
    specialRates: z.array(z.object({ program: z.string(), rate: z.string() })),
    confidence: z.number().min(0).max(1),
    confidenceLabel: z.enum(["high", "medium", "low"]),
  }),
  alternativeCodes: z.array(/* ... */),
  classificationRationale: z.string().min(50),
  warnings: z.array(z.string()),
  reviewRequired: z.boolean(),
  dataAsOf: z.string(),
});
```

### Implementation

```
lib/agents/hts-classification/
  index.ts          # Agent orchestrator — retrieval + LLM call + parse
  embeddings.ts     # Product description → OpenAI embedding
  retrieval.ts      # pgvector similarity search against hts_codes table
  prompt.ts         # System + user prompt builders
  schema.ts         # Zod validation schemas
  types.ts          # Agent-specific TypeScript types

app/api/agents/hts-classify/
  route.ts          # POST handler — auth check, rate limit, call agent, audit log
```

### Integration Points

- **HTS Lookup page** (`/tools/hts-lookup`): Primary UI entry point. User submits description, sees top 3 results with confidence badges. "Use this code" button confirms selection and routes to landed cost calculator.
- **Landed Cost Calculator**: Accepted HTS code auto-populates the duty rate field.
- **FTZ Savings Analyzer**: HTS code feeds the FTZ duty locking calculation.
- **Compliance Agent (Agent 5)**: Confirmed HTS code triggers a compliance check automatically.
- **Shipment creation**: HTS classification runs when a new shipment is created with an unclassified product.

### Data Requirements

The `hts_codes` table must be populated and embedding-indexed before this agent goes live. Run the data pipeline scripts from `DATA-PIPELINE.md`:

```bash
npx tsx scripts/sync-hts.ts          # Downloads USITC HTS XML → PostgreSQL
npx tsx scripts/embed-hts.ts         # Generates pgvector embeddings for all HTS entries
```

Expected record count: 100,000+ HTS code entries with embeddings.

---

## Agent 2: Rate Shopping Agent

### Purpose

Query available shipping routes and surface the optimal carrier/route combination for a given shipment, explaining the cost-vs-speed-vs-reliability tradeoffs in plain language. Replicates and automates the freight broker's manual process of researching 3–5 options and presenting them to customers.

### Route

`POST /api/agents/rate-shop`

### Input / Output

```typescript
interface RateShopRequest extends AgentRequest {
  originPort: string;              // UN/LOCODE (e.g., "VNSGN" — Ho Chi Minh City)
  destinationPort: string;         // UN/LOCODE (e.g., "USLAX" — Los Angeles)
  commodityType: "cold-chain" | "general-cargo" | "hazmat" | "oversized";
  containerType: "20GP" | "40GP" | "40HC" | "20RF" | "40RF";  // RF = refrigerated
  estimatedWeightKg: number;
  estimatedCBM: number;            // Cubic meters
  targetDeliveryDate?: string;     // ISO date — informs urgency
  prioritize: "cost" | "speed" | "reliability" | "balanced";
  excludeCarriers?: string[];      // Carrier SCAC codes to exclude
}

interface RateShopResult {
  topRecommendation: RouteOption;
  alternatives: RouteOption[];     // Up to 4 alternatives
  narrative: string;               // 200–400 word plain-English summary
  marketContext: string;           // Spot rate context and trend
  backhaulOpportunity: boolean;    // True if backhaul discount likely available
  backhaulExplanation?: string;    // Why backhaul applies on this lane
  dataAsOf: string;
}

interface RouteOption {
  carrier: string;                 // e.g., "Maersk", "MSC", "CMA CGM"
  service: string;                 // e.g., "AE-1/Shogun"
  routeType: "direct" | "transshipment";
  transshipmentPort?: string;      // e.g., "Singapore (SGSIN)"
  estimatedTransitDays: number;
  estimatedRate: {
    low: number;                   // USD per container
    high: number;
    currency: "USD";
  };
  departureDates: string[];        // Next 3 available sailings
  reliabilityScore: number;        // 0–100 (on-time performance)
  pros: string[];
  cons: string[];
  recommendationRank: number;      // 1 = top pick
}
```

### Data Sources

The agent grounds its recommendations in real data:

| Source | Loaded From | Notes |
|--------|------------|-------|
| Carrier schedules | `data/vessel-schedules.json` | Weekly-refreshed static data (Phase 3); live APIs in Phase 4 |
| Port pairs + lane data | `data/lanes.json` | Historical transit times and reliability by lane |
| FTZ backhaul signals | `data/backhaul-availability.json` | Lanes with regular backhaul opportunities |
| Carrier reliability | `data/carrier-performance.json` | On-time performance by carrier and lane |

### Prompt Design

```typescript
const systemPrompt = `You are a senior international freight broker specializing in cold chain and consumer goods imports. You have 15 years of experience on Asia-Pacific to US West Coast lanes and deep expertise in transshipment routing through Singapore, Port Klang, and Colombo.

Your job is to analyze the available route options for a shipment and produce:
1. A ranked list of up to 5 route options with clear pros/cons
2. A plain-English narrative recommendation (200–400 words) that a non-expert can understand
3. A note on market context (spot rate trends, capacity conditions)
4. A backhaul opportunity assessment

Analysis Framework:
- Cost: All-in ocean freight rate per container. Exclude THC and origin charges (quote separately).
- Speed: Port-to-port transit days, not door-to-door.
- Reliability: On-time performance data from lane history. Flag carriers with < 70% OTP.
- Risk: Transshipment adds 3–7 days + missed connection risk. Flag if transshipment port has congestion.
- Cold chain: RF (refrigerated) containers have limited availability. Flag if cold chain capacity is tight.
- Backhaul: Carriers returning empty from US ports often discount Asia-bound rates 20–35%. Identify if this lane qualifies.

Constraints:
- Never quote a specific rate as a firm offer. Frame all rates as "estimated market range."
- If data is insufficient to make a confident recommendation, say so explicitly.
- The narrative must be written for a freight broker presenting to a customer — not a logistics expert.`;

const userMessage = `Find the best shipping options for:

Origin: ${originPort} (${getPortName(originPort)})
Destination: ${destinationPort} (${getPortName(destinationPort)})
Commodity: ${commodityType}
Container: ${containerType}
Weight: ${estimatedWeightKg} kg | Volume: ${estimatedCBM} CBM
Target Delivery: ${targetDeliveryDate || "Flexible"}
Priority: ${prioritize}

Available routes from data:
${JSON.stringify(availableRoutes, null, 2)}

Carrier performance on this lane:
${JSON.stringify(carrierPerformance, null, 2)}

Respond with a RateShopResult JSON object. Use streaming output for the narrative field.`;
```

### Streaming

The Rate Shopping Agent uses streaming for the `narrative` field because it is long-form prose. The API route streams the narrative while the structured `topRecommendation` and `alternatives` data are returned synchronously once the full response is parsed.

```typescript
// app/api/agents/rate-shop/route.ts
import Anthropic from "@anthropic-ai/sdk";

export async function POST(req: Request) {
  // ... auth, rate limit, validate input ...

  const stream = await anthropic.messages.stream({
    model: "claude-sonnet-4-6",
    max_tokens: 2000,
    system: systemPrompt,
    messages: [{ role: "user", content: userMessage }],
  });

  return new Response(stream.toReadableStream(), {
    headers: { "Content-Type": "text/event-stream" },
  });
}
```

### Integration Points

- **Route Comparison Tool** (`/tools/routes`): "Get AI Recommendation" button triggers the agent. Results overlay the manual route comparison grid.
- **Shipment Creation Wizard**: Optional step to get a rate estimate during shipment setup.
- **Executive Dashboard**: "Best Lane" widget surfaces the agent's last recommendation per active trade lane.

---

## Agent 3: Duty Calculation Agent

### Purpose

Compute the fully loaded landed cost for a shipment including all duty and fee components: base tariff, Section 301 surcharges, antidumping/countervailing duties (ADD/CVD), Merchandise Processing Fee (MPF), and Harbor Maintenance Tax (HMT). Surface the FTZ entry strategy that minimizes net duty outlay.

This agent wraps the platform's existing `lib/calculators/duty-calculator.ts` deterministic math with an LLM layer that explains the results in plain language and surfaces non-obvious optimization opportunities.

### Route

`POST /api/agents/duty-calculate`

### Input / Output

```typescript
interface DutyCalculateRequest extends AgentRequest {
  htsCode: string;               // 10-digit, validated
  countryOfOrigin: string;       // ISO 3166-1 alpha-2
  customsValue: number;          // USD — transaction value (per CBP valuation rules)
  quantity: number;
  unitOfMeasure: string;         // "dozen", "kg", "each"
  portOfEntry: string;           // UN/LOCODE
  entryDate: string;             // ISO date — determines applicable tariff schedule
  ftzEntry?: boolean;            // True to calculate FTZ duty-locked scenario
  ftzZoneId?: string;            // FTZ zone number (e.g., "276" for San Diego)
  addPercentage?: number;        // Custom ADD rate if known (overrides lookup)
}

interface DutyCalculateResult {
  summary: {
    customsValue: number;
    dutyComponents: DutyComponent[];
    totalDutyAmount: number;
    effectiveDutyRate: string;     // e.g., "27.5%"
    landedCost: number;            // customsValue + all duties + MPF + HMT
    dutyPerUnit: number;
    landedCostPerUnit: number;
  };
  ftzComparison?: {
    dutyAtCurrentRates: number;
    dutyIfLockedToday: number;
    savingsIfRatesIncrease: number;  // Illustrative — based on configurable scenario
    breakEvenDate: string;           // When locking pays off vs. current entry
    recommendation: "lock" | "defer" | "monitor";
    rationale: string;
  };
  explanation: string;             // 150–300 word plain-English explanation
  warnings: string[];              // ADD/CVD orders, quota restrictions, etc.
  cbpLinks: string[];
}

interface DutyComponent {
  type: "base-tariff" | "section-301" | "antidumping" | "countervailing" | "mpf" | "hmt";
  label: string;                   // Human-readable name
  rate: string;                    // Percentage or flat fee
  amount: number;                  // USD
  basis: string;                   // "customs value", "quantity", etc.
  legalCitation: string;           // HTSUS heading, 19 CFR section, etc.
}
```

### Model Choice: Claude 3 Haiku

Duty calculation is deterministic math wrapped with explanation. The LLM task is classification (identify which duty components apply) and explanation generation — both are well within Haiku's capability. Using Haiku instead of Sonnet reduces per-call cost by ~10x, which matters because this agent fires on every landed cost calculation.

### Prompt Design

```typescript
const systemPrompt = `You are a U.S. Customs compliance expert and trade analyst. Your role is to compute the accurate duty liability for a customs entry and explain it clearly to an importer.

Duty Components You Must Check (in order):
1. BASE TARIFF: From HTSUS Column 1 General rate for the HTS code and country.
2. SPECIAL RATES: GSP (A/A*), CAFTA-DR (P+), USMCA (MX/CA), other FTAs — check if country of origin qualifies.
3. SECTION 301 SURCHARGES (China only): Add 25% (List 1–3) or 7.5% (List 4A) for applicable HTS codes.
4. ANTIDUMPING (ADD): Check CBP ADD order list for this HTS + country combination.
5. COUNTERVAILING (CVD): Check CBP CVD order list for this HTS + country combination.
6. MERCHANDISE PROCESSING FEE (MPF): 0.3464% of customs value, min $31.67, max $614.35 per entry.
7. HARBOR MAINTENANCE TAX (HMT): 0.125% of dutiable value (ocean entries only, not FTZ entries).

FTZ Analysis (if requested):
- FTZ entries lock the duty rate at the date of admission, not the date of withdrawal.
- In a volatile tariff environment, locking today protects against future rate increases.
- NPF (Non-Privileged Foreign) status allows manipulation inside the FTZ before duty assessment.
- PF (Privileged Foreign) status locks the rate at admission — use when rates are expected to rise.

Output Format:
- Return a DutyCalculateResult JSON object.
- The explanation field must be written for a business owner, not a trade lawyer.
- Always cite the legal basis for each duty component.
- If ADD/CVD orders apply, state the cash deposit rate and whether a review is pending.`;
```

### Integration Points

- **Landed Cost Calculator** (`/tools/landed-cost`): Agent runs after HTS code is confirmed. Results populate the duty breakdown table.
- **FTZ Savings Analyzer**: FTZ comparison scenario feeds the analyzer's withdrawal timeline model.
- **Shipment records**: Calculated duty components stored in `shipment_duties` table for dashboard aggregation.
- **Tariff Alert Agent (future)**: When tariff changes are detected, re-runs duty calculation on all active shipments.

---

## Agent 4: Document Processing Agent

### Purpose

Parse unstructured shipping documents — commercial invoices, packing lists, bills of lading, certificates of origin — and extract structured data. Eliminates manual data entry when creating shipments from existing paperwork. Validates extracted data against platform records (e.g., flags if invoice HTS code differs from platform-classified code).

### Route

`POST /api/agents/process-document`

### Input / Output

```typescript
interface DocumentProcessRequest extends AgentRequest {
  fileUrl: string;               // Vercel Blob URL (PDF or image)
  mimeType: "application/pdf" | "image/jpeg" | "image/png";
  documentType: "commercial-invoice" | "packing-list" | "bill-of-lading" | "certificate-of-origin" | "unknown";
  shipmentId?: string;           // If linking to an existing shipment
}

interface DocumentProcessResult {
  documentType: string;          // Detected or confirmed document type
  extractedFields: ExtractedDocument;
  confidence: number;            // Overall extraction confidence 0–1
  fieldConfidences: Record<string, number>;  // Per-field confidence scores
  validationWarnings: string[];  // e.g., "Invoice HTS code 6402.99 differs from platform classification"
  missingFields: string[];       // Required fields not found in document
  rawText: string;               // Full extracted text for audit
}

interface ExtractedDocument {
  // Commercial Invoice fields
  invoiceNumber?: string;
  invoiceDate?: string;
  sellerName?: string;
  sellerAddress?: string;
  buyerName?: string;
  buyerAddress?: string;
  countryOfOrigin?: string;
  portOfLoading?: string;
  portOfDischarge?: string;
  lineItems?: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    totalValue: number;
    currency: string;
    htsCode?: string;
    netWeightKg?: number;
    grossWeightKg?: number;
  }>;
  totalInvoiceValue?: number;
  currency?: string;
  incoterms?: string;           // EXW, FOB, CIF, DDP, etc.

  // Bill of Lading fields
  blNumber?: string;
  carrier?: string;
  vessel?: string;
  voyageNumber?: string;
  containerNumbers?: string[];
  containerTypes?: string[];
  sealsNumbers?: string[];
  estimatedDeparture?: string;
  estimatedArrival?: string;

  // Certificate of Origin fields
  certificateNumber?: string;
  issuingAuthority?: string;
  preferentialTreatment?: string;  // GSP, CAFTA-DR, etc.
}
```

### Model: Claude 3.5 Sonnet with Vision

Document processing requires multimodal capability to handle scanned PDFs and photos of shipping paperwork. Claude 3.5 Sonnet's vision capability is used to process document images directly.

**PDF Handling Pipeline:**

```typescript
// lib/agents/document-processing/pdf-handler.ts
import pdf from "pdf-parse";

export async function extractTextAndImages(pdfUrl: string): Promise<{
  text: string;
  pageImages: string[];  // Base64-encoded page images for visual fallback
}>;
```

For PDFs with embedded text, extract text directly and pass to Claude as text. For scanned PDFs (no embedded text), convert pages to images and use Claude Vision.

### Prompt Design

```typescript
const systemPrompt = `You are an expert customs document analyst with 20 years of experience processing international trade paperwork. You extract structured data from shipping documents with high accuracy and flag any discrepancies or missing required fields.

Document Types You Handle:
- Commercial Invoice: Proof of sale transaction. Required for every customs entry. Must contain: seller, buyer, description, quantity, value, country of origin, HTS code (recommended), incoterms.
- Packing List: Physical details of shipment contents. Must match invoice quantities.
- Bill of Lading (B/L): Contract of carriage. Contains vessel, route, container details.
- Certificate of Origin (C/O): Declares country of manufacture. Required for preferential duty treatment (GSP, FTAs).

Extraction Rules:
1. Extract all fields present in the document, even if partially visible.
2. For monetary values, normalize to the stated currency (do not convert).
3. Dates: normalize to ISO 8601 (YYYY-MM-DD) regardless of format in document.
4. Country codes: extract as stated, then normalize to ISO 3166-1 alpha-2.
5. HTS codes: extract exactly as stated. Do NOT correct or reclassify.
6. If a field is ambiguous or partially illegible, include it with a low confidence score and note the ambiguity.

Validation Checks:
- Line item quantities × unit price must equal line total (±1% rounding tolerance).
- Total invoice value must equal sum of line items.
- Country of origin on certificate must match invoice.
- Flag if incoterms are inconsistent with port designations (e.g., CIF + destination port missing).

Output: Return an ExtractedDocument JSON object. For each top-level field, include a corresponding entry in fieldConfidences (0.0–1.0). List all missing required fields in missingFields.`;
```

### File Storage and Security

Documents uploaded to the Document Processing Agent are stored temporarily in Vercel Blob during processing and must not be retained permanently without explicit user consent:

```typescript
// Upload flow:
// 1. Client uploads to /api/upload → stored in Vercel Blob with TTL: 24h
// 2. Blob URL passed to /api/agents/process-document
// 3. Agent downloads, processes, returns structured data
// 4. Blob deleted after successful extraction OR after 24h TTL
// 5. Structured data stored in DB; raw document NOT stored by default

// For compliance, add opt-in document archiving:
// - Users can enable "archive documents" in org settings
// - Archived PDFs stored in long-term Vercel Blob with org_id prefix
```

### Integration Points

- **Shipment Creation Wizard**: "Upload documents" step — user drops invoice/B/L and wizard pre-fills shipment fields from extraction.
- **HTS Classification Agent**: Extracted product descriptions routed to Agent 1 if HTS code is missing or low-confidence.
- **Duty Calculation Agent**: Extracted customs value and HTS code fed directly to Agent 3.
- **Compliance Agent**: Extracted country of origin and product descriptions trigger Agent 5 compliance check.
- **Document Library** (`/shipments/[id]/documents`): Extracted data + original files available per shipment.

---

## Agent 5: Compliance Agent

### Purpose

Flag regulatory compliance issues for a shipment before it arrives at the US port of entry. Covers CBP import requirements, FDA prior notice, CPSC product safety, FTC labeling rules, USDA/APHIS requirements for agricultural products, and export control (EAR/ITAR) for applicable commodities.

Non-compliance at entry results in holds, exams, penalties, and in severe cases seizure. The Compliance Agent is a first-pass risk screen — it surfaces issues early enough to fix them before the cargo departs origin.

### Route

`POST /api/agents/compliance-check`

### Input / Output

```typescript
interface ComplianceCheckRequest extends AgentRequest {
  htsCode: string;               // 10-digit — determines applicable regulations
  countryOfOrigin: string;       // ISO 3166-1 alpha-2
  productDescription: string;    // Detailed description for agency-specific checks
  portOfEntry: string;           // UN/LOCODE — some requirements are port-specific
  estimatedArrivalDate: string;  // ISO date — for FDA prior notice timing
  importerOfRecord: string;      // Company name — for CBP importer status check
  intendedUse: "retail-sale" | "industrial" | "personal-import" | "samples";
  isOrganic?: boolean;
  isFoodOrBeverage?: boolean;
  isForChildren?: boolean;       // Triggers CPSC children's product rules
  hasWood?: boolean;             // Triggers APHIS ISPM 15 inspection rules
  isTextile?: boolean;           // Triggers FTC textile labeling
}

interface ComplianceCheckResult {
  overallRisk: "low" | "medium" | "high" | "critical";
  checklist: ComplianceItem[];
  requiredDocuments: DocumentRequirement[];
  requiredRegistrations: RegistrationRequirement[];
  timeline: Array<{
    deadline: string;            // ISO date or "at time of entry"
    action: string;
    agency: string;
    consequence: string;         // What happens if missed
  }>;
  exportControlAssessment: {
    earClassification?: string;  // ECCN if applicable
    exportControlled: boolean;
    licenseRequired: boolean;
    notes: string;
  };
  narrative: string;             // 200–400 word summary for non-compliance officer
}

interface ComplianceItem {
  agency: "CBP" | "FDA" | "CPSC" | "FTC" | "USDA-APHIS" | "EPA" | "DOT" | "BIS";
  requirement: string;           // Short name of the requirement
  description: string;          // What it requires
  applicability: "required" | "conditional" | "recommended";
  status: "compliant" | "action-required" | "unknown" | "not-applicable";
  action?: string;               // What the importer must do
  deadline?: string;
  penaltyRange?: string;         // e.g., "$10,000–$100,000 per violation"
  resourceLinks: string[];       // CBP.gov, FDA.gov links
}
```

### Knowledge Base Architecture

The Compliance Agent uses a RAG approach over a structured compliance knowledge base. This is critical because regulations change frequently and must be cited accurately.

**Knowledge Base Structure:**

```
data/compliance/
  cbp-requirements.json        # CBP general import requirements by HTS chapter
  fda-products.json            # FDA-regulated products (food, drugs, devices, cosmetics)
  cpsc-regulations.json        # CPSC product safety regulations and standards
  ftc-labeling.json            # FTC textile, fur, wool labeling requirements
  usda-aphis.json              # APHIS requirements (wood, plants, animals)
  export-controls.json         # BIS EAR ECCN classifications by HTS range
  section-301-lists.json       # Current Section 301 tariff lists
  add-cvd-orders.json          # Active antidumping and countervailing duty orders
```

Each knowledge base file is chunked and embedded into the `compliance_knowledge` table (pgvector). The agent retrieves the most relevant regulatory excerpts for the specific HTS chapter, country, and product type before generating the compliance checklist.

### Prompt Design

```typescript
const systemPrompt = `You are a U.S. import compliance specialist with expertise in CBP, FDA, CPSC, FTC, USDA-APHIS, and export controls. Your role is to screen an import shipment for compliance issues and produce an actionable checklist that the importer can act on before cargo departs origin.

Evaluation Framework:
1. CBP FUNDAMENTALS: Every import requires entry, commercial invoice, packing list, and (for ocean freight) bill of lading. Check: ISF filing timing (10+2 rule — 24 hours before vessel departure for ocean), C-TPAT membership status, prior disclosures.
2. FDA PRIOR NOTICE: Required for ALL food, dietary supplements, animal food, and cosmetics. Must be filed 2–8 hours before arrival (2 hours for truck, 4 hours for air, 8 hours for ocean). Verify product is not on the Import Alert list.
3. CPSC / CHILDREN'S PRODUCTS: Products intended for children under 12 must meet CPSC safety standards. Requires a Children's Product Certificate (CPC) and third-party testing by a CPSC-accredited lab. Specific standards by product category (ASTM, CPSC-mandated tests).
4. FTC LABELING: Textile products must comply with the Textile Fiber Products Identification Act (fiber content, country of origin on label in English). Wool and fur have separate Acts.
5. USDA-APHIS: Wood packaging material must comply with ISPM 15 (heat treatment + marking). Live plants, animals, and certain agricultural products require import permits and phytosanitary certificates.
6. EXPORT CONTROLS (EAR/ITAR): Check if product has a non-EAR99 ECCN classification. If so, verify no license exception applies and export license is not required. Flag ITAR-controlled items immediately.
7. ADD/CVD ORDERS: Active antidumping and countervailing duty orders for this HTS + country combination. Cash deposit rates, scope rulings, and current review status.
8. TRADE PROGRAMS: Does the country of origin qualify for GSP, CAFTA-DR, USMCA, or another preferential tariff program? If so, what documentation is required (Form A, Certificate of Origin, etc.)?

Regulatory Context Provided:
${retrievedCompliance}

Output Format:
- ComplianceCheckResult JSON with ALL applicable regulations listed, even if status is "compliant."
- overallRisk must reflect the most severe unresolved compliance issue found.
- The narrative must be written for a small business importer, not a trade lawyer.
- Never omit a required check because you are uncertain — mark it "unknown" with an action to verify.
- Always include the consequence of non-compliance (duty penalties, holds, seizure risk).

IMPORTANT: This is a risk screening tool, not legal advice. Importers must confirm all requirements with a licensed customs broker before entry filing.`;
```

### Integration Points

- **Shipment Creation**: Compliance check runs automatically when a shipment is created with a confirmed HTS code and country of origin.
- **HTS Classification Agent**: After a user confirms an HTS code from Agent 1, Agent 5 fires automatically to pre-screen compliance.
- **Compliance Center** (`/portal/compliance`): All compliance check results displayed with status badges and action items. Exportable as PDF checklist.
- **Notification System**: "High" and "Critical" risk findings trigger in-app notifications and email alerts.
- **Document Agent**: Extracted certificate of origin and invoice data feeds the compliance check context.

---

## Integration Architecture

### Agent Call Flow

```
User Action (UI or API)
  │
  ▼
API Route (/api/agents/*)
  ├── verifySession() → 401 if unauthenticated
  ├── withRateLimit() → 429 if rate limit exceeded
  ├── validateInput(zodSchema) → 400 if invalid
  ├── logAgentCall(status: "pending") → audit_logs
  │
  ▼
Agent Orchestrator (lib/agents/*/index.ts)
  ├── Retrieve context (pgvector / JSON data)
  ├── Build system + user prompt
  ├── Call Anthropic API (claude-sonnet-4-6 or haiku)
  ├── Parse + validate response (Zod)
  │
  ▼
Response Handler
  ├── updateAgentCall(status: "success" | "error", tokens, latency)
  ├── Store result to DB (if applicable)
  ├── Return AgentResponse<T> to client
```

### Agent Chaining (Common Flows)

Several user journeys trigger multiple agents in sequence:

**New Shipment Flow:**
```
Upload Invoice → Agent 4 (Document) → Agent 1 (HTS Classification) → Agent 3 (Duty Calculation) → Agent 5 (Compliance)
```

**Product Research Flow:**
```
Describe Product → Agent 1 (HTS) → [User Confirms HTS] → Agent 3 (Duty) + Agent 5 (Compliance) [parallel]
```

**Route Planning Flow:**
```
Set Origin/Destination → Agent 2 (Rate Shopping) → [User Selects Route] → Agent 3 (Duty, with landed cost)
```

Agent chaining is implemented as sequential API calls from the frontend (no server-side orchestration in Phase 3 MVP). Each agent result is stored in the shipment record and passed as context to the next agent call.

---

## Development Timeline

### Sprint 5 Schedule (Weeks 17–20)

| Week | Focus | Agents | Deliverables |
|------|-------|--------|-------------|
| 17 | Infrastructure + Agent 1 | HTS Classification | Shared `lib/agents/` scaffolding, audit logging, Agent 1 API + UI |
| 18 | Agents 2 + 3 | Rate Shopping, Duty Calculation | Agent 2 API + streaming UI, Agent 3 API integrated into landed cost calculator |
| 19 | Agent 4 | Document Processing | File upload flow, extraction UI, shipment pre-fill |
| 20 | Agent 5 + Integration | Compliance | Compliance checklist UI, agent chaining for new shipment flow, E2E tests |

### Pre-Sprint Requirements

Before Sprint 5 starts, the following must be in place:

- [ ] Anthropic API key provisioned in Vercel environment variables
- [ ] OpenAI API key provisioned (for HTS embedding generation)
- [ ] `hts_codes` table populated and pgvector extension enabled on Neon DB
- [ ] `scripts/embed-hts.ts` run to generate and store HTS embeddings
- [ ] Compliance knowledge base JSON files in `data/compliance/` and embedded
- [ ] Vercel Blob configured for document upload

### Dependency Map

```
Sprint 1 (Auth + DB schema)
  → Sprint 2 (Data Pipeline — hts_codes, ftz_zones tables populated)
    → Sprint 5 Agent 1 (requires hts_codes + pgvector)
    → Sprint 5 Agent 5 (requires compliance knowledge base)
Sprint 3 (Landed Cost Calculator — lib/calculators/duty-calculator.ts)
  → Sprint 5 Agent 3 (wraps existing calculator)
Sprint 3 (Route Comparison Tool — data/vessel-schedules.json)
  → Sprint 5 Agent 2 (queries same data)
```

---

## Evaluation Framework

Each agent must pass an offline evaluation suite before going live. Tests run against a labeled holdout dataset.

### Agent 1: HTS Classification

| Metric | Target | Failure Threshold |
|--------|--------|------------------|
| 6-digit heading accuracy | ≥ 70% | < 55% |
| 10-digit accuracy | ≥ 55% | < 40% |
| False positive high-confidence rate | < 15% | > 30% |
| p50 latency | < 5s | > 10s |

Test dataset: 200 CBP binding rulings with known HTS assignments (sampled from rulings.cbp.gov).

### Agent 2: Rate Shopping

Evaluation is qualitative (no ground-truth rates available at MVP). Evaluation criteria:

- Recommendations are internally consistent (cheapest route is not also fastest)
- Backhaul opportunity is correctly identified on known backhaul lanes
- Narrative is readable and non-contradictory (human review by Julian or founder)
- Streaming works without dropouts on slow connections

### Agent 3: Duty Calculation

| Metric | Target |
|--------|--------|
| Duty amount accuracy (vs. manual CBP calculation) | ± 0.5% |
| MPF calculation accuracy | ± $0.01 |
| Section 301 applicability: precision | ≥ 95% |
| Section 301 applicability: recall | ≥ 98% (no misses) |

Test dataset: 100 manually calculated duty scenarios covering common HTS chapters.

### Agent 4: Document Processing

| Metric | Target |
|--------|--------|
| Invoice total value extraction accuracy | ≥ 90% |
| Line item count accuracy | ≥ 85% |
| Date normalization accuracy | ≥ 95% |
| BL number extraction accuracy | ≥ 90% |

Test dataset: 50 synthetic commercial invoices and 30 bills of lading.

### Agent 5: Compliance

| Metric | Target |
|--------|--------|
| FDA prior notice flag recall (no missed flags) | ≥ 99% |
| CPSC children's product flag recall | ≥ 99% |
| ADD/CVD order flag recall | ≥ 95% |
| False positive rate (overall) | < 20% |

Recall is prioritized over precision for the Compliance Agent — a missed compliance issue is worse than an unnecessary warning.

---

## Cost Estimates

Monthly cost projections at 500 active users making 10 agent calls/user/month = 5,000 calls/month:

| Agent | Model | Avg Input Tokens | Avg Output Tokens | Cost/Call | Monthly (5K calls) |
|-------|-------|-----------------|------------------|-----------|-------------------|
| HTS Classification | claude-sonnet-4-6 | 3,000 | 500 | ~$0.021 | ~$105 |
| Rate Shopping | claude-sonnet-4-6 | 2,500 | 1,500 | ~$0.030 | ~$150 |
| Duty Calculation | Claude 3 Haiku | 2,000 | 600 | ~$0.003 | ~$15 |
| Document Processing | claude-sonnet-4-6 | 4,000 | 800 | ~$0.028 | ~$140 |
| Compliance | claude-sonnet-4-6 | 5,000 | 1,200 | ~$0.039 | ~$195 |
| **Total** | | | | | **~$605/month** |

At $399/month Professional plan pricing, AI agent costs represent < $2/user/month — well within margin.

**Cost Controls:**
- Cache HTS classification results by product description hash (Redis TTL: 7 days). Expected cache hit rate: 40–60% for repeat product types.
- Cache Compliance results by HTS code + country of origin (TTL: 24 hours, invalidated on tariff change events).
- Alert via email if monthly AI spend exceeds `AGENT_SPEND_ALERT_THRESHOLD` (default: $100).

---

## Open Questions

1. **Vector database:** Neon's pgvector extension vs. dedicated Pinecone instance. Decision: use pgvector for Phase 3 MVP to avoid an additional service dependency. Revisit at 10K+ HTS embeddings or if query latency exceeds 500ms.

2. **Document archiving policy:** Default is no document retention (extract and delete). Confirm with founder whether document archiving should be offered as an opt-in feature.

3. **FDA Import Alert integration:** FDA's OASIS system is not publicly accessible via API. Compliance Agent flags FDA-regulated products generically. Real-time import alert screening would require a third-party service or manual list maintenance.

4. **Multimodal for HTS:** Agent 1's image classification path (product photos → HTS code) is included in the spec but not required for Sprint 5 MVP. Defer to v1 unless the founder confirms product photos are a priority input.

5. **Agent 2 live carrier data:** Rate Shopping Agent in Sprint 5 uses static `data/vessel-schedules.json`. Transition to live carrier API calls (MarineTraffic, Freightos API, or direct carrier integrations) is gated by Phase 4 decisions on carrier partnerships and API cost.

---

*This document covers AI-5459 and AI-5435 — AI Agent Development Plans for the Shipping Savior platform.*
*For the extended agent roadmap (Agents 6–7: Forecast, Anomaly, FTZ Strategy), see [prds/AI-AGENT-PLANS.md](./prds/AI-AGENT-PLANS.md) (AI-5411).*
*Last updated: 2026-03-26*

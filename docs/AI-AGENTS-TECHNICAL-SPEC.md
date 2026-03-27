# AI Agent Technical Implementation Specifications — Shipping Savior

**Linear:** AI-5459
**Phase:** 2 — Planning
**Last Updated:** 2026-03-27
**Status:** Ready for Engineering Review
**Author:** AI Acrobatics Engineering
**Companion Document:** [AI-AGENTS-PLAN.md](./AI-AGENTS-PLAN.md) (business context, agent ROI, timelines)

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Agent Orchestration](#2-agent-orchestration)
3. [Vector Database Setup](#3-vector-database-setup)
4. [Agent 1: HTS Classification Agent](#4-agent-1-hts-classification-agent)
5. [Agent 2: Cost Optimization Agent](#5-agent-2-cost-optimization-agent)
6. [Agent 3: Compliance Agent](#6-agent-3-compliance-agent)
7. [Agent 4: Document Agent](#7-agent-4-document-agent)
8. [Agent 5: Forecast Agent](#8-agent-5-forecast-agent)
9. [Agent 6: Anomaly Agent](#9-agent-6-anomaly-agent)
10. [RAG Pipeline Design](#10-rag-pipeline-design)
11. [Agent Memory and State Management](#11-agent-memory-and-state-management)
12. [Tool and Function Calling Specifications](#12-tool-and-function-calling-specifications)
13. [Testing Strategy](#13-testing-strategy)
14. [Evaluation Metrics and Benchmarking](#14-evaluation-metrics-and-benchmarking)
15. [Cost Optimization Strategies](#15-cost-optimization-strategies)
16. [Production Deployment and Monitoring](#16-production-deployment-and-monitoring)

---

## 1. Architecture Overview

### Design Philosophy

Each agent is a self-contained inference unit with a well-defined interface. Agents do not call each other directly — they communicate through a shared event bus and structured database state. This enables:

- Independent deployment, scaling, and rollback per agent
- Clear ownership boundaries and debuggability
- Composable pipelines (e.g., Document Agent output feeds Compliance Agent)
- Cost attribution per agent per customer

### System Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        API Layer (Next.js)                      │
│              /api/agents/{agent-id}/invoke                      │
└───────────────────────────┬─────────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                    Agent Gateway (Node.js)                       │
│   • Request validation (Zod)                                    │
│   • Auth token verification                                     │
│   • Rate limiting (Redis sliding window)                        │
│   • Usage metering → Postgres                                   │
│   • Async dispatch → BullMQ                                     │
└──────┬─────────────┬────────────┬───────────────┬───────────────┘
       │             │            │               │
  ┌────▼────┐  ┌─────▼────┐ ┌────▼────┐  ┌──────▼────┐
  │  HTS    │  │   Cost   │ │Complian.│  │  Document │
  │ Agent   │  │  Optim.  │ │  Agent  │  │   Agent   │
  └────┬────┘  └─────┬────┘ └────┬────┘  └──────┬────┘
       │             │            │               │
  ┌────▼────┐  ┌─────▼────┐ ┌────▼────┐
  │Forecast │  │ Anomaly  │ │Shared   │
  │  Agent  │  │  Agent   │ │Services │
  └─────────┘  └──────────┘ └─────────┘

Shared Services:
  • pgvector (PostgreSQL) — embeddings + semantic search
  • Redis — caching, rate limiting, session state
  • S3/R2 — raw document storage, training data
  • BullMQ — async job queue, retries, dead-letter
  • Prometheus + Grafana — metrics, alerting
```

### Technology Stack Decision

**Orchestration:** Custom lightweight orchestrator (TypeScript) — NOT LangChain or LlamaIndex.

**Rationale:**
- LangChain abstractions add 40–60ms latency per chain step with limited debuggability
- LlamaIndex is optimized for RAG pipelines, not multi-agent orchestration
- Custom orchestrator gives full control over retry logic, streaming, cost tracking, and observability
- Total implementation surface is ~800 lines vs. pulling in 200K+ LOC frameworks

**Where framework libraries ARE used:**
- `@anthropic-ai/sdk` — Claude API client (streaming, tool use)
- `openai` — Embeddings generation (text-embedding-3-large)
- `langchain/text_splitter` — Document chunking utilities only
- `ml-matrix`, `simple-statistics` — Anomaly detection math
- `pdfjs-dist`, `tesseract.js` — Document parsing

---

## 2. Agent Orchestration

### Request Lifecycle

```typescript
// lib/agents/gateway.ts
interface AgentRequest {
  agentId: AgentId;
  userId: string;
  organizationId: string;
  input: unknown;            // Validated by per-agent Zod schema
  options?: {
    stream?: boolean;        // Enable SSE streaming for long-running agents
    timeout?: number;        // ms, default 30000
    priority?: "high" | "normal" | "low";
  };
}

interface AgentResponse<T> {
  requestId: string;
  agentId: AgentId;
  status: "success" | "error" | "partial";
  data?: T;
  error?: {
    code: string;
    message: string;
    retryable: boolean;
  };
  meta: {
    durationMs: number;
    tokensUsed: { input: number; output: number };
    costUSD: number;
    modelUsed: string;
    cacheHit: boolean;
  };
}
```

### Async Job Queue (BullMQ)

Long-running agents (Forecast, Compliance, Cost Optimization) are dispatched to BullMQ and polled via SSE or webhook callback. Short agents (HTS Classification, Document extraction) run synchronously with a 10s timeout.

```typescript
// lib/agents/queue.ts
const AGENT_QUEUES: Record<AgentId, QueueConfig> = {
  "hts-classification": { sync: true,  timeout: 8000,  retries: 2 },
  "cost-optimization":  { sync: false, timeout: 45000, retries: 3 },
  "compliance":         { sync: false, timeout: 60000, retries: 2 },
  "document":           { sync: true,  timeout: 15000, retries: 3 },
  "forecast":           { sync: false, timeout: 120000, retries: 1 },
  "anomaly":            { sync: true,  timeout: 5000,  retries: 3 },
};
```

### Human-in-the-Loop (HITL) Workflow

Each agent has a configurable confidence threshold. Below the threshold, results are flagged for human review instead of being acted on automatically.

```typescript
// lib/agents/hitl.ts
interface HITLConfig {
  confidenceThreshold: number;     // 0.0–1.0
  reviewQueue: string;             // Postgres table name
  autoApproveAbove: number;        // Skip review if confidence >= this
  notifyUser: boolean;             // Push notification on flag
  escalationRuleId?: string;       // Custom rule for edge cases
}

const HITL_DEFAULTS: Record<AgentId, HITLConfig> = {
  "hts-classification": { confidenceThreshold: 0.85, autoApproveAbove: 0.97 },
  "cost-optimization":  { confidenceThreshold: 0.75, autoApproveAbove: 0.92 },
  "compliance":         { confidenceThreshold: 0.90, autoApproveAbove: 0.99 },
  "document":           { confidenceThreshold: 0.80, autoApproveAbove: 0.95 },
  "forecast":           { confidenceThreshold: 0.70, autoApproveAbove: 0.88 },
  "anomaly":            { confidenceThreshold: 0.80, autoApproveAbove: 0.95 },
};
```

---

## 3. Vector Database Setup

### Database: pgvector (PostgreSQL extension)

**Why pgvector over Pinecone/Weaviate:**
- Already running PostgreSQL (Neon) — zero additional infrastructure
- ACID transactions across relational + vector data in single queries
- Simpler ops: one database, one backup strategy, one connection pool
- Neon supports pgvector natively
- Pinecone adds ~$70–$400/month for the equivalent vector volume

**Pinecone migration path exists** if vector volume exceeds 10M records or query latency exceeds 50ms p95.

### Schema

```sql
-- Enable pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- Embedding store (all agents share this table)
CREATE TABLE agent_embeddings (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id    TEXT NOT NULL,               -- 'hts-classification', 'compliance', etc.
  source_type TEXT NOT NULL,               -- 'hts-code', 'regulation', 'rate-history', etc.
  source_id   TEXT NOT NULL,               -- External ID (HTS code, CFR section, etc.)
  content     TEXT NOT NULL,               -- Original text that was embedded
  metadata    JSONB NOT NULL DEFAULT '{}', -- Filterable fields (country, category, date, etc.)
  embedding   vector(1536) NOT NULL,       -- OpenAI text-embedding-3-large dimensions
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for ANN search
CREATE INDEX ON agent_embeddings USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- Metadata filter indexes
CREATE INDEX ON agent_embeddings (agent_id, source_type);
CREATE INDEX ON agent_embeddings USING gin (metadata);

-- HITL review queue
CREATE TABLE agent_review_queue (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id      UUID NOT NULL,
  agent_id        TEXT NOT NULL,
  organization_id UUID NOT NULL,
  input           JSONB NOT NULL,
  output          JSONB NOT NULL,
  confidence      FLOAT NOT NULL,
  status          TEXT DEFAULT 'pending',  -- pending, approved, rejected, overridden
  reviewer_id     UUID,
  reviewer_notes  TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at     TIMESTAMPTZ
);

-- Agent usage tracking
CREATE TABLE agent_usage (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id      UUID NOT NULL,
  agent_id        TEXT NOT NULL,
  organization_id UUID NOT NULL,
  user_id         UUID NOT NULL,
  input_tokens    INT NOT NULL,
  output_tokens   INT NOT NULL,
  cost_usd        NUMERIC(10,6) NOT NULL,
  duration_ms     INT NOT NULL,
  cache_hit       BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

### Embedding Generation

```typescript
// lib/agents/embeddings.ts
import OpenAI from "openai";

const openai = new OpenAI();

export async function embed(texts: string[]): Promise<number[][]> {
  // Batch up to 100 texts per call
  const chunks = chunk(texts, 100);
  const results: number[][] = [];

  for (const batch of chunks) {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-large",
      input: batch,
      dimensions: 1536,   // Reduced from 3072 — 30% cheaper, ~1% accuracy loss
    });
    results.push(...response.data.map((d) => d.embedding));
  }

  return results;
}

export async function semanticSearch({
  agentId,
  sourceType,
  query,
  topK = 5,
  metadataFilter,
}: SemanticSearchParams): Promise<SearchResult[]> {
  const [queryEmbedding] = await embed([query]);

  return db.execute(sql`
    SELECT
      id, source_id, content, metadata,
      1 - (embedding <=> ${queryEmbedding}::vector) AS similarity
    FROM agent_embeddings
    WHERE agent_id = ${agentId}
      AND source_type = ${sourceType}
      ${metadataFilter ? sql`AND metadata @> ${metadataFilter}` : sql``}
    ORDER BY embedding <=> ${queryEmbedding}::vector
    LIMIT ${topK}
  `);
}
```

---

## 4. Agent 1: HTS Classification Agent

**Linear agent:** Maps to "FTZ Classification Agent" in AI-5435 — expanded scope to full HTS tariff code classification.

### Model Approach: Embeddings + Rules + LLM Fallback

**Tier 1 (Fast path, ~80% of requests):**
1. Embed product description
2. Semantic search against HTS code embeddings database (87K+ codes)
3. If top result similarity > 0.92 → return with high confidence

**Tier 2 (Medium path, ~15% of requests):**
1. Tier 1 returns 0.80–0.92 similarity
2. Pass top 5 candidates to Claude Haiku with structured prompt
3. Claude selects best match + rationale
4. Return with medium confidence

**Tier 3 (LLM reasoning, ~5% of requests):**
1. Similarity < 0.80 or multiple high-similarity candidates
2. Pass to Claude Sonnet with full CBP classification guidelines context
3. Generate classification with chapter heading, heading, subheading, duty rate
4. Flag for HITL review if novel product category

### Training Data

| Source | Volume | Update Frequency | Format |
|--------|--------|-----------------|--------|
| USITC HTS Schedule (current year) | 87,000+ codes | Annual (+ amendments) | CSV/XML |
| CBP Rulings Database (CROSS) | 250,000+ binding rulings | Weekly | HTML/PDF |
| WCO Explanatory Notes | Full schedule | Annual | PDF |
| Platform classification history | Grows monthly | Real-time | Postgres |
| Rejected/overridden HITL decisions | Grows monthly | Real-time | Postgres |

### Prompt Template

```typescript
// lib/agents/hts-classification/prompts.ts
export const HTS_CLASSIFICATION_PROMPT = `
You are a licensed customs broker specializing in HTS tariff classification under the Harmonized Tariff Schedule of the United States (HTSUS).

## Product to Classify
{product_description}

## Additional Context
- Country of origin: {country_of_origin}
- Manufacturer: {manufacturer_name}
- Intended use: {intended_use}
- Material composition: {material_composition}

## Top Candidates from Semantic Search
{candidates_json}

## Classification Task
Using GRI (General Rules of Interpretation) 1 through 6:

1. Identify the applicable chapter, heading, and subheading
2. Cite the specific GRI rule(s) that govern your classification
3. Note any CBP ruling precedents from the candidates above
4. Provide the 10-digit HTS code and description
5. State the general rate of duty
6. Flag any special programs applicable (GSP, USMCA, Section 301, etc.)

Return a JSON object with this exact structure:
{
  "htsCode": "string (10 digits, e.g. 8471.30.0100)",
  "description": "string",
  "chapter": "string",
  "heading": "string",
  "subheading": "string",
  "generalDutyRate": "string",
  "specialPrograms": ["string"],
  "griRules": ["string"],
  "rulingPrecedents": ["string"],
  "confidence": number,
  "confidenceRationale": "string",
  "alternativeClassifications": [
    {"htsCode": "string", "reason": "string", "probability": number}
  ],
  "flagForReview": boolean,
  "reviewReason": "string | null"
}
`;
```

### Evaluation Metrics

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Top-1 accuracy | > 92% | Manual expert review of 500-item benchmark |
| Top-3 accuracy | > 98% | Same benchmark |
| Latency (p50) | < 800ms | Prometheus histogram |
| Latency (p99) | < 3000ms | Prometheus histogram |
| Cost per classification | < $0.003 | Usage metering |
| HITL escalation rate | < 8% | Agent review queue |

### A/B Testing Plan

- **Control:** Embeddings-only (Tier 1 only)
- **Treatment A:** Embeddings + Haiku fallback (Tier 1 + 2)
- **Treatment B:** Full 3-tier stack
- **Metric:** Classification accuracy on blind test set, cost per call
- **Duration:** 4 weeks, minimum 2,000 classifications per arm

---

## 5. Agent 2: Cost Optimization Agent

### Model Approach: RAG + Claude Sonnet + Structured Output

Multi-step reasoning pipeline:
1. Parse shipment parameters and constraints
2. Retrieve current market rates from rate index (RAG)
3. Retrieve carrier performance history for requested lanes
4. Run cost/time/risk tradeoff analysis
5. Generate ranked routing alternatives with reasoning

### Training Data

| Source | Volume | Update Frequency |
|--------|--------|-----------------|
| Freightos Baltic Exchange (FBX) rates | All major lanes | Weekly |
| Platform quote history | Grows monthly | Real-time |
| Carrier schedule database | All major carriers | Weekly |
| Vessel AIS data (backhaul signals) | All vessels | Daily |
| Port congestion indexes | All major ports | Daily |
| Fuel surcharge indexes | BAF, ECA | Weekly |

### Prompt Template

```typescript
export const COST_OPTIMIZATION_PROMPT = `
You are a senior freight forwarding analyst with 15 years of experience optimizing international shipping costs across ocean, air, and multimodal routes.

## Shipment Parameters
Origin: {origin_locode} ({origin_city}, {origin_country})
Destination: {destination_locode} ({destination_city}, {destination_country})
Container: {container_type}
Cargo: {cargo_description}, {cargo_weight_kg}kg, {cargo_cbm}CBM
Target ship date: {target_date}
Date flexibility: {date_flexibility_days} days
Budget constraint: {max_budget_usd} USD (or "none")
Time constraint: {max_transit_days} days (or "none")

## Current Market Context (from rate index, as of {data_date})
{market_rates_json}

## Carrier Performance Data
{carrier_performance_json}

## Backhaul Signals
{backhaul_signals_json}

## Port Conditions
{port_conditions_json}

## Task
Generate a ranked list of 3–5 routing alternatives. For each option:
1. Calculate total landed cost (freight + surcharges + port fees)
2. Identify negotiation leverage points
3. Flag any risk factors (port congestion, carrier reliability, weather)
4. Estimate realistic counter-offer if current quotes are above market

Return structured JSON per the RouteRecommendation schema.
`;
```

### Evaluation Metrics

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Recommendation adoption rate | > 60% | Platform tracking |
| Average savings vs. accepted quote | > 8% | Post-shipment reconciliation |
| Forecast rate accuracy (±15%) | > 75% | Actual vs. predicted rates |
| Latency (p95 async) | < 15s | BullMQ job duration |

---

## 6. Agent 3: Compliance Agent

### Model Approach: Rule Engine + CBP/FDA RAG + Claude Sonnet

Compliance is the highest-stakes agent. A false negative (missing a compliance issue) costs the customer a customs hold — potentially $10K–$100K in delays. Strategy:

**Layer 1: Deterministic rule engine**
- Hard-coded rules for known requirements (CITES, FDA Prior Notice, ISF filing)
- Structured regulation database (CFR Title 19, FDA 21 CFR, USDA regulations)
- Zero LLM cost for known-state checks

**Layer 2: Semantic retrieval**
- Query regulation embeddings for product/origin-specific requirements
- Return top-5 relevant regulation sections as context

**Layer 3: LLM compliance scoring**
- Claude Sonnet evaluates shipment against retrieved regulations
- Generates specific action items and missing documentation list
- Flags edge cases for human compliance officer review

### Training Data

| Source | Volume | Update Frequency |
|--------|--------|-----------------|
| CBP Regulations (19 CFR) | Full text | Quarterly (monitored for amendments) |
| FDA Prior Notice requirements | Full text | Monthly |
| USDA APHIS import requirements | Full text | Monthly |
| OFAC sanctions lists | All lists | Daily |
| Section 301/232/201 tariff lists | All lists | Weekly |
| Country-specific import restrictions | 195 countries | Monthly |
| CITES endangered species schedules | Full | Semi-annual |
| Platform compliance incident history | Grows monthly | Real-time |

### Regulation Change Detection

```typescript
// lib/agents/compliance/change-detector.ts
// Runs daily via cron job
export async function detectRegulationChanges(): Promise<ChangeReport> {
  const sources = [
    { url: "https://www.federalregister.gov/api/v1/...", type: "cfr" },
    { url: "https://www.cbp.gov/trade/basic-import-export/...", type: "cbp" },
    { url: "https://www.fda.gov/food/import-program-food-safety/...", type: "fda" },
  ];

  for (const source of sources) {
    const content = await fetch(source.url).then((r) => r.text());
    const hash = crypto.createHash("sha256").update(content).digest("hex");

    const existing = await db.query.regulationHashes.findFirst({
      where: eq(regulationHashes.sourceUrl, source.url),
    });

    if (existing?.hash !== hash) {
      // Content changed — re-embed and update regulation database
      await reEmbedRegulation(source, content);
      await notifyComplianceTeam(source.url);
    }
  }
}
```

### Prompt Template

```typescript
export const COMPLIANCE_CHECK_PROMPT = `
You are a licensed customs compliance officer with expertise in U.S. import regulations, CBP requirements, FDA oversight, and international trade compliance.

## Shipment Details
{shipment_json}

## HTS Classification
Code: {hts_code}
Description: {hts_description}
Chapter notes applicable: {chapter_notes}

## Relevant Regulations Retrieved
{regulations_context}

## Compliance Check Task
Review this shipment for the following compliance requirements:

1. **CBP Entry Requirements** — ISF filing (10+2), entry type, bond requirements
2. **FDA Requirements** — Prior Notice, FSVP, facility registration
3. **USDA/APHIS Requirements** — Phytosanitary certificates, permits
4. **OFAC Screening** — Sanctioned parties, countries, goods
5. **Section 301/232/201 Tariffs** — Additional duty exposure
6. **Marking Requirements** — Country of origin marking, labeling
7. **Documentation Gaps** — Missing or potentially invalid documents

For each requirement category, provide:
- Status: compliant | non-compliant | requires-review | not-applicable
- Required action (if any)
- Deadline or timing constraint
- Risk level: critical | high | medium | low

Return structured JSON per the ComplianceReport schema.
`;
```

### Evaluation Metrics

| Metric | Target | Notes |
|--------|--------|-------|
| False negative rate (missed violations) | < 0.5% | Gold standard test set with known violations |
| False positive rate (false alarms) | < 15% | Must not over-alert or customers ignore warnings |
| Regulation coverage recall | > 95% | Against known regulation checklist |
| Time to detect regulation changes | < 24 hours | Cron job monitoring |

---

## 7. Agent 4: Document Agent

### Model Approach: Claude Sonnet Vision + Extraction Schema

Processes PDFs, scanned images, and structured files (EDI, XML). Extracts structured data fields with confidence scores. Validates extracted data against expected formats and flags discrepancies.

**Document types handled:**
- Bill of Lading (B/L) — ocean and air waybill
- Commercial Invoice
- Packing List
- Certificate of Origin (various forms: USMCA, GSP, generic)
- Phytosanitary / Health Certificate
- ISF Filing (10+2 data elements)
- CBP Form 7501 (Entry Summary)
- FDA Prior Notice

### Processing Pipeline

```typescript
// lib/agents/document/pipeline.ts
export async function processDocument(
  file: Buffer,
  mimeType: string,
  documentType: DocumentType
): Promise<DocumentExtractionResult> {

  // Step 1: Pre-process
  const pages = await pdfToImages(file);           // pdf → image pages
  const text = await extractText(file, mimeType);  // OCR or direct text

  // Step 2: Classify if documentType is unknown
  const confirmedType = documentType === "unknown"
    ? await classifyDocument(pages[0], text)
    : documentType;

  // Step 3: Extract structured data
  const schema = DOCUMENT_SCHEMAS[confirmedType];
  const extracted = await claude.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 2048,
    messages: [{
      role: "user",
      content: [
        { type: "image", source: { type: "base64", media_type: "image/png", data: pages[0] } },
        { type: "text", text: buildExtractionPrompt(confirmedType, schema, text) },
      ],
    }],
  });

  // Step 4: Parse and validate
  const data = JSON.parse(extractJsonFromResponse(extracted.content));
  const validation = validateAgainstSchema(data, schema);

  // Step 5: Cross-reference check (if shipment context available)
  if (context.shipmentId) {
    const discrepancies = await crossReference(data, context.shipmentId);
    validation.discrepancies = discrepancies;
  }

  return { documentType: confirmedType, extractedData: data, validation, confidence: calculateConfidence(validation) };
}
```

### Extraction Schema Example (Bill of Lading)

```typescript
const BOL_SCHEMA: ExtractionSchema = {
  fields: [
    { name: "bolNumber",       type: "string",  required: true,  format: /^[A-Z0-9]{8,20}$/ },
    { name: "shipperName",     type: "string",  required: true },
    { name: "consigneeName",   type: "string",  required: true },
    { name: "portOfLoading",   type: "string",  required: true,  normalize: "locode" },
    { name: "portOfDischarge", type: "string",  required: true,  normalize: "locode" },
    { name: "vesselName",      type: "string",  required: true },
    { name: "voyageNumber",    type: "string",  required: false },
    { name: "etd",             type: "date",    required: true,  format: "ISO8601" },
    { name: "eta",             type: "date",    required: true,  format: "ISO8601" },
    { name: "containers",      type: "array",   required: true,
      items: {
        containerNumber: { type: "string", format: /^[A-Z]{4}[0-9]{7}$/ },
        sealNumber:      { type: "string" },
        type:            { type: "enum", values: ["20", "40", "40HC", "45"] },
        weightKg:        { type: "number" },
        cbm:             { type: "number" },
      }
    },
    { name: "commodityDescription", type: "string", required: true },
    { name: "htsCode",         type: "string",  required: false, format: /^\d{6,10}$/ },
    { name: "totalValueUSD",   type: "number",  required: false },
    { name: "freightTerms",    type: "enum",    values: ["PREPAID", "COLLECT", "AS_ARRANGED"] },
  ],
};
```

### Evaluation Metrics

| Metric | Target |
|--------|--------|
| Field extraction accuracy | > 95% per field on clean documents |
| OCR-degraded document accuracy | > 85% |
| Document type classification accuracy | > 99% |
| Latency (p95, PDF < 10 pages) | < 8s |
| Cross-reference discrepancy detection | > 90% |

---

## 8. Agent 5: Forecast Agent

### Model Approach: Time-Series ML + LLM Explainer

Two components:
1. **Quantitative forecast:** Statistical time-series model for rate and demand prediction
2. **Narrative explainer:** LLM layer that contextualizes quantitative output with market factors

### Forecasting Models

```
Rate Forecasting:
  Primary:    Prophet (Meta) — captures seasonality, trend, holidays
  Ensemble:   LightGBM on engineered features (fuel index, port congestion, vessel supply)
  Confidence: Bayesian uncertainty intervals

Demand Forecasting:
  Primary:    ARIMA/SARIMA for individual lane demand
  Secondary:  Neural Prophet for complex seasonal patterns
  Features:   Trade volumes, GDP proxies, historical platform bookings
```

### Feature Engineering

```typescript
// lib/agents/forecast/features.ts
interface LaneForecastFeatures {
  // Lag features (historical rates)
  rate_lag_1w: number;
  rate_lag_2w: number;
  rate_lag_4w: number;
  rate_lag_8w: number;
  rate_lag_52w: number;    // Year-over-year

  // Rolling statistics
  rate_rolling_4w_mean: number;
  rate_rolling_4w_std: number;
  rate_rolling_12w_trend: number;

  // External signals
  fuel_price_brent: number;
  port_congestion_index: number;  // Waiting days at destination port
  vessel_supply_index: number;    // Fleet capacity utilization
  trade_volume_index: number;     // Trade volume on this lane

  // Calendar features
  week_of_year: number;
  days_to_chinese_new_year: number;
  days_to_peak_season: number;
  is_holiday_period: boolean;

  // Macro signals
  usd_exchange_rate: number;
  fed_rate: number;
  pmi_manufacturing: number;
}
```

### LLM Explainer Prompt

```typescript
export const FORECAST_EXPLAINER_PROMPT = `
You are a senior freight market analyst providing rate outlook commentary for an international shipping platform.

## Quantitative Forecast
Lane: {origin} → {destination}, {container_type}
Current rate: ${current_rate}/container
4-week forecast: ${forecast_4w}/container ({forecast_4w_pct_change}%)
8-week forecast: ${forecast_8w}/container
12-week forecast: ${forecast_12w}/container

Confidence intervals (80%):
  4w: [${ci_4w_low}, ${ci_4w_high}]
  8w: [${ci_8w_low}, ${ci_8w_high}]

## Market Context
{market_context_json}

## Task
Write a 3–4 sentence market commentary explaining:
1. The primary driver of the forecasted rate movement
2. Key risks that could cause rates to move differently than forecast
3. One actionable recommendation for a shipper booking this lane

Use plain business language — no jargon. Be specific about the factors, not generic.
`;
```

### Evaluation Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| MAPE (Mean Absolute % Error) | < 12% at 4 weeks | Rolling out-of-sample test |
| Directional accuracy | > 70% | Correct up/down/flat call |
| Coverage (80% CI) | 75–85% | Actual rate within predicted interval |
| Explainer factual accuracy | > 90% | Manual review sample |

---

## 9. Agent 6: Anomaly Agent

### Model Approach: Isolation Forest + Rule Engine + LLM Explainer

Statistical anomaly detection (unsupervised) feeds an LLM that generates plain-language alert messages with recommended actions. No LLM is used for anomaly detection itself — only for alert generation (keeps cost very low: ~$0.0002 per alert).

### Anomaly Detection Pipeline

```typescript
// lib/agents/anomaly/detector.ts
import { IsolationForest } from "ml-matrix";  // Or custom implementation

const ANOMALY_DIMENSIONS: FeatureDimension[] = [
  // Rate anomalies
  { name: "rate_vs_lane_baseline", weight: 1.5 },
  { name: "rate_vs_30d_moving_avg", weight: 1.2 },

  // Transit time anomalies
  { name: "transit_vs_expected", weight: 1.3 },
  { name: "dwell_time_at_origin", weight: 1.0 },
  { name: "dwell_time_at_transshipment", weight: 1.4 },

  // Document anomalies
  { name: "value_vs_commodity_baseline", weight: 2.0 },  // High weight: fraud signal
  { name: "weight_vs_commodity_baseline", weight: 1.8 },
  { name: "hts_vs_description_match", weight: 1.6 },

  // Behavioral anomalies
  { name: "booking_volume_spike", weight: 1.1 },
  { name: "carrier_switch_frequency", weight: 0.8 },
];

export function detectAnomalies(
  shipments: ShipmentFeatureVector[],
  contamination: number = 0.05  // Expected anomaly rate
): AnomalyResult[] {
  const forest = new IsolationForest({ numTrees: 100, sampleSize: 256, contamination });
  forest.fit(shipments.map((s) => Object.values(s)));

  return shipments.map((shipment, i) => ({
    shipmentId: shipment.shipmentId,
    anomalyScore: forest.score(i),
    isAnomaly: forest.predict(i) === -1,
    dimensions: identifyAnomalousFeatures(shipment, forest),
  }));
}
```

### Alert Generation Prompt

```typescript
export const ANOMALY_ALERT_PROMPT = `
You are a logistics operations analyst. An automated system has flagged a shipment as anomalous.

## Shipment Details
{shipment_summary_json}

## Anomaly Signals Detected
{anomaly_signals_json}

## Historical Baseline
{baseline_comparison_json}

## Task
Write a concise alert (2–3 sentences) for the customer:
1. What specific anomaly was detected (use concrete numbers: "Your transit time is 8 days vs. your 5-day average")
2. What it might indicate (cause)
3. One specific recommended action

Tone: Professional, helpful, not alarmist. Avoid speculation without data.
Return JSON: {"alertTitle": "string", "alertBody": "string", "severity": "info|warning|critical", "recommendedAction": "string"}
`;
```

### Alert Severity Framework

| Severity | Trigger Conditions | Response Time |
|----------|--------------------|--------------|
| **critical** | OFAC match, missing ISF, customs hold, value discrepancy > 30% | Immediate push + email |
| **warning** | Transit delay > 3 days, rate spike > 25%, document gap | Email within 1 hour |
| **info** | Rate trend change, booking volume shift, carrier performance drop | Daily digest |

### Evaluation Metrics

| Metric | Target |
|--------|--------|
| Precision (anomalies that are real issues) | > 75% |
| Recall (real issues that are caught) | > 85% |
| Alert generation latency | < 500ms |
| False positive rate (info-level) | < 20% |
| Alert actionability rating (user survey) | > 4.2/5.0 |

---

## 10. RAG Pipeline Design

### Chunking Strategy

Different content types require different chunking strategies:

```typescript
// lib/agents/rag/chunker.ts
const CHUNKING_CONFIGS: Record<SourceType, ChunkConfig> = {
  "hts-code": {
    strategy: "structured",   // Each HTS code = one chunk
    includeParents: true,     // Include chapter + heading context
    maxChunkSize: 512,
  },
  "regulation": {
    strategy: "semantic",     // Split at paragraph/section boundaries
    maxChunkSize: 800,
    overlap: 100,             // 100 token overlap between chunks
    preserveSectionHeaders: true,
  },
  "rate-history": {
    strategy: "temporal",     // One chunk per week per lane
    aggregateFields: ["min", "max", "mean", "median"],
    maxChunkSize: 400,
  },
  "ruling": {
    strategy: "document",     // One chunk per CBP ruling
    maxChunkSize: 1200,
    extractFields: ["rulingNumber", "date", "htsCode", "decision"],
  },
  "carrier-schedule": {
    strategy: "structured",   // One chunk per vessel rotation
    maxChunkSize: 300,
  },
};
```

### Retrieval Augmentation Strategy

**Hybrid retrieval (semantic + keyword):**

```typescript
// lib/agents/rag/retriever.ts
export async function hybridRetrieve({
  query,
  agentId,
  sourceTypes,
  topK = 8,
}: HybridRetrieveParams): Promise<RetrievedDocument[]> {

  // Run semantic and keyword search in parallel
  const [semanticResults, keywordResults] = await Promise.all([
    semanticSearch({ agentId, query, topK: topK * 2, sourceTypes }),
    keywordSearch({ agentId, query, topK: topK * 2, sourceTypes }),
  ]);

  // Reciprocal Rank Fusion (RRF) to merge results
  return reciprocalRankFusion(semanticResults, keywordResults, { k: 60, topK });
}

function reciprocalRankFusion(
  list1: SearchResult[],
  list2: SearchResult[],
  { k, topK }: { k: number; topK: number }
): RetrievedDocument[] {
  const scores = new Map<string, number>();

  list1.forEach((doc, rank) => {
    scores.set(doc.id, (scores.get(doc.id) ?? 0) + 1 / (k + rank + 1));
  });
  list2.forEach((doc, rank) => {
    scores.set(doc.id, (scores.get(doc.id) ?? 0) + 1 / (k + rank + 1));
  });

  const allDocs = new Map([...list1, ...list2].map((d) => [d.id, d]));
  return [...scores.entries()]
    .sort(([, a], [, b]) => b - a)
    .slice(0, topK)
    .map(([id]) => allDocs.get(id)!);
}
```

### Context Window Management

```typescript
// lib/agents/rag/context-builder.ts
export function buildContext(
  documents: RetrievedDocument[],
  maxTokens: number = 8000  // Leave room for prompt + output
): string {
  let tokenCount = 0;
  const included: RetrievedDocument[] = [];

  for (const doc of documents) {
    const docTokens = estimateTokens(doc.content);
    if (tokenCount + docTokens > maxTokens) break;
    included.push(doc);
    tokenCount += docTokens;
  }

  return included
    .map((doc) => `[SOURCE: ${doc.sourceType}/${doc.sourceId}]\n${doc.content}`)
    .join("\n\n---\n\n");
}
```

---

## 11. Agent Memory and State Management

### Session Memory (Short-term)

Per-request context stored in Redis with 24-hour TTL. Enables multi-turn conversations within the same session (e.g., "refine the classification for item 3").

```typescript
// lib/agents/memory/session.ts
interface SessionMemory {
  sessionId: string;
  userId: string;
  agentId: string;
  turns: AgentTurn[];         // Full conversation history
  context: {                  // Persistent context for this session
    shipmentId?: string;
    activeHtsCode?: string;
    lastComplianceReport?: string;
    userPreferences?: Record<string, unknown>;
  };
  createdAt: string;
  lastActiveAt: string;
}

// Redis key: agent:session:{sessionId}
// TTL: 86400 seconds (24 hours)
```

### Organization Memory (Long-term)

Per-organization learned preferences and historical patterns stored in Postgres. Improves accuracy over time as the platform learns from each customer's shipment history.

```typescript
// lib/agents/memory/organization.ts
interface OrganizationMemory {
  organizationId: string;
  agentId: string;
  learnedPatterns: {
    preferredCarriers: Record<string, number>;    // carrier → preference score
    typicalLanes: LanePattern[];                  // Frequently booked O/D pairs
    commodityProfiles: CommodityProfile[];        // Products they ship + HTS codes
    complianceHistory: ComplianceEvent[];         // Past issues to watch for
    rateAcceptanceBehavior: RateAcceptance[];     // What rates they accept/reject
  };
  hitlFeedback: HITLFeedbackEntry[];             // Override history for fine-tuning
  updatedAt: string;
}
```

### Global State (Cross-organization)

Aggregated and anonymized signals that improve all customers' agents:

```
• Rate benchmarks per lane (aggregated, no customer data exposed)
• HTS classification accuracy improvements (from HITL overrides)
• Compliance rule coverage (regulation changes detected)
• Anomaly detection calibration (false positive rates by feature)
```

---

## 12. Tool and Function Calling Specifications

### Claude Tool Definitions

Each agent exposes tools via Claude's function calling API. This enables agents to fetch live data mid-inference rather than front-loading all context.

```typescript
// lib/agents/tools/definitions.ts

// Used by: Cost Optimization, Forecast
export const GET_CURRENT_RATES_TOOL: Tool = {
  name: "get_current_rates",
  description: "Get current market freight rates for a specific lane from the Freightos Baltic Exchange index",
  input_schema: {
    type: "object",
    properties: {
      originLocode: { type: "string", description: "UN/LOCODE of origin port (e.g., VNSGN)" },
      destinationLocode: { type: "string", description: "UN/LOCODE of destination port (e.g., USLAX)" },
      containerType: { type: "string", enum: ["20ft", "40ft", "40ft-hc"] },
    },
    required: ["originLocode", "destinationLocode", "containerType"],
  },
};

// Used by: Compliance, HTS Classification
export const SEARCH_CBP_RULINGS_TOOL: Tool = {
  name: "search_cbp_rulings",
  description: "Search CBP CROSS database for binding ruling precedents on a product or HTS code",
  input_schema: {
    type: "object",
    properties: {
      query: { type: "string", description: "Product description or HTS code to search" },
      htsCodes: { type: "array", items: { type: "string" }, description: "Optional: specific HTS codes to filter" },
      limit: { type: "number", default: 5 },
    },
    required: ["query"],
  },
};

// Used by: Anomaly, Customer Success
export const GET_SHIPMENT_HISTORY_TOOL: Tool = {
  name: "get_shipment_history",
  description: "Retrieve historical shipment data for anomaly baseline comparison",
  input_schema: {
    type: "object",
    properties: {
      organizationId: { type: "string" },
      lane: { type: "object", properties: { origin: { type: "string" }, destination: { type: "string" } } },
      lookbackDays: { type: "number", default: 90 },
      metrics: { type: "array", items: { type: "string" }, description: "Fields to aggregate" },
    },
    required: ["organizationId"],
  },
};

// Used by: Compliance
export const CHECK_OFAC_TOOL: Tool = {
  name: "check_ofac_sanctions",
  description: "Screen parties and goods against OFAC sanctions lists",
  input_schema: {
    type: "object",
    properties: {
      parties: { type: "array", items: { type: "string" }, description: "Party names to screen" },
      countryCode: { type: "string" },
      htsCode: { type: "string" },
    },
    required: ["parties"],
  },
};
```

### Tool Execution Handler

```typescript
// lib/agents/tools/executor.ts
export async function executeToolCall(
  toolName: string,
  toolInput: unknown,
  context: AgentContext
): Promise<ToolResult> {
  const handler = TOOL_HANDLERS[toolName];

  if (!handler) {
    return { error: `Unknown tool: ${toolName}`, isError: true };
  }

  const validated = handler.schema.safeParse(toolInput);
  if (!validated.success) {
    return { error: `Invalid tool input: ${validated.error.message}`, isError: true };
  }

  // Rate limit tool calls per agent invocation (prevent runaway loops)
  if (context.toolCallCount >= MAX_TOOL_CALLS_PER_INVOCATION) {
    return { error: "Tool call limit reached", isError: true };
  }

  context.toolCallCount++;
  return handler.execute(validated.data, context);
}

const MAX_TOOL_CALLS_PER_INVOCATION = 8;
```

---

## 13. Testing Strategy

### Unit Tests

```
Coverage target: > 80% lines across agent code

Focus areas:
  • Prompt template rendering (correct variable substitution)
  • Schema validation (Zod schemas for inputs/outputs)
  • Tool call handlers (mock LLM responses)
  • Feature engineering (anomaly features, rate features)
  • Chunking and context building
  • HITL threshold logic
  • Cost tracking calculations

Framework: Vitest (fast, TypeScript-native)
Mock strategy: Mock at the LLM API boundary — never mock internal agent logic
```

```typescript
// __tests__/agents/hts-classification.test.ts
describe("HTS Classification Agent", () => {
  it("returns high confidence for well-known products", async () => {
    const mockEmbeddings = [/* test embeddings */];
    const result = await classifyHTS({
      productDescription: "iPhone 16 Pro Max, 256GB, titanium finish",
      countryOfOrigin: "CN",
    }, { mockEmbeddings });

    expect(result.htsCode).toMatch(/^8517\.13/);  // Smartphones chapter
    expect(result.confidence).toBeGreaterThan(0.90);
    expect(result.flagForReview).toBe(false);
  });

  it("escalates to HITL for ambiguous dual-use goods", async () => {
    const result = await classifyHTS({
      productDescription: "Electronic control unit with signal encryption capability",
      countryOfOrigin: "CN",
    });
    expect(result.flagForReview).toBe(true);
    expect(result.confidence).toBeLessThan(0.85);
  });
});
```

### Integration Tests

```
Test real agent pipelines with:
  • Seeded pgvector database (test embeddings subset)
  • Stubbed LLM responses (recorded and replayed via MSW)
  • Real Redis instance (Docker Compose in CI)
  • Real Postgres instance (Docker Compose in CI)

Key integration scenarios:
  • Full HTS classification pipeline (embed → search → classify → validate)
  • Document extraction → compliance check handoff
  • Anomaly detection → alert generation pipeline
  • HITL queue creation and retrieval
  • Usage metering persistence
```

### Evaluation (LLM Output Quality)

```typescript
// scripts/eval/run-eval.ts
// Run offline: npm run eval -- --agent hts-classification --dataset test-500

interface EvalCase {
  id: string;
  input: unknown;
  expectedOutput: unknown;       // Ground truth
  tags: string[];                // e.g., ["electronics", "chapter-84", "high-confidence"]
}

interface EvalResult {
  caseId: string;
  passed: boolean;
  score: number;                 // 0.0–1.0 per rubric
  details: Record<string, boolean>;  // Per-criterion breakdown
  actualOutput: unknown;
  latencyMs: number;
  costUSD: number;
}
```

**Evaluation datasets (per agent):**

| Agent | Dataset Size | Source | Update Frequency |
|-------|-------------|--------|-----------------|
| HTS Classification | 500 products | USITC + CBP rulings | Quarterly |
| Cost Optimization | 200 shipment scenarios | Manual by logistics expert | Quarterly |
| Compliance | 300 shipments (known pass/fail) | Historical incidents + CBP data | Quarterly |
| Document Extraction | 400 real documents | Customer-consented samples | Monthly |
| Forecast | 24 months backtest | Historical FBX rates | Monthly |
| Anomaly Detection | 1000 shipments (labeled) | Platform history + injected anomalies | Monthly |

### End-to-End Tests (Playwright)

Cover full user-facing workflows:
- User submits HTS classification request → sees result in UI
- Compliance check returns warning → user sees alert + recommended action
- Document upload → extraction result → discrepancy flag displayed
- Anomaly alert generated → appears in notification center

---

## 14. Evaluation Metrics and Benchmarking Framework

### Universal Agent Metrics

Tracked for all agents via Prometheus:

```
agent_request_total{agent_id, status}           — Request volume
agent_request_duration_seconds{agent_id, p50/p95/p99}  — Latency
agent_tokens_total{agent_id, direction}         — Token usage
agent_cost_usd_total{agent_id}                  — Inference cost
agent_cache_hit_ratio{agent_id}                 — Cache effectiveness
agent_hitl_escalation_ratio{agent_id}           — Escalation rate
agent_error_rate{agent_id, error_code}          — Error frequency
```

### Quality Score Dashboard

Automated weekly quality report comparing current week vs. previous week + 4-week rolling average:

```typescript
interface WeeklyQualityReport {
  agent: AgentId;
  weekOf: string;
  metrics: {
    accuracy: { current: number; rolling4w: number; delta: number };
    latencyP95: { current: number; rolling4w: number; delta: number };
    costPerCall: { current: number; rolling4w: number; delta: number };
    hitlRate: { current: number; rolling4w: number; delta: number };
    userRating: { current: number; rolling4w: number; delta: number };
  };
  regressions: string[];   // Automatically flagged degradations > 5%
  improvements: string[];
}
```

### A/B Testing Framework

```typescript
// lib/agents/experiments/ab-test.ts
interface AgentExperiment {
  experimentId: string;
  agentId: AgentId;
  variants: {
    control: AgentConfig;
    treatment: AgentConfig;
  };
  trafficSplit: number;    // 0.0–1.0, portion going to treatment
  startDate: string;
  endDate: string;
  primaryMetric: string;   // Metric to optimize
  guardrailMetrics: string[]; // Metrics that must not degrade
  minimumDetectableEffect: number;  // % change to detect
}
```

---

## 15. Cost Optimization Strategies

### Model Routing

```
Request characteristics → Model selection:
  • Simple classification, < 500 tokens → Claude Haiku ($0.00025/1K input)
  • Standard reasoning, 500–4000 tokens → Claude Sonnet ($0.003/1K input)
  • Complex multi-step, tool use, > 4000 tokens → Claude Sonnet ($0.003/1K input)
  • Embeddings (all) → OpenAI text-embedding-3-large ($0.00013/1K tokens)
```

### Semantic Caching

```typescript
// lib/agents/cache/semantic-cache.ts
// Cache LLM responses for near-identical inputs
// Avoids re-running expensive LLM calls for duplicate/near-duplicate queries

export async function getCachedOrCompute<T>(
  input: string,
  compute: () => Promise<T>,
  options: {
    agentId: string;
    similarityThreshold: number;   // 0.95 = very strict, 0.85 = looser
    ttlSeconds: number;
  }
): Promise<{ result: T; cacheHit: boolean }> {
  const inputEmbedding = await embed([input]);

  const cached = await db.execute(sql`
    SELECT result, 1 - (embedding <=> ${inputEmbedding[0]}::vector) as similarity
    FROM agent_response_cache
    WHERE agent_id = ${options.agentId}
      AND 1 - (embedding <=> ${inputEmbedding[0]}::vector) > ${options.similarityThreshold}
      AND expires_at > NOW()
    ORDER BY embedding <=> ${inputEmbedding[0]}::vector
    LIMIT 1
  `);

  if (cached.rows.length > 0) {
    return { result: cached.rows[0].result as T, cacheHit: true };
  }

  const result = await compute();

  // Store in cache
  await db.insert(agentResponseCache).values({
    agentId: options.agentId,
    inputHash: hashInput(input),
    embedding: inputEmbedding[0],
    result: JSON.stringify(result),
    expiresAt: new Date(Date.now() + options.ttlSeconds * 1000),
  });

  return { result, cacheHit: false };
}
```

### Request Batching

```typescript
// lib/agents/batching/batcher.ts
// Accumulate requests over 100ms window, process together
// Reduces per-request overhead by 40–60% for high-volume agents (Anomaly, HTS)

class RequestBatcher<TInput, TOutput> {
  private queue: Array<{ input: TInput; resolve: (v: TOutput) => void }> = [];
  private timer: NodeJS.Timeout | null = null;

  constructor(
    private processBatch: (inputs: TInput[]) => Promise<TOutput[]>,
    private maxBatchSize: number = 20,
    private windowMs: number = 100
  ) {}

  async add(input: TInput): Promise<TOutput> {
    return new Promise((resolve) => {
      this.queue.push({ input, resolve });
      if (this.queue.length >= this.maxBatchSize) {
        this.flush();
      } else if (!this.timer) {
        this.timer = setTimeout(() => this.flush(), this.windowMs);
      }
    });
  }

  private async flush() {
    if (this.timer) { clearTimeout(this.timer); this.timer = null; }
    const batch = this.queue.splice(0, this.maxBatchSize);
    const results = await this.processBatch(batch.map((b) => b.input));
    batch.forEach((item, i) => item.resolve(results[i]));
  }
}
```

### Cost Budget Controls

```typescript
// lib/agents/cost/budget-guard.ts
// Hard stop if organization exceeds monthly AI spend budget

export async function checkBudgetAndProceed(
  organizationId: string,
  estimatedCost: number
): Promise<void> {
  const usage = await getMonthlyUsage(organizationId);
  const budget = await getOrganizationBudget(organizationId);

  if (usage.totalCostUSD + estimatedCost > budget.hardLimitUSD) {
    throw new BudgetExceededError(
      `Monthly AI budget of $${budget.hardLimitUSD} would be exceeded.`
    );
  }

  if (usage.totalCostUSD + estimatedCost > budget.softLimitUSD) {
    await notifyBudgetWarning(organizationId, usage, budget);
  }
}
```

### Estimated Cost Per Agent Call (Production)

| Agent | Avg Cost/Call | Primary Cost Driver |
|-------|--------------|-------------------|
| HTS Classification | $0.001–0.004 | Tier 1: embeddings only; Tier 3: Sonnet |
| Cost Optimization | $0.012–0.025 | Sonnet + tool calls + market data retrieval |
| Compliance | $0.015–0.040 | Sonnet + large regulation context |
| Document Extraction | $0.008–0.018 | Vision model + multi-page docs |
| Forecast | $0.003–0.008 | ML inference + Haiku explainer |
| Anomaly Detection | $0.001–0.003 | ML only + Haiku alert generation |

---

## 16. Production Deployment and Monitoring

### Infrastructure

```yaml
# Production agent infrastructure

compute:
  - service: agent-gateway
    replicas: 2
    memory: 512MB
    cpu: 0.5 vCPU

  - service: agent-workers (BullMQ processors)
    replicas: 3        # Scale based on queue depth
    memory: 1GB
    cpu: 1 vCPU
    autoscale:
      minReplicas: 2
      maxReplicas: 8
      scaleUpAt: "queue_depth > 50"
      scaleDownAt: "queue_depth < 10 for 5m"

database:
  - postgres: Neon (serverless, auto-scale)
  - redis: Upstash (serverless, 256MB free tier → Standard for prod)

storage:
  - documents: Cloudflare R2 (S3-compatible, cheaper egress)
  - model-artifacts: R2 (Prophet models, ML artifacts)
  - embeddings-backup: R2 weekly snapshot
```

### Observability Stack

```
Metrics:    Prometheus → Grafana (dashboards per agent)
Logging:    Structured JSON → Axiom (searchable, cost-effective vs. Datadog)
Tracing:    OpenTelemetry → Jaeger (trace full agent request chain)
Alerting:   Grafana alerts → PagerDuty (on-call rotation)
Error tracking: Sentry (SDK errors, unhandled exceptions)
```

### Grafana Dashboards

One dashboard per agent, each showing:
- Request rate and error rate (RED method)
- Latency distribution (p50, p95, p99)
- Token usage and cost trend
- Cache hit ratio
- HITL escalation rate
- Quality score trend (linked to weekly eval results)

### Rollout Strategy

```
Phase 1 (Internal beta):
  → 5 design partner organizations
  → All agents at "suggest only" mode (no auto-actions)
  → Manual HITL review on 100% of outputs
  → 4 weeks data collection

Phase 2 (Limited GA):
  → 50 organizations
  → Auto-approval enabled above confidence thresholds
  → HITL on < 10% of calls
  → A/B testing begins

Phase 3 (GA):
  → All customers
  → Full automation within compliance-safe bounds
  → Compliance agent always HITL for critical findings
  → Monthly eval runs, regression alerts automated
```

### Model Versioning

```typescript
// lib/agents/versioning.ts
// Each agent configuration is versioned — enables rollback without code deploy

interface AgentVersion {
  agentId: AgentId;
  version: string;              // semver: "1.2.3"
  promptTemplate: string;       // Versioned prompt text
  modelId: string;              // e.g., "claude-sonnet-4-5"
  schemaVersion: string;        // Input/output schema version
  evaluationScore: number;      // Score on eval dataset
  deployedAt: string;
  rolledBackAt: string | null;
}

// Rollback: update deployedVersion in DB → all new requests use previous config
// No code redeploy required for prompt/model changes
```

### Incident Response

| Incident Type | Detection | Response |
|--------------|-----------|---------|
| Agent error rate > 5% | Grafana alert (1m window) | Auto-rollback to last stable version |
| Accuracy regression > 10% | Weekly eval report | Manual investigation + revert |
| Cost spike > 3x baseline | Budget monitor | Automatic rate limiting + alert |
| OFAC false negative | Compliance audit | Immediate HITL lockdown on affected cases |
| Regulation database stale | Change detector alert | Force re-embed + notify compliance officer |

---

*Document prepared for Phase 3 engineering gate review. Companion to [AI-AGENTS-PLAN.md](./AI-AGENTS-PLAN.md). Questions: AI Acrobatics Engineering (agent fleet).*

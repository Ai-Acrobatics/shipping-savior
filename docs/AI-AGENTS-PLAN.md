# AI Agent Development Plans — Shipping Savior Platform

**Linear:** AI-5435
**Phase:** 2 — Planning
**Last Updated:** 2026-03-27
**Status:** Planning Complete — Ready for Phase 3 Gate Review
**Author:** AI Acrobatics Engineering

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Agent Overview Matrix](#2-agent-overview-matrix)
3. [Agent 1: Rate Negotiation AI](#3-agent-1-rate-negotiation-ai)
4. [Agent 2: FTZ Classification Agent](#4-agent-2-ftz-classification-agent)
5. [Agent 3: Compliance Monitor](#5-agent-3-compliance-monitor)
6. [Agent 4: Document Processing Agent](#6-agent-4-document-processing-agent)
7. [Agent 5: Route Optimization Agent](#7-agent-5-route-optimization-agent)
8. [Agent 6: Backhaul Finder](#8-agent-6-backhaul-finder)
9. [Agent 7: Customer Success Agent](#9-agent-7-customer-success-agent)
10. [Agent Orchestration Architecture](#10-agent-orchestration-architecture)
11. [Cross-Agent Data Flow](#11-cross-agent-data-flow)
12. [Training Data Strategy](#12-training-data-strategy)
13. [Infrastructure Requirements](#13-infrastructure-requirements)
14. [Cost Estimation Summary](#14-cost-estimation-summary)
15. [Development Timeline](#15-development-timeline)
16. [Risk Register](#16-risk-register)

---

## 1. Executive Summary

Shipping Savior's AI layer consists of seven specialized agents that automate and augment the manual workflows performed by freight brokers, importers, and logistics operators. Each agent owns a distinct problem domain — from carrier rate negotiation through customer anomaly alerting — and together they form a coordinated intelligence layer that replaces spreadsheets, manual research, and institutional knowledge locked in individual brokers.

### Why Seven Specialized Agents (Not One)

A single "logistics AI" would be too broad to be accurate, too expensive to run on every interaction, and impossible to evaluate with a single metric. Specialized agents allow:

- **Domain-specific data** — Each agent can be RAG-augmented or fine-tuned with highly relevant training data
- **Independent evaluation** — Rate negotiation accuracy is different from backhaul yield; separate metrics enable continuous improvement
- **Incremental rollout** — Ship Agent 1 (Rate Negotiation) in MVP, add agents progressively without rewrites
- **Cost control** — Light agents (rule-based + embeddings) for classification; heavy agents (LLM reasoning) only where judgment is required
- **Fail isolation** — If the Compliance Monitor has an issue, Rate Negotiation still runs

### Technology Tier Model

| Tier | Description | Agents | Stack |
|------|-------------|--------|-------|
| **Tier 1** | Structured rules + embeddings | FTZ Classification, Document Processing | OpenAI embeddings + pgvector + rule engine |
| **Tier 2** | RAG + LLM with structured output | Rate Negotiation, Compliance Monitor, Route Optimization | Claude Sonnet + retrieval + Zod validation |
| **Tier 3** | Hybrid ML + LLM + event-driven | Backhaul Finder, Customer Success | Time-series ML + LLM + webhook triggers |

### Revenue Impact Framing

These agents are not cost centers — they are the product's core defensible moat. A broker who saves $4,200/month on freight via Rate Negotiation recommendations will never churn. An importer whose Compliance Monitor prevents a $40,000 customs hold will evangelize the platform. The agents generate measurable ROI that funds subscription revenue.

---

## 2. Agent Overview Matrix

| # | Agent | Primary Value | Model Approach | MVP Ship | v1 Ship | Est. Dev Cost |
|---|-------|--------------|----------------|----------|---------|--------------|
| 1 | Rate Negotiation AI | 15–25% freight cost savings through carrier leverage identification | Claude Sonnet + RAG over rate/market data | Q3 2026 | Q4 2026 | $28K–$42K |
| 2 | FTZ Classification Agent | Auto-classify goods for FTZ eligibility; compute duty deferral value | Embeddings + HTS rules + Claude fallback | Q3 2026 | Q4 2026 | $22K–$32K |
| 3 | Compliance Monitor | Real-time regulatory change detection; pre-shipment compliance scoring | Claude Sonnet + rule engine + CBP/FDA RAG | Q4 2026 | Q1 2027 | $32K–$48K |
| 4 | Document Processing Agent | Parse BOLs, invoices, customs forms; extract structured data | Claude Sonnet Vision + extraction schema | Q3 2026 | Q4 2026 | $18K–$28K |
| 5 | Route Optimization Agent | Multi-modal routing with cost/speed/risk tradeoff modeling | Claude Sonnet + searoute + carrier APIs | Q4 2026 | Q1 2027 | $30K–$45K |
| 6 | Backhaul Finder | Identify backhaul opportunities to reduce carrier deadhead costs | Carrier schedule scraper + matching algorithm + LLM | Q4 2026 | Q1 2027 | $25K–$38K |
| 7 | Customer Success Agent | Proactive anomaly alerts; shipment health monitoring | Isolation Forest + LLM explainer + event triggers | Q1 2027 | Q2 2027 | $20K–$30K |

**Total estimated development cost (all 7 agents, MVP through Production):** $175K–$263K over 18 months

---

## 3. Agent 1: Rate Negotiation AI

### Purpose and Business Value

Analyzes carrier quotes against market benchmarks, vessel availability, and backhaul signals to recommend counter-offers and negotiation strategies. Replaces the founder's manual process of calling 3–5 carriers and relying on relationship-based judgment.

**Business value:**
- Average broker saves 15–25% on quoted rates via leverage identification
- Backhaul signal detection alone yields $800–$4,200/shipment savings on qualifying lanes
- Converts negotiation experience from a human skill bottleneck into a systemized workflow
- Every saved dollar is a trackable, attributable ROI data point the platform can display

### Input / Output Specification

**Input:**
```typescript
interface RateNegotiationRequest {
  shipment: {
    origin: string;                    // UN/LOCODE, e.g., "VNSGN"
    destination: string;               // e.g., "USLAX", "USSEA", "USNYC"
    containerType: "20ft" | "40ft" | "40ft-hc" | "reefer-20ft" | "reefer-40ft";
    cargoType: "cold-chain" | "general" | "hazmat";
    targetShipDate: string;            // ISO date
    flexibleDates: boolean;
    urgency: "standard" | "expedited" | "economy";
    weightKg?: number;
    commodityCategory?: string;
  };
  incomingQuotes: CarrierQuote[];      // One or more quotes to evaluate
  context?: {
    customerRelationshipAge?: number;  // Months as customer of this carrier
    annualVolumeWithCarrier?: number;  // Containers/year
    priorNegotiations?: PriorNegotiation[];
  };
}

interface CarrierQuote {
  carrier: string;
  quotedRateUSD: number;
  transitDays: number;
  validUntil: string;
  includesSurcharges: boolean;
  surchargeDetails?: SurchargeItem[];
  vesselName?: string;
  sailingDate?: string;
  routeViaTransshipment?: boolean;
}
```

**Output:**
```typescript
interface RateNegotiationResult {
  analysis: {
    marketBenchmark: number;           // USD — current market rate for this lane
    quoteVsBenchmark: number;          // % above or below market
    backhaulOpportunity: boolean;      // Is vessel returning empty? Leverage available?
    backhaulConfidence: "high" | "medium" | "low";
    marketTrend: "rising" | "stable" | "falling";
    optimalTimingWindow?: string;      // e.g., "Ship in next 2 weeks for better rates"
  };
  recommendation: {
    targetCounterOfferUSD: number;     // Specific counter to propose
    walkawayPriceUSD: number;          // Max acceptable rate
    negotiationScript: string;         // Ready-to-use carrier conversation script
    anchorStrategy: string;            // e.g., "Open with $2,800 — expect to settle ~$3,200"
    leveragePoints: string[];          // Specific arguments: backhaul, volume, timing
  };
  alternatives: RouteAlternative[];    // 2–3 alternative carrier/routing options
  estimatedSavings: {
    vsLowestQuote: number;             // USD
    vsMarketHigh: number;              // USD
    vsMarketAverage: number;           // USD
  };
  confidenceLevel: "high" | "medium" | "low";
  dataAsOf: string;
}
```

### Model Selection

**Primary:** Claude Sonnet 3.5 with RAG over:
- Freightos Baltic Exchange (FBX) rate index (weekly)
- Platform's internal quote history (proprietary, grows over time)
- Carrier schedule database (vessel return patterns, backhaul signals)
- Port congestion alerts (LA/LB, Seattle, NY/NJ)

**Why Claude over GPT-4 or fine-tuned model:**
- Negotiation script generation requires nuanced language reasoning
- Market interpretation ("they have 3 empty reefers returning from Seattle — leverage that") benefits from LLM judgment
- No labeled dataset of "optimal negotiation outcomes" exists for supervised training
- Structured JSON output via Zod validation is reliable with Claude function calling

**Why not fine-tuned:**
- Insufficient labeled training data at launch
- Market conditions change too rapidly for fine-tuning cycles
- RAG allows rate data to update without model retraining

### Training Data Requirements

| Data Source | Volume | Acquisition | Refresh |
|-------------|--------|------------|---------|
| FBX rate index (13 trade lanes) | Historical 5 years | Freightos public API | Weekly |
| Xeneta benchmark indices | Historical 3 years | Public data | Monthly |
| Carrier schedule data (Maersk, CMA, MSC, COSCO, ONE) | Current + rolling 12mo | Carrier APIs + static | Weekly |
| Platform quote history (internal) | 0 at launch → grows | User submissions | Real-time |
| Port congestion signals | Current | MarineTraffic, Marine Exchange | Daily |

### Integration Points

- **Route Optimization Agent** — Feeds routing options for cost comparison
- **Backhaul Finder** — Backhaul signals consumed by negotiation leverage analysis
- **Route Comparison Tool** — Powers the UI carrier comparison with negotiation recommendations
- **FTZ Savings Analyzer** — FTZ routing recommendations when FTZ strategy is active
- **GHL CRM** — Pushes negotiation recommendations to customer record for broker follow-up

### Accuracy / Performance Targets

| Metric | MVP Target | v1 Target | Production Target |
|--------|-----------|-----------|------------------|
| Market rate accuracy (vs. FBX) | ± 12% | ± 7% | ± 5% |
| Negotiation savings identified vs. first quote | — | 12–18% | 18–25% |
| Response latency (p50) | < 10s | < 6s | < 4s |
| User acceptance rate of counter-offer recommendation | — | 45% | 60% |
| Backhaul detection precision | — | 70% | 85% |

### Development Timeline and Cost Estimate

**MVP (Q3 2026) — 7 weeks — $14K–$20K**
- Compile FBX + Xeneta static rate data for top 15 SE Asia → US trade lanes
- Implement Claude RAG with carrier rate context
- Basic negotiation script generation
- API: `POST /api/agents/rate-negotiation`
- UI integration with quote input form

**v1 (Q4 2026) — 10 weeks — $14K–$22K**
- Live Maersk + CMA CGM API integration for real vessel schedules
- Backhaul signal detection algorithm
- Port congestion integration
- Internal quote history database (proprietary data begins accumulating)
- Confidence calibration from user acceptance tracking

**Production (Q2 2027) — 8 weeks (included in v1 cost range above)**
- Real-time rate indexing from 5+ carrier APIs
- Automated carrier outreach email drafting
- Scenario comparison: show 3 negotiation strategies side-by-side
- A/B testing framework for script variations

### Risk and Fallback Strategy

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|-----------|
| Carrier rate data is stale | Medium | High | Cache with timestamp; show data age; fallback to FBX index |
| Claude hallucinated market figure | Low | High | All rate figures sourced from indexed data, not Claude memory; citations required |
| Carrier API rate limits | Medium | Medium | Implement retry/cache layer; static fallback data |
| User ignores recommendations | High (early) | Medium | Track outcomes; adjust recommendation framing based on acceptance data |

**Fallback:** If live carrier data unavailable, surface FBX index benchmarks with "Market estimate — verify with carrier" disclaimer.

---

## 4. Agent 2: FTZ Classification Agent

### Purpose and Business Value

Automatically classifies imported goods for Foreign Trade Zone (FTZ) eligibility, computes duty deferral and manipulation potential, and recommends whether to elect Privileged Foreign (PF) or Non-Privileged Foreign (NPF) status per shipment.

**Business value:**
- FTZ users save 15–40% on import duties through deferral, manipulation, and inverted tariff strategy
- Broker who recommends FTZ strategy wins clients away from competitors who lack the tool
- Consultative FTZ analysis at $3K–$12K/engagement becomes systematized and repeatable at scale
- April 2025 tariff environment makes FTZ urgency acute — thousands of importers newly eligible

### Input / Output Specification

**Input:**
```typescript
interface FTZClassificationRequest {
  products: FTZProduct[];
  destination: {
    ftzZoneNumber?: string;            // If known — e.g., "FTZ #23"
    state: string;                     // Used to identify nearest FTZ
    targetPort: string;                // UN/LOCODE
  };
  importerProfile?: {
    annualImportValueUSD: number;
    annualContainerCount: number;
    primaryHtsChapters: string[];      // HTS chapters they typically import
    currentFtzUser: boolean;
  };
  tariffScenario?: "current" | "pre-april-2025" | "full-section301";
}

interface FTZProduct {
  productDescription: string;
  htsCode?: string;                    // If already classified
  countryOfOrigin: string;
  annualImportValueUSD: number;
  annualVolumeUnits: number;
  unitValue: number;
  manipulationIntended?: boolean;      // Will product be further processed in FTZ?
  exportFraction?: number;             // % of imported goods re-exported (0–1)
}
```

**Output:**
```typescript
interface FTZClassificationResult {
  ftzEligible: boolean;
  eligibilityRationale: string;
  products: FTZProductResult[];
  aggregateSavings: {
    annualDutySavingsUSD: number;
    dutyDeferralValueUSD: number;      // NPV of deferral benefit
    manipulationSavingsUSD: number;    // Savings from invoiced zone → consumption entry
    breakEvenMonthsToImplement: number;
    recommendedFtzZone: FTZZone;
  };
  strategy: {
    electionRecommendation: "PF" | "NPF" | "mixed" | "neither";
    electionRationale: string;
    withdrawalScheduleRecommendation: string;
    invertedTariffOpportunity: boolean;
    invertedTariffDetail?: string;
  };
  implementationSteps: FTZStep[];
  alternativeStrategies: string[];    // e.g., "Consider Section 321 de minimis if unit value < $800"
  dataAsOf: string;
  disclaimer: string;
}
```

### Model Selection

**Primary:** Embedding search + rule engine + Claude Sonnet fallback

**Why tiered approach:**
- FTZ eligibility is primarily rule-based (HTS code + CBP FTZ regulations)
- Duty calculation is deterministic — rates from USITC DataWeb, no LLM needed
- PF vs. NPF election analysis benefits from LLM reasoning over the importer's specific product mix
- Inverted tariff detection requires comparing component duty rates vs. assembled product rates — analytical, not generative

**Architecture:**
```
FTZClassificationRequest
  -> HTS code lookup (if missing, call HTS Classification agent from .planning/prds/AI-AGENT-PLANS.md)
  -> Rule engine: FTZ eligibility check (CBP 19 CFR Part 146)
  -> Duty rate lookup: USITC DataWeb (MFN + SE Asia special rates)
  -> PF/NPF savings calculation (deterministic financial model)
  -> Inverted tariff detection (component rates vs. assembled rate)
  -> Claude Sonnet: strategy recommendation + plain-language explanation
     "Given this importer's product mix and the following duty data [context],
      recommend PF vs. NPF election with rationale."
  -> Structured output validation via Zod
```

### Training Data Requirements

| Data Source | Volume | Acquisition | Refresh |
|-------------|--------|------------|---------|
| USITC HTS Schedule + duty rates | 100K+ entries | hts.usitc.gov JSON download | Annual + interim |
| CBP FTZ regulations (19 CFR Part 146) | ~200 pages | CBP.gov PDF | Quarterly review |
| NAFTZ active FTZ zone list | ~260 active zones | naftz.org + CBP | Quarterly |
| SE Asia tariff rates (VN, TH, ID, KH) | Rate tables | USITC DataWeb | Quarterly |
| Section 301 surcharge lists | 4 lists | USTR.gov | As published |
| Platform FTZ analysis history (internal) | 0 at launch → grows | User submissions | Real-time |

### Integration Points

- **Rate Negotiation AI** — FTZ routing adds cost to landed cost; informs negotiation baseline
- **HTS Classification Agent** — FTZ classification depends on accurate HTS codes
- **Compliance Monitor** — FTZ-specific compliance requirements (CBP FTZ admission, bond)
- **FTZ Savings Analyzer UI** — Powers the existing proposal site calculator
- **FTZ Savings Modeler (full platform)** — PRD-APP-05 — the full SaaS version of the tool
- **Executive Dashboard** — FTZ savings summary card

### Accuracy / Performance Targets

| Metric | MVP Target | v1 Target | Production Target |
|--------|-----------|-----------|------------------|
| Eligibility determination accuracy | 90% | 95% | 98% |
| Duty savings calculation accuracy (vs. manual) | ± 8% | ± 4% | ± 2% |
| PF/NPF recommendation agreement with CBP customs expert | — | 75% | 88% |
| Response latency (p50) | < 8s | < 4s | < 2s |
| Inverted tariff detection recall | — | 70% | 85% |

### Development Timeline and Cost Estimate

**MVP (Q3 2026) — 6 weeks — $10K–$14K**
- USITC HTS + duty rate database integration
- FTZ eligibility rule engine (19 CFR Part 146)
- PF/NPF savings calculation (deterministic)
- Claude strategy recommendation layer
- API: `POST /api/agents/ftz-classify`
- UI integration with FTZ Savings Analyzer

**v1 (Q4 2026) — 8 weeks — $12K–$18K**
- Inverted tariff detection algorithm
- Section 301 exclusion + List 4A analysis
- Multiple-product portfolio optimization (not just per-item)
- FTZ zone finder by state + proximity
- Withdrawal scheduling recommendation

**Production (Q1 2027) — 6 weeks (in v1 cost range)**
- Tariff scenario modeling (current vs. pre-April 2025 vs. projected)
- CBP FTZ admission document generation
- Bond requirement calculator
- Integration with CBP e-CFR live regulation updates

### Risk and Fallback Strategy

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|-----------|
| HTS code inaccurate → wrong FTZ analysis | Medium | High | Flag dependency; require human review if HTS confidence < 0.80 |
| Tariff rates change (policy-driven) | High | High | Daily USTR/CBP change monitoring; versioned rate snapshots |
| FTZ zone closes or restrictions change | Low | Medium | Quarterly NAFTZ zone list refresh; alert on zone changes |
| Over-optimization recommendation (audit risk) | Low | High | Always include "consult licensed customs broker" disclaimer |

---

## 5. Agent 3: Compliance Monitor

### Purpose and Business Value

Watches regulatory databases (CBP, FDA, USDA, FTC, OFAC, CPSC) for changes affecting customer shipment profiles, scores pre-shipment compliance risk, and proactively alerts brokers and importers before a non-compliant shipment departs.

**Business value:**
- One caught compliance violation prevents $10K–$100K+ in customs holds, fines, and destroyed goods
- Proactive alerts turn the platform from reactive tool to trusted risk management layer
- Regulatory change monitoring is too complex and dynamic for manual broker tracking
- Strong compliance posture is a top-3 buying criterion for mid-market importers

### Input / Output Specification

**Input:**
```typescript
interface ComplianceMonitorRequest {
  product: {
    htsCode: string;
    description: string;
    countryOfOrigin: string;
    manufacturer?: string;
    materials?: string[];
    intendedUse: "consumer" | "commercial" | "industrial" | "food" | "medical";
    isPerishable?: boolean;
    requiresRefrigeration?: boolean;
    estimatedCBPValue: number;         // USD customs value
  };
  shipment: {
    importerName: string;
    importerEIN?: string;
    exporterName: string;
    exporterCountry: string;
    originPort: string;                // UN/LOCODE
    destinationPort: string;           // UN/LOCODE
    estimatedArrival?: string;
    containerCount: number;
  };
  documentation: {
    hasCommercialInvoice: boolean;
    hasPackingList: boolean;
    hasISF: boolean;                   // Importer Security Filing (10+2)
    hasCertificateOfOrigin: boolean;
    hasBillOfLading: boolean;
    hasPhytosanitaryCert?: boolean;
    hasFDAPriorNotice?: boolean;
    hasCBPBond?: boolean;
  };
  mode: "pre-shipment" | "monitor" | "change-alert";
}
```

**Output:**
```typescript
interface ComplianceMonitorResult {
  overallStatus: "compliant" | "review-required" | "non-compliant" | "blocked";
  riskScore: number;                   // 0–100 (100 = highest risk)
  checks: ComplianceCheckItem[];
  blockers: ComplianceIssue[];         // Must resolve before shipping
  warnings: ComplianceIssue[];         // Review recommended
  missingDocuments: DocumentRequirement[];
  agencyRequirements: {
    cbp: CBPRequirement[];
    fda?: FDARequirement[];
    usda?: USDARequirement[];
    ftc?: FTCRequirement[];
    cpsc?: CPSCRequirement[];
    ofac: OFACScreeningResult;
  };
  recentRegulationChanges?: RegulationChange[];  // Changes in last 30 days affecting this product
  estimatedCustomsClearanceTime: string;
  recommendedActions: string[];
  resourceLinks: string[];
  lastRuleDataUpdate: string;
}
```

### Model Selection

**Architecture: Hybrid Rule Engine + Claude Sonnet RAG**

```
ComplianceMonitorRequest
  -> Layer 1 — Deterministic rule engine:
     - OFAC SDN list screening (fuzzy name match — deterministic)
     - Document completeness check (present/absent — binary)
     - HTS-to-agency mapping (which agencies apply for this code)
     - Section 301 surcharge determination (lookup table)
  -> Layer 2 — Claude Sonnet + RAG:
     - Retrieve CBP rulings, FDA guidance, CPSC standards for this HTS code
     - "Given product (HTS: X, origin: VN) and these regulations [context],
        identify compliance risks the importer should address."
     - Returns structured issue list with regulatory citations
  -> Risk scoring algorithm combines both layers
  -> Human review routing for riskScore > 70
  -> Regulatory change monitoring: nightly diff of CBP/FDA/USTR rule databases
```

**Why hybrid:**
- OFAC screening must be deterministic and fully auditable — zero LLM in the chain
- Document completeness is binary — no reasoning needed
- Regulatory interpretation ("does this product require CPSC 16 CFR 1303 testing?") benefits from LLM over retrieved regulatory text
- Every compliance determination requires a regulatory citation — LLM must cite source, not reason from memory

### Training Data Requirements

| Data Source | Volume | Acquisition | Refresh |
|-------------|--------|------------|---------|
| CBP CROSS (Customs Rulings Online Search) | 400K+ rulings | CBP API | Daily additions |
| OFAC SDN list | ~7,000 entities | treasury.gov XML | Daily |
| FDA PREDICT screening rules | Published guidance | FDA.gov | Quarterly |
| FDA Prior Notice regulations (21 CFR Part 1) | ~100 pages | FDA.gov | As published |
| CPSC regulations (16 CFR) | ~2,000 pages | CPSC.gov | As published |
| FTC import labeling regulations (16 CFR) | ~500 pages | FTC.gov | As published |
| USDA APHIS import requirements | Web + PDFs | APHIS.gov | Quarterly |
| HTS-to-agency mapping (internal curated) | ~5,000 mappings | Internal | Monthly review |
| CBP Section 301 + exclusion lists | 4 lists | USTR.gov | As published |

### Integration Points

- **FTZ Classification Agent** — FTZ admission compliance requirements (CBP 19 CFR Part 146)
- **Document Processing Agent** — Document data extracted by Agent 4 fed into compliance check
- **Rate Negotiation AI** — Compliance-flagged routes receive alternative carrier recommendations
- **Customer Success Agent** — Compliance issues trigger proactive customer alerts
- **Shipment Dashboard** — Compliance status badge on every active shipment
- **GHL CRM** — Compliance status and action items pushed to customer record
- **Email/SMS notifications** — Alert importer when compliance review required before ship date

### Accuracy / Performance Targets

| Metric | MVP Target | v1 Target | Production Target |
|--------|-----------|-----------|------------------|
| Document completeness check accuracy | 99% | 99.5% | 99.9% |
| OFAC false positive rate | < 2% | < 1% | < 0.5% |
| OFAC false negative rate | 0% | 0% | 0% |
| Regulatory issue detection recall | 70% | 83% | 92% |
| Regulatory change detection latency | < 48h | < 24h | < 6h |
| Response latency (p50) | < 12s | < 6s | < 3s |

### Development Timeline and Cost Estimate

**MVP (Q4 2026) — 8 weeks — $16K–$24K**
- HTS-to-agency requirement mapping database
- Document completeness rule engine
- OFAC SDN list daily download + fuzzy name matching
- Claude RAG over CBP rulings for compliance interpretation
- API: `POST /api/agents/compliance-check`
- Compliance status badge on shipment dashboard

**v1 (Q1 2027) — 10 weeks — $16K–$24K**
- FDA Prior Notice detection for food/drug HTS codes
- CPSC consumer product safety check
- FTC country of origin marking requirements
- Section 301 tariff surcharge + exclusion check
- Nightly regulatory change monitoring (diff CBP/FDA/USTR)
- Missing document auto-generation (template-based)

**Production (Q2 2027) — 8 weeks (in v1 cost range)**
- CBP ACE API integration (if partnership established)
- Real-time UFLPA (Uyghur Forced Labor Prevention Act) supplier screening
- Country-of-origin tracing for multi-step manufacturing chains
- Proactive alert digest: weekly "regulatory changes affecting your shipments"

### Risk and Fallback Strategy

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|-----------|
| Regulatory database stale at check time | Medium | High | Show "data as of" timestamp; require refresh if > 48h old |
| LLM cites wrong regulation | Low | High | Claude must cite specific CFR section from retrieved context; post-hoc citation validation |
| OFAC false negative (miss sanctioned entity) | Very Low | Critical | Use established fuzzy-matching library (not LLM); test against SDN database; never route OFAC through LLM |
| Over-blocking (excessive false positives) | Medium | Medium | Separate "blocked" from "review-required" status; track false positive rate; calibrate thresholds |

---

## 6. Agent 4: Document Processing Agent

### Purpose and Business Value

Parses Bills of Lading (BOLs), commercial invoices, packing lists, certificates of origin, customs forms, and carrier confirmations. Extracts structured data for downstream agents and the platform database — eliminating the 20–40 minutes brokers spend re-keying document data per shipment.

**Business value:**
- Eliminates manual document re-keying (20–40 min/shipment × 500 shipments/year = 200 hours/year)
- Document data feeds all other agents — quality here determines quality everywhere
- Reduces transcription errors that cause customs delays
- Enables real-time shipment status correlation (match BOL to carriage event)

### Input / Output Specification

**Input:**
```typescript
interface DocumentProcessingRequest {
  documents: DocumentInput[];
  expectedTypes?: DocumentType[];      // Optional: helps extraction focus
  validationMode: "strict" | "lenient";
  crossValidate?: boolean;            // Cross-check fields across multiple docs
}

interface DocumentInput {
  type: DocumentType;
  content: {
    imageUrl?: string;                 // S3/Vercel Blob URL for scanned PDFs/images
    pdfBase64?: string;
    textContent?: string;              // If already OCR'd
  };
  fileName: string;
  pageCount?: number;
}

type DocumentType =
  | "bill-of-lading"
  | "commercial-invoice"
  | "packing-list"
  | "certificate-of-origin"
  | "customs-entry-summary"
  | "isf-filing"
  | "arrival-notice"
  | "carrier-confirmation"
  | "phytosanitary-certificate"
  | "fda-prior-notice";
```

**Output:**
```typescript
interface DocumentProcessingResult {
  documents: ProcessedDocument[];
  extractedShipment: ExtractedShipmentRecord;  // Unified shipment record across all docs
  crossValidationIssues?: CrossValidationIssue[];  // Mismatches between documents
  missingFields: MissingFieldAlert[];
  confidence: {
    overall: number;                   // 0–1
    byField: Record<string, number>;   // Per-field confidence
  };
  processingTimeMs: number;
  requiresHumanReview: boolean;
  reviewReason?: string;
}

interface ExtractedShipmentRecord {
  shipper: Party;
  consignee: Party;
  notifyParty?: Party;
  carrier: string;
  vesselName?: string;
  voyageNumber?: string;
  billOfLadingNumber?: string;
  containerNumbers: string[];
  originPort: string;
  destinationPort: string;
  estimatedDeparture?: string;
  estimatedArrival?: string;
  lineItems: LineItem[];              // Each product line with description, quantity, value, HTS
  totalPackages: number;
  totalWeightKg: number;
  totalCBM: number;
  invoiceValue: { amount: number; currency: string };
  incoterms?: string;
  countryOfOrigin: string;
  specialInstructions?: string;
}
```

### Model Selection

**Primary:** Claude Sonnet Vision (multimodal) + extraction schema

**Why Claude Vision:**
- BOLs, invoices, and certificates vary wildly in format — no template can handle all layouts
- Claude Vision handles scanned images, rotated documents, low-contrast stamps
- Structured output via Zod schema ensures consistent extraction regardless of document variation
- Claude can reason about partial or ambiguous data ("this appears to be a B/L number format")

**Architecture:**
```
DocumentInput (image/PDF/text)
  -> PDF → image conversion if needed (pdf2pic or similar)
  -> Claude claude-sonnet-4-6 Vision prompt:
     "Extract the following structured fields from this [document_type].
      Return JSON conforming to [DocumentSchema].
      For unclear fields, return null with a confidence note."
  -> Zod schema validation on output
  -> Cross-validation across multiple docs (flag mismatches)
  -> Confidence scoring (known-format fields score higher)
  -> Human review queue if overall confidence < 0.80
```

**Why not a specialized OCR tool (Textract, Docparser):**
- Template-based extractors require one template per document format — unsustainable at scale
- Claude Vision handles novel layouts without configuration
- LLM understands semantic context ("this is a 'notify party' field even though labeled differently")
- Cost is comparable for 500 documents/month at our target volume

### Training Data Requirements

| Data Source | Volume | Acquisition | Refresh |
|-------------|--------|------------|---------|
| Anonymized BOL/invoice samples (founder's existing docs) | 50–200 docs | Founder-provided | One-time with ongoing additions |
| Public BOL format examples | ~50 samples | Internet samples | One-time |
| CBP entry summary format (CBP Form 7501) | Official form spec | CBP.gov | Annual |
| ISF filing format | Official spec | CBP.gov | Annual |
| FDA Prior Notice form requirements | Official | FDA.gov | Occasional |
| Platform extraction history + corrections | 0 at launch → grows | User corrections | Real-time |

### Integration Points

- **Compliance Monitor** — Extracted document data fed into compliance check
- **FTZ Classification Agent** — HTS codes extracted from invoices validated/supplemented
- **Rate Negotiation AI** — Extracted carrier/vessel data used in negotiation context
- **Shipment Database** — Extraction populates the platform's shipment records
- **Shipment Tracking UI** — Displays extracted shipment status from arrival notices
- **Customer Success Agent** — Extracted data used for anomaly detection baseline

### Accuracy / Performance Targets

| Metric | MVP Target | v1 Target | Production Target |
|--------|-----------|-----------|------------------|
| Field extraction accuracy (standard fields) | 88% | 94% | 97% |
| BOL number extraction accuracy | 95% | 98% | 99.5% |
| Line item extraction accuracy | 80% | 90% | 95% |
| Cross-validation issue detection rate | 75% | 88% | 95% |
| Processing latency per document (p50) | < 15s | < 8s | < 5s |
| Human review escalation rate | 25% | 12% | 6% |

### Development Timeline and Cost Estimate

**MVP (Q3 2026) — 5 weeks — $9K–$13K**
- Claude Vision integration with extraction schema
- Support for: BOL, commercial invoice, packing list
- Zod validation on extracted output
- API: `POST /api/agents/process-document`
- Upload UI with extracted data preview

**v1 (Q4 2026) — 7 weeks — $9K–$15K**
- Certificate of origin, ISF filing, arrival notice support
- Cross-document validation (flag mismatches between BOL and invoice)
- Human review queue with correction interface
- Extraction confidence scoring per field
- Batch processing endpoint (multi-document upload)

**Production (Q1 2027) — 6 weeks (in v1 cost range)**
- FDA Prior Notice and phytosanitary certificate support
- PDF → searchable text archival
- Auto-population of shipment record from documents
- Integration with CBP ACE for e-filing (Phase 3 aspiration)

### Risk and Fallback Strategy

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|-----------|
| Claude Vision misses handwritten fields | Medium | Medium | Flag low-confidence fields for manual review; train on handwritten BOL samples |
| Document format not recognized | Low | Medium | Fallback to "unstructured extraction" mode; surface raw text for manual review |
| Large PDFs timeout (50+ pages) | Low | Low | Split into pages; parallel processing; timeout at 30s per page |
| Sensitive document data stored insecurely | Low | Critical | Encrypt at rest; auto-delete originals after extraction + confirmation; SOC 2 scope |

---

## 7. Agent 5: Route Optimization Agent

### Purpose and Business Value

Models multi-modal routing options (ocean, air, rail, intermodal) with cost, transit time, risk, and carbon footprint tradeoffs. Recommends the optimal route for each shipment given the importer's priority weighting and current market conditions.

**Business value:**
- Multi-modal routing is manually complex — brokers default to ocean-only without proper air/rail analysis
- Time-sensitive cargo (perishables, high-value electronics) often benefits from air even at higher freight cost when lost-sale risk is priced in
- Intermodal routing (ocean + rail + truck) can save 8–15% vs. all-truck for inland destinations
- Documented routing analysis in client proposals differentiates the broker as expert vs. order-taker

### Input / Output Specification

**Input:**
```typescript
interface RouteOptimizationRequest {
  cargo: {
    origin: string;                    // UN/LOCODE or city name
    destination: string;               // UN/LOCODE or ZIP code
    containerType?: "20ft" | "40ft" | "40ft-hc" | "reefer-20ft" | "reefer-40ft";
    cargoType: "cold-chain" | "general" | "hazmat" | "high-value";
    weightKg: number;
    volumeCBM: number;
    estimatedValueUSD: number;
    perishable?: boolean;
    temperatureRange?: { minC: number; maxC: number };
  };
  constraints: {
    latestArrivalDate: string;
    maxBudgetUSD?: number;
    priorityWeights: {
      cost: number;                    // 0–1, sum to 1.0
      speed: number;
      reliability: number;
      sustainability?: number;
    };
    excludeModes?: ("air" | "rail" | "truck" | "ocean")[];
    requiredCarriers?: string[];
    ftzRouting?: boolean;              // Route through FTZ zone?
    coldChainRequired?: boolean;
  };
}
```

**Output:**
```typescript
interface RouteOptimizationResult {
  recommendedRoute: RouteOption;
  alternatives: RouteOption[];         // Top 3 alternatives ranked by optimization score
  tradeoffAnalysis: {
    costVsSpeed: TradeoffMatrix;
    riskAnalysis: string;
    seasonalFactors: string;
    carbonComparison: CarbonData[];
  };
  intermodalOpportunities: IntermodalSaving[];
  ftzRoutingOption?: FTZRouteVariant;  // If FTZ routing would save > $500
  totalLandedCost: {
    freight: number;
    duties: number;
    insurance: number;
    handling: number;
    total: number;
  };
  dataAsOf: string;
}

interface RouteOption {
  mode: "ocean" | "air" | "ocean+rail" | "ocean+truck" | "air+truck";
  carrier: string;
  transitDays: number;
  frequencyPerWeek: number;
  reliabilityScore: number;            // 0–1 based on on-time performance data
  estimatedCostUSD: number;
  co2eKg: number;
  pros: string[];
  cons: string[];
  optimizationScore: number;           // Weighted composite score
  bookingNotes?: string;
}
```

### Model Selection

**Architecture: Searoute + Carrier APIs + Claude Sonnet reasoning layer**

```
RouteOptimizationRequest
  -> Port-to-port distance calculation (searoute-js for ocean routes)
  -> Air route lookup (IATA airport codes + freight lane data)
  -> Rail route check (US domestic: BNSF, UP IPI routes for Asia-origin cargo)
  -> Carrier schedule lookup (Maersk, CMA, MSC APIs for ocean; Atlas, Cargolux for air)
  -> Cost estimation per mode (rate data from Agent 1 inputs)
  -> Reliability scoring (historical on-time data from Flexport/Freightos public indices)
  -> Optimization score calculation (weighted composite based on priorityWeights)
  -> Claude Sonnet reasoning layer:
     "Given these route options and their tradeoffs, which should I recommend for
      [cargo type] with [priority weights]? Explain the reasoning in plain language."
  -> Intermodal opportunity detection (IPI vs. MLB routing for US inland)
  -> FTZ routing variant calculation if ftzRouting = true
```

**Why Claude for the reasoning layer:**
- Tradeoff explanation requires contextual reasoning ("for cold chain, transit reliability matters more than cost — the reefer failure risk on a longer route outweighs the $400 savings")
- Plain-language justification is a core deliverable for broker client proposals

### Training Data Requirements

| Data Source | Volume | Acquisition | Refresh |
|-------------|--------|------------|---------|
| Carrier ocean schedules (Maersk, CMA, MSC, COSCO, ONE) | Rolling 12-month | Carrier APIs + static | Weekly |
| Freightos Baltic Index (FBX) ocean rates | Historical 5 years | Freightos API | Weekly |
| Air freight rates (IATA AWB data) | Historical 3 years | IATA public data | Monthly |
| Carrier on-time performance data | 2 years | Flexport public benchmarks | Monthly |
| US intermodal lane data (BNSF/UP IPI) | Current | Carrier sites + static | Monthly |
| Port congestion signals | Current | MarineTraffic, Marine Exchange | Daily |
| Platform routing history (internal) | 0 → grows | User selections | Real-time |

### Integration Points

- **Rate Negotiation AI** — Route options fed to Rate Negotiation for carrier-specific leverage
- **FTZ Classification Agent** — FTZ routing variant computation
- **Compliance Monitor** — Compliance check on each recommended route
- **Document Processing Agent** — Shipment data fed back when documents processed
- **Route Comparison Tool UI** — Powers the PRD-04 / PRD-APP-06 route comparison pages
- **Landed Cost Calculator** — Route freight cost component

### Accuracy / Performance Targets

| Metric | MVP Target | v1 Target | Production Target |
|--------|-----------|-----------|------------------|
| Expert agreement with primary recommendation | Qualitative positive | 78% | 88% |
| Cost estimate accuracy (vs. actual) | ± 15% | ± 9% | ± 6% |
| Transit time estimate accuracy (vs. actual) | ± 2 days | ± 1 day | ± 0.5 days |
| Intermodal opportunity detection recall | — | 65% | 80% |
| Response latency (p50) | < 15s | < 8s | < 5s |
| User route acceptance rate | — | 52% | 65% |

### Development Timeline and Cost Estimate

**MVP (Q4 2026) — 8 weeks — $15K–$22K**
- Ocean route calculation via searoute-js
- Static carrier schedule data (top 15 SE Asia → US lanes)
- Claude reasoning layer for recommendation explanation
- API: `POST /api/agents/optimize-route`
- Route Comparison UI integration

**v1 (Q1 2027) — 10 weeks — $15K–$23K**
- Air freight mode addition
- Live Maersk + CMA CGM API integration
- On-time reliability scoring from public benchmark data
- Intermodal (ocean + rail) routing detection
- FTZ routing variant calculation
- Carbon footprint comparison

**Production (Q2 2027) — 8 weeks (in v1 cost range)**
- Real-time carrier schedule synchronization
- US domestic routing leg optimization (last-mile)
- Scenario builder: side-by-side comparison of 4 routing strategies
- Automated booking recommendation (deep link to carrier booking portal)

### Risk and Fallback Strategy

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|-----------|
| Carrier schedule API unavailable | Medium | High | Static schedule fallback; cache last 7 days of schedules |
| Rate estimate off by > 20% | Medium | Medium | Show confidence range; direct user to get quote; never present as binding |
| Route recommended violates trade sanctions | Low | Critical | Compliance Monitor always runs on recommended routes before display |
| Intermodal route not operationally available | Low | Medium | Flag as "subject to carrier availability"; link to booking portal for verification |

---

## 8. Agent 6: Backhaul Finder

### Purpose and Business Value

Identifies backhaul opportunities — vessels or trucks returning empty from their primary delivery — where carriers will accept cargo at 30–50% below standard rates to defray fixed costs. The founder already leverages this manually; this agent automates the signal detection and matching.

**Business value:**
- Backhaul rates for qualifying lanes are 30–50% below spot market
- A single identified backhaul opportunity saves $1,500–$6,000 per container
- At 50 qualifying shipments/year across the platform's user base, aggregate savings exceed $150K–$300K
- This is a proprietary advantage: no consumer-facing tool currently surfaces backhaul signals at this granularity

### Input / Output Specification

**Input:**
```typescript
interface BackhaulFinderRequest {
  shipment: {
    origin: string;                    // UN/LOCODE or region
    destination: string;               // UN/LOCODE or region
    containerType: "20ft" | "40ft" | "40ft-hc" | "reefer-20ft" | "reefer-40ft";
    cargoWeightKg: number;
    flexibleOriginRadius?: number;     // km — can pick up within radius of origin
    flexibleDestRadius?: number;       // km — can deliver within radius of destination
    targetLoadDateRange: {
      earliest: string;               // ISO date
      latest: string;                 // ISO date
    };
    maxTransitDays?: number;
  };
  preferences?: {
    preferredCarriers?: string[];
    minCarrierRating?: number;        // 0–5
    requireInsurance?: boolean;
    ftzCompatible?: boolean;
  };
}
```

**Output:**
```typescript
interface BackhaulFinderResult {
  opportunities: BackhaulOpportunity[];
  marketContext: {
    standardRateUSD: number;          // Current market rate for this lane
    averageBackhaulDiscount: number;  // % below market for available backhaulss
    optimalBookingWindow: string;     // e.g., "Book 10–21 days before load date"
  };
  negotiationAdvice: string;          // How to approach carrier on backhaul pricing
  dataAsOf: string;
  nextRefreshAt: string;
}

interface BackhaulOpportunity {
  carrier: string;
  vesselName?: string;
  originPort: string;
  destinationPort: string;
  estimatedLoadDate: string;
  estimatedArrival: string;
  containerType: string;
  estimatedRateUSD: number;
  discountVsMarket: number;           // %
  confidence: "high" | "medium" | "low";
  backhaulType: "vessel-return" | "empty-reposition" | "partial-load";
  contactInfo?: string;               // Carrier booking contact
  bookingDeadline?: string;
  notes: string;
}
```

### Model Selection

**Architecture: Carrier schedule scraper + matching algorithm + LLM enrichment**

```
BackhaulFinderRequest
  -> Carrier schedule database query:
     - Filter vessels on the return leg of origin→destination trade lane
     - Identify vessels with low load factors (< 60% on return leg) — backhaul signal
     - Cross-reference with AIS vessel tracking for live position data
  -> Matching algorithm:
     - Match available return-leg capacity to shipment spec (container type, weight, dates)
     - Score each match by: date fit, port proximity, carrier reliability, discount potential
  -> LLM enrichment layer (Claude Sonnet):
     - "Given these carrier return schedules and market rates, which opportunities
        represent genuine backhaul savings? Explain the discount rationale."
     - Generate negotiation advice for top opportunity
  -> Return ranked opportunity list
```

**Signal detection approach:**
- Vessel return patterns: identify carriers/vessels that regularly move cargo in one direction (high inbound volume, low outbound) — these vessels have structural incentive to accept backhaul cargo cheap
- Empty repositioning: carriers publishing "empty reposition" notices are explicitly advertising backhaul availability
- Trade lane seasonality: during post-peak seasons (Jan–Mar, Sep–Nov), backhaul availability increases on Asia→US lanes

**Why not fully automated (why human in the loop):**
- Backhaul arrangements are often informal — confirmed via direct carrier call
- Rate is negotiated, not listed — agent surfaces the opportunity and advises, human closes the deal
- Building automated booking integration is a Phase 3+ feature

### Training Data Requirements

| Data Source | Volume | Acquisition | Refresh |
|-------------|--------|------------|---------|
| Carrier vessel schedules (Maersk, CMA, MSC, ONE, COSCO) | Rolling 8-week schedule | Carrier APIs + static | Weekly |
| AIS vessel tracking data (position + load factor signals) | Current | Marine Traffic API | Daily |
| Empty reposition bulletins | As published | Carrier bulletin scraping | Daily |
| FBX index (backhaul lane benchmarks) | Historical 3 years | Freightos API | Weekly |
| Platform backhaul outcome history (internal) | 0 → grows | User booking confirmations | Real-time |
| Trade lane seasonality data | Historical 5 years | PIERS / USDA MARS | Annual |

### Integration Points

- **Rate Negotiation AI** — Backhaul signals feed negotiation leverage analysis (Agent 1)
- **Route Optimization Agent** — Backhaul routes included as routing alternatives (Agent 5)
- **Customer Success Agent** — Backhaul alerts pushed proactively to broker dashboard (Agent 7)
- **Shipment Dashboard** — "Backhaul Available" banner when opportunity matches active shipment
- **GHL CRM** — Backhaul opportunity pushed to customer record with broker follow-up task
- **Email/push notifications** — Alert broker when qualifying backhaul opportunity detected

### Accuracy / Performance Targets

| Metric | MVP Target | v1 Target | Production Target |
|--------|-----------|-----------|------------------|
| Opportunity precision (% of surfaced opps that are actionable) | 50% | 70% | 82% |
| Opportunity recall (% of available opps surfaced) | — | 55% | 72% |
| Discount estimate accuracy vs. actual negotiated rate | ± 20% | ± 12% | ± 8% |
| Opportunity freshness (hours since last data refresh) | < 48h | < 24h | < 12h |
| Match relevance rate (user engages with result) | — | 42% | 58% |
| Booking conversion from surfaced opportunity | — | 15% | 28% |

### Development Timeline and Cost Estimate

**MVP (Q4 2026) — 7 weeks — $12K–$18K**
- Static carrier schedule analysis for top 10 SE Asia → US lanes
- Basic backhaul signal detection (vessel return leg capacity estimation)
- LLM enrichment for opportunity ranking
- API: `POST /api/agents/find-backhaulss`
- Dashboard widget: "Backhaul Opportunities"

**v1 (Q1 2027) — 10 weeks — $13K–$20K**
- Live carrier schedule API integration
- AIS vessel position + load factor signal integration
- Empty reposition bulletin scraping
- Trade lane seasonality model
- Opportunity match quality scoring
- Broker notification system (email + dashboard alert)

**Production (Q2 2027) — 8 weeks (in v1 cost range)**
- Real-time opportunity matching as shipments are created
- Carrier booking deep-link integration (one-click contact carrier)
- Opportunity outcome tracking (was the backhaul booked? At what rate?)
- ML model for backhaul probability prediction from vessel position signals

### Risk and Fallback Strategy

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|-----------|
| Carrier schedule data unreliable | Medium | High | Multiple source triangulation; confidence labeling on each opportunity |
| Opportunity disappears before user acts | High | Medium | Show "last confirmed" timestamp; expire opportunities after 24h |
| User books via this agent but carrier denies | Medium | Medium | Never present as booking confirmation; emphasize "opportunity to negotiate" |
| AIS data inaccurate for load factor | Medium | Medium | Use as signal only; cross-reference with carrier public capacity bulletins |

---

## 9. Agent 7: Customer Success Agent

### Purpose and Business Value

Monitors active shipments for anomalies — delays, cost variances, documentation gaps, compliance drift — and proactively alerts brokers and importers before problems escalate. Transforms the platform from a calculation tool into an always-on logistics risk manager.

**Business value:**
- Proactive alerts prevent the "I didn't know there was a problem until the shipment was held" moment
- Brokers who surface problems before clients ask appear expert and trustworthy — drives retention
- Anomaly detection catches cost variances early (carrier surcharge additions, detention/demurrage accumulation)
- Customer success automation reduces broker time spent on status checking from 2–3 hours/day to 15 min/day

### Input / Output Specification

**Input (continuous monitoring, event-driven):**
```typescript
interface CustomerSuccessMonitorConfig {
  shipmentId: string;
  watchProfile: {
    alertOnDelayDays: number;          // Alert if transit exceeds expected by N days
    alertOnCostVariancePct: number;    // Alert if cost deviates > N% from estimate
    alertOnDocumentGaps: boolean;
    alertOnComplianceChange: boolean;  // Regulatory change affecting this shipment
    alertOnCarrierEvent: boolean;      // Vessel departure/arrival/diversion events
  };
  notificationChannels: {
    email?: string;
    sms?: string;
    dashboardNotification: boolean;
    webhookUrl?: string;
  };
  escalationContacts: string[];        // Who to notify for high-severity issues
}

// Event stream input (internal)
interface ShipmentEvent {
  shipmentId: string;
  eventType: ShipmentEventType;
  timestamp: string;
  data: Record<string, unknown>;
  source: "carrier-api" | "ais-tracking" | "document-agent" | "compliance-monitor" | "manual";
}
```

**Output (alert payloads):**
```typescript
interface CustomerSuccessAlert {
  alertId: string;
  shipmentId: string;
  severity: "info" | "warning" | "critical";
  alertType: CustomerSuccessAlertType;
  title: string;
  summary: string;                     // 1–2 sentence plain-language description
  details: string;                     // Full explanation with context
  recommendedActions: string[];
  estimatedImpact?: {
    delayDays?: number;
    additionalCostUSD?: number;
    complianceRiskScore?: number;
  };
  relatedAlerts?: string[];            // Other active alerts on this shipment
  timestamp: string;
  requiresAcknowledgment: boolean;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
}

type CustomerSuccessAlertType =
  | "transit-delay"
  | "cost-variance"
  | "document-missing"
  | "compliance-change"
  | "vessel-diversion"
  | "demurrage-risk"
  | "carrier-delay"
  | "customs-hold"
  | "anomaly-detected"
  | "backhaul-opportunity"
  | "ftz-savings-opportunity";
```

### Model Selection

**Architecture: Isolation Forest (anomaly detection) + Rule Engine + LLM explainer**

```
Continuous event stream
  -> Rule Engine (deterministic triggers):
     - Transit delay: actual ETA vs. expected ETA > threshold
     - Cost variance: current charges vs. quoted > threshold %
     - Document gap: required document missing within N days of departure
     - Compliance change: Compliance Monitor flags regulatory update affecting this HTS code
     - Demurrage risk: container at port > N days past free time
  -> Anomaly Detection (statistical):
     - Isolation Forest trained on historical shipment patterns
     - Detects: unusual cost spikes, atypical transit times, abnormal port dwell
     - Flags statistically significant deviations for review
  -> LLM Alert Generation (Claude Sonnet):
     - "Given this shipment context and the following anomaly/rule trigger [data],
        write a plain-language alert that explains the issue, its probable cause,
        and what the broker should do."
     - Returns Alert object with title, summary, details, recommended actions
  -> Notification routing (email, SMS, dashboard, webhook)
  -> Alert deduplication (don't spam for same event)
```

**Why Isolation Forest for anomaly detection:**
- Doesn't require labeled anomaly data at launch — unsupervised
- Works well on structured tabular data (shipment costs, transit times, port dwell)
- Fast inference — suitable for real-time monitoring
- As labeled anomalies accumulate, can upgrade to supervised classification

**Why LLM for alert generation:**
- Generic alert templates ("cost variance detected: +$340") are not actionable
- LLM contextualizes the alert ("the $340 variance likely reflects GRIs announced by Maersk effective this week — see market context")
- Recommended actions require reasoning about the specific situation, not just templates

### Training Data Requirements

| Data Source | Volume | Acquisition | Refresh |
|-------------|--------|------------|---------|
| Historical shipment records (platform internal) | 0 → grows | User data | Real-time |
| Carrier event feeds (departures, arrivals, diversions) | Rolling | AIS + carrier APIs | Real-time |
| Port congestion data (dwell time signals) | Daily | MarineTraffic, Port Authority APIs | Daily |
| General Rate Increase (GRI) announcements | As published | Carrier website scraping | As published |
| Detention/demurrage fee schedules (Maersk, CMA, MSC) | Per carrier | Carrier tariff pages | Quarterly |
| Compliance change events | Daily | Compliance Monitor output | Continuous |

### Integration Points

- **Compliance Monitor** — Regulatory changes trigger Customer Success alerts
- **Document Processing Agent** — Document gaps surface as Customer Success alerts
- **Rate Negotiation AI** — Cost variance alerts include negotiation context
- **Backhaul Finder** — Backhaul opportunity detected for active shipment → Customer Success alert
- **GHL CRM** — Alert events pushed as CRM activities; broker follow-up tasks created
- **Email/SMS/Push** — Multi-channel notification delivery
- **Shipment Dashboard** — Alert inbox with acknowledge/dismiss workflow

### Accuracy / Performance Targets

| Metric | MVP Target | v1 Target | Production Target |
|--------|-----------|-----------|------------------|
| Rule-based alert precision | 90% | 95% | 98% |
| Anomaly detection false positive rate | — | 15% | 8% |
| Alert delivery latency (event → notification) | < 5 min | < 2 min | < 30s |
| Alert acknowledgment rate (broker sees and acts) | — | 55% | 70% |
| Mean time to broker action after critical alert | — | < 4 hours | < 2 hours |
| Demurrage cost avoidance rate (alerts sent in time) | — | 60% | 80% |

### Development Timeline and Cost Estimate

**MVP (Q1 2027) — 6 weeks — $10K–$15K**
- Transit delay rule engine
- Document gap monitoring
- LLM alert generation (Claude Sonnet)
- API: `GET /api/agents/alerts/{shipmentId}`
- Alert inbox in shipment dashboard

**v1 (Q2 2027) — 8 weeks — $10K–$15K**
- Cost variance detection
- Demurrage risk alerting
- Isolation Forest anomaly detection (trained on platform data)
- Multi-channel notification (email + SMS)
- GHL CRM activity push
- Alert deduplication and suppression

**Production (Q3 2027) — 6 weeks (in v1 cost range)**
- Proactive backhaul + FTZ opportunity alerts
- Compliance change impact alerts
- Broker weekly digest: summary of all active alerts + resolved issues
- Alert outcome tracking (which alerts led to cost savings?)
- ML model upgrade: supervised anomaly classification as labels accumulate

### Risk and Fallback Strategy

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|-----------|
| Alert fatigue (too many notifications) | High | High | Configurable thresholds; daily digest option; smart suppression for recurring patterns |
| Isolation Forest too many false positives early | High | Medium | Start with rule-based only (MVP); add ML when sufficient data exists (v1) |
| Alert too late to be actionable | Medium | High | Define SLA: critical alerts within 2 min of event detection; instrument event pipeline |
| LLM generates inaccurate root cause | Low | Medium | Root cause is labeled "probable cause" not "confirmed cause"; always include data source citation |

---

## 10. Agent Orchestration Architecture

### Request Router

All agent requests flow through a central `/api/agents` router that handles:

```
Client Request
  -> Authentication check (NextAuth session)
  -> Rate limiting (per-user, per-agent quotas)
  -> Request validation (Zod schemas)
  -> Agent selection (based on endpoint)
  -> Context injection (user org data, shipment history)
  -> Agent execution (async queue for slow agents)
  -> Response caching (for identical inputs within TTL)
  -> Result storage (save to calculations table)
  -> Audit logging (every agent call logged)
```

### Agent Dependency Graph

```
                    ┌─────────────────────────┐
                    │  Document Processing (4) │ ← BOL/invoice upload
                    └────────────┬────────────┘
                                 │ Extracted shipment data
                    ┌────────────▼────────────┐
                    │  FTZ Classification (2) │ ← HTS + product data
                    └────────────┬────────────┘
                                 │ FTZ eligibility + HTS codes
         ┌───────────────────────┼───────────────────┐
         ▼                       ▼                   ▼
┌────────────────┐    ┌──────────────────┐  ┌────────────────────┐
│ Rate Neg. (1)  │    │ Compliance Mon.  │  │ Route Optim. (5)   │
│                │    │      (3)         │  │                    │
└───────┬────────┘    └──────────┬───────┘  └─────────┬──────────┘
        │                        │                     │
        └────────────┬───────────┘                     │
                     │         ┌───────────────────────┘
                     ▼         ▼
            ┌────────────────────────┐
            │  Backhaul Finder (6)   │
            └────────────┬───────────┘
                         │
                         ▼
            ┌────────────────────────┐
            │ Customer Success (7)   │ ← Monitors all agent outputs
            └────────────────────────┘
```

### Async Execution Model

Agents 1, 3, 5, and 6 (heavy LLM reasoning) execute asynchronously:

1. Client submits request → receives `jobId` immediately
2. Agent executes in background queue (BullMQ or Vercel Background Functions)
3. Client polls `GET /api/agents/jobs/{jobId}` for status
4. Webhook notification when complete (optional)
5. Result cached for 1 hour (identical inputs)

Agents 2 and 4 (faster, more deterministic) execute synchronously within the HTTP request.

Agent 7 (Customer Success) runs continuously as a background process — event-driven, not request-driven.

### Shared Context Layer

All agents share access to:

```typescript
interface AgentContext {
  orgId: string;
  userId: string;
  shipmentHistory: ShipmentSummary[];    // Last 12 months
  htsCodeHistory: HTSCodeUsage[];        // Frequently used codes
  preferredCarriers: string[];
  ftzZones: FTZZoneEnrollment[];
  complianceProfile: OrgComplianceProfile;
  rateDatabase: RateDataCache;           // Shared rate data cache
}
```

---

## 11. Cross-Agent Data Flow

### Shipment Creation Flow

```
User creates shipment
  │
  ├─► Document Processing Agent (4)
  │     Extract BOL/invoice data → populate shipment record
  │
  ├─► FTZ Classification Agent (2)
  │     HTS codes from docs → FTZ eligibility → savings estimate
  │
  ├─► Compliance Monitor (3)
  │     HTS + origin → pre-shipment compliance check
  │
  └─► Customer Success Agent (7)
        Begin monitoring shipment lifecycle
```

### Carrier Quote Flow

```
User submits carrier quotes
  │
  ├─► Rate Negotiation AI (1)
  │     Analyze quotes → counter-offer recommendation
  │
  └─► Route Optimization Agent (5)
        Optimize route → alternatives → landed cost
              │
              └─► Backhaul Finder (6)
                    Check for backhaul opportunities on this lane
```

---

## 12. Training Data Strategy

### Phase 1: Cold Start (Pre-Launch)

All agents start with public data sources. No platform-specific data exists yet.

| Agent | Cold Start Data | Source |
|-------|----------------|--------|
| Rate Negotiation | FBX index, Xeneta, carrier static rates | Public APIs |
| FTZ Classification | USITC HTS, CBP FTZ regulations, NAFTZ | Government sources |
| Compliance Monitor | CBP CROSS, OFAC SDN, FDA regs, CPSC | Government sources |
| Document Processing | Founder's existing BOLs/invoices (anonymized) | Founder-provided |
| Route Optimization | Carrier schedules, FBX, IATA rates | Public + carrier APIs |
| Backhaul Finder | Carrier schedules, AIS vessel tracking | Public + APIs |
| Customer Success | Rule-based only — no ML training data needed | N/A |

### Phase 2: Flywheel Build (M8–M18)

As the platform accumulates usage data, training datasets grow proprietary:

- Every accepted classification → FTZ training label
- Every broker counter-offer outcome → Rate Negotiation feedback signal
- Every compliance alert acknowledged/dismissed → Compliance Monitor precision calibration
- Every document corrected by human → Document Processing training example
- Every route selected by broker → Route Optimization preference signal
- Every backhaul booked → Backhaul Finder ground truth label
- Every alert actioned → Customer Success model signal

### Data Quality Gates

Before any data enters the training pipeline:
1. PII scrubbing (no importer names, EINs, or personal data)
2. Human validation flag required for high-confidence training examples
3. Version control on training datasets (tag model version to training snapshot)
4. Holdout test sets locked at 20% of labeled data — never trained on

---

## 13. Infrastructure Requirements

### Compute

| Component | MVP | v1 | Production |
|-----------|-----|----|-----------:|
| API server (Vercel Serverless) | Free/Pro tier | Pro tier | Enterprise |
| Background queue (BullMQ) | Upstash Redis | Upstash Redis | Dedicated Redis |
| Vector database (pgvector) | Neon PostgreSQL | Neon PostgreSQL | Neon Scale |
| ML inference (Isolation Forest) | Vercel Function | Dedicated container | Dedicated GPU |

### External APIs

| Service | Purpose | Est. Monthly Cost (Production) |
|---------|---------|-------------------------------|
| Anthropic Claude (Sonnet) | Core LLM for Agents 1, 3, 5, 7 | $800–$2,400 |
| OpenAI Embeddings | Vector embeddings for Agent 2, 4 | $50–$150 |
| MarineTraffic | AIS vessel tracking (Agent 6, 7) | $200–$500 |
| Maersk API | Carrier schedule data (Agents 1, 5, 6) | Free (dev portal) |
| CMA CGM API | Carrier schedule data (Agents 1, 5, 6) | Free (dev portal) |
| Freightos FBX | Rate benchmarks (Agents 1, 5) | $0–$150 (public tier) |
| Twilio | SMS alerts (Agent 7) | $50–$200 |

**Total estimated infrastructure cost at production scale:** $1,100–$3,400/month

At 200 paying users × $499/month average ARPU = $99,800 MRR, infrastructure represents 1.1–3.4% of revenue.

---

## 14. Cost Estimation Summary

### Development Cost by Agent

| Agent | MVP | v1 | Production | Total |
|-------|-----|----|-----------:|-------|
| 1: Rate Negotiation AI | $14K–$20K | $14K–$22K | — | $28K–$42K |
| 2: FTZ Classification Agent | $10K–$14K | $12K–$18K | — | $22K–$32K |
| 3: Compliance Monitor | $16K–$24K | $16K–$24K | — | $32K–$48K |
| 4: Document Processing Agent | $9K–$13K | $9K–$15K | — | $18K–$28K |
| 5: Route Optimization Agent | $15K–$22K | $15K–$23K | — | $30K–$45K |
| 6: Backhaul Finder | $12K–$18K | $13K–$20K | — | $25K–$38K |
| 7: Customer Success Agent | $10K–$15K | $10K–$15K | — | $20K–$30K |
| **Total** | **$86K–$126K** | **$89K–$137K** | — | **$175K–$263K** |

Production hardening is included in v1 cost ranges above (architecture is designed for production from v1).

### ROI Framing

At $499/month ARPU and 200 users (conservative Year 2 target):

- Annual platform revenue: $1.2M ARR
- Total agent development cost: $175K–$263K (one-time, 18 months)
- Agent infrastructure operating cost: $13K–$41K/year
- **Payback period:** < 3 months of full user base revenue

The agents are the product's defensible moat — they create switching cost (proprietary rate history, trained models) and generate ROI that justifies renewal.

---

## 15. Development Timeline

### Phase-by-Phase Agent Rollout

```
Q3 2026 (Months 7–9):  MVP batch 1
  ├── Agent 4: Document Processing Agent (MVP)
  │     Foundation — data extraction for all other agents
  └── Agent 2: FTZ Classification Agent (MVP)
        Proposal site FTZ Analyzer upgrade

Q4 2026 (Months 10–12): MVP batch 2
  ├── Agent 1: Rate Negotiation AI (MVP)
  │     Core broker value prop
  ├── Agent 3: Compliance Monitor (MVP)
  │     Pre-shipment compliance check
  ├── Agent 5: Route Optimization Agent (MVP)
  │     Route comparison UI upgrade
  └── Agent 6: Backhaul Finder (MVP)
        Proprietary competitive advantage

Q1 2027 (Months 13–15): v1 upgrades + Agent 7
  ├── Agents 1–6: v1 upgrades (live APIs, improved accuracy)
  └── Agent 7: Customer Success Agent (MVP)
        Proactive monitoring goes live

Q2 2027 (Months 16–18): v1 + production hardening
  ├── Agent 7: v1 upgrade (ML anomaly detection)
  └── All agents: Production hardening
        Performance optimization, A/B testing framework, outcome tracking
```

### Sprint Structure (Phase 3 implementation)

| Sprint | Duration | Agents |
|--------|----------|--------|
| Sprint 1 | 2 weeks | Agent 4 MVP (Document Processing) |
| Sprint 2 | 3 weeks | Agent 2 MVP (FTZ Classification) |
| Sprint 3 | 3 weeks | Agent 1 MVP (Rate Negotiation) |
| Sprint 4 | 3 weeks | Agent 3 MVP (Compliance Monitor) |
| Sprint 5 | 3 weeks | Agents 5 + 6 MVP (Route Optimization + Backhaul) |
| Sprint 6 | 3 weeks | Agents 1–6 v1 upgrades + Agent 7 MVP |
| Sprint 7 | 3 weeks | Agent 7 v1 + production hardening all agents |

**Total development span:** ~20 weeks (5 months of focused execution from Q3 2026 start)

---

## 16. Risk Register

### Cross-Agent Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|-----------|
| LLM cost overrun at scale | Medium | High | Per-request cost caps; async queue throttling; token budget limits per agent call |
| Agent interdependency failure cascade | Low | High | Agents designed to degrade gracefully; each can run independently; fail-open (show error, don't block) |
| Training data quality insufficient for fine-tuning | Medium | Medium | RAG approach for MVP avoids fine-tuning risk; fine-tuning deferred to v1+ |
| Regulatory data sources change format/availability | Medium | Medium | Multiple source redundancy; scraping fallbacks; manual update protocol |
| User trust in AI recommendations too low | Medium | High | Show confidence levels; cite data sources; provide "see raw data" option; track acceptance rates |
| Competitor copies agent feature set | Medium | Low | Proprietary rate history + trained models create switching cost; network effects |
| Key person dependency (Julian's domain knowledge) | Low | High | Document all domain logic in code comments + this spec; avoid undocumented heuristics |

### Mitigation Philosophy

All agents are designed with:

1. **Confidence labeling** — Every output includes confidence and data freshness signals
2. **Citation requirements** — LLM outputs must cite data source, not reason from memory
3. **Human review escalation** — Low-confidence outputs route to review queue, never silently accepted
4. **Fallback modes** — Each agent has a degraded-but-functional fallback when external data unavailable
5. **Audit logging** — Every agent call logged with inputs, outputs, model version, and data timestamps
6. **Outcome tracking** — Platform tracks whether recommendations were acted on and what happened — feeds continuous improvement

---

*This document covers the AI agent development plan for the Shipping Savior platform. For the technical architecture supporting these agents, see `.planning/TECHNICAL-ARCHITECTURE.md`. For the data pipeline feeding them, see `.planning/prds/DATA-PIPELINE.md`. For the broader product roadmap context, see `.planning/prds/PRODUCT-ROADMAP.md`.*

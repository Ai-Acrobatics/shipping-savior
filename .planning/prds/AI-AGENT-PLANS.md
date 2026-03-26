# AI Agent Development Plans — Shipping Savior Platform

**Linear:** AI-5411
**Phase:** 2 — Architecture, Pipeline, AI Agents, GTM, Financial
**Last Updated:** 2026-03-26
**Status:** Planning

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Agent Overview Matrix](#agent-overview-matrix)
3. [Agent 1: HTS Classification Agent](#agent-1-hts-classification-agent)
4. [Agent 2: Cost Optimization Agent](#agent-2-cost-optimization-agent)
5. [Agent 3: Compliance Agent](#agent-3-compliance-agent)
6. [Agent 4: Document Agent](#agent-4-document-agent)
7. [Agent 5: Forecast Agent](#agent-5-forecast-agent)
8. [Agent 6: Anomaly Agent](#agent-6-anomaly-agent)
9. [Agent 7: FTZ Strategy Agent](#agent-7-ftz-strategy-agent)
10. [Agent Orchestration Architecture](#agent-orchestration-architecture)
11. [Training Data Strategy](#training-data-strategy)
12. [Continuous Learning & Model Improvement](#continuous-learning--model-improvement)
13. [Cost Estimation Summary](#cost-estimation-summary)
14. [Development Timeline](#development-timeline)
15. [A/B Testing & Rollout Strategy](#ab-testing--rollout-strategy)
16. [Human-in-the-Loop Workflows](#human-in-the-loop-workflows)
17. [Evaluation Framework](#evaluation-framework)

---

## Executive Summary

The Shipping Savior platform requires six specialized AI agents to automate and augment the manual workflows currently performed by freight brokers in international cold chain and consumer goods logistics. Each agent targets a distinct bottleneck in the import/export pipeline, from HTS code classification through anomaly detection.

### Why Six Agents (Not One)

A single "freight intelligence" LLM agent would be too broad to be accurate, expensive to run on every interaction, and hard to evaluate. Specialized agents allow:

- **Domain-specific training data** — Each agent can be fine-tuned or RAG-augmented with highly relevant data
- **Independent evaluation metrics** — Classification accuracy (Agent 1) is different from forecast MAPE (Agent 5)
- **Incremental rollout** — Ship Agent 1 in MVP, add others in v1/v2 without platform rewrites
- **Cost control** — Light agents (rule-based + embedding search) for classification; heavy agents (LLM reasoning) only where judgment is required
- **Fail isolation** — If the Compliance Agent has an issue, the Classification Agent still runs

### Technology Approach

The agents use a tiered model approach based on the cognitive complexity of each task:

| Tier | Description | Agents | Stack |
|------|-------------|--------|-------|
| **Tier 1** | Semantic search + embeddings | HTS Classification, Document Processing | OpenAI embeddings + vector search |
| **Tier 2** | RAG + LLM with structured output | Cost Optimization, Compliance | Claude claude-sonnet-4-6 + retrieval |
| **Tier 3** | Hybrid ML + LLM | Forecast, Anomaly Detection | XGBoost / time-series ML + LLM explainer |

---

## Agent Overview Matrix

| Agent | Primary Goal | Model Approach | MVP | v1 | Production |
|-------|-------------|----------------|-----|----|------------|
| HTS Classification | Auto-classify products to 10-digit HTS codes | Embeddings + vector search + Claude fallback | Q3 2026 | Q4 2026 | Q1 2027 |
| Cost Optimization | Route + cost optimization recommendations | Claude claude-sonnet-4-6 with RAG over carrier data | Q4 2026 | Q1 2027 | Q2 2027 |
| Compliance | Real-time regulatory compliance checking | Claude claude-sonnet-4-6 + rule engine + CBP/FDA rule RAG | Q4 2026 | Q1 2027 | Q2 2027 |
| Document | OCR + extraction from shipping documents | Claude claude-sonnet-4-6 Vision + extraction schema | Q3 2026 | Q4 2026 | Q1 2027 |
| Forecast | Rate and demand forecasting | XGBoost + time series + Claude narrative | Q1 2027 | Q2 2027 | Q3 2027 |
| Anomaly | Shipment anomaly detection and alerting | Isolation Forest + LLM explainer | Q2 2027 | Q3 2027 | Q4 2027 |
| FTZ Strategy | PF/NPF status election, duty locking, and withdrawal scheduling | Claude claude-sonnet-4-6 with financial modeling + HTS data | Q4 2026 | Q1 2027 | Q2 2027 |

---

## Agent 1: HTS Classification Agent

### Purpose

Automatically classify product descriptions into the correct 10-digit Harmonized Tariff Schedule (HTS) code. This is the foundational data point for every other calculation on the platform — duty rates, FTZ strategy, landed cost, and compliance all depend on correct HTS classification.

Currently, freight brokers spend 15-45 minutes manually looking up HTS codes per shipment, cross-referencing product descriptions with the 100,000+ entry HTS schedule. Misclassification carries penalty risk from CBP.

### Input / Output Specification

**Input:**
```typescript
interface HTSClassificationRequest {
  productDescription: string;        // Free-form product description, 10-5000 chars
  productCategory?: string;          // Optional: "apparel", "electronics", "food", etc.
  countryOfOrigin: string;           // ISO 3166-1 alpha-2 (e.g., "VN", "TH", "ID")
  materials?: string[];              // Optional: ["polyester", "cotton", "nylon"]
  unitOfMeasure?: string;            // Optional: "dozen", "kg", "each"
  intendedUse?: string;              // Optional: "retail sale", "industrial", "personal use"
  imageUrl?: string;                 // Optional: product photo for multimodal classification
}
```

**Output:**
```typescript
interface HTSClassificationResult {
  primaryCode: {
    htsCode: string;                 // 10-digit code, e.g., "6402.99.4000"
    description: string;             // Official HTS schedule description
    dutyRate: string;                // e.g., "12.5%" or "Free"
    specialRates: SpecialRate[];     // GSP, CAFTA-DR, etc.
    unitOfQuantity: string;          // e.g., "doz", "No.", "kg"
    confidence: number;              // 0-1 confidence score
    confidenceLabel: "high" | "medium" | "low";
  };
  alternativeCodes: HTSCodeOption[]; // Top 3 alternatives with confidence
  classificationRationale: string;  // Plain-English explanation of why this code
  warnings: string[];                // Flags: "Section 301 tariff applies", "Requires CBP ruling", etc.
  dataAsOf: string;                  // ISO date of HTS data used
  reviewRequired: boolean;           // True if confidence < 0.75 or multiple plausible codes
  cbpResourceLinks: string[];        // Links to relevant CBP rulings
}
```

### Data Sources

| Source | Type | Update Frequency | Notes |
|--------|------|-----------------|-------|
| USITC HTS Schedule | JSON download from hts.usitc.gov | Annual (January) + interim updates | Full 100K+ entry schedule. Primary classification corpus. |
| USITC DataWeb | Rate tables by country of origin | Quarterly | SE Asia duty rates for VN, TH, ID, KH, MY, PH |
| CBP Binding Rulings Database | PDF/XML from rulings.cbp.gov | Daily additions | 500K+ rulings with product descriptions and HTS assignments. Gold-standard training data. |
| Section 301 Lists (USTR) | CSV from ustr.gov | As-needed (policy-driven) | China tariff surcharge lists (Lists 1-4). Flags products with additional duties. |
| WCO HS Nomenclature | Reference documents | Every 5 years (next: 2027) | International HS classification notes. Helps resolve ambiguous categories. |
| Historical user corrections | Internal database | Real-time | Corrections logged when users override agent classifications. Primary feedback signal. |

### Model Approach

**Phase 1 (MVP): Embedding Search + Reranking**

```
User product description
  -> Preprocessing (normalize, expand abbreviations, extract materials)
  -> OpenAI text-embedding-3-large embedding
  -> Pinecone/pgvector similarity search against indexed HTS descriptions + CBP rulings
  -> Top 20 candidates retrieved
  -> Claude claude-sonnet-4-6 reranker: "Given this product description, rank these HTS codes"
  -> Structured output with confidence scores
  -> Result returned
```

**Phase 2 (v1): Fine-tuned Classification + RAG**

- Fine-tune a classification model on CBP binding rulings dataset (500K+ labeled examples: product description → HTS code)
- Use fine-tuned model as primary classifier
- Fall back to Claude claude-sonnet-4-6 + RAG for low-confidence results
- Human review queue for confidence < 0.65

**Phase 3 (Production): Multimodal Classification**

- Add image input via Claude claude-sonnet-4-6 Vision for product photos
- Classify from image alone or image + description
- Critical for SE Asia sourcing trips where product photos precede formal descriptions

### Integration Points

- **Landed Cost Calculator**: Classification result feeds duty rate into cost calculation
- **FTZ Savings Analyzer**: HTS code determines duty rate for FTZ locking strategy
- **Compliance Agent**: HTS code used to trigger compliance checks (FDA, FTC, CBP)
- **Document Agent**: Validates HTS codes found on invoices/packing lists
- **User Dashboard**: Displays classification history with edit capability
- **CBP Ruling Cross-Reference**: Links to relevant CBP rulings for the assigned HTS code

### Development Phases

**MVP (Q3 2026) — 6 weeks**
- [ ] Download and index full USITC HTS schedule (100K+ entries) into pgvector
- [ ] Download and parse CBP binding rulings corpus (~500K rulings)
- [ ] Build embedding pipeline for HTS descriptions + rulings
- [ ] Implement Claude claude-sonnet-4-6 reranker with structured output via Zod schema
- [ ] Basic API endpoint: POST /api/agents/hts-classify
- [ ] Simple UI: text input → top 3 results with confidence
- [ ] Admin interface to log and correct classifications

**v1 (Q4 2026) — 8 weeks**
- [ ] Fine-tune classification model on CBP rulings corpus
- [ ] Build human review queue for low-confidence results
- [ ] Section 301 tariff flag integration
- [ ] Confidence calibration using held-out test set
- [ ] User correction workflow with feedback loop
- [ ] Performance optimization: < 2s response time

**Production (Q1 2027) — 6 weeks**
- [ ] Multimodal classification from product images
- [ ] Batch classification API for bulk product uploads
- [ ] Binding ruling cross-reference and deep links
- [ ] Auto-update pipeline when USITC publishes HTS revisions
- [ ] Audit trail for compliance documentation

### Success Metrics

| Metric | MVP Target | v1 Target | Production Target |
|--------|-----------|-----------|------------------|
| Top-1 Accuracy (6-digit heading) | 70% | 85% | 92% |
| Top-1 Accuracy (10-digit full code) | 55% | 75% | 85% |
| High-confidence result rate | 40% | 60% | 75% |
| Response latency (p50) | < 5s | < 2s | < 1s |
| Human review rate | 60% | 35% | 20% |
| User correction rate (of accepted results) | < 30% | < 15% | < 8% |

### Human-in-the-Loop Design

- All classifications below 0.75 confidence route to human review queue
- Broker can accept, edit, or reject each classification
- Accepted/corrected results feed back into training data pipeline
- High-stakes classifications (Section 301 items, Chapter 99 surcharges) always require human confirmation regardless of confidence
- "Request CBP Binding Ruling" CTA surfaced when confidence is consistently low for a product type

---

## Agent 2: Cost Optimization Agent

### Purpose

Analyze carrier quotes and current market conditions to recommend optimal routing, timing, and negotiation strategies. Replace the manual process of calling 3-5 carriers, comparing quotes, and guessing which levers to pull.

The founder's current workflow: manually research vessels, present 3 options to customers with pricing tiers based on backhaul availability and transshipment routes. This agent automates that research and enriches the recommendation with negotiation context.

### Input / Output Specification

**Input:**
```typescript
interface CostOptimizationRequest {
  shipment: {
    origin: PortCode;                // UN/LOCODE, e.g., "VNSGN" (Ho Chi Minh City)
    destination: PortCode;           // e.g., "USLAX", "USSEA", "USNYC"
    containerType: "20ft" | "40ft" | "40ft-hc" | "reefer-20ft" | "reefer-40ft";
    cargoType: "cold-chain" | "general" | "hazmat";
    targetShipDate: string;          // ISO date
    flexibleDates: boolean;          // Can shift +/- 2 weeks for better rates?
    urgency: "standard" | "expedited" | "economy";
  };
  budget?: {
    maxCostUSD: number;
    targetCostUSD?: number;
  };
  preferences?: {
    maxTransitDays?: number;
    avoidTransshipments?: boolean;
    preferredCarriers?: string[];
    ftzDestination?: string;         // FTZ zone number if routing to bonded warehouse
  };
  currentQuotes?: CarrierQuote[];    // Optional: existing quotes to evaluate
}
```

**Output:**
```typescript
interface CostOptimizationResult {
  recommendedOption: RouteOption;
  alternatives: RouteOption[];       // Top 3 alternatives ranked by optimization score
  negotiationTactics: {
    tactic: string;                  // e.g., "Request backhaul rate — vessel returning empty"
    expectedSavings: string;         // e.g., "15-25% off standard rate"
    confidence: "high" | "medium" | "low";
    scriptTemplate: string;          // Suggested language for carrier conversation
  }[];
  marketContext: {
    currentSpotRateTrend: "rising" | "stable" | "falling";
    portCongestionAlerts: string[];
    optimalShipWindow: string;       // e.g., "Ship within 3 weeks for better rates"
    seasonalFactors: string;
  };
  savings: {
    vsHighestQuote: number;          // USD
    vsMarketAverage: number;         // USD (estimated)
    ftzSavingsOpportunity?: number;  // USD if FTZ strategy applied
  };
  totalLandedCostEstimate: number;
  dataAsOf: string;
}
```

### Data Sources

| Source | Type | Update Frequency | Notes |
|--------|------|-----------------|-------|
| Carrier schedule data (Maersk, CMA CGM, MSC, COSCO, ONE) | API + static | Weekly | Free dev portal APIs for Maersk, CMA CGM. Others via compiled static data. |
| Freightos Baltic Exchange (FBX) Index | Public index | Weekly | Global container freight rate benchmark by trade lane |
| Xeneta platform indices | Public benchmark data | Monthly | Contracted rate benchmarks for major trade lanes |
| USDA MARS (marine rates) | Public | Monthly | Refrigerated container rate reports for cold chain |
| Platform quote history | Internal database | Real-time | Historical quotes submitted through platform — builds proprietary rate intelligence |
| Port congestion reports (Marine Exchange) | Public | Daily | LA/LB, Seattle, NY/NJ, Savannah congestion indicators |
| Backhaul availability signals | Carrier schedules | Weekly | Vessels returning empty (Asia-bound from US) → cheaper US-outbound legs |

### Model Approach

**Core: Claude claude-sonnet-4-6 with RAG over carrier rate and routing data**

```
ShipmentSpec + CurrentQuotes
  -> Route calculation (searoute-js for port-to-port distances)
  -> RAG retrieval: relevant carrier rates, historical quotes, port congestion
  -> Claude claude-sonnet-4-6 prompt:
     "You are a freight optimization specialist. Given this shipment spec and market data:
      [retrieved context]

      Recommend the optimal routing, carriers, and negotiation tactics.
      Return structured JSON conforming to RouteOption schema."
  -> Structured output via Zod validation
  -> Negotiation script generation
  -> Savings calculation vs. market benchmarks
```

**Why Claude over GPT or specialized ML:**
- Negotiation tactic generation requires nuanced reasoning ("they have 3 empty reefer containers returning from Seattle — leverage that")
- Rate context and market interpretation benefit from language model reasoning
- No large labeled dataset of "optimal routes" exists for supervised learning
- Structured output (carrier names, pricing, tactics) via function calling is reliable with Claude

### Integration Points

- **HTS Classification Agent**: Duty rates from HTS classification affect total landed cost calculation
- **Compliance Agent**: Validates that recommended routes comply with origin/destination regulations
- **Route Comparison Tool**: Powers the existing route comparison UI with AI-enriched recommendations
- **FTZ Savings Analyzer**: Coordinates FTZ routing recommendations when FTZ strategy is active
- **Forecast Agent**: Incorporates rate forecasts into timing recommendations
- **CRM/GHL**: Pushes recommended options into customer records for follow-up

### Development Phases

**MVP (Q4 2026) — 8 weeks**
- [ ] Compile static carrier rate dataset for top 10 SE Asia → US trade lanes
- [ ] Implement route calculation using searoute-js
- [ ] Claude-powered route recommendation with basic negotiation tactics
- [ ] API endpoint: POST /api/agents/optimize-cost
- [ ] Integration with route comparison UI

**v1 (Q1 2027) — 10 weeks**
- [ ] Live Maersk API integration for real schedule data
- [ ] CMA CGM API integration
- [ ] Freightos FBX index integration (weekly rate benchmark)
- [ ] Platform quote history database (proprietary rate intelligence)
- [ ] Port congestion signal integration
- [ ] Backhaul detection algorithm

**Production (Q2 2027) — 8 weeks**
- [ ] Real-time rate indexing from multiple carrier APIs
- [ ] Multi-modal routing (air + ocean hybrid for high-value, time-sensitive cargo)
- [ ] Scenario builder: compare 3+ routing strategies side-by-side
- [ ] Automated carrier outreach (draft negotiation emails)

### Success Metrics

| Metric | MVP Target | v1 Target | Production Target |
|--------|-----------|-----------|------------------|
| Recommendation accuracy vs. human expert | Qualitative positive | 80% agreement | 90% agreement |
| Average savings identified vs. first quote | — | 10-15% | 18-25% |
| Time to recommendation (p50) | < 15s | < 8s | < 5s |
| User acceptance rate of primary recommendation | — | 50% | 65% |
| Negotiation tactic utilization rate | — | 40% | 55% |

---

## Agent 3: Compliance Agent

### Purpose

Check shipments, products, and documentation against current CBP, FDA, FTC, USDA, and trade sanctions requirements in real-time. Surface compliance risks before shipment departs, not after it arrives and gets flagged at customs.

Current workflow: freight brokers manually consult compliance checklists that go stale quickly. A single compliance miss (e.g., missing FDA Prior Notice for food products, or CPSC safety standards for consumer goods) can result in shipment holds, fines, and destroyed goods.

### Input / Output Specification

**Input:**
```typescript
interface ComplianceCheckRequest {
  product: {
    htsCode: string;                 // 10-digit HTS code (from Classification Agent)
    description: string;
    countryOfOrigin: string;         // ISO 3166-1 alpha-2
    manufacturer?: string;
    materials?: string[];
    intendedUse: "consumer" | "commercial" | "industrial" | "food" | "medical";
    isPerishable?: boolean;
    requiresRefrigeration?: boolean;
  };
  shipment: {
    importer: {
      name: string;
      ein?: string;                  // US EIN/Tax ID for importer of record
      importerOfRecord: boolean;
    };
    exporter: {
      name: string;
      country: string;
    };
    originPort: string;              // UN/LOCODE
    destinationPort: string;         // UN/LOCODE
    estimatedArrival?: string;
    containerCount: number;
    estimatedValue: number;          // USD, customs value
  };
  documentation?: {
    hasCommercialInvoice: boolean;
    hasPackingList: boolean;
    hasISF: boolean;
    hasCertificateOfOrigin: boolean;
    hasBillOfLading: boolean;
    hasPhytosanitaryCert?: boolean;  // Plants/food products
    hasFDAPriorNotice?: boolean;     // FDA-regulated goods
  };
}
```

**Output:**
```typescript
interface ComplianceCheckResult {
  overallStatus: "compliant" | "review-required" | "non-compliant" | "blocked";
  riskScore: number;                 // 0-100 (100 = highest risk)
  checks: ComplianceCheckItem[];     // Individual checks with pass/fail/warning
  blockers: ComplianceIssue[];       // Hard stops — must resolve before shipping
  warnings: ComplianceIssue[];       // Soft warnings — review recommended
  missingDocuments: DocumentRequirement[];
  agencyRequirements: {
    cbp: CBPRequirement[];
    fda?: FDARequirement[];          // If food, drug, cosmetic, or medical device
    usda?: USDARequirement[];        // If agricultural product
    ftc?: FTCRequirement[];          // Consumer product safety, labeling
    cpsc?: CPSCRequirement[];        // Consumer Product Safety Commission
    ofac?: OFACCheck;                // Sanctions screening
  };
  estimatedCustomsClearanceTime: string; // e.g., "1-3 business days (standard)"
  recommendedActions: string[];
  resourceLinks: string[];           // Links to CBP, FDA, USDA resources
  lastRegulationUpdate: string;      // ISO date of compliance rule data used
}
```

### Data Sources

| Source | Type | Update Frequency | Notes |
|--------|------|-----------------|-------|
| CBP CROSS (Customs Rulings Online Search System) | API/web | Daily updates | 400K+ binding rulings for classification and compliance |
| CBP ACE (Automated Commercial Environment) | API (CBP partner) | Real-time | Pilot program for automated entry checks — Phase 3 |
| FDA PREDICT system rules | Published regulatory guidance | Quarterly | FDA risk-based screening rules for imported food/drugs |
| FDA Prior Notice regulations | 21 CFR Part 1 | Occasional updates | Food facilities, prior notice requirements |
| CPSC regulations database | 16 CFR parts | As published | Consumer product safety rules, test standards |
| OFAC SDN list | XML download from treasury.gov | Daily | Sanctioned entities, countries, vessels |
| FTC import regulations | 16 CFR | As published | Labeling, country of origin marking (19 U.S.C. 1304) |
| USDA APHIS regulations | Web + PDF | Quarterly | Plant, animal, and food import requirements |
| CBP Section 301 exclusion lists | USTR.gov | As published | Current exclusion requests and granted exclusions |
| HTS-to-agency mapping | Internal curated | Monthly review | Which HTS code ranges trigger which agency reviews |

### Model Approach

**Hybrid: Rule Engine + Claude RAG**

```
ComplianceCheckRequest
  -> Rule engine layer (deterministic):
     - OFAC sanctions screening (name matching against SDN list)
     - Document completeness check (are all required docs present?)
     - HTS-to-agency requirement mapping (does HTS code require FDA, USDA review?)
     - Section 301 tariff surcharge determination
  -> Claude claude-sonnet-4-6 + RAG (reasoning layer):
     - Retrieve relevant CBP rulings, FDA guidance, CPSC standards for this HTS code
     - "Given this product (HTS code: X, origin: VN, description: Y) and these regulations
        [retrieved context], what compliance issues should the importer be aware of?"
     - Returns structured issues list
  -> Risk scoring algorithm combines rule engine + Claude outputs
  -> Human review routing for riskScore > 70
```

**Why hybrid approach:**
- OFAC screening must be deterministic and auditable — no LLM reasoning
- Document completeness is rule-based
- Regulatory interpretation (is this product subject to CPSC 16 CFR 1303?) benefits from LLM reasoning over retrieved regulatory text
- Audit trail requirement: every compliance determination must cite specific regulation

### Integration Points

- **HTS Classification Agent**: HTS code is primary input for determining which agencies apply
- **Document Agent**: Validates that extracted document data meets compliance requirements
- **Cost Optimization Agent**: Routes flagged for compliance issues get a compliance-cleared alternative
- **User Dashboard**: Compliance status displayed on every active shipment
- **GHL CRM**: Compliance status pushed to customer record
- **Email notifications**: Alert importer when compliance review required before ship date

### Development Phases

**MVP (Q4 2026) — 8 weeks**
- [ ] HTS-to-agency requirement mapping database (internal)
- [ ] Document completeness rule engine
- [ ] OFAC sanctions screening (SDN list daily download + fuzzy name match)
- [ ] Claude RAG over CBP rulings for compliance interpretation
- [ ] API endpoint: POST /api/agents/compliance-check
- [ ] Compliance status badge on shipment dashboard

**v1 (Q1 2027) — 10 weeks**
- [ ] FDA Prior Notice requirement detection for food/drug HTS codes
- [ ] CPSC consumer product safety check
- [ ] FTC country of origin marking requirements
- [ ] Section 301 tariff surcharge + exclusion check
- [ ] Missing document generation (auto-generate CBP entry summary, commercial invoice template)
- [ ] Risk scoring algorithm calibration

**Production (Q2 2027) — 8 weeks**
- [ ] CBP ACE API integration (if partnership established)
- [ ] USDA APHIS live requirement lookup
- [ ] Compliance history tracking per importer
- [ ] Proactive alerts: regulation change notifications for active product lines
- [ ] Compliance report PDF generation for audit purposes

### Success Metrics

| Metric | MVP Target | v1 Target | Production Target |
|--------|-----------|-----------|------------------|
| Compliance issue detection rate (vs. CBP holds) | 60% | 80% | 92% |
| False positive rate | < 40% | < 20% | < 10% |
| OFAC screening accuracy | 99.9% | 99.99% | 99.999% |
| Response latency (p50) | < 10s | < 5s | < 3s |
| Regulatory coverage (agencies) | CBP, OFAC | + FDA, CPSC, FTC | + USDA, EPA, ATF |
| User-reported accuracy (5-point scale) | — | 3.5+ | 4.2+ |

---

## Agent 4: Document Agent

### Purpose

Extract structured data from unstructured shipping documents (bills of lading, commercial invoices, packing lists, certificates of origin, ISF filings). Eliminate manual data entry and cross-document validation.

The average import shipment involves 8-12 documents, each needing data extracted and verified against the others. Current process: human reviews each document, manually keys data into systems, cross-checks totals and descriptions. Agent 4 automates this and surfaces discrepancies automatically.

### Input / Output Specification

**Input:**
```typescript
interface DocumentProcessingRequest {
  documents: {
    type: "bill-of-lading" | "commercial-invoice" | "packing-list" |
          "certificate-of-origin" | "isf-filing" | "phytosanitary" |
          "customs-entry" | "delivery-order" | "arrival-notice" | "other";
    content: string | Buffer;        // PDF, image (JPEG/PNG/TIFF), or text
    mimeType: string;
  }[];
  shipmentContext?: {
    expectedOrigin?: string;
    expectedDestination?: string;
    expectedHtsCode?: string;
    expectedShipper?: string;
    expectedConsignee?: string;
  };
  extractionMode: "structured" | "full-text" | "cross-validate";
}
```

**Output:**
```typescript
interface DocumentProcessingResult {
  documents: ProcessedDocument[];   // One per input document
  consolidatedData: {               // Merged view across all documents
    shipmentId?: string;
    billOfLadingNumber?: string;
    shipper: Party;
    consignee: Party;
    notifyParty?: Party;
    portOfLoading: string;
    portOfDischarge: string;
    placeOfDelivery?: string;
    vessel?: string;
    voyage?: string;
    containerNumbers: string[];
    sealNumbers: string[];
    htsCode?: string;
    description: string;
    grossWeight: WeightMeasure;
    measurement: VolumeMeasure;
    packages: PackageDetail[];
    totalValue: MoneyAmount;
    currency: string;
    incoterms?: string;
    freightTerms?: string;
    estimatedDeparture?: string;
    estimatedArrival?: string;
  };
  discrepancies: Discrepancy[];     // Cross-document conflicts
  warnings: string[];
  extractionConfidence: number;     // 0-1
  manualReviewRequired: boolean;
  reviewReasons: string[];
}
```

### Data Sources

| Source | Type | Notes |
|--------|------|-------|
| User-uploaded documents | PDF, images | Primary input — no external source needed |
| HTS schedule (Agent 1 index) | Shared vector DB | For validating extracted HTS codes |
| UN/LOCODE database | Static JSON | For validating port codes on documents |
| Vessel registry (IMO) | Static + API | For validating vessel names and IMO numbers |
| CBP document requirements | Internal rule set | What fields are required per document type |

### Model Approach

**Claude claude-sonnet-4-6 Vision for Document Understanding**

```
Uploaded document (PDF/image)
  -> PDF → image conversion if needed (pdf2pic)
  -> Claude claude-sonnet-4-6 Vision prompt:
     "Extract all data fields from this [bill of lading / commercial invoice / etc.]
      Return as JSON conforming to this schema: [Zod schema injected]
      If a field is not present, return null. Do not infer missing data.
      Flag any unusual, unclear, or potentially incorrect values."
  -> Zod schema validation of extracted JSON
  -> Cross-document reconciliation:
     Claude claude-sonnet-4-6 text prompt:
     "Compare these extracted documents for this shipment. Identify discrepancies
      between the bill of lading, commercial invoice, and packing list."
  -> Discrepancy list generated
  -> Confidence scoring per field
```

**Why Claude Vision over specialized OCR:**
- Bill of lading formats vary enormously by carrier (Maersk BOL looks nothing like CMA CGM BOL)
- Specialized OCR tools (Textract, Google Document AI) require template configuration per carrier
- Claude Vision handles layout variations, handwritten annotations, stamps, and non-standard formats
- Extracting semantically structured data (not just raw text) is an LLM strength

**Preprocessing pipeline:**
- PDF → page-by-page image conversion at 300 DPI (pdf2pic)
- Image enhancement: contrast normalization, deskewing (sharp.js)
- Multi-page documents: per-page extraction → merge

### Integration Points

- **HTS Classification Agent**: Validates/classifies HTS codes found on commercial invoices
- **Compliance Agent**: Extracts document data for compliance verification
- **Cost Optimization Agent**: Extracts cost data for benchmarking against market rates
- **User Dashboard**: Populates shipment tracking from extracted BOL data
- **Database**: Stores extracted data for shipment history and reporting
- **Alert system**: Notifies users of discrepancies between documents

### Development Phases

**MVP (Q3 2026) — 6 weeks**
- [ ] PDF → image preprocessing pipeline
- [ ] Claude Vision extraction for bill of lading (most common, highest priority)
- [ ] Claude Vision extraction for commercial invoice
- [ ] Zod schema for each document type
- [ ] API endpoint: POST /api/agents/process-document
- [ ] Basic discrepancy detection (value totals, shipper/consignee name matching)
- [ ] Document upload UI with extraction results display

**v1 (Q4 2026) — 8 weeks**
- [ ] Packing list extraction
- [ ] Certificate of origin extraction
- [ ] ISF filing extraction
- [ ] Cross-document reconciliation agent
- [ ] Confidence scoring per field
- [ ] Human review queue for low-confidence extractions
- [ ] Data persistence (store extracted data to shipment record)

**Production (Q1 2027) — 8 weeks**
- [ ] Batch processing (upload 10+ documents at once)
- [ ] Template learning: detect carrier-specific BOL formats, improve accuracy
- [ ] Integration with CBP ABI/ACE for automated entry filing preparation
- [ ] Automated discrepancy resolution suggestions
- [ ] Extracted data export (CSV, PDF summary)

### Success Metrics

| Metric | MVP Target | v1 Target | Production Target |
|--------|-----------|-----------|------------------|
| Field extraction accuracy (BOL) | 85% | 92% | 96% |
| Field extraction accuracy (commercial invoice) | 82% | 90% | 95% |
| Discrepancy detection rate | 70% | 85% | 93% |
| Processing time per document (p50) | < 30s | < 15s | < 8s |
| Human review rate | 30% | 15% | 8% |
| Carrier template coverage | 5 carriers | 15 carriers | 30+ carriers |

---

## Agent 5: Forecast Agent

### Purpose

Predict container freight rates, port congestion levels, and import demand by trade lane and product category. Enable freight brokers to advise clients on optimal shipping windows and lock in rates before market moves.

This agent converts reactive freight brokerage (quoting what carriers offer today) into proactive advisory (recommending ship dates based on rate trajectory).

### Input / Output Specification

**Input:**
```typescript
interface ForecastRequest {
  tradeLane: {
    origin: string;                  // Region or port (e.g., "SE Asia", "VNSGN")
    destination: string;             // Region or port (e.g., "US West Coast", "USLAX")
  };
  containerType: "20ft" | "40ft" | "40ft-hc" | "reefer-40ft";
  forecastHorizon: "2w" | "4w" | "8w" | "12w";
  productCategory?: string;          // For demand forecasting component
  includedMetrics: ("rate" | "congestion" | "demand" | "capacity")[];
}
```

**Output:**
```typescript
interface ForecastResult {
  rateForecast: {
    currentRate: number;             // USD per container
    predictedRate: TimeSeries[];     // Weekly predictions over horizon
    confidenceInterval: { upper: number; lower: number }[];
    trend: "rising" | "stable" | "falling";
    keyDrivers: string[];            // e.g., "Chinese New Year demand surge", "Panama drought"
    recommendations: string;
  };
  congestionForecast?: {
    originPort: CongestionPrediction;
    destinationPort: CongestionPrediction;
    majorTransshipmentHubs: CongestionPrediction[];
  };
  seasonalContext: {
    upcomingEvents: SeasonalEvent[]; // Holidays, harvest seasons, peak periods
    historicalPatterns: string;
    optimalShipWindow: DateRange;
  };
  narrative: string;                 // Plain-English market analysis
  dataAsOf: string;
  modelVersion: string;
  forecastAccuracy: {                // Historical performance of this model
    mae: number;                     // Mean Absolute Error in USD
    mape: number;                    // Mean Absolute Percentage Error
    evaluationPeriod: string;
  };
}
```

### Data Sources

| Source | Type | Update Frequency | Notes |
|--------|------|-----------------|-------|
| Freightos Baltic Exchange (FBX) | Public weekly index | Weekly | 12 global container freight indices. Free public data. |
| Drewry World Container Index | Public weekly | Weekly | Composite and per-trade-lane indices. Free public data. |
| SCFI (Shanghai Containerized Freight Index) | Public weekly | Weekly | China export freight benchmarks |
| Xeneta spot/contract index | Public quarterly | Quarterly | Contracted rate benchmarks |
| Platform historical quotes | Internal | Real-time | Growing proprietary dataset of actual quote history |
| Port Authority statistics | Public monthly | Monthly | TEU volumes for major US ports (LA/LB, Seattle, NY, Savannah) |
| Federal Reserve economic indicators | Public | Monthly/Quarterly | ISM Manufacturing, retail sales (demand proxy) |
| USITC trade statistics | Public | Monthly | US import volumes by HTS chapter and country |
| Holiday/seasonal calendar | Static + curated | Annual update | Chinese New Year, Vietnamese holidays, US peak retail, monsoon seasons |
| Canal disruption data | News + official | Event-driven | Panama drought, Suez situation monitoring |

### Model Approach

**Tier 3: Time-Series ML + LLM Narrative**

```
Historical rate data (FBX + Drewry + internal quotes)
  -> Feature engineering:
     - Lag features (1-week, 4-week, 8-week, 52-week rates)
     - Seasonal dummies (week of year, Chinese New Year proximity)
     - Macro features (ISM, retail sales YoY)
     - Congestion proxy (port dwell time where available)
     - Capacity signals (vessel scrapping rate, newbuild deliveries)
  -> XGBoost or LightGBM regression (per trade lane, per container type)
  -> Prediction interval via quantile regression
  -> Claude claude-sonnet-4-6 narrative generation:
     "Given these rate predictions [model output] and these current market events
      [retrieved news/context], write a clear market analysis for a freight broker
      advising a customer on when to ship SE Asia goods to US West Coast."
  -> Combined structured forecast + narrative output
```

**Why XGBoost + Claude (not end-to-end LLM):**
- Rate forecasting has a known quantitative structure — LLMs are worse than gradient boosting for numerical time series
- Uncertainty quantification (confidence intervals) is critical for business decisions — LLMs cannot produce calibrated prediction intervals
- LLM adds value in the narrative layer: synthesizing model output with qualitative market context
- Interpretability: XGBoost feature importance explains WHY the rate is predicted to rise

**Data pipeline:**
- Weekly automated pull from FBX and Drewry public indices
- Normalize to per-40ft-container USD equivalent
- Store in PostgreSQL time series table
- Model retrained weekly with latest data

### Integration Points

- **Cost Optimization Agent**: Rate forecasts improve ship window recommendations
- **User Dashboard**: "Rate Trend" widget on main dashboard
- **Email alerts**: Notify when predicted rate change exceeds 10% in 4 weeks
- **Reporting**: Weekly freight market brief generated for broker clients
- **Scenario modeling**: "What if I ship now vs. in 6 weeks?" cost comparison

### Development Phases

**MVP (Q1 2027) — 10 weeks**
- [ ] Historical rate data collection pipeline (FBX, Drewry, SCFI — last 5 years)
- [ ] XGBoost model training for top 5 SE Asia → US trade lanes
- [ ] Simple trend indicator (rising/stable/falling) displayed in UI
- [ ] API endpoint: POST /api/agents/forecast
- [ ] Basic Claude narrative generator
- [ ] Weekly model retraining pipeline

**v1 (Q2 2027) — 10 weeks**
- [ ] Expand to 15+ trade lanes
- [ ] Port congestion forecasting component
- [ ] Seasonal event integration (Chinese New Year, peak season)
- [ ] Prediction interval calculation (calibrated uncertainty)
- [ ] Historical model accuracy display (builds trust)
- [ ] User-configurable alert thresholds

**Production (Q3 2027) — 10 weeks**
- [ ] Demand forecasting (TEU volume by trade lane)
- [ ] Capacity forecasting (vessel schedule analysis)
- [ ] Cold chain reefer rate forecasting (separate model — reefer premiums behave differently)
- [ ] Canal disruption event detection and impact modeling
- [ ] Forecast API for external platform integration

### Success Metrics

| Metric | MVP Target | v1 Target | Production Target |
|--------|-----------|-----------|------------------|
| 4-week rate MAPE | < 20% | < 12% | < 8% |
| Directional accuracy (rising/falling) | 60% | 70% | 78% |
| Model retraining freshness | Weekly | Weekly | Daily |
| Trade lane coverage | 5 | 15 | 30+ |
| User engagement with forecasts | — | 40% of sessions | 65% of sessions |
| Forecast-influenced bookings | — | 20% | 35% |

---

## Agent 6: Anomaly Agent

### Purpose

Detect unusual patterns in shipment data, carrier quotes, document content, and operational metrics that signal fraud risk, data errors, or developing supply chain disruptions. Surface actionable alerts before problems become crises.

Use cases:
- Quote significantly above/below market (potential error or fraud)
- Document discrepancies that CBP routinely flags
- Shipment stuck in a port longer than expected
- Container weight on packing list vs. BOL mismatch
- Carrier pattern change (usually uses route A, now quoting route C — why?)
- Product description that doesn't match HTS code (undervaluation/misdescription risk)

### Input / Output Specification

**Input:**
```typescript
interface AnomalyDetectionRequest {
  entity: "shipment" | "quote" | "document" | "route" | "carrier" | "product";
  entityId: string;
  data: Record<string, unknown>;     // Entity-specific data payload
  context?: {
    historicalBaseline?: BaselineStats;
    peerComparison?: boolean;        // Compare to similar shipments
    riskProfile?: "standard" | "elevated" | "high";
  };
}
```

**Output:**
```typescript
interface AnomalyDetectionResult {
  anomalyScore: number;              // 0-1 (1 = extreme anomaly)
  anomalyLabel: "normal" | "suspicious" | "anomalous" | "critical";
  detectedAnomalies: Anomaly[];
  rootCauseAnalysis: {
    primaryCause: string;
    supportingEvidence: string[];
    alternativeExplanations: string[];
  };
  riskAssessment: {
    fraudRisk: "low" | "medium" | "high";
    complianceRisk: "low" | "medium" | "high";
    operationalRisk: "low" | "medium" | "high";
  };
  recommendedActions: string[];
  alertPriority: "info" | "warning" | "urgent" | "critical";
  requiresImmediateReview: boolean;
}
```

### Data Sources

| Source | Type | Notes |
|--------|------|-------|
| Platform shipment history | Internal | Growing baseline for anomaly detection — gets better with more data |
| Market rate indices (FBX, Drewry) | External | Baseline for quote anomaly detection |
| CBP enforcement statistics | Public | Historical CBP inspection rates by HTS chapter |
| OFAC alerts | Daily download | Sanctions additions trigger immediate re-screening |
| Carrier reliability reports | Internal + Alphaliner | Carrier schedule reliability benchmarks |
| Port dwell time statistics | Marine Exchange | Expected vs. actual dwell time by port |

### Model Approach

**Tier 3: Isolation Forest (anomaly detection ML) + LLM Explainer**

```
Incoming entity data
  -> Feature extraction (normalized numeric features):
     - Quote: deviation from lane average, carrier historical pricing
     - Document: field value distributions, consistency scores
     - Shipment: dwell time vs. average, route deviation
  -> Isolation Forest (unsupervised anomaly detection):
     - Trained on historical "normal" shipment data
     - Returns anomaly score (isolation depth)
  -> Threshold classification: score > 0.7 = anomalous
  -> If anomalous → Claude claude-sonnet-4-6 explainer:
     "This shipment/quote/document has been flagged as anomalous.
      Here are the specific deviations: [feature deviations].
      Explain what these anomalies could mean and what actions to take."
  -> Structured alert output with prioritized actions
```

**Why Isolation Forest:**
- Does not require labeled "fraud" examples to train — learns what "normal" looks like
- Works well with low-volume data during early platform operation
- Fast inference (sub-millisecond) for real-time screening
- No assumption about anomaly distribution (unlike one-class SVM)

**Evolution path:**
- MVP: Rule-based anomaly detection (if quote > 2x lane average → flag)
- v1: Isolation Forest on accumulating platform data
- Production: Ensemble (Isolation Forest + Autoencoder + rules) with continuous learning

### Integration Points

- **All other agents**: Any agent output can trigger anomaly screening
- **Document Agent**: Cross-document discrepancies fed into anomaly scoring
- **Compliance Agent**: Compliance issues contribute to overall anomaly score
- **User Dashboard**: Anomaly alerts displayed prominently on shipment cards
- **Email/SMS notifications**: Critical anomalies trigger immediate broker notification
- **GHL CRM**: Alert logged to customer record for broker follow-up

### Development Phases

**MVP (Q2 2027) — 8 weeks**
- [ ] Rule-based anomaly detection (quote deviation, document field mismatches)
- [ ] OFAC re-screening on data changes
- [ ] Basic alert system (in-app notifications)
- [ ] Claude explainer for rule-triggered anomalies
- [ ] API endpoint: POST /api/agents/detect-anomaly

**v1 (Q3 2027) — 10 weeks**
- [ ] Isolation Forest model training on accumulated platform data
- [ ] Per-entity type (quote, document, shipment) model training
- [ ] Risk scoring matrix (fraud, compliance, operational)
- [ ] Alert prioritization engine
- [ ] Anomaly investigation UI (drill-down into what triggered alert)

**Production (Q4 2027) — 10 weeks**
- [ ] Ensemble anomaly detection (Isolation Forest + Autoencoder)
- [ ] Continuous model retraining as platform data grows
- [ ] Anomaly pattern library (known CBP risk patterns)
- [ ] Broker feedback loop (was this alert actionable? Refine model)
- [ ] Integration with CBP ACE alert feeds (if partnership established)

### Success Metrics

| Metric | MVP Target | v1 Target | Production Target |
|--------|-----------|-----------|------------------|
| Precision (alert = real issue) | 50% | 70% | 82% |
| Recall (catching real anomalies) | 60% | 75% | 85% |
| False positive rate | < 30% | < 20% | < 12% |
| Mean time to alert | < 60s | < 30s | < 10s |
| Alert actionability rate (broker acted on it) | — | 45% | 65% |
| CBP inspection prediction (shipments flagged for inspection) | — | 55% | 72% |

---

## Agent 7: FTZ Strategy Agent

### Purpose

Analyze a product's HTS classification, anticipated import volume, duty rates, and storage economics to recommend an optimal Foreign Trade Zone (FTZ) strategy. Specifically: whether to elect Privileged Foreign (PF) or Non-Privileged Foreign (NPF) zone status, when to lock duty rates, and how to schedule withdrawals to minimize total landed cost.

FTZ strategy decisions are currently made manually by experienced customs brokers using spreadsheets. A single wrong election — choosing NPF when tariffs subsequently rise, or delaying rate locking ahead of a Section 301 escalation — can cost importers six figures on a mid-size shipment. This agent converts institutional broker knowledge into a repeatable, data-driven recommendation engine.

### Input / Output Specification

**Input:**
```typescript
interface FTZStrategyRequest {
  product: {
    htsCode: string;                   // 10-digit HTS code (from Classification Agent)
    description: string;
    countryOfOrigin: string;           // ISO 3166-1 alpha-2
    unitValueFOB: number;              // USD per unit at origin
    totalUnits: number;                // Total units entering FTZ in analysis period
    unitOfMeasure: string;             // "each", "kg", "dozen", etc.
  };
  duties: {
    currentDutyRate: number;           // Current applicable rate as decimal (e.g., 0.065)
    section301Rate?: number;           // Additional Section 301 tariff if applicable
    gspEligible?: boolean;             // Eligible for Generalized System of Preferences
    freeTradeAgreement?: string;       // "USMCA", "KORUS", etc. if applicable
  };
  ftzScenario: {
    ftzZoneNumber?: string;            // e.g., "202" (LA/LB area), leave null for recommendation
    storageRatePerUnitPerMonth: number; // USD
    withdrawalFrequency: "weekly" | "biweekly" | "monthly" | "quarterly";
    unitsPerWithdrawal: number;
    analysisDurationMonths: number;    // 1-60
    anticipatedTariffChange?: {
      newRate: number;                 // Rate expected after change
      effectiveDate: string;           // ISO date of anticipated change
      confidence: "low" | "medium" | "high";
    };
  };
  importerProfile?: {
    annualImportVolumeUSD?: number;    // For recommending zone activation threshold
    existingFTZRelationship?: boolean; // Already operating under an FTZ agreement
    warehouseLocation?: string;        // City/state — for zone proximity matching
  };
}
```

**Output:**
```typescript
interface FTZStrategyResult {
  recommendation: {
    action: "use-ftz-pf" | "use-ftz-npf" | "standard-entry" | "defer-decision";
    primaryReason: string;             // Plain-English headline reason
    confidenceLabel: "high" | "medium" | "low";
    confidence: number;                // 0-1
  };
  statusElection: {
    recommended: "PF" | "NPF" | "not-applicable";
    rationale: string;                 // Why PF vs NPF for this product/scenario
    pfImplication: string;             // What PF locks in and when
    npfImplication: string;            // How NPF duty is calculated on withdrawal
    riskIfWrong: string;               // What happens if the election turns out suboptimal
  };
  financialProjection: {
    standardEntryTotalDuty: number;    // USD — baseline without FTZ
    ftzTotalDuty: number;              // USD — with recommended FTZ strategy
    totalStorageCost: number;          // USD — FTZ warehousing cost over analysis period
    netSavings: number;                // USD — after storage costs
    netSavingsPercent: number;         // As percentage of standard entry duty
    breakEvenMonths: number;           // Months until FTZ savings exceed storage costs
    withdrawalSchedule: WithdrawalPeriod[]; // Per-period breakdown
  };
  tariffLockingStrategy?: {
    recommendLockNow: boolean;
    lockingDeadline?: string;          // ISO date — "lock before this date"
    urgencyLevel: "none" | "low" | "medium" | "high" | "critical";
    reasoning: string;
    estimatedSavingsFromLocking: number; // USD if rate change materializes as anticipated
  };
  ftzZoneOptions?: {
    zoneNumber: string;
    zoneName: string;
    proximityToPort: string;
    operatorName: string;
    estimatedActivationCost: string;
    notes: string;
  }[];
  activationThreshold: {
    minimumAnnualDutySavingsForFTZ: number; // USD — generally $50K-$100K to justify setup costs
    currentProjectionMeetsThreshold: boolean;
    yearsToJustifyActivation?: number;
  };
  caveats: string[];                   // Regulatory limitations, assumptions, "consult a licensed broker" reminders
  dataAsOf: string;
  reviewRequired: boolean;             // True for PF elections, high-tariff items, or large volumes
}
```

### Data Sources

| Source | Type | Update Frequency | Notes |
|--------|------|-----------------|-------|
| USITC HTS schedule (shared with Agent 1) | Shared vector DB | Annual + interim | Duty rates by HTS code and country of origin |
| CBP FTZ Board regulations (19 CFR Part 146) | Static + periodic review | Regulatory updates | PF/NPF election rules, zone activation requirements |
| USTR Section 301 tariff lists + exclusions | CSV from ustr.gov | As-needed | Section 301 rates and granted exclusion status |
| US FTZ Board zone index | Public directory | Annual | Active FTZ zones by state/port — zone numbers, operators, addresses |
| Historical FTZ financial model data | Internal | Platform-generated | User-submitted scenarios build a benchmark library of actual savings achieved |
| Platform HTS classification output (Agent 1) | Real-time | Per classification | FTZ Agent reads HTS result directly from Shipment Context Store |
| Freight rate benchmarks (shared with Agent 2) | Shared cache | Weekly | For computing landed cost comparison |

### Model Approach

**Core: Deterministic Financial Modeling + Claude for Strategic Interpretation**

FTZ strategy involves precise financial calculations (duty arithmetic is deterministic) combined with strategic judgment that benefits from language model reasoning. The approach splits accordingly:

```
FTZStrategyRequest
  -> Deterministic financial modeling layer:
     - Calculate total duties: standard entry vs. FTZ (PF path vs. NPF path)
     - Apply Section 301 surcharges and GSP/FTA exclusions
     - Model withdrawal schedule: per-period duty, storage cost, net savings
     - Compute break-even analysis
     - Flag if anticipated tariff change alters recommendation
  -> Lookup layer:
     - HTS code → current duty rate (from Agent 1 shared index)
     - ZIP/city → nearest FTZ zones (from FTZ Board directory)
     - HTS code → PF/NPF implication lookup (curated rule table)
  -> Claude claude-sonnet-4-6 strategic reasoning:
     "Given this product (HTS: X, origin: VN, duty rate: 12%), this import volume ($Y/year),
      and this anticipated tariff change on [date], should the importer elect PF or NPF status?

      Financial projections: [calculated data]
      Current market context: [tariff news, Section 301 status]
      FTZ zone options near [location]: [zone list]

      Provide:
      1. Clear PF vs NPF recommendation with rationale
      2. Rate locking urgency assessment
      3. Whether FTZ activation cost is justified given projected savings
      4. Key risks and caveats the importer must understand"
  -> Structured output via Zod schema validation
  -> Flag for human review if: large volume (>$500K duty), PF election, uncertain tariff timing
```

**Why Claude for strategic interpretation (not pure rule engine):**
- PF vs NPF election is genuinely context-dependent: same HTS code may warrant different elections depending on tariff trajectory, storage economics, and importer's cash flow
- "Anticipated tariff change" scenarios require weighing probability, timing, and magnitude — LLM reasoning over retrieved context outperforms deterministic rules
- The rationale and caveats require plain-English explanation that brokers can communicate to clients
- Edge cases (FTA eligibility interacting with Section 301, multi-country components) require reasoning over retrieved regulatory text

**Why NOT end-to-end LLM:**
- Duty arithmetic must be precise and auditable — LLMs can make arithmetic errors on financial projections
- Break-even calculations and per-period withdrawal tables are deterministic financial models, not reasoning tasks
- Audit trail requires traceable calculation steps

### Prompt Strategy

**System prompt skeleton for FTZ strategic reasoning:**

```
You are an expert customs broker specializing in Foreign Trade Zone strategy for US importers sourcing from Southeast Asia.

You are helping a freight broker advise their client on whether and how to use an FTZ for a specific product import program.

CRITICAL RULES:
1. Always recommend the importer consult a licensed customs broker (19 USC 1641) before making binding FTZ elections
2. Never state a specific savings figure as guaranteed — always frame as projections based on stated assumptions
3. For Section 301 products, emphasize the locking deadline risk explicitly
4. PF elections are irrevocable per 19 CFR 146.41 — always flag this

CONTEXT PROVIDED TO YOU:
- Product: {hts_code}, {description}, origin: {origin_country}
- Duty rate: {duty_rate}% (+ {section_301_rate}% Section 301 if applicable)
- Import volume: {total_units} units at ${unit_value_fob}/unit = ${total_value} FOB
- Storage cost: ${storage_rate}/unit/month
- Analysis period: {months} months
- Withdrawal plan: {units_per_withdrawal} units {withdrawal_frequency}
- Financial projections: [INJECTED FROM CALCULATION LAYER]
- Nearest FTZ zones: [INJECTED FROM ZONE LOOKUP]
- Current tariff environment: [INJECTED FROM COMPLIANCE CONTEXT]

TASK: Analyze and recommend PF vs NPF election and rate locking strategy.
```

### Integration Points

- **HTS Classification Agent (Agent 1)**: HTS code and duty rate are primary inputs — FTZ Agent subscribes to HTS classification completion events
- **Compliance Agent (Agent 3)**: Reads Section 301 status, GSP eligibility, and any pending exclusion decisions for the product
- **Cost Optimization Agent (Agent 2)**: FTZ routing recommendations (bonded warehouse destination) are coordinated with route optimization
- **Forecast Agent (Agent 5)**: Rate forecasts inform "anticipated tariff change" scenarios — rising tariff environment increases FTZ urgency
- **FTZ Savings Analyzer Tool (PRD-03)**: The UI tool is powered by this agent's financial modeling layer — Agent 7 provides the "should I use FTZ?" intelligence on top of the calculator
- **User Dashboard**: FTZ recommendation surfaced on product/shipment cards where duty savings opportunity exists
- **GHL CRM**: FTZ opportunity flagged on customer records where product lines qualify

### Development Phases

**MVP (Q4 2026) — 6 weeks**
- [ ] Deterministic financial modeling engine (PF path vs. NPF path vs. standard entry)
- [ ] HTS code → duty rate lookup integration with Agent 1 shared index
- [ ] Section 301 surcharge and GSP/FTA flag integration
- [ ] Claude strategic reasoning with system prompt above
- [ ] FTZ zone directory lookup by importer location (5 major US ports)
- [ ] API endpoint: POST /api/agents/ftz-strategy
- [ ] Integration with FTZ Savings Analyzer tool UI (PRD-03)
- [ ] Structured output with caveats and "consult licensed broker" disclaimer

**v1 (Q1 2027) — 8 weeks**
- [ ] Tariff change scenario modeling (anticipated Section 301 escalations)
- [ ] Locking deadline calculator with urgency scoring
- [ ] Multi-product portfolio analysis (optimize across an importer's full product line)
- [ ] Activation cost threshold analysis (justify FTZ setup cost vs. projected savings)
- [ ] Historical scenario library — "importers similar to you saved $X"
- [ ] FTZ zone operator contact integration
- [ ] PDF strategy report generation (exportable for client presentations)

**Production (Q2 2027) — 8 weeks**
- [ ] Real-time tariff change monitoring integration with Compliance Agent
- [ ] Proactive alerts: "Your product line qualifies for FTZ — projected savings $X"
- [ ] Multi-origin blending analysis (goods from multiple countries → zone entry → US market)
- [ ] FTZ manipulation/manufacturing analysis (can product be transformed in zone to qualify for lower rate?)
- [ ] Benchmark comparison: actual savings vs. projected for past FTZ users

### Success Metrics

| Metric | MVP Target | v1 Target | Production Target |
|--------|-----------|-----------|------------------|
| Recommendation accuracy (vs. licensed customs broker) | Qualitative positive review | 80% agreement | 90% agreement |
| Financial model accuracy (vs. actual duty paid) | Within 5% of actual | Within 2% | Within 1% |
| User acceptance rate of PF/NPF recommendation | — | 55% | 70% |
| Average savings identified per qualifying shipment | — | $15,000+ | $25,000+ |
| False positive rate (recommending FTZ when not beneficial) | < 25% | < 15% | < 8% |
| Response latency (p50) | < 10s | < 5s | < 3s |

### Human-in-the-Loop Design

FTZ strategy decisions have significant financial and legal consequences. The agent applies conservative human review routing:

- **Always review:** PF status elections (irrevocable), any product with projected duty savings > $50,000
- **Review if:** Confidence < 0.75, product subject to Section 301 with pending exclusion, importer has no prior FTZ experience
- **Auto-approve:** Standard entry recommendation (do not use FTZ) when savings clearly do not justify activation costs
- **Mandatory disclaimer:** Every output includes "This analysis is for informational purposes only. FTZ elections are binding regulatory decisions and must be executed by or in consultation with a licensed customs broker (19 USC 1641)."

---

## Agent Orchestration Architecture

### Overview

Agents communicate through a central **Shipment Context Store** — a shared data object that accumulates as agents process a shipment. Agents are triggered by specific events and contribute their output back to the shared context.

```
                         ┌─────────────────────────────────────────┐
                         │          Shipment Context Store          │
                         │  (PostgreSQL record, updated in-place)   │
                         │                                          │
                         │  - htsCode (from Agent 1)               │
                         │  - optimalRoute (from Agent 2)          │
                         │  - complianceStatus (from Agent 3)      │
                         │  - extractedDocData (from Agent 4)      │
                         │  - rateForecast (from Agent 5)          │
                         │  - anomalyScore (from Agent 6)          │
                         └───────────────┬─────────────────────────┘
                                         │ read/write
                    ┌────────────────────┼────────────────────┐
                    │                    │                     │
              ┌─────▼──────┐    ┌────────▼───────┐   ┌────────▼───────┐
              │  Event Bus │    │  Agent Runner  │   │  Alert Engine  │
              │ (triggers) │    │ (task queue)   │   │  (notify user) │
              └─────┬──────┘    └────────┬───────┘   └────────┬───────┘
                    │                    │                     │
        ┌───────────┼────────────────────┼─────────────────────┼──────────┐
        │           │                    │                     │          │
   ┌────▼───┐  ┌────▼───┐  ┌───────────▼──┐  ┌──────────────▼──┐  ┌────▼───┐
   │Agent 1 │  │Agent 2 │  │  Agent 3     │  │   Agent 4        │  │Agent 5 │
   │HTS     │  │Cost    │  │  Compliance  │  │   Document       │  │Forecast│
   │Class.  │  │Optim.  │  │              │  │                  │  │        │
   └────────┘  └────────┘  └──────────────┘  └──────────────────┘  └────────┘
        │           │                                                    │
        └───────────┴────────────┐                                      │
                            ┌────▼───┐                                  │
                            │Agent 6 │◄─────────────────────────────────┘
                            │Anomaly │
                            └────────┘
```

### Event-Driven Triggers

| Trigger Event | Agents Invoked |
|--------------|----------------|
| New product description entered | Agent 1 (HTS Classification) |
| HTS code assigned or confirmed | Agent 3 (Compliance), Agent 2 (Cost — duty rate input), Agent 7 (FTZ Strategy — evaluate duty savings opportunity) |
| New carrier quote received | Agent 2 (Cost Optimization), Agent 6 (Anomaly — is quote normal?) |
| Document uploaded | Agent 4 (Document Processing) |
| Document data extracted | Agent 3 (Compliance validation), Agent 6 (Anomaly — cross-doc check) |
| Shipment created | Agent 5 (Forecast — optimal ship window), Agent 6 (baseline scan) |
| Compliance check completed | Agent 6 (incorporates compliance issues into anomaly score), Agent 7 (FTZ — Section 301 status may change recommendation) |
| Tariff change detected (via Compliance Agent monitoring) | Agent 7 (FTZ — re-evaluate locking urgency for active product lines) |
| Weekly schedule (background) | Agent 5 (model retraining), Agent 6 (model refresh), Agent 7 (check tariff change signals) |

### Inter-Agent Communication

Agents communicate **via the shared Shipment Context Store**, not directly with each other. This prevents tight coupling and enables independent deployment.

```typescript
// Each agent reads from and writes to the same context object
interface ShipmentContext {
  shipmentId: string;

  // Agent 1 output
  classification?: {
    htsCode: string;
    confidence: number;
    reviewRequired: boolean;
    completedAt: string;
  };

  // Agent 2 output
  optimization?: {
    recommendedRoute: RouteOption;
    negotiationTactics: NegotiationTactic[];
    completedAt: string;
  };

  // Agent 3 output
  compliance?: {
    status: "compliant" | "review-required" | "non-compliant" | "blocked";
    issues: ComplianceIssue[];
    completedAt: string;
  };

  // Agent 4 output
  documents?: {
    extractedData: ExtractedDocumentData[];
    discrepancies: Discrepancy[];
    completedAt: string;
  };

  // Agent 5 output
  forecast?: {
    rateForecast: TimeSeries[];
    optimalShipWindow: DateRange;
    completedAt: string;
  };

  // Agent 6 output
  anomaly?: {
    score: number;
    label: "normal" | "suspicious" | "anomalous" | "critical";
    alerts: AnomalyAlert[];
    completedAt: string;
  };

  // Agent 7 output
  ftzStrategy?: {
    recommendation: "use-ftz-pf" | "use-ftz-npf" | "standard-entry" | "defer-decision";
    netSavings: number;
    statusElection: "PF" | "NPF" | "not-applicable";
    lockingUrgency: "none" | "low" | "medium" | "high" | "critical";
    reviewRequired: boolean;
    completedAt: string;
  };
}
```

### Agent Runner

All agents are executed as **async background tasks** via a task queue (BullMQ or Vercel Queue) to prevent blocking the user interface. Long-running agents (Forecast, Document) are given higher timeout budgets.

```
API Route receives trigger event
  -> Validate and persist trigger to database
  -> Enqueue agent task in BullMQ
  -> Return 202 Accepted to client (with polling URL)
  -> BullMQ worker picks up task
  -> Agent executes, updates ShipmentContext in DB
  -> WebSocket push (or client polling) notifies UI
  -> UI renders updated agent output
```

**Timeout budgets by agent:**

| Agent | Max execution time | Retry strategy |
|-------|-------------------|---------------|
| HTS Classification | 30s | 3 retries with exponential backoff |
| Cost Optimization | 45s | 2 retries |
| Compliance | 60s | 2 retries |
| Document Processing | 120s per document | 2 retries (per document, not batch) |
| Forecast | 300s | 1 retry (model inference is slow) |
| Anomaly Detection | 15s | 3 retries |
| FTZ Strategy | 30s | 2 retries (financial model is fast; Claude call is the variable) |

---

## Training Data Strategy

### Phase 1: Bootstrap with Public Data

Before the platform has its own operational data, seed each agent's training and evaluation datasets from public sources.

| Agent | Bootstrap Data Source | Volume | Quality Notes |
|-------|----------------------|--------|---------------|
| HTS Classification | CBP Binding Rulings CROSS database | ~500K labeled examples (description → HTS code) | Gold standard — actual CBP determinations |
| Cost Optimization | Freightos FBX historical data (2019-present) + Drewry WCI | ~300 rate observations per lane | Representative of market rates |
| Compliance | CBP rulings, Federal Register notices, CFR publications | Comprehensive regulatory corpus | Text-based RAG, not labeled training examples |
| Document Processing | Sample BOL/invoice templates from major carriers | ~200 document templates | Templates only — real documents needed for production quality |
| Forecast | USITC trade statistics + FBX + Drewry (2015-2026) | 10+ years weekly rates | Sufficient for trend modeling; limited for rare events |
| Anomaly Detection | Platform generates its own normal data over time; public CBP enforcement stats as priors | CBP inspection rates by HTS chapter | Rule-based bootstrap; ML model starts learning at ~1K shipments |
| FTZ Strategy | CBP FTZ Board regulations (19 CFR Part 146), USITC HTS duty rates, FTZ zone directory | Regulatory corpus + curated PF/NPF rule table | Deterministic financial model needs no ML training; Claude RAG over regulatory text |

### Phase 2: Platform Data Flywheel

Once the platform has operational data, a virtuous cycle begins:

```
User submits shipment
  -> Agents process shipment (generate predictions)
  -> User accepts, modifies, or rejects each agent's output
  -> User feedback logged as labeled example
  -> Accepted predictions → positive training examples
  -> User corrections → high-quality corrected training examples
  -> Low-confidence cases that humans reviewed → calibration data
  -> Weekly model retraining incorporates new examples
  -> Improved models → better predictions → more user trust → more data
```

### Data Labeling Quality Controls

- **Double-labeling**: High-stakes corrections (HTS classification, compliance) reviewed by a second broker before entering training set
- **Adversarial review**: Monthly batch of 100 random agent outputs manually reviewed by domain expert for quality drift
- **Source tracking**: Every training example tagged with origin (CBP ruling, user correction, expert label) for auditability
- **Train/test split**: 80/10/10 (train/validation/holdout). Holdout set never used for training — only for final evaluation.
- **Temporal integrity**: Time series models always tested on data chronologically after training data (no leakage)

---

## Continuous Learning & Model Improvement

### Feedback Loops Per Agent

**Agent 1 (HTS Classification):**
- User accepts → positive example for this description + HTS code pair
- User corrects to different code → high-value training example with source label "user_correction"
- CBP binding ruling issued for similar product → auto-ingest as training example

**Agent 2 (Cost Optimization):**
- Broker uses recommended route + negotiation tactic → positive signal
- Broker ignores recommendation, manually selects different route → negative signal with correction
- Actual quote received after recommendation → compare to predicted; update calibration

**Agent 3 (Compliance):**
- CBP or FDA flags a shipment post-clearance → retrospective training example (missed issue)
- False positive (flagged as non-compliant, cleared without issue) → negative training example
- New regulation published → automatic re-RAG index update

**Agent 4 (Document Processing):**
- User corrects extracted field → correction logged with document image region
- Confirmed extraction (no corrections) → positive example

**Agent 5 (Forecast):**
- Actual rates realized → compare to predictions; update model weekly
- "Black swan" events (canal closures, carrier bankruptcies) → tagged as out-of-distribution; model retrained without or with explicit event features

**Agent 6 (Anomaly Detection):**
- Alert acted on (broker investigated, confirmed issue) → positive alert example
- Alert dismissed (broker marked as not actionable) → negative example → raises detection threshold
- CBP inspection on un-flagged shipment → missed anomaly → adds to training set

### Model Versioning

All models are versioned and tracked:

```
/models/
  hts-classifier/
    v1.0-2026-09-01/    # Embedding search baseline
    v1.1-2026-11-15/    # First fine-tuned version
    v2.0-2027-02-01/    # Multimodal version
  cost-optimizer/
    v1.0-2026-12-01/    # Claude RAG baseline
  compliance/
    v1.0-2026-12-01/    # Hybrid rule + RAG
    regulation-corpus/  # Versioned regulatory RAG index
  document/
    v1.0-2026-09-01/
  forecast/
    trade-lane-sea-usw/ # Per-lane model directories
      v1.0-2027-01-01/
  anomaly/
    v1.0-2027-06-01/
```

Each model version is evaluated on the held-out test set before promotion. Rollback capability: keep last 3 versions in production-ready state.

---

## Cost Estimation Summary

### Per-Agent Monthly Operating Costs (at 500 shipments/month volume)

**Agent 1: HTS Classification**

| Cost Component | MVP | v1 | Production |
|---------------|-----|----|-----------|
| OpenAI embeddings (text-embedding-3-large) | $8/mo | $8/mo | $8/mo |
| Claude claude-sonnet-4-6 (reranker, ~1K tokens/request) | $45/mo | $30/mo | $25/mo |
| pgvector hosting (part of DB) | $0 (shared) | $0 | $0 |
| Total | ~$53/mo | ~$38/mo | ~$33/mo |

**Agent 2: Cost Optimization**

| Cost Component | MVP | v1 | Production |
|---------------|-----|----|-----------|
| Claude claude-sonnet-4-6 (~3K tokens/request) | $75/mo | $60/mo | $50/mo |
| Carrier API calls (Maersk, CMA CGM free tiers) | $0 | $0 | $0 |
| Freightos FBX data access | $0 | $0 | $0 |
| Total | ~$75/mo | ~$60/mo | ~$50/mo |

**Agent 3: Compliance**

| Cost Component | MVP | v1 | Production |
|---------------|-----|----|-----------|
| Claude claude-sonnet-4-6 (~4K tokens/request) | $100/mo | $80/mo | $70/mo |
| OFAC SDN screening (self-hosted, no API cost) | $0 | $0 | $0 |
| CBP rulings RAG index (pgvector, shared) | $0 | $0 | $0 |
| Total | ~$100/mo | ~$80/mo | ~$70/mo |

**Agent 4: Document Processing**

| Cost Component | MVP | v1 | Production |
|---------------|-----|----|-----------|
| Claude claude-sonnet-4-6 Vision (~2K tokens + image/doc) | $180/mo | $140/mo | $110/mo |
| PDF processing compute (Vercel functions) | $20/mo | $15/mo | $15/mo |
| Storage for document images (S3/Vercel Blob) | $5/mo | $10/mo | $20/mo |
| Total | ~$205/mo | ~$165/mo | ~$145/mo |

**Agent 5: Forecast**

| Cost Component | MVP | v1 | Production |
|---------------|-----|----|-----------|
| XGBoost training (Vercel or VPS, weekly) | $30/mo | $40/mo | $60/mo |
| Claude claude-sonnet-4-6 (narrative ~2K tokens/request) | $25/mo | $30/mo | $40/mo |
| External rate data (FBX, Drewry — free public) | $0 | $0 | $0 |
| Total | ~$55/mo | ~$70/mo | ~$100/mo |

**Agent 6: Anomaly Detection**

| Cost Component | MVP | v1 | Production |
|---------------|-----|----|-----------|
| Rule engine (no LLM cost for rules) | $0 | $0 | $0 |
| Claude claude-sonnet-4-6 (explainer, ~1.5K tokens/anomaly) | $15/mo | $20/mo | $30/mo |
| Isolation Forest inference (in-process, no API) | $0 | $0 | $0 |
| Total | ~$15/mo | ~$20/mo | ~$30/mo |

**Total Platform AI Cost:**

| Phase | Monthly Cost | Per Shipment Cost |
|-------|-------------|------------------|
| MVP (Agents 1, 4) | ~$258/mo | ~$0.52 |
| v1 (All 6 agents) | ~$433/mo | ~$0.87 |
| Production | ~$428/mo | ~$0.86 |

*At 10x volume (5,000 shipments/month), costs scale roughly linearly to ~$4,300/mo or $0.86/shipment. This is well below the value delivered per shipment (broker fee: $200-2,000/shipment).*

---

## Development Timeline

### Gantt Overview

```
2026 Q3 (Jul-Sep):   Agent 1 MVP + Agent 4 MVP
2026 Q4 (Oct-Dec):   Agent 2 MVP + Agent 3 MVP + Agent 1 v1 + Agent 4 v1
2027 Q1 (Jan-Mar):   Agent 2 v1 + Agent 3 v1 + Agent 5 MVP
                     Agent 1 Production + Agent 4 Production
2027 Q2 (Apr-Jun):   Agent 2 Production + Agent 3 Production
                     Agent 5 v1 + Agent 6 MVP
2027 Q3 (Jul-Sep):   Agent 5 Production + Agent 6 v1
2027 Q4 (Oct-Dec):   Agent 6 Production
```

### Milestone Gates

Each agent must pass these gates before moving from MVP → v1 → Production:

**MVP → v1 Gate:**
- [ ] API endpoint live and documented
- [ ] UI integrated (agent output visible in dashboard)
- [ ] Accuracy metrics meet or exceed MVP targets (see per-agent tables)
- [ ] Human review queue operational
- [ ] Error handling: graceful fallbacks for API failures
- [ ] < 5% error rate in production over 2-week observation period

**v1 → Production Gate:**
- [ ] All v1 accuracy metrics met
- [ ] Human review rate below v1 target (agent is trusted enough for production)
- [ ] Feedback loop operational (corrections flowing back to training)
- [ ] Load test: handles 50 concurrent requests without degradation
- [ ] Cost per inference within 10% of estimate
- [ ] Audit trail complete (every agent decision is logged with inputs + outputs)

---

## A/B Testing & Rollout Strategy

### Rollout Approach: Gradual Traffic Shifting

No agent launches to 100% of shipments immediately. Each agent goes through staged rollout:

```
Stage 1 — Shadow Mode (2 weeks):
  Agent runs in background on all shipments
  Output logged but NOT shown to users
  Compare agent output to what brokers actually do manually
  No user impact, zero risk

Stage 2 — Opt-In (4 weeks):
  Agent output available to users who explicitly request it
  Labeled: "AI Suggestion — review before accepting"
  Track: what % of users who see it accept it?

Stage 3 — Default On (4 weeks):
  Agent output shown by default to all users
  One-click dismiss available
  Track: dismiss rate, correction rate

Stage 4 — Primary Workflow (ongoing):
  Agent output is the primary workflow path
  Human review only for flagged/low-confidence cases
  Monitor accuracy metrics continuously
```

### A/B Test Design for Each Agent

**Agent 1 (HTS Classification) A/B Test:**
- Control: Manual HTS code lookup (current workflow)
- Treatment: Agent 1 classification with user confirmation
- Primary metric: Time to HTS code assignment (minutes)
- Secondary metrics: Classification accuracy, user satisfaction (NPS)
- Minimum sample size: 200 classifications per arm

**Agent 2 (Cost Optimization) A/B Test:**
- Control: Broker manually selects route/carrier
- Treatment: Agent 2 recommendation presented first
- Primary metric: Cost per shipment (USD)
- Secondary metrics: Broker acceptance rate, negotiation tactic utilization

**Agent 3 (Compliance) A/B Test:**
- Control: Manual compliance checklist (current SOP)
- Treatment: Agent 3 automated compliance check
- Primary metric: CBP hold/flag rate (shipments flagged after departure)
- Note: Retrospective analysis required (outcome known weeks after shipment)

### Rollback Triggers

Each agent has defined rollback triggers that revert to shadow mode:

| Trigger | Action |
|---------|--------|
| Error rate > 5% in any 24-hour window | Automatic rollback to shadow mode |
| User correction rate > 40% for 3 consecutive days | Alert + manual rollback review |
| Accuracy metric drops > 15% from baseline | Automatic rollback |
| CBP compliance incident traced to agent recommendation | Immediate rollback + incident review |

---

## Human-in-the-Loop Workflows

### Principles

1. **Agents assist, humans decide** — No agent takes autonomous action on external systems (CBP filing, carrier booking, document submission). Agents always surface a recommendation for human approval.
2. **Confidence-gated autonomy** — Higher confidence → less friction for human. Low confidence → mandatory review.
3. **Explainable by default** — Every agent recommendation includes a plain-English rationale. No "trust the model" black boxes.
4. **Audit trail** — Every human decision (accept/reject/modify) logged with timestamp, user ID, and original agent output.

### Review Queue Design

All agents route low-confidence or high-risk outputs to a central **Review Queue** in the broker dashboard:

```
┌─────────────────────────────────────────────────────────┐
│  REVIEW QUEUE (7 items requiring attention)              │
├─────────────────────────────────────────────────────────┤
│ 🔴 URGENT: Compliance Issue — Shipment SS-2024-0392     │
│    Agent 3: Possible CPSC Section 15 reporting trigger  │
│    [View Details] [Dismiss] [Escalate to CBP Counsel]   │
├─────────────────────────────────────────────────────────┤
│ 🟡 HTS Classification Review — SS-2024-0388            │
│    Agent 1: 67% confidence — 3402.90.5000 vs 3402.20   │
│    Description: "Surfactant cleaning concentrate, ind." │
│    [Accept 3402.90.5000] [Edit] [Request CBP Ruling]   │
├─────────────────────────────────────────────────────────┤
│ 🟡 Document Discrepancy — SS-2024-0391                 │
│    Agent 4: BOL gross weight (23,450 kg) ≠ Packing List│
│    (21,200 kg). Difference: 2,250 kg.                  │
│    [View Documents] [Mark Resolved] [Notify Shipper]   │
└─────────────────────────────────────────────────────────┘
```

### Escalation Paths

| Scenario | Escalation Level | Response Required |
|----------|-----------------|------------------|
| Compliance: Potential OFAC match | Immediate human review | Within 1 hour |
| Compliance: FDA recall risk | Compliance team review | Within 4 hours |
| Anomaly: Critical score (> 0.9) | Senior broker + legal counsel | Within 2 hours |
| HTS: Low confidence, high-duty item | Customs broker review | Before shipment |
| Document: Missing ISF | Immediate broker action | 24hr before vessel departure |
| Forecast: Extreme rate spike predicted | Notify customer + lock rate | Broker judgment |

---

## Evaluation Framework

### Evaluation Cadence

| Frequency | Activity |
|-----------|----------|
| Real-time | Agent error rate monitoring (PagerDuty alerts) |
| Daily | Correction rate tracking per agent |
| Weekly | Full metric dashboard review by engineering team |
| Monthly | Comprehensive accuracy evaluation against held-out test set |
| Quarterly | Formal model evaluation by domain expert + engineering; go/no-go for model upgrades |

### Cross-Agent Evaluation

Beyond individual agent metrics, evaluate the **pipeline as a whole**:

- **End-to-end accuracy**: Does a shipment processed through all relevant agents (1 → 3 → 4) have fewer errors than manual processing?
- **Human time saved**: Hours saved per shipment across all agent interventions
- **CBP hold rate**: Are agent-processed shipments held by CBP less frequently than non-agent-processed shipments?
- **Customer satisfaction**: NPS score of shipments where agents participated vs. manual workflows

### Cost-Benefit Tracking

For each agent in production, track:
- **Agent cost per shipment** (API calls + compute)
- **Human time saved per shipment** (minutes × broker hourly rate)
- **Error cost avoided** (estimated CBP penalty × probability of catch)
- **Net ROI** = (Time saved + Error avoidance) − Agent cost

Target: Every production agent must demonstrate > 5x ROI within 90 days of launch.

---

*Document maintained by the Shipping Savior engineering team. For questions, open a Linear issue in the Shipping Savior project.*

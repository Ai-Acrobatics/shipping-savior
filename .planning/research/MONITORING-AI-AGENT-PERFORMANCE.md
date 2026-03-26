# AI Agent Performance Monitoring — Shipping Savior Platform

**Linear:** AI-5417
**Phase:** 2 — Architecture, Pipeline, AI Agents, GTM, Financial
**Created:** 2026-03-26
**Status:** Research / Reference

---

## Table of Contents

1. [Overview](#overview)
2. [Per-Agent Metrics](#per-agent-metrics)
   - [Agent 1: HTS Classification](#agent-1-hts-classification)
   - [Agent 2: Cost Optimization](#agent-2-cost-optimization)
   - [Agent 3: Compliance](#agent-3-compliance)
   - [Agent 4: Document Processing](#agent-4-document-processing)
   - [Agent 5: Forecast](#agent-5-forecast)
   - [Agent 6: Anomaly Detection](#agent-6-anomaly-detection)
   - [Agent 7: FTZ Strategy](#agent-7-ftz-strategy)
3. [Evaluation Framework](#evaluation-framework)
4. [Drift Detection](#drift-detection)
5. [Feedback Loops](#feedback-loops)
6. [Cost Management](#cost-management)
7. [Logging Strategy](#logging-strategy)
8. [Observability Infrastructure](#observability-infrastructure)

---

## Overview

The Shipping Savior platform deploys seven specialized AI agents across two technology tiers:

- **Tier 1 (Embedding Search):** HTS Classification, Document Processing — use OpenAI embeddings + vector search with Claude reranking
- **Tier 2 (RAG + LLM):** Cost Optimization, Compliance, FTZ Strategy — use Claude claude-sonnet-4-6 with retrieval-augmented context
- **Tier 3 (Hybrid ML + LLM):** Forecast, Anomaly Detection — use XGBoost/Isolation Forest with LLM narrative layers

Each tier has different monitoring concerns:
- Tier 1: embedding quality, retrieval precision, reranker calibration
- Tier 2: RAG relevance, output schema compliance, reasoning quality
- Tier 3: ML model metrics (MAPE, precision/recall) + LLM narrative quality

This document defines what to measure, how to measure it, and what to do when numbers degrade.

---

## Per-Agent Metrics

### Agent 1: HTS Classification

**Purpose:** Classify product descriptions into 10-digit HTS codes.

#### Accuracy Metrics

| Metric | Description | MVP Target | v1 Target | Production Target |
|--------|-------------|------------|-----------|------------------|
| Top-1 accuracy (10-digit) | Exact 10-digit code match on golden test set | 55% | 75% | 85% |
| Top-1 accuracy (6-digit heading) | Correct 6-digit heading, even if 10-digit differs | 70% | 85% | 92% |
| Top-3 accuracy (10-digit) | Correct code appears in top 3 results | 75% | 88% | 95% |
| High-confidence result rate | % of queries returning confidence >= 0.75 | 40% | 60% | 75% |
| User correction rate | % of accepted results later corrected by user | < 30% | < 15% | < 8% |
| Human review rate | % of queries routed to human review queue | 60% | 35% | 20% |
| Section 301 flag accuracy | Correct identification of Section 301 applicability | 90% | 97% | 99% |

**Measurement method:** Weekly batch evaluation against golden test set (see Evaluation Framework). User correction rate measured in production via feedback loop.

#### Latency Targets

| Percentile | MVP Target | v1 Target | Production Target |
|------------|------------|-----------|------------------|
| P50 | < 5s | < 2s | < 1s |
| P95 | < 12s | < 5s | < 3s |
| P99 | < 20s | < 10s | < 5s |

**Latency breakdown components:**
- Preprocessing + embedding generation: ~200-400ms (OpenAI API)
- Vector search (pgvector): ~50-150ms (local)
- Claude reranker call: ~1-4s (Claude API, 20 candidates)
- Schema validation + response assembly: ~50ms

**Latency optimization path:** Cache embeddings for repeat product descriptions. Pre-warm top-1000 product categories. Switch from claude-sonnet-4-6 to claude-haiku for reranking when P95 exceeds budget.

#### Cost Per Call

| Phase | Model Used | Tokens (Input) | Tokens (Output) | Cost Per Call | Notes |
|-------|-----------|----------------|-----------------|---------------|-------|
| MVP | OpenAI text-embedding-3-large + Claude claude-sonnet-4-6 | ~2,000 input (embedding) + ~4,000 input (reranker) | ~500 | $0.045–$0.065 | Embedding: $0.00013/1K tokens. Reranker: Claude claude-sonnet-4-6 input $0.003/1K, output $0.015/1K |
| v1 | Fine-tuned classifier + Claude fallback | ~500 input (fine-tuned) + ~4,000 (fallback, 35% of calls) | ~500 (fallback) | $0.012–$0.025 | Fine-tuned model cheaper; Claude fallback only for low-confidence |
| Production | Fine-tuned (primary) + Claude claude-sonnet-4-6 (fallback, 20%) | — | — | $0.008–$0.018 | Multimodal adds ~$0.02 when image provided |

**Token estimate basis:**
- Product description + preprocessing context: ~500 tokens
- 20 HTS candidates (code + description): ~1,500 tokens
- CBP ruling excerpts (retrieval): ~2,000 tokens
- System prompt + instructions: ~500 tokens
- Output (ranked codes + rationale): ~500 tokens

---

### Agent 2: Cost Optimization

**Purpose:** Recommend optimal carrier routes and negotiation tactics.

#### Accuracy Metrics

| Metric | Description | MVP Target | v1 Target | Production Target |
|--------|-------------|------------|-----------|------------------|
| Expert agreement rate | % of recommendations where licensed broker agrees with primary recommendation (blind review) | Qualitative positive | 80% | 90% |
| User acceptance rate | % of primary recommendations accepted by broker | — | 50% | 65% |
| Savings identified vs. first quote | Average % savings on accepted recommendations | — | 10–15% | 18–25% |
| Negotiation tactic utilization | % of surfaced tactics actually used by broker | — | 40% | 55% |
| Route accuracy | Recommended route actually available on target ship date | — | 85% | 95% |
| Landed cost estimate error | % deviation from actual landed cost (post-shipment audit) | — | < 15% | < 8% |

**Measurement method:** Expert review panel (monthly, 50 random sample); post-shipment survey comparing actual cost to recommendation; broker UI for accepting/modifying recommendations.

#### Latency Targets

| Percentile | MVP Target | v1 Target | Production Target |
|------------|------------|-----------|------------------|
| P50 | < 15s | < 8s | < 5s |
| P95 | < 30s | < 18s | < 12s |
| P99 | < 45s | < 30s | < 20s |

**Latency breakdown:**
- Route calculation (searoute-js): ~200ms
- RAG retrieval (carrier rates, port congestion): ~300–500ms
- Claude reasoning + output generation: ~4–12s (primary bottleneck — long context)
- Savings calculation vs. benchmarks: ~100ms

#### Cost Per Call

| Phase | Model | Tokens (Input) | Tokens (Output) | Cost Per Call |
|-------|-------|----------------|-----------------|---------------|
| MVP | Claude claude-sonnet-4-6 | ~6,000 | ~1,500 | $0.040–$0.060 |
| v1 | Claude claude-sonnet-4-6 | ~8,000 (more carrier data) | ~1,500 | $0.055–$0.075 |
| Production | Claude claude-sonnet-4-6 | ~10,000 | ~2,000 | $0.070–$0.100 |

**Token estimate basis:**
- Shipment spec: ~400 tokens
- Retrieved carrier rates (5 carriers × 3 routes): ~2,500 tokens
- Port congestion data: ~500 tokens
- Historical quote context: ~1,500 tokens
- Market benchmark data: ~800 tokens
- System prompt: ~700 tokens
- Output (recommendation + 3 alternatives + negotiation tactics): ~1,500 tokens

---

### Agent 3: Compliance

**Purpose:** Check shipments against CBP, FDA, OFAC, FTC, USDA requirements.

#### Accuracy Metrics

| Metric | Description | MVP Target | v1 Target | Production Target |
|--------|-------------|------------|-----------|------------------|
| Compliance issue detection rate | % of issues that later caused CBP hold or delay that were pre-flagged | 60% | 80% | 92% |
| False positive rate | % of flagged issues that turned out non-issues | < 40% | < 20% | < 10% |
| OFAC screening accuracy | Correct identification of sanctioned entity (must be near-perfect) | 99.9% | 99.99% | 99.999% |
| Document completeness accuracy | % of missing documents correctly identified | 85% | 93% | 98% |
| Section 301 surcharge accuracy | Correct surcharge rate applied for given HTS + origin | 92% | 97% | 99% |
| Regulatory coverage | Agencies with complete rule coverage | CBP, OFAC | + FDA, CPSC, FTC | + USDA, EPA, ATF |
| User satisfaction (5-point scale) | Broker rating of compliance report usefulness | — | 3.5+ | 4.2+ |

**Critical note on OFAC:** 99.9% is a floor, not a target. Any missed OFAC match is a legal and reputational catastrophe. OFAC screening must be deterministic (rule-based SDN list matching), not LLM-based. Monitor OFAC false-negative rate as a severity-1 metric.

#### Latency Targets

| Percentile | MVP Target | v1 Target | Production Target |
|------------|------------|-----------|------------------|
| P50 | < 10s | < 5s | < 3s |
| P95 | < 20s | < 12s | < 7s |
| P99 | < 30s | < 20s | < 12s |

**Latency breakdown:**
- Rule engine layer (OFAC, doc completeness, HTS-to-agency mapping): ~200–400ms
- RAG retrieval (CBP rulings, FDA guidance): ~300–500ms
- Claude reasoning pass: ~3–8s
- Risk scoring calculation: ~100ms

#### Cost Per Call

| Phase | Model | Tokens (Input) | Tokens (Output) | Cost Per Call |
|-------|-------|----------------|-----------------|---------------|
| MVP | Claude claude-sonnet-4-6 + rule engine | ~5,000 | ~1,000 | $0.030–$0.048 |
| v1 | Claude claude-sonnet-4-6 + rule engine | ~7,000 (more agency coverage) | ~1,200 | $0.044–$0.064 |
| Production | Claude claude-sonnet-4-6 + rule engine | ~9,000 | ~1,500 | $0.058–$0.083 |

**Token estimate basis:**
- Product/shipment specification: ~600 tokens
- Retrieved CBP rulings (top 5 relevant): ~2,000 tokens
- FDA/CPSC/FTC guidance (when applicable): ~1,500 tokens
- HTS-to-agency rule context: ~500 tokens
- System prompt + compliance instructions: ~800 tokens
- Output (issues, requirements, recommended actions): ~1,000 tokens

---

### Agent 4: Document Processing

**Purpose:** Extract structured data from shipping documents (BOL, commercial invoice, packing list, etc.).

#### Accuracy Metrics

| Metric | Description | MVP Target | v1 Target | Production Target |
|--------|-------------|------------|-----------|------------------|
| Field extraction accuracy (BOL) | % of fields correctly extracted from bill of lading | 85% | 92% | 96% |
| Field extraction accuracy (commercial invoice) | % of fields correctly extracted from commercial invoice | 82% | 90% | 95% |
| Field extraction accuracy (packing list) | % of fields correctly extracted | — | 88% | 94% |
| Discrepancy detection rate | % of cross-document discrepancies correctly flagged | 70% | 85% | 93% |
| False discrepancy rate | % of flagged discrepancies that are actually valid | < 20% | < 12% | < 6% |
| HTS code extraction accuracy | % of HTS codes on invoices correctly extracted vs. manual verification | 88% | 94% | 98% |
| Document parse success rate | % of uploaded documents successfully parsed (not rejected) | 90% | 96% | 99% |
| Human review rate | % of extractions requiring manual correction | 30% | 15% | 8% |
| Carrier template coverage | Number of carrier BOL formats handled accurately | 5 carriers | 15 carriers | 30+ carriers |

**Measurement method:** Random weekly sample (n=50) with human gold-label comparison. Track per-document-type and per-carrier-template accuracy separately. Parse success rate tracked automatically via schema validation failures.

#### Latency Targets

| Percentile | MVP Target | v1 Target | Production Target |
|------------|------------|-----------|------------------|
| P50 | < 30s | < 15s | < 8s |
| P95 | < 60s | < 30s | < 18s |
| P99 | < 90s | < 50s | < 30s |

**Latency breakdown (per document):**
- PDF → image conversion (pdf2pic, 300 DPI): ~2–8s (scales with page count)
- Image preprocessing (sharp.js): ~1–2s
- Claude Vision extraction call: ~8–20s (primary bottleneck — vision + long output)
- Zod schema validation: ~50ms
- Cross-document reconciliation (separate Claude call): ~3–8s additional

#### Cost Per Call

| Phase | Model | Tokens (Input) | Tokens (Output) | Cost Per Call (single doc) |
|-------|-------|----------------|-----------------|---------------------------|
| MVP | Claude claude-sonnet-4-6 Vision (BOL + invoice) | ~2,000 text + 1 image (~1,500 image tokens) | ~800 | $0.038–$0.055 |
| v1 | Claude claude-sonnet-4-6 Vision (all doc types) | ~2,000 text + 1 image | ~1,000 | $0.042–$0.060 |
| Production | Claude claude-sonnet-4-6 Vision (batch) | ~2,000 text + image | ~1,000 per doc | $0.035–$0.055 per doc (batch discount) |

**Multi-document shipment cost:** Average 8–12 documents per shipment. Full shipment processing: $0.28–$0.66 at v1, plus cross-reconciliation call (~$0.05).

**Token estimate basis:**
- Document image: ~1,500 image tokens (estimated for standard letter-size document at 300 DPI)
- Extraction schema instructions: ~800 tokens
- System prompt: ~400 tokens
- Output (extracted JSON): ~800–1,200 tokens depending on document density

---

### Agent 5: Forecast

**Purpose:** Predict container freight rates, port congestion, and demand by trade lane.

#### Accuracy Metrics

| Metric | Description | MVP Target | v1 Target | Production Target |
|--------|-------------|------------|-----------|------------------|
| 4-week rate MAPE | Mean Absolute Percentage Error vs. realized rate | < 20% | < 12% | < 8% |
| 2-week rate MAPE | Shorter horizon should be more accurate | < 12% | < 8% | < 5% |
| Directional accuracy | % of weeks where predicted direction (rising/falling/stable) matches reality | 60% | 70% | 78% |
| Prediction interval coverage | % of realized rates that fall within stated 80% confidence interval | 65% | 76% | 82% |
| Trade lane coverage | Number of trade lanes with active models | 5 | 15 | 30+ |
| Model retraining freshness | Maximum age of training data in production model | 7 days | 7 days | 1–2 days |
| Forecast-influenced bookings | % of bookings where user consulted forecast before deciding | — | 20% | 35% |
| User engagement | % of sessions where forecast widget viewed | — | 40% | 65% |

**Note on MAPE targets:** Ocean freight forecasting is inherently difficult — the COVID supply chain shock showed that geopolitical/pandemic events can cause 400%+ rate spikes unpredictable by any model. MAPE targets assume normal market conditions. During extreme volatility events, the system should surface a "high uncertainty" flag and widen confidence intervals rather than claim false precision.

#### Latency Targets

| Percentile | MVP Target | v1 Target | Production Target |
|------------|------------|-----------|------------------|
| P50 | < 8s | < 4s | < 2s |
| P95 | < 15s | < 8s | < 4s |
| P99 | < 25s | < 15s | < 8s |

**Latency breakdown:**
- XGBoost prediction (pre-loaded model): ~50–200ms
- Confidence interval calculation: ~100ms
- Market context retrieval (news/events): ~300–500ms
- Claude narrative generation: ~3–7s (primary bottleneck)

**Optimization:** Cache forecast results for 4–24 hours per trade lane (rates don't change minute-to-minute). Serve cached forecasts for most requests; refresh on weekly model retraining cycle.

#### Cost Per Call

| Phase | Model | Tokens (Input) | Tokens (Output) | Cost Per Call |
|-------|-------|----------------|-----------------|---------------|
| MVP | XGBoost (free) + Claude claude-sonnet-4-6 narrative | ~2,500 | ~800 | $0.020–$0.030 |
| v1 | XGBoost + Claude narrative | ~3,500 | ~1,000 | $0.028–$0.042 |
| Production | ML ensemble + Claude narrative | ~4,000 | ~1,200 | $0.034–$0.050 |

**Note:** ML model itself is zero marginal cost once trained. Claude narrative is ~70% of total cost per call. If cost pressure increases, consider templated narrative (string interpolation instead of Claude) for routine forecast updates, reserving Claude for high-volatility or unusual market conditions.

---

### Agent 6: Anomaly Detection

**Purpose:** Detect unusual patterns in quotes, documents, and shipments.

#### Accuracy Metrics

| Metric | Description | MVP Target | v1 Target | Production Target |
|--------|-------------|------------|-----------|------------------|
| Precision (true positive rate) | % of raised alerts that were real anomalies (broker confirmed) | 50% | 70% | 82% |
| Recall (sensitivity) | % of real anomalies that were caught and alerted | 60% | 75% | 85% |
| F1 Score | Harmonic mean of precision and recall | 0.55 | 0.73 | 0.84 |
| False positive rate | % of flagged entities that are normal | < 30% | < 20% | < 12% |
| Alert actionability rate | % of alerts that broker acted on (not dismissed) | — | 45% | 65% |
| CBP inspection prediction | % of shipments flagged as high-risk that actually received CBP exam | — | 55% | 72% |
| Mean time to alert | From entity creation/update to alert generated | < 60s | < 30s | < 10s |
| Model freshness | Age of Isolation Forest model in production | Rule-based | 14 days | 7 days |

**Note on precision vs. recall tradeoff:** Early stage (MVP), prefer higher recall (catch more true anomalies even at cost of more false positives). As the platform grows and brokers get alert fatigue, shift toward higher precision. Configure alert thresholds accordingly.

#### Latency Targets

| Percentile | MVP Target | v1 Target | Production Target |
|------------|------------|-----------|------------------|
| P50 | < 5s | < 3s | < 1s |
| P95 | < 15s | < 8s | < 3s |
| P99 | < 30s | < 15s | < 6s |

**Latency breakdown:**
- Feature extraction: ~100–300ms
- Isolation Forest scoring: ~10–50ms (very fast, runs in memory)
- Threshold classification: ~5ms
- Claude explainer call (only for anomalous entities): ~3–8s
- Alert dispatch: ~200ms

**Key insight:** Because Claude is only called when an anomaly is detected (not on every entity), average cost and latency are much lower than worst-case P99 above.

#### Cost Per Call

| Phase | Model | Tokens (Input) | Tokens (Output) | Cost Per Call |
|-------|-------|----------------|-----------------|---------------|
| MVP (rule-based only) | Rule engine only | — | — | $0.000 |
| v1 (Isolation Forest + Claude for anomalies) | Claude claude-sonnet-4-6 (anomalous only, ~25% of calls) | ~2,000 | ~600 | $0.009 avg (blended) |
| Production (ensemble + Claude) | Claude claude-sonnet-4-6 (anomalous only, ~15% of calls) | ~2,500 | ~700 | $0.007 avg (blended) |

**Blended cost calculation:** Most entities score as normal and never touch Claude. Claude cost is only incurred for the ~25% (v1) to ~15% (production) of entities flagged as anomalous.

---

### Agent 7: FTZ Strategy

**Purpose:** Recommend PF/NPF status election and duty locking strategy for Foreign Trade Zone usage.

#### Accuracy Metrics

| Metric | Description | MVP Target | v1 Target | Production Target |
|--------|-------------|------------|-----------|------------------|
| Expert agreement rate | % of recommendations that match licensed customs broker's assessment (blind review) | Qualitative positive | 80% | 90% |
| Financial model accuracy | % deviation of projected duty savings from actual savings (post-implementation audit) | Within 5% | Within 2% | Within 1% |
| User acceptance rate (PF/NPF recommendation) | % of recommendations accepted without modification | — | 55% | 70% |
| False positive rate (recommending FTZ when suboptimal) | % of FTZ recommendations where broker determined standard entry was better | < 25% | < 15% | < 8% |
| Average savings identified (qualifying shipments) | USD savings identified per shipment where FTZ is recommended | — | $15,000+ | $25,000+ |
| Locking deadline accuracy | Days of error on recommended duty locking deadline | — | ± 3 days | ± 1 day |
| Break-even calculation accuracy | % deviation from actual break-even period (post-implementation) | Within 15% | Within 5% | Within 2% |
| Review routing accuracy | % of high-stakes cases (>$50K savings) correctly routed to human review | 95% | 99% | 100% |

#### Latency Targets

| Percentile | MVP Target | v1 Target | Production Target |
|------------|------------|-----------|------------------|
| P50 | < 10s | < 5s | < 3s |
| P95 | < 20s | < 10s | < 6s |
| P99 | < 30s | < 18s | < 10s |

**Latency breakdown:**
- Deterministic financial modeling (PF vs. NPF vs. standard entry): ~200–500ms
- HTS rate lookup (from Agent 1 shared index): ~100ms
- FTZ zone directory lookup: ~50ms
- Section 301 status lookup: ~100ms
- Claude strategic reasoning call: ~4–10s (primary bottleneck)
- Structured output validation: ~100ms

#### Cost Per Call

| Phase | Model | Tokens (Input) | Tokens (Output) | Cost Per Call |
|-------|-------|----------------|-----------------|---------------|
| MVP | Claude claude-sonnet-4-6 | ~5,500 | ~1,500 | $0.039–$0.057 |
| v1 | Claude claude-sonnet-4-6 | ~7,000 (multi-product portfolio) | ~2,000 | $0.051–$0.075 |
| Production | Claude claude-sonnet-4-6 | ~8,500 | ~2,500 | $0.066–$0.095 |

**Token estimate basis:**
- Product/duty specification: ~500 tokens
- Financial projection data (calculated): ~800 tokens
- FTZ zone options (nearest 3–5 zones): ~600 tokens
- Section 301 + regulatory context: ~1,500 tokens
- Historical FTZ scenario benchmarks: ~1,000 tokens
- System prompt (including compliance mandates): ~700 tokens
- Output (recommendation + rationale + caveats + withdrawal schedule): ~1,500–2,500 tokens

---

## Evaluation Framework

### Golden Test Set Construction

A golden test set is a curated dataset of inputs with known-correct outputs, used for offline evaluation. Each agent needs its own.

#### Agent 1: HTS Classification Golden Set

**Construction:**
1. **CBP Binding Rulings as ground truth.** Download 500K+ rulings from rulings.cbp.gov. Each ruling contains: product description, HTS code assigned, ruling date, binding classification. This is the highest-quality ground truth available — CBP rulings are authoritative.
2. **Stratified sampling.** Sample 1,000–2,000 rulings stratified by HTS chapter (50 chapters × ~30 examples each) to avoid bias toward common product categories.
3. **Recency weighting.** Oversample rulings from the past 3 years (HTS schedule changes; old rulings may use deprecated codes).
4. **Difficulty tiers.** Label each example as Easy (common product, unambiguous), Medium (requires materials/use context), or Hard (ambiguous, multiple plausible codes). Target 40/40/20 split.
5. **Human verification.** Have a licensed customs broker review 100 random examples for quality control before locking the test set.

**Evaluation protocol:** Run the full classification pipeline. Compare predicted top-1 HTS code (10-digit) vs. ruling code. Compute top-1 accuracy overall and per difficulty tier.

#### Agent 2: Cost Optimization Golden Set

**Construction:**
1. **Expert panel review.** Identify 10–15 real historical shipments where the optimal routing decision is known post-hoc (actual shipment completed, cost known). Have 3 licensed freight brokers independently assess what the "correct" recommendation would have been.
2. **Use majority vote** among 3 experts as ground truth label.
3. **Scenario diversity.** Include examples across SE Asia → US West Coast, SE Asia → US East Coast (via Panama), cold chain vs. dry, urgent vs. economy.
4. **Synthetic scenarios.** For early testing before live data: construct 50 synthetic shipments using market rate data, with expert-labeled "correct" recommendations.

**Note:** Cost Optimization cannot be evaluated purely quantitatively. Accuracy = expert agreement rate. Track this monthly with a rotating panel of 2–3 licensed brokers.

#### Agent 3: Compliance Golden Set

**Construction:**
1. **CBP hold incidents as ground truth.** Compile known CBP holds, FDA alerts, OFAC matches from public data (CBP Penalty Notices, FDA Import Alerts) for specific HTS codes and product types. These are confirmed compliance issues — did the agent catch them?
2. **OFAC screening golden set.** Use the SDN list itself. Construct 500 test cases: 200 exact SDN matches, 150 near-misses (slightly misspelled names), 150 clear non-matches. OFAC must achieve 100% recall on exact matches.
3. **Regulatory coverage matrix.** For each agency (CBP, FDA, CPSC, FTC, USDA), define 20 HTS codes that definitely trigger that agency's requirements. Verify the agent correctly flags all of them.

**Evaluation protocol:** Monthly automated run against golden set. OFAC sub-test runs nightly.

#### Agent 4: Document Processing Golden Set

**Construction:**
1. **Hand-labeled document corpus.** Collect 50 real shipping documents per type (BOL, commercial invoice, packing list, certificate of origin) from the founder's historical shipments. Manually extract all field values as ground truth.
2. **Carrier diversity.** Include BOLs from Maersk, CMA CGM, MSC, COSCO, ONE, Evergreen (the major SE Asia carriers). Accuracy must hold across templates.
3. **Quality variation.** Include scanned PDFs (low quality), native PDFs (high quality), and mixed documents (stamp annotations, handwritten notes). Tag each by quality tier.

**Evaluation protocol:** Field-level accuracy (was each extracted field value correct?). Separate metrics per document type and per quality tier.

#### Agent 5: Forecast Golden Set

**Construction:**
1. **Historical time series as ground truth.** Use FBX/Drewry/SCFI indices from 2020–2025. Hold out the last 12 months as test data. Train on prior 4 years.
2. **Walk-forward validation.** Evaluate at each week in the test window: given data up to week W, how accurate is the 4-week forecast for week W+4? This mimics production conditions.
3. **Trade lane stratification.** Evaluate separately per trade lane — SE Asia → US West Coast, SE Asia → US East Coast, SE Asia → US Gulf, North Europe → US.
4. **Volatility regime labeling.** Tag each test week as low/medium/high volatility. Expect MAPE to be higher during high-volatility periods.

#### Agent 6: Anomaly Detection Golden Set

**Construction:**
1. **Confirmed incident labeling.** Review the founder's historical shipments for known problems: quotes that came in unusually high, documents with errors, shipments that got CBP holds. Label these as true anomalies.
2. **Normal baseline.** Sample 200 historical shipments with no known issues as negative examples.
3. **Synthetic injection.** Create 50 synthetic anomalies by artificially modifying field values (change quote price to 3x lane average, swap shipper/consignee countries, mismatched container weights).

**Note:** Early platform has limited historical data. Prioritize rule-based test cases for MVP (quote > 2x lane average, weight discrepancy > 10%). Isolation Forest golden set grows as platform accumulates data.

#### Agent 7: FTZ Strategy Golden Set

**Construction:**
1. **Licensed customs broker review.** Source 25–30 real FTZ strategy decisions made by experienced customs brokers. Input: product specs, duty rates, storage costs, analysis period. Output: PF/NPF recommendation with rationale. Use broker's recommendation as ground truth.
2. **Financial model verification.** For each scenario, compute expected duty savings manually and verify the agent's financial projections match within 1%.
3. **Regulatory edge cases.** Include cases with: GSP-eligible products, Section 301 products with pending exclusions, products with FTA eligibility, and multi-origin shipments.

### A/B Testing Approach for Model Upgrades

When upgrading a model or changing prompts, use shadow mode A/B testing before routing production traffic.

**Process:**

```
Phase 1: Shadow Mode (2 weeks)
- Route 100% of production requests to Model A (current)
- Simultaneously send 100% to Model B (candidate) — results NOT shown to users
- Compare outputs: agreement rate, latency distribution, cost per call
- Set threshold: Model B must match or exceed Model A on golden test set accuracy before proceeding

Phase 2: Canary (1 week)
- Route 5% of production traffic to Model B
- Monitor: error rate, latency, user correction rate, explicit feedback
- Alert threshold: if Model B error rate > 2x Model A, auto-rollback

Phase 3: Gradual Rollout
- 5% → 20% → 50% → 100% over 2 weeks
- Monitor metrics at each step
- Rollback plan: one-click return to Model A (feature flag)

Key metrics to compare during A/B:
- Accuracy: golden test set score (automated)
- User correction rate: did users override the output? (real-world signal)
- Latency: P50/P95 comparison
- Cost per call: token usage comparison
- User satisfaction: explicit thumbs up/down (when surfaced in UI)
```

**Model upgrade triggers:**
- Claude releases a new model version → run shadow test immediately
- OpenAI releases new embedding model → compare cosine similarity quality on golden set before switching
- Current model MAPE / accuracy degrades > 5% from baseline → investigate root cause, may indicate drift rather than model issue

---

## Drift Detection

Accuracy degradation can happen silently. The following mechanisms detect it before users notice.

### Types of Drift

| Drift Type | Description | Affects | Detection Method |
|------------|-------------|---------|-----------------|
| **Data drift** | Input distribution shifts (new product types, new trade lanes) | All agents | Monitor input feature distributions (description length, product categories, port frequencies) vs. training distribution |
| **Label drift** | What constitutes a "correct" output changes (tariff schedule update, new regulations) | Agent 1, 3, 7 | Monitor user correction rate spike, compare against regulatory update calendar |
| **Concept drift** | Relationship between input and output changes (market conditions, carrier behavior) | Agent 2, 5, 6 | Monitor accuracy on rolling held-out window vs. training window |
| **Data source drift** | External data sources change format or availability | All agents | Automated schema validation on each data source pull |

### Agent-Specific Drift Triggers

#### Agent 1: HTS Classification

**Primary drift trigger:** Annual USITC HTS schedule update (January) + interim updates.

| Signal | Detection Method | Response |
|--------|-----------------|----------|
| User correction rate rises > 5% week-over-week | Alert: possible HTS schedule change | Check USITC change log, re-index affected chapters |
| Confidence distribution shifts downward | Monitor weekly P25/P50/P75 of confidence scores | Investigate if specific product categories affected |
| New product category in inputs with low confidence | Monitor % of queries with `productCategory` = "unknown" or low-confidence results clustering | Add to human review queue; consider expanding training data |
| USITC publishes HTS revision notice | Calendar-triggered alert | Schedule re-indexing pipeline within 48h of USITC publication |

**Auto-detection rule:** If rolling 7-day user correction rate for any HTS chapter rises > 15% (from baseline < 8%), trigger alert and flag that chapter for re-evaluation.

#### Agent 3: Compliance

**Primary drift trigger:** Regulatory changes (new FDA guidance, CPSC rule, OFAC addition, Section 301 tariff change).

| Signal | Detection Method | Response |
|--------|-----------------|----------|
| OFAC SDN list updated | Daily diff of SDN list download | Immediate re-index; alert if > 50 new entities added (potential geopolitical event) |
| Federal Register notices | Subscribe to FR API for CBP, FDA, CPSC, FTC rules | Flag new rules for manual compliance team review and RAG update |
| User-reported false negative | User flags "agent didn't catch X but CBP held shipment" | High priority: investigate and update rule engine |
| Compliance check pass rate changes ±5% week-over-week | Automated monitoring | Possible regulatory change or data drift |

**Critical monitoring:** Compliance Agent operates in a regulated domain. False negatives (missing a real compliance issue) are worse than false positives. If recall drops below threshold, prefer to increase false positives until root cause is fixed.

#### Agent 5: Forecast

**Primary drift trigger:** Market regime changes (pandemic-level supply chain disruption, Panama Canal drought, major port strike).

| Signal | Detection Method | Response |
|--------|-----------------|----------|
| Rolling 4-week MAPE exceeds 1.5x production target | Automated weekly evaluation | Flag as "high uncertainty" in UI; widen confidence intervals; alert broker |
| Realized rates outside 90% prediction interval for 3+ consecutive weeks | Statistical test | Retrain model with expanded context window; review feature engineering |
| New exogenous shock detected (news monitoring) | RSS feed monitoring for "port strike", "canal closure", "tariff announcement" | Surface "market disruption alert" in forecast UI; note model trained before this event |
| Model training data becomes stale | Track age of oldest training data | Retrain immediately if > 14 days on new data |

**Governance rule:** During extreme events (MAPE > 30%), display confidence interval explicitly in the UI and note: "Current market conditions are outside historical training data. Use forecasts as directional guidance only."

#### Agent 6: Anomaly Detection

**Primary drift trigger:** "Normal" changes as platform grows and market conditions evolve.

| Signal | Detection Method | Response |
|--------|-----------------|----------|
| Alert rate changes > 20% week-over-week | Automated monitoring | Investigate: new anomalous patterns vs. baseline drift |
| Broker dismissal rate for alerts rises > 50% | Track "dismissed without action" in UI | Precision is degrading; recalibrate threshold or retrain Isolation Forest |
| New entity type enters the system | Monitor input distribution | May need separate model for new entity type |
| Isolation Forest anomaly score distribution shifts | Monitor weekly histogram of scores | Retrain if score distribution diverges from training-time distribution by > 2 standard deviations |

### Automated Drift Monitoring Infrastructure

```
Weekly Automated Evaluation Job:
  1. Run each agent against its golden test set
  2. Compare accuracy to last week's score and production baseline
  3. If degradation > threshold → create Linear ticket automatically
  4. Email digest: weekly agent performance report to engineering lead

Thresholds for auto-alerting:
  - Agent 1: Top-1 accuracy (10-digit) drops > 3% from baseline
  - Agent 2: User acceptance rate drops > 5% from baseline
  - Agent 3: OFAC recall drops ANY amount (zero tolerance)
  - Agent 3: Issue detection rate drops > 3% from baseline
  - Agent 4: Field extraction accuracy drops > 2% from baseline
  - Agent 5: 4-week MAPE rises > 3 percentage points from baseline
  - Agent 6: Precision drops > 5% OR recall drops > 5% from baseline
  - Agent 7: Expert agreement rate drops > 3% from baseline
```

---

## Feedback Loops

### How Users Correct Agent Mistakes

Every agent output surfaced to the user has an inline correction mechanism. The correction event is logged and fed into the improvement pipeline.

#### Correction UI Patterns by Agent

**Agent 1 (HTS Classification):**
- Broker sees top-3 results with confidence scores
- "Edit" button on primary result opens HTS search widget
- Broker can select different code or type 10-digit code directly
- Required: brief reason field ("wrong chapter", "material mismatch", "binding ruling differs")

**Agent 3 (Compliance):**
- Each flagged issue has "Dismiss" with reason (dropdown: "Not applicable to this product", "Already handled", "Incorrect regulation cited")
- Missing issue: "Add issue" button to log a compliance problem the agent missed

**Agent 4 (Document Processing):**
- Extracted fields shown in form, editable inline
- "Mark as incorrect" per field — user types correct value
- "Discrepancy not real" — dismiss flagged discrepancy with reason

**Agent 5 (Forecast):**
- After shipment completes: actual freight rate logged vs. predicted
- Automatic post-hoc accuracy tracking (no user action needed — actual rate captured from invoice)

**Agent 6 (Anomaly Detection):**
- Each alert: "Real issue" or "Dismiss" with reason
- "Dismiss" reasons: "Expected variation", "Known market condition", "Carrier-specific", "Data error"
- "Real issue" → broker logs what action was taken

**Agent 7 (FTZ Strategy):**
- After strategy implementation: actual duty paid vs. projected tracked automatically
- Broker can flag recommendation as "implemented", "modified and implemented", or "rejected" with reason

### How Corrections Improve Future Performance

```
User Correction Event
  -> Logged to corrections table with:
     - agent_id
     - original_input (serialized)
     - agent_output (serialized)
     - correction (what user changed it to)
     - reason (if provided)
     - timestamp
     - user_confidence (how confident is the user? high/medium/unsure)

Downstream processing:
  1. Agent 1 (HTS): corrections with user_confidence=high become training candidates
     - Weekly batch: export corrections for fine-tuning pipeline review
     - Threshold: 50+ corrections on same product category → trigger targeted re-evaluation
     - Auto-update: if correction changes HTS code, invalidate cached embeddings for similar descriptions

  2. All agents: corrections feed into accuracy metric calculation
     - user_correction_rate = corrections / accepted_outputs (rolling 7 days)
     - Rising correction rate = early signal of drift

  3. Agent 6 (Anomaly): broker feedback on alerts retrains alert threshold
     - "Real issue" labels = positive training examples
     - "Dismiss" with reason = negative training examples
     - Monthly: retrain Isolation Forest threshold using accumulated labels

  4. Agent 5 (Forecast): actual rates auto-logged, no correction needed
     - Post-hoc error calculated weekly per trade lane
     - Added to training data on next weekly retraining cycle
```

### Correction Quality Gates

Not all corrections are equally valuable as training data. Apply quality gates:

| Correction Quality | Criteria | Use for Training |
|-------------------|----------|-----------------|
| Gold | Licensed customs broker; confidence=high; correction has CBP binding ruling citation | Yes, immediately |
| Silver | Any user; confidence=high; correction is unambiguous (different HTS chapter entirely) | Yes, after 5+ similar corrections |
| Bronze | Any user; confidence=medium or no reason given | Use for metrics only; do not directly add to training data |
| Suspect | Correction is itself inconsistent with HTS schedule | Flag for expert review; do not use |

### Human Review Queue

High-stakes or low-confidence outputs route to a human review queue before being shown to the end user or used for downstream decisions.

| Agent | Route to Human Review When | SLA |
|-------|---------------------------|-----|
| Agent 1 | Confidence < 0.75, or Section 301 product | 4 hours |
| Agent 2 | First time on new trade lane, or savings > $50K identified | 2 hours |
| Agent 3 | riskScore > 70, or OFAC near-match | 30 minutes |
| Agent 4 | extractionConfidence < 0.80, or weight/value discrepancy detected | 4 hours |
| Agent 5 | Model in high-volatility regime (MAPE recently > 20%) | 24 hours |
| Agent 6 | alertPriority = "critical" | 15 minutes |
| Agent 7 | PF election recommendation, or projected savings > $50K | 2 hours |

---

## Cost Management

### Monthly API Budget Estimates

Estimates based on the blended per-call costs from the Per-Agent Metrics section. Assumes all 7 agents are active (not all agents are active in early phases — see timeline in AI-AGENT-PLANS.md).

#### At 100 requests/day (~3,000/month)

| Agent | Calls/Month | Cost/Call | Monthly Cost |
|-------|-------------|-----------|-------------|
| Agent 1 (HTS Classification) | 3,000 | $0.050 avg (MVP) | $150 |
| Agent 2 (Cost Optimization) | 1,500 (50% of shipments) | $0.060 avg | $90 |
| Agent 3 (Compliance) | 3,000 | $0.038 avg | $114 |
| Agent 4 (Document Processing) | 1,500 (10 docs × $0.045 each) | $0.450 per shipment | $675 |
| Agent 5 (Forecast) | 600 (20% of sessions view forecast) | $0.025 avg | $15 |
| Agent 6 (Anomaly) | 9,000 (every entity: quote, doc, shipment) | $0.009 avg | $81 |
| Agent 7 (FTZ Strategy) | 900 (30% of shipments qualify) | $0.048 avg | $43 |
| **Total** | | | **~$1,168/month** |

**Dominant cost:** Agent 4 (Document Processing) due to Claude Vision and multi-document processing per shipment. At 100 req/day, document processing alone is 58% of total AI spend.

#### At 1,000 requests/day (~30,000/month)

| Agent | Calls/Month | Monthly Cost |
|-------|-------------|-------------|
| Agent 1 | 30,000 | $1,500 |
| Agent 2 | 15,000 | $900 |
| Agent 3 | 30,000 | $1,140 |
| Agent 4 | 15,000 shipments × $0.45 | $6,750 |
| Agent 5 | 6,000 | $150 |
| Agent 6 | 90,000 | $810 |
| Agent 7 | 9,000 | $432 |
| **Total** | | **~$11,682/month** |

#### At 10,000 requests/day (~300,000/month)

| Agent | Calls/Month | Monthly Cost |
|-------|-------------|-------------|
| Agent 1 | 300,000 | $15,000 |
| Agent 2 | 150,000 | $9,000 |
| Agent 3 | 300,000 | $11,400 |
| Agent 4 | 150,000 shipments × $0.40 (batch discount) | $60,000 |
| Agent 5 | 60,000 (cache helps significantly) | $1,500 |
| Agent 6 | 900,000 | $8,100 |
| Agent 7 | 90,000 | $4,320 |
| **Total** | | **~$109,320/month** |

**At 10K requests/day, negotiate volume pricing with Anthropic (typically 30–50% discount at this tier).**

### When to Switch Models

Model selection decisions are cost-quality tradeoffs. The following rules govern model switching:

#### Downgrade to Faster/Cheaper Model

| Trigger | Action |
|---------|--------|
| Monthly AI spend > 20% of revenue | Audit each agent; identify cheapest model that meets accuracy threshold |
| Agent 1 top-1 accuracy (6-digit) > 92% on golden set | Replace Claude reranker with claude-haiku for reranking — saves ~70% on reranker cost |
| Agent 2 or 3 P95 latency consistently < target | Switch to claude-haiku for 30–50% cost reduction |
| Agent 5 or 6 LLM narrative quality rated 4.0+ by users | Switch narrative generator to claude-haiku; same quality at lower cost |
| Agent 4 extraction accuracy stable at 95%+ for 60 days | Test switching to gpt-4o-mini for document extraction (potentially cheaper) |

**Model tiering strategy:**
```
claude-sonnet-4-6: Complex reasoning, structured output, high-stakes decisions (FTZ, Compliance)
claude-haiku:      High-volume, lower-complexity tasks (narrative summaries, reranking when model mature)
OpenAI embedding:  Semantic search (Agent 1) — compare text-embedding-3-small vs. 3-large at volume
```

#### Upgrade to More Capable Model

| Trigger | Action |
|---------|--------|
| Agent 1 user correction rate plateaus > 15% for 60+ days | Test claude-sonnet-4-5 or fine-tuned model for classification |
| Agent 3 issue detection rate < 70% after 90 days | Upgrade to more capable model or add more regulation context |
| Agent 7 expert agreement rate < 70% at v1 | Longer context window model; more regulatory context in prompt |
| Anthropic releases significantly better model (>10% benchmark improvement) | Run shadow test immediately |

#### Cost Optimization Tactics by Phase

**MVP (pre-revenue / early revenue):**
- Aggressive caching: cache Agent 1 results for identical product descriptions (30-day TTL)
- Cache Agent 5 forecasts for 24 hours per trade lane
- Batch Agent 4 document processing with async queue (no need for real-time)
- Set hard monthly spend cap ($2,000) with alerts at $1,500

**v1 (growing revenue, 100–1,000 req/day):**
- Negotiate Anthropic committed use discount (if spending > $5K/month)
- Implement request deduplication (same product queried twice → return cached result)
- Consider fine-tuned smaller model for Agent 1 classification (replaces expensive Claude reranker)
- Switch Agent 5 and 6 narrative layers to claude-haiku (quality typically sufficient for narrative text)

**Production (10K+ req/day):**
- Anthropic enterprise agreement for volume pricing
- Self-hosted embedding model (alternative: fine-tune text-embedding-ada-002 equivalent on CBP rulings)
- Consider running Agent 6 Isolation Forest inference entirely in-memory on app servers (near-zero marginal cost)
- Reserve claude-sonnet-4-6 / future flagship model for Agents 3 and 7 only (compliance + FTZ are highest stakes)

---

## Logging Strategy

### What to Log Per Agent Invocation

Every agent invocation must produce a structured log entry stored in the database (not just stdout). This enables debugging, performance analysis, audit trails, and training data collection.

#### Universal Log Schema (all agents)

```typescript
interface AgentInvocationLog {
  // Identity
  invocationId: string;           // UUID — unique per call
  agentId: "hts-classification" | "cost-optimization" | "compliance" |
           "document-processing" | "forecast" | "anomaly-detection" | "ftz-strategy";
  agentVersion: string;           // Semantic version of agent code (e.g., "1.2.3")
  modelId: string;                // Actual model called (e.g., "claude-sonnet-4-6-20241022")
  promptVersion: string;          // Hash of system prompt used (detect prompt changes)

  // Request context
  shipmentId?: string;            // Associated shipment (if applicable)
  userId: string;                 // User who triggered the call
  triggeredBy: "user-action" | "automated-event" | "background-job";
  requestTimestamp: string;       // ISO 8601

  // Input (sanitized for PII)
  inputSummary: Record<string, unknown>; // Serialized input, PII-scrubbed
  inputTokenCount: number;        // Tokens sent to LLM

  // Processing
  retrievedContextSources?: string[]; // Which data sources were retrieved (for RAG agents)
  retrievedChunkCount?: number;   // Number of RAG chunks retrieved
  cachehit: boolean;              // Was this served from cache?

  // Output
  outputTimestamp: string;        // ISO 8601
  latencyMs: number;              // End-to-end latency in milliseconds
  outputTokenCount: number;       // Tokens in response
  totalCostUSD: number;           // Calculated cost for this invocation
  outputSummary: Record<string, unknown>; // Serialized output
  schemaValidationPassed: boolean; // Did Zod schema validation pass?

  // Quality signals
  confidenceScore?: number;       // 0-1, where agent produces one
  routedToHumanReview: boolean;   // Did this get sent to review queue?
  humanReviewReason?: string;     // Why it was routed

  // Errors
  errorCode?: string;
  errorMessage?: string;
  retryCount: number;

  // Feedback (populated later by feedback loop)
  userCorrected?: boolean;
  correctionTimestamp?: string;
  correctionDeltaDescription?: string; // What changed (not the raw correction)
  userFeedbackScore?: 1 | 2 | 3 | 4 | 5; // Explicit rating if provided
}
```

#### Agent-Specific Additional Log Fields

**Agent 1 (HTS Classification):**
```typescript
{
  topPredictedCode: string;       // Primary HTS code predicted
  topConfidenceScore: number;
  alternativeCodesCount: number;  // How many alternatives returned
  retrievalCandidateCount: number;// How many embedding matches before reranking
  section301Flagged: boolean;
  cbpRulingsCited: string[];      // Ruling IDs used in retrieval
}
```

**Agent 3 (Compliance):**
```typescript
{
  overallStatus: string;          // compliant/review-required/non-compliant/blocked
  riskScore: number;
  issueCount: number;
  blockerCount: number;
  ofacScreeningResult: "clear" | "flagged" | "near-match";
  agenciesChecked: string[];      // ["CBP", "FDA", "OFAC"]
  regulationDataAsOf: string;     // ISO date of most recent regulation data used
}
```

**Agent 4 (Document Processing):**
```typescript
{
  documentType: string;
  pageCount: number;
  ocrQuality: "high" | "medium" | "low"; // Assessed by Claude or preprocessing
  extractedFieldCount: number;
  nullFieldCount: number;         // Fields present in schema but not found in document
  discrepanciesFound: number;
  carrierDetected?: string;       // Which carrier's BOL format was detected
}
```

**Agent 5 (Forecast):**
```typescript
{
  tradeLane: string;
  forecastHorizonWeeks: number;
  modelType: "xgboost" | "lightgbm" | "ensemble";
  trainingDataAsOf: string;
  predictedRateUSD: number;
  confidenceIntervalLower: number;
  confidenceIntervalUpper: number;
  marketRegime: "normal" | "volatile" | "extreme";
  featuresUsed: string[];         // Feature names from model
}
```

**Agent 6 (Anomaly Detection):**
```typescript
{
  entityType: string;
  anomalyScore: number;
  anomalyLabel: string;
  detectionMethod: "rule-based" | "isolation-forest" | "ensemble";
  rulesTriggered?: string[];      // For rule-based detection
  featureDeviations?: Record<string, number>; // Which features deviated and by how much
  alertPriority: string;
  alertDispatched: boolean;
}
```

**Agent 7 (FTZ Strategy):**
```typescript
{
  htsCode: string;
  countryOfOrigin: string;
  recommendedAction: string;      // use-ftz-pf / use-ftz-npf / standard-entry / defer
  recommendedElection: string;    // PF / NPF / not-applicable
  projectedNetSavingsUSD: number;
  confidenceScore: number;
  section301Applicable: boolean;
  lockingUrgency: string;
  reviewRequired: boolean;
  financialModelRunTimeMs: number; // How long the deterministic calculation took
}
```

### Log Retention Policy

| Log Category | Retention Period | Rationale |
|-------------|-----------------|-----------|
| Full invocation logs (all fields) | 2 years | Debugging, audit trail, model improvement |
| Invocation metadata (no content) | 5 years | Cost tracking, usage analytics, compliance audit |
| User corrections | Indefinitely | Training data gold mine; never delete |
| OFAC screening logs | 7 years | US regulatory requirement for sanctions compliance records |
| Error logs | 1 year | Debugging; compress after 90 days |
| Cost/billing logs | 5 years | Financial auditing |

### Log Access Controls

- Full invocation logs (including input/output): engineering team only
- Invocation metadata and cost logs: engineering + finance
- User correction logs: engineering + ML team
- OFAC logs: engineering + compliance officer only
- No raw PII in logs: sanitize importer EIN, names → anonymized IDs before logging

### Real-Time Dashboards

Track these live dashboards (suggest: Grafana or Vercel Analytics + custom):

1. **Cost dashboard:** Daily/weekly/monthly spend per agent, total vs. budget, cost per request trend
2. **Latency dashboard:** P50/P95/P99 per agent, latency distribution histogram, slow request rate
3. **Quality dashboard:** User correction rate per agent (rolling 7-day), human review queue depth, agent confidence distribution
4. **Error dashboard:** Error rate per agent, schema validation failure rate, retries per agent
5. **Business dashboard:** Savings identified per request, FTZ elections triggered, compliance issues caught

---

## Observability Infrastructure

### Recommended Stack

| Component | Tool | Rationale |
|-----------|------|-----------|
| Structured logging | PostgreSQL `agent_invocation_logs` table | Queryable, already in stack, avoids external dependency in early phase |
| Real-time metrics | Vercel Analytics (built-in) + custom Postgres aggregation | Zero additional cost for web vitals; Postgres for agent-specific |
| Error alerting | Sentry (free tier for MVP) | Exception capture, performance monitoring, integrates with Next.js |
| Cost tracking | Custom dashboard reading `agent_invocation_logs` | Track spend per agent, per user, per day |
| Uptime monitoring | Vercel built-in | Agent API routes monitored automatically |
| ML experiment tracking | Weights & Biases (free tier) for Agent 5 model training | Standard for XGBoost/LightGBM experiment management |
| Alert dispatch | PagerDuty or Linear + Telegram webhook | P0 alerts for OFAC failures, cost spikes, critical anomaly queue backup |

### Upgrade Path

- **MVP:** Postgres logs + Vercel Analytics + Sentry
- **v1 (1K req/day):** Add Grafana (self-hosted on existing VPS) for real-time dashboards
- **Production (10K req/day):** Evaluate Datadog or Axiom for log aggregation and search; current cost at this tier justifies dedicated observability tooling

### Critical Alerts (PagerDuty / immediate response)

| Alert | Condition | Severity |
|-------|-----------|---------|
| OFAC recall failure | Any test case where known SDN entity returns "clear" | P0 — page immediately |
| Agent 3 down | Compliance API error rate > 5% for 5 minutes | P0 — compliance is blocking |
| Cost spike | Hourly AI spend > 3x 7-day hourly average | P1 — possible runaway loop |
| Agent 4 parse failure spike | Document parse success rate < 80% for 10 minutes | P1 |
| All agents latency spike | P95 across all agents > 2x target for 10 minutes | P2 |
| User correction rate spike | Any agent correction rate > 25% in past hour | P2 — drift or incident |

---

*Research completed: 2026-03-26*
*Ready for implementation planning: yes*
*Dependencies: AI-AGENT-PLANS.md (AI-5411), STACK.md, DATA-SOURCE-VALIDATION.md*

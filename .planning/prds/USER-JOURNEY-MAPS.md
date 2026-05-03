# User Journey Maps — Shipping Savior

**Linear:** AI-5420
**Parent:** Phase 4 — Complete Platform Specification
**Version:** 1.0
**Date:** 2026-03-26

---

## Table of Contents

1. [Persona Profiles](#1-persona-profiles)
2. [Journey A: Independent Importer](#2-journey-a-independent-importer)
3. [Journey B: Freight Broker](#3-journey-b-freight-broker)
4. [Journey C: FTZ Operator](#4-journey-c-ftz-operator)
5. [Cross-Journey Analysis](#5-cross-journey-analysis)
6. [Onboarding Journeys](#6-onboarding-journeys)
7. [Error & Recovery Paths](#7-error--recovery-paths)
8. [Metrics & Success Criteria](#8-metrics--success-criteria)

---

## 1. Persona Profiles

### Persona A — "Import Indie" (Independent Importer)

| Attribute | Detail |
|-----------|--------|
| **Name** | Maya Chen |
| **Age** | 32 |
| **Role** | Founder / Owner |
| **Company** | Solo e-commerce business selling home goods on Amazon FBA and Shopify |
| **Company Size** | 1 person + 1 virtual assistant (Philippines) |
| **Location** | San Diego, CA |
| **Import Volume** | 3-6 FCL per year from Vietnam and Thailand |
| **Annual Import Spend** | $120K-$350K (FOB value) |
| **Revenue** | $400K-$900K |
| **Tech Sophistication** | Low-Medium. Comfortable with Shopify, Google Sheets, basic web tools. No ERP. No customs software. |
| **Education** | Marketing degree; learned importing from YouTube and Reddit r/ecommerce |

**Goals:**
- Know exact landed cost per unit BEFORE placing a purchase order
- Classify products with the correct HTS code without guessing
- Understand whether an FTZ strategy makes sense at her volume
- Compare forwarder quotes objectively instead of trusting one relationship

**Pain Points (ranked):**
1. **Landed cost miscalculation** — discovers true margins only after goods arrive. "I thought I was making 40%, ended up at 15% after duties and fees I didn't know about."
2. **HTS code uncertainty** — picks the code that "looks closest" and prays CBP agrees. Fear of $5K+ penalties.
3. **Tariff volatility** — Section 301 rates changed twice in the last year. Cannot model scenarios.
4. **No carrier visibility** — locked into one freight forwarder with no benchmark data.
5. **Documentation chaos** — scrambles for documents via email threads when forwarder requests them.

**Current Tool Stack:**
- Google Sheets (landed cost spreadsheet, breaks constantly)
- USITC.gov (HTS lookup, "designed for lawyers")
- Alibaba / WeChat (supplier communication)
- Flexport portal (tracking, "clunky, not real-time")
- trade.gov / CBP.gov ("government nightmare, give up after 5 minutes")

**Decision-Making:** Word of mouth in import Facebook groups. Evaluates by free trial. Purchases after one painful experience (surprise duty bill). No procurement process — she IS the decision-maker.

**Willingness to Pay:** $49-$199/month. Ceiling at ~$250 — "beyond that I'll just hire a customs broker consultant." High price sensitivity, prefers monthly billing, no annual lock-in.

**Value Anchor:** "If this saves me even one bad shipment, it pays for itself in 10 minutes."

---

### Persona B — "The Broker" (Freight Broker)

| Attribute | Detail |
|-----------|--------|
| **Name** | Marcus Davis |
| **Age** | 41 |
| **Role** | Owner / Lead Broker |
| **Company** | Independent freight brokerage, FMCSA licensed, specializing in SE Asia ocean imports |
| **Company Size** | 4 people (Marcus + 2 brokers + 1 admin) |
| **Location** | Long Beach, CA |
| **Shipment Volume** | 60-120 shipments per month |
| **Annual Revenue** | $1.2M (margin on carrier rates + forwarder fees) |
| **Revenue Model** | Buy carrier rate at X, sell at X + margin. Typical margin: $200-$800 per FEU. |
| **Tech Sophistication** | Medium. Uses DAT/Truckstop for domestic rates, MarineTraffic for vessel tracking. Power user of Excel. |
| **Licensing** | FMCSA broker authority + NVOCC license for international |

**Goals:**
- Create professional client proposals in under 10 minutes (not a typed email)
- Have a unified dashboard for all active shipments across carriers
- Instantly detect ADD/CVD risk before quoting a lane
- Scale from 100 to 200+ shipments/month without hiring

**Pain Points (ranked):**
1. **Rate research is 80% of time** — calls 5+ carriers per shipment. "I spend half my day on the phone instead of finding new customers."
2. **No unified carrier view** — 6 browser tabs open at all times to check vessel schedules.
3. **Quote presentation is amateur** — big 3PLs send slick proposals; Marcus sends an email table. Loses deals on optics.
4. **No backhaul visibility** — 40% cheaper lanes exist but only discoverable through personal carrier relationships.
5. **HTS/duty blind spots** — misses ADD/CVD risk, quotes a lane, then client gets hit with 330% antidumping duty. Relationship damaged.

**Current Tool Stack:**
- DAT / Truckstop.com (spot rates, domestic only)
- MarineTraffic.com (free vessel tracking)
- Excel (margin calculator, client tracking)
- QuickBooks (invoicing, reconciliation)
- Email + phone (carrier rate requests, client communication)
- Shared Google Drive (BOL archive, no structured search)

**Decision-Making:** Evaluates tools by ROI per saved hour. If a tool saves 2 hours/day at 250 working days, that is 500 hours. At $75/hr billing rate, that is $37,500/year in recovered capacity. Will pay up to $499/month without blinking for that return.

**Willingness to Pay:** $199-$499/month. Would pay $499+ for team seats. Enterprise plan interest if platform replaces 2+ existing tools.

**Value Anchor:** "If I can send a client a professional 3-option proposal in 10 minutes instead of 90, I close 30% more deals."

---

### Persona C — "The Zone Manager" (FTZ Operator)

| Attribute | Detail |
|-----------|--------|
| **Name** | Sandra Okonkwo |
| **Age** | 48 |
| **Role** | Director of Compliance & FTZ Operations |
| **Company** | 3PL operating FTZ subzone #247 at a bonded warehouse complex |
| **Company Size** | 45 employees (warehouse ops + compliance team of 6) |
| **Location** | Houston, TX (Port of Houston proximity) |
| **Zone Volume** | 200+ clients using the FTZ; $180M annual merchandise value passing through zone |
| **Annual Revenue** | $8M (warehousing fees + FTZ management services) |
| **Tech Sophistication** | High. Uses Magaya WMS, CargoWise for customs entries, advanced Excel models. |
| **Certifications** | Licensed Customs Broker, C-TPAT certified facility |

**Goals:**
- Model PF vs. GPA status elections accurately for every client commodity
- Maintain compliance with April 2025 executive order mandating PF status for reciprocal-tariff-scope goods
- Generate withdrawal schedules that optimize client cash flow
- Provide tariff impact assessments when rates change (proactive client advisory)

**Pain Points (ranked):**
1. **PF status mandate** — April 2025 executive order requires PF status for reciprocal-tariff-scope goods. No tooling flags this automatically. Manual review of every commodity against the order's scope.
2. **Withdrawal schedule complexity** — clients want to minimize duty cash outlay but maximize inventory availability. Modeling this in Excel takes 4-6 hours per client.
3. **Tariff change cascades** — when tariff rates change, must recalculate savings for all affected clients. Currently a multi-day manual exercise.
4. **Audit readiness** — CBP audits require complete admission/withdrawal documentation chain. Assembling this from Magaya + spreadsheets is painful.
5. **Client advisory** — clients expect proactive analysis when trade policy shifts. Sandra's team is reactive because modeling takes too long.

**Current Tool Stack:**
- Magaya WMS (warehouse management, inventory)
- CargoWise (customs entries, broker module)
- Excel (FTZ economic modeling, withdrawal schedules — 15+ tabs per client)
- CBP ACE Portal (official FTZ reporting)
- Federal Register (monitoring executive orders, tariff changes)
- NAFTZ membership resources (best practices, but no tooling)

**Decision-Making:** Procurement involves VP of Operations approval. Evaluates on compliance risk reduction and time savings. Pilot program with 3 clients, then full rollout. 60-90 day evaluation cycle.

**Willingness to Pay:** $499-$1,500/month depending on seat count and client capacity. Enterprise pricing for unlimited clients. Would pay premium for audit-ready documentation exports.

**Value Anchor:** "If this keeps us compliant with the PF mandate and cuts client modeling from 6 hours to 30 minutes, it pays for itself with one client engagement."

---

## 2. Journey A: Independent Importer

### Journey A1: "First-Time Landed Cost"

**Scenario:** Maya discovers Shipping Savior via Google search. She is considering importing bamboo kitchenware from a supplier in Ho Chi Minh City, Vietnam. She wants to know if the margins work before committing to a 40ft container.

**Entry Point:** Organic search — "landed cost calculator Vietnam import"
**Exit Point:** Account created, first calculation saved

| Step | Screen / Route | User Action | System Response | Emotional State | Components | API / Data |
|------|---------------|-------------|-----------------|-----------------|------------|------------|
| 1 | Google SERP | Clicks Shipping Savior result | — | Skeptical — "Another tool that probably won't work" | — | SEO landing |
| 2 | `/` (Homepage) | Lands on homepage, scans hero section | Shows headline: "Know Your True Landed Cost Before You Commit" with embedded calculator preview | Curious — "This looks specific to what I need" | `HeroSection`, `CalculatorPreview` | — |
| 3 | `/` (Homepage) | Scrolls to Unit Economics Calculator embedded above the fold | Calculator input panel visible with pre-filled example (apparel from Vietnam) | Intrigued — "I can try this right now without signing up" | `UnitEconomicsCalculator`, `InputPanel` | — |
| 4 | `/` (Homepage) | Enters: Origin cost $2.80/unit, 12,000 units, 40ft container | Input fields validate in real-time, green checkmarks appear | Engaged — "Ok, this is responsive" | `CurrencyInput`, `NumberInput`, `ContainerSelector` | Client-side validation |
| 5 | `/` (Homepage) | Enters freight estimate: $4,500 (from forwarder email) | System accepts and adds to cost model | Focused — "Let me get these numbers right" | `FreightInput`, `CostBreakdownPreview` | — |
| 6 | `/` (Homepage) | Pauses at "Duty Rate" field — doesn't know the rate | System shows: "Don't know your duty rate? Look up your HTS code" with prominent link | Uncertain — "This is where I always get stuck" | `DutyRateInput`, `HTSLookupCTA` | — |
| 7 | `/tools/hts-lookup` | Clicks HTS lookup link, opens in new context | HTS Lookup tool loads with search bar: "Describe your product in plain English" | Hopeful — "Maybe this will actually work" | `HTSLookupSearch`, `ProductDescriptionInput` | — |
| 8 | `/tools/hts-lookup` | Types: "bamboo kitchen utensils spoons spatulas" | AI classifier processes description, shows loading state with "Analyzing product characteristics..." | Waiting — "Let's see what it finds" | `AIClassifierLoader`, `SearchProgress` | `POST /api/hts/classify` |
| 9 | `/tools/hts-lookup` | Reviews results | System returns 3 HTS code options: (1) 4419.19.10 — Bamboo tableware/kitchenware, 3.2%, confidence 92%; (2) 4419.90.00 — Other wooden articles, 3.2%, confidence 71%; (3) 4421.99.97 — Other articles of wood, 3.3%, confidence 54% | Relieved — "It actually found something specific" | `HTSResultCard` (x3), `ConfidenceBadge`, `DutyRateDisplay` | `GET /api/hts/search`, CBP CROSS rulings cache |
| 10 | `/tools/hts-lookup` | Clicks top result (4419.19.10, 3.2% duty) | Detail panel expands: shows legal description, Section 301 applicability (Vietnam: no additional tariffs), UFLPA risk (low), ADD/CVD (none) | Enlightened — "3.2%! That's way lower than I feared" | `HTSDetailPanel`, `TariffBreakdown`, `ComplianceFlags` | `GET /api/hts/{code}/details` |
| 11 | `/tools/hts-lookup` | Clicks "Use this rate in calculator" button | System navigates back to calculator with HTS 4419.19.10 and 3.2% duty auto-populated | Confident — "Everything is connected" | `RateTransferButton`, `NavigationBridge` | Client-side state transfer |
| 12 | `/` (Homepage) | Reviews pre-filled calculator with duty rate populated | Full 15-component cost breakdown renders: FOB ($33,600) + Freight ($4,500) + Duty ($1,075) + MPF ($175) + HMF ($42) + Insurance ($168) + Customs Bond ($180) + ISF ($35) + Drayage ($950) + Delivery ($650) + Unloading ($300) + Palletization ($480) = Total Landed: $42,155 = $3.51/unit | Enlightened — "I never knew about half these fees" | `CostBreakdownTable`, `UnitCostSummary`, `FeeExplainer` | `POST /api/calculate/landed-cost` |
| 13 | `/` (Homepage) | Hovers over "MPF" line item she doesn't recognize | Tooltip: "Merchandise Processing Fee — 0.3464% of declared value, min $31.67, max $614.35. Charged by CBP on every formal entry." | Learning — "So that's what my forwarder billed me for" | `FeeTooltip`, `InfoIcon` | Static data |
| 14 | `/` (Homepage) | Clicks "What if tariffs change?" scenario toggle | Tariff scenario slider appears: model 5%, 10%, 25%, 50% rate increases | Strategic — "Let me plan for the worst" | `TariffScenarioSlider`, `ImpactChart` | Client-side recalculation |
| 15 | `/` (Homepage) | Slides to 25% tariff scenario | Landed cost recalculates: $3.51 -> $4.23/unit. Margin drops from 64% to 57% at $9.99 retail. Banner: "At 25% duty, you need $6.00 wholesale to maintain 40% margin." | Informed — "Still works, but tight" | `ScenarioResultCard`, `MarginImpactBanner` | Client-side |
| 16 | `/` (Homepage) | Clicks "Check if FTZ saves you money" CTA below the calculator | Navigation to FTZ Analyzer with current calculation context carried over | Curious — "I've heard about FTZs but never understood them" | `FTZAnalyzerCTA`, `ContextBridge` | — |
| 17 | `/tools/ftz-analyzer` | FTZ Analyzer loads with pre-filled values from landed cost calculation | Input panel shows: Unit value $2.80, 12,000 units, duty rate 3.2%, with "Add annual volume" prompt | Exploring — "Let me see the numbers" | `FTZInputPanel`, `PreFilledBanner` | — |
| 18 | `/tools/ftz-analyzer` | Enters annual volume: 12,000 units x 6 containers = 72,000 units/year | FTZ Analyzer runs: Annual duty without FTZ: $6,451. With FTZ (locked at 3.2%, incremental withdrawal): $5,806. Net savings: $645/year after $2,400 storage cost. Verdict: "FTZ not recommended at current volume and rates." | Pragmatic — "Good to know. Not worth it yet." | `FTZSavingsSummary`, `RecommendationBadge` (red: not recommended) | `POST /api/ftz/analyze` |
| 19 | `/tools/ftz-analyzer` | Reads the recommendation: "FTZ becomes viable at 150,000+ units/year OR if tariff rates rise above 12%" | Plain-language threshold gives clear growth target | Motivated — "I'll revisit this when I scale" | `ThresholdExplainer`, `GrowthTarget` | — |
| 20 | `/tools/ftz-analyzer` | Clicks "Save this analysis" | Modal: "Create a free account to save calculations, track shipments, and get tariff alerts" | Ready — "I've gotten enough value to sign up" | `AuthModal`, `ValuePropList` | — |
| 21 | `/auth/register` | Fills registration: email, password, company name (optional) | Account created, redirected to dashboard with saved calculation | Committed — "I'm in" | `RegisterForm`, `OnboardingRedirect` | `POST /api/auth/register` |
| 22 | `/dashboard` | Lands on dashboard with first saved calculation pinned | Dashboard shows: 1 saved calculation, 0 active shipments, "Get Started" checklist | Accomplished — "My command center" | `DashboardLayout`, `SavedCalculationCard`, `OnboardingChecklist` | `GET /api/user/calculations` |

**Time to Value:** ~8 minutes from first page load to account creation.

**Key Conversion Point:** Step 12 — the 15-component cost breakdown. This is the moment Maya sees fees she did not know existed. The aha moment that separates Shipping Savior from a basic calculator.

**Failure Point Mitigations:**
- Steps 6-7: If Maya skips HTS lookup and guesses a rate, calculator still works but shows warning: "Unverified duty rate — misclassification penalties start at $5,000."
- Step 9: If HTS classifier returns no results, fallback to manual chapter browser with "Browse by category" option.
- Step 18: FTZ "not recommended" is NOT a dead end — it builds trust by being honest. Links to growth milestones that make FTZ viable.

---

### Journey A2: "Evaluating a New Supplier"

**Scenario:** Maya is logged in. She found a new supplier in Thailand (in addition to her Vietnam supplier) offering bamboo products at $2.40/unit FOB. She wants to compare the total cost of importing from Thailand vs. Vietnam to decide which supplier to use.

**Entry Point:** Dashboard, logged in
**Exit Point:** PDF comparison exported for business partner discussion

| Step | Screen / Route | User Action | System Response | Emotional State | Components | API / Data |
|------|---------------|-------------|-----------------|-----------------|------------|------------|
| 1 | `/dashboard` | Clicks "New Calculation" from dashboard | Calculation type selector: Landed Cost, Route Comparison, FTZ Analysis, Unit Economics | Purposeful — "I know what I need" | `NewCalculationModal`, `TypeSelector` | — |
| 2 | `/tools/unit-economics` | Selects "Unit Economics" | Unit Economics Calculator loads with blank inputs | Focused | `UnitEconomicsCalculator` | — |
| 3 | `/tools/unit-economics` | Enters Vietnam scenario: FOB $2.80, 12,000 units, HTS 4419.19.10, Vietnam origin | System calculates: Landed cost $3.51/unit, wholesale $7.00, retail $14.99. Margin analysis at each tier. | Baseline — "This is my current deal" | `ScenarioInput`, `MarginWaterfall` | `POST /api/calculate/unit-economics` |
| 4 | `/tools/unit-economics` | Clicks "Add comparison scenario" | Second input column appears side-by-side | Analytical — "Now let me compare" | `ScenarioComparison`, `DualInputPanel` | — |
| 5 | `/tools/unit-economics` | Enters Thailand scenario: FOB $2.40, 12,000 units, HTS 4419.19.10, Thailand origin | System calculates: Landed cost $3.08/unit. Duty rate identical (3.2%). Freight slightly higher ($4,800 vs $4,500 — longer route). | Surprised — "Thailand is cheaper landed even with higher freight" | `ComparisonResultPanel`, `DeltaHighlight` | `POST /api/calculate/unit-economics` |
| 6 | `/tools/unit-economics` | Reviews side-by-side comparison table | Table highlights: Thailand saves $0.43/unit ($5,160 per container). Color-coded: green for Thailand advantage in 11 of 15 cost components. Red flags: Thailand transit time +4 days. | Analytical — "$5K savings per container is significant" | `ComparisonTable`, `DeltaIndicators`, `TransitTimeBadge` | Client-side diff |
| 7 | `/tools/unit-economics` | Clicks "Duty Impact Analysis" tab | Shows tariff scenario comparison: under Section 301 escalation, both Vietnam and Thailand maintain low rates. China comparison added automatically: same product from China = 27.5% duty ($3,300 extra per container). | Strategic — "Good thing I'm not sourcing from China" | `DutyImpactTab`, `CountryComparisonChart` | `GET /api/tariff/compare` |
| 8 | `/tools/route-comparison` | Clicks "Compare Routes" CTA | Route Comparison tool loads with Vietnam and Thailand origins pre-populated | Flowing — "Everything connects" | `RouteComparisonTool`, `PrePopulatedInputs` | — |
| 9 | `/tools/route-comparison` | Reviews 3 carrier options per origin | Vietnam (VNSGN -> USLAX): Maersk 18d/$4,200, CMA CGM 22d/$3,600, Evergreen 20d/$3,900. Thailand (THBKK -> USLAX): MSC 22d/$4,800, Hapag-Lloyd 26d/$4,100, ONE 24d/$4,400. | Comparing — "Thailand freight IS more expensive" | `CarrierOptionCard` (x6), `RouteMapOverlay` | `GET /api/routes/compare` |
| 10 | `/tools/route-comparison` | Toggles "Include all landed costs" to see total comparison | Final comparison: Vietnam landed $3.51/unit. Thailand landed $3.08/unit. Net advantage Thailand: $0.43/unit = $5,160/container = $30,960/year (6 containers). | Decisive — "Thailand wins on pure economics" | `TotalLandedComparison`, `AnnualSavingsBanner` | Client-side aggregation |
| 11 | `/tools/route-comparison` | Clicks "Save Scenario" | Scenario saved to account: "Vietnam vs Thailand — Bamboo Kitchenware Q2 2026" | Organized — "I'll reference this later" | `SaveScenarioModal`, `ScenarioNameInput` | `POST /api/scenarios/save` |
| 12 | `/tools/route-comparison` | Clicks "Export PDF" | PDF generated: cover page with comparison summary, detailed cost breakdown, route map, duty analysis, recommendation. Professional formatting with Shipping Savior branding. | Professional — "I can send this to my business partner" | `PDFExportButton`, `PDFGenerator` | `POST /api/export/pdf` |
| 13 | Email | Sends PDF to business partner | — | Confident — "This is the best analysis I've ever done for my business" | — | — |

**Time to Value:** ~6 minutes (already logged in, knows the tool).

---

### Journey A3: "Tracking First Container"

**Scenario:** Maya placed her first order with the Thailand supplier. The container has shipped. She wants to monitor it through arrival and customs clearance.

**Entry Point:** Dashboard, logged in
**Exit Point:** Container delivered, actual vs. estimated cost reconciled

| Step | Screen / Route | User Action | System Response | Emotional State | Components | API / Data |
|------|---------------|-------------|-----------------|-----------------|------------|------------|
| 1 | `/dashboard` | Clicks "Add Shipment" | New shipment form with fields: BOL number, container number, carrier, origin port, destination port | Proactive — "Let me set this up" | `AddShipmentModal`, `ShipmentForm` | — |
| 2 | `/dashboard` | Enters BOL number (MEDU1234567) and container number (MSCU7654321) | System validates format, auto-detects carrier (MSC) from container prefix | Smooth — "It recognized the carrier" | `BOLInput`, `ContainerInput`, `CarrierAutoDetect` | `POST /api/shipments/create` |
| 3 | `/dashboard` | Enters origin (Bangkok) and destination (Los Angeles), estimated arrival June 15 | Shipment created, status: "Booked" | Set up — "Now I wait" | `PortSelector`, `DatePicker` | `POST /api/shipments/update` |
| 4 | `/dashboard` | Returns next day, checks dashboard | Status updated: "Gate Out — Container loaded at Bangkok terminal, June 1 14:22 local" | Reassured — "It's moving" | `ShipmentStatusCard`, `StatusTimeline` | `GET /api/tracking/{containerId}` (Terminal49) |
| 5 | `/dashboard` | Checks dashboard 3 days later | Status: "Vessel Loaded — MSC ANNA, departed Bangkok June 4, ETA LA June 22" | Tracking — "On its way" | `VesselInfoCard`, `ETADisplay`, `RouteMapPin` | Terminal49 webhook |
| 6 | `/dashboard/tracking` | Clicks into shipment detail view | Full tracking timeline: Gate Out -> Vessel Loaded -> In Transit. Map shows vessel position mid-Pacific. Documents section shows: Commercial Invoice (uploaded), Packing List (uploaded), ISF (missing). | Engaged — "I can see everything" | `TrackingTimeline`, `VesselMapView`, `DocumentChecklist` | `GET /api/shipments/{id}/details` |
| 7 | `/dashboard/tracking` | Sees ISF status: "Not Filed — Deadline June 8 (4 days)" | Red warning banner: "ISF must be filed 24 hours before vessel departure from LAST foreign port. Penalty for late filing: $5,000. Contact your customs broker." | Alarmed — "I need to handle this NOW" | `ISFAlertBanner`, `DeadlineCountdown` | `GET /api/compliance/isf-status` |
| 8 | `/dashboard/tracking` | Calls customs broker, confirms ISF filed | Updates ISF status manually (or auto-detected if broker uses integrated system) | Relieved — "Crisis averted. Thank god for the alert." | `ISFStatusToggle`, `ManualStatusUpdate` | `PUT /api/shipments/{id}/documents` |
| 9 | `/dashboard/tracking` | Checks dashboard June 18 — 4 days before ETA | Notification: "Customs Hold — CBP has placed an exam hold on container MSCU7654321. Reason: Random Intensive Exam. Estimated delay: 3-7 business days." | Anxious — "What does this mean? Am I in trouble?" | `CustomsHoldAlert`, `NotificationBanner` | Terminal49 event |
| 10 | `/dashboard/tracking` | Clicks "What does this mean?" explainer link | Knowledge base article loads inline: "CBP random exams are routine (4-6% of containers). Not an indication of wrongdoing. Your broker will coordinate. Exam fees: $300-$1,000 additional cost." | Calmer — "Ok, it's routine. Just costs more." | `KnowledgeBaseInline`, `ExamExplainer` | Static content |
| 11 | `/dashboard/tracking` | Checks dashboard June 25 | Status: "Exam Complete — Released. Available for pickup at APM Terminal, LA." ETA updated to June 26 pickup. | Relieved — "Finally!" | `StatusUpdate`, `PickupAvailability` | Terminal49 event |
| 12 | `/dashboard/tracking` | Checks dashboard June 27 | Status: "Picked Up — Drayage carrier dispatched." Then June 28: "Delivered — Received at fulfillment warehouse." | Satisfied — "My first container, tracked end-to-end" | `DeliveryConfirmation`, `StatusComplete` | Terminal49 event / manual |
| 13 | `/dashboard/tracking` | Clicks "Reconcile Costs" | Actual cost entry form: actual freight, actual duty billed, exam fee, drayage, demurrage. Side-by-side with estimates from original landed cost calculation. | Reflective — "Let me see how accurate my estimate was" | `CostReconciliationForm`, `EstimateVsActualTable` | `POST /api/shipments/{id}/reconcile` |
| 14 | `/dashboard/tracking` | Enters actuals: Freight $4,820 (est $4,800), Duty $1,086 (est $1,075), Exam fee $750 (unbudgeted), Drayage $1,100 (est $950) | Variance report: Total actual $4.02/unit vs. estimated $3.08/unit. Over by $0.94/unit. Primary variance: exam fee + drayage. Margin impact: 57% -> 49%. | Informed — "The exam killed my margin this time, but I know for next time" | `VarianceReport`, `MarginImpactBadge` | `POST /api/analytics/reconcile` |
| 15 | `/dashboard/tracking` | System prompts: "Add $750 exam contingency to future calculations?" | Clicks "Yes" — future landed cost calculations include 4% exam probability cost ($30 per container average) | Smart — "Now my estimates will be more accurate" | `ContingencyPrompt`, `CalculatorSettingsUpdate` | `PUT /api/user/settings` |

**Time to Complete:** 28 days (shipment lifecycle), ~15 minutes of active platform time.

---

### Journey A4: "Document Preparation"

**Scenario:** Maya's second container is booked. She needs to prepare the document packet for customs clearance. She has some documents from her supplier but is unsure if they are complete.

**Entry Point:** Dashboard, active shipment
**Exit Point:** Complete document packet assembled, ISF compliance verified

| Step | Screen / Route | User Action | System Response | Emotional State | Components | API / Data |
|------|---------------|-------------|-----------------|-----------------|------------|------------|
| 1 | `/dashboard` | Clicks into active shipment #2 | Shipment detail loads. Documents section shows compliance checklist: Commercial Invoice (missing), Packing List (missing), BOL (auto-populated from booking), ISF Filing (pending), Certificate of Origin (optional — no FTA benefit). | Organized — "I can see what I need" | `ShipmentDetail`, `DocumentChecklist` | `GET /api/shipments/{id}/documents` |
| 2 | `/dashboard/tracking` | Clicks "Upload" next to Commercial Invoice | File upload modal: drag-and-drop zone, accepts PDF/JPG/PNG, max 25MB | Task-oriented — "Let me get this done" | `FileUploadModal`, `DragDropZone` | — |
| 3 | `/dashboard/tracking` | Drops supplier's commercial invoice PDF | Upload progress bar, then: "Processing document... Extracting fields" | Waiting — "What's it doing?" | `UploadProgress`, `ExtractionLoader` | `POST /api/documents/upload` |
| 4 | `/dashboard/tracking` | Reviews extracted fields | System extracted: Seller (Thai Bamboo Co.), Buyer (Maya Chen), HTS codes (4419.19.10), Quantity (12,000 units), Unit price ($2.40), Total value ($28,800), Incoterm (FOB Bangkok). Editable fields with "Confirm" button. | Impressed — "It read my invoice correctly" | `ExtractedFieldsReview`, `EditableFieldCard`, `ConfirmButton` | `POST /api/documents/parse` |
| 5 | `/dashboard/tracking` | Confirms extracted fields (corrects one: unit price was $2.40 not $2.04 — OCR misread) | Fields saved. Cross-reference check runs automatically against shipment data. | Diligent — "Good thing I checked" | `FieldCorrection`, `CrossReferenceCheck` | `POST /api/documents/validate` |
| 6 | `/dashboard/tracking` | System shows validation results | Green check: HTS code matches shipment record. Green check: quantity matches booking. Yellow warning: "Invoice total ($28,800) differs from BOL declared value ($29,000). Difference: $200." | Attentive — "Let me fix that discrepancy" | `ValidationResultPanel`, `DiscrepancyWarning` | — |
| 7 | `/dashboard/tracking` | Clicks "Upload" next to Packing List | Uploads packing list PDF from supplier | Continuing — "Almost done" | `FileUploadModal` | `POST /api/documents/upload` |
| 8 | `/dashboard/tracking` | Reviews extracted packing list data | Extracted: 240 cartons, 48 CBM, 9,600 kg gross. Cross-reference: carton count matches invoice line items. Weight within acceptable range for bamboo kitchenware. | Verified — "Numbers add up" | `PackingListReview`, `WeightValidation` | `POST /api/documents/parse` |
| 9 | `/dashboard/tracking` | Checks ISF Compliance section | ISF-10 checklist shows: 8 of 10 required elements populated from uploaded documents. Missing: (1) Container Stuffing Location, (2) Consolidator name/address. Red banner: "ISF filing deadline: June 10 — 6 days away." | Focused — "Two more items to get" | `ISFChecklistPanel`, `MissingElementAlert` | `GET /api/compliance/isf/{shipmentId}` |
| 10 | `/dashboard/tracking` | Contacts supplier via WhatsApp to get stuffing location and consolidator info | — (off-platform) | Proactive — "I know exactly what to ask for" | — | — |
| 11 | `/dashboard/tracking` | Returns, manually enters: Container stuffed at "Thai Bamboo Warehouse, 42 Sukhumvit Rd, Bangkok" and consolidator: "Bangkok Freight Consolidators Ltd" | ISF checklist: 10/10 elements complete. Green status: "ISF Ready for Filing." Button: "Export ISF data for customs broker." | Complete — "Everything is ready" | `ISFManualEntry`, `ISFReadyBadge`, `ExportButton` | `PUT /api/compliance/isf/{shipmentId}` |
| 12 | `/dashboard/tracking` | Clicks "Assemble Document Packet" | System generates ZIP archive containing: Commercial Invoice (validated), Packing List (validated), BOL, ISF data sheet, document summary cover page. Available as download or shareable link. | Accomplished — "One click and everything is packaged" | `DocumentPacketAssembler`, `DownloadButton`, `ShareLinkGenerator` | `POST /api/documents/assemble` |
| 13 | `/dashboard/tracking` | Sends shareable link to customs broker | Email sent with link to document packet. Broker can access without an account (read-only, 30-day expiry). | Efficient — "So much better than email chains" | `ShareModal`, `BrokerAccessLink` | `POST /api/documents/share` |

**Time to Value:** ~12 minutes of active time (excluding waiting for supplier response).

---

### Journey A5: "Monthly Cost Review"

**Scenario:** Maya has been using Shipping Savior for 4 months. She has completed 3 shipments (2 from Thailand, 1 from Vietnam). She wants to review her cost trends and identify optimization opportunities.

**Entry Point:** Dashboard
**Exit Point:** Identified one cost optimization, adjusted strategy

| Step | Screen / Route | User Action | System Response | Emotional State | Components | API / Data |
|------|---------------|-------------|-----------------|-----------------|------------|------------|
| 1 | `/dashboard` | Clicks "Analytics" in sidebar navigation | Analytics dashboard loads with cost overview for last 90 days | Reflective — "Let me see how I'm doing" | `AnalyticsDashboard`, `DateRangeSelector` | `GET /api/analytics/overview` |
| 2 | `/dashboard/analytics` | Views cost trend chart | Line chart: landed cost per unit trending down — $3.51 (shipment 1, Vietnam) -> $3.08 (shipment 2, Thailand) -> $2.95 (shipment 3, Thailand, better freight rate). Table below shows per-shipment breakdown. | Pleased — "My costs are improving" | `CostTrendChart`, `ShipmentCostTable` | `GET /api/analytics/cost-trends` |
| 3 | `/dashboard/analytics` | Clicks "Carrier Performance" tab | Carrier comparison: MSC (2 shipments) — avg transit 23 days, on-time 100%. CMA CGM (1 shipment) — 26 days, on-time 100%. Cost per FEU: MSC $4,600 avg, CMA CGM $4,100. | Evaluating — "CMA CGM is cheaper but slower" | `CarrierPerformanceTab`, `CarrierComparisonChart` | `GET /api/analytics/carrier-performance` |
| 4 | `/dashboard/analytics` | Clicks "Savings Opportunities" section | System identifies: "Based on your 3 shipments, you could save an estimated $2,400/year by consolidating to quarterly bulk bookings instead of individual shipments. Reason: volume discount threshold with MSC at 4+ FEU/quarter." | Interested — "I didn't know about volume discounts" | `SavingsOpportunityCard`, `RecommendationEngine` | `GET /api/analytics/opportunities` |
| 5 | `/dashboard/analytics` | Clicks "Run FTZ Analysis" link in savings recommendations | System: "Your annual import volume is now 36,000+ units. FTZ threshold is 150,000. Not yet viable. Re-evaluate at 12+ containers/year." | Patient — "Not yet, but tracking toward it" | `FTZReEvaluationCard`, `VolumeTracker` | `GET /api/ftz/threshold-check` |
| 6 | `/dashboard/analytics` | Reviews "Cost Component Breakdown" pie chart | Biggest costs: Freight (42%), Duty (18%), Drayage (12%), FOB cost (includes in unit economics separately). Freight is dominant. | Analytical — "Freight is where the money goes" | `CostPieChart`, `ComponentBreakdown` | `GET /api/analytics/cost-components` |
| 7 | `/dashboard/analytics` | Clicks on Freight segment, drills into freight cost analysis | Freight cost per FEU by shipment with spot rate context. System note: "Your avg freight cost ($4,400/FEU) is 8% above the FBX index avg for this route ($4,072). Consider requesting competitive quotes." | Actionable — "I can negotiate better" | `FreightDrillDown`, `BenchmarkComparison` | `GET /api/analytics/freight-benchmark` |
| 8 | `/dashboard/analytics` | Clicks "Export Monthly Report" | PDF report generated: 4-page summary with all charts, cost trends, recommendations, next month forecast. | Professional — "I'll review this monthly now" | `MonthlyReportExport`, `PDFGenerator` | `POST /api/reports/monthly` |

**Time to Value:** ~5 minutes. Actionable insight (negotiate freight rates) discovered.

---

## 3. Journey B: Freight Broker

### Journey B1: "Client Proposal in 10 Minutes"

**Scenario:** Marcus receives an email from a new client asking for a quote on importing 500 CBM of ceramic tiles from Guangzhou, China to Los Angeles. The client needs 3 routing options by end of day.

**Entry Point:** Dashboard, logged in
**Exit Point:** Professional PDF proposal sent to client

| Step | Screen / Route | User Action | System Response | Emotional State | Components | API / Data |
|------|---------------|-------------|-----------------|-----------------|------------|------------|
| 1 | `/dashboard` | Clicks "New Quote" quick-action button | Quote wizard opens: Client name, commodity, origin, destination, volume, special requirements | Efficient — "Let's knock this out" | `QuoteWizard`, `QuickActionBar` | — |
| 2 | `/dashboard` | Enters: Client "Pacific Tile Distributors", commodity "Ceramic floor tiles", origin Guangzhou (CNGGZ), destination Los Angeles (USLAX), 500 CBM, 33,000 kg, FCL | System validates inputs, calculates container requirements: 500 CBM = ~13 x 40ft containers (38.5 CBM each) | Precise — "Straightforward job" | `QuoteInputForm`, `ContainerCalculator` | Client-side calculation |
| 3 | `/tools/route-comparison` | System navigates to Route Comparison with quote data pre-loaded | 3 carrier options generated with live rate data: (A) Maersk direct — 14 days, $4,800/FEU, reliability 94%. (B) CMA CGM via Singapore — 19 days, $3,900/FEU, reliability 88%. (C) COSCO direct — 16 days, $4,200/FEU, reliability 91%. | Productive — "Three options in 30 seconds" | `CarrierOptionCard` (x3), `RouteMapVisualization`, `ReliabilityScore` | `GET /api/routes/compare` |
| 4 | `/tools/route-comparison` | Reviews carrier options, notices ceramic tiles from China in commodity field | System auto-flags: "ALERT: Ceramic tiles (HTS 6907.21) from China are subject to Antidumping Duty. ADD rate: 18.56% - 222.24% depending on manufacturer. Average: 104.57%." Red banner with stop-sign icon. | Alert — "ADD! This changes everything." | `ADDAlertBanner`, `DutyFlagIcon`, `AddCvdDatabase` | `GET /api/tariff/add-cvd/{hts}` |
| 5 | `/tools/hts-lookup` | Clicks "View ADD/CVD Details" | Detail panel: ADD Order A-570-106 (ceramic tiles from China). Rates by manufacturer. Separate CVD of 2.84%. Combined effective rate: 107.41% for unknown manufacturer. Link to ITC investigation. | Concerned — "My client doesn't know about this" | `ADDDetailPanel`, `ManufacturerRateTable`, `ITCLink` | `GET /api/tariff/add-cvd/{hts}/details` |
| 6 | `/tools/route-comparison` | Clicks "Check Alternative Origins" — system suggests countries without ADD for this HTS | Alternative origin analysis: India (no ADD, 4.5% duty), Turkey (no ADD, 8.5% duty), Brazil (no ADD, 4.5% duty), Mexico (no ADD, 0% under USMCA if qualifying). | Strategic — "India is the obvious pivot" | `AlternativeOriginPanel`, `DutyComparisonTable` | `GET /api/tariff/alternatives/{hts}` |
| 7 | `/tools/route-comparison` | Selects India (Chennai/INMAA) as alternative origin | New route comparison generated for INMAA -> USLAX: (A) MSC — 28 days, $5,200/FEU, reliability 89%. (B) Hapag-Lloyd — 32 days, $4,600/FEU, reliability 87%. (C) Evergreen — 30 days, $4,800/FEU, reliability 90%. | Pivoting — "Longer transit but massively cheaper total" | `CarrierOptionCard` (x3), `RouteMapVisualization` | `GET /api/routes/compare` |
| 8 | `/tools/route-comparison` | Clicks "Compare Total Landed Cost: China vs. India" | Side-by-side: China route (cheapest carrier, $3,900/FEU) + 107.41% ADD = $126,000 in ADD alone on 13 containers. India route (mid carrier, $4,800/FEU) + 4.5% standard duty = $17,160 total duty. Delta: $108,840 savings by sourcing from India. | Decisive — "India saves my client $109K" | `LandedCostComparison`, `ADDImpactHighlight`, `SavingsBanner` | `POST /api/calculate/landed-cost` (x2) |
| 9 | `/tools/route-comparison` | Clicks "Build Proposal" | Proposal builder loads with 3 India route options pre-populated. Customization: add broker margin, add notes, select which cost components to show client. | Professional — "Let me package this properly" | `ProposalBuilder`, `MarginEditor`, `ComponentToggle` | — |
| 10 | `/tools/route-comparison` | Adds broker margin: $350/FEU | System recalculates client-facing rates: (A) $5,550/FEU, (B) $4,950/FEU, (C) $5,150/FEU. Margin shown only in broker view, hidden from client PDF. | Business-minded — "Good margin on this" | `MarginOverlay`, `BrokerViewToggle` | Client-side |
| 11 | `/tools/route-comparison` | Adds note: "Recommendation: India sourcing eliminates $108K ADD exposure. We recommend Option B (Hapag-Lloyd) for best cost-to-reliability ratio." | Note added to proposal footer | Consultative — "This makes me look like a strategic partner, not just a rate broker" | `ProposalNoteEditor` | — |
| 12 | `/tools/route-comparison` | Clicks "Generate PDF Proposal" | PDF renders: branded cover page, executive summary with ADD discovery, 3-option comparison table, route map, cost breakdown, broker recommendation, terms and conditions. 6 pages. | Proud — "This looks better than what the big 3PLs send" | `PDFGenerator`, `ProposalTemplate` | `POST /api/export/proposal-pdf` |
| 13 | `/tools/route-comparison` | Clicks "Send to Client" or downloads PDF | Email draft with PDF attached, client email pre-populated from quote setup | Done — "8 minutes. My old workflow took 90." | `EmailComposer`, `PDFAttachment` | `POST /api/proposals/send` |
| 14 | `/dashboard` | Proposal auto-saved to client record | Dashboard shows: Pacific Tile Distributors — Proposal Sent, $108K ADD savings identified, follow-up reminder set for 2 days. | Organized — "Every client interaction is tracked" | `ClientRecord`, `ProposalHistory`, `FollowUpReminder` | `POST /api/clients/{id}/proposals` |
| 15 | `/dashboard` | Saves quote as template: "Ceramic Tiles — India Import (ADD Avoidance)" | Template available for future similar quotes with one-click customization | Systematic — "Next time this takes 3 minutes" | `TemplateManager`, `SaveTemplateModal` | `POST /api/templates/save` |

**Time to Value:** 8 minutes from email received to proposal sent. Previous workflow: 90 minutes.

**Key Differentiator Demonstrated:** Steps 4-8 — the ADD/CVD auto-detection and country pivot. Most brokers would quote the China route, client would get hit with 107% ADD at customs, and the relationship would be destroyed. Shipping Savior prevented a six-figure mistake.

---

### Journey B2: "Multi-Shipment Dashboard Management"

**Scenario:** Monday morning. Marcus checks his dashboard to manage 47 active shipments across 12 clients.

**Entry Point:** Dashboard
**Exit Point:** All urgent items triaged, clients updated

| Step | Screen / Route | User Action | System Response | Emotional State | Components | API / Data |
|------|---------------|-------------|-----------------|-----------------|------------|------------|
| 1 | `/dashboard` | Opens dashboard | Overview: 47 active shipments. Kanban view: Booked (8), In Transit (22), At Port (9), In FTZ (3), Delivered This Week (5). Red badges: 2 alerts requiring attention. | Oriented — "I can see everything at a glance" | `DashboardKanban`, `StatusColumns`, `AlertBadges` | `GET /api/shipments/overview` |
| 2 | `/dashboard` | Clicks red alert badge | Alert panel: (1) Container TCKU8891234 — Customs Hold, CBP Exam. Client: Pacific Tile. (2) Container MEDU5567890 — Vessel Delay, new ETA +6 days. Client: Fresh Farms LLC. | Focused — "Two fires to put out" | `AlertPanel`, `AlertCards` | `GET /api/alerts/active` |
| 3 | `/dashboard/tracking` | Clicks into customs hold alert | Shipment detail: TCKU8891234. Status: Customs Hold — Tailgate Exam ordered. Documents on file: Commercial Invoice (validated), Packing List (validated), BOL, ISF (filed on time). Exam type explainer: "Tailgate exam: CBP opens container, inspects ~10% of contents. Typical delay: 2-4 business days." | Calm — "Documentation is clean, this should clear" | `ShipmentDetail`, `ExamTypeExplainer`, `DocumentStatusList` | `GET /api/shipments/{id}/details` |
| 4 | `/dashboard/tracking` | Clicks "Notify Client" | Pre-drafted client notification: "Your container TCKU8891234 has been selected for a routine CBP tailgate exam at Port of Los Angeles. Estimated delay: 2-4 business days. All documentation is in order. We'll update you when the exam clears." Editable before sending. | Professional — "One-click client communication" | `ClientNotificationTemplate`, `EmailEditor` | `POST /api/notifications/send` |
| 5 | `/dashboard/tracking` | Sends notification, returns to dashboard | Alert marked as "Acknowledged." Client notification logged in shipment timeline. | Handled — "Fire #1 done" | `AlertAcknowledge`, `TimelineEntry` | `PUT /api/alerts/{id}/acknowledge` |
| 6 | `/dashboard/tracking` | Clicks into vessel delay alert | Shipment detail: MEDU5567890. Status: In Transit. Vessel MSC GULSUN delayed due to port congestion at Singapore transshipment. Original ETA: June 10. New ETA: June 16. Client has temperature-sensitive cargo (reefer container). | Concerned — "6-day delay on a reefer is risky" | `ShipmentDetail`, `DelayImpactPanel`, `ReeferAlert` | `GET /api/shipments/{id}/details` |
| 7 | `/dashboard/tracking` | System shows proactive analysis: "Reefer container MEDU5567890 has been running for 18 days. With 6-day delay, total transit reaches 24 days. Product shelf life tolerance: 30 days. Margin of safety: 6 days. Status: CAUTION." | Cold chain risk assessment gives Marcus data to act on | Analytical — "6 days of margin. Tight but ok." | `ColdChainRiskPanel`, `ShelfLifeCalculator` | `GET /api/cold-chain/risk-assessment` |
| 8 | `/dashboard/tracking` | Clicks "Notify Client" with delay details and reefer status | Pre-drafted: delay details + reefer monitoring assurance + new ETA. Marcus adds: "We are monitoring reefer temperature logs. Container maintaining -18C consistently." | Thorough — "Client knows I'm on top of it" | `ClientNotificationTemplate`, `ReeferDataInsert` | `POST /api/notifications/send` |
| 9 | `/dashboard` | Returns to dashboard, filters by "At Port" status | 9 containers at port. Sorts by days-at-port descending. Flags 2 containers with 5+ days dwell time (potential demurrage risk). | Monitoring — "Demurrage is money burning" | `StatusFilter`, `DwellTimeSort`, `DemurrageWarning` | `GET /api/shipments?status=at_port` |
| 10 | `/dashboard` | Reviews 5-day dwell container: OOLU3344556 | Container available for pickup since June 3. Today June 8. Free time: 4 days (carrier policy). Demurrage starts tomorrow. Rate: $150/day. Client: SoCal Home Goods. | Urgent — "Need to get this picked up today" | `DemurrageCalculator`, `FreeTimeCounter`, `ClientContactCard` | `GET /api/shipments/{id}/demurrage` |
| 11 | `/dashboard` | Clicks "Schedule Pickup" action | Drayage scheduling form: preferred pickup date, delivery address, special instructions. Marcus selects today, ASAP. | Action-oriented — "Solving it right now" | `PickupScheduleForm`, `DrayageRequest` | `POST /api/drayage/schedule` |
| 12 | `/dashboard` | Morning triage complete. Reviews dashboard summary | Updated kanban: 2 alerts resolved, 1 pickup scheduled, 2 client notifications sent. Dashboard shows "Morning triage: 12 minutes." | In control — "That used to take an hour" | `TriageSummary`, `TimeTracker` | — |

**Time to Value:** 12 minutes for full morning triage of 47 shipments. Previous workflow: 60+ minutes checking 6 carrier portals + email chains.

---

### Journey B3: "HTS Classification for New Product"

**Scenario:** A client emails Marcus: "We want to import LED grow lights from Shenzhen. Can you quote this?" Marcus needs to classify the product, check for duty complications, and build into a landed cost quote.

**Entry Point:** Dashboard, logged in
**Exit Point:** HTS classified, landed cost quoted, sent to client

| Step | Screen / Route | User Action | System Response | Emotional State | Components | API / Data |
|------|---------------|-------------|-----------------|-----------------|------------|------------|
| 1 | `/tools/hts-lookup` | Navigates to HTS Lookup, enters "LED grow lights for indoor horticulture" | AI classifier processes: analyzes product characteristics — light source (LED), function (plant growth), end use (horticulture) | Working — "Let's find the right code" | `HTSLookupSearch`, `AIClassifierLoader` | `POST /api/hts/classify` |
| 2 | `/tools/hts-lookup` | Reviews 3 classification options | (1) 9405.42.40 — LED luminaires, 3.9%, confidence 78%. (2) 8543.70.45 — Other electrical machines with individual function, 2.6%, confidence 65%. (3) 9405.11.40 — Other chandeliers/luminaires, 3.9%, confidence 52%. Note: "LED grow lights are a contested classification. CBP has issued conflicting rulings." | Cautious — "78% confidence isn't great" | `HTSResultCard` (x3), `ConfidenceBadge`, `ContestationWarning` | `GET /api/hts/search` |
| 3 | `/tools/hts-lookup` | Clicks "View CBP Rulings" on top result | CBP CROSS database results: 4 relevant rulings. Ruling N304512 (2019): LED grow lights classified under 9405.42 — luminaires. Ruling HQ H310856 (2022): similar product reclassified under 8543.70 — different function emphasis. | Learning — "Even CBP can't agree" | `CBPRulingsPanel`, `RulingCard` (x4), `ConflictHighlight` | `GET /api/hts/{code}/rulings` |
| 4 | `/tools/hts-lookup` | Reviews ruling detail — sees most recent ruling favors 9405.42.40 | System recommendation: "Based on most recent CBP ruling (2022 revision) and product description, 9405.42.40 is the recommended code at 3.9% duty. Confidence: 78%. Consider requesting a binding ruling if import volume exceeds $100K/year." | Deciding — "I'll go with the most recent ruling" | `RulingDetailView`, `RecommendationPanel`, `BindingRulingCTA` | — |
| 5 | `/tools/hts-lookup` | Clicks "Check Section 301 Status" | Result: HTS 9405.42.40 IS on the Section 301 List 3 — additional 25% tariff on goods from China. Effective rate: 3.9% + 25% = 28.9%. | Significant — "25% Section 301 on top. Client needs to know this." | `Section301Flag`, `EffectiveRateCalculation` | `GET /api/tariff/section301/{hts}` |
| 6 | `/tools/hts-lookup` | Checks ADD/CVD status | No antidumping or countervailing duty on LED luminaires from China. | Relieved — "At least no ADD" | `ADDCVDCheck`, `ClearBadge` | `GET /api/tariff/add-cvd/{hts}` |
| 7 | `/tools/hts-lookup` | Clicks "Use this rate in Landed Cost Calculator" | Navigates to landed cost with HTS 9405.42.40, 28.9% effective duty, China origin pre-filled | Flowing — "Straight into the quote" | `RateTransferButton` | Client-side state |
| 8 | `/tools/unit-economics` | Enters client details: FOB $12.50/unit, 5,000 units, 20ft container | Landed cost: $19.14/unit. Duty component: $3.61/unit (28.9% of $12.50). Freight: $2,800/TEU = $0.56/unit. All 15 components visible. | Clear — "Now I can quote accurately" | `LandedCostCalculator`, `CostBreakdownTable` | `POST /api/calculate/landed-cost` |
| 9 | `/tools/unit-economics` | Clicks "Check Alternative Origins" to give client options | Vietnam: 3.9% duty (no Section 301), landed $16.23/unit (savings $2.91/unit). India: 3.9%, landed $16.58/unit. | Advisory — "Vietnam alternative saves $14,550 per container" | `AlternativeOriginPanel`, `SavingsHighlight` | `GET /api/tariff/alternatives/{hts}` |
| 10 | `/tools/route-comparison` | Builds route comparison: Shenzhen vs. Ho Chi Minh City to LA | Side-by-side carrier options for both origins. China route: cheaper freight ($2,800) but $18,050 more in duties. Vietnam route: slightly more freight ($3,200) but $14,550 duty savings. | Strategic — "The recommendation writes itself" | `DualRouteComparison`, `TotalCostComparison` | `GET /api/routes/compare` (x2) |
| 11 | `/tools/route-comparison` | Generates client proposal with both options and recommendation | PDF proposal: "China Direct" vs. "Vietnam Alternative" with full analysis. Recommendation: Vietnam saves $14,550/container. Note on binding ruling suggestion for either path. | Consultative — "I'm not just quoting rates, I'm advising" | `ProposalBuilder`, `DualOptionTemplate` | `POST /api/export/proposal-pdf` |
| 12 | `/tools/route-comparison` | Sends proposal to client | Email with PDF attached. Marcus adds: "Given Section 301 tariffs on Chinese-origin LED fixtures, I strongly recommend exploring Vietnam suppliers. Happy to discuss." | Expert — "This is the kind of analysis that keeps clients" | `EmailComposer` | `POST /api/proposals/send` |

**Time to Value:** 10 minutes from client email to proposal sent. Client received: HTS classification, duty analysis including Section 301, alternative origin strategy, and carrier routing.

---

### Journey B4: "FTZ Strategy for High-Volume Client"

**Scenario:** Marcus has a client (SoCal Electronics) that imports $2M/year in electronic components from China. The client is getting crushed by Section 301 tariffs. Marcus wants to present an FTZ strategy that could save them real money.

**Entry Point:** FTZ Analyzer
**Exit Point:** FTZ savings presentation sent to client, client signs up for FTZ services

| Step | Screen / Route | User Action | System Response | Emotional State | Components | API / Data |
|------|---------------|-------------|-----------------|-----------------|------------|------------|
| 1 | `/tools/ftz-analyzer` | Opens FTZ Analyzer, enters client profile | Input: HTS 8542.31 (electronic integrated circuits), $2M annual import value, unit cost $4.20, 476,190 units/year, China origin, current effective duty rate 145% (Section 301 + reciprocal tariff stacked) | Determined — "There has to be a way to help this client" | `FTZInputPanel`, `ClientProfileInput` | — |
| 2 | `/tools/ftz-analyzer` | System detects HTS + executive order intersection | Alert: "April 2025 executive order applies to HTS 8542.31 (reciprocal tariff scope). PF (Privileged Foreign) status is MANDATORY. GPA option is not available for this commodity." System auto-selects PF and disables GPA toggle. | Informed — "Good to know PF is required, not optional" | `ExecutiveOrderAlert`, `PFMandatoryBadge`, `GPADisabledToggle` | `GET /api/ftz/executive-order-check/{hts}` |
| 3 | `/tools/ftz-analyzer` | Enters FTZ parameters: FTZ annual cost $45K (site fees + compliance), withdrawal pace 40,000 units/month | System runs PF economic model | Calculating — "Let's see the numbers" | `FTZParameterInput`, `WithdrawalPaceSelector` | — |
| 4 | `/tools/ftz-analyzer` | Reviews PF analysis results | PF locks duty at 145% on date of FTZ admission. Scenario analysis: (A) Rates stay at 145%: FTZ provides cash flow benefit only — defer duty until withdrawal. Annual cash flow advantage: $127K (time-value of delayed duty payments). (B) Rates rise to 200% in 6 months: PF saves $261K/year on rate differential. (C) Rates fall to 80% after trade deal: PF costs $309K/year premium vs. market rate. | Analytical — "Scenario B is the money story" | `PFAnalysisResults`, `ScenarioCards` (x3), `NPVCalculation` | `POST /api/ftz/analyze` |
| 5 | `/tools/ftz-analyzer` | Adjusts probability weights: 20% rates stable, 50% rates increase, 30% rates decrease | Probability-weighted NPV: $47,200 expected annual savings. Breakeven: 11 months. ROI: 105% in year 1. | Convinced — "$47K/year is a compelling pitch" | `ProbabilityWeightSliders`, `WeightedNPVDisplay`, `BreakevenCalculator` | Client-side recalculation |
| 6 | `/tools/ftz-analyzer` | Clicks "Withdrawal Scheduler" tab | Withdrawal planner: 40,000 units/month over 12 months. Month-by-month calendar: duty owed, cumulative duty, cash flow vs. pay-at-import. Chart shows $127K cash flow advantage from deferred payments. | Planning — "The cash flow story alone is worth presenting" | `WithdrawalScheduler`, `MonthlyCalendar`, `CashFlowChart` | `POST /api/ftz/withdrawal-schedule` |
| 7 | `/tools/ftz-analyzer` | Clicks "Compare FTZ Sites" | Map view: 3 FTZ sites near client's LA warehouse. FTZ #202 (Long Beach, 2.1 miles), FTZ #236 (San Pedro, 4.8 miles), FTZ #50 (Los Angeles, 7.2 miles). Table: annual fees, available space, cold storage (N/A for this product), activation timeline. | Practical — "FTZ #202 is the obvious choice" | `FTZSiteMap`, `SiteComparisonTable`, `DistanceCalculator` | `GET /api/ftz/sites?lat=...&lon=...` |
| 8 | `/tools/ftz-analyzer` | Clicks "Generate Client Presentation" | System builds PDF/PPTX: Executive summary, PF mandate explanation, 3-scenario analysis, cash flow chart, withdrawal schedule, FTZ site recommendation, implementation timeline, ROI calculation. 12 pages. | Professional — "This is consultant-quality output" | `PresentationGenerator`, `ExecutiveSummaryBuilder` | `POST /api/export/ftz-presentation` |
| 9 | Email | Sends presentation to client CEO + CFO | — (off-platform) | Strategic — "I'm positioning myself as an FTZ advisor, not just a freight broker" | — | — |
| 10 | `/dashboard` | Client agrees to FTZ strategy. Marcus logs outcome. | Client record updated: "FTZ Strategy Approved — $47K projected annual savings. Implementation start: July 2026. FTZ Site: #202 Long Beach." New recurring revenue: FTZ management fees $2,000/month. | Successful — "That's $24K/year in new recurring revenue for me" | `ClientRecord`, `DealTracker`, `RevenueLogger` | `PUT /api/clients/{id}/update` |

**Time to Value:** 15 minutes to build a consultant-quality FTZ presentation. Client impact: $47K/year in savings. Broker impact: $24K/year in new recurring revenue.

---

### Journey B5: "End-of-Month Reporting"

**Scenario:** End of month. Marcus needs to prepare performance reports for his top 3 clients showing cost efficiency, carrier performance, and optimization recommendations.

**Entry Point:** Analytics dashboard
**Exit Point:** 3 client reports exported and sent

| Step | Screen / Route | User Action | System Response | Emotional State | Components | API / Data |
|------|---------------|-------------|-----------------|-----------------|------------|------------|
| 1 | `/dashboard/analytics` | Opens Analytics, selects "Client Reports" tab | Client list with shipment counts: Pacific Tile (8 shipments), Fresh Farms (12 shipments), SoCal Electronics (6 shipments) | Organized — "Three reports to build" | `ClientReportTab`, `ClientList` | `GET /api/analytics/clients` |
| 2 | `/dashboard/analytics` | Selects "Pacific Tile Distributors", date range: June 2026 | Client analytics load: 8 shipments completed, total freight spend $38,400, avg transit time 29 days, on-time rate 87.5% (1 delay). Cost trend: down 4% from May. | Reviewing — "Good month for Pacific Tile" | `ClientAnalyticsDashboard`, `KPICards`, `CostTrendMini` | `GET /api/analytics/client/{id}?range=2026-06` |
| 3 | `/dashboard/analytics` | Reviews "Recommendations" auto-generated section | System suggests: "Pacific Tile's India-origin shipments via Hapag-Lloyd have 100% on-time rate vs. 75% for MSC. Consider consolidating to Hapag-Lloyd for improved reliability at +$200/FEU premium." | Advisory — "Data-driven recommendation, nice" | `RecommendationEngine`, `CarrierReliabilityChart` | `GET /api/analytics/recommendations/{clientId}` |
| 4 | `/dashboard/analytics` | Clicks "Generate Report" | PDF: 4 pages — shipment summary, cost analysis, carrier performance, recommendations. Marcus's branding (logo, contact info) on every page. | Professional — "Client gets a branded report" | `ClientReportPDF`, `BrandingOverlay` | `POST /api/reports/client` |
| 5 | `/dashboard/analytics` | Repeats for Fresh Farms and SoCal Electronics | Two more reports generated, each with unique recommendations based on their shipment patterns | Efficient — "Three reports in 8 minutes" | Same components | Same API pattern |
| 6 | `/dashboard/analytics` | Sends all 3 reports via email | Reports emailed directly from platform with personalized cover messages | Done — "Monthly reporting used to take half a day" | `EmailComposer`, `BulkSendModal` | `POST /api/reports/send` |
| 7 | `/dashboard/analytics` | Reviews own broker performance summary | Marcus's brokerage: 26 shipments this month, avg margin $420/FEU, total revenue $10,920. Top route: INMAA -> USLAX. Client retention: 100%. | Satisfied — "Strong month. Platform is paying for itself." | `BrokerPerformanceSummary`, `RevenueChart` | `GET /api/analytics/broker/summary` |
| 8 | `/dashboard/analytics` | Exports own performance data for QuickBooks reconciliation | CSV export of all shipments with revenue, cost, and margin per booking | Administrative — "Bookkeeping handled" | `CSVExport`, `AccountingFormatSelector` | `GET /api/export/csv` |

**Time to Value:** 12 minutes for 3 client reports + own performance review. Previous workflow: 4-6 hours.

---

## 4. Journey C: FTZ Operator

### Journey C1: "PF vs. GPA Status Election"

**Scenario:** Sandra's 3PL client (GlobalTech Components) is importing electronic integrated circuits (HTS 8542.31) from China. With the April 2025 executive order, Sandra needs to determine the correct zone status election and model the financial implications.

**Entry Point:** FTZ Analyzer
**Exit Point:** PF election documented, withdrawal schedule exported for finance, compliance audit trail created

| Step | Screen / Route | User Action | System Response | Emotional State | Components | API / Data |
|------|---------------|-------------|-----------------|-----------------|------------|------------|
| 1 | `/tools/ftz-analyzer` | Opens FTZ Analyzer, selects "New Status Election" workflow | Status election wizard: Step 1 of 5 — Commodity Identification | Systematic — "Let's do this by the book" | `StatusElectionWizard`, `StepIndicator` | — |
| 2 | `/tools/ftz-analyzer` | Enters HTS 8542.31, country of origin: China, annual volume: 2.6M units, unit value: $4.20 FOB | System processes commodity against regulatory database | Thorough — "Getting the inputs right" | `CommodityInput`, `VolumeInput`, `OriginSelector` | `POST /api/ftz/commodity-check` |
| 3 | `/tools/ftz-analyzer` | System displays regulatory analysis | Red regulatory banner: "MANDATORY PF STATUS — Executive Order (April 2025): HTS 8542.31 falls within reciprocal tariff scope. Per 19 CFR 146.42(b) as amended, PF status is required. GPA election is NOT permitted for this commodity. Reference: Federal Register Vol. 90, No. 74." | Confirmed — "PF is mandatory. No ambiguity." | `RegulatoryAlertBanner`, `CFRReference`, `FederalRegisterLink` | `GET /api/ftz/regulatory/{hts}` |
| 4 | `/tools/ftz-analyzer` | Acknowledges PF requirement, proceeds to Step 2: Rate Lock Analysis | Rate lock comparison: Current rate at PF admission = 145% (MFN 0% + Section 301 25% + Reciprocal 120%). Rate locked at 145% on date of admission regardless of future changes. | Understanding — "145% locked is the starting point" | `RateLockPanel`, `TariffStackBreakdown` | `GET /api/tariff/effective-rate/{hts}` |
| 5 | `/tools/ftz-analyzer` | Enters 3 tariff scenarios with probability weights | Scenario A (20%): Rates stable at 145% — 12 months. Scenario B (50%): Rates increase to 200% — within 6 months (trade escalation). Scenario C (30%): Rates decrease to 80% — trade deal reached in 9 months. | Modeling — "Need to cover all outcomes" | `ScenarioBuilder`, `ProbabilitySliders`, `TimelineEditor` | — |
| 6 | `/tools/ftz-analyzer` | System calculates NPV for each scenario | Scenario A: PF provides cash flow deferral only. NPV benefit: $134K/year (time-value at 8% discount rate). Scenario B: PF saves $0.231/unit vs. 200% rate. Annual savings: $600K. Scenario C: PF costs $0.273/unit premium. Annual cost: $710K. Probability-weighted NPV: +$94,200/year. | Decisive — "Positive expected value even accounting for downside" | `NPVResultCards`, `WeightedNPVDisplay`, `SensitivityChart` | `POST /api/ftz/npv-analysis` |
| 7 | `/tools/ftz-analyzer` | Clicks "Sensitivity Analysis" | Tornado chart: Most sensitive variables — (1) Probability of rate increase (swing: +/- $180K), (2) Rate increase magnitude (swing: +/- $150K), (3) Withdrawal pace (swing: +/- $40K). Breakeven: PF is positive NPV as long as probability of rate increase > 25%. | Deep analysis — "The math holds under most assumptions" | `TornadoChart`, `SensitivityTable`, `BreakevenLine` | Client-side |
| 8 | `/tools/ftz-analyzer` | Proceeds to Step 3: Withdrawal Planning | Withdrawal planner with parameters: 2.6M units/year, 50,000 units/week admission, 40,000 units/week withdrawal. Surplus builds inventory buffer in zone. | Planning — "Need to match client's fulfillment cadence" | `WithdrawalPlanner`, `InventoryProjection` | — |
| 9 | `/tools/ftz-analyzer` | Sets withdrawal schedule: 40,000 units/week, weekly cycle | Week-by-week projection: inventory builds from 0 to 520K units by week 52 (10K/week net accumulation). Duty cash outflow: $243,600/week at 145% on $4.20 x 40K units. Annual duty: $12.67M. | Detailed — "These are the numbers finance needs" | `WeeklyProjectionTable`, `InventoryBuildChart`, `DutyCashFlowChart` | `POST /api/ftz/withdrawal-schedule` |
| 10 | `/tools/ftz-analyzer` | Proceeds to Step 4: Compliance Documentation | System generates: PF Application Summary (19 CFR 146.41 format), Operator's Annual Reconciliation template, Weekly admission/withdrawal log template, Audit trail requirements checklist. | Compliance-ready — "This is what CBP wants to see" | `ComplianceDocGenerator`, `AuditTrailTemplate`, `CFRFormatExport` | `POST /api/ftz/compliance-docs` |
| 11 | `/tools/ftz-analyzer` | Reviews compliance checklist | 14-item checklist: PF production notification filed (pending), zone operator agreement updated (pending), CBP port director notification (pending), ... 8 items auto-completed from data entered, 6 require manual action. | Organized — "I know exactly what's left to do" | `ComplianceChecklist`, `StatusIndicators` | — |
| 12 | `/tools/ftz-analyzer` | Proceeds to Step 5: Export & Documentation | Export options: (1) XLSX withdrawal schedule for finance team, (2) PDF executive summary for client, (3) Compliance package for CBP, (4) Full analysis with all scenarios. | Wrapping up — "Let me get all the deliverables" | `ExportOptionsPanel`, `MultiFormatExport` | — |
| 13 | `/tools/ftz-analyzer` | Exports XLSX withdrawal schedule | XLSX: 52-week calendar with columns: Week, Units Admitted, Units Withdrawn, Inventory Level, Duty Rate, Duty Owed, Cumulative Duty, Cash Flow Impact. Pre-formatted for finance review. | Deliverable — "Finance will love this" | `XLSXGenerator`, `FinanceTemplate` | `POST /api/export/xlsx` |
| 14 | `/tools/ftz-analyzer` | Exports PDF executive summary | 8-page PDF: regulatory requirement, PF analysis, 3 scenarios with probabilities, recommended action, withdrawal schedule summary, next steps. Client-ready formatting. | Professional — "Consultant-quality deliverable" | `PDFGenerator`, `ExecutiveSummaryTemplate` | `POST /api/export/pdf` |
| 15 | `/tools/ftz-analyzer` | Saves analysis to client record with audit log entry | Analysis saved: "GlobalTech Components — PF Status Election, HTS 8542.31, $94.2K weighted NPV. Analyst: Sandra Okonkwo. Date: 2026-06-15. Status: Pending client approval." | Documented — "Complete audit trail for CBP" | `ClientRecord`, `AuditLogger`, `AnalysisSaveConfirmation` | `POST /api/ftz/analyses/save` |

**Time to Value:** 25 minutes for a complete PF status election analysis that would previously take 4-6 hours in Excel.

---

### Journey C2: "Zone Inventory Management"

**Scenario:** Sandra manages daily FTZ operations. She needs to process this week's withdrawals, ensure duty calculations are correct, and maintain compliance documentation.

**Entry Point:** FTZ Dashboard
**Exit Point:** Weekly withdrawals processed, duties calculated, audit log updated

| Step | Screen / Route | User Action | System Response | Emotional State | Components | API / Data |
|------|---------------|-------------|-----------------|-----------------|------------|------------|
| 1 | `/dashboard` | Navigates to FTZ Operations view | FTZ dashboard: Zone #247 overview. Current inventory: 1.2M units across 14 clients. Pending withdrawals this week: 3 clients, 127,000 total units. Compliance status: green (all current). | Command center — "Everything in one view" | `FTZDashboard`, `ZoneOverviewPanel`, `WithdrawalQueue` | `GET /api/ftz/zone/overview` |
| 2 | `/dashboard` | Clicks "Withdrawal Queue" | Pending withdrawals: (1) GlobalTech — 40,000 units, HTS 8542.31, PF locked rate 145%. (2) Pacific Auto — 52,000 units, HTS 8708.29, GPA rate 2.5%. (3) MedDevice Inc — 35,000 units, HTS 9018.39, PF locked rate 45%. | Processing — "Three withdrawals to handle" | `WithdrawalQueueTable`, `ClientWithdrawalCard` | `GET /api/ftz/withdrawals/pending` |
| 3 | `/dashboard` | Clicks "Process" on GlobalTech withdrawal | Withdrawal detail: 40,000 units x $4.20 FOB x 145% duty = $243,600 duty owed. Breakdown: MFN 0% + Section 301 25% + Reciprocal 120% = 145% PF locked. Cash flow note: duty payment due within 10 working days of withdrawal. | Calculating — "Confirming the duty math" | `WithdrawalProcessingForm`, `DutyCalculationBreakdown` | `POST /api/ftz/withdrawals/calculate` |
| 4 | `/dashboard` | Confirms withdrawal, system generates documentation | Generated: CBP Entry Summary (7501) data, FTZ Admission/Withdrawal Record, Weekly reconciliation entry. All documents tagged with zone lot number and admission date for audit trail. | Compliant — "Documentation chain is solid" | `EntryDocGenerator`, `LotNumberTracker`, `ReconciliationLogger` | `POST /api/ftz/withdrawals/process` |
| 5 | `/dashboard` | Processes Pacific Auto withdrawal (GPA, simpler) | GPA withdrawal: 52,000 units x $18.70 x 2.5% = $24,310 duty. No rate lock — current market rate applied. Standard documentation generated. | Routine — "GPA is straightforward" | Same components | Same API |
| 6 | `/dashboard` | Processes MedDevice withdrawal (PF, different rate) | PF withdrawal: 35,000 units x $22.40 x 45% = $352,800 duty. Note: "Rate locked at 45% on March 15, 2026. Current market rate: 67%. PF savings on this withdrawal: $172,480." | Impactful — "PF saved the client $172K this withdrawal" | Same components, `PFSavingsHighlight` | Same API |
| 7 | `/dashboard` | Reviews weekly summary | Total withdrawals: 127,000 units, $620,710 total duty. PF savings realized: $172,480. Compliance status: all documentation generated. Audit log: 3 entries created. | Complete — "Week's operations processed and documented" | `WeeklySummaryPanel`, `AuditLogViewer` | `GET /api/ftz/weekly-summary` |
| 8 | `/dashboard` | Clicks "Inventory Snapshot" | Current zone inventory by client: 14 clients, 1,073,000 units remaining (after withdrawals). Aging analysis: oldest lot 9 months (GlobalTech), newest 2 weeks (MedDevice). No lots approaching annual reconciliation deadline. | Monitoring — "Inventory is healthy" | `InventorySnapshot`, `AgingAnalysis`, `ReconciliationCalendar` | `GET /api/ftz/inventory/snapshot` |
| 9 | `/dashboard` | Exports weekly operations report | PDF: withdrawals processed, duties calculated, PF savings summary, inventory snapshot, compliance status. Ready for management review. | Documented — "Management gets this every Friday" | `WeeklyReportExport` | `POST /api/reports/ftz-weekly` |
| 10 | `/dashboard` | Creates audit log entry: "Week of June 9-13, 2026 — 3 withdrawals processed, $620,710 duty, 0 discrepancies" | Audit entry saved with timestamp, operator ID, and all linked documents | Audit-ready — "CBP can ask for this anytime and I'm prepared" | `AuditLogEntry`, `LinkedDocumentRefs` | `POST /api/ftz/audit-log` |
| 11 | `/dashboard` | Sends client notifications: duty amounts owed, payment deadlines | Automated emails: GlobalTech ($243,600 due June 27), Pacific Auto ($24,310 due June 27), MedDevice ($352,800 due June 27). | Service-oriented — "Clients know exactly what they owe" | `ClientNotificationBatch`, `PaymentReminder` | `POST /api/notifications/batch-send` |
| 12 | `/dashboard` | Checks compliance dashboard before closing | All green: PF elections current, annual reconciliation on track, no CBP inquiries pending, next audit scheduled Q3. | Confident — "Zone is running clean" | `ComplianceDashboard`, `AuditSchedule` | `GET /api/ftz/compliance/status` |

**Time to Value:** 20 minutes for full weekly FTZ operations processing (3 clients, 127K units). Previous workflow: 2-3 hours across Magaya + Excel + manual documentation.

---

### Journey C3: "Tariff Change Impact Assessment"

**Scenario:** The Federal Register publishes a tariff modification: Section 301 rates on HTS Chapter 85 (electrical equipment) increasing from 25% to 50%, effective in 90 days. Sandra needs to assess the impact on all affected clients in her FTZ.

**Entry Point:** Notification alert
**Exit Point:** All affected clients notified with impact analysis and recommendations

| Step | Screen / Route | User Action | System Response | Emotional State | Components | API / Data |
|------|---------------|-------------|-----------------|-----------------|------------|------------|
| 1 | `/dashboard` | Sees red notification badge: "Tariff Change Alert" | Alert detail: "Section 301 tariff modification published in Federal Register. HTS Chapter 85 — rate increase from 25% to 50%. Effective date: September 15, 2026. Impact: 4 clients in your zone affected." | Urgent — "This is what we train for" | `TariffAlertBanner`, `FederalRegisterLink`, `ImpactCount` | Webhook / `GET /api/tariff/alerts` |
| 2 | `/dashboard` | Clicks "View Affected Clients" | Affected client list: (1) GlobalTech — HTS 8542.31, 520K units in zone, PF locked at 145%. (2) SparkElec — HTS 8536.90, 180K units, GPA at current rate. (3) PowerCell — HTS 8507.60, 90K units, GPA. (4) DigiSense — HTS 8541.49, 310K units, PF locked at 130%. | Triaging — "PF clients are protected, GPA clients are exposed" | `AffectedClientList`, `ExposureIndicator`, `StatusBadge` | `GET /api/ftz/tariff-impact/{chapter}` |
| 3 | `/dashboard` | Clicks "Run Impact Analysis" for all 4 clients simultaneously | System calculates for each: current duty exposure, new duty exposure, delta, PF protection status, recommended actions. Processing indicator shows progress. | Analytical — "Let the system do the math" | `BatchImpactAnalysis`, `ProgressIndicator` | `POST /api/ftz/batch-impact-analysis` |
| 4 | `/dashboard` | Reviews GlobalTech impact (PF client) | GlobalTech: PF locked at 145% (includes old 25% Section 301). New rate would be 170% (with 50% Section 301). PF PROTECTS against increase. Savings if rates change: $0.105/unit x 520K units = $54,600 in zone savings. Recommendation: "Accelerate admissions before rate change to lock more inventory at 145%." | Strategic — "PF is doing exactly what it should" | `ImpactDetailCard`, `PFProtectionBadge`, `SavingsCalculation`, `RecommendationPanel` | — |
| 5 | `/dashboard` | Reviews SparkElec impact (GPA client — exposed) | SparkElec: GPA at current 27.5% effective rate. New rate: 52.5% effective. Impact on 180K units: additional $0.375/unit = $67,500 exposure if withdrawn after September 15. Recommendation: "Consider: (A) Accelerate withdrawals before rate change, (B) Convert to PF status to lock current rate, (C) Do nothing if withdrawal timeline is before September 15." | Problem-solving — "SparkElec needs options fast" | `ImpactDetailCard`, `ExposureWarning`, `OptionCards` (x3) | — |
| 6 | `/dashboard` | Models SparkElec Option B: PF conversion | PF conversion analysis: Lock at current 27.5%. If rates go to 52.5%, saves $67,500. If rates drop later (30% probability), PF costs $22,500 premium. NPV of conversion: +$38,250 expected value. Timeline: PF application takes 30-45 days — tight before September 15 effective date. | Advising — "PF conversion is the right move but time is tight" | `PFConversionModeler`, `TimelineWarning` | `POST /api/ftz/pf-conversion-model` |
| 7 | `/dashboard` | Generates impact reports for all 4 clients | 4 individual PDF reports: regulatory context, client-specific impact, inventory exposure, recommended actions, timeline. Plus internal summary for Sandra's management. | Delivering — "Each client gets a personalized analysis" | `BatchReportGenerator`, `ClientImpactPDF` | `POST /api/reports/batch-impact` |
| 8 | `/dashboard` | Sends reports to all affected clients with priority flags | Emails sent: GlobalTech (informational — PF protecting you), SparkElec (action required — PF conversion recommended), PowerCell (action required), DigiSense (informational — PF protecting you). | Proactive — "Clients hear it from me first, not from the news" | `BatchEmailSender`, `PriorityFlags` | `POST /api/notifications/batch-send` |
| 9 | `/dashboard` | Logs tariff change event in compliance system | Audit entry: "Federal Register tariff modification — Section 301 Chapter 85 rate increase. Impact assessment completed for 4 clients. PF conversions recommended for 2 clients. Analysis date: June 15, 2026." | Documented — "Audit trail shows we were proactive" | `ComplianceEventLogger`, `AuditEntry` | `POST /api/ftz/audit-log` |
| 10 | `/dashboard` | Sets calendar reminder: "SparkElec PF application deadline — August 1" (45 days before effective date) | Reminder created with linked analysis and client contact | Forward-looking — "We won't miss the window" | `ReminderScheduler`, `LinkedDocuments` | `POST /api/reminders/create` |

**Time to Value:** 30 minutes from tariff change publication to all 4 clients notified with personalized impact analyses. Previous workflow: 2-3 days of manual analysis across Excel spreadsheets.

---

### Journey C4: "New Client Zone Setup"

**Scenario:** A new client (FreshMed Pharmaceuticals) wants to use Sandra's FTZ for importing pharmaceutical intermediates from India. Sandra needs to onboard them, model their trade economics, and set up their zone operations.

**Entry Point:** FTZ management dashboard
**Exit Point:** Client fully onboarded with initial modeling and compliance setup

| Step | Screen / Route | User Action | System Response | Emotional State | Components | API / Data |
|------|---------------|-------------|-----------------|-----------------|------------|------------|
| 1 | `/dashboard` | Clicks "Add Client" in FTZ management section | New client onboarding wizard: Company info, primary commodities, import volume, current customs process, FTZ objectives | Welcoming — "Let's get them set up properly" | `ClientOnboardingWizard`, `StepIndicator` | — |
| 2 | `/dashboard` | Enters: FreshMed Pharmaceuticals, HTS 2933.39 (pharmaceutical intermediates), India origin, $4.5M annual import value, 8 containers/month | Client profile created. System checks HTS against regulatory databases. | Setup — "Pharmaceutical imports have extra requirements" | `ClientProfileForm`, `HTSRegulatoryCheck` | `POST /api/ftz/clients/create` |
| 3 | `/dashboard` | System displays trade preference analysis | Results: HTS 2933.39 from India — MFN duty rate 6.5%. No Section 301 tariffs (India). No ADD/CVD. FDA prior notice required (pharmaceutical product). Special requirement: FDA-regulated product requires additional documentation for FTZ admission. | Aware — "FDA layer adds complexity" | `TradePreferencePanel`, `FDARegulatoryFlag`, `DocumentRequirements` | `GET /api/tariff/full-analysis/{hts}` |
| 4 | `/dashboard` | Proceeds to FTZ modeling: PF vs. GPA election | System: GPA is recommended for this commodity. No executive order mandate for PF. GPA advantages: duty assessed at current rate on withdrawal (flexibility if rates decrease), simpler compliance requirements. PF advantage: rate lock protection (but India rates are stable and low). Recommendation: "GPA preferred. Low tariff volatility for India-origin pharmaceuticals." | Clear — "GPA is the right call here" | `PFvsGPAAdvisor`, `RecommendationCard` | `POST /api/ftz/status-recommendation` |
| 5 | `/dashboard` | Accepts GPA recommendation, proceeds to initial inventory modeling | Inventory modeler: 8 containers/month x 15,000 units/container = 120,000 units/month admitted. Client plans 100,000 units/month withdrawal. Zone inventory builds at 20,000 units/month. | Planning — "Steady accumulation in the zone" | `InventoryModeler`, `AdmissionWithdrawalChart` | `POST /api/ftz/inventory-model` |
| 6 | `/dashboard` | Models first-year projections | Year 1: $4.5M imported, $292,500 total duty (6.5%), average zone inventory 120,000 units. Cash flow advantage of FTZ: $24,375/month in deferred duty payments. Annual cash flow benefit: $146,250 at 8% discount rate. Breakeven on zone fees ($45K/year): 3.7 months. | Compelling — "ROI is very strong for this client" | `YearOneProjection`, `CashFlowModel`, `BreakevenCalculator` | — |
| 7 | `/dashboard` | Sets up withdrawal schedule: 100,000 units/month, first-of-month cycle | Monthly withdrawal calendar generated for 12 months. Integration with compliance documentation auto-generation. | Structured — "Automated schedule reduces manual work" | `WithdrawalScheduleSetup`, `CalendarView` | `POST /api/ftz/withdrawal-schedule` |
| 8 | `/dashboard` | Reviews compliance checklist for pharmaceutical FTZ operations | Enhanced checklist (16 items vs. standard 14): includes FDA prior notice requirements, drug listing verification, pharmaceutical storage conditions certification, chain of custody documentation. 4 items need client input. | Thorough — "Pharma adds regulatory layers" | `PharmaComplianceChecklist`, `EnhancedChecklist` | `GET /api/ftz/compliance/checklist/{hts}` |
| 9 | `/dashboard` | Sends onboarding package to FreshMed | Email with: welcome document, required documentation list, withdrawal schedule, compliance requirements, first admission target date, Sandra's direct contact. | Service-oriented — "Clean handoff to the client" | `OnboardingPackageGenerator`, `EmailSender` | `POST /api/ftz/onboarding/send` |
| 10 | `/dashboard` | Creates client dashboard view | FreshMed now appears in FTZ dashboard: status "Onboarding", next action "Receive initial documentation", admission target "July 1, 2026". | Complete — "Client is in the system and on track" | `ClientDashboardCard`, `OnboardingTracker` | `PUT /api/ftz/clients/{id}/status` |

**Time to Value:** 20 minutes for complete new client onboarding with economic modeling and compliance setup. Previous workflow: 1-2 days of back-and-forth.

---

## 5. Cross-Journey Analysis

### Feature Heat Map

How frequently each persona interacts with platform features (1 = Rarely, 5 = Daily):

| Feature / Module | Import Indie (Maya) | Freight Broker (Marcus) | FTZ Operator (Sandra) |
|------------------|:-------------------:|:-----------------------:|:---------------------:|
| **Landed Cost Calculator** | 5 | 5 | 2 |
| **HTS Lookup** | 4 | 5 | 3 |
| **FTZ Analyzer** | 2 | 3 | 5 |
| **Route Comparison** | 3 | 5 | 1 |
| **Container Tracking** | 4 | 5 | 3 |
| **Document Management** | 4 | 3 | 5 |
| **PDF Export / Proposals** | 2 | 5 | 4 |
| **Analytics Dashboard** | 3 | 4 | 4 |
| **Unit Economics Calculator** | 5 | 3 | 1 |
| **Tariff Scenario Modeling** | 3 | 4 | 5 |
| **Compliance Checking (ISF, ADD/CVD)** | 2 | 4 | 5 |
| **Client/Shipment Management** | 2 | 5 | 5 |
| **Withdrawal Scheduler** | 1 | 2 | 5 |
| **Knowledge Base** | 4 | 2 | 1 |

### Module Interaction Frequency (Sessions Per Week)

| Module | Import Indie | Freight Broker | FTZ Operator |
|--------|:------------:|:--------------:|:------------:|
| Calculators & Tools | 3-4 | 8-12 | 2-3 |
| Tracking & Operations | 1-2 | 10-15 | 5-8 |
| Documents & Compliance | 1 | 5-8 | 8-12 |
| Analytics & Reports | 1 (monthly) | 3-5 | 3-5 |
| FTZ-Specific | 0-1 | 1-2 | 10-15 |

### Shared vs. Persona-Specific Workflows

**Shared (all 3 personas use):**
- HTS code lookup and duty rate verification
- Landed cost calculation (different depth of use)
- PDF/report export
- Container tracking (different views)
- Tariff change alerts

**Importer-Specific:**
- First-time calculator (anonymous, no account)
- Unit economics / margin analysis
- Supplier comparison (country-of-origin pivot)
- Knowledge base articles (learning mode)

**Broker-Specific:**
- Client proposal builder with broker margin overlay
- Multi-client dashboard with kanban view
- ADD/CVD auto-detection in quoting workflow
- Branded client reports
- Template management for recurring quote types

**FTZ-Operator-Specific:**
- PF vs. GPA status election wizard
- Withdrawal scheduling and processing
- Zone inventory management
- Compliance documentation generation (19 CFR format)
- Batch tariff impact analysis across multiple clients
- Audit log and compliance dashboard
- Client onboarding workflow

### Critical Handoff Points Between Modules

| Handoff | From | To | Data Transferred | Personas |
|---------|------|-----|-----------------|----------|
| HTS to Calculator | HTS Lookup | Landed Cost Calculator | HTS code, duty rate, Section 301 flag, ADD/CVD data | All |
| Calculator to FTZ | Landed Cost Calculator | FTZ Analyzer | Unit value, quantity, duty rate, annual volume | Maya, Marcus |
| Route to Proposal | Route Comparison | Proposal Builder | 3 carrier options, costs, transit times, reliability | Marcus |
| Tracking to Documents | Container Tracking | Document Management | Shipment ID, carrier, ports, ETA, ISF deadline | Maya, Marcus |
| FTZ Analysis to Withdrawal | FTZ Analyzer | Withdrawal Scheduler | PF/GPA election, locked rate, inventory level | Sandra |
| Tariff Alert to Impact | Tariff Monitoring | Batch Impact Analysis | Affected HTS codes, rate changes, effective dates | Sandra |
| Analytics to Report | Analytics Dashboard | Report Generator | Date range, client filter, KPIs, charts | Marcus, Sandra |

---

## 6. Onboarding Journeys

### 6.1 First-Time Anonymous User (No Account)

**Goal:** Let the user experience core value before asking for registration.

| Step | Screen / Route | User Action | System Response | Emotional State |
|------|---------------|-------------|-----------------|-----------------|
| 1 | `/` | Lands on homepage from search/referral | Hero section with embedded calculator. No login required. Cookie consent banner. | Evaluating — "What is this?" |
| 2 | `/` | Enters first calculation (landed cost or HTS lookup) | Full calculation runs with all 15 cost components. No feature gating. Result displayed in full. | Surprised — "This actually works without signing up?" |
| 3 | `/` | Tries a second calculation or explores FTZ Analyzer | All tools accessible. Third calculation triggers a soft prompt: "Create a free account to save your calculations." Dismissible. | Engaged — "I want to save this" |
| 4 | `/` | Clicks "Maybe later" on prompt | Prompt dismissed. Session continues. Calculations stored in localStorage (browser). Banner reminder at bottom: "Your calculations will be lost when you close this tab." | Informed — "Ok, I should probably sign up" |
| 5 | `/` or `/auth/register` | Either signs up voluntarily or continues anonymous | If signs up: localStorage calculations migrated to account. If anonymous: session data persists until tab close. | Converted or continuing — either way, they experienced value |

**Design Principle:** Zero-friction first experience. The calculator works immediately. Registration is a save mechanism, not a gate.

### 6.2 Registration + Onboarding Wizard

**Goal:** Personalize the experience and guide the user to their highest-value workflow.

| Step | Screen / Route | User Action | System Response | Emotional State |
|------|---------------|-------------|-----------------|-----------------|
| 1 | `/auth/register` | Enters email, password, company name | Account created. Google/Microsoft SSO also available. | Quick — "Simple signup" |
| 2 | `/onboarding/role` | Selects primary role: "I'm an Importer" / "I'm a Freight Broker" / "I manage an FTZ" / "Other" | System stores persona type. Tailors subsequent onboarding and default dashboard layout. | Identified — "They're asking the right questions" |
| 3 | `/onboarding/profile` | Enters: primary products, countries of origin, estimated annual volume, number of shipments/month | System builds initial profile. Pre-configures default HTS chapters, common routes, relevant regulatory flags. | Invested — "This is customizing for me" |
| 4 | `/onboarding/goals` | Selects top 3 goals: "Calculate landed cost accurately" / "Track shipments" / "Optimize duty strategy" / "Create client proposals" / "Manage FTZ operations" | System prioritizes dashboard widgets and sidebar navigation based on selected goals. | Purposeful — "Exactly what I need" |
| 5 | `/onboarding/import` | Option to import existing data: upload a spreadsheet of past shipments, or connect an existing forwarder portal, or skip | If upload: system parses and creates shipment history. If skip: blank slate with guided first-use prompts. | Flexible — "I can start fresh or bring my data" |
| 6 | `/onboarding/tour` | Interactive tour of 5 key features (tailored to persona) | Highlight tooltips on: (1) Calculator, (2) HTS Lookup, (3) Dashboard, (4) [persona-specific], (5) Export/PDF. Each tooltip has "Try it" CTA. | Guided — "I know where everything is" |
| 7 | `/dashboard` | Lands on personalized dashboard | Dashboard layout matches persona: Importer sees calculator + tracking. Broker sees client list + quote tools. FTZ operator sees zone overview + withdrawal queue. "Getting Started" checklist with 5 items. | Home — "This feels like MY tool" |
| 8 | `/dashboard` | Completes first checklist item (e.g., "Run your first calculation") | Checklist item checks off with micro-animation. Progress: 1/5 complete. Encouragement: "You've already found your first insight." | Progressing — "I'm making progress" |

**Time to Complete:** 3-4 minutes for registration + onboarding wizard.

### 6.3 Returning User Reactivation

**Goal:** Re-engage a user who signed up but hasn't logged in for 30+ days.

| Step | Screen / Route | User Action | System Response | Emotional State |
|------|---------------|-------------|-----------------|-----------------|
| 1 | Email inbox | Receives reactivation email: "Tariff rates changed since your last visit. See how your last calculation is affected." | Email includes personalized data: their most recent HTS code, rate change summary, one-click "See Impact" button. | Curious — "My rates changed?" |
| 2 | `/dashboard` | Clicks email link, auto-logged in | Dashboard loads with highlighted banner: "Since your last visit: 3 tariff changes affect your saved products. Section 301 on HTS 4419 increased from 3.2% to 7.5%." | Re-engaged — "Good thing I came back" |
| 3 | `/dashboard` | Clicks "Recalculate" on affected saved calculation | Original calculation re-runs with new rates. Comparison: old landed cost vs. new. Delta highlighted in red. | Active — "I need to update my pricing" |
| 4 | `/dashboard` | Runs new calculation or explores changes | Full platform access restored. Engagement checklist appears if onboarding was incomplete. | Retained — "This is actually useful to check regularly" |

### 6.4 Team Member Invited by Admin

**Goal:** Seamlessly onboard an employee invited by their organization admin.

| Step | Screen / Route | User Action | System Response | Emotional State |
|------|---------------|-------------|-----------------|-----------------|
| 1 | Email inbox | Receives invitation: "Marcus Davis invited you to Davis Freight Brokerage on Shipping Savior" | Email has organization name, inviter name, role assigned (Analyst), "Accept Invitation" button. | Expected — "Marcus told me about this" |
| 2 | `/auth/accept-invite` | Clicks link, creates password (email pre-filled from invite) | Account created with organization membership. Role: Analyst (can view and create, cannot delete or manage billing). | Smooth — "No friction" |
| 3 | `/onboarding/team-tour` | Abbreviated tour: 3 screens (not 5) focused on role-specific features | Tour shows: how to create calculations, how to view shared shipments, how to generate reports. Skips admin features. | Focused — "Just what I need for my role" |
| 4 | `/dashboard` | Lands on shared dashboard | Sees organization's active shipments, shared calculations, team activity feed. Pre-configured with org's default routes and HTS codes. | Embedded — "I'm already part of the team workspace" |
| 5 | `/dashboard` | First action: clicks a shared shipment to review | Full access to shipment detail. Can add notes, update documents. Cannot delete. | Productive — "I can start contributing immediately" |
| 6 | `/dashboard` | Marcus's admin dashboard shows: "New team member active: [name], first action: reviewed shipment #1234" | Admin gets confirmation their invite was accepted and the new member is working. | Connected — team visibility from day one |

---

## 7. Error & Recovery Paths

### 7.1 HTS Code Not Found

**Trigger:** User enters a product description that the AI classifier cannot match with confidence above 40%.

| Step | System State | System Response | User Action | Recovery |
|------|-------------|-----------------|-------------|----------|
| 1 | Classification returns 0 results above threshold | Message: "We couldn't confidently classify this product. This can happen with composite goods, novel products, or very broad descriptions." | Reads message | — |
| 2 | System offers alternatives | 3 fallback options: (A) "Refine your description" — guided prompts: "What is the primary material?", "What is its function?", "How is it used?" (B) "Browse by category" — HTS chapter tree navigation. (C) "Request manual review" — submit for human classification (premium feature). | Selects one fallback | — |
| 3A | User refines description | Re-runs classification with more specific inputs. Higher confidence expected. | Reviews new results | If still no match, escalate to (C) |
| 3B | User browses chapters | Interactive tariff schedule browser: Section -> Chapter -> Heading -> Subheading. Expandable tree with search-within-chapter. | Navigates to closest match | Manual selection with "I'm not sure" flag |
| 3C | User requests review | Form submitted with product description, photos (optional), supplier info. Turnaround: 24-48 hours. Email notification when classified. | Waits for response | Classification delivered via email + dashboard notification |

### 7.2 Container Tracking Unavailable

**Trigger:** Terminal49 API returns no data for the container/BOL number entered.

| Step | System State | System Response | User Action | Recovery |
|------|-------------|-----------------|-------------|----------|
| 1 | No tracking data returned | Message: "Tracking data is not yet available for container [number]. This usually means the container hasn't been gated in at the origin terminal yet." | Reads explanation | — |
| 2 | System shows last known state (if any) | If previously tracked: show last event with timestamp and "as of" label. If new: show "No events yet" with estimated first event based on booking date. | Reviews available info | — |
| 3 | System offers alternatives | (A) "Check carrier website directly" — deep link to carrier's tracking page with container number pre-filled. (B) "Set alert" — notify when first tracking event appears. (C) "Enter manual update" — user can log status manually (e.g., "Confirmed gate-in by supplier"). | Selects preference | Alert fires when data appears |
| 4 | Data becomes available | Push notification: "Tracking data now available for [container]. First event: Gate-Out at [terminal]." Dashboard auto-updates. | Checks dashboard | Full tracking timeline now visible |

### 7.3 ISF Deadline Missed

**Trigger:** System detects ISF has not been filed and vessel departure is within 24 hours or has already departed.

| Step | System State | System Response | User Action | Recovery |
|------|-------------|-----------------|-------------|----------|
| 1 | ISF deadline < 24 hours, ISF status: Not Filed | CRITICAL ALERT (red, full-width banner): "ISF DEADLINE IMMINENT — Container [number]. Vessel departs in [X hours]. ISF not filed. Penalty: $5,000 per violation. ACTION REQUIRED." | Sees alert immediately on dashboard | — |
| 2 | System provides emergency guidance | Escalation panel: (1) "Contact your customs broker immediately" — broker contact info if on file. (2) "ISF data packet" — export all available ISF elements for emergency filing. (3) "What happens if ISF is late" — penalty explanation, grace period info, CBP contact. | Contacts broker, exports ISF data | Broker files emergency ISF |
| 3 | If vessel has already departed (missed) | Warning changes: "ISF DEADLINE PASSED — Late filing may incur $5,000 penalty. Recommended: File immediately to minimize additional penalties. Late ISF is better than no ISF." | Files late ISF through broker | — |
| 4 | Follow-up | System creates incident log entry: "ISF deadline missed for shipment [ID]. Late filing completed [date]. Penalty risk: $5,000." Recommendation: "Set up automatic ISF reminders for all future shipments — 72h, 48h, and 24h before deadline." | Enables automatic reminders | Prevention for future shipments |

### 7.4 Payment Failed

**Trigger:** Monthly subscription payment fails (card expired, insufficient funds, etc.).

| Step | System State | System Response | User Action | Recovery |
|------|-------------|-----------------|-------------|----------|
| 1 | Payment processor returns failure | In-app banner (yellow): "Payment failed. Your subscription will remain active for 7 days while you update your payment method." Email sent with same message. | Sees notification | — |
| 2 | Day 1-7 (Grace period) | Full platform access maintained. Daily email reminder with "Update Payment" link. Banner persists on every page. | Updates payment or ignores | — |
| 3 | Day 7 — payment still failed | Access restricted to read-only. All data preserved. Cannot run new calculations, create shipments, or generate exports. Banner (red): "Your account is in read-only mode. Update payment to restore full access." | Sees restrictions | Updates payment to restore |
| 4 | Day 30 — still not resolved | Final email: "Your account will be deactivated in 7 days. All data will be preserved for 90 days. Export your data before deactivation." One-click data export button in email. | Exports data or reactivates | — |
| 5 | Reactivation | User updates payment at any point during days 1-37. Immediate full access restoration. No data lost. Welcome-back message: "All your calculations, shipments, and settings are exactly where you left them." | Enters new payment | Full access restored instantly |

### 7.5 External API Timeout

**Trigger:** Terminal49, carrier rate API, or CBP data feed times out (>10s response).

| Step | System State | System Response | User Action | Recovery |
|------|-------------|-----------------|-------------|----------|
| 1 | API timeout detected | Loading indicator transitions to: "Live data temporarily unavailable. Showing cached data from [timestamp]." Yellow "Cached" badge on all affected data points. | Sees cached data with clear labeling | — |
| 2 | Cached data displayed | All calculations work using cached rates. Tracking shows last-known positions. HTS data uses local database (always available). | Continues working | — |
| 3 | API recovery | Background retry succeeds. Data silently refreshes. "Cached" badges removed. If significant changes detected: "Data updated — rates changed since cached version. Review affected calculations." | Reviews if notified | — |
| 4 | Prolonged outage (>1 hour) | Dashboard shows system status: "Carrier rate feeds experiencing delays. ETA for resolution: monitoring. Your calculations use the most recent cached data." Link to status page. | Checks status page if needed | — |

### 7.6 Document Upload Fails

**Trigger:** File upload fails due to size, format, corruption, or network error.

| Step | System State | System Response | User Action | Recovery |
|------|-------------|-----------------|-------------|----------|
| 1 | Upload fails | Error message specific to cause: (A) "File too large — 25MB maximum. Your file: 32MB. Try: compress the PDF or split into multiple files." (B) "Unsupported format — .docx is not supported. Accepted: PDF, JPG, PNG, XLSX, CSV." (C) "Upload interrupted — check your connection and try again." | Reads specific guidance | — |
| 2 | System provides help | Contextual tips: "For scanned documents, take a photo with your phone and upload the JPG — our system can read scanned images." Link to document preparation guide. | Follows guidance | — |
| 3 | Retry mechanism | "Try Again" button with same file pre-selected. If same error: "Still having trouble? Try uploading from a different browser or device, or email the document to uploads@shippingsavior.com for manual processing." | Retries or emails document | — |
| 4 | Manual fallback | If all upload attempts fail: "Enter document data manually" — form with all extractable fields (seller, buyer, HTS codes, quantities, values). System marks as "Manually Entered — original document not on file." | Enters data manually | All calculations work with manual data |

---

## 8. Metrics & Success Criteria

### 8.1 Per-Journey Conversion Funnels

#### Journey A1: First-Time Landed Cost (Importer)

| Funnel Stage | Target Rate | Measurement |
|-------------|-------------|-------------|
| Homepage visit -> Calculator interaction | 60% | First input entered within 30s of page load |
| Calculator interaction -> Complete calculation | 75% | All required fields filled, result displayed |
| Complete calculation -> HTS Lookup | 40% | Clicks "Verify your HTS code" CTA |
| HTS Lookup -> FTZ Evaluation | 25% | Clicks "Check FTZ savings" CTA |
| Any calculation -> Account creation | 15% | Registration completed within same session |
| Account creation -> Second session (within 7 days) | 50% | Returns to platform within 1 week |

**Overall homepage-to-registration conversion target: 15%**

#### Journey B1: Client Proposal (Broker)

| Funnel Stage | Target Rate | Measurement |
|-------------|-------------|-------------|
| Dashboard -> New Quote started | 90% | Quote wizard opened |
| Quote started -> Route comparison generated | 95% | 3 carrier options displayed |
| Route comparison -> ADD/CVD check reviewed | 70% | User clicks into duty analysis |
| ADD/CVD check -> PDF proposal generated | 80% | Export button clicked |
| PDF generated -> Sent to client | 90% | Email sent or PDF downloaded |

**Overall dashboard-to-proposal-sent target: 48%**

#### Journey C1: PF Status Election (FTZ Operator)

| Funnel Stage | Target Rate | Measurement |
|-------------|-------------|-------------|
| FTZ Analyzer -> Commodity entered | 95% | HTS code and parameters submitted |
| Commodity entered -> Scenario modeling completed | 85% | All 3 scenarios with probability weights set |
| Scenario modeling -> Withdrawal schedule generated | 75% | Schedule tab completed |
| Withdrawal schedule -> Export generated | 90% | XLSX or PDF exported |
| Export generated -> Saved to client record | 80% | Analysis linked to client account |

**Overall analyzer-to-saved-analysis target: 46%**

### 8.2 Time-to-Value Metrics

| Persona | First Value Moment | Target Time | Definition |
|---------|-------------------|-------------|------------|
| Import Indie | First completed landed cost calculation | < 3 minutes | User sees full 15-component cost breakdown for their product |
| Import Indie | First "aha" insight | < 5 minutes | User discovers a cost component they didn't know about (e.g., MPF, ISF fee) |
| Import Indie | First saved calculation | < 10 minutes | Account created and calculation persisted |
| Freight Broker | First client proposal generated | < 10 minutes | PDF with 3 carrier options exported |
| Freight Broker | First ADD/CVD discovery | < 15 minutes | System flags antidumping duty on a route the broker would have quoted |
| Freight Broker | Morning triage completed | < 15 minutes | All active shipment alerts reviewed and actioned |
| FTZ Operator | First PF/GPA analysis completed | < 25 minutes | Full status election with scenarios and withdrawal schedule |
| FTZ Operator | First batch impact analysis | < 30 minutes | Tariff change impact assessed across all affected clients |

### 8.3 Drop-Off Points and Mitigation Strategies

| Drop-Off Point | Expected Rate | Root Cause | Mitigation |
|----------------|--------------|------------|------------|
| Homepage -> First input (all personas) | 40% bounce | "What is this?" / unclear value proposition | A/B test hero copy. Show completed example calculation before empty form. Social proof (X importers saved $Y this month). |
| HTS Lookup -> No results | 15% of searches | Vague product description, novel product, composite goods | Progressive refinement prompts. "Browse by category" fallback. Show "Did you mean...?" suggestions based on partial matches. |
| Calculator -> Registration wall | 85% don't register on first visit | Not ready to commit, just exploring | Remove wall entirely. Let anonymous users run unlimited calculations. Prompt registration only for save/export/track features. |
| Onboarding wizard -> Skip (too long) | 30% skip onboarding | 8 steps feels like a form, not a welcome | Make onboarding skippable at every step. Default persona detection from first action (ran a calculation? probably importer. looked at routes? probably broker). |
| Broker -> Proposal not sent | 20% of proposals generated | Broker wants to customize more, or proposal doesn't match their brand | White-label options: upload logo, choose colors, edit cover text. Preview before export. |
| FTZ Operator -> Scenario modeling abandoned | 15% | Probability weighting is unfamiliar/uncomfortable | Provide default weight presets: "Conservative" (60% stable, 20% up, 20% down), "Bullish" (20%, 60%, 20%), "Bearish" (20%, 20%, 60%). One-click application. |
| Monthly analytics -> No return visit | 40% of users don't check analytics | Forgets it exists, no trigger | Automated monthly email digest with key metrics and one insight. "Your freight costs dropped 8% — here's why." Deep link to full dashboard. |

### 8.4 NPS Targets by Persona

| Persona | 30-Day NPS Target | 90-Day NPS Target | Key Driver |
|---------|:-----------------:|:-----------------:|-----------|
| Import Indie | 40 | 55 | "I finally understand my true costs" |
| Freight Broker | 50 | 65 | "I close deals faster with professional proposals" |
| FTZ Operator | 45 | 60 | "Compliance is automated and audit-ready" |

**Overall platform NPS target: 50 at 90 days**

### 8.5 Engagement Benchmarks

| Metric | Import Indie | Freight Broker | FTZ Operator |
|--------|:------------:|:--------------:|:------------:|
| Sessions per week | 2-3 | 8-12 | 5-8 |
| Calculations per session | 1-2 | 3-5 | 1-2 |
| Avg. session duration | 8 min | 15 min | 20 min |
| Features used per session | 2 | 3-4 | 2-3 |
| PDF exports per month | 1-2 | 15-25 | 8-12 |
| Shipments tracked concurrently | 1-3 | 20-50 | 50-200 (across clients) |
| Monthly active days | 8-10 | 20-22 | 18-20 |
| Churn risk threshold | < 2 sessions/month | < 5 sessions/month | < 3 sessions/month |

### 8.6 Revenue Metrics by Persona

| Metric | Import Indie ($99/mo) | Freight Broker ($349/mo) | FTZ Operator ($999/mo) |
|--------|:---------------------:|:------------------------:|:----------------------:|
| Target LTV | $1,188 (12 months) | $6,282 (18 months) | $17,982 (18 months) |
| Target CAC | < $150 | < $500 | < $2,000 |
| LTV:CAC ratio | > 7:1 | > 12:1 | > 9:1 |
| Payback period | < 2 months | < 2 months | < 3 months |
| Expansion revenue path | Upgrade to broker plan | Team seats ($149/seat) | Additional zone sites |
| Referral rate target | 10% of users refer 1 | 20% of users refer 1 | 15% of users refer 1 |

---

## Appendix: Screen Route Reference

All screen routes referenced in this document, mapped to application architecture:

| Route | Module | Personas | Journeys |
|-------|--------|----------|----------|
| `/` | Homepage / Landing | All (anonymous + logged in) | A1, Onboarding 6.1 |
| `/auth/register` | Authentication | All | A1, Onboarding 6.2 |
| `/auth/accept-invite` | Authentication | Team members | Onboarding 6.4 |
| `/onboarding/*` | Onboarding wizard | All new users | Onboarding 6.2 |
| `/dashboard` | Main dashboard | All (logged in) | A2-A5, B1-B5, C1-C4 |
| `/dashboard/tracking` | Shipment tracking detail | Maya, Marcus | A3, A4, B2 |
| `/dashboard/analytics` | Analytics & reporting | All (logged in) | A5, B5 |
| `/dashboard/savings` | FTZ savings overview | Sandra | C2 |
| `/dashboard/notifications` | Alert center | All (logged in) | A3, B2, C3 |
| `/tools/hts-lookup` | HTS Classification | All | A1, B1, B3 |
| `/tools/unit-economics` | Unit Economics Calculator | Maya, Marcus | A1, A2, B3 |
| `/tools/route-comparison` | Route & Carrier Comparison | Maya, Marcus | A2, B1, B3 |
| `/tools/ftz-analyzer` | FTZ Analyzer | All | A1, B4, C1, C4 |
| `/knowledge-base` | Knowledge Base articles | Maya (primary) | A3 (inline) |

---

*This document serves as the definitive reference for engineering implementation of user flows. Each journey step maps to a screen, component, and API endpoint. Use this alongside the Technical Architecture and PRD documents to build each flow with full context of the user's emotional state and decision-making process.*

*Next steps: Convert high-priority journeys (A1, B1, C1) into Figma wireframe sequences and engineering tickets with acceptance criteria derived from each journey step.*

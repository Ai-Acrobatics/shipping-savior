# Regulatory & Compliance Requirements for US International Shipping/Logistics Platform

> **Last Updated:** 2026-03-26
> **Scope:** US-based platform serving importers (cold chain exports, SE Asia consumer goods imports) with tariff calculations, FTZ strategy, and freight brokerage.
> **Confidence:** HIGH (based on published CFR, CBP guidance, Federal Register notices, web research of 2025-2026 regulatory changes)
> **Disclaimer:** This is research for software platform design. Not legal advice. Importers should consult licensed customs brokers and trade attorneys.

---

## Table of Contents

1. [US Customs & Border Protection (CBP) Requirements](#1-us-customs--border-protection-cbp-requirements)
2. [Foreign Trade Zone (FTZ) Regulations](#2-foreign-trade-zone-ftz-regulations)
3. [Uyghur Forced Labor Prevention Act (UFLPA)](#3-uyghur-forced-labor-prevention-act-uflpa)
4. [Tariff & Trade Policy](#4-tariff--trade-policy)
5. [Cold Chain Specific Regulations](#5-cold-chain-specific-regulations)
6. [Platform Compliance (Software Itself)](#6-platform-compliance-for-the-software-itself)
7. [Summary: Platform Design Implications Matrix](#7-summary-platform-design-implications-matrix)

---

## 1. US Customs & Border Protection (CBP) Requirements

### 1.1 Import Documentation Requirements

Every commercial import into the United States requires a standard documentation package. The platform must be able to track, validate, and reference these documents.

| Document | Description | Authority | Required Timing |
|----------|-------------|-----------|-----------------|
| **Bill of Lading (BOL)** | Contract between shipper and carrier; receipt of cargo. Ocean BOL (negotiable) or Sea Waybill (non-negotiable). | 19 CFR 4.7 | Before vessel arrival |
| **Commercial Invoice** | Seller's invoice showing buyer, seller, description, quantity, value, country of origin, HTS classification | 19 CFR 141.86 | At time of entry |
| **Packing List** | Itemized list of contents per package/container with weights and dimensions | 19 CFR 141.86 | At time of entry |
| **ISF/10+2** | Importer Security Filing (see 1.2 below) | 19 CFR Part 149 | 24 hours before vessel loading |
| **Entry Summary (CBP Form 7501)** | Formal declaration of goods for duty assessment | 19 CFR Part 142 | Within 10 working days of entry |
| **Customs Bond** | Financial guarantee for duties, taxes, and fees (see 1.3) | 19 CFR Part 113 | Before entry filing |
| **Arrival Certification** | Carrier's notice of arrival at first US port | 19 CFR 4.2 | Upon vessel arrival |
| **Certificate of Origin** | Verifies country of manufacture (required for preferential duty rates) | Various FTA rules | At time of entry |

**Penalty for Missing/Inaccurate Documentation:**
- Negligent violations: 19 USC 1592(c) -- penalties of 2x the loss of revenue, or 20% of dutiable value if no revenue loss
- Fraudulent violations: 19 USC 1592(b) -- penalties up to 4x the domestic value of the merchandise
- Material omissions on commercial invoice: potential duty reassessment and liquidated damages

**Platform Design Impact:**
- Document checklist engine per shipment type (ocean, air, rail, truck)
- Validation rules for commercial invoice completeness (buyer/seller names, value, HTS, country of origin)
- Document status tracking with deadline alerts
- Template generation for standard forms (7501, commercial invoice)

---

### 1.2 Importer Security Filing (ISF/10+2)

**Authority:** 19 CFR Part 149; CBP Security Filing Requirements (effective January 26, 2010)

The ISF applies to **all ocean shipments** entering the United States. It requires the importer (or their agent) to electronically submit 10 data elements to CBP, and the carrier to submit 2 additional data elements.

#### Importer's 10 Data Elements:
1. Seller (name and address)
2. Buyer (name and address)
3. Importer of Record number (IRS/EIN/CBP assigned)
4. Consignee number
5. Manufacturer/supplier (name and address)
6. Ship-to party (name and address)
7. Country of origin (6-digit HTS)
8. Commodity HTS number (6-digit minimum)
9. Container stuffing location
10. Consolidator (stuffer) name and address

#### Carrier's 2 Data Elements:
1. Vessel stow plan
2. Container status messages

#### Filing Deadlines:
- **24 hours before loading** onto the vessel at the foreign port (not 24 hours before US arrival)
- Amendments allowed up to 24 hours before vessel arrival at first US port
- ISF-5 (simplified): For FROB (Foreign Remaining on Board), IE (Immediate Export), and T&E (Transportation and Exportation) shipments

#### Penalties:
| Violation | Penalty Amount | Authority |
|-----------|---------------|-----------|
| Late ISF filing | Up to **$5,000 per shipment** | 19 CFR 149.5 |
| Inaccurate ISF | Up to **$5,000 per shipment** | 19 CFR 149.5 |
| Failure to file ISF | Up to **$10,000 per shipment** | 19 CFR 149.5 |
| First-time violation (mitigated) | **$1,000 - $2,000** | CBP Mitigation Guidelines |
| C-TPAT members | **50% reduction** on all ISF penalties | CBP C-TPAT Program |
| Repeated/egregious violations | Cargo hold/examination/exclusion | 19 CFR 149.6 |

**Enforcement Trend (2025):** CBP issued over 20,000 ISF penalty notices in fiscal year 2025. Enforcement is automated -- CBP systems flag late and missing ISFs in real time. Ports can issue liquidated damages within 90 days of identifying a violation.

**Platform Design Impact:**
- ISF filing deadline calculator (vessel loading date minus 24 hours)
- ISF data completeness checker (all 10 elements present)
- HTS 6-digit validation for ISF commodity field
- Integration point for ACE (Automated Commercial Environment) ISF transmission
- Alert system for ISF amendment windows (24 hours before arrival)
- C-TPAT status flag to calculate mitigated penalty exposure

---

### 1.3 Customs Bond Requirements

**Authority:** 19 CFR Part 113; 19 USC 1623

A customs bond is a financial guarantee (backed by a surety company) ensuring that all duties, taxes, and fees owed to CBP will be paid, and that all laws and regulations will be followed.

#### Bond Types:

| Bond Type | Code | Use Case | Amount |
|-----------|------|----------|--------|
| **Continuous Transaction Bond** | Activity Code 1 | Importers with regular shipments; covers all ports for 12 months | **$50,000 minimum** or 10% of total duties/taxes/fees paid in prior 12 months, whichever is greater |
| **Single Entry Bond** | Activity Code 1 | One-time or infrequent importers | Typically the value of goods + duties + taxes + fees for that single entry |
| **FTZ Operator Bond** | Activity Code 4 | Operators of FTZ facilities | Minimum $25,000; amount set by port director |
| **Warehouse Bond** | Activity Code 3 | Bonded warehouse operators | Based on estimated duties on stored goods |

#### Bond Amount Calculation (Continuous):
- Rounded up to nearest $10,000 (up to $100,000)
- Above $100,000, rounded up to nearest $100,000
- Annual premium: typically 1-5% of bond amount for low-risk importers; higher for elevated risk

#### 2025 Bond Market Developments:
- Many surety companies have **stopped issuing single transaction bonds** to non-resident importers in China (including Hong Kong/Macau), Vietnam, Thailand, Malaysia, Laos, Indonesia, and Cambodia
- Continuous bonds for these regions now often require **full collateral** or enhanced documentation
- Bond amounts have increased substantially due to elevated tariff rates (reciprocal tariffs driving higher duty exposure)

**Platform Design Impact:**
- Bond sufficiency calculator: compare current bond amount vs. projected 12-month duty exposure
- Bond renewal reminders (annual cycle)
- Alert when projected duties approach bond ceiling
- Flag shipments from countries with bond availability restrictions
- Integration with surety company APIs for bond status verification

---

### 1.4 Entry Types and Processes

**Authority:** 19 CFR Part 141, 142, 143; ACE Business Rules

| Entry Type | Code | Description | Bond Required | Key Use |
|------------|------|-------------|---------------|---------|
| **Consumption** | 01 | Standard import for domestic use | Yes | Most commercial imports |
| **Consumption - FTZ** | 06 | Goods entering from FTZ for consumption | Yes | FTZ withdrawals |
| **Consumption - AD/CVD** | 03 | Subject to antidumping/countervailing duties | Yes | Dumping-affected goods |
| **Consumption - AD/CVD + Quota** | 07 | AD/CVD with quota/visa combination | Yes | Quota-restricted AD/CVD goods |
| **Duty Deferral** | 08 | Deferred duty programs | Yes | Special programs |
| **Informal** | 11 | Value under $2,500 (most goods) | No | Low-value shipments |
| **Informal - Quota** | 12 | Low-value with quota/visa | No | Quota-restricted low-value |
| **Warehouse** | 21 | Placed in bonded warehouse; duties deferred | Yes | Duty deferral strategy |
| **Re-Warehouse** | 22 | Transfer between bonded warehouses | Yes | Warehouse-to-warehouse moves |
| **TIB (Temporary Import Bond)** | 23 | Temporary importation under bond | Yes | Goods to be re-exported |
| **Warehouse Withdrawal - Consumption** | 31 | Removing goods from warehouse for US sale | Yes | Duty payment triggered |
| **Warehouse Withdrawal - Quota** | 32 | Warehouse withdrawal of quota goods | Yes | Quota-restricted withdrawals |
| **Warehouse Withdrawal - AD/CVD** | 34 | Warehouse withdrawal of AD/CVD goods | Yes | Special duty calculation |
| **Warehouse Withdrawal - AD/CVD + Quota** | 38 | Combined AD/CVD and quota withdrawal | Yes | Complex duty scenarios |
| **Drawback** | 47 | Refund claim on previously paid duties | Varies | Re-exported goods |
| **Government - Dutiable** | 52 | US government imports subject to duty | Special | Government procurement |

#### Entry Process Timeline:
1. **Pre-arrival:** ISF filed (24h before loading); carrier files manifest
2. **Arrival:** Goods arrive at port; CBP receives manifest
3. **Entry:** Importer (or broker) files entry documents within **15 calendar days** of arrival
4. **Examination:** CBP may examine cargo (VACIS scan, intensive exam, or tailgate exam)
5. **Release:** CBP releases cargo (typically 1-5 days)
6. **Entry Summary:** Filed within **10 working days** of entry; duties deposited
7. **Liquidation:** CBP finalizes duty assessment (typically 314 days after entry; can take up to 4 years)

**Platform Design Impact:**
- Entry type recommendation engine based on goods, origin, intent (consumption vs. re-export vs. warehouse)
- Timeline tracker per entry (15-day entry window, 10-day summary window, liquidation status)
- Duty deposit calculator at entry summary stage
- AD/CVD flag system that auto-detects scope products

---

### 1.5 Merchandise Processing Fee (MPF) and Harbor Maintenance Fee (HMF)

**Authority:** 19 USC 58c (MPF); 26 USC 4461 (HMF)

#### MPF (Merchandise Processing Fee) -- FY2026 Rates:

| Entry Type | Rate | Minimum | Maximum | Surcharge |
|------------|------|---------|---------|-----------|
| **Formal entry** | **0.3464%** of entered value | **$33.58** | **$651.50** | +$4.03 if filed manually |
| **Informal entry** | Flat fee per shipment | $2.69 / $8.06 / $12.09 (varies by type) | -- | -- |

- MPF is assessed per **entry**, not per shipment or container
- Applies to all goods regardless of duty status (even duty-free goods)
- FTZ weekly entries: one MPF per weekly entry summary

#### HMF (Harbor Maintenance Fee):

| Rate | Minimum | Maximum | Applies To |
|------|---------|---------|------------|
| **0.125%** of cargo value | None | None (no cap) | All imports arriving by **ocean vessel** at US seaports |

- HMF does **not** apply to air freight, inland shipments, or FTZ-to-FTZ transfers
- HMF does **not** apply to exports (per 1998 USSC ruling in *United States v. U.S. Shoe Corp.*)
- FTZ benefit: HMF is assessed on the value at time of FTZ withdrawal, not admission value

**Platform Design Impact:**
- MPF calculator per entry (0.3464% with floor/ceiling)
- HMF calculator for ocean shipments (0.125% of value, no cap)
- Total landed cost computation must include MPF + HMF
- FTZ scenario modeler should factor in HMF timing advantages

---

## 2. Foreign Trade Zone (FTZ) Regulations

### 2.1 Governing Law and Regulations

| Authority | Scope |
|-----------|-------|
| **FTZ Act (19 USC 81a-81u)** | Establishes the legal framework for FTZs; administered by the Foreign-Trade Zones Board (Dept. of Commerce) |
| **15 CFR Part 400** | FTZ Board regulations: zone establishment, activation, operations, production authority |
| **19 CFR Part 146** | CBP regulations: admission, status, manipulation, manufacture, entry procedures in zones |
| **19 USC 81c** | Defines permissible activities in FTZs (storage, handling, manufacturing, exhibition, etc.) |

### 2.2 Privileged Foreign (PF) vs. Non-Privileged Foreign (NPF) Status

This distinction is **critical** to the platform's FTZ strategy engine.

#### Privileged Foreign (PF) Status -- 19 CFR 146.41:

| Attribute | Detail |
|-----------|--------|
| **Definition** | Tariff classification and value are **locked in** at the time of admission to the zone |
| **When to elect** | Before any manipulation or manufacturing that would change the HTS classification |
| **Application** | Filed with the CBP port director |
| **Key benefit** | Protects against future tariff increases; rate is fixed at admission date |
| **Key risk** | Cannot benefit from future tariff decreases; classification is permanent |
| **Cannot be abandoned** | Once granted, PF status cannot be revoked while goods remain in the zone |
| **AD/CVD goods** | Goods subject to AD/CVD orders **must** be placed in PF status upon admission (19 CFR 146.41) |

#### Non-Privileged Foreign (NPF) Status -- 19 CFR 146.42:

| Attribute | Detail |
|-----------|--------|
| **Definition** | Tariff classification and value are determined **at time of withdrawal** from the zone |
| **Key benefit** | If manufacturing in the zone changes the HTS to a lower-duty classification, the lower rate applies |
| **Inverted tariff** | The "inverted tariff" benefit -- finished goods may have a lower duty rate than raw materials |
| **Key risk** | Exposed to tariff increases while goods are in the zone |
| **Manufacturing required** | To realize tariff shift benefits, substantial transformation must occur in the zone |

#### Decision Matrix for the Platform:

| Scenario | Recommended Status | Rationale |
|----------|--------------------|-----------|
| Tariffs expected to increase | PF | Lock in current lower rate |
| Tariffs expected to decrease | NPF | Benefit from lower rate at withdrawal |
| AD/CVD goods | PF (mandatory) | Legal requirement |
| Manufacturing will shift HTS to lower-duty classification | NPF | Inverted tariff benefit |
| Storage only (no manufacturing) | Either | No classification change; PF if tariff volatility is high |
| Reciprocal tariff goods (post-April 2025) | PF (mandatory) | See Section 2.3 |

### 2.3 April 2025 Executive Order: Reciprocal Tariffs and FTZ Status

**Authority:** Executive Order of April 2, 2025 -- "Regulating Imports with a Reciprocal Tariff to Rectify Trade Practices"

This executive order **fundamentally changed** FTZ strategy for goods subject to reciprocal tariffs.

#### Key Provisions:

1. **Mandatory PF Status:** All articles covered by reciprocal tariffs and admitted to FTZs **on or after April 9, 2025** must be placed in **Privileged Foreign (PF) status** at time of admission.

2. **No Inverted Tariff Benefit:** Because PF status locks in the tariff at admission, goods can no longer be manufactured in an FTZ to achieve a lower finished-goods classification under reciprocal tariffs. The tariff rate on the **input material** is what applies, regardless of what is produced.

3. **Effective Dates:**
   - 10% baseline reciprocal tariff: April 5, 2025, 12:01 AM EDT
   - Country-specific higher rates: April 9, 2025, 12:01 AM EDT

4. **Impact on FTZ Value Proposition:** For goods subject to reciprocal tariffs, FTZs can still provide:
   - Duty deferral (delay payment until withdrawal)
   - Weekly entry filing (reduced MPF per filing)
   - Re-export without duty payment
   - But **NOT** inverted tariff manufacturing benefits

#### Current Country-Specific Reciprocal Tariff Rates (as of October 2025 Kuala Lumpur Summit agreements):

| Country | Reciprocal Rate | Notes |
|---------|----------------|-------|
| **Vietnam** | 20% | Framework agreement at Kuala Lumpur Summit |
| **Thailand** | 19% | Framework agreement; Annex III goods at 0% |
| **Indonesia** | 19% | Framework agreement |
| **Cambodia** | 19% | Agreed to eliminate tariffs on US goods |
| **Malaysia** | 19% | Agreed to reduce tariffs on some US goods |
| **China** | 145% (combined) | Includes Section 301 + IEEPA + reciprocal layers |
| **Singapore** | 10% | Baseline rate only |
| **Laos** | 40% | No trade agreement reduction |
| **Myanmar** | 40% | No trade agreement reduction |

**Platform Design Impact:**
- FTZ admission date tracker (pre- vs. post-April 9, 2025)
- Automatic PF status flag for reciprocal tariff goods
- FTZ benefit calculator must distinguish: (a) duty deferral value, (b) inverted tariff value (now lost for reciprocal goods), (c) re-export savings, (d) weekly entry MPF savings
- Historical rate lookup to compare PF lock-in rate vs. current rate at time of withdrawal
- Scenario modeler: "What if I had admitted on date X vs. date Y?"

### 2.4 Zone-to-Zone Transfers

**Authority:** 19 CFR 146.68

- Merchandise may be transferred from one FTZ (or subzone) to another without entry into US customs territory
- **No duty is paid** during zone-to-zone transfers
- Transfers must be authorized by CBP and documented with proper manifests
- Status (PF or NPF) carries over during transfer
- In-bond movement under CBP supervision required

### 2.5 Reporting Requirements

#### FTZ Board Annual Report:

| Requirement | Detail |
|-------------|--------|
| **Who files** | Zone grantee (typically a port authority or economic development agency) |
| **Frequency** | Annually |
| **Authority** | 15 CFR 400.44; 19 USC 81p |
| **Contents** | Zone activity, merchandise received/shipped, value, employment, manufacturing activity, revenue impact |
| **Deadline** | Typically within 90 days of zone fiscal year end |

#### CBP Weekly Entry Summary:

| Requirement | Detail |
|-------------|--------|
| **Who files** | FTZ operator or their customs broker |
| **Frequency** | Weekly |
| **Authority** | 19 CFR 146.63(c) |
| **Process** | Operator files estimated entry for upcoming 7-day period; then files reconciled entry summary for prior 7-day period |
| **Benefit** | Consolidates multiple withdrawals into single entry = single MPF (max $651.50) vs. per-shipment MPF |
| **Duty payment** | Duties deposited with weekly summary via ACE |
| **Filing method** | Must use electronic data interchange (ABI/ACE) approved by CBP |

### 2.6 FTZ Operator vs. User Obligations

| Obligation | Operator | User |
|------------|----------|------|
| **Activation bond** | Must execute Operator's Bond (Activity Code 4, min $25,000) with CBP | May post own bond to assume inventory control responsibility |
| **Inventory control** | Responsible to CBP for all zone inventory unless user posts own bond | Responsible if operating under own bond |
| **Admission/withdrawal records** | Must maintain for 5 years | Must provide to operator |
| **CBP access** | Must allow CBP access to zone at all times | Must comply with CBP examinations |
| **Zone security** | Physical security of the zone perimeter | Security of user's area within the zone |
| **Annual report data** | Must compile and submit to grantee | Must provide activity data to operator |
| **ACE filing** | Must file or authorize broker to file through ACE/ABI | May authorize own broker |
| **Manufacturing authorization** | Must ensure FTZ Board production authority exists | Must apply for production authority if needed (15 CFR 400.22) |

**Penalty for Non-Compliance:**
- CBP may revoke zone activation
- Liquidated damages against the operator's bond
- FTZ Board may revoke zone/subzone grant (15 CFR 400.38)
- Criminal penalties for fraud or smuggling (18 USC 542, 545)

---

## 3. Uyghur Forced Labor Prevention Act (UFLPA)

### 3.1 Overview

**Authority:** Uyghur Forced Labor Prevention Act (Pub. L. 117-78, enacted December 23, 2021; enforcement began June 21, 2022)

The UFLPA establishes a **rebuttable presumption** that goods mined, produced, or manufactured wholly or in part in the Xinjiang Uyghur Autonomous Region (XUAR) of China, or by entities on the UFLPA Entity List, are made with forced labor and are **prohibited from importation** under Section 307 of the Tariff Act of 1930 (19 USC 1307).

### 3.2 Compliance Requirements for SE Asia Sourcing

This is **critical** for the platform's SE Asia focus. Although UFLPA targets Xinjiang/China, SE Asian supply chains are heavily implicated because:

1. **Transshipment risk:** Chinese goods are routed through Vietnam, Thailand, Cambodia, Malaysia, and Indonesia to obscure Xinjiang origin
2. **Input materials:** SE Asian manufacturers may use raw materials (cotton, polysilicon, tomato products, PVC, aluminum) sourced from Xinjiang
3. **CBP targeting:** CBP is actively examining SE Asian shipments for Xinjiang-origin inputs

#### Supply Chain Due Diligence Requirements:

| Requirement | Detail | Authority |
|-------------|--------|-----------|
| **Supply chain mapping** | Complete mapping from raw material to finished good, identifying every entity in the chain | UFLPA Strategy, Section 2 |
| **Supplier audits** | Third-party audits of suppliers to verify non-Xinjiang origin | DHS FLETF Guidance |
| **Worker documentation** | Complete list of all workers at entities subject to the presumption; proof workers are voluntary and not subjected to forced labor | CBP UFLPA FAQ |
| **Origin documentation** | Bills of material, purchase orders, shipping records, certificates of origin tracing materials to non-Xinjiang sources | CBP Operational Guidance |
| **Due diligence program** | Written supply chain due diligence policy, training, risk assessment, and remediation procedures | UFLPA Strategy |
| **Ongoing monitoring** | Continuous monitoring of supply chain changes, new Entity List additions, and sector-specific enforcement priorities | DHS Updates |

### 3.3 UFLPA Entity List

- **Current count:** 144 entities as of 2025
- **2025 high-priority sector expansion:** Five new sectors -- caustic soda, copper, jujubes (red dates), lithium, and steel
- **Previously designated sectors:** Apparel, cotton, tomatoes, PVC, seafood, silica-based products, aluminum
- Entity List: https://www.dhs.gov/uflpa-entity-list

### 3.4 Documentation Needed to Rebut the Presumption

| Document Category | Examples |
|-------------------|----------|
| **Supply chain map** | Visual diagram of full supply chain from raw material to export |
| **Purchase orders & invoices** | From every tier of the supply chain |
| **Bills of material** | Showing all inputs and their origins |
| **Shipping records** | BOLs, packing lists for all intermediate shipments |
| **Certificates of origin** | From each manufacturing/processing country |
| **Factory audit reports** | Independent third-party social compliance audits |
| **Worker records** | Employment contracts, payroll, voluntary labor documentation |
| **Production records** | Batch/lot traceability linking finished goods to source materials |
| **Testing/DNA analysis** | For cotton products, isotopic/DNA testing proving non-Xinjiang origin |

### 3.5 Penalties for Non-Compliance

| Action | Consequence |
|--------|-------------|
| **Detention** | Goods held at port; 30 days to rebut presumption |
| **Exclusion** | Goods denied entry; export or destroy within 90 days |
| **Seizure** | For repeated violations or knowing importation |
| **Criminal prosecution** | 18 USC 545; up to **20 years imprisonment** |

**Enforcement Statistics (2025):**
- **6,636 shipments detained** in first half of 2025 (surpassing 4,619 for all of 2024)
- Over **17,000 shipments inspected** since 2022; **10,000+ denied entry**
- Total examined value: **$3.7 billion**

---

## 4. Tariff & Trade Policy

### 4.1 Section 301 Tariffs (China and SE Asia Expansion)

**Authority:** 19 USC 2411; administered by USTR

#### China Section 301 Tariffs (still active):
- List 1: 25% on $34B (industrial machinery, electronics)
- List 2: 25% on $16B (semiconductors, chemicals)
- List 3: 25% on $200B (furniture, auto parts)
- List 4A: 7.5% on $120B (consumer electronics, apparel)
- 2024 Biden revision: EVs 100%, Semiconductors 50%, Solar 50%, Steel/Aluminum 25%

#### March 2026 SE Asia Section 301 Investigations (NEW):
USTR initiated investigations targeting 16 countries including Vietnam, Thailand, Indonesia, Cambodia, Malaysia. Focus: excess capacity and forced labor failures. Comments due April 15, hearing May 5, 2026.

### 4.2 Section 201 Safeguard Tariffs

- Solar panels: **expired February 6, 2026**
- Washing machines: largely expired

### 4.3 Anti-Dumping and Countervailing Duties (ADD/CVD)

**Authority:** 19 USC 1671-1677n

Key active orders affecting SE Asia:
- Solar cells/modules (Cambodia, Malaysia, Thailand, Vietnam): 41%-3,521%
- Shrimp (Vietnam, Thailand, China, India): 0-25%+
- Steel products (various SE Asia): wide range
- CBP enforces via EAPA investigations for circumvention/transshipment

### 4.4 Generalized System of Preferences (GSP)

**GSP expired December 31, 2020. NOT reauthorized as of March 2026.** No unilateral US preferential tariff programs currently benefit SE Asian imports.

### 4.5 RCEP Implications

The US is not an RCEP member. Key concern: "China-washing" -- RCEP certificates of origin may mask Chinese content in SE Asian exports. RCEP origin rules are separate from US customs origin rules.

### 4.6 De Minimis ($800) Threshold

| Date | Change |
|------|--------|
| May 2, 2025 | Eliminated for China/Hong Kong |
| August 29, 2025 | Eliminated for ALL countries (EO 14324) |
| March 1, 2026 | All imports pay full tariff-based rates |

Impact: low-value parcel volume from China fell 54%.

### 4.7 Current Reciprocal Tariff Rates (October 2025)

| Country | Rate |
|---------|------|
| Vietnam | 20% |
| Thailand | 19% |
| Indonesia | 19% |
| Cambodia | 19% |
| Malaysia | 19% |
| China | 145% (combined) |
| Singapore | 10% |
| Laos | 40% |
| Myanmar | 40% |

---

## 5. Cold Chain Specific Regulations

### 5.1 FSMA (Food Safety Modernization Act)

Key rules for importers:
- **FSVP** (21 CFR Part 1 Subpart L): Verify foreign suppliers meet US standards; hazard analysis, supplier evaluation, 2-year record-keeping
- **Sanitary Transportation Rule** (21 CFR Part 1 Subpart O): Temperature control during transport; written shipper-carrier agreements
- **Food Traceability Rule** (21 CFR Part 1 Subpart S): **Effective January 20, 2026**; KDE/CTE tracking for high-risk foods
- Penalties: ~$15K-$75K/violation + criminal (1-3 years)

### 5.2 FDA Prior Notice

| Transport Mode | Notice Before Arrival |
|----------------|-----------------------|
| Ocean | 8 hours |
| Air | 4 hours |
| Rail | 4 hours |
| Road | 2 hours |

2025 amendment effective October 27, 2025: postal shipments must include tracking numbers.

### 5.3 USDA/APHIS Requirements

- Phytosanitary certificates from exporting country's NPPO
- APHIS-approved treatments (cold, heat, fumigation, irradiation)
- Port of entry restrictions for many commodities
- Penalties: up to $250K (individual) / $500K (organization) + 5 years imprisonment

### 5.4 Temperature Monitoring

- Pre-shipment, in-transit, and delivery temperature verification required
- Written shipper-carrier agreements specifying temperature requirements
- All records retained for minimum 2 years
- **January 2026 enhancement:** Node-level tracking at every storage/transfer point

---

## 6. Platform Compliance (For the Software Itself)

### 6.1 Customs Broker Licensing (19 USC 1641)

**The single most important legal distinction for the platform's business model.**

"Customs business" includes preparation of documents for CBP filing and electronic transmission of documents for CBP -- but explicitly **excludes** "mere electronic transmission of data received for transmission to Customs."

#### REQUIRES a license:
- Filing entries with CBP on behalf of importers
- Preparing CBP Form 7501 for others
- Classifying goods for a specific entry filing
- Filing ISF on behalf of importers
- Advising on classification/valuation for specific entries

#### DOES NOT require a license:
- Displaying general tariff rate information
- Tariff calculators with disclaimers
- FTZ benefit analysis/modeling
- Document checklist tools
- Compliance screening (UFLPA, denied party)
- Connecting importers to licensed brokers

**Penalty for unlicensed customs business: $10,000/transaction**

### 6.2 Required Disclaimers

All tariff/duty displays must include disclaimers stating:
- Informational/educational purposes only
- Not customs brokerage services or legal advice
- Actual duties may differ from estimates
- Users responsible for their own compliance
- Platform does not transact customs business under 19 USC 1641

### 6.3 Liability Limitations

Terms of Service must include:
1. Liability cap (amount paid for service)
2. User indemnification for CBP penalties
3. No reliance representation
4. Professional advice disclaimer
5. Data source attribution
6. Force majeure for regulatory changes

### 6.4 Recommended Approach

Operate as **informational/technology platform** with broker marketplace/referral model. Avoid customs brokerage activities.

### 6.5 Data Privacy

| Data Type | Sensitivity | Notes |
|-----------|------------|-------|
| Importer IDs (EIN, bond numbers) | High | Identity fraud risk |
| Entry data (HTS, values) | High | Commercial strategies |
| UFLPA supply chain data | Very High | Could implicate suppliers |
| Tariff engineering strategies | High | Trade secrets |

Requirements: RBAC, encryption (AES-256/TLS 1.3), audit logging, 5-year retention, strict tenant isolation.

---

## 7. Summary: Platform Design Implications Matrix

| Regulatory Area | Must-Have Feature | Priority | Risk If Missing |
|-----------------|-------------------|----------|-----------------|
| **ISF/10+2** | Filing deadline calculator, data completeness checker | **P0** | $5K-$10K/shipment penalties |
| **Customs Bond** | Bond sufficiency calculator, renewal alerts | **P0** | Cannot file entries; cargo holds |
| **Entry Process** | Entry type recommender, timeline tracker | **P0** | Missed deadlines, penalties |
| **MPF/HMF** | Fee calculator in landed cost | **P1** | Inaccurate cost projections |
| **FTZ Status** | PF/NPF recommendation with April 2025 rules | **P0** | Incorrect FTZ strategy |
| **Reciprocal Tariffs** | Country rate lookup, mandatory PF flag | **P0** | Wrong duty calculations |
| **UFLPA** | Entity List screening, supply chain mapping | **P0** | Detention/exclusion; criminal |
| **Section 301** | Tariff layer calculator, investigation monitor | **P0** | Missed tariff obligations |
| **ADD/CVD** | Scope detector, deposit rate calculator | **P0** | Massive underpayment |
| **FSMA/FSVP** | Supplier verification, hazard analysis | **P0** (cold chain) | FDA refusal, import alerts |
| **FDA Prior Notice** | Deadline calculator by transport mode | **P0** (food) | Cargo holds, refusal |
| **USDA/Phyto** | Cert tracker, APHIS treatment lookup | **P0** (perishables) | Destruction; $500K penalties |
| **Temperature** | IoT integration, excursion alerts | **P0** (cold chain) | Safety violations |
| **Broker Licensing** | Informational-only positioning, disclaimers | **P0** (legal) | $10K/transaction penalty |
| **Disclaimers** | Prominent on all tariff/duty displays | **P0** (legal) | Liability exposure |
| **Data Privacy** | RBAC, encryption, audit logging | **P1** | Breach liability |

---

## Appendix: Penalty Quick Reference

| Violation | Maximum Penalty | Authority |
|-----------|----------------|-----------|
| Late/missing ISF | $10,000/shipment | 19 CFR 149.5 |
| Negligent entry | 2x revenue loss or 20% value | 19 USC 1592(c) |
| Fraudulent entry | 4x domestic value | 19 USC 1592(b) |
| Unlicensed customs business | $10,000/transaction | 19 USC 1641(b)(6) |
| UFLPA violation | Detention to 20 years criminal | 19 USC 1307; 18 USC 545 |
| AD/CVD evasion | Full retroactive duties + criminal | 19 USC 1592; EAPA |
| FSMA/FSVP | ~$15K-$75K/violation + criminal | 21 USC 333(f) |
| APHIS violation | $250K/$500K + 5 years | 7 USC 7734 |
| FDA prior notice | Hold, refusal, import alert | 21 USC 381 |
| FTZ non-compliance | Bond forfeiture, zone revocation | 15 CFR 400.38 |

---

## Key Regulatory Sources

| Source | URL |
|--------|-----|
| CBP Trade | https://www.cbp.gov/trade |
| USITC HTS | https://hts.usitc.gov/ |
| Commerce AD/CVD | https://www.trade.gov/us-antidumping-and-countervailing-duties |
| FTZ Board | https://www.trade.gov/ftz-board |
| 19 CFR (eCFR) | https://www.ecfr.gov/current/title-19 |
| DHS UFLPA | https://www.dhs.gov/uflpa |
| USTR Section 301 | https://ustr.gov/issue-areas/enforcement/section-301-investigations |
| FDA FSMA | https://www.fda.gov/food/guidance-regulation-food-and-dietary-supplements/food-safety-modernization-act-fsma |
| APHIS Imports | https://www.aphis.usda.gov/plant-imports |
| 19 USC 1641 | https://www.law.cornell.edu/uscode/text/19/1641 |
| Tax Foundation Tariff Tracker | https://taxfoundation.org/research/all/federal/trump-tariffs-trade-war/ |
| NAFTZ | https://www.naftz.org/ |

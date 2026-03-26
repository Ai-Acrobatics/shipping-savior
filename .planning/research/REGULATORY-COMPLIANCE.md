# US International Shipping: Regulatory & Compliance Research

**Project:** Shipping Savior Platform
**Researched:** 2026-03-26
**Scope:** Complete regulatory compliance mapping — 11 major areas covering import/export operations
**Relevance:** SE Asia consumer goods imports (apparel, CPG) + cold chain exports
**Confidence:** HIGH (government sources, CFR references, 2025-2026 enforcement data verified)
**Disclaimer:** Research for software platform design. Not legal advice. Importers should consult licensed customs brokers and trade attorneys.

---

## Table of Contents

**Import Security & Customs**
1. [UFLPA (Uyghur Forced Labor Prevention Act) Compliance](#1-uflpa-uyghur-forced-labor-prevention-act-compliance)
2. [FDA Import Requirements](#2-fda-import-requirements)
3. [CPSC Requirements for Consumer Products](#3-cpsc-requirements-for-consumer-products)
4. [AES/EEI Filing Requirements for Exports](#4-aeseei-filing-requirements-for-exports)
5. [ISF (Importer Security Filing) — 10+2 Rule](#5-isf-importer-security-filing--102-rule)

**Tariffs & Trade**
6. [Foreign Trade Zone (FTZ) Regulations — 19 CFR 146](#6-foreign-trade-zone-ftz-regulations--19-cfr-146)
7. [Section 301 Tariffs (China Trade War)](#7-section-301-tariffs-china-trade-war)
8. [Section 201 & 232 Tariffs (Steel/Aluminum/Safeguards)](#8-section-201--232-tariffs-steelaluminumsafeguards)
9. [Bonding Requirements](#9-bonding-requirements)

**Records & Data**
10. [Record Retention Requirements (5-Year CBP Rule)](#10-record-retention-requirements-5-year-cbp-rule)
11. [Data Privacy Implications for Trade Data](#11-data-privacy-implications-for-trade-data)

**Reference**
12. [Cross-Reference Matrix](#12-cross-reference-matrix)
13. [Penalty Summary](#13-penalty-summary)
14. [Platform Implementation Priority](#14-platform-implementation-priority)

---

## 1. UFLPA (Uyghur Forced Labor Prevention Act) Compliance

### 1.1 Overview & Legal Basis

The Uyghur Forced Labor Prevention Act (UFLPA) was signed into law on **December 23, 2021** and its rebuttable presumption took effect on **June 21, 2022**. It amends Section 307 of the Tariff Act of 1930 (19 U.S.C. 1307) by establishing that **all goods mined, produced, or manufactured wholly or in part in the Xinjiang Uyghur Autonomous Region (XUAR)** of China, or by any entity on the UFLPA Entity List, are presumed to be made with forced labor and are **prohibited from entry into the United States**.

| Attribute | Detail |
|-----------|--------|
| **Statute** | Uyghur Forced Labor Prevention Act (Pub. L. 117-78) |
| **Underlying Authority** | 19 U.S.C. 1307 (Tariff Act of 1930, Section 307) |
| **Effective Date** | June 21, 2022 (rebuttable presumption) |
| **Administering Agencies** | DHS (lead), CBP (enforcement), DOL, USTR, State, Commerce |
| **Task Force** | Forced Labor Enforcement Task Force (FLETF) |
| **Standard of Proof** | "Clear and convincing evidence" (highest civil standard) |
| **De Minimis Exception** | **None** — applies regardless of shipment value |

### 1.2 Rebuttable Presumption

The core mechanism of UFLPA is a **rebuttable presumption**: all goods from the XUAR or from entities on the UFLPA Entity List are presumed made with forced labor unless the importer can demonstrate otherwise with "clear and convincing evidence." This is the **highest evidentiary standard in civil law** — meaning the claim must be "highly probable," not merely more likely than not.

**What triggers the presumption:**
- Goods mined, produced, or manufactured **wholly or in part** in the XUAR
- Goods produced by any entity on the UFLPA Entity List (regardless of location)
- Goods with **any input** sourced from the XUAR or Entity List entities — even if the finished product is manufactured elsewhere
- No value threshold — **de minimis shipments are NOT exempt**

### 1.3 Entity List (FLETF)

The UFLPA Entity List is maintained by the **Forced Labor Enforcement Task Force (FLETF)**, chaired by DHS. As of the **August 2025 strategy update**, the list includes **144 entities** (up from 66 in early 2024), spanning:

| Sector | Examples |
|--------|----------|
| Agriculture | Cotton producers, tomato processors, red date (jujube) farms |
| Textiles/Apparel | Yarn mills, garment factories, cotton ginners |
| Electronics | Battery manufacturers, semiconductor supply chain |
| Energy/Solar | Polysilicon producers, solar panel supply chain |
| Metals | Aluminum smelters, steel producers, copper processors |
| Chemicals | PVC manufacturers, caustic soda producers |
| Food | Seafood processors, food additive manufacturers |

**High-Priority Sectors for Enforcement (2025 update):**

*Original sectors (2022):* Apparel, cotton and cotton products, silica-based products (including polysilicon), tomatoes and downstream products

*Added 2023-2024:* Aluminum, PVC, seafood

*Added August 2025:* **Caustic soda, copper, lithium, red dates (jujubes), steel**

The Entity List is published at [dhs.gov/uflpa-entity-list](https://www.dhs.gov/uflpa-entity-list) and is updated periodically. Entities can be added via Federal Register notice.

### 1.4 Due Diligence Requirements for Importers

CBP's Operational Guidance for Importers (published June 13, 2022, updated subsequently) outlines the due diligence framework:

**Minimum Due Diligence Measures:**

1. **Supply Chain Mapping** — Map every tier of the supply chain from raw material to finished product. Identify all entities involved (suppliers, sub-suppliers, processors, manufacturers).

2. **Entity List Screening** — Screen all supply chain participants against the UFLPA Entity List, with ongoing monitoring for additions.

3. **Supplier Agreements** — Contractual provisions requiring suppliers to:
   - Disclose all sub-tier suppliers
   - Certify no use of forced labor
   - Permit audits and inspections
   - Cooperate with supply chain tracing

4. **Risk Assessments** — Evaluate exposure to XUAR-connected inputs, especially for high-priority sector commodities.

5. **Auditing Program** — Regular on-site or third-party audits of suppliers, particularly Tier 2+ suppliers where visibility is limited.

6. **Training** — Internal training for procurement, compliance, and sourcing teams on UFLPA requirements.

### 1.5 Supply Chain Mapping & Tracing Requirements

CBP requires **multi-tier supply chain tracing documentation** — a complete "paper trail" linking the finished product back to raw materials. This includes:

**Required Documentation by Tier:**

| Tier | Documentation Required |
|------|----------------------|
| **Raw Material** | Certificates of origin, harvest/extraction records, geographic sourcing data |
| **Processing** | Production records, material balance reports (inputs vs. outputs), batch/lot tracing |
| **Manufacturing** | Bills of material, production orders, quality control records |
| **Logistics** | Bills of lading, shipping manifests, customs declarations at each transit point |
| **Financial** | Purchase orders, invoices, payment records, bank transfers linking buyer to supplier at each tier |

**Sector-Specific Requirements:**

- **Cotton/Textiles:** Isotopic testing or DNA tracing to verify cotton origin; fiber analysis; ginning and spinning records; chain of custody from field to garment
- **Tomatoes:** Field-to-can traceability; harvest records; processing facility documentation
- **Polysilicon:** Quartz mine origin verification; smelting/refining records; wafer production chain of custody

### 1.6 Documentation to Overcome the Presumption

To obtain an **exception** to the rebuttable presumption, an importer must submit to CBP:

1. **Supply chain tracing documentation** — Complete chain of custody from raw material through every processing step to finished product
2. **Evidence of due diligence** — Proof that the importer conducted the due diligence described in Section 1.4
3. **Evidence of compliance with the FLETF Strategy** — Demonstration that the importer's compliance program aligns with the FLETF guidance
4. **Worker treatment evidence** — Documentation showing workers were not subjected to forced labor conditions (recruitment practices, wage records, freedom of movement documentation)

**Key evidentiary documents include:**
- Origin certificates for all raw materials
- Supplier attestations/declarations (signed, under penalty of perjury)
- Third-party audit reports
- Isotopic/DNA testing results (cotton)
- Factory production records and material balance sheets
- Payment records proving commercial transactions at each tier
- Bills of lading and logistics manifests
- Worker interview reports (from credible third-party auditors)

### 1.7 CBP Detention, Exclusion, and Seizure Process

**Step-by-step enforcement flow:**

```
Shipment arrives at US port
        |
CBP automated targeting system flags shipment
        |
DETENTION (19 CFR 151.16)
Importer notified — 30 days to respond
        |
    Option A: Prove goods outside scope of UFLPA
    (no connection to XUAR or Entity List)
        |
    Option B: Request exception to presumption
    (submit clear and convincing evidence)
        |
    Option C: Export the goods (at importer's expense)
        |
    Option D: No response / insufficient evidence
        |
EXCLUSION — goods barred from entry
        |
    Importer may still request exception
    post-exclusion
        |
    If goods not exported within prescribed period:
        |
SEIZURE — government takes possession
        |
    Goods may be destroyed if not exported
```

**Timeline Details:**

| Stage | Timeframe |
|-------|-----------|
| Detention notice issued | Upon CBP flagging |
| Importer response deadline | **30 days** from detention notice |
| Extension request | Up to **90 days** (must be approved by CBP) |
| CBP admissibility decision | Should be made within the detention period |
| If no timely decision | Goods are **automatically excluded** |
| Post-exclusion exception request | Permitted (additional administrative process) |
| Storage costs | **Importer's responsibility** throughout |

### 1.8 Penalties for Non-Compliance

| Penalty Type | Detail |
|-------------|--------|
| **Detention** | Goods held at port; importer bears storage costs ($50-200+/day depending on port) |
| **Exclusion** | Goods permanently barred from entry; must be exported or destroyed |
| **Seizure** | Government takes possession; goods may be destroyed |
| **Monetary Penalties** | Under 19 U.S.C. 1592 (fraud/negligence): up to **domestic value of goods** for fraud; lower amounts for negligence |
| **Criminal Penalties** | Under 18 U.S.C. 1589-1592 (forced labor trafficking): up to **20 years imprisonment** and significant fines |
| **Loss of Import Privileges** | CBP can revoke or restrict future importing authority |
| **Reputational Damage** | CBP publishes enforcement statistics; media and NGO scrutiny |
| **Liquidated Damages** | Potential bond forfeiture |

**Enforcement Statistics (as of mid-2025):**
- **16,755 shipments** detained since June 2022, valued at **$3.69 billion**
- **10,274 shipments denied entry**; 5,783 released after review
- FY2025: ~7,325 shipments stopped (50%+ increase over FY2024)
- Only **~6.5% of FY2025 detentions** ultimately released into US commerce
- Shipments from China: **77% denial rate** in 2025 (up from ~60% in 2024)
- First half of 2025: 6,636 shipments detained (vs. 4,619 in all of 2024)
- 82.8% of H1 2025 detentions involved goods from China

### 1.9 SE Asia Sourcing: Critical UFLPA Risk (Cotton/Textiles)

**This is directly relevant to the platform's SE Asia import strategy (apparel, CPG).**

**The Transshipment Problem:**

China (particularly Xinjiang) produces approximately 85% of China's cotton and ~20% of the world's cotton supply. A significant volume of Xinjiang cotton enters global supply chains through transshipment — raw cotton or intermediate products (yarn, fabric) are exported from China to manufacturing countries in SE Asia before being assembled into finished goods and shipped to the US.

**High-Risk Countries for Cotton Transshipment:**

| Country | Risk Profile |
|---------|-------------|
| **Vietnam** | Highest UFLPA enforcement value — **$560M in shipments** reviewed (Oct 2023-Aug 2025). Heavy dependence on Chinese raw materials for textiles. Reports of "cotton laundering." |
| **Cambodia** | Significant garment export sector using Chinese-sourced fabric and yarn |
| **Bangladesh** | Major garment producer importing Chinese cotton/yarn |
| **Indonesia** | Growing textile sector with Chinese material inputs |
| **Thailand** | Mixed manufacturing base with Chinese supply chain exposure |
| **Malaysia** | Most common source of UFLPA detentions by country |

**Why SE Asia Sourcing Requires UFLPA Compliance:**
- A finished garment made in Vietnam using Chinese cotton from Xinjiang is **within scope** of UFLPA
- CBP looks at the **entire supply chain**, not just the country of final assembly
- "Made in Vietnam" labels do NOT insulate goods from UFLPA enforcement
- CBP has specifically flagged transshipment through SE Asia as an enforcement priority

**Compliance Approach for SE Asia Sourcing:**
1. Require cotton origin certificates from Tier 2/3 textile suppliers
2. Consider isotopic testing or DNA-based fiber tracing for cotton verification
3. Map supply chain to raw material level — especially cotton, polyester (may contain PVC), and any chemical inputs
4. Avoid suppliers who cannot provide multi-tier tracing documentation
5. Use third-party audit firms with forced labor expertise
6. Monitor the UFLPA Entity List for additions in your supply chain

### 1.10 Implementation Notes for Compliance Tracking Platform

**Data model requirements:**
- Entity List database (144+ entities, updated as FLETF publishes changes)
- Supply chain mapping with multi-tier supplier relationships
- Document storage for compliance evidence (origin certs, audit reports, BOLs, invoices)
- Screening engine to match suppliers against Entity List
- Risk scoring by product category and country of origin
- Detention/exclusion tracking with timeline management

**Key features to build:**
- **Entity List Screening:** Real-time screening of supplier names against UFLPA Entity List with fuzzy matching
- **Supply Chain Mapper:** Visual multi-tier supply chain diagram with entity connections
- **Document Vault:** Organized storage of compliance evidence indexed by supplier, product, and shipment
- **Risk Dashboard:** Heat map of supply chain exposure by sector, country, and entity proximity
- **Detention Response Workflow:** 30-day countdown timer, document checklist, CBP response templates
- **Audit Trail:** Timestamped log of all compliance actions for CBP review

**Data sources:**
- UFLPA Entity List: [dhs.gov/uflpa-entity-list](https://www.dhs.gov/uflpa-entity-list) (scrape/monitor for updates)
- CBP UFLPA statistics: [cbp.gov/newsroom/stats/trade/uyghur-forced-labor-prevention-act-statistics](https://www.cbp.gov/newsroom/stats/trade/uyghur-forced-labor-prevention-act-statistics)
- High-priority sector guidance: DHS UFLPA Strategy documents

---

## 2. FDA Import Requirements

### 2.1 Overview

The FDA regulates the import of food (including dietary supplements), drugs, medical devices, cosmetics, tobacco, and radiation-emitting products. For the shipping platform's SE Asia import strategy (consumer goods), the primary FDA touchpoints are **food/dietary supplements** and **cosmetics**.

| Category | Primary Regulation | Key Requirements |
|----------|-------------------|-----------------|
| Food (human & animal) | FSMA (2011), 21 CFR Parts 1, 11, 16, 111, 117, 507 | Prior Notice, Food Facility Registration, FSVP, Preventive Controls |
| Dietary Supplements | DSHEA (1994), 21 CFR Parts 101, 111, 190 | NDI Notification, GMP, Labeling, FSVP |
| Cosmetics | MoCRA (2022), FD&C Act 601-631 | Facility Registration, Product Listing, Adverse Event Reporting |

### 2.2 Prior Notice Requirements (Food & Dietary Supplements)

**Legal Basis:** 21 CFR Part 1, Subpart I (Sections 1.276-1.285); Section 801(m) of the FD&C Act

All food (including dietary supplements, animal feed, and pet food) imported into the US requires **Prior Notice** to FDA before arrival.

**Filing Timeframes:**

| Transport Mode | Minimum Filing Time Before Arrival | Maximum Advance Filing |
|---------------|-----------------------------------|----------------------|
| **Water (vessel)** | **8 hours** before arrival at port of entry | 30 days (via ABI/ACE/ITDS) or 15 days (via FDA PNSI) |
| **Air** | **4 hours** before arrival | 30 days (ABI) or 15 days (PNSI) |
| **Land (truck)** | **2 hours** before arrival at port of entry | 30 days (ABI) or 15 days (PNSI) |
| **Land (rail)** | **4 hours** before arrival | 30 days (ABI) or 15 days (PNSI) |
| **International mail** | Before arrival (effective Oct 1, 2026: must include mail tracking number) |

**Required Information in Prior Notice:**
- Name and registration number of the manufacturer
- Name and registration number of the shipper
- Country of production/growing
- Country from which the article is shipped
- Anticipated arrival information (port, date, time)
- Name of importer, owner, or consignee
- Carrier and mode of transport
- FDA product code
- Common/usual name and quantity
- Lot/batch code (if applicable)

**Filing Methods:**
1. **ABI/ACE/ITDS** — Automated Broker Interface through CBP's Automated Commercial Environment (most common for commercial shipments)
2. **FDA PNSI** — FDA Prior Notice System Interface (web-based, for smaller operations)

**Penalties for Non-Compliance:**
- Food arriving without adequate Prior Notice is subject to **refusal of admission**
- The article will be held at the port of entry
- FDA may order the food to be held or destroyed
- Repeat violations may result in increased scrutiny of future shipments

### 2.3 Food Facility Registration (FSMA)

**Legal Basis:** Section 415 of the FD&C Act; 21 CFR Part 1, Subpart H

**All domestic and foreign facilities** that manufacture, process, pack, or hold food for consumption in the US must register with FDA.

**Key Requirements:**
- **Initial registration** required before beginning operations
- **Biennial renewal** during October 1-December 31 of each even-numbered year (next: Oct-Dec 2026)
- Foreign facilities must designate a **US Agent** (individual or firm in the US)
- Registration must include an **assurance that FDA will be permitted to inspect** the facility
- FDA assigns a unique **Food Facility Registration (FFR) number**
- Importers must reference their supplier's FFR when filing Prior Notices

**Registration is NOT required for:**
- Farms (primary production)
- Retail food establishments
- Restaurants
- Fishing vessels (that do not process)
- Non-profit food establishments

**Consequences of Non-Registration:**
- Food from unregistered facilities is subject to refusal of admission under Section 801 of the FD&C Act
- FDA can issue an Import Alert, placing all products from the facility on DWPE

### 2.4 FSVP — Foreign Supplier Verification Program

**Legal Basis:** 21 CFR Part 1, Subpart L (Sections 1.500-1.514)

The FSVP rule is the **cornerstone FDA requirement for food importers**. It requires importers to verify that their foreign suppliers produce food meeting US safety standards.

**Who Must Comply:**
- Every importer of food for human or animal consumption
- "Importer" = the US owner or consignee of the food at time of entry, OR the US agent/representative of the foreign owner/consignee
- Identified by the **Unique Facility Identifier (UFI)** — specifically a **DUNS number** — which must be provided in CBP's ACE system for every line entry of food

**Core FSVP Requirements (21 CFR 1.502-1.510):**

1. **Hazard Analysis (21 CFR 1.504):** Identify known or reasonably foreseeable biological, chemical (including radiological), and physical hazards for each food imported

2. **Evaluation of Risk & Supplier Performance (21 CFR 1.505):** Consider:
   - Hazard analysis results
   - Entity that will be applying preventive controls
   - Foreign supplier's procedures, processes, and practices
   - Applicable FDA food safety regulations
   - Foreign supplier's compliance history
   - Results of testing and other verification activities

3. **Supplier Approval (21 CFR 1.506):** Approve foreign suppliers based on evaluation. Must have written procedures for supplier approval.

4. **Verification Activities (21 CFR 1.506):** Based on risk evaluation, conduct one or more:
   - **Onsite audits** of the foreign supplier
   - **Sampling and testing** of the food
   - **Review of supplier's food safety records**
   - **Other appropriate verification activities**

5. **Corrective Actions (21 CFR 1.508):** Take prompt action when verification reveals issues. May include discontinuing use of supplier.

6. **Reassessment (21 CFR 1.505(c)):** Reassess FSVP at least every **3 years** or when new information becomes available about potential hazards.

**Modified Requirements for Very Small Importers (21 CFR 1.512):**
- Annual sales < $1M (adjusted for inflation)
- May use modified verification approach (written assurances from supplier + additional measures as appropriate)

**Recordkeeping Requirements:**
- All FSVP records must be maintained for at least **2 years**
- Records must be made available to FDA within **24 hours** of request
- May be original records, photocopies, scanned copies, or electronic records
- Must be signed and dated upon initial completion and any modification

### 2.5 Cosmetics Import Requirements (MoCRA)

**Legal Basis:** Modernization of Cosmetics Regulation Act of 2022 (MoCRA), amending FD&C Act Sections 601-631

MoCRA is the most significant expansion of FDA authority over cosmetics since 1938.

**Effective Requirements (as of 2025-2026):**

| Requirement | Effective Date | Detail |
|-------------|---------------|--------|
| **Facility Registration** | July 1, 2024 (enforced) | All domestic and foreign facilities manufacturing/processing cosmetics for US market. Form FDA 5066. Renew every 2 years. |
| **Product Listing** | July 1, 2024 (enforced) | "Responsible person" must list all marketed products. Form FDA 5067. Update annually. Full ingredient list in SPL format. |
| **Adverse Event Reporting** | January 1, 2023 | Serious adverse events must be reported to FDA within **15 business days** |
| **Safety Substantiation** | December 29, 2023 | Responsible person must have adequate evidence of safety |
| **Fragrance Allergen Labeling** | TBD (proposed rule pending) | Will require specific allergen disclosures on labels |
| **Good Manufacturing Practices** | TBD (NPRM delayed to late 2025/2026) | Mandatory GMP regulations anticipated |

**Key Import Implications:**
- Foreign cosmetic facilities exporting to US **must register** with FDA using Cosmetics Direct portal
- Need a **Facility Establishment Identifier (FEI)** before filing
- The **"responsible person"** (manufacturer, packer, or distributor whose name appears on label) handles registration and listing
- Products from unregistered facilities may be subject to detention/refusal

### 2.6 Dietary Supplements — DSHEA Requirements

**Legal Basis:** Dietary Supplement Health and Education Act of 1994 (DSHEA); 21 CFR Parts 101, 111, 190

**Key Import Requirements:**

1. **No Pre-Market Approval Required** — Unlike drugs, dietary supplements do NOT require FDA approval before marketing. However, they must comply with:

2. **New Dietary Ingredient (NDI) Notification (21 CFR 190.6):**
   - Any dietary ingredient **not marketed in the US before October 15, 1994** requires a premarket notification
   - Must be submitted at least **75 days** before introducing the product into interstate commerce
   - Must include basis for concluding the supplement is reasonably expected to be safe

3. **Good Manufacturing Practices (21 CFR Part 111):**
   - All dietary supplements must be manufactured under current GMP
   - Foreign manufacturers must comply
   - FDA may detain supplements (DWPE) if facility inspection reveals GMP non-compliance

4. **Labeling Requirements (21 CFR 101.36, 101.93):**
   - **Supplement Facts panel** (distinct from Nutrition Facts) — 21 CFR 101.36
   - Statement of identity ("dietary supplement" or specific type)
   - Net quantity of contents
   - Name and place of business of manufacturer/packer/distributor
   - Complete ingredient list
   - **DSHEA disclaimer** for structure/function claims: *"This statement has not been evaluated by the Food and Drug Administration. This product is not intended to diagnose, treat, cure, or prevent any disease."*
   - Must notify FDA within **30 days** of first marketing a product with structure/function claims

5. **FSVP Applies** — Dietary supplement importers must maintain FSVP programs (see Section 2.4)

### 2.7 FDA Detention Without Physical Examination (DWPE)

**Legal Basis:** Section 801(a) of the FD&C Act

DWPE is FDA's primary enforcement mechanism for imports. It allows FDA to refuse admission of products **without physically examining them** when prior evidence indicates likely violations.

**How DWPE Works:**
1. FDA identifies a violation through inspection, testing, or other evidence
2. FDA issues an **Import Alert** listing the product, firm, or country
3. Future shipments matching the Import Alert criteria are automatically detained
4. The burden shifts to the **importer** to demonstrate the goods are compliant

**Types of Import Alerts:**

| Alert Type | Scope |
|-----------|-------|
| **Countrywide** | All products of a type from a specific country |
| **Firm-specific** | Products from a named manufacturer |
| **Product-specific** | Specific product types regardless of source |

**How to Get Off an Import Alert:**
- Submit evidence of compliance (test results, corrective action documentation)
- FDA reviews and may remove the firm/product from the alert
- Process can take **months to over a year**

**Common Import Alert Triggers for SE Asia Products:**
- Pesticide residue violations (food)
- Filth/contamination
- Misbranding/mislabeling
- Unapproved food additives or color additives
- GMP violations (dietary supplements)
- Undeclared allergens

### 2.8 Labeling Requirements for Imported Products

**All FDA-regulated imported products** must comply with US labeling requirements at the time of entry:

**Food:**
- Nutrition Facts panel (21 CFR 101.9)
- Ingredient list in descending order of predominance
- Allergen declaration (FALCPA + FASTER Act — includes sesame as of 2023)
- Net weight in both metric and US customary units
- Name and address of manufacturer, packer, or distributor
- Country of origin statement

**Dietary Supplements:**
- Supplement Facts panel (21 CFR 101.36)
- All requirements listed in Section 2.6

**Cosmetics:**
- Ingredient list in descending order of predominance (INCI nomenclature)
- Net quantity
- Name/address of distributor
- Warning statements as required
- Country of origin

**Critical:** Products with non-compliant labeling will be **refused admission** or may be permitted to be relabeled at the port under FDA supervision (at importer's expense).

### 2.9 Country-Specific Import Restrictions

FDA maintains country-specific restrictions, often in the form of Import Alerts:

| Country/Region | Common Restrictions |
|---------------|-------------------|
| **China** | Aquaculture products (antibiotics), honey (adulteration), canned mushrooms, dietary supplements |
| **Vietnam** | Seafood (antibiotics, filth), certain agricultural products |
| **India** | Spices (salmonella, filth), shrimp (antibiotics) |
| **Thailand** | Canned seafood, certain processed foods |
| **Mexico** | Avocados (certain regions), cheese, produce |
| **Multiple SE Asia** | Melamine concerns (historical), pesticide residues |

### 2.10 Filing Requirements with CBP (FDA Message Sets)

FDA-regulated imports are processed through **CBP's Automated Commercial Environment (ACE)** using specific data elements:

**Key Filing Elements:**
- **FDA Product Code** — 7-character code identifying the product type (e.g., "54AAA01" for vitamin supplements)
- **FDA Country Code** — Codes for country of production and country of shipment
- **Prior Notice Confirmation Number** — Required for all food entries
- **Manufacturer/Shipper FFR Number** — From FDA food facility registration
- **Importer DUNS Number** — UFI for FSVP identification
- **FDA Affirmation of Compliance codes** — Required for certain product types

**Product Categories Triggering FDA Review:**
- All food and food ingredients (Product Codes 01-45, 53-54)
- Dietary supplements (Product Codes 54)
- Cosmetics (Product Codes 53)
- Drugs and biologics (Product Codes 55-68)
- Medical devices (Product Codes 70-95)
- Radiation-emitting products (Product Code 92-94)
- Tobacco (Product Code 99)

### 2.11 Implementation Notes for Platform

**Data model requirements:**
- FDA Product Code database (7-character codes with descriptions)
- Food Facility Registration tracking (FFR numbers, expiration dates, renewal reminders)
- Prior Notice filing status tracking
- FSVP program documentation per food/supplier combination
- Import Alert monitoring (by country, firm, product)
- NDI notification tracking for dietary supplements

**Key features to build:**
- **Prior Notice Calculator:** Given transport mode and port, calculate filing deadline (8h/4h/2h before arrival)
- **FDA Product Code Lookup:** Map products to FDA product codes to determine which requirements apply
- **FSVP Tracker:** Manage hazard analyses, supplier evaluations, verification activities, and 3-year reassessment cycles
- **Import Alert Monitor:** Track active import alerts relevant to user's supply chain (countries, products, firms)
- **Labeling Compliance Checklist:** By product category, generate checklist of required label elements
- **Filing Reminder System:** Alert importers of Prior Notice deadlines, facility renewal dates, FSVP reassessment due dates

**Data sources:**
- FDA Import Alerts: [fda.gov/industry/actions-enforcement/import-alerts](https://www.fda.gov/industry/actions-enforcement/import-alerts)
- FDA Product Codes: Available via FDA's import system documentation
- Food Facility Registration: [fda.gov/food/registration-food-facilities](https://www.fda.gov/food/guidance-regulation-food-and-dietary-supplements/registration-food-facilities-and-other-submissions)
- FSVP Guidance: [fda.gov/food/fsma/fsvp](https://www.fda.gov/food/food-safety-modernization-act-fsma/fsma-final-rule-foreign-supplier-verification-programs-fsvp-importers-food-humans-and-animals)

---

## 3. CPSC Requirements for Consumer Products

### 3.1 Overview

The Consumer Product Safety Commission (CPSC) regulates the safety of consumer products imported into the US. For the platform's SE Asia consumer goods import strategy, CPSC requirements are particularly relevant for **apparel, textiles, household goods, and any children's products**.

| Governing Law | Scope |
|--------------|-------|
| Consumer Product Safety Act (CPSA) | General consumer product safety |
| Consumer Product Safety Improvement Act (CPSIA, 2008) | Children's product safety, testing, certification |
| Flammable Fabrics Act (FFA) | Textile and apparel flammability standards |
| Federal Hazardous Substances Act (FHSA) | Hazardous substances in consumer products |

### 3.2 General Certificate of Conformity (GCC)

**Legal Basis:** Section 14(a) of the CPSA; 16 CFR Part 1110

A GCC is required for **general-use consumer products** (not specifically designed for children 12 and under) that are subject to a consumer product safety rule, ban, standard, or regulation.

**Who Must Issue:**
- The **importer** is the certifier for imported products (not the foreign manufacturer)

**Required Content of a GCC:**
1. Identification of the product
2. Citation to each CPSC consumer product safety rule to which the product is being certified
3. Identification of the importer or domestic manufacturer certifying compliance
4. Contact information (name, address, telephone, email) for person maintaining test records
5. Date and place of manufacture
6. Date and place of testing
7. Identification of any third-party laboratory (if applicable)

**Testing:**
- GCC products may be tested by the manufacturer or importer (first-party testing is permitted for non-children's products)
- Testing must be based on a **reasonable testing program** (16 CFR 1110.11)
- Testing results must support the certification

### 3.3 Children's Product Certificate (CPC)

**Legal Basis:** Section 14(a)(2) of the CPSA; CPSIA

A CPC is required for **all children's products** — products designed or intended primarily for children 12 years of age or younger.

**Critical Distinction from GCC:** CPCs require **mandatory third-party testing** by a CPSC-accepted laboratory. First-party testing is NOT sufficient.

**Required Content of a CPC:**
1. Identification of the product
2. Citation to **each CPSC children's product safety rule** to which the product is being certified
3. Identification of the importer or domestic manufacturer
4. Contact information for the person maintaining test records
5. Date and place of manufacture
6. Date and place where product was tested
7. Identification of each **CPSC-accepted third-party testing laboratory** that tested the product

**Applicable Children's Product Safety Rules (common examples):**
- Lead content limits (total lead and lead in surface coatings)
- Phthalate restrictions
- Small parts (choking hazard) — 16 CFR 1501
- Toy safety — ASTM F963
- Children's sleepwear flammability — 16 CFR 1615/1616
- Cribs, play yards, strollers, high chairs, etc. — numerous specific standards
- Tracking labels — permanent distinguishing marks on product and packaging

### 3.4 Third-Party Testing Requirements

**Legal Basis:** CPSIA Section 14(a)(2); 16 CFR Part 1112

**For Children's Products:**
- ALL testing must be conducted by a **CPSC-accepted third-party laboratory**
- Laboratories must be accredited to ISO/IEC 17025
- CPSC maintains a list of accepted labs by test standard
- Testing must be conducted **before** the product is imported or distributed

**For General-Use Products:**
- First-party testing is generally acceptable
- Some specific product categories may require third-party testing

**Periodic Testing:**
- Not every unit needs testing, but testing must be conducted at a frequency sufficient to ensure continued compliance
- Production testing plan should account for material/component changes, new suppliers, and manufacturing process changes

**Cost Consideration:**
- Third-party testing for a typical children's product can cost **$1,000-5,000+** depending on the number of applicable standards
- Must be factored into landed cost calculations

### 3.5 Substantial Product Hazard Reporting (Section 15)

**Legal Basis:** Section 15(b) of the CPSA; 16 CFR Part 1115

**Who Must Report:**
Every manufacturer (including importer), distributor, or retailer who obtains information that reasonably supports the conclusion that a product:
1. Fails to comply with an applicable consumer product safety rule or voluntary standard
2. Contains a defect that could create a **substantial product hazard**
3. Creates an **unreasonable risk of serious injury or death**

**Reporting Timeline:**
- Must report to CPSC within **24 hours** of obtaining reportable information
- If uncertain whether information is reportable, the company may investigate for up to **10 working days** (longer if demonstrably reasonable)
- Reports filed via [saferproducts.gov](https://www.saferproducts.gov) or directly to CPSC's Office of Compliance

**What CPSC Considers a "Defect":**
- Manufacturing defects
- Design defects
- Failures or inadequacies in packaging
- Failures or inadequacies in warnings/instructions

**Penalties for Late or Non-Reporting:**
- Civil penalties up to **$120,000 per violation** and up to **$17.15 million** for a related series of violations (2025 inflation-adjusted figures)
- Criminal penalties for knowing and willful violations
- Historically, CPSC has imposed **multi-million dollar penalties** for late Section 15 reporting

### 3.6 Import Surveillance (Risk Assessment Methodology — RAM)

**Legal Basis:** CPSIA Section 222

CPSC operates an import surveillance program at US ports using the **Risk Assessment Methodology (RAM)** system:

**How RAM Works:**
1. CPSC receives import entry data from CBP through ACE
2. RAM algorithm analyzes shipment data to identify **high-risk shipments** based on:
   - Product type
   - Country of origin
   - Manufacturer/importer history
   - Compliance history
   - Known hazard patterns
3. Flagged shipments are targeted for inspection/testing by CPSC investigators at ports
4. Non-compliant products are refused entry or seized

**Program Scale:**
- CPSC has port investigators stationed at major US ports
- In FY2013 alone, CPSC stopped **12.5+ million units** of violative products
- Focus areas include children's products, electronics, household items, and seasonal products

**For SE Asia Importers:**
- Products from China, Vietnam, and other SE Asian countries face **heightened scrutiny** due to historical violation rates
- First-time importers face additional risk-based screening
- Having certificates (GCC/CPC) ready at time of entry is critical

### 3.7 Textile Flammability Standards

**Legal Basis:** Flammable Fabrics Act (FFA); implementing regulations in 16 CFR Parts 1610, 1611, 1615, 1616

**16 CFR Part 1610 — General Wearing Apparel:**
- Applies to ALL clothing textiles (not just children's)
- Uses a **45-degree angle flame test** to classify fabrics
- **Class 1** (Normal Flammability) — acceptable
- **Class 2** (Intermediate Flammability) — acceptable with restrictions
- **Class 3** (Rapid and Intense Burning) — **PROHIBITED from sale**
- Plain surface textiles with burn time >= 3.5 seconds = Class 1
- Raised fiber surface textiles have additional criteria

**16 CFR Part 1615 — Children's Sleepwear (Sizes 0-6X):**
- **Stricter vertical burn test** (not 45-degree)
- Char length must not exceed **17.8 cm (7 inches)** for any individual specimen
- Average char length must not exceed **17.8 cm**
- Testing required in **original state AND after 50 wash/dry cycles**
- Tight-fitting exemption available (garments meeting specified dimensions)

**16 CFR Part 1616 — Children's Sleepwear (Sizes 7-14):**
- Same testing requirements as 1615
- Same char length limits
- Same 50-wash cycle durability requirement

**16 CFR Part 1611 — Vinyl Plastic Film:**
- Applies to vinyl plastic film used in wearing apparel
- Burn rate criteria for classification

**Import Implications:**
- All textile/apparel imports must comply with applicable flammability standards
- Testing should be completed **before importation**
- Non-compliant textiles are subject to seizure and destruction
- CBP may require evidence of flammability testing at entry

### 3.8 Lead Content Limits (Children's Products)

**Legal Basis:** CPSIA Section 101; 16 CFR Part 1303

| Material | Lead Limit | Regulation |
|----------|-----------|-----------|
| **Substrate material** (any accessible part of children's product) | **100 ppm** (0.01%) total lead content | CPSIA Section 101(a) |
| **Surface coatings** (paint, lacquer, etc.) | **90 ppm** (0.009%) total lead content | 16 CFR Part 1303 |

**Scope:**
- Applies to **all children's products** (designed for children 12 and under)
- "Accessible" means a part of the product that a child can touch, mouth, or ingest
- Certain materials have been **determined by rule to never exceed** 100 ppm (e.g., certain woods, textiles not treated with lead-containing substances, certain metals) and are exempt from third-party testing (but NOT from the lead limit itself)

**Testing Requirements:**
- Third-party testing by CPSC-accepted lab is required for lead content in children's products
- **XRF (X-ray fluorescence)** screening is commonly used for initial assessment
- Confirmatory wet chemistry testing if XRF results are near the limit

### 3.9 Phthalate Restrictions

**Legal Basis:** CPSIA Section 108; 16 CFR Part 1307

**Eight phthalates are permanently prohibited** in children's toys and child care articles at concentrations exceeding **0.1% (1,000 ppm)**:

| Phthalate | Abbreviation | Prohibited Since |
|-----------|-------------|-----------------|
| Di(2-ethylhexyl) phthalate | DEHP | 2009 (CPSIA) |
| Dibutyl phthalate | DBP | 2009 (CPSIA) |
| Benzyl butyl phthalate | BBP | 2009 (CPSIA) |
| Diisononyl phthalate | DINP | 2018 (final rule) |
| Diisobutyl phthalate | DIBP | 2018 (final rule) |
| Di-n-pentyl phthalate | DPENP | 2018 (final rule) |
| Di-n-hexyl phthalate | DHEXP | 2018 (final rule) |
| Dicyclohexyl phthalate | DCHP | 2018 (final rule) |

**Scope of Restriction:**
- **Children's toy:** Consumer product designed for a child 12 years of age or younger for use when the child plays
- **Child care article:** Consumer product designed to facilitate sleep, feeding, sucking, or teething for children 3 and younger

**Testing:**
- Third-party testing required for phthalate content in children's toys and child care articles
- Plasticized components are the primary concern (PVC, soft plastics)

### 3.10 Product Registration Cards

**Legal Basis:** CPSIA Section 104; 16 CFR Part 1130

Applies specifically to **durable infant or toddler products** — products intended for children under 5 that are expected to be used over extended periods:

**Products Requiring Registration Cards:**
- Cribs (full-size, non-full-size, play yards)
- Strollers, carriages
- High chairs, booster seats
- Bath seats
- Infant swings, bouncer seats
- Baby walkers, jumpers
- Play yards (playpens)
- Bassinets, cradles

**Requirements:**
- Product registration card must be included with product
- Card must include postage-paid, self-addressed return card
- Manufacturer must maintain registration database
- Must provide means for electronic registration (website)
- Purpose: enable direct consumer notification in event of recall

**Relevance:** Primarily relevant if importing durable baby/toddler products from SE Asia.

### 3.11 Filing Requirements with CBP

**Current (Pre-July 2026):**
- CPSC does not currently require electronic filing of certificates at entry
- However, CBP may request GCC/CPC at any time during or after entry
- Importers should have certificates **readily available**

**NEW: CPSC eFiling Rule (Effective July 8, 2026):**

| Detail | Requirement |
|--------|------------|
| **Effective Date** | July 8, 2026 (general); January 8, 2027 (FTZ entries) |
| **Regulation** | 16 CFR Part 1110 (revised) |
| **Published** | Federal Register, January 8, 2025 |
| **What's Required** | Electronic filing of GCC/CPC data in CBP's ACE system at time of entry |
| **Who Files** | Importer (typically through customs broker) |
| **System** | CBP Automated Commercial Environment (ACE) — Product Safety module |

**Seven Data Elements Required for eFiling:**
1. Product identification
2. CPSC citation codes (safety rules the product is certified to)
3. Manufacture date
4. Manufacture place (city, country)
5. Product test date
6. Testing laboratory identification (CPSC-accepted lab for children's products)
7. Point of contact information

**Preparation Steps for Importers:**
- Register in CPSC Product Registry
- Ensure all products have current GCC or CPC
- Coordinate with customs broker on ACE filing procedures
- Test eFiling during voluntary stage (available now)
- Update compliance workflows to generate certificate data in required format

**Record Retention:**
- Certifiers must maintain CPC/GCC records for at least **5 years**

### 3.12 Implementation Notes for SE Asia Consumer Goods Imports

**Data model requirements:**
- Product classification database (children's vs. general use, product categories)
- Testing requirements matrix (which standards apply to which products)
- Certificate management (GCC/CPC storage, expiration tracking)
- CPSC-accepted laboratory directory
- Section 15 reporting workflow
- eFiling data management (7 required elements per product)

**Key features to build:**
- **Product Compliance Classifier:** Input product description, determine whether GCC or CPC is required, list applicable safety standards
- **Testing Requirements Matrix:** By product type, show all required tests (flammability, lead, phthalates, etc.) with CFR references
- **Certificate Generator/Manager:** Create and store GCC/CPC documents with all required fields
- **eFiling Data Preparer:** Format certificate data for ACE submission (ready for July 2026)
- **Testing Cost Estimator:** Estimate third-party testing costs by product type and applicable standards
- **Section 15 Reporter:** Guided workflow for substantial product hazard reporting with 24-hour timer
- **Lab Finder:** Directory of CPSC-accepted labs by test standard, filtered by geography

**Critical for SE Asia Apparel/Textile Imports:**
1. **All clothing must be tested to 16 CFR 1610** (general flammability)
2. **Children's sleepwear** requires 16 CFR 1615/1616 testing AND CPC
3. **All children's apparel** requires lead testing and CPC
4. **Children's products with plastic components** require phthalate testing
5. **Third-party testing must occur BEFORE importation** for children's products
6. **eFiling becomes mandatory July 8, 2026** — build into system now

---

## 4. AES/EEI Filing Requirements for Exports

### 4.1 Overview

The Automated Export System (AES) is the system through which **Electronic Export Information (EEI)** — formerly the Shipper's Export Declaration (SED) — is filed with the US government. This is **directly relevant to the founder's cold chain export business** (96-97% of volume through Lineage terminal).

| Attribute | Detail |
|-----------|--------|
| **Governing Regulation** | 15 CFR Part 30 (Foreign Trade Regulations — FTR) |
| **Additional Authority** | 15 CFR Part 758 (Export Administration Regulations — EAR) |
| **Administering Agency** | US Census Bureau (statistical); Bureau of Industry and Security (export controls) |
| **Filing System** | AESDirect (via ACE portal) |
| **Output** | Internal Transaction Number (ITN) — proof of filing |

### 4.2 When AES/EEI Filing Is Required

**EEI filing is REQUIRED when ANY of the following apply:**

1. **Value threshold:** Shipment value is **$2,500 or more** per Schedule B number (commodity classification code)
2. **License required:** An export license is required regardless of value or destination
3. **ITAR items:** Shipment is subject to International Traffic in Arms Regulations (any value)
4. **Rough diamonds:** Any quantity (Kimberley Process)
5. **Used self-propelled vehicles:** Cars, trucks, buses (any value)
6. **Certain destinations:** Exports to embargoed/sanctioned countries may require filing regardless of value

**Important:** Items of domestic and foreign origin under the same commodity classification must be reported separately. If either exceeds $2,500, that portion requires EEI filing.

### 4.3 Electronic Export Information (EEI) Data Elements

**Key data elements required in EEI filing (15 CFR 30.6):**

| Data Element | Description |
|-------------|------------|
| USPPI (US Principal Party in Interest) | Exporter name, address, EIN/SSN |
| Ultimate Consignee | Foreign buyer/receiver name, address |
| Intermediate Consignee | If applicable (forwarder, agent in foreign country) |
| Forwarding Agent | US-based freight forwarder |
| Schedule B Number | 10-digit commodity classification |
| Quantity | Number of units in Schedule B unit of measure |
| Value | Selling price or cost if not sold (FAS value at US port) |
| Export Information Code | Type of export transaction |
| Country of Ultimate Destination | Where goods will be consumed/used |
| License/License Exception | If applicable |
| ECCN | Export Control Classification Number (if applicable) |
| Carrier Information | Carrier name, SCAC code |
| Port of Export | US port from which goods depart |
| Date of Export | Actual departure date |
| Method of Transportation | Vessel, air, truck, rail, etc. |

### 4.4 Schedule B Classification

**What it is:** Schedule B is a **10-digit numerical classification** for goods exported from the US, maintained by the US Census Bureau.

**Structure:**
- **First 6 digits:** Harmonized System (HS) code (internationally standardized)
- **Last 4 digits:** US-specific statistical suffixes

**How to Classify:**
1. Use the **Census Bureau Schedule B Search Engine** at [census.gov/foreign-trade/schedules/b](https://www.census.gov/foreign-trade/schedules/b/index.html)
2. Search by product name, description, or known HS code
3. Apply the **General Rules of Interpretation (GRI)** for complex classifications
4. Consider physical characteristics, material composition, and commercial function

**For Cold Chain Exports (common Schedule B chapters):**
- **Chapter 02:** Meat and edible meat offal
- **Chapter 03:** Fish and crustaceans
- **Chapter 04:** Dairy produce; eggs; honey
- **Chapter 07:** Edible vegetables
- **Chapter 08:** Edible fruit and nuts
- **Chapter 16:** Preparations of meat, fish, crustaceans
- **Chapter 20:** Preparations of vegetables, fruit, nuts
- **Chapter 21:** Miscellaneous edible preparations

### 4.5 Filing Through AESDirect

**AESDirect** is the free, web-based portal for filing EEI, hosted within the ACE (Automated Commercial Environment) system.

**Setup Requirements:**
1. Create an **ACE Exporter Account** (online application)
2. All users must agree to **AES Certification Statements** before filing
3. Can designate authorized agents to file on behalf of the USPPI

**Filing Process:**
1. Log into AESDirect at [aesdirect.gov](https://aesdirect.gov)
2. Enter all required data elements
3. Submit the filing
4. Receive an **Internal Transaction Number (ITN)**
5. Provide the ITN to the carrier — carrier must have it before departure
6. ITN is annotated on the bill of lading or other export documentation

**Alternative Filing Methods:**
- **AES API (via ACE):** For high-volume filers using automated systems
- **Through freight forwarders:** Most exporters use their forwarder as authorized agent
- **Third-party software:** Commercial trade compliance software that interfaces with AES

### 4.6 Exemptions from EEI Filing

**15 CFR Part 30, Subpart D** provides specific exemptions:

| Exemption | Conditions | Legend Code |
|-----------|-----------|------------|
| **Low value** | Each Schedule B line item under **$2,500** (and no license required) | NO EEI 30.37(a) |
| **Canada** | Exports to Canada valued under $2,500 per commodity, unless license required | NO EEI 30.36 |
| **Temporary exports** | Goods exported and returned within **12 months** (no license required) | NO EEI 30.37(e) |
| **Technology/software** | Certain technology and software as defined in EAR | Varies |
| **Personal effects** | Household goods and personal effects | NO EEI 30.37(f) |
| **Carriers' stores** | Bunker fuel, ship's stores, supplies | NO EEI 30.37(g) |
| **Diplomatic pouches** | Government/diplomatic shipments | NO EEI 30.37(i) |
| **Gift parcels** | Under $2,500 to single consignee | NO EEI 30.37(h) |

**Important:** When an exemption applies, the exemption legend **must be noted** on the first page of the bill of lading, air waybill, or other commercial loading document, AND on the carrier's outbound manifest.

**License Exceptions (EAR):**
- Certain EAR License Exceptions also exempt from EEI filing for specific situations
- However, some License Exceptions **still require** EEI filing (e.g., License Exception TMP for some items)
- Always check the specific License Exception requirements

### 4.7 Timing Requirements

**Filing deadlines vary by transport mode (15 CFR 30.4):**

| Transport Mode | Predeparture Filing Deadline |
|---------------|----------------------------|
| **Vessel** | **24 hours before loading** cargo at the US port of lading |
| **Air** | **2 hours** before scheduled departure (same for express consignment) |
| **Truck** | **1 hour** before the truck arrives at the US border |
| **Rail** | **2 hours** before the train arrives at the US border |
| **Mail** | Before export (when deposited with postal service) |
| **Pipeline** | **4 business days** after the month of export (postdeparture allowed) |

**Critical for Vessel Exports (Cold Chain):**
- The **24-hour predeparture filing for vessels** is measured from the time cargo is **loaded onto the vessel**, not when it leaves port
- ITN must be provided to the carrier before loading
- This aligns with the general **24-hour advance manifest rule** (CBP)

### 4.8 Postdeparture Filing Option

**15 CFR 30.4(c):** For qualifying USPPIs, a **postdeparture filing** option exists:

**Requirements:**
- USPPI must apply for and receive **Census Bureau approval** for postdeparture filing privileges
- Filing must be completed within **5 calendar days** after date of exportation
- Only available for shipments where **predeparture filing is NOT specifically required**

**NOT eligible for postdeparture filing:**
- Shipments requiring an export license
- Routed export transactions
- Shipments to embargoed/sanctioned destinations
- Used self-propelled vehicles
- ITAR-controlled items
- Items requiring Department of State authorization

**Current Status (2025-2026):**
- The Census Bureau is **NOT currently accepting new applications** for postdeparture filing privileges
- Existing approved filers may continue using postdeparture filing
- All new filers must use **predeparture filing**

**Relevance to Agricultural/Seasonal Exports:**
- The postdeparture option was originally designed partly for agricultural/seasonal commodities where exact quantities, values, and consignees may not be known until after departure
- For cold chain exports where final quantities are confirmed at loading, this could be valuable — but new applications are currently suspended

### 4.9 Routed Export Transactions

**Legal Basis:** 15 CFR 30.3

A **routed export transaction** occurs when the **Foreign Principal Party in Interest (FPPI)** — the foreign buyer — authorizes a US-based forwarding agent to facilitate the export.

**Key Rules:**
- The **FPPI's forwarding agent** is responsible for filing EEI (not the USPPI)
- However, the **USPPI must provide** certain information to the agent:
  - Company name and address (or EIN)
  - Point of contact
  - Schedule B number(s) or ECCN(s)
  - Description of the commodities
  - D/F domestic/foreign designation
  - Quantity and unit of measure
  - Value
  - Export control information (license number, License Exception, No License Required)
- The USPPI must provide this information within **sufficient time** for the agent to file before departure
- **Predeparture filing is always required** for routed transactions (postdeparture NOT available)

**Relevance to Cold Chain Exports:**
- If the foreign buyer arranges shipping (common in international perishable trade), the transaction may be a routed export
- The USPPI (exporter/producer) still has obligations to provide data
- The platform should track whether a transaction is "standard" or "routed" and adjust filing workflows accordingly

### 4.10 Penalties for Non-Compliance

**15 CFR Part 30, Subpart H; Export Control Reform Act (ECRA) penalties:**

| Violation Type | Penalty |
|---------------|---------|
| **Failure to file EEI** | Up to **$10,000** per violation (civil) |
| **Late filing** | Up to **$1,100 per day** of delinquency, max **$10,000** per violation |
| **Filing false/misleading information** | Up to **$10,000** per violation (civil) |
| **EAR violations (ECRA)** | Civil: up to **$364,992** per violation (2025 inflation-adjusted) OR **twice the transaction value**, whichever is greater |
| **Criminal EAR violations** | Up to **$1,000,000** per violation AND/OR **20 years imprisonment** |
| **Willful FTR violations** | Up to **$10,000** fine AND/OR **5 years imprisonment** |

**Additional Consequences:**
- **Denial of export privileges** — can be barred from exporting
- **Increased audit scrutiny** from Census Bureau and BIS
- **Carrier liability** — carriers that depart without required ITN face penalties
- **Bond forfeiture** in certain circumstances

### 4.11 Relevance to Cold Chain Exports

**The founder's core business (96-97% export volume through Lineage terminal) makes AES/EEI compliance a daily operational requirement.**

**Specific Cold Chain Considerations:**

1. **High-Value Perishable Shipments:** Most cold chain container exports exceed $2,500, meaning virtually all shipments require EEI filing

2. **Schedule B Classification:** Perishable goods span multiple Schedule B chapters (02-08, 16, 20-21). Accurate classification is critical because:
   - Different codes may have different export control requirements
   - Misclassification triggers penalties
   - Some agricultural products have additional USDA/APHIS requirements that interact with AES filing

3. **Time Sensitivity:** The **24-hour vessel predeparture** filing requirement is particularly critical for cold chain because:
   - Perishables cannot wait at port while filing issues are resolved
   - Temperature-controlled cargo has strict time windows
   - Delayed loading due to missing ITN = potential spoilage and major financial loss
   - The platform should build in filing deadline alerts with adequate buffer time

4. **Routed Transactions Common:** International perishable buyers often arrange their own freight, making routed export transactions common in cold chain. The platform must handle both standard and routed workflows.

5. **Agricultural Exemptions:** Some agricultural products may qualify for specific exemptions or simplified procedures — the platform should flag these.

6. **USDA/APHIS Coordination:** Many cold chain exports also require USDA phytosanitary certificates, APHIS export permits, or country-specific health certificates. While not part of AES, these are parallel filing requirements that the platform should track.

### 4.12 Implementation Notes for Platform

**Data model requirements:**
- Schedule B code database (10-digit codes with descriptions, mapped to HS codes)
- EEI filing records (ITN numbers, filing dates, statuses)
- Party database (USPPIs, FPPIs, forwarding agents, carriers)
- Export license tracking (if applicable)
- Filing deadline calculator by transport mode
- Exemption determination engine

**Key features to build:**
- **Schedule B Classifier:** Search/lookup tool for export commodity codes (mirror Census Bureau's search engine with cold chain focus)
- **EEI Filing Checklist:** Dynamic checklist of required data elements, auto-populated from shipment data
- **Filing Deadline Calculator:** Input vessel loading time, calculate 24-hour predeparture deadline with alerts at 48h, 24h, and 12h before deadline
- **Routed Transaction Detector:** Flag when transaction is routed and adjust workflows (agent files, USPPI provides data)
- **Exemption Analyzer:** Input shipment details, determine if any exemption applies, generate proper exemption legend for BOL
- **ITN Tracker:** Track filing status and ITN numbers across all active shipments
- **Penalty Risk Scorer:** Flag shipments approaching filing deadlines or with incomplete data
- **AES Integration (Phase 2+):** Direct API integration with ACE/AESDirect for automated filing

**Data sources:**
- Schedule B codes: [census.gov/foreign-trade/schedules/b](https://www.census.gov/foreign-trade/schedules/b/index.html)
- AESDirect: [aesdirect.gov](https://aesdirect.gov)
- FTR (full regulation): [ecfr.gov/current/title-15/part-30](https://www.ecfr.gov/current/title-15/subtitle-B/chapter-I/part-30)
- EAR Part 758: [bis.gov/ear/title-15/subtitle-b/chapter-vii/subchapter-c/part-758](https://www.bis.gov/ear/title-15/subtitle-b/chapter-vii/subchapter-c/part-758/ss-7581-electronic-export-information-eei)

---

## 5. ISF (Importer Security Filing) — 10+2 Rule

### 5.1 Overview

The Importer Security Filing (ISF), commonly called "10+2," is a CBP requirement under **19 CFR Part 149** mandating that importers electronically submit cargo information before goods are loaded onto vessels bound for the United States. Established by the SAFE Port Act of 2006 (Section 203), with the final rule published January 26, 2009.

**Purpose:** Advance cargo risk assessment — CBP uses ISF data to identify high-risk shipments before they reach US shores.

**Applies to:** All cargo arriving by vessel to the United States, with limited exceptions.

### 5.2 The 10 Importer Data Elements

| # | Data Element | Description | Source |
|---|-------------|-------------|--------|
| 1 | **Seller (owner)** | Name and address of the last known entity by whom goods are sold | Purchase order / commercial invoice |
| 2 | **Buyer (purchaser)** | Name and address of the last known entity to whom goods are sold | Purchase order |
| 3 | **Importer of Record Number** | IRS number, EIN, SSN, or CBP-assigned number | Importer's CBP records |
| 4 | **Consignee Number(s)** | IRS/EIN/SSN/CBP number of the entity in the US on whose account merchandise is shipped | Bill of lading / import records |
| 5 | **Manufacturer (supplier)** | Name and address of the entity that last manufactures, assembles, produces, or grows the commodity | Commercial invoice / supplier records |
| 6 | **Ship-to Party** | First deliver-to party scheduled to physically receive goods after port of entry release | Shipping instructions |
| 7 | **Country of Origin** | Country of manufacture, production, or growth per US rules of origin | Commercial invoice / certificate of origin |
| 8 | **Commodity HTS Number** | 6-digit minimum Harmonized Tariff Schedule number (10-digit preferred but not required) | HTS classification |
| 9 | **Container Stuffing Location** | Name and address(es) where goods were stuffed into the container | Supplier / freight forwarder |
| 10 | **Consolidator (stuffer)** | Name and address of the party who stuffed the container | Freight forwarder / supplier |

### 5.3 The 2 Carrier Data Elements

| # | Data Element | Description |
|---|-------------|-------------|
| 1 | **Vessel Stow Plan** | Location of all containers on vessel, transmitted via AMS no later than 48 hours after departure from last foreign port |
| 2 | **Container Status Messages (CSM)** | Reports on container status (gate-in, gate-out, loading, discharge) at each port along the route |

### 5.4 Filing Deadline

**Critical: 24 hours before vessel departure from the LAST foreign port, NOT 24 hours before arrival at the US port.**

For a vessel departing Ho Chi Minh City with a transshipment in Singapore:
- ISF must be filed 24 hours before departure from **Singapore** (last foreign port)
- If direct from HCMC to Long Beach, ISF due 24 hours before departure from HCMC

**Amendments:** Elements 1-5 may be updated up to 24 hours before vessel arrival at first US port. Elements 7-10 allow "best information available" at filing with updates before arrival, but this flexibility does NOT extend to elements 1-6.

### 5.5 Penalties

| Violation | Penalty | Authority |
|-----------|---------|-----------|
| Late ISF filing | **$5,000 per violation** | 19 CFR 149.4 |
| Inaccurate ISF filing | **$5,000 per violation** | 19 CFR 149.4 |
| Failure to file ISF | **Up to $10,000 per violation** | 19 CFR 149.4 |
| Pattern of non-compliance | Increased examinations, holds, liquidated damages | CBP discretion |
| Do-not-load (DNL) order | CBP can direct carriers not to load container onto US-bound vessel | 19 CFR 149.4 |
| Withholding of release | CBP can withhold release of merchandise pending compliance | 19 CFR 149.4 |

Penalty is per **shipment** (per bill of lading), not per container. C-TPAT membership helps with mitigation.

### 5.6 ISF-5 vs ISF-10

| Filing Type | When Used | Elements Required |
|------------|-----------|-------------------|
| **ISF-10** | Standard import — goods entering US commerce | All 10 importer + 2 carrier elements |
| **ISF-5** | FROB (Foreign Remaining On Board), FTZ goods not entered for consumption, IE, T&E | 5 elements: booking party, foreign port of unlading, place of delivery, ship-to party, commodity HTS |

**Practical impact:** Nearly all SE Asia imports for sale in the US require ISF-10. ISF-5 only for transshipment cargo and FROB.

### 5.7 Bond Requirements for ISF

- An ISF bond is **required** to file ISF
- The importer's existing continuous entry bond satisfies this requirement
- If no continuous bond, a single transaction bond (STB) can be used
- The ISF bond amount is included in the continuous bond calculation
- Customs brokers typically file ISF on behalf of importers under the importer's bond

### 5.8 Exceptions and Exemptions

- **Bulk cargo** — loose, unpackaged cargo (grain, coal, petroleum) loaded directly without containers
- **Authorized in-bond movements** — goods moving under bond to another port without entry
- **Diplomatic pouches and military goods** — government shipments with specific exemptions
- **Goods from Canada and Mexico** — NOT exempt (vessel-only requirement, but applies if shipped by vessel)

### 5.9 Implementation Notes

**ISF Status Tracking States:** `pending` → `filed` → `accepted` → `matched` → `amended` (if needed) → `closed`

**Platform features:**
- ISF deadline calculator (24h before last foreign port departure)
- Auto-populate ISF data from shipment records
- Amendment tracking with version history
- Penalty risk alerts when deadline approaching
- Integration with broker filing systems
- ISF cost estimation: $25-75 per filing (broker fee)

---

## 6. Foreign Trade Zone (FTZ) Regulations — 19 CFR 146

### 6.1 Overview

Foreign Trade Zones are secure areas under CBP supervision that are considered outside US customs territory for duty purposes. Goods may be admitted to an FTZ without formal customs entry or payment of duties, and may be stored, tested, sampled, relabeled, repackaged, displayed, assembled, manufactured, or processed within the zone.

**Authority:** Foreign Trade Zones Act of 1934 (19 U.S.C. 81a-81u), administered by the Foreign-Trade Zones Board (Commerce Department) and enforced by CBP under 19 CFR Part 146.

**Key Benefit:** Duties are deferred until goods leave the zone and enter US commerce. If goods are re-exported, NO duties are paid.

### 6.2 Zone Activation Process (19 CFR 146.6)

1. **FTZ Board Grant** — The FTZ Board approves zone designation (general-purpose zones and subzones)
2. **Activation Application** — Operator submits CBP Form 216 to the local CBP port director
3. **Site Inspection** — CBP inspects the facility for security, fencing, access control
4. **Activation Order** — CBP issues activation allowing operations to begin
5. **Bond Requirement** — Operator must have a zone operator bond (minimum $50,000)

**Timeline:** 3-6 months typical for activation after Board approval.

There are **260+ FTZ sites** across the US (per OFIS/trade.gov database).

### 6.3 Admission of Goods (19 CFR 146.32-146.40)

- Goods admitted on **CBP Form 214** (Application for FTZ Admission and/or Status Designation)
- Each admission must specify the **status** of the goods
- Goods can be admitted as: Privileged Foreign (PF), Non-Privileged Foreign (NPF), Zone Restricted, or Domestic
- CBP may examine goods upon admission

### 6.4 Privileged Foreign (PF) vs Non-Privileged Foreign (NPF)

| Attribute | Privileged Foreign (PF) | Non-Privileged Foreign (NPF) |
|-----------|------------------------|------------------------------|
| **Duty Rate** | Locked at rate on date of admission | Rate applied at date of entry into US commerce |
| **Classification** | Based on condition at time of admission | Based on condition at time of entry (after any manipulation/manufacturing) |
| **Use Case** | Lock in current low rate before tariff increases | Take advantage of "inverted tariff" — finished product has lower rate than components |
| **Election** | Must be requested on CBP Form 214 at admission | Default status if no PF election made |
| **Permanence** | **Irrevocable** once granted | Can be changed to PF before entry |

### 6.5 April 2025 Executive Order Impact

**Critical change:** The April 2025 executive order on reciprocal tariffs mandates **Privileged Foreign (PF) status** for all goods within the scope of the new reciprocal tariffs. This effectively:
- Eliminates the NPF advantage for goods subject to Section 301 reciprocal tariffs
- Forces duty rate lock-in at the (higher) reciprocal tariff rate
- Removes the ability to use FTZs to avoid reciprocal tariffs via NPF status
- PF status is now **mandatory**, not optional, for reciprocal-tariff-scope goods

**Impact on platform:** FTZ savings calculator must account for this — PF is no longer a strategic choice for affected goods but a regulatory requirement.

### 6.6 Zone-to-Zone Transfers

Goods can be transferred between FTZs (or between zones and subzones) without entering US commerce. CBP Form 214 is filed at the receiving zone. Status elections travel with the goods.

### 6.7 Manufacturing in FTZs (Production Authority)

Manufacturing or processing in an FTZ requires **production authority** from the FTZ Board:
- Applied for via FTZ Board regulations (15 CFR Part 400)
- Must demonstrate public benefit
- **Production notification** required for new manufacturing activities
- Output products can be entered at the rate applicable to either the inputs or the finished product (whichever is lower — the "inverted tariff" benefit, but only with NPF status)

### 6.8 Weekly Entry Procedures

- FTZ goods enter US commerce via **weekly estimated entry** (CBP Form 3461/7501)
- Entries are filed on a weekly cycle, summarizing all withdrawals for that week
- Duties are paid at entry, not at admission
- **Incremental withdrawal** — withdraw only what you need, when you need it (e.g., 100 pallets at a time)
- This is a core competitive advantage: pay duties only on goods actually entering commerce

### 6.9 FTZ Reporting Requirements

| Report | Frequency | Authority |
|--------|-----------|-----------|
| **Annual Reconciliation** | Annually | 19 CFR 146 |
| **Zone Schedule Information (ZSI)** | Annually | FTZ Board |
| **Inventory Control Records** | Ongoing | 19 CFR 146.4 |
| **AFMS (Automated FTZ Management System)** | Each admission/transfer/entry | CBP electronic filing |
| **Zone Operator Records** | 5-year retention | 19 CFR 146/163 |

### 6.10 Benefits Calculation Methodology

**1. Duty Deferral Savings:**
```
Annual Savings = Average Inventory Value × Duty Rate × Cost of Capital × Average Dwell Time / 365
```

**2. Inverted Tariff Savings (NPF only, where still available):**
```
Savings per Unit = (Component Duty Rate - Finished Product Duty Rate) × Component Value
```

**3. Waste/Scrap Elimination:**
```
Savings = Waste Percentage × Import Value × Duty Rate
(No duty paid on goods destroyed/scrapped in zone)
```

**4. MPF (Merchandise Processing Fee) Reduction:**
```
Standard MPF: 0.3464% per entry (min $31.67, max $614.35)
FTZ MPF: 0.3464% per weekly entry (max $614.35/week vs per-entry)
Savings significant for high-volume importers making many entries
```

**5. Re-export Savings:**
```
Savings = Duty Rate × Value of Re-exported Goods
(100% of duties avoided on goods that never enter US commerce)
```

### 6.11 Key FTZ Operators — LA/Long Beach Area (SE Asia Import Hub)

| Zone | Operator | Location | Notes |
|------|----------|----------|-------|
| FTZ 202 | Los Angeles Customs Brokers & Freight Forwarders Assn. | LA/Long Beach | General-purpose zone |
| FTZ 50 | Long Beach Board of Harbor Commissioners | Long Beach | Major port-adjacent zone |
| FTZ 236 | Port of Los Angeles | San Pedro | Port-integrated operations |
| Various subzones | Company-specific | Greater LA | Distribution centers with FTZ subzone designation |

---

## 7. Section 301 Tariffs (China Trade War)

### 7.1 Current Tariff Rates (Lists 1-4)

| List | Original Rate | Current Rate (2025-2026) | Products | Value |
|------|--------------|--------------------------|----------|-------|
| **List 1** | 25% | 25% | ~818 tariff lines (industrial machinery, medical devices) | $34B |
| **List 2** | 25% | 25% | ~279 tariff lines (chemicals, semiconductors, plastics) | $16B |
| **List 3** | 25% | 25% | ~5,745 tariff lines (furniture, electronics, auto parts) | $200B |
| **List 4A** | 7.5%-25% | 7.5%-25% | ~3,800+ tariff lines (consumer goods, apparel, footwear) | $300B |
| **List 4B** | Suspended/varies | Varies | Consumer electronics, some apparel | Subset of 4A |

**2024-2025 USTR Four-Year Review Increases (Section 301 modifications):**

| Product Category | Previous Rate | New Rate (2025) |
|-----------------|---------------|-----------------|
| Electric vehicles | 25% | **100%** |
| Solar cells/modules | 25% | **50%** |
| Lithium-ion EV batteries | 7.5% | **25%** |
| Critical minerals | 0-7.5% | **25%** |
| Steel & aluminum products | 0-7.5% | **25%** |
| Ship-to-shore cranes | 0% | **25%** |
| Medical PPE (syringes, needles) | 0% | **50%** (2025) |
| Semiconductors | 25% | **50%** (2025) |

### 7.2 Exclusion Process

- USTR periodically opens exclusion request windows
- Exclusions are product-specific (by HTS code) and time-limited
- Most List 1-3 exclusions have expired
- Limited exclusions remain for specific products with no alternative sources
- Application via the USTR Federal Register process

### 7.3 China to SE Asia Shift (Trade Diversion)

The Section 301 tariffs triggered massive supply chain diversification:

| Country | Shift Dynamic | Risk Level |
|---------|--------------|------------|
| **Vietnam** | Largest beneficiary — significant FDI from Chinese firms relocating | HIGH (anti-circumvention scrutiny) |
| **Cambodia** | Garment/textile growth, Chinese-invested factories | MEDIUM-HIGH |
| **Thailand** | Electronics, auto parts, diversified manufacturing | MEDIUM |
| **Indonesia** | Labor-intensive goods, growing manufacturing base | MEDIUM |
| **India** | Electronics, pharmaceuticals, textiles | MEDIUM-LOW |
| **Malaysia** | Electronics, solar panels (UFLPA intersection) | HIGH |

### 7.4 Country-of-Origin & Substantial Transformation

**Key rule:** Goods must undergo **substantial transformation** in the country claiming origin. Simply routing Chinese goods through SE Asia for repackaging/relabeling is **customs fraud**.

**CBP tests for substantial transformation:**
1. **Name change** — Does the product have a different name after processing?
2. **Character change** — Has the fundamental nature of the article changed?
3. **Use change** — Is the finished product used for a different purpose than the input?

**Anti-circumvention enforcement:**
- **EAPA (Enforce and Protect Act) investigations** — CBP investigates tariff evasion through transshipment
- **Operation Mega Flex** — CBP's multi-agency operation targeting Section 301 circumvention
- CBP is actively targeting Vietnam, Malaysia, Thailand for transshipment schemes
- Penalties: Up to 4x the unpaid duties + potential criminal prosecution

### 7.5 De Minimis Section 321 ($800 Threshold)

- Shipments valued at $800 or less per person per day may enter duty-free under Section 321
- **Recent restrictions:** Executive orders and pending legislation to eliminate/restrict Section 321 for China-origin goods
- High-volume e-commerce shippers (Temu, Shein, etc.) are primary targets
- CBP has proposed requiring HTS classification and country of origin for all Section 321 shipments
- **Not relevant for container-level imports** (the platform's primary use case) but important for e-commerce expansion

---

## 8. Section 201 & 232 Tariffs (Steel/Aluminum/Safeguards)

### 8.1 Section 201 Safeguard Tariffs

**Solar Panels (Crystalline Silicon Photovoltaic Cells):**
- Originally imposed February 2018 at 30%, declining annually
- Extended through February 2026 at 14.75% (first 2.5 GW exempt)
- Applies regardless of country of origin

**Large Residential Washing Machines:**
- Originally 20-50% tariff-rate quota
- Extended and modified through 2026

### 8.2 Section 232 National Security Tariffs

**Steel:**
- **25% tariff** on most steel imports
- Applies to a wide range of steel products (flat, long, pipe, tube, semi-finished)
- Downstream/derivative products added March 2025

**Aluminum:**
- **25% tariff** (increased from 10% effective March 12, 2025)
- Covers primary aluminum, aluminum articles, and derivative products

### 8.3 March 2025 Proclamation — Major Changes

The March 2025 presidential proclamation made significant changes:
- **Eliminated ALL country exemptions and quota arrangements** (previously Canada, Mexico, EU, UK, Japan, etc. had exclusions/quotas)
- Now applies universally to all countries
- Extended to **derivative products** (downstream articles made from steel/aluminum)
- Aluminum rate increased from 10% to **25%**

### 8.4 Downstream/Derivative Products Affected

Steel derivatives include: nails, screws, bolts, stampings, castings, forgings, fittings, flanges
Aluminum derivatives include: foil, cans, extrusions, forgings, castings, wire, cable

### 8.5 Exclusion Request Process

- Exclusions requested through the **Bureau of Industry and Security (BIS)**
- Product-specific (by HTS code) and company-specific
- Must demonstrate: no sufficient domestic supply, national security impact
- Exclusions are time-limited (typically 1 year, renewable)

### 8.6 FTZ Treatment of Section 232 Goods

**Mandatory Privileged Foreign (PF) status** — Section 232 goods in FTZs must be admitted under PF status. NPF election is NOT permitted. This means:
- Duty rate is locked at admission (at the 25% Section 232 rate)
- Cannot use FTZ to avoid Section 232 duties
- Same rule applies to Section 301 reciprocal tariff goods (April 2025 order)

### 8.7 Implementation Notes

**Platform impact:**
- Tariff calculator must flag steel/aluminum products and apply Section 232 rates
- FTZ analyzer must enforce mandatory PF status for 232 goods
- Track derivative product scope (expanding list)
- Country exemption field should show "NONE — all countries subject to 232 as of March 2025"

---

## 9. Bonding Requirements

### 9.1 Continuous vs Single Entry Bond

| Attribute | Continuous Entry Bond | Single Transaction Bond (STB) |
|-----------|----------------------|-------------------------------|
| **Coverage** | All entries at all ports for 1 year | One specific entry |
| **Minimum Amount** | $50,000 | Varies (typically 100% of duties + taxes + fees) |
| **Cost** | Annual premium (typically 0.5-2% of bond amount) | Per-entry premium (typically $5-15 per $1,000 of bond) |
| **Renewal** | Annual, auto-renews unless terminated | Single use |
| **Best For** | 3+ imports per year | Occasional importers |
| **Breakpoint** | Generally cheaper than STBs if >3 entries/year | — |

### 9.2 Bond Calculation Formula

```
Continuous Bond Amount = MAX($50,000, 10% of duties/taxes/fees paid in prior 12 months)
Round UP to nearest $10,000
```

**Example:** If $800,000 in duties paid last year → 10% = $80,000 → bond = $80,000

**Section 301/232 impact:** These tariffs dramatically increased duty payments, which in turn increased bond requirements. Many importers needed bond increases after tariff imposition.

### 9.3 Sufficiency Reviews

CBP conducts periodic bond sufficiency reviews:
- Triggered by significant increase in import volume or duty payments
- Triggered by compliance issues or penalty actions
- CBP can demand bond increase with 30-day compliance period
- Failure to increase bond → CBP can withhold release of merchandise

### 9.4 Bond Types by Function

| Bond Type | Purpose | Amount |
|-----------|---------|--------|
| **Import Bond (Type 1)** | Cover duties, taxes, fees on imported goods | Per formula above |
| **ISF Bond** | Covered under import bond (same bond) | Included in continuous bond |
| **FTZ Operator Bond** | Required for FTZ operators | Minimum $50,000 |
| **Customs Broker Bond** | Required for licensed customs brokers | $50,000 |
| **Drawback Bond** | For duty drawback claims | Varies |

### 9.5 Premium Estimation (for Platform Cost Calculator)

| Bond Amount | Typical Annual Premium Range |
|-------------|------------------------------|
| $50,000 | $400-$600 |
| $100,000 | $700-$1,200 |
| $250,000 | $1,500-$3,000 |
| $500,000 | $3,000-$6,000 |
| $1,000,000 | $5,000-$12,000 |

Premiums vary by: importer's credit/financial strength, compliance history, industry, surety company.

### 9.6 Surety Companies

Major customs bond sureties: International Fidelity Insurance Company, Roanoke Trade Services, Lexon Insurance Company, Avalon Risk Management. Application requires: financial statements, import history, CBP compliance record, intended import volume.

---

## 10. Record Retention Requirements (5-Year CBP Rule)

### 10.1 Statutory Foundation

**19 USC 1508** and **19 CFR Part 163** establish that any party involved in importing or exporting merchandise must maintain records for **5 years** from the date of entry (import) or export.

### 10.2 Who Must Maintain Records

- Importers of record
- Customs brokers
- FTZ operators
- Export agents / freight forwarders
- Any party with financial interest in the import transaction

### 10.3 Records That Must Be Retained

**The (a)(1)(A) List** — records that must be kept AND produced on demand to CBP:

| Category | Records |
|----------|---------|
| **Entry/Summary** | Entry summaries (CBP 7501), entry documentation, amendments |
| **Commercial Invoices** | All invoices related to imported goods |
| **Packing Lists** | Itemized packing lists |
| **Bills of Lading** | Ocean/air bills of lading, delivery orders |
| **ISF Filings** | ISF-10/ISF-5 records and all amendments |
| **Classification/Valuation** | HTS classification records, valuation worksheets, ruling letters |
| **Bonds** | Bond documentation, surety information |
| **Powers of Attorney** | All POAs granted to customs brokers |
| **Country of Origin** | Certificates of origin, preferential trade program documentation |
| **Special Categories** | FTZ records, drawback records, TIB records, ATA Carnet documentation |
| **UFLPA Due Diligence** | Supply chain mapping, audit reports, origin certificates (retain with import records) |

### 10.4 Retention Period Details

| Record Type | Retention Period | Start Date |
|------------|-----------------|------------|
| Import entry records | **5 years** | Date of entry |
| Export records | **5 years** | Date of export |
| Drawback records | **5 years** | Date of drawback payment |
| FTZ records | **5 years** | Date of zone activity |
| Broker records | **5 years** | Date of transaction |

### 10.5 Format Requirements (19 CFR 163.5)

- Electronic storage is permitted under **alternative storage methods**
- Must maintain dual copies (original + backup)
- Annual testing of retrieval system required
- 30-day notice to CBP before changing storage methods
- Records must be retrievable within **30 days** of CBP request (some records within **24 hours**)

### 10.6 Penalties for Non-Compliance

| Violation | Penalty | Authority |
|-----------|---------|-----------|
| Willful failure to maintain/produce records | **$100,000 per violation** | 19 USC 1509 |
| Negligent failure | **$10,000 per violation** | 19 USC 1509 |
| First-time violation (no prior penalties) | Written warning | CBP discretion |
| Pattern of violations | Increased scrutiny, Focused Assessment audit | CBP |

### 10.7 CBP Focused Assessments and C-TPAT

- CBP conducts **Focused Assessment (FA)** audits targeting recordkeeping compliance
- C-TPAT members receive fewer examinations but must meet C-TPAT minimum security criteria, including 13 cybersecurity requirements
- A **Recordkeeping Compliance Program (RCP)** is available — certified importers receive reduced penalties and benefits

### 10.8 Implementation Notes

**Platform document management features:**
- Automated retention schedule with destruction reminders at 5 years
- Document classification by type (entry, invoice, BOL, ISF, FTZ, etc.)
- Retrieval system meeting 24-hour/30-day CBP response requirements
- Audit trail for all document access and modifications
- Version control for amended documents
- Secure storage with encryption at rest
- Backup and disaster recovery

**TypeScript retention policy model:**
```typescript
interface RetentionPolicy {
  recordType: 'entry' | 'invoice' | 'bol' | 'isf' | 'ftz' | 'uflpa' | 'export' | 'drawback';
  retentionYears: 5;
  startDate: Date; // date of entry/export/activity
  destructionDate: Date; // startDate + 5 years
  status: 'active' | 'approaching_expiry' | 'eligible_for_destruction' | 'destroyed' | 'hold';
  legalHold: boolean; // freeze destruction if under audit/investigation
}
```

---

## 11. Data Privacy Implications for Trade Data

### 11.1 Types of Trade Data Handled

| Data Type | Sensitivity | Examples |
|-----------|------------|---------|
| **Commercial Invoices** | HIGH | Pricing, quantities, terms of sale |
| **Bills of Lading** | LOW-MEDIUM | Public record (carrier, consignee, port info) |
| **Customs Entries** | HIGH | Confidential — duty amounts, classification, valuation |
| **Supplier Information** | CRITICAL | Names, addresses, pricing, manufacturing details |
| **Financial Records** | CRITICAL | Payment records, bank transfers, cost structures |
| **UFLPA Due Diligence** | HIGH | Supply chain mapping, audit reports |

### 11.2 US Data Privacy Landscape

- **No federal comprehensive privacy law** — sector-specific and state-by-state
- **CCPA/CPRA (California):** Applies if business meets thresholds ($25M revenue, 100K+ consumers/households). Trade data about individuals may be covered.
- **20+ state privacy laws** by 2026 — Virginia, Colorado, Connecticut, Texas, etc.
- **Trade Secrets Act:** Protects confidential business information provided to government
- **CBP Confidential Business Information:** Entry summary data is confidential (19 CFR 103). BOL data is generally public.

### 11.3 GDPR Implications (EU Trading Partners)

**When GDPR applies:**
- Processing personal data of EU/EEA individuals (employees, contacts at EU suppliers/buyers)
- Not limited to EU-based companies — applies to any entity processing EU personal data

**Key requirements:**
- Data minimization — collect only what's needed
- Purpose limitation — use data only for stated purposes
- Storage limitation — don't retain longer than necessary (tension with 5-year CBP rule)
- Cross-border transfer mechanisms: **EU-US Data Privacy Framework (DPF)** recommended, Standard Contractual Clauses (SCCs) as backup
- Data Protection Officer (DPO) may be required if systematic monitoring at large scale

**GDPR-CBP tension:** GDPR requires data minimization and deletion; CBP requires 5-year retention. Resolution: retain CBP-mandated records for 5 years (legal obligation exception under GDPR Article 6(1)(c)), but delete non-required personal data per GDPR timelines.

### 11.4 Data Security Requirements

**C-TPAT Cybersecurity (13 requirements):**
- Access controls, password policies, network security, data protection
- Incident response plan, employee training
- Annual cybersecurity assessment

**Customs Broker Requirements (19 CFR 111.22):**
- 72-hour breach notification to CBP for broker data breaches
- Adequate data protection for client records

**PCI DSS 4.0 (if handling payment data):**
- Recommendation: tokenize payment data, don't store card data
- Use payment processors for all financial transactions

### 11.5 Public vs Confidential Trade Data

| Data | Classification |
|------|---------------|
| Bill of lading data | **Public** — filed with carriers, often accessible via data providers |
| Entry summary data | **Confidential** — protected by CBP |
| Duty payment amounts | **Confidential** |
| HTS classifications used | **Confidential** (but HTS codes themselves are public) |
| Export EEI data | **Confidential** — Census Bureau restricted |
| Importer name/address | **Generally public** (from BOL data) |
| Supplier pricing | **CRITICAL** — trade secret, highest protection needed |

### 11.6 Implementation Notes

**Data classification scheme (4-tier):**
- **L1 — Public:** BOL data, port schedules, HTS code descriptions
- **L2 — Internal:** Shipment tracking, route plans, operational data
- **L3 — Confidential:** Entry summaries, duty calculations, compliance records
- **L4 — Restricted:** Supplier pricing, financial records, UFLPA audit details

**Platform requirements:**
- Encryption at rest (AES-256) and in transit (TLS 1.3)
- Role-Based Access Control (RBAC) with Attribute-Based Access Control (ABAC)
- Audit logging for all data access
- Multi-tenant data isolation (if serving multiple importers)
- Data retention scheduler balancing CBP 5-year rule with GDPR minimization
- Supplier pricing data — never exposed in reports shared with third parties

---

## 12. Cross-Reference Matrix

How the 11 regulatory areas interact:

| Area | Intersects With | Key Interaction |
|------|----------------|-----------------|
| **ISF** | Bonding, Record Retention | ISF requires bond; ISF records retained 5 years |
| **FTZ** | Section 301, Section 232, Record Retention | Mandatory PF status for 301/232 goods; FTZ records 5 years |
| **Section 301** | FTZ, Bonding, UFLPA, Country of Origin | Higher duties → higher bonds; China shift → UFLPA risk; FTZ PF mandatory |
| **Section 232** | FTZ, Bonding | Mandatory PF in FTZs; increased bond requirements |
| **UFLPA** | Section 301, Record Retention, Data Privacy | SE Asia transshipment risk; documentation retained 5 years; supply chain data is sensitive |
| **FDA** | ISF, Record Retention | Prior notice + ISF timing; FDA records retained per 21 CFR + CBP 5 years |
| **CPSC** | Record Retention, ISF | Certificates filed with entry; test reports retained; eFiling 2026 |
| **AES/EEI** | Record Retention, Bonding | EEI records retained 5 years; USPPI must have EIN |
| **Bonding** | ISF, FTZ, Section 301/232 | Bond covers ISF; FTZ operator bond separate; tariffs increase bond amounts |
| **Record Retention** | ALL areas | 5-year retention applies to records from all other areas |
| **Data Privacy** | Record Retention, UFLPA | Tension between retention requirements and GDPR minimization |

---

## 13. Penalty Summary

| Regulation | Violation | Maximum Penalty |
|-----------|-----------|-----------------|
| **ISF** | Late/inaccurate filing | $5,000-$10,000 per violation |
| **FTZ** | Unauthorized removal | Duties + penalties + potential criminal |
| **Section 301** | Tariff evasion/circumvention | 4x unpaid duties + criminal prosecution |
| **Section 232** | Evasion | Similar to 301 |
| **UFLPA** | Importing forced labor goods | Seizure + up to domestic value (civil) + 20 years (criminal) |
| **FDA** | Import violations | Detention, refusal, injunction, criminal prosecution |
| **CPSC** | Failure to report/certify | Up to $17.15M civil; criminal penalties |
| **AES/EEI** | Failure to file / false info | Up to $364,992/violation (civil); $1M + 10 years (criminal) |
| **Record Retention** | Failure to maintain records | $100,000 per willful violation; $10,000 per negligent |
| **Customs Fraud (general)** | 19 USC 1592 | Domestic value of goods (fraud); 4x lost revenue (gross negligence) |

---

## 14. Platform Implementation Priority

Based on the founder's business (cold chain exports + SE Asia consumer goods imports):

| Priority | Area | Rationale |
|----------|------|-----------|
| **P0 — Critical** | ISF filing tracker | Every import requires ISF; $5K penalty per miss |
| **P0 — Critical** | HTS classification + duty calculator | Foundation for all tariff/FTZ calculations |
| **P0 — Critical** | Bonding calculator | Importers need to know bond requirements |
| **P1 — High** | FTZ savings analyzer | #1 differentiator; complex calculations |
| **P1 — High** | Section 301/232 tariff engine | Drives duty calculations and FTZ strategy |
| **P1 — High** | UFLPA compliance tracker | Critical for SE Asia apparel/CPG sourcing |
| **P1 — High** | Record retention system | Legal requirement; document management core |
| **P2 — Medium** | AES/EEI filing tracker | Relevant to cold chain export business |
| **P2 — Medium** | FDA import requirements checker | Required for food/supplement imports |
| **P2 — Medium** | CPSC compliance checker | Required for consumer product imports |
| **P3 — Future** | Data privacy framework | Important for multi-tenant platform (v2+) |
| **P3 — Future** | Full compliance audit dashboard | Aggregates all compliance areas |

### Compliance-Aware Landed Cost Formula

```
Total Landed Cost =
  Product Cost (FOB)
  + Ocean Freight
  + Insurance (0.5-2% of CIF value)
  + Customs Duty (HTS rate × dutiable value, including Section 301/232 if applicable)
  + MPF (0.3464% of entered value, min $31.67, max $614.35)
  + HMF (0.125% of cargo value for ocean imports)
  + ISF Filing Fee ($25-75)
  + Customs Broker Fee ($150-300 per entry)
  + Bond Cost (prorated: annual premium / number of entries)
  + Drayage (port to warehouse: $300-800)
  + Demurrage/Detention (if applicable: $100-400/day)
  + CBP Exam Fees (if selected: $300-3,000)
  + FDA/CPSC Filing Fees (if applicable)
  + Warehouse/FTZ Storage (if applicable)
  + Fulfillment/Distribution
  = Total Landed Cost per Unit
```

---

## Sources

### ISF
- [19 CFR Part 149 — Importer Security Filing](https://www.ecfr.gov/current/title-19/chapter-I/part-149)
- [CBP ISF Overview](https://www.cbp.gov/border-security/ports-entry/cargo-security/importer-security-filing-102)
- [CBP ISF Penalties](https://www.cbp.gov/trade/basic-import-export/importer-security-filing-102/isf-penalties)

### FTZ
- [19 CFR Part 146 — Foreign Trade Zones](https://www.ecfr.gov/current/title-19/chapter-I/part-146)
- [OFIS FTZ Database](https://ofis.trade.gov/)
- [Foreign-Trade Zones Board](https://enforcement.trade.gov/ftzpage/)
- [CBP FTZ Manual](https://www.cbp.gov/trade/priority-issues/trade-agreements/free-trade-agreements/general-rules-origin)

### Section 301
- [USTR Section 301 — China](https://ustr.gov/issue-areas/enforcement/section-301-investigations/tariff-actions)
- [Federal Register — Section 301 Tariff Actions](https://www.federalregister.gov/documents/search?conditions%5Bagencies%5D%5B%5D=trade-representative)

### Section 201 & 232
- [BIS Section 232 Information](https://www.bis.gov/232)
- [CBP Section 232 Tariffs on Steel and Aluminum](https://www.cbp.gov/trade/priority-issues/trade-agreements)

### Bonding
- [CBP Bond Information](https://www.cbp.gov/trade/priority-issues/bonds)
- [19 CFR Part 113 — CBP Bonds](https://www.ecfr.gov/current/title-19/chapter-I/part-113)

### Record Retention
- [19 CFR Part 163 — Recordkeeping](https://www.ecfr.gov/current/title-19/chapter-I/part-163)
- [19 USC 1508 — Recordkeeping](https://www.law.cornell.edu/uscode/text/19/1508)
- [19 USC 1509 — Penalties](https://www.law.cornell.edu/uscode/text/19/1509)
- [CBP Recordkeeping Publication](https://www.cbp.gov/document/publications/recordkeeping)

### Data Privacy
- [CCPA/CPRA](https://oag.ca.gov/privacy/ccpa)
- [GDPR Official Text](https://gdpr-info.eu/)
- [19 CFR Part 103 — Confidential Business Information](https://www.ecfr.gov/current/title-19/chapter-I/part-103)
- [C-TPAT Minimum Security Criteria](https://www.cbp.gov/border-security/ports-entry/cargo-security/ctpat)

### UFLPA
- [CBP UFLPA Overview](https://www.cbp.gov/trade/forced-labor/UFLPA)
- [CBP UFLPA FAQs](https://www.cbp.gov/trade/forced-labor/faqs-uflpa-enforcement)
- [DHS 2025 Strategy Update](https://www.dhs.gov/2025-updates-strategy-prevent-importation-goods-mined-produced-or-manufactured-forced-labor-peoples)
- [DHS UFLPA Entity List](https://www.dhs.gov/uflpa-entity-list)
- [State Department UFLPA Fact Sheet](https://www.state.gov/office-to-monitor-and-combat-trafficking-in-persons/releases/2025/01/uyghur-forced-labor-prevention-act-uflpa-fact-sheet)
- [CBP UFLPA Statistics](https://www.cbp.gov/newsroom/stats/trade/uyghur-forced-labor-prevention-act-statistics)
- [CBP Operational Guidance for Importers](https://www.cbp.gov/document/guidance/uflpa-operational-guidance-importers)
- [NQC — UFLPA Compliance 2026 Strategy](https://nqc.com/blog/uflpa-compliance-how-to-build-a-supply-chain-that-can-withstand-global-scrutiny)
- [Braumiller Law — Supply Chain Tracing Requirements](https://www.braumillerlaw.com/forced-labor-supply-chain-tracing-requirements-comply-uyghur-forced-labor-prevention-act/)
- [Vietnam Briefing — UFLPA Impact on Vietnam](https://www.vietnam-briefing.com/news/impact-of-the-uyghur-forced-labor-prevention-act-on-vietnam-exports-to-the-us.html/)
- [Oritain — Fiber Fraud and Transshipments](https://oritain.com/resources/blog/rise-of-fiber-fraud-lifting-the-lid-on-fashion-transshipments)
- [Miller & Chevalier — UFLPA 2024 Year in Review](https://www.millerchevalier.com/publication/trade-compliance-flash-uflpa-enforcement-2024-year-review)
- [19 U.S.C. 1307](https://www.law.cornell.edu/uscode/text/19/1307)

### FDA
- [FDA FSVP Final Rule](https://www.fda.gov/food/food-safety-modernization-act-fsma/fsma-final-rule-foreign-supplier-verification-programs-fsvp-importers-food-humans-and-animals)
- [21 CFR Part 1 Subpart L — FSVP](https://www.ecfr.gov/current/title-21/chapter-I/subchapter-A/part-1/subpart-L)
- [21 CFR Part 1 Subpart I — Prior Notice](https://www.ecfr.gov/current/title-21/chapter-I/subchapter-A/part-1/subpart-I)
- [FDA Prior Notice Overview](https://cacmap.fda.gov/food/importing-food-products-united-states/prior-notice-imported-foods-overview-and-background)
- [FDA Food Facility Registration](https://www.fda.gov/food/guidance-regulation-food-and-dietary-supplements/registration-food-facilities-and-other-submissions)
- [FDA MoCRA Guidance — Registration and Listing](https://www.fda.gov/regulatory-information/search-fda-guidance-documents/guidance-industry-registration-and-listing-cosmetic-product-facilities-and-products)
- [FDA Import Alerts](https://www.fda.gov/industry/actions-enforcement/import-alerts)
- [FDA Dietary Supplements Q&A](https://www.fda.gov/food/information-consumers-using-dietary-supplements/questions-and-answers-dietary-supplements)
- [21 CFR 101.36 — Supplement Facts Labeling](https://www.law.cornell.edu/cfr/text/21/101.36)
- [21 CFR 101.93 — DSHEA Statements](https://www.ecfr.gov/current/title-21/chapter-I/subchapter-B/part-101/subpart-F/section-101.93)
- [ArentFox Schiff — MoCRA Requirements 2025](https://www.afslaw.com/perspectives/alerts/new-year-same-mocra-fda-cosmetic-requirements-january-1-2025)

### CPSC
- [CPSC GCC Overview](https://www.cpsc.gov/Business--Manufacturing/Testing-Certification/General-Certificate-of-Conformity)
- [CPSC CPC Overview](https://www.cpsc.gov/Business--Manufacturing/Testing-Certification/Childrens-Product-Certificate)
- [CPSC eFiling Rule — Federal Register (Jan 8, 2025)](https://www.federalregister.gov/documents/2025/01/08/2024-30826/certificates-of-compliance)
- [CPSC Phthalates Business Guidance](https://www.cpsc.gov/Business--Manufacturing/Business-Education/Business-Guidance/Phthalates)
- [16 CFR Part 1307 — Phthalate Prohibitions](https://www.ecfr.gov/current/title-16/chapter-II/subchapter-B/part-1307)
- [CPSC Flammable Fabrics Act](https://www.cpsc.gov/Business--Manufacturing/Business-Education/Business-Guidance/Flammable-Fabrics-Act)
- [16 CFR Part 1115 — Substantial Product Hazard Reports](https://www.ecfr.gov/current/title-16/chapter-II/subchapter-B/part-1115)
- [CPSC Duty to Report](https://www.cpsc.gov/Business--Manufacturing/Recall-Guidance/Duty-to-Report-to-CPSC-Rights-and-Responsibilities-of-Businesses)
- [16 CFR Part 1130 — Product Registration Cards](https://www.ecfr.gov/current/title-16/chapter-II/subchapter-B/part-1130)
- [CPSC Strategic Plan 2023-2026](https://www.cpsc.gov/s3fs-public/Strategic-Plan-2023-2026-revised-02-25-25.pdf)
- [SGS — CPSC eFiling Q&A](https://www.sgs.com/en-us/news/2026/01/cc-2025-q4-are-you-ready-for-cpsc-efiling-your-questions-answered)
- [Stinson LLP — CPSC eFiling Rule](https://www.stinson.com/newsroom-publications-get-your-certificates-ready-for-the-cpsc-efiling-rule-for-imported-consumer-products)

### AES/EEI
- [Trade.gov — Filing Through AES](https://www.trade.gov/filing-your-export-shipments-through-automated-export-system-aes)
- [15 CFR Part 30 — Foreign Trade Regulations](https://www.ecfr.gov/current/title-15/subtitle-B/chapter-I/part-30)
- [15 CFR 30.4 — Filing Procedures and Deadlines](https://www.ecfr.gov/current/title-15/subtitle-B/chapter-I/part-30/subpart-A/section-30.4)
- [15 CFR Part 30 Subpart D — Exemptions](https://www.ecfr.gov/current/title-15/subtitle-B/chapter-I/part-30/subpart-D)
- [15 CFR 30.3 — Routed Transactions](https://www.ecfr.gov/current/title-15/subtitle-B/chapter-I/part-30/subpart-A/section-30.3)
- [Census Bureau Schedule B](https://www.census.gov/foreign-trade/schedules/b/index.html)
- [Trade.gov — EEI Overview](https://www.trade.gov/electronic-export-information-eei)
- [CrimsonLogic — AES Filing Requirements Checklist](https://crimsonlogic-northamerica.com/do-i-need-to-file-aes-eei-export-filing-requirements-checklist-for-u-s-exporters/)
- [Census Bureau AES Postdeparture Filing](https://www.census.gov/foreign-trade/aes/post-departure.html)
- [15 CFR Part 758 — EAR Export Clearance](https://www.bis.gov/ear/title-15/subtitle-b/chapter-vii/subchapter-c/part-758/ss-7581-electronic-export-information-eei)
- [GoFreight — Complete AES Guide 2026](https://gofreight.com/blog/solution/complete-guide-aes-2020.html)

---

*Researched 2026-03-26. This document provides regulatory research for platform development purposes. It is NOT legal advice. Consult qualified trade counsel for compliance determinations on specific transactions.*

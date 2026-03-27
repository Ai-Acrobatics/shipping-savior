# Regulatory & Compliance Research
# Shipping Savior — International Freight & Customs Platform

**Researched:** 2026-03-26
**Linear Issue:** AI-5405
**Scope:** US import/export regulations, tariff systems, FTZ rules, export controls, product-specific regs, licensing, and platform compliance obligations

---

## Table of Contents

1. [US Import Regulations](#1-us-import-regulations)
2. [Tariff Systems](#2-tariff-systems)
3. [Foreign Trade Zone (FTZ) Regulations](#3-foreign-trade-zone-ftz-regulations)
4. [Export Controls](#4-export-controls)
5. [Product-Specific Regulations](#5-product-specific-regulations)
6. [Documentation Requirements](#6-documentation-requirements)
7. [Licensing Requirements](#7-licensing-requirements)
8. [Platform Compliance Obligations](#8-platform-compliance-obligations)
9. [Data & Electronic Filing Regulations](#9-data--electronic-filing-regulations)
10. [Key Regulatory Agencies](#10-key-regulatory-agencies)
11. [Compliance Calendar & Filing Deadlines](#11-compliance-calendar--filing-deadlines)
12. [Risk Areas & Prohibited Platform Activities](#12-risk-areas--prohibited-platform-activities)
13. [Recommended Legal Disclaimers](#13-recommended-legal-disclaimers)
14. [Record Retention Requirements](#14-record-retention-requirements)
15. [UFLPA & Forced Labor Compliance](#15-uflpa--forced-labor-compliance)
16. [Data Privacy Considerations](#16-data-privacy-considerations)
17. [Implementation Notes for Platform](#17-implementation-notes-for-platform)

---

## 1. US Import Regulations

### 1.1 Customs and Border Protection (CBP) Overview

US Customs and Border Protection (CBP), under the Department of Homeland Security (DHS), is the primary agency regulating all goods entering the United States. CBP enforces:

- Tariff Act of 1930 (19 USC) — the foundational customs law
- Trade Facilitation and Trade Enforcement Act of 2015 (TFTEA)
- Homeland Security Act of 2002 (security filing requirements)

All commercial importations must be declared to CBP. The importer of record (IOR) is legally responsible for the accuracy of all declarations, payment of duties, and compliance with all applicable laws — regardless of whether a customs broker is used.

### 1.2 Importer Security Filing (ISF) — The 10+2 Rule

**Regulatory Authority:** 19 CFR Part 149
**Governing Statute:** Security and Accountability for Every Port Act (SAFE Port Act) of 2006

ISF is a mandatory pre-shipment data filing requirement for ocean cargo entering the US. It was phased in 2009–2010.

#### What Is ISF?

The "10+2" moniker refers to 10 data elements from the importer and 2 from the carrier:

**10 Importer Elements:**
1. **Manufacturer (or supplier) name and address** — entity that last manufactures, assembles, produces, or grows the commodity
2. **Seller (or owner) name and address** — last known entity by whom goods are sold or agreed to be sold
3. **Buyer (or owner) name and address** — last known entity to whom the goods are sold or agreed to be sold
4. **Ship-to name and address** — first US delivery address
5. **Container stuffing location** — physical address of the stuffing location
6. **Consolidator (stuffer) name and address** — party who stuffed the container
7. **Importer of record number** — IRS EIN or SSN (US importer's tax ID)
8. **Consignee number** — CBP-assigned number or IRS EIN
9. **Country of origin** — country where goods were grown, manufactured, or produced
10. **Commodity HTS number** — 6-digit HTS code (first 6 digits sufficient for ISF)

**2 Carrier Elements (submitted by vessel operator):**
1. **Vessel stow plan** — where containers are stowed on the vessel
2. **Container status messages** — container movement events

#### ISF Filing Deadlines

| ISF Type | Cargo Type | Deadline |
|----------|-----------|----------|
| ISF-10 | Full container load (FCL) and LCL cargo | 24 hours BEFORE cargo is laden aboard vessel at foreign port |
| ISF-5 | Bulk, break-bulk, and certain other cargo | 24 hours BEFORE vessel arrival at first US port |

**Critical:** The 24-hour rule applies to LADING, not vessel departure. For LCL cargo consolidated at a CFS, the deadline is 24 hours before the consolidator loads the goods onto the vessel.

#### ISF Penalties

CBP may issue a liquidated damages claim (not a fine) against the ISF bond:
- **Late filing:** Up to $5,000 per shipment
- **Inaccurate/incomplete ISF:** Up to $5,000 per shipment
- **No ISF filed:** Up to $10,000 per shipment; cargo may be refused unloading or subject to "do not load" order

CBP uses an automated targeting system (ATS) that scores ISF risk. Non-compliance triggers intensive examination (X-ray, physical inspection) which adds cost and delay.

#### ISF Bond Requirement

An ISF bond (surety bond) is required to file ISF. Options:
- **Continuous bond** — covers all shipments for one year; amount = 10% of duties/taxes paid prior year (minimum $50,000)
- **Single entry bond** — covers one shipment; amount = 3x value of goods + duties (minimum $100)

The ISF filer (importer or their licensed customs broker) must maintain a bond.

### 1.3 Entry Types

CBP classifies entries based on the value and nature of the goods:

#### Informal Entry (19 CFR Part 143)

- **Threshold:** Commercial goods valued at $2,500 or less (as of 2024 — verify current threshold)
- **Process:** Simplified paperwork; CBP Form 7501 not required for all informal entries
- **Who uses it:** Low-value commercial shipments, personal importations
- **Duty payment:** Collected at time of entry
- **No bond required** for most informal entries under $2,500

#### Formal Entry (19 CFR Part 141)

- **Threshold:** Commercial goods valued over $2,500, OR goods subject to quota/license requirements regardless of value, OR certain regulated goods (food, drugs, etc.)
- **Process:** Full CBP entry package (see Section 6 for documentation); CBP Form 7501 Entry Summary
- **Who can file:** Only the importer of record or a licensed customs broker (19 USC 1641)
- **Duty payment:** Duty is typically liquidated within 314 days of entry (can be extended)
- **Bond required:** Continuous bond recommended for frequent importers

#### Special Entry Types

| Type | Use Case |
|------|----------|
| **Type 01** | Consumption entry — most common; goods enter US commerce directly |
| **Type 03** | Consumption entry — quota goods |
| **Type 06** | FTZ consumption entry — goods withdrawn from FTZ into US commerce |
| **Type 21** | Warehouse entry — goods stored in bonded warehouse; duties deferred |
| **Type 22** | Re-warehouse entry |
| **Type 23** | Temporary importation under bond (TIB) |
| **Type 11** | Informal entry |
| **Type 52** | Drawback — refund of duties on re-exported goods |

**For Shipping Savior context:** The founder's FTZ strategy primarily uses Type 06 (FTZ withdrawal) for incremental pallet releases.

### 1.4 Customs Bonds

**Regulatory Authority:** 19 CFR Part 113

A customs bond is a contract among three parties: the principal (importer), the surety (insurance company), and CBP. The bond guarantees payment of duties, taxes, and fees.

**Types:**

| Bond Type | Code | Use |
|-----------|------|-----|
| Continuous import bond | CF 301 | All formal entries for 12 months; most efficient for regular importers |
| Single entry bond | CF 301 | One shipment only |
| FTZ operator bond | CF 301 (activity code 4) | Required for FTZ operators |
| Custodian bond | CF 301 | For bonded warehouses, CFS operators |

**Continuous Bond Amount Calculation:**
- Must equal 10% of duties, taxes, and fees paid in prior 12 months
- Minimum: $50,000
- No maximum (large importers may carry $1M+ bonds)

**Bond on File Requirements:**
- CBP Form CF 301 filed with CBP's Revenue Division
- Bond must be approved before first entry is filed under it
- Annual renewal or continuous bond with annual premium

---

## 2. Tariff Systems

### 2.1 Harmonized Tariff Schedule (HTS)

**Authority:** US International Trade Commission (USITC); enforced by CBP
**Statute:** Omnibus Trade and Competitiveness Act of 1988 (19 USC 3007)
**Source:** hts.usitc.gov (updated periodically; major updates January 1 each year)

#### HTS Code Structure

The US HTS is a 10-digit classification system derived from the 6-digit international Harmonized System (HS):

```
XXXX.XX.XXXX
│    │  │
│    │  └── US-specific statistical suffix (digits 9-10)
│    └────── US-specific subheading (digits 7-8)
└─────────── HS heading + subheading (digits 1-6, internationally standardized)
```

**Example: Men's cotton dress shirts**
- `6205.20.2000` — Chapter 62 (Not knitted/crocheted garments), Heading 6205 (Men's shirts), Subheading .20 (cotton), US suffix .20.2000

**Key Chapter Groups Relevant to Shipping Savior:**

| HS Chapter | Category |
|------------|----------|
| 01–05 | Live animals and animal products |
| 06–14 | Vegetable products |
| 16–24 | Prepared foodstuffs, beverages |
| 39–40 | Plastics and rubber |
| 50–63 | Textiles and apparel |
| 61–62 | Knitted vs. woven apparel (critical distinction) |
| 64 | Footwear |
| 84–85 | Machinery and electronics |
| 87 | Vehicles and auto parts |
| 90 | Optical, medical instruments |

#### Finding the Correct HTS Code

1. Identify the essential character of the goods
2. Use GRI (General Rules of Interpretation) — 6 hierarchical rules for classification
3. Look up in Schedule B for exports or HTS for imports
4. Confirm with CBP CROSS (Customs Rulings Online Search System) for binding rulings
5. Verify against carrier's description on bill of lading

**PLATFORM NOTE:** The HTS code lookup tool must clearly state the data vintage date and include a disclaimer that the tool provides guidance only — correct classification requires a licensed customs broker or binding ruling from CBP.

#### General Rate of Duty (MFN/NTR)

Most Favored Nation (MFN) rates, also called Normal Trade Relations (NTR), apply to goods from WTO member countries. These are the base duty rates in Column 1 of the HTS.

Common rates for SE Asia consumer goods:
- Apparel (cotton, Chapter 61/62): 12–32%
- Footwear (Chapter 64): 6–37.5% (highly variable)
- Electronics (Chapter 84/85): 0–4.9% (many duty-free under IT Agreement)
- Plastics/consumer goods (Chapter 39): 3–6.5%
- Food products: 0–20% + sometimes unit-based duties

### 2.2 Section 301 Tariffs (China)

**Authority:** Section 301 of the Trade Act of 1974; USTR administers
**Current Status:** As of 2026, Section 301 tariffs on Chinese goods remain in force and are subject to ongoing USTR review

#### Four Lists of Section 301 Tariffs

| List | Products | Rate (as of 2025–2026) |
|------|---------|----------------------|
| List 1 | Industrial/tech goods (~$34B) | 25% |
| List 2 | Industrial/aerospace/chemicals (~$16B) | 25% |
| List 3 | Consumer goods, textiles (~$200B) | 25% (raised from 10% in 2019) |
| List 4A | Consumer goods, apparel (~$120B) | 7.5–25% (suspended 4B) |

**CRITICAL for Shipping Savior:** List 3 and 4A cover most SE Asia consumer goods categories (apparel, CPG, electronics accessories). These 25% surcharges stack on top of the MFN rate.

**Example Duty Stack on Chinese Apparel:**
- MFN duty: 16% (cotton shirts, HTS 6205.20)
- Section 301 List 3 surcharge: 25%
- **Total effective rate: 41%** on the declared value

#### Section 301 Exclusions

USTR has granted product-specific exclusions (temporary waivers) for certain HTS codes. Exclusions:
- Are product-specific and company-specific (some)
- Have expiration dates — must be monitored
- Can be applied retroactively if cargo arrived during the exclusion period
- Filed via USTR exclusion portal

**PLATFORM RISK:** Failing to track exclusion expirations is a major pitfall. A duty calculator that applies a Section 301 exclusion that has since expired gives inaccurate results.

#### Section 301 China-to-SE-Asia Shift

As importers shift sourcing from China to Vietnam, Cambodia, Indonesia, Thailand to avoid Section 301:
- Goods must satisfy Rules of Origin (substantial transformation) to qualify for non-China origin
- **Transshipment through China remains subject to 301 tariffs** — origin is where goods are substantially transformed, not last port of shipment
- Vietnam, Cambodia have their own MFN rates (no Section 301 surcharge) but USTR has investigated "tariff circumvention" (goods assembled in SE Asia from Chinese components)
- **HTS country of origin determination is fact-specific and subject to audit** — platform must emphasize this complexity

### 2.3 Section 232 Tariffs (Steel & Aluminum)

**Authority:** Section 232 of Trade Expansion Act of 1962; administered by Department of Commerce
**Triggering Statute:** National security grounds

| Material | Rate | Notes |
|----------|------|-------|
| Steel mill products | 25% | HTS Chapter 72, 73 |
| Aluminum and products | 10% | HTS Chapter 76 |
| Derivative steel/aluminum articles | Varies | Autos, appliances, containers |

**Relevant to Shipping Savior context:** Most SE Asia consumer goods (apparel, CPG) are not subject to Section 232. However, if the platform expands to machinery or metal-intensive goods, Section 232 applies.

Country-specific exemptions exist (Canada, Mexico under USMCA quota arrangement; EU, UK with TRQ).

### 2.4 Section 201 Tariffs (Safeguards)

**Authority:** Section 201 Trade Act of 1974 (global safeguard)
**Active cases as of 2026:**
- **Solar panels/cells:** Duties implemented 2018; reduced and modified over time; STILL ACTIVE under various Section 201/301 stacking
- **Large residential washers:** Initial term largely expired

Section 201 applies to all countries (including those with FTAs unless excluded). Less relevant for SE Asia CPG/apparel but important for any electronics/clean energy component sourcing.

### 2.5 Generalized System of Preferences (GSP)

**Status as of 2026:** GSP lapsed December 31, 2020. As of early 2026, Congress has NOT renewed GSP. Any platform calculator must flag this clearly.

When active, GSP provided duty-free treatment for eligible goods from developing countries:
- ~120 beneficiary countries including Indonesia, Cambodia, Philippines, Thailand
- Covered ~3,500 HTS subheadings
- NOT applicable to goods from China (regardless of GSP status)

**PLATFORM IMPLICATION:** Do not show GSP rates as active. Display "GSP LAPSED — Verify with CBP" for any GSP-eligible code. Include a link to USTR GSP page.

### 2.6 Free Trade Agreements (FTAs) Relevant to SE Asia

| Agreement | Countries | Status |
|-----------|-----------|--------|
| KORUS | South Korea | Active — many goods duty-free or reduced |
| US-Singapore FTA | Singapore | Active — most goods duty-free |
| US-Australia FTA | Australia | Active |
| USMCA | Canada, Mexico | Active — replaces NAFTA |
| CPTPP | Vietnam, Malaysia, etc. | US is NOT a member (withdrew 2017) |
| IPEF | SE Asia | Framework only — no duty preferences |

**NOTE:** Vietnam, Indonesia, Thailand, Cambodia, and India have NO FTA with the US. Goods from these countries pay full MFN rates plus any applicable Section 301/232 tariffs.

---

## 3. Foreign Trade Zone (FTZ) Regulations

### 3.1 Regulatory Framework

**Primary Authority:** Foreign-Trade Zones Act of 1934 (19 USC 81a–81u)
**CBP Regulations:** 19 CFR Part 146
**FTZ Board Regulations:** 15 CFR Part 400
**Administering Agencies:**
- **FTZ Board** (within Department of Commerce) — grants zone authority, approves activations, reviews applications
- **CBP** — port director has enforcement authority within zones; reviews operator activation

### 3.2 FTZ Board Requirements

#### Zone Types

**General Purpose Zones (GPZ)**
- Large designated areas (typically at or near airports/seaports)
- Multiple operators and users within the zone
- **Examples:** Port of Long Beach FTZ 50, Port of Los Angeles FTZ 202
- Grant covers a geographic area; individual sites within must be activated separately

**Subzones**
- Single-company dedicated facilities, typically manufacturing plants
- Used when a company cannot reasonably move to a general purpose zone
- Must be sponsored by the FTZ grantee (usually port authority)
- **Examples:** Auto manufacturers, refineries, semiconductor fabs

**Usage-Driven Sites (Alternative Site Framework — ASF)**
- Newer category under 2012 FTZ Board rule revision (15 CFR 400)
- Companies can request to bring a site into the zone quickly (30-day approval vs. 12+ months for traditional)
- Allows FTZ benefits without being at or near a traditional FTZ site
- **Most relevant for Shipping Savior strategy** — if founder wants FTZ benefits at a specific warehouse

#### FTZ Board Application Process

1. **Identify sponsoring grantee** — every zone must have a government-authorized grantee (port authority, Economic Development Corp., etc.)
2. **Submit FTZ Board application** — if applying for new zone or subzone; includes economic justification, job creation, community impact
3. **Public comment period** — 40 days
4. **FTZ Board decision** — typically 3–12 months for new grants
5. **CBP activation** — separate process after Board grant; required before zone can operate

**For Shipping Savior platform:** The platform user likely uses an EXISTING activated FTZ (bonded warehouse within a general purpose zone), not applying for a new zone. Focus platform content on how to access and use existing FTZs.

### 3.3 CBP FTZ Requirements (19 CFR Part 146)

#### FTZ Operator vs. FTZ User

| Role | Description | Requirements |
|------|-------------|--------------|
| **FTZ Operator** | Entity that operates the zone facility | CBP activation, operator bond, systems approval, annual report |
| **FTZ User** | Entity that stores/processes merchandise in the zone | Agreement with operator, merchandise admission records, inventory control |

For Shipping Savior's use case (founder stores/withdraws inventory), the founder is an **FTZ User** operating within an established General Purpose Zone.

#### CBP Activation Requirements for Operators

- **Application to CBP Port Director:** CBP Form 216 (Application for FTZ Admission/Status Designation)
- **Operator Bond:** Continuous bond; amount determined by Port Director based on risk
- **Inventory Control & Recordkeeping System (ICRS):** CBP must approve the system; must track every admission, manipulation, transformation, and withdrawal
- **Physical requirements:** Zone must be delineated (fenced, marked); access controls must meet CBP standards

#### Merchandise Admission to FTZ

All merchandise entering the FTZ must be admitted under a status:
- **Privileged Foreign Status (PFS):** Duty rate locked at time of admission (date of entry into zone)
- **Non-Privileged Foreign Status (NPFS):** Duty calculated at rate in effect at time of withdrawal from zone
- **Domestic Status:** US goods returned to zone (no duty upon withdrawal)

**KEY FTZ STRATEGY FOR SHIPPING SAVIOR:**
The founder's FTZ strategy uses Privileged Foreign Status:
- Cargo enters FTZ → duty rate locked at admission date rate
- If tariffs increase AFTER admission, the locked rate applies
- Incremental pallet withdrawals → duty paid only on units withdrawn, at the locked rate
- Remaining inventory continues to accumulate interest-free, duty-deferred

**Duty Rate Locking — The Core Benefit:**

```
Example:
- 100,000 units enter FTZ → rate locked at 25%
- Government raises tariff to 35% one month later
- Importer withdraws 10,000 units in Month 2 → pays 25% (locked rate), not 35%
- Importer withdraws 10,000 units in Month 6 → still pays 25%
- Importer withdraws 10,000 units in Month 12 → still pays 25%
```

#### Weekly Entry for FTZ Withdrawals

- FTZ users can file **weekly entries** (CBP Form 7501 Entry Summary) covering all withdrawals in a 7-day period
- Each withdrawal creates a separate entry line, but one payment covers the week
- Benefit: Reduced broker fees and administrative burden vs. daily entry filing
- Requirement: Importer must have an approved weekly entry permit from CBP

#### FTZ Annual Reporting Requirements

FTZ operators must file an Annual FTZ Activity Report with the FTZ Board by March 31 each year:
- Merchandise admitted, manipulated, manufactured, exported, destroyed, transferred
- Zone value statistics
- Employment data
- Failure to file can result in zone suspension

### 3.4 FTZ Benefits Summary

| Benefit | Mechanism | Value to Shipping Savior |
|---------|-----------|--------------------------|
| Duty deferral | Pay duties only when goods exit FTZ into US commerce | Cash flow benefit on large inventory |
| Duty rate election | PFS locks rate at admission date | Protection against tariff increases |
| Duty on waste/scrap | Not assessed on manufacturing waste within zone | Manufacturing FTZ operations |
| Inverted tariff | Manufacturer can choose lower of: duty on inputs OR duty on finished product | Manufacturing operations only |
| Quota relief | FTZ allows accumulation beyond quota; pay quota duties on withdrawal | Apparel/textile categories with quota |
| Weekly entry | Batch entries reduce broker fees | Cost reduction on frequent withdrawals |
| No duty on re-exports | Goods can be exported from FTZ without paying US duties | If founder exports to third countries |

---

## 4. Export Controls

### 4.1 Export Administration Regulations (EAR)

**Authority:** Bureau of Industry and Security (BIS), Department of Commerce
**Regulation:** 15 CFR Parts 730–774
**Statute:** Export Control Reform Act of 2018 (ECRA)

#### What EAR Controls

EAR covers "dual-use" items — goods, software, and technology with both commercial and potential military applications. Not all exports require a license, but all exporters must screen for EAR compliance.

**EAR Control Structure:**
1. **Commerce Control List (CCL):** 10 categories (0–9) of controlled items by Export Control Classification Number (ECCN)
2. **Reasons for Control (RFCs):** AT (Anti-Terrorism), NS (National Security), NP (Non-Proliferation), etc.
3. **Country Chart:** Matrix of countries vs. control reasons — shows when license is required
4. **License Exceptions:** Exceptions that authorize export without a license (LVS, GBS, TMP, etc.)

**Common ECCN Categories for Consumer Goods:**
- **EAR99:** No ECCN assigned — most commercial consumer goods. Generally no license required except to embargoed countries.
- **5A002:** Encryption items (many consumer electronics)
- **5D002:** Encryption software
- **2B001:** Machine tools

**For Shipping Savior context:** Most SE Asia apparel/CPG imports from SE Asia back to the US, or US exports of agricultural goods, are **EAR99** — no export license required unless destination is embargoed. However, exports of cold chain technology, specialized freezing equipment, or certain electronics components could require BIS review.

#### ECCN Determination Process

1. Review the product's technical parameters against CCL entries
2. If no CCL match → classify as EAR99
3. If EAR99 → check Country Chart for destination country restrictions
4. Check denied parties lists regardless of ECCN

### 4.2 ITAR Basics

**Authority:** Directorate of Defense Trade Controls (DDTC), State Department
**Regulation:** 22 CFR Parts 120–130
**Statute:** Arms Export Control Act (AECA)

ITAR controls defense articles, services, and related technical data on the US Munitions List (USML). **Unlikely to be relevant to Shipping Savior's primary operations** (food exports, SE Asia CPG imports). However:

- Any freight forwarder or logistics platform must screen cargo to ensure ITAR-controlled items are not being shipped without proper licenses
- **Platform should include a disclaimer** that ITAR-controlled goods cannot be processed through the platform without proper DDTC licensing

### 4.3 OFAC Sanctions Screening

**Authority:** Office of Foreign Assets Control (OFAC), Department of Treasury
**Key Programs:**
- **SDN List (Specially Designated Nationals):** Over 9,000 entities; US persons prohibited from transactions
- **Comprehensive embargoes:** Cuba, Iran, North Korea, Syria, Russia (enhanced), Belarus (enhanced)
- **Sectoral sanctions:** Certain industries in Russia, Ukraine (DNR/LNR)

**MANDATORY for any logistics platform:** All parties in a transaction must be screened:
- Buyer, seller, shipper, consignee, freight forwarder, bank, vessel
- Country of origin and destination
- Vessel flag state

**Screening Frequency:** Must screen at each transaction (not just onboarding). A party clean today may be added to SDN list tomorrow.

**Tools:**
- OFAC's official SDN search tool (free)
- Commercial screening APIs: World-Check (Refinitiv), Dow Jones Risk & Compliance, Descartes, Melissa Data
- The platform's compliance module should integrate a screening API rather than rely on manual OFAC checks

**Penalties:**
- Civil: Up to the greater of $295,141 or 2x transaction value per violation
- Criminal: Up to $1M and 20 years imprisonment per violation
- **No intent required** for civil violations — strict liability

---

## 5. Product-Specific Regulations

### 5.1 Consumer Goods & Apparel

#### CPSC — Consumer Product Safety Commission

**Statute:** Consumer Product Safety Act (CPSA), 15 USC 2051 et seq.
**Website:** cpsc.gov

The CPSC regulates consumer products to protect the public from unreasonable risk of injury. Importers are subject to the same CPSC requirements as domestic manufacturers.

**Key Requirements for Importers:**

| Requirement | Who It Applies To | Details |
|-------------|-------------------|---------|
| Testing and certification | All regulated products | Third-party testing required for children's products |
| General Certificate of Conformity (GCC) | All non-children's regulated products | Importer must issue at time of importation |
| Children's Product Certificate (CPC) | Products primarily for children ≤12 | Must be based on CPSC-accepted third-party testing lab results |
| Tracking label | Children's products | Must identify manufacturer, batch, date, country of origin |
| Recall cooperation | All products | Must notify CPSC within 24 hours of discovering substantial product hazard |

**CBP enforcement:** CPSC and CBP have an MOU. CBP detains shipments at port if product is on CPSC watch list or lacks proper certification. CPSC can also issue detention orders for specific manufacturers.

#### CPSIA — Consumer Product Safety Improvement Act (2008)

Key requirements added by CPSIA:
- **Lead limits:** Children's products — 100 ppm lead in surface coatings, 300 ppm total lead content
- **Phthalates ban:** Children's toys and child care articles — certain phthalates prohibited
- **Mandatory third-party testing:** Children's products must be tested by CPSC-accepted labs
- **Tracking labels:** Required on all children's products (Section 14(a)(5))
- **Import certificate system:** Each container of children's products must have a certificate linking it to the test report

**For Shipping Savior apparel imports:**
- Adult apparel: GCC + applicable safety standards
- Children's apparel: CPC + third-party testing + lead/phthalate compliance + flammability testing (16 CFR Part 1615/1616 for children's sleepwear)

#### FTC Labeling Requirements

**Statute:** Textile Fiber Products Identification Act; Wool Products Labeling Act; Care Labeling Rule
**Regulation:** 16 CFR Part 303 (textile), 16 CFR Part 423 (care labeling)

All textile/apparel products imported for sale in the US must have:
1. **Fiber content label:** Percentage by weight of each fiber, in descending order; generic names required (not trade names)
2. **Country of origin:** "Made in [country]" — where product was substantially transformed
3. **Manufacturer identification:** RN number (Registered Number from FTC) or WPL number, or full name
4. **Care instructions:** Permanent care label with washing, drying, ironing, bleaching, dry cleaning instructions (16 CFR Part 423)

Labels must be in English. Spanish may be added but does not substitute.

**Mislabeling penalties:**
- FTC enforcement: Civil penalties up to $51,744 per violation (2024 figure; indexed to inflation)
- CBP may detain and require relabeling before release

#### FTC Made in USA Standard

For a product to be labeled "Made in USA" (unqualified):
- "All or virtually all" must be made in the US
- Final assembly AND all significant parts and processing must occur in US
- Products that merely have minor finishing in the US do not qualify

This matters for any re-export or co-manufacturing scenarios.

### 5.2 Food & Perishables (Cold Chain)

#### FDA Import Requirements

**Authority:** Food and Drug Administration (FDA), DHHS
**Key Statutes:** Federal Food, Drug, and Cosmetic Act (FDCA); Public Health Service Act

**Mandatory FDA Prior Notice (21 CFR Part 1, Subpart I):**
All food imported or offered for import into the US must have FDA Prior Notice submitted before arrival:
- **FDA Prior Notice must be received and confirmed** before the food article arrives at the US port
- Filing window: No more than 5 days before anticipated arrival; minimum 2 hours before arrival for road shipments; minimum 4 hours before arrival for air/rail; minimum 8 hours before arrival for ocean vessels
- Submitted via PNSI (Prior Notice System Interface) or ACE (Automated Commercial Environment)

**Required Prior Notice Data Elements:**
- Submitter information
- Manufacturer name and address
- Shipper name and address
- Country of origin
- Country from which shipped
- Anticipated US entry date and location
- Article description, lot number, quantity
- Carrier (vessel, flight, truck number)

**Registration of Food Facilities:**
- Any facility that manufactures, processes, packs, or holds food for US consumption must be registered with FDA
- **Foreign supplier** must be registered; registration number required on Prior Notice
- Biennial renewal (even-numbered years in October–December)
- Failure to register: Food may be held and refused admission

#### FSMA — Food Safety Modernization Act (2011)

FSMA significantly expanded FDA's food safety authority. Key FSMA rules affecting importers:

**Foreign Supplier Verification Program (FSVP) — 21 CFR Part 1, Subpart L:**
- Every US importer of food must have an FSVP in place for each foreign supplier
- Importer must verify that the foreign supplier is producing food in compliance with US food safety standards
- FSVP elements:
  - Hazard analysis of the food
  - Evaluation of the foreign supplier's food safety performance
  - Verification activities (audit, testing, review of records, other)
  - Corrective actions
  - Periodic reanalysis (every 3 years minimum, or when new information suggests hazard)
- **FSVP Importer:** The US owner or consignee at time of entry; must be identified in ACE at time of importation

**Preventive Controls for Human Food — 21 CFR Part 117:**
- Applies to food processing facilities (including US facilities that process imported ingredients)
- Hazard analysis, preventive controls, monitoring, corrective actions, verification

**Sanitary Transportation Rule — 21 CFR Part 1, Subpart O:**
- Requirements for temperature control during transportation
- Training requirements for carriers
- **Critical for cold chain:** Refrigerated containers must maintain required temperatures; documentation required
- Shippers must specify temperature requirements in writing to carriers

#### Country of Origin Labeling (COOL) — Food

**Authority:** Agricultural Marketing Act of 1946 as amended by 2002 and 2008 Farm Bills; administered by USDA Agricultural Marketing Service (AMS)

**COOL Requirements:**
- Covered commodities must display country of origin at point of sale (retail)
- Covered commodities: muscle cuts of beef, veal, lamb, pork, chicken, goat; ground versions; fish; shellfish; perishable agricultural commodities (fresh/frozen fruits and vegetables); peanuts; pecans; macadamia nuts; ginseng

**Cold Chain Documentation for Perishables:**
| Document | Purpose |
|----------|---------|
| Phytosanitary Certificate | USDA/APHIS — fruits, vegetables, plants from foreign agriculture departments |
| Sanitary Certificate | Meat and animal products — from foreign competent authority |
| Temperature log | Continuous temperature monitoring from origin to destination |
| Chain of custody records | Who held the cargo at each point |

#### FDA HACCP for Fish and Seafood

**Regulation:** 21 CFR Part 123
- All processors (including importers acting as processors) must have HACCP plans
- Critical control points must be documented and monitored
- Records must be maintained 1 year for most seafood; 2 years for shelf-stable products

### 5.3 Electronics (FCC Certification)

**Authority:** Federal Communications Commission (FCC)
**Key Rule:** 47 CFR Part 15 (Radio Frequency Devices)
**Statute:** Communications Act of 1934; FCC rules

#### Equipment Authorization

Any electronic device that emits RF energy must be authorized by FCC before import/marketing in the US:

| Authorization Type | Use Case | Process |
|-------------------|---------|---------|
| **FCC ID (Certification)** | Intentional radiators (WiFi, Bluetooth, cellular, radio) | Third-party Telecommunications Certification Body (TCB) reviews test reports; issues FCC ID |
| **Supplier's Declaration of Conformity (SDoC)** | Unintentional radiators below certain power levels (computers, monitors, peripherals) | Manufacturer self-declares based on accredited lab testing |
| **Verification** | Low-risk devices | Manufacturer maintains test records; no submission to FCC required |

**Import/Export Rule:**
- It is unlawful to import for sale or use in the US any device that requires FCC authorization unless it is properly authorized
- CBP may detain shipments of unauthorized devices
- Exception: Personal importation (single device for personal use, not for sale)

**FCC IDs on Devices:**
- FCC ID must be permanently affixed to device
- FCC ID format: Grantee code (3-5 alphanumeric) + Product Code
- Searchable at fcc.io or fcc.gov/oet/ea/fccid

**CE Marking is NOT FCC Certification:** European CE marking does not satisfy US FCC requirements. Separate testing and authorization required.

**For Shipping Savior:** Any electronics sourced from SE Asia for US import must carry valid FCC authorization. The platform's compliance checklist for electronics imports should flag this requirement.

---

## 6. Documentation Requirements

### 6.1 Documentation Matrix by Transaction Type

| Document | Import (Ocean FCL) | Import (Air) | Export | FTZ Entry | FTZ Withdrawal |
|----------|-------------------|-------------|--------|-----------|----------------|
| Commercial Invoice | Required | Required | Required | Required | Required |
| Packing List | Required | Required | Required | Required | Required |
| Bill of Lading (OBL/Seaway) | Required (OBL) | Air Waybill | Required | Required | N/A |
| ISF (10+2) | Required | Not required | N/A | N/A | N/A |
| CBP Entry Summary (CF 7501) | Required (formal) | Required | N/A | Required | Required |
| Certificate of Origin (COO) | If claiming preference | If claiming preference | Required for some | If claiming | N/A |
| FDA Prior Notice | If food product | If food product | N/A | If food | N/A |
| Packing Declaration | For certain goods | For certain goods | N/A | N/A | N/A |
| Fumigation Certificate | If wood packing | If wood packing | N/A | N/A | N/A |
| ISPM-15 Marking | Required (wood packing) | Required | N/A | N/A | N/A |
| AES/EEI Filing (EEI) | N/A | N/A | Required >$2,500 to most destinations | N/A | N/A |
| FTZ Admission Form (CF 214) | N/A | N/A | N/A | Required | N/A |
| FTZ Withdrawal Form | N/A | N/A | N/A | N/A | Required |

### 6.2 Core Document Details

#### Commercial Invoice

Must include:
- Seller's name, address, country
- Buyer's/consignee's name, address
- Invoice number and date
- Country of origin of goods
- Ultimate country of destination
- HTS number (at least 6 digits, 10 preferred for US import)
- Full description of goods (material, grade, style, size, quantity, unit)
- Unit price, total price, currency
- Transaction terms (Incoterms: FOB, CIF, etc.)
- Any assists (tooling, dies, molds provided to the manufacturer by the buyer — dutiable)
- Related party transaction disclosure (if seller and buyer are related)

**CBP scrutiny trigger:** Transaction value that seems artificially low triggers CBP audit and potential reappraisal. CBP uses the Transaction Value method (primary) but may use alternative methods if transaction is not arm's length.

#### Packing List

Must include:
- Each package or container number/mark
- Description and quantity of contents
- Gross and net weight per package
- Dimensions of each package
- Total gross and net weight and measurement

#### Ocean Bill of Lading

Issued by ocean carrier (or NVOCC). Three types:
| Type | Negotiability | Use |
|------|--------------|-----|
| Original B/L (OBL) | Negotiable (3 originals) | Traditional trade finance; title document |
| Sea Waybill | Non-negotiable | Faster release; buyer doesn't need original |
| Telex Release | Non-negotiable | Surrender of OBL at origin; telex sent to destination |

**B/L Data Elements:**
- Shipper name and address
- Consignee name and address (or "To Order" for negotiable)
- Notify party
- Vessel name and voyage number
- Port of loading, port of discharge, place of delivery
- Container number(s) and seal number(s)
- Description of goods, marks, quantity, weight, measurement
- Freight terms (prepaid or collect)
- Date of issue
- Place of issue

#### Certificate of Origin (COO)

Used to prove the origin of goods for:
- Preferential duty rates under FTA
- Non-preferential COO for certain regulatory requirements
- Anti-dumping/countervailing duty cases

Types:
- **Generic COO:** Issued by chamber of commerce; verifies origin for non-preferential purposes
- **USMCA Certificate of Origin:** Self-certification by exporter (no third-party cert required)
- **Form A (GSP):** Required for GSP claims — currently moot since GSP lapsed
- **NAFTA/USMCA:** Specific format; due diligence required

#### ISPM-15 — Wood Packaging Material Requirements

**International Standard:** ISPM 15 (International Standards for Phytosanitary Measures)
All wood packing materials (pallets, crates, dunnage) must be:
- Heat treated (HT) to 56°C core temperature for 30 minutes, OR
- Methyl bromide fumigated (being phased out)
- Marked with official ISPM-15 mark: country code, producer code, HT or MB, and IPPC logo

**Consequence of non-compliance:** CBP/USDA-APHIS detains and requires treatment or re-export of entire container, at importer's expense.

---

## 7. Licensing Requirements

### 7.1 Freight Broker License (FMCSA)

**Authority:** Federal Motor Carrier Safety Administration (FMCSA)
**Statute:** 49 USC 13904; 49 CFR Part 371

A **freight broker** arranges transportation of cargo between shippers and carriers for compensation.

#### License Requirements

- **Operating Authority (MC Number):** Must apply for and receive MC authority from FMCSA via FMCSA Registration Portal
- **Process Surety Bond (BMC-84):** $75,000 surety bond OR $75,000 trust fund (BMC-85)
  - Purpose: Protects shippers and carriers if broker fails to pay
  - Increased from $10,000 to $75,000 by MAP-21 Act (2013)
- **Designated process agent:** Must designate a process agent in each state of operation (BOC-3 form)
- **Annual UCR registration:** Unified Carrier Registration; fee based on fleet size
- **FMCSA registration fee:** $300 application fee

#### Freight Broker vs. Freight Forwarder (Surface Transportation)

Under 49 USC, a surface freight forwarder (property broker) requires the same FMCSA operating authority as a broker. If arranging domestic trucking for imports (drayage from port to warehouse), the arranger may need freight broker authority.

**PLATFORM IMPLICATION:** If Shipping Savior platform helps users find and book trucking, it could be functioning as a freight broker — requiring licensing. A technology platform that merely provides information without actually arranging transportation may be exempt, but the line is not always clear.

### 7.2 Customs Broker License (CBP)

**Authority:** CBP; 19 USC 1641; 19 CFR Part 111

A **customs broker** is a person licensed by CBP to transact customs business (preparing and filing entries, advising clients on classification, valuation, admissibility) on behalf of importers.

#### License Requirements

- **CBP Customs Broker License (CBL):** Individual license issued by CBP
  - Requires passing the CBP Customs Broker License Examination (4 hours, 80 questions, 75% passing score)
  - Exam offered 3x per year (April, October, and November as of recent scheduling)
  - Background check, financial disclosure, fingerprints
  - 5-year renewable license
- **Broker Permit:** Must have a permit to operate in each CBP port (or a national permit)
- **Triennial status report:** Brokers must file triennial status reports with CBP
- **Continuing education:** 36 credit hours of continuing education per 3-year period (effective 2019)
- **Corporate broker:** Corporations can hold broker licenses; at least one officer must be individually licensed

#### Consequences of Unlicensed Customs Business

Conducting "customs business" without a CBP license is a federal violation:
- Customs business defined as: preparing and filing entries, advising on classification, valuation, admissibility for compensation
- Penalty: Up to $10,000 per transaction for unlicensed practice

**CRITICAL FOR PLATFORM:** This is the key regulatory risk. See Section 12.

### 7.3 Ocean Transportation Intermediary (OTI) License — Freight Forwarder

**Authority:** Federal Maritime Commission (FMC); 46 USC 40901
**Regulation:** 46 CFR Part 515

An **OTI** includes:
1. **Ocean Freight Forwarder (OFF):** Arranges export ocean transportation; prepares export documents; books space on vessels
2. **Non-Vessel Operating Common Carrier (NVOCC):** Issues its own B/Ls; takes responsibility as a carrier without operating vessels

#### FMC License Requirements

| Requirement | Ocean Freight Forwarder | NVOCC |
|-------------|------------------------|-------|
| FMC License/Registration | License required | License required |
| Financial responsibility (bond/insurance) | $75,000 bond | $75,000 bond (or $150,000 for NVOCCs serving foreign commerce) |
| Tariff filing | Not required | Must publish tariff (or use NVOCC Service Arrangements) |
| Published rates | Not required | Required; must be accessible to public |

**OTI License Process:**
1. Apply via FMC eLicensing system
2. Submit: application, background disclosure, financial statements
3. Provide evidence of financial responsibility (bond, insurance)
4. FMC review: typically 60–90 days
5. Fee: $250 for OFFs; $1,000 for NVOCCs (approximate)

**Note:** A company that BOTH arranges US exports and US imports needs both the FMC OTI license (for export/ocean forwarding) and potentially the CBP customs broker license (for import clearance).

### 7.4 CTPAT — Customs-Trade Partnership Against Terrorism

**Authority:** CBP; voluntary program
**Website:** cbp.gov/trade/cargo-security/ctpat

CTPAT is a voluntary supply chain security partnership with CBP. Certified members receive:
- Reduced exam rates
- Front-of-line treatment at port examinations
- Trusted partner status with other CTPAT members

**Who Can Apply:**
- US importers, exporters, customs brokers, carriers, freight consolidators, sea port authorities, air carriers, rail carriers, highway carriers

**Requirements:**
- Minimum security criteria for supply chain security
- Self-assessment against criteria
- CBP validation (site visit) within 1 year of membership
- Annual review and updates

**Platform relevance:** CTPAT membership status of freight partners should be tracked. The platform could display CTPAT status of recommended carriers and brokers as a quality indicator.

---

## 8. Platform Compliance Obligations

### 8.1 What the Platform CAN Do (Permissible)

The following activities do NOT constitute regulated "customs business" or brokerage:

| Permitted Activity | Rationale |
|-------------------|-----------|
| Provide HTS code lookup tool with disclaimer | Informational; user makes final classification decision |
| Show tariff rate estimates based on HTS codes | Publishing publicly available rate data |
| Generate draft commercial invoices and packing lists | Document preparation tools (not filing on behalf of user) |
| Provide ISF timing guidance and data collection form | Importer can file ISF themselves or forward to their licensed broker |
| Calculate estimated duty/landed cost | Financial estimation tool; not CBP filing |
| Provide FTZ benefit calculator | Informational analysis |
| Connect users with licensed customs brokers | Referral service; platform does not perform brokerage |
| Provide freight quotes from licensed carriers | Rate information service |
| Track shipment status via carrier APIs | Information aggregation |
| Display compliance checklists | Educational guidance |
| Generate compliance reports for internal use | Record-keeping assistance |
| Screen parties against OFAC SDN list | Compliance assistance tool; user must take action |
| Aggregate vessel schedules from public data | Data aggregation |

### 8.2 What the Platform CANNOT Do Without Licenses

| Prohibited Activity | License Required | Penalty Risk |
|--------------------|--------------------|--------------|
| File CBP entries (7501) on behalf of importers | CBP Customs Broker License | $10,000/transaction |
| Provide binding HTS classification opinions | CBP Customs Broker License | Unlicensed customs business |
| File ISF on behalf of importers for compensation | CBP Customs Broker License | Unlicensed customs business |
| Arrange domestic trucking for compensation as intermediary | FMCSA Freight Broker License | Civil penalties |
| Act as NVOCC (issue own B/Ls) | FMC OTI License | Civil penalties |
| Book cargo space as an ocean freight forwarder for compensation | FMC OTI License | Civil penalties |
| Provide legal advice on admissibility | Attorney license | Unauthorized practice of law |
| Certify goods as CPSC-compliant | No platform can do this — only test labs can | CPSC enforcement |

### 8.3 Safe Harbor Design Principles for the Platform

1. **All calculations are estimates, not declarations.** Any number the platform produces must be labeled as an estimate for planning purposes, not a declaration to CBP.

2. **User is the importer of record.** The platform facilitates but the user retains full legal responsibility for accuracy of customs filings.

3. **Licensed broker handoff.** Any process that requires regulatory filing (CBP entry, ISF, FDA Prior Notice) must terminate with a "File via your licensed customs broker" instruction and optionally a broker referral.

4. **No financial benefit from filing.** If the platform receives compensation for arranging or facilitating the actual filing of any regulated document, it crosses into licensed brokerage.

5. **Clearly dated data.** All tariff rates, HTS codes, and regulatory thresholds must show their data date prominently.

6. **User-acknowledgeable disclaimers.** For every calculator output, user must acknowledge they understand it is an estimate and will verify with a licensed professional before relying on it for a customs filing.

---

## 9. Data & Electronic Filing Regulations

### 9.1 Automated Commercial Environment (ACE)

**Authority:** CBP
**Purpose:** Single window for all US import and export filing

ACE replaced ACE's predecessor (ACS) as the mandatory electronic filing portal. All required data (ISF, entry summaries, partner government agency reports) flows through ACE.

**Key ACE Filing Types:**

| Module | What It Does | Who Files |
|--------|-------------|----------|
| ACE Manifest | Vessel/flight/truck manifests from carriers | Ocean carriers, airlines, truckers |
| ACE Entry | Customs entries (7501) | Licensed customs brokers or importers |
| ISF/10+2 | Importer Security Filing | Importers or their licensed CBP brokers |
| AES/EEI | Export electronic information | Exporters/forwarding agents |
| FDA Prior Notice | Food import notification | Importers or their agents |
| CPSC | Product safety filing | Manufacturers/importers |
| FWS | Fish & Wildlife Service declarations | Importers of wildlife products |

**ACE Access:**
- Importers can access ACE directly via ACE Secure Data Portal
- Customs brokers access via their software (Descartes, Customs City, eSPS, etc.)
- Platform must clarify: the platform does not file in ACE; it helps users prepare data for their broker to file

### 9.2 Advance Manifest System (AMS)

**Authority:** 19 CFR Part 4 (vessel); 19 CFR Part 122 (air); 19 CFR Part 123 (rail/truck)
**What it is:** CBP's automated manifest processing system — predecessor to ACE for manifests

Ocean carriers must file Advance Cargo Information (ACI) through AMS:
- **24-Hour Rule (ocean):** Carrier must transmit cargo manifest data 24 hours before loading in foreign port
- AMS receives: vessel stow plan, container status messages, manifest data
- AMS/ACE manifest data feeds CBP's Automated Targeting System (ATS) for risk scoring

**Platform relevance:** AMS manifest data is somewhat public (after processing); historical manifest data is available through providers like ImportGenius, ImportYeti, Panjiva — useful for competitive intelligence features of the platform.

### 9.3 Automated Export System (AES) / Electronic Export Information (EEI)

**Authority:** Census Bureau (collects data); CBP (enforces); BIS (for export control)
**Regulation:** 15 CFR Part 30 (Foreign Trade Regulations)
**Filing:** Via ACE (AESDirect was the predecessor; fully transitioned to ACE as of 2023)

#### EEI Filing Requirements

**When required:**
- Exports valued over $2,500 per Schedule B commodity
- All shipments to Cuba, Iran, North Korea, Syria regardless of value
- All shipments requiring a BIS export license regardless of value
- Shipments of used vehicles (regardless of value)

**When NOT required:**
- Exports to Canada (most shipments — some exceptions)
- Personal/household goods of departing US residents
- Goods valued under $2,500 per Schedule B code (with some exceptions)

**EEI Data Elements:**
- US Principal Party in Interest (USPPI) — exporter's name, address, EIN
- Foreign Principal Party in Interest — foreign buyer
- Schedule B (US export classification) number — equivalent to HTS for exports
- Country of destination
- Method of transportation and carrier
- Port of export
- Export date
- Quantity, unit of measure
- Value (selling price or market value)
- Export license number (if applicable) or license exception code
- AES ITN (Internal Transaction Number) — confirmation number for filing

**ITN on Shipping Documents:**
- The AES ITN must appear on the bill of lading/air waybill OR on a separate SED (Shipper's Export Declaration) annotation
- Format: `AES X20260326123456` (AES prefix + date + sequence number)
- Without ITN, export may be held at port

**For Shipping Savior cold chain exports:**
The founder's cold chain exports must comply with EEI filing. If the founder uses an OTI/freight forwarder, the forwarder typically files EEI. The platform should collect all required EEI data elements from the user and prepare a structured export for the forwarder.

### 9.4 Advance Electronic Information (AEI)

AEI is the CBP umbrella term for all pre-arrival electronic data programs:
- ISF (import)
- AMS manifest (carrier)
- FDA Prior Notice (food)
- AES/EEI (export)

The goal is "paperless trade" where all information is electronically pre-transmitted before physical cargo moves. CBP's Single Window initiative consolidates all partner government agency (PGA) data requirements into ACE.

---

## 10. Key Regulatory Agencies

### 10.1 Agency Directory

| Agency | Acronym | Jurisdiction | Key Contact/Tool |
|--------|---------|--------------|-----------------|
| Customs and Border Protection | CBP | All imports; tariffs; admissibility; ISF; entry | cbp.gov; ACE portal; CROSS rulings database |
| Food and Drug Administration | FDA | Food, drugs, cosmetics, medical devices, dietary supplements, tobacco | fda.gov; FDA Industry Systems (FURS); OASIS import system |
| Consumer Product Safety Commission | CPSC | Consumer products; toys; apparel; electrical products; furniture | cpsc.gov; CPSC Import Surveillance System |
| Federal Trade Commission | FTC | Labeling (textile, wool, fur); advertising; Made in USA claims | ftc.gov; Business Guidance |
| Bureau of Industry and Security | BIS | Dual-use export controls; EAR; CCL | bis.doc.gov; SNAP-R licensing portal |
| Office of Foreign Assets Control | OFAC | Sanctions; SDN list; country embargoes | ofac.treasury.gov; SDN search; licensing portal |
| Federal Maritime Commission | FMC | Ocean shipping; NVOCCs; freight forwarder licensing; carrier tariffs | fmc.gov; eFiling |
| Federal Motor Carrier Safety Administration | FMCSA | Freight broker licensing; carrier safety; hazmat transport | fmcsa.dot.gov; SAFER system |
| USDA Animal & Plant Health Inspection Service | APHIS | Plants; animal products; wood packing materials; phytosanitary | aphis.usda.gov; PIMS for permits |
| USDA Food Safety and Inspection Service | FSIS | Meat, poultry, egg products | fsis.usda.gov |
| USDA Agricultural Marketing Service | AMS | Country of Origin Labeling; grading; organic | ams.usda.gov |
| Environmental Protection Agency | EPA | Pesticide registration; vehicle emissions; chemical substances | epa.gov; TSCA import certification |
| Federal Communications Commission | FCC | Electronics; RF devices; equipment authorization | fcc.gov; FCC ID database |
| FTZ Board | FTZ Board | FTZ grants; zone applications; annual reporting | commerce.gov/ftz |
| US International Trade Commission | USITC | HTS schedule; anti-dumping/CVD investigations; Section 337 | usitc.gov; hts.usitc.gov |
| US Trade Representative | USTR | FTA negotiations; Section 301 tariffs; GSP | ustr.gov |
| Census Bureau | Census | Foreign Trade Regulations; AES/EEI; trade statistics | census.gov/trade |
| Directorate of Defense Trade Controls | DDTC | ITAR; USML; defense article export licenses | pmddtc.state.gov |

### 10.2 Inter-Agency Coordination

Most US import examinations by CBP are coordinated with Partner Government Agencies (PGAs):
- **FDA:** CBP detains food shipments for FDA hold; FDA issues "may proceed" or "refusal of admission"
- **CPSC:** CBP and CPSC share targeting data; CPSC may issue detention orders to CBP
- **APHIS:** Phytosanitary inspections done at port by APHIS inspectors
- **EPA:** Imports of vehicles, engines, chemicals require EPA compliance documentation

All PGA holds are now managed through ACE's PGA Message Set — a single filing where the importer/broker declares compliance with each PGA simultaneously.

---

## 11. Compliance Calendar & Filing Deadlines

### 11.1 Import Filing Deadlines

| Filing | Deadline | Consequence of Failure |
|--------|----------|----------------------|
| ISF-10 (ocean FCL) | 24 hours before lading at foreign port | $5,000–$10,000 liquidated damages |
| ISF-5 (bulk/break-bulk) | 24 hours before vessel arrival at US port | $5,000–$10,000 liquidated damages |
| FDA Prior Notice (ocean) | Minimum 8 hours before vessel arrival | FDA detention; refusal of admission |
| FDA Prior Notice (air) | Minimum 4 hours before wheels-down | FDA detention; refusal of admission |
| FDA Prior Notice (rail/truck) | Minimum 2 hours before arrival | FDA detention; refusal of admission |
| CBP Entry Filing | Within 15 calendar days of cargo arrival | Cargo may be sent to general order warehouse at importer's expense |
| CBP Entry Summary | 10 working days after entry release (informal) | Bond call; penalties |
| AES/EEI (ocean export) | Before export; ITN must be on B/L | Cargo held at port; civil penalty |
| AES/EEI (air export) | Before aircraft departure | Cargo held; civil penalty |

### 11.2 Annual/Recurring Compliance Deadlines

| Requirement | Deadline | Who |
|-------------|----------|-----|
| FDA Food Facility Registration renewal | October–December, even-numbered years | Food importers/manufacturers |
| FTZ Annual Activity Report | March 31 each year | FTZ operators |
| Customs broker triennial report | Every 3 years (Feb 1 of year divisible by 3) | Licensed customs brokers |
| Customs broker continuing education | 36 hours per 3-year period | Licensed customs brokers |
| FMCSA UCR registration | Annual (January 1 start) | Freight brokers, carriers |
| Continuous bond renewal | Annual | Importers (if renewal premium not paid, bond is void) |
| CTPAT security profile update | Annual | CTPAT member companies |
| OFAC SDN screening | Continuous (at each transaction) | All parties doing business with foreign entities |
| FTZ operator bond | Annual renewal | FTZ operators |
| FMC OTI license renewal | Biennial (every 2 years) | Licensed OTIs/freight forwarders |

### 11.3 Tariff Update Calendar

| Event | Timing | Impact |
|-------|--------|--------|
| HTS annual update (USITC) | January 1 each year | HTS codes may be added, deleted, modified |
| Section 301 exclusion expiration | Rolling — published in Federal Register | Exclusions expire; duty surcharges snap back |
| GSP renewal | Congress-dependent; last lapsed Dec 31, 2020 | Duty-free treatment for beneficiary countries |
| CBP duty rate changes | Per presidential proclamation/legislation | Any time |
| USMCA rules of origin review | Every 6 years (first review 2026) | Rules of origin may be modified |

---

## 12. Risk Areas & Prohibited Platform Activities

### 12.1 Unauthorized Practice of Customs Brokerage

**The Core Risk:**

19 USC 1641(a) prohibits any person from conducting "customs business" (other than on behalf of themselves) without a CBP license. "Customs business" is defined as:

> "those activities involving transactions with CBP concerning the entry and admissibility of merchandise, its classification and valuation, the payment of duties, taxes, or other charges assessed or collected by CBP upon merchandise by reason of its importation..."

**Gray Areas Where the Platform Must Be Careful:**

| Activity | Risk Level | Recommended Approach |
|----------|-----------|----------------------|
| HTS lookup tool | Low — general informational | Prominent disclaimer: "For planning purposes only. Verify with your licensed customs broker." |
| Pre-populated 7501 forms for user to give broker | Medium — if platform charges per-entry | Use only if payment is for platform subscription, not per-entry filing |
| "We will handle your entry for you" | HIGH — unlicensed brokerage | Never. Refer to licensed broker. |
| ISF data collection + "submit to CBP" button | HIGH — if actually filing in ACE | Never file ISF directly in ACE for users (unless platform itself is licensed) |
| Rate advice ("your duty will be...") | Medium — advisory vs. declaration | Frame as estimate with uncertainty band; user verifies with broker |
| Classification opinion for specific goods | HIGH — this is the core of customs brokerage | "Classification guidance only — binding classification by CBP requires licensed broker or CBP ruling" |

### 12.2 Freight Brokerage Threshold

Under 49 USC 13904, a freight broker "for compensation" arranges transportation. Risk factors:
- Platform charges transaction fees for connecting shippers and carriers → approaches brokerage
- Platform collects shipping quotes and books on behalf of user → brokerage
- Platform only displays information for user to book directly → likely not brokerage

**Recommended model:** Platform provides carrier information; user books directly with carrier via carrier's website/phone. Platform earns subscription revenue, not transaction fees.

### 12.3 Investment/Legal Advice Risk

The platform may generate financial analyses (FTZ savings, landed cost projections) that users rely on for business decisions. Risk:
- If projections are materially wrong (stale tariff data, wrong HTS code) and user suffers financial loss → potential liability
- **Mitigation:** Clear contractual limitation of liability; disclaimer that outputs are estimates; user acknowledges they are not relying on platform outputs as professional advice

### 12.4 Data Accuracy Liability

Given the fast-changing tariff landscape (Section 301 modifications, exclusion expirations, HTS annual updates), the platform faces reputational and potential legal risk from stale data:
- **Stale Section 301 rate:** User underestimates duty by 25 percentage points → major financial loss
- **Expired GSP rate shown as active:** User fails to collect proper duty funds → cash flow crisis at port
- **Expired FTZ benefit displayed:** User plans business model around benefit that no longer exists

**Mitigation strategy:**
1. Automated data refresh schedule (monthly at minimum for tariff rates)
2. Clear "last updated" display on every rate shown
3. Red-banner warnings for data older than 90 days
4. Automated alerts to users when their saved HTS codes are affected by regulatory changes

### 12.5 OFAC Sanctions Violation Risk

If the platform facilitates a transaction involving an OFAC-sanctioned party or country, the platform operator (not just the user) may be liable:
- OFAC's strict liability standard means intent is irrelevant
- Platforms that process transactions have been penalized for facilitating SDN transactions

**Mitigation:**
1. Screen all users and their counterparties against SDN/OFAC at account creation AND at each transaction
2. Use a commercial OFAC/watchlist screening API (not manual check)
3. Block transactions that match SDN entries; generate compliance incident record
4. Maintain a compliance program with designated OFAC Compliance Officer
5. Annual training for platform staff on OFAC obligations

---

## 13. Recommended Legal Disclaimers

### 13.1 General Platform Disclaimer (Display Prominently on All Calculation Pages)

> **Disclaimer:** This platform provides informational tools for logistics planning purposes only. All calculations, duty estimates, tariff rates, and compliance guidance are estimates based on publicly available data and are provided for general information only. They do not constitute legal advice, customs brokerage, or professional compliance services. Tariff rates, HTS classifications, and regulatory requirements change frequently. Always verify current requirements with a licensed U.S. customs broker, import attorney, or other qualified professional before making any business or compliance decisions. The platform owner makes no representations or warranties as to the accuracy, completeness, or fitness for any particular purpose of any information provided.

### 13.2 HTS Lookup Tool Disclaimer

> **HTS Classification Notice:** Harmonized Tariff Schedule classifications suggested by this tool are for preliminary planning purposes only. Correct HTS classification is a legal determination that affects the amount of duties you owe. Misclassification can result in underpayment of duties, penalties, and delays. For binding HTS classification, consult a licensed U.S. customs broker or request a binding ruling from U.S. Customs and Border Protection (CBP) at CROSS (Customs Rulings Online Search System). Tariff data displayed reflects the USITC HTS schedule as of [DATA DATE] and may not reflect recent modifications.

### 13.3 FTZ Benefit Calculator Disclaimer

> **FTZ Notice:** Foreign Trade Zone (FTZ) benefits shown are illustrative estimates based on publicly available FTZ Board and CBP regulations. Actual benefits depend on CBP port director decisions, FTZ activation terms, approved status (Privileged Foreign vs. Non-Privileged), operator agreements, and current tariff rates. Contact your FTZ operator or a licensed customs broker before making investment decisions based on anticipated FTZ savings.

### 13.4 Sanctions/OFAC Screening Notice

> **Sanctions Compliance Notice:** This platform provides OFAC sanctions screening as an informational aid only. Screening results should not be relied upon as definitive legal clearance to proceed with any transaction. OFAC sanctions lists are updated frequently. The platform owner is not responsible for transactions that violate OFAC regulations. Users are solely responsible for their own compliance with applicable sanctions laws.

### 13.5 Scope Limitation — Licensed Activities

> **Important:** This platform does not provide customs brokerage services, freight brokerage services, or ocean freight forwarding services. It does not file customs entries, ISF, AES/EEI, or any other regulatory filing on behalf of users. Any reference to customs, freight, or logistics processes is informational only. To file regulatory documents, work with a licensed U.S. customs broker (for customs entries), a licensed freight broker (for domestic trucking arrangements), or a licensed ocean freight forwarder (for export shipment arrangements).

---

## 14. Record Retention Requirements

### 14.1 CBP — 5-Year Rule

**Regulation:** 19 CFR 163.4
All importers must retain records relating to importations for **5 years** from the date of entry:
- Commercial invoices
- Packing lists
- Bills of lading
- Customs entry documentation
- ISF filings
- Duty payment records
- Correspondence with CBP or customs brokers
- Any other documentation used to prepare the entry

**Customs brokers:** Must retain records for **5 years** from date of entry OR **3 years** from date of final action (whichever is later).

**Recordkeeping format:** CBP accepts electronic records (scanned documents, electronic originals) as long as they are retrievable and legible. Must be available for CBP audit within 30 days of request (within 5 business days of request for some records).

**Consequences of failing to produce records:** CBP may issue a prior disclosure demand; penalties up to $10,000 per entry for failure to maintain or produce records.

### 14.2 FDA — Food Records

- **FSVP records:** Must be retained for 2 years after the last applicable activity date
- **Food facility HACCP records:** 1 year for refrigerated products; 2 years for frozen/shelf-stable; 3 years for smoked fish

### 14.3 BIS Export Records

For EAR-controlled exports:
- **5 years** from date of export or from the date of any known investigation

### 14.4 FMCSA Freight Broker Records

- **3 years** from date of transaction for all records of transportation arranged

### 14.5 Platform Record Retention Recommendation

The platform should:
1. Store all transaction data (quotes, estimates, counterparty information) for at least **5 years**
2. Store all OFAC screening results with timestamps (shows due diligence)
3. Implement data export functionality so users can download their own records for CBP audit compliance
4. Include data retention policy prominently in Terms of Service

---

## 15. UFLPA — Uyghur Forced Labor Prevention Act

### 15.1 Overview

**Statute:** Uyghur Forced Labor Prevention Act, Pub. L. 117-78 (effective June 21, 2022)
**Enforcing Agency:** CBP
**Regulatory Basis:** 19 USC 1307 (existing forced labor import ban) + UFLPA rebuttable presumption

### 15.2 The Rebuttable Presumption

UFLPA creates a **rebuttable presumption** that ANY goods produced in whole or in part in the Xinjiang Uyghur Autonomous Region (XUAR) of China are made with forced labor and are PROHIBITED from importation into the US under 19 USC 1307.

**What this means:**
- If CBP determines that goods were produced in XUAR, they are presumed to be forced labor goods
- The importer has the burden of proof to rebut the presumption by "clear and convincing evidence"
- This is nearly impossible in practice for most goods from XUAR

**Importer Challenge:** The presumption applies even if the goods were not directly manufactured in XUAR but used inputs from XUAR (cotton, polysilicon, tomatoes, steel)

### 15.3 High-Risk Sectors (UFLPA Entity List)

DHS has published a UFLPA Strategy and Entity List covering:
- **Cotton:** Xinjiang produces ~85% of China's cotton; all apparel/textile from China is suspect if cotton origin cannot be traced
- **Polysilicon:** Used in solar panels; majority of world's polysilicon supply from Xinjiang
- **Tomato products:** Xinjiang tomato paste/concentrate in food products
- **Other agricultural products:** Processed in Xinjiang even if grown elsewhere

**Entity List:** Specific companies designated by DHS as known UFLPA violators. Any goods from Entity List companies are barred from US import, period — no rebuttal available.

### 15.4 UFLPA Compliance for SE Asia Apparel Imports

**Critical for Shipping Savior expansion into SE Asia apparel:**

Even if goods are manufactured in Vietnam, Cambodia, or Thailand, if they incorporate Chinese-origin cotton from Xinjiang, they may be UFLPA-non-compliant.

**Due Diligence Requirements for Apparel:**
1. **Trace cotton to spinning mill:** Know the country and region of origin of all cotton used
2. **Obtain textile supply chain documentation:** Fiber → yarn → fabric → garment, at each step
3. **Require supplier certifications:** Suppliers must certify that no Xinjiang-origin inputs were used
4. **Consider OTEXA/Cotton Country of Origin:** Some traders maintain "non-Xinjiang" cotton certifications (e.g., Better Cotton Initiative, Cotton LEADS program)
5. **Audit third-party verification:** Full chain of custody audit by accredited supply chain auditor

**Platform Recommendation:**
- UFLPA compliance checklist must be part of every SE Asia apparel import workflow in the platform
- Suppliers should be required to provide Supplier Declaration for Non-Xinjiang Cotton
- Cotton fiber mill certificate (Certificate of Analysis from fiber producer) recommended

### 15.5 UFLPA Consequences

- Shipment detained by CBP at port — held in bonded location at importer's expense
- Importer has **30 days** from first detention notice to provide clear and convincing evidence
- If evidence insufficient → goods excluded (refused admission)
- Excluded goods must be re-exported or abandoned within **90 days** of exclusion order
- No appeal to CBP (must go to Court of International Trade)
- Reputational risk: CBP publishes UFLPA holds statistics quarterly

---

## 16. Data Privacy Considerations

### 16.1 Trade Data as Personal/Business Information

The platform collects and processes:
- Importer of record information (company name, EIN, address)
- Supplier and manufacturer information (foreign company names, addresses)
- Transaction values and product descriptions
- Counterparty relationship information

This data may constitute:
- **Business confidential information** under CBP FOIA exemption (Exemption 4)
- **Personally identifiable information (PII)** if natural persons are importers (sole proprietors)

### 16.2 GDPR Considerations (EU Partners)

If the founder's supply chain includes EU-based suppliers, distributors, or logistics partners, GDPR may apply to processing their data:
- **Controller vs. Processor:** If the platform stores EU resident data (e.g., supplier contact person names), the platform may be a Data Processor
- **Data Transfer:** Transfer of EU personal data to US servers requires Standard Contractual Clauses (SCCs) or adequacy decision
- **Right to Erasure:** EU data subjects can request deletion of their personal data
- **Privacy Notice:** Must inform EU data subjects of data processing

**PLATFORM IMPLICATION:**
- Privacy Policy must address international data transfers
- Platform must offer data deletion functionality
- Consider whether EU suppliers' contact info is stored — if so, GDPR compliance needed

### 16.3 CBP Trade Data Confidentiality

- **CBP entries are confidential** under 19 USC 1509 and FOIA Exemption 3/4
- However, **manifest data (including shipper, consignee, goods description) is public** under a different legal framework — this is the basis for commercial manifest data services (ImportGenius, Panjiva)
- **ISF data is NOT public** — treated as confidential enforcement data
- **Platform must not expose user's confidential CBP entry data** to other users or third parties without consent

### 16.4 California CCPA

If platform has California-based users (very likely in a logistics context with West Coast ports):
- **CCPA/CPRA** applies if platform meets threshold (>$25M revenue, OR 100K+ CA residents' data, OR 50%+ revenue from selling CA data)
- Requires: privacy notice, right to know, right to delete, right to opt-out of data sale
- B2B exemption was extended under CPRA through 2023 — currently all B2B data may be subject to CCPA

---

## 17. Implementation Notes for Platform

### 17.1 Data Architecture for Compliance

```
Tariff Database Schema (pseudocode):
- hts_code: string (10 digits, normalized, no dots)
- description: string
- mfn_rate: Decimal (not float)
- section_301_rate: Decimal | null
- section_232_rate: Decimal | null
- gsp_rate: Decimal | null  (null = GSP lapsed)
- effective_date: Date
- expiry_date: Date | null
- data_source: string (USITC, USTR, etc.)
- last_updated: DateTime
- is_stale: boolean (auto-set if last_updated > 90 days ago)
```

### 17.2 OFAC Screening Integration

Recommended API providers (by cost/feature):
1. **Descartes Visual Compliance** — comprehensive; integrates with logistics systems; enterprise pricing
2. **Melissa Data Sanctions List Lookup** — affordable; real-time; REST API
3. **Dow Jones Risk & Compliance** — comprehensive; covers PEPs and adverse media too
4. **Refinitiv World-Check** — gold standard; expensive but most comprehensive

Minimum screening should hit:
- OFAC SDN List
- OFAC Consolidated Sanctions List
- EU Consolidated List
- UN Security Council List

### 17.3 HTS Data Sources

| Source | Cost | Update Frequency | Suitability |
|--------|------|-----------------|-------------|
| USITC HTS Download (hts.usitc.gov) | Free | Annual (Jan 1) + amendments | Primary source; requires parsing |
| CBP Automated Broker Interface (ABI) tariff data | Free (industry) | Real-time | Requires CBP ACE credentials |
| Flexport API (duty rates) | Commercial | Frequent | Good for quick integration |
| WISERTrade | Commercial | Monthly | Comprehensive; government-backed |
| Avalara AvaTax Cross-Border | Commercial | Frequent | SaaS; easy to integrate |

**Recommended approach for Phase 1:** Download from USITC annually; supplement with USTR Federal Register notices for Section 301 changes; display vintage date prominently.

### 17.4 Compliance Checklist by Product Category

**SE Asia Apparel Import Checklist:**
- [ ] HTS code determined (10-digit)
- [ ] MFN duty rate confirmed
- [ ] Section 301 check (if China origin or Chinese inputs)
- [ ] UFLPA cotton traceability documentation obtained
- [ ] FTC fiber content label language prepared
- [ ] FTC care label designed and confirmed
- [ ] Country of origin determined (substantial transformation analysis)
- [ ] CPSC requirements reviewed (if children's apparel: CPC + third-party testing)
- [ ] ISF data elements collected (all 10 importer elements)
- [ ] FDA requirements checked (if textile/apparel — generally FDA-exempt)
- [ ] ISPM-15 packing requirement confirmed with supplier
- [ ] Commercial invoice meets CBP valuation requirements (including assists)
- [ ] Continuous bond in place (or single entry bond arranged)

**Cold Chain Export Checklist:**
- [ ] HTS/Schedule B code determined
- [ ] EEI/AES filing data elements collected
- [ ] ECRA/EAR99 confirmation (or ECCN if applicable)
- [ ] OFAC screening of buyer/consignee/country
- [ ] FDA FSVP reviewed (if receiving food product for re-import)
- [ ] Phytosanitary/sanitary certificate from USDA APHIS (if applicable)
- [ ] Cold chain temperature documentation prepared
- [ ] FSMA Sanitary Transportation Rule compliance confirmed
- [ ] ISPM-15 packing confirmation
- [ ] AES ITN obtained before cargo loaded

### 17.5 Priority Regulatory Risks for Shipping Savior

**Ranked by probability × impact:**

| Risk | Probability | Impact | Priority |
|------|-------------|--------|---------|
| UFLPA cotton violation on SE Asia apparel | High | Very High (shipment refused) | CRITICAL |
| Section 301 stale tariff rate in calculator | High | High (financial miscalculation) | CRITICAL |
| Unlicensed customs brokerage (ISF filing) | Medium | Very High ($10K/entry fine) | HIGH |
| ISF late filing | High | Medium ($5K per shipment) | HIGH |
| CPSC certification missing for children's products | Medium | High (seizure + recall) | HIGH |
| OFAC SDN match not caught | Low | Very High (regulatory penalty) | HIGH |
| FDA Prior Notice late/missing | Medium | Medium (detention at port) | MEDIUM |
| FTC mislabeling (fiber content) | Medium | Medium (FTC enforcement) | MEDIUM |
| FCC missing authorization on electronics | Medium | Medium (CBP detention) | MEDIUM |
| ISPM-15 non-compliant wood packing | Medium | Low (treatment cost; delay) | MEDIUM |
| GSP rate shown as active | Medium | Medium (duty underpayment) | MEDIUM |
| Record retention failure (CBP 5-year) | Low | Medium (CBP audit penalty) | LOW |

---

## Key Reference URLs

| Resource | URL | Purpose |
|----------|-----|---------|
| USITC HTS Schedule | hts.usitc.gov | HTS code lookup; rates |
| CBP CROSS Rulings | rulings.cbp.gov | Binding customs rulings |
| USTR Section 301 | ustr.gov/issue-areas/enforcement/section-301-investigations | Current 301 tariff lists and exclusions |
| CBP ACE Portal | cbp.gov/ace | Import entry/ISF filing |
| OFAC SDN Search | ofac.treas.gov/faqs/search | Sanctions screening |
| FTZ Board | commerce.gov/ftz | Zone applications and status |
| FDA OASIS (import) | fda.gov/industry/import-program | FDA import status |
| FDA Prior Notice | www.access.fda.gov | Submit food prior notice |
| FMC eLicensing | fmc.gov/registration-and-licensing | OTI licensing |
| FMCSA Registration | fmcsa.dot.gov/registration | Freight broker registration |
| UFLPA Entity List | cbp.gov/trade/forced-labor/UFLPA | Blocked entities |
| FCC ID Database | fcc.gov/oet/ea/fccid | Check FCC equipment authorization |
| CBP Automated Manifest | cbp.gov/trade/automated | AMS/ACE information |
| AES Filing | aesdirect.census.gov | Export filing via ACE |
| CPSC Compliance | cpsc.gov/business--manufacturing | Safety requirements |

---

*Document Status: Complete — Initial research version*
*Next Review: Required when any Section 301/232 tariff modification is announced or HTS annual update publishes (January)*
*Platform Implementation: See Section 17 for data architecture and integration recommendations*

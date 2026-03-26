# US International Shipping: Regulatory & Compliance Research

**Project:** Shipping Savior — Logistics Analysis Platform
**Researched:** 2026-03-26
**Scope:** Five core regulatory/compliance areas for US ocean imports
**Confidence:** HIGH (based on published CFR, CBP guidance, Federal Register notices)
**Disclaimer:** This is research for software platform design. Not legal advice. Importers should consult licensed customs brokers and trade attorneys.

---

## Table of Contents

1. [ISF (Importer Security Filing) — 10+2 Rule](#1-isf-importer-security-filing--102-rule)
2. [Foreign Trade Zone (FTZ) Regulations — 19 CFR 146](#2-foreign-trade-zone-ftz-regulations--19-cfr-146)
3. [Section 301 Tariffs (China Trade War)](#3-section-301-tariffs-china-trade-war)
4. [Section 201 & 232 Tariffs](#4-section-201--232-tariffs)
5. [Bonding Requirements](#5-bonding-requirements)
6. [Platform Implementation Notes](#6-platform-implementation-notes)
7. [Cross-Reference Matrix](#7-cross-reference-matrix)

---

## 1. ISF (Importer Security Filing) — 10+2 Rule

### 1.1 Overview

The Importer Security Filing (ISF), commonly called "10+2," is a CBP (Customs and Border Protection) requirement under **19 CFR Part 149** mandating that importers electronically submit cargo information before goods are loaded onto vessels bound for the United States. The program was established by the SAFE Port Act of 2006 (Section 203) and the Trade Act of 2002, with the final rule published January 26, 2009 (Federal Register Vol. 73, No. 228).

**Purpose:** Advance cargo risk assessment. CBP uses ISF data to identify high-risk shipments before they reach US shores, enabling targeting for examination at foreign ports or upon arrival.

**Applies to:** All cargo arriving by vessel to the United States, with limited exceptions.

### 1.2 The 10 Importer Data Elements

The importer (or their agent/customs broker) must provide these 10 data elements:

| # | Data Element | Description | Source |
|---|-------------|-------------|--------|
| 1 | **Seller (owner)** | Name and address of the last known entity by whom the goods are sold or agreed to be sold. If goods not purchased, the owner. | Purchase order / commercial invoice |
| 2 | **Buyer (purchaser)** | Name and address of the last known entity to whom the goods are sold or agreed to be sold. If goods not consigned, the owner. | Purchase order |
| 3 | **Importer of Record Number** | IRS number, EIN, SSN, or CBP-assigned number of the entity responsible for ensuring imported goods comply with US laws. | Importer's CBP records |
| 4 | **Consignee Number(s)** | IRS number, EIN, SSN, or CBP-assigned number of the individual(s) or firm(s) in the US on whose account the merchandise is shipped. | Bill of lading / import records |
| 5 | **Manufacturer (supplier)** | Name and address of the entity that last manufactures, assembles, produces, or grows the commodity. | Commercial invoice / supplier records |
| 6 | **Ship-to Party** | Name and address of the first deliver-to party scheduled to physically receive the goods after port of entry release. | Shipping instructions |
| 7 | **Country of Origin** | Country of manufacture, production, or growth of the article, per US rules of origin. | Commercial invoice / certificate of origin |
| 8 | **Commodity HTS Number** | 6-digit (minimum) Harmonized Tariff Schedule number. Must be provided at the 6-digit level; full 10-digit preferred but not required for ISF. | HTS classification |
| 9 | **Container Stuffing Location** | Name and address(es) where the goods were stuffed into the container. | Supplier / freight forwarder |
| 10 | **Consolidator (stuffer)** | Name and address of the party who stuffed the container or arranged for the stuffing. | Freight forwarder / supplier |

### 1.3 The 2 Carrier Data Elements

The vessel operating carrier must provide:

| # | Data Element | Description |
|---|-------------|-------------|
| 1 | **Vessel Stow Plan** | Detailed information on the location of all containers on the vessel, transmitted to CBP via AMS (Automated Manifest System) no later than 48 hours after departure from the last foreign port. |
| 2 | **Container Status Messages (CSM)** | Reports on the status of all containers destined for or transiting the US, including gate-in, gate-out, loading, discharge, and other events at each port along the route. |

### 1.4 Filing Deadline

**Critical: 24 hours before vessel departure from the LAST foreign port, not 24 hours before arrival at the US port.**

This is a commonly misunderstood requirement. The clock starts when the vessel leaves its final foreign port of call, not when it arrives in the US. For a vessel departing Ho Chi Minh City with a transshipment in Singapore:

- ISF must be filed 24 hours before the vessel departs **Singapore** (the last foreign port), not 24 hours before arrival at Long Beach.
- If the vessel goes direct from HCMC to Long Beach, then ISF must be filed 24 hours before departure from HCMC.

**Amendments:** ISF data elements 1-5 (seller, buyer, importer of record, consignee, manufacturer) may be updated up to 24 hours before vessel arrival at the first US port. Elements 6-10 must be accurate at initial filing but can also be amended.

**Flexible ISF provisions:** For elements 7, 8, 9, and 10, if the importer does not have the exact information 24 hours before departure, they may provide "the best information available" and update later, provided the update occurs before arrival. However, this flexibility does not extend to elements 1-6.

### 1.5 Penalties

| Violation | Penalty | Authority |
|-----------|---------|-----------|
| Late ISF filing | **$5,000 per violation** | 19 CFR 149.4 |
| Inaccurate ISF filing | **$5,000 per violation** | 19 CFR 149.4 |
| Failure to file ISF | **Up to $10,000 per violation** | 19 CFR 149.4 |
| Pattern of non-compliance | **Increased examinations, holds, and potential liquidated damages claims** | CBP discretion |
| Do-not-load (DNL) order | CBP can direct carriers **not to load** a container onto a US-bound vessel if ISF is missing | 19 CFR 149.4 |
| Withholding of release | CBP can **withhold release** of merchandise pending ISF compliance | 19 CFR 149.4 |

**Enforcement note:** CBP phased in enforcement gradually after the 2009 effective date. As of 2025-2026, CBP actively issues penalties. The ISF penalty is per **shipment** (per bill of lading), not per container, though CBP has discretion to assess per violation.

**Mitigation:** First-time violators may receive a warning or reduced penalty. CBP considers the importer's compliance history, whether the error was corrected promptly, and whether the importer has an ISF compliance program. Having a Customs-Trade Partnership Against Terrorism (C-TPAT) membership helps in mitigation.

### 1.6 ISF-5 vs ISF-10

| Filing Type | When Used | Data Elements Required | Who Files |
|------------|-----------|----------------------|-----------|
| **ISF-10** | Standard import — goods entering US commerce | All 10 importer elements + 2 carrier elements | Importer of record (or broker/agent) |
| **ISF-5** | Goods remaining on board the vessel (FROB — Foreign Remaining On Board), goods destined for an FTZ and not entered for consumption, IE (Immediate Exportation), and T&E (Transportation & Exportation) | 5 elements: (1) booking party, (2) foreign port of unlading, (3) place of delivery, (4) ship-to party, (5) commodity HTS number | Carrier or their agent |

**Key distinction:** ISF-5 applies when goods are NOT being formally entered into US commerce. If goods go to an FTZ and are later entered for consumption, the ISF-10 requirement applies when the goods are admitted to the FTZ. However, if goods are simply transshipped through a US port without entering US commerce, ISF-5 suffices.

**Practical impact for SE Asia imports:** Nearly all goods being imported for sale in the US require ISF-10. ISF-5 is relevant primarily for transshipment cargo and FROB.

### 1.7 Bond Requirements for ISF Filing

- An ISF bond is **required** to file ISF. This can be:
  - A **continuous entry bond** (if the importer has one — most active importers do)
  - A **single entry bond (STB)** for one-off shipments
  - A **separate ISF bond** (rare but technically possible under a Type 1B — ISF bond)
- The bond guarantees payment of ISF penalties if assessed.
- **Minimum continuous bond amount for ISF:** The bond must cover potential ISF penalties. CBP uses the same continuous entry bond for both entry and ISF obligations.
- If an importer files ISF but does not have a bond, CBP can refuse to accept the filing.

### 1.8 Exceptions and Exemptions

| Exception | Details |
|-----------|---------|
| **Goods arriving by air or land** | ISF applies ONLY to vessel cargo. Air and truck shipments are exempt. |
| **Informal entries under $2,500** | Still require ISF filing. The $2,500 informal entry threshold does NOT exempt goods from ISF. |
| **Military cargo** | Exempt under certain conditions (Department of Defense shipments). |
| **Diplomatic shipments** | Exempt (goods for foreign government officials). |
| **Personal effects** | Exempt if unaccompanied baggage accompanying a person (not commercial goods). |
| **Goods from Canada and Mexico** | Exempt if transported solely by land (not arriving by vessel). |
| **Outer Continental Shelf (OCS) shipments** | Certain OCS activities are exempt. |

### 1.9 Implementation Notes for Software Platform

**ISF Filing Tracker Module:**
- Track filing deadline based on vessel departure, not arrival
- Integrate with vessel schedule data to calculate 24-hour-before-departure windows
- Status tracking: NOT FILED → FILED → ACCEPTED → MATCHED (to entry) → CLOSED
- Flag shipments approaching deadline (48-hour and 24-hour alerts)
- Track amendment history for each ISF

**Data Model Considerations:**
- ISF is identified by a unique ISF Transaction Number assigned by CBP
- Each ISF maps to one or more bills of lading
- ISF must be matched to the subsequent entry (CBP Entry Number) within a defined window
- HTS at ISF filing can be 6-digit; entry requires full 10-digit — track both

**ISF Cost Estimation:**
- Customs broker fee for ISF filing: typically $25-$75 per filing
- If using ABI (Automated Broker Interface) software: included in broker's system cost
- Penalty risk cost: factor $5,000 per late filing into risk calculations

**API/Integration Opportunities:**
- ACE (Automated Commercial Environment) is CBP's system for ISF submission
- Direct filing requires ABI certification (expensive, complex)
- Most importers use licensed customs brokers who file via ABI
- Third-party ISF filing services: Flexport, Livingston, C.H. Robinson, etc.

---

## 2. Foreign Trade Zone (FTZ) Regulations — 19 CFR 146

### 2.1 Overview

Foreign Trade Zones (FTZs) are designated areas within the United States that are legally considered outside the customs territory of the US for purposes of duty payment. Governed by the **Foreign Trade Zones Act of 1934** (19 U.S.C. §§ 81a-81u) and implemented through **19 CFR Part 146**, FTZs allow importers to defer, reduce, or eliminate customs duties on imported goods.

**Regulatory bodies:**
- **Foreign-Trade Zones Board** (Department of Commerce) — oversees FTZ establishment and operation
- **CBP** — enforces customs regulations within zones
- **OFIS (Office of Foreign Trade Zones, trade.gov)** — maintains the FTZ database

**Scale:** Over 260 FTZ "general-purpose zones" and 500+ "subzones" across the US as of 2025.

### 2.2 Zone Activation Process (19 CFR 146.6)

Before a zone can operate, it must be **activated** by CBP:

1. **Zone grantee** files application with the local CBP port director
2. CBP conducts a physical inspection of the zone site
3. CBP verifies:
   - Adequate security (fencing, access controls, surveillance)
   - Inventory control and recordkeeping systems
   - Qualified operator with FTZ knowledge
   - Compliance with FTZ Board orders
4. CBP issues an **activation letter** authorizing operations
5. Zone operator must maintain activation requirements continuously

**Timeline:** Activation typically takes 30-90 days after application. Existing activated zones can add new operators more quickly.

**Key point for platform:** Most importers do not activate their own zone. They use an existing activated FTZ operated by a third-party logistics provider (3PL), warehouse, or port authority. The LA/Long Beach port complex has extensive FTZ operations.

### 2.3 Admission of Goods (19 CFR 146.32-146.40)

Goods entering an FTZ must be formally **admitted** using CBP Form 214 (Application for Foreign Trade Zone Admission and/or Status Designation):

| Step | Regulation | Description |
|------|-----------|-------------|
| Application for Admission | 19 CFR 146.32 | Submit CBP Form 214 with commercial invoice, bill of lading, and packing list |
| Examination | 19 CFR 146.33 | CBP may examine goods upon admission |
| Status Designation | 19 CFR 146.41-146.42 | Importer elects PF (Privileged Foreign) or NPF (Non-Privileged Foreign) status |
| Inventory Control | 19 CFR 146.21-146.25 | Zone operator must maintain a perpetual inventory system tracking all goods |
| Time Limit | None (generally) | Goods may remain in an FTZ indefinitely — no time limit, unlike bonded warehouses (which have a 5-year limit under 19 CFR 144.38) |

**Domestic status goods** can also be admitted to FTZs (status: "Domestic") and can be exported without duties.

### 2.4 Privileged Foreign (PF) vs Non-Privileged Foreign (NPF) Status

This is the single most important decision an importer makes when admitting goods to an FTZ.

| Attribute | Privileged Foreign (PF) | Non-Privileged Foreign (NPF) |
|-----------|------------------------|------------------------------|
| **Duty Rate Applied** | Rate in effect **on the date of admission** to the FTZ | Rate in effect **on the date of entry** (withdrawal from FTZ into US commerce) |
| **HTS Classification** | Classification fixed at admission date | Classification may change based on processing/manufacturing in the zone |
| **When to Use** | When you expect duty rates to **increase** (lock in current lower rate) | When you expect duty rates to **decrease** or when manufacturing in FTZ will change the product's classification to a lower-duty item |
| **Election Timing** | Must be elected **at admission** on CBP Form 214 | Default status if no election is made (NPF is the default) |
| **Irrevocability** | Once PF status is granted, it is **irrevocable** for those goods | NPF status can be changed to PF before manipulation, but not after |
| **Use Case** | Tariff protection — lock in duty rates before anticipated Section 301/201/232 increases | Manufacturing operations where finished product has lower duty than components |
| **Section 301/232 Impact** | PF status locks the Section 301/232 rate at admission — if goods were admitted before a tariff increase, the lower rate applies | NPF status means the goods face whatever Section 301/232 rate is in effect when withdrawn |

**Critical: April 2025 Executive Order Impact**

On April 2, 2025, Executive Order 14257 ("Regulating Imports with a Reciprocal Tariff to Rectify Trade Practices") and subsequent CBP guidance fundamentally changed FTZ status elections:

- **For goods subject to reciprocal tariffs (the broad "Liberation Day" tariffs):** CBP mandated that goods admitted to FTZs **must** elect **Privileged Foreign (PF) status** or be treated as PF.
- **Effectively eliminates NPF advantage for reciprocal tariff goods.** The intent was to prevent importers from admitting goods NPF, waiting for tariff rollbacks, and then withdrawing at the lower rate.
- **Retroactive application:** The executive order created uncertainty about goods already in FTZs under NPF status. CBP guidance indicated that goods admitted NPF before the order could maintain their status, but new admissions of goods subject to reciprocal tariffs must be PF.
- **Section 232 goods already had mandatory PF:** Since 2020, goods subject to Section 232 tariffs (steel and aluminum) have been required to take PF status upon FTZ admission.

**What this means for the platform:**
- The FTZ Savings Analyzer must model the mandatory PF requirement for goods subject to reciprocal and Section 232 tariffs.
- The "lock in a lower rate" strategy only works if goods are admitted BEFORE a tariff increase takes effect.
- For goods already in FTZs under NPF, the platform should model the cost difference of withdrawing now vs. later.

### 2.5 Zone-to-Zone Transfers

Goods can be transferred between FTZs without entering US commerce (and thus without paying duties):

- **19 CFR 146.68** governs zone-to-zone transfers
- Transfer requires CBP approval and documentation
- The transfer can be between general-purpose zones, subzones, or a combination
- Status (PF/NPF/Domestic) carries over to the receiving zone
- Common use case: transferring goods from a port-area FTZ to an inland FTZ near the distribution point

**Practical example:** Goods arrive at FTZ 202 (Los Angeles) and are transferred to FTZ 143 (West Sacramento) for distribution to Northern California — no duty is paid until withdrawal from FTZ 143.

### 2.6 Manufacturing in FTZs (Production Authority)

FTZs allow manufacturing/processing activities, but these require additional approvals:

| Requirement | Details |
|-------------|---------|
| **Production Authority** | Must be approved by the FTZ Board (not just CBP). Application filed with the FTZ Board's Executive Secretary. |
| **19 CFR 146.61-146.67** | Manufacturing and processing regulations |
| **Inverted Tariff Benefit** | If the finished product has a LOWER duty rate than its imported components, manufacturing in an FTZ allows entry at the finished product's rate ("inverted tariff" savings) |
| **Public Interest Test** | FTZ Board evaluates whether production authority serves the public interest (considers impact on domestic industry) |
| **Timeline** | Production authority applications can take 6-12 months for approval |
| **Scope Limitation** | Production authority is specific to the products described in the application — you cannot start manufacturing different products without new approval |

**Inverted tariff example:**
- Import raw fabric (HTS 5407: 12% duty) and zippers (HTS 9607: 10% duty) into FTZ
- Manufacture finished jackets in the FTZ
- Withdraw finished jackets (HTS 6202: 8.5% duty)
- Pay 8.5% duty on the finished jacket value, not 12%/10% on components

### 2.7 Weekly Entry Procedures

FTZ operators typically use **weekly entry** procedures for goods withdrawn from the zone:

- **19 CFR 146.63(c)(1)** — Allows zone operators to consolidate multiple withdrawals into a single weekly entry
- CBP Entry Type 06 is used for FTZ entries
- Weekly entry reduces administrative burden and customs broker fees
- The entry covers all goods withdrawn during the prior week (Sunday through Saturday)
- Payment of duties/taxes/fees is due within 10 working days of entry
- Estimated duties can be deposited; final liquidation happens later

### 2.8 FTZ Reporting Requirements

| Report | Frequency | Details |
|--------|-----------|---------|
| **Annual Report** | Annually (due by March 31) | Filed with the FTZ Board. Covers zone activity, value of goods admitted, value of shipments, employment data, and public benefits. Required by 15 CFR 400.52. |
| **AFMS (Automated Foreign-Trade Zone Management System)** | Ongoing | CBP's electronic system for tracking FTZ inventory and operations. Zone operators must use AFMS (or an approved alternative) for all admission, manipulation, manufacture, and withdrawal transactions. |
| **CBP Form 214** | Per admission | Application for admission and status designation |
| **CBP Form 7501** | Per entry (or weekly) | Entry summary for goods withdrawn for US consumption |
| **Inventory records** | Perpetual | Zone operators must maintain perpetual inventory under 19 CFR 146.21-146.25 — CBP can audit at any time |

### 2.9 Benefits Calculation Methodology

For the platform's FTZ Savings Analyzer, model these benefit categories:

#### A. Duty Deferral Savings

```
Duty Deferral Value = (Duty Amount) × (Annual Interest Rate) × (Days in FTZ / 365)
```

- Duties are not paid until goods leave the FTZ
- Calculate the time value of money for deferred duty payments
- Use the importer's cost of capital or the federal funds rate as the discount rate
- For goods stored 90 days: if duty is $100,000 and cost of capital is 6%, deferral savings = $100,000 × 0.06 × (90/365) = **$1,479**

#### B. Duty Elimination on Re-Exports

```
Duty Savings on Re-Export = (Duty Rate × Value of Re-Exported Goods)
```

- If goods admitted to FTZ are subsequently exported (not entered for US consumption), NO duty is ever paid
- Relevant for goods that are rejected, redirected to other markets, or used in manufacturing for export
- Platform should ask: "What percentage of admitted goods will be re-exported?"

#### C. Inverted Tariff Savings (Manufacturing)

```
Inverted Tariff Savings = (Component Duty Rate × Component Value) - (Finished Product Duty Rate × Finished Product Value)
```

- Only applicable if the zone has production authority
- The finished product must have a lower effective duty rate than the components
- Platform should compare: duty on components individually vs. duty on finished product

#### D. Duty Elimination on Waste/Scrap

```
Waste Savings = Duty Rate × Value of Destroyed/Scrapped Goods
```

- If goods are damaged, defective, or become waste during zone operations, they can be destroyed under CBP supervision with no duty owed
- Relevant for perishables and goods with quality control issues

#### E. Logistics and Operational Savings

| Savings Category | Methodology |
|-----------------|-------------|
| **Merchandise Processing Fee (MPF) reduction** | FTZ weekly entry means one MPF per weekly entry instead of per individual entry. MPF is 0.3464% of entered value, with a minimum of $31.67 and maximum of $614.35 per entry. Consolidating entries into weekly reduces the number of minimum MPFs paid. |
| **Customs broker fee reduction** | One entry per week instead of per shipment = fewer broker fees. Typical broker fee: $100-$250 per entry. |
| **Harbor Maintenance Fee (HMF) deferral** | 0.125% of cargo value. Deferred until goods leave the FTZ for US consumption. |
| **Reduced bond costs** | Bond amount may be lower because duty payments are deferred and consolidated |
| **Inventory management** | No time limit in FTZ (vs. 5 years in bonded warehouse). Flexible storage. |

### 2.10 Key FTZ Operators and Zones — LA/Long Beach Area

For SE Asia imports arriving at the Southern California ports:

| Zone | Grantee | Location | Key Features |
|------|---------|----------|-------------|
| **FTZ 202** | City of Long Beach, Board of Harbor Commissioners | Port of Long Beach | Primary zone for port-adjacent operations. Extensive subzones. |
| **FTZ 50** | City of Long Beach, Department of Economic Development | Long Beach area | Older zone grant, overlapping geography with FTZ 202 |
| **FTZ 236** | San Bernardino County | Inland Empire | Major inland logistics hub. Near distribution centers. Subzones at major warehouses. |
| **FTZ 205** | City of Los Angeles, Department of Trade, Commerce & Tourism | Port of Los Angeles | Port-adjacent zone for goods arriving at POLA |
| **FTZ 243** | County of Orange | Orange County | Serves importers distributing in the OC/San Diego corridor |

**Typical 3PL operators offering FTZ services in the area:**
- **NFI Industries** — Operates FTZ-activated warehouses in the Inland Empire
- **Prologis** — Multiple FTZ-activated distribution centers
- **DHL Supply Chain** — FTZ services at major port-adjacent facilities
- **UPS Supply Chain Solutions** — FTZ-activated warehouses
- **XPO Logistics** — Port-adjacent FTZ operations

**Platform note:** The FTZ selection feature should allow users to compare zone options by: proximity to port, proximity to distribution market, storage costs, operator capabilities, and zone-specific fees.

---

## 3. Section 301 Tariffs (China Trade War)

### 3.1 Overview

Section 301 of the Trade Act of 1974 (19 U.S.C. § 2411) authorizes the US Trade Representative (USTR) to impose tariffs and other trade restrictions when a foreign country's trade practices are "unreasonable or discriminatory and burden or restrict US commerce."

The USTR investigation into China's technology transfer, IP theft, and trade practices (initiated August 2017) resulted in four rounds of tariffs beginning in 2018. These tariffs were **in addition to** normal MFN (Most Favored Nation) duty rates.

### 3.2 Current Tariff Lists and Rates (As of 2025-2026)

| List | Effective Date | Initial Rate | Current Rate (2025-2026) | Value of Goods Covered | Key Products |
|------|---------------|-------------|-------------------------|----------------------|--------------|
| **List 1** | July 6, 2018 | 25% | **25%** | ~$34 billion | Industrial machinery, nuclear reactors, electrical equipment, vehicles |
| **List 2** | August 23, 2018 | 25% | **25%** | ~$16 billion | Semiconductors, chemicals, plastics, railway equipment |
| **List 3** | September 24, 2018 | 10% → 25% (May 2019) | **25%** | ~$200 billion | Furniture, textiles, food products, consumer electronics, building materials |
| **List 4A** | September 1, 2019 | 15% → 7.5% (Feb 2020) | **7.5%** (may vary — see below) | ~$120 billion | Consumer products, apparel, footwear, tech accessories |
| **List 4B** | Delayed/partially implemented | 15% (proposed) | **Varies** — some items at 7.5%, some at higher rates after 2024 revisions | ~$160 billion | Phones, laptops, toys, apparel, footwear |

**2024-2025 Rate Increases (USTR Four-Year Review):**

Following the USTR's statutory four-year review (completed September 2024), significant rate increases were imposed on specific sectors:

| Sector | Previous 301 Rate | New Rate | Effective Date |
|--------|-------------------|----------|---------------|
| Electric vehicles (EVs) | 25% | **100%** | September 27, 2024 |
| EV batteries / battery parts | 7.5% | **25%** | September 27, 2024 |
| Solar cells | 25% | **50%** | September 27, 2024 |
| Steel and aluminum | 0-7.5% (301) | **25%** (301 increase, stacking on 232) | September 27, 2024 |
| Semiconductors | 25% | **50%** | January 1, 2025 |
| Ship-to-shore cranes | 0% | **25%** | September 27, 2024 |
| Syringes and needles | 0% | **50%** | September 27, 2024 |
| Medical PPE (masks, gloves) | 7.5% | **25%** | September 27, 2024 |
| Critical minerals | 0% | **25%** | 2025-2026 phased |

**Important:** These Section 301 tariffs **stack on top of** normal MFN duty rates. A product with a 5% MFN duty rate plus a 25% Section 301 tariff faces a combined 30% duty rate.

### 3.3 Exclusion Process

**Product exclusions** allow importers to request that specific products be excluded from Section 301 tariffs:

| Aspect | Details |
|--------|---------|
| **Authority** | USTR manages the exclusion process |
| **Application** | Filed via regulations.gov with detailed product description, HTS classification, and justification |
| **Criteria** | (1) Product only available from China, (2) tariff causes severe economic harm, (3) strategic importance |
| **Duration** | Exclusions are typically granted for 12 months, sometimes retroactive to the original tariff effective date |
| **Renewals** | Must apply for renewal before expiration; no guarantee of extension |
| **Status (2025-2026)** | Most original exclusions have expired. Very few active exclusions remain. USTR has not opened broad new exclusion windows since 2023. |
| **Retroactive refunds** | If an exclusion is granted retroactively, importers can file Post Summary Corrections (PSCs) or protests to recover duties paid |

**Platform note:** Track active exclusions by HTS code. Allow users to check if their products have active exclusions. Flag upcoming exclusion expirations.

### 3.4 China to SE Asia Shift (Trade Diversion)

The Section 301 tariffs triggered massive supply chain restructuring:

| Country | Pre-301 Role | Post-301 Role | Key Products Shifted | 301 Tariff Exposure |
|---------|-------------|---------------|---------------------|-------------------|
| **Vietnam** | Small-scale manufacturing | Major alternative to China for apparel, footwear, electronics assembly | Footwear, apparel, electronics, furniture, textiles | 0% Section 301 (but subject to AD/CVD cases and potential future actions) |
| **Cambodia** | Garment manufacturing | Growing alternative for textiles and garments | Apparel, footwear, travel goods | 0% Section 301 |
| **Thailand** | Automotive, food processing | Electronics, automotive parts, food processing expansion | Auto parts, electronics, processed food, rubber products | 0% Section 301 |
| **Indonesia** | Raw materials, garments | Expanding into footwear, furniture, palm oil products | Footwear, furniture, palm oil, rubber, textiles | 0% Section 301 |
| **India** | IT services, textiles | Growing in electronics assembly, pharmaceuticals | Smartphones, pharmaceuticals, textiles | 0% Section 301 |

**Trade diversion data (illustrative):**
- Vietnam's exports to the US grew from ~$49B (2017) to ~$114B (2023) — a 133% increase
- Cambodia's US exports grew from ~$3.4B to ~$8.4B in the same period
- China's share of US imports declined from ~21% to ~14%

### 3.5 Country-of-Origin and Substantial Transformation Rules

**This is the highest-risk compliance area for SE Asia sourcing.**

| Concept | Rule | Risk |
|---------|------|------|
| **Country of Origin** | The country where the article was wholly obtained or, if materials from multiple countries, where the article last underwent a "substantial transformation" | Misidentifying origin can lead to tariff fraud charges |
| **Substantial Transformation** | A manufacturing process that results in a "new and different article of commerce" with a new name, character, or use. Determined on a case-by-case basis by CBP. | Simply repackaging, relabeling, or minor assembly in Vietnam does NOT change origin from China. |
| **19 CFR 134** | Country of origin marking requirements — every article imported must be marked with the country of origin | Goods marked "Made in Vietnam" but actually substantially produced in China = marking violation + potential Section 301 tariff evasion |
| **Tariff Shift Test** | A change in HTS classification at the heading level (first 4 digits) is strong evidence of substantial transformation | If Chinese components enter Vietnam at HTS 6116 and leave as HTS 6116, no substantial transformation occurred |
| **Value-Added Test** | While not the sole test, CBP considers whether substantial value was added in the claimed country of origin | Assembly that adds only 5-10% of value is unlikely to constitute substantial transformation |

**CBP enforcement examples (illustrative):**
- **EAPA Cases (Enforce and Protect Act):** CBP has investigated companies that shipped Chinese goods through Vietnam with minimal processing to evade Section 301 tariffs. Penalties include duties owed plus interest and potential fraud penalties (4x duties).
- **Operation Mega Flex:** CBP targeted transshipment of solar cells through SE Asia to circumvent Section 301 tariffs.
- **Furniture cases:** Chinese furniture routed through Vietnam with only minor finishing work — CBP ruled the goods were still of Chinese origin.

### 3.6 Anti-Circumvention Enforcement

CBP actively targets transshipment and circumvention schemes:

| Enforcement Tool | Description | Risk to Importer |
|-----------------|-------------|-----------------|
| **EAPA (Enforce and Protect Act)** | Allows CBP to investigate allegations of AD/CVD evasion through transshipment. Interim measures (cash deposits) can be imposed within 90 days. | Cash deposits up to 300%+ of entered value |
| **19 USC § 1592** | Fraud, gross negligence, and negligence penalties for misrepresenting country of origin | Fraud: domestic value of goods. Gross negligence: 4x duties. Negligence: 2x duties. |
| **UFLPA (Uyghur Forced Labor Prevention Act)** | Goods produced in Xinjiang are presumptively made with forced labor and are barred from import. The burden is on the importer to prove otherwise. | Goods detained, seized, or excluded. Reputational risk. |
| **CBP Trade Remedy Enforcement** | TRLED (Trade Remedy Law Enforcement Directorate) targets circumvention | Retroactive duty collection, potential criminal referral |
| **Section 307 (Tariff Act of 1930)** | Prohibits import of goods produced with forced/convict/child labor | Withhold Release Orders (WROs) |

### 3.7 De Minimis — Section 321 ($800 Threshold)

Section 321 of the Tariff Act of 1930 (19 U.S.C. § 1321) provides a **de minimis** exemption for shipments valued at $800 or less:

| Aspect | Current Rule (2025-2026) | Changes/Restrictions |
|--------|-------------------------|---------------------|
| **Threshold** | $800 per person per day | Applies to individual shipments, not aggregated |
| **Duty treatment** | No duties, taxes, or fees owed | Exempt from MPF, HMF, and applicable duties |
| **ISF requirement** | **Still required** for vessel shipments | ISF applies regardless of value |
| **Formal entry** | Not required | Informal entry or Section 321 declaration suffices |
| **Section 301 goods** | **Restricted** — CBP has been tightening de minimis for Section 301 goods from China | As of 2024-2025, goods subject to Section 301 tariffs are increasingly being denied Section 321 treatment |
| **E-commerce impact** | Platforms like Shein, Temu use de minimis heavily for direct-to-consumer China shipments | Proposed legislation (the "De Minimis Reciprocity Act" and others) would eliminate Section 321 for countries subject to Section 301 tariffs |
| **AD/CVD goods** | Section 321 does NOT apply to goods subject to antidumping or countervailing duties | These goods must be formally entered regardless of value |
| **Quota goods** | Section 321 does NOT apply to quota-restricted goods | Formal entry required |

**2025-2026 legislative status:** Multiple bills have been introduced to reform or restrict de minimis. The exact status changes frequently, but the trend is toward:
1. Eliminating de minimis for goods from countries subject to Section 301 tariffs (effectively China)
2. Requiring more data on de minimis shipments (shipper, manufacturer, HTS code)
3. Potentially lowering the threshold from $800

**Platform implementation:** The platform should:
- Flag when a shipment might qualify for de minimis treatment
- Warn that de minimis is under active legislative scrutiny and may change
- Note that de minimis does NOT apply to AD/CVD or quota goods
- Track legislative changes to de minimis rules

---

## 4. Section 201 & 232 Tariffs

### 4.1 Section 201 — Safeguard Tariffs

Section 201 of the Trade Act of 1974 (19 U.S.C. § 2251-2254) allows the President to impose temporary tariffs ("safeguard measures") when an industry is seriously injured or threatened by increased imports.

#### Active Section 201 Tariffs (2025-2026):

**Solar Cells and Modules:**

| Year | Tariff Rate | Notes |
|------|-------------|-------|
| Year 1 (Feb 2018) | 30% | Original safeguard |
| Year 2 | 25% | Scheduled decline |
| Year 3 | 20% | Scheduled decline |
| Year 4 | 15% | Scheduled decline |
| Extension Year 1 (Feb 2022) | 14.75% | Extended by President Biden, with modifications |
| Extension Year 2 | 14.5% | Gradual decline |
| Extension Year 3 | 14.25% | Gradual decline |
| Extension Year 4 (through Feb 2026) | 14% | Current rate |
| **Beyond Feb 2026** | **TBD** | Subject to further extension or expiration |

- **Bifacial solar panels** were initially excluded, then included, then excluded again — check current status before advising
- First 5 GW of cell imports per year were excluded from tariffs under Biden's extension (tariff-rate quota)
- Section 201 tariffs apply **globally** (all countries), unlike Section 301 (China-specific)

**Washing Machines:**

| Year | Tariff Rate (Finished Washers) | Tariff Rate (Parts) |
|------|-------------------------------|-------------------|
| Year 1 (Feb 2018) | 20% (first 1.2M units), 50% above quota | 50% (first 50K units of certain parts) |
| Year 2 | 18% / 45% | 45% |
| Year 3 | 16% / 40% | 40% |
| Years 4-6 (extended) | Declining rates | Declining rates |
| **2025-2026 status** | Likely expired or at minimal rates | Check current Federal Register |

- Tariff-rate quotas: a lower tariff on imports up to a certain volume, higher tariff above
- Applied globally (all countries)
- Samsung and LG responded by building US manufacturing plants

### 4.2 Section 232 — National Security Tariffs

Section 232 of the Trade Expansion Act of 1962 (19 U.S.C. § 1862) authorizes the President to impose tariffs when imports threaten national security.

#### Steel Tariffs (Proclamation 9705, March 2018):

| Product | Tariff Rate | HTS Chapters |
|---------|-------------|-------------|
| **Steel mill products** | **25%** | HTS Chapter 72 (Iron and Steel) and Chapter 73 (Articles of Iron or Steel) |
| **Steel derivatives** | **25%** (added February 2020) | Specific downstream products including steel nails, staples, bumpers, and other fabricated products |

#### Aluminum Tariffs (Proclamation 9704, March 2018):

| Product | Tariff Rate | HTS Chapters |
|---------|-------------|-------------|
| **Aluminum products** | **10%** (increased to **25%** in March 2025 via Proclamation) | HTS Chapter 76 (Aluminum and Articles Thereof) |
| **Aluminum derivatives** | **10-25%** (added February 2020) | Specific downstream products |

**March 2025 Update:** President Trump raised the Section 232 aluminum tariff from 10% to 25%, effective March 12, 2025, matching the steel rate. All country exemptions and quota arrangements for both steel and aluminum were simultaneously terminated.

#### Downstream Products Affected

| Category | Examples | HTS Coverage |
|----------|---------|-------------|
| Steel derivatives | Nails, tacks, staples, drawing pins (HTS 7317); bumper stampings (parts of HTS 8708); certain steel flanges/fittings (HTS 7307) | Specific HTS subheadings enumerated in Proclamation 9980 |
| Aluminum derivatives | Aluminum stranded wire, cables (HTS 7614); aluminum castings (HTS 7616); bumpers (HTS 8708.10) | Specific HTS subheadings enumerated in Proclamation 9980 |

**Note:** The lists of derivative products are specific and limited — not all products containing steel or aluminum are covered. Only the HTS codes enumerated in the proclamations are subject to Section 232 tariffs.

### 4.3 Exclusion Request Process (Section 232)

| Step | Details |
|------|---------|
| **Filing** | Applications filed with the Bureau of Industry and Security (BIS) via regulations.gov |
| **Criteria** | (1) Product not produced in the US in sufficient quantity/quality, (2) national security considerations, (3) severe economic impact on the applicant |
| **Objection period** | 30 days for domestic producers to object |
| **Decision timeline** | BIS aims for 90 days but historically has taken 6-12 months |
| **Scope** | Exclusions are product-specific (by HTS code and specifications) and company-specific or general |
| **Volume limits** | Exclusions may be granted for a specific quantity (annual volume) |
| **Duration** | Typically 1 year; renewable |
| **2025 status** | With the March 2025 changes eliminating country exemptions, new exclusion requests are expected to surge |

### 4.4 FTZ Treatment of Section 232 Tariffs

**This is a critical point that affects FTZ strategy:**

| Rule | Details |
|------|---------|
| **Mandatory PF Status** | Since 2020, goods subject to Section 232 tariffs **must** be admitted to FTZs under **Privileged Foreign (PF) status**. They cannot elect NPF. |
| **No FTZ duty avoidance** | The mandatory PF rule means that Section 232 tariffs are "locked in" at the admission rate — importers cannot use NPF status to wait for a lower rate |
| **Rationale** | The government determined that allowing NPF status for Section 232 goods would undermine the national security purpose of the tariffs |
| **Practical impact** | FTZ benefits for steel/aluminum are limited to: (1) duty deferral (time value of money), (2) duty elimination on re-exports, (3) weekly entry consolidation |
| **Inverted tariff still possible** | If manufacturing in the FTZ converts steel/aluminum components into a finished product with a lower combined duty rate, the inverted tariff benefit still applies |

### 4.5 Country Exemptions and Quota Arrangements (Historical and Current)

**Pre-March 2025:**

| Country | Steel | Aluminum |
|---------|-------|----------|
| **Canada** | Exempt (USMCA) | Exempt (USMCA) |
| **Mexico** | Exempt (USMCA) | Exempt (USMCA) |
| **Australia** | Exempt (bilateral agreement) | Exempt (bilateral agreement) |
| **Argentina** | Quota arrangement | Quota arrangement |
| **Brazil** | Quota arrangement | Exempt |
| **South Korea** | Quota arrangement | Not exempt |
| **EU** | Tariff-rate quota (TRQ) | Tariff-rate quota (TRQ) |
| **Japan** | Not exempt | Quota arrangement |
| **UK** | Tariff-rate quota (TRQ) | Tariff-rate quota (TRQ) |

**Post-March 2025 (Proclamation effective March 12, 2025):**

- **ALL country exemptions and quota arrangements were terminated**
- **All countries** now face the full 25% tariff on steel and 25% tariff on aluminum
- This includes Canada and Mexico (previously exempt under USMCA)
- Retaliatory tariffs from Canada, EU, and others followed

**Platform implementation:** The calculator must apply the 25% rate universally for steel and aluminum products. The historical exemption data is useful for modeling cost impacts of the policy change.

---

## 5. Bonding Requirements

### 5.1 Overview

A customs bond is a financial guarantee between the importer (principal), a surety company, and CBP (obligee) that ensures the importer will comply with all laws and regulations governing the importation of goods, including payment of duties, taxes, and fees.

**Legal basis:** 19 CFR Part 113 (Customs Bonds)

### 5.2 Continuous Entry Bond vs. Single Entry Bond

| Attribute | Continuous Entry Bond | Single Entry Bond (STB) |
|-----------|---------------------|------------------------|
| **Coverage** | Covers ALL imports for a 12-month period | Covers ONE specific import transaction |
| **Bond type** | Activity Code 1 — Importer or Broker Continuous Bond | Activity Code 1 — Single Transaction Bond |
| **Duration** | 1 year, auto-renews unless cancelled | Single transaction only |
| **Minimum amount** | **$50,000** | Typically the entered value + duties + taxes + fees for the single shipment |
| **Cost (premium)** | Typically **$400-$2,500/year** for a $50,000 bond (depends on importer risk profile) | Typically **$50-$500 per shipment** depending on value |
| **When to use** | Importing 3+ times per year, or when total annual duties exceed a few thousand dollars | One-time or very infrequent imports (1-2 per year) |
| **ISF coverage** | Yes — covers ISF filing obligations | Yes — covers ISF for that single shipment |
| **Application** | Through a licensed surety company or customs broker | Through customs broker at time of entry |

### 5.3 Bond Calculation

**Continuous entry bond amount formula:**

```
Bond Amount = MAX($50,000, 10% × (Duties + Taxes + Fees paid in prior 12 months))
```

| Factor | Details |
|--------|---------|
| **Minimum** | $50,000 regardless of import volume |
| **Standard calculation** | 10% of duties, taxes, and fees paid in the prior 12-month period |
| **Rounding** | Rounded UP to the nearest $10,000 |
| **New importers** | $50,000 minimum (no prior history to calculate from) |
| **High-value importers** | If duties were $2M last year: bond = $200,000 |
| **AD/CVD goods** | Bond may need to be significantly higher — CBP may require bond to cover potential AD/CVD liability (can be 100%+ of entered value) |
| **Section 301/232 goods** | The tariff surcharges count as "duties" for bond calculation purposes, potentially increasing the required bond amount |

**Example calculations:**

| Scenario | Prior Year Duties/Taxes/Fees | Bond Amount |
|----------|----------------------------|-------------|
| New importer, first shipment | $0 | $50,000 (minimum) |
| Small importer | $150,000 | $50,000 (10% = $15,000, below minimum) |
| Mid-size importer | $800,000 | $80,000 |
| Large importer | $5,000,000 | $500,000 |
| AD/CVD importer (enhanced) | $1,000,000 + CBP requires higher | $500,000-$2,000,000+ (CBP discretion) |

### 5.4 Sufficiency Reviews

CBP periodically reviews whether existing bond amounts are sufficient:

| Aspect | Details |
|--------|---------|
| **Trigger** | CBP conducts sufficiency reviews when import patterns change significantly, when an importer's risk profile changes, or during routine audits |
| **Insufficient bond** | If CBP determines the bond is insufficient, the importer receives a notice to increase the bond amount within 30 days |
| **Failure to increase** | CBP can refuse to release future shipments until the bond is increased |
| **Frequency** | No set schedule — CBP may review at any time |
| **Common trigger** | An importer who previously imported $500K/year suddenly imports $5M — the bond is now grossly insufficient |
| **Section 301/232 impact** | The tariff increases from 2018-2025 caused many importers' bonds to become insufficient as their annual duty payments jumped dramatically |

### 5.5 When to Upgrade from Single to Continuous

**Switch from STB to continuous bond when:**

| Signal | Threshold |
|--------|-----------|
| **Import frequency** | Importing 3+ times per year |
| **Cost comparison** | Total annual STB premiums exceed continuous bond premium |
| **Predictability** | Regular, ongoing import program (not one-time) |
| **Multiple ports** | Importing through more than one port of entry |
| **ISF filing** | Regular ISF filing needs |
| **CBP requirement** | CBP may require a continuous bond for certain activities |

**Cost break-even example:**
- Continuous bond premium for $50,000 bond: ~$500/year
- STB cost: ~$100 per transaction
- Break-even: ~5 shipments/year
- If importing monthly: continuous bond saves ~$700/year in premium costs

### 5.6 Bond Requirements for ISF Filing

| Requirement | Details |
|-------------|---------|
| **Bond is mandatory for ISF** | Cannot file ISF without a bond in place |
| **Same bond covers both** | A continuous entry bond covers both formal entry and ISF obligations |
| **STB for ISF** | If using a single transaction bond, it must be in place before the ISF is filed |
| **Bond type** | Activity Code 1 bonds (import bonds) cover ISF — no separate ISF-specific bond needed for most importers |
| **Penalty coverage** | The bond guarantees payment of ISF penalties ($5,000-$10,000) if assessed by CBP |
| **Pre-filing requirement** | The bond must be active in CBP's system before the ISF can be transmitted via ABI |

### 5.7 Single Transaction Bond (STB) for One-Off Imports

| Aspect | Details |
|--------|---------|
| **Use case** | First-time importers, one-off purchases, sample shipments, testing new products |
| **Amount** | Total entered value + estimated duties + taxes + fees (rounded up) |
| **Premium** | Typically 1-5% of the bond amount, minimum $50-100 |
| **Timing** | Must be in place before entry filing (or ISF filing if applicable) |
| **Procurement** | Through customs broker (who arranges with their surety) or directly from a surety company |
| **Limitations** | Covers only one shipment. No carryover. More expensive per-shipment than continuous for regular importers. |
| **For high-value one-offs** | If importing a $500,000 shipment with 25% tariff: STB amount = $500,000 + $125,000 + fees ≈ $640,000. Premium might be $6,400-$32,000 for a single shipment. |

### 5.8 Surety Companies and Application Process

**Licensed sureties for customs bonds:**

Only surety companies listed on the **Treasury Department's Circular 570** (list of approved sureties) can write customs bonds. Major players include:

| Surety Company | Notes |
|----------------|-------|
| **Roanoke Insurance Group** | Largest customs bond surety in the US. Specializes exclusively in customs/trade bonds. |
| **Avalon Risk Management** | Major customs bond surety, strong in SMB market |
| **International Fidelity Insurance Company (IFIC)** | Large customs bond writer |
| **Lexon Insurance Company** | Customs bond specialist |
| **Great American Insurance Company** | Broad surety, writes customs bonds |
| **Hartford Fire Insurance Company** | Large surety capacity |
| **Travelers Casualty and Surety Company** | Major surety, customs bond line |

**Application process:**

| Step | Details |
|------|---------|
| 1. **Select a customs broker** | Most importers obtain bonds through their customs broker, who has relationships with multiple sureties |
| 2. **Complete application** | Business information, EIN, import history, financial statements (for bonds over $100K) |
| 3. **Financial review** | Surety evaluates creditworthiness. For bonds up to $100K, often approved with minimal documentation. Over $100K may require financial statements. |
| 4. **CBP registration** | Importer must have a CBP Importer of Record number (can use EIN) |
| 5. **Bond execution** | Surety issues the bond; customs broker files it with CBP via ABI |
| 6. **Activation** | Bond becomes active in CBP's system within 1-3 business days |
| 7. **Premium payment** | Annual premium paid to surety. Due at issuance and on each anniversary. |

**Approval timeline:** Simple cases (new importer, $50,000 bond): 1-3 business days. Complex cases (high value, poor credit, AD/CVD): 1-4 weeks.

### 5.9 Implementation Notes for Platform (Bond Cost Estimation)

**Bond cost estimator inputs:**
- Annual import value (FOB)
- Country of origin (affects duty rates)
- Product HTS codes (determines duty rate, Section 301/232 applicability)
- Import frequency (per year)
- Whether goods are subject to AD/CVD orders

**Bond cost estimator outputs:**

```
1. Recommended bond type (STB vs. Continuous)
2. Minimum bond amount = MAX($50,000, ROUNDUP(EstimatedAnnualDuties × 10%, -4))
3. Estimated annual premium = BondAmount × PremiumRate
   - PremiumRate: 0.5% - 5% depending on risk (use 1.5% as default)
4. Per-shipment equivalent cost = AnnualPremium / ShipmentsPerYear
5. STB alternative cost = ShipmentsPerYear × PerShipmentSTBCost
6. Recommendation: Continuous if AnnualPremium < TotalSTBCost
```

**Bond premium rate factors:**
- Importer creditworthiness: better credit = lower premium
- Import history: established importers with clean records get lower rates
- Product risk: AD/CVD goods or high-tariff goods = higher premium
- Bond amount: larger bonds may get volume discounts on the rate
- Industry: certain industries (textiles, agriculture) may face higher premiums

**Default premium rates for estimation:**

| Bond Amount | Typical Premium Range | Default for Calculator |
|-------------|----------------------|----------------------|
| $50,000 | $400-$1,200/year | $800/year (1.6%) |
| $100,000 | $600-$2,000/year | $1,200/year (1.2%) |
| $250,000 | $1,200-$5,000/year | $2,750/year (1.1%) |
| $500,000 | $2,500-$10,000/year | $5,000/year (1.0%) |
| $1,000,000+ | $5,000-$25,000/year | $9,000/year (0.9%) |

---

## 6. Platform Implementation Notes

### 6.1 Compliance Features Priority Matrix

| Feature | User Value | Complexity | Phase | Data Needed |
|---------|-----------|------------|-------|------------|
| ISF deadline calculator | HIGH | LOW | 2 | Vessel schedule, departure port |
| Bond cost estimator | HIGH | LOW | 2 | Annual import value, HTS codes |
| Section 301 tariff lookup | HIGH | MEDIUM | 2 | HTS codes, country of origin, current tariff lists |
| FTZ savings calculator | HIGH | HIGH | 4 | All duty data + FTZ costs + storage time |
| Section 232 applicability check | MEDIUM | LOW | 2 | HTS codes (Chapter 72, 73, 76) |
| De minimis eligibility check | MEDIUM | LOW | 2 | Shipment value, product type, origin country |
| Country of origin risk assessment | HIGH | MEDIUM | 3 | Supply chain data, processing details |
| Exclusion tracker | LOW | MEDIUM | 5 | Active exclusion list from USTR |
| ISF filing tracker | MEDIUM | HIGH | 5+ | ABI integration or broker API |

### 6.2 Data Sources for Compliance Features

| Data Need | Source | Update Frequency | Confidence |
|-----------|--------|-----------------|------------|
| HTS duty rates | USITC hts.usitc.gov (JSON/CSV download) | Multiple times per year | HIGH |
| Section 301 tariff lists | USTR.gov + Federal Register | As amended | HIGH |
| Section 232 covered products | BIS.doc.gov + Proclamations | As amended | HIGH |
| FTZ locations | OFIS trade.gov | Ongoing | HIGH |
| Active 301 exclusions | USTR.gov + Federal Register | As granted/expired | MEDIUM |
| Bond premium rates | Industry surveys (no public database) | Annually | LOW-MEDIUM |
| ISF penalty data | CBP.gov enforcement actions | Periodic | MEDIUM |

### 6.3 Disclaimers and Legal Warnings

Every compliance feature MUST include:

1. **"For informational purposes only"** — the platform does not provide legal, customs brokerage, or trade compliance advice
2. **"Consult a licensed customs broker"** — for actual import transactions
3. **"Rates as of [date]"** — tariff rates change; always display the data date
4. **"Subject to change"** — trade policy is dynamic; rates can change with executive orders, legislation, or USTR actions
5. **"Not a substitute for professional classification"** — HTS classification is complex and the platform's suggestions are not binding

### 6.4 Landed Cost Formula — Full Compliance-Aware Version

```
Landed Cost Per Unit =
  Product Cost (FOB)
  + International Freight (per unit)
  + Marine Insurance (per unit)
  + US Customs Duty (MFN rate × dutiable value)
  + Section 301 Tariff (if applicable: rate × dutiable value)
  + Section 232 Tariff (if applicable: 25% × dutiable value)
  + Section 201 Tariff (if applicable: rate × dutiable value)
  + Merchandise Processing Fee (0.3464% × entered value, min $31.67, max $614.35)
  + Harbor Maintenance Fee (0.125% × cargo value)
  + ISF Filing Fee ($25-$75 per B/L, amortized per unit)
  + Customs Broker Fee ($100-$250 per entry, amortized per unit)
  + Bond Cost (annual premium amortized per unit)
  + Container Drayage (per unit)
  + Warehouse/FTZ Fees (per unit)
  + Examination Fees (if selected — $300-$1,000 per container, probability-weighted)
  + Demurrage/Detention Risk (probability-weighted per unit)
```

---

## 7. Cross-Reference Matrix

How the five regulatory areas interact with each other:

| | ISF | FTZ | Section 301 | Section 201/232 | Bonding |
|---|-----|-----|-------------|----------------|---------|
| **ISF** | — | ISF required before FTZ admission | ISF must include HTS (which determines 301 applicability) | ISF must include HTS (which determines 232 applicability) | Bond required for ISF filing |
| **FTZ** | ISF before admission | — | FTZ can defer 301 duties; PF locks rate; NPF restricted by April 2025 EO | Mandatory PF status for 232 goods | Bond required for FTZ entry (Type 06) |
| **Section 301** | HTS on ISF determines 301 exposure | FTZ strategy critical for 301 goods (rate-lock timing) | — | Can stack with 232 on same goods (steel/aluminum from China) | 301 duties increase bond amount |
| **Section 201/232** | HTS on ISF determines 232 exposure | Mandatory PF for 232; limited FTZ benefit | Stacks on 301 for applicable goods | — | 232 duties increase bond amount |
| **Bonding** | Required for ISF | Required for FTZ entry | 301 duties increase minimum bond | 232 duties increase minimum bond | — |

---

## Appendix A: Key CFR References

| Citation | Topic |
|----------|-------|
| 19 CFR Part 113 | Customs Bonds |
| 19 CFR Part 134 | Country of Origin Marking |
| 19 CFR Part 141 | Entry of Merchandise |
| 19 CFR Part 142 | Entry Process |
| 19 CFR Part 144 | Warehouse Entry |
| 19 CFR Part 146 | Foreign Trade Zones |
| 19 CFR Part 149 | Importer Security Filing |
| 19 CFR Part 159 | Liquidation of Duties |
| 19 CFR Part 174 | Protests |
| 19 CFR Part 177 | Rulings |
| 15 CFR Part 400 | FTZ Board Regulations |
| 19 U.S.C. § 1321 | De Minimis (Section 321) |
| 19 U.S.C. § 1592 | Penalties for Fraud/Negligence |
| 19 U.S.C. § 1862 | Section 232 (National Security) |
| 19 U.S.C. § 2251 | Section 201 (Safeguard) |
| 19 U.S.C. § 2411 | Section 301 (Trade Act) |

## Appendix B: Penalty Summary Table

| Violation | Statute | Penalty Range |
|-----------|---------|---------------|
| Late ISF filing | 19 CFR 149.4 | $5,000 per violation |
| Failure to file ISF | 19 CFR 149.4 | Up to $10,000 per violation |
| Negligent entry violation | 19 U.S.C. § 1592(c) | 2× duties owed |
| Gross negligence entry violation | 19 U.S.C. § 1592(b) | 4× duties owed (or domestic value) |
| Fraud | 19 U.S.C. § 1592(a) | Domestic value of goods |
| Country of origin marking violation | 19 U.S.C. § 1304 | 10% additional duty |
| HTS misclassification (negligence) | 19 U.S.C. § 1592 | 2× duties lost |
| Bond insufficiency (failure to increase) | 19 CFR 113.13 | Withholding of release |
| FTZ inventory violation | 19 CFR 146.25 | Zone deactivation risk |
| UFLPA violation | 19 U.S.C. § 1307 | Seizure and forfeiture |

---

*Research completed: 2026-03-26*
*Confidence: HIGH — based on published CFR, Federal Register, CBP guidance*
*Next action: Integrate findings into FTZ Savings Analyzer (Phase 4) and Landed Cost Calculator (Phase 2)*

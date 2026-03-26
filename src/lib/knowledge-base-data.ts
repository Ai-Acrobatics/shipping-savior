// Knowledge Base Data — Shipping Savior Phase 5

export interface GlossaryTerm {
  term: string;
  abbreviation?: string;
  definition: string;
  category: "customs" | "freight" | "trade" | "ftz" | "documentation" | "finance";
}

export interface Incoterm {
  code: string;
  name: string;
  risk: "buyer" | "seller" | "split";
  transport: "any" | "sea";
  sellerCovers: string[];
  buyerCovers: string[];
  bestFor: string;
  riskTransferPoint: string;
}

export interface ComplianceGuide {
  id: string;
  title: string;
  category: "cbp" | "itar" | "export" | "fda" | "aphis" | "general";
  summary: string;
  keyPoints: string[];
  forms?: string[];
  deadlines?: string[];
  penalties?: string;
}

export interface TradeRegulation {
  id: string;
  region: string;
  country?: string;
  type: "tariff" | "restriction" | "fta" | "embargo" | "quota";
  title: string;
  description: string;
  htsCodes?: string[];
  effectiveDate?: string;
  source: string;
}

export const glossaryTerms: GlossaryTerm[] = [
  // Customs
  {
    term: "Harmonized Tariff Schedule",
    abbreviation: "HTS",
    definition: "The numerical system used to classify all goods imported into the US. Each product has a 10-digit HTS code that determines the applicable duty rate.",
    category: "customs",
  },
  {
    term: "Merchandise Processing Fee",
    abbreviation: "MPF",
    definition: "A CBP fee charged on most formal imports, set at 0.3464% of the entered value with a minimum of $31.67 and maximum of $614.35 per entry.",
    category: "customs",
  },
  {
    term: "Harbor Maintenance Fee",
    abbreviation: "HMF",
    definition: "A fee of 0.125% assessed on the value of commercial cargo loaded at US ports or shipped through foreign ports. Funds maintenance of US harbors.",
    category: "customs",
  },
  {
    term: "Importer Security Filing",
    abbreviation: "ISF",
    definition: "Also called '10+2', an ISF must be filed at least 24 hours before goods are loaded onto an ocean vessel destined for the US. Failure results in $5,000 penalty per violation.",
    category: "customs",
  },
  {
    term: "Entry Summary",
    abbreviation: "CBP Form 7501",
    definition: "The formal document filed with US Customs to declare imported merchandise and calculate applicable duties, taxes, and fees.",
    category: "customs",
  },
  {
    term: "Continuous Bond",
    abbreviation: "CB",
    definition: "An annual customs surety bond that covers all imports for a year. Required for formal entries. Typically 10% of estimated annual duties, minimum $50,000.",
    category: "customs",
  },
  {
    term: "Drawback",
    abbreviation: "",
    definition: "A refund of duties paid on imported goods that are subsequently exported or used in manufacturing exported goods. Up to 99% of duties can be recovered.",
    category: "customs",
  },
  {
    term: "Binding Ruling",
    abbreviation: "",
    definition: "A written decision by CBP on the tariff classification or country of origin of a product. Provides certainty before importing and is legally binding on CBP.",
    category: "customs",
  },
  {
    term: "Prior Disclosure",
    abbreviation: "PD",
    definition: "A voluntary disclosure to CBP of potential customs violations before CBP discovers them. Reduces penalties from up to 4x the unpaid duties to only the interest owed.",
    category: "customs",
  },
  {
    term: "Consumption Entry",
    abbreviation: "",
    definition: "The most common type of CBP entry, used when merchandise is intended to remain permanently in the US commerce.",
    category: "customs",
  },
  // Freight
  {
    term: "Full Container Load",
    abbreviation: "FCL",
    definition: "A shipment that fills an entire container (typically 20ft or 40ft). More cost-effective per unit than LCL for larger volumes.",
    category: "freight",
  },
  {
    term: "Less than Container Load",
    abbreviation: "LCL",
    definition: "Cargo that does not fill an entire container. Multiple shippers share container space. Usually quoted per cubic meter (CBM) or per 1,000 kg.",
    category: "freight",
  },
  {
    term: "Twenty-Foot Equivalent Unit",
    abbreviation: "TEU",
    definition: "Standard unit for measuring container capacity. One 20ft container = 1 TEU. One 40ft container = 2 TEUs.",
    category: "freight",
  },
  {
    term: "Demurrage",
    abbreviation: "",
    definition: "A charge assessed when a container is not picked up from the port terminal within the free time period (typically 3-5 days after vessel arrival).",
    category: "freight",
  },
  {
    term: "Detention",
    abbreviation: "",
    definition: "A charge assessed when a container is not returned to the carrier's depot within the free time period after being picked up from the terminal.",
    category: "freight",
  },
  {
    term: "Drayage",
    abbreviation: "",
    definition: "The short-distance transportation of cargo, typically from a port or rail yard to a nearby warehouse or distribution center.",
    category: "freight",
  },
  {
    term: "Bill of Lading",
    abbreviation: "BOL / B/L",
    definition: "A legal document issued by a carrier to acknowledge receipt of cargo for shipment. Functions as a contract of carriage, receipt of goods, and title document.",
    category: "freight",
  },
  {
    term: "Ocean Carrier",
    abbreviation: "OC",
    definition: "A company that operates ocean vessels for hire to transport cargo between ports. Major carriers include Maersk, MSC, CMA CGM, COSCO.",
    category: "freight",
  },
  {
    term: "Non-Vessel Operating Common Carrier",
    abbreviation: "NVOCC",
    definition: "A freight forwarder that issues its own bills of lading but does not operate vessels. Acts as a carrier to shippers but as a shipper to vessel operators.",
    category: "freight",
  },
  {
    term: "Freight All Kinds",
    abbreviation: "FAK",
    definition: "A freight rate that applies regardless of the specific commodity, treating all goods equally. Common in contracts between large shippers and carriers.",
    category: "freight",
  },
  {
    term: "Chassis",
    abbreviation: "",
    definition: "A wheeled frame used to transport a shipping container by truck. Shippers typically pay a daily chassis rental fee when using containers for ground transport.",
    category: "freight",
  },
  {
    term: "Backhaul",
    abbreviation: "",
    definition: "The return trip of a carrier after delivering cargo. Carriers often discount rates significantly for backhaul moves to avoid running empty. A major cost-saving opportunity.",
    category: "freight",
  },
  {
    term: "Transshipment",
    abbreviation: "T/S",
    definition: "Moving cargo from one vessel to another at an intermediate port to reach the final destination. Common for routes without direct service.",
    category: "freight",
  },
  // Trade
  {
    term: "Country of Origin",
    abbreviation: "COO",
    definition: "The country where a product was manufactured or substantially transformed. Determines the applicable duty rate and eligibility for free trade agreement benefits.",
    category: "trade",
  },
  {
    term: "Rules of Origin",
    abbreviation: "ROO",
    definition: "Criteria used to determine the national source of a product. Critical for FTA eligibility. Includes substantial transformation, tariff shift, and regional value content tests.",
    category: "trade",
  },
  {
    term: "Most Favored Nation",
    abbreviation: "MFN",
    definition: "The standard duty rate applied to imports from WTO member countries. Also called the 'normal trade relations' rate in the US.",
    category: "trade",
  },
  {
    term: "Anti-Dumping Duty",
    abbreviation: "ADD",
    definition: "Additional duties imposed when imported goods are sold below market value (dumping) and cause material injury to a domestic industry. Can be as high as several hundred percent.",
    category: "trade",
  },
  {
    term: "Countervailing Duty",
    abbreviation: "CVD",
    definition: "Additional duties imposed to offset subsidies provided by foreign governments to their exporters. Applied on top of regular duties.",
    category: "trade",
  },
  {
    term: "Section 301 Tariff",
    abbreviation: "301",
    definition: "Additional tariffs on Chinese goods ranging from 7.5% to 100%+ under Section 301 of the Trade Act of 1974. Applied in addition to MFN rates. Check exclusions.",
    category: "trade",
  },
  {
    term: "Free Trade Agreement",
    abbreviation: "FTA",
    definition: "A treaty between countries that reduces or eliminates tariffs on qualifying goods. The US has 14 FTAs covering 20 countries including USMCA, KORUS, and US-Colombia.",
    category: "trade",
  },
  // FTZ
  {
    term: "Foreign Trade Zone",
    abbreviation: "FTZ",
    definition: "A designated US site treated as outside CBP territory for duty purposes. Goods can be stored, manipulated, manufactured, and re-exported without paying US duties until they enter US commerce.",
    category: "ftz",
  },
  {
    term: "Subzone",
    abbreviation: "SZ",
    definition: "A special-purpose FTZ site typically used by a single company for manufacturing or warehousing. Can be at the company's own facility away from the general-purpose FTZ.",
    category: "ftz",
  },
  {
    term: "Weekly Entry",
    abbreviation: "WE",
    definition: "A CBP privilege allowing FTZ operators to file one entry per week rather than per shipment, significantly reducing customs brokerage fees and administrative burden.",
    category: "ftz",
  },
  {
    term: "Inverted Tariff",
    abbreviation: "",
    definition: "A situation where the duty rate on finished goods is lower than the duty rate on inputs. FTZ manufacturing can take advantage by paying the lower finished goods rate.",
    category: "ftz",
  },
  {
    term: "Zone Admission",
    abbreviation: "ZA",
    definition: "The process of officially bringing merchandise into an FTZ under CBP supervision. Goods receive FTZ status and duty deferral begins.",
    category: "ftz",
  },
  // Documentation
  {
    term: "Commercial Invoice",
    abbreviation: "CI",
    definition: "A document from seller to buyer listing goods sold, quantities, prices, and terms. Required for customs clearance and used to determine import value for duty purposes.",
    category: "documentation",
  },
  {
    term: "Packing List",
    abbreviation: "PL",
    definition: "A document that itemizes the contents of each package in a shipment, including weight and dimensions. Required by customs and the carrier.",
    category: "documentation",
  },
  {
    term: "Certificate of Origin",
    abbreviation: "CO",
    definition: "A document certifying the country where goods were produced. Required for FTA duty preferences. Must often be issued by a Chamber of Commerce.",
    category: "documentation",
  },
  {
    term: "Shipper's Export Declaration",
    abbreviation: "SED / AES",
    definition: "Now replaced by Electronic Export Information (EEI) filed in the Automated Export System. Required for US exports with value over $2,500 per Schedule B item.",
    category: "documentation",
  },
  {
    term: "Phytosanitary Certificate",
    abbreviation: "",
    definition: "A certificate issued by the exporting country's national plant protection organization stating that plants or plant products meet import requirements.",
    category: "documentation",
  },
  // Finance
  {
    term: "Letter of Credit",
    abbreviation: "LC",
    definition: "A financial instrument from a bank guaranteeing that a buyer's payment will be received by the seller on time and for the correct amount. Reduces payment risk in international trade.",
    category: "finance",
  },
  {
    term: "Landed Cost",
    abbreviation: "",
    definition: "The total cost of a product delivered to its destination: unit cost + shipping + insurance + customs duties + taxes + fees. The true cost of imported goods.",
    category: "finance",
  },
  {
    term: "Transfer Pricing",
    abbreviation: "TP",
    definition: "The price set for transactions between related companies (e.g., parent and subsidiary). Must be at arm's length for customs purposes; CBP scrutinizes related-party pricing.",
    category: "finance",
  },
];

export const incoterms: Incoterm[] = [
  {
    code: "EXW",
    name: "Ex Works",
    risk: "buyer",
    transport: "any",
    sellerCovers: ["Making goods available at their premises"],
    buyerCovers: ["All costs and risks from seller's premises", "Export clearance", "Loading", "Main freight", "Import clearance", "Delivery"],
    bestFor: "Sellers who want minimal responsibility. Buyers with strong logistics networks.",
    riskTransferPoint: "Seller's premises / factory",
  },
  {
    code: "FCA",
    name: "Free Carrier",
    risk: "split",
    transport: "any",
    sellerCovers: ["Export clearance", "Delivery to named carrier at named place"],
    buyerCovers: ["Main freight", "Insurance (optional)", "Import clearance", "Delivery to destination"],
    bestFor: "Container shipments from a seller's facility. Preferred for FCL ocean shipments in many contracts.",
    riskTransferPoint: "Named place (e.g., seller's factory or carrier terminal)",
  },
  {
    code: "CPT",
    name: "Carriage Paid To",
    risk: "split",
    transport: "any",
    sellerCovers: ["Export clearance", "Main freight to named destination"],
    buyerCovers: ["Insurance", "Import clearance", "Costs from named destination"],
    bestFor: "Multi-modal transport. Risk transfers at first carrier but seller pays freight to destination.",
    riskTransferPoint: "First carrier (seller pays freight further)",
  },
  {
    code: "CIP",
    name: "Carriage and Insurance Paid To",
    risk: "split",
    transport: "any",
    sellerCovers: ["Export clearance", "Main freight", "Insurance (minimum 110% of contract value)"],
    buyerCovers: ["Import clearance", "Costs from named destination"],
    bestFor: "High-value cargo where seller provides insurance. Common for air freight.",
    riskTransferPoint: "First carrier (seller pays freight and insurance further)",
  },
  {
    code: "DAP",
    name: "Delivered at Place",
    risk: "seller",
    transport: "any",
    sellerCovers: ["Export clearance", "All freight and insurance", "Delivery to named place"],
    buyerCovers: ["Unloading", "Import clearance", "Import duties"],
    bestFor: "Buyers who want seller to handle freight but prefer to control import clearance.",
    riskTransferPoint: "Named destination (ready for unloading)",
  },
  {
    code: "DPU",
    name: "Delivered at Place Unloaded",
    risk: "seller",
    transport: "any",
    sellerCovers: ["Export clearance", "All freight", "Delivery AND unloading at destination"],
    buyerCovers: ["Import clearance", "Import duties"],
    bestFor: "When seller can handle unloading. New in Incoterms 2020, replaced DAT.",
    riskTransferPoint: "Named destination (after unloading)",
  },
  {
    code: "DDP",
    name: "Delivered Duty Paid",
    risk: "seller",
    transport: "any",
    sellerCovers: ["Everything — export, freight, insurance, import clearance, duties"],
    buyerCovers: ["Unloading (sometimes)"],
    bestFor: "Buyers who want maximum simplicity. Risky for sellers if duties are uncertain.",
    riskTransferPoint: "Buyer's premises (most seller responsibility)",
  },
  {
    code: "FAS",
    name: "Free Alongside Ship",
    risk: "split",
    transport: "sea",
    sellerCovers: ["Export clearance", "Delivery alongside vessel at named port"],
    buyerCovers: ["Loading", "Main sea freight", "Insurance", "Import clearance"],
    bestFor: "Bulk cargo and heavy machinery at named port of shipment.",
    riskTransferPoint: "Alongside the vessel at port of shipment",
  },
  {
    code: "FOB",
    name: "Free On Board",
    risk: "split",
    transport: "sea",
    sellerCovers: ["Export clearance", "Delivery onto the vessel at named port"],
    buyerCovers: ["Main sea freight", "Insurance", "Import clearance", "Delivery"],
    bestFor: "The most common term for ocean cargo. Risk transfers when goods cross ship's rail.",
    riskTransferPoint: "On board vessel at port of shipment",
  },
  {
    code: "CFR",
    name: "Cost and Freight",
    risk: "split",
    transport: "sea",
    sellerCovers: ["Export clearance", "Main sea freight to destination port"],
    buyerCovers: ["Insurance", "Import clearance", "Delivery from destination port"],
    bestFor: "When seller has better freight rates. Buyer should buy insurance.",
    riskTransferPoint: "On board vessel (seller pays freight to destination port)",
  },
  {
    code: "CIF",
    name: "Cost, Insurance and Freight",
    risk: "split",
    transport: "sea",
    sellerCovers: ["Export clearance", "Main sea freight", "Insurance (minimum coverage)"],
    buyerCovers: ["Import clearance", "Delivery from destination port"],
    bestFor: "Common for bulk commodities. Note: risk still transfers on board at origin.",
    riskTransferPoint: "On board vessel (seller pays freight and insurance to destination)",
  },
];

export const complianceGuides: ComplianceGuide[] = [
  {
    id: "isf-filing",
    title: "Importer Security Filing (ISF 10+2)",
    category: "cbp",
    summary: "Required CBP pre-arrival data submission for ocean shipments. Must be filed 24 hours before goods are laden aboard a foreign vessel destined to the US.",
    keyPoints: [
      "10 data elements from importer: seller, buyer, importer of record, consignee, manufacturer/supplier, ship-to party, country of origin, commodity HTS number, container stuffing location, consolidator",
      "2 data elements from carrier: vessel stow plan, container status messages",
      "File via ABI (Automated Broker Interface) or directly via ACE",
      "Penalties: up to $5,000 per violation for late, inaccurate, or missing filings",
      "Can amend without penalty before goods are laden aboard vessel",
      "CBP can place 'Do Not Load' hold if ISF is late or inaccurate",
    ],
    forms: ["CBP Form 7501 (Entry Summary)", "ACE portal submission"],
    deadlines: ["24 hours before laden aboard foreign vessel"],
    penalties: "Up to $5,000 per violation; cargo hold possible",
  },
  {
    id: "customs-bond",
    title: "US Customs Bonds — Requirements & Types",
    category: "cbp",
    summary: "A surety bond required by CBP to guarantee payment of duties, taxes, and fees. Required for all formal entries and certain special operations.",
    keyPoints: [
      "Single Entry Bond: covers one specific shipment. Cost ~0.5-1% of shipment value + duties",
      "Continuous Bond: covers all entries for one year. Typically 10% of duties paid in prior year, min $50,000",
      "Continuous bond required if importing 3+ times per year",
      "Bond amount must equal 10% of duties/fees paid in prior year or $50K minimum",
      "FTZ operations require separate FTZ Bond (CBP Form 301)",
      "Bond can be obtained through CBP-approved surety companies",
    ],
    forms: ["CBP Form 301", "CBP Form 5106"],
    penalties: "CBP can make demand against bond for unpaid duties",
  },
  {
    id: "ftz-compliance",
    title: "FTZ Operations Compliance Checklist",
    category: "cbp",
    summary: "Key compliance requirements for operating within a US Foreign Trade Zone, including recordkeeping, reporting, and operational procedures.",
    keyPoints: [
      "Apply for FTZ admission on CBP Form 214 (Application for Foreign Trade Zone Admission and/or Status Designation)",
      "CBP Form 216: Application to Manipulate, Examine, Sample, or Transfer Goods in a Foreign Trade Zone",
      "Inventory control and recordkeeping system must be CBP-approved",
      "Annual reconciliation: compare FTZ inventory records to CBP records",
      "Weekly Entry privilege reduces administrative burden (file once per week)",
      "Zone-to-zone transfers must be on CBP Form 214 with CBP approval",
      "Destruction of merchandise in FTZ requires CBP supervision",
      "FTZ activity code determines applicable merchandise processing fees",
    ],
    forms: ["CBP Form 214", "CBP Form 216", "CBP Form 301 (FTZ Bond)"],
    deadlines: ["Weekly Entry: file by Monday for prior week", "Annual reconciliation: 30 days after FTZ year-end"],
    penalties: "Loss of FTZ privileges; back duties owed on discrepancies",
  },
  {
    id: "hts-classification",
    title: "HTS Classification — Getting It Right",
    category: "cbp",
    summary: "Proper HTS classification is the foundation of correct duty calculation. Misclassification is the most common customs compliance error.",
    keyPoints: [
      "Use the General Rules of Interpretation (GRI) — 6 rules applied in order",
      "GRI 1: Classify by terms of heading and section/chapter notes first",
      "GRI 6: Classify subheadings using same rules as headings",
      "Request a Binding Ruling from CBP for certainty before importing",
      "Binding Rulings published in CROSS database (rulings.cbp.dhs.gov)",
      "Check for exclusions from Section 301 tariffs on Chinese goods",
      "10-digit HTS codes: first 6 digits match international HS system",
      "Chapters 84-85 (machinery, electronics) are highest-audit items",
    ],
    forms: ["CBP Form 4648 (Binding Ruling Request)"],
    penalties: "Back duties + interest + penalties up to 4x unpaid duties for fraud",
  },
  {
    id: "export-controls",
    title: "US Export Controls (EAR & ITAR)",
    category: "export",
    summary: "The US controls exports of dual-use goods (EAR) and defense articles (ITAR). Both can require export licenses. Non-compliance carries severe criminal penalties.",
    keyPoints: [
      "Export Administration Regulations (EAR): covers dual-use items. Administered by BIS (Bureau of Industry and Security)",
      "ITAR: International Traffic in Arms Regulations. Covers defense articles on USML. Administered by DDTC",
      "Check if product has Export Control Classification Number (ECCN) on Commerce Control List",
      "Restricted parties screening required: SDN List, Denied Persons, Debarred, etc.",
      "Electronic Export Information (EEI) required for exports over $2,500 or requiring license",
      "Re-export of US-origin goods also subject to EAR controls",
      "De minimis: 25% US content (10% for embargo countries) may trigger EAR on foreign-made items",
    ],
    forms: ["BIS-748P (Export License Application)", "AES Electronic Export Information"],
    penalties: "Criminal: up to $1M per violation and 20 years imprisonment (ITAR). Civil: up to $300K per violation (EAR)",
  },
  {
    id: "fda-imports",
    title: "FDA Import Requirements",
    category: "fda",
    summary: "The FDA regulates food, drugs, medical devices, cosmetics, and other products. Prior notice is required before most FDA-regulated goods arrive in the US.",
    keyPoints: [
      "Prior Notice required for food: submit via FDA Portal 2-8 hours before arrival by land, 4 hours by air, 8 hours by sea",
      "FDA may detain shipments without prior notice or for admissibility review",
      "Food Facility Registration required for foreign manufacturers/processors",
      "FSMA (Food Safety Modernization Act): Foreign Supplier Verification Program (FSVP) importer obligations",
      "Medical devices require 510(k) clearance or PMA approval before import for sale",
      "Drugs must meet FDA labeling, approval, or investigational exemption requirements",
      "Cosmetics require safety substantiation and correct labeling",
    ],
    forms: ["FDA Prior Notice Form", "FDA Establishment Registration"],
    deadlines: ["Prior Notice: 2-8 hours depending on transport mode"],
    penalties: "Refusal of admission; destruction at owner's expense; FDA import alert (automatic detention)",
  },
  {
    id: "aphis-plants",
    title: "USDA APHIS — Plant & Agricultural Imports",
    category: "aphis",
    summary: "The USDA's Animal and Plant Health Inspection Service protects US agriculture from pests and diseases. Many agricultural products require permits and inspection.",
    keyPoints: [
      "Phytosanitary Certificate required for most fresh fruits, vegetables, plants, and plant products",
      "Permit required to import certain plant materials, soil, microorganisms",
      "Wood packing material (pallets, crates) must comply with ISPM 15: heat treatment or methyl bromide fumigation",
      "Prohibited items include: citrus from Mexico, certain tropical fruits without approved treatment",
      "Core Pest Risk Management measures vary by country and commodity",
      "USDA Agricultural Specialist inspects at port of entry",
    ],
    forms: ["USDA APHIS PPQ Form 587 (Import Permit Application)", "Phytosanitary Certificate from exporting country"],
    penalties: "Destruction or re-export of non-compliant goods; fines",
  },
  {
    id: "forced-labor",
    title: "UFLPA — Forced Labor Prevention Act",
    category: "general",
    summary: "The Uyghur Forced Labor Prevention Act (UFLPA) creates a rebuttable presumption that goods from Xinjiang, China involve forced labor and are banned from US imports.",
    keyPoints: [
      "All goods from Xinjiang presumed made with forced labor unless importer provides clear and convincing evidence otherwise",
      "Entity List: companies on UFLPA Entity List cannot be used in supply chain even outside Xinjiang",
      "CBP actively detaining and excluding goods with Xinjiang supply chain connections",
      "Most commonly affected: cotton, polysilicon, tomatoes, steel, electronics",
      "Importer must document entire supply chain through a 'withhold release order'",
      "Strategy: audit supply chains, diversify sourcing, obtain certificates from suppliers",
      "Vietnam, Bangladesh sourcing reduces but does not eliminate risk if components are Xinjiang-origin",
    ],
    penalties: "Goods denied entry; potential seizure; criminal referral for knowing violators",
  },
];

export const tradeRegulations: TradeRegulation[] = [
  {
    id: "section-301-list1",
    region: "China",
    country: "CN",
    type: "tariff",
    title: "Section 301 Tariffs — List 1 (25%)",
    description: "25% additional tariff on approximately $34 billion in Chinese goods. Covers industrial machinery, aerospace components, vehicles, and other high-tech products.",
    htsCodes: ["8401-8487", "8501-8547", "8601-8609"],
    effectiveDate: "2018-07-06",
    source: "USTR Section 301",
  },
  {
    id: "section-301-list4a",
    region: "China",
    country: "CN",
    type: "tariff",
    title: "Section 301 Tariffs — List 4A (7.5–25%)",
    description: "7.5% (phase 1 deal) to 25% additional tariffs on $120B in consumer goods including apparel, electronics, footwear, and household goods. Most consumer products from China fall here.",
    htsCodes: ["6101-6217", "6401-6405", "8517", "8528"],
    effectiveDate: "2019-09-01",
    source: "USTR Section 301",
  },
  {
    id: "vietnam-gsp",
    region: "Southeast Asia",
    country: "VN",
    type: "tariff",
    title: "Vietnam — GSP & Normal Trade Relations",
    description: "Vietnam is not a US FTA partner. Goods from Vietnam pay MFN (normal) duty rates. GSP (Generalized System of Preferences) was suspended in 2020 for Vietnam pending renewal.",
    effectiveDate: "2020-01-01",
    source: "USTR / CBP",
  },
  {
    id: "thailand-gsp",
    region: "Southeast Asia",
    country: "TH",
    type: "tariff",
    title: "Thailand — GSP Partial Eligibility",
    description: "Thailand was removed from GSP beneficiary status for worker rights concerns in 2020. Goods pay MFN rates. Certain manufactured goods may still qualify under specific programs.",
    effectiveDate: "2020-04-25",
    source: "USTR",
  },
  {
    id: "indonesia-gsp",
    region: "Southeast Asia",
    country: "ID",
    type: "tariff",
    title: "Indonesia — GSP Eligible",
    description: "Indonesia remains a GSP beneficiary country. Qualifying Indonesian goods receive duty-free or reduced duty treatment. Verify eligibility with HTS code + GSP eligibility list.",
    source: "USTR GSP Program",
  },
  {
    id: "cambodia-gsp",
    region: "Southeast Asia",
    country: "KH",
    type: "tariff",
    title: "Cambodia — GSP Partial Suspension",
    description: "Cambodia was partially removed from GSP in 2020 for worker rights and democracy concerns. Apparel (major Cambodian export) lost GSP eligibility. Verify by HTS code.",
    effectiveDate: "2020-11-12",
    source: "USTR",
  },
  {
    id: "usmca",
    region: "North America",
    type: "fta",
    title: "USMCA — US-Mexico-Canada Agreement",
    description: "Replaced NAFTA in 2020. Provides duty-free treatment for qualifying goods from Mexico and Canada. Stricter rules of origin than NAFTA, especially for autos. Regional value content requirements apply.",
    effectiveDate: "2020-07-01",
    source: "USTR USMCA",
  },
  {
    id: "korus",
    region: "Asia-Pacific",
    country: "KR",
    type: "fta",
    title: "KORUS — US-Korea Free Trade Agreement",
    description: "Eliminates 95% of tariffs between US and South Korea. Particularly beneficial for manufactured goods. Korea plays key role as transshipment point for SE Asian goods.",
    effectiveDate: "2012-03-15",
    source: "USTR KORUS",
  },
  {
    id: "forced-labor-xinjiang",
    region: "China",
    country: "CN",
    type: "restriction",
    title: "UFLPA — Xinjiang Import Restrictions",
    description: "Rebuttable presumption that all goods from Xinjiang Uyghur Autonomous Region involve forced labor. Imports presumed prohibited unless importer proves by clear and convincing evidence otherwise. Actively enforced by CBP.",
    effectiveDate: "2022-06-21",
    source: "UFLPA (P.L. 117-78)",
  },
  {
    id: "russia-embargo",
    region: "Europe",
    country: "RU",
    type: "embargo",
    title: "Russia — Comprehensive Trade Restrictions",
    description: "Following Ukraine invasion, US banned imports of Russian oil, gas, coal, seafood, vodka, diamonds, gold, and luxury goods. Broad export controls also in effect. Verify before any Russia-connected transactions.",
    effectiveDate: "2022-03-11",
    source: "Executive Order 14068; BIS",
  },
  {
    id: "de-minimis",
    region: "United States",
    type: "tariff",
    title: "De Minimis Threshold (Section 321)",
    description: "Shipments valued at $800 or less per person per day enter duty-free and without formal entry. Major advantage for e-commerce. Note: Section 301 goods may not qualify; proposed changes under review.",
    source: "19 USC 1321; CBP",
  },
  {
    id: "port-darwin-china",
    region: "Australia",
    type: "restriction",
    title: "Australia — Port Darwin Lease (Security Note)",
    description: "Chinese company Landbridge Group holds 99-year lease on Port of Darwin. US and Australian govts have flagged security concerns. Relevant for cold chain operators routing through Australia.",
    source: "DFAT Australia",
  },
];

export const customsForms = [
  { code: "CBP-7501", name: "Entry Summary", use: "Formal import entry — declares goods, values, duties owed" },
  { code: "CBP-3461", name: "Entry/Immediate Delivery", use: "Allows cargo release before duties are paid (surety bond required)" },
  { code: "CBP-6043", name: "Delivery Ticket", use: "Release of cargo from CBP custody" },
  { code: "CBP-4455", name: "Certificate of Registration", use: "Documents items being temporarily exported (cameras, laptops) to prove US origin on re-entry" },
  { code: "CBP-4811", name: "Protest of CBP Decision", use: "Contest CBP's classification, valuation, or other decisions within 180 days of liquidation" },
  { code: "CBP-214", name: "FTZ Admission Application", use: "Admit merchandise to a Foreign Trade Zone" },
  { code: "CBP-216", name: "FTZ Manipulation Permit", use: "Authorize examination, manipulation, or transfer of goods within FTZ" },
  { code: "CBP-301", name: "Customs Bond", use: "Surety bond required for formal entries and special programs" },
  { code: "CBP-434", name: "NAFTA/USMCA Certificate of Origin", use: "Claim preferential duty treatment under USMCA" },
  { code: "CBP-4648", name: "Binding Ruling Request", use: "Request advance ruling on classification, valuation, or origin" },
];

// ---- Import Process Steps ----
export interface ImportProcessStep {
  step: number;
  slug: string;
  title: string;
  overview: string;
  procedures: string[];
  requiredDocs: string[];
  commonMistakes: string[];
  timeline: string;
  officialSources: { label: string; url: string }[];
}

export const importProcessSteps: ImportProcessStep[] = [
  {
    step: 1,
    slug: "sourcing",
    title: "Sourcing & Purchase",
    overview: "The import process begins with identifying and negotiating with suppliers, typically in SE Asia. Key decisions include trade terms (Incoterms), payment methods, quality standards, and order quantities. The purchase order is the foundational document that drives every downstream step.",
    procedures: [
      "Identify potential suppliers through trade shows, Alibaba, or local agents",
      "Request samples and verify product quality against specifications",
      "Negotiate pricing, MOQ (minimum order quantity), and trade terms (FOB, CIF, DDP)",
      "Agree on payment terms: T/T (wire transfer), Letter of Credit, or escrow",
      "Issue a formal Purchase Order with all specifications, quantities, and delivery terms",
      "Arrange pre-shipment inspection (PSI) through SGS, Bureau Veritas, or similar",
      "Confirm factory production schedule and expected cargo-ready date",
    ],
    requiredDocs: ["Purchase Order", "Proforma Invoice", "Product Specifications", "Supplier Agreement/Contract"],
    commonMistakes: [
      "Not specifying Incoterms clearly — leads to disputes over who pays for what",
      "Skipping pre-shipment inspection — quality issues discovered at destination are expensive to resolve",
      "Using EXW when you lack freight expertise — FCA or FOB gives you more control",
      "Not confirming HTS classification before ordering — unexpected duties can destroy margins",
    ],
    timeline: "2–8 weeks (supplier sourcing through production)",
    officialSources: [
      { label: "ICC Incoterms 2020", url: "https://iccwbo.org/business-solutions/incoterms-rules/" },
      { label: "Export.gov — Sourcing Guide", url: "https://www.trade.gov/sourcing-products-services" },
    ],
  },
  {
    step: 2,
    slug: "documentation-isf",
    title: "Documentation & ISF Filing",
    overview: "Before goods leave the origin country, critical documentation must be prepared and the Importer Security Filing (ISF, aka '10+2') must be submitted to CBP at least 24 hours before the vessel departs. Late or inaccurate ISF filings trigger $5,000 penalties per violation.",
    procedures: [
      "Collect Commercial Invoice from the supplier with accurate values, quantities, and HTS codes",
      "Obtain Packing List detailing contents, weights, and dimensions per package/pallet",
      "Secure Bill of Lading (BOL) from the carrier or freight forwarder",
      "File ISF (10+2) via ABI or ACE portal at least 24 hours before vessel departure",
      "Provide 10 importer data elements: seller, buyer, importer of record, consignee, manufacturer, ship-to party, country of origin, HTS number, container stuffing location, consolidator",
      "Confirm ISF accepted — check for 'Do Not Load' holds",
      "Obtain Certificate of Origin if claiming FTA preferences",
    ],
    requiredDocs: ["Commercial Invoice", "Packing List", "Bill of Lading", "ISF Filing (10+2)", "Certificate of Origin (if applicable)"],
    commonMistakes: [
      "Filing ISF late — $5,000 penalty per violation, non-negotiable",
      "Incorrect HTS codes on ISF — triggers CBP scrutiny and potential exam",
      "Mismatched values between Commercial Invoice and ISF",
      "Not obtaining Certificate of Origin when FTA savings are available",
    ],
    timeline: "1–3 days before vessel departure",
    officialSources: [
      { label: "CBP ISF Requirements", url: "https://www.cbp.gov/trade/trade-community/isf" },
      { label: "ACE Portal", url: "https://www.cbp.gov/trade/automated" },
    ],
  },
  {
    step: 3,
    slug: "ocean-transit",
    title: "Ocean Transit",
    overview: "Goods travel by ocean vessel from the origin port to a US port of entry. Transit times vary from 14 days (direct service from SE Asia to West Coast) to 35+ days (transshipment routes to East Coast). Tracking, transshipment connections, and weather/congestion delays are key concerns.",
    procedures: [
      "Book vessel space with carrier or through NVOCC/freight forwarder",
      "Confirm booking: vessel name, voyage number, port of loading, ETA at US port",
      "Track container using carrier's online tracking or AIS vessel tracking",
      "Monitor transshipment connections (if applicable) — Panama, Singapore, Colombo are major hubs",
      "Confirm arrival notice from carrier or agent at destination port",
      "Arrange drayage (truck transport from port to warehouse/FTZ) before vessel arrives",
      "Prepare for potential weather delays, port congestion, or labor disruptions",
    ],
    requiredDocs: ["Bill of Lading", "Booking Confirmation", "Cargo Insurance Certificate"],
    commonMistakes: [
      "Not booking drayage early enough — container sits at port accruing demurrage",
      "Ignoring transit time variability — plan for 5–7 day buffer on transshipment routes",
      "Not purchasing cargo insurance — carrier liability under Hague-Visby Rules is very limited ($500/package)",
      "Choosing cheapest transit option without considering demurrage risk from missed connections",
    ],
    timeline: "14–35 days depending on route and transshipment",
    officialSources: [
      { label: "MarineTraffic — Vessel Tracking", url: "https://www.marinetraffic.com" },
      { label: "Port of Los Angeles — Vessel Schedule", url: "https://www.portoflosangeles.org/business/statistics/vessel-visits" },
    ],
  },
  {
    step: 4,
    slug: "customs-clearance",
    title: "US Customs Clearance",
    overview: "When goods arrive at a US port, they must clear CBP (Customs and Border Protection). A licensed customs broker files the entry, duties are calculated and paid, and CBP may select the shipment for examination. This is the most compliance-sensitive step.",
    procedures: [
      "Customs broker files CBP Form 3461 (Entry/Immediate Delivery) for cargo release",
      "CBP reviews entry — may release, hold for documentation, or select for exam",
      "If released, cargo can be picked up while entry summary is completed",
      "Customs broker files CBP Form 7501 (Entry Summary) within 10 working days of entry",
      "Duties, MPF (0.3464%), and HMF (0.125%) calculated and paid",
      "If CBP selects for exam: tailgate exam (at terminal, $300-500) or intensive exam (VACIS/x-ray, $500-1,000+)",
      "Entry liquidates (finalizes) approximately 314 days after entry — CBP can adjust duties within this period",
    ],
    requiredDocs: ["CBP Form 3461", "CBP Form 7501 (Entry Summary)", "Commercial Invoice", "Packing List", "Bill of Lading", "Customs Bond (single entry or continuous)"],
    commonMistakes: [
      "Not having a continuous bond — single entry bonds are more expensive per shipment for frequent importers",
      "Undervaluing goods on entry — CBP audits thoroughly and penalties for fraud reach 4x duties",
      "Not responding to CBP requests within deadlines — goods can be seized or destroyed",
      "Failing to account for Section 301 tariffs on Chinese goods in addition to MFN rates",
    ],
    timeline: "1–5 days (without exam); 5–15 days (with exam or hold)",
    officialSources: [
      { label: "CBP Entry Process", url: "https://www.cbp.gov/trade/basic-import-export/importing-goods" },
      { label: "USITC Tariff Database", url: "https://hts.usitc.gov" },
    ],
  },
  {
    step: 5,
    slug: "ftz-entry",
    title: "FTZ Entry or Direct Delivery",
    overview: "After customs clearance (or in lieu of it), goods can be admitted to a Foreign Trade Zone where duties are deferred until goods enter US commerce. Alternatively, goods go directly to the importer's warehouse. FTZ admission locks duty rates at the date of entry — a powerful hedge against tariff increases.",
    procedures: [
      "Choose: direct delivery to warehouse (duties paid at entry) OR FTZ admission (duties deferred)",
      "For FTZ: file CBP Form 214 (Application for FTZ Admission)",
      "Elect Privileged Foreign (PF) status to lock current duty rate, or Non-Privileged Foreign (NPF) for flexibility",
      "WARNING: PF/NPF election is IRREVOCABLE for the admitted merchandise",
      "Goods admitted to FTZ — duty clock stops until goods are withdrawn for consumption",
      "Withdraw goods incrementally (e.g., 100 pallets at a time) — pay duties only on what leaves the zone",
      "For direct delivery: arrange receiving at warehouse/3PL, confirm appointment",
    ],
    requiredDocs: ["CBP Form 214 (FTZ Admission)", "FTZ Operator Agreement", "Inventory Control Documentation"],
    commonMistakes: [
      "Not choosing PF status before a known tariff increase — missed duty-locking opportunity",
      "Choosing PF when NPF would be better (e.g., if tariff rates might decrease)",
      "Not having FTZ bond in place before goods arrive",
      "Failing to maintain CBP-approved inventory control system — can lose FTZ privileges",
    ],
    timeline: "1–3 days for FTZ admission; same-day for direct delivery",
    officialSources: [
      { label: "CBP Foreign Trade Zones", url: "https://www.cbp.gov/border-security/ports-entry/cargo-security/ftz" },
      { label: "FTZ Board", url: "https://enforcement.trade.gov/ftzpage/" },
    ],
  },
  {
    step: 6,
    slug: "fulfillment",
    title: "Fulfillment & Sale",
    overview: "The final step: goods are received at a warehouse or 3PL, inventoried, and distributed to buyers through wholesale, e-commerce, or retail channels. This is where the unit economics model plays out — the spread between landed cost and sale price determines profitability.",
    procedures: [
      "Receive goods at warehouse — unload, count, inspect for damage",
      "Scan and inventory each SKU into warehouse management system (WMS)",
      "Quality check a sample against pre-shipment inspection report",
      "Shelve/rack product in designated storage locations",
      "Process orders: pick, pack, and ship to customers or retailers",
      "Track unit economics: landed cost per unit vs. wholesale/retail selling price",
      "Monitor sell-through rate and reorder timing for next container",
    ],
    requiredDocs: ["Warehouse Receiving Report", "Inventory Records", "Damage Claims (if applicable)"],
    commonMistakes: [
      "Not inspecting goods at receiving — damage claims must be filed within carrier's time limit",
      "Poor inventory tracking — leads to stockouts or overstock",
      "Not calculating true landed cost per unit — underpricing or overpricing product",
      "Ordering next container too late — 45-60 day lead time from order to delivery",
    ],
    timeline: "1–3 days for receiving; ongoing for fulfillment",
    officialSources: [
      { label: "SBA Import Guide", url: "https://www.sba.gov/business-guide/grow-your-business/import-products" },
    ],
  },
];

// ---- FTZ Guide Articles ----
export interface FTZArticle {
  slug: string;
  title: string;
  content: string;
  keyPoints: string[];
  officialSources: { label: string; url: string }[];
}

export const ftzGuideArticles: FTZArticle[] = [
  {
    slug: "what-is-ftz",
    title: "What is a Foreign Trade Zone?",
    content: "A Foreign Trade Zone (FTZ) is a designated area within the United States that is legally considered outside of US customs territory for duty purposes. Authorized under the Foreign Trade Zones Act of 1934 (19 U.S.C. §81a-81u), FTZs allow companies to defer, reduce, or eliminate customs duties on imported goods. There are approximately 195 general-purpose FTZ zones and over 500 subzones across the US. FTZs are supervised by CBP and authorized by the Foreign-Trade Zones Board (Commerce Department + Treasury Department).",
    keyPoints: [
      "Legally outside US customs territory — duties not owed until goods enter US commerce",
      "Authorized under Foreign Trade Zones Act of 1934 (19 U.S.C. §81a-81u)",
      "~195 general-purpose zones and 500+ subzones across the US",
      "Supervised by CBP, authorized by FTZ Board (Commerce + Treasury)",
      "Can store, test, sort, relabel, repackage, assemble, and manufacture goods",
      "Goods can be re-exported from FTZ without ever paying US duties",
    ],
    officialSources: [
      { label: "FTZ Board", url: "https://enforcement.trade.gov/ftzpage/" },
      { label: "CBP FTZ Information", url: "https://www.cbp.gov/border-security/ports-entry/cargo-security/ftz" },
    ],
  },
  {
    slug: "ftz-benefits",
    title: "FTZ Benefits for Importers",
    content: "FTZs provide five core financial benefits: duty deferral (don't pay until goods leave the zone), duty elimination on re-exports (goods shipped abroad never incur US duties), inverted tariff relief (pay the lower finished-goods rate when manufacturing in the zone), zone-to-zone transfers (move goods between FTZs without triggering duties), and weekly entry processing (one customs entry per week instead of per shipment).",
    keyPoints: [
      "Duty Deferral: pay duties only when goods are withdrawn into US commerce — improves cash flow",
      "Duty Elimination: goods re-exported from FTZ never pay US duties",
      "Inverted Tariff: if finished product duty < component duty, pay the lower rate by manufacturing in FTZ",
      "Zone-to-Zone Transfers: move goods between FTZs without triggering duty payment",
      "Weekly Entry: file one customs entry per week — reduces brokerage fees significantly",
      "Cash Flow: duty deferral on $1M of goods at 25% duty = $250K in float",
      "Duty Rate Locking: PF status locks the duty rate at the date of FTZ admission",
    ],
    officialSources: [
      { label: "NAFTZ — Benefits of FTZs", url: "https://www.naftz.org/ftz-basics" },
    ],
  },
  {
    slug: "pf-vs-npf",
    title: "Privileged Foreign (PF) vs Non-Privileged Foreign (NPF) Status",
    content: "When goods are admitted to an FTZ, the importer must elect either Privileged Foreign (PF) or Non-Privileged Foreign (NPF) status. This election is IRREVOCABLE for the admitted merchandise. PF status locks the duty rate at the date of admission — critical when tariffs are expected to increase. NPF status defers the classification until withdrawal, allowing the importer to apply the rate in effect at the time goods leave the zone — useful when rates are expected to decrease or when manufacturing in the zone changes the classification.",
    keyPoints: [
      "PF Status: locks duty rate AND classification at date of FTZ admission",
      "NPF Status: duty rate and classification determined when goods are withdrawn from FTZ",
      "Election is IRREVOCABLE — once chosen, cannot be changed for that merchandise",
      "PF is advantageous when tariffs are expected to increase (locks lower current rate)",
      "NPF is advantageous when manufacturing in FTZ changes HTS to a lower-duty classification",
      "NPF allows benefit of any future tariff reductions",
      "Example: Admit goods today at 10% duty (PF). If tariff rises to 25%, you still pay 10%.",
      "Example: Admit components at 15% duty (NPF). Assemble into finished goods classified at 5%. Withdraw at 5%.",
    ],
    officialSources: [
      { label: "19 CFR 146.41 — Privileged Foreign Status", url: "https://www.ecfr.gov/current/title-19/chapter-I/part-146/subpart-D/section-146.41" },
    ],
  },
  {
    slug: "ftz-application",
    title: "How to Apply for FTZ Usage",
    content: "Using an FTZ involves either applying to operate within an existing general-purpose zone (through a zone grantee/operator) or applying for a subzone designation for your own facility. Most importers start with a general-purpose zone. The process involves contacting the zone grantee, executing an operator agreement, getting CBP activation, and setting up an approved inventory control system.",
    keyPoints: [
      "Step 1: Identify nearest general-purpose FTZ — use FTZ Board locator",
      "Step 2: Contact the zone grantee/operator to discuss space, services, and fees",
      "Step 3: Execute an Operator Agreement with the zone grantee",
      "Step 4: Apply for CBP activation of the FTZ site",
      "Step 5: Establish a CBP-approved inventory control and recordkeeping system",
      "Step 6: Obtain FTZ Operator Bond (CBP Form 301)",
      "Timeline: 3-6 months for general-purpose zone usage; 6-12+ months for subzone designation",
      "Costs: zone fees vary ($0.50-$2.00/sq ft/month for warehouse space), plus CBP operator costs",
    ],
    officialSources: [
      { label: "FTZ Board — How to Use FTZs", url: "https://enforcement.trade.gov/ftzpage/info/board.html" },
    ],
  },
  {
    slug: "ftz-compliance",
    title: "FTZ Compliance Requirements",
    content: "Operating within an FTZ carries significant compliance obligations. CBP monitors FTZ activity through inventory audits, annual reconciliation requirements, and periodic compliance assessments. Operators must maintain detailed records, conduct annual inventories, and respond promptly to CBP inquiries. Non-compliance can result in loss of FTZ privileges and back duties on all discrepancies.",
    keyPoints: [
      "Inventory Control System: must be CBP-approved, track all movements in/out/within zone",
      "Annual Reconciliation: compare FTZ records to CBP records within 30 days of year-end",
      "Record Retention: minimum 5 years for all FTZ documents",
      "CBP Access: CBP personnel must have unrestricted access to FTZ premises during business hours",
      "Manipulation Rules: CBP Form 216 required before manipulating, examining, or transferring goods",
      "Destruction: waste/scrap destruction requires CBP supervision",
      "Weekly Entry: must file by Monday for the prior week's withdrawals",
      "Compliance Assessment: CBP conducts periodic audits — self-assessment reduces risk",
    ],
    officialSources: [
      { label: "19 CFR Part 146 — FTZ Regulations", url: "https://www.ecfr.gov/current/title-19/chapter-I/part-146" },
    ],
  },
  {
    slug: "ftz-tariff-strategy",
    title: "FTZ and Tariff Strategy",
    content: "FTZs are a powerful tool for tariff optimization, especially in the current environment of Section 301 tariffs on Chinese goods (7.5–100%+) and ongoing trade policy uncertainty. By admitting goods under PF status, importers can lock today's duty rate regardless of future increases. For companies importing from SE Asia to hedge against potential tariff changes, FTZ admission is a form of tariff insurance.",
    keyPoints: [
      "Duty Locking: PF status freezes duty rate at date of FTZ admission — hedge against increases",
      "Section 301 Strategy: admit Chinese goods before tariff increases take effect",
      "Incremental Withdrawal: withdraw only what you need, when you need it — pay duties on demand",
      "Re-export Advantage: goods re-exported never pay US duties — useful for international distribution",
      "Scenario Planning: model different tariff scenarios to determine optimal PF vs NPF election",
      "April 2025 Executive Order: additional tariffs announced — FTZ admission before effective date locked lower rates",
      "Cost Example: 40ft container of goods worth $200K at 25% duty = $50K. FTZ duty locking at pre-increase 10% saves $30K per container.",
    ],
    officialSources: [
      { label: "USTR Section 301 Actions", url: "https://ustr.gov/issue-areas/enforcement/section-301-investigations" },
      { label: "FTZ Board Annual Report", url: "https://enforcement.trade.gov/ftzpage/annual-report.html" },
    ],
  },
];

// ---- Compliance Checklists ----
export interface ChecklistItem {
  id: string;
  label: string;
  detail: string;
}

export interface ComplianceChecklist {
  id: string;
  title: string;
  description: string;
  items: ChecklistItem[];
}

export const complianceChecklists: ComplianceChecklist[] = [
  {
    id: "general-cargo",
    title: "General Cargo Import Checklist",
    description: "Complete checklist covering all steps from sourcing to delivery for standard (non-regulated) cargo.",
    items: [
      { id: "gc-1", label: "Supplier agreement/contract executed", detail: "Ensure terms cover quality standards, Incoterms, payment, and dispute resolution." },
      { id: "gc-2", label: "Purchase Order issued", detail: "Include all product specs, quantities, pricing, delivery terms, and HTS codes." },
      { id: "gc-3", label: "HTS classification confirmed", detail: "Verify correct 10-digit HTS code using USITC tariff database or CBP binding ruling." },
      { id: "gc-4", label: "Pre-shipment inspection completed", detail: "Third-party inspection (SGS, Bureau Veritas) before goods leave factory." },
      { id: "gc-5", label: "Commercial Invoice obtained", detail: "Must show: buyer/seller, description, quantity, unit price, total value, Incoterms, country of origin." },
      { id: "gc-6", label: "Packing List obtained", detail: "Itemize contents per package: weight, dimensions, marks and numbers." },
      { id: "gc-7", label: "Bill of Lading issued", detail: "Verify: shipper, consignee, notify party, ports, container numbers, seal numbers." },
      { id: "gc-8", label: "Customs bond in place", detail: "Continuous bond for 3+ imports/year. Single entry bond for one-off shipments." },
      { id: "gc-9", label: "ISF filed (24h before vessel departure)", detail: "10 importer data elements + 2 carrier elements via ABI or ACE." },
      { id: "gc-10", label: "Cargo insurance arranged", detail: "Minimum 110% of invoice value. Carrier liability is limited under Hague-Visby Rules." },
      { id: "gc-11", label: "Drayage booked before vessel arrival", detail: "Book trucking from port to warehouse 3-5 days before ETA to avoid demurrage." },
      { id: "gc-12", label: "Customs entry filed (Form 3461)", detail: "Filed by licensed customs broker. Allows cargo release before entry summary." },
      { id: "gc-13", label: "Entry Summary filed (Form 7501)", detail: "Due within 10 working days of entry. Declares values, duties, and fees." },
      { id: "gc-14", label: "Duties and fees paid", detail: "MFN duty + MPF (0.3464%) + HMF (0.125%) + any Section 301 tariffs." },
      { id: "gc-15", label: "Goods received and inspected at warehouse", detail: "Count, inspect for damage, compare to packing list. File damage claims within carrier time limits." },
      { id: "gc-16", label: "Inventory entered into WMS", detail: "Scan/enter all SKUs into warehouse management system with location assignments." },
    ],
  },
  {
    id: "cold-chain",
    title: "Cold Chain Import Checklist",
    description: "Additional requirements for temperature-controlled cargo: perishables, frozen goods, pharmaceuticals.",
    items: [
      { id: "cc-1", label: "Temperature requirements documented", detail: "Specify required temp range for entire transit. Frozen: -18°C. Chilled: 2-8°C. Pharma: per product specs." },
      { id: "cc-2", label: "Reefer container booked", detail: "Confirm reefer unit type (20RF/40RH), temperature range, and genset availability." },
      { id: "cc-3", label: "Temperature monitoring device installed", detail: "Data logger or real-time IoT tracker recording temps throughout transit." },
      { id: "cc-4", label: "FDA Prior Notice filed (food products)", detail: "Submit 8 hours before vessel arrival. Required for ALL food products." },
      { id: "cc-5", label: "Food Facility Registration current", detail: "Foreign food facility must be registered with FDA per FSMA requirements." },
      { id: "cc-6", label: "Phytosanitary Certificate obtained (if applicable)", detail: "Required for fresh fruits, vegetables, and plant products. Issued by exporting country's NPPO." },
      { id: "cc-7", label: "USDA APHIS permit (if applicable)", detail: "Required for certain plant materials, meat, poultry, and egg products." },
      { id: "cc-8", label: "Cold chain receiving facility confirmed", detail: "Warehouse must have appropriate cold storage capacity and dock-level temperature control." },
      { id: "cc-9", label: "Temperature data reviewed upon arrival", detail: "Check data logger for temperature excursions during transit. Document any deviations." },
      { id: "cc-10", label: "HACCP documentation maintained", detail: "Hazard Analysis and Critical Control Points documentation for food safety compliance." },
    ],
  },
  {
    id: "apparel",
    title: "Apparel Import Checklist",
    description: "Specific requirements for importing clothing and textiles into the United States.",
    items: [
      { id: "ap-1", label: "Fiber content labeling verified", detail: "Textile Fiber Products Identification Act requires percentage by weight of each fiber." },
      { id: "ap-2", label: "Country of origin marking on each garment", detail: "19 USC 1304: every imported article must be marked with English name of country of origin." },
      { id: "ap-3", label: "Care labeling attached", detail: "FTC Care Labeling Rule requires washing/drying/ironing instructions on all textile products." },
      { id: "ap-4", label: "CPSIA compliance (children's products)", detail: "If for children under 12: lead testing, phthalate limits, tracking labels, third-party testing required." },
      { id: "ap-5", label: "Quota/visa requirements checked", detail: "Some textile categories require export visa from the producing country. Check CBP textile status report." },
      { id: "ap-6", label: "UFLPA supply chain audit completed", detail: "Verify no Xinjiang-origin cotton, yarn, or fabric in supply chain. Document supplier attestations." },
      { id: "ap-7", label: "Section 301 tariff rate verified", detail: "Chinese apparel (HTS Ch. 61-62) subject to 7.5-25% additional tariffs. Check current rates." },
      { id: "ap-8", label: "Correct HTS code for each style", detail: "Apparel classification depends on: fiber, knit vs. woven, gender, garment type. Get binding ruling for complex items." },
    ],
  },
  {
    id: "food-cpg",
    title: "Food & CPG Import Checklist",
    description: "Requirements for importing food, beverages, and consumer packaged goods.",
    items: [
      { id: "fc-1", label: "FDA Prior Notice submitted", detail: "Required for ALL food imports. Submit via FDA Portal 8 hours before vessel arrival (sea)." },
      { id: "fc-2", label: "Food Facility Registration verified", detail: "Foreign manufacturer/processor must have current FDA registration (renew biannually)." },
      { id: "fc-3", label: "FSVP importer program in place", detail: "Foreign Supplier Verification Program: verify that foreign suppliers meet US food safety standards." },
      { id: "fc-4", label: "Nutrition Facts label compliant", detail: "FDA requires Nutrition Facts panel in specific format. Updated format required since 2020." },
      { id: "fc-5", label: "Ingredient list accurate and in English", detail: "List all ingredients in descending order by weight. Declare major allergens (FALCPA)." },
      { id: "fc-6", label: "Allergen declarations present", detail: "Must declare: milk, eggs, fish, shellfish, tree nuts, peanuts, wheat, soybeans, sesame." },
      { id: "fc-7", label: "Net quantity statement correct", detail: "Must be in both metric and US customary units. Specific placement requirements." },
      { id: "fc-8", label: "Country of origin clearly marked", detail: "Required on the product label. Must be in English." },
      { id: "fc-9", label: "Bioterrorism Act compliance", detail: "Registration, prior notice, and record-keeping requirements under the Bioterrorism Act of 2002." },
      { id: "fc-10", label: "State-specific labeling requirements checked", detail: "California Prop 65, New York sodium warnings, etc. Check requirements for distribution states." },
    ],
  },
  {
    id: "ftz-admission",
    title: "FTZ Admission Checklist",
    description: "Steps required to admit merchandise into a Foreign Trade Zone.",
    items: [
      { id: "ftz-1", label: "FTZ Operator Agreement in place", detail: "Executed with the zone grantee. Covers space, services, fees, and compliance responsibilities." },
      { id: "ftz-2", label: "FTZ Bond filed (CBP Form 301)", detail: "Separate bond specifically for FTZ operations. Amount based on estimated duties." },
      { id: "ftz-3", label: "Inventory control system CBP-approved", detail: "Must track all merchandise movements: admission, manipulation, transfer, withdrawal, destruction." },
      { id: "ftz-4", label: "CBP Form 214 prepared", detail: "Application for FTZ Admission and/or Status Designation. Filed before goods enter the zone." },
      { id: "ftz-5", label: "PF or NPF status elected", detail: "IRREVOCABLE decision. PF locks duty rate at admission. NPF defers to withdrawal date." },
      { id: "ftz-6", label: "Supporting documents assembled", detail: "Commercial Invoice, Packing List, Bill of Lading, and any certificates of origin." },
      { id: "ftz-7", label: "CBP Form 214 filed and accepted", detail: "Confirm CBP acceptance before physically moving goods into the zone." },
      { id: "ftz-8", label: "Goods physically received in FTZ", detail: "Unload, inspect, and inventory goods. Record lot numbers, quantities, and locations in FTZ." },
      { id: "ftz-9", label: "FTZ inventory records updated", detail: "Enter all admitted merchandise into the CBP-approved inventory system immediately." },
      { id: "ftz-10", label: "Weekly Entry schedule established", detail: "If using weekly entry privilege: file by Monday for prior week's withdrawals." },
    ],
  },
];

// ---- Documentation Matrix ----
export interface DocumentMatrixEntry {
  document: string;
  description: string;
  preparedBy: string;
  commonMistakes: string;
  steps: {
    sourcing: boolean;
    isf: boolean;
    transit: boolean;
    customs: boolean;
    ftz: boolean;
    fulfillment: boolean;
  };
}

export const documentationMatrix: DocumentMatrixEntry[] = [
  {
    document: "Purchase Order",
    description: "Formal order from buyer to seller specifying products, quantities, prices, and delivery terms.",
    preparedBy: "Buyer (importer)",
    commonMistakes: "Missing Incoterms, vague product specs, no HTS codes referenced.",
    steps: { sourcing: true, isf: false, transit: false, customs: false, ftz: false, fulfillment: false },
  },
  {
    document: "Commercial Invoice",
    description: "Seller's invoice showing goods sold, quantities, unit prices, total value, and trade terms.",
    preparedBy: "Seller (exporter/supplier)",
    commonMistakes: "Values don't match ISF/entry; missing country of origin; wrong Incoterms.",
    steps: { sourcing: true, isf: true, transit: true, customs: true, ftz: true, fulfillment: false },
  },
  {
    document: "Packing List",
    description: "Itemized list of package contents with weights and dimensions per carton/pallet.",
    preparedBy: "Seller (exporter/supplier)",
    commonMistakes: "Weight/quantity mismatches with Commercial Invoice; missing marks & numbers.",
    steps: { sourcing: false, isf: true, transit: true, customs: true, ftz: true, fulfillment: true },
  },
  {
    document: "Bill of Lading (B/L)",
    description: "Legal shipping document: contract of carriage, receipt of goods, and document of title.",
    preparedBy: "Ocean carrier or NVOCC",
    commonMistakes: "Wrong consignee/notify party; missing container/seal numbers; incorrect port codes.",
    steps: { sourcing: false, isf: false, transit: true, customs: true, ftz: true, fulfillment: false },
  },
  {
    document: "ISF (10+2) Filing",
    description: "Importer Security Filing with 10 data elements from importer + 2 from carrier.",
    preparedBy: "Customs broker or importer via ACE",
    commonMistakes: "Filed late (after 24h deadline); wrong HTS codes; manufacturer info mismatch.",
    steps: { sourcing: false, isf: true, transit: false, customs: false, ftz: false, fulfillment: false },
  },
  {
    document: "CBP Entry Summary (Form 7501)",
    description: "Official customs declaration of imported merchandise with duty/fee calculation.",
    preparedBy: "Licensed customs broker",
    commonMistakes: "Wrong tariff classification; incorrect valuation method; missed Section 301 duties.",
    steps: { sourcing: false, isf: false, transit: false, customs: true, ftz: false, fulfillment: false },
  },
  {
    document: "FTZ Admission (Form 214)",
    description: "Application to admit merchandise into a Foreign Trade Zone with status designation.",
    preparedBy: "FTZ operator or customs broker",
    commonMistakes: "Wrong PF/NPF election; filing after goods already in zone; missing supporting docs.",
    steps: { sourcing: false, isf: false, transit: false, customs: false, ftz: true, fulfillment: false },
  },
  {
    document: "Certificate of Origin",
    description: "Certifies country where goods were produced. Required for FTA duty preferences.",
    preparedBy: "Seller or Chamber of Commerce in origin country",
    commonMistakes: "Not obtaining when FTA savings available; expired certificate; wrong rules of origin criteria.",
    steps: { sourcing: false, isf: false, transit: false, customs: true, ftz: false, fulfillment: false },
  },
  {
    document: "Phytosanitary Certificate",
    description: "Plant health certificate issued by exporting country's NPPO for agricultural products.",
    preparedBy: "National Plant Protection Organization (origin country)",
    commonMistakes: "Not obtaining for products that require it; certificate not in English; expired.",
    steps: { sourcing: false, isf: false, transit: false, customs: true, ftz: false, fulfillment: false },
  },
  {
    document: "Cargo Insurance Certificate",
    description: "Proof of marine cargo insurance covering goods during transit.",
    preparedBy: "Insurance company or broker",
    commonMistakes: "Insufficient coverage (should be 110%+ of invoice); not covering warehouse-to-warehouse.",
    steps: { sourcing: false, isf: false, transit: true, customs: false, ftz: false, fulfillment: false },
  },
  {
    document: "Customs Bond (Form 301)",
    description: "Surety bond guaranteeing payment of duties, taxes, and fees to CBP.",
    preparedBy: "Surety company via customs broker",
    commonMistakes: "Bond amount too low for duties owed; not renewing continuous bond before expiry.",
    steps: { sourcing: false, isf: false, transit: false, customs: true, ftz: true, fulfillment: false },
  },
];

// ---- Hidden Costs ----
export interface HiddenCost {
  cost: string;
  typicalRange: string;
  whenIncurred: string;
  notes: string;
}

export const hiddenCosts: HiddenCost[] = [
  { cost: "Customs Broker Fee", typicalRange: "$150–$250/entry", whenIncurred: "At customs clearance", notes: "Per entry, not per container. Continuous bond clients may get volume discounts." },
  { cost: "ISF Filing Penalty", typicalRange: "$5,000/violation", whenIncurred: "If ISF not filed 24h before departure", notes: "Non-negotiable CBP penalty. Can also result in 'Do Not Load' hold." },
  { cost: "Demurrage", typicalRange: "$150–$300/day", whenIncurred: "After free time at port (4–5 days)", notes: "Charged by the port/terminal. Can escalate quickly during port congestion." },
  { cost: "Detention", typicalRange: "$100–$200/day", whenIncurred: "Container not returned on time", notes: "Charged by the shipping line. Free time typically 4–7 days after pickup." },
  { cost: "Drayage", typicalRange: "$500–$1,500/container", whenIncurred: "Port to warehouse transport", notes: "Varies by distance, congestion, fuel surcharges. LA/LB most expensive." },
  { cost: "CBP Exam Fee", typicalRange: "$300–$1,000", whenIncurred: "If CBP selects for inspection", notes: "Tailgate exam: $300–500. Intensive/VACIS x-ray exam: $500–1,000+." },
  { cost: "Warehouse Handling", typicalRange: "$0.15–$0.50/unit", whenIncurred: "At receiving warehouse/3PL", notes: "Unloading, scanning, shelving. Higher for fragile or oversized items." },
  { cost: "Harbor Maintenance Fee", typicalRange: "0.125% of cargo value", whenIncurred: "At US port entry", notes: "Federal fee, non-waivable. Applied to the value of commercial cargo." },
  { cost: "Merchandise Processing Fee", typicalRange: "0.3464% (min $31.67, max $614.35)", whenIncurred: "At customs entry", notes: "Per entry. FTZ Weekly Entry can reduce total MPF by consolidating entries." },
];

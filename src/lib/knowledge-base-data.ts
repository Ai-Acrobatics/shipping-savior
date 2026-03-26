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

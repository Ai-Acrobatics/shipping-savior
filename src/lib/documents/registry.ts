// ============================================================
// Multi-document trade OCR — document registry (AI-12016)
//
// One spec per document type, and everything downstream derives from it:
// the extraction prompt, the completeness check, the classifier signals and
// the UI field list. Adding a document type is a data change.
//
// `required` marks the statutory or contractual minimum for the document to be
// usable — not every field a form has room for. A commercial invoice without
// a currency cannot be entered; a commercial invoice without a notify party
// can.
// ============================================================

import type { DocumentTypeSpec, TradeDocumentType } from "./types";

const BILL_OF_LADING: DocumentTypeSpec = {
  type: "bill_of_lading",
  label: "Bill of Lading",
  purpose: "Carrier's contract of carriage and receipt for the cargo.",
  authority: "COGSA / carrier tariff",
  signals: [
    { phrase: "bill of lading", weight: 10 },
    { phrase: "b/l no", weight: 8 },
    { phrase: "shipped on board", weight: 7 },
    { phrase: "port of loading", weight: 3 },
    { phrase: "port of discharge", weight: 3 },
    { phrase: "vessel", weight: 2 },
    { phrase: "freight prepaid", weight: 4 },
    { phrase: "notify party", weight: 2 },
  ],
  fields: [
    { key: "bl_number", label: "B/L number", kind: "string", hint: "Bill of lading number", required: true },
    { key: "container_numbers", label: "Containers", kind: "string[]", hint: "Container numbers, ISO 6346 format XXXX1234567" },
    { key: "vessel_name", label: "Vessel", kind: "string", hint: "Vessel name" },
    { key: "voyage_number", label: "Voyage", kind: "string", hint: "Voyage or trip number" },
    { key: "carrier", label: "Carrier", kind: "string", hint: "Ocean carrier / shipping line", required: true },
    { key: "port_of_loading", label: "Port of loading", kind: "string", hint: "Full port name", required: true },
    { key: "port_of_discharge", label: "Port of discharge", kind: "string", hint: "Full port name", required: true },
    { key: "etd", label: "ETD", kind: "date", hint: "Estimated departure date" },
    { key: "eta", label: "ETA", kind: "date", hint: "Estimated arrival date" },
    { key: "shipper", label: "Shipper", kind: "string", hint: "Shipper / exporter name", required: true },
    { key: "consignee", label: "Consignee", kind: "string", hint: "Consignee / importer name", required: true },
    { key: "notify_party", label: "Notify party", kind: "string", hint: "Notify party name" },
    { key: "goods_description", label: "Goods", kind: "string", hint: "Description of goods" },
    { key: "gross_weight_kg", label: "Gross weight (kg)", kind: "number", hint: "Gross weight in kg; convert lbs by dividing by 2.20462" },
    { key: "package_count", label: "Packages", kind: "number", hint: "Number of packages or units" },
  ],
};

const COMMERCIAL_INVOICE: DocumentTypeSpec = {
  type: "commercial_invoice",
  label: "Commercial Invoice",
  purpose: "The customs value declaration — what CBP assesses duty against.",
  authority: "19 CFR 141.86",
  signals: [
    { phrase: "commercial invoice", weight: 10 },
    { phrase: "invoice no", weight: 5 },
    { phrase: "invoice number", weight: 5 },
    { phrase: "unit price", weight: 4 },
    { phrase: "total amount", weight: 3 },
    { phrase: "incoterm", weight: 5 },
    { phrase: "terms of sale", weight: 4 },
    { phrase: "country of origin", weight: 2 },
  ],
  fields: [
    { key: "invoice_number", label: "Invoice number", kind: "string", hint: "Invoice number", required: true },
    { key: "invoice_date", label: "Invoice date", kind: "date", hint: "Date of the invoice", required: true },
    { key: "seller", label: "Seller", kind: "string", hint: "Seller / exporter name and address", required: true },
    { key: "buyer", label: "Buyer", kind: "string", hint: "Buyer / importer of record name and address", required: true },
    { key: "currency", label: "Currency", kind: "string", hint: "ISO 4217 currency code of the invoice total", required: true },
    { key: "total_value", label: "Total value", kind: "number", hint: "Invoice grand total, numeric only", required: true },
    { key: "incoterm", label: "Incoterm", kind: "string", hint: "Terms of sale, e.g. FOB, CIF, DDP, EXW", required: true },
    { key: "incoterm_place", label: "Incoterm place", kind: "string", hint: "Named place for the incoterm, e.g. Shanghai" },
    { key: "country_of_origin", label: "Country of origin", kind: "string", hint: "Country of origin of the goods", required: true },
    { key: "hts_codes", label: "HTS codes", kind: "string[]", hint: "All HTS / HS classification codes listed" },
    { key: "line_item_count", label: "Line items", kind: "number", hint: "Number of distinct line items" },
    { key: "total_quantity", label: "Total quantity", kind: "number", hint: "Total units across all line items" },
    { key: "gross_weight_kg", label: "Gross weight (kg)", kind: "number", hint: "Gross weight in kg if stated" },
    { key: "payment_terms", label: "Payment terms", kind: "string", hint: "e.g. T/T 30 days, L/C at sight" },
  ],
};

const PACKING_LIST: DocumentTypeSpec = {
  type: "packing_list",
  label: "Packing List",
  purpose: "How the cargo is physically packed — the basis for exam and stow.",
  authority: "Carrier / CBP exam reference",
  signals: [
    { phrase: "packing list", weight: 10 },
    { phrase: "packing specification", weight: 8 },
    { phrase: "net weight", weight: 4 },
    { phrase: "gross weight", weight: 3 },
    { phrase: "carton no", weight: 5 },
    { phrase: "marks and numbers", weight: 5 },
    { phrase: "cbm", weight: 4 },
  ],
  fields: [
    { key: "packing_list_number", label: "Packing list number", kind: "string", hint: "Packing list reference number" },
    { key: "invoice_number", label: "Invoice reference", kind: "string", hint: "Related commercial invoice number", required: true },
    { key: "shipper", label: "Shipper", kind: "string", hint: "Shipper name", required: true },
    { key: "consignee", label: "Consignee", kind: "string", hint: "Consignee name", required: true },
    { key: "package_count", label: "Total packages", kind: "number", hint: "Total cartons / pallets / packages", required: true },
    { key: "package_type", label: "Package type", kind: "string", hint: "e.g. cartons, pallets, drums" },
    { key: "net_weight_kg", label: "Net weight (kg)", kind: "number", hint: "Total net weight in kg", required: true },
    { key: "gross_weight_kg", label: "Gross weight (kg)", kind: "number", hint: "Total gross weight in kg", required: true },
    { key: "volume_cbm", label: "Volume (CBM)", kind: "number", hint: "Total measurement in cubic metres" },
    { key: "marks_and_numbers", label: "Marks & numbers", kind: "string", hint: "Shipping marks stencilled on the cartons" },
    { key: "container_numbers", label: "Containers", kind: "string[]", hint: "Container numbers if stated" },
    { key: "total_quantity", label: "Total quantity", kind: "number", hint: "Total units across all lines" },
  ],
};

const ISF: DocumentTypeSpec = {
  type: "isf",
  label: "Importer Security Filing (10+2)",
  purpose: "Advance cargo data CBP requires before the box is loaded overseas.",
  authority: "19 CFR 149 — ISF must be filed no later than 24 hours before lading",
  signals: [
    { phrase: "importer security filing", weight: 10 },
    { phrase: "isf", weight: 6 },
    { phrase: "10+2", weight: 9 },
    { phrase: "isf transaction number", weight: 10 },
    { phrase: "manufacturer (or supplier)", weight: 7 },
    { phrase: "ship to party", weight: 5 },
    { phrase: "consolidator", weight: 4 },
    { phrase: "container stuffing location", weight: 8 },
  ],
  fields: [
    { key: "isf_transaction_number", label: "ISF transaction number", kind: "string", hint: "CBP-issued ISF transaction number", required: true },
    { key: "filing_datetime", label: "Filed at", kind: "datetime", hint: "Date and time the ISF was transmitted to CBP", required: true },
    { key: "lading_datetime", label: "Lading at origin", kind: "datetime", hint: "Date and time cargo was or will be laden aboard the vessel at the foreign port", required: true },
    { key: "importer_of_record_number", label: "Importer of record no.", kind: "string", hint: "IRS/EIN, SSN or CBP-assigned importer number", required: true },
    { key: "consignee_number", label: "Consignee number", kind: "string", hint: "Consignee IRS number", required: true },
    { key: "seller", label: "Seller", kind: "string", hint: "Seller / owner name and address", required: true },
    { key: "buyer", label: "Buyer", kind: "string", hint: "Buyer / owner name and address", required: true },
    { key: "manufacturer", label: "Manufacturer / supplier", kind: "string", hint: "Manufacturer or supplier name and address", required: true },
    { key: "ship_to_party", label: "Ship to party", kind: "string", hint: "First deliver-to party name and address", required: true },
    { key: "country_of_origin", label: "Country of origin", kind: "string", hint: "Country of origin of the goods", required: true },
    { key: "hts_codes", label: "HTS codes", kind: "string[]", hint: "HTSUS numbers to 6 digits", required: true },
    { key: "container_stuffing_location", label: "Stuffing location", kind: "string", hint: "Where the container was stuffed", required: true },
    { key: "consolidator", label: "Consolidator", kind: "string", hint: "Stuffer / consolidator name and address", required: true },
    { key: "bl_number", label: "B/L number", kind: "string", hint: "Related bill of lading number" },
  ],
};

const CERTIFICATE_OF_ORIGIN: DocumentTypeSpec = {
  type: "certificate_of_origin",
  label: "Certificate of Origin",
  purpose: "Evidence of origin, usually to claim preferential duty treatment.",
  authority: "Trade agreement rules of origin / 19 CFR 102",
  signals: [
    { phrase: "certificate of origin", weight: 10 },
    { phrase: "chamber of commerce", weight: 7 },
    { phrase: "we hereby certify", weight: 5 },
    { phrase: "origin criterion", weight: 8 },
    { phrase: "usmca", weight: 6 },
    { phrase: "preferential treatment", weight: 6 },
    { phrase: "exporter", weight: 1 },
  ],
  fields: [
    { key: "certificate_number", label: "Certificate number", kind: "string", hint: "Certificate reference number" },
    { key: "issue_date", label: "Issue date", kind: "date", hint: "Date the certificate was issued", required: true },
    { key: "exporter", label: "Exporter", kind: "string", hint: "Exporter name and address", required: true },
    { key: "producer", label: "Producer", kind: "string", hint: "Producer name and address if stated" },
    { key: "importer", label: "Importer", kind: "string", hint: "Importer / consignee name and address", required: true },
    { key: "country_of_origin", label: "Country of origin", kind: "string", hint: "Declared country of origin", required: true },
    { key: "trade_agreement", label: "Trade agreement", kind: "string", hint: "Agreement claimed, e.g. USMCA, CAFTA-DR, GSP" },
    { key: "origin_criterion", label: "Origin criterion", kind: "string", hint: "Origin criterion letter/code claimed, e.g. A, B, C" },
    { key: "hts_codes", label: "HTS codes", kind: "string[]", hint: "Tariff classification numbers covered" },
    { key: "invoice_number", label: "Invoice reference", kind: "string", hint: "Related commercial invoice number" },
    { key: "issuing_authority", label: "Issuing authority", kind: "string", hint: "Chamber of commerce or certifying body" },
    { key: "signatory", label: "Signatory", kind: "string", hint: "Name of the person who signed the certification", required: true },
    { key: "blanket_period_end", label: "Blanket period end", kind: "date", hint: "End of the blanket period, if the certificate covers one" },
  ],
};

const PHYTOSANITARY: DocumentTypeSpec = {
  type: "phytosanitary_certificate",
  label: "Phytosanitary Certificate",
  purpose: "NPPO attestation that the plant consignment is pest-free and meets the importing country's rules.",
  authority: "IPPC / ISPM 12; 7 CFR 319 for US import",
  signals: [
    { phrase: "phytosanitary certificate", weight: 10 },
    { phrase: "phytosanitary", weight: 8 },
    { phrase: "plant protection organization", weight: 9 },
    { phrase: "nppo", weight: 7 },
    { phrase: "additional declaration", weight: 8 },
    { phrase: "botanical name", weight: 7 },
    { phrase: "disinfestation", weight: 6 },
    { phrase: "free from quarantine pests", weight: 9 },
  ],
  fields: [
    { key: "certificate_number", label: "Certificate number", kind: "string", hint: "Phytosanitary certificate number", required: true },
    { key: "issue_date", label: "Issue date", kind: "date", hint: "Date of issue", required: true },
    { key: "issuing_nppo", label: "Issuing NPPO", kind: "string", hint: "National Plant Protection Organization that issued it", required: true },
    { key: "country_of_origin", label: "Country of origin", kind: "string", hint: "Place of origin of the plants/produce", required: true },
    { key: "country_of_destination", label: "Destination country", kind: "string", hint: "Declared country of destination", required: true },
    { key: "exporter", label: "Exporter", kind: "string", hint: "Name and address of exporter", required: true },
    { key: "consignee", label: "Consignee", kind: "string", hint: "Declared name and address of consignee", required: true },
    { key: "botanical_name", label: "Botanical name", kind: "string", hint: "Botanical (Latin) name of the plants", required: true },
    { key: "commodity_description", label: "Commodity", kind: "string", hint: "Description of the consignment", required: true },
    { key: "quantity_declared", label: "Quantity declared", kind: "string", hint: "Quantity and units as declared" },
    { key: "distinguishing_marks", label: "Distinguishing marks", kind: "string", hint: "Marks identifying the consignment" },
    { key: "treatment", label: "Treatment", kind: "string", hint: "Treatment applied, e.g. methyl bromide fumigation, cold treatment" },
    { key: "treatment_date", label: "Treatment date", kind: "date", hint: "Date treatment was carried out" },
    { key: "additional_declaration", label: "Additional declaration", kind: "string", hint: "Additional declaration text required by the importing country" },
    { key: "is_reexport", label: "Re-export certificate", kind: "string", hint: "yes if this is a phytosanitary certificate for re-export, otherwise no" },
    { key: "departure_date", label: "Departure date", kind: "date", hint: "Declared date of departure if stated" },
  ],
};

const FDA_PRIOR_NOTICE: DocumentTypeSpec = {
  type: "fda_prior_notice",
  label: "FDA Prior Notice",
  purpose: "Advance notice FDA requires before food, drugs, devices or cosmetics arrive.",
  authority: "21 CFR 1.279 — timing by mode; 21 CFR 1.283 — refusal for no notice",
  signals: [
    { phrase: "prior notice", weight: 9 },
    { phrase: "prior notice confirmation", weight: 10 },
    { phrase: "pn confirmation number", weight: 10 },
    { phrase: "food and drug administration", weight: 6 },
    { phrase: "fda product code", weight: 8 },
    { phrase: "prior notice system interface", weight: 10 },
    { phrase: "registration number", weight: 3 },
    { phrase: "affirmation of compliance", weight: 5 },
  ],
  fields: [
    { key: "confirmation_number", label: "PN confirmation number", kind: "string", hint: "FDA Prior Notice confirmation number", required: true },
    { key: "submission_datetime", label: "Submitted at", kind: "datetime", hint: "Date and time the prior notice was submitted to FDA", required: true },
    { key: "arrival_datetime", label: "Arrival at port", kind: "datetime", hint: "Anticipated date and time of arrival at the port of entry", required: true },
    { key: "mode_of_transport", label: "Mode", kind: "string", hint: "Mode of transport: water, air, rail or road", required: true },
    { key: "port_of_arrival", label: "Port of arrival", kind: "string", hint: "US port of arrival", required: true },
    { key: "fda_product_code", label: "FDA product code", kind: "string", hint: "FDA product code for the article", required: true },
    { key: "product_description", label: "Product", kind: "string", hint: "Description of the article of food/drug", required: true },
    { key: "manufacturer", label: "Manufacturer", kind: "string", hint: "Manufacturer name and address", required: true },
    { key: "manufacturer_registration_number", label: "Manufacturer FDA registration", kind: "string", hint: "FDA food facility registration number of the manufacturer", required: true },
    { key: "shipper", label: "Shipper", kind: "string", hint: "Shipper name and address" },
    { key: "grower", label: "Grower", kind: "string", hint: "Grower name and address if known" },
    { key: "country_of_production", label: "Country of production", kind: "string", hint: "Country where the article was produced", required: true },
    { key: "country_of_shipment", label: "Country of shipment", kind: "string", hint: "Country from which the article is shipped", required: true },
    { key: "carrier", label: "Carrier", kind: "string", hint: "Carrier name" },
    { key: "bl_number", label: "B/L or AWB number", kind: "string", hint: "Bill of lading or air waybill number" },
  ],
};

export const DOCUMENT_SPECS: Record<TradeDocumentType, DocumentTypeSpec> = {
  bill_of_lading: BILL_OF_LADING,
  commercial_invoice: COMMERCIAL_INVOICE,
  packing_list: PACKING_LIST,
  isf: ISF,
  certificate_of_origin: CERTIFICATE_OF_ORIGIN,
  phytosanitary_certificate: PHYTOSANITARY,
  fda_prior_notice: FDA_PRIOR_NOTICE,
};

export const DOCUMENT_TYPES = Object.keys(DOCUMENT_SPECS) as TradeDocumentType[];

export function getDocumentSpec(type: TradeDocumentType): DocumentTypeSpec {
  const spec = DOCUMENT_SPECS[type];
  if (!spec) throw new Error(`Unknown trade document type: ${type}`);
  return spec;
}

export function isTradeDocumentType(value: unknown): value is TradeDocumentType {
  return typeof value === "string" && value in DOCUMENT_SPECS;
}

// Extracted shipment data schema — matches what Claude Vision returns

export interface ExtractedShipmentData {
  documentType: string;
  shipper?: {
    name?: string;
    address?: string;
    country?: string;
  };
  consignee?: {
    name?: string;
    address?: string;
    country?: string;
  };
  notifyParty?: {
    name?: string;
    address?: string;
  };
  ports?: {
    origin?: string;
    originCode?: string;
    destination?: string;
    destinationCode?: string;
    transshipment?: string;
  };
  vessel?: {
    name?: string;
    voyage?: string;
  };
  containers?: Array<{
    number?: string;
    sealNumber?: string;
    type?: string;
    weight?: string;
    volume?: string;
  }>;
  cargo?: {
    description?: string;
    hsCode?: string;
    quantity?: string;
    grossWeight?: string;
    weightUnit?: string;
    volume?: string;
    volumeUnit?: string;
    packageCount?: string;
    packageType?: string;
  };
  financials?: {
    totalValue?: string;
    currency?: string;
    freightCharges?: string;
    insuranceValue?: string;
    incoterm?: string;
  };
  references?: {
    billOfLadingNumber?: string;
    bookingNumber?: string;
    poNumber?: string;
    invoiceNumber?: string;
    letterOfCreditNumber?: string;
  };
  dates?: {
    shipmentDate?: string;
    etd?: string;
    eta?: string;
    invoiceDate?: string;
  };
  additionalNotes?: string;
}

export interface ExtractionResult {
  data: ExtractedShipmentData;
  confidence: number;
  rawText?: string;
}

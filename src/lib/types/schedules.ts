// Types for vessel-sharing agreements (alliances) and schedule data.
// TODO(AI-8781): Replace inline shapes with the canonical schemas once the
// data/*.json structures are locked end-to-end.

export interface VesselSharingAgreementMember {
  carrierCode: string;
  carrierName: string;
  teuCapacity: number;
  marketSharePercent: number;
}

export interface VesselSharingAgreement {
  id: string;
  name: string;
  members: VesselSharingAgreementMember[];
  routes?: string[];
  effectiveDate?: string;
  notes?: string;
}

export interface ShippingSchedule {
  id?: string;
  carrier: string;
  carrierCode: string;
  alliance?: string;
  vesselName?: string;
  voyageNumber?: string;
  originPort: string;
  originPortName: string;
  destPort: string;
  destPortName: string;
  departureDate: string;
  arrivalDate?: string;
  transitDays?: number;
  serviceCode?: string;
  serviceName?: string;
}

export interface CarrierReliability {
  carrier: string;
  carrierCode: string;
  route?: string;
  onTimePercent: number;
  averageDelayDays?: number;
  sampleSize?: number;
  period?: string;
}

export interface CarrierAtPort {
  name: string;
  code: string;
  services?: string[];
}

export interface CarrierPortMapping {
  portCode: string;
  portName: string;
  country: string;
  carriers: CarrierAtPort[];
}

export interface CarrierMarketShare {
  carrier: string;
  carrierCode: string;
  globalMarketSharePercent: number;
  teuCapacity: number;
  vesselCount?: number;
  alliance?: string;
  headquarters?: string;
}

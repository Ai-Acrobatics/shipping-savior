export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
  avatarUrl?: string | null;
  orgId: string | null;
  role: string;
  emailVerified?: boolean;
}

export interface LoginResponse {
  token: string;
  cookieName: string;
  expiresAt: string;
  user: SessionUser;
}

export type ShipmentStatus =
  | 'planned'
  | 'in_transit'
  | 'arrived'
  | 'delivered'
  | 'delayed'
  | 'cancelled';

export interface Shipment {
  id: string;
  reference: string | null;
  containerNumber: string | null;
  vesselName: string | null;
  voyageNumber: string | null;
  pol: string | null;
  pod: string | null;
  etd: string | null;
  eta: string | null;
  carrier: string | null;
  shipper: string | null;
  consignee: string | null;
  notifyParty: string | null;
  goodsDescription: string | null;
  weightKg: number | null;
  quantity: number | null;
  status: string;
  source: string;
  importMeta: Record<string, unknown> | null;
  bolBlobUrl: string | null;
  bolFileName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ShipmentsResponse {
  shipments: Shipment[];
  total: number;
  limit: number;
  offset: number;
}

export interface BolExtraction {
  container_numbers: string[] | null;
  vessel_name: string | null;
  voyage_number: string | null;
  port_of_loading: string | null;
  port_of_discharge: string | null;
  etd: string | null;
  eta: string | null;
  carrier: string | null;
  shipper: string | null;
  consignee: string | null;
  notify_party: string | null;
  goods_description: string | null;
  weight_kg: number | null;
  quantity: number | null;
}

export interface BolResponse {
  success?: boolean;
  provider?: string;
  extracted?: BolExtraction;
  confidence?: Record<string, number>;
  bolDocumentId?: string | null;
  blobUrl?: string | null;
  error?: string;
}

export interface SavedCalculation {
  id: string;
  calculatorType: string;
  name: string | null;
  inputs: Record<string, unknown>;
  outputs: Record<string, unknown>;
  createdAt: string;
}

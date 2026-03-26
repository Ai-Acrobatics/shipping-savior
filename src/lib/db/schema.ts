import {
  pgTable,
  text,
  varchar,
  timestamp,
  decimal,
  integer,
  boolean,
  jsonb,
  uuid,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ── Enums ──────────────────────────────────────────────────────────────────

export const userRoleEnum = pgEnum('user_role', ['admin', 'editor', 'viewer']);
export const orgPlanEnum = pgEnum('org_plan', ['starter', 'professional', 'enterprise']);
export const shipmentStatusEnum = pgEnum('shipment_status', [
  'draft', 'booked', 'in_transit', 'at_port', 'customs', 'delivered', 'cancelled',
]);
export const cargoTypeEnum = pgEnum('cargo_type', [
  'general', 'hazmat', 'refrigerated', 'oversized', 'bulk', 'liquid',
]);
export const containerTypeEnum = pgEnum('container_type', ['20ft', '40ft', '40HC', 'reefer']);
export const docTypeEnum = pgEnum('doc_type', ['BOL', 'ISF', 'CI', 'PL']);
export const docStatusEnum = pgEnum('doc_status', ['draft', 'review', 'approved', 'filed']);
export const ftzElectionEnum = pgEnum('ftz_election', ['PF', 'NPF']);
export const calcTypeEnum = pgEnum('calc_type', [
  'landed_cost', 'duty', 'ftz_savings', 'container_utilization', 'freight_rate', 'route_comparison',
]);
export const alertTypeEnum = pgEnum('alert_type', [
  'tariff_change', 'compliance_issue', 'document_expiry', 'shipment_delay', 'rate_increase',
]);
export const severityEnum = pgEnum('severity', ['low', 'medium', 'high', 'critical']);
export const scrapeStatusEnum = pgEnum('scrape_status', ['idle', 'running', 'completed', 'failed']);

// ── Core ───────────────────────────────────────────────────────────────────

export const organizations = pgTable('organizations', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  plan: orgPlanEnum('plan').notNull().default('starter'),
  stripeCustomerId: text('stripe_customer_id'),
  stripeSubscriptionId: text('stripe_subscription_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name'),
  passwordHash: text('password_hash').notNull(),
  role: userRoleEnum('role').notNull().default('viewer'),
  orgId: uuid('org_id').references(() => organizations.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const sessions = pgTable('sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  sessionToken: text('session_token').notNull().unique(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires').notNull(),
});

// ── Tariff ─────────────────────────────────────────────────────────────────

export const htsCodes = pgTable('hts_codes', {
  id: uuid('id').defaultRandom().primaryKey(),
  code: varchar('code', { length: 10 }).notNull().unique(),
  description: text('description').notNull(),
  generalRate: decimal('general_rate', { precision: 10, scale: 4 }),
  specialRates: jsonb('special_rates'),
  unitQty: text('unit_qty'),
  chapter: integer('chapter'),
  heading: integer('heading'),
  subheading: integer('subheading'),
  lastUpdated: timestamp('last_updated').defaultNow().notNull(),
});

export const countryRates = pgTable('country_rates', {
  id: uuid('id').defaultRandom().primaryKey(),
  htsCodeId: uuid('hts_code_id').notNull().references(() => htsCodes.id),
  countryCode: varchar('country_code', { length: 2 }).notNull(),
  dutyRate: decimal('duty_rate', { precision: 10, scale: 4 }),
  program: varchar('program', { length: 50 }),
});

export const tariffChanges = pgTable('tariff_changes', {
  id: uuid('id').defaultRandom().primaryKey(),
  htsCodeId: uuid('hts_code_id').notNull().references(() => htsCodes.id),
  oldRate: decimal('old_rate', { precision: 10, scale: 4 }),
  newRate: decimal('new_rate', { precision: 10, scale: 4 }),
  effectiveDate: timestamp('effective_date').notNull(),
  sourceUrl: text('source_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ── Shipping ───────────────────────────────────────────────────────────────

export const shipments = pgTable('shipments', {
  id: uuid('id').defaultRandom().primaryKey(),
  orgId: uuid('org_id').notNull().references(() => organizations.id),
  reference: text('reference'),
  originPort: text('origin_port'),
  destPort: text('dest_port'),
  carrier: text('carrier'),
  status: shipmentStatusEnum('status').notNull().default('draft'),
  cargoType: cargoTypeEnum('cargo_type').notNull().default('general'),
  containerCount: integer('container_count'),
  eta: timestamp('eta'),
  value: decimal('value', { precision: 14, scale: 2 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const containers = pgTable('containers', {
  id: uuid('id').defaultRandom().primaryKey(),
  shipmentId: uuid('shipment_id').notNull().references(() => shipments.id, { onDelete: 'cascade' }),
  number: text('number'),
  type: containerTypeEnum('type').notNull().default('40ft'),
  weight: decimal('weight', { precision: 10, scale: 2 }),
  volume: decimal('volume', { precision: 10, scale: 2 }),
  sealNumber: text('seal_number'),
});

export const shipmentDocuments = pgTable('shipment_documents', {
  id: uuid('id').defaultRandom().primaryKey(),
  shipmentId: uuid('shipment_id').notNull().references(() => shipments.id, { onDelete: 'cascade' }),
  docType: docTypeEnum('doc_type').notNull(),
  fileUrl: text('file_url'),
  status: docStatusEnum('status').notNull().default('draft'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const shipmentTimeline = pgTable('shipment_timeline', {
  id: uuid('id').defaultRandom().primaryKey(),
  shipmentId: uuid('shipment_id').notNull().references(() => shipments.id, { onDelete: 'cascade' }),
  eventType: text('event_type').notNull(),
  location: text('location'),
  timestamp: timestamp('timestamp').notNull(),
  details: text('details'),
});

// ── Routes ─────────────────────────────────────────────────────────────────

export const ports = pgTable('ports', {
  id: uuid('id').defaultRandom().primaryKey(),
  locode: varchar('locode', { length: 5 }).notNull().unique(),
  name: text('name').notNull(),
  country: varchar('country', { length: 2 }).notNull(),
  lat: decimal('lat', { precision: 10, scale: 6 }),
  lng: decimal('lng', { precision: 10, scale: 6 }),
  portType: text('port_type'),
  facilities: jsonb('facilities'),
});

export const carriers = pgTable('carriers', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  code: text('code'),
  logoUrl: text('logo_url'),
  website: text('website'),
  apiAvailable: boolean('api_available').default(false),
});

export const carrierRoutes = pgTable('carrier_routes', {
  id: uuid('id').defaultRandom().primaryKey(),
  carrierId: uuid('carrier_id').notNull().references(() => carriers.id),
  originPortId: uuid('origin_port_id').notNull().references(() => ports.id),
  destPortId: uuid('dest_port_id').notNull().references(() => ports.id),
  transitDays: integer('transit_days'),
  frequency: text('frequency'),
  transshipmentPorts: jsonb('transshipment_ports'),
  backhaulAvailable: boolean('backhaul_available').default(false),
});

// ── FTZ ────────────────────────────────────────────────────────────────────

export const ftzZones = pgTable('ftz_zones', {
  id: uuid('id').defaultRandom().primaryKey(),
  zoneNumber: integer('zone_number').notNull(),
  name: text('name').notNull(),
  location: text('location'),
  operator: text('operator'),
  contactEmail: text('contact_email'),
  contactPhone: text('contact_phone'),
  lat: decimal('lat', { precision: 10, scale: 6 }),
  lng: decimal('lng', { precision: 10, scale: 6 }),
  subzones: jsonb('subzones'),
});

export const ftzEntries = pgTable('ftz_entries', {
  id: uuid('id').defaultRandom().primaryKey(),
  orgId: uuid('org_id').notNull().references(() => organizations.id),
  ftzZoneId: uuid('ftz_zone_id').notNull().references(() => ftzZones.id),
  entryDate: timestamp('entry_date').notNull(),
  lockedDutyRate: decimal('locked_duty_rate', { precision: 10, scale: 4 }),
  statusElection: ftzElectionEnum('status_election').notNull().default('NPF'),
  totalUnits: integer('total_units'),
  unitValue: decimal('unit_value', { precision: 14, scale: 2 }),
});

export const ftzWithdrawals = pgTable('ftz_withdrawals', {
  id: uuid('id').defaultRandom().primaryKey(),
  entryId: uuid('entry_id').notNull().references(() => ftzEntries.id, { onDelete: 'cascade' }),
  withdrawalDate: timestamp('withdrawal_date').notNull(),
  units: integer('units'),
  dutyPaid: decimal('duty_paid', { precision: 14, scale: 2 }),
  cumulativeSavings: decimal('cumulative_savings', { precision: 14, scale: 2 }),
});

// ── Calculator ─────────────────────────────────────────────────────────────

export const savedCalculations = pgTable('saved_calculations', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id),
  calcType: calcTypeEnum('calc_type').notNull(),
  name: text('name'),
  inputs: jsonb('inputs'),
  results: jsonb('results'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const calculationHistory = pgTable('calculation_history', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id),
  calcType: calcTypeEnum('calc_type').notNull(),
  inputs: jsonb('inputs'),
  results: jsonb('results'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ── AI ─────────────────────────────────────────────────────────────────────

export const aiClassifications = pgTable('ai_classifications', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id),
  productDescription: text('product_description').notNull(),
  predictedHts: text('predicted_hts'),
  confidence: decimal('confidence', { precision: 5, scale: 4 }),
  humanOverride: boolean('human_override').default(false),
  correctHts: text('correct_hts'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const complianceAlerts = pgTable('compliance_alerts', {
  id: uuid('id').defaultRandom().primaryKey(),
  orgId: uuid('org_id').notNull().references(() => organizations.id),
  alertType: alertTypeEnum('alert_type').notNull(),
  severity: severityEnum('severity').notNull().default('medium'),
  message: text('message').notNull(),
  relatedShipmentId: uuid('related_shipment_id').references(() => shipments.id),
  resolved: boolean('resolved').default(false),
  resolvedAt: timestamp('resolved_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ── Data Pipeline ──────────────────────────────────────────────────────────

export const scrapeJobs = pgTable('scrape_jobs', {
  id: uuid('id').defaultRandom().primaryKey(),
  sourceName: text('source_name').notNull(),
  lastRun: timestamp('last_run'),
  status: scrapeStatusEnum('status').notNull().default('idle'),
  recordsProcessed: integer('records_processed').default(0),
  errors: integer('errors').default(0),
  nextRun: timestamp('next_run'),
});

export const dataQualityScores = pgTable('data_quality_scores', {
  id: uuid('id').defaultRandom().primaryKey(),
  sourceName: text('source_name').notNull(),
  completeness: decimal('completeness', { precision: 5, scale: 4 }),
  accuracy: decimal('accuracy', { precision: 5, scale: 4 }),
  freshness: decimal('freshness', { precision: 5, scale: 4 }),
  scoreDate: timestamp('score_date').defaultNow().notNull(),
});

// ── Relations ──────────────────────────────────────────────────────────────

export const organizationsRelations = relations(organizations, ({ many }) => ({
  users: many(users),
  shipments: many(shipments),
  ftzEntries: many(ftzEntries),
  complianceAlerts: many(complianceAlerts),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [users.orgId],
    references: [organizations.id],
  }),
  savedCalculations: many(savedCalculations),
  calculationHistory: many(calculationHistory),
  aiClassifications: many(aiClassifications),
}));

export const shipmentsRelations = relations(shipments, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [shipments.orgId],
    references: [organizations.id],
  }),
  containers: many(containers),
  documents: many(shipmentDocuments),
  timeline: many(shipmentTimeline),
}));

export const containersRelations = relations(containers, ({ one }) => ({
  shipment: one(shipments, {
    fields: [containers.shipmentId],
    references: [shipments.id],
  }),
}));

export const shipmentDocumentsRelations = relations(shipmentDocuments, ({ one }) => ({
  shipment: one(shipments, {
    fields: [shipmentDocuments.shipmentId],
    references: [shipments.id],
  }),
}));

export const shipmentTimelineRelations = relations(shipmentTimeline, ({ one }) => ({
  shipment: one(shipments, {
    fields: [shipmentTimeline.shipmentId],
    references: [shipments.id],
  }),
}));

export const htsCodesRelations = relations(htsCodes, ({ many }) => ({
  countryRates: many(countryRates),
  tariffChanges: many(tariffChanges),
}));

export const countryRatesRelations = relations(countryRates, ({ one }) => ({
  htsCode: one(htsCodes, {
    fields: [countryRates.htsCodeId],
    references: [htsCodes.id],
  }),
}));

export const tariffChangesRelations = relations(tariffChanges, ({ one }) => ({
  htsCode: one(htsCodes, {
    fields: [tariffChanges.htsCodeId],
    references: [htsCodes.id],
  }),
}));

export const carriersRelations = relations(carriers, ({ many }) => ({
  routes: many(carrierRoutes),
}));

export const carrierRoutesRelations = relations(carrierRoutes, ({ one }) => ({
  carrier: one(carriers, {
    fields: [carrierRoutes.carrierId],
    references: [carriers.id],
  }),
  originPort: one(ports, {
    fields: [carrierRoutes.originPortId],
    references: [ports.id],
  }),
  destPort: one(ports, {
    fields: [carrierRoutes.destPortId],
    references: [ports.id],
  }),
}));

export const ftzEntriesRelations = relations(ftzEntries, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [ftzEntries.orgId],
    references: [organizations.id],
  }),
  ftzZone: one(ftzZones, {
    fields: [ftzEntries.ftzZoneId],
    references: [ftzZones.id],
  }),
  withdrawals: many(ftzWithdrawals),
}));

export const ftzWithdrawalsRelations = relations(ftzWithdrawals, ({ one }) => ({
  entry: one(ftzEntries, {
    fields: [ftzWithdrawals.entryId],
    references: [ftzEntries.id],
  }),
}));

export const savedCalculationsRelations = relations(savedCalculations, ({ one }) => ({
  user: one(users, {
    fields: [savedCalculations.userId],
    references: [users.id],
  }),
}));

export const calculationHistoryRelations = relations(calculationHistory, ({ one }) => ({
  user: one(users, {
    fields: [calculationHistory.userId],
    references: [users.id],
  }),
}));

export const aiClassificationsRelations = relations(aiClassifications, ({ one }) => ({
  user: one(users, {
    fields: [aiClassifications.userId],
    references: [users.id],
  }),
}));

export const complianceAlertsRelations = relations(complianceAlerts, ({ one }) => ({
  organization: one(organizations, {
    fields: [complianceAlerts.orgId],
    references: [organizations.id],
  }),
  shipment: one(shipments, {
    fields: [complianceAlerts.relatedShipmentId],
    references: [shipments.id],
  }),
}));

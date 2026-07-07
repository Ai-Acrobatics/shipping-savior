import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  jsonb,
  pgEnum,
  uniqueIndex,
  integer,
  boolean,
  numeric,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ── Enums ──────────────────────────────────────────────

export const orgRoleEnum = pgEnum('org_role', [
  'owner',
  'admin',
  'member',
  'viewer',
]);

export const calculatorTypeEnum = pgEnum('calculator_type', [
  'landed_cost',
  'unit_economics',
  'ftz_savings',
  'pf_npf_comparison',
  'container_utilization',
  'tariff_scenario',
  'shelf_life',
]);

export const auditActionEnum = pgEnum('audit_action', [
  'login',
  'register',
  'logout',
  'failed_login',
  'invite_sent',
  'invite_accepted',
  'calculation_saved',
  'calculation_deleted',
]);

// ── Billing Enums (AI-8777) ─────────────────────────────
//
// `plan` enum drives tier limits + feature gating. We keep the existing
// organizations.plan varchar column for backward compat (defaulted to 'free')
// and add a typed enum column alongside; the webhook handler writes to both
// so we can flip readers over to the enum incrementally.

export const planEnum = pgEnum('plan_tier', ['free', 'premium', 'enterprise']);

export const subscriptionStatusEnum = pgEnum('subscription_status', [
  'active',
  'past_due',
  'canceled',
  'trialing',
  'incomplete',
  'incomplete_expired',
  'unpaid',
  'paused',
]);

// ── Organizations ──────────────────────────────────────

export const organizations = pgTable('organizations', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  // Legacy free-form plan column. Kept for backward compat with existing readers.
  // New code should prefer `planTier` (typed enum) — they are kept in sync by the
  // Stripe webhook handler.
  plan: varchar('plan', { length: 50 }).notNull().default('free'),
  isDemo: boolean('is_demo').notNull().default(false),
  // ── Billing (AI-8777) ──
  planTier: planEnum('plan_tier').notNull().default('free'),
  stripeCustomerId: text('stripe_customer_id'),
  stripeSubscriptionId: text('stripe_subscription_id'),
  stripePriceId: text('stripe_price_id'),
  subscriptionStatus: subscriptionStatusEnum('subscription_status'),
  currentPeriodEnd: timestamp('current_period_end', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// ── Users ──────────────────────────────────────────────

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  avatarUrl: text('avatar_url'),
  emailVerifiedAt: timestamp('email_verified_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// ── Org Members (join table) ───────────────────────────

export const orgMembers = pgTable('org_members', {
  id: uuid('id').defaultRandom().primaryKey(),
  orgId: uuid('org_id')
    .notNull()
    .references(() => organizations.id, { onDelete: 'cascade' }),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  role: orgRoleEnum('role').notNull().default('member'),
  invitedBy: uuid('invited_by').references(() => users.id, { onDelete: 'set null' }),
  joinedAt: timestamp('joined_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  uniqueMember: uniqueIndex('org_members_org_user_idx').on(table.orgId, table.userId),
}));

// ── Calculations ───────────────────────────────────────

export const calculations = pgTable('calculations', {
  id: uuid('id').defaultRandom().primaryKey(),
  orgId: uuid('org_id')
    .notNull()
    .references(() => organizations.id, { onDelete: 'cascade' }),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  calculatorType: calculatorTypeEnum('calculator_type').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  inputs: jsonb('inputs').notNull(),
  outputs: jsonb('outputs').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// ── Audit Logs ─────────────────────────────────────────

export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  orgId: uuid('org_id').references(() => organizations.id, { onDelete: 'set null' }),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  action: auditActionEnum('action').notNull(),
  metadata: jsonb('metadata'),
  ipAddress: varchar('ip_address', { length: 45 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// ── Password Reset Tokens ─────────────────────────────

export const passwordResetTokens = pgTable('password_reset_tokens', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  tokenHash: text('token_hash').notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  usedAt: timestamp('used_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// ── Email Verifications ───────────────────────────────

export const emailVerifications = pgTable('email_verifications', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  tokenHash: text('token_hash').notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  verifiedAt: timestamp('verified_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// ── Invites ────────────────────────────────────────────

export const invites = pgTable('invites', {
  id: uuid('id').defaultRandom().primaryKey(),
  orgId: uuid('org_id')
    .notNull()
    .references(() => organizations.id, { onDelete: 'cascade' }),
  email: varchar('email', { length: 255 }).notNull(),
  role: orgRoleEnum('role').notNull(),
  token: varchar('token', { length: 255 }).unique().notNull(),
  invitedBy: uuid('invited_by')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  acceptedAt: timestamp('accepted_at', { withTimezone: true }),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// ── Relations ──────────────────────────────────────────

export const organizationsRelations = relations(organizations, ({ many }) => ({
  members: many(orgMembers),
  calculations: many(calculations),
  auditLogs: many(auditLogs),
  invites: many(invites),
  contracts: many(contracts),
  shipments: many(shipments),
}));

export const usersRelations = relations(users, ({ many }) => ({
  memberships: many(orgMembers),
  calculations: many(calculations),
  auditLogs: many(auditLogs),
  invitesSent: many(invites),
  contracts: many(contracts),
}));

export const orgMembersRelations = relations(orgMembers, ({ one }) => ({
  organization: one(organizations, {
    fields: [orgMembers.orgId],
    references: [organizations.id],
  }),
  user: one(users, {
    fields: [orgMembers.userId],
    references: [users.id],
  }),
}));

export const calculationsRelations = relations(calculations, ({ one }) => ({
  organization: one(organizations, {
    fields: [calculations.orgId],
    references: [organizations.id],
  }),
  user: one(users, {
    fields: [calculations.userId],
    references: [users.id],
  }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  organization: one(organizations, {
    fields: [auditLogs.orgId],
    references: [organizations.id],
  }),
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id],
  }),
}));

export const invitesRelations = relations(invites, ({ one }) => ({
  organization: one(organizations, {
    fields: [invites.orgId],
    references: [organizations.id],
  }),
  inviter: one(users, {
    fields: [invites.invitedBy],
    references: [users.id],
  }),
}));

// ── Contract Enums ────────────────────────────────────

export const contractTypeEnum = pgEnum('contract_type', [
  'spot',
  '90_day',
  '180_day',
  '365_day',
]);

// ── Contracts ─────────────────────────────────────────

export const contracts = pgTable('contracts', {
  id: uuid('id').defaultRandom().primaryKey(),
  orgId: uuid('org_id')
    .notNull()
    .references(() => organizations.id, { onDelete: 'cascade' }),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id),
  carrier: varchar('carrier', { length: 100 }).notNull(),
  carrierCode: varchar('carrier_code', { length: 10 }).notNull(),
  contractNumber: varchar('contract_number', { length: 100 }),
  contractType: contractTypeEnum('contract_type').notNull(),
  startDate: timestamp('start_date', { withTimezone: true }).notNull(),
  endDate: timestamp('end_date', { withTimezone: true }).notNull(),
  contactName: varchar('contact_name', { length: 200 }),
  contactEmail: varchar('contact_email', { length: 200 }),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// ── Contract Lanes ────────────────────────────────────

export const contractLanes = pgTable('contract_lanes', {
  id: uuid('id').defaultRandom().primaryKey(),
  contractId: uuid('contract_id')
    .notNull()
    .references(() => contracts.id, { onDelete: 'cascade' }),
  originPort: varchar('origin_port', { length: 10 }).notNull(),
  originPortName: varchar('origin_port_name', { length: 200 }).notNull(),
  destPort: varchar('dest_port', { length: 10 }).notNull(),
  destPortName: varchar('dest_port_name', { length: 200 }).notNull(),
  rate20ft: integer('rate_20ft'),
  rate40ft: integer('rate_40ft'),
  rate40hc: integer('rate_40hc'),
  currency: varchar('currency', { length: 3 }).default('USD'),
  commodity: varchar('commodity', { length: 200 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// ── Contract Relations ────────────────────────────────

export const contractsRelations = relations(contracts, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [contracts.orgId],
    references: [organizations.id],
  }),
  user: one(users, {
    fields: [contracts.userId],
    references: [users.id],
  }),
  lanes: many(contractLanes),
}));

export const contractLanesRelations = relations(contractLanes, ({ one }) => ({
  contract: one(contracts, {
    fields: [contractLanes.contractId],
    references: [contracts.id],
  }),
}));

// ── Type Exports ───────────────────────────────────────

export type Organization = typeof organizations.$inferSelect;
export type NewOrganization = typeof organizations.$inferInsert;

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type OrgMember = typeof orgMembers.$inferSelect;
export type NewOrgMember = typeof orgMembers.$inferInsert;

export type Calculation = typeof calculations.$inferSelect;
export type NewCalculation = typeof calculations.$inferInsert;

export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;

export type Invite = typeof invites.$inferSelect;
export type NewInvite = typeof invites.$inferInsert;

export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type NewPasswordResetToken = typeof passwordResetTokens.$inferInsert;

export type EmailVerification = typeof emailVerifications.$inferSelect;
export type NewEmailVerification = typeof emailVerifications.$inferInsert;

export type Contract = typeof contracts.$inferSelect;
export type NewContract = typeof contracts.$inferInsert;

export type ContractLane = typeof contractLanes.$inferSelect;
export type NewContractLane = typeof contractLanes.$inferInsert;

// Enum type helpers
export type OrgRole = (typeof orgRoleEnum.enumValues)[number];
export type CalculationType = (typeof calculatorTypeEnum.enumValues)[number];
export type AuditAction = (typeof auditActionEnum.enumValues)[number];
export type ContractType = (typeof contractTypeEnum.enumValues)[number];
// AI-8777 — Plan tier matches `planEnum` enum values. 'pro' alias kept out;
// any legacy 'pro' rows in the varchar `plan` column are treated as 'premium'
// when read through the typed plan tier helpers.
export type Plan = (typeof planEnum.enumValues)[number];
export type SubscriptionStatus = (typeof subscriptionStatusEnum.enumValues)[number];

// ── Shipment Enums ────────────────────────────────────

export const shipmentStatusEnum = pgEnum('shipment_status', [
  'booked',
  'in_transit',
  'at_port',
  'customs',
  'delivered',
  'delayed',
  'arrived',
  'pending',
]);

export const shipmentSourceEnum = pgEnum('shipment_source', [
  'manual',
  'bol_ocr',
  'csv_import',
  'workbook_import',
]);

// ── Shipments ─────────────────────────────────────────

export const shipments = pgTable('shipments', {
  id: uuid('id').defaultRandom().primaryKey(),
  orgId: uuid('org_id').references(() => organizations.id, { onDelete: 'set null' }),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  // CSV-importable identifiers
  reference: varchar('reference', { length: 100 }),
  originPort: varchar('origin_port', { length: 200 }),
  destPort: varchar('dest_port', { length: 200 }),
  containerCount: integer('container_count'),
  containerType: varchar('container_type', { length: 50 }),
  cargoType: varchar('cargo_type', { length: 100 }),
  valueUsd: numeric('value_usd', { precision: 14, scale: 2 }),
  progress: integer('progress').default(0),
  currentLocation: varchar('current_location', { length: 300 }),
  // BOL OCR-flavored columns (kept for backward compatibility)
  containerNumber: varchar('container_number', { length: 20 }),
  vesselName: varchar('vessel_name', { length: 200 }),
  voyageNumber: varchar('voyage_number', { length: 100 }),
  pol: varchar('pol', { length: 200 }),
  pod: varchar('pod', { length: 200 }),
  etd: timestamp('etd', { withTimezone: true }),
  eta: timestamp('eta', { withTimezone: true }),
  carrier: varchar('carrier', { length: 100 }),
  shipper: varchar('shipper', { length: 300 }),
  consignee: varchar('consignee', { length: 300 }),
  notifyParty: varchar('notify_party', { length: 300 }),
  goodsDescription: text('goods_description'),
  weightKg: integer('weight_kg'),
  quantity: integer('quantity'),
  status: shipmentStatusEnum('status').notNull().default('in_transit'),
  source: shipmentSourceEnum('source').notNull().default('manual'),
  rawBolText: text('raw_bol_text'),
  bolDocumentId: uuid('bol_document_id'),
  // Reefer-export workbook fields with no dedicated column (AI-10777): type of
  // service, customer code, cross-dock appointment, temperature/vents, PU#/PO#,
  // reefer + document cutoffs, AES #, seal #, week label, source file, and
  // parser review flags. jsonb so Blake's board can evolve without a migration
  // per column.
  importMeta: jsonb('import_meta'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// ── BOL Documents ─────────────────────────────────────

export const bolDocuments = pgTable('bol_documents', {
  id: uuid('id').defaultRandom().primaryKey(),
  orgId: uuid('org_id').references(() => organizations.id, { onDelete: 'set null' }),
  blobUrl: text('blob_url').notNull(),
  fileName: varchar('file_name', { length: 500 }),
  fileType: varchar('file_type', { length: 100 }),
  fileSizeBytes: integer('file_size_bytes'),
  rawText: text('raw_text'),
  extractedJson: jsonb('extracted_json'),
  confidenceJson: jsonb('confidence_json'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// ── Shipment Relations ────────────────────────────────

export const shipmentsRelations = relations(shipments, ({ one }) => ({
  organization: one(organizations, {
    fields: [shipments.orgId],
    references: [organizations.id],
  }),
  user: one(users, {
    fields: [shipments.userId],
    references: [users.id],
  }),
  bolDocument: one(bolDocuments, {
    fields: [shipments.bolDocumentId],
    references: [bolDocuments.id],
  }),
}));

export const bolDocumentsRelations = relations(bolDocuments, ({ one }) => ({
  organization: one(organizations, {
    fields: [bolDocuments.orgId],
    references: [organizations.id],
  }),
}));

// ── Model Comparison Audit Log ────────────────────────
//
// Every AI call in /api/bol and /api/contracts/parse is logged here.
// Use /api/ai/compare to run all providers simultaneously and compare results.

export const modelComparisonLogs = pgTable('model_comparison_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  taskType: varchar('task_type', { length: 50 }).notNull(),   // 'bol' | 'contract'
  fileName: varchar('file_name', { length: 500 }),
  provider: varchar('provider', { length: 50 }).notNull(),    // 'claude-sonnet-4' | 'gemini-2.5-pro' | 'kimi-k2'
  success: boolean('success').notNull().default(false),
  latencyMs: integer('latency_ms'),
  inputTokens: integer('input_tokens'),
  outputTokens: integer('output_tokens'),
  estimatedCostUsd: numeric('estimated_cost_usd', { precision: 10, scale: 6 }),
  errorMessage: text('error_message'),
  responsePreview: text('response_preview'),  // first 500 chars of response
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export type ModelComparisonLog = typeof modelComparisonLogs.$inferSelect;

// ── Shipment Type Exports ─────────────────────────────

export type Shipment = typeof shipments.$inferSelect;
export type NewShipment = typeof shipments.$inferInsert;
export type ShipmentStatus = (typeof shipmentStatusEnum.enumValues)[number];
export type ShipmentSource = (typeof shipmentSourceEnum.enumValues)[number];
export type BolDocument = typeof bolDocuments.$inferSelect;
export type NewBolDocument = typeof bolDocuments.$inferInsert;

// ── Mobile Push Tokens ────────────────────────────────
//
// Expo push tokens registered by the native mobile app (mobile/). One row per
// device token; re-registration bumps lastSeenAt. Tokens are org-scoped so
// shipment/cutoff alerts can fan out per organization.

export const pushTokens = pgTable(
  'push_tokens',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    orgId: uuid('org_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    token: text('token').notNull(),
    platform: varchar('platform', { length: 16 }).notNull(), // 'ios' | 'android'
    deviceName: varchar('device_name', { length: 200 }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    lastSeenAt: timestamp('last_seen_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    tokenIdx: uniqueIndex('push_tokens_token_idx').on(table.token),
  })
);

export type PushToken = typeof pushTokens.$inferSelect;

// ── DCSA/Container Tracking ─────────────────────────
//
// AI-12010 — Terminal49 live container tracking + DCSA events.
// DCSA (Digital Container Shipping Association) event types map to the
// industry-standard event taxonomy used by carriers and visibility platforms.

export const dcsaEventTypeEnum = pgEnum('dcsa_event_type', [
  'ARRIVAL',
  'DEPARTURE',
  'LOAD',
  'DISCHARGE',
  'GATE_IN',
  'GATE_OUT',
  'CUSTOMS_HOLD',
  'CUSTOMS_RELEASE',
  'INSPECTION',
  'PICKUP',
  'DELIVERY',
  'ESTIMATED_ARRIVAL',
  'ESTIMATED_DEPARTURE',
  'OTHER',
]);

export const dcsaEventSourceEnum = pgEnum('dcsa_event_source', [
  'terminal49',
  'manual',
  'carrier_api',
]);

// ── Terminal49 Raw Webhooks ───────────────────────────
//
// Raw inbound payloads from Terminal49's webhook API. Stored for audit and
// re-processing. Each payload can contain multiple events referencing one or
// more containers/shipments.

export const terminal49Webhooks = pgTable('terminal49_webhooks', {
  id: uuid('id').defaultRandom().primaryKey(),
  // Terminal49's webhook ID for idempotency
  t49EventId: varchar('t49_event_id', { length: 100 }),
  // Webhook type from Terminal49 (e.g. 'tracking.created', 'tracking.updated')
  t49EventType: varchar('t49_event_type', { length: 100 }),
  // Raw JSON payload exactly as received
  rawPayload: jsonb('raw_payload').notNull(),
  // Processing status
  processed: boolean('processed').notNull().default(false),
  processedAt: timestamp('processed_at', { withTimezone: true }),
  errorMessage: text('error_message'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// ── Shipment Events ───────────────────────────────────
//
// Individual tracking events normalized to DCSA format. Each event is a
// discrete occurrence in a shipment's lifecycle. Events are linked to a
// shipment (by shipment_id or container_number), normalized from Terminal49
// or entered manually.

export const shipmentEvents = pgTable(
  'shipment_events',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    shipmentId: uuid('shipment_id').references(() => shipments.id, { onDelete: 'cascade' }),
    // Container identifier (e.g. MSCU1234567) — the primary key in Terminal49
    containerNumber: varchar('container_number', { length: 20 }).notNull(),
    // DCSA event type
    eventType: dcsaEventTypeEnum('event_type').notNull(),
    // Source of the event
    source: dcsaEventSourceEnum('source').notNull().default('terminal49'),
    // Source event ID for dedup
    sourceEventId: varchar('source_event_id', { length: 100 }),
    // Timestamp when the event occurred (carrier-reported)
    eventTime: timestamp('event_time', { withTimezone: true }),
    // Location (port code or free-text)
    location: varchar('location', { length: 300 }),
    locationCode: varchar('location_code', { length: 10 }),
    // ETA at time of this event (for tracking changes)
    etaAtEvent: timestamp('eta_at_event', { withTimezone: true }),
    // Event-specific metadata (vessel name, voyage, facility, etc.)
    metadata: jsonb('metadata'),
    // Human-readable description
    description: text('description'),
    // Link to raw webhook that produced this event
    webhookId: uuid('webhook_id').references(() => terminal49Webhooks.id, { onDelete: 'set null' }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    // Prevent duplicate events from the same source
    sourceEventIdx: uniqueIndex('shipment_events_source_event_idx').on(table.sourceEventId),
    // Index by container for fast lookups
    containerIdx: uniqueIndex('shipment_events_container_idx').on(table.containerNumber, table.eventTime),
  }),
);

// ── ETA Change Alerts ─────────────────────────────────
//
// Detected ETA changes calculated from shipment_events. Each row records a
// meaningful ETA deviation that may trigger push/email notifications.

export const etaChangeAlerts = pgTable('eta_change_alerts', {
  id: uuid('id').defaultRandom().primaryKey(),
  shipmentId: uuid('shipment_id')
    .notNull()
    .references(() => shipments.id, { onDelete: 'cascade' }),
  containerNumber: varchar('container_number', { length: 20 }).notNull(),
  previousEta: timestamp('previous_eta', { withTimezone: true }),
  newEta: timestamp('new_eta', { withTimezone: true }),
  // Delay in hours (positive = delayed, negative = early)
  delayHours: integer('delay_hours'),
  eventId: uuid('event_id').references(() => shipmentEvents.id, { onDelete: 'set null' }),
  acknowledged: boolean('acknowledged').notNull().default(false),
  acknowledgedAt: timestamp('acknowledged_at', { withTimezone: true }),
  notified: boolean('notified').notNull().default(false),
  notifiedAt: timestamp('notified_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// ── Tracking Type Exports ─────────────────────────────

export type Terminal49Webhook = typeof terminal49Webhooks.$inferSelect;
export type NewTerminal49Webhook = typeof terminal49Webhooks.$inferInsert;
export type ShipmentEvent = typeof shipmentEvents.$inferSelect;
export type NewShipmentEvent = typeof shipmentEvents.$inferInsert;
export type EtaChangeAlert = typeof etaChangeAlerts.$inferSelect;
export type NewEtaChangeAlert = typeof etaChangeAlerts.$inferInsert;
export type DcsaEventType = (typeof dcsaEventTypeEnum.enumValues)[number];
export type DcsaEventSource = (typeof dcsaEventSourceEnum.enumValues)[number];

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
  index,
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

// ── Incoterms & Trade Role (AI-8869) ──────────────────
//
// Incoterms 2020. The rules table that decides which party owns which cost
// segment lives in src/lib/incoterms — this enum only pins the vocabulary so
// a typo can't reach the database.

export const incotermEnum = pgEnum('incoterm', [
  'EXW',
  'FCA',
  'FAS',
  'FOB',
  'CFR',
  'CIF',
  'CPT',
  'CIP',
  'DAP',
  'DPU',
  'DDP',
]);

/** Which side of the sale the org is on for a given shipment. */
export const tradeRoleEnum = pgEnum('trade_role', ['buyer', 'seller']);

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
  // AI-8869 — Incoterm on the contract of sale, plus which side of that sale
  // we are. Together these decide which landed-cost segments actually hit the
  // customer's P&L (see src/lib/incoterms). Nullable because the vast majority
  // of historical rows were imported before we asked for it.
  incoterm: incotermEnum('incoterm'),
  incotermPlace: varchar('incoterm_place', { length: 200 }),
  tradeRole: tradeRoleEnum('trade_role').notNull().default('buyer'),
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

// ── Trade Documents (multi-document OCR) ──────────────
//
// AI-12016 — extends BOL-only OCR to the full export document set. Kept as a
// separate table from bol_documents rather than a type column on it, because
// these rows carry a validation verdict and a compliance issue list that a
// BOL row has no concept of, and because bol_documents is already joined
// one-to-many against shipments.

export const tradeDocumentTypeEnum = pgEnum('trade_document_type', [
  'bill_of_lading',
  'commercial_invoice',
  'packing_list',
  'isf',
  'certificate_of_origin',
  'phytosanitary_certificate',
  'fda_prior_notice',
]);

export const tradeDocuments = pgTable('trade_documents', {
  id: uuid('id').defaultRandom().primaryKey(),
  orgId: uuid('org_id').references(() => organizations.id, { onDelete: 'set null' }),
  shipmentId: uuid('shipment_id').references(() => shipments.id, { onDelete: 'set null' }),
  documentType: tradeDocumentTypeEnum('document_type').notNull(),
  /** How the type was decided: requested | model | text. */
  typeSource: varchar('type_source', { length: 20 }),
  blobUrl: text('blob_url'),
  fileName: varchar('file_name', { length: 500 }),
  fileType: varchar('file_type', { length: 100 }),
  fileSizeBytes: integer('file_size_bytes'),
  rawText: text('raw_text'),
  extractedJson: jsonb('extracted_json'),
  confidenceJson: jsonb('confidence_json'),
  /** Full DocumentValidation payload, so a past verdict stays auditable. */
  validationJson: jsonb('validation_json'),
  /** Denormalized from validationJson for cheap filtering of the problem queue. */
  isValid: boolean('is_valid'),
  blockerCount: integer('blocker_count').default(0).notNull(),
  warningCount: integer('warning_count').default(0).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  orgCreatedIdx: index('trade_documents_org_created_idx').on(table.orgId, table.createdAt),
  shipmentIdx: index('trade_documents_shipment_idx').on(table.shipmentId),
}));

export const tradeDocumentsRelations = relations(tradeDocuments, ({ one }) => ({
  organization: one(organizations, {
    fields: [tradeDocuments.orgId],
    references: [organizations.id],
  }),
  shipment: one(shipments, {
    fields: [tradeDocuments.shipmentId],
    references: [shipments.id],
  }),
}));

export type TradeDocumentRow = typeof tradeDocuments.$inferSelect;
export type NewTradeDocument = typeof tradeDocuments.$inferInsert;


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

// ── Cookie Consent (AI-8780) ──────────────────────────
//
// GDPR/ePrivacy require that consent be demonstrable: a regulator asks "prove
// this visitor agreed to analytics on this date". The banner keeps a client-side
// copy for UX, but the audit record lives here. Rows are written for anonymous
// visitors too (userId/orgId null), keyed by an opaque `visitorId` the browser
// stores alongside the `cookie_consent` cookie, so a pre-signup consent can be
// produced on request.
//
// This table is deliberately NOT purged on account deletion — an erasure request
// does not erase the proof that consent was given, and the row carries no
// content beyond the choice itself. It is covered by the audit retention policy
// described on /security.

export const consentChoiceEnum = pgEnum('consent_choice', ['all', 'essential']);

export const cookieConsents = pgTable('cookie_consents', {
  id: uuid('id').defaultRandom().primaryKey(),
  visitorId: varchar('visitor_id', { length: 64 }).notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  orgId: uuid('org_id').references(() => organizations.id, { onDelete: 'set null' }),
  choice: consentChoiceEnum('choice').notNull(),
  // Consent text version the visitor actually saw — if the banner copy changes,
  // bump CONSENT_POLICY_VERSION so old consents are distinguishable from new ones.
  policyVersion: varchar('policy_version', { length: 32 }).notNull(),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export type CookieConsent = typeof cookieConsents.$inferSelect;
export type ConsentChoice = (typeof consentChoiceEnum.enumValues)[number];

// ── Inventory: container line items (AI-8869) ─────────
//
// Blake's ask: "by taking into account the container contents, we can track
// those". A shipment is the box; these are what is inside it. One row per
// SKU per shipment, which is the grain a customs entry, a PO and a sale all
// agree on.
//
// Duty status is tracked per line rather than per shipment because an FTZ
// admission can split a container — some pallets go privileged foreign, some
// stay non-privileged, some clear straight into commerce. That split is
// exactly what the PF/NPF calculator already models, so inventory has to be
// able to represent it or the two features disagree.

export const dutyStatusEnum = pgEnum('duty_status', [
  'in_transit',
  'ftz_pf',
  'ftz_npf',
  'bonded',
  'customs_cleared',
  'delivered',
  'consumed',
]);

export const lineItems = pgTable(
  'line_items',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    orgId: uuid('org_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    shipmentId: uuid('shipment_id').references(() => shipments.id, { onDelete: 'cascade' }),
    // Which container inside the shipment this line rode in. Free text because
    // CSV imports carry the carrier's container number, not our own id.
    containerNumber: varchar('container_number', { length: 20 }),
    sku: varchar('sku', { length: 100 }),
    description: text('description'),
    htsCode: varchar('hts_code', { length: 20 }),
    countryOfOrigin: varchar('country_of_origin', { length: 2 }),
    quantity: numeric('quantity', { precision: 14, scale: 3 }).notNull().default('0'),
    unitOfMeasure: varchar('unit_of_measure', { length: 20 }).default('EA'),
    unitCostUsd: numeric('unit_cost_usd', { precision: 14, scale: 4 }).notNull().default('0'),
    supplier: varchar('supplier', { length: 300 }),
    poRef: varchar('po_ref', { length: 100 }),
    dutyStatus: dutyStatusEnum('duty_status').notNull().default('in_transit'),
    // Where the goods physically are: FTZ number, DC code, warehouse name.
    locationCode: varchar('location_code', { length: 100 }),
    locationName: varchar('location_name', { length: 200 }),
    // Share of the shipment's non-goods landed cost carried by this line,
    // allocated by goods value (see allocateShipmentCost). Cached here so the
    // analytics rollups don't have to re-derive it on every read.
    allocatedLandedCostUsd: numeric('allocated_landed_cost_usd', { precision: 14, scale: 2 }),
    allocatedOverheadUsd: numeric('allocated_overhead_usd', { precision: 14, scale: 2 }),
    // Anything the customer's ERP export carried that we have no column for.
    importMeta: jsonb('import_meta'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    orgIdx: index('line_items_org_idx').on(table.orgId, table.createdAt),
    shipmentIdx: index('line_items_shipment_idx').on(table.shipmentId),
    // Powers the /platform/inventory "on hand by location and duty status" view.
    locationIdx: index('line_items_location_idx').on(table.orgId, table.locationCode, table.dutyStatus),
    skuIdx: index('line_items_sku_idx').on(table.orgId, table.sku),
  })
);

// ── Revenue: sale records (AI-8869) ───────────────────
//
// The other half of "track their financial progress and profitability". A
// sale is recorded against a line item, not a shipment, because the same SKU
// on two containers can sell at two prices — and the whole point is being
// able to see that.
//
// Partial sales are the normal case: a line of 5,000 units sells across a
// dozen rows over six months. COGS is charged per unit sold, never per unit
// imported (see computeLineMargins).

export const saleRecords = pgTable(
  'sale_records',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    orgId: uuid('org_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    lineItemId: uuid('line_item_id')
      .notNull()
      .references(() => lineItems.id, { onDelete: 'cascade' }),
    // Denormalized for cheap shipment-scoped rollups without a second join.
    shipmentId: uuid('shipment_id').references(() => shipments.id, { onDelete: 'set null' }),
    saleDate: timestamp('sale_date', { withTimezone: true }).notNull().defaultNow(),
    quantitySold: numeric('quantity_sold', { precision: 14, scale: 3 }).notNull(),
    unitSalePriceUsd: numeric('unit_sale_price_usd', { precision: 14, scale: 4 }).notNull(),
    customer: varchar('customer', { length: 300 }),
    channel: varchar('channel', { length: 100 }),
    invoiceRef: varchar('invoice_ref', { length: 100 }),
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    orgIdx: index('sale_records_org_idx').on(table.orgId, table.saleDate),
    lineItemIdx: index('sale_records_line_item_idx').on(table.lineItemId),
    shipmentIdx: index('sale_records_shipment_idx').on(table.shipmentId),
  })
);

export const lineItemsRelations = relations(lineItems, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [lineItems.orgId],
    references: [organizations.id],
  }),
  shipment: one(shipments, {
    fields: [lineItems.shipmentId],
    references: [shipments.id],
  }),
  sales: many(saleRecords),
}));

export const saleRecordsRelations = relations(saleRecords, ({ one }) => ({
  organization: one(organizations, {
    fields: [saleRecords.orgId],
    references: [organizations.id],
  }),
  lineItem: one(lineItems, {
    fields: [saleRecords.lineItemId],
    references: [lineItems.id],
  }),
  shipment: one(shipments, {
    fields: [saleRecords.shipmentId],
    references: [shipments.id],
  }),
}));

export type LineItem = typeof lineItems.$inferSelect;
export type NewLineItem = typeof lineItems.$inferInsert;
export type SaleRecord = typeof saleRecords.$inferSelect;
export type NewSaleRecord = typeof saleRecords.$inferInsert;
export type DutyStatus = (typeof dutyStatusEnum.enumValues)[number];
export type IncotermValue = (typeof incotermEnum.enumValues)[number];
export type TradeRoleValue = (typeof tradeRoleEnum.enumValues)[number];

// ── Notification centre (AI-12013) ────────────────────
//
// In-app bell + email digests + per-user alert rules, layered on the Expo
// push rail already shipped (see src/lib/alerts/expo-push.ts).
//
// A notification is org-scoped and optionally user-scoped. `userId = null`
// means "everyone in the org" — the cutoff cron doesn't know which human
// cares about a container, only which org booked it. The read state for an
// org-wide notification is per-user, which is why reads live in their own
// table rather than a boolean column.

export const notificationTypeEnum = pgEnum('notification_type', [
  'shipment',
  'cutoff',
  'demurrage',
  'customs',
  'cost',
  'margin',
  'partner',
  'system',
]);

export const notificationSeverityEnum = pgEnum('notification_severity', [
  'critical',
  'warning',
  'info',
]);

/** How often a user wants non-critical notifications collected into an email. */
export const digestFrequencyEnum = pgEnum('digest_frequency', [
  'off',
  'immediate',
  'daily',
  'weekly',
]);

export const notifications = pgTable(
  'notifications',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    orgId: uuid('org_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    /** null = fan out to every member of the org. */
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
    type: notificationTypeEnum('type').notNull().default('system'),
    severity: notificationSeverityEnum('severity').notNull().default('info'),
    title: varchar('title', { length: 300 }).notNull(),
    message: text('message').notNull(),
    actionLabel: varchar('action_label', { length: 100 }),
    actionUrl: varchar('action_url', { length: 500 }),
    /**
     * Idempotency key, unique per org. Producers derive it from the thing
     * being alerted about (`cutoff:<shipmentId>:reefer`), so an hourly cron
     * that re-scans the same shipment inserts once and no-ops thereafter.
     * Without this, every producer needs its own dedupe state — which is
     * exactly the `importMeta.cutoffAlertsSent` hack this replaces.
     */
    dedupeKey: varchar('dedupe_key', { length: 200 }),
    /** What produced this, for debugging and for deep links. */
    sourceTable: varchar('source_table', { length: 50 }),
    sourceId: uuid('source_id'),
    /** Set once this notification has been included in a digest email. */
    emailedAt: timestamp('emailed_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    orgIdx: index('notifications_org_idx').on(table.orgId, table.createdAt),
    userIdx: index('notifications_user_idx').on(table.userId, table.createdAt),
    // Partial-free unique: rows with a null dedupeKey are always distinct in
    // Postgres, so ad-hoc notifications don't collide with each other.
    dedupeIdx: uniqueIndex('notifications_dedupe_idx').on(table.orgId, table.dedupeKey),
    // Digest scan: "unemailed notifications for this org since X".
    emailedIdx: index('notifications_emailed_idx').on(table.orgId, table.emailedAt),
  })
);

/**
 * Per-user read state. Separate from `notifications` because one org-wide
 * notification is read by each member independently — a boolean on the
 * notification row would let one member's click mark it read for everyone.
 */
export const notificationReads = pgTable(
  'notification_reads',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    notificationId: uuid('notification_id')
      .notNull()
      .references(() => notifications.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    readAt: timestamp('read_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    uniqueRead: uniqueIndex('notification_reads_unique_idx').on(
      table.notificationId,
      table.userId
    ),
    userIdx: index('notification_reads_user_idx').on(table.userId),
  })
);

/**
 * Per-user, per-org alert rules. A user in two orgs can want everything from
 * their own book of business and only critical alerts from the other.
 *
 * Absence of a row means defaults (see DEFAULT_PREFERENCES in
 * src/lib/notifications/preferences.ts) — we do not backfill a row per user,
 * so the defaults live in one place and can change without a migration.
 */
export const notificationPreferences = pgTable(
  'notification_preferences',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    orgId: uuid('org_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    /** Types the user wants at all. Empty array = none. */
    mutedTypes: jsonb('muted_types').$type<string[]>().notNull().default([]),
    /** Drop anything below this severity. */
    minSeverity: notificationSeverityEnum('min_severity').notNull().default('info'),
    inAppEnabled: boolean('in_app_enabled').notNull().default(true),
    pushEnabled: boolean('push_enabled').notNull().default(true),
    emailDigest: digestFrequencyEnum('email_digest').notNull().default('daily'),
    /**
     * Local-time hour bounds during which non-critical email/push is held.
     * Critical always goes out — a customs hold at 2am is still a 2am problem.
     */
    quietHoursStart: integer('quiet_hours_start'),
    quietHoursEnd: integer('quiet_hours_end'),
    /** IANA zone the quiet hours are interpreted in. */
    timezone: varchar('timezone', { length: 64 }).notNull().default('America/Los_Angeles'),
    digestLastSentAt: timestamp('digest_last_sent_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    uniquePref: uniqueIndex('notification_preferences_user_org_idx').on(
      table.userId,
      table.orgId
    ),
  })
);

export const notificationsRelations = relations(notifications, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [notifications.orgId],
    references: [organizations.id],
  }),
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
  reads: many(notificationReads),
}));

export const notificationReadsRelations = relations(notificationReads, ({ one }) => ({
  notification: one(notifications, {
    fields: [notificationReads.notificationId],
    references: [notifications.id],
  }),
  user: one(users, {
    fields: [notificationReads.userId],
    references: [users.id],
  }),
}));

export const notificationPreferencesRelations = relations(
  notificationPreferences,
  ({ one }) => ({
    user: one(users, {
      fields: [notificationPreferences.userId],
      references: [users.id],
    }),
    organization: one(organizations, {
      fields: [notificationPreferences.orgId],
      references: [organizations.id],
    }),
  })
);

export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;
export type NotificationRead = typeof notificationReads.$inferSelect;
export type NotificationPreference = typeof notificationPreferences.$inferSelect;
export type NewNotificationPreference = typeof notificationPreferences.$inferInsert;
export type NotificationType = (typeof notificationTypeEnum.enumValues)[number];
export type NotificationSeverity = (typeof notificationSeverityEnum.enumValues)[number];
export type DigestFrequency = (typeof digestFrequencyEnum.enumValues)[number];

// ── Customs broker handoff packages (AI-12018) ─────────
//
// One row per package handed to a customs broker: the exact document set, the
// manifest the cover sheet was rendered from, and a share link that expires.
//
// The manifest is stored in full rather than re-derived on read. A broker may
// come back to a package months later, by which time the underlying documents
// may have been re-uploaded or corrected — and the question they are asking is
// "what did you send me", not "what do you have now".

export const brokerHandoffs = pgTable('broker_handoffs', {
  id: uuid('id').defaultRandom().primaryKey(),
  orgId: uuid('org_id').references(() => organizations.id, { onDelete: 'set null' }),
  shipmentId: uuid('shipment_id').references(() => shipments.id, { onDelete: 'set null' }),
  createdByUserId: uuid('created_by_user_id').references(() => users.id, { onDelete: 'set null' }),
  /** Shipment reference shown on the cover sheet, when the user supplied one. */
  reference: varchar('reference', { length: 200 }),
  brokerName: varchar('broker_name', { length: 300 }),
  brokerEmail: varchar('broker_email', { length: 320 }),
  /** SHA-256 hex of the share token. The token itself is never stored. */
  tokenHash: varchar('token_hash', { length: 64 }).notNull(),
  /** First few characters of the token, so the UI can distinguish links. Not a secret. */
  tokenPrefix: varchar('token_prefix', { length: 16 }).notNull(),
  /** trade_documents ids packaged, in cover-sheet order. */
  documentIds: jsonb('document_ids').notNull(),
  /** Full HandoffManifest — the source of truth for what was sent. */
  manifestJson: jsonb('manifest_json').notNull(),
  reconciliationJson: jsonb('reconciliation_json'),
  clearedToFile: boolean('cleared_to_file').default(false).notNull(),
  releasedWithBlockers: boolean('released_with_blockers').default(false).notNull(),
  blockerCount: integer('blocker_count').default(0).notNull(),
  warningCount: integer('warning_count').default(0).notNull(),
  /** Server-side only. Blob storage is public-read, so this URL is never returned to a client. */
  zipBlobUrl: text('zip_blob_url'),
  zipFileName: varchar('zip_file_name', { length: 300 }),
  zipSizeBytes: integer('zip_size_bytes'),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  revokedAt: timestamp('revoked_at', { withTimezone: true }),
  downloadCount: integer('download_count').default(0).notNull(),
  firstAccessedAt: timestamp('first_accessed_at', { withTimezone: true }),
  lastAccessedAt: timestamp('last_accessed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  tokenHashIdx: uniqueIndex('broker_handoffs_token_hash_idx').on(table.tokenHash),
  orgCreatedIdx: index('broker_handoffs_org_created_idx').on(table.orgId, table.createdAt),
  shipmentIdx: index('broker_handoffs_shipment_idx').on(table.shipmentId),
}));

// Every hit on a share link, including the denied ones. "Did the broker ever
// open it" and "was the dead link still being tried after we revoked it" are
// both questions someone asks after a shipment goes wrong.
export const brokerHandoffAccess = pgTable('broker_handoff_access', {
  id: uuid('id').defaultRandom().primaryKey(),
  handoffId: uuid('handoff_id')
    .references(() => brokerHandoffs.id, { onDelete: 'cascade' })
    .notNull(),
  /** view | download | denied */
  action: varchar('action', { length: 20 }).notNull(),
  /** Set on denied: expired | revoked. */
  reason: varchar('reason', { length: 40 }),
  ipAddress: varchar('ip_address', { length: 64 }),
  userAgent: varchar('user_agent', { length: 500 }),
  accessedAt: timestamp('accessed_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  handoffIdx: index('broker_handoff_access_handoff_idx').on(table.handoffId, table.accessedAt),
}));

export const brokerHandoffsRelations = relations(brokerHandoffs, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [brokerHandoffs.orgId],
    references: [organizations.id],
  }),
  shipment: one(shipments, {
    fields: [brokerHandoffs.shipmentId],
    references: [shipments.id],
  }),
  createdBy: one(users, {
    fields: [brokerHandoffs.createdByUserId],
    references: [users.id],
  }),
  access: many(brokerHandoffAccess),
}));

export const brokerHandoffAccessRelations = relations(brokerHandoffAccess, ({ one }) => ({
  handoff: one(brokerHandoffs, {
    fields: [brokerHandoffAccess.handoffId],
    references: [brokerHandoffs.id],
  }),
}));

export type BrokerHandoff = typeof brokerHandoffs.$inferSelect;
export type NewBrokerHandoff = typeof brokerHandoffs.$inferInsert;
export type BrokerHandoffAccess = typeof brokerHandoffAccess.$inferSelect;
export type NewBrokerHandoffAccess = typeof brokerHandoffAccess.$inferInsert;

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
    containerIdx: index('shipment_events_container_idx').on(table.containerNumber, table.eventTime),
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

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

// ── Organizations ──────────────────────────────────────

export const organizations = pgTable('organizations', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  plan: varchar('plan', { length: 50 }).notNull().default('free'),
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

export type Contract = typeof contracts.$inferSelect;
export type NewContract = typeof contracts.$inferInsert;

export type ContractLane = typeof contractLanes.$inferSelect;
export type NewContractLane = typeof contractLanes.$inferInsert;

// Enum type helpers
export type OrgRole = (typeof orgRoleEnum.enumValues)[number];
export type CalculationType = (typeof calculatorTypeEnum.enumValues)[number];
export type AuditAction = (typeof auditActionEnum.enumValues)[number];
export type ContractType = (typeof contractTypeEnum.enumValues)[number];
export type Plan = 'free' | 'pro' | 'enterprise';

// ── Shipment Enums ────────────────────────────────────

export const shipmentStatusEnum = pgEnum('shipment_status', [
  'in_transit',
  'arrived',
  'delayed',
  'pending',
]);

export const shipmentSourceEnum = pgEnum('shipment_source', [
  'manual',
  'bol_ocr',
]);

// ── Shipments ─────────────────────────────────────────

export const shipments = pgTable('shipments', {
  id: uuid('id').defaultRandom().primaryKey(),
  orgId: uuid('org_id').references(() => organizations.id, { onDelete: 'set null' }),
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

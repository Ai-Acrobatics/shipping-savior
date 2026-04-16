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

export const documentTypeEnum = pgEnum('document_type', [
  'bill_of_lading',
  'commercial_invoice',
  'packing_list',
  'customs_declaration',
  'certificate_of_origin',
  'isf_filing',
  'arrival_notice',
  'other',
]);

export const extractionStatusEnum = pgEnum('extraction_status', [
  'pending',
  'processing',
  'completed',
  'failed',
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

// ── Document Extractions ──────────────────────────────

export const documentExtractions = pgTable('document_extractions', {
  id: uuid('id').defaultRandom().primaryKey(),
  orgId: uuid('org_id')
    .notNull()
    .references(() => organizations.id, { onDelete: 'cascade' }),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  fileName: varchar('file_name', { length: 500 }).notNull(),
  fileSize: integer('file_size').notNull(),
  documentType: documentTypeEnum('document_type').notNull().default('other'),
  status: extractionStatusEnum('status').notNull().default('pending'),
  extractedData: jsonb('extracted_data'),
  rawText: text('raw_text'),
  confidence: integer('confidence'),
  errorMessage: text('error_message'),
  reviewed: boolean('reviewed').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// ── Relations ──────────────────────────────────────────

export const organizationsRelations = relations(organizations, ({ many }) => ({
  members: many(orgMembers),
  calculations: many(calculations),
  auditLogs: many(auditLogs),
  invites: many(invites),
  documentExtractions: many(documentExtractions),
}));

export const usersRelations = relations(users, ({ many }) => ({
  memberships: many(orgMembers),
  calculations: many(calculations),
  auditLogs: many(auditLogs),
  invitesSent: many(invites),
  documentExtractions: many(documentExtractions),
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

export const documentExtractionsRelations = relations(documentExtractions, ({ one }) => ({
  organization: one(organizations, {
    fields: [documentExtractions.orgId],
    references: [organizations.id],
  }),
  user: one(users, {
    fields: [documentExtractions.userId],
    references: [users.id],
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

export type DocumentExtraction = typeof documentExtractions.$inferSelect;
export type NewDocumentExtraction = typeof documentExtractions.$inferInsert;

// Enum type helpers
export type OrgRole = (typeof orgRoleEnum.enumValues)[number];
export type CalculationType = (typeof calculatorTypeEnum.enumValues)[number];
export type AuditAction = (typeof auditActionEnum.enumValues)[number];
export type DocumentType = (typeof documentTypeEnum.enumValues)[number];
export type ExtractionStatus = (typeof extractionStatusEnum.enumValues)[number];
export type Plan = 'free' | 'pro' | 'enterprise';

-- AI-12013 — Notification centre (in-app bell + email digests + alert rules)
--
-- Adds:
--   * notification_type / notification_severity / digest_frequency enums
--   * notifications             — org-scoped, optionally user-scoped, with a
--                                 per-org unique dedupe_key for idempotent
--                                 producers (hourly crons re-scan safely)
--   * notification_reads        — per-user read state; an org-wide
--                                 notification is read by each member
--                                 independently, so this cannot be a boolean
--                                 column on notifications
--   * notification_preferences  — per (user, org) alert rules
--
-- Hand-written with DO $$ guards rather than drizzle-kit generated: prod runs
-- the migrator as a role that cannot re-create an existing type, and
-- CREATE TYPE ... IF NOT EXISTS does not exist in Postgres. See
-- docs/DB-MIGRATION-RUNBOOK.md.

DO $$ BEGIN
	CREATE TYPE "public"."notification_type" AS ENUM('shipment', 'cutoff', 'demurrage', 'customs', 'cost', 'margin', 'partner', 'system');
EXCEPTION
	WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint

DO $$ BEGIN
	CREATE TYPE "public"."notification_severity" AS ENUM('critical', 'warning', 'info');
EXCEPTION
	WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint

DO $$ BEGIN
	CREATE TYPE "public"."digest_frequency" AS ENUM('off', 'immediate', 'daily', 'weekly');
EXCEPTION
	WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"user_id" uuid,
	"type" "notification_type" DEFAULT 'system' NOT NULL,
	"severity" "notification_severity" DEFAULT 'info' NOT NULL,
	"title" varchar(300) NOT NULL,
	"message" text NOT NULL,
	"action_label" varchar(100),
	"action_url" varchar(500),
	"dedupe_key" varchar(200),
	"source_table" varchar(50),
	"source_id" uuid,
	"emailed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "notification_reads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"notification_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"read_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "notification_preferences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"org_id" uuid NOT NULL,
	"muted_types" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"min_severity" "notification_severity" DEFAULT 'info' NOT NULL,
	"in_app_enabled" boolean DEFAULT true NOT NULL,
	"push_enabled" boolean DEFAULT true NOT NULL,
	"email_digest" "digest_frequency" DEFAULT 'daily' NOT NULL,
	"quiet_hours_start" integer,
	"quiet_hours_end" integer,
	"timezone" varchar(64) DEFAULT 'America/Los_Angeles' NOT NULL,
	"digest_last_sent_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint

DO $$ BEGIN
	ALTER TABLE "notifications" ADD CONSTRAINT "notifications_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
	WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint

DO $$ BEGIN
	ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
	WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint

DO $$ BEGIN
	ALTER TABLE "notification_reads" ADD CONSTRAINT "notification_reads_notification_id_notifications_id_fk" FOREIGN KEY ("notification_id") REFERENCES "public"."notifications"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
	WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint

DO $$ BEGIN
	ALTER TABLE "notification_reads" ADD CONSTRAINT "notification_reads_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
	WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint

DO $$ BEGIN
	ALTER TABLE "notification_preferences" ADD CONSTRAINT "notification_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
	WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint

DO $$ BEGIN
	ALTER TABLE "notification_preferences" ADD CONSTRAINT "notification_preferences_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
	WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint

CREATE INDEX IF NOT EXISTS "notifications_org_idx" ON "notifications" USING btree ("org_id","created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "notifications_user_idx" ON "notifications" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "notifications_emailed_idx" ON "notifications" USING btree ("org_id","emailed_at");--> statement-breakpoint
-- Producer idempotency. Rows with a NULL dedupe_key never collide (Postgres
-- treats NULLs as distinct), so ad-hoc notifications are unaffected.
CREATE UNIQUE INDEX IF NOT EXISTS "notifications_dedupe_idx" ON "notifications" USING btree ("org_id","dedupe_key");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "notification_reads_unique_idx" ON "notification_reads" USING btree ("notification_id","user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "notification_reads_user_idx" ON "notification_reads" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "notification_preferences_user_org_idx" ON "notification_preferences" USING btree ("user_id","org_id");

-- AI-12018 — Customs broker handoff package
--
-- Adds:
--   * broker_handoffs       — one row per package handed to a customs broker,
--                             carrying the exact document set, the manifest the
--                             cover sheet was rendered from, and a time-limited
--                             share link
--   * broker_handoff_access — every hit on a share link, including the denied
--                             ones (expired / revoked)
--
-- The manifest is stored in full rather than re-derived on read: a broker may
-- open a package months later, by which point the underlying documents may
-- have been corrected, and the question being asked is "what did you send me".
--
-- token_hash is SHA-256 hex of the share token and carries a UNIQUE index so
-- the public download route is a single indexed lookup rather than a scan over
-- outstanding tokens. The token itself is never stored.
--
-- Hand-written with DO $$ guards rather than drizzle-kit generated: prod runs
-- the migrator as a role that cannot re-create existing objects. See
-- docs/DB-MIGRATION-RUNBOOK.md.

CREATE TABLE IF NOT EXISTS "broker_handoffs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid,
	"shipment_id" uuid,
	"created_by_user_id" uuid,
	"reference" varchar(200),
	"broker_name" varchar(300),
	"broker_email" varchar(320),
	"token_hash" varchar(64) NOT NULL,
	"token_prefix" varchar(16) NOT NULL,
	"document_ids" jsonb NOT NULL,
	"manifest_json" jsonb NOT NULL,
	"reconciliation_json" jsonb,
	"cleared_to_file" boolean DEFAULT false NOT NULL,
	"released_with_blockers" boolean DEFAULT false NOT NULL,
	"blocker_count" integer DEFAULT 0 NOT NULL,
	"warning_count" integer DEFAULT 0 NOT NULL,
	"zip_blob_url" text,
	"zip_file_name" varchar(300),
	"zip_size_bytes" integer,
	"expires_at" timestamp with time zone NOT NULL,
	"revoked_at" timestamp with time zone,
	"download_count" integer DEFAULT 0 NOT NULL,
	"first_accessed_at" timestamp with time zone,
	"last_accessed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "broker_handoff_access" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"handoff_id" uuid NOT NULL,
	"action" varchar(20) NOT NULL,
	"reason" varchar(40),
	"ip_address" varchar(64),
	"user_agent" varchar(500),
	"accessed_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint

DO $$ BEGIN
	ALTER TABLE "broker_handoffs" ADD CONSTRAINT "broker_handoffs_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
	WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint

DO $$ BEGIN
	ALTER TABLE "broker_handoffs" ADD CONSTRAINT "broker_handoffs_shipment_id_shipments_id_fk" FOREIGN KEY ("shipment_id") REFERENCES "public"."shipments"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
	WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint

DO $$ BEGIN
	ALTER TABLE "broker_handoffs" ADD CONSTRAINT "broker_handoffs_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
	WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint

DO $$ BEGIN
	ALTER TABLE "broker_handoff_access" ADD CONSTRAINT "broker_handoff_access_handoff_id_broker_handoffs_id_fk" FOREIGN KEY ("handoff_id") REFERENCES "public"."broker_handoffs"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
	WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint

CREATE UNIQUE INDEX IF NOT EXISTS "broker_handoffs_token_hash_idx" ON "broker_handoffs" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "broker_handoffs_org_created_idx" ON "broker_handoffs" USING btree ("org_id","created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "broker_handoffs_shipment_idx" ON "broker_handoffs" USING btree ("shipment_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "broker_handoff_access_handoff_idx" ON "broker_handoff_access" USING btree ("handoff_id","accessed_at");

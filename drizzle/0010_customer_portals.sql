-- AI-12022 — NVOCC white-label customer portal
--
-- One share link per (org, customer code). Read-only, no login: the token is
-- the whole credential, so it is 32 bytes of CSPRNG and carries a unique
-- index. Revocation is `enabled = false`, not a delete, so a link can be shut
-- off without losing the view history that shows the customer was using it.
--
-- Hand-written with DO $$ guards rather than drizzle-kit generated: prod runs
-- the migrator as a role that cannot re-create existing objects. See
-- docs/DB-MIGRATION-RUNBOOK.md.

CREATE TABLE IF NOT EXISTS "customer_portals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"customer_code" varchar(50) NOT NULL,
	"label" varchar(200) NOT NULL,
	"token" varchar(64) NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"created_by" uuid,
	"last_viewed_at" timestamp with time zone,
	"view_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "customer_portals_token_unique" UNIQUE("token")
);--> statement-breakpoint

DO $$ BEGIN
	ALTER TABLE "customer_portals" ADD CONSTRAINT "customer_portals_org_id_organizations_id_fk"
		FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
	WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint

DO $$ BEGIN
	ALTER TABLE "customer_portals" ADD CONSTRAINT "customer_portals_created_by_users_id_fk"
		FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
	WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint

-- One portal per customer code per org: two live links to the same customer
-- would mean revoking one and still leaking through the other.
CREATE UNIQUE INDEX IF NOT EXISTS "customer_portals_org_customer_idx"
	ON "customer_portals" ("org_id","customer_code");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "customer_portals_org_idx"
	ON "customer_portals" ("org_id");

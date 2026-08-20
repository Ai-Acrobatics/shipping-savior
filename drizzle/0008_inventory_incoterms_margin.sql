-- AI-8869 — Inventory + Incoterms + supply-chain cost tracking
--
-- Adds:
--   * incoterm / trade_role vocabulary and the two shipment columns that use it
--   * line_items   — container contents at SKU grain, with FTZ duty status
--   * sale_records — revenue side, so realized margin can be computed
--
-- Written by hand rather than `drizzle-kit generate` so the DO $$ guards are
-- present: production runs the migrator against a role that cannot re-create
-- an existing type, and `CREATE TYPE ... IF NOT EXISTS` does not exist in
-- Postgres. See docs/DB-MIGRATION-RUNBOOK.md.

DO $$ BEGIN
	CREATE TYPE "public"."incoterm" AS ENUM('EXW', 'FCA', 'FAS', 'FOB', 'CFR', 'CIF', 'CPT', 'CIP', 'DAP', 'DPU', 'DDP');
EXCEPTION
	WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint

DO $$ BEGIN
	CREATE TYPE "public"."trade_role" AS ENUM('buyer', 'seller');
EXCEPTION
	WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint

DO $$ BEGIN
	CREATE TYPE "public"."duty_status" AS ENUM('in_transit', 'ftz_pf', 'ftz_npf', 'bonded', 'customs_cleared', 'delivered', 'consumed');
EXCEPTION
	WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint

ALTER TABLE "shipments" ADD COLUMN IF NOT EXISTS "incoterm" "incoterm";--> statement-breakpoint
ALTER TABLE "shipments" ADD COLUMN IF NOT EXISTS "incoterm_place" varchar(200);--> statement-breakpoint
ALTER TABLE "shipments" ADD COLUMN IF NOT EXISTS "trade_role" "trade_role" DEFAULT 'buyer' NOT NULL;--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "line_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"shipment_id" uuid,
	"container_number" varchar(20),
	"sku" varchar(100),
	"description" text,
	"hts_code" varchar(20),
	"country_of_origin" varchar(2),
	"quantity" numeric(14, 3) DEFAULT '0' NOT NULL,
	"unit_of_measure" varchar(20) DEFAULT 'EA',
	"unit_cost_usd" numeric(14, 4) DEFAULT '0' NOT NULL,
	"supplier" varchar(300),
	"po_ref" varchar(100),
	"duty_status" "duty_status" DEFAULT 'in_transit' NOT NULL,
	"location_code" varchar(100),
	"location_name" varchar(200),
	"allocated_landed_cost_usd" numeric(14, 2),
	"allocated_overhead_usd" numeric(14, 2),
	"import_meta" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "sale_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"line_item_id" uuid NOT NULL,
	"shipment_id" uuid,
	"sale_date" timestamp with time zone DEFAULT now() NOT NULL,
	"quantity_sold" numeric(14, 3) NOT NULL,
	"unit_sale_price_usd" numeric(14, 4) NOT NULL,
	"customer" varchar(300),
	"channel" varchar(100),
	"invoice_ref" varchar(100),
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint

DO $$ BEGIN
	ALTER TABLE "line_items" ADD CONSTRAINT "line_items_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
	WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint

DO $$ BEGIN
	ALTER TABLE "line_items" ADD CONSTRAINT "line_items_shipment_id_shipments_id_fk" FOREIGN KEY ("shipment_id") REFERENCES "public"."shipments"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
	WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint

DO $$ BEGIN
	ALTER TABLE "sale_records" ADD CONSTRAINT "sale_records_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
	WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint

DO $$ BEGIN
	ALTER TABLE "sale_records" ADD CONSTRAINT "sale_records_line_item_id_line_items_id_fk" FOREIGN KEY ("line_item_id") REFERENCES "public"."line_items"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
	WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint

DO $$ BEGIN
	ALTER TABLE "sale_records" ADD CONSTRAINT "sale_records_shipment_id_shipments_id_fk" FOREIGN KEY ("shipment_id") REFERENCES "public"."shipments"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
	WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint

CREATE INDEX IF NOT EXISTS "line_items_org_idx" ON "line_items" USING btree ("org_id","created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "line_items_shipment_idx" ON "line_items" USING btree ("shipment_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "line_items_location_idx" ON "line_items" USING btree ("org_id","location_code","duty_status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "line_items_sku_idx" ON "line_items" USING btree ("org_id","sku");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sale_records_org_idx" ON "sale_records" USING btree ("org_id","sale_date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sale_records_line_item_idx" ON "sale_records" USING btree ("line_item_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sale_records_shipment_idx" ON "sale_records" USING btree ("shipment_id");

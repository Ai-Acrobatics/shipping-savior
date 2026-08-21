-- AI-12016 — Multi-document trade OCR
--
-- Adds:
--   * trade_document_type enum — the seven document types the OCR layer knows
--   * trade_documents        — one row per uploaded document, carrying the
--                              extraction, the per-field confidence and the
--                              validation verdict
--
-- Kept separate from bol_documents rather than adding a type column to it:
-- these rows carry a compliance verdict and issue list that a BOL row has no
-- concept of, and bol_documents is already joined one-to-many against
-- shipments for the container-promotion pipeline.
--
-- Hand-written with DO $$ guards rather than drizzle-kit generated: prod runs
-- the migrator as a role that cannot re-create an existing type, and
-- CREATE TYPE ... IF NOT EXISTS does not exist in Postgres. See
-- docs/DB-MIGRATION-RUNBOOK.md.

DO $$ BEGIN
	CREATE TYPE "public"."trade_document_type" AS ENUM('bill_of_lading', 'commercial_invoice', 'packing_list', 'isf', 'certificate_of_origin', 'phytosanitary_certificate', 'fda_prior_notice');
EXCEPTION
	WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "trade_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid,
	"shipment_id" uuid,
	"document_type" "trade_document_type" NOT NULL,
	"type_source" varchar(20),
	"blob_url" text,
	"file_name" varchar(500),
	"file_type" varchar(100),
	"file_size_bytes" integer,
	"raw_text" text,
	"extracted_json" jsonb,
	"confidence_json" jsonb,
	"validation_json" jsonb,
	"is_valid" boolean,
	"blocker_count" integer DEFAULT 0 NOT NULL,
	"warning_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint

DO $$ BEGIN
	ALTER TABLE "trade_documents" ADD CONSTRAINT "trade_documents_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
	WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint

DO $$ BEGIN
	ALTER TABLE "trade_documents" ADD CONSTRAINT "trade_documents_shipment_id_shipments_id_fk" FOREIGN KEY ("shipment_id") REFERENCES "public"."shipments"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
	WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint

CREATE INDEX IF NOT EXISTS "trade_documents_org_created_idx" ON "trade_documents" USING btree ("org_id","created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "trade_documents_shipment_idx" ON "trade_documents" USING btree ("shipment_id");

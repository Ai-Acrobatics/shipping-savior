-- AI-8191: Document extractions (AI OCR for PDF shipment data)
-- Creates enums and table for Claude-vision-powered document extraction pipeline.

DO $$ BEGIN
  CREATE TYPE "document_type" AS ENUM (
    'bill_of_lading',
    'commercial_invoice',
    'packing_list',
    'customs_declaration',
    'certificate_of_origin',
    'isf_filing',
    'arrival_notice',
    'other'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "extraction_status" AS ENUM (
    'pending',
    'processing',
    'completed',
    'failed'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "document_extractions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "org_id" uuid NOT NULL REFERENCES "organizations"("id") ON DELETE cascade,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE cascade,
  "file_name" varchar(500) NOT NULL,
  "file_size" integer NOT NULL,
  "document_type" "document_type" NOT NULL DEFAULT 'other',
  "status" "extraction_status" NOT NULL DEFAULT 'pending',
  "extracted_data" jsonb,
  "raw_text" text,
  "confidence" integer,
  "error_message" text,
  "reviewed" boolean NOT NULL DEFAULT false,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "doc_extractions_org_idx" ON "document_extractions" ("org_id", "created_at" DESC);
CREATE INDEX IF NOT EXISTS "doc_extractions_user_idx" ON "document_extractions" ("user_id", "created_at" DESC);
CREATE INDEX IF NOT EXISTS "doc_extractions_status_idx" ON "document_extractions" ("status");

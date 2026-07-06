ALTER TYPE "public"."shipment_source" ADD VALUE 'workbook_import';--> statement-breakpoint
ALTER TABLE "shipments" ADD COLUMN "import_meta" jsonb;
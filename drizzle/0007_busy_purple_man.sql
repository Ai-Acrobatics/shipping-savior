CREATE TYPE "public"."dcsa_event_source" AS ENUM('terminal49', 'manual', 'carrier_api');--> statement-breakpoint
CREATE TYPE "public"."dcsa_event_type" AS ENUM('ARRIVAL', 'DEPARTURE', 'LOAD', 'DISCHARGE', 'GATE_IN', 'GATE_OUT', 'CUSTOMS_HOLD', 'CUSTOMS_RELEASE', 'INSPECTION', 'PICKUP', 'DELIVERY', 'ESTIMATED_ARRIVAL', 'ESTIMATED_DEPARTURE', 'OTHER');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "eta_change_alerts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"shipment_id" uuid NOT NULL,
	"container_number" varchar(20) NOT NULL,
	"previous_eta" timestamp with time zone,
	"new_eta" timestamp with time zone,
	"delay_hours" integer,
	"event_id" uuid,
	"acknowledged" boolean DEFAULT false NOT NULL,
	"acknowledged_at" timestamp with time zone,
	"notified" boolean DEFAULT false NOT NULL,
	"notified_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "shipment_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"shipment_id" uuid,
	"container_number" varchar(20) NOT NULL,
	"event_type" "dcsa_event_type" NOT NULL,
	"source" "dcsa_event_source" DEFAULT 'terminal49' NOT NULL,
	"source_event_id" varchar(100),
	"event_time" timestamp with time zone,
	"location" varchar(300),
	"location_code" varchar(10),
	"eta_at_event" timestamp with time zone,
	"metadata" jsonb,
	"description" text,
	"webhook_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "terminal49_webhooks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"t49_event_id" varchar(100),
	"t49_event_type" varchar(100),
	"raw_payload" jsonb NOT NULL,
	"processed" boolean DEFAULT false NOT NULL,
	"processed_at" timestamp with time zone,
	"error_message" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "eta_change_alerts" ADD CONSTRAINT "eta_change_alerts_shipment_id_shipments_id_fk" FOREIGN KEY ("shipment_id") REFERENCES "public"."shipments"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "eta_change_alerts" ADD CONSTRAINT "eta_change_alerts_event_id_shipment_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."shipment_events"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "shipment_events" ADD CONSTRAINT "shipment_events_shipment_id_shipments_id_fk" FOREIGN KEY ("shipment_id") REFERENCES "public"."shipments"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "shipment_events" ADD CONSTRAINT "shipment_events_webhook_id_terminal49_webhooks_id_fk" FOREIGN KEY ("webhook_id") REFERENCES "public"."terminal49_webhooks"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "shipment_events_source_event_idx" ON "shipment_events" USING btree ("source_event_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "shipment_events_container_idx" ON "shipment_events" USING btree ("container_number","event_time");
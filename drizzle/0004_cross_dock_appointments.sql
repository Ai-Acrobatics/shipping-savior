-- AI-12007: Cross-dock appointment board — calendar/lane view of cross-dock
-- appointments at Port Hueneme, ANACAPA, and KINGSCO facilities.
--
-- The Hall Pass / Wainimi business happens at cross-dock. This table is the
-- scheduling layer: carriers book time slots, containers are tracked through
-- cross-dock operations.

CREATE TYPE "public"."cross_dock_location" AS ENUM('port_hueneme', 'anacapa', 'kingsco');
--> statement-breakpoint

CREATE TYPE "public"."appointment_status" AS ENUM('scheduled', 'checked_in', 'in_progress', 'completed', 'cancelled', 'no_show');
--> statement-breakpoint

CREATE TABLE "cross_dock_appointments" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "org_id" uuid NOT NULL,
  "user_id" uuid NOT NULL,
  "location" "cross_dock_location" NOT NULL,
  "appointment_date" timestamp with time zone NOT NULL,
  "time_slot" varchar(50) NOT NULL,
  "carrier" varchar(100) NOT NULL,
  "vessel_name" varchar(200),
  "voyage_number" varchar(100),
  "container_count" integer DEFAULT 1,
  "container_numbers" jsonb,
  "reference" varchar(100),
  "status" "appointment_status" DEFAULT 'scheduled' NOT NULL,
  "notes" text,
  "shipment_id" uuid,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint

ALTER TABLE "cross_dock_appointments" ADD CONSTRAINT "cross_dock_appointments_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "cross_dock_appointments" ADD CONSTRAINT "cross_dock_appointments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "cross_dock_appointments" ADD CONSTRAINT "cross_dock_appointments_shipment_id_shipments_id_fk" FOREIGN KEY ("shipment_id") REFERENCES "public"."shipments"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint

CREATE INDEX "cross_dock_appointments_org_date_idx" ON "cross_dock_appointments" USING btree ("org_id", "appointment_date");
--> statement-breakpoint
CREATE INDEX "cross_dock_appointments_location_date_idx" ON "cross_dock_appointments" USING btree ("location", "appointment_date");

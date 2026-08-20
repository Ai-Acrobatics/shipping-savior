CREATE TYPE "public"."consent_choice" AS ENUM('all', 'essential');--> statement-breakpoint
CREATE TABLE "cookie_consents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"visitor_id" varchar(64) NOT NULL,
	"user_id" uuid,
	"org_id" uuid,
	"choice" "consent_choice" NOT NULL,
	"policy_version" varchar(32) NOT NULL,
	"ip_address" varchar(45),
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "cookie_consents" ADD CONSTRAINT "cookie_consents_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cookie_consents" ADD CONSTRAINT "cookie_consents_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE set null ON UPDATE no action;
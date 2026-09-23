CREATE TABLE "installer_certifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"installer_id" uuid NOT NULL,
	"brand_id" uuid,
	"brand_name" text NOT NULL,
	"certified_since" text,
	"proof_url" text,
	"brand_rating" text,
	"brand_status" text DEFAULT 'pending' NOT NULL,
	"brand_approved_at" timestamp,
	"brand_notes" text,
	"admin_status" text DEFAULT 'pending' NOT NULL,
	"admin_approved_at" timestamp,
	"admin_notes" text,
	"status" text DEFAULT 'pending_brand' NOT NULL,
	"brand_ratings" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "reviews" DROP CONSTRAINT "reviews_author_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "brands" ALTER COLUMN "status" SET DEFAULT 'draft';--> statement-breakpoint
ALTER TABLE "epc_installers" ALTER COLUMN "tier" SET DEFAULT 'unverified';--> statement-breakpoint
ALTER TABLE "reviews" ALTER COLUMN "author_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "reviews" ALTER COLUMN "status" SET DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE "brands" ADD COLUMN "slug" text;--> statement-breakpoint
ALTER TABLE "brands" ADD COLUMN "tagline" text;--> statement-breakpoint
ALTER TABLE "brands" ADD COLUMN "local_team" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "brands" ADD COLUMN "annual_capacity" jsonb DEFAULT '{}'::jsonb;--> statement-breakpoint
ALTER TABLE "brands" ADD COLUMN "worldwide_projects" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "brands" ADD COLUMN "manufacturing_facilities" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "brands" ADD COLUMN "offices" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "brands" ADD COLUMN "global_locations" text;--> statement-breakpoint
ALTER TABLE "brands" ADD COLUMN "after_sales_support" text;--> statement-breakpoint
ALTER TABLE "brands" ADD COLUMN "rating" text DEFAULT '4.8';--> statement-breakpoint
ALTER TABLE "brands" ADD COLUMN "review_count" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "epc_installers" ADD COLUMN "slug" text;--> statement-breakpoint
ALTER TABLE "epc_installers" ADD COLUMN "eg_rating" text DEFAULT '9.0';--> statement-breakpoint
ALTER TABLE "epc_installers" ADD COLUMN "memberships" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "epc_installers" ADD COLUMN "audit_status" jsonb DEFAULT '{"auditCompleted":false}'::jsonb;--> statement-breakpoint
ALTER TABLE "epc_installers" ADD COLUMN "status" text DEFAULT 'draft';--> statement-breakpoint
ALTER TABLE "epc_installers" ADD COLUMN "admin_feedback" text;--> statement-breakpoint
ALTER TABLE "epc_installers" ADD COLUMN "approval_history" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "epc_installers" ADD COLUMN "eg_team_ratings" jsonb;--> statement-breakpoint
ALTER TABLE "reviews" ADD COLUMN "city" text;--> statement-breakpoint
ALTER TABLE "reviews" ADD COLUMN "product_used" text;--> statement-breakpoint
ALTER TABLE "installer_certifications" ADD CONSTRAINT "installer_certifications_installer_id_epc_installers_id_fk" FOREIGN KEY ("installer_id") REFERENCES "public"."epc_installers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "installer_certifications" ADD CONSTRAINT "installer_certifications_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "installer_certs_installer_id_idx" ON "installer_certifications" USING btree ("installer_id");--> statement-breakpoint
CREATE INDEX "installer_certs_brand_id_idx" ON "installer_certifications" USING btree ("brand_id");--> statement-breakpoint
CREATE INDEX "installer_certs_status_idx" ON "installer_certifications" USING btree ("status");--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "epc_installers_slug_idx" ON "epc_installers" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "reviews_status_idx" ON "reviews" USING btree ("status");
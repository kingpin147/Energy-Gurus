ALTER TABLE "ads" ADD COLUMN "mobile_image_url" text;--> statement-breakpoint
ALTER TABLE "brands" ADD COLUMN "team" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "brands" ADD COLUMN "customer_care_email" text;--> statement-breakpoint
ALTER TABLE "brands" ADD COLUMN "founded" text;--> statement-breakpoint
ALTER TABLE "brands" ADD COLUMN "headquarters" text;--> statement-breakpoint
ALTER TABLE "brands" ADD COLUMN "country_of_origin" text;--> statement-breakpoint
ALTER TABLE "brands" ADD COLUMN "status" text DEFAULT 'live';--> statement-breakpoint
ALTER TABLE "brands" ADD COLUMN "admin_feedback" text;--> statement-breakpoint
ALTER TABLE "brands" ADD COLUMN "approval_history" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "brands" ADD COLUMN "distributors" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "brands" ADD COLUMN "retailers" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "brands" ADD COLUMN "service_centres" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "brands" ADD COLUMN "certified_installers" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "manual_url" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "warranty_years" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "efficiency" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "power_range" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "protection_rating" text;--> statement-breakpoint
ALTER TABLE "reviews" ADD COLUMN "status" text DEFAULT 'approved' NOT NULL;--> statement-breakpoint
ALTER TABLE "reviews" ADD COLUMN "rejection_reason" text;--> statement-breakpoint
ALTER TABLE "reviews" ADD COLUMN "proof_url" text;--> statement-breakpoint
ALTER TABLE "reviews" ADD COLUMN "author_name" text;--> statement-breakpoint
ALTER TABLE "reviews" ADD COLUMN "author_email" text;--> statement-breakpoint
ALTER TABLE "reviews" ADD COLUMN "is_verified_purchase" boolean DEFAULT false NOT NULL;
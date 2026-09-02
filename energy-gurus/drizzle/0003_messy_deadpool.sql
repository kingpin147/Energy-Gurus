CREATE TABLE "ads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"image_url" text NOT NULL,
	"link_url" text,
	"placement" text NOT NULL,
	"target_page" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "monitoring_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_name" text NOT NULL,
	"address" text NOT NULL,
	"contact_no" text NOT NULL,
	"email" text NOT NULL,
	"cnic" text NOT NULL,
	"customer_type" text NOT NULL,
	"system_size" text NOT NULL,
	"package" text NOT NULL,
	"monitoring_hours" text NOT NULL,
	"payment_plan" text NOT NULL,
	"amount_payable" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "news" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"category" text NOT NULL,
	"image_url" text,
	"author_id" uuid NOT NULL,
	"author_name" text,
	"author_picture_url" text,
	"author_designation" text,
	"author_organization" text,
	"author_linkedin" text,
	"author_email" text,
	"is_published" boolean DEFAULT false NOT NULL,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "news_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "brands" ADD COLUMN "categories" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "epc_installers" ADD COLUMN "designation" text;--> statement-breakpoint
ALTER TABLE "epc_installers" ADD COLUMN "business_type" text;--> statement-breakpoint
ALTER TABLE "epc_installers" ADD COLUMN "photos" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "epc_installers" ADD COLUMN "review_videos" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "epc_installers" ADD COLUMN "years_in_business" integer;--> statement-breakpoint
ALTER TABLE "epc_installers" ADD COLUMN "address" text;--> statement-breakpoint
ALTER TABLE "epc_installers" ADD COLUMN "area" text;--> statement-breakpoint
ALTER TABLE "epc_installers" ADD COLUMN "city" text;--> statement-breakpoint
ALTER TABLE "epc_installers" ADD COLUMN "country" text DEFAULT 'Pakistan';--> statement-breakpoint
ALTER TABLE "epc_installers" ADD COLUMN "coordinates" text;--> statement-breakpoint
ALTER TABLE "epc_installers" ADD COLUMN "contact_no" text;--> statement-breakpoint
ALTER TABLE "epc_installers" ADD COLUMN "whatsapp" text;--> statement-breakpoint
ALTER TABLE "epc_installers" ADD COLUMN "email" text;--> statement-breakpoint
ALTER TABLE "epc_installers" ADD COLUMN "brands_certified" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "epc_installers" ADD COLUMN "solar_brands" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "epc_installers" ADD COLUMN "inverter_brands" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "epc_installers" ADD COLUMN "battery_brands" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "epc_installers" ADD COLUMN "solar_cert_documents" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "epc_installers" ADD COLUMN "inverter_cert_documents" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "epc_installers" ADD COLUMN "battery_cert_documents" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "epc_installers" ADD COLUMN "team" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "epc_installers" ADD COLUMN "reg_number" text;--> statement-breakpoint
ALTER TABLE "epc_installers" ADD COLUMN "licence_documents" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "epc_installers" ADD COLUMN "tier" text DEFAULT 'bronze';--> statement-breakpoint
ALTER TABLE "epc_offices" ADD COLUMN "address" text;--> statement-breakpoint
ALTER TABLE "epc_offices" ADD COLUMN "country" text DEFAULT 'Pakistan';--> statement-breakpoint
ALTER TABLE "epc_offices" ADD COLUMN "coordinates" text;--> statement-breakpoint
ALTER TABLE "epc_projects" ADD COLUMN "entry_type" text DEFAULT 'project';--> statement-breakpoint
ALTER TABLE "epc_projects" ADD COLUMN "customer_name" text;--> statement-breakpoint
ALTER TABLE "epc_projects" ADD COLUMN "company_name" text;--> statement-breakpoint
ALTER TABLE "epc_projects" ADD COLUMN "installation_date" text;--> statement-breakpoint
ALTER TABLE "epc_projects" ADD COLUMN "country" text;--> statement-breakpoint
ALTER TABLE "epc_projects" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "epc_projects" ADD COLUMN "youtube_url" text;--> statement-breakpoint
ALTER TABLE "inquiries" ADD COLUMN "metadata" jsonb;--> statement-breakpoint
ALTER TABLE "podcasts" ADD COLUMN "category" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "specifications" jsonb DEFAULT '{}'::jsonb;--> statement-breakpoint
ALTER TABLE "news" ADD CONSTRAINT "news_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "news_author_id_idx" ON "news" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "news_slug_idx" ON "news" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "news_created_at_idx" ON "news" USING btree ("created_at");
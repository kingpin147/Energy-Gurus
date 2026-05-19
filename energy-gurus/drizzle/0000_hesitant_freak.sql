CREATE TABLE "brand_certifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"brand_id" uuid NOT NULL,
	"name" text NOT NULL,
	"issuing_body" text,
	"expiry_date" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "brands" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"brand_name" text NOT NULL,
	"country_head" text,
	"customer_care_head" text,
	"logo_url" text,
	"about" text,
	"photos" jsonb DEFAULT '[]'::jsonb,
	"reps" jsonb DEFAULT '[]'::jsonb,
	"customer_care" text,
	"head_office" text,
	"website" text,
	"warranty_url" text,
	"qr_url" text,
	"social_links" jsonb DEFAULT '[]'::jsonb,
	"is_verified" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "epc_installers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"company_name" text NOT NULL,
	"ceo_name" text,
	"sectors" jsonb DEFAULT '[]'::jsonb,
	"logo_url" text,
	"about" text,
	"portfolio" jsonb DEFAULT '[]'::jsonb,
	"social_links" jsonb DEFAULT '[]'::jsonb,
	"website" text,
	"is_verified" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "epc_offices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"epc_id" uuid NOT NULL,
	"office_number" text,
	"block" text,
	"area" text,
	"city" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "epc_projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"epc_id" uuid NOT NULL,
	"name" text NOT NULL,
	"city" text,
	"segment_type" text,
	"system_size" text,
	"system_type" text,
	"inverter_model" text,
	"battery_model" text,
	"solar_panel_model" text,
	"images" jsonb DEFAULT '[]'::jsonb,
	"videos" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inquiries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sender_id" uuid,
	"receiver_id" uuid NOT NULL,
	"guest_name" text,
	"guest_email" text,
	"guest_phone" text,
	"message" text NOT NULL,
	"subject" text,
	"reply" text,
	"status" text DEFAULT 'new' NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"inquiry_type" text DEFAULT 'client' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invitations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"role" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "invitations_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "live_qa" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"topic" text NOT NULL,
	"description" text,
	"youtube_url" text NOT NULL,
	"thumbnail_url" text,
	"expert_name" text,
	"expert_title" text,
	"expert_photo_url" text,
	"status" text DEFAULT 'upcoming' NOT NULL,
	"session_date" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "live_qa_questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"user_name" text NOT NULL,
	"question" text NOT NULL,
	"is_answered" boolean DEFAULT false NOT NULL,
	"is_highlighted" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "podcasts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"youtube_url" text NOT NULL,
	"thumbnail_url" text,
	"guest_name" text,
	"guest_designation" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_serials" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"serial_number" text NOT NULL,
	"status" text DEFAULT 'genuine' NOT NULL,
	"warranty_expiry" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "product_serials_serial_number_unique" UNIQUE("serial_number")
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"brand_id" uuid NOT NULL,
	"name" text NOT NULL,
	"category" text,
	"description" text,
	"datasheet_url" text,
	"serial_number" text,
	"qr_code" text,
	"warranty_link" text,
	"image_url" text,
	"series" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"author_id" uuid NOT NULL,
	"target_id" uuid NOT NULL,
	"target_type" text NOT NULL,
	"rating" integer NOT NULL,
	"comment" text,
	"reply" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_id" text NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"role" text DEFAULT 'epc' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_clerk_id_unique" UNIQUE("clerk_id"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "brand_certifications" ADD CONSTRAINT "brand_certifications_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brands" ADD CONSTRAINT "brands_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "epc_installers" ADD CONSTRAINT "epc_installers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "epc_offices" ADD CONSTRAINT "epc_offices_epc_id_epc_installers_id_fk" FOREIGN KEY ("epc_id") REFERENCES "public"."epc_installers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "epc_projects" ADD CONSTRAINT "epc_projects_epc_id_epc_installers_id_fk" FOREIGN KEY ("epc_id") REFERENCES "public"."epc_installers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inquiries" ADD CONSTRAINT "inquiries_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inquiries" ADD CONSTRAINT "inquiries_receiver_id_users_id_fk" FOREIGN KEY ("receiver_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "live_qa_questions" ADD CONSTRAINT "live_qa_questions_session_id_live_qa_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."live_qa"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_serials" ADD CONSTRAINT "product_serials_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "brand_certifications_brand_id_idx" ON "brand_certifications" USING btree ("brand_id");--> statement-breakpoint
CREATE INDEX "brands_user_id_idx" ON "brands" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "brands_created_at_idx" ON "brands" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "epc_installers_user_id_idx" ON "epc_installers" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "epc_installers_created_at_idx" ON "epc_installers" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "epc_offices_epc_id_idx" ON "epc_offices" USING btree ("epc_id");--> statement-breakpoint
CREATE INDEX "epc_projects_epc_id_idx" ON "epc_projects" USING btree ("epc_id");--> statement-breakpoint
CREATE INDEX "inquiries_receiver_id_idx" ON "inquiries" USING btree ("receiver_id");--> statement-breakpoint
CREATE INDEX "inquiries_sender_id_idx" ON "inquiries" USING btree ("sender_id");--> statement-breakpoint
CREATE INDEX "inquiries_created_at_idx" ON "inquiries" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "live_qa_created_at_idx" ON "live_qa" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "live_qa_questions_session_id_idx" ON "live_qa_questions" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "podcasts_created_at_idx" ON "podcasts" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "product_serials_product_id_idx" ON "product_serials" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "products_brand_id_idx" ON "products" USING btree ("brand_id");--> statement-breakpoint
CREATE INDEX "reviews_target_idx" ON "reviews" USING btree ("target_id","target_type");--> statement-breakpoint
CREATE INDEX "reviews_author_id_idx" ON "reviews" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "users_is_active_idx" ON "users" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
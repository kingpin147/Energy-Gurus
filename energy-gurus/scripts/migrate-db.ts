import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

async function runMigration() {
  const { db } = await import("../src/db");
  const { sql } = await import("drizzle-orm");

  console.log("--- Starting Safe Database Schema Migration ---");

  const queries = [
    // 1. Ads
    `CREATE TABLE IF NOT EXISTS "ads" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "title" text NOT NULL,
      "image_url" text NOT NULL,
      "mobile_image_url" text,
      "link_url" text,
      "placement" text NOT NULL,
      "target_page" text NOT NULL,
      "is_active" boolean DEFAULT true NOT NULL,
      "created_at" timestamp DEFAULT now() NOT NULL,
      "updated_at" timestamp DEFAULT now() NOT NULL
    );`,
    `ALTER TABLE "ads" ADD COLUMN IF NOT EXISTS "mobile_image_url" text;`,

    // 2. Brands
    `ALTER TABLE "brands" ADD COLUMN IF NOT EXISTS "categories" jsonb DEFAULT '[]'::jsonb;`,
    `ALTER TABLE "brands" ADD COLUMN IF NOT EXISTS "team" jsonb DEFAULT '[]'::jsonb;`,
    `ALTER TABLE "brands" ADD COLUMN IF NOT EXISTS "customer_care_email" text;`,
    `ALTER TABLE "brands" ADD COLUMN IF NOT EXISTS "founded" text;`,
    `ALTER TABLE "brands" ADD COLUMN IF NOT EXISTS "headquarters" text;`,
    `ALTER TABLE "brands" ADD COLUMN IF NOT EXISTS "country_of_origin" text;`,
    `ALTER TABLE "brands" ADD COLUMN IF NOT EXISTS "status" text DEFAULT 'live';`,
    `ALTER TABLE "brands" ADD COLUMN IF NOT EXISTS "admin_feedback" text;`,
    `ALTER TABLE "brands" ADD COLUMN IF NOT EXISTS "approval_history" jsonb DEFAULT '[]'::jsonb;`,
    `ALTER TABLE "brands" ADD COLUMN IF NOT EXISTS "distributors" jsonb DEFAULT '[]'::jsonb;`,
    `ALTER TABLE "brands" ADD COLUMN IF NOT EXISTS "retailers" jsonb DEFAULT '[]'::jsonb;`,
    `ALTER TABLE "brands" ADD COLUMN IF NOT EXISTS "service_centres" jsonb DEFAULT '[]'::jsonb;`,
    `ALTER TABLE "brands" ADD COLUMN IF NOT EXISTS "certified_installers" jsonb DEFAULT '[]'::jsonb;`,

    // 3. Products
    `ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "manual_url" text;`,
    `ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "warranty_years" text;`,
    `ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "efficiency" text;`,
    `ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "power_range" text;`,
    `ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "protection_rating" text;`,
    `ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "specifications" jsonb DEFAULT '{}'::jsonb;`,

    // 4. Reviews
    `ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "status" text DEFAULT 'approved' NOT NULL;`,
    `ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "rejection_reason" text;`,
    `ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "proof_url" text;`,
    `ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "author_name" text;`,
    `ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "author_email" text;`,
    `ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "is_verified_purchase" boolean DEFAULT false NOT NULL;`,

    // 5. EPC Installers
    `ALTER TABLE "epc_installers" ADD COLUMN IF NOT EXISTS "designation" text;`,
    `ALTER TABLE "epc_installers" ADD COLUMN IF NOT EXISTS "business_type" text;`,
    `ALTER TABLE "epc_installers" ADD COLUMN IF NOT EXISTS "photos" jsonb DEFAULT '[]'::jsonb;`,
    `ALTER TABLE "epc_installers" ADD COLUMN IF NOT EXISTS "review_videos" jsonb DEFAULT '[]'::jsonb;`,
    `ALTER TABLE "epc_installers" ADD COLUMN IF NOT EXISTS "years_in_business" integer;`,
    `ALTER TABLE "epc_installers" ADD COLUMN IF NOT EXISTS "address" text;`,
    `ALTER TABLE "epc_installers" ADD COLUMN IF NOT EXISTS "area" text;`,
    `ALTER TABLE "epc_installers" ADD COLUMN IF NOT EXISTS "city" text;`,
    `ALTER TABLE "epc_installers" ADD COLUMN IF NOT EXISTS "country" text DEFAULT 'Pakistan';`,
    `ALTER TABLE "epc_installers" ADD COLUMN IF NOT EXISTS "coordinates" text;`,
    `ALTER TABLE "epc_installers" ADD COLUMN IF NOT EXISTS "contact_no" text;`,
    `ALTER TABLE "epc_installers" ADD COLUMN IF NOT EXISTS "whatsapp" text;`,
    `ALTER TABLE "epc_installers" ADD COLUMN IF NOT EXISTS "email" text;`,
    `ALTER TABLE "epc_installers" ADD COLUMN IF NOT EXISTS "brands_certified" jsonb DEFAULT '[]'::jsonb;`,
    `ALTER TABLE "epc_installers" ADD COLUMN IF NOT EXISTS "solar_brands" jsonb DEFAULT '[]'::jsonb;`,
    `ALTER TABLE "epc_installers" ADD COLUMN IF NOT EXISTS "inverter_brands" jsonb DEFAULT '[]'::jsonb;`,
    `ALTER TABLE "epc_installers" ADD COLUMN IF NOT EXISTS "battery_brands" jsonb DEFAULT '[]'::jsonb;`,
    `ALTER TABLE "epc_installers" ADD COLUMN IF NOT EXISTS "solar_cert_documents" jsonb DEFAULT '[]'::jsonb;`,
    `ALTER TABLE "epc_installers" ADD COLUMN IF NOT EXISTS "inverter_cert_documents" jsonb DEFAULT '[]'::jsonb;`,
    `ALTER TABLE "epc_installers" ADD COLUMN IF NOT EXISTS "battery_cert_documents" jsonb DEFAULT '[]'::jsonb;`,
    `ALTER TABLE "epc_installers" ADD COLUMN IF NOT EXISTS "team" jsonb DEFAULT '[]'::jsonb;`,
    `ALTER TABLE "epc_installers" ADD COLUMN IF NOT EXISTS "reg_number" text;`,
    `ALTER TABLE "epc_installers" ADD COLUMN IF NOT EXISTS "licence_documents" jsonb DEFAULT '[]'::jsonb;`,
    `ALTER TABLE "epc_installers" ADD COLUMN IF NOT EXISTS "tier" text DEFAULT 'bronze';`,

    // 6. EPC Offices
    `ALTER TABLE "epc_offices" ADD COLUMN IF NOT EXISTS "address" text;`,
    `ALTER TABLE "epc_offices" ADD COLUMN IF NOT EXISTS "country" text DEFAULT 'Pakistan';`,
    `ALTER TABLE "epc_offices" ADD COLUMN IF NOT EXISTS "coordinates" text;`,

    // 7. EPC Projects
    `ALTER TABLE "epc_projects" ADD COLUMN IF NOT EXISTS "entry_type" text DEFAULT 'project';`,
    `ALTER TABLE "epc_projects" ADD COLUMN IF NOT EXISTS "customer_name" text;`,
    `ALTER TABLE "epc_projects" ADD COLUMN IF NOT EXISTS "company_name" text;`,
    `ALTER TABLE "epc_projects" ADD COLUMN IF NOT EXISTS "installation_date" text;`,
    `ALTER TABLE "epc_projects" ADD COLUMN IF NOT EXISTS "country" text;`,
    `ALTER TABLE "epc_projects" ADD COLUMN IF NOT EXISTS "description" text;`,
    `ALTER TABLE "epc_projects" ADD COLUMN IF NOT EXISTS "youtube_url" text;`,

    // 8. Inquiries & Podcasts
    `ALTER TABLE "inquiries" ADD COLUMN IF NOT EXISTS "metadata" jsonb;`,
    `ALTER TABLE "podcasts" ADD COLUMN IF NOT EXISTS "category" text;`,

    // 9. Monitoring Requests
    `CREATE TABLE IF NOT EXISTS "monitoring_requests" (
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
    );`,

    // 10. News table & indexes
    `CREATE TABLE IF NOT EXISTS "news" (
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
    );`,
    `CREATE INDEX IF NOT EXISTS "news_author_id_idx" ON "news" ("author_id");`,
    `CREATE INDEX IF NOT EXISTS "news_slug_idx" ON "news" ("slug");`,
    `CREATE INDEX IF NOT EXISTS "news_created_at_idx" ON "news" ("created_at");`
  ];

  try {
    for (const q of queries) {
      await db.execute(sql.raw(q));
    }
    console.log("✅ All database migrations applied successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

runMigration().then(() => process.exit(0));

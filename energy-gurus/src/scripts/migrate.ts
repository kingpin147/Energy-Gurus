import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load env variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function run() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("DATABASE_URL is not set");
    process.exit(1);
  }

  const sql = neon(databaseUrl);
  console.log("Running migration...");

  try {
    console.log("1. Adding certifications column to epc_installers...");
    await sql`ALTER TABLE epc_installers ADD COLUMN IF NOT EXISTS certifications jsonb DEFAULT '[]'::jsonb;`;
    console.log("Success: certifications column added.");
  } catch (err: any) {
    console.error("Error adding certifications column:", err.message);
  }

  // New columns for epc_installers (24-08-2026 onboarding update)
  try {
    console.log("2a. Adding new epc_installers columns (designation, businessType, coordinates, whatsapp, photos, cert docs)...");
    await sql`ALTER TABLE epc_installers ADD COLUMN IF NOT EXISTS designation text;`;
    await sql`ALTER TABLE epc_installers ADD COLUMN IF NOT EXISTS business_type text;`;
    await sql`ALTER TABLE epc_installers ADD COLUMN IF NOT EXISTS coordinates text;`;
    await sql`ALTER TABLE epc_installers ADD COLUMN IF NOT EXISTS whatsapp text;`;
    await sql`ALTER TABLE epc_installers ADD COLUMN IF NOT EXISTS photos jsonb DEFAULT '[]'::jsonb;`;
    await sql`ALTER TABLE epc_installers ADD COLUMN IF NOT EXISTS solar_cert_documents jsonb DEFAULT '[]'::jsonb;`;
    await sql`ALTER TABLE epc_installers ADD COLUMN IF NOT EXISTS inverter_cert_documents jsonb DEFAULT '[]'::jsonb;`;
    await sql`ALTER TABLE epc_installers ADD COLUMN IF NOT EXISTS battery_cert_documents jsonb DEFAULT '[]'::jsonb;`;
    console.log("Success: new epc_installers columns added.");
  } catch (err: any) {
    console.error("Error adding new epc_installers columns:", err.message);
  }

  // New columns for epc_offices
  try {
    console.log("2b. Adding new epc_offices columns (address, country, coordinates)...");
    await sql`ALTER TABLE epc_offices ADD COLUMN IF NOT EXISTS address text;`;
    await sql`ALTER TABLE epc_offices ADD COLUMN IF NOT EXISTS country text DEFAULT 'Pakistan';`;
    await sql`ALTER TABLE epc_offices ADD COLUMN IF NOT EXISTS coordinates text;`;
    console.log("Success: new epc_offices columns added.");
  } catch (err: any) {
    console.error("Error adding new epc_offices columns:", err.message);
  }

  // New column for epc_projects
  try {
    console.log("2c. Adding entry_type column to epc_projects...");
    await sql`ALTER TABLE epc_projects ADD COLUMN IF NOT EXISTS entry_type text DEFAULT 'project';`;
    console.log("Success: entry_type column added to epc_projects.");
  } catch (err: any) {
    console.error("Error adding entry_type column:", err.message);
  }

  try {
    console.log("3. Converting segment_type column in epc_projects to jsonb...");
    // Check if the column is already jsonb or text. We can cast it.
    await sql`ALTER TABLE epc_projects ALTER COLUMN segment_type TYPE jsonb USING jsonb_build_array(segment_type);`;
    console.log("Success: segment_type column converted to jsonb.");
  } catch (err: any) {
    console.error("Error converting segment_type:", err.message);
    console.log("Attempting fallback conversion if already jsonb or null...");
    try {
      await sql`ALTER TABLE epc_projects ALTER COLUMN segment_type TYPE jsonb USING COALESCE(segment_type::jsonb, '[]'::jsonb);`;
      console.log("Success with fallback conversion.");
    } catch (fallbackErr: any) {
      console.error("Fallback conversion failed:", fallbackErr.message);
    }
  }

  try {
    console.log("4. Adding author details columns to news table...");
    await sql`ALTER TABLE news ADD COLUMN IF NOT EXISTS author_name text;`;
    await sql`ALTER TABLE news ADD COLUMN IF NOT EXISTS author_picture_url text;`;
    await sql`ALTER TABLE news ADD COLUMN IF NOT EXISTS author_designation text;`;
    await sql`ALTER TABLE news ADD COLUMN IF NOT EXISTS author_organization text;`;
    await sql`ALTER TABLE news ADD COLUMN IF NOT EXISTS author_linkedin text;`;
    await sql`ALTER TABLE news ADD COLUMN IF NOT EXISTS author_email text;`;
    console.log("Success: author details columns added to news table.");
  } catch (err: any) {
    console.error("Error adding author columns to news:", err.message);
  }

  console.log("Migration complete!");
  process.exit(0);
}

run().catch(err => {
  console.error("Migration failed:", err);
  process.exit(1);
});

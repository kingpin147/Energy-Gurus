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

  try {
    console.log("2. Converting segment_type column in epc_projects to jsonb...");
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

  console.log("Migration complete!");
  process.exit(0);
}

run().catch(err => {
  console.error("Migration failed:", err);
  process.exit(1);
});

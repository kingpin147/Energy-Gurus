import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";
dotenv.config();

async function testRaw() {
  console.log("Testing raw database connection...");
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL not set");
    return;
  }
  try {
    const sql = neon(url);
    const result = await sql`SELECT 1 as connected`;
    console.log("Neon connection successful:", result);
  } catch (error) {
    console.error("Neon connection failed:", error);
  }
}

testRaw();

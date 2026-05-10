import * as dotenv from "dotenv";
dotenv.config();

import { db } from "../db";
import { users } from "../db/schema";
import { count } from "drizzle-orm";

async function testConnection() {
  console.log("Testing database connection...");
  try {
    const result = await db.select({ value: count() }).from(users);
    console.log("Connection successful! User count:", result[0].value);
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
}

testConnection();

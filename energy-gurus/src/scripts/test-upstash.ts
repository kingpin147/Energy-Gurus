import { Redis } from "@upstash/redis";
import * as dotenv from "dotenv";
import path from "path";

// Load .env from root
dotenv.config({ path: path.join(process.cwd(), ".env") });

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

async function testConnection() {
  console.log("🚀 Testing Upstash Redis connection...");
  try {
    const ping = await redis.ping();
    if (ping === "PONG") {
      console.log("✅ Success! Upstash Redis is working. (Response: PONG)");
      
      // Try a simple set/get
      await redis.set("test_key", "EnergyGurus_Live_" + new Date().toISOString());
      const value = await redis.get("test_key");
      console.log("📝 Data Write/Read Test:", value ? "PASSED" : "FAILED");
    } else {
      console.log("⚠️ Unexpected response from Upstash:", ping);
    }
  } catch (error) {
    console.error("❌ Upstash Connection Failed:", error);
  }
}

testConnection();

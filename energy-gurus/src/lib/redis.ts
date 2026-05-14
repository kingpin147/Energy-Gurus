import { Redis } from "@upstash/redis";

if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
  throw new Error("UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be defined in .env");
}

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

/**
 * Helper to generate cache keys
 */
export const CACHE_KEYS = {
  BRANDS_LIST: "brands:all",
  BRAND_DETAILS: (id: string) => `brand:${id}`,
  EPCS_LIST: "epcs:all",
  EPC_DETAILS: (id: string) => `epc:${id}`,
  PODCASTS_LIST: "podcasts:all",
  LIVE_QA_LIST: "liveqa:all",
  USER_ROLE: (userId: string) => `user:role:${userId}`,
  RATE_LIMIT: (ip: string) => `ratelimit:${ip}`,
};

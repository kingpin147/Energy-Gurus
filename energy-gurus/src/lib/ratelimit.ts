import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "./redis";

/**
 * Global Rate Limiter
 * 20 requests per 10 seconds for general API/Dashboard
 */
export const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(20, "10 s"),
  analytics: true,
  prefix: "@upstash/ratelimit",
});

/**
 * Strict Rate Limiter (for sensitive actions like uploads or logins)
 * 5 requests per 1 minute
 */
export const strictRatelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(5, "1 m"),
  analytics: true,
  prefix: "@upstash/ratelimit-strict",
});

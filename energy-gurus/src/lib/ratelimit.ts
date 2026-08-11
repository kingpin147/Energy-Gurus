import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "./redis";

/**
 * Page Navigation Rate Limiter
 * 200 requests per 60 seconds — generous enough for normal browsing
 * and Next.js prefetching without hitting 429 errors.
 */
export const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(200, "60 s"),
  analytics: true,
  prefix: "@upstash/ratelimit-pages"
    });

/**
 * API / Mutation Rate Limiter
 * 30 requests per 60 seconds — for form submissions, uploads, etc.
 */
export const apiRatelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(30, "60 s"),
  analytics: true,
  prefix: "@upstash/ratelimit-api"
    });

/**
 * Strict Rate Limiter (for sensitive actions like auth or invitations)
 * 10 requests per 1 minute
 */
export const strictRatelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(10, "1 m"),
  analytics: true,
  prefix: "@upstash/ratelimit-strict"
    });

"use server";

import { db } from "@/db";
import { developerLogs } from "@/db/schema";
import { getUserRole } from "@/lib/roles";
import { pruneOldDeveloperLogs } from "@/lib/developer-logger";
import { sql, eq, desc, and, gte } from "drizzle-orm";

export type TimeframeOption = "1d" | "3d" | "7d";
export type LogTypeFilter = "all" | "activity" | "error";

export interface GetLogsOptions {
  timeframe?: TimeframeOption;
  logType?: LogTypeFilter;
  action?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export async function getDeveloperLogs(options: GetLogsOptions = {}) {
  const role = await getUserRole();
  if (role !== "super-admin" && role !== "admin") {
    throw new Error("Unauthorized: Developer logs require administrative privileges.");
  }

  // Asynchronously prune logs older than 7 days to keep database lightweight
  pruneOldDeveloperLogs().catch(() => {});

  const timeframe = options.timeframe || "7d";
  const logType = options.logType || "all";
  const action = options.action || "ALL";
  const search = (options.search || "").trim().toLowerCase();
  const page = Math.max(1, options.page || 1);
  const limit = Math.min(100, Math.max(10, options.limit || 50));
  const offset = (page - 1) * limit;

  // Determine timeframe SQL interval
  let intervalString = "7 days";
  if (timeframe === "1d") intervalString = "1 day";
  else if (timeframe === "3d") intervalString = "3 days";

  // Build conditions
  const conditions = [sql`created_at >= NOW() - INTERVAL ${sql.raw(`'${intervalString}'`)}`];

  if (logType !== "all") {
    conditions.push(eq(developerLogs.logType, logType));
  }

  if (action !== "ALL") {
    conditions.push(eq(developerLogs.action, action.toUpperCase()));
  }

  if (search) {
    const searchPattern = `%${search}%`;
    conditions.push(sql`(
      LOWER(summary) LIKE ${searchPattern} OR
      LOWER(user_name) LIKE ${searchPattern} OR
      LOWER(user_role) LIKE ${searchPattern} OR
      LOWER(table_name) LIKE ${searchPattern} OR
      LOWER(action) LIKE ${searchPattern} OR
      LOWER(record_id) LIKE ${searchPattern}
    )`);
  }

  const whereClause = and(...conditions);

  // Query logs and total matching
  const [logs, countResult, statsResult] = await Promise.all([
    db
      .select()
      .from(developerLogs)
      .where(whereClause)
      .orderBy(desc(developerLogs.createdAt))
      .limit(limit)
      .offset(offset),

    db
      .select({ count: sql<number>`count(*)::int` })
      .from(developerLogs)
      .where(whereClause),

    // Compute stats across current timeframe
    db
      .select({
        total: sql<number>`count(*)::int`,
        activities: sql<number>`count(*) filter (where log_type = 'activity')::int`,
        errors: sql<number>`count(*) filter (where log_type = 'error')::int`,
        today: sql<number>`count(*) filter (where created_at >= NOW() - INTERVAL '1 day')::int`,
      })
      .from(developerLogs)
      .where(sql`created_at >= NOW() - INTERVAL ${sql.raw(`'${intervalString}'`)}`),
  ]);

  const total = countResult[0]?.count || 0;
  const stats = statsResult[0] || { total: 0, activities: 0, errors: 0, today: 0 };

  return {
    logs,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1,
    stats,
  };
}

export async function clearExpiredLogsAction() {
  const role = await getUserRole();
  if (role !== "super-admin" && role !== "admin") {
    throw new Error("Unauthorized");
  }

  await pruneOldDeveloperLogs();
  return { success: true };
}

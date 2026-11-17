"use server";

import { db } from "@/db";
import { developerLogs, brands, epcInstallers, writerProfiles, users } from "@/db/schema";
import { getUserRole } from "@/lib/roles";
import { pruneOldDeveloperLogs } from "@/lib/developer-logger";
import { sql, eq, desc, and } from "drizzle-orm";

export type TimeframeOption = "1d" | "3d" | "7d";
export type LogTypeFilter = "all" | "user_activity" | "activity" | "error";

export interface GetLogsOptions {
  timeframe?: TimeframeOption;
  logType?: LogTypeFilter;
  roleFilter?: string;
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
  const roleFilter = options.roleFilter || "all";
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

  if (roleFilter !== "all") {
    conditions.push(eq(developerLogs.userRole, roleFilter));
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
        userActivities: sql<number>`count(*) filter (where log_type = 'user_activity')::int`,
        devActivities: sql<number>`count(*) filter (where log_type = 'activity')::int`,
        errors: sql<number>`count(*) filter (where log_type = 'error')::int`,
        today: sql<number>`count(*) filter (where created_at >= NOW() - INTERVAL '1 day')::int`,
      })
      .from(developerLogs)
      .where(sql`created_at >= NOW() - INTERVAL ${sql.raw(`'${intervalString}'`)}`),
  ]);

  const total = countResult[0]?.count || 0;
  const stats = statsResult[0] || {
    total: 0,
    userActivities: 0,
    devActivities: 0,
    errors: 0,
    today: 0,
  };

  // Enrich logs with brand/epc/writer avatar logos from Cloudflare R2
  const avatarMap: Record<string, string> = {};
  try {
    const [brandList, epcList, writerList, userList] = await Promise.all([
      db.select({ userId: brands.userId, name: brands.brandName, logo: brands.logoUrl }).from(brands),
      db.select({ userId: epcInstallers.userId, name: epcInstallers.companyName, logo: epcInstallers.logoUrl }).from(epcInstallers),
      db.select({ userId: writerProfiles.userId, name: writerProfiles.name, logo: writerProfiles.pictureUrl }).from(writerProfiles),
      db.select({ id: users.id, name: users.name, email: users.email, avatarUrl: users.avatarUrl }).from(users),
    ]);

    userList.forEach((u) => {
      if (u.avatarUrl) {
        if (u.id) avatarMap[u.id] = u.avatarUrl;
        if (u.name) avatarMap[u.name.toLowerCase().trim()] = u.avatarUrl;
        if (u.email) avatarMap[u.email.toLowerCase().trim()] = u.avatarUrl;
      }
    });

    brandList.forEach((b) => {
      if (b.logo) {
        if (b.userId) avatarMap[b.userId] = b.logo;
        if (b.name) avatarMap[b.name.toLowerCase().trim()] = b.logo;
        const u = userList.find((usr) => usr.id === b.userId);
        if (u?.name) avatarMap[u.name.toLowerCase().trim()] = b.logo;
        if (u?.email) avatarMap[u.email.toLowerCase().trim()] = b.logo;
      }
    });

    epcList.forEach((e) => {
      if (e.logo) {
        if (e.userId) avatarMap[e.userId] = e.logo;
        if (e.name) avatarMap[e.name.toLowerCase().trim()] = e.logo;
        const u = userList.find((usr) => usr.id === e.userId);
        if (u?.name) avatarMap[u.name.toLowerCase().trim()] = e.logo;
        if (u?.email) avatarMap[u.email.toLowerCase().trim()] = e.logo;
      }
    });

    writerList.forEach((w) => {
      if (w.logo) {
        if (w.userId) avatarMap[w.userId] = w.logo;
        if (w.name) avatarMap[w.name.toLowerCase().trim()] = w.logo;
        const u = userList.find((usr) => usr.id === w.userId);
        if (u?.name) avatarMap[u.name.toLowerCase().trim()] = w.logo;
        if (u?.email) avatarMap[u.email.toLowerCase().trim()] = w.logo;
      }
    });
  } catch (err) {
    console.warn("[DeveloperLogs] Avatar enrichment error:", err);
  }

  const enrichedLogs = logs.map((log) => {
    const resolvedAvatar =
      log.userAvatar ||
      (log.userId ? avatarMap[log.userId] : null) ||
      (log.userName ? avatarMap[log.userName.toLowerCase().trim()] : null) ||
      null;

    return {
      ...log,
      userAvatar: resolvedAvatar,
    };
  });

  return {
    logs: enrichedLogs,
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

"use server";

import { db } from "@/db";
import { developerLogs, brands, epcInstallers, writerProfiles, users } from "@/db/schema";
import { getUserRole } from "@/lib/roles";
import { pruneOldDeveloperLogs } from "@/lib/developer-logger";
import { sql, eq, desc, and, or } from "drizzle-orm";
import { createClerkClient } from "@clerk/nextjs/server";

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

/**
 * Automatically syncs recent user sign-ins and registrations from Clerk & DB
 * into developer_logs so that real user activity and velocity are always up to date.
 */
export async function syncUserAuthTelemetryToLogs(): Promise<void> {
  try {
    const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
    const clerkRes = await clerk.users.getUserList({ limit: 200 });

    const [dbUsers, brandList, epcList, writerList, existingLogs] = await Promise.all([
      db.select({ id: users.id, clerkId: users.clerkId, email: users.email, name: users.name, role: users.role, avatarUrl: users.avatarUrl }).from(users),
      db.select({ userId: brands.userId, name: brands.brandName, logo: brands.logoUrl }).from(brands),
      db.select({ userId: epcInstallers.userId, name: epcInstallers.companyName, logo: epcInstallers.logoUrl }).from(epcInstallers),
      db.select({ userId: writerProfiles.userId, name: writerProfiles.name, logo: writerProfiles.pictureUrl }).from(writerProfiles),
      db.select({
        recordId: developerLogs.recordId,
        action: developerLogs.action,
        createdAt: developerLogs.createdAt,
      })
      .from(developerLogs)
      .where(sql`created_at >= NOW() - INTERVAL '7 days'`),
    ]);

    // Build logo / avatar map
    const avatarMap: Record<string, string> = {};
    brandList.forEach((b) => {
      if (b.logo) {
        if (b.userId) avatarMap[b.userId] = b.logo;
        if (b.name) avatarMap[b.name.toLowerCase().trim()] = b.logo;
      }
    });
    epcList.forEach((e) => {
      if (e.logo) {
        if (e.userId) avatarMap[e.userId] = e.logo;
        if (e.name) avatarMap[e.name.toLowerCase().trim()] = e.logo;
      }
    });
    writerList.forEach((w) => {
      if (w.logo) {
        if (w.userId) avatarMap[w.userId] = w.logo;
        if (w.name) avatarMap[w.name.toLowerCase().trim()] = w.logo;
      }
    });
    dbUsers.forEach((u) => {
      if (u.avatarUrl) {
        if (u.id) avatarMap[u.id] = u.avatarUrl;
        if (u.clerkId) avatarMap[u.clerkId] = u.avatarUrl;
        if (u.name) avatarMap[u.name.toLowerCase().trim()] = u.avatarUrl;
        if (u.email) avatarMap[u.email.toLowerCase().trim()] = u.avatarUrl;
      }
    });

    // Purge redundant LOGIN / auth_sessions activity logs so developer logs focus purely on DB CRUD and system events
    await db.delete(developerLogs).where(
      or(
        eq(developerLogs.action, "LOGIN"),
        eq(developerLogs.tableName, "auth_sessions")
      )
    );

    // Match key by recordId_action_hour
    const existingKeySet = new Set(
      existingLogs.map((l) => `${l.recordId}_${l.action}_${new Date(l.createdAt).toISOString().slice(0, 13)}`)
    );

    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const toInsert: any[] = [];

    for (const cu of clerkRes.data) {
      const primaryEmail = cu.emailAddresses[0]?.emailAddress?.toLowerCase().trim();
      const dbUser = dbUsers.find(
        (u) => u.clerkId === cu.id || (primaryEmail && u.email?.toLowerCase() === primaryEmail)
      );

      const userName =
        dbUser?.name ||
        [cu.firstName, cu.lastName].filter(Boolean).join(" ") ||
        primaryEmail ||
        "User";

      const userRole = dbUser?.role || "user";
      const resolvedAvatar =
        dbUser?.avatarUrl ||
        (dbUser ? avatarMap[dbUser.id] : null) ||
        avatarMap[cu.id] ||
        avatarMap[userName.toLowerCase().trim()] ||
        (cu.hasImage ? cu.imageUrl : null) ||
        null;

      // 1. Process user registration (if registered within last 7 days)
      if (cu.createdAt && cu.createdAt >= sevenDaysAgo) {
        const regDate = new Date(cu.createdAt);
        const regKey = `${cu.id}_REGISTER_${regDate.toISOString().slice(0, 13)}`;
        if (!existingKeySet.has(regKey)) {
          existingKeySet.add(regKey);
          toInsert.push({
            logType: "user_activity" as const,
            action: "REGISTER",
            tableName: "users",
            recordId: cu.id,
            summary: `New user account registered: ${userName} (${userRole.toUpperCase()})`,
            userId: dbUser?.id || cu.id,
            userName,
            userRole,
            userAvatar: resolvedAvatar,
            metadata: {
              email: primaryEmail,
              registeredAt: regDate.toISOString(),
              source: "clerk_signup",
            },
            createdAt: regDate,
          });
        }
      }
    }

    if (toInsert.length > 0) {
      await db.insert(developerLogs).values(toInsert);
    }
  } catch (err) {
    console.warn("[DeveloperLogs] Telemetry sync warning:", err);
  }
}

export async function getDeveloperLogs(options: GetLogsOptions = {}) {
  const role = await getUserRole();
  if (role !== "super-admin" && role !== "admin") {
    throw new Error("Unauthorized: Developer logs require administrative privileges.");
  }

  // Sync real-time authentication events (logins, new registrations) before querying
  await syncUserAuthTelemetryToLogs();

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

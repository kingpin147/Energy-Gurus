import { db } from "@/db";
import { developerLogs, users } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { sql, eq, desc, and, gte } from "drizzle-orm";

export type LogType = "activity" | "user_activity" | "error";
export type LogAction =
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "WRITE"
  | "LOGIN"
  | "LOGOUT"
  | "SUBMISSION"
  | "INQUIRY"
  | "REVIEW"
  | "STATUS_CHANGE"
  | "API_ERROR"
  | "DB_ERROR"
  | "AUTH_ERROR"
  | string;

export interface LogParams {
  action: LogAction;
  logType?: LogType;
  tableName?: string;
  recordId?: string;
  summary: string;
  metadata?: Record<string, any>;
  user?: {
    id?: string;
    name?: string;
    role?: string;
    email?: string;
  };
}

export interface ErrorLogParams {
  action?: "API_ERROR" | "DB_ERROR" | "AUTH_ERROR" | string;
  summary: string;
  error?: any;
  tableName?: string;
  recordId?: string;
  metadata?: Record<string, any>;
  user?: {
    id?: string;
    name?: string;
    role?: string;
    email?: string;
  };
}

/**
 * Automatically prunes any logs older than 7 days.
 * Permanent 7-day retention: Keeps table slim and zero burden on DB.
 */
export async function pruneOldDeveloperLogs(): Promise<void> {
  try {
    await db.execute(sql`
      DELETE FROM "developer_logs" 
      WHERE "created_at" < NOW() - INTERVAL '7 days'
    `);
  } catch (err) {
    console.error("[DeveloperLogs] Pruning expired logs error:", err);
  }
}

/**
 * Non-blocking fire-and-forget activity logger for both developer/system and user actions.
 * Never throws, never blocks the caller request.
 */
export function logActivity(params: LogParams): void {
  // Prevent infinite logging loops on developer_logs table itself
  if (params.tableName === "developer_logs") return;

  (async () => {
    try {
      let userId = params.user?.id;
      let userName = params.user?.name;
      let userRole = params.user?.role;

      if (!userId || !userName || !userRole) {
        try {
          const authData = await auth();
          if (authData?.userId) {
            userId = userId || authData.userId;
            const [dbUser] = await db
              .select({ name: users.name, role: users.role, email: users.email })
              .from(users)
              .where(eq(users.clerkId, authData.userId))
              .limit(1);
            if (dbUser) {
              userName = userName || dbUser.name || dbUser.email;
              userRole = userRole || dbUser.role;
            }
          }
        } catch {
          // Running outside request context
        }
      }

      // Automatically determine user_activity vs system activity if not explicitly specified
      let resolvedType: LogType = params.logType || "activity";
      const act = params.action.toUpperCase();
      if (!params.logType) {
        if (["LOGIN", "LOGOUT", "SUBMISSION", "INQUIRY", "REVIEW", "AUTH"].includes(act)) {
          resolvedType = "user_activity";
        } else if (userRole && !["super-admin", "admin"].includes(userRole.toLowerCase())) {
          resolvedType = "user_activity";
        }
      }

      await db.insert(developerLogs).values({
        logType: resolvedType,
        action: params.action.toUpperCase(),
        tableName: params.tableName || null,
        recordId: params.recordId ? String(params.recordId) : null,
        summary: params.summary,
        userId: userId || null,
        userName: userName || "System / Guest",
        userRole: userRole || "guest",
        metadata: params.metadata || {},
      });
    } catch (e) {
      console.error("[DeveloperLogs] Failed to log activity:", e);
    }
  })();
}

/**
 * Convenience helper specifically for user actions (logins, submissions, profile updates)
 */
export function logUserActivity(params: LogParams): void {
  logActivity({
    ...params,
    logType: "user_activity",
  });
}

/**
 * Non-blocking fire-and-forget error logger.
 */
export function logError(params: ErrorLogParams): void {
  if (params.tableName === "developer_logs") return;

  (async () => {
    try {
      let userId = params.user?.id;
      let userName = params.user?.name;
      let userRole = params.user?.role;

      if (!userId || !userName || !userRole) {
        try {
          const authData = await auth();
          if (authData?.userId) {
            userId = userId || authData.userId;
            const [dbUser] = await db
              .select({ name: users.name, role: users.role, email: users.email })
              .from(users)
              .where(eq(users.clerkId, authData.userId))
              .limit(1);
            if (dbUser) {
              userName = userName || dbUser.name || dbUser.email;
              userRole = userRole || dbUser.role;
            }
          }
        } catch {
          // ignore
        }
      }

      const errorMeta: Record<string, any> = { ...(params.metadata || {}) };
      if (params.error) {
        if (params.error instanceof Error) {
          errorMeta.errorMessage = params.error.message;
          errorMeta.errorStack = params.error.stack;
          errorMeta.errorName = params.error.name;
        } else {
          errorMeta.errorDetails = typeof params.error === "object" ? JSON.stringify(params.error) : String(params.error);
        }
      }

      await db.insert(developerLogs).values({
        logType: "error",
        action: (params.action || "API_ERROR").toUpperCase(),
        tableName: params.tableName || null,
        recordId: params.recordId ? String(params.recordId) : null,
        summary: params.summary,
        userId: userId || null,
        userName: userName || "System",
        userRole: userRole || "system",
        metadata: errorMeta,
      });
    } catch (e) {
      console.error("[DeveloperLogs] Failed to log error:", e);
    }
  })();
}

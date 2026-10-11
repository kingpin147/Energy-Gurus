/**
 * Database and API Error Sanitization Utility
 *
 * Prevents raw database connection strings, SQL queries, table/column names,
 * and internal Postgres codes from leaking to the client.
 */

export function sanitizeDbError(error: unknown, fallbackMessage = "An unexpected error occurred. Please try again."): string {
  // Always log raw error server-side for diagnostics
  console.error("[ServerError]", error);

  if (!error) return fallbackMessage;

  if (typeof error === "string") {
    // Check if the string leaks DB syntax or internal details
    if (isDbInternalMessage(error)) {
      return fallbackMessage;
    }
    return error;
  }

  if (error instanceof Error) {
    const msg = error.message;

    // Check PostgreSQL error codes if attached (e.g., node-postgres or Neon)
    const pgCode = (error as any).code;
    if (pgCode) {
      switch (pgCode) {
        case "23505":
          return "A record with these unique details already exists.";
        case "23503":
          return "The requested operation references an item that does not exist.";
        case "23502":
          return "A required field was missing or invalid.";
        case "57014":
          return "The database operation timed out. Please try again shortly.";
        case "08001":
        case "08006":
          return "Database connection temporarily unavailable. Please try again shortly.";
        default:
          return fallbackMessage;
      }
    }

    // Known user-facing application errors
    if (
      msg.includes("Unauthorized") ||
      msg.includes("Insufficient permissions") ||
      msg.includes("Only Super Admins") ||
      msg.includes("System Protection") ||
      msg.includes("not found") ||
      msg.includes("required") ||
      msg.includes("must be") ||
      msg.includes("Invalid")
    ) {
      // Ensure it doesn't contain raw SQL keywords
      if (!isDbInternalMessage(msg)) {
        return msg;
      }
    }

    // Leaked SQL / connection errors
    if (isDbInternalMessage(msg)) {
      return fallbackMessage;
    }

    return fallbackMessage;
  }

  return fallbackMessage;
}

function isDbInternalMessage(msg: string): boolean {
  const lower = msg.toLowerCase();
  const dbKeywords = [
    "select ",
    "insert into",
    "update ",
    "delete from",
    "relation \"",
    "column \"",
    "violates unique constraint",
    "violates foreign key",
    "syntax error at",
    "neondb",
    "neon.tech",
    "postgresql",
    "drizzle-orm",
    "connection pool",
    "password authentication",
    "ssl syscall error",
    "terminating connection",
  ];
  return dbKeywords.some((keyword) => lower.includes(keyword));
}

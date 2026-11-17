"use server";

import { db } from "@/db";
import { monitoringRequests, users } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { logActivity, logError } from "@/lib/developer-logger";

export async function updateMonitoringStatus(id: string, status: "pending" | "contacted" | "active" | "rejected") {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return { success: false, error: "Unauthorized" };
    }

    const [user] = await db.select().from(users).where(eq(users.clerkId, clerkId));
    if (!user || (user.role !== "super-admin" && user.role !== "admin")) {
      return { success: false, error: "Forbidden: Admin access required" };
    }

    await db
      .update(monitoringRequests)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(monitoringRequests.id, id));

    logActivity({
      action: "UPDATE",
      tableName: "monitoring_requests",
      recordId: id,
      summary: `Updated solar monitoring inquiry status to ${status.toUpperCase()}`,
      user: { id: user.id, name: user.name || user.email, role: user.role },
      metadata: { newStatus: status, inquiryId: id },
    });

    revalidatePath("/dashboard/monitoring/requests");
    return { success: true };
  } catch (error) {
    console.error("updateMonitoringStatus error:", error);
    logError({
      action: "DB_ERROR",
      summary: "Failed to update monitoring request status",
      error,
      tableName: "monitoring_requests",
      recordId: id,
    });
    return { success: false, error: "Failed to update status" };
  }
}


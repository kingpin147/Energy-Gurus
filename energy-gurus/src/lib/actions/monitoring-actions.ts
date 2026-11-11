"use server";

import { db } from "@/db";
import { monitoringRequests, users } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function updateMonitoringStatus(id: string, status: "pending" | "contacted" | "active") {
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

    revalidatePath("/dashboard/monitoring/requests");
    return { success: true };
  } catch (error) {
    console.error("updateMonitoringStatus error:", error);
    return { success: false, error: "Failed to update status" };
  }
}

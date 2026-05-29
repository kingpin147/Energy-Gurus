"use server";

import { db } from "@/db";
import { notifications, users } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq, and, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getMyNotifications() {
    try {
        const { userId: clerkId } = await auth();
        if (!clerkId) return [];

        const [user] = await db.select().from(users).where(eq(users.clerkId, clerkId));
        if (!user) return [];

        return await db.select().from(notifications)
            .where(eq(notifications.userId, user.id))
            .orderBy(desc(notifications.createdAt))
            .limit(20);
    } catch (error) {
        console.error("getMyNotifications error:", error);
        return [];
    }
}

export async function markNotificationAsRead(id: string) {
    try {
        const { userId: clerkId } = await auth();
        if (!clerkId) return { success: false, message: "Unauthorized" };

        await db.update(notifications)
            .set({ isRead: true })
            .where(eq(notifications.id, id));

        revalidatePath("/[locale]/dashboard", "layout");
        return { success: true, message: "Notification read" };
    } catch (error) {
        console.error("markNotificationAsRead error:", error);
        return { success: false, message: "Failed to update notification" };
    }
}

export async function markAllNotificationsAsRead() {
    try {
        const { userId: clerkId } = await auth();
        if (!clerkId) return { success: false, message: "Unauthorized" };

        const [user] = await db.select().from(users).where(eq(users.clerkId, clerkId));
        if (!user) return { success: false, message: "User not found" };

        await db.update(notifications)
            .set({ isRead: true })
            .where(eq(notifications.userId, user.id));

        revalidatePath("/[locale]/dashboard", "layout");
        return { success: true, message: "All notifications read" };
    } catch (error) {
        console.error("markAllNotificationsAsRead error:", error);
        return { success: false, message: "Failed to update notifications" };
    }
}

export async function deleteNotification(id: string) {
    try {
        const { userId: clerkId } = await auth();
        if (!clerkId) return { success: false, message: "Unauthorized" };

        await db.delete(notifications).where(eq(notifications.id, id));

        revalidatePath("/[locale]/dashboard", "layout");
        return { success: true, message: "Notification deleted" };
    } catch (error) {
        console.error("deleteNotification error:", error);
        return { success: false, message: "Failed to delete notification" };
    }
}

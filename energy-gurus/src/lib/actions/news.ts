"use server";

import { db } from "@/db";
import { news } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath, revalidateTag } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { users } from "@/db/schema";

export async function createNews(formData: FormData) {
    try {
        const { userId: clerkId } = await auth();
        if (!clerkId) return { success: false, message: "Unauthorized" };

        const [user] = await db.select().from(users).where(eq(users.clerkId, clerkId));
        if (!user) return { success: false, message: "Unauthorized" };

        const title = formData.get("title") as string;
        const content = formData.get("content") as string;
        const category = formData.get("category") as string;
        const imageUrl = formData.get("imageUrl") as string;
        const isPublished = formData.get("isPublished") === "true";

        if (!title || !content || !category) {
            return { success: false, message: "Missing required fields" };
        }

        await db.insert(news).values({
            title,
            content,
            category,
            imageUrl: imageUrl || null,
            authorId: user.id,
            isPublished,
            publishedAt: isPublished ? new Date() : null,
        });

        revalidatePath("/dashboard/news");
        revalidatePath("/news");
        revalidateTag("news", {});
        
        return { success: true, message: "News created successfully" };
    } catch (error) {
        console.error("Failed to create news:", error);
        return { success: false, message: "Failed to create news" };
    }
}

export async function deleteNews(id: string) {
    try {
        await db.delete(news).where(eq(news.id, id));
        revalidatePath("/dashboard/news");
        revalidateTag("news", {});
        return { success: true, message: "News deleted successfully" };
    } catch (error) {
        console.error("Failed to delete news:", error);
        return { success: false, message: "Failed to delete news" };
    }
}

export async function toggleNewsStatus(id: string, isPublished: boolean) {
    try {
        await db.update(news).set({ isPublished }).where(eq(news.id, id));
        revalidatePath("/dashboard/news");
        revalidateTag("news", {});
        return { success: true, message: "News status updated successfully" };
    } catch (error) {
        console.error("Failed to update news status:", error);
        return { success: false, message: "Failed to update news status" };
    }
}

"use server";

import { db } from "@/db";
import { podcasts, liveQA } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath, revalidateTag } from "next/cache";

import { getUserRole } from "@/lib/roles";

async function isAdmin() {
    const role = await getUserRole();
    return role === 'super-admin' || role === 'admin';
}

export async function addPodcast(formData: FormData) {
    if (!await isAdmin()) return { success: false, message: "Unauthorized" };

    const title = formData.get("title")?.toString();
    const description = formData.get("description")?.toString();
    const youtubeUrl = formData.get("youtubeUrl")?.toString();
    const thumbnailUrl = formData.get("thumbnailUrl")?.toString();
    const guestName = formData.get("guestName")?.toString();
    const guestDesignation = formData.get("guestDesignation")?.toString();
    const category = formData.get("category")?.toString();

    if (!title || !youtubeUrl) {
        return { success: false, message: "Title and YouTube URL are required." };
    }

    try {
        await db.insert(podcasts).values({
            title,
            description,
            youtubeUrl,
            thumbnailUrl,
            guestName,
            guestDesignation,
            category
    });

        revalidateTag('podcasts', {});
        revalidateTag('homepage', {});
        revalidatePath("/dashboard/content", "page");
        revalidatePath("/podcast", "page");
        return { success: true, message: "Podcast added successfully" };
    } catch (error) {
        console.error("Failed to add podcast:", error);
        return { success: false, message: "Failed to add podcast. Please try again." };
    }
}

export async function deletePodcast(id: string) {
    if (!id) return { success: false, message: "Invalid ID" };
    if (!await isAdmin()) return { success: false, message: "Unauthorized" };

    try {
        await db.delete(podcasts).where(eq(podcasts.id, id));
        revalidateTag('podcasts', {});
        revalidateTag('homepage', {});
        revalidatePath("/dashboard/content", "page");
        revalidatePath("/podcast", "page");
        return { success: true, message: "Podcast deleted" };
    } catch (error) {
        console.error("Failed to delete podcast:", error);
        return { success: false, message: "Failed to delete podcast." };
    }
}

export async function addLiveQA(formData: FormData) {
    if (!await isAdmin()) return { success: false, message: "Unauthorized" };

    const topic = formData.get("topic")?.toString();
    const description = formData.get("description")?.toString();
    const youtubeUrl = formData.get("youtubeUrl")?.toString();
    const thumbnailUrl = formData.get("thumbnailUrl")?.toString();
    const expertName = formData.get("expertName")?.toString();
    const expertTitle = formData.get("expertTitle")?.toString();
    const expertPhotoUrl = formData.get("expertPhotoUrl")?.toString();
    const status = (formData.get("status")?.toString() as 'upcoming' | 'live' | 'archived') || 'upcoming';

    const dateVal = formData.get("sessionDate")?.toString();
    let sessionDate: Date | null = null;
    if (dateVal) {
        const d = new Date(dateVal);
        if (!Number.isNaN(d.getTime())) {
            sessionDate = d;
        }
    }

    if (!topic || !youtubeUrl) {
        return { success: false, message: "Topic and YouTube URL are required." };
    }

    try {
        await db.insert(liveQA).values({
            topic,
            description,
            youtubeUrl,
            thumbnailUrl,
            expertName,
            expertTitle,
            expertPhotoUrl,
            status,
            sessionDate
        });

        revalidateTag('live-qa', {});
        revalidateTag('homepage', {});
        revalidatePath("/dashboard/content", "page");
        revalidatePath("/live-qa", "page");
        return { success: true, message: "Live QA scheduled successfully" };
    } catch (error) {
        console.error("Failed to add Live QA:", error);
        return { success: false, message: "Failed to schedule Live QA." };
    }
}

export async function deleteLiveQA(id: string) {
    if (!id) return { success: false, message: "Invalid ID" };
    if (!await isAdmin()) return { success: false, message: "Unauthorized" };

    try {
        await db.delete(liveQA).where(eq(liveQA.id, id));
        revalidateTag('live-qa', {});
        revalidateTag('homepage', {});
        revalidatePath("/dashboard/content", "page");
        revalidatePath("/live-qa", "page");
        return { success: true, message: "Session deleted" };
    } catch (error) {
        console.error("Failed to delete Live QA:", error);
        return { success: false, message: "Failed to delete session." };
    }
}

export async function updateLiveQAStatus(id: string, status: 'upcoming' | 'live' | 'archived') {
    if (!id || !status) return { success: false, message: "Missing data" };
    if (!await isAdmin()) return { success: false, message: "Unauthorized" };

    try {
        await db.update(liveQA)
            .set({ status })
            .where(eq(liveQA.id, id));

        revalidateTag('live-qa', {});
        revalidateTag('homepage', {});
        revalidatePath("/dashboard/content", "page");
        revalidatePath("/live-qa", "page");

        return { success: true, message: `Status updated to ${status}` };
    } catch (error) {
        console.error("Failed to update Live QA status:", error);
        return { success: false, message: "Failed to update status." };
    }
}

export async function updatePodcast(id: string, formData: FormData) {
    if (!id) return { success: false, message: "Invalid ID" };
    if (!await isAdmin()) return { success: false, message: "Unauthorized" };

    const title = formData.get("title")?.toString();
    const description = formData.get("description")?.toString();
    const youtubeUrl = formData.get("youtubeUrl")?.toString();
    const thumbnailUrl = formData.get("thumbnailUrl")?.toString();
    const guestName = formData.get("guestName")?.toString();

    if (!title || !youtubeUrl) {
        return { success: false, message: "Title and YouTube URL are required." };
    }

    try {
        await db.update(podcasts)
            .set({
                title,
                description,
                youtubeUrl,
                thumbnailUrl: thumbnailUrl || null,
                guestName
            })
            .where(eq(podcasts.id, id));

        revalidateTag('podcasts', {});
        revalidateTag('homepage', {});
        revalidatePath("/dashboard/content", "page");
        revalidatePath("/podcast", "page");
        return { success: true, message: "Podcast updated successfully" };
    } catch (error) {
        console.error("Failed to update podcast:", error);
        return { success: false, message: "Failed to update podcast. Please try again." };
    }
}

"use server";

import { db } from "@/db";
import { podcasts, liveQA } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath, updateTag } from "next/cache";

import { getUserRole } from "@/lib/roles";

async function checkAdmin() {
    const role = await getUserRole();
    if (role !== 'super-admin' && role !== 'admin') {
        throw new Error("Unauthorized");
    }
}

export async function addPodcast(formData: FormData) {
    await checkAdmin();
    
    const title = formData.get("title")?.toString();
    const description = formData.get("description")?.toString();
    const youtubeUrl = formData.get("youtubeUrl")?.toString();
    const thumbnailUrl = formData.get("thumbnailUrl")?.toString();
    const guestName = formData.get("guestName")?.toString();

    if (!title || !youtubeUrl) {
        throw new Error("Title and YouTube URL are required.");
    }

    try {
        await db.insert(podcasts).values({
            title,
            description,
            youtubeUrl,
            thumbnailUrl,
            guestName,
        });

        updateTag('podcasts');
        updateTag('homepage');
        revalidatePath("/dashboard/content", "page");
        revalidatePath("/podcast", "page");
    } catch (error) {
        console.error("Failed to add podcast:", error);
        throw new Error("Failed to add podcast. Please try again.");
    }
}

export async function deletePodcast(id: string) {
    if (!id) return;
    await checkAdmin();
    try {
        await db.delete(podcasts).where(eq(podcasts.id, id));
        updateTag('podcasts');
        updateTag('homepage');
        revalidatePath("/dashboard/content", "page");
        revalidatePath("/podcast", "page");
    } catch (error) {
        console.error("Failed to delete podcast:", error);
        throw new Error("Failed to delete podcast.");
    }
}

export async function addLiveQA(formData: FormData) {
    await checkAdmin();
    
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
        throw new Error("Topic and YouTube URL are required.");
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

        updateTag('live-qa');
        updateTag('homepage');
        revalidatePath("/dashboard/content", "page");
        revalidatePath("/live-qa", "page");
    } catch (error) {
        console.error("Failed to add Live QA:", error);
        throw new Error("Failed to schedule Live QA.");
    }
}

export async function deleteLiveQA(id: string) {
    if (!id) return;
    await checkAdmin();
    try {
        await db.delete(liveQA).where(eq(liveQA.id, id));
        updateTag('live-qa');
        updateTag('homepage');
        revalidatePath("/dashboard/content", "page");
        revalidatePath("/live-qa", "page");
    } catch (error) {
        console.error("Failed to delete Live QA:", error);
        throw new Error("Failed to delete session.");
    }
}

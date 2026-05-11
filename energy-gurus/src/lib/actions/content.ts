"use server";

import { db } from "@/db";
import { podcasts, liveQA } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

import { getUserRole } from "@/lib/roles";
import { redis, CACHE_KEYS } from "@/lib/redis";

async function checkAdmin() {
    const role = await getUserRole();
    if (role !== 'super-admin' && role !== 'admin') {
        throw new Error("Unauthorized");
    }
}

export async function addPodcast(formData: FormData) {
    await checkAdmin();
    
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const youtubeUrl = formData.get("youtubeUrl") as string;
    const thumbnailUrl = formData.get("thumbnailUrl") as string;
    const guestName = formData.get("guestName") as string;

    await db.insert(podcasts).values({
        title,
        description,
        youtubeUrl,
        thumbnailUrl,
        guestName,
    });

    await redis.del(CACHE_KEYS.PODCASTS_LIST);
    revalidatePath("/dashboard/content");
}

export async function deletePodcast(id: string) {
    await checkAdmin();
    await db.delete(podcasts).where(eq(podcasts.id, id));
    await redis.del(CACHE_KEYS.PODCASTS_LIST);
    revalidatePath("/dashboard/content");
}

export async function addLiveQA(formData: FormData) {
    await checkAdmin();
    
    const topic = formData.get("topic") as string;
    const youtubeUrl = formData.get("youtubeUrl") as string;
    const thumbnailUrl = formData.get("thumbnailUrl") as string;
    const expertName = formData.get("expertName") as string;
    const sessionDate = formData.get("sessionDate") ? new Date(formData.get("sessionDate") as string) : null;

    await db.insert(liveQA).values({
        topic,
        youtubeUrl,
        thumbnailUrl,
        expertName,
        sessionDate
    });

    await redis.del(CACHE_KEYS.LIVE_QA_LIST);
    revalidatePath("/dashboard/content");
}

export async function deleteLiveQA(id: string) {
    await checkAdmin();
    await db.delete(liveQA).where(eq(liveQA.id, id));
    await redis.del(CACHE_KEYS.LIVE_QA_LIST);
    revalidatePath("/dashboard/content");
}

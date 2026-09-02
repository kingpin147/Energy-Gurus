"use server";

import { db } from "@/db";
import { ads } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath, revalidateTag } from "next/cache";
import { getUserRole } from "@/lib/roles";

export async function deleteAd(id: string) {
    const role = await getUserRole();
    if (role !== 'super-admin' && role !== 'admin') {
        return { success: false, message: "Unauthorized" };
    }

    try {
        await db.delete(ads).where(eq(ads.id, id));
        revalidatePath("/dashboard/ads", "page");
        revalidateTag("ads", {});
        return { success: true, message: "Ad deleted successfully" };
    } catch (error) {
        return { success: false, message: "Failed to delete ad" };
    }
}

export async function toggleAdStatus(id: string, newStatus: boolean) {
    const role = await getUserRole();
    if (role !== 'super-admin' && role !== 'admin') {
        throw new Error("Unauthorized");
    }

    await db.update(ads).set({ isActive: newStatus }).where(eq(ads.id, id));
    
    revalidatePath("/dashboard/ads", "page");
    revalidateTag("ads", {});
}

export async function createAd(formData: FormData) {
    const role = await getUserRole();
    if (role !== 'super-admin' && role !== 'admin') {
        throw new Error("Unauthorized");
    }

    const title = formData.get("title") as string;
    const imageUrl = formData.get("imageUrl") as string;
    const linkUrl = formData.get("linkUrl") as string;
    const placement = formData.get("placement") as string;
    const targetPage = formData.get("targetPage") as string;
    const isActive = formData.get("isActive") === "on";

    if (!title || !imageUrl || !placement || !targetPage) {
        throw new Error("Missing required fields");
    }

    await db.insert(ads).values({
        title,
        imageUrl,
        linkUrl: linkUrl || null,
        placement,
        targetPage,
        isActive
    });

    revalidatePath("/dashboard/ads", "page");
    revalidateTag("ads", {});
}

export async function updateAd(id: string, formData: FormData) {
    const role = await getUserRole();
    if (role !== 'super-admin' && role !== 'admin') {
        throw new Error("Unauthorized");
    }

    const title = formData.get("title") as string;
    const imageUrl = formData.get("imageUrl") as string;
    const linkUrl = formData.get("linkUrl") as string;
    const placement = formData.get("placement") as string;
    const targetPage = formData.get("targetPage") as string;
    const isActive = formData.get("isActive") === "on";

    if (!title || !imageUrl || !placement || !targetPage) {
        throw new Error("Missing required fields");
    }

    await db.update(ads).set({
        title,
        imageUrl,
        linkUrl: linkUrl || null,
        placement,
        targetPage,
        isActive,
        updatedAt: new Date()
    }).where(eq(ads.id, id));

    revalidatePath("/dashboard/ads", "page");
    revalidateTag("ads", {});
}

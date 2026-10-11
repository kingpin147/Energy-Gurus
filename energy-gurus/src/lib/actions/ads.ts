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
        return { success: false, message: "Unauthorized access" };
    }

    const title = (formData.get("title") as string)?.trim();
    const imageUrl = (formData.get("imageUrl") as string)?.trim();
    const linkUrl = (formData.get("linkUrl") as string)?.trim() || null;
    const placement = (formData.get("placement") as string)?.trim();
    const targetPage = (formData.get("targetPage") as string)?.trim() || "global";
    const isActive = formData.get("isActive") === "on" || formData.get("isActive") === "true";

    if (!title || !imageUrl || !placement || !targetPage) {
        return { success: false, message: "Missing required fields (title, image, placement, target page)" };
    }

    try {
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
        return { success: true, message: "Ad created successfully" };
    } catch (error) {
        console.error("createAd error:", error);
        return { success: false, message: "Failed to create ad. Please try again." };
    }
}

export async function updateAd(id: string, formData: FormData) {
    const role = await getUserRole();
    if (role !== 'super-admin' && role !== 'admin') {
        return { success: false, message: "Unauthorized access" };
    }

    const title = (formData.get("title") as string)?.trim();
    const imageUrl = (formData.get("imageUrl") as string)?.trim();
    const linkUrl = (formData.get("linkUrl") as string)?.trim() || null;
    const placement = (formData.get("placement") as string)?.trim();
    const targetPage = (formData.get("targetPage") as string)?.trim() || "global";
    const isActive = formData.get("isActive") === "on" || formData.get("isActive") === "true";

    if (!title || !imageUrl || !placement || !targetPage) {
        return { success: false, message: "Missing required fields" };
    }

    try {
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
        return { success: true, message: "Ad updated successfully" };
    } catch (error) {
        console.error("updateAd error:", error);
        return { success: false, message: "Failed to update ad. Please try again." };
    }
}

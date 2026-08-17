"use server";

import { db } from "@/db";
import { users, brands, epcInstallers, inquiries, reviews, epcProjects, products } from "@/db/schema";
import { eq, or } from "drizzle-orm";
import { clerkClient as createClerkClient, auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { getUserRole } from "@/lib/roles";
import { redis, CACHE_KEYS } from "@/lib/redis";
import { deleteFile, extractKeyFromUrl } from "@/lib/r2";

const adminWhitelist = ["nomiking0072012@gmail.com", "energygurusonline@gmail.com"];

export async function deleteUser(userId: string) {
    const { userId: currentClerkId } = await auth();
    const currentUserRole = await getUserRole();
    if (currentUserRole !== 'super-admin' && currentUserRole !== 'admin') {
        throw new Error("Unauthorized");
    }

    // Find the user to delete
    const [userToDelete] = await db.select().from(users).where(eq(users.id, userId));
    if (!userToDelete) return;

    // Protection 1: NEVER delete the currently logged-in user account!
    if (userToDelete.clerkId && userToDelete.clerkId === currentClerkId) {
        throw new Error("System Protection: You cannot delete your own logged-in account!");
    }

    // Protection 2: NEVER delete whitelisted Super Admin accounts or admin accounts without super-admin permission
    if (adminWhitelist.includes(userToDelete.email.toLowerCase())) {
        throw new Error("System Protection: Whitelisted super-admin accounts cannot be deleted!");
    }

    if (userToDelete.role === 'super-admin' || userToDelete.role === 'admin') {
        if (currentUserRole !== 'super-admin') {
            throw new Error("Only Super Admins can delete administrative accounts");
        }
    }

    // Delete from Clerk first
    if (userToDelete.clerkId) {
        try {
            const client = await createClerkClient();
            await client.users.deleteUser(userToDelete.clerkId);
        } catch (error: any) {
            console.warn("Could not delete user from Clerk (may not exist):", error.message);
        }
    }

    // 1. Gather all file URLs to delete from R2
    const fileUrlsToDelete: string[] = [];

    // EPC Files
    const [epc] = await db.select().from(epcInstallers).where(eq(epcInstallers.userId, userId));
    if (epc) {
        if (epc.logoUrl) fileUrlsToDelete.push(epc.logoUrl);
        if (epc.portfolio) fileUrlsToDelete.push(...epc.portfolio);
        if (epc.reviewVideos) fileUrlsToDelete.push(...epc.reviewVideos);
        if (epc.licenceDocuments) fileUrlsToDelete.push(...epc.licenceDocuments);

        const projects = await db.select().from(epcProjects).where(eq(epcProjects.epcId, epc.id));
        for (const p of projects) {
            if (p.images) fileUrlsToDelete.push(...p.images);
            if (p.videos) fileUrlsToDelete.push(...p.videos);
        }
    }

    // Brand Files
    const [brand] = await db.select().from(brands).where(eq(brands.userId, userId));
    if (brand) {
        if (brand.logoUrl) fileUrlsToDelete.push(brand.logoUrl);
        if (brand.photos) fileUrlsToDelete.push(...brand.photos);

        const brandProducts = await db.select().from(products).where(eq(products.brandId, brand.id));
        for (const prod of brandProducts) {
            if (prod.datasheetUrl) fileUrlsToDelete.push(prod.datasheetUrl);
            if (prod.imageUrl) fileUrlsToDelete.push(prod.imageUrl);
        }
    }

    // 2. Perform R2 Deletion
    for (const url of fileUrlsToDelete) {
        if (!url) continue;
        try {
            const key = extractKeyFromUrl(url);
            await deleteFile(key);
        } catch (error) {
            console.error(`Failed to delete R2 file: ${url}`, error);
        }
    }

    // Cleanup relations
    await db.delete(inquiries).where(or(eq(inquiries.senderId, userId), eq(inquiries.receiverId, userId)));
    await db.delete(reviews).where(eq(reviews.authorId, userId));
    await db.delete(brands).where(eq(brands.userId, userId));
    await db.delete(epcInstallers).where(eq(epcInstallers.userId, userId));

    // Clear Redis Caches
    try {
        const keysToDelete: string[] = [CACHE_KEYS.BRANDS_LIST, CACHE_KEYS.EPCS_LIST];
        if (brand) keysToDelete.push(CACHE_KEYS.BRAND_DETAILS(brand.id));
        if (epc) keysToDelete.push(CACHE_KEYS.EPC_DETAILS(epc.id));

        await redis.del(...keysToDelete);
    } catch (e) {
        console.error("Failed to clear profile caches during deletion:", e);
    }

    // Delete from DB
    await db.delete(users).where(eq(users.id, userId));

    revalidatePath("/", "layout");
}

export async function updateUserRole(userId: string, newRole: any) {
    const currentUserRole = await getUserRole();
    if (currentUserRole !== 'super-admin' && currentUserRole !== 'admin') {
        throw new Error("Unauthorized");
    }

    const [userToUpdate] = await db.select().from(users).where(eq(users.id, userId));
    if (!userToUpdate) throw new Error("User not found");

    if (adminWhitelist.includes(userToUpdate.email.toLowerCase())) {
        throw new Error("System Protection: Cannot change role of whitelisted super-admin");
    }

    if (newRole === 'admin' || newRole === 'super-admin' || userToUpdate.role === 'admin' || userToUpdate.role === 'super-admin') {
        if (currentUserRole !== 'super-admin') {
            throw new Error("Only Super Admins can manage administrative roles");
        }
    }

    // Update Clerk Metadata
    const client = await createClerkClient();
    await client.users.updateUserMetadata(userToUpdate.clerkId, {
        publicMetadata: { role: newRole }
    });

    // Update DB
    await db.update(users).set({ role: newRole }).where(eq(users.id, userId));

    revalidatePath("/", "layout");
}

export async function toggleUserStatus(userId: string) {
    const currentUserRole = await getUserRole();
    if (currentUserRole !== 'super-admin' && currentUserRole !== 'admin') {
        throw new Error("Unauthorized");
    }

    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) throw new Error("User not found");

    if (adminWhitelist.includes(user.email.toLowerCase())) {
        throw new Error("System Protection: Cannot deactivate whitelisted super-admin");
    }

    if (user.role === 'admin' || user.role === 'super-admin') {
        if (currentUserRole !== 'super-admin') {
            throw new Error("Only Super Admins can manage administrative account status");
        }
    }

    await db.update(users).set({ isActive: !user.isActive }).where(eq(users.id, userId));

    revalidatePath("/", "layout");

    try {
        const [brand] = await db.select({ id: brands.id }).from(brands).where(eq(brands.userId, userId));
        const [epc] = await db.select({ id: epcInstallers.id }).from(epcInstallers).where(eq(epcInstallers.userId, userId));

        const keysToDelete: string[] = [];
        if (brand) keysToDelete.push(CACHE_KEYS.BRAND_DETAILS(brand.id));
        if (epc) keysToDelete.push(CACHE_KEYS.EPC_DETAILS(epc.id));

        if (keysToDelete.length > 0) {
            await redis.del(...keysToDelete);
        }
    } catch (e) {
        console.error("Failed to clear profile caches:", e);
    }
}

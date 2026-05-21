"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, and, ne, or } from "drizzle-orm";
import { clerkClient as createClerkClient } from "@clerk/nextjs/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { getUserRole } from "@/lib/roles";
import { redis, CACHE_KEYS } from "@/lib/redis";
import { brands, epcInstallers, inquiries, reviews } from "@/db/schema";


export async function deleteUser(userId: string) {
    const currentUserRole = await getUserRole();
    if (currentUserRole !== 'super-admin' && currentUserRole !== 'admin') {
        throw new Error("Unauthorized");
    }

    // Find the user to delete
    const [userToDelete] = await db.select().from(users).where(eq(users.id, userId));
    if (!userToDelete) throw new Error("User not found");

    // Protection: Only super-admin can delete admins or super-admins
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

    // Manual cleanup of relations to avoid FK constraint errors 
    // (Backup in case DB cascade isn't synced yet)
    await db.delete(inquiries).where(or(eq(inquiries.senderId, userId), eq(inquiries.receiverId, userId)));
    await db.delete(reviews).where(eq(reviews.authorId, userId));
    await db.delete(brands).where(eq(brands.userId, userId));
    await db.delete(epcInstallers).where(eq(epcInstallers.userId, userId));

    // Clear Redis Caches for specific profiles before deleting from DB
    try {
        const [brand] = await db.select({ id: brands.id }).from(brands).where(eq(brands.userId, userId));
        const [epc] = await db.select({ id: epcInstallers.id }).from(epcInstallers).where(eq(epcInstallers.userId, userId));

        const keysToDelete: string[] = [CACHE_KEYS.BRANDS_LIST, CACHE_KEYS.EPCS_LIST];
        if (brand) keysToDelete.push(CACHE_KEYS.BRAND_DETAILS(brand.id));
        if (epc) keysToDelete.push(CACHE_KEYS.EPC_DETAILS(epc.id));

        await redis.del(...keysToDelete);
    } catch (e) {
        console.error("Failed to clear profile caches during deletion:", e);
    }

    // Delete from DB
    await db.delete(users).where(eq(users.id, userId));

    revalidatePath("/");
    revalidatePath("/[locale]", "layout");
    revalidatePath("/dashboard/users");
    revalidatePath("/[locale]/epcs", "layout");
    revalidatePath("/[locale]/brands", "layout");
    revalidateTag("homepage", {});
    revalidateTag("brands", {});
    revalidateTag("epcs", {});
}

export async function updateUserRole(userId: string, newRole: any) {
    const currentUserRole = await getUserRole();
    if (currentUserRole !== 'super-admin' && currentUserRole !== 'admin') {
        throw new Error("Unauthorized");
    }

    const [userToUpdate] = await db.select().from(users).where(eq(users.id, userId));
    if (!userToUpdate) throw new Error("User not found");

    // Protection: Only super-admin can promote/demote admins
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

    revalidatePath("/dashboard/users");
}

export async function toggleUserStatus(userId: string) {
    const currentUserRole = await getUserRole();
    if (currentUserRole !== 'super-admin' && currentUserRole !== 'admin') {
        throw new Error("Unauthorized");
    }

    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) throw new Error("User not found");

    // Protection: Only super-admin can disable other admins
    if (user.role === 'admin' || user.role === 'super-admin') {
        if (currentUserRole !== 'super-admin') {
            throw new Error("Only Super Admins can manage administrative account status");
        }
    }

    await db.update(users).set({ isActive: !user.isActive }).where(eq(users.id, userId));


    revalidatePath("/");
    revalidatePath("/[locale]", "layout");
    revalidatePath("/dashboard/users");
    revalidatePath("/[locale]/epcs", "layout");
    revalidatePath("/[locale]/brands", "layout");
    revalidateTag("homepage", {});
    revalidateTag("brands", {});
    revalidateTag("epcs", {});

    // Clear Redis Caches for specific profiles
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

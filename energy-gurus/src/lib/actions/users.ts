"use server";

import { db } from "@/db";
import { users, brands, epcInstallers, writerProfiles, inquiries, reviews, epcProjects, products } from "@/db/schema";
import { eq, or } from "drizzle-orm";
import { clerkClient as createClerkClient, auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { getUserRole } from "@/lib/roles";
import { deleteFile, extractKeyFromUrl } from "@/lib/r2";
import { logActivity, logError } from "@/lib/developer-logger";

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

    // Delete from DB
    await db.delete(users).where(eq(users.id, userId));

    logActivity({
        action: "DELETE",
        tableName: "users",
        recordId: userId,
        summary: `Deleted user profile ${userToDelete.name || userToDelete.email} (${userToDelete.role})`,
        metadata: { email: userToDelete.email, role: userToDelete.role, clerkId: userToDelete.clerkId },
    });

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

    logActivity({
        action: "UPDATE",
        tableName: "users",
        recordId: userId,
        summary: `Updated user role for ${userToUpdate.name || userToUpdate.email} to ${newRole}`,
        metadata: { previousRole: userToUpdate.role, newRole, email: userToUpdate.email },
    });

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

    const newStatus = !user.isActive;
    await db.update(users).set({ isActive: newStatus }).where(eq(users.id, userId));

    logActivity({
        action: "UPDATE",
        tableName: "users",
        recordId: userId,
        summary: `${newStatus ? "Activated" : "Suspended"} user account ${user.name || user.email}`,
        metadata: { previousStatus: user.isActive, newStatus, email: user.email },
    });

    revalidatePath("/dashboard/users");
    revalidatePath("/", "layout");

    return { success: true, isActive: newStatus };
}

export async function recordUserHeartbeat() {
    try {
        const { userId: clerkId } = await auth();
        if (!clerkId) return { success: false };

        await db.update(users)
            .set({ updatedAt: new Date() })
            .where(eq(users.clerkId, clerkId));

        return { success: true };
    } catch {
        return { success: false };
    }
}

/**
 * Updates the authenticated user's profile avatar URL in PostgreSQL and Clerk metadata.
 * Also logs user activity in developer_logs.
 */
export async function updateUserAvatar(avatarUrl: string | null) {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
        throw new Error("Unauthorized. Please log in to update your avatar.");
    }

    // 1. Update or create user record in PostgreSQL
    const [existingUser] = await db.select().from(users).where(eq(users.clerkId, clerkId)).limit(1);

    if (existingUser) {
        await db.update(users)
            .set({ avatarUrl: avatarUrl || null, updatedAt: new Date() })
            .where(eq(users.id, existingUser.id));
    } else {
        // If user is whitelisted admin or newly signed up
        try {
            const client = await createClerkClient();
            const cu = await client.users.getUser(clerkId);
            const email = cu.emailAddresses[0]?.emailAddress;
            if (email) {
                await db.insert(users).values({
                    clerkId,
                    email,
                    name: `${cu.firstName || ""} ${cu.lastName || ""}`.trim() || email,
                    avatarUrl: avatarUrl || null,
                    role: "super-admin",
                }).onConflictDoUpdate({
                    target: users.email,
                    set: { avatarUrl: avatarUrl || null, clerkId, updatedAt: new Date() }
                });
            }
        } catch (syncErr) {
            console.warn("[Users] Could not create DB user for Clerk account:", syncErr);
        }
    }

    // 2. Sync avatar URL into Clerk publicMetadata so client useUser() reads it instantly
    try {
        const client = await createClerkClient();
        await client.users.updateUserMetadata(clerkId, {
            publicMetadata: {
                avatarUrl: avatarUrl || null,
                r2AvatarUrl: avatarUrl || null,
            }
        });
    } catch (clerkErr) {
        console.warn("[Users] Failed to update Clerk publicMetadata:", clerkErr);
    }

    // 3. Log user activity in developer logs
    logActivity({
        action: "UPDATE",
        logType: "user_activity",
        tableName: "users",
        recordId: existingUser?.id || clerkId,
        summary: avatarUrl ? `User updated profile avatar image` : `User removed profile avatar image`,
        metadata: {
            avatarUrl,
            clerkId,
            email: existingUser?.email,
        },
        user: {
            id: existingUser?.id || clerkId,
            name: existingUser?.name || "User",
            role: existingUser?.role || "user",
            email: existingUser?.email,
        }
    });

    revalidatePath("/", "layout");
    revalidatePath("/dashboard", "layout");
    revalidatePath("/dashboard/users");
    revalidatePath("/dashboard/developer-logs");

    return { success: true, avatarUrl };
}

/**
 * Fetches the currently authenticated user's avatar from PostgreSQL or associated entities.
 */
export async function getCurrentUserAvatar(): Promise<string | null> {
    try {
        const { userId: clerkId } = await auth();
        if (!clerkId) return null;

        const [dbUser] = await db.select({ avatarUrl: users.avatarUrl }).from(users).where(eq(users.clerkId, clerkId)).limit(1);
        if (dbUser?.avatarUrl) return dbUser.avatarUrl;

        // Check if user is linked to an EPC, Brand, or Writer profile
        const [brand, epc, writer] = await Promise.all([
            db.select({ logo: brands.logoUrl }).from(brands).innerJoin(users, eq(brands.userId, users.id)).where(eq(users.clerkId, clerkId)).limit(1),
            db.select({ logo: epcInstallers.logoUrl }).from(epcInstallers).innerJoin(users, eq(epcInstallers.userId, users.id)).where(eq(users.clerkId, clerkId)).limit(1),
            db.select({ logo: writerProfiles.pictureUrl }).from(writerProfiles).innerJoin(users, eq(writerProfiles.userId, users.id)).where(eq(users.clerkId, clerkId)).limit(1),
        ]);

        return brand[0]?.logo || epc[0]?.logo || writer[0]?.logo || null;
    } catch {
        return null;
    }
}

"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, and, ne } from "drizzle-orm";
import { auth, createClerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

async function getAuthRole() {
    const { sessionClaims } = await auth();
    return (sessionClaims?.metadata as { role?: string })?.role || "user";
}

export async function deleteUser(userId: string) {
    const currentUserRole = await getAuthRole();
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
    await clerkClient.users.deleteUser(userToDelete.clerkId);

    // Delete from DB
    await db.delete(users).where(eq(users.id, userId));

    revalidatePath("/dashboard/users");
}

export async function updateUserRole(userId: string, newRole: any) {
    const currentUserRole = await getAuthRole();
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
    await clerkClient.users.updateUserMetadata(userToUpdate.clerkId, {
        publicMetadata: { role: newRole }
    });

    // Update DB
    await db.update(users).set({ role: newRole }).where(eq(users.id, userId));

    revalidatePath("/dashboard/users");
}

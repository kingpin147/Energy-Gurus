"use server";

import { db } from "@/db";
import { invitations, users, UserRole } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { auth, createClerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

export async function createInvitation(email: string, role: UserRole) {
    const { sessionClaims } = await auth();
    const currentRole = (sessionClaims?.metadata as { role?: string })?.role || "user";
    
    if (currentRole !== 'super-admin' && currentRole !== 'admin') {
        throw new Error("Unauthorized");
    }

    await db.insert(invitations).values({
        email: email.toLowerCase(),
        role
    }).onConflictDoUpdate({
        target: invitations.email,
        set: { role }
    });

    revalidatePath("/dashboard/users");
}

export async function checkAndApplyInvitation(userId: string, email: string) {
    const [invitation] = await db.select().from(invitations).where(eq(invitations.email, email.toLowerCase()));
    
    if (invitation) {
        // Update Clerk
        await clerkClient.users.updateUserMetadata(userId, {
            publicMetadata: { role: invitation.role }
        });

        // Update local DB user if exists
        await db.update(users).set({ role: invitation.role }).where(eq(users.clerkId, userId));

        // Delete invitation
        await db.delete(invitations).where(eq(invitations.id, invitation.id));
        
        return invitation.role;
    }
    
    return null;
}

export async function isUserAllowed(email: string, clerkId?: string, name?: string) {
    // 1. Check if they are already in the users table
    const [dbUser] = await db.select().from(users).where(eq(users.email, email.toLowerCase()));
    if (dbUser) return true;

    // 2. Check if they have a pending invitation
    const [invitation] = await db.select().from(invitations).where(eq(invitations.email, email.toLowerCase()));
    
    // 3. Hardcoded super-admin whitelist for initial setup
    const whitelist = ["nomiking0072012@gmail.com", "energygurusonline@gmail.com"];
    const isWhitelisted = whitelist.includes(email.toLowerCase());

    if (invitation || isWhitelisted) {
        // Automatically create them in the DB if they don't exist yet but are allowed
        if (clerkId) {
            const role = isWhitelisted ? 'super-admin' : invitation?.role || 'user';
            try {
                await db.insert(users).values({
                    clerkId,
                    email: email.toLowerCase(),
                    name: name || email.split("@")[0],
                    role: role as UserRole
                }).onConflictDoNothing();
            } catch (e) {
                console.error("Failed to auto-create allowed user:", e);
            }
        }
        return true;
    }

    return false;
}


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

export async function isUserAllowed(email: string) {
    // 1. Check if they are already in the users table
    const [dbUser] = await db.select().from(users).where(eq(users.email, email.toLowerCase()));
    if (dbUser) return true;

    // 2. Check if they have a pending invitation
    const [invitation] = await db.select().from(invitations).where(eq(invitations.email, email.toLowerCase()));
    if (invitation) return true;

    // 3. Hardcoded super-admin whitelist for initial setup
    const whitelist = ["nomiking0072012@gmail.com", "energygurusonline@gmail.com"];
    if (whitelist.includes(email.toLowerCase())) return true;

    return false;
}


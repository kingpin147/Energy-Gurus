"use server";

import { db } from "@/db";
import { invitations, users, UserRole } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createClerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { getUserRole } from "@/lib/roles";
import { sendInvitationEmail } from "@/lib/mail";

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

export async function createInvitation(email: string, role: UserRole) {
    const currentRole = await getUserRole();

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

    let emailSent = false;
    try {
        await sendInvitationEmail(email, role);
        emailSent = true;
    } catch (e: any) {
        console.error("Failed to send invitation email:", e?.message || e);
    }

    revalidatePath("/dashboard/users");
    return { emailSent };
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
            const role = isWhitelisted ? 'super-admin' : invitation?.role || 'epc';
            try {
                await db.insert(users).values({
                    clerkId,
                    email: email.toLowerCase(),
                    name: name || email.split("@")[0],
                    role: role as UserRole
                }).onConflictDoNothing();

                // ✅ Auto-cleanup: remove the invitation now that the user has registered
                if (invitation) {
                    await db.delete(invitations).where(eq(invitations.id, invitation.id));
                }
            } catch (e) {
                console.error("Failed to auto-create allowed user:", e);
            }
        }
        return true;
    }

    return false;
}

export async function bulkInvite(invites: { email: string; role: UserRole }[]) {
    const currentRole = await getUserRole();

    if (currentRole !== 'super-admin' && currentRole !== 'admin') {
        throw new Error("Unauthorized");
    }

    let emailsSent = 0;
    let emailsFailed = 0;

    for (const invite of invites) {
        if (!invite.email || !invite.role) continue;
        await db.insert(invitations).values({
            email: invite.email.toLowerCase().trim(),
            role: invite.role
        }).onConflictDoUpdate({
            target: invitations.email,
            set: { role: invite.role }
        });

        try {
            await sendInvitationEmail(invite.email, invite.role);
            emailsSent++;
        } catch (e: any) {
            emailsFailed++;
            console.error(`Failed to send bulk invitation email to ${invite.email}:`, e?.message || e);
        }
    }

    revalidatePath("/dashboard/users");
    return { emailsSent, emailsFailed, total: invites.length };
}

export async function deleteInvitation(id: string) {
    const currentRole = await getUserRole();
    if (currentRole !== 'super-admin' && currentRole !== 'admin') {
        throw new Error("Unauthorized");
    }

    await db.delete(invitations).where(eq(invitations.id, id));
    revalidatePath("/dashboard/users");
}

export async function resendInvitation(email: string, role: UserRole) {
    return createInvitation(email, role);
}


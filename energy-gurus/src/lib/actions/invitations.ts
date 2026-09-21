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

    revalidatePath("/dashboard/users", "layout");
    return { emailSent };
}

export async function checkAndApplyInvitation(userId: string, email: string) {
    const lowerEmail = email.toLowerCase();
    const [invitation] = await db.select().from(invitations).where(eq(invitations.email, lowerEmail));

    if (invitation) {
        // Update Clerk metadata
        try {
            await clerkClient.users.updateUserMetadata(userId, {
                publicMetadata: { role: invitation.role }
            });
        } catch (err) {
            console.error("Failed to update Clerk metadata:", err);
        }

        // Upsert local DB user
        await db.insert(users).values({
            clerkId: userId,
            email: lowerEmail,
            name: lowerEmail.split("@")[0],
            role: invitation.role,
            isActive: true
        }).onConflictDoUpdate({
            target: users.email,
            set: { role: invitation.role, clerkId: userId, isActive: true }
        });

        // Delete consumed invitation
        await db.delete(invitations).where(eq(invitations.id, invitation.id));

        return invitation.role;
    }

    return null;
}

export async function isUserAllowed(email: string, clerkId?: string, name?: string) {
    const lowerEmail = email.toLowerCase();

    // 1. Check if they are already in the users table
    const [dbUser] = await db.select().from(users).where(eq(users.email, lowerEmail));
    if (dbUser) {
        if (clerkId && dbUser.clerkId !== clerkId) {
            await db.update(users).set({ clerkId }).where(eq(users.id, dbUser.id));
        }
        return true;
    }

    // 2. Check if they have a pending invitation
    const [invitation] = await db.select().from(invitations).where(eq(invitations.email, lowerEmail));

    // 3. Hardcoded super-admin whitelist for initial setup
    const whitelist = ["nomiking0072012@gmail.com", "energygurusonline@gmail.com"];
    const isWhitelisted = whitelist.includes(lowerEmail);

    if (invitation || isWhitelisted) {
        // Automatically create them in the DB if they don't exist yet but are allowed
        if (clerkId) {
            const role = isWhitelisted ? 'super-admin' : invitation?.role || 'epc';
            try {
                await db.insert(users).values({
                    clerkId,
                    email: lowerEmail,
                    name: name || lowerEmail.split("@")[0],
                    role: role as UserRole,
                    isActive: true
                }).onConflictDoUpdate({
                    target: users.email,
                    set: { role: role as UserRole, clerkId, isActive: true }
                });

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

    revalidatePath("/dashboard/users", "layout");
    return { emailsSent, emailsFailed, total: invites.length };
}

export async function deleteInvitation(id: string) {
    const currentRole = await getUserRole();
    if (currentRole !== 'super-admin' && currentRole !== 'admin') {
        throw new Error("Unauthorized");
    }

    await db.delete(invitations).where(eq(invitations.id, id));
    revalidatePath("/dashboard/users", "layout");
}

export async function resendInvitation(email: string, role: UserRole) {
    return createInvitation(email, role);
}


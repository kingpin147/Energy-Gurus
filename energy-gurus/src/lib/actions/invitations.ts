"use server";

import { db } from "@/db";
import { invitations, users, UserRole, writerProfiles, epcInstallers, brands } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { createClerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { getUserRole } from "@/lib/roles";
import { sendInvitationEmail } from "@/lib/mail";
import { invitationSchema } from "@/lib/validations/schemas";
import { sanitizeDbError } from "@/lib/utils/errors";

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

export async function createInvitation(email: string, role: UserRole) {
    try {
        const currentRole = await getUserRole();

        if (currentRole !== 'super-admin' && currentRole !== 'admin') {
            return { success: false, message: "Unauthorized. Admin access required." };
        }

        const validated = invitationSchema.safeParse({ email, role });
        if (!validated.success) {
            return { success: false, message: validated.error.issues[0]?.message || "Invalid invitation data" };
        }

        await db.insert(invitations).values({
            email: validated.data.email.toLowerCase().trim(),
            role: validated.data.role
        }).onConflictDoUpdate({
            target: invitations.email,
            set: { role: validated.data.role }
        });

        let emailSent = false;
        try {
            await sendInvitationEmail(validated.data.email, validated.data.role);
            emailSent = true;
        } catch (e) {
            console.error("Failed to send invitation email:", e);
        }

        revalidatePath("/dashboard/users", "layout");
        return { success: true, emailSent };
    } catch (error) {
        const cleanMsg = sanitizeDbError(error, "Failed to create invitation.");
        return { success: false, message: cleanMsg };
    }
}

export async function checkAndApplyInvitation(userId: string, email: string) {
    const lowerEmail = email.toLowerCase().trim();
    const [invitation] = await db.select().from(invitations).where(
        sql`LOWER(TRIM(${invitations.email})) = ${lowerEmail}`
    );

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
        const [upsertedUser] = await db.insert(users).values({
            clerkId: userId,
            email: lowerEmail,
            name: lowerEmail.split("@")[0],
            role: invitation.role,
            isActive: true
        }).onConflictDoUpdate({
            target: users.email,
            set: { role: invitation.role, clerkId: userId, isActive: true }
        }).returning();

        if (upsertedUser) {
            if (invitation.role === 'writer') {
                await db.insert(writerProfiles).values({
                    userId: upsertedUser.id,
                    name: upsertedUser.name || lowerEmail.split("@")[0],
                    designation: "Contributing Columnist",
                    status: "approved"
                }).onConflictDoNothing();
            } else if (invitation.role === 'epc') {
                await db.insert(epcInstallers).values({
                    userId: upsertedUser.id,
                    companyName: upsertedUser.name || "Solar EPC Installer",
                    email: upsertedUser.email,
                    isVerified: true
                }).onConflictDoNothing();
            } else if (invitation.role === 'brand') {
                await db.insert(brands).values({
                    userId: upsertedUser.id,
                    brandName: upsertedUser.name || "Solar Brand",
                    customerCareEmail: upsertedUser.email,
                    status: "live",
                    isVerified: true
                }).onConflictDoNothing();
            }
        }

        // Delete consumed invitation
        await db.delete(invitations).where(eq(invitations.id, invitation.id));

        return invitation.role;
    }

    return null;
}

export async function isUserAllowed(email: string, clerkId?: string, name?: string) {
    const lowerEmail = email.toLowerCase().trim();

    // 1. Check if they are already in the users table
    const [dbUser] = await db.select().from(users).where(
        sql`LOWER(TRIM(${users.email})) = ${lowerEmail}`
    );
    if (dbUser) {
        if (!dbUser.isActive) {
            return false;
        }
        if (clerkId && dbUser.clerkId !== clerkId) {
            await db.update(users).set({ clerkId }).where(eq(users.id, dbUser.id));
        }
        // User is registered and allowed — clean up any lingering invitation for this email
        await db.delete(invitations).where(
            sql`LOWER(TRIM(${invitations.email})) = ${lowerEmail}`
        );
        return true;
    }

    // 2. Check if they have a pending invitation
    const [invitation] = await db.select().from(invitations).where(
        sql`LOWER(TRIM(${invitations.email})) = ${lowerEmail}`
    );

    // 3. Hardcoded super-admin whitelist for initial setup
    const whitelist = ["nomiking0072012@gmail.com", "energygurusonline@gmail.com"];
    const isWhitelisted = whitelist.includes(lowerEmail);

    if (invitation || isWhitelisted) {
        // Automatically create them in the DB if they don't exist yet but are allowed
        if (clerkId) {
            const role: UserRole = isWhitelisted ? 'super-admin' : invitation!.role;
            try {
                const [upsertedUser] = await db.insert(users).values({
                    clerkId,
                    email: lowerEmail,
                    name: name || lowerEmail.split("@")[0],
                    role,
                    isActive: true
                }).onConflictDoUpdate({
                    target: users.email,
                    set: { role, clerkId, isActive: true }
                }).returning();

                if (upsertedUser && invitation) {
                    if (invitation.role === 'writer') {
                        await db.insert(writerProfiles).values({
                            userId: upsertedUser.id,
                            name: upsertedUser.name || lowerEmail.split("@")[0],
                            designation: "Contributing Columnist",
                            status: "approved"
                        }).onConflictDoNothing();
                    } else if (invitation.role === 'epc') {
                        await db.insert(epcInstallers).values({
                            userId: upsertedUser.id,
                            companyName: upsertedUser.name || "Solar EPC Installer",
                            email: upsertedUser.email,
                            isVerified: true
                        }).onConflictDoNothing();
                    } else if (invitation.role === 'brand') {
                        await db.insert(brands).values({
                            userId: upsertedUser.id,
                            brandName: upsertedUser.name || "Solar Brand",
                            customerCareEmail: upsertedUser.email,
                            status: "live",
                            isVerified: true
                        }).onConflictDoNothing();
                    }

                    // Delete consumed invitation
                    await db.delete(invitations).where(eq(invitations.id, invitation.id));

                    // Sync Clerk metadata
                    try {
                        await clerkClient.users.updateUserMetadata(clerkId, {
                            publicMetadata: { role: invitation.role }
                        });
                    } catch (metaErr) {
                        console.error("Failed to update Clerk metadata in isUserAllowed:", metaErr);
                    }
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

/**
 * Checks all pending invitations against:
 * 1. Users already active in DB
 * 2. Clerk accounts created directly (via email code / OTP, password, or SSO)
 * 3. Matched name / identity (e.g. invited via work email but signed in with personal Gmail)
 * 
 * Automatically activates the user in DB with their assigned role and removes them from the pending invitations list.
 */
export async function syncPendingInvitations() {
    try {
        const allInvites = await db.select().from(invitations);
        if (allInvites.length === 0) return { success: true, removedCount: 0 };

        const allDbUsers = await db.select().from(users);
        const allClerkRes = await clerkClient.users.getUserList({ limit: 500 });
        const allClerkUsers = allClerkRes.data;

        let removedCount = 0;

        for (const inv of allInvites) {
            const invEmail = inv.email.toLowerCase().trim();

            // 1. Check if user already exists in DB users table
            const dbUser = allDbUsers.find(u => u.email.toLowerCase().trim() === invEmail);
            if (dbUser) {
                // User is already active in database, remove stale pending invitation
                await db.delete(invitations).where(eq(invitations.id, inv.id));
                removedCount++;
                continue;
            }

            // 2. Check if user exists in Clerk by email address (logged in directly via code/password)
            const clerkUser = allClerkUsers.find(cu =>
                cu.emailAddresses.some(e => e.emailAddress.toLowerCase().trim() === invEmail)
            );

            if (clerkUser) {
                const primaryEmail = (clerkUser.emailAddresses.find(e => e.id === clerkUser.primaryEmailAddressId)?.emailAddress || invEmail).toLowerCase().trim();
                const userName = clerkUser.fullName || `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || invEmail.split('@')[0];

                const [newDbUser] = await db.insert(users).values({
                    clerkId: clerkUser.id,
                    email: primaryEmail,
                    name: userName,
                    role: inv.role,
                    isActive: true
                }).onConflictDoUpdate({
                    target: users.email,
                    set: { role: inv.role, clerkId: clerkUser.id, isActive: true }
                }).returning();

                if (newDbUser) {
                    if (inv.role === 'writer') {
                        await db.insert(writerProfiles).values({
                            userId: newDbUser.id,
                            name: newDbUser.name || userName,
                            designation: "Contributing Columnist",
                            status: "approved"
                        }).onConflictDoNothing();
                    } else if (inv.role === 'epc') {
                        await db.insert(epcInstallers).values({
                            userId: newDbUser.id,
                            companyName: newDbUser.name || "Solar EPC Installer",
                            email: newDbUser.email,
                            isVerified: true
                        }).onConflictDoNothing();
                    } else if (inv.role === 'brand') {
                        await db.insert(brands).values({
                            userId: newDbUser.id,
                            brandName: newDbUser.name || "Solar Brand",
                            customerCareEmail: newDbUser.email,
                            status: "live",
                            isVerified: true
                        }).onConflictDoNothing();
                    }
                }

                await clerkClient.users.updateUserMetadata(clerkUser.id, {
                    publicMetadata: { role: inv.role }
                });

                await db.delete(invitations).where(eq(invitations.id, inv.id));
                removedCount++;
                continue;
            }

            // 3. Name/Identity match (e.g., user was invited to company email but logged in with personal account)
            const invPrefix = invEmail.split("@")[0].replace(/[._-]/g, " ").trim().toLowerCase();
            if (invPrefix.length >= 4) {
                const nameMatch = allClerkUsers.find(cu => {
                    const fullName = `${cu.firstName || ""} ${cu.lastName || ""}`.trim().toLowerCase();
                    return fullName === invPrefix || (cu.firstName && cu.lastName && invPrefix.includes(cu.firstName.toLowerCase()) && invPrefix.includes(cu.lastName.toLowerCase()));
                });

                if (nameMatch) {
                    const primaryEmail = (nameMatch.emailAddresses[0]?.emailAddress || invEmail).toLowerCase().trim();
                    const userName = `${nameMatch.firstName || ''} ${nameMatch.lastName || ''}`.trim() || invEmail.split('@')[0];

                    const [newDbUser] = await db.insert(users).values({
                        clerkId: nameMatch.id,
                        email: primaryEmail,
                        name: userName,
                        role: inv.role,
                        isActive: true
                    }).onConflictDoUpdate({
                        target: users.email,
                        set: { role: inv.role, clerkId: nameMatch.id, isActive: true }
                    }).returning();

                    if (newDbUser) {
                        if (inv.role === 'writer') {
                            await db.insert(writerProfiles).values({
                                userId: newDbUser.id,
                                name: newDbUser.name || userName,
                                designation: "Contributing Columnist",
                                status: "approved"
                            }).onConflictDoNothing();
                        } else if (inv.role === 'epc') {
                            await db.insert(epcInstallers).values({
                                userId: newDbUser.id,
                                companyName: newDbUser.name || "Solar EPC Installer",
                                email: newDbUser.email,
                                isVerified: true
                            }).onConflictDoNothing();
                        } else if (inv.role === 'brand') {
                            await db.insert(brands).values({
                                userId: newDbUser.id,
                                brandName: newDbUser.name || "Solar Brand",
                                customerCareEmail: newDbUser.email,
                                status: "live",
                                isVerified: true
                            }).onConflictDoNothing();
                        }
                    }

                    await clerkClient.users.updateUserMetadata(nameMatch.id, {
                        publicMetadata: { role: inv.role }
                    });

                    await db.delete(invitations).where(eq(invitations.id, inv.id));
                    removedCount++;
                }
            }
        }

        revalidatePath("/dashboard/users", "layout");
        return { success: true, removedCount };
    } catch (error) {
        console.error("Error in syncPendingInvitations:", error);
        return { success: false, removedCount: 0, error: (error as any)?.message };
    }
}


import { auth } from "@clerk/nextjs/server";
import { UserRole, users } from "@/db/schema";
import { cache } from "react";
import { getCurrentUser } from "./user";
import { db } from "@/db";
import { eq, sql } from "drizzle-orm";

export const getUserRole = cache(async (): Promise<UserRole | null> => {
  try {
    const { sessionClaims, userId } = await auth();

    // Hardcoded Super Admin Override for authorized administrator emails
    const whitelist = ["nomiking0072012@gmail.com", "energygurusonline@gmail.com"];

    // 1. Check database first as source of truth
    if (userId) {
      const [dbUser] = await db
        .select({
          id: users.id,
          role: users.role,
          email: users.email
        })
        .from(users)
        .where(eq(users.clerkId, userId))
        .limit(1);

      if (dbUser) {
        if (dbUser.email && whitelist.includes(dbUser.email.toLowerCase())) {
          // Auto-heal DB role if accidentally altered
          if (dbUser.role !== "super-admin") {
            await db.update(users).set({ role: "super-admin" }).where(eq(users.id, dbUser.id));
          }
          return "super-admin";
        }

        // Clean up any lingering invitation for this user's email
        if (dbUser.email) {
          try {
            const { invitations } = await import("@/db/schema");
            await db.delete(invitations).where(
              sql`LOWER(TRIM(${invitations.email})) = ${dbUser.email.toLowerCase().trim()}`
            );
          } catch (e) {
            console.error("Failed to clean up consumed invitation in getUserRole:", e);
          }
        }

        return dbUser.role as UserRole;
      }
    }

    // 2. Fallback to Clerk email(s) directly
    const user = await getCurrentUser();
    const emails = (user?.emailAddresses?.map(e => e.emailAddress.toLowerCase().trim()) || []).filter(Boolean);
    const primaryEmail = (user?.emailAddresses?.find(e => e.id === user.primaryEmailAddressId)?.emailAddress || user?.emailAddresses?.[0]?.emailAddress)?.toLowerCase()?.trim();
    
    if (emails.length > 0) {
      // Check if any email is on whitelist
      const whitelistedEmail = emails.find(e => whitelist.includes(e));
      if (whitelistedEmail) {
        if (userId) {
          await db.insert(users).values({
            clerkId: userId,
            email: whitelistedEmail,
            name: user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : "Super Admin",
            role: "super-admin",
            isActive: true
          }).onConflictDoUpdate({
            target: users.email,
            set: { role: "super-admin", clerkId: userId, isActive: true }
          });
        }
        return "super-admin";
      }

      const { invitations, writerProfiles, epcInstallers, brands } = await import("@/db/schema");

      // Check if user already exists in DB by any of their emails
      for (const email of emails) {
        const [dbUserByEmail] = await db
          .select({ id: users.id, role: users.role, clerkId: users.clerkId })
          .from(users)
          .where(sql`LOWER(TRIM(${users.email})) = ${email}`)
          .limit(1);

        if (dbUserByEmail) {
          if (userId && dbUserByEmail.clerkId !== userId) {
            await db.update(users).set({ clerkId: userId }).where(eq(users.id, dbUserByEmail.id));
          }
          // Clean up pending invitation for this email
          await db.delete(invitations).where(
            sql`LOWER(TRIM(${invitations.email})) = ${email}`
          );
          return dbUserByEmail.role as UserRole;
        }
      }

      // Check if user has an active invitation matching any of their emails
      for (const email of emails) {
        const [invitation] = await db
          .select()
          .from(invitations)
          .where(sql`LOWER(TRIM(${invitations.email})) = ${email}`)
          .limit(1);

        if (invitation) {
          if (userId) {
            const [upsertedUser] = await db.insert(users).values({
              clerkId: userId,
              email: email,
              name: user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : email.split('@')[0],
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
                  name: upsertedUser.name || email.split('@')[0],
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

            // Sync Clerk metadata
            try {
              const { createClerkClient } = await import("@clerk/nextjs/server");
              const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
              await clerk.users.updateUserMetadata(userId, {
                publicMetadata: { role: invitation.role }
              });
            } catch (clerkErr) {
              console.error("Failed to update Clerk metadata in getUserRole:", clerkErr);
            }

            // Delete consumed invitation
            await db.delete(invitations).where(eq(invitations.id, invitation.id));
          }
          return invitation.role;
        }
      }

      // Check name-based match if invited via corporate email but logged in with personal account
      const fullName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim().toLowerCase();
      if (fullName.length >= 4) {
        const allPending = await db.select().from(invitations);
        const nameMatch = allPending.find(inv => {
          const prefix = inv.email.split('@')[0].replace(/[._-]/g, ' ').trim().toLowerCase();
          return prefix === fullName || (user?.firstName && user?.lastName && prefix.includes(user.firstName.toLowerCase()) && prefix.includes(user.lastName.toLowerCase()));
        });

        if (nameMatch && userId) {
          const targetEmail = primaryEmail || emails[0] || nameMatch.email;
          const [upsertedUser] = await db.insert(users).values({
            clerkId: userId,
            email: targetEmail,
            name: user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : targetEmail.split('@')[0],
            role: nameMatch.role,
            isActive: true
          }).onConflictDoUpdate({
            target: users.email,
            set: { role: nameMatch.role, clerkId: userId, isActive: true }
          }).returning();

          if (upsertedUser) {
            if (nameMatch.role === 'writer') {
              await db.insert(writerProfiles).values({
                userId: upsertedUser.id,
                name: upsertedUser.name || "Contributing Writer",
                designation: "Contributing Columnist",
                status: "approved"
              }).onConflictDoNothing();
            } else if (nameMatch.role === 'epc') {
              await db.insert(epcInstallers).values({
                userId: upsertedUser.id,
                companyName: upsertedUser.name || "Solar EPC Installer",
                email: upsertedUser.email,
                isVerified: true
              }).onConflictDoNothing();
            } else if (nameMatch.role === 'brand') {
              await db.insert(brands).values({
                userId: upsertedUser.id,
                brandName: upsertedUser.name || "Solar Brand",
                customerCareEmail: upsertedUser.email,
                status: "live",
                isVerified: true
              }).onConflictDoNothing();
            }
          }

          try {
            const { createClerkClient } = await import("@clerk/nextjs/server");
            const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
            await clerk.users.updateUserMetadata(userId, {
              publicMetadata: { role: nameMatch.role }
            });
          } catch (clerkErr) {
            console.error("Failed to update Clerk metadata in getUserRole nameMatch:", clerkErr);
          }

          await db.delete(invitations).where(eq(invitations.id, nameMatch.id));
          return nameMatch.role;
        }
      }
    }

    // 3. Fallback to session claims
    const claimRole = (sessionClaims?.metadata as { role?: UserRole })?.role;
    if (claimRole) return claimRole;

    // 4. No role matched - return null (never blindly fallback to an operational role like epc)
    return null;
  } catch (error) {
    console.error("Error in getUserRole:", error);
    return null;
  }
});

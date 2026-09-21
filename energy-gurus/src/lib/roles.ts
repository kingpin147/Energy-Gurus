import { auth } from "@clerk/nextjs/server";
import { UserRole, users } from "@/db/schema";
import { cache } from "react";
import { getCurrentUser } from "./user";
import { db } from "@/db";
import { eq } from "drizzle-orm";

export const getUserRole = cache(async (): Promise<UserRole> => {
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
        return dbUser.role as UserRole;
      }
    }

    // 2. Fallback to Clerk primary email directly
    const user = await getCurrentUser();
    const primaryEmail = user?.emailAddresses?.find(e => e.id === user.primaryEmailAddressId)?.emailAddress || user?.emailAddresses?.[0]?.emailAddress;
    const lowerEmail = primaryEmail?.toLowerCase();
    
    if (lowerEmail) {
      if (whitelist.includes(lowerEmail)) {
        // Auto-heal: Ensure user record exists in local DB as super-admin
        if (userId) {
          await db.insert(users).values({
            clerkId: userId,
            email: lowerEmail,
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

      // Check if user already exists in DB by email
      const [dbUserByEmail] = await db
        .select({ id: users.id, role: users.role, clerkId: users.clerkId })
        .from(users)
        .where(eq(users.email, lowerEmail))
        .limit(1);

      if (dbUserByEmail) {
        if (userId && dbUserByEmail.clerkId !== userId) {
          await db.update(users).set({ clerkId: userId }).where(eq(users.id, dbUserByEmail.id));
        }
        return dbUserByEmail.role as UserRole;
      }

      // Check if user has an active invitation
      const { invitations } = await import("@/db/schema");
      const [invitation] = await db
        .select()
        .from(invitations)
        .where(eq(invitations.email, lowerEmail))
        .limit(1);

      if (invitation) {
        if (userId) {
          await db.insert(users).values({
            clerkId: userId,
            email: lowerEmail,
            name: user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : lowerEmail.split('@')[0],
            role: invitation.role,
            isActive: true
          }).onConflictDoUpdate({
            target: users.email,
            set: { role: invitation.role, clerkId: userId, isActive: true }
          });

          // Delete consumed invitation
          await db.delete(invitations).where(eq(invitations.id, invitation.id));
        }
        return invitation.role;
      }
    }

    // 3. Fallback to session claims
    const claimRole = (sessionClaims?.metadata as { role?: UserRole })?.role;
    if (claimRole) return claimRole;

    // 4. Last resort fallback
    return "epc";
  } catch (error) {
    console.error("Error in getUserRole:", error);
    return "epc";
  }
});

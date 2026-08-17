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
    
    if (primaryEmail && whitelist.includes(primaryEmail.toLowerCase())) {
      // Auto-heal: Ensure user record exists in local DB as super-admin
      if (userId) {
        await db.insert(users).values({
          clerkId: userId,
          email: primaryEmail.toLowerCase(),
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

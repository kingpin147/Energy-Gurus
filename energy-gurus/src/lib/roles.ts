import { auth } from "@clerk/nextjs/server";
import { UserRole } from "@/db/schema";
import { cache } from "react";
import { getCurrentUser } from "./user";

export const getUserRole = cache(async (): Promise<UserRole> => {
  try {
    const { sessionClaims } = await auth();
    const user = await getCurrentUser();
    
    // Hardcoded Super Admin Override for your emails
    const whitelist = ["nomiking0072012@gmail.com", "energygurusonline@gmail.com"];
    const userEmail = user?.emailAddresses[0]?.emailAddress;

    if (userEmail && whitelist.includes(userEmail.toLowerCase())) {
      return "super-admin";
    }

    return (sessionClaims?.metadata as { role?: UserRole })?.role || "epc";
  } catch (error) {
    console.error("Error in getUserRole:", error);
    return "epc";
  }
});

import { auth, currentUser } from "@clerk/nextjs/server";
import { UserRole } from "@/db/schema";

export async function getUserRole(): Promise<UserRole> {
  const { sessionClaims } = await auth();
  const user = await currentUser();
  
  // Hardcoded Super Admin Override for your emails
  const whitelist = ["nomiking0072012@gmail.com", "energygurusonline@gmail.com"];
  const userEmail = user?.emailAddresses[0]?.emailAddress;

  if (userEmail && whitelist.includes(userEmail.toLowerCase())) {
    return "super-admin";
  }

  return (sessionClaims?.metadata as { role?: UserRole })?.role || "user";
}

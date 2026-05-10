import { auth } from "@clerk/nextjs/server";
import { UserRole } from "@/db/schema";

export async function getUserRole(): Promise<UserRole> {
  const { sessionClaims } = await auth();
  return (sessionClaims?.metadata as { role?: UserRole })?.role || "user";
}

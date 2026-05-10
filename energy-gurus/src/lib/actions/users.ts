"use server";

import { clerkClient } from "@clerk/nextjs/server";
import { getUserRole } from "@/lib/roles";
import { UserRole } from "@/db/schema";
import { revalidatePath } from "next/cache";

export async function updateUserRole(userId: string, role: UserRole) {
  const currentRole = await getUserRole();
  if (currentRole !== "super-admin" && currentRole !== "admin") {
    throw new Error("Unauthorized");
  }

  const client = await clerkClient();
  await client.users.updateUserMetadata(userId, {
    publicMetadata: {
      role,
    },
  });

  revalidatePath("/dashboard/users");
}

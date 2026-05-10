"use server";

import { db } from "@/db";
import { epcInstallers, users } from "@/db/schema";
import { getUserRole } from "@/lib/roles";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function updateEpcProfile(data: FormData | Partial<typeof epcInstallers.$inferInsert>) {
  const { userId: clerkId } = await auth();
  if (!clerkId) throw new Error("Unauthorized");

  const [user] = await db.select().from(users).where(eq(users.clerkId, clerkId));
  if (!user) throw new Error("User not found");

  const role = await getUserRole();
  if (role !== "epc" && role !== "admin" && role !== "super-admin") {
    throw new Error("Insufficient permissions");
  }

  const isFormData = data instanceof FormData;
  const updateData = isFormData ? {
    companyName: data.get("companyName") as string,
    about: data.get("about") as string,
    website: data.get("website") as string,
  } : data;

  // Ensure we only update the EPC profile belonging to the user (unless admin)
  let targetUserId = user.id;
  if (!isFormData && data.userId && (role === "admin" || role === "super-admin")) {
    targetUserId = data.userId;
  }

  await db.update(epcInstallers)
    .set({ ...updateData, updatedAt: new Date() })
    .where(eq(epcInstallers.userId, targetUserId));

  revalidatePath("/dashboard/epc");
  revalidatePath("/epcs");
}


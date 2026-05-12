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
  // Allow any authenticated user with an EPC record to update their own profile.
  // Admins/super-admins can update any EPC profile.
  const isAdmin = role === "admin" || role === "super-admin";

  const isFormData = data instanceof FormData;
  const updateData = isFormData ? {
    companyName: data.get("companyName") as string,
    about: data.get("about") as string,
    website: data.get("website") as string,
  } : data;

  // Always scope updates to the current user's EPC unless admin is overriding
  let targetUserId = user.id;
  if (!isFormData && (data as any).userId && isAdmin) {
    targetUserId = (data as any).userId;
  }

  // Verify the EPC profile actually belongs to this user (security check)
  const [existingEpc] = await db.select().from(epcInstallers).where(eq(epcInstallers.userId, targetUserId));
  if (!existingEpc) throw new Error("EPC profile not found");

  await db.update(epcInstallers)
    .set({ ...updateData, updatedAt: new Date() })
    .where(eq(epcInstallers.userId, targetUserId));

  revalidatePath("/dashboard/epc");
  revalidatePath("/epcs");
}


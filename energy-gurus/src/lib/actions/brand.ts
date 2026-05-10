"use server";

import { db } from "@/db";
import { brands, products, users } from "@/db/schema";
import { getUserRole } from "@/lib/roles";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function updateBrandProfile(data: FormData | Partial<typeof brands.$inferInsert>) {
  const { userId: clerkId } = await auth();
  if (!clerkId) throw new Error("Unauthorized");

  const [user] = await db.select().from(users).where(eq(users.clerkId, clerkId));
  if (!user) throw new Error("User not found");

  const role = await getUserRole();
  if (role !== "brand" && role !== "admin" && role !== "super-admin") {
    throw new Error("Insufficient permissions");
  }

  const isFormData = data instanceof FormData;
  const updateData = isFormData ? {
    brandName: data.get("brandName") as string,
    customerCare: data.get("customerCare") as string,
    website: data.get("website") as string,
  } : data;

  let targetUserId = user.id;
  if (!isFormData && data.userId && (role === "admin" || role === "super-admin")) {
    targetUserId = data.userId;
  }

  await db.update(brands)
    .set({ 
      ...updateData, 
      updatedAt: new Date() 
    })
    .where(eq(brands.userId, targetUserId));

  revalidatePath("/dashboard/brand");
}



export async function addProduct(data: typeof products.$inferInsert) {
  const role = await getUserRole();
  if (role !== "brand" && role !== "admin" && role !== "super-admin") {
    throw new Error("Unauthorized");
  }

  await db.insert(products).values(data);
  revalidatePath("/dashboard/brand");
  revalidatePath("/dashboard/products");
}

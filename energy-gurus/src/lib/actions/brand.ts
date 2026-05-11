"use server";

import { db } from "@/db";
import { brands, products, users } from "@/db/schema";
import { getUserRole } from "@/lib/roles";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redis, CACHE_KEYS } from "@/lib/redis";

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

export async function registerGlobalBrand(formData: FormData) {
    const { userId: clerkId } = await auth();
    if (!clerkId) throw new Error("Unauthorized");

    const role = await getUserRole();
    if (role !== 'super-admin' && role !== 'admin') {
        throw new Error("Unauthorized");
    }

    const brandName = formData.get("brandName") as string;
    const website = formData.get("website") as string;
    const logoUrl = formData.get("logoUrl") as string;

    const [user] = await db.select().from(users).where(eq(users.clerkId, clerkId));
    if (!user) throw new Error("User not found in database");

    await db.insert(brands).values({
        brandName,
        website,
        logoUrl,
        userId: user.id
    });

    // Invalidate Cache
    await redis.del(CACHE_KEYS.BRANDS_LIST);

    revalidatePath("/dashboard/brands");
}

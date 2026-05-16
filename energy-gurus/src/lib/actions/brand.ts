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
    countryHead: data.get("countryHead") as string,
    customerCareHead: data.get("customerCareHead") as string,
    customerCare: data.get("customerCare") as string,
    headOffice: data.get("headOffice") as string,
    website: data.get("website") as string,
    warrantyUrl: data.get("warrantyUrl") as string,
    qrUrl: data.get("qrUrl") as string,
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

  // Invalidate Cache
  const [b] = await db.select().from(brands).where(eq(brands.userId, targetUserId));
  if (b) {
    await redis.del(CACHE_KEYS.BRAND_DETAILS(b.id));
    await redis.del(CACHE_KEYS.BRANDS_LIST);
  }

  revalidatePath("/dashboard/brand");
}

export async function addProductModel(formData: FormData) {
    const { userId: clerkId } = await auth();
    if (!clerkId) throw new Error("Unauthorized");

    const [user] = await db.select().from(users).where(eq(users.clerkId, clerkId));
    if (!user) throw new Error("User not found");

    const [brand] = await db.select().from(brands).where(eq(brands.userId, user.id));
    if (!brand) throw new Error("Brand not found");

    const name = formData.get("name") as string;
    const category = formData.get("category") as string;
    const description = formData.get("description") as string;
    const serialNumber = formData.get("serialNumber") as string;
    const datasheetUrl = formData.get("datasheetUrl") as string;

    await db.insert(products).values({
        brandId: brand.id,
        name,
        category,
        description,
        serialNumber,
        datasheetUrl
    });

    // Invalidate Cache
    await redis.del(CACHE_KEYS.BRAND_DETAILS(brand.id));

    revalidatePath("/dashboard/brand");
}


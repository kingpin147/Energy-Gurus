"use server";

import { db } from "@/db";
import { brands, products, users } from "@/db/schema";
import { getUserRole } from "@/lib/roles";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { redis, CACHE_KEYS } from "@/lib/redis";
import { deleteFile, extractKeyFromUrl } from "@/lib/r2";

import { clerkClient as createClerkClient } from "@clerk/nextjs/server";

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

  let repsData = [];
  if (isFormData) {
    try {
      const repsRaw = data.get("reps") as string;
      if (repsRaw) {
        repsData = JSON.parse(repsRaw);
      }
    } catch (e) {
      console.error("Failed to parse reps JSON", e);
    }
  }

  const updateData = isFormData ? {
    brandName: data.get("brandName") as string,
    countryHead: data.get("countryHead") as string,
    customerCareHead: data.get("customerCareHead") as string,
    customerCare: data.get("customerCare") as string,
    headOffice: data.get("headOffice") as string,
    website: data.get("website") as string,
    warrantyUrl: data.get("warrantyUrl") as string,
    reps: repsData
    } : data;

  let targetUserId = user.id;
  let targetClerkId = clerkId;

  if (!isFormData && data.userId && (role === "admin" || role === "super-admin")) {
    targetUserId = data.userId;
    const [targetUser] = await db.select().from(users).where(eq(users.id, targetUserId));
    if (targetUser) targetClerkId = targetUser.clerkId;
  }

  const result = await db.update(brands)
    .set({
      ...updateData,
      updatedAt: new Date()
    })
    .where(eq(brands.userId, targetUserId))
    .returning();

  // Handle Clerk Avatar Sync if logoUrl is updated
  const newLogoUrl = (updateData as any).logoUrl;
  if (newLogoUrl !== undefined) {
    try {
      const client = await createClerkClient();
      // Update public metadata so frontend can use it if needed, 
      // and attempt to sync basic profile info if possible.
      // Note: imageUrl is often read-only in Clerk's updateUser.
      await client.users.updateUserMetadata(targetClerkId, {
        publicMetadata: {
          brandLogo: newLogoUrl || ""
        }
      });
    } catch (e) {
      console.error("Failed to sync logo with Clerk metadata:", e);
    }
  }

  // Invalidate Cache
  if (result.length > 0) {
    const b = result[0];
    await redis.del(CACHE_KEYS.BRAND_DETAILS(b.id));
    await redis.del(CACHE_KEYS.BRANDS_LIST);

    // Revalidate cache
    revalidatePath("/", "layout");

    // Only redirect when called from a form action (FormData path).
    // Programmatic calls (logo/gallery upload) handle their own feedback via toast + router.refresh().
    if (isFormData) {
      redirect(`/dashboard/brand?msg=profile_updated&t=${Date.now()}`);
    }
  } else {
    console.error("No brand found to update for user:", targetUserId);
  }
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

  revalidatePath("/", "layout");
}

export async function deleteProductModel(productId: string) {
  const { userId: clerkId } = await auth();
  if (!clerkId) throw new Error("Unauthorized");

  const [user] = await db.select().from(users).where(eq(users.clerkId, clerkId));
  if (!user) throw new Error("User not found");

  const [product] = await db.select().from(products).where(eq(products.id, productId));
  if (!product) throw new Error("Product not found");

  // Verify ownership
  const [brand] = await db.select().from(brands).where(eq(brands.id, product.brandId));
  if (!brand || brand.userId !== user.id) {
    const role = await getUserRole();
    if (role !== "admin" && role !== "super-admin") {
      throw new Error("Insufficient permissions");
    }
  }

  // 1. Gather files to delete
  const filesToDelete: string[] = [];
  if (product.imageUrl) filesToDelete.push(product.imageUrl);
  if (product.datasheetUrl) filesToDelete.push(product.datasheetUrl);

  // 2. Cleanup R2
  for (const url of filesToDelete) {
    try {
      const key = extractKeyFromUrl(url);
      await deleteFile(key);
    } catch (e) {
      console.error(`Failed to delete R2 asset for product ${productId}:`, url, e);
    }
  }

  // 3. Delete from DB
  await db.delete(products).where(eq(products.id, productId));

  // 4. Invalidate Cache
  await redis.del(CACHE_KEYS.BRAND_DETAILS(product.brandId));
  revalidatePath("/", "layout");
}


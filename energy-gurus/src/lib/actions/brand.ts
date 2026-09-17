"use server";

import { db } from "@/db";
import { brands, products, users } from "@/db/schema";
import { getUserRole } from "@/lib/roles";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
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

  let repsData: any[] = [];
  let teamData: any[] = [];
  let categoriesData: string[] = [];
  let distributorsData: any[] = [];
  let retailersData: any[] = [];
  let serviceCentresData: any[] = [];
  let certifiedInstallersData: any[] = [];

  if (isFormData) {
    try {
      const repsRaw = data.get("reps") as string;
      if (repsRaw) repsData = JSON.parse(repsRaw);

      const teamRaw = data.get("team") as string;
      if (teamRaw) teamData = JSON.parse(teamRaw);

      const categoriesRaw = data.get("categories") as string;
      if (categoriesRaw) categoriesData = JSON.parse(categoriesRaw);

      const distributorsRaw = data.get("distributors") as string;
      if (distributorsRaw) distributorsData = JSON.parse(distributorsRaw);

      const retailersRaw = data.get("retailers") as string;
      if (retailersRaw) retailersData = JSON.parse(retailersRaw);

      const serviceCentresRaw = data.get("serviceCentres") as string;
      if (serviceCentresRaw) serviceCentresData = JSON.parse(serviceCentresRaw);

      const certifiedInstallersRaw = data.get("certifiedInstallers") as string;
      if (certifiedInstallersRaw) certifiedInstallersData = JSON.parse(certifiedInstallersRaw);
    } catch (e) {
      console.error("Failed to parse JSON fields", e);
    }
  }

  const updateData = isFormData ? {
    brandName: data.get("brandName") as string || undefined,
    countryHead: data.get("countryHead") as string || undefined,
    customerCareHead: data.get("customerCareHead") as string || undefined,
    customerCare: data.get("customerCare") as string || undefined,
    customerCareEmail: data.get("customerCareEmail") as string || undefined,
    headOffice: data.get("headOffice") as string || undefined,
    website: data.get("website") as string || undefined,
    warrantyUrl: data.get("warrantyUrl") as string || undefined,
    founded: data.get("founded") as string || undefined,
    headquarters: data.get("headquarters") as string || undefined,
    countryOfOrigin: data.get("countryOfOrigin") as string || undefined,
    about: data.get("about") as string || undefined,
    reps: repsData.length > 0 ? repsData : undefined,
    team: teamData.length > 0 ? teamData : undefined,
    categories: categoriesData.length > 0 ? categoriesData : undefined,
    distributors: distributorsData.length > 0 ? distributorsData : undefined,
    retailers: retailersData.length > 0 ? retailersData : undefined,
    serviceCentres: serviceCentresData.length > 0 ? serviceCentresData : undefined,
    certifiedInstallers: certifiedInstallersData.length > 0 ? certifiedInstallersData : undefined,
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
    try {
      await redis.del(CACHE_KEYS.BRAND_DETAILS(b.id));
      await redis.del(CACHE_KEYS.BRANDS_LIST);
    } catch (e) {
      console.error("Redis cache del failed:", e);
    }

    revalidatePath("/", "layout");
    revalidatePath(`/brands/${b.id}`, "page");
    revalidatePath("/brands", "page");
    revalidatePath("/dashboard/brand", "page");

    if (isFormData) {
      redirect(`/dashboard/brand?msg=profile_updated&t=${Date.now()}`);
    }
  }
}

export async function submitBrandForReviewAction(brandId: string) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) throw new Error("Unauthorized");

    const [brand] = await db.select().from(brands).where(eq(brands.id, brandId));
    if (!brand) throw new Error("Brand not found");

    const history = brand.approvalHistory || [];
    const newHistory = [
      ...history,
      {
        date: new Date().toISOString(),
        action: "Submitted for Admin Review",
        note: "Brand representative submitted the profile for publication approval."
      }
    ];

    await db.update(brands)
      .set({
        status: "pending_review",
        adminFeedback: null,
        approvalHistory: newHistory,
        updatedAt: new Date()
      })
      .where(eq(brands.id, brandId));

    try {
      await redis.del(CACHE_KEYS.BRAND_DETAILS(brandId));
      await redis.del(CACHE_KEYS.BRANDS_LIST);
    } catch (e) {}

    revalidatePath("/", "layout");
    revalidatePath("/dashboard/brand", "page");

    return { success: true, message: "Profile submitted for admin review!" };
  } catch (e: any) {
    return { success: false, message: e?.message || "Failed to submit for review" };
  }
}

export async function adminUpdateBrandStatusAction(
  brandId: string,
  newStatus: "live" | "changes_requested" | "pending_review" | "draft",
  feedbackNote?: string
) {
  try {
    const role = await getUserRole();
    if (role !== "admin" && role !== "super-admin") {
      throw new Error("Unauthorized. Admin role required.");
    }

    const [brand] = await db.select().from(brands).where(eq(brands.id, brandId));
    if (!brand) throw new Error("Brand not found");

    const history = brand.approvalHistory || [];
    const actionLabel = newStatus === "live"
      ? "Approved & Published Live"
      : newStatus === "changes_requested"
      ? "Changes Requested"
      : `Status updated to ${newStatus}`;

    const newHistory = [
      ...history,
      {
        date: new Date().toISOString(),
        action: actionLabel,
        note: feedbackNote || (newStatus === "live" ? "Approved by EnergyGurus admin." : undefined)
      }
    ];

    await db.update(brands)
      .set({
        status: newStatus,
        isVerified: newStatus === "live" ? true : brand.isVerified,
        adminFeedback: feedbackNote || null,
        approvalHistory: newHistory,
        updatedAt: new Date()
      })
      .where(eq(brands.id, brandId));

    try {
      await redis.del(CACHE_KEYS.BRAND_DETAILS(brandId));
      await redis.del(CACHE_KEYS.BRANDS_LIST);
    } catch (e) {}

    revalidatePath("/", "layout");
    revalidatePath(`/brands/${brandId}`, "page");
    revalidatePath("/brands", "page");
    revalidatePath("/dashboard/brand", "page");

    return { success: true, message: `Brand status updated to ${newStatus}` };
  } catch (e: any) {
    return { success: false, message: e?.message || "Failed to update brand status" };
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
  const series = (formData.get("series") as string) || undefined;
  const description = formData.get("description") as string;
  const serialNumber = formData.get("serialNumber") as string;
  const datasheetUrl = formData.get("datasheetUrl") as string;
  const manualUrl = (formData.get("manualUrl") as string) || undefined;
  const imageUrl = (formData.get("imageUrl") as string) || undefined;
  const warrantyYears = (formData.get("warrantyYears") as string) || undefined;
  const efficiency = (formData.get("efficiency") as string) || undefined;
  const powerRange = (formData.get("powerRange") as string) || undefined;
  const protectionRating = (formData.get("protectionRating") as string) || undefined;

  let specifications = {};
  try {
    const specsRaw = formData.get("specifications") as string;
    if (specsRaw) specifications = JSON.parse(specsRaw);
  } catch (e) {}

  await db.insert(products).values({
    brandId: brand.id,
    name,
    category,
    series,
    description,
    serialNumber,
    datasheetUrl,
    manualUrl,
    imageUrl,
    warrantyYears,
    efficiency,
    powerRange,
    protectionRating,
    specifications
  });

  try {
    await redis.del(CACHE_KEYS.BRAND_DETAILS(brand.id));
  } catch (e) {}

  revalidatePath("/", "layout");
  revalidatePath(`/brands/${brand.id}`, "page");
  revalidatePath("/dashboard/brand", "page");
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

  // 1. Gather files to delete from R2
  const filesToDelete: string[] = [];
  if (product.imageUrl) filesToDelete.push(product.imageUrl);
  if (product.datasheetUrl) filesToDelete.push(product.datasheetUrl);
  if (product.manualUrl) filesToDelete.push(product.manualUrl);

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
  try {
    await redis.del(CACHE_KEYS.BRAND_DETAILS(product.brandId));
  } catch (e) {}

  revalidatePath("/", "layout");
  revalidatePath(`/brands/${product.brandId}`, "page");
  revalidatePath("/dashboard/brand", "page");
}

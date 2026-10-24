"use server";

import { db } from "@/db";
import { brands, products, users, reviews } from "@/db/schema";
import { eq, desc, sql, and, isNull } from "drizzle-orm";
import { getUserRole } from "@/lib/roles";
import { revalidatePath } from "next/cache";
import { deleteUser } from "@/lib/actions/users";
import { auth, createClerkClient } from "@clerk/nextjs/server";
import { deleteFile, extractKeyFromUrl } from "@/lib/r2";
import { slugify } from "@/lib/utils/slug";

const adminWhitelist = ["nomiking0072012@gmail.com", "energygurusonline@gmail.com"];

export async function getAllBrandsAdmin() {
  const role = await getUserRole();
  if (role !== "super-admin" && role !== "admin") {
    throw new Error("Unauthorized access");
  }

  // Auto-sync: Ensure all users with role 'brand' have a corresponding brands entry
  const missingBrands = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
    })
    .from(users)
    .leftJoin(brands, eq(users.id, brands.userId))
    .where(and(eq(users.role, "brand"), isNull(brands.id)));

  if (missingBrands.length > 0) {
    for (const brandUser of missingBrands) {
      await db
        .insert(brands)
        .values({
          userId: brandUser.id,
          brandName: brandUser.name || "Solar Brand",
          customerCareEmail: brandUser.email,
          status: "live",
          isVerified: true,
        })
        .onConflictDoNothing();
    }
  }

  const list = await db
    .select({
      id: brands.id,
      userId: brands.userId,
      brandName: brands.brandName,
      slug: brands.slug,
      tagline: brands.tagline,
      categories: brands.categories,
      countryHead: brands.countryHead,
      customerCareHead: brands.customerCareHead,
      logoUrl: brands.logoUrl,
      about: brands.about,
      countryOfOrigin: brands.countryOfOrigin,
      headquarters: brands.headquarters,
      founded: brands.founded,
      website: brands.website,
      warrantyUrl: brands.warrantyUrl,
      customerCare: brands.customerCare,
      customerCareEmail: brands.customerCareEmail,
      headOffice: brands.headOffice,
      status: brands.status,
      isVerified: brands.isVerified,
      adminFeedback: brands.adminFeedback,
      createdAt: brands.createdAt,
      updatedAt: brands.updatedAt,
      distributors: brands.distributors,
      retailers: brands.retailers,
      serviceCentres: brands.serviceCentres,
      certifiedInstallers: brands.certifiedInstallers,
      team: brands.team,
      reps: brands.reps,
      socialLinks: brands.socialLinks,
      userIsActive: users.isActive,
      userEmail: users.email,
      productsCount: sql<number>`(SELECT COUNT(*) FROM ${products} WHERE ${products.brandId} = ${brands.id})`.mapWith(Number),
    })
    .from(brands)
    .leftJoin(users, eq(users.id, brands.userId))
    .orderBy(desc(brands.createdAt));

  return list;
}

export async function getBrandFullDetails(brandId: string) {
  const role = await getUserRole();
  if (role !== "super-admin" && role !== "admin") {
    throw new Error("Unauthorized access");
  }

  const [brand] = await db
    .select()
    .from(brands)
    .where(eq(brands.id, brandId));

  if (!brand) return null;

  const brandProducts = await db
    .select()
    .from(products)
    .where(eq(products.brandId, brandId))
    .orderBy(desc(products.createdAt));

  const brandReviews = await db
    .select({
      id: reviews.id,
      rating: reviews.rating,
      comment: reviews.comment,
      reply: reviews.reply,
      createdAt: reviews.createdAt,
      authorName: users.name,
      authorEmail: users.email,
    })
    .from(reviews)
    .leftJoin(users, eq(users.id, reviews.authorId))
    .where(eq(reviews.targetId, brandId));

  const [linkedUser] = await db
    .select()
    .from(users)
    .where(eq(users.id, brand.userId));

  return {
    ...brand,
    userEmail: linkedUser?.email || null,
    products: brandProducts,
    reviews: brandReviews,
  };
}

export async function onboardBrandAction(formData: FormData) {
  const role = await getUserRole();
  if (role !== "super-admin" && role !== "admin") {
    return { success: false, message: "Unauthorized access" };
  }

  try {
    const email = (formData.get("email") as string)?.trim().toLowerCase();
    const brandName = (formData.get("brandName") as string)?.trim();

    if (!email || !brandName) {
      return { success: false, message: "Email and Brand Name are required" };
    }

    // Check if user already exists in DB
    const [existingUser] = await db.select().from(users).where(eq(users.email, email));
    if (existingUser) {
      return { success: false, message: "An account with this email address already exists. Please use a unique email." };
    }

    // Generate secure 16-char random password
    const generatedPassword = Array(16)
      .fill("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*")
      .map((x) => x[Math.floor(Math.random() * x.length)])
      .join("");

    // 1. Create Clerk user
    const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
    let clerkUserId: string;
    try {
      const clerkUser = await clerk.users.createUser({
        emailAddress: [email],
        password: generatedPassword,
        publicMetadata: { role: "brand" },
      });
      clerkUserId = clerkUser.id;
    } catch (clerkErr: any) {
      console.error("Clerk user creation error:", clerkErr);
      const [existingClerkUser] = await clerk.users.getUserList({ emailAddress: [email] }).then((res) => res.data);
      if (existingClerkUser) {
        clerkUserId = existingClerkUser.id;
      } else {
        return {
          success: false,
          message: clerkErr?.errors?.[0]?.longMessage || clerkErr?.message || "Failed to create user account in Clerk.",
        };
      }
    }

    // 2. Insert into users table
    const [newUser] = await db
      .insert(users)
      .values({
        clerkId: clerkUserId,
        email,
        name: brandName,
        role: "brand",
        isActive: true,
      })
      .returning();

    // 3. Parse JSON / array fields
    const categories = formData.getAll("categories") as string[];
    const teamStr = formData.get("team") as string;
    const repsStr = formData.get("reps") as string;
    const distributorsStr = formData.get("distributors") as string;
    const retailersStr = formData.get("retailers") as string;
    const serviceCentresStr = formData.get("serviceCentres") as string;
    const certifiedInstallersStr = formData.get("certifiedInstallers") as string;
    const socialLinksStr = formData.get("socialLinks") as string;
    const photosStr = formData.get("photos") as string;
    const productsStr = formData.get("products") as string;

    const team = teamStr ? JSON.parse(teamStr) : [];
    const reps = repsStr ? JSON.parse(repsStr) : [];
    const distributors = distributorsStr ? JSON.parse(distributorsStr) : [];
    const retailers = retailersStr ? JSON.parse(retailersStr) : [];
    const serviceCentres = serviceCentresStr ? JSON.parse(serviceCentresStr) : [];
    const certifiedInstallers = certifiedInstallersStr ? JSON.parse(certifiedInstallersStr) : [];
    const photos = photosStr ? JSON.parse(photosStr) : [];
    const productEntries = productsStr ? JSON.parse(productsStr) : [];

    // Construct social links
    let socialLinks: { platform: string; url: string }[] = [];
    if (socialLinksStr) {
      try {
        socialLinks = JSON.parse(socialLinksStr);
      } catch (e) {
        socialLinks = [];
      }
    } else {
      const website = formData.get("website") as string;
      const facebook = formData.get("facebook") as string;
      const linkedin = formData.get("linkedin") as string;
      const twitter = formData.get("twitter") as string;
      const youtube = formData.get("youtube") as string;
      if (website) socialLinks.push({ platform: "Website", url: website });
      if (facebook) socialLinks.push({ platform: "Facebook", url: facebook });
      if (linkedin) socialLinks.push({ platform: "LinkedIn", url: linkedin });
      if (twitter) socialLinks.push({ platform: "Twitter", url: twitter });
      if (youtube) socialLinks.push({ platform: "YouTube", url: youtube });
    }

    const slug = slugify(brandName);

    // 4. Insert into brands table
    const [newBrand] = await db
      .insert(brands)
      .values({
        userId: newUser.id,
        brandName,
        slug,
        tagline: (formData.get("tagline") as string) || null,
        categories: categories.length > 0 ? categories : ["Inverters"],
        countryHead: (formData.get("countryHead") as string) || null,
        customerCareHead: (formData.get("customerCareHead") as string) || null,
        logoUrl: (formData.get("logoUrl") as string) || null,
        about: (formData.get("about") as string) || null,
        website: (formData.get("website") as string) || null,
        warrantyUrl: (formData.get("warrantyUrl") as string) || null,
        founded: (formData.get("founded") as string) || null,
        headquarters: (formData.get("headquarters") as string) || null,
        countryOfOrigin: (formData.get("countryOfOrigin") as string) || "China",
        customerCare: (formData.get("customerCare") as string) || null,
        customerCareEmail: (formData.get("customerCareEmail") as string) || null,
        headOffice: (formData.get("headOffice") as string) || null,
        reps,
        team,
        distributors,
        retailers,
        serviceCentres,
        certifiedInstallers,
        socialLinks,
        photos,
        status: "live",
        isVerified: true,
      })
      .returning();

    // 5. Insert initial products if provided
    if (productEntries && productEntries.length > 0) {
      const productRecords = productEntries
        .filter((p: any) => p.name)
        .map((p: any) => ({
          brandId: newBrand.id,
          name: p.name,
          category: p.category || "Inverters",
          series: p.series || null,
          description: p.description || null,
          datasheetUrl: p.datasheetUrl || null,
          manualUrl: p.manualUrl || null,
          warrantyLink: p.warrantyLink || null,
          warrantyYears: p.warrantyYears ? String(p.warrantyYears) : null,
          efficiency: p.efficiency || null,
          powerRange: p.powerRange || null,
          imageUrl: p.imageUrl || null,
          specifications: p.specifications || {},
        }));

      if (productRecords.length > 0) {
        await db.insert(products).values(productRecords);
      }
    }

    revalidatePath("/dashboard/admin/onboard-brand");
    revalidatePath("/brands");
    revalidatePath("/dashboard/users");
    revalidatePath("/", "layout");

    return {
      success: true,
      message: "Brand Onboarded Successfully.",
      password: generatedPassword,
      brandId: newBrand.id,
    };
  } catch (error: any) {
    console.error("Failed to onboard brand:", error);
    return {
      success: false,
      message: error?.message || "An unexpected error occurred during Brand onboarding.",
    };
  }
}

export async function adminUpdateBrandFull(
  brandId: string,
  data: {
    brandName: string;
    tagline?: string | null;
    logoUrl?: string | null;
    categories?: string[];
    website?: string | null;
    warrantyUrl?: string | null;
    founded?: string | null;
    headquarters?: string | null;
    countryOfOrigin?: string | null;
    customerCare?: string | null;
    customerCareEmail?: string | null;
    countryHead?: string | null;
    customerCareHead?: string | null;
    headOffice?: string | null;
    about?: string | null;
    isVerified?: boolean;
    status?: "draft" | "pending_review" | "changes_requested" | "live";
    adminFeedback?: string | null;
    team?: any[];
    reps?: any[];
    distributors?: any[];
    retailers?: any[];
    serviceCentres?: any[];
    certifiedInstallers?: any[];
    socialLinks?: any[];
    products?: any[];
  }
) {
  const role = await getUserRole();
  if (role !== "super-admin" && role !== "admin") {
    return { success: false, message: "Unauthorized access" };
  }

  try {
    const [existing] = await db.select().from(brands).where(eq(brands.id, brandId));
    if (!existing) {
      return { success: false, message: "Brand not found" };
    }

    await db
      .update(brands)
      .set({
        brandName: data.brandName,
        tagline: data.tagline ?? null,
        logoUrl: data.logoUrl !== undefined ? data.logoUrl : existing.logoUrl,
        categories: data.categories ?? existing.categories,
        website: data.website ?? null,
        warrantyUrl: data.warrantyUrl ?? null,
        founded: data.founded ?? null,
        headquarters: data.headquarters ?? null,
        countryOfOrigin: data.countryOfOrigin ?? "China",
        customerCare: data.customerCare ?? null,
        customerCareEmail: data.customerCareEmail ?? null,
        countryHead: data.countryHead !== undefined ? data.countryHead : existing.countryHead,
        customerCareHead: data.customerCareHead !== undefined ? data.customerCareHead : existing.customerCareHead,
        headOffice: data.headOffice ?? null,
        about: data.about ?? null,
        isVerified: data.isVerified !== undefined ? data.isVerified : existing.isVerified,
        status: data.status ?? existing.status,
        adminFeedback: data.adminFeedback ?? null,
        team: data.team ?? existing.team,
        reps: data.reps ?? existing.reps,
        distributors: data.distributors ?? existing.distributors,
        retailers: data.retailers ?? existing.retailers,
        serviceCentres: data.serviceCentres ?? existing.serviceCentres,
        certifiedInstallers: data.certifiedInstallers ?? existing.certifiedInstallers,
        socialLinks: data.socialLinks ?? existing.socialLinks,
        updatedAt: new Date(),
      })
      .where(eq(brands.id, brandId));

    // Also update users.name to match brandName
    if (existing.userId) {
      await db.update(users).set({ name: data.brandName }).where(eq(users.id, existing.userId));
    }

    // Sync products if provided
    if (data.products !== undefined) {
      await db.delete(products).where(eq(products.brandId, brandId));
      if (data.products.length > 0) {
        const productRecords = data.products
          .filter((p: any) => p.name)
          .map((p: any) => ({
            brandId,
            name: p.name,
            category: p.category || "Inverters",
            series: p.series || null,
            description: p.description || null,
            datasheetUrl: p.datasheetUrl || null,
            manualUrl: p.manualUrl || null,
            warrantyLink: p.warrantyLink || null,
            warrantyYears: p.warrantyYears ? String(p.warrantyYears) : null,
            efficiency: p.efficiency || null,
            powerRange: p.powerRange || null,
            imageUrl: p.imageUrl || null,
            specifications: p.specifications || {},
          }));

        if (productRecords.length > 0) {
          await db.insert(products).values(productRecords);
        }
      }
    }

    revalidatePath("/dashboard/admin/onboard-brand");
    revalidatePath(`/brands/${brandId}`);
    revalidatePath("/brands");
    revalidatePath("/", "layout");

    return { success: true, message: "Brand updated successfully" };
  } catch (error: any) {
    console.error("Error updating brand:", error);
    return { success: false, message: "Failed to update brand. Please try again." };
  }
}

export async function adminUpdateBrandStatusActionDirect(
  brandId: string,
  newStatus: "live" | "changes_requested" | "pending_review" | "draft",
  feedbackNote?: string
) {
  const role = await getUserRole();
  if (role !== "super-admin" && role !== "admin") {
    return { success: false, message: "Unauthorized access" };
  }

  try {
    const [brand] = await db.select().from(brands).where(eq(brands.id, brandId));
    if (!brand) return { success: false, message: "Brand not found" };

    const history = brand.approvalHistory || [];
    const newHistory = [
      ...history,
      {
        date: new Date().toISOString(),
        action: `Status set to ${newStatus}`,
        note: feedbackNote || undefined,
      },
    ];

    await db
      .update(brands)
      .set({
        status: newStatus,
        adminFeedback: feedbackNote || null,
        approvalHistory: newHistory,
        updatedAt: new Date(),
      })
      .where(eq(brands.id, brandId));

    revalidatePath("/dashboard/admin/onboard-brand");
    revalidatePath(`/brands/${brandId}`);
    revalidatePath("/brands");

    return { success: true, message: `Brand status updated to ${newStatus}` };
  } catch (error: any) {
    return { success: false, message: "Failed to update brand status." };
  }
}

export async function deleteBrandAction(brandId: string, userId: string) {
  const role = await getUserRole();
  if (role !== "super-admin" && role !== "admin") {
    return { success: false, message: "Unauthorized access" };
  }

  const { userId: currentClerkId } = await auth();

  try {
    const [brand] = await db.select().from(brands).where(eq(brands.id, brandId));
    if (!brand) {
      return { success: false, message: "Brand profile not found" };
    }

    // 1. Gather all file URLs to delete from R2
    const fileUrlsToDelete: string[] = [];
    if (brand.logoUrl) fileUrlsToDelete.push(brand.logoUrl);
    if (brand.photos) fileUrlsToDelete.push(...brand.photos);

    const brandProducts = await db.select().from(products).where(eq(products.brandId, brandId));
    for (const p of brandProducts) {
      if (p.datasheetUrl) fileUrlsToDelete.push(p.datasheetUrl);
      if (p.imageUrl) fileUrlsToDelete.push(p.imageUrl);
      if (p.manualUrl) fileUrlsToDelete.push(p.manualUrl);
    }

    for (const url of fileUrlsToDelete) {
      if (!url) continue;
      try {
        const key = extractKeyFromUrl(url);
        await deleteFile(key);
      } catch (e) {
        console.error("Failed to delete R2 file:", url, e);
      }
    }

    // 2. Remove products and brand record
    await db.delete(products).where(eq(products.brandId, brandId));
    await db.delete(brands).where(eq(brands.id, brandId));

    // 3. Remove linked user account safely
    if (userId) {
      const [linkedUser] = await db.select().from(users).where(eq(users.id, userId));
      const isSelf = linkedUser?.clerkId && linkedUser.clerkId === currentClerkId;
      const isAdminUser =
        linkedUser &&
        (adminWhitelist.includes(linkedUser.email.toLowerCase()) ||
          linkedUser.role === "super-admin" ||
          linkedUser.role === "admin");

      if (linkedUser && !isSelf && !isAdminUser) {
        try {
          await deleteUser(userId);
        } catch (err) {
          console.warn("User account cleanup notice:", err);
        }
      }
    }

    revalidatePath("/dashboard/admin/onboard-brand");
    revalidatePath("/brands");
    revalidatePath("/dashboard/users");
    revalidatePath("/", "layout");

    return { success: true, message: "Brand profile deleted successfully" };
  } catch (error: any) {
    console.error("Error deleting brand:", error);
    return { success: false, message: "Failed to delete brand. Please try again." };
  }
}

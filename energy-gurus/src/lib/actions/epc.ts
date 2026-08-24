"use server";

import { db } from "@/db";
import { epcInstallers, epcOffices, epcProjects, users } from "@/db/schema";
import { getUserRole } from "@/lib/roles";
import { auth } from "@clerk/nextjs/server";
import { eq, and } from "drizzle-orm";
import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { redis, CACHE_KEYS } from "@/lib/redis";
import { deleteFile, extractKeyFromUrl } from "@/lib/r2";

export async function updateEpcProfile(data: FormData | Partial<typeof epcInstallers.$inferInsert>) {
  const { userId: clerkId } = await auth();
  if (!clerkId) throw new Error("Unauthorized");

  const [user] = await db.select().from(users).where(eq(users.clerkId, clerkId));
  if (!user) throw new Error("User not found");

  const role = await getUserRole();
  const isAdmin = role === "admin" || role === "super-admin";

  const parseJsonArray = (value: FormDataEntryValue | string | null | undefined, fallback: any[] = []) => {
    if (value === null || value === undefined || value === "") return fallback;
    if (typeof value !== "string") return fallback;
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : fallback;
    } catch {
      return fallback;
    }
  };

  const isFormData = data instanceof FormData;
  const updateData = isFormData ? {
    companyName: (data.get("companyName") as string | null) || undefined,
    ceoName: (data.get("ceoName") as string | null) || undefined,
    designation: (data.get("designation") as string | null) || undefined,
    businessType: (data.get("businessType") as string | null) || undefined,
    email: (data.get("email") as string | null) || undefined,
    contactNo: (data.get("contactNo") as string | null) || undefined,
    whatsapp: (data.get("whatsapp") as string | null) || undefined,
    address: (data.get("address") as string | null) || undefined,
    area: (data.get("area") as string | null) || undefined,
    city: (data.get("city") as string | null) || undefined,
    country: (data.get("country") as string | null) || undefined,
    coordinates: (data.get("coordinates") as string | null) || undefined,
    logoUrl: (data.get("logoUrl") as string | null) || undefined,
    portfolio: parseJsonArray(data.get("portfolio"), []),
    socialLinks: parseJsonArray(data.get("socialLinks"), []),
    reviewVideos: parseJsonArray(data.get("reviewVideos"), []),
    photos: parseJsonArray(data.get("photos"), []),
    sectors: parseJsonArray(data.get("sectors"), []),
    certifications: parseJsonArray(data.get("certifications"), []),
    brandsCertified: parseJsonArray(data.get("brandsCertified"), []),
    solarBrands: parseJsonArray(data.get("solarBrands"), []),
    inverterBrands: parseJsonArray(data.get("inverterBrands"), []),
    batteryBrands: parseJsonArray(data.get("batteryBrands"), []),
    solarCertDocuments: parseJsonArray(data.get("solarCertDocuments"), []),
    inverterCertDocuments: parseJsonArray(data.get("inverterCertDocuments"), []),
    batteryCertDocuments: parseJsonArray(data.get("batteryCertDocuments"), []),
    team: parseJsonArray(data.get("team"), []),
    about: (data.get("about") as string | null) || undefined,
    website: (data.get("website") as string | null) || undefined,
    yearsInBusiness: data.get("yearsInBusiness") ? Number(data.get("yearsInBusiness")) || undefined : undefined,
    regNumber: (data.get("regNumber") as string | null) || undefined,
    licenceDocuments: parseJsonArray(data.get("licenceDocuments"), []),
    tier: ((data.get("tier") as string | null) as any) || undefined,
    isVerified: data.get("isVerified") ? String(data.get("isVerified")) === "true" : undefined,
    } : data;

  let targetUserId = user.id;
  if (!isFormData && (data as any).userId && isAdmin) {
    targetUserId = (data as any).userId;
  }

  const [existingEpc] = await db.select().from(epcInstallers).where(eq(epcInstallers.userId, targetUserId));
  if (!existingEpc) throw new Error("EPC profile not found");

  await db.update(epcInstallers)
    .set({ ...updateData, updatedAt: new Date() })
    .where(eq(epcInstallers.userId, targetUserId));

  await redis.del(CACHE_KEYS.EPC_DETAILS(existingEpc.id));
  await redis.del(CACHE_KEYS.EPCS_LIST);

  revalidatePath("/", "layout");
}

// Office Actions
export async function addEpcOffice(epcId: string, data: Omit<typeof epcOffices.$inferInsert, "epcId" | "id" | "createdAt">) {
  await db.insert(epcOffices).values({
    ...data,
    epcId
    });
  await redis.del(CACHE_KEYS.EPC_DETAILS(epcId));
  revalidatePath("/", "layout");
}

export async function updateEpcOffice(officeId: string, data: Partial<typeof epcOffices.$inferInsert>) {
  const [office] = await db.select().from(epcOffices).where(eq(epcOffices.id, officeId));
  await db.update(epcOffices).set(data).where(eq(epcOffices.id, officeId));
  if (office) {
    await redis.del(CACHE_KEYS.EPC_DETAILS(office.epcId));
  }
  revalidatePath("/", "layout");
}

export async function deleteEpcOffice(officeId: string) {
  const [office] = await db.select().from(epcOffices).where(eq(epcOffices.id, officeId));
  await db.delete(epcOffices).where(eq(epcOffices.id, officeId));
  if (office) {
    await redis.del(CACHE_KEYS.EPC_DETAILS(office.epcId));
  }
  revalidatePath("/", "layout");
}

// Project Actions
export async function addEpcProject(epcId: string, data: Omit<typeof epcProjects.$inferInsert, "epcId" | "id" | "createdAt" | "updatedAt">) {
  await db.insert(epcProjects).values({
    ...data,
    epcId
    });
  await redis.del(CACHE_KEYS.EPC_DETAILS(epcId));
  revalidatePath("/", "layout");
}

export async function updateEpcProject(projectId: string, data: Partial<typeof epcProjects.$inferInsert>) {
  const [project] = await db.select().from(epcProjects).where(eq(epcProjects.id, projectId));
  await db.update(epcProjects).set({ ...data, updatedAt: new Date() }).where(eq(epcProjects.id, projectId));
  if (project) {
    await redis.del(CACHE_KEYS.EPC_DETAILS(project.epcId));
  }
  revalidatePath("/", "layout");
}

export async function deleteEpcProject(projectId: string) {
  const [project] = await db.select().from(epcProjects).where(eq(epcProjects.id, projectId));

  if (project) {
    // 1. Gather files to delete
    const filesToDelete: string[] = [];
    if (project.images) filesToDelete.push(...project.images);
    if (project.videos) filesToDelete.push(...project.videos);

    // 2. Cleanup R2
    for (const url of filesToDelete) {
      if (!url) continue;
      try {
        const key = extractKeyFromUrl(url);
        await deleteFile(key);
      } catch (e) {
        console.error(`Failed to delete R2 asset for project ${projectId}:`, url, e);
      }
    }

    // 3. Delete from DB
    await db.delete(epcProjects).where(eq(epcProjects.id, projectId));

    // 4. Invalidate Cache
    await redis.del(CACHE_KEYS.EPC_DETAILS(project.epcId));
  }
  revalidatePath("/", "layout");
}

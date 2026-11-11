"use server";

import { db } from "@/db";
import { epcInstallers, epcOffices, epcProjects, users } from "@/db/schema";
import { getUserRole } from "@/lib/roles";
import { auth } from "@clerk/nextjs/server";
import { eq, and } from "drizzle-orm";
import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
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
  const passedId = isFormData ? (data.get("id") as string | null) : ((data as any).id || (data as any).epcId);

  const updateData: Partial<typeof epcInstallers.$inferInsert> = isFormData ? {
    ...(data.has("companyName") ? { companyName: (data.get("companyName") as string)?.trim() || undefined } : {}),
    ...(data.has("ceoName") ? { ceoName: (data.get("ceoName") as string)?.trim() || undefined } : {}),
    ...(data.has("designation") ? { designation: (data.get("designation") as string)?.trim() || undefined } : {}),
    ...(data.has("businessType") ? { businessType: (data.get("businessType") as string)?.trim() || undefined } : {}),
    ...(data.has("email") ? { email: (data.get("email") as string)?.trim() || undefined } : {}),
    ...(data.has("contactNo") ? { contactNo: (data.get("contactNo") as string)?.trim() || undefined } : {}),
    ...(data.has("whatsapp") ? { whatsapp: (data.get("whatsapp") as string)?.trim() || undefined } : {}),
    ...(data.has("address") ? { address: (data.get("address") as string)?.trim() || undefined } : {}),
    ...(data.has("area") ? { area: (data.get("area") as string)?.trim() || undefined } : {}),
    ...(data.has("city") ? { city: (data.get("city") as string)?.trim() || undefined } : {}),
    ...(data.has("country") ? { country: (data.get("country") as string)?.trim() || "Pakistan" } : {}),
    ...(data.has("serviceAreas") ? { serviceAreas: parseJsonArray(data.get("serviceAreas"), []) } : {}),
    ...(data.has("coordinates") ? { coordinates: (data.get("coordinates") as string)?.trim() || undefined } : {}),
    ...(data.has("logoUrl") ? { logoUrl: (data.get("logoUrl") as string)?.trim() || undefined } : {}),
    ...(data.has("about") ? { about: (data.get("about") as string)?.trim() || undefined } : {}),
    ...(data.has("website") ? { website: (data.get("website") as string)?.trim() || undefined } : {}),
    ...(data.has("regNumber") ? { regNumber: (data.get("regNumber") as string)?.trim() || undefined } : {}),
    ...(data.has("yearsInBusiness") ? { yearsInBusiness: Number(data.get("yearsInBusiness")) || undefined } : {}),
    ...(data.has("isVerified") ? { isVerified: String(data.get("isVerified")) === "true" } : {}),
    ...(data.has("tier") ? { tier: (data.get("tier") as any) } : {}),
    ...(data.has("portfolio") ? { portfolio: parseJsonArray(data.get("portfolio"), []) } : {}),
    ...(data.has("socialLinks") ? { socialLinks: parseJsonArray(data.get("socialLinks"), []) } : {}),
    ...(data.has("reviewVideos") ? { reviewVideos: parseJsonArray(data.get("reviewVideos"), []) } : {}),
    ...(data.has("photos") ? { photos: parseJsonArray(data.get("photos"), []) } : {}),
    ...(data.has("status") ? { status: (data.get("status") as any) } : {}),
    ...(data.has("sectors") ? { sectors: parseJsonArray(data.get("sectors"), []) } : {}),
    ...(data.has("certifications") ? { certifications: parseJsonArray(data.get("certifications"), []) } : {}),
    ...(data.has("brandsCertified") ? { brandsCertified: parseJsonArray(data.get("brandsCertified"), []) } : {}),
    ...(data.has("solarBrands") ? { solarBrands: parseJsonArray(data.get("solarBrands"), []) } : {}),
    ...(data.has("inverterBrands") ? { inverterBrands: parseJsonArray(data.get("inverterBrands"), []) } : {}),
    ...(data.has("batteryBrands") ? { batteryBrands: parseJsonArray(data.get("batteryBrands"), []) } : {}),
    ...(data.has("solarCertDocuments") ? { solarCertDocuments: parseJsonArray(data.get("solarCertDocuments"), []) } : {}),
    ...(data.has("inverterCertDocuments") ? { inverterCertDocuments: parseJsonArray(data.get("inverterCertDocuments"), []) } : {}),
    ...(data.has("batteryCertDocuments") ? { batteryCertDocuments: parseJsonArray(data.get("batteryCertDocuments"), []) } : {}),
    ...(data.has("team") ? { team: parseJsonArray(data.get("team"), []) } : {}),
    ...(data.has("licenceDocuments") ? { licenceDocuments: parseJsonArray(data.get("licenceDocuments"), []) } : {}),
  } : data;

  let existingEpc = null;
  // If explicit epc id provided and user is admin, allow targeting that EPC
  if (passedId && isAdmin) {
    [existingEpc] = await db.select().from(epcInstallers).where(eq(epcInstallers.id, passedId));
  }
  // If explicit epc id provided by regular EPC user, verify ownership
  if (passedId && !existingEpc) {
    [existingEpc] = await db.select().from(epcInstallers).where(and(eq(epcInstallers.id, passedId), eq(epcInstallers.userId, user.id)));
  }
  // Fallback: match by userId
  if (!existingEpc) {
    let targetUserId = user.id;
    if (!isFormData && (data as any).userId && isAdmin) {
      targetUserId = (data as any).userId;
    }
    [existingEpc] = await db.select().from(epcInstallers).where(eq(epcInstallers.userId, targetUserId));
  }

  if (!existingEpc) throw new Error("EPC profile not found");

  // Prevent installers from editing if their profile is already live (edit rights reserved for EnergyGurus admin)
  if (!isAdmin && existingEpc.status === "live") {
    throw new Error("Profile is live. Edit rights are exclusively managed by EnergyGurus administrators.");
  }

  await db.update(epcInstallers)
    .set({ ...updateData, updatedAt: new Date() })
    .where(eq(epcInstallers.id, existingEpc.id));

  revalidatePath("/", "layout");
  return { success: true, id: existingEpc.id };
}

export async function submitEpcForReview(epcId: string) {
  const { userId: clerkId } = await auth();
  if (!clerkId) throw new Error("Unauthorized");

  const [user] = await db.select().from(users).where(eq(users.clerkId, clerkId));
  if (!user) throw new Error("User not found");

  const [epc] = await db.select().from(epcInstallers).where(and(eq(epcInstallers.id, epcId), eq(epcInstallers.userId, user.id)));
  if (!epc) throw new Error("EPC not found or not owned by user");

  if (epc.status === "live") {
    throw new Error("Profile is already live. Edit rights are exclusively managed by EnergyGurus administrators.");
  }

  await db.update(epcInstallers)
    .set({ status: "pending_review", updatedAt: new Date() })
    .where(eq(epcInstallers.id, epc.id));

  revalidatePath("/dashboard/epc");
  revalidatePath("/dashboard/admin/onboard-epc");
  return { success: true, message: "Profile successfully submitted for EnergyGurus admin review!" };
}

// Office Actions
export async function addEpcOffice(epcId: string, data: Omit<typeof epcOffices.$inferInsert, "epcId" | "id" | "createdAt">) {
  await db.insert(epcOffices).values({
    ...data,
    epcId
  });
  revalidatePath("/", "layout");
}

export async function updateEpcOffice(officeId: string, data: Partial<typeof epcOffices.$inferInsert>) {
  const [office] = await db.select().from(epcOffices).where(eq(epcOffices.id, officeId));
  await db.update(epcOffices).set(data).where(eq(epcOffices.id, officeId));
  revalidatePath("/", "layout");
}

export async function deleteEpcOffice(officeId: string) {
  const [office] = await db.select().from(epcOffices).where(eq(epcOffices.id, officeId));
  await db.delete(epcOffices).where(eq(epcOffices.id, officeId));
  revalidatePath("/", "layout");
}

// Project Actions
export async function addEpcProject(epcId: string, data: Omit<typeof epcProjects.$inferInsert, "epcId" | "id" | "createdAt" | "updatedAt">) {
  await db.insert(epcProjects).values({
    ...data,
    epcId
  });
  revalidatePath("/", "layout");
}

export async function updateEpcProject(projectId: string, data: Partial<typeof epcProjects.$inferInsert>) {
  const [project] = await db.select().from(epcProjects).where(eq(epcProjects.id, projectId));
  await db.update(epcProjects).set({ ...data, updatedAt: new Date() }).where(eq(epcProjects.id, projectId));
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
  }
  revalidatePath("/", "layout");
}

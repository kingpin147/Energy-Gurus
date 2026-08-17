"use server";

import { db } from "@/db";
import { epcInstallers, epcOffices, epcProjects, users, reviews } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getUserRole } from "@/lib/roles";
import { revalidatePath } from "next/cache";
import { redis, CACHE_KEYS } from "@/lib/redis";
import { deleteUser } from "@/lib/actions/users";

export async function getAllEpcInstallers() {
  const role = await getUserRole();
  if (role !== "super-admin" && role !== "admin") {
    throw new Error("Unauthorized access");
  }

  const list = await db
    .select({
      id: epcInstallers.id,
      userId: epcInstallers.userId,
      companyName: epcInstallers.companyName,
      ceoName: epcInstallers.ceoName,
      email: epcInstallers.email,
      contactNo: epcInstallers.contactNo,
      address: epcInstallers.address,
      area: epcInstallers.area,
      city: epcInstallers.city,
      country: epcInstallers.country,
      website: epcInstallers.website,
      logoUrl: epcInstallers.logoUrl,
      tier: epcInstallers.tier,
      isVerified: epcInstallers.isVerified,
      yearsInBusiness: epcInstallers.yearsInBusiness,
      regNumber: epcInstallers.regNumber,
      sectors: epcInstallers.sectors,
      certifications: epcInstallers.certifications,
      solarBrands: epcInstallers.solarBrands,
      inverterBrands: epcInstallers.inverterBrands,
      batteryBrands: epcInstallers.batteryBrands,
      about: epcInstallers.about,
      team: epcInstallers.team,
      licenceDocuments: epcInstallers.licenceDocuments,
      createdAt: epcInstallers.createdAt,
      userIsActive: users.isActive,
      userEmail: users.email,
    })
    .from(epcInstallers)
    .leftJoin(users, eq(users.id, epcInstallers.userId))
    .orderBy(desc(epcInstallers.createdAt));

  return list;
}

export async function getEpcFullDetails(epcId: string) {
  const role = await getUserRole();
  if (role !== "super-admin" && role !== "admin") {
    throw new Error("Unauthorized access");
  }

  const [epc] = await db
    .select()
    .from(epcInstallers)
    .where(eq(epcInstallers.id, epcId));

  if (!epc) return null;

  const offices = await db
    .select()
    .from(epcOffices)
    .where(eq(epcOffices.epcId, epcId));

  const projects = await db
    .select()
    .from(epcProjects)
    .where(eq(epcProjects.epcId, epcId))
    .orderBy(desc(epcProjects.createdAt));

  const epcReviews = await db
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
    .where(eq(reviews.targetId, epcId));

  return {
    ...epc,
    offices,
    projects,
    reviews: epcReviews,
  };
}

export async function adminUpdateEpcInstaller(epcId: string, data: {
  companyName: string;
  ceoName?: string | null;
  email?: string | null;
  contactNo?: string | null;
  address?: string | null;
  area?: string | null;
  city?: string | null;
  country?: string | null;
  website?: string | null;
  tier?: 'bronze' | 'silver' | 'gold';
  isVerified?: boolean;
  yearsInBusiness?: number | null;
  regNumber?: string | null;
  about?: string | null;
  sectors?: string[];
  certifications?: string[];
  solarBrands?: string[];
  inverterBrands?: string[];
  batteryBrands?: string[];
  team?: { name: string; designation: string; linkedIn: string; imageUrl: string }[];
  offices?: { officeNumber?: string; area?: string; city: string }[];
  projects?: { name: string; customerName?: string; companyName?: string; installationDate?: string; city?: string; country?: string; systemSize?: string; description?: string; youtubeUrl?: string }[];
}) {
  const role = await getUserRole();
  if (role !== "super-admin" && role !== "admin") {
    return { success: false, message: "Unauthorized access" };
  }

  try {
    const [existing] = await db
      .select()
      .from(epcInstallers)
      .where(eq(epcInstallers.id, epcId));

    if (!existing) {
      return { success: false, message: "EPC Installer not found" };
    }

    // 1. Update epcInstallers main record
    await db
      .update(epcInstallers)
      .set({
        companyName: data.companyName,
        ceoName: data.ceoName ?? null,
        email: data.email ?? null,
        contactNo: data.contactNo ?? null,
        address: data.address ?? null,
        area: data.area ?? null,
        city: data.city ?? null,
        country: data.country ?? 'Pakistan',
        website: data.website ?? null,
        tier: data.tier ?? 'bronze',
        isVerified: data.isVerified ?? false,
        yearsInBusiness: data.yearsInBusiness ?? null,
        regNumber: data.regNumber ?? null,
        about: data.about ?? null,
        sectors: data.sectors ?? [],
        certifications: data.certifications ?? [],
        solarBrands: data.solarBrands ?? [],
        inverterBrands: data.inverterBrands ?? [],
        batteryBrands: data.batteryBrands ?? [],
        team: data.team ?? [],
        updatedAt: new Date(),
      })
      .where(eq(epcInstallers.id, epcId));

    // 2. Update offices if provided
    if (data.offices !== undefined) {
      await db.delete(epcOffices).where(eq(epcOffices.epcId, epcId));
      if (data.offices.length > 0) {
        const officeRecords = data.offices
          .filter((o) => o.city || o.officeNumber || o.area)
          .map((o) => ({
            epcId,
            officeNumber: o.officeNumber || null,
            area: o.area || null,
            city: o.city || data.city || "Main",
          }));
        if (officeRecords.length > 0) {
          await db.insert(epcOffices).values(officeRecords);
        }
      }
    }

    // 3. Update projects if provided
    if (data.projects !== undefined) {
      await db.delete(epcProjects).where(eq(epcProjects.epcId, epcId));
      if (data.projects.length > 0) {
        const projectRecords = data.projects
          .filter((p) => p.name || p.customerName || p.companyName || p.description)
          .map((p) => ({
            epcId,
            name: p.name || p.companyName || p.customerName || "Project",
            customerName: p.customerName || null,
            companyName: p.companyName || null,
            installationDate: p.installationDate || null,
            city: p.city || null,
            country: p.country || null,
            systemSize: p.systemSize || null,
            description: p.description || null,
            youtubeUrl: p.youtubeUrl || null,
          }));
        if (projectRecords.length > 0) {
          await db.insert(epcProjects).values(projectRecords);
        }
      }
    }

    // Invalidate caches
    try {
      await redis.del(CACHE_KEYS.EPC_DETAILS(epcId));
      await redis.del(CACHE_KEYS.EPCS_LIST);
    } catch (e) {
      console.warn("Redis cache error:", e);
    }

    revalidatePath("/dashboard/admin/onboard-epc");
    revalidatePath("/epcs");
    revalidatePath("/", "layout");

    return { success: true, message: "EPC Installer updated successfully" };
  } catch (error: any) {
    console.error("Error updating EPC installer:", error);
    return { success: false, message: error?.message || "Failed to update EPC installer" };
  }
}

export async function deleteEpcInstallerAction(epcId: string, userId: string) {
  const role = await getUserRole();
  if (role !== "super-admin" && role !== "admin") {
    return { success: false, message: "Unauthorized access" };
  }

  try {
    // deleteUser handles Clerk user deletion, R2 file cleanup, and database record cleanup
    await deleteUser(userId);

    revalidatePath("/dashboard/admin/onboard-epc");
    revalidatePath("/epcs");
    revalidatePath("/", "layout");

    return { success: true, message: "EPC Installer deleted successfully" };
  } catch (error: any) {
    console.error("Error deleting EPC installer:", error);
    return { success: false, message: error?.message || "Failed to delete EPC installer" };
  }
}

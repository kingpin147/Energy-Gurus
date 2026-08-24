"use server";

import { db } from "@/db";
import { epcInstallers, epcOffices, epcProjects, users, reviews } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getUserRole } from "@/lib/roles";
import { revalidatePath } from "next/cache";
import { redis, CACHE_KEYS } from "@/lib/redis";
import { deleteUser } from "@/lib/actions/users";
import { auth } from "@clerk/nextjs/server";
import { deleteFile, extractKeyFromUrl } from "@/lib/r2";

const adminWhitelist = ["nomiking0072012@gmail.com", "energygurusonline@gmail.com"];

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
  designation?: string | null;
  businessType?: string | null;
  whatsapp?: string | null;
  coordinates?: string | null;
  photos?: string[];
  solarCertDocuments?: string[];
  inverterCertDocuments?: string[];
  batteryCertDocuments?: string[];
  team?: { name: string; designation: string; linkedIn: string; imageUrl: string }[];
  offices?: { officeNumber?: string; block?: string | null; address?: string; area?: string; city: string; country?: string; coordinates?: string; }[];
  projects?: { name: string; entryType?: 'project' | 'testimonial'; customerName?: string; companyName?: string; installationDate?: string; city?: string; country?: string; segmentType?: string[]; systemSize?: string; systemType?: string; inverterModel?: string | null; batteryModel?: string | null; solarPanelModel?: string | null; description?: string; youtubeUrl?: string }[];
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
        designation: data.designation ?? null,
        businessType: data.businessType ?? null,
        email: data.email ?? null,
        contactNo: data.contactNo ?? null,
        whatsapp: data.whatsapp ?? null,
        address: data.address ?? null,
        area: data.area ?? null,
        city: data.city ?? null,
        country: data.country ?? 'Pakistan',
        coordinates: data.coordinates ?? null,
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
        solarCertDocuments: data.solarCertDocuments ?? [],
        inverterCertDocuments: data.inverterCertDocuments ?? [],
        batteryCertDocuments: data.batteryCertDocuments ?? [],
        photos: data.photos ?? [],
        team: data.team ?? [],
        updatedAt: new Date(),
      })
      .where(eq(epcInstallers.id, epcId));

    // 2. Update offices if provided
    if (data.offices !== undefined) {
      await db.delete(epcOffices).where(eq(epcOffices.epcId, epcId));
      if (data.offices.length > 0) {
        const officeRecords = data.offices
          .filter((o) => o.city || o.address || o.area || o.block)
          .map((o) => ({
            epcId,
            officeNumber: o.officeNumber || null,
            address: o.address || null,
            block: o.block || null,
            area: o.area || null,
            city: o.city || data.city || "Main",
            country: o.country || 'Pakistan',
            coordinates: o.coordinates || null,
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
            entryType: p.entryType || 'project',
            customerName: p.customerName || null,
            companyName: p.companyName || null,
            installationDate: p.installationDate || null,
            city: p.city || null,
            country: p.country || null,
            segmentType: Array.isArray(p.segmentType) ? p.segmentType : [],
            systemSize: p.systemSize || null,
            systemType: p.systemType || null,
            inverterModel: p.inverterModel || null,
            batteryModel: p.batteryModel || null,
            solarPanelModel: p.solarPanelModel || null,
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

  const { userId: currentClerkId } = await auth();

  try {
    const [epc] = await db.select().from(epcInstallers).where(eq(epcInstallers.id, epcId));
    if (!epc) {
      return { success: false, message: "EPC Installer profile not found" };
    }

    // 1. Clean up R2 media assets for this EPC installer
    const fileUrlsToDelete: string[] = [];
    if (epc.logoUrl) fileUrlsToDelete.push(epc.logoUrl);
    if (epc.portfolio) fileUrlsToDelete.push(...epc.portfolio);
    if (epc.reviewVideos) fileUrlsToDelete.push(...epc.reviewVideos);
    if (epc.licenceDocuments) fileUrlsToDelete.push(...epc.licenceDocuments);

    const projects = await db.select().from(epcProjects).where(eq(epcProjects.epcId, epc.id));
    for (const p of projects) {
      if (p.images) fileUrlsToDelete.push(...p.images);
      if (p.videos) fileUrlsToDelete.push(...p.videos);
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

    // 2. Remove relational records (Offices, Projects, EPC profile)
    await db.delete(epcOffices).where(eq(epcOffices.epcId, epcId));
    await db.delete(epcProjects).where(eq(epcProjects.epcId, epcId));
    await db.delete(epcInstallers).where(eq(epcInstallers.id, epcId));

    // Clear Redis Caches
    try {
      await redis.del(CACHE_KEYS.EPC_DETAILS(epcId));
      await redis.del(CACHE_KEYS.EPCS_LIST);
    } catch (e) {
      console.warn("Redis cache deletion error:", e);
    }

    // 3. Check linked user before deleting user account
    if (userId) {
      const [linkedUser] = await db.select().from(users).where(eq(users.id, userId));
      
      const isSelf = linkedUser?.clerkId && linkedUser.clerkId === currentClerkId;
      const isAdminUser = linkedUser && (adminWhitelist.includes(linkedUser.email.toLowerCase()) || linkedUser.role === 'super-admin' || linkedUser.role === 'admin');

      // ONLY delete user account if it is a regular EPC account (NOT the current admin or whitelisted admin)
      if (linkedUser && !isSelf && !isAdminUser) {
        try {
          await deleteUser(userId);
        } catch (err) {
          console.warn("User account cleanup notice:", err);
        }
      }
    }

    revalidatePath("/dashboard/admin/onboard-epc");
    revalidatePath("/epcs");
    revalidatePath("/", "layout");

    return { success: true, message: "EPC Installer profile deleted successfully" };
  } catch (error: any) {
    console.error("Error deleting EPC installer:", error);
    return { success: false, message: error?.message || "Failed to delete EPC installer" };
  }
}

"use server";

import { db } from "@/db";
import { epcInstallers, epcOffices, epcProjects, users, reviews, installerCertifications } from "@/db/schema";
import { eq, desc, and, isNull } from "drizzle-orm";
import { getUserRole } from "@/lib/roles";
import { revalidatePath } from "next/cache";
import { deleteUser } from "@/lib/actions/users";
import { auth } from "@clerk/nextjs/server";
import { deleteFile, extractKeyFromUrl } from "@/lib/r2";

const adminWhitelist = ["nomiking0072012@gmail.com", "energygurusonline@gmail.com"];

export async function getAllEpcInstallers() {
  const role = await getUserRole();
  if (role !== "super-admin" && role !== "admin") {
    throw new Error("Unauthorized access");
  }

  // Auto-sync: Ensure all users with role 'epc' have a corresponding epcInstallers entry
  const missingEpc = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
    })
    .from(users)
    .leftJoin(epcInstallers, eq(users.id, epcInstallers.userId))
    .where(and(eq(users.role, "epc"), isNull(epcInstallers.id)));

  if (missingEpc.length > 0) {
    for (const epcUser of missingEpc) {
      await db
        .insert(epcInstallers)
        .values({
          userId: epcUser.id,
          companyName: epcUser.name || "Solar EPC Installer",
          email: epcUser.email,
          isVerified: true,
          status: "live",
        })
        .onConflictDoNothing();
    }
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
      serviceAreas: epcInstallers.serviceAreas,
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
      photos: epcInstallers.photos,
      solarCertDocuments: epcInstallers.solarCertDocuments,
      inverterCertDocuments: epcInstallers.inverterCertDocuments,
      batteryCertDocuments: epcInstallers.batteryCertDocuments,
      team: epcInstallers.team,
      licenceDocuments: epcInstallers.licenceDocuments,
      status: epcInstallers.status,
      adminFeedback: epcInstallers.adminFeedback,
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

  const certs = await db
    .select()
    .from(installerCertifications)
    .where(eq(installerCertifications.installerId, epcId));

  return {
    ...epc,
    offices,
    projects,
    reviews: epcReviews,
    certificationsList: certs,
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
  tier?: 'unverified' | 'bronze' | 'silver' | 'gold' | 'diamond' | 'platinum';
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
  serviceAreas?: string[];
  photos?: string[];
  solarCertDocuments?: string[];
  inverterCertDocuments?: string[];
  batteryCertDocuments?: string[];
  logoUrl?: string | null;
  licenceDocuments?: string[];
  socialLinks?: { platform: string; url: string }[];
  team?: { name: string; designation: string; linkedIn: string; imageUrl: string }[];
  offices?: { officeNumber?: string; block?: string | null; address?: string; area?: string; city: string; country?: string; coordinates?: string; }[];
  projects?: { name: string; entryType?: 'project' | 'testimonial'; customerName?: string; companyName?: string; installationDate?: string; city?: string; cities?: string[]; country?: string; segmentType?: string[]; systemSize?: string; systemType?: string; inverterModel?: string | null; batteryModel?: string | null; solarPanelModel?: string | null; description?: string; youtubeUrl?: string; images?: string[]; videos?: string[]; }[];
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
        serviceAreas: data.serviceAreas ?? existing.serviceAreas ?? [],
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
        socialLinks: data.socialLinks !== undefined ? data.socialLinks : (existing.socialLinks ?? []),
        team: data.team ?? [],
        logoUrl: data.logoUrl !== undefined ? data.logoUrl : existing.logoUrl,
        licenceDocuments: data.licenceDocuments !== undefined ? data.licenceDocuments : (existing.licenceDocuments ?? []),
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
            city: p.city || (Array.isArray(p.cities) && p.cities.length > 0 ? p.cities.join(', ') : null),
            cities: Array.isArray(p.cities) && p.cities.length > 0
              ? p.cities
              : (p.city ? p.city.split(',').map((s) => s.trim()).filter(Boolean) : []),
            country: p.country || null,
            segmentType: Array.isArray(p.segmentType) ? p.segmentType : [],
            systemSize: p.systemSize || null,
            systemType: p.systemType || null,
            inverterModel: p.inverterModel || null,
            batteryModel: p.batteryModel || null,
            solarPanelModel: p.solarPanelModel || null,
            description: p.description || null,
            youtubeUrl: p.youtubeUrl || null,
            images: Array.isArray(p.images) ? p.images : [],
            videos: Array.isArray(p.videos) ? p.videos : [],
          }));
        if (projectRecords.length > 0) {
          await db.insert(epcProjects).values(projectRecords);
        }
      }
    }

    revalidatePath("/dashboard/admin/onboard-epc");
    revalidatePath("/epcs");
    revalidatePath("/", "layout");

    return { success: true, message: "EPC Installer updated successfully" };
  } catch (error: any) {
    console.error("Error updating EPC installer:", error);
    return { success: false, message: "Failed to update EPC installer. Please try again." };
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
    return { success: false, message: "Failed to delete EPC installer. Please try again." };
  }
}

export async function adminUpdateEpcStatusAction(
  epcId: string,
  status: "draft" | "pending_review" | "changes_requested" | "live",
  adminFeedback?: string,
  tier?: string
) {
  const role = await getUserRole();
  if (role !== "super-admin" && role !== "admin") {
    return { success: false, message: "Unauthorized access" };
  }

  try {
    const [epc] = await db
      .select()
      .from(epcInstallers)
      .where(eq(epcInstallers.id, epcId));

    if (!epc) {
      return { success: false, message: "EPC Installer not found" };
    }

    const { userId } = await auth();

    const approvalHistory = Array.isArray(epc.approvalHistory) ? epc.approvalHistory : [];
    approvalHistory.push({
      date: new Date().toISOString(),
      action: `Status changed to ${status}${tier ? ` (${tier})` : ""}`,
      note: adminFeedback || undefined,
      user: userId || "admin",
    });

    const updateData: any = {
      status,
      adminFeedback: adminFeedback || null,
      approvalHistory,
      updatedAt: new Date(),
    };

    if (status === "live") {
      updateData.isVerified = true;
      if (tier) updateData.tier = tier;
    }

    await db
      .update(epcInstallers)
      .set(updateData)
      .where(eq(epcInstallers.id, epcId));

    if (epc.userId) {
      await db
        .update(users)
        .set({
          isActive: status === "live",
          updatedAt: new Date(),
        })
        .where(eq(users.id, epc.userId));
    }

    revalidatePath("/dashboard/admin/onboard-epc");
    revalidatePath(`/dashboard/admin/onboard-epc/${epcId}`);
    revalidatePath("/epcs");
    revalidatePath(`/epcs/${epcId}`);
    revalidatePath("/", "layout");

    return { success: true, message: `EPC Installer status updated to ${status}` };
  } catch (error: any) {
    console.error("Error updating EPC installer status:", error);
    return { success: false, message: "Failed to update status. Please try again." };
  }
}

/**
 * EnergyGurus Team Rating on 5 Grounds (Duly Verified by Supervisor Account)
 * 1. Physically Verification of Brand Certifications, Memberships (AEDB/PEC/ISO etc.) - 1 to 10
 * 2. Office Visited Rating - 1 to 10
 * 3. At least two site visited – Active Installations (Site Design & Quality) - 1 to 10
 * 4. Projects Pictures, Videos & Customer Testimonials verified as genuine - 1 to 10
 * 5. After Sales System - 1 to 10
 */
export async function adminSaveEgTeamRatingsAction(
  epcId: string,
  ratings: {
    physicalVerification: number;
    officeVisited: number;
    siteVisited: number;
    projectsVerified: number;
    afterSalesSystem: number;
  },
  supervisorNote?: string
) {
  const role = await getUserRole();
  if (role !== "super-admin" && role !== "admin") {
    return { success: false, message: "Unauthorized. Admin/Supervisor role required." };
  }

  try {
    const p = Math.min(10, Math.max(1, Number(ratings.physicalVerification) || 10));
    const o = Math.min(10, Math.max(1, Number(ratings.officeVisited) || 10));
    const s = Math.min(10, Math.max(1, Number(ratings.siteVisited) || 10));
    const pv = Math.min(10, Math.max(1, Number(ratings.projectsVerified) || 10));
    const a = Math.min(10, Math.max(1, Number(ratings.afterSalesSystem) || 10));

    const avgScore = ((p + o + s + pv + a) / 5).toFixed(1);

    const egTeamRatingsObj = {
      physicalVerification: p,
      officeVisited: o,
      siteVisited: s,
      projectsVerified: pv,
      afterSalesSystem: a,
    };

    const { userId } = await auth();

    const [existing] = await db
      .select({ approvalHistory: epcInstallers.approvalHistory })
      .from(epcInstallers)
      .where(eq(epcInstallers.id, epcId));

    const approvalHistory = Array.isArray(existing?.approvalHistory) ? existing.approvalHistory : [];
    approvalHistory.push({
      date: new Date().toISOString(),
      action: `EnergyGurus Team Assessment recorded: ${avgScore}/10 (Supervisor Verified)`,
      note: supervisorNote || undefined,
      user: userId || "supervisor",
    });

    await db
      .update(epcInstallers)
      .set({
        egRating: avgScore,
        egTeamRatings: egTeamRatingsObj,
        approvalHistory,
        updatedAt: new Date(),
      })
      .where(eq(epcInstallers.id, epcId));

    revalidatePath("/dashboard/admin/onboard-epc");
    revalidatePath(`/dashboard/admin/onboard-epc/${epcId}`);
    revalidatePath("/epcs");
    revalidatePath(`/epcs/${epcId}`);
    revalidatePath("/", "layout");

    return {
      success: true,
      score: avgScore,
      message: `EnergyGurus Team rating of ${avgScore}/10 successfully verified and saved by Supervisor.`,
    };
  } catch (error: any) {
    console.error("Error saving EnergyGurus team ratings:", error);
    return { success: false, message: "Failed to save EnergyGurus team ratings." };
  }
}

"use server";

import { db } from "@/db";
import { installerCertifications, epcInstallers, brands, users } from "@/db/schema";
import { eq, and, desc, count } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { getUserRole } from "@/lib/roles";
import { calculateInstallerTier } from "@/lib/utils/tier-calculator";
import { certificationSubmissionSchema } from "@/lib/validations/schemas";

/**
 * Installer submits a brand certification with proof
 */
export async function submitCertificationAction(formData: FormData) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return { success: false, message: "Unauthorized" };

    const [user] = await db.select().from(users).where(eq(users.clerkId, clerkId));
    if (!user) return { success: false, message: "User not found" };

    const [installer] = await db
      .select()
      .from(epcInstallers)
      .where(eq(epcInstallers.userId, user.id));

    if (!installer) return { success: false, message: "Installer profile not found" };

    const rawData = {
      brandName: (formData.get("brandName") as string)?.trim(),
      certifiedSince: (formData.get("certifiedSince") as string)?.trim() || null,
      proofUrl: (formData.get("proofUrl") as string)?.trim() || null,
      brandId: (formData.get("brandId") as string)?.trim() || null,
      installerId: installer.id
    };

    const validated = certificationSubmissionSchema.safeParse(rawData);
    if (!validated.success) {
      const firstError = validated.error.issues[0]?.message || "Validation failed";
      return { success: false, message: firstError };
    }

    const { brandName, certifiedSince, proofUrl, brandId } = validated.data;

    const [newCert] = await db
      .insert(installerCertifications)
      .values({
        installerId: installer.id,
        brandId: brandId || undefined,
        brandName,
        certifiedSince,
        proofUrl,
        brandStatus: "pending",
        adminStatus: "pending",
        status: "pending_brand"
      })
      .returning();

    revalidatePath("/dashboard/epc");
    revalidatePath("/installers");

    return {
      success: true,
      message: "Certification submitted. It will be sent to the brand for initial review.",
      certification: newCert
    };
  } catch (error: any) {
    console.error("[submitCertificationAction Error]:", error);
    return { success: false, message: error?.message || "Failed to submit certification" };
  }
}

/**
 * Brand Partner approves the certification with note
 */
export async function brandApproveCertificationAction(certId: string, notes: string, rating?: string) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return { success: false, message: "Unauthorized" };

    const [cert] = await db
      .select()
      .from(installerCertifications)
      .where(eq(installerCertifications.id, certId));

    if (!cert) return { success: false, message: "Certification not found" };

    await db
      .update(installerCertifications)
      .set({
        brandStatus: "approved",
        brandApprovedAt: new Date(),
        brandNotes: notes,
        brandRating: rating || "4.8",
        status: "pending_admin",
        updatedAt: new Date()
      })
      .where(eq(installerCertifications.id, certId));

    revalidatePath("/dashboard/brand");
    revalidatePath("/dashboard/admin/certifications");

    return { success: true, message: "Approved by Brand. Transferred to EnergyGurus for final confirmation." };
  } catch (error: any) {
    console.error("[brandApproveCertificationAction Error]:", error);
    return { success: false, message: error?.message || "Failed to approve certification" };
  }
}

/**
 * EnergyGurus Admin confirms & publishes certification to public profile
 * Automatically recalculates and updates the installer's overall Tier!
 */
export async function adminConfirmCertificationAction(certId: string, adminNotes?: string) {
  try {
    const role = await getUserRole();
    if (role !== "admin" && role !== "super-admin") {
      return { success: false, message: "Unauthorized. Admin role required." };
    }

    const [cert] = await db
      .select()
      .from(installerCertifications)
      .where(eq(installerCertifications.id, certId));

    if (!cert) return { success: false, message: "Certification not found" };

    // 1. Mark certification as live
    await db
      .update(installerCertifications)
      .set({
        adminStatus: "approved",
        adminApprovedAt: new Date(),
        adminNotes: adminNotes || "Confirmed by EnergyGurus Admin after document verification.",
        status: "live",
        updatedAt: new Date()
      })
      .where(eq(installerCertifications.id, certId));

    // 2. Count all live confirmed certifications for this installer
    const liveCerts = await db
      .select()
      .from(installerCertifications)
      .where(
        and(
          eq(installerCertifications.installerId, cert.installerId),
          eq(installerCertifications.status, "live")
        )
      );

    const confirmedCount = liveCerts.length;
    const tierResult = calculateInstallerTier(confirmedCount, true);

    // 3. Update installer record with recalculated tier & brandsCertified list
    const brandNames = Array.from(new Set(liveCerts.map((c) => c.brandName)));

    await db
      .update(epcInstallers)
      .set({
        tier: tierResult.tier,
        brandsCertified: brandNames,
        updatedAt: new Date()
      })
      .where(eq(epcInstallers.id, cert.installerId));

    revalidatePath("/dashboard/admin/certifications");
    revalidatePath("/installers");
    revalidatePath(`/installers/${cert.installerId}`);
    revalidatePath("/dashboard/epc");

    return {
      success: true,
      message: `Certification published! Installer tier updated to ${tierResult.label} (${confirmedCount} confirmed).`
    };
  } catch (error: any) {
    console.error("[adminConfirmCertificationAction Error]:", error);
    return { success: false, message: error?.message || "Failed to confirm certification" };
  }
}

/**
 * Reject certification (by Brand or EnergyGurus Admin)
 */
export async function rejectCertificationAction(certId: string, reason: string, isBrand: boolean = false) {
  try {
    const role = await getUserRole();
    const { userId: clerkId } = await auth();

    if (!clerkId) return { success: false, message: "Unauthorized" };

    const [cert] = await db
      .select()
      .from(installerCertifications)
      .where(eq(installerCertifications.id, certId));

    if (!cert) return { success: false, message: "Certification not found" };

    if (isBrand) {
      await db
        .update(installerCertifications)
        .set({
          brandStatus: "rejected",
          brandNotes: reason,
          status: "rejected",
          updatedAt: new Date()
        })
        .where(eq(installerCertifications.id, certId));
    } else {
      if (role !== "admin" && role !== "super-admin") {
        return { success: false, message: "Unauthorized. Admin role required." };
      }

      await db
        .update(installerCertifications)
        .set({
          adminStatus: "rejected",
          adminNotes: reason,
          status: "rejected",
          updatedAt: new Date()
        })
        .where(eq(installerCertifications.id, certId));
    }

    revalidatePath("/dashboard/admin/certifications");
    revalidatePath("/dashboard/brand");
    revalidatePath("/dashboard/epc");

    return { success: true, message: "Certification rejected with feedback note." };
  } catch (error: any) {
    console.error("[rejectCertificationAction Error]:", error);
    return { success: false, message: error?.message || "Failed to reject certification" };
  }
}

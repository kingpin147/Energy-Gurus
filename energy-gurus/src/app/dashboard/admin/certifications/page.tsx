import { db } from "@/db";
import { installerCertifications, epcInstallers, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getUserRole } from "@/lib/roles";
import { redirect } from "next/navigation";
import { CertificationModerationClient } from "./CertificationModerationClient";

export const dynamic = "force-dynamic";

export default async function CertificationApprovalsPage() {
  const role = await getUserRole();
  if (role !== "admin" && role !== "super-admin") {
    redirect("/dashboard");
  }

  let formattedCerts: any[] = [];

  try {
    // Fetch all certifications with installer details safely
    const rawCerts = await db
      .select({
        id: installerCertifications.id,
        installerId: installerCertifications.installerId,
        brandId: installerCertifications.brandId,
        brandName: installerCertifications.brandName,
        certifiedSince: installerCertifications.certifiedSince,
        proofUrl: installerCertifications.proofUrl,
        brandRating: installerCertifications.brandRating,
        brandStatus: installerCertifications.brandStatus,
        brandApprovedAt: installerCertifications.brandApprovedAt,
        brandNotes: installerCertifications.brandNotes,
        adminStatus: installerCertifications.adminStatus,
        adminApprovedAt: installerCertifications.adminApprovedAt,
        adminNotes: installerCertifications.adminNotes,
        status: installerCertifications.status,
        createdAt: installerCertifications.createdAt,
        installerName: epcInstallers.companyName,
        installerCity: epcInstallers.city,
        installerTier: epcInstallers.tier,
        installerLogo: epcInstallers.logoUrl
      })
      .from(installerCertifications)
      .leftJoin(epcInstallers, eq(installerCertifications.installerId, epcInstallers.id))
      .orderBy(desc(installerCertifications.createdAt));

    formattedCerts = rawCerts.map((c) => ({
      ...c,
      installerName: c.installerName || "Solar Installer",
      createdAt: c.createdAt ? new Date(c.createdAt).toISOString() : new Date().toISOString(),
      brandApprovedAt: c.brandApprovedAt ? new Date(c.brandApprovedAt).toISOString() : null,
      adminApprovedAt: c.adminApprovedAt ? new Date(c.adminApprovedAt).toISOString() : null,
    }));
  } catch (error) {
    console.error("Error fetching certifications for moderation:", error);
    formattedCerts = [];
  }

  return (
    <div className="min-h-screen bg-cream text-ink">
      {/* Page Header */}
      <div className="bg-white border-b border-line py-8 px-6 md:px-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 text-xs text-slate-custom mb-2">
            <span>Installers</span>
            <span>/</span>
            <span className="text-navy-deep font-semibold">Certification Approvals</span>
          </div>
          <h1 className="font-fraunces text-2xl md:text-3xl font-bold text-navy-deep">
            Certification Approvals
          </h1>
          <p className="text-xs md:text-sm text-slate-custom mt-2 max-w-3xl leading-relaxed">
            The final step in the certification pipeline. Everything here has already been approved by the brand — confirm proof to publish it to the installer's live profile. Confirming automatically recalculates the installer's overall tier (Silver / Gold / Diamond / Platinum).
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 md:px-10 py-8">
        <CertificationModerationClient certifications={formattedCerts} />
      </div>
    </div>
  );
}

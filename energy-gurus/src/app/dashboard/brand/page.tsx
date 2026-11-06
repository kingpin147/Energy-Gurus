import { db } from "@/db";
import { brands, products, users, news, installerCertifications, epcInstallers } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { getUserRole } from "@/lib/roles";
import { redirect } from "next/navigation";
import { eq, desc, or, ilike } from "drizzle-orm";
import { BrandSubmissionEditor } from "@/components/dashboard/BrandSubmissionEditor";

export default async function BrandDashboard() {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  const role = await getUserRole();
  if (role !== "brand" && role !== "admin" && role !== "super-admin") {
    redirect("/dashboard");
  }

  const [dbUser] = await db.select().from(users).where(eq(users.clerkId, clerkId));
  if (!dbUser) redirect("/dashboard");

  let [myBrand] = await db.select().from(brands).where(eq(brands.userId, dbUser.id));

  // Auto-create Brand profile placeholder if it doesn't exist
  if (!myBrand) {
    [myBrand] = await db
      .insert(brands)
      .values({
        userId: dbUser.id,
        brandName: dbUser.name || "Solar Brand",
        status: "draft",
        isVerified: false
      })
      .returning();
  }

  const brandProducts = await db
    .select()
    .from(products)
    .where(eq(products.brandId, myBrand.id))
    .orderBy(desc(products.createdAt));

  // Fetch news & updates posted by this brand
  const brandArticles = await db
    .select()
    .from(news)
    .where(eq(news.authorId, dbUser.id))
    .orderBy(desc(news.createdAt));

  // Fetch installer certification claims targeting this brand
  const brandCertificationsRaw = await db
    .select({
      id: installerCertifications.id,
      installerId: installerCertifications.installerId,
      brandId: installerCertifications.brandId,
      brandName: installerCertifications.brandName,
      certifiedSince: installerCertifications.certifiedSince,
      proofUrl: installerCertifications.proofUrl,
      brandRating: installerCertifications.brandRating,
      brandRatings: installerCertifications.brandRatings,
      brandStatus: installerCertifications.brandStatus,
      brandApprovedAt: installerCertifications.brandApprovedAt,
      brandNotes: installerCertifications.brandNotes,
      adminStatus: installerCertifications.adminStatus,
      status: installerCertifications.status,
      createdAt: installerCertifications.createdAt,
      installerName: epcInstallers.companyName,
      installerCity: epcInstallers.city,
      installerTier: epcInstallers.tier,
      installerLogo: epcInstallers.logoUrl,
    })
    .from(installerCertifications)
    .leftJoin(epcInstallers, eq(installerCertifications.installerId, epcInstallers.id))
    .where(
      or(
        eq(installerCertifications.brandId, myBrand.id),
        ilike(installerCertifications.brandName, `%${myBrand.brandName}%`)
      )
    )
    .orderBy(desc(installerCertifications.createdAt));

  const brandCertifications = brandCertificationsRaw.map((c) => ({
    ...c,
    installerName: c.installerName || "Solar Installer",
    createdAt: c.createdAt ? new Date(c.createdAt).toISOString() : new Date().toISOString(),
    brandApprovedAt: c.brandApprovedAt ? new Date(c.brandApprovedAt).toISOString() : null,
  }));

  return (
    <BrandSubmissionEditor
      brand={myBrand}
      products={brandProducts}
      currentUser={dbUser}
      brandArticles={brandArticles}
      brandCertifications={brandCertifications}
    />
  );
}

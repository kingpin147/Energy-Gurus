import { EpcProfileView } from "@/components/epcs/EpcProfileView";
import { db } from "@/db";
import { epcInstallers, epcOffices, epcProjects } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getEpcCompleteness } from "@/lib/utils/completeness";
import { getProfileRating } from "@/lib/actions/reviews";
import { isUUID, slugify } from "@/lib/utils/slug";
import { or, ilike } from "drizzle-orm";

async function getInstallerByParam(param: string) {
  const decoded = decodeURIComponent(param).trim();
  if (isUUID(decoded)) {
    const installer = await db.query.epcInstallers.findFirst({
      where: eq(epcInstallers.id, decoded),
      with: { user: true }
    });
    if (installer) return installer;
  }

  const fuzzyName = `%${decoded.replace(/-/g, "%")}%`;
  const installerBySlug = await db.query.epcInstallers.findFirst({
    where: or(
      eq(epcInstallers.slug, decoded),
      ilike(epcInstallers.companyName, fuzzyName),
      ilike(epcInstallers.companyName, decoded)
    ),
    with: { user: true }
  });

  return installerBySlug || null;
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ id: string; locale?: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const installer = await getInstallerByParam(id);

  if (!installer) return {};

  const baseUrl = "https://www.energygurus.online";
  const slug = installer.slug || slugify(installer.companyName);
  const title = `${installer.companyName} | Verified Solar EPC | EnergyGurus`;
  const description = installer.about?.slice(0, 160) || `Learn more about ${installer.companyName}, a certified solar installer providing high-quality energy solutions.`;
  const url = `${baseUrl}/installers/${slug}`;

  return {
    title,
    description,
    keywords: [
      installer.companyName,
      `${installer.companyName} solar Pakistan`,
      `${installer.companyName} reviews`,
      `${installer.companyName} solar projects`,
      "verified solar EPC installer Pakistan",
      "best solar installers in Pakistan",
      "top solar companies in Pakistan",
      "net metering certified installer",
      "solar installation near me"
    ],
    alternates: {
      canonical: url
    },
    openGraph: {
      title,
      description,
      url,
      siteName: "EnergyGurus",
      type: "website",
      images: installer.logoUrl ? [{ url: installer.logoUrl, width: 800, height: 800, alt: installer.companyName }] : [{ url: `${baseUrl}/new_hero_banner.jpg`, width: 1200, height: 630, alt: installer.companyName }]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: installer.logoUrl ? [installer.logoUrl] : [`${baseUrl}/new_hero_banner.jpg`]
    }
  };
}

export default async function EpcProfilePage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const installer = await getInstallerByParam(id);

  if (!installer || !(installer as any).user?.isActive) return notFound();

  const realId = installer.id;
  const offices = await db.select().from(epcOffices).where(eq(epcOffices.epcId, realId));
  const projects = await db.select().from(epcProjects).where(eq(epcProjects.epcId, realId));
  const { rating, count } = await getProfileRating(realId);

  const { score } = getEpcCompleteness(installer, offices.length, projects.length);
  if (score < 50) notFound();

  return (
    <EpcProfileView
      installer={installer}
      offices={offices}
      projects={projects}
      rating={rating}
      count={count}
      isActive={(installer as any).user?.isActive ?? true}
    />
  );
}

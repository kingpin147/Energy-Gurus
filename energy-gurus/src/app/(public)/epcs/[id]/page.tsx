import { EpcProfileView } from "@/components/epcs/EpcProfileView";
import { db } from "@/db";
import { epcInstallers, epcOffices, epcProjects } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getEpcCompleteness } from "@/lib/utils/completeness";
import {
  Globe,
  Facebook,
  Instagram,
  Linkedin,
  Youtube,
  Play,
  Star
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ReviewForm } from "@/components/forms/review-form";
import { ReviewList } from "@/components/reviews/review-list";
import { getProfileRating, getTeamRating } from "@/lib/actions/reviews";
import { redis, CACHE_KEYS } from "@/lib/redis";
import { InferSelectModel } from "drizzle-orm";
import { InstallerQuoteForm } from "@/components/forms/installer-quote-form";
import { TrackedInteraction } from "@/components/shared/AnalyticsTracker";

import { isUUID, slugify } from "@/lib/utils/slug";
import { or, ilike } from "drizzle-orm";

type EpcInstaller = InferSelectModel<typeof epcInstallers>;
type EpcOffice = InferSelectModel<typeof epcOffices>;
type EpcProject = InferSelectModel<typeof epcProjects>;

interface EpcProfileData {
  installer: EpcInstaller;
  offices: EpcOffice[];
  projects: EpcProject[];
  rating: number | null;
  count: number;
  isActive: boolean;
}

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
  const { id, locale = "en" } = await params;
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
      "best solar installers in Pakistan",
      "top solar companies in Pakistan",
      "solar installation near me",
      "verified EPC installers",
      installer.companyName
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

function renderStars(rating: number) {
  const fullStars = Math.floor(rating);
  return "★".repeat(Math.min(5, fullStars)) + "☆".repeat(Math.max(0, 5 - fullStars));
}

function getYouTubeId(url: string) {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&]{11})/);
  return match ? match[1] : null;
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
  const cacheKey = CACHE_KEYS.EPC_DETAILS(realId);

  let profileData: EpcProfileData | null = await redis.get<EpcProfileData>(cacheKey);

  if (!profileData) {

    const offices = await db.select().from(epcOffices).where(eq(epcOffices.epcId, realId));
    const projects = await db.select().from(epcProjects).where(eq(epcProjects.epcId, realId));
    const { rating, count } = await getProfileRating(realId);

    profileData = { installer, offices, projects, rating, count, isActive: (installer as any).user?.isActive || false };
    await redis.set(cacheKey, profileData, { ex: 3600 });
  }

  if (!profileData || !profileData.isActive) return notFound();

  const { offices, projects, rating, count } = profileData;

  const { score } = getEpcCompleteness(installer, offices.length, projects.length);
  if (score < 50) notFound();

  const { rating: teamRating, count: teamCount } = await getTeamRating(installer.id, "epc");

  const primaryCity = offices[0]?.city || "Lahore";
  const yearsInBusiness = Math.max(1, new Date().getFullYear() - new Date(installer.createdAt).getFullYear());

  const certBrands = (installer.brandsCertified as string[])?.length > 0 
    ? (installer.brandsCertified as string[]) 
    : ["LONGI", "JINKO", "JA", "TRINA", "HUAWEI"];

  const solarBrands = (installer.solarBrands as string[]) || [];
  const inverterBrands = (installer.inverterBrands as string[]) || [];
  const batteryBrands = (installer.batteryBrands as string[]) || [];

  const team = (installer.team as { name: string; designation: string; linkedIn: string; imageUrl: string }[]) || [];

  const sectorsList = (installer.sectors as string[])?.length > 0
    ? (installer.sectors as string[])
    : ["Residential", "Commercial", "Industrial", "Agriculture"];

  const certificationsList = (installer.certifications as string[])?.length > 0
    ? (installer.certifications as string[])
    : [];

  const socialLinks = (installer.socialLinks as { platform: string; url: string }[] | null) || [];
  const websiteUrl = installer.website || socialLinks.find(l => l.platform.toLowerCase() === "website")?.url || "#";
  const facebookUrl = socialLinks.find(l => l.platform.toLowerCase() === "facebook")?.url || "#";
  const instagramUrl = socialLinks.find(l => l.platform.toLowerCase() === "instagram")?.url || "#";
  const linkedinUrl = socialLinks.find(l => l.platform.toLowerCase() === "linkedin")?.url || "#";
  const youtubeUrl = socialLinks.find(l => l.platform.toLowerCase() === "youtube")?.url || "#";
  const photos = (installer.photos as string[] | null) || [];
  const reviewVideos = (installer.reviewVideos as string[] | null) || [];
  const testimonialProjects = projects.filter((project) => project.entryType === "testimonial" || project.customerName || project.companyName || project.youtubeUrl);
  const customerVideoEntries = testimonialProjects.length > 0 ? testimonialProjects.slice(0, 3) : reviewVideos.slice(0, 3).map((url, index) => ({
    id: `${index}-review-video`,
    name: `Customer Testimonial ${index + 1}`,
    customerName: `Verified customer ${index + 1}`,
    city: primaryCity,
    youtubeUrl: url,
  }));
  const portfolioFallback = photos.length > 0 ? photos : projects.flatMap((project) => project.images || []);

    return (
    <EpcProfileView
      installer={installer}
      offices={offices}
      projects={projects}
      rating={rating}
      count={count}
      isActive={profileData.isActive}
    />
  );
}

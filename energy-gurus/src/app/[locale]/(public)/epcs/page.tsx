import { db } from "@/db";
import { epcInstallers, reviews, users, epcOffices, epcProjects } from "@/db/schema";
import { desc, asc, eq, sql, ilike, and } from "drizzle-orm";
import Image from "next/image";
import { unstable_cache } from "next/cache";
import { getEpcCompleteness } from "@/lib/utils/completeness";
import { AdBanner } from "@/components/shared/AdBanner";
import { TrackedLink } from "@/components/shared/AnalyticsTracker";
import { InstallerFilters } from "@/components/shared/installer-filters";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const baseUrl = "https://www.energygurus.online";
  const title = "Certified Solar EPC Installers in Pakistan | Verified Directory";
  const description = "Directory of pre-verified solar EPC companies in Pakistan. Compare ratings, completed projects, office locations, and technical certifications.";

  return {
    title,
    description,
    alternates: {
      canonical: `${baseUrl}/${locale}/epcs`,
      languages: {
        en: `${baseUrl}/en/epcs`,
        ur: `${baseUrl}/ur/epcs`,
        "x-default": `${baseUrl}/en/epcs`,
      },
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/${locale}/epcs`,
      siteName: "EnergyGurus",
      locale: locale === "ur" ? "ur_PK" : "en_US",
      type: "website",
      images: [{ url: `${baseUrl}/new_hero_banner.jpg`, width: 1200, height: 630, alt: "Solar Installers Pakistan" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${baseUrl}/new_hero_banner.jpg`],
    },
  };
}

const getInstallers = unstable_cache(
  async (sort: string, q?: string, cert?: string, spec?: string) => {
    let conditions = [
      eq(users.isActive, true),
      eq(users.role, 'epc'),
    ];

    if (q) {
      conditions.push(
        sql`(${epcInstallers.companyName} ILIKE ${`%${q}%`} OR ${epcOffices.city} ILIKE ${`%${q}%`})`
      );
    }

    if (spec && spec !== "All") {
      conditions.push(sql`${epcInstallers.sectors} ? ${spec}`);
    }

    if (cert && cert !== "All") {
      conditions.push(sql`${epcInstallers.certifications} ? ${cert}`);
    }

    const rawInstallers = await db
      .select({
        id: epcInstallers.id,
        companyName: epcInstallers.companyName,
        ceoName: epcInstallers.ceoName,
        sectors: epcInstallers.sectors,
        certifications: epcInstallers.certifications,
        logoUrl: epcInstallers.logoUrl,
        about: epcInstallers.about,
        website: epcInstallers.website,
        socialLinks: epcInstallers.socialLinks,
        isVerified: epcInstallers.isVerified,
        createdAt: epcInstallers.createdAt,
        avgRating: sql<number>`COALESCE(CAST(AVG(${reviews.rating}) AS FLOAT), 0)`.as('avg_rating'),
        reviewCount: sql<number>`COUNT(DISTINCT ${reviews.id})`.as('review_count'),
        officesCount: sql<number>`(SELECT COUNT(*) FROM ${epcOffices} WHERE ${epcOffices.epcId} = ${epcInstallers.id})`.mapWith(Number),
        projectsCount: sql<number>`(SELECT COUNT(*) FROM ${epcProjects} WHERE ${epcProjects.epcId} = ${epcInstallers.id})`.mapWith(Number),
        primaryCity: sql<string>`(SELECT city FROM ${epcOffices} WHERE ${epcOffices.epcId} = ${epcInstallers.id} LIMIT 1)`.as('primary_city'),
      })
      .from(epcInstallers)
      .innerJoin(users, eq(users.id, epcInstallers.userId))
      .leftJoin(reviews, eq(reviews.targetId, epcInstallers.id))
      .leftJoin(epcOffices, eq(epcOffices.epcId, epcInstallers.id))
      .where(and(...conditions))
      .groupBy(epcInstallers.id)
      .orderBy((t) => {
        if (sort === "top-rated") return [desc(t.avgRating), desc(t.reviewCount)];
        if (sort === "lowest-rated") return [asc(t.avgRating), asc(t.reviewCount)];
        if (sort === "oldest") return asc(t.createdAt);
        return desc(t.createdAt);
      });

    const mapped = rawInstallers.map(inst => {
      const { score } = getEpcCompleteness(inst, inst.officesCount || 0, inst.projectsCount || 0);
      return { ...inst, score };
    });

    return mapped.filter(inst => inst.score >= 40);
  },
  ['epc-installers-list-v4'],
  { revalidate: 3600, tags: ['epcs'] }
);

function renderStars(rating: number) {
  const fullStars = Math.floor(rating);
  const starsStr = "★".repeat(Math.min(5, fullStars)) + "☆".repeat(Math.max(0, 5 - fullStars));
  return starsStr;
}

export default async function EpcListingPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; q?: string; cert?: string; spec?: string }>;
}) {
  const { sort = "top-rated", q = "", cert = "All", spec = "All" } = await searchParams;

  const installers = await getInstallers(sort, q, cert, spec);

  return (
    <div className="font-sans text-graphite bg-paper leading-relaxed selection:bg-amber/20 min-h-screen">
      
      {/* Header */}
      <header className="bg-ink text-white pt-[64px] pb-[44px]">
        <div className="max-w-[1180px] mx-auto px-5 md:px-8">
          <p className="font-ibm-plex-mono text-[0.76rem] tracking-[0.14em] uppercase text-amber flex items-center gap-2.5 mb-[18px]">
            <span className="w-5 h-[1px] bg-amber"></span>
            Installer Directory
          </p>
          <h1 className="font-space-grotesk font-semibold text-[clamp(2rem,4vw,2.8rem)] tracking-[-0.01em]">
            Find a certified installer near you.
          </h1>
          <p className="text-paper/70 max-w-[560px] mt-[14px] text-[1.02rem]">
            Every installer in our network is vetted for certification, licensing, and track record — so you can request a quote with confidence.
          </p>
        </div>
      </header>

      {/* Filters Bar */}
      <InstallerFilters totalCount={installers.length} />

      {/* Installer List */}
      <section className="py-[48px] pb-[96px]">
        <div className="max-w-[1180px] mx-auto px-5 md:px-8">
          
          <div className="flex flex-col gap-4">
            {installers.map((installer) => {
              const yearsInBusiness = Math.max(1, new Date().getFullYear() - new Date(installer.createdAt).getFullYear());
              const locationText = installer.primaryCity ? `Serving ${installer.primaryCity}` : "Serving Pakistan";

              return (
                <TrackedLink
                  key={installer.id}
                  href={`/epcs/${installer.id}` as any}
                  className="bg-white border border-line rounded-[4px] p-[26px_28px] grid grid-cols-1 sm:grid-cols-[56px_1fr_auto] gap-[22px] items-center hover:border-teal transition-colors group"
                  eventName="epc_profile_view"
                  eventProperties={{ epcId: installer.id, companyName: installer.companyName }}
                >
                  {/* Avatar */}
                  <div className="w-[56px] h-[56px] rounded-[6px] bg-ink text-amber flex items-center justify-center font-space-grotesk font-bold text-[1.15rem] overflow-hidden shrink-0">
                    {installer.logoUrl ? (
                      <Image
                        src={installer.logoUrl}
                        width={56}
                        height={56}
                        className="object-cover w-full h-full"
                        alt={installer.companyName}
                      />
                    ) : (
                      installer.companyName.substring(0, 2).toUpperCase()
                    )}
                  </div>

                  {/* Info */}
                  <div>
                    <h3 className="font-space-grotesk font-semibold text-[1.12rem] text-ink mb-1">
                      {installer.companyName}
                    </h3>
                    <div className="text-[0.88rem] text-slate-custom mb-[10px]">
                      {locationText} · {yearsInBusiness} {yearsInBusiness === 1 ? "yr" : "yrs"} in business
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(installer.certifications as string[])?.map((cert, i) => (
                        <span key={`cert-${i}`} className="font-ibm-plex-mono text-[0.68rem] tracking-[0.05em] uppercase text-teal bg-[rgba(47,110,98,0.1)] px-[9px] py-1 rounded-[20px]">
                          {cert}
                        </span>
                      ))}
                      {(installer.sectors as string[])?.map((sector, i) => (
                        <span key={`sector-${i}`} className="font-ibm-plex-mono text-[0.68rem] tracking-[0.05em] uppercase text-teal bg-[rgba(47,110,98,0.1)] px-[9px] py-1 rounded-[20px]">
                          {sector}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Right side rating & action button */}
                  <div className="text-left sm:text-right flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2.5 mt-2 sm:mt-0">
                    <div className="font-ibm-plex-mono text-[0.88rem] text-graphite flex items-center gap-1.5">
                      <span className="text-amber">{renderStars(installer.avgRating || 5)}</span>
                      <span>{installer.avgRating ? installer.avgRating.toFixed(1) : "5.0"} ({installer.reviewCount || 0})</span>
                    </div>
                    <span className="text-[0.85rem] font-semibold text-ink border border-line rounded-[3px] px-4 py-[9px] group-hover:border-ink transition-colors inline-block">
                      View Profile
                    </span>
                  </div>

                </TrackedLink>
              );
            })}
          </div>

          {installers.length === 0 && (
            <div className="py-20 text-center bg-white border border-line rounded-[4px]">
              <h3 className="font-space-grotesk font-semibold text-xl text-ink mb-2">No Installers Found</h3>
              <p className="text-slate-custom text-[0.95rem]">
                Try adjusting your search query or filters.
              </p>
            </div>
          )}

          {/* Ad Banner */}
          {installers.length >= 3 && (
            <div className="mt-12 w-full flex justify-center">
              <AdBanner variant="horizontal" slot={1} />
            </div>
          )}

        </div>
      </section>
    </div>
  );
}

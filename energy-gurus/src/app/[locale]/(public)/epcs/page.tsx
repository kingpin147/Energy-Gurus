import { db } from "@/db";
import { epcInstallers, reviews, users, epcOffices, epcProjects } from "@/db/schema";
import { MapPin, Star, ShieldCheck, ArrowRight, Zap, Briefcase, MessageSquare } from "lucide-react";
import { TrackedLink } from "@/components/shared/AnalyticsTracker";
import { ListSort } from "@/components/shared/list-sort";
import { ListSearch } from "@/components/shared/list-search";
import { desc, asc, eq, sql, ilike, and } from "drizzle-orm";
import Image from "next/image";
import { unstable_cache } from "next/cache";
import { getEpcCompleteness } from "@/lib/utils/completeness";
import { AdBanner } from "@/components/shared/AdBanner";
import { CompareToggle } from "@/components/shared/compare-toggle";

const getInstallers = unstable_cache(
  async (sort: string, q?: string, city?: string, sector?: string) => {
    let conditions = [
      eq(users.isActive, true),
      eq(users.role, 'epc'),
    ];

    if (q) conditions.push(ilike(epcInstallers.companyName, `%${q}%`));
    if (sector) conditions.push(sql`${epcInstallers.sectors} ? ${sector}`);

    // City filter requires joining with offices
    let cityCondition = sql`true`;
    if (city) {
      cityCondition = eq(epcOffices.city, city);
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
      })
      .from(epcInstallers)
      .innerJoin(users, eq(users.id, epcInstallers.userId))
      .leftJoin(reviews, eq(reviews.targetId, epcInstallers.id))
      .leftJoin(epcOffices, eq(epcOffices.epcId, epcInstallers.id))
      .where(and(...conditions, cityCondition))
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

    return mapped.filter(inst => inst.score >= 40); // Lowered slightly to show more results as requested
  },
  ['epc-installers-list-v3'],
  { revalidate: 3600, tags: ['epcs'] }
);

import { ListFilters } from "@/components/shared/list-filters";

const PAKISTAN_CITIES = [
  "Lahore", "Karachi", "Islamabad", "Rawalpindi",
  "Faisalabad", "Multan", "Peshawar", "Quetta", "Gujranwala", "Sialkot"
];

const EPC_SECTORS = ["Residential", "Commercial", "Industrial", "Agriculture"];

export default async function EpcListingPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; q?: string; city?: string; sector?: string }>;
}) {
  const { sort = "top-rated", q = "", city = "", sector = "" } = await searchParams;

  const installers = await getInstallers(sort, q, city, sector);

  return (
    <div className="font-sans text-graphite bg-paper leading-relaxed selection:bg-amber/20 overflow-x-hidden min-h-screen">
      
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

      <div className="bg-white border-b border-line sticky top-[72px] z-40">
        <div className="max-w-[1180px] mx-auto px-5 md:px-8 py-[18px] flex flex-wrap gap-5 items-center">
          <ListSearch
            placeholder="Search company..."
            icon={<span className="absolute left-3 top-1/2 -translate-y-1/2 font-ibm-plex-mono text-[0.8rem] text-slate-custom">📍</span>}
            className="border border-line rounded-[3px] pr-3.5 py-2.5 font-sans text-[0.88rem] bg-paper text-graphite h-auto focus:ring-amber/20 focus:border-amber transition-all shadow-none w-full min-w-[220px]"
          />
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <label className="font-ibm-plex-mono text-[0.72rem] tracking-[0.06em] uppercase text-slate-custom">Sort</label>
            <div className="border border-line rounded-[3px] bg-paper text-graphite flex items-center px-2 py-1">
              <ListSort
                defaultValue="top-rated"
                options={[
                  { label: "Top Rated", value: "top-rated" },
                  { label: "Lowest Rated", value: "lowest-rated" },
                  { label: "Newest First", value: "latest" },
                  { label: "Oldest First", value: "oldest" },
                ]}
              />
            </div>
          </div>
          <div className="flex items-center gap-2.5 w-full sm:w-auto ml-0 sm:ml-4 border-l-0 sm:border-l border-line sm:pl-4">
             <ListFilters cities={PAKISTAN_CITIES} sectors={EPC_SECTORS} />
          </div>
          
          <span className="ml-auto font-ibm-plex-mono text-[0.82rem] text-slate-custom mt-4 sm:mt-0">
            {installers.length} installers found
          </span>
        </div>
      </div>

      <section className="py-[48px] pb-[96px]">
        <div className="max-w-[1180px] mx-auto px-5 md:px-8">

          {/* Ad Banner — top of listing */}
          <div className="mb-8 w-full flex justify-center">
            <AdBanner variant="horizontal" slot={1} />
          </div>

          <div className="flex flex-col gap-4">
            {installers.map((installer) => (
              <TrackedLink
                key={installer.id}
                href={`/epcs/${installer.id}` as any}
                className="bg-white border border-line rounded-[4px] p-6 sm:p-7 grid grid-cols-1 sm:grid-cols-[56px_1fr_auto] gap-[22px] items-center hover:border-teal transition-colors"
                eventName="epc_profile_view"
                eventProperties={{ epcId: installer.id, companyName: installer.companyName }}
              >
                
                <div className="w-[56px] h-[56px] rounded-[6px] bg-ink text-amber flex items-center justify-center font-space-grotesk font-bold text-[1.15rem] overflow-hidden self-start sm:self-center">
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

                <div>
                  <div className="flex items-center gap-3">
                      <h3 className="font-space-grotesk font-semibold text-[1.12rem] text-ink mb-1">
                        {installer.companyName}
                      </h3>
                      {installer.isVerified && (
                          <ShieldCheck className="w-4 h-4 text-teal" />
                      )}
                  </div>
                  <div className="text-[0.88rem] text-slate-custom mb-[10px]">
                    Nationwide · {installer.projectsCount || 0} projects
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {installer.sectors && (installer.sectors as string[]).map((sector, i) => (
                        <span key={i} className="font-ibm-plex-mono text-[0.68rem] tracking-[0.05em] uppercase text-teal bg-[rgba(47,110,98,0.1)] px-[9px] py-1 rounded-[20px]">
                            {sector}
                        </span>
                    ))}
                    {(installer.certifications as string[])?.slice(0,2).map((cert, i) => (
                        <span key={`cert-${i}`} className="font-ibm-plex-mono text-[0.68rem] tracking-[0.05em] uppercase text-teal bg-[rgba(47,110,98,0.1)] px-[9px] py-1 rounded-[20px]">
                            {cert}
                        </span>
                    ))}
                  </div>
                </div>

                <div className="text-left sm:text-right flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2.5 mt-[6px] sm:mt-0">
                  <div className="font-ibm-plex-mono text-[0.88rem] text-graphite flex items-center gap-1.5">
                    <span className="text-amber flex items-center">
                        <Star className="w-4 h-4 fill-current mr-1" /> 
                    </span>
                    {installer.avgRating ? installer.avgRating.toFixed(1) : "N/A"} ({installer.reviewCount || 0})
                  </div>
                  <div className="flex items-center gap-2">
                    <CompareToggle id={installer.id} name={installer.companyName} type="epc" />
                    <span className="text-[0.85rem] font-semibold text-ink border border-line rounded-[3px] px-4 py-[9px] hover:border-ink transition-colors">
                      View Profile
                    </span>
                  </div>
                </div>

              </TrackedLink>
            ))}
          </div>

          {/* Mid-listing ad banner */}
          {installers.length >= 3 && (
            <div className="mt-8 w-full flex justify-center">
              <AdBanner variant="inline" slot={2} />
            </div>
          )}

          {installers.length === 0 && (
            <div className="mt-12 py-20 text-center bg-white border border-line rounded-[4px]">
              <Briefcase className="w-12 h-12 text-slate-custom/20 mx-auto mb-4" />
              <h3 className="text-xl font-space-grotesk font-semibold text-ink mb-2">No Certified Installers Yet</h3>
              <p className="text-slate-custom font-medium max-w-md mx-auto text-[0.95rem] leading-relaxed">
                We are currently vetting and onboarding top-tier solar EPC companies. Please check back shortly.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

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

const getInstallers = unstable_cache(
  async (sort: string, q?: string) => {
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
        avgRating: sql<number>`CAST(AVG(${reviews.rating}) AS FLOAT)`.as('avg_rating'),
        reviewCount: sql<number>`COUNT(${reviews.id})`.as('review_count'),
        officesCount: sql<number>`(SELECT COUNT(*) FROM ${epcOffices} WHERE ${epcOffices.epcId} = ${epcInstallers.id})`.mapWith(Number),
        projectsCount: sql<number>`(SELECT COUNT(*) FROM ${epcProjects} WHERE ${epcProjects.epcId} = ${epcInstallers.id})`.mapWith(Number),
      })
      .from(epcInstallers)
      .innerJoin(users, eq(users.id, epcInstallers.userId))
      .leftJoin(reviews, eq(reviews.targetId, epcInstallers.id))
      .where(
        and(
          eq(users.isActive, true),
          eq(users.role, 'epc'),
          q ? ilike(epcInstallers.companyName, `%${q}%`) : undefined
        )
      )
      .groupBy(epcInstallers.id)
      .orderBy((t) => {
        if (sort === "top-rated") return desc(t.avgRating);
        if (sort === "lowest-rated") return asc(t.avgRating);
        if (sort === "oldest") return asc(t.createdAt);
        return desc(t.createdAt);
      });

    const mapped = rawInstallers.map(inst => {
      const { score } = getEpcCompleteness(inst, inst.officesCount || 0, inst.projectsCount || 0);
      return { ...inst, score };
    });

    return mapped.filter(inst => inst.score >= 50);
  },
  ['epc-installers-list-v2'],
  { revalidate: 3600, tags: ['epcs'] }
);

export default async function EpcListingPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; q?: string }>;
}) {
  const { sort = "latest", q = "" } = await searchParams;

  const installers = await getInstallers(sort, q);

  return (
    <div className="min-h-screen bg-background selection:bg-primary/20">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -right-[10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute -bottom-[10%] -left-[10%] w-[40%] h-[40%] bg-accent/5 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto py-20 px-6 relative z-10">
        {/* Header Section */}
        <div className="flex flex-col items-center text-center gap-8 mb-24 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-black uppercase tracking-[0.2em]">
            <Zap className="w-3.5 h-3.5 fill-current" />
            Verified Expert Network
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.85] text-foreground">
            Certified <span className="text-gradient">EPC Installers</span>
          </h1>
          <p className="text-lg md:text-2xl text-muted-foreground font-medium leading-relaxed opacity-80">
            Connect with top-tier solar energy experts. Our directory features verified EPC companies with proven track records in high-efficiency installations.
          </p>

          <div className="w-full max-w-2xl mt-8">
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <ListSearch
                placeholder="Search experts..."
                className="pl-12 h-16 bg-white/50 backdrop-blur-xl border-border/50 rounded-2xl focus:ring-primary/20 focus:border-primary transition-all text-base font-medium shadow-sm"
              />
              <ListSort
                options={[
                  { label: "Latest First", value: "latest" },
                  { label: "Top Rated", value: "top-rated" },
                  { label: "Portfolio Size", value: "portfolio" },
                ]}
              />
            </div>
          </div>
        </div>

        {/* Ad Banner — top of listing */}
        <div className="mb-8">
          <AdBanner variant="horizontal" slot={1} />
        </div>

        {/* Horizontal list */}
        <div className="space-y-4">
          {installers.map((installer) => (
            <TrackedLink
              key={installer.id}
              href={`/epcs/${installer.id}` as any}
              className="group block"
              eventName="epc_profile_view"
              eventProperties={{ epcId: installer.id, companyName: installer.companyName }}
            >
              <div className="bg-white border border-border/60 rounded-2xl overflow-hidden hover:border-primary/30 hover:shadow-md transition-all duration-300 flex flex-col sm:flex-row">

                {/* Left — logo panel */}
                <div className="relative w-full sm:w-52 shrink-0 bg-gradient-to-br from-secondary/40 to-secondary/20 flex items-center justify-center p-6 min-h-[140px]">
                  {installer.isVerified && (
                    <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/90 text-primary text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border border-primary/20 shadow-sm">
                      <ShieldCheck className="w-3 h-3" /> Verified
                    </div>
                  )}
                  {installer.logoUrl ? (
                    <Image
                      src={installer.logoUrl}
                      width={80}
                      height={80}
                      className="object-contain w-20 h-20 rounded-xl"
                      alt={installer.companyName}
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-xl bg-white border border-border/50 flex items-center justify-center shadow-sm">
                      <Briefcase className="w-8 h-8 text-primary/20" />
                    </div>
                  )}
                  {/* CEO label below logo */}
                  {installer.ceoName && (
                    <div className="absolute bottom-3 left-0 right-0 px-3 text-center">
                      <p className="text-[9px] text-muted-foreground font-medium truncate">{installer.ceoName}</p>
                    </div>
                  )}
                </div>

                {/* Middle — details */}
                <div className="flex-1 p-5 flex flex-col justify-between min-w-0">
                  <div>
                    {/* Name + rating */}
                    <div className="flex items-center gap-3 flex-wrap mb-1">
                      <h2 className="text-lg font-black tracking-tight text-foreground group-hover:text-primary transition-colors">
                        {installer.companyName}
                      </h2>
                      {installer.avgRating ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-yellow-50 border border-yellow-200 rounded-full text-xs font-black text-yellow-700">
                          <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                          {installer.avgRating.toFixed(1)}
                        </span>
                      ) : null}
                    </div>

                    <hr className="border-border/40 my-2" />

                    {/* About */}
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-3">
                      {installer.about || "Verified solar EPC company providing turnkey installation services."}
                    </p>

                    {/* Stats row */}
                    <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-primary" />
                        <strong className="text-foreground">{installer.reviewCount || 0}</strong> reviews
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-primary" />
                        Nationwide
                      </span>
                      {installer.sectors && (installer.sectors as string[]).length > 0 && (
                        <span className="flex items-center gap-1.5">
                          <Zap className="w-3.5 h-3.5 text-primary" />
                          {(installer.sectors as string[]).slice(0, 2).join(", ")}
                          {(installer.sectors as string[]).length > 2 && ` +${(installer.sectors as string[]).length - 2}`}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right — CTA */}
                <div className="flex items-center justify-center sm:justify-end px-5 py-4 sm:py-0 shrink-0">
                  <span className="inline-flex items-center gap-2 px-5 py-2.5 border border-border rounded-full text-sm font-bold text-foreground group-hover:border-primary group-hover:text-primary transition-all">
                    View Profile <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>

              </div>
            </TrackedLink>
          ))}
        </div>

        {/* Mid-listing ad banner */}
        {installers.length >= 3 && (
          <div className="mt-8">
            <AdBanner variant="inline" slot={2} />
          </div>
        )}

        {installers.length === 0 && (
          <div className="mt-20 py-32 text-center bg-white/40 backdrop-blur-xl rounded-[3.5rem] border-4 border-dashed border-border/50">
            <div className="w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-8 animate-float">
              <Briefcase className="w-10 h-10 text-primary/20" />
            </div>
            <h3 className="text-3xl font-black text-foreground mb-4 tracking-tight">No Certified Installers Yet</h3>
            <p className="text-muted-foreground font-medium max-w-md mx-auto text-lg leading-relaxed">
              We are currently vetting and onboarding top-tier solar EPC companies. Please check back shortly for the updated directory.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

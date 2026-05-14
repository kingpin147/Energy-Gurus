import { db } from "@/db";
import { epcInstallers, reviews } from "@/db/schema";
import { Link } from "@/i18n/routing";
import { Briefcase, MapPin, Star, ShieldCheck, ArrowRight, Search, Zap, Globe, MessageSquare } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { TrackedLink } from "@/components/shared/AnalyticsTracker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ListSort } from "@/components/shared/list-sort";
import { desc, asc, eq, sql } from "drizzle-orm";

export default async function EpcListingPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string }>;
}) {
  const { sort } = await searchParams;

  const installers = await db
    .select({
      id: epcInstallers.id,
      companyName: epcInstallers.companyName,
      logoUrl: epcInstallers.logoUrl,
      about: epcInstallers.about,
      isVerified: epcInstallers.isVerified,
      createdAt: epcInstallers.createdAt,
      avgRating: sql<number>`CAST(AVG(${reviews.rating}) AS FLOAT)`.as('avg_rating'),
      reviewCount: sql<number>`COUNT(${reviews.id})`.as('review_count'),
    })
    .from(epcInstallers)
    .leftJoin(reviews, eq(reviews.targetId, epcInstallers.id))
    .groupBy(epcInstallers.id)
    .orderBy((t) => {
      if (sort === "top-rated") return desc(t.avgRating);
      if (sort === "lowest-rated") return asc(t.avgRating);
      if (sort === "oldest") return asc(t.createdAt);
      return desc(t.createdAt);
    });

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
              <div className="relative flex-1 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input 
                  placeholder="Search experts..." 
                  className="pl-12 h-16 bg-white/50 backdrop-blur-xl border-border/50 rounded-2xl focus:ring-primary/20 focus:border-primary transition-all text-base font-medium shadow-sm" 
                />
              </div>
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

        {/* Listing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
          {installers.map((installer) => (
            <TrackedLink 
              key={installer.id} 
              href={`/epcs/${installer.id}` as any}
              className="group relative"
              eventName="epc_profile_view"
              eventProperties={{
                epcId: installer.id,
                companyName: installer.companyName
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 rounded-[2.5rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <Card className="h-full border-border/50 bg-white/70 backdrop-blur-xl hover:bg-white/90 transition-all duration-500 overflow-hidden rounded-[2.5rem] relative z-10 premium-shadow border group-hover:border-primary/30 group-hover:-translate-y-2">
                <div className="aspect-[16/10] bg-secondary/10 relative flex items-center justify-center p-12 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  
                  {installer.logoUrl ? (
                    <img 
                      src={installer.logoUrl} 
                      className="max-h-full max-w-full object-contain filter drop-shadow-2xl group-hover:scale-110 transition-transform duration-700 ease-out" 
                      alt={installer.companyName} 
                    />
                  ) : (
                    <Briefcase className="w-20 h-20 text-primary/10 group-hover:scale-110 transition-transform duration-700" />
                  )}
                  
                  {installer.isVerified && (
                    <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-md text-primary text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full flex items-center gap-2 shadow-xl border border-primary/10">
                      <ShieldCheck className="w-3.5 h-3.5" /> Verified
                    </div>
                  )}
                </div>

                <CardContent className="p-10 space-y-8">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start gap-4">
                      <h2 className="text-3xl font-black leading-tight tracking-tight group-hover:text-primary transition-colors">
                        {installer.companyName}
                      </h2>
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-accent/10 text-accent-foreground rounded-xl border border-accent/20">
                        <Star className="w-3.5 h-3.5 fill-current text-yellow-500" />
                        <span className="text-xs font-black">{installer.avgRating ? installer.avgRating.toFixed(1) : "N/A"}</span>
                      </div>
                    </div>
                    
                    <p className="text-muted-foreground text-sm font-medium line-clamp-2 leading-relaxed opacity-80">
                      {installer.about || "N/A"}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 py-6 border-y border-border/50">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Reviews</p>
                      <p className="text-sm font-bold flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-primary" /> {installer.reviewCount || 0}
                      </p>
                    </div>
                    <div className="space-y-1 text-right">
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Network</p>
                      <p className="text-sm font-bold flex items-center gap-1.5 justify-end">
                        <Globe className="w-3.5 h-3.5 text-primary" /> Global
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between group/btn">
                    <div className="flex items-center gap-2 text-primary text-[10px] font-black uppercase tracking-widest">
                      <MapPin className="w-4 h-4" /> Nationwide
                    </div>
                    <div className="flex items-center gap-2 text-foreground font-black text-xs uppercase tracking-widest">
                      Explorer Profile 
                      <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-2 transition-transform duration-300 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TrackedLink>
          ))}
        </div>

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

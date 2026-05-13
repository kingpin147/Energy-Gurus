import { db } from "@/db";
import { epcInstallers, reviews } from "@/db/schema";
import { Link } from "@/i18n/routing";
import { Briefcase, MapPin, Star, ShieldCheck, ArrowRight, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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
    <div className="container mx-auto py-12 px-4">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-16">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight text-primary">Certified EPC Installers</h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Find and connect with verified solar energy experts. Browse through our directory of certified EPC companies, 
            view their project portfolios, and request custom quotations.
          </p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search company name..." className="pl-10 h-11 bg-white border-primary/10 rounded-xl" />
          </div>
          <ListSort 
            options={[
              { label: "Latest", value: "latest" },
              { label: "Oldest", value: "oldest" },
              { label: "Top Rated", value: "top-rated" },
              { label: "Lowest Rated", value: "lowest-rated" },
            ]} 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {installers.map((installer) => (
          <Link 
            key={installer.id} 
            href={`/epcs/${installer.id}` as any}
            className="group"
          >
            <Card className="h-full border-none shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden bg-white rounded-[2rem]">
              <div className="aspect-[16/9] bg-secondary/5 relative flex items-center justify-center p-8">
                {installer.logoUrl ? (
                  <img src={installer.logoUrl} className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500" alt={installer.companyName} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <Briefcase className="w-16 h-16 opacity-10" />
                  </div>
                )}
                {installer.isVerified && (
                  <div className="absolute top-4 right-4 bg-green-500/10 text-green-600 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-green-500/20">
                    <ShieldCheck className="w-3 h-3" /> Verified
                  </div>
                )}
              </div>
              <CardContent className="p-8">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold group-hover:text-primary transition-colors leading-tight">
                    {installer.companyName}
                  </h2>
                  <div className="flex items-center text-yellow-500 bg-yellow-500/10 px-2.5 py-1 rounded-xl">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span className="text-xs font-black ml-1">{installer.avgRating ? installer.avgRating.toFixed(1) : "N/A"}</span>
                  </div>
                </div>
                <p className="text-muted-foreground text-sm line-clamp-2 mb-8 leading-relaxed font-medium">
                  {installer.about || "Leading energy performance certificate provider and solar installation expert."}
                </p>
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest border-t pt-6">
                  <div className="flex items-center gap-2 text-primary">
                    <MapPin className="w-4 h-4" />
                    <span>Active in Pakistan</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground group-hover:text-primary transition-colors">
                    View Profile <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}

        {installers.length === 0 && (
          <div className="col-span-full py-24 text-center bg-secondary/10 rounded-[3rem] border-2 border-dashed">
            <Briefcase className="w-20 h-20 text-muted-foreground mx-auto mb-6 opacity-20" />
            <h3 className="text-2xl font-bold text-muted-foreground">No certified installers found.</h3>
            <p className="text-muted-foreground mt-4 max-w-md mx-auto">
                We are currently onboarding top-tier EPC companies. Check back soon for the full directory.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

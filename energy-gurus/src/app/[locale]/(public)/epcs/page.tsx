import { db } from "@/db";
import { epcInstallers } from "@/db/schema";
import { Link } from "@/i18n/routing";
import { Briefcase, MapPin, Star, ShieldCheck, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function EpcListingPage() {
  const installers = await db.query.epcInstallers.findMany({
    where: (epc, { eq }) => eq(epc.isVerified, true),
  });

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-3xl mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Certified EPC Installers</h1>
        <p className="text-muted-foreground text-lg leading-relaxed">
          Find and connect with verified solar energy experts. Browse through our directory of certified EPC companies, 
          view their project portfolios, and request custom quotations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {installers.map((installer) => (
          <Link 
            key={installer.id} 
            href={`/epcs/${installer.id}` as any}
            className="group"
          >
            <Card className="h-full border-none shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden bg-secondary/5 rounded-[2rem]">
              <div className="aspect-[16/9] bg-white relative flex items-center justify-center p-8">
                {installer.logoUrl ? (
                  <img src={installer.logoUrl} className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500" alt={installer.companyName} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <Briefcase className="w-16 h-16 opacity-10" />
                  </div>
                )}
                <div className="absolute top-4 right-4 bg-green-500/10 text-green-600 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-green-500/20">
                  <ShieldCheck className="w-3 h-3" /> Verified
                </div>
              </div>
              <CardContent className="p-8">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold group-hover:text-primary transition-colors leading-tight">
                    {installer.companyName}
                  </h2>
                  <div className="flex items-center text-yellow-500 bg-yellow-500/10 px-2.5 py-1 rounded-xl">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span className="text-xs font-black ml-1">4.8</span>
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

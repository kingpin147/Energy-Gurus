import { db } from "@/db";
import { epcInstallers } from "@/db/schema";
import { Link } from "@/i18n/routing";
import { Briefcase, MapPin, Star } from "lucide-react";

export default async function EpcListingPage() {
  const installers = await db.query.epcInstallers.findMany({
    where: (epc, { eq }) => eq(epc.isVerified, true),
  });

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-2xl mb-12">
        <h1 className="text-4xl font-bold mb-4">Certified EPC Companies</h1>
        <p className="text-muted-foreground text-lg">
          Find and connect with verified Energy Performance Certificate (EPC) installers and companies.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {installers.map((installer) => (
          <Link 
            key={installer.id} 
            href={`/epcs/${installer.id}` as any}
            className="group bg-card border rounded-xl overflow-hidden hover:shadow-lg transition-all"
          >
            <div className="aspect-video bg-secondary/20 relative">
              {installer.logoUrl ? (
                <img src={installer.logoUrl} className="w-full h-full object-contain p-4" alt={installer.companyName} />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <Briefcase className="w-12 h-12" />
                </div>
              )}
            </div>
            <div className="p-6">
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-xl font-bold group-hover:text-primary transition-colors">
                  {installer.companyName}
                </h2>
                <div className="flex items-center text-yellow-500">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="text-sm font-medium ml-1">4.8</span>
                </div>
              </div>
              <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                {installer.about || "No description available."}
              </p>
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 mr-1" />
                <span>Verified Provider</span>
              </div>
            </div>
          </Link>
        ))}

        {installers.length === 0 && (
          <div className="col-span-full text-center py-24 bg-secondary/10 rounded-xl">
            <p className="text-muted-foreground">No certified EPC companies found yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}

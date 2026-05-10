import { db } from "@/db";
import { epcInstallers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Globe, Mail, MessageSquare, Star } from "lucide-react";

export default async function EpcProfilePage({ params }: { params: { id: string } }) {
  const { id } = await params;
  
  const installer = await db.query.epcInstallers.findFirst({
    where: eq(epcInstallers.id, id),
  });

  if (!installer) notFound();

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column: Info */}
        <div className="lg:col-span-2 space-y-12">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {installer.logoUrl ? (
              <img src={installer.logoUrl} className="w-24 h-24 rounded-xl border object-contain p-2" alt="" />
            ) : (
              <div className="w-24 h-24 rounded-xl border bg-secondary/20 flex items-center justify-center">
                <Globe className="w-8 h-8 text-muted-foreground" />
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold mb-2">{installer.companyName}</h1>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center text-yellow-500">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="ml-1 font-medium">4.8 (24 Reviews)</span>
                </div>
                <span>•</span>
                <span className="text-green-600 font-medium">Verified Installer</span>
              </div>
            </div>
          </div>

          <section>
            <h2 className="text-xl font-bold mb-4">About Company</h2>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {installer.about || "This company hasn't provided a detailed description yet."}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4">Work Portfolio</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {installer.portfolio?.map((url, i) => (
                <img key={i} src={url} className="rounded-xl border aspect-video object-cover hover:opacity-90 transition-opacity cursor-pointer" alt="" />
              ))}
              {(!installer.portfolio || installer.portfolio.length === 0) && (
                <p className="text-muted-foreground text-sm">No portfolio images uploaded yet.</p>
              )}
            </div>
          </section>
        </div>

        {/* Right Column: Sidebar / Contact */}
        <div className="space-y-6">
          <div className="bg-card border rounded-2xl p-6 shadow-sm sticky top-24">
            <h3 className="text-lg font-bold mb-4">Contact Installer</h3>
            <div className="space-y-4">
              <button className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-medium flex items-center justify-center space-x-2 hover:opacity-90">
                <Mail className="w-4 h-4" />
                <span>InMail / Contact</span>
              </button>
              {installer.website && (
                <a 
                  href={installer.website} 
                  target="_blank" 
                  className="w-full border py-3 rounded-xl font-medium flex items-center justify-center space-x-2 hover:bg-secondary/50"
                >
                  <Globe className="w-4 h-4" />
                  <span>Visit Website</span>
                </a>
              )}
            </div>
            
            <div className="mt-8 pt-8 border-t">
              <h4 className="text-sm font-semibold mb-4 uppercase tracking-wider text-muted-foreground">Quick Stats</h4>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Member Since</span>
                  <span className="font-medium">2026</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Inquiries Responded</span>
                  <span className="font-medium">98%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

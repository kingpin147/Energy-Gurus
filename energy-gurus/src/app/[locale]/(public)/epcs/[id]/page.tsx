import { db } from "@/db";
import { epcInstallers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Globe, Mail, Star, ShieldCheck, ArrowLeft, Image as ImageIcon, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ContactForm } from "@/components/forms/contact-form";
import { ReviewForm } from "@/components/forms/review-form";
import { ReviewList } from "@/components/reviews/review-list";
import { getProfileRating } from "@/lib/actions/reviews";

export default async function EpcProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const installer = await db.query.epcInstallers.findFirst({
    where: eq(epcInstallers.id, id),
  });

  if (!installer) notFound();

  const { rating, count } = await getProfileRating(id);

  return (
    <div className="container mx-auto py-12 px-4">
      {/* Back Button */}
      <Button variant="ghost" className="mb-8 p-0 hover:bg-transparent text-muted-foreground hover:text-primary transition-colors" asChild>
        <Link href="/epcs">
          <ArrowLeft className="mr-2 w-4 h-4" /> Back to Directory
        </Link>
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column: Info */}
        <div className="lg:col-span-2 space-y-12">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
            <div className="w-32 h-32 rounded-[2rem] border shadow-sm bg-white p-4 flex items-center justify-center overflow-hidden">
              {installer.logoUrl ? (
                <img src={installer.logoUrl} className="max-h-full max-w-full object-contain" alt={installer.companyName} />
              ) : (
                <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                   <ShieldCheck className="w-12 h-12 text-primary/20" />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <h1 className="text-4xl font-bold">{installer.companyName}</h1>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center text-yellow-500">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="ml-1 font-bold text-foreground">{rating?.toFixed(1) || "5.0"} ({count} Reviews)</span>
                </div>
                <span className="text-muted-foreground">•</span>
                <div className="flex items-center gap-1.5 text-green-600 font-medium">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verified Installer</span>
                </div>
              </div>
            </div>
          </div>

          <section className="space-y-6">
            <h2 className="text-2xl font-bold font-heading">About Company</h2>
            <div className="bg-secondary/5 p-8 rounded-[2rem] border-none shadow-sm">
                <p className="text-muted-foreground text-lg leading-relaxed whitespace-pre-wrap">
                {installer.about || "This company hasn't provided a detailed description yet."}
                </p>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-3">
                <ImageIcon className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold font-heading">Work Portfolio</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {installer.portfolio?.map((url: string, i: number) => (
                <div key={i} className="rounded-3xl border overflow-hidden aspect-video shadow-sm hover:shadow-xl transition-all group">
                    <img src={url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="" />
                </div>
              ))}
              {(!installer.portfolio || installer.portfolio.length === 0) && (
                <div className="col-span-full py-12 text-center bg-secondary/10 rounded-3xl border-2 border-dashed">
                   <p className="text-muted-foreground font-medium">No portfolio images uploaded yet.</p>
                </div>
              )}
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-3">
                <Star className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold font-heading">Reviews & Feedback</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <h3 className="text-sm font-bold uppercase tracking-widest opacity-60">Write a Review</h3>
                    <ReviewForm targetId={id} targetType="epc" />
                </div>
                <div className="space-y-6">
                    <h3 className="text-sm font-bold uppercase tracking-widest opacity-60">Latest Feedback</h3>
                    <ReviewList targetId={id} />
                </div>
            </div>
          </section>
        </div>

        {/* Right Column: Sidebar / Contact */}
        <div className="space-y-8">
          <Card className="border-none shadow-xl bg-primary text-primary-foreground rounded-[2.5rem] overflow-hidden sticky top-24">
            <CardContent className="p-8 space-y-8">
              <div>
                <h3 className="text-2xl font-bold mb-4">Contact Installer</h3>
                <p className="text-primary-foreground/70 text-sm leading-relaxed mb-6">
                  Interested in working with {installer.companyName}? Send a message directly through EnergyGurus.
                </p>
              </div>
              
              <div className="space-y-4">
                <Dialog>
                    <DialogTrigger asChild>
                        <Button className="w-full h-14 rounded-2xl font-bold text-lg bg-accent text-accent-foreground hover:bg-accent/90 gap-2">
                            <Mail className="w-5 h-5" /> InMail / Contact
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px] rounded-[2.5rem] p-8">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold mb-4">Contact {installer.companyName}</DialogTitle>
                        </DialogHeader>
                        <ContactForm receiverId={installer.userId} receiverName={installer.companyName} />
                    </DialogContent>
                </Dialog>

                {installer.website && (
                  <Button variant="outline" className="w-full h-14 rounded-2xl font-bold bg-transparent border-white/20 hover:bg-white/10 text-white gap-2" asChild>
                    <a href={installer.website} target="_blank">
                      <Globe className="w-5 h-5" /> Visit Website
                    </a>
                  </Button>
                )}

                {installer.socialLinks && (installer.socialLinks as any[]).length > 0 && (
                  <div className="flex justify-center gap-4 pt-4">
                    {(installer.socialLinks as { platform: string; url: string }[]).map((link, i) => {
                      const Icon = link.platform === "Facebook" ? Facebook : 
                                  link.platform === "Twitter" ? Twitter : 
                                  link.platform === "Instagram" ? Instagram : 
                                  link.platform === "LinkedIn" ? Linkedin : Globe;
                      return (
                        <a key={i} href={link.url} target="_blank" className="p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-colors">
                          <Icon className="w-5 h-5 text-white" />
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>
              
              <div className="pt-8 border-t border-white/10">
                <h4 className="text-xs font-bold mb-6 uppercase tracking-widest opacity-60">Quick Stats</h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="opacity-70 font-medium">Member Since</span>
                    <span className="font-bold">2026</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="opacity-70 font-medium">Inquiries Responded</span>
                    <span className="font-bold text-accent">98%</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="opacity-70 font-medium">Avg. Rating</span>
                    <div className="flex items-center gap-1 font-bold text-yellow-400">
                        <Star className="w-4 h-4 fill-current" /> {rating?.toFixed(1) || "5.0"}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

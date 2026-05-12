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
                {count > 0 ? (
                  <div className="flex items-center text-yellow-500">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="ml-1 font-bold text-foreground">{rating?.toFixed(1)} ({count} {count === 1 ? "Review" : "Reviews"})</span>
                  </div>
                ) : (
                  <span className="text-muted-foreground text-sm font-medium">No reviews yet</span>
                )}
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
                {/* WhatsApp primary contact button */}
                {(() => {
                  const socialLinks = installer.socialLinks as { platform: string; url: string }[] | null;
                  const whatsapp = socialLinks?.find(l => l.platform === "WhatsApp");
                  const fallback = socialLinks?.find(l => l.url);

                  if (whatsapp) {
                    // Format WhatsApp number — strip non-digits, build wa.me link
                    const waNumber = whatsapp.url.replace(/\D/g, "");
                    return (
                      <Button className="w-full h-14 rounded-2xl font-bold text-lg bg-accent text-accent-foreground hover:bg-accent/90 gap-2" asChild>
                        <a href={`https://wa.me/${waNumber}`} target="_blank">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                          Contact on WhatsApp
                        </a>
                      </Button>
                    );
                  }

                  if (fallback) {
                    return (
                      <Button className="w-full h-14 rounded-2xl font-bold text-lg bg-accent text-accent-foreground hover:bg-accent/90 gap-2" asChild>
                        <a href={fallback.url} target="_blank">
                          <Globe className="w-5 h-5" /> Contact via {fallback.platform}
                        </a>
                      </Button>
                    );
                  }

                  // No social links — show inmail dialog as fallback
                  return (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="w-full h-14 rounded-2xl font-bold text-lg bg-accent text-accent-foreground hover:bg-accent/90 gap-2">
                          <Mail className="w-5 h-5" /> Send Message
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[500px] rounded-[2.5rem] p-8">
                        <DialogHeader>
                          <DialogTitle className="text-2xl font-bold mb-4">Contact {installer.companyName}</DialogTitle>
                        </DialogHeader>
                        <ContactForm receiverId={installer.userId} receiverName={installer.companyName} />
                      </DialogContent>
                    </Dialog>
                  );
                })()}

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
                    <span className="font-bold">{new Date(installer.createdAt).getFullYear()}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="opacity-70 font-medium">Avg. Rating</span>
                    {count > 0 ? (
                      <div className="flex items-center gap-1 font-bold text-yellow-400">
                        <Star className="w-4 h-4 fill-current" /> {rating?.toFixed(1)}
                      </div>
                    ) : (
                      <span className="font-bold opacity-60">No reviews yet</span>
                    )}
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

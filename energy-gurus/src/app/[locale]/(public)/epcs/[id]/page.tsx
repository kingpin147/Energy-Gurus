import { db } from "@/db";
import { epcInstallers, epcOffices, epcProjects } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Globe, Mail, Star, ShieldCheck, ArrowLeft, Image as ImageIcon, Facebook, Twitter, Instagram, Linkedin, MapPin, Zap, MessageSquare, LayoutGrid } from "lucide-react";
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

  const offices = await db.select().from(epcOffices).where(eq(epcOffices.epcId, id));
  const projects = await db.select().from(epcProjects).where(eq(epcProjects.epcId, id));
  const { rating, count } = await getProfileRating(id);

  return (
    <div className="container mx-auto py-12 px-4 max-w-7xl">
      {/* Back Button */}
      <Button variant="ghost" className="mb-8 p-0 hover:bg-transparent text-muted-foreground hover:text-primary transition-colors" asChild>
        <Link href="/epcs">
          <ArrowLeft className="mr-2 w-4 h-4" /> Back to Directory
        </Link>
      </Button>

      {/* TOP SECTION: Header Card */}
      <div className="bg-white rounded-[3rem] border shadow-xl p-8 md:p-12 mb-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        
        <div className="flex flex-col md:flex-row items-start md:items-center gap-8 relative z-10">
          <div className="w-40 h-40 rounded-[2.5rem] border-4 border-primary/10 shadow-lg bg-white p-6 flex items-center justify-center overflow-hidden shrink-0">
            {installer.logoUrl ? (
              <img src={installer.logoUrl} className="max-h-full max-w-full object-contain" alt={installer.companyName} />
            ) : (
              <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                 <ShieldCheck className="w-16 h-16 text-primary/20" />
              </div>
            )}
          </div>
          
          <div className="space-y-4 flex-1">
            <div className="space-y-1">
                <h1 className="text-4xl md:text-5xl font-black tracking-tight">{installer.companyName}</h1>
                {installer.ceoName && (
                    <p className="text-muted-foreground font-medium flex items-center gap-2">
                        <span className="text-[10px] bg-secondary/10 px-2 py-0.5 rounded uppercase font-black tracking-widest">CEO / OWNER</span>
                        {installer.ceoName}
                    </p>
                )}
            </div>

            <div className="flex flex-wrap gap-2">
                {installer.sectors && (installer.sectors as string[]).map((sector) => (
                    <span key={sector} className="px-4 py-1.5 bg-primary/5 text-primary rounded-full text-[10px] font-black uppercase tracking-widest border border-primary/10">
                        {sector}
                    </span>
                ))}
            </div>

            <div className="flex items-center gap-6 text-sm">
              {count > 0 ? (
                <div className="flex items-center text-yellow-500 bg-yellow-500/5 px-4 py-2 rounded-2xl border border-yellow-500/10">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="ml-2 font-black text-foreground">{rating?.toFixed(1)} <span className="opacity-40 font-bold ml-1">({count} {count === 1 ? "Review" : "Reviews"})</span></span>
                </div>
              ) : (
                <span className="text-muted-foreground text-sm font-medium">No reviews yet</span>
              )}
              <div className="flex items-center gap-2 text-green-600 font-black uppercase tracking-widest text-[10px]">
                <ShieldCheck className="w-5 h-5" />
                <span>Verified Installer</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* MIDDLE SECTION: Main Content */}
        <div className="lg:col-span-2 space-y-16">
          
          {/* About Section */}
          <section className="space-y-6">
            <h2 className="text-3xl font-black font-heading flex items-center gap-3">
                <span className="w-1.5 h-8 bg-primary rounded-full" />
                About Company
            </h2>
            <div className="bg-secondary/5 p-8 md:p-12 rounded-[2.5rem] border-none shadow-sm text-lg leading-relaxed text-muted-foreground whitespace-pre-wrap italic">
                “{installer.about || "This company hasn't provided a detailed description yet."}”
            </div>
          </section>

          {/* Offices Section */}
          {offices.length > 0 && (
            <section className="space-y-6">
                <h2 className="text-3xl font-black font-heading flex items-center gap-3">
                    <span className="w-1.5 h-8 bg-primary rounded-full" />
                    Our Presence
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {offices.map((office) => (
                        <div key={office.id} className="p-6 bg-white border border-secondary/10 rounded-3xl flex items-center gap-4 shadow-sm group hover:border-primary/50 transition-all">
                            <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center group-hover:bg-primary transition-colors">
                                <MapPin className="w-5 h-5 text-primary group-hover:text-white" />
                            </div>
                            <div>
                                <h4 className="font-bold text-lg">{office.city}</h4>
                                <p className="text-sm text-muted-foreground">
                                    {[office.officeNumber, office.block, office.area].filter(Boolean).join(", ")}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
          )}

          {/* Showcase Projects Section */}
          <section className="space-y-8">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-black font-heading flex items-center gap-3">
                    <span className="w-1.5 h-8 bg-primary rounded-full" />
                    Showcase Projects
                </h2>
                <span className="text-[10px] font-black uppercase tracking-widest opacity-40">{projects.length} Total Projects</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {projects.map((project) => (
                <div key={project.id} className="rounded-[2.5rem] border bg-white overflow-hidden shadow-sm hover:shadow-2xl transition-all group border-secondary/10">
                    <div className="aspect-[4/3] relative overflow-hidden">
                        {project.images?.[0] ? (
                            <img src={project.images[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={project.name} />
                        ) : (
                            <div className="w-full h-full bg-secondary/10 flex items-center justify-center">
                                <ImageIcon className="w-12 h-12 opacity-10" />
                            </div>
                        )}
                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-primary shadow-sm">
                            {project.segmentType}
                        </div>
                    </div>
                    <div className="p-8 space-y-6">
                        <div>
                            <h4 className="text-2xl font-black mb-1">{project.name}</h4>
                            <p className="text-muted-foreground font-medium flex items-center gap-2">
                                <MapPin className="w-4 h-4" /> {project.city}
                            </p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 py-6 border-y border-secondary/10">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">System Size</p>
                                <p className="font-bold flex items-center gap-1">
                                    <Zap className="w-4 h-4 text-yellow-500" /> {project.systemSize} kW
                                </p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">System Type</p>
                                <p className="font-bold">{project.systemType}</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Equipment Installed</p>
                            <div className="flex flex-wrap gap-2">
                                {project.inverterModel && (
                                    <span className="text-[10px] font-bold bg-secondary/10 px-3 py-1 rounded-lg">INV: {project.inverterModel}</span>
                                )}
                                {project.solarPanelModel && (
                                    <span className="text-[10px] font-bold bg-secondary/10 px-3 py-1 rounded-lg">PANEL: {project.solarPanelModel}</span>
                                )}
                                {project.batteryModel && (
                                    <span className="text-[10px] font-bold bg-secondary/10 px-3 py-1 rounded-lg">BAT: {project.batteryModel}</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
              ))}
              {projects.length === 0 && (
                <div className="col-span-full py-20 text-center bg-secondary/5 rounded-[3rem] border-2 border-dashed border-secondary/20">
                    <LayoutGrid className="w-12 h-12 text-muted-foreground/10 mx-auto mb-4" />
                    <p className="text-muted-foreground font-bold">No projects showcased yet.</p>
                </div>
              )}
            </div>
          </section>

          {/* Reviews Section */}
          <section className="space-y-8 bg-white p-8 md:p-12 rounded-[3rem] border shadow-sm">
            <div className="flex items-center gap-3">
                <Star className="w-8 h-8 text-primary" />
                <h2 className="text-3xl font-black font-heading">Reviews & Feedback</h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-6">
                    <div className="bg-primary/5 p-6 rounded-3xl border border-primary/10">
                        <h3 className="text-lg font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                            <MessageSquare className="w-4 h-4" /> Share Your Experience
                        </h3>
                        <ReviewForm targetId={id} targetType="epc" />
                    </div>
                </div>
                <div className="space-y-6">
                    <h3 className="text-sm font-bold uppercase tracking-widest opacity-40">Verified Customer Feedback</h3>
                    <ReviewList targetId={id} />
                </div>
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN: Sidebar / Contact */}
        <div className="space-y-8">
          <Card className="border-none shadow-2xl bg-[#1A1A1A] text-white rounded-[3rem] overflow-hidden sticky top-24">
            <CardContent className="p-8 space-y-8">
              <div className="space-y-2">
                <h3 className="text-2xl font-black">Contact Expert</h3>
                <p className="text-white/60 text-sm font-medium leading-relaxed">
                  Discuss your solar requirements directly with {installer.companyName}.
                </p>
              </div>
              
              <div className="space-y-4">
                {/* WhatsApp primary contact button */}
                {(() => {
                  const socialLinks = installer.socialLinks as { platform: string; url: string }[] | null;
                  const whatsapp = socialLinks?.find(l => l.platform === "WhatsApp");

                  if (whatsapp) {
                    const waNumber = whatsapp.url.replace(/\D/g, "");
                    return (
                      <Button className="w-full h-16 rounded-2xl font-black text-lg bg-green-500 hover:bg-green-600 text-white gap-3 shadow-lg shadow-green-500/20" asChild>
                        <a href={`https://wa.me/${waNumber}`} target="_blank">
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                          WhatsApp Direct
                        </a>
                      </Button>
                    );
                  }
                })()}

                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-full h-16 rounded-2xl font-black text-lg bg-white text-black hover:bg-white/90 gap-3 shadow-lg shadow-white/10">
                      <Mail className="w-6 h-6" /> Send Message
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px] rounded-[3rem] p-10">
                    <DialogHeader>
                      <DialogTitle className="text-3xl font-black mb-4">Direct Inquiry</DialogTitle>
                    </DialogHeader>
                    <ContactForm receiverId={installer.userId} receiverName={installer.companyName} />
                  </DialogContent>
                </Dialog>

                {installer.website && (
                  <Button variant="outline" className="w-full h-16 rounded-2xl font-black bg-white/5 border-white/10 hover:bg-white/10 text-white gap-3 transition-all" asChild>
                    <a href={installer.website} target="_blank">
                      <Globe className="w-6 h-6" /> Visit Website
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
                        <a key={i} href={link.url} target="_blank" className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center hover:bg-primary hover:text-white transition-all border border-white/5 group">
                          <Icon className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="pt-8 border-t border-white/5">
                <h4 className="text-[10px] font-black mb-6 uppercase tracking-widest opacity-40">Company Metrics</h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="opacity-40 font-bold uppercase tracking-widest text-[10px]">Registered</span>
                    <span className="font-black text-primary">{new Date(installer.createdAt).getFullYear()}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="opacity-40 font-bold uppercase tracking-widest text-[10px]">Avg. Rating</span>
                    {count > 0 ? (
                      <div className="flex items-center gap-1 font-black text-yellow-400">
                        <Star className="w-4 h-4 fill-current" /> {rating?.toFixed(1)}
                      </div>
                    ) : (
                      <span className="font-bold opacity-30">N/A</span>
                    )}
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="opacity-40 font-bold uppercase tracking-widest text-[10px]">Verified</span>
                    <ShieldCheck className="w-5 h-5 text-green-500" />
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

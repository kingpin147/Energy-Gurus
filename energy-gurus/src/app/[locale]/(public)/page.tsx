import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Mic,
    Zap,
    BarChart3,
    Settings2,
    ArrowRight,
    ShieldCheck,
    Users,
    CheckCircle2,
    Play,
    FileText,
    TrendingUp,
    Mail
} from "lucide-react";
import { Link } from "@/i18n/routing";
import { getTranslations } from "next-intl/server";
import { NewsletterForm } from "@/components/forms/newsletter-form";
import { VerificationTool } from "@/components/verification/verification-tool";
import { getProfileRating } from "@/lib/actions/reviews";

import { db } from "@/db";
import { podcasts, liveQA } from "@/db/schema";
import { desc } from "drizzle-orm";

export default async function Homepage() {
    const t = await getTranslations("HomePage");

    let latestPodcast = null;
    let latestQA = null;
    let topEpcs: any[] = [];

    try {
        [latestPodcast] = await db.select().from(podcasts).orderBy(desc(podcasts.createdAt)).limit(1);
        [latestQA] = await db.select().from(liveQA).orderBy(desc(liveQA.createdAt)).limit(1);

        // Fetch top 3 EPCs with their ratings
        const allEpcs = await db.query.epcInstallers.findMany({ limit: 3 });
        topEpcs = await Promise.all(allEpcs.map(async (epc) => {
            const ratingData = await getProfileRating(epc.id);
            return { ...epc, ...ratingData };
        }));
    } catch (error) {
        console.error("Homepage data fetch failed:", error);
    }

    return (
        <div className="flex flex-col min-h-screen">
            {/* Hero Section */}
            <section className="relative py-20 lg:py-40 overflow-hidden bg-primary text-primary-foreground">
                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-4xl">
                        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 text-white leading-[1.1]">
                            {t.rich('title', {
                                br: () => <br />,
                                accent: (chunks) => <span className="text-accent italic">{chunks}</span>
                            })}
                        </h1>
                        <p className="text-xl md:text-2xl opacity-90 mb-10 leading-relaxed max-w-2xl">
                            {t('subtitle')}
                        </p>
                        <div className="flex flex-wrap gap-5">
                            <Button size="lg" variant="accent" className="font-bold h-14 px-8 text-lg rounded-full" asChild>
                                <Link href="/epcs">{t('cta_brands')}</Link>
                            </Button>
                            <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-primary h-14 px-8 text-lg rounded-full font-bold" asChild>
                                <Link href="/podcast">{t('cta_podcast')}</Link>
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Abstract Background Element */}
                <div className="absolute top-0 right-0 w-1/3 h-full bg-accent/10 -skew-x-12 transform translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-background to-transparent" />
            </section>

            {/* Section 1: Latest Podcast */}
            {latestPodcast && (
                <section id="podcast" className="bg-secondary/20 py-24 border-b">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-16">
                            <span className="text-accent font-bold uppercase tracking-widest text-xs">Featured Content</span>
                            <h2 className="text-4xl font-bold mt-4">The Energy Podcast</h2>
                            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">Deep dives into Pakistan's energy landscape with industry experts and policy makers.</p>
                        </div>
                        <Card className="bg-card border-none shadow-2xl overflow-hidden rounded-[2rem]">
                            <CardContent className="p-0 flex flex-col md:flex-row items-stretch">
                                <div className="flex-1 p-8 md:p-16 space-y-8">
                                    <div className="flex items-center gap-3 text-accent">
                                        <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                                            <Mic className="w-4 h-4" />
                                        </div>
                                        <span className="font-bold uppercase tracking-widest text-[10px]">Latest Episode</span>
                                    </div>
                                    <h3 className="text-3xl md:text-4xl font-bold font-heading leading-tight">{latestPodcast.title}</h3>
                                    <p className="text-muted-foreground text-lg leading-relaxed line-clamp-4 italic">
                                        "{latestPodcast.description}"
                                    </p>
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8 pt-4">
                                        <Button variant="primary" size="lg" className="rounded-full gap-3 px-8 h-14 font-bold shadow-lg shadow-primary/20" asChild>
                                            <a href={latestPodcast.youtubeUrl} target="_blank"><Play className="w-4 h-4 fill-current" /> Watch Full Episode</a>
                                        </Button>
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center font-bold text-primary">
                                                {latestPodcast.guestName?.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-foreground">{latestPodcast.guestName}</p>
                                                <p className="text-muted-foreground text-xs uppercase tracking-widest font-medium">{latestPodcast.guestDesignation || "Guest Expert"}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="w-full md:w-[40%] bg-slate-900 min-h-[350px] relative flex items-center justify-center overflow-hidden">
                                    <VideoEmbed url={latestPodcast.youtubeUrl} />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </section>
            )}

            {/* Section 2: Top Rated EPCs / Installers */}
            <section id="epcs" className="py-32 bg-background">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row items-end justify-between mb-20 gap-8">
                        <div className="max-w-2xl">
                            <span className="text-primary font-bold uppercase tracking-widest text-xs">Verified Partners</span>
                            <h2 className="text-5xl font-bold mt-4 mb-6">Top Rated EPCs & Installers</h2>
                            <p className="text-muted-foreground text-xl leading-relaxed">We vet and monitor solar installers based on technical standards, financial stability, and customer feedback.</p>
                        </div>
                        <Button variant="outline" className="rounded-full font-bold h-14 px-8 border-2" asChild>
                            <Link href="/epcs">Explore All Installers <ArrowRight className="ml-2 w-5 h-5" /></Link>
                        </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {topEpcs.map((epc) => (
                            <Card key={epc.id} className="border-none shadow-sm bg-secondary/5 rounded-[2.5rem] overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all group">
                                <div className="h-3 bg-primary" />
                                <CardContent className="p-10">
                                    <div className="flex items-center gap-5 mb-8">
                                        <div className="w-20 h-20 rounded-3xl border-2 border-primary/5 bg-white flex items-center justify-center overflow-hidden p-3 group-hover:scale-105 transition-transform shadow-sm">
                                            {epc.logoUrl ? <img src={epc.logoUrl} className="max-h-full max-w-full object-contain" alt="" /> : <Users className="w-10 h-10 text-primary/10" />}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-xl leading-tight mb-1">{epc.companyName}</h4>
                                            <div className="flex items-center text-yellow-500 gap-1.5 text-sm font-black">
                                                <Zap className="w-4 h-4 fill-current" /> {epc.rating?.toFixed(1) || "5.0"}
                                                <span className="text-muted-foreground font-medium ml-1">({epc.count || 0} Reviews)</span>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-muted-foreground line-clamp-3 mb-10 leading-relaxed min-h-[4.5rem]">
                                        {epc.about || "Leading energy solution provider committed to quality solar installations and exceptional service."}
                                    </p>
                                    <Button className="w-full rounded-2xl font-bold h-14 text-base" variant="secondary" asChild>
                                        <Link href={`/epcs/${epc.id}`}>View Company Profile</Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Section 3: Brands & Authenticity */}
            <section id="brands" className="py-32 bg-primary text-primary-foreground relative overflow-hidden">
                <div className="container mx-auto px-4 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                        <div className="max-w-xl">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 mb-8">
                                <ShieldCheck className="w-5 h-5 text-accent" />
                                <span className="text-accent font-bold uppercase tracking-widest text-[10px]">EnergyGurus Shield</span>
                            </div>
                            <h2 className="text-5xl md:text-6xl font-bold mb-8 leading-[1.1]">Authenticity <br /><span className="text-accent italic">Guaranteed.</span></h2>
                            <p className="text-xl opacity-80 leading-relaxed mb-12">
                                Don't risk your investment with counterfeit hardware. Verify your panels and inverters instantly against our direct brand manufacturing database.
                            </p>
                            <div className="grid grid-cols-2 gap-10">
                                <div className="space-y-3">
                                    <div className="text-4xl font-bold text-accent">Real-time</div>
                                    <div className="text-[10px] opacity-60 uppercase font-black tracking-[0.2em]">Global Database</div>
                                    <div className="h-1 w-12 bg-accent/30 rounded-full" />
                                </div>
                                <div className="space-y-3">
                                    <div className="text-4xl font-bold text-accent">Official</div>
                                    <div className="text-[10px] opacity-60 uppercase font-black tracking-[0.2em]">Brand Partnerships</div>
                                    <div className="h-1 w-12 bg-accent/30 rounded-full" />
                                </div>
                            </div>
                        </div>
                        <div className="bg-white text-foreground rounded-[4rem] p-6 md:p-10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] relative group">
                            <div className="absolute -top-6 -right-6 w-32 h-32 bg-accent rounded-full flex items-center justify-center transform rotate-12 group-hover:rotate-0 transition-transform hidden md:flex border-8 border-primary">
                                <span className="text-primary font-black text-center leading-none text-sm uppercase">Verify <br /> Now</span>
                            </div>
                            <VerificationTool brandName="EnergyGurus" />
                            <div className="mt-8 pt-8 border-t flex items-center justify-between">
                                <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">Supported Brands</p>
                                <div className="flex gap-4 opacity-30 grayscale">
                                    <div className="w-8 h-8 rounded bg-slate-200" />
                                    <div className="w-8 h-8 rounded bg-slate-200" />
                                    <div className="w-8 h-8 rounded bg-slate-200" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Abstract Background Element */}
                <div className="absolute top-0 right-0 w-1/3 h-full bg-white/5 -skew-x-12 transform translate-x-1/4" />
                <div className="absolute bottom-10 left-10 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />
            </section>

            {/* Section 4: Weekly Live QA Session */}
            {latestQA && (
                <section id="live-qa" className="py-32 bg-secondary/5 border-b">
                    <div className="container mx-auto px-4 max-w-5xl">
                        <div className="text-center mb-16">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 text-red-600 mb-6">
                                <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Weekly Live Session</span>
                            </div>
                            <h2 className="text-5xl font-bold mb-8">{latestQA.topic}</h2>
                            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">Get your technical questions answered in real-time by the experts leading Pakistan's energy transition.</p>
                        </div>
                        <div className="aspect-video bg-black rounded-[3rem] overflow-hidden shadow-[0_48px_80px_-24px_rgba(0,0,0,0.2)] mb-16 relative group">
                            <VideoEmbed url={latestQA.youtubeUrl} />
                            <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                        </div>
                        <div className="flex flex-col md:flex-row items-center justify-between p-10 bg-white rounded-[2.5rem] shadow-sm border border-secondary/10">
                            <div className="flex items-center gap-6 mb-8 md:mb-0">
                                <div className="w-16 h-16 rounded-2xl bg-secondary/20 flex items-center justify-center text-2xl font-bold text-primary">
                                    {latestQA.expertName?.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-xs font-black uppercase tracking-[0.2em] opacity-40 mb-1">Featured Expert</p>
                                    <p className="text-2xl font-bold">{latestQA.expertName}</p>
                                </div>
                            </div>
                            <Button size="lg" className="rounded-2xl font-bold px-12 h-16 text-lg shadow-xl shadow-primary/20" asChild>
                                <a href={latestQA.youtubeUrl} target="_blank">Join Live Discussion</a>
                            </Button>
                        </div>
                    </div>
                </section>
            )}

            {/* Simple Final CTA / Newsletter */}
            <section className="py-32 bg-background">
                <div className="container mx-auto px-4 max-w-4xl text-center">
                    <div className="p-10 md:p-24 bg-primary text-primary-foreground rounded-[4rem] shadow-2xl relative overflow-hidden">
                        <div className="relative z-10 space-y-10">
                            <h2 className="text-4xl md:text-5xl font-bold">Stay Powered Up</h2>
                            <p className="text-xl opacity-80 leading-relaxed max-w-xl mx-auto">
                                Join 5,000+ energy stakeholders. Get weekly podcast summaries and policy alerts directly in your inbox.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto w-full">
                                <NewsletterForm />
                            </div>
                        </div>
                        {/* Background Decor */}
                        <div className="absolute -top-24 -left-24 w-64 h-64 bg-accent/20 rounded-full blur-3xl" />
                        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                    </div>
                </div>
            </section>

        </div>
    );
}

function VideoEmbed({ url }: { url: string }) {
    // Basic YouTube ID extraction
    const videoId = url.split("v=")[1]?.split("&")[0] || url.split("/").pop();
    if (!videoId) return null;
    
    return (
        <iframe
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${videoId}`}
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
        />
    );
}


function ServiceCard({ title, description, icon, link, bullets }: { title: string, description: string, icon: React.ReactNode, link: string, bullets: string[] }) {
    return (
        <Card className="hover:shadow-xl transition-all border-none bg-secondary/10 group rounded-2xl flex flex-col items-stretch overflow-hidden">
            <CardContent className="pt-10 p-8 flex flex-col h-full">
                <div className="mb-6 p-4 bg-background rounded-xl inline-block shadow-sm group-hover:scale-110 transition-transform">{icon}</div>
                <h3 className="text-2xl font-bold mb-4">{title}</h3>
                <p className="text-muted-foreground mb-8 text-base">{description}</p>
                <ul className="space-y-3 mb-10 flex-1">
                    {bullets.map((b, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm font-medium">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary" /> {b}
                        </li>
                    ))}
                </ul>
                <Button variant="primary" className="w-full font-bold group" asChild>
                    <Link href={link}>
                        Learn more <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </Button>
            </CardContent>
        </Card>
    );
}

function TrustPoint({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <div className="flex gap-6 group">
            <div className="flex-shrink-0 w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                {icon}
            </div>
            <div>
                <h4 className="text-xl font-bold mb-2">{title}</h4>
                <p className="text-muted-foreground leading-relaxed">{description}</p>
            </div>
        </div>
    );
}

function Metric({ icon, value, label }: { icon: React.ReactNode, value: string, label: string }) {
    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2 text-accent">
                <div className="p-1 bg-accent/20 rounded">{icon}</div>
                <span className="text-4xl font-bold tracking-tighter">{value}</span>
            </div>
            <p className="text-sm font-medium opacity-80 uppercase tracking-widest">{label}</p>
        </div>
    );
}

function ResourceCard({ title, category, excerpt }: { title: string, category: string, excerpt: string }) {
    return (
        <Card className="hover:shadow-lg transition-all border-none bg-secondary/10 p-8 group">
            <span className="text-xs font-bold text-accent uppercase tracking-widest mb-4 block">{category}</span>
            <h3 className="text-xl font-bold mb-4 group-hover:text-primary transition-colors">{title}</h3>
            <p className="text-muted-foreground text-sm line-clamp-3 mb-6 leading-relaxed">{excerpt}</p>
            <Button variant="link" className="p-0 h-auto text-primary font-bold" asChild>
                <Link href="/resources">Read Full Brief →</Link>
            </Button>
        </Card>
    );
}

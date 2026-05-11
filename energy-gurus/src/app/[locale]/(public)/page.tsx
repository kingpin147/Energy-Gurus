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

            {/* Latest Podcast Preview */}
            {latestPodcast && (
                <section className="bg-secondary/20 py-12 border-b">
                    <div className="container mx-auto px-4">
                        <Card className="bg-card border-none shadow-xl overflow-hidden">
                            <CardContent className="p-0 flex flex-col md:flex-row items-stretch">
                                <div className="flex-1 p-8 md:p-12 space-y-6">
                                    <span className="text-accent font-bold uppercase tracking-widest text-xs">Latest Podcast Episode</span>
                                    <h2 className="text-3xl font-bold font-heading">{latestPodcast.title}</h2>
                                    <p className="text-muted-foreground leading-relaxed line-clamp-3">
                                        {latestPodcast.description}
                                    </p>
                                    <div className="flex items-center gap-6">
                                        <Button variant="primary" size="lg" className="rounded-full gap-2 px-6 font-bold" asChild>
                                            <a href={latestPodcast.youtubeUrl} target="_blank"><Play className="w-4 h-4 fill-current" /> Watch on YouTube</a>
                                        </Button>
                                        <div className="text-sm">
                                            <p className="font-bold">{latestPodcast.guestName}</p>
                                            <p className="text-muted-foreground text-xs">{latestPodcast.guestDesignation}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="w-full md:w-1/3 bg-slate-900 min-h-[300px] relative flex items-center justify-center">
                                    <VideoEmbed url={latestPodcast.youtubeUrl} />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </section>
            )}

            {/* Weekly Live QA Section */}
            {latestQA && (
                <section className="py-24 bg-secondary/10">
                    <div className="container mx-auto px-4 text-center max-w-4xl">
                        <span className="text-primary font-bold uppercase tracking-widest text-xs">Live QA Sessions</span>
                        <h2 className="text-4xl font-bold mt-4 mb-6">{latestQA.topic}</h2>
                        <div className="aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl mb-12">
                            <VideoEmbed url={latestQA.youtubeUrl} />
                        </div>
                        <div className="flex flex-col items-center">
                            <p className="text-lg text-muted-foreground mb-6">Featuring guest expert: <span className="text-foreground font-bold">{latestQA.expertName}</span></p>
                            <Button size="lg" className="rounded-full font-bold px-8" asChild>
                                <a href={latestQA.youtubeUrl} target="_blank">Join Discussion</a>
                            </Button>
                        </div>
                    </div>
                </section>
            )}

            {/* Interactive Verification Section */}
            <section className="py-24 bg-primary text-primary-foreground relative overflow-hidden">
                <div className="container mx-auto px-4 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <span className="text-accent font-bold uppercase tracking-widest text-xs">Authenticity Shield</span>
                            <h2 className="text-4xl font-bold mt-4 mb-6">Verify your hardware instantly.</h2>
                            <p className="text-xl opacity-80 leading-relaxed mb-8">
                                Protect your investment by verifying product serial numbers against our global brand database. Ensure you're getting genuine parts and valid warranties.
                            </p>
                            <div className="flex gap-8">
                                <div className="space-y-2">
                                    <p className="text-3xl font-bold text-accent">Real-time</p>
                                    <p className="text-sm opacity-60 uppercase tracking-widest">Global Database</p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-3xl font-bold text-accent">Official</p>
                                    <p className="text-sm opacity-60 uppercase tracking-widest">Brand Validation</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white text-foreground rounded-[3rem] p-4 shadow-2xl">
                            <VerificationTool brandName="EnergyGurus" />
                        </div>
                    </div>
                </div>
                <div className="absolute top-0 right-0 w-1/4 h-full bg-white/5 -skew-x-12 transform translate-x-1/2" />
            </section>

            {/* Featured EPCs */}
            <section className="py-24 bg-background">
                <div className="container mx-auto px-4">
                    <div className="flex items-end justify-between mb-16">
                        <div className="max-w-2xl">
                            <h2 className="text-4xl font-bold mb-4">Top Rated EPCs</h2>
                            <p className="text-muted-foreground text-lg">Verified solar installers with a track record of excellence.</p>
                        </div>
                        <Button variant="outline" className="rounded-full font-bold h-12" asChild>
                            <Link href="/epcs">View All Installers <ArrowRight className="ml-2 w-4 h-4" /></Link>
                        </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {topEpcs.map((epc) => (
                            <Card key={epc.id} className="border-none shadow-sm bg-secondary/5 rounded-3xl overflow-hidden hover:shadow-xl transition-all group">
                                <div className="h-3 bg-primary" />
                                <CardContent className="p-8">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-16 h-16 rounded-2xl border bg-white flex items-center justify-center overflow-hidden p-2 group-hover:scale-110 transition-transform">
                                            {epc.logoUrl ? <img src={epc.logoUrl} className="max-h-full max-w-full object-contain" alt="" /> : <Users className="w-8 h-8 text-primary/20" />}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-lg">{epc.companyName}</h4>
                                            <div className="flex items-center text-yellow-500 gap-1 text-xs font-bold">
                                                <Play className="w-3 h-3 fill-current" /> {epc.rating} ({epc.count} Reviews)
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-sm text-muted-foreground line-clamp-3 mb-8 leading-relaxed">
                                        {epc.about || "Leading energy solution provider committed to quality solar installations."}
                                    </p>
                                    <Button className="w-full rounded-xl font-bold" variant="secondary" asChild>
                                        <Link href={`/epcs/${epc.id}`}>View Profile</Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Why EnergyGurus / Trust Points */}
            <section className="py-24 bg-secondary/20">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="space-y-8">
                            <h2 className="text-4xl font-bold leading-tight">Why do stakeholders trust EnergyGurus?</h2>
                            <div className="space-y-6">
                                <TrustPoint icon={<ShieldCheck className="w-7 h-7" />} title="Independent Analysis" description="Unbiased commentary on policy and technology for regulators and end-users." />
                                <TrustPoint icon={<Users className="w-7 h-7" />} title="Policy Engagement" description="Actively participating in whitepapers and policy notes for Pakistan's energy transition." />
                                <TrustPoint icon={<CheckCircle2 className="w-7 h-7" />} title="Certified Auditors" description="All audits are performed by engineers with decades of combined field experience." />
                            </div>
                        </div>
                        <div className="bg-primary rounded-3xl p-10 text-primary-foreground space-y-10 shadow-2xl">
                            <h3 className="text-2xl font-bold mb-6">Real Results, Delivered.</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <Metric icon={<TrendingUp />} value="98.5%" label="Uptime Improvement" />
                                <Metric icon={<Zap />} value="~25%" label="Avg. Bill Reduction" />
                                <Metric icon={<CheckCircle2 />} value="500+" label="Audits Completed" />
                                <Metric icon={<Users />} value="10k+" label="Monthly Listeners" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Resource Carousel Preview */}
            <section className="py-24 bg-background">
                <div className="container mx-auto px-4">
                    <div className="flex items-end justify-between mb-16">
                        <div className="max-w-xl">
                            <h2 className="text-3xl font-bold mb-4">Latest Insights & Policy Briefs</h2>
                            <p className="text-muted-foreground">Stay informed with our long-form analysis and technical resources.</p>
                        </div>
                        <Button variant="outline" className="hidden md:flex gap-2" asChild>
                            <Link href="/resources">View all resources <ArrowRight className="w-4 h-4" /></Link>
                        </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <ResourceCard title="Net-Metering 2.0" category="Policy Note" excerpt="Analyzing the impact of the upcoming 2026 regulatory changes..." />
                        <ResourceCard title="Battery Storage Guide" category="Technical" excerpt="Choosing the right storage architecture for industrial backup..." />
                        <ResourceCard title="Annual Energy Outlook" category="Whitepaper" excerpt="A comprehensive review of Pakistan's grid stability in 2025..." />
                    </div>
                </div>
            </section>

            {/* Newsletter / Social Subscribe */}
            <section className="py-24 bg-accent/10 border-t">
                <div className="container mx-auto px-4 max-w-4xl text-center">
                    <div className="p-8 md:p-16 bg-white rounded-3xl shadow-xl border space-y-8">
                        <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <Mail className="w-8 h-8 text-primary" />
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold">Stay Powered Up</h2>
                        <p className="text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto">
                            Subscribe to our newsletter for weekly podcast summaries, policy alerts, and energy-saving tips delivered to your inbox.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto w-full">
                            <NewsletterForm />
                        </div>
                        <p className="text-sm text-muted-foreground">Join 5,000+ energy stakeholders in Pakistan.</p>
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

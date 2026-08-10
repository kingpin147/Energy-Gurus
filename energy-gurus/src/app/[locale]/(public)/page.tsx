import { Link } from "@/i18n/routing";
import { getTranslations } from "next-intl/server";
import { ArrowRight, Play, Star, ShieldCheck, Zap, Video, Calendar, ArrowUpRight, Phone, Info, Users } from "lucide-react";
import Image from "next/image";
import { db } from "@/db";
import { podcasts, epcInstallers, reviews, users, brands, liveQA, epcOffices, epcProjects, products } from "@/db/schema";
import { desc, count, eq, sql, asc, and } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { getEpcCompleteness } from "@/lib/utils/completeness";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const baseUrl = "https://www.energygurus.online";
    const title = "EnergyGurus - Verified Solar EPCs & Tier-1 Brands in Pakistan";
    const description = "Find certified solar EPC installers, compare verified solar brands, request expert load audits, and monitor solar systems in Pakistan.";

    return {
        title,
        description,
        alternates: {
            canonical: `${baseUrl}/${locale}`,
            languages: {
                en: `${baseUrl}/en`,
                ur: `${baseUrl}/ur`,
                "x-default": `${baseUrl}/en`,
            },
        },
        openGraph: {
            title,
            description,
            url: `${baseUrl}/${locale}`,
            siteName: "EnergyGurus",
            locale: locale === "ur" ? "ur_PK" : "en_US",
            type: "website",
            images: [{ url: `${baseUrl}/new_hero_banner.jpg`, width: 1200, height: 630, alt: "EnergyGurus" }],
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: [`${baseUrl}/new_hero_banner.jpg`],
        },
    };
}

const getHomepageData = unstable_cache(
    async () => {
        try {
            const rawEpcs = await db.select({
                id: epcInstallers.id,
                companyName: epcInstallers.companyName,
                ceoName: epcInstallers.ceoName,
                sectors: epcInstallers.sectors,
                logoUrl: epcInstallers.logoUrl,
                about: epcInstallers.about,
                website: epcInstallers.website,
                socialLinks: epcInstallers.socialLinks,
                createdAt: epcInstallers.createdAt,
                avgRating: sql<number>`CAST(AVG(${reviews.rating}) AS FLOAT)`,
                reviewCount: count(reviews.id),
                officesCount: sql<number>`(SELECT COUNT(*) FROM ${epcOffices} WHERE ${epcOffices.epcId} = ${epcInstallers.id})`.mapWith(Number),
                projectsCount: sql<number>`(SELECT COUNT(*) FROM ${epcProjects} WHERE ${epcProjects.epcId} = ${epcInstallers.id})`.mapWith(Number),
            })
                .from(epcInstallers)
                .innerJoin(users, eq(users.id, epcInstallers.userId))
                .leftJoin(reviews, eq(epcInstallers.id, reviews.targetId))
                .where(and(eq(users.isActive, true), eq(users.role, 'epc')))
                .groupBy(epcInstallers.id);

            const topEpcs = rawEpcs.map(inst => {
                const { score } = getEpcCompleteness(inst, inst.officesCount || 0, inst.projectsCount || 0);
                return { ...inst, score };
            })
                .filter(inst => inst.score >= 50)
                .sort((a, b) => {
                    if (b.avgRating !== a.avgRating) {
                        if (a.avgRating === null || isNaN(a.avgRating)) return 1;
                        if (b.avgRating === null || isNaN(b.avgRating)) return -1;
                        return b.avgRating - a.avgRating;
                    }
                    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                })
                .slice(0, 3);

            return { topEpcs };
        } catch (e) {
            console.error("Homepage data fetch failed:", e);
            return { topEpcs: [] };
        }
    },
    ['homepage-data-v3'],
    { revalidate: 3600, tags: ['homepage'] }
);

export default async function Homepage() {
    const { topEpcs } = await getHomepageData();

    return (
        <div className="font-sans text-graphite bg-paper leading-relaxed selection:bg-amber/20 overflow-x-hidden">
            {/* ---- HERO ---- */}
            <header className="relative bg-ink text-paper overflow-hidden pt-24">
                {/* Background effects */}
                <div 
                    className="absolute inset-0 pointer-events-none" 
                    style={{ 
                        background: 'radial-gradient(ellipse 900px 500px at 80% 0%, rgba(232,163,61,0.16), transparent 60%)' 
                    }}
                />
                
                <div className="max-w-[1180px] mx-auto px-5 md:px-8 relative z-10">
                    <p className="font-ibm-plex-mono text-[0.76rem] tracking-[0.14em] uppercase text-amber flex items-center gap-2.5 mb-5">
                        <span className="w-5 h-[1px] bg-amber"></span>
                        Live Solar Intelligence
                    </p>
                    <h1 className="font-space-grotesk font-semibold text-[clamp(2.4rem,5vw,4rem)] leading-[1.06] tracking-[-0.01em] max-w-[820px] text-white">
                        Your trusted guide to solar — from first question to full <em className="not-italic text-amber">install</em>.
                    </h1>
                    <p className="text-[1.15rem] text-paper/72 max-w-[560px] my-6 mb-9">
                        Compare certified brands, connect with vetted installers, and keep your system running strong with expert monitoring — all backed by facts, not sales pitches.
                    </p>
                    <div className="flex flex-wrap gap-3.5 mb-16">
                        <Link href="/dashboard" className="bg-amber text-ink px-6 py-4 rounded-[3px] text-[0.95rem] font-semibold hover:bg-[#f2b458] transition-colors">
                            Get Started
                        </Link>
                        <Link href="/brands" className="bg-transparent text-white border border-white/30 px-6 py-4 rounded-[3px] text-[0.95rem] font-semibold hover:border-white transition-colors">
                            Compare Solar Brands
                        </Link>
                        <Link href="/podcast" className="bg-transparent text-white border border-white/30 px-6 py-4 rounded-[3px] text-[0.95rem] font-semibold hover:border-white transition-colors">
                            Explore the Facts
                        </Link>
                    </div>
                </div>

                <div className="relative z-10 border-t border-paper/15 grid grid-cols-1 md:grid-cols-3">
                    <div className="px-5 md:px-8 py-7 md:border-r border-b md:border-b-0 border-paper/15">
                        <div className="font-ibm-plex-mono text-[1.9rem] text-amber flex items-baseline gap-1.5">
                            250<span className="text-[0.95rem] text-paper/50">+</span>
                        </div>
                        <div className="text-[0.78rem] text-paper/55 uppercase tracking-[0.08em] mt-1.5">
                            Certified Installers
                        </div>
                    </div>
                    <div className="px-5 md:px-8 py-7 md:border-r border-b md:border-b-0 border-paper/15">
                        <div className="font-ibm-plex-mono text-[1.9rem] text-amber flex items-baseline gap-1.5">
                            40<span className="text-[0.95rem] text-paper/50">+</span>
                        </div>
                        <div className="text-[0.78rem] text-paper/55 uppercase tracking-[0.08em] mt-1.5">
                            Brands Reviewed
                        </div>
                    </div>
                    <div className="px-5 md:px-8 py-7">
                        <div className="font-ibm-plex-mono text-[1.9rem] text-amber flex items-baseline gap-1.5">
                            120<span className="text-[0.95rem] text-paper/50">eps</span>
                        </div>
                        <div className="text-[0.78rem] text-paper/55 uppercase tracking-[0.08em] mt-1.5">
                            Real Talk On Solar
                        </div>
                    </div>
                </div>
                
                <svg className="block w-full h-[56px] bg-transparent" viewBox="0 0 1200 56" preserveAspectRatio="none">
                    <path d="M0,40 C150,10 300,50 450,20 C600,5 750,45 900,18 C1050,2 1150,35 1200,25 L1200,56 L0,56 Z" fill="var(--color-paper)"/>
                </svg>
            </header>

            {/* ---- THREE WAYS IN ---- */}
            <section className="py-22">
                <div className="max-w-[1180px] mx-auto px-5 md:px-8">
                    <div className="max-w-[640px] mb-14">
                        <p className="font-ibm-plex-mono text-[0.76rem] tracking-[0.14em] uppercase text-teal flex items-center gap-2.5 mb-5">
                            <span className="w-5 h-[1px] bg-teal"></span>
                            Three Ways In
                        </p>
                        <h2 className="font-space-grotesk font-semibold text-[clamp(1.6rem,3vw,2.3rem)] tracking-[-0.01em] text-ink">
                            Whatever brought you here, we've got a path.
                        </h2>
                        <p className="text-slate-custom mt-3.5 text-[1.02rem]">
                            Browse by brand, get matched with an installer, or start with the facts — no wrong door.
                        </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-[1px] bg-line border border-line rounded-[4px] overflow-hidden">
                        <div className="bg-paper p-9 px-7 flex flex-col group">
                            <div className="font-ibm-plex-mono text-[0.72rem] tracking-[0.1em] text-teal mb-4.5">01 · INSTALL</div>
                            <h3 className="font-space-grotesk font-semibold text-[1.25rem] tracking-[-0.01em] text-ink mb-2.5">Connect with certified professionals</h3>
                            <p className="text-slate-custom text-[0.95rem] grow">
                                Every installer in our network is vetted for certification, experience, and customer track record. Get matched with a professional who fits your home and budget.
                            </p>
                            <Link href="/epcs" className="mt-5.5 text-[0.88rem] font-semibold text-ink inline-flex items-center gap-1.5">
                                Find an Installer <ArrowRight className="w-4 h-4 group-hover:translate-x-[3px] transition-transform" />
                            </Link>
                        </div>
                        <div className="bg-paper p-9 px-7 flex flex-col group">
                            <div className="font-ibm-plex-mono text-[0.72rem] tracking-[0.1em] text-teal mb-4.5">02 · COMPARE</div>
                            <h3 className="font-space-grotesk font-semibold text-[1.25rem] tracking-[-0.01em] text-ink mb-2.5">Unbiased brand comparisons</h3>
                            <p className="text-slate-custom text-[0.95rem] grow">
                                Panels, inverters, batteries — we break down specs, warranties, and real-world performance so you can choose with confidence, not guesswork.
                            </p>
                            <Link href="/brands" className="mt-5.5 text-[0.88rem] font-semibold text-ink inline-flex items-center gap-1.5">
                                Browse Brands <ArrowRight className="w-4 h-4 group-hover:translate-x-[3px] transition-transform" />
                            </Link>
                        </div>
                        <div className="bg-paper p-9 px-7 flex flex-col group">
                            <div className="font-ibm-plex-mono text-[0.72rem] tracking-[0.1em] text-teal mb-4.5">03 · LEARN</div>
                            <h3 className="font-space-grotesk font-semibold text-[1.25rem] tracking-[-0.01em] text-ink mb-2.5">Solar, explained simply</h3>
                            <p className="text-slate-custom text-[0.95rem] grow">
                                Our podcast cuts through industry jargon with straight answers on costs, savings, and what actually matters when going solar.
                            </p>
                            <Link href="/podcast" className="mt-5.5 text-[0.88rem] font-semibold text-ink inline-flex items-center gap-1.5">
                                Listen Now <ArrowRight className="w-4 h-4 group-hover:translate-x-[3px] transition-transform" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* ---- THE PROCESS ---- */}
            <section className="py-22">
                <div className="max-w-[1180px] mx-auto px-5 md:px-8">
                    <div className="max-w-[640px] mb-14">
                        <p className="font-ibm-plex-mono text-[0.76rem] tracking-[0.14em] uppercase text-teal flex items-center gap-2.5 mb-5">
                            <span className="w-5 h-[1px] bg-teal"></span>
                            The Process
                        </p>
                        <h2 className="font-space-grotesk font-semibold text-[clamp(1.6rem,3vw,2.3rem)] tracking-[-0.01em] text-ink">
                            Three steps to solar confidence.
                        </h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        <div className="relative pl-[52px]">
                            <div className="absolute left-0 top-0 font-ibm-plex-mono text-[0.85rem] text-amber border border-amber w-[34px] h-[34px] rounded-full flex items-center justify-center">1</div>
                            <h3 className="font-space-grotesk font-semibold text-[1.1rem] tracking-[-0.01em] text-ink mb-2">Browse</h3>
                            <p className="text-slate-custom text-[0.94rem]">Explore brands and installers vetted for quality and reliability.</p>
                        </div>
                        <div className="relative pl-[52px]">
                            <div className="absolute left-0 top-0 font-ibm-plex-mono text-[0.85rem] text-amber border border-amber w-[34px] h-[34px] rounded-full flex items-center justify-center">2</div>
                            <h3 className="font-space-grotesk font-semibold text-[1.1rem] tracking-[-0.01em] text-ink mb-2">Connect</h3>
                            <p className="text-slate-custom text-[0.94rem]">Request a quote and get matched with the right installer for your home.</p>
                        </div>
                        <div className="relative pl-[52px]">
                            <div className="absolute left-0 top-0 font-ibm-plex-mono text-[0.85rem] text-amber border border-amber w-[34px] h-[34px] rounded-full flex items-center justify-center">3</div>
                            <h3 className="font-space-grotesk font-semibold text-[1.1rem] tracking-[-0.01em] text-ink mb-2">Monitor</h3>
                            <p className="text-slate-custom text-[0.94rem]">Keep your system performing at its best with our Monitoring & O&M services.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ---- MONITORING ---- */}
            <section className="bg-ink text-paper py-22">
                <div className="max-w-[1180px] mx-auto px-5 md:px-8 grid grid-cols-1 md:grid-cols-[1.1fr_0.9fr] gap-16 items-center">
                    <div>
                        <p className="font-ibm-plex-mono text-[0.76rem] tracking-[0.14em] uppercase text-amber flex items-center gap-2.5 mb-5">
                            <span className="w-5 h-[1px] bg-amber"></span>
                            Monitoring & O&M
                        </p>
                        <h2 className="font-space-grotesk font-semibold text-[clamp(1.6rem,3vw,2.2rem)] tracking-[-0.01em] text-white">
                            Solar doesn't stop at installation.
                        </h2>
                        <p className="text-paper/70 my-4.5 mb-6.5 max-w-[480px]">
                            We help you protect your investment long after the panels go up — with real-time performance monitoring, proactive maintenance, and fast fault detection.
                        </p>
                        <Link href="/monitoring" className="inline-block bg-amber text-ink px-6 py-4 rounded-[3px] text-[0.95rem] font-semibold hover:bg-[#f2b458] transition-colors">
                            Learn About Monitoring & O&M
                        </Link>
                    </div>
                    <div className="border border-paper/15 rounded-[4px] p-7 bg-paper/5">
                        <div className="flex justify-between items-center py-3.5 border-b border-paper/10 font-ibm-plex-mono text-[0.85rem]">
                            <span>System Output</span><span>4.82 kW</span>
                        </div>
                        <div className="flex justify-between items-center py-3.5 border-b border-paper/10 font-ibm-plex-mono text-[0.85rem]">
                            <span>Panel Health</span><span className="text-teal bg-[rgba(47,110,98,0.18)] px-2.5 py-[3px] rounded-full text-[0.72rem]">Nominal</span>
                        </div>
                        <div className="flex justify-between items-center py-3.5 border-b border-paper/10 font-ibm-plex-mono text-[0.85rem]">
                            <span>Last Fault Check</span><span>—</span>
                        </div>
                        <div className="flex justify-between items-center py-3.5 font-ibm-plex-mono text-[0.85rem]">
                            <span>Uptime (30d)</span><span>99.8%</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* ---- PODCAST ---- */}
            <section className="py-22">
                <div className="max-w-[1180px] mx-auto px-5 md:px-8">
                    <div className="max-w-[640px] mb-14">
                        <p className="font-ibm-plex-mono text-[0.76rem] tracking-[0.14em] uppercase text-teal flex items-center gap-2.5 mb-5">
                            <span className="w-5 h-[1px] bg-teal"></span>
                            The Podcast
                        </p>
                        <h2 className="font-space-grotesk font-semibold text-[clamp(1.6rem,3vw,2.3rem)] tracking-[-0.01em] text-ink">
                            Straight talk on solar.
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-[220px_1fr] gap-8 items-center bg-white border border-line rounded-[4px] p-7 group">
                        <div className="aspect-square rounded-[4px] bg-ink flex items-center justify-center max-w-[160px] sm:max-w-full" style={{ backgroundImage: 'repeating-linear-gradient(135deg, var(--color-teal) 0 2px, transparent 2px 14px)' }}>
                            <div className="w-12 h-12 rounded-full bg-amber flex items-center justify-center text-ink group-hover:scale-110 transition-transform">
                                <Play className="w-5 h-5 ml-1 fill-ink" />
                            </div>
                        </div>
                        <div>
                            <h3 className="font-space-grotesk font-semibold text-[1.2rem] tracking-[-0.01em] text-ink mb-2">Latest Episode — What Actually Determines Your Payback Period</h3>
                            <p className="text-slate-custom text-[0.95rem] mb-3.5">New episodes breaking down the facts and figures behind solar energy — no jargon, no sales pressure.</p>
                            <Link href="/podcast" className="text-ink font-semibold text-[0.88rem] flex items-center gap-1.5">
                                Listen to the Latest Episode <ArrowRight className="w-4 h-4 group-hover:translate-x-[3px] transition-transform" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* ---- NEWSLETTER / QUOTE ---- */}
            <section className="py-22">
                <div className="max-w-[1180px] mx-auto px-5 md:px-8">
                    <div className="bg-white border border-line rounded-[4px] p-11 flex justify-between items-center gap-8 flex-wrap">
                        <div>
                            <h2 className="font-space-grotesk font-semibold text-[1.4rem] tracking-[-0.01em] text-ink mb-1.5">Stay informed.</h2>
                            <p className="text-slate-custom text-[0.95rem]">Get solar facts, brand updates, and installer insights delivered straight to your inbox.</p>
                        </div>
                        <form className="flex gap-2.5" action="#">
                            <input 
                                type="email" 
                                placeholder="you@email.com" 
                                aria-label="Email address"
                                className="px-4 py-[13px] border border-line rounded-[3px] font-sans text-[0.9rem] min-w-[220px] focus-visible:outline-2 focus-visible:outline-amber focus-visible:outline-offset-3"
                            />
                            <button type="submit" className="bg-amber text-ink px-5 py-[13px] rounded-[3px] font-semibold text-[0.9rem] hover:bg-[#f2b458] transition-colors">
                                Subscribe
                            </button>
                        </form>
                    </div>
                </div>
            </section>
        </div>
    );
}

const Mic = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
        <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
        <line x1="12" x2="12" y1="19" y2="22" />
    </svg>
);

import { Link } from "@/i18n/routing";
import { getTranslations } from "next-intl/server";
import { ArrowRight, Play, Star, ShieldCheck, Zap, Video, Calendar, ArrowUpRight, Phone, Info, Users } from "lucide-react";
import Image from "next/image";
import { db } from "@/db";
import { podcasts, epcInstallers, reviews, users, brands, liveQA, epcOffices, epcProjects, products } from "@/db/schema";
import { desc, count, eq, sql, asc, and } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { getEpcCompleteness } from "@/lib/utils/completeness";

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
        <div className="bg-white text-slate-900 font-sans selection:bg-primary/20 overflow-x-hidden">

            {/* ─── HERO BANNER ─── */}
            <section className="relative w-full min-h-[85vh] flex items-center justify-center border-b border-slate-100 bg-white overflow-hidden mobile-first">
                {/* Premium Abstract Background Asset */}
                <div className="absolute inset-0 z-0">
                    <Image
                        src="/hero_solar_banner.png"
                        alt="Background"
                        fill
                        priority
                        className="object-cover opacity-30 md:opacity-60 transition-opacity duration-1000"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-white/50 to-white"></div>
                </div>

                <div className="max-w-[1200px] mx-auto px-6 py-20 md:py-32 relative z-10 flex flex-col items-center text-center animate-reveal">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] mb-8 md:mb-12 animate-soft-float">
                        <ShieldCheck className="w-4 h-4" /> Authenticity Guaranteed
                    </div>

                    <h1 className="text-4xl sm:text-5xl md:text-8xl font-black tracking-tighter text-slate-900 mb-8 leading-[1] md:leading-[0.85]">
                        EnergyGurus<span className="text-primary">.Online</span>
                    </h1>

                    <p className="text-base md:text-2xl text-slate-600 max-w-3xl mx-auto font-medium leading-relaxed mb-12 opacity-80 px-4 md:px-0">
                        The industry standard for verified solar infrastructure. Connect with certified EPCs, audit global brands, and access technical intelligence.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto px-4 sm:px-0">
                        <Link
                            href="/epcs"
                            className="bg-primary text-white p-5 md:px-10 md:py-5 rounded-2xl font-black text-[10px] md:text-[11px] uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 group"
                        >
                            Find Installers <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                        </Link>
                    </div>
                </div>
            </section>

            <div className="max-w-[1200px] mx-auto px-6 py-20 lg:py-40 space-y-32 lg:space-y-56">

                {/* ─── 3. TOP EPCs ─── */}
                <section>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 lg:mb-20 gap-6">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-8 bg-primary rounded-full shadow-[0_0_15px_rgba(0,109,109,0.3)]" />
                                <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-slate-900 uppercase">Certified Installers</h2>
                            </div>
                            <p className="text-slate-500 font-medium text-lg md:text-xl">Engineering excellence for industrial and residential portfolios.</p>
                        </div>
                        <Link href="/epcs" className="text-primary font-black flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] hover:gap-4 transition-all group">
                            EPC Search <ArrowRight className="w-4 h-4 group-hover:translate-x-1" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 md:gap-12">
                        {topEpcs.map((epc) => (
                            <Link href={`/epcs/${epc.id}` as any} key={epc.id} className="group flex flex-col glass rounded-[3rem] p-8 md:p-10 border border-white/40 hover:border-primary/30 hover:shadow-2xl transition-all duration-500 hover:-translate-y-3">
                                <div className="flex justify-between items-start mb-10">
                                    <div className="w-20 h-20 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center justify-center p-4 group-hover:scale-110 transition-transform duration-500">
                                        {epc.logoUrl ? (
                                            <Image src={epc.logoUrl} alt={epc.companyName || "Logo"} width={56} height={56} className="object-contain" />
                                        ) : (
                                            <Zap className="w-10 h-10 text-slate-200" />
                                        )}
                                    </div>
                                    <div className="bg-white/70 backdrop-blur px-4 py-2 rounded-xl flex items-center gap-2 border border-white/50 shadow-sm">
                                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                                        <span className="text-sm font-black text-slate-900">{epc.avgRating?.toFixed(1) || "N/A"}</span>
                                    </div>
                                </div>
                                <h4 className="text-2xl font-black text-slate-900 mb-3 tracking-tighter">{epc.companyName}</h4>
                                <p className="text-slate-500 text-base font-medium line-clamp-2 mb-10 flex-1 leading-relaxed opacity-80">
                                    {epc.about || "Verified energy solution provider with certified engineering team."}
                                </p>
                                <div className="flex items-center justify-between text-primary font-black text-[10px] uppercase tracking-[0.2em] pt-6 border-t border-slate-100/50">
                                    Book Audit <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>

            </div>

            {/* ─── DIRECTORY FOOTER / CTA ─── */}
            <section className="border-t border-slate-100 bg-slate-50/40 py-24 lg:py-56 overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
                <div className="max-w-[1200px] mx-auto px-6 grid lg:grid-cols-2 gap-24 items-center">
                    <div className="animate-reveal">
                        <h2 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter mb-10 leading-[0.9]">
                            Verified <span className="text-primary">Engineering</span>.
                        </h2>
                        <p className="text-slate-500 text-lg md:text-2xl font-medium leading-relaxed mb-16 opacity-80">
                            EnergyGurus bridges the gap between global technology providers and regional energy transition. ensuring that every node is verified.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-6">
                            <Link href="/about" className="glass px-12 py-6 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.2em] text-slate-900 hover:bg-white transition-all shadow-xl flex items-center justify-center gap-3">
                                <Info className="w-6 h-6" /> Our Mission
                            </Link>
                            <Link href="/contact" className="bg-slate-900 text-white px-12 py-6 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.2em] hover:bg-black transition-all shadow-2xl flex items-center justify-center gap-3">
                                <Phone className="w-6 h-6 text-accent" /> Contact Us
                            </Link>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-8 md:gap-12 relative">
                        <div className="absolute inset-0 bg-primary/5 blur-[100px] rounded-full"></div>
                        <div className="glass p-10 md:p-14 rounded-[3.5rem] border border-white/60 shadow-2xl text-center group hover:-translate-y-4 transition-all duration-500 relative z-10">
                            <ShieldCheck className="w-12 h-12 text-primary mx-auto mb-8 group-hover:scale-125 transition-transform duration-500" />
                            <h4 className="font-black text-slate-900 text-sm uppercase tracking-[0.1em]">Verified Safety</h4>
                        </div>
                        <div className="glass p-10 md:p-14 rounded-[3.5rem] border border-white/60 shadow-2xl text-center group hover:-translate-y-4 transition-all duration-500 relative z-10">
                            <Zap className="w-12 h-12 text-amber-500 mx-auto mb-8 group-hover:scale-125 transition-transform duration-500" />
                            <h4 className="font-black text-slate-900 text-sm uppercase tracking-[0.1em]">High Yield</h4>
                        </div>
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

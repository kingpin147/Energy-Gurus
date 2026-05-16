import { Link } from "@/i18n/routing";
import { getTranslations } from "next-intl/server";
import { ArrowRight, Play, Star, ShieldCheck, Zap, Video, Calendar, ArrowUpRight, Phone, Info, Users } from "lucide-react";
import Image from "next/image";
import { db } from "@/db";
import { podcasts, epcInstallers, reviews, users, brands, liveQA } from "@/db/schema";
import { desc, count, eq, sql, asc } from "drizzle-orm";
import { unstable_cache } from "next/cache";

const getHomepageData = unstable_cache(
    async () => {
        try {
            const latestPodcasts = await db.select().from(podcasts).orderBy(desc(podcasts.createdAt)).limit(3);

            const upcomingQA = await db.select()
                .from(liveQA)
                .where(eq(liveQA.status, 'upcoming'))
                .orderBy(asc(liveQA.sessionDate))
                .limit(1);

            const activeQA = await db.select()
                .from(liveQA)
                .where(eq(liveQA.status, 'live'))
                .orderBy(desc(liveQA.createdAt))
                .limit(1);

            const targetQA = activeQA.length > 0 ? activeQA[0] : upcomingQA[0] || null;

            // Get EPCs with real average ratings in a single query
            const topEpcs = await db.select({
                id: epcInstallers.id,
                companyName: epcInstallers.companyName,
                logoUrl: epcInstallers.logoUrl,
                about: epcInstallers.about,
                avgRating: sql<number>`CAST(AVG(${reviews.rating}) AS FLOAT)`,
                reviewCount: count(reviews.id),
            })
            .from(epcInstallers)
            .innerJoin(users, eq(users.id, epcInstallers.userId))
            .leftJoin(reviews, eq(epcInstallers.id, reviews.targetId))
            .where(eq(users.isActive, true))
            .groupBy(epcInstallers.id)
            .orderBy(sql`AVG(${reviews.rating}) DESC NULLS LAST`, asc(epcInstallers.createdAt))
            .limit(3);

            // Get top brands
            const topBrands = await db.select({
                id: brands.id,
                brandName: brands.brandName,
                logoUrl: brands.logoUrl,
                about: brands.about,
                avgRating: sql<number>`CAST(AVG(${reviews.rating}) AS FLOAT)`,
                reviewCount: count(reviews.id),
            })
            .from(brands)
            .innerJoin(users, eq(users.id, brands.userId))
            .leftJoin(reviews, eq(brands.id, reviews.targetId))
            .where(eq(users.isActive, true))
            .groupBy(brands.id)
            .orderBy(sql`AVG(${reviews.rating}) DESC NULLS LAST`, asc(brands.createdAt))
            .limit(3);

            return { latestPodcasts, topEpcs, topBrands, targetQA };
        } catch (e) {
            console.error("Homepage data fetch failed:", e);
            return { latestPodcasts: [], topEpcs: [], topBrands: [], targetQA: null };
        }
    },
    ['homepage-data-v2'],
    { revalidate: 3600, tags: ['homepage'] }
);

export default async function Homepage() {
    const { latestPodcasts, topEpcs, topBrands, targetQA } = await getHomepageData();
    const [featuredPodcast, ...morePodcasts] = latestPodcasts;

    return (
        <div className="bg-white text-slate-900 font-sans selection:bg-primary/20">

            {/* ─── HERO BANNER ─── */}
            <section className="relative w-full border-b border-slate-200 bg-primary/5">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                <div className="max-w-[1200px] mx-auto px-6 pt-32 pb-24 relative z-10 flex flex-col items-center text-center">
                    
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-8">
                        <ShieldCheck className="w-4 h-4" /> Authenticity Guaranteed
                    </div>
                    
                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-slate-900 mb-6 leading-[0.9]">
                        EnergyGurus<span className="text-primary">.Online</span>
                    </h1>
                    
                    <p className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto font-medium leading-relaxed mb-12">
                        The industry standard for verified solar infrastructure. Connect with certified EPCs, audit global brands, and access high-level technical intelligence.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                        <Link
                            href="/brands"
                            className="bg-primary text-white px-8 py-4 rounded-xl font-bold text-sm uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                        >
                            Global Brands <ArrowRight className="w-4 h-4" />
                        </Link>
                        <Link
                            href="/epcs"
                            className="bg-white border border-slate-200 text-slate-900 px-8 py-4 rounded-xl font-bold text-sm uppercase tracking-widest hover:border-primary hover:text-primary transition-colors flex items-center justify-center shadow-sm"
                        >
                            Find Installers
                        </Link>
                    </div>
                </div>
            </section>

            <div className="max-w-[1200px] mx-auto px-6 py-24 space-y-32">

                {/* ─── 1. WEEKLY LIVE QA SESSION ─── */}
                <section>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-2 h-8 bg-primary rounded-full" />
                                <h2 className="text-3xl font-black tracking-tight text-slate-900 uppercase">Live Intelligence</h2>
                            </div>
                            <p className="text-slate-500 font-medium">Weekly Q&A sessions on trending industry policies and technical standards.</p>
                        </div>
                        <Link href="/live-qa" className="text-primary font-bold flex items-center gap-2 text-sm uppercase tracking-widest hover:gap-4 transition-all">
                            View Archive <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    {targetQA ? (
                        <div className="bg-slate-900 rounded-[2rem] overflow-hidden flex flex-col md:flex-row border border-slate-800 shadow-2xl relative">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
                            
                            <div className="flex-1 p-10 md:p-16 flex flex-col justify-center relative z-10">
                                <div className="flex items-center gap-3 mb-6">
                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${targetQA.status === 'live' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-primary/20 text-primary border border-primary/30'}`}>
                                        <div className={`w-2 h-2 rounded-full ${targetQA.status === 'live' ? 'bg-red-500 animate-pulse' : 'bg-primary'}`} />
                                        {targetQA.status === 'live' ? 'Live Now' : 'Upcoming Session'}
                                    </span>
                                    {targetQA.sessionDate && (
                                        <span className="text-slate-400 text-sm font-medium flex items-center gap-2">
                                            <Calendar className="w-4 h-4" /> {new Date(targetQA.sessionDate).toLocaleDateString()}
                                        </span>
                                    )}
                                </div>

                                <h3 className="text-3xl md:text-5xl font-black text-white mb-6 leading-tight tracking-tight">
                                    {targetQA.topic}
                                </h3>
                                
                                <p className="text-slate-400 mb-10 line-clamp-2 leading-relaxed max-w-xl">
                                    {targetQA.description || "Join our industry experts for an in-depth analysis and live audience Q&A."}
                                </p>

                                <div className="flex items-center gap-6">
                                    <Link href="/live-qa" className="bg-primary text-white px-8 py-4 rounded-xl font-bold text-xs uppercase tracking-widest hover:opacity-90 transition-opacity flex items-center gap-2">
                                        <Video className="w-4 h-4" /> Enter Session
                                    </Link>
                                    {targetQA.expertName && (
                                        <div className="flex items-center gap-3 border-l border-slate-700 pl-6">
                                            <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700">
                                                <Users className="w-4 h-4 text-primary" />
                                            </div>
                                            <div>
                                                <p className="text-white text-sm font-bold">{targetQA.expertName}</p>
                                                <p className="text-slate-500 text-[10px] uppercase tracking-widest">{targetQA.expertTitle}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-slate-50 rounded-[2rem] border border-slate-200 p-16 text-center">
                            <Video className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-slate-900">No Upcoming Sessions</h3>
                            <p className="text-slate-500 mt-2">Check back soon for our next live industry analysis.</p>
                        </div>
                    )}
                </section>

                {/* ─── 2. TIER-1 BRANDS ─── */}
                <section>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-2 h-8 bg-primary rounded-full" />
                                <h2 className="text-3xl font-black tracking-tight text-slate-900 uppercase">Tier-1 Brands</h2>
                            </div>
                            <p className="text-slate-500 font-medium">Global manufacturers with verified authenticity and compliance.</p>
                        </div>
                        <Link href="/brands" className="text-primary font-bold flex items-center gap-2 text-sm uppercase tracking-widest hover:gap-4 transition-all">
                            Brand Directory <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {topBrands.map((brand) => (
                            <Link href={`/brands/${brand.id}` as any} key={brand.id} className="group flex flex-col bg-white border border-slate-200 rounded-[2rem] p-8 hover:border-primary hover:shadow-xl transition-all duration-300">
                                <div className="flex justify-between items-start mb-8">
                                    <div className="w-16 h-16 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center justify-center p-2 group-hover:scale-110 transition-transform">
                                        {brand.logoUrl ? (
                                            <Image src={brand.logoUrl} alt={brand.brandName || "Logo"} width={48} height={48} className="object-contain" />
                                        ) : (
                                            <ShieldCheck className="w-8 h-8 text-slate-300" />
                                        )}
                                    </div>
                                    <div className="bg-slate-50 px-3 py-1.5 rounded-full flex items-center gap-1 border border-slate-100">
                                        <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                                        <span className="text-sm font-bold text-slate-700">{brand.avgRating?.toFixed(1) || "N/A"}</span>
                                    </div>
                                </div>
                                <h3 className="text-xl font-black text-slate-900 mb-3">{brand.brandName}</h3>
                                <p className="text-slate-500 text-sm line-clamp-2 mb-8 flex-1">
                                    {brand.about || "Verified global solar manufacturer."}
                                </p>
                                <div className="flex items-center justify-between text-primary font-bold text-xs uppercase tracking-widest">
                                    View Portfolio <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* ─── 3. TOP EPCs ─── */}
                <section>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-2 h-8 bg-primary rounded-full" />
                                <h2 className="text-3xl font-black tracking-tight text-slate-900 uppercase">Certified Installers</h2>
                            </div>
                            <p className="text-slate-500 font-medium">Connect with top-rated Engineering, Procurement, and Construction professionals.</p>
                        </div>
                        <Link href="/epcs" className="text-primary font-bold flex items-center gap-2 text-sm uppercase tracking-widest hover:gap-4 transition-all">
                            EPC Directory <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {topEpcs.map((epc) => (
                            <Link href={`/epcs/${epc.id}` as any} key={epc.id} className="group flex flex-col bg-white border border-slate-200 rounded-[2rem] p-8 hover:border-primary hover:shadow-xl transition-all duration-300">
                                <div className="flex justify-between items-start mb-8">
                                    <div className="w-16 h-16 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center justify-center p-2 group-hover:scale-110 transition-transform">
                                        {epc.logoUrl ? (
                                            <Image src={epc.logoUrl} alt={epc.companyName || "Logo"} width={48} height={48} className="object-contain" />
                                        ) : (
                                            <Zap className="w-8 h-8 text-slate-300" />
                                        )}
                                    </div>
                                    <div className="bg-slate-50 px-3 py-1.5 rounded-full flex items-center gap-1 border border-slate-100">
                                        <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                                        <span className="text-sm font-bold text-slate-700">{epc.avgRating?.toFixed(1) || "N/A"}</span>
                                    </div>
                                </div>
                                <h3 className="text-xl font-black text-slate-900 mb-3">{epc.companyName}</h3>
                                <p className="text-slate-500 text-sm line-clamp-2 mb-8 flex-1">
                                    {epc.about || "Verified energy solution provider."}
                                </p>
                                <div className="flex items-center justify-between text-primary font-bold text-xs uppercase tracking-widest">
                                    View Profile <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* ─── 4. LATEST PODCASTS ─── */}
                <section>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-2 h-8 bg-slate-900 rounded-full" />
                                <h2 className="text-3xl font-black tracking-tight text-slate-900 uppercase">Industry Podcasts</h2>
                            </div>
                            <p className="text-slate-500 font-medium">Deep-dive technical discussions with solar industry leaders.</p>
                        </div>
                        <Link href="/podcast" className="text-slate-900 font-bold flex items-center gap-2 text-sm uppercase tracking-widest hover:gap-4 transition-all">
                            All Episodes <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    <div className="grid md:grid-cols-12 gap-8">
                        {featuredPodcast && (
                            <div className="md:col-span-8 bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-sm group">
                                <div className="aspect-[16/9] bg-primary/5 relative overflow-hidden">
                                    {featuredPodcast.thumbnailUrl ? (
                                        <Image src={featuredPodcast.thumbnailUrl} alt={featuredPodcast.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-primary/5">
                                            <Play className="w-12 h-12 text-slate-300" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                        <a href={featuredPodcast.youtubeUrl} target="_blank" className="w-20 h-20 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform">
                                            <Play className="w-8 h-8 text-slate-900 ml-1" />
                                        </a>
                                    </div>
                                </div>
                                <div className="p-10">
                                    <span className="text-primary font-black uppercase tracking-widest text-[10px] mb-4 block">Featured Episode</span>
                                    <h3 className="text-3xl font-black text-slate-900 mb-4 leading-tight">{featuredPodcast.title}</h3>
                                    <p className="text-slate-500 line-clamp-2 leading-relaxed mb-8">{featuredPodcast.description}</p>
                                    <div className="flex items-center justify-between border-t border-slate-100 pt-6">
                                        <span className="text-slate-400 text-sm font-bold flex items-center gap-2">
                                            <Calendar className="w-4 h-4" /> {new Date(featuredPodcast.createdAt).toLocaleDateString()}
                                        </span>
                                        {featuredPodcast.guestName && (
                                            <span className="text-slate-900 text-sm font-bold">Ft. {featuredPodcast.guestName}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="md:col-span-4 flex flex-col gap-6">
                            {morePodcasts.map((pod) => (
                                <div key={pod.id} className="bg-primary/5 border border-slate-200 rounded-[2rem] p-8 flex-1 flex flex-col justify-center group hover:border-slate-300 hover:bg-primary/10 transition-colors">
                                    <span className="text-slate-400 font-black uppercase tracking-widest text-[10px] mb-3 block">Episode Archive</span>
                                    <h4 className="font-bold text-lg text-slate-900 mb-3 leading-snug line-clamp-3">{pod.title}</h4>
                                    <a href={pod.youtubeUrl} target="_blank" className="mt-auto text-slate-900 font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:gap-4 transition-all">
                                        Watch Now <Play className="w-3 h-3" />
                                    </a>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
                
            </div>

            {/* ─── DIRECTORY FOOTER / CTA ─── */}
            <section className="border-t border-slate-200 bg-primary/5 py-24">
                <div className="max-w-[1200px] mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-6">Corporate Intelligence.</h2>
                        <p className="text-slate-600 text-lg leading-relaxed mb-8">
                            EnergyGurus is dedicated to bridging the gap between global manufacturers and regional infrastructure developers. Learn more about our verification standards or get in touch with our team.
                        </p>
                        <div className="flex gap-4">
                            <Link href="/about" className="bg-white border border-slate-200 text-slate-900 px-8 py-4 rounded-xl font-bold text-xs uppercase tracking-widest hover:border-slate-400 transition-colors flex items-center gap-2 shadow-sm">
                                <Info className="w-4 h-4" /> About Us
                            </Link>
                            <Link href="/contact" className="bg-slate-900 text-white px-8 py-4 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-800 transition-colors flex items-center gap-2 shadow-sm">
                                <Phone className="w-4 h-4" /> Contact Us
                            </Link>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm text-center">
                            <ShieldCheck className="w-8 h-8 text-primary mx-auto mb-4" />
                            <h4 className="font-bold text-slate-900">Verified Safety</h4>
                        </div>
                        <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm text-center">
                            <Zap className="w-8 h-8 text-primary mx-auto mb-4" />
                            <h4 className="font-bold text-slate-900">High Yield</h4>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

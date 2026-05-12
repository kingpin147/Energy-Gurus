import { Link } from "@/i18n/routing";
import { getTranslations } from "next-intl/server";
import { ArrowRight, Play, Star, ShieldCheck, Zap, Users } from "lucide-react";
import { db } from "@/db";
import { podcasts, epcInstallers } from "@/db/schema";
import { desc, avg, count, eq } from "drizzle-orm";
import { reviews } from "@/db/schema";

export default async function Homepage() {
    const t = await getTranslations("HomePage");

    // Fetch data
    let latestPodcasts: any[] = [];
    let topEpcs: any[] = [];

    try {
        latestPodcasts = await db.select().from(podcasts).orderBy(desc(podcasts.createdAt)).limit(3);

        // Get EPCs with real average ratings, ordered by rating desc
        const allEpcs = await db.select().from(epcInstallers).orderBy(desc(epcInstallers.createdAt)).limit(6);
        const withRatings = await Promise.all(allEpcs.map(async (epc) => {
            const [result] = await db.select({
                average: avg(reviews.rating),
                total: count(reviews.id),
            }).from(reviews).where(eq(reviews.targetId, epc.id));
            return {
                ...epc,
                avgRating: result?.average ? parseFloat(result.average) : null,
                reviewCount: result?.total ?? 0,
            };
        }));
        // Sort: top rated first, fall back to latest
        topEpcs = withRatings
            .sort((a, b) => (b.avgRating ?? -1) - (a.avgRating ?? -1))
            .slice(0, 3);
    } catch (e) {
        console.error("Homepage data fetch failed:", e);
    }

    const [featuredPodcast, ...morePodcasts] = latestPodcasts;

    return (
        <div className="bg-[#eefcfc] text-[#111e1e]">

            {/* ─── HERO BANNER ─── */}
            <section className="max-w-[1200px] mx-auto px-6 py-16">
                <div className="relative rounded-3xl overflow-hidden bg-[#006d6d] text-white min-h-[560px] flex items-center justify-center text-center px-8 lg:px-20">
                    {/* Background image */}
                    <div className="absolute inset-0 z-0">
                        <img
                            src="https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?q=80&w=2072&auto=format&fit=crop"
                            alt="Solar energy farm"
                            className="w-full h-full object-cover opacity-25"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#005353]/80 to-transparent" />
                    </div>

                    <div className="relative z-10 max-w-4xl mx-auto space-y-6">
                        <span className="inline-block bg-[#fdc74c] text-[#261900] px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
                            Authenticity Guaranteed
                        </span>
                        <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
                            Navigate the Energy Future with <span className="text-[#fdc74c]">Verified Expertise.</span>
                        </h1>
                        <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto leading-relaxed">
                            From certified installers to deep-dive brand profiles, we bring transparency to the solar industry for stakeholders and consumers alike.
                        </p>
                        <div className="flex flex-wrap gap-4 justify-center pt-2">
                            <Link
                                href="/epcs"
                                className="bg-[#fdc74c] text-[#261900] px-8 py-3 rounded-xl font-bold hover:shadow-xl transition-all text-base"
                            >
                                Explore Directory
                            </Link>
                            <Link
                                href="/podcast"
                                className="border-2 border-white/60 text-white px-8 py-3 rounded-xl font-bold hover:bg-white hover:text-[#005353] transition-all text-base"
                            >
                                Latest Podcasts
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── LATEST PODCASTS ─── */}
            <section className="max-w-[1200px] mx-auto px-6 pb-16">
                <div className="flex justify-between items-end mb-10">
                    <div>
                        <h2 className="text-3xl font-bold text-[#005353]">Latest Podcasts</h2>
                        <p className="text-[#3e4948] mt-1">Insights from industry leaders and energy innovators.</p>
                    </div>
                    <Link
                        href="/podcast"
                        className="hidden md:flex items-center gap-1.5 text-[#005353] font-bold hover:gap-3 transition-all text-sm"
                    >
                        View All Podcasts <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                {latestPodcasts.length === 0 ? (
                    <div className="text-center py-16 text-[#3e4948] border-2 border-dashed rounded-2xl">
                        No podcasts published yet.
                    </div>
                ) : (
                    <div className="grid md:grid-cols-12 gap-6">
                        {/* Featured large card */}
                        {featuredPodcast && (
                            <div className="md:col-span-8 bg-white border border-[#bec9c8] rounded-2xl overflow-hidden shadow-sm flex flex-col">
                                <div className="aspect-video bg-black relative">
                                    {featuredPodcast.thumbnailUrl ? (
                                        <img src={featuredPodcast.thumbnailUrl} alt={featuredPodcast.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-[#006d6d]/20 flex items-center justify-center">
                                            <div className="w-16 h-16 bg-[#005353] text-white rounded-full flex items-center justify-center shadow-xl">
                                                <Play className="w-8 h-8 fill-current ml-1" />
                                            </div>
                                        </div>
                                    )}
                                    <a
                                        href={featuredPodcast.youtubeUrl}
                                        target="_blank"
                                        className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/40 transition-colors group"
                                    >
                                        <div className="w-16 h-16 bg-[#005353] text-white rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                                            <Play className="w-8 h-8 fill-current ml-1" />
                                        </div>
                                    </a>
                                </div>
                                <div className="p-8 flex-1 flex flex-col">
                                    <span className="text-[#7a5900] font-bold uppercase tracking-widest text-xs mb-3 block">Featured Episode</span>
                                    <h3 className="text-2xl font-bold text-[#111e1e] mb-3 leading-snug">{featuredPodcast.title}</h3>
                                    <p className="text-[#3e4948] mb-6 line-clamp-3 leading-relaxed flex-1">{featuredPodcast.description}</p>
                                    <div className="flex flex-wrap gap-4 items-center">
                                        <a
                                            href={featuredPodcast.youtubeUrl}
                                            target="_blank"
                                            className="bg-[#005353] text-white px-6 py-2.5 rounded-xl font-bold hover:opacity-90 transition-opacity"
                                        >
                                            Watch Now
                                        </a>
                                        {featuredPodcast.guestName && (
                                            <span className="text-sm text-[#3e4948] font-medium">
                                                with <span className="font-bold text-[#111e1e]">{featuredPodcast.guestName}</span>
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Side smaller cards */}
                        <div className="md:col-span-4 flex flex-col gap-5">
                            {morePodcasts.map((pod, i) => (
                                <div key={pod.id} className={`bg-[#e8f6f6] border border-[#bec9c8] rounded-2xl p-6 flex-1 ${i === 1 ? "md:mt-5" : ""}`}>
                                    <span className="text-[#7a5900] font-bold uppercase tracking-widest text-[10px] mb-2 block">
                                        Episode
                                    </span>
                                    <h4 className="font-bold text-[#111e1e] mb-2 leading-snug line-clamp-2">{pod.title}</h4>
                                    <p className="text-[#3e4948] text-sm mb-4 line-clamp-2">{pod.description}</p>
                                    <a
                                        href={pod.youtubeUrl}
                                        target="_blank"
                                        className="text-[#005353] font-bold text-sm flex items-center gap-1.5 hover:gap-3 transition-all"
                                    >
                                        Play Episode <Play className="w-4 h-4 fill-current" />
                                    </a>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Mobile button */}
                <Link
                    href="/podcast"
                    className="md:hidden mt-5 w-full py-3 border border-[#005353] text-[#005353] font-bold rounded-xl flex items-center justify-center gap-2"
                >
                    View All Podcasts <ArrowRight className="w-4 h-4" />
                </Link>
            </section>

            {/* ─── ABOUT SECTION ─── */}
            <section className="bg-[#ddebeb] border-y border-[#bec9c8] py-16">
                <div className="max-w-[1200px] mx-auto px-6">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="max-w-xl">
                            <h2 className="text-3xl font-bold text-[#005353] mb-5">About EnergyGurus</h2>
                            <p className="text-[#3e4948] text-lg leading-relaxed mb-4">
                                At EnergyGurus, our mission is to restore trust and authenticity to the rapidly evolving solar industry. In a market flooded with claims, we provide the verification and technical depth needed to make informed decisions.
                            </p>
                            <p className="text-[#3e4948] leading-relaxed">
                                We bridge the gap between global manufacturers and local consumers through rigorous documentation, live expert engagement, and a verified directory of EPC professionals.
                            </p>
                            <Link
                                href="/about"
                                className="mt-6 inline-flex items-center gap-2 text-[#005353] font-bold hover:gap-4 transition-all"
                            >
                                Learn More <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div className="bg-white rounded-2xl p-6 border border-[#bec9c8] shadow-sm">
                                <ShieldCheck className="w-10 h-10 text-[#7a5900] mb-4" />
                                <h4 className="font-bold text-[#111e1e] text-lg mb-2">Verified Excellence</h4>
                                <p className="text-[#3e4948] text-sm">Every partner in our directory undergoes a strict verification process.</p>
                            </div>
                            <div className="bg-white rounded-2xl p-6 border border-[#bec9c8] shadow-sm sm:mt-8">
                                <Zap className="w-10 h-10 text-[#7a5900] mb-4" />
                                <h4 className="font-bold text-[#111e1e] text-lg mb-2">Technical Precision</h4>
                                <p className="text-[#3e4948] text-sm">Deep-dive analysis on hardware reliability and energy output performance.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── TOP RATED EPCs ─── */}
            <section className="max-w-[1200px] mx-auto px-6 py-16">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-[#005353]">Top Rated EPCs &amp; Installers</h2>
                        <p className="text-[#3e4948] mt-1">Connecting you with vetted energy professionals.</p>
                    </div>
                    <Link
                        href="/epcs"
                        className="text-[#005353] font-bold flex items-center gap-1.5 hover:gap-3 transition-all text-sm"
                    >
                        Explore More Installers <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                {topEpcs.length === 0 ? (
                    <div className="text-center py-16 text-[#3e4948] border-2 border-dashed rounded-2xl">
                        No EPC profiles found. Check back soon!
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {topEpcs.map((epc) => (
                            <div
                                key={epc.id}
                                className="bg-[#e8f6f6] border border-[#bec9c8] rounded-2xl p-6 hover:shadow-lg transition-all flex flex-col"
                            >
                                <div className="flex justify-between items-start mb-5">
                                    {/* Logo or initials */}
                                    <div className="w-14 h-14 bg-white rounded-xl border border-[#bec9c8] flex items-center justify-center overflow-hidden p-1 shadow-sm">
                                        {epc.logoUrl ? (
                                            <img src={epc.logoUrl} alt={epc.companyName} className="max-h-full max-w-full object-contain" />
                                        ) : (
                                            <span className="font-black text-[#005353] text-lg">
                                                {epc.companyName?.slice(0, 2).toUpperCase()}
                                            </span>
                                        )}
                                    </div>
                                    {/* Rating badge */}
                                    {epc.avgRating ? (
                                        <div className="flex items-center gap-1 bg-[#fdc74c]/30 text-[#7a5900] px-2.5 py-1 rounded-full text-sm font-bold">
                                            <Star className="w-3.5 h-3.5 fill-current" />
                                            {epc.avgRating.toFixed(1)}
                                        </div>
                                    ) : (
                                        <span className="text-xs text-[#6e7979] font-medium">No reviews</span>
                                    )}
                                </div>

                                <h3 className="font-bold text-[#111e1e] text-xl mb-2">{epc.companyName}</h3>
                                <p className="text-[#3e4948] text-sm mb-6 line-clamp-3 leading-relaxed flex-1">
                                    {epc.about || "Leading energy solution provider committed to quality solar installations."}
                                </p>

                                <Link
                                    href={`/epcs/${epc.id}` as any}
                                    className="w-full border border-[#005353] text-[#005353] py-2.5 rounded-xl font-bold hover:bg-[#005353] hover:text-white transition-all text-center text-sm"
                                >
                                    View Profile
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* ─── FOOTER CTA / NEWSLETTER ─── */}
            <section className="bg-[#ddebeb] border-t border-[#bec9c8] py-12">
                <div className="max-w-[1200px] mx-auto px-6 text-center">
                    <h2 className="text-2xl font-bold text-[#005353] mb-2">Stay Powered Up</h2>
                    <p className="text-[#3e4948] mb-6 max-w-xl mx-auto">
                        Get the latest energy news and podcast episodes delivered to your inbox.
                    </p>
                    <form className="flex gap-3 max-w-md mx-auto">
                        <input
                            type="email"
                            placeholder="Email address"
                            className="flex-1 bg-white border border-[#bec9c8] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#005353]"
                        />
                        <button
                            type="submit"
                            className="bg-[#005353] text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:opacity-90 transition-opacity"
                        >
                            Join
                        </button>
                    </form>
                </div>
            </section>
        </div>
    );
}

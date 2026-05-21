import { Mic, Play, Youtube, Filter, Search, Share2, Link as LinkIcon, Headphones, Calendar, Clock, ArrowRight, User } from "lucide-react";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import { db } from "@/db";
import { podcasts } from "@/db/schema";
import { desc, asc } from "drizzle-orm";
import { ListSort } from "@/components/shared/list-sort";
import { unstable_cache } from "next/cache";

const getPodcasts = unstable_cache(
    async (sortOrder: "asc" | "desc") => {
        const order = sortOrder === "asc" ? asc(podcasts.createdAt) : desc(podcasts.createdAt);
        return await db.select().from(podcasts).orderBy(order);
    },
    ['podcasts-list'],
    { revalidate: 3600, tags: ['podcasts'] }
);

export default async function PodcastListingPage({
    searchParams,
}: {
    searchParams: Promise<{ sort?: string }>;
}) {
    const { sort } = await searchParams;
    const sortOrder = sort === "oldest" ? "asc" : "desc";

    const episodes = await getPodcasts(sortOrder);

    const getYouTubeId = (url: string) => {
        return url.split("v=")[1]?.split("&")[0] || url.split("/").pop();
    };

    const getThumbnail = (episode: any) => {
        if (episode.thumbnailUrl) return episode.thumbnailUrl;
        const videoId = getYouTubeId(episode.youtubeUrl);
        return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    };

    return (
        <div className="bg-white min-h-screen font-sans selection:bg-primary/20">
            {/* ─── CINEMATIC HERO ─── */}
            <section className="relative w-full py-12 md:py-24 overflow-hidden border-b border-slate-100">
                <div className="absolute inset-0 bg-primary/5 -z-10"></div>
                <div className="container mx-auto px-6 max-w-7xl animate-reveal">
                    {episodes.length > 0 && (
                        <div className="grid lg:grid-cols-12 gap-12 lg:gap-20 items-center">
                            {/* Video Thumbnail Side */}
                            <div className="lg:col-span-7 relative group">
                                <div className="aspect-[16/9] rounded-[2.5rem] overflow-hidden shadow-2xl bg-black relative border border-white/20">
                                    <Image
                                        src={getThumbnail(episodes[0])}
                                        alt={episodes[0].title}
                                        fill
                                        sizes="(max-width: 1024px) 100vw, 60vw"
                                        className="object-cover opacity-70 group-hover:scale-105 transition-transform duration-1000"
                                        priority
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/30 transition-colors">
                                        <a href={episodes[0].youtubeUrl} target="_blank" className="w-20 h-20 md:w-24 md:h-24 bg-white/95 backdrop-blur rounded-full flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-all duration-500 hover:rotate-12">
                                            <Play className="w-8 h-8 md:w-10 md:h-10 fill-primary text-primary ml-1.5" />
                                        </a>
                                    </div>
                                    <div className="absolute bottom-10 left-10 hidden md:flex items-center gap-3">
                                        <div className="glass px-4 py-2 rounded-xl text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] shadow-lg">
                                            Latest Insight
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Content Side */}
                            <div className="lg:col-span-5 space-y-8">
                                <div className="inline-flex items-center gap-3 bg-primary/10 text-primary px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-primary/20 animate-soft-float">
                                    <Mic className="w-4 h-4" /> Energy Discourse
                                </div>

                                <h1 className="text-4xl md:text-6xl font-black text-slate-900 leading-[1] tracking-tighter">
                                    EP {episodes.length}: {episodes[0].title}
                                </h1>

                                <div className="flex items-center gap-5 p-4 glass rounded-2xl border border-white/40 shadow-sm max-w-fit">
                                    <Avatar className="w-14 h-14 border-2 border-primary/20 shadow-sm">
                                        <AvatarFallback className="bg-primary text-white font-black">
                                            {episodes[0].guestName?.charAt(0) || "G"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-black text-slate-900 uppercase tracking-tight">{episodes[0].guestName}</p>
                                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.1em]">{episodes[0].guestDesignation}</p>
                                    </div>
                                </div>

                                <p className="text-lg text-slate-500 font-medium leading-relaxed opacity-90 line-clamp-3">
                                    {episodes[0].description}
                                </p>

                                <div className="flex flex-col sm:flex-row gap-5">
                                    <Link href={episodes[0].youtubeUrl} target="_blank" className="bg-primary text-white px-10 py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3">
                                        <Youtube className="w-5 h-5" /> Watch Episode
                                    </Link>
                                    <Link href={episodes[0].youtubeUrl} target="_blank" className="glass text-slate-900 px-10 py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-lg hover:bg-white/60 transition-all flex items-center justify-center gap-3">
                                        <Share2 className="w-4 h-4" /> Share Discussion
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* ─── EPISODES GRID ─── */}
            <div className="container mx-auto px-6 py-20 lg:py-32 max-w-7xl">

                {/* Header Controls */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-16 lg:mb-24">
                    <div className="space-y-2">
                        <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter uppercase">Episode Archive</h2>
                        <p className="text-slate-500 font-medium text-lg">Deep-dive technical discussions with solar industry leaders.</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                            <Input placeholder="Search topics..." className="pl-12 h-14 bg-slate-50 border-slate-200 rounded-2xl focus:bg-white focus:ring-primary/20 transition-all min-w-[280px]" />
                        </div>
                        <ListSort
                            options={[
                                { label: "Latest First", value: "latest" },
                                { label: "Oldest First", value: "oldest" },
                            ]}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-14">
                    {episodes.map((episode, index) => {
                        const showCTA = index === 2; // Show CTA after 3 episodes

                        return (
                            <div key={episode.id} className="contents">
                                <Card className="group glass border border-white/40 rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 flex flex-col">
                                    <div className="aspect-[16/10] relative overflow-hidden">
                                        <Image
                                            src={getThumbnail(episode)}
                                            alt={episode.title}
                                            fill
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                            className="object-cover group-hover:scale-105 transition-transform duration-1000"
                                        />
                                        <div className="absolute top-6 left-6 glass px-3 py-1.5 rounded-xl text-[9px] font-black text-slate-900 shadow-sm uppercase tracking-widest border border-white/50">
                                            EP {episodes.length - index}
                                        </div>
                                    </div>
                                    <div className="p-8 flex-1 flex flex-col">
                                        <div className="flex items-center gap-3 mb-5">
                                            <div className="w-2 h-2 bg-primary rounded-full shadow-[0_0_10px_rgba(0,109,109,0.5)]" />
                                            <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">
                                                {episode.guestDesignation || "Energy Insight"}
                                            </span>
                                        </div>
                                        <h3 className="text-2xl font-black text-slate-900 mb-6 leading-tight group-hover:text-primary transition-colors tracking-tight line-clamp-2">
                                            {episode.title}
                                        </h3>
                                        <p className="text-sm text-slate-500 font-medium line-clamp-3 mb-10 leading-relaxed opacity-80 flex-1">
                                            {episode.description}
                                        </p>
                                        <div className="flex items-center justify-between pt-8 border-t border-slate-100">
                                            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                <Calendar className="w-4 h-4" />
                                                <span>{new Date(episode.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <Link
                                                href={episode.youtubeUrl}
                                                target="_blank"
                                                className="text-[10px] font-black text-primary hover:text-slate-900 flex items-center gap-2 transition-all uppercase tracking-widest group/link"
                                            >
                                                Start <ArrowRight className="w-4 h-4 group-hover/link:translate-x-2 transition-transform" />
                                            </Link>
                                        </div>
                                    </div>
                                </Card>

                                {showCTA && (
                                    <Card className="bg-slate-900 rounded-[3rem] overflow-hidden border-none flex flex-col justify-center p-12 relative shadow-2xl group lg:aspect-square">
                                        <div className="absolute inset-0 bg-primary/5 pointer-events-none group-hover:bg-primary/10 transition-colors"></div>
                                        <div className="relative z-10 space-y-6">
                                            <div className="w-14 h-14 bg-primary/20 rounded-2xl flex items-center justify-center border border-white/10 group-hover:rotate-12 transition-transform">
                                                <User className="w-7 h-7 text-primary" />
                                            </div>
                                            <h3 className="text-3xl font-black text-white leading-tight tracking-tight uppercase">Join the Discourse Live</h3>
                                            <p className="text-slate-400 font-medium leading-relaxed opacity-80">
                                                Every session includes a live engineering board Q&A. Register to participate directly.
                                            </p>
                                            <Button className="w-full h-16 rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.2em] bg-primary text-white hover:scale-105 shadow-xl shadow-primary/20 transition-all border-none">
                                                <Calendar className="w-5 h-5 mr-3" /> Register for Next Session
                                            </Button>
                                        </div>
                                        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-primary/5 rounded-full blur-[100px]" />
                                    </Card>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Pagination */}
                <div className="mt-32 flex justify-center items-center gap-4">
                    <button className="w-14 h-14 rounded-2xl border border-slate-200 flex items-center justify-center text-slate-400 hover:border-primary hover:text-primary transition-all font-black">&lt;</button>
                    <button className="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center font-black shadow-lg shadow-primary/20">1</button>
                    <button className="w-14 h-14 rounded-2xl border border-slate-200 flex items-center justify-center text-slate-900 hover:border-primary hover:text-primary transition-all font-black">2</button>
                    <button className="w-14 h-14 rounded-2xl border border-slate-200 flex items-center justify-center text-slate-900 hover:border-primary hover:text-primary transition-all font-black">3</button>
                    <span className="mx-4 text-slate-300 font-black">...</span>
                    <button className="w-14 h-14 rounded-2xl border border-slate-200 flex items-center justify-center text-slate-400 hover:border-primary hover:text-primary transition-all font-black">&gt;</button>
                </div>
            </div>
        </div>
    );
}

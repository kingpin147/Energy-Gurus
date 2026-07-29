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
        <div className="font-sans text-graphite bg-paper leading-relaxed selection:bg-amber/20 overflow-x-hidden min-h-screen">
            <header className="bg-ink text-white pt-[64px]">
                <div className="max-w-[1180px] mx-auto px-5 md:px-8">
                    <p className="font-ibm-plex-mono text-[0.76rem] tracking-[0.14em] uppercase text-amber flex items-center gap-2.5 mb-[18px]">
                        <span className="w-5 h-[1px] bg-amber"></span>
                        The Podcast
                    </p>
                    <h1 className="font-space-grotesk font-semibold text-[clamp(2rem,4vw,2.8rem)] tracking-[-0.01em]">
                        Straight talk on solar.
                    </h1>
                    <p className="text-paper/70 max-w-[560px] mt-[14px] text-[1.02rem] pb-[40px]">
                        New episodes breaking down the facts and figures behind solar energy — no jargon, no sales pressure. Watch on YouTube or listen wherever you get podcasts.
                    </p>
                </div>
                <div className="bg-[#0e1b30] border-t border-white/10">
                    <div className="max-w-[1180px] mx-auto px-5 md:px-8 py-[18px] flex flex-wrap gap-3.5">
                        <a href="https://www.youtube.com/energygurus.online" target="_blank" rel="noopener" className="flex items-center gap-2 px-[18px] py-2.5 rounded-[3px] text-[0.85rem] bg-amber/10 text-amber border border-amber transition-colors hover:bg-amber/20 font-semibold">
                            <Youtube className="w-4 h-4" /> Watch on YouTube
                        </a>
                        <a href="#" className="flex items-center gap-2 px-[18px] py-2.5 rounded-[3px] text-[0.85rem] bg-white/5 text-white border border-white/15 transition-colors hover:border-amber font-semibold">
                            <Headphones className="w-4 h-4" /> Apple Podcasts
                        </a>
                        <a href="#" className="flex items-center gap-2 px-[18px] py-2.5 rounded-[3px] text-[0.85rem] bg-white/5 text-white border border-white/15 transition-colors hover:border-amber font-semibold">
                            <Headphones className="w-4 h-4" /> Spotify
                        </a>
                    </div>
                </div>
            </header>

            {/* Featured section */}
            {episodes.length > 0 && (() => {
                const featured = episodes[0];
                const videoId = getYouTubeId(featured.youtubeUrl);
                return (
                    <section className="py-[64px]">
                        <div className="max-w-[1180px] mx-auto px-5 md:px-8 grid grid-cols-1 md:grid-cols-[1.3fr_0.9fr] gap-10">
                            <div>
                                <div className="relative w-full pt-[56.25%] rounded-[6px] overflow-hidden border border-line bg-ink">
                                    <iframe 
                                        src={`https://www.youtube.com/embed/${videoId}`} 
                                        title="EnergyGurus Podcast — Latest Episode" 
                                        allowFullScreen
                                        className="absolute inset-0 w-full h-full border-0"
                                    ></iframe>
                                </div>
                            </div>
                            <div>
                                <span className="font-ibm-plex-mono text-[0.7rem] tracking-[0.06em] uppercase text-teal bg-[rgba(47,110,98,0.1)] px-2.5 py-1 rounded-[20px] inline-block mb-3.5">
                                    Latest Episode
                                </span>
                                <h2 className="font-space-grotesk font-semibold text-[1.5rem] text-ink mb-3 tracking-[-0.01em]">
                                    {featured.title}
                                </h2>
                                <p className="text-slate-custom text-[0.98rem] mb-[22px]">
                                    {featured.description}
                                </p>
                                <div className="bg-white border border-line rounded-[4px] p-5">
                                    <div className="font-ibm-plex-mono text-[0.72rem] tracking-[0.06em] uppercase text-slate-custom mb-3">
                                        Episode Details
                                    </div>
                                    <ul className="list-none">
                                        <li className="flex gap-2.5 py-2 border-t border-line text-[0.9rem] first:border-t-0">
                                            <span className="font-ibm-plex-mono text-amber font-semibold">Guest</span> 
                                            {featured.guestName || "Energy Insights"}
                                        </li>
                                        {featured.guestDesignation && (
                                            <li className="flex gap-2.5 py-2 border-t border-line text-[0.9rem]">
                                                <span className="font-ibm-plex-mono text-amber font-semibold">Role</span> 
                                                {featured.guestDesignation}
                                            </li>
                                        )}
                                        <li className="flex gap-2.5 py-2 border-t border-line text-[0.9rem]">
                                            <span className="font-ibm-plex-mono text-amber font-semibold">Date</span> 
                                            {new Date(featured.createdAt).toLocaleDateString()}
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </section>
                );
            })()}

            {/* Episodes Grid */}
            <section className="pb-[64px] pt-[0px]">
                <div className="max-w-[1180px] mx-auto px-5 md:px-8">
                    <div className="flex gap-2.5 flex-wrap mb-9 items-center justify-between">
                        <div className="flex gap-2.5 flex-wrap">
                            <span className="font-ibm-plex-mono text-[0.78rem] px-4 py-2 rounded-[20px] border border-ink bg-ink text-white cursor-pointer transition-colors">All</span>
                            <span className="font-ibm-plex-mono text-[0.78rem] px-4 py-2 rounded-[20px] border border-line bg-white text-slate-custom cursor-pointer hover:border-slate-custom transition-colors">Residential</span>
                            <span className="font-ibm-plex-mono text-[0.78rem] px-4 py-2 rounded-[20px] border border-line bg-white text-slate-custom cursor-pointer hover:border-slate-custom transition-colors">Commercial</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white border border-line rounded-[20px] px-3 py-1 flex-shrink-0">
                             <ListSort
                                options={[
                                    { label: "Latest First", value: "latest" },
                                    { label: "Oldest First", value: "oldest" },
                                ]}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                        {episodes.slice(1).map((episode) => (
                            <a key={episode.id} href={episode.youtubeUrl} target="_blank" rel="noopener noreferrer" className="bg-white border border-line rounded-[4px] overflow-hidden flex flex-col hover:border-teal transition-colors group">
                                <div className="aspect-[16/9] relative bg-ink flex items-center justify-center">
                                    <Image
                                        src={getThumbnail(episode)}
                                        alt={episode.title}
                                        fill
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                        className="object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                                    />
                                    <div className="w-[44px] h-[44px] rounded-full bg-amber flex items-center justify-center text-ink text-[0.95rem] z-10 pl-1 shadow-lg group-hover:scale-110 transition-transform">
                                        ▶
                                    </div>
                                    <span className="absolute bottom-2 right-2 bg-ink/85 text-white font-ibm-plex-mono text-[0.7rem] px-2 py-0.5 rounded-[3px] z-10">
                                        {new Date(episode.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="p-5 flex flex-col flex-grow">
                                    <span className="font-ibm-plex-mono text-[0.66rem] tracking-[0.05em] uppercase text-teal mb-2">
                                        Podcast
                                    </span>
                                    <h3 className="font-space-grotesk text-[1.02rem] font-semibold text-ink mb-2 tracking-[-0.01em]">
                                        {episode.title}
                                    </h3>
                                    <p className="text-slate-custom text-[0.88rem] flex-grow line-clamp-2">
                                        {episode.description}
                                    </p>
                                    <span className="mt-3.5 text-[0.84rem] font-semibold text-ink group-hover:text-teal transition-colors flex items-center gap-1">
                                        Watch Episode <ArrowRight className="w-3.5 h-3.5" />
                                    </span>
                                </div>
                            </a>
                        ))}
                    </div>

                    {episodes.length === 1 && (
                        <div className="text-center text-slate-custom py-12">
                            More episodes coming soon.
                        </div>
                    )}
                    {episodes.length === 0 && (
                        <div className="text-center text-slate-custom py-12">
                            No episodes available yet. Check back soon!
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}

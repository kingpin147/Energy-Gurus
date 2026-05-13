import { Mic, Play, Youtube, Filter, Search, Share2, Link as LinkIcon, Headphones, Calendar, Clock } from "lucide-react";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { db } from "@/db";
import { podcasts } from "@/db/schema";
import { desc, asc } from "drizzle-orm";
import { ListSort } from "@/components/shared/list-sort";

export default async function PodcastListingPage({
    searchParams,
}: {
    searchParams: Promise<{ sort?: string }>;
}) {
    const { sort } = await searchParams;
    const order = sort === "oldest" ? asc(podcasts.createdAt) : desc(podcasts.createdAt);
    
    const episodes = await db.select().from(podcasts).orderBy(order);

    const getYouTubeId = (url: string) => {
        return url.split("v=")[1]?.split("&")[0] || url.split("/").pop();
    };

    const getThumbnail = (episode: any) => {
        if (episode.thumbnailUrl) return episode.thumbnailUrl;
        const videoId = getYouTubeId(episode.youtubeUrl);
        return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    };

    return (
        <div className="bg-white min-h-screen">
            {/* Main Content Container */}
            <div className="container mx-auto px-4 py-12 max-w-7xl">
                
                {/* Hero / Latest Episode Section */}
                {episodes.length > 0 && (
                    <div className="grid lg:grid-cols-12 gap-12 items-center mb-24">
                        {/* Video Thumbnail Side */}
                        <div className="lg:col-span-7 relative group">
                            <div className="aspect-[16/9] rounded-2xl overflow-hidden shadow-2xl bg-black relative">
                                <img 
                                    src={getThumbnail(episodes[0])} 
                                    alt={episodes[0].title}
                                    className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-20 h-20 bg-accent text-accent-foreground rounded-full flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-transform duration-300">
                                        <Play className="w-8 h-8 fill-current ml-1" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Content Side */}
                        <div className="lg:col-span-5">
                            <div className="inline-flex items-center gap-2 bg-accent/20 text-accent-foreground px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
                                <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                                LATEST EPISODE
                            </div>
                            
                            <h1 className="text-4xl md:text-5xl font-bold text-primary leading-tight mb-6">
                                Episode {episodes.length}: {episodes[0].title}
                            </h1>

                            <div className="flex items-center gap-4 mb-8">
                                <Avatar className="w-12 h-12 border-2 border-primary/10">
                                    <AvatarFallback className="bg-primary text-white">
                                        {episodes[0].guestName?.charAt(0) || "G"}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-bold text-primary">{episodes[0].guestName}</p>
                                    <p className="text-sm text-muted-foreground">{episodes[0].guestDesignation}</p>
                                </div>
                            </div>

                            <p className="text-lg text-muted-foreground mb-10 line-clamp-4 leading-relaxed">
                                {episodes[0].description}
                            </p>

                            <div className="flex flex-wrap gap-4 mb-8">
                                <Button size="lg" className="rounded-xl px-8 h-14 font-bold bg-primary hover:bg-primary/90 gap-2" asChild>
                                    <a href={episodes[0].youtubeUrl} target="_blank">
                                        <Play className="w-5 h-5 fill-current" /> Watch Now
                                    </a>
                                </Button>
                                <Button variant="outline" size="lg" className="rounded-xl px-8 h-14 font-bold border-primary/20 hover:bg-primary/5 gap-2" asChild>
                                    <a href={episodes[0].youtubeUrl} target="_blank">
                                        <Headphones className="w-5 h-5" /> Listen on YouTube
                                    </a>
                                </Button>
                            </div>

                            <div className="flex items-center gap-4 text-muted-foreground">
                                <span className="text-sm font-medium">Share this episode:</span>
                                <div className="flex gap-2">
                                    <button className="p-2 hover:text-primary transition-colors"><Share2 className="w-4 h-4" /></button>
                                    <button className="p-2 hover:text-primary transition-colors"><LinkIcon className="w-4 h-4" /></button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* All Episodes Header */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12 border-t pt-16">
                    <div>
                        <h2 className="text-3xl font-bold text-primary">All Episodes</h2>
                        <p className="text-muted-foreground">Explore our full library of energy insights.</p>
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input placeholder="Search topics, guests..." className="pl-10 h-11 bg-white border-primary/10 rounded-xl" />
                        </div>
                        <ListSort 
                            options={[
                                { label: "Latest", value: "latest" },
                                { label: "Oldest", value: "oldest" },
                            ]} 
                        />
                    </div>
                </div>

                {/* Episodes Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {episodes.map((episode, index) => {
                        // Insert CTA card at position 5 (index 4)
                        const showCTA = index === 4;
                        
                        return (
                            <div key={episode.id} className="contents">
                                {showCTA && (
                                    <Card key="cta-card" className="bg-primary text-primary-foreground overflow-hidden rounded-3xl border-none flex flex-col justify-center p-10 relative">
                                        <div className="relative z-10">
                                            <h3 className="text-3xl font-bold mb-6">Join the Conversation Live</h3>
                                            <p className="text-primary-foreground/80 mb-8 leading-relaxed">
                                                Every Thursday we host a live QA with industry leaders. Get your questions answered directly.
                                            </p>
                                            <Button variant="accent" className="w-full h-14 rounded-xl font-bold text-lg gap-2">
                                                <Calendar className="w-5 h-5" /> Register for Next Live
                                            </Button>
                                        </div>
                                        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
                                        <div className="absolute top-10 -left-10 w-20 h-20 bg-white/5 rounded-full blur-2xl" />
                                    </Card>
                                )}
                                
                                <Card key={episode.id} className="group border-none shadow-none hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 rounded-2xl overflow-hidden bg-white">
                                    <div className="aspect-[16/10] relative overflow-hidden">
                                        <img 
                                            src={getThumbnail(episode)} 
                                            alt={episode.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-lg text-[10px] font-bold text-primary shadow-sm uppercase">
                                            EP {episodes.length - index}
                                        </div>
                                    </div>
                                    <CardContent className="p-6">
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="w-2 h-2 bg-accent rounded-full" />
                                            <span className="text-[10px] font-bold text-accent-foreground uppercase tracking-widest">
                                                {episode.guestDesignation || "Energy Guru Insight"}
                                            </span>
                                        </div>
                                        <h3 className="text-xl font-bold text-primary mb-4 line-clamp-2 group-hover:text-accent transition-colors">
                                            {episode.title}
                                        </h3>
                                        <p className="text-sm text-muted-foreground line-clamp-2 mb-6 leading-relaxed">
                                            {episode.description}
                                        </p>
                                        <div className="flex items-center justify-between pt-6 border-t border-primary/5">
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <Clock className="w-3 h-3" />
                                                <span>{new Date(episode.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <Link 
                                                href={`/podcast/${episode.id}`}
                                                className="text-xs font-bold text-primary hover:text-accent flex items-center gap-1 transition-colors"
                                            >
                                                Details <span className="text-lg">→</span>
                                            </Link>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        );
                    })}
                </div>

                {/* Pagination */}
                <div className="mt-20 flex justify-center items-center gap-2">
                    <Button variant="outline" size="icon" className="rounded-xl border-primary/10">{"<"}</Button>
                    <Button variant="primary" size="icon" className="rounded-xl">1</Button>
                    <Button variant="ghost" size="icon" className="rounded-xl">2</Button>
                    <Button variant="ghost" size="icon" className="rounded-xl">3</Button>
                    <span className="mx-2 text-muted-foreground">...</span>
                    <Button variant="outline" size="icon" className="rounded-xl border-primary/10">{">"}</Button>
                </div>
            </div>
        </div>
    );
}

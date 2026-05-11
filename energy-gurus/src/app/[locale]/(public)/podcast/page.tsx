import { Mic, Play, Youtube, Filter, Share2 } from "lucide-react";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { db } from "@/db";
import { podcasts } from "@/db/schema";
import { desc } from "drizzle-orm";

export default async function PodcastListingPage() {
    const episodes = await db.select().from(podcasts).orderBy(desc(podcasts.createdAt));

    return (
        <div className="container mx-auto px-4 py-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight mb-4">EnergyGurus Podcast</h1>
                    <p className="text-lg text-muted-foreground max-w-2xl">
                        Expert analysis, deep dives into Pakistan's energy landscape, and conversations with industry leaders.
                    </p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <Button variant="outline" size="sm" className="gap-2" asChild>
                        <a href="https://youtube.com/@energygurus" target="_blank">
                            <Youtube className="w-4 h-4 text-red-600" /> YouTube Channel
                        </a>
                    </Button>
                </div>
            </div>

            {/* Hero / Latest Episode */}
            {episodes.length > 0 && (
                <Card className="mb-16 border-none shadow-2xl overflow-hidden bg-primary text-primary-foreground">
                    <CardContent className="p-0">
                        <div className="flex flex-col lg:flex-row">
                            <div className="flex-1 p-8 lg:p-12 flex flex-col justify-center">
                                <span className="text-accent font-bold uppercase tracking-widest text-xs mb-4 flex items-center gap-2">
                                    <span className="w-2 h-2 bg-accent rounded-full animate-pulse" /> Latest Episode
                                </span>
                                <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">{episodes[0].title}</h2>
                                <p className="text-lg opacity-90 mb-8 line-clamp-3">
                                    {episodes[0].description}
                                </p>
                                <div className="flex items-center gap-6 mb-10">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                                            <Mic className="w-5 h-5 text-accent" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm leading-none">{episodes[0].guestName}</p>
                                            <p className="text-xs opacity-60">{episodes[0].guestDesignation}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-4">
                                    <Button variant="accent" size="lg" className="rounded-full gap-2 px-8 font-bold" asChild>
                                        <Link href={`/podcast/${episodes[0].id}`}>
                                            <Play className="w-5 h-5 fill-current" /> Watch Episode
                                        </Link>
                                    </Button>
                                    <Button variant="ghost" size="lg" className="rounded-full text-white hover:bg-white/10 px-8" asChild>
                                        <a href={episodes[0].youtubeUrl} target="_blank">View on YouTube</a>
                                    </Button>
                                </div>
                            </div>
                            <div className="flex-1 bg-black aspect-video lg:aspect-auto flex items-center justify-center relative">
                                <VideoEmbed url={episodes[0].youtubeUrl} />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Grid of Episodes */}
            {episodes.length > 1 && (
                <>
                    <h3 className="text-2xl font-bold mb-8">Previous Episodes</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {episodes.slice(1).map((episode) => (
                            <EpisodeCard key={episode.id} episode={episode} />
                        ))}
                    </div>
                </>
            )}
            
            {episodes.length === 0 && (
                <div className="py-20 text-center bg-secondary/10 rounded-3xl">
                    <Mic className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-20" />
                    <h3 className="text-xl font-medium text-muted-foreground">No podcast episodes found.</h3>
                </div>
            )}
        </div>
    );
}

function VideoEmbed({ url }: { url: string }) {
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

function EpisodeCard({ episode }: { episode: any }) {
    return (
        <Card className="flex flex-col hover:shadow-xl transition-all border-none bg-secondary/10 overflow-hidden group rounded-2xl">
            <div className="aspect-video bg-black relative overflow-hidden">
                <VideoEmbed url={episode.youtubeUrl} />
            </div>
            <CardContent className="flex-1 p-6">
                <h4 className="text-xl font-bold mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                    <Link href={`/podcast/${episode.id}`}>{episode.title}</Link>
                </h4>
                <p className="text-sm text-muted-foreground line-clamp-3 mb-6">
                    {episode.description}
                </p>
                <div className="flex items-center justify-between mt-auto">
                    <div className="text-xs">
                        <p className="font-bold">{episode.guestName}</p>
                        <p className="text-muted-foreground">{episode.guestDesignation}</p>
                    </div>
                    <Button variant="ghost" size="sm" className="rounded-full" asChild>
                        <Link href={`/podcast/${episode.id}`}>Details →</Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

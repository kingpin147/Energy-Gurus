import { Mic, Play, Calendar, Clock, Filter } from "lucide-react";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getEpisodes } from "@/lib/podbean";
import Image from "next/image";

export default async function PodcastListingPage() {
    const episodes = await getEpisodes();

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
                    <Button variant="outline" size="sm" className="gap-2">
                        <Filter className="w-4 h-4" /> Filter by Topic
                    </Button>
                    <Button variant="primary" size="sm">
                        Subscribe RSS
                    </Button>
                </div>
            </div>

            {/* Hero / Latest Episode */}
            {episodes.length > 0 && (
                <Card className="mb-16 border-none overflow-hidden bg-primary text-primary-foreground">
                    <CardContent className="p-0">
                        <div className="flex flex-col lg:flex-row">
                            <div className="flex-1 p-8 lg:p-12 flex flex-col justify-center">
                                <span className="text-accent font-bold uppercase tracking-widest text-sm mb-4">Latest Episode</span>
                                <h2 className="text-3xl md:text-5xl font-bold mb-6">{episodes[0].title}</h2>
                                <p className="text-lg opacity-90 mb-8 line-clamp-3">
                                    {episodes[0].content}
                                </p>
                                <div className="flex items-center gap-6 mb-8 text-sm opacity-80">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4" /> {new Date(episodes[0].publish_time).toLocaleDateString()}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4" /> {Math.floor(episodes[0].duration / 60)} mins
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-4">
                                    <Button variant="accent" size="lg" className="rounded-full gap-2 px-8 font-bold" asChild>
                                        <Link href={`/podcast/${episodes[0].id}`}>
                                            <Play className="w-5 h-5 fill-current" /> Listen Now
                                        </Link>
                                    </Button>
                                    <Button variant="outline" size="lg" className="bg-transparent rounded-full border-white text-white hover:bg-white hover:text-primary px-8" asChild>
                                        <Link href={`/podcast/${episodes[0].id}#transcript`}>Read Transcript</Link>
                                    </Button>
                                </div>
                            </div>
                            <div className="flex-1 min-h-[400px] relative bg-slate-200">
                                <div className="absolute inset-0 flex items-center justify-center grayscale opacity-10">
                                    <Mic className="w-48 h-48" />
                                </div>
                                {/* Image component would go here with episodes[0].logo */}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Grid of Episodes */}
            <h3 className="text-2xl font-bold mb-8">Previous Episodes</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {episodes.slice(1).map((episode) => (
                    <EpisodeCard key={episode.id} episode={episode} />
                ))}
            </div>
        </div>
    );
}

function EpisodeCard({ episode }: { episode: any }) {
    return (
        <Card className="flex flex-col hover:shadow-xl transition-shadow border-none bg-secondary/10 overflow-hidden group">
            <div className="aspect-video bg-secondary/30 relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-primary/20 backdrop-blur-sm transition-opacity z-10">
                    <Button variant="accent" size="icon" className="rounded-full w-12 h-12" asChild>
                        <Link href={`/podcast/${episode.id}`}><Play className="w-6 h-6 fill-current" /></Link>
                    </Button>
                </div>
                <div className="absolute inset-0 flex items-center justify-center grayscale opacity-5">
                    <Mic className="w-20 h-20" />
                </div>
            </div>
            <CardContent className="flex-1 p-6">
                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(episode.publish_time).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {Math.floor(episode.duration / 60)} mins</span>
                </div>
                <h4 className="text-xl font-bold mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                    <Link href={`/podcast/${episode.id}`}>{episode.title}</Link>
                </h4>
                <p className="text-sm text-muted-foreground line-clamp-3 mb-6">
                    {episode.content}
                </p>
                <Button variant="link" className="p-0 h-auto text-primary font-bold" asChild>
                    <Link href={`/podcast/${episode.id}`}>Details & Transcript →</Link>
                </Button>
            </CardContent>
        </Card>
    );
}

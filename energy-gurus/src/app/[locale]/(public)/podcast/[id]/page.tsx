import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mic, Calendar, Youtube, ArrowLeft, Share2 } from "lucide-react";
import { Link } from "@/i18n/routing";
import { db } from "@/db";
import { podcasts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Metadata } from "next";
import { PodcastShare } from "@/components/podcast/podcast-share";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    const podcast = await db.query.podcasts.findFirst({
        where: eq(podcasts.id, id),
    });

    if (!podcast) return {};

    return {
        title: `${podcast.title} | EnergyGurus Podcast`,
        description: podcast.description?.slice(0, 160),
    };
}

export default async function EpisodePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    
    let episode;
    try {
        const results = await db.select().from(podcasts).where(eq(podcasts.id, id));
        episode = results[0];
    } catch (e) {
        return notFound();
    }

    if (!episode) {
        notFound();
    }

    return (
        <div className="container mx-auto px-4 py-12">
            {/* Back Button */}
            <Button variant="ghost" className="mb-8 p-0 hover:bg-transparent text-muted-foreground hover:text-primary transition-colors" asChild>
                <Link href="/podcast">
                    <ArrowLeft className="mr-2 w-4 h-4" /> Back to Episodes
                </Link>
            </Button>

            <div className="flex flex-col lg:flex-row gap-12">
                {/* Left Column: Metadata & Player */}
                <div className="flex-[2] space-y-8">
                    <div>
                        <span className="text-accent font-bold uppercase tracking-widest text-sm mb-2 block">EnergyGurus Podcast</span>
                        <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-6">{episode.title}</h1>

                        <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground mb-8">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" /> {new Date(episode.createdAt).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-2">
                                <Youtube className="w-4 h-4" /> Available on YouTube
                            </div>
                        </div>

                        {/* YouTube Player */}
                        <div className="aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl mb-8">
                            <VideoEmbed url={episode.youtubeUrl} />
                        </div>

                        <div className="flex gap-4 mt-6">
                            <Button variant="outline" size="sm" className="gap-2 h-12 px-6 rounded-full" asChild>
                                <a href={episode.youtubeUrl} target="_blank">
                                    <Youtube className="w-4 h-4 text-red-600" /> Watch on YouTube
                                </a>
                            </Button>
                            <PodcastShare title={episode.title} />
                        </div>
                    </div>

                    <div className="prose prose-slate max-w-none">
                        <h3 className="text-2xl font-bold mb-4">Description</h3>
                        <p className="text-lg leading-relaxed text-muted-foreground mb-8">
                            {episode.description}
                        </p>

                        <h3 id="transcript" className="text-2xl font-bold mb-4">Episode Highlights</h3>
                        <div className="bg-secondary/10 p-8 rounded-xl space-y-6 text-muted-foreground italic leading-relaxed">
                            <p>This episode features <strong>{episode.guestName}</strong> ({episode.guestDesignation}) discussing the latest trends in the energy sector.</p>
                            <p>Key topics covered:</p>
                            <ul className="not-italic list-disc pl-6 space-y-2">
                                <li>Policy updates for 2026</li>
                                <li>Technological advancements in solar energy</li>
                                <li>Grid stability and distribution challenges</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Right Column: Sidebar / CTAs */}
                <div className="flex-1 space-y-8">
                    <Card className="bg-accent/10 border-none">
                        <CardContent className="pt-6">
                            <h4 className="font-bold mb-4">About the Guest</h4>
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                                    <Mic className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <p className="font-bold">{episode.guestName}</p>
                                    <p className="text-xs text-muted-foreground">{episode.guestDesignation}</p>
                                </div>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Professional insights from one of the industry's leading experts.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-t-4 border-primary">
                        <CardContent className="pt-6">
                            <h4 className="text-xl font-bold mb-4">Take Action</h4>
                            <p className="text-sm text-muted-foreground mb-6">
                                Are you looking for certified installers or energy brands?
                            </p>
                            <div className="space-y-3">
                                <Button className="w-full justify-between" asChild>
                                    <Link href="/epcs">Certified EPCs <ArrowLeft className="rotate-180 w-4 h-4" /></Link>
                                </Button>
                                <Button variant="outline" className="w-full justify-between" asChild>
                                    <Link href="/brands">Browse Brands <ArrowLeft className="rotate-180 w-4 h-4" /></Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
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



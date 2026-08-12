import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mic, Calendar, Youtube, ArrowLeft, Share2 } from "lucide-react";
import Link from "next/link";
import { db } from "@/db";
import { podcasts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Metadata } from "next";
import { PodcastShare } from "@/components/podcast/podcast-share";

export async function generateMetadata({ params }: { params: Promise<{ id: string; locale?: string }> }): Promise<Metadata> {
    const { id, locale = "en" } = await params;
    const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    if (!uuidRegex.test(id)) return {};

    const baseUrl = "https://www.energygurus.online";
    const podcast = await db.query.podcasts.findFirst({
        where: eq(podcasts.id, id)
    });

    if (!podcast) return {};

    const title = `${podcast.title} | EnergyGurus Podcast`;
    const description = podcast.description?.slice(0, 160) || `Listen to this expert energy insight episode: ${podcast.title} on Energy Gurus.`;
    const url = `${baseUrl}/podcast/${id}`;
    const videoId = podcast.youtubeUrl.split("v=")[1]?.split("&")[0] || podcast.youtubeUrl.split("/").pop();
    const imageUrl = videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : `${baseUrl}/new_hero_banner.jpg`;

    return {
        title,
        description,
        alternates: {
            canonical: url
        },
        openGraph: {
            title,
            description,
            type: "video.other",
            url,
            siteName: "EnergyGurus",
            images: [
                {
                    url: imageUrl,
                    width: 1280,
                    height: 720,
                    alt: podcast.title
                }
            ]
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: [imageUrl]
        }
    };
}

export default async function EpisodePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    if (!uuidRegex.test(id)) return notFound();

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
            <Button variant="ghost" className="mb-8 p-0 hover:bg-transparent text-slate-custom hover:text-amber transition-colors" asChild>
                <Link href="/podcast">
                    <ArrowLeft className="mr-2 w-4 h-4" /> Back to Episodes
                </Link>
            </Button>

            <div className="flex flex-col lg:flex-row gap-12">
                {/* Left Column: Metadata & Player */}
                <div className="flex-[2] space-y-8">
                    <div>
                        <span className="text-amber font-bold uppercase tracking-widest text-sm mb-2 block">EnergyGurus Podcast</span>
                        <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-6">{episode.title}</h1>

                        <div className="flex flex-wrap items-center gap-6 text-sm text-slate-custom mb-8">
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
                        <p className="text-lg leading-relaxed text-slate-custom mb-8">
                            {episode.description}
                        </p>
                    </div>
                </div>

                {/* Right Column: Sidebar / CTAs */}
                <div className="flex-1 space-y-8">
                    <Card className="bg-paper/10 border-none">
                        <CardContent className="pt-6">
                            <h4 className="font-bold mb-4">About the Guest</h4>
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-amber/10 text-ink rounded-full flex items-center justify-center">
                                    <Mic className="w-6 h-6 text-amber" />
                                </div>
                                <div>
                                    <p className="font-bold">{episode.guestName}</p>
                                    <p className="text-xs text-slate-custom">{episode.guestDesignation}</p>
                                </div>
                            </div>
                            <p className="text-sm text-slate-custom">
                                Professional insights from one of the industry's leading experts.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-t-4 border-amber">
                        <CardContent className="pt-6">
                            <h4 className="text-xl font-bold mb-4">Take Action</h4>
                            <p className="text-sm text-slate-custom mb-6">
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

import { db } from "@/db";
import { podcasts, liveQA } from "@/db/schema";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Video, Youtube, Trash2, Calendar, Mic } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { deletePodcast, deleteLiveQA } from "@/lib/actions/content";
import { desc } from "drizzle-orm";
import { PodcastForm } from "@/components/forms/podcast-form";
import { LiveQAForm } from "@/components/forms/live-qa-form";

import { redis, CACHE_KEYS } from "@/lib/redis";
import { getUserRole } from "@/lib/roles";

export default async function ContentManagementPage() {
    const role = await getUserRole();

    if (role !== 'super-admin' && role !== 'admin') {
        redirect("/dashboard");
    }

    // Podcast Caching
    let allPodcasts: any[] | null = await redis.get(CACHE_KEYS.PODCASTS_LIST);
    if (!allPodcasts) {
        allPodcasts = await db.select().from(podcasts).orderBy(desc(podcasts.createdAt));
        await redis.set(CACHE_KEYS.PODCASTS_LIST, allPodcasts, { ex: 3600 });
        console.log("🗄️ Podcasts Cache Miss");
    } else {
        console.log("🚀 Podcasts Cache Hit");
    }

    // Live QA Caching
    let allLiveQA: any[] | null = await redis.get(CACHE_KEYS.LIVE_QA_LIST);
    if (!allLiveQA) {
        allLiveQA = await db.select().from(liveQA).orderBy(desc(liveQA.createdAt));
        await redis.set(CACHE_KEYS.LIVE_QA_LIST, allLiveQA, { ex: 3600 });
        console.log("🗄️ Live QA Cache Miss");
    } else {
        console.log("🚀 Live QA Cache Hit");
    }

    return (
        <div className="p-8 space-y-8">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center">
                    <Video className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Content Management</h1>
                    <p className="text-muted-foreground">Manage your YouTube video embeds for Podcasts and Live QA sessions.</p>
                </div>
            </div>

            <Tabs defaultValue="podcasts" className="w-full">
                <TabsList className="grid w-full grid-cols-2 h-14 p-1 bg-secondary/20 rounded-xl mb-8">
                    <TabsTrigger value="podcasts" className="rounded-lg font-bold gap-2">
                        <Mic className="w-4 h-4" /> Podcasts
                    </TabsTrigger>
                    <TabsTrigger value="liveqa" className="rounded-lg font-bold gap-2">
                        <Video className="w-4 h-4" /> Live QA
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="podcasts" className="space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <Card className="lg:col-span-1 border-none shadow-sm rounded-3xl h-fit">
                            <CardHeader>
                                <CardTitle>Add New Podcast</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <PodcastForm />
                            </CardContent>
                        </Card>

                        <div className="lg:col-span-2 space-y-4">
                            <h3 className="text-xl font-bold mb-4">Existing Episodes</h3>
                            {allPodcasts.map((podcast) => (
                                <Card key={podcast.id} className="border-none shadow-sm rounded-2xl overflow-hidden group">
                                    <CardContent className="p-6 flex items-center gap-6">
                                        <div className="w-32 aspect-video bg-black rounded-xl overflow-hidden flex items-center justify-center relative">
                                            {podcast.thumbnailUrl ? (
                                                <img src={podcast.thumbnailUrl} className="w-full h-full object-cover" alt="" />
                                            ) : (
                                                <Youtube className="w-8 h-8 text-red-600" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold mb-1">{podcast.title}</h4>
                                            <p className="text-xs text-muted-foreground line-clamp-1">{podcast.guestName} • {podcast.youtubeUrl}</p>
                                        </div>
                                        <form action={async () => {
                                            "use server";
                                            await deletePodcast(podcast.id);
                                        }}>
                                            <Button variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-xl text-red-500 hover:text-red-600 hover:bg-red-50">
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </form>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="liveqa" className="space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <Card className="lg:col-span-1 border-none shadow-sm rounded-3xl h-fit">
                            <CardHeader>
                                <CardTitle>Schedule Live QA</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <LiveQAForm />
                            </CardContent>
                        </Card>

                        <div className="lg:col-span-2 space-y-4">
                            <h3 className="text-xl font-bold mb-4">Live Archives</h3>
                            {allLiveQA.map((session) => (
                                <Card key={session.id} className="border-none shadow-sm rounded-2xl overflow-hidden group">
                                    <CardContent className="p-6 flex items-center gap-6">
                                        <div className="w-32 aspect-video bg-black rounded-xl overflow-hidden flex items-center justify-center relative">
                                            {session.thumbnailUrl ? (
                                                <img src={session.thumbnailUrl} className="w-full h-full object-cover" alt="" />
                                            ) : (
                                                <Calendar className="w-8 h-8 text-primary" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold mb-1">{session.topic}</h4>
                                            <p className="text-xs text-muted-foreground">{session.expertName} • {session.sessionDate ? new Date(session.sessionDate).toLocaleString() : "TBD"}</p>
                                        </div>
                                        <form action={async () => {
                                            "use server";
                                            await deleteLiveQA(session.id);
                                        }}>
                                            <Button variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-xl text-red-500 hover:text-red-600 hover:bg-red-50">
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </form>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

import { db } from "@/db";
import { podcasts, liveQA } from "@/db/schema";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Video, Youtube, Trash2, Calendar, Mic } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { deletePodcast, deleteLiveQA } from "@/lib/actions/content";
import { desc, asc, like } from "drizzle-orm";
import { getUserRole } from "@/lib/roles";
import { ListSort } from "@/components/shared/list-sort";
import { ListSearch } from "@/components/shared/list-search";
import { PodcastForm } from "@/components/forms/podcast-form";
import { LiveQAForm } from "@/components/forms/live-qa-form";
import { unstable_cache } from "next/cache";

const getPodcastsData = unstable_cache(
    async (sortVal: string, q?: string) => {
        const order = sortVal === "oldest" ? asc(podcasts.createdAt) : desc(podcasts.createdAt);
        const podcastWhere = q ? like(podcasts.title, `%${q}%`) : undefined;
        return await db.select().from(podcasts).where(podcastWhere).orderBy(order);
    },
    ['podcasts-list-cache'],
    { revalidate: 3600, tags: ['podcasts'] }
);

const getLiveQAData = unstable_cache(
    async (sortVal: string, q?: string) => {
        const qaOrder = sortVal === "oldest" ? asc(liveQA.createdAt) : desc(liveQA.createdAt);
        const qaWhere = q ? like(liveQA.topic, `%${q}%`) : undefined;
        return await db.select().from(liveQA).where(qaWhere).orderBy(qaOrder);
    },
    ['live-qa-list-cache'],
    { revalidate: 3600, tags: ['live-qa'] }
);

export default async function ContentManagementPage({
    searchParams,
}: {
    searchParams: Promise<{ sort?: string; q?: string }>;
}) {
    const { sort, q } = await searchParams;
    const sortVal = sort || "latest";
    const role = await getUserRole();

    if (role !== 'super-admin' && role !== 'admin') {
        redirect("/dashboard");
    }

    const allPodcasts = await getPodcastsData(sortVal, q);
    const allLiveQA = await getLiveQAData(sortVal, q);

    return (
        <div className="p-4 md:p-8 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shrink-0">
                    <Video className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Content Management</h1>
                    <p className="text-muted-foreground text-sm md:text-base">Manage your YouTube video embeds for Podcasts and Live QA sessions.</p>
                </div>
            </div>

            <Tabs defaultValue="podcasts" className="w-full">
                <TabsList className="flex flex-wrap w-fit bg-secondary/20 p-1.5 rounded-2xl mb-12 border border-secondary/30">
                    <TabsTrigger 
                        value="podcasts" 
                        className="px-6 md:px-10 py-3 rounded-xl font-bold gap-3 transition-all text-muted-foreground hover:bg-primary/5 hover:text-primary data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20"
                    >
                        <Mic className="w-4 h-4" /> Podcasts
                    </TabsTrigger>
                    <TabsTrigger 
                        value="liveqa" 
                        className="px-6 md:px-10 py-3 rounded-xl font-bold gap-3 transition-all text-muted-foreground hover:bg-primary/5 hover:text-primary data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20"
                    >
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
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                                <h3 className="text-xl font-bold">Existing Episodes</h3>
                                <div className="flex gap-2 w-full sm:w-auto">
                                    <ListSearch placeholder="Search title..." />
                                    <ListSort 
                                        options={[
                                            { label: "Latest", value: "latest" },
                                            { label: "Oldest", value: "oldest" },
                                        ]} 
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {allPodcasts.map((podcast) => (
                                    <Card key={podcast.id} className="border-none shadow-sm rounded-3xl overflow-hidden group hover:shadow-md transition-all">
                                        <CardContent className="p-0">
                                            <div className="aspect-video bg-black flex items-center justify-center relative">
                                                {podcast.thumbnailUrl ? (
                                                    <img src={podcast.thumbnailUrl} className="w-full h-full object-cover" alt="" />
                                                ) : (
                                                    <Youtube className="w-12 h-12 text-red-600" />
                                                )}
                                                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <form action={deletePodcast.bind(null, podcast.id)}>
                                                        <Button variant="destructive" size="sm" className="h-8 w-8 p-0 rounded-lg shadow-lg">
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </form>
                                                </div>
                                            </div>
                                            <div className="p-6">
                                                <h4 className="font-bold text-lg mb-1 line-clamp-1">{podcast.title}</h4>
                                                <p className="text-xs text-muted-foreground font-medium mb-4">{podcast.guestName}</p>
                                                <div className="flex items-center justify-between">
                                                    <p className="text-[10px] text-muted-foreground font-mono truncate max-w-[120px] opacity-60">{podcast.youtubeUrl}</p>
                                                    <Button variant="ghost" size="sm" className="h-8 rounded-lg text-[10px] font-bold" asChild>
                                                        <a href={podcast.youtubeUrl} target="_blank" rel="noopener noreferrer">View</a>
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
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
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                                <h3 className="text-xl font-bold">Live Archives</h3>
                                <div className="flex gap-2 w-full sm:w-auto">
                                    <ListSearch placeholder="Search topic..." />
                                    <ListSort 
                                        options={[
                                            { label: "Latest", value: "latest" },
                                            { label: "Oldest", value: "oldest" },
                                        ]} 
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {allLiveQA.map((session) => (
                                    <Card key={session.id} className="border-none shadow-sm rounded-3xl overflow-hidden group hover:shadow-md transition-all">
                                        <CardContent className="p-0">
                                            <div className="aspect-video bg-black flex items-center justify-center relative">
                                                {session.thumbnailUrl ? (
                                                    <img src={session.thumbnailUrl} className="w-full h-full object-cover" alt="" />
                                                ) : (
                                                    <Calendar className="w-12 h-12 text-primary" />
                                                )}
                                                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <form action={deleteLiveQA.bind(null, session.id)}>
                                                        <Button variant="destructive" size="sm" className="h-8 w-8 p-0 rounded-lg shadow-lg">
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </form>
                                                </div>
                                                <div className="absolute bottom-4 left-4">
                                                    <span className={`text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-widest shadow-lg ${
                                                        session.status === 'live' ? 'bg-red-500 text-white animate-pulse' : 
                                                        session.status === 'upcoming' ? 'bg-blue-500 text-white' : 
                                                        'bg-gray-500 text-white'
                                                    }`}>
                                                        {session.status}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="p-6">
                                                <h4 className="font-bold text-lg mb-1 line-clamp-1">{session.topic}</h4>
                                                <p className="text-xs text-muted-foreground font-medium mb-4">{session.expertName}</p>
                                                <div className="flex items-center justify-between">
                                                    <p className="text-[10px] text-muted-foreground font-medium opacity-60">
                                                        {session.sessionDate ? new Date(session.sessionDate).toLocaleDateString() : "TBD"}
                                                    </p>
                                                    <Button variant="ghost" size="sm" className="h-8 rounded-lg text-[10px] font-bold gap-1.5" asChild>
                                                        <a href={`/dashboard/content/live-qa/${session.id}/questions`}>
                                                            <Mic className="w-3 h-3" /> Questions
                                                        </a>
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

import { db } from "@/db";
import { podcasts, liveQA } from "@/db/schema";
import { redirect } from "next/navigation";
import { desc } from "drizzle-orm";
import { getUserRole } from "@/lib/roles";
import { unstable_cache } from "next/cache";
import { ContentManagementClient } from "@/components/dashboard/content-management-client";

const getPodcastsData = unstable_cache(
    async () => {
        return await db.select().from(podcasts).orderBy(desc(podcasts.createdAt));
    },
    ['podcasts-list-cache-v2'],
    { revalidate: 3600, tags: ['podcasts'] }
);

const getLiveQAData = unstable_cache(
    async () => {
        return await db.select().from(liveQA).orderBy(desc(liveQA.createdAt));
    },
    ['live-qa-list-cache-v2'],
    { revalidate: 3600, tags: ['live-qa'] }
);

export default async function ContentManagementPage() {
    const role = await getUserRole();

    if (role !== 'super-admin' && role !== 'admin') {
        redirect("/dashboard");
    }

    const allPodcasts = await getPodcastsData();
    const allLiveQA = await getLiveQAData();

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto font-sans">
            <ContentManagementClient
                initialPodcasts={allPodcasts as any}
                initialLiveQA={allLiveQA as any}
            />
        </div>
    );
}

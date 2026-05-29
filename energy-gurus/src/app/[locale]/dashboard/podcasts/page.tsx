import { getUserRole } from "@/lib/roles";
import { redirect } from "next/navigation";
import { addPodcast, addLiveQA } from "@/lib/actions/content";
import { db } from "@/db";
import { podcasts, liveQA } from "@/db/schema";
import { ListSort } from "@/components/shared/list-sort";
import { desc, asc } from "drizzle-orm";

export default async function PodcastsPage({
  searchParams,
}: {
  searchParams: Promise<{ podcastSort?: string; qaSort?: string }>;
}) {
  const { podcastSort, qaSort } = await searchParams;
  const role = await getUserRole();
  if (role !== "super-admin" && role !== "admin") {
    redirect("/dashboard");
  }

  const order = podcastSort === "oldest" ? asc(podcasts.createdAt) : desc(podcasts.createdAt);
  const qaOrder = qaSort === "oldest" ? asc(liveQA.createdAt) : desc(liveQA.createdAt);

  const existingPodcasts = await db.query.podcasts.findMany({
    orderBy: [order],
    limit: 10,
  });

  const existingQA = await db.query.liveQA.findMany({
    orderBy: [qaOrder],
    limit: 10,
  });

  return (
    <div className="p-8 space-y-12">
      <div>
        <h1 className="text-2xl font-bold mb-6">Podcast Management</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-card border rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Add New Podcast</h2>
            <form action={async (formData) => { "use server"; await addPodcast(formData); }} className="space-y-4">
              <input name="title" placeholder="Episode Title" className="w-full border rounded p-2" required />
              <textarea name="description" placeholder="Description" className="w-full border rounded p-2" />
              <input name="youtubeUrl" placeholder="YouTube URL" className="w-full border rounded p-2" required />
              <div className="grid grid-cols-2 gap-4">
                <input name="guestName" placeholder="Guest Name" className="w-full border rounded p-2" />
                <input name="guestDesignation" placeholder="Designation" className="w-full border rounded p-2" />
              </div>
              <button className="bg-primary text-primary-foreground w-full py-2 rounded font-medium hover:opacity-90">
                Save Podcast
              </button>
            </form>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Recent Podcasts</h2>
              <ListSort
                paramName="podcastSort"
                defaultValue="latest"
                options={[
                  { label: "Latest", value: "latest" },
                  { label: "Oldest", value: "oldest" },
                ]}
              />
            </div>
            {existingPodcasts.map((p) => (
              <div key={p.id} className="border p-3 rounded-lg flex justify-between items-center bg-white shadow-sm">
                <div>
                  <p className="font-medium text-sm">{p.title}</p>
                  <p className="text-xs text-muted-foreground">{p.guestName}</p>
                </div>
                <a href={p.youtubeUrl} target="_blank" className="text-primary text-xs font-bold hover:underline">View</a>
              </div>
            ))}
          </div>
        </div>
      </div>

      <hr className="opacity-10" />

      <div>
        <h1 className="text-2xl font-bold mb-6">Live QA Management</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-card border rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Add New QA Session</h2>
            <form action={async (formData) => { "use server"; await addLiveQA(formData); }} className="space-y-4">
              <input name="topic" placeholder="Session Topic" className="w-full border rounded p-2" required />
              <input name="youtubeUrl" placeholder="YouTube URL" className="w-full border rounded p-2" required />
              <input name="expertName" placeholder="Expert Name" className="w-full border rounded p-2" />
              <button className="bg-primary text-primary-foreground w-full py-2 rounded font-medium hover:opacity-90 transition-opacity">
                Save QA Session
              </button>
            </form>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Recent QA Sessions</h2>
              <ListSort
                paramName="qaSort"
                defaultValue="latest"
                options={[
                  { label: "Latest", value: "latest" },
                  { label: "Oldest", value: "oldest" },
                ]}
              />
            </div>
            {existingQA.map((q) => (
              <div key={q.id} className="border p-3 rounded-lg flex justify-between items-center bg-white shadow-sm">
                <div>
                  <p className="font-medium text-sm">{q.topic}</p>
                  <p className="text-xs text-muted-foreground">{q.expertName}</p>
                </div>
                <a href={q.youtubeUrl} target="_blank" className="text-primary text-xs font-bold hover:underline">View</a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

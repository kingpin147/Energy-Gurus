import { Headphones, Youtube, ArrowRight } from "lucide-react";
import Image from "next/image";
import { db } from "@/db";
import { podcasts } from "@/db/schema";
import { desc, asc } from "drizzle-orm";
import { ListSort } from "@/components/shared/list-sort";
import { unstable_cache } from "next/cache";
import { AdBanner } from "@/components/shared/AdBanner";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ }> }): Promise<Metadata> {
  const baseUrl = "https://www.energygurus.online";
  const title = "Top Gurus of Solar in Pakistan Podcast | Best Ideas on Solar";
  const description = "Get the best ideas on solar directly from the top gurus of solar in Pakistan. Listen to our podcast for expert insights, industry trends, and technical discussions.";

  return {
    title,
    description,
    keywords: [
      "top gurus of solar from Pakistan",
      "best ideas on solar",
      "solar podcast Pakistan",
      "solar energy experts Pakistan",
      "solar industry insights",
    ],
    alternates: {
      canonical: `${baseUrl}/podcast`,
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/podcast`,
      siteName: "EnergyGurus",
      locale: "en_US",
      type: "website",
      images: [{ url: `${baseUrl}/new_hero_banner.jpg`, width: 1200, height: 630, alt: "Top Gurus of Solar Podcast Pakistan" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${baseUrl}/new_hero_banner.jpg`],
    },
  };
}

const getPodcasts = unstable_cache(
  async (sortOrder: "asc" | "desc") => {
    const order = sortOrder === "asc" ? asc(podcasts.createdAt) : desc(podcasts.createdAt);
    return await db.select().from(podcasts).orderBy(order);
  },
  ["podcasts-list-v2"],
  { revalidate: 3600, tags: ["podcasts"] }
);

function getYouTubeId(url: string) {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&]{11})/);
  return match ? match[1] : url.split("v=")[1]?.split("&")[0] || url.split("/").pop() || "";
}

function getThumbnail(episode: any) {
  if (episode.thumbnailUrl) return episode.thumbnailUrl;
  const videoId = getYouTubeId(episode.youtubeUrl);
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
}

const CATEGORIES = [
  "All",
  "Residential",
  "Commercial",
  "Industrial",
  "Agriculture",
  "Policy",
  "Technology",
  "Industry Updates",
  "Products Review",
];

export default async function PodcastListingPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string }>;
}) {
  const { sort } = await searchParams;
  const sortOrder = sort === "oldest" ? "asc" : "desc";
  const episodes = await getPodcasts(sortOrder);

  return (
    <div className="font-sans text-graphite bg-paper leading-relaxed selection:bg-amber/20 overflow-x-hidden min-h-screen">
      <AdBanner placement="skyscraper_left" targetPage="podcast" />
      <AdBanner placement="skyscraper_right" targetPage="podcast" />

      {/* Header */}
      <header className="bg-ink text-white pt-[64px]">
        <div className="max-w-[1180px] mx-auto px-5 md:px-8">
          <p className="font-ibm-plex-mono text-[0.76rem] tracking-[0.14em] uppercase text-amber flex items-center gap-2.5 mb-[18px]">
            <span className="w-5 h-[1px] bg-amber" />
            The Podcast
          </p>
          <h1 className="font-space-grotesk font-semibold text-[clamp(2rem,4vw,2.8rem)] tracking-[-0.01em]">
            Straight talk on solar.
          </h1>
          <p className="text-paper/70 max-w-[560px] mt-[14px] text-[1.02rem] pb-[40px]">
            New episodes breaking down the facts and figures behind solar energy — no jargon, no sales pressure. Watch on YouTube or listen wherever you get podcasts.
          </p>
        </div>

        {/* Subscribe Bar */}
        <div className="bg-[#0e1b30] border-t border-white/10">
          <div className="max-w-[1180px] mx-auto px-5 md:px-8 py-[18px] flex flex-wrap gap-[14px]">
            <a
              href="https://www.youtube.com/energygurus.online"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-[18px] py-2.5 rounded-[3px] text-[0.85rem] bg-amber/15 text-amber border border-amber transition-colors hover:bg-amber/25 font-semibold"
            >
              <Youtube className="w-4 h-4" /> Subscribe on YouTube
            </a>
            <a
              href="#"
              className="flex items-center gap-2 px-[18px] py-2.5 rounded-[3px] text-[0.85rem] bg-white/5 text-white border border-white/15 transition-colors hover:border-amber font-semibold"
            >
              <Headphones className="w-4 h-4 text-amber" /> Apple Podcasts
            </a>
            <a
              href="#"
              className="flex items-center gap-2 px-[18px] py-2.5 rounded-[3px] text-[0.85rem] bg-white/5 text-white border border-white/15 transition-colors hover:border-amber font-semibold"
            >
              <Headphones className="w-4 h-4 text-amber" /> Spotify
            </a>
          </div>
        </div>
      </header>

      {/* Leaderboard Top Ad */}
      <div className="max-w-[1180px] mx-auto px-5 md:px-8 mt-7">
        <AdBanner placement="leaderboard_top" targetPage="podcast" />
      </div>

      {/* Featured Section */}
      {episodes.length > 0 && (() => {
        const featured = episodes[0];
        const videoId = getYouTubeId(featured.youtubeUrl);
        return (
          <section className="py-[64px]">
            <div className="max-w-[1180px] mx-auto px-5 md:px-8 grid grid-cols-1 md:grid-cols-[1.3fr_0.9fr] gap-10 items-start">
              <div>
                <div className="relative w-full pt-[56.25%] rounded-[6px] overflow-hidden border border-line bg-ink shadow-md">
                  <iframe
                    src={`https://www.youtube.com/embed/${videoId}`}
                    title={featured.title}
                    allowFullScreen
                    className="absolute inset-0 w-full h-full border-0"
                  />
                </div>
              </div>

              <div>
                <span className="font-ibm-plex-mono text-[0.7rem] tracking-[0.06em] uppercase text-teal bg-[rgba(47,110,98,0.1)] px-2.5 py-1 rounded-[20px] inline-block mb-3.5">
                  Latest Episode
                </span>
                <h2 className="font-space-grotesk font-semibold text-[1.5rem] text-ink mb-3 tracking-[-0.01em]">
                  {featured.title}
                </h2>
                <p className="text-slate-custom text-[0.98rem] mb-[22px] leading-relaxed">
                  {featured.description}
                </p>

                <div className="bg-white border border-line rounded-[4px] p-5">
                  <div className="font-ibm-plex-mono text-[0.72rem] tracking-[0.06em] uppercase text-slate-custom mb-3">
                    Key Details From This Episode
                  </div>
                  <ul className="list-none space-y-0">
                    {featured.guestName && (
                      <li className="flex justify-between items-center py-2 border-t border-line text-[0.9rem] first:border-t-0">
                        <span className="font-ibm-plex-mono text-slate-custom">Guest</span>
                        <span className="font-semibold text-ink">{featured.guestName}</span>
                      </li>
                    )}
                    {featured.guestDesignation && (
                      <li className="flex justify-between items-center py-2 border-t border-line text-[0.9rem]">
                        <span className="font-ibm-plex-mono text-slate-custom">Designation</span>
                        <span className="font-semibold text-ink">{featured.guestDesignation}</span>
                      </li>
                    )}
                    <li className="flex justify-between items-center py-2 border-t border-line text-[0.9rem]">
                      <span className="font-ibm-plex-mono text-slate-custom">Release Date</span>
                      <span className="font-ibm-plex-mono text-amber font-semibold">
                        {new Date(featured.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>
        );
      })()}

      {/* Episodes Grid & Filters */}
      <section className="py-[64px] pt-0">
        <div className="max-w-[1180px] mx-auto px-5 md:px-8">
          {/* Category Chips & Sort */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-9">
            <div className="flex gap-2.5 flex-wrap">
              {CATEGORIES.map((cat, idx) => (
                <span
                  key={cat}
                  className={`font-ibm-plex-mono text-[0.78rem] px-4 py-2 rounded-[20px] border transition-colors cursor-pointer ${
                    idx === 0
                      ? "bg-ink text-white border-ink"
                      : "bg-white text-slate-custom border-line hover:border-ink hover:text-ink"
                  }`}
                >
                  {cat}
                </span>
              ))}
            </div>

            <div className="border border-line rounded-[3px] bg-white text-graphite flex items-center px-2 py-1 shrink-0">
              <ListSort
                options={[
                  { label: "Latest First", value: "latest" },
                  { label: "Oldest First", value: "oldest" },
                ]}
              />
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {episodes.slice(1).map((episode) => (
              <a
                key={episode.id}
                href={episode.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white border border-line rounded-[4px] overflow-hidden flex flex-col hover:border-teal transition-colors group"
              >
                <div className="aspect-[16/9] relative bg-ink flex items-center justify-center overflow-hidden">
                  <Image
                    src={getThumbnail(episode)}
                    alt={episode.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover opacity-75 group-hover:opacity-90 transition-opacity"
                  />
                  <div className="w-[44px] h-[44px] rounded-full bg-amber text-ink flex items-center justify-center font-bold text-[0.95rem] z-10 pl-0.5 shadow-lg group-hover:scale-110 transition-transform">
                    ▶
                  </div>
                  <span className="absolute bottom-2 right-2 bg-ink/85 text-white font-ibm-plex-mono text-[0.7rem] px-2 py-0.5 rounded-[3px] z-10">
                    {new Date(episode.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                </div>

                <div className="p-[18px_20px] flex flex-col flex-grow">
                  <span className="font-ibm-plex-mono text-[0.66rem] tracking-[0.05em] uppercase text-teal mb-2">
                    Technology
                  </span>
                  <h3 className="font-space-grotesk text-[1.02rem] font-semibold text-ink mb-2 tracking-[-0.01em]">
                    {episode.title}
                  </h3>
                  <p className="text-slate-custom text-[0.88rem] flex-grow line-clamp-2">
                    {episode.description || "In-depth conversation on solar energy and technical specifications."}
                  </p>
                  <span className="mt-4 text-[0.84rem] font-semibold text-ink group-hover:text-teal transition-colors flex items-center gap-1.5">
                    Watch Episode <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </a>
            ))}
          </div>

          {episodes.length <= 1 && (
            <div className="py-16 text-center bg-white border border-line rounded-[4px] mt-6">
              <h3 className="font-space-grotesk font-semibold text-lg text-ink">More Episodes Coming Soon</h3>
              <p className="text-slate-custom text-sm mt-1">Check back for new expert interviews and solar market discussions.</p>
            </div>
          )}

          {/* In-list ad banner */}
          {episodes.length >= 4 && (
            <div className="mt-12 w-full flex justify-center">
              <AdBanner placement="in_list" targetPage="podcast" />
            </div>
          )}
        </div>
      </section>

      <AdBanner placement="leaderboard_bottom" targetPage="podcast" />
    </div>
  );
}

import { db } from "@/db";
import { news } from "@/db/schema";
import { eq, desc, and, or, isNotNull, lte } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import Link from "next/link";
import { AdBanner } from "@/components/shared/AdBanner";
import { format } from "date-fns";
import { Newspaper } from "lucide-react";
import { NewsFilters } from "@/components/news/news-filters";

const DEFAULT_CATEGORIES = [
    "Industry News",
    "Policy & Incentives",
    "Product Launches",
    "Project Sign Off",
];

const getNews = unstable_cache(
    async (category?: string) => {
        const now = new Date();
        // Post is visible if manually published OR if scheduled publish date/time has arrived
        let conditions = [
            or(
                eq(news.isPublished, true),
                and(isNotNull(news.publishedAt), lte(news.publishedAt, now))
            )
        ];
        
        if (category && category !== "All") {
            conditions.push(eq(news.category, category));
        }

        const articles = await db.select().from(news)
            .where(and(...conditions))
            .orderBy(desc(news.publishedAt));

        // Fetch distinct categories from database to dynamically display custom categories
        const distinctCats = await db.selectDistinct({ category: news.category }).from(news);
        const dbCategories = distinctCats.map(c => c.category).filter(Boolean);

        const categorySet = new Set(["All", ...DEFAULT_CATEGORIES, ...dbCategories]);
        const categoriesList = Array.from(categorySet);

        return { articles, categoriesList };
    },
    ['news-list-v3'],
    { revalidate: 60, tags: ['news'] }
);

export default async function NewsPage({
    searchParams
}: {
    searchParams: Promise<{ category?: string }>;
}) {
    const { category = "All" } = await searchParams;
    const { articles, categoriesList } = await getNews(category);
    
    // Featured is the first article if category is "All", otherwise no specific featured unless we want to
    const featured = category === "All" && articles.length > 0 ? articles[0] : null;
    const gridArticles = category === "All" ? articles.slice(1) : articles;

    return (
        <div className="font-sans text-graphite bg-paper leading-relaxed selection:bg-amber/20 min-h-screen">
            <AdBanner placement="skyscraper_left" targetPage="news" />
            <AdBanner placement="skyscraper_right" targetPage="news" />
            
            {/* Header */}
            <header className="bg-ink text-white pt-[64px] pb-[44px]">
                <div className="max-w-[1180px] mx-auto px-5 md:px-8">
                    <p className="font-ibm-plex-mono text-[0.76rem] tracking-[0.14em] uppercase text-amber flex items-center gap-2.5 mb-[18px]">
                        <span className="w-5 h-[1px] bg-amber"></span>
                        Industry Insights
                    </p>
                    <h1 className="font-space-grotesk font-semibold text-[clamp(2rem,4vw,2.8rem)] tracking-[-0.01em]">
                        News & Updates
                    </h1>
                    <p className="text-paper/70 max-w-[560px] mt-[14px] text-[1.02rem]">
                        Stay up to date with the latest from Pakistan's solar industry, policy changes, and technological breakthroughs.
                    </p>
                </div>
            </header>

            <div className="max-w-[1180px] mx-auto px-5 md:px-8 py-7">
                <AdBanner placement="leaderboard_top" targetPage="news" />
            </div>

            <section className="py-[10px] pb-[96px]">
                <div className="max-w-[1180px] mx-auto px-5 md:px-8">
                    
                    {/* Dynamic Filters */}
                    <NewsFilters currentCategory={category} categories={categoriesList} />

                    {/* Featured Article */}
                    {featured && (
                        <div className="grid grid-cols-1 md:grid-cols-[1.1fr_0.9fr] gap-10 items-center mb-14">
                            <Link href={`/news/${featured.id}`} className="rounded-[8px] overflow-hidden border border-line block relative group shadow-sm bg-slate-50">
                                {featured.imageUrl ? (
                                    <img src={featured.imageUrl} alt={featured.title} className="w-full h-auto block group-hover:scale-[1.02] transition-transform duration-300" />
                                ) : (
                                    <div className="aspect-[2/1] bg-gradient-to-br from-ink to-[#1b3157] flex items-center justify-center py-12">
                                        <div className="w-11 h-11 border-2 border-amber rounded-[3px] opacity-70 flex items-center justify-center">
                                            <Newspaper className="w-6 h-6 text-amber" />
                                        </div>
                                    </div>
                                )}
                            </Link>
                            <div>
                                <Link href={`/news?category=${encodeURIComponent(featured.category)}`} className="font-ibm-plex-mono text-[0.7rem] tracking-[0.06em] uppercase text-teal bg-[rgba(47,110,98,0.1)] px-[11px] py-[5px] rounded-[20px] inline-block mb-3.5 hover:bg-teal hover:text-white transition-colors">
                                    {featured.category}
                                </Link>
                                <Link href={`/news/${featured.id}`} className="block group">
                                    <h2 className="font-space-grotesk font-semibold text-[1.6rem] text-ink mb-3 group-hover:text-teal transition-colors">
                                        {featured.title}
                                    </h2>
                                    <p className="text-slate-custom text-[0.98rem] mb-4 line-clamp-3">
                                        {featured.content}
                                    </p>
                                    <div className="font-ibm-plex-mono text-[0.78rem] text-slate-custom mb-[18px]">
                                        {featured.publishedAt ? format(featured.publishedAt, "MMM d, yyyy") : ""}
                                    </div>
                                    <span className="text-[0.88rem] font-semibold text-ink group-hover:text-amber transition-colors flex items-center gap-1">
                                        Read Full Article <span className="text-amber">→</span>
                                    </span>
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                        {gridArticles.map((article) => (
                            <div key={article.id} className="bg-white border border-line rounded-[8px] overflow-hidden flex flex-col hover:border-teal hover:shadow-sm transition-all group">
                                <Link href={`/news/${article.id}`} className="w-full bg-slate-50 block overflow-hidden border-b border-line">
                                    {article.imageUrl ? (
                                        <img src={article.imageUrl} alt={article.title} className="w-full h-auto block group-hover:scale-[1.03] transition-transform duration-300" />
                                    ) : (
                                        <div className="aspect-[2/1] bg-gradient-to-br from-ink to-[#1b3157] flex items-center justify-center py-8">
                                            <div className="w-[30px] h-[30px] border-2 border-amber rounded-[3px] opacity-60 flex items-center justify-center">
                                                <Newspaper className="w-4 h-4 text-amber" />
                                            </div>
                                        </div>
                                    )}
                                </Link>
                                <div className="p-[18px_20px] flex flex-col flex-grow">
                                    <Link href={`/news?category=${encodeURIComponent(article.category)}`} className="font-ibm-plex-mono text-[0.7rem] tracking-[0.06em] uppercase text-teal bg-[rgba(47,110,98,0.1)] px-[11px] py-[5px] rounded-[20px] self-start mb-2.5 hover:bg-teal hover:text-white transition-colors">
                                        {article.category}
                                    </Link>
                                    <Link href={`/news/${article.id}`} className="flex flex-col flex-grow">
                                        <h3 className="font-space-grotesk font-semibold text-[1.02rem] text-ink mb-2 group-hover:text-teal transition-colors line-clamp-2">
                                            {article.title}
                                        </h3>
                                        <p className="text-slate-custom text-[0.88rem] flex-grow line-clamp-2">
                                            {article.content}
                                        </p>
                                        <div className="font-ibm-plex-mono text-[0.76rem] text-slate-custom mt-3.5">
                                            {article.publishedAt ? format(article.publishedAt, "MMM d, yyyy") : ""}
                                        </div>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>

                    {articles.length === 0 && (
                        <div className="py-20 text-center bg-white border border-line rounded-[4px]">
                            <h3 className="font-space-grotesk font-semibold text-xl text-ink mb-2">No News Found</h3>
                            <p className="text-slate-custom text-[0.95rem]">
                                Check back later for more updates.
                            </p>
                        </div>
                    )}
                    
                    {/* Newsletter Box */}
                    <div className="bg-white border border-line rounded-[4px] p-10 flex flex-col md:flex-row justify-between items-center gap-8 mt-14">
                        <div>
                            <h2 className="font-space-grotesk font-semibold text-[1.3rem] text-ink mb-1.5">Stay informed.</h2>
                            <p className="text-slate-custom text-[0.92rem]">Get weekly solar insights and policy updates directly in your inbox.</p>
                        </div>
                        <form className="flex w-full md:w-auto gap-2.5">
                            <input 
                                type="email" 
                                placeholder="Enter your email" 
                                className="p-[13px_16px] border border-line rounded-[3px] font-sans text-[0.9rem] flex-grow md:min-w-[220px]" 
                                required
                            />
                            <button type="button" className="bg-amber text-ink p-[13px_22px] rounded-[3px] font-semibold text-[0.9rem] hover:bg-[#f2b458] transition-colors whitespace-nowrap">
                                Subscribe
                            </button>
                        </form>
                    </div>

                </div>
            </section>

            <AdBanner placement="leaderboard_bottom" targetPage="news" />
        </div>
    );
}

import { db } from "@/db";
import { news } from "@/db/schema";
import { eq, desc, and, or, isNull, lte, sql } from "drizzle-orm";
import Link from "next/link";
import { AdBanner } from "@/components/shared/AdBanner";
import { format } from "date-fns";
import { Newspaper } from "lucide-react";
import { NewsFilters } from "@/components/news/news-filters";
import { cleanArticleExcerpt } from "@/lib/utils/news";
import type { Metadata } from "next";

function formatDateSafe(dateVal: Date | string | null | undefined): string {
    if (!dateVal) return "";
    try {
        const d = new Date(dateVal);
        return isNaN(d.getTime()) ? "" : format(d, "MMM d, yyyy");
    } catch {
        return "";
    }
}

export async function generateMetadata({ searchParams }: { searchParams?: Promise<{ category?: string }> }): Promise<Metadata> {
    try {
        const resolvedParams = searchParams ? await searchParams : {};
        const category = resolvedParams?.category;
        const cleanCategory = (category || "All").trim();
        const isFiltered = cleanCategory.toLowerCase() !== "all";
        const baseUrl = "https://www.energygurus.online";
        
        const title = isFiltered 
            ? `${cleanCategory} - Solar News & Updates | EnergyGurus`
            : "Solar News & Industry Updates in Pakistan | EnergyGurus";
            
        const description = isFiltered
            ? `Stay updated with the latest ${cleanCategory} in Pakistan's solar sector, policy reforms, and market developments.`
            : "Stay up to date with the latest from Pakistan's solar industry, net metering policies, technology breakthroughs, and project updates.";

        const url = isFiltered ? `${baseUrl}/news?category=${encodeURIComponent(cleanCategory)}` : `${baseUrl}/news`;

        return {
            title,
            description,
            keywords: [
                "best solar panels in Pakistan",
                "solar inverter price in Pakistan",
                "Pakistan solar news",
                "net metering policy Pakistan",
                "solar industry updates Pakistan",
                "solar technology breakthroughs",
                "EnergyGurus news",
            ],
            alternates: {
                canonical: url,
            },
            openGraph: {
                title,
                description,
                url,
                siteName: "EnergyGurus",
                locale: "en_US",
                type: "website",
                images: [{ url: `${baseUrl}/new_hero_banner.jpg`, width: 1200, height: 630, alt: "EnergyGurus Solar News & Updates" }],
            },
            twitter: {
                card: "summary_large_image",
                title,
                description,
                images: [`${baseUrl}/new_hero_banner.jpg`],
            },
        };
    } catch {
        return {
            title: "Solar News & Industry Updates in Pakistan | EnergyGurus",
            description: "Stay up to date with the latest from Pakistan's solar industry, policy changes, and technological breakthroughs.",
        };
    }
}

const DEFAULT_CATEGORIES = [
    "Industry News",
    "Policy & Incentives",
    "Product Launches",
    "Project Sign Off",
    "Battery Energy Storage System",
    "Technology & Innovation",
    "Guidelines",
];

async function getNews(category: string = "All") {
    try {
        const cleanCategory = (category || "All").trim();
        const isAll = cleanCategory.toLowerCase() === "all";
        const now = new Date();

        let conditions = [
            eq(news.isPublished, true),
            or(
                isNull(news.publishedAt),
                lte(news.publishedAt, now)
            )
        ];
        
        if (!isAll) {
            conditions.push(
                sql`LOWER(TRIM(${news.category})) = LOWER(${cleanCategory})`
            );
        }

        const articles = await db.select().from(news)
            .where(and(...conditions))
            .orderBy(desc(news.publishedAt));

        // Fetch distinct categories from database to dynamically display all categories
        const distinctCats = await db.selectDistinct({ category: news.category }).from(news);
        const dbCategories = distinctCats
            .map(c => c.category?.trim())
            .filter(Boolean) as string[];

        const categorySet = new Set(["All", ...DEFAULT_CATEGORIES, ...dbCategories]);
        const categoriesList = Array.from(categorySet);

        return { articles, categoriesList };
    } catch (error) {
        console.error("Failed to load news articles from database:", error);
        return { articles: [], categoriesList: ["All", ...DEFAULT_CATEGORIES] };
    }
}

export default async function NewsPage({
    searchParams
}: {
    searchParams?: Promise<{ category?: string }>;
}) {
    const resolvedParams = searchParams ? await searchParams : {};
    const category = resolvedParams?.category || "All";
    const cleanCategory = category.trim();
    const isAll = cleanCategory.toLowerCase() === "all";

    const { articles, categoriesList } = await getNews(cleanCategory);
    
    // Featured is the first article if viewing "All", otherwise show all matching articles in the grid
    const featured = isAll && articles.length > 0 ? articles[0] : null;
    const gridArticles = isAll ? articles.slice(1) : articles;

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
                    <NewsFilters currentCategory={cleanCategory} categories={categoriesList} />

                    {/* Featured Article (Hero for "All" tab) */}
                    {featured && (
                        <div className="grid grid-cols-1 md:grid-cols-[1.1fr_0.9fr] gap-10 items-center mb-14">
                            <Link href={`/news/${featured.slug || featured.id}`} className="rounded-[8px] overflow-hidden border border-line block relative group shadow-sm bg-slate-950 aspect-[16/9] flex items-center justify-center">
                                {featured.imageUrl ? (
                                    <>
                                        {/* Ambient blurred backdrop for portrait / non-standard aspect ratio images */}
                                        <img 
                                            src={featured.imageUrl} 
                                            alt="" 
                                            aria-hidden="true" 
                                            className="absolute inset-0 w-full h-full object-cover blur-xl opacity-40 scale-110 pointer-events-none" 
                                        />
                                        {/* Crisp contained foreground image */}
                                        <img 
                                            src={featured.imageUrl} 
                                            alt={featured.title} 
                                            className="relative z-10 w-full h-full object-contain p-1 group-hover:scale-[1.02] transition-transform duration-300" 
                                        />
                                    </>
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-ink to-[#1b3157] flex items-center justify-center py-12">
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
                                <Link href={`/news/${featured.slug || featured.id}`} className="block group">
                                    <h2 className="font-space-grotesk font-semibold text-[1.6rem] text-ink mb-3 group-hover:text-teal transition-colors">
                                        {featured.title}
                                    </h2>
                                    <p className="text-slate-custom text-[0.98rem] mb-4 line-clamp-3">
                                        {cleanArticleExcerpt(featured.content, 180)}
                                    </p>
                                    <div className="font-ibm-plex-mono text-[0.78rem] text-slate-custom mb-[18px]">
                                        {formatDateSafe(featured.publishedAt)}
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
                                <Link href={`/news/${article.slug || article.id}`} className="w-full bg-slate-950 block overflow-hidden border-b border-line aspect-[16/9] relative flex items-center justify-center">
                                    {article.imageUrl ? (
                                        <>
                                            {/* Ambient blurred backdrop */}
                                            <img 
                                                src={article.imageUrl} 
                                                alt="" 
                                                aria-hidden="true" 
                                                className="absolute inset-0 w-full h-full object-cover blur-lg opacity-40 scale-110 pointer-events-none" 
                                            />
                                            {/* Crisp contained foreground */}
                                            <img 
                                                src={article.imageUrl} 
                                                alt={article.title} 
                                                className="relative z-10 w-full h-full object-contain p-1 group-hover:scale-[1.03] transition-transform duration-300" 
                                            />
                                        </>
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-ink to-[#1b3157] flex items-center justify-center py-8">
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
                                    <Link href={`/news/${article.slug || article.id}`} className="flex flex-col flex-grow">
                                        <h3 className="font-space-grotesk font-semibold text-[1.02rem] text-ink mb-2 group-hover:text-teal transition-colors line-clamp-2">
                                            {article.title}
                                        </h3>
                                        <p className="text-slate-custom text-[0.88rem] flex-grow line-clamp-2">
                                            {cleanArticleExcerpt(article.content, 140)}
                                        </p>
                                        <div className="font-ibm-plex-mono text-[0.76rem] text-slate-custom mt-3.5">
                                            {formatDateSafe(article.publishedAt)}
                                        </div>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>

                    {articles.length === 0 && (
                        <div className="py-20 text-center bg-white border border-line rounded-2xl max-w-xl mx-auto p-8 shadow-sm">
                            <div className="w-12 h-12 bg-amber/10 text-amber rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Newspaper className="w-6 h-6" />
                            </div>
                            <h3 className="font-space-grotesk font-semibold text-xl text-ink mb-2">No Articles Found</h3>
                            <p className="text-slate-custom text-sm mb-6 leading-relaxed">
                                {isAll 
                                    ? "Check back later for newly published news and articles."
                                    : `No published articles are currently filed under "${cleanCategory}". Try selecting another category.`}
                            </p>
                            {!isAll && (
                                <Link
                                    href="/news"
                                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-ink text-white font-semibold text-xs hover:bg-ink/90 transition-colors"
                                >
                                    Browse All Categories →
                                </Link>
                            )}
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

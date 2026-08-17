import { db } from "@/db";
import { news, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { AdBanner } from "@/components/shared/AdBanner";
import { format } from "date-fns";
import { ArrowLeft, Newspaper, Share2 } from "lucide-react";
import { unstable_cache } from "next/cache";

const getNewsArticle = unstable_cache(
    async (id: string) => {
        const result = await db
            .select({
                id: news.id,
                title: news.title,
                content: news.content,
                category: news.category,
                imageUrl: news.imageUrl,
                isPublished: news.isPublished,
                publishedAt: news.publishedAt,
                authorName: users.name,
            })
            .from(news)
            .leftJoin(users, eq(news.authorId, users.id))
            .where(eq(news.id, id))
            .limit(1);
        
        return result[0];
    },
    ['news-article-detail-v2'],
    { revalidate: 60, tags: ['news'] }
);

export default async function NewsDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const article = await getNewsArticle(id);

    const isLive = article && (article.isPublished || (article.publishedAt && new Date(article.publishedAt) <= new Date()));

    if (!article || !isLive) {
        notFound();
    }

    return (
        <div className="font-sans text-graphite bg-paper leading-relaxed selection:bg-amber/20 min-h-screen">
            <AdBanner placement="skyscraper_left" targetPage="news" />
            <AdBanner placement="skyscraper_right" targetPage="news" />

            {/* Top Navigation */}
            <div className="bg-white border-b border-line sticky top-[72px] z-40">
                <div className="max-w-[800px] mx-auto px-5 md:px-8 py-4 flex items-center justify-between">
                    <Link href="/news" className="flex items-center gap-2 text-sm font-semibold text-slate-custom hover:text-ink transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Back to News
                    </Link>
                    <button className="flex items-center gap-2 text-sm font-semibold text-slate-custom hover:text-ink transition-colors">
                        <Share2 className="w-4 h-4" /> Share
                    </button>
                </div>
            </div>

            <article className="py-12 pb-24">
                <div className="max-w-[800px] mx-auto px-5 md:px-8">
                    {/* Header */}
                    <header className="mb-10">
                        <Link href={`/news?category=${encodeURIComponent(article.category)}`} className="font-ibm-plex-mono text-[0.76rem] tracking-[0.06em] uppercase text-teal bg-[rgba(47,110,98,0.1)] px-[12px] py-[6px] rounded-[20px] inline-block mb-6 hover:bg-teal hover:text-white transition-colors">
                            {article.category}
                        </Link>
                        <h1 className="font-space-grotesk font-bold text-[clamp(2.2rem,4vw,3.2rem)] tracking-[-0.01em] text-ink leading-[1.1] mb-6">
                            {article.title}
                        </h1>
                        <div className="flex items-center gap-4 border-t border-b border-line py-4 text-sm text-slate-custom font-ibm-plex-mono">
                            <div className="font-semibold text-ink">By {article.authorName || "Energy Gurus"}</div>
                            <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                            <div>{article.publishedAt ? format(article.publishedAt, "MMMM d, yyyy 'at' h:mm a") : ""}</div>
                        </div>
                    </header>

                    {/* Featured Image */}
                    {article.imageUrl ? (
                        <div className="aspect-[16/9] md:aspect-[21/9] rounded-[6px] overflow-hidden mb-12 bg-slate-100">
                            <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover" />
                        </div>
                    ) : (
                        <div className="aspect-[21/9] rounded-[6px] bg-gradient-to-br from-ink to-[#1b3157] flex items-center justify-center mb-12">
                            <div className="w-[60px] h-[60px] border-2 border-amber rounded-[4px] opacity-40 flex items-center justify-center">
                                <Newspaper className="w-8 h-8 text-amber" />
                            </div>
                        </div>
                    )}

                    {/* Content */}
                    <div className="prose prose-lg prose-slate max-w-none text-graphite/90 marker:text-amber prose-a:text-teal hover:prose-a:text-teal/80 prose-headings:font-space-grotesk prose-headings:text-ink prose-img:rounded-[6px] whitespace-pre-wrap">
                        {article.content}
                    </div>
                </div>
            </article>

            {/* Ad Banner Bottom */}
            <div className="max-w-[800px] mx-auto px-5 md:px-8 pb-20">
                <AdBanner placement="in_content" targetPage="news" />
            </div>
            
            <AdBanner placement="leaderboard_bottom" targetPage="news" />
        </div>
    );
}

import { db } from "@/db";
import { news, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { AdBanner } from "@/components/shared/AdBanner";
import { format } from "date-fns";
import { ArrowLeft, Newspaper, Mail, Linkedin, Building, Briefcase } from "lucide-react";
import { unstable_cache } from "next/cache";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ShareButtons } from "@/components/news/share-buttons";
import { FormattedMarkdown } from "@/components/news/formatted-markdown";

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
                authorName: news.authorName,
                authorPictureUrl: news.authorPictureUrl,
                authorDesignation: news.authorDesignation,
                authorOrganization: news.authorOrganization,
                authorLinkedIn: news.authorLinkedIn,
                authorEmail: news.authorEmail,
                userName: users.name,
            })
            .from(news)
            .leftJoin(users, eq(news.authorId, users.id))
            .where(eq(news.id, id))
            .limit(1);
        
        return result[0];
    },
    ['news-article-detail-v4'],
    { revalidate: 60, tags: ['news'] }
);

export default async function NewsDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const article = await getNewsArticle(id);

    const isLive = article && (article.isPublished || (article.publishedAt && new Date(article.publishedAt) <= new Date()));

    if (!article || !isLive) {
        notFound();
    }

    const displayName = article.authorName || article.userName || "Energy Gurus";
    const hasAuthorMetadata = Boolean(article.authorName || article.authorDesignation || article.authorOrganization || article.authorPictureUrl || article.authorLinkedIn || article.authorEmail);

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
                    <ShareButtons title={article.title} />
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
                        
                        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-b border-line py-4 text-sm text-slate-custom font-ibm-plex-mono">
                            <div className="flex items-center gap-2.5">
                                <Avatar className="h-8 w-8 border border-line">
                                    <AvatarImage src={article.authorPictureUrl || undefined} />
                                    <AvatarFallback className="bg-amber/10 text-amber font-bold text-xs">
                                        {displayName.substring(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="font-semibold text-ink">By {displayName}</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="hidden sm:block w-1 h-1 rounded-full bg-slate-300"></div>
                                <div>{article.publishedAt ? format(article.publishedAt, "MMMM d, yyyy 'at' h:mm a") : ""}</div>
                            </div>
                        </div>
                    </header>

                    {/* Featured Cover Image */}
                    {article.imageUrl ? (
                        <div className="w-full rounded-[8px] overflow-hidden mb-12 border border-line shadow-sm bg-slate-50">
                            <img 
                                src={article.imageUrl} 
                                alt={article.title} 
                                className="w-full h-auto block" 
                            />
                        </div>
                    ) : (
                        <div className="aspect-[21/9] rounded-[6px] bg-gradient-to-br from-ink to-[#1b3157] flex items-center justify-center mb-12">
                            <div className="w-[60px] h-[60px] border-2 border-amber rounded-[4px] opacity-40 flex items-center justify-center">
                                <Newspaper className="w-8 h-8 text-amber" />
                            </div>
                        </div>
                    )}

                    {/* Formatted Article Content */}
                    <FormattedMarkdown content={article.content} className="mb-14" />

                    {/* AUTHOR DETAILS CARD (renders if author metadata exists) */}
                    <div className="bg-white border border-line rounded-2xl p-6 md:p-8 space-y-4 shadow-sm">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-line pb-4">
                            <div className="flex items-center gap-4">
                                <Avatar className="h-16 w-16 border-2 border-line rounded-2xl shrink-0 shadow-sm">
                                    <AvatarImage src={article.authorPictureUrl || undefined} />
                                    <AvatarFallback className="bg-amber/10 text-amber font-bold text-xl">
                                        {displayName.substring(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <h4 className="font-space-grotesk font-bold text-lg text-ink">{displayName}</h4>
                                    {article.authorDesignation && (
                                        <p className="text-xs text-slate-custom font-medium flex items-center gap-1.5 mt-0.5">
                                            <Briefcase className="w-3.5 h-3.5 text-amber" /> {article.authorDesignation}
                                        </p>
                                    )}
                                    {article.authorOrganization && (
                                        <p className="text-xs text-slate-custom font-medium flex items-center gap-1.5 mt-0.5">
                                            <Building className="w-3.5 h-3.5 text-slate-custom" /> {article.authorOrganization}
                                        </p>
                                    )}
                                    {!hasAuthorMetadata && (
                                        <p className="text-xs text-slate-custom font-medium mt-0.5">
                                            Official Publication by Energy Gurus Team
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-2 self-end sm:self-center">
                                {article.authorLinkedIn && (
                                    <a
                                        href={article.authorLinkedIn}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-600 text-xs font-bold hover:bg-blue-100 transition-colors"
                                    >
                                        <Linkedin className="w-3.5 h-3.5" /> LinkedIn
                                    </a>
                                )}
                                {article.authorEmail && (
                                    <a
                                        href={`mailto:${article.authorEmail}`}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition-colors"
                                    >
                                        <Mail className="w-3.5 h-3.5" /> Email
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* Article Share Bar in Card */}
                        <div className="flex items-center justify-between pt-2">
                            <span className="text-xs font-semibold text-slate-custom">Enjoyed this article? Share with your network:</span>
                            <ShareButtons title={article.title} />
                        </div>
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

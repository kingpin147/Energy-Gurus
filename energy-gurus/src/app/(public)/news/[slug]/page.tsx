import { db } from "@/db";
import { news, users, writerProfiles } from "@/db/schema";
import { eq, or, and, isNull, lte } from "drizzle-orm";
import { notFound, permanentRedirect } from "next/navigation";
import Link from "next/link";
import { AdBanner } from "@/components/shared/AdBanner";
import { format } from "date-fns";
import {
    ArrowLeft,
    Newspaper,
    Mail,
    Linkedin,
    Facebook,
    Instagram,
    Twitter,
    Music,
    Building,
    Briefcase,
    ShieldCheck,
    Calendar
} from "lucide-react";
import { unstable_cache } from "next/cache";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ShareButtons } from "@/components/news/share-buttons";
import { FormattedMarkdown } from "@/components/news/formatted-markdown";
import { ArticleViewTracker } from "@/components/news/article-view-tracker";
import type { Metadata } from "next";

function extractExcerpt(content?: string | null, maxLen = 160): string {
    if (!content) return "Read the latest news and updates on Pakistan's solar industry, policy changes, and technological breakthroughs on EnergyGurus.";
    const plainText = content
        .replace(/#+\s+/g, '')
        .replace(/(\*\*|__)(.*?)\1/g, '$2')
        .replace(/(\*|_)(.*?)\1/g, '$2')
        .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
        .replace(/!\[.*?\]\(.*?\)/g, '')
        .replace(/`{1,3}[^`]*`{1,3}/g, '')
        .replace(/[\r\n]+/g, ' ')
        .trim();
    if (plainText.length <= maxLen) return plainText;
    return plainText.slice(0, maxLen).trim() + "...";
}

const getNewsArticle = unstable_cache(
    async (slugOrId: string) => {
        const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(slugOrId);

        const identifierCondition = isUuid
            ? or(eq(news.slug, slugOrId), eq(news.id, slugOrId))
            : eq(news.slug, slugOrId);

        const result = await db
            .select({
                id: news.id,
                slug: news.slug,
                title: news.title,
                content: news.content,
                category: news.category,
                imageUrl: news.imageUrl,
                isPublished: news.isPublished,
                publishedAt: news.publishedAt,
                authorId: news.authorId,
                authorName: news.authorName,
                authorPictureUrl: news.authorPictureUrl,
                authorDesignation: news.authorDesignation,
                authorOrganization: news.authorOrganization,
                authorLinkedIn: news.authorLinkedIn,
                authorFacebook: news.authorFacebook,
                authorInstagram: news.authorInstagram,
                authorTwitter: news.authorTwitter,
                authorTiktok: news.authorTiktok,
                authorBio: news.authorBio,
                authorEmail: news.authorEmail,
                userRole: users.role,
                userName: users.name,
                userEmail: users.email,
                writerName: writerProfiles.name,
                writerPictureUrl: writerProfiles.pictureUrl,
                writerDesignation: writerProfiles.designation,
                writerBio: writerProfiles.bio,
                writerSocialLinks: writerProfiles.socialLinks,
                writerStatus: writerProfiles.status,
            })
            .from(news)
            .leftJoin(users, eq(news.authorId, users.id))
            .leftJoin(writerProfiles, eq(users.id, writerProfiles.userId))
            .where(identifierCondition)
            .limit(1);
        
        return result[0];
    },
    ['news-article-detail-v6'],
    { revalidate: 60, tags: ['news'] }
);

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const article = await getNewsArticle(slug);

    const now = new Date();
    const isLive = article && article.isPublished && (!article.publishedAt || new Date(article.publishedAt) <= now);
    if (!article || !isLive) {
        return {
            title: "News Article Not Found",
            robots: { index: false, follow: false }
        };
    }

    const targetSlug = article.slug || article.id;
    const baseUrl = "https://www.energygurus.online";
    const title = `${article.title} | EnergyGurus News`;
    const description = extractExcerpt(article.content, 160);
    const url = `${baseUrl}/news/${targetSlug}`;
    
    const authorName =
        article.authorName?.trim() ||
        article.writerName?.trim() ||
        article.userName?.trim() ||
        "Energy Gurus Team";
    const imageUrl = article.imageUrl || `${baseUrl}/new_hero_banner.jpg`;

    return {
        title,
        description,
        authors: [{ name: authorName }],
        keywords: [
            article.category,
            article.title,
            `${article.category} Pakistan`,
            "Pakistan solar news",
            "solar industry updates Pakistan",
            "renewable energy Pakistan",
            "NEPRA net metering updates",
            "solar policy Pakistan",
            "solar panel price in Pakistan",
            "solar inverter price in Pakistan",
            "EnergyGurus solar news"
        ].filter(Boolean) as string[],
        alternates: {
            canonical: url,
        },
        openGraph: {
            title,
            description,
            url,
            siteName: "EnergyGurus",
            locale: "en_US",
            type: "article",
            publishedTime: article.publishedAt ? new Date(article.publishedAt).toISOString() : undefined,
            authors: [authorName],
            images: [
                {
                    url: imageUrl,
                    width: 1200,
                    height: 630,
                    alt: article.title,
                },
            ],
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: [imageUrl],
        },
    };
}

export default async function NewsArticlePage({
    params
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const article = await getNewsArticle(slug);

    const now = new Date();
    // Strictly require isPublished === true to prevent unapproved draft/writer posts from leaking
    const isLive = article && article.isPublished && (!article.publishedAt || new Date(article.publishedAt) <= now);

    if (!article || !isLive) {
        notFound();
    }

    // 301 Permanent redirect if accessed by UUID or non-canonical slug
    if (article.slug && slug !== article.slug) {
        permanentRedirect(`/news/${article.slug}`);
    }

    // Determine author profile: Writer vs Admin custom author vs Editorial fallback
    const isAdmin = article.userRole === "admin" || article.userRole === "super-admin";
    const isWriter = !isAdmin && !!article.writerName;

    const hasSpecificAuthor = Boolean(article.authorName?.trim() || article.writerName?.trim());

    // Display Name: prioritize custom authorName entered on article, then writer profile name, then user name, then default
    const displayName =
        article.authorName?.trim() ||
        article.writerName?.trim() ||
        article.userName?.trim() ||
        "Energy Gurus Team";

    // Designation: prioritize authorDesignation, then writer designation, then default based on role
    const displayDesignation =
        article.authorDesignation?.trim() ||
        article.writerDesignation?.trim() ||
        (isAdmin ? "Official Editorial Team" : "Contributing Columnist");

    const displayPictureUrl =
        article.authorPictureUrl ||
        article.writerPictureUrl ||
        null;

    const displayBio =
        article.authorBio ||
        article.writerBio ||
        (!hasSpecificAuthor && isAdmin
            ? "Official renewable energy news, policy insights, and technology breakthroughs published by the EnergyGurus editorial team."
            : null);

    const displayLinkedIn =
        article.authorLinkedIn ||
        article.writerSocialLinks?.linkedin ||
        (!hasSpecificAuthor && isAdmin ? "https://linkedin.com/company/energygurus" : null);

    const displayFacebook =
        article.authorFacebook ||
        article.writerSocialLinks?.facebook ||
        null;

    const displayInstagram =
        article.authorInstagram ||
        article.writerSocialLinks?.instagram ||
        null;

    const displayTwitter =
        article.authorTwitter ||
        article.writerSocialLinks?.twitter ||
        null;

    const displayTiktok =
        article.authorTiktok ||
        article.writerSocialLinks?.tiktok ||
        null;

    const displayEmail =
        article.authorEmail ||
        article.userEmail ||
        (!hasSpecificAuthor && isAdmin ? "contact@energygurus.online" : null);

    return (
        <div className="font-sans text-graphite bg-paper leading-relaxed selection:bg-amber/20 min-h-screen">
            {/* Invisible view tracker — fires once per session per article */}
            <ArticleViewTracker articleId={article.id} />
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
                        
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-b border-line py-4 sm:py-5 text-sm text-slate-custom font-ibm-plex-mono">
                            <div className="flex items-center gap-4">
                                <Avatar className="h-16 w-16 sm:h-20 sm:w-20 border-2 border-line shadow-sm rounded-full shrink-0 ring-2 ring-slate-100 overflow-hidden">
                                    <AvatarImage src={displayPictureUrl || undefined} alt={displayName} className="object-cover object-top" />
                                    <AvatarFallback className="bg-amber/10 text-amber font-bold text-base sm:text-xl">
                                        {displayName.substring(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col justify-center gap-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="font-semibold text-ink text-base sm:text-lg">
                                            By {displayName}
                                        </span>
                                        {isWriter && (
                                            <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                                                Writer
                                            </span>
                                        )}
                                        {isAdmin && (
                                            <span className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                                                <ShieldCheck className="w-3 h-3 text-blue-600" /> Editorial
                                            </span>
                                        )}
                                    </div>
                                    {displayDesignation && (
                                        <p className="text-slate-500 font-normal text-xs sm:text-sm">
                                            {displayDesignation}
                                        </p>
                                    )}
                                </div>
                            </div>
                            {article.publishedAt && (
                                <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 self-start sm:self-center shrink-0">
                                    <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                                    <span>{format(new Date(article.publishedAt), "MMMM d, yyyy 'at' h:mm a")}</span>
                                </div>
                            )}
                        </div>
                    </header>

                    {/* Featured Cover Image */}
                    {article.imageUrl ? (
                        <div className="w-full rounded-[8px] overflow-hidden mb-12 border border-line shadow-sm bg-slate-950 aspect-[16/9] sm:aspect-[21/9] max-h-[460px] relative flex items-center justify-center">
                            <img 
                                src={article.imageUrl} 
                                alt="" 
                                aria-hidden="true" 
                                className="absolute inset-0 w-full h-full object-cover blur-xl opacity-40 scale-110 pointer-events-none" 
                            />
                            <img 
                                src={article.imageUrl} 
                                alt={article.title} 
                                className="relative z-10 w-full h-full object-contain p-1" 
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

                    {/* AUTHOR DETAILS CARD (Accurately distinguishes Admin vs Writer) */}
                    <div className="bg-white border border-line rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-line pb-6">
                            <div className="flex items-center gap-4 sm:gap-5">
                                <Avatar className="h-20 w-20 sm:h-24 sm:w-24 border-2 border-line rounded-2xl shrink-0 shadow-sm overflow-hidden ring-2 ring-slate-100">
                                    <AvatarImage src={displayPictureUrl || undefined} alt={displayName} className="object-cover object-top" />
                                    <AvatarFallback className="bg-amber/10 text-amber font-bold text-2xl">
                                        {displayName.substring(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-space-grotesk font-bold text-lg text-ink">{displayName}</h4>
                                        {isAdmin ? (
                                            <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                                                <ShieldCheck className="w-3 h-3 text-blue-600" /> Official Editorial
                                            </span>
                                        ) : (
                                            <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                                                Verified Writer
                                            </span>
                                        )}
                                    </div>
                                    {displayDesignation && (
                                        <p className="text-xs text-slate-custom font-medium flex items-center gap-1.5 mt-1">
                                            <Briefcase className="w-3.5 h-3.5 text-amber" /> {displayDesignation}
                                            {article.authorOrganization && (
                                                <span className="text-slate-400 font-normal">({article.authorOrganization})</span>
                                            )}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Social Handles / Action Badges */}
                            <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
                                {displayLinkedIn && (
                                    <a
                                        href={displayLinkedIn.startsWith("http") ? displayLinkedIn : `https://${displayLinkedIn}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-600 text-xs font-bold hover:bg-blue-100 transition-colors"
                                    >
                                        <Linkedin className="w-3.5 h-3.5" /> LinkedIn
                                    </a>
                                )}
                                {displayFacebook && (
                                    <a
                                        href={displayFacebook.startsWith("http") ? displayFacebook : `https://${displayFacebook}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 text-xs font-bold hover:bg-blue-100 transition-colors"
                                    >
                                        <Facebook className="w-3.5 h-3.5" /> Facebook
                                    </a>
                                )}
                                {displayInstagram && (
                                    <a
                                        href={displayInstagram.startsWith("http") ? displayInstagram : `https://${displayInstagram}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pink-50 text-pink-600 text-xs font-bold hover:bg-pink-100 transition-colors"
                                    >
                                        <Instagram className="w-3.5 h-3.5" /> Instagram
                                    </a>
                                )}
                                {displayTwitter && (
                                    <a
                                        href={displayTwitter.startsWith("http") ? displayTwitter : `https://${displayTwitter}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-900 text-xs font-bold hover:bg-slate-200 transition-colors"
                                    >
                                        <Twitter className="w-3.5 h-3.5" /> X (Twitter)
                                    </a>
                                )}
                                {displayTiktok && (
                                    <a
                                        href={displayTiktok.startsWith("http") ? displayTiktok : `https://${displayTiktok}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-900 text-xs font-bold hover:bg-slate-200 transition-colors"
                                    >
                                        <Music className="w-3.5 h-3.5" /> TikTok
                                    </a>
                                )}
                                {displayEmail && (
                                    <a
                                        href={`mailto:${displayEmail}`}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition-colors"
                                    >
                                        <Mail className="w-3.5 h-3.5" /> Contact
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* Author Bio (50-100 words short intro) */}
                        {displayBio && (
                            <div className="bg-paper/40 p-4 rounded-2xl border border-line">
                                <p className="text-xs font-bold uppercase tracking-wider text-slate-custom mb-1.5">
                                    About the Author
                                </p>
                                <p className="text-sm text-graphite leading-relaxed">
                                    {displayBio}
                                </p>
                            </div>
                        )}

                        {/* Article Share Bar in Card */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
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

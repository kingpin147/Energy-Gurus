import { db } from "@/db";
import { ads } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { unstable_cache } from "next/cache";

export type AdPlacement = 
    | "leaderboard_top" 
    | "leaderboard_bottom" 
    | "skyscraper_left" 
    | "skyscraper_right" 
    | "in_list"
    | "in_content";

interface AdBannerProps {
    placement: AdPlacement;
    targetPage?: "home" | "brands" | "epcs" | "news" | "monitoring" | "podcast" | "global";
    className?: string;
}

const getActiveAd = unstable_cache(
    async (placement: string, targetPage: string = "global") => {
        // Try to find a page-specific ad first
        let activeAds = await db.select().from(ads).where(
            and(
                eq(ads.placement, placement),
                eq(ads.targetPage, targetPage),
                eq(ads.isActive, true)
            )
        ).limit(1);

        // Fallback to global ad for this placement if no specific one exists
        if (activeAds.length === 0 && targetPage !== "global") {
            activeAds = await db.select().from(ads).where(
                and(
                    eq(ads.placement, placement),
                    eq(ads.targetPage, "global"),
                    eq(ads.isActive, true)
                )
            ).limit(1);
        }

        return activeAds.length > 0 ? activeAds[0] : null;
    },
    ['active-ads-cache', 'placement', 'targetPage'],
    { revalidate: 300, tags: ['ads'] }
);

export async function AdBanner({ placement, targetPage = "global", className = "" }: AdBannerProps) {
    const ad = await getActiveAd(placement, targetPage);

    const isSkyscraper = placement === "skyscraper_left" || placement === "skyscraper_right";
    const isLeaderboard = placement === "leaderboard_top" || placement === "leaderboard_bottom";
    const isLeft = placement === "skyscraper_left";

    // CSS class mapping based on HTML layouts
    let wrapperClass = className;
    let innerClass = "";
    
    if (isLeaderboard) {
        wrapperClass += " ad-banner";
        innerClass = "ad-banner-inner";
    } else if (isSkyscraper) {
        wrapperClass += ` ad-sky ${isLeft ? "left" : "right"}`;
        innerClass = "ad-sky-inner h-full max-h-[600px]";
    } else {
        wrapperClass += " ad-inline";
        innerClass = "ad-inline-inner";
    }

    if (ad) {
        const imageEl = <img src={ad.imageUrl} alt={ad.title} className="w-full h-full object-contain" />;
        
        return (
            <div className={wrapperClass}>
                <div className={innerClass + " overflow-hidden p-0 border-none bg-transparent"}>
                    {ad.linkUrl ? (
                        <a href={ad.linkUrl} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
                            {imageEl}
                        </a>
                    ) : (
                        imageEl
                    )}
                </div>
            </div>
        );
    }

    // Placeholder rendering if no active ad
    if (isLeaderboard) {
        return (
            <div className={wrapperClass}>
                <div className="border border-dashed border-line rounded-[6px] bg-[rgba(18,33,58,0.02)] flex flex-col items-center justify-center text-center py-7 px-5 min-h-[110px] w-full">
                    <span className="font-ibm-plex-mono text-[0.66rem] tracking-[0.1em] uppercase text-slate-custom/60 mb-1.5">Advertisement</span>
                    <span className="font-space-grotesk text-[0.95rem] text-slate-custom/80">Your ad here — 728×90 leaderboard</span>
                </div>
            </div>
        );
    } else if (isSkyscraper) {
        return (
            <div className={wrapperClass}>
                <div className="border border-dashed border-line rounded-[6px] bg-[rgba(18,33,58,0.02)] flex flex-col items-center justify-center text-center py-4 px-2.5 min-h-[400px] gap-2 h-full">
                    <span className="font-ibm-plex-mono text-[0.6rem] tracking-[0.08em] uppercase text-slate-custom/60 [writing-mode:vertical-rl]">Ad</span>
                    <span className="font-space-grotesk text-[0.8rem] text-slate-custom/75">160×600</span>
                </div>
            </div>
        );
    }
    
    return null;
}

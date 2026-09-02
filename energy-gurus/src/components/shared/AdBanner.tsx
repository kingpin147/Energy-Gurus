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
        return (
            <div className={wrapperClass}>
                <div className={innerClass + " overflow-hidden p-0 border-none bg-transparent"}>
                    {ad.linkUrl ? (
                        <a href={ad.linkUrl} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
                            <picture>
                                {ad.mobileImageUrl && <source media="(max-width: 767px)" srcSet={ad.mobileImageUrl} />}
                                <img src={ad.imageUrl} alt={ad.title} className="w-full h-full object-contain" />
                            </picture>
                        </a>
                    ) : (
                        <picture>
                            {ad.mobileImageUrl && <source media="(max-width: 767px)" srcSet={ad.mobileImageUrl} />}
                            <img src={ad.imageUrl} alt={ad.title} className="w-full h-full object-contain" />
                        </picture>
                    )}
                </div>
            </div>
        );
    }

    // Hide the ad slot completely if no active ad is found
    return null;
}

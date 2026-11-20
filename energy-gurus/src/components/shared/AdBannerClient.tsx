"use client";

import React, { useEffect } from "react";
import { trackEngagement } from "@/components/shared/AnalyticsTracker";

interface AdBannerClientProps {
  ad: {
    id: string;
    title: string;
    imageUrl: string;
    mobileImageUrl?: string | null;
    linkUrl?: string | null;
    placement: string;
    targetPage: string;
  };
  wrapperClass: string;
  innerClass: string;
}

export function AdBannerClient({ ad, wrapperClass, innerClass }: AdBannerClientProps) {
  // Track ad impression when banner is rendered on client
  useEffect(() => {
    trackEngagement("ad_impression", {
      adId: ad.id,
      title: ad.title,
      placement: ad.placement,
      targetPage: ad.targetPage,
    });
  }, [ad.id, ad.placement, ad.targetPage]);

  const handleClick = () => {
    trackEngagement("ad_click", {
      adId: ad.id,
      title: ad.title,
      placement: ad.placement,
      targetPage: ad.targetPage,
      linkUrl: ad.linkUrl,
    });
  };

  return (
    <div className={wrapperClass}>
      <div className={innerClass + " overflow-hidden p-0 border-none bg-transparent"}>
        {ad.linkUrl ? (
          <a
            href={ad.linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full h-full cursor-pointer"
            onClick={handleClick}
          >
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

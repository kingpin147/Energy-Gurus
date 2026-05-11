"use client";

import { Share2, Link as LinkIcon, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function PodcastShare({ title }: { title: string }) {
    const [copied, setCopied] = useState(false);

    const handleShare = async () => {
        const url = window.location.href;
        
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `EnergyGurus Podcast: ${title}`,
                    url: url
                });
            } catch (err) {
                console.error("Share failed:", err);
            }
        } else {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <Button 
            onClick={handleShare}
            className="rounded-full font-bold px-8 h-12 gap-2"
        >
            {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
            {copied ? "Copied!" : "Share Episode"}
        </Button>
    );
}

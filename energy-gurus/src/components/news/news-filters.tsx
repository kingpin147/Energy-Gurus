"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

interface NewsFiltersProps {
    currentCategory: string;
}

const NEWS_CATEGORIES = [
    "All",
    "Industry News",
    "Policy & Incentives",
    "Product Launches",
    "Project Sign Off",
];

export function NewsFilters({ currentCategory }: NewsFiltersProps) {
    return (
        <div className="flex gap-2.5 flex-wrap mb-9">
            {NEWS_CATEGORIES.map(cat => (
                <Link
                    key={cat}
                    href={cat === "All" ? "/news" : `/news?category=${encodeURIComponent(cat)}`}
                    className={cn(
                        "font-ibm-plex-mono text-[0.78rem] px-4 py-2 rounded-[20px] border border-line bg-white text-slate-custom transition-colors",
                        (currentCategory === cat || (cat === "All" && !currentCategory)) 
                            ? "bg-ink text-white border-ink" 
                            : "hover:border-ink hover:text-ink"
                    )}
                >
                    {cat}
                </Link>
            ))}
        </div>
    );
}

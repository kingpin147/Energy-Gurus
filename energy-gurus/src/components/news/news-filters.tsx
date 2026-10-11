"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

interface NewsFiltersProps {
    currentCategory: string;
    categories?: string[];
}

const DEFAULT_CATEGORIES = [
    "All",
    "Industry News",
    "Policy & Incentives",
    "Product Launches",
    "Project Sign Off",
    "Battery Energy Storage System",
    "Technology & Innovation",
    "Guidelines",
];

export function NewsFilters({ currentCategory, categories }: NewsFiltersProps) {
    const list = categories && categories.length > 0 ? categories : DEFAULT_CATEGORIES;
    const active = (currentCategory || "All").trim().toLowerCase();

    return (
        <div className="flex gap-2.5 flex-wrap mb-9">
            {list.map(cat => {
                const catTrimmed = cat.trim();
                const catLower = catTrimmed.toLowerCase();
                const isSelected = active === catLower || (catLower === "all" && active === "all");

                return (
                    <Link
                        key={cat}
                        href={catLower === "all" ? "/news" : `/news?category=${encodeURIComponent(catTrimmed)}`}
                        className={cn(
                            "font-ibm-plex-mono text-[0.78rem] px-4 py-2 rounded-[20px] border transition-all duration-150",
                            isSelected 
                                ? "bg-ink text-white border-ink font-semibold shadow-sm" 
                                : "border-line bg-white text-slate-custom hover:border-ink hover:text-ink hover:bg-slate-50"
                        )}
                    >
                        {catTrimmed}
                    </Link>
                );
            })}
        </div>
    );
}

"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";

export const BRAND_CATEGORY_TABS = [
  { label: "All Categories", value: "all" },
  { label: "Inverters", value: "inverters" },
  { label: "Solar Panels", value: "panels" },
  { label: "Batteries", value: "batteries" },
  { label: "EV Chargers", value: "ev-chargers" },
  { label: "Mounting & Structure", value: "mounting" },
  { label: "Hybrid Systems", value: "hybrid" },
  { label: "Off-Grid", value: "off-grid" },
  { label: "Commercial", value: "commercial" },
] as const;

export function CategoryTabs({ activeCategory }: { activeCategory: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const setCategory = useCallback(
    (cat: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (cat === "all") {
        params.delete("category");
      } else {
        params.set("category", cat);
      }
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  return (
    <div className="flex gap-2 flex-wrap items-center overflow-x-auto pb-2 scrollbar-none">
      {BRAND_CATEGORY_TABS.map((tab) => {
        const isActive = activeCategory === tab.value;
        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => setCategory(tab.value)}
            className={[
              "px-4 py-2 text-xs md:text-sm font-semibold rounded-full border transition-all cursor-pointer whitespace-nowrap shadow-sm",
              isActive
                ? "bg-ink border-ink text-white shadow-sm"
                : "bg-white border-line text-slate-custom hover:border-amber hover:text-ink hover:bg-paper/50",
            ].join(" ")}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

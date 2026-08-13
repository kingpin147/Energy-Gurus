"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";

const TABS = [
  { label: "Solar Panels", value: "panels" },
  { label: "Inverters",    value: "inverters" },
  { label: "Batteries",   value: "batteries" },
  { label: "Breakers",    value: "breakers" },
] as const;

export function CategoryTabs({ activeCategory }: { activeCategory: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const setCategory = useCallback(
    (cat: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("category", cat);
      // reset page / search when switching tabs
      params.delete("q");
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  return (
    <div className="flex gap-1.5 flex-wrap border-b border-line mb-0">
      {TABS.map((tab) => {
        const isActive = activeCategory === tab.value;
        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => setCategory(tab.value)}
            className={[
              "px-5 py-3.5 text-[0.95rem] font-semibold border-b-2 -mb-px transition-colors",
              isActive
                ? "text-ink border-amber"
                : "text-slate-custom border-transparent hover:text-ink",
            ].join(" ")}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useTransition } from "react";
import { Search, SlidersHorizontal, ArrowUpDown } from "lucide-react";

export const ORIGIN_OPTIONS = [
  { label: "All Origins", value: "" },
  { label: "China", value: "China" },
  { label: "Germany", value: "Germany" },
  { label: "USA", value: "USA" },
  { label: "Japan", value: "Japan" },
  { label: "Austria", value: "Austria" },
  { label: "Switzerland", value: "Switzerland" },
  { label: "Pakistan", value: "Pakistan" },
  { label: "Turkey", value: "Turkey" },
  { label: "UAE", value: "UAE" },
  { label: "Vietnam", value: "Vietnam" },
];

export const SORT_OPTIONS = [
  { label: "Rating (highest first)", value: "top-rated" },
  { label: "Products (most first)", value: "products-desc" },
  { label: "Newest Added", value: "latest" },
  { label: "Oldest / Established", value: "oldest" },
];

export function DirectoryFilters({ totalCount }: { totalCount: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentQ = searchParams.get("q") || "";
  const currentOrigin = searchParams.get("origin") || "";
  const currentSort = searchParams.get("sort") || "top-rated";

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`);
      });
    },
    [router, pathname, searchParams]
  );

  return (
    <div className="bg-white border-y border-line sticky top-[64px] z-20 py-4 shadow-sm backdrop-blur-md bg-white/95">
      <div className="max-w-[1180px] mx-auto px-5 md:px-8 flex flex-wrap items-center gap-3 justify-between">
        
        {/* Search Bar */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-custom absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search brands by name, inverter, panel..."
            defaultValue={currentQ}
            onChange={(e) => {
              const val = e.target.value;
              // Debounce search update
              const timeout = setTimeout(() => updateParam("q", val), 300);
              return () => clearTimeout(timeout);
            }}
            className="w-full pl-10 pr-4 py-2.5 bg-paper/50 border border-line rounded-[3px] text-sm text-ink focus:outline-none focus:border-amber transition-colors placeholder:text-slate-custom/70"
          />
        </div>

        {/* Origin Filter */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={currentOrigin}
              onChange={(e) => updateParam("origin", e.target.value)}
              className="appearance-none bg-paper/50 border border-line rounded-[3px] px-4 py-2.5 pr-8 text-xs font-semibold text-ink cursor-pointer focus:outline-none focus:border-amber"
            >
              {ORIGIN_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-custom absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={currentSort}
              onChange={(e) => updateParam("sort", e.target.value)}
              className="appearance-none bg-paper/50 border border-line rounded-[3px] px-4 py-2.5 pr-8 text-xs font-semibold text-ink cursor-pointer focus:outline-none focus:border-amber"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-custom absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

      </div>
    </div>
  );
}

"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useState, useEffect } from "react";

const CATEGORIES = [
    { id: "panels", label: "Solar Panels" },
    { id: "inverters", label: "Inverters" },
    { id: "batteries", label: "Batteries" },
    { id: "breakers", label: "Breakers" },
];

export function BrandFilters({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const currentCat = searchParams.get("category") || "panels";

    // Create a query string with updated params
    const createQueryString = useCallback(
        (name: string, value: string) => {
            const params = new URLSearchParams(searchParams.toString());
            if (value) {
                params.set(name, value);
            } else {
                params.delete(name);
            }
            return params.toString();
        },
        [searchParams]
    );

    const setCategory = (cat: string) => {
        // When changing category, we clear other filters to avoid conflicts
        router.push(pathname + "?category=" + cat);
    };

    return (
        <div>
            <div className="flex gap-1.5 flex-wrap border-b border-line mb-8">
                {CATEGORIES.map((cat) => (
                    <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategory(cat.id)}
                        className={`bg-transparent border-none px-5 py-3.5 text-[0.95rem] font-semibold transition-colors border-b-2 -mb-[1px] ${
                            currentCat === cat.id
                                ? "text-ink border-amber"
                                : "text-slate-custom border-transparent hover:text-ink"
                        }`}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-9 items-start">
                <aside className="bg-white border border-line rounded-[6px] p-6 sticky top-[88px]">
                    {currentCat === "panels" && <PanelFilters searchParams={searchParams} createQueryString={createQueryString} />}
                    {currentCat === "inverters" && <InverterFilters searchParams={searchParams} createQueryString={createQueryString} />}
                    {currentCat === "batteries" && <BatteryFilters searchParams={searchParams} createQueryString={createQueryString} />}
                    {currentCat === "breakers" && <BreakerFilters searchParams={searchParams} createQueryString={createQueryString} />}
                    
                    <button className="w-full bg-ink text-white p-3 rounded-[3px] text-[0.88rem] mb-2 hover:bg-teal transition-colors mt-4">
                        Apply Filters
                    </button>
                    <button 
                        onClick={() => router.push(pathname + "?category=" + currentCat)}
                        className="w-full bg-transparent text-slate-custom p-2.5 rounded-[3px] text-[0.84rem] border border-line hover:border-ink hover:text-ink transition-colors"
                    >
                        Clear All
                    </button>
                </aside>
                
                <div className="panels-main">
                    {children}
                </div>
            </div>
        </div>
    );
}

function PanelFilters({ searchParams, createQueryString }: any) {
    // To keep it simple for now, we just mock the UI according to HTML
    return (
        <>
            <div className="mb-6 pb-5 border-b border-line">
                <div className="font-ibm-plex-mono text-[0.7rem] tracking-[0.06em] uppercase text-ink font-semibold mb-3">Technology</div>
                <label className="flex items-center gap-2 text-[0.88rem] text-slate-custom py-1 cursor-pointer hover:text-ink">
                    <input type="checkbox" className="accent-teal w-[15px] h-[15px]" /> TOPCon
                </label>
                <label className="flex items-center gap-2 text-[0.88rem] text-slate-custom py-1 cursor-pointer hover:text-ink">
                    <input type="checkbox" className="accent-teal w-[15px] h-[15px]" /> Back Contact
                </label>
                <label className="flex items-center gap-2 text-[0.88rem] text-slate-custom py-1 cursor-pointer hover:text-ink">
                    <input type="checkbox" className="accent-teal w-[15px] h-[15px]" /> HJT
                </label>
            </div>
            <div className="mb-6 pb-5 border-b border-line">
                <div className="font-ibm-plex-mono text-[0.7rem] tracking-[0.06em] uppercase text-ink font-semibold mb-3">Wattage</div>
                <div className="flex flex-col gap-1.5">
                    <input type="range" min="585" max="900" className="accent-amber w-full m-0" />
                    <span className="font-ibm-plex-mono text-[0.8rem] text-teal mt-1">585W - 900W</span>
                </div>
            </div>
            {/* Add more filters from HTML */}
        </>
    );
}

function InverterFilters({ searchParams, createQueryString }: any) {
    return (
        <>
            <div className="mb-6 pb-5 border-b border-line">
                <div className="font-ibm-plex-mono text-[0.7rem] tracking-[0.06em] uppercase text-ink font-semibold mb-3">Phase</div>
                <label className="flex items-center gap-2 text-[0.88rem] text-slate-custom py-1 cursor-pointer hover:text-ink">
                    <input type="checkbox" className="accent-teal w-[15px] h-[15px]" /> Single Phase
                </label>
                <label className="flex items-center gap-2 text-[0.88rem] text-slate-custom py-1 cursor-pointer hover:text-ink">
                    <input type="checkbox" className="accent-teal w-[15px] h-[15px]" /> Three Phase
                </label>
            </div>
        </>
    );
}

function BatteryFilters({ searchParams, createQueryString }: any) { return <div className="text-sm text-slate-custom mb-6">Battery filters...</div>; }
function BreakerFilters({ searchParams, createQueryString }: any) { return <div className="text-sm text-slate-custom mb-6">Breaker filters...</div>; }

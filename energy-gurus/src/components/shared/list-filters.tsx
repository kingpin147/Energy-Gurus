"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, MapPin, Zap, X } from "lucide-react";

interface FilterOption {
    label: string;
    value: string;
}

interface ListFiltersProps {
    cities?: string[];
    sectors?: string[];
}

export function ListFilters({ cities = [], sectors = [] }: ListFiltersProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const currentCity = searchParams.get("city") || "";
    const currentSector = searchParams.get("sector") || "";

    const handleFilter = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    };

    const clearFilters = () => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("city");
        params.delete("sector");
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    };

    return (
        <div className="flex flex-wrap items-center gap-3">
            {/* City Filter */}
            {cities.length > 0 && (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className={`h-11 rounded-xl gap-2 border-primary/10 min-w-[130px] justify-between transition-all ${currentCity ? "bg-primary/5 border-primary/30 text-primary" : "bg-white"}`}>
                            <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 opacity-70" />
                                <span className="text-sm font-bold">{currentCity || "All Cities"}</span>
                            </div>
                            <ChevronDown className="w-4 h-4 opacity-40" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-[180px] rounded-xl p-1 shadow-xl border-primary/5">
                        <DropdownMenuItem onClick={() => handleFilter("city", "")} className="rounded-lg cursor-pointer font-bold text-xs py-2 px-3">
                            All Cities
                        </DropdownMenuItem>
                        {cities.map((city) => (
                            <DropdownMenuItem
                                key={city}
                                onClick={() => handleFilter("city", city)}
                                className={`rounded-lg cursor-pointer font-medium text-sm py-2 px-3 ${currentCity === city ? "bg-primary/10 text-primary font-bold" : ""}`}
                            >
                                {city}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            )}

            {/* Sector Filter */}
            {sectors.length > 0 && (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className={`h-11 rounded-xl gap-2 border-primary/10 min-w-[130px] justify-between transition-all ${currentSector ? "bg-primary/5 border-primary/30 text-primary" : "bg-white"}`}>
                            <div className="flex items-center gap-2">
                                <Zap className="w-4 h-4 opacity-70" />
                                <span className="text-sm font-bold">{currentSector || "All Sectors"}</span>
                            </div>
                            <ChevronDown className="w-4 h-4 opacity-40" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-[180px] rounded-xl p-1 shadow-xl border-primary/5">
                        <DropdownMenuItem onClick={() => handleFilter("sector", "")} className="rounded-lg cursor-pointer font-bold text-xs py-2 px-3">
                            All Sectors
                        </DropdownMenuItem>
                        {sectors.map((sector) => (
                            <DropdownMenuItem
                                key={sector}
                                onClick={() => handleFilter("sector", sector)}
                                className={`rounded-lg cursor-pointer font-medium text-sm py-2 px-3 ${currentSector === sector ? "bg-primary/10 text-primary font-bold" : ""}`}
                            >
                                {sector}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            )}

            {(currentCity || currentSector) && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="h-11 rounded-xl text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-all gap-2"
                >
                    <X className="w-4 h-4" /> Clear
                </Button>
            )}
        </div>
    );
}

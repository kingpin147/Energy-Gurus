"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, Filter } from "lucide-react";

interface SortOption {
    label: string;
    value: string;
}

interface ListSortProps {
    options: SortOption[];
    defaultValue?: string;
    label?: string;
    paramName?: string;
}

export function ListSort({
    options,
    defaultValue,
    label = "Sort By",
    paramName = "sort"
}: ListSortProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // If no defaultValue provided, use the first option's value
    const effectiveDefault = defaultValue ?? options[0].value;
    const currentVal = searchParams.get(paramName) || effectiveDefault;
    const currentLabel = options.find(opt => opt.value === currentVal)?.label || options[0].label;

    const handleSort = (value: string) => {
        if (value === currentVal) return;
        const params = new URLSearchParams(searchParams.toString());
        if (value === "") {
            params.delete(paramName);
        } else {
            params.set(paramName, value);
        }
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-11 rounded-xl gap-2 border-amber/10 min-w-[140px] justify-between bg-white shadow-sm hover:shadow transition-all">
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-amber/60" />
                        <span className="text-sm font-medium">{currentLabel}</span>
                    </div>
                    <ChevronDown className="w-4 h-4 opacity-50" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[180px] rounded-xl p-1 shadow-xl border-amber/5">
                <div className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-custom opacity-50">
                    {label}
                </div>
                {options.map((option) => (
                    <DropdownMenuItem
                        key={option.value}
                        onClick={() => handleSort(option.value)}
                        className={`rounded-lg cursor-pointer font-medium text-sm py-2.5 px-3 mb-0.5 last:mb-0 transition-colors ${currentVal === option.value
                            ? "bg-amber/10 text-ink text-amber font-bold"
                            : "hover:bg-amber/5 text-ink"
                            }`}
                    >
                        {option.label}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

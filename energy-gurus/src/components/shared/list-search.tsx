"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useDebounce } from "../../hooks/use-debounce";

interface ListSearchProps {
    placeholder?: string;
    paramName?: string;
    className?: string;
    icon?: React.ReactNode;
}

export function ListSearch({ placeholder = "Search...", paramName = "q", className, icon }: ListSearchProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    
    const [value, setValue] = useState(searchParams.get(paramName) || "");
    const debouncedValue = useDebounce(value, 500);

    useEffect(() => {
        const currentParam = searchParams.get(paramName) || "";
        
        if (debouncedValue === currentParam) return;

        const params = new URLSearchParams(searchParams.toString());
        if (debouncedValue) {
            params.set(paramName, debouncedValue);
        } else {
            params.delete(paramName);
        }
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    }, [debouncedValue, pathname, router, paramName, searchParams]);

    return (
        <div className="relative flex-1">
            {icon !== undefined ? icon : <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-custom" />}
            <Input 
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={placeholder} 
                className={`h-11 bg-white border-line rounded-[4px] focus-visible:ring-amber/20 ${icon === null ? "pl-3" : "pl-10"} ${className || ""}`} 
            />
        </div>
    );
}

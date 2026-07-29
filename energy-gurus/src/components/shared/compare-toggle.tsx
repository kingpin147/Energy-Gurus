"use client";

import { Scale, Check } from "lucide-react";
import { useCompare } from "./compare-context";
import { cn } from "@/lib/utils";

interface CompareToggleProps {
    id: string;
    name: string;
    type: "epc" | "brand";
    className?: string;
}

export function CompareToggle({ id, name, type, className }: CompareToggleProps) {
    const { toggleCompare, isComparing, compareList } = useCompare();
    const comparing = isComparing(id);
    
    const disabled = !comparing && compareList.length >= 3 && compareList[0]?.type === type;

    return (
        <button
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!disabled) {
                    toggleCompare({ id, name, type });
                }
            }}
            disabled={disabled}
            className={cn(
                "flex items-center gap-1.5 text-[0.8rem] font-semibold border rounded-[3px] px-3 py-1.5 transition-colors",
                comparing 
                    ? "bg-amber/10 border-amber text-amber hover:bg-amber/20" 
                    : "border-line text-slate-custom hover:border-amber hover:text-amber",
                disabled && "opacity-50 cursor-not-allowed hover:border-line hover:text-slate-custom",
                className
            )}
            title={disabled ? "You can only compare up to 3 items at a time." : "Compare"}
        >
            {comparing ? (
                <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Added</span>
                </>
            ) : (
                <>
                    <Scale className="w-3.5 h-3.5" />
                    <span>Compare</span>
                </>
            )}
        </button>
    );
}

"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { X, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/routing";

interface CompareItem {
    id: string;
    name: string;
    type: "epc" | "brand";
}

interface CompareContextType {
    compareList: CompareItem[];
    toggleCompare: (item: CompareItem) => void;
    clearCompare: () => void;
    isComparing: (id: string) => boolean;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export function CompareProvider({ children }: { children: React.ReactNode }) {
    const [compareList, setCompareList] = useState<CompareItem[]>([]);
    const router = useRouter();

    useEffect(() => {
        const saved = localStorage.getItem("energygurus_compare");
        if (saved) {
            try {
                setCompareList(JSON.parse(saved));
            } catch (e) {}
        }
    }, []);

    useEffect(() => {
        localStorage.setItem("energygurus_compare", JSON.stringify(compareList));
    }, [compareList]);

    const toggleCompare = (item: CompareItem) => {
        setCompareList(prev => {
            // If already in list, remove it
            if (prev.some(i => i.id === item.id)) {
                return prev.filter(i => i.id !== item.id);
            }
            
            // Otherwise add it. Maximum 3 items of the same type.
            // Also ensure we don't mix types (epc vs brand).
            const filtered = prev.filter(i => i.type === item.type);
            if (filtered.length >= 3) {
                // Remove first, add new
                return [...filtered.slice(1), item];
            }
            return [...filtered, item];
        });
    };

    const clearCompare = () => setCompareList([]);

    const isComparing = (id: string) => compareList.some(i => i.id === id);

    const handleCompareAction = () => {
        if (compareList.length < 2) return;
        const type = compareList[0].type;
        const ids = compareList.map(i => i.id).join(",");
        router.push(`/${type === "epc" ? "epcs" : "brands"}/compare?ids=${ids}`);
    };

    return (
        <CompareContext.Provider value={{ compareList, toggleCompare, clearCompare, isComparing }}>
            {children}
            
            {/* Compare Floating Tray */}
            {compareList.length > 0 && (
                <div className="fixed bottom-0 left-0 right-0 z-50 p-4 pointer-events-none flex justify-center animate-in slide-in-from-bottom-10 duration-300">
                    <div className="bg-ink text-white rounded-2xl shadow-2xl border border-line/20 pointer-events-auto p-4 flex flex-col sm:flex-row items-center gap-4 sm:gap-8 max-w-4xl w-full">
                        <div className="flex-1 w-full sm:w-auto">
                            <div className="flex items-center justify-between mb-2 sm:mb-0">
                                <h4 className="font-space-grotesk font-semibold flex items-center gap-2">
                                    <Scale className="w-4 h-4 text-amber" />
                                    Compare {compareList[0].type === "epc" ? "Installers" : "Brands"}
                                </h4>
                                <button onClick={clearCompare} className="sm:hidden text-slate-custom hover:text-white">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            <p className="text-xs text-slate-custom hidden sm:block">Select up to 3 {compareList[0].type === "epc" ? "installers" : "brands"} to compare side-by-side.</p>
                        </div>
                        
                        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
                            {compareList.map(item => (
                                <div key={item.id} className="bg-white/10 px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 whitespace-nowrap">
                                    <span className="truncate max-w-[100px] sm:max-w-[150px] font-medium">{item.name}</span>
                                    <button onClick={() => toggleCompare(item)} className="opacity-60 hover:opacity-100 hover:text-amber">
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="flex items-center gap-3 w-full sm:w-auto shrink-0">
                            <Button 
                                onClick={handleCompareAction} 
                                disabled={compareList.length < 2}
                                className="w-full sm:w-auto bg-amber text-ink hover:bg-amber/90 font-bold rounded-xl"
                            >
                                Compare {compareList.length}/3
                            </Button>
                            <button onClick={clearCompare} className="hidden sm:block text-slate-custom hover:text-white p-2">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </CompareContext.Provider>
    );
}

export function useCompare() {
    const context = useContext(CompareContext);
    if (context === undefined) {
        throw new Error("useCompare must be used within a CompareProvider");
    }
    return context;
}

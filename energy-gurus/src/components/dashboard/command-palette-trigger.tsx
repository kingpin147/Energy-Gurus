"use client";

import React from "react";
import { Search } from "lucide-react";

export function CommandPaletteTrigger() {
  const handleClick = () => {
    window.dispatchEvent(new CustomEvent("open-command-palette"));
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-paper border border-line hover:border-amber/50 shadow-xs transition-all text-xs font-medium text-slate-500 hover:text-navy-deep group cursor-pointer"
      title="Open Command Palette (⌘K)"
    >
      <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber transition-colors" />
      <span className="hidden sm:inline font-sans">Quick search...</span>
      <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.2 text-[10px] font-mono bg-paper border border-line/80 rounded-md text-slate-500 font-bold group-hover:border-slate-300">
        <span>⌘</span><span>K</span>
      </kbd>
    </button>
  );
}


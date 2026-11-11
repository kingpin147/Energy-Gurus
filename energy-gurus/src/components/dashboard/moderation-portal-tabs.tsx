"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { BrandModerationQueue } from "@/components/dashboard/BrandModerationQueue";
import { WriterModerationQueue, WriterModerationItem } from "@/components/dashboard/writer-moderation-queue";
import { ArticleModerationQueue, ArticleModerationItem } from "@/components/dashboard/article-moderation-queue";
import { Building2, UserCheck, FileText, Clock, AlertTriangle } from "lucide-react";

interface ModerationPortalTabsProps {
  brands: any[];
  writers: WriterModerationItem[];
  articles: ArticleModerationItem[];
}

export function ModerationPortalTabs({ brands, writers, articles }: ModerationPortalTabsProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialTab = searchParams.get("tab");
  const defaultTab = initialTab === "articles" ? "articles" : initialTab === "writers" ? "writers" : "brands";
  const [activeTab, setActiveTab] = useState<"brands" | "writers" | "articles">(defaultTab);

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "articles" || tabParam === "writers" || tabParam === "brands") {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleTabChange = (tab: "brands" | "writers" | "articles") => {
    setActiveTab(tab);
    router.replace(`/dashboard/moderation?tab=${tab}`, { scroll: false });
  };

  const pendingBrands = brands.filter((b) => b.status === "pending_review").length;
  const pendingWriters = writers.filter((w) => w.status === "pending_review").length;
  const pendingArticles = articles.filter((a) => a.status === "pending_review").length;

  return (
    <div className="space-y-6">
      {/* Bento Telemetry Cards for Moderation Queue */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Brands Queue */}
        <div 
          onClick={() => handleTabChange("brands")}
          className={`cursor-pointer p-4 rounded-2xl bg-white border shadow-xs relative overflow-hidden transition-all duration-200 group hover:border-amber/50 hover:shadow-sm ${
            activeTab === "brands" ? "border-amber ring-2 ring-amber/20" : "border-line"
          }`}
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-amber" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-ibm-plex-mono">Brand Queue</span>
            <div className="p-1.5 rounded-lg bg-amber/10 text-amber">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-navy-deep font-space-grotesk tracking-tight">
            {pendingBrands} Pending
          </div>
          <p className="text-[11px] text-slate-400 font-ibm-plex-mono mt-0.5">
            {brands.length} total brand profiles
          </p>
        </div>

        {/* Writers Queue */}
        <div 
          onClick={() => handleTabChange("writers")}
          className={`cursor-pointer p-4 rounded-2xl bg-white border shadow-xs relative overflow-hidden transition-all duration-200 group hover:border-navy-deep/50 hover:shadow-sm ${
            activeTab === "writers" ? "border-navy-deep ring-2 ring-navy-deep/20" : "border-line"
          }`}
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-navy-deep" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-ibm-plex-mono">Writer Queue</span>
            <div className="p-1.5 rounded-lg bg-paper border border-line/60">
              <UserCheck className="w-4 h-4 text-navy-deep" />
            </div>
          </div>
          <div className="text-2xl font-black text-navy-deep font-space-grotesk tracking-tight">
            {pendingWriters} Pending
          </div>
          <p className="text-[11px] text-slate-400 font-ibm-plex-mono mt-0.5">
            {writers.length} registered authors
          </p>
        </div>

        {/* Articles Queue */}
        <div 
          onClick={() => handleTabChange("articles")}
          className={`cursor-pointer p-4 rounded-2xl bg-white border shadow-xs relative overflow-hidden transition-all duration-200 group hover:border-teal/50 hover:shadow-sm ${
            activeTab === "articles" ? "border-teal ring-2 ring-teal/20" : "border-line"
          }`}
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-teal" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-ibm-plex-mono">Article Queue</span>
            <div className="p-1.5 rounded-lg bg-teal/10 text-teal">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-navy-deep font-space-grotesk tracking-tight">
            {pendingArticles} Pending
          </div>
          <p className="text-[11px] text-slate-400 font-ibm-plex-mono mt-0.5">
            {articles.length} submitted pieces
          </p>
        </div>
      </div>

      {/* Moderation Navigation Tabs */}
      <div className="flex items-center bg-paper border border-line p-1 rounded-xl w-fit flex-wrap gap-1">
        <button
          type="button"
          onClick={() => handleTabChange("brands")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs font-ibm-plex-mono transition-all cursor-pointer ${
            activeTab === "brands"
              ? "bg-white text-navy-deep shadow-xs border border-line/60"
              : "text-slate-500 hover:text-navy-deep"
          }`}
        >
          <Building2 className="w-3.5 h-3.5 text-amber" />
          <span>Brand Submissions</span>
          {pendingBrands > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-amber text-navy-deep font-mono">
              {pendingBrands}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => handleTabChange("writers")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs font-ibm-plex-mono transition-all cursor-pointer ${
            activeTab === "writers"
              ? "bg-white text-navy-deep shadow-xs border border-line/60"
              : "text-slate-500 hover:text-navy-deep"
          }`}
        >
          <UserCheck className="w-3.5 h-3.5 text-navy-deep" />
          <span>Writer Profiles</span>
          {pendingWriters > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-navy-deep text-white font-mono">
              {pendingWriters}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => handleTabChange("articles")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs font-ibm-plex-mono transition-all cursor-pointer ${
            activeTab === "articles"
              ? "bg-white text-navy-deep shadow-xs border border-line/60"
              : "text-slate-500 hover:text-navy-deep"
          }`}
        >
          <FileText className="w-3.5 h-3.5 text-teal" />
          <span>Article Submissions</span>
          {pendingArticles > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-teal text-white font-mono">
              {pendingArticles}
            </span>
          )}
        </button>
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === "brands" && <BrandModerationQueue brands={brands} />}
        {activeTab === "writers" && <WriterModerationQueue writers={writers} />}
        {activeTab === "articles" && <ArticleModerationQueue articles={articles} />}
      </div>
    </div>
  );
}

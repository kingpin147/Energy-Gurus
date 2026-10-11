"use client";

import React, { useState } from "react";
import { BrandModerationQueue } from "@/components/dashboard/BrandModerationQueue";
import { WriterModerationQueue, WriterModerationItem } from "@/components/dashboard/writer-moderation-queue";
import { ArticleModerationQueue, ArticleModerationItem } from "@/components/dashboard/article-moderation-queue";
import { Building2, UserCheck, FileText } from "lucide-react";

interface ModerationPortalTabsProps {
  brands: any[];
  writers: WriterModerationItem[];
  articles: ArticleModerationItem[];
}

export function ModerationPortalTabs({ brands, writers, articles }: ModerationPortalTabsProps) {
  const [activeTab, setActiveTab] = useState<"brands" | "writers" | "articles">("brands");

  const pendingBrands = brands.filter((b) => b.status === "pending_review").length;
  const pendingWriters = writers.filter((w) => w.status === "pending_review").length;
  const pendingArticles = articles.filter((a) => a.status === "pending_review").length;

  return (
    <div className="space-y-8">
      {/* Moderation Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-3 border-b border-line pb-4">
        <button
          onClick={() => setActiveTab("brands")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm transition-all ${
            activeTab === "brands"
              ? "bg-amber text-ink shadow-md shadow-amber/20"
              : "bg-white text-slate-custom hover:bg-paper hover:text-ink border border-line"
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Brand Submissions</span>
          {pendingBrands > 0 && (
            <span className="px-2 py-0.5 rounded-full text-xs font-black bg-ink text-white">
              {pendingBrands}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("writers")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm transition-all ${
            activeTab === "writers"
              ? "bg-amber text-ink shadow-md shadow-amber/20"
              : "bg-white text-slate-custom hover:bg-paper hover:text-ink border border-line"
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Writer Profiles</span>
          {pendingWriters > 0 && (
            <span className="px-2 py-0.5 rounded-full text-xs font-black bg-ink text-white">
              {pendingWriters}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("articles")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm transition-all ${
            activeTab === "articles"
              ? "bg-amber text-ink shadow-md shadow-amber/20"
              : "bg-white text-slate-custom hover:bg-paper hover:text-ink border border-line"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Article Submissions</span>
          {pendingArticles > 0 && (
            <span className="px-2 py-0.5 rounded-full text-xs font-black bg-ink text-white">
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

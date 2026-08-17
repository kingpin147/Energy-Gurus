"use client";

import React, { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
  Search,
  Plus,
  Pencil,
  Power,
  PowerOff,
  Clock,
  CheckCircle2,
  Newspaper,
  LayoutGrid,
  List as ListIcon,
  ChevronLeft,
  ChevronRight,
  User,
  Calendar
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DeleteContentButton } from "@/components/dashboard/delete-content-button";
import { deleteNews, toggleNewsStatus } from "@/lib/actions/news";

interface NewsItem {
  id: string;
  title: string;
  content: string;
  category: string;
  imageUrl?: string | null;
  authorName?: string | null;
  authorDesignation?: string | null;
  isPublished: boolean;
  publishedAt?: Date | string | null;
  createdAt: Date | string;
}

interface NewsTableClientProps {
  initialNews: NewsItem[];
}

const ITEMS_PER_PAGE = 10;

export function NewsTableClient({ initialNews }: NewsTableClientProps) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [currentPage, setCurrentPage] = useState(1);

  const now = new Date();

  // Extract distinct categories
  const categories = Array.from(new Set(initialNews.map((item) => item.category).filter(Boolean)));

  // Calculate metrics
  const totalCount = initialNews.length;
  const liveCount = initialNews.filter(
    (a) => Boolean(a.isPublished || (a.publishedAt && new Date(a.publishedAt) <= now))
  ).length;
  const scheduledCount = initialNews.filter((a) => {
    const isLive = Boolean(a.isPublished || (a.publishedAt && new Date(a.publishedAt) <= now));
    return Boolean(!isLive && a.publishedAt && new Date(a.publishedAt) > now);
  }).length;
  const draftCount = totalCount - liveCount - scheduledCount;

  // Filter articles
  const filtered = initialNews.filter((article) => {
    const isLive = Boolean(article.isPublished || (article.publishedAt && new Date(article.publishedAt) <= now));
    const isScheduled = Boolean(!isLive && article.publishedAt && new Date(article.publishedAt) > now);
    const isDraft = Boolean(!isLive && !isScheduled);

    // Search query
    const searchLower = search.toLowerCase();
    const matchesSearch =
      !search ||
      article.title.toLowerCase().includes(searchLower) ||
      article.content.toLowerCase().includes(searchLower) ||
      (article.authorName && article.authorName.toLowerCase().includes(searchLower)) ||
      article.category.toLowerCase().includes(searchLower);

    // Category filter
    const matchesCategory = categoryFilter === "all" || article.category === categoryFilter;

    // Status filter
    let matchesStatus = true;
    if (statusFilter === "live") matchesStatus = isLive;
    if (statusFilter === "scheduled") matchesStatus = isScheduled;
    if (statusFilter === "draft") matchesStatus = isDraft;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Pagination math
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginatedArticles = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="space-y-6">
      {/* 1. METRICS OVERVIEW */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-line shadow-sm rounded-2xl bg-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-custom uppercase">Total Articles</p>
              <p className="text-2xl font-bold text-ink mt-1">{totalCount}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
              <Newspaper className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-line shadow-sm rounded-2xl bg-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-custom uppercase">Live Posts</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">{liveCount}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-line shadow-sm rounded-2xl bg-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-custom uppercase">Scheduled</p>
              <p className="text-2xl font-bold text-amber mt-1">{scheduledCount}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber/10 flex items-center justify-center text-amber">
              <Clock className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-line shadow-sm rounded-2xl bg-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-custom uppercase">Drafts</p>
              <p className="text-2xl font-bold text-slate-600 mt-1">{draftCount}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
              <Pencil className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 2. SEARCH & FILTER TOOLBAR */}
      <div className="bg-white p-4 rounded-2xl border border-line shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto flex-1">
          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-custom absolute left-3.5 top-1/2 -translate-y-1/2" />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by title, author, category..."
              className="pl-10 h-10 rounded-xl bg-slate-50 border-line text-sm"
            />
          </div>

          {/* Category Filter */}
          <Select
            value={categoryFilter}
            onValueChange={(val) => {
              setCategoryFilter(val);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="h-10 rounded-xl bg-slate-50 border-line text-xs font-semibold w-full sm:w-44">
              <SelectValue placeholder="Category: All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select
            value={statusFilter}
            onValueChange={(val) => {
              setStatusFilter(val);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="h-10 rounded-xl bg-slate-50 border-line text-xs font-semibold w-full sm:w-36">
              <SelectValue placeholder="Status: All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="live">Live</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* View Switcher (Table vs Grid) */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0 self-end md:self-auto">
          <button
            type="button"
            onClick={() => setViewMode("table")}
            className={`p-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              viewMode === "table" ? "bg-white text-ink shadow-sm font-bold" : "text-slate-custom hover:text-ink"
            }`}
            title="Compact Table View"
          >
            <ListIcon className="w-4 h-4" /> Table
          </button>
          <button
            type="button"
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              viewMode === "grid" ? "bg-white text-ink shadow-sm font-bold" : "text-slate-custom hover:text-ink"
            }`}
            title="Cards Grid View"
          >
            <LayoutGrid className="w-4 h-4" /> Grid
          </button>
        </div>
      </div>

      {/* 3. TABLE / GRID CONTENT */}
      {viewMode === "table" ? (
        <div className="bg-white rounded-2xl border border-line overflow-hidden shadow-sm">
          <Table>
            <TableHeader className="bg-slate-50/80">
              <TableRow className="border-line hover:bg-transparent">
                <TableHead className="font-bold text-ink text-xs uppercase">Article Title & Category</TableHead>
                <TableHead className="font-bold text-ink text-xs uppercase">Author</TableHead>
                <TableHead className="font-bold text-ink text-xs uppercase">Status</TableHead>
                <TableHead className="font-bold text-ink text-xs uppercase">Publish Date</TableHead>
                <TableHead className="font-bold text-ink text-xs uppercase text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedArticles.map((article) => {
                const isLive = Boolean(article.isPublished || (article.publishedAt && new Date(article.publishedAt) <= now));
                const isScheduled = Boolean(!isLive && article.publishedAt && new Date(article.publishedAt) > now);

                return (
                  <TableRow key={article.id} className="border-line hover:bg-slate-50/50">
                    {/* Title & Image */}
                    <TableCell className="py-3">
                      <div className="flex items-center gap-3 max-w-md">
                        <div className="w-11 h-11 rounded-xl bg-slate-100 border border-line overflow-hidden shrink-0 flex items-center justify-center">
                          {article.imageUrl ? (
                            <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover" />
                          ) : (
                            <Newspaper className="w-5 h-5 text-slate-400" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <Link href={`/dashboard/news/${article.id}/edit`} className="font-bold text-sm text-ink hover:text-amber transition-colors line-clamp-1">
                            {article.title}
                          </Link>
                          <Badge variant="outline" className="text-[10px] bg-slate-50 text-slate-600 mt-1 py-0 px-2 font-mono">
                            {article.category}
                          </Badge>
                        </div>
                      </div>
                    </TableCell>

                    {/* Author */}
                    <TableCell className="py-3 text-xs">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                        <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[140px]">{article.authorName || "Energy Gurus"}</span>
                      </div>
                      {article.authorDesignation && (
                        <p className="text-[11px] text-slate-custom truncate max-w-[140px] pl-5">{article.authorDesignation}</p>
                      )}
                    </TableCell>

                    {/* Status */}
                    <TableCell className="py-3">
                      {isLive ? (
                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1 text-[11px] font-semibold">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Live
                        </Badge>
                      ) : isScheduled ? (
                        <Badge className="bg-amber-50 text-amber-700 border-amber-200 gap-1 text-[11px] font-semibold">
                          <Clock className="w-3 h-3 text-amber" /> Scheduled
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-slate-100 text-slate-600 text-[11px] font-semibold">
                          Draft
                        </Badge>
                      )}
                    </TableCell>

                    {/* Publish Date */}
                    <TableCell className="py-3 text-xs text-slate-custom font-mono">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>
                          {article.publishedAt
                            ? format(new Date(article.publishedAt), "MMM d, yyyy h:mm a")
                            : "—"}
                        </span>
                      </div>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Edit Button */}
                        <Button asChild variant="outline" size="icon" className="h-8 w-8 rounded-lg border-line hover:bg-amber/10 hover:text-amber" title="Edit Article">
                          <Link href={`/dashboard/news/${article.id}/edit`}>
                            <Pencil className="w-3.5 h-3.5" />
                          </Link>
                        </Button>

                        {/* Toggle Status Form */}
                        <form action={async () => { await toggleNewsStatus(article.id, !isLive); }}>
                          <Button type="submit" variant={isLive ? "destructive" : "default"} size="icon" className="h-8 w-8 rounded-lg" title={isLive ? "Unpublish Article" : "Publish Article Immediately"}>
                            {isLive ? <PowerOff className="w-3.5 h-3.5" /> : <Power className="w-3.5 h-3.5" />}
                          </Button>
                        </form>

                        {/* Delete Button */}
                        <DeleteContentButton
                          id={article.id}
                          action={deleteNews}
                          confirmMessage={`Are you sure you want to delete "${article.title}"?`}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}

              {paginatedArticles.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-12 text-center text-slate-custom">
                    <Newspaper className="w-10 h-10 mx-auto mb-2 opacity-20" />
                    <p className="text-sm font-semibold">No news articles found</p>
                    <p className="text-xs text-slate-custom mt-0.5">Try adjusting your search query or filters.</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      ) : (
        /* GRID VIEW (Compact Cards) */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedArticles.map((article) => {
            const isLive = Boolean(article.isPublished || (article.publishedAt && new Date(article.publishedAt) <= now));
            const isScheduled = Boolean(!isLive && article.publishedAt && new Date(article.publishedAt) > now);

            return (
              <Card key={article.id} className="border-line shadow-sm rounded-2xl overflow-hidden bg-white flex flex-col hover:shadow-md transition-shadow">
                <div className="aspect-[21/9] bg-slate-100 relative overflow-hidden flex items-center justify-center border-b border-line">
                  {article.imageUrl ? (
                    <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover" />
                  ) : (
                    <Newspaper className="w-8 h-8 text-slate-300" />
                  )}
                  <div className="absolute top-2 right-2 flex gap-1 bg-white/80 backdrop-blur rounded-lg p-1 shadow-sm">
                    <Button asChild variant="outline" size="icon" className="h-7 w-7 rounded-md" title="Edit Article">
                      <Link href={`/dashboard/news/${article.id}/edit`}>
                        <Pencil className="w-3 h-3" />
                      </Link>
                    </Button>
                    <form action={async () => { await toggleNewsStatus(article.id, !isLive); }}>
                      <Button type="submit" variant={isLive ? "destructive" : "default"} size="icon" className="h-7 w-7 rounded-md" title={isLive ? "Unpublish" : "Publish"}>
                        {isLive ? <PowerOff className="w-3 h-3" /> : <Power className="w-3 h-3" />}
                      </Button>
                    </form>
                    <DeleteContentButton
                      id={article.id}
                      action={deleteNews}
                      confirmMessage={`Delete "${article.title}"?`}
                    />
                  </div>
                </div>

                <CardContent className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <Badge variant="outline" className="text-[10px] bg-slate-50 text-slate-600 font-mono">
                        {article.category}
                      </Badge>
                      {isLive ? (
                        <Badge className="bg-emerald-50 text-emerald-700 text-[10px]">Live</Badge>
                      ) : isScheduled ? (
                        <Badge className="bg-amber-50 text-amber-700 text-[10px]">Scheduled</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[10px]">Draft</Badge>
                      )}
                    </div>

                    <Link href={`/dashboard/news/${article.id}/edit`} className="font-bold text-sm text-ink line-clamp-2 hover:text-amber transition-colors">
                      {article.title}
                    </Link>
                  </div>

                  <div className="pt-2 border-t border-line text-[11px] text-slate-custom flex items-center justify-between font-mono">
                    <span>
                      {article.publishedAt
                        ? format(new Date(article.publishedAt), "MMM d, yyyy")
                        : "Draft"}
                    </span>
                    <Link href={`/dashboard/news/${article.id}/edit`} className="text-amber font-bold hover:underline flex items-center gap-0.5">
                      Edit <Pencil className="w-2.5 h-2.5" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* 4. PAGINATION FOOTER */}
      {totalPages > 1 && (
        <div className="bg-white p-4 rounded-2xl border border-line shadow-sm flex items-center justify-between">
          <p className="text-xs text-slate-custom font-medium">
            Showing <span className="font-bold text-ink">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to{" "}
            <span className="font-bold text-ink">{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)}</span> of{" "}
            <span className="font-bold text-ink">{filtered.length}</span> articles
          </p>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="h-8 rounded-xl text-xs font-semibold gap-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Previous
            </Button>
            <span className="text-xs font-bold text-ink px-2">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="h-8 rounded-xl text-xs font-semibold gap-1"
            >
              Next <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

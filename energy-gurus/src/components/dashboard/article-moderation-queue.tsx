"use client";

import React, { useState, useTransition } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  ExternalLink,
  Eye,
  User,
  ShieldCheck
} from "lucide-react";
import { adminReviewArticleAction } from "@/lib/actions/news";
import { toast } from "sonner";
import { format } from "date-fns";
import Link from "next/link";
import { FormattedMarkdown } from "@/components/news/formatted-markdown";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export interface ArticleModerationItem {
  id: string;
  title: string;
  category: string;
  content: string;
  imageUrl?: string | null;
  authorName?: string | null;
  authorDesignation?: string | null;
  authorPictureUrl?: string | null;
  isPublished: boolean;
  status: "draft" | "pending_review" | "changes_requested" | "published";
  adminFeedback?: string | null;
  updatedAt: string;
  slug?: string | null;
}

export function ArticleModerationQueue({ articles }: { articles: ArticleModerationItem[] }) {
  const [filter, setFilter] = useState<"pending" | "published" | "all">("pending");
  const [activeFeedbackId, setActiveFeedbackId] = useState<string | null>(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [previewArticle, setPreviewArticle] = useState<ArticleModerationItem | null>(null);
  const [isPending, startTransition] = useTransition();

  const filteredArticles = articles.filter((a) => {
    if (filter === "pending") return a.status === "pending_review";
    if (filter === "published") return a.isPublished || a.status === "published";
    return true;
  });

  const handleApprove = (id: string, title: string) => {
    startTransition(async () => {
      const result = await adminReviewArticleAction(id, "publish");
      if (result.success) {
        toast.success(`Article "${title}" published live!`);
      } else {
        toast.error(result.message);
      }
    });
  };

  const handleRequestChanges = (id: string) => {
    if (!feedbackText.trim()) {
      toast.error("Please provide editorial feedback notes.");
      return;
    }

    startTransition(async () => {
      const result = await adminReviewArticleAction(id, "changes_requested", feedbackText.trim());
      if (result.success) {
        toast.success("Editorial feedback sent to author.");
        setActiveFeedbackId(null);
        setFeedbackText("");
      } else {
        toast.error(result.message);
      }
    });
  };

  const pendingCount = articles.filter((a) => a.status === "pending_review").length;

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant={filter === "pending" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("pending")}
            className="rounded-xl font-bold gap-2 text-xs"
          >
            <Clock className="w-3.5 h-3.5" />
            Pending Publication ({pendingCount})
          </Button>
          <Button
            variant={filter === "published" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("published")}
            className="rounded-xl font-bold text-xs"
          >
            Published Live
          </Button>
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
            className="rounded-xl font-bold text-xs"
          >
            All Articles ({articles.length})
          </Button>
        </div>
      </div>

      {filteredArticles.length === 0 ? (
        <Card className="border border-line rounded-3xl p-12 text-center bg-white shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-paper flex items-center justify-center mx-auto mb-3 text-slate-custom">
            <FileText className="w-6 h-6 opacity-40" />
          </div>
          <h3 className="font-bold text-ink">No articles in this moderation queue</h3>
          <p className="text-xs text-slate-custom mt-1">
            {filter === "pending"
              ? "All submitted articles have been reviewed and processed."
              : "No articles found matching the current filter."}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredArticles.map((art) => {
            return (
              <Card key={art.id} className="border border-line shadow-sm rounded-3xl bg-white overflow-hidden">
                <CardContent className="p-6 md:p-8 space-y-6">
                  {/* Article Header */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-line pb-4">
                    <div className="flex items-start gap-4">
                      {art.imageUrl ? (
                        <img
                          src={art.imageUrl}
                          alt={art.title}
                          className="w-20 h-20 object-cover rounded-2xl border border-line shrink-0"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-paper rounded-2xl border border-line flex items-center justify-center shrink-0">
                          <FileText className="w-8 h-8 text-slate-custom opacity-40" />
                        </div>
                      )}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-[10px] uppercase tracking-wider text-teal bg-teal/10 px-2.5 py-0.5 rounded-full font-bold">
                            {art.category}
                          </span>
                          <Badge
                            className={`rounded-full text-[10px] uppercase font-black tracking-widest ${
                              art.isPublished
                                ? "bg-green-50 text-green-700 border-green-200"
                                : art.status === "pending_review"
                                ? "bg-amber/15 text-amber-deep border-amber/30"
                                : "bg-red-50 text-red-600 border-red-200"
                            }`}
                          >
                            {art.isPublished ? "Live Published" : art.status.replace("_", " ")}
                          </Badge>
                        </div>
                        <h3 className="font-space-grotesk font-bold text-lg text-ink line-clamp-2">
                          {art.title}
                        </h3>
                        <p className="text-xs text-slate-custom font-medium flex items-center gap-2">
                          <User className="w-3.5 h-3.5 text-amber" />
                          <span>Author: <strong>{art.authorName || "Contributing Writer"}</strong></span>
                          {art.authorDesignation && <span>({art.authorDesignation})</span>}
                        </p>
                      </div>
                    </div>

                    <div className="text-xs text-slate-custom font-mono whitespace-nowrap">
                      Updated: {format(new Date(art.updatedAt), "MMM d, yyyy")}
                    </div>
                  </div>

                  {/* Article Excerpt */}
                  <div className="bg-paper/40 p-4 rounded-2xl border border-line text-sm text-slate-700 leading-relaxed max-h-36 overflow-hidden">
                    <FormattedMarkdown content={art.content.slice(0, 320) + (art.content.length > 320 ? "..." : "")} className="text-xs md:text-sm" />
                  </div>

                  {/* Feedback Box if open */}
                  {activeFeedbackId === art.id && (
                    <div className="p-4 rounded-2xl bg-red-50/50 border border-red-200 space-y-3 animate-in fade-in">
                      <label className="text-xs font-bold uppercase tracking-wider text-red-900">
                        Editorial Feedback for Writer
                      </label>
                      <Textarea
                        rows={3}
                        placeholder="Explain required revisions, e.g., 'Please elaborate on the solar tariff data in paragraph 3.'"
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        className="rounded-xl border-red-200 bg-white"
                      />
                      <div className="flex items-center gap-2 justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setActiveFeedbackId(null);
                            setFeedbackText("");
                          }}
                          className="rounded-xl text-xs"
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={isPending}
                          onClick={() => handleRequestChanges(art.id)}
                          className="rounded-xl font-bold text-xs"
                        >
                          {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Send Feedback"}
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Action Bar */}
                  <div className="flex items-center justify-between gap-4 pt-2 border-t border-line">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPreviewArticle(art)}
                        className="rounded-xl text-xs font-bold border-line hover:bg-paper"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1 text-amber" /> Preview Article
                      </Button>
                      {art.slug && art.isPublished && (
                        <Button asChild variant="ghost" size="sm" className="rounded-xl text-xs font-bold text-teal">
                          <Link href={`/news/${art.slug}`} target="_blank">
                            <ExternalLink className="w-3.5 h-3.5 mr-1" /> View Live
                          </Link>
                        </Button>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {!art.isPublished && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={isPending}
                            onClick={() => {
                              setActiveFeedbackId(art.id);
                              setFeedbackText(art.adminFeedback || "");
                            }}
                            className="rounded-xl font-bold border-red-200 text-red-600 hover:bg-red-50"
                          >
                            <AlertTriangle className="w-3.5 h-3.5 mr-1.5" /> Request Changes
                          </Button>
                          <Button
                            size="sm"
                            disabled={isPending}
                            onClick={() => handleApprove(art.id, art.title)}
                            className="rounded-xl font-bold bg-green-700 text-white hover:bg-green-800"
                          >
                            {isPending ? (
                              <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                            ) : (
                              <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                            )}
                            Approve & Publish Live
                          </Button>
                        </>
                      )}

                      {art.isPublished && (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isPending}
                          onClick={() => {
                            setActiveFeedbackId(art.id);
                            setFeedbackText("");
                          }}
                          className="rounded-xl font-bold text-xs text-slate-custom"
                        >
                          Unpublish / Request Edits
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Full Article Preview Dialog Modal */}
      {previewArticle && (
        <Dialog open={!!previewArticle} onOpenChange={(open) => !open && setPreviewArticle(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-6 md:p-10 rounded-3xl bg-white border border-line">
            <DialogHeader className="space-y-3 border-b border-line pb-4">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] uppercase tracking-wider text-teal bg-teal/10 px-2.5 py-0.5 rounded-full font-bold">
                  {previewArticle.category}
                </span>
                <Badge className="rounded-full text-[10px] uppercase font-black">
                  {previewArticle.isPublished ? "Published" : previewArticle.status.replace("_", " ")}
                </Badge>
              </div>
              <DialogTitle className="font-fraunces text-2xl md:text-3xl font-bold text-navy-deep leading-tight">
                {previewArticle.title}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-custom flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-amber" />
                <span>Author: <strong>{previewArticle.authorName || "Contributing Writer"}</strong></span>
                {previewArticle.authorDesignation && <span>({previewArticle.authorDesignation})</span>}
                <span>• Updated: {format(new Date(previewArticle.updatedAt), "MMMM d, yyyy")}</span>
              </DialogDescription>
            </DialogHeader>

            {previewArticle.imageUrl && (
              <div className="my-6 rounded-2xl overflow-hidden border border-line aspect-[21/9] max-h-[360px] bg-slate-950 relative flex items-center justify-center">
                <img
                  src={previewArticle.imageUrl}
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 w-full h-full object-cover blur-lg opacity-40 scale-110 pointer-events-none"
                />
                <img
                  src={previewArticle.imageUrl}
                  alt={previewArticle.title}
                  className="relative z-10 w-full h-full object-contain p-1"
                />
              </div>
            )}

            <div className="py-4">
              <FormattedMarkdown content={previewArticle.content} />
            </div>

            <div className="flex items-center justify-between gap-4 pt-6 border-t border-line mt-6">
              <Button
                variant="outline"
                onClick={() => setPreviewArticle(null)}
                className="rounded-xl font-bold text-xs"
              >
                Close Preview
              </Button>
              <div className="flex items-center gap-2">
                {!previewArticle.isPublished && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const art = previewArticle;
                        setPreviewArticle(null);
                        setActiveFeedbackId(art.id);
                        setFeedbackText(art.adminFeedback || "");
                      }}
                      className="rounded-xl font-bold border-red-200 text-red-600 hover:bg-red-50 text-xs"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 mr-1" /> Request Changes
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        const art = previewArticle;
                        setPreviewArticle(null);
                        handleApprove(art.id, art.title);
                      }}
                      className="rounded-xl font-bold bg-green-700 text-white hover:bg-green-800 text-xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Approve & Publish Live
                    </Button>
                  </>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

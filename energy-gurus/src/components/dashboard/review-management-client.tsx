"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  Star,
  Plus,
  Clock,
  Check,
  X,
  Building2,
  Briefcase,
  FileText,
  ExternalLink,
  AlertCircle,
  Sparkles,
  Award,
  Layers,
  MessageSquare,
  Trash2,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { AdminReviewForm } from "@/components/forms/admin-review-form";
import {
  approveReviewAction,
  rejectReviewAction,
  toggleVerifyReviewAction,
  deleteReviewAction
} from "@/lib/actions/reviews";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export interface ReviewItem {
  id: string;
  rating: number;
  comment: string | null;
  status: "pending" | "approved" | "rejected";
  rejectionReason: string | null;
  proofUrl: string | null;
  authorName: string | null;
  authorEmail: string | null;
  isVerifiedPurchase: boolean;
  targetType: "brand" | "epc";
  targetName: string;
  targetId: string;
  createdAt: string;
}

interface TargetOption {
  id: string;
  name: string;
}

interface ReviewManagementClientProps {
  initialReviews: ReviewItem[];
  allEpcs: TargetOption[];
  allBrands: TargetOption[];
}

export function ReviewManagementClient({
  initialReviews,
  allEpcs,
  allBrands,
}: ReviewManagementClientProps) {
  const router = useRouter();
  const [mainTab, setMainTab] = useState<"moderation" | "benchmarks">("moderation");
  const [moderationStatus, setModerationStatus] = useState<"pending" | "approved" | "rejected">("pending");
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Separate customer reviews from official EnergyGurus benchmark reviews
  const officialBenchmarkReviews = initialReviews.filter(
    (r) =>
      r.status === "approved" &&
      (r.authorName?.toLowerCase().includes("energygurus") ||
        r.authorName?.toLowerCase().includes("super admin") ||
        r.comment?.includes("Official EnergyGurus Team Rating"))
  );

  const customerReviews = initialReviews.filter(
    (r) => !officialBenchmarkReviews.some((b) => b.id === r.id)
  );

  // Metrics
  const totalReviewsCount = customerReviews.length;
  const pendingReviews = customerReviews.filter((r) => r.status === "pending");
  const approvedReviews = customerReviews.filter((r) => r.status === "approved");
  const rejectedReviews = customerReviews.filter((r) => r.status === "rejected");
  const benchmarksCount = officialBenchmarkReviews.length;

  // Reviews to display in moderation queue
  const displayedReviews =
    moderationStatus === "pending"
      ? pendingReviews
      : moderationStatus === "approved"
      ? approvedReviews
      : rejectedReviews;

  // Actions
  const handleApprove = async (id: string) => {
    setProcessingId(id);
    try {
      const res = await approveReviewAction(id);
      if (res.success) {
        toast.success(res.message);
        router.refresh();
      } else {
        toast.error(res.message);
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to approve review");
    } finally {
      setProcessingId(null);
    }
  };

  const handleConfirmReject = async (id: string) => {
    if (!rejectReason.trim()) {
      toast.error("Please enter a rejection reason.");
      return;
    }
    setProcessingId(id);
    try {
      const res = await rejectReviewAction(id, rejectReason);
      if (res.success) {
        toast.success(res.message);
        setRejectingId(null);
        setRejectReason("");
        router.refresh();
      } else {
        toast.error(res.message);
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to reject review");
    } finally {
      setProcessingId(null);
    }
  };

  const handleToggleVerify = async (id: string) => {
    try {
      const res = await toggleVerifyReviewAction(id);
      if (res.success) {
        toast.success(res.message);
        router.refresh();
      } else {
        toast.error(res.message);
      }
    } catch (err: any) {
      toast.error("Failed to toggle verification");
    }
  };

  const handleDelete = async (id: string, targetId: string, targetType: string) => {
    if (!confirm("Are you sure you want to permanently delete this review?")) return;
    try {
      await deleteReviewAction(id, targetId, targetType);
      toast.success("Review deleted successfully");
      router.refresh();
    } catch (err: any) {
      toast.error("Failed to delete review");
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. TOP HEADER & ACTION BUTTON */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 bg-amber text-navy-deep rounded-2xl flex items-center justify-center shrink-0 shadow-md">
            <Star className="w-5 h-5 text-white fill-white" />
          </div>
          <div>
            <h1 className="font-space-grotesk text-2xl md:text-3xl font-bold tracking-tight text-navy-deep">
              Reviews &amp; Ratings Moderation
            </h1>
            <p className="text-slate-custom text-xs md:text-sm mt-0.5 font-ibm-plex-mono">
              Audit customer feedback, verify purchases, and publish official EnergyGurus benchmarks.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            type="button"
            onClick={() => setIsRatingModalOpen(true)}
            className="h-10 px-4 rounded-xl gap-2 font-bold text-xs bg-amber text-navy-deep hover:bg-amber-deep shadow-md font-space-grotesk cursor-pointer transition-all hover:shadow-lg active:scale-98"
          >
            <Plus className="w-4 h-4" />
            Submit Official Rating
          </Button>
        </div>
      </div>

      {/* 2. CONSOLIDATED BENTO METRICS BAR */}
      <div className="bg-white rounded-2xl border border-line shadow-xs overflow-hidden">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-line/60">
          {/* Total Reviews */}
          <div className="p-4 sm:p-5 relative overflow-hidden group hover:bg-paper/40 transition-colors">
            <div className="absolute top-0 left-0 right-0 h-1 bg-navy-deep" />
            <div className="flex items-center justify-between mb-2 pt-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-ibm-plex-mono truncate">
                Customer Reviews
              </span>
              <div className="p-1.5 rounded-lg bg-paper text-navy-deep border border-line/60 group-hover:scale-105 transition-transform">
                <MessageSquare className="w-3.5 h-3.5 text-navy-deep" />
              </div>
            </div>
            <div className="font-space-grotesk text-2xl sm:text-3xl font-black text-navy-deep tracking-tight">
              {totalReviewsCount}
            </div>
            <p className="text-[10.5px] text-slate-400 mt-0.5 font-ibm-plex-mono truncate">Submitted feedback</p>
          </div>

          {/* Pending Reviews */}
          <div className="p-4 sm:p-5 relative overflow-hidden group hover:bg-paper/40 transition-colors">
            <div className="absolute top-0 left-0 right-0 h-1 bg-amber" />
            <div className="flex items-center justify-between mb-2 pt-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-ibm-plex-mono truncate">
                Pending Moderation
              </span>
              <div className="p-1.5 rounded-lg bg-amber/10 text-amber border border-amber/20 group-hover:scale-105 transition-transform">
                <Clock className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="font-space-grotesk text-2xl sm:text-3xl font-black text-amber tracking-tight">
              {pendingReviews.length}
            </div>
            <p className="text-[10.5px] text-slate-400 mt-0.5 font-ibm-plex-mono truncate">Action required</p>
          </div>

          {/* Approved Reviews */}
          <div className="p-4 sm:p-5 relative overflow-hidden group hover:bg-paper/40 transition-colors">
            <div className="absolute top-0 left-0 right-0 h-1 bg-teal" />
            <div className="flex items-center justify-between mb-2 pt-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-ibm-plex-mono truncate">
                Approved &amp; Live
              </span>
              <div className="p-1.5 rounded-lg bg-teal/10 text-teal border border-teal/20 group-hover:scale-105 transition-transform">
                <Check className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="font-space-grotesk text-2xl sm:text-3xl font-black text-teal tracking-tight">
              {approvedReviews.length}
            </div>
            <p className="text-[10.5px] text-slate-400 mt-0.5 font-ibm-plex-mono truncate">Visible on directory</p>
          </div>

          {/* Rejected Reviews */}
          <div className="p-4 sm:p-5 relative overflow-hidden group hover:bg-paper/40 transition-colors">
            <div className="absolute top-0 left-0 right-0 h-1 bg-slate-400" />
            <div className="flex items-center justify-between mb-2 pt-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-ibm-plex-mono truncate">
                Rejected
              </span>
              <div className="p-1.5 rounded-lg bg-slate-100 text-slate-500 border border-slate-200 group-hover:scale-105 transition-transform">
                <X className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="font-space-grotesk text-2xl sm:text-3xl font-black text-slate-700 tracking-tight">
              {rejectedReviews.length}
            </div>
            <p className="text-[10.5px] text-slate-400 mt-0.5 font-ibm-plex-mono truncate">Blocked feedback</p>
          </div>

          {/* Official Benchmarks */}
          <div className="p-4 sm:p-5 relative overflow-hidden group hover:bg-paper/40 transition-colors col-span-2 sm:col-span-1">
            <div className="absolute top-0 left-0 right-0 h-1 bg-amber-deep" />
            <div className="flex items-center justify-between mb-2 pt-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-ibm-plex-mono truncate">
                Team Benchmarks
              </span>
              <div className="p-1.5 rounded-lg bg-amber/10 text-amber-deep border border-amber/25 group-hover:scale-105 transition-transform">
                <Award className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="font-space-grotesk text-2xl sm:text-3xl font-black text-amber-deep tracking-tight">
              {benchmarksCount}
            </div>
            <p className="text-[10.5px] text-slate-400 mt-0.5 font-ibm-plex-mono truncate">Official audit ratings</p>
          </div>
        </div>
      </div>

      {/* 3. MAIN WORKFLOW TABS */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-line pb-4">
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-line/50 text-xs font-ibm-plex-mono">
          <button
            type="button"
            onClick={() => setMainTab("moderation")}
            className={`px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-2 cursor-pointer ${
              mainTab === "moderation"
                ? "bg-white text-navy-deep shadow-xs border border-line/60"
                : "text-slate-500 hover:text-navy-deep"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber" />
            Customer Reviews Moderation ({totalReviewsCount})
          </button>
          <button
            type="button"
            onClick={() => setMainTab("benchmarks")}
            className={`px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-2 cursor-pointer ${
              mainTab === "benchmarks"
                ? "bg-white text-navy-deep shadow-xs border border-line/60"
                : "text-slate-500 hover:text-navy-deep"
            }`}
          >
            <Award className="w-3.5 h-3.5 text-amber-deep" />
            Official Team Benchmarks ({benchmarksCount})
          </button>
        </div>

        {mainTab === "moderation" && (
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-line/50 text-xs font-ibm-plex-mono overflow-x-auto max-w-full">
            <button
              type="button"
              onClick={() => setModerationStatus("pending")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                moderationStatus === "pending"
                  ? "bg-white text-navy-deep shadow-xs border border-line/60"
                  : "text-slate-500 hover:text-navy-deep"
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-amber" />
              Pending ({pendingReviews.length})
            </button>
            <button
              type="button"
              onClick={() => setModerationStatus("approved")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                moderationStatus === "approved"
                  ? "bg-white text-navy-deep shadow-xs border border-line/60"
                  : "text-slate-500 hover:text-navy-deep"
              }`}
            >
              <Check className="w-3.5 h-3.5 text-teal" />
              Approved ({approvedReviews.length})
            </button>
            <button
              type="button"
              onClick={() => setModerationStatus("rejected")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                moderationStatus === "rejected"
                  ? "bg-white text-navy-deep shadow-xs border border-line/60"
                  : "text-slate-500 hover:text-navy-deep"
              }`}
            >
              <X className="w-3.5 h-3.5 text-slate-500" />
              Rejected ({rejectedReviews.length})
            </button>
          </div>
        )}
      </div>

      {/* 4. TAB CONTENT */}
      {mainTab === "moderation" ? (
        <div className="space-y-4">
          {displayedReviews.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 border border-line text-center text-slate-custom font-ibm-plex-mono shadow-xs">
              <AlertCircle className="w-10 h-10 mx-auto mb-2 opacity-20 text-navy-deep" />
              <p className="text-base font-bold text-navy-deep">
                No {moderationStatus} reviews
              </p>
              <p className="text-xs text-slate-custom mt-1 max-w-md mx-auto">
                {moderationStatus === "pending"
                  ? "All customer reviews have been moderated. Newly submitted ratings will appear here."
                  : `There are currently no reviews in ${moderationStatus} status.`}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {displayedReviews.map((rev) => {
                const initials = (rev.authorName || "User").slice(0, 2).toUpperCase();

                return (
                  <div
                    key={rev.id}
                    className="bg-white border border-line shadow-xs rounded-2xl p-5 hover:border-amber/40 hover:shadow-sm transition-all duration-200 space-y-4"
                  >
                    {/* Header */}
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber/10 border border-amber/20 text-navy-deep flex items-center justify-center font-bold text-xs shrink-0 font-space-grotesk">
                          {initials}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm text-navy-deep">
                              {rev.authorName || "Customer"}
                            </h4>
                            {rev.authorEmail && (
                              <span className="text-[11px] text-slate-400 font-mono">
                                ({rev.authorEmail})
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400 font-ibm-plex-mono">
                            Submitted on {new Date(rev.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 flex-wrap">
                        {/* Target Badge */}
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-navy-deep bg-paper border border-line/60 px-3 py-1 rounded-full font-ibm-plex-mono">
                          {rev.targetType === "brand" ? (
                            <Building2 className="w-3.5 h-3.5 text-amber-deep" />
                          ) : (
                            <Briefcase className="w-3.5 h-3.5 text-teal" />
                          )}
                          {rev.targetName}
                        </span>

                        {/* Star Rating */}
                        <div className="flex items-center gap-0.5 text-amber">
                          {Array.from({ length: rev.rating || 5 }).map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-amber" />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Review Comment */}
                    <div className="text-xs md:text-sm text-navy-deep leading-relaxed whitespace-pre-line bg-paper/60 p-4 rounded-xl border border-line/50">
                      {rev.comment}
                    </div>

                    {/* Proof Attachment */}
                    <div className="flex items-center justify-between flex-wrap gap-2 text-xs font-ibm-plex-mono">
                      {rev.proofUrl ? (
                        <a
                          href={rev.proofUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-navy-deep bg-paper border border-line/70 px-3 py-1.5 rounded-lg hover:border-amber transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5 text-amber-deep" />
                          <span>View Invoice / Proof Attachment</span>
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                        </a>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">
                          No proof of purchase document attached
                        </span>
                      )}

                      {rev.isVerifiedPurchase && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal bg-teal/10 border border-teal/20 px-2.5 py-0.5 rounded-full">
                          <ShieldCheck className="w-3.5 h-3.5" /> Verified Customer
                        </span>
                      )}
                    </div>

                    {/* Rejection Notice */}
                    {rev.status === "rejected" && rev.rejectionReason && (
                      <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-xl font-ibm-plex-mono">
                        <strong>Rejection Reason:</strong> {rev.rejectionReason}
                      </div>
                    )}

                    {/* Rejection Input Box */}
                    {rejectingId === rev.id && (
                      <div className="p-4 bg-red-50/60 border border-red-200 rounded-xl space-y-2.5 animate-in fade-in">
                        <label className="block text-xs font-bold text-red-800 font-ibm-plex-mono">
                          State the reason for rejecting this review:
                        </label>
                        <textarea
                          rows={2}
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          placeholder="e.g. Invoice unverified, inappropriate language, or unverified claims."
                          className="w-full text-xs p-2.5 bg-white border border-red-300 rounded-lg focus:outline-none text-navy-deep"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setRejectingId(null);
                              setRejectReason("");
                            }}
                            className="px-3 py-1.5 text-xs text-slate-500 hover:text-navy-deep cursor-pointer font-bold"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleConfirmReject(rev.id)}
                            disabled={processingId === rev.id}
                            className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg cursor-pointer flex items-center gap-1.5 shadow-xs"
                          >
                            {processingId === rev.id ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                            Confirm Rejection
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Actions Footer */}
                    <div className="pt-3 border-t border-line/60 flex items-center justify-between flex-wrap gap-3">
                      <div className="flex items-center gap-2">
                        {rev.status !== "approved" && (
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => handleApprove(rev.id)}
                            disabled={processingId === rev.id}
                            className="h-8 px-3.5 bg-teal text-white hover:bg-teal/90 rounded-lg font-bold text-xs gap-1.5 shadow-xs cursor-pointer"
                          >
                            {processingId === rev.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Check className="w-3.5 h-3.5" />
                            )}
                            Approve &amp; Publish
                          </Button>
                        )}

                        {rev.status !== "rejected" && rejectingId !== rev.id && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setRejectingId(rev.id)}
                            className="h-8 px-3 rounded-lg text-xs font-semibold text-slate-600 hover:text-red-600 hover:bg-red-50 border-line hover:border-red-200"
                          >
                            <X className="w-3.5 h-3.5 mr-1" />
                            Reject with Reason
                          </Button>
                        )}

                        {rev.proofUrl && (
                          <button
                            type="button"
                            onClick={() => handleToggleVerify(rev.id)}
                            className="px-3 py-1.5 text-xs text-slate-500 hover:text-navy-deep border border-line rounded-lg bg-paper cursor-pointer font-ibm-plex-mono"
                          >
                            {rev.isVerifiedPurchase ? "Remove Verified Badge" : "Mark as Verified"}
                          </button>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDelete(rev.id, rev.targetId, rev.targetType)}
                        className="text-xs text-slate-400 hover:text-red-600 cursor-pointer font-ibm-plex-mono"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* OFFICIAL TEAM BENCHMARKS VIEW */
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-line shadow-xs p-5 flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="font-space-grotesk text-base font-bold text-navy-deep flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-deep" />
                EnergyGurus Verified Benchmarks
              </h3>
              <p className="text-xs text-slate-custom mt-0.5 font-ibm-plex-mono">
                Official evaluations submitted by platform technical directors and engineers.
              </p>
            </div>

            <Button
              type="button"
              onClick={() => setIsRatingModalOpen(true)}
              className="h-9 px-3.5 rounded-xl gap-2 font-bold text-xs bg-amber text-navy-deep hover:bg-amber-deep shadow-xs font-space-grotesk cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              New Benchmark Rating
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {officialBenchmarkReviews.map((bench) => (
              <Card
                key={bench.id}
                className="border border-line shadow-xs rounded-2xl p-5 bg-white hover:border-amber/40 hover:shadow-sm transition-all"
              >
                <div className="flex items-center justify-between gap-3 mb-3">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-navy-deep bg-paper border border-line/60 px-3 py-1 rounded-full font-ibm-plex-mono">
                    {bench.targetType === "brand" ? (
                      <Building2 className="w-3.5 h-3.5 text-amber-deep" />
                    ) : (
                      <Briefcase className="w-3.5 h-3.5 text-teal" />
                    )}
                    {bench.targetName}
                  </span>

                  <div className="flex items-center gap-0.5 text-amber">
                    {Array.from({ length: bench.rating || 5 }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber" />
                    ))}
                  </div>
                </div>

                <div className="text-xs text-navy-deep leading-relaxed bg-paper/60 p-3.5 rounded-xl border border-line/50 mb-3">
                  {bench.comment}
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 font-ibm-plex-mono pt-2 border-t border-line/50">
                  <span>Audited on {new Date(bench.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</span>
                  <button
                    type="button"
                    onClick={() => handleDelete(bench.id, bench.targetId, bench.targetType)}
                    className="text-slate-400 hover:text-red-600 cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              </Card>
            ))}

            {officialBenchmarkReviews.length === 0 && (
              <div className="col-span-2 bg-white rounded-2xl p-12 border border-line text-center text-slate-custom font-ibm-plex-mono shadow-xs">
                <Award className="w-10 h-10 mx-auto mb-2 opacity-20 text-navy-deep" />
                <p className="text-base font-bold text-navy-deep">No official benchmark ratings recorded yet</p>
                <p className="text-xs text-slate-custom mt-1">
                  Click &quot;New Benchmark Rating&quot; above to submit verified engineering scorecards.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. SLIDE-OVER MODAL FOR OFFICIAL ENERGYGURUS TEAM RATING */}
      <Dialog open={isRatingModalOpen} onOpenChange={setIsRatingModalOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto p-6 rounded-2xl">
          <DialogHeader className="border-b border-line/60 pb-3">
            <DialogTitle className="font-space-grotesk text-xl font-bold text-navy-deep flex items-center gap-2">
              <Star className="w-5 h-5 text-amber fill-amber" />
              Submit Official EnergyGurus Team Rating
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-custom font-ibm-plex-mono">
              Add verified benchmark ratings for brands or installers evaluated by EnergyGurus technical experts.
            </DialogDescription>
          </DialogHeader>

          <div className="pt-2">
            <AdminReviewForm allEpcs={allEpcs} allBrands={allBrands} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

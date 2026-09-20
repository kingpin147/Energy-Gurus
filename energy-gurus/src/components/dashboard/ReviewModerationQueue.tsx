"use client";

import { useState } from "react";
import {
  Check,
  X,
  Star,
  FileText,
  ShieldCheck,
  Building2,
  Briefcase,
  AlertCircle,
  Clock,
  Loader2,
  ExternalLink
} from "lucide-react";
import { approveReviewAction, rejectReviewAction, toggleVerifyReviewAction, deleteReviewAction } from "@/lib/actions/reviews";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface ReviewItem {
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
  createdAt: string | Date;
}

export function ReviewModerationQueue({ reviews }: { reviews: ReviewItem[] }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"pending" | "approved" | "rejected">("pending");
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  const pendingReviews = reviews.filter((r) => r.status === "pending");
  const approvedReviews = reviews.filter((r) => r.status === "approved");
  const rejectedReviews = reviews.filter((r) => r.status === "rejected");

  const displayedReviews =
    activeTab === "pending"
      ? pendingReviews
      : activeTab === "approved"
      ? approvedReviews
      : rejectedReviews;

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
      }
    } catch (err: any) {
      toast.error("Failed to toggle verification");
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Queue Tabs */}
      <div className="bg-white border border-line rounded-[4px] p-1.5 inline-flex gap-1 shadow-sm">
        <button
          onClick={() => setActiveTab("pending")}
          className={`px-5 py-2 rounded text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === "pending"
              ? "bg-navy-deep text-white shadow-sm"
              : "text-slate-custom hover:text-navy-deep"
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          Pending
          {pendingReviews.length > 0 && (
            <span className="bg-danger text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {pendingReviews.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("approved")}
          className={`px-5 py-2 rounded text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === "approved"
              ? "bg-navy-deep text-white shadow-sm"
              : "text-slate-custom hover:text-navy-deep"
          }`}
        >
          <Check className="w-3.5 h-3.5" />
          Approved ({approvedReviews.length})
        </button>

        <button
          onClick={() => setActiveTab("rejected")}
          className={`px-5 py-2 rounded text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === "rejected"
              ? "bg-navy-deep text-white shadow-sm"
              : "text-slate-custom hover:text-navy-deep"
          }`}
        >
          <X className="w-3.5 h-3.5" />
          Rejected ({rejectedReviews.length})
        </button>
      </div>

      {/* Review Cards List */}
      {displayedReviews.length === 0 ? (
        <div className="text-center py-20 bg-white border border-line rounded-[4px] shadow-sm">
          <AlertCircle className="w-12 h-12 text-slate-custom/30 mx-auto mb-3" />
          <h4 className="font-fraunces font-semibold text-lg text-navy-deep">
            No {activeTab} reviews
          </h4>
          <p className="text-xs text-slate-custom mt-1">
            {activeTab === "pending"
              ? "All submitted reviews have been moderated."
              : `No reviews currently in ${activeTab} status.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedReviews.map((rev) => {
            const initials = (rev.authorName || "User").slice(0, 2).toUpperCase();

            return (
              <div
                key={rev.id}
                className="bg-white border border-line rounded-[4px] p-6 shadow-sm hover:border-amber transition-all space-y-4"
              >
                {/* Review Header */}
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-cream border border-line text-navy-deep flex items-center justify-center font-bold text-xs shrink-0">
                      {initials}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-xs md:text-sm text-navy-deep">
                          {rev.authorName || "Customer"}
                        </h4>
                        {rev.authorEmail && (
                          <span className="text-[11px] text-slate-custom font-normal">
                            ({rev.authorEmail})
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-custom" suppressHydrationWarning>
                        Submitted on {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' }) : "N/A"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-wrap">
                    {/* Target Brand / EPC Tag */}
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-navy-deep bg-cream border border-line px-3 py-1 rounded-full">
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

                {/* Review Text */}
                <div className="text-xs md:text-sm text-ink leading-relaxed whitespace-pre-line bg-paper p-3.5 rounded border border-line/60">
                  {rev.comment}
                </div>

                {/* Proof Attachment Viewer */}
                <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                  {rev.proofUrl ? (
                    <a
                      href={rev.proofUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-navy-deep bg-cream border border-line px-3 py-1.5 rounded hover:border-amber transition-colors"
                    >
                      <FileText className="w-4 h-4 text-amber-deep" />
                      View Uploaded Purchase Proof / Invoice
                      <ExternalLink className="w-3 h-3 text-slate-custom" />
                    </a>
                  ) : (
                    <span className="text-[11px] text-slate-custom italic">
                      No proof of purchase document attached
                    </span>
                  )}

                  {rev.isVerifiedPurchase && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-good bg-good-bg px-2.5 py-0.5 rounded-full">
                      <ShieldCheck className="w-3.5 h-3.5" /> Verified Purchase
                    </span>
                  )}
                </div>

                {/* Rejection Reason Notice */}
                {rev.status === "rejected" && rev.rejectionReason && (
                  <div className="bg-danger-bg border border-danger/30 text-danger text-xs p-3 rounded">
                    <strong>Rejection Reason:</strong> {rev.rejectionReason}
                  </div>
                )}

                {/* Reject Input Panel */}
                {rejectingId === rev.id && (
                  <div className="p-3 bg-danger-bg/50 border border-danger/30 rounded space-y-2 animate-in fade-in">
                    <label className="block text-xs font-bold text-danger">
                      State the reason for rejecting this review:
                    </label>
                    <textarea
                      rows={2}
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="e.g. Invoice could not be verified, or review contains unverified personal claims."
                      className="w-full text-xs p-2 bg-white border border-danger/40 rounded focus:outline-none"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setRejectingId(null);
                          setRejectReason("");
                        }}
                        className="px-3 py-1 text-xs text-slate-custom hover:text-ink cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleConfirmReject(rev.id)}
                        disabled={processingId === rev.id}
                        className="px-4 py-1 bg-danger hover:bg-red-700 text-white font-bold text-xs rounded cursor-pointer flex items-center gap-1"
                      >
                        {processingId === rev.id ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                        Confirm Rejection
                      </button>
                    </div>
                  </div>
                )}

                {/* Admin Actions Footer */}
                <div className="pt-3 border-t border-line flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-2">
                    {rev.status !== "approved" && (
                      <button
                        onClick={() => handleApprove(rev.id)}
                        disabled={processingId === rev.id}
                        className="px-4 py-1.5 bg-good hover:bg-green-700 text-white font-bold text-xs rounded-[3px] transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
                      >
                        {processingId === rev.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                        Approve & Publish
                      </button>
                    )}

                    {rev.status !== "rejected" && rejectingId !== rev.id && (
                      <button
                        onClick={() => setRejectingId(rev.id)}
                        className="px-4 py-1.5 bg-transparent border border-line text-danger hover:bg-danger-bg font-semibold text-xs rounded-[3px] transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <X className="w-3.5 h-3.5" />
                        Reject with Reason
                      </button>
                    )}

                    {rev.proofUrl && (
                      <button
                        onClick={() => handleToggleVerify(rev.id)}
                        className="px-3 py-1.5 text-xs text-slate-custom hover:text-navy-deep border border-line rounded bg-paper cursor-pointer"
                      >
                        {rev.isVerifiedPurchase ? "Remove Verified Badge" : "Mark as Verified Purchase"}
                      </button>
                    )}
                  </div>

                  <button
                    onClick={async () => {
                      if (confirm("Permanently delete this review record?")) {
                        await deleteReviewAction(rev.id, rev.targetId, rev.targetType);
                        toast.success("Review deleted permanently");
                        router.refresh();
                      }
                    }}
                    className="text-xs text-slate-custom hover:text-danger cursor-pointer"
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
  );
}

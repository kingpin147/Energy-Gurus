"use client";

import { useState } from "react";
import { Star, Upload, CheckCircle2, Loader2, X } from "lucide-react";
import { useR2Upload } from "@/lib/hooks/use-r2-upload";
import { submitReview } from "@/lib/actions/reviews";
import { toast } from "sonner";

export function BrandReviewModal({ brandId, brandName }: { brandId: string; brandName: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewerName, setReviewerName] = useState("");
  const [authorEmail, setAuthorEmail] = useState("");
  const [comment, setComment] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { uploadFile, isUploading } = useR2Upload();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast.error("Please provide your review comments.");
      return;
    }

    setIsSubmitting(true);
    try {
      let proofUrl: string | null = null;
      if (proofFile) {
        toast.info("Uploading invoice/proof document to secure storage...");
        const uploadRes = await uploadFile(proofFile, "review-proofs");
        proofUrl = uploadRes.publicUrl;
      }

      const formData = new FormData();
      formData.append("targetId", brandId);
      formData.append("targetType", "brand");
      formData.append("rating", rating.toString());
      formData.append("comment", comment);
      formData.append("reviewerName", reviewerName);
      formData.append("authorEmail", authorEmail);
      if (proofUrl) {
        formData.append("proofUrl", proofUrl);
      }

      const res = await submitReview(formData);
      if (res.success) {
        toast.success(res.message);
        setIsOpen(false);
        setComment("");
        setProofFile(null);
      } else {
        toast.error(res.message || "Failed to submit review.");
      }
    } catch (err: any) {
      toast.error(err?.message || "An error occurred while submitting.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2.5 bg-paper/10 border border-white/25 text-white hover:bg-white hover:text-navy-deep font-semibold text-xs md:text-sm rounded-[3px] transition-all cursor-pointer inline-flex items-center gap-2"
      >
        <Star className="w-4 h-4 text-amber fill-amber" />
        Write a Review
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-deep/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[4px] border border-line shadow-2xl max-w-lg w-full p-6 md:p-8 relative max-h-[90vh] overflow-y-auto">
            
            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute right-5 top-5 text-slate-custom hover:text-ink cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="mb-6">
              <span className="text-[11px] font-bold text-amber-deep uppercase tracking-wider">
                Community Feedback
              </span>
              <h3 className="font-fraunces text-2xl font-bold text-navy-deep mt-1">
                Review {brandName}
              </h3>
              <p className="text-xs text-slate-custom mt-1">
                Share your experience regarding performance, warranty claims, and build quality.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Star Rating Selector */}
              <div>
                <label className="block text-xs font-bold text-navy-deep mb-1.5 uppercase tracking-wider">
                  Overall Rating
                </label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 text-2xl focus:outline-none transition-transform hover:scale-110 cursor-pointer"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          (hoverRating || rating) >= star
                            ? "fill-amber text-amber"
                            : "text-line"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-3 text-sm font-bold text-navy-deep">
                    {rating} / 5 Stars
                  </span>
                </div>
              </div>

              {/* Name & Email Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-navy-deep mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Asad Ullah"
                    value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                    className="w-full text-xs p-2.5 bg-paper border border-line rounded-[3px] text-ink focus:border-amber focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-navy-deep mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="your.email@example.com"
                    value={authorEmail}
                    onChange={(e) => setAuthorEmail(e.target.value)}
                    className="w-full text-xs p-2.5 bg-paper border border-line rounded-[3px] text-ink focus:border-amber focus:outline-none"
                  />
                </div>
              </div>

              {/* Review Text */}
              <div>
                <label className="block text-xs font-semibold text-navy-deep mb-1">
                  Detailed Review
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="How long have you used this equipment? How was the inverter efficiency or after-sales claim support?"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full text-xs p-3 bg-paper border border-line rounded-[3px] text-ink focus:border-amber focus:outline-none resize-none leading-relaxed"
                />
              </div>

              {/* Verified Purchase Proof Upload to R2 */}
              <div className="bg-cream p-4 rounded-[3px] border border-dashed border-line">
                <div className="flex items-start gap-3">
                  <Upload className="w-5 h-5 text-amber-deep shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-navy-deep">
                      Optional: Proof of Purchase / Installation Warranty Card
                    </label>
                    <p className="text-[11px] text-slate-custom mt-0.5">
                      Upload invoice or warranty document to receive a <strong className="text-good">"Verified Purchase"</strong> badge.
                    </p>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                      className="mt-2 text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-[3px] file:border-0 file:text-xs file:font-semibold file:bg-navy file:text-white hover:file:bg-navy-deep file:cursor-pointer text-slate-custom"
                    />
                    {proofFile && (
                      <span className="block mt-1 text-[11px] text-good font-semibold">
                        Selected: {proofFile.name} ({(proofFile.size / 1024).toFixed(0)} KB)
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-line">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  disabled={isSubmitting || isUploading}
                  className="px-4 py-2 text-xs font-semibold text-slate-custom hover:text-ink cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isUploading}
                  className="px-5 py-2.5 bg-amber hover:bg-amber-deep text-navy-deep font-bold text-xs rounded-[3px] transition-colors cursor-pointer flex items-center gap-2"
                >
                  {(isSubmitting || isUploading) ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Review"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

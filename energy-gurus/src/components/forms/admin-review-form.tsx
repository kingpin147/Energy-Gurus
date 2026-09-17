"use client";

import { useState } from "react";
import { submitAdminReview } from "@/lib/actions/reviews";
import { toast } from "sonner";
import { Star, Send, Building2, Briefcase } from "lucide-react";
import { useRouter } from "next/navigation";

interface TargetOption {
  id: string;
  name: string;
}

interface AdminReviewFormProps {
  allEpcs: TargetOption[];
  allBrands: TargetOption[];
}

export function AdminReviewForm({ allEpcs, allBrands }: AdminReviewFormProps) {
  const router = useRouter();
  const [targetType, setTargetType] = useState<"brand" | "epc">("brand");
  const [loading, setLoading] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState("");
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");

  const currentOptions = targetType === "brand" ? allBrands : allEpcs;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedTarget) {
      toast.error(`Please select a ${targetType === "epc" ? "Solar Installer" : "Solar Brand"}.`);
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("targetId", selectedTarget);
      formData.append("targetType", targetType);
      formData.append("rating", rating.toString());
      formData.append("comment", comment);

      const res = await submitAdminReview(formData);
      if (res.success) {
        toast.success(res.message);
        setComment("");
        setSelectedTarget("");
        router.refresh();
      } else {
        toast.error(res.message || "Failed to submit review");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      
      {/* Target Type Toggle */}
      <div>
        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-custom mb-2">
          Target Entity Type
        </label>
        <div className="inline-flex rounded-[3px] border border-line p-1 bg-cream gap-1">
          <button
            type="button"
            onClick={() => {
              setTargetType("brand");
              setSelectedTarget("");
            }}
            className={`px-4 py-1.5 rounded text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              targetType === "brand"
                ? "bg-navy-deep text-white shadow-sm"
                : "text-slate-custom hover:text-navy-deep"
            }`}
          >
            <Building2 className="w-3.5 h-3.5" /> Solar Brand ({allBrands.length})
          </button>
          <button
            type="button"
            onClick={() => {
              setTargetType("epc");
              setSelectedTarget("");
            }}
            className={`px-4 py-1.5 rounded text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              targetType === "epc"
                ? "bg-navy-deep text-white shadow-sm"
                : "text-slate-custom hover:text-navy-deep"
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" /> EPC Installer ({allEpcs.length})
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Select Target Dropdown */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-custom mb-1.5">
            Select {targetType === "epc" ? "Certified Installer" : "Solar Brand"}
          </label>
          <select
            value={selectedTarget}
            onChange={(e) => setSelectedTarget(e.target.value)}
            required
            className="w-full px-3.5 py-2.5 border border-line rounded-[3px] text-xs font-semibold text-ink bg-paper focus:outline-none focus:border-amber cursor-pointer"
          >
            <option value="" disabled>
              Choose a {targetType === "epc" ? "Installer" : "Brand"}...
            </option>
            {currentOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.name}
              </option>
            ))}
          </select>
        </div>

        {/* Rating Stars */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-custom mb-1.5">
            Official Rating (1 to 5 Stars)
          </label>
          <div className="flex items-center gap-1 h-[38px]">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-1 text-amber transition-transform hover:scale-110 cursor-pointer"
              >
                <Star
                  className={`w-6 h-6 ${
                    star <= (hoverRating || rating) ? "fill-amber text-amber" : "text-line"
                  }`}
                />
              </button>
            ))}
            <span className="ml-2 font-bold text-xs text-navy-deep">
              {rating}.0 Stars
            </span>
          </div>
        </div>
      </div>

      {/* Review Comment */}
      <div>
        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-custom mb-1.5">
          Official Review & Evaluation Assessment
        </label>
        <textarea
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={`Enter official technical assessment and quality benchmark notes for this ${targetType === "epc" ? "installer" : "brand"}...`}
          className="w-full p-3 border border-line rounded-[3px] text-xs text-ink bg-paper focus:outline-none focus:border-amber leading-relaxed"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="px-5 py-2.5 bg-amber hover:bg-amber-deep text-navy-deep font-bold text-xs rounded-[3px] transition-colors flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
      >
        <Send className="w-3.5 h-3.5" />
        {loading ? "Submitting Rating..." : `Submit Team Rating for ${targetType === "epc" ? "Installer" : "Brand"}`}
      </button>
    </form>
  );
}

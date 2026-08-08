"use client";

import { useState } from "react";
import { submitAdminReview } from "@/lib/actions/reviews";
import { toast } from "sonner";
import { Star, Send } from "lucide-react";

interface TargetOption {
  id: string;
  name: string;
}

interface AdminReviewFormProps {
  targetType: "epc" | "brand";
  options: TargetOption[];
}

export function AdminReviewForm({ targetType, options }: AdminReviewFormProps) {
  const [loading, setLoading] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState("");
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");

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
    <form onSubmit={handleSubmit} className="bg-white border border-line rounded-2xl p-6 shadow-sm space-y-5">
      <div className="border-b border-line pb-3">
        <h3 className="font-space-grotesk font-bold text-lg text-ink">
          Give Official EnergyGurus Team Rating ({targetType === "epc" ? "Installer" : "Brand"})
        </h3>
        <p className="text-xs text-slate-custom mt-1">
          This rating will reflect on the target&apos;s public profile under &quot;EnergyGurus Team Rating&quot;.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Select Target */}
        <div>
          <label className="block font-ibm-plex-mono text-[0.72rem] tracking-[0.06em] uppercase text-slate-custom mb-2">
            Select {targetType === "epc" ? "Installer / EPC" : "Solar Brand"}
          </label>
          <select
            value={selectedTarget}
            onChange={(e) => setSelectedTarget(e.target.value)}
            required
            className="w-full px-3.5 py-2.5 border border-line rounded-lg font-sans text-sm text-graphite bg-paper focus:outline-none focus:border-amber cursor-pointer"
          >
            <option value="" disabled>
              Select a {targetType === "epc" ? "Certified Installer" : "Brand"}...
            </option>
            {options.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.name}
              </option>
            ))}
          </select>
        </div>

        {/* Rating Stars */}
        <div>
          <label className="block font-ibm-plex-mono text-[0.72rem] tracking-[0.06em] uppercase text-slate-custom mb-2">
            Team Rating (1 to 5 Stars)
          </label>
          <div className="flex items-center gap-1 h-[42px]">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-1 text-yellow-500 transition-transform hover:scale-110"
              >
                <Star
                  className={`w-6 h-6 ${
                    star <= (hoverRating || rating) ? "fill-current text-yellow-500" : "text-gray-300"
                  }`}
                />
              </button>
            ))}
            <span className="ml-2 font-ibm-plex-mono font-bold text-sm text-ink">
              {rating}.0 Stars
            </span>
          </div>
        </div>
      </div>

      {/* Review Comment */}
      <div>
        <label className="block font-ibm-plex-mono text-[0.72rem] tracking-[0.06em] uppercase text-slate-custom mb-2">
          Official Review / Assessment Comments
        </label>
        <textarea
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={`Enter official team assessment for this ${targetType === "epc" ? "installer" : "brand"}...`}
          className="w-full p-3 border border-line rounded-lg font-sans text-sm text-graphite bg-paper focus:outline-none focus:border-amber"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="px-6 py-2.5 bg-amber text-ink rounded-lg font-bold text-sm hover:bg-[#f2b458] transition-colors flex items-center gap-2 disabled:opacity-50"
      >
        <Send className="w-4 h-4" />
        {loading ? "Submitting Rating..." : `Submit Team Rating for ${targetType === "epc" ? "Installer" : "Brand"}`}
      </button>
    </form>
  );
}

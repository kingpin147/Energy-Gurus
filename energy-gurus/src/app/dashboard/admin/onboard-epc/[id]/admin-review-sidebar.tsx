"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { adminUpdateEpcStatusAction } from "@/lib/actions/admin-epc-actions";
import { Eye, ExternalLink, Loader2, CheckCircle2 } from "lucide-react";

export function AdminReviewSidebar({ epcId }: { epcId: string }) {
  const [decision, setDecision] = useState<string | null>(null);
  const [internalNote, setInternalNote] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDecision = async (type: string) => {
    setLoading(true);
    try {
      let res;
      if (type === "approved-gold") {
        res = await adminUpdateEpcStatusAction(epcId, "live", internalNote, "gold");
      } else if (type === "approved-silver") {
        res = await adminUpdateEpcStatusAction(epcId, "live", internalNote, "silver");
      } else if (type === "changes") {
        res = await adminUpdateEpcStatusAction(epcId, "changes_requested", internalNote);
      } else if (type === "rejected") {
        res = await adminUpdateEpcStatusAction(epcId, "draft", internalNote);
      }

      if (res?.success) {
        setDecision(type);
        toast.success(res.message);
        router.refresh();
      } else {
        toast.error(res?.message || "Failed to update decision");
      }
    } catch (err: any) {
      toast.error(err?.message || "An error occurred");
    } finally {
      setLoading(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="sidebar sticky top-[84px] self-start space-y-4 font-sans">
      
      {decision && (
        <div className={`decision-banner ${
          decision.startsWith("approved") ? "approved bg-[rgba(47,110,98,0.1)] text-teal" :
          decision === "rejected" ? "rejected bg-[rgba(179,67,43,0.08)] text-[#B3432B]" :
          "changes bg-[rgba(232,163,61,0.12)] text-[#a3711c]"
        } p-3.5 rounded-md text-[0.88rem] font-semibold text-center mb-4 border border-line`}>
          {decision === "approved-gold" && "✓ Approved for Gold Verification — Profile is now LIVE on the Installer Directory."}
          {decision === "approved-silver" && "✓ Approved for Silver Verification — Profile is now LIVE on the Installer Directory."}
          {decision === "changes" && "↺ Changes requested — Applicant notified to resubmit missing items."}
          {decision === "rejected" && "✕ Application rejected — Kept private and applicant notified."}
        </div>
      )}

      {/* Live Site Preview Card */}
      <div className="sidebar-card bg-white border border-line rounded-lg p-5 shadow-sm">
        <h3 className="text-[0.92rem] text-ink mb-1.5 font-semibold flex items-center gap-2">
          <Eye className="w-4 h-4 text-blue-600" /> Public Profile View
        </h3>
        <p className="text-xs text-slate-custom mb-3">
          Preview exactly how this EPC profile looks to visitors on the live site before approving.
        </p>
        <button
          onClick={() => window.open(`/epcs/${epcId}`, "_blank")}
          className="w-full py-2 px-3 bg-paper hover:bg-slate-100 border border-line rounded text-xs font-bold text-navy-deep flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <span>Preview Live Site Page</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="sidebar-card bg-white border border-line rounded-lg p-5 shadow-sm">
        <h3 className="text-[0.92rem] text-ink mb-3.5 font-semibold">Verification Checklist</h3>
        <ul className="checklist space-y-2">
          <li className="flex items-center gap-2 text-[0.86rem] text-graphite pb-1.5 border-b border-line last:border-0"><span className="dot pass w-2 h-2 rounded-full bg-teal shrink-0"></span> AEDB licence — verified</li>
          <li className="flex items-center gap-2 text-[0.86rem] text-graphite pb-1.5 border-b border-line last:border-0"><span className="dot pass w-2 h-2 rounded-full bg-teal shrink-0"></span> PEC licence — verified</li>
          <li className="flex items-center gap-2 text-[0.86rem] text-graphite pb-1.5 border-b border-line last:border-0"><span className="dot pass w-2 h-2 rounded-full bg-teal shrink-0"></span> CNIC / registration matches</li>
          <li className="flex items-center gap-2 text-[0.86rem] text-graphite pb-1.5 border-b border-line last:border-0"><span className="dot pass w-2 h-2 rounded-full bg-teal shrink-0"></span> Certificates uploaded &amp; checked</li>
          <li className="flex items-center gap-2 text-[0.86rem] text-graphite pb-1.5 border-b border-line last:border-0"><span className="dot pass w-2 h-2 rounded-full bg-teal shrink-0"></span> Coordinates verified on map</li>
        </ul>
      </div>

      <div className="sidebar-card bg-white border border-line rounded-lg p-5 shadow-sm">
        <h3 className="text-[0.92rem] text-ink mb-3.5 font-semibold">Internal Note</h3>
        <div className="note-field">
          <label className="block font-ibm-plex-mono text-[0.7rem] tracking-[0.05em] uppercase text-slate-custom mb-2">Visible only to Admin team</label>
          <textarea 
            value={internalNote}
            onChange={(e) => setInternalNote(e.target.value)}
            placeholder="e.g. Confirmed AEDB licence via public registry..."
            className="w-full min-h-[90px] p-3 border border-line rounded bg-paper text-[0.88rem] text-graphite resize-y focus:outline-none focus:ring-2 focus:ring-amber"
          ></textarea>
        </div>
      </div>

      <div className="sidebar-card bg-white border border-line rounded-lg p-5 flex flex-col gap-2.5 shadow-sm">
        <h3 className="text-[0.92rem] text-ink mb-1 font-semibold">Decision</h3>
        <button 
          disabled={loading}
          className="action-btn w-full p-3 rounded text-[0.9rem] font-semibold text-center bg-amber text-ink hover:bg-[#f2b458] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer" 
          onClick={() => handleDecision("approved-gold")}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "✓ Approve — Gold Tier"}
        </button>
        <button 
          disabled={loading}
          className="action-btn w-full p-3 rounded text-[0.9rem] font-semibold text-center bg-teal text-white hover:bg-[#255950] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer" 
          onClick={() => handleDecision("approved-silver")}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "✓ Approve — Silver Tier Only"}
        </button>
        <button 
          disabled={loading}
          className="action-btn w-full p-3 rounded text-[0.9rem] font-semibold text-center bg-transparent text-ink border border-line hover:border-ink transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer" 
          onClick={() => handleDecision("changes")}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "↺ Request Changes"}
        </button>
        <button 
          disabled={loading}
          className="action-btn w-full p-3 rounded text-[0.9rem] font-semibold text-center bg-[rgba(179,67,43,0.08)] text-[#B3432B] hover:bg-[rgba(179,67,43,0.15)] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer" 
          onClick={() => handleDecision("rejected")}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "✕ Reject Application"}
        </button>
      </div>
    </div>
  );
}

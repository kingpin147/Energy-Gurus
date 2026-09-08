"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function AdminReviewSidebar({ epcId }: { epcId: string }) {
  const [decision, setDecision] = useState<string | null>(null);
  const router = useRouter();

  const handleDecision = (type: string) => {
    setDecision(type);
    toast.success(`Decision recorded: ${type}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="sidebar sticky top-[84px] self-start space-y-4">
      
      {decision && (
        <div className={`decision-banner ${
          decision.startsWith("approved") ? "approved bg-[rgba(47,110,98,0.1)] text-teal" :
          decision === "rejected" ? "rejected bg-[rgba(179,67,43,0.08)] text-[#B3432B]" :
          "changes bg-[rgba(232,163,61,0.12)] text-[#a3711c]"
        } p-3.5 rounded-md text-[0.88rem] font-semibold text-center mb-4`}>
          {decision === "approved-gold" && "✓ Approved for Gold Verification — profile will be published to the Installer Directory and the applicant will be notified."}
          {decision === "approved-silver" && "✓ Approved for Silver Verification only — profile will be published and the applicant notified of the tier decision."}
          {decision === "changes" && "↺ Changes requested — the applicant has been notified and can resubmit missing items."}
          {decision === "rejected" && "✕ Application rejected — the applicant has been notified via email with the internal note shared as the reason."}
        </div>
      )}

      <div className="sidebar-card bg-white border border-line rounded-lg p-5">
        <h3 className="text-[0.92rem] text-ink mb-3.5 font-semibold">Verification Checklist</h3>
        <ul className="checklist space-y-2">
          <li className="flex items-center gap-2 text-[0.86rem] text-graphite pb-1.5 border-b border-line last:border-0"><span className="dot pass w-2 h-2 rounded-full bg-teal shrink-0"></span> AEDB licence — verified</li>
          <li className="flex items-center gap-2 text-[0.86rem] text-graphite pb-1.5 border-b border-line last:border-0"><span className="dot pass w-2 h-2 rounded-full bg-teal shrink-0"></span> PEC licence — verified</li>
          <li className="flex items-center gap-2 text-[0.86rem] text-graphite pb-1.5 border-b border-line last:border-0"><span className="dot pass w-2 h-2 rounded-full bg-teal shrink-0"></span> CNIC / registration matches</li>
          <li className="flex items-center gap-2 text-[0.86rem] text-graphite pb-1.5 border-b border-line last:border-0"><span className="dot warn w-2 h-2 rounded-full bg-amber shrink-0"></span> 1 brand certificate missing</li>
          <li className="flex items-center gap-2 text-[0.86rem] text-graphite pb-1.5 border-b border-line last:border-0"><span className="dot pass w-2 h-2 rounded-full bg-teal shrink-0"></span> Coordinates verified on map</li>
        </ul>
      </div>

      <div className="sidebar-card bg-white border border-line rounded-lg p-5">
        <h3 className="text-[0.92rem] text-ink mb-3.5 font-semibold">Internal Note</h3>
        <div className="note-field">
          <label className="block font-ibm-plex-mono text-[0.7rem] tracking-[0.05em] uppercase text-slate-custom mb-2">Visible only to Admin team</label>
          <textarea 
            placeholder="e.g. Confirmed AEDB licence via public registry..."
            className="w-full min-h-[90px] p-3 border border-line rounded bg-paper text-[0.88rem] text-graphite resize-y focus:outline-none focus:ring-2 focus:ring-amber"
          ></textarea>
        </div>
      </div>

      <div className="sidebar-card bg-white border border-line rounded-lg p-5 flex flex-col gap-2.5">
        <h3 className="text-[0.92rem] text-ink mb-1 font-semibold">Decision</h3>
        <button className="action-btn w-full p-3 rounded text-[0.9rem] font-semibold text-center bg-amber text-ink hover:bg-[#f2b458]" onClick={() => handleDecision("approved-gold")}>
          ✓ Approve — Gold Tier
        </button>
        <button className="action-btn w-full p-3 rounded text-[0.9rem] font-semibold text-center bg-teal text-white hover:bg-[#255950]" onClick={() => handleDecision("approved-silver")}>
          ✓ Approve — Silver Tier Only
        </button>
        <button className="action-btn w-full p-3 rounded text-[0.9rem] font-semibold text-center bg-transparent text-ink border border-line hover:border-ink" onClick={() => handleDecision("changes")}>
          ↺ Request Changes
        </button>
        <button className="action-btn w-full p-3 rounded text-[0.9rem] font-semibold text-center bg-[rgba(179,67,43,0.08)] text-[#B3432B] hover:bg-[rgba(179,67,43,0.15)]" onClick={() => handleDecision("rejected")}>
          ✕ Reject Application
        </button>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { adminUpdateEpcStatusAction, adminSaveEgTeamRatingsAction } from "@/lib/actions/admin-epc-actions";
import { Eye, ExternalLink, Loader2, CheckCircle2, Award, ShieldCheck, Star } from "lucide-react";

interface AdminReviewSidebarProps {
  epcId: string;
  initialEgTeamRatings?: {
    physicalVerification?: number;
    officeVisited?: number;
    siteVisited?: number;
    projectsVerified?: number;
    afterSalesSystem?: number;
  } | null;
  initialEgRating?: string | null;
}

export function AdminReviewSidebar({ epcId, initialEgTeamRatings, initialEgRating }: AdminReviewSidebarProps) {
  const [decision, setDecision] = useState<string | null>(null);
  const [internalNote, setInternalNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [ratingSaving, setRatingSaving] = useState(false);
  const router = useRouter();

  // 5 Grounds Rating State (1 to 10)
  const [physicalVerification, setPhysicalVerification] = useState<number>(initialEgTeamRatings?.physicalVerification ?? 9);
  const [officeVisited, setOfficeVisited] = useState<number>(initialEgTeamRatings?.officeVisited ?? 9);
  const [siteVisited, setSiteVisited] = useState<number>(initialEgTeamRatings?.siteVisited ?? 9);
  const [projectsVerified, setProjectsVerified] = useState<number>(initialEgTeamRatings?.projectsVerified ?? 9);
  const [afterSalesSystem, setAfterSalesSystem] = useState<number>(initialEgTeamRatings?.afterSalesSystem ?? 9);
  const [currentEgRating, setCurrentEgRating] = useState<string>(initialEgRating ?? "9.0");

  const computedAverage = (
    (physicalVerification + officeVisited + siteVisited + projectsVerified + afterSalesSystem) / 5
  ).toFixed(1);

  const handleSaveRatings = async () => {
    setRatingSaving(true);
    try {
      const res = await adminSaveEgTeamRatingsAction(
        epcId,
        {
          physicalVerification,
          officeVisited,
          siteVisited,
          projectsVerified,
          afterSalesSystem,
        },
        internalNote
      );

      if (res.success) {
        setCurrentEgRating(res.score || computedAverage);
        toast.success(res.message);
        router.refresh();
      } else {
        toast.error(res.message);
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to save ratings");
    } finally {
      setRatingSaving(false);
    }
  };

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

      {/* EnergyGurus Team Rating Card (5 Grounds - 1 to 10) */}
      <div className="sidebar-card bg-white border-2 border-amber/30 rounded-lg p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-line pb-2.5">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-deep" />
            <h3 className="text-[0.92rem] text-navy-deep font-bold">EnergyGurus Team Assessment</h3>
          </div>
          <span className="font-fraunces text-base font-bold text-amber-deep bg-amber/15 px-2.5 py-0.5 rounded border border-amber/40">
            {computedAverage} / 10
          </span>
        </div>
        <p className="text-[11px] text-slate-custom leading-tight">
          Rated on 5 grounds (Duly Verified by Supervisor Account). 1 is lowest, 10 is best.
        </p>

        <div className="space-y-2.5 text-xs pt-1">
          <div>
            <div className="flex justify-between font-semibold mb-1">
              <span>1. Physical Verification (Certs/AEDB/PEC/ISO)</span>
              <span className="font-bold text-amber-deep">{physicalVerification}/10</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={physicalVerification}
              onChange={(e) => setPhysicalVerification(Number(e.target.value))}
              className="w-full accent-amber cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between font-semibold mb-1">
              <span>2. Office Visited</span>
              <span className="font-bold text-amber-deep">{officeVisited}/10</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={officeVisited}
              onChange={(e) => setOfficeVisited(Number(e.target.value))}
              className="w-full accent-amber cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between font-semibold mb-1">
              <span>3. Active Sites Visited (Min 2 Sites)</span>
              <span className="font-bold text-amber-deep">{siteVisited}/10</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={siteVisited}
              onChange={(e) => setSiteVisited(Number(e.target.value))}
              className="w-full accent-amber cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between font-semibold mb-1">
              <span>4. Projects &amp; Testimonials Verified Genuine</span>
              <span className="font-bold text-amber-deep">{projectsVerified}/10</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={projectsVerified}
              onChange={(e) => setProjectsVerified(Number(e.target.value))}
              className="w-full accent-amber cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between font-semibold mb-1">
              <span>5. After Sales System</span>
              <span className="font-bold text-amber-deep">{afterSalesSystem}/10</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={afterSalesSystem}
              onChange={(e) => setAfterSalesSystem(Number(e.target.value))}
              className="w-full accent-amber cursor-pointer"
            />
          </div>
        </div>

        <button
          type="button"
          disabled={ratingSaving}
          onClick={handleSaveRatings}
          className="w-full mt-2 py-2 px-3 bg-navy hover:bg-navy-deep text-white rounded text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          {ratingSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
          <span>Save Assessment ({computedAverage}/10)</span>
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
            placeholder="e.g. Confirmed AEDB licence via public registry, sites physically inspected..."
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

"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Check,
  X,
  Briefcase,
  Clock,
  AlertTriangle,
  MapPin,
  CheckCircle2,
  ExternalLink,
  Eye,
  Loader2,
  Phone,
  Mail,
  MessageSquare
} from "lucide-react";
import { adminUpdateEpcStatusAction } from "@/lib/actions/admin-epc-actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface EpcItem {
  id: string;
  companyName: string;
  logoUrl: string | null;
  status: "draft" | "pending_review" | "changes_requested" | "live";
  city: string | null;
  country: string | null;
  website: string | null;
  email: string | null;
  contactNo: string | null;
  about: string | null;
  adminFeedback: string | null;
  isVerified: boolean;
  tier: string;
  createdAt: string | Date;
}

export function EpcModerationQueue({ epcs }: { epcs: EpcItem[] }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"pending" | "live" | "changes_requested" | "drafts">("pending");
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  const pendingEpcs = epcs.filter((b) => b.status === "pending_review");
  const liveEpcs = epcs.filter((b) => b.status === "live");
  const changesRequestedEpcs = epcs.filter((b) => b.status === "changes_requested");
  const draftEpcs = epcs.filter((b) => b.status === "draft");

  const displayedEpcs =
    activeTab === "pending"
      ? pendingEpcs
      : activeTab === "live"
      ? liveEpcs
      : activeTab === "changes_requested"
      ? changesRequestedEpcs
      : draftEpcs;

  const handleApprove = async (id: string) => {
    setProcessingId(id);
    try {
      const res = await adminUpdateEpcStatusAction(id, "live");
      if (res.success) {
        toast.success(res.message);
        router.refresh();
      } else {
        toast.error(res.message);
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to approve EPC Installer");
    } finally {
      setProcessingId(null);
    }
  };

  const handleConfirmReject = async (id: string) => {
    if (!rejectReason.trim()) {
      toast.error("Please enter a rejection / feedback reason for the installer.");
      return;
    }
    setProcessingId(id);
    try {
      const res = await adminUpdateEpcStatusAction(id, "changes_requested", rejectReason);
      if (res.success) {
        toast.success(res.message);
        setRejectingId(null);
        setRejectReason("");
        router.refresh();
      } else {
        toast.error(res.message);
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to request changes");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Queue Tabs */}
      <div className="bg-white border border-line rounded-[4px] p-1.5 inline-flex flex-wrap gap-1 shadow-sm">
        <button
          onClick={() => setActiveTab("pending")}
          className={`px-5 py-2 rounded text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === "pending"
              ? "bg-navy-deep text-white shadow-sm"
              : "text-slate-custom hover:text-navy-deep"
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          Pending Submissions
          {pendingEpcs.length > 0 && (
            <span className="bg-danger text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {pendingEpcs.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("live")}
          className={`px-5 py-2 rounded text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === "live"
              ? "bg-navy-deep text-white shadow-sm"
              : "text-slate-custom hover:text-navy-deep"
          }`}
        >
          <Check className="w-3.5 h-3.5" />
          Live & Published ({liveEpcs.length})
        </button>

        <button
          onClick={() => setActiveTab("changes_requested")}
          className={`px-5 py-2 rounded text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === "changes_requested"
              ? "bg-navy-deep text-white shadow-sm"
              : "text-slate-custom hover:text-navy-deep"
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          Changes Requested ({changesRequestedEpcs.length})
        </button>

        <button
          onClick={() => setActiveTab("drafts")}
          className={`px-5 py-2 rounded text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === "drafts"
              ? "bg-navy-deep text-white shadow-sm"
              : "text-slate-custom hover:text-navy-deep"
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" />
          Drafts / In Progress ({draftEpcs.length})
        </button>
      </div>

      {/* EPC Submissions List */}
      {displayedEpcs.length === 0 ? (
        <div className="text-center py-20 bg-white border border-line rounded-[4px] shadow-sm">
          <Briefcase className="w-12 h-12 text-slate-custom/30 mx-auto mb-3" />
          <h4 className="font-fraunces font-semibold text-lg text-navy-deep">
            No {activeTab === "pending" ? "pending" : activeTab === "live" ? "live" : activeTab === "changes_requested" ? "changes requested" : "draft"} installers
          </h4>
          <p className="text-xs text-slate-custom mt-1">
            {activeTab === "pending"
              ? "All submitted installer profiles have been moderated."
              : activeTab === "drafts"
              ? "No installers currently have drafts in progress."
              : `No installer profiles currently in this list.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedEpcs.map((b) => (
            <div
              key={b.id}
              className="bg-white border border-line rounded-[4px] p-6 shadow-sm hover:border-amber transition-all space-y-4"
            >
              {/* Top Row: Info */}
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded bg-navy text-white font-fraunces font-bold text-xl flex items-center justify-center shrink-0 border border-navy-deep overflow-hidden">
                    {b.logoUrl ? (
                      <Image src={b.logoUrl} alt={b.companyName} width={56} height={56} className="object-contain p-1 bg-white" />
                    ) : (
                      b.companyName.slice(0, 2).toUpperCase()
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-fraunces font-bold text-base md:text-lg text-navy-deep">
                        {b.companyName}
                      </h3>
                      {b.isVerified && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-amber/15 text-amber-deep border border-amber/30 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" /> Verified
                        </span>
                      )}
                      {b.tier !== 'unverified' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200 px-2 py-0.5 rounded-full capitalize">
                          {b.tier}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-custom mt-1">
                      {b.city && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-custom/70" /> {b.city}, {b.country || 'Pakistan'}
                        </span>
                      )}
                      <span suppressHydrationWarning>
                        • Created {b.createdAt ? new Date(b.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "Recently"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status Badge */}
                <div>
                  {b.status === "live" && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold bg-good-bg text-good border border-good/30 px-3 py-1 rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Live & Published
                    </span>
                  )}
                  {b.status === "pending_review" && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold bg-amber/15 text-amber-deep border border-amber/40 px-3 py-1 rounded-full">
                      <Clock className="w-3.5 h-3.5" /> Pending Admin Review
                    </span>
                  )}
                  {b.status === "changes_requested" && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold bg-danger-bg text-danger border border-danger/30 px-3 py-1 rounded-full">
                      <AlertTriangle className="w-3.5 h-3.5" /> Changes Requested
                    </span>
                  )}
                  {b.status === "draft" && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold bg-gray-100 text-slate-custom border border-gray-300 px-3 py-1 rounded-full">
                      <Clock className="w-3.5 h-3.5 text-slate-custom" /> Draft (In Progress)
                    </span>
                  )}
                </div>
              </div>

              {/* Profile Overview */}
              <p className="text-xs md:text-sm text-ink leading-relaxed bg-paper p-3.5 rounded border border-line/60 line-clamp-2">
                {b.about || "No description provided yet."}
              </p>

              {/* Stats & Metadata Row */}
              <div className="flex items-center justify-between flex-wrap gap-4 text-xs text-slate-custom pt-2 border-t border-line/70">
                <div className="flex items-center gap-4">
                  {b.email && (
                    <span className="flex items-center gap-1 font-semibold text-navy-deep">
                      <Mail className="w-4 h-4 text-amber-deep" /> {b.email}
                    </span>
                  )}
                  {b.contactNo && (
                    <span className="flex items-center gap-1 font-semibold text-navy-deep">
                      <Phone className="w-4 h-4 text-teal" /> {b.contactNo}
                    </span>
                  )}
                </div>

                {b.website && (
                  <a
                    href={b.website.startsWith('http') ? b.website : `https://${b.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-navy-deep hover:text-amber-deep font-semibold"
                  >
                    Website <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              {/* Existing Feedback Notice */}
              {b.adminFeedback && (
                <div className="bg-danger-bg border border-danger/30 text-danger text-xs p-3 rounded space-y-1">
                  <strong className="flex items-center gap-1.5 font-bold">
                    <MessageSquare className="w-3.5 h-3.5" /> Feedback sent to installer:
                  </strong>
                  <p className="whitespace-pre-line text-danger/90">{b.adminFeedback}</p>
                </div>
              )}

              {/* Rejection / Request Changes Form Panel */}
              {rejectingId === b.id && (
                <div className="p-4 bg-danger-bg/50 border border-danger/30 rounded space-y-3 animate-in fade-in">
                  <label className="block text-xs font-bold text-danger">
                    Specify the changes or missing details required from the installer:
                  </label>
                  <textarea
                    rows={3}
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="e.g. Please upload a clear profile picture or business license document."
                    className="w-full text-xs p-2.5 bg-white border border-danger/40 rounded focus:outline-none leading-relaxed"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => {
                        setRejectingId(null);
                        setRejectReason("");
                      }}
                      className="px-3.5 py-1.5 text-xs text-slate-custom hover:text-ink cursor-pointer font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleConfirmReject(b.id)}
                      disabled={processingId === b.id}
                      className="px-4 py-1.5 bg-danger hover:bg-red-700 text-white font-bold text-xs rounded cursor-pointer flex items-center gap-1.5 shadow-sm"
                    >
                      {processingId === b.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                      Confirm Rejection & Send Feedback
                    </button>
                  </div>
                </div>
              )}

              {/* Admin Actions Footer */}
              <div className="pt-3 border-t border-line flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  {b.status !== "live" && (
                    <button
                      onClick={() => handleApprove(b.id)}
                      disabled={processingId === b.id}
                      className="px-4 py-1.5 bg-good hover:bg-green-700 text-white font-bold text-xs rounded-[3px] transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
                    >
                      {processingId === b.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                      Approve & Publish Live
                    </button>
                  )}

                  {b.status !== "changes_requested" && rejectingId !== b.id && (
                    <button
                      onClick={() => setRejectingId(b.id)}
                      className="px-4 py-1.5 bg-transparent border border-line text-danger hover:bg-danger-bg font-semibold text-xs rounded-[3px] transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <X className="w-3.5 h-3.5" />
                      Request Changes / Reject
                    </button>
                  )}
                </div>

                <Link
                  href={`/epcs/${b.id}`}
                  target="_blank"
                  className="text-xs text-navy-deep font-bold hover:text-amber-deep flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" /> Preview Public Page
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

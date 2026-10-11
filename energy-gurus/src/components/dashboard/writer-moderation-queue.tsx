"use client";

import React, { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  ShieldCheck,
  Clock,
  AlertTriangle,
  User,
  Briefcase,
  Linkedin,
  Facebook,
  Instagram,
  Twitter,
  Music,
  CheckCircle2,
  XCircle,
  Loader2,
  ExternalLink
} from "lucide-react";
import { adminUpdateWriterProfileStatusAction } from "@/lib/actions/writer-profile";
import { toast } from "sonner";
import { format } from "date-fns";

export interface WriterModerationItem {
  id: string;
  userId: string;
  name: string;
  email: string;
  pictureUrl?: string | null;
  designation?: string | null;
  bio?: string | null;
  socialLinks?: {
    linkedin?: string;
    facebook?: string;
    instagram?: string;
    twitter?: string;
    tiktok?: string;
  } | null;
  status: "draft" | "pending_review" | "changes_requested" | "approved";
  adminFeedback?: string | null;
  updatedAt: string;
}

export function WriterModerationQueue({ writers }: { writers: WriterModerationItem[] }) {
  const [filter, setFilter] = useState<"pending" | "all" | "approved">("pending");
  const [activeFeedbackId, setActiveFeedbackId] = useState<string | null>(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [isPending, startTransition] = useTransition();

  const filteredWriters = writers.filter((w) => {
    if (filter === "pending") return w.status === "pending_review";
    if (filter === "approved") return w.status === "approved";
    return true;
  });

  const handleApprove = (id: string, name: string) => {
    startTransition(async () => {
      const result = await adminUpdateWriterProfileStatusAction(id, "approved");
      if (result.success) {
        toast.success(`Writer profile for "${name}" approved successfully!`);
      } else {
        toast.error(result.message);
      }
    });
  };

  const handleRequestChanges = (id: string) => {
    if (!feedbackText.trim()) {
      toast.error("Please provide feedback notes explaining what changes are required.");
      return;
    }

    startTransition(async () => {
      const result = await adminUpdateWriterProfileStatusAction(id, "changes_requested", feedbackText.trim());
      if (result.success) {
        toast.success("Feedback sent and changes requested.");
        setActiveFeedbackId(null);
        setFeedbackText("");
      } else {
        toast.error(result.message);
      }
    });
  };

  const pendingCount = writers.filter((w) => w.status === "pending_review").length;

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
            Pending Review ({pendingCount})
          </Button>
          <Button
            variant={filter === "approved" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("approved")}
            className="rounded-xl font-bold text-xs"
          >
            Approved
          </Button>
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
            className="rounded-xl font-bold text-xs"
          >
            All Writers ({writers.length})
          </Button>
        </div>
      </div>

      {filteredWriters.length === 0 ? (
        <Card className="border border-line rounded-3xl p-12 text-center bg-white shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-paper flex items-center justify-center mx-auto mb-3 text-slate-custom">
            <User className="w-6 h-6 opacity-40" />
          </div>
          <h3 className="font-bold text-ink">No writer profiles in this queue</h3>
          <p className="text-xs text-slate-custom mt-1">
            {filter === "pending"
              ? "All submitted writer profiles have been reviewed."
              : "No writer profiles found matching the current filter."}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredWriters.map((writer) => {
            const bioWords = writer.bio?.trim() ? writer.bio.trim().split(/\s+/).filter(Boolean).length : 0;
            const socials = writer.socialLinks || {};

            return (
              <Card key={writer.id} className="border border-line shadow-sm rounded-3xl bg-white overflow-hidden">
                <CardContent className="p-6 md:p-8 space-y-6">
                  {/* Top Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-amber/10 border border-line flex items-center justify-center font-bold text-xl text-amber overflow-hidden shrink-0">
                        {writer.pictureUrl ? (
                          <img src={writer.pictureUrl} alt={writer.name} className="w-full h-full object-cover" />
                        ) : (
                          writer.name.substring(0, 2).toUpperCase()
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-space-grotesk font-bold text-lg text-ink">{writer.name}</h3>
                          <Badge
                            className={`rounded-full text-[10px] uppercase font-black tracking-widest ${
                              writer.status === "approved"
                                ? "bg-green-50 text-green-700 border-green-200"
                                : writer.status === "pending_review"
                                ? "bg-amber/15 text-amber-deep border-amber/30"
                                : "bg-red-50 text-red-600 border-red-200"
                            }`}
                          >
                            {writer.status.replace("_", " ")}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-custom font-medium mt-0.5 flex items-center gap-2">
                          <span>{writer.email}</span>
                          {writer.designation && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Briefcase className="w-3 h-3 text-amber" /> {writer.designation}
                              </span>
                            </>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="text-xs text-slate-custom font-mono">
                      Updated: {format(new Date(writer.updatedAt), "MMM d, yyyy")}
                    </div>
                  </div>

                  {/* Bio & Word Count */}
                  <div className="bg-paper/40 p-4 rounded-2xl border border-line space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-custom">
                        Short Intro / Bio
                      </span>
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                          bioWords >= 50 && bioWords <= 100
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-red-50 text-red-600 border-red-200"
                        }`}
                      >
                        {bioWords} words (Target: 50–100)
                      </span>
                    </div>
                    <p className="text-sm text-graphite leading-relaxed">
                      {writer.bio || "No intro provided."}
                    </p>
                  </div>

                  {/* Connected Social Handles */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-custom">
                      Connected Social Handles (At least 2 required)
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      {socials.linkedin ? (
                        <a
                          href={socials.linkedin.startsWith("http") ? socials.linkedin : `https://${socials.linkedin}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-600 text-xs font-bold hover:bg-blue-100"
                        >
                          <Linkedin className="w-3.5 h-3.5" /> LinkedIn <ExternalLink className="w-3 h-3 opacity-60" />
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400 border border-dashed rounded-xl px-2.5 py-1">No LinkedIn</span>
                      )}

                      {socials.facebook ? (
                        <a
                          href={socials.facebook.startsWith("http") ? socials.facebook : `https://${socials.facebook}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 text-xs font-bold hover:bg-blue-100"
                        >
                          <Facebook className="w-3.5 h-3.5" /> Facebook <ExternalLink className="w-3 h-3 opacity-60" />
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400 border border-dashed rounded-xl px-2.5 py-1">No Facebook</span>
                      )}

                      {socials.instagram ? (
                        <a
                          href={socials.instagram.startsWith("http") ? socials.instagram : `https://${socials.instagram}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pink-50 text-pink-600 text-xs font-bold hover:bg-pink-100"
                        >
                          <Instagram className="w-3.5 h-3.5" /> Instagram <ExternalLink className="w-3 h-3 opacity-60" />
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400 border border-dashed rounded-xl px-2.5 py-1">No Instagram</span>
                      )}

                      {socials.twitter ? (
                        <a
                          href={socials.twitter.startsWith("http") ? socials.twitter : `https://${socials.twitter}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-900 text-xs font-bold hover:bg-slate-200"
                        >
                          <Twitter className="w-3.5 h-3.5" /> X / Twitter <ExternalLink className="w-3 h-3 opacity-60" />
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400 border border-dashed rounded-xl px-2.5 py-1">No X</span>
                      )}

                      {socials.tiktok ? (
                        <a
                          href={socials.tiktok.startsWith("http") ? socials.tiktok : `https://${socials.tiktok}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-900 text-xs font-bold hover:bg-slate-200"
                        >
                          <Music className="w-3.5 h-3.5" /> TikTok <ExternalLink className="w-3 h-3 opacity-60" />
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400 border border-dashed rounded-xl px-2.5 py-1">No TikTok</span>
                      )}
                    </div>
                  </div>

                  {/* Feedback Box if open */}
                  {activeFeedbackId === writer.id && (
                    <div className="p-4 rounded-2xl bg-red-50/50 border border-red-200 space-y-3 animate-in fade-in">
                      <label className="text-xs font-bold uppercase tracking-wider text-red-900">
                        Admin Feedback Note (Will be displayed to writer)
                      </label>
                      <Textarea
                        rows={3}
                        placeholder="Explain required changes, e.g., 'Please provide at least 2 working social URLs and expand your bio to 50 words.'"
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
                          onClick={() => handleRequestChanges(writer.id)}
                          className="rounded-xl font-bold text-xs"
                        >
                          {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Send Feedback & Request Changes"}
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Action Bar */}
                  <div className="flex items-center justify-between gap-4 pt-3 border-t border-line">
                    <span className="text-xs text-slate-custom">
                      {writer.status === "approved"
                        ? "✓ Verified author credentials."
                        : "Requires approval before articles can be created/published."}
                    </span>

                    <div className="flex items-center gap-2">
                      {writer.status !== "approved" && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={isPending}
                            onClick={() => {
                              setActiveFeedbackId(writer.id);
                              setFeedbackText(writer.adminFeedback || "");
                            }}
                            className="rounded-xl font-bold border-red-200 text-red-600 hover:bg-red-50"
                          >
                            <AlertTriangle className="w-3.5 h-3.5 mr-1.5" /> Request Changes
                          </Button>
                          <Button
                            size="sm"
                            disabled={isPending}
                            onClick={() => handleApprove(writer.id, writer.name)}
                            className="rounded-xl font-bold bg-green-700 text-white hover:bg-green-800"
                          >
                            {isPending ? (
                              <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                            ) : (
                              <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                            )}
                            Approve Profile
                          </Button>
                        </>
                      )}

                      {writer.status === "approved" && (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isPending}
                          onClick={() => {
                            setActiveFeedbackId(writer.id);
                            setFeedbackText("");
                          }}
                          className="rounded-xl font-bold text-xs text-slate-custom"
                        >
                          Revoke / Request Changes
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
    </div>
  );
}

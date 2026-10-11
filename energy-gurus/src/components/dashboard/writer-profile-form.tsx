"use client";

import React, { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { saveWriterProfile } from "@/lib/actions/writer-profile";
import { toast } from "sonner";
import {
  User,
  Briefcase,
  Linkedin,
  Facebook,
  Instagram,
  Twitter,
  Music,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Loader2,
  ShieldCheck,
  FileText
} from "lucide-react";
import { UploadZone } from "@/components/ui/upload-zone";
import { useR2Upload } from "@/lib/hooks/use-r2-upload";
import Link from "next/link";

interface WriterProfileFormProps {
  initialProfile?: {
    id?: string;
    name: string;
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
  } | null;
  userEmail: string;
}

export function WriterProfileForm({ initialProfile, userEmail }: WriterProfileFormProps) {
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState(initialProfile?.name || "");
  const [designation, setDesignation] = useState(initialProfile?.designation || "");
  const [pictureUrl, setPictureUrl] = useState(initialProfile?.pictureUrl || "");
  const [bio, setBio] = useState(initialProfile?.bio || "");

  // Social Links
  const [linkedin, setLinkedin] = useState(initialProfile?.socialLinks?.linkedin || "");
  const [facebook, setFacebook] = useState(initialProfile?.socialLinks?.facebook || "");
  const [instagram, setInstagram] = useState(initialProfile?.socialLinks?.instagram || "");
  const [twitter, setTwitter] = useState(initialProfile?.socialLinks?.twitter || "");
  const [tiktok, setTiktok] = useState(initialProfile?.socialLinks?.tiktok || "");

  const { uploadFile, isUploading } = useR2Upload();

  // Word count calculation
  const words = bio.trim() ? bio.trim().split(/\s+/).filter(Boolean) : [];
  const wordCount = words.length;
  const isWordCountValid = wordCount >= 50 && wordCount <= 100;

  // Social links validation count
  const filledSocialsCount = [linkedin, facebook, instagram, twitter, tiktok].filter(
    (url) => url.trim().length > 0
  ).length;
  const hasMinSocials = filledSocialsCount >= 2;

  const status = initialProfile?.status || "draft";

  const handleAvatarUpload = async (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image exceeds maximum allowed size of 10 MB. Please upload a smaller image.");
      return;
    }
    try {
      const { publicUrl } = await uploadFile(file, "writer-avatars");
      setPictureUrl(publicUrl);
      toast.success("Profile avatar uploaded successfully");
    } catch (err: any) {
      toast.error(err?.message || "Failed to upload avatar");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter your author name.");
      return;
    }

    if (!isWordCountValid) {
      toast.error(`Short intro must be between 50 and 100 words. (Currently: ${wordCount} words)`);
      return;
    }

    if (!hasMinSocials) {
      toast.error("Please connect at least 2 social media handles (LinkedIn, Facebook, Instagram, X, or TikTok).");
      return;
    }

    const formData = new FormData();
    formData.set("name", name.trim());
    formData.set("designation", designation.trim());
    formData.set("pictureUrl", pictureUrl.trim());
    formData.set("bio", bio.trim());
    formData.set("linkedin", linkedin.trim());
    formData.set("facebook", facebook.trim());
    formData.set("instagram", instagram.trim());
    formData.set("twitter", twitter.trim());
    formData.set("tiktok", tiktok.trim());

    startTransition(async () => {
      const result = await saveWriterProfile(formData);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* STATUS BANNER */}
      {status === "approved" && (
        <div className="p-5 rounded-2xl bg-green-50 border border-green-200 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-green-100 text-green-700 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-green-900">Writer Profile Approved & Verified</h4>
            <p className="text-sm text-green-700 mt-0.5 leading-relaxed">
              Your author credentials are approved. You can now write and submit articles. Note that updating your
              profile will re-submit it for quick administrative approval.
            </p>
            <div className="mt-3">
              <Button asChild size="sm" className="bg-green-700 text-white hover:bg-green-800 rounded-xl font-bold">
                <Link href="/dashboard/writer/articles/new">
                  <FileText className="w-4 h-4 mr-1.5" /> Write New Article
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}

      {status === "pending_review" && (
        <div className="p-5 rounded-2xl bg-amber/15 border border-amber/30 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber/20 text-amber-deep flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-amber-deep">Profile In Editorial Review</h4>
            <p className="text-sm text-slate-custom mt-0.5 leading-relaxed">
              Your profile has been submitted to the EnergyGurus administration team. Once approved, your article
              writing access will be unlocked and your articles can be submitted for publication.
            </p>
          </div>
        </div>
      )}

      {status === "changes_requested" && (
        <div className="p-5 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-red-900">Admin Feedback & Changes Requested</h4>
            <p className="text-sm text-red-700 mt-1 leading-relaxed bg-white/60 p-3 rounded-lg border border-red-200">
              {initialProfile?.adminFeedback || "Please review and complete the required social links and bio words."}
            </p>
            <p className="text-xs text-red-600 mt-2">
              Please address the notes above and resubmit your profile below for approval.
            </p>
          </div>
        </div>
      )}

      {status === "draft" && (
        <div className="p-5 rounded-2xl bg-paper/60 border border-line flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-paper text-slate-custom flex items-center justify-center shrink-0">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-ink">Set Up Your Contributing Writer Profile</h4>
            <p className="text-sm text-slate-custom mt-0.5 leading-relaxed">
              Complete your profile details below with at least <strong>2 social media handles</strong> and a{" "}
              <strong>50–100 word short intro</strong>. Once approved by our team, your author badge and name will be
              credited on all your published articles.
            </p>
          </div>
        </div>
      )}

      {/* FORM */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* SECTION 1: Personal Details */}
        <Card className="border border-line shadow-sm rounded-3xl bg-white overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-line pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="w-5 h-5 text-amber" />
              Writer Identity & Designation
            </CardTitle>
            <CardDescription>
              This information will be displayed as the official author of your articles.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 md:p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-slate-custom">
                  Author Display Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="e.g. Dr. Muhammad Zafar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="rounded-xl h-11 border-line bg-paper/5 focus:ring-amber"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="designation" className="text-xs font-bold uppercase tracking-wider text-slate-custom">
                  Designation / Professional Title
                </Label>
                <Input
                  id="designation"
                  placeholder="e.g. Renewable Energy Consultant, Senior Columnist"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  className="rounded-xl h-11 border-line bg-paper/5 focus:ring-amber"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-custom">
                Profile Photo / Avatar (Max 10 MB)
              </Label>
              <UploadZone
                onUpload={handleAvatarUpload}
                isUploading={isUploading}
                value={pictureUrl}
                title="Upload Profile Picture"
                description="Square image recommended (JPG, PNG, WebP up to 10MB)"
                maxSizeMB={10}
                accept="image/*"
              />
            </div>
          </CardContent>
        </Card>

        {/* SECTION 2: 50–100 Word Short Intro */}
        <Card className="border border-line shadow-sm rounded-3xl bg-white overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-line pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5 text-amber" />
                  Short Author Intro / Bio
                </CardTitle>
                <CardDescription>
                  A concise 50 to 100-word introduction about your expertise and background.
                </CardDescription>
              </div>
              <div
                className={`px-3 py-1 rounded-full text-xs font-bold border transition-colors ${
                  isWordCountValid
                    ? "bg-green-50 text-green-700 border-green-200"
                    : wordCount > 100
                    ? "bg-red-50 text-red-600 border-red-200"
                    : "bg-amber/10 text-amber-deep border-amber/20"
                }`}
              >
                {wordCount} / 100 words {isWordCountValid ? "✓ Valid" : "(Required: 50–100)"}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 md:p-8 space-y-3">
            <Textarea
              rows={5}
              placeholder="Write a brief professional intro explaining your industry background, solar or renewable energy focus, and writing credentials..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="rounded-xl border-line bg-paper/5 focus:ring-amber leading-relaxed"
            />
            <div className="flex items-center justify-between text-xs text-slate-custom">
              <span>Must be between 50 and 100 words.</span>
              <span className={wordCount < 50 ? "text-amber-deep font-bold" : wordCount > 100 ? "text-red-500 font-bold" : "text-green-600 font-bold"}>
                {wordCount < 50 ? `${50 - wordCount} more words required` : wordCount > 100 ? `${wordCount - 100} words over limit` : "Within required range"}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* SECTION 3: Social Media Handles (At Least 2 Required) */}
        <Card className="border border-line shadow-sm rounded-3xl bg-white overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-line pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Linkedin className="w-5 h-5 text-amber" />
                  Social Media Handles
                </CardTitle>
                <CardDescription>
                  At least <strong>2 social handles are mandatory</strong>. Others are optional.
                </CardDescription>
              </div>
              <div
                className={`px-3 py-1 rounded-full text-xs font-bold border ${
                  hasMinSocials
                    ? "bg-green-50 text-green-700 border-green-200"
                    : "bg-red-50 text-red-600 border-red-200"
                }`}
              >
                {filledSocialsCount} of 2 required connected
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 md:p-8 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* LinkedIn */}
              <div className="space-y-2">
                <Label htmlFor="linkedin" className="text-xs font-bold uppercase tracking-wider text-slate-custom flex items-center gap-1.5">
                  <Linkedin className="w-4 h-4 text-blue-600" /> LinkedIn Profile
                </Label>
                <Input
                  id="linkedin"
                  placeholder="https://linkedin.com/in/username"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  className="rounded-xl h-11 border-line bg-paper/5 focus:ring-amber"
                />
              </div>

              {/* Facebook */}
              <div className="space-y-2">
                <Label htmlFor="facebook" className="text-xs font-bold uppercase tracking-wider text-slate-custom flex items-center gap-1.5">
                  <Facebook className="w-4 h-4 text-blue-700" /> Facebook Profile
                </Label>
                <Input
                  id="facebook"
                  placeholder="https://facebook.com/username"
                  value={facebook}
                  onChange={(e) => setFacebook(e.target.value)}
                  className="rounded-xl h-11 border-line bg-paper/5 focus:ring-amber"
                />
              </div>

              {/* Instagram */}
              <div className="space-y-2">
                <Label htmlFor="instagram" className="text-xs font-bold uppercase tracking-wider text-slate-custom flex items-center gap-1.5">
                  <Instagram className="w-4 h-4 text-pink-600" /> Instagram Handle / URL
                </Label>
                <Input
                  id="instagram"
                  placeholder="https://instagram.com/username"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  className="rounded-xl h-11 border-line bg-paper/5 focus:ring-amber"
                />
              </div>

              {/* X / Twitter */}
              <div className="space-y-2">
                <Label htmlFor="twitter" className="text-xs font-bold uppercase tracking-wider text-slate-custom flex items-center gap-1.5">
                  <Twitter className="w-4 h-4 text-slate-900" /> X / Twitter Profile
                </Label>
                <Input
                  id="twitter"
                  placeholder="https://x.com/username"
                  value={twitter}
                  onChange={(e) => setTwitter(e.target.value)}
                  className="rounded-xl h-11 border-line bg-paper/5 focus:ring-amber"
                />
              </div>

              {/* TikTok */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="tiktok" className="text-xs font-bold uppercase tracking-wider text-slate-custom flex items-center gap-1.5">
                  <Music className="w-4 h-4 text-slate-900" /> TikTok Profile
                </Label>
                <Input
                  id="tiktok"
                  placeholder="https://tiktok.com/@username"
                  value={tiktok}
                  onChange={(e) => setTiktok(e.target.value)}
                  className="rounded-xl h-11 border-line bg-paper/5 focus:ring-amber"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SUBMIT BUTTON */}
        <div className="flex items-center justify-between gap-4 pt-4 border-t border-line">
          <p className="text-xs text-slate-custom">
            All submitted profile updates are sent to the administrative review queue before taking effect.
          </p>

          <Button
            type="submit"
            disabled={isPending || isUploading}
            className="rounded-xl font-bold h-12 px-8 bg-amber text-ink hover:bg-amber/90 shadow-lg shadow-amber/20"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting for Review...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" /> Submit Profile for Approval
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

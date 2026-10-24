"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { onboardWriterAction } from "@/lib/actions/admin-writer-actions";
import { UploadZone } from "@/components/ui/upload-zone";
import { useR2Upload } from "@/lib/hooks/use-r2-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  UserCheck,
  User,
  Mail,
  Briefcase,
  Linkedin,
  Facebook,
  Instagram,
  Twitter,
  Music,
  CheckCircle2,
  Copy,
  Loader2,
  Check
} from "lucide-react";

export function WriterOnboardingForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);
  const [createdWriterName, setCreatedWriterName] = useState<string>("");
  const [hasCopiedPassword, setHasCopiedPassword] = useState(false);

  const { uploadFile, isUploading } = useR2Upload();
  const [pictureUrl, setPictureUrl] = useState("");
  const [bio, setBio] = useState("");

  // Word count check
  const words = bio.trim() ? bio.trim().split(/\s+/).filter(Boolean) : [];
  const wordCount = words.length;

  const handleAvatarUpload = async (file: File) => {
    try {
      const { publicUrl } = await uploadFile(file, "writer-avatars");
      setPictureUrl(publicUrl);
      toast.success("Author avatar uploaded successfully");
    } catch (error) {
      toast.error("Failed to upload avatar");
    }
  };

  const handleCopyPassword = () => {
    if (!generatedPassword) return;
    navigator.clipboard.writeText(generatedPassword);
    setHasCopiedPassword(true);
    toast.success("Password copied to clipboard!");
    setTimeout(() => setHasCopiedPassword(false), 2500);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formEl = e.currentTarget;
      const formData = new FormData(formEl);

      if (pictureUrl) {
        formData.set("pictureUrl", pictureUrl);
      }
      formData.set("bio", bio.trim());

      const nameVal = formData.get("name") as string;
      const res = await onboardWriterAction(formData);

      if (res.success) {
        setCreatedWriterName(nameVal || "Writer");
        setGeneratedPassword(res.password || null);
        setIsSubmitted(true);
        toast.success(res.message);
        router.refresh();
      } else {
        toast.error(res.message || "Failed to onboard writer");
      }
    } catch (err: any) {
      toast.error(err?.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="bg-white border border-line rounded-3xl p-8 md:p-12 text-center max-w-2xl mx-auto space-y-6 shadow-sm">
        <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-ink">Contributing Writer Onboarded!</h2>
          <p className="text-sm text-slate-custom">
            <strong>{createdWriterName}</strong> has been registered with an approved author credentials profile and can now publish or be assigned articles.
          </p>
        </div>

        {generatedPassword && (
          <div className="bg-paper p-6 rounded-2xl border border-line text-left space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-custom">
                Generated Account Password
              </span>
              <span className="text-xs text-amber font-bold">Share with Author</span>
            </div>
            <div className="flex items-center gap-3">
              <Input
                readOnly
                value={generatedPassword}
                className="font-mono text-sm bg-white border-line select-all"
              />
              <Button
                type="button"
                onClick={handleCopyPassword}
                variant="outline"
                className="rounded-xl shrink-0 gap-2 font-bold"
              >
                {hasCopiedPassword ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" /> Copy
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        <div className="flex items-center justify-center gap-4 pt-4">
          <Button
            type="button"
            onClick={() => {
              setIsSubmitted(false);
              setGeneratedPassword(null);
              setBio("");
              setPictureUrl("");
            }}
            variant="outline"
            className="rounded-xl font-bold"
          >
            Onboard Another Writer
          </Button>
          <Button
            type="button"
            onClick={() => router.push("/dashboard/admin/onboard-writer")}
            className="bg-amber text-ink hover:bg-amber/90 rounded-xl font-bold"
          >
            View Onboarded Writers Table
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto pb-12">
      {/* 1. Account & Author Details */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-line shadow-sm space-y-6">
        <div className="border-b border-line pb-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber/15 text-amber-deep flex items-center justify-center">
            <UserCheck className="w-5 h-5 text-amber" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-ink">1. Author Identity & Account Credentials</h3>
            <p className="text-xs text-slate-custom">Primary login email, author byline name, and professional title.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-slate-custom">
              Author Email Address <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-custom absolute left-3.5 top-1/2 -translate-y-1/2" />
              <Input
                id="email"
                name="email"
                type="email"
                required
                placeholder="writer@energygurus.online"
                className="pl-10 h-11 rounded-xl bg-slate-50 border-line text-sm"
              />
            </div>
            <p className="text-[11px] text-slate-custom">Used for login. A secure 16-character password will be auto-generated.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-slate-custom">
              Author Display Name <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-custom absolute left-3.5 top-1/2 -translate-y-1/2" />
              <Input
                id="name"
                name="name"
                required
                placeholder="e.g. Engr. Faisal Hameed"
                className="pl-10 h-11 rounded-xl bg-slate-50 border-line text-sm font-semibold"
              />
            </div>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="designation" className="text-xs font-bold uppercase tracking-wider text-slate-custom">
              Professional Designation / Credential
            </Label>
            <div className="relative">
              <Briefcase className="w-4 h-4 text-slate-custom absolute left-3.5 top-1/2 -translate-y-1/2" />
              <Input
                id="designation"
                name="designation"
                placeholder="e.g. Renewable Energy Policy Specialist & Former AEDB Consultant"
                className="pl-10 h-11 rounded-xl bg-slate-50 border-line text-sm"
              />
            </div>
          </div>

          {/* Author Picture */}
          <div className="space-y-2 md:col-span-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-custom">
              Author Headshot Photo
            </Label>
            <UploadZone
              onUpload={handleAvatarUpload}
              isUploading={isUploading}
              value={pictureUrl}
              title="Upload Author Photo"
              description="PNG or JPG format, square aspect ratio recommended"
              accept="image/*"
            />
          </div>

          {/* Author Bio */}
          <div className="space-y-2 md:col-span-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="bio" className="text-xs font-bold uppercase tracking-wider text-slate-custom">
                Short Author Bio / Intro
              </Label>
              <span className={`text-xs font-mono font-bold ${wordCount >= 50 && wordCount <= 100 ? "text-emerald-600" : "text-amber-800"}`}>
                {wordCount} words (50–100 recommended)
              </span>
            </div>
            <Textarea
              id="bio"
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Engr. Faisal Hameed has over 12 years of hands-on experience in photovoltaic system engineering and power grid modernization across Pakistan. He regularly writes on tariff structures, net-metering dynamics, and commercial rooftop solar ROI for national energy publications..."
              className="rounded-xl bg-slate-50 border-line text-sm"
            />
          </div>
        </div>
      </div>

      {/* 2. Social Media Handles */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-line shadow-sm space-y-6">
        <div className="border-b border-line pb-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Linkedin className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-ink">2. Social Media Handles & Profiles</h3>
            <p className="text-xs text-slate-custom">Connected public handles displayed with the author&apos;s published articles.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-custom uppercase flex items-center gap-1.5">
              <Linkedin className="w-3.5 h-3.5 text-blue-700" /> LinkedIn Profile URL
            </Label>
            <Input
              name="linkedin"
              placeholder="https://linkedin.com/in/author-profile"
              className="h-10 rounded-xl bg-slate-50 text-xs border-line"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-custom uppercase flex items-center gap-1.5">
              <Twitter className="w-3.5 h-3.5 text-sky-500" /> X (Twitter) Profile
            </Label>
            <Input
              name="twitter"
              placeholder="https://x.com/username"
              className="h-10 rounded-xl bg-slate-50 text-xs border-line"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-custom uppercase flex items-center gap-1.5">
              <Facebook className="w-3.5 h-3.5 text-blue-600" /> Facebook Profile
            </Label>
            <Input
              name="facebook"
              placeholder="https://facebook.com/author.profile"
              className="h-10 rounded-xl bg-slate-50 text-xs border-line"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-custom uppercase flex items-center gap-1.5">
              <Instagram className="w-3.5 h-3.5 text-pink-600" /> Instagram Handle
            </Label>
            <Input
              name="instagram"
              placeholder="https://instagram.com/username"
              className="h-10 rounded-xl bg-slate-50 text-xs border-line"
            />
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <Label className="text-xs font-bold text-slate-custom uppercase flex items-center gap-1.5">
              <Music className="w-3.5 h-3.5 text-slate-800" /> TikTok Profile
            </Label>
            <Input
              name="tiktok"
              placeholder="https://tiktok.com/@username"
              className="h-10 rounded-xl bg-slate-50 text-xs border-line"
            />
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex items-center justify-end gap-4 pt-4 border-t border-line">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/dashboard/admin/onboard-writer")}
          className="rounded-xl font-bold h-12 px-6"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-amber text-ink hover:bg-amber/90 rounded-xl font-bold h-12 px-8 shadow-lg shadow-amber/20"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Provisioning Writer...
            </>
          ) : (
            "Complete Writer Onboarding"
          )}
        </Button>
      </div>
    </form>
  );
}

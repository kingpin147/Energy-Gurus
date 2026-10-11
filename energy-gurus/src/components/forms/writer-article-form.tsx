"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createNews, updateNews } from "@/lib/actions/news";
import { toast } from "sonner";
import {
  FileText,
  Loader2,
  User,
  ShieldCheck,
  AlertTriangle,
  Send,
  ArrowLeft
} from "lucide-react";
import { useR2Upload } from "@/lib/hooks/use-r2-upload";
import { UploadZone } from "@/components/ui/upload-zone";
import { TiptapEditor } from "@/components/ui/tiptap-editor";
import Link from "next/link";

const DEFAULT_NEWS_CATEGORIES = [
  "Industry News",
  "Policy & Incentives",
  "Product Launches",
  "Project Sign Off",
  "Technology & Innovation",
  "Market Analysis"
];

interface WriterArticleFormProps {
  initialData?: {
    id: string;
    title: string;
    content: string;
    category: string;
    imageUrl?: string | null;
    status: string;
    adminFeedback?: string | null;
  };
  writerProfile: {
    name: string;
    pictureUrl?: string | null;
    designation?: string | null;
    bio?: string | null;
    status: string;
    socialLinks?: any;
  } | null;
}

export function WriterArticleForm({ initialData, writerProfile }: WriterArticleFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState(initialData?.title || "");
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || "");
  const [content, setContent] = useState(initialData?.content || "");

  const isDefaultCat = initialData?.category ? DEFAULT_NEWS_CATEGORIES.includes(initialData.category) : true;
  const [selectedCategory, setSelectedCategory] = useState<string>(
    initialData?.category ? (isDefaultCat ? initialData.category : "custom") : DEFAULT_NEWS_CATEGORIES[0]
  );
  const [customCategory, setCustomCategory] = useState<string>(
    initialData?.category && !isDefaultCat ? initialData.category : ""
  );

  const { uploadFile, isUploading } = useR2Upload();

  const isProfileApproved = writerProfile?.status === "approved";

  const handleCoverUpload = async (file: File) => {
    // 10 MB strict limit
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image exceeds maximum allowed size of 10 MB. Please upload a smaller image.");
      return;
    }
    try {
      const { publicUrl } = await uploadFile(file, "news-covers");
      setImageUrl(publicUrl);
      toast.success("Cover image uploaded successfully");
    } catch (error: any) {
      toast.error(error?.message || "Failed to upload cover image");
    }
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!isProfileApproved) {
      toast.error("You must have an approved Writer Profile before submitting articles.");
      return;
    }

    if (!title.trim()) {
      toast.error("Please enter an article title");
      return;
    }

    if (!content.trim() || content === "<p></p>") {
      toast.error("Please write your article content");
      return;
    }

    const finalCategory = selectedCategory === "custom" ? customCategory.trim() : selectedCategory;
    if (!finalCategory) {
      toast.error("Please select or enter a category");
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.set("title", title.trim());
      formData.set("content", content);
      formData.set("category", finalCategory);
      if (imageUrl) formData.set("imageUrl", imageUrl);

      const result = initialData?.id
        ? await updateNews(initialData.id, formData)
        : await createNews(formData);

      if (result.success) {
        toast.success(result.message);
        router.push("/dashboard/writer/articles");
      } else {
        toast.error(result.message);
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to submit article");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/writer/articles"
          className="inline-flex items-center text-sm font-semibold text-slate-custom hover:text-ink transition-colors gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back to My Articles
        </Link>
      </div>

      {/* Profile Verification Warning if not approved */}
      {!isProfileApproved && (
        <div className="p-5 rounded-2xl bg-amber/15 border border-amber/30 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber/20 text-amber-deep flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-amber-deep">Writer Profile Approval Required</h4>
            <p className="text-sm text-slate-custom mt-0.5 leading-relaxed">
              Your profile is currently <strong>{writerProfile?.status || "draft"}</strong>. You must complete your author
              profile and receive administrative approval before you can submit articles for publication.
            </p>
            <div className="mt-3">
              <Button asChild size="sm" className="bg-amber text-ink hover:bg-amber/90 rounded-xl font-bold">
                <Link href="/dashboard/writer">Complete Profile Now</Link>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Admin feedback alert if changes requested */}
      {initialData?.adminFeedback && (
        <div className="p-5 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-red-900">Admin Feedback on this Article</h4>
            <p className="text-sm text-red-700 mt-1 leading-relaxed bg-white/60 p-3 rounded-lg border border-red-200">
              {initialData.adminFeedback}
            </p>
            <p className="text-xs text-red-600 mt-2">
              Please make the required changes and resubmit for admin review.
            </p>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={onSubmit} className="space-y-8">
        {/* Article Meta */}
        <div className="bg-white border border-line rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-xs font-bold uppercase tracking-wider text-slate-custom">
              Article Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              placeholder="e.g. Navigating Net Metering Regulations in Pakistan: 2026 Comprehensive Guide"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="rounded-xl h-12 text-base md:text-lg font-bold border-line bg-paper/5 focus:ring-amber"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-custom">
                Category <span className="text-red-500">*</span>
              </Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="rounded-xl h-11 border-line bg-paper/5">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {DEFAULT_NEWS_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                  <SelectItem value="custom">+ Custom Category</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedCategory === "custom" && (
              <div className="space-y-2">
                <Label htmlFor="customCat" className="text-xs font-bold uppercase tracking-wider text-slate-custom">
                  Custom Category Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="customCat"
                  placeholder="e.g. Energy Storage"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  required
                  className="rounded-xl h-11 border-line bg-paper/5 focus:ring-amber"
                />
              </div>
            )}
          </div>

          {/* Cover Image Upload (10 MB Limit Enforced) */}
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-custom">
              Featured Cover Image (Max 10 MB)
            </Label>
            <UploadZone
              onUpload={handleCoverUpload}
              isUploading={isUploading}
              value={imageUrl}
              title="Upload Article Cover Image"
              description="Recommended ratio 16:9 or 21:9 (PNG, JPG, WebP up to 10MB)"
              maxSizeMB={10}
              accept="image/*"
            />
          </div>
        </div>

        {/* Article Body */}
        <div className="bg-white border border-line rounded-3xl p-6 md:p-8 space-y-4 shadow-sm">
          <div>
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-custom">
              Article Content <span className="text-red-500">*</span>
            </Label>
            <p className="text-xs text-slate-custom mt-0.5 mb-3">
              Use headers, bullet points, quotes, and links to format your article clearly.
            </p>
          </div>

          <TiptapEditor content={content} onChange={setContent} />
        </div>

        {/* Verified Author Card Preview */}
        {writerProfile && (
          <div className="bg-white border border-line rounded-3xl p-6 space-y-3 shadow-sm">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-purple-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-custom">
                Author Attribution Preview
              </span>
            </div>
            <div className="flex items-center gap-4 bg-paper/30 p-4 rounded-2xl border border-line">
              <div className="w-12 h-12 rounded-xl bg-amber/10 text-amber font-bold flex items-center justify-center shrink-0 border border-line overflow-hidden">
                {writerProfile.pictureUrl ? (
                  <img src={writerProfile.pictureUrl} alt={writerProfile.name} className="w-full h-full object-cover" />
                ) : (
                  writerProfile.name.substring(0, 2).toUpperCase()
                )}
              </div>
              <div>
                <p className="font-bold text-ink">{writerProfile.name}</p>
                <p className="text-xs text-slate-custom">{writerProfile.designation || "Contributing Writer"}</p>
              </div>
            </div>
          </div>
        )}

        {/* Submit Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-line">
          <p className="text-xs text-slate-custom max-w-md">
            🔒 <strong>Approval Notice:</strong> Nothing appears live without administrator approval. Your article will
            be sent to the editorial review queue.
          </p>

          <Button
            type="submit"
            disabled={isLoading || isUploading || !isProfileApproved}
            className="rounded-xl font-bold h-12 px-8 bg-amber text-ink hover:bg-amber/90 shadow-lg shadow-amber/20"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting Article...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                {initialData?.id ? "Resubmit Article for Review" : "Submit Article for Review"}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

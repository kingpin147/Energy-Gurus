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
  Newspaper,
  Loader2,
  User,
  ShieldCheck,
  AlertTriangle,
  ArrowLeft,
  X
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
  "Battery Energy Storage System",
  "Technology & Innovation",
  "Guidelines",
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
        <div className="p-5 rounded-3xl bg-amber/15 border border-amber/30 flex items-start gap-4">
          <div className="w-10 h-10 rounded-2xl bg-amber/20 text-amber-deep flex items-center justify-center shrink-0">
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
        <div className="p-5 rounded-3xl bg-red-50 border border-red-200 flex items-start gap-4">
          <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-red-900">Admin Feedback on this Article</h4>
            <p className="text-sm text-red-700 mt-1 leading-relaxed bg-white/60 p-3 rounded-xl border border-red-200">
              {initialData.adminFeedback}
            </p>
            <p className="text-xs text-red-600 mt-2">
              Please make the required changes and resubmit for admin review.
            </p>
          </div>
        </div>
      )}

      {/* Form matching NewsForm card architecture exactly */}
      <form onSubmit={onSubmit} className="space-y-8">
        {/* 1. ARTICLE GENERAL INFORMATION */}
        <div className="space-y-5 bg-white p-6 rounded-3xl border border-line shadow-sm">
          <h3 className="text-base font-bold text-ink flex items-center gap-2 border-b border-line pb-3">
            <Newspaper className="w-5 h-5 text-amber" /> {initialData ? "Edit Article" : "Article General Information"}
          </h3>

          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-bold text-ink">
              Article Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              name="title"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter an engaging title..."
              className="h-11 rounded-xl bg-slate-50 border-line text-sm focus-visible:ring-amber"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm font-bold text-ink">
                Category <span className="text-red-500">*</span>
              </Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger id="category" className="h-11 rounded-xl bg-slate-50 border-line font-medium text-sm">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {DEFAULT_NEWS_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                  <SelectItem value="custom" className="text-amber font-bold">
                    + Add Custom Category...
                  </SelectItem>
                </SelectContent>
              </Select>

              {selectedCategory === "custom" && (
                <div className="pt-2 space-y-1">
                  <Label htmlFor="customCategoryInput" className="text-xs font-bold text-slate-custom uppercase tracking-wider">
                    Custom Category Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="customCategoryInput"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder="e.g. Battery Storage, Solar Tariffs"
                    required
                    className="h-10 rounded-xl bg-slate-50 border-amber/50 text-sm focus-visible:ring-amber"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 2. COVER IMAGE UPLOAD (Max 10 MB Enforced) */}
        <div className="space-y-3 bg-white p-6 rounded-3xl border border-line shadow-sm">
          <Label className="text-sm font-bold text-ink">Article Cover Image</Label>
          <UploadZone
            onUpload={handleCoverUpload}
            isUploading={isUploading}
            value={imageUrl}
            title="Click or drag to upload cover image"
            description="High resolution PNG or JPG, up to 10MB"
            maxSizeMB={10}
            accept="image/*"
          />
          {imageUrl && (
            <div className="flex justify-end">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setImageUrl("")}
                className="text-xs text-rose-600 hover:bg-rose-50 font-bold"
              >
                <X className="w-3.5 h-3.5 mr-1" /> Remove Cover Image
              </Button>
            </div>
          )}
        </div>

        {/* 3. RICH FORMATTING CONTENT EDITOR (Exact same tools: B, I, H2, H3, Lists, Quote, Link, Image, Divider) */}
        <div className="space-y-3 bg-white p-6 rounded-3xl border border-line shadow-sm">
          <div className="flex items-center justify-between border-b border-line pb-3">
            <Label className="text-sm font-bold text-ink">
              Article Content <span className="text-red-500">*</span>
            </Label>
          </div>
          <TiptapEditor content={content} onChange={setContent} />
        </div>

        {/* 4. AUTHOR ATTRIBUTION (Automatically derived from Writer Profile - input fields omitted for writers and left to admin only) */}
        <div className="space-y-4 bg-white p-6 rounded-3xl border border-line shadow-sm">
          <div className="flex items-center justify-between border-b border-line pb-3">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-amber" />
              <h3 className="text-base font-bold text-ink">Author Details</h3>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Linked to Writer Profile
            </span>
          </div>

          <p className="text-xs text-slate-custom leading-relaxed">
            Your name, designation, photo, and social links are automatically populated from your verified Writer Profile. Custom author overrides are reserved for administrators.
          </p>

          <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-line">
            <div className="w-12 h-12 rounded-xl bg-amber/10 text-amber font-bold flex items-center justify-center shrink-0 border border-line overflow-hidden">
              {writerProfile?.pictureUrl ? (
                <img src={writerProfile.pictureUrl} alt={writerProfile.name || "Writer"} className="w-full h-full object-cover" />
              ) : (
                (writerProfile?.name || "Writer").substring(0, 2).toUpperCase()
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="font-bold text-ink text-sm truncate">{writerProfile?.name || "Author Name"}</p>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                  Writer
                </span>
              </div>
              <p className="text-xs text-slate-custom truncate">{writerProfile?.designation || "Contributing Columnist"}</p>
            </div>
            <Button asChild variant="outline" size="sm" className="rounded-xl text-xs font-bold border-line shrink-0">
              <Link href="/dashboard/writer">
                Edit Profile
              </Link>
            </Button>
          </div>
        </div>

        {/* 5. FOOTER ACTIONS */}
        <div className="pt-4 border-t border-line flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="text-xs text-slate-custom">
            🔒 <strong>Approval Notice:</strong> Nothing appears live without administrator approval. Your article will be submitted to the review queue.
          </p>
          <div className="flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/dashboard/writer/articles")}
              disabled={isLoading}
              className="rounded-xl h-11 px-6 font-bold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || isUploading || !isProfileApproved}
              className="rounded-xl h-11 px-6 font-bold bg-amber text-ink hover:bg-amber/90 shadow-sm"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...
                </>
              ) : (
                <>
                  <Newspaper className="w-4 h-4 mr-2" />
                  {initialData?.id ? "Update & Resubmit Article" : "Submit Article for Review"}
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { createNews, updateNews } from "@/lib/actions/news";
import { toast } from "sonner";
import {
  Newspaper,
  Loader2,
  User,
  Mail,
  Linkedin,
  Building,
  Briefcase,
  Calendar,
  X
} from "lucide-react";
import { useR2Upload } from "@/lib/hooks/use-r2-upload";
import { UploadZone } from "@/components/ui/upload-zone";
import { TiptapEditor } from "@/components/ui/tiptap-editor";

const DEFAULT_NEWS_CATEGORIES = [
  "Industry News",
  "Policy & Incentives",
  "Product Launches",
  "Project Sign Off",
];

interface NewsFormProps {
  initialData?: {
    id: string;
    title: string;
    content: string;
    category: string;
    imageUrl?: string | null;
    isPublished: boolean;
    publishedAt?: Date | string | null;
    authorName?: string | null;
    authorPictureUrl?: string | null;
    authorDesignation?: string | null;
    authorOrganization?: string | null;
    authorLinkedIn?: string | null;
    authorEmail?: string | null;
  };
}

export function NewsForm({ initialData }: NewsFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState(initialData?.title || "");
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || "");
  const [authorPictureUrl, setAuthorPictureUrl] = useState(initialData?.authorPictureUrl || "");
  const [isPublished, setIsPublished] = useState(initialData?.isPublished ?? true);

  const isDefaultCat = initialData?.category ? DEFAULT_NEWS_CATEGORIES.includes(initialData.category) : true;
  const [selectedCategory, setSelectedCategory] = useState<string>(
    initialData?.category ? (isDefaultCat ? initialData.category : "custom") : DEFAULT_NEWS_CATEGORIES[0]
  );
  const [customCategory, setCustomCategory] = useState<string>(
    initialData?.category && !isDefaultCat ? initialData.category : ""
  );

  const getFormattedDate = () => {
    if (!initialData?.publishedAt) return "";
    const d = new Date(initialData.publishedAt);
    if (isNaN(d.getTime())) return "";
    // format as YYYY-MM-DDTHH:mm
    const tzOffset = d.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(d.getTime() - tzOffset)).toISOString().slice(0, 16);
    return localISOTime;
  };

  const [publishedAt, setPublishedAt] = useState<string>(getFormattedDate());
  const [content, setContent] = useState(initialData?.content || "");

  // Author Metadata state
  const [authorName, setAuthorName] = useState(initialData?.authorName || "");
  const [authorDesignation, setAuthorDesignation] = useState(initialData?.authorDesignation || "");
  const [authorOrganization, setAuthorOrganization] = useState(initialData?.authorOrganization || "");
  const [authorEmail, setAuthorEmail] = useState(initialData?.authorEmail || "");
  const [authorLinkedIn, setAuthorLinkedIn] = useState(initialData?.authorLinkedIn || "");

  const { uploadFile, isUploading } = useR2Upload();

  const handleCoverUpload = async (file: File) => {
    try {
      const { publicUrl } = await uploadFile(file, "news-covers");
      setImageUrl(publicUrl);
      toast.success("Cover image uploaded successfully");
    } catch (error) {
      toast.error("Failed to upload cover image");
    }
  };

  const handleAuthorPicUpload = async (file: File) => {
    try {
      const { publicUrl } = await uploadFile(file, "news-authors");
      setAuthorPictureUrl(publicUrl);
      toast.success("Author picture uploaded successfully");
    } catch (error) {
      toast.error("Failed to upload author picture");
    }
  };

  async function onSubmit(formData: FormData) {
    setIsLoading(true);
    try {
      if (selectedCategory === "custom") {
        if (!customCategory.trim()) {
          toast.error("Please enter a custom category name");
          setIsLoading(false);
          return;
        }
        formData.set("category", customCategory.trim());
      } else {
        formData.set("category", selectedCategory);
      }

      if (imageUrl) {
        formData.set("imageUrl", imageUrl);
      }

      if (authorPictureUrl) {
        formData.set("authorPictureUrl", authorPictureUrl);
      }

      formData.set("content", content);

      const result = initialData?.id
        ? await updateNews(initialData.id, formData)
        : await createNews(formData);

      if (result.success) {
        toast.success(result.message);
        router.push("/dashboard/news");
        router.refresh();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form action={onSubmit} className="space-y-8">
      {/* 1. ARTICLE TITLE & CATEGORY & SCHEDULE */}
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

          <div className="space-y-2 flex flex-col justify-end">
            <div className="flex items-center justify-between bg-slate-50 p-3.5 rounded-xl border border-line">
              <div className="flex items-center space-x-3">
                <Switch
                  id="isPublished"
                  name="isPublished"
                  value="true"
                  checked={isPublished}
                  onCheckedChange={setIsPublished}
                  className="data-[state=checked]:bg-teal"
                />
                <Label htmlFor="isPublished" className="text-sm font-bold cursor-pointer text-ink">
                  Publish Immediately
                </Label>
              </div>
              <span className="text-xs font-semibold text-slate-custom">
                {isPublished ? "Now Live" : "Scheduled"}
              </span>
            </div>
          </div>
        </div>

        {/* Date & Time Picker when Scheduled */}
        {!isPublished && (
          <div className="p-4 bg-amber/5 border border-amber/20 rounded-2xl space-y-2">
            <Label htmlFor="publishedAt" className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-amber" /> Schedule Publish Date & Time <span className="text-red-500">*</span>
            </Label>
            <Input
              type="datetime-local"
              id="publishedAt"
              name="publishedAt"
              value={publishedAt}
              onChange={(e) => setPublishedAt(e.target.value)}
              required={!isPublished}
              className="h-11 rounded-xl bg-white border-line font-medium text-sm focus-visible:ring-amber"
            />
            <p className="text-xs text-slate-custom">
              The article will automatically go live on the site when the specified date and time arrives.
            </p>
          </div>
        )}
      </div>

      {/* 2. COVER IMAGE UPLOAD */}
      <div className="space-y-3 bg-white p-6 rounded-3xl border border-line shadow-sm">
        <Label className="text-sm font-bold text-ink">Article Cover Image</Label>
        <UploadZone
          onUpload={handleCoverUpload}
          isUploading={isUploading}
          value={imageUrl}
          title="Click or drag to upload cover image"
          description="High resolution PNG or JPG, up to 5MB"
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

      {/* 3. RICH FORMATTING CONTENT EDITOR */}
      <div className="space-y-3 bg-white p-6 rounded-3xl border border-line shadow-sm">
        <div className="flex items-center justify-between border-b border-line pb-3">
          <Label className="text-sm font-bold text-ink">
            Article Content <span className="text-red-500">*</span>
          </Label>
        </div>
        <TiptapEditor content={content} onChange={setContent} />
      </div>

      {/* 4. AUTHOR DETAILS SECTION */}
      <div className="space-y-5 bg-white p-6 rounded-3xl border border-line shadow-sm">
        <h3 className="text-base font-bold text-ink flex items-center gap-2 border-b border-line pb-3">
          <User className="w-5 h-5 text-amber" /> Author Details
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label htmlFor="authorName" className="text-xs font-bold uppercase tracking-wider text-slate-custom">
              Author Name (Optional)
            </Label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-custom absolute left-3.5 top-1/2 -translate-y-1/2" />
              <Input
                id="authorName"
                name="authorName"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="e.g. Engr. Faisal Hameed"
                className="pl-10 h-11 rounded-xl bg-slate-50 border-line text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="authorDesignation" className="text-xs font-bold uppercase tracking-wider text-slate-custom">
              Designation
            </Label>
            <div className="relative">
              <Briefcase className="w-4 h-4 text-slate-custom absolute left-3.5 top-1/2 -translate-y-1/2" />
              <Input
                id="authorDesignation"
                name="authorDesignation"
                value={authorDesignation}
                onChange={(e) => setAuthorDesignation(e.target.value)}
                placeholder="e.g. Chief Renewable Analyst"
                className="pl-10 h-11 rounded-xl bg-slate-50 border-line text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="authorOrganization" className="text-xs font-bold uppercase tracking-wider text-slate-custom">
              Organization
            </Label>
            <div className="relative">
              <Building className="w-4 h-4 text-slate-custom absolute left-3.5 top-1/2 -translate-y-1/2" />
              <Input
                id="authorOrganization"
                name="authorOrganization"
                value={authorOrganization}
                onChange={(e) => setAuthorOrganization(e.target.value)}
                placeholder="e.g. EnergyGurus / AEDB"
                className="pl-10 h-11 rounded-xl bg-slate-50 border-line text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="authorEmail" className="text-xs font-bold uppercase tracking-wider text-slate-custom">
              Email Address
            </Label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-custom absolute left-3.5 top-1/2 -translate-y-1/2" />
              <Input
                type="email"
                id="authorEmail"
                name="authorEmail"
                value={authorEmail}
                onChange={(e) => setAuthorEmail(e.target.value)}
                placeholder="author@energygurus.online"
                className="pl-10 h-11 rounded-xl bg-slate-50 border-line text-sm"
              />
            </div>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="authorLinkedIn" className="text-xs font-bold uppercase tracking-wider text-slate-custom">
              LinkedIn Profile URL
            </Label>
            <div className="relative">
              <Linkedin className="w-4 h-4 text-slate-custom absolute left-3.5 top-1/2 -translate-y-1/2" />
              <Input
                id="authorLinkedIn"
                name="authorLinkedIn"
                value={authorLinkedIn}
                onChange={(e) => setAuthorLinkedIn(e.target.value)}
                placeholder="https://linkedin.com/in/author-profile"
                className="pl-10 h-11 rounded-xl bg-slate-50 border-line text-sm"
              />
            </div>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-custom">Author Picture</Label>
            <UploadZone
              onUpload={handleAuthorPicUpload}
              isUploading={isUploading}
              value={authorPictureUrl}
              title="Click or drag to upload author headshot photo"
              description="PNG or JPG photo"
              accept="image/*"
            />
            {authorPictureUrl && (
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setAuthorPictureUrl("")}
                  className="text-xs text-rose-600 hover:bg-rose-50 font-bold"
                >
                  <X className="w-3.5 h-3.5 mr-1" /> Remove Picture
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FOOTER ACTIONS */}
      <div className="pt-4 border-t border-line flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isLoading}
          className="rounded-xl h-11 px-6 font-bold"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className="rounded-xl h-11 px-6 font-bold bg-amber text-ink hover:bg-amber/90"
        >
          {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Newspaper className="w-4 h-4 mr-2" />}
          {initialData ? "Update Article" : "Save Article"}
        </Button>
      </div>
    </form>
  );
}

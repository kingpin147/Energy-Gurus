"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Upload,
  X,
  Trash2,
  FileText,
  ExternalLink,
  Plus,
  Loader2,
  Image as ImageIcon,
  Link as LinkIcon,
  Maximize2,
  User,
  RefreshCw,
  Eye,
} from "lucide-react";
import { useR2Upload } from "@/lib/hooks/use-r2-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// ==========================================
// 1. SHARED IMAGE LIGHTBOX MODAL
// ==========================================
export interface LightboxState {
  isOpen: boolean;
  url: string;
  title?: string;
}

export function ImageLightboxModal({
  state,
  onClose,
}: {
  state: LightboxState | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!state?.isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [state?.isOpen, onClose]);

  if (!state?.isOpen || !state.url) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl max-h-[90vh] w-full flex flex-col items-center gap-3"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Bar */}
        <div className="w-full flex items-center justify-between px-2 text-white">
          <p className="text-sm font-semibold truncate max-w-md">
            {state.title || "Image Preview"}
          </p>
          <div className="flex items-center gap-2">
            <a
              href={state.url}
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center gap-1.5 text-xs font-medium"
              title="Open full resolution in new tab"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Full Size</span>
            </a>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Large Image */}
        <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-neutral-900 shadow-2xl flex items-center justify-center max-h-[80vh] w-auto">
          <img
            src={state.url}
            alt={state.title || "Full Preview"}
            className="max-h-[80vh] max-w-full object-contain select-none"
          />
        </div>
      </div>
    </div>
  );
}

// Helper to format or extract document filename from URL
function getDocFileName(url: string, index: number): string {
  try {
    const parsed = new URL(url);
    const pathname = parsed.pathname;
    const raw = pathname.split("/").pop() || "";
    const clean = decodeURIComponent(raw.replace(/^[0-9a-fA-F-]{36}[_-]?/, ""));
    return clean || `Document ${index + 1}`;
  } catch {
    const raw = url.split("/").pop() || "";
    return raw || `Document ${index + 1}`;
  }
}

// ==========================================
// 2. SINGLE PHOTO UPLOAD (FOR TEAM MEMBERS, LOGO, ETC.)
// Shows small thumbnail, click to enlarge, and update/replace option
// ==========================================
export interface SinglePhotoUploadProps {
  value?: string;
  onChange: (url: string) => void;
  folder?: string;
  title?: string;
  className?: string;
}

export function SinglePhotoUpload({
  value,
  onChange,
  folder = "epc-team",
  title = "Photo",
  className,
}: SinglePhotoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadFile, isUploading } = useR2Upload();
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [lightbox, setLightbox] = useState<LightboxState | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const res = await uploadFile(file, folder);
      onChange(res.publicUrl);
      toast.success("Photo uploaded successfully!");
    } catch (err: any) {
      console.error("Photo upload error:", err);
      toast.error(err?.message || "Failed to upload photo.");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleApplyUrl = () => {
    if (!urlInput.trim()) return;
    onChange(urlInput.trim());
    setUrlInput("");
    setShowUrlInput(false);
    toast.success("Photo URL updated!");
  };

  return (
    <>
      <div className={cn("space-y-1.5", className)}>
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        <div className="flex items-center gap-2">
          {/* 1. Small Thumbnail if photo exists */}
          {value ? (
            <div
              onClick={() => setLightbox({ isOpen: true, url: value, title })}
              className="relative w-10 h-10 rounded-xl border border-line bg-white overflow-hidden shadow-xs shrink-0 cursor-pointer group hover:ring-2 hover:ring-amber/70 transition-all"
              title="Click to view large image"
            >
              <img
                src={value}
                alt={title}
                className="w-full h-full object-cover transition-transform group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Maximize2 className="w-3.5 h-3.5 text-white" />
              </div>
            </div>
          ) : (
            <div
              onClick={() => !isUploading && fileInputRef.current?.click()}
              className="w-10 h-10 rounded-xl border border-dashed border-line bg-slate-100 flex items-center justify-center text-slate-400 shrink-0 cursor-pointer hover:border-amber/60 hover:bg-white transition-colors"
              title="Upload photo"
            >
              <User className="w-4 h-4" />
            </div>
          )}

          {/* 2. Action Controls */}
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            {/* Update / Upload Button */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              className="h-9 px-2.5 text-xs font-bold rounded-xl border-line bg-white hover:bg-slate-50 text-ink gap-1.5 shadow-xs shrink-0"
              title={value ? "Update this photo" : "Upload a photo from your computer"}
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 text-amber animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : value ? (
                <>
                  <Upload className="w-3.5 h-3.5 text-amber" />
                  <span>Update Photo</span>
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5 text-amber" />
                  <span>Upload Photo</span>
                </>
              )}
            </Button>

            {/* Toggle URL input */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setUrlInput(value || "");
                setShowUrlInput(!showUrlInput);
              }}
              className="h-9 px-2 text-xs font-semibold text-slate-500 hover:text-ink rounded-xl"
              title="Edit direct image URL"
            >
              <LinkIcon className="w-3.5 h-3.5" />
            </Button>

            {/* Remove Photo Button */}
            {value && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  onChange("");
                  toast.info("Photo removed");
                }}
                className="h-9 px-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl"
                title="Remove photo"
              >
                <X className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </div>

        {/* Collapsible Direct URL edit */}
        {showUrlInput && (
          <div className="flex items-center gap-1.5 pt-1">
            <Input
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://...jpg"
              className="h-8 bg-white border-line text-xs flex-1"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleApplyUrl();
                }
              }}
            />
            <Button
              type="button"
              size="sm"
              onClick={handleApplyUrl}
              className="h-8 px-2.5 text-xs font-bold bg-ink text-white hover:bg-ink/90 rounded-xl shrink-0"
            >
              Save
            </Button>
          </div>
        )}
      </div>

      {/* Lightbox Preview */}
      <ImageLightboxModal state={lightbox} onClose={() => setLightbox(null)} />
    </>
  );
}

// ==========================================
// 3. MULTI PHOTO UPLOAD COMPONENT
// Shows gallery grid, click on thumbnail opens large image, update button for each
// ==========================================
export interface MultiPhotoUploadProps {
  label?: string;
  description?: string;
  urls: string[];
  onChange: (urls: string[]) => void;
  folder?: string;
  maxFiles?: number;
  className?: string;
}

export function MultiPhotoUpload({
  label = "Company Photos",
  description = "Upload high-quality photos (PNG, JPG, WEBP up to 50MB each). Multiple files supported.",
  urls = [],
  onChange,
  folder = "epc-photos",
  maxFiles = 30,
  className,
}: MultiPhotoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const [replacingIndex, setReplacingIndex] = useState<number | null>(null);

  const { uploadFile, isUploading } = useR2Upload();
  const [uploadStatusText, setUploadStatusText] = useState<string>("");
  const [showUrlInput, setShowUrlInput] = useState<boolean>(false);
  const [urlInput, setUrlInput] = useState<string>("");
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [lightbox, setLightbox] = useState<LightboxState | null>(null);

  const handleFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;

    if (urls.length + files.length > maxFiles) {
      toast.error(`You can only upload up to ${maxFiles} photos in total.`);
      return;
    }

    const uploadedUrls: string[] = [];
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadStatusText(`Uploading ${i + 1} of ${files.length}: ${file.name}...`);
        const res = await uploadFile(file, folder);
        uploadedUrls.push(res.publicUrl);
      }
      onChange([...urls, ...uploadedUrls]);
      toast.success(`${uploadedUrls.length} photo${uploadedUrls.length > 1 ? "s" : ""} uploaded successfully!`);
    } catch (err: any) {
      console.error("Photo upload error:", err);
      toast.error(err?.message || "Failed to upload photo(s).");
    } finally {
      setUploadStatusText("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleReplaceFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || replacingIndex === null) return;

    try {
      setUploadStatusText(`Updating photo: ${file.name}...`);
      const res = await uploadFile(file, folder);
      const copy = [...urls];
      copy[replacingIndex] = res.publicUrl;
      onChange(copy);
      toast.success("Photo updated successfully!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to update photo.");
    } finally {
      setReplacingIndex(null);
      setUploadStatusText("");
      if (replaceInputRef.current) replaceInputRef.current.value = "";
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isUploading) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (isUploading) return;
    if (e.dataTransfer?.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleRemove = (index: number) => {
    const updated = urls.filter((_, i) => i !== index);
    onChange(updated);
    toast.info("Photo removed");
  };

  const handleAddManualUrls = () => {
    if (!urlInput.trim()) return;
    const parsed = urlInput
      .split(",")
      .map((u) => u.trim())
      .filter((u) => u.length > 0 && (u.startsWith("http://") || u.startsWith("https://")));

    if (parsed.length === 0) {
      toast.error("Please enter valid URL(s) starting with http:// or https://");
      return;
    }

    onChange([...urls, ...parsed]);
    setUrlInput("");
    setShowUrlInput(false);
    toast.success(`Added ${parsed.length} photo URL(s)`);
  };

  return (
    <>
      <div className={cn("space-y-3", className)}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Label className="text-xs font-bold uppercase text-slate-custom tracking-wider">{label}</Label>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-line">
                {urls.length}
              </span>
            </div>
            {description && <p className="text-xs text-slate-custom mt-0.5">{description}</p>}
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowUrlInput(!showUrlInput)}
              className="h-8 px-2.5 text-xs font-bold rounded-xl border-line text-slate-600 hover:text-ink gap-1.5"
            >
              <LinkIcon className="w-3.5 h-3.5 text-slate-500" />
              {showUrlInput ? "Hide URL Input" : "Add via URL"}
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              className="h-8 px-3 text-xs font-bold rounded-xl border-line bg-white hover:bg-slate-50 text-ink gap-1.5 shadow-xs"
            >
              <Upload className="w-3.5 h-3.5 text-amber" />
              {isUploading ? "Uploading..." : "Upload Photos"}
            </Button>
          </div>
        </div>

        {/* Hidden File Inputs */}
        <input
          type="file"
          ref={fileInputRef}
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            if (e.target.files) handleFiles(e.target.files);
          }}
        />

        <input
          type="file"
          ref={replaceInputRef}
          accept="image/*"
          className="hidden"
          onChange={handleReplaceFile}
        />

        {/* Manual URL Input Bar */}
        {showUrlInput && (
          <div className="p-3 bg-slate-50 border border-line rounded-2xl space-y-2">
            <Label className="text-[11px] font-bold uppercase text-slate-custom">Paste Direct Image URL(s)</Label>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="https://...jpg, https://...png"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="bg-white border-line text-xs h-9"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddManualUrls();
                  }
                }}
              />
              <Button
                type="button"
                size="sm"
                onClick={handleAddManualUrls}
                className="h-9 px-4 text-xs font-bold bg-ink text-white hover:bg-ink/90 rounded-xl shrink-0"
              >
                Add URL
              </Button>
            </div>
            <p className="text-[11px] text-slate-custom">Separate multiple links with commas.</p>
          </div>
        )}

        {/* Uploading Status Banner */}
        {isUploading && (
          <div className="p-3 bg-amber/10 border border-amber/30 rounded-2xl flex items-center gap-3">
            <Loader2 className="w-5 h-5 text-amber animate-spin shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-ink">{uploadStatusText || "Uploading photo to cloud storage..."}</p>
              <p className="text-[11px] text-slate-custom truncate">Please keep this dialog open until upload completes.</p>
            </div>
          </div>
        )}

        {/* Empty State / Dropzone */}
        {urls.length === 0 && !isUploading && (
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              "p-6 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer transition-all",
              isDragging
                ? "border-amber bg-amber/5 scale-[1.01]"
                : "border-line bg-slate-50/60 hover:bg-white hover:border-amber/50 hover:shadow-xs"
            )}
          >
            <div className="w-10 h-10 rounded-2xl bg-amber/10 flex items-center justify-center mb-2.5">
              <Upload className="w-5 h-5 text-amber" />
            </div>
            <p className="text-xs font-bold text-ink mb-1">Click to browse or drag & drop company photos here</p>
            <p className="text-[11px] text-slate-custom max-w-sm">
              PNG, JPG, WEBP, or SVG up to 50MB each. You can select multiple files at once.
            </p>
          </div>
        )}

        {/* Gallery Grid of Uploaded Photos */}
        {urls.length > 0 && (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              "p-3 rounded-2xl border border-line bg-slate-50/50 transition-all",
              isDragging && "ring-2 ring-amber bg-amber/5"
            )}
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {urls.map((url, idx) => (
                <div
                  key={idx}
                  className="group relative aspect-square rounded-xl border border-line overflow-hidden bg-white shadow-xs"
                >
                  {/* Thumbnail Image */}
                  <img
                    src={url}
                    alt={`Photo ${idx + 1}`}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />

                  {/* Click overlay to enlarge */}
                  <div
                    onClick={() =>
                      setLightbox({
                        isOpen: true,
                        url,
                        title: `${label} #${idx + 1}`,
                      })
                    }
                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex flex-col justify-between p-2"
                  >
                    {/* Top action row */}
                    <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                      {/* Update/Replace Photo */}
                      <button
                        type="button"
                        onClick={() => {
                          setReplacingIndex(idx);
                          replaceInputRef.current?.click();
                        }}
                        className="p-1.5 bg-white/90 hover:bg-white text-ink rounded-lg shadow-xs transition-colors"
                        title="Update / Replace this photo"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>

                      {/* Remove */}
                      <button
                        type="button"
                        onClick={() => handleRemove(idx)}
                        className="p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-xs transition-colors"
                        title="Remove photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Centered click to view hint */}
                    <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-white bg-black/60 py-1 px-2 rounded-lg self-center backdrop-blur-xs">
                      <Maximize2 className="w-3 h-3" />
                      <span>View Large</span>
                    </div>

                    {/* Index badge */}
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-black/60 text-white self-start backdrop-blur-xs">
                      #{idx + 1}
                    </span>
                  </div>
                </div>
              ))}

              {/* Quick Add More Tile */}
              <button
                type="button"
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square rounded-xl border-2 border-dashed border-line hover:border-amber/60 hover:bg-white transition-all flex flex-col items-center justify-center gap-1.5 text-slate-custom hover:text-ink group"
              >
                <div className="w-8 h-8 rounded-lg bg-amber/10 group-hover:bg-amber/20 flex items-center justify-center transition-colors">
                  <Plus className="w-4 h-4 text-amber" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider">Add Photo</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Lightbox Preview */}
      <ImageLightboxModal state={lightbox} onClose={() => setLightbox(null)} />
    </>
  );
}

// ==========================================
// 4. MULTI DOCUMENT UPLOAD COMPONENT
// ==========================================
export interface MultiDocumentUploadProps {
  label?: string;
  description?: string;
  urls: string[];
  onChange: (urls: string[]) => void;
  folder?: string;
  accept?: string;
  className?: string;
}

export function MultiDocumentUpload({
  label = "Certification Documents",
  description = "Upload licences, approvals, or brand certificates (PDF or images up to 50MB each).",
  urls = [],
  onChange,
  folder = "epc-documents",
  accept = ".pdf,image/*",
  className,
}: MultiDocumentUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadFile, isUploading } = useR2Upload();
  const [uploadStatusText, setUploadStatusText] = useState<string>("");
  const [showUrlInput, setShowUrlInput] = useState<boolean>(false);
  const [urlInput, setUrlInput] = useState<string>("");
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [lightbox, setLightbox] = useState<LightboxState | null>(null);

  const handleFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;

    const uploadedUrls: string[] = [];
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadStatusText(`Uploading ${i + 1} of ${files.length}: ${file.name}...`);
        const res = await uploadFile(file, folder);
        uploadedUrls.push(res.publicUrl);
      }
      onChange([...urls, ...uploadedUrls]);
      toast.success(`${uploadedUrls.length} document${uploadedUrls.length > 1 ? "s" : ""} uploaded successfully!`);
    } catch (err: any) {
      console.error("Document upload error:", err);
      toast.error(err?.message || "Failed to upload document(s).");
    } finally {
      setUploadStatusText("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isUploading) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (isUploading) return;
    if (e.dataTransfer?.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleRemove = (index: number) => {
    const updated = urls.filter((_, i) => i !== index);
    onChange(updated);
    toast.info("Document removed");
  };

  const handleAddManualUrls = () => {
    if (!urlInput.trim()) return;
    const parsed = urlInput
      .split(",")
      .map((u) => u.trim())
      .filter((u) => u.length > 0 && (u.startsWith("http://") || u.startsWith("https://")));

    if (parsed.length === 0) {
      toast.error("Please enter valid URL(s) starting with http:// or https://");
      return;
    }

    onChange([...urls, ...parsed]);
    setUrlInput("");
    setShowUrlInput(false);
    toast.success(`Added ${parsed.length} document URL(s)`);
  };

  return (
    <>
      <div className={cn("space-y-3", className)}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Label className="text-xs font-bold uppercase text-slate-custom tracking-wider">{label}</Label>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-line">
                {urls.length}
              </span>
            </div>
            {description && <p className="text-xs text-slate-custom mt-0.5">{description}</p>}
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowUrlInput(!showUrlInput)}
              className="h-8 px-2.5 text-xs font-bold rounded-xl border-line text-slate-600 hover:text-ink gap-1.5"
            >
              <LinkIcon className="w-3.5 h-3.5 text-slate-500" />
              {showUrlInput ? "Hide URL Input" : "Add via URL"}
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              className="h-8 px-3 text-xs font-bold rounded-xl border-line bg-white hover:bg-slate-50 text-ink gap-1.5 shadow-xs"
            >
              <Upload className="w-3.5 h-3.5 text-amber" />
              {isUploading ? "Uploading..." : "Upload Document"}
            </Button>
          </div>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          multiple
          accept={accept}
          className="hidden"
          onChange={handleFileInputChange}
        />

        {/* Manual URL Input Bar */}
        {showUrlInput && (
          <div className="p-3 bg-slate-50 border border-line rounded-2xl space-y-2">
            <Label className="text-[11px] font-bold uppercase text-slate-custom">Paste Direct Document URL(s)</Label>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="https://...pdf, https://...jpg"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="bg-white border-line text-xs h-9"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddManualUrls();
                  }
                }}
              />
              <Button
                type="button"
                size="sm"
                onClick={handleAddManualUrls}
                className="h-9 px-4 text-xs font-bold bg-ink text-white hover:bg-ink/90 rounded-xl shrink-0"
              >
                Add URL
              </Button>
            </div>
            <p className="text-[11px] text-slate-custom">Separate multiple links with commas.</p>
          </div>
        )}

        {/* Uploading Status Banner */}
        {isUploading && (
          <div className="p-3 bg-amber/10 border border-amber/30 rounded-2xl flex items-center gap-3">
            <Loader2 className="w-5 h-5 text-amber animate-spin shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-ink">{uploadStatusText || "Uploading document to cloud storage..."}</p>
              <p className="text-[11px] text-slate-custom truncate">Please keep this dialog open until upload completes.</p>
            </div>
          </div>
        )}

        {/* Empty State / Dropzone */}
        {urls.length === 0 && !isUploading && (
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              "p-5 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer transition-all",
              isDragging
                ? "border-amber bg-amber/5 scale-[1.01]"
                : "border-line bg-slate-50/60 hover:bg-white hover:border-amber/50 hover:shadow-xs"
            )}
          >
            <div className="w-10 h-10 rounded-2xl bg-amber/10 flex items-center justify-center mb-2">
              <FileText className="w-5 h-5 text-amber" />
            </div>
            <p className="text-xs font-bold text-ink mb-1">Click to browse or drag & drop certification documents here</p>
            <p className="text-[11px] text-slate-custom max-w-sm">
              PDF files, scanned images (PNG, JPG) up to 50MB each.
            </p>
          </div>
        )}

        {/* List of Uploaded Documents */}
        {urls.length > 0 && (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              "p-3 rounded-2xl border border-line bg-slate-50/50 space-y-2 transition-all",
              isDragging && "ring-2 ring-amber bg-amber/5"
            )}
          >
            {urls.map((url, idx) => {
              const fileName = getDocFileName(url, idx);
              const isPdf = url.toLowerCase().includes(".pdf");
              const isImg = url.toLowerCase().match(/\.(jpeg|jpg|png|webp|gif|svg)(\?.*)?$/i);

              return (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-3 p-2.5 bg-white border border-line rounded-xl hover:shadow-xs transition-shadow"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {/* If it's an image, clicking thumbnail opens lightbox */}
                    {isImg ? (
                      <div
                        onClick={() => setLightbox({ isOpen: true, url, title: fileName })}
                        className="w-9 h-9 rounded-lg border border-line overflow-hidden shrink-0 cursor-pointer relative group"
                        title="Click to view image"
                      >
                        <img src={url} alt={fileName} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <Eye className="w-3.5 h-3.5 text-white" />
                        </div>
                      </div>
                    ) : (
                      <div
                        className={cn(
                          "w-9 h-9 rounded-lg flex items-center justify-center shrink-0 font-bold text-[10px]",
                          isPdf ? "bg-rose-50 text-rose-600 border border-rose-200" : "bg-blue-50 text-blue-600 border border-blue-200"
                        )}
                      >
                        {isPdf ? "PDF" : "DOC"}
                      </div>
                    )}

                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-ink truncate max-w-xs sm:max-w-md">{fileName}</p>
                      <div className="flex items-center gap-3 mt-0.5">
                        {isImg && (
                          <button
                            type="button"
                            onClick={() => setLightbox({ isOpen: true, url, title: fileName })}
                            className="text-[11px] font-semibold text-amber hover:underline flex items-center gap-1"
                          >
                            <Maximize2 className="w-3 h-3" />
                            <span>Preview</span>
                          </button>
                        )}
                        <a
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] font-semibold text-blue-600 hover:underline flex items-center gap-1"
                        >
                          <span>Open Document</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleRemove(idx)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                      title="Remove document"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Lightbox Preview */}
      <ImageLightboxModal state={lightbox} onClose={() => setLightbox(null)} />
    </>
  );
}

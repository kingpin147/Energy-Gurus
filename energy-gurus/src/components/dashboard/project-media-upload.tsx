"use client";

import React, { useState, useRef } from "react";
import {
  Upload,
  Image as ImageIcon,
  Video as VideoIcon,
  Trash2,
  X,
  Loader2,
  Maximize2,
  Plus,
  Play,
  Film,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useR2Upload } from "@/lib/hooks/use-r2-upload";
import { compressImage } from "@/lib/utils/image-compression";
import { ImageLightboxModal, LightboxState } from "@/components/dashboard/multi-media-upload";

interface ProjectMediaUploadProps {
  images: string[];
  onImagesChange: (urls: string[]) => void;
  videoUrl?: string;
  onVideoChange?: (url: string) => void;
  youtubeUrl?: string;
  onYoutubeChange?: (url: string) => void;
  projectIndex?: number;
}

export function ProjectMediaUpload({
  images = [],
  onImagesChange,
  videoUrl = "",
  onVideoChange,
  youtubeUrl = "",
  onYoutubeChange,
  projectIndex = 0
}: ProjectMediaUploadProps) {
  const { uploadFile } = useR2Upload();
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [lightbox, setLightbox] = useState<LightboxState | null>(null);
  const [manualImageUrl, setManualImageUrl] = useState("");
  const [showManualImage, setShowManualImage] = useState(false);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // ── PHOTO UPLOAD (Max 3, 10MB limit, compressed) ──────────────────────────
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const availableSlots = 3 - images.length;
    if (availableSlots <= 0) {
      toast.error("Maximum 3 pictures allowed per project.");
      return;
    }

    const filesToUpload = Array.from(files).slice(0, availableSlots);
    setIsUploadingImage(true);

    let uploadedCount = 0;
    const newUrls: string[] = [];

    for (const file of filesToUpload) {
      // 10 MB limit check
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`"${file.name}" exceeds the 10 MB limit (${(file.size / (1024 * 1024)).toFixed(1)} MB).`);
        continue;
      }

      try {
        toast.loading(`Compressing & uploading "${file.name}"...`, { id: "proj-upload" });

        // Compress in browser (reduces 10MB camera photo to ~200-400KB WebP)
        const compressed = await compressImage(file, {
          maxWidth: 1920,
          maxHeight: 1920,
          quality: 0.82,
          maxSizeBytes: 10 * 1024 * 1024
        });

        const res = await uploadFile(compressed, "project-images");
        newUrls.push(res.publicUrl);
        uploadedCount++;
      } catch (err: any) {
        toast.error(err?.message || `Failed to upload "${file.name}"`);
      }
    }

    toast.dismiss("proj-upload");
    if (newUrls.length > 0) {
      onImagesChange([...images, ...newUrls].slice(0, 3));
      toast.success(`${uploadedCount} picture(s) compressed and uploaded successfully`);
    }

    setIsUploadingImage(false);
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  const handleRemoveImage = (indexToRemove: number) => {
    onImagesChange(images.filter((_, idx) => idx !== indexToRemove));
  };

  const handleAddManualImage = () => {
    if (!manualImageUrl.trim()) return;
    if (images.length >= 3) {
      toast.error("Maximum 3 pictures allowed per project.");
      return;
    }
    onImagesChange([...images, manualImageUrl.trim()]);
    setManualImageUrl("");
    setShowManualImage(false);
  };

  // ── VIDEO UPLOAD (Max 1, 100MB limit) ────────────────────────────────────
  const handleVideoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 100 MB limit check
    const maxVideoBytes = 100 * 1024 * 1024;
    if (file.size > maxVideoBytes) {
      toast.error(`Video exceeds the 100 MB limit (${(file.size / (1024 * 1024)).toFixed(1)} MB).`);
      if (videoInputRef.current) videoInputRef.current.value = "";
      return;
    }

    setIsUploadingVideo(true);
    toast.loading(`Uploading video "${file.name}" (up to 100 MB)...`, { id: "video-upload" });

    try {
      const res = await uploadFile(file, "project-videos");
      if (onVideoChange) {
        onVideoChange(res.publicUrl);
      }
      toast.dismiss("video-upload");
      toast.success("Project video uploaded successfully!");
    } catch (err: any) {
      toast.dismiss("video-upload");
      toast.error(err?.message || "Failed to upload video.");
    } finally {
      setIsUploadingVideo(false);
      if (videoInputRef.current) videoInputRef.current.value = "";
    }
  };

  const handleRemoveVideo = () => {
    if (onVideoChange) onVideoChange("");
  };

  return (
    <div className="space-y-4 pt-2 border-t border-line/80">
      <ImageLightboxModal state={lightbox} onClose={() => setLightbox(null)} />

      {/* ── 1. PICTURES SECTION (Max 3, 10MB limit) ────────────────── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-custom flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5 text-amber" /> Project Pictures ({images.length}/3)
          </Label>
          <span className="text-[10px] text-slate-custom font-medium">
            Max 3 pictures · 10 MB limit · Auto-compressed
          </span>
        </div>

        {/* Thumbnails Grid */}
        <div className="flex flex-wrap items-center gap-2.5">
          {images.map((imgUrl, imgIdx) => (
            <div
              key={imgIdx}
              className="relative group w-20 h-20 rounded-xl border border-line bg-white overflow-hidden shadow-xs shrink-0"
            >
              <img
                src={imgUrl}
                alt={`Project shot ${imgIdx + 1}`}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />

              {/* Overlay with Enlarge & Remove */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setLightbox({ isOpen: true, url: imgUrl, title: `Project Picture #${imgIdx + 1}` })}
                  className="w-7 h-7 rounded-lg bg-white/90 hover:bg-white text-ink flex items-center justify-center shadow-sm"
                  title="View large image"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleRemoveImage(imgIdx)}
                  className="w-7 h-7 rounded-lg bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-sm"
                  title="Remove picture"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Badge */}
              <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[9px] px-1 rounded font-mono font-bold">
                #{imgIdx + 1}
              </span>
            </div>
          ))}

          {/* Add Picture Button (if under 3) */}
          {images.length < 3 && (
            <div className="flex items-center gap-2">
              <label
                className={`w-20 h-20 rounded-xl border-2 border-dashed border-line hover:border-amber bg-white/80 hover:bg-amber/5 flex flex-col items-center justify-center cursor-pointer transition-all shrink-0 text-center p-1.5 ${
                  isUploadingImage ? "opacity-50 pointer-events-none" : ""
                }`}
              >
                {isUploadingImage ? (
                  <Loader2 className="w-5 h-5 text-amber animate-spin" />
                ) : (
                  <>
                    <Upload className="w-4 h-4 text-amber mb-0.5" />
                    <span className="text-[10px] font-bold text-ink">Upload</span>
                    <span className="text-[8px] text-slate-custom font-medium">&lt; 10 MB</span>
                  </>
                )}
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageSelect}
                  disabled={isUploadingImage}
                />
              </label>

              <button
                type="button"
                onClick={() => setShowManualImage(!showManualImage)}
                className="text-[11px] text-slate-custom hover:text-ink underline decoration-dotted"
              >
                {showManualImage ? "Cancel URL" : "Paste URL"}
              </button>
            </div>
          )}
        </div>

        {/* Manual URL input fallback */}
        {showManualImage && images.length < 3 && (
          <div className="flex gap-2 max-w-md pt-1">
            <Input
              value={manualImageUrl}
              onChange={(e) => setManualImageUrl(e.target.value)}
              placeholder="https://.../photo.jpg"
              className="h-8 text-xs bg-white border-line rounded-xl"
            />
            <Button
              type="button"
              size="sm"
              onClick={handleAddManualImage}
              className="h-8 px-3 text-xs font-bold rounded-xl bg-amber text-ink"
            >
              Add
            </Button>
          </div>
        )}
      </div>

      {/* ── 2. VIDEO SECTION (1 video, 100MB limit) + YOUTUBE ──────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        {/* Native Video Upload */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-custom flex items-center gap-1.5">
              <Film className="w-3.5 h-3.5 text-amber" /> Project Video (1 max)
            </Label>
            <span className="text-[9px] text-slate-custom font-medium">100 MB limit · MP4 / WebM</span>
          </div>

          {videoUrl ? (
            <div className="p-2.5 bg-white border border-line rounded-xl space-y-2">
              <video
                src={videoUrl}
                controls
                preload="metadata"
                className="w-full max-h-36 rounded-lg bg-black object-contain"
              />
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-[10px] text-teal-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Video Attached
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveVideo}
                  className="h-7 text-xs text-rose-600 hover:bg-rose-50 px-2 rounded-lg font-bold"
                >
                  <Trash2 className="w-3 h-3 mr-1" /> Remove Video
                </Button>
              </div>
            </div>
          ) : (
            <label
              className={`flex items-center justify-center gap-2 p-3 bg-white border-2 border-dashed border-line hover:border-amber rounded-xl cursor-pointer transition-colors text-center ${
                isUploadingVideo ? "opacity-50 pointer-events-none" : ""
              }`}
            >
              {isUploadingVideo ? (
                <>
                  <Loader2 className="w-4 h-4 text-amber animate-spin" />
                  <span className="text-xs font-bold text-slate-custom">Uploading video (up to 100 MB)...</span>
                </>
              ) : (
                <>
                  <VideoIcon className="w-4 h-4 text-amber" />
                  <span className="text-xs font-bold text-ink">Upload Video (up to 100 MB)</span>
                </>
              )}
              <input
                ref={videoInputRef}
                type="file"
                accept="video/mp4,video/webm,video/quicktime"
                className="hidden"
                onChange={handleVideoSelect}
                disabled={isUploadingVideo}
              />
            </label>
          )}
        </div>

        {/* YouTube Video Link */}
        <div className="space-y-1.5">
          <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-custom flex items-center gap-1.5">
            <Play className="w-3.5 h-3.5 text-rose-500" /> YouTube Video Link
          </Label>
          <Input
            value={youtubeUrl}
            onChange={(e) => onYoutubeChange && onYoutubeChange(e.target.value)}
            placeholder="https://youtube.com/watch?v=..."
            className="bg-white border-line h-10 text-xs rounded-xl"
          />
          <p className="text-[10px] text-slate-custom">
            Optional client walk-through or installation showcase video on YouTube.
          </p>
        </div>
      </div>
    </div>
  );
}


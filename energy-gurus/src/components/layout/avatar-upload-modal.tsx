"use client";

import React, { useState, useRef, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  UploadCloud,
  X,
  Check,
  AlertCircle,
  Loader2,
  Trash2,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import { updateUserAvatar } from "@/lib/actions/users";
import { useUser } from "@clerk/nextjs";

interface AvatarUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatar?: string | null;
  userName?: string | null;
  onAvatarUpdated?: (newUrl: string | null) => void;
}

const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB strictly enforced

export function AvatarUploadModal({
  isOpen,
  onClose,
  currentAvatar,
  userName = "User",
  onAvatarUpdated,
}: AvatarUploadModalProps) {
  const { user } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const resetState = useCallback(() => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setIsUploading(false);
    setUploadProgress(0);
    setErrorMessage(null);
  }, [previewUrl]);

  const handleClose = () => {
    if (isUploading) return;
    resetState();
    onClose();
  };

  const validateAndSetFile = (file: File) => {
    setErrorMessage(null);

    // 1. File type validation
    if (!file.type.startsWith("image/")) {
      const msg = "Please select a valid image file (PNG, JPG, WEBP, GIF, SVG).";
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    // 2. File size validation (Strictly <= 20 MB)
    if (file.size > MAX_FILE_SIZE_BYTES) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      const msg = `File is too large (${sizeMb} MB). Maximum allowed size is 20 MB.`;
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    const objectUrl = URL.createObjectURL(file);
    setSelectedFile(file);
    setPreviewUrl(objectUrl);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(10);
    setErrorMessage(null);

    try {
      // 1. Upload file to Cloudflare R2 via multipart API
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("folder", "user-avatars");
      formData.append("fileType", selectedFile.type || "image/png");

      const xhr = new XMLHttpRequest();

      const uploadPromise = new Promise<{ publicUrl: string; key: string }>((resolve, reject) => {
        xhr.open("POST", "/api/r2/sign");

        xhr.upload.onprogress = (evt) => {
          if (evt.lengthComputable) {
            const percent = Math.round((evt.loaded / evt.total) * 90);
            setUploadProgress(Math.max(10, percent));
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const res = JSON.parse(xhr.responseText);
              resolve(res);
            } catch {
              reject(new Error("Invalid response from storage server."));
            }
          } else {
            let errorText = xhr.responseText || "Upload failed";
            if (xhr.status === 413) {
              errorText = "File exceeds maximum size allowed by server (20 MB).";
            }
            reject(new Error(errorText));
          }
        };

        xhr.onerror = () => reject(new Error("Network connection error during upload."));
        xhr.ontimeout = () => reject(new Error("Upload timed out. Please try again."));
        xhr.send(formData);
      });

      const { publicUrl } = await uploadPromise;
      setUploadProgress(95);

      // 2. Persist to PostgreSQL users table and Clerk publicMetadata
      await updateUserAvatar(publicUrl);
      setUploadProgress(100);

      // 3. Reload Clerk active user session so UI immediately reflects the new avatar
      if (user) {
        await user.reload().catch(() => {});
      }

      toast.success("Profile avatar updated successfully!");
      if (onAvatarUpdated) {
        onAvatarUpdated(publicUrl);
      }
      handleClose();
    } catch (err: any) {
      console.error("[AvatarUpload] Upload error:", err);
      const msg = err.message || "Failed to upload avatar. Please try again.";
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!confirm("Are you sure you want to remove your custom avatar?")) return;

    setIsUploading(true);
    try {
      await updateUserAvatar(null);
      if (user) {
        await user.reload().catch(() => {});
      }
      toast.success("Avatar removed.");
      if (onAvatarUpdated) {
        onAvatarUpdated(null);
      }
      handleClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to remove avatar");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden bg-white border border-line rounded-2xl shadow-xl font-sans">
        {/* Header */}
        <DialogHeader className="p-6 pb-4 border-b border-line bg-paper/30">
          <DialogTitle className="text-lg font-bold text-navy-deep flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-amber" />
            Change Profile Avatar
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 font-ibm-plex-mono mt-1">
            Upload a profile photo or company emblem. Saved in Cloudflare R2 (Max 20 MB).
          </DialogDescription>
        </DialogHeader>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Avatar Preview Section */}
          <div className="flex items-center gap-4 bg-paper/60 p-4 rounded-xl border border-line/80">
            <Avatar className="h-16 w-16 rounded-full border-2 border-line bg-white shadow-xs shrink-0 overflow-hidden">
              <AvatarImage
                src={previewUrl || currentAvatar || undefined}
                alt={userName || "User"}
                className="object-cover w-full h-full"
              />
              <AvatarFallback className="bg-amber/10 text-amber font-bold text-lg font-ibm-plex-mono">
                {getInitials(userName)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-bold text-navy-deep truncate">
                {userName}
              </div>
              <div className="text-xs text-slate-400 font-ibm-plex-mono mt-0.5">
                {selectedFile
                  ? `Selected: ${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`
                  : currentAvatar
                  ? "Custom avatar active in R2"
                  : "Default initials active"}
              </div>
              {currentAvatar && !selectedFile && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  disabled={isUploading}
                  className="mt-1 text-xs text-rose-600 hover:text-rose-700 flex items-center gap-1 font-medium transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Remove photo
                </button>
              )}
            </div>
          </div>

          {/* Drag & Drop Upload Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
              isDragging
                ? "border-amber bg-amber/5"
                : "border-line hover:border-amber/60 hover:bg-paper/40"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="w-12 h-12 rounded-full bg-amber/10 flex items-center justify-center text-amber mb-3">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div className="text-sm font-semibold text-navy-deep">
              {selectedFile ? "Click or drag to choose another photo" : "Click or drag photo here"}
            </div>
            <div className="text-xs text-slate-400 font-ibm-plex-mono mt-1">
              PNG, JPG, WEBP, GIF, SVG up to <strong className="text-slate-600">20 MB</strong>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Upload Progress Bar */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-ibm-plex-mono text-slate-500">
                <span>Uploading to Cloudflare R2...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-line">
                <div
                  className="bg-amber h-full transition-all duration-300 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-line bg-paper/20 flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isUploading}
            className="rounded-lg text-xs font-semibold border-line hover:bg-slate-50"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            className="bg-amber hover:bg-amber-deep text-white font-semibold text-xs rounded-lg px-4 shadow-sm transition-all flex items-center gap-2"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving to R2...</span>
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Save Avatar</span>
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import * as React from "react";
import { Upload, FileText, Loader2, AlertCircle, RefreshCw, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export interface UploadZoneProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value"> {
  onUpload: (file: File) => Promise<void>;
  isUploading?: boolean;
  progress?: number;
  onCancel?: () => void;
  value?: string;
  title?: string;
  description?: string;
  recommendedDimensions?: string;
  maxSizeMB?: number;
  errorMessage?: string;
}

export function UploadZone({
  onUpload,
  isUploading = false,
  progress = 0,
  onCancel,
  value,
  title = "Click or drag to upload",
  description = "PNG, JPG, or WEBP up to 10MB",
  recommendedDimensions,
  maxSizeMB = 10,
  errorMessage: externalErrorMessage,
  accept = "image/*",
  className,
  ...props
}: UploadZoneProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [internalError, setInternalError] = React.useState<string | null>(null);
  const [lastFile, setLastFile] = React.useState<File | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);

  const activeError = externalErrorMessage || internalError;

  const handleProcessFile = async (file: File) => {
    setInternalError(null);
    setLastFile(file);

    const maxBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
      const err = `File "${file.name}" (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds maximum allowed size of ${maxSizeMB}MB.`;
      setInternalError(err);
      toast.error(err);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    try {
      await onUpload(file);
      setInternalError(null);
    } catch (err: any) {
      const msg = err?.message || "Failed to upload file. Please try again.";
      setInternalError(msg);
      // Ensure toast appears
      toast.error(msg);
    } finally {
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleProcessFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isUploading) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (isUploading) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      await handleProcessFile(file);
    }
  };

  const handleRetry = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lastFile) {
      handleProcessFile(lastFile);
    } else {
      inputRef.current?.click();
    }
  };

  const handleDismissError = (e: React.MouseEvent) => {
    e.stopPropagation();
    setInternalError(null);
  };

  const isImage = value?.match(/\.(jpeg|jpg|gif|png|webp|svg)(\?.*)?$/i) || accept?.includes("image") || value?.includes("/news-covers/") || value?.includes("/news-authors/");

  return (
    <div className="space-y-2">
      <div
        onClick={() => !isUploading && inputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragEnter={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-200 select-none",
          isDragging
            ? "border-amber bg-amber/5 scale-[1.005]"
            : activeError && !isUploading
            ? "border-rose-300 bg-rose-50/50 hover:bg-rose-50"
            : isUploading
            ? "border-amber/40 bg-amber/5 cursor-wait"
            : "border-line bg-slate-50/70 hover:border-amber/60 hover:bg-white hover:shadow-sm",
          value ? "p-4" : "",
          className
        )}
      >
        <input
          type="file"
          ref={inputRef}
          className="hidden"
          accept={accept}
          onChange={handleChange}
          disabled={isUploading}
          {...props}
        />

        {/* 1. UPLOADING STATE WITH CANCEL OPTION */}
        {isUploading ? (
          <div className="flex flex-col items-center gap-3 text-center w-full max-w-sm py-2">
            <div className="relative">
              <Loader2 className="h-9 w-9 animate-spin text-amber" />
            </div>

            <div className="space-y-1 w-full">
              <p className="text-sm font-bold text-ink">
                Uploading image... {progress > 0 ? `${progress}%` : ""}
              </p>
              <p className="text-xs text-slate-custom">
                Transferring to secure cloud storage
              </p>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-amber h-full transition-all duration-300 ease-out rounded-full"
                style={{ width: `${Math.max(8, Math.min(100, progress))}%` }}
              />
            </div>

            {/* Cancel Button */}
            {onCancel && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onCancel();
                  toast.info("Upload cancelled");
                }}
                className="mt-1 text-xs text-rose-600 hover:text-rose-700 font-semibold px-3 py-1 rounded-lg hover:bg-rose-100/50 transition-colors"
              >
                Cancel Upload
              </button>
            )}
          </div>
        ) : activeError ? (
          /* 2. CLEAR ERROR STATE (NEVER STUCK) */
          <div className="flex flex-col items-center text-center gap-2.5 py-1 w-full max-w-md">
            <div className="h-10 w-10 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center">
              <AlertCircle className="h-5 w-5" />
            </div>

            <div className="space-y-1">
              <p className="text-sm font-bold text-rose-800">Upload Failed</p>
              <p className="text-xs text-rose-600 font-medium px-2 leading-relaxed">
                {activeError}
              </p>
            </div>

            <div className="flex items-center gap-2 mt-1">
              {lastFile && (
                <button
                  type="button"
                  onClick={handleRetry}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-amber hover:bg-amber-600 rounded-lg shadow-sm transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Try Again
                </button>
              )}
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-ink bg-white border border-line hover:bg-slate-100 rounded-lg shadow-sm transition-colors"
              >
                <Upload className="w-3.5 h-3.5 text-slate-custom" /> Choose Another File
              </button>
              <button
                type="button"
                onClick={handleDismissError}
                aria-label="Dismiss error"
                className="p-1.5 text-slate-custom hover:text-ink rounded-lg hover:bg-slate-200/50 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : value ? (
          /* 3. UPLOADED VALUE PREVIEW */
          <div className="flex flex-col items-center gap-3">
            {isImage ? (
              <div className="relative group/preview">
                <img
                  src={value}
                  alt="Uploaded preview"
                  className="max-h-40 max-w-full object-contain rounded-xl border border-line bg-white shadow-sm"
                />
              </div>
            ) : (
              <div className="h-16 w-16 bg-white border border-line rounded-xl flex items-center justify-center shadow-sm">
                <FileText className="h-8 w-8 text-teal" />
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="text-xs text-teal font-bold flex items-center gap-1 bg-teal/10 px-2.5 py-1 rounded-full border border-teal/20">
                ✓ Image Uploaded
              </span>
              <span className="text-xs text-slate-custom hover:text-ink underline decoration-slate-300">
                Click or drop to replace
              </span>
            </div>
          </div>
        ) : (
          /* 4. DEFAULT EMPTY STATE */
          <div className="flex flex-col items-center text-center gap-2">
            <div className="h-11 w-11 bg-white border border-line rounded-2xl flex items-center justify-center shadow-sm text-slate-500 group-hover:text-amber transition-colors">
              <Upload className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-ink">{title}</p>
              <p className="text-xs text-slate-custom mt-0.5">{description}</p>
              {recommendedDimensions && (
                <span className="inline-block mt-1.5 text-[11px] font-semibold text-amber-800 bg-amber/10 border border-amber/20 px-2 py-0.5 rounded-full">
                  📐 Recommended: {recommendedDimensions}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Helper dimension text below upload zone if provided */}
      {recommendedDimensions && !activeError && !isUploading && (
        <div className="flex items-center justify-between text-[11px] text-slate-custom px-1">
          <span>Supported: JPG, PNG, WEBP, GIF (Max {maxSizeMB}MB)</span>
          <span className="font-semibold text-ink">Dimensions: {recommendedDimensions}</span>
        </div>
      )}
    </div>
  );
}

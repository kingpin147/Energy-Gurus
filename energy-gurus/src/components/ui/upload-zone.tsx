"use client";

import * as React from "react";
import { Upload, Image as ImageIcon, FileText, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadZoneProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onUpload: (file: File) => Promise<void>;
  isUploading?: boolean;
  value?: string;
  title?: string;
  description?: string;
}

export function UploadZone({
  onUpload,
  isUploading,
  value,
  title = "Click to upload",
  description = "PDF or image, up to 10MB each",
  accept,
  className,
  ...props
}: UploadZoneProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUpload) {
      await onUpload(file);
    }
  };

  const isImage = value?.match(/\.(jpeg|jpg|gif|png|webp)$/i) || accept?.includes("image");

  return (
    <div
      onClick={() => !isUploading && inputRef.current?.click()}
      className={cn(
        "relative flex flex-col items-center justify-center p-6 border border-dashed rounded-lg cursor-pointer transition-colors",
        isUploading ? "opacity-70 pointer-events-none" : "hover:border-teal hover:bg-teal/5 border-line bg-slate-50",
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
      
      {isUploading ? (
        <div className="flex flex-col items-center gap-2 text-amber">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="text-sm font-medium">Uploading...</span>
        </div>
      ) : value ? (
        <div className="flex flex-col items-center gap-3">
          {isImage ? (
             <img src={value} alt="Uploaded preview" className="h-24 object-contain rounded-md border border-line bg-white" />
          ) : (
            <div className="h-16 w-16 bg-white border border-line rounded-lg flex items-center justify-center">
              <FileText className="h-8 w-8 text-slate-custom" />
            </div>
          )}
          <div className="text-xs text-teal font-medium flex items-center gap-1 bg-teal/10 px-2 py-1 rounded">
             ✓ File Uploaded
          </div>
          <span className="text-xs text-slate-custom underline decoration-slate-300 hover:text-ink">Click to change</span>
        </div>
      ) : (
        <div className="flex flex-col items-center text-center gap-2">
          <div className="h-10 w-10 bg-white border border-line rounded-full flex items-center justify-center shadow-sm">
            <Upload className="h-5 w-5 text-slate-custom" />
          </div>
          <div>
            <p className="text-sm font-semibold text-ink">{title}</p>
            <p className="text-xs text-slate-custom mt-1">{description}</p>
          </div>
        </div>
      )}
    </div>
  );
}

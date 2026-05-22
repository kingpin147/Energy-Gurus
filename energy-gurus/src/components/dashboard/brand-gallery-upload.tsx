"use client";

import { updateBrandProfile } from "@/lib/actions/brand";
import { Trash2, Plus, Upload } from "lucide-react";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useR2Upload } from "@/lib/hooks/use-r2-upload";
import { toast } from "sonner";

interface BrandGalleryUploadProps {
  initialPhotos?: string[] | null;
}

export function BrandGalleryUpload({ initialPhotos }: BrandGalleryUploadProps) {
  const router = useRouter();
  const [photos, setPhotos] = useState(initialPhotos || []);
  const { uploadFile, isUploading } = useR2Upload();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      const newUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const { publicUrl } = await uploadFile(files[i], "brand-gallery");
        newUrls.push(publicUrl);
      }

      const updatedPhotos = [...photos, ...newUrls];
      setPhotos(updatedPhotos);
      await updateBrandProfile({ photos: updatedPhotos });
      toast.success(`${files.length} photo(s) uploaded`);
      router.refresh();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteImage = async (urlToDelete: string) => {
    const updatedPhotos = photos.filter(url => url !== urlToDelete);
    setPhotos(updatedPhotos);
    await updateBrandProfile({ photos: updatedPhotos });
    toast.success("Image removed from gallery");
    router.refresh();
  };

  return (
    <div className="pt-6 border-t space-y-4">
      <label className="text-xs font-bold uppercase tracking-widest opacity-60">Brand Gallery</label>
      <div className="grid grid-cols-3 gap-3">
        {photos.map((url, i) => (
          <div key={i} className="aspect-square rounded-2xl border overflow-hidden relative group shadow-sm bg-white">
            <img src={url} className="w-full h-full object-cover" alt={`Brand Gallery ${i + 1}`} />
            <button
              onClick={() => handleDeleteImage(url)}
              className="absolute inset-0 bg-red-600/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ))}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="aspect-square rounded-2xl border-2 border-dashed border-secondary/20 flex flex-col items-center justify-center bg-secondary/5 hover:bg-secondary/10 transition-all gap-2"
        >
          {isUploading ? (
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <div className="p-2 bg-primary/10 rounded-xl">
                <Plus className="w-5 h-5 text-primary" />
              </div>
              <span className="text-[8px] font-black uppercase tracking-widest opacity-40">Add Photos</span>
            </>
          )}
        </button>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        multiple
        onChange={handleFileChange}
      />
    </div>
  );
}

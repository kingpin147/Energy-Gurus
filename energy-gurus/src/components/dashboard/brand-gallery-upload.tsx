"use client";

import { UploadButton } from "@/lib/uploadthing";
import { updateBrandProfile } from "@/lib/actions/brand";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface BrandGalleryUploadProps {
  initialPhotos?: string[] | null;
}

export function BrandGalleryUpload({ initialPhotos }: BrandGalleryUploadProps) {
  const router = useRouter();
  const [photos, setPhotos] = useState(initialPhotos || []);

  const handleUploadComplete = async (res: any) => {
    const newUrls = res.map((f: any) => f.url);
    const updatedPhotos = [...photos, ...newUrls];
    setPhotos(updatedPhotos);
    await updateBrandProfile({ photos: updatedPhotos });
    router.refresh();
  };

  const handleDeleteImage = async (urlToDelete: string) => {
    const updatedPhotos = photos.filter(url => url !== urlToDelete);
    setPhotos(updatedPhotos);
    await updateBrandProfile({ photos: updatedPhotos });
    router.refresh();
  };

  return (
    <div className="pt-6 border-t space-y-4">
      <label className="text-xs font-bold uppercase tracking-widest opacity-60">Brand Gallery</label>
      <div className="grid grid-cols-2 gap-2">
        {photos.map((url, i) => (
          <div key={i} className="aspect-square rounded-xl border overflow-hidden relative group">
            <img src={url} className="w-full h-full object-cover" alt={`Brand Gallery ${i + 1}`} />
            <button
              onClick={() => handleDeleteImage(url)}
              className="absolute inset-0 bg-red-600/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>
      <UploadButton
        endpoint="epcPortfolio"
        onClientUploadComplete={handleUploadComplete}
      />
    </div>
  );
}

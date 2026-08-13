"use client";

import { updateEpcProfile } from "@/lib/actions/epc";
import { Trash2, Upload, Plus, Video } from "lucide-react";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useR2Upload } from "@/lib/hooks/use-r2-upload";
import { toast } from "sonner";

interface ReviewVideosUploadProps {
  initialVideos?: string[] | null;
}

export function ReviewVideosUpload({ initialVideos }: ReviewVideosUploadProps) {
  const router = useRouter();
  const [videos, setVideos] = useState<string[]>(initialVideos || []);
  const { uploadFile, isUploading } = useR2Upload();
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleVideoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    try {
      const newUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        // We might want to use a specific folder for review videos
        const { publicUrl } = await uploadFile(files[i], "epc-reviews");
        newUrls.push(publicUrl);
      }
      const updatedVideos = [...videos, ...newUrls];
      setVideos(updatedVideos);
      await updateEpcProfile({ reviewVideos: updatedVideos });
      toast.success(`${files.length} video(s) uploaded successfully`);
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload videos");
    }
  };

  const handleDeleteVideo = async (urlToDelete: string) => {
    const updatedVideos = videos.filter((url) => url !== urlToDelete);
    setVideos(updatedVideos);
    await updateEpcProfile({ reviewVideos: updatedVideos });
    toast.success("Video removed successfully");
    router.refresh();
  };

  return (
    <div>
      <label className="block text-xs font-bold uppercase tracking-widest opacity-60 mb-4">
        Customer Review Videos
      </label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {videos.map((url, i) => (
          <div
            key={i}
            className="aspect-video rounded-2xl border overflow-hidden relative group shadow-sm bg-black flex items-center justify-center"
          >
            <video
              src={url}
              className="w-full h-full object-contain"
              controls
            />
            <button
              onClick={() => handleDeleteVideo(url)}
              className="absolute top-2 right-2 bg-red-600/90 hover:bg-red-600 text-white p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity z-10"
              title="Delete video"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ))}
        <button
          onClick={() => videoInputRef.current?.click()}
          disabled={isUploading}
          className="aspect-video rounded-2xl border-2 border-dashed border-paper/20 flex flex-col items-center justify-center bg-paper/5 hover:bg-paper/10 transition-all gap-2"
        >
          {isUploading ? (
            <div className="w-5 h-5 border-2 border-amber border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Video className="w-6 h-6 text-amber/40 mb-2" />
              <span className="text-xs font-black uppercase tracking-widest opacity-40">
                Upload Video
              </span>
              <span className="text-[10px] text-slate-custom">
                MP4, WebM (Max 50MB)
              </span>
            </>
          )}
        </button>
      </div>
      <input
        type="file"
        ref={videoInputRef}
        className="hidden"
        accept="video/*"
        multiple
        onChange={handleVideoChange}
      />
    </div>
  );
}

"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Plus, CheckCircle2, Upload, ImageIcon } from "lucide-react";
import { addPodcast } from "@/lib/actions/content";
import { useR2Upload } from "@/lib/hooks/use-r2-upload";
import { toast } from "sonner";

export function PodcastForm() {
    const [thumbnailUrl, setThumbnailUrl] = useState("");
    const [fileName, setFileName] = useState("");
    const { uploadFile, isUploading } = useR2Upload();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const { publicUrl } = await uploadFile(file, "podcast-thumbnails");
            setThumbnailUrl(publicUrl);
            setFileName(file.name);
            toast.success("Thumbnail uploaded");
        } catch (error) {
            console.error(error);
            toast.error("Failed to upload thumbnail");
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const formData = new FormData(e.currentTarget);
            await addPodcast(formData);
            toast.success("Podcast added successfully");
            if (e.currentTarget) e.currentTarget.reset();
            setThumbnailUrl("");
            setFileName("");
        } catch (error) {
            console.error(error);
            toast.error("Failed to add podcast");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest opacity-60">Title</label>
                <input name="title" className="w-full border rounded-xl p-3 bg-secondary/5 focus:ring-2 focus:ring-primary outline-none transition-all" required />
            </div>
            <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest opacity-60">YouTube URL</label>
                <input name="youtubeUrl" placeholder="https://youtube.com/watch?v=..." className="w-full border rounded-xl p-3 bg-secondary/5 focus:ring-2 focus:ring-primary outline-none transition-all" required />
            </div>
            <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest opacity-60">Thumbnail Image (Required)</label>
                <div className="flex flex-col gap-3">
                    {!thumbnailUrl ? (
                        <div className="w-full">
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploading || isSubmitting}
                                className="w-full bg-[#003e3e] hover:bg-[#002a2a] text-white font-bold rounded-xl h-12 flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-[#003e3e]/20"
                            >
                                {isUploading ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <ImageIcon className="w-4 h-4" />
                                )}
                                {isUploading ? "Uploading..." : "Choose Thumbnail Image"}
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-xl animate-in fade-in slide-in-from-top-1">
                            <div className="w-16 aspect-video rounded-lg border bg-white overflow-hidden shrink-0">
                                <img src={thumbnailUrl} className="w-full h-full object-cover" alt="" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 text-green-600 text-sm font-bold">
                                    <CheckCircle2 className="w-4 h-4" /> Ready to Add
                                </div>
                                <p className="text-[10px] text-green-700/60 font-medium truncate">{fileName}</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => { setThumbnailUrl(""); setFileName(""); }}
                                className="text-[10px] font-black uppercase text-red-500 hover:underline"
                            >
                                Remove
                            </button>
                        </div>
                    )}
                    <input type="hidden" name="thumbnailUrl" value={thumbnailUrl} required />
                </div>
            </div>
            <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest opacity-60">Guest Name</label>
                <input name="guestName" className="w-full border rounded-xl p-3 bg-secondary/5 focus:ring-2 focus:ring-primary outline-none transition-all" />
            </div>
            <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest opacity-60">Description</label>
                <textarea name="description" rows={3} className="w-full border rounded-xl p-3 bg-secondary/5 focus:ring-2 focus:ring-primary outline-none transition-all" />
            </div>
            <Button
                type="submit"
                disabled={isUploading || isSubmitting || !thumbnailUrl}
                className="w-full rounded-xl font-bold h-12 gap-2 transition-all"
            >
                {isSubmitting ? "Processing..." : <><Plus className="w-4 h-4" /> Add Episode</>}
            </Button>
        </form>
    );
}

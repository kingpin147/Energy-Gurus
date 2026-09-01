"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Save, CheckCircle2, ImageIcon, Pencil } from "lucide-react";
import { updatePodcast } from "@/lib/actions/content";
import { useR2Upload } from "@/lib/hooks/use-r2-upload";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

type Podcast = {
    id: string;
    title: string;
    description: string | null;
    youtubeUrl: string;
    thumbnailUrl: string | null;
    guestName: string | null;
};

export function EditPodcastDialog({ podcast }: { podcast: Podcast }) {
    const [open, setOpen] = useState(false);
    const [thumbnailUrl, setThumbnailUrl] = useState(podcast.thumbnailUrl || "");
    const [fileName, setFileName] = useState(podcast.thumbnailUrl ? "Existing thumbnail" : "");
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
            await updatePodcast(podcast.id, formData);
            toast.success("Podcast updated successfully");
            setOpen(false);
        } catch (error) {
            console.error(error);
            toast.error("Failed to update podcast");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="icon" className="bg-white/80 hover:bg-white text-slate-700 shadow-sm rounded-full w-8 h-8">
                    <Pencil className="w-4 h-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Edit Podcast</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest opacity-60">Title</label>
                        <input name="title" defaultValue={podcast.title} className="w-full border rounded-xl p-3 bg-paper/5 focus:ring-2 focus:ring-primary outline-none transition-all" required />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest opacity-60">YouTube URL</label>
                        <input name="youtubeUrl" defaultValue={podcast.youtubeUrl} placeholder="https://youtube.com/watch?v=..." className="w-full border rounded-xl p-3 bg-paper/5 focus:ring-2 focus:ring-primary outline-none transition-all" required />
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
                                            <CheckCircle2 className="w-4 h-4" /> Ready
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
                        <input name="guestName" defaultValue={podcast.guestName || ""} className="w-full border rounded-xl p-3 bg-paper/5 focus:ring-2 focus:ring-primary outline-none transition-all" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest opacity-60">Description</label>
                        <textarea name="description" defaultValue={podcast.description || ""} rows={3} className="w-full border rounded-xl p-3 bg-paper/5 focus:ring-2 focus:ring-primary outline-none transition-all" />
                    </div>
                    <Button
                        type="submit"
                        disabled={isUploading || isSubmitting || !thumbnailUrl}
                        className="w-full rounded-xl font-bold h-12 gap-2 transition-all"
                    >
                        {isSubmitting ? "Saving..." : <><Save className="w-4 h-4" /> Save Changes</>}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}

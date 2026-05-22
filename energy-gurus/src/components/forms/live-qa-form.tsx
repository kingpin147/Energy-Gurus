"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Plus, CheckCircle2, Upload, ImageIcon, UserCircle } from "lucide-react";
import { addLiveQA } from "@/lib/actions/content";
import { useR2Upload } from "@/lib/hooks/use-r2-upload";
import { toast } from "sonner";

export function LiveQAForm() {
    const [thumbnailUrl, setThumbnailUrl] = useState("");
    const [expertPhotoUrl, setExpertPhotoUrl] = useState("");
    const [fileName, setFileName] = useState("");

    const { uploadFile, isUploading } = useR2Upload();
    const [localIsExpertUploading, setLocalIsExpertUploading] = useState(false);

    const thumbnailInputRef = useRef<HTMLInputElement>(null);
    const expertPhotoInputRef = useRef<HTMLInputElement>(null);

    const handleThumbnailChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const { publicUrl } = await uploadFile(file, "live-qa-thumbnails");
            setThumbnailUrl(publicUrl);
            setFileName(file.name);
            toast.success("Thumbnail uploaded");
        } catch (error) {
            console.error(error);
        }
    };

    const handleExpertPhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLocalIsExpertUploading(true);
        try {
            const { publicUrl } = await uploadFile(file, "expert-photos");
            setExpertPhotoUrl(publicUrl);
            toast.success("Expert photo uploaded");
        } catch (error) {
            console.error(error);
        } finally {
            setLocalIsExpertUploading(false);
        }
    };

    return (
        <form action={addLiveQA} className="space-y-4">
            <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest opacity-60">Topic</label>
                <input name="topic" className="w-full border rounded-xl p-3 bg-secondary/5 focus:ring-2 focus:ring-primary outline-none" required />
            </div>
            <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest opacity-60">Description</label>
                <textarea name="description" className="w-full border rounded-xl p-3 bg-secondary/5 focus:ring-2 focus:ring-primary outline-none h-24" />
            </div>
            <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest opacity-60">YouTube URL</label>
                <input name="youtubeUrl" className="w-full border rounded-xl p-3 bg-secondary/5 focus:ring-2 focus:ring-primary outline-none" required />
            </div>
            <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest opacity-60">Thumbnail Image (Required)</label>
                <div className="flex flex-col gap-3">
                    {!thumbnailUrl ? (
                        <div className="w-full">
                            <input
                                type="file"
                                ref={thumbnailInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleThumbnailChange}
                            />
                            <button
                                type="button"
                                onClick={() => thumbnailInputRef.current?.click()}
                                disabled={isUploading}
                                className="w-full bg-[#003e3e] hover:bg-[#002a2a] text-white font-bold rounded-xl h-12 flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-[#003e3e]/20"
                            >
                                {isUploading && !localIsExpertUploading ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <ImageIcon className="w-4 h-4" />
                                )}
                                {isUploading && !localIsExpertUploading ? "Uploading..." : "Choose Thumbnail Image"}
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-xl">
                            <div className="w-16 aspect-video rounded-lg border bg-white overflow-hidden shrink-0">
                                <img src={thumbnailUrl} className="w-full h-full object-cover" alt="" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 text-green-600 text-sm font-bold">
                                    <CheckCircle2 className="w-4 h-4" /> Ready to Schedule
                                </div>
                                <p className="text-[10px] text-green-700/60 font-medium truncate">{fileName}</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setThumbnailUrl("")}
                                className="text-[10px] font-black uppercase text-red-500 hover:underline"
                            >
                                Remove
                            </button>
                        </div>
                    )}
                    <input type="hidden" name="thumbnailUrl" value={thumbnailUrl} required />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest opacity-60">Expert Name</label>
                    <input name="expertName" className="w-full border rounded-xl p-3 bg-secondary/5 focus:ring-2 focus:ring-primary outline-none" />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest opacity-60">Expert Title</label>
                    <input name="expertTitle" className="w-full border rounded-xl p-3 bg-secondary/5 focus:ring-2 focus:ring-primary outline-none" placeholder="e.g. Solar Engineer" />
                </div>
            </div>
            <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest opacity-60">Expert Photo</label>
                <div className="flex flex-col gap-3">
                    {!expertPhotoUrl ? (
                        <div className="w-full">
                            <input
                                type="file"
                                ref={expertPhotoInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleExpertPhotoChange}
                            />
                            <button
                                type="button"
                                onClick={() => expertPhotoInputRef.current?.click()}
                                disabled={isUploading}
                                className="w-full bg-secondary/10 hover:bg-secondary/20 text-primary font-bold rounded-xl h-10 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                            >
                                {localIsExpertUploading ? (
                                    <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <UserCircle className="w-4 h-4" />
                                )}
                                {localIsExpertUploading ? "Uploading..." : "Choose Expert Photo"}
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3 p-2 bg-secondary/5 border rounded-xl">
                            <div className="w-10 h-10 rounded-full border bg-white overflow-hidden shrink-0">
                                <img src={expertPhotoUrl} className="w-full h-full object-cover" alt="" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[10px] text-primary font-bold">Photo Uploaded</p>
                            </div>
                            <Button variant="ghost" size="sm" type="button" onClick={() => setExpertPhotoUrl("")} className="h-8 text-[10px] font-bold">Change</Button>
                        </div>
                    )}
                    <input type="hidden" name="expertPhotoUrl" value={expertPhotoUrl} />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest opacity-60">Status</label>
                    <select name="status" className="w-full border rounded-xl p-3 bg-secondary/5 focus:ring-2 focus:ring-primary outline-none appearance-none">
                        <option value="upcoming">Upcoming</option>
                        <option value="live">Live Now</option>
                        <option value="archived">Archived</option>
                    </select>
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest opacity-60">Session Date/Time</label>
                    <input name="sessionDate" type="datetime-local" className="w-full border rounded-xl p-3 bg-secondary/5 focus:ring-2 focus:ring-primary outline-none" />
                </div>
            </div>
            <Button
                type="submit"
                disabled={isUploading || !thumbnailUrl}
                className="w-full rounded-xl font-bold h-12 gap-2"
            >
                {isUploading ? "Processing..." : <><Plus className="w-4 h-4" /> Add Session</>}
            </Button>
        </form>
    );
}

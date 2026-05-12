"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { UploadButton } from "@/lib/uploadthing";
import { Plus, CheckCircle2 } from "lucide-react";
import { addLiveQA } from "@/lib/actions/content";

export function LiveQAForm() {
    const [thumbnailUrl, setThumbnailUrl] = useState("");
    const [expertPhotoUrl, setExpertPhotoUrl] = useState("");
    const [fileName, setFileName] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [isExpertUploading, setIsExpertUploading] = useState(false);

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
                        <UploadButton
                            endpoint="brandLogo"
                            onUploadBegin={() => setIsUploading(true)}
                            onClientUploadComplete={(res) => {
                                setThumbnailUrl(res[0].url);
                                setFileName(res[0].name);
                                setIsUploading(false);
                            }}
                            onUploadError={() => {
                                setIsUploading(false);
                                alert("Upload failed. Please try again.");
                            }}
                            content={{
                                button: isUploading ? "Uploading... Please Wait" : "Choose Thumbnail Image",
                                allowedContent: null
                            }}
                            appearance={{
                                button: "!bg-[#003e3e] !hover:bg-[#002a2a] !rounded-xl !font-bold !text-sm !h-12 !w-full !shadow-lg !shadow-[#003e3e]/20 !transition-all !border-none !text-white !p-0 !m-0",
                                allowedContent: "hidden",
                                container: "!w-full !max-w-full !p-0 !m-0"
                            }}
                        />
                    ) : (
                        <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-xl">
                            <div className="w-16 aspect-video rounded-lg border bg-white overflow-hidden shrink-0">
                                <img src={thumbnailUrl} className="w-full h-full object-cover" alt="" />
                            </div>
                            <div className="min-w-0">
                                <div className="flex items-center gap-2 text-green-600 text-sm font-bold">
                                    <CheckCircle2 className="w-4 h-4" /> Ready to Schedule
                                </div>
                                <p className="text-[10px] text-green-700/60 font-medium truncate">{fileName}</p>
                            </div>
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
                        <UploadButton
                            endpoint="brandLogo"
                            onUploadBegin={() => setIsExpertUploading(true)}
                            onClientUploadComplete={(res) => {
                                setExpertPhotoUrl(res[0].url);
                                setIsExpertUploading(false);
                            }}
                            onUploadError={() => {
                                setIsExpertUploading(false);
                                alert("Upload failed. Please try again.");
                            }}
                            content={{
                                button: isExpertUploading ? "Uploading..." : "Choose Expert Photo",
                                allowedContent: null
                            }}
                            appearance={{
                                button: "!bg-secondary/10 !hover:bg-secondary/20 !rounded-xl !font-bold !text-xs !h-10 !w-full !transition-all !border-none !text-primary !p-0 !m-0",
                                allowedContent: "hidden",
                                container: "!w-full !max-w-full !p-0 !m-0"
                            }}
                        />
                    ) : (
                        <div className="flex items-center gap-3 p-2 bg-secondary/5 border rounded-xl">
                            <div className="w-10 h-10 rounded-full border bg-white overflow-hidden shrink-0">
                                <img src={expertPhotoUrl} className="w-full h-full object-cover" alt="" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[10px] text-primary font-bold">Photo Uploaded</p>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => setExpertPhotoUrl("")} className="h-8 text-[10px] font-bold">Change</Button>
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
                disabled={isUploading || isExpertUploading || !thumbnailUrl}
                className="w-full rounded-xl font-bold h-12 gap-2"
            >
                {isUploading || isExpertUploading ? "Processing..." : <><Plus className="w-4 h-4" /> Add Session</>}
            </Button>
        </form>
    );
}

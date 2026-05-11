"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { UploadButton } from "@/lib/uploadthing";
import { Plus, CheckCircle2 } from "lucide-react";
import { addLiveQA } from "@/lib/actions/content";

export function LiveQAForm() {
    const [thumbnailUrl, setThumbnailUrl] = useState("");
    const [fileName, setFileName] = useState("");
    const [isUploading, setIsUploading] = useState(false);

    return (
        <form action={addLiveQA} className="space-y-4">
            <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest opacity-60">Topic</label>
                <input name="topic" className="w-full border rounded-xl p-3 bg-secondary/5 focus:ring-2 focus:ring-primary outline-none" required />
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
            <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest opacity-60">Expert Name</label>
                <input name="expertName" className="w-full border rounded-xl p-3 bg-secondary/5 focus:ring-2 focus:ring-primary outline-none" />
            </div>
            <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest opacity-60">Session Date/Time</label>
                <input name="sessionDate" type="datetime-local" className="w-full border rounded-xl p-3 bg-secondary/5 focus:ring-2 focus:ring-primary outline-none" />
            </div>
            <Button 
                type="submit" 
                disabled={isUploading || !thumbnailUrl}
                className="w-full rounded-xl font-bold h-12 gap-2"
            >
                {isUploading ? "Uploading..." : <><Plus className="w-4 h-4" /> Add Session</>}
            </Button>
        </form>
    );
}

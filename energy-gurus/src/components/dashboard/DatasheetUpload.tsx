"use client";

import { UploadButton } from "@/lib/uploadthing";
import { useState } from "react";
import { FileText, CheckCircle2, Loader2 } from "lucide-react";

export function DatasheetUpload() {
    const [url, setUrl] = useState("");
    const [isUploading, setIsUploading] = useState(false);

    return (
        <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-2 block">Upload Datasheet (PDF/Image)</label>
            <div className="flex items-center gap-4 p-4 border-2 border-dashed rounded-2xl bg-secondary/5">
                {!url ? (
                    <UploadButton
                        endpoint="brandDatasheet"
                        onUploadBegin={() => setIsUploading(true)}
                        onClientUploadComplete={(res) => {
                            setUrl(res[0].url);
                            setIsUploading(false);
                        }}
                        onUploadError={(error: Error) => {
                            alert(`ERROR! ${error.message}`);
                            setIsUploading(false);
                        }}
                        appearance={{
                            button: "bg-primary text-white font-bold rounded-xl px-6 h-10 text-xs",
                            allowedContent: "text-[10px] opacity-40 font-bold uppercase"
                        }}
                    />
                ) : (
                    <div className="flex items-center gap-3 text-green-600 font-bold text-sm">
                        <CheckCircle2 className="w-5 h-5" />
                        <span>File Uploaded Successfully</span>
                        <input type="hidden" name="datasheetUrl" value={url} />
                    </div>
                )}
                {isUploading && (
                    <div className="flex items-center gap-2 text-primary text-xs font-bold">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Uploading...
                    </div>
                )}
                {url && (
                    <button
                        onClick={() => setUrl("")}
                        className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:underline ml-auto"
                    >
                        Remove
                    </button>
                )}
            </div>
            {/* Fallback hidden input so the form always has the field if manually entered elsewhere or if we want to keep the name consistent */}
            {!url && <input type="hidden" name="datasheetUrl" value="" />}
        </div>
    );
}

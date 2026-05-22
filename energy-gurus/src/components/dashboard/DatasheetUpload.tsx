"use client";

import { useState, useRef } from "react";
import { FileText, CheckCircle2, Loader2, Upload } from "lucide-react";
import { useR2Upload } from "@/lib/hooks/use-r2-upload";
import { toast } from "sonner";

export function DatasheetUpload() {
    const [url, setUrl] = useState("");
    const { uploadFile, isUploading } = useR2Upload();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const { publicUrl } = await uploadFile(file, "product-datasheets");
            setUrl(publicUrl);
            toast.success("Datasheet uploaded successfully");
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-2 block">Upload Datasheet (PDF/Image)</label>
            <div className="flex items-center gap-4 p-4 border-2 border-dashed rounded-2xl bg-secondary/5 border-secondary/20">
                {!url ? (
                    <div className="w-full">
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept=".pdf,image/*"
                            onChange={handleFileChange}
                        />
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                            className="w-full bg-primary text-white font-bold rounded-xl px-6 h-10 text-xs flex items-center justify-center gap-2 hover:scale-[1.01] transition-all disabled:opacity-50"
                        >
                            {isUploading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Upload className="w-4 h-4" />
                            )}
                            {isUploading ? "Uploading..." : "Select Technical Datasheet"}
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center gap-3 text-green-600 font-bold text-sm">
                        <CheckCircle2 className="w-5 h-5" />
                        <span>File Uploaded Successfully</span>
                        <input type="hidden" name="datasheetUrl" value={url} />
                    </div>
                )}
                {url && (
                    <button
                        type="button"
                        onClick={() => setUrl("")}
                        className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:underline ml-auto"
                    >
                        Remove
                    </button>
                )}
            </div>
            {!url && <input type="hidden" name="datasheetUrl" value="" />}
        </div>
    );
}

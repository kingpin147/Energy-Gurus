"use client";

import { UploadButton } from "@/lib/uploadthing";
import { updateBrandProfile } from "@/lib/actions/brand";
import { Trash2, ImageIcon, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface BrandLogoUploadProps {
    initialLogo?: string | null;
}

export function BrandLogoUpload({ initialLogo }: BrandLogoUploadProps) {
    const router = useRouter();
    const [logo, setLogo] = useState(initialLogo || "");
    const [isUploading, setIsUploading] = useState(false);

    const handleUploadComplete = async (res: any) => {
        const newUrl = res[0].url;
        setLogo(newUrl);
        setIsUploading(false);
        await updateBrandProfile({ logoUrl: newUrl });
        router.refresh();
    };

    const handleDeleteLogo = async () => {
        setLogo("");
        await updateBrandProfile({ logoUrl: "" });
        router.refresh();
    };

    return (
        <div className="bg-secondary/5 p-6 rounded-[2.5rem] border border-dashed border-secondary/20">
            <div className="flex flex-col items-center gap-6">
                <div className="space-y-1 text-center">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 block">Official Brand Logo</label>
                    <p className="text-[9px] opacity-30 font-bold uppercase">Appears on your public profile and certifications</p>
                </div>

                <div className="relative group">
                    {logo ? (
                        <div className="w-32 h-32 rounded-[2rem] border-4 border-white shadow-xl overflow-hidden relative group bg-white p-4">
                            <img src={logo} className="w-full h-full object-contain" alt="Brand Logo" />
                            <button
                                onClick={handleDeleteLogo}
                                className="absolute inset-0 bg-red-600/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-1"
                            >
                                <Trash2 className="w-5 h-5" />
                                <span className="text-[8px] font-black uppercase tracking-widest">Remove</span>
                            </button>
                        </div>
                    ) : (
                        <div className="w-32 h-32 rounded-[2rem] border-4 border-dashed border-secondary/20 flex flex-col items-center justify-center bg-secondary/5 group-hover:bg-secondary/10 transition-colors">
                            {isUploading ? (
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                    <span className="text-[8px] font-black uppercase tracking-widest opacity-40">Uploading...</span>
                                </div>
                            ) : (
                                <>
                                    <ImageIcon className="w-8 h-8 mb-2 opacity-20" />
                                    <span className="text-[8px] font-black uppercase tracking-widest opacity-30 text-center px-4">No Logo<br />Uploaded</span>
                                </>
                            )}
                        </div>
                    )}

                    {logo && (
                        <div className="absolute -bottom-2 -right-2 bg-green-500 text-white p-1.5 rounded-full shadow-lg border-2 border-white">
                            <CheckCircle2 className="w-3 h-3" />
                        </div>
                    )}
                </div>

                <div className="w-full max-w-[200px]">
                    <UploadButton
                        endpoint="brandLogo"
                        onUploadBegin={() => setIsUploading(true)}
                        onClientUploadComplete={handleUploadComplete}
                        onUploadError={(error: Error) => {
                            alert(`ERROR! ${error.message}`);
                            setIsUploading(false);
                        }}
                        appearance={{
                            button: "w-full bg-primary text-white font-bold rounded-xl px-4 h-10 text-[10px] uppercase tracking-[0.1em] hover:scale-[1.02] shadow-lg shadow-primary/20 transition-all",
                            allowedContent: "text-[9px] opacity-40 font-bold uppercase mt-2"
                        }}
                    />
                </div>
            </div>
        </div>
    );
}

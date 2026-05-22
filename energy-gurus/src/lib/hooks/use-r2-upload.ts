import { useState } from "react";
import { toast } from "sonner";

export function useR2Upload() {
    const [isUploading, setIsUploading] = useState(false);
    const [progress, setProgress] = useState(0);

    const uploadFile = async (file: File, folder: string = "uploads") => {
        setIsUploading(true);
        setProgress(0);

        try {
            // 1. Get presigned URL
            const res = await fetch("/api/r2/sign", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    filename: file.name,
                    contentType: file.type,
                    folder
                }),
            });

            if (!res.ok) throw new Error("Failed to get upload URL");
            const { uploadUrl, publicUrl, key } = await res.json();

            // 2. Upload to R2
            const uploadRes = await fetch(uploadUrl, {
                method: "PUT",
                body: file,
                headers: {
                    "Content-Type": file.type,
                },
            });

            if (!uploadRes.ok) throw new Error("Upload failed");

            return { publicUrl, key };
        } catch (error: any) {
            toast.error(error.message || "Upload failed");
            throw error;
        } finally {
            setIsUploading(false);
        }
    };

    return { uploadFile, isUploading, progress };
}

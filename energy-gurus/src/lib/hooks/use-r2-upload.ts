import { useState } from "react";
import { toast } from "sonner";

export function useR2Upload() {
    const [isUploading, setIsUploading] = useState(false);
    const [progress, setProgress] = useState(0);

    const uploadFile = async (file: File, folder: string = "uploads") => {
        setIsUploading(true);
        setProgress(0);

        try {
            // Upload via server-side proxy — avoids CORS issues with direct R2 PUT
            const res = await fetch("/api/r2/sign", {
                method: "POST",
                headers: {
                    "Content-Type": file.type,
                    "x-file-type": file.type,
                    "x-folder": folder,
                    "x-filename": file.name,
                },
                body: file,
            });

            if (!res.ok) {
                const msg = await res.text();
                throw new Error(msg || "Upload failed");
            }

            const { publicUrl, key } = await res.json();
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

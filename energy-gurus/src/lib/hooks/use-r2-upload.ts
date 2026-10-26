import { useState, useRef, useCallback } from "react";
import { toast } from "sonner";

const ALLOWED_FOLDERS = [
    "epc-logos", "epc-photos", "epc-projects", "epc-portfolios", "epc-portfolio", "epc-documents", "epc-brand-certs", "epc-team",
    "brand-logos", "brand-gallery", "brand-documents", "brand-team", "brand-proofs",
    "product-images", "product-datasheets", "product-manuals",
    "podcast-thumbnails", "uploads",
    "project-images", "project-videos",
    "live-qa-thumbnails", "expert-photos", "epc-reviews", "review-proofs",
    "news-cover", "news-covers", "news-authors", "news-images", "ad-banners", "ad-banners-mobile", "team", "writer-avatars"
];

function resolveFileType(file: File): string {
    if (file.type && file.type !== "application/octet-stream") {
        return file.type;
    }
    const ext = file.name.split('.').pop()?.toLowerCase();
    switch (ext) {
        case "png": return "image/png";
        case "jpg":
        case "jpeg": return "image/jpeg";
        case "webp": return "image/webp";
        case "gif": return "image/gif";
        case "svg": return "image/svg+xml";
        case "pdf": return "application/pdf";
        case "mp4": return "video/mp4";
        case "webm": return "video/webm";
        default: return file.type || "application/octet-stream";
    }
}

export function useR2Upload() {
    const [isUploading, setIsUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const activeXhrRef = useRef<XMLHttpRequest | null>(null);

    const cancelUpload = useCallback(() => {
        if (activeXhrRef.current) {
            activeXhrRef.current.abort();
            activeXhrRef.current = null;
        }
        setIsUploading(false);
        setProgress(0);
    }, []);

    const attemptUpload = (
        file: File, 
        folder: string, 
        resolvedType: string
    ): Promise<{ publicUrl: string; key: string }> => {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            activeXhrRef.current = xhr;
            xhr.open("POST", "/api/r2/sign");
            xhr.timeout = 45000; // 45s timeout to guarantee it never hangs forever

            const formData = new FormData();
            formData.append("file", file);
            formData.append("folder", folder);
            formData.append("fileType", resolvedType);

            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    const percentComplete = Math.round((event.loaded / event.total) * 100);
                    setProgress(percentComplete);
                }
            };

            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        const response = JSON.parse(xhr.responseText);
                        resolve({ publicUrl: response.publicUrl, key: response.key });
                    } catch {
                        reject(new Error("Failed to parse server upload response."));
                    }
                } else {
                    let errorText = xhr.responseText || "Upload failed";
                    if (xhr.status === 401) {
                        errorText = "Session expired or unauthorized. Please sign in again.";
                    } else if (xhr.status === 413) {
                        errorText = "File is too large to upload (payload size exceeded).";
                    } else if (errorText.includes("<!DOCTYPE") || errorText.includes("<html")) {
                        errorText = `Upload failed (Server HTTP ${xhr.status}).`;
                    }
                    const err: any = new Error(errorText);
                    err.status = xhr.status;
                    reject(err);
                }
            };

            xhr.ontimeout = () => {
                const err: any = new Error("Upload timed out after 45 seconds. Please check your internet connection.");
                err.status = 408;
                reject(err);
            };

            xhr.onerror = () => {
                const err: any = new Error("Network connection error during file upload. Please check your internet connection.");
                err.status = 0;
                reject(err);
            };

            xhr.onabort = () => {
                const err: any = new Error("Upload was cancelled.");
                err.status = 0;
                reject(err);
            };

            xhr.send(formData);
        });
    };

    const uploadFile = async (
        file: File, 
        folder: string = "uploads", 
        retriesLeft: number = 1
    ): Promise<{ publicUrl: string; key: string }> => {
        // 1. Pre-flight Client-Side Validations
        if (!ALLOWED_FOLDERS.includes(folder)) {
            const err = new Error(`Invalid upload destination: ${folder}`);
            toast.error(err.message);
            throw err;
        }

        const MAX_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB limit
        if (file.size > MAX_SIZE_BYTES) {
            const err = new Error(`File "${file.name}" is too large (max 50 MB).`);
            toast.error(err.message);
            throw err;
        }

        const resolvedType = resolveFileType(file);
        const isImage = resolvedType.startsWith("image/");
        const isVideo = resolvedType.startsWith("video/");
        const isPDF = resolvedType === "application/pdf";

        if (!isImage && !isVideo && !isPDF) {
            const err = new Error(`Unsupported file type: ${file.type || 'unknown'}. Allowed: Images, Videos, PDFs.`);
            toast.error(err.message);
            throw err;
        }

        setIsUploading(true);
        setProgress(0);

        try {
            let lastError: any = null;
            for (let attempt = 0; attempt <= retriesLeft; attempt++) {
                try {
                    const result = await attemptUpload(file, folder, resolvedType);
                    setProgress(100);
                    return result;
                } catch (err: any) {
                    lastError = err;
                    // Only retry on network drop or 5xx server errors
                    const isRetryable = err.status === 0 || (typeof err.status === "number" && err.status >= 500);
                    if (attempt < retriesLeft && isRetryable) {
                        console.warn(`R2 upload attempt ${attempt + 1} failed. Retrying...`, err);
                        setProgress(0);
                        await new Promise((r) => setTimeout(r, 1000));
                        continue;
                    }
                    throw err;
                }
            }
            throw lastError || new Error("Upload failed.");
        } finally {
            activeXhrRef.current = null;
            setIsUploading(false);
        }
    };

    return { uploadFile, isUploading, progress, cancelUpload };
}

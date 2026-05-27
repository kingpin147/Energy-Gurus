import { useState } from "react";
import { toast } from "sonner";

export function useR2Upload() {
    const [isUploading, setIsUploading] = useState(false);
    const [progress, setProgress] = useState(0);

    const uploadFile = async (
        file: File, 
        folder: string = "uploads", 
        retriesLeft: number = 1
    ): Promise<{ publicUrl: string; key: string }> => {
        // 1. Pre-flight Client-Side Validations
        const ALLOWED_FOLDERS = [
            "epc-logos", "epc-projects", "epc-portfolios", "epc-portfolio",
            "brand-logos", "brand-gallery",
            "product-images", "product-datasheets",
            "podcast-thumbnails", "uploads",
            "project-images", "project-videos",
            "live-qa-thumbnails", "expert-photos"
        ];

        if (!ALLOWED_FOLDERS.includes(folder)) {
            const err = new Error(`Invalid upload destination: ${folder}`);
            toast.error(err.message);
            throw err;
        }

        const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB limit
        if (file.size > MAX_SIZE_BYTES) {
            const err = new Error(`File "${file.name}" is too large (max 10 MB).`);
            toast.error(err.message);
            throw err;
        }

        const isImage = file.type.startsWith("image/");
        const isVideo = file.type.startsWith("video/");
        const isPDF = file.type === "application/pdf";

        if (!isImage && !isVideo && !isPDF) {
            const err = new Error(`Unsupported file type: ${file.type}. Allowed: Images, Videos, PDFs.`);
            toast.error(err.message);
            throw err;
        }

        setIsUploading(true);
        setProgress(0);

        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open("POST", "/api/r2/sign");
            
            xhr.setRequestHeader("Content-Type", file.type);
            xhr.setRequestHeader("x-file-type", file.type);
            xhr.setRequestHeader("x-folder", folder);
            xhr.setRequestHeader("x-filename", file.name);

            // Progress tracking event listener
            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    const percentComplete = Math.round((event.loaded / event.total) * 100);
                    setProgress(percentComplete);
                }
            };

            xhr.onload = async () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        const response = JSON.parse(xhr.responseText);
                        resolve({ publicUrl: response.publicUrl, key: response.key });
                    } catch (e) {
                        reject(new Error("Failed to parse server upload response."));
                    }
                } else {
                    const errorText = xhr.responseText || "Upload failed";
                    
                    // Simple retry on 5xx or rate-limit status codes
                    if (retriesLeft > 0 && xhr.status >= 500) {
                        console.warn(`R2 upload status ${xhr.status}. Retrying...`);
                        try {
                            const retryResult = await uploadFile(file, folder, retriesLeft - 1);
                            resolve(retryResult);
                        } catch (err) {
                            reject(err);
                        }
                    } else {
                        reject(new Error(errorText));
                    }
                }
            };

            xhr.onerror = async () => {
                if (retriesLeft > 0) {
                    console.warn("R2 upload network error. Retrying...");
                    try {
                        const retryResult = await uploadFile(file, folder, retriesLeft - 1);
                        resolve(retryResult);
                    } catch (err) {
                        reject(err);
                    }
                } else {
                    reject(new Error("Network error during file upload."));
                }
            };

            xhr.onloadend = () => {
                setIsUploading(false);
            };

            xhr.send(file);
        });
    };

    return { uploadFile, isUploading, progress };
}

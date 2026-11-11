/**
 * Client-Side Image Compression Utility
 * Resizes large dimensions (max 1920px) and converts to WebP/JPEG at ~0.82 quality.
 * Reduces 5MB-10MB camera shots down to ~200KB-400KB to save bandwidth and storage.
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  maxSizeBytes?: number; // default 10MB
}

export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  const {
    maxWidth = 1920,
    maxHeight = 1920,
    quality = 0.82,
    maxSizeBytes = 10 * 1024 * 1024 // 10 MB
  } = options;

  // 1. Check size limit
  if (file.size > maxSizeBytes) {
    const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
    throw new Error(`Image size (${sizeInMb} MB) exceeds the maximum limit of 10 MB.`);
  }

  // 2. Only process raster image files (skip SVGs, GIFs)
  if (!file.type.startsWith("image/") || file.type === "image/svg+xml" || file.type === "image/gif") {
    return file;
  }

  // Check if browser supports Image & Canvas
  if (typeof window === "undefined" || !window.HTMLCanvasElement) {
    return file;
  }

  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let width = img.naturalWidth || img.width;
      let height = img.naturalHeight || img.height;

      // Calculate scaled dimensions keeping aspect ratio
      if (width > maxWidth || height > maxHeight) {
        if (width / height > maxWidth / maxHeight) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        return resolve(file);
      }

      // Smooth resizing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, width, height);

      // Attempt webp first, fallback to jpeg
      const outputType = "image/webp";

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            return resolve(file);
          }

          // If compression actually made it larger (rare for tiny icons), keep original
          if (blob.size >= file.size) {
            return resolve(file);
          }

          const originalName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
          const compressedFile = new File([blob], `${originalName}.webp`, {
            type: outputType,
            lastModified: Date.now()
          });

          resolve(compressedFile);
        },
        outputType,
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file); // Fallback to original file on load error
    };

    img.src = objectUrl;
  });
}

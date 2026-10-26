import { auth } from "@clerk/nextjs/server";
import { r2Client, getPublicUrl } from "@/lib/r2";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { PutObjectCommand } from "@aws-sdk/client-s3";

export const runtime = "nodejs";

const MAX_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB

const ALLOWED_FOLDERS = [
    "epc-logos", "epc-photos", "epc-projects", "epc-portfolios", "epc-portfolio", "epc-documents", "epc-brand-certs", "epc-team",
    "brand-logos", "brand-gallery", "brand-documents", "brand-team", "brand-proofs",
    "product-images", "product-datasheets", "product-manuals",
    "podcast-thumbnails", "uploads",
    "project-images", "project-videos",
    "live-qa-thumbnails", "expert-photos", "epc-reviews", "review-proofs",
    "news-cover", "news-covers", "news-authors", "news-images", "ad-banners", "ad-banners-mobile", "team", "writer-avatars"
];

function sanitizeExtension(filename: string): string {
    const ext = filename.split(".").pop()?.toLowerCase() || "bin";
    return ext.replace(/[^a-z0-9]/g, "");
}

function resolveFileType(fileType: string | null | undefined, filename: string): string {
    if (fileType && fileType !== "application/octet-stream") {
        return fileType;
    }
    const ext = filename.split(".").pop()?.toLowerCase();
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
        default: return fileType || "application/octet-stream";
    }
}

export async function POST(req: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return new NextResponse("Unauthorized. Please log in to upload files.", { status: 401 });
        }

        const contentType = req.headers.get("content-type") || "";

        // ── 1. Multipart / FormData Upload (Primary & Robust) ────────────────
        if (contentType.includes("multipart/form-data")) {
            const formData = await req.formData();
            const file = formData.get("file") as File | null;
            const folder = (formData.get("folder") as string) || "uploads";

            if (!file) {
                return new NextResponse("No file provided for upload", { status: 400 });
            }

            if (!ALLOWED_FOLDERS.includes(folder)) {
                return new NextResponse(`Invalid upload destination: ${folder}`, { status: 400 });
            }

            const rawFileType = (formData.get("fileType") as string) || file.type;
            const fileType = resolveFileType(rawFileType, file.name);

            const isImage = fileType.startsWith("image/");
            const isVideo = fileType.startsWith("video/");
            const isPDF = fileType === "application/pdf";

            if (!isImage && !isVideo && !isPDF) {
                return new NextResponse(`Unsupported file type: ${fileType}. Allowed: Images, Videos, PDFs.`, { status: 400 });
            }

            if (file.size > MAX_SIZE_BYTES) {
                return new NextResponse("File too large (max 50 MB)", { status: 413 });
            }

            const ext = sanitizeExtension(file.name);
            const key = `${folder}/${uuidv4()}.${ext}`;

            const arrayBuffer = await file.arrayBuffer();
            const bucketName = process.env.R2_BUCKET_NAME!;

            await r2Client.send(
                new PutObjectCommand({
                    Bucket: bucketName,
                    Key: key,
                    Body: Buffer.from(arrayBuffer),
                    ContentType: fileType,
                }),
                { abortSignal: AbortSignal.timeout(30000) }
            );

            return NextResponse.json({ key, publicUrl: getPublicUrl(key) });
        }

        // ── 2. Raw Binary / Octet Stream (Proxy backwards compatibility) ─────
        if (!contentType.includes("application/json")) {
            const headerFileType = req.headers.get("x-file-type");
            const folder = req.headers.get("x-folder") || "uploads";
            let filename = req.headers.get("x-filename") || "file";
            try {
                filename = decodeURIComponent(filename);
            } catch {
                // Ignore if not encoded
            }

            if (!ALLOWED_FOLDERS.includes(folder)) {
                return new NextResponse(`Invalid upload destination: ${folder}`, { status: 400 });
            }

            const fileType = resolveFileType(headerFileType, filename);

            const isImage = fileType.startsWith("image/");
            const isVideo = fileType.startsWith("video/");
            const isPDF = fileType === "application/pdf";

            if (!isImage && !isVideo && !isPDF) {
                return new NextResponse(`Unsupported file type: ${fileType}. Allowed: Images, Videos, PDFs.`, { status: 400 });
            }

            const ext = sanitizeExtension(filename);
            const key = `${folder}/${uuidv4()}.${ext}`;

            const arrayBuffer = await req.arrayBuffer();

            if (arrayBuffer.byteLength > MAX_SIZE_BYTES) {
                return new NextResponse("File too large (max 50 MB)", { status: 413 });
            }

            const bucketName = process.env.R2_BUCKET_NAME!;
            await r2Client.send(
                new PutObjectCommand({
                    Bucket: bucketName,
                    Key: key,
                    Body: Buffer.from(arrayBuffer),
                    ContentType: fileType,
                }),
                { abortSignal: AbortSignal.timeout(30000) }
            );

            return NextResponse.json({ key, publicUrl: getPublicUrl(key) });
        }

        // ── 3. Legacy presigned-URL path (JSON) ──────────────────────────────
        const { filename, contentType: fileContentType, folder } = await req.json();

        if (!filename || !fileContentType) {
            return new NextResponse("Missing filename or contentType", { status: 400 });
        }

        const { getPresignedUploadUrl } = await import("@/lib/r2");
        const ext = sanitizeExtension(filename);
        const key = `${folder || "uploads"}/${uuidv4()}.${ext}`;
        const uploadUrl = await getPresignedUploadUrl(key, fileContentType);

        return NextResponse.json({ uploadUrl, key, publicUrl: getPublicUrl(key) });
    } catch (error: any) {
        console.error("R2 Upload Error:", error);
        return new NextResponse(error?.message || "Failed to process file upload. Please try again.", { status: 500 });
    }
}

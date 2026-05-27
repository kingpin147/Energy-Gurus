import { auth } from "@clerk/nextjs/server";
import { r2Client, getPublicUrl } from "@/lib/r2";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { PutObjectCommand } from "@aws-sdk/client-s3";

const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export async function POST(req: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const contentType = req.headers.get("content-type") || "";

        const ALLOWED_FOLDERS = [
            "epc-logos", "epc-projects", "epc-portfolios", "epc-portfolio",
            "brand-logos", "brand-gallery",
            "product-images", "product-datasheets",
            "podcast-thumbnails", "uploads",
            "project-images", "project-videos",
            "live-qa-thumbnails", "expert-photos"
        ];

        // ── Multipart / binary upload (new proxy path) ──────────────────────
        if (!contentType.includes("application/json")) {
            const fileType = req.headers.get("x-file-type") || "application/octet-stream";
            const folder = req.headers.get("x-folder") || "uploads";
            const filename = req.headers.get("x-filename") || "file";

            if (!ALLOWED_FOLDERS.includes(folder)) {
                return new NextResponse("Invalid upload destination", { status: 400 });
            }

            // Basic type validation
            const isImage = fileType.startsWith("image/");
            const isVideo = fileType.startsWith("video/");
            const isPDF = fileType === "application/pdf";

            if (!isImage && !isVideo && !isPDF) {
                return new NextResponse("Unsupported file type", { status: 400 });
            }

            const ext = filename.split(".").pop() ?? "bin";
            const key = `${folder}/${uuidv4()}.${ext}`;

            const arrayBuffer = await req.arrayBuffer();

            if (arrayBuffer.byteLength > MAX_SIZE_BYTES) {
                return new NextResponse("File too large (max 10 MB)", { status: 413 });
            }

            const bucketName = process.env.R2_BUCKET_NAME!;
            await r2Client.send(
                new PutObjectCommand({
                    Bucket: bucketName,
                    Key: key,
                    Body: Buffer.from(arrayBuffer),
                    ContentType: fileType,
                })
            );

            return NextResponse.json({ key, publicUrl: getPublicUrl(key) });
        }

        // ── Legacy presigned-URL path (kept for backwards compat) ───────────
        const { filename, contentType: fileContentType, folder } = await req.json();

        if (!filename || !fileContentType) {
            return new NextResponse("Missing filename or contentType", { status: 400 });
        }

        // Re-import to avoid circular — presigned URL still works server-side
        const { getPresignedUploadUrl } = await import("@/lib/r2");
        const ext = filename.split(".").pop();
        const key = `${folder || "uploads"}/${uuidv4()}.${ext}`;
        const uploadUrl = await getPresignedUploadUrl(key, fileContentType);

        return NextResponse.json({ uploadUrl, key, publicUrl: getPublicUrl(key) });
    } catch (error: any) {
        console.error("R2 Upload Error:", error);
        return new NextResponse(error?.message || "Internal Error", { status: 500 });
    }
}

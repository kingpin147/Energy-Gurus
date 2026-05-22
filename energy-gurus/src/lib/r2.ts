import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const bucketName = process.env.R2_BUCKET_NAME;

if (!accountId || !accessKeyId || !secretAccessKey || !bucketName) {
    if (process.env.NODE_ENV === "production") {
        throw new Error("Missing Cloudflare R2 environment variables");
    } else {
        console.warn("⚠️ Missing Cloudflare R2 environment variables. Uploads will fail.");
    }
}

export const r2Client = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: accessKeyId!,
        secretAccessKey: secretAccessKey!,
    },
});

export async function getPresignedUploadUrl(key: string, contentType: string) {
    const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        ContentType: contentType,
    });

    return await getSignedUrl(r2Client, command, { expiresIn: 3600 });
}

export async function deleteFile(key: string) {
    const { DeleteObjectCommand } = await import("@aws-sdk/client-s3");
    const command = new DeleteObjectCommand({
        Bucket: bucketName,
        Key: key,
    });
    return await r2Client.send(command);
}

export function getPublicUrl(key: string) {
    // Priority 1: Use NEXT_PUBLIC_CUSTOM_DOMAIN if provided (e.g., energygurus.online)
    // Priority 2: Use R2_PUBLIC_URL from env
    const customDomain = process.env.NEXT_PUBLIC_CUSTOM_DOMAIN;
    if (customDomain) {
        return `https://${customDomain.replace(/^https?:\/\//, "")}/cdn/${key}`;
    }

    const baseUrl = process.env.R2_PUBLIC_URL?.replace(/\/$/, "");
    return `${baseUrl}/${key}`;
}

export function extractKeyFromUrl(url: string) {
    try {
        const urlObj = new URL(url);
        // If it's a custom domain, it might have a prefix like /cdn/
        if (process.env.NEXT_PUBLIC_CUSTOM_DOMAIN && url.includes(process.env.NEXT_PUBLIC_CUSTOM_DOMAIN)) {
            return urlObj.pathname.replace(/^\/cdn\//, "");
        }
        // If it's the R2 public URL
        const bucketPath = process.env.R2_PUBLIC_URL ? new URL(process.env.R2_PUBLIC_URL).pathname : "";
        return urlObj.pathname.replace(bucketPath, "").replace(/^\//, "");
    } catch {
        return url; // fallback
    }
}

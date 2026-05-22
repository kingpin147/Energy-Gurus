import { auth } from "@clerk/nextjs/server";
import { getPresignedUploadUrl, getPublicUrl } from "@/lib/r2";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { filename, contentType, folder } = await req.json();

        if (!filename || !contentType) {
            return new NextResponse("Missing filename or contentType", { status: 400 });
        }

        const ext = filename.split(".").pop();
        const key = `${folder || "uploads"}/${uuidv4()}.${ext}`;

        const uploadUrl = await getPresignedUploadUrl(key, contentType);

        return NextResponse.json({
            uploadUrl,
            key,
            publicUrl: getPublicUrl(key)
        });
    } catch (error: any) {
        console.error("R2 Presign Error:", error);
        return new NextResponse(error?.message || "Internal Error", { status: 500 });
    }
}

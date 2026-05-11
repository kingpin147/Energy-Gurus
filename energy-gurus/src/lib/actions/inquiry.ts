"use server";

import { db } from "@/db";
import { inquiries, users } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function sendInquiry(formData: FormData) {
    const { userId: clerkId } = await auth();
    // Inquiries can be sent by guests too, but if logged in, we link the sender
    
    let senderId = null;
    if (clerkId) {
        const [user] = await db.select().from(users).where(eq(users.clerkId, clerkId));
        if (user) senderId = user.id;
    }

    const receiverId = formData.get("receiverId") as string;
    const message = formData.get("message") as string;

    if (!receiverId || !message) {
        throw new Error("Missing required fields");
    }

    await db.insert(inquiries).values({
        senderId,
        receiverId,
        message,
        status: 'pending',
    });

    revalidatePath("/dashboard/inquiries");
}

export async function updateInquiryStatus(id: string, status: 'pending' | 'replied' | 'closed') {
    const { userId: clerkId } = await auth();
    if (!clerkId) throw new Error("Unauthorized");

    await db.update(inquiries)
        .set({ status })
        .where(eq(inquiries.id, id));

    revalidatePath("/dashboard");
}

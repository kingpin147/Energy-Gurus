"use server";

import { db } from "@/db";
import { inquiries } from "@/db/schema";
import { eq } from "drizzle-orm";
import { users } from "@/db/schema";
import { revalidatePath } from "next/cache";

export async function submitPublicContact(formData: FormData) {
    const guestName = formData.get("name") as string;
    const guestEmail = formData.get("email") as string;
    const guestPhone = formData.get("phone") as string;
    const subject = formData.get("subject") as string;
    const message = formData.get("message") as string;

    if (!guestName || !guestEmail || !message) {
        return { success: false, error: "Missing required fields." };
    }

    try {
        // Find a super-admin to receive the message (or any admin)
        const [admin] = await db.select().from(users).where(eq(users.role, "super-admin")).limit(1);
        if (!admin) {
            return { success: false, error: "System configuration error: No admin found." };
        }

        await db.insert(inquiries).values({
            receiverId: admin.id,
            guestName,
            guestEmail,
            guestPhone,
            subject,
            message,
            inquiryType: "public",
        });

        revalidatePath("/", "layout");
        return { success: true };
    } catch (error) {
        console.error("Failed to submit contact form:", error);
        return { success: false, error: "Failed to submit message. Please try again." };
    }
}

export async function updateInquiryStatus(id: string, status: string, notes?: string) {
    await db.update(inquiries)
        .set({ status, adminNotes: notes, updatedAt: new Date() } as any)
        .where(eq(inquiries.id, id));
    
    revalidatePath("/[locale]/dashboard/inquiries", "layout");
}

export async function deleteInquiry(id: string) {
    await db.delete(inquiries).where(eq(inquiries.id, id));
    revalidatePath("/[locale]/dashboard/inquiries", "layout");
}

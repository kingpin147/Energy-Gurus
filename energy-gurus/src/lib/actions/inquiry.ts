"use server";

import { db } from "@/db";
import { inquiries, users } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq, and, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function sendInquiry(formData: FormData) {
    const { userId: clerkId } = await auth();

    let senderId = null;
    if (clerkId) {
        const [user] = await db.select().from(users).where(eq(users.clerkId, clerkId));
        if (user) senderId = user.id;
    }

    const receiverId = formData.get("receiverId") as string;
    const message = formData.get("message") as string;
    const guestName = formData.get("guestName") as string;
    const guestEmail = formData.get("guestEmail") as string;
    const guestPhone = formData.get("guestPhone") as string;
    const inquiryType = (formData.get("inquiryType") as string) ?? "client";

    if (!receiverId || !message) throw new Error("Missing required fields");

    await db.insert(inquiries).values({
        senderId,
        receiverId,
        guestName,
        guestEmail,
        guestPhone,
        message,
        inquiryType: inquiryType as "client" | "support",
        status: "new",
        isRead: false,
    });

    revalidatePath("/[locale]/dashboard/inquiries", "layout");
}

export async function sendSupportMessage(formData: FormData) {
    const { userId: clerkId } = await auth();
    if (!clerkId) throw new Error("Unauthorized");

    const [sender] = await db.select().from(users).where(eq(users.clerkId, clerkId));
    if (!sender) throw new Error("User not found");

    // Find any admin/super-admin to send to
    const [admin] = await db.select().from(users)
        .where(eq(users.role, "admin"))
        .limit(1);

    const [superAdmin] = await db.select().from(users)
        .where(eq(users.role, "super-admin"))
        .limit(1);

    const adminReceiver = superAdmin ?? admin;
    if (!adminReceiver) throw new Error("No admin available");

    const subject = formData.get("subject") as string;
    const message = formData.get("message") as string;

    if (!message) throw new Error("Message is required");

    await db.insert(inquiries).values({
        senderId: sender.id,
        receiverId: adminReceiver.id,
        guestName: sender.name ?? "Platform User",
        guestEmail: sender.email,
        subject,
        message,
        inquiryType: "support",
        status: "new",
        isRead: false,
    });

    revalidatePath("/[locale]/dashboard/support", "layout");
}

export async function getMyInquiries(userId: string, filter: "all" | "read" | "unread" = "all") {
    const conditions = [eq(inquiries.receiverId, userId), eq(inquiries.inquiryType, "client")];
    if (filter === "read") conditions.push(eq(inquiries.isRead, true));
    if (filter === "unread") conditions.push(eq(inquiries.isRead, false));

    return db.select().from(inquiries)
        .where(and(...conditions))
        .orderBy(desc(inquiries.createdAt));
}

export async function getAdminInquiries(userId: string) {
    return db.select().from(inquiries)
        .where(and(eq(inquiries.receiverId, userId), eq(inquiries.inquiryType, "support")))
        .orderBy(desc(inquiries.createdAt));
}

export async function markInquiryAsRead(id: string) {
    const { userId: clerkId } = await auth();
    if (!clerkId) throw new Error("Unauthorized");

    await db.update(inquiries)
        .set({ isRead: true, updatedAt: new Date() })
        .where(eq(inquiries.id, id));

    revalidatePath("/[locale]/dashboard/inquiries", "layout");
    revalidatePath("/[locale]/dashboard/inbox", "layout");
}

export async function deleteInquiry(id: string) {
    const { userId: clerkId } = await auth();
    if (!clerkId) throw new Error("Unauthorized");

    await db.delete(inquiries).where(eq(inquiries.id, id));

    revalidatePath("/[locale]/dashboard/inquiries", "layout");
    revalidatePath("/[locale]/dashboard/inbox", "layout");
}

export async function updateInquiryStatus(id: string, status: "pending" | "replied" | "closed") {
    const { userId: clerkId } = await auth();
    if (!clerkId) throw new Error("Unauthorized");

    await db.update(inquiries)
        .set({ status, updatedAt: new Date() })
        .where(eq(inquiries.id, id));

    revalidatePath("/[locale]/dashboard", "layout");
}

export async function replyToInquiry(id: string, replyText: string) {
    const { userId: clerkId } = await auth();
    if (!clerkId) throw new Error("Unauthorized");

    await db.update(inquiries)
        .set({ 
            reply: replyText,
            status: "replied",
            updatedAt: new Date() 
        })
        .where(eq(inquiries.id, id));

    revalidatePath("/[locale]/dashboard/inquiries", "layout");
    revalidatePath("/[locale]/dashboard/inbox", "layout");
    revalidatePath("/[locale]/dashboard/support", "layout");
}

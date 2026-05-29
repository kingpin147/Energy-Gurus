"use server";

import { db } from "@/db";
import { inquiries, users, notifications, brands, epcInstallers } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq, and, desc, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function sendInquiry(formData: FormData) {
    try {
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

        if (!receiverId || !message) {
            return { success: false, message: "Missing required fields" };
        }

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

        // Fetch sender logo if registered
        let senderLogoUrl = null;
        if (senderId) {
            const [brand] = await db.select({ logo: brands.logoUrl }).from(brands).where(eq(brands.userId, senderId));
            const [epc] = await db.select({ logo: epcInstallers.logoUrl }).from(epcInstallers).where(eq(epcInstallers.userId, senderId));
            senderLogoUrl = brand?.logo || epc?.logo || null;
        }

        // Create notification
        await db.insert(notifications).values({
            userId: receiverId,
            title: "New Inquiry Received",
            message: `You have received a new inquiry from ${guestName || "Anonymous"}.`,
            type: "inquiry",
            link: "/dashboard/inquiries",
            senderLogoUrl,
        });

        revalidatePath("/[locale]/dashboard/inquiries", "layout");
        return { success: true, message: "Inquiry sent successfully" };
    } catch (error) {
        console.error("sendInquiry error:", error);
        return { success: false, message: "Failed to send inquiry" };
    }
}

export async function sendSupportMessage(formData: FormData) {
    try {
        const { userId: clerkId } = await auth();

        let senderId = null;
        let senderName = formData.get("guestName") as string;
        let senderEmail = formData.get("guestEmail") as string;

        if (clerkId) {
            const [user] = await db.select().from(users).where(eq(users.clerkId, clerkId));
            if (user) {
                senderId = user.id;
                senderName = user.name || "Platform User";
                senderEmail = user.email;
            }
        }

        // Find any admin/super-admin to send to
        const [admin] = await db.select().from(users)
            .where(eq(users.role, "admin"))
            .limit(1);

        const [superAdmin] = await db.select().from(users)
            .where(eq(users.role, "super-admin"))
            .limit(1);

        const adminReceiver = superAdmin ?? admin;
        if (!adminReceiver) return { success: false, message: "No admin available" };

        const subject = formData.get("subject") as string;
        const message = formData.get("message") as string;

        if (!message) return { success: false, message: "Message is required" };

        await db.insert(inquiries).values({
            senderId: senderId,
            receiverId: adminReceiver.id,
            guestName: senderName,
            guestEmail: senderEmail,
            subject,
            message,
            inquiryType: "support",
            status: "new",
            isRead: false,
        });

        // Create notification for admin
        await db.insert(notifications).values({
            userId: adminReceiver.id,
            title: subject || "New Support Request",
            message: `New support message from ${senderName}`,
            type: "system",
            link: "/dashboard/inbox",
            senderLogoUrl: null, // Admin notifications usually don't need sender logo or can be added later
        });

        revalidatePath("/[locale]/dashboard/support", "layout");
        return { success: true, message: "Support message sent" };
    } catch (error) {
        console.error("sendSupportMessage error:", error);
        return { success: false, message: "Failed to send support message" };
    }
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
    try {
        const { userId: clerkId } = await auth();
        if (!clerkId) return { success: false, message: "Unauthorized" };

        await db.update(inquiries)
            .set({ isRead: true, updatedAt: new Date() })
            .where(eq(inquiries.id, id));

        revalidatePath("/[locale]/dashboard/inquiries", "layout");
        revalidatePath("/[locale]/dashboard/inbox", "layout");
        return { success: true, message: "Marked as read" };
    } catch (error) {
        console.error("markInquiryAsRead error:", error);
        return { success: false, message: "Failed to update inquiry" };
    }
}

export async function deleteInquiry(id: string) {
    try {
        const { userId: clerkId } = await auth();
        if (!clerkId) return { success: false, message: "Unauthorized" };

        await db.delete(inquiries).where(eq(inquiries.id, id));

        revalidatePath("/[locale]/dashboard/inquiries", "layout");
        revalidatePath("/[locale]/dashboard/inbox", "layout");
        return { success: true, message: "Inquiry deleted" };
    } catch (error) {
        console.error("deleteInquiry error:", error);
        return { success: false, message: "Failed to delete inquiry" };
    }
}

export async function updateInquiryStatus(id: string, status: "pending" | "replied" | "closed") {
    try {
        const { userId: clerkId } = await auth();
        if (!clerkId) return { success: false, message: "Unauthorized" };

        await db.update(inquiries)
            .set({ status, updatedAt: new Date() })
            .where(eq(inquiries.id, id));

        revalidatePath("/[locale]/dashboard", "layout");
        return { success: true, message: "Status updated" };
    } catch (error) {
        console.error("updateInquiryStatus error:", error);
        return { success: false, message: "Failed to update status" };
    }
}

export async function replyToInquiry(id: string, replyText: string) {
    try {
        const { userId: clerkId } = await auth();
        if (!clerkId) return { success: false, message: "Unauthorized" };

        const [inquiry] = await db.select().from(inquiries).where(eq(inquiries.id, id));

        await db.update(inquiries)
            .set({
                reply: replyText,
                status: "replied",
                updatedAt: new Date()
            })
            .where(eq(inquiries.id, id));

        // Create notification for inquiry sender if they are a registered user
        if (inquiry && inquiry.senderId) {
            // Fetch the logo of the user who is replying (the current user)
            const [replier] = await db.select().from(users).where(eq(users.clerkId, clerkId));
            let replierLogoUrl = null;
            if (replier) {
                const [brand] = await db.select({ logo: brands.logoUrl }).from(brands).where(eq(brands.userId, replier.id));
                const [epc] = await db.select({ logo: epcInstallers.logoUrl }).from(epcInstallers).where(eq(epcInstallers.userId, replier.id));
                replierLogoUrl = brand?.logo || epc?.logo || null;
            }

            await db.insert(notifications).values({
                userId: inquiry.senderId,
                title: "Reply to your inquiry",
                message: `You have received a reply to your inquiry: "${inquiry.subject || "No Subject"}"`,
                type: "reply",
                link: "/dashboard/inbox",
                senderLogoUrl: replierLogoUrl,
            });
        }

        revalidatePath("/[locale]/dashboard/support", "layout");
        return { success: true, message: "Reply sent" };
    } catch (error) {
        console.error("replyToInquiry error:", error);
        return { success: false, message: "Failed to send reply" };
    }
}

export async function bulkDeleteInquiries(ids: string[]) {
    try {
        const { userId: clerkId } = await auth();
        if (!clerkId) return { success: false, message: "Unauthorized" };

        if (!ids.length) return { success: false, message: "No inquiries selected" };

        await db.delete(inquiries).where(inArray(inquiries.id, ids));

        revalidatePath("/[locale]/dashboard/inquiries", "layout");
        revalidatePath("/[locale]/dashboard/inbox", "layout");
        return { success: true, message: `${ids.length} inquiries deleted` };
    } catch (error) {
        console.error("bulkDeleteInquiries error:", error);
        return { success: false, message: "Failed to delete inquiries" };
    }
}

export async function bulkMarkInquiriesAsRead(ids: string[]) {
    try {
        const { userId: clerkId } = await auth();
        if (!clerkId) return { success: false, message: "Unauthorized" };

        if (!ids.length) return { success: false, message: "No inquiries selected" };

        await db.update(inquiries)
            .set({ isRead: true, updatedAt: new Date() })
            .where(inArray(inquiries.id, ids));

        revalidatePath("/[locale]/dashboard/inquiries", "layout");
        revalidatePath("/[locale]/dashboard/inbox", "layout");
        return { success: true, message: `Marked ${ids.length} as read` };
    } catch (error) {
        console.error("bulkMarkInquiriesAsRead error:", error);
        return { success: false, message: "Failed to update inquiries" };
    }
}

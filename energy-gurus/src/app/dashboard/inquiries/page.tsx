import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users, inquiries } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { InquiriesTable } from "@/components/dashboard/inquiries-table";
import { Inbox, Mail } from "lucide-react";

export default async function InquiriesPage() {
    const { userId: clerkId } = await auth();
    if (!clerkId) redirect("/sign-in");

    const [user] = await db.select().from(users).where(eq(users.clerkId, clerkId));
    if (!user) redirect("/sign-in");

    const myInquiries = await db.select().from(inquiries)
        .where(and(
            eq(inquiries.receiverId, user.id),
            eq(inquiries.inquiryType, "client")
        ))
        .orderBy(desc(inquiries.createdAt));

    const unreadCount = myInquiries.filter(i => !i.isRead).length;

    return (
        <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
                        <Inbox className="w-7 h-7 text-amber" />
                        My Inquiries
                    </h1>
                    <p className="text-slate-custom text-sm mt-1">
                        Customer messages received from your public profile
                    </p>
                </div>
                {unreadCount > 0 && (
                    <div className="w-fit flex items-center gap-2 bg-amber/10 text-ink text-amber px-4 py-2 rounded-xl text-sm font-bold">
                        <Mail className="w-4 h-4" />
                        {unreadCount} unread message{unreadCount !== 1 ? "s" : ""}
                    </div>
                )}
            </div>

            {/* Inquiries Table */}
            <InquiriesTable inquiries={myInquiries} />
        </div>
    );
}

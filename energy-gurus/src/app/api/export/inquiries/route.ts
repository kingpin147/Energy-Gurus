import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { inquiries, users } from "@/db/schema";
import { NextResponse } from "next/server";
import { getUserRole } from "@/lib/roles";
import { desc, inArray } from "drizzle-orm";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const role = await getUserRole();
    if (role !== "super-admin" && role !== "admin") {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const allInqs = await db.select().from(inquiries).orderBy(desc(inquiries.createdAt));
    
    const userIds = Array.from(new Set([
      ...allInqs.map(i => i.receiverId),
      ...allInqs.map(i => i.senderId).filter(Boolean) as string[]
    ]));

    const usersList = userIds.length > 0
      ? await db.select().from(users).where(inArray(users.id, userIds))
      : [];
      
    const userMap = new Map(usersList.map(u => [u.id, u]));

    const headers = [
      "ID",
      "Sender Type",
      "Sender Name",
      "Sender Email",
      "Sender Phone",
      "Receiver Name",
      "Receiver Email",
      "Subject",
      "Message",
      "Status",
      "Reply Message",
      "Created At"
    ].join(",");

    const rows = allInqs.map(inq => {
      const sender = inq.senderId ? userMap.get(inq.senderId) : null;
      const receiver = userMap.get(inq.receiverId);

      const isGuest = inq.inquiryType === "public" || !sender;
      const senderName = isGuest ? inq.guestName || "Guest" : sender.name;
      const senderEmail = isGuest ? inq.guestEmail || "N/A" : sender.email;
      const senderPhone = isGuest ? inq.guestPhone || "N/A" : "N/A";

      return [
        inq.id,
        inq.inquiryType,
        `"${(senderName || "").replace(/"/g, '""')}"`,
        senderEmail,
        senderPhone,
        `"${(receiver?.name || "").replace(/"/g, '""')}"`,
        receiver?.email || "",
        `"${(inq.subject || "").replace(/"/g, '""')}"`,
        `"${(inq.message || "").replace(/"/g, '""').replace(/\r?\n/g, ' ')}"`,
        inq.status,
        `"${(inq.reply || "").replace(/"/g, '""').replace(/\r?\n/g, ' ')}"`,
        inq.createdAt ? inq.createdAt.toISOString() : ""
      ].join(",");
    });

    const csvContent = [headers, ...rows].join("\n");

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="inquiries_report_${Date.now()}.csv"`
      }
    });
  } catch (error: any) {
    console.error("Export Inquiries CSV Error:", error);
    return new NextResponse(error?.message || "Internal Error", { status: 500 });
  }
}

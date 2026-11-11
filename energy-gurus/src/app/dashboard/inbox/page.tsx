import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users, inquiries } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { AdminInboxClient } from "@/components/dashboard/admin-inbox-client";

export const dynamic = "force-dynamic";

export default async function AdminInboxPage() {
    const { userId: clerkId } = await auth();
    if (!clerkId) redirect("/sign-in");

    const [user] = await db.select().from(users).where(eq(users.clerkId, clerkId));
    if (!user || (user.role !== "admin" && user.role !== "super-admin")) {
        redirect("/dashboard");
    }

    // Fetch all inquiries ordered by latest
    const allInquiries = await db.select().from(inquiries).orderBy(desc(inquiries.createdAt));

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto font-sans">
            <AdminInboxClient initialInquiries={allInquiries as any} />
        </div>
    );
}

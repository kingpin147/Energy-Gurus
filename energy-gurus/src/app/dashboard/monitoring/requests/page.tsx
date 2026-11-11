import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users, monitoringRequests } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { MonitoringRequestsClient } from "@/components/dashboard/monitoring-requests-client";

export const dynamic = "force-dynamic";

export default async function MonitoringRequestsPage() {
    const { userId: clerkId } = await auth();
    if (!clerkId) redirect("/sign-in");

    // Only allow super-admin or admin to view all requests
    const [user] = await db.select().from(users).where(eq(users.clerkId, clerkId));
    if (!user || (user.role !== 'super-admin' && user.role !== 'admin')) {
        redirect("/dashboard");
    }

    const requests = await db.select().from(monitoringRequests).orderBy(desc(monitoringRequests.createdAt));

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
            <MonitoringRequestsClient initialRequests={requests as any} />
        </div>
    );
}

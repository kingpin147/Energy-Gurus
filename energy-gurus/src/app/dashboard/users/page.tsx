import { db } from "@/db";
import { users, brands, epcInstallers, invitations } from "@/db/schema";
import { redirect } from "next/navigation";
import { eq, desc } from "drizzle-orm";
import { getUserRole } from "@/lib/roles";
import { syncPendingInvitations } from "@/lib/actions/invitations";
import { UserManagementClient } from "@/components/dashboard/user-management-client";
import { auth, createClerkClient } from "@clerk/nextjs/server";

export default async function UserManagementPage() {
    const userRole = await getUserRole();

    if (userRole !== 'super-admin' && userRole !== 'admin') {
        redirect("/dashboard");
    }

    const { userId: currentClerkId } = await auth();

    // Automatically touch current user's updatedAt in database to guarantee real-time presence
    if (currentClerkId) {
        db.update(users)
            .set({ updatedAt: new Date() })
            .where(eq(users.clerkId, currentClerkId))
            .catch(() => {});
    }

    // Automatically sync pending invitations against DB users and Clerk (without revalidatePath during render)
    await syncPendingInvitations(false);

    // Fetch verified pending invitations
    const pendingInvites = await db.select().from(invitations).orderBy(desc(invitations.createdAt));

    // Fetch Clerk user telemetry (lastSignInAt, lastActiveAt, createdAt)
    let clerkUsersMap: Record<string, { email: string | null; lastSignInAt: string | null; lastActiveAt: string | null; createdAt: string | null }> = {};
    try {
        const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
        const clerkRes = await clerk.users.getUserList({ limit: 500 });
        clerkRes.data.forEach(cu => {
            const primaryEmail = cu.emailAddresses[0]?.emailAddress?.toLowerCase().trim() || null;
            const data = {
                email: primaryEmail,
                lastSignInAt: cu.lastSignInAt ? new Date(cu.lastSignInAt).toISOString() : null,
                lastActiveAt: cu.lastActiveAt ? new Date(cu.lastActiveAt).toISOString() : null,
                createdAt: cu.createdAt ? new Date(cu.createdAt).toISOString() : null,
            };
            if (cu.id) clerkUsersMap[cu.id] = data;
            if (primaryEmail) clerkUsersMap[primaryEmail] = data;
        });
    } catch (e) {
        console.error("Error fetching Clerk users telemetry:", e);
    }

    // Fetch all users with logos and DB activity timestamp
    const baseUsers = await db.select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        clerkId: users.clerkId,
        isActive: users.isActive,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        brandLogo: brands.logoUrl,
        epcLogo: epcInstallers.logoUrl
    })
        .from(users)
        .leftJoin(brands, eq(brands.userId, users.id))
        .leftJoin(epcInstallers, eq(epcInstallers.userId, users.id))
        .orderBy(desc(users.createdAt));

    const allUsers = [...baseUsers];

    // Force include super admins in display list even if not in DB yet
    const adminWhitelist = ["nomiking0072012@gmail.com", "energygurusonline@gmail.com"];
    adminWhitelist.forEach((email, index) => {
        if (!allUsers.find(u => u.email.toLowerCase() === email.toLowerCase())) {
            allUsers.push({
                id: `system-admin-${index}`,
                email: email,
                name: "Super Admin (System)",
                role: "super-admin" as const,
                clerkId: "system",
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
                brandLogo: null,
                epcLogo: null
            } as any);
        }
    });

    // Merge Clerk telemetry (lastSignInAt, lastActiveAt) + DB updatedAt + live session presence
    const enhancedUsers = allUsers.map(u => {
        const telemetry = (u.clerkId && clerkUsersMap[u.clerkId]) || (u.email && clerkUsersMap[u.email.toLowerCase()]) || null;
        
        // Is this the currently logged-in user viewing this page right now?
        const isCurrentSessionUser = Boolean(
            (currentClerkId && u.clerkId === currentClerkId) ||
            (currentClerkId && clerkUsersMap[currentClerkId] && u.email && clerkUsersMap[currentClerkId]?.email?.toLowerCase() === u.email?.toLowerCase())
        );

        // Find the latest active timestamp across:
        // 1. Current session viewing this page (Date.now())
        // 2. DB updatedAt (heartbeat / profile changes)
        // 3. Clerk lastActiveAt
        // 4. Clerk lastSignInAt
        const timestamps: number[] = [
            isCurrentSessionUser ? Date.now() : 0,
            (u as any).updatedAt ? new Date((u as any).updatedAt).getTime() : 0,
            telemetry?.lastActiveAt ? new Date(telemetry.lastActiveAt).getTime() : 0,
            telemetry?.lastSignInAt ? new Date(telemetry.lastSignInAt).getTime() : 0,
        ].filter(t => t > 0);

        const latestActiveTs = timestamps.length > 0 ? new Date(Math.max(...timestamps)).toISOString() : null;

        return {
            ...u,
            createdAt: u.createdAt || telemetry?.createdAt || new Date(),
            lastSignInAt: telemetry?.lastSignInAt || null,
            lastActiveAt: latestActiveTs,
        };
    });

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto font-sans">
            <UserManagementClient
                initialUsers={enhancedUsers as any}
                initialPendingInvites={pendingInvites as any}
                userRole={userRole}
            />
        </div>
    );
}

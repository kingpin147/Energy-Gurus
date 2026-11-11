import { db } from "@/db";
import { users, brands, epcInstallers, invitations } from "@/db/schema";
import { redirect } from "next/navigation";
import { eq, desc } from "drizzle-orm";
import { getUserRole } from "@/lib/roles";
import { syncPendingInvitations } from "@/lib/actions/invitations";
import { UserManagementClient } from "@/components/dashboard/user-management-client";

export default async function UserManagementPage() {
    const userRole = await getUserRole();

    if (userRole !== 'super-admin' && userRole !== 'admin') {
        redirect("/dashboard");
    }

    // Automatically sync pending invitations against DB users and Clerk
    await syncPendingInvitations();

    // Fetch verified pending invitations
    const pendingInvites = await db.select().from(invitations).orderBy(desc(invitations.createdAt));

    // Fetch all users with logos
    const baseUsers = await db.select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        clerkId: users.clerkId,
        isActive: users.isActive,
        createdAt: users.createdAt,
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
                brandLogo: null,
                epcLogo: null
            } as any);
        }
    });

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto font-sans">
            <UserManagementClient
                initialUsers={allUsers as any}
                initialPendingInvites={pendingInvites as any}
                userRole={userRole}
            />
        </div>
    );
}

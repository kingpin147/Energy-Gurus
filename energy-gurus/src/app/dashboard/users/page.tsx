import { db } from "@/db";
import { users, brands, epcInstallers } from "@/db/schema";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users as UsersIcon, ShieldAlert, Power, PowerOff, User as UserIcon } from "lucide-react";
import { toggleUserStatus } from "@/lib/actions/users";
import { invitations } from "@/db/schema";
import { ListSort } from "@/components/shared/list-sort";
import { ListSearch } from "@/components/shared/list-search";
import { eq, asc, desc, like, or, and } from "drizzle-orm";
import { getUserRole } from "@/lib/roles";
import { BulkInvite } from "@/components/dashboard/bulk-invite";
import { SingleInvite } from "@/components/dashboard/single-invite";
import { PendingInvitations } from "@/components/dashboard/pending-invitations";
import { DeleteUserButton } from "@/components/dashboard/delete-user-button";
import { createClerkClient } from "@clerk/nextjs/server";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default async function UserManagementPage({
    searchParams
    }: {
    searchParams: Promise<{ sort?: string; role?: string; q?: string }>;
}) {
    const { sort, role: roleFilter, q } = await searchParams;
    const userRole = await getUserRole();

    if (userRole !== 'super-admin' && userRole !== 'admin') {
        redirect("/dashboard");
    }

    const order = sort === "oldest" ? asc(users.createdAt) : desc(users.createdAt);
    const roleCondition = roleFilter ? eq(users.role, roleFilter as "admin" | "epc" | "brand" | "super-admin") : undefined;
    const searchCondition = q ? or(like(users.name, `%${q}%`), like(users.email, `%${q}%`)) : undefined;
    const where = and(roleCondition, searchCondition);

    const allInvites = await db.select().from(invitations).orderBy(invitations.createdAt);

    // Sync pending invitations with Clerk on-demand
    const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
    let needsRequery = false;

    await Promise.all(allInvites.map(async (invite) => {
        try {
            const clerkUsers = await clerkClient.users.getUserList({
                emailAddress: [invite.email.toLowerCase()]
            });

            if (clerkUsers.data && clerkUsers.data.length > 0) {
                const clerkUser = clerkUsers.data[0];
                await db.insert(users).values({
                    clerkId: clerkUser.id,
                    email: invite.email.toLowerCase(),
                    name: clerkUser.fullName || clerkUser.firstName || invite.email.split("@")[0],
                    role: invite.role
                }).onConflictDoNothing();

                await db.delete(invitations).where(eq(invitations.id, invite.id));

                await clerkClient.users.updateUserMetadata(clerkUser.id, {
                    publicMetadata: { role: invite.role }
                });

                needsRequery = true;
            }
        } catch (err) {
            console.error("Clerk sync error for:", invite.email, err);
        }
    }));

    let baseUsers;
    let pendingInvites;

    const query = db.select({
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
        .where(where)
        .orderBy(order);

    if (needsRequery) {
        baseUsers = await query;
        const updatedInvites = await db.select().from(invitations).orderBy(invitations.createdAt);
        const registeredEmails = new Set(baseUsers.map(u => u.email.toLowerCase()));
        pendingInvites = updatedInvites.filter(inv => !registeredEmails.has(inv.email.toLowerCase()));
    } else {
        baseUsers = await query;
        const registeredEmails = new Set(baseUsers.map(u => u.email.toLowerCase()));
        pendingInvites = allInvites.filter(inv => !registeredEmails.has(inv.email.toLowerCase()));
    }

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
        <div className="p-8 space-y-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber text-ink rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                        <UsersIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
                        <p className="text-slate-custom text-sm">Manage platform access, roles, and administrative permissions.</p>
                    </div>
                </div>
                <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto items-center">
                    <a href="/api/reports?type=users" download>
                        <Button variant="outline" className="h-11 rounded-xl gap-2 font-bold whitespace-nowrap">
                            <UsersIcon className="w-4 h-4" /> Export CSV
                        </Button>
                    </a>
                    <ListSearch placeholder="Search name or email..." />
                    <div className="flex gap-3">
                        <ListSort
                            label="Filter by Role"
                            paramName="role"
                            defaultValue=""
                            options={[
                                { label: "All Roles", value: "" },
                                { label: "Admin", value: "admin" },
                                { label: "EPC Installer", value: "epc" },
                                { label: "Solar Brand", value: "brand" },
                            ]}
                        />
                        <ListSort
                            paramName="sort"
                            defaultValue="latest"
                            options={[
                                { label: "Latest", value: "latest" },
                                { label: "Oldest", value: "oldest" },
                            ]}
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-6">
                    <SingleInvite />
                    <BulkInvite />
                </div>

                <div className="lg:col-span-2 space-y-8">
                    <PendingInvitations initialInvites={pendingInvites as any} />

                    <Card className="border-none shadow-xl shadow-secondary/5 rounded-3xl overflow-hidden">
                        <CardHeader className="bg-paper/10 p-6 border-b">
                            <CardTitle className="text-xl flex items-center gap-2">
                                <ShieldAlert className="w-5 h-5 text-amber" />
                                Registered Users
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse min-w-[800px]">
                                    <thead>
                                        <tr className="bg-paper/5 border-b">
                                            <th className="p-6 text-[10px] font-black uppercase tracking-widest opacity-40">User</th>
                                            <th className="p-6 text-[10px] font-black uppercase tracking-widest opacity-40">Email</th>
                                            <th className="p-6 text-[10px] font-black uppercase tracking-widest opacity-40">Role</th>
                                            <th className="p-6 text-[10px] font-black uppercase tracking-widest opacity-40 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {allUsers.map((user) => {
                                            const whitelist = ["nomiking0072012@gmail.com", "energygurusonline@gmail.com"];
                                            const isSuperAdmin = whitelist.includes(user.email.toLowerCase()) || user.role === 'super-admin';
                                            const displayRole = isSuperAdmin ? "super-admin" : user.role;
                                            const userLogo = user.brandLogo || user.epcLogo;

                                            return (
                                                <tr key={user.id} className="border-b hover:bg-paper/5 transition-colors group">
                                                    <td className="p-6">
                                                        <div className="flex items-center gap-4">
                                                            <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                                                                <AvatarImage src={userLogo || undefined} />
                                                                <AvatarFallback className="bg-amber/10 text-ink text-amber">
                                                                    <UserIcon className="w-5 h-5" />
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <span className="font-bold whitespace-nowrap text-graphite group-hover:text-amber transition-colors">{user.name || "N/A"}</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-6 text-slate-custom text-sm whitespace-nowrap">{user.email}</td>
                                                    <td className="p-6">
                                                        <Badge
                                                            variant="outline"
                                                            logoUrl={userLogo}
                                                            className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap ${displayRole === 'super-admin' ? 'bg-red-50 text-red-600 border-red-100' :
                                                                displayRole === 'admin' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                                    displayRole === 'epc' ? 'bg-green-50 text-green-600 border-green-100' :
                                                                        'bg-paper/50 text-slate-custom border-transparent'
                                                                }`}
                                                        >
                                                            {displayRole.replace('-', ' ')}
                                                        </Badge>
                                                    </td>
                                                    <td className="p-6">
                                                        <div className="flex items-center justify-end gap-2">
                                                            {!isSuperAdmin && (user.role === 'epc' || user.role === 'brand') && (
                                                                <form action={toggleUserStatus.bind(null, user.id)}>
                                                                    <Button
                                                                        variant={user.isActive ? "outline" : "default"}
                                                                        size="sm"
                                                                        className={`h-9 px-4 rounded-xl gap-2 font-bold ${user.isActive ? "text-green-600 border-green-200 hover:bg-green-100" : "bg-red-600 hover:bg-red-700 text-white"}`}
                                                                    >
                                                                        {user.isActive ? <Power className="w-4 h-4" /> : <PowerOff className="w-4 h-4" />}
                                                                        {user.isActive ? "Active" : "Inactive"}
                                                                    </Button>
                                                                </form>
                                                            )}


                                                            {!isSuperAdmin && (userRole === 'super-admin' || (userRole === 'admin' && user.role !== 'admin' && user.role !== 'super-admin')) && (
                                                                <DeleteUserButton
                                                                    userId={user.id}
                                                                    userName={user.name || ""}
                                                                    userEmail={user.email}
                                                                />
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}

                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

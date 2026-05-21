import { db } from "@/db";
import { users } from "@/db/schema";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users as UsersIcon, ShieldAlert, Trash2, MailPlus, Clock, Power, PowerOff } from "lucide-react";
import { deleteUser, toggleUserStatus, updateUserRole } from "@/lib/actions/users";
import { createInvitation } from "@/lib/actions/invitations";
import { invitations } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { ListSort } from "@/components/shared/list-sort";
import { ListSearch } from "@/components/shared/list-search";
import { eq, asc, desc, like, or, and } from "drizzle-orm";
import { getUserRole } from "@/lib/roles";
import { BulkInvite } from "@/components/dashboard/bulk-invite";
import { createClerkClient } from "@clerk/nextjs/server";

export default async function UserManagementPage({
    searchParams,
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

    if (needsRequery) {
        baseUsers = await db.select().from(users).where(where).orderBy(order);
        const updatedInvites = await db.select().from(invitations).orderBy(invitations.createdAt);
        const registeredEmails = new Set(baseUsers.map(u => u.email.toLowerCase()));
        pendingInvites = updatedInvites.filter(inv => !registeredEmails.has(inv.email.toLowerCase()));
    } else {
        baseUsers = await db.select().from(users).where(where).orderBy(order);
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
                createdAt: new Date(),
                updatedAt: new Date()
            } as typeof users.$inferSelect);
        }
    });

    return (
        <div className="p-8 space-y-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center">
                        <UsersIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
                        <p className="text-muted-foreground">Manage platform access, roles, and administrative permissions.</p>
                    </div>
                </div>
                <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                    <ListSearch placeholder="Search name or email..." />
                    <div className="flex gap-3">
                        <ListSort
                            label="Filter by Role"
                            defaultValue="all"
                            options={[
                                { label: "All Roles", value: "" },
                                { label: "Admin", value: "admin" },
                                { label: "EPC Installer", value: "epc" },
                                { label: "Solar Brand", value: "brand" },
                            ]}
                        />
                        <ListSort
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
                    <Card className="border-none shadow-sm rounded-3xl h-fit">
                        <CardHeader>
                            <CardTitle className="text-xl flex items-center gap-2">
                                <MailPlus className="w-5 h-5 text-primary" />
                                Invite User
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form action={async (formData) => {
                                "use server";
                                const email = formData.get("email") as string;
                                const selectedRole = formData.get("role") as "admin" | "epc" | "brand";
                                await createInvitation(email, selectedRole);
                            }} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest opacity-60">Email Address</label>
                                    <input name="email" type="email" placeholder="user@example.com" className="w-full border rounded-xl p-3 bg-secondary/5 focus:ring-2 focus:ring-primary outline-none" required />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-xs font-bold uppercase tracking-widest opacity-60">Assign Role</label>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                        <label className="cursor-pointer">
                                            <input type="radio" name="role" value="epc" className="peer sr-only" defaultChecked />
                                            <div className="p-3 border rounded-xl text-sm font-bold text-center peer-checked:bg-primary peer-checked:text-white peer-checked:border-primary hover:bg-secondary transition-colors">
                                                EPC Installer
                                            </div>
                                        </label>
                                        <label className="cursor-pointer">
                                            <input type="radio" name="role" value="brand" className="peer sr-only" />
                                            <div className="p-3 border rounded-xl text-sm font-bold text-center peer-checked:bg-primary peer-checked:text-white peer-checked:border-primary hover:bg-secondary transition-colors">
                                                Solar Brand
                                            </div>
                                        </label>
                                        <label className="cursor-pointer">
                                            <input type="radio" name="role" value="admin" className="peer sr-only" />
                                            <div className="p-3 border rounded-xl text-sm font-bold text-center peer-checked:bg-primary peer-checked:text-white peer-checked:border-primary hover:bg-secondary transition-colors">
                                                Admin
                                            </div>
                                        </label>
                                    </div>
                                </div>
                                <Button type="submit" className="w-full rounded-xl font-bold h-12 gap-2 shadow-lg shadow-primary/20">
                                    Send Invite / Assign
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <BulkInvite />
                </div>

                <div className="lg:col-span-2 space-y-8">
                    {pendingInvites.length > 0 && (
                        <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
                            <CardHeader className="bg-orange-500/10 p-6">
                                <CardTitle className="text-xl flex items-center gap-2 text-orange-600">
                                    <Clock className="w-5 h-5" />
                                    Pending Invitations
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left min-w-[600px]">
                                        <thead>
                                            <tr className="bg-secondary/5 border-b">
                                                <th className="p-6 text-xs font-bold uppercase tracking-widest opacity-60">Email</th>
                                                <th className="p-6 text-xs font-bold uppercase tracking-widest opacity-60">Pre-assigned Role</th>
                                                <th className="p-6 text-xs font-bold uppercase tracking-widest opacity-60 text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {pendingInvites.map((invite) => (
                                                <tr key={invite.id} className="border-b">
                                                    <td className="p-6 font-medium">{invite.email}</td>
                                                    <td className="p-6">
                                                        <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-secondary text-muted-foreground border">
                                                            {invite.role}
                                                        </span>
                                                    </td>
                                                    <td className="p-6 text-right">
                                                        <form action={async () => {
                                                            "use server";
                                                            await db.delete(invitations).where(eq(invitations.id, invite.id));
                                                            revalidatePath("/dashboard/users");
                                                        }}>
                                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500 rounded-lg">
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </form>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
                        <CardHeader className="bg-secondary/10 p-6">
                            <CardTitle className="text-xl flex items-center gap-2">
                                <ShieldAlert className="w-5 h-5 text-primary" />
                                Registered Users
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse min-w-[800px]">
                                    <thead>
                                        <tr className="bg-secondary/5 border-b">
                                            <th className="p-6 text-xs font-bold uppercase tracking-widest opacity-60">Name</th>
                                            <th className="p-6 text-xs font-bold uppercase tracking-widest opacity-60">Email</th>
                                            <th className="p-6 text-xs font-bold uppercase tracking-widest opacity-60">Role</th>
                                            <th className="p-6 text-xs font-bold uppercase tracking-widest opacity-60 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {allUsers.map((user) => {
                                            const whitelist = ["nomiking0072012@gmail.com", "energygurusonline@gmail.com"];
                                            const isSuperAdmin = whitelist.includes(user.email.toLowerCase()) || user.role === 'super-admin';
                                            const displayRole = isSuperAdmin ? "super-admin" : user.role;

                                            return (
                                                <tr key={user.id} className="border-b hover:bg-secondary/5 transition-colors">
                                                    <td className="p-6 font-bold whitespace-nowrap">{user.name || "N/A"}</td>
                                                    <td className="p-6 text-muted-foreground whitespace-nowrap">{user.email}</td>
                                                    <td className="p-6">
                                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border whitespace-nowrap ${displayRole === 'super-admin' ? 'bg-red-100 text-red-600 border-red-200' :
                                                            displayRole === 'admin' ? 'bg-blue-100 text-blue-600 border-blue-200' :
                                                                displayRole === 'epc' ? 'bg-green-100 text-green-600 border-green-200' :
                                                                    'bg-secondary text-muted-foreground border-secondary-foreground/10'
                                                            }`}>
                                                            {displayRole.replace('-', ' ')}
                                                        </span>
                                                    </td>
                                                    <td className="p-6">
                                                        <div className="flex items-center justify-end gap-2">
                                                            {!isSuperAdmin && (user.role === 'epc' || user.role === 'brand') && (
                                                                <form action={toggleUserStatus.bind(null, user.id)}>
                                                                    <Button
                                                                        variant={user.isActive ? "outline" : "default"}
                                                                        size="sm"
                                                                        className={`h-9 px-4 rounded-xl gap-2 font-bold ${user.isActive ? "text-green-600 border-green-200 hover:bg-green-50" : "bg-red-600 hover:bg-red-700 text-white"}`}
                                                                    >
                                                                        {user.isActive ? <Power className="w-4 h-4" /> : <PowerOff className="w-4 h-4" />}
                                                                        {user.isActive ? "Active" : "Inactive"}
                                                                    </Button>
                                                                </form>
                                                            )}


                                                            {/* Only Super Admin can delete other Admins, but NO ONE can delete Super Admins */}
                                                            {!isSuperAdmin && (userRole === 'super-admin' || (userRole === 'admin' && user.role !== 'admin' && user.role !== 'super-admin')) && (
                                                                <form action={async () => {
                                                                    "use server";
                                                                    await deleteUser(user.id);
                                                                }}>
                                                                    <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-xl text-red-500 hover:text-red-600 hover:bg-red-50">
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </Button>
                                                                </form>
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

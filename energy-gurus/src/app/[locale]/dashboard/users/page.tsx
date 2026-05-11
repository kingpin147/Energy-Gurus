import { db } from "@/db";
import { users } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users as UsersIcon, ShieldAlert, Trash2, UserCog, MailPlus, Clock } from "lucide-react";
import { deleteUser, updateUserRole } from "@/lib/actions/users";
import { createInvitation } from "@/lib/actions/invitations";
import { invitations } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

import { getUserRole } from "@/lib/roles";

export default async function UserManagementPage() {
    const role = await getUserRole();

    if (role !== 'super-admin' && role !== 'admin') {
        redirect("/dashboard");
    }

    let allUsers = await db.select().from(users).orderBy(users.createdAt);
    const pendingInvites = await db.select().from(invitations).orderBy(invitations.createdAt);

    // Force include super admins in display list even if not in DB yet
    const whitelist = ["nomiking0072012@gmail.com", "energygurusonline@gmail.com"];
    whitelist.forEach((email, index) => {
        if (!allUsers.find(u => u.email.toLowerCase() === email.toLowerCase())) {
            allUsers.push({
                id: `system-admin-${index}`,
                email: email,
                name: "Super Admin (System)",
                role: "super-admin",
                clerkId: "system",
                createdAt: new Date(),
                updatedAt: new Date()
            } as any);
        }
    });

    return (
        <div className="p-8 space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center">
                        <UsersIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
                        <p className="text-muted-foreground">Manage platform access, roles, and administrative permissions.</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-1 border-none shadow-sm rounded-3xl h-fit">
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
                            const role = formData.get("role") as any;
                            await createInvitation(email, role);
                        }} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest opacity-60">Email Address</label>
                                <input name="email" type="email" placeholder="user@example.com" className="w-full border rounded-xl p-3 bg-secondary/5 focus:ring-2 focus:ring-primary outline-none" required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest opacity-60">Assign Role</label>
                                <select name="role" className="w-full border rounded-xl p-3 bg-secondary/5 focus:ring-2 focus:ring-primary outline-none">
                                    <option value="user">User</option>
                                    <option value="epc">EPC Installer</option>
                                    <option value="admin">Admin</option>
                                    <option value="brand">Solar Brand</option>
                                </select>
                            </div>
                            <Button type="submit" className="w-full rounded-xl font-bold h-12 gap-2 shadow-lg shadow-primary/20">
                                Send Invite / Assign
                            </Button>
                        </form>
                    </CardContent>
                </Card>

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
                                <table className="w-full text-left">
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
                        <table className="w-full text-left border-collapse">
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
                                            <td className="p-6 font-bold">{user.name || "N/A"}</td>
                                            <td className="p-6 text-muted-foreground">{user.email}</td>
                                            <td className="p-6">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                                                    displayRole === 'super-admin' ? 'bg-red-100 text-red-600 border-red-200' :
                                                    displayRole === 'admin' ? 'bg-blue-100 text-blue-600 border-blue-200' :
                                                    displayRole === 'epc' ? 'bg-green-100 text-green-600 border-green-200' :
                                                    'bg-secondary text-muted-foreground border-secondary-foreground/10'
                                                }`}>
                                                    {displayRole}
                                                </span>
                                            </td>
                                            <td className="p-6">
                                                <div className="flex items-center justify-end gap-2">
                                                    {!isSuperAdmin && role === 'super-admin' && (
                                                        <form action={async (formData) => {
                                                            "use server";
                                                            const targetRole = user.role === 'admin' ? 'user' : 'admin';
                                                            await updateUserRole(user.id, targetRole);
                                                        }}>
                                                            <Button variant="outline" size="sm" className="h-9 px-4 rounded-xl gap-2 font-bold">
                                                                <UserCog className="w-4 h-4" />
                                                                {user.role === 'admin' ? "Demote" : "Make Admin"}
                                                            </Button>
                                                        </form>
                                                    )}
                                                    
                                                    {/* Only Super Admin can delete other Admins, but NO ONE can delete Super Admins */}
                                                    {!isSuperAdmin && (role === 'super-admin' || (role === 'admin' && user.role !== 'admin' && user.role !== 'super-admin')) && (
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

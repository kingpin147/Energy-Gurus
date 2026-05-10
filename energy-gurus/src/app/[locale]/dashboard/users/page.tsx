import { clerkClient } from "@clerk/nextjs/server";
import { getUserRole } from "@/lib/roles";
import { redirect } from "next/navigation";
import { updateUserRole } from "@/lib/actions/users";
import { UserRole, userRoleEnum } from "@/db/schema";

export default async function UsersPage() {
  const role = await getUserRole();
  if (role !== "super-admin" && role !== "admin") {
    redirect("/dashboard");
  }

  const client = await clerkClient();
  const users = await client.users.getUserList();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">User Management</h1>
      <div className="bg-card border rounded-lg overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-secondary/50 border-b">
            <tr>
              <th className="px-6 py-3 text-sm font-semibold">User</th>
              <th className="px-6 py-3 text-sm font-semibold">Email</th>
              <th className="px-6 py-3 text-sm font-semibold">Role</th>
              <th className="px-6 py-3 text-sm font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.data.map((user) => (
              <tr key={user.id} className="hover:bg-secondary/20 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <img src={user.imageUrl} className="w-8 h-8 rounded-full" alt="" />
                    <span className="font-medium">{user.firstName} {user.lastName}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">
                  {user.emailAddresses[0]?.emailAddress}
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary capitalize">
                    {(user.publicMetadata as { role?: string }).role || "user"}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <form action={async (formData: FormData) => {
                    "use server";
                    const newRole = formData.get("role") as UserRole;
                    await updateUserRole(user.id, newRole);
                  }}>
                    <select 
                      name="role" 
                      defaultValue={(user.publicMetadata as { role?: string }).role || "user"}
                      className="text-sm border rounded px-2 py-1 bg-transparent"
                      onChange={(e) => e.target.form?.requestSubmit()}
                    >
                      {userRoleEnum.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

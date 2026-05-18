import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { NextResponse } from "next/server";
import { getUserRole } from "@/lib/roles";
import { desc } from "drizzle-orm";

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

    const allUsers = await db.select().from(users).orderBy(desc(users.createdAt));
    
    const headers = ["ID", "Name", "Email", "Role", "Is Active", "Created At"].join(",");
    const rows = allUsers.map(u => [
      u.id,
      `"${(u.name || "").replace(/"/g, '""')}"`,
      u.email,
      u.role,
      u.isActive ? "Yes" : "No",
      u.createdAt ? u.createdAt.toISOString() : ""
    ].join(","));

    const csvContent = [headers, ...rows].join("\n");

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="users_report_${Date.now()}.csv"`
      }
    });
  } catch (error: any) {
    console.error("Export Users CSV Error:", error);
    return new NextResponse(error?.message || "Internal Error", { status: 500 });
  }
}

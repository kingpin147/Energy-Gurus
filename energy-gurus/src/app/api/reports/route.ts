import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { users, monitoringStats, inquiries } from "@/db/schema";
import { NextResponse } from "next/server";
import { getUserRole } from "@/lib/roles";
import { desc } from "drizzle-orm";

export async function GET(req: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const role = await getUserRole();
        if (role !== "super-admin" && role !== "admin") {
            return new NextResponse("Forbidden", { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const type = searchParams.get("type") || "users";

        let csvContent = "";
        let filename = `report_${type}_${Date.now()}.csv`;

        if (type === "users") {
            const data = await db.select().from(users).orderBy(desc(users.createdAt));
            const headers = ["ID", "Name", "Email", "Role", "Is Active", "Created At"].join(",");
            const rows = data.map(u => [
                u.id,
                `"${(u.name || "").replace(/"/g, '""')}"`,
                u.email,
                u.role,
                u.isActive ? "Yes" : "No",
                u.createdAt ? u.createdAt.toISOString() : ""
            ].join(","));
            csvContent = [headers, ...rows].join("\n");
        }
        else if (type === "monitoring") {
            const data = await db.select().from(monitoringStats).orderBy(desc(monitoringStats.updatedAt)).limit(50);
            const headers = ["ID", "Power Flow (kW)", "Grid Export (kW)", "Self Consumption (%)", "Updated At"].join(",");
            const rows = data.map(s => [
                s.id,
                s.totalPowerFlow,
                s.gridExport,
                s.selfConsumption,
                s.updatedAt.toISOString()
            ].join(","));
            csvContent = [headers, ...rows].join("\n");
        }
        else if (type === "inquiries") {
            const data = await db.select().from(inquiries).orderBy(desc(inquiries.createdAt));
            const headers = ["ID", "Sender Email", "Subject", "Status", "Type", "Created At"].join(",");
            const rows = data.map(i => [
                i.id,
                i.guestEmail || "N/A",
                `"${(i.subject || "").replace(/"/g, '""')}"`,
                i.status,
                i.inquiryType,
                i.createdAt.toISOString()
            ].join(","));
            csvContent = [headers, ...rows].join("\n");
        }
        else {
            return new NextResponse("Invalid report type", { status: 400 });
        }

        return new NextResponse(csvContent, {
            headers: {
                "Content-Type": "text/csv; charset=utf-8",
                "Content-Disposition": `attachment; filename="${filename}"`
            }
        });
    } catch (error: any) {
        console.error("Export CSV Error:", error);
        return new NextResponse(error?.message || "Internal Error", { status: 500 });
    }
}

"use client";

import { Link, usePathname } from "@/i18n/routing";
import {
    LayoutDashboard,
    Activity,
    FileText,
    Settings,
    ArrowLeft,
    Mic
} from "lucide-react";

import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    // const user = await currentUser();
    // const primaryEmail = user?.emailAddresses[0]?.emailAddress;
    // const ADMIN_EMAIL = "nomiking0072012@gmail.com";

    // Access control: Only the main email can access the dashboard for now
    // if (primaryEmail !== ADMIN_EMAIL) {
    //     redirect("/");
    // }

    return (
        <div className="flex h-screen bg-secondary/10">
            {/* Sidebar */}
            <aside className="w-64 border-r bg-card flex flex-col">
                <div className="h-16 flex items-center px-6 border-b">
                    <Link href="/" className="flex items-center space-x-2">
                        <div className="bg-primary p-1 rounded-lg">
                            <Mic className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-lg font-bold text-primary">EnergyGurus</span>
                    </Link>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <SidebarLink href="/dashboard" icon={<LayoutDashboard className="w-4 h-4" />} label="Overview" active={pathname === '/dashboard'} />
                    <SidebarLink href="/dashboard/monitoring" icon={<Activity className="w-4 h-4" />} label="Live Telemetry" active={pathname === '/dashboard/monitoring'} />
                    <SidebarLink href="/dashboard/reports" icon={<FileText className="w-4 h-4" />} label="Reports" active={pathname === '/dashboard/reports'} />
                    <SidebarLink href="/dashboard/settings" icon={<Settings className="w-4 h-4" />} label="Settings" active={pathname === '/dashboard/settings'} />
                </nav>

                <div className="p-4 border-t space-y-4">
                    <Link
                        href="/"
                        className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to Site</span>
                    </Link>
                    {/* <div className="flex items-center justify-between">
                        <span className="text-xs font-medium uppercase text-muted-foreground">Account</span>
                        <UserButton afterSignOutUrl="/" />
                    </div> */}
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto overflow-x-hidden">
                {children}
            </main>
        </div>
    );
}

function SidebarLink({ href, icon, label, active = false }: { href: string, icon: React.ReactNode, label: string, active?: boolean }) {
    return (
        <Link
            href={href}
            className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-secondary hover:text-primary"
                }`}
        >
            {icon}
            <span>{label}</span>
        </Link>
    );
}

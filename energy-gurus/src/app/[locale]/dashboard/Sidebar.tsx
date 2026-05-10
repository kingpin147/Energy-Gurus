"use client";

import { Link, usePathname } from "@/i18n/routing";
import {
    LayoutDashboard,
    Activity,
    FileText,
    Settings,
    ArrowLeft,
    Users,
    Video,
    Briefcase,
    Building2,
    Package
} from "lucide-react";
import { UserRole } from "@/db/schema";

export default function Sidebar({ role }: { role: UserRole }) {
    const pathname = usePathname();

    const links = [
        { href: "/dashboard", icon: <LayoutDashboard className="w-4 h-4" />, label: "Overview", roles: ["super-admin", "admin", "epc", "brand", "user"] },
        { href: "/dashboard/users", icon: <Users className="w-4 h-4" />, label: "User Management", roles: ["super-admin", "admin"] },
        { href: "/dashboard/podcasts", icon: <Video className="w-4 h-4" />, label: "Podcast & Live QA", roles: ["super-admin", "admin"] },
        { href: "/dashboard/epc", icon: <Briefcase className="w-4 h-4" />, label: "EPC Branding", roles: ["super-admin", "admin", "epc"] },
        { href: "/dashboard/brand", icon: <Building2 className="w-4 h-4" />, label: "Brand Management", roles: ["super-admin", "admin", "brand"] },
        { href: "/dashboard/products", icon: <Package className="w-4 h-4" />, label: "Products", roles: ["super-admin", "admin", "brand"] },
        { href: "/dashboard/monitoring", icon: <Activity className="w-4 h-4" />, label: "Live Telemetry", roles: ["super-admin", "admin"] },
        { href: "/dashboard/reports", icon: <FileText className="w-4 h-4" />, label: "Reports", roles: ["super-admin", "admin", "epc", "brand"] },
        { href: "/dashboard/settings", icon: <Settings className="w-4 h-4" />, label: "Settings", roles: ["super-admin", "admin", "epc", "brand", "user"] },
    ];

    return (
        <nav className="flex-1 p-4 space-y-2">
            {links
                .filter(link => link.roles.includes(role))
                .map((link) => (
                    <SidebarLink
                        key={link.href}
                        href={link.href}
                        icon={link.icon}
                        label={link.label}
                        active={pathname === link.href}
                    />
                ))}
        </nav>
    );
}

function SidebarLink({ href, icon, label, active = false }: { href: string, icon: React.ReactNode, label: string, active?: boolean }) {
    return (
        <Link
            href={href as any}
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

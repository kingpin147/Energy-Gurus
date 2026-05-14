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
    Package,
    MessageSquare,
    ShieldCheck
} from "lucide-react";
import { UserRole } from "@/db/schema";

export default function Sidebar({ role }: { role: UserRole }) {
    const pathname = usePathname();

    const isAdmin = role === 'super-admin' || role === 'admin';

    const adminLinks = [
        { href: "/dashboard", icon: <LayoutDashboard className="w-4 h-4" />, label: "Overview" },
        { href: "/dashboard/analytics", icon: <Activity className="w-4 h-4" />, label: "Analytics" },
        { href: "/dashboard/users", icon: <Users className="w-4 h-4" />, label: "Manage Users" },
        { href: "/dashboard/moderation", icon: <ShieldCheck className="w-4 h-4" />, label: "Content Moderation" },
        { href: "/dashboard/content", icon: <Video className="w-4 h-4" />, label: "Content (Podcast/QA)" },
        { href: "/dashboard/brands", icon: <Building2 className="w-4 h-4" />, label: "Manage Brands" },
        { href: "/dashboard/settings", icon: <Settings className="w-4 h-4" />, label: "Settings" },
    ];

    const epcLinks = [
        { href: "/dashboard/epc", icon: <Briefcase className="w-4 h-4" />, label: "My EPC Profile" },
        { href: "/dashboard/inquiries", icon: <MessageSquare className="w-4 h-4" />, label: "My Inquiries" },
        { href: "/dashboard/settings", icon: <Settings className="w-4 h-4" />, label: "Settings" },
    ];

    const brandLinks = [
        { href: "/dashboard/brand", icon: <Building2 className="w-4 h-4" />, label: "My Brand Profile" },
        { href: "/dashboard/inquiries", icon: <MessageSquare className="w-4 h-4" />, label: "My Inquiries" },
        { href: "/dashboard/settings", icon: <Settings className="w-4 h-4" />, label: "Settings" },
    ];

    const links = role === 'super-admin' || role === 'admin' 
        ? adminLinks 
        : role === 'brand' 
            ? brandLinks 
            : epcLinks;


    return (
        <nav className="flex-1 p-4 space-y-2">
            {links.map((link) => (
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

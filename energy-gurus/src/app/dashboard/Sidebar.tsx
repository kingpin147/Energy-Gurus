"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    FileText,
    Settings,
    ArrowLeft,
    Users,
    Video,
    Briefcase,
    Building2,
    Package,
    MessageSquare,
    ShieldCheck,
    Inbox,
    HeadphonesIcon,
    MousePointerClick,
    Star,
    User,
    UserCheck
} from "lucide-react";
import { UserRole } from "@/db/schema";

export default function Sidebar({ role }: { role: UserRole | null | undefined }) {
    const pathname = usePathname();

    const isAdmin = role === 'super-admin' || role === 'admin';

    const adminLinks = [
        { href: "/dashboard", icon: <LayoutDashboard className="w-4 h-4" />, label: "Overview" },
        { href: "/dashboard/admin/onboard-epc", icon: <Briefcase className="w-4 h-4" />, label: "EPC Installers Hub" },
        { href: "/dashboard/admin/onboard-brand", icon: <Building2 className="w-4 h-4" />, label: "Brands Hub & Onboarding" },
        { href: "/dashboard/admin/onboard-writer", icon: <UserCheck className="w-4 h-4" />, label: "Writers Hub & Onboarding" },
        { href: "/dashboard/moderation", icon: <ShieldCheck className="w-4 h-4" />, label: "Submissions & Moderation" },
        { href: "/dashboard/admin/certifications", icon: <ShieldCheck className="w-4 h-4" />, label: "Certification Approvals" },
        { href: "/dashboard/content", icon: <Video className="w-4 h-4" />, label: "Content (Podcast/QA)" },
        { href: "/dashboard/news", icon: <FileText className="w-4 h-4" />, label: "News Management" },
        { href: "/dashboard/ads", icon: <LayoutDashboard className="w-4 h-4" />, label: "Ads Management" },
        { href: "/dashboard/analytics", icon: <MousePointerClick className="w-4 h-4" />, label: "Engagement Hub" },
        { href: "/dashboard/reviews", icon: <Star className="w-4 h-4" />, label: "Give & Manage Reviews" },
        { href: "/dashboard/inbox", icon: <Inbox className="w-4 h-4" />, label: "Support Inbox" },
        { href: "/dashboard/users", icon: <Users className="w-4 h-4" />, label: "Manage Users" },
        { href: "/dashboard/settings", icon: <Settings className="w-4 h-4" />, label: "Settings" },
    ];

    const epcLinks = [
        { href: "/dashboard/epc", icon: <Briefcase className="w-4 h-4" />, label: "My EPC Profile" },
        { href: "/dashboard/inquiries", icon: <Inbox className="w-4 h-4" />, label: "My Inquiries" },
        { href: "/dashboard/support", icon: <HeadphonesIcon className="w-4 h-4" />, label: "Contact Support" },
        { href: "/dashboard/settings", icon: <Settings className="w-4 h-4" />, label: "Settings" },
    ];

    const brandLinks = [
        { href: "/dashboard/brand", icon: <Building2 className="w-4 h-4" />, label: "My Brand Profile" },
        { href: "/dashboard/inquiries", icon: <Inbox className="w-4 h-4" />, label: "My Inquiries" },
        { href: "/dashboard/support", icon: <HeadphonesIcon className="w-4 h-4" />, label: "Contact Support" },
        { href: "/dashboard/settings", icon: <Settings className="w-4 h-4" />, label: "Settings" },
    ];

    const writerLinks = [
        { href: "/dashboard", icon: <LayoutDashboard className="w-4 h-4" />, label: "Writer Overview" },
        { href: "/dashboard/writer", icon: <User className="w-4 h-4" />, label: "My Author Profile" },
        { href: "/dashboard/writer/articles", icon: <FileText className="w-4 h-4" />, label: "My Articles" },
        { href: "/dashboard/support", icon: <HeadphonesIcon className="w-4 h-4" />, label: "Contact Support" },
        { href: "/dashboard/settings", icon: <Settings className="w-4 h-4" />, label: "Settings" },
    ];

    const links = role === 'super-admin' || role === 'admin'
        ? adminLinks
        : role === 'brand'
            ? brandLinks
            : role === 'writer'
                ? writerLinks
                : role === 'epc'
                    ? epcLinks
                    : [];

    return (
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
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
            className={`group relative flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 ${active
                ? "bg-navy-deep text-white shadow-xs font-semibold"
                : "text-slate-custom hover:bg-paper hover:text-navy-deep"
                }`}
        >
            {active && (
                <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-amber rounded-r-full" />
            )}
            <span className={`transition-transform duration-150 group-hover:scale-110 ${active ? "text-amber" : "text-slate-400 group-hover:text-navy-deep"}`}>
                {icon}
            </span>
            <span className="truncate">{label}</span>
        </Link>
    );
}

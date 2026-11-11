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
    UserCheck,
    Megaphone,
    Activity
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
        { href: "/dashboard/ads", icon: <Megaphone className="w-4 h-4" />, label: "Ads Management" },
        { href: "/dashboard/analytics", icon: <Activity className="w-4 h-4" />, label: "Engagement Hub" },
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

function SidebarLink({ href, icon, label, active = false }: { href: string; icon: React.ReactNode; label: string; active?: boolean }) {
    return (
        <Link
            href={href as any}
            className={`group relative flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 select-none ${
                active
                    ? "bg-navy-deep text-white shadow-md shadow-navy-deep/10 font-semibold"
                    : "text-slate-600 hover:bg-amber-500/10 hover:text-navy-deep hover:translate-x-0.5"
            }`}
        >
            {/* Sliding vertical amber indicator pill */}
            {active && (
                <span className="absolute left-0 top-2 bottom-2 w-1.5 bg-amber rounded-r-full shadow-xs" />
            )}
            <span className={`transition-all duration-200 group-hover:scale-110 shrink-0 ${active ? "text-amber" : "text-slate-400 group-hover:text-amber"}`}>
                {icon}
            </span>
            <span className="truncate">{label}</span>
        </Link>
    );
}

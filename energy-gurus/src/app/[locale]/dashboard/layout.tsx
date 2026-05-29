import { Link } from "@/i18n/routing";
import { ArrowLeft, Mic } from "lucide-react";
import { getUserRole } from "@/lib/roles";
import Sidebar from "./Sidebar";
import { getCurrentUser } from "@/lib/user";
import { UserNav } from "@/components/layout/user-nav";
import { InvitationCheck } from "@/components/dashboard/invitation-check";
import { SecurityGuard } from "@/components/auth/security-guard";
import { MobileDashboardNav } from "@/components/dashboard/mobile-nav";

import { CommandPalette } from "@/components/dashboard/command-palette";
import { NotificationBell } from "@/components/dashboard/notification-bell";

export default async function DashboardLayout({
    children,
    params
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const role = await getUserRole();
    const user = await getCurrentUser();
    const email = user?.emailAddresses[0]?.emailAddress;

    return (
        <div className="dashboard-layout">
            <CommandPalette role={role} />
            {/* Mobile Nav — only visible below 1024px */}
            <div className="mobile-nav-wrapper">
                <MobileDashboardNav role={role} />
            </div>

            {/* Desktop Sidebar — only visible at 1024px+ */}
            <aside className="desktop-sidebar">
                <div className="h-16 flex items-center px-6 border-b">
                    <Link href="/" className="flex items-center space-x-2">
                        <div className="bg-primary p-1 rounded-lg">
                            <Mic className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-lg font-bold text-primary">EnergyGurus</span>
                    </Link>
                </div>

                <Sidebar role={role} />

                <div className="p-4 border-t space-y-4">
                    <Link
                        href="/"
                        className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to Site</span>
                    </Link>
                    <div className="flex flex-col gap-3">
                        <span className="text-xs font-medium uppercase text-muted-foreground px-1">Account</span>
                        <div className="flex items-center gap-3 px-1">
                            <NotificationBell />
                            <UserNav />
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="dashboard-main">
                <SecurityGuard locale={locale} />
                {user && email && <InvitationCheck userId={user.id} email={email} />}
                {children}
            </main>

            <style>{`
                .dashboard-layout {
                    display: flex;
                    flex-direction: column;
                    height: 100vh;
                    background: hsl(var(--secondary) / 0.1);
                    overflow: hidden;
                }
                .mobile-nav-wrapper {
                    display: block;
                }
                .desktop-sidebar {
                    display: none;
                    width: 256px;
                    border-right: 1px solid hsl(var(--border));
                    background: hsl(var(--card));
                    flex-direction: column;
                    flex-shrink: 0;
                }
                .dashboard-main {
                    flex: 1;
                    overflow-y: auto;
                    overflow-x: hidden;
                }
                @media (min-width: 1024px) {
                    .dashboard-layout {
                        flex-direction: row;
                    }
                    .mobile-nav-wrapper {
                        display: none;
                    }
                    .desktop-sidebar {
                        display: flex;
                    }
                }
            `}</style>
        </div>
    );
}

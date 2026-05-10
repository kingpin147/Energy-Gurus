import { Link } from "@/i18n/routing";
import { ArrowLeft, Mic } from "lucide-react";
import { getUserRole } from "@/lib/roles";
import Sidebar from "./Sidebar";
import { UserButton } from "@clerk/nextjs";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const role = await getUserRole();

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

                <Sidebar role={role} />

                <div className="p-4 border-t space-y-4">
                    <Link
                        href="/"
                        className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to Site</span>
                    </Link>
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium uppercase text-muted-foreground">Account</span>
                        <UserButton />
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto overflow-x-hidden">
                {children}
            </main>
        </div>
    );
}

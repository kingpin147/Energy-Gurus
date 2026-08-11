import { Lock, ArrowLeft, Mail } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SignOutButton } from "@clerk/nextjs";

export default function AccessDeniedPage() {
    return (
        <div className="min-h-screen bg-paper/5 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl p-12 text-center space-y-8 border-t-8 border-amber">
                <div className="w-20 h-20 bg-amber/10 text-ink text-amber rounded-3xl flex items-center justify-center mx-auto">
                    <Lock className="w-10 h-10" />
                </div>
                
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Access Restricted</h1>
                    <p className="text-slate-custom leading-relaxed">
                        EnergyGurus is currently a private, invitation-only platform. Your email address is not on our approved list.
                    </p>
                </div>

                <div className="p-6 bg-paper/5 rounded-2xl border border-paper/10 space-y-4">
                    <div className="flex items-center gap-3 text-sm font-bold text-amber">
                        <Mail className="w-4 h-4" />
                        <span>Request Access</span>
                    </div>
                    <p className="text-xs text-slate-custom text-left leading-relaxed">
                        If you believe this is a mistake or would like to partner with us, please contact our administrator at 
                        <span className="block font-bold text-graphite mt-1">energygurusonline@gmail.com</span>
                    </p>
                </div>

                <div className="flex flex-col gap-3">
                    <SignOutButton>
                        <Button className="w-full h-12 rounded-xl font-bold">Sign Out & Return Home</Button>
                    </SignOutButton>
                    <Button variant="ghost" className="w-full h-12 rounded-xl font-bold" asChild>
                        <Link href="/">Back to Public Site</Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}

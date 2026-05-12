"use client";

import { useEffect, use } from "react";
import { useAuth } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { ShieldAlert, ArrowLeft, MailWarning } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";

export default function RejectAccessPage({ params }: { params: Promise<{ locale: string }> }) {
    const { signOut } = useAuth();
    const searchParams = useSearchParams();
    const error = searchParams.get("error") || "not_invited";
    
    // We sign them out in the background so they don't retain an active session 
    // while looking at the rejection page.
    useEffect(() => {
        signOut();
    }, [signOut]);

    let title = "Access Restricted";
    let message = "You are not the part of organization please contact website administrator.";
    
    if (error === "removed") {
        title = "Account Removed";
        message = "You are no longer part of organization.";
    }

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-lg w-full bg-card rounded-[2.5rem] shadow-2xl p-10 md:p-14 text-center space-y-8 relative z-10 border border-border/50">
                <div className="w-24 h-24 bg-red-50 text-red-500 rounded-[2rem] flex items-center justify-center mx-auto shadow-inner">
                    <ShieldAlert className="w-12 h-12" />
                </div>
                
                <div className="space-y-4">
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">{title}</h1>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                        {message}
                    </p>
                </div>

                <div className="p-6 bg-secondary/10 rounded-2xl border border-secondary/20 space-y-3">
                    <div className="flex items-center justify-center gap-2 text-sm font-bold text-foreground">
                        <MailWarning className="w-4 h-4 text-primary" />
                        <span>Need Assistance?</span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        If you believe this is an error, please reach out to our system administrator directly at 
                        <a href="mailto:energygurusonline@gmail.com" className="block font-bold text-primary mt-1 hover:underline">energygurusonline@gmail.com</a>
                    </p>
                </div>

                <div className="pt-4 flex flex-col sm:flex-row gap-4">
                    <Button className="flex-1 h-14 rounded-xl font-bold text-base bg-primary hover:bg-primary/90" asChild>
                        <Link href="/sign-in">Try Different Account</Link>
                    </Button>
                    <Button variant="outline" className="flex-1 h-14 rounded-xl font-bold text-base" asChild>
                        <Link href="/">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Public Site
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}

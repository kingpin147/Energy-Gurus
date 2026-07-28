"use client";

import { useEffect, useState } from "react";
import { checkAndApplyInvitation } from "@/lib/actions/invitations";
import { PartyPopper, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function InvitationCheck({ userId, email }: { userId: string, email: string }) {
    const [role, setRole] = useState<string | null>(null);
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        // Check for invitation only once per session or on mount
        const hasChecked = sessionStorage.getItem("invitationChecked");
        if (!hasChecked) {
            checkAndApplyInvitation(userId, email).then((newRole) => {
                if (newRole) {
                    setRole(newRole);
                    // Refresh the page or update session to reflect new role
                    // For now, we just show the message
                }
                sessionStorage.setItem("invitationChecked", "true");
            });
        }
    }, [userId, email]);

    if (!role || dismissed) return null;

    return (
        <div className="fixed bottom-8 right-8 z-50 animate-in slide-in-from-bottom-10 duration-500">
            <div className="bg-amber text-ink text-ink p-8 rounded-[2.5rem] shadow-2xl shadow-primary/20 max-w-md relative border-4 border-white/10">
                <button 
                    onClick={() => setDismissed(true)}
                    className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
                
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-paper text-ink rounded-2xl flex items-center justify-center">
                        <PartyPopper className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold">Welcome, Guru!</h3>
                </div>
                
                <p className="text-sm opacity-90 leading-relaxed mb-6">
                    An administrator has pre-assigned you the <span className="font-black uppercase tracking-widest text-amber">[{role}]</span> role. 
                    Your dashboard is now fully unlocked.
                </p>
                
                <Button 
                    className="w-full bg-white text-amber font-bold rounded-xl"
                    onClick={() => window.location.reload()}
                >
                    Refresh Dashboard
                </Button>
            </div>
        </div>
    );
}

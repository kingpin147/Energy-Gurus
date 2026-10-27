"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Trash2, Send, Loader2, RefreshCw } from "lucide-react";

import { deleteInvitation, resendInvitation, syncPendingInvitations } from "@/lib/actions/invitations";
import { toast } from "sonner";
import { UserRole } from "@/db/schema";

interface Invitation {
    id: string;
    email: string;
    role: UserRole;
}

export function PendingInvitations({ initialInvites }: { initialInvites: Invitation[] }) {
    const [isPending, startTransition] = useTransition();
    const [isSyncing, startSync] = useTransition();

    const handleSync = () => {
        startSync(async () => {
            try {
                const res = await syncPendingInvitations();
                if (res.removedCount > 0) {
                    toast.success(`Cleaned! Removed ${res.removedCount} activated user${res.removedCount > 1 ? 's' : ''} who already logged in.`);
                } else {
                    toast.info("All pending invitations are checked and up to date.");
                }
            } catch (error: any) {
                toast.error(error.message || "Failed to sync pending invitations");
            }
        });
    };

    const handleDelete = async (id: string, email: string) => {
        if (!confirm(`Are you sure you want to delete the invitation for ${email}?`)) return;

        startTransition(async () => {
            try {
                await deleteInvitation(id);
                toast.success("Invitation deleted");
            } catch (error: any) {
                toast.error(error.message || "Failed to delete invitation");
            }
        });
    };

    const handleResend = async (email: string, role: UserRole) => {
        startTransition(async () => {
            try {
                const result = await resendInvitation(email, role);
                if (result?.emailSent) {
                    toast.success(`Invitation resent to ${email}`);
                } else {
                    toast.warning(`Invitation updated, but email failed to send.`);
                }
            } catch (error: any) {
                toast.error(error.message || "Failed to resend invitation");
            }
        });
    };

    if (initialInvites.length === 0) return null;

    return (
        <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
            <CardHeader className="bg-orange-500/10 p-6">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-xl flex items-center gap-2 text-orange-600">
                        <Clock className="w-5 h-5" />
                        Pending Invitations
                        <span className="text-xs bg-orange-200/60 text-orange-800 px-2.5 py-0.5 rounded-full font-bold ml-2">
                            {initialInvites.length}
                        </span>
                    </CardTitle>
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={isSyncing || isPending}
                        onClick={handleSync}
                        className="rounded-xl border-orange-200 text-orange-700 hover:bg-orange-100/50 text-xs font-bold gap-1.5 h-8 px-3"
                        title="Check if any invited user has already logged in with code/password and remove them"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
                        {isSyncing ? "Checking..." : "Check & Clean"}
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[600px]">
                        <thead>
                            <tr className="bg-paper/5 border-b">
                                <th className="p-6 text-xs font-bold uppercase tracking-widest opacity-60">Email</th>
                                <th className="p-6 text-xs font-bold uppercase tracking-widest opacity-60">Pre-assigned Role</th>
                                <th className="p-6 text-xs font-bold uppercase tracking-widest opacity-60 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {initialInvites.map((invite) => (
                                <tr key={invite.id} className="border-b">
                                    <td className="p-6 font-medium">{invite.email}</td>
                                    <td className="p-6">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                                            invite.role === 'writer' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                            invite.role === 'brand' ? 'bg-amber/15 text-amber-900 border-amber/30' :
                                            invite.role === 'admin' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                            'bg-green-50 text-green-700 border-green-200'
                                        }`}>
                                            {invite.role}
                                        </span>
                                    </td>
                                    <td className="p-6 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                disabled={isPending}
                                                onClick={() => handleResend(invite.email, invite.role)}
                                                className="h-9 px-3 rounded-xl gap-2 font-bold text-orange-600 hover:bg-orange-50"
                                            >
                                                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                                Resend
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                disabled={isPending}
                                                onClick={() => handleDelete(invite.id, invite.email)}
                                                className="h-9 w-9 p-0 text-red-500 rounded-xl hover:bg-red-50"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
}

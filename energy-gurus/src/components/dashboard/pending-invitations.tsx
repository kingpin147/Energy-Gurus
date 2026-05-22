"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Trash2, Send, Loader2 } from "lucide-react";

import { deleteInvitation, resendInvitation } from "@/lib/actions/invitations"; // I'll need to create these
import { toast } from "sonner";
import { UserRole } from "@/db/schema";

interface Invitation {
    id: string;
    email: string;
    role: UserRole;
}

export function PendingInvitations({ initialInvites }: { initialInvites: Invitation[] }) {
    const [isPending, startTransition] = useTransition();

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
                <CardTitle className="text-xl flex items-center gap-2 text-orange-600">
                    <Clock className="w-5 h-5" />
                    Pending Invitations
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[600px]">
                        <thead>
                            <tr className="bg-secondary/5 border-b">
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
                                        <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-secondary text-muted-foreground border">
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

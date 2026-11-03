"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MailPlus, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { createInvitation } from "@/lib/actions/invitations";
import { toast } from "sonner";

export function SingleInvite() {
    const [isPending, startTransition] = useTransition();
    const [statusMessage, setStatusMessage] = useState<{ type: "success" | "warning" | "error"; text: string } | null>(null);
    const [email, setEmail] = useState("");
    const [role, setRole] = useState<"epc" | "brand" | "writer" | "admin">("epc");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setStatusMessage(null);

        if (!email.trim()) {
            const msg = "Please enter an email address.";
            setStatusMessage({ type: "error", text: msg });
            toast.error(msg);
            return;
        }

        startTransition(async () => {
            try {
                const result = await createInvitation(email.trim(), role);
                if (result?.success) {
                    if (result?.emailSent) {
                        const msg = `Invitation sent to ${email}`;
                        setStatusMessage({ type: "success", text: msg });
                        toast.success(msg);
                    } else {
                        const msg = `Invitation created, but email failed to send. Please check your email configuration.`;
                        setStatusMessage({ type: "warning", text: msg });
                        toast.warning(msg);
                    }
                    setEmail("");
                } else {
                    const msg = result?.message || "Failed to create invitation";
                    setStatusMessage({ type: "error", text: msg });
                    toast.error(msg);
                }
            } catch (error: any) {
                const msg = error.message || "Failed to create invitation";
                setStatusMessage({ type: "error", text: msg });
                toast.error(msg);
            }
        });
    }

    const roleButtonClass = (isActive: boolean) =>
        `p-3 border rounded-xl text-sm font-bold text-center transition-all cursor-pointer select-none ${
            isActive
                ? "bg-amber text-ink border-amber shadow-sm"
                : "bg-white text-ink border-line hover:border-amber hover:bg-amber/10 hover:text-ink"
        }`;

    return (
        <Card className="border-none shadow-sm rounded-3xl h-fit">
            <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                    <MailPlus className="w-5 h-5 text-amber" />
                    Invite User
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest opacity-60">Email Address</label>
                        <input
                            name="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="user@example.com"
                            className="w-full border rounded-xl p-3 bg-paper/5 focus:ring-2 focus:ring-primary outline-none text-ink"
                            required
                            disabled={isPending}
                        />
                    </div>
                    <div className="space-y-3">
                        <label className="text-xs font-bold uppercase tracking-widest opacity-60">Assign Role</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            <button
                                type="button"
                                disabled={isPending}
                                onClick={() => setRole("epc")}
                                className={roleButtonClass(role === "epc")}
                            >
                                EPC Installer
                            </button>
                            <button
                                type="button"
                                disabled={isPending}
                                onClick={() => setRole("brand")}
                                className={roleButtonClass(role === "brand")}
                            >
                                Solar Brand
                            </button>
                            <button
                                type="button"
                                disabled={isPending}
                                onClick={() => setRole("writer")}
                                className={roleButtonClass(role === "writer")}
                            >
                                Article Writer
                            </button>
                            <button
                                type="button"
                                disabled={isPending}
                                onClick={() => setRole("admin")}
                                className={roleButtonClass(role === "admin")}
                            >
                                Admin
                            </button>
                        </div>
                    </div>

                    <Button 
                        type="submit" 
                        disabled={isPending} 
                        className="w-full rounded-xl font-bold h-12 gap-2 shadow-lg shadow-amber/20 bg-amber text-ink hover:bg-amber/90 hover:text-ink cursor-pointer"
                    >
                        {isPending ? <Loader2 className="w-4 h-4 animate-spin text-ink" /> : <MailPlus className="w-4 h-4 text-ink" />}
                        Send Invite / Assign
                    </Button>

                    {/* Inline Clear Error / Feedback Box Below Submit Button */}
                    {statusMessage?.type === "error" && (
                        <div className="flex items-start gap-3 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 animate-in fade-in slide-in-from-top-1 text-xs">
                            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                            <div className="space-y-0.5">
                                <p className="font-bold text-red-800">Action Failed</p>
                                <p className="text-red-700">{statusMessage.text}</p>
                            </div>
                        </div>
                    )}

                    {statusMessage?.type === "warning" && (
                        <div className="flex items-start gap-3 p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 animate-in fade-in slide-in-from-top-1 text-xs">
                            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                            <div>
                                <p className="font-bold">Notice</p>
                                <p>{statusMessage.text}</p>
                            </div>
                        </div>
                    )}

                    {statusMessage?.type === "success" && (
                        <div className="flex items-center gap-2.5 p-3.5 bg-green-50 border border-green-200 rounded-xl text-green-700 animate-in fade-in slide-in-from-top-1 text-xs font-semibold">
                            <CheckCircle2 className="w-4 h-4 shrink-0 text-green-600" />
                            <p>{statusMessage.text}</p>
                        </div>
                    )}
                </form>
            </CardContent>
        </Card>
    );
}

"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MailPlus, Loader2 } from "lucide-react";
import { createInvitation } from "@/lib/actions/invitations";
import { toast } from "sonner"; // Assuming sonner is used based on common shadcn patterns or similar. If not I'll adjust.

export function SingleInvite() {
    const [isPending, startTransition] = useTransition();

    async function handleSubmit(formData: FormData) {
        const email = formData.get("email") as string;
        const role = formData.get("role") as any;

        startTransition(async () => {
            try {
                const result = await createInvitation(email, role);
                if (result?.emailSent) {
                    toast.success(`Invitation sent to ${email}`);
                } else {
                    toast.warning(`Invitation created, but email failed to send. Please check your Brevo configuration.`);
                }
                // Clear form? Usually action does it if using form reset, or we can handle it.
            } catch (error: any) {
                toast.error(error.message || "Failed to create invitation");
            }
        });
    }

    return (
        <Card className="border-none shadow-sm rounded-3xl h-fit">
            <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                    <MailPlus className="w-5 h-5 text-amber" />
                    Invite User
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form action={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest opacity-60">Email Address</label>
                        <input
                            name="email"
                            type="email"
                            placeholder="user@example.com"
                            className="w-full border rounded-xl p-3 bg-paper/5 focus:ring-2 focus:ring-primary outline-none"
                            required
                            disabled={isPending}
                        />
                    </div>
                    <div className="space-y-3">
                        <label className="text-xs font-bold uppercase tracking-widest opacity-60">Assign Role</label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                            <label className="cursor-pointer">
                                <input type="radio" name="role" value="epc" className="peer sr-only" defaultChecked disabled={isPending} />
                                <div className="p-3 border rounded-xl text-sm font-bold text-center peer-checked:bg-amber text-ink peer-checked:text-white peer-checked:border-amber hover:bg-paper transition-colors">
                                    EPC Installer
                                </div>
                            </label>
                            <label className="cursor-pointer">
                                <input type="radio" name="role" value="brand" className="peer sr-only" disabled={isPending} />
                                <div className="p-3 border rounded-xl text-sm font-bold text-center peer-checked:bg-amber text-ink peer-checked:text-white peer-checked:border-amber hover:bg-paper transition-colors">
                                    Solar Brand
                                </div>
                            </label>
                            <label className="cursor-pointer">
                                <input type="radio" name="role" value="admin" className="peer sr-only" disabled={isPending} />
                                <div className="p-3 border rounded-xl text-sm font-bold text-center peer-checked:bg-amber text-ink peer-checked:text-white peer-checked:border-amber hover:bg-paper transition-colors">
                                    Admin
                                </div>
                            </label>
                        </div>
                    </div>
                    <Button type="submit" disabled={isPending} className="w-full rounded-xl font-bold h-12 gap-2 shadow-lg shadow-primary/20">
                        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <MailPlus className="w-4 h-4" />}
                        Send Invite / Assign
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}

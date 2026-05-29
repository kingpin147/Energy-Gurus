"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CardContent } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

import { sendSupportMessage } from "@/lib/actions/inquiry";
import { toast } from "sonner";

export function AuditRequestForm() {
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        email: "",
        address: "",
        goal: "Reduce Monthly Bills"
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("loading");

        try {
            const fData = new FormData();
            fData.append("guestName", formData.name);
            fData.append("guestPhone", formData.phone);
            fData.append("guestEmail", formData.email);
            fData.append("subject", "New Audit Request");
            fData.append("message", `Audit Request Details:\nGoal: ${formData.goal}\nAddress: ${formData.address}`);

            const result = await sendSupportMessage(fData);

            if (result.success) {
                setStatus("success");
                toast.success("Audit request submitted successfully!");
            } else {
                setStatus("error");
                toast.error(result.message || "Failed to submit request");
            }
        } catch (error) {
            console.error(error);
            setStatus("error");
            toast.error("An unexpected error occurred");
        }
    };

    if (status === "success") {
        return (
            <CardContent className="p-8 flex flex-col items-center text-center space-y-4 animate-in fade-in zoom-in duration-300">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                    <CheckCircle2 className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-2xl font-bold">Request Received!</h3>
                <p className="text-muted-foreground">
                    Thank you, <span className="text-foreground font-semibold">{formData.name}</span>.
                    Our certified auditors will review your details for <span className="italic">{formData.address}</span>
                    and contact you at <span className="text-foreground font-semibold">{formData.phone}</span> within 24 hours.
                </p>
                <Button variant="outline" onClick={() => setStatus("idle")} className="mt-4">
                    Send Another Request
                </Button>
            </CardContent>
        );
    }

    return (
        <CardContent className="p-8 space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Full Name</label>
                        <Input
                            placeholder="John Doe"
                            required
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            disabled={status === "loading"}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Phone Number</label>
                        <Input
                            placeholder="+92 3XX XXXXXXX"
                            required
                            value={formData.phone}
                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            disabled={status === "loading"}
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Email Address</label>
                    <Input
                        type="email"
                        placeholder="john@example.com"
                        required
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        disabled={status === "loading"}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Site Address</label>
                    <Input
                        placeholder="Plot #, Street, City"
                        required
                        value={formData.address}
                        onChange={e => setFormData({ ...formData, address: e.target.value })}
                        disabled={status === "loading"}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Energy Goal</label>
                    <select
                        className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={formData.goal}
                        onChange={e => setFormData({ ...formData, goal: e.target.value })}
                        disabled={status === "loading"}
                    >
                        <option>Reduce Monthly Bills</option>
                        <option>Solar Feasibility</option>
                        <option>Power Backup/UPS Audit</option>
                        <option>Commercial Efficiency</option>
                    </select>
                </div>
                <Button
                    className="w-full font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
                    size="lg"
                    type="submit"
                    disabled={status === "loading"}
                >
                    {status === "loading" ? "Submitting..." : "Submit Audit Request"}
                </Button>
            </form>
        </CardContent>
    );
}

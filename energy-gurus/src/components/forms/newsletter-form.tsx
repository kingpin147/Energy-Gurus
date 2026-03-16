"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, CheckCircle2 } from "lucide-react";

export function NewsletterForm({ variant = "default" }: { variant?: "default" | "minimal" }) {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setStatus("loading");
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setStatus("success");
        setEmail("");

        // Reset success state after 5 seconds
        setTimeout(() => setStatus("idle"), 5000);
    };

    if (status === "success") {
        return (
            <div className="flex items-center gap-2 text-primary animate-in fade-in slide-in-from-bottom-2">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-medium text-sm">Successfully subscribed!</span>
            </div>
        );
    }

    if (variant === "minimal") {
        return (
            <form onSubmit={handleSubmit} className="flex space-x-2">
                <Input
                    type="email"
                    placeholder="Email address"
                    className="max-w-[200px] h-9"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={status === "loading"}
                />
                <Button size="sm" type="submit" disabled={status === "loading"}>
                    <Mail className="h-4 w-4 mr-2" /> {status === "loading" ? "..." : "Join"}
                </Button>
            </form>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto w-full">
            <Input
                placeholder="Enter your email address"
                className="h-12 text-lg px-6 rounded-full"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={status === "loading"}
            />
            <Button
                size="lg"
                type="submit"
                className="rounded-full h-12 px-10 font-bold bg-primary text-primary-foreground transition-all hover:scale-105 active:scale-95"
                disabled={status === "loading"}
            >
                {status === "loading" ? "Subscribing..." : "Subscribe Now"}
            </Button>
        </form>
    );
}
